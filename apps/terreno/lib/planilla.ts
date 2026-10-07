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
