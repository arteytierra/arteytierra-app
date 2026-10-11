/**
 * El vaso del embalse, deducido del muro y del terreno.
 *
 * Hasta acá el volumen embalsado salía de `calcularEmbalse`, que suma las
 * celdas del polígono dibujado que estén por debajo del pelo de agua. Eso tiene
 * tres fallas de fondo, y las tres son del modelo y no del redondeo:
 *
 *   1. cuenta agua donde el agua no se queda —una celda baja del otro lado de
 *      una loma, o aguas abajo del muro, entra igual al volumen—;
 *   2. el tope del nivel de agua es «la celda más alta del polígono», que en un
 *      cuello de botella entre dos laderas es la ladera: el cálculo deja subir
 *      el pelo de agua 40 m por encima de la silla de montar por la que el agua
 *      se iría;
 *   3. y al revés: si el terreno ya tiene una hoya aguas arriba del cuello, un
 *      muro de un metro la cierra y el agua ocupa **toda** la hoya, que es
 *      mucho más de lo que uno dibujó. El muro más eficiente que existe —el que
 *      aprovecha una depresión que ya estaba— es justamente el que peor
 *      estimaba.
 *
 * Lo que el usuario elige acá es el muro. **El vaso lo encuentra el terreno.**
 *
 * ── El método, con nombre ───────────────────────────────────────────────────
 *
 * Es el mismo problema que rellenar depresiones en un modelo de elevación, dado
 * vuelta: en vez de sembrar la cola en el borde del DEM y dejar que el agua
 * entre, se siembra en el muro y el borde pasa a ser por donde el agua se
 * escapa.
 *
 * Barnes, Lehman y Mulla (2014) describen el algoritmo así: *«the Priority-Flood
 * Algorithm works by inserting the edge cells of a DEM into a priority-queue
 * where they are ordered by increasing elevation. The cell with the lowest
 * elevation is popped from the queue and manipulated»*, y la propiedad que lo
 * hace servir para esto es ésta: *«Each cell c which is popped is guaranteed to
 * be the lowest cell with an established drainage path to the edge of the
 * DEM»*. Con el muro como semilla, eso se lee: **cada celda que sale de la cola
 * sale a la cota a la que el agua la alcanza**, porque la cota con la que se
 * encola una vecina es `max(cota del padre, su propia elevación)` —el paso 11
 * del algoritmo 1, `DEM(n) ← max(DEM(n), DEM(c))`—, o sea el punto más alto del
 * camino más bajo que la une al muro. Esa es, literalmente, la definición de
 * «hasta dónde tiene que subir el agua para llegar hasta ahí».
 *
 * De ahí sale todo lo demás sin cuentas adicionales:
 *
 *   · el volumen y el área a cualquier nivel, sumando las celdas cuya cota de
 *     llegada no pasa ese nivel (ver `nivelVaso`);
 *   · la **cota de derrame**, que es la cota a la que el agua alcanza por
 *     primera vez el afuera del vaso. Es el número que faltaba: el límite
 *     físico del embalse no es la celda más alta del polígono, es la silla de
 *     montar más baja del contorno que no sea el muro;
 *   · y el punto exacto donde se derrama, que no es un detalle del cálculo: ahí
 *     va el vertedero.
 *
 * Fuentes:
 *   · Barnes, R., Lehman, C., Mulla, D. (2014), «Priority-Flood: An Optimal
 *     Depression-Filling and Watershed-Labeling Algorithm for Digital Elevation
 *     Models», Computers & Geosciences 62: 117–127.
 *   · Antecedente: Planchon, O. & Darboux, F. (2002), «A fast, simple and
 *     versatile algorithm to fill the depressions of digital elevation models»,
 *     Catena 46: 159–176.
 *   · El caso resuelto del test sale de USDA SCS, Engineering Field Manual,
 *     cap. 11 «Ponds and Reservoirs» (hoy NEH Part 650): una pileta excavada de
 *     40 × 100 pies y 12 de profundidad, con taludes 2:1 y una rampa 4:1, que
 *     el manual resuelve por la fórmula prismoidal en 3.996 yd³.
 *
 * ── Rango de validez ───────────────────────────────────────────────────────
 *
 * El resultado no puede ser mejor que la grilla: con celdas de 30 m —SRTM,
 * Copernicus GLO-30— un cuello de botella de 40 m de ancho son dos celdas, y la
 * silla de montar que define el derrame puede no existir en el modelo. Por eso
 * `advertencias` dice cuántas celdas tiene el vaso y `tocaBorde` avisa cuando el
 * agua llega al límite del DEM: ahí el volumen informado es un **mínimo**, no
 * una estimación. Es la regla de `saludCalculo`: degradar avisando.
 *
 * Lo que este módulo NO hace, a propósito: no decide la altura del muro ni su
 * sección —eso es `dimensionarMuro`, con los mínimos publicados de
 * `represaDiseno.ts`—, y no reemplaza todavía a `calcularEmbalse`. Los dos
 * conviven mientras se valide con predios reales, que es el paso 2 del plan
 * `PLAN-embalse-vaso-real.md`.
 */
