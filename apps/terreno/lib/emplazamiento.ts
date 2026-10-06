/**
 * Emplazamiento de estructuras: dónde NO puede ir una construcción, y qué
 * cuesta ponerla donde se la quiere poner.
 *
 * ── Qué estaba mal, y es un problema de forma antes que de número ────────────
 *
 * `lib/masterplan.ts` ya ubica la casa, el galpón y el corral con una tabla de
 * puntaje. Esa tabla **suma y resta puntos y nunca descarta nada**: la pendiente
 * alta resta 5,6 puntos y estar en un drenaje resta 6,4, así que un lugar que
 * acumula bonos en los otros términos se queda con la casa igual. Pero el
 * retiro de un curso de agua no es una penalización: es una prohibición, y el
 * que la incumple no construyó peor, construyó donde no se puede. Son dos
 * estructuras distintas de regla y la app tenía una sola.
 *
 * Y lo decidía sobre una grilla de **10 × 10 celdas**: en un predio de 40 ha
 * cada celda mide 63 m de lado y 0,4 ha de superficie, cuarenta veces la huella
 * de una casa. El retiro más chico que pide la norma —10,7 m— es **seis veces
 * más fino que esa celda**. No se aplica un retiro de diez metros con una regla
 * de sesenta. Por eso este módulo corre sobre la grilla densa que la app ya
 * baja para las curvas de nivel, que en el mismo predio da un paso de unos 5 m.
 *
 * Para lo que sí es cuestión de grado, cambia el puntaje arbitrario por la
 * magnitud física que está detrás: en vez de «pendiente alta, −5,6», cuánto hay
 * que cortar, cuánta tierra se mueve, cuánto más grande que el edificio es el
 * movimiento de suelo, y si el camino puede llegar.
 *
 * ── Las fuentes ──────────────────────────────────────────────────────────────
 *
 * 1. **NRCS CPS 391 «Riparian Forest Buffer», USDA NRCS, NHCP, octubre 2020.**
 *    El retiro de un curso de agua, con una escalera de anchos según para qué
 *    sirve el retiro. Textual: «Extend the vegetation to the minimum width
 *    needed to achieve the intended purpose(s). Width of buffer refers to one
 *    side of the watercourse. Begin measurement at and perpendicular to the
 *    normal water line, bank-full elevation, or the top of the bank as
 *    determined locally»; «To reduce overland flow transport of sediment and
 *    organic material the minimum horizontal width shall be 35 feet»; «To treat
 *    waterbodies threatened by transport of pathogens, chemicals, pesticides,
 *    or nutrients in surface runoff or ground water flows, either extend the
 *    minimum horizontal width to 50 feet»; «Minimum recommended widths are 50
 *    feet for invertebrates, aquatic species, reptiles, amphibians, and birds
 *    that use edge habitat; 100 feet for birds needing interior habitat and
 *    small mammals; and 165 feet for large mammals».
 *
 * 2. **NRCS CPS 560 «Access Road», USDA NRCS, NHCP, septiembre 2020.** El
 *    camino. Textual: «Grades normally should not exceed 10 percent except for
 *    short lengths. A maximum grade of 15 percent should only be exceeded if
 *    necessary for special uses such as field access roads or fire protection
 *    roads»; «The minimum width of the roadbed for an all-purpose road is 14
 *    feet for one-way traffic and 20 feet for two-way traffic»; «Design all
 *    cuts and fills to have stable slopes that are a minimum of 2 horizontal to
 *    1 vertical»; «Where possible, design slopes to a minimum of 4 horizontal
 *    to 1 vertical to improve establishment and maintenance of turf».
 *
 * 3. **US EPA, «Onsite Wastewater Treatment Systems Manual», EPA/625/R-00/008,
 *    febrero 2002.** La posición en el paisaje y el área de reserva. Textual:
 *    «Landscape features that retain or concentrate subsurface flows, such as
 *    swales, depressions, or floodplains, should be avoided. Preferred
 *    landscape positions are convex slopes, flat areas with deep, permeable
 *    soils, and other sites that promote wastewater infiltration and dispersion
 *    through unsaturated soils»; «To account for grade variations, separation
 *    distances, piping routes, management considerations, and contingencies, an
 *    area sufficient to provide approximately 200 percent of the estimated
 *    treatment area needed should be investigated»; «The long axes of trenches
 *    should be aligned parallel to the ground surface contours». Y el recuadro
 *    «Factors of safety in infiltration surface sizing»: «the design flow
 *    includes an implicit factor of safety of 2.3 to 3.6 (…) Fortunately, these
 *    two assumptions largely cancel each other out in residential applications,
 *    but the suggested hydraulic loading rates often are used to size commercial
 *    systems and systems for schools and similar facilities, where the ratios
 *    between design flows and actual daily flows are closer to 1.0. This
 *    situation (…) has resulted in failures, particularly for larger systems
 *    where actual flow approximates design».
 *
 * 4. **15A NCAC 18A .1949 y .1955, North Carolina Administrative Code.** La
 *    única tabla numérica publicada y de acceso libre que liga la **clase
 *    textural USDA** con la tasa de absorción de largo plazo (LTAR). Textual:
 *    «In determining the volume of sewage from dwelling units, the flow rate
 *    shall be 120 gallons per day per bedroom»; «The long-term acceptance rate
 *    shall be based on the most hydraulically limiting naturally occurring soil
 *    horizon within three feet of the ground surface or to a depth of one foot
 *    below trench bottom, whichever is deeper»; «Trenches shall be located not
 *    less than three times the trench width on centers with a minimum spacing
 *    of five feet on centers»; y la tabla II con los cuatro grupos.
 *
 * 5. **29 CFR 1926 Subpart P, Appendix B «Sloping and Benching», OSHA.** Hasta
 *    dónde se para solo un corte mientras se construye. Textual: «Maximum
 *    allowable slope means the steepest incline of an excavation face that is
 *    acceptable for the most favorable site conditions as protection against
 *    cave-ins, and is expressed as the ratio of horizontal distance to vertical
 *    rise (H:V)»; tabla B-1: roca estable vertical (90°), tipo A 3/4:1 (53°),
 *    tipo B 1:1 (45°), tipo C 1½:1 (34°); «Sloping or benching for excavations
 *    greater than 20 feet deep shall be designed by a registered professional
 *    engineer».
 *
 * 6. **Montgomery, D.R. & Dietrich, W.E., «Channel initiation and the problem
 *    of landscape scale», Science 255 (1992) 826-830.** Dónde empieza un cauce,
 *    que es desde dónde se mide el retiro. Textual: «areas that plot above the
 *    upper limit of the source area-slope envelope [(A/b)S² > 200 m] are
 *    channeled valleys; areas within the range in values defined by the source
 *    area-slope envelope [25 m < (A/b)S² < 200 m] are transitional areas in
 *    which channel heads occur»; y la cautela que viene con el método: «for any
 *    given slope the source-area size may vary by as much as an order of
 *    magnitude».
 *
 * 7. **Copernicus DEM Product Handbook, GEO.2018-1988-2, v2.1, 25/06/2020.** El
 *    piso de ruido del relieve, que es lo que decide si la prueba del camino
 *    significa algo. Textual: «Absolute Vertical Accuracy < 4m (90% linear
 *    error)»; «Relative Vertical Accuracy < 2m (slope ≤ 20%), < 4m (slope >
 *    20%)», con la aclaración «(90% linear point-to-point error within an area
 *    of 1° x 1°)».
 *
 * ── Rango de validez y lo que este módulo NO mira ────────────────────────────
 *
 * - Los retiros y los límites de camino son **normas de los Estados Unidos**.
 *   Son las únicas publicadas, gratuitas y con el método a la vista que cubren
 *   esto; se usan como criterio técnico y se declaran como tales. **La norma
 *   local manda siempre**: donde haya código de edificación, retiro municipal o
 *   ley de bosques nativos, esos números reemplazan a estos.
 * - La red de cauces sale del **relieve**, no de un relevamiento de campo ni de
 *   una capa hidrográfica oficial. Con el umbral de Montgomery y Dietrich la
 *   cabecera queda bien ubicada en promedio y mal ubicada en cualquier punto
 *   dado: la propia fuente declara un orden de magnitud de dispersión.
 * - El retiro se mide desde la **celda de cauce**, que es el eje del valle que
 *   ve el modelo de elevación. La fuente pide medir desde el borde del cauce o
 *   la línea de agua normal, que está medio ancho de cauce más afuera: en un
 *   arroyo de 4 m el retiro calculado queda 2 m corto, y en un río no sirve.
 * - La plataforma se calcula como **corte y relleno compensados** sobre un
 *   plano de pendiente uniforme. No contempla roca, napa, suelo expansivo ni el
 *   esponjamiento: un corte en suelo natural no rinde en relleno el volumen que
 *   saca, y este módulo no aplica ningún factor por eso.
 * - El campo de infiltración se dimensiona desde la **textura**, y la fuente
 *   condiciona su tabla a la estructura y la mineralogía de arcilla, que acequia
 *   no mide. Por eso devuelve el **rango** del grupo y no un número.
 * - No mira: napa freática, mancha de inundación de un río, amenaza sísmica,
 *   estabilidad de ladera, servidumbres, líneas de alta tensión ni límites
 *   catastrales.
 *
 * ── Quién lo lee ─────────────────────────────────────────────────────────────
 * `components/EmplazamientoBloque.tsx`, dentro del panel de Master Plan. Y
 * `lib/masterplan.ts` toma de acá el lado asoleado del hemisferio.
 */

