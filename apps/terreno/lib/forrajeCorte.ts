/**
 * La compuerta entre el corte de pasto del usuario y el modelo de Wight y Hanks.
 *
 * ## Por qué existe este archivo
 *
 * `Yp` —el rendimiento potencial del sitio, el factor que convierte la fracción
 * `T/Tp` en kilos— **no sale de ninguna tabla**. El relevamiento cerró en falso
 * y está documentado en `ESD_NO_ES_YP`: la mejor candidata, la columna `High` de
 * las fichas ecológicas del NRCS, lee 1,6 a 2,0 veces alto porque responde otra
 * pregunta. La única vía que cierra es la que ofrece el propio trabajo,
 * `Yp = Y · Tp/T`, verificada contra la Tabla 1 a 0,02 % — ver
 * `YP_DESPEJADO_SIDNEY`. Y esa vía necesita un `Y`: **un corte de pasto en el
 * predio del usuario.**
 *
 * Eso convierte el problema de bibliográfico en problema de interfaz, y la
 * interfaz es donde el número se puede arruinar. Porque `Y` no es «cuánto pasto
 * cosechaste»: es una magnitud estrecha y precisa —**materia en pie herbácea,
 * cortada a nivel del suelo, una sola vez, al llegar las gramíneas principales a
 * madurez, pesada seca en estufa**— y cualquier otra cosecha, medida con
 * cuidado y anotada de buena fe, devuelve un `Yp` equivocado por un factor.
 *
 * Este archivo es el cerco. Recibe lo que una persona que cortó pasto **sí
 * puede contestar** y devuelve una de dos cosas: una cosecha que el despeje
 * puede usar, con cada degradación nombrada y con la dirección del error, o un
 * rechazo que dice qué medir en su lugar. Nunca convierte: no hay factor
 * publicado para pasar de una magnitud a la otra, y aplicar uno inventado es
 * exactamente cómo acequia imprime un número plausible y equivocado.
 *
 * ## Los tres errores que importan, con su magnitud medida
 *
 * No son hipótesis. Las tres están medidas en `forrajeMedido.ts`:
 *
 * | lo que el usuario informaría | qué pasa | medido en |
 * |---|---|---|
 * | **un corte de una temporada de varios** | es un tercio de la temporada | `UN_CORTE_NO_ES_LA_TEMPORADA` |
 * | **la suma de todos los cortes** | 1,33 a 1,42 veces el pico de materia en pie | `LA_SUMA_NO_ES_EL_PICO` |
 * | **sólo las especies forrajeras** | el total herbáceo es 1,56 veces eso | `TOTAL_CONTRA_FORRAJERA` |
 *
 * Y una cuarta que **no es un error y hay que decirla igual**: el corte es pico
 * de materia en pie y eso es el 25 a 35 % de la producción anual. No se corrige
 * —la cadena de abajo pide materia en pie— pero el campo del panel se llama «por
 * año», así que la pantalla lo aclara. Ver `EL_PICO_NO_ES_LA_PRODUCCION_ANUAL`.
 *
 * Y el peor de todos no tiene factor porque no es una magnitud comparable:
 * **peso verde**. Un pasto con 70 % de humedad pesa 3,3 veces su materia seca, y
 * la humedad del corte depende del día y de la hora. Se rechaza, y el rechazo
 * dice cómo arreglarlo: secar una muestra y pesarla.
 *
 * ## Lo que apareció al medir la cadena completa, y que no se esperaba
 *
 * Dos cosas, las dos con números y las dos incomodas:
 *
 * 1. **La sustitución de `Eo` por la ETo de referencia no se cancela.** El
 *    argumento de que `Yp = Y·Tp/T` es un cociente y por lo tanto inmune a la
 *    escala de `Eo` es falso donde el modelo trabaja: con el agua limitando, el
 *    `Yp` sigue a `Eo` casi uno a uno, y la cancelación aparece recién cuando el
 *    índice llega a 1, o sea en los años en que el modelo no hace falta. Ver
 *    `ETO_NO_ES_EO`.
 * 2. **El agua inicial del perfil no se puede simular en la temporada seca.**
 *    Calentar el perfil con la lluvia real de los meses previos cierra la banda
 *    del `Yp` a 1,00× en una temporada húmeda y la deja en 2,82× después de 270
 *    días en una seca, porque en régimen seco las capas profundas no se
 *    recargan. Ver `EL_AGUA_INICIAL_NO_SE_OLVIDA`.
 *
 * Y una tercera que decide una ruta: **la serie dekadal que el cliente ya tiene
 * no alcanza** —la ecuación 6 cuenta días desde que la superficie se mojó, y las
 * dos formas de repartir un total de diez días mueven el índice un 12 % para
 * arriba o un 18 % para abajo. Ver `LA_SERIE_DEKADAL_NO_ALCANZA`.
 *
 * ## Unidades
 *
 * `rendimiento_kg_ha` en **kg de materia seca por hectárea**. Las conversiones
 * desde las unidades con que se mide en el campo —gramos de un aro, libras por
 * acre— son `kgHaDeAro`, `gM2AKgHa` y `lbAcreAKgHa`. Agua en mm, espesores en
 * cm, tiempo en días.
 *
 * ## Rango de validez
 *
 * El del modelo que alimenta: pradera mixta templada, los supuestos de
 * `forrajeBalance.ts`. Este archivo no lo amplía — avisa cuando el corte viene
 * de algo que no es pastizal natural, porque ahí el `b` y el `c` por defecto del
 * balance son extrapolación y el `T/Tp` que se usa para despejar ya está sesgado
 * antes de que entre el kilo.
 *
 * ## Qué se rompe si cambia
 *
 * Lo lee el bloque de corte del panel de Pastoreo, que es el que ofrece el
 * número para el campo «Forraje (kg MS/ha·año)». Hoy ese campo arranca con la
 * escalera de cinco escalones sin fuente de `prodForrajera`; este archivo es la
 * vía para reemplazarla **en el predio donde alguien cortó**. En el predio donde
 * nadie cortó nunca la escalera sigue, y sigue sin fuente.
 */
import {
  despejarYp, gM2AKgHa,
  type CosechaDeTemporada, type Insumos, type YpDespejado,
} from './forrajeMedido';
import {
  correrBalanceForraje,
  type CapaDeSuelo, type DiaDeBalance, type EntradasBalanceForraje,
} from './forrajeBalance';
import {
  eoJensenHaiseMm,
  AVISO_EO_JENSEN_HAISE,
  type CoeficientesEo,
} from './eoJensenHaise';

// ─── Lo que está medido, y que es el argumento de cada rechazo ───────────────

/**
 * Un corte no es la temporada, y la diferencia es un factor de tres.
 *
 * Son las **dos únicas mediciones de `forrajeMedido.ts` que publican el reparto
 * corte por corte**, y las dos dicen lo mismo con una coincidencia que sorprende:
 *
 * ```
 * avena,   4 cortes:  1.994 · 1.329 · 1.254 · 1.964   total 6.541
 * alfalfa, 5 cortes:  3.561 · 3.149 · 3.162 · 3.983 · 6.027   total 19.882
 * ```
 *
 * En las dos, **el corte más grande de la temporada es el 30 % del total**:
 * 1.994/6.541 = 0,305 y 6.027/19.882 = 0,303. Dicho al revés, la suma es 3,3
 * veces cualquier corte suelto.
 *
 * Por eso informar «corté 1.900 kg/ha» de una pastura que se cortó cuatro veces
 * no es un número un poco bajo: es un tercio, y el `Yp` que sale de ahí
 * dimensiona un rodeo tres veces más chico que el que el campo aguanta.
 *
 * **Dónde deja de valer:** las dos son forrajeras sembradas con insumos —la
 * avena fertilizada con 115 kg N/ha, la alfalfa bajo 1.300 mm de riego— y no
 * pastizal natural. No sirven para corregir nada, y acá no corrigen nada: son
 * la medida de cuánto importa **preguntar** cuántas veces se cortó, que es para
 * lo único que se usan.
 */
