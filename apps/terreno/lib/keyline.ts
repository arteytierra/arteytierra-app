/**
 * Análisis Keyline (P.A. Yeomans) orientativo desde una grilla densa de elevación.
 *  - analizarKeyline: valle principal por acumulación de flujo + keypoint (rodilla
 *    del perfil) + curvas guía paralelas a la curva por el keypoint.
 *  - generarPatronCultivo: para una parcela, una "línea clave" maestra + un patrón
 *    de líneas paralelas a espaciado fijo (cuasi-a-nivel, manejable) + zonas y
 *    trazados complementarios donde la pendiente cambia de orientación.
 *
 * Aproximación didáctica desde SRTM ~30 m, no un relevamiento de precisión.
 */
import { elevEnGrilla, type GrillaElevacion } from './grillaElevacion';

export interface PuntoKL { lat: number; lng: number; elevation: number }
export interface GuiaKeyline { cota: number; principal: boolean; puntos: Array<{ lat: number; lng: number }> }

export interface ResultadoKeyline {
  keypoint:  PuntoKL;
  valle:     Array<{ lat: number; lng: number }>;
  guias:     GuiaKeyline[];
  pendienteArriba_pct: number;
  pendienteAbajo_pct:  number;
  nota:      string;
}

export interface ResultadoPatron {
  master:       Array<{ lat: number; lng: number }>;
  lineas:       Array<Array<{ lat: number; lng: number }>>;
  orientacion_deg:        number;
  espaciado_m:            number;
  pendiente_media_pct:    number;
  desvio_medio_deg:       number;   // desviación media de las líneas vs las curvas reales
  pendiente_residual_pct: number;   // grade que corre a lo largo de las líneas (proxy de arreglos/mov. de suelo)
  calidad:                'excelente' | 'buena' | 'regular';
  nota:         string;
}

const R = 111_320;
function distM(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const lat = (aLat + bLat) / 2 * Math.PI / 180;
  const dx = (bLng - aLng) * R * Math.cos(lat);
  const dy = (bLat - aLat) * R;
  return Math.hypot(dx, dy);
}

// ─── Extracción de un contorno a una cota fija (marching squares) ──────────────
function contornoNivel(g: GrillaElevacion, z: number): Array<Array<{ lat: number; lng: number }>> {
  const { rows, cols, latMin, latMax, lngMin, lngMax, elev } = g;
  const lat = (r: number) => latMin + (r / (rows - 1)) * (latMax - latMin);
  const lng = (c: number) => lngMin + (c / (cols - 1)) * (lngMax - lngMin);
  const e   = (r: number, c: number) => elev[r * cols + c]!;
  const puntosArista = new Map<string, { lat: number; lng: number }>();
  const segmentos: Array<[string, string]> = [];
  const cruce = (key: string, r1: number, c1: number, r2: number, c2: number) => {
    if (!puntosArista.has(key)) {
      const e1 = e(r1, c1), e2 = e(r2, c2);
      const t = (z - e1) / (e2 - e1);
      puntosArista.set(key, { lat: lat(r1) + t * (lat(r2) - lat(r1)), lng: lng(c1) + t * (lng(c2) - lng(c1)) });
    }
    return key;
  };
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const e00 = e(r, c), e10 = e(r, c + 1), e01 = e(r + 1, c), e11 = e(r + 1, c + 1);
      if (isNaN(e00) || isNaN(e10) || isNaN(e01) || isNaN(e11)) continue;
      const code = (e00 >= z ? 1 : 0) | (e10 >= z ? 2 : 0) | (e11 >= z ? 4 : 0) | (e01 >= z ? 8 : 0);
      if (code === 0 || code === 15) continue;
      const abajo  = () => cruce(`H${r},${c}`,     r, c,     r, c + 1);
      const arriba = () => cruce(`H${r + 1},${c}`, r + 1, c, r + 1, c + 1);
      const izq    = () => cruce(`V${r},${c}`,     r, c,     r + 1, c);
      const der    = () => cruce(`V${r},${c + 1}`, r, c + 1, r + 1, c + 1);
      switch (code) {
        case 1: case 14: segmentos.push([izq(),   abajo()]);  break;
        case 2: case 13: segmentos.push([abajo(), der()]);    break;
        case 3: case 12: segmentos.push([izq(),   der()]);    break;
        case 4: case 11: segmentos.push([der(),   arriba()]); break;
        case 6: case 9:  segmentos.push([abajo(), arriba()]); break;
        case 7: case 8:  segmentos.push([izq(),   arriba()]); break;
        case 5:  segmentos.push([izq(), arriba()]); segmentos.push([abajo(), der()]);    break;
        case 10: segmentos.push([izq(), abajo()]);  segmentos.push([der(), arriba()]);   break;
      }
    }
  }
  if (segmentos.length === 0) return [];
  const ady = new Map<string, string[]>();
  for (const [a, b] of segmentos) {
    (ady.get(a) ?? ady.set(a, []).get(a)!).push(b);
    (ady.get(b) ?? ady.set(b, []).get(b)!).push(a);
  }
  const usado = new Set<string>();
  const lineas: Array<Array<{ lat: number; lng: number }>> = [];
  const caminar = (ini: string) => {
    const cad = [ini]; usado.add(ini); let act = ini;
    for (;;) {
      const sig = (ady.get(act) ?? []).find(v => !usado.has(v));
      if (!sig) break;
      usado.add(sig); cad.push(sig); act = sig;
    }
    return cad;
  };
  for (const [k, v] of ady) { if (!usado.has(k) && v.length === 1) { const cad = caminar(k); if (cad.length >= 2) lineas.push(cad.map(x => puntosArista.get(x)!)); } }
  for (const k of ady.keys()) { if (!usado.has(k)) { const cad = caminar(k); if (cad.length >= 3) lineas.push(cad.map(x => puntosArista.get(x)!)); } }
  return lineas;
}

