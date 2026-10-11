/**
 * El menú de manejos de pastoreo: cuántas parcelas, cuántos días en cada una,
 * cuánto descanso sale de eso y qué le cuesta al que lo maneja.
 *
 * ## La advertencia que va primero, y es de la fuente
 *
 * Este módulo dibuja subdivisiones, y conviene decir de entrada lo que la
 * literatura dice sobre cuánto valen. **Holechek, Gomez, Molinar y Galt (1999)**,
 * repasando los estudios clásicos de larga duración de pastizal natural, escriben:
 *
 *   *«Rotation grazing systems have been widely recommended by various government
 *   agencies concerned with range management. However research shows stocking rate
 *   reductions from heavy to conservative, have much higher probability of
 *   increasing grazing capacity, reducing risk, increasing financial returns, and
 *   reducing erosion.»*
 *
 * O sea: **acertarle a la carga rinde más que rotar.** El mismo trabajo agrega que
 * «stocking rates have been better evaluated than rotation grazing systems», que
 * es la razón por la que esto se sabe. No es un argumento para no rotar —la
 * rotación resuelve otras cosas, como la distribución del pastoreo y la calidad
 * de la dieta— pero sí para el orden de las decisiones: **la etapa A vale más que
 * esta etapa**, y si hay que gastar en una sola cosa, se gasta en ajustar la
 * carga, no en alambre.
 *
 * ## Las fuentes
 *
 * - **Undersander, D., Albert, B., Cosgrove, D., Johnson, D. y Peterson, P.
 *   (2014), «Pastures for profit: A guide to rotational grazing», University of
 *   Wisconsin-Extension, publicación A3529.** Es la que trae la aritmética
 *   —número de parcelas— con dos ejemplos resueltos, los rangos de descanso por
 *   tipo de pastura, el tope de ocupación por rebrote, las alturas de entrada y
 *   salida con las que se mide a campo, y la regla de que las parcelas se igualan
 *   por comida y no por superficie.
 *
 * - **Gerrish, J., «Layout & Design of Grazing Systems», cap. 12 del _Missouri
 *   Grazing Manual_ (M157), University of Missouri Extension.** Aporta el otro
 *   tope de ocupación, que es de conducta y no de planta, la forma de la parcela,
 *   el alambre que se ahorra con una grilla más cuadrada, la banda de reposición
 *   de carbohidratos y la distancia al agua **dentro** de la parcela.
 *
 * - **USDA NRCS, «Pasture Management System Layout», Illinois Grazing Manual
 *   Fact Sheet — Grazing Management.** Los doce principios de trazado, de los que
 *   acá se usan la distancia al agua, la forma de la parcela y la cantidad de
 *   parcelas que funciona en cría.
 *
 * - **Holechek, J.L., Gomez, H., Molinar, F. y Galt, D. (1999), «Grazing Studies:
 *   What We've Learned», _Rangelands_ 21(2):12-16.** La advertencia de arriba y
 *   los números del fusible del año seco.
 *
 * - **Collatz, G.J., Berry, J.A. y Clark, J.S. (1998), «Effects of climate and
 *   atmospheric CO2 partial pressure on the global distribution of C4 grasses:
 *   present, past, and future», _Oecologia_ 114:441-454.** El criterio climático
 *   que le permite a acequia **sugerir** si la pastura de un predio es de
 *   gramíneas templadas o tropicales, que es lo que decide cuál de los dos
 *   calendarios de descanso corre.
 *
 * - **Fox, D.L., Pau, S., Taylor, L. y otros (2018), «Climatic Controls on C4
 *   Grassland Distributions During the Neogene: A Model-Data Comparison»,
 *   _Frontiers in Ecology and Evolution_ 6:147.** De donde sale el rango de
 *   validez del criterio anterior.
 *
 * ## Lo contraintuitivo, que es el corazón de este módulo
 *
 * **El tope de días en una parcela es más corto cuando el pasto crece más
 * rápido.** Todo el mundo supone lo contrario: si hay mucho pasto, se puede dejar
 * el ganado más tiempo. La fuente dice que no, y dice por qué, con números:
 *
 *   *«Regrowth occurs after about four days during May and June and 10 days
 *   during August and September, so the maximum grazing period should never be
 *   longer than these averages.»* (A3529)
 *
 * En plena primavera la planta vuelve a tener hoja a los cuatro días y el animal,
 * que todavía está ahí, se la come por segunda vez antes de que haya rearmado
 * nada. Y eso es lo único que la misma fuente llama forma segura de matar una
 * pastura: *«A sure way to kill desirable species is to graze close and then graze
 * the regrowth without allowing adequate rest.»*
 *
 * ## Lo que este módulo NO decide
 *
 * No decide la carga ni la superficie efectiva: eso es `modulacion.ts` y
 * `produccion.ts`. Tampoco dibuja: eso es `potreros.ts`. Acá una **parcela** es
 * la subdivisión de rotación de adentro de un módulo; el módulo —rodeo, agua,
 * superficie— lo decide la etapa A.
 */

import { MESES_POR_TRIMESTRE, nombresDeTemporada } from './estaciones';

export const FUENTE_A3529 =
  'Undersander, D., Albert, B., Cosgrove, D., Johnson, D. y Peterson, P. (2014), «Pastures for profit: A guide to rotational grazing», University of Wisconsin-Extension, publicación A3529.';

