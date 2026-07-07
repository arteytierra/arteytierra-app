/**
 * Shaders topográficos: grilla de elevación + pendiente calculada
 * sobre el polígono del terreno. Renderizado como celdas coloreadas en Leaflet.
 * Grid 10×10 = 100 puntos (máximo de OpenTopoData por request).
 */
import * as turf from '@turf/turf';

export interface CeldaShader {
  row: number;
  col: number;
  latMin: number;
  latMax: number;
  lngMin: number;
  lngMax: number;
  elevation: number;
  pendiente_pct: number;   // pendiente estimada en %
}

export interface DatosShader {
  celdas:    CeldaShader[];
  elev_min:  number;
  elev_max:  number;
  pend_max:  number;
}

// ─── Rampas de color ─────────────────────────────────────────────────────────

const RAMP_ELEV = [
  { t: 0.00, r: 21,  g: 101, b: 192 },  // azul profundo
  { t: 0.15, r: 66,  g: 165, b: 245 },  // azul claro
  { t: 0.30, r: 102, g: 187, b: 106 },  // verde
  { t: 0.50, r: 255, g: 238, b: 88  },  // amarillo
  { t: 0.65, r: 255, g: 167, b: 38  },  // naranja
  { t: 0.80, r: 141, g: 110, b: 99  },  // marrón
  { t: 1.00, r: 236, g: 239, b: 241 },  // casi blanco
];

const RAMP_PEND = [
  { t: 0.00, r: 76,  g: 175, b: 80  },  // verde (plano)
  { t: 0.25, r: 205, g: 220, b: 57  },  // lima
  { t: 0.50, r: 255, g: 235, b: 59  },  // amarillo
  { t: 0.70, r: 255, g: 152, b: 0   },  // naranja
  { t: 0.85, r: 244, g: 67,  b: 54  },  // rojo
  { t: 1.00, r: 183, g: 28,  b: 28  },  // rojo oscuro
];

type Ramp = typeof RAMP_ELEV;

function interpolarColor(ramp: Ramp, t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  for (let i = 0; i < ramp.length - 1; i++) {
    const a = ramp[i]!;
    const b = ramp[i + 1]!;
    if (clamped >= a.t && clamped <= b.t) {
      const factor = (clamped - a.t) / (b.t - a.t);
      const r = Math.round(a.r + (b.r - a.r) * factor);
      const g = Math.round(a.g + (b.g - a.g) * factor);
      const b2 = Math.round(a.b + (b.b - a.b) * factor);
      return `rgb(${r},${g},${b2})`;
    }
  }
  const last = ramp[ramp.length - 1]!;
  return `rgb(${last.r},${last.g},${last.b})`;
}

export function colorElevacion(elev: number, min: number, max: number): string {
  return interpolarColor(RAMP_ELEV, max > min ? (elev - min) / (max - min) : 0);
}

export function colorPendiente(pct: number, maxPct: number): string {
  return interpolarColor(RAMP_PEND, maxPct > 0 ? Math.min(pct / maxPct, 1) : 0);
}

// ─── Fetch grilla ─────────────────────────────────────────────────────────────

const GRID_N = 10;  // 10×10 = 100 puntos, exactamente el límite de la API

