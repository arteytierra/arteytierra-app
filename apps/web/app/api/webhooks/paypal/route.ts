import { NextResponse, type NextRequest } from 'next/server';
import { verifyPaypalWebhook, fetchPaypalSubscription } from '@/lib/terreno/paypal';
import { parseRefMp, proximaVigencia } from '@/lib/terreno/suscripciones';
import { activarSuscripcionTerreno, renovarSuscripcionTerreno, cancelarSuscripcionTerreno } from '@/lib/terreno/fulfillment-suscripcion';
import { claimProviderEvent, markProviderEventApplied, releaseProviderEvent } from '@/lib/terreno/provider-events';

export const runtime = 'nodejs';

const SUPPORTED = new Set([
  'BILLING.SUBSCRIPTION.ACTIVATED',
  'BILLING.SUBSCRIPTION.CANCELLED',
  'BILLING.SUBSCRIPTION.EXPIRED',
  'BILLING.SUBSCRIPTION.SUSPENDED',
  'PAYMENT.SALE.COMPLETED',
]);

export async function POST(request: NextRequest) {
  if (process.env.PAYMENT_WEBHOOKS_ENABLED !== 'true') {
    return NextResponse.json({ error: 'webhooks de suscripción desactivados' }, { status: 503 });
  }
  const raw = await request.text();

  if (!(await verifyPaypalWebhook(request.headers, raw))) {
    return NextResponse.json({ error: 'firma inválida' }, { status: 401 });
  }

  let event: { id?: string; create_time?: string; event_type?: string; resource?: Record<string, unknown> };
  try { event = JSON.parse(raw); } catch { return NextResponse.json({ error: 'json inválido' }, { status: 400 }); }

  const type = event.event_type ?? '';
  if (!SUPPORTED.has(type)) return NextResponse.json({ received: true, ignored: true });
  if (!event.id) return NextResponse.json({ error: 'evento sin identificador' }, { status: 400 });
  const resource = (event.resource ?? {}) as {
    id?: string;
    custom_id?: string;
    billing_agreement_id?: string;
    billing_info?: { next_billing_time?: string };
  };
  const providerRef = type === 'PAYMENT.SALE.COMPLETED' ? resource.billing_agreement_id : resource.id;
  const claimed = await claimProviderEvent({
    provider: 'paypal', eventId: event.id, providerRef, eventType: type,
    eventAt: event.create_time, rawBody: raw,
  });
  if (!claimed) return NextResponse.json({ received: true, duplicate: true });

  try {
    if (type === 'BILLING.SUBSCRIPTION.ACTIVATED' && resource.id) {
      const subscription = await fetchPaypalSubscription(resource.id);
      const ref = parseRefMp(subscription.custom_id ?? resource.custom_id);
      if (ref) {
        const nextBilling = subscription.billing_info?.next_billing_time ?? resource.billing_info?.next_billing_time;
        const trialEnd = ref.trialDays > 0
          ? nextBilling ?? new Date(Date.now() + ref.trialDays * 86_400_000).toISOString()
          : null;
        await activarSuscripcionTerreno({
          userId: ref.userId, plan: ref.plan, periodo: ref.periodo,
          provider: 'paypal', providerRef: resource.id,
          vigenteHasta: nextBilling ?? proximaVigencia(ref.periodo),
          trialEnd,
          providerEventId: event.id,
          providerEventAt: event.create_time,
        });
      }
    } else if (
      type === 'BILLING.SUBSCRIPTION.CANCELLED' ||
      type === 'BILLING.SUBSCRIPTION.EXPIRED' ||
      type === 'BILLING.SUBSCRIPTION.SUSPENDED'
    ) {
      if (resource.id) await cancelarSuscripcionTerreno({ providerRef: resource.id });
    } else if (type === 'PAYMENT.SALE.COMPLETED') {
      // Cobro recurrente. El id de la suscripción viene en billing_agreement_id.
      const subId = resource.billing_agreement_id;
      if (subId) {
        const sub = await fetchPaypalSubscription(subId);
        const ref = parseRefMp(sub.custom_id);
        if (ref) {
          await renovarSuscripcionTerreno({
            providerRef: subId,
            vigenteHasta: sub.billing_info?.next_billing_time ?? proximaVigencia(ref.periodo),
            paidAt: event.create_time,
            providerEventId: event.id,
            providerEventAt: event.create_time,
          });
        }
      }
    }
    await markProviderEventApplied('paypal', event.id);
  } catch (err) {
    await releaseProviderEvent('paypal', event.id);
    console.error('[paypal webhook]', err);
    return NextResponse.json({ error: 'handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
