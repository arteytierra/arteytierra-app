/**
 * Curvas de nivel vectoriales via Marching Squares sobre la grilla del shader (10×10).
 * Grid pequeño → rápido; adecuado para orientación, no reemplaza cartografía de precisión.
 */
import type { DatosShader } from './shaders';

export interface Punto  { lat: number; lng: number }
export interface Segmento { a: Punto; b: Punto }
export interface CurvaNivel { cota: number; segmentos: Segmento[] }

// Interpolar posición del cruce de la isolínea en una arista
function interp(
  pa: { lat: number; lng: number; elev: number },
  pb: { lat: number; lng: number; elev: number },
  z:  number,
): Punto {
  const t = (z - pa.elev) / (pb.elev - pa.elev);
  return { lat: pa.lat + t * (pb.lat - pa.lat), lng: pa.lng + t * (pb.lng - pa.lng) };
}

export function calcularCurvasNivel(shader: DatosShader, intervaloForzado?: number): CurvaNivel[] {
  const { celdas, elev_min, elev_max } = shader;
  if (celdas.length === 0) return [];

  const desnivel  = elev_max - elev_min;
  if (desnivel < 1) return [];

  // Intervalo: desnivel/5 redondeado al múltiplo de 5 más cercano, clamp 5–50
  const intervalo = intervaloForzado ?? Math.min(50, Math.max(5, Math.round(desnivel / 5 / 5) * 5));

  // Construir grilla de puntos (centros de celda)
  const ROWS = 10, COLS = 10;
  const grid: Array<Array<{ lat: number; lng: number; elev: number } | null>> =
    Array.from({ length: ROWS }, () => Array(COLS).fill(null));

  for (const c of celdas) {
    if (c.row < ROWS && c.col < COLS) {
      grid[c.row]![c.col] = {
        lat:  (c.latMin + c.latMax) / 2,
        lng:  (c.lngMin + c.lngMax) / 2,
        elev: c.elevation,
      };
    }
  }

  // Niveles de cota dentro del rango
  const start  = Math.ceil(elev_min / intervalo) * intervalo;
  const levels: number[] = [];
  for (let z = start; z <= elev_max; z += intervalo) levels.push(z);

  return levels.map(z => {
    const segmentos: Segmento[] = [];

    // Recorrer cuadrados de la grilla (9×9 cuadrados de 10×10 puntos)
    for (let r = 0; r < ROWS - 1; r++) {
      for (let c = 0; c < COLS - 1; c++) {
        const tl = grid[r]![c];
        const tr = grid[r]![c + 1];
        const br = grid[r + 1]![c + 1];
        const bl = grid[r + 1]![c];
        if (!tl || !tr || !br || !bl) continue;

        // Bit: 1 si la esquina está por encima o igual al nivel z
        // Bit 0 = TL, Bit 1 = TR, Bit 2 = BR, Bit 3 = BL
        const code =
          (tl.elev >= z ? 1 : 0) |
          (tr.elev >= z ? 2 : 0) |
          (br.elev >= z ? 4 : 0) |
          (bl.elev >= z ? 8 : 0);

        if (code === 0 || code === 15) continue; // todo abajo o todo arriba

        // Cruces en aristas: 0=top (TL-TR), 1=right (TR-BR), 2=bottom (BR-BL), 3=left (BL-TL)
        const pts: (Punto | null)[] = [
          (code & 1) !== ((code & 2) >> 1) ? interp(tl, tr, z) : null,   // top
          ((code & 2) >> 1) !== ((code & 4) >> 2) ? interp(tr, br, z) : null, // right
          ((code & 4) >> 2) !== ((code & 8) >> 3) ? interp(br, bl, z) : null, // bottom
          ((code & 8) >> 3) !== (code & 1) ? interp(bl, tl, z) : null,   // left
        ];

        const active = pts.flatMap((p, i) => p ? [{ i, p }] : []);

        if (active.length === 2) {
          segmentos.push({ a: active[0]!.p, b: active[1]!.p });
        } else if (active.length === 4) {
          // Caso silla (ambiguo): conectar 0-3 y 1-2
          segmentos.push({ a: active[0]!.p, b: active[3]!.p });
          segmentos.push({ a: active[1]!.p, b: active[2]!.p });
        }
      }
    }

    return { cota: z, segmentos };
  }).filter(c => c.segmentos.length > 0);
}

/** Elige el intervalo automático dado el desnivel */
export function intervaloAutomatico(desnivel: number): number {
  return Math.min(50, Math.max(5, Math.round(desnivel / 5 / 5) * 5));
}
