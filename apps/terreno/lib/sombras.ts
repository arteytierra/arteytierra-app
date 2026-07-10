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
import { prepararObjetos, bloqueadoPorObjetos, sombraProyectada, aMetros, type ObjetoSombra } from './objetosSombra';

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
  /**
   * Sombras de árboles y construcciones como polígonos. Van aparte de `celdas`
   * porque son mucho más finas que la celda del MDE (~30 m) y como raster
   * desaparecerían.
   */
  sombras_objetos: Array<{ id: string; nombre: string; vertices: Array<{ lat: number; lng: number }> }>;
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

/**
 * Salida y puesta del sol en hora solar, del ángulo horario cos(H) = −tanφ·tanδ.
 * En latitudes altas puede no haber orto/ocaso (sol de medianoche o noche polar);
 * ahí devolvemos el día entero o ninguno.
 */
export function salidaPuesta(lat_deg: number, doy: number): { salida: number; puesta: number; horas_luz: number } {
  const cosH = -Math.tan(lat_deg * DEG) * Math.tan(declinacion(doy));
  if (cosH <= -1) return { salida: 0, puesta: 24, horas_luz: 24 };   // sol siempre arriba
  if (cosH >= 1)  return { salida: 12, puesta: 12, horas_luz: 0 };   // sol siempre abajo
  const H = Math.acos(cosH) * RAD / 15;
  return { salida: 12 - H, puesta: 12 + H, horas_luz: 2 * H };
}

const MAX_SOMBRA = 0.8;

/**
 * Geometría de la grilla, compartida por el mapa de sombras y el de insolación
 * para que ambos midan sobre exactamente el mismo terreno.
 */
export interface Grilla {
  E: (number | null)[][];
  nR: number; nC: number; minRow: number; minCol: number;
  cellH_m: number; cellW_m: number;
  eastSign: number; northPlusRow: number;
  origen: { lat: number; lng: number };
  bilinear: (rf: number, cf: number) => number | null;
  /** Interpolada; null fuera de la grilla o en el borde recortado. */
  elevacionEn: (lat: number, lng: number) => number | null;
  /** Como `elevacionEn` pero cae en la celda más cercana antes de rendirse. */
  elevacionAprox: (lat: number, lng: number) => number | null;
  centro: (c: { latMin: number; latMax: number; lngMin: number; lngMax: number }) => { lat: number; lng: number };
}

export function prepararGrilla(ds: DatosShader): Grilla | null {
  let minRow = Infinity, maxRow = -Infinity, minCol = Infinity, maxCol = -Infinity;
  for (const c of ds.celdas) {
    if (c.row < minRow) minRow = c.row; if (c.row > maxRow) maxRow = c.row;
    if (c.col < minCol) minCol = c.col; if (c.col > maxCol) maxCol = c.col;
  }
  if (!Number.isFinite(minRow)) return null;
  const nR = maxRow - minRow + 1, nC = maxCol - minCol + 1;
  const E: (number | null)[][] = Array.from({ length: nR }, () => Array<number | null>(nC).fill(null));
  let anyCell: DatosShader['celdas'][0] | null = null;
  for (const c of ds.celdas) {
    E[c.row - minRow]![c.col - minCol] = c.elevation;
    anyCell = c;
  }
  if (!anyCell) return null;

  const latC = (anyCell.latMin + anyCell.latMax) / 2;
  const cellH_m = Math.abs(anyCell.latMax - anyCell.latMin) * 111320;
  const cellW_m = Math.abs(anyCell.lngMax - anyCell.lngMin) * 111320 * Math.cos(latC * DEG);
  // ¿La columna crece hacia el este? ¿La fila hacia el norte?
  const c2 = ds.celdas.find(c => c.col === anyCell!.col + 1 && c.row === anyCell!.row);
  const eastSign = c2 ? (c2.lngMin > anyCell.lngMin ? 1 : -1) : 1;
  const r2 = ds.celdas.find(c => c.row === anyCell!.row + 1 && c.col === anyCell!.col);
  const northPlusRow = r2 ? (r2.latMin > anyCell.latMin ? 1 : -1) : -1;

  const bilinear = (rf: number, cf: number): number | null => {
    const r0 = Math.floor(rf), c0 = Math.floor(cf);
    if (r0 < 0 || c0 < 0 || r0 + 1 >= nR || c0 + 1 >= nC) return null;
    const e00 = E[r0]![c0]!, e01 = E[r0]![c0 + 1]!, e10 = E[r0 + 1]![c0]!, e11 = E[r0 + 1]![c0 + 1]!;
    if (e00 == null || e01 == null || e10 == null || e11 == null) return null;
    const fr = rf - r0, fc = cf - c0;
    return e00 * (1 - fr) * (1 - fc) + e01 * (1 - fr) * fc + e10 * fr * (1 - fc) + e11 * fr * fc;
  };

  const centro = (c: { latMin: number; latMax: number; lngMin: number; lngMax: number }) =>
    ({ lat: (c.latMin + c.latMax) / 2, lng: (c.lngMin + c.lngMax) / 2 });

  // Origen del plano local en metros. Sirve cualquier punto fijo: sólo tiene que
  // ser el mismo para las celdas y para los objetos.
  const ancla = centro(anyCell);
  const origen = ancla;

  /**
   * Cota del terreno en una coordenada cualquiera.
   *
   * Anclamos en una celda que existe (`anyCell`) y no en la esquina
   * (minRow, minCol): la grilla viene recortada al polígono del predio y esa
   * esquina puede faltar, lo que daría filas/columnas negativas y un `null`
   * silencioso para todo objeto.
   */
  const elevacionEn = (lat: number, lng: number): number | null => {
    const dxm = (lng - ancla.lng) * 111320 * Math.cos(ancla.lat * DEG);
    const dym = (lat - ancla.lat) * 111320;
    const cf = (anyCell!.col - minCol) + eastSign * (dxm / cellW_m);
    const rf = (anyCell!.row - minRow) + northPlusRow * (dym / cellH_m);
    return bilinear(rf, cf);
  };

  /**
   * Para apoyar objetos: en el borde recortado `bilinear` no tiene los cuatro
   * vecinos y devuelve null. Antes que descartar el árbol en silencio, tomamos
   * la cota de la celda más cercana (a 30 m de resolución, da igual).
   */
  const elevacionAprox = (lat: number, lng: number): number | null => {
    const e = elevacionEn(lat, lng);
    if (e != null) return e;
    let mejor: number | null = null, dMin = Infinity;
    for (const c of ds.celdas) {
      const p = centro(c);
      const d = (p.lat - lat) ** 2 + (p.lng - lng) ** 2;
      if (d < dMin) { dMin = d; mejor = c.elevation; }
    }
    // Más allá de ~3 celdas ya no es "cerca": el objeto está fuera del terreno.
    const tolGrados = (3 * cellH_m) / 111320;
    return dMin <= tolGrados ** 2 ? mejor : null;
  };

  return { E, nR, nC, minRow, minCol, cellH_m, cellW_m, eastSign, northPlusRow, origen, bilinear, elevacionEn, elevacionAprox, centro };
}

