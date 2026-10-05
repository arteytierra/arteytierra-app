/**
 * Balance hídrico del predio mes a mes, y el año que no es el promedio.
 *
 * ## Lo que el plan daba por hecho
 *
 * La etapa G pedía «el balance hídrico mes a mes —el excedente y el déficit— y
 * la variabilidad entre años». Al abrir las fuentes aparecieron tres cosas que
 * el enunciado no tenía:
 *
 * **1. La app ya mostraba una columna llamada «balance» que no es el balance.**
 * `MesDato.balance_mm` es `precipitación − ETP`, que es el *primer paso* del
 * procedimiento —Thornthwaite lo llama `P − PE`— y no es ni el déficit ni el
 * excedente. GAEZ v4 publica la definición sin ambigüedad: el déficit es
 * `WDe = ETm − ETa`, la diferencia entre la demanda y lo que el agua **del
 * suelo** alcanzó a satisfacer. Un mes con `P − ETP = −80` sobre un suelo lleno
 * puede tener déficit cero; otro con `−20` sobre un suelo vacío tiene déficit
 * 20. Sin el suelo en el medio, el número está mal y se parece al correcto.
 *
 * **2. El balance del año promedio no es el promedio de los balances.** El
 * excedente sólo existe arriba de un umbral (el suelo lleno) y el déficit sólo
 * abajo de otro (el suelo vacío); las dos son funciones recortadas de la misma
 * serie, así que promediar la entrada mata las dos colas. Medido sobre un clima
 * de lluvia estival con 25 % de variación interanual y la **misma** lluvia media
 * anual, el año promedio dice 51 mm de déficit donde el promedio de los años da
 * 140 —casi el triple— y dice **cero** excedente donde los años dan 88 mm por
 * año. No falla para un lado: esconde el déficit *y* esconde el excedente.
 * FAO-56 no es la que avisa de esto; lo avisan las dos guías de FAO que mandan
 * trabajar año por año, y están citadas abajo.
 *
 * **3. Hay dos reglas publicadas para vaciar el suelo y no coinciden.** Y la
 * diferencia no es de matiz: con un suelo profundo y un déficit suave dan 61 y
 * 12 mm de déficit anual sobre el mismo clima —factor **5**—, y el déficit es lo
 * que decide si acequia le dice a alguien que necesita riego. Donde el déficit
 * es severo las dos coinciden, porque el agua se va igual. Ver `compararReglas`.
 *
 * ## Las fuentes, todas gratuitas y verificables
 *
 * 1. **Thornthwaite, C.W. y Mather, J.R., «The Water Balance»** (Publications in
 *    Climatology VIII(1), Drexel Institute of Technology, 1955) y
 *    **«Instructions and Tables for Computing Potential Evapotranspiration and
 *    the Water Balance»** (X(3), 1957). El procedimiento original; sus tablas de
 *    retención son el corazón del cálculo. No se leen directo acá: se leen por
 *    las dos de abajo, que las publican como ecuación.
 *
 * 2. **McCabe, G.J. y Markstrom, S.L., «A Monthly Water-Balance Model Driven by
 *    a Graphical User Interface», USGS Open-File Report 2007-1088**. Publica el
 *    procedimiento como ecuaciones. De ahí salen:
 *      • la extracción del suelo, su ecuación 9, con la aclaración de que
 *        *«Soil-moisture storage withdrawal linearly decreases with decreasing ST
 *        such that as the soil becomes drier, water becomes more difficult to
 *        remove from the soil and less is available for AET»*;
 *      • *«If the sum of Ptotal and STW is less than PET, then a water deficit is
 *        calculated as PET−AET. If Ptotal exceeds PET, then AET is equal to PET
 *        and the water in excess of PET replenishes ST. When ST is greater than
 *        STC, the excess water becomes surplus (S)»*;
 *      • el valor por defecto de capacidad: *«An STC of 150 mm works for most
 *        locations»* → `AWC_POR_DEFECTO_MM`.
 *
 * 3. **Westenbroek, S.M. y otros, «SWB — A Modified Thornthwaite-Mather
 *    Soil-Water-Balance Code for Estimating Groundwater Recharge», USGS
 *    Techniques and Methods 6-A31** (2010). Define los términos con los que este
 *    módulo nombra sus campos: *«the accumulated potential water loss is
 *    calculated as a running sum of the daily P−PE values during periods when
 *    P−PE is negative»*; *«When P−PE is negative, the actual evapotranspiration
 *    is equal only to the amount of water that can be extracted from the soil»*;
 *    *«the daily soil-moisture deficit is the amount by which the actual
 *    evapotranspiration differs from the potential evapotranspiration»*. Y una
 *    advertencia que vale para acequia, porque acequia **no** usa la ETP de
 *    Thornthwaite: *«Vörösmarty and others (1998) show that the
 *    Thornthwaite-Mather evapotranspiration calculation method tends to be
 *    biased low (as much as -94 mm/yr) relative to other common methods; use of
 *    the table 10 water-holding capacities with other evapotranspiration methods
 *    may result in overestimation of the amount of evapotranspiration and
 *    underestimation of recharge.»* La capacidad del suelo y el método de ETP
 *    son un par: cambiás uno y el resultado se corre.
 *
 * 4. **Dourado-Neto, D., van Lier, Q.J., Metselaar, K., Reichardt, K. y Nielsen,
 *    D.R., «General procedure to initialize the cyclic soil water balance by the
 *    Thornthwaite and Mather method», Scientia Agricola 67(1):87-95** (2010).
 *    El balance cíclico necesita un almacenaje inicial, y de ahí sale el caso
 *    resuelto de este módulo (Petrolina-PE, Brasil, 1975-2006, capacidad 125 mm).
 *    *«the initial soil water storage is generally assumed to be at field
 *    capacity at the end of the wet season […] To close the water balance,
 *    several iterations might be necessary»*, y para climas áridos la hipótesis
 *    de arrancar en capacidad de campo **no vale**. Ver `costoDeNoIterar`.
 *
 * 5. **FAO-56, Allen, R.G., Pereira, L.S., Raes, D. y Smith, M., «Crop
 *    evapotranspiration — Guidelines for computing crop water requirements»,
 *    FAO Irrigation and Drainage Paper 56** (1998), capítulos 4 y 8:
 *      • la segunda regla de agotamiento: `TAW = 1000(θFC − θWP) Zr` (ec. 82),
 *        `RAW = p TAW` (ec. 83) y el coeficiente de estrés `Ks` (ec. 84), con
 *        `Ks = 1` mientras `Dr ≤ RAW` y *«p normally varies from 0.30 for shallow
 *        rooted plants at high rates of ETc (> 8 mm d⁻¹) to 0.70 for deep rooted
 *        plants at low rates of ETc (< 3 mm d⁻¹)»*;
 *      • la ETP de Hargreaves, su ecuación 52 —la que acequia usa en el panel de
 *        clima—, con la instrucción que este módulo ejecuta: *«Equation 52 should
 *        be verified in each new region by comparing with estimates by the FAO
 *        Penman-Monteith equation»*, y el sentido del sesgo: *«Equation 52 has a
 *        tendency to underpredict under high wind conditions (u2 > 3 m/s) and to
 *        overpredict under conditions of high relative humidity.»* Ver
 *        `contrastarEtp`.
 *
 * 6. **FAO, «Guidelines: land evaluation for rainfed agriculture», FAO Soils
 *    Bulletin 52** (1983), §A.1.1 *«Critical limits of growing period»*. El
 *    período de crecimiento en períodos de diez días: *«The growing period is
 *    confined to 10-day periods in which mean daily temperature equals or
 *    exceeds a minimum temperature (e.g. 5°C)»*; *«Beginning of the growing
 *    period: Under rainfed conditions this is taken as the time at which
 *    precipitation equals or exceeds half the potential evapotranspiration»*;
 *    *«Humid period: […] a period in which rainfall exceeds potential
 *    evapotranspiration»*; *«End of the rains: This can be taken as the time at
 *    which precipitation falls below half the potential evapotranspiration»*;
 *    *«End of growing period: The growing period ends when the reserve of water
 *    stored in the soil following the cessation of rainfall and irrigation is
 *    depleted.»* Y, en el mismo capítulo, la indicación de trabajar año por año:
 *    *«This method relies on an analysis of daily rainfall for individual years
 *    of the rainfall record. The distinctive feature of the method is that each
 *    year provides one number»*, con la figura 7 *«showing that growing periods
 *    under rainfed conditions vary from season to season and year to year»*.
 *
 * 7. **IIASA/FAO, «Global Agro-Ecological Zones v4 — Model Documentation»**
 *    (2021), §3.4. Es la versión vigente del mismo criterio de FAO, y **cambió
 *    de variable y de número**: *«LGP refers to the number of days when average
 *    daily temperature is above 5C and ETa of this reference crop exceeds a
 *    specified fraction of ETm. In the current GAEZ parameterization, LGP days
 *    are considered when ETa ≥ 0.4·ETm»*. De ahí salen además la definición del
 *    déficit (*«WDe = ETm-ETa»*), el suelo de referencia de los mapas globales
 *    (*«a soil water holding capacity Smax of 100 mm»* sobre *«an effective soil
 *    depth D of 1m»*), la tabla 3-5 de regímenes de humedad por largo del
 *    período, y el aviso de que los períodos pueden ser más de uno: *«Total
 *    annual LGP days may be in one continuous period or may occur as two or more
 *    discontinuous growing periods.»*
 *
 * 8. **Dastane, N.G., «Effective rainfall in irrigated agriculture», FAO
 *    Irrigation and Drainage Paper 25** (1974), capítulo III §1. La frase que
 *    ordena toda la mitad de variabilidad de esta etapa: *«The water supply
 *    cannot be planned on the minimum value of effective rainfall since this
 *    would result for most years in a highly uneconomic and wasteful project.
 *    Nor can it be based on the average amount of effective rainfall since this
 *    would provide an adequate and assured water supply for approximately only
 *    half the time. Therefore, the value of effective rainfall is computed on a
 *    probability basis.»* Y cómo: *«for a high value crop like vegetables, a
 *    water supply may be based on effective rainfall occurring nine years out of
 *    ten but for a low value crop, five out of ten years may be adequate»*, con
 *    la posición de graficado de Hazen (atribuida a USDA-SCS, 1967)
 *    `Fa = 100(2n − 1) / 2y`. Ver `posicionHazen` y `lluviaConChance`.
 *
 * ## Rango de validez
 *
 * El procedimiento de Thornthwaite-Mather es contabilidad mensual de una sola
 * capa: no tiene nieve, no tiene escorrentía superficial separada, no tiene
 * ascenso capilar ni napa, y supone que toda el agua que pasa la capacidad se va
 * (percola o escurre, el balance no distingue). Para nieve y escorrentía la app
 * tiene otros motores —`climaExtremos.ts` y la familia de `escorrentias.ts`— y
 * este módulo **no** los reemplaza: su excedente es «agua que dejó el suelo»,
 * no «agua que llegó al arroyo».
 *
 * El agotamiento de FAO-56 está calibrado para la zona radicular de un cultivo
 * con su `p`; acá se usa como regla alternativa sobre el mismo perfil del suelo,
 * con `p = 0,5` declarado y editable dentro del rango publicado 0,30–0,70.
 *
 * El período de crecimiento sale en **décadas** (períodos de diez días), que es
 * la resolución que usa FAO Soils Bulletin 52. GAEZ v4 trabaja en días, así que
 * las fechas de inicio y fin de acá tienen la incertidumbre de una década.
 *
 * ## Quién lee esto
 *
 * `components/BalanceHidricoBloque.tsx`, en el panel de clima. El déficit es lo
 * que le entra al riego y a la elección de especies; el excedente es lo que le
 * entra a la recarga, a las represas y a los swales. Si se cambia una constante
 * de acá, se mueven los dos.
 */

