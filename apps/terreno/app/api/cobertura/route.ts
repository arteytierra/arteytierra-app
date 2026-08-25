import { SITE_ORIGIN } from '@/lib/http';
import { cacheGet, cacheSet } from '@/lib/db/cache';
import { requierePlan } from '@/lib/auth/apiGuard';

/**
 * Cobertura del suelo (C3) — ESA WorldCover 10 m vía Microsoft Planetary Computer.
 * Busca el ítem WorldCover que cubre el predio (STAC) y pide el histograma de
 * clases del polígono (titiler statistics, modo categórico). Sin API key.
 */

const HDRS      = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': SITE_ORIGIN };
const CACHE_TTL = 60 * 60 * 24 * 90; // 90 días — WorldCover es un mapa anual estático
const MPC       = 'https://planetarycomputer.microsoft.com/api/';

interface Body { mojones?: Array<{ lat: number; lng: number }>; }

export async function POST(req: Request) {
  const bloqueo = await requierePlan('analisis.cobertura');
  if (bloqueo) return bloqueo;

  let body: Body;
  try { body = await req.json() as Body; } catch { return err('JSON inválido', 400); }
  const moj = body.mojones ?? [];
  if (moj.length < 3) return err('Se necesitan al menos 3 mojones.', 400);

  // Centroide para clave de caché y búsqueda del tile
  const cLat = moj.reduce((s, m) => s + m.lat, 0) / moj.length;
  const cLng = moj.reduce((s, m) => s + m.lng, 0) / moj.length;
  const area = bboxArea(moj);
  const dbKey = `cobertura:${cLat.toFixed(3)},${cLng.toFixed(3)}:${area}`;

  const dbHit = await cacheGet<{ raw: string }>(dbKey);
  if (dbHit?.raw) return new Response(dbHit.raw, { status: 200, headers: HDRS });

  // 1) STAC — ítem WorldCover 2021 que cubre el centroide
  let items: Array<{ id: string; year: number }> = [];
  try {
    const r = await fetch(`${MPC}stac/v1/search`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ collections: ['esa-worldcover'], intersects: { type: 'Point', coordinates: [cLng, cLat] }, limit: 5 }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!r.ok) return err(`Planetary Computer respondió ${r.status}.`, 502);
    const js = await r.json() as { features?: Array<{ id: string; properties?: Record<string, unknown> }> };
    items = (js.features ?? []).map(f => ({
      id: f.id,
      year: f.id.includes('2021') ? 2021 : f.id.includes('2020') ? 2020 : 0,
    })).sort((a, b) => b.year - a.year);
  } catch {
    return err('No se pudo consultar la cobertura (Planetary Computer no disponible).', 503);
  }
  if (items.length === 0) return err('Sin datos de cobertura para esta ubicación.', 404);
  const item = items[0]!;

  // 2) titiler statistics — histograma categórico del polígono
  const ring = moj.map(m => [m.lng, m.lat]);
  ring.push(ring[0]!);
  const feature = { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring] } };
  const statsUrl = `${MPC}data/v1/item/statistics?collection=esa-worldcover&item=${item.id}&assets=map&categorical=true`;

  let stats: unknown;
  try {
    const r = await fetch(statsUrl, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(feature), signal: AbortSignal.timeout(40_000),
    });
    if (!r.ok) return err(`No se pudo calcular la cobertura (${r.status}).`, 502);
    stats = await r.json();
  } catch {
    return err('El cálculo de cobertura tardó demasiado, reintentá.', 503);
  }

  // Extrae histograma [[counts],[classValues]]
  const hist = (stats as { properties?: { statistics?: { map_b1?: { histogram?: [number[], number[]] } } } })
    ?.properties?.statistics?.map_b1?.histogram;
  if (!hist || !hist[0] || !hist[1]) return err('Respuesta de cobertura sin datos.', 502);

  const payload = JSON.stringify({ counts: hist[0], clases: hist[1], item: item.id, year: item.year });
  await cacheSet(dbKey, { raw: payload }, CACHE_TTL);
  return new Response(payload, { status: 200, headers: HDRS });
}

function err(msg: string, status: number) {
  return new Response(JSON.stringify({ error: msg }), { status, headers: HDRS });
}

function bboxArea(moj: Array<{ lat: number; lng: number }>): number {
  const lats = moj.map(m => m.lat), lngs = moj.map(m => m.lng);
  const d = (Math.max(...lats) - Math.min(...lats)) * (Math.max(...lngs) - Math.min(...lngs));
  return Math.round(d * 1e6); // clave estable, no exacta
}
