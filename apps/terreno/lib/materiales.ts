/**
 * La lista de materiales: cantidades, con base de medición, calidad y estado.
 *
 * ── Por qué no es el presupuesto ─────────────────────────────────────────────
 *
 * acequia ya tiene un presupuesto (`economia.ts`): rubros, cantidades, precio
 * unitario, total y repago. Eso es un presupuesto y está bien. No es una lista
 * de materiales, y la diferencia la definen las fuentes con una precisión que
 * conviene no perder.
 *
 * El cap. 5 del EFH enumera los siete pasos del diseño de una obra de predio y
 * los números 5, 6 y 7 son **tres cosas distintas**: «5. Estimate of material
 * quantities. 6. Specifications for materials and construction. 7. Estimate of
 * construction costs.» La norma de represas (CPS 378) pide en la lista de
 * contenidos obligatorios del plano un renglón que se llama, exactamente,
 * «**Quantities – bill of materials**». Y AH-590 dice qué tiene adentro: «The
 * drawings should also include a list of the estimated **quantity and kind** of
 * building materials required. The construction and material specifications
 * state the extent and type of work, site specific details, **material
 * quality**, and requirements for prefabricated materials.»
 *
 * De ahí salen las tres columnas que el presupuesto no tiene y esta lista sí.
 *
 * ── 1 · La calidad requerida, que es la mitad del renglón ────────────────────
 *
 * El cap. 5 del EFH: «Another important phase of the specifications is the
 * **listing of the required quality of the manufactured materials** that will be
 * used in the work.» Un renglón que dice «Cañería 500 m» no es una lista de
 * materiales: es una longitud. Lo que lo vuelve una lista es la clase de presión
 * que ese caño tiene que aguantar —que acequia ya calcula en `hidraulica.ts`—, o
 * la clase de galvanizado del alambre, o el diámetro mínimo de cabeza del poste.
 * Donde acequia conoce la calidad publicada, la escribe. Donde no, el renglón
 * sale marcado **sin calidad declarada** en vez de salir como si estuviera
 * completo: son los renglones que alguien tiene que completar antes de comprar.
 *
 * ── 2 · La base de medición, que es por dónde se va la plata ─────────────────
 *
 * AH-590, sobre qué tiene que decir una especificación: «**define the method of
 * measurement and the unit of payment** for the various items of work that
 * constitute the whole job». No es burocracia. Un metro cúbico de tierra son
 * tres números distintos según dónde se lo mida:
 *
 * - **compactado en obra**: el que queda dentro del terraplén;
 * - **banco excavado**: el que hay que sacar del préstamo, más grande porque al
 *   compactarse se reduce;
 * - **disponible en el préstamo**: el que tiene que haber ahí para no quedarse
 *   corto, más grande todavía.
 *
 * Y AH-590 publica la relación entre el primero y el tercero con un ejemplo
 * resuelto: «This 8,099 cubic yards represents the required compacted volume. To
 * account for shrinkage resulting from compaction, **a minimum of 1.5 times this
 * amount** is generally necessary to have available in the borrow areas and
 * required excavations. In this example you need a minimum of **12,148 cubic
 * yards** available to construct the dam.» 8.099 × 1,5 = 12.148: los dos números
 * están impresos, así que es un test.
 *
 * **Y acá hay una confusión que cuesta una obra.** El 1,5 de AH-590 no es un
 * factor de contracción: es cuánto material tiene que **haber disponible**, e
 * incluye la contracción más lo que al abrir el préstamo resulta inservible más
 * el desperdicio. El factor de contracción de acequia (`cutfill.ts`) vale 1,15 y
 * mide otra cosa: cuánto se encoge el banco al compactarse. Los dos son
 * correctos y no son intercambiables, con lo cual un plan que prevé 1,15 veces
 * el volumen compactado **cumple con la contracción y queda 23 % abajo del
 * mínimo disponible publicado**. Esta lista calcula los tres números y avisa.
 *
 * ── 3 · Lo que el presupuesto venía cobrando mal ────────────────────────────
 *
 * El renglón «Movimiento de suelo (represa)» de `economia.ts` tomaba su cantidad
 * de `represa.capacidad_m3`, que es **el agua**. El volumen de tierra de un muro
 * no tiene nada que ver con el volumen embalsado: en un vaso eficiente el agua
 * es varias veces la tierra, y en un sitio malo es al revés. Era exactamente el
 * modo en que esta app falla —no se estrella, imprime un número plausible—
 * aplicado al renglón más caro del presupuesto. `cutfill.ts` ya calculaba el
 * volumen bueno (`balanceTierra`) y nadie lo estaba leyendo. Corregido: sin el
 * cálculo del muro, la lista **no emite** el renglón de tierra, porque el agua
 * no es una estimación mala de la tierra, es otra magnitud.
 *
 * ── 4 · Los postes no van cada ocho metros ──────────────────────────────────
 *
 * `economia.ts` sugería «~1 poste cada 8 m como referencia» para todo el
 * planeta. La separación máxima de postes de línea está **publicada y depende de
 * tres cosas** (especificación de alambrados, Tabla 1):
 *
 * - de la **especie**: 20 pies para bovinos, 15 para caprinos;
 * - de si el cierre es **eléctrico**: 100 pies en liso de alta resistencia, cinco
 *   veces más que el mismo cierre con púa;
 * - de si lleva **varillas** entre postes, que suben el máximo a 30 o 150 pies.
 *
 * Con lo cual los 8 m de referencia están **por encima del máximo** de un cierre
 * de púa para bovinos sin varillas (6,10 m) —faltaban postes— y muy por debajo
 * del de un eléctrico (30,48 m) —sobraban casi cuatro de cada cinco—. acequia ya
 * sabe la especie y ya tiene módulo de electrificador, así que puede usar el
 * número que corresponde.
 *
 * Y faltaba el renglón más caro de un alambrado: **los conjuntos de esquina**.
 * La especificación los define como los arriostramientos «located where there are
 * changes in fence direction due to slope and alignment changes», avisa que «if
 * any brace fails, there is a loss of wire tension and fence failure», y pide los
 * postes enterrados un mínimo de 3 pies. Un polígono de doce mojones lleva doce
 * conjuntos, y el presupuesto tenía cero.
 *
 * ── Lo que esta lista NO hace ───────────────────────────────────────────────
 *
 * No pone precios: eso es `economia.ts` y los precios son del lugar. No inventa
 * un desperdicio donde no hay uno publicado —si la fuente no dice cuánto, el
 * renglón sale sin margen y lo dice—. No sabe qué hay en el predio: el estado de
 * cada renglón lo pone una persona. Y la tabla de separación de postes es una
 * especificación **estatal** de una agencia de EE.UU., calibrada en su práctica;
 * donde haya norma local, manda la local, y el renglón lo dice.
 *
 * Fuentes: CPS 378 «Pond»; EFH cap. 5 «Preparation of Engineering Plans»;
 * AH-590 (NRCS, 1997), p. 51-52; NRCS Texas, «Fence» (Code 382), Especificación,
 * octubre de 2015, Tabla 1 y secciones II-IV.
 */