export const FUENTE_GERRISH =
  'Gerrish, J., «Layout & Design of Grazing Systems», cap. 12 del Missouri Grazing Manual (M157), University of Missouri Extension.';

export const FUENTE_ILLINOIS =
  'USDA NRCS, «Pasture Management System Layout», Illinois Grazing Manual Fact Sheet — Grazing Management.';

export const FUENTE_HOLECHEK_99 =
  'Holechek, J.L., Gomez, H., Molinar, F. y Galt, D. (1999), «Grazing Studies: What We’ve Learned», Rangelands 21(2):12-16.';

export const FUENTE_COLLATZ =
  'Collatz, G.J., Berry, J.A. y Clark, J.S. (1998), «Effects of climate and atmospheric CO2 partial pressure on the global distribution of C4 grasses: present, past, and future», Oecologia 114:441-454.';

export const FUENTE_FOX =
  'Fox, D.L., Pau, S., Taylor, L. y otros (2018), «Climatic Controls on C4 Grassland Distributions During the Neogene: A Model-Data Comparison», Frontiers in Ecology and Evolution 6:147.';

/** 1 pulgada en centímetros, para las alturas de entrada y salida. */
export const PULGADA_CM = 2.54;
/** 1 pie en metros, para las distancias al agua de las fuentes de Estados Unidos. */
export const PIE_M = 0.3048;

// ─── 1 · La aritmética ────────────────────────────────────────────────────────

/**
 * Cuántas parcelas pide un descanso dado.
 *
 * **A3529, p. 30:** *«estimate the length of your longest rest period (during the
 * slowest period of forage growth), the length of your grazing period, and the
 * number of animal groups which will be grazing the same pasture sequentially»*,
 * y de ahí
 *
 *     parcelas = descanso / ocupación + grupos de animales
 *
 * Los dos ejemplos resueltos de la publicación son los tests: 30 días de descanso
 * con 3 de ocupación y un grupo dan 11 parcelas, y 32 con 2 dan 17.
 *
 * El término de **grupos** es la parte que se olvida y no es un detalle: son las
 * parcelas que están ocupadas al mismo tiempo. Con dos rodeos que pasan uno
 * detrás del otro por la misma secuencia hacen falta dos parcelas más, no una.
 *
 * Se redondea **para arriba**: una parcela de más alarga el descanso, que es el
 * lado seguro del error. El descanso que realmente se logra lo devuelve
 * `descansoLogrado`, que no es necesariamente el pedido.
 */
export function parcelasNecesarias(descanso_d: number, ocupacion_d: number, grupos = 1): number {
  if (descanso_d <= 0 || ocupacion_d <= 0) return Math.max(1, Math.round(grupos));
  const g = Math.max(1, Math.round(grupos));
  return Math.ceil(descanso_d / ocupacion_d) + g;
}

/**
 * El descanso que de verdad queda con una cantidad fija de parcelas. Es la
 * fórmula de arriba despejada: `descanso = (parcelas − grupos) × ocupación`.
 *
 * Devuelve 0 cuando no hay parcelas de sobra para descansar —con tantos grupos
 * como parcelas, todas están ocupadas siempre y la rotación no existe—.
 */
export function descansoLogrado(parcelas: number, ocupacion_d: number, grupos = 1): number {
  const g = Math.max(1, Math.round(grupos));
  const libres = Math.max(0, Math.round(parcelas) - g);
  return Math.round(libres * ocupacion_d * 10) / 10;
}

// ─── 2 · Los dos topes de ocupación ───────────────────────────────────────────

/**
 * Tope por **rebrote**: los días que tarda la planta en volver a tener hoja al
 * alcance del diente. Los dos anclajes son de A3529 —4 días en el crecimiento
 * rápido, 10 en el lento— y se interpolan contra el descanso de la temporada,
 * porque el descanso **es** el inverso de la velocidad de crecimiento: la
 * temporada de descanso corto es la de crecimiento rápido.
 *
 * Los anclajes de descanso son los de la pastura templada de la misma fuente —2
 * semanas con tiempo fresco, 5 a 7 con calor— porque es el caso que la fuente
 * midió al dar los 4 y los 10 días. Esta interpolación es el puente de acequia
 * entre dos párrafos de la misma publicación, no un dato publicado; lo publicado
 * son los extremos, y la interpolación es lineal porque no hay nada que indique
 * otra forma.
 *
 * Que a mitad de camino —28 días de descanso— dé exactamente 7 días no es
 * casualidad buscada, pero es la coincidencia que la respalda: 7 es el techo de
 * la banda independiente de Gerrish, *«usually a maximum of 3-7 days depending
 * upon species and weather»*.
 */
export const REBROTE_RAPIDO_D = 4;
export const REBROTE_LENTO_D = 10;
export const DESCANSO_ANCLA_RAPIDO_D = 14;
export const DESCANSO_ANCLA_LENTO_D = 42;

export function topeRebrote(descanso_d: number): number {
  const t = (descanso_d - DESCANSO_ANCLA_RAPIDO_D) / (DESCANSO_ANCLA_LENTO_D - DESCANSO_ANCLA_RAPIDO_D);
  const d = REBROTE_RAPIDO_D + t * (REBROTE_LENTO_D - REBROTE_RAPIDO_D);
  return Math.round(Math.min(REBROTE_LENTO_D, Math.max(REBROTE_RAPIDO_D, d)) * 10) / 10;
}

