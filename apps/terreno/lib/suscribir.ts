'use client';

import { getSupabaseBrowserClient } from './db/browser';

/**
 * Inicia el checkout de una suscripción. La app terreno no tiene las credenciales
 * de pago; se las delega a la web (apps/web) que sí las tiene, autenticando con el
 * access token de Supabase del usuario. Devuelve/redirige a la URL de pago.
 */

export type PlanPago = 'personal' | 'disenador' | 'estudio';
export type Periodo  = 'mensual' | 'anual';
export type Proveedor = 'paypal' | 'mercadopago';

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? 'https://arteytierra.org';

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

  const res = await fetch(`${WEB_URL}/api/terreno/checkout`, {
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