import { PIE_M, PULGADA_M, YARDA3_M3 } from './represaDiseno';
import type { ResultadoMuro, BalanceTierra } from './cutfill';
import type { RedAguaResumen } from './hidraulica';
import type { MetricasPoligono } from './geometria';

// ─── 0 · Fuentes ──────────────────────────────────────────────────────────────

export const FUENTE_CPS378_BOM =
  'USDA NRCS, Conservation Practice Standard «Pond» (Code 378), «Plans and Specifications»: «Quantities – bill of materials».';
export const FUENTE_EFH5_MATERIALES =
  'USDA Soil Conservation Service, Engineering Field Manual, cap. 5 «Preparation of Engineering Plans», «Design procedures» y «Specifications».';
export const FUENTE_AH590_CANTIDADES =
  'USDA NRCS, Agriculture Handbook 590, «Ponds — Planning, Design, Construction» (1997), «Estimating volume» y «Drawings and specifications», p. 51-52.';
export const FUENTE_382 =
  'USDA NRCS Texas, «Fence» (Code 382), Especificación, octubre de 2015, Tabla 1 «Criteria for selection and installation of fences» y secciones II a IV.';

// ─── 1 · Estado, base de medición y margen ────────────────────────────────────

/**
 * Estado de cada renglón, que es lo que convierte la lista en una herramienta y
 * no en un inventario de deseos.
 *
 * La práctica de llevar el estado contra el plano está publicada en el cap. 5 del
 * EFH como registro de obra: «Changes or additions made during construction
 * should be recorded in colored pencil on the office copy of the plans. These
 * "as built" plans often are useful when making maintenance recommendations».
 * Esta columna es ese lápiz de color, antes de empezar.
 */
export type EstadoRenglon = 'necesario' | 'repuesto' | 'pedido';

export const ESTADO_TEXTO: Record<EstadoRenglon, string> = {
  necesario: 'Necesario',
  repuesto:  'Repuesto',
  pedido:    'Pedido',
};

export const ESTADO_QUE_SIGNIFICA: Record<EstadoRenglon, string> = {
  necesario: 'Hace falta y todavía no está.',
  repuesto:  'Ya está en el predio.',
  pedido:    'Encargado, en camino.',
};

/**
 * Dónde se mide la cantidad. AH-590: «define the method of measurement and the
 * unit of payment for the various items of work».
 */
export type BaseDeMedicion =
  | 'compactado_en_obra'
  | 'banco_excavado'
  | 'disponible_en_prestamo'
  | 'suministrado'
  | 'superficie'
  | 'unidad';

export const BASE_TEXTO: Record<BaseDeMedicion, string> = {
  compactado_en_obra:     'compactado en obra',
  banco_excavado:         'banco excavado',
  disponible_en_prestamo: 'disponible en el préstamo',
  suministrado:           'suministrado',
  superficie:             'superficie tratada',
  unidad:                 'por unidad',
};

export interface Margen {
  factor: number;
  motivo: string;
  fuente: string;
}

/**
 * El mínimo publicado de material que tiene que haber disponible, como múltiplo
 * del volumen compactado. AH-590, con su ejemplo resuelto de 8.099 → 12.148 yd³.
 */
export const FACTOR_DISPONIBLE_AH590 = 1.5;

export const MARGEN_DISPONIBLE: Margen = {
  factor: FACTOR_DISPONIBLE_AH590,
  motivo: 'Lo que tiene que HABER disponible en el préstamo, no lo que queda en la obra: contracción por compactación más el material que al abrirlo resulta inservible más el desperdicio.',
  fuente: FUENTE_AH590_CANTIDADES,
};