/**
 * Tope por **conducta**, que es otra cosa y no se mezcla con el anterior.
 *
 * Gerrish: *«Cattle take about three days to establish a strong grazing pattern
 * within an individual paddock. As cattle are allowed to remain on a paddock
 * beyond three days spot grazing and pronounced cattle trails will begin to
 * develop. When the cattle return to this paddock in future grazing cycles, the
 * pattern is already established and they will begin to follow those patterns on
 * the first and second day of grazing.»*
 *
 * Dos diferencias con el tope de rebrote que valen: lo que se daña acá no es la
 * planta sino el **parejo** del pastoreo, y **tiene memoria** —la querencia queda
 * armada para las vueltas siguientes—. Por eso se reportan por separado: pasar de
 * 3 días no mata la pastura, deja el potrero pastoreado desparejo para siempre.
 */
export const TOPE_CONDUCTA_D = 3;
/** La banda de ocupación máxima de Gerrish, «3 a 7 días según especie y clima». */
export const RANGO_OCUPACION_GERRISH_D: readonly [number, number] = [3, 7];

// ─── 3 · El descanso según qué pastura es ─────────────────────────────────────

export type TipoPastura = 'templada' | 'tropical' | 'leguminosa';
/** El diagnóstico climático puede no poder elegir entre las dos gramíneas. */
export type SugerenciaPastura = TipoPastura | 'mixta';

export interface DescansoPastura {
  id: TipoPastura;
  nombre: string;
  /** Días de descanso con tiempo fresco, como rango publicado. */
  fresco_d: readonly [number, number];
  /** Días de descanso con tiempo caluroso. */
  caluroso_d: readonly [number, number];
  /** Ejemplos de especies de la fuente, para que el usuario se reconozca. */
  ejemplos: string;
  /** La frase de la fuente, textual, para poder auditarla sin abrir el PDF. */
  textual: string;
}

/**
 * **El hallazgo que da vuelta el calendario:** las gramíneas templadas y las
 * tropicales piden lo **contrario** una de la otra. La templada necesita *más*
 * descanso con calor —se frena— y la tropical necesita *menos*, porque el calor
 * es justamente cuando crece. Un calendario de rotación copiado de un campo con
 * pastura templada a un campo con pastura tropical está exactamente al revés.
 *
 * Los rangos son de A3529, p. 26-27. Donde la fuente da un solo extremo —«as
 * little as 2 weeks»— el rango queda con los dos valores iguales y la frase
 * textual al lado, en vez de inventarle un techo.
 */
export const DESCANSO_PUBLICADO: readonly DescansoPastura[] = [
  {
    id: 'templada',
    nombre: 'Gramíneas templadas',
    fresco_d: [14, 14],
    caluroso_d: [35, 49],
    ejemplos: 'pasto ovillo, cebadilla, festuca alta, falaris, raigrás, poa',
    textual: '«Cool-season grasses such as Kentucky bluegrass, ryegrass, orchardgrass, or timothy need as little as 2 weeks of rest during cool weather and 5 to 7 weeks during hot weather.»',
  },
  {
    id: 'tropical',
    nombre: 'Gramíneas tropicales',
    fresco_d: [35, 42],
    caluroso_d: [21, 21],
    ejemplos: 'gramón, pasto llorón, sorgo forrajero, panicum, setaria',
    textual: '«Warm-season grasses, such as sorghum/sudan or big bluestem, need to rest for 5 to 6 weeks during cool weather and about 3 weeks during hot weather.»',
  },
  {
    id: 'leguminosa',
    nombre: 'Leguminosas',
    fresco_d: [21, 28],
    caluroso_d: [21, 28],
    ejemplos: 'alfalfa, trébol rojo, lotus',
    textual: '«Legumes such as alfalfa, birdsfoot trefoil, and red clover need rest periods of about 3 to 4 weeks throughout the season.»',
  },
];

export function pastura(tipo: TipoPastura): DescansoPastura {
  return DESCANSO_PUBLICADO.find(p => p.id === tipo) ?? DESCANSO_PUBLICADO[0]!;
}

/** El descanso objetivo: el medio del rango publicado para ese tipo y temporada. */
export function descansoObjetivo(tipo: TipoPastura, caluroso: boolean): number {
  const p = pastura(tipo);
  const r = caluroso ? p.caluroso_d : p.fresco_d;
  return Math.round((r[0] + r[1]) / 2);
}

/**
 * La banda de reposición de carbohidratos de reserva de Gerrish, que sirve de
 * control de cordura sobre cualquier descanso elegido a mano: *«Typically the CHO
 * replenishment cycle in forage plants takes 20-40 days»*. Afuera de esta banda
 * no está necesariamente mal —la propia fuente dice «under good growing
 * conditions, a 20 day rest may be plenty whereas in midsummer a cool season
 * forage may require 40+ days»— pero merece que la pantalla lo diga.
 */
export const RANGO_CHO_D: readonly [number, number] = [20, 40];

// ─── 4 · Qué pastura es, leída del clima del predio ───────────────────────────

/**
 * **La temperatura de cruce.** Collatz, Berry y Clark (1998) definen dónde la
 * fotosíntesis C4 —las gramíneas tropicales— le gana a la C3 —las templadas—: un
 * mes favorece a las C4 cuando su temperatura media llega a **22 °C** y además
 * llueven **25 mm o más**, porque sin esa agua el mes no es de crecimiento. El
 * filtro de lluvia, en palabras de Fox y otros (2018), *«effectively limits the
 * months considered to the growing season»*.
 *
 * Esto es lo que acequia puede hacer y nadie más: ya tiene las doce medias
 * mensuales de temperatura y de lluvia del punto, así que puede **sugerir** cuál
 * de los dos calendarios de descanso corre, en vez de pedirle al usuario que
 * sepa de fisiología.
 */
