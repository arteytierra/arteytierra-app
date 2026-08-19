export interface Pin {
  id:     string;
  lat:    number;
  lng:    number;
  nombre: string;
  color:  string;
  icono:  string;
  notas:  string;
  /** Origen automático (para poder ocultar en bloque las sugerencias generadas). */
  origen?: 'analisis';
  /** Sub-capa a la que pertenece (categoría dentro de la carpeta de origen). */
  capa?:  string;
  /** Carpeta de usuario (Escala de permanencia) donde está archivado. */
  capaId?: string;
}

export const ICONOS_PIN = ['📍', '🏠', '💧', '🌳', '⛏️', '🔥', '🌾', '🐄', '🐓', '⚡', '🚪', '📸'] as const;

export function crearPin(lat: number, lng: number): Pin {
  return {
    id:     crypto.randomUUID(),
    lat,
    lng,
    nombre: 'Punto de interés',
    color:  '#D9A441',
    icono:  '📍',
    notas:  '',
  };
}
