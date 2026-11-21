/**
 * El cauce empastado y el desagüe de parcela: de la sección que falta a la
 * sección que se excava.
 *
 * ── QUÉ FALTABA ─────────────────────────────────────────────────────────────
 *
 * El camellón ancho con el surco a pendiente (`lib/camellon.ts`) termina, en el
 * diseño publicado, en dos obras: el **desagüe de parcela** que junta los
 * surcos y el **cauce empastado** que saca el agua del lote. Desde el
 * 18/11/2026 acequia decide **por dónde** van —`trazarDesague` y `trazarCauce`
 * siguen el D8 de la cuenca hasta la salida— y declaraba a propósito que no
 * sabía **cuánto miden**. Eso es lo que hay acá.
 *
 * No es un detalle de terminación. Un cauce empastado angosto no se nota el día
 * que se construye: se nota en la primera tormenta que lo recorre, cuando el
 * agua pasa más rápido de lo que el pasto aguanta y el cauce se abre en una
 * cárcava justo por donde se decidió concentrar todo el escurrimiento del lote.
 * Y el aviso que ya emitía el módulo del camellón —«el camellón sin desagüe de
 * parcela y cauce de salida no es una obra de drenaje: es una pileta
 * alargada»— tenía la mitad del problema: la otra mitad es un desagüe que
 * existe y no da el ancho.
 *
 * ── LA FUENTE ───────────────────────────────────────────────────────────────
 *
 * USDA NRCS (2007), *Engineering Field Handbook*, Part 650, capítulo 7
 * «Grassed Waterways» (210–VI–EFH, diciembre de 2007). De ahí sale todo lo que
 * hay en este archivo: los nueve pasos del diseño, el criterio de la tormenta
 * de diseño, la tabla 7–1 de esfuerzo admisible del suelo, la tabla 7–3 de
 * factores de cobertura, las tablas 7–4 y 7–5 de clases de retardancia, las
 * ecuaciones 7–1 a 7–9 y las tablas 7B–2 y 7B–3 de hidráulica y geometría.
 *
 * El capítulo cuenta su propia historia y conviene saberla, porque hay dos
 * métodos publicados y no son el mismo: el de **velocidad admisible**, que sale
 * de la investigación de los años 30 y 40 y se publicó en el SCS Technical
 * Paper 61 (1947, revisado en 1954), y el de **esfuerzo efectivo**, de Temple
 * et al. en el Agriculture Handbook 667 (1987), que es el que el capítulo
 * adopta: *«Research conducted during the 1930s and 1940s documented the
 * benefit of grass as a water conveyance channel liner and provided the basis
 * for engineering design of a stable section based on permissible velocity...
 * These advances led to the documentation of an effective stress approach to
 * grass-lined channel design documented in USDA Agriculture Handbook #667.»*
 *
 * acequia implementa el de esfuerzo efectivo, que es el vigente. La velocidad
 * admisible aparece todavía en muchos manuales de campo y en varios estándares
 * estatales del CPS 412, y da secciones distintas; acá no se usa, y el
 * resultado declara con qué método se calculó para que nadie compare peras con
 * manzanas.
 *
 * ── LOS NUEVE PASOS, Y DÓNDE ESTABA PARADA LA APP ───────────────────────────
 *
 * El capítulo enumera nueve pasos. acequia ya hacía los cinco primeros, cada
 * uno en un módulo distinto, sin que nadie los hubiera encadenado hasta acá:
 *
 *   1. ubicar el eje del cauce ......... `camellon.trazarCauce` (D8)
 *   2. elegir puntos de diseño ......... los quiebres del trazo
 *   3. área de aporte de cada punto .... `cuenca.delimitarCuenca`
 *   4. **caudal pico del evento** ...... `cuenca` + `tormenta` (racional)
 *   5. pendiente de cada tramo ......... del modelo de elevación
 *   6. forma de la sección y tapiz ..... ESTE MÓDULO
 *   7. diseño por estabilidad .......... ESTE MÓDULO
 *   8. profundidad por capacidad ....... ESTE MÓDULO
 *   9. obras de arte para flujo largo .. no está, y se declara
 *
 * La tormenta de diseño no la elige acequia: *«Waterways are constructed to
 * discharge the peak flow expected from at least a 10-year frequency, 24-hour
 * duration storm.»* Es exactamente la lámina que `climaExtremos` ya calcula por
 * Gumbel y que el panel de líneas clave ya recibe, así que la cadena cierra sin
 * pedir un dato nuevo.
 *
 * ── CÓMO SE DISEÑA, EN UNA FRASE ────────────────────────────────────────────
 *
 * Dos criterios, dos tapices y un ancho. El **tapiz más pobre** que se espera
 * (pasto corto, invierno: clase D) es el que decide si el cauce aguanta, porque
 * con pasto corto el `n` es chico, el agua corre rápido y el suelo recibe casi
 * todo el esfuerzo. El **tapiz más denso** (clase B o C) es el que decide la
 * profundidad, porque con pasto alto el agua se frena y sube. Entonces: se
 * busca el ancho mínimo con el que el suelo aguanta con el tapiz pobre, y con
 * ese ancho se calcula la profundidad que hace falta con el tapiz denso.
 *
 * El esfuerzo que llega al suelo no es el total del agua: el pasto se come una
 * parte. Eso es la ecuación 7–1, y es el corazón del método:
 *
 *     τe = γ · D · S · (1 − CF) · (ns / n)²
 *
 * con `CF` el factor de cobertura (0 sin pasto, 1 pasto perfecto), `ns` la
 * rugosidad del grano del suelo y `n` la del cauce con pasto. Un pasto denso
 * sube `n`, y como entra al cuadrado en el denominador, baja mucho el esfuerzo
 * que el suelo ve. Por eso el capítulo insiste en que el mantenimiento es parte
 * del diseño: *«Increasing the allowable stress is not recommended... unless
 * the designer can be certain that the quality of the vegetative cover will
 * always be maintained.»*
 *
 * ── EL CASO RESUELTO ────────────────────────────────────────────────────────
 *
 * La tabla 7–7 del capítulo publica la solución por tanteo del ejemplo 3 con
 * **cuatro columnas** de valores intermedios: área, radio hidráulico, velocidad
 * de continuidad, `n` y velocidad de Manning para cuatro profundidades. El test
 * las reproduce todas. Y las tres entradas de tabla de los ejemplos 1, 2 y 3
 * —B=24 con D=2,4; T=37 con D=1,2; B=35 con D=1,2— quedan también como casos
 * resueltos: la profundidad por capacidad de este módulo las reproduce dentro
 * de 0,03 pies, y la sección publicada pasa el control de estabilidad mientras
 * una un 10 % más angosta no lo pasa.
 *
 * **La tabla 7–7 tiene un error de imprenta** y conviene saberlo antes de
 * sospechar del código: en la columna de D=1,4 pies la velocidad de Manning
 * sale impresa como 2,286 cuando la fila de abajo —la diferencia VM − VT, que
 * vale 0,471 con VT = 2,815— pide 3,286. Es un 3 impreso como 2. El test usa el
 * valor que cierra la aritmética de la propia tabla y lo deja anotado.
 *
 * ── UNIDADES: LA FRONTERA ESTÁ DECLARADA ────────────────────────────────────
 *
 * El capítulo está en pies y libras, y sus constantes **son de ahí**: el peso
 * específico 62,4 lb/ft³, el 1,49 de Manning en unidades inglesas, la
 * rugosidad de grano 0,0156, los cuatro esfuerzos admisibles de la tabla 7–1 y
 * los índices de retardancia. Convertir las constantes una por una es la forma
 * más barata de meter un error que no se nota. Así que acá se calcula **en
 * unidades inglesas** y se convierte en la frontera: la entrada llega en m³/s y
 * por ciento, el resultado sale en metros, m/s y pascales. Las funciones que
 * trabajan en pies lo dicen en el nombre o en el tipo.
 *
 * ── RANGO DE VALIDEZ ────────────────────────────────────────────────────────
 *
 * · Las tablas de diseño del capítulo cubren caudales de 10 a 500 pies³/s
 *   (0,28 a 14,2 m³/s) y pendientes del 0,1 al 10 %. Las ecuaciones no tienen
 *   ese corte, pero afuera de ese rango el resultado no tiene tabla publicada
 *   contra la cual compararse, y el módulo avisa.
 * · El método supone **flujo uniforme** en un tramo de pendiente, caudal, suelo
 *   y tapiz parejos. Donde cambia alguno de los cuatro, el capítulo pide
 *   diseñar por tramos: *«each reach is designed separately»*. acequia dimensiona
 *   el tramo que se le da; partir el trazo en tramos es del usuario.
 * · El esfuerzo admisible del suelo sale de la clasificación textural de la
 *   tabla 7–1. El capítulo ofrece una vía más fina —índice de plasticidad y
 *   relación de vacíos, figuras 7–6 y 7–7— que acequia **no** puede recorrer:
 *   no tiene el índice de plasticidad del perfil. Queda declarado en el aviso.
 * · No contempla tapiz de piedra, hormigón ni bloques perforados, ni el diseño
 *   «a suelo desnudo» que el capítulo permite donde no se puede implantar
 *   pasto. Si el pasto no prende, esta sección no es la que corresponde.
 * · Las dimensiones que salen son las mínimas hidráulicas: *«The dimensions
 *   computed for waterway discharge capacity are the minimal measurements
 *   required to carry the actual flow and do not include a factor for extra
 *   depth required for space occupied by sedimentation or freeboard.»* El
 *   resguardo entra como parámetro y por defecto es cero, igual que en el
 *   capítulo.
 *
 * ── QUIÉN LEE ESTO ──────────────────────────────────────────────────────────
 *
 * El trazado del camellón (`camellon.trazarCamellon`), el panel de líneas clave
 * y la lista de materiales, que cotiza el movimiento de suelo del cauce y la
 * semilla del tapiz. Si cambia una constante de acá cambia un ancho de obra.
 */