export const CRUCE_C3_C4_C = 22;
export const PRECIP_MES_CRECIMIENTO_MM = 25;

/**
 * El umbral de dominancia. El criterio publicado es **por mes**: cada mes
 * favorece a unas o a otras. Pasar de «cuántos meses» a «qué pastura es» pide un
 * corte, y los dos tercios y un tercio de abajo **son de acequia, no de la
 * fuente**. Se eligieron así para que el resultado intermedio sea «mixta» y la
 * app muestre los dos calendarios, que es lo honesto cuando el clima no decide.
 */
export const FRACCION_DOMINANCIA = 2 / 3;

export interface DiagnosticoPastura {
  sugerencia: SugerenciaPastura;
  /** Meses con lluvia suficiente para crecer (≥ 25 mm). */
  meses_crecimiento: number;
  /** De esos, los que además llegan a la temperatura de cruce. */
  meses_c4: number;
  fraccion: number | null;
  cautelas: string[];
}

export function diagnosticoPastura(
  meses: ReadonlyArray<{ tmean_c: number; precip_mm: number }> | null | undefined,
): DiagnosticoPastura | null {
  if (!meses || meses.length === 0) return null;

  const crecimiento = meses.filter(m => m.precip_mm >= PRECIP_MES_CRECIMIENTO_MM);
  const c4 = crecimiento.filter(m => m.tmean_c >= CRUCE_C3_C4_C);
  const cautelas: string[] = [];

  if (crecimiento.length === 0) {
    cautelas.push('Ningún mes llega a 25 mm de lluvia, así que el criterio no tiene con qué decidir: la pastura la define el riego o la especie implantada, no el clima.');
    return { sugerencia: 'mixta', meses_crecimiento: 0, meses_c4: 0, fraccion: null, cautelas };
  }

  const fraccion = c4.length / crecimiento.length;
  const sugerencia: SugerenciaPastura =
    fraccion >= FRACCION_DOMINANCIA ? 'tropical'
    : fraccion <= 1 - FRACCION_DOMINANCIA ? 'templada'
    : 'mixta';

  // La temperatura de cruce se mueve con el CO2 de la atmósfera, y los 22 °C son
  // los del CO2 de 1998. Fox y otros (2018) la recalculan en 14, 20 y 24 °C para
  // 280, 405 y 560 ppm, así que los meses que caen entre 20 y 22 son los que
  // cambian de bando según con qué parametrización se mire.
  const frontera = crecimiento.filter(m => m.tmean_c >= 20 && m.tmean_c < CRUCE_C3_C4_C).length;
  if (frontera > 0) {
    cautelas.push(`${frontera} ${frontera === 1 ? 'mes queda' : 'meses quedan'} entre 20 y 22 °C, que es la franja donde las dos parametrizaciones publicadas de la temperatura de cruce no coinciden. Si tu pastura no se parece a lo que dice acá, mandá vos.`);
  }
  if (sugerencia === 'mixta' && crecimiento.length > 0) {
    cautelas.push('El clima no decide: hay meses de las dos. Un predio así suele tener las dos pasturas y conviene manejarlas con calendarios distintos, no promediarlas.');
  }
  cautelas.push('El criterio predice qué gramíneas favorece el clima, no qué hay sembrado. Si la pastura es implantada, la especie la elegiste vos y manda sobre esto.');

  return { sugerencia, meses_crecimiento: crecimiento.length, meses_c4: c4.length, fraccion, cautelas };
}

// ─── 5 · La forma y el alambre ────────────────────────────────────────────────

/**
 * **La forma de la parcela, con la condición que la hace importar o no.**
 *
 * Gerrish: *«Paddocks with low length:width ratios tend to be grazed more
 * uniformly than long, narrow paddocks. Long narrow paddocks are frequently
 * grazed much more heavily in the front portion of the paddock compared to the
 * back part… On small grazing units where livestock are never more than several
 * hundred feet from the water source, shape is less critical. **The shorter the
 * grazing period the less critical shape becomes.**»*
 *
 * O sea que la forma no es una regla suelta: pesa **cuando la parcela es grande o
 * la ocupación es larga**, y deja de pesar cuando el agua está cerca y el animal
 * se va en un día. El tope duro lo da la guía de Illinois: *«The length should
 * always be less than 4 times the width»*, y lo mismo Gerrish.
 */
export const RELACION_MAX = 4;

export interface Grilla {
  filas: number;
  columnas: number;
  /** Celdas de la grilla: puede ser más que las parcelas si el número no factoriza. */
  celdas: number;
  /** Metros de alambre de subdivisión interna, sin contar el perímetro. */
  alambre_m: number;
  largo_m: number;
  ancho_m: number;
  /** Largo sobre ancho, siempre ≥ 1. */
  relacion: number;
}

/**
 * Alambre interno de una grilla de `filas × columnas` sobre un bloque cuadrado.
 * Son los hilos que faltan para dividir el bloque, sin el perímetro, que ya
 * existe: `(filas − 1 + columnas − 1) × lado`.
 */
export function alambreGrilla(area_ha: number, filas: number, columnas: number): number {
  if (area_ha <= 0) return 0;
  const lado = Math.sqrt(area_ha * 10000);
  return Math.round(Math.max(0, filas - 1 + columnas - 1) * lado);
}