import { dimsCelda } from './cuencaHidro';
import { PASO_RELIEVE, pasoEfectivoM, type GrillaElevacion } from './grillaElevacion';

// ─── Fuentes citables ─────────────────────────────────────────────────────────

export const FUENTE_CPS391 =
  'NRCS CPS 391 «Riparian Forest Buffer», USDA NRCS, NHCP, octubre 2020';
export const FUENTE_CPS560 =
  'NRCS CPS 560 «Access Road», USDA NRCS, NHCP, septiembre 2020';
export const FUENTE_EPA_OWTS =
  'US EPA, «Onsite Wastewater Treatment Systems Manual», EPA/625/R-00/008, 2002';
export const FUENTE_NC18A =
  '15A NCAC 18A .1949 y .1955, North Carolina Administrative Code';
export const FUENTE_OSHA_P =
  '29 CFR 1926 Subpart P, Appendix B «Sloping and Benching», OSHA';
export const FUENTE_MD92 =
  'Montgomery, D.R. & Dietrich, W.E., Science 255 (1992) 826-830';
export const FUENTE_COPDEM =
  'Copernicus DEM Product Handbook, GEO.2018-1988-2, v2.1, 2020';

/** Lo que este módulo no puede saber y hay que decir siempre. */
export const LA_NORMA_LOCAL_MANDA =
  'La norma local manda: los retiros y los límites de camino de este bloque salen ' +
  'de normas técnicas de los Estados Unidos, que son las publicadas con el método ' +
  'a la vista. Donde haya código de edificación, retiro municipal o ley de bosques, ' +
  'esos números reemplazan a estos, que quedan como referencia de orden de magnitud.';

// ─── Unidades ─────────────────────────────────────────────────────────────────

/** Las normas citadas están en pies y galones. La conversión, en un solo lugar. */
export const PIE_M = 0.3048;
export const GALON_L = 3.785411784;

export function piesAM(pies: number): number {
  return pies * PIE_M;
}