import { PIE_M } from './represaDiseno';
import type { AvisoCalculo } from './hidrologiaPredio';
import type { ClaseUSDA } from './textura';
import { escurrimientoSCS, tcConcentracion, type GrupoHidro } from './cuenca';
import { duracionDeDiseno, intensidadDuracion, caudalPicoRacional } from './tormenta';

// ─── 0 · Fuentes ──────────────────────────────────────────────────────────────

export const FUENTE_EFH7 =
  'USDA NRCS (2007), Engineering Field Handbook, Part 650, cap. 7 «Grassed '
  + 'Waterways» (210–VI–EFH, diciembre de 2007).';

export const FUENTE_AH667 =
  'Temple, D.M., Robinson, K.M., Ahring, R.M. y Davis, A.G. (1987), «Stability '
  + 'Design of Grass-Lined Open Channels», USDA Agriculture Handbook 667. Es el '
  + 'método de esfuerzo efectivo que el cap. 7 del EFH adopta.';

export const FUENTE_TP61 =
  'USDA SCS (1954), Technical Paper 61, «Handbook of Channel Design for Soil '
  + 'and Water Conservation». Es el método de velocidad admisible, anterior; se '
  + 'cita para que quede claro que acequia NO lo usa.';

// ─── 1 · Las constantes del capítulo, en sus unidades ─────────────────────────

/** Peso específico del agua, lb/ft³. Cap. 7, ecuación 7–1. */
export const GAMMA_LB_FT3 = 62.4;

/** Coeficiente de Manning en unidades inglesas. Tabla 7B–2: V = (1,49/n)·R^⅔·√S. */
export const KU_MANNING_INGLES = 1.49;

/**
 * Rugosidad de grano de un suelo de grano fino (cohesivo), adimensional.
 *
 * Cap. 7: *«For fine grained materials, including cohesive soils, the soil
 * grain roughness ns is equal to 0.0156.»* Es el caso de cualquier suelo
 * arcilloso o franco, o sea de casi todo cauce de parcela.
 */
export const RUGOSIDAD_GRANO_FINO = 0.0156;

/** 1 lb/ft² en pascales. */
export const LB_FT2_EN_PA = 47.880259;

/** 1 pie³/s en m³/s. */
export const PIE3_S_EN_M3_S = PIE_M ** 3;

/**
 * Período de retorno y duración de la tormenta de diseño.
 *
 * Cap. 7: *«Waterways are constructed to discharge the peak flow expected from
 * at least a 10-year frequency, 24-hour duration storm.»* El «at least» es del
 * capítulo: varios estándares estatales del CPS 412 piden 25 años para algunos
 * usos, y donde haya norma local manda la local.
 */
export const TORMENTA_DISENO_ANIOS = 10;
export const TORMENTA_DISENO_H = 24;

/** Rango de las tablas de diseño publicadas (apéndices C y D), en pie³/s. */
export const CAUDAL_TABLA_MIN_PIE3S = 10;
export const CAUDAL_TABLA_MAX_PIE3S = 500;
export const CAUDAL_TABLA_MIN_M3S = CAUDAL_TABLA_MIN_PIE3S * PIE3_S_EN_M3_S;
export const CAUDAL_TABLA_MAX_M3S = CAUDAL_TABLA_MAX_PIE3S * PIE3_S_EN_M3_S;

/** Rango de pendientes de las tablas de diseño (%). */
export const PENDIENTE_TABLA_MIN_PCT = 0.1;
export const PENDIENTE_TABLA_MAX_PCT = 10;

