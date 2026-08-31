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
import { ARS_POR_USD } from './planes';

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

export type PlanPago = AcequiaPaidPlanId;
export type Periodo = AcequiaBillingPeriod;

/** Precio base en USD — debe coincidir con el landing (lib/terreno/planes.ts). */
export const PRECIO_USD: Record<PlanPago, Record<Periodo, number>> = {
  personal:  { mensual: acequiaPlanPrice('personal', 'mensual'),  anual: acequiaPlanPrice('personal', 'anual') },
  disenador: { mensual: acequiaPlanPrice('disenador', 'mensual'), anual: acequiaPlanPrice('disenador', 'anual') },
  estudio:   { mensual: acequiaPlanPrice('estudio', 'mensual'),   anual: acequiaPlanPrice('estudio', 'anual') },
};

const NOMBRE: Record<PlanPago, string> = {
  personal: ACEQUIA_PLANS.personal.name,
  disenador: ACEQUIA_PLANS.disenador.name,
  estudio: ACEQUIA_PLANS.estudio.name,
};

export function esPlanPago(v: string): v is PlanPago {
  return isAcequiaPaidPlan(v);
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
}> {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error('MP_ACCESS_TOKEN no configurada');
  const pre = new PreApproval(new MercadoPagoConfig({ accessToken: token }));
  return pre.get({ id });
}

/** Parsea el external_reference JSON que embebimos en el preapproval. */
export function parseRefMp(ref: string | undefined): { userId: string; plan: PlanPago; periodo: Periodo } | null {
  if (!ref) return null;
  try {
    const o = JSON.parse(ref) as { user_id?: string; plan?: string; periodo?: string };
    if (o.user_id && o.plan && o.periodo && esPlanPago(o.plan) && esPeriodo(o.periodo)) {
      return { userId: o.user_id, plan: o.plan, periodo: o.periodo };
    }
  } catch { /* no-json */ }
  return null;
}

/** Mercado Pago — suscripción en ARS (a ARS_POR_USD). Devuelve el init_point. */
export async function crearPreapprovalMp(o: CrearCheckoutOpts): Promise<string> {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error('MP_ACCESS_TOKEN no configurada');

  const ars = PRECIO_USD[o.plan][o.periodo] * ARS_POR_USD;
  const pre = new PreApproval(new MercadoPagoConfig({ accessToken: token }));
  const trialEnd = pruebaComercialHabilitada() ? addAcequiaTrialDays().toISOString() : undefined;

  const res = await pre.create({
    body: {
      reason: `Terreno ${NOMBRE[o.plan]} (${o.periodo})`,
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
      back_url: `${o.siteUrl}/terreno/gracias?plan=${o.plan}`,
      // Nota: el SDK de MP no acepta notification_url en el preapproval; los avisos
      // de suscripción van a la URL configurada en el panel de la aplicación (debe
      // apuntar a producción: https://arteytierra.org/api/webhooks/mercadopago).
      status: 'pending',
    },
  });
  return res.init_point ?? '';
}
