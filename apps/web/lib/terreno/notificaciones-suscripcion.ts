import 'server-only';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { ACEQUIA_PLANS } from '@arteytierra/config/acequia';
import { sendTransactional } from '@/lib/email';
import { PRECIO_USD, type PlanPago, type Periodo } from './suscripciones';

/**
 * Correos del ciclo de cobro de Acequia. Los disparan los webhooks después de
 * escribir en `terreno.suscripciones`. Nunca hacen throw: un fallo de correo no
 * debe tumbar el webhook (si devuelve 500, el proveedor reintenta y se duplica
 * el fulfillment).
 *
 * `EMAIL_DELIVERY_ENABLED` sigue mandando: si está en 'false', sendTransactional
 * igual persiste la fila pero el provider queda en noop.
 */

const APP_URL = process.env.NEXT_PUBLIC_ACEQUIA_APP_URL ?? 'https://terreno.arteytierra.org';
const URL_CUENTA = `${APP_URL}/cuenta`;
const URL_PAGO = `${APP_URL}/suscribir`;

function nombrePlan(plan: PlanPago): string {
  return ACEQUIA_PLANS[plan].name;
}

function precioLabel(plan: PlanPago, periodo: Periodo): string {
  const usd = PRECIO_USD[plan][periodo];
  const cada = periodo === 'anual' ? 'año' : 'mes';
  return `USD ${usd} por ${cada}`;
}

function fechaLabel(iso: string | null | undefined): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Busca correo y nombre del usuario. null si no se puede notificar. */
async function destinatario(userId: string): Promise<{ email: string; name: string } | null> {
  const admin = createSupabaseAdminClient();
  const { data: authUser } = await admin.auth.admin.getUserById(userId);
  const email = authUser?.user?.email ?? null;
  if (!email) return null;
  const { data: profile } = await admin
    .schema('app').from('profiles')
    .select('full_name')
    .eq('id', userId)
    .maybeSingle();
  const name =
    (profile as { full_name?: string } | null)?.full_name ??
    (authUser?.user?.user_metadata?.full_name as string | undefined) ??
    'Hola';
  return { email, name };
}

async function enviar<T extends Parameters<typeof sendTransactional>[0]['template']>(
  userId: string,
  template: T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vars: any,
): Promise<void> {
  try {
    const d = await destinatario(userId);
    if (!d) {
      console.warn('[notif-suscripcion] sin correo para', userId, template);
      return;
    }
    await sendTransactional({
      to: d.email,
      userId,
      template,
      category: 'transactional',
      force: true,
      vars: { name: d.name, ...vars },
    });
  } catch (err) {
    console.error('[notif-suscripcion] fallo', template, err);
  }
}

export function notificarPruebaIniciada(o: {
  userId: string; plan: PlanPago; periodo: Periodo; trialEnd: string;
}): Promise<void> {
  return enviar(o.userId, 'terreno-trial-started', {
    planName: nombrePlan(o.plan),
    priceLabel: precioLabel(o.plan, o.periodo),
    firstChargeLabel: fechaLabel(o.trialEnd),
    manageUrl: URL_CUENTA,
  });
}

export function notificarPrimerCobro(o: {
  userId: string; plan: PlanPago; periodo: Periodo; nextChargeAt: string | null;
}): Promise<void> {
  return enviar(o.userId, 'terreno-first-charge', {
    planName: nombrePlan(o.plan),
    priceLabel: precioLabel(o.plan, o.periodo),
    nextChargeLabel: fechaLabel(o.nextChargeAt),
    manageUrl: URL_CUENTA,
  });
}

export function notificarRenovacion(o: {
  userId: string; plan: PlanPago; periodo: Periodo; nextChargeAt: string | null;
}): Promise<void> {
  return enviar(o.userId, 'terreno-renewed', {
    planName: nombrePlan(o.plan),
    priceLabel: precioLabel(o.plan, o.periodo),
    nextChargeLabel: fechaLabel(o.nextChargeAt),
    manageUrl: URL_CUENTA,
  });
}

export function notificarPagoFallido(o: {
  userId: string; plan: PlanPago;
}): Promise<void> {
  return enviar(o.userId, 'terreno-payment-failed', {
    planName: nombrePlan(o.plan),
    updateUrl: URL_PAGO,
  });
}

export function notificarCancelacion(o: {
  userId: string; plan: PlanPago; enPrueba: boolean; accesoHasta: string | null;
}): Promise<void> {
  return enviar(o.userId, 'terreno-cancelled', {
    planName: nombrePlan(o.plan),
    enPrueba: o.enPrueba,
    accesoHastaLabel: fechaLabel(o.accesoHasta),
  });
}

/** Aviso "en 24 h se hace el primer cobro" — lo llama el cron, no un webhook. */
export function notificarAvisoPrimerCobro(o: {
  userId: string; plan: PlanPago; periodo: Periodo; trialEnd: string;
}): Promise<void> {
  return enviar(o.userId, 'terreno-trial-ending', {
    planName: nombrePlan(o.plan),
    priceLabel: precioLabel(o.plan, o.periodo),
    firstChargeLabel: fechaLabel(o.trialEnd),
    manageUrl: URL_CUENTA,
  });
}
