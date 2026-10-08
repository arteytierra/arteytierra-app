/**
 * La planilla de replanteo: el papel que va al lado del plano.
 *
 * ── Qué es y por qué no alcanza el plano ─────────────────────────────────────
 *
 * Un plano se mira. Una planilla se usa con una cinta, un nivel y una mira, de
 * pie en el terreno, y por eso no es el plano en forma de tabla: es otra cosa.
 * AH-590 lo dice en una frase que conviene leer despacio: «Each job must be
 * adequately and clearly staked before construction is started. **Staking
 * transmits the information on the drawings to the job site.** This information
 * locates the work and provides the lines, grade, and elevations required for
 * construction in accordance with the drawings.» Replantear es el acto de pasar
 * el plano al suelo, y la planilla es lo que se lleva en la mano para hacerlo.
 *
 * La norma de práctica de represas (CPS 378) la pide con nombre propio en su
 * lista de contenidos obligatorios del plano: «Stationing along centerline of
 * fill; show stations of intersections of principal and auxiliary spillway
 * centerlines; **establish stationing ground control**». Y TR-62 define qué
 * estacas hay que poner: «basic staking for embankments and excavations includes
 * centerline, slope (toe of slope or edge of cut) and offset reference stakes
 * with hubs at each station and more frequently on curves […] It also includes
 * stakes at **significant breaks in topography** or changes in section of the
 * planned work.»
 *
 * ── Las cuatro cosas que este módulo decide con una fuente y no a ojo ────────
 *
 * 1 · **Cada cuánto va una estaca.** AH-590, al describir el replanteo de un
 *     muro: «set stakes along its centerline at **intervals of 100 feet or
 *     less**». 100 pies son 30,48 m, y el cap. 1 del EFH dice lo mismo desde el
 *     otro lado: «Survey distances are recorded by stations, which are usually
 *     30 m (100 ft) apart». No es una convención de acequia: es un máximo
 *     publicado, y acequia lo recorta si le piden más.
 *
 * 2 · **Cómo se escribe la progresiva.** El cap. 1 del EFH la define con un
 *     ejemplo resuelto, que es lo que la vuelve inequívoca: «a point on a line
 *     94.24 m (309.2 ft) beyond station 3+05 m (10+00 ft) is indicated as
 *     station **3+99.24**». 305 + 94,24 = 399,24, con lo cual la **estación
 *     entera de la versión métrica son 100 m** y lo que va después del `+` son
 *     los metros dentro de ella. La prosa del mismo capítulo dice «30 m» porque
 *     ahí convirtió blando los 100 pies del intervalo de estaca; el ejemplo
 *     manda sobre la prosa, y son dos números distintos que no se contradicen:
 *     **la estaca cada 30 m, la progresiva escrita en estaciones de 100 m**.
 *
 * 3 · **Con cuántos decimales se imprime una cota.** Es la pregunta que el
 *     anexo del modelo declarado (`modeloDeclarado.ts`) dejó abierta y que acá
 *     tiene respuesta publicada, en dos niveles. TR-62: «Elevations for
 *     earthwork are usually computed to the nearest **one-tenth (0.1) foot**
 *     […] It is standard practice to set grades for the various elements of
 *     structures to the nearest **one-hundredth (0.01) of a foot**». Y el EFH
 *     cap. 1, en métrico: «Ground rod readings are taken to the nearest 0.01 m
 *     […] Rod readings and elevations on TP's and BM's should be read and
 *     recorded to **0.001 m**». Son 3 cm para movimiento de suelo, 3 mm para
 *     una rasante de estructura y 1 mm para un mojón.
 *
 *     **Y acá aparece lo que importa.** La incertidumbre punto a punto de un
 *     modelo de elevación satelital es del orden de 1,2 m. La precisión que la
 *     norma de campo pide para una cota de movimiento de suelo es de 3 cm. El
 *     dato que acequia tiene es **cuarenta veces más grueso que la planilla que
 *     se va a llenar con él**. Por eso esta planilla no imprime cotas de
 *     terreno como si fueran datos de replanteo: imprime **las progresivas, los
 *     mojones y la rasante de diseño** —que son geometría, y la geometría no
 *     tiene el error del DEM— y deja la columna de cota de terreno para que la
 *     llene el nivel. Es una planilla para ir a medir, no el resultado de haber
 *     medido.
 *
 * 4 · **Qué quiebre del terreno merece su propia estaca.** TR-62 pide estacas en
 *     los «significant breaks in topography» y no define «significant», así que
 *     acequia lo define con el único número publicado que hay a mano: un quiebre
 *     es significativo cuando saltearlo falsea el terreno **en más que la
 *     precisión con la que la norma pide anotarlo**. Es un criterio derivado, no
 *     inventado, y tiene una consecuencia que la planilla dice en voz alta: con
 *     la incertidumbre del DEM en la mano, **ningún quiebre llega al umbral**,
 *     porque el umbral es 3 cm y el error es 1,2 m. Los quiebres los va a
 *     encontrar el que camine el eje con el nivel.
 *
 * ── Lo que la planilla sí resuelve sin medir nada ────────────────────────────
 *
 * La columna que se usa en el campo no es la cota absoluta: es **la altura
 * respecto del mojón de referencia**. TR-62, en las notas de un dique chico de
 * predio, enumera exactamente lo que se le entrega al dueño: «Total fill height
 * (design height plus allowance for settlement) at each station **as measured
 * from the reference hub**», las dimensiones del vertedero y su cota respecto
 * del mismo mojón, el ancho de coronamiento y los taludes. Todo relativo.
 *
 * Y eso no es una comodidad de campo: es la misma cuenta del anexo B. Una altura
 * respecto de un mojón es una **resta**, y en una resta el sesgo compartido del
 * modelo de elevación se cancela entero (ver `modeloDeclarado.ts`). La convención
 * de campo y el análisis de incertidumbre dan la misma respuesta por caminos
 * distintos, lo cual es una buena señal de que las dos están bien.
 *
 * El mojón tampoco se pone donde uno quiera: el EFH cap. 1 dice «set a hub stake
 * driven flush with the ground **every 150 m (500 ft) or less** in order to "tie
 * in" or relate other survey work to the profile».
 *
 * ── Lo que este módulo NO hace ───────────────────────────────────────────────
 *
 * No mide. No reemplaza el relevamiento: lo ordena. No pone las estacas de talud
 * —que salen de la sección, y la sección la calcula `cutfill.ts`— ni las de
 * curva, porque la geometría de curva circular del EFH cap. 1 pide datos de
 * curva que acequia todavía no declara. Y no firma: el bloque de carátula que
 * pide el cap. 5 del EFH («who designed, drafted, and approved the work») lo
 * completa una persona.
 *
 * Fuentes: TR-62 (SCS, 1979); NEH Part 650 EFH cap. 1 «Engineering Surveys»
 * (métrico) y cap. 5 «Preparation of Engineering Plans»; AH-590 (NRCS, 1997);
 * CPS 378 «Pond»; Construction Specification «Earthfill».
 */
import { distanciaMetros } from './dibujos';
import { PIE_M }           from './represaDiseno';
import { incertidumbreDeCota, redondearGUM } from './modeloDeclarado';
import { GIRO_MAX_TRACTOR_DEG } from './keylineGeometria';
import type { FuenteRelieve } from './grillaElevacion';

// ─── 0 · Fuentes ──────────────────────────────────────────────────────────────

export const FUENTE_TR62 =
  'USDA Soil Conservation Service, Technical Release 62, «Engineering Layout, Notes, Staking and Calculations», enero de 1979.';
export const FUENTE_EFH1 =
  'USDA NRCS, National Engineering Handbook, Part 650 — Engineering Field Handbook, cap. 1 «Engineering Surveys» (edición métrica).';
export const FUENTE_EFH5 =
  'USDA Soil Conservation Service, Engineering Field Manual, cap. 5 «Preparation of Engineering Plans».';
export const FUENTE_AH590_REPLANTEO =
  'USDA NRCS, Agriculture Handbook 590, «Ponds — Planning, Design, Construction» (1997), «Staking for construction» y «Layout», p. 51-52.';
export const FUENTE_CPS378 =
  'USDA NRCS, Conservation Practice Standard «Pond» (Code 378), sección «Plans and Specifications».';
export const FUENTE_CS_TERRAPLEN =
  'USDA NRCS, Construction Specification «Earthfill», sección «Control of Moisture Content».';

// ─── 1 · Los números publicados ───────────────────────────────────────────────

/**
 * Intervalo máximo entre estacas del eje (m).
 *
 * AH-590, replanteo de un muro: «set stakes along its centerline at intervals of
 * **100 feet or less**». El EFH cap. 1 lo dice igual: las estaciones «are usually
 * 30 m (100 ft) apart». Es un máximo: más corto siempre se puede.
 */
