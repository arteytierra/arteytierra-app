import { cacheGet, cacheSet } from '@/lib/db/cache';

const HDRS      = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
const CACHE_TTL = 60 * 60 * 24 * 30; // 30 días — SoilGrids 250 m, casi estático

async function openCache(): Promise<Cache | null> {
  try { return await caches.open('terreno-suelo-v2'); } catch { return null; }
}

export async function GET(req: Request) {
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

  let res: Response;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  } catch {
    return new Response(JSON.stringify({ error: 'SoilGrids no disponible, reintentá en unos segundos.' }), { status: 503, headers: HDRS });
  }

  if (!res.ok) {
    const msg = res.status === 429
      ? 'SoilGrids saturado, reintentá en unos segundos.'
      : `SoilGrids respondió ${res.status}.`;
    return new Response(JSON.stringify({ error: msg }), { status: res.status, headers: HDRS });
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
