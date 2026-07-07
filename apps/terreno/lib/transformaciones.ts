/**
 * Transformaciones geométricas tipo CAD sobre elementos de dibujo.
 * Operan en metros locales (proyección equirectangular alrededor de un punto de
 * referencia) para que escalas, rotaciones y desfases sean métricamente correctos.
 */

import type { ElementoDibujo } from './dibujos';

const M_LAT = 111_320;
const mLng = (lat: number) => 111_320 * Math.cos((lat * Math.PI) / 180);

interface Local { x: number; y: number }
type LL = { lat: number; lng: number };

function toLocal(v: LL, o: LL): Local {
  return { x: (v.lng - o.lng) * mLng(o.lat), y: (v.lat - o.lat) * M_LAT };
}
function toGeo(p: Local, o: LL): LL {
  return { lat: o.lat + p.y / M_LAT, lng: o.lng + p.x / mLng(o.lat) };
}

/** Centroide geográfico de un elemento de dibujo. */
export function centroideDibujo(d: ElementoDibujo): LL {
  if (d.tipo === 'circulo' || d.tipo === 'texto' || d.tipo === 'punto') return { lat: d.lat, lng: d.lng };
  const vs = d.vertices;
  return {
    lat: vs.reduce((s, v) => s + v.lat, 0) / vs.length,
    lng: vs.reduce((s, v) => s + v.lng, 0) / vs.length,
  };
}

function clonarConNuevoId(d: ElementoDibujo): ElementoDibujo {
  return { ...structuredClone(d), id: crypto.randomUUID() };
}

// ─── Escalar ──────────────────────────────────────────────────────────────────

export function escalarDibujo(d: ElementoDibujo, factor: number): ElementoDibujo {
  if (!Number.isFinite(factor) || factor <= 0) return d;
  if (d.tipo === 'circulo') return { ...d, radio: Math.max(d.radio * factor, 0.1) };
  if (d.tipo === 'texto')   return { ...d, tamano: Math.max(6, Math.round(d.tamano * factor)) };
  if (d.tipo === 'punto')   return d;
  const c = centroideDibujo(d);
  return { ...d, vertices: d.vertices.map(v => {
    const p = toLocal(v, c);
    return toGeo({ x: p.x * factor, y: p.y * factor }, c);
  }) };
}

// ─── Rotar (grados antihorarios) ──────────────────────────────────────────────

export function rotarDibujo(d: ElementoDibujo, grados: number): ElementoDibujo {
  if (d.tipo === 'circulo' || d.tipo === 'texto' || d.tipo === 'punto') return d;
  const c = centroideDibujo(d);
  const rad = (grados * Math.PI) / 180;
  const cos = Math.cos(rad), sin = Math.sin(rad);
  return { ...d, vertices: d.vertices.map(v => {
    const p = toLocal(v, c);
    return toGeo({ x: p.x * cos - p.y * sin, y: p.x * sin + p.y * cos }, c);
  }) };
}

// ─── Espejo / simetría ────────────────────────────────────────────────────────

/** eje 'vertical' = línea N–S (refleja Este↔Oeste); 'horizontal' = línea E–O (refleja N↔S). */
export function espejarDibujo(d: ElementoDibujo, eje: 'vertical' | 'horizontal'): ElementoDibujo {
  if (d.tipo === 'circulo' || d.tipo === 'texto' || d.tipo === 'punto') return d;
  const c = centroideDibujo(d);
  return { ...d, vertices: d.vertices.map(v => {
    const p = toLocal(v, c);
    const q = eje === 'vertical' ? { x: -p.x, y: p.y } : { x: p.x, y: -p.y };
    return toGeo(q, c);
  }) };
}

// ─── Desfase / offset ─────────────────────────────────────────────────────────

function offsetPolilinea(pts: Local[], dist: number, cerrada: boolean): Local[] {
  const n = pts.length;
  if (n < 2) return pts;
  const normal = (a: Local, b: Local): Local => {
    const dx = b.x - a.x, dy = b.y - a.y; const len = Math.hypot(dx, dy) || 1;
    return { x: -dy / len, y: dx / len }; // normal izquierda
  };
  const out: Local[] = [];
  for (let i = 0; i < n; i++) {
    const prev = pts[(i - 1 + n) % n]!, cur = pts[i]!, next = pts[(i + 1) % n]!;
    const hasIn  = cerrada || i > 0;
    const hasOut = cerrada || i < n - 1;
    let nx = 0, ny = 0;
    const inN = hasIn ? normal(prev, cur) : null;
    if (inN)  { nx += inN.x; ny += inN.y; }
    if (hasOut) { const o = normal(cur, next); nx += o.x; ny += o.y; }
    const len = Math.hypot(nx, ny) || 1;
    nx /= len; ny /= len;
    let scale = 1;
    if (inN && hasOut) {
      const dot = nx * inN.x + ny * inN.y;          // = cos(θ/2)
      scale = dot > 0.2 ? 1 / dot : 5;              // miter, acotado
      scale = Math.min(scale, 5);
    }
    out.push({ x: cur.x + nx * dist * scale, y: cur.y + ny * dist * scale });
  }
  return out;
}

