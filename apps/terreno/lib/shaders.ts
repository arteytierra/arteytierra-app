/**
 * Shaders topográficos: grilla de elevación + pendiente calculada
 * sobre el polígono del terreno. Renderizado como celdas coloreadas en Leaflet.
 * Grid 10×10 = 100 puntos (máximo de OpenTopoData por request).
 */
import * as turf from '@turf/turf';
import { remuestrearGrilla, type FuenteRelieve, type GrillaElevacion } from './grillaElevacion';

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
  fuente?:   FuenteRelieve;   // fuente del relieve (para atribución)
}

// ─── Rampas de color ─────────────────────────────────────────────────────────

/**
 * Rampa del shader de elevación. Es una escala RELATIVA —del punto más bajo al
 * más alto de ESTE predio—, no una altimetría del mundo, así que no puede usar
 * el vocabulario hipsométrico (azul = mar, blanco = nieve): en un campo suizo
 * entre 815 y 840 m pintaba de azul océano la parte baja y de blanco nieve la
 * alta, y quedaba idéntica a la capa Hipsométrico, que sí es absoluta.
 *
 * Se usa una secuencial perceptualmente uniforme (familia viridis): ordena sin
 * ambigüedad de oscuro a claro, se lee igual en escala de grises y con daltonismo,
 * y no se confunde con ninguna de las otras dos rampas de la app.
 */
const RAMP_ELEV = [
  { t: 0.00, r: 68,  g: 1,   b: 84  },  // violeta oscuro — lo más bajo del predio
  { t: 0.25, r: 59,  g: 82,  b: 139 },  // azul-violeta
  { t: 0.50, r: 33,  g: 145, b: 140 },  // verde azulado
  { t: 0.75, r: 94,  g: 201, b: 98  },  // verde
  { t: 1.00, r: 253, g: 231, b: 37  },  // amarillo — lo más alto del predio
];

/** La misma rampa como gradiente CSS, para el swatch de Capas y la leyenda. */
export const GRADIENTE_ELEV =
  'linear-gradient(90deg,#440154 0%,#3b528b 25%,#21918c 50%,#5ec962 75%,#fde725 100%)';
export const GRADIENTE_PEND =
  'linear-gradient(90deg,#4CAF50 0%,#FFEB3B 50%,#F44336 100%)';

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
      fuente?: FuenteRelieve;
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

    return { celdas: celdaShaders, elev_min, elev_max, pend_max, fuente: json.fuente };
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
  fuente?: FuenteRelieve;
}, mojones?: Array<{ lat: number; lng: number }>): DatosShader | null {
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

  // El rango de color se toma de las celdas de ADENTRO del predio, no de toda la
  // grilla. `obtenerGrillaDensa` calcula con 8 % de margen y enmascara a 1,15×
  // el polígono para que las escorrentías vean de dónde viene el agua; esas
  // celdas de afuera tienen que seguir estando (hidrología, caminos), pero si
  // fijan la escala, un predio llano al pie de una loma se pinta entero de un
  // solo color y el shader no dice nada. El mismo rango alimenta la 'posición
  // relativa en la ladera' de aptitud y del master plan, así que el arreglo no
  // es sólo estético.
  const dentro = recorteAlPredio(celdas, mojones);
  if (dentro.length >= 4) {
    const es = dentro.map(c => c.elevation);
    return {
      celdas,
      elev_min: Math.min(...es),
      elev_max: Math.max(...es),
      pend_max: Math.max(...dentro.map(c => c.pendiente_pct), 1),
      fuente:   grilla.fuente,
    };
  }
  return { celdas, elev_min, elev_max, pend_max, fuente: grilla.fuente };
}

/** Celdas cuyo centro cae dentro del polígono del predio (todas si no hay predio). */
function recorteAlPredio(
  celdas:  CeldaShader[],
  mojones?: Array<{ lat: number; lng: number }>,
): CeldaShader[] {
  if (!mojones || mojones.length < 3) return celdas;
  const anillo = mojones.map(m => [m.lng, m.lat] as [number, number]);
  anillo.push(anillo[0]!);
  let poly: ReturnType<typeof turf.polygon>;
  try { poly = turf.polygon([anillo]); } catch { return celdas; }
  return celdas.filter(c => turf.booleanPointInPolygon(
    turf.point([(c.lngMin + c.lngMax) / 2, (c.latMin + c.latMax) / 2]), poly));
}

// ─── Puente: DatosShader desde un DEM propio importado ────────────────────────

/**
 * Construye un DatosShader a partir de un modelo de elevación PROPIO importado
 * (`lib/demImport.ts`), para que el relevamiento del usuario alimente no solo las
 * curvas de nivel sino también el sombreado de pendientes y todo lo derivado
 * (escorrentías, aptitud, master plan, cut&fill, keyline, viewshed, sombras).
 * Se remuestrea a un tamaño manejable y, si hay mojones, se recorta al predio.
 * Marca la fuente como 'usuario' (para la atribución del chip/informe).
 */
export function shaderDesdeDEM(
  grilla:   GrillaElevacion,
  mojones?: Array<{ lat: number; lng: number }>,
): DatosShader | null {
  const g  = remuestrearGrilla({ ...grilla, fuente: 'usuario' }, 120);
  const ds = shaderDesdeGrilla(g);
  if (!ds) return null;
  if (!mojones || mojones.length < 3) return { ...ds, fuente: 'usuario' };

  const anillo = mojones.map(m => [m.lng, m.lat] as [number, number]);
  anillo.push(anillo[0]!);
  let poly: ReturnType<typeof turf.polygon>;
  try { poly = turf.polygon([anillo]); } catch { return { ...ds, fuente: 'usuario' }; }

  const dentro = ds.celdas.filter(c =>
    turf.booleanPointInPolygon(turf.point([(c.lngMin + c.lngMax) / 2, (c.latMin + c.latMax) / 2]), poly));
  if (dentro.length < 4) return { ...ds, fuente: 'usuario' };

  const elevs = dentro.map(c => c.elevation);
  return {
    celdas:   dentro,
    elev_min: Math.min(...elevs),
    elev_max: Math.max(...elevs),
    pend_max: Math.max(...dentro.map(c => c.pendiente_pct), 1),
    fuente:   'usuario',
  };
}
