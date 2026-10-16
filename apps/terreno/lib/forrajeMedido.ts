/**
 * Lo que está MEDIDO de producción forrajera natural, bioma por bioma.
 *
 * ## Por qué existe este archivo
 *
 * `prodForrajera` —en `produccion.ts`, con dos copias más en `pastoreo.ts` y en
 * el panel de Cobertura— es una escalera de cinco escalones por lluvia anual
 * que **no tiene ninguna fuente**:
 *
 * ```
 * < 300 mm → 700 kg MS/ha/año · < 500 → 1.500 · < 700 → 3.000
 * < 900 → 5.000 · ≥ 900 → 7.000
 * ```
 *
 * Ese número multiplica todo lo que viene después: la oferta de pasto, la carga
 * animal, el tamaño del rodeo y el agua que hay que almacenar para esa hacienda.
 * Este archivo es el primer paso para reemplazarla: **las mediciones primero, el
 * reemplazo después**, que es el orden que pide `skills/motor-de-calculo`.
 *
 * ## Lo que estas mediciones ya demuestran
 *
 * La escalera no está «un poco alta» ni «un poco baja»: se equivoca **en las dos
 * direcciones**, y por eso el problema no es calibrarla sino que mira una sola
 * variable. Con la lluvia de cada sitio:
 *
 * | Sitio | Lluvia | Escalera | Medido | |
 * |---|---|---|---|---|
 * | Dakota, pradera de altura | 381–508 mm | 1.500–3.000 | 2.643–3.063 | va bien |
 * | Texas, Edwards Plateau | 508–762 mm | 3.000–5.000 | 825–2.578 | alta 2–4× |
 * | Altiplano de Puno, 3.900 m | 410–1.119 mm | 1.500–7.000 | 626–1.958 | alta hasta 11× |
 * | Lesbos, fryganas | 354–797 mm | 1.500–5.000 | 300–5.800 | el rango medido es más ancho que la escalera entera |
 * | Tundra de Alaska y Yukón | no publicada | — | 350–960 | fuera de todo escalón |
 *
 * En el norte de las Grandes Llanuras, con 381–508 mm, se miden casi 3.000
 * kg/ha/año; en el altiplano peruano, con MÁS lluvia, se miden 626. La
 * diferencia la explican el frío, el largo de la estación de crecimiento y la
 * profundidad del suelo, que la escalera no mira.
 *
 * ## El trabajo de Lesbos midió el experimento que la escalera necesitaba
 *
 * Sin proponérselo: midió **los mismos potreros en dos años que difieren 2,25
 * veces en lluvia**, 797,3 mm contra 353,6 mm. Si la producción saliera de la
 * lluvia anual, el año húmedo tendría que haber rendido mucho más. Pasó lo
 * contrario en el tramo que importa: la producción diaria de la última época fue
 * de 12,1 kg/ha/día en el año húmedo y de **21,6 en el seco**. La razón la da el
 * propio trabajo: el 45 % de la lluvia del año húmedo cayó entre fines de
 * diciembre y fines de febrero, fuera de la ventana de crecimiento.
 *
 * Y en el mismo clima, el mismo año y la misma isla, los potreros «mejorados»
 * —terrazas mantenidas, piedras sacadas, chacra en el pasado— produjeron 15,9
 * kg MS/ha/día contra 5,5 de los sin tocar: un factor de **2,9 que no es clima
 * sino historia de uso**. La escalera no puede ver ninguna de las dos cosas.
 *
 * ## La trampa del pastizal perenne, y cómo empeora con el frío
 *
 * En un pastizal perenne, lo que está parado no es lo que creció este año, y la
 * distancia entre las dos cosas crece con el frío:
 *
 * - **Altiplano de Puno:** la biomasa en pie es de 1,5 a 3 veces la anual (del
 *   38,5 % al 66,3 % no creció este año).
 * - **Tundra de Alaska:** la fitomasa total es de 74 a 76 toneladas por
 *   hectárea y la producción aérea anual de 0,35 a 0,96. Entre **77 y 211
 *   veces**. Sólo la fracción aérea ya es unas 7 veces la anual.
 *
 * Cualquier cifra tomada de una foto de campo —o de un índice satelital de
 * biomasa— está midiendo el stock y no el flujo. En tundra el error es de dos
 * órdenes de magnitud.
 *
 * ## Qué NO hace este archivo todavía
 *
 * No se enchufa al cálculo. `prodForrajera(precip_mm)` recibe la lluvia y nada
 * más —no sabe en qué bioma está el predio— así que usarlo pide cambiarle la
 * firma a las tres copias. Y falta el bioma que más importa: **la sabana
 * tropical, que es donde cae la mayoría de los predios ganaderos, no tiene
 * ninguna medición acá**. Reemplazar la escalera global con cinco puntos sería
 * cambiar un número sin fuente por otro número sin cobertura.
 *
 * Mientras tanto esto sirve para lo que sí se puede hacer hoy: contrastar, y
 * tener escrito con qué.
 *
 * ## De dónde salen los ids de bioma
 *
 * Son los del bioma global de RESOLVE (`BIOME_NUM` → `resolve_*`), tal como los
 * define `ecorregiones.ts`. Están verificados contra el FeatureServer: la
 * Caatinga, por ejemplo, es `BIOME_NUM` 2 y no 7, así que una medición de la
 * Caatinga describe el bosque tropical seco y NO la sabana.
 */

