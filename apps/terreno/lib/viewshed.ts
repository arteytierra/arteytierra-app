/**
 * Visibilidad / viewshed (D7) — área visible desde un punto de observación
 * sobre la grilla de elevación densa (DatosShader).
 *
 * Para cada celda traza la línea de visión desde el ojo del observador
 * (elevación del punto + altura de la persona/torre) y la marca visible si el
 * terreno intermedio no supera esa línea (pendiente acumulada ≤ pendiente al
 * objetivo). Orientativo — MDE SRTM ~30 m, no considera vegetación ni edificios.
 */
import type { DatosShader } from './shaders';

export interface CeldaViewshed {
  row: number; col: number;
  latMin: number; latMax: number; lngMin: number; lngMax: number;
  visible: boolean;
}

export interface ResultadoViewshed {
  celdas: CeldaViewshed[];
  origen: { lat: number; lng: number; row: number; col: number; elev: number };
  altura_obs: number;
  visibles: number;
  total: number;
  visibles_pct: number;
}

export function calcularViewshed(ds: DatosShader, oRow: number, oCol: number, alturaObs = 1.7): ResultadoViewshed | null {
  let minRow = Infinity, maxRow = -Infinity, minCol = Infinity, maxCol = -Infinity;
  for (const c of ds.celdas) {
    if (c.row < minRow) minRow = c.row; if (c.row > maxRow) maxRow = c.row;
    if (c.col < minCol) minCol = c.col; if (c.col > maxCol) maxCol = c.col;
  }
  const nR = maxRow - minRow + 1, nC = maxCol - minCol + 1;
  const E: (number | null)[][] = Array.from({ length: nR }, () => Array<number | null>(nC).fill(null));
  const metaMap = new Map<string, DatosShader['celdas'][0]>();
  let any: DatosShader['celdas'][0] | null = null;
  for (const c of ds.celdas) {
    E[c.row - minRow]![c.col - minCol] = c.elevation;
    metaMap.set(`${c.row},${c.col}`, c);
    any = c;
  }
  const oCell = metaMap.get(`${oRow},${oCol}`);
  if (!any || !oCell) return null;

  const latC = (any.latMin + any.latMax) / 2;
  const cellH_m = Math.abs(any.latMax - any.latMin) * 111320;
  const cellW_m = Math.abs(any.lngMax - any.lngMin) * 111320 * Math.cos(latC * Math.PI / 180);

  const or = oRow - minRow, oc = oCol - minCol;
  const eyeZ = (E[or]![oc] ?? 0) + alturaObs;

  const bilinear = (rf: number, cf: number): number | null => {
    const r0 = Math.floor(rf), c0 = Math.floor(cf);
    if (r0 < 0 || c0 < 0 || r0 + 1 >= nR || c0 + 1 >= nC) return null;
    const e00 = E[r0]![c0]!, e01 = E[r0]![c0 + 1]!, e10 = E[r0 + 1]![c0]!, e11 = E[r0 + 1]![c0 + 1]!;
    if (e00 == null || e01 == null || e10 == null || e11 == null) return null;
    const fr = rf - r0, fc = cf - c0;
    return e00 * (1 - fr) * (1 - fc) + e01 * (1 - fr) * fc + e10 * fr * (1 - fc) + e11 * fr * fc;
  };

  const celdas: CeldaViewshed[] = [];
  let visibles = 0;
  for (const c of ds.celdas) {
    const tr = c.row - minRow, tc = c.col - minCol;
    let visible = false;
    const dRow = tr - or, dCol = tc - oc;
    const distCells = Math.hypot(dRow, dCol);
    if (distCells < 0.5) {
      visible = true;   // el propio punto de observación
    } else {
      const distM = Math.hypot(dRow * cellH_m, dCol * cellW_m);
      const targetSlope = (c.elevation - eyeZ) / distM;
      // Marcha por la línea de visión, acumulando la pendiente máxima intermedia.
      const pasos = Math.max(2, Math.ceil(distCells));
      let maxSlope = -Infinity, bloqueado = false;
      for (let s = 1; s < pasos; s++) {
        const f = s / pasos;
        const zt = bilinear(or + dRow * f, oc + dCol * f);
        if (zt == null) continue;
        const dm = distM * f;
        const slope = (zt - eyeZ) / dm;
        if (slope > maxSlope) maxSlope = slope;
      }
      void bloqueado;
      visible = targetSlope >= maxSlope - 1e-6;
    }
    if (visible) visibles++;
    celdas.push({ row: c.row, col: c.col, latMin: c.latMin, latMax: c.latMax, lngMin: c.lngMin, lngMax: c.lngMax, visible });
  }

  return {
    celdas,
    origen: { lat: (oCell.latMin + oCell.latMax) / 2, lng: (oCell.lngMin + oCell.lngMax) / 2, row: oRow, col: oCol, elev: oCell.elevation },
    altura_obs: alturaObs,
    visibles,
    total: celdas.length,
    visibles_pct: celdas.length ? Math.round((visibles / celdas.length) * 100) : 0,
  };
}
