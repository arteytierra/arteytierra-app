import 'server-only';
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/db/server';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { resolveCoupons, type AppliedCoupon, type CartLine } from '@/lib/coupons/engine';

const CART_COOKIE = 'ay_cart';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 días

export interface CartItem {
  id: string;
  product_id: string;
  qty: number;
  unit_price_cents: number;
  product: {
    id: string;
    slug: string;
    name: string;
    type: string;
    gallery: unknown;
    currency: string;
    stock: number | null;
  };
}

export interface CartSummary {
  id: string | null;
  items: CartItem[];
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  currency: string;
  /** Cupón principal (retro-compat). Equivale al primero de `appliedCoupons`. */
  couponCode: string | null;
  /** Cupones aplicados (post-motor de stacking). */
  appliedCoupons: AppliedCoupon[];
  /** Cupones rechazados (con razón) — para mostrar feedback al usuario. */
  rejectedCoupons: Array<{ code: string; reason: string }>;
  freeShipping: boolean;
  itemCount: number;
}

/** Asegura cart en DB para usuario logueado o anon (via cookie token). */
export async function getOrCreateCart(): Promise<{ id: string; userId: string | null }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Usuario logueado: usar/crear cart por user_id
  if (user) {
    const { data: existing } = await supabase
      .schema('shop').from('carts')
      .select('id')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existing) return { id: existing.id, userId: user.id };

    const admin = createSupabaseAdminClient();
    const { data: created } = await admin
      .schema('shop').from('carts')
      .insert({ user_id: user.id })
      .select('id')
      .single();
    return { id: created!.id, userId: user.id };
  }

  // Anon: usar token en cookie
  const cookieStore = await cookies();
  const token = cookieStore.get(CART_COOKIE)?.value;
  const admin = createSupabaseAdminClient();

  if (token) {
    const { data: existing } = await admin
      .schema('shop').from('carts')
      .select('id')
      .eq('anon_token', token)
      .maybeSingle();
    if (existing) return { id: existing.id, userId: null };
  }

  const newToken = crypto.randomUUID();
  const { data: created } = await admin
    .schema('shop').from('carts')
    .insert({ anon_token: newToken })
    .select('id')
    .single();

  cookieStore.set(CART_COOKIE, newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });

  return { id: created!.id, userId: null };
}

/** Lee el carrito si existe, sin crear uno nuevo. */
export async function getCartSummary(): Promise<CartSummary> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const cookieStore = await cookies();

  const admin = createSupabaseAdminClient();
  let cartId: string | null = null;

  if (user) {
    const { data } = await admin.schema('shop').from('carts').select('id, coupon_code, currency')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) cartId = data.id;
  } else {
    const token = cookieStore.get(CART_COOKIE)?.value;
    if (token) {
      const { data } = await admin.schema('shop').from('carts').select('id, coupon_code, currency')
        .eq('anon_token', token)
        .maybeSingle();
      if (data) cartId = data.id;
    }
  }

  if (!cartId) {
    return {
      id: null, items: [], subtotalCents: 0, discountCents: 0,
      totalCents: 0, currency: 'ARS', couponCode: null,
      appliedCoupons: [], rejectedCoupons: [], freeShipping: false, itemCount: 0,
    };
  }

  const { data: cart } = await admin
    .schema('shop').from('carts')
    .select('id, currency, coupon_code, cart_items(id, product_id, qty, unit_price_cents, product:products(id, slug, name, type, gallery, currency, stock))')
    .eq('id', cartId)
    .single();

  const items = ((cart?.cart_items ?? []) as never[]) as CartItem[];
  const subtotal = items.reduce((s, it) => s + it.unit_price_cents * it.qty, 0);

  // Junction n:m de cupones (stack). Fallback al campo carts.coupon_code legacy.
  const { data: stack } = await admin
    .schema('shop')
    .from('cart_coupons')
    .select('code')
    .eq('cart_id', cartId);
  const codes = (stack ?? []).map((r: { code: string }) => r.code);
  if (codes.length === 0 && cart?.coupon_code) codes.push(cart.coupon_code);

  // Resolver con motor (BOGO/bundle/stacking).
  const lines: CartLine[] = items.map((it) => ({
    cart_item_id: it.id,
    product_id: it.product.id,
    product_type: it.product.type,
    qty: it.qty,
    unit_price_cents: it.unit_price_cents,
  }));
  const resolution = await resolveCoupons(
    { userId: user?.id ?? null, cartId: cart!.id, lines, currency: cart?.currency ?? 'ARS' },
    codes,
  );

  return {
    id: cart!.id,
    items,
    subtotalCents: subtotal,
    discountCents: resolution.totalDiscountCents,
    totalCents: Math.max(0, subtotal - resolution.totalDiscountCents),
    currency: cart?.currency ?? 'ARS',
    couponCode: resolution.applied[0]?.code ?? null,
    appliedCoupons: resolution.applied,
    rejectedCoupons: resolution.rejected,
    freeShipping: resolution.freeShipping,
    itemCount: items.reduce((s, it) => s + it.qty, 0),
  };
}

/** Fusiona carrito anon con el del usuario tras login. */
export async function mergeAnonCartIntoUser(userId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(CART_COOKIE)?.value;
  if (!token) return;

  const admin = createSupabaseAdminClient();
  const { data: anon } = await admin
    .schema('shop').from('carts')
    .select('id, cart_items(product_id, qty, unit_price_cents, metadata)')
    .eq('anon_token', token)
    .maybeSingle();

  if (!anon || !anon.cart_items?.length) return;

  // Garantizar cart del usuario
  const { data: userCart } = await admin
    .schema('shop').from('carts')
    .upsert({ user_id: userId }, { onConflict: 'user_id', ignoreDuplicates: false })
    .select('id')
    .single();

  // Insertar items (sin duplicar product_id)
  for (const it of anon.cart_items as never as Array<{
    product_id: string; qty: number; unit_price_cents: number; metadata: unknown
  }>) {
    // Insert simple (RPC `cart_upsert_item` no existe en este punto del schema).
    await admin.schema('shop').from('cart_items').insert({
      cart_id: userCart!.id,
      product_id: it.product_id,
      qty: it.qty,
      unit_price_cents: it.unit_price_cents,
    });
  }

  await admin.schema('shop').from('carts').delete().eq('id', anon.id);
  cookieStore.delete(CART_COOKIE);
}
