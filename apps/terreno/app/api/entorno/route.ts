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

/**
 * Un minuto de techo, declarado.
 *
 * Las cuatro consultas salen en paralelo, así que el techo real es la más
 * lenta, y la más lenta es Overpass: 28 s por espejo, y hay dos. Sin esta línea
 * la función corría con el techo que da la plataforma por defecto, que es más
 * corto que el presupuesto interno de esta ruta — o sea que el dato llegaba de
 * río arriba a una función que ya estaba muerta. Las otras rutas pesadas
 * —clima, dem, suelo, elevación— lo declaran desde siempre; esta se quedó sin
 * declararlo y se notó cuando Overpass se puso lento.
 */
export const maxDuration = 60;

const HDRS      = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': SITE_ORIGIN };
const CACHE_TTL = 60 * 60 * 24 * 14; // 14 días, y sólo si la respuesta vino completa
const CACHE_TTL_PARCIAL = 60 * 30;   // media hora, si algún servicio no contestó
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
  //
  // De v3 a v4 el 15/10/2026, y no por un campo nuevo: hasta hoy un fracaso de
  // Overpass se guardaba igual que un éxito, con lo cual cada punto que se miró
  // mientras el espejo estaba caído quedó con «no se pudo consultar» congelado
  // por dos semanas. Subir la versión es lo que vacía esos payloads envenenados.
  const dbKey = `entorno:v4:${lat.toFixed(3)},${lng.toFixed(3)}:${radio}`;
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

  // **Un fracaso no se guarda catorce días.** Esto se cacheaba siempre, y el
  // efecto era peor que la falla que lo originaba: un Overpass caído dejaba
  // congelado «no se pudo consultar» para ese punto durante dos semanas, y el
  // mensaje del panel invita justamente a reintentar, pero el reintento leía el
  // caché y no volvía a preguntar nunca. Si alguno de los cuatro servicios no
  // contestó, el payload vive media hora y el siguiente intento sí pregunta.
  const completo = !!ubicacion && !!bio && !!osm && contexto_actual.consultado;
  await cacheSet(dbKey, { raw: payload }, completo ? CACHE_TTL : CACHE_TTL_PARCIAL);
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

/**
 * Espejos de Overpass, en el orden en que se prueban.
 *
 * El orden cambió el 15/10/2026. `kumi.systems` estaba primero y hoy devuelve
 * **HTTP 500 a todo**, hasta a `node(1);out;` —ocho de ocho intentos, en un
 * segundo y con una página de error de Apache—, así que cada consulta pagaba
 * ese fallo antes de llegar al que sí contesta. Queda en la lista porque es un
 * espejo bueno cuando está sano y porque no cuesta nada tenerlo de segundo.
 *
 * El que contesta, `overpass-api.de`, tarda de 10 a 18 s con la consulta de
 * contexto, y es el motivo por el que esta ruta necesita `maxDuration`.
 *
 * **Lo que no se agrega, y por qué:** hay más espejos públicos, y dos clases de
 * problema que no se ven en un ping. Los regionales —`overpass.osm.ch`, por
 * ejemplo— contestan HTTP 200 en 1,4 s con `elements: []` a una consulta de
 * Argentina, porque sólo tienen su país: eso convierte un «no se pudo
 * preguntar» en un «no hay nada», que es la única cosa que esta ruta no se
 * puede permitir decir mal. Y los que sí tienen el planeta y andan rápido los
 * operan terceros a los que habría que mandarles la coordenada del predio, que
 * no es una decisión técnica.
 */
const ESPEJOS_OVERPASS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
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
        // 28 s y no 22: la consulta le declara al servidor `[timeout:25]`, o sea
        // que le damos permiso de tardar 25, y abortar a los 22 era tirar a la
        // basura trabajo que el servidor estaba terminando. El cliente tiene que
        // esperar un poco MÁS que el techo que él mismo pidió, no menos.
        signal: AbortSignal.timeout(28_000),
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