/**
 * 1 lb/acre = 1,120851 kg/ha.
 *
 * Exacto por definición, no redondeado: 0,45359237 kg ÷ 0,40468564224 ha. Las
 * fuentes del NRCS publican todo en lb/acre y es la conversión que más veces se
 * hace mal en esta cadena.
 */
export const LB_ACRE_A_KG_HA = 0.45359237 / 0.40468564224;

/** lb/acre → kg/ha, redondeado al kilo. */
export function lbAcreAKgHa(lb_acre: number): number {
  return Math.round(lb_acre * LB_ACRE_A_KG_HA);
}

/**
 * 1 g/m² = 10 kg/ha. Exacto: 10.000 m² por hectárea ÷ 1.000 g por kilo.
 *
 * La bibliografía de ecología publica en g/m² y la de producción ganadera en
 * kg/ha, así que este factor aparece cada vez que se cruzan las dos.
 */
export function gM2AKgHa(g_m2: number): number {
  return Math.round(g_m2 * 10);
}

/**
 * Qué clase de cifra es, que es lo que decide si se puede usar y cómo.
 *
 * Entre la primera y la última hay un factor de varias veces, no un porcentaje.
 * `oferta_aprovechable` ya trae descontada la fracción que el animal no come;
 * `ms_herbacea_total` y `npp_herbacea` no descuentan nada. **El uso admisible lo
 * aplica después `bandaUso` en `modulacion.ts`**, así que meter una
 * `oferta_aprovechable` donde el cálculo espera un total descuenta dos veces.
 */
export type TipoDeCifra =
  | 'oferta_aprovechable'
  | 'receptividad'
  | 'ms_herbacea_total'
  | 'npp_herbacea';

/**
 * Las clases de cifra que NO traen descontado el uso admisible.
 *
 * Son las únicas que pueden entrar acá mientras río abajo `bandaUso` descuente
 * por su cuenta. La diferencia entre `ms_herbacea_total` y `npp_herbacea` es de
 * método —cosecha contra producción primaria estimada— y no de si descuenta.
 */
export const TIPOS_SIN_DESCONTAR: readonly TipoDeCifra[] = [
  'ms_herbacea_total',
  'npp_herbacea',
] as const;

export interface MedicionForraje {
  /** Bioma global de RESOLVE al que pertenece el sitio medido. */
  bioma: string;
  /** Rótulo corto del sitio, para poder nombrarlo en pantalla. */
  sitio: string;
  tipo: TipoDeCifra;
  kg_ms_ha_anio_min: number;
  kg_ms_ha_anio_max: number;
  /** Sólo si la fuente publica un valor central. Nunca el punto medio calculado. */
  kg_ms_ha_anio_tipico: number | null;
  /**
   * Lluvia anual del sitio, que es el rango donde la cifra vale.
   *
   * **`null` cuando la fuente no la publica**, y se queda en `null`: no se
   * rellena con la climatología de otro servicio, porque entonces la cifra
   * quedaría atada a un número que su propio trabajo nunca midió. Pasa en
   * tundra, donde además el agua no es lo que limita.
   */
  lluvia_mm_min: number | null;
  lluvia_mm_max: number | null;
  /** Cómo se midió. */
  metodo: string;
  /** Qué incluye y qué no. */
  que_cuenta: string;
  /** Cuándo crece, que es lo que la cifra anual esconde. */
  estacionalidad: string;
  /** Dónde deja de valer. */
  donde_deja_de_valer: string;
  /** Año o años en que se midió, no el de publicación. */
  medido_en: string;
  fuente: { label: string; url: string };
}

