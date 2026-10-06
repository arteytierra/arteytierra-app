/**
 * Validar el patrón de cultivo contra el terreno, en vez de afirmarlo.
 *
 * ── Qué cambia respecto de lo que ya había ──────────────────────────────────
 *
 * `generarPatronCultivo` **dice** hacia dónde deriva cada tramo de surco. Nadie
 * lo verifica. Y el modo de decirlo tiene tres límites que no se veían:
 *
 * 1. **La dirección sale de D8, que sólo tiene ocho direcciones.** El lado al
 *    que deriva el surco se decide mirando cómo cambia la acumulación de flujo
 *    a lo largo de la curva de nivel, y esa acumulación se calcula con el
 *    método de dirección única: cada celda manda toda su agua a uno de sus ocho
 *    vecinos. Tarboton lo enuncia como la objeción central al método:
 *
 *      «The D8 approach has disadvantages arising from the discretization of
 *      flow into only one of eight possible directions, separated by 45°.»
 *
 *    Ocho direcciones separadas por 45° quieren decir que una ladera que mira
 *    al 22,5° se resuelve como si mirara al 0° o al 45°. Ese redondeo es el
 *    «grid bias» del paper, y el reemplazo que propone es el que da nombre a
 *    esta etapa: **ocho facetas triangulares** alrededor de cada celda, la
 *    pendiente de cada una resuelta como plano exacto por tres puntos, y la
 *    dirección del terreno como la del vector más empinado de las ocho. No hay
 *    redondeo a ocho rumbos: el ángulo es continuo entre 0 y 2π.
 *
 * 2. **El veredicto se promedia sobre todo el patrón.** `resumirPatron` suma
 *    largos: la fracción que excede el techo es largo excedido sobre largo
 *    total. Pero el estándar de laboreo en contorno no limita un promedio,
 *    limita **cada surco**: «The maximum row grade must not exceed one-half of
 *    the up-and-down-hill slope percent […] with a maximum 4-percent row
 *    grade». Un surco entero fuera de grado pesa 1/N del largo del patrón, así
 *    que con 40 líneas **diez pueden estar enteras fuera de grado y el patrón
 *    sigue leyéndose «keyline»**: 10/40 = 0,25, y el umbral del veredicto es
 *    *mayor* que 0,25. De ahí la segunda mitad de esta etapa: informar fila por
 *    fila y no un promedio.
 *
 * 3. **Nadie se fijó si el surco drena.** La deriva se medía en valor absoluto,
 *    tramo por tramo. Un surco que baja hacia su propio medio desde los dos
 *    extremos tiene deriva «dentro de la banda» en todos sus tramos y **no
 *    drena a ninguna parte**: el agua se junta en el medio. El estándar pide lo
 *    contrario con todas las letras —«Design the row grades with positive row
 *    drainage»— y ese punto bajo del surco, cuando cae en una vaguada, es
 *    exactamente el lugar donde el método de Yeomans no quiere que el agua se
 *    junte. Un sumidero adentro del surco no es un detalle de dibujo: es la
 *    falla que el patrón venía a evitar.
 *
 * ── Y el límite que ninguna de las tres ve: el modelo de elevación ──────────
 *
 * Esto es lo que apareció al escribir la validación y vale más que las tres.
 * El piso publicado de la banda es **0,2 %**. Sobre un surco de 300 m eso son
 * 60 cm de desnivel. El modelo satelital que la app usa por defecto no resuelve
 * 60 cm: la propia app ya se impone un intervalo de curvas de 2 m porque abajo
 * de eso dibuja ruido de sensor. Con 2 m de resolución vertical, para que un
 * 0,2 % sea distinguible de cero hace falta **un kilómetro de surco**.
 *
 * Y al revés: medir la deriva tramo por tramo —tramos de 4 a 10 m— sobre un
 * modelo de 30 m de paso es medir interpolación. La unidad más chica de la que
 * este dato puede hablar es **el surco entero**. Así que informar fila por fila
 * no es sólo lo que pide el estándar: es lo único que el dato aguanta.
 *
 * Por eso cada fila trae su propia `resolucion_pct` —la deriva más chica que
 * este modelo puede distinguir en ese largo— y cuando la deriva medida queda
 * por debajo, acequia **no imprime el número**: dice que no lo puede medir. Es
 * la regla de la casa: un número plausible y equivocado hace más daño que un
 * hueco declarado.
 *
 * ── Qué hay acá y qué no ────────────────────────────────────────────────────
 *
 * Acá viven las facetas triangulares, el perfil de un surco y el veredicto por
 * fila. El patrón se sigue dibujando en `lib/keyline.ts`, que llama a esto
 * después de dibujarlo. Lo que este módulo NO hace: no corrige el patrón —no
 * mueve una línea—, no sabe de suelos ni de implementos, y no reemplaza ir a
 * verificar con nivel. Mide lo que el modelo de elevación permite medir y dice
 * hasta dónde llega.
 *
 * Fuentes:
 *   · Tarboton, D. G. (1997), «A new method for the determination of flow
 *     directions and upslope areas in grid digital elevation models», Water
 *     Resources Research 33(2), 309-319 — ecuaciones (1) a (6) y Tabla 1.
 *   · USDA NRCS, Conservation Practice Standard 330 «Contour Farming», NHCP,
 *     octubre 2017 — el grado de surco es una propiedad de cada surco.
 *   · P.A. Yeomans, «Water for Every Farm» — por qué un punto bajo adentro del
 *     surco es el problema y no el detalle.
 */
import { elevacionEn } from './cutfill';
import { pasoEfectivoM, type GrillaElevacion } from './grillaElevacion';
import { intervaloConfiableRemoto } from './curvasNivel';
import type { BandaDeriva } from './keylineGeometria';

