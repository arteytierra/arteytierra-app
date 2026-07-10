/**
 * Mapa de sombras (D4) — sombras del relieve por fecha y hora.
 *
 * A partir de la grilla de elevación densa (DatosShader) y la posición del sol
 * (fecha + hora solar + latitud) calcula, por celda: (a) el sombreado propio de
 * la pendiente respecto del sol (hillshade) y (b) las sombras proyectadas por el
 * terreno más alto entre la celda y el sol (ray-march sobre el MDE).
 * Devuelve un valor de oscuridad 0 (pleno sol) → ~0.8 (sombra) por celda.
 *
 * Astronomía: declinación de Cooper (1969); orientativo.
 */
import type { DatosShader } from './shaders';

const DEG = Math.PI / 180, RAD = 180 / Math.PI;

export interface CeldaSombra {
  row: number; col: number;
  latMin: number; latMax: number; lngMin: number; lngMax: number;
  sombra: number;   // 0 = pleno sol · 0.8 = sombra profunda
}

export interface ResultadoSombras {
  celdas: CeldaSombra[];
  sol: { elevacion: number; azimut: number };   // grados
  hay_sol: boolean;                              // false = sol bajo el horizonte
  doy: number;
  hora: number;
}

function declinacion(doy: number): number {
  return 23.45 * DEG * Math.sin(2 * Math.PI * (284 + doy) / 365);
}

/** Posición del sol; elevación puede ser negativa (sol bajo el horizonte). */
export function posicionSol(lat_deg: number, doy: number, horaSolar: number): { elevacion: number; azimut: number } {
  const phi = lat_deg * DEG;
  const decl = declinacion(doy);
  const H = (horaSolar - 12) * 15 * DEG;
  const sinAlt = Math.sin(phi) * Math.sin(decl) + Math.cos(phi) * Math.cos(decl) * Math.cos(H);
  const elev = Math.asin(Math.max(-1, Math.min(1, sinAlt))) * RAD;
  const azRad = Math.atan2(
    -Math.cos(decl) * Math.sin(H),
    Math.sin(decl) * Math.cos(phi) - Math.cos(decl) * Math.cos(H) * Math.sin(phi),
  );
  return { elevacion: elev, azimut: ((azRad * RAD) + 360) % 360 };
}

/** Día del año (1–365) para una fecha (mes 1–12, día). */
export function diaDelAnio(mes: number, dia: number): number {
  const acum = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  return (acum[Math.max(0, Math.min(11, mes - 1))] ?? 0) + dia;
}

const MAX_SOMBRA = 0.8;

