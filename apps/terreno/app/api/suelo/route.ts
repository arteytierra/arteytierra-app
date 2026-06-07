export const runtime = 'edge';

const HDRS      = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
const CACHE_TTL = 60 * 60 * 24 * 30; // 30 días — SoilGrids 250 m, casi estático

async function openCache(): Promise<Cache | null> {
  try { return await caches.open('terreno-suelo-v1'); } catch { return null; }
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
  const cache    = await openCache();

  if (cache) {
    const hit = await cache.match(cacheKey);
    if (hit) return new Response(hit.body, { status: 200, headers: HDRS });
  }

  const props = ['phh2o', 'soc', 'clay', 'sand', 'silt', 'bdod', 'nitrogen'];
  const url   = 'https://rest.isric.org/soilgrids/v2.0/properties/query'
    + `?lon=${lngR}&lat=${latR}`
    + props.map(prop => `&property=${prop}`).join('')
    + '&depth=0-5cm&value=mean';

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

  return new Response(text, { status: 200, headers: HDRS });
}