export function desfasarDibujo(d: ElementoDibujo, distM: number): ElementoDibujo {
  if (d.tipo === 'circulo') return { ...d, radio: Math.max(d.radio + distM, 0.1) };
  if (d.tipo === 'texto' || d.tipo === 'cota' || d.tipo === 'punto') return d;
  const c = centroideDibujo(d);
  const loc = d.vertices.map(v => toLocal(v, c));
  const off = offsetPolilinea(loc, distM, d.tipo === 'poligono');
  return { ...d, vertices: off.map(p => toGeo(p, c)) };
}

// ─── Traslación / matriz ──────────────────────────────────────────────────────

function trasladarMetros(d: ElementoDibujo, dxEste: number, dyNorte: number): ElementoDibujo {
  const c = centroideDibujo(d);
  const dLat = dyNorte / M_LAT;
  const dLng = dxEste / mLng(c.lat);
  const nd = clonarConNuevoId(d);
  if (nd.tipo === 'circulo' || nd.tipo === 'texto' || nd.tipo === 'punto') { nd.lat += dLat; nd.lng += dLng; return nd; }
  nd.vertices = nd.vertices.map(v => ({ lat: v.lat + dLat, lng: v.lng + dLng }));
  return nd;
}

/** Matriz rectangular: filas × columnas con paso en metros. No incluye el original. */
export function matrizRect(
  d: ElementoDibujo, filas: number, cols: number, pasoXm: number, pasoYm: number,
): ElementoDibujo[] {
  const res: ElementoDibujo[] = [];
  const F = Math.max(1, Math.floor(filas)), C = Math.max(1, Math.floor(cols));
  for (let r = 0; r < F; r++) for (let c = 0; c < C; c++) {
    if (r === 0 && c === 0) continue;
    res.push(trasladarMetros(d, c * pasoXm, r * pasoYm));
  }
  return res;
}

function rotarAlrededor(d: ElementoDibujo, grados: number, centro: LL): ElementoDibujo {
  const nd = clonarConNuevoId(d);
  const rad = (grados * Math.PI) / 180;
  const cos = Math.cos(rad), sin = Math.sin(rad);
  const rot = (v: LL): LL => {
    const p = toLocal(v, centro);
    return toGeo({ x: p.x * cos - p.y * sin, y: p.x * sin + p.y * cos }, centro);
  };
  if (nd.tipo === 'circulo' || nd.tipo === 'texto' || nd.tipo === 'punto') { const q = rot(nd); nd.lat = q.lat; nd.lng = q.lng; return nd; }
  nd.vertices = nd.vertices.map(rot);
  return nd;
}

/** Matriz polar alrededor de un centro. No incluye el original. */
export function matrizPolar(
  d: ElementoDibujo, cantidad: number, anguloTotal: number, centro: LL,
): ElementoDibujo[] {
  const N = Math.max(2, Math.floor(cantidad));
  const completa = Math.abs(anguloTotal) >= 359.9;
  const paso = completa ? anguloTotal / N : anguloTotal / (N - 1);
  const res: ElementoDibujo[] = [];
  for (let k = 1; k < N; k++) res.push(rotarAlrededor(d, k * paso, centro));
  return res;
}

// ─── Fillet (redondear) y Chamfer (achaflanar) ─────────────────────────────────

function vsub(a: Local, b: Local): Local { return { x: a.x - b.x, y: a.y - b.y }; }
function vnorm(a: Local): Local { const m = Math.hypot(a.x, a.y) || 1; return { x: a.x / m, y: a.y / m }; }

function esquinasPolilinea(
  pts: Local[], cerrada: boolean,
  fabricar: (A: Local, B: Local, C: Local) => Local[] | null,
): Local[] {
  const n = pts.length;
  if (n < 3) return pts;
  const out: Local[] = [];
  for (let i = 0; i < n; i++) {
    const esEsquina = cerrada || (i > 0 && i < n - 1);
    if (!esEsquina) { out.push(pts[i]!); continue; }
    const A = pts[(i - 1 + n) % n]!, B = pts[i]!, C = pts[(i + 1) % n]!;
    const reemplazo = fabricar(A, B, C);
    if (reemplazo) out.push(...reemplazo); else out.push(B);
  }
  return out;
}