/**
 * La grilla que gasta menos alambre para una cantidad de parcelas.
 *
 * **Y acá aparece el resultado que nadie cree hasta que lo ve:** Gerrish compara
 * dos diseños del mismo campo y encuentra que *«the total linear footage of fence
 * required for the 16 paddock system is actually less than for the 12 paddock
 * system»*, porque *«a square area always has less perimeter than a rectangle of
 * comparable area»*. **Más parcelas con menos alambre.** Hay un test que lo
 * reproduce: 12 parcelas en tiras necesitan 11 hilos de largo y 16 en grilla de
 * 4 × 4 necesitan 6.
 *
 * La geometría supone un bloque cuadrado, igual que la geometría del agua de
 * `modulacion.ts`, y por el mismo motivo: es exacta para lo que decide —comparar
 * trazados entre sí— y aproximada para el metraje final, que depende del plano.
 */
export function grillaSubdivision(area_ha: number, parcelas: number): Grilla {
  const n = Math.max(1, Math.round(parcelas));
  const lado = area_ha > 0 ? Math.sqrt(area_ha * 10000) : 0;
  let mejor: Grilla | null = null;

  for (let filas = 1; filas <= n; filas++) {
    const columnas = Math.ceil(n / filas);
    const alambre_m = alambreGrilla(area_ha, filas, columnas);
    const largo_m = columnas >= filas ? lado / filas : lado / columnas;
    const ancho_m = columnas >= filas ? lado / columnas : lado / filas;
    const relacion = ancho_m > 0 ? largo_m / ancho_m : 1;
    const g: Grilla = {
      filas, columnas, celdas: filas * columnas, alambre_m,
      largo_m: Math.round(largo_m), ancho_m: Math.round(ancho_m),
      relacion: Math.round(relacion * 100) / 100,
    };
    if (
      mejor === null ||
      g.alambre_m < mejor.alambre_m ||
      (g.alambre_m === mejor.alambre_m && g.relacion < mejor.relacion)
    ) mejor = g;
  }
  return mejor!;
}

// ─── 6 · El agua dentro de la parcela, que es otra pregunta ───────────────────

/**
 * **Dos distancias al agua publicadas, que no se contradicen porque contestan
 * preguntas distintas.** Vale aclararlo porque un lector atento va a notar que
 * la etapa A usa 1,6 km y acá se usan 240 m, y va a pensar que una está mal.
 *
 * - **1,6 km** (Holechek, 1988, tabla 4) contesta *cuánta carga aguanta este
 *   campo*: más allá de esa distancia el animal directamente no va, y esa
 *   superficie deja de contar para la capacidad.
 * - **180 a 240 m** contesta *si esta parcela se va a pastorear pareja*. Gerrish:
 *   *«preferably with the livestock always being within 600' to 800' of the water
 *   source»*. La guía de Illinois lo pone como principio de trazado: *«Keep
 *   travel distance to water less than 800 ft. for beef cattle, and most grazing
 *   livestock, except closer for lactating dairy animals.»*
 *
 * La primera es el límite del pastoreo extensivo; la segunda es el criterio del
 * pastoreo manejado. acequia usa cada una donde corresponde.
 */
export const AGUA_INTENSIVA_M = Math.round(800 * PIE_M);
export const AGUA_INTENSIVA_GERRISH_M: readonly [number, number] = [
  Math.round(600 * PIE_M), Math.round(800 * PIE_M),
];

/** Cuántos puntos de agua necesita una sola parcela para que nada quede lejos. */
export function bebederosNecesarios(area_ha: number, radio_m = AGUA_INTENSIVA_M): number {
  if (area_ha <= 0 || radio_m <= 0) return 0;
  const cubre_ha = (Math.PI * radio_m * radio_m) / 10000;
  return Math.max(1, Math.ceil(area_ha / cubre_ha));
}

/** Parcelas que puede servir un punto de agua parado en un cruce de alambres. */
export const PARCELAS_POR_PUNTO = 4;

export interface PuntosDeAgua {
  total: number;
  por_parcela: number;
  /** El punto se comparte entre parcelas vecinas en vez de uno por parcela. */
  compartido: boolean;
}

/**
 * Los puntos de agua del sistema de rotación.
 *
 * A3529 pone el objetivo: *«Some farmers use lanes to access a central watering
 * site, but the ideal system is to have water available within every paddock.
 * This reduces the distance livestock must travel to drink, discourages livestock
 * from congregating around a central water source, and requires less fencing.»*
 *
 * Y la guía de Illinois dice cómo sale barato: *«When locating water points,
 * position for multiple paddock usage along division fences, when possible»*. Un
 * bebedero parado en un cruce de alambres sirve a las cuatro parcelas que se
 * tocan ahí, así que un sistema de doce parcelas no necesita doce bebederos:
 * necesita tres bien puestos. Eso sólo vale mientras la parcela entre entera en
 * el radio del agua; si no entra, no hay cruce que lo arregle y hace falta más de
 * uno por parcela.
 */
export function puntosDeAgua(args: {
  parcelas: number;
  ha_parcela: number;
  radio_m?: number;
}): PuntosDeAgua {
  const radio = args.radio_m ?? AGUA_INTENSIVA_M;
  const parcelas = Math.max(1, Math.round(args.parcelas));
  const por_parcela = bebederosNecesarios(args.ha_parcela, radio);
  if (por_parcela <= 1) {
    return { total: Math.max(1, Math.ceil(parcelas / PARCELAS_POR_PUNTO)), por_parcela: 1, compartido: true };
  }
  return { total: parcelas * por_parcela, por_parcela, compartido: false };
}

