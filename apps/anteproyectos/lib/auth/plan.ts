import 'server-only';
import { cache } from 'react';
import { createSupabaseServerClient } from '@/lib/db/server';
import { PLANES, type Plan } from '@/lib/entitlements';

/**
 * Plan efectivo de un usuario, leído server-side desde
 * `anteproyectos.suscripciones`. Fuente de verdad de los entitlements:
 * nunca confiar sólo en el cliente.
 *
 * Sin fila, estado no-activo o vencida ⇒ 'semilla' (el default seguro).
 * Cacheado por request (como getCurrentUser) para no repetir la consulta.
 */
export const getPlan = cache(async (userId: string): Promise<Plan> => {
  if (!userId) return 'semilla';
  const supabase = await createSupabaseServerClient();

  const { data } = await (supabase as unknown as {
    schema: (s: string) => {
      from: (t: string) => {
        select: (c: string) => {
          eq: (k: string, v: string) => {
            maybeSingle: () => Promise<{ data: Record<string, unknown> | null }>;
          };
        };
      };
    };
  })
    .schema('anteproyectos')
    .from('suscripciones')
    .select('plan, estado, vigente_hasta')
    .eq('user_id', userId)
    .maybeSingle();

  if (!data) return 'semilla';
  if (data['estado'] !== 'activa') return 'semilla';
  const hasta = data['vigente_hasta'];
  if (hasta && new Date(hasta as string).getTime() < Date.now()) return 'semilla';

  const plan = data['plan'];
  return typeof plan === 'string' && (PLANES as readonly string[]).includes(plan)
    ? (plan as Plan) : 'semilla';
});

/** Plan del usuario actual (o 'semilla' si no hay sesión). */
export async function getPlanActual(): Promise<Plan> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ? getPlan(user.id) : 'semilla';
}
