/**
 * Grilla densa de elevación a partir de tiles Terrarium (AWS elevation-tiles-prod,
 * servidos via /api/terrarium). Sin límite de puntos: decodifica los PNG en canvas
 * y muestrea con interpolación bilineal. Fuente SRTM ~30 m — los valores entre
 * píxeles son interpolados, adecuados para curvas de nivel orientativas.
 */
import * as turf from '@turf/turf';

export type FuenteRelieve = 'glo30' | 'srtm30' | 'terrarium' | 'usuario' | 'usgs3dep';

/** Etiqueta corta de la fuente de relieve (chip del mapa). */
export const ETIQUETA_RELIEVE: Record<FuenteRelieve, string> = {
  glo30:     'Copernicus GLO-30',
  srtm30:    'SRTM 30 m',
  terrarium: 'Terrarium (SRTM/GMTED)',
  usuario:   'DEM propio',
  usgs3dep:  'USGS 3DEP',
};

/** Línea de crédito completa (atribución exigida por Copernicus). */
export const CREDITO_RELIEVE: Record<FuenteRelieve, string> = {
  glo30:     'Relieve: Copernicus GLO-30 · © DLR e.V. 2010-2014 y © Airbus DS GmbH 2014-2018 (COPERNICUS · UE · ESA)',
  srtm30:    'Relieve: SRTM 30 m · NASA / USGS',
  terrarium: 'Relieve: Terrarium · Mapzen / AWS (SRTM + GMTED)',
  usuario:   'Relieve: DEM propio del usuario',
  usgs3dep:  'Relieve: USGS 3DEP · U.S. Geological Survey (dominio público)',
};

export interface GrillaElevacion {
  rows:     number;
  cols:     number;
  latMin:   number;
  latMax:   number;
  lngMin:   number;
  lngMax:   number;
  /** elevaciones row-major (row 0 = latMin). NaN = fuera del predio o sin dato */
  elev:     Float64Array;
  elev_min: number;
  elev_max: number;
  /** fuente del relieve efectivamente usada (para atribución) */
  fuente?:  FuenteRelieve;
}

/**
 * Grilla densa GLO-30 server-side (`/api/dem`, COGs de Copernicus). Devuelve la
 * grilla ya muestreada; null si el servicio falla → el llamador cae a Terrarium.
 */
async function grillaDemRemota(
  latMin: number, latMax: number, lngMin: number, lngMax: number, cols: number, rows: number,
): Promise<{ elev: Float64Array; fuente: FuenteRelieve } | null> {
  try {
    const u = `/api/dem?w=${lngMin}&s=${latMin}&e=${lngMax}&n=${latMax}&cols=${cols}&rows=${rows}`;
    const res = await fetch(u, { signal: AbortSignal.timeout(45_000) });
    if (!res.ok) return null;
    const j = await res.json() as { ok: boolean; fuente: FuenteRelieve; cols: number; rows: number; elev: Array<number | null> };
    if (!j.ok || j.cols !== cols || j.rows !== rows || !Array.isArray(j.elev) || j.elev.length !== rows * cols) return null;
    const elev = new Float64Array(rows * cols);
    for (let i = 0; i < elev.length; i++) { const v = j.elev[i]; elev[i] = (v == null) ? NaN : v; }
    return { elev, fuente: j.fuente };
  } catch { return null; }
}

// ─── Proyección Web Mercator ──────────────────────────────────────────────────

function lngAPxGlobal(lng: number, z: number): number {
  return ((lng + 180) / 360) * 256 * Math.pow(2, z);
}

function latAPxGlobal(lat: number, z: number): number {
  const rad = (lat * Math.PI) / 180;
  const n = Math.log(Math.tan(Math.PI / 4 + rad / 2));
  return ((1 - n / Math.PI) / 2) * 256 * Math.pow(2, z);
}

// ─── Carga y decode de tiles ─────────────────────────────────────────────────

interface TileData { px: Uint8ClampedArray }

