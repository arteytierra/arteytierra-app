/**
 * Ruteo de fuente DEM por ubicación (regla del audit B): donde hay un servicio
 * nacional en vivo con licencia comercial clara, se usa; si no, GLO-30 global.
 *
 * Las coberturas se chequean por bounding box aproximado del centro del predio.
 * No hace falta precisión de frontera: si el servicio nacional falla, el llamador
 * cae a GLO-30 igual. Argentina y Ecuador NO se listan a propósito (B4: AR sin
 * licencia comercial explícita, EC es CC-BY-SA copyleft → quedan en GLO-30 +
 * la vía de import del usuario).
 */
import type { BBox } from './tipos';

export type FuenteNacional = 'usgs3dep';

interface Cobertura { fuente: FuenteNacional; bbox: BBox } // bbox = [oeste, sur, este, norte]

const COBERTURAS: Cobertura[] = [
  { fuente: 'usgs3dep', bbox: [-125.0, 24.4, -66.9, 49.5] },   // EE.UU. contiguo
  { fuente: 'usgs3dep', bbox: [-160.3, 18.9, -154.7, 22.3] },  // Hawái
  { fuente: 'usgs3dep', bbox: [-168.2, 54.4, -129.9, 71.5] },  // Alaska
];

/** Fuente nacional para el centro del bbox, o null (→ GLO-30). */
export function fuenteNacionalGrilla(bbox: BBox): FuenteNacional | null {
  const lng = (bbox[0] + bbox[2]) / 2, lat = (bbox[1] + bbox[3]) / 2;
  for (const c of COBERTURAS) {
    if (lng >= c.bbox[0] && lng <= c.bbox[2] && lat >= c.bbox[1] && lat <= c.bbox[3]) return c.fuente;
  }
  return null;
}
