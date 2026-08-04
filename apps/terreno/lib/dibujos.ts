/** Elementos de dibujo libre sobre el mapa. */

export type TipoDibujo = 'linea' | 'poligono' | 'curva' | 'circulo' | 'texto' | 'cota' | 'flecha' | 'punto';

interface DBase { id: string; tipo: TipoDibujo; color: string; nombre?: string; notas?: string; capaId?: string; simbolo?: string }

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

/** Cota de dimensión estilo plano: dos puntos + etiqueta de distancia */
export interface DibujoCota extends DBase {
  tipo: 'cota';
  vertices: Array<{ lat: number; lng: number }>;  // exactamente 2
}

/** Flecha: segmento con punta de flecha en el segundo vértice */
export interface DibujoFlecha extends DBase {
  tipo: 'flecha';
  vertices: Array<{ lat: number; lng: number }>; // exactamente 2
  grosor: number;
}

/** Punto / marcador puntual */
export interface DibujoPunto extends DBase {
  tipo: 'punto';
  lat: number;
  lng: number;
}

export type ElementoDibujo =
  | DibujoLinea | DibujoPoligono | DibujoCurva
  | DibujoCirculo | DibujoTexto | DibujoCota
  | DibujoFlecha | DibujoPunto;

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

/** Azimut geográfico en grados 0–360 (norte = 0, este = 90). */
export function azimutGrados(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const dλ = (lng2 - lng1) * Math.PI / 180;
  const y = Math.sin(dλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(dλ);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

// ─── Medidas ──────────────────────────────────────────────────────────────────

/** Área esférica aproximada de un polígono lat/lng en m² (fórmula de Chamberlain-Duquette). */
export function areaPoligonoM2(vertices: Array<{ lat: number; lng: number }>): number {
  if (vertices.length < 3) return 0;
  const R = 6371000;
  let suma = 0;
  for (let i = 0; i < vertices.length; i++) {
    const a = vertices[i]!;
    const b = vertices[(i + 1) % vertices.length]!;
    suma += ((b.lng - a.lng) * Math.PI / 180) *
            (2 + Math.sin(a.lat * Math.PI / 180) + Math.sin(b.lat * Math.PI / 180));
  }
  return Math.abs(suma * R * R / 2);
}

export function longitudLineaM(vertices: Array<{ lat: number; lng: number }>, cerrada = false): number {
  let total = 0;
  const n = cerrada ? vertices.length : vertices.length - 1;
  for (let i = 0; i < n; i++) {
    const a = vertices[i]!;
    const b = vertices[(i + 1) % vertices.length]!;
    total += distanciaMetros(a.lat, a.lng, b.lat, b.lng);
  }
  return total;
}

export function formatearLongitud(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(2)} km`;
  return `${m.toFixed(m < 100 ? 1 : 0)} m`;
}

export function formatearArea(m2: number): string {
  if (m2 >= 10_000) return `${(m2 / 10_000).toFixed(2)} ha`;
  return `${m2.toFixed(0)} m²`;
}

// ─── Geometría para snaps avanzados ────────────────────────────────────────────
// Proyección planar local: x = lng·cos(latRef), y = lat. Válida para extensiones chicas.

type LL = { lat: number; lng: number };

function proj(p: LL, k: number) { return { x: p.lng * k, y: p.lat }; }
function unproj(x: number, y: number, k: number): LL { return { lat: y, lng: x / k }; }

/** Intersección de los segmentos a-b y c-d (o null si no se cruzan dentro de ambos). */
export function interseccionSegmentos(a: LL, b: LL, c: LL, d: LL): LL | null {
  const k = Math.cos(((a.lat + b.lat) / 2) * Math.PI / 180);
  const p1 = proj(a, k), p2 = proj(b, k), p3 = proj(c, k), p4 = proj(d, k);
  const d1x = p2.x - p1.x, d1y = p2.y - p1.y;
  const d2x = p4.x - p3.x, d2y = p4.y - p3.y;
  const den = d1x * d2y - d1y * d2x;
  if (Math.abs(den) < 1e-12) return null;
  const t = ((p3.x - p1.x) * d2y - (p3.y - p1.y) * d2x) / den;
  const u = ((p3.x - p1.x) * d1y - (p3.y - p1.y) * d1x) / den;
  if (t < 0 || t > 1 || u < 0 || u > 1) return null;
  return unproj(p1.x + t * d1x, p1.y + t * d1y, k);
}

/** Punto más cercano sobre el segmento a-b respecto de p. */
export function puntoMasCercanoEnSegmento(p: LL, a: LL, b: LL): LL {
  const k = Math.cos(a.lat * Math.PI / 180);
  const P = proj(p, k), A = proj(a, k), B = proj(b, k);
  const abx = B.x - A.x, aby = B.y - A.y;
  const len2 = abx * abx + aby * aby;
  if (len2 < 1e-18) return a;
  let t = ((P.x - A.x) * abx + (P.y - A.y) * aby) / len2;
  t = Math.max(0, Math.min(1, t));
  return unproj(A.x + t * abx, A.y + t * aby, k);
}

/** Pie de la perpendicular desde `base` sobre el segmento a-b (null si cae fuera). */
export function pieDePerpendicular(base: LL, a: LL, b: LL): LL | null {
  const k = Math.cos(a.lat * Math.PI / 180);
  const P = proj(base, k), A = proj(a, k), B = proj(b, k);
  const abx = B.x - A.x, aby = B.y - A.y;
  const len2 = abx * abx + aby * aby;
  if (len2 < 1e-18) return null;
  const t = ((P.x - A.x) * abx + (P.y - A.y) * aby) / len2;
  if (t < 0 || t > 1) return null;
  return unproj(A.x + t * abx, A.y + t * aby, k);
}

/** Ángulo interior en el vértice b formado por a-b-c, en grados (0–180). */
export function anguloEnVertice(a: LL, b: LL, c: LL): number {
  const k = Math.cos(b.lat * Math.PI / 180);
  const v1x = (a.lng - b.lng) * k, v1y = a.lat - b.lat;
  const v2x = (c.lng - b.lng) * k, v2y = c.lat - b.lat;
  const dot = v1x * v2x + v1y * v2y;
  const m1 = Math.hypot(v1x, v1y), m2 = Math.hypot(v2x, v2y);
  if (m1 < 1e-15 || m2 < 1e-15) return 0;
  return Math.acos(Math.max(-1, Math.min(1, dot / (m1 * m2)))) * 180 / Math.PI;
}

export interface MedidaDibujo { label: string; valor: string }

/** Medidas legibles de un elemento de dibujo (para toolbar y etiquetas). */
export function medidasDibujo(d: ElementoDibujo): MedidaDibujo[] {
  switch (d.tipo) {
    case 'linea':
    case 'curva':
      return [{ label: 'Longitud', valor: formatearLongitud(longitudLineaM(d.vertices)) }];
    case 'cota': {
      const [a, b] = d.vertices;
      if (!a || !b) return [];
      return [
        { label: 'Distancia', valor: formatearLongitud(distanciaMetros(a.lat, a.lng, b.lat, b.lng)) },
        { label: 'Azimut',    valor: `${azimutGrados(a.lat, a.lng, b.lat, b.lng).toFixed(1)}°` },
      ];
    }
    case 'poligono':
      return [
        { label: 'Área',      valor: formatearArea(areaPoligonoM2(d.vertices)) },
        { label: 'Perímetro', valor: formatearLongitud(longitudLineaM(d.vertices, true)) },
      ];
    case 'circulo':
      return [
        { label: 'Radio', valor: formatearLongitud(d.radio) },
        { label: 'Área',  valor: formatearArea(Math.PI * d.radio * d.radio) },
      ];
    case 'flecha': {
      const [a, b] = d.vertices;
      if (!a || !b) return [];
      return [
        { label: 'Longitud', valor: formatearLongitud(distanciaMetros(a.lat, a.lng, b.lat, b.lng)) },
        { label: 'Azimut',   valor: `${azimutGrados(a.lat, a.lng, b.lat, b.lng).toFixed(1)}°` },
      ];
    }
    case 'texto':
    case 'punto':
      return [];
  }
}
