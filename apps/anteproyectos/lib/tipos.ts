/**
 * Modelo de dominio del generador de anteproyectos.
 * Independiente de clima o perfil: el mismo programa de necesidades alimenta
 * los 3(+1) perfiles de diseño.
 */

export type TipoAmbiente =
  | 'dormitorio'
  | 'bano'
  | 'estar-cocina-comedor'
  | 'garage'
  | 'hall'
  | 'estudio'
  | 'lavadero'
  | 'despensa'
  | 'invernadero'
  | 'biofiltro'
  | 'galeria'
  | 'taller'
  | 'otro';

export const TAMANOS = ['chico', 'mediano', 'grande'] as const;
export type Tamano = (typeof TAMANOS)[number];

export interface AmbienteDeseado {
  id: string;
  tipo: TipoAmbiente;
  /** Solo si tipo === 'otro', o para aclarar (ej. "Dormitorio principal"). */
  nombre?: string;
  cantidad: number;
  /** Si se conoce, manda sobre el tamaño cualitativo. */
  m2Aprox?: number;
  tamano?: Tamano;
  /** ids de otros AmbienteDeseado con los que debería tener contacto directo. */
  adyacenciasDeseadas?: string[];
}

export interface ProgramaNecesidades {
  m2CubiertosObjetivo: number;
  ambientes: AmbienteDeseado[];
}

export interface Sitio {
  lat: number;
  lng: number;
  nombre?: string;
}

export type PerfilId = 'fiel-cliente' | 'organico' | 'bioclimatico' | 'autoconstruccion';

export type NivelCualitativo = 'bajo' | 'medio' | 'alto';

export interface ParametrosTransversales {
  nivelAutoconstruccion: NivelCualitativo;
  modularidadEtapas: boolean;
  pesoIntegracionProductiva: NivelCualitativo;
  gradoGeometriaSagrada: 'sutil' | 'medio' | 'marcado';
}

export const PARAMETROS_TRANSVERSALES_DEFAULT: ParametrosTransversales = {
  nivelAutoconstruccion: 'medio',
  modularidadEtapas: false,
  pesoIntegracionProductiva: 'medio',
  gradoGeometriaSagrada: 'sutil',
};

export interface Proyecto {
  id: string;
  nombre: string;
  sitio: Sitio;
  programa: ProgramaNecesidades;
  parametros: ParametrosTransversales;
  perfilesActivos: PerfilId[];
}
