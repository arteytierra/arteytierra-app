/**
 * Subdivisión geométrica de potreros (C1b) — dibuja sobre el mapa las parcelas
 * de rotación calculadas por el módulo de pastoreo (C1) y ubica los bebederos
 * con su radio de cobertura.
 *
 * El polígono del predio se corta en una grilla de parcelas de área ~igual
 * (cortes por área acumulada, no por distancia), para que cada potrero
 * represente aproximadamente los mismos días de pastoreo. Orientativo: es un
 * esquema de planificación, no un amojonamiento.
 */
import * as turf from '@turf/turf';
import type { Mojon } from './types';

export interface Potrero {
  id:       number;
  vertices: Array<{ lat: number; lng: number }>;
  area_ha:  number;
}

export interface Bebedero {
  lat: number;
  lng: number;
}

export interface PotrerosLayout {
  potreros:  Potrero[];
  bebederos: Bebedero[];
  radio_m:   number;   // radio de cobertura del bebedero
  n:         number;   // parcelas efectivamente generadas
}

type Poly = GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>;

/** Recorta el polígono a una caja, devolviendo siempre un feature poligonal. */
function clip(poly: Poly, box: [number, number, number, number]): Poly {
  return turf.bboxClip(poly, box) as Poly;
}

/** Área (m²) del recorte del polígono dentro de una caja [minX,minY,maxX,maxY]. */
function areaClip(poly: Poly, box: [number, number, number, number]): number {
  try { return turf.area(clip(poly, box)); } catch { return 0; }
}

/** Busca la coordenada del eje que deja `objetivo` m² de área acumulada. */
function cortePorArea(
  poly: Poly, minX: number, minY: number, maxX: number, maxY: number,
  objetivo: number, eje: 'x' | 'y',
): number {
  let lo = eje === 'x' ? minX : minY;
  let hi = eje === 'x' ? maxX : maxY;
  for (let it = 0; it < 26; it++) {
    const mid = (lo + hi) / 2;
    const box: [number, number, number, number] =
      eje === 'x' ? [minX, minY, mid, maxY] : [minX, minY, maxX, mid];
    if (areaClip(poly, box) < objetivo) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Extrae el anillo exterior (el mayor si es MultiPolygon) como lat/lng. */
function anillo(feat: Poly): Array<{ lat: number; lng: number }> | null {
  const g = feat.geometry;
  if (!g) return null;
  let coords: number[][] | null = null;
  if (g.type === 'Polygon') {
    coords = g.coordinates[0] ?? null;
  } else if (g.type === 'MultiPolygon') {
    let mejor: number[][] | null = null;
    let mejorA = 0;
    for (const p of g.coordinates) {
      const ring = p[0];
      if (!ring) continue;
      const a = turf.area(turf.polygon([ring]));
      if (a > mejorA) { mejorA = a; mejor = ring; }
    }
    coords = mejor;
  }
  if (!coords || coords.length < 4) return null;
  return coords.map(([lng, lat]) => ({ lat: lat!, lng: lng! }));
}

/**
 * Subdivide el predio en ~nObjetivo potreros de área similar y ubica nBebederos
 * repartidos, cada uno con `radioBebedero` metros de cobertura.
 */
export function subdividirPotreros(
  mojones: Mojon[],
  nObjetivo: number,
  nBebederos = 1,
  radioBebedero = 300,
): PotrerosLayout | null {
  if (mojones.length < 3 || nObjetivo < 1) return null;

  const ring = mojones.map(m => [m.lng, m.lat] as [number, number]);
  const first = ring[0]!;
  ring.push(first);
  let poly: Poly;
  try { poly = turf.polygon([ring]); } catch { return null; }

  const [minX, minY, maxX, maxY] = turf.bbox(poly);
  const total = turf.area(poly);
  if (total <= 0) return null;

  // Grilla ~cuadrada: cols columnas × rows filas
  const cols = Math.max(1, Math.round(Math.sqrt(nObjetivo)));
  const rows = Math.max(1, Math.round(nObjetivo / cols));

  // Cortes verticales de área igual (columnas)
  const xEdges = [minX];
  for (let c = 1; c < cols; c++) {
    xEdges.push(cortePorArea(poly, minX, minY, maxX, maxY, (total * c) / cols, 'x'));
  }
  xEdges.push(maxX);

  const potreros: Potrero[] = [];
  let id = 1;
  for (let c = 0; c < cols; c++) {
    const x0 = xEdges[c]!, x1 = xEdges[c + 1]!;
    let franja: Poly;
    try { franja = clip(poly, [x0, minY, x1, maxY]); } catch { continue; }
    const franjaArea = turf.area(franja);
    if (franjaArea <= 0) continue;
    const fb = turf.bbox(franja);
    const [, fMinY, , fMaxY] = fb;

    // Cortes horizontales de área igual dentro de la franja (filas)
    const yEdges = [fMinY];
    for (let r = 1; r < rows; r++) {
      yEdges.push(cortePorArea(franja, x0, fMinY, x1, fMaxY, (franjaArea * r) / rows, 'y'));
    }
    yEdges.push(fMaxY);

    for (let r = 0; r < rows; r++) {
      const y0 = yEdges[r]!, y1 = yEdges[r + 1]!;
      let celda: Poly;
      try { celda = clip(franja, [x0, y0, x1, y1]); } catch { continue; }
      const a = turf.area(celda);
      if (a < total * 0.01) continue;   // descarta astillas de borde (<1 % del predio)
      const verts = anillo(celda);
      if (!verts) continue;
      potreros.push({ id: id++, vertices: verts, area_ha: Math.round((a / 10000) * 100) / 100 });
    }
  }

  if (potreros.length === 0) return null;

  // Bebederos repartidos: centroide de potreros elegidos a intervalos regulares
  const nBeb = Math.max(1, Math.min(nBebederos, potreros.length));
  const bebederos: Bebedero[] = [];
  for (let k = 0; k < nBeb; k++) {
    const idx = Math.min(potreros.length - 1, Math.floor(((k + 0.5) / nBeb) * potreros.length));
    const p = potreros[idx]!;
    const poligono = turf.polygon([[
      ...p.vertices.map(v => [v.lng, v.lat] as [number, number]),
      [p.vertices[0]!.lng, p.vertices[0]!.lat],
    ]]);
    const c = turf.centroid(poligono);
    bebederos.push({ lng: c.geometry.coordinates[0]!, lat: c.geometry.coordinates[1]! });
  }

  return { potreros, bebederos, radio_m: radioBebedero, n: potreros.length };
}
