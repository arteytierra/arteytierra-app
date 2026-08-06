/**
 * Delineación de cuenca de aporte sobre un DEM propio de hidrología (A1).
 *
 * A diferencia del D8 de `escorrentias.ts` (que corre sobre la grilla densa
 * recortada al predio), acá se trae una grilla Terrarium SIN recorte y más
 * grande que el terreno, para que la cuenca pueda subir por las laderas hasta
 * la divisoria real. Pasos:
 *
 *   1. Relleno de depresiones (priority-flood + ε): elimina los pozos falsos del
 *      SRTM que fragmentan el flujo y garantiza que todo drene al borde.
 *   2. D8 sobre el terreno rellenado → dirección de flujo.
 *   3. Acumulación de flujo (orden topológico).
 *   4. Delineación aguas-arriba desde la salida (BFS inverso), con snap al cauce.
 *   5. Expansión adaptativa: si la divisoria toca el borde del DEM, se agranda
 *      el bbox y se recalcula, hasta que la cuenca queda entera (o se topa el
 *      límite de iteraciones/tamaño).
 *
 * Devuelve el mismo tipo `Cuenca` que usa el panel, así que el análisis
 * hidrológico (CN/SCS) y el render en el mapa no cambian.
 */
import { obtenerGrillaHidro, elevEnGrilla, type GrillaElevacion, type BBox } from './grillaElevacion';
import type { Cuenca } from './cuenca';

// Vecindad de 8 (orden fijo, compartido por D8 y distancias).
const N8: ReadonlyArray<readonly [number, number]> = [
  [-1, -1], [-1, 0], [-1, 1],
  [ 0, -1],          [ 0, 1],
  [ 1, -1], [ 1, 0], [ 1, 1],
];

// ─── Min-heap numérico (prioridad = elevación, valor = índice de celda) ───────
class MinHeap {
  private ks: number[] = [];
  private vs: number[] = [];
  get size() { return this.ks.length; }
  push(k: number, v: number) {
    this.ks.push(k); this.vs.push(v);
    let i = this.ks.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.ks[p]! <= this.ks[i]!) break;
      this.swap(i, p); i = p;
    }
  }
  pop(): number {
    const topV = this.vs[0]!;
    const lastK = this.ks.pop()!, lastV = this.vs.pop()!;
    if (this.ks.length > 0) {
      this.ks[0] = lastK; this.vs[0] = lastV;
      let i = 0;
      const n = this.ks.length;
      for (;;) {
        const l = 2 * i + 1, r = 2 * i + 2;
        let m = i;
        if (l < n && this.ks[l]! < this.ks[m]!) m = l;
        if (r < n && this.ks[r]! < this.ks[m]!) m = r;
        if (m === i) break;
        this.swap(i, m); i = m;
      }
    }
    return topV;
  }
  private swap(a: number, b: number) {
    const tk = this.ks[a]!; this.ks[a] = this.ks[b]!; this.ks[b] = tk;
    const tv = this.vs[a]!; this.vs[a] = this.vs[b]!; this.vs[b] = tv;
  }
}

// ─── Dimensiones de celda en metros ───────────────────────────────────────────
function dimsCelda(g: GrillaElevacion) {
  const latMid = (g.latMin + g.latMax) / 2;
  const dy = ((g.latMax - g.latMin) / (g.rows - 1)) * 111_320;
  const dx = ((g.lngMax - g.lngMin) / (g.cols - 1)) * 111_320 * Math.cos(latMid * Math.PI / 180);
  const ddiag = Math.hypot(dx, dy);
  // distancias por dirección, en el mismo orden que N8
  const dist = [ddiag, dy, ddiag, dx, dx, ddiag, dy, ddiag];
  return { dx, dy, ddiag, dist, areaCelda: dx * dy };
}

// ─── 1. Relleno de depresiones (Priority-Flood + ε, Barnes 2014) ──────────────
function rellenarDepresiones(g: GrillaElevacion): Float64Array {
  const { rows, cols, elev } = g;
  const n = rows * cols;
  const filled = new Float64Array(n);
  const closed = new Uint8Array(n);
  const heap = new MinHeap();
  const pit: number[] = [];
  let pitHead = 0;
  const EPS = 1e-3;   // gradiente mínimo para drenar los llanos rellenados

  const esValida = (i: number) => !Number.isNaN(elev[i]!);

  // Semilla: celdas de borde del grid o adyacentes a nodata.
  for (let i = 0; i < n; i++) {
    if (!esValida(i)) { closed[i] = 1; filled[i] = NaN; continue; }
    const r = (i / cols) | 0, c = i % cols;
    let borde = r === 0 || c === 0 || r === rows - 1 || c === cols - 1;
    if (!borde) {
      for (const [dr, dc] of N8) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
        if (!esValida(nr * cols + nc)) { borde = true; break; }
      }
    }
    if (borde) { filled[i] = elev[i]!; closed[i] = 1; heap.push(elev[i]!, i); }
  }

  while (heap.size > 0 || pitHead < pit.length) {
    let c: number;
    if (pitHead < pit.length) c = pit[pitHead++]!;
    else                      c = heap.pop();
    const cElev = filled[c]!;
    const cr = (c / cols) | 0, cc = c % cols;
    for (const [dr, dc] of N8) {
      const nr = cr + dr, nc = cc + dc;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      const ni = nr * cols + nc;
      if (closed[ni]) continue;
      closed[ni] = 1;
      const e = elev[ni]!;
      if (Number.isNaN(e)) { filled[ni] = NaN; continue; }
      if (e <= cElev) { filled[ni] = cElev + EPS; pit.push(ni); }
      else            { filled[ni] = e;           heap.push(e, ni); }
    }
  }
  return filled;
}

// ─── 2. D8 sobre el terreno rellenado ─────────────────────────────────────────
function direccionFlujo(g: GrillaElevacion, filled: Float64Array): Int32Array {
  const { rows, cols } = g;
  const { dist } = dimsCelda(g);
  const n = rows * cols;
  const fd = new Int32Array(n).fill(-1);
  for (let i = 0; i < n; i++) {
    const e = filled[i]!;
    if (Number.isNaN(e)) continue;
    const r = (i / cols) | 0, c = i % cols;
    let maxS = 0, best = -1;
    for (let k = 0; k < 8; k++) {
      const nr = r + N8[k]![0], nc = c + N8[k]![1];
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      const ni = nr * cols + nc;
      const ne = filled[ni]!;
      if (Number.isNaN(ne)) continue;
      const s = (e - ne) / dist[k]!;
      if (s > maxS) { maxS = s; best = ni; }
    }
    fd[i] = best;
  }
  return fd;
}

// ─── 3. Acumulación de flujo (orden topológico de Kahn) ───────────────────────
function acumular(g: GrillaElevacion, filled: Float64Array, fd: Int32Array): Float64Array {
  const n = g.rows * g.cols;
  const indeg = new Int32Array(n);
  for (let i = 0; i < n; i++) { const t = fd[i]!; if (t >= 0) indeg[t]!++; }
  const acum = new Float64Array(n);
  const cola: number[] = [];
  let head = 0;
  for (let i = 0; i < n; i++) {
    if (Number.isNaN(filled[i]!)) continue;
    acum[i] = 1;
    if (indeg[i] === 0) cola.push(i);
  }
  while (head < cola.length) {
    const cur = cola[head++]!;
    const t = fd[cur]!;
    if (t >= 0) {
      acum[t]! += acum[cur]!;
      if (--indeg[t]! === 0) cola.push(t);
    }
  }
  return acum;
}

