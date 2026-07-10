/**
 * Objetos con altura propia que proyectan sombra (R4).
 *
 * Un objeto es o bien un árbol (cilindro: radio de copa + altura) o bien un
 * volumen (prisma: polígono extruido), que normalmente se toma de una zona o un
 * dibujo ya hecho en el plano, para no dibujarlo dos veces.
 *
 * La oclusión se resuelve **analíticamente** contra el sólido de cada objeto, no
 * rasterizando su altura sobre el MDE. El MDE es SRTM de ~30 m: un árbol de 4 m
 * de radio no cubriría ni el centro de una celda y no proyectaría nada. En
 * cambio, intersecar el rayo de sol contra un cilindro o un prisma es exacto e
 * independiente de la resolución de la grilla.
 *
 * Coordenadas: metros en un plano local (x = este, y = norte) con origen en un
 * punto de referencia del predio. A esta escala la distorsión es despreciable.
 */

export type TipoObjeto = 'arbol' | 'volumen';

interface Base { id: string; nombre: string; altura_m: number }
export interface ObjetoArbol extends Base {
  tipo: 'arbol';
  lat: number; lng: number;
  /** Radio de la copa en metros. */
  radio_m: number;
}
export interface ObjetoVolumen extends Base {
  tipo: 'volumen';
  vertices: Array<{ lat: number; lng: number }>;
}
export type ObjetoSombra = ObjetoArbol | ObjetoVolumen;

/** Alturas típicas, para no partir de cero. */
export const PRESETS_OBJETO = [
  { clave: 'arbol_joven',  etiqueta: 'Árbol joven',      tipo: 'arbol'   as const, altura_m: 4,   radio_m: 2 },
  { clave: 'arbol_adulto', etiqueta: 'Árbol adulto',     tipo: 'arbol'   as const, altura_m: 9,   radio_m: 4 },
  { clave: 'algarrobo',    etiqueta: 'Algarrobo maduro', tipo: 'arbol'   as const, altura_m: 12,  radio_m: 6 },
  { clave: 'vivienda',     etiqueta: 'Vivienda',         tipo: 'volumen' as const, altura_m: 4 },
  { clave: 'galpon',       etiqueta: 'Galpón',           tipo: 'volumen' as const, altura_m: 6 },
  { clave: 'muro',         etiqueta: 'Muro / tapia',     tipo: 'volumen' as const, altura_m: 2.2 },
];

const M_LAT = 111_320;

export interface Origen { lat: number; lng: number }
export const aMetros = (lat: number, lng: number, o: Origen) => ({
  x: (lng - o.lng) * M_LAT * Math.cos((o.lat * Math.PI) / 180),
  y: (lat - o.lat) * M_LAT,
});

/** Objeto ya convertido a metros, con su base y su techo en cota absoluta. */
interface Prep { id: string; nombre: string; base: number; techo: number }
export type ObjetoPreparado =
  | (Prep & { tipo: 'arbol'; cx: number; cy: number; r: number })
  | (Prep & { tipo: 'volumen'; pts: Array<{ x: number; y: number }> });

/**
 * Convierte los objetos a metros y les asigna cota. `elevacionEn` devuelve la
 * cota del terreno (o null fuera de la grilla; ahí el objeto se descarta).
 */
export function prepararObjetos(
  objetos: ObjetoSombra[],
  origen: Origen,
  elevacionEn: (lat: number, lng: number) => number | null,
): ObjetoPreparado[] {
  const out: ObjetoPreparado[] = [];
  for (const o of objetos) {
    if (o.altura_m <= 0) continue;
    if (o.tipo === 'arbol') {
      const base = elevacionEn(o.lat, o.lng);
      if (base == null) continue;
      const { x, y } = aMetros(o.lat, o.lng, origen);
      out.push({ id: o.id, nombre: o.nombre, tipo: 'arbol', cx: x, cy: y, r: Math.max(0.5, o.radio_m), base, techo: base + o.altura_m });
    } else {
      if (o.vertices.length < 3) continue;
      // Apoyamos el volumen sobre la cota más baja bajo su planta y lo llevamos
      // hasta la más alta + altura: así un galpón en pendiente no queda flotando.
      let bMin = Infinity, bMax = -Infinity;
      for (const v of o.vertices) {
        const e = elevacionEn(v.lat, v.lng);
        if (e == null) continue;
        if (e < bMin) bMin = e;
        if (e > bMax) bMax = e;
      }
      if (!Number.isFinite(bMin)) continue;
      out.push({
        id: o.id, nombre: o.nombre,
        tipo: 'volumen',
        pts: o.vertices.map(v => aMetros(v.lat, v.lng, origen)),
        base: bMin,
        techo: bMax + o.altura_m,
      });
    }
  }
  return out;
}

/**
 * ¿Algún objeto tapa el sol visto desde (x0,y0,z0)?
 *
 * El rayo horizontal es P(s) = (x0,y0) + s·(ux,uy) con s en metros, y su cota
 * sube linealmente: z(s) = z0 + s·tanElev. Para cada objeto se calcula el tramo
 * [sIn, sOut] en que el rayo está sobre su planta; como z(s) crece de forma
 * monótona, alcanza con comparar los extremos contra base y techo.
 */
