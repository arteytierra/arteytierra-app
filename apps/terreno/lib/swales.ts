/**
 * Zanjas de infiltración (swales): zanjas A NIVEL, siguiendo la curva de nivel,
 * espaciadas ladera abajo para interceptar la escorrentía y hacerla infiltrar.
 *
 * Se generan como curvas de nivel a un intervalo VERTICAL elegido (la separación
 * entre swales) y se recortan al predio. Para cada una se estima el agua que
 * intercepta en un evento de lluvia de diseño: la franja aguas arriba (hasta el
 * swale siguiente) capta lluvia y escurre hacia la zanja.
 *
 *   ancho de franja ≈ intervaloVertical / pendiente_media   (separación horizontal
 *   entre curvas); volumen = largo · ancho · lluvia · coef. de escorrentía.
 *
 * Orientativo: no dimensiona la sección de la zanja ni valida el suelo; sirve para
 * planear el trazado y estimar captación. Complementa el mapa de erosión (dónde) y
 * las escorrentías (por dónde va el agua).
 */
import * as turf from '@turf/turf';
import type { GrillaElevacion } from './grillaElevacion';
import { calcularCurvas } from './curvasNivel';

export interface SwaleLinea {
  cota:        number;
  puntos:      Array<{ lat: number; lng: number }>;
  longitud_m:  number;
  captacion_ha: number;
  volumen_m3:  number;
}

export interface OpcionesSwales {
  intervaloV: number;   // separación vertical entre swales (m)
  precipMm:   number;   // lluvia de diseño (mm por evento)
  coef:       number;   // coeficiente de escorrentía 0..1
}

export interface ResultadoSwales {
  swales:        SwaleLinea[];
  total_long_m:  number;
  total_vol_m3:  number;
  total_capt_ha: number;
  ancho_franja_m: number;
  intervaloV:    number;
}

const LARGO_MIN_M = 15;   // descarta tramos sueltos demasiado cortos

export function calcularSwales(
  grilla:  GrillaElevacion,
  mojones: Array<{ lat: number; lng: number }>,
  opts:    OpcionesSwales,
): ResultadoSwales | null {
  const { intervaloV, precipMm, coef } = opts;
  if (!(intervaloV > 0) || grilla.elev_max - grilla.elev_min < intervaloV) return null;

  // Proyección local a metros.
  const latRef = (grilla.latMin + grilla.latMax) / 2;
  const kx = 111_320 * Math.cos(latRef * Math.PI / 180);
  const ky = 111_320;
  const anchoM = (grilla.lngMax - grilla.lngMin) * kx;
  const altoM  = (grilla.latMax - grilla.latMin) * ky;
  const diagM  = Math.hypot(anchoM, altoM);

  // Pendiente media del predio → separación horizontal entre swales (ancho de franja).
  const pendMedia = Math.max((grilla.elev_max - grilla.elev_min) / Math.max(diagM, 1), 0.008);
  const anchoFranja = Math.min(150, Math.max(4, intervaloV / pendMedia));

  const poly = polígonoDe(mojones);

  const curvas = calcularCurvas(grilla, intervaloV);
  if (curvas.length === 0) return null;

  const swales: SwaleLinea[] = [];
  for (const curva of curvas) {
    for (const linea of curva.lineas) {
      // Partir la línea en tramos consecutivos que caen dentro del predio.
      for (const tramo of tramosDentro(linea.puntos, poly)) {
        const longitud = longitudM(tramo, kx, ky);
        if (longitud < LARGO_MIN_M) continue;
        const captacion_m2 = longitud * anchoFranja;
        const volumen = captacion_m2 * (precipMm / 1000) * coef;
        swales.push({
          cota: curva.cota,
          puntos: tramo,
          longitud_m: Math.round(longitud),
          captacion_ha: +(captacion_m2 / 10_000).toFixed(3),
          volumen_m3: Math.round(volumen),
        });
      }
    }
  }
  if (swales.length === 0) return null;

  return {
    swales,
    total_long_m:  Math.round(swales.reduce((s, x) => s + x.longitud_m, 0)),
    total_vol_m3:  Math.round(swales.reduce((s, x) => s + x.volumen_m3, 0)),
    total_capt_ha: +(swales.reduce((s, x) => s + x.captacion_ha, 0)).toFixed(2),
    ancho_franja_m: Math.round(anchoFranja),
    intervaloV,
  };
}

function polígonoDe(mojones: Array<{ lat: number; lng: number }>): ReturnType<typeof turf.polygon> | null {
  if (mojones.length < 3) return null;
  const anillo = mojones.map(m => [m.lng, m.lat] as [number, number]);
  anillo.push(anillo[0]!);
  try { return turf.polygon([anillo]); } catch { return null; }
}

/** Parte una polilínea en los tramos consecutivos cuyos vértices caen dentro del predio. */
function tramosDentro(
  puntos: Array<{ lat: number; lng: number }>,
  poly:   ReturnType<typeof turf.polygon> | null,
): Array<Array<{ lat: number; lng: number }>> {
  if (!poly) return puntos.length >= 2 ? [puntos] : [];
  const tramos: Array<Array<{ lat: number; lng: number }>> = [];
  let actual: Array<{ lat: number; lng: number }> = [];
  for (const p of puntos) {
    if (turf.booleanPointInPolygon(turf.point([p.lng, p.lat]), poly)) {
      actual.push(p);
    } else if (actual.length) {
      tramos.push(actual);
      actual = [];
    }
  }
  if (actual.length) tramos.push(actual);
  return tramos.filter(t => t.length >= 2);
}

function longitudM(puntos: Array<{ lat: number; lng: number }>, kx: number, ky: number): number {
  let total = 0;
  for (let i = 1; i < puntos.length; i++) {
    const a = puntos[i - 1]!, b = puntos[i]!;
    total += Math.hypot((b.lng - a.lng) * kx, (b.lat - a.lat) * ky);
  }
  return total;
}
