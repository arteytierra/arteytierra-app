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

export type FuenteNacional = 'usgs3dep' | 'ignfr' | 'ignes' | 'hrdemca' | 'ahnnl';

interface Cobertura { fuente: FuenteNacional; bbox: BBox } // bbox = [oeste, sur, este, norte]

const COBERTURAS: Cobertura[] = [
  { fuente: 'usgs3dep', bbox: [-125.0, 24.4, -66.9, 49.5] },   // EE.UU. contiguo
  { fuente: 'usgs3dep', bbox: [-160.3, 18.9, -154.7, 22.3] },  // Hawái
  { fuente: 'usgs3dep', bbox: [-168.2, 54.4, -129.9, 71.5] },  // Alaska
  { fuente: 'hrdemca',  bbox: [-141.1, 41.6, -52.5, 83.2] },   // Canadá (HRDEM parcial; sur poblado → si no hay dato, GLO-30)
  { fuente: 'ahnnl',    bbox: [3.2, 50.7, 7.3, 53.7] },        // Países Bajos (AHN 0,5 m; antes de Francia por el solape de Limburgo)
  { fuente: 'ignfr',    bbox: [-5.2, 41.3, 9.6, 51.1] },       // Francia metropolitana (+ Córcega)
  { fuente: 'ignes',    bbox: [-9.6, 35.8, 4.4, 43.9] },       // España peninsular + Baleares (Canarias → GLO-30)
];

/**
 * TODAS las fuentes nacionales cuyo bbox contiene el centro del predio, en orden.
 * Se devuelven todas (no solo la primera) porque hay coberturas que se solapan
 * —p. ej. España y Francia en los Pirineos— y el llamador prueba en orden: si la
 * primera no tiene dato (bbox grueso), pasa a la siguiente antes de caer a GLO-30.
 */
export function fuentesNacionalesGrilla(bbox: BBox): FuenteNacional[] {
  const lng = (bbox[0] + bbox[2]) / 2, lat = (bbox[1] + bbox[3]) / 2;
  return COBERTURAS
    .filter(c => lng >= c.bbox[0] && lng <= c.bbox[2] && lat >= c.bbox[1] && lat <= c.bbox[3])
    .map(c => c.fuente);
}