export const FUENTE_TARBOTON =
  'Tarboton, D. G. (1997), «A new method for the determination of flow directions and upslope areas in grid '
  + 'digital elevation models», Water Resources Research 33(2), 309-319.';

// ─── 1 · El método de las ocho facetas triangulares (D∞) ─────────────────────

/** Direcciones que puede representar el método de dirección única. */
export const D8_DIRECCIONES = 8;
/** Grados entre dos direcciones consecutivas de D8. Es el número del paper. */
export const D8_SEPARACION_DEG = 360 / D8_DIRECCIONES;
/**
 * Error angular máximo de D8, en grados.
 *
 * El paper publica la separación (45°); la mitad es la desviación máxima de una
 * ladera que cae justo entre dos direcciones. La división es nuestra, el 45 es
 * de la fuente.
 */
export const D8_ERROR_MAX_DEG = D8_SEPARACION_DEG / 2;

/**
 * Una de las ocho facetas triangulares de la Tabla 1 del paper.
 *
 * `e1` es el vecino lateral (cardinal) y `e2` el diagonal, los dos como
 * desplazamiento `(dr, dc)` sobre la grilla. **Ojo con el signo de la fila:** la
 * Tabla 1 está escrita en convención de imagen, donde `i−1` es el norte; las
 * grillas de acequia tienen la fila 0 en `latMin`, así que acá el norte es
 * `dr = +1` y los desplazamientos de fila van con el signo cambiado respecto de
 * la tabla. Las columnas y los factores `ac`/`af` son los de la fuente.
 */
export interface FacetaDinf {
  e1: readonly [number, number];
  e2: readonly [number, number];
  /** Constante de la Tabla 1: cuántos cuartos de vuelta se le suman al ángulo. */
  ac: number;
  /** Multiplicador de la Tabla 1: +1 o −1 según el sentido de la faceta. */
  af: 1 | -1;
}

/** Tabla 1 del paper, con el signo de fila adaptado a la grilla de acequia. */
export const FACETAS_DINF: readonly FacetaDinf[] = [
  { e1: [0, 1],  e2: [1, 1],   ac: 0, af:  1 },   // E  → NE
  { e1: [1, 0],  e2: [1, 1],   ac: 1, af: -1 },   // N  → NE
  { e1: [1, 0],  e2: [1, -1],  ac: 1, af:  1 },   // N  → NO
  { e1: [0, -1], e2: [1, -1],  ac: 2, af: -1 },   // O  → NO
  { e1: [0, -1], e2: [-1, -1], ac: 2, af:  1 },   // O  → SO
  { e1: [-1, 0], e2: [-1, -1], ac: 3, af: -1 },   // S  → SO
  { e1: [-1, 0], e2: [-1, 1],  ac: 3, af:  1 },   // S  → SE
  { e1: [0, 1],  e2: [-1, 1],  ac: 4, af: -1 },   // E  → SE
];

export interface PendienteFaceta {
  /** Ángulo dentro de la faceta, en radianes, medido desde el lado `e0→e1`. */
  r_rad: number;
  /** Pendiente de bajada (caída/distancia). Negativa = la faceta sube. */
  s: number;
  /** Si el vector cayó fuera del rango de la faceta y hubo que pegarlo a un borde. */
  borde: 'ninguno' | 'lateral' | 'diagonal';
}

/**
 * Pendiente y dirección de bajada sobre **una** faceta triangular.
 *
 * Son las ecuaciones (1) a (5) del paper, al pie:
 *
 *   s1 = (e0 − e1) / d1        s2 = (e1 − e2) / d2
 *   r  = atan(s2 / s1)         s  = √(s1² + s2²)
 *
 * y, si `r` cae fuera del rango `(0, atan(d2/d1))` de la faceta, se lo lleva al
 * borde que corresponde: `r = 0` con `s = s1` por un lado, y
 * `r = atan(d2/d1)` con `s = (e0 − e2)/√(d1² + d2²)` por el otro. Esa es la
 * frase exacta de la fuente: «If the slope vector angle is outside a facet, the
 * steepest flow direction associated with that facet is taken along the
 * steepest edge.»
 *
 * `d1` es la distancia de `e0` a `e1` y `d2` la de `e1` a `e2`. Están separadas
 * a propósito: las grillas de acequia no tienen la celda cuadrada —el paso en
 * longitud se achica con el coseno de la latitud— y meter una sola distancia
 * sería inventar un terreno que no es.
 */
export function pendienteFaceta(p: {
  e0: number; e1: number; e2: number; d1: number; d2: number;
}): PendienteFaceta {
  const { e0, e1, e2, d1, d2 } = p;
  const s1 = (e0 - e1) / d1;
  const s2 = (e1 - e2) / d2;
  const rMax = Math.atan2(d2, d1);
  let r = Math.atan2(s2, s1);
  let s = Math.hypot(s1, s2);
  let borde: PendienteFaceta['borde'] = 'ninguno';
  if (r < 0) {
    r = 0; s = s1; borde = 'lateral';
  } else if (r > rMax) {
    r = rMax; s = (e0 - e2) / Math.hypot(d1, d2); borde = 'diagonal';
  }
  return { r_rad: r, s, borde };
}

export interface DireccionDinf {
  /** Rumbo del agua, en radianes antihorario desde el este (0 a 2π). */
  rumbo_rad: number;
  /** El mismo rumbo en grados, que es como se lee. */
  rumbo_deg: number;
  /** Pendiente de bajada (caída/distancia, o sea la tangente del ángulo). */
  pendiente: number;
  /** Cuál de las ocho facetas ganó (1 a 8, en el orden de la Tabla 1). */
  faceta: number;
}