export interface RenglonMaterial {
  id:        string;
  rubro:     string;
  concepto:  string;
  cantidad:  number;
  unidad:    string;
  base:      BaseDeMedicion;
  /** La calidad publicada que ese material tiene que cumplir. `null` = no declarada. */
  calidad:   string | null;
  /** De qué cálculo de acequia sale la cantidad. */
  deDonde:   string;
  fuente:    string | null;
  margen:    Margen | null;
  estado:    EstadoRenglon;
  advertencia?: string;
}

// ─── 2 · Alambrados: la tabla publicada ───────────────────────────────────────

export type EspecieCierre = 'bovino' | 'equino' | 'ovino' | 'caprino' | 'ciervo';
export type TipoDeCierre  = 'pua' | 'tejido' | 'tejido_alta_resistencia' | 'electrico_liso' | 'pua_suspendido';

export interface FilaCierre {
  especie:  EspecieCierre;
  tipo:     TipoDeCierre;
  /** Separación máxima de postes con 2 o más varillas por claro (m). `null` = la tabla dice N/A. */
  conVarillas_m: number | null;
  /** Separación máxima de postes sin varillas (m). `null` = la tabla no lo da. */
  sinVarillas_m: number | null;
  /** Altura del hilo superior (m). */
  altoHiloSuperior_m: number;
}

/**
 * Tabla 1 de la especificación de alambrados: separación máxima de postes de
 * línea, por especie y tipo de cierre, con y sin varillas.
 *
 * Los valores de la fuente están en pies y pulgadas y acá se convierten; el
 * encabezado de la columna es «With **2 or More** Stays», así que cuando se usa
 * la separación larga la especificación pide **al menos dos varillas por claro**
 * y no una. La fuente agrega el límite de su propio uso: «Spacing may need to be
 * narrower depending on terrain and pressure from livestock». Es un máximo.
 *
 * La columna «Minimum Number of Wires» de esa misma tabla no se pudo leer sin
 * ambigüedad en el documento consultado, así que acequia **pide** la cantidad de
 * hilos en vez de suponerla: un alambrado con tres hilos y uno con siete son dos
 * listas de materiales distintas, y adivinarlo sería inventar un número.
 */
export const TABLA_CIERRE_382: readonly FilaCierre[] = [
  { especie: 'bovino',  tipo: 'pua',                     conVarillas_m: 30 * PIE_M, sinVarillas_m: 20 * PIE_M, altoHiloSuperior_m: 44 * PULGADA_M },
  { especie: 'bovino',  tipo: 'tejido',                  conVarillas_m: 30 * PIE_M, sinVarillas_m: 20 * PIE_M, altoHiloSuperior_m: 44 * PULGADA_M },
  { especie: 'bovino',  tipo: 'tejido_alta_resistencia', conVarillas_m: null,       sinVarillas_m: 25 * PIE_M, altoHiloSuperior_m: 44 * PULGADA_M },
  { especie: 'bovino',  tipo: 'electrico_liso',          conVarillas_m: 150 * PIE_M, sinVarillas_m: 100 * PIE_M, altoHiloSuperior_m: 43 * PULGADA_M },
  { especie: 'bovino',  tipo: 'pua_suspendido',          conVarillas_m: 100 * PIE_M, sinVarillas_m: null,       altoHiloSuperior_m: 44 * PULGADA_M },
  { especie: 'equino',  tipo: 'pua',                     conVarillas_m: 30 * PIE_M, sinVarillas_m: 20 * PIE_M, altoHiloSuperior_m: 44 * PULGADA_M },
  { especie: 'equino',  tipo: 'electrico_liso',          conVarillas_m: 150 * PIE_M, sinVarillas_m: 100 * PIE_M, altoHiloSuperior_m: 43 * PULGADA_M },
  { especie: 'ovino',   tipo: 'pua',                     conVarillas_m: 30 * PIE_M, sinVarillas_m: 20 * PIE_M, altoHiloSuperior_m: 36 * PULGADA_M },
  { especie: 'ovino',   tipo: 'tejido',                  conVarillas_m: 30 * PIE_M, sinVarillas_m: 20 * PIE_M, altoHiloSuperior_m: 39 * PULGADA_M },
  { especie: 'ovino',   tipo: 'tejido_alta_resistencia', conVarillas_m: null,       sinVarillas_m: 25 * PIE_M, altoHiloSuperior_m: 39 * PULGADA_M },
  { especie: 'ovino',   tipo: 'electrico_liso',          conVarillas_m: 150 * PIE_M, sinVarillas_m: 75 * PIE_M, altoHiloSuperior_m: 36 * PULGADA_M },
  { especie: 'caprino', tipo: 'pua',                     conVarillas_m: 20 * PIE_M, sinVarillas_m: 15 * PIE_M, altoHiloSuperior_m: 36 * PULGADA_M },
  { especie: 'caprino', tipo: 'tejido',                  conVarillas_m: 30 * PIE_M, sinVarillas_m: 20 * PIE_M, altoHiloSuperior_m: 39 * PULGADA_M },
  { especie: 'caprino', tipo: 'tejido_alta_resistencia', conVarillas_m: null,       sinVarillas_m: 25 * PIE_M, altoHiloSuperior_m: 39 * PULGADA_M },
  { especie: 'caprino', tipo: 'electrico_liso',          conVarillas_m: 150 * PIE_M, sinVarillas_m: 50 * PIE_M, altoHiloSuperior_m: 36 * PULGADA_M },
  { especie: 'ciervo',  tipo: 'tejido',                  conVarillas_m: 20 * PIE_M, sinVarillas_m: 20 * PIE_M, altoHiloSuperior_m: 96 * PULGADA_M },
];

