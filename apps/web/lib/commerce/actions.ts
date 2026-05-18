'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { getOrCreateCart, getCartSummary } from './cart';

export type CartActionState = { ok?: boolean; error?: string };

const addSchema = z.object({
  productSlug: z.string().min(1),
  qty: z.coerce.number().int().positive().default(1),
  // Reservas (lodging, consult, immersion):
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  guests: z.coerce.number().int().min(1).max(20).optional(),
});

const RESERVABLE = new Set(['lodging', 'consult', 'immersion']);

export async function addToCart(_: CartActionState, formData: FormData): Promise<CartActionState> {
  const parsed = addSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: 'Datos inválidos.' };

  const admin = createSupabaseAdminClient();
  const { data: product } = await admin
    .schema('shop').from('products')
    .select('id, base_price_cents, currency, is_active, stock, type, attributes')
    .eq('slug', parsed.data.productSlug)
    .eq('is_active', true)
    .single();

  if (!product) return { error: 'Producto no disponible.' };

  // Productos digitales únicos (curso, ebook) — limitar qty=1
  const isDigitalUnique = product.type === 'course' || product.type === 'ebook';
  const qty = isDigitalUnique ? 1 : parsed.data.qty;

  // Stock para físicos
  if (product.type === 'physical' && product.stock !== null && product.stock < qty) {
    return { error: 'Sin stock suficiente.' };
  }

  // Reservas requieren fechas
  let metadata: Record<string, unknown> | undefined;
  let unitPriceCents = product.base_price_cents;
  if (RESERVABLE.has(product.type)) {
    if (!parsed.data.startsAt || !parsed.data.endsAt) {
      return { error: 'Faltan las fechas de la reserva.' };
    }
    const start = new Date(parsed.data.startsAt);
    const end = new Date(parsed.data.endsAt);
    if (!(start < end)) return { error: 'Rango de fechas inválido.' };

    // Para hospedaje: precio = noches × tarifa base
    if (product.type === 'lodging') {
      const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000));
      unitPriceCents = product.base_price_cents * nights;
      metadata = { startsAt: start.toISOString(), endsAt: end.toISOString(), guests: parsed.data.guests ?? 1, nights };
    } else {
      metadata = { startsAt: start.toISOString(), endsAt: end.toISOString(), guests: parsed.data.guests ?? 1 };
    }
  }

  const { id: cartId } = await getOrCreateCart();

  // Para reservables, cada reserva es un ítem distinto → no merge
  const { data: existing } = await admin
    .schema('shop').from('cart_items')
    .select('id, qty')
    .eq('cart_id', cartId)
    .eq('product_id', product.id)
    .is('metadata->startsAt', null)  // sólo merge con ítems sin fecha
    .maybeSingle();

  if (existing && !RESERVABLE.has(product.type)) {
    if (isDigitalUnique) return { error: 'Este producto ya está en tu carrito.' };
    await admin.schema('shop').from('cart_items').update({ qty: existing.qty + qty }).eq('id', existing.id);
  } else {
    await admin.schema('shop').from('cart_items').insert({
      cart_id: cartId,
      product_id: product.id,
      qty,
      unit_price_cents: unitPriceCents,
      metadata: (metadata ?? {}) as never,
    });
  }

  await admin.schema('shop').from('carts').update({ currency: product.currency }).eq('id', cartId);

  revalidatePath('/carrito');
  return { ok: true };
}

export async function updateCartItem(itemId: string, qty: number) {
  if (qty < 1) return removeFromCart(itemId);
  const admin = createSupabaseAdminClient();
  await admin.schema('shop').from('cart_items').update({ qty }).eq('id', itemId);
  revalidatePath('/carrito');
}

export async function removeFromCart(itemId: string) {
  const admin = createSupabaseAdminClient();
  await admin.schema('shop').from('cart_items').delete().eq('id', itemId);
  revalidatePath('/carrito');
}

export async function clearCart() {
  const cart = await getCartSummary();
  if (!cart.id) return;
  const admin = createSupabaseAdminClient();
  await admin.schema('shop').from('cart_items').delete().eq('cart_id', cart.id);
  await admin.schema('shop').from('carts').update({ coupon_code: null }).eq('id', cart.id);
  revalidatePath('/carrito');
}

export async function applyCoupon(code: string): Promise<CartActionState> {
  const cart = await getCartSummary();
  if (!cart.id) return { error: 'Carrito vacío.' };

  const admin = createSupabaseAdminClient();
  const { data: coupon } = await admin
    .schema('shop').from('coupons')
    .select('code, max_uses, used, valid_from, valid_to, is_active')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .maybeSingle();

  if (!coupon) return { error: 'Cupón inválido.' };
  const now = new Date();
  if (coupon.valid_from && new Date(coupon.valid_from) > now) return { error: 'Cupón aún no activo.' };
  if (coupon.valid_to && new Date(coupon.valid_to) < now) return { error: 'Cupón expirado.' };
  if (coupon.max_uses && (coupon.used ?? 0) >= coupon.max_uses) return { error: 'Cupón agotado.' };

  await admin.schema('shop').from('carts').update({ coupon_code: coupon.code }).eq('id', cart.id);
  revalidatePath('/carrito');
  return { ok: true };
}

export async function removeCoupon() {
  const cart = await getCartSummary();
  if (!cart.id) return;
  const admin = createSupabaseAdminClient();
  await admin.schema('shop').from('carts').update({ coupon_code: null }).eq('id', cart.id);
  revalidatePath('/carrito');
}