// ─── 4. Delineación aguas-arriba desde la salida ──────────────────────────────
function delimitar(fd: Int32Array, n: number, outlet: number): Set<number> {
  const inflow: number[][] = new Array(n);
  for (let i = 0; i < n; i++) {
    const t = fd[i]!;
    if (t >= 0) (inflow[t] ?? (inflow[t] = [])).push(i);
  }
  const set = new Set<number>([outlet]);
  const stack = [outlet];
  while (stack.length) {
    const cur = stack.pop()!;
    const ups = inflow[cur];
    if (!ups) continue;
    for (const u of ups) if (!set.has(u)) { set.add(u); stack.push(u); }
  }
  return set;
}

/** ¿La cuenca toca el borde del DEM? (⇒ podría estar recortada). */
function tocaBorde(set: Set<number>, rows: number, cols: number): boolean {
  for (const i of set) {
    const r = (i / cols) | 0, c = i % cols;
    if (r === 0 || c === 0 || r === rows - 1 || c === cols - 1) return true;
  }
  return false;
}

/** Reubica la salida a la celda de mayor acumulación en un radio (snap-to-stream). */
function snapSalida(acum: Float64Array, rows: number, cols: number, idx: number, radio = 2): number {
  const r0 = (idx / cols) | 0, c0 = idx % cols;
  // Mayor acumulación en la ventana (para saber dónde está el cauce).
  let maxA = acum[idx]!;
  for (let dr = -radio; dr <= radio; dr++) {
    for (let dc = -radio; dc <= radio; dc++) {
      const nr = r0 + dr, nc = c0 + dc;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      const a = acum[nr * cols + nc]!;
      if (a > maxA) maxA = a;
    }
  }
  // Enganchar al cauce MÁS CERCANO (acum ≥ 50% del máximo), no al de mayor
  // acumulación: así el punto de cierre no se desliza río abajo y no mete como
  // aporte zonas que en realidad están aguas-abajo de la salida.
  const umbral = maxA * 0.5;
  let best = idx, bestD = Infinity;
  for (let dr = -radio; dr <= radio; dr++) {
    for (let dc = -radio; dc <= radio; dc++) {
      const nr = r0 + dr, nc = c0 + dc;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      const ni = nr * cols + nc;
      if (acum[ni]! < umbral) continue;
      const d = dr * dr + dc * dc;
      if (d < bestD) { bestD = d; best = ni; }
    }
  }
  return best;
}

// ─── Contorno del conjunto de celdas → polígono ───────────────────────────────
function contorno(set: Set<number>, g: GrillaElevacion): Array<{ lat: number; lng: number }> {
  const { rows, cols, latMin, latMax, lngMin, lngMax } = g;
  const dLat = (latMax - latMin) / (rows - 1);
  const dLng = (lngMax - lngMin) / (cols - 1);
  const hLat = dLat / 2, hLng = dLng / 2;
  const rnd = (n: number) => Math.round(n * 1e7) / 1e7;
  const pk = (lat: number, lng: number) => `${rnd(lat)},${rnd(lng)}`;
  const edges = new Map<string, [[number, number], [number, number]]>();
  const toggle = (a: [number, number], b: [number, number]) => {
    const ka = pk(a[0], a[1]), kb = pk(b[0], b[1]);
    const key = ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
    if (edges.has(key)) edges.delete(key); else edges.set(key, [a, b]);
  };

  for (const i of set) {
    const r = (i / cols) | 0, c = i % cols;
    const latC = latMin + r * dLat, lngC = lngMin + c * dLng;
    const TL: [number, number] = [latC + hLat, lngC - hLng];
    const TR: [number, number] = [latC + hLat, lngC + hLng];
    const BL: [number, number] = [latC - hLat, lngC - hLng];
    const BR: [number, number] = [latC - hLat, lngC + hLng];
    toggle(TL, TR); toggle(BL, BR); toggle(TL, BL); toggle(TR, BR);
  }
  if (edges.size === 0) return [];

  const adj = new Map<string, Array<[number, number]>>();
  edges.forEach(([a, b]) => {
    const ka = pk(a[0], a[1]), kb = pk(b[0], b[1]);
    (adj.get(ka) ?? adj.set(ka, []).get(ka)!).push(b);
    (adj.get(kb) ?? adj.set(kb, []).get(kb)!).push(a);
  });

  const start = edges.values().next().value![0];
  const startK = pk(start[0], start[1]);
  const ring: Array<{ lat: number; lng: number }> = [];
  const visit = new Set<string>();
  let cur = start, curK = startK, prevK = '';
  for (let guard = 0; guard < edges.size * 2 + 4; guard++) {
    ring.push({ lat: cur[0], lng: cur[1] });
    visit.add(curK);
    const vecinos = adj.get(curK) ?? [];
    let next: [number, number] | null = null;
    for (const v of vecinos) {
      const vk = pk(v[0], v[1]);
      if (vk === prevK) continue;
      if (vk === startK && ring.length > 2) { next = v; break; }
      if (!visit.has(vk)) { next = v; break; }
    }
    if (!next) break;
    const nextK = pk(next[0], next[1]);
    if (nextK === startK) break;
    prevK = curK; cur = next; curK = nextK;
  }
  return ring;
}

// ─── Recorrido de flujo más largo hasta la salida ─────────────────────────────
function longitudFlujoMax(set: Set<number>, fd: Int32Array, cols: number, dx: number, dy: number, ddiag: number): number {
  const memo = new Map<number, number>();
  const paso = (a: number, b: number): number => {
    const ar = (a / cols) | 0, ac = a % cols;
    const br = (b / cols) | 0, bc = b % cols;
    const dr = Math.abs(ar - br), dc = Math.abs(ac - bc);
    if (dr && dc) return ddiag;
    return dr ? dy : dx;
  };
  const distHasta = (start: number): number => {
    const cadena: number[] = [];
    let cur = start, acc = 0;
    while (set.has(cur)) {
      if (memo.has(cur)) { acc += memo.get(cur)!; break; }
      cadena.push(cur);
      const to = fd[cur]!;
      if (to < 0 || !set.has(to)) break;
      acc += paso(cur, to);
      cur = to;
    }
    let restante = acc;
    for (let i = 0; i < cadena.length; i++) {
      memo.set(cadena[i]!, restante);
      if (i + 1 < cadena.length) restante -= paso(cadena[i]!, cadena[i + 1]!);
    }
    return acc;
  };
  let maxL = 0;
  for (const k of set) { const d = distHasta(k); if (d > maxL) maxL = d; }
  return maxL;
}

// ─── Construir el objeto Cuenca ───────────────────────────────────────────────
function construirCuenca(set: Set<number>, g: GrillaElevacion, fd: Int32Array, outlet: number): Cuenca {
  const { cols, latMin, latMax, lngMin, lngMax, elev } = g;
  const dLat = (latMax - latMin) / (g.rows - 1);
  const dLng = (lngMax - lngMin) / (cols - 1);
  const { dx, dy, ddiag, areaCelda } = dimsCelda(g);

  const or = (outlet / cols) | 0, oc = outlet % cols;
  const elevSalida = elev[outlet]!;
  let elevMax = elevSalida;
  for (const i of set) { const e = elev[i]!; if (!Number.isNaN(e) && e > elevMax) elevMax = e; }

  const area_m2 = set.size * areaCelda;
  const largo = longitudFlujoMax(set, fd, cols, dx, dy, ddiag);
  const L = Math.max(largo, Math.sqrt(area_m2));
  const desnivel = Math.max(0.1, elevMax - elevSalida);

  return {
    celdas:        Array.from(set, i => `${(i / cols) | 0},${i % cols}`),
    poligono:      contorno(set, g),
    area_m2,
    area_ha:       Math.round(area_m2 / 1e4 * 100) / 100,
    area_km2:      area_m2 / 1e6,
    long_flujo_m:  Math.round(L),
    pendiente_m_m: L > 0 ? desnivel / L : 0.01,
    elev_salida:   Math.round(elevSalida),
    elev_max:      Math.round(elevMax),
    outlet:        { lat: latMin + or * dLat, lng: lngMin + oc * dLng },
  };
}

