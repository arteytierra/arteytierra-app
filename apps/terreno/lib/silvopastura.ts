/**
 * Silvopastura: líneas de árboles (o forraje leñoso) plantadas A NIVEL sobre las
 * curvas / keylines, con pasto entre las hileras. Da sombra al ganado, forraje,
 * cortina interna y retención de agua y suelo sin sacar la superficie de pastoreo.
 *
 * Se generan como curvas de nivel a una separación vertical (distancia entre
 * hileras) y sobre cada una se ubican árboles a un espaciamiento dado. Sigue el
 * mismo criterio a-nivel que los swales y keylines (agua que infiltra, no que corre).
 *
 * Orientativo: no elige especie ni valida densidad agronómica; planifica trazado
 * y cantidad de plantas.
 */
import * as turf from '@turf/turf';
import type { GrillaElevacion } from './grillaElevacion';
import { calcularCurvas } from './curvasNivel';

export interface HileraSilvo {
  puntos:     Array<{ lat: number; lng: number }>;
  longitud_m: number;
  arboles:    Array<{ lat: number; lng: number }>;
}

export interface OpcionesSilvo {
  intervaloV:      number;  // separación vertical entre hileras (m)
  espaciamiento:   number;  // distancia entre árboles dentro de la hilera (m)
}

export interface ResultadoSilvo {
  hileras:       HileraSilvo[];
  total_long_m:  number;
  total_arboles: number;
  intervaloV:    number;
  espaciamiento: number;
}

const LARGO_MIN_M = 12;

export function calcularSilvopastura(
  grilla:  GrillaElevacion,
  mojones: Array<{ lat: number; lng: number }>,
  opts:    OpcionesSilvo,
): ResultadoSilvo | null {
  const { intervaloV, espaciamiento } = opts;
  if (!(intervaloV > 0) || !(espaciamiento > 0)) return null;
  if (grilla.elev_max - grilla.elev_min < intervaloV) return null;

  const latRef = (grilla.latMin + grilla.latMax) / 2;
  const kx = 111_320 * Math.cos(latRef * Math.PI / 180);
  const ky = 111_320;
  const poly = polígonoDe(mojones);

  const curvas = calcularCurvas(grilla, intervaloV);
  if (curvas.length === 0) return null;

  const hileras: HileraSilvo[] = [];
  for (const curva of curvas) {
    for (const linea of curva.lineas) {
      for (const tramo of tramosDentro(linea.puntos, poly)) {
        const longitud = longitudM(tramo, kx, ky);
        if (longitud < LARGO_MIN_M) continue;
        hileras.push({
          puntos: tramo,
          longitud_m: Math.round(longitud),
          arboles: arbolesEnLinea(tramo, kx, ky, espaciamiento),
        });
      }
    }
  }
  if (hileras.length === 0) return null;

  return {
    hileras,
    total_long_m:  Math.round(hileras.reduce((s, h) => s + h.longitud_m, 0)),
    total_arboles: hileras.reduce((s, h) => s + h.arboles.length, 0),
    intervaloV,
    espaciamiento,
  };
}

/** Coloca puntos a intervalos regulares (metros) a lo largo de la polilínea. */
function arbolesEnLinea(
  puntos: Array<{ lat: number; lng: number }>,
  kx: number, ky: number, paso: number,
): Array<{ lat: number; lng: number }> {
  const out: Array<{ lat: number; lng: number }> = [];
  let desde = paso / 2;   // primer árbol a medio paso del extremo
  let acum = 0;
  for (let i = 1; i < puntos.length; i++) {
    const a = puntos[i - 1]!, b = puntos[i]!;
    const seg = Math.hypot((b.lng - a.lng) * kx, (b.lat - a.lat) * ky);
    if (seg <= 0) continue;
    while (desde <= acum + seg) {
      const t = (desde - acum) / seg;
      out.push({ lat: a.lat + t * (b.lat - a.lat), lng: a.lng + t * (b.lng - a.lng) });
      desde += paso;
    }
    acum += seg;
  }
  return out;
}

function polígonoDe(mojones: Array<{ lat: number; lng: number }>): ReturnType<typeof turf.polygon> | null {
  if (mojones.length < 3) return null;
  const anillo = mojones.map(m => [m.lng, m.lat] as [number, number]);
  anillo.push(anillo[0]!);
  try { return turf.polygon([anillo]); } catch { return null; }
}

function tramosDentro(
  puntos: Array<{ lat: number; lng: number }>,
  poly:   ReturnType<typeof turf.polygon> | null,
): Array<Array<{ lat: number; lng: number }>> {
  if (!poly) return puntos.length >= 2 ? [puntos] : [];
  const tramos: Array<Array<{ lat: number; lng: number }>> = [];
  let actual: Array<{ lat: number; lng: number }> = [];
  for (const p of puntos) {
    if (turf.booleanPointInPolygon(turf.point([p.lng, p.lat]), poly)) actual.push(p);
    else if (actual.length) { tramos.push(actual); actual = []; }
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
