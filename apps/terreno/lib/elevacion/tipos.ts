/**
 * Capa de proveedores de elevación (DEM multi-fuente). Server-side.
 *
 * Ruteo (regla del audit B): DEM del usuario > servicio nacional > GLO-30 global.
 * En esta tanda solo hay GLO-30 (Copernicus, AWS COGs) con SRTM de respaldo;
 * los proveedores nacionales entran en la Tanda 2 reusando el mismo lector raster.
 */

export type BBox = [number, number, number, number]; // [oeste, sur, este, norte]

export interface LatLng { lat: number; lng: number }

export type FuenteDEM = 'usuario' | 'glo30' | 'srtm30' | 'usgs3dep' | 'ignfr';

export interface ResultadoPuntos {
  /** Cota (m) por punto, en el MISMO orden que la entrada; null = sin dato. */
  elevaciones: Array<number | null>;
  fuente: FuenteDEM;
}