/**
 * Talud en la orilla más empinado que el capítulo deja pasar sin revisar.
 *
 * Cap. 7, tras la ecuación 7–9: *«If this side slope is steeper than 4:1,
 * modification to the design may be needed, depending on mowing and maintenance
 * requirements.»* No es hidráulica: es si entra la máquina que corta el pasto.
 */
export const TALUD_ORILLA_REVISAR = 4;

/**
 * Pendiente del terreno hasta la cual el capítulo permite que el agua se salga
 * de cauce sin que eso sea una falla (%).
 *
 * *«Out-of-bank flow may be permitted on land slopes parallel to the channel
 * where the slope is not greater than one percent and where it is evident that
 * no erosion or property damage will result.»*
 */
export const PENDIENTE_DESBORDE_TOLERADO_PCT = 1;

// ─── 2 · El suelo: cuánto esfuerzo aguanta ────────────────────────────────────

export type ErodibilidadSuelo = 'facil' | 'erodible' | 'resistente' | 'muy_resistente';

/**
 * Esfuerzo efectivo admisible del suelo, lb/ft². Tabla 7–1.
 *
 * *«The allowable effective stress is the maximum hydraulic stress that may be
 * applied directly to the soil without the occurrence of unacceptable
 * erosion.»*
 */
export const ESFUERZO_ADMISIBLE_LB_FT2: Record<ErodibilidadSuelo, number> = {
  facil:           0.02,
  erodible:        0.03,
  resistente:      0.05,
  muy_resistente:  0.07,
};

export const ERODIBILIDAD_TEXTO: Record<ErodibilidadSuelo, string> = {
  facil:          'se erosiona fácil',
  erodible:       'erosionable',
  resistente:     'resistente a la erosión',
  muy_resistente: 'muy resistente a la erosión',
};

/**
 * De la clase textural USDA a la categoría de erodabilidad del capítulo.
 *
 * La tabla 7–1 tiene cuatro categorías y el capítulo las ancla en **tres**
 * clases texturales: *«easily eroded (sand textural soil classification) ·
 * erodible (silt textural soil classification) · erosion resistant (clay
 * textural soil classification) · very erosion resistant (based on local
 * information or experience) (gravel textural soil classification)»*.
 *
 * Pero el triángulo USDA tiene doce clases y sólo tres se llaman así. Las otras
 * nueve son francos, que el capítulo no nombra. La regla de acequia, escrita
 * para que se pueda discutir: **cada clase va por su separado dominante y los
 * francos caen en la más conservadora de las dos categorías entre las que
 * están.** Un franco arcilloso tiene del 27 al 40 % de arcilla, así que está
 * entre el limo y la arcilla, y se le asigna la del limo (0,03) y no la de la
 * arcilla (0,05): el esfuerzo admisible más chico da un cauce más ancho, y
 * entre equivocarse ancho y equivocarse angosto, un cauce se equivoca ancho.
 *
 * La cuarta categoría —grava, muy resistente— **no se asigna nunca sola**: el
 * propio capítulo la condiciona a información local, y la grava no es una clase
 * de tierra fina del triángulo. Se puede pasar a mano.
 */
export const ERODIBILIDAD_POR_TEXTURA: Record<ClaseUSDA, ErodibilidadSuelo> = {
  'arenoso':                'facil',
  'arenoso-franco':         'facil',
  'franco-arenoso':         'facil',
  'franco':                 'erodible',
  'franco-limoso':          'erodible',
  'limoso':                 'erodible',
  'franco-arcillo-arenoso': 'erodible',
  'franco-arcilloso':       'erodible',
  'franco-arcillo-limoso':  'erodible',
  'arcillo-arenoso':        'resistente',
  'arcillo-limoso':         'resistente',
  'arcilloso':              'resistente',
};

export function erodibilidadDeTextura(c: ClaseUSDA | null): ErodibilidadSuelo | null {
  return c == null ? null : ERODIBILIDAD_POR_TEXTURA[c];
}

/**
 * Rugosidad de grano de un suelo no cohesivo. Ecuación 7–2: ns = d75^(1/6)/39,
 * con d75 en **pulgadas**.
 *
 * Para suelo cohesivo —y para cualquier material de grano fino— el capítulo
 * manda usar `RUGOSIDAD_GRANO_FINO` directamente, sin esta cuenta.
 */
export function rugosidadDeGrano(d75_pulg: number): number {
  if (!(d75_pulg > 0)) return RUGOSIDAD_GRANO_FINO;
  return Math.pow(d75_pulg, 1 / 6) / 39;
}

// ─── 3 · El tapiz: retardancia y factor de cobertura ──────────────────────────

export type ClaseRetardancia = 'A' | 'B' | 'C' | 'D' | 'E';

/** Índice de curva de retardancia por clase. Tabla 7–5. */
export const INDICE_RETARDANCIA: Record<ClaseRetardancia, number> = {
  A: 10.0,
  B: 7.64,
  C: 5.60,
  D: 4.44,
  E: 2.88,
};

/**
 * Qué es cada clase, en una línea. Tabla 7–4, resumida: la clase la fija el
 * **largo** del pasto más que la especie.
 */
export const RETARDANCIA_TEXTO: Record<ClaseRetardancia, string> = {
  A: 'tapiz excelente y muy alto, del orden de 75 a 90 cm',
  B: 'tapiz bueno sin cortar, del orden de 30 a 50 cm',
  C: 'tapiz bueno, del orden de 15 a 20 cm, o más alto con semilla',
  D: 'tapiz bueno cortado, del orden de 5 a 15 cm',
  E: 'cortado a 4 cm, o rastrojo quemado',
};

/**
 * Las dos clases que el capítulo recomienda usar cuando no se midió el pasto.
 *
 * *«In the absence of precise field data regarding the height and stem density
 * vegetation, it is still considered acceptable to design based on retardance
 * classes. In this case, retardance class D is generally used for stability
 * (shortest and sparsest cover) and B or C are used for capacity (longest and
 * densest cover).»*
 */
export const RETARDANCIA_ESTABILIDAD_DEFECTO: ClaseRetardancia = 'D';
export const RETARDANCIA_CAPACIDAD_DEFECTO: ClaseRetardancia = 'C';

export type CalidadTapiz = 'pobre' | 'regular' | 'bueno' | 'muy_bueno' | 'excelente';

export interface CoberturaCauce {
  id:       string;
  nombre:   string;
  /** Factor de cobertura CF, tabla 7–3. */
  cf:       number;
  /** Densidad de tallos de referencia, tallos/ft². Tabla 7–3. */
  tallos_ft2: number;
}