const DOS_PI = Math.PI * 2;
const aGrados = (rad: number) => (rad * 180) / Math.PI;

/**
 * Dirección del agua en una celda por el método de las facetas triangulares.
 *
 * `z(dr, dc)` devuelve la cota del vecino —`NaN` si no hay dato—, `dxM` es el
 * paso este-oeste en metros y `dyM` el norte-sur. Devuelve `null` cuando
 * ninguna faceta baja, que es el caso que el paper marca como «unresolved»: un
 * pozo o un llano. No se lo rellena acá a propósito —rellenar es decidir— y el
 * que llama avisa.
 *
 * El orden de recorrido es el de la tabla y en caso de empate gana la primera,
 * como en la fuente: «in the case of ties (facets with equal slope) picks the
 * first one. In nature ties are extremely rare».
 */
export function direccionDinf(
  z: (dr: number, dc: number) => number,
  dxM: number,
  dyM: number,
): DireccionDinf | null {
  const e0 = z(0, 0);
  if (!Number.isFinite(e0)) return null;
  let mejor: DireccionDinf | null = null;
  for (let i = 0; i < FACETAS_DINF.length; i++) {
    const f = FACETAS_DINF[i]!;
    const e1 = z(f.e1[0], f.e1[1]);
    const e2 = z(f.e2[0], f.e2[1]);
    if (!Number.isFinite(e1) || !Number.isFinite(e2)) continue;
    // El lado e0→e1 es cardinal: si va en columna mide dxM, si va en fila dyM.
    const d1 = f.e1[1] !== 0 ? dxM : dyM;
    const d2 = f.e1[1] !== 0 ? dyM : dxM;
    const { r_rad, s } = pendienteFaceta({ e0, e1, e2, d1, d2 });
    if (!(s > 0)) continue;
    if (mejor && s <= mejor.pendiente) continue;
    const rg = ((f.af * r_rad + f.ac * (Math.PI / 2)) % DOS_PI + DOS_PI) % DOS_PI;
    mejor = { rumbo_rad: rg, rumbo_deg: aGrados(rg), pendiente: s, faceta: i + 1 };
  }
  return mejor;
}

/** Los ocho vecinos, en el mismo orden angular que las facetas. */
const VECINOS_D8: ReadonlyArray<readonly [number, number]> = [
  [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1],
];

/**
 * Lo mismo por el método de dirección única, para poder comparar.
 *
 * No está acá para usarlo: está para **medir cuánto se desvía** en el terreno
 * que se está mirando. El paper afirma que los dos coinciden cuando la ladera
 * cae sobre un eje de la grilla —«when the topographic slope is aligned with
 * the grid axes, cardinal or diagonal, the D∞ procedure gives the same results
 * as D8, and both are correct»— y que se separan en todo lo demás.
 */
export function rumboD8(
  z: (dr: number, dc: number) => number,
  dxM: number,
  dyM: number,
): DireccionDinf | null {
  const e0 = z(0, 0);
  if (!Number.isFinite(e0)) return null;
  let mejor: DireccionDinf | null = null;
  for (const [dr, dc] of VECINOS_D8) {
    const e = z(dr, dc);
    if (!Number.isFinite(e)) continue;
    const ex = dc * dxM, ey = dr * dyM;
    const s = (e0 - e) / Math.hypot(ex, ey);
    if (!(s > 0) || (mejor && s <= mejor.pendiente)) continue;
    const rg = ((Math.atan2(ey, ex) % DOS_PI) + DOS_PI) % DOS_PI;
    mejor = { rumbo_rad: rg, rumbo_deg: aGrados(rg), pendiente: s, faceta: 0 };
  }
  return mejor;
}

/** Diferencia angular absoluta entre dos rumbos, en grados (0 a 180). */
export function desvioAngular_deg(a_deg: number, b_deg: number): number {
  return Math.abs((((a_deg - b_deg + 180) % 360) + 360) % 360 - 180);
}

// ─── 2 · Caminar el agua sobre la grilla ─────────────────────────────────────

const R_TIERRA = 111_320;

/** Paso este-oeste y norte-sur de una grilla, en metros. */
export function pasosDeGrilla(g: GrillaElevacion): { dxM: number; dyM: number } {
  const latMed = ((g.latMin + g.latMax) / 2) * Math.PI / 180;
  return {
    dxM: ((g.lngMax - g.lngMin) / Math.max(1, g.cols - 1)) * R_TIERRA * Math.cos(latMed),
    dyM: ((g.latMax - g.latMin) / Math.max(1, g.rows - 1)) * R_TIERRA,
  };
}

export type FinDeTraza =
  /** Llegó al eje de un valle: el agua se juntó con la que ya corría. */
  | 'eje_de_valle'
  /** Salió de la grilla o del predio. */
  | 'borde'
  /** Se quedó sin pendiente: un llano o un pozo del modelo. */
  | 'sin_pendiente'
  /** Se acabaron los pasos: sigue bajando, pero ya no se mira más. */
  | 'limite';

export interface Traza {
  puntos: Array<{ lat: number; lng: number }>;
  largo_m: number;
  caida_m: number;
  final: FinDeTraza;
}

export interface OpcionesTraza {
  paso_m?: number;
  maxPasos?: number;
  /** Si el punto cae sobre un eje de valle (la app lo arma de la acumulación). */
  esEjeDeValle?: (lat: number, lng: number) => boolean;
}