// ─── 7 · Las alturas, que es lo único que se mide con una regla ───────────────

export interface AlturaPastoreo {
  grupo: string;
  ejemplos: string;
  /** Altura de entrada, en cm. */
  entrar_cm: readonly [number, number];
  /** Altura de salida, en cm. */
  salir_cm: readonly [number, number];
}

/**
 * Tabla 7 de A3529, «Average heights to begin and end grazing», pasada a
 * centímetros. Es la pieza más útil de todo el módulo y la más barata: **el
 * descanso en días es una estimación, la altura es una medición.** La fuente lo
 * dice en una frase que vale más que cualquier calendario: *«It is crucial that
 * you move your animals according to the forage, not the calendar.»*
 *
 * La altura de salida es el fusible de verdad: *«The closer you graze a pasture,
 * the longer the rest period required for forage recovery.»* Comerla más abajo no
 * ahorra superficie, alarga el descanso.
 */
export const ALTURAS_PASTOREO: readonly AlturaPastoreo[] = [
  {
    grupo: 'Gramíneas templadas de porte alto',
    ejemplos: 'pasto ovillo, falaris, cebadilla, festuca alta, timothy',
    entrar_cm: [20, 25], salir_cm: [10, 10],
  },
  {
    grupo: 'Leguminosas de porte alto',
    ejemplos: 'alfalfa, trébol rojo, trébol blanco ladino, lotus',
    entrar_cm: [20, 25], salir_cm: [10, 10],
  },
  {
    grupo: 'Raigrases',
    ejemplos: 'raigrás anual y perenne',
    entrar_cm: [15, 20], salir_cm: [5, 5],
  },
  {
    grupo: 'Gramíneas y leguminosas templadas de porte bajo',
    ejemplos: 'poa, trébol blanco',
    entrar_cm: [10, 15], salir_cm: [5, 5],
  },
  {
    grupo: 'Gramíneas tropicales',
    ejemplos: 'sorgo forrajero, panicum, big bluestem, switchgrass',
    entrar_cm: [30, 36], salir_cm: [10, 15],
  },
];

/** El remanente de hoja que la fuente pide dejar en pie, por tipo de pastura. */
export function remanente_cm(tipo: TipoPastura): readonly [number, number] {
  return tipo === 'tropical' ? [10, 20] : [10, 10];
}

// ─── 8 · El menú ──────────────────────────────────────────────────────────────

export type Exigencia = 'baja' | 'media' | 'alta';

export interface Manejo {
  ocupacion_d: number;
  parcelas: number;
  ha_parcela: number;
  /** El descanso que se logra, que por el redondeo puede pasar al pedido. */
  descanso_d: number;
  grilla: Grilla;
  alambre_m: number;
  bebederos: number;
  exigencia: Exigencia;
  /** Cuántas veces al año hay que mover el rodeo con este manejo. */
  movidas_anio: number;
  avisos: string[];
}

/**
 * El menú: para un mismo descanso objetivo, todas las combinaciones de ocupación
 * y parcelas que lo cumplen, con lo que cada una cuesta de alambre, de agua y de
 * trabajo. La decisión no es técnica, es de bolsillo y de tiempo, y por eso se
 * muestran todas en vez de elegir una.
 *
 * El menú arranca en 1 día de ocupación y llega hasta el tope de rebrote de la
 * temporada. No se ofrece nada por encima de ese tope: la fuente dice *«the
 * maximum grazing period should never be longer than these averages»*, y una
 * opción que daña la pastura no es una opción.
 */
export function menuDeManejos(args: {
  ha_pastoreables: number;
  descanso_objetivo_d: number;
  grupos?: number;
  tope_ocupacion_d?: number;
  radio_bebedero_m?: number;
}): Manejo[] {
  const { ha_pastoreables, descanso_objetivo_d } = args;
  const grupos = Math.max(1, Math.round(args.grupos ?? 1));
  const tope = Math.max(1, Math.floor(args.tope_ocupacion_d ?? topeRebrote(descanso_objetivo_d)));
  const radio = args.radio_bebedero_m ?? AGUA_INTENSIVA_M;
  if (ha_pastoreables <= 0 || descanso_objetivo_d <= 0) return [];

  const manejos: Manejo[] = [];
  for (let ocupacion_d = 1; ocupacion_d <= tope; ocupacion_d++) {
    const parcelas = parcelasNecesarias(descanso_objetivo_d, ocupacion_d, grupos);
    const ha_parcela = ha_pastoreables / parcelas;
    const grilla = grillaSubdivision(ha_pastoreables, parcelas);
    const movidas_anio = Math.round(365 / ocupacion_d);
    const exigencia: Exigencia = ocupacion_d <= 1 ? 'alta' : ocupacion_d <= 3 ? 'media' : 'baja';

    const avisos: string[] = [];
    if (ocupacion_d > TOPE_CONDUCTA_D) {
      avisos.push(`Más de ${TOPE_CONDUCTA_D} días en la misma parcela: la planta todavía no corre riesgo, pero el rodeo arma querencia y la parcela queda pastoreada desparejo, con sendas que vuelve a usar en las vueltas siguientes.`);
    }
    if (grilla.relacion > RELACION_MAX) {
      avisos.push(`Con esta grilla las parcelas quedan ${grilla.relacion.toFixed(1)} veces más largas que anchas, y el tope publicado es 4: el frente se sobrepastorea y el fondo queda sin comer.`);
    }
    if (ha_parcela < 0.1) {
      avisos.push('Parcelas de menos de 1.000 m²: conviene menos parcelas con más días, o un rodeo más chico.');
    }

    manejos.push({
      ocupacion_d, parcelas,
      ha_parcela: Math.round(ha_parcela * 100) / 100,
      descanso_d: descansoLogrado(parcelas, ocupacion_d, grupos),
      grilla, alambre_m: grilla.alambre_m,
      bebederos: puntosDeAgua({ parcelas, ha_parcela, radio_m: radio }).total,
      exigencia, movidas_anio, avisos,
    });
  }
  return manejos;
}

