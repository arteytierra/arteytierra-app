/**
 * Pueblos originarios — la cifra nacional, para los países donde todavía no
 * tenemos el dato local.
 *
 * ## Por qué existe esta capa y por qué es tan delgada
 *
 * Bolivia, Colombia, Ecuador y Uruguay están relevados desde hace semanas
 * —`_research/pueblos-originarios-paises/`— y no estaban en la app por un
 * motivo que no es técnico: **el organismo que publica el censo no declara una
 * licencia que permita redistribuir sus tabulados en un producto pago.** Las
 * cartas pidiendo esa autorización están escritas y las manda Jonatan.
 *
 * Mientras eso se resuelve, hay una distinción que destraba la mitad del asunto
 * y no necesita permiso de nadie: **decir un número citando la fuente no es
 * redistribuir un dataset.** «Según el Censo 2022 del INEC, en Ecuador hay
 * 1.302.057 personas indígenas» es un hecho con atribución, lo mismo que
 * publica cualquier diario. Lo que necesita licencia es montar *la tabla*: los
 * 1.100 municipios, los 984 polígonos, las 33 nacionalidades con su población.
 *
 * Así que acá va **una sola cifra por país**, la que el organismo publica, con
 * su pregunta literal, su universo, su fuente y la advertencia de que el dato
 * local todavía no está y por qué. Nada más. El razonamiento completo está en
 * `_research/pueblos-originarios-paises/ALTERNATIVAS_SIN_CARTA.md`.
 *
 * Canadá es distinto y entra por la puerta grande: la Statistics Canada Open
 * Licence permite uso comercial, adaptación y redistribución con atribución,
 * así que ahí no hay nada que esperar. Entra con la cifra nacional nada más
 * porque el dato subnacional es un relevamiento aparte, no porque falte
 * permiso.
 *
 * ## La regla que se respeta en todo el archivo
 *
 * Ninguna cifra de acá se calcula: todas se leen de la fuente. Y el porcentaje
 * sólo se muestra cuando se puede nombrar **exactamente qué denominador usó el
 * organismo**. En Colombia no se muestra ninguno, porque el 4,4 % que difunde el
 * DANE usa como base a las personas que informaron pertenencia étnica y no a las
 * personas censadas: imprimir nuestra propia división daría 4,3 % y estaría
 * contradiciendo a la fuente que estamos citando.
 */
import type { Ubicacion } from './entorno';
import { normalizarNombreAdmin, porcentaje } from './pueblosOriginarios';

/** Qué se puede hacer con el dato, según lo que el organismo declara. */
export type PermisoDato =
  /**
   * Se puede citar la cifra con atribución, pero no montar los tabulados. Es el
   * estado de los cuatro países sudamericanos que esperan respuesta.
   */
  | 'solo_cita'
  /** Licencia abierta con uso comercial: no hay nada que esperar. */
  | 'licencia_abierta';

export interface PaisNacional {
  /** ISO 3166-1 alfa-2, para depurar y para las claves de React. */
  iso2: string;
  /** Cómo lo nombra la app, en español. */
  pais: string;
  /**
   * Nombres que puede devolver el geocodificador. Se escriben como se leen y se
   * normalizan de los dos lados al comparar: `normalizarNombreAdmin` descarta
   * los conectores, así que «Estado Plurinacional de Bolivia» queda en «estado
   * plurinacional bolivia» y un alias escrito a mano con el «de» nunca casaría.
   */
  alias: readonly string[];
  organismo: string;
  organismoSigla: string;
  /** El operativo, como lo llama el organismo. */
  operativo: string;
  /** La pregunta literal del cuestionario, abreviada pero no reescrita. */
  pregunta: string;
  /** A quiénes se les preguntó. */
  universo: string;
  /**
   * Personas, tal como las publica la fuente. `null` cuando la fuente no
   * publica un total absoluto: en Uruguay los cuadros del Anuario sólo dan un
   * porcentaje redondeado, y multiplicarlo por la población sería una
   * estimación nuestra disfrazada de dato oficial.
   */
  total: number | null;
  /**
   * El denominador que usó el organismo, cuando se lo puede nombrar. `null`
   * cuando no se puede, y entonces no se muestra porcentaje.
   */
  base: number | null;
  /** Qué es la base, en palabras. Se imprime al lado del porcentaje. */
  baseDice: string | null;
  /**
   * Porcentaje que publica el propio organismo, cuando lo publica como tal.
   * Si está, se usa éste y no se calcula nada.
   */
  porcentajePublicado: string | null;
  /** Desglose que la fuente publica, si lo publica. Nunca se suma al total. */
  desglose: ReadonlyArray<{ etiqueta: string; personas: number }>;
  fuente: { label: string; url: string };
  /** Licencia o condiciones, como las declara el organismo. */
  licencia: string;
  permiso: PermisoDato;
  /**
   * Atribución que el organismo exige textualmente, si exige una. Statistics
   * Canada la impone para productos derivados y hay que imprimirla igual.
   */
  atribucionExigida: string | null;
  /** Por qué todavía no hay dato local. Se muestra siempre. */
  porQueNoHayDatoLocal: string;
  /** Lo que la cifra no dice. Se muestra siempre, y es la parte importante. */
  loQueNoDice: readonly string[];
}

