import 'server-only';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import {
  ACEQUIA_PLANS,
  ACEQUIA_TRIAL_DAYS,
  acequiaPlanPrice,
  addAcequiaTrialDays,
  isAcequiaBillingPeriod,
  isAcequiaPaidPlan,
  type AcequiaBillingPeriod,
  type AcequiaPaidPlanId,
} from '@arteytierra/config/acequia';
import { getStripe } from '@/lib/commerce/stripe';

/**
 * Cobro recurrente de los planes de Terreno.
 *
 * Internacional (USD) → Stripe subscription (price_data inline, sin producto previo).
 * Argentina (ARS)     → Mercado Pago PreApproval (auto_recurring inline).
 *
 * En ambos casos se embebe `{ user_id, plan, periodo }` como metadata /
 * external_reference; el webhook lo lee y escribe `terreno.suscripciones`.
 * Reusa STRIPE_SECRET_KEY / MP_ACCESS_TOKEN ya configuradas para la tienda.
 */

// Estudio sigue existiendo como plan interno para cuentas históricas, pero no se
// ofrece ni puede comprarse desde la web pública.
export type PlanPago = Extract<AcequiaPaidPlanId, 'personal' | 'profesional'>;
export type Periodo = AcequiaBillingPeriod;

/** Precio base en USD — debe coincidir con el landing (lib/terreno/planes.ts). */
export const PRECIO_USD: Record<PlanPago, Record<Periodo, number>> = {
  personal:  { mensual: acequiaPlanPrice('personal', 'mensual'),  anual: acequiaPlanPrice('personal', 'anual') },
  profesional: { mensual: acequiaPlanPrice('profesional', 'mensual'), anual: acequiaPlanPrice('profesional', 'anual') },
};

const NOMBRE: Record<PlanPago, string> = {
  personal: ACEQUIA_PLANS.personal.name,
  profesional: ACEQUIA_PLANS.profesional.name,
};

export function esPlanPago(v: string): v is PlanPago {
  return (v === 'personal' || v === 'profesional') && isAcequiaPaidPlan(v);
}
export function esPeriodo(v: string): v is Periodo {
  return isAcequiaBillingPeriod(v);
}

export type ProveedorPago = 'mercadopago' | 'paypal';
export function esProveedorPago(value: string): value is ProveedorPago {
  return value === 'mercadopago' || value === 'paypal';
}

/** La prueba queda construida pero inactiva mientras esta variable no sea true. */
export function pruebaComercialHabilitada(): boolean {
  return process.env.ACEQUIA_TRIAL_ENABLED === 'true';
}

export function pagosAcequiaHabilitados(): boolean {
  return process.env.ACEQUIA_PAYMENTS_ENABLED === 'true';
}

/**
 * Modo ensayo: con `ACEQUIA_PAYMENTS_TEST_EMAILS` cargada, sólo esos correos pueden
 * pagar; al resto el checkout le responde igual que si los pagos estuvieran apagados.
 *
 * Existe por un motivo concreto: la sección de planes de arteytierra.org/acequia
 * enlaza al checkout sin interruptor propio, así que prender los pagos en producción
 * los abre a cualquiera que se registre. Esto permite hacer el cobro real de prueba
 * sin ofrecerle una suscripción al público antes de que los textos legales estén.
 *
 * Vacía o ausente, no cambia nada: manda `ACEQUIA_PAYMENTS_ENABLED` como siempre.
 */
export function puedePagarAcequia(email: string): boolean {
  if (!pagosAcequiaHabilitados()) return false;
  const lista = (process.env.ACEQUIA_PAYMENTS_TEST_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (lista.length === 0) return true;
  return lista.includes(email.trim().toLowerCase());
}

export function tasaArsPorUsd(): number {
  const value = Number(process.env.ACEQUIA_ARS_PER_USD);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('ACEQUIA_ARS_PER_USD no está configurada con un valor válido.');
  }
  return value;
}

interface CrearCheckoutOpts {
  plan:    PlanPago;
  periodo: Periodo;
  userId:  string;
  email:   string;
  siteUrl: string;
}

/** Stripe — suscripción en USD. Devuelve la URL de checkout. */
export async function crearCheckoutStripe(o: CrearCheckoutOpts): Promise<string> {
  const stripe = getStripe();
  const usd = PRECIO_USD[o.plan][o.periodo];
  const meta = { kind: 'terreno_suscripcion', user_id: o.userId, terreno_plan: o.plan, terreno_periodo: o.periodo };

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: o.email,
    locale: 'es',
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: `Terreno ${NOMBRE[o.plan]}` },
        unit_amount: usd * 100,
        recurring: { interval: o.periodo === 'anual' ? 'year' : 'month' },
      },
      quantity: 1,
    }],
    subscription_data: { metadata: meta },
    metadata: meta,
    success_url: `${o.siteUrl}/terreno/gracias?plan=${o.plan}`,
    cancel_url:  `${o.siteUrl}/terreno#planes`,
  });
  return session.url ?? '';
}