/** gpd/ft² → L/día·m². 1 gal/ft² = 3,785411784 L / 0,09290304 m². */
export function gpdFt2ALDiaM2(gpd_ft2: number): number {
  return (gpd_ft2 * GALON_L) / (PIE_M * PIE_M);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1 · EL RETIRO DE UN CURSO DE AGUA (CPS 391)
// ═══════════════════════════════════════════════════════════════════════════════

export type PropositoBuffer =
  | 'sedimento'
  | 'nutrientes'
  | 'fauna_borde'
  | 'fauna_interior'
  | 'fauna_grande';

export interface AnchoBuffer {
  id:      PropositoBuffer;
  pies:    number;
  m:       number;
  /** Si la norma lo escribe como «shall be» (mínimo exigido) o como recomendación. */
  exigido: boolean;
  para:    string;
}

/**
 * La escalera de anchos de CPS 391, en el orden en que crece.
 *
 * **El hallazgo está en la escalera misma**: el retiro no es un número, es una
 * función de para qué sirve el retiro, y entre el primer escalón y el último hay
 * un factor 4,7 en el mismo arroyo. «Dejale diez metros al arroyo» no es un
 * criterio incompleto: es la respuesta a una pregunta que nadie hizo.
 *
 * Y «Width of buffer refers to one side of the watercourse»: el corredor
 * completo mide el doble de lo que dice la tabla.
 */
export const BUFFERS_CAUCE: readonly AnchoBuffer[] = [
  { id: 'sedimento',      pies:  35, m: piesAM(35),  exigido: true,  para: 'frenar el sedimento y la materia orgánica que corren por la superficie' },
  { id: 'nutrientes',     pies:  50, m: piesAM(50),  exigido: true,  para: 'frenar también patógenos, agroquímicos y nutrientes' },
  { id: 'fauna_borde',    pies:  50, m: piesAM(50),  exigido: false, para: 'invertebrados, especies acuáticas, reptiles, anfibios y aves de borde' },
  { id: 'fauna_interior', pies: 100, m: piesAM(100), exigido: false, para: 'aves que necesitan hábitat interior y mamíferos chicos' },
  { id: 'fauna_grande',   pies: 165, m: piesAM(165), exigido: false, para: 'mamíferos grandes' },
] as const;

export function bufferCauce(id: PropositoBuffer): AnchoBuffer {
  return BUFFERS_CAUCE.find(x => x.id === id) ?? BUFFERS_CAUCE[0]!;
}

/** Cuántas veces más ancho es el retiro de mamíferos grandes que el de sedimento. */
export function factorEscaleraBuffer(): number {
  return BUFFERS_CAUCE[BUFFERS_CAUCE.length - 1]!.m / BUFFERS_CAUCE[0]!.m;
}

/** El retiro es por orilla: el corredor completo mide el doble. */
export const BUFFER_ES_POR_ORILLA = true;

// ═══════════════════════════════════════════════════════════════════════════════
// 2 · DÓNDE EMPIEZA EL CAUCE (Montgomery & Dietrich 1992)
// ═══════════════════════════════════════════════════════════════════════════════

/** (A/b)S² por encima de esto es valle con cauce. */
export const UMBRAL_CAUCE_M = 200;
/** Entre este valor y el anterior están las cabeceras: la transición. */
export const UMBRAL_CABECERA_M = 25;
/** Por debajo de esto es ladera alta o divisoria. */
export const UMBRAL_LADERA_M = 10;
/** La dispersión en área de aporte que la propia fuente declara, en órdenes. */
export const DISPERSION_CABECERA_ORDENES = 1;

export type ClaseDeCauce = 'cauce' | 'cabecera' | 'ladera' | 'divisoria';

export const CLASE_DIVISORIA = 0;
export const CLASE_LADERA = 1;
export const CLASE_CABECERA = 2;
export const CLASE_CAUCE = 3;

/**
 * El índice (A/b)·S² de Montgomery y Dietrich.
 *
 * `A/b` es el área de aporte por unidad de longitud de curva de nivel —el área
 * específica de captación—, que en una grilla regular es (celdas aguas arriba ×
 * lado de celda). `S` es la pendiente local como tangente, no como porcentaje.
 * El resultado tiene unidades de metros, que es por qué los umbrales de la
 * fuente son «25 m» y «200 m» y no números sueltos.
 *
 * Por qué no un umbral fijo de acumulación: porque el área que hace falta para
 * abrir un cauce **baja con el cuadrado de la pendiente**. Un umbral fijo pone
 * la cabecera demasiado arriba en terreno suave y demasiado abajo en terreno
 * empinado, y el retiro se mide desde ahí.
 *
 * Y por qué no el umbral que la app ya tenía: `cuencaHidro.analizarRelieve`
 * marca cauce con `acum ≥ max(8, acumMax · 0,03)`, que es **relativo a la celda
 * más cargada de la ventana**. Con un umbral relativo, el mismo arroyo deja de
 * ser arroyo cuando se agranda el recorte, porque cambió el denominador y no el
 * terreno. Para dibujar vertientes en pantalla alcanza; para decidir un retiro
 * legal, no.
 */
export function indiceCauce(
  celdas_aguas_arriba: number,
  lado_celda_m: number,
  pendiente_fraccion: number,
): number {
  const S = Math.max(0, pendiente_fraccion);
  return Math.max(0, celdas_aguas_arriba) * lado_celda_m * S * S;
}

/**
 * El área de aporte que hace falta para que se abra un cauce, con una pendiente
 * dada. Es el umbral de la fuente despejado: A = 200 · b / S².
 *
 * Es el número que explica el límite más incómodo del método. Con una pendiente
 * longitudinal del 5 % hacen falta **40 ha** de cuenca para que el criterio
 * marque un cauce, y con el 2 % hacen falta 250. En un predio chico y suave el
 * método no encuentra ningún cauce, aunque haya una zanja a la vista: el umbral
 * se calibró en laderas empinadas del norte de California y describe dónde el
 * flujo superficial concentra lo suficiente para incidir, no dónde hay agua.
 * Cuando eso pasa hay que marcar el curso a mano, y el bloque lo dice.
 */
export function areaParaCauce(ancho_contorno_m: number, pendiente_fraccion: number): number {
  if (!(pendiente_fraccion > 0)) return Infinity;
  return (UMBRAL_CAUCE_M * ancho_contorno_m) / (pendiente_fraccion * pendiente_fraccion);
}

export function claseDeCauce(indice_m: number): ClaseDeCauce {
  if (indice_m > UMBRAL_CAUCE_M)    return 'cauce';
  if (indice_m > UMBRAL_CABECERA_M) return 'cabecera';
  if (indice_m > UMBRAL_LADERA_M)   return 'ladera';
  return 'divisoria';
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3 · LA POSICIÓN EN EL PAISAJE (EPA)
// ═══════════════════════════════════════════════════════════════════════════════

export type PosicionPaisaje = 'convexa' | 'plana' | 'concava';

/**
 * Convexa, plana o cóncava: el criterio que la fuente nombra para elegir el
 * lugar, y que no es la pendiente.
 *
 * La EPA pide evitar «swales, depressions, or floodplains» y preferir «convex
 * slopes, flat areas with deep, permeable soils». Una ladera cóncava y una
 * convexa pueden tener exactamente la misma pendiente y comportarse al revés:
 * la cóncava junta el flujo subsuperficial de toda la ladera de arriba y la
 * convexa lo reparte. La pendiente no distingue una de la otra, así que una
 * tabla de puntaje que sólo mira pendiente no puede ver esto.
 *
 * Se mide con el índice de posición topográfica —la elevación menos el promedio
 * del entorno— y el umbral de clase es la **desviación típica del propio índice
 * en el predio**, no un número fijo: en una llanura de 2 m de desnivel un umbral
 * de medio metro deja todo «plano», y en una sierra deja todo al borde.
 */
export function clasePosicion(tpi_m: number, umbral_m: number): PosicionPaisaje {
  if (!(umbral_m > 0) || !Number.isFinite(tpi_m)) return 'plana';
  if (tpi_m > umbral_m) return 'convexa';
  if (tpi_m < -umbral_m) return 'concava';
  return 'plana';
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4 · LA PLATAFORMA: QUÉ CUESTA LA PENDIENTE (CPS 560 + OSHA)
// ═══════════════════════════════════════════════════════════════════════════════

/** CPS 560: todo corte y relleno permanente, 2H:1V como mínimo. */
export const TALUD_PERMANENTE_HV = 2;
/** CPS 560: 4H:1V si se quiere que el talud se pueda engramar y mantener. */
export const TALUD_ENGRAMABLE_HV = 4;

export type TipoSueloOSHA = 'roca' | 'A' | 'B' | 'C';

/**
 * Tabla B-1 de OSHA: talud máximo (H:V) de un corte que se para solo mientras
 * se construye. Es una norma de seguridad de obra, no de estabilidad
 * permanente: para el talud que queda manda el 2H:1V de CPS 560, que es más del
 * doble de tendido que el 1½:1 que OSHA admite en el suelo más flojo.
 *
 * La diferencia no es un detalle: el que corta a 1½:1 porque «OSHA lo permite»
 * deja un talud que se para los dos meses de la obra y después se desmorona.
 */
export const TALUD_OSHA_HV: Record<TipoSueloOSHA, number> = {
  roca: 0,
  A:    0.75,
  B:    1,
  C:    1.5,
};

/** OSHA: por encima de esta profundidad el corte lo diseña un profesional. */
export const CORTE_CON_PROFESIONAL_M = piesAM(20);

/** Talud H:V → grados desde la horizontal. */
export function taludAGrados(hv: number): number {
  if (hv <= 0) return 90;
  return (Math.atan(1 / hv) * 180) / Math.PI;
}

/** Talud H:V → pendiente en porcentaje. */
export function taludAPct(hv: number): number {
  if (hv <= 0) return Infinity;
  return (1 / hv) * 100;
}

export interface Plataforma {
  ancho_m:            number;   // transversal a la pendiente
  largo_m:            number;   // paralelo a la curva de nivel
  pendiente_pct:      number;
  /** Profundidad máxima del corte, en el borde de arriba. */
  corte_m:            number;
  /** Altura máxima del relleno, en el borde de abajo. */
  relleno_m:          number;
  vol_corte_m3:       number;
  vol_relleno_m3:     number;
  /** Cuánto se extiende el talud de corte hacia arriba, con 2H:1V. */
  alcance_corte_m:    number;
  alcance_relleno_m:  number;
  huella_edificio_m2: number;
  /** La huella con los taludes incluidos: lo que realmente se toca. */
  huella_tocada_m2:   number;
  factor_huella:      number;
  /** Cuántas veces el ancho del edificio se come el talud de corte hacia arriba. */
  alcance_veces_ancho: number;
  /** Si el talud permanente ya no cierra o no cabe en la banda disponible. */
  pide_muro:          boolean;
  pide_profesional:   boolean;
}

/**
 * Lo que cuesta poner una plataforma horizontal en una ladera.
 *
 * Geometría, no coeficientes: con corte y relleno compensados la plataforma
 * queda a la cota del centro, el corte más profundo es `ancho · pendiente / 2`
 * y el volumen de corte es `largo · ancho² · pendiente / 8`. Las dos crecen con
 * el **ancho** —el volumen con el cuadrado— y sólo linealmente con la
 * pendiente. De ahí sale algo que ninguna tabla de puntaje puede decir: una
 * casa angosta y larga apoyada sobre la curva de nivel se para donde una casa
 * cuadrada de la misma superficie ya no, y la regla de pulgar «no construyas
 * arriba del 15 %» es la respuesta a una pregunta que depende del tamaño del
 * edificio y no sólo del terreno.
 *
 * `pide_muro` no significa que no se pueda: significa que el talud de 2H:1V que
 * pide la norma ya no cierra o no cabe, y hay que sostener la tierra con una
 * obra. Es la frontera entre mover tierra y construir.
 */
export function plataforma(
  ancho_m: number,
  largo_m: number,
  pendiente_pct: number,
  opciones?: { banda_disponible_m?: number; talud_hv?: number },
): Plataforma | null {
  if (!(ancho_m > 0) || !(largo_m > 0) || !Number.isFinite(pendiente_pct)) return null;
  const s = Math.max(0, pendiente_pct) / 100;
  const talud = opciones?.talud_hv ?? TALUD_PERMANENTE_HV;

  const corte = (ancho_m * s) / 2;
  const vol_corte = (largo_m * ancho_m * ancho_m * s) / 8;

  // El talud arranca en el borde del corte con inclinación 1/talud y el terreno
  // natural sube hacia arriba con pendiente s: se encuentran a corte/(1/talud − s).
  // Si el terreno es más empinado que el talud admisible, nunca se encuentran.
  const inclinacion = 1 / talud;
  const cierra = inclinacion > s;
  const alcance_corte = cierra ? corte / (inclinacion - s) : Infinity;
  // Hacia abajo el terreno se aleja del relleno, así que el talud siempre cierra.
  const alcance_relleno = corte / (inclinacion + s);

  const huella_edificio = ancho_m * largo_m;
  const ancho_tocado = cierra ? ancho_m + alcance_corte + alcance_relleno : Infinity;
  const huella_tocada = cierra ? ancho_tocado * largo_m : Infinity;

  const banda = opciones?.banda_disponible_m;
  const pide_muro =
    !cierra || (banda != null && Number.isFinite(ancho_tocado) && ancho_tocado > banda);

  return {
    ancho_m,
    largo_m,
    pendiente_pct,
    corte_m:            redondear(corte, 2),
    relleno_m:          redondear(corte, 2),
    vol_corte_m3:       redondear(vol_corte, 1),
    vol_relleno_m3:     redondear(vol_corte, 1),
    alcance_corte_m:    cierra ? redondear(alcance_corte, 2) : Infinity,
    alcance_relleno_m:  redondear(alcance_relleno, 2),
    huella_edificio_m2: redondear(huella_edificio, 1),
    huella_tocada_m2:   cierra ? redondear(huella_tocada, 1) : Infinity,
    factor_huella:      cierra ? redondear(huella_tocada / huella_edificio, 2) : Infinity,
    alcance_veces_ancho: cierra ? redondear(alcance_corte / ancho_m, 2) : Infinity,
    pide_muro,
    pide_profesional:   corte > CORTE_CON_PROFESIONAL_M,
  };
}

/**
 * La pendiente a partir de la cual el talud permanente ya no cierra: la que
 * iguala al propio talud admisible. Con 2H:1V, el 50 %.
 *
 * Por debajo de eso el talud siempre cierra, pero se come un ancho que crece
 * muy rápido al acercarse: el límite práctico es ese ancho, no el 50 %.
 */
export function pendienteQueExigeMuro(talud_hv = TALUD_PERMANENTE_HV): number {
  return taludAPct(talud_hv);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5 · EL CAMINO (CPS 560)
// ═══════════════════════════════════════════════════════════════════════════════

export const PENDIENTE_CAMINO_NORMAL_PCT = 10;
export const PENDIENTE_CAMINO_MAX_PCT = 15;
export const ANCHO_CAMINO_UNA_MANO_M = piesAM(14);
export const ANCHO_CAMINO_DOS_MANOS_M = piesAM(20);
export const ANCHO_CAMINO_UN_PROPOSITO_M = piesAM(10);
export const PERALTE_NO_PAVIMENTADO_PCT: readonly [number, number] = [2, 6];

/** Tabla 1 de CPS 560: recurrencia mínima de la tormenta de diseño del cruce. */
export const RECURRENCIA_CRUCE_CAMINO: readonly { uso: string; anios: number }[] = [
  { uso: 'Intermitente; un solo propósito o uso de campo',                              anios: 2 },
  { uso: 'Frecuente; casco, acceso del ganado, recreación aislada',                     anios: 10 },
  { uso: 'Intenso; residencial o acceso público',                                       anios: 25 },
] as const;

/** El error relativo punto a punto que publica el handbook de Copernicus. */
export const ERROR_RELATIVO_DEM_M = 2;
export const ERROR_RELATIVO_DEM_EMPINADO_M = 4;
export const PENDIENTE_CAMBIO_ERROR_PCT = 20;

/**
 * La pendiente más chica que un modelo de elevación puede distinguir del ruido:
 * el error relativo punto a punto dividido por el paso **efectivo** —el de la
 * fuente, no el del muestreo—.
 *
 * El paso efectivo es el que manda y no es un detalle: la cifra publicada es un
 * error en metros, fijo, así que muestrear la misma fuente más fino **empeora**
 * la pendiente en vez de mejorarla. Con los 30 m de GLO-30 el ruido equivale a
 * 6,7 % de pendiente, que ya son dos tercios del límite de camino de 10 %; si se
 * dividiera por el paso de una grilla de 5 m daría 40 %, que es el número
 * absurdo que avisa que por debajo del paso de la fuente lo que hay es
 * interpolación y no dato. Es la misma lección que `pasoEfectivoM` ya aplica
 * para decidir hasta qué intervalo tiene sentido dibujar una curva de nivel.
 *
 * Y en pendientes de más del 20 % el error publicado se duplica, con lo que
 * **supera** al criterio que se está probando. No invalida la prueba —sigue
 * siendo la mejor que se puede hacer sin ir al campo— pero explica por qué sirve
 * para descartar lo imposible y no para aprobar lo justo.
 */
export function pendienteMinimaResoluble(paso_efectivo_m: number, pendiente_pct = 0): number {
  if (!(paso_efectivo_m > 0)) return Infinity;
  const err =
    pendiente_pct > PENDIENTE_CAMBIO_ERROR_PCT
      ? ERROR_RELATIVO_DEM_EMPINADO_M
      : ERROR_RELATIVO_DEM_M;
  return (err / paso_efectivo_m) * 100;
}

/**
 * La incertidumbre horizontal del borde de una exclusión: medio paso de la
 * fuente.
 *
 * El retiro se mide desde una celda de cauce, y la celda de cauce está ubicada
 * con la resolución de la **fuente**. Con GLO-30 eso son ±15 m sobre un retiro
 * de 10,7 m: la banda de exclusión existe y su borde no se puede replantear con
 * una cinta. Dibujarla sobre una grilla de 5 m la hace suave, no exacta.
 *
 * De acá sale el límite más duro de este módulo: **el retiro y la pendiente de
 * camino piden resoluciones opuestas y el mismo modelo no puede dar las dos.**
 * El retiro necesita metros y la fuente global da treinta; la pendiente necesita
 * la escala de la fuente y se arruina si se la muestrea más fino. Donde hay DEM
 * nacional —3DEP, IGN, HRDEM, AHN, swisstopo— el problema desaparece.
 */
export function incertidumbreDeBorde(paso_fuente_m: number): number {
  return paso_fuente_m / 2;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6 · EL CAMPO DE INFILTRACIÓN: LA SUPERFICIE QUE LA CASA NO DECLARA
// ═══════════════════════════════════════════════════════════════════════════════

export type GrupoLTAR = 'I' | 'II' | 'III' | 'IV';

export interface DefGrupoLTAR {
  grupo:   GrupoLTAR;
  nombre:  string;
  clases:  readonly string[];
  /** gpd/ft², como lo publica la tabla II: del máximo al mínimo. */
  gpd_ft2: readonly [number, number];
}

/**
 * Tabla II de 15A NCAC 18A .1955: los cuatro grupos texturales con su tasa de
 * absorción de largo plazo.
 *
 * Dos cosas están a la vista en la tabla y las dos importan:
 *
 * - **El rango dentro de un grupo llega a un factor cuatro** (grupo IV, de 0,4
 *   a 0,1). La textura no alcanza para elegir el número: la regla condiciona
 *   cada grupo a «S or PS structure and clay mineralogy», que son estructura y
 *   mineralogía de arcilla, dos cosas que se ven en un pozo y no en un mapa.
 * - **Los rangos se superponen**: el IV va de 0,4 a 0,1 y el III de 0,6 a 0,3.
 *   Una arcilla bien estructurada acepta más que un franco limoso mal
 *   estructurado. El orden de los grupos no es un orden de calidad.
 */
export const GRUPOS_LTAR: readonly DefGrupoLTAR[] = [
  { grupo: 'I',   nombre: 'Arenas',          clases: ['arenoso', 'arenoso-franco'],                                                                      gpd_ft2: [1.2, 0.8] },
  { grupo: 'II',  nombre: 'Francos gruesos', clases: ['franco-arenoso', 'franco'],                                                                       gpd_ft2: [0.8, 0.6] },
  { grupo: 'III', nombre: 'Francos finos',   clases: ['franco-arcillo-arenoso', 'franco-limoso', 'franco-arcilloso', 'franco-arcillo-limoso', 'limoso'], gpd_ft2: [0.6, 0.3] },
  { grupo: 'IV',  nombre: 'Arcillas',        clases: ['arcillo-arenoso', 'arcillo-limoso', 'arcilloso'],                                                 gpd_ft2: [0.4, 0.1] },
] as const;

export type ClaseUSDA =
  | 'arenoso' | 'arenoso-franco' | 'franco-arenoso' | 'franco'
  | 'franco-limoso' | 'limoso' | 'franco-arcillo-arenoso' | 'franco-arcilloso'
  | 'franco-arcillo-limoso' | 'arcillo-arenoso' | 'arcillo-limoso' | 'arcilloso';

/**
 * Las doce clases del triángulo textural USDA desde los porcentajes.
 *
 * Se decide acá y no leyendo `clase_textura` de `lib/suelos.ts` a propósito: ese
 * clasificador tiene diez salidas, no doce —el franco arcillo arenoso y el
 * franco arcillo limoso no salen nunca—, y las dos clases que le faltan caen
 * justo en el grupo III. Un franco arcillo arenoso etiquetado como arcillo
 * arenoso se va al grupo IV y pierde un tercio de la tasa. Queda anotado como
 * corrección aparte; acá se trabaja con los porcentajes, que son el dato crudo.
 */
export function claseUSDA(arcilla_pct: number, arena_pct: number, limo_pct: number): ClaseUSDA {
  const a = arcilla_pct;
  const s = arena_pct;
  const l = limo_pct;

  if (a >= 40 && l >= 40) return 'arcillo-limoso';
  if (a >= 35 && s >= 45) return 'arcillo-arenoso';
  if (a >= 40) return 'arcilloso';
  if (a >= 27 && s <= 20) return 'franco-arcillo-limoso';
  if (a >= 27 && s <= 45) return 'franco-arcilloso';
  if (a >= 20 && l < 28 && s > 45) return 'franco-arcillo-arenoso';
  if (l >= 80 && a < 12) return 'limoso';
  if (l >= 50 && a < 27) return 'franco-limoso';
  if (l >= 28 && a >= 7 && a < 27 && s <= 52) return 'franco';
  if (s >= 85 && l + 1.5 * a <= 15) return 'arenoso';
  if (s >= 70 && l + 2 * a <= 30) return 'arenoso-franco';
  return 'franco-arenoso';
}

export function grupoLTAR(arcilla_pct: number, arena_pct: number, limo_pct: number): GrupoLTAR {
  const clase = claseUSDA(arcilla_pct, arena_pct, limo_pct);
  const def = GRUPOS_LTAR.find(g => g.clases.includes(clase));
  return def ? def.grupo : 'II';
}

export function defGrupoLTAR(g: GrupoLTAR): DefGrupoLTAR {
  return GRUPOS_LTAR.find(x => x.grupo === g) ?? GRUPOS_LTAR[1]!;
}

/** 15A NCAC 18A .1949: 120 gal/día por dormitorio, mínimo 240 por vivienda. */
export const CAUDAL_DORMITORIO_L_DIA = 120 * GALON_L;
export const CAUDAL_VIVIENDA_MIN_L_DIA = 240 * GALON_L;
/** Lo que la EPA declara como supuesto habitual, un 25 % más alto. */
export const CAUDAL_DORMITORIO_EPA_L_DIA = 150 * GALON_L;
/** El caudal por persona, para cuando la ocupación pasa de dos por dormitorio. */
export const CAUDAL_PERSONA_L_DIA = 60 * GALON_L;
/** El factor de seguridad implícito que la EPA declara en el caudal de diseño. */
export const FACTOR_SEGURIDAD_CAUDAL: readonly [number, number] = [2.3, 3.6];
/** 15A NCAC 18A .1955: ancho máximo de zanja y separación entre ejes. */
export const ANCHO_ZANJA_MAX_M = piesAM(3);
export const SEPARACION_ZANJAS_VECES_ANCHO = 3;
export const SEPARACION_ZANJAS_MIN_M = piesAM(5);
/** EPA: el área a investigar es el 200 % de la necesaria, por la reserva. */
export const FACTOR_AREA_RESERVA = 2;

export interface CampoInfiltracion {
  dormitorios:      number;
  caudal_l_dia:     number;
  caudal_epa_l_dia: number;
  clase:            ClaseUSDA;
  grupo:            GrupoLTAR;
  nombre_grupo:     string;
  ltar_l_dia_m2:    readonly [number, number];
  /** Fondo de zanja necesario, del mejor al peor caso del grupo. */
  area_zanja_m2:    readonly [number, number];
  largo_zanja_m:    readonly [number, number];
  /** La superficie de terreno que ocupa, con la separación entre zanjas. */
  superficie_m2:    readonly [number, number];
  /** Y con el área de reserva que la EPA pide dejar al lado. */
  con_reserva_m2:   readonly [number, number];
  separacion_m:     number;
  advertencias:     string[];
}

/**
 * La superficie de terreno que una vivienda necesita para tratar su propio
 * desagüe: el requisito que nadie dibuja en el plano.
 *
 * El caudal de diseño sale de la cantidad de **dormitorios**, no de la gente que
 * vive ahí, porque la gente cambia y los dormitorios no. Eso trae dos cosas que
 * la EPA pone por escrito y que son el hallazgo de este cálculo:
 *
 * 1. El caudal de diseño lleva un factor de seguridad implícito de 2,3 a 3,6
 *    sobre el consumo medido.
 * 2. Las tasas de absorción publicadas fueron calibradas **con ese caudal
 *    inflado**, así que están sobreestimadas en el mismo factor. Los dos errores
 *    se cancelan —y la fuente escribe «fortunately»—, pero sólo en una vivienda.
 *    En un salón de usos múltiples, una escuela o un conjunto de cabañas, donde
 *    el caudal de diseño se parece al real, dejan de cancelarse; la fuente
 *    atribuye a eso fallas de sistemas grandes.
 *
 * El otro número invisible: lo que ocupa **no es el fondo de la zanja**. La
 * regla pide las zanjas separadas tres anchos entre ejes, así que el terreno es
 * el triple; y la EPA pide reservar el 200 % del área, así que son seis veces el
 * fondo de zanja. Para una casa de tres dormitorios sobre un franco fino mal
 * estructurado eso pasa los 800 m² que `masterplan.ts` reserva hoy para la casa
 * **entera**, galpón y patio incluidos.
 */
export function campoDeInfiltracion(
  dormitorios: number,
  suelo: { arcilla_pct: number; arena_pct: number; limo_pct: number },
  opciones?: { ancho_zanja_m?: number; personas?: number },
): CampoInfiltracion | null {
  const dorm = Math.max(1, Math.round(dormitorios));
  if (!Number.isFinite(suelo.arcilla_pct) || !Number.isFinite(suelo.arena_pct)) return null;
  if (!Number.isFinite(suelo.limo_pct)) return null;

  const advertencias: string[] = [];
  let caudal = Math.max(CAUDAL_VIVIENDA_MIN_L_DIA, dorm * CAUDAL_DORMITORIO_L_DIA);

  const personas = opciones?.personas;
  if (personas != null && personas > 2 * dorm) {
    caudal = Math.max(caudal, personas * CAUDAL_PERSONA_L_DIA);
    advertencias.push(
      `Con ${personas} personas en ${dorm} dormitorio${dorm === 1 ? '' : 's'} la ocupación pasa ` +
      'de dos por dormitorio, y ahí la regla cambia de base: el caudal se calcula por persona.',
    );
  }

  const clase = claseUSDA(suelo.arcilla_pct, suelo.arena_pct, suelo.limo_pct);
  const grupo = grupoLTAR(suelo.arcilla_pct, suelo.arena_pct, suelo.limo_pct);
  const def = defGrupoLTAR(grupo);
  const ltarAlta = gpdFt2ALDiaM2(def.gpd_ft2[0]);
  const ltarBaja = gpdFt2ALDiaM2(def.gpd_ft2[1]);

  const areaMin = caudal / ltarAlta;
  const areaMax = caudal / ltarBaja;

  const ancho = Math.min(opciones?.ancho_zanja_m ?? ANCHO_ZANJA_MAX_M, ANCHO_ZANJA_MAX_M);
  const separacion = Math.max(SEPARACION_ZANJAS_MIN_M, SEPARACION_ZANJAS_VECES_ANCHO * ancho);
  const largoMin = areaMin / ancho;
  const largoMax = areaMax / ancho;
  const supMin = largoMin * separacion;
  const supMax = largoMax * separacion;

  advertencias.push(
    'El caudal de diseño sale de los dormitorios, no de la gente, y lleva un factor de ' +
    `seguridad implícito de ${FACTOR_SEGURIDAD_CAUDAL[0]} a ${FACTOR_SEGURIDAD_CAUDAL[1]} sobre ` +
    'el consumo medido. Las tasas publicadas se calibraron con ese caudal inflado, así que los ' +
    'dos errores se cancelan en una vivienda. En un salón, una escuela o un conjunto de cabañas ' +
    'no se cancelan, y la fuente atribuye a eso fallas de sistemas grandes.',
  );
  advertencias.push(
    `La tasa del grupo ${grupo} va de ${def.gpd_ft2[0]} a ${def.gpd_ft2[1]} gpd/ft²: un factor ` +
    `${redondear(def.gpd_ft2[0] / def.gpd_ft2[1], 1)}. La fuente la condiciona a la estructura y ` +
    'la mineralogía de arcilla del suelo, que no se leen de un mapa. Por eso esto es un rango.',
  );
  advertencias.push(
    'La regla manda tomar el horizonte más limitante de los primeros 90 cm, no el de la ' +
    'superficie. Donde haya un horizonte B arcilloso, la textura superficial sobreestima la ' +
    'tasa y el campo sale chico.',
  );

  return {
    dormitorios:      dorm,
    caudal_l_dia:     redondear(caudal, 0),
    caudal_epa_l_dia: redondear(dorm * CAUDAL_DORMITORIO_EPA_L_DIA, 0),
    clase,
    grupo,
    nombre_grupo:     def.nombre,
    ltar_l_dia_m2:    [redondear(ltarAlta, 1), redondear(ltarBaja, 1)],
    area_zanja_m2:    [redondear(areaMin, 1), redondear(areaMax, 1)],
    largo_zanja_m:    [redondear(largoMin, 1), redondear(largoMax, 1)],
    superficie_m2:    [redondear(supMin, 1), redondear(supMax, 1)],
    con_reserva_m2:   [redondear(supMin * FACTOR_AREA_RESERVA, 1), redondear(supMax * FACTOR_AREA_RESERVA, 1)],
    separacion_m:     redondear(separacion, 2),
    advertencias,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7 · EL HEMISFERIO
// ═══════════════════════════════════════════════════════════════════════════════

export const TROPICO_DEG = 23.4365;

export interface LadoAsoleado {
  /** Hacia dónde mira la ladera asoleada. */
  lado:    'norte' | 'sur';
  /** Signo que hay que darle a (elev_sur − elev_norte) para que «más es mejor». */
  signo:   1 | -1;
  ambiguo: boolean;
}

/**
 * De qué lado está el sol al mediodía, que es hacia dónde conviene que baje la
 * ladera.
 *
 * `masterplan.ts` tenía esto escrito al revés para medio planeta: puntuaba la
 * ladera que baja al norte como asoleada **en todo el mundo**. En el hemisferio
 * norte el sol del mediodía está al sur, así que en Bogotá, en Puerto Rico o en
 * España la app venía poniendo la casa y la huerta en la ladera sombría y
 * penalizando la buena. Es el cuarto motor que aparece atado al hemisferio sur.
 *
 * En la franja intertropical el sol pasa de los dos lados según la época y por
 * eso la función devuelve además `ambiguo`: ahí el signo de la ladera no decide
 * solo. Es la misma cosa que apareció con los aleros, donde en Bogotá la pared
 * del sur pide más alero que la del norte.
 */
export function ladoAsoleado(lat: number): LadoAsoleado {
  const sur = lat < 0;
  return {
    lado:    sur ? 'norte' : 'sur',
    signo:   sur ? 1 : -1,
    ambiguo: Math.abs(lat) < TROPICO_DEG,
  };
}

/**
 * Exposición solar de una celda con el signo del hemisferio ya aplicado: entra
 * la diferencia de elevación entre la vecina del sur y la del norte, y sale un
 * número donde positivo siempre significa «mira al sol».
 */
export function exposicionSolar(elev_sur_menos_norte_m: number, lat: number): number {
  return elev_sur_menos_norte_m * ladoAsoleado(lat).signo;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8 · EL CONTEXTO: TODO LO QUE SE CALCULA UNA VEZ SOBRE LA GRILLA
// ═══════════════════════════════════════════════════════════════════════════════

export interface ContextoEmplazamiento {
  g:              GrillaElevacion;
  /** Paso del muestreo: con el que se midió todo lo de acá. */
  paso_m:         number;
  /** Paso de la fuente del relieve: el que decide qué de todo esto es dato. */
  paso_fuente_m:  number;
  /** El mayor de los dos, que es el que vale para juzgar una pendiente. */
  paso_efectivo_m: number;
  area_celda_m2:  number;
  /** Pendiente por diferencias centradas, en fracción. */
  pend:           Float64Array;
  /** Celdas aguas arriba (D8 sobre el relieve rellenado). */
  acum:           Float64Array;
  indice_cauce:   Float64Array;
  clase_cauce:    Uint8Array;
  dist_cauce_m:   Float64Array;
  tpi_m:          Float64Array;
  tpi_umbral_m:   number;
  /** Largo del mejor camino desde el acceso, o Infinity si no llega. */
  camino_largo_m:   Float64Array | null;
  camino_pend_pct:  Float64Array | null;
  camino_limite_pct: number;
  lat:            number;
  buffer:         PropositoBuffer;
  ancho_m:        number;
  largo_m:        number;
  celdas_con_dato: number;
  /** Celdas que el criterio marcó como cauce. Cero es un resultado, no un error. */
  celdas_cauce:   number;
  /** Pendiente mediana del predio, para poder explicar un cero de cauces. */
  pend_mediana_pct: number;
}

export interface OpcionesEmplazamiento {
  buffer?:  PropositoBuffer;
  ancho_m?: number;
  largo_m?: number;
  /** Radio del entorno, en celdas, para el índice de posición topográfica. */
  radio_tpi?: number;
  camino_limite_pct?: number;
}

/**
 * Prepara todas las capas del emplazamiento sobre la grilla densa, en una sola
 * pasada por capa. Lo que viene después son consultas O(1) por celda.
 */
export function prepararEmplazamiento(
  g: GrillaElevacion,
  acceso?: { lat: number; lng: number } | null,
  opciones?: OpcionesEmplazamiento,
): ContextoEmplazamiento | null {
  const { rows, cols } = g;
  if (rows < 3 || cols < 3) return null;
  const n = rows * cols;

  const { dx, dy, areaCelda } = dimsCelda(g);
  const paso = (dx + dy) / 2;
  if (!(paso > 0)) return null;

  let conDato = 0;
  for (let i = 0; i < n; i++) if (!Number.isNaN(g.elev[i]!)) conDato++;
  if (conDato < 20) return null;

  const pend = pendienteCentrada(g, dx, dy);
  const acum = acumulacionD8(g);
  const indice = new Float64Array(n);
  const clase = new Uint8Array(n);

  for (let i = 0; i < n; i++) {
    if (Number.isNaN(g.elev[i]!)) { indice[i] = NaN; clase[i] = CLASE_DIVISORIA; continue; }
    const idx = indiceCauce(acum[i]!, paso, pend[i]!);
    indice[i] = idx;
    const c = claseDeCauce(idx);
    clase[i] =
      c === 'cauce'    ? CLASE_CAUCE :
      c === 'cabecera' ? CLASE_CABECERA :
      c === 'ladera'   ? CLASE_LADERA : CLASE_DIVISORIA;
  }

  let celdas_cauce = 0;
  for (let i = 0; i < n; i++) if (clase[i] === CLASE_CAUCE) celdas_cauce++;

  const pendientes: number[] = [];
  for (let i = 0; i < n; i++) if (!Number.isNaN(pend[i]!)) pendientes.push(pend[i]!);
  pendientes.sort((a, b) => a - b);
  const pendMediana = pendientes.length > 0
    ? pendientes[Math.floor(pendientes.length / 2)]! * 100
    : 0;

  const dist = distanciaACauce(g, clase, paso);
  const { tpi, umbral } = indicePosicion(g, opciones?.radio_tpi ?? 3);

  const limite = opciones?.camino_limite_pct ?? PENDIENTE_CAMINO_NORMAL_PCT;
  let camino_largo: Float64Array | null = null;
  let camino_pend: Float64Array | null = null;
  if (acceso) {
    const cam = accesibilidad(g, acceso, limite);
    if (cam) { camino_largo = cam.largo_m; camino_pend = cam.pend_max_pct; }
  }

  return {
    g,
    paso_m:            paso,
    paso_fuente_m:     g.fuente ? PASO_RELIEVE[g.fuente] : PASO_RELIEVE.terrarium,
    paso_efectivo_m:   pasoEfectivoM(g),
    area_celda_m2:     areaCelda,
    pend,
    acum,
    indice_cauce:      indice,
    clase_cauce:       clase,
    dist_cauce_m:      dist,
    tpi_m:             tpi,
    tpi_umbral_m:      umbral,
    camino_largo_m:    camino_largo,
    camino_pend_pct:   camino_pend,
    camino_limite_pct: limite,
    lat:               (g.latMin + g.latMax) / 2,
    buffer:            opciones?.buffer ?? 'sedimento',
    ancho_m:           opciones?.ancho_m ?? 10,
    largo_m:           opciones?.largo_m ?? 12,
    celdas_con_dato:   conDato,
    celdas_cauce,
    pend_mediana_pct:  redondear(pendMediana, 1),
  };
}

/**
 * Pendiente por diferencias centradas, en fracción.
 *
 * No se reusa la de `cuencaHidro`, que es la máxima diferencia con una vecina:
 * ésa sobreestima la pendiente de la superficie, y el índice de cauce va con el
 * **cuadrado** de la pendiente, así que un 30 % de error en S se vuelve un 69 %
 * de error en el índice y mueve la cabecera del cauce ladera arriba.
 */
export function pendienteCentrada(g: GrillaElevacion, dx: number, dy: number): Float64Array {
  const { rows, cols, elev } = g;
  const out = new Float64Array(rows * cols);
  const en = (r: number, c: number): number | null => {
    if (r < 0 || c < 0 || r >= rows || c >= cols) return null;
    const v = elev[r * cols + c]!;
    return Number.isNaN(v) ? null : v;
  };
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const e = en(r, c);
      if (e == null) { out[i] = NaN; continue; }
      const eE = en(r, c + 1) ?? e;
      const eW = en(r, c - 1) ?? e;
      const eN = en(r + 1, c) ?? e;
      const eS = en(r - 1, c) ?? e;
      const spanX = (en(r, c + 1) != null ? 1 : 0) + (en(r, c - 1) != null ? 1 : 0);
      const spanY = (en(r + 1, c) != null ? 1 : 0) + (en(r - 1, c) != null ? 1 : 0);
      const gx = spanX > 0 ? (eE - eW) / (spanX * dx) : 0;
      const gy = spanY > 0 ? (eN - eS) / (spanY * dy) : 0;
      out[i] = Math.hypot(gx, gy);
    }
  }
  return out;
}

/**
 * Acumulación D8 sobre el relieve con las depresiones rellenadas por vaciado
 * progresivo, contada en celdas. Es la misma idea que `cuencaHidro.analizarRelieve`
 * pero autocontenida, porque acá hace falta sobre la grilla densa y sin arrastrar
 * el análisis de crestas, que es la mitad del costo de aquella función.
 */
export function acumulacionD8(g: GrillaElevacion): Float64Array {
  const { rows, cols, elev } = g;
  const n = rows * cols;
  const { dist } = dimsCelda(g);
  const N8: ReadonlyArray<readonly [number, number]> = [
    [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1],
  ];

  // Priority-Flood: la cota de salida de cada celda nunca baja de la del vecino
  // por el que sale. Resuelve las hoyas sin llenarlas a mano.
  const filled = new Float64Array(n);
  for (let i = 0; i < n; i++) filled[i] = Number.isNaN(elev[i]!) ? NaN : Infinity;

  const monticulo: Array<{ i: number; z: number }> = [];
  const push = (i: number, z: number) => {
    monticulo.push({ i, z });
    let k = monticulo.length - 1;
    while (k > 0) {
      const p = (k - 1) >> 1;
      if (monticulo[p]!.z <= monticulo[k]!.z) break;
      const t = monticulo[p]!; monticulo[p] = monticulo[k]!; monticulo[k] = t;
      k = p;
    }
  };
  const pop = (): { i: number; z: number } | null => {
    if (monticulo.length === 0) return null;
    const top = monticulo[0]!;
    const last = monticulo.pop()!;
    if (monticulo.length > 0) {
      monticulo[0] = last;
      let k = 0;
      for (;;) {
        const l = 2 * k + 1, r = 2 * k + 2;
        let m = k;
        if (l < monticulo.length && monticulo[l]!.z < monticulo[m]!.z) m = l;
        if (r < monticulo.length && monticulo[r]!.z < monticulo[m]!.z) m = r;
        if (m === k) break;
        const t = monticulo[m]!; monticulo[m] = monticulo[k]!; monticulo[k] = t;
        k = m;
      }
    }
    return top;
  };

  // Siembra: todo borde del dominio con dato.
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const e = elev[i]!;
      if (Number.isNaN(e)) continue;
      let borde = r === 0 || c === 0 || r === rows - 1 || c === cols - 1;
      if (!borde) {
        for (const [dr, dc] of N8) {
          const nr = r + dr, nc = c + dc;
          if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) { borde = true; break; }
          if (Number.isNaN(elev[nr * cols + nc]!)) { borde = true; break; }
        }
      }
      if (borde) { filled[i] = e; push(i, e); }
    }
  }

  while (monticulo.length > 0) {
    const cur = pop();
    if (!cur) break;
    const r = (cur.i / cols) | 0, c = cur.i % cols;
    for (const [dr, dc] of N8) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      const j = nr * cols + nc;
      if (Number.isNaN(elev[j]!) || filled[j]! !== Infinity) continue;
      filled[j] = Math.max(elev[j]!, cur.z);
      push(j, filled[j]!);
    }
  }

  // D8 sobre el relieve rellenado: cada celda al vecino de mayor caída.
  const down = new Int32Array(n).fill(-1);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const z = filled[i]!;
      if (Number.isNaN(z)) continue;
      let mejor = -1, mejorS = 0;
      for (let k = 0; k < 8; k++) {
        const nr = r + N8[k]![0], nc = c + N8[k]![1];
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
        const j = nr * cols + nc;
        const zj = filled[j]!;
        if (Number.isNaN(zj)) continue;
        const s = (z - zj) / dist[k]!;
        if (s > mejorS) { mejorS = s; mejor = j; }
      }
      down[i] = mejor;
    }
  }

  // Orden topológico por grado de entrada.
  const indeg = new Int32Array(n);
  for (let i = 0; i < n; i++) { const t = down[i]!; if (t >= 0) indeg[t]!++; }
  const acum = new Float64Array(n);
  const cola: number[] = [];
  for (let i = 0; i < n; i++) {
    if (Number.isNaN(filled[i]!)) { acum[i] = NaN; continue; }
    acum[i] = 1;
    if (indeg[i] === 0) cola.push(i);
  }
  let head = 0;
  while (head < cola.length) {
    const cur = cola[head++]!;
    const t = down[cur]!;
    if (t >= 0) {
      acum[t]! += acum[cur]!;
      if (--indeg[t]! === 0) cola.push(t);
    }
  }
  return acum;
}