export function calcularSombras(ds: DatosShader, lat: number, doy: number, hora: number): ResultadoSombras {
  const sol = posicionSol(lat, doy, hora);
  const base = ds.celdas.map(c => ({
    row: c.row, col: c.col, latMin: c.latMin, latMax: c.latMax, lngMin: c.lngMin, lngMax: c.lngMax,
  }));

  if (sol.elevacion <= 0.5) {
    // Sol bajo el horizonte → todo en penumbra.
    return { celdas: base.map(c => ({ ...c, sombra: 0.7 })), sol, hay_sol: false, doy, hora };
  }

  // ── Grilla regular E[row][col] ──
  let minRow = Infinity, maxRow = -Infinity, minCol = Infinity, maxCol = -Infinity;
  for (const c of ds.celdas) {
    if (c.row < minRow) minRow = c.row; if (c.row > maxRow) maxRow = c.row;
    if (c.col < minCol) minCol = c.col; if (c.col > maxCol) maxCol = c.col;
  }
  const nR = maxRow - minRow + 1, nC = maxCol - minCol + 1;
  const E: (number | null)[][] = Array.from({ length: nR }, () => Array<number | null>(nC).fill(null));
  const meta: (DatosShader['celdas'][0] | null)[][] = Array.from({ length: nR }, () => Array(nC).fill(null));
  let anyCell: DatosShader['celdas'][0] | null = null;
  for (const c of ds.celdas) {
    E[c.row - minRow]![c.col - minCol] = c.elevation;
    meta[c.row - minRow]![c.col - minCol] = c;
    anyCell = c;
  }
  if (!anyCell) return { celdas: base.map(c => ({ ...c, sombra: 0 })), sol, hay_sol: true, doy, hora };

  // Tamaño de celda en metros y orientación fila/columna.
  const latC = (anyCell.latMin + anyCell.latMax) / 2;
  const cellH_m = Math.abs(anyCell.latMax - anyCell.latMin) * 111320;                   // metros por fila
  const cellW_m = Math.abs(anyCell.lngMax - anyCell.lngMin) * 111320 * Math.cos(latC * DEG); // metros por columna
  // ¿La columna crece hacia el este? ¿La fila hacia el norte?
  const c2 = ds.celdas.find(c => c.col === anyCell!.col + 1 && c.row === anyCell!.row);
  const eastSign = c2 ? (c2.lngMin > anyCell.lngMin ? 1 : -1) : 1;
  const r2 = ds.celdas.find(c => c.row === anyCell!.row + 1 && c.col === anyCell!.col);
  const northPlusRow = r2 ? (r2.latMin > anyCell.latMin ? 1 : -1) : -1; // +1 si fila↑ = norte

  const azR = sol.azimut * DEG, elR = sol.elevacion * DEG;
  const Es = Math.sin(azR), Ns = Math.cos(azR);   // dirección al sol en el plano (E, N)
  const tanElev = Math.tan(elR);
  const step = Math.min(cellW_m, cellH_m) || 30;
  const maxDist = Math.hypot(nR * cellH_m, nC * cellW_m);

  // Vector solar 3D (este, norte, arriba) para el hillshade.
  const sunV = { e: Math.cos(elR) * Es, n: Math.cos(elR) * Ns, u: Math.sin(elR) };

  const bilinear = (rf: number, cf: number): number | null => {
    const r0 = Math.floor(rf), c0 = Math.floor(cf);
    if (r0 < 0 || c0 < 0 || r0 + 1 >= nR || c0 + 1 >= nC) return null;
    const e00 = E[r0]![c0]!, e01 = E[r0]![c0 + 1]!, e10 = E[r0 + 1]![c0]!, e11 = E[r0 + 1]![c0 + 1]!;
    if (e00 == null || e01 == null || e10 == null || e11 == null) return null;
    const fr = rf - r0, fc = cf - c0;
    return e00 * (1 - fr) * (1 - fc) + e01 * (1 - fr) * fc + e10 * fr * (1 - fc) + e11 * fr * fc;
  };

  const celdas: CeldaSombra[] = [];
  for (const c of ds.celdas) {
    const r = c.row - minRow, col = c.col - minCol;
    const z0 = c.elevation;

    // (a) Hillshade — pendiente respecto del sol.
    const eE = (E[r]![col + 1] ?? E[r]![col - 1] ?? z0)!;
    const eW = (E[r]![col - 1] ?? E[r]![col + 1] ?? z0)!;
    const eN = (E[r - 1]?.[col] ?? E[r + 1]?.[col] ?? z0)!;
    const eS = (E[r + 1]?.[col] ?? E[r - 1]?.[col] ?? z0)!;
    const dzE = eastSign * (eE - eW) / (2 * cellW_m);
    const dzN = northPlusRow * (eN - eS) / (2 * cellH_m);   // (fila↑) hacia el norte según signo
    const nlen = Math.hypot(dzE, dzN, 1);
    const illum = Math.max(0, (-dzE * sunV.e - dzN * sunV.n + 1 * sunV.u) / nlen);

    // (b) Sombra proyectada — ray-march hacia el sol.
    let cast = false;
    for (let d = step; d <= maxDist; d += step) {
      const dCol = (Es * d * eastSign) / cellW_m;
      const dRow = (Ns * d * northPlusRow) / cellH_m;
      const zTerr = bilinear(r + dRow, col + dCol);
      if (zTerr == null) break;               // el rayo salió de la grilla
      if (zTerr > z0 + d * tanElev + 0.5) { cast = true; break; }
    }

    const sombra = cast
      ? MAX_SOMBRA
      : Math.min(MAX_SOMBRA, (1 - illum) * 0.65);
    celdas.push({ row: c.row, col: c.col, latMin: c.latMin, latMax: c.latMax, lngMin: c.lngMin, lngMax: c.lngMax, sombra });
  }

  return { celdas, sol, hay_sol: true, doy, hora };
}
