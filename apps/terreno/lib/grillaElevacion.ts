/**
 * Grilla densa de elevación a partir de tiles Terrarium (AWS elevation-tiles-prod,
 * servidos via /api/terrarium). Sin límite de puntos: decodifica los PNG en canvas
 * y muestrea con interpolación bilineal. Fuente SRTM ~30 m — los valores entre
 * píxeles son interpolados, adecuados para curvas de nivel orientativas.
 */
import * as turf from '@turf/turf';

export type FuenteRelieve = 'glo30' | 'srtm30' | 'terrarium' | 'usuario' | 'usgs3dep' | 'ignfr' | 'ignes' | 'hrdemca' | 'ahnnl' | 'swisstopo';

/** Etiqueta corta de la fuente de relieve (chip del mapa). */
export const ETIQUETA_RELIEVE: Record<FuenteRelieve, string> = {
  glo30:     'Copernicus GLO-30',
  srtm30:    'SRTM 30 m',
  terrarium: 'Terrarium (SRTM/GMTED)',
  usuario:   'DEM propio',
  usgs3dep:  'USGS 3DEP',
  ignfr:     'IGN RGE ALTI',
  ignes:     'IGN España MDT',
  hrdemca:   'HRDEM Canadá',
  ahnnl:     'AHN Países Bajos',
  swisstopo: 'swissALTI3D',
};

/** Línea de crédito completa (atribución exigida por Copernicus). */
export const CREDITO_RELIEVE: Record<FuenteRelieve, string> = {
  glo30:     'Relieve: Copernicus GLO-30 · © DLR e.V. 2010-2014 y © Airbus DS GmbH 2014-2018 (COPERNICUS · UE · ESA)',
  srtm30:    'Relieve: SRTM 30 m · NASA / USGS',
  terrarium: 'Relieve: Terrarium · Mapzen / AWS (SRTM + GMTED)',
  usuario:   'Relieve: DEM propio del usuario',
  usgs3dep:  'Relieve: USGS 3DEP · U.S. Geological Survey (dominio público)',
  ignfr:     'Relieve: IGN RGE ALTI · © IGN France (Licence Ouverte / Etalab 2.0)',
  ignes:     'Relieve: MDT PNOA-LiDAR · © IGN España (CC-BY 4.0, scne.es)',
  hrdemca:   'Relieve: HRDEM · CanElevation / RNCan (Open Government Licence – Canada)',
  ahnnl:     'Relieve: AHN · PDOK / Rijkswaterstaat (Países Bajos, dominio público)',
  swisstopo: 'Relieve: swissALTI3D · © swisstopo (Suiza, datos abiertos)',
};

/**
 * Paso horizontal (m) que cada fuente puede entregar a los tamaños de ventana que
 * pide la app. NO es siempre el paso nativo del producto: 3DEP y HRDEM tienen
 * 1 m donde hubo vuelo LiDAR, pero el servicio nos remuestrea a lo que pedimos y
 * la cobertura fina no es nacional, así que acá va el número conservador —el que
 * se puede prometer en cualquier punto de la cobertura—, no el del folleto.
 *
 * Sirve para una sola cosa: saber hasta qué intervalo de curvas tiene sentido
 * dibujar. Antes la app asumía SRTM (~30 m) para todo el mundo, así que en Suiza
 * o en Países Bajos avisaba de un ruido de sensor que ya no existe y se negaba a
 * bajar de 2 m teniendo un modelo de 2 m y de 50 cm respectivamente.
 */
export const PASO_RELIEVE: Record<FuenteRelieve, number> = {
  glo30:     30,
  srtm30:    30,
  terrarium: 30,
  usuario:    1,   // se pisa con el paso real del archivo importado
  usgs3dep:  10,   // 1 m donde hay LiDAR; 10 m es lo garantizado en todo EE.UU.
  ignfr:      5,   // RGE ALTI es 1 m, pero el REST se consulta por lotes acotados
  ignes:      5,   // MDT05 PNOA-LiDAR (25 m en predios muy grandes)
  hrdemca:    2,
  ahnnl:      0.5,
  swisstopo:  2,
};

/**
 * Paso EFECTIVO de una grilla ya calculada, en metros: el mayor entre lo que da
 * la fuente y lo que da el muestreo. Es el segundo el que suele mandar —un predio
 * de 9 ha muestreado con 120 nodos por lado son ~3 m de paso, aunque swissALTI3D
 * tenga 2—: por debajo de esa distancia lo que se dibuja es la interpolación.
 */
export function pasoEfectivoM(g: GrillaElevacion): number {
  const latC   = (g.latMin + g.latMax) / 2;
  const anchoM = (g.lngMax - g.lngMin) * 111_320 * Math.cos(latC * Math.PI / 180);
  const altoM  = (g.latMax - g.latMin) * 111_320;
  const pasoGrilla = Math.max(
    g.cols > 1 ? anchoM / (g.cols - 1) : Infinity,
    g.rows > 1 ? altoM  / (g.rows - 1) : Infinity,
  );
  const pasoFuente = g.fuente ? PASO_RELIEVE[g.fuente] : PASO_RELIEVE.terrarium;
  return Math.max(pasoFuente, Number.isFinite(pasoGrilla) ? pasoGrilla : pasoFuente);
}

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
 * Remuestrea una grilla a un tamaño manejable (vecino más cercano). Un DEM propio
 * importado puede traer 512×512 = 262 k celdas: demasiado para el shader,
 * escorrentías y el render de celdas en Leaflet. Se baja a ≤ `maxLado` por lado
 * conservando el encuadre y la fuente; si ya es chica, se devuelve tal cual.
 */