import { N8, dimsCelda } from './cuencaHidro';
import type { GrillaElevacion } from './grillaElevacion';

export const FUENTE_PRIORITY_FLOOD =
  'Barnes, Lehman y Mulla (2014) — «Priority-Flood: An Optimal Depression-Filling and Watershed-Labeling Algorithm for Digital Elevation Models», Computers & Geosciences 62: 117–127';
export const FUENTE_PLANCHON_DARBOUX =
  'Planchon y Darboux (2002) — «A fast, simple and versatile algorithm to fill the depressions of digital elevation models», Catena 46: 159–176';
export const FUENTE_EFM11 =
  'USDA SCS — Engineering Field Manual, cap. 11 «Ponds and Reservoirs» (NEH Part 650): fórmula prismoidal y ejemplo resuelto';

/** Debajo de esto el vaso tiene tan pocas celdas que su forma es la de la grilla. */
export const CELDAS_MINIMAS_VASO = 30;

/** Un muro de menos de tres celdas de largo no está representado en la grilla. */
export const CELDAS_MINIMAS_MURO = 3;

/**
 * Una celda del vaso.
 *
 * `cota_m` no es la elevación del terreno: es la cota a la que el agua llega
 * hasta esta celda, o sea el punto más alto del camino más bajo que la une al
 * muro. Para una celda en el fondo del vaso las dos coinciden; para una celda
 * del otro lado de un lomo interno, la cota es la del lomo.
 */
export interface CeldaVaso {
  row:    number;
  col:    number;
  elev_m: number;
  cota_m: number;
}

/** Qué le pone el techo al embalse. */
export type TipoTope =
  /** Una silla de montar del contorno: el agua se va por ahí. Ahí va el vertedero. */
  | 'derrame'
  /** El vaso llegó al límite del DEM: arriba de esa cota el modelo no sabe. */
  | 'borde_del_dem';

export interface Vaso {
  /**
   * Las celdas del vaso **ordenadas por cota de llegada creciente** (es el
   * orden en que salen de la cola de prioridad, así que no hace falta
   * ordenarlas). De ese orden depende que `nivelVaso` resuelva cualquier nivel
   * con una búsqueda binaria en vez de recorrer la grilla de nuevo.
   */
  celdas:        readonly CeldaVaso[];
  /** Suma acumulada de elevaciones: `prefijoElev[k]` = Σ elev de las primeras k celdas. */
  prefijoElev:   Float64Array;
  /** Mínimo acumulado de elevaciones, para la profundidad máxima a cada nivel. */
  prefijoMin:    Float64Array;
  /** Cota del punto más bajo del vaso. */
  cotaFondo_m:   number;
  /** Cota a la que el agua deja de quedarse. Ver `tipoTope`. */
  cotaDerrame_m: number;
  tipoTope:      TipoTope;
  /** Dónde se derrama. `null` si no se pudo ubicar sobre la grilla. */
  puntoDerrame:  { lat: number; lng: number } | null;
  /**
   * true si el derrame cae sobre un estribo del muro, o sea si el agua se va
   * **por la punta del muro**. No se arregla con un vertedero: se arregla
   * alargando el muro, y son dos decisiones de obra distintas.
   */
  derramePorEstribo: boolean;
  /** true si el vaso toca el borde del DEM o una celda sin dato. */
  tocaBorde:     boolean;
  /** Terreno natural más bajo bajo el eje del muro: la base de la sección más honda. */
  cotaEjeMin_m:  number;
  areaCelda_m2:  number;
  /** Paso horizontal de la grilla (m), el mayor de los dos lados de la celda. */
  paso_m:        number;
  /** Cómo se decidió cuál es el lado de aguas arriba. */
  ladoAguasArriba: 'referencia' | 'elevacion';
  advertencias:  string[];
  fuente:        string;
}