/**
 * Los cinco países.
 *
 * Cada uno con sus palabras: la pregunta boliviana incluye a los afrobolivianos
 * en la misma respuesta afirmativa, la uruguaya pregunta por *ascendencia* y
 * admite varias a la vez, y la canadiense distingue tres pueblos que no se
 * funden en una palabra. Nada de esto se uniforma para que quede parejo.
 */
export const PAISES_NACIONAL: readonly PaisNacional[] = [
  {
    iso2: 'BO',
    pais: 'Bolivia',
    alias: ['bolivia', 'estado plurinacional de bolivia', 'buliwya', 'wuliwya'],
    organismo: 'Instituto Nacional de Estadística',
    organismoSigla: 'INE',
    operativo: 'Censo de Población y Vivienda 2024',
    pregunta: '¿Se autoidentifica con alguna nación pueblo indígena originario campesino o afroboliviano?',
    universo: 'Todas las personas censadas. Desde los siete años respondía cada persona; por los menores informaba quien estaba a cargo.',
    total: 4_302_484,
    base: 11_124_437,
    baseDice: 'personas que respondieron la pregunta',
    porcentajePublicado: null,
    desglose: [],
    fuente: {
      label: 'INE Bolivia — Autoidentificación, Censo 2024',
      url: 'https://www.ine.gob.bo/index.php/estadisticas-sociales/autoidentificacion/',
    },
    licencia: 'Los términos del INE no otorgan una licencia abierta y condicionan el uso comercial',
    permiso: 'solo_cita',
    atribucionExigida: null,
    porQueNoHayDatoLocal:
      'el INE publica los tabulados por departamento, provincia y municipio, pero sus términos no otorgan una licencia que permita montarlos en un producto pago. Se pidió la autorización por escrito',
    loQueNoDice: [
      'La respuesta afirmativa incluye, en la misma pregunta, a quienes se autoidentifican como afrobolivianos: el número no separa unos de otros.',
      'La base son 11.124.437 personas y no las 11.365.333 censadas, porque el cuadro excluye 240.896 casos sin respuesta.',
      'De las respuestas afirmativas, 83.684 no nombran un pueblo. Eso no es lo mismo que no haber contestado.',
      'El listado de pueblos del INE es referencial y no vinculante: el propio organismo aclara que Bolivia no tiene un listado oficial.',
    ],
  },
  {
    iso2: 'CO',
    pais: 'Colombia',
    alias: ['colombia', 'republica de colombia', 'republic of colombia'],
    organismo: 'Departamento Administrativo Nacional de Estadística',
    organismoSigla: 'DANE',
    operativo: 'Censo Nacional de Población y Vivienda 2018',
    pregunta: '¿De acuerdo con su cultura, pueblo o rasgos físicos… es o se reconoce como indígena? ¿A cuál pueblo indígena pertenece?',
    universo: 'Todas las personas residentes habituales censadas, incluidas las de Lugares Especiales de Alojamiento.',
    total: 1_905_617,
    // Sin porcentaje a propósito: ver el encabezado del archivo.
    base: null,
    baseDice: null,
    porcentajePublicado: null,
    desglose: [],
    fuente: {
      label: 'DANE — Información técnica del CNPV 2018',
      url: 'https://www.dane.gov.co/index.php/estadisticas-por-tema/demografia-y-poblacion/censo-nacional-de-poblacion-y-vivenda-2018/informacion-tecnica',
    },
    licencia: 'El DANE autoriza citar la información, pero pide visto bueno escrito para reproducir datos en un medio abierto a múltiples usuarios',
    permiso: 'solo_cita',
    atribucionExigida: null,
    porQueNoHayDatoLocal:
      'el DANE autoriza citar, pero pide visto bueno escrito antes de reproducir los tabulados en un medio que los ponga a disposición de muchos usuarios. Se pidió esa autorización. Los resguardos indígenas de la ANT, que sí tienen licencia abierta, son otra capa y van aparte',
    loQueNoDice: [
      'No se muestra un porcentaje porque el 4,4 % que difunde el DANE usa como denominador a quienes informaron pertenencia étnica, no a las personas censadas. Dividir por la población daría otro número y contradiría a la fuente.',
      'Hay 22.298 personas registradas como indígenas sin pueblo especificado. No son un pueblo.',
      'El cuadro de hogares particulares da 1.876.752 personas sobre otro universo. No contradice este total: mide otra cosa.',
      'Esta cifra no dice dónde están los resguardos ni si el predio linda con uno.',
    ],
  },
  {
    iso2: 'EC',
    pais: 'Ecuador',
    alias: ['ecuador', 'republica del ecuador', 'republic of ecuador'],
    organismo: 'Instituto Nacional de Estadística y Censos',
    organismoSigla: 'INEC',
    operativo: 'Censo de Población y Vivienda 2022',
    pregunta: '¿Cómo se identifica según su cultura y costumbres? ¿Cuál es la nacionalidad o pueblo indígena al que pertenece?',
    universo: 'Todas las personas residentes habituales censadas en el Ecuador.',
    total: 1_302_057,
    base: 16_938_986,
    baseDice: 'personas censadas',
    porcentajePublicado: null,
    desglose: [],
    fuente: {
      label: 'INEC — Resultados del Censo 2022',
      url: 'https://www.censoecuador.gob.ec/resultados-censo/',
    },
    licencia: 'El archivo censal no adjunta una licencia estándar al recurso',
    permiso: 'solo_cita',
    atribucionExigida: null,
    porQueNoHayDatoLocal:
      'el tabulado del INEC llega hasta la parroquia, pero el archivo no adjunta licencia y hace falta una confirmación escrita para redistribuirlo en un producto pago. Se pidió, junto con el turno en el formulario de requerimientos de información',
    loQueNoDice: [
      'El primer informe del censo difundió 1.301.887 personas y el tabulado publicado después da 1.302.057: una diferencia de 170. Va el número más nuevo.',
      'Hay 17.675 personas en «No sabe/No responde» y 1.420 en «Otras nacionalidades/Otros Pueblos». Ninguna de las dos es un pueblo.',
      'Esta cifra no dice dónde están las comunas, comunidades, pueblos o nacionalidades: el registro de la SGDPN no tiene geometría.',
    ],
  },
  {
    iso2: 'UY',
    pais: 'Uruguay',
    alias: ['uruguay', 'republica oriental del uruguay'],
    organismo: 'Instituto Nacional de Estadística',
    organismoSigla: 'INE',
    operativo: 'Censo 2023 (Anuario Estadístico Nacional 2025)',
    pregunta: '¿Cree tener ascendencia… afro o negra? ¿asiática? ¿blanca? ¿indígena? ¿otra?',
    universo: 'Población total. Cada persona marca Sí o No en cada una de las cinco ascendencias.',
    // El INE no publica un total absoluto: ver `porcentajePublicado`.
    total: null,
    base: 3_499_451,
    baseDice: 'personas, población ponderada al 31 de mayo de 2023',
    porcentajePublicado: '6,3',
    desglose: [],
    fuente: {
      label: 'INE Uruguay — Anuario Estadístico Nacional 2025, información censal',
      url: 'https://www.gub.uy/instituto-nacional-estadistica/comunicacion/publicaciones/anuario-estadistico-nacional-2025-vol-102/21-informacion-censal/215',
    },
    licencia: 'Los cuadros del Anuario no adjuntan una licencia estándar de reutilización',
    permiso: 'solo_cita',
    atribucionExigida: null,
    porQueNoHayDatoLocal:
      'los cuadros del Anuario dan porcentajes por departamento, pero no adjuntan licencia y no publican totales absolutos. Los microdatos, que sí los tendrían, exigen aceptar condiciones que prohíben redistribuirlos. Se pidió al INE el total oficial y la autorización',
    loQueNoDice: [
      'Acá no hay un total de personas: el INE publica 6,3 % redondeado a un decimal y no un número absoluto. Multiplicarlo por la población daría una estimación nuestra, no el dato oficial.',
      'La pregunta es por ascendencia, no por pertenencia a un pueblo. El cuestionario no enumera Charrúa, Chaná ni ningún otro.',
      'Cada persona podía responder Sí a más de una ascendencia, así que las cinco categorías no son excluyentes y no se suman.',
      'No se encontró un padrón nacional de comunidades. Eso no dice que no existan: dice que no encontramos un registro administrativo reutilizable.',
    ],
  },
  {
    iso2: 'CA',
    pais: 'Canadá',
    alias: ['canada'],
    organismo: 'Statistics Canada',
    organismoSigla: 'StatCan',
    operativo: 'Census of Population 2021',
    pregunta: 'Is this person First Nations (North American Indian), Métis or Inuk (Inuit)?',
    universo: 'Población en hogares particulares. El porcentaje que publica StatCan se calcula sobre ese universo y no sobre la población total censada, así que acá no se recalcula.',
    total: 1_807_250,
    base: null,
    baseDice: null,
    porcentajePublicado: '5,0',
    desglose: [
      { etiqueta: 'First Nations', personas: 1_048_405 },
      { etiqueta: 'Métis', personas: 624_220 },
      { etiqueta: 'Inuit', personas: 70_545 },
    ],
    fuente: {
      label: 'Statistics Canada — The Daily, 21/09/2022: Indigenous peoples, Census 2021',
      url: 'https://www150.statcan.gc.ca/n1/daily-quotidien/220921/dq220921a-eng.htm',
    },
    licencia: 'Statistics Canada Open Licence: permite uso comercial, adaptación y redistribución con atribución',
    permiso: 'licencia_abierta',
    atribucionExigida:
      'Adapted from Statistics Canada, Census of Population 2021, reference date 2021-05-11. This does not constitute an endorsement by Statistics Canada of this product.',
    porQueNoHayDatoLocal:
      'acá no falta permiso: la licencia de StatCan alcanza de sobra. Falta el relevamiento provincial y de las reservas, que es otro trabajo',
    loQueNoDice: [
      'Son tres pueblos distintos y no uno: First Nations, Métis e Inuit. El total no los reemplaza y StatCan no los funde en una palabra.',
      'Los tres números del desglose no suman el total. StatCan redondea a múltiplos de 5, y además 64.080 personas declararon más de una identidad indígena o una no contemplada en la lista.',
      'Esta cifra no dice dónde están las reservas ni los territorios de los tratados, ni si el predio cae en uno.',
    ],
  },
];