/**
 * Distancia en metros de cada celda a la celda de cauce más cercana, por
 * propagación desde todas las celdas de cauce a la vez.
 *
 * Es un Dijkstra multi-origen sobre la grilla con las ocho vecinas, que para una
 * distancia euclídea da un error de hasta un 8 % en las diagonales largas. Para
 * un retiro de 10 a 50 m medido sobre una grilla de 5 m, eso está por debajo del
 * ruido del propio modelo de elevación.
 */
export function distanciaACauce(
  g: GrillaElevacion,
  clase: Uint8Array,
  paso_m: number,
): Float64Array {
  const { rows, cols } = g;
  const n = rows * cols;
  const dist = new Float64Array(n).fill(Infinity);
  const cola: number[] = [];
  for (let i = 0; i < n; i++) {
    if (clase[i] === CLASE_CAUCE) { dist[i] = 0; cola.push(i); }
  }
  // Dos pasadas de chamfer por BFS pesado: con pesos 1 y √2 alcanza una cola FIFO
  // relajando repetido, que para grillas de este tamaño es inmediato.
  let head = 0;
  const diag = Math.SQRT2 * paso_m;
  while (head < cola.length) {
    const i = cola[head++]!;
    const r = (i / cols) | 0, c = i % cols;
    const d = dist[i]!;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
        const j = nr * cols + nc;
        if (Number.isNaN(g.elev[j]!)) continue;
        const paso = dr !== 0 && dc !== 0 ? diag : paso_m;
        if (d + paso < dist[j]! - 1e-9) {
          dist[j] = d + paso;
          cola.push(j);
        }
      }
    }
  }
  return dist;
}

