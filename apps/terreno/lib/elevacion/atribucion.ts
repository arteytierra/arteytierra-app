import type { FuenteDEM } from './tipos';

/** Crédito legal por fuente de relieve. Copernicus EXIGE atribución. */
export const ATRIBUCION: Record<FuenteDEM, string> = {
  usuario: 'DEM propio del usuario',
  glo30:   'Copernicus GLO-30 · © DLR e.V. 2010-2014 y © Airbus Defence and Space GmbH 2014-2018, provisto bajo COPERNICUS por la UE y la ESA',
  srtm30:  'SRTM 30 m · NASA / USGS (OpenTopoData)',
};

/** Etiqueta corta para la esquina del mapa. */
export const ATRIBUCION_CORTA: Record<FuenteDEM, string> = {
  usuario: 'DEM propio',
  glo30:   'Copernicus GLO-30',
  srtm30:  'SRTM 30 m',
};

export function atribucionDe(f: FuenteDEM): string { return ATRIBUCION[f]; }
