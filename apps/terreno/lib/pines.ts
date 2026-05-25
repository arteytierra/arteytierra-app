export interface Pin {
  id:     string;
  lat:    number;
  lng:    number;
  nombre: string;
  color:  string;
  icono:  string;
  notas:  string;
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