export const INTERVALO_ESTACA_MAX_M = 100 * PIE_M;   // 30,48 m

/**
 * Cada cuánto va un mojón de referencia (m).
 *
 * EFH cap. 1: «set a hub stake driven flush with the ground **every 150 m
 * (500 ft) or less** in order to "tie in" or relate other survey work to the
 * profile».
 */
export const MOJON_CADA_M = 150;

/**
 * La estación entera de la progresiva métrica (m).
 *
 * Del ejemplo resuelto del EFH cap. 1: 3+05 más 94,24 m da 3+99,24. Ver el
 * encabezado: el ejemplo manda sobre la prosa.
 */
export const ESTACION_M = 100;

/** TR-62: cotas de movimiento de suelo al décimo de pie. */
export const PRECISION_TIERRA_M = Math.round(0.1 * PIE_M * 1e6) / 1e6;        // 0,030480 m
/** TR-62: rasantes de estructura al centésimo de pie. */
export const PRECISION_ESTRUCTURA_M = Math.round(0.01 * PIE_M * 1e6) / 1e6;   // 0,003048 m
/** EFH cap. 1: lectura de mira y cota de terreno al centímetro. */
export const PRECISION_LECTURA_M = 0.01;
/** EFH cap. 1: cota de mojón y de punto de cambio al milímetro. */
export const PRECISION_MOJON_M = 0.001;

/** Qué se está replanteando. Decide la precisión que pide la norma. */
export type ClaseDeObra = 'tierra' | 'estructura';

/** La precisión que pide la norma para cada clase de obra (m). */
export const PRECISION_POR_OBRA: Record<ClaseDeObra, number> = {
  tierra:     PRECISION_TIERRA_M,
  estructura: PRECISION_ESTRUCTURA_M,
};

// ─── 2 · La progresiva ────────────────────────────────────────────────────────

/**
 * Escribe una distancia sobre el eje en la notación de progresiva del EFH:
 * estaciones enteras de 100 m, un `+`, y los metros dentro de la estación.
 *
 * `progresivaTexto(399.24)` → `'3+99,24'`. `progresivaTexto(0)` → `'0+00'`.
 *
 * Nunca se escriben progresivas negativas, que es una regla explícita y repetida
 * de las dos fuentes: «Negative stationing must not be used […] Negative
 * stationing tends to be confusing and to cause errors» (TR-62), «This avoids
 * having to record minus stationing, which is always confusing» (EFH cap. 1).
 * Un eje que arranca antes del origen se corre: el EFH propone «use a higher
 * station such as 3+00». Acá la entrada se valida y un eje con progresiva
 * negativa no produce planilla.
 */
export function progresivaTexto(dist_m: number, decimales = 2): string {
  if (!Number.isFinite(dist_m) || dist_m < 0) return '—';
  const estacion = Math.floor(dist_m / ESTACION_M);
  const resto    = dist_m - estacion * ESTACION_M;
  // Los metros dentro de la estación van siempre con dos dígitos a la izquierda
  // de la coma, que es cómo se lee «3+05» y no «3+5».
  const enteros  = Math.floor(resto);
  const dec      = resto - enteros;
  const pad      = String(enteros).padStart(2, '0');
  if (decimales <= 0 || dec < Math.pow(10, -decimales) / 2) return `${estacion}+${pad}`;
  const decTexto = dec.toFixed(decimales).slice(2);
  return `${estacion}+${pad},${decTexto}`;
}

// ─── 3 · La varilla de rasante ────────────────────────────────────────────────

/**
 * La varilla de rasante (grade rod), que es el truco por el cual una cuadrilla
 * replantea sin convertir ninguna lectura a cota.
 *
 * TR-62: «The grade rod is obtained by subtracting the planned elevation at each
 * station from the height of instrument (Grade Rod = H.I. − Planned Elev.)». Y
 * después: «To find the cut or fill in construction layout surveys, subtract the
 * actual rod reading from the grade rod. If the result has minus value, a fill is
 * indicated. If the result has a plus value, it indicates a cut.»
 *
 * Lo que acequia agrega es que **no hace falta saber la altura del instrumento**.
 * Si el nivel se cala en cualquier parte y se lee la mira sobre el mojón de
 * referencia, entonces `H.I. = cota_mojón + lectura_mojón`, y como la cota de
 * diseño es `cota_mojón + Δ` con `Δ` la altura sobre el mojón que la planilla
 * trae impresa, la cota del mojón se cancela:
 *
 *     varilla = (cota_mojón + lectura_mojón) − (cota_mojón + Δ) = lectura_mojón − Δ
 *
 * Es decir: la varilla sale de dos números que la cuadrilla tiene —la lectura
 * sobre el mojón y la columna Δ de la planilla— y **ninguno de los dos necesita
 * un datum ni una cota absoluta**. Por eso la planilla es usable con un DEM
 * satelital de abajo: lo único que el DEM aporta es la geometría del eje, y las
 * cotas las pone el nivel.
 */
export function varillaDeRasante(lecturaSobreMojon_m: number, alturaSobreMojon_m: number): number {
  return lecturaSobreMojon_m - alturaSobreMojon_m;
}

/**
 * Corte (positivo) o relleno (negativo) a partir de la varilla y la lectura en
 * la estación. TR-62: «subtract the actual rod reading from the grade rod».
 */
export function corteOrelleno(varilla_m: number, lecturaEnEstacion_m: number): number {
  return varilla_m - lecturaEnEstacion_m;
}

// ─── 4 · Tipos de la planilla ─────────────────────────────────────────────────

/**
 * Para qué es el relevamiento. TR-62 lo exige en el encabezado: «Purpose of
 * survey (design, construction layout, construction check, etc.)». No es un
 * adorno: la misma tabla de progresivas se llena distinto si se está diseñando,
 * replanteando o verificando lo construido.
 */
export type Proposito = 'diseno' | 'replanteo' | 'verificacion';

export const PROPOSITO_TEXTO: Record<Proposito, string> = {
  diseno:       'Relevamiento de diseño',
  replanteo:    'Replanteo de construcción',
  verificacion: 'Verificación de obra construida',
};

/** Un punto del eje, con su cota de terreno si se la conoce. */
export interface PuntoEje {
  lat:    number;
  lng:    number;
  cota_m?: number | null;
}

/**
 * La rasante de diseño a lo largo del eje.
 *
 * Una sola recta alcanza para casi todo lo que acequia diseña: la corona de un
 * muro es horizontal (`pendiente_pct: 0`), un swale y un surco keyline llevan la
 * pendiente deliberada del método, y un canal o una zanja su pendiente de
 * proyecto. Una rasante quebrada se arma con dos planillas, que es lo que hace
 * una cuadrilla igual.
 */
export interface DisenoDeRasante {
  /** Cota de diseño en la progresiva 0 (m). */
  cota_inicial_m: number;
  /** Pendiente de la rasante en %: positiva sube con la progresiva. */
  pendiente_pct:  number;
}

export type TipoDeRenglon = 'estacion' | 'quiebre' | 'vertice' | 'cruce' | 'fin';

/** Lado del eje, mirando en el sentido en que crece la progresiva. */
export type Lado = 'izq' | 'der' | 'eje';

export interface MojonReferencia {
  id:           string;
  progresiva_m: number;
  rotulo:       string;
  /** Cota del terreno en el mojón, si el modelo de elevación la dio. */
  cota_m:       number | null;
}

export interface RenglonPlanilla {
  progresiva_m: number;
  /** La progresiva escrita: `3+99,24`. */
  rotulo:       string;
  tipo:         TipoDeRenglon;
  /** Qué hay en esa progresiva, cuando no es una estación más. */
  nota:         string | null;
  lat:          number;
  lng:          number;
  /** Cota del terreno según el modelo de elevación. Orientativa: ver `precision`. */
  cota_terreno_m: number | null;
  /** Cota de la rasante de diseño. Geometría, no dato medido. */
  cota_diseno_m:  number | null;
  /** Diseño − terreno. Positivo = relleno; negativo = corte. */
  relleno_m:      number | null;
  /** Mojón de referencia que gobierna este renglón. */
  mojon:          string | null;
  /** Δ: cota de diseño menos cota del mojón. Es la columna que se usa en el campo. */
  altura_sobre_mojon_m: number | null;
}

export interface PrecisionDeclarada {
  /** La que pide la norma de campo para esta clase de obra (m). */
  pedida_m:     number;
  /** La incertidumbre punto a punto del modelo de elevación (m). `null` si no se publica. */
  disponible_m: number | null;
  /** Cuántas veces más gruesa es la del dato que la que pide la norma. */
  razon:        number | null;
  /** Quién manda: el dato satelital o la norma de campo. */
  gobierna:     'el dato' | 'la norma';
  /** Decimales con los que tiene sentido imprimir una cota de terreno. */
  decimales:    number;
  motivo:       string;
}