export const UN_CORTE_NO_ES_LA_TEMPORADA = {
  avena_marcos_juarez: {
    sitio: 'Avena de catorce cultivares, EEA INTA Marcos Juárez',
    cortes: 4,
    reparto_kg_ha: [1994, 1329, 1254, 1964],
    total_kg_ha: 6541,
    mayor_sobre_total: 0.3049,
  },
  alfalfa_curaco: {
    sitio: 'Alfalfa de diez cultivares bajo riego, Curacó, 25 de Mayo, La Pampa',
    cortes: 5,
    reparto_kg_ha: [3561, 3149, 3162, 3983, 6027],
    total_kg_ha: 19882,
    mayor_sobre_total: 0.3031,
  },
  /** Lo que las dos dicen junto: un corte suelto ronda el 30 % de la temporada. */
  mayor_sobre_total: { minimo: 0.303, maximo: 0.305 },
  donde_deja_de_valer:
    'Las dos son forrajeras sembradas con insumos, no pastizal natural. Miden cuánto '
    + 'importa preguntar cuántos cortes hubo; no corrigen ningún número.',
} as const;

/**
 * La suma de los cortes tampoco es el pico de materia en pie.
 *
 * Rawlik y Jagodziński calcularon la producción anual del sotobosque de un
 * robledal-carpinal **con seis algoritmos sobre las mismas cosechas**, dos
 * temporadas. De los seis, el método 1 es el pico de materia en pie —lo que
 * midieron Wight y Hanks— y el método 2 es la suma de los incrementos positivos
 * entre cosechas, que es lo más parecido a sumar los cortes de una temporada:
 *
 * ```
 * método 1 · máximo de biomasa en pie       37,8   41,0   g MS/m²
 * método 2 · suma de incrementos positivos  50,2   58,3
 * método 6 · biomasa × densidad, al máximo  74,3   94,0
 * ```
 *
 * `m2/m1` da **1,33 y 1,42**; `m6/m1`, **1,97 y 2,29**. El algoritmo mueve el
 * resultado más que el año, y el pico —que es el más usado porque es el más
 * barato— subestima la producción anual alrededor de la mitad.
 *
 * Lo que importa acá es la dirección: una suma de cortes metida donde el modelo
 * espera el pico **sobreestima `Y`**, y entonces `Yp = Y·Tp/T` sale alto. Alto
 * es el lado optimista, que para dimensionar una carga animal es el caro.
 *
 * **Dónde deja de valer:** es el sotobosque de un bosque templado de Polonia,
 * no un pastizal abierto. Por eso el número no se usa para convertir: se usa
 * para rechazar la suma y decir por qué.
 */
export const LA_SUMA_NO_ES_EL_PICO = {
  metodo_1_pico: [37.8, 41.0],
  metodo_2_suma_de_incrementos: [50.2, 58.3],
  metodo_6_el_mas_alto: [74.3, 94.0],
  suma_sobre_pico: [1.328, 1.422],
  mayor_sobre_pico: [1.966, 2.293],
  unidad: 'g MS/m²/año',
  fuente:
    'Rawlik y Jagodziński, «Herbaceous Layer Net Primary Production of Oak-Hornbeam '
    + 'Forest: Comparing Six Methods of Assessment Based on the Seasonal Dynamics of '
    + 'Biomass Increments», Ecosystems 24 (2021) 337-349 — doi 10.1007/s10021-021-00658-0',
  donde_deja_de_valer:
    'Sotobosque de robledal-carpinal templado, no pastizal abierto. Mide la dirección '
    + 'y el orden de magnitud del error, no un factor de corrección.',
} as const;

/**
 * Cortar sólo las forrajeras deja afuera un 36 % del pastizal.
 *
 * El Delta del Paraná es el único sitio del catálogo donde las dos cifras salen
 * de la **misma cosecha**: 10.533 kg/ha de materia seca herbácea total y 6.733
 * de forrajera. El cociente es **1,56**, y lo que se lleva la diferencia son el
 * abrojo grande y las demás no forrajeras de un pastizal degradado.
 *
 * Wight y Hanks cortaron materia en pie **herbácea**, a nivel del suelo, sin
 * separar especies. Así que un corte donde el usuario dejó en pie lo que el
 * animal no come informa un `Y` bajo, y el `Yp` sale bajo — el lado conservador,
 * que es el barato, pero igual equivocado.
 */
export const TOTAL_CONTRA_FORRAJERA = {
  sitio: 'Pastizal de albardón, Delta Medio del Paraná',
  herbacea_total_kg_ha: 10533,
  forrajera_kg_ha: 6733,
  cociente: 1.564,
} as const;

/**
 * El pico de materia en pie **no** es la producción anual — y por qué igual no se
 * corrige.
 *
 * Es la confusión más fácil de cometer y la que más cuesta, porque el campo del
 * panel donde este número termina se llama «Forraje (kg MS/ha·año)» y el corte
 * es **un momento de una temporada**. La diferencia está publicada:
 *
 * > «peak yields amount to only 25-35 % of annual aboveground production
 * > measured throughout the growing season»
 *
 * O sea que la materia en pie en el pico es alrededor de un tercio de lo que la
 * planta produjo en la temporada: el resto ya murió, se cayó o se lo comieron
 * antes de que nadie pudiera cortarlo.
 *
 * ## Y sin embargo el número no se multiplica por tres
 *
 * Porque la cadena que viene después **pide materia en pie, no producción**. El
 * coeficiente de uso admisible de `bandaUso` está calibrado contra `CARGA_CGREC`,
 * un ensayo de diecisiete años cuyos tratamientos están definidos por **el
 * forraje que dejan en pie** y cuya columna de producción es materia en pie al
 * final de la temporada. Corregir el corte hacia arriba metería en la cuenta de
 * la carga animal el pasto que se descompuso antes de que el animal llegara:
 * forraje que nunca existió para la vaca.
 *
 * Lo mismo del otro lado: `Y` en la ecuación 1 de Wight y Hanks es el
 * rendimiento **medido** del ensayo, que es pico de materia en pie herbácea. El
 * despeje se validó contra esa magnitud a 0,02 %. Meterle producción anual
 * devolvería un `Yp` tres veces grande.
 *
 * **Lo único que hay que hacer, entonces, es decirlo.** El usuario no tiene por
 * qué saber que «por año» en una etiqueta y «materia en pie» en una definición no
 * son lo mismo, y es la clase de diferencia que nadie descubre después.
 */
export const EL_PICO_NO_ES_LA_PRODUCCION_ANUAL = {
  cita: 'peak yields amount to only 25-35 % of annual aboveground production measured throughout the growing season',
  fraccion: { minima: 0.25, maxima: 0.35 },
  fuente: 'Campbell, B. (ed.) — «The Miombo in Transition: Woodlands and Welfare in Africa», CIFOR (1996), capítulo 2',
  por_que_no_se_corrige:
    'La cadena de abajo pide materia en pie: el coeficiente de uso admisible de bandaUso está '
    + 'calibrado contra un ensayo cuyos tratamientos se definen por el forraje que dejan en pie. '
    + 'Multiplicar por tres sumaría a la carga animal el pasto que se descompuso antes de que el '
    + 'animal llegara.',
  y_del_otro_lado:
    'La Y de la ecuación 1 también es pico de materia en pie herbácea, y el despeje se validó '
    + 'contra esa magnitud a 0,02 %. Pasarle producción anual devolvería un Yp tres veces grande.',
  que_hay_que_hacer: 'decirlo en pantalla, porque la etiqueta del campo dice «por año»',
} as const;

/**
 * El peso verde no es una magnitud comparable, y por eso no se convierte.
 *
 * La materia seca de un pasto cortado depende de la especie, del estado
 * fenológico, de la hora y de si llovió. No hay un factor: hay un rango tan
 * ancho que cualquier punto elegido adentro es una invención. Lo que sí hay es
 * una salida barata y exacta, que es lo que dice el rechazo: pesar una muestra
 * verde, secarla y volver a pesarla.
 *
 * El número que sigue no es un factor de conversión y no se usa como tal: es
 * sólo la escala del problema, para que el mensaje pueda decir cuánto se juega.
 */