/**
 * Cuál de estos países le toca al punto, o `null`.
 *
 * Función pura, como las otras cinco capas: recibe la ubicación que ya resolvió
 * `/api/entorno` y no consulta nada. Se parte por la barra igual que en el
 * Paraguay, el Perú y Brasil, porque el geocodificador puede contestar un rótulo
 * bilingüe.
 */
export function paisNacionalDelPunto(u: Ubicacion | null): PaisNacional | null {
  if (!u?.pais) return null;
  const partes = u.pais.split('/').map(normalizarNombreAdmin);
  return PAISES_NACIONAL.find(p =>
    p.alias.some(a => partes.includes(normalizarNombreAdmin(a)))) ?? null;
}

/**
 * El porcentaje que se muestra, o `null` si no se muestra ninguno.
 *
 * Prefiere el que publica el organismo. Si no publica uno, lo calcula **sólo**
 * cuando hay total y base, porque entonces se está repitiendo la misma división
 * que hizo la fuente sobre los mismos dos números que la fuente publica. Sin
 * base no hay porcentaje: es el caso de Colombia, a propósito.
 */
export function porcentajeNacional(p: PaisNacional): string | null {
  if (p.porcentajePublicado) return p.porcentajePublicado;
  if (p.total !== null && p.base !== null) return porcentaje(p.total, p.base);
  return null;
}