// ─── Geometría de bbox ────────────────────────────────────────────────────────
export function bboxDeMojones(mojones: Array<{ lat: number; lng: number }>): BBox {
  const lats = mojones.map(m => m.lat), lngs = mojones.map(m => m.lng);
  return { latMin: Math.min(...lats), latMax: Math.max(...lats), lngMin: Math.min(...lngs), lngMax: Math.max(...lngs) };
}

function conMargen(b: BBox, factor: number, outlet?: { lat: number; lng: number }): BBox {
  let { latMin, latMax, lngMin, lngMax } = b;
  if (outlet) {
    latMin = Math.min(latMin, outlet.lat); latMax = Math.max(latMax, outlet.lat);
    lngMin = Math.min(lngMin, outlet.lng); lngMax = Math.max(lngMax, outlet.lng);
  }
  const mLat = Math.max((latMax - latMin) * factor, 0.002);
  const mLng = Math.max((lngMax - lngMin) * factor, 0.002);
  return { latMin: latMin - mLat, latMax: latMax + mLat, lngMin: lngMin - mLng, lngMax: lngMax + mLng };
}

function ladoMayorKm(b: BBox): number {
  const latMid = (b.latMin + b.latMax) / 2;
  const altoKm  = (b.latMax - b.latMin) * 111.32;
  const anchoKm = (b.lngMax - b.lngMin) * 111.32 * Math.cos(latMid * Math.PI / 180);
  return Math.max(altoKm, anchoKm);
}

function resolucionPara(b: BBox): number {
  const majorM = ladoMayorKm(b) * 1000;
  return Math.max(80, Math.min(320, Math.round(majorM / 30)));  // ~30 m/celda, acotado
}

// ─── Delineación de una cuenca sobre una grilla ya traída ─────────────────────
function delinearEnGrilla(g: GrillaElevacion, outletLat: number, outletLng: number) {
  const { rows, cols } = g;
  const n = rows * cols;

  // Celda más cercana a la salida (que tenga dato).
  const dLat = (g.latMax - g.latMin) / (rows - 1);
  const dLng = (g.lngMax - g.lngMin) / (cols - 1);
  let r0 = Math.round((outletLat - g.latMin) / dLat);
  let c0 = Math.round((outletLng - g.lngMin) / dLng);
  r0 = Math.max(0, Math.min(rows - 1, r0));
  c0 = Math.max(0, Math.min(cols - 1, c0));

  const filled = rellenarDepresiones(g);
  const fd = direccionFlujo(g, filled);
  const acum = acumular(g, filled, fd);

  // Snap al cauce (mayor acumulación cerca del clic).
  let idx = r0 * cols + c0;
  if (Number.isNaN(filled[idx]!)) return null;
  idx = snapSalida(acum, rows, cols, idx, 3);

  const set = delimitar(fd, n, idx);
  return { set, fd, filled, outlet: idx, toca: tocaBorde(set, rows, cols) };
}

// ─── 5. Orquestador adaptativo ────────────────────────────────────────────────
export interface ResultadoCuencaAdaptativa {
  cuenca:      Cuenca;
  completa:    boolean;   // false ⇒ la divisoria seguía tocando el borde del DEM
  iteraciones: number;
}

/**
 * Delinea la cuenca sobre una grilla YA cargada (sin expansión ni fetch de
 * tiles). Útil para recomputar al editar la cuenca a mano (A2) y para tests.
 */
export function delinearCuencaEnGrilla(
  g: GrillaElevacion,
  outletLat: number,
  outletLng: number,
): ResultadoCuencaAdaptativa | null {
  const res = delinearEnGrilla(g, outletLat, outletLng);
  if (!res) return null;
  return { cuenca: construirCuenca(res.set, g, res.fd, res.outlet), completa: !res.toca, iteraciones: 1 };
}

/**
 * Delinea la cuenca aguas-arriba de un punto, agrandando el DEM hasta que la
 * divisoria queda contenida (o se topa el límite). El terreno (bbox de mojones)
 * fija el punto de partida; el outlet es el clic del usuario.
 */
/**
 * Punto de menor cota a lo largo de una arista (el lado-muro de la represa),
 * muestreando la grilla cargada. Es la salida natural de la cuenca: donde el
 * cauce cruza el muro. Devuelve null si la arista no cae sobre datos.
 */
export function puntoMasBajoEnArista(
  g: GrillaElevacion,
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
  n = 25,
): { lat: number; lng: number; elev: number } | null {
  let best: { lat: number; lng: number; elev: number } | null = null;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const lat = a.lat + (b.lat - a.lat) * t;
    const lng = a.lng + (b.lng - a.lng) * t;
    const e = elevEnGrilla(g, lat, lng);
    if (!Number.isNaN(e) && (best === null || e < best.elev)) best = { lat, lng, elev: e };
  }
  return best;
}

// ─── Cuenca manual / editable (A2) ────────────────────────────────────────────

function pipLatLng(lat: number, lng: number, poly: Array<{ lat: number; lng: number }>): boolean {
  let dentro = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i]!.lng, yi = poly[i]!.lat, xj = poly[j]!.lng, yj = poly[j]!.lat;
    if (((yi > lat) !== (yj > lat)) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
}

function areaPoligonoM2(poly: Array<{ lat: number; lng: number }>, latMid: number): number {
  const kx = 111320 * Math.cos(latMid * Math.PI / 180), ky = 111320;
  let s = 0;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    s += poly[j]!.lng * kx * (poly[i]!.lat * ky) - poly[i]!.lng * kx * (poly[j]!.lat * ky);
  }
  return Math.abs(s) / 2;
}

/**
 * Construye una `Cuenca` a partir de un polígono dibujado a mano, usando la
 * grilla para las cotas. El área sale del polígono (shoelace); la salida es el
 * punto interno de menor cota; la longitud, el eje mayor. Sin flujo D8 —es una
 * cuenca "declarada" por quien sabe leer la topografía.
 */