// ─── Fuentes, para que la pantalla las pueda citar sin repetirlas ─────────────

export const FUENTE_TM =
  'Thornthwaite y Mather, «The Water Balance» (1955) e «Instructions and Tables for Computing ' +
  'Potential Evapotranspiration and the Water Balance» (1957), Publications in Climatology, ' +
  'Drexel Institute of Technology';

export const FUENTE_USGS_WB =
  'McCabe y Markstrom, «A Monthly Water-Balance Model Driven by a Graphical User Interface», ' +
  'USGS Open-File Report 2007-1088';

export const FUENTE_SWB =
  'Westenbroek y otros, «SWB — A Modified Thornthwaite-Mather Soil-Water-Balance Code for ' +
  'Estimating Groundwater Recharge», USGS Techniques and Methods 6-A31 (2010)';

export const FUENTE_DOURADO =
  'Dourado-Neto, van Lier, Metselaar, Reichardt y Nielsen, «General procedure to initialize the ' +
  'cyclic soil water balance by the Thornthwaite and Mather method», Scientia Agricola 67(1):87-95 (2010)';

export const FUENTE_FAO56 =
  'FAO Irrigation and Drainage Paper 56, Allen, Pereira, Raes y Smith, «Crop evapotranspiration» (1998)';

export const FUENTE_FAO52 =
  'FAO Soils Bulletin 52, «Guidelines: land evaluation for rainfed agriculture» (1983), §A.1.1';

export const FUENTE_GAEZ4 =
  'IIASA/FAO, «Global Agro-Ecological Zones v4 — Model Documentation» (2021), §3.4';

export const FUENTE_FAO25 =
  'FAO Irrigation and Drainage Paper 25, Dastane, «Effective rainfall in irrigated agriculture» (1974), cap. III';

// ─── Constantes publicadas ───────────────────────────────────────────────────

/**
 * Capacidad de agua útil por defecto, cuando el panel de suelo todavía no corrió.
 * USGS OFR 2007-1088: «An STC of 150 mm works for most locations».
 */
export const AWC_POR_DEFECTO_MM = 150;

/**
 * El suelo de referencia de los mapas globales de FAO/GAEZ: «a soil water
 * holding capacity Smax of 100 mm» sobre «an effective soil depth D of 1m».
 * No es el suelo del predio: es el que permite comparar contra el mapa.
 */
export const AWC_REFERENCIA_GAEZ_MM = 100;

/** FAO-56 ec. 83: fracción de agotamiento sin estrés. Valor medio declarado. */
export const FRAC_AGOTAMIENTO_FAO56 = 0.5;

/** FAO-56: «p normally varies from 0.30 […] to 0.70». */
export const FRAC_AGOTAMIENTO_RANGO: readonly [number, number] = [0.30, 0.70];

/** FAO Soils Bulletin 52: arranca el período cuando P ≥ 0,5 ETP. */
export const FRAC_INICIO_FAO52 = 0.5;