/**
 * Tabla 7–3, «Properties of grass channel linings», para tapiz bueno y
 * uniforme de cada cobertura.
 *
 * El pie de la tabla aclara dos cosas que importan: que la densidad se
 * multiplica por 1/3, 2/3, 1, 4/3 y 5/3 para tapiz pobre, regular, bueno, muy
 * bueno y excelente; y que el factor de cobertura **no** tiene una corrección
 * publicada equivalente, sino un criterio: *«A reasonable, but arbitrary,
 * approach is to reduce the cover factor by 20 percent for fair stands and 50
 * percent for poor stands.»* Acá se guardan los valores de tapiz bueno y la
 * corrección entra como parámetro, declarada como criterio y no como medición.
 *
 * El otro pie de la tabla vale para las dos leguminosas y la alfalfa: *«For the
 * legumes tested, the effective stem count for resistance (given) is
 * approximately five times the actual stem count very close to the bed.»* O
 * sea que la densidad tabulada de la alfalfa y las lespedezas **ya trae** ese
 * factor cinco: no se cuenta a campo, se usa como está.
 */
export const COBERTURAS_CAUCE: readonly CoberturaCauce[] = [
  { id: 'bermuda',   nombre: 'Gramilla (Cynodon dactylon)',        cf: 0.90, tallos_ft2: 500 },
  { id: 'centipede', nombre: 'Eremochloa ophiuroides',             cf: 0.90, tallos_ft2: 500 },
  { id: 'buffalo',   nombre: 'Buchloe dactyloides',                cf: 0.87, tallos_ft2: 400 },
  { id: 'poa',       nombre: 'Poa pratensis',                      cf: 0.87, tallos_ft2: 350 },
  { id: 'grama',     nombre: 'Bouteloua gracilis',                 cf: 0.87, tallos_ft2: 350 },
  { id: 'mezcla',    nombre: 'Mezcla de gramíneas',                cf: 0.75, tallos_ft2: 200 },
  { id: 'lovegrass', nombre: 'Eragrostis curvula',                 cf: 0.50, tallos_ft2: 350 },
  { id: 'bluestem',  nombre: 'Bothriochloa ischaemum',             cf: 0.50, tallos_ft2: 250 },
  { id: 'alfalfa',   nombre: 'Alfalfa (Medicago sativa)',          cf: 0.50, tallos_ft2: 500 },
  { id: 'lespedeza', nombre: 'Lespedeza sericea',                  cf: 0.50, tallos_ft2: 300 },
  { id: 'lespedeza_c', nombre: 'Lespedeza striata',                cf: 0.50, tallos_ft2: 150 },
  { id: 'sudan',     nombre: 'Pasto sudán (Sorghum × drummondii)', cf: 0.50, tallos_ft2:  50 },
] as const;

/** La cobertura de referencia cuando no se eligió ninguna: la mezcla. */
export const COBERTURA_CAUCE_DEFECTO = 'mezcla';

/** Factores publicados en el pie de la tabla 7–3 para el conteo de tallos. */
export const FACTOR_TALLOS: Record<CalidadTapiz, number> = {
  pobre:     1 / 3,
  regular:   2 / 3,
  bueno:     1,
  muy_bueno: 4 / 3,
  excelente: 5 / 3,
};

/**
 * Corrección del factor de cobertura por calidad del tapiz.
 *
 * **Es un criterio, no una medición**, y el capítulo lo dice con todas las
 * letras: *«The equivalent adjustment to CF remains a matter of engineering
 * judgment until more data are obtained... A reasonable, but arbitrary,
 * approach is to reduce the cover factor by 20 percent for fair stands and 50
 * percent for poor stands.»* Por encima de «bueno» no hay corrección publicada,
 * así que no se sube: un tapiz excelente se diseña como uno bueno.
 */
export const FACTOR_CF: Record<CalidadTapiz, number> = {
  pobre:     0.5,
  regular:   0.8,
  bueno:     1,
  muy_bueno: 1,
  excelente: 1,
};

/**
 * Índice de curva de retardancia a partir del pasto medido. Ecuación 7–5:
 *
 *     CI = 2,5 · (h · √M)^(1/3)
 *
 * con `h` el largo representativo del pasto en pies y `M` la densidad de tallos
 * por pie². La forma de la ecuación sale **verificada contra los dos valores
 * que el ejemplo 1 del capítulo publica**: con M = 500 tallos/ft², un pasto de
 * 14 pulgadas da CI = 7,48 y uno de 4 pulgadas da CI = 4,87. Las dos cierran.
 *
 * Se usa sólo si alguien midió el pasto. Sin medición va la clase de
 * retardancia, que es lo que el capítulo autoriza y lo que hace la app.
 */
export function indiceDeCurva(altura_m: number, tallos_m2: number): number | null {
  if (!(altura_m > 0) || !(tallos_m2 > 0)) return null;
  const h_ft = altura_m / PIE_M;
  const M_ft2 = tallos_m2 * PIE_M * PIE_M;
  return 2.5 * Math.pow(h_ft * Math.sqrt(M_ft2), 1 / 3);
}

/**
 * Esfuerzo admisible sobre la vegetación, lb/ft². Ecuación 7–4: τva = 0,75·CI.
 *
 * Verificado contra el ejemplo 1 (CI = 4,87 → 3,65 lb/ft²) y el ejemplo 3
 * (CI = 5,60 → 4,2 lb/ft²).
 */
export function esfuerzoVegetalAdmisible(ci: number): number {
  return 0.75 * ci;
}

// ─── 4 · Hidráulica: el n del pasto y Manning ─────────────────────────────────

/**
 * El `n` de Manning de un cauce empastado. Tabla 7B–2:
 *
 *     n = exp{ CI · [0,0133·ln²(VR) − 0,0954·ln(VR) + 0,297] − 4,16 }
 *
 * `VR` es el producto de la velocidad por el radio hidráulico, en pie²/s, y es
 * la variable que la investigación del SCS encontró que gobierna la resistencia
 * de un tapiz vivo: el pasto se acuesta con el agua, así que el `n` no es una
 * propiedad del cauce sino del cauce **y del flujo que lleva**. Por eso el
 * diseño es iterativo y no una cuenta directa.
 *
 * Reproduce las cuatro columnas de la tabla 7–7 (n = 0,048 / 0,048 / 0,047 /
 * 0,047 para VR de 3,38 a 3,56).
 */
export function manningRetardancia(ci: number, vr_pie2_s: number): number {
  if (!(vr_pie2_s > 0) || !(ci > 0)) return NaN;
  const L = Math.log(vr_pie2_s);
  return Math.exp(ci * (0.0133 * L * L - 0.0954 * L + 0.297) - 4.16);
}

/** Velocidad de Manning en unidades inglesas (pie/s). Tabla 7B–2. */
export function velocidadManning(n: number, radio_pie: number, pendiente_m_m: number): number {
  if (!(n > 0) || !(radio_pie > 0) || !(pendiente_m_m > 0)) return NaN;
  return (KU_MANNING_INGLES / n) * Math.pow(radio_pie, 2 / 3) * Math.sqrt(pendiente_m_m);
}

