/**
 * Punto de entrada de la capa de elevación. Rutea la fuente y garantiza que
 * "todo lo que consume elevación sigue funcionando": si GLO-30 falla, cae a SRTM.
 */
import type { LatLng, ResultadoPuntos } from './tipos';
import { puntosGlo30 } from './glo30';
import { puntosOpenMeteo } from './openmeteo';
import { puntosSrtm } from './srtm';

export type { BBox, LatLng, FuenteDEM, ResultadoPuntos } from './tipos';

export async function obtenerElevacionPuntos(coords: LatLng[]): Promise<ResultadoPuntos> {
  if (coords.length === 0) return { elevaciones: [], fuente: 'glo30' };

  try {
    const g = await puntosGlo30(coords);
    const faltan: number[] = [];
    g.forEach((v, i) => { if (v == null) faltan.push(i); });

    // GLO-30 cubrió al menos parte: completar huecos puntuales con los respaldos.
    if (faltan.length < coords.length) {
      if (faltan.length > 0) {
        try {
          const s = await puntosOpenMeteo(faltan.map(i => coords[i]!));
          faltan.forEach((i, k) => { if (g[i] == null) g[i] = s[k] ?? null; });
        } catch { /* deja los huecos como null */ }
      }
      return { elevaciones: g, fuente: 'glo30' };
    }
  } catch { /* GLO-30 completamente caído → respaldos */ }

  // GLO-30 no devolvió nada. Open-Meteo (Copernicus GLO-90, estable) antes que
  // OpenTopoData, que rate-limitea la IP compartida de Vercel.
  try {
    const om = await puntosOpenMeteo(coords);
    if (om.some(v => v != null)) return { elevaciones: om, fuente: 'openmeteo' };
  } catch { /* Open-Meteo caído → SRTM/OpenTopoData */ }

  const s = await puntosSrtm(coords);
  return { elevaciones: s, fuente: 'srtm30' };
}
