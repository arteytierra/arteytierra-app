import { NextResponse, type NextRequest } from 'next/server';
import { verifyPaypalWebhook, fetchPaypalSubscription } from '@/lib/terreno/paypal';
import { parseRefMp, proximaVigencia } from '@/lib/terreno/suscripciones';
import {
  activarSuscripcionTerreno, renovarSuscripcionTerreno, cancelarSuscripcionTerreno,
} from '@/lib/terreno/fulfillment-suscripcion';

export const runtime = 'nodejs';

/**
 * Webhook de PayPal Subscriptions (cobro internacional recurrente de Terreno).
 * Verifica la firma contra la API de PayPal y mapea los eventos a
 * terreno.suscripciones. custom_id lleva { user_id, plan, periodo }.
 * [VALIDAR EN SANDBOX la forma exacta de cada payload.]
 */
export async function POST(request: NextRequest) {
  const raw = await request.text();

  if (!(await verifyPaypalWebhook(request.headers, raw))) {
    return NextResponse.json({ error: 'firma inválida' }, { status: 401 });
  }

  let event: { event_type?: string; resource?: Record<string, unknown> };
  try { event = JSON.parse(raw); } catch { return NextResponse.json({ ignored: true }); }

  const type = event.event_type ?? '';
  const resource = (event.resource ?? {}) as {
    id?: string;
    custom_id?: string;
    billing_agreement_id?: string;
    billing_info?: { next_billing_time?: string };
  };

  try {
    if (type === 'BILLING.SUBSCRIPTION.ACTIVATED') {
      const ref = parseRefMp(resource.custom_id);
      if (ref && resource.id) {
        await activarSuscripcionTerreno({
          userId: ref.userId, plan: ref.plan, periodo: ref.periodo,
          provider: 'paypal', providerRef: resource.id,
          vigenteHasta: resource.billing_info?.next_billing_time ?? proximaVigencia(ref.periodo),
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
          });
        }
      }
    }
  } catch (err) {
    console.error('PayPal webhook error', err);
    return NextResponse.json({ error: 'handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
