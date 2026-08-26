/**
 * Contrato compartido entre las dos pistas de expansión de
 * apps/anteproyectos (ver apps/anteproyectos/PLAN-DOS-PISTAS.md, §3 — v3,
 * cerrado en Checkpoint 0 el 25/08/2026 entre Claude y ChatGPT).
 *
 * Sin dependencias de framework. Ninguna pista importa módulos internos de
 * la otra — sólo este paquete y los dos adaptadores simétricos:
 * - Pista A exporta DEM → ModeloSitio (apps/anteproyectos/lib/sitio/).
 * - Pista B exporta modelo de edificio → ObjetoVolumen[] (lib/motor/).
 */

export interface PuntoLocal {
  x_m: number;
  y_m: number;
  z_m?: number;
}

export interface SistemaLocal {
  origen: { lat: number; lng: number; elevacion_m: number };
  /**
   * Giro del eje Y local respecto del norte geográfico verdadero, sentido
   * horario, 0–360°. Misma convención que azimut_deg en el resto del
   * contrato. Si el eje Y local coincide con el norte, norte_deg = 0.
   */
  norte_deg: number;
  crs?: string;
}

export interface GrillaElevacion {
  /** Elevación absoluta (msnm), mismo datum que origen.elevacion_m. */
  valores_m: number[][];
  origenLocal: PuntoLocal;
  pasoX_m: number;
  pasoY_m: number;
  filas: number;
  columnas: number;
  nodata?: number;
  fuente: 'glo30' | 'srtm' | 'propio';
}

export interface ModeloSitio {
  id: string;
  sistema: SistemaLocal;
  poligono: PuntoLocal[];
  linderos: { id: string; desde: PuntoLocal; hasta: PuntoLocal; azimut_deg: number; largo_m: number }[];
  elevacion: GrillaElevacion;
  accesos: { id: string; punto: PuntoLocal; tipo: 'peatonal' | 'vehicular' | 'mixto'; prioridad: number }[];
  vistas: { id: string; desde: PuntoLocal; azimut_deg: number; apertura_deg: number; calidad: number; deseable: boolean }[];
  restricciones?: { retiros_m?: number; poligonosNoEdificables?: PuntoLocal[][]; cotaInundable_m?: number };
}

export type TipoVolumen = 'muro' | 'cubierta' | 'alero' | 'galeria' | 'obstaculo' | 'vegetacion';

interface ObjetoVolumenBase {
  id: string;
  tipo: TipoVolumen;
  opacidadSolar?: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface ObjetoPrisma extends ObjetoVolumenBase {
  geometria: 'prisma';
  /** Huella horizontal. El z_m de cada vértice se ignora. */
  vertices: PuntoLocal[];
  z0_m: number;
  altura_m: number;
}

export interface ObjetoSuperficie extends ObjetoVolumenBase {
  geometria: 'superficie';
  /** Todos los vértices llevan z_m y deben ser coplanares. Orden
   *  antihorario visto desde el exterior/superior, para una normal
   *  consistente. */
  vertices: Array<PuntoLocal & { z_m: number }>;
  espesor_m?: number;
}

/** muro/alero/vegetacion/obstaculo: normalmente `prisma`.
 *  cubierta (faldón de techo): normalmente `superficie`. */
export type ObjetoVolumen = ObjetoPrisma | ObjetoSuperficie;

export interface ResultadoInsolacionObjeto {
  objetoId: string;
  horasSol: number;
  energiaRelativa?: number;
  porcentajeSombreado: number;
  muestras: { hora: number; iluminado: boolean; porcentajeSombreado: number }[];
}

export interface MapaInsolacion {
  fecha: string;
  resultados: ResultadoInsolacionObjeto[];
}

/**
 * El punto de desacople clave del Checkpoint 0: B1/B2 arrancan con un
 * evaluador provisional y cambian a esta interfaz al motor real de la
 * Pista A sin tocar el generador. Ver PLAN-DOS-PISTAS.md §5.
 */
export interface EvaluadorSolar {
  evaluar(volumenes: ObjetoVolumen[], sitio: ModeloSitio, fecha: Date, horas: number[]): Promise<MapaInsolacion>;
}
