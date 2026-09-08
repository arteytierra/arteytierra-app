import 'server-only';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { esPlanPago, esPeriodo, type PlanPago, type Periodo } from './suscripciones';
import {
  notificarPruebaIniciada,
  notificarPrimerCobro,
  notificarRenovacion,
  notificarCancelacion,
} from './notificaciones-suscripcion';

/**
 * Escribe el plan en `terreno.suscripciones` a partir de un evento de pago.
 * Lo llaman los webhooks (service-role, saltan RLS). El schema `terreno` no está
 * en los tipos generados, así que se accede con cast — igual que en apps/terreno.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function tablaSusc(): any {
  return (createSupabaseAdminClient() as any).schema('terreno').from('suscripciones');
}

export async function activarSuscripcionTerreno(opts: {
  userId:       string;
  plan:         PlanPago;
  periodo:      Periodo;
  provider:     'stripe' | 'mercadopago' | 'paypal';
  providerRef:  string;
  /** ISO; null = sin vencimiento conocido (se recalcula en cada renovación). */
  vigenteHasta: string | null;
  trialEnd?: string | null;
  providerEventId?: string;
  providerEventAt?: string;
}): Promise<void> {
  const now = new Date();
  const trialEnd = opts.trialEnd && new Date(opts.trialEnd).getTime() > now.getTime()
    ? new Date(opts.trialEnd).toISOString()
    : null;
  const { error } = await tablaSusc().upsert(
    {
      user_id:       opts.userId,
      plan:          opts.plan,
      estado:        trialEnd ? 'prueba' : 'activa',
      periodo:       opts.periodo,
      provider:      opts.provider,
      provider_ref:  opts.providerRef,
      vigente_hasta: trialEnd ?? opts.vigenteHasta,
      trial_start:   trialEnd ? now.toISOString() : null,
      trial_end:     trialEnd,
      first_charge_at: trialEnd,
      provider_event_id: opts.providerEventId ?? null,
      provider_event_at: opts.providerEventAt ?? now.toISOString(),
      cancel_at_period_end: false,
      cancelled_at: null,
      updated_at:    now.toISOString(),
    },
    { onConflict: 'user_id' },
  );
  if (error) throw error;

  if (trialEnd) {
    await notificarPruebaIniciada({
      userId: opts.userId, plan: opts.plan, periodo: opts.periodo, trialEnd,
    });
  }
}

/** Extiende la vigencia en una renovación (sin cambiar el plan). */
export async function renovarSuscripcionTerreno(opts: {
  providerRef:  string;
  vigenteHasta: string | null;
  paidAt?: string;
  providerEventId?: string;
  providerEventAt?: string;
}): Promise<void> {
  const { data: existing, error: readError } = await tablaSusc()
    .select('user_id, estado, plan, periodo, first_charge_at')
    .eq('provider_ref', opts.providerRef)
    .maybeSingle();
  if (readError) throw readError;
  const veniaDePrueba = existing?.estado === 'prueba';
  const now = new Date().toISOString();
  const { error } = await tablaSusc()
    .update({
      estado: 'activa',
      vigente_hasta: opts.vigenteHasta,
      first_charge_at: existing?.first_charge_at ?? opts.paidAt ?? now,
      provider_event_id: opts.providerEventId ?? null,
      provider_event_at: opts.providerEventAt ?? now,
      cancel_at_period_end: false,
      cancelled_at: null,
      updated_at: now,
    })
    .eq('provider_ref', opts.providerRef);
  if (error) throw error;

  // El primer cobro después de la prueba merece otro texto que una renovación.
  if (existing?.user_id && esPlanPago(existing.plan) && esPeriodo(existing.periodo)) {
    const datos = {
      userId: existing.user_id as string,
      plan: existing.plan,
      periodo: existing.periodo,
      nextChargeAt: opts.vigenteHasta,
    };
    await (veniaDePrueba ? notificarPrimerCobro(datos) : notificarRenovacion(datos));
  }
}

/** Cancela/vence una suscripción → getPlan vuelve a 'semilla'. */
export async function cancelarSuscripcionTerreno(opts: {
  userId?: string;
  providerRef?: string;
}): Promise<void> {
  let lookup = tablaSusc().select('user_id,estado,plan,periodo,vigente_hasta,first_charge_at');
  if (opts.userId) lookup = lookup.eq('user_id', opts.userId);
  else if (opts.providerRef) lookup = lookup.eq('provider_ref', opts.providerRef);
  else return;
  const { data, error: readError } = await lookup.maybeSingle();
  if (readError) throw readError;
  if (!data) return;

  const now = new Date();
  const paidAccessRemains = data.estado === 'activa'
    && data.vigente_hasta
    && new Date(data.vigente_hasta).getTime() > now.getTime();
  const updates = paidAccessRemains
    ? { cancel_at_period_end: true, cancelled_at: now.toISOString(), updated_at: now.toISOString() }
    : {
        estado: 'cancelada',
        vigente_hasta: null,
        cancel_at_period_end: false,
        cancelled_at: now.toISOString(),
        updated_at: now.toISOString(),
      };
  const { error } = await tablaSusc().update(updates).eq('user_id', data.user_id);
  if (error) throw error;

  if (esPlanPago(data.plan)) {
    await notificarCancelacion({
      userId: data.user_id as string,
      plan: data.plan,
      // Cancelar durante la prueba no cobró nada, y el correo lo dice explícito.
      enPrueba: data.estado === 'prueba',
      accesoHasta: paidAccessRemains ? (data.vigente_hasta as string) : null,
    });
  }
}

/** Deja constancia de que ya se avisó el primer cobro, para que el cron no repita. */
export async function marcarAvisoCobroEnviado(userId: string): Promise<void> {
  const { error } = await tablaSusc()
    .update({ aviso_cobro_at: new Date().toISOString() })
    .eq('user_id', userId);
  if (error) throw error;
}

/** Lee la suscripción de un usuario. La usa la página de cuenta y la baja. */
export async function leerSuscripcionTerreno(userId: string): Promise<{
  plan: string;
  estado: string;
  periodo: string;
  /** 'manual' para los accesos otorgados a mano, sin pasar por un proveedor. */
  provider: string | null;
  provider_ref: string | null;
  vigente_hasta: string | null;
  trial_end: string | null;
  cancel_at_period_end: boolean | null;
} | null> {
  const { data, error } = await tablaSusc()
    .select('plan,estado,periodo,provider,provider_ref,vigente_hasta,trial_end,cancel_at_period_end')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}
