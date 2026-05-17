'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { requireUser, requireStaff, getCurrentUser } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { log } from '@/lib/observability/logger';

export type WalletSource =
  | 'manual_adjustment'
  | 'refund_credit'
  | 'referral_reward'
  | 'promo_credit'
  | 'order_payment'
  | 'order_refund'
  | 'gift_card_conversion';

export interface WalletAccount {
  id: string;
  currency: string;
  balance_cents: number;
  is_frozen: boolean;
}

export interface WalletEntry {
  id: string;
  amount_cents: number;
  source: WalletSource;
  ref_id: string | null;
  description: string | null;
  balance_after: number;
  created_at: string;
}

export async function getMyWalletAccounts(): Promise<WalletAccount[]> {
  const user = await requireUser();
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from('wallet_accounts')
    .select('id, currency, balance_cents, is_frozen')
    .eq('user_id', user.id);
  return ((data ?? []) as Array<Record<string, unknown>>).map((a) => ({
    id: a.id as string,
    currency: a.currency as string,
    balance_cents: Number(a.balance_cents),
    is_frozen: (a.is_frozen as boolean) ?? false,
  }));
}

export async function getMyWalletEntries(currency: 'ARS' | 'USD' = 'ARS', limit = 50): Promise<WalletEntry[]> {
  const user = await requireUser();
  const admin = createSupabaseAdminClient();

  const { data: account } = await admin
    .from('wallet_accounts')
    .select('id')
    .eq('user_id', user.id)
    .eq('currency', currency)
    .maybeSingle();
  if (!account) return [];

  const { data } = await admin
    .from('wallet_entries')
    .select('id, amount_cents, source, ref_id, description, balance_after, created_at')
    .eq('account_id', account.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  return ((data ?? []) as Array<Record<string, unknown>>).map((e) => ({
    id: e.id as string,
    amount_cents: Number(e.amount_cents),
    source: e.source as WalletSource,
    ref_id: (e.ref_id as string | null) ?? null,
    description: (e.description as string | null) ?? null,
    balance_after: Number(e.balance_after),
    created_at: e.created_at as string,
  }));
}

/**
 * Mueve saldo de forma atómica vía RPC. amount_cents signed:
 *   - positivo  → crédito
 *   - negativo  → débito (falla si insuficiente)
 */
export async function walletTransact(params: {
  userId: string;
  currency: 'ARS' | 'USD';
  amountCents: number;
  source: WalletSource;
  refId?: string | null;
  description?: string | null;
  createdBy?: string | null;
}): Promise<{ entryId: string; balanceAfter: number }> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.rpc('wallet_transact', {
    p_user: params.userId,
    p_currency: params.currency,
    p_amount_cents: params.amountCents,
    p_source: params.source,
    p_ref: params.refId ?? null,
    p_description: params.description ?? null,
    p_created_by: params.createdBy ?? null,
  });
  if (error) throw new Error(error.message);
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error('wallet_transact_no_result');
  return {
    entryId: (row as { entry_id: string }).entry_id,
    balanceAfter: Number((row as { balance_after: number }).balance_after),
  };
}

// ---------- Admin ----------

export async function listWalletsAdmin(opts: { q?: string } = {}) {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  let q = admin
    .from('wallet_accounts')
    .select('id, user_id, currency, balance_cents, is_frozen, updated_at')
    .order('updated_at', { ascending: false })
    .limit(200);
  if (opts.q) q = q.eq('user_id', opts.q);
  const { data } = await q;
  return (data ?? []) as Array<{
    id: string; user_id: string; currency: string; balance_cents: number; is_frozen: boolean; updated_at: string;
  }>;
}

export async function adminAdjustWallet(params: {
  userId: string;
  currency: 'ARS' | 'USD';
  amountCents: number;
  description: string;
}) {
  const staff = await requireStaff();
  if (!params.description.trim()) throw new Error('Especificá un motivo del ajuste.');
  const res = await walletTransact({
    userId: params.userId,
    currency: params.currency,
    amountCents: params.amountCents,
    source: 'manual_adjustment',
    description: params.description,
    createdBy: staff.id,
  });
  log.info('wallet.adjusted', { userId: params.userId, amountCents: params.amountCents, by: staff.id });
  revalidatePath('/admin/wallets');
  return res;
}

export async function setWalletFrozen(accountId: string, frozen: boolean) {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  await admin.from('wallet_accounts').update({ is_frozen: frozen }).eq('id', accountId);
  revalidatePath('/admin/wallets');
}

// ---------- Use cases ----------

/** Calcula cuánto del total se puede pagar con wallet sin sobregirar. */
export async function getApplicableWalletForCart(currency: 'ARS' | 'USD', totalCents: number): Promise<number> {
  const user = await getCurrentUser();
  if (!user) return 0;
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from('wallet_accounts')
    .select('balance_cents, is_frozen')
    .eq('user_id', user.id)
    .eq('currency', currency)
    .maybeSingle();
  if (!data || data.is_frozen) return 0;
  return Math.min(Number(data.balance_cents), totalCents);
}

/** Activa/desactiva pago con saldo para el carrito vía bandera persistida en cart. */
export async function toggleCartUseWallet(use: boolean) {
  const user = await requireUser();
  const admin = createSupabaseAdminClient();
  await admin.from('carts').update({ use_wallet: use }).eq('user_id', user.id);
  revalidatePath('/carrito');
  revalidatePath('/checkout');
}
