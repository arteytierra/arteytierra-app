'use client';

/**
 * Telemetría de candados (best-effort, client-side). Registra en
 * `terreno.eventos_candado` cuándo un usuario free choca con una feature
 * bloqueada. Objetivo: saber qué candado genera más intentos y priorizar.
 *
 * Nunca rompe la UI: si falla el insert, se ignora en silencio.
 */
import { getSupabaseBrowserClient } from '@/lib/db/browser';
import type { Feature, Plan } from '@/lib/entitlements';

export type EventoCandado = 'intento' | 'modal_abierto' | 'cta_click';

export async function registrarCandado(
  feature: Feature,
  plan: Plan,
  tipo: EventoCandado,
): Promise<void> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).schema('terreno').from('eventos_candado').insert({
      user_id: user.id, feature, plan, tipo,
    });
  } catch {
    /* best-effort: la telemetría nunca interrumpe */
  }
}
