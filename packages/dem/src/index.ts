/**
 * Punto de entrada de @arteytierra/dem. Rutea la fuente y garantiza que
 * "todo lo que consume elevación sigue funcionando": si GLO-30 falla, cae a SRTM.
 *
 * Extraído de apps/terreno/lib/elevacion/ (Fase A0 del plan de dos pistas de
 * apps/anteproyectos, ver PLAN-DOS-PISTAS.md). Server-side: los proveedores
 * leen COGs remotos con `geotiff`, no corren en el cliente.
 */
import type { LatLng, ResultadoPuntos } from './tipos';
import { puntosGlo30 } from './glo30';
import { puntosSrtm } from './srtm';

export type { BBox, LatLng, FuenteDEM, ResultadoPuntos } from './tipos';
export { ATRIBUCION, ATRIBUCION_CORTA, atribucionDe } from './atribucion';
export { obtenerGrillaDEM, grillaGlo30, type GrillaDEM } from './grilla';
export { fuentesNacionalesGrilla, type FuenteNacional } from './router';

export async function obtenerElevacionPuntos(coords: LatLng[]): Promise<ResultadoPuntos> {
  if (coords.length === 0) return { elevaciones: [], fuente: 'glo30' };

  try {
    const g = await puntosGlo30(coords);
    const faltan: number[] = [];
    g.forEach((v, i) => { if (v == null) faltan.push(i); });

    // GLO-30 cubrió al menos parte: completar huecos puntuales con SRTM.
    if (faltan.length < coords.length) {
      if (faltan.length > 0) {
        try {
          const s = await puntosSrtm(faltan.map(i => coords[i]!));
          faltan.forEach((i, k) => { if (g[i] == null) g[i] = s[k] ?? null; });
        } catch { /* deja los huecos como null */ }
      }
      return { elevaciones: g, fuente: 'glo30' };
    }
  } catch { /* GLO-30 completamente caído → SRTM */ }

  const s = await puntosSrtm(coords);
  return { elevaciones: s, fuente: 'srtm30' };
}
