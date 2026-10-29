import { SITE_ORIGIN } from '@/lib/http';
import { cacheGet, cacheSet, claveHash } from '@/lib/db/cache';
import { requiereTopoDe } from '@/lib/auth/apiGuard';
import { haDeBBox } from '@/lib/coordenadas';
import { obtenerGrillaDEM } from '@/lib/elevacion/grilla';
import { atribucionDe } from '@/lib/elevacion/atribucion';
import { diagnosticarMuestreo } from '@/lib/elevacion/muestreo';
import type { BBox } from '@/lib/elevacion';

// geotiff (lectura de COG por range request) requiere Node runtime.
export const runtime = 'nodejs';
export const maxDuration = 60;

const HDRS      = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': SITE_ORIGIN };
const CACHE_TTL = 60 * 60 * 24 * 30; // 30 días — el relieve es estático
const TTL_DEGRADADO = 60 * 60;       // 1 hora — una lectura escalonada se reintenta
const MAX_NODOS = 90_000;            // tope de tamaño de grilla (cols × rows)

/**
 * Grilla densa de elevación GLO-30 sobre un bbox. Devuelve `elev` row-major
 * (fila 0 = sur), con null en los nodos sin dato. El cliente (grillaElevacion.ts)
 * la usa y, si falla, cae a los tiles Terrarium.
 */
export async function GET(req: Request) {
  // El bbox se parsea ANTES del guard: la muestra gratis de topografía está
  // acotada por superficie, así que para saber si este pedido pasa hay que
  // saber cuánto terreno abarca. Se valida primero para no dejar que un bbox
  // roto llegue al cálculo de hectáreas.
  const q = new URL(req.url).searchParams;
  const w = parseFloat(q.get('w') ?? ''), s = parseFloat(q.get('s') ?? '');
  const e = parseFloat(q.get('e') ?? ''), n = parseFloat(q.get('n') ?? '');
  const cols = Math.round(parseFloat(q.get('cols') ?? ''));
  const rows = Math.round(parseFloat(q.get('rows') ?? ''));

  if (![w, s, e, n].every(Number.isFinite) || !(e > w) || !(n > s))
    return new Response(JSON.stringify({ ok: false, error: 'bbox inválido' }), { status: 400, headers: HDRS });

  const bloqueo = await requiereTopoDe(haDeBBox(w, s, e, n));
  if (bloqueo) return bloqueo;
  if (!Number.isFinite(cols) || !Number.isFinite(rows) || cols < 2 || rows < 2 || cols * rows > MAX_NODOS)
    return new Response(JSON.stringify({ ok: false, error: 'grilla inválida' }), { status: 400, headers: HDRS });

  const bbox: BBox = [w, s, e, n];
  const dbKey = await claveHash('dem', `${w.toFixed(5)},${s.toFixed(5)},${e.toFixed(5)},${n.toFixed(5)}|${cols}x${rows}`);

  const hit = await cacheGet<{ raw: string }>(dbKey);
  if (hit?.raw) return new Response(hit.raw, { status: 200, headers: HDRS });

  const grilla = await obtenerGrillaDEM(bbox, cols, rows);
  if (!grilla)
    return new Response(JSON.stringify({ ok: false, error: 'sin datos GLO-30' }), { status: 502, headers: HDRS });

  const elev = Array.from(grilla.elev, v => Number.isFinite(v) ? Math.round(v * 10) / 10 : null);
  const diag = diagnosticarMuestreo(grilla);
  const payload = JSON.stringify({
    ok: true,
    fuente: grilla.fuente,
    atribucion: atribucionDe(grilla.fuente),
    cols: grilla.cols, rows: grilla.rows,
    bbox,
    elev,
    // Quién interpoló y cuánto empata. Viaja con la grilla porque el cliente
    // calcula flujo con ella y necesita saber si puede: una grilla escalonada
    // dibuja curvas de nivel perfectamente buenas y deja el D8 sin salida.
    muestreo: grilla.muestreo,
    mesetas: Math.round(diag.mesetas * 1000) / 1000,
  });

  // Una grilla escalonada NO se guarda treinta días.
  //
  // El TTL largo está bien porque el relieve es estático, pero lo que se
  // cachea acá no es el relieve: es el resultado de una lectura que puede
  // haber salido degradada por un timeout de S3 de hace un minuto. Con 30 días,
  // un mal minuto de red deja a ese predio sin escorrentías, sin swales y sin
  // sitios de represa hasta el mes que viene, y nadie lo relaciona con la red.
  // Con una hora, el pedido siguiente vuelve a intentar la ventana COG.
  // Es el mismo criterio que ya se aplicó en /api/entorno: un fracaso no se
  // cachea como un éxito.
  await cacheSet(dbKey, { raw: payload }, diag.escalonado ? TTL_DEGRADADO : CACHE_TTL);
  return new Response(payload, { status: 200, headers: HDRS });
}