export const EL_PESO_VERDE_NO_SE_CONVIERTE = {
  por_que:
    'La fracción de materia seca de un pasto cortado va de alrededor de un quinto a '
    + 'cerca de la mitad según la especie, el estado y la hora del corte, y no hay un '
    + 'factor publicado para el pastizal de un predio cualquiera.',
  que_medir:
    'Pesá una muestra verde, secala —estufa a 60-65 °C hasta peso constante, o al sol '
    + 'bajo techo hasta que deje de bajar— y volvé a pesarla. La fracción seca de esa '
    + 'muestra aplicada al corte entero da los kilos de materia seca.',
} as const;

// ─── Las unidades del campo ──────────────────────────────────────────────────

/**
 * Lo que se pesa en el campo: los gramos secos de un aro, a kg MS/ha.
 *
 * `area_m2` es la superficie del aro o del marco. Un aro de 0,25 m² —50 × 50 cm,
 * el más común— con 60 g secos adentro da 2.400 kg/ha.
 *
 * Devuelve `null` con área cero o negativa, o con gramos negativos: ahí no hay
 * densidad, y un cero diría «no hay pasto» cuando lo que no hay es medición.
 */
export function kgHaDeAro(gramos_secos: number, area_m2: number): number | null {
  if (!Number.isFinite(gramos_secos) || !Number.isFinite(area_m2)) return null;
  if (area_m2 <= 0 || gramos_secos < 0) return null;
  return gM2AKgHa(gramos_secos / area_m2);
}

/**
 * El promedio de varios aros, que es como se mide de verdad.
 *
 * Un aro solo de un pastizal no dice nada: la variabilidad espacial de la
 * materia en pie es grande y por eso todas las mediciones del catálogo usan
 * repeticiones —tres clausuras en el Delta, 250 subparcelas en Manitou—. Esta
 * función promedia las densidades, no los gramos, para que aros de distinto
 * tamaño pesen lo que les toca por superficie.
 *
 * Devuelve también el desvío, que es lo que le dice al usuario si vale la pena
 * cortar otro aro. Ignora los aros inválidos y los cuenta en `descartados`.
 */
export function kgHaDeVariosAros(
  aros: readonly { gramos_secos: number; area_m2: number }[],
): { kg_ha: number; desvio_kg_ha: number; aros: number; descartados: number } | null {
  const valores = aros
    .map(a => kgHaDeAro(a.gramos_secos, a.area_m2))
    .filter((v): v is number => v !== null);
  if (valores.length === 0) return null;
  const media = valores.reduce((s, v) => s + v, 0) / valores.length;
  const varianza = valores.reduce((s, v) => s + (v - media) ** 2, 0) / valores.length;
  return {
    kg_ha: media,
    desvio_kg_ha: Math.sqrt(varianza),
    aros: valores.length,
    descartados: aros.length - valores.length,
  };
}

// ─── Lo que el usuario declara ───────────────────────────────────────────────

/** Cuándo se cortó, contra lo que midió el trabajo. */
export type CuandoSeCorto =
  /** Al llegar las gramíneas principales a madurez. Es lo que midió el trabajo. */
  | 'madurez_de_las_gramineas'
  /** Antes de que el pastizal terminara de crecer. */
  | 'antes_del_pico'
  /** Con el pastizal ya seco, después de que empezó a perder material. */
  | 'despues_de_la_senescencia'
  | 'no_se';

/** Qué se levantó del suelo. El trabajo cortó todo lo herbáceo. */
export type QueSeCorto = 'todo_lo_herbaceo' | 'solo_las_forrajeras' | 'incluye_lenosas';

/** En qué base está el peso. El trabajo pesó seco en estufa. */
export type BaseDePeso = 'estufa' | 'aire_seco' | 'verde';

/** Qué había en el paño cortado. El trabajo midió pradera mixta nativa. */
export type QueHabia = 'pastizal_natural' | 'pastura_sembrada' | 'verdeo_anual';

/** Si el número informado es un corte o la suma de la temporada. */
export type QueInforma =
  | { es: 'un_corte'; orden: number }
  | { es: 'la_suma_de_la_temporada' };

/**
 * Un corte declarado por el usuario, con todo lo que hace falta para saber si
 * es la magnitud que el modelo necesita.
 *
 * Son nueve campos y ninguno es opcional, a propósito: cada uno que faltara se
 * tendría que asumir, y los cinco supuestos razonables —cortó al pico, cortó
 * una vez, cortó todo, pesó seco, no fertilizó— son justamente los que un
 * productor rompe sin que sea raro.
 */
export interface CorteDeclarado {
  /** Materia seca en pie, en kg/ha. De `kgHaDeAro` o de la báscula de un rollo. */
  rendimiento_kg_ha: number;
  cuando: CuandoSeCorto;
  /** Cuántas veces se cortó **ese paño** en la temporada, contando éste. */
  cortes_en_la_temporada: number;
  informa: QueInforma;
  que_se_corto: QueSeCorto;
  peso: BaseDePeso;
  /** Altura del remanente, en cm. 0 es a nivel del suelo, como el trabajo. */
  remanente_cm: number;
  que_habia: QueHabia;
  insumos: Insumos;
}

// ─── El veredicto ────────────────────────────────────────────────────────────

/** Para qué lado empuja al `Yp` una degradación. */
export type Direccion = 'alto' | 'bajo' | 'desconocido';

export interface AvisoDeCorte {
  aviso: string;
  /** Hacia dónde empuja al `Yp` esta degradación. */
  sesgo: Direccion;
}

export type CodigoDeRechazo =
  | 'rendimiento_no_valido'
  | 'cortes_inconsistentes'
  | 'peso_verde'
  | 'suma_de_varios_cortes'
  | 'corte_de_rebrote'
  | 'antes_del_pico'
  | 'momento_desconocido'
  | 'incluye_lenosas'
  | 'riego_fuera_del_balance'
  | 'insumos_desconocidos';

export interface MotivoDeRechazo {
  motivo: CodigoDeRechazo;
  por_que: string;
  /** Qué hacer para que el corte sirva. Siempre algo concreto. */
  que_medir: string;
}

/** El sesgo neto de todo lo que quedó advertido. */
export type SesgoNeto = 'ninguno' | 'alto' | 'bajo' | 'ambos' | 'desconocido';

export type CorteEvaluado =
  | {
      sirve: true;
      rendimiento_kg_ha: number;
      base: 'pico_de_materia_en_pie_herbacea';
      avisos: AvisoDeCorte[];
      sesgo: SesgoNeto;
    }
  | { sirve: false; rechazos: MotivoDeRechazo[] };

/**
 * Decide si un corte declarado es la magnitud que el despeje de `Yp` necesita.
 *
 * Devuelve **todos** los motivos de rechazo, no el primero: un corte verde de
 * una pastura regada cortada cuatro veces tiene tres problemas distintos y el
 * usuario merece verlos juntos en vez de uno por intento.
 *
 * Cuando sirve, devuelve el rendimiento junto con la unión de un solo valor que
 * `CosechaDeTemporada` exige, para que el llamador no pueda escribir ese literal
 * a mano sin haber pasado por acá.
 */
