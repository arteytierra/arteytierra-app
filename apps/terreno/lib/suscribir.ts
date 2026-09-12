'use client';

import type { AcequiaBillingPeriod, AcequiaPaidPlanId } from '@arteytierra/config/acequia';
import { getSupabaseBrowserClient } from './db/browser';
import { URL_WEB } from './urlWeb';

/**
 * Inicia el checkout de una suscripción. La app terreno no tiene las credenciales
 * de pago; se las delega a la web (apps/web) que sí las tiene, autenticando con el
 * access token de Supabase del usuario. Devuelve/redirige a la URL de pago.
 */

export type PlanPago = AcequiaPaidPlanId;
export type Periodo = AcequiaBillingPeriod;
export type Proveedor = 'paypal' | 'mercadopago';


export async function iniciarCheckout(
  plan: PlanPago,
  periodo: Periodo,
  provider: Proveedor,
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  // Sin sesión: mandamos a registrarse y volver acá.
  if (!token) {
    const next = `/suscribir?plan=${plan}&periodo=${periodo}&pago=${provider}`;
    window.location.href = `/registro?next=${encodeURIComponent(next)}`;
    return;
  }

  const res = await fetch(`${URL_WEB}/api/terreno/checkout`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({ plan, periodo, provider }),
  });

  if (!res.ok) {
    const msg = (await res.json().catch(() => ({}))).error ?? 'No pudimos iniciar el pago.';
    throw new Error(msg);
  }
  const { url } = await res.json() as { url?: string };
  if (!url) throw new Error('No recibimos la URL de pago.');
  window.location.href = url;
}

export interface ResultadoBaja {
  /** Cancelar antes del primer cobro: nunca se cobró nada. */
  enPrueba: boolean;
  /** Si ya había un período pago en curso, el acceso sigue hasta esta fecha. */
  accesoHasta: string | null;
}

/**
 * Da de baja la renovación. La web cancela primero en Mercado Pago o PayPal y
 * recién después actualiza la cuenta, así no queda un cobro vivo sin acceso.
 */
export async function darDeBajaSuscripcion(): Promise<ResultadoBaja> {
  const supabase = getSupabaseBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('Iniciá sesión para dar de baja la suscripción.');

  const res = await fetch(`${URL_WEB}/api/terreno/suscripcion`, {
    method: 'DELETE',
    headers: { authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const msg = (await res.json().catch(() => ({}))).error ?? 'No pudimos dar de baja la suscripción.';
    throw new Error(msg);
  }
  const j = await res.json() as { enPrueba?: boolean; accesoHasta?: string | null };
  return { enPrueba: j.enPrueba ?? false, accesoHasta: j.accesoHasta ?? null };
}
