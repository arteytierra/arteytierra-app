/**
 * El modelo declarado: qué se asumió, con qué datos y con cuánta incertidumbre.
 *
 * Primera mitad de la etapa J del plan de diseño de predio. Las otras cuatro
 * entregas —la planilla, la lista de materiales, el pedido de relevamiento
 * impreso y el master plan por etapas— son la segunda mitad; acá está el motor
 * que todas usan para no mentir con decimales.
 *
 * ── Lo que había, y sus tres límites ─────────────────────────────────────────
 *
 * acequia ya dice de dónde salió cada número. `hidrologiaPredio` devuelve un
 * objeto `Confianza` con nivel alta/media/baja y una lista de avisos;
 * `saludCalculo` hace lo mismo para cuenca, represa y erosión; `climaFuentes` y
 * `sueloFuentes` nombran el servicio y su resolución. Eso es trazabilidad, y
 * está bien. Pero no es un modelo declarado, por tres razones:
 *
 *  1 · **«Media» no es un número.** Un nivel de confianza ordena tres cajones;
 *      no se puede sumar, no se puede propagar y no se puede comparar con el
 *      espesor de la obra que se va a construir. Dos represas con confianza
 *      «media» pueden tener una el 4 % y otra el 60 % de incertidumbre.
 *
 *  2 · **Las incertidumbres no se propagan.** Cada herramienta declara la suya
 *      y ahí muere. El volumen de un vaso depende de la cota del vertedero y de
 *      la cota del fondo, las dos del mismo modelo de elevación, y nadie compone
 *      las dos cosas para decir cuánto puede valer el volumen.
 *
 *  3 · **Los números se imprimen con más cifras que las que tienen.** Es el
 *      modo exacto en que esta app falla: no se estrella, imprime
 *      «1.247,38 m³» cuando lo que sabe es «entre 600 y 1.900».
 *
 * ── La fuente ────────────────────────────────────────────────────────────────
 *
 * Esto no se improvisa: hay un estándar internacional que dice exactamente cómo
 * se declara un resultado con su incertidumbre, y es el mismo que usa un
 * laboratorio de calibración. Todo este módulo sale de ahí, cláusula por
 * cláusula, y cada función cita la suya:
 *
 *   · 4.2.3 ec. (5)   — incertidumbre típica de una media (evaluación tipo A)
 *   · 4.3.4           — un intervalo publicado al 90/95/99 % se divide por
 *                       1,64 / 1,96 / 2,58
 *   · 4.3.7 ec. (7)   — de una cota (±a) a una incertidumbre típica: a/√3
 *   · 4.3.9 ec. (9b)  — si los valores del medio son más probables: a/√6
 *   · 5.1.2 ec. (10)  — ley de propagación de incertidumbres
 *   · 5.1.3 ec. (11b) — coeficientes de sensibilidad y aporte de cada entrada
 *   · 5.1.3 nota 2    — cómo evaluar ec. (10) numéricamente, sin derivar a mano
 *   · 5.2   ec. (16)  — entradas correlacionadas
 *   · 6.3.3           — k = 2 ≈ 95 %, k = 3 ≈ 99 %
 *   · 7.2.6           — con cuántas cifras se imprime
 *
 * ── Lo que este módulo NO hace ───────────────────────────────────────────────
 *
 * No mide nada. No mejora ningún número: lo acompaña con el intervalo que le
 * corresponde, que casi siempre es más ancho de lo que la pantalla sugería. No
 * reemplaza el relevamiento: justamente lo pide, y dice en qué orden. Y no
 * declara lo que no puede: cuando el modelo de elevación del predio no publica
 * una exactitud punto a punto con su base de comparación, acequia dice que no
 * puede declarar la incertidumbre de ese número, en vez de inventarle una.
 */
import { calcularMetricas } from './geometria';
import { intervaloConfiableRemoto } from './curvasNivel';
import {
  ETIQUETA_RELIEVE, PASO_RELIEVE,
  type FuenteRelieve,
} from './grillaElevacion';
import type { Mojon } from './types';

// ─── Las fuentes ──────────────────────────────────────────────────────────────

export const FUENTE_GUM =
  'JCGM 100:2008, «Evaluation of measurement data — Guide to the expression of uncertainty in measurement» (GUM 1995 con correcciones menores), BIPM/JCGM, 2008.';

export const FUENTE_COPERNICUS_DEM =
  'Copernicus DEM — Product Handbook, versión 5.0 (29/11/2022), GEO.2018-1988-2, §2.1 y §2.2.';

export const FUENTE_SRTM =
  'Farr, T. G. et al. (2007), «The Shuttle Radar Topography Mission», Reviews of Geophysics 45, RG2004, §1.2 y tabla 1.';

// ─── De una cota publicada a una incertidumbre típica ─────────────────────────

/**
 * Qué forma se le supone a la distribución dentro de la cota.
 *
 * Casi todo dato publicado llega como «±a» y no como un desvío estándar. El GUM
 * resuelve eso en 4.3.7: si no hay información sobre cómo se reparten los
 * valores dentro del intervalo, lo único que se puede suponer es que son
 * equiprobables —distribución rectangular— y entonces la varianza es a²/3,
 * ecuación (7). Si hay motivo para pensar que los valores del medio son más
 * probables que los de los bordes, 4.3.9 da la triangular, a²/6, ecuación (9b).
 * Y si la cota es en realidad el 99,73 % de una normal, la nota 1 de 4.3.9 da
 * a²/9.
 *
 * El propio GUM remata ese párrafo con la observación que vuelve esta elección
 * menos dramática de lo que parece: «The magnitudes of the variances of the
 * three distributions are surprisingly similar in view of the large differences
 * in the amount of information required to justify them». En números: a/√3 =
 * 0,577·a, a/√6 = 0,408·a y a/3 = 0,333·a. Elegir la forma mueve la
 * incertidumbre un factor 1,73 como máximo, y la cota misma rara vez se conoce
 * mejor que eso.
 *
 * acequia usa `rectangular` por defecto, que es la que menos supone y la que
 * devuelve el número más grande de las tres.
 */