/** Varillas por claro que pide la columna larga de la tabla: «With 2 or More Stays». */
export const VARILLAS_POR_CLARO = 2;

/** Profundidad mínima de enterrado de un poste de arriostramiento (m): 3 pies. */
export const ENTERRADO_ARRIOSTRE_M = 3 * PIE_M;
/** Profundidad de enterrado de un poste de línea (m): 24 pulgadas. */
export const ENTERRADO_LINEA_M = 24 * PULGADA_M;
/** Sobrante de la varilla sobre la altura del cierre (m): «fence height plus 2 inches». */
export const SOBRANTE_VARILLA_M = 2 * PULGADA_M;

export interface SeparacionDePostes {
  /** La separación máxima que corresponde (m). */
  maximo_m:  number;
  /** Cuántas varillas por claro pide la fuente con esa separación. */
  varillasPorClaro: number;
  fila:      FilaCierre;
  /** Por qué este número y no otro. */
  porque:    string;
}

/**
 * La separación máxima de postes que corresponde a un cierre.
 *
 * `conVarillas` elige la columna de la tabla: con varillas el poste puede ir más
 * lejos pero hay que poner al menos dos varillas en cada claro. Devuelve `null`
 * cuando la combinación no está en la tabla: no se extrapola una separación de
 * postes a una especie que la fuente no cubrió.
 */
export function separacionDePostes(
  especie: EspecieCierre, tipo: TipoDeCierre, conVarillas = false,
): SeparacionDePostes | null {
  const fila = TABLA_CIERRE_382.find(f => f.especie === especie && f.tipo === tipo);
  if (!fila) return null;
  const max = conVarillas ? fila.conVarillas_m : fila.sinVarillas_m;
  if (max == null) {
    // La otra columna, si la tabla la da: un N/A no es un cero.
    const otra = conVarillas ? fila.sinVarillas_m : fila.conVarillas_m;
    if (otra == null) return null;
    return {
      maximo_m: otra,
      varillasPorClaro: conVarillas ? 0 : VARILLAS_POR_CLARO,
      fila,
      porque: `La tabla no da la columna pedida para este cierre (dice N/A), así que se usa la otra: ${(otra / PIE_M).toFixed(0)} pies.`,
    };
  }
  return {
    maximo_m: max,
    varillasPorClaro: conVarillas ? VARILLAS_POR_CLARO : 0,
    fila,
    porque: conVarillas
      ? `${(max / PIE_M).toFixed(0)} pies es el máximo con dos o más varillas por claro; sin varillas la tabla baja a ${fila.sinVarillas_m != null ? (fila.sinVarillas_m / PIE_M).toFixed(0) + ' pies' : 'N/A'}.`
      : `${(max / PIE_M).toFixed(0)} pies es el máximo sin varillas; con dos o más varillas por claro la tabla sube a ${fila.conVarillas_m != null ? (fila.conVarillas_m / PIE_M).toFixed(0) + ' pies' : 'N/A'}.`,
  };
}

// ─── 3 · Renglones del cierre ─────────────────────────────────────────────────

let _n = 0;
const nuevoId = (p: string) => `${p}${(_n++).toString(36)}`;

export interface EntradaCierre {
  largo_m:   number;
  /** Cambios de dirección del cierre: cada uno es un conjunto de esquina. */
  esquinas:  number;
  especie:   EspecieCierre;
  tipo:      TipoDeCierre;
  conVarillas?: boolean;
  /** Cantidad de hilos. La fuente la publica por tipo de cierre; acequia la pide. */
  hilos?:    number | null;
  /** Postes de madera tratada, madera sin tratar o acero: cambia la calidad. */
  material?: 'acero_t' | 'madera_tratada' | 'madera_sin_tratar' | 'cano_acero';  /**
   * `true` cuando el cierre vuelve sobre sí mismo —el perímetro de un predio o
   * un potrero— y `false` cuando tiene dos puntas.
   *
   * Cambia la cuenta en uno: una línea abierta de N claros lleva N+1 postes, y
   * una cerrada lleva N, porque el último poste es el primero. El perímetro se
   * calculaba con la fórmula de la abierta.
   */
  cerrado?: boolean;
}

const CALIDAD_POSTE: Record<NonNullable<EntradaCierre['material']>, string> = {
  acero_t:           'Perfil T o U de acero, largo mínimo 1,83 m (6 pies), enterrado 0,61 m (24 pulgadas). En suelo pedregoso la fuente admite 1,68 m enterrado 0,46 m.',
  madera_tratada:    'Madera tratada a presión, diámetro mínimo de cabeza 64 mm (2½ pulgadas), largo mínimo 1,83 m, enterrada o clavada 0,61 m.',
  madera_sin_tratar: 'Madera naturalmente durable sin tratar, diámetro mínimo de cabeza 76 mm (3 pulgadas), largo mínimo 1,83 m, enterrada o clavada 0,61 m.',
  cano_acero:        'Caño de acero, diámetro exterior mínimo 60 mm (2⅜ pulgadas), enterrado 0,61 m.',
};