/**
 * Suelta una gota en un punto y la sigue pendiente abajo por el método de las
 * facetas, hasta que se junta con un cauce, se va del terreno o se acaban los
 * pasos.
 *
 * Es la parte «verificar» de la etapa: el patrón afirma que el surco entrega el
 * agua hacia la ladera, y esto va y mira dónde termina esa agua. El paso por
 * defecto es el paso efectivo de la grilla, porque avanzar menos que eso es
 * recorrer la interpolación.
 */
export function trazaDinf(
  g: GrillaElevacion,
  inicio: { lat: number; lng: number },
  op: OpcionesTraza = {},
): Traza {
  const { dxM, dyM } = pasosDeGrilla(g);
  const paso = Math.max(1, op.paso_m ?? pasoEfectivoM(g));
  const maxPasos = op.maxPasos ?? 400;
  const stepLat = (g.latMax - g.latMin) / Math.max(1, g.rows - 1);
  const stepLng = (g.lngMax - g.lngMin) / Math.max(1, g.cols - 1);

  const zEn = (lat: number, lng: number) => elevacionEn(g, lat, lng) ?? NaN;
  const puntos: Array<{ lat: number; lng: number }> = [{ ...inicio }];
  const z0 = zEn(inicio.lat, inicio.lng);
  let lat = inicio.lat, lng = inicio.lng, largo = 0;
  let final: FinDeTraza = 'limite';

  for (let i = 0; i < maxPasos; i++) {
    if (op.esEjeDeValle?.(lat, lng) && i > 0) { final = 'eje_de_valle'; break; }
    const z3x3 = (dr: number, dc: number) => zEn(lat + dr * stepLat, lng + dc * stepLng);
    const d = direccionDinf(z3x3, dxM, dyM);
    if (!d) {
      // Sin dirección hay dos motivos distintos y no da lo mismo cuál: si a la
      // ventana de 3×3 le falta un vecino, el agua se está yendo del modelo;
      // si están los nueve, es un llano o un pozo de verdad.
      let completa = true;
      for (let dr = -1; dr <= 1 && completa; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (!Number.isFinite(z3x3(dr, dc))) { completa = false; break; }
        }
      }
      final = completa ? 'sin_pendiente' : 'borde';
      break;
    }
    const nLat = lat + (Math.sin(d.rumbo_rad) * paso) / R_TIERRA;
    const nLng = lng + (Math.cos(d.rumbo_rad) * paso) / (R_TIERRA * Math.cos(lat * Math.PI / 180));
    if (!Number.isFinite(zEn(nLat, nLng))) { final = 'borde'; break; }
    lat = nLat; lng = nLng; largo += paso;
    puntos.push({ lat, lng });
  }

  const zF = zEn(lat, lng);
  return {
    puntos,
    largo_m: Math.round(largo),
    caida_m: Number.isFinite(z0) && Number.isFinite(zF) ? Math.round((z0 - zF) * 100) / 100 : 0,
    final,
  };
}

// ─── 3 · El perfil de un surco ───────────────────────────────────────────────

export interface PuntoPerfil {
  lat: number; lng: number;
  /** Cota interpolada (m). */
  z_m: number;
  /** Distancia acumulada desde el arranque del surco (m). */
  s_m: number;
}

export interface RamaDeSurco {
  largo_m: number;
  /** Caída de la rama (m), siempre positiva. */
  caida_m: number;
  /** Pendiente a lo largo del surco en esa rama (%). */
  deriva_pct: number;
  /** Índice del punto del perfil por donde esta rama entrega el agua. */
  salida: number;
}

export interface SalidaDeSurco {
  lat: number; lng: number;
  z_m: number;
  /** `extremo` = el agua se va del surco. `sumidero` = se queda adentro. */
  tipo: 'extremo' | 'sumidero';
  /** Sólo en los sumideros: cuánto hay que llenar para que rebalse (m). */
  prominencia_m: number;
}

export interface PerfilSurco {
  puntos: PuntoPerfil[];
  largo_m: number;
  desnivel_m: number;
  ramas: RamaDeSurco[];
  salidas: SalidaDeSurco[];
  /** Resolución vertical del modelo usada para filtrar (m). */
  resolucion_m: number;
  /** La deriva más chica que este modelo distingue en este largo (%). */
  resolucion_pct: number;
  /** Deriva de la rama más empinada (%), que es la que el estándar limita. */
  deriva_max_pct: number;
  /** Deriva media ponderada por largo de rama (%). */
  deriva_media_pct: number;
  /**
   * `false` cuando el relieve a lo largo del surco entero no llega a la
   * resolución vertical del modelo. No es que el surco corra a nivel: es que
   * este modelo no puede decir si corre a nivel o no.
   */
  medible: boolean;
}

/** Distancia entre dos puntos sobre la esfera, con la aproximación plana local. */
function distLL(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const lat = ((a.lat + b.lat) / 2) * Math.PI / 180;
  return Math.hypot((b.lng - a.lng) * R_TIERRA * Math.cos(lat), (b.lat - a.lat) * R_TIERRA);
}

/** Largo total de una polilínea, en metros. */
export function largoDePolilinea(linea: ReadonlyArray<{ lat: number; lng: number }>): number {
  let L = 0;
  for (let i = 0; i + 1 < linea.length; i++) L += distLL(linea[i]!, linea[i + 1]!);
  return L;
}

