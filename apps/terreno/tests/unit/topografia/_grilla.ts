/**
 * Helper de tests del dominio "topografía": construye una GrillaElevacion
 * sintética a partir de una función de elevación f(row, col). Evita depender de
 * tiles/red — el relieve queda determinado y las aserciones son exactas.
 * Nombre con guion bajo → no lo levanta el glob `*.test.ts`.
 */
import type { GrillaElevacion } from '@/lib/grillaElevacion';

export interface BBoxLL { latMin: number; latMax: number; lngMin: number; lngMax: number; }

/** BBox chico por defecto (~1.1 km de lado a esa latitud). */
export const BBOX_DEFECTO: BBoxLL = {
  latMin: -30.010, latMax: -30.000, lngMin: -64.010, lngMax: -64.000,
};

export function grillaDesdeFn(
  rows: number,
  cols: number,
  f: (r: number, c: number) => number,
  bbox: BBoxLL = BBOX_DEFECTO,
): GrillaElevacion {
  const elev = new Float64Array(rows * cols);
  let min = Infinity, max = -Infinity;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = f(r, c);
      elev[r * cols + c] = v;
      if (!Number.isNaN(v)) { if (v < min) min = v; if (v > max) max = v; }
    }
  }
  return {
    rows, cols,
    latMin: bbox.latMin, latMax: bbox.latMax, lngMin: bbox.lngMin, lngMax: bbox.lngMax,
    elev,
    elev_min: Number.isFinite(min) ? min : 0,
    elev_max: Number.isFinite(max) ? max : 0,
  };
}

/** Rectángulo que envuelve el bbox (todos los nodos quedan adentro). */
export function poligonoQueEnvuelve(bbox: BBoxLL = BBOX_DEFECTO, eps = 0.001) {
  return [
    { lat: bbox.latMin - eps, lng: bbox.lngMin - eps },
    { lat: bbox.latMax + eps, lng: bbox.lngMin - eps },
    { lat: bbox.latMax + eps, lng: bbox.lngMax + eps },
    { lat: bbox.latMin - eps, lng: bbox.lngMax + eps },
  ];
}
