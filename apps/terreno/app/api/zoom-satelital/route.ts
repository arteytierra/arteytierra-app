/**
 * Zoom máximo con imagen satelital real para un punto (Esri World Imagery).
 *
 * Esri no devuelve 404 cuando no tiene imagen a ese nivel: responde 200 con una
 * tesela que dice "Map data not yet available". Es siempre el mismo archivo, en
 * cualquier lugar del mundo, así que se la reconoce por su hash y se busca el
 * nivel más profundo que trae imagen de verdad.
 *
 * Sin esto, el mapa pedía z19 en todos lados y en el campo (donde la cobertura
 * llega a z18) el cartel tapaba el terreno.
 */
import { createHash } from 'crypto';
import { ipDe, limitar, demasiadasSolicitudes } from '@/lib/rateLimit';

/** md5 (10 hex) de la tesela "Map data not yet available", 2521 bytes. */
const PLACEHOLDER = 'f27d9de7f8';

const Z_MAX = 21;
const Z_MIN = 14;

function coordsATesela(lat: number, lng: number, z: number) {
  const n = 2 ** z;
  const x = Math.floor(((lng + 180) / 360) * n);
  const r = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n);
  return { x, y };
}

async function tieneImagen(lat: number, lng: number, z: number): Promise<boolean> {
  const { x, y } = coordsATesela(lat, lng, z);
  const res = await fetch(
    `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`,
    { signal: AbortSignal.timeout(8_000) },
  );
  if (!res.ok) return false;
  const buf = Buffer.from(await res.arrayBuffer());
  return createHash('md5').update(buf).digest('hex').slice(0, 10) !== PLACEHOLDER;
}

export async function GET(req: Request) {
  // Sonda cara (hasta 8 fetches salientes por llamada). Se llama al elegir un
  // punto, no en ráfaga, así que 30/min por IP no molesta a un usuario real.
  if (!limitar(`zoom:${ipDe(req)}`, 30, 60_000)) return demasiadasSolicitudes();

  const p = new URL(req.url).searchParams;
  const lat = Number(p.get('lat'));
  const lng = Number(p.get('lng'));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return Response.json({ error: 'lat/lng requeridos' }, { status: 400 });
  }

  let zoom = Z_MIN;
  for (let z = Z_MAX; z >= Z_MIN; z--) {
    try {
      if (await tieneImagen(lat, lng, z)) { zoom = z; break; }
    } catch { /* red caída: seguimos bajando */ }
  }

  return Response.json({ zoom }, {
    headers: {
      // La cobertura cambia cada muchos meses; el CDN puede guardarla una semana.
      'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
    },
  });
}