/** El vaso a un nivel de agua concreto. */
export interface NivelVaso {
  nivel_m:          number;
  volumen_m3:       number;
  area_inundada_m2: number;
  /** Profundidad máxima en cualquier punto del vaso. */
  prof_max_m:       number;
  prof_media_m:     number;
  /**
   * Profundidad del agua **contra el muro**: la que manda su altura.
   *
   * No es `prof_max_m`. En un cuello de botella con hoya, el punto más hondo
   * del vaso está lejos del muro, y el muro no tiene que ser tan alto como lo
   * más hondo del vaso: tiene que llegar al pelo de agua que toca su cara
   * interna. Pasarle `prof_max_m` a `dimensionarMuro` —que es lo que se hace
   * hoy— engorda el terraplén y la zanja de anclaje.
   */
  profEnMuro_m:     number;
  celdas:           number;
  /** true si el nivel pedido está por encima de la cota de derrame: no existe. */
  derrama:          boolean;
}

// ─── Cola de prioridad con orden total ───────────────────────────────────────
/**
 * Min-heap por (cota, orden de inserción).
 *
 * El segundo criterio no es un lujo. Barnes y otros (2014) lo piden
 * explícitamente para este uso: con empates de elevación, un orden débil deja
 * las celdas «incomparables» y el resultado depende de la implementación del
 * heap, mientras que un orden total *«produces a predictable, reproducible
 * result»* y garantiza que cada celda tenga el camino más corto hasta su fuente
 * de inundación. Acá eso se traduce en una cosa concreta: el punto de derrame
 * que la app marca en el mapa es siempre el mismo para el mismo terreno. En un
 * DEM con mesetas o con un llano —y un vaso es, por definición, un lugar
 * llano— los empates son la regla, no la excepción.
 */
class ColaVaso {
  private cotas: number[] = [];
  private ordenes: number[] = [];
  private idxs: number[] = [];
  private contador = 0;

  get size(): number { return this.idxs.length; }

  push(cota: number, idx: number): void {
    this.cotas.push(cota); this.ordenes.push(this.contador++); this.idxs.push(idx);
    let i = this.idxs.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!this.menor(i, p)) break;
      this.swap(i, p); i = p;
    }
  }

  pop(): { cota: number; idx: number } {
    const top = { cota: this.cotas[0]!, idx: this.idxs[0]! };
    const lc = this.cotas.pop()!, lo = this.ordenes.pop()!, li = this.idxs.pop()!;
    const n = this.idxs.length;
    if (n > 0) {
      this.cotas[0] = lc; this.ordenes[0] = lo; this.idxs[0] = li;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = 2 * i + 2;
        let m = i;
        if (l < n && this.menor(l, m)) m = l;
        if (r < n && this.menor(r, m)) m = r;
        if (m === i) break;
        this.swap(i, m); i = m;
      }
    }
    return top;
  }

  private menor(a: number, b: number): boolean {
    const ca = this.cotas[a]!, cb = this.cotas[b]!;
    if (ca !== cb) return ca < cb;
    return this.ordenes[a]! < this.ordenes[b]!;
  }

  private swap(a: number, b: number): void {
    const tc = this.cotas[a]!; this.cotas[a] = this.cotas[b]!; this.cotas[b] = tc;
    const to = this.ordenes[a]!; this.ordenes[a] = this.ordenes[b]!; this.ordenes[b] = to;
    const ti = this.idxs[a]!; this.idxs[a] = this.idxs[b]!; this.idxs[b] = ti;
  }
}

// ─── Geometría de la grilla ──────────────────────────────────────────────────

/** Centro de una celda en coordenadas geográficas. */
export function latLngDeCelda(g: GrillaElevacion, row: number, col: number): { lat: number; lng: number } {
  return {
    lat: g.latMin + (row / (g.rows - 1)) * (g.latMax - g.latMin),
    lng: g.lngMin + (col / (g.cols - 1)) * (g.lngMax - g.lngMin),
  };
}

/** Celda que contiene un punto. `null` si cae fuera de la grilla. */
function celdaDePunto(g: GrillaElevacion, p: { lat: number; lng: number }): { row: number; col: number } | null {
  const row = Math.round(((p.lat - g.latMin) / (g.latMax - g.latMin)) * (g.rows - 1));
  const col = Math.round(((p.lng - g.lngMin) / (g.lngMax - g.lngMin)) * (g.cols - 1));
  if (row < 0 || col < 0 || row >= g.rows || col >= g.cols) return null;
  return { row, col };
}

// ─── El núcleo: inundar desde un conjunto de semillas ────────────────────────

interface Salida {
  celdas: CeldaVaso[];
  cota: number;
  idxFuga: number;
  padre: Int32Array;
}

/**
 * Priority-Flood sembrado en `semillas`, con `obra` como frontera cerrada.
 *
 * Devuelve las celdas en el orden en que el agua las alcanza, y se detiene en
 * la primera fuga: una celda del borde de la grilla o pegada a una celda sin
 * dato. Esa primera fuga es lo que define el techo del embalse; de qué tipo de
 * techo se trata lo decide `clasificarTope` mirando el camino, no la celda.
 */
