/**
 * Elevaciones por punto vía `/api/elevacion`, que rutea a la mejor fuente
 * disponible para el lugar (servicio nacional donde lo hay —3DEP, IGN, HRDEM,
 * AHN, swissALTI3D—, Copernicus GLO-30 si no, SRTM de respaldo). El panel ya no
 * asume SRTM: la fuente viene en la respuesta y se muestra tal cual.
 *
 * ⚠️ Datos orientativos. Para proyectos de obra: contratar relevamiento GPS.
 */
import * as turf from '@turf/turf';
import { CREDITO_RELIEVE, PASO_RELIEVE, type FuenteRelieve } from './grillaElevacion';
import type { Mojon } from './types';

export interface PuntoElevacion {
  lat:       number;
  lng:       number;
  elevation: number; // metros sobre nivel del mar
  etiqueta?: string;
}

export interface DatosTopografia {
  puntos:           PuntoElevacion[];    // elevación en cada mojón (numerados)
  centroide:        PuntoElevacion;
  grilla:           PuntoElevacion[];    // muestra interior del polígono
  elev_min:         number;
  elev_max:         number;
  elev_media:       number;
  desnivel:         number;              // max − min (m)
  pendiente_pct:    number;              // pendiente media estimada (%)
  pendiente_grados: number;
  orientacion:      string;              // dirección del escurrimiento (N, NE...)
  escurrimiento:    { desde: PuntoElevacion; hacia: PuntoElevacion }; // alto → bajo
  resolucion:       string;
  fuente:           string;
}

// ─── OpenTopoData API ─────────────────────────────────────────────────────────

interface TopoResponse {
  results: Array<{ elevation: number; location: { lat: number; lng: number } }>;
  status: string;
  /** Fuente que resolvió el pedido; la API la devuelve y antes se descartaba. */
  fuente?: FuenteRelieve;
}

async function fetchElevaciones(
  puntos: Array<{ lat: number; lng: number }>,
): Promise<{ elevaciones: number[]; fuente?: FuenteRelieve }> {
  // API acepta hasta 100 puntos por request
  const locs = puntos.map(p => `${p.lat},${p.lng}`).join('|');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const res = await fetch(
      `/api/elevacion?locations=${locs}`,
      { signal: controller.signal },
    );
    if (!res.ok) throw new Error(`OpenTopoData respondió ${res.status}`);
    const json: TopoResponse = await res.json();
    if (json.status !== 'OK') throw new Error('OpenTopoData: estado no OK');
    return { elevaciones: json.results.map(r => r.elevation), fuente: json.fuente };
  } finally {
    clearTimeout(timer);
  }
}

// ─── Grilla interior del polígono ─────────────────────────────────────────────

function generarGrilla(
  mojones: Mojon[],
  n = 4,
): Array<{ lat: number; lng: number }> {
  if (mojones.length < 3) return [];

  const coords = mojones.map(m => [m.lng, m.lat] as [number, number]);
  coords.push(coords[0]!);
  const polygon = turf.polygon([coords]);

  const lats = mojones.map(m => m.lat);
  const lngs = mojones.map(m => m.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);

  const puntos: Array<{ lat: number; lng: number }> = [];
  for (let i = 1; i < n; i++) {
    for (let j = 1; j < n; j++) {
      const lat = minLat + (i / n) * (maxLat - minLat);
      const lng = minLng + (j / n) * (maxLng - minLng);
      const pt = turf.point([lng, lat]);
      if (turf.booleanPointInPolygon(pt, polygon)) {
        puntos.push({ lat, lng });
      }
    }
  }
  return puntos;
}

// ─── Pendiente y orientación desde plano ajustado ────────────────────────────