/** Índice de posición topográfica y su desviación típica en el predio. */
export function indicePosicion(
  g: GrillaElevacion,
  radio_celdas: number,
): { tpi: Float64Array; umbral: number } {
  const { rows, cols, elev } = g;
  const n = rows * cols;
  const tpi = new Float64Array(n).fill(NaN);
  let suma = 0, suma2 = 0, cuenta = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const e = elev[i]!;
      if (Number.isNaN(e)) continue;
      let s = 0, k = 0;
      for (let dr = -radio_celdas; dr <= radio_celdas; dr++) {
        for (let dc = -radio_celdas; dc <= radio_celdas; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr, nc = c + dc;
          if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
          const v = elev[nr * cols + nc]!;
          if (Number.isNaN(v)) continue;
          s += v; k++;
        }
      }
      if (k === 0) continue;
      const t = e - s / k;
      tpi[i] = t;
      suma += t; suma2 += t * t; cuenta++;
    }
  }

  if (cuenta === 0) return { tpi, umbral: 0 };
  const media = suma / cuenta;
  const varianza = Math.max(0, suma2 / cuenta - media * media);
  return { tpi, umbral: Math.sqrt(varianza) };
}

export interface CaminoPosible {
  largo_m:      Float64Array;
  pend_max_pct: Float64Array;
  limite_pct:   number;
  alcanzadas:   number;
}