const CALIDAD_ALAMBRE =
  'Alambre galvanizado nuevo, según ASTM A 116 (tejido) o ASTM A 121 (púa). El galvanizado tiene que ser Clase I o Clase III: la fuente aclara que los grados «regular», «commercial» y «utility» no alcanzan para la vida útil esperada.';

/**
 * Los renglones de un cierre, calculados con la separación publicada.
 *
 * Devuelve `[]` si el largo no es positivo o si la combinación especie/tipo no
 * está en la tabla: sin separación publicada no hay cantidad de postes, y poner
 * una de referencia es cómo se llegó a los ocho metros para todo el planeta.
 */
export function renglonesDeCierre(e: EntradaCierre): RenglonMaterial[] {
  if (!(e.largo_m > 0)) return [];
  const sep = separacionDePostes(e.especie, e.tipo, e.conVarillas ?? false);
  if (!sep) return [];

  const esquinas = Math.max(0, Math.round(e.esquinas));
  const claros   = Math.ceil(e.largo_m / sep.maximo_m);
  // Los postes de línea no incluyen los de esquina: esos van en el conjunto
  // arriostrado, que es otro renglón y otro precio. Y el «+1» de la punta sólo
  // existe si el cierre TIENE puntas: en un perímetro el último poste es el
  // primero, así que ahí son `claros` y no `claros + 1`.
  const postes   = Math.max(0, claros - esquinas + (e.cerrado ? 0 : 1));
  const out: RenglonMaterial[] = [];

  out.push({
    id: nuevoId('pl'),
    rubro: 'Cierres',
    concepto: `Postes de línea (cada ${sep.maximo_m.toFixed(2)} m como máximo)`,
    cantidad: postes,
    unidad: 'u',
    base: 'unidad',
    calidad: CALIDAD_POSTE[e.material ?? 'madera_tratada'],
    deDonde: `${Math.round(e.largo_m)} m de cierre / ${sep.maximo_m.toFixed(2)} m de separación máxima publicada = ${claros} claros${e.cerrado ? ' (y el cierre vuelve sobre sí mismo, así que son tantos postes como claros)' : ', más el poste de la punta'}, menos las ${esquinas} esquinas, que llevan conjunto arriostrado.`,
    fuente: FUENTE_382,
    margen: null,
    estado: 'necesario',
    advertencia: sep.porque,
  });

  if (sep.varillasPorClaro > 0) {
    out.push({
      id: nuevoId('va'),
      rubro: 'Cierres',
      concepto: 'Varillas (dos por claro)',
      cantidad: claros * sep.varillasPorClaro,
      unidad: 'u',
      base: 'unidad',
      calidad: `Largo igual a la altura del cierre más 50 mm (${(sep.fila.altoHiloSuperior_m + SOBRANTE_VARILLA_M).toFixed(2)} m), colgadas libres del suelo para que el cierre ceda cuando el animal lo toca.`,
      deDonde: `${claros} claros × ${sep.varillasPorClaro} varillas: la columna larga de la tabla exige «2 o más varillas» por claro.`,
      fuente: FUENTE_382,
      margen: null,
      estado: 'necesario',
    });
  }

  if (esquinas > 0) {
    out.push({
      id: nuevoId('ce'),
      rubro: 'Cierres',
      concepto: 'Conjuntos de esquina arriostrados',
      cantidad: esquinas,
      unidad: 'u',
      base: 'unidad',
      calidad: `Postes del conjunto enterrados un mínimo de ${ENTERRADO_ARRIOSTRE_M.toFixed(2)} m (3 pies) salvo que se claven. En arriostre H, travesaño horizontal de 100 mm (4 pulgadas) de diámetro y 1,83 m (6 pies) de largo dentro de cada vertical.`,
      deDonde: `Un conjunto por cambio de dirección del cierre: la fuente define las esquinas como los arriostres «located where there are changes in fence direction due to slope and alignment changes».`,
      fuente: FUENTE_382,
      margen: null,
      estado: 'necesario',
      advertencia: 'Es el renglón que más pesa en un alambrado y el que el presupuesto no tenía. La fuente avisa por qué importa: si un arriostre falla se pierde la tensión del hilo y falla el cierre entero.',
    });
  }

  if (e.hilos != null && e.hilos > 0) {
    out.push({
      id: nuevoId('al'),
      rubro: 'Cierres',
      concepto: `Alambre (${e.hilos} hilos)`,
      cantidad: Math.round(e.largo_m * e.hilos),
      unidad: 'm',
      base: 'suministrado',
      calidad: CALIDAD_ALAMBRE,
      deDonde: `${Math.round(e.largo_m)} m de cierre × ${e.hilos} hilos. Un cierre de ${e.hilos} hilos lleva ${e.hilos} veces su largo en alambre, que es la cuenta que un renglón de «metros de alambrado» esconde.`,
      fuente: FUENTE_382,
      margen: null,
      estado: 'necesario',
    });
  } else {
    out.push({
      id: nuevoId('al'),
      rubro: 'Cierres',
      concepto: 'Alambre',
      cantidad: 0,
      unidad: 'm',
      base: 'suministrado',
      calidad: CALIDAD_ALAMBRE,
      deDonde: 'Falta la cantidad de hilos.',
      fuente: FUENTE_382,
      margen: null,
      estado: 'necesario',
      advertencia: 'La cantidad mínima de hilos está publicada por tipo de cierre en la misma tabla y acequia no la supone. Poné el número de hilos y el renglón sale: son metros de cierre por cantidad de hilos.',
    });
  }

  return out;
}