function inundar(
  g: GrillaElevacion,
  semillas: readonly number[],
  obra: Uint8Array | null,
): Salida | null {
  const { rows, cols, elev } = g;
  const n = rows * cols;
  const cerrada = new Uint8Array(n);
  const padre = new Int32Array(n).fill(-1);
  const cola = new ColaVaso();
  const celdas: CeldaVaso[] = [];

  const sinDato = (i: number) => Number.isNaN(elev[i]!);

  if (obra) for (let i = 0; i < n; i++) if (obra[i]) cerrada[i] = 1;

  let sembradas = 0;
  for (const s of semillas) {
    if (s < 0 || s >= n || cerrada[s] || sinDato(s)) continue;
    cerrada[s] = 1;
    cola.push(elev[s]!, s);
    sembradas++;
  }
  if (sembradas === 0) return null;

  /** Una celda es fuga si está en el borde del DEM o pegada a una sin dato. */
  const esFuga = (i: number): boolean => {
    const r = (i / cols) | 0, c = i % cols;
    if (r === 0 || c === 0 || r === rows - 1 || c === cols - 1) return true;
    for (const [dr, dc] of N8) if (sinDato((r + dr) * cols + (c + dc))) return true;
    return false;
  };

  while (cola.size > 0) {
    const { cota, idx } = cola.pop();
    if (esFuga(idx)) return { celdas, cota, idxFuga: idx, padre };
    const r = (idx / cols) | 0, c = idx % cols;
    celdas.push({ row: r, col: c, elev_m: elev[idx]!, cota_m: cota });
    for (const [dr, dc] of N8) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      const ni = nr * cols + nc;
      if (cerrada[ni] || sinDato(ni)) continue;
      cerrada[ni] = 1;
      padre[ni] = idx;
      // El paso 11 del algoritmo 1: la cota de llegada de la vecina es el punto
      // más alto del camino más bajo que la une al muro.
      cola.push(Math.max(cota, elev[ni]!), ni);
    }
  }

  // La cola se vació sin encontrar fuga. No debería pasar —el borde de la
  // grilla siempre existe— pero si pasa, el techo es lo último que se alcanzó.
  const ultima = celdas[celdas.length - 1];
  return ultima ? { celdas, cota: ultima.cota_m, idxFuga: -1, padre } : null;
}

/**
 * Qué le pone el techo al embalse, y dónde.
 *
 * Se decide remontando el camino que el agua recorrió hasta la fuga. Como la
 * cota de llegada es el **máximo** de elevaciones a lo largo de ese camino,
 * existe al menos una celda cuya elevación es exactamente la cota: ésa es la
 * silla de montar, el punto que el agua tuvo que trepar para salir. Si hay
 * varias —una meseta— vale la primera en el sentido del agua, o sea la más
 * cercana al muro, que es por donde empieza a pasar.
 *
 * Y de ahí sale el tipo de techo sin ninguna tolerancia:
 *
 *   · si la silla está **antes** de la celda de fuga, el agua trepó hasta esa
 *     cota y después bajó hacia afuera: hay **derrame** de verdad, y ahí va el
 *     vertedero;
 *   · si la silla **es** la celda de fuga, el punto más alto del camino es el
 *     límite del modelo: el pelo de agua llegó al borde del DEM subiendo y el
 *     vaso sigue más allá de lo que el relieve conoce.
 *
 * La distinción no es cosmética y el primer intento la erró: comparar sólo la
 * elevación de la celda de fuga contra la cota confunde los dos casos cuando el
 * borde del DEM está, por casualidad, justo a la cota de la silla. Pasó en el
 * test del muro corto, donde el agua sale por el estribo —derrame— y la celda
 * del borde a la que llega tiene exactamente esa elevación.
 */
function clasificarTope(g: GrillaElevacion, s: Salida): { tipoTope: TipoTope; silla: { row: number; col: number } | null } {
  if (s.idxFuga < 0) return { tipoTope: 'borde_del_dem', silla: null };
  const cols = g.cols;
  let cur = s.idxFuga;
  let silla = s.idxFuga;
  for (let paso = 0; paso < g.rows * g.cols; paso++) {
    if (g.elev[cur]! === s.cota) silla = cur;
    const p = s.padre[cur]!;
    if (p < 0) break;
    cur = p;
  }
  return {
    tipoTope: silla === s.idxFuga ? 'borde_del_dem' : 'derrame',
    silla: { row: (silla / cols) | 0, col: silla % cols },
  };
}

// ─── Armado del resultado ────────────────────────────────────────────────────