export async function fetchShader(
  mojones: Array<{ lat: number; lng: number }>,
  bounds?: { latMin: number; latMax: number; lngMin: number; lngMax: number },
): Promise<DatosShader | { error: string }> {
  if (mojones.length < 3) return { error: 'Se necesitan al menos 3 mojones.' };

  // Bounding box: usar bounds externos si los hay, sino bbox de mojones
  const lats = mojones.map(m => m.lat);
  const lngs = mojones.map(m => m.lng);
  const latMin = bounds?.latMin ?? Math.min(...lats);
  const latMax = bounds?.latMax ?? Math.max(...lats);
  const lngMin = bounds?.lngMin ?? Math.min(...lngs);
  const lngMax = bounds?.lngMax ?? Math.max(...lngs);

  // Polígono para clip (GeoJSON)
  const coords = mojones.map(m => [m.lng, m.lat] as [number, number]);
  coords.push(coords[0]!);
  let polygon: ReturnType<typeof turf.polygon>;
  try { polygon = turf.polygon([coords]); } catch { return { error: 'Polígono inválido.' }; }

  // Generar grilla de centros de celda
  const dLat = (latMax - latMin) / GRID_N;
  const dLng = (lngMax - lngMin) / GRID_N;

  interface GridCell {
    row: number; col: number;
    latMin: number; latMax: number;
    lngMin: number; lngMax: number;
    latC: number; lngC: number;
  }
  const celdas: GridCell[] = [];

  for (let r = 0; r < GRID_N; r++) {
    for (let c = 0; c < GRID_N; c++) {
      const cellLatMin = latMin + r * dLat;
      const cellLatMax = cellLatMin + dLat;
      const cellLngMin = lngMin + c * dLng;
      const cellLngMax = cellLngMin + dLng;
      const latC = (cellLatMin + cellLatMax) / 2;
      const lngC = (cellLngMin + cellLngMax) / 2;

      // Incluir solo si el centro está dentro del polígono
      if (turf.booleanPointInPolygon(turf.point([lngC, latC]), polygon)) {
        celdas.push({ row: r, col: c, latMin: cellLatMin, latMax: cellLatMax, lngMin: cellLngMin, lngMax: cellLngMax, latC, lngC });
      }
    }
  }

  if (celdas.length === 0) return { error: 'Ninguna celda del grid cayó dentro del polígono.' };

  // Fetch elevaciones via POST
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch('/api/elevacion', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        locations: celdas.map(c => ({ latitude: c.latC, longitude: c.lngC })),
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => res.statusText);
      return { error: `API ${res.status}: ${txt.slice(0, 100)}` };
    }

    const json = await res.json() as {
      status: string;
      results: Array<{ elevation: number | null }>;
    };
    if (json.status !== 'OK') return { error: `API status: ${json.status}` };

    // Asignar elevaciones a celdas
    const conElev = celdas.map((c, i) => ({
      ...c,
      elevation: json.results[i]?.elevation ?? 0,
    })).filter(c => c.elevation > -500);

    if (conElev.length < 2) return { error: 'Sin datos de elevación válidos.' };

    const elevaciones = conElev.map(c => c.elevation);
    const elev_min = Math.min(...elevaciones);
    const elev_max = Math.max(...elevaciones);

    // Calcular pendiente para cada celda usando vecinos
    const cellMap = new Map<string, number>();
    conElev.forEach(c => cellMap.set(`${c.row},${c.col}`, c.elevation));

    const distLat = turf.distance(
      turf.point([lngMin, latMin]),
      turf.point([lngMin, latMin + dLat]),
      { units: 'meters' },
    );
    const distLng = turf.distance(
      turf.point([lngMin, latMin]),
      turf.point([lngMin + dLng, latMin]),
      { units: 'meters' },
    );

    const celdaShaders: CeldaShader[] = conElev.map(c => {
      const elevN = cellMap.get(`${c.row + 1},${c.col}`);
      const elevS = cellMap.get(`${c.row - 1},${c.col}`);
      const elevE = cellMap.get(`${c.row},${c.col + 1}`);
      const elevW = cellMap.get(`${c.row},${c.col - 1}`);

      let dzdx = 0, dzdy = 0;
      if (elevE !== undefined && elevW !== undefined) dzdx = (elevE - elevW) / (2 * distLng);
      else if (elevE !== undefined)                   dzdx = (elevE - c.elevation) / distLng;
      else if (elevW !== undefined)                   dzdx = (c.elevation - elevW) / distLng;

      if (elevN !== undefined && elevS !== undefined) dzdy = (elevN - elevS) / (2 * distLat);
      else if (elevN !== undefined)                   dzdy = (elevN - c.elevation) / distLat;
      else if (elevS !== undefined)                   dzdy = (c.elevation - elevS) / distLat;

      const pendiente_pct = Math.round(Math.sqrt(dzdx * dzdx + dzdy * dzdy) * 100 * 10) / 10;

      return {
        row:        c.row,    col:    c.col,
        latMin:     c.latMin, latMax: c.latMax,
        lngMin:     c.lngMin, lngMax: c.lngMax,
        elevation:  c.elevation,
        pendiente_pct,
      };
    });

    const pend_max = Math.max(...celdaShaders.map(c => c.pendiente_pct), 1);

    return { celdas: celdaShaders, elev_min, elev_max, pend_max };
  } catch (e) {
    if ((e as Error).name === 'AbortError') return { error: 'Tiempo de espera agotado.' };
    return { error: String(e) };
  } finally {
    clearTimeout(timer);
  }
}

