import 'server-only';
import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY no configurada');
    _stripe = new Stripe(key, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
      appInfo: { name: 'Arte y Tierra', version: '0.1.0' },
    });
  }
  return _stripe;
}

interface CreateSessionParams {
  orderId: string;
  items: Array<{
    name: string;
    description?: string;
    amountCents: number;
    qty: number;
  }>;
  currency: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  discountCents?: number;
  metadata?: Record<string, string>;
}

export async function createStripeCheckoutSession(p: CreateSessionParams) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: p.customerEmail,
    locale: 'es',
    line_items: p.items.map((it) => ({
      price_data: {
        currency: p.currency.toLowerCase(),
        product_data: { name: it.name, description: it.description },
        unit_amount: it.amountCents,
      },
      quantity: it.qty,
    })),
    discounts: p.discountCents
      ? [{ coupon: await getOrCreateOneOffCoupon(p.discountCents, p.currency) }]
      : undefined,
    success_url: `${p.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: p.cancelUrl,
    metadata: { order_id: p.orderId, ...(p.metadata ?? {}) },
    payment_intent_data: {
      metadata: { order_id: p.orderId },
    },
  });
  return session;
}

async function getOrCreateOneOffCoupon(amountCents: number, currency: string): Promise<string> {
  const stripe = getStripe();
  const coupon = await stripe.coupons.create({
    amount_off: amountCents,
    currency: currency.toLowerCase(),
    duration: 'once',
    name: 'Descuento',
  });
  return coupon.id;
}