export function remuestrearGrilla(g: GrillaElevacion, maxLado: number): GrillaElevacion {
  if (g.rows <= maxLado && g.cols <= maxLado) return g;
  const esc  = maxLado / Math.max(g.rows, g.cols);
  const rows = Math.max(2, Math.round(g.rows * esc));
  const cols = Math.max(2, Math.round(g.cols * esc));
  const elev = new Float64Array(rows * cols);
  let min = Infinity, max = -Infinity;
  for (let r = 0; r < rows; r++) {
    const sr = Math.min(g.rows - 1, Math.round((r / (rows - 1)) * (g.rows - 1)));
    for (let c = 0; c < cols; c++) {
      const sc = Math.min(g.cols - 1, Math.round((c / (cols - 1)) * (g.cols - 1)));
      const v  = g.elev[sr * g.cols + sc]!;
      elev[r * cols + c] = v;
      if (!Number.isNaN(v)) { if (v < min) min = v; if (v > max) max = v; }
    }
  }
  return {
    rows, cols,
    latMin: g.latMin, latMax: g.latMax, lngMin: g.lngMin, lngMax: g.lngMax,
    elev,
    elev_min: Number.isFinite(min) ? min : g.elev_min,
    elev_max: Number.isFinite(max) ? max : g.elev_max,
    fuente: g.fuente,
  };
}

/**
 * Recorta una grilla a la ventana de un polígono dibujado (una parcela dentro
 * del predio) y recalcula `elev_min`/`elev_max` SÓLO con las celdas que caen
 * adentro de ese polígono.
 *
 * El recálculo del rango es el punto de la función. Todo lo que se apoya en
 * curvas de nivel (swales, keyline) fija sus niveles a partir del desnivel
 * total de la grilla: en un predio de miles de hectáreas ese desnivel es tan
 * grande que un intervalo fino pide cientos de curvas y `calcularCurvas` se
 * corta por `MAX_NIVELES` sin dibujar ninguna. Acotado a una parcela, el
 * desnivel es el de la parcela y el trazado vuelve a ser posible.
 *
 * Las cotas de la ventana se conservan tal cual (no se enmascaran a NaN): el
 * marching squares necesita las 4 esquinas de cada celda, y el recorte fino al
 * polígono lo hace después quien consume las líneas.
 */
export function recortarGrillaA(
  g:     GrillaElevacion,
  verts: Array<{ lat: number; lng: number }>,
): GrillaElevacion | null {
  if (verts.length < 3 || g.rows < 2 || g.cols < 2) return null;

  const anillo = verts.map(v => [v.lng, v.lat] as [number, number]);
  anillo.push(anillo[0]!);
  let poly: ReturnType<typeof turf.polygon>;
  try { poly = turf.polygon([anillo]); } catch { return null; }

  const dLat = (g.latMax - g.latMin) / (g.rows - 1);
  const dLng = (g.lngMax - g.lngMin) / (g.cols - 1);
  if (!(dLat > 0) || !(dLng > 0)) return null;

  // Ventana de la parcela, con un anillo de margen para no perder la celda del borde.
  const lats = verts.map(v => v.lat), lngs = verts.map(v => v.lng);
  const r0 = Math.max(0, Math.floor((Math.min(...lats) - g.latMin) / dLat) - 1);
  const r1 = Math.min(g.rows - 1, Math.ceil((Math.max(...lats) - g.latMin) / dLat) + 1);
  const c0 = Math.max(0, Math.floor((Math.min(...lngs) - g.lngMin) / dLng) - 1);
  const c1 = Math.min(g.cols - 1, Math.ceil((Math.max(...lngs) - g.lngMin) / dLng) + 1);
  const rows = r1 - r0 + 1, cols = c1 - c0 + 1;
  if (rows < 2 || cols < 2) return null;

  const elev = new Float64Array(rows * cols);
  let min = Infinity, max = -Infinity;
  for (let r = 0; r < rows; r++) {
    const lat = g.latMin + (r0 + r) * dLat;
    for (let c = 0; c < cols; c++) {
      const v = g.elev[(r0 + r) * g.cols + (c0 + c)]!;
      elev[r * cols + c] = v;
      if (Number.isNaN(v)) continue;
      const lng = g.lngMin + (c0 + c) * dLng;
      if (!turf.booleanPointInPolygon(turf.point([lng, lat]), poly)) continue;
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  if (!Number.isFinite(min)) return null;   // la parcela no toca ninguna celda con dato

  return {
    rows, cols,
    latMin: g.latMin + r0 * dLat,
    latMax: g.latMin + r1 * dLat,
    lngMin: g.lngMin + c0 * dLng,
    lngMax: g.lngMin + c1 * dLng,
    elev,
    elev_min: min,
    elev_max: max,
    fuente: g.fuente,
  };
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