// ─── 9 · Las etapas, porque nadie subdivide todo de una ───────────────────────

export interface EtapaIntensificacion {
  parcelas: number;
  ocupacion_d: number;
  descanso_d: number;
  alambre_m: number;
  nota: string;
}

/**
 * El camino por etapas, que es como lo plantea A3529 y no es una concesión:
 *
 *   *«Initially, the number of paddocks in your rotational system may be
 *   determined by current fences, topography, access to water… This may lead to a
 *   two- to eight-paddock system and will greatly increase both pasture condition
 *   and animal performance. The next step is to move into an intensive grazing
 *   system and let the length of grazing and rest periods determine the number of
 *   paddocks.»*
 *
 * Y la guía de Illinois pone el escalón del medio con nombre: *«in most cow/calf,
 * sheep and goat operations, 8-12 pastures/paddocks will work well for improving
 * the gains per acre and the return on your investment»*.
 *
 * Por eso las etapas son 4, 8 y el objetivo: la primera se hace con los alambres
 * que ya están, la segunda es la que la literatura dice que paga, y la tercera es
 * la intensiva. Lo que cambia entre etapas y conviene mostrar es **el descanso
 * que cada una consigue**, que es lo que la pastura siente.
 */
export function etapasIntensificacion(args: {
  ha_pastoreables: number;
  parcelas_objetivo: number;
  ocupacion_d: number;
  grupos?: number;
}): EtapaIntensificacion[] {
  const grupos = Math.max(1, Math.round(args.grupos ?? 1));
  const objetivo = Math.max(2, Math.round(args.parcelas_objetivo));
  const notas: Record<number, string> = {
    4: 'Con los alambres que ya están y el relieve, sin comprar nada: la fuente dice que incluso este paso mejora mucho la pastura y el animal.',
    8: 'El escalón que la literatura señala como el que paga en cría: de 8 a 12 parcelas.',
  };
  const pasos = [4, 8, objetivo].filter((n, i, a) => n <= objetivo && a.indexOf(n) === i);

  return pasos.map(parcelas => ({
    parcelas,
    ocupacion_d: args.ocupacion_d,
    descanso_d: descansoLogrado(parcelas, args.ocupacion_d, grupos),
    alambre_m: grillaSubdivision(args.ha_pastoreables, parcelas).alambre_m,
    nota: notas[parcelas] ?? 'La etapa intensiva, donde el descanso lo deciden la ocupación y las parcelas y no los alambres viejos.',
  }));
}

// ─── 10 · El fusible del año seco ─────────────────────────────────────────────

export interface FusibleSequia {
  /** Parcelas que la rotación necesita en la temporada de crecimiento rápido. */
  parcelas_en_uso: number;
  /** Las que sobran en esa temporada: el heno y el fusible. */
  parcelas_sobrantes: number;
  ha_sobrantes: number;
  pct_sobrante: number;
  /** Uso del forraje que la fuente llama conservador, en porcentaje. */
  uso_conservador_pct: number;
  /** Lo que se resigna en años normales, en porcentaje de la ganancia. */
  resigna_pct: readonly [number, number];
  /** Lo que se gana de más en una sequía severa, en porcentaje. */
  gana_en_sequia_pct: readonly [number, number];
}

/**
 * **El fusible no se inventa: sale de aplicar la misma fórmula dos veces.**
 *
 * Las parcelas se dimensionan con el descanso de la temporada más lenta, porque
 * así lo pide A3529. En la temporada rápida ese mismo campo necesita muchas menos
 * parcelas para cubrir un descanso más corto, y **las que sobran son el heno**.
 * La fuente lo dice como maniobra: *«Reduce the number of paddocks grazed in the
 * spring by using them to make hay. Put those paddocks back into the rotation in
 * the middle of the summer»*. Es el mismo potrero cumpliendo dos funciones según
 * la época, y es un número que acequia puede calcular y que no hay que adivinar.
 *
 * La otra mitad del fusible no es superficie, es carga, y tiene números.
 * Holechek y otros (1999): el uso conservador del forraje es **35 %**, y
 * *«on a short term basis (1-5 years), a rancher using conservative stocking will
 * forego at worst only 10-25% of the profits possible with moderate stocking.
 * However when severe drought occurs conservative stocking will give 30-60%
 * higher net returns than moderate stocking»*. Esa asimetría es el argumento
 * entero: se paga poco todos los años y se cobra mucho el año que importa.
 */
export const USO_CONSERVADOR_PCT = 35;
export const RESIGNA_PCT: readonly [number, number] = [10, 25];
export const GANA_EN_SEQUIA_PCT: readonly [number, number] = [30, 60];

