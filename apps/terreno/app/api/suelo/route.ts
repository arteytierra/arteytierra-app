import { SITE_ORIGIN } from '@/lib/http';
import { cacheGet, cacheSet } from '@/lib/db/cache';
import { requierePlan } from '@/lib/auth/apiGuard';
import { perfilSoilGridsCog } from '@/lib/soilgridsCog';

export const runtime = 'nodejs';
export const maxDuration = 60;

const HDRS      = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': SITE_ORIGIN };
const CACHE_TTL = 60 * 60 * 24 * 30; // 30 días — SoilGrids es casi estático

/**
 * Suelo del punto, de SoilGrids 2.0 (ISRIC), por dos caminos.
 *
 * **Primero los rásters** (`lib/soilgridsCog.ts`): `files.isric.org` es un
 * servidor de archivos estáticos, sin cupo, y los COG se leen por `Range` sin
 * bajarlos. Cuesta 1 km de resolución en vez de 250 m.
 *
 * **Y si eso falla, la API de consulta.** `rest.isric.org` da los 250 m, pero
 * tiene cupo por IP y el proxy corre en Vercel, así que **todos los usuarios de
 * acequia comparten el mismo cupo**. Medido el 25/09/2026 desde una sola
 * máquina: 12 pedidos seguidos dieron 4 respuestas y 8 fallas, en tandas —tres
 * seguidas bien, después nada por un rato—, que es la forma de un balde de
 * fichas, no la de un servicio roto. Por eso pasó de ser el camino principal a
 * ser el respaldo, y por eso sigue con reintentos.
 *
 * El orden importa para el modo de falla, no para la calidad: con los rásters
 * primero, un pico de usuarios ya no se traduce en «SoilGrids respondió 503».
 */
const INTENTOS   = 3;
const ESPERA_MS  = [1_500, 4_000];   // entre intento 1→2 y 2→3
const TIMEOUT_MS = 10_000;           // por intento: un pedido colgado no se lleva el presupuesto

/**
 * Presupuesto total de la ruta, en ms.
 *
 * Son dos caminos en serie, así que el reparto tiene que ser explícito o el
 * primero se come al segundo. El cliente corta a los 45 s (ver
 * `desdeSoilGrids` en `lib/suelos.ts`) y `maxDuration` son 60: con 40 s de tope
 * el cliente siempre recibe una respuesta nuestra —aunque sea el error que
 * explica qué hacer— en vez de cortar por su cuenta.
 *
 * La lectura de los rásters se lleva hasta 28 s (medida: 15,7 s en frío desde
 * Argentina, ~0,3 s con la lambda tibia) y lo que sobre queda para la API de
 * consulta, salteando los intentos que ya no entran.
 */
const PRESUPUESTO_MS = 40_000;
const PRESUPUESTO_COG_MS = 28_000;

const dormir = (ms: number) => new Promise(r => setTimeout(r, ms));

/** Un 503, un 429 o un 5xx de ISRIC son transitorios; un 400 no. */
function valeReintentar(status: number): boolean {
  return status === 429 || status >= 500;
}

async function openCache(): Promise<Cache | null> {
  try { return await caches.open('terreno-suelo-v2'); } catch { return null; }
}

const PROPS  = ['phh2o', 'soc', 'clay', 'sand', 'silt', 'bdod', 'nitrogen'];
const DEPTHS = ['0-5cm', '5-15cm', '15-30cm', '30-60cm', '60-100cm', '100-200cm'];

/**
 * Camino de respaldo: la REST API de ISRIC a 250 m, con reintentos.
 * Devuelve el cuerpo crudo, o `null` si se agotaron los intentos.
 */
