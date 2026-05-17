'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { getCartSummary, getOrCreateCart } from '@/lib/commerce/cart';

export type CouponActionState = { ok?: boolean; error?: string; warning?: string };

/**
 * Aplica un cupón al cart usando la junction shop.cart_coupons (stacking).
 * Mantiene shop.carts.coupon_code seteado al "principal" (primero aplicado) para
 * retro-compat con código que aún lee ese campo.
 */
export async function applyCouponToCart(code: string): Promise<CouponActionState> {
  const cleaned = code.trim().toUpperCase();
  if (!/^[A-Z0-9_-]{3,40}$/.test(cleaned)) return { error: 'Formato de cupón inválido.' };

  const { id: cartId } = await getOrCreateCart();
  const admin = createSupabaseAdminClient();

  // Verificar existencia + actividad básica antes de meterlo en la junction.
  const { data: coupon } = await admin
    .schema('shop')
    .from('coupons')
    .select('code, is_active, kind, stackable, valid_from, valid_to, max_uses, used')
    .eq('code', cleaned)
    .maybeSingle();
  if (!coupon || !coupon.is_active) return { error: 'Cupón inválido.' };

  // Si ya hay un cupón no-stackable y éste tampoco es stackable → rechazar.
  const { data: existing } = await admin
    .schema('shop')
    .from('cart_coupons')
    .select('code, coupons:code(stackable, kind)')
    .eq('cart_id', cartId);

  const hasNonStackable = (existing ?? []).some(
    (e: { coupons: { stackable: boolean; kind: string } | null }) =>
      e.coupons?.stackable === false && e.coupons.kind !== 'free_shipping',
  );
  const isNonStackable = !coupon.stackable && coupon.kind !== 'free_shipping';
  if (hasNonStackable && isNonStackable) {
    return { error: 'Ya tenés un cupón exclusivo aplicado. Quitalo antes de sumar otro.' };
  }

  const { error: insErr } = await admin
    .schema('shop')
    .from('cart_coupons')
    .upsert({ cart_id: cartId, code: cleaned }, { onConflict: 'cart_id,code' });
  if (insErr) return { error: 'No pudimos aplicar el cupón.' };

  // Setear principal en carts.coupon_code si no hay uno aún (compat).
  await admin
    .from('carts')
    .update({ coupon_code: cleaned })
    .eq('id', cartId)
    .is('coupon_code', null);

  // Re-resolver y devolver feedback.
  const summary = await getCartSummary();
  if (summary.discountCents === 0 && !summary.freeShipping) {
    return { ok: true, warning: 'Cupón aceptado pero no aplica al carrito actual.' };
  }

  revalidatePath('/carrito');
  return { ok: true };
}

export async function removeCouponFromCart(code: string): Promise<CouponActionState> {
  const cleaned = code.trim().toUpperCase();
  const cart = await getCartSummary();
  if (!cart.id) return { error: 'Carrito vacío.' };
  const admin = createSupabaseAdminClient();
  await admin
    .schema('shop')
    .from('cart_coupons')
    .delete()
    .eq('cart_id', cart.id)
    .eq('code', cleaned);
  // Si era el principal, limpiar shop.carts.coupon_code.
  await admin
    .from('carts')
    .update({ coupon_code: null })
    .eq('id', cart.id)
    .eq('coupon_code', cleaned);
  revalidatePath('/carrito');
  return { ok: true };
}

export async function clearCartCoupons(): Promise<CouponActionState> {
  const cart = await getCartSummary();
  if (!cart.id) return { error: 'Carrito vacío.' };
  const admin = createSupabaseAdminClient();
  await admin.schema('shop').from('cart_coupons').delete().eq('cart_id', cart.id);
  await admin.from('carts').update({ coupon_code: null }).eq('id', cart.id);
  revalidatePath('/carrito');
  return { ok: true };
}