// ─── 5 · Geometría de la sección (tabla 7B–3) ─────────────────────────────────

export type FormaCauce = 'parabolica' | 'trapezoidal';

/** Área de un trapecio: A = B·D + z·D². */
export function areaTrapecio(base_pie: number, prof_pie: number, z: number): number {
  return base_pie * prof_pie + z * prof_pie * prof_pie;
}

/** Perímetro mojado de un trapecio: P = B + 2·D·√(1+z²). */
export function perimetroTrapecio(base_pie: number, prof_pie: number, z: number): number {
  return base_pie + 2 * prof_pie * Math.sqrt(1 + z * z);
}

/** Ancho superior de un trapecio. Ecuación 7–7: T = B + 2·z·D. */
export function anchoTrapecio(base_pie: number, prof_pie: number, z: number): number {
  return base_pie + 2 * z * prof_pie;
}

/** Área de una parábola: A = ⅔·T·D. Equivale a la forma de la tabla 7B–3. */
export function areaParabola(ancho_pie: number, prof_pie: number): number {
  return (2 / 3) * ancho_pie * prof_pie;
}

/** Coeficiente parabólico. Ecuación 7–8: ap = 4·D/T². */
export function coefParabolico(ancho_pie: number, prof_pie: number): number {
  if (!(ancho_pie > 0)) return NaN;
  return (4 * prof_pie) / (ancho_pie * ancho_pie);
}

/** Ancho superior para una profundidad dada. Ecuación 7–8 invertida. */
export function anchoParabola(prof_pie: number, ap: number): number {
  if (!(ap > 0) || !(prof_pie > 0)) return NaN;
  return Math.sqrt((4 * prof_pie) / ap);
}

/**
 * Talud en la orilla de una parábola. Ecuación 7–9: z = 1/(ap·T).
 *
 * Es adimensional, así que da lo mismo en pies o en metros siempre que `ap` y
 * `T` estén en el mismo sistema. Verificado contra el ejemplo 2: con T = 37
 * pies y ap = 0,0035 da 7,7, y con el resguardo puesto (T = 44,1) da 6,5.
 */
export function taludParabola(ancho_pie: number, ap: number): number {
  if (!(ap > 0) || !(ancho_pie > 0)) return NaN;
  return 1 / (ap * ancho_pie);
}

/**
 * Perímetro mojado de una parábola, exacto.
 *
 * Es el largo de arco de `y = ap·x²` entre −T/2 y T/2, que sale de integrar
 * √(1+4·ap²·x²) y usar que 4·ap²·x₀² = 4·ap·D:
 *
 *     P = (T/2)·√(1+4·ap·D) + (1/(2·ap))·ln(√(4·ap·D) + √(1+4·ap·D))
 *
 * La tabla 7B–3 publica esta misma expresión. El control es el límite: cuando
 * la parábola se achata, P tiende a T y el radio hidráulico a ⅔·D, que es la
 * aproximación clásica. Para la sección del ejemplo 2 —T = 37 pies, D = 1,2—
 * da R = 0,7978 contra ⅔·D = 0,8000.
 */
export function perimetroParabola(ancho_pie: number, prof_pie: number): number {
  const ap = coefParabolico(ancho_pie, prof_pie);
  if (!(ap > 0)) return NaN;
  const u = 4 * ap * prof_pie;
  const r = Math.sqrt(1 + u);
  return (ancho_pie / 2) * r + (1 / (2 * ap)) * Math.log(Math.sqrt(u) + r);
}

interface SeccionGeom { area: number; radio: number; anchoSup: number; }

function geometria(
  forma: FormaCauce, ancho_pie: number, prof_pie: number, z: number,
): SeccionGeom {
  if (forma === 'trapezoidal') {
    const area = areaTrapecio(ancho_pie, prof_pie, z);
    const per = perimetroTrapecio(ancho_pie, prof_pie, z);
    return { area, radio: per > 0 ? area / per : NaN, anchoSup: anchoTrapecio(ancho_pie, prof_pie, z) };
  }
  const area = areaParabola(ancho_pie, prof_pie);
  const per = perimetroParabola(ancho_pie, prof_pie);
  return { area, radio: per > 0 ? area / per : NaN, anchoSup: ancho_pie };
}

/**
 * Profundidad normal (pie): la que hace que el caudal que el cauce transporta
 * sea el de diseño.
 *
 * Es el tanteo del ejemplo 3 del capítulo —*«compute area (A), hydraulic radius
 * (R), trial velocity (VT), and n. Then use Manning's formula to check
 * velocity. If the velocity computed with Manning's (VM) is higher, deduct 0.1
 * foot from the depth and repeat»*— resuelto por bisección en vez de a pasos de
 * 0,1 pie: la misma ecuación, sin el redondeo del paso.
 */
export function profundidadNormal(
  caudal_pie3s: number,
  pendiente_m_m: number,
  ci: number,
  forma: FormaCauce,
  ancho_pie: number,
  z = 4,
): number | null {
  if (!(caudal_pie3s > 0) || !(pendiente_m_m > 0) || !(ancho_pie > 0)) return null;
  let lo = 0.001;
  let hi = 30;
  const transporta = (D: number): number => {
    const g = geometria(forma, ancho_pie, D, z);
    if (!(g.area > 0) || !(g.radio > 0)) return 0;
    const n = manningRetardancia(ci, (caudal_pie3s / g.area) * g.radio);
    if (!Number.isFinite(n) || n <= 0) return 0;
    return g.area * velocidadManning(n, g.radio, pendiente_m_m);
  };
  if (transporta(hi) < caudal_pie3s) return null;   // no entra ni con 30 pies
  for (let k = 0; k < 120; k++) {
    const D = 0.5 * (lo + hi);
    if (transporta(D) > caudal_pie3s) hi = D; else lo = D;
  }
  return 0.5 * (lo + hi);
}

// ─── 6 · El caudal de diseño ──────────────────────────────────────────────────

export interface CaudalDiseno {
  caudal_m3s:       number;
  area_ha:          number;
  cn:               number;
  lluvia_mm:        number;
  escurrimiento_mm: number;
  coef_evento:      number;
  tc_min:           number;
  duracion_min:     number;
  intensidad_mm_h:  number;
}

/**
 * El caudal pico del evento de diseño para un área de aporte.
 *
 * No hay hidrología nueva acá: es la composición de lo que acequia ya tenía
 * —`escurrimientoSCS` para la fracción que escurre, `tcConcentracion` para el
 * tiempo de concentración de Kirpich ajustado, `duracionDeDiseno` e
 * `intensidadDuracion` para la ráfaga que produce el pico y
 * `caudalPicoRacional` para el pico— encadenada con la tormenta que el cap. 7
 * pide: la de 10 años y 24 h.
 *
 * El método racional vale en cuencas chicas, hasta unas 200 ha, que es también
 * el dominio donde Kirpich está calibrado. Un cauce de parcela está muy abajo de
 * eso; lo que sube de ahí ya no es un cauce empastado de lote.
 */
