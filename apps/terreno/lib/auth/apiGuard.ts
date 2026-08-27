import 'server-only';
import { SITE_ORIGIN } from '@/lib/http';
import { getPlan } from './plan';
import { createSupabaseServerClient } from '@/lib/db/server';
import { can, planMinimo, NOMBRE_PLAN, type Feature } from '@/lib/entitlements';

/**
 * Guard de plan para las rutas /api/* con costo (llaman a APIs externas).
 * El bloqueo visual en el cliente no alcanza: sin esto, un usuario Semilla
 * podría pegarle directo al endpoint. Devuelve una `Response` 401/403 lista
 * para retornar, o `null` si el plan alcanza y la ruta debe continuar.
 *
 *   const bloqueo = await requierePlan('analisis.suelo');
 *   if (bloqueo) return bloqueo;
 */
export async function requierePlan(feature: Feature): Promise<Response | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return json(401, { error: 'Necesitás iniciar sesión.' });
    }

    const plan = await getPlan(user.id);
    if (can(plan, feature)) return null;

    const min = planMinimo(feature);
    return json(403, {
      error: `Esta función está incluida en el plan ${NOMBRE_PLAN[min]}.`,
      feature,
      plan_minimo: min,
      upgrade: 'https://arteytierra.org/terreno#planes',
    });
  } catch (e) {
    // Sin este catch, cualquier excepción (env corrupto, Supabase caído, undici)
    // sale como un 500 opaco de Next y el cliente sólo ve "respondió 500" o
    // "Unexpected end of JSON input", sin pista de la causa.
    //
    // El detalle va a donde sirve —los Runtime Logs de Vercel— y NO al cliente:
    // el mensaje interno de una excepción de auth puede filtrar nombres de env,
    // hosts o fragmentos de configuración. Al usuario le queda un código corto
    // para que, si reporta el problema, se pueda encontrar la línea del log.
    const ref = Math.random().toString(36).slice(2, 8).toUpperCase();
    console.error(`[requierePlan ${ref}] feature=${feature}`, e);
    return json(500, {
      error: `No pudimos verificar tu sesión. Probá recargar la página; si sigue pasando, avisanos con el código ${ref}.`,
      ref,
    });
  }
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': SITE_ORIGIN },
  });
}
