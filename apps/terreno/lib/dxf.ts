/**
 * Interoperabilidad DXF (AutoCAD). Writer y parser propios, sin dependencias.
 *
 * Las coordenadas DXF son cartesianas en metros (X = Este, Y = Norte), con origen
 * en un punto de referencia geográfico (centroide del predio) que se embebe como
 * comentario 999 para poder reimportar con la misma georreferencia.
 *
 * Soporta: LWPOLYLINE, POLYLINE/VERTEX, LINE, CIRCLE, TEXT, POINT.
 */

import type { ElementoDibujo } from './dibujos';
import type { Mojon } from './types';

const M_LAT = 111_320;
const mLng = (lat: number) => 111_320 * Math.cos((lat * Math.PI) / 180);
type LL = { lat: number; lng: number };

function toXY(v: LL, o: LL): { x: number; y: number } {
  return { x: (v.lng - o.lng) * mLng(o.lat), y: (v.lat - o.lat) * M_LAT };
}
function toLL(x: number, y: number, o: LL): LL {
  return { lat: o.lat + y / M_LAT, lng: o.lng + x / mLng(o.lat) };
}

// ─── Export ─────────────────────────────────────────────────────────────────

/** Capas geográficas extra para exportar (zonas, sectores, caminos, cotas). */
export interface DXFExtras {
  zonas?:    Array<{ vertices: LL[]; nombre?: string }>;
  sectores?: Array<{ vertices: LL[]; nombre?: string }>;
  caminos?:  Array<{ vertices: LL[]; nombre?: string }>;
  /** Cotas de lindero: se exportan como TEXT (longitud) en la capa COTAS. */
  linderos?: Array<{ a: LL; b: LL; longitud: number }>;
}

export function exportarDXF(dibujos: ElementoDibujo[], mojones: Mojon[], origen: LL, extras?: DXFExtras): string {
  const out: string[] = [];
  const p = (code: number, val: string | number) => { out.push(String(code)); out.push(String(val)); };

  // Comentario con la georreferencia (para reimportar)
  out.push('999'); out.push(`AYT_ORIGEN ${origen.lat.toFixed(8)} ${origen.lng.toFixed(8)}`);

  // Header mínimo (unidades = metros)
  p(0, 'SECTION'); p(2, 'HEADER');
  p(9, '$ACADVER'); p(1, 'AC1015');
  p(9, '$INSUNITS'); p(70, 6);
  p(0, 'ENDSEC');

  p(0, 'SECTION'); p(2, 'ENTITIES');

  const lwpolyline = (verts: LL[], cerrada: boolean, capa: string) => {
    if (verts.length < 2) return;
    p(0, 'LWPOLYLINE'); p(8, capa); p(90, verts.length); p(70, cerrada ? 1 : 0);
    for (const v of verts) { const q = toXY(v, origen); p(10, q.x.toFixed(4)); p(20, q.y.toFixed(4)); }
  };
  const texto = (v: LL, txt: string, alto: number, capa: string) => {
    const q = toXY(v, origen);
    p(0, 'TEXT'); p(8, capa); p(10, q.x.toFixed(4)); p(20, q.y.toFixed(4)); p(40, alto.toFixed(2)); p(1, txt);
  };

  // Predio
  if (mojones.length >= 2) lwpolyline(mojones, mojones.length >= 3, 'PREDIO');

  // Capas geográficas (cada tipo en su capa DXF)
  for (const z of extras?.zonas    ?? []) lwpolyline(z.vertices, true,  'ZONAS');
  for (const s of extras?.sectores ?? []) lwpolyline(s.vertices, true,  'SECTORES');
  for (const c of extras?.caminos  ?? []) lwpolyline(c.vertices, false, 'CAMINOS');
  // Cotas de lindero → texto con la longitud en el punto medio
  for (const l of extras?.linderos ?? []) {
    const mid = { lat: (l.a.lat + l.b.lat) / 2, lng: (l.a.lng + l.b.lng) / 2 };
    texto(mid, `${l.longitud.toFixed(1)} m`, 4, 'COTAS');
  }

  // Dibujos
  for (const d of dibujos) {
    const capa = (d.nombre || 'DIBUJOS').replace(/[^\w-]/g, '_').slice(0, 31) || 'DIBUJOS';
    if (d.tipo === 'linea' || d.tipo === 'curva') lwpolyline(d.vertices, false, capa);
    else if (d.tipo === 'poligono') lwpolyline(d.vertices, true, capa);
    else if (d.tipo === 'flecha') lwpolyline(d.vertices, false, capa);
    else if (d.tipo === 'cota') {
      const [a, b] = d.vertices;
      if (a && b) {
        const qa = toXY(a, origen), qb = toXY(b, origen);
        p(0, 'LINE'); p(8, capa); p(10, qa.x.toFixed(4)); p(20, qa.y.toFixed(4)); p(11, qb.x.toFixed(4)); p(21, qb.y.toFixed(4));
      }
    } else if (d.tipo === 'circulo') {
      const c = toXY(d, origen);
      p(0, 'CIRCLE'); p(8, capa); p(10, c.x.toFixed(4)); p(20, c.y.toFixed(4)); p(40, d.radio.toFixed(4));
    } else if (d.tipo === 'texto') {
      const c = toXY(d, origen);
      p(0, 'TEXT'); p(8, capa); p(10, c.x.toFixed(4)); p(20, c.y.toFixed(4)); p(40, Math.max(d.tamano / 4, 1).toFixed(2)); p(1, d.texto);
    } else if (d.tipo === 'punto') {
      const c = toXY(d, origen);
      p(0, 'POINT'); p(8, capa); p(10, c.x.toFixed(4)); p(20, c.y.toFixed(4));
    }
  }

  p(0, 'ENDSEC');
  p(0, 'EOF');
  return out.join('\r\n');
}

