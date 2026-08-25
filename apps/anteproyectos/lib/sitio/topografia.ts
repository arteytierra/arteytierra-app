/**
 * Topografía real del sitio: pendiente, orientación de escurrimiento y
 * estadísticas de elevación, calculadas sobre la grilla DEM multi-fuente de
 * @arteytierra/dem (GLO-30 con proveedores nacionales de mayor resolución
 * donde hay cobertura — ver Fase A0 en PLAN-DOS-PISTAS.md).
 *
 * A diferencia de apps/terreno/lib/topografia.ts (que pide OpenTopoData
 * punto a punto, un patrón anterior a A0), esto muestrea la grilla real ya
 * traída por @arteytierra/dem: una sola llamada, misma fuente que va a
 * alimentar sombra/insolación en la Fase A2.
 */
import * as turf from '@turf/turf';
import { obtenerGrillaDEM, type BBox, type GrillaDEM } from '@arteytierra/dem';
import type { Mojon } from './geometria';

export interface PuntoElevacion {
  lat: number;
  lng: number;
  elevation: number;
  etiqueta?: string;
}

export interface DatosTopografia {
  puntos: PuntoElevacion[];      // elevación en cada mojón
  centroide: PuntoElevacion;
  elev_min: number;
  elev_max: number;
  elev_media: number;
  desnivel: number;              // max − min (m)
  pendiente_pct: number;
  pendiente_grados: number;
  orientacion: string;           // dirección del escurrimiento (N, NE...)
  escurrimiento: { desde: PuntoElevacion; hacia: PuntoElevacion }; // alto → bajo
  fuente: string;
}

const ORIENTACIONES = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'] as const;

function gradosAOrientacion(grados: number): string {
  const idx = Math.round((((grados % 360) + 360) % 360) / 22.5) % 16;
  return ORIENTACIONES[idx] ?? 'N';
}

function bboxDe(mojones: Mojon[], margenGrados = 0.01): BBox {
  const lats = mojones.map(m => m.lat);
  const lngs = mojones.map(m => m.lng);
  return [
    Math.min(...lngs) - margenGrados,
    Math.min(...lats) - margenGrados,
    Math.max(...lngs) + margenGrados,
    Math.max(...lats) + margenGrados,
  ];
}

/** Bilineal sobre la grilla row-major de GrillaDEM (fila 0 = sur, ver @arteytierra/dem). */
function muestrearGrilla(g: GrillaDEM, lat: number, lng: number): number | null {
  const [w, s, e, n] = g.bbox;
  if (lng < w || lng > e || lat < s || lat > n) return null;
  const gx = ((lng - w) / (e - w)) * (g.cols - 1);
  const gy = ((n - lat) / (n - s)) * (g.rows - 1); // fila 0 = norte visualmente, pero elev es fila 0 = sur → invertir
  const gyDesdeSur = (g.rows - 1) - gy;
  const x0 = Math.max(0, Math.min(g.cols - 2, Math.floor(gx)));
  const y0 = Math.max(0, Math.min(g.rows - 2, Math.floor(gyDesdeSur)));
  const fx = gx - x0, fy = gyDesdeSur - y0;
  const at = (xx: number, yy: number) => {
    const v = g.elev[yy * g.cols + xx];
    return v != null && Number.isFinite(v) ? v : null;
  };
  const e00 = at(x0, y0), e10 = at(x0 + 1, y0), e01 = at(x0, y0 + 1), e11 = at(x0 + 1, y0 + 1);
  if (e00 == null || e10 == null || e01 == null || e11 == null) {
    return e00 ?? e10 ?? e01 ?? e11 ?? null;
  }
  const a = e00 + (e10 - e00) * fx;
  const b = e01 + (e11 - e01) * fx;
  return a + (b - a) * fy;
}

function pendienteOrientacion(
  puntos: PuntoElevacion[],
): { pendiente_pct: number; pendiente_grados: number; orientacion: string; escurrimiento: DatosTopografia['escurrimiento'] } {
  if (puntos.length < 2) {
    const p = puntos[0] ?? { lat: 0, lng: 0, elevation: 0 };
    return { pendiente_pct: 0, pendiente_grados: 0, orientacion: '—', escurrimiento: { desde: p, hacia: p } };
  }

  const alto = puntos.reduce((best, p) => (p.elevation > best.elevation ? p : best));
  const bajo = puntos.reduce((best, p) => (p.elevation < best.elevation ? p : best));

  const dist = turf.distance(turf.point([alto.lng, alto.lat]), turf.point([bajo.lng, bajo.lat]), { units: 'meters' });
  const dh = Math.abs(alto.elevation - bajo.elevation);

  const pendiente_pct = dist > 1 ? (dh / dist) * 100 : 0;
  const pendiente_grados = dist > 1 ? (Math.atan(dh / dist) * 180) / Math.PI : 0;

  const bear = turf.bearing(turf.point([alto.lng, alto.lat]), turf.point([bajo.lng, bajo.lat]));
  const orientacion = gradosAOrientacion((bear + 360) % 360);

  return {
    pendiente_pct: Math.round(pendiente_pct * 10) / 10,
    pendiente_grados: Math.round(pendiente_grados * 10) / 10,
    orientacion,
    escurrimiento: { desde: alto, hacia: bajo },
  };
}

export async function obtenerTopografia(mojones: Mojon[]): Promise<DatosTopografia> {
  if (mojones.length < 1) throw new Error('Se necesita al menos 1 mojón.');

  const centroCoords = {
    lat: mojones.reduce((s, m) => s + m.lat, 0) / mojones.length,
    lng: mojones.reduce((s, m) => s + m.lng, 0) / mojones.length,
  };

  const grilla = await obtenerGrillaDEM(bboxDe(mojones), 12, 12);
  if (!grilla) throw new Error('No se pudo obtener la grilla DEM para el sitio.');

  const elevacionEn = (lat: number, lng: number) => muestrearGrilla(grilla, lat, lng) ?? 0;

  const puntos: PuntoElevacion[] = mojones.map((m, i) => ({
    lat: m.lat, lng: m.lng,
    elevation: elevacionEn(m.lat, m.lng),
    etiqueta: `M${m.numero ?? i + 1}`,
  }));

  const centroide: PuntoElevacion = {
    ...centroCoords,
    elevation: elevacionEn(centroCoords.lat, centroCoords.lng),
    etiqueta: 'Centro',
  };

  const elevsGrilla = Array.from(grilla.elev).filter(v => Number.isFinite(v));
  const todos = [...puntos, centroide];
  const elevs = [...todos.map(p => p.elevation), ...elevsGrilla];

  const elev_min = Math.min(...elevs);
  const elev_max = Math.max(...elevs);
  const elev_media = Math.round((elevs.reduce((s, e) => s + e, 0) / elevs.length) * 10) / 10;
  const desnivel = Math.round((elev_max - elev_min) * 10) / 10;

  const { pendiente_pct, pendiente_grados, orientacion, escurrimiento } = pendienteOrientacion(todos);

  return {
    puntos, centroide,
    elev_min, elev_max, elev_media, desnivel,
    pendiente_pct, pendiente_grados, orientacion, escurrimiento,
    fuente: `@arteytierra/dem (${grilla.fuente})`,
  };
}