/** GAEZ v4: día de período de crecimiento cuando ETa ≥ 0,4 ETm. */
export const FRAC_LGP_GAEZ4 = 0.4;

/** FAO Soils Bulletin 52 y GAEZ v4: temperatura mínima para crecer, «e.g. 5°C». */
export const T_MIN_CRECIMIENTO_C = 5;

/** Décadas (períodos de diez días) en un año: tres por mes. */
export const DEKADAS_ANIO = 36;

/** FAO-56: arriba de este viento, Hargreaves subestima. */
export const VIENTO_SESGO_MS = 3;

/** Días de cada mes en un año no bisiesto. El período de crecimiento sale en días. */
const DIAS_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

/** Largo en días de cada una de las 36 décadas: 10, 10 y el resto del mes. */
export const DIAS_DEKADA: readonly number[] = DIAS_MES.flatMap(d => [10, 10, d - 20]);

const EPS = 1e-9;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const r1 = (x: number) => Math.round(x * 10) / 10;
const suma = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0);
const media = (xs: readonly number[]) => (xs.length === 0 ? 0 : suma(xs) / xs.length);

function desvio(xs: readonly number[]): number {
  if (xs.length < 2) return 0;
  const m = media(xs);
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1));
}

/** Percentil por interpolación lineal. Convención del resto de la app. */
function percentil(xs: readonly number[], p: number): number {
  if (xs.length === 0) return NaN;
  const s = [...xs].sort((a, b) => a - b);
  const idx = (p / 100) * (s.length - 1);
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  return (s[lo] ?? 0) * (1 - (idx - lo)) + (s[hi] ?? 0) * (idx - lo);
}

// ─── El balance cíclico ──────────────────────────────────────────────────────

/**
 * Las dos reglas publicadas para sacarle agua a un suelo que se está secando.
 *
 * `thornthwaite` — la exponencial de las tablas de 1957, tal como la publica la
 * ecuación 9 del USGS: la extracción cae desde el primer milímetro de
 * agotamiento, porque *«as the soil becomes drier, water becomes more difficult
 * to remove»*. Expresada con el almacenaje como estado, es
 * `ST = ST_anterior · exp(−demanda / AWC)`, que es exactamente la tabla
 * `ST = AWC · exp(−APWL / AWC)` escrita de forma incremental. Acá se usa esa
 * forma a propósito: el informe del SWB cuenta que el código viejo convertía
 * almacenaje en «pérdida potencial acumulada» ida y vuelta y *«were not entirely
 * mass conservative»*. Con el almacenaje como único estado, esa conversión no
 * existe y el problema tampoco.
 *
 * `fao56` — la de las ecuaciones 82 a 84: la planta no siente nada mientras el
 * agotamiento no pase `p · TAW`, y recién ahí la extracción cae linealmente con
 * el agua que queda. Integrada dentro del mes da una recta hasta el umbral y una
 * exponencial después, con constante `(1 − p) · TAW` en vez de `TAW`. Las dos
 * reglas son la misma familia: Thornthwaite es la exponencial desde el arranque
 * con constante `TAW`; FAO-56 es plana primero y más rápida después.
 */
export type ReglaAgotamiento = 'thornthwaite' | 'fao56';

export interface MesBalance {
  /** 0 = enero. */
  mesIndex:      number;
  precip_mm:     number;
  etp_mm:        number;
  /** `P − ETP`. El primer paso del procedimiento, y lo que la app llamaba «balance». */
  p_menos_etp_mm: number;
  /** Agua útil almacenada al CIERRE del mes. */
  almacenaje_mm: number;
  /** Evapotranspiración real: lo que la atmósfera se llevó de verdad. */
  etr_mm:        number;
  /** `ETP − ETR`. GAEZ v4: `WDe = ETm − ETa`. */
  deficit_mm:    number;
  /** Agua que pasó la capacidad del suelo y se fue. */
  excedente_mm:  number;
}

export interface BalanceCiclico {
  meses:         MesBalance[];
  /** Totales anuales, sin redondear: alimentan cocientes y comparaciones. */
  precip_mm:     number;
  etp_mm:        number;
  etr_mm:        number;
  deficit_mm:    number;
  excedente_mm:  number;
  awc_mm:        number;
  regla:         ReglaAgotamiento;
  /** `p` de FAO-56. Presente sólo cuando la regla es `fao56`. */
  p:             number | null;
  /** Cuántas vueltas al año hizo falta para que el almacenaje deje de moverse. */
  ciclos:        number;
  convergio:     boolean;
  /** Almacenaje al cierre de diciembre, que es con el que arranca enero. */
  almacenaje_cierre_mm: number;
  /**
   * Residuo del cierre: `P − ETR − excedente − ΔalmacenaJe`. En un ciclo
   * convergido tiene que ser cero. Va en la salida y no en un `assert` porque un
   * número que no cierra es información para el que lee, no un bug para esconder.
   */
  cierre_mm:     number;
  advertencias:  string[];
}

export interface OpcionesBalance {
  regla?:              ReglaAgotamiento;
  /** Fracción de agotamiento de FAO-56. Por defecto `FRAC_AGOTAMIENTO_FAO56`. */
  p?:                  number;
  /** Tope de vueltas al año. Por defecto 50. */
  ciclosMax?:          number;
  /** Tolerancia en mm sobre el almacenaje de cierre. Por defecto 0,001. */
  tol?:                number;
  /** Almacenaje de arranque. Por defecto la capacidad, como el procedimiento clásico. */
  almacenajeInicial?:  number;
}

/** Un paso de mes. Devuelve el almacenaje nuevo y lo que la atmósfera se llevó. */
function pasoDeMes(
  st: number, precip: number, etp: number, awc: number,
  regla: ReglaAgotamiento, p: number,
): { st: number; etr: number; excedente: number } {
  const d = precip - etp;

  if (awc <= 0) {
    // Sin suelo que almacene no hay reserva: se evapora lo que llueve, y nada más.
    const etr = Math.min(precip, etp);
    return { st: 0, etr, excedente: Math.max(0, precip - etp) };
  }

  if (d >= 0) {
    // USGS: «If Ptotal exceeds PET, then AET is equal to PET and the water in
    // excess of PET replenishes ST. When ST is greater than STC, the excess
    // water becomes surplus.»
    const bruto = st + d;
    return { st: Math.min(bruto, awc), etr: etp, excedente: Math.max(0, bruto - awc) };
  }

  const demanda = -d;
  let stNuevo: number;

  if (regla === 'thornthwaite') {
    stNuevo = st * Math.exp(-demanda / awc);
  } else {
    // FAO-56 ec. 84. El umbral está escrito en agua REMANENTE, no en agotamiento:
    // `Dr = RAW` equivale a `ST = TAW − p·TAW = (1 − p)·TAW`.
    const umbral = (1 - p) * awc;
    if (st > umbral) {
      const sinEstres = st - umbral;              // tramo con Ks = 1
      stNuevo = demanda <= sinEstres
        ? st - demanda
        : umbral * Math.exp(-(demanda - sinEstres) / umbral);
    } else {
      stNuevo = st * Math.exp(-demanda / umbral);
    }
  }

  // SWB: «the actual evapotranspiration is equal only to the amount of water
  // that can be extracted from the soil». Lo que llovió más lo que salió del suelo.
  const etr = precip + (st - stNuevo);
  return { st: stNuevo, etr, excedente: 0 };
}