export function caudalDeDiseno(p: {
  area_ha: number;
  /** Largo del recorrido del agua hasta la salida (m). */
  largoFlujo_m: number;
  /** Pendiente de ese recorrido (m/m). */
  pendienteFlujo_m_m: number;
  /** Lámina de la tormenta de 10 años y 24 h (mm). */
  lluvia10a24h_mm: number;
  cn: number;
  coberturaId?: string | null;
}): CaudalDiseno | null {
  const { area_ha, largoFlujo_m, pendienteFlujo_m_m, lluvia10a24h_mm, cn } = p;
  if (!(area_ha > 0) || !(lluvia10a24h_mm > 0) || !(cn > 0)) return null;
  if (!(largoFlujo_m > 0) || !(pendienteFlujo_m_m > 0)) return null;

  const esc = escurrimientoSCS(lluvia10a24h_mm, cn);
  const coef = esc / lluvia10a24h_mm;
  const tc = tcConcentracion(largoFlujo_m, pendienteFlujo_m_m, p.coberturaId ?? null);
  const dur = duracionDeDiseno(tc.tc_min);
  const i = intensidadDuracion(lluvia10a24h_mm, dur);
  const q = caudalPicoRacional(coef, i, area_ha / 100);
  if (!(q > 0)) return null;

  return {
    caudal_m3s:       Math.round(q * 1000) / 1000,
    area_ha:          Math.round(area_ha * 100) / 100,
    cn,
    lluvia_mm:        Math.round(lluvia10a24h_mm * 10) / 10,
    escurrimiento_mm: Math.round(esc * 10) / 10,
    coef_evento:      Math.round(coef * 100) / 100,
    tc_min:           Math.round(tc.tc_min * 10) / 10,
    duracion_min:     dur,
    intensidad_mm_h:  Math.round(i),
  };
}

/** CN de pastura en buen estado por grupo hidrológico. Tabla 9–1 del NEH 630. */
export const CN_PASTURA: Record<GrupoHidro, number> = { A: 39, B: 61, C: 74, D: 80 };

// ─── 7 · El diseño de la sección ──────────────────────────────────────────────

export interface EntradaCauce {
  caudal_m3s:    number;
  pendiente_pct: number;
  forma?:        FormaCauce;
  /** Talud de la sección trapezoidal (z:1). Sin efecto en la parabólica. */
  talud_z?:      number;
  erodibilidad:  ErodibilidadSuelo;
  /** d75 en mm, sólo para suelo no cohesivo. Sin esto va el grano fino. */
  d75_mm?:       number | null;
  coberturaId?:  string;
  calidadTapiz?: CalidadTapiz;
  retardanciaCapacidad?:  ClaseRetardancia;
  retardanciaEstabilidad?: ClaseRetardancia;
  /** Resguardo sobre la profundidad de capacidad (m). Por defecto 0, como el cap. */
  resguardo_m?:  number;
}

export interface SeccionCauce {
  forma:              FormaCauce;
  /** Ancho superior a la profundidad de capacidad (m). */
  ancho_m:            number;
  /** Ancho superior con el resguardo incluido (m). */
  anchoTotal_m:       number;
  /** Base, en la trapezoidal; `null` en la parabólica. */
  base_m:             number | null;
  profundidad_m:      number;
  profundidadTotal_m: number;
  /** Profundidad con el tapiz pobre: la que gobierna la estabilidad. */
  profundidadPobre_m: number;
  area_m2:            number;
  velocidad_ms:       number;
  /** Sección transversal de excavación, m² (área hasta la profundidad total). */
  areaExcavacion_m2:  number;
  n_capacidad:        number;
  n_estabilidad:      number;
  esfuerzoEfectivo_pa:  number;
  esfuerzoAdmisible_pa: number;
  esfuerzoTotal_pa:     number;
  esfuerzoVegetalAdmisible_pa: number;
  /** Talud en la orilla; en la parabólica sale de la ecuación 7–9. */
  taludOrilla:        number;
  coefParabolico:     number | null;
  cf:                 number;
  ci_capacidad:       number;
  ci_estabilidad:     number;
  /** Las dos condiciones del método, cada una por separado. */
  sueloAguanta:       boolean;
  pastoAguanta:       boolean;
  /**
   * El tapiz con el que se diseñó esta sección, y las dos clases de
   * retardancia que la decidieron.
   *
   * Va en el resultado porque es **parte de la obra, no del cálculo**: la
   * sección sale de suponer un pasto, y el capítulo se niega a admitir un
   * esfuerzo mayor «unless the designer can be certain that the quality of the
   * vegetative cover will always be maintained». El renglón de semilla de la
   * lista de materiales sale de acá.
   */
  cobertura:          { id: string; nombre: string };
  calidadTapiz:       CalidadTapiz;
  /** La clase densa, que decidió la profundidad. */
  claseCapacidad:     ClaseRetardancia;
  /** La clase pobre, que decidió el ancho. */
  claseEstabilidad:   ClaseRetardancia;
  avisos:             AvisoCalculo[];
  fuentes:            string[];
}

const r2 = (x: number): number => Math.round(x * 100) / 100;
const r4 = (x: number): number => Math.round(x * 10000) / 10000;

/**
 * La sección de un cauce empastado: el ancho mínimo que el suelo aguanta y la
 * profundidad que el caudal necesita.
 *
 * El orden es el del capítulo (pasos 7 y 8): primero el ancho, buscado con el
 * **tapiz pobre** hasta que el esfuerzo efectivo sobre el suelo baja del
 * admisible; después la profundidad, calculada con el **tapiz denso**, que es el
 * que frena el agua y la hace subir.
 *
 * Que el ancho lo decida el tapiz pobre y no el denso no es una elección de
 * acequia: es lo que dice el paso 7, y la razón está en la ecuación 7–1. Con
 * pasto corto el `n` baja, y como el esfuerzo que llega al suelo va con
 * (ns/n)², bajar el `n` lo sube al cuadrado. El cauce se rompe en invierno, no
 * en verano.
 *
 * Devuelve `null` si no hay caudal, pendiente o datos suficientes.
 */