function pendienteOrientacion(
  puntos: PuntoElevacion[],
): { pendiente_pct: number; pendiente_grados: number; orientacion: string; escurrimiento: DatosTopografia['escurrimiento'] } {
  if (puntos.length < 2) {
    const p = puntos[0] ?? { lat: 0, lng: 0, elevation: 0 };
    return { pendiente_pct: 0, pendiente_grados: 0, orientacion: '—', escurrimiento: { desde: p, hacia: p } };
  }

  // Punto más alto y más bajo
  const alto = puntos.reduce((best, p) => p.elevation > best.elevation ? p : best);
  const bajo = puntos.reduce((best, p) => p.elevation < best.elevation ? p : best);

  // Distancia horizontal entre ellos
  const dist = turf.distance(
    turf.point([alto.lng, alto.lat]),
    turf.point([bajo.lng, bajo.lat]),
    { units: 'meters' },
  );
  const dh = Math.abs(alto.elevation - bajo.elevation);

  const pendiente_pct    = dist > 1 ? (dh / dist) * 100 : 0;
  const pendiente_grados = dist > 1 ? (Math.atan(dh / dist) * 180) / Math.PI : 0;

  // Orientación: dirección del escurrimiento (de alto a bajo)
  const bear = turf.bearing(
    turf.point([alto.lng, alto.lat]),
    turf.point([bajo.lng, bajo.lat]),
  );
  const orientacion = gradosAOrientacion((bear + 360) % 360);

  return {
    pendiente_pct:    Math.round(pendiente_pct    * 10) / 10,
    pendiente_grados: Math.round(pendiente_grados * 10) / 10,
    orientacion,
    escurrimiento: { desde: alto, hacia: bajo },
  };
}

// ─── API pública ──────────────────────────────────────────────────────────────

export async function obtenerTopografia(mojones: Mojon[]): Promise<DatosTopografia> {
  if (mojones.length < 1) throw new Error('Se necesita al menos 1 mojón.');

  const centroCoords = {
    lat: mojones.reduce((s, m) => s + m.lat, 0) / mojones.length,
    lng: mojones.reduce((s, m) => s + m.lng, 0) / mojones.length,
  };
  const grillaCruda = generarGrilla(mojones, 4);

  // Combinar: mojones + centroide + grilla (máx 100 puntos)
  const todos = [
    ...mojones.map(m => ({ lat: m.lat, lng: m.lng })),
    centroCoords,
    ...grillaCruda,
  ].slice(0, 100);

  const { elevaciones, fuente: fuenteRelieve } = await fetchElevaciones(todos);

  // Asignar elevaciones a mojones
  const puntos: PuntoElevacion[] = mojones.map((m, i) => ({
    lat: m.lat, lng: m.lng,
    elevation: elevaciones[i] ?? 0,
    etiqueta: `M${m.numero}`,
  }));

  const nMojones = mojones.length;
  const centroide: PuntoElevacion = {
    ...centroCoords,
    elevation: elevaciones[nMojones] ?? 0,
    etiqueta: 'Centro',
  };

  const grilla: PuntoElevacion[] = grillaCruda.map((p, i) => ({
    ...p,
    elevation: elevaciones[nMojones + 1 + i] ?? 0,
  }));

  // Stats
  const todosConElev = [...puntos, centroide, ...grilla];
  const elevs = todosConElev.map(p => p.elevation).filter(e => e > -1000);
  const elev_min   = Math.min(...elevs);
  const elev_max   = Math.max(...elevs);
  const elev_media = Math.round((elevs.reduce((s, e) => s + e, 0) / elevs.length) * 10) / 10;
  const desnivel   = Math.round((elev_max - elev_min) * 10) / 10;

  const { pendiente_pct, pendiente_grados, orientacion, escurrimiento } =
    pendienteOrientacion(todosConElev);

  return {
    puntos, centroide, grilla,
    elev_min, elev_max, elev_media, desnivel,
    pendiente_pct, pendiente_grados, orientacion, escurrimiento,
    // La fuente ya no se asume: la resuelve el router de elevación (servicio
    // nacional donde lo hay, GLO-30 si no) y la API la devuelve. Decir 'SRTM,
    // datos de 2000' sobre un predio suizo servido por swissALTI3D era falso.
    resolucion: fuenteRelieve ? `~${PASO_RELIEVE[fuenteRelieve]} m/píxel` : '~30 m/píxel',
    fuente: fuenteRelieve ? CREDITO_RELIEVE[fuenteRelieve] : 'Copernicus GLO-30 / SRTM',
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ORIENTACIONES = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSO','SO','OSO','O','ONO','NO','NNO'] as const;

function gradosAOrientacion(grados: number): string {
  const idx = Math.round(((grados % 360) + 360) % 360 / 22.5) % 16;
  return ORIENTACIONES[idx] ?? 'N';
}