/**
 * El balance cíclico, iterado hasta que el almacenaje de cierre deja de moverse.
 *
 * Por qué itera: el año es un ciclo cerrado y el almacenaje de enero es el de
 * diciembre. Arrancar en capacidad de campo y no volver —que es lo que se hace
 * cuando nadie avisa— le regala al cálculo un suelo lleno que en un clima seco
 * no existe. En el caso resuelto de Petrolina eso son **125 mm de ETR por año
 * que no ocurrieron**, justo la capacidad entera del suelo, gastada una vez de
 * arriba. Ver `costoDeNoIterar`.
 *
 * Devuelve `null` si los arreglos no son de doce meses: un balance con once
 * meses no es un balance con un mes menos, es un número equivocado.
 */
export function balanceCiclico(
  precip: readonly number[],
  etp: readonly number[],
  awc_mm: number,
  opciones: OpcionesBalance = {},
): BalanceCiclico | null {
  if (precip.length !== 12 || etp.length !== 12) return null;
  if (!Number.isFinite(awc_mm)) return null;

  const regla     = opciones.regla ?? 'thornthwaite';
  const p         = opciones.p ?? FRAC_AGOTAMIENTO_FAO56;
  const ciclosMax = opciones.ciclosMax ?? 50;
  const tol       = opciones.tol ?? 0.001;
  const awc       = Math.max(0, awc_mm);

  let st = opciones.almacenajeInicial ?? awc;
  let meses: MesBalance[] = [];
  let ciclos = 0;
  let convergio = false;

  for (let c = 1; c <= ciclosMax; c++) {
    const previo = st;
    meses = [];
    for (let i = 0; i < 12; i++) {
      const pm = precip[i] ?? 0;
      const em = etp[i] ?? 0;
      const paso = pasoDeMes(st, pm, em, awc, regla, p);
      st = paso.st;
      meses.push({
        mesIndex:       i,
        precip_mm:      pm,
        etp_mm:         em,
        p_menos_etp_mm: pm - em,
        almacenaje_mm:  paso.st,
        etr_mm:         paso.etr,
        deficit_mm:     Math.max(0, em - paso.etr),
        excedente_mm:   paso.excedente,
      });
    }
    ciclos = c;
    if (Math.abs(st - previo) < tol) { convergio = true; break; }
  }

  const etr_mm       = suma(meses.map(m => m.etr_mm));
  const excedente_mm = suma(meses.map(m => m.excedente_mm));
  const deficit_mm   = suma(meses.map(m => m.deficit_mm));
  const precip_total = suma(meses.map(m => m.precip_mm));
  const etp_total    = suma(meses.map(m => m.etp_mm));

  const advertencias: string[] = [];
  if (!convergio) {
    advertencias.push(
      `El almacenaje del suelo no se estabilizó en ${ciclosMax} vueltas al año. ` +
      'El balance que se muestra es el de la última vuelta y puede arrastrar el arranque.',
    );
  }
  if (awc <= 0) {
    advertencias.push(
      'Capacidad de agua útil cero o desconocida: el suelo no guarda nada, así que ' +
      'cada mes vive de su propia lluvia. Es el caso más seco posible, no el del predio.',
    );
  }

  // En un ciclo convergido el almacenaje vuelve al mismo lugar, así que
  // ΔalmacenaJe = 0 y el cierre es P − ETR − excedente.
  const cierre_mm = precip_total - etr_mm - excedente_mm;

  return {
    meses, precip_mm: precip_total, etp_mm: etp_total, etr_mm, deficit_mm, excedente_mm,
    awc_mm: awc, regla, p: regla === 'fao56' ? p : null,
    ciclos, convergio, almacenaje_cierre_mm: st, cierre_mm, advertencias,
  };
}

// ─── Lo que cuesta no iterar ─────────────────────────────────────────────────

export interface CostoDeNoIterar {
  /** Déficit anual del balance iterado hasta converger. */
  deficit_mm:            number;
  /** Déficit anual de una sola pasada arrancando en capacidad de campo. */
  deficit_sin_iterar_mm: number;
  etr_mm:                number;
  etr_sin_iterar_mm:     number;
  /**
   * ETR inventada por la pasada única: agua que el cálculo se saca de un suelo
   * que supuso lleno. En un clima donde el suelo nunca se llena, tiende a la
   * capacidad entera.
   */
  agua_fantasma_mm:      number;
  ciclos:                number;
  convergio:             boolean;
}

export function costoDeNoIterar(
  precip: readonly number[], etp: readonly number[], awc_mm: number,
  opciones: OpcionesBalance = {},
): CostoDeNoIterar | null {
  const conv = balanceCiclico(precip, etp, awc_mm, opciones);
  const una  = balanceCiclico(precip, etp, awc_mm, { ...opciones, ciclosMax: 1 });
  if (!conv || !una) return null;
  return {
    deficit_mm:            conv.deficit_mm,
    deficit_sin_iterar_mm: una.deficit_mm,
    etr_mm:                conv.etr_mm,
    etr_sin_iterar_mm:     una.etr_mm,
    agua_fantasma_mm:      una.etr_mm - conv.etr_mm,
    ciclos:                conv.ciclos,
    convergio:             conv.convergio,
  };
}

// ─── Las dos reglas, una al lado de la otra ──────────────────────────────────

export interface ComparacionDeReglas {
  thornthwaite:      BalanceCiclico;
  fao56:             BalanceCiclico;
  dif_deficit_mm:    number;
  dif_excedente_mm:  number;
  /** Cociente de déficits, el grande sobre el chico. `null` si alguno es cero. */
  factor_deficit:    number | null;
  /** El mes donde más se separan, y cuánto. */
  mes_mas_separado:  { mesIndex: number; dif_mm: number } | null;
  porque:            string;
  advertencias:      string[];
}

/**
 * Corre el mismo clima con las dos reglas publicadas.
 *
 * El resultado medido, que es el que hay que mostrar: **donde el déficit es
 * severo las dos coinciden, y donde es suave se separan por un factor 5.** El
 * mecanismo es el umbral: si el suelo se vacía igual, toda el agua útil termina
 * saliendo y el total no puede diferir; si el agotamiento nunca llega a `p·TAW`,
 * FAO-56 no descuenta nada y Thornthwaite viene descontando desde el primer
 * milímetro. Por eso la separación crece con la profundidad del suelo: sobre el
 * mismo clima templado húmedo, con 60 mm de agua útil los déficits son 157 y 155
 * —indistinguibles—, con 150 mm son 101 y 77, y con 300 mm son 61 y 12.
 */