// ─── Keypoint + curva clave (valle por acumulación de flujo) ───────────────────
export function analizarKeyline(g: GrillaElevacion): ResultadoKeyline | null {
  const { rows, cols, latMin, latMax, lngMin, lngMax, elev, elev_min, elev_max } = g;
  if (rows < 6 || cols < 6 || elev_max - elev_min < 2) return null;

  const lat = (r: number) => latMin + (r / (rows - 1)) * (latMax - latMin);
  const lng = (c: number) => lngMin + (c / (cols - 1)) * (lngMax - lngMin);
  const e   = (r: number, c: number) => elev[r * cols + c]!;
  const idx = (r: number, c: number) => r * cols + c;
  const valido = (r: number, c: number) => r >= 0 && r < rows && c >= 0 && c < cols && !isNaN(e(r, c));

  // 1) Vecino de descenso máximo (D8) por celda
  const down = new Int32Array(rows * cols).fill(-1);
  const celdas: number[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (!valido(r, c)) continue;
    celdas.push(idx(r, c));
    let best = e(r, c), bi = -1;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const rr = r + dr, cc = c + dc;
      if (valido(rr, cc) && e(rr, cc) < best) { best = e(rr, cc); bi = idx(rr, cc); }
    }
    down[idx(r, c)] = bi;
  }
  if (celdas.length < 20) return null;

  // 2) Acumulación de flujo (procesar de mayor a menor elevación)
  const acc = new Float64Array(rows * cols).fill(1);
  const orden = [...celdas].sort((a, b) => elev[b]! - elev[a]!);
  for (const i of orden) { const d = down[i]!; if (d >= 0) acc[d]! += acc[i]!; }

  // 3) Salida = celda con mayor acumulación; trazar valle aguas arriba
  let outlet = orden[orden.length - 1]!;
  for (const i of celdas) if (acc[i]! > acc[outlet]!) outlet = i;

  const valleIdx: number[] = [outlet];
  const visit = new Set<number>([outlet]);
  let cur = outlet;
  for (let step = 0; step < rows * cols; step++) {
    const r = Math.floor(cur / cols), c = cur % cols;
    let up = -1, upAcc = 0;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const rr = r + dr, cc = c + dc;
      if (!valido(rr, cc)) continue;
      const ni = idx(rr, cc);
      if (down[ni] === cur && !visit.has(ni) && acc[ni]! > upAcc) { upAcc = acc[ni]!; up = ni; }
    }
    if (up < 0) break;
    visit.add(up); valleIdx.push(up); cur = up;
  }
  valleIdx.reverse(); // cabecera → salida
  if (valleIdx.length < 4) return null;

  // 4) Perfil y keypoint (rodilla: la pendiente pasa de empinada a suave)
  const path = valleIdx.map(i => ({ r: Math.floor(i / cols), c: i % cols }));
  const n = path.length;
  const dist: number[] = [0]; const elv: number[] = [e(path[0]!.r, path[0]!.c)];
  for (let i = 1; i < n; i++) {
    const a = path[i - 1]!, b = path[i]!;
    dist.push(dist[i - 1]! + distM(lat(a.r), lng(a.c), lat(b.r), lng(b.c)));
    elv.push(e(b.r, b.c));
  }
  const w = Math.max(2, Math.round(n / 8));
  // Suaviza el perfil (media móvil) para no enganchar el keypoint en ruido SRTM.
  const elvS = elv.map((_, i) => {
    let s = 0, k = 0;
    for (let j = Math.max(0, i - w); j <= Math.min(n - 1, i + w); j++) { s += elv[j]!; k++; }
    return s / k;
  });
  const pend = (i: number, dir: 1 | -1) => {
    const j = Math.min(n - 1, Math.max(0, i + dir * w));
    const dd = Math.abs(dist[j]! - dist[i]!);
    return dd > 0 ? (elvS[i]! - elvS[j]!) * dir / dd : 0;
  };
  let kIdx = -1, mejor = -Infinity;
  for (let i = w; i < n - w; i++) {
    const delta = pend(i, -1) - pend(i, 1); // grande = empina arriba y aplana abajo
    if (delta > mejor) { mejor = delta; kIdx = i; }
  }
  // Sin rodilla clara (perfil casi recto o convexo) ⇒ no hay keypoint confiable.
  if (kIdx < 0 || mejor < 0.02) return null;
  const kp = path[kIdx]!;
  const keypoint: PuntoKL = { lat: lat(kp.r), lng: lng(kp.c), elevation: e(kp.r, kp.c) };
  const pArr = Math.max(0, pend(kIdx, -1)) * 100;
  const pAb  = Math.max(0, pend(kIdx, 1)) * 100;

  // 5) Curva por el keypoint + guías paralelas (la más cercana al keypoint)
  const masCerca = (z: number) => {
    let best: Array<{ lat: number; lng: number }> | null = null, bd = Infinity;
    for (const ln of contornoNivel(g, z)) {
      let dmin = Infinity;
      for (const p of ln) { const d = distM(keypoint.lat, keypoint.lng, p.lat, p.lng); if (d < dmin) dmin = d; }
      if (dmin < bd && ln.length >= 2) { bd = dmin; best = ln; }
    }
    return best;
  };
  const guias: GuiaKeyline[] = [];
  for (const off of [0, +2, +4, -2, -4]) {
    const z = keypoint.elevation + off;
    if (z <= elev_min || z >= elev_max) continue;
    const ln = masCerca(z);
    if (ln && ln.length >= 2) guias.push({ cota: Math.round(z * 10) / 10, principal: off === 0, puntos: ln });
  }
  if (guias.length === 0) return null;

  return {
    keypoint,
    valle: path.map(p => ({ lat: lat(p.r), lng: lng(p.c) })),
    guias,
    pendienteArriba_pct: Math.round(pArr * 10) / 10,
    pendienteAbajo_pct:  Math.round(pAb * 10) / 10,
    nota: `Keypoint a ${keypoint.elevation.toFixed(0)} m: la pendiente del valle pasa de ~${pArr.toFixed(0)}% (arriba) a ~${pAb.toFixed(0)}% (abajo). Las keylines se cultivan paralelas a la curva principal. SRTM orientativo.`,
  };
}

