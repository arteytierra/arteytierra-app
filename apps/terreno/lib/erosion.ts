/**
 * Mapa de riesgo de erosión hídrica. Combina la PENDIENTE (energía potencial del
 * agua) con el FLUJO ACUMULADO aguas arriba (cuánta agua concentra la celda) en un
 * índice de poder erosivo tipo Stream Power Index:
 *
 *     SPI ≈ pendiente · √(área de captación)
 *
 * Se normaliza al percentil 90 del predio (riesgo RELATIVO al lote, robusto ante
 * DEMs de 1 m a 30 m) y se clasifica en 4 niveles, con un TECHO por pendiente
 * absoluta para no pintar de rojo un predio llano (una llanura, aunque concentre
 * mucho flujo, no sufre erosión laminar severa).
 *
 * Cuando hay cobertura cargada (ESA WorldCover), entra además el factor C de la
 * USLE — el que le faltaba al índice. C no cambia DÓNDE erosiona (WorldCover
 * llega como histograma del predio, no como raster, así que un multiplicador
 * uniforme se cancelaría contra la normalización al percentil 90); cambia
 * CUÁNTO: un predio bajo monte cerrado necesita mucha más pendiente para llegar
 * a severo que el mismo relieve con el suelo desnudo. Eso es exactamente lo que
 * hace C en la USLE — escala la magnitud, no el patrón espacial.
 *
 * Orientativo: no reemplaza un estudio de suelos. Señala DÓNDE conviene proteger
 * el suelo —swales, cobertura viva, cortinas— y complementa el mapa de
 * escorrentías. El CUÁNTO, en toneladas por hectárea y año, lo estima
 * `lib/usle.ts` a partir de la pendiente media y la longitud de ladera que este
 * módulo devuelve por clase.
 */
import type { DatosShader, CeldaShader } from './shaders';
import type { DatosEscorrentia } from './escorrentias';
import { USLE_C_REF } from './hidrologiaPredio';

export type ClaseErosion = 0 | 1 | 2 | 3; // bajo · moderado · alto · severo

export const CLASES_EROSION: ReadonlyArray<{ clase: ClaseErosion; label: string; color: string }> = [
  { clase: 0, label: 'Bajo',     color: '#57A773' },
  { clase: 1, label: 'Moderado', color: '#E9C46A' },
  { clase: 2, label: 'Alto',     color: '#E76F51' },
  { clase: 3, label: 'Severo',   color: '#9B2226' },
];

export function colorErosion(clase: ClaseErosion): string { return CLASES_EROSION[clase]!.color; }

export interface CeldaErosion {
  row: number; col: number;
  latMin: number; latMax: number; lngMin: number; lngMax: number;
  clase: ClaseErosion;
}

export interface ResumenErosion {
  clase: ClaseErosion; label: string; color: string; pct: number; ha: number;
  /** pendiente media de las celdas de esta clase (%) — entra al LS de la USLE */
  pendiente_media_pct: number;
  /** longitud de ladera representativa (m), del flujo acumulado — ídem */
  lambda_m: number;
}

export interface DatosErosion {
  celdas:  CeldaErosion[];
  resumen: ResumenErosion[];   // las 4 clases con % y ha
  area_ha: number;
  /** factor C de USLE del predio (null si no hay cobertura cargada) */
  usle_c:  number | null;
  /** cuánto corrió C los umbrales: >1 protege, <1 agrava, 1 = sin dato */
  factor_cobertura: number;
  nota_cobertura: string;
}

/**
 * Cuánto mueve la cobertura los umbrales de severidad.
 *
 * `k = ∛(C_ref / C)`, acotado a [0,5 ; 2]. La raíz cúbica amortigua: C varía
 * tres órdenes de magnitud entre monte cerrado (0,004) y suelo desnudo (1), y
 * aplicarlo lineal pintaría de rojo o de verde el predio entero. Acotado, el
 * mapa se corre a lo sumo al doble o la mitad de exigencia — que es el rango
 * donde la lectura sigue siendo honesta con un DEM de 30 m.
 */
export function factorCobertura(usleC: number | null | undefined): number {
  if (usleC === null || usleC === undefined || !(usleC > 0)) return 1;
  return Math.min(2, Math.max(0.5, Math.cbrt(USLE_C_REF / usleC)));
}