export function compararReglas(
  precip: readonly number[], etp: readonly number[], awc_mm: number, p = FRAC_AGOTAMIENTO_FAO56,
): ComparacionDeReglas | null {
  const tm  = balanceCiclico(precip, etp, awc_mm, { regla: 'thornthwaite' });
  const fao = balanceCiclico(precip, etp, awc_mm, { regla: 'fao56', p });
  if (!tm || !fao) return null;

  const dif_deficit_mm   = fao.deficit_mm - tm.deficit_mm;
  const dif_excedente_mm = fao.excedente_mm - tm.excedente_mm;

  const chico = Math.min(tm.deficit_mm, fao.deficit_mm);
  const grande = Math.max(tm.deficit_mm, fao.deficit_mm);
  const factor_deficit = chico > EPS ? grande / chico : null;

  let mes_mas_separado: { mesIndex: number; dif_mm: number } | null = null;
  for (let i = 0; i < 12; i++) {
    const dif = (fao.meses[i]?.deficit_mm ?? 0) - (tm.meses[i]?.deficit_mm ?? 0);
    if (!mes_mas_separado || Math.abs(dif) > Math.abs(mes_mas_separado.dif_mm)) {
      mes_mas_separado = { mesIndex: i, dif_mm: dif };
    }
  }

  const relativa = tm.deficit_mm > EPS ? Math.abs(dif_deficit_mm) / tm.deficit_mm : 0;
  const porque = relativa < 0.05
    ? 'Acá las dos reglas dan casi lo mismo, y eso tiene explicación: el suelo se vacía de todos ' +
      'modos, así que toda el agua útil termina saliendo y el total anual no puede diferir. La ' +
      'regla sólo cambia en qué mes sale.'
    : 'Acá las dos reglas se separan porque el suelo nunca se vacía: FAO-56 no descuenta nada ' +
      `mientras el agotamiento no pase ${Math.round(p * 100)} % del agua útil, y Thornthwaite ` +
      'descuenta desde el primer milímetro. Cuanto más profundo el suelo y más suave el déficit, ' +
      'más se abre la banda.';

  const advertencias = [
    'Las dos reglas son publicadas y ninguna es «la correcta»: Thornthwaite-Mather (1957) con la ' +
    'exponencial desde el arranque, y FAO-56 (ec. 84) con la meseta hasta p·TAW. acequia muestra ' +
    'las dos porque el déficit es lo que decide si hace falta riego, y elegir una sin decirlo es ' +
    'elegir un punto de la banda a escondidas.',
  ];

  return { thornthwaite: tm, fao56: fao, dif_deficit_mm, dif_excedente_mm, factor_deficit, mes_mas_separado, porque, advertencias };
}

// ─── El año hidrológico ──────────────────────────────────────────────────────

/**
 * Con qué mes conviene arrancar el año para contar déficits y excedentes.
 *
 * El año calendario parte en dos la temporada seca del hemisferio sur: en un
 * clima de lluvia estival, la seca de «1975» es media seca de un año y media del
 * siguiente, y el total anual mezcla dos episodios distintos. El arranque
 * natural de la contabilidad es el mes siguiente al que el suelo está más lleno,
 * porque ahí la reserva no arrastra historia. En el hemisferio norte eso cae
 * cerca de enero y la corrección no se nota; en el sur se corre medio año, y es
 * la misma clase de error que la app ya corrigió en `estaciones.ts`.
 */
export function mesInicioAnioHidrologico(balance: BalanceCiclico): number {
  let mejor = 0, maxST = -Infinity;
  for (const m of balance.meses) {
    if (m.almacenaje_mm > maxST + EPS) { maxST = m.almacenaje_mm; mejor = m.mesIndex; }
  }
  return (mejor + 1) % 12;
}

// ─── La variabilidad entre años ──────────────────────────────────────────────

export interface Cuantiles { p10: number; p50: number; p90: number; media: number; min: number; max: number }

function cuantiles(xs: readonly number[]): Cuantiles {
  return {
    p10: percentil(xs, 10), p50: percentil(xs, 50), p90: percentil(xs, 90),
    media: media(xs), min: Math.min(...xs), max: Math.max(...xs),
  };
}

/** Un año de datos mensuales, enero primero. */
export interface AnioMensual { anio: number; precip: readonly number[]; etp: readonly number[] }

export interface BalanceDeLosAnios {
  anios:            number;
  /** Primer mes del año hidrológico usado para cortar (0 = enero). */
  mesInicio:        number;
  precip:           Cuantiles;
  etr:              Cuantiles;
  deficit:          Cuantiles;
  excedente:        Cuantiles;
  /** El balance corrido sobre las doce medias mensuales: el «año promedio». */
  anioPromedio:     { precip_mm: number; etr_mm: number; deficit_mm: number; excedente_mm: number };
  /** Promedio de los años menos año promedio. Positivo = el año promedio lo esconde. */
  brecha_deficit_mm:   number;
  brecha_excedente_mm: number;
  /** Coeficiente de variación de la lluvia anual, en por ciento. */
  cv_pct:           number;
  /** Años descartados al principio para que el arranque no contamine. */
  calentamiento:    number;
  advertencias:     string[];
}

/**
 * Corre el balance año por año, en cadena continua, y resume la dispersión.
 *
 * Tres decisiones que cambian el número y por eso están escritas:
 *
 * **La cadena no se corta entre años.** El suelo no se reinicia el 1 de enero:
 * un verano seco deja el perfil vacío y el otoño siguiente arranca de ahí. Si
 * cada año se corriera por separado desde capacidad de campo, cada año cobraría
 * el agua fantasma de `costoDeNoIterar`, multiplicada por la cantidad de años.
 *
 * **El arranque de la cadena se descarta.** El primer año hidrológico se corre y
 * no entra en las estadísticas: su almacenaje inicial lo puso el año promedio y
 * no el clima de ese año.
 *
 * **El año se corta en el año hidrológico y no en enero.** Ver
 * `mesInicioAnioHidrologico`.
 */