async function cargarTile(z: number, x: number, y: number): Promise<TileData | null> {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timer = setTimeout(() => { img.src = ''; resolve(null); }, 15_000);
    img.onload = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 256;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(null); return; }
        ctx.drawImage(img, 0, 0);
        resolve({ px: ctx.getImageData(0, 0, 256, 256).data });
      } catch { resolve(null); }
    };
    img.onerror = () => { clearTimeout(timer); resolve(null); };
    img.src = `/api/terrarium?z=${z}&x=${x}&y=${y}`;
  });
}

function decodificarElev(px: Uint8ClampedArray, ix: number, iy: number): number {
  const i = (iy * 256 + ix) * 4;
  const r = px[i], g = px[i + 1], b = px[i + 2];
  if (r === undefined || g === undefined || b === undefined) return NaN;
  const elev = r * 256 + g + b / 256 - 32768;
  return elev < -500 ? NaN : elev;
}

// ─── API pública ─────────────────────────────────────────────────────────────

/**
 * Obtiene una grilla densa de elevación sobre el bbox del polígono (+margen).
 * Los nodos fuera del polígono (escalado 1.15) quedan en NaN.
 * @param resolucion nodos en el eje mayor (default 120)
 */
export async function obtenerGrillaDensa(
  mojones: Array<{ lat: number; lng: number }>,
  resolucion = 120,
): Promise<GrillaElevacion | null> {
  if (mojones.length < 3 || typeof document === 'undefined') return null;

  // Bbox con margen del 8%
  const lats = mojones.map(m => m.lat);
  const lngs = mojones.map(m => m.lng);
  let latMin = Math.min(...lats), latMax = Math.max(...lats);
  let lngMin = Math.min(...lngs), lngMax = Math.max(...lngs);
  const mLat = (latMax - latMin) * 0.08 || 0.001;
  const mLng = (lngMax - lngMin) * 0.08 || 0.001;
  latMin -= mLat; latMax += mLat; lngMin -= mLng; lngMax += mLng;

  const latC = (latMin + latMax) / 2;
  const anchoM = (lngMax - lngMin) * 111_320 * Math.cos(latC * Math.PI / 180);
  const altoM  = (latMax - latMin) * 111_320;

  // Grilla proporcional al bbox, eje mayor = resolucion
  let cols: number, rows: number;
  if (anchoM >= altoM) {
    cols = resolucion;
    rows = Math.max(20, Math.round(resolucion * (altoM / anchoM)));
  } else {
    rows = resolucion;
    cols = Math.max(20, Math.round(resolucion * (anchoM / altoM)));
  }

  // Fuente preferida: GLO-30 server-side. Si falla, tiles Terrarium (abajo).
  const dem = await grillaDemRemota(latMin, latMax, lngMin, lngMax, cols, rows);
  if (dem) {
    const coordsMask = mojones.map(m => [m.lng, m.lat] as [number, number]);
    coordsMask.push(coordsMask[0]!);
    let mascara: ReturnType<typeof turf.polygon> | null = null;
    try { mascara = turf.transformScale(turf.polygon([coordsMask]), 1.15) as ReturnType<typeof turf.polygon>; } catch { mascara = null; }
    const elev = dem.elev;
    let elev_min = Infinity, elev_max = -Infinity;
    for (let r = 0; r < rows; r++) {
      const lat = latMin + (r / (rows - 1)) * (latMax - latMin);
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        if (Number.isNaN(elev[idx]!)) continue;
        const lng = lngMin + (c / (cols - 1)) * (lngMax - lngMin);
        if (mascara && !turf.booleanPointInPolygon(turf.point([lng, lat]), mascara)) { elev[idx] = NaN; continue; }
        const e = elev[idx]!;
        if (e < elev_min) elev_min = e;
        if (e > elev_max) elev_max = e;
      }
    }
    if (isFinite(elev_min) && elev_max - elev_min >= 0.5)
      return { rows, cols, latMin, latMax, lngMin, lngMax, elev, elev_min, elev_max, fuente: dem.fuente };
  }

  // Zoom: 2× oversample respecto del paso de la grilla, clamp 9–14
  const pasoM = Math.max(anchoM / cols, altoM / rows);
  let z = Math.round(Math.log2((156543.03 * Math.cos(latC * Math.PI / 180)) / Math.max(pasoM / 2, 1)));
  z = Math.max(9, Math.min(14, z));

  // Rango de tiles necesario; si son demasiados bajar zoom
  let txMin = 0, txMax = 0, tyMin = 0, tyMax = 0;
  for (;;) {
    txMin = Math.floor(lngAPxGlobal(lngMin, z) / 256);
    txMax = Math.floor(lngAPxGlobal(lngMax, z) / 256);
    tyMin = Math.floor(latAPxGlobal(latMax, z) / 256);  // latMax → py menor
    tyMax = Math.floor(latAPxGlobal(latMin, z) / 256);
    const n = (txMax - txMin + 1) * (tyMax - tyMin + 1);
    if (n <= 16 || z <= 9) break;
    z--;
  }

  // Cargar tiles en paralelo
  const tiles = new Map<string, TileData>();
  const jobs: Promise<void>[] = [];
  for (let tx = txMin; tx <= txMax; tx++) {
    for (let ty = tyMin; ty <= tyMax; ty++) {
      jobs.push(cargarTile(z, tx, ty).then(t => { if (t) tiles.set(`${tx},${ty}`, t); }));
    }
  }
  await Promise.all(jobs);
  if (tiles.size === 0) return null;

  // Máscara: polígono escalado 1.15 (curvas con un poco de contexto alrededor)
  const coords = mojones.map(m => [m.lng, m.lat] as [number, number]);
  coords.push(coords[0]!);
  let poligonoMascara: ReturnType<typeof turf.polygon> | null = null;
  try {
    const poly = turf.polygon([coords]);
    poligonoMascara = turf.transformScale(poly, 1.15) as ReturnType<typeof turf.polygon>;
  } catch { poligonoMascara = null; }

  // Muestrear con bilineal sobre el espacio de píxeles global
  function muestrear(lat: number, lng: number): number {
    const gx = lngAPxGlobal(lng, z) - 0.5;
    const gy = latAPxGlobal(lat, z) - 0.5;
    const x0 = Math.floor(gx), y0 = Math.floor(gy);
    const fx = gx - x0, fy = gy - y0;

    function pixel(xg: number, yg: number): number {
      const tx = Math.floor(xg / 256), ty = Math.floor(yg / 256);
      const tile = tiles.get(`${tx},${ty}`);
      if (!tile) return NaN;
      return decodificarElev(tile.px, xg - tx * 256, yg - ty * 256);
    }

    const e00 = pixel(x0, y0),     e10 = pixel(x0 + 1, y0);
    const e01 = pixel(x0, y0 + 1), e11 = pixel(x0 + 1, y0 + 1);
    if (isNaN(e00) || isNaN(e10) || isNaN(e01) || isNaN(e11)) {
      // borde de tile faltante: usar el vecino válido más cercano
      const candidatos = [e00, e10, e01, e11].filter(e => !isNaN(e));
      return candidatos.length > 0 ? candidatos[0]! : NaN;
    }
    const a = e00 + (e10 - e00) * fx;
    const b = e01 + (e11 - e01) * fx;
    return a + (b - a) * fy;
  }

  const elev = new Float64Array(rows * cols).fill(NaN);
  let elev_min = Infinity, elev_max = -Infinity;

  for (let r = 0; r < rows; r++) {
    const lat = latMin + (r / (rows - 1)) * (latMax - latMin);
    for (let c = 0; c < cols; c++) {
      const lng = lngMin + (c / (cols - 1)) * (lngMax - lngMin);
      if (poligonoMascara && !turf.booleanPointInPolygon(turf.point([lng, lat]), poligonoMascara)) continue;
      const e = muestrear(lat, lng);
      if (isNaN(e)) continue;
      elev[r * cols + c] = e;
      if (e < elev_min) elev_min = e;
      if (e > elev_max) elev_max = e;
    }
  }

  if (!isFinite(elev_min) || elev_max - elev_min < 0.5) return null;

  return { rows, cols, latMin, latMax, lngMin, lngMax, elev, elev_min, elev_max, fuente: 'terrarium' };
}