/**
 * Un renglón de lo que se entrega además de la tabla.
 *
 * No es un resumen que acequia inventó: la figura 2-1 de TR-62 —un dique chico
 * de predio, diseñado y replanteado en una sola salida al campo— enumera qué se
 * le deja al dueño, y la tabla de progresivas es sólo una parte. Lo demás son el
 * ancho de coronamiento, los taludes, las dimensiones del vertedero y su cota
 * **respecto del mismo mojón**, y las especificaciones de preparación del sitio.
 * Sin eso la planilla dice dónde ir pero no qué construir.
 */
export interface ItemDeEntrega {
  que:   string;
  valor: string;
}

export interface Planilla {
  practica:   string;
  proposito:  Proposito;
  propositoTexto: string;
  fecha:      string;
  responsable: string | null;
  obra:       ClaseDeObra;
  largo_m:    number;
  intervalo_m: number;
  /** El intervalo que pidió el usuario, si hubo que recortarlo al máximo publicado. */
  intervaloPedido_m: number | null;
  mojones:    MojonReferencia[];
  renglones:  RenglonPlanilla[];
  precision:  PrecisionDeclarada;
  /** Lo que se entrega además de la tabla. Vacío cuando la obra no lo define. */
  entrega:    ItemDeEntrega[];
  /** Instrucciones de campo, todas con fuente. */
  notas:      string[];
  fuentes:    string[];
  advertencias: string[];
}

// ─── 5 · Geometría del eje ────────────────────────────────────────────────────

interface EjeMedido {
  /** Progresiva acumulada de cada vértice. */
  progresivas: number[];
  largo_m:     number;
}

function medirEje(eje: readonly PuntoEje[]): EjeMedido {
  const progresivas = [0];
  for (let i = 1; i < eje.length; i++) {
    const a = eje[i - 1]!, b = eje[i]!;
    progresivas.push(progresivas[i - 1]! + distanciaMetros(a.lat, a.lng, b.lat, b.lng));
  }
  return { progresivas, largo_m: progresivas[progresivas.length - 1]! };
}

/** Punto e interpolación de cota en una progresiva dada. */
function enProgresiva(
  eje: readonly PuntoEje[], med: EjeMedido, s: number,
): { lat: number; lng: number; cota_m: number | null } {
  const { progresivas } = med;
  if (s <= 0) {
    const p = eje[0]!;
    return { lat: p.lat, lng: p.lng, cota_m: p.cota_m ?? null };
  }
  if (s >= med.largo_m) {
    const p = eje[eje.length - 1]!;
    return { lat: p.lat, lng: p.lng, cota_m: p.cota_m ?? null };
  }
  let i = 1;
  while (i < progresivas.length && progresivas[i]! < s) i++;
  const s0 = progresivas[i - 1]!, s1 = progresivas[i]!;
  const a = eje[i - 1]!, b = eje[i]!;
  const t = s1 > s0 ? (s - s0) / (s1 - s0) : 0;
  const ca = a.cota_m, cb = b.cota_m;
  const cota = (ca == null || cb == null || !Number.isFinite(ca) || !Number.isFinite(cb))
    ? null
    : ca + t * (cb - ca);
  return { lat: a.lat + t * (b.lat - a.lat), lng: a.lng + t * (b.lng - a.lng), cota_m: cota };
}

/**
 * Los quiebres de terreno que merecen su propia estaca.
 *
 * TR-62 pide estacas en los «significant breaks in topography» y no dice cuánto
 * es significativo. El criterio de acequia: un vértice del eje es un quiebre
 * cuando su cota se aparta de la recta que une las dos estaciones que lo
 * encierran **en más que la precisión con la que la norma pide anotar esa cota**.
 * Saltearlo, abajo de ese umbral, no cambia ningún número que se vaya a escribir.
 *
 * Es un criterio derivado de un número publicado y no una convención nueva. Lo
 * que sí es convención es la decisión de usar la precisión de anotación como
 * umbral de relevancia, y por eso está dicho acá y en la planilla.
 */
function quiebresSignificativos(
  eje: readonly PuntoEje[], med: EjeMedido, estaciones: readonly number[], umbral_m: number,
): Array<{ progresiva_m: number; desvio_m: number }> {
  const out: Array<{ progresiva_m: number; desvio_m: number }> = [];
  for (let i = 1; i < eje.length - 1; i++) {
    const s = med.progresivas[i]!;
    const cota = eje[i]!.cota_m;
    if (cota == null || !Number.isFinite(cota)) continue;
    // Las dos estaciones que lo encierran.
    let antes = estaciones[0] ?? 0;
    let despues = med.largo_m;
    for (const e of estaciones) {
      if (e <= s && e > antes) antes = e;
      if (e >= s && e < despues) despues = e;
    }
    if (despues <= antes) continue;
    const ca = enProgresiva(eje, med, antes).cota_m;
    const cb = enProgresiva(eje, med, despues).cota_m;
    if (ca == null || cb == null) continue;
    const recta = ca + ((s - antes) / (despues - antes)) * (cb - ca);
    const desvio = cota - recta;
    if (Math.abs(desvio) > umbral_m) out.push({ progresiva_m: s, desvio_m: desvio });
  }
  return out;
}

// ─── 6 · Armado de la planilla ────────────────────────────────────────────────

export interface EntradaPlanilla {
  /** Qué se replantea. TR-62 lo pide en el encabezado: «Practice or construction item». */
  practica:   string;
  proposito?: Proposito;
  eje:        readonly PuntoEje[];
  /** Intervalo entre estacas. Si supera el máximo publicado se recorta y se avisa. */
  intervalo_m?: number;
  diseno?:    DisenoDeRasante | null;
  obra?:      ClaseDeObra;
  /** Cruces conocidos con otros elementos del predio, en progresiva. */
  cruces?:    ReadonlyArray<{ progresiva_m: number; que: string }>;
  /** Para declarar la precisión disponible contra la que pide la norma. */
  fuenteRelieve?: FuenteRelieve | null;
  pendienteTerreno_pct?: number | null;
  fecha?:     string;
  responsable?: string | null;
}

/**
 * Las notas de campo, cada una con su fuente. No son consejos: son las reglas
 * que las especificaciones escriben para el que está parado en el terreno, y sin
 * ellas la tabla de progresivas no se puede usar.
 */
function notasDeCampo(obra: ClaseDeObra): string[] {
  const notas = [
    'Izquierda y derecha se leen caminando en el sentido en que CRECE la progresiva, no mirando aguas abajo: es la convención explícita de TR-62 para secciones, estacas de talud y notas, y es distinta de la que se usa para las márgenes de un arroyo.',
    'Para sacar el corte o el relleno no hace falta convertir ninguna lectura a cota. Se cala el nivel donde convenga, se lee la mira sobre el mojón de referencia, y la varilla de rasante de cada estación es esa lectura menos la columna «altura sobre el mojón». Después, varilla menos lectura en la estación: si da positivo es corte, si da negativo es relleno (TR-62).',
    'Toda estaca de construcción se marca con la cota terminada: «All construction stakes should be set and marked to show finish elevation» (TR-62).',
    'El replanteo va antes de que entre la máquina, no en paralelo: «Each job must be adequately and clearly staked before construction is started» (AH-590).',
    'Las anotaciones apretadas producen errores. TR-62 lo dice así: «Crowded notes are difficult to read and can cause errors». Si la planilla no alcanza, se sigue en otra hoja con el número de página.',
  ];
  if (obra === 'tierra') {
    notas.push(
      'La humedad del relleno se controla con la mano y no hace falta laboratorio: la especificación de terraplén dice que, bien amasado, «the soil will form a ball which does not readily separate and will not extrude out of the hand when squeezed tightly». Si está muy seco se moja por aspersión; si está muy mojado se espera a que seque. Las dos salidas no son simétricas, y eso decide el calendario de la obra (ver `etapas.ts`).',
    );
  }
  return notas;
}

/**
 * Arma la planilla de un eje.
 *
 * Devuelve `null` cuando la entrada no da para una planilla usable: menos de dos
 * puntos de eje, un eje de largo cero, o un intervalo no positivo. Una planilla
 * con un solo renglón no es una planilla con un renglón menos: es un papel que
 * no sirve para replantear nada.
 */