export function balanceDeLosAnios(
  anios: readonly AnioMensual[],
  awc_mm: number,
  opciones: OpcionesBalance = {},
): BalanceDeLosAnios | null {
  const validos = anios.filter(a => a.precip.length === 12 && a.etp.length === 12);
  if (validos.length < 3) return null;

  // El año promedio, que es lo que la app mostraba, y el almacenaje con el que
  // arranca la cadena.
  const precipMedia = Array.from({ length: 12 }, (_, i) => media(validos.map(a => a.precip[i] ?? 0)));
  const etpMedia    = Array.from({ length: 12 }, (_, i) => media(validos.map(a => a.etp[i] ?? 0)));
  const promedio = balanceCiclico(precipMedia, etpMedia, awc_mm, opciones);
  if (!promedio) return null;

  const mesInicio = mesInicioAnioHidrologico(promedio);
  const regla = opciones.regla ?? 'thornthwaite';
  const p     = opciones.p ?? FRAC_AGOTAMIENTO_FAO56;
  const awc   = Math.max(0, awc_mm);

  // Serie mensual continua, enero del primer año en adelante.
  const serieP: number[] = [];
  const serieE: number[] = [];
  for (const a of validos) {
    for (let i = 0; i < 12; i++) { serieP.push(a.precip[i] ?? 0); serieE.push(a.etp[i] ?? 0); }
  }

  // Arranca con el almacenaje convergido del año promedio en el mes anterior al
  // corte, y se saltean los meses hasta el primer corte completo.
  let st = promedio.meses[(mesInicio + 11) % 12]?.almacenaje_mm ?? awc;

  const totP: number[] = [], totETR: number[] = [], totD: number[] = [], totE: number[] = [];
  let acP = 0, acETR = 0, acD = 0, acE = 0, enVentana = false, meses = 0;

  for (let k = 0; k < serieP.length; k++) {
    const mesDelAnio = k % 12;
    if (mesDelAnio === mesInicio) {
      if (enVentana && meses === 12) { totP.push(acP); totETR.push(acETR); totD.push(acD); totE.push(acE); }
      acP = 0; acETR = 0; acD = 0; acE = 0; meses = 0; enVentana = true;
    }
    const paso = pasoDeMes(st, serieP[k] ?? 0, serieE[k] ?? 0, awc, regla, p);
    st = paso.st;
    if (enVentana) {
      acP   += serieP[k] ?? 0;
      acETR += paso.etr;
      acD   += Math.max(0, (serieE[k] ?? 0) - paso.etr);
      acE   += paso.excedente;
      meses++;
    }
  }
  if (enVentana && meses === 12) { totP.push(acP); totETR.push(acETR); totD.push(acD); totE.push(acE); }

  if (totP.length < 3) return null;

  // Descarte del año de calentamiento.
  const calentamiento = 1;
  const corta = <T,>(xs: T[]) => xs.slice(calentamiento);
  const P = corta(totP), ETR = corta(totETR), D = corta(totD), E = corta(totE);
  if (P.length < 2) return null;

  const mP = media(P);
  const cv_pct = mP > EPS ? (desvio(P) / mP) * 100 : 0;

  const brecha_deficit_mm   = media(D) - promedio.deficit_mm;
  const brecha_excedente_mm = media(E) - promedio.excedente_mm;

  const advertencias: string[] = [];
  advertencias.push(
    'El balance del año promedio no es el promedio de los balances. El excedente sólo existe ' +
    'cuando el suelo se llena y el déficit sólo cuando se vacía, así que promediar la lluvia ' +
    'antes de correr el balance recorta las dos colas a la vez: esconde el déficit de los años ' +
    'secos y el excedente de los húmedos. Por eso acá se corre año por año, como pide FAO ' +
    `(${FUENTE_FAO52}).`,
  );
  if (mesInicio !== 0) {
    advertencias.push(
      `El año se corta en ${MESES_CORTOS[mesInicio]} y no en enero: es el mes siguiente al que el ` +
      'suelo está más lleno, así que la temporada seca entra entera en un año y no partida en dos.',
    );
  }
  if (P.length < 20) {
    advertencias.push(
      `Son ${P.length} años. Con menos de veinte, los extremos de la banda (el año de cada diez) ` +
      'descansan en uno o dos años y se mueven mucho si se agrega uno más.',
    );
  }
  // La cadena supone años consecutivos: el almacenaje de diciembre es el de
  // enero siguiente. Si falta un año en el medio, la cadena pega dos años que no
  // se tocan y arrastra la reserva por un hueco que no existió.
  const faltantes = validos.filter((a, i) => i > 0 && a.anio !== (validos[i - 1]?.anio ?? 0) + 1).length;
  if (faltantes > 0) {
    advertencias.push(
      `Faltan ${faltantes} año${faltantes > 1 ? 's' : ''} en el medio de la serie. La contabilidad ` +
      'del suelo se encadena de un año al siguiente, así que en esos empalmes la reserva viene del ' +
      'año equivocado.',
    );
  }

  return {
    anios: P.length, mesInicio,
    precip: cuantiles(P), etr: cuantiles(ETR), deficit: cuantiles(D), excedente: cuantiles(E),
    anioPromedio: {
      precip_mm: promedio.precip_mm, etr_mm: promedio.etr_mm,
      deficit_mm: promedio.deficit_mm, excedente_mm: promedio.excedente_mm,
    },
    brecha_deficit_mm, brecha_excedente_mm, cv_pct, calentamiento, advertencias,
  };
}

export const MESES_CORTOS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                             'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'] as const;

// ─── Lluvia con chance de ocurrencia (FAO I&D 25) ────────────────────────────

/**
 * Posición de graficado de Hazen, la que prescribe FAO I&D 25 citando a
 * USDA-SCS (1967): `Fa = 100 (2n − 1) / 2y`, con `n` el número de orden
 * empezando por **el más grande** e `y` los años de registro.
 *
 * No es la posición de Weibull `n/(y+1)` ni la interpolación lineal que usa el
 * resto de la app para percentiles. Acá se usa Hazen porque es la que la fuente
 * prescribe para este número en particular, y el número en particular es el que
 * entra en un presupuesto.
 */
export function posicionHazen(n: number, anios: number): number {
  if (anios <= 0) return NaN;
  return (100 * (2 * n - 1)) / (2 * anios);
}

/**
 * La lluvia que se iguala o supera en `chance_pct` de los años.
 *
 * El 80 % de chance es el **percentil 20** de la distribución: se supera en
 * cuatro años de cada cinco, así que es un número chico. Es fácil darlo vuelta,
 * y darlo vuelta dimensiona el tanque para el año bueno.
 *
 * Devuelve `null` cuando el nivel pedido cae fuera de lo que el registro sostiene:
 * con `y` años, Hazen sólo define posiciones entre `50/y` y `100 − 50/y`, y leer
 * un 99 % de chance en 35 años es extrapolar, no medir.
 */
export function lluviaConChance(totales: readonly number[], chance_pct: number): number | null {
  const y = totales.length;
  if (y < 3 || !Number.isFinite(chance_pct)) return null;
  const minFa = posicionHazen(1, y), maxFa = posicionHazen(y, y);
  if (chance_pct < minFa - EPS || chance_pct > maxFa + EPS) return null;

  // n sale de invertir Hazen: n = (chance · 2y / 100 + 1) / 2.
  const n = (chance_pct * 2 * y / 100 + 1) / 2;
  const desc = [...totales].sort((a, b) => b - a);   // el más grande primero, como la fuente
  const lo = Math.max(1, Math.floor(n)), hi = Math.min(y, Math.ceil(n));
  const frac = n - lo;
  const vLo = desc[lo - 1] ?? 0, vHi = desc[hi - 1] ?? 0;
  return vLo * (1 - frac) + vHi * frac;
}

export interface LluviaDependiente {
  chance_pct: number;
  mm:         number | null;
  /** Para qué sirve ese nivel, en los términos de la fuente. */
  para:       string;
}

/**
 * Los tres niveles que la fuente nombra, con para qué sirve cada uno. FAO I&D 25
 * ata el nivel al valor del cultivo: nueve años de cada diez para una huerta,
 * cinco de cada diez para algo de bajo valor.
 */
export function lluviasDependientes(totales: readonly number[]): LluviaDependiente[] {
  return [
    { chance_pct: 90, mm: lluviaConChance(totales, 90), para: 'nueve años de cada diez — cultivo de alto valor, o lo que no puede fallar' },
    { chance_pct: 80, mm: lluviaConChance(totales, 80), para: 'cuatro de cada cinco — el nivel habitual de diseño de riego' },
    { chance_pct: 50, mm: lluviaConChance(totales, 50), para: 'un año de cada dos — la mediana, que no es la media' },
    { chance_pct: 20, mm: lluviaConChance(totales, 20), para: 'un año de cada cinco — el año húmedo, para dimensionar desagües' },
  ];
}

// ─── El período de crecimiento ───────────────────────────────────────────────

/** Serie de 36 décadas, la primera del 1 al 10 de enero. */
export interface SerieDekadal { precip: readonly number[]; etp: readonly number[]; tmean: readonly number[] }

export interface Tramo { desde_dekada: number; hasta_dekada: number; dias: number }

export type TipoPeriodo = 'normal' | 'intermedio' | 'humedo-todo-el-anio' | 'seco-todo-el-anio';