export function cuencaDesdePoligono(g: GrillaElevacion, poligono: Array<{ lat: number; lng: number }>): Cuenca | null {
  if (poligono.length < 3) return null;
  const latMid = poligono.reduce((s, p) => s + p.lat, 0) / poligono.length;
  const area_m2 = areaPoligonoM2(poligono, latMid);
  if (area_m2 <= 0) return null;

  const { rows, cols, latMin, latMax, lngMin, lngMax, elev } = g;
  let elevMin = Infinity, elevMax = -Infinity, outLat = poligono[0]!.lat, outLng = poligono[0]!.lng;
  for (let r = 0; r < rows; r++) {
    const lat = latMin + (r / (rows - 1)) * (latMax - latMin);
    for (let c = 0; c < cols; c++) {
      const e = elev[r * cols + c]!;
      if (Number.isNaN(e)) continue;
      const lng = lngMin + (c / (cols - 1)) * (lngMax - lngMin);
      if (!pipLatLng(lat, lng, poligono)) continue;
      if (e < elevMin) { elevMin = e; outLat = lat; outLng = lng; }
      if (e > elevMax) elevMax = e;
    }
  }
  if (!Number.isFinite(elevMin)) {
    // Polígono más chico que un paso de grilla: usar las cotas de los vértices.
    for (const p of poligono) {
      const e = elevEnGrilla(g, p.lat, p.lng);
      if (Number.isNaN(e)) continue;
      if (e < elevMin) { elevMin = e; outLat = p.lat; outLng = p.lng; }
      if (e > elevMax) elevMax = e;
    }
  }
  if (!Number.isFinite(elevMin)) { elevMin = 0; elevMax = 0.1; }

  const kx = 111320 * Math.cos(latMid * Math.PI / 180), ky = 111320;
  let L = 0;
  for (let i = 0; i < poligono.length; i++) {
    for (let j = i + 1; j < poligono.length; j++) {
      const dx = (poligono[j]!.lng - poligono[i]!.lng) * kx, dy = (poligono[j]!.lat - poligono[i]!.lat) * ky;
      const d = Math.hypot(dx, dy);
      if (d > L) L = d;
    }
  }
  L = Math.max(L, Math.sqrt(area_m2));
  const desnivel = Math.max(0.1, elevMax - elevMin);

  return {
    celdas:        [],
    poligono:      poligono.map(p => ({ lat: p.lat, lng: p.lng })),
    area_m2,
    area_ha:       Math.round(area_m2 / 1e4 * 100) / 100,
    area_km2:      area_m2 / 1e6,
    long_flujo_m:  Math.round(L),
    pendiente_m_m: L > 0 ? desnivel / L : 0.01,
    elev_salida:   Math.round(elevMin),
    elev_max:      Math.round(elevMax),
    outlet:        { lat: outLat, lng: outLng },
  };
}

/** Trae la grilla de cotas del bbox del polígono y construye la cuenca manual. */
export async function cuencaManualDesdePoligono(poligono: Array<{ lat: number; lng: number }>): Promise<Cuenca | null> {
  if (poligono.length < 3) return null;
  const bbox = conMargen(bboxDeMojones(poligono), 0.05);
  const g = await obtenerGrillaHidro(bbox, resolucionPara(bbox));
  if (!g) return null;
  return cuencaDesdePoligono(g, poligono);
}