function armarVaso(
  g: GrillaElevacion,
  s: Salida,
  cotaEjeMin_m: number,
  ejeCeldas: ReadonlyArray<number>,
  ladoAguasArriba: 'referencia' | 'elevacion',
  advertencias: string[],
): Vaso {
  const { areaCelda, dx, dy } = dimsCelda(g);
  const paso_m = Math.max(Math.abs(dx), Math.abs(dy));
  const celdas = s.celdas;

  const prefijoElev = new Float64Array(celdas.length + 1);
  const prefijoMin = new Float64Array(celdas.length + 1);
  prefijoMin[0] = Infinity;
  let fondo = Infinity;
  for (let i = 0; i < celdas.length; i++) {
    const e = celdas[i]!.elev_m;
    prefijoElev[i + 1] = prefijoElev[i]! + e;
    prefijoMin[i + 1] = Math.min(prefijoMin[i]!, e);
    if (e < fondo) fondo = e;
  }

  const { tipoTope, silla } = clasificarTope(g, s);
  const puntoDerrame = silla ? latLngDeCelda(g, silla.row, silla.col) : null;

  // ¿El agua se va por la punta del muro? Se mide contra los extremos del eje
  // rasterizado, que es donde el muro se termina y empieza el estribo. Sólo
  // tiene sentido preguntarlo cuando hay derrame: si el techo es el borde del
  // DEM, que la silla caiga al lado del muro no dice nada del muro.
  let derramePorEstribo = false;
  if (tipoTope === 'derrame' && silla && ejeCeldas.length > 0) {
    const sIdx = silla.row * g.cols + silla.col;
    const sr = silla.row, sc = silla.col;
    for (const e of ejeCeldas) {
      const er = (e / g.cols) | 0, ec = e % g.cols;
      if (Math.abs(er - sr) <= 2 && Math.abs(ec - sc) <= 2 && sIdx !== e) { derramePorEstribo = true; break; }
    }
  }

  const tocaBorde = tipoTope === 'borde_del_dem';
  if (tocaBorde) {
    advertencias.push(
      `El vaso llega al límite del modelo de elevación a los ${s.cota.toFixed(1)} m. ` +
      'El volumen informado es un mínimo, no una estimación: hay que ampliar la ventana de relieve.',
    );
  }
  if (celdas.length < CELDAS_MINIMAS_VASO) {
    advertencias.push(
      `El vaso entra en ${celdas.length} celdas de ${paso_m.toFixed(0)} m. ` +
      'Con tan pocas celdas la forma del vaso es la de la grilla y no la del terreno.',
    );
  }
  if (derramePorEstribo) {
    advertencias.push(
      'El agua se derrama por la punta del muro, no por una silla de montar del vaso. ' +
      'Eso no se arregla con un vertedero: hay que alargar el muro.',
    );
  }

  return {
    celdas, prefijoElev, prefijoMin,
    cotaFondo_m: Number.isFinite(fondo) ? fondo : cotaEjeMin_m,
    cotaDerrame_m: s.cota,
    tipoTope,
    puntoDerrame,
    derramePorEstribo,
    tocaBorde,
    cotaEjeMin_m,
    areaCelda_m2: areaCelda,
    paso_m,
    ladoAguasArriba,
    advertencias,
    fuente: FUENTE_PRIORITY_FLOOD,
  };
}

// ─── Consulta a un nivel ─────────────────────────────────────────────────────