/** Próxima fecha de vigencia (ISO) desde hoy + el período + 3 días de gracia. */
export function proximaVigencia(periodo: Periodo): string {
  const d = new Date();
  d.setMonth(d.getMonth() + (periodo === 'anual' ? 12 : 1));
  d.setDate(d.getDate() + 3);
  return d.toISOString();
}

/** Lee un preapproval de MP (para el webhook): status + external_reference. */
export async function fetchMpPreapproval(id: string): Promise<{
  status?: string;
  external_reference?: string;
  auto_recurring?: { start_date?: string };
}> {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error('MP_ACCESS_TOKEN no configurada');
  const pre = new PreApproval(new MercadoPagoConfig({ accessToken: token }));
  // El tipo del SDK no declara start_date dentro de auto_recurring, pero la API sí
  // lo devuelve: es la fecha del primer cobro, o sea el fin de la prueba.
  return pre.get({ id }) as unknown as Promise<{
    status?: string;
    external_reference?: string;
    auto_recurring?: { start_date?: string };
  }>;
}

export async function fetchMpAuthorizedPayment(id: string): Promise<{
  preapproval_id?: string;
  status?: string;
  date_created?: string;
  payment?: { id?: number; status?: string; status_detail?: string };
}> {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) throw new Error('MP_ACCESS_TOKEN no configurada');
  const res = await fetch(`https://api.mercadopago.com/authorized_payments/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Mercado Pago: factura no disponible (${res.status}).`);
  return res.json();
}

/** Parsea el external_reference JSON que embebimos en el preapproval. */
export function parseRefMp(ref: string | undefined): { userId: string; plan: PlanPago; periodo: Periodo; trialDays: number } | null {
  if (!ref) return null;
  try {
    const o = JSON.parse(ref) as { user_id?: string; plan?: string; periodo?: string; trial_days?: number };
    if (o.user_id && o.plan && o.periodo && esPlanPago(o.plan) && esPeriodo(o.periodo)) {
      return {
        userId: o.user_id,
        plan: o.plan,
        periodo: o.periodo,
        trialDays: Number.isFinite(o.trial_days) ? Math.max(0, Number(o.trial_days)) : 0,
      };
    }
  } catch { /* no-json */ }
  return null;
}

/** Mercado Pago — suscripción en ARS (a ARS_POR_USD). Devuelve el init_point. */
export async function crearPreapprovalMp(o: CrearCheckoutOpts): Promise<string> {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error('MP_ACCESS_TOKEN no configurada');

  const ars = Math.round(PRECIO_USD[o.plan][o.periodo] * tasaArsPorUsd());
  const pre = new PreApproval(new MercadoPagoConfig({ accessToken: token }));
  const trialEnd = pruebaComercialHabilitada() ? addAcequiaTrialDays().toISOString() : undefined;

  const res = await pre.create({
    body: {
      reason: `Acequia ${NOMBRE[o.plan]} (${o.periodo})`,
      external_reference: JSON.stringify({ user_id: o.userId, plan: o.plan, periodo: o.periodo, trial_days: trialEnd ? ACEQUIA_TRIAL_DAYS : 0 }),
      payer_email: o.email,
      auto_recurring: {
        // MP sólo admite frequency_type 'days' | 'months'; anual = 12 meses.
        frequency:      o.periodo === 'anual' ? 12 : 1,
        frequency_type: 'months',
        transaction_amount: ars,
        currency_id: 'ARS',
        ...(trialEnd ? { start_date: trialEnd } : {}),
      },
      back_url: `${o.siteUrl}/gracias?plan=${ACEQUIA_PLANS[o.plan].id}`,
      // Nota: el SDK de MP no acepta notification_url en el preapproval; los avisos
      // de suscripción van a la URL configurada en el panel de la aplicación (debe
      // apuntar a producción: https://arteytierra.org/api/webhooks/mercadopago).
      status: 'pending',
    },
  });
  return res.init_point ?? '';
}

/** Cancela la renovación de una suscripción de Mercado Pago. */
export async function cancelarPreapprovalMp(id: string): Promise<void> {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) throw new Error('MP_ACCESS_TOKEN no configurada');
  const res = await fetch(`https://api.mercadopago.com/preapproval/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'cancelled' }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error('[mercadopago cancel]', { status: res.status, body: body.slice(0, 300) });
    throw new Error('Mercado Pago no pudo cancelar la renovación.');
  }
}