export function armarPlanilla(e: EntradaPlanilla): Planilla | null {
  if (e.eje.length < 2) return null;
  const med = medirEje(e.eje);
  if (!(med.largo_m > 0)) return null;

  const intervaloPedido = e.intervalo_m ?? null;
  if (intervaloPedido != null && !(intervaloPedido > 0)) return null;
  const intervalo = Math.min(intervaloPedido ?? INTERVALO_ESTACA_MAX_M, INTERVALO_ESTACA_MAX_M);

  const obra      = e.obra ?? 'tierra';
  const proposito = e.proposito ?? 'replanteo';
  const advertencias: string[] = [];

  if (intervaloPedido != null && intervaloPedido > INTERVALO_ESTACA_MAX_M) {
    advertencias.push(
      `Se pidieron estacas cada ${intervaloPedido.toFixed(0)} m y la planilla las puso cada ${intervalo.toFixed(2)} m: AH-590 fija el intervalo en 100 pies o menos, y es un máximo, no una sugerencia.`,
    );
  }

  // ── Precisión: la que pide la norma contra la que trae el dato ──
  const inc = incertidumbreDeCota(e.fuenteRelieve ?? null, e.pendienteTerreno_pct ?? null);
  const pedida = PRECISION_POR_OBRA[obra];
  const disponible = inc.u_relativa;
  const razon = disponible != null ? disponible / pedida : null;
  const decimales = disponible != null
    ? redondearGUM(0, disponible).decimales
    : Math.max(0, Math.round(-Math.log10(PRECISION_LECTURA_M)));
  const precision: PrecisionDeclarada = {
    pedida_m: pedida,
    disponible_m: disponible,
    razon,
    gobierna: razon != null && razon > 1 ? 'el dato' : 'la norma',
    decimales,
    motivo: disponible == null
      ? `${inc.motivo ?? 'No hay exactitud vertical publicada para esta fuente de relieve.'} Sin ese número no se puede comparar el dato con la precisión que pide la norma, así que las cotas de terreno van como referencia de gabinete y se llenan en el campo.`
      : razon != null && razon > 1
        ? `La norma de campo pide anotar esta cota al ${(pedida * 100).toFixed(1)} cm y el modelo de elevación la trae con ${(disponible * 100).toFixed(0)} cm de incertidumbre punto a punto: ${razon.toFixed(0)} veces más gruesa. Las progresivas, los mojones y la rasante de diseño son geometría y valen; la columna de cota de terreno se llena con el nivel.`
        : `El modelo de elevación trae la cota con ${(disponible * 100).toFixed(1)} cm de incertidumbre punto a punto, por debajo de los ${(pedida * 100).toFixed(1)} cm que pide la norma: acá manda la norma y la cota se imprime con su precisión.`,
  };
  if (razon != null && razon > 1) {
    advertencias.push(
      `Esta planilla NO es un relevamiento: es la lista de dónde ir a medir. La cota de terreno que trae el modelo de elevación es ${razon.toFixed(0)} veces más gruesa que la precisión con la que la norma pide anotarla.`,
    );
  }

  // ── Estaciones ──
  const estaciones: number[] = [];
  for (let s = 0; s < med.largo_m - 1e-6; s += intervalo) estaciones.push(s);
  estaciones.push(med.largo_m);

  // ── Mojones de referencia, cada 150 m o menos ──
  const mojones: MojonReferencia[] = [];
  for (let s = 0, n = 1; s < med.largo_m + 1e-6; s += MOJON_CADA_M, n++) {
    const p = enProgresiva(e.eje, med, Math.min(s, med.largo_m));
    mojones.push({
      id: `M${n}`,
      progresiva_m: Math.min(s, med.largo_m),
      rotulo: `M${n} en ${progresivaTexto(Math.min(s, med.largo_m))}`,
      cota_m: p.cota_m,
    });
  }

  const mojonDe = (s: number): MojonReferencia | null => {
    let elegido: MojonReferencia | null = null;
    for (const m of mojones) if (m.progresiva_m <= s + 1e-6) elegido = m;
    return elegido;
  };

  const cotaDiseno = (s: number): number | null =>
    e.diseno ? e.diseno.cota_inicial_m + (e.diseno.pendiente_pct / 100) * s : null;

  // ── Renglones: estaciones, quiebres, vértices singulares y cruces ──
  type Crudo = { s: number; tipo: TipoDeRenglon; nota: string | null };
  const crudos: Crudo[] = estaciones.map((s, i) => ({
    s,
    tipo: i === estaciones.length - 1 ? 'fin' : 'estacion',
    nota: i === estaciones.length - 1 ? 'Fin del eje' : null,
  }));

  const umbral = pedida;
  for (const q of quiebresSignificativos(e.eje, med, estaciones, umbral)) {
    crudos.push({
      s: q.progresiva_m,
      tipo: 'quiebre',
      nota: `Quiebre del terreno: ${q.desvio_m > 0 ? '+' : ''}${(q.desvio_m * 100).toFixed(0)} cm respecto de la recta entre estaciones`,
    });
  }
  for (const c of e.cruces ?? []) {
    if (!Number.isFinite(c.progresiva_m) || c.progresiva_m < 0 || c.progresiva_m > med.largo_m) continue;
    crudos.push({ s: c.progresiva_m, tipo: 'cruce', nota: c.que });
  }

  // Un solo renglón por progresiva, y si coinciden gana el más informativo:
  // un cruce con un camino es más que «otra estación».
  const peso: Record<TipoDeRenglon, number> = { cruce: 4, quiebre: 3, vertice: 2, fin: 1, estacion: 0 };
  const porProgresiva = new Map<string, Crudo>();
  for (const c of crudos) {
    const k = c.s.toFixed(3);
    const previo = porProgresiva.get(k);
    if (!previo || peso[c.tipo] > peso[previo.tipo]) porProgresiva.set(k, c);
  }

  const renglones: RenglonPlanilla[] = [...porProgresiva.values()]
    .sort((a, b) => a.s - b.s)
    .map(c => {
      const p  = enProgresiva(e.eje, med, c.s);
      const cd = cotaDiseno(c.s);
      const mj = mojonDe(c.s);
      const redondear = (v: number | null) =>
        v == null ? null : Math.round(v * Math.pow(10, precision.decimales)) / Math.pow(10, precision.decimales);
      return {
        progresiva_m: c.s,
        rotulo: progresivaTexto(c.s),
        tipo:   c.tipo,
        nota:   c.nota,
        lat:    p.lat,
        lng:    p.lng,
        cota_terreno_m: redondear(p.cota_m),
        cota_diseno_m:  cd == null ? null : Math.round(cd * 1000) / 1000,
        relleno_m: cd == null || p.cota_m == null ? null : redondear(cd - p.cota_m),
        mojon: mj?.id ?? null,
        altura_sobre_mojon_m:
          cd == null || mj?.cota_m == null ? null : Math.round((cd - mj.cota_m) * 1000) / 1000,
      };
    });

  if (!e.diseno) {
    advertencias.push(
      'Sin rasante de diseño la planilla sale con las progresivas y los mojones y sin corte ni relleno: es la planilla del relevamiento, no la del replanteo.',
    );
  }
  if (renglones.every(r => r.cota_terreno_m == null)) {
    advertencias.push('El eje llegó sin cotas de terreno, así que la columna va vacía para llenar en el campo.');
  }

  return {
    practica: e.practica,
    proposito,
    propositoTexto: PROPOSITO_TEXTO[proposito],
    fecha: e.fecha ?? new Date().toISOString().slice(0, 10),
    responsable: e.responsable ?? null,
    obra,
    largo_m: Math.round(med.largo_m * 100) / 100,
    intervalo_m: Math.round(intervalo * 100) / 100,
    intervaloPedido_m: intervaloPedido != null && intervaloPedido > INTERVALO_ESTACA_MAX_M ? intervaloPedido : null,
    mojones,
    renglones,
    precision,
    entrega: [],
    notas: notasDeCampo(obra),
    fuentes: [FUENTE_TR62, FUENTE_EFH1, FUENTE_AH590_REPLANTEO, FUENTE_CPS378, FUENTE_CS_TERRAPLEN],
    advertencias,
  };
}

// ─── 7 · El cierre perimetral, que es la planilla que todo predio tiene ───────

/**
 * La planilla del cierre perimetral.
 *
 * Es el único replanteo que se puede armar con lo que cualquier proyecto de
 * acequia tiene —los mojones del polígono— y además es el primero que se hace en
 * el campo. La rasante es el propio terreno, así que no lleva corte ni relleno:
 * lo que lleva es dónde va cada poste y dónde va cada esquina, que es lo que se
 * camina con la cinta.
 *
 * El intervalo no sale de acá: sale de la norma de alambrados, por especie y por
 * tipo de cierre (ver `materiales.ts`). Esta función sólo lo recibe.
 */
