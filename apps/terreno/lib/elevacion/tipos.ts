/**
 * Capa de proveedores de elevación (DEM multi-fuente). Server-side.
 *
 * Ruteo (regla del audit B): DEM del usuario > servicio nacional > GLO-30 global.
 * En esta tanda solo hay GLO-30 (Copernicus, AWS COGs) con SRTM de respaldo;
 * los proveedores nacionales entran en la Tanda 2 reusando el mismo lector raster.
 */

export type BBox = [number, number, number, number]; // [oeste, sur, este, norte]

export interface LatLng { lat: number; lng: number }

export type FuenteDEM = 'usuario' | 'glo30' | 'openmeteo' | 'srtm30' | 'usgs3dep' | 'ignfr' | 'ignes' | 'hrdemca' | 'ahnnl' | 'swisstopo';

/**
 * Lo que devuelve un proveedor nacional cuando el paso de la fuente NO es una
 * constante del catálogo.
 *
 * Casi todos tienen un paso fijo y devuelven la grilla pelada. swisstopo no:
 * publica el mismo km² en 0,5 m y en 2 m, y cuál se usa lo decide el tamaño del
 * predio, así que el número tiene que viajar CON la grilla. Si se quedara en el
 * `Record` por fuente de `PASO_RELIEVE`, la app diría 2 m sobre un relieve de
 * 0,5 m y se negaría a dibujar curvas que el dato sí aguanta —exactamente el
 * error que ya se arregló al revés, cuando decía SRTM 30 m sobre swissALTI3D.
 */
export interface GrillaProveedor {
  elev: Float32Array;
  /** Paso horizontal del ráster efectivamente leído, en metros. */
  pasoFuenteM: number;
}

export interface ResultadoPuntos {
  /** Cota (m) por punto, en el MISMO orden que la entrada; null = sin dato. */
  elevaciones: Array<number | null>;
  fuente: FuenteDEM;
}
