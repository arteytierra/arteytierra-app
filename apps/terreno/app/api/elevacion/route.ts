import { cacheGet, cacheSet, claveHash } from '@/lib/db/cache';

const BASE      = 'https://api.opentopodata.org/v1/srtm30m';
const HDRS      = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
const CACHE_TTL = 60 * 60 * 24 * 30; // 30 días — SRTM es estático

async function openCache(): Promise<Cache | null> {
  try { return await caches.open('terreno-elevacion-v1'); } catch { return null; }
}

// Redondea cada coordenada a 4 decimales (~11 m) y ordena para clave canónica
function normalizeLocs(raw: string): string {
  return raw
    .split('|')
    .map(pair => pair.trim().split(',').map(n => parseFloat(n).toFixed(4)).join(','))
    .filter(Boolean)
    .sort()
    .join('|');
}

export async function GET(req: Request) {
  const locations = new URL(req.url).searchParams.get('locations') ?? '';
  if (!locations) return new Response('Missing locations', { status: 400 });

  const normed   = normalizeLocs(locations);
  const cacheKey = `https://terreno-cache/elevacion?locs=${encodeURIComponent(normed)}`;
  const dbKey    = await claveHash('elev', normed);
  const cache    = await openCache();

  if (cache) {
    const hit = await cache.match(cacheKey);
    if (hit) return new Response(hit.body, { status: 200, headers: HDRS });
  }
  const dbHit = await cacheGet<{ raw: string }>(dbKey);
  if (dbHit?.raw) return new Response(dbHit.raw, { status: 200, headers: HDRS });

  const res  = await fetch(`${BASE}?locations=${encodeURIComponent(locations)}`, { signal: AbortSignal.timeout(25_000) });
  const text = await res.text();

  if (res.ok && cache) {
    await cache.put(cacheKey, new Response(text, {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${CACHE_TTL}` },
    }));
  }
  if (res.ok) await cacheSet(dbKey, { raw: text }, CACHE_TTL);

  return new Response(text, { status: res.status, headers: HDRS });
}

export async function POST(req: Request) {
  const body = await req.json() as { locations: unknown };

  let locs: string;
  if (Array.isArray(body.locations)) {
    const arr = body.locations as Array<{ latitude: number; longitude: number }>;
    if (arr.length > 100) return new Response('Max 100 locations por request', { status: 400 });
    locs = arr.map(l => `${l.latitude},${l.longitude}`).join('|');
  } else {
    locs = String(body.locations);
  }

  const normed   = normalizeLocs(locs);
  const cacheKey = `https://terreno-cache/elevacion?locs=${encodeURIComponent(normed)}`;
  const dbKey    = await claveHash('elev', normed);
  const cache    = await openCache();

  if (cache) {
    const hit = await cache.match(cacheKey);
    if (hit) return new Response(hit.body, { status: 200, headers: HDRS });
  }
  const dbHit = await cacheGet<{ raw: string }>(dbKey);
  if (dbHit?.raw) return new Response(dbHit.raw, { status: 200, headers: HDRS });

  const res  = await fetch(`${BASE}?locations=${encodeURIComponent(locs)}`, { signal: AbortSignal.timeout(30_000) });
  const text = await res.text();

  if (res.ok && cache) {
    await cache.put(cacheKey, new Response(text, {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${CACHE_TTL}` },
    }));
  }
  if (res.ok) await cacheSet(dbKey, { raw: text }, CACHE_TTL);

  return new Response(text, { status: res.status, headers: HDRS });
}
