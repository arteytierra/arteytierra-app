/**
 * Análisis Keyline (P.A. Yeomans) orientativo desde una grilla densa de elevación.
 *  - analizarKeyline: valle principal por acumulación de flujo + keypoint (rodilla
 *    del perfil) + curvas guía paralelas a la curva por el keypoint. El keypoint
 *    sirve para **ubicar cuerpos de agua** —es la cota más alta a la que un muro
 *    embalsa en ese valle—, no para dibujar el patrón de cultivo.
 *  - generarPatronCultivo: para una parcela, una **directriz simplificada** y el
 *    patrón de líneas paralelas que sale de ella, con la deriva del surco medida
 *    contra la banda publicada y la franja de maniobra que la máquina necesita.
 *
 * Los criterios publicados —la banda de deriva, el giro del tractor, el headland,
 * la aptitud de la pendiente y la simplificación de la directriz— viven en
 * `lib/keylineGeometria.ts`, con las citas. Acá está lo que necesita el modelo de
 * elevación: elegir la directriz y medir hacia dónde deriva cada surco.
 *
 * Aproximación didáctica desde SRTM ~30 m, no un relevamiento de precisión.
 */
import { elevEnGrilla, type GrillaElevacion } from './grillaElevacion';
import { flujoD8 } from './cuencaHidro';
import {
  bandaDeriva, aptitudKeyline, headland, simplificarDirectriz, redondearVertices,
  verticesCerrados, resumirPatron, leerVeredicto, DERIVA_POR_ANGULO_PAVLOV,
  FUENTE_YEOMANS, FUENTE_PAVLOV, FUENTE_NRCS330,
  type BandaDeriva, type AptitudKeyline, type ResumenPatron, type VerticeCerrado,
  type TramoPatron,
} from './keylineGeometria';
import type { GrupoHidro } from './cuenca';

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

/**
 * El patrón de cultivo de una parcela.
 *
 * `version` existe porque este objeto se guarda con el proyecto. Los patrones
 * generados antes del 04/10/2026 no la traen: se dibujaron haciendo el offset de
 * la curva de nivel cruda y se puntuaron por la pendiente residual, o sea por el
 * criterio opuesto al del método que les da el nombre. La pantalla los reconoce
 * por la ausencia de `version` y avisa, en vez de mostrar un veredicto que no se
 * midió así.
 */
export interface ResultadoPatron {
  version:      2;
  /** La directriz simplificada, que es de donde sale el offset. */
  master:       Array<{ lat: number; lng: number }>;
  lineas:       Array<Array<{ lat: number; lng: number }>>;
  orientacion_deg:        number;
  espaciado_m:            number;
  pendiente_media_pct:    number;
  /** Franja de maniobra que se dejó libre en el borde de la parcela (m). */
  headland_m:             number;
  /** Cuántos vértices quedaron en la directriz después de simplificar. */
  verticesDirectriz:      number;
  /** Los vértices de la directriz que un tractor no puede trazar. */
  verticesCerrados:       VerticeCerrado[];
  /** La banda en la que la pendiente del surco puede moverse. */
  banda:        BandaDeriva;
  /** Qué está haciendo el patrón con el agua. */
  resumen:      ResumenPatron;
  /** Una línea de lectura del veredicto, con el porqué. */
  lectura:      string;
  /** Si el patrón corresponde en este terreno, y con qué reservas. */
  aptitud:      AptitudKeyline;
  nota:         string;
  fuentes:      string[];
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

  // 1-2) Flujo D8 y acumulación de flujo (compartidos con el patrón de cultivo)
  const flujo = flujoD8(g);
  if (!flujo) return null;
  const { down, acc, celdas, orden } = flujo;

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
    nota: `Keypoint a ${keypoint.elevation.toFixed(0)} m: la pendiente del valle pasa de ~${pArr.toFixed(0)}% (arriba) `
      + `a ~${pAb.toFixed(0)}% (abajo). Para lo que sirve este punto es para ubicar agua: es la cota más alta a la que `
      + 'un muro embalsa en este valle, y la curva que pasa por él marca el pelo de agua de esa represa. El patrón de '
      + 'cultivo NO se dibuja desde acá: sale de una directriz simplificada, más abajo. SRTM orientativo.',
  };
}

