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
 * Guatemala entra por la misma puerta desde el 27/09/2026: el propio dataset
 * del INE declara Creative Commons Attribution en su API, y además **publica
 * hasta lugar poblado, con coordenadas**. O sea que ahí el dato local no espera
 * una carta, espera que lo montemos: es lo primero que conviene hacer de toda
 * la región. Los otros cinco de Centroamérica y el Caribe entran como cita,
 * igual que los sudamericanos.
 *
 * ## La regla que se respeta en todo el archivo
 *
 * Ninguna cifra de acá se calcula: todas se leen de la fuente. Y el porcentaje
 * sólo se muestra cuando se puede nombrar **exactamente qué denominador usó el
 * organismo**. En Colombia no se muestra ninguno, porque el 4,4 % que difunde el
 * DANE usa como base a las personas que informaron pertenencia étnica y no a las
 * personas censadas: imprimir nuestra propia división daría 4,3 % y estaría
 * contradiciendo a la fuente que estamos citando.
 *
 * Nicaragua es la otra cara de la misma regla: su total de 443.847 incluye
 * Creole y Mestizo de la Costa Caribe, que no son pueblos indígenas, así que va
 * sin base y sin porcentaje. Un porcentaje etiquetado «indígena» sobre ese
 * numerador diría algo que la fuente no dice. Y Guatemala no lleva total,
 * porque el INE publica cada pueblo por separado: sumarlos sería nuestro
 * cálculo, no el censo.
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
  // ── Centroamérica y el Caribe ─────────────────────────────────────────────
  // Relevamiento del 26/09/2026 en `_research/pueblos-originarios-paises/
  // centroamerica-caribe/`. Seis de trece países entran: los otros siete o no
  // publican cifras absolutas (Belice sólo porcentajes), o no preguntan por
  // pueblo (República Dominicana), o no se pudo abrir la fuente (Honduras,
  // Trinidad y Tobago, Cuba, Haití, Dominica).
  {
    iso2: 'GT',
    pais: 'Guatemala',
    alias: ['guatemala'],
    organismo: 'Instituto Nacional de Estadística',
    organismoSigla: 'INE',
    operativo: 'Censo 2018 (cuadros A5 y A6)',
    pregunta: 'No se encontró la boleta censal publicada. El INE rotula la variable «Pueblo de pertenencia» y describe el criterio como autoidentificación.',
    universo: 'Población total censada. Los cuadros A5 cubren a las 14.901.286 personas censadas, y sus columnas suman exactamente ese total: no hay categoría «no declarado».',
    // El INE no publica un total «indígena»: publica cada pueblo por separado.
    // Sumar Maya + Garífuna + Xinka daría 6.491.199 y sería un cálculo nuestro.
    total: null,
    base: 14_901_286,
    baseDice: 'personas censadas en 2018',
    porcentajePublicado: null,
    desglose: [
      { etiqueta: 'Maya', personas: 6_207_503 },
      { etiqueta: 'Garífuna', personas: 19_529 },
      { etiqueta: 'Xinka', personas: 264_167 },
    ],
    fuente: {
      label: 'INE Guatemala — Censo 2018, cuadro A5 «Población total censada por pueblos»',
      url: 'https://datos.ine.gob.gt/dataset/censo-2018-lugares-poblados',
    },
    licencia: 'Creative Commons Attribution, declarada por el propio dataset en la API CKAN del INE (opendefinition cc-by)',
    permiso: 'licencia_abierta',
    atribucionExigida: 'Instituto Nacional de Estadística de Guatemala, Censo 2018, bajo licencia Creative Commons Attribution. Elaboración propia a partir de los cuadros A5 y A6.',
    porQueNoHayDatoLocal:
      'acá el dato local sí existe y sí se puede usar: el cuadro A5 baja a 22 departamentos, 340 municipios y 20.036 lugares poblados, 19.723 de ellos con coordenada, con licencia abierta declarada. Todavía no está montado, y es lo primero que conviene montar de toda la región',
    loQueNoDice: [
      'Acá no hay un total «indígena»: el INE publica cada pueblo por separado y no una suma. Sumar Maya, Garífuna y Xinka daría 6.491.199, pero sería un cálculo nuestro y no el dato del censo.',
      'Las 22 comunidades lingüísticas mayas del cuadro A6 suman exactamente el total Maya: son un desglose de Maya, no pueblos adicionales.',
      'Ladina(o) (8.346.120), Afrodescendiente/Creole/Afromestizo (27.647) y Extranjera(o) (36.320) son las otras categorías del mismo cuadro y no son pueblos originarios.',
      'No se encontró la boleta del censo 2018, así que la pregunta literal no se puede transcribir.',
      'No se encontró un registro administrativo de comunidades. Eso no dice que no exista: dice que no lo encontramos.',
    ],
  },
  {
    iso2: 'PA',
    pais: 'Panamá',
    alias: ['panama'],
    organismo: 'Instituto Nacional de Estadística y Censo, Contraloría General de la República',
    organismoSigla: 'INEC',
    operativo: 'Censo 2023 (Cuadro 20)',
    pregunta: 'No se encontró el cuestionario. La definición oficial: «Se consideró como población indígena todo aquel informante que declara pertenecer a algún grupo originario independientemente de la localidad donde fue empadronado».',
    universo: 'Población censada (4.064.780 personas).',
    total: 698_114,
    base: 4_064_780,
    baseDice: 'personas censadas en 2023',
    porcentajePublicado: '17,2',
    desglose: [],
    fuente: {
      label: 'INEC Panamá — Censo 2023, Cuadro 20',
      url: 'https://www.inec.gob.pa/publicaciones/Default3.aspx?ID_PUBLICACION=1199&ID_CATEGORIA=19&ID_SUBCATEGORIA=71',
    },
    licencia: 'La página de publicación declara CC BY 4.0 en su bloque de licencia y «Todos los derechos reservados» en el pie: se contradice, así que hasta confirmarlo por escrito se trata como cita',
    permiso: 'solo_cita',
    atribucionExigida: null,
    porQueNoHayDatoLocal:
      'el Cuadro 20 desagrega por provincia y comarca indígena, pero la licencia de la publicación se contradice consigo misma y hasta aclararlo sólo se cita la cifra nacional',
    loQueNoDice: [
      'El 17,2 % es sobre la población censada del país, no sobre la población de las comarcas.',
      '«Otro grupo indígena» son 45.498 personas: es una categoría grande que no es un pueblo y que no se reparte entre los demás.',
      'El cuadro lista «Naso» y «Teribe» como filas separadas. Son los rótulos de la fuente y no se unifican acá, aunque otras fuentes los traten como un mismo pueblo.',
      'La población afrodescendiente (1.286.857 según el comentario del INEC) es otra pregunta y no está incluida en este total.',
    ],
  },
  {
    iso2: 'NI',
    pais: 'Nicaragua',
    alias: ['nicaragua'],
    organismo: 'Instituto Nacional de Estadísticas y Censos, hoy INIDE',
    organismoSigla: 'INIDE',
    operativo: 'Censo 2005 (Resumen Censal, tabla 1.13)',
    pregunta: 'No se encontró la boleta. El Resumen Censal dice que en 2005 «se investiga por primera vez el auto reconocimiento o pertenencia a pueblos indígenas o comunidades étnicas, para todas las personas residentes».',
    universo: 'Todas las personas residentes en el país. El censo 2005 registró 5.142.098 personas.',
    total: 443_847,
    // A propósito sin base: el total no es «población indígena» —incluye Creole
    // y Mestizo de la Costa Caribe—, así que dividirlo daría un porcentaje que
    // dice otra cosa que su etiqueta.
    base: null,
    baseDice: null,
    porcentajePublicado: null,
    desglose: [],
    fuente: {
      label: 'INIDE Nicaragua — Resumen Censal 2005, tabla 1.13',
      url: 'https://www.inide.gob.ni/docu/censos2005/ResumenCensal/Resumen2.pdf',
    },
    licencia: 'No se encontró una licencia publicada del INIDE',
    permiso: 'solo_cita',
    atribucionExigida: null,
    porQueNoHayDatoLocal:
      'el Resumen Censal sólo desagrega por área urbana y rural, no por territorio, y no declara licencia. Además el dato es de 2005: no se encontraron resultados étnicos de un censo posterior',
    loQueNoDice: [
      'Este total es de «pueblo indígena o comunidad étnica», no de población indígena: incluye Creole (Kriol), 19.890 personas, y Mestizo de la Costa Caribe, 112.253, que no son pueblos indígenas. Restarlos daría otro número y ese cálculo no se hace acá.',
      '«No sabe» (47.473) e «Ignorado» (19.460) están dentro del total: son personas que se reconocen parte de un pueblo o comunidad pero no dicen cuál.',
      'El dato es de 2005, o sea de hace veinte años: es el más reciente que se encontró con resultados étnicos.',
      'No se encontró un registro administrativo de comunidades ni una capa de territorios.',
    ],
  },
  {
    iso2: 'CR',
    pais: 'Costa Rica',
    alias: ['costa rica'],
    organismo: 'Instituto Nacional de Estadística y Censos',
    organismoSigla: 'INEC',
    operativo: 'Censo 2011 (publicación «Territorios Indígenas»)',
    pregunta: 'No se encontró la boleta. La publicación define «Población indígena total: Es el total de personas que se autoidentificaron como indígenas», con y sin pueblo.',
    universo: 'Población total (4.301.712 personas).',
    total: 104_143,
    base: 4_301_712,
    baseDice: 'personas censadas en 2011',
    porcentajePublicado: null,
    desglose: [
      { etiqueta: 'con pueblo declarado', personas: 78_073 },
      { etiqueta: 'sin pueblo', personas: 26_070 },
    ],
    fuente: {
      label: 'INEC Costa Rica — Censo 2011, «Territorios Indígenas: principales indicadores demográficos y socioeconómicos»',
      url: 'https://www.inec.cr/',
    },
    licencia: 'No verificada: inec.cr responde 403 desde acá y la publicación se abrió en un espejo de la Universidad de Costa Rica',
    permiso: 'solo_cita',
    atribucionExigida: null,
    porQueNoHayDatoLocal:
      'la publicación 2011 sí desagrega por territorio indígena, pero el sitio del INEC no abre desde acá para verificar la licencia, y el archivo que se leyó es un espejo universitario y no la fuente',
    loQueNoDice: [
      'El dato es de 2011. El Censo 2022 tuvo cobertura parcial y no se publicaron resultados de etnicidad.',
      'Las 26.070 personas «sin pueblo» se autoidentificaron indígenas sin pertenecer a un pueblo del país ni del extranjero, y están dentro del total.',
      'Las 78.073 «con pueblo» incluyen personas de pueblos indígenas de otros países que viven en Costa Rica: no es la suma de los ocho pueblos costarricenses.',
      'La población que vive en territorios indígenas no es la población indígena: la misma publicación informa población no indígena dentro de los territorios.',
    ],
  },
  {
    iso2: 'SV',
    pais: 'El Salvador',
    alias: ['el salvador'],
    organismo: 'Banco Central de Reserva',
    organismoSigla: 'BCR',
    operativo: 'VII Censo de Población y VI de Vivienda, 2024',
    pregunta: 'No se encontró el cuestionario. La página de resultados dice que las personas «se consideran pertenecientes a algún pueblo indígena».',
    universo: 'No declarado en la página consultada: el BCR no publica ahí la población total del censo.',
    total: 68_148,
    base: null,
    baseDice: null,
    porcentajePublicado: '1,1',
    desglose: [],
    fuente: {
      label: 'BCR El Salvador — Censo 2024, página «Etnia»',
      url: 'https://poblacion.bcr.gob.sv/pages/teg-etnia',
    },
    licencia: 'El ítem del portal declara licenseInfo: null, o sea ninguna',
    permiso: 'solo_cita',
    atribucionExigida: null,
    porQueNoHayDatoLocal:
      'el portal es un ArcGIS Hub sin archivos descargables ni licencia declarada, y la página de etnia sólo publica el total nacional y porcentajes por pueblo',
    loQueNoDice: [
      'No hay cifras absolutas por pueblo: el BCR publica sólo porcentajes.',
      'El 12,6 % que responde «No sabe cuál es su pueblo indígena» está dentro de las 68.148 personas: no es población no indígena.',
      'El 1,1 % lo publica el BCR, pero en la página consultada no figura sobre qué población total está calculado.',
      'La página presenta además población afrodescendiente, que es otra pregunta y no está incluida acá.',
    ],
  },
  {
    iso2: 'VC',
    pais: 'San Vicente y las Granadinas',
    alias: ['san vicente y las granadinas', 'saint vincent and the grenadines'],
    organismo: 'Statistical Office',
    organismoSigla: 'SVG Stats',
    operativo: 'Censo 2023 (tabla 2-3)',
    pregunta: 'No se pudo transcribir: el cuestionario está en el apéndice 3 del informe, en imagen.',
    universo: 'Población en hogares (108.764 personas).',
    total: 5_587,
    base: 108_764,
    baseDice: 'personas en hogares, 2023',
    porcentajePublicado: null,
    desglose: [],
    fuente: {
      label: 'Statistical Office, San Vicente y las Granadinas — Censo 2023, tabla 2-3',
      url: 'https://stats.gov.vc/census/',
    },
    licencia: 'No se encontró una licencia publicada',
    permiso: 'solo_cita',
    atribucionExigida: null,
    porQueNoHayDatoLocal:
      'el informe da la categoría por census division, pero no declara licencia y el dato no viene en un archivo reutilizable',
    loQueNoDice: [
      'El censo no separa pueblos: «Indigenous People» es una sola categoría. El texto del informe habla de herencia Carib y Garifuna sin dar cifras por separado.',
      '«Not Stated» (134 personas) es no respuesta a la pregunta de etnicidad en general, no «indígena sin pueblo».',
      'El aumento del 70 % entre 2012 y 2023 lo atribuye el propio informe, entre otras cosas, a un mayor autorreconocimiento: no es sólo crecimiento demográfico.',
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
