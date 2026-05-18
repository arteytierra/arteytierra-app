import 'server-only';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { getCartSummary } from './cart';
import { getCurrentUser } from '@/lib/auth/session';
import { createStripeCheckoutSession } from './stripe';
import { createMpPreference } from './mp';
import { getReferralCookie } from '@/lib/referrals';
import { getApplicableWalletForCart } from '@/lib/wallet';

export type Provider = 'stripe' | 'mercadopago';

export interface CheckoutBilling {
  fullName: string;
  email: string;
  phone?: string;
  country?: string;
}

export interface CheckoutResult {
  redirectUrl: string;
  orderId: string;
}

export async function startCheckout(opts: {
  provider: Provider;
  billing: CheckoutBilling;
}): Promise<CheckoutResult> {
  const cart = await getCartSummary();
  if (!cart.id || cart.items.length === 0) throw new Error('Carrito vacío');

  const user = await getCurrentUser();
  const admin = createSupabaseAdminClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  // Atribución referido (cookie ay_ref, first-touch). La persistimos en billing
  // para que markOrderPaid pueda crear la attribution sin contexto de request.
  const refCode = await getReferralCookie();

  // Partner ref code (cookie ay_partner_ref). Independiente del referral personal.
  const { cookies: getCookies } = await import('next/headers');
  const ck = await getCookies();
  const partnerRefCode = ck.get('ay_partner_ref')?.value ?? null;

  // Gift card aplicada en el carrito (si la hay), copiada a billing para fulfillment.
  const giftCardCode = (cart as { giftCardCode?: string | null }).giftCardCode ?? null;

  // Wallet: si el cart tiene `use_wallet=true`, fijamos snapshot del monto aplicable.
  const useWallet = (cart as { useWallet?: boolean }).useWallet ?? false;
  const walletAmountCents = useWallet
    ? await getApplicableWalletForCart(cart.currency as 'ARS' | 'USD', cart.totalCents)
    : 0;

  const billingWithRef: Record<string, unknown> = {
    ...opts.billing,
    ...(refCode ? { referral_code: refCode } : {}),
    ...(partnerRefCode ? { partner_ref_code: partnerRefCode } : {}),
    ...(giftCardCode ? { gift_card_code: giftCardCode } : {}),
    ...(walletAmountCents > 0 ? { wallet_amount_cents: walletAmountCents } : {}),
    // Snapshot del stack completo de cupones (incluye BOGO/bundle/free_shipping).
    // Lo usa markOrderPaid para registrar redenciones en shop.coupon_redemptions.
    ...(cart.appliedCoupons?.length
      ? {
          applied_coupons: cart.appliedCoupons.map((c) => ({
            code: c.code,
            kind: c.kind,
            discount_cents: c.discountCents,
            reason: c.reason,
            free_shipping: c.freeShipping ?? false,
          })),
        }
      : {}),
  };

  // Crear orden + items (transacción lógica)
  const { data: order, error: orderErr } = await admin.schema('shop').from('orders').insert({
    user_id: user?.id ?? null,
    status: 'pending',
    provider: opts.provider,
    subtotal_cents: cart.subtotalCents,
    discount_cents: cart.discountCents,
    total_cents: cart.totalCents,
    currency: cart.currency,
    coupon_code: cart.couponCode,
    billing: billingWithRef as never,
  }).select('id').single();

  if (orderErr || !order) throw new Error('No pudimos crear la orden');

  const orderItems = cart.items.map((it) => ({
    order_id: order.id,
    product_id: it.product.id,
    product_type: it.product.type,
    name_snapshot: it.product.name,
    qty: it.qty,
    unit_price_cents: it.unit_price_cents,
    total_cents: it.unit_price_cents * it.qty,
  }));
  await admin.schema('shop').from('order_items').insert(orderItems as never);

  // Crear sesión en provider
  if (opts.provider === 'stripe') {
    const session = await createStripeCheckoutSession({
      orderId: order.id,
      currency: cart.currency,
      customerEmail: opts.billing.email,
      items: cart.items.map((it) => ({
        name: it.product.name,
        amountCents: it.unit_price_cents,
        qty: it.qty,
      })),
      discountCents: cart.discountCents > 0 ? cart.discountCents : undefined,
      successUrl: `${siteUrl}/orden/${order.id}/success`,
      cancelUrl: `${siteUrl}/checkout?cancelled=1`,
    });
    await admin.schema('shop').from('orders')
      .update({ provider_order_id: session.id })
      .eq('id', order.id);
    return { orderId: order.id, redirectUrl: session.url ?? '' };
  }

  // Mercado Pago
  const pref = await createMpPreference({
    orderId: order.id,
    items: cart.items.map((it) => ({
      title: it.product.name,
      unitAmountCents: it.unit_price_cents,
      qty: it.qty,
      currency: cart.currency,
    })),
    payerEmail: opts.billing.email,
    successUrl: `${siteUrl}/orden/${order.id}/success`,
    failureUrl: `${siteUrl}/orden/${order.id}/error`,
    pendingUrl: `${siteUrl}/orden/${order.id}/pendiente`,
    notificationUrl: `${siteUrl}/api/webhooks/mercadopago`,
    discountCents: cart.discountCents,
  });

  await admin.schema('shop').from('orders')
    .update({ provider_order_id: pref.id })
    .eq('id', order.id);

  return {
    orderId: order.id,
    redirectUrl: pref.init_point ?? pref.sandbox_init_point ?? '',
  };
}