export type FormaDeCota = 'rectangular' | 'triangular' | 'normal_3sigma';

const DIVISOR_DE_COTA: Record<FormaDeCota, number> = {
  rectangular:   Math.sqrt(3),   // GUM 4.3.7, ec. (7):  u² = a²/3
  triangular:    Math.sqrt(6),   // GUM 4.3.9, ec. (9b): u² = a²/6
  normal_3sigma: 3,              // GUM 4.3.9, nota 1:   u² = a²/9
};

/**
 * Incertidumbre típica a partir de una cota de semiancho `a`, en la unidad de
 * `a`. GUM 4.3.7 y 4.3.9. Evaluación de tipo B.
 */
export function uDeCota(a: number, forma: FormaDeCota = 'rectangular'): number {
  if (!Number.isFinite(a) || a <= 0) return 0;
  return a / DIVISOR_DE_COTA[forma];
}

/**
 * Niveles de confianza con los que se publica un intervalo, y el factor por el
 * que hay que dividirlo para recuperar la incertidumbre típica suponiendo
 * normal. Son los tres que el GUM tabula en 4.3.4, con sus valores: «The
 * factors corresponding to the above three levels of confidence are 1,64; 1,96;
 * and 2,58».
 *
 * Se usan los números del estándar y no los exactos de la normal (1,6449;
 * 1,9600; 2,5758) para que el cálculo se pueda rastrear hasta la cláusula.
 */
export const DIVISOR_POR_CONFIANZA = { 90: 1.64, 95: 1.96, 99: 2.58 } as const;
export type NivelPublicado = keyof typeof DIVISOR_POR_CONFIANZA;

/**
 * Incertidumbre típica a partir de un intervalo publicado con su nivel de
 * confianza. GUM 4.3.4.
 *
 * Es el caso de los modelos de elevación, que publican su exactitud vertical
 * como «error lineal al 90 %» (LE90): no es un desvío estándar y no se puede
 * propagar sin dividirlo primero.
 */
export function uDeIntervalo(semiancho: number, nivel: NivelPublicado = 90): number {
  if (!Number.isFinite(semiancho) || semiancho <= 0) return 0;
  return semiancho / DIVISOR_POR_CONFIANZA[nivel];
}

/**
 * Incertidumbre típica de una media de `n` observaciones, con desvío muestral
 * `s`. GUM 4.2.3, ecuación (5): s²(q̄) = s²(q_k)/n. Evaluación de tipo A.
 */
export function uDeMedia(desvio: number, n: number): number {
  if (!Number.isFinite(desvio) || desvio <= 0 || !Number.isFinite(n) || n < 2) return 0;
  return desvio / Math.sqrt(n);
}

// ─── Las entradas del modelo ──────────────────────────────────────────────────

/** A: de observaciones repetidas. B: de todo lo demás. GUM 4.2 y 4.3. */
export type TipoEvaluacion = 'A' | 'B';

/**
 * Qué habría que ir a medir para bajar la incertidumbre de una entrada.
 *
 * Esto no es un agregado de acequia: está en la nota al pie de GUM 4.3.7, que
 * es la cláusula de las cotas publicadas. Dice, textual: «When a component of
 * uncertainty determined in this manner contributes significantly to the
 * uncertainty of a measurement result, it is prudent to obtain additional data
 * for its further evaluation». El pedido de relevamiento es esa nota, aplicada.
 */
export interface Medicion {
  /** qué magnitud hay que ir a medir, en palabras del campo */
  que:   string;
  /** con qué: instrumento o procedimiento */
  como:  string;
  /** la incertidumbre típica que quedaría después de medirlo, en la unidad de la entrada */
  u_esperada: number;
  /** cuánto trabajo es, para que el productor pueda decidir */
  esfuerzo?: string;
}

export interface Entrada {
  id:      string;
  rotulo:  string;
  valor:   number;
  unidad:  string;
  /** incertidumbre TÍPICA (desvío estándar), en la unidad de `valor` */
  u:       number;
  tipo:    TipoEvaluacion;
  /** la frase que explica de dónde salió `u`; va impresa en el informe */
  origen:  string;
  /** fuente publicada del dato o de su incertidumbre, si la hay */
  fuente?: string;
  medicion?: Medicion;
  /**
   * Grupo de correlación perfecta: dos entradas con el mismo grupo se tratan
   * con r = +1 entre sí, y con r = 0 contra todo lo demás (GUM 5.2, ec. 16).
   *
   * Hace falta cuando varias entradas heredan el MISMO error de un origen
   * común —diez resistores calibrados contra el mismo patrón, o diez celdas del
   * mismo modelo de elevación— y entonces sus errores no se cancelan al sumarse:
   * se acumulan. Cuando el origen común se puede nombrar como una entrada
   * aparte, es mejor hacer eso: la ec. (10) sola alcanza y no hay que declarar
   * ninguna correlación.
   */
  grupo?:  string;
}

export interface Contribucion {
  id:      string;
  rotulo:  string;
  /** coeficiente de sensibilidad ∂f/∂xᵢ — GUM 5.1.3 */
  c:       number;
  /** uᵢ(y) = cᵢ·u(xᵢ), el aporte de esta entrada a la incertidumbre — ec. (11b) */
  ui:      number;
  /** uᵢ²/u_c²: qué fracción de la varianza total pone esta entrada */
  fraccion: number;
}

export interface Propagacion {
  valor: number;
  /** incertidumbre típica combinada u_c(y) — GUM 5.1.2, ec. (10) */
  uc:    number;
  contribuciones: Contribucion[];
  /**
   * El u_c que habría salido tratando TODAS las entradas como independientes.
   *
   * Cuando hay grupos de correlación esto es un número equivocado, y está acá a
   * propósito: es la cuenta que se hace sin pensar, y la diferencia entre los
   * dos mide cuánto cuesta no pensarla. El GUM trae el caso resuelto en la nota
   * 1 de 5.2.2 —diez resistores de 1 kΩ calibrados contra el mismo patrón— y lo
   * dice sin vueltas: 0,32 Ω «is incorrect because it does not take into account
   * that all of the calibrated values of the ten resistors are correlated». El
   * número correcto es 1 Ω.
   */
  uc_independiente: number;
}

