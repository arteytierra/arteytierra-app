'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireStaff } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';

/**
 * Mapeo a tabla `shop.coupons`:
 *   - kind  ↔ type
 *   - amount ↔ value
 *   - currency / description / min_subtotal_cents agregados en migración 0005
 */

const couponSchema = z.object({
  code: z.string().min(3).max(40).regex(/^[A-Z0-9_-]+$/, 'Sólo A-Z, 0-9, _ y -'),
  name: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  kind: z.enum(['percent', 'fixed', 'bogo', 'bundle', 'free_shipping']),
  amount: z.coerce.number().int().nonnegative().default(0),
  currency: z.enum(['ARS', 'USD']).optional().nullable(),
  min_subtotal_cents: z.coerce.number().int().nonnegative().optional().nullable(),
  max_uses: z.coerce.number().int().positive().optional().nullable(),
  valid_from: z.string().optional().nullable(),
  valid_to: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
  stackable: z.boolean().default(false),
  priority: z.coerce.number().int().nonnegative().default(100),
  conditions: z.record(z.unknown()).default({}),
  config: z.record(z.unknown()).default({}),
});

export type CouponInput = z.infer<typeof couponSchema>;

function toRow(input: CouponInput) {
  const { kind, amount, ...rest } = input;
  // type sigue siendo obligatorio en la tabla original (check percent/fixed).
  // Mapeamos kinds nuevos a 'percent' por compat (la lógica real vive en `kind`).
  const legacyType = kind === 'percent' || kind === 'fixed' ? kind : 'percent';
  return { ...rest, type: legacyType, kind, value: amount };
}

function fromRow(row: Record<string, unknown>) {
  const { type, kind, value, ...rest } = row;
  return {
    ...rest,
    kind: (kind ?? type) as CouponInput['kind'],
    amount: value as number,
  } as CouponInput & { used: number; created_at?: string };
}

export async function listCoupons() {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .schema('shop').from('coupons')
    .select(
      'code, name, description, type, kind, value, currency, min_subtotal_cents, max_uses, used, valid_from, valid_to, is_active, stackable, priority, conditions, config, created_at',
    )
    .order('created_at', { ascending: false });
  return (data ?? []).map((r) => fromRow(r as Record<string, unknown>));
}

export async function upsertCoupon(originalCode: string | null, input: CouponInput) {
  await requireStaff();
  const parsed = couponSchema.parse({ ...input, code: input.code.toUpperCase() });
  const row = toRow(parsed);
  const admin = createSupabaseAdminClient();

  if (originalCode && originalCode !== parsed.code) {
    const { error: insErr } = await admin.schema('shop').from('coupons').insert({ ...row, used: 0 } as never);
    if (insErr) throw new Error(insErr.message);
    await admin.schema('shop').from('coupons').delete().eq('code', originalCode);
  } else if (originalCode) {
    const { error } = await admin.schema('shop').from('coupons').update(row as never).eq('code', originalCode);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await admin.schema('shop').from('coupons').insert({ ...row, used: 0 } as never);
    if (error) throw new Error(error.message);
  }

  revalidatePath('/admin/cupones');
  return { code: parsed.code };
}

export async function deleteCoupon(code: string) {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  await admin.schema('shop').from('coupons').delete().eq('code', code);
  revalidatePath('/admin/cupones');
}

export async function toggleCouponActive(code: string, isActive: boolean) {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  await admin.schema('shop').from('coupons').update({ is_active: isActive }).eq('code', code);
  revalidatePath('/admin/cupones');
}
