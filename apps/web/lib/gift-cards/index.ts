'use server';

import 'server-only';
import crypto from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { requireUser, requireStaff, getCurrentUser } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { emitN8nEvent } from '@/lib/integrations/n8n';
import { log } from '@/lib/observability/logger';

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin 0/O/1/I

function generateCode(len = 16): string {
  const bytes = crypto.randomBytes(len);
  let out = '';
  for (let i = 0; i < len; i++) out += CHARSET[bytes[i]! % CHARSET.length];
  return out;
}

export interface GiftCardRecord {
  id: string;
  code: string;
  initial_cents: number;
  balance_cents: number;
  currency: string;
  recipient_email: string | null;
  recipient_name: string | null;
  message: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

/**
 * Emite una gift card asociada a una orden pagada.
 * Idempotente: si ya existe una gift_card con `issued_order_id = orderId`
 * para este product/qty, no la duplica.
 */
export async function issueGiftCardForOrderItem(params: {
  orderId: string;
  issuerUserId: string | null;
  amountCents: number;
  currency: string;
  recipientEmail: string | null;
  recipientName: string | null;
  message: string | null;
  expiresAt?: string | null;
}): Promise<{ code: string; idempotent: boolean }> {
  const admin = createSupabaseAdminClient();

  const { data: existing } = await admin
    .schema('shop').from('gift_cards')
    .select('id, code')
    .eq('issued_order_id', params.orderId)
    .eq('initial_cents', params.amountCents)
    .maybeSingle();
  if (existing) return { code: existing.code as string, idempotent: true };

  // Loop hasta encontrar un code libre (colisión extremadamente improbable).
  let code = '';
  for (let i = 0; i < 5; i++) {
    code = generateCode(16);
    const { data: clash } = await admin
      .schema('shop').from('gift_cards')
      .select('id')
      .eq('code', code)
      .maybeSingle();
    if (!clash) break;
    code = '';
  }
  if (!code) throw new Error('No pudimos generar un código único.');

  const { error } = await admin.schema('shop').from('gift_cards').insert({
    code,
    initial_cents: params.amountCents,
    balance_cents: params.amountCents,
    currency: params.currency,
    issued_by_user_id: params.issuerUserId,
    issued_order_id: params.orderId,
    recipient_email: params.recipientEmail,
    recipient_name: params.recipientName,
    message: params.message,
    expires_at: params.expiresAt ?? null,
  });
  if (error) throw new Error(error.message);

  // Dispara entrega via n8n (email transaccional al destinatario)
  void emitN8nEvent('gift-card-issued', {
    code,
    amount_cents: params.amountCents,
    currency: params.currency,
    recipient_email: params.recipientEmail,
    recipient_name: params.recipientName,
    message: params.message,
    issuer_user_id: params.issuerUserId,
  });

  log.info('gift_card.issued', { code, orderId: params.orderId, amountCents: params.amountCents });
  return { code, idempotent: false };
}

/**
 * Valida un código y devuelve saldo aplicable (no descuenta).
 */
export async function lookupGiftCard(rawCode: string): Promise<
  | { ok: true; code: string; balance_cents: number; currency: string }
  | { ok: false; reason: 'not_found' | 'inactive' | 'expired' | 'empty' }
> {
  const code = rawCode.trim().toUpperCase();
  if (!/^[A-Z0-9]{12,20}$/.test(code)) return { ok: false, reason: 'not_found' };
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .schema('shop').from('gift_cards')
    .select('code, balance_cents, currency, expires_at, is_active')
    .eq('code', code)
    .maybeSingle();
  if (!data) return { ok: false, reason: 'not_found' };
  if (!data.is_active) return { ok: false, reason: 'inactive' };
  if (data.expires_at && new Date(data.expires_at as string).getTime() < Date.now()) {
    return { ok: false, reason: 'expired' };
  }
  if ((data.balance_cents as number) <= 0) return { ok: false, reason: 'empty' };
  return {
    ok: true,
    code: data.code as string,
    balance_cents: data.balance_cents as number,
    currency: data.currency as string,
  };
}

/**
 * Aplica una gift card al carrito del usuario actual. Se canjea efectivamente
 * en `consumeCartGiftCard` al pagarse la orden.
 */
export async function applyGiftCardToCart(code: string): Promise<{ ok: boolean; reason?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, reason: 'login_required' };
  const lookup = await lookupGiftCard(code);
  if (!lookup.ok) return { ok: false, reason: lookup.reason };
  const admin = createSupabaseAdminClient();
  await admin.schema('shop').from('carts').update({ gift_card_code: lookup.code }).eq('user_id', user.id);
  revalidatePath('/carrito');
  revalidatePath('/checkout');
  return { ok: true };
}

