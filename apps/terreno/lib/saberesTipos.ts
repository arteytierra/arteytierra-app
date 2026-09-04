/**
 * Tipos de la capa de saberes territoriales.
 *
 * Viven separados de `saberesTerritoriales.ts` porque ese archivo es generado y
 * de `saberes.ts` porque el registro de geometrías los necesita sin arrastrar
 * los 85 registros. Acá no hay datos ni lógica: sólo formas.
 *
 * La diferencia con `SaberCultural` de `biomaTipos.ts` es deliberada. Aquel es
 * un párrafo dentro de una ficha de bioma: describe, no se activa, y no dice de
 * quién es. Éste tiene portadores, países, cautelas y un estado territorial,
 * porque se activa o no se activa sobre el predio de alguien.
 */

/** Dónde está parada la geometría de un saber. El orden es el del avance. */
export type EstadoTerritorio =
  /** Hay inventario narrativo y fuentes, no hay polígono. Es el estado de casi todos. */
  | 'documentado_sin_geometria'
  /** Existe cartografía oficial publicada pero falta verificar la licencia de uso. */
  | 'cartografia_oficial_sin_licencia'
  /** Hay polígono cargado en el registro, pendiente de revisión con los portadores. */
  | 'geometria_propuesta'
  /** Polígono, procedencia, licencia y revisión completas. Único estado activable. */
  | 'aprobado';

export interface FuenteSaber {
  label: string;
  url: string;
  /** Fecha en que se verificó que la URL responde y dice lo que se cita. */
  revisada: string;
}

export interface SaberTerritorial {
  id: string;
  nombre: string;
  region: 'mesoamerica-caribe' | 'mexico-estados-unidos' | 'europa-occidental' | 'sudamerica';
  /** Pueblo, comunidad o tradición portadora, tal como la nombran las fuentes. */
  portadores: string;
  /** ISO 3166-1 alfa-2. Filtra; nunca alcanza para activar. */
  paises: string[];
  /** ECO_ID de RESOLVE donde el saber tiene sentido. Vacío = no filtra por ecorregión. */
  ecoIdsCompatibles: number[];
  /** La unidad territorial más chica que el saber admite, en palabras de la fuente. */
  territorioMinimo: string;
  /** Lo que se puede decir en público sin poner en boca de nadie lo que no dijo. */
  sintesisPublica: string;
  /** Lo que explícitamente no se debe inferir ni prescribir. Se muestra siempre. */
  cautelas: string[];
  fuentes: FuenteSaber[];
  estado: EstadoTerritorio;
  /** Archivo de `_research/` del que salió, para poder auditar el dato. */
  fuenteInventario: string;
}

/**
 * Un polígono con su papeleo. Sin los cuatro campos de procedencia no entra al
 * registro: una geometría sin fuente ni licencia es exactamente el problema que
 * esta capa existe para no tener.
 */
export interface GeometriaSaber {
  /** Igual al `id` del saber que habilita. */
  saberId: string;
  tipo: 'sitio' | 'admin' | 'territorio_indigena' | 'comunitario';
  /** Quién publica el polígono. */
  fuente: string;
  url: string;
  /** Debe estar en `LICENCIAS_ADMITIDAS`. */
  licencia: string;
  revisada: string;
  /**
   * Anillos en WGS84, `[lng, lat]`, primero el exterior. Mismo orden que GeoJSON
   * y que el resto de `lib/`, así se pasa a turf sin dar vuelta nada.
   */
  anillos: Array<Array<[number, number]>>;
}