// ─── Grilla de hidrología (sin recorte al predio) ────────────────────────────

export interface BBox { latMin: number; latMax: number; lngMin: number; lngMax: number; }

/**
 * Grilla densa de elevación sobre un bbox explícito, SIN enmascarar al polígono
 * del predio. Se usa para delinear cuencas: el flujo puede salir del terreno y
 * subir por las laderas hasta la divisoria real. Misma fuente Terrarium (tiles
 * cacheados 1 año en el CDN) que `obtenerGrillaDensa`, sin llamadas por punto.
 *
 * @param resolucion nodos en el eje mayor (más nodos = celda más fina)
 */
export async function obtenerGrillaHidro(
  bbox: BBox,
  resolucion = 240,
): Promise<GrillaElevacion | null> {
  if (typeof document === 'undefined') return null;
  const { latMin, latMax, lngMin, lngMax } = bbox;
  if (!(latMax > latMin) || !(lngMax > lngMin)) return null;

  const latC = (latMin + latMax) / 2;
  const anchoM = (lngMax - lngMin) * 111_320 * Math.cos(latC * Math.PI / 180);
  const altoM  = (latMax - latMin) * 111_320;

  // Grilla proporcional al bbox, eje mayor = resolucion
  let cols: number, rows: number;
  if (anchoM >= altoM) {
    cols = resolucion;
    rows = Math.max(20, Math.round(resolucion * (altoM / anchoM)));
  } else {
    rows = resolucion;
    cols = Math.max(20, Math.round(resolucion * (anchoM / altoM)));
  }

  // Fuente preferida: GLO-30 server-side (sin máscara). Si falla, Terrarium (abajo).
  const dem = await grillaDemRemota(latMin, latMax, lngMin, lngMax, cols, rows);
  if (dem) {
    let elev_min = Infinity, elev_max = -Infinity;
    for (let i = 0; i < dem.elev.length; i++) {
      const e = dem.elev[i]!;
      if (Number.isNaN(e)) continue;
      if (e < elev_min) elev_min = e;
      if (e > elev_max) elev_max = e;
    }
    if (isFinite(elev_min) && elev_max - elev_min >= 0.5)
      return { rows, cols, latMin, latMax, lngMin, lngMax, elev: dem.elev, elev_min, elev_max, fuente: dem.fuente };
  }

  // Zoom: 2× oversample respecto del paso de la grilla, clamp 9–14
  const pasoM = Math.max(anchoM / cols, altoM / rows);
  let z = Math.round(Math.log2((156543.03 * Math.cos(latC * Math.PI / 180)) / Math.max(pasoM / 2, 1)));
  z = Math.max(9, Math.min(14, z));

  // Rango de tiles; si son demasiados (>36), bajar zoom hasta entrar en presupuesto.
  let txMin = 0, txMax = 0, tyMin = 0, tyMax = 0;
  for (;;) {
    txMin = Math.floor(lngAPxGlobal(lngMin, z) / 256);
    txMax = Math.floor(lngAPxGlobal(lngMax, z) / 256);
    tyMin = Math.floor(latAPxGlobal(latMax, z) / 256);  // latMax → py menor
    tyMax = Math.floor(latAPxGlobal(latMin, z) / 256);
    const n = (txMax - txMin + 1) * (tyMax - tyMin + 1);
    if (n <= 36 || z <= 9) break;
    z--;
  }

  // Cargar tiles en paralelo
  const tiles = new Map<string, TileData>();
  const jobs: Promise<void>[] = [];
  for (let tx = txMin; tx <= txMax; tx++) {
    for (let ty = tyMin; ty <= tyMax; ty++) {
      jobs.push(cargarTile(z, tx, ty).then(t => { if (t) tiles.set(`${tx},${ty}`, t); }));
    }
  }
  await Promise.all(jobs);
  if (tiles.size === 0) return null;

  function muestrear(lat: number, lng: number): number {
    const gx = lngAPxGlobal(lng, z) - 0.5;
    const gy = latAPxGlobal(lat, z) - 0.5;
    const x0 = Math.floor(gx), y0 = Math.floor(gy);
    const fx = gx - x0, fy = gy - y0;
    const pixel = (xg: number, yg: number): number => {
      const tx = Math.floor(xg / 256), ty = Math.floor(yg / 256);
      const tile = tiles.get(`${tx},${ty}`);
      if (!tile) return NaN;
      return decodificarElev(tile.px, xg - tx * 256, yg - ty * 256);
    };
    const e00 = pixel(x0, y0),     e10 = pixel(x0 + 1, y0);
    const e01 = pixel(x0, y0 + 1), e11 = pixel(x0 + 1, y0 + 1);
    if (isNaN(e00) || isNaN(e10) || isNaN(e01) || isNaN(e11)) {
      const c = [e00, e10, e01, e11].filter(e => !isNaN(e));
      return c.length > 0 ? c[0]! : NaN;
    }
    const a = e00 + (e10 - e00) * fx;
    const b = e01 + (e11 - e01) * fx;
    return a + (b - a) * fy;
  }

  const elev = new Float64Array(rows * cols).fill(NaN);
  let elev_min = Infinity, elev_max = -Infinity;
  for (let r = 0; r < rows; r++) {
    const lat = latMin + (r / (rows - 1)) * (latMax - latMin);
    for (let c = 0; c < cols; c++) {
      const lng = lngMin + (c / (cols - 1)) * (lngMax - lngMin);
      const e = muestrear(lat, lng);
      if (isNaN(e)) continue;
      elev[r * cols + c] = e;
      if (e < elev_min) elev_min = e;
      if (e > elev_max) elev_max = e;
    }
  }
  if (!isFinite(elev_min) || elev_max - elev_min < 0.5) return null;

  return { rows, cols, latMin, latMax, lngMin, lngMax, elev, elev_min, elev_max, fuente: 'terrarium' };
}

