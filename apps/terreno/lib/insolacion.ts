/**
 * Horas de sol acumuladas (R4) — cuánto sol recibe cada punto en un día.
 *
 * Recorre el día de la salida a la puesta del sol y, en cada paso, marca qué
 * celdas están iluminadas (ni a la sombra del relieve, ni a la de un árbol o una
 * construcción, ni en la cara opuesta al sol). El total, multiplicado por el
 * paso, da las horas de sol de cada celda.
 *
 * Sirve para decidir dónde va la huerta, los paneles, el invernadero o la casa,
 * y para comparar invierno contra verano en el mismo terreno.
 *
 * Orientativo: MDE SRTM ~30 m, sin nubes ni refracción atmosférica.
 */
import type { DatosShader } from './shaders';
import { posicionSol, salidaPuesta, prepararGrilla } from './sombras';
import { prepararObjetos, bloqueadoPorObjetos, aMetros, type ObjetoSombra } from './objetosSombra';

const DEG = Math.PI / 180;

export interface CeldaInsolacion {
  row: number; col: number;
  latMin: number; latMax: number; lngMin: number; lngMax: number;
  horas: number;
}

export interface ResultadoInsolacion {
  celdas: CeldaInsolacion[];
  doy: number;
  /** Horas de luz astronómicas del día (techo teórico, sin relieve). */
  horas_luz: number;
  salida: number;
  puesta: number;
  /** Horas de sol reales: mínimo, máximo y promedio sobre el terreno. */
  min: number; max: number; promedio: number;
  paso_min: number;
  con_objetos: boolean;
}

/** Fechas clave del año (hemisferio sur). */
export const FECHAS_CLAVE = [
  { clave: 'solsticio_invierno', etiqueta: 'Solsticio de invierno', mes: 6,  dia: 21 },
  { clave: 'equinoccios',        etiqueta: 'Equinoccios',           mes: 9,  dia: 21 },
  { clave: 'solsticio_verano',   etiqueta: 'Solsticio de verano',   mes: 12, dia: 21 },
];

/**
 * @param pasoMin Resolución temporal en minutos. 20 es un buen equilibrio:
 *        el error máximo es medio paso (±10 min) por celda.
 */
export function calcularInsolacion(
  ds: DatosShader, lat: number, doy: number, objetos: ObjetoSombra[] = [], pasoMin = 20,
): ResultadoInsolacion | null {
  const g = prepararGrilla(ds);
  if (!g) return null;

  const { E, nR, nC, minRow, minCol, cellH_m, cellW_m, eastSign, northPlusRow, bilinear } = g;
  const { salida, puesta, horas_luz } = salidaPuesta(lat, doy);
  const objs = prepararObjetos(objetos, g.origen, g.elevacionAprox);

  const step = Math.min(cellW_m, cellH_m) || 30;
  const maxDist = Math.hypot(nR * cellH_m, nC * cellW_m);
  const pasoH = pasoMin / 60;

  // Acumulador de pasos con sol, en el mismo orden que ds.celdas.
  const n = ds.celdas.length;
  const conSol = new Float64Array(n);

  // Precalculamos posición en la grilla y en metros de cada celda.
  const cells = ds.celdas.map(c => {
    const p = aMetros((c.latMin + c.latMax) / 2, (c.lngMin + c.lngMax) / 2, g.origen);
    return { r: c.row - minRow, col: c.col - minCol, z: c.elevation, x: p.x, y: p.y };
  });

  // Muestreamos los centros de cada intervalo: sin sesgo en los bordes del día.
  for (let h = salida + pasoH / 2; h < puesta; h += pasoH) {
    const sol = posicionSol(lat, doy, h);
    if (sol.elevacion <= 0.5) continue;

    const azR = sol.azimut * DEG, elR = sol.elevacion * DEG;
    const Es = Math.sin(azR), Ns = Math.cos(azR);
    const tanElev = Math.tan(elR);
    const sunV = { e: Math.cos(elR) * Es, n: Math.cos(elR) * Ns, u: Math.sin(elR) };

    for (let i = 0; i < n; i++) {
      const { r, col, z, x, y } = cells[i]!;

      // Cara opuesta al sol: la propia pendiente ya lo tapa.
      const eE = (E[r]![col + 1] ?? E[r]![col - 1] ?? z)!;
      const eW = (E[r]![col - 1] ?? E[r]![col + 1] ?? z)!;
      const eN = (E[r - 1]?.[col] ?? E[r + 1]?.[col] ?? z)!;
      const eS = (E[r + 1]?.[col] ?? E[r - 1]?.[col] ?? z)!;
      const dzE = eastSign * (eE - eW) / (2 * cellW_m);
      const dzN = northPlusRow * (eN - eS) / (2 * cellH_m);
      const nlen = Math.hypot(dzE, dzN, 1);
      const illum = (-dzE * sunV.e - dzN * sunV.n + sunV.u) / nlen;
      if (illum <= 0) continue;

      // Sombra del relieve.
      let tapado = false;
      for (let d = step; d <= maxDist; d += step) {
        const dCol = (Es * d * eastSign) / cellW_m;
        const dRow = (Ns * d * northPlusRow) / cellH_m;
        const zTerr = bilinear(r + dRow, col + dCol);
        if (zTerr == null) break;
        if (zTerr > z + d * tanElev + 0.5) { tapado = true; break; }
      }
      // Sombra de árboles y construcciones.
      if (!tapado && objs.length) tapado = bloqueadoPorObjetos(x, y, z, Es, Ns, tanElev, objs);

      if (!tapado) conSol[i]! += 1;
    }
  }

  let min = Infinity, max = -Infinity, suma = 0;
  const celdas: CeldaInsolacion[] = ds.celdas.map((c, i) => {
    const horas = conSol[i]! * pasoH;
    if (horas < min) min = horas;
    if (horas > max) max = horas;
    suma += horas;
    return { row: c.row, col: c.col, latMin: c.latMin, latMax: c.latMax, lngMin: c.lngMin, lngMax: c.lngMax, horas };
  });

  return {
    celdas, doy, horas_luz, salida, puesta,
    min: Number.isFinite(min) ? min : 0,
    max: Number.isFinite(max) ? max : 0,
    promedio: n ? suma / n : 0,
    paso_min: pasoMin,
    con_objetos: objs.length > 0,
  };
}

/** Rampa de color para las horas de sol: poco sol = violeta frío, mucho = amarillo. */
export function colorInsolacion(horas: number, max: number): [number, number, number] {
  const t = max > 0 ? Math.max(0, Math.min(1, horas / max)) : 0;
  // Violeta → azul → verde → amarillo (parecida a viridis, legible en impresión).
  const paradas: Array<[number, [number, number, number]]> = [
    [0.0, [68, 1, 84]],
    [0.25, [59, 82, 139]],
    [0.5, [33, 145, 140]],
    [0.75, [94, 201, 98]],
    [1.0, [253, 231, 37]],
  ];
  for (let i = 1; i < paradas.length; i++) {
    const [t1, c1] = paradas[i]!;
    if (t <= t1) {
      const [t0, c0] = paradas[i - 1]!;
      const f = (t - t0) / (t1 - t0);
      return [0, 1, 2].map(k => Math.round(c0[k as 0]! + (c1[k as 0]! - c0[k as 0]!) * f)) as [number, number, number];
    }
  }
  return paradas[paradas.length - 1]![1];
}