// ─── La ley de propagación ────────────────────────────────────────────────────

/**
 * Propaga las incertidumbres de las entradas a través del modelo `f`.
 *
 * GUM 5.1.2, ecuación (10):  u_c²(y) = Σ (∂f/∂xᵢ)² u²(xᵢ)
 *
 * Las derivadas no se escriben a mano. El propio estándar autoriza evaluarlas
 * numéricamente en la nota 2 de 5.1.3: uᵢ(y) se calcula como la mitad de la
 * diferencia entre f evaluada en xᵢ+u(xᵢ) y en xᵢ−u(xᵢ), y el coeficiente de
 * sensibilidad sale de ahí dividiendo. Eso es decisivo para acequia, donde
 * media cadena de cálculo pasa por tablas con escalones —el CN del SCS, el
 * grupo hidrológico, la textura USDA— y no hay derivada que escribir.
 *
 * Con grupos de correlación se usa la ecuación (16) con r = +1 adentro del grupo
 * y r = 0 afuera, que se reduce a: los aportes de un mismo grupo se suman CON
 * SIGNO, y los grupos entre sí en cuadratura. El signo importa y es la mitad de
 * la gracia: si dos celdas del mismo modelo entran a una RESTA, el error común
 * se cancela; si entran a una SUMA, se acumula.
 */
export function propagar(
  f: (v: Readonly<Record<string, number>>) => number,
  entradas: readonly Entrada[],
): Propagacion | null {
  if (entradas.length === 0) return null;

  const base: Record<string, number> = {};
  for (const e of entradas) {
    if (!Number.isFinite(e.valor) || !Number.isFinite(e.u) || e.u < 0) return null;
    base[e.id] = e.valor;
  }

  const valor = f(base);
  if (!Number.isFinite(valor)) return null;

  // uᵢ(y) de la nota 2 de 5.1.3, con signo.
  const aportes: Array<{ e: Entrada; ui: number }> = [];
  for (const e of entradas) {
    if (e.u === 0) { aportes.push({ e, ui: 0 }); continue; }
    const arriba = f({ ...base, [e.id]: e.valor + e.u });
    const abajo  = f({ ...base, [e.id]: e.valor - e.u });
    if (!Number.isFinite(arriba) || !Number.isFinite(abajo)) return null;
    aportes.push({ e, ui: (arriba - abajo) / 2 });
  }

  // Ec. (16) con r = ±1 por grupo: suma con signo adentro, cuadratura afuera.
  const porGrupo = new Map<string, number>();
  let varianza = 0;
  for (const { e, ui } of aportes) {
    if (e.grupo) porGrupo.set(e.grupo, (porGrupo.get(e.grupo) ?? 0) + ui);
    else varianza += ui * ui;
  }
  for (const suma of porGrupo.values()) varianza += suma * suma;

  const uc = Math.sqrt(varianza);
  const varianzaIndep = aportes.reduce((a, { ui }) => a + ui * ui, 0);

  const contribuciones: Contribucion[] = aportes.map(({ e, ui }) => ({
    id:       e.id,
    rotulo:   e.rotulo,
    c:        e.u > 0 ? ui / e.u : 0,
    ui,
    fraccion: varianza > 0 ? (ui * ui) / varianza : 0,
  }));
  contribuciones.sort((a, b) => Math.abs(b.ui) - Math.abs(a.ui));

  return { valor, uc, contribuciones, uc_independiente: Math.sqrt(varianzaIndep) };
}

// ─── Incertidumbre expandida ──────────────────────────────────────────────────

/**
 * k = 2 da un intervalo de confianza de ≈95 %, y k = 3 de ≈99 %, cuando la
 * distribución del resultado es aproximadamente normal y los grados de libertad
 * efectivos no son pocos. GUM 6.3.3, que es explícito en que eso «frequently
 * occurs in practice».
 *
 * acequia usa k = 2 y lo imprime, porque el GUM insiste en 7.2.3 en que el
 * factor de cobertura siempre se declara: «U = 0,13 m» sin el k no significa
 * nada.
 */
export const K_95 = 2;
export const K_99 = 3;

export function expandir(uc: number, k: number = K_95): number {
  return Number.isFinite(uc) && uc > 0 ? k * uc : 0;
}

// ─── Con cuántas cifras se imprime ────────────────────────────────────────────

export interface NumeroRedondeado {
  valor:     number;
  u:         number;
  decimales: number;
  /** ya formateados con coma decimal, listos para pantalla */
  valorTexto: string;
  uTexto:     string;
}

/**
 * Redondea un resultado y su incertidumbre como manda GUM 7.2.6.
 *
 * Dos reglas, las dos textuales. Primera: «It usually suffices to quote u_c(y)
 * and U […] to at most two significant digits». Segunda, la que acequia venía
 * rompiendo en todas las pantallas: «Output and input estimates should be
 * rounded to be consistent with their uncertainties; for example, if
 * y = 10,057 62 Ω with u_c(y) = 27 mΩ, y should be rounded to 10,058 Ω».
 *
 * Devolver `1247,3829 m³` cuando la incertidumbre es de 600 m³ no es más
 * preciso: es menos honesto. Las cuatro cifras de la derecha son ruido con
 * aspecto de dato.
 *
 * Sobre redondear para arriba: el estándar lo permite pero no lo manda, y sus
 * dos ejemplos tiran para lados distintos —sugiere 10,47 m → 11 m y al mismo
 * tiempo aclara que «common sense should prevail and a value such as
 * u(xᵢ) = 28,05 kHz should be rounded down to 28 kHz»—. acequia redondea al más
 * cercano, siempre, porque una regla que se puede testear vale más que un
 * criterio que no.
 */