// ─── Puente: DatosShader desde grilla densa (tiles Terrarium) ─────────────────

/**
 * Construye un DatosShader (celdas + pendiente) a partir de una grilla densa de
 * elevación (obtenerGrillaDensa, decodificada de tiles Terrarium). Permite que
 * escorrentías, aptitud, sugerencias, cut&fill y master plan corran sobre
 * cientos/miles de celdas en vez del muestreo 10×10 de OpenTopoData.
 * Cada nodo de la grilla es el centro de una celda; los nodos NaN (fuera del
 * polígono) se omiten. La pendiente se calcula con vecinos (más local = más real).
 */
export function shaderDesdeGrilla(grilla: {
  rows: number; cols: number;
  latMin: number; latMax: number; lngMin: number; lngMax: number;
  elev: Float64Array; elev_min: number; elev_max: number;
}): DatosShader | null {
  const { rows, cols, latMin, latMax, lngMin, lngMax, elev, elev_min, elev_max } = grilla;
  if (rows < 2 || cols < 2) return null;

  const dLatDeg = (latMax - latMin) / (rows - 1);
  const dLngDeg = (lngMax - lngMin) / (cols - 1);
  const latC0   = (latMin + latMax) / 2;
  const distLat = dLatDeg * 111_320;
  const distLng = dLngDeg * 111_320 * Math.cos(latC0 * Math.PI / 180);

  const at = (r: number, c: number): number | undefined => {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return undefined;
    const v = elev[r * cols + c]!;
    return Number.isNaN(v) ? undefined : v;
  };

  const celdas: CeldaShader[] = [];
  let pend_max = 1;

  for (let r = 0; r < rows; r++) {
    const latCc = latMin + r * dLatDeg;
    for (let c = 0; c < cols; c++) {
      const e = at(r, c);
      if (e === undefined) continue;
      const lngCc = lngMin + c * dLngDeg;

      const eN = at(r + 1, c), eS = at(r - 1, c);
      const eE = at(r, c + 1), eW = at(r, c - 1);
      let dzdx = 0, dzdy = 0;
      if (eE !== undefined && eW !== undefined) dzdx = (eE - eW) / (2 * distLng);
      else if (eE !== undefined)                dzdx = (eE - e) / distLng;
      else if (eW !== undefined)                dzdx = (e - eW) / distLng;
      if (eN !== undefined && eS !== undefined) dzdy = (eN - eS) / (2 * distLat);
      else if (eN !== undefined)                dzdy = (eN - e) / distLat;
      else if (eS !== undefined)                dzdy = (e - eS) / distLat;

      const pendiente_pct = Math.round(Math.sqrt(dzdx * dzdx + dzdy * dzdy) * 100 * 10) / 10;
      if (pendiente_pct > pend_max) pend_max = pendiente_pct;

      celdas.push({
        row: r, col: c,
        latMin: latCc - dLatDeg / 2, latMax: latCc + dLatDeg / 2,
        lngMin: lngCc - dLngDeg / 2, lngMax: lngCc + dLngDeg / 2,
        elevation: e,
        pendiente_pct,
      });
    }
  }

  if (celdas.length < 4) return null;
  return { celdas, elev_min, elev_max, pend_max };
}
