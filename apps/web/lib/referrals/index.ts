'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { requireUser, requireStaff } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { log } from '@/lib/observability/logger';

export const REFERRAL_COOKIE = 'ay_ref';
const COOKIE_DAYS = 30;

const codeSchema = z.object({
  code: z.string().min(3).max(32).regex(/^[A-Z0-9_-]+$/),
  commission_pct: z.coerce.number().min(0).max(100).default(10),
  discount_pct: z.coerce.number().min(0).max(100).default(0),
  max_uses: z.coerce.number().int().positive().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  is_active: z.boolean().default(true),
});

export type ReferralCodeInput = z.infer<typeof codeSchema>;

export interface ReferralCode {
  id: string;
  code: string;
  commission_pct: number;
  discount_pct: number;
  max_uses: number | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
}

export interface ReferralSummary extends ReferralCode {
  conversions: number;
  pending_cents: number;
  paid_cents: number;
  gross_cents: number;
}

// ---------- Owner-side ----------

export async function getMyReferralCodes(): Promise<ReferralSummary[]> {
  const user = await requireUser();
  const admin = createSupabaseAdminClient();

  const { data: codes } = await admin
    .from('referral_codes')
    .select('id, code, commission_pct, discount_pct, max_uses, is_active, notes, created_at')
    .eq('owner_user_id', user.id)
    .order('created_at', { ascending: false });

  const ids = (codes ?? []).map((c) => (c as { id: string }).id);
  let summary: Record<string, { conversions: number; pending_cents: number; paid_cents: number; gross_cents: number }> = {};
  if (ids.length > 0) {
    const { data: rows } = await admin
      .from('referral_summary')
      .select('code_id, conversions, pending_cents, paid_cents, gross_cents')
      .in('code_id', ids);
    summary = Object.fromEntries(
      ((rows ?? []) as Array<Record<string, unknown>>).map((r) => [
        r.code_id as string,
        {
          conversions: (r.conversions as number) ?? 0,
          pending_cents: (r.pending_cents as number) ?? 0,
          paid_cents: (r.paid_cents as number) ?? 0,
          gross_cents: (r.gross_cents as number) ?? 0,
        },
      ]),
    );
  }

  return (codes ?? []).map((c) => {
    const r = c as Record<string, unknown>;
    const s = summary[r.id as string] ?? { conversions: 0, pending_cents: 0, paid_cents: 0, gross_cents: 0 };
    return {
      id: r.id as string,
      code: r.code as string,
      commission_pct: Number(r.commission_pct),
      discount_pct: Number(r.discount_pct),
      max_uses: (r.max_uses as number | null) ?? null,
      is_active: (r.is_active as boolean) ?? false,
      notes: (r.notes as string | null) ?? null,
      created_at: r.created_at as string,
      ...s,
    };
  });
}

export async function createReferralCode(input: ReferralCodeInput) {
  const user = await requireUser();
  const parsed = codeSchema.parse({ ...input, code: input.code.toUpperCase() });
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from('referral_codes').insert({
    code: parsed.code,
    owner_user_id: user.id,
    commission_pct: parsed.commission_pct,
    discount_pct: parsed.discount_pct,
    max_uses: parsed.max_uses,
    notes: parsed.notes,
    is_active: parsed.is_active,
  });
  if (error) throw new Error(error.message);
  revalidatePath('/cuenta/referidos');
  return { code: parsed.code };
}

export async function toggleReferralCode(id: string, isActive: boolean) {
  const user = await requireUser();
  const admin = createSupabaseAdminClient();
  await admin.from('referral_codes').update({ is_active: isActive }).eq('id', id).eq('owner_user_id', user.id);
  revalidatePath('/cuenta/referidos');
}

// ---------- Attribution flow ----------

/**
 * Resuelve un código (case-insensitive). Devuelve null si no existe o está
 * inactivo o alcanzó max_uses.
 */
