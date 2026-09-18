import { SITE_ORIGIN } from '@/lib/http';
import { cacheGet, cacheSet } from '@/lib/db/cache';
import { requierePlan } from '@/lib/auth/apiGuard';
import {
  agrupar, consultaOverpass, distanciaKm, hayTruncamiento, RADIO_CONTEXTO_KM,
  type ContextoActual, type RasgoCrudo,
} from '@/lib/contextoActual';

/**
 * Contexto vivo del predio (D1) — datos abiertos sin clave:
 *  - Nominatim (OSM): ubicación administrativa (localidad, depto, provincia, país).
 *  - GBIF: biodiversidad observada en el radio (total, reinos, categorías IUCN, top especies).
 *  - Overpass (OSM): agua, áreas protegidas y poblado cercano — best-effort, degradación elegante.
 *  - Overpass (OSM): contexto actual — qué actividad industrial hay en 25 km y qué
 *    ductos y líneas de alta tensión pasan en 10 km, a qué distancia y en qué
 *    rumbo. Sin nombres: ver `lib/contextoActual.ts`.
 *
 * Las cuatro consultas salen en paralelo, así que el techo de tiempo es la más
 * lenta y no la suma.
 */

const HDRS      = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': SITE_ORIGIN };
const CACHE_TTL = 60 * 60 * 24 * 14; // 14 días
const UA        = `ArteyTierra-acequia/1.0 (${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://terreno.arteytierra.org'})`;

interface Body { lat?: number; lng?: number; radio_km?: number; }

export async function POST(req: Request) {
  const bloqueo = await requierePlan('analisis.entorno');
  if (bloqueo) return bloqueo;

  let b: Body;
  try { b = await req.json() as Body; } catch { return err('JSON inválido', 400); }
  const lat = b.lat, lng = b.lng;
  if (typeof lat !== 'number' || typeof lng !== 'number') return err('Faltan lat/lng.', 400);
  const radio = Math.max(1, Math.min(15, b.radio_km ?? 3));

  // La versión va en la clave a propósito: el caché guarda el JSON ya armado, así
  // que un payload viejo no tiene los campos nuevos y los devolvería faltando
  // durante catorce días. Subirla es la forma de que el campo nuevo se vea hoy.
  const dbKey = `entorno:v3:${lat.toFixed(3)},${lng.toFixed(3)}:${radio}`;
  const dbHit = await cacheGet<{ raw: string }>(dbKey);
  if (dbHit?.raw) return new Response(dbHit.raw, { status: 200, headers: HDRS });

  const [ubicacion, bio, osm, contexto_actual] = await Promise.all([
    reverseGeocode(lat, lng),
    gbif(lat, lng, radio),
    overpass(lat, lng, radio),
    contextoActual(lat, lng),
  ]);

  if (!bio && !ubicacion) return err('No se pudo obtener el contexto (servicios no disponibles).', 503);

  const payload = JSON.stringify({ ubicacion, biodiversidad: bio, osm, contexto_actual, radio_km: radio });
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
      // En Chile la comuna —la unidad del censo— cae acá cuando el punto está
      // en una conurbación: Ñuñoa y Maipú devuelven `city: "Santiago"`.
      comuna: a['suburb'] ?? a['city_district'] ?? null,
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

// ─── Overpass ────────────────────────────────────────────────────────────────

const ESPEJOS_OVERPASS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
];

/**
 * Le pregunta a Overpass, probando el segundo espejo si el primero falla.
 *
 * `null` es "no se pudo preguntar" y `[]` es "no hay nada": la diferencia importa
 * río abajo, porque de una lista vacía el panel afirma algo y de un `null` no.
 */
async function pedirOverpass(q: string): Promise<RasgoCrudo[] | null> {
  for (const server of ESPEJOS_OVERPASS) {
    try {
      const res = await fetch(server, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA },
        body: 'data=' + encodeURIComponent(q),
        signal: AbortSignal.timeout(22_000),
      });
      const ct = res.headers.get('content-type') ?? '';
      if (!res.ok || !ct.includes('json')) continue;
      const j = await res.json() as { elements?: RasgoCrudo[] };
      return j.elements ?? [];
    } catch { /* probar siguiente espejo */ }
  }
  return null;
}

/** Contexto actual: qué actividad industrial hay alrededor. Ver `lib/contextoActual.ts`. */
async function contextoActual(lat: number, lng: number): Promise<ContextoActual> {
  const els = await pedirOverpass(consultaOverpass(lat, lng, RADIO_CONTEXTO_KM));
  if (!els) {
    return { radio_km: RADIO_CONTEXTO_KM, presencias: [], consultado: false, truncado: false };
  }
  return {
    radio_km: RADIO_CONTEXTO_KM,
    presencias: agrupar(els, lat, lng),
    consultado: true,
    truncado: hayTruncamiento(els),
  };
}

/** Agua, áreas protegidas y poblados cercanos — best-effort. */
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
  const els = await pedirOverpass(q);
  if (!els) return null;

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
        poblados.push({ nombre: t['name'], tipo: t['place'], dist_km: Math.round(distanciaKm(lat, lng, c.lat, c.lon) * 10) / 10 });
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
}

function err(msg: string, status: number) {
  return new Response(JSON.stringify({ error: msg }), { status, headers: HDRS });
}