export function calcularErosion(
  shader: DatosShader,
  esc: DatosEscorrentia,
  usleC: number | null = null,
): DatosErosion | null {
  const { celdas } = shader;
  if (celdas.length < 4) return null;

  const k = factorCobertura(usleC);

  // Área de celda (para √captación y el resumen en hectáreas).
  const c0 = celdas[0]!;
  const lat0 = (c0.latMin + c0.latMax) / 2;
  const cellLatM   = (c0.latMax - c0.latMin) * 111_320;
  const cellLngM   = (c0.lngMax - c0.lngMin) * 111_320 * Math.cos(lat0 * Math.PI / 180);
  const cellAreaM2 = Math.max(cellLatM * cellLngM, 1);

  // Índice de poder erosivo por celda (sin clasificar todavía).
  const spi = new Float64Array(celdas.length);
  const pend = new Float64Array(celdas.length);
  // Longitud de ladera aguas-arriba: el lado de celda por la raíz del flujo
  // acumulado. Es la misma raíz que ya usa el SPI, leída como distancia; sirve
  // de λ para el LS de la USLE (H4), acotada más abajo por LAMBDA_MAX_M.
  const lado = Math.sqrt(cellAreaM2);
  const lambda = new Float64Array(celdas.length);
  celdas.forEach((c: CeldaShader, i) => {
    const acum = esc.acumulacion.get(`${c.row},${c.col}`) ?? 1;
    pend[i] = c.pendiente_pct;
    spi[i]  = (c.pendiente_pct / 100) * Math.sqrt(acum);
    lambda[i] = lado * Math.sqrt(acum);
  });

  // Referencia = percentil 90 del SPI (evita que un outlier aplaste la escala).
  const orden = Array.from(spi).filter(v => v > 0).sort((a, b) => a - b);
  const ref = orden.length ? Math.max(orden[Math.floor(orden.length * 0.9)] ?? 0, 1e-6) : 1;

  // Umbrales corridos por cobertura: buena cobertura los sube (cuesta más llegar
  // a severo), suelo desnudo los baja. La raíz amortigua el corrimiento de las
  // bandas relativas respecto del de los techos por pendiente.
  const kBanda = Math.sqrt(k);
  const b1 = 0.25 * kBanda, b2 = 0.5 * kBanda, b3 = 0.75 * kBanda;
  const p1 = 2 * k, p2 = 5 * k, p3 = 12 * k;

  const bandaRel = (rel: number): ClaseErosion =>
    rel < b1 ? 0 : rel < b2 ? 1 : rel < b3 ? 2 : 3;

  const conteo: [number, number, number, number] = [0, 0, 0, 0];
  const sumaPend:   [number, number, number, number] = [0, 0, 0, 0];
  const sumaLambda: [number, number, number, number] = [0, 0, 0, 0];
  const out: CeldaErosion[] = celdas.map((c, i) => {
    let clase = bandaRel(spi[i]! / ref);
    // Techo por pendiente absoluta: los llanos no llegan a alto/severo.
    if      (pend[i]! < p1) clase = 0;
    else if (pend[i]! < p2) clase = Math.min(clase, 1) as ClaseErosion;
    else if (pend[i]! < p3) clase = Math.min(clase, 2) as ClaseErosion;
    conteo[clase] += 1;
    sumaPend[clase]   += pend[i]!;
    sumaLambda[clase] += lambda[i]!;
    return { row: c.row, col: c.col, latMin: c.latMin, latMax: c.latMax, lngMin: c.lngMin, lngMax: c.lngMax, clase };
  });

  const total = out.length;
  const resumen: ResumenErosion[] = CLASES_EROSION.map(cl => {
    const n = conteo[cl.clase]!;
    return {
      clase: cl.clase, label: cl.label, color: cl.color,
      pct: Math.round((100 * n) / total),
      ha:  +((n * cellAreaM2) / 10_000).toFixed(2),
      pendiente_media_pct: n ? +(sumaPend[cl.clase]! / n).toFixed(1) : 0,
      lambda_m:            n ? Math.round(sumaLambda[cl.clase]! / n) : 0,
    };
  });

  return {
    celdas: out, resumen,
    area_ha: +((total * cellAreaM2) / 10_000).toFixed(2),
    usle_c: usleC ?? null,
    factor_cobertura: +k.toFixed(2),
    nota_cobertura: notaCobertura(usleC ?? null, k),
  };
}

function notaCobertura(usleC: number | null, k: number): string {
  if (usleC === null) {
    return 'Sin cobertura cargada: el mapa usa sólo relieve y flujo. Cargá Cobertura para que entre el factor C de la USLE.';
  }
  const c = usleC.toFixed(3);
  if (k >= 1.4) return `Factor C ${c}: cobertura densa. El suelo está protegido, así que hace falta bastante más pendiente para llegar a riesgo alto.`;
  if (k >= 1.1) return `Factor C ${c}: cobertura mejor que un pastizal medio. Los umbrales de riesgo suben un poco.`;
  if (k > 0.9)  return `Factor C ${c}: cobertura equivalente a un pastizal medio. Umbrales sin corrección.`;
  if (k > 0.6)  return `Factor C ${c}: cobertura pobre (cultivo o suelo ralo). El mismo relieve erosiona más que bajo pastura.`;
  return `Factor C ${c}: suelo mayormente desnudo. Es la condición de máxima erosión — los umbrales bajan a la mitad.`;
}
