import { NextResponse, type NextRequest } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/commerce/stripe';
import { markOrderPaid } from '@/lib/commerce/fulfillment';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const sig = request.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json({ error: 'Firma faltante' }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    return NextResponse.json(
      { error: `Firma inválida: ${err instanceof Error ? err.message : 'desconocido'}` },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;
        if (orderId && session.payment_status === 'paid') {
          await markOrderPaid({
            orderId,
            provider: 'stripe',
            providerPaymentId: typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent?.id ?? session.id,
            amountCents: session.amount_total ?? 0,
            currency: (session.currency ?? 'usd').toUpperCase(),
            raw: session,
          });
        }
        break;
      }

      case 'payment_intent.succeeded': {
        // Fallback por si checkout.session.completed no llega
        const pi = event.data.object as Stripe.PaymentIntent;
        const orderId = pi.metadata?.order_id;
        if (orderId) {
          await markOrderPaid({
            orderId,
            provider: 'stripe',
            providerPaymentId: pi.id,
            amountCents: pi.amount_received ?? pi.amount,
            currency: pi.currency.toUpperCase(),
            raw: pi,
          });
        }
        break;
      }

      case 'charge.refunded': {
        // TODO: marcar orden como refunded + revocar enrollment
        break;
      }
    }
  } catch (err) {
    console.error('Webhook handler failed', err);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