function filletPolilinea(pts: Local[], radio: number, cerrada: boolean): Local[] {
  return esquinasPolilinea(pts, cerrada, (A, B, C) => {
    const u = vnorm(vsub(A, B)), w = vnorm(vsub(C, B));
    const cosang = Math.max(-1, Math.min(1, u.x * w.x + u.y * w.y));
    const ang = Math.acos(cosang);
    if (ang < 0.05 || ang > Math.PI - 0.05) return null; // casi recto/colineal
    const lAB = Math.hypot(A.x - B.x, A.y - B.y), lBC = Math.hypot(C.x - B.x, C.y - B.y);
    let t = radio / Math.tan(ang / 2);
    t = Math.min(t, 0.49 * Math.min(lAB, lBC));
    const r = t * Math.tan(ang / 2);
    const P1 = { x: B.x + u.x * t, y: B.y + u.y * t };
    const P2 = { x: B.x + w.x * t, y: B.y + w.y * t };
    const bis = vnorm({ x: u.x + w.x, y: u.y + w.y });
    const dCent = r / Math.sin(ang / 2);
    const O = { x: B.x + bis.x * dCent, y: B.y + bis.y * dCent };
    let a1 = Math.atan2(P1.y - O.y, P1.x - O.x);
    let a2 = Math.atan2(P2.y - O.y, P2.x - O.x);
    let dA = a2 - a1;
    while (dA > Math.PI) dA -= 2 * Math.PI;
    while (dA < -Math.PI) dA += 2 * Math.PI;
    const N = Math.max(2, Math.round(Math.abs(dA) / (Math.PI / 12)));
    const arc: Local[] = [];
    for (let k = 0; k <= N; k++) {
      const a = a1 + (dA * k) / N;
      arc.push({ x: O.x + r * Math.cos(a), y: O.y + r * Math.sin(a) });
    }
    return arc;
  });
}

function chamferPolilinea(pts: Local[], dist: number, cerrada: boolean): Local[] {
  return esquinasPolilinea(pts, cerrada, (A, B, C) => {
    const u = vnorm(vsub(A, B)), w = vnorm(vsub(C, B));
    const lAB = Math.hypot(A.x - B.x, A.y - B.y), lBC = Math.hypot(C.x - B.x, C.y - B.y);
    const t = Math.min(dist, 0.49 * Math.min(lAB, lBC));
    return [
      { x: B.x + u.x * t, y: B.y + u.y * t },
      { x: B.x + w.x * t, y: B.y + w.y * t },
    ];
  });
}

export function filletDibujo(d: ElementoDibujo, radioM: number): ElementoDibujo {
  if ((d.tipo !== 'poligono' && d.tipo !== 'linea' && d.tipo !== 'curva') || radioM <= 0) return d;
  const c = centroideDibujo(d);
  const loc = d.vertices.map(v => toLocal(v, c));
  return { ...d, vertices: filletPolilinea(loc, radioM, d.tipo === 'poligono').map(p => toGeo(p, c)) };
}

export function chamferDibujo(d: ElementoDibujo, distM: number): ElementoDibujo {
  if ((d.tipo !== 'poligono' && d.tipo !== 'linea' && d.tipo !== 'curva') || distM <= 0) return d;
  const c = centroideDibujo(d);
  const loc = d.vertices.map(v => toLocal(v, c));
  return { ...d, vertices: chamferPolilinea(loc, distM, d.tipo === 'poligono').map(p => toGeo(p, c)) };
}

// ─── Dispatcher ────────────────────────────────────────────────────────────────

export type TransformarOp =
  | { op: 'escala';      factor: number }
  | { op: 'rotar';       grados: number }
  | { op: 'espejo';      eje: 'vertical' | 'horizontal' }
  | { op: 'desfase';     distM: number }
  | { op: 'fillet';      radio: number }
  | { op: 'chamfer';     dist: number }
  | { op: 'matrizRect';  filas: number; cols: number; pasoX: number; pasoY: number }
  | { op: 'matrizPolar'; cantidad: number; anguloTotal: number };

export interface ResultadoTransformacion {
  reemplazo?: ElementoDibujo;     // modifica el elemento en su lugar
  nuevos?:    ElementoDibujo[];   // agrega clones (matrices)
}

/** Aplica una transformación a un elemento. `centro` se usa para matriz polar. */
export function aplicarTransformacion(
  d: ElementoDibujo, op: TransformarOp, centro: LL,
): ResultadoTransformacion {
  switch (op.op) {
    case 'escala':      return { reemplazo: escalarDibujo(d, op.factor) };
    case 'rotar':       return { reemplazo: rotarDibujo(d, op.grados) };
    case 'espejo':      return { reemplazo: espejarDibujo(d, op.eje) };
    case 'desfase':     return { reemplazo: desfasarDibujo(d, op.distM) };
    case 'fillet':      return { reemplazo: filletDibujo(d, op.radio) };
    case 'chamfer':     return { reemplazo: chamferDibujo(d, op.dist) };
    case 'matrizRect':  return { nuevos: matrizRect(d, op.filas, op.cols, op.pasoX, op.pasoY) };
    case 'matrizPolar': return { nuevos: matrizPolar(d, op.cantidad, op.anguloTotal, centro) };
  }
}