/** Remuestrea una polilínea cada `paso` metros, conservando los dos extremos. */
function remuestrear(
  linea: ReadonlyArray<{ lat: number; lng: number }>,
  paso: number,
): Array<{ lat: number; lng: number; s_m: number }> {
  const out: Array<{ lat: number; lng: number; s_m: number }> = [];
  if (linea.length === 0) return out;
  let acumulado = 0, sobrante = 0;
  out.push({ ...linea[0]!, s_m: 0 });
  for (let i = 0; i + 1 < linea.length; i++) {
    const a = linea[i]!, b = linea[i + 1]!;
    const d = distLL(a, b);
    if (d <= 0) continue;
    let t = sobrante === 0 && i === 0 ? paso : sobrante;
    while (t < d) {
      const f = t / d;
      out.push({ lat: a.lat + (b.lat - a.lat) * f, lng: a.lng + (b.lng - a.lng) * f, s_m: acumulado + t });
      t += paso;
    }
    sobrante = t - d;
    acumulado += d;
  }
  const ult = linea[linea.length - 1]!;
  if (out.length === 0 || acumulado - out[out.length - 1]!.s_m > 0.01) {
    out.push({ ...ult, s_m: acumulado });
  }
  return out;
}

/**
 * Extremos del perfil que están por encima del ruido del modelo.
 *
 * Un perfil leído de un modelo de elevación tiene decenas de picos y valles de
 * pocos centímetros que son del dato, no del terreno. El filtro es la
 * **prominencia**: cuánto hay que subir desde un mínimo para escapar de él, o
 * cuánto baja un máximo antes de volver a subir. Por debajo de la resolución
 * vertical declarada, el extremo no existe.
 *
 * Devuelve los índices ordenados, incluyendo siempre los dos extremos del
 * surco, que no son extremos del relieve sino el final del surco: ahí el agua
 * se va igual.
 */
export function extremosDelPerfil(z: readonly number[], umbral_m: number): number[] {
  const n = z.length;
  if (n < 3) return n === 0 ? [] : [0, n - 1];
  const sig = new Set<number>([0, n - 1]);
  for (let i = 1; i < n - 1; i++) {
    const zi = z[i]!;
    const esMin = zi <= z[i - 1]! && zi < z[i + 1]!;
    const esMax = zi >= z[i - 1]! && zi > z[i + 1]!;
    if (!esMin && !esMax) continue;
    let izq = zi, der = zi;
    for (let k = 0; k < i; k++) { const v = z[k]!; if (esMin ? v > izq : v < izq) izq = v; }
    for (let k = i + 1; k < n; k++) { const v = z[k]!; if (esMin ? v > der : v < der) der = v; }
    const prom = esMin ? Math.min(izq, der) - zi : zi - Math.max(izq, der);
    if (prom >= umbral_m) sig.add(i);
  }
  const lista = [...sig].sort((a, b) => a - b);
  // Que un extremo sea significativo no garantiza que la lista alterne: dos
  // mínimos seguidos quieren decir que el máximo del medio no llegó al umbral,
  // así que el del medio sobra y se queda el más hondo de los dos.
  const out: number[] = [lista[0]!];
  for (let k = 1; k < lista.length; k++) {
    const i = lista[k]!;
    const j = out[out.length - 1]!;
    if (z[i]! === z[j]!) continue;
    if (out.length >= 2) {
      const subeAhora = z[i]! > z[j]!;
      const subiaAntes = z[j]! > z[out[out.length - 2]!]!;
      if (subeAhora === subiaAntes) { out[out.length - 1] = i; continue; }
    }
    out.push(i);
  }
  if (out[out.length - 1] !== n - 1) out.push(n - 1);
  return out;
}

export interface OpcionesPerfil {
  /** Resolución vertical del modelo (m). Si falta, la que la app ya se impone. */
  resolucion_m?: number;
  /** Paso de remuestreo (m). Si falta, el paso efectivo de la grilla. */
  paso_m?: number;
}

/**
 * El perfil de un surco: por dónde baja, por dónde entrega el agua y dónde la
 * junta sin entregarla.
 *
 * Un surco no tiene «una» pendiente: tiene tantas ramas como puntos altos lo
 * partan, y cada rama entrega su agua en el punto bajo que le toca. Si ese
 * punto bajo es un extremo del surco, el agua se va. Si cae adentro, **el agua
 * se queda ahí**, y eso no se ve mirando el valor absoluto de la deriva.
 */