export function planillaDeCierre(params: {
  mojones: ReadonlyArray<{ lat: number; lng: number; cota_m?: number | null }>;
  /** Separación entre postes de línea (m). La publicada, de `materiales.ts`. */
  separacionPostes_m: number;
  cerrado?: boolean;
  fecha?: string;
  fuenteRelieve?: FuenteRelieve | null;
  pendienteTerreno_pct?: number | null;
}): Planilla | null {
  const { mojones, separacionPostes_m } = params;
  if (mojones.length < 2) return null;
  if (!(separacionPostes_m > 0)) return null;

  // Un poste no es una estaca, y las dos fuentes ponen topes distintos: la
  // especificación de alambrados admite postes hasta 45,72 m en un eléctrico con
  // varillas, y el replanteo tope la estaca en 30,48 m. No se contradicen porque
  // miden cosas distintas —una sostiene el alambre, la otra controla la línea—,
  // así que el claro se parte en tantas estaciones iguales como haga falta para
  // no pasar el tope de replanteo. Con eso cada poste cae sobre una estación.
  const estacionesPorClaro = Math.max(1, Math.ceil(separacionPostes_m / INTERVALO_ESTACA_MAX_M));
  const intervalo = separacionPostes_m / estacionesPorClaro;

  const eje: PuntoEje[] = mojones.map(m => ({ lat: m.lat, lng: m.lng, cota_m: m.cota_m ?? null }));
  if ((params.cerrado ?? true) && mojones.length >= 3) {
    const p = mojones[0]!;
    eje.push({ lat: p.lat, lng: p.lng, cota_m: p.cota_m ?? null });
  }

  // Cada mojón del polígono es una esquina, y una esquina no es un poste de
  // línea: es un conjunto de esquina arriostrado. Van como cruces, que es la
  // categoría de renglón que no se pisa con una estación.
  const med = medirEje(eje);
  const cruces = med.progresivas.slice(0, -1).map((s, i) => ({
    progresiva_m: s,
    que: i === 0 ? 'Mojón 1 — conjunto de esquina arriostrado' : `Mojón ${i + 1} — conjunto de esquina arriostrado`,
  }));

  const planilla = armarPlanilla({
    practica: 'Cierre perimetral',
    proposito: 'replanteo',
    eje,
    intervalo_m: intervalo,
    obra: 'tierra',
    cruces,
    fecha: params.fecha,
    ...(params.fuenteRelieve != null ? { fuenteRelieve: params.fuenteRelieve } : {}),
    ...(params.pendienteTerreno_pct != null ? { pendienteTerreno_pct: params.pendienteTerreno_pct } : {}),
  });
  if (!planilla) return null;

  planilla.advertencias = planilla.advertencias.filter(a => !a.startsWith('Sin rasante de diseño'));
  planilla.notas = [
    `Los postes van cada ${separacionPostes_m.toFixed(2)} m como MÁXIMO, no exactamente: la especificación de alambrados dice «spacing may need to be narrower depending on terrain and pressure from livestock». En un quiebre de pendiente el poste va en el quiebre.`,
    ...(estacionesPorClaro > 1
      ? [`La separación de postes de este cierre (${separacionPostes_m.toFixed(2)} m) supera el tope de replanteo de 30,48 m, así que cada claro se partió en ${estacionesPorClaro} estaciones de ${intervalo.toFixed(2)} m: el poste va cada ${estacionesPorClaro} renglones y las intermedias son para controlar la línea. Un poste sostiene el alambre y una estaca controla la traza: son dos topes publicados que miden cosas distintas.`]
      : []),
    'Cada mojón del polígono es un conjunto de esquina arriostrado y no un poste de línea: la especificación define las esquinas como «braces located where there are changes in fence direction due to slope and alignment changes», y aclara que si un arriostramiento falla se pierde la tensión de todo el hilo.',
    ...planilla.notas,
  ];
  return planilla;
}

// ─── 8 · El corrimiento horizontal de una traza de nivel ──────────────────────

/**
 * Cuánto se puede correr horizontalmente una traza de nivel por el error
 * vertical del modelo de elevación.
 *
 * Es la pregunta que aparece recién cuando la planilla llega al swale, y no es
 * la de la columna de cota. Un swale se traza siguiendo una curva de nivel leída
 * del modelo. Si la cota de esa curva puede estar corrida `u` metros, entonces
 * la curva está **dibujada en otro lugar**, y el error no es vertical: es
 * horizontal. Sobre un plano de pendiente `S` la curva de cota `z` y la de cota
 * `z + u` están separadas por
 *
 *     corrimiento = u / S
 *
 * y nada más. Es geometría elemental, no un método empírico: no tiene
 * calibración ni región de validez más allá de que el terreno se parezca a un
 * plano entre las dos curvas.
 *
 * El número sale grande y conviene no suavizarlo. Con el modelo global —1,22 m
 * punto a punto— y una ladera del 5 %, la traza impresa puede estar a **24 m**
 * de la curva de nivel real; al 2 %, a 61 m. Eso **no** invalida el trazado: la
 * separación entre swales, la cantidad, el volumen interceptado y la sección
 * salen todos de la pendiente media del área, que es un promedio y aguanta. Lo
 * que invalida es ir con el plano a la traza impresa y empezar a excavar. La
 * traza dice **por dónde va** el swale; el nivel dice **dónde**.
 *
 * Ojo con la pendiente, que entra dos veces por razones distintas: una vez para
 * elegir cuál de las dos exactitudes publicadas corresponde —el modelo global
 * declara una para pendiente suave y otra para pendiente fuerte, con su umbral—
 * y otra acá, como gradiente que convierte metros de error vertical en metros de
 * error horizontal. No es doble conteo: son dos usos del mismo dato.
 *
 * Rango de validez: pendiente positiva. En terreno plano el corrimiento no
 * tiende a un número grande, **no existe**: una curva de nivel sobre un plano
 * horizontal no tiene posición definida. Ahí devuelve `null` y lo dice, que es
 * la respuesta correcta y además la que explica por qué un swale en terreno
 * llano se replantea con nivel y no con mapa.
 */
export interface CorrimientoDeTraza {
  /** Incertidumbre vertical punto a punto que se usó (m). */
  u_vertical_m:  number;
  pendiente_pct: number;
  /** Corrimiento horizontal posible de la traza (m). `null` en terreno plano. */
  corrimiento_m: number | null;
  lectura:       string;
}

export function corrimientoDeTraza(
  u_vertical_m: number | null | undefined,
  pendiente_pct: number | null | undefined,
): CorrimientoDeTraza | null {
  if (u_vertical_m == null || !Number.isFinite(u_vertical_m) || u_vertical_m <= 0) return null;
  const p = pendiente_pct != null && Number.isFinite(pendiente_pct) ? pendiente_pct : null;
  if (p == null || p <= 0) {
    return {
      u_vertical_m, pendiente_pct: 0, corrimiento_m: null,
      lectura:
        'Sin pendiente del terreno no se puede decir cuánto se corre la traza, y no porque falte el dato: '
        + 'sobre un plano horizontal una curva de nivel no tiene posición definida. Es el caso en el que la '
        + 'traza del plano no sirve para ubicar la zanja y el replanteo se hace enteramente con el nivel.',
    };
  }
  const corr = u_vertical_m / (p / 100);
  return {
    u_vertical_m, pendiente_pct: p,
    corrimiento_m: Math.round(corr * 10) / 10,
    lectura:
      `Con ${(u_vertical_m * 100).toFixed(0)} cm de incertidumbre vertical punto a punto y una pendiente del `
      + `${p.toFixed(1)} %, la curva de nivel sobre la que se trazó esta zanja puede estar hasta `
      + `${corr.toFixed(corr < 10 ? 1 : 0)} m corrida ladera arriba o ladera abajo respecto de donde la imprime el `
      + 'plano. No es un error de la traza: es la pendiente convirtiendo el error vertical del modelo en error '
      + 'horizontal. La traza dice por dónde va la zanja; el nivel dice dónde.',
  };
}

// ─── 9 · Las tres geometrías que acequia diseña ───────────────────────────────

/**
 * Las tres obras del predio que tienen un eje con rasante, y el motivo por el
 * que cada una necesita su propia función en vez de un `armarPlanilla` suelto.
 *
 * `armarPlanilla` es genérico: recibe un eje con cotas y una recta de rasante.
 * Lo que no es genérico es **qué recta**, **qué va en la columna de entrega** y
 * **qué se le avisa al que va a replantear**, y eso es casi todo lo que hace que
 * la planilla sirva:
 *
 *  · El **muro** lleva una rasante horizontal, pero no la de proyecto: la figura
 *    2-1 de TR-62 enumera lo que se le entrega al dueño de un dique chico de
 *    predio y el primer renglón es «Total fill height (**design height plus
 *    allowance for settlement**) at each station as measured from the reference
 *    hub». La corona se construye más alta de lo que va a quedar, y la planilla
 *    de replanteo es la de la corona construida. Además CPS 378 pide una
 *    progresiva con nombre propio: «show stations of intersections of principal
 *    and auxiliary spillway centerlines».
 *
 *  · El **swale** lleva una rasante horizontal a la profundidad de proyecto por
 *    debajo del terreno, y es el caso donde el sesgo del modelo se cancela del
 *    todo: la zanja se define entera respecto del mojón, sin ninguna cota
 *    absoluta. Pero trae el problema inverso —ver `corrimientoDeTraza`—, que es
 *    que la traza misma puede estar corrida decenas de metros.
 *
 *  · La **directriz keyline** no lleva rasante y eso no es una carencia: el
 *    surco sigue el terreno con la deriva deliberada del método, así que no hay
 *    cota de diseño que replantear. Lo que se replantea es su **posición
 *    horizontal**, porque de ella salen por paralelismo todas las demás líneas.
 */