// ─── Import ─────────────────────────────────────────────────────────────────

type Par = [number, string];

function parsePares(texto: string): Par[] {
  const lineas = texto.split(/\r\n|\r|\n/);
  const pares: Par[] = [];
  for (let i = 0; i + 1 < lineas.length; i += 2) {
    const code = parseInt((lineas[i] ?? '').trim(), 10);
    if (Number.isNaN(code)) { i -= 1; continue; } // resincronizar ante líneas sueltas
    pares.push([code, (lineas[i + 1] ?? '').trim()]);
  }
  return pares;
}

interface Bloque { nombre: string; pares: Par[] }

/** Parsea un DXF a elementos de dibujo, georreferenciados con `origenFallback`. */
export function parsearDXF(texto: string, origenFallback: LL, color: string, capaId: string): ElementoDibujo[] {
  // Origen embebido (999) si existe
  let origen = origenFallback;
  const m999 = texto.match(/AYT_ORIGEN\s+(-?\d+\.\d+)\s+(-?\d+\.\d+)/);
  if (m999) origen = { lat: parseFloat(m999[1]!), lng: parseFloat(m999[2]!) };

  const pares = parsePares(texto);

  // Acotar a la sección ENTITIES
  let ini = -1, fin = pares.length;
  for (let i = 0; i < pares.length - 1; i++) {
    if (pares[i]![0] === 2 && pares[i]![1] === 'ENTITIES') { ini = i + 1; break; }
  }
  if (ini < 0) return [];
  for (let i = ini; i < pares.length; i++) {
    if (pares[i]![0] === 0 && pares[i]![1] === 'ENDSEC') { fin = i; break; }
  }

  // Dividir en bloques por code 0
  const bloques: Bloque[] = [];
  let actual: Bloque | null = null;
  for (let i = ini; i < fin; i++) {
    const [code, val] = pares[i]!;
    if (code === 0) { actual = { nombre: val, pares: [] }; bloques.push(actual); }
    else if (actual) actual.pares.push([code, val]);
  }

  const get = (b: Bloque, code: number) => b.pares.find(pr => pr[0] === code)?.[1];
  const getAll = (b: Bloque, code: number) => b.pares.filter(pr => pr[0] === code).map(pr => parseFloat(pr[1]));

  const res: ElementoDibujo[] = [];
  const nuevoId = () => crypto.randomUUID();

  for (let i = 0; i < bloques.length; i++) {
    const b = bloques[i]!;
    if (b.nombre === 'LWPOLYLINE') {
      const xs = getAll(b, 10), ys = getAll(b, 20);
      const cerrada = (parseInt(get(b, 70) ?? '0', 10) & 1) === 1;
      const verts = xs.map((x, k) => toLL(x, ys[k] ?? 0, origen));
      if (verts.length >= 2) res.push(cerrada
        ? { id: nuevoId(), tipo: 'poligono', color, vertices: verts, opacidad: 0.22, capaId }
        : { id: nuevoId(), tipo: 'linea', color, vertices: verts, grosor: 3, capaId });
    } else if (b.nombre === 'POLYLINE') {
      const cerrada = (parseInt(get(b, 70) ?? '0', 10) & 1) === 1;
      const verts: LL[] = [];
      let j = i + 1;
      for (; j < bloques.length; j++) {
        const vb = bloques[j]!;
        if (vb.nombre === 'VERTEX') {
          const x = parseFloat(get(vb, 10) ?? 'NaN'), y = parseFloat(get(vb, 20) ?? 'NaN');
          if (!Number.isNaN(x) && !Number.isNaN(y)) verts.push(toLL(x, y, origen));
        } else break;
      }
      i = j - 1;
      if (verts.length >= 2) res.push(cerrada
        ? { id: nuevoId(), tipo: 'poligono', color, vertices: verts, opacidad: 0.22, capaId }
        : { id: nuevoId(), tipo: 'linea', color, vertices: verts, grosor: 3, capaId });
    } else if (b.nombre === 'LINE') {
      const x1 = parseFloat(get(b, 10) ?? 'NaN'), y1 = parseFloat(get(b, 20) ?? 'NaN');
      const x2 = parseFloat(get(b, 11) ?? 'NaN'), y2 = parseFloat(get(b, 21) ?? 'NaN');
      if (![x1, y1, x2, y2].some(Number.isNaN)) {
        res.push({ id: nuevoId(), tipo: 'linea', color, vertices: [toLL(x1, y1, origen), toLL(x2, y2, origen)], grosor: 3, capaId });
      }
    } else if (b.nombre === 'CIRCLE') {
      const x = parseFloat(get(b, 10) ?? 'NaN'), y = parseFloat(get(b, 20) ?? 'NaN'), r = parseFloat(get(b, 40) ?? 'NaN');
      if (![x, y, r].some(Number.isNaN)) {
        const c = toLL(x, y, origen);
        res.push({ id: nuevoId(), tipo: 'circulo', color, lat: c.lat, lng: c.lng, radio: r, opacidad: 0.18, capaId });
      }
    } else if (b.nombre === 'TEXT') {
      const x = parseFloat(get(b, 10) ?? 'NaN'), y = parseFloat(get(b, 20) ?? 'NaN');
      const txt = get(b, 1) ?? '';
      if (![x, y].some(Number.isNaN) && txt) {
        const c = toLL(x, y, origen);
        res.push({ id: nuevoId(), tipo: 'texto', color, lat: c.lat, lng: c.lng, texto: txt, tamano: 14, capaId });
      }
    } else if (b.nombre === 'POINT') {
      const x = parseFloat(get(b, 10) ?? 'NaN'), y = parseFloat(get(b, 20) ?? 'NaN');
      if (![x, y].some(Number.isNaN)) {
        const c = toLL(x, y, origen);
        res.push({ id: nuevoId(), tipo: 'circulo', color, lat: c.lat, lng: c.lng, radio: 2, opacidad: 0.3, capaId });
      }
    }
  }
  return res;
}