/** Cuántas celdas del vaso tienen cota de llegada ≤ `nivel` (búsqueda binaria). */
function celdasHasta(v: Vaso, nivel: number): number {
  let lo = 0, hi = v.celdas.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (v.celdas[mid]!.cota_m <= nivel) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/**
 * El vaso a un nivel de agua.
 *
 * Es exacto y no interpolado: el volumen a cota `L` es `Σ (L − elev)` sobre las
 * celdas que el agua alcanza a esa cota, y con las celdas ya ordenadas por cota
 * de llegada eso es una búsqueda binaria más una resta de sumas acumuladas. Por
 * eso el slider de nivel puede consultar sin recalcular nada: el recorrido del
 * terreno se hizo una sola vez.
 */
export function nivelVaso(v: Vaso, nivel_m: number): NivelVaso {
  const k = celdasHasta(v, nivel_m);
  const area = k * v.areaCelda_m2;
  const volumen = k > 0 ? (nivel_m * k - v.prefijoElev[k]!) * v.areaCelda_m2 : 0;
  const minElev = k > 0 ? v.prefijoMin[k]! : nivel_m;
  return {
    nivel_m,
    volumen_m3:       Math.max(0, Math.round(volumen)),
    area_inundada_m2: Math.round(area),
    prof_max_m:       Math.round(Math.max(0, nivel_m - minElev) * 10) / 10,
    prof_media_m:     area > 0 ? Math.round((volumen / area) * 10) / 10 : 0,
    profEnMuro_m:     Math.round(Math.max(0, nivel_m - v.cotaEjeMin_m) * 10) / 10,
    celdas:           k,
    derrama:          nivel_m > v.cotaDerrame_m,
  };
}

// ─── Inundar desde un punto (depresión natural, sin obra) ────────────────────

/**
 * El vaso de una depresión natural: se inunda desde el punto dado, sin muro.
 *
 * Sirve para una hoya que ya está —una laguna, un bajo— y es también la forma
 * de probar el motor contra un caso resuelto, donde el agua la contiene el
 * propio pozo y no hay obra que excluir.
 */
export function vasoDesdePunto(
  g: GrillaElevacion,
  punto: { lat: number; lng: number },
): Vaso | null {
  if (g.rows < 3 || g.cols < 3) return null;
  const celda = celdaDePunto(g, punto);
  if (!celda) return null;
  const idx = celda.row * g.cols + celda.col;
  const s = inundar(g, [idx], null);
  if (!s) return null;
  const elev = g.elev[idx]!;
  return armarVaso(g, s, elev, [], 'referencia', []);
}

// ─── Inundar desde el muro ───────────────────────────────────────────────────

export interface Muro {
  a: { lat: number; lng: number };
  b: { lat: number; lng: number };
}

export interface OpcionesVaso {
  /**
   * Un punto que está, con seguridad, del lado del agua. El centroide del
   * polígono dibujado sirve y es lo que usa el panel: el usuario trazó el
   * espejo alrededor del vaso y eligió uno de sus lados como muro, así que el
   * interior del polígono **es** aguas arriba. Sin esto el lado se decide
   * comparando la elevación media de las dos bandas paralelas al eje, que es
   * correcto en un valle pero ambiguo en un lomo.
   */
  referenciaAguasArriba?: { lat: number; lng: number };
}

/** Celdas que atraviesa el eje del muro, sin repetir. */
function rasterizarEje(g: GrillaElevacion, muro: Muro, paso_m: number): number[] {
  const latMid = (g.latMin + g.latMax) / 2 * Math.PI / 180;
  const dxm = (muro.b.lng - muro.a.lng) * 111_320 * Math.cos(latMid);
  const dym = (muro.b.lat - muro.a.lat) * 111_320;
  const largo = Math.hypot(dxm, dym);
  const n = Math.max(2, Math.ceil((largo / Math.max(paso_m, 0.1)) * 2) + 1);
  const vistas = new Set<number>();
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const p = { lat: muro.a.lat + (muro.b.lat - muro.a.lat) * t, lng: muro.a.lng + (muro.b.lng - muro.a.lng) * t };
    const celda = celdaDePunto(g, p);
    if (!celda) continue;
    const idx = celda.row * g.cols + celda.col;
    if (vistas.has(idx)) continue;
    vistas.add(idx);
    out.push(idx);
  }
  return out;
}

// ─── De qué lado del muro está el agua ───────────────────────────────────────

/**
 * Qué lado del eje del muro es aguas arriba, y qué celdas ocupa ese eje.
 *
 * Está afuera de `vasoDesdeMuro` porque hay dos cálculos que necesitan la misma
 * respuesta y no pueden discrepar: el vaso —que siembra la cola del lado del
 * agua— y el lado del vertedero, que tiene que salir del muro hacia aguas
 * **abajo** y seguir el agua hasta el cauce. Dos definiciones de «aguas arriba»
 * sobre el mismo muro se separan en cuanto una de las dos cambie, y el síntoma
 * sería que la app marca el vertedero adentro del embalse. Es el mismo motivo
 * por el que `N8` y `dimsCelda` se importan de `cuencaHidro` en vez de
 * redefinirse acá.
 */
export interface LadoDelMuro {
  /** +1 o −1. Un punto está aguas arriba cuando `ladoDe(p)` tiene este signo. */
  signo:            number;
  /**
   * Producto escalar del punto con la perpendicular al eje, en metros. El signo
   * dice el lado y no depende de en qué punto del eje se mire; el valor
   * absoluto es la distancia al eje prolongado.
   */
  ladoDe:           (lat: number, lng: number) => number;
  /** Cómo se decidió el lado. Ver `OpcionesVaso.referenciaAguasArriba`. */
  modo:             'referencia' | 'elevacion';
  /** Todas las celdas que el eje atraviesa, con dato o sin él. */
  eje:              readonly number[];
  /** Las que tienen elevación: las únicas que se pueden sembrar o medir. */
  ejeConDato:       readonly number[];
  /** Terreno natural más bajo bajo el eje. */
  cotaEjeMin_m:     number;
  /** Largo del eje en metros. */
  largoEje_m:       number;
  advertencias:     string[];
}

