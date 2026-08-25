import { SITE_ORIGIN } from '@/lib/http';
import { cacheGet, cacheSet, claveHash } from '@/lib/db/cache';
import { requierePlan } from '@/lib/auth/apiGuard';
import { obtenerGrillaDEM } from '@/lib/elevacion/grilla';
import { atribucionDe } from '@/lib/elevacion/atribucion';
import type { BBox } from '@/lib/elevacion';

// geotiff (lectura de COG por range request) requiere Node runtime.
export const runtime = 'nodejs';
export const maxDuration = 60;

const HDRS      = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': SITE_ORIGIN };
const CACHE_TTL = 60 * 60 * 24 * 30; // 30 días — el relieve es estático
const MAX_NODOS = 90_000;            // tope de tamaño de grilla (cols × rows)

/**
 * Grilla densa de elevación GLO-30 sobre un bbox. Devuelve `elev` row-major
 * (fila 0 = sur), con null en los nodos sin dato. El cliente (grillaElevacion.ts)
 * la usa y, si falla, cae a los tiles Terrarium.
 */
export async function GET(req: Request) {
  const bloqueo = await requierePlan('analisis.topo');
  if (bloqueo) return bloqueo;

  const q = new URL(req.url).searchParams;
  const w = parseFloat(q.get('w') ?? ''), s = parseFloat(q.get('s') ?? '');
  const e = parseFloat(q.get('e') ?? ''), n = parseFloat(q.get('n') ?? '');
  const cols = Math.round(parseFloat(q.get('cols') ?? ''));
  const rows = Math.round(parseFloat(q.get('rows') ?? ''));

  if (![w, s, e, n].every(Number.isFinite) || !(e > w) || !(n > s))
    return new Response(JSON.stringify({ ok: false, error: 'bbox inválido' }), { status: 400, headers: HDRS });
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
  const payload = JSON.stringify({
    ok: true,
    fuente: grilla.fuente,
    atribucion: atribucionDe(grilla.fuente),
    cols: grilla.cols, rows: grilla.rows,
    bbox,
    elev,
  });

  await cacheSet(dbKey, { raw: payload }, CACHE_TTL);
  return new Response(payload, { status: 200, headers: HDRS });
}
