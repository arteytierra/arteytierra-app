/** Elementos de dibujo libre sobre el mapa. */

export type TipoDibujo = 'linea' | 'poligono' | 'curva' | 'circulo' | 'texto';

interface DBase { id: string; tipo: TipoDibujo; color: string; nombre?: string; notas?: string }

export interface DibujoLinea extends DBase {
  tipo: 'linea';
  vertices: Array<{ lat: number; lng: number }>;
  grosor: number;
}

export interface DibujoPoligono extends DBase {
  tipo: 'poligono';
  vertices: Array<{ lat: number; lng: number }>;
  opacidad: number;
}

export interface DibujoCurva extends DBase {
  tipo: 'curva';
  vertices: Array<{ lat: number; lng: number }>;
  grosor: number;
}

export interface DibujoCirculo extends DBase {
  tipo: 'circulo';
  lat: number;
  lng: number;
  radio: number;   // metros
  opacidad: number;
}

export interface DibujoTexto extends DBase {
  tipo: 'texto';
  lat: number;
  lng: number;
  texto: string;
  tamano: number;
}

export type ElementoDibujo =
  | DibujoLinea | DibujoPoligono | DibujoCurva
  | DibujoCirculo | DibujoTexto;

export interface DibujoEnCurso {
  tipo: TipoDibujo;
  vertices: Array<{ lat: number; lng: number }>;
}

export const COLORES_DIBUJO = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#3B82F6', '#A855F7', '#FFFFFF', '#1C1917',
] as const;

/** Distancia Haversine en metros entre dos coordenadas. */
export function distanciaMetros(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371000;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const dφ = (lat2 - lat1) * Math.PI / 180;
  const dλ = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
