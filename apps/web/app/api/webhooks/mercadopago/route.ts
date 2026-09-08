import { createHash, createHmac, timingSafeEqual } from 'crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { fetchMpPayment } from '@/lib/commerce/mp';
import { markOrderPaid } from '@/lib/commerce/fulfillment';
import { fetchMpAuthorizedPayment, fetchMpPreapproval, parseRefMp, proximaVigencia } from '@/lib/terreno/suscripciones';
import { activarSuscripcionTerreno, renovarSuscripcionTerreno, cancelarSuscripcionTerreno } from '@/lib/terreno/fulfillment-suscripcion';
import { claimProviderEvent, markProviderEventApplied, releaseProviderEvent } from '@/lib/terreno/provider-events';

export const runtime = 'nodejs';

function verifyMpSignature(req: NextRequest, dataId: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return false;
  const signature = req.headers.get('x-signature') ?? '';
  const requestId = req.headers.get('x-request-id') ?? '';
  const parts = Object.fromEntries(signature.split(',').map((part) => part.split('=').map((value) => value.trim())) as [string, string][]);
  if (!parts.ts || !parts.v1) return false;
  const expected = createHmac('sha256', secret)
    .update(`id:${dataId};request-id:${requestId};ts:${parts.ts};`)
    .digest('hex');
  try {
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(parts.v1, 'hex'));
  } catch {
    return false;
  }
}

function notificationId(req: NextRequest, body: Record<string, unknown>, type: string, dataId: string, raw: string): string {
  if (typeof body.id === 'string' || typeof body.id === 'number') return String(body.id);
  return createHash('sha256')
    .update(`${type}|${dataId}|${req.headers.get('x-request-id') ?? ''}|${raw}`)
    .digest('hex');
}

function trialEnd(days: number, providerDate?: string): string | null {
  if (days <= 0) return null;
  if (providerDate && !Number.isNaN(Date.parse(providerDate))) return new Date(providerDate).toISOString();
  return new Date(Date.now() + days * 86_400_000).toISOString();
}

export async function POST(request: NextRequest) {
  const raw = await request.text();
  let body: Record<string, any>;
  try { body = JSON.parse(raw); } catch { body = {}; }
  const type = String(body.type ?? request.nextUrl.searchParams.get('type') ?? '');
  const dataId = String(body.data?.id ?? request.nextUrl.searchParams.get('data.id') ?? '');
  const isSubscription = type === 'subscription_preapproval'
    || type === 'preapproval'
    || type === 'subscription_authorized_payment';

  if (isSubscription && process.env.PAYMENT_WEBHOOKS_ENABLED !== 'true') {
    return NextResponse.json({ error: 'webhooks de suscripción desactivados' }, { status: 503 });
  }

  if (isSubscription) {
    if (!dataId) return NextResponse.json({ error: 'evento sin identificador' }, { status: 400 });
    if (!verifyMpSignature(request, dataId)) return NextResponse.json({ error: 'firma inválida' }, { status: 401 });
    const id = notificationId(request, body, type, dataId, raw);
    const claimed = await claimProviderEvent({
      provider: 'mercadopago', eventId: id, providerRef: dataId, eventType: type,
      eventAt: typeof body.date_created === 'string' ? body.date_created : null, rawBody: raw,
    });
    if (!claimed) return NextResponse.json({ received: true, duplicate: true });

    try {
      if (type === 'subscription_preapproval' || type === 'preapproval') {
        const pre = await fetchMpPreapproval(dataId);
        const ref = parseRefMp(pre.external_reference);
        if (ref && pre.status === 'authorized') {
          await activarSuscripcionTerreno({
            userId: ref.userId, plan: ref.plan, periodo: ref.periodo,
            provider: 'mercadopago', providerRef: dataId,
            vigenteHasta: proximaVigencia(ref.periodo),
            trialEnd: trialEnd(ref.trialDays, pre.auto_recurring?.start_date),
            providerEventId: id,
            providerEventAt: typeof body.date_created === 'string' ? body.date_created : undefined,
          });
        } else if (pre.status === 'cancelled' || pre.status === 'paused') {
          await cancelarSuscripcionTerreno({ providerRef: dataId });
        }
      } else {
        const invoice = await fetchMpAuthorizedPayment(dataId);
        if (invoice.preapproval_id && invoice.payment?.status === 'approved') {
          const pre = await fetchMpPreapproval(invoice.preapproval_id);
          const ref = parseRefMp(pre.external_reference);
          if (ref) {
            await renovarSuscripcionTerreno({
              providerRef: invoice.preapproval_id,
              vigenteHasta: proximaVigencia(ref.periodo),
              paidAt: invoice.date_created,
              providerEventId: id,
              providerEventAt: invoice.date_created,
            });
          }
        }
      }
      await markProviderEventApplied('mercadopago', id);
      return NextResponse.json({ received: true });
    } catch (error) {
      await releaseProviderEvent('mercadopago', id);
      console.error('[mercadopago subscription webhook]', error);
      return NextResponse.json({ error: 'handler error' }, { status: 500 });
    }
  }

  if (type !== 'payment' || !dataId) return NextResponse.json({ received: true, ignored: true });
  if (!verifyMpSignature(request, dataId)) return NextResponse.json({ error: 'firma inválida' }, { status: 401 });
  try {
    const payment = await fetchMpPayment(dataId);
    if (parseRefMp(payment.external_reference)) {
      return NextResponse.json({ received: true, subscriptionPayment: true });
    }
    const orderId = payment.external_reference ?? payment.metadata?.order_id;
    if (!orderId) return NextResponse.json({ ignored: 'sin order_id' });
    if (payment.status === 'approved') {
      await markOrderPaid({
        orderId: String(orderId), provider: 'mercadopago', providerPaymentId: String(payment.id),
        amountCents: Math.round((payment.transaction_amount ?? 0) * 100), currency: payment.currency_id ?? 'ARS', raw: payment,
      });
    }
  } catch (error) {
    console.error('[mercadopago payment webhook]', error);
    return NextResponse.json({ error: 'handler error' }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