export function redondearGUM(valor: number, u: number, cifras = 2): NumeroRedondeado {
  if (!Number.isFinite(valor)) {
    return { valor: NaN, u: NaN, decimales: 0, valorTexto: '—', uTexto: '—' };
  }
  if (!Number.isFinite(u) || u <= 0) {
    const t = conComa(valor, 0);
    return { valor, u: 0, decimales: 0, valorTexto: t, uTexto: '—' };
  }

  // Lugar de la última cifra significativa de u.
  const exp  = Math.floor(Math.log10(u));
  const paso = Math.pow(10, exp - (cifras - 1));

  const uRed = Math.round(u / paso) * paso;
  const vRed = Math.round(valor / paso) * paso;
  const decimales = Math.max(0, -(exp - (cifras - 1)));

  return {
    valor: vRed, u: uRed, decimales,
    valorTexto: conComa(vRed, decimales),
    uTexto:     conComa(uRed, decimales),
  };
}

function conComa(n: number, decimales: number): string {
  return n.toLocaleString('es-AR', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
}

// ─── El modelo declarado ──────────────────────────────────────────────────────

/**
 * Cuándo un aporte «contribuye significativamente», que es la condición con la
 * que la nota de GUM 4.3.7 pide ir a buscar más datos.
 *
 * El estándar no pone número, así que **este umbral es convención de acequia y
 * no del GUM**. Está elegido para que signifique algo: con el 10 % de la
 * varianza, hacer desaparecer esa entrada baja la incertidumbre combinada un
 * √(1−0,10) = 5 %. Por debajo de eso, ir a medir no cambia el resultado.
 */
export const FRACCION_SIGNIFICATIVA = 0.10;

export interface RenglonRelevamiento {
  id:      string;
  rotulo:  string;
  medicion: Medicion;
  /** u_c que quedaría si esta entrada se midiera, en la unidad del resultado */
  uc_despues: number;
  /** cuánto baja la incertidumbre combinada, 0 a 1 */
  ganancia: number;
  /** fracción de la varianza que esta entrada pone hoy */
  fraccion: number;
}

export interface ModeloDeclarado {
  /** qué se está midiendo, en una línea */
  magnitud:  string;
  unidad:    string;
  /** el modelo: la fórmula con nombre y fuente, no el código */
  modelo:    string;
  fuente:    string;
  entradas:  readonly Entrada[];
  propagacion: Propagacion;
  /** k usado para expandir */
  k:         number;
  /** U = k·u_c */
  U:         number;
  /** el resultado redondeado según 7.2.6 */
  redondeo:  NumeroRedondeado;
  /** incertidumbre relativa expandida, 0 a 1 — null si el valor es 0 */
  relativa:  number | null;
  /** qué ir a medir, ordenado por cuánto baja la incertidumbre */
  relevamiento: RenglonRelevamiento[];
  /** avisos sobre el propio modelo, no sobre los datos */
  advertencias: string[];
}

/**
 * Arma el modelo declarado de una magnitud: la propaga, la expande, la redondea
 * y arma el pedido de relevamiento.
 *
 * El pedido no es una lista de deseos: para cada entrada que tenga una
 * `medicion` declarada, se vuelve a propagar TODO el modelo con la `u_esperada`
 * en lugar de la actual, y lo que se informa es cuánto baja la incertidumbre
 * combinada. Así el orden sale de la cuenta y no de la intuición: medir lo que
 * pone el 2 % de la varianza es un viaje al campo que no cambia nada.
 */
export function declarar(params: {
  magnitud: string;
  unidad:   string;
  modelo:   string;
  fuente:   string;
  f:        (v: Readonly<Record<string, number>>) => number;
  entradas: readonly Entrada[];
  k?:       number;
  advertencias?: string[];
}): ModeloDeclarado | null {
  const { magnitud, unidad, modelo, fuente, f, entradas } = params;
  const k = params.k ?? K_95;

  const propagacion = propagar(f, entradas);
  if (!propagacion) return null;

  const U = expandir(propagacion.uc, k);
  const relevamiento: RenglonRelevamiento[] = [];

  for (const e of entradas) {
    if (!e.medicion) continue;
    const contrib = propagacion.contribuciones.find(c => c.id === e.id);
    if (!contrib || contrib.fraccion < FRACCION_SIGNIFICATIVA) continue;
    if (e.medicion.u_esperada >= e.u) continue;   // medirlo no mejoraría nada

    const despues = propagar(f, entradas.map(x =>
      x.id === e.id ? { ...x, u: e.medicion!.u_esperada } : x,
    ));
    if (!despues) continue;

    relevamiento.push({
      id: e.id, rotulo: e.rotulo, medicion: e.medicion,
      uc_despues: despues.uc,
      ganancia:   propagacion.uc > 0 ? 1 - despues.uc / propagacion.uc : 0,
      fraccion:   contrib.fraccion,
    });
  }
  relevamiento.sort((a, b) => b.ganancia - a.ganancia);

  const advertencias = [...(params.advertencias ?? [])];

  // El aviso que importa: cuando el intervalo se come el valor, el número no
  // sirve para dimensionar. No es un error de cálculo: es el dato que no llega.
  if (propagacion.valor !== 0 && U >= Math.abs(propagacion.valor)) {
    advertencias.push(
      `El intervalo al ${k === K_99 ? 99 : 95} % es más ancho que el propio valor, así que este número no alcanza para dimensionar nada: sirve para saber el orden de magnitud y para decidir qué medir.`,
    );
  }

  // Y el que delata una correlación ignorada (GUM 5.2.5: «Correlations between
  // input quantities cannot be ignored if present and significant»).
  if (propagacion.uc_independiente > 0) {
    const razon = propagacion.uc / propagacion.uc_independiente;
    if (razon > 1.2) {
      advertencias.push(
        `Tratar las entradas como independientes daría una incertidumbre ${razon.toFixed(1)} veces más chica, y sería la cuenta equivocada: varias de ellas heredan el mismo error del mismo origen y ese error no se cancela al sumarse.`,
      );
    }
  }

  return {
    magnitud, unidad, modelo, fuente, entradas, propagacion, k, U,
    redondeo: redondearGUM(propagacion.valor, U),
    relativa: propagacion.valor !== 0 ? U / Math.abs(propagacion.valor) : null,
    relevamiento, advertencias,
  };
}

/** El modelo declarado en una línea, para encabezar el bloque. */
export function leerDeclaracion(d: ModeloDeclarado): string {
  const r = d.redondeo;
  const pct = d.relativa != null ? ` — un ${(d.relativa * 100).toFixed(0)} %` : '';
  return `${d.magnitud}: ${r.valorTexto} ± ${r.uTexto} ${d.unidad} (k = ${d.k}, ≈${d.k === K_99 ? 99 : 95} % de confianza${pct}).`;
}

// ─── La exactitud de los modelos de elevación ─────────────────────────────────

/**
 * Exactitud vertical publicada de cada fuente de relieve, tal como la publica
 * el proveedor.
 *
 * Esto es el dato que faltaba, y cambia todo. Hasta hoy acequia declaraba su
 * propio criterio de dibujo —`INTERVALO_CONFIABLE_M`, 2 m, el intervalo mínimo
 * de curva de nivel que tiene sentido trazar— como si fuera la exactitud del
 * modelo. No lo es: es la respuesta a «cada cuánto dibujo una curva», no a
 * «cuánto puede estar errada esta cota».
 *
 * Y hay DOS exactitudes, no una. El manual de Copernicus las distingue con
 * precisión quirúrgica:
 *
 *  · **absoluta**: «describes all random or systematic uncertainties of a
 *    pixel, in vertical direction, with respect to the vertical datum used».
 *    Es cuánto puede estar corrida la cota contra el nivel del mar.
 *
 *  · **relativa**: «specified as uncertainty between two DEM pixels caused by
 *    random errors» — y, crucialmente, con su base declarada: «90 % linear
 *    point-to-point error within an area of 1° × 1°».
 *
 * La diferencia no es académica. La parte sistemática de la absoluta es un
 * sesgo COMPARTIDO por todas las celdas de la zona: se cancela entero en
 * cualquier RESTA —una pendiente, un desnivel, una profundidad, una deriva de
 * surco— y no se cancela en ninguna SUMA —un volumen, un movimiento de suelo—.
 * Propagar la absoluta en una resta infla la incertidumbre al doble; propagar
 * sólo la relativa en una suma la deja chica por un factor que crece con la
 * cantidad de celdas.
 *
 * `le90_rel_m` es el componente aleatorio punto a punto y `le90_abs_m` incluye
 * además el sesgo, así que el sesgo sale de la resta en cuadratura:
 * u_sesgo² = u_abs² − u_rel².
 */
export interface ExactitudDem {
  /** error lineal al 90 % de la cota contra el datum vertical, en m */
  le90_abs_m: number;
  /** error lineal al 90 % punto a punto, en m — pendientes suaves */
  le90_rel_m: number;
  /** ídem, en pendiente fuerte, si el proveedor lo separa */
  le90_rel_fuerte_m?: number;
  /** umbral de pendiente (%) que separa los dos valores anteriores */
  pendiente_corte_pct?: number;
  /** sobre qué distancia vale el «punto a punto». Sin esto el número no se puede usar. */
  base_declarada: string | null;
  fuente: string;
  nota?:  string;
}

export const EXACTITUD_DEM: Partial<Record<FuenteRelieve, ExactitudDem>> = {
  // Verificado en el manual del producto, §2.1 y §2.2. Es la fuente global por
  // defecto de acequia, así que es la que vale para la mayoría de los predios.
  glo30: {
    le90_abs_m: 4,
    le90_rel_m: 2,
    le90_rel_fuerte_m: 4,
    pendiente_corte_pct: 20,
    base_declarada: 'punto a punto dentro de un área de 1° × 1°',
    fuente: FUENTE_COPERNICUS_DEM,
    nota: 'La exactitud absoluta MEDIDA es mejor que la especificada: el manual informa una media global de 2,57 m y de 1,92 m excluyendo Groenlandia y la Antártida. Acá se usa la especificación —4 m— porque es la que el proveedor garantiza en cualquier punto, y porque mezclar una media medida con un techo especificado daría una relativa peor que la absoluta.',
  },

  // SRTM publica los dos números, pero no dice sobre qué distancia vale el
  // relativo, y sin eso no se puede propagar: el error entre dos celdas
  // vecinas no es el mismo que entre dos celdas a 100 km. Queda declarado y
  // sin usar.
  srtm30: {
    le90_abs_m: 16,
    le90_rel_m: 10,
    base_declarada: null,
    fuente: FUENTE_SRTM,
    nota: 'La especificación de la misión era «linear vertical absolute height error of less than 16 m, linear vertical relative height error of less than 10 m […] All quoted errors are at 90% confidence level». El paper informa además que la exactitud absoluta lograda fue mejor que 9 m. Pero el relativo se publica sin base de comparación, y sin eso no se puede propagar.',
  },

  terrarium: {
    le90_abs_m: 16,
    le90_rel_m: 10,
    base_declarada: null,
    fuente: FUENTE_SRTM,
    nota: 'Terrarium es un mosaico: SRTM donde hay, GMTED y otras fuentes donde no. Los números son los de SRTM y valen sólo para la parte SRTM; el mosaico no publica una exactitud propia.',
  },
};

export interface IncertidumbreCota {
  /** u de la cota contra el datum, m. null si no se puede declarar. */
  u_absoluta: number | null;
  /** u entre dos celdas vecinas, m. null si no se puede declarar. */
  u_relativa: number | null;
  /** la parte sistemática, compartida por todas las celdas de la zona, m */
  u_sesgo: number | null;
  /** por qué no se puede declarar, cuando no se puede */
  motivo: string | null;
  etiqueta: string;
  paso_m: number;
  exactitud: ExactitudDem | null;
}

/**
 * Incertidumbre típica de una cota de este modelo de relieve, separada en sus
 * dos componentes. Los LE90 publicados se convierten con GUM 4.3.4.
 *
 * Cuando el proveedor no publica una exactitud punto a punto CON su base de
 * comparación, esto devuelve `null` y el motivo, y el modelo declarado de
 * cualquier magnitud que dependa del relieve queda sin declarar. Es a propósito:
 * el criterio de curvas de nivel de la app existe y está a mano, pero es un
 * criterio de dibujo y usarlo acá sería fabricar una exactitud. Lo que falta
 * para cerrarlo es leer la especificación publicada de los siete modelos
 * nacionales —3DEP, IGN Francia, IGN España, HRDEM, AHN, swissALTI3D— y la del
 * relevamiento propio que trae el usuario.
 */
export function incertidumbreDeCota(
  fuente: FuenteRelieve | null | undefined,
  pendiente_pct?: number | null,
): IncertidumbreCota {
  const f = fuente ?? 'terrarium';
  const etiqueta = ETIQUETA_RELIEVE[f];
  const paso_m   = PASO_RELIEVE[f];
  const exactitud = EXACTITUD_DEM[f] ?? null;

  if (!exactitud) {
    return {
      u_absoluta: null, u_relativa: null, u_sesgo: null, etiqueta, paso_m, exactitud: null,
      motivo: `No se leyó la exactitud vertical publicada de ${etiqueta}. acequia tiene su propio criterio de intervalo de curva confiable (${intervaloConfiableRemoto(paso_m)} m para este modelo), pero eso dice cada cuánto tiene sentido dibujar una curva, no cuánto puede estar errada una cota: usarlo acá sería inventar una exactitud.`,
    };
  }
  if (exactitud.base_declarada == null) {
    return {
      u_absoluta: uDeIntervalo(exactitud.le90_abs_m, 90),
      u_relativa: null, u_sesgo: null, etiqueta, paso_m, exactitud,
      motivo: `${etiqueta} publica una exactitud vertical relativa de ${exactitud.le90_rel_m} m al 90 %, pero sin decir sobre qué distancia vale. El error entre dos celdas vecinas no es el mismo que entre dos celdas a 100 km, así que ese número no se puede propagar a un desnivel ni a un volumen.`,
    };
  }

  const fuerte = pendiente_pct != null
    && exactitud.pendiente_corte_pct != null
    && pendiente_pct > exactitud.pendiente_corte_pct;
  const le90rel = fuerte ? (exactitud.le90_rel_fuerte_m ?? exactitud.le90_rel_m) : exactitud.le90_rel_m;

  const uAbs = uDeIntervalo(exactitud.le90_abs_m, 90);
  const uRel = uDeIntervalo(le90rel, 90);
  // u_abs incluye el aleatorio y el sistemático, y son independientes entre sí.
  const uSesgo = uAbs > uRel ? Math.sqrt(uAbs * uAbs - uRel * uRel) : 0;

  return {
    u_absoluta: uAbs, u_relativa: uRel, u_sesgo: uSesgo,
    motivo: null, etiqueta, paso_m, exactitud,
  };
}

// ─── Tres magnitudes declaradas ───────────────────────────────────────────────

/**
 * Desnivel entre dos puntos leídos del mismo modelo de elevación.
 *
 * Es el caso donde el sesgo se cancela, y por eso la incertidumbre es mucho
 * menor de lo que la exactitud ABSOLUTA del modelo sugiere. El sesgo se declara
 * como una entrada más —una sola, compartida por los dos términos— en vez de
 * dejarlo afuera a mano: así la cancelación la hace la ecuación (10) y queda a
 * la vista en la tabla de aportes, con su cero adelante, en lugar de ser una
 * afirmación del comentario.
 *
 * El `paso` del modelo entra como advertencia y no como entrada: un desnivel
 * medido entre dos puntos más cercanos que una celda no es un dato, es la
 * interpolación bilineal del mismo dato leída dos veces.
 */
export function declararDesnivel(params: {
  cota_alta_m: number;
  cota_baja_m: number;
  distancia_m: number;
  fuente: FuenteRelieve | null | undefined;
  pendiente_pct?: number | null;
}): ModeloDeclarado | null {
  const inc = incertidumbreDeCota(params.fuente, params.pendiente_pct);
  if (inc.u_relativa == null || inc.u_sesgo == null) return null;

  const advertencias: string[] = [];
  if (params.distancia_m < inc.paso_m) {
    advertencias.push(
      `Los dos puntos están a ${params.distancia_m.toFixed(1)} m y el modelo tiene celdas de ${inc.paso_m} m: entre ellos no hay dos mediciones, hay una interpolada dos veces. El desnivel que sale de ahí no es un dato del terreno.`,
    );
  }
  advertencias.push(
    `El sesgo del modelo contra el nivel del mar —${inc.u_sesgo.toFixed(2)} m de incertidumbre típica— se cancela entero en una resta, así que no entra. Si entrara, este desnivel saldría con ${(Math.sqrt(2) * (inc.u_absoluta ?? 0)).toFixed(2)} m en vez de ${(Math.sqrt(2) * inc.u_relativa).toFixed(2)} m.`,
  );

  const u = inc.u_relativa;
  const medicion: Medicion = {
    que:  'el desnivel entre los dos puntos, en el terreno',
    como: 'nivel de manguera, nivel óptico con mira o nivel láser con receptor',
    u_esperada: 0.02,
    esfuerzo: 'una mañana con un ayudante para un predio chico',
  };

  return declarar({
    magnitud: 'Desnivel entre los dos puntos',
    unidad: 'm',
    modelo: '(z_alta + b) − (z_baja + b), las dos cotas del mismo modelo de elevación y su sesgo común b',
    fuente: inc.exactitud?.fuente ?? FUENTE_GUM,
    f: v => ((v.z_alta ?? 0) + (v.sesgo ?? 0)) - ((v.z_baja ?? 0) + (v.sesgo ?? 0)),
    entradas: [
      { id: 'z_alta', rotulo: 'Cota del punto alto', valor: params.cota_alta_m, unidad: 'm', u, tipo: 'B',
        origen: `error lineal punto a punto al 90 % de ${inc.etiqueta}, dividido por 1,64 (GUM 4.3.4)`,
        fuente: inc.exactitud?.fuente, medicion },
      { id: 'z_baja', rotulo: 'Cota del punto bajo', valor: params.cota_baja_m, unidad: 'm', u, tipo: 'B',
        origen: `ídem, del mismo modelo y la misma zona`,
        fuente: inc.exactitud?.fuente, medicion },
      { id: 'sesgo', rotulo: 'Sesgo del modelo contra el nivel del mar', valor: 0, unidad: 'm',
        u: inc.u_sesgo, tipo: 'B',
        origen: 'parte sistemática de la exactitud absoluta publicada. Entra en las dos cotas con el mismo signo, así que la resta lo cancela: su aporte es exactamente cero.',
        fuente: inc.exactitud?.fuente },
    ],
    advertencias,
  });
}

/**
 * Volumen de un vaso de represa leído del modelo de elevación, y la cuenta que
 * hace falta ver una vez para no volver a confiar en un volumen satelital.
 *
 * El vaso se calcula celda por celda: V = A_celda · Σ (z_agua − z_i). El
 * detalle que decide todo es que **z_agua es una sola celda y aparece en los N
 * términos de la suma**, así que su error no se promedia: se multiplica por N.
 * El error de cada z_i, en cambio, es independiente y sí se promedia, en √N.
 *
 * El resultado, hecha la cuenta, se dice en una línea: la incertidumbre del
 * volumen es la SUPERFICIE DEL ESPEJO por la incertidumbre punto a punto del
 * modelo. No baja afinando la grilla. No baja contando más celdas. Baja de una
 * sola manera, que es ir a medir el desnivel con un nivel.
 *
 * Hecha la cuenta: u(V) = A_celda · u · √(N² + N). El término N² es la cota del
 * agua y el término N son las del fondo, y para cualquier vaso con más de una
 * celda el primero domina. La cuenta ingenua —darle a cada término (z_agua −
 * z_i) su propia cota de agua independiente— da A_celda · u · √(2N), que es
 * √((N+1)/2) veces menos: con 50 celdas, 5 veces; con 500, 16. Es la nota 1 de
 * GUM 5.2.2 con otra ropa, el caso de los diez resistores calibrados contra el
 * mismo patrón: «is incorrect because it does not take into account that all of
 * the calibrated values of the ten resistors are correlated».
 *
 * El sesgo contra el nivel del mar, en cambio, se cancela —el vaso es una
 * diferencia de cotas del mismo modelo— y entra igual como entrada, con su cero,
 * para que se vea que se canceló y no que se olvidó.
 */
export function declararVolumenDeVaso(params: {
  cota_agua_m: number;
  /** cotas del fondo, una por celda inundada */
  cotas_fondo_m: readonly number[];
  area_celda_m2: number;
  fuente: FuenteRelieve | null | undefined;
  pendiente_pct?: number | null;
}): ModeloDeclarado | null {
  const { cota_agua_m, cotas_fondo_m, area_celda_m2 } = params;
  if (cotas_fondo_m.length === 0 || !(area_celda_m2 > 0)) return null;

  const inc = incertidumbreDeCota(params.fuente, params.pendiente_pct);
  if (inc.u_relativa == null || inc.u_sesgo == null) return null;
  const u = inc.u_relativa;

  // El fondo entra como una sola entrada —la cota media— y no como N: lo que
  // interesa acá es cómo se compone la incertidumbre, y N cotas independientes
  // con la misma u aportan lo mismo que una sola con u/√N. Eso se declara.
  const n = cotas_fondo_m.length;
  const zMedia = cotas_fondo_m.reduce((a, b) => a + b, 0) / n;

  const medicionNivel: Medicion = {
    que:  'la cota del vertedero y tres o cuatro cotas del fondo del vaso, referidas entre sí',
    como: 'nivel óptico con mira desde el eje del muro, o nivel de manguera si el vaso es chico',
    u_esperada: 0.03,
    esfuerzo: 'medio día con un ayudante',
  };

  const area_espejo = n * area_celda_m2;
  const advertencias = [
    `La cota del agua es UNA celda y aparece en los ${n} términos de la suma, así que su error no se promedia: se multiplica por ${n}. Por eso la incertidumbre del volumen es, en la práctica, la superficie del espejo (${Math.round(area_espejo).toLocaleString('es-AR')} m²) por la incertidumbre punto a punto del modelo (${u.toFixed(2)} m), y no baja afinando la grilla.`,
    `Darle a cada celda su propia cota de agua independiente —la cuenta que sale sin pensarla— daría una incertidumbre ${Math.sqrt((n + 1) / 2).toFixed(1)} veces más chica, y sería la cuenta equivocada.`,
  ];
  if (inc.paso_m >= 30) {
    advertencias.push(
      `Con celdas de ${inc.paso_m} m, un vaso de ${Math.round(area_espejo).toLocaleString('es-AR')} m² entra en ${(area_espejo / (inc.paso_m * inc.paso_m)).toFixed(1)} celdas del modelo original: todo lo que se ve adentro es interpolación.`,
    );
  }

  return declarar({
    magnitud: 'Volumen del vaso',
    unidad: 'm³',
    modelo: `V = A_celda · Σ (z_agua − z_i), con ${n} celdas de ${area_celda_m2.toFixed(0)} m²`,
    fuente: inc.exactitud?.fuente ?? FUENTE_GUM,
    f: v => area_celda_m2 * n * (
      ((v.z_agua ?? 0) + (v.sesgo ?? 0)) - ((v.z_fondo ?? 0) + (v.sesgo ?? 0))
    ),
    entradas: [
      { id: 'z_agua', rotulo: 'Cota del agua (vertedero)', valor: cota_agua_m, unidad: 'm',
        u, tipo: 'B',
        origen: `error punto a punto al 90 % de ${inc.etiqueta} ÷ 1,64. Entra una vez por celda inundada, así que pesa ${n} veces.`,
        fuente: inc.exactitud?.fuente, medicion: medicionNivel },
      { id: 'z_fondo', rotulo: 'Cota media del fondo', valor: zMedia, unidad: 'm',
        u: u / Math.sqrt(n), tipo: 'B',
        origen: `ídem, pero promediada sobre ${n} celdas independientes, así que baja en √${n} = ${Math.sqrt(n).toFixed(1)}`,
        fuente: inc.exactitud?.fuente, medicion: medicionNivel },
      { id: 'sesgo', rotulo: 'Sesgo del modelo contra el nivel del mar', valor: 0, unidad: 'm',
        u: inc.u_sesgo, tipo: 'B',
        origen: 'el vaso es una diferencia de cotas del mismo modelo, así que el sesgo se cancela: aporta cero.',
        fuente: inc.exactitud?.fuente },
    ],
    advertencias,
  });
}

/**
 * Superficie del predio a partir de los mojones dibujados a mano.
 *
 * La incertidumbre de un polígono por la de sus vértices sale de aplicar la
 * ecuación (10) a la fórmula del cordón de zapato. Con A = ½|Σ(xᵢ·yᵢ₊₁ −
 * xᵢ₊₁·yᵢ)| las derivadas son ∂A/∂xᵢ = ½(yᵢ₊₁ − yᵢ₋₁) y ∂A/∂yᵢ = ½(xᵢ₋₁ −
 * xᵢ₊₁), así que con vértices independientes de incertidumbre σ en cada eje:
 *
 *     u²(A) = (σ²/4) · Σ |Pᵢ₊₁ − Pᵢ₋₁|²
 *
 * Cada vértice pesa según la distancia entre sus DOS vecinos, lo cual tiene
 * sentido geométrico: un mojón en un tramo recto casi no mueve la superficie, y
 * uno en una punta la mueve mucho. Para un cuadrado de lado L sale u(A) = σ·L·√2
 * exacto, que es el caso con el que se testea.
 *
 * `sigma_m` lo pone quien dibuja: es cuánto puede estar corrido cada mojón. No
 * hay un valor publicado para «un clic sobre una imagen satelital», así que
 * acequia no lo asume: lo pide.
 */
export function declararSuperficie(params: {
  mojones: readonly Mojon[];
  sigma_vertice_m: number;
}): ModeloDeclarado | null {
  const { mojones, sigma_vertice_m } = params;
  if (mojones.length < 3 || !(sigma_vertice_m > 0)) return null;

  const m = calcularMetricas([...mojones]);
  if (!m) return null;

  // Vértices a metros locales, para que las derivadas sean en metros.
  const lat0 = mojones.reduce((a, p) => a + p.lat, 0) / mojones.length;
  const mPorGradoLng = 111_320 * Math.cos(lat0 * Math.PI / 180);
  const xs = mojones.map(p => p.lng * mPorGradoLng);
  const ys = mojones.map(p => p.lat * 111_320);

  const n = mojones.length;
  const peso = pesoDeVertices(xs, ys);   // √(Σ|Pᵢ₊₁ − Pᵢ₋₁|² / 4), en m

  return declarar({
    magnitud: 'Superficie del predio',
    unidad: 'm²',
    modelo: `fórmula del cordón de zapato sobre ${n} mojones; la ec. (10) del GUM aplicada a sus derivadas da u(A) = σ·√(Σ|Pᵢ₊₁ − Pᵢ₋₁|²/4), y acá ese factor vale ${peso.toFixed(0)} m`,
    fuente: FUENTE_GUM,
    // El modelo se expresa en una sola entrada: el corrimiento equivalente del
    // contorno, de valor nominal cero, cuya incertidumbre típica es σ. El
    // coeficiente de sensibilidad que devuelve la propagación numérica es
    // entonces el factor geométrico en m² por metro de corrimiento, que es
    // justamente lo que vale la pena leer.
    f: v => m.area_m2 + peso * (v.corrimiento ?? 0),
    entradas: [
      { id: 'corrimiento', rotulo: 'Corrimiento de cada mojón', valor: 0, unidad: 'm',
        u: sigma_vertice_m, tipo: 'B',
        origen: 'lo declara quien dibujó el predio: no hay exactitud publicada para un clic sobre una imagen satelital',
        medicion: {
          que:  'la posición de cada mojón',
          como: 'GPS diferencial o RTK, o la plancha catastral si el lote está mensurado',
          u_esperada: 0.3,
          esfuerzo: 'una jornada, o un trámite si ya existe la mensura',
        } },
    ],
    advertencias: [
      `Cada mojón pesa según la distancia entre sus DOS vecinos, que es lo que dice la derivada: un mojón en un tramo recto casi no mueve la superficie y uno en una punta la mueve mucho.`,
      'No hay una exactitud publicada para «un clic sobre una imagen satelital»: el corrimiento de cada mojón lo declara quien dibuja, y de ahí sale todo lo demás.',
    ],
  });
}

/**
 * El factor geométrico de la superficie: √(Σ|Pᵢ₊₁ − Pᵢ₋₁|² / 4), en metros.
 * Multiplicado por el corrimiento típico de un vértice da u(A) en m².
 * Para un cuadrado de lado L vale exactamente L·√2.
 */
function pesoDeVertices(xs: readonly number[], ys: readonly number[]): number {
  const n = xs.length;
  let suma = 0;
  for (let i = 0; i < n; i++) {
    const sig = (i + 1) % n, ant = (i - 1 + n) % n;
    const dx = xs[sig]! - xs[ant]!, dy = ys[sig]! - ys[ant]!;
    suma += dx * dx + dy * dy;
  }
  return Math.sqrt(suma / 4);
}

/**
 * La incertidumbre de la superficie, aparte, porque la fórmula cerrada sirve
 * sola: la usan el movimiento de suelo, la receptividad y cualquier cosa que
 * multiplique por hectáreas.
 */
export function uDeSuperficie(mojones: readonly Mojon[], sigma_vertice_m: number): number | null {
  if (mojones.length < 3 || !(sigma_vertice_m > 0)) return null;
  const lat0 = mojones.reduce((a, p) => a + p.lat, 0) / mojones.length;
  const mPorGradoLng = 111_320 * Math.cos(lat0 * Math.PI / 180);
  return pesoDeVertices(
    mojones.map(p => p.lng * mPorGradoLng),
    mojones.map(p => p.lat * 111_320),
  ) * sigma_vertice_m;
}
