import 'server-only';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import type { PlanPago, Periodo } from './suscripciones';

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
}): Promise<void> {
  await tablaSusc().upsert(
    {
      user_id:       opts.userId,
      plan:          opts.plan,
      estado:        'activa',
      periodo:       opts.periodo,
      provider:      opts.provider,
      provider_ref:  opts.providerRef,
      vigente_hasta: opts.vigenteHasta,
      updated_at:    new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );
}

/** Extiende la vigencia en una renovación (sin cambiar el plan). */
export async function renovarSuscripcionTerreno(opts: {
  providerRef:  string;
  vigenteHasta: string | null;
}): Promise<void> {
  await tablaSusc()
    .update({ estado: 'activa', vigente_hasta: opts.vigenteHasta, updated_at: new Date().toISOString() })
    .eq('provider_ref', opts.providerRef);
}

/** Cancela/vence una suscripción → getPlan vuelve a 'semilla'. */
export async function cancelarSuscripcionTerreno(opts: {
  userId?: string;
  providerRef?: string;
}): Promise<void> {
  let q = tablaSusc().update({ estado: 'cancelada', updated_at: new Date().toISOString() });
  if (opts.userId)          q = q.eq('user_id', opts.userId);
  else if (opts.providerRef) q = q.eq('provider_ref', opts.providerRef);
  else return;
  await q;
}
