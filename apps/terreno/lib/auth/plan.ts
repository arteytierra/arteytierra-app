import 'server-only';
import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/db/server';
import { PLANES, type Plan } from '@/lib/entitlements';
import type { SuscripcionActual } from '@/lib/suscripcionEstado';

/**
 * Columnas que necesita `planEfectivo`. Se pedían con o sin `trial_end` según
 * `ACEQUIA_TRIAL_ENABLED`, de cuando la columna todavía no existía. Existe desde
 * la migración 0051, y la bandera en falso hacía que una prueba vigente se leyera
 * como Semilla: la persona entraba en la prueba y la app le mostraba el plan
 * gratis. La bandera decide si se ofrece una prueba, no si se la ve.
 */
const COLUMNAS_PLAN = 'plan, estado, vigente_hasta, trial_end';

function planEfectivo(data: Record<string, unknown> | null): Plan {
  if (!data) return 'semilla';
  const estado = data['estado'];
  if (estado === 'prueba') {
    const trialEnd = data['trial_end'];
    if (!trialEnd || new Date(trialEnd as string).getTime() <= Date.now()) return 'semilla';
  } else if (estado === 'activa') {
    const hasta = data['vigente_hasta'];
    if (hasta && new Date(hasta as string).getTime() < Date.now()) return 'semilla';
  } else {
    return 'semilla';
  }
  const plan = data['plan'];
  return typeof plan === 'string' && (PLANES as readonly string[]).includes(plan)
    ? (plan as Plan) : 'semilla';
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
      .select(COLUMNAS_PLAN)
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
    .select(COLUMNAS_PLAN)
    .eq('user_id', userId)
    .maybeSingle();

  return planEfectivo(data);
});

export type { SuscripcionActual } from '@/lib/suscripcionEstado';

/**
 * La suscripción tal cual está en la base, para mostrarla en "Mi cuenta".
 * Devuelve null si la persona nunca contrató nada (plan Semilla).
 */
export async function leerSuscripcionActual(userId: string): Promise<SuscripcionActual | null> {
  if (!userId) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await (supabase as unknown as {
    schema: (s: string) => { from: (t: string) => { select: (c: string) => {
      eq: (k: string, v: string) => { maybeSingle: () => Promise<{ data: Record<string, unknown> | null }> };
    } } };
  })
    .schema('terreno').from('suscripciones')
    .select('plan, estado, periodo, provider, vigente_hasta, trial_end, cancel_at_period_end')
    .eq('user_id', userId)
    .maybeSingle();

  if (!data) return null;
  return {
    plan: String(data['plan'] ?? 'semilla'),
    estado: String(data['estado'] ?? ''),
    periodo: (data['periodo'] as string | null) ?? null,
    provider: (data['provider'] as string | null) ?? null,
    vigenteHasta: (data['vigente_hasta'] as string | null) ?? null,
    finDePrueba: (data['trial_end'] as string | null) ?? null,
    seDaDeBajaAlFinal: Boolean(data['cancel_at_period_end']),
  };
}

/** Plan del usuario actual (o 'semilla' si no hay sesión). */
export async function getPlanActual(): Promise<Plan> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ? getPlan(user.id) : 'semilla';
}