/** Simplifica un anillo (Douglas-Peucker en metros) para poder editarlo a mano. */
export function simplificarAnillo(ring: Array<{ lat: number; lng: number }>, tolMetros = 25): Array<{ lat: number; lng: number }> {
  if (ring.length <= 4) return ring.map(p => ({ lat: p.lat, lng: p.lng }));
  const latMid = ring.reduce((s, p) => s + p.lat, 0) / ring.length;
  const kx = 111320 * Math.cos(latMid * Math.PI / 180), ky = 111320;
  const P = ring.map(p => ({ x: p.lng * kx, y: p.lat * ky }));
  const n = P.length;
  const keep = new Array<boolean>(n).fill(false);
  keep[0] = keep[n - 1] = true;
  const distSeg = (i: number, a: number, b: number): number => {
    const ax = P[a]!.x, ay = P[a]!.y, bx = P[b]!.x, by = P[b]!.y, px = P[i]!.x, py = P[i]!.y;
    const dx = bx - ax, dy = by - ay;
    const len2 = dx * dx + dy * dy;
    if (len2 === 0) return Math.hypot(px - ax, py - ay);
    let t = ((px - ax) * dx + (py - ay) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
  };
  const stack: Array<[number, number]> = [[0, n - 1]];
  while (stack.length) {
    const [a, b] = stack.pop()!;
    let idx = -1, maxD = tolMetros;
    for (let i = a + 1; i < b; i++) { const d = distSeg(i, a, b); if (d > maxD) { maxD = d; idx = i; } }
    if (idx >= 0) { keep[idx] = true; stack.push([a, idx], [idx, b]); }
  }
  const out = ring.filter((_, i) => keep[i]).map(p => ({ lat: p.lat, lng: p.lng }));
  return out.length >= 3 ? out : ring.map(p => ({ lat: p.lat, lng: p.lng }));
}

// Filtra las celdas de la cuenca a las que caen dentro de un polígono (el predio).
function filtrarSetPorPoligono(set: Set<number>, g: GrillaElevacion, poly: Array<{ lat: number; lng: number }>): Set<number> {
  const { cols, rows, latMin, latMax, lngMin, lngMax } = g;
  const dLat = (latMax - latMin) / (rows - 1), dLng = (lngMax - lngMin) / (cols - 1);
  const out = new Set<number>();
  for (const i of set) {
    const r = (i / cols) | 0, c = i % cols;
    if (pipLatLng(latMin + r * dLat, lngMin + c * dLng, poly)) out.add(i);
  }
  return out;
}

/**
 * Delinea la cuenca aguas-arriba de un punto.
 *
 * Por defecto (`expand: false`) acota la cuenca al terreno: una sola pasada sobre
 * el bbox del predio y, si se pasa `clip`, se recorta al polígono del terreno.
 * Es lo útil para dimensionar captación en la escala de la finca (una cuenca de
 * montaña completa puede ser de miles de ha, inmanejable).
 *
 * Con `expand: true` agranda el DEM hasta contener la divisoria real (o hasta el
 * límite de iteraciones/tamaño) — el "recalcular hasta la divisoria" a pedido.
 */
export async function cuencaAdaptativa(
  outlet:  { lat: number; lng: number },
  predio:  BBox,
  opts?: { maxIter?: number; maxLadoKm?: number; expand?: boolean; clip?: Array<{ lat: number; lng: number }> },
): Promise<ResultadoCuencaAdaptativa | null> {
  const expand = opts?.expand ?? false;

  // ── Acotado al terreno (default) ──
  if (!expand) {
    const bbox = conMargen(predio, 0.2, outlet);
    const g = await obtenerGrillaHidro(bbox, resolucionPara(bbox));
    if (!g) return null;
    const res = delinearEnGrilla(g, outlet.lat, outlet.lng);
    if (!res) return null;
    let set = res.set;
    if (opts?.clip && opts.clip.length >= 3) {
      const rec = filtrarSetPorPoligono(set, g, opts.clip);
      if (rec.size >= 1) set = rec;
    }
    return { cuenca: construirCuenca(set, g, res.fd, res.outlet), completa: true, iteraciones: 1 };
  }

  // ── Expandido hasta la divisoria real ──
  const maxIter   = opts?.maxIter   ?? 4;
  const maxLadoKm = opts?.maxLadoKm ?? 25;

  let bbox = conMargen(predio, 0.6, outlet);
  let ultimo: { set: Set<number>; fd: Int32Array; filled: Float64Array; outlet: number; toca: boolean } | null = null;
  let grillaUlt: GrillaElevacion | null = null;
  let iter = 0;

  for (; iter < maxIter; iter++) {
    const g = await obtenerGrillaHidro(bbox, resolucionPara(bbox));
    if (!g) {
      if (grillaUlt && ultimo) break;   // usar el mejor resultado previo
      return null;
    }
    const res = delinearEnGrilla(g, outlet.lat, outlet.lng);
    if (!res) return null;
    ultimo = res; grillaUlt = g;

    if (!res.toca) break;                       // divisoria adentro ⇒ cuenca completa
    if (ladoMayorKm(bbox) >= maxLadoKm) break;  // no seguir agrandando
    bbox = conMargen(bbox, 0.7);                // crecer y reintentar
  }

  if (!ultimo || !grillaUlt) return null;
  const cuenca = construirCuenca(ultimo.set, grillaUlt, ultimo.fd, ultimo.outlet);
  return { cuenca, completa: !ultimo.toca, iteraciones: iter + 1 };
}

// ─── 6. Sugerencia de sitios de represa por eficiencia (agua ÷ muro) ───────────

export interface SitioRepresa {
  lat: number; lng: number;
  elev: number;             // cota del cauce (base del muro)
  altura_m: number;         // nivel de agua sobre el cauce
  volumen_agua_m3: number;  // embalse aguas-arriba del muro
  area_ha: number;          // espejo inundado
  ancho_muro_m: number;     // ancho del cierre (cuello de botella)
  volumen_muro_m3: number;  // terraplén
  eficiencia: number;       // agua ÷ muro
}

/**
 * Busca los mejores emplazamientos de represa sobre una grilla: recorre las
 * celdas de cauce (alta acumulación) y en cada una simula un muro a varias
 * alturas, estimando el agua embalsada aguas-arriba (pool bajo el nivel) y el
 * volumen de muro para cerrar el ancho del valle a esa cota. Rankea por
 * eficiencia agua/muro → prioriza los cuellos de botella (poco muro, mucha agua).
 */
export function buscarSitiosRepresa(
  g: GrillaElevacion,
  opts?: { alturas?: number[]; minAgua?: number; max?: number; sepMetros?: number; clip?: Array<{ lat: number; lng: number }> },
): SitioRepresa[] {
  const { rows, cols, latMin, latMax, lngMin, lngMax } = g;
  const n = rows * cols;
  const filled = rellenarDepresiones(g);
  const fd = direccionFlujo(g, filled);
  const acum = acumular(g, filled, fd);
  const { dx, dy, areaCelda } = dimsCelda(g);
  const cellAvg = (dx + dy) / 2;
  const dLat = (latMax - latMin) / (rows - 1), dLng = (lngMax - lngMin) / (cols - 1);

  const alturas  = opts?.alturas  ?? [3, 5, 8];
  const minAgua  = opts?.minAgua  ?? 1000;
  const maxSitios = opts?.max     ?? 6;
  const sepM     = opts?.sepMetros ?? 150;
  const clip     = opts?.clip;

  // Geometría de muro por defecto (represa de ladera).
  const CORONA = 3, T1 = 3, T2 = 2, REV = 0.5;
  const volMuroDe = (H: number, ancho: number) => {
    const alto = H + REV;
    const base = CORONA + alto * (T1 + T2);
    return ((CORONA + base) / 2) * alto * ancho;
  };

  const cellLat = (i: number) => latMin + ((i / cols) | 0) * dLat;
  const cellLng = (i: number) => lngMin + (i % cols) * dLng;

  // Umbral de cauce e inflow (adyacencia inversa).
  let maxA = 0;
  for (let i = 0; i < n; i++) if (acum[i]! > maxA) maxA = acum[i]!;
  const umbral = Math.max(10, maxA * 0.03);
  const inflow: number[][] = new Array(n);
  for (let i = 0; i < n; i++) { const t = fd[i]!; if (t >= 0) (inflow[t] ?? (inflow[t] = [])).push(i); }

  // Candidatos = celdas de cauce (dentro del clip), acotados a los de mayor acumulación.
  let candidatos: number[] = [];
  for (let i = 0; i < n; i++) {
    if (Number.isNaN(filled[i]!) || acum[i]! < umbral || fd[i]! < 0) continue;
    if (clip && !pipLatLng(cellLat(i), cellLng(i), clip)) continue;
    candidatos.push(i);
  }
  if (candidatos.length > 400) candidatos = candidatos.sort((a, b) => acum[b]! - acum[a]!).slice(0, 400);

  // Sello de visitados reutilizable (evita alocar un Set por candidato).
  const stamp = new Int32Array(n);
  let gen = 0;

  const sitios: SitioRepresa[] = [];
  for (const d of candidatos) {
    const t = fd[d]!;
    const dr = ((t / cols) | 0) - ((d / cols) | 0), dc = (t % cols) - (d % cols);
    const pr = -dc, pc = dr;   // perpendicular al flujo (eje del muro)
    const baseElev = filled[d]!;

    let best: SitioRepresa | null = null;
    for (const H of alturas) {
      const L = baseElev + H;
      // Pool aguas-arriba: BFS por adyacencia inversa, celdas con cota < L.
      gen++;
      let vol = (L - baseElev) * areaCelda, celdas = 1;
      stamp[d] = gen;
      const stack = [d];
      while (stack.length) {
        const cur = stack.pop()!;
        const ups = inflow[cur];
        if (!ups) continue;
        for (const u of ups) {
          if (stamp[u] === gen) continue;
          const e = filled[u]!;
          if (Number.isNaN(e) || e >= L) continue;
          stamp[u] = gen;
          vol += (L - e) * areaCelda; celdas++;
          if (celdas < 40000) stack.push(u);
        }
      }
      if (vol < minAgua) continue;

      // Ancho del cierre: caminar perpendicular desde d mientras la cota < L.
      let ancho = 1;
      for (const sign of [1, -1]) {
        let rr = (d / cols) | 0, cc = d % cols;
        for (let s = 0; s < 80; s++) {
          rr += pr * sign; cc += pc * sign;
          if (rr < 0 || cc < 0 || rr >= rows || cc >= cols) break;
          const e = filled[rr * cols + cc]!;
          if (Number.isNaN(e) || e >= L) break;
          ancho++;
        }
      }
      const anchoM = ancho * cellAvg;
      const volMuro = volMuroDe(H, anchoM);
      const efic = volMuro > 0 ? vol / volMuro : 0;
      if (!best || efic > best.eficiencia) {
        best = {
          lat: cellLat(d), lng: cellLng(d), elev: Math.round(baseElev),
          altura_m: H,
          volumen_agua_m3: Math.round(vol),
          area_ha: Math.round(celdas * areaCelda / 1e4 * 100) / 100,
          ancho_muro_m: Math.round(anchoM),
          volumen_muro_m3: Math.round(volMuro),
          eficiencia: Math.round(efic * 10) / 10,
        };
      }
    }
    if (best) sitios.push(best);
  }

  // Rankear por eficiencia y quedarse con los mejores bien separados entre sí.
  sitios.sort((a, b) => b.eficiencia - a.eficiencia);
  const kx = 111320 * Math.cos((latMin + latMax) / 2 * Math.PI / 180), ky = 111320;
  const elegidos: SitioRepresa[] = [];
  for (const s of sitios) {
    if (elegidos.length >= maxSitios) break;
    const lejos = elegidos.every(e => Math.hypot((s.lng - e.lng) * kx, (s.lat - e.lat) * ky) > sepM);
    if (lejos) elegidos.push(s);
  }
  return elegidos;
}

/** Trae la grilla del predio y sugiere los mejores sitios de represa. */
export async function sugerirSitiosRepresa(
  predio: BBox,
  clip?: Array<{ lat: number; lng: number }>,
): Promise<SitioRepresa[]> {
  const bbox = conMargen(predio, 0.1);
  const g = await obtenerGrillaHidro(bbox, resolucionPara(bbox));
  if (!g) return [];
  return buscarSitiosRepresa(g, { clip });
}

// ═══════════════════════════════════════════════════════════════════════════
//  Caminos por crestas / parteaguas (ruteo de mínimo costo sobre el relieve)
// ═══════════════════════════════════════════════════════════════════════════
//  Criterio (Yeomans / vialidad rural): el camino va por las divisorias de agua
//  (crestas) porque drenan solas, no se embarran y no erosionan. Baja a la ladera
//  solo lo necesario y con poca pendiente. NUNCA corre por una vertiente/cauce:
//  cuando tiene que cruzar un drenaje lo hace en un punto (puente si el cauce es
//  grande, alcantarilla/tubo si es chico).

/** Capas derivadas del relieve para rutear caminos. */
export interface AnalisisRelieve {
  g:        GrillaElevacion;
  filled:   Float64Array;
  acum:     Float64Array;   // acumulación de flujo (cauces = alta)
  ridge:    Float64Array;   // acumulación sobre el DEM invertido (crestas = alta)
  pend:     Float64Array;   // pendiente local (fracción, rise/run) por celda
  acumMax:  number;
  ridgeMax: number;
  umbralCauce: number;      // acum ≥ umbral ⇒ es cauce (vertiente)
}

/** Invierte la grilla (cima↔valle) para que las crestas se comporten como cauces. */
function grillaInvertida(g: GrillaElevacion): GrillaElevacion {
  const n = g.rows * g.cols;
  const elev = new Float64Array(n);
  const base = g.elev_max;
  for (let i = 0; i < n; i++) {
    const e = g.elev[i]!;
    elev[i] = Number.isNaN(e) ? NaN : base - e;
  }
  return { ...g, elev, elev_min: 0, elev_max: base - g.elev_min };
}

/** Pendiente local (fracción) por celda: máxima diferencia con vecinos / distancia. */
function pendienteLocal(g: GrillaElevacion): Float64Array {
  const { rows, cols, elev } = g;
  const { dist } = dimsCelda(g);
  const n = rows * cols;
  const pend = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const e = elev[i]!;
    if (Number.isNaN(e)) { pend[i] = NaN; continue; }
    const r = (i / cols) | 0, c = i % cols;
    let maxS = 0;
    for (let k = 0; k < 8; k++) {
      const nr = r + N8[k]![0], nc = c + N8[k]![1];
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      const ne = elev[nr * cols + nc]!;
      if (Number.isNaN(ne)) continue;
      const s = Math.abs(e - ne) / dist[k]!;
      if (s > maxS) maxS = s;
    }
    pend[i] = maxS;
  }
  return pend;
}