export interface EntradaPlanillaMuro {
  /** Los dos estribos del eje del muro. La progresiva crece de `a` a `b`. */
  a: { lat: number; lng: number };
  b: { lat: number; lng: number };
  /**
   * Cotas del terreno natural bajo el eje, a paso regular de `a` a `b`.
   * Es la salida de `perfilDeEje` y tiene que estar alineada: el renglón `i`
   * corresponde a la fracción `i/(n−1)` del eje.
   */
  perfil_m?: readonly number[] | null;
  /**
   * Largo del coronamiento con el que se dimensionó el muro (m). Si no coincide
   * con el eje dibujado, la planilla lo dice: el replanteo es del eje.
   */
  longitudDimensionada_m?: number | null;
  /** Cota a la que se CONSTRUYE la corona, con el sobrealto por asentamiento. */
  cotaCoronaConstruida_m?: number | null;
  /** Cota de proyecto de la corona, sin el sobrealto. */
  cotaCoronaDiseno_m?: number | null;
  /** Sobrealto por asentamiento sobre la sección más honda (m). */
  sobrealto_m?: number | null;
  /** Cota del pelo de agua normal, que es la cresta del vertedero. */
  cotaVertedero_m?: number | null;
  /** En qué estribo va el vertedero. CPS 378 pide su progresiva. */
  estriboVertedero?: 'a' | 'b' | null;
  anchoCorona_m?: number | null;
  taludInterno?:  number | null;
  taludExterno?:  number | null;
  zanja?: { prof_m: number; anchoFondo_m: number } | null;
  fuenteRelieve?: FuenteRelieve | null;
  pendienteTerreno_pct?: number | null;
  fecha?: string;
  responsable?: string | null;
}

/** Construye el eje de la planilla desde dos puntos y un perfil alineado. */
function ejeDesdePerfil(
  a: { lat: number; lng: number }, b: { lat: number; lng: number },
  perfil?: readonly number[] | null,
): PuntoEje[] {
  const n = perfil && perfil.length >= 2 ? perfil.length : 2;
  const eje: PuntoEje[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const z = perfil?.[i];
    eje.push({
      lat: a.lat + (b.lat - a.lat) * t,
      lng: a.lng + (b.lng - a.lng) * t,
      cota_m: z != null && Number.isFinite(z) ? z : null,
    });
  }
  return eje;
}

/**
 * La planilla de replanteo del muro de la represa.
 *
 * La rasante es la corona **construida**, horizontal: una sola cota para todo el
 * eje, y la columna de altura sobre el mojón es entonces la altura de relleno de
 * cada estación, que es exactamente el renglón que TR-62 pone primero en la
 * lista de lo que se le entrega al dueño.
 */
export function planillaDeMuro(e: EntradaPlanillaMuro): Planilla | null {
  const eje = ejeDesdePerfil(e.a, e.b, e.perfil_m);
  const cotaCorona = e.cotaCoronaConstruida_m;
  const diseno: DisenoDeRasante | null =
    cotaCorona != null && Number.isFinite(cotaCorona)
      ? { cota_inicial_m: cotaCorona, pendiente_pct: 0 }
      : null;

  const largo = medirEje(eje).largo_m;
  const cruces: Array<{ progresiva_m: number; que: string }> = [];
  if (e.estriboVertedero === 'a' || e.estriboVertedero === 'b') {
    const enElFin = e.estriboVertedero === 'b';
    cruces.push({
      progresiva_m: enElFin ? largo : 0,
      que: `Eje del vertedero principal — estribo ${e.estriboVertedero.toUpperCase()}`
        + (enElFin ? ' · fin del eje del muro' : ' · arranque del eje del muro'),
    });
  }

  const planilla = armarPlanilla({
    practica: 'Muro de represa — eje del coronamiento',
    proposito: 'replanteo',
    eje,
    obra: 'tierra',
    cruces,
    diseno,
    fecha: e.fecha,
    ...(e.responsable != null ? { responsable: e.responsable } : {}),
    ...(e.fuenteRelieve != null ? { fuenteRelieve: e.fuenteRelieve } : {}),
    ...(e.pendienteTerreno_pct != null ? { pendienteTerreno_pct: e.pendienteTerreno_pct } : {}),
  });
  if (!planilla) return null;

  // ── Lo que se entrega además de la tabla (TR-62, fig. 2-1) ──
  const m1 = planilla.mojones[0] ?? null;
  const num = (v: number | null | undefined, d = 2) =>
    v != null && Number.isFinite(v) ? v.toFixed(d) : null;

  const entrega: ItemDeEntrega[] = [];
  entrega.push({
    que: 'Altura de relleno en cada estación',
    valor: cotaCorona != null
      // Es la columna Δ MENOS la lectura de mira, y vale la pena escribirlo así:
      // Δ es la corona respecto del mojón —geometría, la trae la planilla— y la
      // lectura es el terreno respecto del mismo mojón, que se mide. Las dos
      // están referidas al mismo punto, y por eso la cota del mojón se cancela.
      ? 'columna Δ menos la lectura de mira en esa estación, las dos respecto del mismo mojón'
        + (e.sobrealto_m != null && e.sobrealto_m > 0
          ? `; el Δ ya trae el sobrealto por asentamiento de ${num(e.sobrealto_m)} m`
          : '')
      : 'sin cota de coronamiento no se puede imprimir',
  });
  if (e.cotaCoronaDiseno_m != null && cotaCorona != null) {
    entrega.push({
      que: 'Corona de proyecto contra corona construida',
      valor: `${num(e.cotaCoronaDiseno_m)} m de proyecto · se construye a ${num(cotaCorona)} m`,
    });
  }
  if (e.anchoCorona_m != null) {
    entrega.push({ que: 'Ancho de coronamiento', valor: `${num(e.anchoCorona_m)} m` });
  }
  if (e.taludInterno != null && e.taludExterno != null) {
    entrega.push({
      que: 'Taludes (H:1V)',
      valor: `${num(e.taludInterno, 1)}:1 aguas arriba · ${num(e.taludExterno, 1)}:1 aguas abajo`,
    });
  }
  if (e.cotaVertedero_m != null && m1?.cota_m != null) {
    entrega.push({
      que: 'Cresta del vertedero respecto del mojón M1',
      valor: `${(e.cotaVertedero_m - m1.cota_m) >= 0 ? '+' : ''}${num(e.cotaVertedero_m - m1.cota_m)} m`,
    });
  } else if (e.cotaVertedero_m != null) {
    entrega.push({
      que: 'Cresta del vertedero',
      valor: `cota ${num(e.cotaVertedero_m)} m — falta la cota del mojón M1 para darla relativa`,
    });
  }
  if (e.zanja) {
    entrega.push({
      que: 'Zanja de anclaje, bajo todo el eje',
      valor: `${num(e.zanja.prof_m)} m de profundidad por ${num(e.zanja.anchoFondo_m)} m de fondo`,
    });
  }
  entrega.push({
    que: 'Preparación del sitio',
    valor: 'se retiran pasto, piedras y suelo vegetal de toda la huella del terraplén, y el suelo vegetal '
      + 'se acopia en el sitio para devolverlo después sobre el talud externo (AH-590)',
  });
  planilla.entrega = entrega;

  // ── Avisos propios del muro ──
  if (cotaCorona == null) {
    planilla.advertencias.unshift(
      'Sin cota de coronamiento no hay altura de relleno por estación, que es el primer renglón de lo que la '
      + 'norma pide entregar. Elegí el lado del muro y el nivel de agua para que el cálculo la devuelva.',
    );
  }
  const dim = e.longitudDimensionada_m;
  if (dim != null && Number.isFinite(dim) && dim > 0 && Math.abs(dim - largo) > Math.max(1, largo * 0.02)) {
    planilla.advertencias.push(
      `El muro se dimensionó con ${dim.toFixed(0)} m de coronamiento y el eje dibujado mide ${largo.toFixed(0)} m. `
      + 'Esta planilla replantea el eje dibujado, que es el que existe en el terreno: si el largo de proyecto es '
      + 'el otro, el volumen y el replanteo están hablando de dos muros distintos.',
    );
  }
  if (!e.perfil_m || e.perfil_m.length < 3) {
    planilla.advertencias.push(
      'Sin perfil del terreno bajo el eje la planilla sale con las progresivas y los mojones, y la altura de '
      + 'relleno queda sin número: la altura de cada estación es la corona menos el terreno, y el terreno falta.',
    );
  }

  planilla.notas = [
    'La corona se replantea a la cota CONSTRUIDA, que es más alta que la de proyecto: el terraplén asienta. '
      + 'TR-62 lo pone en la primera línea de lo que se entrega —«design height plus allowance for settlement»— '
      + 'y AH-590 aplica el mismo sobrealto al cómputo del volumen.',
    'Esta planilla trae el eje del coronamiento y nada más. Las estacas de talud —el pie del terraplén de cada '
      + 'lado— salen de la sección y no de la progresiva: TR-62 las enumera aparte («slope (toe of slope or edge '
      + 'of cut) and offset reference stakes»), y su posición depende del talud y de la altura de esa estación.',
    'La progresiva del eje del vertedero va marcada en el terreno antes de mover tierra: CPS 378 pide «show '
      + 'stations of intersections of principal and auxiliary spillway centerlines» y «establish stationing '
      + 'ground control» en el mismo renglón.',
    ...planilla.notas,
  ];
  return planilla;
}

