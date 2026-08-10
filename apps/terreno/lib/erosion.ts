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
 * Orientativo: no reemplaza un estudio de suelos (falta erodabilidad K, cobertura
 * C y prácticas P de la USLE). Señala DÓNDE conviene proteger el suelo —swales,
 * cobertura viva, cortinas— y complementa el mapa de escorrentías.
 */
import type { DatosShader, CeldaShader } from './shaders';
import type { DatosEscorrentia } from './escorrentias';

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

export interface ResumenErosion { clase: ClaseErosion; label: string; color: string; pct: number; ha: number }

export interface DatosErosion {
  celdas:  CeldaErosion[];
  resumen: ResumenErosion[];   // las 4 clases con % y ha
  area_ha: number;
}

export function calcularErosion(shader: DatosShader, esc: DatosEscorrentia): DatosErosion | null {
  const { celdas } = shader;
  if (celdas.length < 4) return null;

  // Área de celda (para √captación y el resumen en hectáreas).
  const c0 = celdas[0]!;
  const lat0 = (c0.latMin + c0.latMax) / 2;
  const cellLatM   = (c0.latMax - c0.latMin) * 111_320;
  const cellLngM   = (c0.lngMax - c0.lngMin) * 111_320 * Math.cos(lat0 * Math.PI / 180);
  const cellAreaM2 = Math.max(cellLatM * cellLngM, 1);

  // Índice de poder erosivo por celda (sin clasificar todavía).
  const spi = new Float64Array(celdas.length);
  const pend = new Float64Array(celdas.length);
  celdas.forEach((c: CeldaShader, i) => {
    const acum = esc.acumulacion.get(`${c.row},${c.col}`) ?? 1;
    pend[i] = c.pendiente_pct;
    spi[i]  = (c.pendiente_pct / 100) * Math.sqrt(acum);
  });

  // Referencia = percentil 90 del SPI (evita que un outlier aplaste la escala).
  const orden = Array.from(spi).filter(v => v > 0).sort((a, b) => a - b);
  const ref = orden.length ? Math.max(orden[Math.floor(orden.length * 0.9)] ?? 0, 1e-6) : 1;

  const bandaRel = (rel: number): ClaseErosion =>
    rel < 0.25 ? 0 : rel < 0.5 ? 1 : rel < 0.75 ? 2 : 3;

  const conteo: [number, number, number, number] = [0, 0, 0, 0];
  const out: CeldaErosion[] = celdas.map((c, i) => {
    let clase = bandaRel(spi[i]! / ref);
    // Techo por pendiente absoluta: los llanos no llegan a alto/severo.
    if      (pend[i]! < 2)  clase = 0;
    else if (pend[i]! < 5)  clase = Math.min(clase, 1) as ClaseErosion;
    else if (pend[i]! < 12) clase = Math.min(clase, 2) as ClaseErosion;
    conteo[clase] += 1;
    return { row: c.row, col: c.col, latMin: c.latMin, latMax: c.latMax, lngMin: c.lngMin, lngMax: c.lngMax, clase };
  });

  const total = out.length;
  const resumen: ResumenErosion[] = CLASES_EROSION.map(cl => ({
    clase: cl.clase, label: cl.label, color: cl.color,
    pct: Math.round((100 * conteo[cl.clase]!) / total),
    ha:  +((conteo[cl.clase]! * cellAreaM2) / 10_000).toFixed(2),
  }));

  return { celdas: out, resumen, area_ha: +((total * cellAreaM2) / 10_000).toFixed(2) };
}