export function evaluarCorte(c: CorteDeclarado): CorteEvaluado {
  const rechazos: MotivoDeRechazo[] = [];
  const avisos: AvisoDeCorte[] = [];

  if (!Number.isFinite(c.rendimiento_kg_ha) || c.rendimiento_kg_ha <= 0) {
    rechazos.push({
      motivo: 'rendimiento_no_valido',
      por_que: 'El rendimiento tiene que ser un número mayor que cero.',
      que_medir: 'Los kilos de materia seca por hectárea del corte. Si pesaste aros, usá kgHaDeAro.',
    });
  }

  const cortes = c.cortes_en_la_temporada;
  const ordenValido = c.informa.es !== 'un_corte'
    || (Number.isInteger(c.informa.orden) && c.informa.orden >= 1 && c.informa.orden <= cortes);
  if (!Number.isInteger(cortes) || cortes < 1 || !ordenValido) {
    rechazos.push({
      motivo: 'cortes_inconsistentes',
      por_que:
        'Los cortes de la temporada tienen que ser un entero de 1 para arriba, y el corte '
        + 'informado tiene que ser uno de ellos.',
      que_medir: 'Cuántas veces se cortó ese paño en la temporada, y cuál de esos cortes es el que estás informando.',
    });
  }

  if (c.peso === 'verde') {
    rechazos.push({
      motivo: 'peso_verde',
      por_que: EL_PESO_VERDE_NO_SE_CONVIERTE.por_que,
      que_medir: EL_PESO_VERDE_NO_SE_CONVIERTE.que_medir,
    });
  } else if (c.peso === 'aire_seco') {
    avisos.push({
      aviso:
        'El peso es seco al aire y el modelo midió seco en estufa: el corte todavía tiene '
        + 'la humedad que el aire no sacó, así que informa más kilos de los que hay y el Yp '
        + 'sale ALTO. acequia no aplica ningún factor porque no hay uno publicado para el '
        + 'pastizal de un predio cualquiera; la diferencia es chica frente al error del modelo, '
        + 'pero es de un solo lado.',
      sesgo: 'alto',
    });
  }

  // El pico de materia en pie es el de un paño que no se cortó antes en la
  // misma temporada. Cualquier corte previo se llevó biomasa, así que lo que
  // quedó es rebrote y no el pico.
  if (c.informa.es === 'la_suma_de_la_temporada' && cortes > 1) {
    rechazos.push({
      motivo: 'suma_de_varios_cortes',
      por_que:
        `Una suma de ${cortes} cortes no es el pico de materia en pie: cuenta el rebrote que `
        + 'volvió a crecer después de cada corte. Medido sobre las mismas cosechas, la suma de '
        + `incrementos da ${LA_SUMA_NO_ES_EL_PICO.suma_sobre_pico[0]} a `
        + `${LA_SUMA_NO_ES_EL_PICO.suma_sobre_pico[1]} veces el pico, así que el Yp saldría alto.`,
      que_medir:
        'Un paño que se corte una sola vez en la temporada, al llegar las gramíneas principales '
        + 'a madurez. Alcanza con dejar sin cortar unos metros cuadrados —una jaula de exclusión, '
        + 'o un rincón alambrado— y cortar ahí ese único día.',
    });
  }
  if (c.informa.es === 'un_corte' && c.informa.orden > 1) {
    rechazos.push({
      motivo: 'corte_de_rebrote',
      por_que:
        `Es el corte número ${c.informa.orden} de la temporada: lo que se cortó es el rebrote de `
        + 'un paño al que ya se le había sacado la biomasa, no el pico de materia en pie. En las '
        + 'dos mediciones del catálogo que publican el reparto corte por corte, el corte más '
        + 'grande de la temporada fue el 30 % del total.',
      que_medir:
        'El primer corte de la temporada de un paño que no se había cortado, hecho al llegar las '
        + 'gramíneas principales a madurez.',
    });
  }

  if (c.cuando === 'antes_del_pico') {
    rechazos.push({
      motivo: 'antes_del_pico',
      por_que:
        'El pastizal todavía estaba creciendo, así que el corte no mide el pico de materia en pie '
        + 'sino un punto cualquiera de la curva. Cuánto falta depende de cuándo se cortó y no se '
        + 'puede acotar: el Yp saldría bajo por un factor que nadie puede nombrar.',
      que_medir:
        'Esperar a que las gramíneas principales lleguen a madurez —espiga y grano formándose, el '
        + 'pastizal dejando de verdear— y cortar ahí.',
    });
  }
  if (c.cuando === 'no_se') {
    rechazos.push({
      motivo: 'momento_desconocido',
      por_que:
        'Sin saber cuándo se cortó no hay forma de saber si el número es el pico de materia en pie, '
        + 'y los dos errores posibles van para lados distintos.',
      que_medir:
        'La fecha del corte, y en qué estaba el pastizal ese día: creciendo todavía, en madurez de '
        + 'las gramíneas, o ya seco.',
    });
  }
  if (c.cuando === 'despues_de_la_senescencia') {
    avisos.push({
      aviso:
        'Se cortó con el pastizal ya seco, y a esa altura del año el canopeo pierde más material '
        + 'del que genera —medido en el Delta del Paraná, donde la tasa de crecimiento se vuelve '
        + 'negativa en otoño—. Parte del pico ya se cayó, así que el corte informa menos kilos de '
        + 'los que hubo y el Yp sale BAJO.',
      sesgo: 'bajo',
    });
  }

  if (c.que_se_corto === 'incluye_lenosas') {
    rechazos.push({
      motivo: 'incluye_lenosas',
      por_que:
        'El modelo mide materia en pie herbácea. Con ramas y hojas de arbustos adentro el número '
        + 'es de otra magnitud, y el aporte leñoso de un arbustal puede ser varias veces el herbáceo.',
      que_medir:
        'Sólo lo herbáceo: pastos, graminoides y hierbas de hoja ancha. Lo leñoso se saca del aro '
        + 'antes de pesar.',
    });
  }
  if (c.que_se_corto === 'solo_las_forrajeras') {
    avisos.push({
      aviso:
        'Se cortaron sólo las especies que el animal come, y el modelo cortó todo lo herbáceo. En el '
        + `Delta del Paraná, el único sitio del catálogo donde las dos cifras salen de la misma `
        + `cosecha, el total herbáceo es ${TOTAL_CONTRA_FORRAJERA.cociente} veces la forrajera. El `
        + 'corte informa menos de lo que el modelo espera y el Yp sale BAJO. El uso admisible lo '
        + 'descuenta después bandaUso, así que acá no hay que descontar nada.',
      sesgo: 'bajo',
    });
  }

  if (c.remanente_cm > 0) {
    avisos.push({
      aviso:
        `Quedaron ${c.remanente_cm} cm en pie y el modelo cortó a nivel del suelo: esos centímetros `
        + 'son materia que el corte no pesó, así que el Yp sale BAJO. No se corrige porque no hay '
        + 'una relación publicada entre altura de remanente y masa para el pastizal de un predio '
        + 'cualquiera, y un Yp bajo es el lado conservador.',
      sesgo: 'bajo',
    });
  }

  if (c.insumos === 'riego' || c.insumos === 'riego_y_fertilizado') {
    rechazos.push({
      motivo: 'riego_fuera_del_balance',
      por_que:
        'El paño recibió riego, y el balance diario sólo conoce la lluvia: el agua que puso el riego '
        + 'nunca entra al perfil, así que T sale bajo, el índice T/Tp sale bajo y el Yp = Y·Tp/T sale '
        + 'ALTO. No es un matiz: la alfalfa de Curacó recibió 1.300 mm de riego en una temporada, más '
        + 'que la lluvia anual de cualquier sitio de secano del catálogo.',
      que_medir:
        'O un paño de secano, o la lámina de cada riego con su fecha, para sumarla a la lluvia diaria '
        + 'del balance.',
    });
  }
  if (c.insumos === 'desconocido') {
    rechazos.push({
      motivo: 'insumos_desconocidos',
      por_que:
        'Un Yp de un paño fertilizado y un Yp de un paño de secano son dos números distintos, y sin '
        + 'saber cuál es no se puede decir a qué potrero se parece el resultado. Un sitio sin insumos '
        + 'declarados y un sitio declarado sin insumos no son lo mismo.',
      que_medir: 'Si ese paño recibió fertilizante o riego en la temporada que se midió.',
    });
  }
  if (c.insumos === 'fertilizado') {
    avisos.push({
      aviso:
        'El paño estaba fertilizado. El Yp del modelo incluye la fertilidad del sitio, así que el '
        + 'número que sale es legítimo pero describe ese paño CON esa fertilización: no se puede '
        + 'trasladar a un potrero que no se fertiliza, y ahí el forraje saldría alto.',
      sesgo: 'desconocido',
    });
  }

  if (c.que_habia !== 'pastizal_natural') {
    const que = c.que_habia === 'pastura_sembrada' ? 'una pastura sembrada' : 'un verdeo anual';
    avisos.push({
      aviso:
        `Lo que se cortó fue ${que}, y el modelo se calibró en pradera mixta nativa. El Yp incluye la `
        + 'composición de especies, así que eso no es problema; lo que sí lo es: el b del dosel y el '
        + 'umbral c del balance son los de pradera nativa, y con otra cobertura el T/Tp por el que se '
        + 'divide ya está extrapolado antes de que entre el kilo. La dirección del error no se puede '
        + 'nombrar sin una curva de dosel de esa pastura.',
      sesgo: 'desconocido',
    });
  }

  if (rechazos.length > 0) return { sirve: false, rechazos };

  return {
    sirve: true,
    rendimiento_kg_ha: c.rendimiento_kg_ha,
    base: 'pico_de_materia_en_pie_herbacea',
    avisos,
    sesgo: sesgoNeto(avisos),
  };
}