export function perfilDeSurco(
  linea: ReadonlyArray<{ lat: number; lng: number }>,
  g: GrillaElevacion,
  op: OpcionesPerfil = {},
): PerfilSurco | null {
  if (linea.length < 2) return null;
  const resolucion = Math.max(0.01, op.resolucion_m ?? intervaloConfiableRemoto(pasoEfectivoM(g)));
  // El paso de muestreo del perfil no es el paso del modelo, y la diferencia no
  // es una trampa: la superficie bilineal entre nodos es el modelo, así que
  // muestrearla más fino ubica mejor el punto bajo sin inventar relieve. Lo que
  // NO mejora es la cantidad de datos independientes, que sigue siendo
  // `largo / paso del modelo` — y eso es lo que `resolucion_pct` declara.
  const largoLinea = largoDePolilinea(linea);
  const paso = op.paso_m ?? Math.max(2, Math.min(pasoEfectivoM(g), largoLinea / 24));

  const crudos = remuestrear(linea, paso);
  const puntos: PuntoPerfil[] = [];
  for (const p of crudos) {
    const z = elevacionEn(g, p.lat, p.lng);
    if (z == null || !Number.isFinite(z)) continue;
    puntos.push({ lat: p.lat, lng: p.lng, z_m: z, s_m: p.s_m });
  }
  if (puntos.length < 2) return null;

  const largo = puntos[puntos.length - 1]!.s_m - puntos[0]!.s_m;
  if (!(largo > 0)) return null;
  const zs = puntos.map(p => p.z_m);
  const ext = extremosDelPerfil(zs, resolucion);

  const ramas: RamaDeSurco[] = [];
  const salidas: SalidaDeSurco[] = [];
  const vistos = new Set<number>();
  for (let k = 0; k + 1 < ext.length; k++) {
    const a = ext[k]!, b = ext[k + 1]!;
    const za = zs[a]!, zb = zs[b]!;
    const salida = za >= zb ? b : a;
    const L = Math.abs(puntos[b]!.s_m - puntos[a]!.s_m);
    const caida = Math.abs(za - zb);
    if (L > 0) ramas.push({ largo_m: L, caida_m: caida, deriva_pct: (caida / L) * 100, salida });
    if (vistos.has(salida)) continue;
    vistos.add(salida);
    const esExtremo = salida === 0 || salida === puntos.length - 1;
    // Lo que hay que llenar para que rebalse: la menor de las dos subidas.
    let izq = zs[salida]!, der = zs[salida]!;
    for (let i = 0; i < salida; i++) if (zs[i]! > izq) izq = zs[i]!;
    for (let i = salida + 1; i < zs.length; i++) if (zs[i]! > der) der = zs[i]!;
    salidas.push({
      lat: puntos[salida]!.lat, lng: puntos[salida]!.lng, z_m: zs[salida]!,
      tipo: esExtremo ? 'extremo' : 'sumidero',
      prominencia_m: esExtremo ? 0 : Math.round((Math.min(izq, der) - zs[salida]!) * 100) / 100,
    });
  }

  const largoRamas = ramas.reduce((s, r) => s + r.largo_m, 0) || 1;
  const derivaMedia = ramas.reduce((s, r) => s + r.deriva_pct * r.largo_m, 0) / largoRamas;
  const derivaMax = ramas.reduce((m, r) => Math.max(m, r.deriva_pct), 0);
  const resolucionPct = (resolucion / largo) * 100;

  return {
    puntos,
    largo_m: Math.round(largo * 10) / 10,
    desnivel_m: Math.round((Math.max(...zs) - Math.min(...zs)) * 100) / 100,
    ramas,
    salidas,
    resolucion_m: resolucion,
    resolucion_pct: Math.round(resolucionPct * 100) / 100,
    deriva_max_pct: Math.round(derivaMax * 100) / 100,
    deriva_media_pct: Math.round(derivaMedia * 100) / 100,
    medible: Math.max(...zs) - Math.min(...zs) >= resolucion,
  };
}

// ─── 4 · El veredicto, fila por fila ─────────────────────────────────────────

export type VeredictoFila =
  /** El agua se junta adentro del surco: hay un punto bajo que no desagua. */
  | 'encharca'
  /** La deriva pasa el techo publicado: el surco se vuelve un canal. */
  | 'excede'
  /** La deriva medida está por debajo de lo que el modelo resuelve. */
  | 'no_medible'
  /** Corre por debajo del piso publicado, donde el encharcamiento preocupa. */
  | 'sin_drenaje'
  /** Entrega el agua al eje de un valle, que es lo que el método evita. */
  | 'a_la_vertiente'
  /** Drena, dentro de la banda, y entrega el agua afuera del eje. */
  | 'drena';

export interface DestinoDeSalida {
  lat: number; lng: number;
  largo_m: number;
  caida_m: number;
  final: FinDeTraza;
}

export interface FilaValidada {
  /** Índice de la línea dentro del patrón. */
  i: number;
  largo_m: number;
  desnivel_m: number;
  deriva_max_pct: number;
  deriva_media_pct: number;
  resolucion_pct: number;
  medible: boolean;
  ramas: number;
  sumideros: Array<{ lat: number; lng: number; prominencia_m: number }>;
  destinos: DestinoDeSalida[];
  veredicto: VeredictoFila;
  motivo: string;
}

export interface SesgoD8 {
  celdas: number;
  desvio_medio_deg: number;
  desvio_max_deg: number;
}

export interface ValidacionPatron {
  filas: FilaValidada[];
  conteo: Record<VeredictoFila, number>;
  /** La fila peor parada, para que no la tape el promedio. */
  peor: number | null;
  /** Cuántas filas no están sanas. */
  filasFuera: number;
  /** Qué fracción del largo total representan esas filas (0–1). */
  fraccionDelLargoFuera: number;
  /** Resolución vertical del modelo con la que se midió (m). */
  resolucion_m: number;
  /** Largo de surco que haría falta para que el piso de la banda se distinga. */
  largoParaElPiso_m: number | null;
  sesgoD8: SesgoD8 | null;
  advertencias: string[];
  fuentes: string[];
}

export interface OpcionesValidacion extends OpcionesPerfil {
  esEjeDeValle?: (lat: number, lng: number) => boolean;
  /** Tope de filas a validar (las demás se saltean). Por costo, no por método. */
  maxFilas?: number;
  /** Celdas a muestrear para medir el desvío entre D8 y las facetas. */
  muestraSesgo?: number;
}

const VACIO: Record<VeredictoFila, number> = {
  encharca: 0, excede: 0, no_medible: 0, sin_drenaje: 0, a_la_vertiente: 0, drena: 0,
};

/**
 * Por qué el orden del veredicto es éste.
 *
 * Primero el agua que no sale: un surco con un punto bajo adentro no desagua,
 * y eso no se arregla con el grado. Después el grado por arriba del techo, que
 * es un problema de obra. Recién ahí si el número se puede medir, porque decir
 * «está por debajo del piso» con un modelo que no resuelve ese piso es
 * inventar. Y al final, con un surco que drena y que se puede medir, adónde
 * entrega el agua.
 */