export async function removeGiftCardFromCart(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  const admin = createSupabaseAdminClient();
  await admin.schema('shop').from('carts').update({ gift_card_code: null }).eq('user_id', user.id);
  revalidatePath('/carrito');
  revalidatePath('/checkout');
}

/**
 * Consume una gift card sobre una orden pagada. Idempotente:
 * si ya existe redención de esa code+order, no duplica.
 */
export async function consumeGiftCardForOrder(params: {
  orderId: string;
  cartId: string | null;
  code: string;
  amountCents: number;
  userId: string | null;
}): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  const { data: card } = await admin
    .schema('shop').from('gift_cards')
    .select('id, balance_cents, currency, is_active, expires_at')
    .eq('code', params.code.trim().toUpperCase())
    .maybeSingle();
  if (!card) return false;

  // Idempotencia
  const { data: existing } = await admin
    .schema('shop').from('gift_card_redemptions')
    .select('id')
    .eq('gift_card_id', card.id)
    .eq('order_id', params.orderId)
    .maybeSingle();
  if (existing) return true;

  const apply = Math.min(params.amountCents, card.balance_cents as number);
  if (apply <= 0) return false;

  const { error } = await admin.schema('shop').from('gift_card_redemptions').insert({
    gift_card_id: card.id,
    order_id: params.orderId,
    cart_id: params.cartId,
    amount_cents: apply,
    redeemed_by: params.userId,
  });
  if (error) {
    log.error('gift_card.redeem_error', { error: error.message, code: params.code, orderId: params.orderId });
    return false;
  }
  log.info('gift_card.redeemed', { code: params.code, orderId: params.orderId, applied: apply });
  return true;
}

// ---------- Admin ----------

export async function listGiftCardsAdmin(filter: 'active' | 'redeemed' | 'expired' | 'all' = 'active') {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  let q = admin
    .schema('shop').from('gift_cards')
    .select('id, code, initial_cents, balance_cents, currency, recipient_email, recipient_name, expires_at, is_active, created_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (filter === 'active') q = q.eq('is_active', true).gt('balance_cents', 0);
  else if (filter === 'redeemed') q = q.eq('balance_cents', 0);
  else if (filter === 'expired') q = q.lt('expires_at', new Date().toISOString());
  const { data } = await q;
  return (data ?? []) as GiftCardRecord[];
}

export async function toggleGiftCardActive(id: string, isActive: boolean) {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  await admin.schema('shop').from('gift_cards').update({ is_active: isActive }).eq('id', id);
  revalidatePath('/admin/gift-cards');
}

export async function resendGiftCardEmail(id: string) {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  const { data: card } = await admin
    .schema('shop').from('gift_cards')
    .select('code, initial_cents, currency, recipient_email, recipient_name, message')
    .eq('id', id)
    .single();
  if (!card) throw new Error('Gift card no encontrada');
  void emitN8nEvent('gift-card-issued', {
    code: card.code,
    amount_cents: card.initial_cents,
    currency: card.currency,
    recipient_email: card.recipient_email,
    recipient_name: card.recipient_name,
    message: card.message,
    resend: true,
  });
  return { ok: true };
}

export async function getMyGiftCards() {
  const user = await requireUser();
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .schema('shop').from('gift_cards')
    .select('id, code, initial_cents, balance_cents, currency, recipient_email, recipient_name, expires_at, is_active, created_at')
    .eq('issued_by_user_id', user.id)
    .order('created_at', { ascending: false });
  return (data ?? []) as GiftCardRecord[];
}
