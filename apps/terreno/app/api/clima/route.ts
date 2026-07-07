import { cacheGet, cacheSet } from '@/lib/db/cache';

const HDRS      = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
const CACHE_TTL = 60 * 60 * 24 * 90; // 90 días — climatología histórica NASA POWER 1981–2023

async function openCache(): Promise<Cache | null> {
  try { return await caches.open('terreno-clima-v2'); } catch { return null; }
}

export async function GET(req: Request) {
  const p   = new URL(req.url).searchParams;
  const lat = p.get('lat');
  const lng = p.get('lng');
  if (!lat || !lng) return new Response('Missing lat/lng', { status: 400 });

  // Redondear a 2 decimales (~10 km = resolución climática POWER)
  const latR = parseFloat(lat).toFixed(2);
  const lngR = parseFloat(lng).toFixed(2);

  const cacheKey = `https://terreno-cache/clima?lat=${latR}&lng=${lngR}`;
  const dbKey    = `clima:${latR},${lngR}`;
  const cache    = await openCache();

  if (cache) {
    const hit = await cache.match(cacheKey);
    if (hit) return new Response(hit.body, { status: 200, headers: HDRS });
  }
  // Caché persistente compartido (Supabase)
  const dbHit = await cacheGet<{ raw: string }>(dbKey);
  if (dbHit?.raw) return new Response(dbHit.raw, { status: 200, headers: HDRS });

  const params = 'PRECTOTCORR,T2M,T2M_MAX,T2M_MIN,WS10M,WS10M_MAX,WD10M,RH2M,T2MDEW,T2M_RANGE,ALLSKY_SFC_SW_DWN';
  const url    = 'https://power.larc.nasa.gov/api/temporal/climatology/point'
    + `?parameters=${params}&community=AG&longitude=${lngR}&latitude=${latR}&format=JSON`;

  let res: Response;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  } catch {
    return new Response(JSON.stringify({ error: 'NASA POWER no disponible, reintentá en unos segundos.' }), { status: 503, headers: HDRS });
  }

  if (!res.ok) {
    return new Response(JSON.stringify({ error: `NASA POWER respondió con error ${res.status}.` }), { status: res.status, headers: HDRS });
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
