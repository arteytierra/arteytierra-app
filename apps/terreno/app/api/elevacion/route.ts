import { SITE_ORIGIN } from '@/lib/http';
import { cacheGet, cacheSet, claveHash } from '@/lib/db/cache';
import { requierePlan } from '@/lib/auth/apiGuard';
import { obtenerElevacionPuntos } from '@/lib/elevacion';
import { atribucionDe } from '@/lib/elevacion/atribucion';
import type { LatLng } from '@/lib/elevacion';

// geotiff (lectura de COG por range request) requiere Node runtime.
export const runtime = 'nodejs';
export const maxDuration = 30;

const HDRS      = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': SITE_ORIGIN };
const CACHE_TTL = 60 * 60 * 24 * 30; // 30 días — el relieve es estático

function parseLocs(raw: string): LatLng[] {
  return raw
    .split('|')
    .map(s => s.trim())
    .filter(Boolean)
    .map(pair => {
      const [a, b] = pair.split(',').map(n => parseFloat(n));
      return { lat: a!, lng: b! };
    })
    .filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng));
}

// Clave canónica: coords a 4 decimales (~11 m), ordenadas.
function claveCanonica(coords: LatLng[]): string {
  return coords.map(c => `${c.lat.toFixed(4)},${c.lng.toFixed(4)}`).sort().join('|');
}

async function responder(coords: LatLng[]): Promise<Response> {
  if (coords.length === 0) return new Response('Missing locations', { status: 400, headers: HDRS });

  const dbKey = await claveHash('elev2', claveCanonica(coords));
  const hit = await cacheGet<{ raw: string }>(dbKey);
  if (hit?.raw) return new Response(hit.raw, { status: 200, headers: HDRS });

  const { elevaciones, fuente } = await obtenerElevacionPuntos(coords);

  const payload = JSON.stringify({
    status: 'OK',
    results: coords.map((c, i) => ({
      elevation: elevaciones[i] ?? null,
      location: { lat: c.lat, lng: c.lng },
    })),
    fuente,
    atribucion: atribucionDe(fuente),
  });

  await cacheSet(dbKey, { raw: payload }, CACHE_TTL);
  return new Response(payload, { status: 200, headers: HDRS });
}

export async function GET(req: Request) {
  const bloqueo = await requierePlan('analisis.topo');
  if (bloqueo) return bloqueo;

  const locations = new URL(req.url).searchParams.get('locations') ?? '';
  return responder(parseLocs(locations));
}

export async function POST(req: Request) {
  const bloqueo = await requierePlan('analisis.topo');
  if (bloqueo) return bloqueo;

  const body = await req.json() as { locations: unknown };

  let coords: LatLng[];
  if (Array.isArray(body.locations)) {
    if (body.locations.length > 500) return new Response('Max 500 locations por request', { status: 400, headers: HDRS });
    coords = (body.locations as Array<{ latitude: number; longitude: number }>)
      .map(l => ({ lat: l.latitude, lng: l.longitude }))
      .filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng));
  } else {
    coords = parseLocs(String(body.locations));
  }

  return responder(coords);
}