export function dimensionarCauce(e: EntradaCauce): SeccionCauce | null {
  const forma = e.forma ?? 'parabolica';
  const z = e.talud_z ?? TALUD_ORILLA_REVISAR;
  const S = e.pendiente_pct / 100;
  const Q = e.caudal_m3s / PIE3_S_EN_M3_S;
  if (!(Q > 0) || !(S > 0)) return null;

  const calidad = e.calidadTapiz ?? 'bueno';
  const cob = COBERTURAS_CAUCE.find(c => c.id === (e.coberturaId ?? COBERTURA_CAUCE_DEFECTO))
    ?? COBERTURAS_CAUCE.find(c => c.id === COBERTURA_CAUCE_DEFECTO)!;
  const cf = Math.min(1, Math.max(0, cob.cf * FACTOR_CF[calidad]));

  const ciCap = INDICE_RETARDANCIA[e.retardanciaCapacidad ?? RETARDANCIA_CAPACIDAD_DEFECTO];
  const ciEst = INDICE_RETARDANCIA[e.retardanciaEstabilidad ?? RETARDANCIA_ESTABILIDAD_DEFECTO];
  const ns = e.d75_mm != null && e.d75_mm > 0
    ? rugosidadDeGrano(e.d75_mm / 25.4)
    : RUGOSIDAD_GRANO_FINO;
  const tauAdm = ESFUERZO_ADMISIBLE_LB_FT2[e.erodibilidad];
  const tauVegAdm = esfuerzoVegetalAdmisible(ciEst);

  /** Estado de la sección con el tapiz pobre, para un ancho dado. */
  const conTapizPobre = (W: number) => {
    const D = profundidadNormal(Q, S, ciEst, forma, W, z);
    if (D == null) return null;
    const g = geometria(forma, W, D, z);
    const n = manningRetardancia(ciEst, (Q / g.area) * g.radio);
    const tau = GAMMA_LB_FT3 * D * S;
    const tauEf = tau * (1 - cf) * (ns / n) ** 2;          // ecuación 7–1
    return { D, n, tau, tauEf, ...g };
  };

  /**
   * El esfuerzo total que ve la vegetación, a la profundidad de CAPACIDAD.
   *
   * Es la que elige el ejemplo 1 del capítulo, y es la mezcla incómoda a
   * propósito: la profundidad del tapiz denso contra el esfuerzo que aguanta el
   * tapiz pobre. Del lado seguro, porque la profundidad de capacidad es la más
   * honda y el pasto pobre el que menos aguanta.
   */
  const esfuerzoTotalEnCapacidad = (W: number): number | null => {
    const D = profundidadNormal(Q, S, ciCap, forma, W, z);
    return D == null ? null : GAMMA_LB_FT3 * D * S;        // ecuación 7–6
  };

  // El ancho mínimo que cumple las dos condiciones de estabilidad. Más ancho es
  // más chato, y más chato es menos esfuerzo, así que la condición es monótona
  // y la bisección es legítima.
  const LIMITE_PIE = 1500;
  const cumple = (W: number): boolean => {
    const s = conTapizPobre(W);
    const tauCap = esfuerzoTotalEnCapacidad(W);
    return s != null && tauCap != null && s.tauEf <= tauAdm && tauCap <= tauVegAdm;
  };
  let lo = 0.1;
  let hi = 2;
  while (hi < LIMITE_PIE && !cumple(hi)) hi *= 2;
  if (!cumple(hi)) return null;
  for (let k = 0; k < 80; k++) {
    const W = 0.5 * (lo + hi);
    if (cumple(W)) hi = W; else lo = W;
  }
  const W = hi;

  const pobre = conTapizPobre(W);
  const Dcap = profundidadNormal(Q, S, ciCap, forma, W, z);
  if (pobre == null || Dcap == null) return null;

  const gc = geometria(forma, W, Dcap, z);
  const nCap = manningRetardancia(ciCap, (Q / gc.area) * gc.radio);
  const resguardo_pie = (e.resguardo_m ?? 0) / PIE_M;
  const Dtot = Dcap + resguardo_pie;

  const ap = forma === 'parabolica' ? coefParabolico(W, Dcap) : null;
  const anchoTot = forma === 'parabolica' && ap != null
    ? anchoParabola(Dtot, ap)
    : anchoTrapecio(W, Dtot, z);
  const talud = forma === 'parabolica' && ap != null
    ? taludParabola(anchoTot, ap)
    : z;
  const gTot = forma === 'parabolica'
    ? geometria(forma, anchoTot, Dtot, z)
    : geometria(forma, W, Dtot, z);

  const sec: SeccionCauce = {
    forma,
    ancho_m:            r2(gc.anchoSup * PIE_M),
    anchoTotal_m:       r2(anchoTot * PIE_M),
    base_m:             forma === 'trapezoidal' ? r2(W * PIE_M) : null,
    profundidad_m:      r2(Dcap * PIE_M),
    profundidadTotal_m: r2(Dtot * PIE_M),
    profundidadPobre_m: r2(pobre.D * PIE_M),
    area_m2:            r2(gc.area * PIE_M * PIE_M),
    velocidad_ms:       r2((Q / gc.area) * PIE_M),
    areaExcavacion_m2:  r2(gTot.area * PIE_M * PIE_M),
    n_capacidad:        r4(nCap),
    n_estabilidad:      r4(pobre.n),
    esfuerzoEfectivo_pa:  r2(pobre.tauEf * LB_FT2_EN_PA),
    esfuerzoAdmisible_pa: r2(tauAdm * LB_FT2_EN_PA),
    esfuerzoTotal_pa:     r2(GAMMA_LB_FT3 * Dcap * S * LB_FT2_EN_PA),
    esfuerzoVegetalAdmisible_pa: r2(tauVegAdm * LB_FT2_EN_PA),
    taludOrilla:        r2(talud),
    // `ap` tiene unidades de 1/longitud: con D = ap·x², pasar de pies a metros
    // lo DIVIDE por el factor, no lo multiplica. Un signo al revés acá dibuja
    // una parábola diez veces más abierta y no se nota en ningún otro número.
    coefParabolico:     ap == null ? null : r4(ap / PIE_M),
    cf:                 r2(cf),
    ci_capacidad:       ciCap,
    ci_estabilidad:     ciEst,
    sueloAguanta:       pobre.tauEf <= tauAdm,
    pastoAguanta:       GAMMA_LB_FT3 * Dcap * S <= tauVegAdm,
    cobertura:          { id: cob.id, nombre: cob.nombre },
    calidadTapiz:       calidad,
    claseCapacidad:     e.retardanciaCapacidad ?? RETARDANCIA_CAPACIDAD_DEFECTO,
    claseEstabilidad:   e.retardanciaEstabilidad ?? RETARDANCIA_ESTABILIDAD_DEFECTO,
    avisos:             [],
    fuentes:            [FUENTE_EFH7, FUENTE_AH667],
  };
  sec.avisos = avisosCauce(e, sec);
  return sec;
}

/**
 * Los avisos de la sección: dónde el método quedó afuera de su rango y qué
 * decisión de obra cambia por eso.
 */