// ─── 9.2 · El swale ──────────────────────────────────────────────────────────

/**
 * Por qué el fondo de un swale se anota con la precisión de una rasante de
 * estructura y no con la de un movimiento de suelo.
 *
 * Es un criterio **derivado**, y conviene que se vea la cuenta porque mezcla dos
 * prácticas distintas. TR-62 da dos precisiones de anotación —0,1 pie para una
 * cota de movimiento de suelo, 0,01 pie para una rasante de estructura— y AH-590
 * da el intervalo de estaca, 100 pies. Dividir una por el otro da **la pendiente
 * que el redondeo de la anotación por sí solo puede meter entre dos estacas**, y
 * como las dos cifras están en pies el resultado es exacto:
 *
 *     movimiento de suelo:  0,1 pie / 100 pies = 0,10 %
 *     rasante de estructura: 0,01 pie / 100 pies = 0,01 %
 *
 * Un swale no tiene pendiente: su trabajo es retener agua hasta que infiltre. La
 * única pendiente publicada que acequia tiene a mano para decir cuándo una zanja
 * deja de retener y empieza a drenar es el piso de drenaje de la banda de deriva
 * del surco keyline, **0,2 %** (`DERIVA_MIN_DRENAJE_PCT`), que es de otra
 * práctica y hay que decirlo. Contra ese número:
 *
 *  · anotando como movimiento de suelo, el redondeo solo se come **la mitad** del
 *    margen (0,10 contra 0,20 %);
 *  · anotando como rasante de estructura, se come **la vigésima parte**.
 *
 * Así que acequia anota el fondo del swale con la precisión fina y lo explica, en
 * vez de usar la gruesa porque la zanja se cava con una máquina. No es una
 * reclasificación de la obra —un swale no es una estructura— es una decisión
 * sobre con cuántos decimales se escribe un número, tomada contra el único grado
 * publicado que distingue retener de drenar. Lo que la cerraría de verdad es una
 * tolerancia de rasante publicada para una zanja de infiltración a nivel, que no
 * se leyó.
 */
export const DERIVA_POR_REDONDEO_TIERRA_PCT     = 0.1;
export const DERIVA_POR_REDONDEO_ESTRUCTURA_PCT = 0.01;

export interface EntradaPlanillaSwale {
  /** La traza del swale, como la devuelve el trazado sobre la curva de nivel. */
  puntos: ReadonlyArray<{ lat: number; lng: number }>;
  /** Cota de la curva de nivel sobre la que se trazó (m). */
  cota_m: number;
  /** Profundidad de proyecto de la zanja (m). */
  prof_m?: number | null;
  /** Sección de proyecto, para la lista de entrega. */
  seccion?: { base_m: number; talud_z: number; ancho_sup_m: number } | null;
  /** Cómo se lo nombra en el plano. */
  rotulo?: string;
  /** Pendiente media del área. Decide el corrimiento horizontal de la traza. */
  pendienteTerreno_pct?: number | null;
  fuenteRelieve?: FuenteRelieve | null;
  cruces?: ReadonlyArray<{ progresiva_m: number; que: string }>;
  fecha?: string;
}

export interface PlanillaDeSwale extends Planilla {
  /** Cuánto se puede haber corrido la traza respecto de la curva real. */
  corrimiento: CorrimientoDeTraza | null;
}

/**
 * La planilla de replanteo de un swale.
 *
 * La rasante es el fondo de la zanja: horizontal, a la profundidad de proyecto
 * por debajo de la curva de nivel sobre la que se trazó. Como el mojón de
 * referencia está sobre la misma curva, la columna de altura sobre el mojón da
 * la profundidad y nada más —una resta en la que la cota del modelo se cancela
 * entera—, y eso es lo que hace que un swale se pueda replantear con un nivel de
 * manguera y sin ningún datum.
 *
 * Lo que la planilla no puede arreglar es dónde está la traza: ver
 * `corrimientoDeTraza`.
 */
export function planillaDeSwale(e: EntradaPlanillaSwale): PlanillaDeSwale | null {
  if (e.puntos.length < 2) return null;
  const cota = e.cota_m;
  if (!Number.isFinite(cota)) return null;

  // Por construcción el eje está a una sola cota: es una curva de nivel. No es
  // un relevamiento del terreno y la planilla lo dice.
  const eje: PuntoEje[] = e.puntos.map(p => ({ lat: p.lat, lng: p.lng, cota_m: cota }));
  const prof = e.prof_m != null && Number.isFinite(e.prof_m) && e.prof_m > 0 ? e.prof_m : null;

  const planilla = armarPlanilla({
    practica: e.rotulo ?? `Swale en la cota ${cota.toFixed(2)} m`,
    proposito: 'replanteo',
    eje,
    // Ver el comentario de arriba: la precisión fina no es una reclasificación
    // de la obra, es con cuántos decimales se escribe la cota del fondo.
    obra: 'estructura',
    ...(prof != null ? { diseno: { cota_inicial_m: cota - prof, pendiente_pct: 0 } } : {}),
    ...(e.cruces ? { cruces: e.cruces } : {}),
    fecha: e.fecha,
    ...(e.fuenteRelieve != null ? { fuenteRelieve: e.fuenteRelieve } : {}),
    ...(e.pendienteTerreno_pct != null ? { pendienteTerreno_pct: e.pendienteTerreno_pct } : {}),
  });
  if (!planilla) return null;

  const corrimiento = corrimientoDeTraza(
    planilla.precision.disponible_m, e.pendienteTerreno_pct ?? null,
  );

  const entrega: ItemDeEntrega[] = [];
  if (prof != null) {
    entrega.push({
      que: 'Fondo de la zanja respecto del mojón',
      valor: `−${prof.toFixed(2)} m, igual en toda la traza (zanja a nivel)`,
    });
  }
  if (e.seccion) {
    entrega.push({ que: 'Ancho de fondo', valor: `${e.seccion.base_m.toFixed(2)} m` });
    entrega.push({ que: 'Talud de las paredes (H:1V)', valor: `${e.seccion.talud_z.toFixed(1)}:1` });
    entrega.push({ que: 'Ancho de boca', valor: `${e.seccion.ancho_sup_m.toFixed(2)} m` });
  }
  entrega.push({
    que: 'Pendiente admitida a lo largo de la zanja',
    valor: `0 %. El redondeo de la anotación ya puede meter ${DERIVA_POR_REDONDEO_ESTRUCTURA_PCT.toFixed(2)} % `
      + `entre estacas; con la precisión de movimiento de suelo serían ${DERIVA_POR_REDONDEO_TIERRA_PCT.toFixed(2)} %.`,
  });
  planilla.entrega = entrega;

  // La planilla del swale no es «el relevamiento»: la rasante existe y es el
  // fondo de la zanja. Lo que no existe es un relevamiento del terreno.
  planilla.advertencias = planilla.advertencias.filter(a => !a.startsWith('Sin rasante de diseño'));
  if (prof == null) {
    planilla.advertencias.unshift(
      'Sin profundidad de proyecto la planilla sale con las progresivas y los mojones y sin cota de fondo: '
      + 'dimensioná la sección para que la zanja tenga rasante.',
    );
  }
  planilla.advertencias.unshift(
    `Las cotas de esta planilla son la cota de la curva de nivel sobre la que se trazó el swale `
    + `(${cota.toFixed(2)} m), no una medición: por construcción el eje entero está a una sola cota. Los quiebres `
    + 'del terreno no pueden aparecer acá, los va a encontrar el que camine la traza con el nivel.',
  );
  if (corrimiento) {
    planilla.advertencias.push(corrimiento.lectura);
  }

  planilla.notas = [
    'La zanja va A NIVEL en toda su traza, y eso es lo que se controla: la altura sobre el mojón es la misma en '
      + 'todas las estaciones. Si una estación da distinto, lo que está corrido es la traza, no la profundidad.',
    'El nivel de manguera alcanza y es lo que conviene: toda la planilla se lee contra el mojón de referencia, '
      + 'así que no hace falta ninguna cota absoluta ni ningún instrumento calado.',
    'Si la traza cruza un camino, una alcantarilla, un alambrado o una zanja existente, esa progresiva se mide y '
      + 'se anota aunque no caiga en una estación: «Stations should always be measured and recorded at all '
      + 'important points along the profile line» (EFH cap. 1).',
    ...planilla.notas,
  ];

  return { ...planilla, corrimiento };
}