function veredictoDeFila(
  p: PerfilSurco,
  banda: BandaDeriva,
  destinos: DestinoDeSalida[],
): { veredicto: VeredictoFila; motivo: string } {
  const sumideros = p.salidas.filter(s => s.tipo === 'sumidero');
  if (sumideros.length > 0) {
    const peor = sumideros.reduce((m, s) => (s.prominencia_m > m.prominencia_m ? s : m), sumideros[0]!);
    return {
      veredicto: 'encharca',
      motivo: `El surco baja hacia ${sumideros.length === 1 ? 'un punto' : `${sumideros.length} puntos`} de su propio `
        + `recorrido y el agua se queda ahí: hay que llenar ${peor.prominencia_m.toFixed(2)} m para que rebalse. `
        + 'La deriva puede estar dentro de la banda en todos sus tramos y no desaguar igual, que es lo que el '
        + 'estándar pide cuando dice «positive row drainage».',
    };
  }
  if (p.deriva_max_pct > banda.max_pct) {
    return {
      veredicto: 'excede',
      motivo: `Una rama corre con ${p.deriva_max_pct.toFixed(2)} % contra el techo de ${banda.max_pct.toFixed(2)} %. `
        + 'Pasado ese grado el surco deja de repartir agua y la concentra.',
    };
  }
  if (!p.medible) {
    return {
      veredicto: 'no_medible',
      motivo: `El surco varía ${p.desnivel_m.toFixed(2)} m en ${p.largo_m.toFixed(0)} m y este modelo resuelve `
        + `${p.resolucion_m.toFixed(1)} m, así que a esa escala no se distingue si sube, baja o corre a nivel: `
        + `harían falta ${p.resolucion_pct.toFixed(2)} % de deriva para despegarse del dato. El número sale de la `
        + 'cuenta pero no del terreno; eso lo dice un nivel a campo.',
    };
  }
  if (banda.min_pct > 0 && p.deriva_max_pct < banda.min_pct) {
    return {
      veredicto: 'sin_drenaje',
      motivo: `Corre con ${p.deriva_max_pct.toFixed(2)} %, por debajo del piso de ${banda.min_pct.toFixed(1)} % que `
        + 'el estándar pide donde el encharcamiento preocupa.',
    };
  }
  const alValle = destinos.find(d => d.final === 'eje_de_valle');
  if (alValle) {
    return {
      veredicto: 'a_la_vertiente',
      motivo: `El agua que sale de este surco llega al eje de un valle ${alValle.largo_m} m más abajo. Es el camino `
        + 'que el método quiere cortar: en vez de repartirse en el lomo, se suma a la que ya corre concentrada.',
    };
  }
  return {
    veredicto: 'drena',
    motivo: `Drena con ${p.deriva_max_pct.toFixed(2)} %, dentro de la banda, y entrega el agua afuera del eje.`,
  };
}

/**
 * Lo que el promedio escondía, en una frase que se puede verificar con la
 * cuenta: una fila entera fuera de grado pesa 1/N del largo del patrón.
 */
export const EL_PROMEDIO_ESCONDE_LA_FILA =
  'El veredicto del patrón suma largos: la fracción excedida es largo excedido sobre largo total. Un surco entero '
  + 'fuera de grado pesa 1/N del patrón, así que con 40 líneas diez pueden estar enteras fuera y el conjunto sigue '
  + 'leyéndose bien. El estándar no limita un promedio: limita cada surco.';

/**
 * Valida el patrón dibujado contra el terreno, surco por surco.
 *
 * Devuelve `null` si no se pudo medir ninguna fila —sin grilla útil no se
 * inventa un veredicto—.
 */
