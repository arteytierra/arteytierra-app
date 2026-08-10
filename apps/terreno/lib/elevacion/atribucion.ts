import type { FuenteDEM } from './tipos';

/** Crédito legal por fuente de relieve. Copernicus EXIGE atribución. */
export const ATRIBUCION: Record<FuenteDEM, string> = {
  usuario:  'DEM propio del usuario',
  glo30:    'Copernicus GLO-30 · © DLR e.V. 2010-2014 y © Airbus Defence and Space GmbH 2014-2018, provisto bajo COPERNICUS por la UE y la ESA',
  srtm30:   'SRTM 30 m · NASA / USGS (OpenTopoData)',
  usgs3dep: 'USGS 3DEP · U.S. Geological Survey (The National Map, dominio público)',
  ignfr:    'RGE ALTI · © IGN France (Géoplateforme, Licence Ouverte / Etalab 2.0)',
  ignes:    'MDT PNOA-LiDAR · © Instituto Geográfico Nacional de España (CC-BY 4.0, scne.es)',
};

/** Etiqueta corta para la esquina del mapa. */
export const ATRIBUCION_CORTA: Record<FuenteDEM, string> = {
  usuario:  'DEM propio',
  glo30:    'Copernicus GLO-30',
  srtm30:   'SRTM 30 m',
  usgs3dep: 'USGS 3DEP',
  ignfr:    'IGN RGE ALTI',
  ignes:    'IGN España MDT',
};

export function atribucionDe(f: FuenteDEM): string { return ATRIBUCION[f]; }
