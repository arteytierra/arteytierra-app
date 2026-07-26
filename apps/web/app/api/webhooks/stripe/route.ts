import { NextResponse, type NextRequest } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/commerce/stripe';
import { markOrderPaid } from '@/lib/commerce/fulfillment';
import { activarSuscripcionTerreno, cancelarSuscripcionTerreno } from '@/lib/terreno/fulfillment-suscripcion';
import type { PlanPago, Periodo } from '@/lib/terreno/suscripciones';

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

      // ── Suscripciones de Terreno ──────────────────────────────────────────
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        if (sub.metadata?.kind !== 'terreno_suscripcion') break;
        const userId  = sub.metadata.user_id;
        const plan    = sub.metadata.terreno_plan as PlanPago | undefined;
        const periodo = sub.metadata.terreno_periodo as Periodo | undefined;
        // current_period_end: unix (s) → ISO. Cast: el campo puede no estar en el tipo.
        const cpe = (sub as unknown as { current_period_end?: number }).current_period_end;
        const vigente = cpe ? new Date(cpe * 1000).toISOString() : null;
        if (!userId || !plan || !periodo) break;
        if (sub.status === 'active' || sub.status === 'trialing') {
          await activarSuscripcionTerreno({
            userId, plan, periodo, provider: 'stripe', providerRef: sub.id, vigenteHasta: vigente,
          });
        } else if (sub.status === 'canceled' || sub.status === 'unpaid' || sub.status === 'incomplete_expired') {
          await cancelarSuscripcionTerreno({ providerRef: sub.id });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        if (sub.metadata?.kind === 'terreno_suscripcion') {
          await cancelarSuscripcionTerreno({ providerRef: sub.id });
        }
        break;
      }
    }
  } catch (err) {
    console.error('Webhook handler failed', err);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