export function validarPatron(
  patron: { lineas: ReadonlyArray<ReadonlyArray<{ lat: number; lng: number }>>; banda: BandaDeriva },
  g: GrillaElevacion,
  op: OpcionesValidacion = {},
): ValidacionPatron | null {
  const resolucion = Math.max(0.01, op.resolucion_m ?? intervaloConfiableRemoto(pasoEfectivoM(g)));
  const maxFilas = op.maxFilas ?? 120;
  const filas: FilaValidada[] = [];
  const conteo: Record<VeredictoFila, number> = { ...VACIO };

  const lineas = patron.lineas.slice(0, maxFilas);
  for (let i = 0; i < lineas.length; i++) {
    const perfil = perfilDeSurco(lineas[i]!, g, { ...op, resolucion_m: resolucion });
    if (!perfil) continue;
    const destinos: DestinoDeSalida[] = [];
    for (const s of perfil.salidas) {
      if (s.tipo !== 'extremo') continue;
      const t = trazaDinf(g, { lat: s.lat, lng: s.lng }, { esEjeDeValle: op.esEjeDeValle, paso_m: op.paso_m });
      destinos.push({ lat: s.lat, lng: s.lng, largo_m: t.largo_m, caida_m: t.caida_m, final: t.final });
    }
    const { veredicto, motivo } = veredictoDeFila(perfil, patron.banda, destinos);
    conteo[veredicto]++;
    filas.push({
      i,
      largo_m: perfil.largo_m,
      desnivel_m: perfil.desnivel_m,
      deriva_max_pct: perfil.deriva_max_pct,
      deriva_media_pct: perfil.deriva_media_pct,
      resolucion_pct: perfil.resolucion_pct,
      medible: perfil.medible,
      ramas: perfil.ramas.length,
      sumideros: perfil.salidas
        .filter(s => s.tipo === 'sumidero')
        .map(s => ({ lat: s.lat, lng: s.lng, prominencia_m: s.prominencia_m })),
      destinos,
      veredicto,
      motivo,
    });
  }
  if (filas.length === 0) return null;

  const ORDEN: VeredictoFila[] = ['encharca', 'a_la_vertiente', 'excede', 'sin_drenaje', 'no_medible', 'drena'];
  const rank = (v: VeredictoFila) => ORDEN.indexOf(v);
  const peorFila = filas.reduce((m, f) => (rank(f.veredicto) < rank(m.veredicto) ? f : m), filas[0]!);
  const sanas = new Set<VeredictoFila>(['drena', 'no_medible']);
  const fuera = filas.filter(f => !sanas.has(f.veredicto));
  const largoTotal = filas.reduce((s, f) => s + f.largo_m, 0) || 1;

  const advertencias: string[] = [];
  const pisoPct = patron.banda.min_pct;
  const largoParaElPiso = pisoPct > 0 ? Math.round(resolucion / (pisoPct / 100)) : null;
  if (largoParaElPiso !== null) {
    const cortas = filas.filter(f => f.largo_m < largoParaElPiso).length;
    if (cortas > 0) {
      advertencias.push(
        `El piso publicado de ${pisoPct.toFixed(1)} % sobre un modelo que resuelve ${resolucion.toFixed(1)} m de `
        + `desnivel necesita ${largoParaElPiso} m de surco para distinguirse de cero, y ${cortas} de `
        + `${filas.length} filas son más cortas que eso. En esas filas acequia no puede decir si el surco drena o `
        + 'encharca: lo dice un nivel a campo.',
      );
    }
  }
  if (conteo.no_medible > 0) {
    advertencias.push(
      `${conteo.no_medible} de ${filas.length} filas tienen una deriva por debajo de lo que este modelo distingue. `
      + 'No se les imprime el número, que es distinto de decir que corren a nivel.',
    );
  }
  if (patron.lineas.length > maxFilas) {
    advertencias.push(`Se validaron las primeras ${maxFilas} filas de ${patron.lineas.length} por costo de cálculo.`);
  }
  advertencias.push(
    'La dirección del agua se resuelve por facetas triangulares, que no redondea a ocho rumbos; el eje del valle, '
    + 'en cambio, sigue saliendo de la acumulación D8, que sí redondea. Y todo esto es el modelo de elevación: un '
    + 'surco se replantea con nivel, no con un satélite.',
  );

  return {
    filas,
    conteo,
    peor: fuera.length > 0 ? peorFila.i : null,
    filasFuera: fuera.length,
    fraccionDelLargoFuera: Math.round((fuera.reduce((s, f) => s + f.largo_m, 0) / largoTotal) * 1000) / 1000,
    resolucion_m: resolucion,
    largoParaElPiso_m: largoParaElPiso,
    sesgoD8: medirSesgoD8(g, op.muestraSesgo ?? 1500),
    advertencias,
    fuentes: [FUENTE_TARBOTON],
  };
}

/**
 * Cuánto se separan, en este terreno, la dirección por facetas y la de D8.
 *
 * No es un defecto a corregir: es la medida de cuánta confianza merece el «hacia
 * qué lado» que el patrón afirma, que se calcula desde una acumulación D8. En
 * un terreno alineado con la grilla el desvío es cero y las dos coinciden, que
 * es lo que el paper dice que tiene que pasar.
 */
export function medirSesgoD8(g: GrillaElevacion, muestra = 1500): SesgoD8 | null {
  const { rows, cols } = g;
  if (rows < 3 || cols < 3) return null;
  const { dxM, dyM } = pasosDeGrilla(g);
  const interiores = (rows - 2) * (cols - 2);
  const salto = Math.max(1, Math.floor(interiores / Math.max(1, muestra)));
  let n = 0, suma = 0, max = 0, k = 0;
  for (let r = 1; r < rows - 1; r++) {
    for (let c = 1; c < cols - 1; c++, k++) {
      if (k % salto !== 0) continue;
      const z = (dr: number, dc: number) => g.elev[(r + dr) * cols + (c + dc)] ?? NaN;
      const a = direccionDinf(z, dxM, dyM);
      const b = rumboD8(z, dxM, dyM);
      if (!a || !b) continue;
      const d = desvioAngular_deg(a.rumbo_deg, b.rumbo_deg);
      n++; suma += d; if (d > max) max = d;
    }
  }
  if (n === 0) return null;
  return {
    celdas: n,
    desvio_medio_deg: Math.round((suma / n) * 100) / 100,
    desvio_max_deg: Math.round(max * 100) / 100,
  };
}

/** Una línea de lectura de la validación, con el porqué y no sólo los números. */
export function leerValidacion(v: ValidacionPatron): string {
  const n = v.filas.length;
  if (v.filasFuera === 0) {
    const nm = v.conteo.no_medible;
    return `Las ${n} filas que se pudieron medir drenan y entregan el agua afuera del eje`
      + (nm > 0 ? `, aunque en ${nm} de ellas la deriva queda por debajo de lo que el modelo distingue.` : '.');
  }
  const partes: string[] = [];
  if (v.conteo.encharca > 0) partes.push(`${v.conteo.encharca} junta el agua adentro del surco`);
  if (v.conteo.a_la_vertiente > 0) partes.push(`${v.conteo.a_la_vertiente} la entrega al eje de un valle`);
  if (v.conteo.excede > 0) partes.push(`${v.conteo.excede} pasa el techo de grado`);
  if (v.conteo.sin_drenaje > 0) partes.push(`${v.conteo.sin_drenaje} corre por debajo del piso`);
  return `${v.filasFuera} de ${n} filas no hacen lo que el patrón dice: ${partes.join(', ')}. `
    + `Son el ${Math.round(v.fraccionDelLargoFuera * 100)} % del largo dibujado, y por eso el veredicto del `
    + 'conjunto puede no haberlas mostrado: ese veredicto promedia largos y el estándar limita cada surco.';
}
