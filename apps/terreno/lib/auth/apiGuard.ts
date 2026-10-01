import 'server-only';
import { SITE_ORIGIN } from '@/lib/http';
import { getPlan } from './plan';
import { createSupabaseServerClient } from '@/lib/db/server';
import {
  can, planMinimo, NOMBRE_PLAN, acequiaTopoPermitida, ACEQUIA_TOPO_SEMILLA_HA,
  type Feature,
} from '@/lib/entitlements';

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
      upgrade: 'https://acequia.app/planes',
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

/**
 * Guard de la topografía, que además del plan mira el TAMAÑO del predio.
 *
 * La muestra gratis de Semilla está acotada a `ACEQUIA_TOPO_SEMILLA_HA`
 * (ver `packages/config/src/acequia.ts`), así que el plan solo no alcanza para
 * decidir: hay que saber qué superficie se está pidiendo.
 *
 * Desde el 01/10/2026 lo aplican los DOS endpoints que sacan relieve:
 * `/api/dem` con el bbox que recibe, y `/api/elevacion` con la envolvente de los
 * puntos pedidos. Antes `/api/elevacion` usaba `requierePlan('analisis.topo')` a
 * secas, que en Semilla siempre alcanza, así que el tope de superficie se
 * esquivaba pidiendo el mismo dato con otra forma.
 *
 * Lo que QUEDA afuera a propósito: `/api/terrarium`. No lleva candado, y el
 * porqué está escrito en esa ruta — no se puede aplicar un tope de superficie
 * por tesela, y el bucket de AWS Open Data que sirve se lee sin clave y sin
 * nosotros, así que cerrarlo no le negaría el dato a nadie. Ahí lo que se
 * protege es el ancho de banda propio, con un límite por IP.
 */
export async function requiereTopoDe(haDelPedido: number): Promise<Response | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json(401, { error: 'Necesitás iniciar sesión.' });

    const plan = await getPlan(user.id);
    if (acequiaTopoPermitida(plan, haDelPedido)) return null;

    const min = planMinimo('analisis.topo_sin_limite');
    return json(403, {
      error: `La muestra gratis de topografía llega hasta ${ACEQUIA_TOPO_SEMILLA_HA} ha `
        + `y este predio tiene ${haDelPedido.toFixed(1)} ha. `
        + `Sin tope de tamaño está en el plan ${NOMBRE_PLAN[min]}.`,
      feature: 'analisis.topo_sin_limite',
      plan_minimo: min,
      tope_ha: ACEQUIA_TOPO_SEMILLA_HA,
      upgrade: 'https://acequia.app/planes',
    });
  } catch (e) {
    const ref = Math.random().toString(36).slice(2, 8).toUpperCase();
    console.error(`[requiereTopoDe ${ref}]`, e);
    return json(500, {
      error: `No pudimos verificar tu sesión. Probá recargar la página; si sigue pasando, avisanos con el código ${ref}.`,
      ref,
    });
  }
}