// ─── 9.3 · La directriz del patrón keyline ───────────────────────────────────

export interface EntradaPlanillaDirectriz {
  /** La directriz del patrón, que es de donde salen por paralelismo las demás. */
  master: ReadonlyArray<{ lat: number; lng: number }>;
  /** Cotas del terreno en cada punto de la directriz, si se pudieron leer. */
  cotas_m?: ReadonlyArray<number | null> | null;
  espaciado_m?: number | null;
  headland_m?: number | null;
  orientacion_deg?: number | null;
  deriva_media_pct?: number | null;
  /** Cuántos vértices de la directriz piden un giro mayor al del tractor. */
  verticesCerrados?: number | null;
  pendienteTerreno_pct?: number | null;
  fuenteRelieve?: FuenteRelieve | null;
  cruces?: ReadonlyArray<{ progresiva_m: number; que: string }>;
  fecha?: string;
}

/**
 * La planilla de replanteo de la directriz del patrón keyline.
 *
 * Es la única de las cuatro que **no lleva rasante**, y no por falta de dato: el
 * surco sigue el terreno con la deriva deliberada del método, así que no hay cota
 * de diseño que replantear. Lo que se replantea es la posición horizontal de la
 * directriz, y eso alcanza porque todas las demás líneas salen de ella por
 * paralelismo: marcada la directriz, el resto lo hace la máquina con su propio
 * ancho.
 *
 * Por eso acá la columna que importa no es la altura sobre el mojón sino la
 * progresiva: es una planilla de traza, y el mojón está para poder volver a
 * encontrarla la temporada que viene.
 */
export function planillaDeDirectriz(e: EntradaPlanillaDirectriz): Planilla | null {
  if (e.master.length < 2) return null;
  const eje: PuntoEje[] = e.master.map((p, i) => ({
    lat: p.lat, lng: p.lng,
    cota_m: e.cotas_m?.[i] ?? null,
  }));

  const planilla = armarPlanilla({
    practica: 'Directriz del patrón keyline',
    proposito: 'replanteo',
    eje,
    obra: 'tierra',
    ...(e.cruces ? { cruces: e.cruces } : {}),
    fecha: e.fecha,
    ...(e.fuenteRelieve != null ? { fuenteRelieve: e.fuenteRelieve } : {}),
    ...(e.pendienteTerreno_pct != null ? { pendienteTerreno_pct: e.pendienteTerreno_pct } : {}),
  });
  if (!planilla) return null;

  const entrega: ItemDeEntrega[] = [];
  if (e.espaciado_m != null) {
    entrega.push({
      que: 'Separación entre líneas',
      valor: `${e.espaciado_m.toFixed(1)} m, paralelas a esta directriz`,
    });
  }
  if (e.headland_m != null) {
    entrega.push({
      que: 'Franja de maniobra libre en el borde',
      valor: `${e.headland_m.toFixed(1)} m`,
    });
  }
  if (e.orientacion_deg != null) {
    entrega.push({ que: 'Orientación general de la directriz', valor: `${Math.round(e.orientacion_deg)}°` });
  }
  if (e.deriva_media_pct != null) {
    entrega.push({
      que: 'Deriva media del surco',
      valor: `${e.deriva_media_pct.toFixed(2)} % a lo largo de la línea`,
    });
  }
  entrega.push({
    que: 'Giro máximo en un vértice',
    valor: `${GIRO_MAX_TRACTOR_DEG}°`
      + (e.verticesCerrados != null && e.verticesCerrados > 0
        ? ` · ${e.verticesCerrados} vértice(s) de la directriz lo pasan y hay que redondearlos en el terreno`
        : ' · ningún vértice de la directriz lo pasa'),
  });
  planilla.entrega = entrega;

  planilla.advertencias = planilla.advertencias.filter(a => !a.startsWith('Sin rasante de diseño'));
  planilla.advertencias.unshift(
    'Esta planilla no lleva cota de diseño y no le falta nada: un surco del patrón sigue el terreno con la deriva '
    + 'que el método busca, así que no hay rasante que replantear. Lo que se replantea es la traza, y de la '
    + 'directriz salen todas las demás líneas por paralelismo.',
  );
  if (e.verticesCerrados != null && e.verticesCerrados > 0) {
    planilla.advertencias.push(
      `${e.verticesCerrados} vértice(s) de la directriz piden un giro mayor a ${GIRO_MAX_TRACTOR_DEG}°, que es `
      + 'más de lo que la mayoría de los tractores puede trazar. En el terreno hay que redondearlos, y redondear '
      + 'un vértice cambia la pendiente de las líneas que salen de él: conviene revisar el patrón antes de '
      + 'marcar la directriz, no después.',
    );
  }

  planilla.notas = [
    'La directriz es la única línea que se replantea. Las demás salen de ella por paralelismo con el ancho del '
      + 'implemento, y por eso un error en la directriz se copia en todo el lote: vale la pena medirla dos veces.',
    'Las progresivas de esta planilla se marcan con algo que sobreviva a la labor —estaca, mojón a ras de suelo o '
      + 'par de referencias fuera del lote—, porque la directriz se vuelve a usar cada temporada.',
    ...planilla.notas,
  ];
  return planilla;
}

// ─── 10 · La planilla en papel y en planilla de cálculo ──────────────────────

/**
 * La planilla como CSV.
 *
 * Es lo que la vuelve usable desde un panel: en el informe la planilla se
 * imprime, pero en la pantalla de diseño no hay página, y una tabla que hay que
 * copiar a mano es una tabla que se copia mal. El archivo sale con la cabecera
 * que TR-62 exige —práctica, propósito, fecha, responsable— y con las dos
 * columnas de campo **vacías**, que es como tiene que salir: se llenan midiendo.
 *
 * Separador coma y punto decimal, igual que el resto de las exportaciones de la
 * app, para que el archivo abra igual en cualquier planilla de cálculo.
 */
export function planillaCSV(p: Planilla): string {
  const q = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const n = (v: number | null | undefined, d: number) =>
    v == null || !Number.isFinite(v) ? '' : v.toFixed(d);
  const dec = p.precision.decimales;

  const L: string[] = [];
  L.push(q('Práctica') + ',' + q(p.practica));
  L.push(q('Propósito') + ',' + q(p.propositoTexto));
  L.push(q('Fecha') + ',' + q(p.fecha));
  L.push(q('Responsable') + ',' + q(p.responsable ?? ''));
  L.push(q('Largo del eje (m)') + ',' + n(p.largo_m, 2));
  L.push(q('Intervalo entre estacas (m)') + ',' + n(p.intervalo_m, 2));
  L.push(q('Precisión que pide la norma (m)') + ',' + n(p.precision.pedida_m, 4));
  L.push(q('Incertidumbre del modelo de elevación (m)') + ',' + n(p.precision.disponible_m, 2));
  for (const it of p.entrega) L.push(q(it.que) + ',' + q(it.valor));
  L.push('');

  L.push([
    'Progresiva', 'Progresiva (m)', 'Qué hay', 'Mojón', 'Altura sobre el mojón (m)',
    'Cota de gabinete (m)', 'Lectura de mira (m)', 'Corte (+) / relleno (-) (m)',
    'Latitud', 'Longitud',
  ].map(q).join(','));
  for (const r of p.renglones) {
    L.push([
      q(r.rotulo), n(r.progresiva_m, 2), q(r.nota ?? ''), q(r.mojon ?? ''),
      n(r.altura_sobre_mojon_m, 3), n(r.cota_terreno_m, dec), '', '',
      r.lat.toFixed(6), r.lng.toFixed(6),
    ].join(','));
  }

  L.push('');
  L.push(q('Cómo se llena'));
  for (const nota of p.notas) L.push(q(nota));
  if (p.advertencias.length > 0) {
    L.push('');
    L.push(q('Avisos'));
    for (const a of p.advertencias) L.push(q(a));
  }
  L.push('');
  L.push(q('Fuentes'));
  for (const f of p.fuentes) L.push(q(f));
  return L.join('\n');
}