/** Deriva del relieve las capas de cauces (acum) y crestas (ridge) + pendiente. */
export function analizarRelieve(g: GrillaElevacion): AnalisisRelieve {
  const n = g.rows * g.cols;
  const filled = rellenarDepresiones(g);
  const fd = direccionFlujo(g, filled);
  const acum = acumular(g, filled, fd);

  const gi = grillaInvertida(g);
  const filledI = rellenarDepresiones(gi);
  const fdI = direccionFlujo(gi, filledI);
  const ridge = acumular(gi, filledI, fdI);

  const pend = pendienteLocal(g);

  let acumMax = 0, ridgeMax = 0;
  for (let i = 0; i < n; i++) {
    if (acum[i]! > acumMax) acumMax = acum[i]!;
    if (ridge[i]! > ridgeMax) ridgeMax = ridge[i]!;
  }
  const umbralCauce = Math.max(8, acumMax * 0.03);
  return { g, filled, acum, ridge, pend, acumMax, ridgeMax, umbralCauce };
}

export interface CruceDrenaje {
  lat: number; lng: number;
  tipo: 'puente' | 'alcantarilla';
  caudalRel: number;   // 0-1, tamaño del cauce cruzado
}

export interface CaminoRelieve {
  vertices: Array<{ lat: number; lng: number }>;
  longitud_m: number;
  pendiente_media_pct: number;
  pendiente_max_pct: number;
  cruces: CruceDrenaje[];
  frac_cresta: number;   // fracción del recorrido que va por cresta (0-1)
}

const idxDeLatLng = (g: GrillaElevacion, lat: number, lng: number): number => {
  const r = Math.round((lat - g.latMin) / (g.latMax - g.latMin) * (g.rows - 1));
  const c = Math.round((lng - g.lngMin) / (g.lngMax - g.lngMin) * (g.cols - 1));
  if (r < 0 || c < 0 || r >= g.rows || c >= g.cols) return -1;
  const i = r * g.cols + c;
  return Number.isNaN(g.elev[i]!) ? celdaValidaCerca(g, r, c) : i;
};

/** Si el nodo objetivo cae en nodata, busca la celda válida más cercana en espiral. */
function celdaValidaCerca(g: GrillaElevacion, r0: number, c0: number): number {
  const { rows, cols, elev } = g;
  for (let rad = 1; rad < 12; rad++) {
    for (let dr = -rad; dr <= rad; dr++) {
      for (let dc = -rad; dc <= rad; dc++) {
        if (Math.max(Math.abs(dr), Math.abs(dc)) !== rad) continue;
        const nr = r0 + dr, nc = c0 + dc;
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
        const i = nr * cols + nc;
        if (!Number.isNaN(elev[i]!)) return i;
      }
    }
  }
  return -1;
}

/**
 * Traza el camino de mínimo costo entre dos puntos siguiendo crestas, evitando
 * pendientes fuertes y las vertientes (solo las cruza en un punto). Dijkstra 8-vec
 * sobre una superficie de costo:
 *   costo(paso) = distancia · (1 + Kpend·exceso² ) · factorCresta  +  penalCauce
 * — factorCresta < 1 abarata las celdas de divisoria; penalCauce castiga entrar en
 * un cauce (proporcional a su caudal), pero lo permite → se marca como cruce.
 */
