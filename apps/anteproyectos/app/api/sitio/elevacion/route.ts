/**
 * Grilla de elevación para la capa de mapa "Elevación" (Fase A4) — dado el
 * bbox visible del mapa, devuelve una grilla densa vía `@arteytierra/dem`
 * (GLO-30 con fallback a fuentes nacionales/SRTM, ver Fase A0). El cliente
 * la pinta como overlay de canvas; el fetch de los COGs corre acá porque
 * `geotiff` es server-only.
 */
import { obtenerGrillaDEM, type BBox } from '@arteytierra/dem';

const HDRS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

const LADO_GRILLA = 40; // 40x40 celdas: suficiente detalle visual, liviano para requests frecuentes al mover el mapa

export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const w = parseFloat(p.get('w') ?? '');
  const s = parseFloat(p.get('s') ?? '');
  const e = parseFloat(p.get('e') ?? '');
  const n = parseFloat(p.get('n') ?? '');
  if ([w, s, e, n].some(Number.isNaN)) {
    return new Response(JSON.stringify({ error: 'Faltan w/s/e/n (bbox) válidos.' }), { status: 400, headers: HDRS });
  }

  const bbox: BBox = [w, s, e, n];

  let grilla;
  try {
    grilla = await obtenerGrillaDEM(bbox, LADO_GRILLA, LADO_GRILLA);
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Error obteniendo el DEM.' }), {
      status: 502,
      headers: HDRS,
    });
  }

  if (!grilla) {
    return new Response(JSON.stringify({ error: 'Sin datos de elevación para esta zona.' }), { status: 404, headers: HDRS });
  }

  return new Response(
    JSON.stringify({
      rows: grilla.rows,
      cols: grilla.cols,
      bbox: grilla.bbox,
      elev: Array.from(grilla.elev),
      fuente: grilla.fuente,
    }),
    { headers: HDRS },
  );
}