/**
 * Hasta dónde llega un camino que no se pasa de una pendiente dada, saliendo del
 * acceso del predio.
 *
 * Dijkstra sobre la grilla con las ocho vecinas, donde un paso sólo existe si su
 * pendiente no supera el límite; minimiza longitud, así que el resultado ya
 * incluye las vueltas. Un lugar «inalcanzable» no es uno al que no se llega
 * derecho: es uno al que no se llega **ni zigzagueando** dentro del predio.
 *
 * Por qué importa: `masterplan.ts` puede poner la casa en el mejor lugar del
 * predio y dejarla sin camino. Una casa a la que no se puede llegar con un
 * acoplado no está emplazada, está dibujada.
 */
export function accesibilidad(
  g: GrillaElevacion,
  acceso: { lat: number; lng: number },
  limite_pct: number,
): CaminoPosible | null {
  const { rows, cols, elev } = g;
  const n = rows * cols;
  const { dist: distN8 } = dimsCelda(g);
  const N8: ReadonlyArray<readonly [number, number]> = [
    [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1],
  ];

  const inicio = indiceDePunto(g, acceso.lat, acceso.lng);
  if (inicio == null) return null;

  const largo = new Float64Array(n).fill(Infinity);
  const pmax = new Float64Array(n).fill(NaN);
  largo[inicio] = 0;
  pmax[inicio] = 0;

  const heap: Array<{ i: number; d: number }> = [{ i: inicio, d: 0 }];
  const push = (i: number, d: number) => {
    heap.push({ i, d });
    let k = heap.length - 1;
    while (k > 0) {
      const p = (k - 1) >> 1;
      if (heap[p]!.d <= heap[k]!.d) break;
      const t = heap[p]!; heap[p] = heap[k]!; heap[k] = t;
      k = p;
    }
  };
  const pop = (): { i: number; d: number } | null => {
    if (heap.length === 0) return null;
    const top = heap[0]!;
    const last = heap.pop()!;
    if (heap.length > 0) {
      heap[0] = last;
      let k = 0;
      for (;;) {
        const l = 2 * k + 1, r = 2 * k + 2;
        let m = k;
        if (l < heap.length && heap[l]!.d < heap[m]!.d) m = l;
        if (r < heap.length && heap[r]!.d < heap[m]!.d) m = r;
        if (m === k) break;
        const t = heap[m]!; heap[m] = heap[k]!; heap[k] = t;
        k = m;
      }
    }
    return top;
  };

  const listo = new Uint8Array(n);
  let alcanzadas = 0;

  while (heap.length > 0) {
    const cur = pop();
    if (!cur) break;
    if (listo[cur.i]) continue;
    listo[cur.i] = 1;
    alcanzadas++;
    const r = (cur.i / cols) | 0, c = cur.i % cols;
    const z = elev[cur.i]!;
    for (let k = 0; k < 8; k++) {
      const nr = r + N8[k]![0], nc = c + N8[k]![1];
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      const j = nr * cols + nc;
      if (listo[j]) continue;
      const zj = elev[j]!;
      if (Number.isNaN(zj)) continue;
      const paso = distN8[k]!;
      const pend = (Math.abs(zj - z) / paso) * 100;
      if (pend > limite_pct) continue;
      const nd = cur.d + paso;
      if (nd < largo[j]!) {
        largo[j] = nd;
        pmax[j] = Math.max(pmax[cur.i]! || 0, pend);
        push(j, nd);
      }
    }
  }

  return { largo_m: largo, pend_max_pct: pmax, limite_pct, alcanzadas };
}

