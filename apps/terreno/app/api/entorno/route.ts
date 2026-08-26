import { SITE_ORIGIN } from '@/lib/http';
import { cacheGet, cacheSet } from '@/lib/db/cache';
import { requierePlan } from '@/lib/auth/apiGuard';

/**
 * Contexto vivo del predio (D1) — datos abiertos sin clave:
 *  - Nominatim (OSM): ubicación administrativa (localidad, depto, provincia, país).
 *  - GBIF: biodiversidad observada en el radio (total, reinos, categorías IUCN, top especies).
 *  - Overpass (OSM): agua, áreas protegidas y poblado cercano — best-effort, degradación elegante.
 */

const HDRS      = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': SITE_ORIGIN };
const CACHE_TTL = 60 * 60 * 24 * 14; // 14 días
const UA        = 'ArteyTierra-acequia/1.0 (https://terreno.arteytierra.org)';

interface Body { lat?: number; lng?: number; radio_km?: number; }

export async function POST(req: Request) {
  const bloqueo = await requierePlan('analisis.entorno');
  if (bloqueo) return bloqueo;

  let b: Body;
  try { b = await req.json() as Body; } catch { return err('JSON inválido', 400); }
  const lat = b.lat, lng = b.lng;
  if (typeof lat !== 'number' || typeof lng !== 'number') return err('Faltan lat/lng.', 400);
  const radio = Math.max(1, Math.min(15, b.radio_km ?? 3));

  const dbKey = `entorno:${lat.toFixed(3)},${lng.toFixed(3)}:${radio}`;
  const dbHit = await cacheGet<{ raw: string }>(dbKey);
  if (dbHit?.raw) return new Response(dbHit.raw, { status: 200, headers: HDRS });

  const [ubicacion, bio, osm] = await Promise.all([
    reverseGeocode(lat, lng),
    gbif(lat, lng, radio),
    overpass(lat, lng, radio),
  ]);

  if (!bio && !ubicacion) return err('No se pudo obtener el contexto (servicios no disponibles).', 503);

  const payload = JSON.stringify({ ubicacion, biodiversidad: bio, osm, radio_km: radio });
  await cacheSet(dbKey, { raw: payload }, CACHE_TTL);
  return new Response(payload, { status: 200, headers: HDRS });
}

// ─── Nominatim ─────────────────────────────────────────────────────────────────
async function reverseGeocode(lat: number, lng: number) {
  try {
    const u = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=12&addressdetails=1`;
    const r = await fetch(u, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(15_000) });
    if (!r.ok) return null;
    const j = await r.json() as { address?: Record<string, string> };
    const a = j.address ?? {};
    return {
      localidad: a['village'] ?? a['town'] ?? a['city'] ?? a['municipality'] ?? a['hamlet'] ?? null,
      departamento: a['county'] ?? a['state_district'] ?? null,
      provincia: a['state'] ?? null,
      pais: a['country'] ?? null,
    };
  } catch { return null; }
}

// ─── GBIF ──────────────────────────────────────────────────────────────────────
async function gbif(lat: number, lng: number, radioKm: number) {
  try {
    const u = `https://api.gbif.org/v1/occurrence/search?geoDistance=${lat},${lng},${radioKm}km`
      + '&facet=scientificName&facetLimit=10&facet=kingdomKey&facet=iucnRedListCategory&limit=0';
    const r = await fetch(u, { signal: AbortSignal.timeout(25_000) });
    if (!r.ok) return null;
    const j = await r.json() as {
      count?: number;
      facets?: Array<{ field: string; counts: Array<{ name: string; count: number }> }>;
    };
    const facet = (f: string) => j.facets?.find(x => x.field === f)?.counts ?? [];
    return {
      total: j.count ?? 0,
      especies: facet('SCIENTIFIC_NAME').map(c => ({ nombre: c.name, obs: c.count })),
      reinos: Object.fromEntries(facet('KINGDOM_KEY').map(c => [c.name, c.count])),
      iucn: Object.fromEntries(facet('IUCN_RED_LIST_CATEGORY').map(c => [c.name, c.count])),
    };
  } catch { return null; }
}

// ─── Overpass (best-effort) ──────────────────────────────────────────────────────
async function overpass(lat: number, lng: number, radioKm: number) {
  const r = Math.round(radioKm * 1000);
  const rBig = Math.max(r, 9000);
  const q = `[out:json][timeout:18];(`
    + `way(around:${r},${lat},${lng})[waterway];`
    + `way(around:${r},${lat},${lng})[natural=water];`
    + `relation(around:${rBig},${lat},${lng})[boundary=protected_area];`
    + `way(around:${rBig},${lat},${lng})[boundary=protected_area];`
    + `node(around:${rBig},${lat},${lng})[place~"town|village|city|hamlet"];`
    + `);out tags center 80;`;
  for (const server of ['https://overpass.kumi.systems/api/interpreter', 'https://overpass-api.de/api/interpreter']) {
    try {
      const res = await fetch(server, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA },
        body: 'data=' + encodeURIComponent(q),
        signal: AbortSignal.timeout(22_000),
      });
      const ct = res.headers.get('content-type') ?? '';
      if (!res.ok || !ct.includes('json')) continue;
      const j = await res.json() as { elements?: Array<{ type: string; tags?: Record<string, string>; lat?: number; lon?: number; center?: { lat: number; lon: number } }> };
      const els = j.elements ?? [];
      const waterways = new Set<string>();
      const cuerposAgua = new Set<string>();
      const protegidas = new Set<string>();
      const poblados: Array<{ nombre: string; tipo: string; dist_km: number }> = [];
      for (const e of els) {
        const t = e.tags ?? {};
        if (t['waterway'] && t['name']) waterways.add(t['name']);
        if (t['natural'] === 'water' && t['name']) cuerposAgua.add(t['name']);
        if (t['boundary'] === 'protected_area' && t['name']) protegidas.add(t['name']);
        if (t['place'] && t['name']) {
          const c = e.center ?? { lat: e.lat, lon: e.lon };
          if (c.lat != null && c.lon != null) {
            poblados.push({ nombre: t['name'], tipo: t['place'], dist_km: Math.round(haversine(lat, lng, c.lat, c.lon) * 10) / 10 });
          }
        }
      }
      poblados.sort((a, b) => a.dist_km - b.dist_km);
      return {
        cursos_agua: [...waterways].slice(0, 8),
        cuerpos_agua: [...cuerposAgua].slice(0, 6),
        areas_protegidas: [...protegidas].slice(0, 6),
        poblados: poblados.slice(0, 5),
      };
    } catch { /* probar siguiente mirror */ }
  }
  return null;
}

function haversine(la1: number, lo1: number, la2: number, lo2: number): number {
  const R = 6371, rad = Math.PI / 180;
  const dLa = (la2 - la1) * rad, dLo = (lo2 - lo1) * rad;
  const a = Math.sin(dLa / 2) ** 2 + Math.cos(la1 * rad) * Math.cos(la2 * rad) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function err(msg: string, status: number) {
  return new Response(JSON.stringify({ error: msg }), { status, headers: HDRS });
}