/** El sesgo neto de una lista de avisos. */
export function sesgoNeto(avisos: readonly AvisoDeCorte[]): SesgoNeto {
  if (avisos.length === 0) return 'ninguno';
  const alto = avisos.some(a => a.sesgo === 'alto');
  const bajo = avisos.some(a => a.sesgo === 'bajo');
  if (alto && bajo) return 'ambos';
  if (alto) return 'alto';
  if (bajo) return 'bajo';
  return 'desconocido';
}

// ─── Del perfil de suelo a las tres capas del modelo ─────────────────────────

/** Una capa del perfil, como la devuelve `suelos.ts`. */
export interface CapaDePerfil {
  prof_top: number;
  prof_bot: number;
  awc_mm: number;
}

/** Los 90 cm del modelo, en tres capas de 30. */
export const PERFIL_DEL_MODELO = { espesor_cm: 30, capas: 3, profundidad_cm: 90 } as const;

/**
 * Reparte el agua útil de un perfil real en las tres capas de 30 cm del modelo.
 *
 * El trabajo usó tres capas de 30 cm **para poder comparar contra mediciones
 * neutrónicas hechas a esos incrementos**, y dice explícitamente que las capas
 * se pueden asignar por horizonte o por distribución de raíces cuando hay dato.
 * Acá hay dato: SoilGrids entrega seis capas de espesor desigual (0-5, 5-15,
 * 15-30, 30-60, 60-100, 100-200 cm), así que el agua útil de cada una se reparte
 * **por superposición de profundidad** a las tres del modelo.
 *
 * El reparto es proporcional al espesor que se superpone, lo que supone que el
 * agua útil está distribuida uniformemente dentro de cada capa del perfil. Es el
 * mismo supuesto con el que SoilGrids publica un valor por capa, no uno
 * adicional.
 *
 * Devuelve `null` si el perfil no llega a los 90 cm o si alguna de las tres
 * capas queda sin agua útil: con una capa en cero el balance no tiene cociente
 * de humedad y `correrBalanceForraje` devuelve `null` de todos modos. Es mejor
 * decirlo acá, donde se puede nombrar el suelo, que allá.
 */
export function aguaUtilEnTresCapas(
  perfil: readonly CapaDePerfil[],
): readonly [number, number, number] | null {
  if (perfil.length === 0) return null;
  const fondo = perfil.reduce((m, c) => Math.max(m, c.prof_bot), 0);
  if (fondo < PERFIL_DEL_MODELO.profundidad_cm) return null;

  const tramos: [number, number][] = [[0, 30], [30, 60], [60, 90]];
  const salida = tramos.map(([desde, hasta]) => {
    let acum = 0;
    for (const c of perfil) {
      const espesor = c.prof_bot - c.prof_top;
      if (espesor <= 0 || !Number.isFinite(c.awc_mm)) continue;
      const solape = Math.min(c.prof_bot, hasta) - Math.max(c.prof_top, desde);
      if (solape <= 0) continue;
      acum += c.awc_mm * (solape / espesor);
    }
    return acum;
  });

  const [a, b, d] = salida;
  if (a === undefined || b === undefined || d === undefined) return null;
  if (a <= 0 || b <= 0 || d <= 0) return null;
  return [a, b, d];
}

/** Arma las tres capas con una fracción de llenado inicial. */
export function capasDe90(
  aw_por_capa_mm: readonly number[],
  fraccion_inicial: number,
  agua_bajo_el_limite_mm?: number,
): CapaDeSuelo[] {
  const f = Math.max(0, Math.min(1, fraccion_inicial));
  return aw_por_capa_mm.map((aw, i) => ({
    espesor_cm: PERFIL_DEL_MODELO.espesor_cm,
    aw_mm: aw,
    sws_inicial_mm: aw * f,
    ...(i === 0 && agua_bajo_el_limite_mm !== undefined ? { agua_bajo_el_limite_mm } : {}),
  }));
}

// ─── De la serie diaria a los días del balance ───────────────────────────────

/**
 * Lo que hay que declarar al usar la ETo de referencia como la `Eo` del modelo.
 *
 * **Esto ya no es el camino principal, y queda como respaldo declarado.** Desde
 * que se leyó Jensen-Haise (1963), la `Eo` se calcula con el método del trabajo
 * en `lib/eoJensenHaise.ts`, y esta sustitución corre solamente cuando la serie
 * no trae radiación y temperaturas o cuando no se pudieron sacar los
 * coeficientes del punto. Lo de abajo es por qué no alcanza.
 *
 * El modelo pide `Eo`, que Wight y Hanks calcularon por Jensen-Haise (1963). La
 * serie diaria de acequia trae `et0_fao_evapotranspiration` de Open-Meteo, que
 * es la **ETo de referencia de FAO-56**: pasto de 0,12 m, albedo 0,23,
 * resistencia 70 s/m. No son la misma magnitud ni el mismo método, y acequia
 * **no aplica ningún factor**: no porque no se pueda medir —se midió, da 1,166
 * en Sidney— sino porque un factor de un sitio no viaja. Lo que viaja es el
 * método.
 *
 * ## Cuánto cuesta, medido contra la Tabla 1
 *
 * El `b = 0,435` se despejó de `Tp/(Kc·Eo)` con la `Eo` **del trabajo**, así que
 * aplicarlo con otra `Eo` rompe la derivación. Con la ETo de FAO-56 de ERA5, el
 * `b` publicado **infla la `Tp` publicada un 16,5 % de media y hasta un 35,6 %**;
 * con la `Eo` de Jensen-Haise de la misma serie, un 1,3 %. Está en
 * `LAS_DOS_MITADES_DEL_ERROR_DE_LA_EO`.
 *
 * ## Y la sustitución no se cancela, que es lo contrario de lo que parecía
 *
 * El argumento tentador es que `Yp = Y·Tp/T` es un cociente, así que una `Eo`
 * escalada escalaría `Tp` y `T` juntas y se iría del resultado. **Se midió y es
 * falso donde el modelo trabaja.** Con el agua limitando —una temporada de 90
 * días con 120 mm, que es el régimen de la pradera mixta donde esto se
 * calibró— escalar la `Eo` mueve el `Yp` casi uno a uno:
 *
 * ```
 * Eo × 0,70  →  Yp × 0,758        elasticidad 0,78
 * Eo × 0,85  →  Yp × 0,854        elasticidad 0,97
 * Eo × 1,15  →  Yp × 1,185        elasticidad 1,22
 * ```
 *
 * La cancelación aparece recién cuando el agua deja de limitar: con 200 y con
 * 300 mm el índice se pega a 1, `Yp` queda igual a `Y` y la escala de `Eo` no
 * cambia nada. O sea que **se cancela justo en los años en que el modelo no hace
 * falta**, y pasa derecho en los años secos, que son los que deciden una carga
 * animal. La prueba está en `forrajeCorte.test.ts`.
 *
 * Por eso esto dejó de ser prolijidad y se arregló: lo que se juega es
 * proporcional, y el arreglo no es un factor sino el método.
 *
 * ## La única prueba de sensatez que sí hay
 *
 * De la Tabla 1 se deduce que la `Eo` media diaria de la temporada en Sidney
 * estuvo entre 3,53 y 4,20 mm/día, y `correrBalanceForraje` ya avisa cuando la
 * media de la serie se sale de ese envolvente. No valida la sustitución: detecta
 * que el clima no es el de la calibración.
 */
