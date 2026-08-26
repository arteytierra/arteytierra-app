import { cacheGet, cacheSet } from '@/lib/db/cache';

/**
 * Búsqueda de localidad/dirección (forward geocoding) vía Nominatim (OSM).
 *
 * Es una ayuda de navegación —como "Mi ubicación"—, no un análisis: no está
 * detrás de un plan pago. Se rutea por el server (nunca desde el browser) para
 * respetar la política de uso de Nominatim: User-Agent válido + caché. Global
 * a propósito (hay predios fuera de Argentina, p.ej. Puerto Rico).
 */

const HDRS      = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
const CACHE_TTL = 60 * 60 * 24 * 30; // 30 días
const UA        = 'ArteyTierra-acequia/1.0 (https://terreno.arteytierra.org)';

interface Resultado {
  nombre: string;
  lat: number;
  lng: number;
  tipo: string;
  /** [sur, norte, oeste, este] para encuadrar el mapa cuando existe. */
  bbox?: [number, number, number, number];
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') ?? '').trim();
  if (q.length < 3) return new Response(JSON.stringify({ resultados: [] }), { status: 200, headers: HDRS });

  const dbKey = `geocode:${q.toLowerCase()}`;
  const dbHit = await cacheGet<{ raw: string }>(dbKey);
  if (dbHit?.raw) return new Response(dbHit.raw, { status: 200, headers: HDRS });

  try {
    const u = 'https://nominatim.openstreetmap.org/search'
      + `?q=${encodeURIComponent(q)}&format=jsonv2&addressdetails=1&limit=6&accept-language=es`;
    const r = await fetch(u, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(15_000) });
    if (!r.ok) return err('Servicio de búsqueda no disponible.', 503);

    const arr = await r.json() as Array<{
      display_name: string; lat: string; lon: string;
      type?: string; addresstype?: string; boundingbox?: string[];
    }>;

    const resultados: Resultado[] = arr.map(x => {
      const bb = x.boundingbox;
      const bbox: [number, number, number, number] | undefined =
        bb && bb.length === 4
          ? [parseFloat(bb[0]!), parseFloat(bb[1]!), parseFloat(bb[2]!), parseFloat(bb[3]!)]
          : undefined;
      return {
        nombre: x.display_name,
        lat: parseFloat(x.lat),
        lng: parseFloat(x.lon),
        tipo: x.addresstype ?? x.type ?? '',
        bbox: bbox && bbox.every(Number.isFinite) ? bbox : undefined,
      };
    }).filter(x => Number.isFinite(x.lat) && Number.isFinite(x.lng));

    const payload = JSON.stringify({ resultados });
    await cacheSet(dbKey, { raw: payload }, CACHE_TTL);
    return new Response(payload, { status: 200, headers: HDRS });
  } catch {
    return err('No se pudo buscar la localidad.', 503);
  }
}

function err(msg: string, status: number) {
  return new Response(JSON.stringify({ error: msg, resultados: [] }), { status, headers: HDRS });
}