export function trazarCaminoRelieve(
  a:  AnalisisRelieve,
  origen:  { lat: number; lng: number },
  destino: { lat: number; lng: number },
  opts?: { pendMaxPct?: number },
  limite?: Array<{ lat: number; lng: number }>,
): CaminoRelieve | null {
  const { g, acum, ridge, pend, ridgeMax, umbralCauce } = a;
  const { rows, cols } = g;
  const n = rows * cols;
  const { dist } = dimsCelda(g);
  const pendMax = (opts?.pendMaxPct ?? 12) / 100;   // umbral de confort de pendiente

  const src = idxDeLatLng(g, origen.lat, origen.lng);
  const dst = idxDeLatLng(g, destino.lat, destino.lng);
  if (src < 0 || dst < 0 || src === dst) return null;

  // Restricción al polígono del predio: prohíbe rutear por celdas cuyo centro
  // cae FUERA de los mojones (así el camino no se escapa por la divisoria).
  let permitido: Uint8Array | null = null;
  if (limite && limite.length >= 3) {
    permitido = new Uint8Array(n);
    const dLatM = (g.latMax - g.latMin) / (rows - 1), dLngM = (g.lngMax - g.lngMin) / (cols - 1);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (pipLatLng(g.latMin + r * dLatM, g.lngMin + c * dLngM, limite)) permitido[r * cols + c] = 1;
      }
    }
    permitido[src] = 1; permitido[dst] = 1;   // los extremos siempre valen (pueden caer en el borde)
  }

  const D = new Float64Array(n).fill(Infinity);
  const prev = new Int32Array(n).fill(-1);
  const done = new Uint8Array(n);
  const heap = new MinHeap();
  D[src] = 0;
  heap.push(0, src);

  const Kpend = 8;      // peso del exceso de pendiente
  const Kcresta = 0.55; // hasta -55% de costo en cresta pura
  const Kcauce = 6;     // penalización por atravesar cauce (× distancia)

  while (heap.size > 0) {
    const cur = heap.pop();
    if (done[cur]) continue;
    done[cur] = 1;
    if (cur === dst) break;
    const cr = (cur / cols) | 0, cc = cur % cols;
    const dCur = D[cur]!;
    for (let k = 0; k < 8; k++) {
      const nr = cr + N8[k]![0], nc = cc + N8[k]![1];
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      const ni = nr * cols + nc;
      if (done[ni] || Number.isNaN(g.elev[ni]!)) continue;
      if (permitido && !permitido[ni]) continue;   // fuera del predio: no rutear

      const dm = dist[k]!;
      // Pendiente del paso (rise/run) — es lo que sufre la máquina/vehículo.
      const rise = Math.abs(g.elev[ni]! - g.elev[cur]!);
      const grade = rise / dm;
      const exceso = Math.max(0, grade - pendMax) / pendMax;
      const fPend = 1 + Kpend * exceso * exceso;

      // Bonus por ir por cresta (alta acumulación en el DEM invertido).
      const ridgeRel = ridgeMax > 0 ? ridge[ni]! / ridgeMax : 0;
      const fCresta = 1 - Kcresta * Math.min(1, Math.sqrt(ridgeRel) * 3);

      // Penalización por meterse en un cauce (proporcional al caudal).
      let penalCauce = 0;
      if (acum[ni]! >= umbralCauce) {
        const caudalRel = Math.min(1, acum[ni]! / a.acumMax);
        penalCauce = Kcauce * dm * (0.3 + caudalRel);
      }

      const paso = dm * fPend * fCresta + penalCauce;
      const nd = dCur + paso;
      if (nd < D[ni]!) {
        D[ni] = nd;
        prev[ni] = cur;
        heap.push(nd, ni);
      }
    }
  }

  if (prev[dst]! < 0 && src !== dst) return null;

  // Reconstruir la ruta de celdas.
  const ruta: number[] = [];
  for (let i = dst; i >= 0; i = prev[i]!) { ruta.push(i); if (i === src) break; }
  ruta.reverse();
  if (ruta.length < 2) return null;

  const dLat = (g.latMax - g.latMin) / (rows - 1), dLng = (g.lngMax - g.lngMin) / (cols - 1);
  const cellLatLng = (i: number) => ({
    lat: g.latMin + ((i / cols) | 0) * dLat,
    lng: g.lngMin + (i % cols) * dLng,
  });

  // Métricas + detección de cruces de cauce.
  const ky0 = 111_320, kx0 = 111_320 * Math.cos((g.latMin + g.latMax) / 2 * Math.PI / 180);
  const cellAvg = (dLat * ky0 + dLng * kx0) / 2;
  const dedupM = Math.max(120, 2.5 * cellAvg);   // fusiona cruces del mismo cauce
  let longitud = 0, pendSum = 0, pendMaxReal = 0, enCresta = 0;
  const cruces: CruceDrenaje[] = [];
  const ridgeUmbral = ridgeMax * 0.15;
  for (let s = 0; s < ruta.length; s++) {
    const i = ruta[s]!;
    if (ridge[i]! >= ridgeUmbral) enCresta++;
    if (s > 0) {
      const p = ruta[s - 1]!;
      const dr = ((i / cols) | 0) - ((p / cols) | 0);
      const dc = (i % cols) - (p % cols);
      const dm = Math.hypot(dc * (dLng * 111_320 * Math.cos((g.latMin + g.latMax) / 2 * Math.PI / 180)), dr * dLat * 111_320);
      longitud += dm;
      const grade = Math.abs(g.elev[i]! - g.elev[p]!) / (dm || 1);
      pendSum += grade;
      if (grade > pendMaxReal) pendMaxReal = grade;
      // ¿Este paso entra a un cauce que antes no lo era? → cruce (dedup por cercanía).
      if (acum[i]! >= umbralCauce && acum[p]! < umbralCauce) {
        const caudalRel = Math.min(1, acum[i]! / a.acumMax);
        const cl = cellLatLng(i);
        const cerca = cruces.some(x => Math.hypot((x.lng - cl.lng) * kx0, (x.lat - cl.lat) * ky0) < dedupM);
        if (!cerca) cruces.push({ lat: cl.lat, lng: cl.lng, tipo: caudalRel > 0.25 ? 'puente' : 'alcantarilla', caudalRel: Math.round(caudalRel * 100) / 100 });
      }
    }
  }
  const nSeg = ruta.length - 1;

  // Simplificar la polilínea (menos vértices, mismo trazado).
  const verticesRaw = ruta.map(cellLatLng);
  const vertices = simplificarAnillo(verticesRaw, Math.max(15, longitud / 60));

  return {
    vertices,
    longitud_m: Math.round(longitud),
    pendiente_media_pct: Math.round((pendSum / Math.max(1, nSeg)) * 1000) / 10,
    pendiente_max_pct: Math.round(pendMaxReal * 1000) / 10,
    cruces,
    frac_cresta: Math.round((enCresta / ruta.length) * 100) / 100,
  };
}

/** Trae la grilla y traza un camino por crestas entre dos puntos. */
export async function sugerirCaminoRelieve(
  origen:  { lat: number; lng: number },
  destino: { lat: number; lng: number },
  opts?: { pendMaxPct?: number },
  limite?: Array<{ lat: number; lng: number }>,
): Promise<CaminoRelieve | null> {
  // Si hay un predio, la grilla cubre TODO el predio (no solo los extremos), para
  // que el mask tenga celdas dentro de todo el contorno; si no, el bbox de los extremos.
  const base = limite && limite.length >= 3 ? bboxDeMojones(limite) : bboxDeMojones([origen, destino]);
  const bbox = conMargen(base, limite && limite.length >= 3 ? 0.1 : 0.35);
  const g = await obtenerGrillaHidro(bbox, resolucionPara(bbox));
  if (!g) return null;
  return trazarCaminoRelieve(analizarRelieve(g), origen, destino, opts, limite);
}

// ═══════════════════════════════════════════════════════════════════════════
//  Análisis topográfico integral: represas + zonas de vivienda + caminos juntos
// ═══════════════════════════════════════════════════════════════════════════

export interface ZonaVivienda {
  lat: number; lng: number;
  score: number;          // 0-100
  pendiente_pct: number;
  motivos: string[];
}

export interface CaminoSugerido {
  nombre: string;
  destino: string;        // a qué conecta ("Vivienda", "Represa 1"…)
  camino: CaminoRelieve;
}

export interface AnalisisTopoIntegral {
  represas:  SitioRepresa[];
  viviendas: ZonaVivienda[];
  caminos:   CaminoSugerido[];
  entrada:   { lat: number; lng: number };
}

/** Puntúa las celdas del predio como zona de vivienda (ladera al ecuador, pendiente
 *  suave, sobre cota de drenaje, posición media-alta). Devuelve las mejores, separadas. */