export function calcularSombras(
  ds: DatosShader, lat: number, doy: number, hora: number, objetos: ObjetoSombra[] = [],
): ResultadoSombras {
  const sol = posicionSol(lat, doy, hora);
  const base = ds.celdas.map(c => ({
    row: c.row, col: c.col, latMin: c.latMin, latMax: c.latMax, lngMin: c.lngMin, lngMax: c.lngMax,
  }));

  if (sol.elevacion <= 0.5) {
    // Sol bajo el horizonte → todo en penumbra, sin sombras que proyectar.
    return { celdas: base.map(c => ({ ...c, sombra: 0.7 })), sol, hay_sol: false, doy, hora, sombras_objetos: [] };
  }

  const g = prepararGrilla(ds);
  if (!g) return { celdas: base.map(c => ({ ...c, sombra: 0 })), sol, hay_sol: true, doy, hora, sombras_objetos: [] };

  const { E, nR, nC, minRow, minCol, cellH_m, cellW_m, eastSign, northPlusRow, bilinear } = g;

  const azR = sol.azimut * DEG, elR = sol.elevacion * DEG;
  const Es = Math.sin(azR), Ns = Math.cos(azR);   // dirección al sol en el plano (E, N)
  const tanElev = Math.tan(elR);
  const step = Math.min(cellW_m, cellH_m) || 30;
  const maxDist = Math.hypot(nR * cellH_m, nC * cellW_m);

  // Vector solar 3D (este, norte, arriba) para el hillshade.
  const sunV = { e: Math.cos(elR) * Es, n: Math.cos(elR) * Ns, u: Math.sin(elR) };

  const objs = prepararObjetos(objetos, g.origen, g.elevacionAprox);

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

    // (b) Sombra proyectada por el relieve — ray-march hacia el sol.
    let cast = false;
    for (let d = step; d <= maxDist; d += step) {
      const dCol = (Es * d * eastSign) / cellW_m;
      const dRow = (Ns * d * northPlusRow) / cellH_m;
      const zTerr = bilinear(r + dRow, col + dCol);
      if (zTerr == null) break;               // el rayo salió de la grilla
      if (zTerr > z0 + d * tanElev + 0.5) { cast = true; break; }
    }

    // (c) Sombra proyectada por árboles y construcciones.
    if (!cast && objs.length) {
      const p = aMetros(c.latMin / 2 + c.latMax / 2, c.lngMin / 2 + c.lngMax / 2, g.origen);
      cast = bloqueadoPorObjetos(p.x, p.y, z0, Es, Ns, tanElev, objs);
    }

    const sombra = cast
      ? MAX_SOMBRA
      : Math.min(MAX_SOMBRA, (1 - illum) * 0.65);
    celdas.push({ row: c.row, col: c.col, latMin: c.latMin, latMax: c.latMax, lngMin: c.lngMin, lngMax: c.lngMax, sombra });
  }

  // Sombras de objetos como polígonos (ver `sombraProyectada`).
  const sombras_objetos = objs.flatMap(o => {
    const vertices = sombraProyectada(o, sol.azimut, sol.elevacion, g.origen);
    return vertices ? [{ id: o.id, nombre: o.nombre, vertices }] : [];
  });

  return { celdas, sol, hay_sol: true, doy, hora, sombras_objetos };
}
