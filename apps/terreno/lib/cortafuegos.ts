/**
 * Cortafuegos sobre líneas de cresta (divisorias de agua). Una faja cortafuego se
 * ubica bien sobre las divisorias: cortan la ladera arriba, son de fácil acceso y
 * el fuego pierde impulso al llegar al filo.
 *
 * Las crestas son, geométricamente, las "escorrentías del relieve invertido": si
 * se dan vuelta las cotas, los cauces pasan a ser filos. Por eso se reutiliza el
 * mismo extractor de escorrentías (`calcularEscorrentias`) sobre un shader con las
 * elevaciones negadas — las cadenas resultantes son las líneas de cresta.
 *
 * Orientativo: no reemplaza un plan de manejo del fuego (ancho real según
 * combustible, pendiente y viento; mantenimiento). Estima trazado y superficie.
 */
import * as turf from '@turf/turf';
import type { DatosShader } from './shaders';
import { calcularEscorrentias } from './escorrentias';

export interface LineaCortafuego {
  puntos:     Array<{ lat: number; lng: number }>;
  longitud_m: number;
  area_ha:    number;   // faja despejada = largo × ancho
}

export interface ResultadoCortafuegos {
  lineas:       LineaCortafuego[];
  total_long_m: number;
  total_area_ha: number;
  anchoM:       number;
}

const LARGO_MIN_M = 25;

export function calcularCortafuegos(
  shader:  DatosShader,
  mojones: Array<{ lat: number; lng: number }>,
  anchoM:  number,
): ResultadoCortafuegos | null {
  if (shader.celdas.length < 4 || !(anchoM > 0)) return null;

  // Relieve invertido: cotas negadas → los cauces del invertido son las crestas.
  const invertido: DatosShader = {
    ...shader,
    celdas:   shader.celdas.map(c => ({ ...c, elevation: -c.elevation })),
    elev_min: -shader.elev_max,
    elev_max: -shader.elev_min,
  };
  const esc = calcularEscorrentias(invertido);
  if (esc.cadenas.length === 0) return null;

  const c0 = shader.celdas[0]!;
  const latRef = (c0.latMin + c0.latMax) / 2;
  const kx = 111_320 * Math.cos(latRef * Math.PI / 180);
  const ky = 111_320;
  const poly = polígonoDe(mojones);

  const lineas: LineaCortafuego[] = [];
  for (const cadena of esc.cadenas) {
    for (const tramo of tramosDentro(cadena.puntos, poly)) {
      const longitud = longitudM(tramo, kx, ky);
      if (longitud < LARGO_MIN_M) continue;
      lineas.push({
        puntos: tramo,
        longitud_m: Math.round(longitud),
        area_ha: +((longitud * anchoM) / 10_000).toFixed(3),
      });
    }
  }
  if (lineas.length === 0) return null;

  return {
    lineas,
    total_long_m:  Math.round(lineas.reduce((s, l) => s + l.longitud_m, 0)),
    total_area_ha: +(lineas.reduce((s, l) => s + l.area_ha, 0)).toFixed(2),
    anchoM,
  };
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