function scorearViviendas(
  a: AnalisisRelieve,
  predio: Array<{ lat: number; lng: number }>,
  maxN = 3,
  sepM = 120,
): ZonaVivienda[] {
  const { g, acum, ridge, pend, acumMax, ridgeMax } = a;
  const { rows, cols, latMin, latMax, lngMin, lngMax, elev, elev_min, elev_max } = g;
  const dLat = (latMax - latMin) / (rows - 1), dLng = (lngMax - lngMin) / (cols - 1);
  // Hemisferio: al ecuador = hacia el norte si estamos al sur (lat<0). row+1 = más al norte.
  const haciaEcuadorEsNorte = (latMin + latMax) / 2 < 0;
  const rango = Math.max(1, elev_max - elev_min);

  const cand: ZonaVivienda[] = [];
  for (let r = 1; r < rows - 1; r++) {
    for (let c = 1; c < cols - 1; c++) {
      const i = r * cols + c;
      const e = elev[i]!;
      if (Number.isNaN(e)) continue;
      const lat = latMin + r * dLat, lng = lngMin + c * dLng;
      if (!pipLatLng(lat, lng, predio)) continue;

      const pendPct = pend[i]! * 100;
      const acumRel = acum[i]! / Math.max(1, acumMax);
      const elevRel = (e - elev_min) / rango;
      let s = 0; const motivos: string[] = [];

      if      (pendPct < 5)  { s += 34; motivos.push('casi plano'); }
      else if (pendPct < 10) { s += 25; motivos.push('pendiente suave'); }
      else if (pendPct < 18) { s += 10; motivos.push('pendiente moderada'); }
      else                    { s -= 15; motivos.push('pendiente alta'); }

      // Orientación al ecuador (más sol): el lado opuesto al ecuador debe estar más alto.
      const eEcuador = elev[(haciaEcuadorEsNorte ? r + 1 : r - 1) * cols + c]!;
      const ePolo    = elev[(haciaEcuadorEsNorte ? r - 1 : r + 1) * cols + c]!;
      if (!Number.isNaN(eEcuador) && !Number.isNaN(ePolo)) {
        const dif = ePolo - eEcuador;   // >0 ⇒ desciende hacia el ecuador ⇒ buena orientación
        if      (dif >  2) { s += 22; motivos.push(haciaEcuadorEsNorte ? 'orientación norte' : 'orientación sur'); }
        else if (dif >  0) { s += 12; motivos.push('buena orientación solar'); }
        else if (dif < -2) { s -= 10; motivos.push('orientación fría'); }
        else               { s +=  8; }
      } else { s += 8; }

      if      (acumRel < 0.06) { s += 20; motivos.push('fuera de drenajes'); }
      else if (acumRel < 0.20) { s += 8; }
      else                      { s -= 22; motivos.push('en zona de escorrentía'); }

      if      (elevRel >= 0.35 && elevRel <= 0.80) { s += 18; motivos.push('posición media-alta'); }
      else if (elevRel > 0.80)                      { s += 4; motivos.push('cima expuesta'); }
      else                                           { s -= 6; motivos.push('fondo de valle (húmedo)'); }

      // Sobre un espolón/loma (algo de ridge) ayuda al drenaje y a las visuales.
      if (ridge[i]! / Math.max(1, ridgeMax) > 0.08) { s += 6; motivos.push('sobre loma bien drenada'); }

      cand.push({ lat, lng, score: Math.max(0, Math.min(100, s)), pendiente_pct: Math.round(pendPct * 10) / 10, motivos });
    }
  }
  cand.sort((x, y) => y.score - x.score);
  const kx = 111320 * Math.cos((latMin + latMax) / 2 * Math.PI / 180), ky = 111320;
  const elegidas: ZonaVivienda[] = [];
  for (const z of cand) {
    if (elegidas.length >= maxN) break;
    if (elegidas.every(e => Math.hypot((z.lng - e.lng) * kx, (z.lat - e.lat) * ky) > sepM)) elegidas.push(z);
  }
  return elegidas;
}

/** Punto de acceso al predio: la celda más baja del contorno (por donde suele entrar el camino). */
function entradaPredio(g: GrillaElevacion, predio: Array<{ lat: number; lng: number }>): { lat: number; lng: number } {
  let best = predio[0]!, bestE = Infinity;
  const n = predio.length;
  for (let i = 0; i < n; i++) {
    const a = predio[i]!, b = predio[(i + 1) % n]!;
    for (let t = 0; t <= 4; t++) {
      const lat = a.lat + (b.lat - a.lat) * (t / 4), lng = a.lng + (b.lng - a.lng) * (t / 4);
      const e = elevEnGrilla(g, lat, lng);
      if (!Number.isNaN(e) && e < bestE) { bestE = e; best = { lat, lng }; }
    }
  }
  // La entrada cae SOBRE el borde: su celda snapeada puede quedar afuera y el
  // camino arrancaría fuera del predio. La empujamos ~3 celdas hacia el centroide.
  const cx = predio.reduce((s, p) => s + p.lng, 0) / n;
  const cy = predio.reduce((s, p) => s + p.lat, 0) / n;
  const cellDeg = Math.max((g.latMax - g.latMin) / (g.rows - 1), (g.lngMax - g.lngMin) / (g.cols - 1));
  const vx = cx - best.lng, vy = cy - best.lat, mag = Math.hypot(vx, vy) || 1;
  const d = Math.min(cellDeg * 3, mag * 0.5);
  return { lat: best.lat + (vy / mag) * d, lng: best.lng + (vx / mag) * d };
}

/**
 * Análisis integral del relieve del predio: en UNA pasada calcula los mejores
 * sitios de represa (por eficiencia), las zonas aptas para vivienda y los caminos
 * de acceso por cresta que las conectan con la entrada. Todo sobre la misma grilla.
 */
export async function analizarTopografiaIntegral(
  mojones: Array<{ lat: number; lng: number }>,
): Promise<AnalisisTopoIntegral | null> {
  if (mojones.length < 3) return null;
  const bbox = conMargen(bboxDeMojones(mojones), 0.12);
  const g = await obtenerGrillaHidro(bbox, resolucionPara(bbox));
  if (!g) return null;

  const a = analizarRelieve(g);
  const represas  = buscarSitiosRepresa(g, { clip: mojones, max: 4 });
  const viviendas = scorearViviendas(a, mojones, 3);
  const entrada   = entradaPredio(g, mojones);

  const caminos: CaminoSugerido[] = [];
  const objetivos: Array<{ nombre: string; pt: { lat: number; lng: number } }> = [];
  if (viviendas[0]) objetivos.push({ nombre: 'Vivienda', pt: { lat: viviendas[0].lat, lng: viviendas[0].lng } });
  if (represas[0])  objetivos.push({ nombre: 'Represa 1', pt: { lat: represas[0].lat, lng: represas[0].lng } });
  for (const o of objetivos) {
    const cam = trazarCaminoRelieve(a, entrada, o.pt, undefined, mojones);
    if (cam) caminos.push({ nombre: `Acceso a ${o.nombre.toLowerCase()}`, destino: o.nombre, camino: cam });
  }

  return { represas, viviendas, caminos, entrada };
}

/**
 * Traza caminos de acceso/servicio desde la entrada del predio hasta cada punto
 * (típicamente bebederos de potreros), por lomas/parteaguas y con poca pendiente.
 * Carga la grilla una sola vez para rutear a todos los destinos.
 */
export async function sugerirCaminosAcceso(
  mojones: Array<{ lat: number; lng: number }>,
  destinos: Array<{ lat: number; lng: number }>,
): Promise<{ entrada: { lat: number; lng: number }; caminos: CaminoRelieve[] } | null> {
  if (mojones.length < 3 || destinos.length === 0) return null;
  const bbox = conMargen(bboxDeMojones(mojones), 0.12);
  const g = await obtenerGrillaHidro(bbox, resolucionPara(bbox));
  if (!g) return null;
  const a = analizarRelieve(g);
  const entrada = entradaPredio(g, mojones);
  const caminos: CaminoRelieve[] = [];
  for (const d of destinos) {
    const cam = trazarCaminoRelieve(a, entrada, d, undefined, mojones);
    if (cam) caminos.push(cam);
  }
  return { entrada, caminos };
}

/**
 * Solo las zonas aptas para vivienda del predio (mismo motor que el análisis
 * integral, pero aislado para activarlo desde Sectores). Comparte la grilla
 * cacheada por Terrarium, así que no recalcula el relieve si ya se computó.
 */
export async function sugerirViviendas(
  mojones: Array<{ lat: number; lng: number }>,
  maxN = 3,
): Promise<ZonaVivienda[] | null> {
  if (mojones.length < 3) return null;
  const bbox = conMargen(bboxDeMojones(mojones), 0.12);
  const g = await obtenerGrillaHidro(bbox, resolucionPara(bbox));
  if (!g) return null;
  const a = analizarRelieve(g);
  return scorearViviendas(a, mojones, maxN);
}
