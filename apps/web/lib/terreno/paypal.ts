import 'server-only';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { PRECIO_USD, type PlanPago, type Periodo } from './suscripciones';

/**
 * PayPal Subscriptions — cobro internacional recurrente (USD).
 * Reemplaza a Stripe, que no opera para cuentas de Argentina.
 *
 * Requiere en env (proyecto web): PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET,
 * PAYPAL_WEBHOOK_ID y PAYPAL_ENV ('live' | 'sandbox'). El Product y los Plans se
 * crean por API la primera vez y se cachean en terreno.paypal_planes.
 */

const NOMBRE: Record<PlanPago, string> = { personal: 'Personal', disenador: 'Diseñador', estudio: 'Estudio' };

function base(): string {
  return process.env.PAYPAL_ENV === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';
}

async function token(): Promise<string> {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) throw new Error('PayPal no configurado (PAYPAL_CLIENT_ID/SECRET).');
  const res = await fetch(`${base()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) {
    // Log del motivo real de PayPal (error/error_description) + endpoint usado,
    // sin exponer credenciales. Ayuda a distinguir env equivocado vs creds malas.
    const detalle = await res.text().catch(() => '');
    console.error('[paypal token] fallo auth', { endpoint: base(), status: res.status, body: detalle.slice(0, 300) });
    throw new Error('PayPal: no pudimos autenticar.');
  }
  return (await res.json() as { access_token: string }).access_token;
}

// ─── Cache de product/plans ─────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function tablaPlanes(): any {
  return (createSupabaseAdminClient() as any).schema('terreno').from('paypal_planes');
}
async function getRef(clave: string): Promise<string | null> {
  const { data } = await tablaPlanes().select('ref').eq('clave', clave).maybeSingle();
  return (data?.ref as string | undefined) ?? null;
}
async function setRef(clave: string, ref: string): Promise<void> {
  await tablaPlanes().upsert({ clave, ref }, { onConflict: 'clave' });
}

async function ensureProduct(tk: string): Promise<string> {
  const cached = await getRef('product');
  if (cached) return cached;
  const res = await fetch(`${base()}/v1/catalogs/products`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tk}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Terreno', description: 'Suscripción a Terreno', type: 'SERVICE', category: 'SOFTWARE' }),
  });
  const j = await res.json() as { id?: string };
  if (!res.ok || !j.id) throw new Error('PayPal: no pudimos crear el producto.');
  await setRef('product', j.id);
  return j.id;
}

async function ensurePlan(tk: string, plan: PlanPago, periodo: Periodo): Promise<string> {
  const clave = `${plan}_${periodo}`;
  const cached = await getRef(clave);
  if (cached) return cached;

  const productId = await ensureProduct(tk);
  const usd = PRECIO_USD[plan][periodo];
  const res = await fetch(`${base()}/v1/billing/plans`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tk}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_id: productId,
      name: `Terreno ${NOMBRE[plan]} (${periodo})`,
      billing_cycles: [{
        frequency: { interval_unit: periodo === 'anual' ? 'YEAR' : 'MONTH', interval_count: 1 },
        tenure_type: 'REGULAR',
        sequence: 1,
        total_cycles: 0, // 0 = infinito hasta cancelar
        pricing_scheme: { fixed_price: { value: String(usd), currency_code: 'USD' } },
      }],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 1,
      },
    }),
  });
  const j = await res.json() as { id?: string };
  if (!res.ok || !j.id) throw new Error(`PayPal: no pudimos crear el plan (${clave}).`);
  await setRef(clave, j.id);
  return j.id;
}

/** Crea una suscripción y devuelve el link de aprobación (donde va el usuario). */
export async function crearSubscripcionPaypal(o: {
  plan: PlanPago; periodo: Periodo; userId: string; email: string; siteUrl: string;
}): Promise<string> {
  const tk = await token();
  const planId = await ensurePlan(tk, o.plan, o.periodo);
  const res = await fetch(`${base()}/v1/billing/subscriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tk}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      plan_id: planId,
      custom_id: JSON.stringify({ user_id: o.userId, plan: o.plan, periodo: o.periodo }),
      subscriber: { email_address: o.email },
      application_context: {
        brand_name: 'Terreno',
        locale: 'es-AR',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        return_url: `${o.siteUrl}/terreno/gracias?plan=${o.plan}`,
        cancel_url: `${o.siteUrl}/terreno#planes`,
      },
    }),
  });
  const j = await res.json() as { links?: Array<{ rel: string; href: string }> };
  if (!res.ok) throw new Error('PayPal: no pudimos iniciar la suscripción.');
  return j.links?.find(l => l.rel === 'approve')?.href ?? '';
}

/** Lee una suscripción (para el webhook: custom_id, estado, próxima fecha). */
export async function fetchPaypalSubscription(id: string): Promise<{
  custom_id?: string;
  status?: string;
  billing_info?: { next_billing_time?: string };
}> {
  const tk = await token();
  const res = await fetch(`${base()}/v1/billing/subscriptions/${id}`, {
    headers: { Authorization: `Bearer ${tk}` },
  });
  return res.json();
}

/** Verifica la firma del webhook contra la API de PayPal. */
export async function verifyPaypalWebhook(headers: Headers, rawBody: string): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return true; // dev sin webhook id
  const tk = await token();
  const res = await fetch(`${base()}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tk}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_algo: headers.get('paypal-auth-algo'),
      cert_url: headers.get('paypal-cert-url'),
      transmission_id: headers.get('paypal-transmission-id'),
      transmission_sig: headers.get('paypal-transmission-sig'),
      transmission_time: headers.get('paypal-transmission-time'),
      webhook_id: webhookId,
      webhook_event: JSON.parse(rawBody),
    }),
  });
  const j = await res.json() as { verification_status?: string };
  return j.verification_status === 'SUCCESS';
}