// ─── Patrón de cultivo por parcela ────────────────────────────────────────────
type XY = { x: number; y: number };

/** Intersecciones de la recta (p0 + s·dir) con un polígono → valores de s ordenados. */
function cortesRectaPoligono(p0: XY, dir: XY, poly: XY[]): number[] {
  const ss: number[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]!, b = poly[(i + 1) % poly.length]!;
    const ex = b.x - a.x, ey = b.y - a.y;
    const den = dir.x * (-ey) - dir.y * (-ex); // det[[dir.x,-ex],[dir.y,-ey]]
    if (Math.abs(den) < 1e-9) continue;
    const rx = a.x - p0.x, ry = a.y - p0.y;
    const s = (rx * (-ey) - ry * (-ex)) / den;
    const u = (dir.x * ry - dir.y * rx) / den;
    if (u >= 0 && u <= 1) ss.push(s);
  }
  return ss.sort((a, b) => a - b);
}

/** Suavizado de esquinas (Chaikin): redondea el patrón para el paso de máquinas. */
function chaikin(pts: XY[], iters: number): XY[] {
  let p = pts;
  for (let it = 0; it < iters && p.length >= 3; it++) {
    const q: XY[] = [p[0]!];
    for (let i = 0; i + 1 < p.length; i++) {
      const a = p[i]!, b = p[i + 1]!;
      q.push({ x: 0.75 * a.x + 0.25 * b.x, y: 0.75 * a.y + 0.25 * b.y });
      q.push({ x: 0.25 * a.x + 0.75 * b.x, y: 0.25 * a.y + 0.75 * b.y });
    }
    q.push(p[p.length - 1]!);
    p = q;
  }
  return p;
}