export function ladoAguasArribaDeMuro(
  g: GrillaElevacion,
  muro: Muro,
  opciones?: OpcionesVaso,
): LadoDelMuro | null {
  const { rows, cols, elev } = g;
  if (rows < 3 || cols < 3) return null;
  const { dx, dy } = dimsCelda(g);
  const paso_m = Math.max(Math.abs(dx), Math.abs(dy));

  const eje = rasterizarEje(g, muro, paso_m);
  const ejeConDato = eje.filter(i => !Number.isNaN(elev[i]!));
  if (ejeConDato.length === 0) return null;

  const advertencias: string[] = [];
  if (ejeConDato.length < CELDAS_MINIMAS_MURO) {
    advertencias.push(
      `El eje del muro ocupa ${ejeConDato.length} celda(s) de ${paso_m.toFixed(0)} m: ` +
      'más corto que el paso de la grilla, el cierre no está representado en el relieve.',
    );
  }

  let cotaEjeMin = Infinity;
  for (const i of ejeConDato) { const e = elev[i]!; if (e < cotaEjeMin) cotaEjeMin = e; }

  // Perpendicular al eje, en metros y después en pasos de grilla. El signo del
  // producto escalar dice el lado, sin depender de en qué punto del eje se mire.
  const latMid = (g.latMin + g.latMax) / 2 * Math.PI / 180;
  const mPorLng = 111_320 * Math.cos(latMid);
  const dxm = (muro.b.lng - muro.a.lng) * mPorLng;
  const dym = (muro.b.lat - muro.a.lat) * 111_320;
  const largoEje = Math.hypot(dxm, dym);
  if (!(largoEje > 0)) return null;
  const perpX = -dym / largoEje, perpY = dxm / largoEje;

  const ladoDe = (lat: number, lng: number): number => {
    const x = (lng - muro.a.lng) * mPorLng, y = (lat - muro.a.lat) * 111_320;
    return perpX * x + perpY * y;
  };

  let signo = 0;
  let modo: 'referencia' | 'elevacion' = 'referencia';
  const ref = opciones?.referenciaAguasArriba;
  if (ref) {
    const s = ladoDe(ref.lat, ref.lng);
    if (s !== 0) signo = s > 0 ? 1 : -1;
  }

  if (signo === 0) {
    // Sin referencia: aguas arriba es el lado que SUBE. Un muro cruza el valle,
    // así que perpendicular al eje está la dirección del valle: aguas arriba el
    // fondo remonta hacia la cabecera, aguas abajo cae.
    modo = 'elevacion';
    const dRow = perpY / Math.abs(dy || 1), dCol = perpX / Math.abs(dx || 1);
    const norma = Math.max(Math.abs(dRow), Math.abs(dCol)) || 1;
    const pr = dRow / norma, pc = dCol / norma;
    const media = (sg: number): number => {
      let suma = 0, cuenta = 0;
      for (const i of ejeConDato) {
        const r0 = (i / cols) | 0, c0 = i % cols;
        for (let k = 1; k <= 3; k++) {
          const r = Math.round(r0 + sg * pr * k), c = Math.round(c0 + sg * pc * k);
          if (r < 0 || c < 0 || r >= rows || c >= cols) continue;
          const e = elev[r * cols + c]!;
          if (Number.isNaN(e)) continue;
          suma += e; cuenta++;
        }
      }
      return cuenta > 0 ? suma / cuenta : NaN;
    };
    const mPos = media(1), mNeg = media(-1);
    if (Number.isNaN(mPos) && Number.isNaN(mNeg)) return null;
    if (Number.isNaN(mNeg) || mPos > mNeg) signo = 1; else signo = -1;
    if (!Number.isNaN(mPos) && !Number.isNaN(mNeg)) {
      if (Math.abs(mPos - mNeg) < 0.5) {
        advertencias.push(
          'Los dos lados del muro tienen casi la misma cota: el relieve no alcanza para saber de qué lado ' +
          'queda el agua. Conviene dibujar el espejo para que el cálculo lo deduzca del polígono.',
        );
      }
      if (Math.max(mPos, mNeg) < cotaEjeMin) {
        advertencias.push(
          'El terreno baja de los dos lados del eje elegido: ahí no hay vaso que cerrar, ' +
          'el muro está sobre un lomo y no sobre un cierre de valle.',
        );
      }
    }
  }

  return { signo, ladoDe, modo, eje, ejeConDato, cotaEjeMin_m: cotaEjeMin, largoEje_m: largoEje, advertencias };
}