/** Elevación en un punto (nodo más cercano) de una grilla ya cargada. NaN si cae fuera. */
export function elevEnGrilla(g: GrillaElevacion, lat: number, lng: number): number {
  const { rows, cols, latMin, latMax, lngMin, lngMax, elev } = g;
  if (lat < latMin || lat > latMax || lng < lngMin || lng > lngMax) return NaN;
  const r = Math.round((lat - latMin) / (latMax - latMin) * (rows - 1));
  const c = Math.round((lng - lngMin) / (lngMax - lngMin) * (cols - 1));
  if (r < 0 || r >= rows || c < 0 || c >= cols) return NaN;
  return elev[r * cols + c] ?? NaN;
}

/** Grilla 10×10 a partir del shader existente (fallback offline). */
export function grillaDesdeShader(shader: {
  celdas: Array<{ row: number; col: number; latMin: number; latMax: number; lngMin: number; lngMax: number; elevation: number }>;
  elev_min: number; elev_max: number;
}): GrillaElevacion | null {
  const { celdas } = shader;
  if (celdas.length === 0) return null;

  let minRow = Infinity, maxRow = -Infinity, minCol = Infinity, maxCol = -Infinity;
  let latMin = Infinity, latMax = -Infinity, lngMin = Infinity, lngMax = -Infinity;
  for (const c of celdas) {
    if (c.row < minRow) minRow = c.row;
    if (c.row > maxRow) maxRow = c.row;
    if (c.col < minCol) minCol = c.col;
    if (c.col > maxCol) maxCol = c.col;
    const lat = (c.latMin + c.latMax) / 2;
    const lng = (c.lngMin + c.lngMax) / 2;
    if (lat < latMin) latMin = lat;
    if (lat > latMax) latMax = lat;
    if (lng < lngMin) lngMin = lng;
    if (lng > lngMax) lngMax = lng;
  }

  const rows = maxRow - minRow + 1;
  const cols = maxCol - minCol + 1;
  if (rows < 2 || cols < 2) return null;

  const elev = new Float64Array(rows * cols).fill(NaN);
  for (const c of celdas) {
    elev[(c.row - minRow) * cols + (c.col - minCol)] = c.elevation;
  }

  return { rows, cols, latMin, latMax, lngMin, lngMax, elev, elev_min: shader.elev_min, elev_max: shader.elev_max };
}