// ─── La deriva de un tramo del surco ──────────────────────────────────────────
/**
 * Cuánta pendiente corre a lo largo de un tramo del surco, y hacia qué lado
 * lleva el agua.
 *
 * Es el corazón de la corrección, así que es una función pura y se prueba a
 * mano: recibe el gradiente del terreno, el vector del tramo y la derivada
 * **lateral** de la acumulación de flujo, y no toca la grilla.
 *
 * Por qué la derivada lateral y no la acumulación a secas: el eje de la
 * vertiente es donde la acumulación es alta y el lomo donde es baja, pero la
 * acumulación también crece aguas abajo a lo largo del propio valle. Si se
 * mirara el cambio en la dirección en que corre el agua del surco, el descenso
 * del valle contaminaría el signo. Mirando sólo la componente a lo largo de la
 * curva de nivel queda la posición lateral, que es lo que se quiere saber.
 *
 * `accLateral` es `acc(+t) − acc(−t)` con `t` la dirección de la curva de nivel
 * —perpendicular al gradiente, girada 90° en sentido antihorario—. Positivo
 * significa que el eje de la vertiente está hacia `+t`.
 */
export function derivaDelTramo(p: {
  gradiente: { gx: number; gy: number };
  tramo: { ex: number; ey: number };
  accLateral: number;
}): { deriva_pct: number; haciaLadera: boolean | null } {
  const { gx, gy } = p.gradiente;
  const { ex, ey } = p.tramo;
  const len = Math.hypot(ex, ey);
  if (len < 1e-9) return { deriva_pct: 0, haciaLadera: null };
  const sube = (gx * ex + gy * ey) / len;          // >0 = el tramo sube
  const deriva_pct = Math.abs(sube) * 100;

  const gm = Math.hypot(gx, gy);
  // Sin pendiente del terreno, o con el tramo exactamente a nivel, no hay agua
  // corriendo por el surco y no hay lado que decidir.
  if (gm < 1e-5 || Math.abs(sube) < 1e-9 || p.accLateral === 0 || !Number.isFinite(p.accLateral)) {
    return { deriva_pct, haciaLadera: null };
  }
  const tx = -gy / gm, ty = gx / gm;               // dirección de la curva de nivel
  const ux = sube > 0 ? -ex / len : ex / len;      // por donde corre el agua
  const uy = sube > 0 ? -ey / len : ey / len;
  const sobreT = ux * tx + uy * ty;                // componente del agua sobre la curva
  if (Math.abs(sobreT) < 1e-9) return { deriva_pct, haciaLadera: null };
  // El agua se aleja del eje de la vertiente si va para el lado contrario al
  // que crece la acumulación.
  return { deriva_pct, haciaLadera: sobreT * p.accLateral < 0 };
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

export interface OpcionesPatron {
  /** Separación entre líneas (m). */
  espaciado_m?: number;
  /**
   * Cuánto relieve conserva la directriz, en metros de tolerancia.
   *
   * Es el reemplazo de hacer el offset de la curva de nivel cruda, que es lo que
   * la fuente dice explícitamente que no se haga: con 0 se usa la curva tal cual
   * —el comportamiento viejo— y con valores crecientes la directriz se queda
   * sólo con las formas principales del terreno. Un valor del orden del
   * espaciado suele dejar la cantidad de vértices que una máquina puede seguir.
   */
  toleranciaDirectriz_m?: number;
  /**
   * Radio con el que se redondean los vértices de la directriz después de
   * simplificar, en metros.
   *
   * Reemplaza al suavizado 0–100 que había, y no es un cambio de unidades: el
   * suavizado anterior cortaba la esquina en proporción al tramo adyacente, así
   * que sobre una directriz simplificada a tres vértices se comía la mitad de
   * cada arma y daba vuelta la deriva. Un radio acotado conserva la forma y
   * tiene además un significado de obra: es el giro que la máquina puede hacer.
   * Si falta, se usa el ancho del implemento.
   */
  radioRedondeo_m?: number;
  /** @deprecated El suavizado 0–100. Se ignora; ver `radioRedondeo_m`. */
  suavizado?: number;
  /** Ancho del implemento (m), de donde sale la franja de maniobra. */
  anchoImplemento_m?: number;
  /** Franja de maniobra explícita (m). Si falta, sale del implemento. */
  headland_m?: number;
  /** Grupo hidrológico del suelo: decide el piso de drenaje de la banda. */
  grupoHidro?: GrupoHidro | null;
  /** Lámina de la tormenta de 10 años y 24 h (mm), para la aptitud. */
  lluvia10a24h_mm?: number | null;
  /**
   * De qué lado de la directriz se parea.
   *
   * Las dos fuentes no dicen lo mismo y la diferencia importa. Yeomans es
   * estricto: parejo hacia arriba en los lomos, hacia abajo en las vertientes
   * por debajo de la keyline, porque de cada lado la deriva sale con el signo
   * contrario. Pavlov relaja la regla: con una directriz simplificada bien
   * elegida se pueden cubrir vertientes y lomos a la vez, y conviene buscar el
   * menor número de conjuntos posible. El default es `ambos` —la lectura de
   * Pavlov— y el resultado dice qué fracción del patrón terminó derivando para
   * el lado que corresponde, así que si la relajación no funcionó en este
   * terreno se ve en el número.
   */
  lado?: 'arriba' | 'abajo' | 'ambos';
}

/**
 * Patrón de cultivo de una parcela.
 *
 * El orden de los pasos es el que la fuente pide y no es el que había:
 *
 *   1. se elige **el trazo de contorno más largo** del área, no la curva que
 *      pasa por el centroide;
 *   2. se lo **simplifica** a las formas principales del terreno (que no es lo
 *      mismo que suavizarlo: suavizar redondea y deja todos los vértices, así
 *      que el offset arrastra cada ondulación);
 *   3. recién ahí se redondea;
 *   4. el offset sale de un campo de distancia con signo a esa directriz, así
 *      que las paralelas quedan equidistantes y no se cruzan;
 *   5. se deja libre la franja de maniobra en el borde;
 *   6. y se mide la **deriva** de cada surco —cuánta pendiente corre a lo largo
 *      y hacia qué lado lleva el agua— contra la banda publicada.
 *
 * El paso 6 reemplaza a la métrica anterior, que premiaba la deriva cerca de
 * cero. La deriva no es el error del método: es el método.
 */
export function generarPatronCultivo(
  g: GrillaElevacion,
  parcela: Array<{ lat: number; lng: number }>,
  opciones: OpcionesPatron = {},
): ResultadoPatron | null {
  if (parcela.length < 3) return null;
  const espaciadoM = opciones.espaciado_m ?? 12;
  const { rows, cols, latMin, latMax, lngMin, lngMax, elev } = g;
  const e = (r: number, c: number) => elev[r * cols + c]!;

  const flujo = flujoD8(g);
  if (!flujo) return null;
  const acc = flujo.acc;

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

  /** Distancia de un punto al alambrado más cercano (m). Es el inset del headland. */
  const distAlBorde = (q: XY): number => {
    let dmin = Infinity;
    for (let i = 0; i < polyXY.length; i++) {
      const a = polyXY[i]!, b = polyXY[(i + 1) % polyXY.length]!;
      const abx = b.x - a.x, aby = b.y - a.y;
      const L2 = abx * abx + aby * aby || 1e-9;
      let t = ((q.x - a.x) * abx + (q.y - a.y) * aby) / L2;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const d = Math.hypot(q.x - (a.x + t * abx), q.y - (a.y + t * aby));
      if (d < dmin) dmin = d;
    }
    return dmin;
  };

  // Espaciado de la grilla en metros
  const latMid = (latMin + latMax) / 2 * Math.PI / 180;
  const dyM = (latMax - latMin) / (rows - 1) * R;
  const dxM = (lngMax - lngMin) / (cols - 1) * R * Math.cos(latMid);

  // Pendiente media dentro de la parcela, y el rango de cotas que abarca.
  let sMag = 0, nG = 0, zMin = Infinity, zMax = -Infinity;
  for (let r = 1; r < rows - 1; r++) {
    const la = latMin + (r / (rows - 1)) * (latMax - latMin);
    for (let c = 1; c < cols - 1; c++) {
      const lo = lngMin + (c / (cols - 1)) * (lngMax - lngMin);
      if (!dentro(la, lo)) continue;
      const eC = e(r, c);
      if (!Number.isNaN(eC)) { if (eC < zMin) zMin = eC; if (eC > zMax) zMax = eC; }
      const eE = e(r, c + 1), eW = e(r, c - 1), eN = e(r + 1, c), eS = e(r - 1, c);
      if ([eE, eW, eN, eS].some(isNaN)) continue;
      sMag += Math.hypot((eE - eW) / (2 * dxM), (eN - eS) / (2 * dyM)); nG++;
    }
  }
  if (nG < 4) return null;
  const pendMedia = (sMag / nG) * 100;

  const stepLat = (latMax - latMin) / (rows - 1);
  const stepLng = (lngMax - lngMin) / (cols - 1);
  // Gradiente (cuesta arriba) en un punto, en metros este/norte.
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

  /** Acumulación de flujo en un punto (celda más cercana). NaN fuera de dato. */
  const accEn = (la: number, lo: number): number => {
    const r = Math.round((la - latMin) / (latMax - latMin) * (rows - 1));
    const c = Math.round((lo - lngMin) / (lngMax - lngMin) * (cols - 1));
    if (r < 0 || c < 0 || r >= rows || c >= cols) return NaN;
    return Number.isNaN(e(r, c)) ? NaN : acc[r * cols + c]!;
  };

  // ── La directriz: el trazo de contorno más largo del área ─────────────────
  // Pavlov: «empezar desde el trazo de contorno simplificado más largo del
  // área», porque con una sola directriz se cubren vertientes y lomos a la vez.
  // La curva que pasa por el centroide —lo que se usaba antes— puede ser un
  // pedacito corto que deja la mitad de la parcela sin patrón coherente.
  const z0 = elevEnGrilla(g, lat0, lng0);
  const cotas: number[] = [];
  if (Number.isFinite(zMin) && zMax - zMin >= 0.2) {
    for (let i = 1; i <= 7; i++) cotas.push(zMin + (zMax - zMin) * (i / 8));
  }
  if (!Number.isNaN(z0)) cotas.push(z0);
  if (cotas.length === 0) return null;

  const largoDentro = (ln: Array<{ lat: number; lng: number }>): number => {
    let L = 0;
    for (let i = 0; i + 1 < ln.length; i++) {
      const a = ln[i]!, b = ln[i + 1]!;
      if (!dentro(a.lat, a.lng) && !dentro(b.lat, b.lng)) continue;
      L += distM(a.lat, a.lng, b.lat, b.lng);
    }
    return L;
  };

  let masterLL: Array<{ lat: number; lng: number }> | null = null;
  let mejorLargo = 0;
  for (const z of cotas) {
    for (const ln of contornoNivel(g, z)) {
      if (ln.length < 2) continue;
      const L = largoDentro(ln);
      if (L > mejorLargo) { mejorLargo = L; masterLL = ln; }
    }
  }
  // Fallback recto ⟂ al gradiente si no hay curva utilizable.
  if (!masterLL) {
    const cdx = -gradMedio.y, cdy = gradMedio.x;
    const cortes = cortesRectaPoligono({ x: 0, y: 0 }, { x: cdx, y: cdy }, polyXY);
    if (cortes.length < 2) return null;
    masterLL = [toLL({ x: cdx * cortes[0]!, y: cdy * cortes[0]! }), toLL({ x: cdx * cortes[cortes.length - 1]!, y: cdy * cortes[cortes.length - 1]! })];
  }

  // Simplificar a las formas principales, y recién después redondear, con un
  // radio acotado. El orden es el de la fuente, y el acote es lo que evita que
  // el redondeo se coma la forma que la simplificación acaba de rescatar.
  const tol = opciones.toleranciaDirectriz_m ?? Math.max(2, espaciadoM * 0.75);
  const simplificada = simplificarDirectriz(masterLL.map(toXY), tol);
  const radio = opciones.radioRedondeo_m ?? (opciones.anchoImplemento_m ?? 3);
  const masterXY = redondearVertices(simplificada, radio);

  // ── La franja de maniobra ─────────────────────────────────────────────────
  const hl = headland({ anchoImplemento_m: opciones.anchoImplemento_m ?? 3 });
  const headland_m = Math.max(0, opciones.headland_m ?? hl.sugerido_m);

  // Densifica una polilínea y conserva los tramos que están dentro de la
  // parcela Y a más de un headland del alambrado: ahí la máquina gira.
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
      const ok = dentro(p.lat, p.lng) && distAlBorde(toXY(p)) >= headland_m;
      if (ok) cur.push(p);
      else { if (cur.length >= 2) out.push(cur); cur = []; }
    }
    if (cur.length >= 2) out.push(cur);
    return out;
  };

  // ── Patrón por CAMPO DE DISTANCIA con signo a la directriz ────────────────
  // Offsetear la directriz por su normal se autointersecta en las curvas (la
  // línea se dobla sobre sí misma) y hace que las paralelas se crucen. En su
  // lugar armamos un campo escalar = distancia con signo de cada punto a la
  // directriz y sacamos sus curvas de nivel a k·espaciado. Las curvas de nivel
  // de un campo escalar nunca se cruzan entre sí y quedan equiespaciadas por
  // construcción, que es además el offset "redondeado" —el que mantiene la
  // equidistancia en los vértices, donde la unión en punta la rompería—.
  const distFirmada = (px: number, py: number): number => {
    let dmin = Infinity, fx = 0, fy = 0;
    for (let i = 0; i + 1 < masterXY.length; i++) {
      const a = masterXY[i]!, b = masterXY[i + 1]!;
      const abx = b.x - a.x, aby = b.y - a.y;
      const L2 = abx * abx + aby * aby || 1e-9;
      let t = ((px - a.x) * abx + (py - a.y) * aby) / L2;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const qx = a.x + t * abx, qy = a.y + t * aby;
      const d = Math.hypot(px - qx, py - qy);
      if (d < dmin) { dmin = d; fx = qx; fy = qy; }
    }
    const lado = (px - fx) * gradMedio.x + (py - fy) * gradMedio.y;
    return lado < 0 ? -dmin : dmin;
  };

  // Bbox de la parcela (+ margen) en XY.
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of polyXY) { if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x; if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y; }
  const marg = espaciadoM;
  minX -= marg; maxX += marg; minY -= marg; maxY += marg;
  const anchoM = maxX - minX, altoM = maxY - minY;
  const ladoM = Math.max(anchoM, altoM, 1);
  const celObjetivo = Math.max(1, espaciadoM / 3);       // ≥3 celdas entre líneas
  const NN = Math.min(420, Math.max(48, Math.ceil(ladoM / celObjetivo) + 1));
  const colsN = Math.max(2, Math.round((anchoM / ladoM) * (NN - 1)) + 1);
  const rowsN = Math.max(2, Math.round((altoM / ladoM) * (NN - 1)) + 1);
  const field = new Float64Array(rowsN * colsN);
  let fMin = Infinity, fMax = -Infinity;
  for (let r = 0; r < rowsN; r++) {
    const y = minY + (r / (rowsN - 1)) * altoM;
    for (let c = 0; c < colsN; c++) {
      const x = minX + (c / (colsN - 1)) * anchoM;
      const d = distFirmada(x, y);
      field[r * colsN + c] = d;
      if (d < fMin) fMin = d; if (d > fMax) fMax = d;
    }
  }
  // Grilla ficticia (el campo como "elevación") para reusar el marching squares.
  const fakeG: GrillaElevacion = {
    rows: rowsN, cols: colsN,
    latMin: lat0 + minY / R, latMax: lat0 + maxY / R,
    lngMin: lng0 + minX / mLng, lngMax: lng0 + maxX / mLng,
    elev: field, elev_min: fMin, elev_max: fMax,
  };

  const lado = opciones.lado ?? 'ambos';
  const lineas: Array<Array<{ lat: number; lng: number }>> = [];
  let master: Array<{ lat: number; lng: number }> = [];
  const kMin = lado === 'arriba' ? 0 : Math.ceil(fMin / espaciadoM);
  const kMax = lado === 'abajo' ? 0 : Math.floor(fMax / espaciadoM);
  for (let k = kMin; k <= kMax; k++) {
    // Las curvas de nivel del campo de distancia ya salen suaves y, sobre todo,
    // ya heredaron el redondeo de la directriz: volver a cortarles la esquina
    // acá era lo que deshacía el trabajo del paso anterior.
    for (const lnLL of contornoNivel(fakeG, k * espaciadoM)) {
      if (lnLL.length < 2) continue;
      for (const seg of clip(lnLL)) {
        lineas.push(seg);
        if (k === 0 && seg.length > master.length) master = seg;
      }
    }
  }
  if (lineas.length === 0) return null;

  // ── La deriva: cuánta pendiente corre a lo largo del surco, y hacia dónde ──
  // Hacia dónde: el agua que corre por el surco se aleja del eje del valle o se
  // acerca. El eje es donde la acumulación de flujo es alta, así que se mira la
  // derivada LATERAL de la acumulación —a lo largo de la curva de nivel, no a lo
  // largo de la pendiente— para que el descenso del propio valle no contamine el
  // signo.
  const pasoLateral = Math.max(dxM, dyM) * 2;
  const tramos: TramoPatron[] = [];
  for (const seg of lineas) {
    for (let i = 0; i + 1 < seg.length; i++) {
      const aLL = seg[i]!, bLL = seg[i + 1]!;
      const a = toXY(aLL), b = toXY(bLL);
      const ex = b.x - a.x, ey = b.y - a.y;
      const len = Math.hypot(ex, ey);
      if (len < 0.5) continue;
      const midLat = (aLL.lat + bLL.lat) / 2, midLng = (aLL.lng + bLL.lng) / 2;
      const gr = gradRawEn(midLat, midLng);
      if (!gr) continue;
      const gm = Math.hypot(gr.gx, gr.gy);
      let accLateral = 0;
      if (gm > 1e-5) {
        const tx = -gr.gy / gm, ty = gr.gx / gm;          // dirección de la curva de nivel
        const accMas   = accEn(midLat + (ty * pasoLateral) / R, midLng + (tx * pasoLateral) / mLng);
        const accMenos = accEn(midLat - (ty * pasoLateral) / R, midLng - (tx * pasoLateral) / mLng);
        if (!Number.isNaN(accMas) && !Number.isNaN(accMenos)) accLateral = accMas - accMenos;
      }
      const d = derivaDelTramo({ gradiente: gr, tramo: { ex, ey }, accLateral });
      tramos.push({ largo_m: len, deriva_pct: d.deriva_pct, haciaLadera: d.haciaLadera });
    }
  }

  const banda = bandaDeriva({ pendienteTerreno_pct: pendMedia, grupoHidro: opciones.grupoHidro ?? null });
  const resumen = resumirPatron(tramos, banda);
  const lectura = leerVeredicto(resumen, banda);

  // Largo de ladera dentro de la parcela: la proyección del polígono sobre la
  // dirección de máxima pendiente. Es el dato con el que el estándar juzga si la
  // práctica alcanza para contener el escurrimiento.
  let proyMin = Infinity, proyMax = -Infinity;
  for (const p of polyXY) {
    const s = p.x * gradMedio.x + p.y * gradMedio.y;
    if (s < proyMin) proyMin = s; if (s > proyMax) proyMax = s;
  }
  const largoLadera_m = Number.isFinite(proyMin) ? proyMax - proyMin : null;

  const aptitud = aptitudKeyline({
    pendiente_pct: pendMedia,
    largoLadera_m,
    lluvia10a24h_mm: opciones.lluvia10a24h_mm ?? null,
  });

  const cerrados = verticesCerrados(masterXY);

  // Orientación general de la directriz.
  const a0 = masterXY[0]!, a1 = masterXY[masterXY.length - 1]!;
  const orientacion = ((Math.atan2(a1.y - a0.y, a1.x - a0.x) * 180 / Math.PI) % 180 + 180) % 180;

  const notaCerrados = cerrados.length > 0
    ? ` ${cerrados.length} vértice(s) de la directriz piden un giro mayor al que la mayoría de los tractores puede `
      + `hacer: redondealos o corré la directriz. Por cada 10° que se abre un vértice, la pendiente de los rayos `
      + `cambia unos ${(10 * DERIVA_POR_ANGULO_PAVLOV).toFixed(0)}°.`
    : '';

  return {
    version: 2,
    master: master.length >= 2 ? master : masterXY.map(toLL),
    lineas,
    orientacion_deg: Math.round(orientacion),
    espaciado_m: espaciadoM,
    pendiente_media_pct: Math.round(pendMedia * 10) / 10,
    headland_m: Math.round(headland_m * 10) / 10,
    verticesDirectriz: simplificada.length,
    verticesCerrados: cerrados,
    banda,
    resumen,
    lectura,
    aptitud,
    nota: `${lineas.length} líneas a ${espaciadoM} m, paralelas a una directriz de ${simplificada.length} vértices `
      + `(simplificada con ${tol.toFixed(0)} m de tolerancia y redondeada con ${radio.toFixed(1)} m de radio), con `
      + `${headland_m.toFixed(0)} m de maniobra libres en el borde. La deriva media del surco es `
      + `${resumen.deriva_media_pct.toFixed(2)} %.`
      + notaCerrados
      + ' SRTM orientativo.',
    fuentes: [FUENTE_YEOMANS, FUENTE_PAVLOV, FUENTE_NRCS330],
  };
}