export async function resolveReferralCode(rawCode: string) {
  const code = rawCode.trim().toUpperCase();
  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) return null;
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from('referral_codes')
    .select('id, code, owner_user_id, commission_pct, discount_pct, max_uses, is_active')
    .eq('code', code)
    .eq('is_active', true)
    .maybeSingle();
  if (!data) return null;

  if (data.max_uses) {
    const { count } = await admin
      .from('referral_attributions')
      .select('id', { count: 'exact', head: true })
      .eq('code_id', (data as { id: string }).id)
      .in('status', ['confirmed', 'paid']);
    if ((count ?? 0) >= (data.max_uses as number)) return null;
  }

  return data as {
    id: string;
    code: string;
    owner_user_id: string;
    commission_pct: number;
    discount_pct: number;
  };
}

/** Lee la cookie de referido del request actual. */
export async function getReferralCookie(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(REFERRAL_COOKIE)?.value ?? null;
}

/** Setea cookie de referido. Llamada desde middleware o server actions. */
export async function setReferralCookie(code: string) {
  const jar = await cookies();
  jar.set(REFERRAL_COOKIE, code, {
    httpOnly: false, // accesible para tracking client si querés
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: COOKIE_DAYS * 24 * 60 * 60,
    path: '/',
  });
}

/**
 * Crea la atribución cuando una orden pasa a `paid`.
 * Idempotente por unique(order_id).
 */
export async function attributeOrderPaid(params: {
  orderId: string;
  userId: string | null;
  subtotalCents: number;
  currency: string;
  refCode: string | null;
}) {
  if (!params.refCode) return null;
  const admin = createSupabaseAdminClient();
  const resolved = await resolveReferralCode(params.refCode);
  if (!resolved) return null;

  // No auto-referir: si referred_user_id == owner_user_id, descartar.
  if (params.userId && params.userId === resolved.owner_user_id) {
    log.info('referral.self_attribution_blocked', { code: resolved.code, userId: params.userId });
    return null;
  }

  const commissionCents = Math.round((params.subtotalCents * Number(resolved.commission_pct)) / 100);

  const { data, error } = await admin
    .from('referral_attributions')
    .insert({
      code_id: resolved.id,
      code: resolved.code,
      order_id: params.orderId,
      referred_user_id: params.userId,
      subtotal_cents: params.subtotalCents,
      commission_cents: commissionCents,
      currency: params.currency,
      status: 'confirmed',
    })
    .select('id')
    .single();

  if (error) {
    // Probablemente unique violation (ya atribuido). No es un error fatal.
    log.warn('referral.attribution_skipped', { error: error.message, orderId: params.orderId });
    return null;
  }

  log.info('referral.attributed', {
    code: resolved.code,
    orderId: params.orderId,
    commissionCents,
  });
  return data?.id ?? null;
}

// ---------- Admin / payouts ----------

export async function listAllReferrals(filter: 'pending' | 'confirmed' | 'paid' | 'all' = 'confirmed') {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  let q = admin
    .from('referral_attributions')
    .select('id, code, order_id, referred_user_id, subtotal_cents, commission_cents, currency, status, created_at, paid_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (filter !== 'all') q = q.eq('status', filter);
  const { data } = await q;
  return data ?? [];
}

export async function markAttributionPaid(id: string, asWalletCredit = false) {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  const { data: att } = await admin
    .from('referral_attributions')
    .select('id, code_id, commission_cents, currency, status')
    .eq('id', id)
    .single();
  if (!att || att.status === 'paid') return;

  if (asWalletCredit) {
    const { data: code } = await admin
      .from('referral_codes')
      .select('owner_user_id')
      .eq('id', att.code_id)
      .single();
    if (code?.owner_user_id) {
      const { walletTransact } = await import('@/lib/wallet');
      await walletTransact({
        userId: code.owner_user_id as string,
        currency: (att.currency as 'ARS' | 'USD') ?? 'ARS',
        amountCents: att.commission_cents as number,
        source: 'referral_reward',
        refId: id,
        description: 'Comisión por referido acreditada como saldo',
      });
    }
  }

  await admin
    .from('referral_attributions')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', id);
  revalidatePath('/admin/referidos');
}

export async function reverseAttribution(id: string) {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  await admin.from('referral_attributions').update({ status: 'reversed' }).eq('id', id);
  revalidatePath('/admin/referidos');
}