// ─── 4 · Renglones del movimiento de suelo ────────────────────────────────────

export interface TierraDeclarada {
  compactado_m3: number;
  banco_m3:      number;
  /** El mínimo que tiene que haber disponible: 1,5 × compactado (AH-590). */
  disponibleMinimo_m3: number;
  /** Lo que el proyecto prevé disponible, con su propio factor de contracción. */
  previsto_m3:   number;
  /** true si lo previsto queda por debajo del mínimo publicado. */
  corto:         boolean;
  faltante_m3:   number;
}

/**
 * Los tres volúmenes de tierra de una obra, cada uno en su base de medición.
 *
 * `factorContraccion` es el del proyecto (banco → compactado, 1,15 por defecto en
 * `cutfill.ts`). El mínimo disponible NO sale de ese factor: sale del 1,5 de
 * AH-590, que mide otra cosa. Ver el encabezado del módulo.
 */
export function tierraDeclarada(compactado_m3: number, factorContraccion: number): TierraDeclarada {
  const compactado = Math.max(0, compactado_m3);
  const banco      = compactado * factorContraccion;
  const minimo     = compactado * FACTOR_DISPONIBLE_AH590;
  const corto      = banco < minimo - 1e-9;
  return {
    compactado_m3: Math.round(compactado),
    banco_m3:      Math.round(banco),
    disponibleMinimo_m3: Math.round(minimo),
    previsto_m3:   Math.round(banco),
    corto,
    faltante_m3:   Math.round(Math.max(0, minimo - banco)),
  };
}

/**
 * Los renglones de tierra de un muro, a partir del dimensionamiento real.
 *
 * Pide `ResultadoMuro` y `BalanceTierra` —no el resumen de la represa— porque el
 * volumen de tierra sale de la sección del terraplén y no del agua embalsada. Ver
 * el punto 3 del encabezado.
 */
export function renglonesDeMuro(muro: ResultadoMuro, balance: BalanceTierra): RenglonMaterial[] {
  const pt = muro.partidas;
  const t  = tierraDeclarada(balance.compactado_m3, muro.factorContraccion);
  const out: RenglonMaterial[] = [];

  out.push({
    id: nuevoId('mt'),
    rubro: 'Movimiento de suelo',
    concepto: 'Terraplén compactado (núcleo, espaldones y relleno de la zanja)',
    cantidad: t.compactado_m3,
    unidad: 'm³',
    base: 'compactado_en_obra',
    calidad: 'Colocado en capas delgadas con control de humedad. La humedad se controla con la mano: bien amasado, «the soil will form a ball which does not readily separate and will not extrude out of the hand when squeezed tightly». Muy seco se moja por aspersión; muy mojado se espera.',
    deDonde: 'Sección media del terraplén por el largo del eje, de `cutfill.ts` (`balanceTierra`). NO es el volumen embalsado.',
    fuente: FUENTE_AH590_CANTIDADES,
    margen: null,
    estado: 'necesario',
  });

  out.push({
    id: nuevoId('mb'),
    rubro: 'Movimiento de suelo',
    concepto: 'Excavación de préstamo medida en banco',
    cantidad: t.banco_m3,
    unidad: 'm³',
    base: 'banco_excavado',
    calidad: null,
    deDonde: `${t.compactado_m3} m³ compactados × ${muro.factorContraccion.toFixed(2)} de factor de contracción del proyecto.`,
    fuente: FUENTE_AH590_CANTIDADES,
    margen: { factor: muro.factorContraccion, motivo: 'Contracción del banco al compactarse.', fuente: 'Factor del proyecto (`cutfill.ts`).' },
    estado: 'necesario',
  });

  out.push({
    id: nuevoId('md'),
    rubro: 'Movimiento de suelo',
    concepto: 'Material que tiene que HABER disponible en el préstamo',
    cantidad: t.disponibleMinimo_m3,
    unidad: 'm³',
    base: 'disponible_en_prestamo',
    calidad: null,
    deDonde: `${t.compactado_m3} m³ compactados × ${FACTOR_DISPONIBLE_AH590} del mínimo publicado. El ejemplo resuelto de la fuente va de 8.099 a 12.148 yd³ (${Math.round(8099 * YARDA3_M3).toLocaleString('es-AR')} a ${Math.round(12148 * YARDA3_M3).toLocaleString('es-AR')} m³).`,
    fuente: FUENTE_AH590_CANTIDADES,
    margen: MARGEN_DISPONIBLE,
    estado: 'necesario',
    ...(t.corto
      ? { advertencia: `El proyecto prevé ${t.previsto_m3.toLocaleString('es-AR')} m³ disponibles y el mínimo publicado son ${t.disponibleMinimo_m3.toLocaleString('es-AR')} m³: faltan ${t.faltante_m3.toLocaleString('es-AR')} m³ de material a la vista. No es un error del factor de contracción —ese mide la contracción y está bien—: son dos cosas distintas, y la que decide si la obra se queda sin tierra es esta.` }
      : {}),
  });

  if (pt.destape_m3 > 0) {
    out.push({
      id: nuevoId('mz'),
      rubro: 'Movimiento de suelo',
      concepto: 'Destape de suelo vegetal, acopiado para devolver',
      cantidad: Math.round(pt.destape_m3),
      unidad: 'm³',
      base: 'banco_excavado',
      calidad: 'Se acopia y se devuelve: AH-590 dice «Remove sod, boulders, and topsoil from the entire area over which the embankment is to be placed […] The topsoil should be stockpiled temporarily for later use on the site». No es material de descarte y no va al terraplén.',
      deDonde: 'Huella del muro por el espesor de destape, de `cutfill.ts`.',
      fuente: FUENTE_AH590_CANTIDADES,
      margen: null,
      estado: 'necesario',
    });
  }

  return out;
}