export const ETO_NO_ES_EO = {
  lo_que_pide_el_modelo: 'Eo — Wight y Hanks la calcularon por Jensen-Haise (1963)',
  lo_que_entrega_la_serie:
    'et0_fao_evapotranspiration de Open-Meteo / ERA5 — ETo de referencia de FAO-56, '
    + 'pasto de 0,12 m, albedo 0,23, resistencia 70 s/m',
  factor_aplicado: null,
  por_que_no:
    'Se midió: en Sidney la ETo de FAO-56 lee 1,166 veces la Eo de Jensen-Haise. Pero ese '
    + 'cociente es de un sitio y de una ventana, y el que viaja es el método, no el factor. Así '
    + 'que en vez de corregir se calcula la Eo como la calcularon los autores: ver '
    + 'lib/eoJensenHaise.ts.',
  /** Ya no es el camino principal: corre cuando la serie no trae radiación. */
  es_el_respaldo: true,
  /** El error con el que el `b` publicado reproduce la `Tp` publicada, en %. */
  tp_reproducida_pct: { con_la_eto: 16.5, con_la_eo_del_modelo: 1.3 },
  /**
   * Cuánto del error de la sustitución pasa al `Yp`, medido con el agua
   * limitando (90 días, 120 mm, 150 mm de agua útil, perfil a media carga).
   */
  elasticidad_con_agua_limitando: { minima: 0.78, maxima: 1.22, en_torno_a: 1 },
  /** Con el agua sin limitar el índice se pega a 1 y la escala de `Eo` no cambia nada. */
  se_cancela_solo_si: 'el índice T/Tp llega a 1, o sea en los años en que el modelo no hace falta',
} as const;

/** El aviso que acompaña a toda serie construida con la ETo de referencia. */
export const AVISO_ETO = {
  aviso:
    'La Eo del balance se llenó con la ETo de referencia de FAO-56 de la serie diaria, que no es '
    + 'la Eo que usaron Wight y Hanks: son dos superficies de referencia y dos métodos distintos. '
    + 'Esto es el respaldo para cuando la serie no trae radiación y temperaturas; con ellas la Eo '
    + 'se calcula por Jensen-Haise, que es el método del trabajo. Medido en su sitio de '
    + 'validación, la ETo lee 1,166 veces la Eo del método y con el b publicado infla la Tp un '
    + '16,5 %, así que la Tp sale ALTA y el índice T/Tp sale BAJO, o sea que el Yp despejado de un '
    + 'corte sale ALTO.',
  sesgo: 'alto' as Direccion,
};

/**
 * La serie dekadal no reemplaza a la diaria, y el error va para los dos lados.
 *
 * El payload de `/api/clima-diario` trae la serie **dekadal** —lluvia y ETP
 * acumuladas cada diez días, año por año— porque es lo que necesita el balance
 * hídrico mensual. La tentación de usar eso para este balance es grande: ya está
 * en el cliente, cacheado noventa días, treinta y cinco años.
 *
 * No sirve, y se midió por qué. La ecuación 6 del modelo, `E = Ep · t^(−1/2)`,
 * cuenta **días desde que la superficie se mojó**: un total de diez días no dice
 * cuándo llovió, y las dos formas razonables de repartirlo dan resultados
 * distintos y de signo opuesto. Sobre la misma temporada de 90 días y 120 mm:
 *
 * ```
 * diario                                  índice 0,743
 * todo el total el primer día de la década índice 0,835   × 1,125  → Yp BAJO
 * el total repartido en diez días iguales  índice 0,609   × 0,820  → Yp ALTO
 * ```
 *
 * Un golpe llena el perfil y drena el resto, pero deja nueve días de reloj de
 * evaporación corriendo; un reparto parejo moja la superficie todos los días y la
 * evaporación nunca baja. Ninguno de los dos es el agua que hubo. Con 300 mm los
 * tres dan 1,000, o sea que la degradación aparece exactamente en los años secos.
 *
 * De ahi sale que el corte necesite su propia ventana diaria, que es lo que pide
 * `ventanaDeBalance`.
 */
export const LA_SERIE_DEKADAL_NO_ALCANZA = {
  temporada_de_prueba: '90 días, 120 mm, Eo 3,8-4,2 mm/día, 150 mm de agua útil',
  indice_diario: 0.7426,
  indice_con_el_golpe_el_primer_dia: 0.8354,
  indice_con_reparto_parejo: 0.6089,
  cociente_golpe: 1.125,
  cociente_parejo: 0.820,
  por_que: 'la ecuación 6 cuenta días desde que la superficie se mojó, y un total de diez días no dice cuándo llovió',
  en_anios_humedos: 'los tres dan 1,000: la degradación aparece sólo cuando el agua limita',
} as const;

/**
 * Un día de la serie diaria, como la devuelven `/api/clima-diario/ventana` y
 * `/api/clima-diario/indices`.
 *
 * `et0_mm` es la ETo de referencia de FAO-56 y **no es la `Eo` del modelo**: con
 * ella el `b` publicado infla la `Tp` de la Tabla 1 un 16,5 %. Los tres campos
 * de abajo son los que permiten calcular la `Eo` como la calcularon Wight y
 * Hanks; si vienen, `eoDelDia` los usa y la ETo queda sólo de respaldo.
 */
export interface DiaDeSerie {
  /** Fecha ISO `YYYY-MM-DD`. */
  fecha: string;
  precip_mm: number | null;
  et0_mm: number | null;
  /** Radiación global del día, MJ/m². */
  rs_mj_m2?: number | null;
  t_max_c?: number | null;
  t_min_c?: number | null;
}

/**
 * La `Eo` de un día: por Jensen-Haise si hay coeficientes y el día trae con qué,
 * y por la ETo de FAO-56 si no.
 *
 * Devuelve `null` cuando hay coeficientes y al día le falta algo, **sin caer a
 * la ETo**. Mezclar las dos `Eo` adentro de una misma ventana sería peor que no
 * tener el día: la escala cambia un 16 % entre una y otra, así que un día de
 * ETo metido entre días de Jensen-Haise se leería como un día de demanda
 * atmosférica altísima. Quien llama rechaza la ventana, que es lo que ya hace
 * con un `null` de la serie.
 */
export function eoDelDia(d: DiaDeSerie, c?: CoeficientesEo | null): number | null {
  if (!c) return d.et0_mm;
  if (d.t_max_c === null || d.t_max_c === undefined) return null;
  if (d.t_min_c === null || d.t_min_c === undefined) return null;
  if (d.rs_mj_m2 === null || d.rs_mj_m2 === undefined) return null;
  return eoJensenHaiseMm((d.t_max_c + d.t_min_c) / 2, d.rs_mj_m2, c);
}

export interface VentanaDeBalance {
  dias: DiaDeBalance[];
  /** La primera y la última fecha que entraron, para poder mostrarlas. */
  desde: string;
  hasta: string;
  avisos: AvisoDeCorte[];
}

/**
 * Corta la serie diaria en la ventana de la temporada y la pasa al balance.
 *
 * `desde` y `hasta` son fechas ISO inclusive: el día en que el pastizal arrancó
 * a crecer y el día del corte, que son las dos cosas que el usuario sabe. El
 * trabajo usó del 15 de abril al pico, 68 a 99 días.
 *
 * Devuelve `null` si falta un día adentro de la ventana o si a alguno le falta
 * la lluvia o lo que haga falta para la `Eo` —radiación y temperaturas con
 * `coeficientes_eo`, la ETo de FAO-56 sin ellos—. **Un `null` de la serie no es
 * un día sin lluvia**:
 * es un día que no llegó, y rellenarlo con cero haría que una laguna del
 * reanálisis se vea como una seca. Es el mismo error que ya corrigió el panel de
 * contexto, y acá costaría una carga animal.
 */