/** Índice de grilla del nodo más cercano a un punto, o null si cae fuera. */
export function indiceDePunto(g: GrillaElevacion, lat: number, lng: number): number | null {
  const { rows, cols } = g;
  if (rows < 2 || cols < 2) return null;
  const fr = ((lat - g.latMin) / (g.latMax - g.latMin)) * (rows - 1);
  const fc = ((lng - g.lngMin) / (g.lngMax - g.lngMin)) * (cols - 1);
  const r = Math.min(rows - 1, Math.max(0, Math.round(fr)));
  const c = Math.min(cols - 1, Math.max(0, Math.round(fc)));
  const i = r * cols + c;
  return Number.isNaN(g.elev[i]!) ? null : i;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9 · LA EVALUACIÓN DE UN PUNTO
// ═══════════════════════════════════════════════════════════════════════════════

export type ReglaExclusion = 'cauce' | 'buffer_cauce' | 'concava' | 'sin_camino';

export interface Exclusion {
  regla:  ReglaExclusion;
  titulo: string;
  motivo: string;
  fuente: string;
  hay_m?:  number;
  pide_m?: number;
}

export interface Requisito {
  titulo:  string;
  detalle: string;
  fuente?: string;
}

export interface EvaluacionEmplazamiento {
  excluido:      boolean;
  exclusiones:   Exclusion[];
  requisitos:    Requisito[];
  advertencias:  string[];
  pendiente_pct: number;
  posicion:      PosicionPaisaje;
  dist_cauce_m:  number | null;
  camino:        { largo_m: number; pend_max_pct: number } | null;
  plataforma:    Plataforma | null;
}

/**
 * Qué le pasa a una celda del predio si se le pone una construcción encima.
 *
 * Devuelve tres listas que no son lo mismo y que la app venía mezclando en un
 * solo puntaje:
 *
 * - `exclusiones`: razones por las que **no va ahí**. Son reglas de sí o no.
 * - `requisitos`: lo que hay que hacer para que vaya ahí, con su magnitud. No
 *   descalifican: cuestan.
 * - `advertencias`: lo que el método no puede resolver y queda a cargo de quien
 *   mira el terreno.
 */
export function evaluarEmplazamiento(
  ctx: ContextoEmplazamiento,
  i: number,
): EvaluacionEmplazamiento | null {
  if (i < 0 || i >= ctx.g.rows * ctx.g.cols) return null;
  if (Number.isNaN(ctx.g.elev[i]!)) return null;

  const exclusiones: Exclusion[] = [];
  const requisitos: Requisito[] = [];
  const advertencias: string[] = [];

  const pend_pct = (ctx.pend[i] ?? 0) * 100;
  const ancho = bufferCauce(ctx.buffer);
  const d = ctx.dist_cauce_m[i]!;

  // ── El cauce y su retiro ──
  if (ctx.clase_cauce[i] === CLASE_CAUCE) {
    exclusiones.push({
      regla:  'cauce',
      titulo: 'Es el cauce',
      motivo:
        'El relieve marca esta celda como fondo de valle con cauce. No es cuestión de ' +
        'retiro: es el lugar por donde pasa el agua.',
      fuente: FUENTE_MD92,
      hay_m:  0,
      pide_m: redondear(ancho.m, 1),
    });
  } else if (Number.isFinite(d) && d < ancho.m) {
    exclusiones.push({
      regla:  'buffer_cauce',
      titulo: 'Dentro del retiro del curso de agua',
      motivo:
        `Hay ${redondear(d, 0)} m hasta el cauce más cercano y el retiro para ${ancho.para} es ` +
        `de ${redondear(ancho.m, 1)} m (${ancho.pies} pies), por orilla.`,
      fuente: FUENTE_CPS391,
      hay_m:  redondear(d, 1),
      pide_m: redondear(ancho.m, 1),
    });
  }

  // ── La posición en el paisaje ──
  const tpi = ctx.tpi_m[i]!;
  const posicion = clasePosicion(tpi, ctx.tpi_umbral_m);
  if (posicion === 'concava') {
    exclusiones.push({
      regla:  'concava',
      titulo: 'Posición cóncava',
      motivo:
        `La celda está ${redondear(Math.abs(tpi), 2)} m por debajo del promedio de su entorno. ` +
        'La fuente pide evitar vaguadas, depresiones y planicies de inundación y preferir ' +
        'laderas convexas o planos: una concavidad junta el flujo subsuperficial de toda la ' +
        'ladera de arriba, y ahí no se trata un desagüe ni se seca un cimiento.',
      fuente: FUENTE_EPA_OWTS,
    });
  }

  // ── El camino ──
  let camino: { largo_m: number; pend_max_pct: number } | null = null;
  if (ctx.camino_largo_m) {
    const largo = ctx.camino_largo_m[i]!;
    if (Number.isFinite(largo)) {
      camino = {
        largo_m:      redondear(largo, 1),
        pend_max_pct: redondear(ctx.camino_pend_pct?.[i] ?? 0, 1),
      };
      requisitos.push({
        titulo: 'Camino',
        detalle:
          `${camino.largo_m} m desde el acceso sin pasar del ${ctx.camino_limite_pct} % de ` +
          `pendiente. A ${redondear(ANCHO_CAMINO_UNA_MANO_M, 1)} m de calzada, que es el mínimo ` +
          'de la norma para una mano de circulación, son ' +
          `${Math.round(camino.largo_m * ANCHO_CAMINO_UNA_MANO_M)} m² de camino.`,
        fuente: FUENTE_CPS560,
      });
    } else {
      exclusiones.push({
        regla:  'sin_camino',
        titulo: 'Sin camino posible',
        motivo:
          `Ningún recorrido dentro del predio llega hasta acá sin pasar del ` +
          `${ctx.camino_limite_pct} % de pendiente. Ni zigzagueando.`,
        fuente: FUENTE_CPS560,
      });
    }
  }

  // ── La plataforma ──
  const plat = plataforma(ctx.ancho_m, ctx.largo_m, pend_pct);
  if (plat) {
    if (plat.pide_muro) {
      requisitos.push({
        titulo: 'Muro de contención',
        detalle:
          `Con ${redondear(pend_pct, 1)} % de pendiente y ${ctx.ancho_m} m de ancho el corte ` +
          `llega a ${plat.corte_m} m, y el talud de 2H:1V que pide la norma no cierra. Hay que ` +
          'sostener la tierra con una obra.',
        fuente: FUENTE_CPS560,
      });
    } else if (plat.vol_corte_m3 >= 1) {
      requisitos.push({
        titulo: 'Movimiento de suelo',
        detalle:
          `${plat.vol_corte_m3} m³ de corte y otro tanto de relleno, con un corte máximo de ` +
          `${plat.corte_m} m. Contando los taludes se toca ${plat.huella_tocada_m2} m² para un ` +
          `edificio de ${plat.huella_edificio_m2} m²: ${plat.factor_huella} veces la huella.`,
        fuente: FUENTE_CPS560,
      });
    }
    if (plat.pide_profesional) {
      advertencias.push(
        `El corte pasa de ${redondear(CORTE_CON_PROFESIONAL_M, 1)} m, y a esa profundidad la ` +
        'norma de seguridad de obra exige que el talud lo diseñe un profesional matriculado.',
      );
    }
  }

  // ── Las cautelas del método ──
  if (plat && Number.isFinite(plat.alcance_veces_ancho) && plat.alcance_veces_ancho > 1) {
    advertencias.push(
      `El talud de corte se extiende ${plat.alcance_corte_m} m hacia arriba, que es ` +
      `${plat.alcance_veces_ancho} veces el ancho del propio edificio. Lo que se toca no es la ` +
      'huella: es la huella más los taludes.',
    );
  }
  const ruido = pendienteMinimaResoluble(ctx.paso_efectivo_m, pend_pct);
  if (ruido >= ctx.camino_limite_pct / 2) {
    advertencias.push(
      `El relieve de este predio tiene un paso efectivo de ${redondear(ctx.paso_efectivo_m, 1)} m ` +
      `y el error punto a punto que publica el proveedor equivale a ${redondear(ruido, 1)} % de ` +
      `pendiente, contra el ${ctx.camino_limite_pct} % que se está probando. Sirve para ` +
      'descartar lo imposible, no para aprobar lo justo.',
    );
  }
  if (ctx.celdas_cauce === 0) {
    const sMed = Math.max(0.001, ctx.pend_mediana_pct / 100);
    const haNecesarias = areaParaCauce(ctx.paso_m, sMed) / 10_000;
    advertencias.push(
      'El criterio no encontró ningún cauce en este predio, y por eso no hay ningún retiro ' +
      `aplicado. Con la pendiente mediana de acá (${ctx.pend_mediana_pct} %) harían falta ` +
      `${Math.round(haNecesarias)} ha de cuenca para que se abra uno. Si hay una zanja o un ` +
      'arroyo a la vista, hay que marcarlo a mano: el umbral describe dónde el flujo concentra ' +
      'lo suficiente para incidir, no dónde hay agua.',
    );
  }
  if (Number.isFinite(d)) {
    advertencias.push(
      'El retiro se mide desde el eje del valle que ve el relieve, no desde el borde del cauce: ' +
      'en el terreno el punto de partida está medio ancho de cauce más afuera.',
    );
    advertencias.push(
      `Y el cauce está ubicado con la resolución de la fuente, así que el borde de la banda de ` +
      `retiro tiene una incertidumbre de ±${redondear(incertidumbreDeBorde(ctx.paso_fuente_m), 1)} m. ` +
      'Con un modelo global eso es más que el propio retiro mínimo: la banda se dibuja, no se ' +
      'replantea con una cinta.',
    );
  }
  advertencias.push(LA_NORMA_LOCAL_MANDA);

  return {
    excluido:      exclusiones.length > 0,
    exclusiones,
    requisitos,
    advertencias,
    pendiente_pct: redondear(pend_pct, 1),
    posicion,
    dist_cauce_m:  Number.isFinite(d) ? redondear(d, 1) : null,
    camino,
    plataforma:    plat,
  };
}

export function evaluarPunto(
  ctx: ContextoEmplazamiento,
  lat: number,
  lng: number,
): EvaluacionEmplazamiento | null {
  const i = indiceDePunto(ctx.g, lat, lng);
  return i == null ? null : evaluarEmplazamiento(ctx, i);
}

// ─── Resumen del predio ───────────────────────────────────────────────────────

export interface ResumenEmplazamiento {
  celdas_total:        number;
  celdas_libres:       number;
  por_regla:           Array<{ regla: ReglaExclusion; titulo: string; celdas: number; pct: number }>;
  superficie_libre_ha: number;
  superficie_total_ha: number;
  paso_m:              number;
  paso_fuente_m:       number;
  incertidumbre_borde_m: number;
  /** Cuántas huellas del edificio declarado caben en una celda de la grilla. */
  huellas_por_celda:   number;
}

/**
 * Cuánto del predio queda disponible una vez aplicadas las exclusiones, y qué
 * regla saca más.
 *
 * Es el número que cambia una conversación: «el predio tiene 40 ha» y «el predio
 * tiene 40 ha, de las que 9 admiten una construcción» son dos predios distintos.
 */
export function resumenEmplazamiento(ctx: ContextoEmplazamiento): ResumenEmplazamiento {
  const n = ctx.g.rows * ctx.g.cols;
  const cuenta = new Map<ReglaExclusion, number>();
  let libres = 0;
  let conDato = 0;

  for (let i = 0; i < n; i++) {
    if (Number.isNaN(ctx.g.elev[i]!)) continue;
    conDato++;
    const ex = exclusionesDe(ctx, i);
    if (ex.length === 0) { libres++; continue; }
    for (const r of ex) cuenta.set(r, (cuenta.get(r) ?? 0) + 1);
  }

  const titulos: Record<ReglaExclusion, string> = {
    cauce:        'El cauce',
    buffer_cauce: 'Retiro del curso de agua',
    concava:      'Posición cóncava',
    sin_camino:   'Sin camino posible',
  };

  const por_regla = Array.from(cuenta.entries())
    .map(([regla, k]) => ({
      regla,
      titulo: titulos[regla],
      celdas: k,
      pct:    redondear((k / Math.max(1, conDato)) * 100, 1),
    }))
    .sort((a, b) => b.celdas - a.celdas);

  const area = ctx.area_celda_m2;
  return {
    celdas_total:        conDato,
    celdas_libres:       libres,
    por_regla,
    superficie_libre_ha: redondear((libres * area) / 10_000, 2),
    superficie_total_ha: redondear((conDato * area) / 10_000, 2),
    paso_m:              redondear(ctx.paso_m, 1),
    paso_fuente_m:       ctx.paso_fuente_m,
    incertidumbre_borde_m: redondear(incertidumbreDeBorde(ctx.paso_fuente_m), 1),
    huellas_por_celda:   redondear(area / Math.max(1, ctx.ancho_m * ctx.largo_m), 1),
  };
}

/** Las reglas que excluyen una celda, sin armar los textos: para el barrido. */
export function exclusionesDe(ctx: ContextoEmplazamiento, i: number): ReglaExclusion[] {
  const out: ReglaExclusion[] = [];
  const ancho = bufferCauce(ctx.buffer);
  if (ctx.clase_cauce[i] === CLASE_CAUCE) out.push('cauce');
  else if (ctx.dist_cauce_m[i]! < ancho.m) out.push('buffer_cauce');
  if (clasePosicion(ctx.tpi_m[i]!, ctx.tpi_umbral_m) === 'concava') out.push('concava');
  if (ctx.camino_largo_m && !Number.isFinite(ctx.camino_largo_m[i]!)) out.push('sin_camino');
  return out;
}

// ─── Auxiliares ───────────────────────────────────────────────────────────────

function redondear(v: number, dec: number): number {
  if (!Number.isFinite(v)) return v;
  const f = Math.pow(10, dec);
  return Math.round(v * f) / f;
}
