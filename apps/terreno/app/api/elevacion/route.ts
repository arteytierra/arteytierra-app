import { SITE_ORIGIN } from '@/lib/http';
import { cacheGet, cacheSet, claveHash } from '@/lib/db/cache';
import { requiereTopoDe } from '@/lib/auth/apiGuard';
import { haDePuntos } from '@/lib/coordenadas';
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

/**
 * El guard, con la superficie que abarca el pedido.
 *
 * Antes era `requierePlan('analisis.topo')` a secas, y ahí estaba el agujero:
 * `analisis.topo` es muestra gratis en Semilla, así que el plan solo siempre
 * alcanzaba. El tope de superficie de la muestra lo aplica `requiereTopoDe`, y
 * eso estaba únicamente en `/api/dem`. Resultado: `/api/dem` respetaba las 0,5
 * ha y por `/api/elevacion` se pedía la elevación de un predio de cualquier
 * tamaño, que es el mismo dato con otra forma.
 *
 * La superficie se deduce de la envolvente de los puntos pedidos. No es la
 * superficie del predio —son puntos sueltos, no un polígono— pero es la
 * extensión de terreno sobre la que se está sacando relieve, que es justamente
 * lo que el tope quiere acotar. Un solo punto da 0 ha y pasa siempre: pedir la
 * cota de un punto no es hacer topografía.
 */
async function guardDe(coords: LatLng[]): Promise<Response | null> {
  if (coords.length === 0) return null;   // lo rechaza `responder` con un 400
  return requiereTopoDe(haDePuntos(coords));
}

export async function GET(req: Request) {
  const coords = parseLocs(new URL(req.url).searchParams.get('locations') ?? '');
  const bloqueo = await guardDe(coords);
  if (bloqueo) return bloqueo;

  return responder(coords);
}

export async function POST(req: Request) {
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

  const bloqueo = await guardDe(coords);
  if (bloqueo) return bloqueo;

  return responder(coords);
}