export function ventanaDeBalance(
  serie: readonly DiaDeSerie[],
  desde: string,
  hasta: string,
  coeficientes_eo?: CoeficientesEo | null,
): VentanaDeBalance | null {
  if (desde > hasta) return null;
  const dentro = serie.filter(d => d.fecha >= desde && d.fecha <= hasta);
  if (dentro.length === 0) return null;
  if (dentro.some(d => d.precip_mm === null)) return null;
  const eo = dentro.map(d => eoDelDia(d, coeficientes_eo));
  if (eo.some(v => v === null)) return null;

  // Que no falte ningún día de la ventana: la cuenta de días entre las dos
  // fechas tiene que dar exactamente los que vinieron.
  const unDia = 86_400_000;
  const t0 = Date.parse(`${desde}T00:00:00Z`);
  const t1 = Date.parse(`${hasta}T00:00:00Z`);
  if (!Number.isFinite(t0) || !Number.isFinite(t1)) return null;
  const esperados = Math.round((t1 - t0) / unDia) + 1;
  if (dentro.length !== esperados) return null;

  const dias: DiaDeBalance[] = dentro.map((d, i) => ({
    pptn_mm: d.precip_mm as number,
    eo_mm: eo[i] as number,
  }));

  const aviso: AvisoDeCorte = coeficientes_eo
    ? { aviso: AVISO_EO_JENSEN_HAISE.aviso, sesgo: AVISO_EO_JENSEN_HAISE.sesgo_del_yp }
    : { ...AVISO_ETO };
  return { dias, desde, hasta, avisos: [aviso] };
}

/**
 * El agua que el perfil tenía al arrancar la temporada, y por qué no se puede
 * simular en el caso que importa.
 *
 * `SWS` inicial es el dato que más mueve este cálculo. Wight y Hanks lo medían
 * con sonda de neutrones el 15 de abril; acequia no tiene cómo. La salida obvia
 * es **calentar el perfil**: correr el balance meses antes del rebrote con la
 * lluvia real de la serie, para que el agua con la que se arrancó se olvide.
 *
 * Se midió cuánto cierra, y el resultado es incomodo y hay que decirlo: **el
 * calentamiento cierra la banda solamente donde no hace falta.** El ancho es el
 * cociente entre el `Yp` que sale arrancando el calentamiento con el perfil
 * vacío y el que sale arrancándolo lleno:
 *
 * ```
 *                        sin calentar   60 d   120 d   180 d   270 d
 * húmeda (200 mm)             1,42×      1,25×   1,08×   1,00×   1,00×
 * seca   (120 mm)             3,47×      3,45×   2,96×   3,29×   2,82×
 * ```
 *
 * En la temporada húmeda el perfil se llena y se olvida de todo: a los 180 días
 * las dos puntas dan el mismo número. En la seca, no: a los 270 días la banda
 * sigue casi tres veces ancha, y **no baja de forma monotónica** —a los 120 días
 * da 2,96 y a los 180 vuelve a 3,29—, que es la señal de que el calentamiento no
 * está lavando la condición inicial sino moviéndola de lugar según dónde caiga
 * la lluvia de esos meses.
 *
 * Y el motivo no es un defecto del método, es la física del lugar: en un régimen
 * seco las capas de abajo **no se recargan**, así que el agua con la que
 * empezaron sigue ahí. La memoria del perfil *es* la sequedad.
 *
 * La conclusión para la interfaz: donde la temporada fue seca, lo que cierra la
 * banda es **medir el suelo**, no simular más historia. Y mientras no se mida, el
 * intervalo es la respuesta honesta.
 *
 * ## La decisión que toma el calentamiento, declarada
 *
 * Durante el calentamiento la pastura está dormida, así que `b` se fuerza a
 * **cero**: no hay transpiración y el perfil pierde agua sólo por evaporación de
 * la capa superficial, que por la ecuación 7 pasa a demandar `Kc·Eo` entero. El
 * trabajo no describe este período —arranca el 15 de abril y listo—, así que la
 * decisión es nuestra y queda a la vista. Es la que deja el perfil más húmedo de
 * las plausibles, o sea el índice más alto y el `Yp` más bajo: el lado conservador.
 */
export const EL_AGUA_INICIAL_NO_SE_OLVIDA = {
  /**
   * El cociente entre el `Yp` que sale del perfil seco y el del perfil lleno,
   * con la serie de prueba de `forrajeCorte.test.ts`, que es la que lo mide.
   */
  ancho_de_la_banda: {
    humeda_200mm: { sin_calentar: 1.424, d60: 1.250, d120: 1.079, d180: 1.000, d270: 1.000 },
    seca_120mm: { sin_calentar: 3.474, d60: 3.448, d120: 2.956, d180: 3.295, d270: 2.823 },
  },
  /** En la seca no baja parejo: el calentamiento mueve el problema, no lo lava. */
  no_es_monotono: 'en la temporada seca el ancho va 2,96 a los 120 días y 3,29 a los 180',
  por_que:
    'En régimen seco las capas profundas no se recargan, así que el agua con la que '
    + 'empezó el calentamiento sigue ahí meses después. La memoria del perfil es la sequedad.',
  que_la_cierra: 'medir el agua del suelo al arranque de la temporada, no simular más historia',
  b_del_calentamiento: 0,
  por_que_b_cero:
    'La pastura está dormida. Es la decisión que deja el perfil más húmedo de las '
    + 'plausibles, o sea el índice más alto y el Yp más bajo: el lado conservador.',
} as const;

/** El aviso que acompaña a un `Yp` despejado con el perfil calentado. */
export const AVISO_CALENTAMIENTO = {
  aviso:
    'El agua del perfil al arranque de la temporada no se midió: se simuló corriendo el '
    + 'balance con la lluvia real de los días previos y la pastura dormida. Eso cierra la '
    + 'incertidumbre en una temporada húmeda —medido, a 180 días las dos puntas coinciden— '
    + 'pero casi no la cierra en una seca, donde las capas profundas no se recargan y el '
    + 'perfil recuerda con qué empezó.',
  sesgo: 'desconocido' as Direccion,
};

/**
 * Corre el balance sobre los días previos al rebrote y devuelve el agua que
 * quedó en cada capa, en mm, para sembrar la temporada.
 *
 * `fraccion_inicial` es con qué arranca el propio calentamiento, 0 a 1 —y la
 * medición de `EL_AGUA_INICIAL_NO_SE_OLVIDA` dice cuánto importa todavía al
 * final—. `b` se fuerza a cero en todos los días: pastura dormida.
 *
 * Devuelve `null` si el balance no corre o si no hay días previos. Las unidades
 * son mm en todo.
 */
export function sembrarPerfil(
  dias_previos: readonly DiaDeBalance[],
  aw_por_capa_mm: readonly number[],
  fraccion_inicial: number,
  opciones?: Omit<EntradasBalanceForraje, 'dias' | 'capas'>,
): number[] | null {
  if (dias_previos.length === 0) return null;
  const res = correrBalanceForraje({
    ...(opciones ?? {}),
    dias: dias_previos.map(d => ({ ...d, b: EL_AGUA_INICIAL_NO_SE_OLVIDA.b_del_calentamiento })),
    capas: capasDe90(aw_por_capa_mm, fraccion_inicial),
  });
  if (res === null) return null;
  const ultimo = res.serie[res.serie.length - 1];
  if (!ultimo) return null;
  // La capa superficial puede haber bajado del límite inferior por evaporación;
  // para sembrar la temporada se recorta a cero, que es el piso de `sws_inicial_mm`.
  return ultimo.sws_mm.map(v => Math.max(0, v));
}

// ─── La cadena completa: del corte al Yp ─────────────────────────────────────

export interface EntradasYpDelCorte {
  corte: CorteDeclarado;
  dias: readonly DiaDeBalance[];
  /** Agua útil de cada capa de 30 cm, en mm, de la superficie hacia abajo. */
  aw_por_capa_mm: readonly number[];
  /**
   * Fracción de agua útil del perfil al arranque de la temporada, 0 a 1.
   *
   * Si no se declara, no hay un `Yp` puntual: hay una **banda**, la que dejan el
   * perfil seco y el perfil lleno. Ver `YpDelCorte.banda_kg_ha`.
   *
   * Con `dias_previos`, esta fracción es con qué arranca el calentamiento y no
   * con qué arranca la temporada.
   */
  fraccion_inicial?: number;
  /**
   * Los días de la serie anteriores al rebrote, para calentar el perfil en vez
   * de declarar su agua.
   *
   * Cierra la banda en una temporada húmeda y casi no la cierra en una seca; la
   * medición está en `EL_AGUA_INICIAL_NO_SE_OLVIDA`.
   */
  dias_previos?: readonly DiaDeBalance[];
  /** El resto de las opciones del balance: `kc`, `c`, `b_constante`, el umbral. */
  opciones?: Omit<EntradasBalanceForraje, 'dias' | 'capas'>;
  /** Avisos que trae el armado de la serie, por ejemplo el de la ETo. */
  avisos_previos?: readonly AvisoDeCorte[];
}