export function fusibleSequia(args: {
  parcelas_total: number;
  descanso_rapido_d: number;
  ocupacion_d: number;
  ha_pastoreables: number;
  grupos?: number;
}): FusibleSequia {
  const grupos = Math.max(1, Math.round(args.grupos ?? 1));
  const total = Math.max(1, Math.round(args.parcelas_total));
  const en_uso = Math.min(total, parcelasNecesarias(args.descanso_rapido_d, args.ocupacion_d, grupos));
  const sobrantes = Math.max(0, total - en_uso);
  const ha_parcela = args.ha_pastoreables / total;

  return {
    parcelas_en_uso: en_uso,
    parcelas_sobrantes: sobrantes,
    ha_sobrantes: Math.round(sobrantes * ha_parcela * 10) / 10,
    pct_sobrante: Math.round((sobrantes / total) * 100),
    uso_conservador_pct: USO_CONSERVADOR_PCT,
    resigna_pct: RESIGNA_PCT,
    gana_en_sequia_pct: GANA_EN_SEQUIA_PCT,
  };
}

// ─── 11 · El calendario, con las estaciones del hemisferio del predio ─────────

export interface TemporadaManejo {
  nombre: string;
  tmean_c: number;
  caluroso: boolean;
  /** Descanso objetivo de la temporada, del rango publicado del tipo. */
  descanso_objetivo_d: number;
  /** Ocupación que resulta de tener las parcelas fijas. */
  ocupacion_d: number;
  ciclo_d: number;
  /** Tope de ocupación por rebrote en esa temporada. */
  tope_rebrote_d: number;
  /** La ocupación que sale pasa el tope: hay que sumar parcelas o sacar superficie. */
  excede_rebrote: boolean;
}

/**
 * El calendario de rotación por temporada, con **las estaciones del hemisferio
 * del predio** y no las del hemisferio norte de la fuente.
 *
 * Qué es «tiempo caluroso» la fuente no lo cuantifica, así que acequia usa como
 * marca la **temperatura de cruce C3/C4 de Collatz y otros (1998)**: 22 °C es,
 * por definición de ese trabajo, la temperatura a la que una gramínea templada
 * deja de ser competitiva. Es el puente de acequia entre dos fuentes y está
 * dicho acá; lo publicado son los 22 °C y los rangos de descanso, no la unión de
 * las dos cosas.
 */
export function calendarioRotacion(args: {
  meses: ReadonlyArray<{ tmean_c: number }>;
  lat: number | null | undefined;
  tipo: TipoPastura;
  parcelas: number;
  grupos?: number;
}): TemporadaManejo[] {
  const grupos = Math.max(1, Math.round(args.grupos ?? 1));
  const nombres = nombresDeTemporada(args.lat);
  const libres = Math.max(1, Math.round(args.parcelas) - grupos);

  return MESES_POR_TRIMESTRE.map((idxs, i) => {
    const datos = idxs.map(ix => args.meses[ix]).filter((m): m is { tmean_c: number } => m != null);
    const tmean = datos.length > 0
      ? datos.reduce((s, m) => s + m.tmean_c, 0) / datos.length
      : 0;
    const caluroso = tmean >= CRUCE_C3_C4_C;
    const descanso = descansoObjetivo(args.tipo, caluroso);
    const ocupacion = Math.round((descanso / libres) * 10) / 10;
    const tope = topeRebrote(descanso);

    return {
      nombre: nombres[i] ?? `Temporada ${i + 1}`,
      tmean_c: Math.round(tmean * 10) / 10,
      caluroso,
      descanso_objetivo_d: descanso,
      ocupacion_d: ocupacion,
      ciclo_d: Math.round(descanso + ocupacion),
      tope_rebrote_d: tope,
      excede_rebrote: ocupacion > tope,
    };
  });
}

// ─── 12 · Igualar por comida y no por superficie ──────────────────────────────

/**
 * **La regla que casi todos los diseños de potreros rompen**, y es una frase de
 * A3529: *«Note that the paddocks are not all the same size. It is more important
 * that the paddocks yield roughly equal amounts of forage than that they have
 * equal areas.»*
 *
 * Partir un campo en parcelas iguales es lo que hace una grilla, y es lo que
 * hace `potreros.ts`. Pero una parcela de bajo dulce y una de loma arenosa con
 * la misma superficie no dan la misma comida, así que con ocupación fija el
 * rodeo pasa hambre en una y desperdicia en la otra. Lo que hay que igualar es
 * la comida: **la parcela buena lleva menos hectáreas.**
 *
 * `haEquivalente` traduce: dada la producción relativa de una parcela respecto
 * del promedio del campo, cuántas hectáreas le tocan para que dé la misma
 * comida que una parcela promedio.
 *
 * acequia **no puede hacer esto sola todavía**, y es honesto decirlo: para
 * repartir por comida hace falta producción de forraje por ambiente, y ese número
 * —`prodForrajera`— es el que sigue sin fuente. Mientras tanto la función queda
 * disponible para que el usuario cargue la relación que él conoce de su campo,
 * que es exactamente el dato que un productor tiene y la app no.
 */
export function haEquivalente(ha_promedio: number, produccion_relativa: number): number {
  if (produccion_relativa <= 0) return ha_promedio;
  return Math.round((ha_promedio / produccion_relativa) * 100) / 100;
}