export interface PeriodoCrecimiento {
  /** Los cuatro tipos de la figura 6 de FAO Soils Bulletin 52. */
  tipo:              TipoPeriodo;
  /** Tramos con agua suficiente, por el criterio de GAEZ v4 (ETa ≥ 0,4 ETm). */
  tramos:            Tramo[];
  /** Total de días de los tramos. Es el LGP. */
  dias:              number;
  /** Régimen de humedad de la tabla 3-5 de GAEZ v4, a partir de `dias`. */
  regimen:           string;
  /** Décadas con lluvia arriba de la ETP: el «humid period» de FAO 52. */
  dekadas_humedas:   number;
  /** Arranque por el criterio viejo de FAO 52 (P ≥ 0,5 ETP), para el contraste. */
  inicio_fao52:      number | null;
  /** Arranque por GAEZ v4 sobre el balance. */
  inicio_gaez:       number | null;
  /** Décadas de diferencia entre los dos criterios publicados. */
  dif_criterios_dekadas: number | null;
  /** Décadas donde el agua alcanza pero la temperatura no. */
  dekadas_frias:     number;
  awc_mm:            number;
  advertencias:      string[];
}

/** Tabla 3-5 de GAEZ v4: régimen de humedad por largo del período de crecimiento. */
export function regimenDeHumedad(dias: number): string {
  if (dias <= 0)   return 'Hiperárido';
  if (dias < 60)   return 'Árido';
  if (dias < 120)  return 'Semiárido seco';
  if (dias < 180)  return 'Semiárido húmedo';
  if (dias < 270)  return 'Subhúmedo';
  if (dias < 365)  return 'Húmedo';
  return 'Perhúmedo';
}

/** Décadas cíclicas: la 35 es vecina de la 0. */
const sigDekada = (i: number) => (i + 1) % DEKADAS_ANIO;

/**
 * El período de crecimiento, con los dos criterios publicados al lado.
 *
 * FAO Soils Bulletin 52 (1983) arranca el período cuando `P ≥ 0,5 ETP`. GAEZ v4
 * (2021), que es la versión vigente del mismo criterio de FAO, **cambió la
 * variable y el número**: cuenta los días con `ETa ≥ 0,4 ETm`. No es un ajuste
 * de coeficiente, es otra pregunta. El criterio de 1983 mira el cielo y el de
 * 2021 mira la planta: una década sin lluvia justo después de las lluvias tiene
 * el suelo lleno y la planta sin problemas, y el criterio viejo ya dio el
 * período por terminado. La extensión de «hasta 100 mm de reserva del suelo» que
 * FAO le agregaba en 1978 era el parche de ese error; v4 reemplazó el parche por
 * la pregunta correcta.
 *
 * Acá se corre el criterio de GAEZ v4 sobre el balance del predio, y se informa
 * al lado la fecha que daría el criterio de 1983 y cuántas décadas de diferencia
 * hay. Las dos salen de la misma serie, así que la diferencia es del criterio y
 * no del dato.
 */
export function periodoDeCrecimiento(
  dek: SerieDekadal, awc_mm: number, opciones: OpcionesBalance = {},
): PeriodoCrecimiento | null {
  const n = DEKADAS_ANIO;
  if (dek.precip.length !== n || dek.etp.length !== n || dek.tmean.length !== n) return null;

  const regla = opciones.regla ?? 'thornthwaite';
  const p     = opciones.p ?? FRAC_AGOTAMIENTO_FAO56;
  const awc   = Math.max(0, awc_mm);

  // Balance dekadal cíclico, con la misma iteración que el mensual.
  let st = opciones.almacenajeInicial ?? awc;
  const etr = new Array<number>(n).fill(0);
  for (let c = 0; c < (opciones.ciclosMax ?? 50); c++) {
    const previo = st;
    for (let i = 0; i < n; i++) {
      const paso = pasoDeMes(st, dek.precip[i] ?? 0, dek.etp[i] ?? 0, awc, regla, p);
      st = paso.st;
      etr[i] = paso.etr;
    }
    if (Math.abs(st - previo) < (opciones.tol ?? 0.001)) break;
  }

  const calido  = dek.tmean.map(t => t >= T_MIN_CRECIMIENTO_C);
  const humedo  = dek.precip.map((pr, i) => pr > (dek.etp[i] ?? 0));
  const lluvia  = dek.precip.map((pr, i) => pr >= FRAC_INICIO_FAO52 * (dek.etp[i] ?? 0));
  // GAEZ v4: ETa ≥ 0,4 ETm, con Kc = 1 (el caso de la tabla 3-4 para área con
  // período de crecimiento todo el año). Una ETP de cero no deja decidir nada:
  // sin demanda no hay estrés, así que la década cuenta como con agua.
  const conAgua = etr.map((e, i) => {
    const demanda = dek.etp[i] ?? 0;
    return demanda <= EPS ? true : e >= FRAC_LGP_GAEZ4 * demanda;
  });
  const apto    = conAgua.map((a, i) => a && (calido[i] ?? false));

  const dekadas_humedas = humedo.filter(Boolean).length;
  const dekadas_frias   = conAgua.filter((a, i) => a && !(calido[i] ?? false)).length;

  // Tramos cíclicos de décadas aptas.
  const tramos: Tramo[] = [];
  const todas = apto.every(Boolean);
  const ninguna = !apto.some(Boolean);
  if (todas) {
    tramos.push({ desde_dekada: 0, hasta_dekada: n - 1, dias: suma(DIAS_DEKADA) });
  } else if (!ninguna) {
    // Arranca en una década apta cuya anterior no lo sea, para no cortar un tramo.
    let arranque = 0;
    for (let i = 0; i < n; i++) {
      if ((apto[i] ?? false) && !(apto[(i + n - 1) % n] ?? false)) { arranque = i; break; }
    }
    let i = arranque, vistas = 0;
    while (vistas < n) {
      if (apto[i] ?? false) {
        const desde = i;
        let dias = 0;
        while ((apto[i] ?? false) && vistas < n) {
          dias += DIAS_DEKADA[i] ?? 10;
          const ultima = i;
          i = sigDekada(i); vistas++;
          if (!(apto[i] ?? false) || vistas >= n) { tramos.push({ desde_dekada: desde, hasta_dekada: ultima, dias }); break; }
        }
      } else { i = sigDekada(i); vistas++; }
    }
  }

  const dias = suma(tramos.map(t => t.dias));

  const tipo: TipoPeriodo =
    ninguna || !lluvia.some(Boolean) ? 'seco-todo-el-anio' :
    humedo.every(Boolean)            ? 'humedo-todo-el-anio' :
    dekadas_humedas === 0            ? 'intermedio' :
                                       'normal';

  // Arranque por los dos criterios: la primera década del tramo más largo.
  const tramoPpal = tramos.reduce<Tramo | null>((a, b) => (a && a.dias >= b.dias ? a : b), null);
  const inicio_gaez = tramoPpal?.desde_dekada ?? null;

  let inicio_fao52: number | null = null;
  if (lluvia.some(Boolean)) {
    // La primera década lluviosa a partir del arranque del tramo principal,
    // mirando hacia atrás: es la que FAO 52 llamaría «beginning of the rains».
    const base = inicio_gaez ?? 0;
    for (let k = 0; k < n; k++) {
      const i = (base + k) % n;
      if ((lluvia[i] ?? false) && !(lluvia[(i + n - 1) % n] ?? false)) { inicio_fao52 = i; break; }
    }
    if (inicio_fao52 === null) inicio_fao52 = lluvia.findIndex(Boolean);
  }

  let dif_criterios_dekadas: number | null = null;
  if (inicio_gaez !== null && inicio_fao52 !== null) {
    const bruto = inicio_fao52 - inicio_gaez;
    dif_criterios_dekadas = bruto > 18 ? bruto - n : bruto < -18 ? bruto + n : bruto;
  }

  const advertencias: string[] = [
    `El largo sale con el criterio vigente de FAO (${FUENTE_GAEZ4}): ETa ≥ 0,4 ETm con Kc = 1. ` +
    `El criterio de 1983 (${FUENTE_FAO52}) pregunta otra cosa —P ≥ 0,5 ETP— y por eso puede dar ` +
    'otra fecha de arranque. Las dos salen de esta misma serie.',
    'El cálculo va en décadas de diez días, que es la resolución de FAO Soils Bulletin 52. ' +
    'GAEZ v4 trabaja en días, así que las fechas de acá tienen la incertidumbre de una década.',
  ];
  if (tramos.length > 1) {
    advertencias.push(
      `Hay ${tramos.length} períodos de crecimiento separados y no uno. GAEZ v4 lo contempla ` +
      '—«may occur as two or more discontinuous growing periods»— y el total de días es la suma: ' +
      'no significa que se pueda hacer un cultivo de ese largo.',
    );
  }
  if (dekadas_frias > 0) {
    advertencias.push(
      `En ${dekadas_frias} décadas el agua alcanza y la temperatura no (media bajo ` +
      `${T_MIN_CRECIMIENTO_C} °C). Esas décadas no cuentan, y es por frío y no por sequía.`,
    );
  }
  if (awc <= 0) {
    advertencias.push('Sin capacidad de agua útil el período sale más corto de lo real: no hay reserva que estire la temporada.');
  }

  return {
    tipo, tramos, dias, regimen: regimenDeHumedad(dias), dekadas_humedas,
    inicio_fao52, inicio_gaez, dif_criterios_dekadas, dekadas_frias, awc_mm: awc, advertencias,
  };
}