export interface YpDelCorte {
  /**
   * El `Yp` del sitio, en kg/ha. `null` cuando el corte no sirve, cuando el
   * balance no corrió, o cuando no se declaró el agua inicial del perfil: ahí el
   * número puntual no existe y lo que existe es la banda.
   */
  yp_kg_ha: number | null;
  /**
   * Las dos puntas que deja el agua inicial desconocida.
   *
   * **La punta conservadora es `perfil_lleno`**, y no es obvio: arrancar con el
   * perfil lleno da más transpiración real, índice más alto, y como
   * `Yp = Y·Tp/T` divide por el índice, un índice alto da un `Yp` más chico.
   * Arrancar seco infla el `Yp`.
   */
  banda_kg_ha: { perfil_seco: number; perfil_lleno: number } | null;
  /** El `T/Tp` de la temporada medida. Con banda, el del caso declarado o `null`. */
  indice: number | null;
  rechazos: MotivoDeRechazo[];
  avisos: AvisoDeCorte[];
  /** Las advertencias del balance y del despeje, tal cual vienen. */
  advertencias: string[];
  sesgo: SesgoNeto;
}

/**
 * Del corte del usuario al `Yp` del sitio, pasando por el balance diario.
 *
 * Tres pasos, en este orden: la compuerta de `evaluarCorte`, el balance de
 * `correrBalanceForraje` con las tres capas, y el despeje de `despejarYp`. Si la
 * compuerta rechaza, no se corre el balance: no tiene sentido gastar la serie en
 * una cosecha que no es la magnitud del modelo.
 *
 * Unidades: el corte en kg MS/ha, la serie en mm/día, el agua útil en mm.
 * Devuelve kg/ha.
 *
 * Cuando `fraccion_inicial` no viene, devuelve la banda y deja `yp_kg_ha` en
 * `null`. Es a propósito: el agua que el perfil tenía el día que arrancó la
 * temporada mueve el resultado, y elegir un punto medio sería inventar el dato
 * más influyente del cálculo. Un intervalo honesto sirve para decidir; un punto
 * inventado no.
 */
export function ypDelCorte(e: EntradasYpDelCorte): YpDelCorte {
  const avisos: AvisoDeCorte[] = [...(e.avisos_previos ?? [])];
  const vacio = (rechazos: MotivoDeRechazo[]): YpDelCorte => ({
    yp_kg_ha: null, banda_kg_ha: null, indice: null,
    rechazos, avisos, advertencias: [], sesgo: sesgoNeto(avisos),
  });

  const compuerta = evaluarCorte(e.corte);
  if (!compuerta.sirve) return vacio(compuerta.rechazos);
  avisos.push(...compuerta.avisos);

  const calienta = (e.dias_previos ?? []).length > 0;
  if (calienta) avisos.push({ ...AVISO_CALENTAMIENTO });

  const corrida = (fraccion: number): { yp: YpDespejado; advertencias: string[] } | null => {
    // Con días previos la temporada arranca con el agua que dejó el
    // calentamiento, y `fraccion` pasa a ser con qué arrancó el calentamiento.
    const semilla = calienta
      ? sembrarPerfil(e.dias_previos ?? [], e.aw_por_capa_mm, fraccion, e.opciones)
      : null;
    const capas = semilla === null
      ? capasDe90(e.aw_por_capa_mm, fraccion)
      : e.aw_por_capa_mm.map((aw, i) => ({
          espesor_cm: PERFIL_DEL_MODELO.espesor_cm,
          aw_mm: aw,
          sws_inicial_mm: semilla[i] ?? 0,
        }));
    const res = correrBalanceForraje({
      ...(e.opciones ?? {}),
      dias: e.dias,
      capas,
    });
    if (res === null) return null;
    const cosecha: CosechaDeTemporada = {
      rendimiento_kg_ha: compuerta.rendimiento_kg_ha,
      base: compuerta.base,
      tp_mm: res.tp_mm,
      t_mm: res.t_mm,
    };
    const yp = despejarYp(cosecha);
    if (yp === null) return null;
    return { yp, advertencias: [...res.advertencias, ...yp.advertencias] };
  };

  const seco = corrida(0);
  const lleno = corrida(1);
  const banda = seco !== null && lleno !== null
    ? { perfil_seco: seco.yp.yp_kg_ha, perfil_lleno: lleno.yp.yp_kg_ha }
    : null;

  if (e.fraccion_inicial === undefined) {
    const advertencias = [...new Set([
      ...(seco?.advertencias ?? []),
      ...(lleno?.advertencias ?? []),
    ])];
    if (banda !== null) {
      const ancho = banda.perfil_lleno > 0 ? banda.perfil_seco / banda.perfil_lleno : null;
      avisos.push({
        aviso:
          'No se declaró cuánta agua tenía el perfil cuando arrancó la temporada, que es el dato que '
          + 'más mueve este cálculo, así que lo que se devuelve es la banda entre las dos puntas'
          + (ancho !== null ? ` — ${ancho.toFixed(1)} veces de ancho—` : '—')
          + '. La punta conservadora es la del perfil lleno: con más agua el índice T/Tp sube, y como '
          + 'el despeje divide por el índice, el Yp baja. Si la banda salió ancha es porque la '
          + 'temporada fue seca, y ahí lo único que la cierra es medir el agua del suelo: simular '
          + 'más historia previa no alcanza.',
        sesgo: 'desconocido',
      });
    }
    return {
      yp_kg_ha: null, banda_kg_ha: banda, indice: null,
      rechazos: [], avisos, advertencias, sesgo: sesgoNeto(avisos),
    };
  }

  const punto = corrida(Math.max(0, Math.min(1, e.fraccion_inicial)));
  if (punto === null) {
    return {
      yp_kg_ha: null, banda_kg_ha: banda, indice: null, rechazos: [], avisos,
      advertencias: ['El balance no corrió con las entradas dadas: revisá el agua útil de las capas y la serie.'],
      sesgo: sesgoNeto(avisos),
    };
  }

  return {
    yp_kg_ha: punto.yp.yp_kg_ha,
    banda_kg_ha: banda,
    indice: punto.yp.indice,
    rechazos: [],
    avisos,
    advertencias: punto.advertencias,
    sesgo: sesgoNeto(avisos),
  };
}

/**
 * El forraje de una temporada a partir del `Yp` del sitio, que es la ecuación 1.
 *
 *     Y = Yp · (T / Tp)
 *
 * Existe para cerrar la vuelta: el `Yp` que sale del corte es el **potencial**
 * del sitio, no el pasto de un año. Pasarle el `Yp` al campo «Forraje
 * (kg MS/ha·año)» del panel de Pastoreo sin multiplicar por el índice del año
 * que se quiere planificar sería dimensionar el rodeo para un año de agua no
 * limitante, que es el error más caro que este archivo puede habilitar.
 *
 * Unidades: `yp_kg_ha` en kg MS/ha, `indice` adimensional en [0, 1]. Devuelve
 * kg MS/ha. Devuelve `null` con índice fuera de [0, 1] o con `Yp` negativo: un
 * índice mayor que 1 significa `T > Tp`, que no puede pasar, y multiplicar por
 * él inventaría pasto.
 */
export function forrajeDelAnio(yp_kg_ha: number, indice: number): number | null {
  if (!Number.isFinite(yp_kg_ha) || !Number.isFinite(indice)) return null;
  if (yp_kg_ha < 0 || indice < 0 || indice > 1) return null;
  return yp_kg_ha * indice;
}