/**
 * El vaso que cierra un muro, y hasta dónde se puede llenar.
 *
 * El polígono dibujado deja de definir el volumen: pasa a ser lo que siempre
 * debió ser, una ayuda visual y —por su centroide— la forma de saber de qué
 * lado del muro está el agua.
 */
export function vasoDesdeMuro(g: GrillaElevacion, muro: Muro, opciones?: OpcionesVaso): Vaso | null {
  const { rows, cols, elev } = g;
  if (rows < 3 || cols < 3) return null;

  const lado = ladoAguasArribaDeMuro(g, muro, opciones);
  if (!lado) return null;
  const { signo, ladoDe, eje, ejeConDato, cotaEjeMin_m: cotaEjeMin, advertencias } = lado;

  const obra = new Uint8Array(rows * cols);
  for (const i of eje) obra[i] = 1;

  // ── Semillas: las celdas pegadas al muro, del lado del agua ───────────────
  const semillas: number[] = [];
  const yaSemilla = new Set<number>();
  for (const i of ejeConDato) {
    const r0 = (i / cols) | 0, c0 = i % cols;
    for (const [dr, dc] of N8) {
      const r = r0 + dr, c = c0 + dc;
      if (r < 0 || c < 0 || r >= rows || c >= cols) continue;
      const ni = r * cols + c;
      if (obra[ni] || Number.isNaN(elev[ni]!) || yaSemilla.has(ni)) continue;
      const p = latLngDeCelda(g, r, c);
      const s = ladoDe(p.lat, p.lng);
      if (s * signo <= 0) continue;
      yaSemilla.add(ni);
      semillas.push(ni);
    }
  }
  if (semillas.length === 0) return null;

  const salida = inundar(g, semillas, obra);
  if (!salida) return null;

  return armarVaso(g, salida, cotaEjeMin, ejeConDato, lado.modo, advertencias);
}

// ─── Comparación con el cálculo por polígono ─────────────────────────────────

export interface ComparacionVaso {
  /** Volumen del vaso real (m³) al nivel pedido. */
  volumenMuro_m3:    number;
  /** Volumen que entra en el polígono dibujado (m³) al mismo nivel. */
  volumenPoligono_m3: number;
  areaMuro_m2:       number;
  areaPoligono_m2:   number;
  /** Cociente vaso real ÷ polígono. > 1 = el polígono se queda corto. */
  razonVolumen:      number;
  /** Qué hay que leer de la diferencia, en una línea. */
  lectura:           string;
}

/**
 * Qué dice la diferencia entre los dos cálculos.
 *
 * Mientras los dos convivan —paso 2 del plan— esta es la línea que convierte la
 * discrepancia en información en vez de en una duda: si el vaso real es mucho
 * más grande, el usuario dibujó de menos y la app encontró una hoya que él no
 * vio; si es mucho más chico, dibujó de más y parte de lo que trazó no se
 * inunda.
 */
export function compararConPoligono(p: {
  nivelMuro: NivelVaso;
  volumenPoligono_m3: number;
  areaPoligono_m2: number;
}): ComparacionVaso {
  const vm = p.nivelMuro.volumen_m3, vp = p.volumenPoligono_m3;
  const razon = vp > 0 ? vm / vp : 0;
  const ha = (m2: number) => (m2 / 10_000).toLocaleString('es-AR', { maximumFractionDigits: 2 });
  let lectura: string;
  if (vp <= 0) {
    lectura = 'El polígono no embalsa nada a este nivel; el vaso real sí.';
  } else if (razon >= 1.15) {
    lectura = `El agua llega más allá de lo que dibujaste: el vaso real son ${ha(p.nivelMuro.area_inundada_m2)} ha ` +
      `contra las ${ha(p.areaPoligono_m2)} del polígono. Es terreno que el muro inunda igual.`;
  } else if (razon <= 0.85) {
    lectura = `Parte de lo que dibujaste no se inunda: el vaso real son ${ha(p.nivelMuro.area_inundada_m2)} ha ` +
      `contra las ${ha(p.areaPoligono_m2)} del polígono. El agua no llega hasta ahí.`;
  } else {
    lectura = 'Los dos cálculos coinciden: el polígono que dibujaste sigue bastante bien el borde del agua.';
  }
  return {
    volumenMuro_m3: vm,
    volumenPoligono_m3: vp,
    areaMuro_m2: p.nivelMuro.area_inundada_m2,
    areaPoligono_m2: p.areaPoligono_m2,
    razonVolumen: Math.round(razon * 100) / 100,
    lectura,
  };
}
