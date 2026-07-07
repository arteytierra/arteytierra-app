/**
 * Cut & fill de represas / embalses: estima el volumen de agua almacenable y el
 * movimiento de suelo de una represa dibujada, integrando la grilla densa de
 * elevación dentro del polígono a un nivel de agua dado.
 * Aproximación desde SRTM ~30 m — orientativa para predimensionar.
 */
import type { GrillaElevacion } from './grillaElevacion';

export interface ResultadoEmbalse {
  nivelAgua_m:      number;
  volumen_m3:       number;   // agua almacenada (= excavación en dugout)
  area_inundada_m2: number;
  prof_max_m:       number;
  prof_media_m:     number;
  elev_min:         number;   // fondo
  elev_max:         number;   // borde más alto dentro del polígono
  ancho_max_m:      number;   // span máximo del vaso (sugerencia de largo de coronamiento)
  celdas:           number;
}

// ── Dimensionamiento del muro de represa (sección trapezoidal) ──
export interface ParamsMuro {
  profMax_m:     number;   // profundidad máxima del agua (del embalse)
  revancha_m:    number;   // borde libre sobre el nivel de agua
  anchoCorona_m: number;   // ancho de la coronación
  taludInterno:  number;   // talud aguas arriba (H:1V), ej. 3
  taludExterno:  number;   // talud aguas abajo (H:1V), ej. 2
  longitud_m:    number;   // largo del coronamiento (eje del muro)
}
export interface ResultadoMuro {
  alto_m:           number;
  anchoCorona_m:    number;
  anchoBase_m:      number;
  anguloInterno_deg:number;  // inclinación del talud aguas arriba (desde la horizontal)
  anguloExterno_deg:number;  // inclinación del talud aguas abajo
  seccion_m2:       number;  // área de la sección trapezoidal
  longitud_m:       number;
  volumenTierra_m3: number;  // terraplén
}

function puntoEnPoligono(lat: number, lng: number, poly: Array<{ lat: number; lng: number }>): boolean {
  let dentro = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i]!.lng, yi = poly[i]!.lat;
    const xj = poly[j]!.lng, yj = poly[j]!.lat;
    const cruza = (yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (cruza) dentro = !dentro;
  }
  return dentro;
}

/** Elevaciones del terreno dentro del polígono (muestreadas de la grilla). */
function elevacionesDentro(g: GrillaElevacion, poly: Array<{ lat: number; lng: number }>) {
  const { rows, cols, latMin, latMax, lngMin, lngMax, elev } = g;
  const out: number[] = [];
  for (let r = 0; r < rows; r++) {
    const lat = latMin + (r / (rows - 1)) * (latMax - latMin);
    for (let c = 0; c < cols; c++) {
      const v = elev[r * cols + c]!;
      if (isNaN(v)) continue;
      const lng = lngMin + (c / (cols - 1)) * (lngMax - lngMin);
      if (puntoEnPoligono(lat, lng, poly)) out.push(v);
    }
  }
  return out;
}

/** Área de una celda de la grilla en m² (a la latitud media). */
function areaCelda(g: GrillaElevacion): number {
  const latMid = (g.latMin + g.latMax) / 2;
  const latStep = ((g.latMax - g.latMin) / (g.rows - 1)) * 111_320;
  const lngStep = ((g.lngMax - g.lngMin) / (g.cols - 1)) * 111_320 * Math.cos(latMid * Math.PI / 180);
  return Math.abs(latStep * lngStep);
}

/** Rango de elevación del terreno dentro del polígono (para sugerir niveles). */
export function rangoElevacionPoligono(g: GrillaElevacion, poly: Array<{ lat: number; lng: number }>): { min: number; max: number; celdas: number } | null {
  const es = elevacionesDentro(g, poly);
  if (es.length < 3) return null;
  return { min: Math.min(...es), max: Math.max(...es), celdas: es.length };
}

/**
 * Calcula el embalse para un nivel de agua dado. Si no se pasa, usa el 60% del
 * desnivel interno (un llenado razonable sin desbordar el borde más bajo).
 */
export function calcularEmbalse(
  g: GrillaElevacion,
  poly: Array<{ lat: number; lng: number }>,
  nivelAgua?: number,
): ResultadoEmbalse | null {
  const es = elevacionesDentro(g, poly);
  if (es.length < 3) return null;
  const elev_min = Math.min(...es);
  const elev_max = Math.max(...es);
  const nivel = nivelAgua ?? (elev_min + (elev_max - elev_min) * 0.6);

  const aCelda = areaCelda(g);
  let volumen = 0, area = 0, profMax = 0;
  for (const groundE of es) {
    if (groundE < nivel) {
      const prof = nivel - groundE;
      volumen += prof * aCelda;
      area    += aCelda;
      if (prof > profMax) profMax = prof;
    }
  }
  if (area === 0) return null;

  // Span máximo del vaso (distancia máxima entre vértices) → sugerencia de largo de muro
  let anchoMax = 0;
  const latMid = (g.latMin + g.latMax) / 2 * Math.PI / 180;
  for (let i = 0; i < poly.length; i++) {
    for (let j = i + 1; j < poly.length; j++) {
      const dx = (poly[j]!.lng - poly[i]!.lng) * 111_320 * Math.cos(latMid);
      const dy = (poly[j]!.lat - poly[i]!.lat) * 111_320;
      const d = Math.hypot(dx, dy);
      if (d > anchoMax) anchoMax = d;
    }
  }

  return {
    nivelAgua_m:      Math.round(nivel * 10) / 10,
    volumen_m3:       Math.round(volumen),
    area_inundada_m2: Math.round(area),
    prof_max_m:       Math.round(profMax * 10) / 10,
    prof_media_m:     Math.round((volumen / area) * 10) / 10,
    elev_min:         Math.round(elev_min * 10) / 10,
    elev_max:         Math.round(elev_max * 10) / 10,
    ancho_max_m:      Math.round(anchoMax),
    celdas:           es.length,
  };
}

/**
 * Dimensiona el muro de la represa como una sección trapezoidal.
 * alto = profundidad máx + revancha; base = corona + alto·(talud int + talud ext).
 * Los taludes se expresan como H:1V (cuántos metros horizontales por metro vertical).
 */
export function dimensionarMuro(p: ParamsMuro): ResultadoMuro {
  const alto = Math.max(0.1, p.profMax_m + p.revancha_m);
  const anchoBase = p.anchoCorona_m + alto * (p.taludInterno + p.taludExterno);
  const seccion = ((p.anchoCorona_m + anchoBase) / 2) * alto;
  const anguloInterno = Math.atan2(1, p.taludInterno) * 180 / Math.PI;
  const anguloExterno = Math.atan2(1, p.taludExterno) * 180 / Math.PI;
  return {
    alto_m:            Math.round(alto * 10) / 10,
    anchoCorona_m:     p.anchoCorona_m,
    anchoBase_m:       Math.round(anchoBase * 10) / 10,
    anguloInterno_deg: Math.round(anguloInterno),
    anguloExterno_deg: Math.round(anguloExterno),
    seccion_m2:        Math.round(seccion * 10) / 10,
    longitud_m:        Math.round(p.longitud_m),
    volumenTierra_m3:  Math.round(seccion * p.longitud_m),
  };
}