export function avisosCauce(e: EntradaCauce, s: SeccionCauce): AvisoCalculo[] {
  const avisos: AvisoCalculo[] = [];

  if (e.caudal_m3s < CAUDAL_TABLA_MIN_M3S || e.caudal_m3s > CAUDAL_TABLA_MAX_M3S) {
    avisos.push({
      id: 'cauce_fuera_de_tabla',
      nivel: 'aviso',
      titulo: 'El caudal queda afuera de las tablas publicadas',
      detalle:
        `Las tablas de diseño del capítulo cubren de ${CAUDAL_TABLA_MIN_M3S.toFixed(2)} a `
        + `${CAUDAL_TABLA_MAX_M3S.toFixed(1)} m³/s y acá el pico es de `
        + `${e.caudal_m3s.toFixed(3)} m³/s. Las ecuaciones no tienen ese corte y la sección `
        + 'está calculada con ellas, pero afuera de ese rango no hay una tabla impresa '
        + 'contra la cual contrastar el resultado. Para un cauce de parcela el caudal '
        + 'suele caer por abajo, que es el lado bueno: la sección sale chica y la gobierna '
        + 'el ancho mínimo de la máquina que la va a mantener, no la hidráulica.',
    });
  }

  if (e.pendiente_pct < PENDIENTE_TABLA_MIN_PCT || e.pendiente_pct > PENDIENTE_TABLA_MAX_PCT) {
    avisos.push({
      id: 'cauce_pendiente_fuera_de_rango',
      nivel: e.pendiente_pct > PENDIENTE_TABLA_MAX_PCT ? 'alerta' : 'aviso',
      titulo: `La pendiente del cauce (${e.pendiente_pct.toFixed(1)} %) está afuera del rango publicado`,
      detalle:
        `Las tablas del capítulo van del ${PENDIENTE_TABLA_MIN_PCT} al `
        + `${PENDIENTE_TABLA_MAX_PCT} %. Arriba del ${PENDIENTE_TABLA_MAX_PCT} % un cauce `
        + 'empastado deja de ser la obra que corresponde: el capítulo contempla tapiz de '
        + 'piedra, hormigón o bloques perforados, y eso es otro cálculo. Abajo del '
        + `${PENDIENTE_TABLA_MIN_PCT} % el problema es el inverso y es el mismo del surco `
        + 'del camellón: el agua no se va, se queda.',
    });
  }

  if (!s.sueloAguanta) {
    avisos.push({
      id: 'cauce_suelo_no_aguanta',
      nivel: 'alerta',
      titulo: 'Ni ensanchando el cauce el suelo aguanta el esfuerzo',
      detalle:
        'El esfuerzo efectivo que llega al suelo con el tapiz pobre sigue arriba del '
        + `admisible (${s.esfuerzoEfectivo_pa} contra ${s.esfuerzoAdmisible_pa} Pa). `
        + 'Ensanchar no alcanza: hay que bajar la pendiente del cauce con saltos, mejorar '
        + 'el tapiz —el factor de cobertura entra en la ecuación— o cambiar de tapiz a '
        + 'piedra u hormigón, que es otro cálculo. Un cauce así se abre en cárcava justo '
        + 'por donde se concentró todo el escurrimiento del lote.',
    });
  }

  if (!s.pastoAguanta) {
    avisos.push({
      id: 'cauce_pasto_no_aguanta',
      nivel: 'alerta',
      titulo: 'El esfuerzo arranca el pasto antes de mover el suelo',
      detalle:
        `El esfuerzo total del agua (${s.esfuerzoTotal_pa} Pa) pasa el que la vegetación `
        + `aguanta (${s.esfuerzoVegetalAdmisible_pa} Pa). Es el caso que el capítulo llama `
        + 'poco frecuente —en la mayoría de los suelos el grano se mueve antes de que el '
        + 'pasto se dañe— y pasa en suelos muy resistentes. La consecuencia es la misma: '
        + 'una vez que el tapiz se abre en un punto, se deshilacha rápido.',
    });
  }

  if (s.taludOrilla < TALUD_ORILLA_REVISAR) {
    avisos.push({
      id: 'cauce_talud_empinado',
      nivel: 'aviso',
      titulo: `El talud en la orilla queda en ${s.taludOrilla}:1`,
      detalle:
        `El capítulo pide revisar el diseño cuando la orilla queda más empinada que `
        + `${TALUD_ORILLA_REVISAR}:1, y no por hidráulica: por el corte del pasto. Un cauce `
        + 'que no se puede cortar con la máquina que hay no mantiene el tapiz, y sin tapiz '
        + 'el cálculo de estabilidad no vale. Conviene ensanchar y achatar la sección.',
    });
  }

  if ((e.resguardo_m ?? 0) === 0) {
    avisos.push({
      id: 'cauce_sin_resguardo',
      nivel: 'aviso',
      titulo: 'La sección es la mínima hidráulica: no trae resguardo ni espacio para sedimento',
      detalle:
        'El capítulo lo dice así: las dimensiones calculadas son las mínimas para pasar el '
        + 'caudal y «no incluyen un factor por la profundidad extra que ocupa la '
        + 'sedimentación o el resguardo». Donde la norma local pida resguardo, se suma. Y '
        + 'hay una razón de obra para sumarlo igual: la profundidad tiene que alcanzar para '
        + 'que el surco del camellón descargue sin ahogarse en la boca.',
    });
  }

  avisos.push({
    id: 'cauce_tormenta_de_diseno',
    nivel: 'ok',
    titulo: `Dimensionado contra la tormenta de ${TORMENTA_DISENO_ANIOS} años y ${TORMENTA_DISENO_H} h`,
    detalle:
      'Es el criterio del capítulo: el cauce se construye para el pico de «al menos» una '
      + `tormenta de ${TORMENTA_DISENO_ANIOS} años de recurrencia y ${TORMENTA_DISENO_H} h `
      + 'de duración. El «al menos» es del capítulo: varios estándares estatales piden 25 '
      + 'años para algunos usos, y donde haya norma local manda la local.',
  });

  if (e.d75_mm == null) {
    avisos.push({
      id: 'cauce_suelo_por_textura',
      nivel: 'aviso',
      titulo: 'El esfuerzo admisible del suelo sale de la textura, no del ensayo',
      detalle:
        'Está tomado de la tabla 7–1, que reparte los suelos en cuatro categorías por '
        + 'clase textural. El capítulo ofrece una vía más fina —índice de plasticidad y '
        + 'relación de vacíos, con dos figuras y una corrección— que acequia no puede '
        + 'recorrer porque no tiene el índice de plasticidad del perfil. Si hay un ensayo '
        + 'de laboratorio del suelo del cauce, ese número manda sobre este.',
    });
  }

  return avisos;
}