/**
 * Las mediciones, verificadas una por una abriendo la fuente el 15/10/2026.
 *
 * Son cinco sitios y cuatro biomas. No son un modelo: son los puntos que hay.
 */
export const FORRAJE_MEDIDO: readonly MedicionForraje[] = [
  {
    bioma: 'resolve_pastizal_templado',
    sitio: 'Loamy Upland, MLRA 53B, Dakota del Norte y del Sur',
    tipo: 'ms_herbacea_total',
    // 2.733 y 2.358 lb/acre. El de abajo NO es un año malo: es el estado al que
    // el sitio transiciona con pastoreo continuo intenso o continuo de
    // primavera, dominado por juncia y grama azul. Van los dos porque la
    // diferencia entre ellos es manejo, y eso es justamente lo que esta app
    // tiene que poder mostrar.
    kg_ms_ha_anio_min: 2643,
    kg_ms_ha_anio_max: 3063,
    kg_ms_ha_anio_tipico: null,
    lluvia_mm_min: 381,
    lluvia_mm_max: 508,
    metodo: 'Producción anual de las comunidades de referencia de las fichas de sitio ecológico correlacionadas con la clase, en el informe CEAP de pastizales del NRCS.',
    que_cuenta: 'Producción anual aérea en peso seco de la comunidad herbácea. No descuenta palatabilidad, acceso ni pisoteo.',
    estacionalidad: 'Las especies nativas de estación fría crecen de fines de marzo a principios o mediados de julio; las de estación cálida, de mediados de mayo a fines de agosto. El rebrote de otoño depende de que haya humedad en el suelo.',
    donde_deja_de_valer: 'Clase de sitio Loamy Upland de la MLRA 53B. La propia fuente dice que la lluvia anual de la MLRA va de 15 a 20 pulgadas y que la media de la ficha es 20,0: la media está en el techo del rango, no en el medio.',
    medido_en: 'informe de 2018',
    fuente: {
      label: 'USDA NRCS — Evaluation of Ecological Site Classes and Community Classes for Regional Scale Modeling of Conservation Effects on Grazing Lands: MLRA 53B',
      url: 'https://www.nrcs.usda.gov/publications/ceap-GrazingLands-2018-EcologicalSiteMajorLandResourceArea53b.pdf',
    },
  },
  {
    bioma: 'resolve_pastizal_templado',
    sitio: 'Very Shallow 23-31 PZ, MLRA 81B, Edwards Plateau, Texas',
    tipo: 'ms_herbacea_total',
    // Gramíneas 680–2.125 lb/acre y hierbas 56–175, o sea 736–2.300 en conjunto,
    // con valor representativo 1.840. La ficha publica además el total del sitio
    // —800 / 2.000 / 2.500 lb/acre— que incluye arbustos y árboles; acá va la
    // fracción herbácea, que es la que pastorea un animal. La misma ficha dice
    // que las gramíneas son el 85 a 90 % de la producción anual.
    kg_ms_ha_anio_min: 825,
    kg_ms_ha_anio_max: 2578,
    kg_ms_ha_anio_tipico: 2062,
    lluvia_mm_min: 508,
    lluvia_mm_max: 762,
    metodo: 'Tabla de producción anual por tipo de planta de la ficha de sitio ecológico, comunidad de referencia 1.1 (pradera de gramíneas medias).',
    que_cuenta: 'Gramíneas, graminoides y hierbas. Excluye arbustos y árboles, que la ficha cuenta aparte. No descuenta palatabilidad ni acceso.',
    estacionalidad: 'La curva publicada reparte la producción por mes: 2-3-5-13-23-15-4-5-15-7-5-3 % de enero a diciembre. Mayo solo es el 23 % y julio y agosto juntos son el 9 %.',
    donde_deja_de_valer: 'Suelos de 4 a 10 pulgadas sobre caliche o roca, con 40 a 95 % de carbonato de calcio y capacidad de agua disponible de 0,3 a 1,8 pulgadas. La ficha es PROVISIONAL y se contradice en la lluvia: el nombre del sitio dice 23-31 pulgadas, la tabla climática dice rango real 20-30 y media 30.',
    medido_en: 'ficha actualizada el 19/09/2023',
    fuente: {
      label: 'USDA NRCS — Ecological site R081BY354TX, Very Shallow 23-31 PZ (MLRA 081B, Edwards Plateau)',
      url: 'https://edit.sc.egov.usda.gov/catalogs/esd/081B/R081BY354TX',
    },
  },
  {
    // El id del bioma 10 es `resolve_montano` y no `resolve_pastizal_montano`:
    // el encargo le había puesto el nombre corto y no existe con ese nombre.
    bioma: 'resolve_montano',
    sitio: 'Chuquibambilla (3.910 m) y La Raya (4.300 m), Puno, Altiplano peruano',
    tipo: 'ms_herbacea_total',
    // 626,4 · 1.237,0 · 1.340,8 · 1.957,7 kg MS/ha para los cuatro pastizales.
    // Son la biomasa ANUAL, ya separada de la permanente: la biomasa total en
    // pie promedio es de 1.484 a 3.972 kg/ha y la fracción muerta en pie va del
    // 38,5 % en Calamagrostis antoniana al 66,3 % en Festuca dichoclada. O sea
    // que en un pajonal altoandino entre un tercio y dos tercios de lo que se ve
    // parado no creció este año.
    kg_ms_ha_anio_min: 626,
    kg_ms_ha_anio_max: 1958,
    kg_ms_ha_anio_tipico: null,
    lluvia_mm_min: 410,
    lluvia_mm_max: 1119,
    metodo: 'Seis cosechas mensuales (diciembre a mayo) dentro de una clausura sin pastoreo de 2.500 m2, en dos bloques de 361 m2, con 30 unidades de muestreo por época, marco de 0,5 m2, corte a 2 cm y secado en estufa a 65 °C hasta peso constante.',
    que_cuenta: 'Materia seca aérea ANUAL del espectro total de especies del pastizal, separada de la biomasa permanente. Al estar dentro de clausura no descuenta consumo ni pisoteo.',
    estacionalidad: 'El mínimo cae en diciembre en los cuatro pastizales y el máximo entre febrero y mayo según la comunidad. En Calamagrostis antoniana va de 828 a 2.983 kg/ha entre diciembre y mayo: la misma pradera rinde 3,6 veces más al final de las lluvias que al principio.',
    donde_deja_de_valer: 'Pajonal altoandino por encima de 3.900 m, en Puno, con biotemperatura media anual de 4,6 a 12,9 °C. La fuente publica además receptividad por condición: 2 unidades ovino/ha/año en los dos pastizales de planicie y 1 en los dos de áreas colinosas.',
    medido_en: 'temporada de lluvias de 1982',
    fuente: {
      label: 'Revista de Ciencias Agrarias (UNA Puno) 7(1):73-83 — Relaciones suelo-comunidad vegetal en pastizales del Altiplano sur peruano',
      url: 'https://revistas.unap.edu.pe/agr/index.php/agr/article/view/465',
    },
  },
  {
    bioma: 'resolve_mediterraneo',
    sitio: 'Agra, oeste de Lesbos, Grecia — 14 potreros de cuatro majadas',
    tipo: 'ms_herbacea_total',
    // «ranging from very small values close to 300 kg/ha to those of about 5800
    // kg/ha at a flat pasture plot, which in the past was used for annual
    // crops». El techo es ese potrero plano y ex-chacra, no la frygana: el
    // propio trabajo dice que los potreros por debajo de 500 kg/ha están en
    // suelos desfavorables y los de arriba, en el rango de las praderas
    // mejoradas de la bibliografía.
    kg_ms_ha_anio_min: 300,
    kg_ms_ha_anio_max: 5800,
    kg_ms_ha_anio_tipico: null,
    // Las dos temporadas medidas, que es de donde sale la cifra: 353,6 y 797,3
    // mm. La normal del lugar es mucho más angosta y va en `donde_deja_de_valer`.
    lluvia_mm_min: 354,
    lluvia_mm_max: 797,
    metodo: 'Jaulas de exclusión de malla 1 × 1,2 cm sobre 0,25 m2 y 0,7 m de alto, puestas en octubre, diciembre y marzo y cosechadas a ras entre fines de mayo y principios de junio; secado a 60 °C por 24 h. La productividad del potrero es la biomasa de la jaula multiplicada por el porcentaje de cobertura herbácea de ese potrero, promediada entre estaciones de muestreo.',
    que_cuenta: 'Herbáceas solamente, y por construcción: las estaciones de muestreo se eligieron sin suelo desnudo, sin piedras y sin vegetación perenne. NO cuenta el Sarcopoterium spinosum ni el Asphodelus ramosus, que cubren buena parte de estos potreros y que la majada sí ramonea en parte. No descuenta uso.',
    estacionalidad: 'Crecimiento moderado los primeros 5 o 6 meses y mucho más rápido en los 2 o 3 que siguen. Por época y por año: 5,8 · 5,2 · 12,1 kg MS/ha/día en el primero y 9,8 · 4,4 · 21,6 en el segundo. La jaula cosechada temprano y después dejada descansar fue la de mayor tasa en las dos temporadas: pastorear temprano y largar puede rendir más al final.',
    donde_deja_de_valer: 'Fryganas y ex-chacras del oeste de Lesbos, sobre roca volcánica ácida, con suelos de 15 a 30 cm o de 30 a 60 cm y pendientes de 6 a 12 % o más; sólo tres ex-chacras pasan los 60 cm y son casi planas. La normal del lugar es 415 mm y 17 °C de media, con 464,6 mm de media histórica en la estación de Sigri. Y el dato que no se puede ignorar: la proteína bruta de lo cosechado va de 5,4 a 7,3 %, que el propio trabajo califica de tan baja como la paja de cereal, así que estos kilos de materia seca no son kilos de alimento.',
    medido_en: 'dos temporadas de crecimiento consecutivas, de septiembre a junio',
    fuente: {
      label: 'Sustainability 14(8):4623 — Grazing Land Productivity, Floral Diversity, and Management in a Semi-Arid Mediterranean Landscape',
      url: 'https://doi.org/10.3390/su14084623',
    },
  },
  {
    bioma: 'resolve_tundra',
    sitio: 'Cuatro comunidades de pajonal de Eriophorum vaginatum, Alaska y Yukón',
    tipo: 'npp_herbacea',
    // «Yearly primary production was estimated to be between 35 and 96 g m-2
    // for aboveground vascular plants», o sea 350 a 960 kg/ha/año.
    kg_ms_ha_anio_min: 350,
    kg_ms_ha_anio_max: 960,
    kg_ms_ha_anio_tipico: null,
    // La fuente no publica lluvia para sus sitios y no se inventa. En tundra el
    // agua tampoco es lo que limita: limitan el frío y el largo del verano.
    lluvia_mm_min: null,
    lluvia_mm_max: null,
    metodo: 'Componentes de fitomasa y tasas de producción primaria en cuatro comunidades de pajonal de algodoncillo; recambio aéreo medido con bolsas de hojarasca. De este trabajo sólo se pudo leer el resumen del editor: el texto completo está detrás de una verificación anti-bot, así que el método primario no se verificó más allá de lo que el resumen declara.',
    que_cuenta: 'Producción primaria anual de las plantas vasculares AÉREAS. Excluye musgos y líquenes, que el mismo resumen cuantifica aparte —28 a 116 g/m2/año de musgo y 1 a 5 de liquen— y que en tundra son parte del forraje real del reno y del caribú, sobre todo en invierno. Para pastoreo de renos esta cifra es un piso y no el total.',
    estacionalidad: 'La comunidad de algodoncillo produce buena parte de su crecimiento nuevo temprano en el verano, en gran medida porque el Eriophorum vaginatum arranca temprano.',
    donde_deja_de_valer: 'Cuatro comunidades de Alaska y del Yukón, no todo el bioma. Y el dato que explica por qué acá no se puede mirar una foto de campo: la fitomasa total de los dos sitios estudiados a fondo era de 7.401 y 7.567 g/m2 —74 y 76 toneladas por hectárea— con un recambio aéreo de unos 7 años y subterráneo de 45 a 150. Lo que está parado es entre 77 y 211 veces la producción del año. El mismo trabajo agrega que después de un disturbio la capa activa se profundiza, hay más nutrientes disponibles y el algodoncillo responde creciendo más.',
    medido_en: 'publicado en 1974, Arctic and Alpine Research 6(3)',
    fuente: {
      label: 'Arctic and Alpine Research 6(3) — Primary Production in Arctic Cottongrass Tussock Tundra Communities',
      url: 'https://doi.org/10.1080/00040851.1974.12003782',
    },
  },
] as const;

/** Las mediciones que hay para un bioma global. Vacío es «no hay», y es común. */
export function medicionesDeBioma(bioma: string): MedicionForraje[] {
  return FORRAJE_MEDIDO.filter(m => m.bioma === bioma);
}