/**
 * Lo que se puede decir del movimiento de suelo cuando lo único que hay es el
 * resumen de la represa.
 *
 * Devuelve un renglón **sin cantidad** y con el motivo escrito, en vez de una
 * cantidad equivocada. La capacidad embalsada no es una estimación mala del
 * volumen de tierra: es otra magnitud, y usarla fue el error que este módulo
 * corrige.
 */
export function renglonDeTierraSinMuro(capacidad_m3: number): RenglonMaterial {
  return {
    id: nuevoId('ms'),
    rubro: 'Movimiento de suelo',
    concepto: 'Terraplén de la represa',
    cantidad: 0,
    unidad: 'm³',
    base: 'compactado_en_obra',
    calidad: null,
    deDonde: 'Sin calcular.',
    fuente: FUENTE_AH590_CANTIDADES,
    margen: null,
    estado: 'necesario',
    advertencia: `Falta el dimensionamiento del muro, así que el volumen de tierra no se puede dar. La capacidad embalsada (${Math.round(capacidad_m3).toLocaleString('es-AR')} m³) NO sirve para esto: es el agua, y la tierra de un muro no guarda ninguna relación fija con ella. Volvé a la pestaña Represa, elegí el lado del muro y la cota, y el renglón sale con los tres volúmenes.`,
  };
}

// ─── 5 · Renglones de la red de agua ──────────────────────────────────────────

/**
 * Los renglones de una traza de cañería, con la clase de presión como calidad.
 *
 * Es el caso donde la app ya tenía la calidad calculada y la lista de materiales
 * no la mostraba: `hidraulica.ts` resuelve la clase PN mínima con el margen de la
 * norma, y eso es exactamente «the required quality of the manufactured
 * materials» del cap. 5 del EFH.
 */
export function renglonesDeRed(red: RedAguaResumen): RenglonMaterial[] {
  const out: RenglonMaterial[] = [{
    id: nuevoId('rc'),
    rubro: 'Agua',
    concepto: `Cañería ${red.material} ${red.diametro}`,
    cantidad: Math.round(red.longitud_m),
    unidad: 'm',
    base: 'suministrado',
    calidad: `Clase de presión PN ${red.pn_recomendado} como mínimo. Sale de la presión estática máxima de la traza con el margen de la norma, que admite trabajar al 72 % de la presión nominal.`,
    deDonde: 'Largo de la traza y clase calculada en la pestaña Red de servicios (`hidraulica.ts`).',
    fuente: FUENTE_EFH5_MATERIALES,
    margen: null,
    estado: 'necesario',
  }];
  if (red.bomba_kw) {
    out.push({
      id: nuevoId('rb'),
      rubro: 'Agua',
      concepto: 'Bomba',
      cantidad: 1,
      unidad: 'u',
      base: 'unidad',
      calidad: `${red.bomba_kw.toFixed(2)} kW eléctricos para el caudal y la carga de la traza.`,
      deDonde: 'Potencia calculada en la pestaña Red de servicios.',
      fuente: null,
      margen: null,
      estado: 'necesario',
    });
  }
  return out;
}

// ─── 6 · La lista de verificación del cap. 5 del EFH ──────────────────────────

/**
 * Quién puede contestar cada punto de la lista.
 *
 * `acequia` cuando el informe lo contesta solo, `parcial` cuando lo contesta a
 * medias, y `persona` cuando no hay forma de que lo conteste un programa.
 */
export type QuienContesta = 'acequia' | 'parcial' | 'persona';

export interface ItemChecklist {
  n:        number;
  pregunta: string;
  quien:    QuienContesta;
  comoSeContesta: string;
}

/**
 * La lista de ocho preguntas con la que el cap. 5 del EFH dice que se revisa un
 * plano antes de entregarlo: «The following list may be useful in checking the
 * adequacy of the drawings and specifications». Está acá porque es la única
 * forma honesta de entregar un paquete de planos: con el criterio publicado con
 * el que hay que juzgarlo, y con los puntos que acequia no puede contestar
 * marcados como lo que son.
 *
 * El punto 7 es el que ningún programa puede contestar, y la fuente también
 * explica por qué: «Before the construction plans are delivered to the
 * cooperator a review of the design and construction plans should be made by a
 * technician other than the one preparing the design.»
 */
