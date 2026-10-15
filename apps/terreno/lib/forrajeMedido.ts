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
 * ## Lo que estas tres mediciones ya demuestran
 *
 * La escalera no está «un poco alta» ni «un poco baja»: se equivoca **en las dos
 * direcciones**, y por eso el problema no es calibrarla sino que mira una sola
 * variable. Con la lluvia media de cada sitio:
 *
 * | Sitio | Lluvia | Escalera | Medido | |
 * |---|---|---|---|---|
 * | Dakota, pradera de altura | 508 mm | 3.000 | 2.643–3.063 | va bien |
 * | Texas, Edwards Plateau | 508–762 mm | 3.000–5.000 | 825–2.578 | alta 2–4× |
 * | Altiplano de Puno, 3.900 m | 410–1.119 mm | 1.500–7.000 | 626–1.958 | alta hasta 11× |
 *
 * En el norte de las Grandes Llanuras, con 381–508 mm, se miden casi 3.000
 * kg/ha/año; en el altiplano peruano, con MÁS lluvia, se miden 626. La
 * diferencia la explican el frío, el largo de la estación de crecimiento y la
 * profundidad del suelo, que la escalera no mira.
 *
 * ## Qué NO hace este archivo todavía
 *
 * No se enchufa al cálculo. `prodForrajera(precip_mm)` recibe la lluvia y nada
 * más —no sabe en qué bioma está el predio— así que usarlo pide cambiarle la
 * firma a las tres copias. Y falta el bioma que más importa: **la sabana
 * tropical, que es donde cae la mayoría de los predios ganaderos, no tiene
 * ninguna medición acá**. Reemplazar la escalera global con tres puntos sería
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
 * Qué clase de cifra es, que es lo que decide si se puede usar y cómo.
 *
 * Entre la primera y la última hay un factor de varias veces, no un porcentaje.
 * `oferta_aprovechable` ya trae descontada la fracción que el animal no come;
 * `ms_herbacea_total` no descuenta nada. **El uso admisible lo aplica después
 * `bandaUso` en `modulacion.ts`**, así que meter una `oferta_aprovechable` donde
 * el cálculo espera un total descuenta dos veces.
 */
export type TipoDeCifra =
  | 'oferta_aprovechable'
  | 'receptividad'
  | 'ms_herbacea_total'
  | 'npp_herbacea';

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
  /** Lluvia anual del sitio, que es el rango donde la cifra vale. */
  lluvia_mm_min: number;
  lluvia_mm_max: number;
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
 * Son tres sitios y dos biomas. No son un modelo: son los puntos que hay.
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
] as const;

/** Las mediciones que hay para un bioma global. Vacío es «no hay», y es común. */
export function medicionesDeBioma(bioma: string): MedicionForraje[] {
  return FORRAJE_MEDIDO.filter(m => m.bioma === bioma);
}