/** Qué fecha nominal arranca una década, en un año no bisiesto. */
export function fechaDeDekada(i: number): string {
  const mes = Math.floor(i / 3), dentro = i % 3;
  const dia = dentro === 0 ? 1 : dentro === 1 ? 11 : 21;
  return `${dia} ${MESES_CORTOS[mes] ?? '?'}`;
}

// ─── La verificación que FAO-56 pide ─────────────────────────────────────────

export interface ContrasteEtp {
  /** ETP anual de Hargreaves, que es la que el panel de clima muestra. */
  hargreaves_mm: number;
  /** ETP anual de Penman-Monteith, de la serie diaria. */
  penman_mm:     number;
  dif_mm:        number;
  dif_pct:       number;
  /** Hargreaves sobre Penman-Monteith. 1 sería coincidencia perfecta. */
  cociente:      number;
  /** El sesgo que FAO-56 anticipa para este punto, por viento o por humedad. */
  sesgo_esperado: string | null;
  /** El sesgo medido coincide con el que la fuente anticipa. */
  coincide:      boolean | null;
  advertencias:  string[];
}

/**
 * Compara las dos ETP que la app ya tiene para el mismo punto.
 *
 * No es un lujo: es literalmente lo que FAO-56 manda hacer con la ecuación 52.
 * *«Equation 52 should be verified in each new region by comparing with
 * estimates by the FAO Penman-Monteith equation.»* acequia puede cumplirlo
 * porque tiene las dos —Hargreaves sobre las medias mensuales de POWER/Daymet, y
 * Penman-Monteith en la serie diaria de Open-Meteo— y porque tiene además las dos
 * variables con las que la fuente explica el sentido del sesgo: *«a tendency to
 * underpredict under high wind conditions (u2 > 3 m/s) and to overpredict under
 * conditions of high relative humidity»*.
 *
 * Las dos ETP no son el mismo dato: distinta grilla, distinta serie y distinto
 * método. Que no coincidan es lo esperable; cuánto y para qué lado es el dato.
 */
export function contrastarEtp(
  hargreaves_mm: number, penman_mm: number,
  viento_ms: number | null, rh_pct: number | null,
): ContrasteEtp | null {
  if (!Number.isFinite(hargreaves_mm) || !Number.isFinite(penman_mm) || penman_mm <= 0) return null;

  const dif_mm  = hargreaves_mm - penman_mm;
  const dif_pct = (dif_mm / penman_mm) * 100;

  let sesgo_esperado: string | null = null;
  if (viento_ms !== null && viento_ms > VIENTO_SESGO_MS) {
    sesgo_esperado = `Con viento medio de ${r1(viento_ms)} m/s —arriba de los ${VIENTO_SESGO_MS} m/s que marca FAO-56— ` +
      'la ecuación 52 tiende a quedarse corta.';
  } else if (rh_pct !== null && rh_pct >= 75) {
    sesgo_esperado = `Con humedad relativa media de ${Math.round(rh_pct)} % FAO-56 anticipa que la ecuación 52 se pase para arriba.`;
  }

  const coincide = sesgo_esperado === null ? null
    : viento_ms !== null && viento_ms > VIENTO_SESGO_MS ? dif_mm < 0 : dif_mm > 0;

  const advertencias: string[] = [
    'El panel de clima calcula la ETP con Hargreaves (FAO-56 ec. 52), que sólo necesita ' +
    'temperaturas, y la serie diaria trae Penman-Monteith, que usa además viento, humedad y ' +
    'radiación. FAO-56 presenta la 52 como alternativa cuando faltan esos datos, no como ' +
    'equivalente, y pide verificarla contra Penman-Monteith en cada región nueva. Esto es esa ' +
    'verificación, para este punto.',
  ];
  if (Math.abs(dif_pct) > 15) {
    advertencias.push(
      `Las dos ETP difieren ${Math.abs(Math.round(dif_pct))} %. El balance de esta pantalla usa la ` +
      'de la serie diaria, que es la que tiene las cuatro variables; el déficit del panel de clima ' +
      'sale de la otra, y por eso los dos números no van a coincidir.',
    );
  }

  return { hargreaves_mm, penman_mm, dif_mm, dif_pct, cociente: hargreaves_mm / penman_mm, sesgo_esperado, coincide, advertencias };
}

// ─── Lo que no se calcula, y por qué ─────────────────────────────────────────

/**
 * El excedente de este módulo NO es escorrentía ni recarga.
 *
 * Es «agua que pasó la capacidad del suelo y dejó de estar disponible para la
 * planta». Qué parte de eso escurre por la superficie y qué parte percola a la
 * napa lo decide la infiltración, la pendiente y la cobertura, que son otros
 * motores de la app. El informe del SWB lo dice de su propio modelo: *«Under most
 * conditions, the soil-moisture surplus value is equivalent to the daily
 * groundwater recharge value»*, pero eso es en Wisconsin y con un paso diario; en
 * un predio con pendiente y lluvias intensas la mayor parte se va por arriba
 * antes de llegar a la capacidad. Pasar este excedente a recarga sin repartirlo
 * sería exactamente el error que el modelo mensual habilita y nadie ve.
 */
export const EXCEDENTE_NO_ES_RECARGA =
  'El excedente es agua que el suelo ya no retiene, no agua que llegó a la napa ni al arroyo. ' +
  'El reparto entre escorrentía y percolación lo decide la infiltración y la pendiente, y lo ' +
  'calculan los motores de escorrentía de la app, con paso de tormenta y no mensual.';