async function desdeRestApi(latR: string, lngR: string, restanteMs: () => number): Promise<{ texto: string } | { status: number }> {
  const url = 'https://rest.isric.org/soilgrids/v2.0/properties/query'
    + `?lon=${lngR}&lat=${latR}`
    + PROPS.map(prop => `&property=${prop}`).join('')
    + DEPTHS.map(d => `&depth=${d}`).join('')
    + '&value=mean';

  let ultimoStatus = 0;
  for (let intento = 0; intento < INTENTOS; intento++) {
    const espera = intento > 0 ? (ESPERA_MS[intento - 1] ?? 4_000) : 0;
    // Un intento que no entra en el presupuesto no se empieza: terminar a tiempo
    // con un mensaje que explica qué pasó es mejor que que el cliente corte solo.
    if (restanteMs() < espera + 2_000) break;
    if (espera) await dormir(espera);
    try {
      const tope = Math.min(TIMEOUT_MS, Math.max(1_000, restanteMs()));
      const r = await fetch(url, { signal: AbortSignal.timeout(tope) });
      if (r.ok) return { texto: await r.text() };
      ultimoStatus = r.status;
      if (!valeReintentar(r.status)) return { status: r.status };
    } catch {
      ultimoStatus = 504;   // timeout o caída de conexión: también es cupo agotado
    }
  }
  return { status: ultimoStatus || 503 };
}

/** Rechaza a los `ms`, para ponerle techo a la lectura de los rásters. */
function vencimiento(ms: number): Promise<never> {
  return new Promise((_, rechazar) => setTimeout(() => rechazar(new Error('presupuesto agotado')), ms));
}

export async function GET(req: Request) {
  const arranque = Date.now();
  const restanteMs = () => PRESUPUESTO_MS - (Date.now() - arranque);

  const bloqueo = await requierePlan('analisis.suelo');
  if (bloqueo) return bloqueo;

  const p   = new URL(req.url).searchParams;
  const lat = p.get('lat');
  const lng = p.get('lng');
  if (!lat || !lng) return new Response('Missing lat/lng', { status: 400 });

  const latN = parseFloat(lat);
  const lngN = parseFloat(lng);
  if (!Number.isFinite(latN) || !Number.isFinite(lngN)) return new Response('Bad lat/lng', { status: 400 });
  if (latN < -90 || latN > 90) return new Response('lat fuera de rango', { status: 400 });

  // Redondear a 3 decimales (~110 m): la clave de caché no puede ser más fina
  // que el dato, o se guardan mil entradas idénticas del mismo píxel.
  const latR = latN.toFixed(3);
  const lngR = lngN.toFixed(3);

  const cacheKey = `https://terreno-cache/suelo?lat=${latR}&lng=${lngR}`;
  const dbKey    = `suelo:${latR},${lngR}`;
  const cache    = await openCache();

  if (cache) {
    const hit = await cache.match(cacheKey);
    if (hit) return new Response(hit.body, { status: 200, headers: HDRS });
  }
  // Las entradas viejas son respuestas de la REST API a 250 m y siguen siendo
  // válidas: no traen `_acequia` y el cliente las lee como lo que son.
  const dbHit = await cacheGet<{ raw: string }>(dbKey);
  if (dbHit?.raw) return new Response(dbHit.raw, { status: 200, headers: HDRS });

  let texto: string | null = null;

  try {
    const perfil = await Promise.race([
      perfilSoilGridsCog(parseFloat(latR), parseFloat(lngR)),
      vencimiento(Math.min(PRESUPUESTO_COG_MS, restanteMs())),
    ]);
    texto = JSON.stringify(perfil);
  } catch {
    texto = null;   // se cayó o tardó demasiado: va por la API de consulta
  }

  if (texto === null) {
    const r = await desdeRestApi(latR, lngR, restanteMs);
    if ('texto' in r) {
      texto = r.texto;
    } else if (!valeReintentar(r.status)) {
      return new Response(JSON.stringify({ error: `SoilGrids rechazó la consulta (${r.status}).` }), { status: r.status, headers: HDRS });
    } else {
      // Se cayeron los dos caminos. El mensaje dice qué pasó y qué hacer, porque
      // "503" no le dice nada a quien está midiendo un campo.
      return new Response(JSON.stringify({
        error: 'No se pudo leer SoilGrids (ISRIC) ni desde los rásters ni desde la API de '
             + 'consulta. El dato del punto existe: volvé a tocar «Analizar suelo» en un minuto. '
             + 'Cuando entre queda guardado 30 días y no se vuelve a pedir.',
        status: r.status,
      }), { status: 503, headers: HDRS });
    }
  }

  if (cache) {
    await cache.put(cacheKey, new Response(texto, {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${CACHE_TTL}` },
    }));
  }
  await cacheSet(dbKey, { raw: texto }, CACHE_TTL);

  return new Response(texto, { status: 200, headers: HDRS });
}
