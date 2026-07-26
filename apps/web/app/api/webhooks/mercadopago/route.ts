import { createHmac, timingSafeEqual } from 'crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { fetchMpPayment } from '@/lib/commerce/mp';
import { markOrderPaid } from '@/lib/commerce/fulfillment';
import { fetchMpPreapproval, parseRefMp, proximaVigencia } from '@/lib/terreno/suscripciones';
import {
  activarSuscripcionTerreno, renovarSuscripcionTerreno, cancelarSuscripcionTerreno,
} from '@/lib/terreno/fulfillment-suscripcion';

export const runtime = 'nodejs';

/**
 * Mercado Pago firma con HMAC-SHA256 sobre:
 *   id:<data.id>;request-id:<x-request-id>;ts:<ts>
 * El header `x-signature` contiene `ts=...,v1=...`
 * Doc: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 */
function verifyMpSignature(req: NextRequest, dataId: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true; // dev sin secret

  const sigHeader = req.headers.get('x-signature') ?? '';
  const reqId = req.headers.get('x-request-id') ?? '';

  const parts = Object.fromEntries(
    sigHeader.split(',').map((p) => p.split('=').map((s) => s.trim())) as [string, string][],
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${reqId};ts:${ts};`;
  const expected = createHmac('sha256', secret).update(manifest).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(v1, 'hex'));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const type = body.type ?? request.nextUrl.searchParams.get('type');
  const dataId = body.data?.id ?? request.nextUrl.searchParams.get('data.id');

  // ── Suscripciones de Terreno (preapproval) ─────────────────────────────────
  if ((type === 'subscription_preapproval' || type === 'preapproval') && dataId) {
    if (!verifyMpSignature(request, String(dataId))) {
      return NextResponse.json({ error: 'firma inválida' }, { status: 401 });
    }
    try {
      const pre = await fetchMpPreapproval(String(dataId));
      const ref = parseRefMp(pre.external_reference);
      if (ref) {
        if (pre.status === 'authorized') {
          await activarSuscripcionTerreno({
            userId: ref.userId, plan: ref.plan, periodo: ref.periodo,
            provider: 'mercadopago', providerRef: String(dataId),
            vigenteHasta: proximaVigencia(ref.periodo),
          });
        } else if (pre.status === 'cancelled' || pre.status === 'paused') {
          await cancelarSuscripcionTerreno({ providerRef: String(dataId) });
        }
      }
    } catch (err) {
      console.error('MP preapproval webhook error', err);
      return NextResponse.json({ error: 'handler error' }, { status: 500 });
    }
    return NextResponse.json({ received: true });
  }

  // Cobro recurrente exitoso → extender la vigencia. [VALIDAR EN SANDBOX el payload real de MP]
  if (type === 'subscription_authorized_payment' && dataId) {
    try {
      const pago = await fetchMpPayment(String(dataId));
      const preId =
        (pago as unknown as { metadata?: { preapproval_id?: string } }).metadata?.preapproval_id ??
        (pago as unknown as { preapproval_id?: string }).preapproval_id;
      if (preId) {
        const pre = await fetchMpPreapproval(String(preId));
        const ref = parseRefMp(pre.external_reference);
        if (ref) {
          await renovarSuscripcionTerreno({
            providerRef: String(preId), vigenteHasta: proximaVigencia(ref.periodo),
          });
        }
      }
    } catch (err) {
      console.error('MP authorized_payment webhook error', err);
    }
    return NextResponse.json({ received: true });
  }

  if (type !== 'payment' || !dataId) {
    return NextResponse.json({ received: true, ignored: true });
  }

  if (!verifyMpSignature(request, String(dataId))) {
    return NextResponse.json({ error: 'firma inválida' }, { status: 401 });
  }

  try {
    const payment = await fetchMpPayment(String(dataId));
    const orderId = payment.external_reference ?? payment.metadata?.order_id;
    if (!orderId) return NextResponse.json({ ignored: 'sin order_id' });

    if (payment.status === 'approved') {
      await markOrderPaid({
        orderId: String(orderId),
        provider: 'mercadopago',
        providerPaymentId: String(payment.id),
        amountCents: Math.round((payment.transaction_amount ?? 0) * 100),
        currency: payment.currency_id ?? 'ARS',
        raw: payment,
      });
    }
  } catch (err) {
    console.error('MP webhook error', err);
    return NextResponse.json({ error: 'handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