export const CHECKLIST_EFH5: readonly ItemChecklist[] = [
  { n: 1, pregunta: '¿Se puede ubicar el predio desde el plano?', quien: 'acequia',
    comoSeContesta: 'El informe trae las coordenadas de cada mojón y el plano con la imagen satelital de fondo.' },
  { n: 2, pregunta: '¿Está claramente marcado el sitio de la obra?', quien: 'parcial',
    comoSeContesta: 'El plano marca lo que se dibujó en el mapa. Lo que se diseñó en una pestaña y no se dibujó, no aparece.' },
  { n: 3, pregunta: '¿Se pueden reponer las líneas del relevamiento y replantear la obra como fue diseñada?', quien: 'parcial',
    comoSeContesta: 'Es para lo que existe la planilla de replanteo: progresivas, mojones de referencia cada 150 m y la altura de cada estación sobre su mojón. Las cotas de terreno las tiene que poner un nivel, porque el modelo de elevación es más grueso que la precisión que pide la norma.' },
  { n: 4, pregunta: '¿Están todas las dimensiones y detalles de construcción?', quien: 'parcial',
    comoSeContesta: 'Las secciones y los mínimos del muro, del vertedero y de las zanjas están calculados. Los detalles de armadura, juntas y piezas prefabricadas, no.' },
  { n: 5, pregunta: '¿Están completas las especificaciones de material y construcción para todas las partes de la obra?', quien: 'parcial',
    comoSeContesta: 'La lista declara la calidad publicada donde acequia la conoce, y marca los renglones que van sin calidad declarada. Esos son los que hay que completar antes de comprar.' },
  { n: 6, pregunta: '¿Están las cantidades de material?', quien: 'acequia',
    comoSeContesta: 'Es esta lista, con la base de medición de cada renglón.' },
  { n: 7, pregunta: '¿Está completa la carátula, con la fecha y quién diseñó, dibujó y aprobó la obra?', quien: 'persona',
    comoSeContesta: 'No hay forma de que lo firme un programa. Y la fuente agrega que la revisión la tiene que hacer alguien distinto del que hizo el diseño.' },
  { n: 8, pregunta: '¿Está hecho el presupuesto?', quien: 'acequia',
    comoSeContesta: 'La pestaña Presupuesto arma el costo sobre estas mismas cantidades; los precios son del lugar y los pone el usuario.' },
];

// ─── 7 · La lista completa ────────────────────────────────────────────────────

export interface ListaDeMateriales {
  renglones:  RenglonMaterial[];
  porRubro:   Array<{ rubro: string; renglones: RenglonMaterial[] }>;
  /** Cuántos renglones van sin calidad declarada. */
  sinCalidad: number;
  checklist:  readonly ItemChecklist[];
  fuentes:    string[];
  advertencias: string[];
}

export interface EntradaLista {
  metricas?: MetricasPoligono | null;
  /** El cierre perimetral: especie y tipo deciden la separación de postes. */
  cierre?:   Omit<EntradaCierre, 'largo_m' | 'esquinas'> | null;
  /** Cantidad de mojones del polígono: cada uno es una esquina. */
  mojones?:  number | null;
  red?:      RedAguaResumen | null;
  muro?:     { muro: ResultadoMuro; balance: BalanceTierra } | null;
  /** Sólo para decir que con esto no se puede dar el volumen de tierra. */
  capacidadRepresa_m3?: number | null;
}

export function armarLista(e: EntradaLista): ListaDeMateriales {
  const renglones: RenglonMaterial[] = [];
  const advertencias: string[] = [];

  if (e.metricas && e.cierre) {
    const rs = renglonesDeCierre({
      ...e.cierre,
      largo_m:  e.metricas.perimetro_m,
      esquinas: Math.max(0, e.mojones ?? 0),
      cerrado:  true,
    });
    if (rs.length === 0) {
      advertencias.push(
        'La combinación de especie y tipo de cierre no está en la tabla publicada, así que la lista no trae postes: una separación de referencia sería inventar el renglón más numeroso del alambrado.',
      );
    }
    renglones.push(...rs);
  }

  if (e.red) renglones.push(...renglonesDeRed(e.red));

  if (e.muro) {
    renglones.push(...renglonesDeMuro(e.muro.muro, e.muro.balance));
  } else if (e.capacidadRepresa_m3 != null && e.capacidadRepresa_m3 > 0) {
    renglones.push(renglonDeTierraSinMuro(e.capacidadRepresa_m3));
    advertencias.push(
      'El volumen de tierra de la represa no está: hace falta el dimensionamiento del muro. La capacidad embalsada no lo reemplaza.',
    );
  }

  const mapa = new Map<string, RenglonMaterial[]>();
  for (const r of renglones) {
    const arr = mapa.get(r.rubro) ?? [];
    arr.push(r);
    mapa.set(r.rubro, arr);
  }

  const sinCalidad = renglones.filter(r => r.calidad == null).length;
  if (sinCalidad > 0) {
    advertencias.push(
      `${sinCalidad} ${sinCalidad === 1 ? 'renglón va' : 'renglones van'} sin calidad declarada. El cap. 5 del EFH pide «the listing of the required quality of the manufactured materials»: ${sinCalidad === 1 ? 'ese renglón' : 'esos renglones'} ${sinCalidad === 1 ? 'tiene' : 'tienen'} cantidad pero no todavía especificación.`,
    );
  }

  return {
    renglones,
    porRubro: [...mapa.entries()].map(([rubro, rs]) => ({ rubro, renglones: rs })),
    sinCalidad,
    checklist: CHECKLIST_EFH5,
    fuentes: [FUENTE_CPS378_BOM, FUENTE_EFH5_MATERIALES, FUENTE_AH590_CANTIDADES, FUENTE_382],
    advertencias,
  };
}
