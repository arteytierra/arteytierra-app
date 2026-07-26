import 'server-only';
import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/db/server';
import type { Plan } from '@/lib/entitlements';

function planEfectivo(data: Record<string, unknown> | null): Plan {
  if (!data) return 'semilla';
  if (data['estado'] !== 'activa') return 'semilla';
  const hasta = data['vigente_hasta'];
  if (hasta && new Date(hasta as string).getTime() < Date.now()) return 'semilla';
  const plan = data['plan'];
  return plan === 'disenador' || plan === 'estudio' ? plan : 'semilla';
}

// Limpia BOM/comillas del env (ver lib/db/cache.ts).
function limpiarEnv(v: string | undefined): string {
  return (v ?? '').replace(/[﻿​]/g, '').replace(/^["']|["']$/g, '').trim();
}

/**
 * Plan de un usuario leído con service-role (bypassa RLS). Se usa donde no hay
 * sesión del dueño, p.ej. el informe público `/informe/[token]`, para decidir
 * la marca de agua según el plan de quien creó el proyecto.
 */
export async function getPlanServiceRole(userId: string): Promise<Plan> {
  const url = limpiarEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = limpiarEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!userId || !url || !key) return 'semilla';
  try {
    const svc = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await (svc as unknown as {
      schema: (s: string) => { from: (t: string) => { select: (c: string) => {
        eq: (k: string, v: string) => { maybeSingle: () => Promise<{ data: Record<string, unknown> | null }> };
      } } };
    })
      .schema('terreno').from('suscripciones')
      .select('plan, estado, vigente_hasta')
      .eq('user_id', userId)
      .maybeSingle();
    return planEfectivo(data);
  } catch {
    return 'semilla';
  }
}

/**
 * Plan efectivo de un usuario, leído server-side desde `terreno.suscripciones`.
 * Fuente de verdad de los entitlements: NUNCA confiar sólo en el cliente.
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
    .schema('terreno')
    .from('suscripciones')
    .select('plan, estado, vigente_hasta')
    .eq('user_id', userId)
    .maybeSingle();

  if (!data) return 'semilla';
  if (data['estado'] !== 'activa') return 'semilla';
  const hasta = data['vigente_hasta'];
  if (hasta && new Date(hasta as string).getTime() < Date.now()) return 'semilla';

  const plan = data['plan'];
  return plan === 'disenador' || plan === 'estudio' ? plan : 'semilla';
});

/** Plan del usuario actual (o 'semilla' si no hay sesión). */
export async function getPlanActual(): Promise<Plan> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ? getPlan(user.id) : 'semilla';
}
