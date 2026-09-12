import { NextResponse, type NextRequest } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/commerce/stripe';
import { markOrderPaid } from '@/lib/commerce/fulfillment';
import { ordenDePago, marcarOrdenReembolsada } from '@/lib/commerce/refunds';
import { log } from '@/lib/observability/logger';
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
        // Un reembolso hecho a mano desde el panel de Stripe no pasa por
        // nuestro boton, asi que sin esto la orden seguia figurando como
        // pagada y el curso seguia abierto despues de devolver la plata.
        const charge = event.data.object as Stripe.Charge;
        const pi = typeof charge.payment_intent === 'string'
          ? charge.payment_intent
          : charge.payment_intent?.id ?? null;
        if (pi) {
          const orderId = await ordenDePago(pi);
          // Solo cuando se devolvio todo. Un reembolso parcial necesita una
          // decision humana sobre si el acceso se corta o no, y marcarla
          // entera seria mentir sobre lo que paso.
          if (orderId && charge.amount_refunded >= charge.amount) {
            const cambio = await marcarOrdenReembolsada(orderId);
            if (cambio) log.info('order.refunded_via_webhook', { orderId, charge: charge.id });
          }
        }
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
