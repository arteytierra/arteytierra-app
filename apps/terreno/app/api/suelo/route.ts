import { SITE_ORIGIN } from '@/lib/http';
import { cacheGet, cacheSet } from '@/lib/db/cache';
import { requierePlan } from '@/lib/auth/apiGuard';

export const runtime = 'nodejs';
export const maxDuration = 60;

const HDRS      = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': SITE_ORIGIN };
const CACHE_TTL = 60 * 60 * 24 * 30; // 30 días — SoilGrids 250 m, casi estático

/**
 * Reintentos contra la API de ISRIC.
 *
 * SoilGrids no está caído: está limitado. La REST API de ISRIC acepta unas
 * pocas llamadas por minuto y por IP, y cuando se pasa no contesta 429 sino
 * **503** o directamente deja la conexión colgada hasta que expira. Medido el
 * 25/09/2026 desde una sola máquina: 12 pedidos seguidos dieron 4 respuestas y
 * 8 fallas, en tandas —tres seguidas bien, después nada por un rato—, que es la
 * forma de un balde de fichas, no la de un servicio roto.
 *
 * Eso acá pega el doble: el proxy corre en Vercel, así que **todos los usuarios
 * de acequia comparten la misma IP** y por lo tanto el mismo cupo. Un 503 no
 * significa "no hay dato de suelo en este punto"; significa "volvé a pedirlo".
 *
 * Por eso se reintenta en vez de rendirse en el primer intento, que es lo que
 * hacía antes y lo que llegaba a la pantalla como «SoilGrids respondió 503».
 * El presupuesto total queda abajo de los 35 s que espera el cliente.
 */
const INTENTOS   = 3;
const ESPERA_MS  = [1_500, 4_000];   // entre intento 1→2 y 2→3
const TIMEOUT_MS = 10_000;           // por intento: un pedido colgado no se lleva el presupuesto

const dormir = (ms: number) => new Promise(r => setTimeout(r, ms));

/** Un 503, un 429 o un 5xx de ISRIC son transitorios; un 400 no. */
function valeReintentar(status: number): boolean {
  return status === 429 || status >= 500;
}

async function openCache(): Promise<Cache | null> {
  try { return await caches.open('terreno-suelo-v2'); } catch { return null; }
}

export async function GET(req: Request) {
  const bloqueo = await requierePlan('analisis.suelo');
  if (bloqueo) return bloqueo;

  const p   = new URL(req.url).searchParams;
  const lat = p.get('lat');
  const lng = p.get('lng');
  if (!lat || !lng) return new Response('Missing lat/lng', { status: 400 });

  // Redondear a 3 decimales (~250 m = resolución SoilGrids)
  const latR = parseFloat(lat).toFixed(3);
  const lngR = parseFloat(lng).toFixed(3);

  const cacheKey = `https://terreno-cache/suelo?lat=${latR}&lng=${lngR}`;
  const dbKey    = `suelo:${latR},${lngR}`;
  const cache    = await openCache();

  if (cache) {
    const hit = await cache.match(cacheKey);
    if (hit) return new Response(hit.body, { status: 200, headers: HDRS });
  }
  const dbHit = await cacheGet<{ raw: string }>(dbKey);
  if (dbHit?.raw) return new Response(dbHit.raw, { status: 200, headers: HDRS });

  const props  = ['phh2o', 'soc', 'clay', 'sand', 'silt', 'bdod', 'nitrogen'];
  const depths = ['0-5cm', '5-15cm', '15-30cm', '30-60cm', '60-100cm', '100-200cm'];
  const url    = 'https://rest.isric.org/soilgrids/v2.0/properties/query'
    + `?lon=${lngR}&lat=${latR}`
    + props.map(prop => `&property=${prop}`).join('')
    + depths.map(d => `&depth=${d}`).join('')
    + '&value=mean';

  // ── Pedido con reintentos (ver el comentario de INTENTOS) ──────────────────
  let res: Response | null = null;
  let ultimoStatus = 0;

  for (let intento = 0; intento < INTENTOS; intento++) {
    if (intento > 0) await dormir(ESPERA_MS[intento - 1] ?? 4_000);
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (r.ok) { res = r; break; }
      ultimoStatus = r.status;
      if (!valeReintentar(r.status)) {
        return new Response(JSON.stringify({ error: `SoilGrids rechazó la consulta (${r.status}).` }), { status: r.status, headers: HDRS });
      }
    } catch {
      ultimoStatus = 504;   // timeout o caída de conexión: también es cupo agotado
    }
  }

  if (!res) {
    // Se agotaron los intentos. El mensaje dice qué pasó y qué hacer, porque
    // "503" no le dice nada a quien está midiendo un campo: el dato existe, el
    // servicio está limitando, y el reintento es gratis.
    return new Response(JSON.stringify({
      error: 'SoilGrids (ISRIC) está limitando las consultas y no contestó en '
           + `${INTENTOS} intentos. El dato del punto existe: volvé a tocar «Analizar suelo» en un minuto. `
           + 'Cuando entre queda guardado 30 días y no se vuelve a pedir.',
      status: ultimoStatus,
    }), { status: 503, headers: HDRS });
  }

  const text = await res.text();
  if (cache) {
    await cache.put(cacheKey, new Response(text, {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${CACHE_TTL}` },
    }));
  }
  await cacheSet(dbKey, { raw: text }, CACHE_TTL);

  return new Response(text, { status: 200, headers: HDRS });
}
