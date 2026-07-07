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
import type { GrillaElevacion } from './grillaElevacion';

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
  zonasFuera:   Array<Array<{ lat: number; lng: number }>>;
  lineasFuera:  Array<Array<{ lat: number; lng: number }>>;
  orientacion_deg:     number;
  espaciado_m:         number;
  pendiente_media_pct: number;
  cobertura_pct:       number;
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
  const w = Math.max(1, Math.round(n / 10));
  const pend = (i: number, dir: 1 | -1) => {
    const j = Math.min(n - 1, Math.max(0, i + dir * w));
    const dd = Math.abs(dist[j]! - dist[i]!);
    return dd > 0 ? (elv[i]! - elv[j]!) * dir / dd : 0;
  };
  let kIdx = Math.round(n * 0.55), mejor = -Infinity;
  for (let i = w; i < n - w; i++) {
    const delta = pend(i, -1) - pend(i, 1); // grande = se aplana hacia abajo
    if (delta > mejor) { mejor = delta; kIdx = i; }
  }
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

/**
 * Genera el patrón de cultivo de una parcela: línea clave maestra + paralelas a
 * espaciado fijo, alineadas a la curva de nivel media; más zonas/trazados
 * complementarios donde la orientación de la pendiente difiere mucho.
 */
export function generarPatronCultivo(
  g: GrillaElevacion,
  parcela: Array<{ lat: number; lng: number }>,
  espaciadoM = 12,
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

  // Gradientes de las celdas dentro de la parcela
  const grad: Array<{ p: XY; gx: number; gy: number }> = [];
  let sgx = 0, sgy = 0, sMag = 0, nG = 0;
  for (let r = 1; r < rows - 1; r++) {
    const la = latMin + (r / (rows - 1)) * (latMax - latMin);
    for (let c = 1; c < cols - 1; c++) {
      const lo = lngMin + (c / (cols - 1)) * (lngMax - lngMin);
      if (!dentro(la, lo)) continue;
      const eC = e(r, c), eE = e(r, c + 1), eW = e(r, c - 1), eN = e(r + 1, c), eS = e(r - 1, c);
      if ([eC, eE, eW, eN, eS].some(isNaN)) continue;
      const gx = (eE - eW) / (2 * dxM);     // ∂z/∂x (este+)
      const gy = (eN - eS) / (2 * dyM);     // ∂z/∂y (norte+)
      grad.push({ p: toXY({ lat: la, lng: lo }), gx, gy });
      sgx += gx; sgy += gy; sMag += Math.hypot(gx, gy); nG++;
    }
  }
  if (nG < 4) return null;

  const mgx = sgx / nG, mgy = sgy / nG;
  const pendMedia = (sMag / nG) * 100;
  let mag = Math.hypot(mgx, mgy);
  // Dirección de contorno = perpendicular al gradiente medio
  let cdx: number, cdy: number;
  if (mag < 1e-4) { cdx = 1; cdy = 0; mag = 1e-4; } else { cdx = -mgy / mag; cdy = mgx / mag; }
  const gux = mgx / mag, guy = mgy / mag;     // gradiente unitario (cuesta arriba)
  const orientacion = ((Math.atan2(cdy, cdx) * 180 / Math.PI) % 180 + 180) % 180;

  // Rango de offset a lo largo del gradiente, recorriendo la parcela
  const ts = polyXY.map(q => q.x * gux + q.y * guy);
  const tmin = Math.min(...ts), tmax = Math.max(...ts);

  const generar = (cx: number, cy: number, ux: number, uy: number, t0: number, t1: number, filtro?: (m: XY) => boolean) => {
    const out: Array<Array<{ lat: number; lng: number }>> = [];
    for (let t = Math.ceil(t0 / espaciadoM) * espaciadoM; t <= t1; t += espaciadoM) {
      const p0: XY = { x: ux * t, y: uy * t };
      const dir: XY = { x: cx, y: cy };
      const cortes = cortesRectaPoligono(p0, dir, polyXY);
      for (let k = 0; k + 1 < cortes.length; k += 2) {
        const sA = cortes[k]!, sB = cortes[k + 1]!;
        const a: XY = { x: p0.x + dir.x * sA, y: p0.y + dir.y * sA };
        const b: XY = { x: p0.x + dir.x * sB, y: p0.y + dir.y * sB };
        if (filtro && !filtro({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })) continue;
        if (Math.hypot(b.x - a.x, b.y - a.y) < espaciadoM * 0.3) continue;
        out.push([toLL(a), toLL(b)]);
      }
    }
    return out;
  };

  const lineas = generar(cdx, cdy, gux, guy, tmin, tmax);

  // Línea clave maestra = la paralela que pasa por el centroide (offset 0)
  const masterCortes = cortesRectaPoligono({ x: 0, y: 0 }, { x: cdx, y: cdy }, polyXY);
  const master = masterCortes.length >= 2
    ? [toLL({ x: cdx * masterCortes[0]!, y: cdy * masterCortes[0]! }), toLL({ x: cdx * masterCortes[masterCortes.length - 1]!, y: cdy * masterCortes[masterCortes.length - 1]! })]
    : (lineas[Math.floor(lineas.length / 2)] ?? []);

  // Zonas con orientación de pendiente muy distinta → trazado complementario
  const desviadas = grad.filter(gc => {
    const m = Math.hypot(gc.gx, gc.gy);
    if (m < 1e-4) return false;
    const dot = Math.abs((-gc.gy / m) * cdx + (gc.gx / m) * cdy); // |contorno_local · contorno_master|
    return dot < Math.cos(35 * Math.PI / 180); // > 35° de diferencia
  });

  const zonasFuera: Array<Array<{ lat: number; lng: number }>> = [];
  const lineasFuera: Array<Array<{ lat: number; lng: number }>> = [];
  const cobertura = Math.round((1 - desviadas.length / nG) * 100);

  if (desviadas.length >= 6 && desviadas.length / nG > 0.12) {
    const xs = desviadas.map(d => d.p.x), ys = desviadas.map(d => d.p.y);
    const minx = Math.min(...xs), maxx = Math.max(...xs), miny = Math.min(...ys), maxy = Math.max(...ys);
    const rect: XY[] = [{ x: minx, y: miny }, { x: maxx, y: miny }, { x: maxx, y: maxy }, { x: minx, y: maxy }];
    zonasFuera.push(rect.map(toLL));
    // Orientación local de la zona desviada
    let dgx = 0, dgy = 0;
    desviadas.forEach(d => { dgx += d.gx; dgy += d.gy; });
    const dm = Math.hypot(dgx, dgy) || 1e-4;
    const ccx = -dgy / dm, ccy = dgx / dm, dux = dgx / dm, duy = dgy / dm;
    const tts = rect.map(q => q.x * dux + q.y * duy);
    const enRect = (m: XY) => m.x >= minx && m.x <= maxx && m.y >= miny && m.y <= maxy;
    lineasFuera.push(...generar(ccx, ccy, dux, duy, Math.min(...tts), Math.max(...tts), enRect));
  }

  return {
    master, lineas, zonasFuera, lineasFuera,
    orientacion_deg: Math.round(orientacion),
    espaciado_m: espaciadoM,
    pendiente_media_pct: Math.round(pendMedia * 10) / 10,
    cobertura_pct: Math.max(0, Math.min(100, cobertura)),
    nota: `Patrón a ${espaciadoM} m, orientado ${Math.round(orientacion)}° (paralelo a la curva media, pendiente ~${pendMedia.toFixed(1)}%). ${zonasFuera.length ? 'Se marcó una zona con pendiente de otra orientación + trazado complementario.' : 'Cobertura uniforme en toda la parcela.'} SRTM orientativo.`,
  };
}