/**
 * Patrón de cultivo de una parcela: toma la curva de nivel maestra que pasa por
 * el centroide (que puede ser recta, en V, W, curva…), la suaviza para el paso
 * de máquinas y genera paralelas a espaciado fijo offseteadas ⟂ a las curvas
 * (siguiendo el gradiente local). Un solo patrón coherente que sigue el relieve
 * minimizando el grade residual a lo largo de las líneas. `suavizado` 0–100:
 * 0 = pega a la curva real (más quebrado), 100 = bien redondeado/recto.
 */
export function generarPatronCultivo(
  g: GrillaElevacion,
  parcela: Array<{ lat: number; lng: number }>,
  espaciadoM = 12,
  suavizado = 50,
): ResultadoPatron | null {
  if (parcela.length < 3) return null;
  const { rows, cols, latMin, latMax, lngMin, lngMax, elev } = g;
  const e = (r: number, c: number) => elev[r * cols + c]!;

  // Origen local en el centroide de la parcela
  const lat0 = parcela.reduce((s, p) => s + p.lat, 0) / parcela.length;
  const lng0 = parcela.reduce((s, p) => s + p.lng, 0) / parcela.length;
  const mLng = R * Math.cos(lat0 * Math.PI / 180);
  const toXY = (p: { lat: number; lng: number }): XY => ({ x: (p.lng - lng0) * mLng, y: (p.lat - lat0) * R });
  const toLL = (q: XY) => ({ lat: lat0 + q.y / R, lng: lng0 + q.x / mLng });
  const polyXY = parcela.map(toXY);

  const dentro = (lat: number, lng: number) => {
    let d = false;
    for (let i = 0, j = parcela.length - 1; i < parcela.length; j = i++) {
      const xi = parcela[i]!.lng, yi = parcela[i]!.lat, xj = parcela[j]!.lng, yj = parcela[j]!.lat;
      if (((yi > lat) !== (yj > lat)) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) d = !d;
    }
    return d;
  };

  // Espaciado de la grilla en metros
  const latMid = (latMin + latMax) / 2 * Math.PI / 180;
  const dyM = (latMax - latMin) / (rows - 1) * R;
  const dxM = (lngMax - lngMin) / (cols - 1) * R * Math.cos(latMid);

  // Pendiente media dentro de la parcela (para métricas).
  let sMag = 0, nG = 0;
  for (let r = 1; r < rows - 1; r++) {
    const la = latMin + (r / (rows - 1)) * (latMax - latMin);
    for (let c = 1; c < cols - 1; c++) {
      const lo = lngMin + (c / (cols - 1)) * (lngMax - lngMin);
      if (!dentro(la, lo)) continue;
      const eE = e(r, c + 1), eW = e(r, c - 1), eN = e(r + 1, c), eS = e(r - 1, c);
      if ([eE, eW, eN, eS].some(isNaN)) continue;
      sMag += Math.hypot((eE - eW) / (2 * dxM), (eN - eS) / (2 * dyM)); nG++;
    }
  }
  if (nG < 4) return null;
  const pendMedia = (sMag / nG) * 100;

  const stepLat = (latMax - latMin) / (rows - 1);
  const stepLng = (lngMax - lngMin) / (cols - 1);
  // Gradiente unitario (cuesta arriba) en un punto, en metros este/norte.
  const gradRawEn = (la: number, lo: number): { gx: number; gy: number } | null => {
    const eE = elevEnGrilla(g, la, lo + stepLng), eW = elevEnGrilla(g, la, lo - stepLng);
    const eN = elevEnGrilla(g, la + stepLat, lo), eS = elevEnGrilla(g, la - stepLat, lo);
    if ([eE, eW, eN, eS].some(Number.isNaN)) return null;
    return { gx: (eE - eW) / (2 * dxM), gy: (eN - eS) / (2 * dyM) };
  };
  const gradEn = (la: number, lo: number): XY | null => {
    const r = gradRawEn(la, lo);
    if (!r) return null;
    const m = Math.hypot(r.gx, r.gy);
    return m < 1e-5 ? null : { x: r.gx / m, y: r.gy / m };
  };
  const gradMedio = gradEn(lat0, lng0) ?? { x: 1, y: 0 };

  // Curva de nivel maestra que pasa por el centroide (puede ser recta, V, W, curva…).
  const z0 = elevEnGrilla(g, lat0, lng0);
  if (Number.isNaN(z0)) return null;
  let masterLL: Array<{ lat: number; lng: number }> | null = null;
  { let best = 1;
    for (const ln of contornoNivel(g, z0)) {
      if (ln.length < 2) continue;
      const inside = ln.reduce((s, p) => s + (dentro(p.lat, p.lng) ? 1 : 0), 0);
      if (inside > best) { best = inside; masterLL = ln; }
    }
  }
  // Fallback recto ⟂ al gradiente si no hay curva utilizable.
  if (!masterLL) {
    const cdx = -gradMedio.y, cdy = gradMedio.x;
    const cortes = cortesRectaPoligono({ x: 0, y: 0 }, { x: cdx, y: cdy }, polyXY);
    if (cortes.length < 2) return null;
    masterLL = [toLL({ x: cdx * cortes[0]!, y: cdy * cortes[0]! }), toLL({ x: cdx * cortes[cortes.length - 1]!, y: cdy * cortes[cortes.length - 1]! })];
  }
  // Downsample + suavizado (Chaikin) para el paso de máquinas.
  if (masterLL.length > 50) { const st = Math.ceil(masterLL.length / 50); masterLL = masterLL.filter((_, i) => i % st === 0 || i === masterLL!.length - 1); }
  const iters = 1 + Math.round((suavizado / 100) * 2);   // 1..3
  const masterXY = chaikin(masterLL.map(toXY), iters);

  // Densifica una polilínea y conserva los tramos dentro de la parcela.
  const clip = (ptsLL: Array<{ lat: number; lng: number }>): Array<Array<{ lat: number; lng: number }>> => {
    const step = Math.max(4, Math.min(espaciadoM, 10));
    const dense: Array<{ lat: number; lng: number }> = [];
    for (let i = 0; i + 1 < ptsLL.length; i++) {
      const a = ptsLL[i]!, b = ptsLL[i + 1]!;
      const ns = Math.max(1, Math.ceil(distM(a.lat, a.lng, b.lat, b.lng) / step));
      for (let j = 0; j < ns; j++) { const t = j / ns; dense.push({ lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t }); }
    }
    if (ptsLL.length) dense.push(ptsLL[ptsLL.length - 1]!);
    const out: Array<Array<{ lat: number; lng: number }>> = [];
    let cur: Array<{ lat: number; lng: number }> = [];
    for (const p of dense) {
      if (dentro(p.lat, p.lng)) cur.push(p);
      else { if (cur.length >= 2) out.push(cur); cur = []; }
    }
    if (cur.length >= 2) out.push(cur);
    return out;
  };

  // Offsets ⟂ a las curvas: cada vértice de la maestra corrido k·espaciado por
  // su gradiente local (cuesta arriba/abajo), cubriendo toda la parcela.
  let maxDim = 0;
  for (let i = 0; i < polyXY.length; i++) for (let j = i + 1; j < polyXY.length; j++) {
    const d = Math.hypot(polyXY[j]!.x - polyXY[i]!.x, polyXY[j]!.y - polyXY[i]!.y);
    if (d > maxDim) maxDim = d;
  }
  const K = Math.min(300, Math.ceil(maxDim / espaciadoM) + 1);

  const lineas: Array<Array<{ lat: number; lng: number }>> = [];
  let master: Array<{ lat: number; lng: number }> = [];
  for (let k = -K; k <= K; k++) {
    const offLL = masterXY.map(v => {
      const ll = toLL(v);
      const dir = gradEn(ll.lat, ll.lng) ?? gradMedio;
      return toLL({ x: v.x + k * espaciadoM * dir.x, y: v.y + k * espaciadoM * dir.y });
    });
    const segs = clip(offLL);
    if (k === 0) for (const s of segs) if (s.length > master.length) master = s;
    for (const s of segs) lineas.push(s);
  }
  if (lineas.length === 0) return null;

  // Pendiente residual = grade a lo largo de las líneas (componente del gradiente
  // en la dirección de cada tramo). 0 = corren exactamente a nivel.
  let resSum = 0, resN = 0;
  for (const seg of lineas) {
    for (let i = 0; i + 1 < seg.length; i++) {
      const a = toXY(seg[i]!), b = toXY(seg[i + 1]!);
      const ex = b.x - a.x, ey = b.y - a.y;
      const len = Math.hypot(ex, ey);
      if (len < 0.5) continue;
      const gr = gradRawEn((seg[i]!.lat + seg[i + 1]!.lat) / 2, (seg[i]!.lng + seg[i + 1]!.lng) / 2);
      if (!gr) continue;
      resSum += Math.abs((gr.gx * ex + gr.gy * ey) / len); resN++;
    }
  }
  const residualPct = resN > 0 ? (resSum / resN) * 100 : 0;
  const slopeFrac = pendMedia / 100;
  const desvioDeg = slopeFrac > 1e-4 ? Math.asin(Math.min(1, (residualPct / 100) / slopeFrac)) * 180 / Math.PI : 0;
  const calidad: ResultadoPatron['calidad'] = residualPct < 0.5 ? 'excelente' : residualPct < 1.5 ? 'buena' : 'regular';

  // Orientación general de la maestra.
  const a0 = masterXY[0]!, a1 = masterXY[masterXY.length - 1]!;
  const orientacion = ((Math.atan2(a1.y - a0.y, a1.x - a0.x) * 180 / Math.PI) % 180 + 180) % 180;

  return {
    master, lineas,
    orientacion_deg: Math.round(orientacion),
    espaciado_m: espaciadoM,
    pendiente_media_pct: Math.round(pendMedia * 10) / 10,
    desvio_medio_deg: Math.round(desvioDeg * 10) / 10,
    pendiente_residual_pct: Math.round(residualPct * 100) / 100,
    calidad,
    nota: `Patrón de ${lineas.length} líneas que siguen la curva maestra (suavizado ${suavizado}%) a ${espaciadoM} m. Encaje ${calidad}: corren con ~${residualPct.toFixed(2)}% de pendiente residual. Menos residual = menos arreglos y menos movimiento de suelo. SRTM orientativo.`,
  };
}