export function bloqueadoPorObjetos(
  x0: number, y0: number, z0: number,
  ux: number, uy: number, tanElev: number,
  objetos: ObjetoPreparado[],
): boolean {
  for (const o of objetos) {
    let sIn: number, sOut: number;

    if (o.tipo === 'arbol') {
      // |P0 + s·u − C|² = r²  →  s² + 2·b·s + c = 0   (u es unitario)
      const dx = x0 - o.cx, dy = y0 - o.cy;
      const b = dx * ux + dy * uy;
      const c = dx * dx + dy * dy - o.r * o.r;
      const disc = b * b - c;
      if (disc <= 0) continue;                 // el rayo pasa de largo
      const raiz = Math.sqrt(disc);
      sIn = -b - raiz; sOut = -b + raiz;
    } else {
      // Intersección del rayo con las aristas del polígono.
      let min = Infinity, max = -Infinity;
      const pts = o.pts;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const a = pts[j]!, bb = pts[i]!;
        const ex = bb.x - a.x, ey = bb.y - a.y;
        const den = ux * ey - uy * ex;
        if (Math.abs(den) < 1e-9) continue;    // rayo paralelo a la arista
        const qx = a.x - x0, qy = a.y - y0;
        const s = (qx * ey - qy * ex) / den;   // avance sobre el rayo
        const t = (qx * uy - qy * ux) / den;   // posición sobre la arista
        if (t < 0 || t > 1) continue;
        if (s < min) min = s;
        if (s > max) max = s;
      }
      if (!Number.isFinite(min)) continue;
      sIn = min; sOut = max;
    }

    if (sOut <= 0.01) continue;                // el objeto queda detrás del sol
    const s1 = Math.max(sIn, 0.01);
    if (s1 > sOut) continue;

    const zEntra = z0 + s1 * tanElev;          // cota mínima del rayo dentro del objeto
    const zSale  = z0 + sOut * tanElev;        // cota máxima
    if (zEntra <= o.techo && zSale >= o.base) return true;
  }
  return false;
}

// ─── Sombra proyectada como polígono ─────────────────────────────────────────

/**
 * La grilla del MDE es de ~30 m: la sombra de un árbol de 10 m no llega a pintar
 * una celda vecina y sería invisible como raster. Pero sobre suelo localmente
 * plano esa sombra es una proyección geométrica exacta, así que la calculamos
 * como polígono: la envolvente convexa de la planta del objeto y de esa misma
 * planta corrida `Δz / tan(elevación)` metros en dirección opuesta al sol.
 *
 * Supone el suelo horizontal a la cota de la base del objeto; en pendiente
 * fuerte la sombra real se estira cuesta abajo y se acorta cuesta arriba.
 */
export function sombraProyectada(
  o: ObjetoPreparado,
  azimut_deg: number, elevacion_deg: number,
  origen: Origen,
): Array<{ lat: number; lng: number }> | null {
  if (elevacion_deg <= 0.5) return null;       // sol bajo el horizonte
  const DEG = Math.PI / 180;
  const largo = (o.techo - o.base) / Math.tan(elevacion_deg * DEG);
  if (!Number.isFinite(largo) || largo <= 0) return null;

  // La sombra se aleja del sol.
  const dx = -Math.sin(azimut_deg * DEG) * largo;
  const dy = -Math.cos(azimut_deg * DEG) * largo;

  const planta: Array<{ x: number; y: number }> = o.tipo === 'arbol'
    ? Array.from({ length: 24 }, (_, i) => {
        const t = (i / 24) * 2 * Math.PI;
        return { x: o.cx + o.r * Math.cos(t), y: o.cy + o.r * Math.sin(t) };
      })
    : o.pts;

  const nube = [...planta, ...planta.map(p => ({ x: p.x + dx, y: p.y + dy }))];
  const hull = envolventeConvexa(nube);
  if (hull.length < 3) return null;

  const mLng = M_LAT * Math.cos((origen.lat * Math.PI) / 180);
  return hull.map(p => ({ lat: origen.lat + p.y / M_LAT, lng: origen.lng + p.x / mLng }));
}

/** Envolvente convexa (cadena monótona de Andrew). */
function envolventeConvexa(pts: Array<{ x: number; y: number }>): Array<{ x: number; y: number }> {
  const p = [...pts].sort((a, b) => (a.x - b.x) || (a.y - b.y));
  if (p.length < 3) return p;
  type Pt = { x: number; y: number };
  const cruz = (o: Pt, a: Pt, b: Pt) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  const media = (fuente: Pt[]) => {
    const out: Pt[] = [];
    for (const q of fuente) {
      while (out.length >= 2 && cruz(out[out.length - 2]!, out[out.length - 1]!, q) <= 0) out.pop();
      out.push(q);
    }
    out.pop();
    return out;
  };
  return [...media(p), ...media([...p].reverse())];
}
