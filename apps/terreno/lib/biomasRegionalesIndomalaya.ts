/**
 * Fichas regionales de Indomalaya: 42 fichas para 43 ECO_ID.
 *
 * El alcance y el porqué del recorte están en `ecorregionesIndomalaya.ts`. Acá
 * va lo que hay que saber para tocar los números.
 *
 * ## Treinta y dos salieron de una regla; las tres del Decán, no
 *
 * Las 32 primeras son todas de bioma 1 —tropical húmedo— y salieron de la regla
 * que se explica abajo. Las tres del Decán —`decan_central_hardwickia`
 * (ECO_ID 290), agregada el 23/10/2026, y `decan_norte_sal` (297) y
 * `decan_sur_elefantes` (298), el 04/11/2026— son **de bioma 2**, el bosque
 * tropical seco, y por eso no salen de esa regla ni podrían: la regla escala el
 * −25 de huerta del bioma húmedo, y el bioma seco pone −10 de huerta y +10 de
 * pasturas por motivos que no tienen nada que ver con la lixiviación.
 *
 * Esas tres rompen a propósito cuatro invariantes que valen para las otras 32,
 * y están declaradas como excepción en
 * `tests/unit/contexto/aptitudIndomalaya.test.ts`: tocan usos que no son
 * huerta, proponen números **positivos**, sus razones no dicen «regla de
 * acequia» porque no vienen de ninguna regla nuestra, y no traen reparto de
 * HWSD ni de SoilGrids —no se extrajo para esos polígonos y no se inventó—. Lo
 * que las sostiene es otra cosa, y distinta en cada una: en el Decán central,
 * escurrimiento y pérdida de suelo medidos durante décadas en microcuencas del
 * ICRISAT que están adentro de la ecorregión; en el norte, índices de
 * pedogénesis medidos en catenas de Sambalpur, el distrito de una de sus cuatro
 * áreas protegidas; en el sur, el corredor de elefantes y las acciones
 * prioritarias publicadas, que están dirigidas a la tierra privada. Sus tests
 * propios viven en `aptitudDecan.test.ts`.
 *
 * Las tres sin `cultivos`, y es una decisión: las dos fuentes de cultivos que
 * trajo la entrega para el norte y el sur —el proyecto FOLUR de Odisha y el
 * plan distrital de Tiruchirappalli— no abren desde esta máquina, y no se cita
 * lo que no se pudo leer. Sin esa lista, la ficha cae al catálogo por clase
 * Köppen, que es más grueso y sí tiene fuente. El Decán central sí los trae,
 * con el MPKV al lado.
 *
 * ## Y las tres del 05/11/2026 son de tres biomas distintos
 *
 * `manglares_sundarbans` (ECO_ID 323), `bosques_secos_irrawaddy` (294) y
 * `matorral_espinoso_decan` (315) entraron porque cada una tenía una práctica
 * fechada del territorio ya verificada que no se podía montar sin ficha. Son
 * **bioma 14, bioma 2 y bioma 13**, y las dos puntas son biomas nuevos para este
 * bloque. Igual que las tres del Decán, están declaradas como excepción en
 * `tests/unit/contexto/aptitudIndomalaya.test.ts`: no salen de la regla del −25
 * y no traen reparto de HWSD ni de SoilGrids.
 *
 * Las tres **confirman** todos los deltas que heredan en vez de corregirlos, y
 * eso no es una abstención: confirmar convierte un delta heredado en un delta
 * respaldado, y en los tres casos lo que cambia es *la variable que hay que
 * mirar en el predio*, que es lo que el usuario necesita. En el manglar, si la
 * parcela está detrás de un terraplén. En Myanmar, si está adentro de un área de
 * riego. En el matorral espinoso, si cae en el área de mando de un phad.
 *
 * Tres advertencias sobre lo que estas fichas no dicen, que importan porque la
 * entrega sí lo decía:
 *
 * 1. **El informe del Banco Mundial sobre el Sundarbans se cita por su
 *    documento real.** La entrega lo citaba por un PDF alojado en
 *    `sundarbanaffairswb.in`, que devuelve **200 con la página de error** del
 *    propio departamento. Las cifras eran correctas; la URL no servía el
 *    documento. Es el mismo 200 engañoso que el encargo ya había encontrado en
 *    EUDASM, y confirma que la forma de verificar es leer el contenido.
 * 2. **El «nivel de protección» de One Earth no es el porcentaje protegido.** Es
 *    el porcentaje de la meta de la Red de Seguridad Global en una escala de 0 a
 *    10, y la propia página lo aclara arriba de la tabla. El 294 tiene nivel 1 y
 *    la entrega lo leyó como «menos del 1 % está protegido». Para el 315, en
 *    cambio, el 1 % sí está escrito en el texto de la página: son dos cosas
 *    distintas que se parecen.
 * 3. **El matorral espinoso entra con seis especies y no con siete.** Las siete
 *    con binomial que traía la entrega salen de `era-india.org`, que contesta con
 *    una verificación anti-bot, así que no se citan; las seis que quedan son las
 *    que nombran One Earth y la clasificación de formaciones leñosas de la FAO.
 *    De esa última sale algo que la entrega no tenía: las dos series que le
 *    corresponden al polígono —Albizia amara en el sur de la India, Acacia
 *    catechu y Acacia arabica en la llanura del Decán— y la advertencia de que
 *    parte de estos matorrales son series de reemplazo de las series más
 *    húmedas, o sea que encontrar matorral no prueba que el sitio no dé más.
 *
 * ## La regla que produjo los otros modificadores es nuestra, no de HWSD
 *
 * Cada `aptitud` de huerta sale de escalar el −25 del bioma global por la
 * fracción de suelo con limitante severa dentro del polígono:
 *
 *     valor = −25 × fracción con limitante severa, redondeado a 5
 *
 * La fracción se lee de HWSD v2 y se contrasta con SoilGrids WRB. En las
 * ecorregiones volcánicas y de los Ghats esa fracción son los suelos lixiviados
 * y ácidos (Acrisols, Ferralsols, Alisols, Plinthosols, Podzols, Umbrisols
 * ácricos); en las aluviales se le suman los tiónicos —sulfatados ácidos—, los
 * salinos o sódicos y la turba de PEATMAP. Si las dos bases quedan a más de 5
 * puntos y ninguna tercera fuente que nombre el suelo desempata, la ficha **no
 * propone modificador** y hereda el del bioma: nueve de las 32 están así, y es
 * una decisión, no un olvido.
 *
 * Dos cosas de esa regla, que es lo que exige `motor-de-calculo`:
 *
 * 1. **El delta es una decisión de acequia.** HWSD y SoilGrids son la fuente de
 *    las *fracciones de suelo*; el −25 de referencia y el multiplicador salen de
 *    este proyecto. Por eso las razones dicen «regla de acequia» y no atribuyen
 *    el número a las bases de suelo.
 * 2. **No puede dar un valor positivo, por construcción.** El techo es 0. La
 *    hipótesis con la que arrancó el lote —que el andisol de Java merece un
 *    bono— nunca podía confirmarse con esta regla, y eso hay que tenerlo
 *    presente si algún día se revisa: la abstención de dar positivo se
 *    justifica en pendiente y retención de fósforo (más del 90 % en los
 *    perfiles de Lembang), no en ausencia de evidencia.
 *
 * ## Cómo compone con el bioma global
 *
 * `componerAptitud` en `lib/contexto.ts` hace que el delta regional **reemplace**
 * al global para ese uso y herede el resto. Por eso un `delta: 0` con razón es
 * una cancelación explícita —las dos llanuras gangéticas la usan— y por eso
 * omitir el modificador no es neutro: deja vivo el del bioma.
 *
 * Ahí está el único cambio de fondo sobre lo entregado: la ficha de la zona seca
 * de Sri Lanka propone `huerta: 0` sin conocer el valor de su bioma, que es
 * `resolve_bosque_tropical_seco` con −10 **por falta de agua**, justo lo que la
 * ficha misma dice que es el límite. Montar el 0 habría borrado una advertencia
 * hídrica con un argumento de fertilidad, así que esa ficha no lleva
 * modificador. Ver el README del relevamiento.
 *
 * ## Lo demás
 *
 * `saberes` va vacío en las 33, como en todo el catálogo regional: sin geometría
 * con procedencia, licencia y acuerdo, `lib/saberes.ts` no activa nada. Que un
 * predio caiga en Java no autoriza a atribuirle el subak balinés ni el manejo de
 * los pastizales de Benguet.
 *
 * `chao_phraya_deciduo` es la única ficha del catálogo con `especies: []`. No es
 * un olvido: la ficha de WWF de IM0108 no nombra ninguna planta con nombre
 * científico, y las dos vistas ya esconden la sección cuando está vacía. Poner
 * una especie deducida de las ecorregiones vecinas sería inventar.
 *
 * ESCRITO A MANO desde `_research/ecosistemas-saberes-indomalaya/` (26/09/2026).
 */

import type { BiomaFicha } from './biomaTipos';

/** Cartografías y referencias compartidas por casi todas las fichas. */
const RESOLVE = { label: 'Dinerstein et al. 2017 — RESOLVE Ecoregions 2017 (polígonos)', url: 'https://storage.googleapis.com/teow2016/Ecoregions2017.zip' };
const HWSD = { label: 'FAO/IIASA — Harmonized World Soil Database v2.0 (2023), clases WRB ponderadas por SHARE dentro del polígono', url: 'https://www.fao.org/soils-portal/data-hub/soil-maps-and-databases/harmonized-world-soil-database-v20/en/' };
const SOILGRIDS = { label: 'ISRIC — SoilGrids WRB MostProbable (~250 m), muestreado dentro del polígono', url: 'https://files.isric.org/soilgrids/latest/data/wrb/' };
const HENGL = { label: 'Hengl et al. 2017 — SoilGrids250m, PLoS ONE, doi:10.1371/journal.pone.0169748 (precisión y sesgos del mapa WRB)', url: 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0169748' };
const WRB = { label: 'IUSS Working Group WRB 2022 — World Reference Base for Soil Resources, 4.ª ed.', url: 'https://files.isric.org/public/documents/WRB_fourth_edition_2022-12-18.pdf' };
const FAO_SUELOS = { label: 'FAO 2001 — Lecture notes on the major soils of the world (Nitisols y Acrisols)', url: 'https://www.fao.org/docrep/003/y1899e/y1899e08a.htm' };
const PEATMAP = { label: 'Xu, Morris, Liu y Holden 2018 — PEATMAP, Catena, doi:10.1016/j.catena.2017.09.010 (datos doi:10.5518/252)', url: 'https://archive.researchdata.leeds.ac.uk/251/' };
const HOOIJER = { label: 'Hooijer et al. 2012 — Subsidence and carbon loss in drained tropical peatlands, Biogeosciences 9:1053', url: 'https://bg.copernicus.org/articles/9/1053/2012/' };
const RONDA = { label: 'Ronda 2005 — Soil, water and climatic resources of the Philippines, JIRCAS Int. Symp. Series 13:41-52', url: 'https://www.jircas.go.jp/sites/default/files/publication/intlsymp/intlsymp-13_41-52.pdf' };
const SUKARMAN = { label: 'Sukarman, Dariah y Suratman 2020 — Tanah vulkanik di lahan kering berlereng, J. Penelitian dan Pengembangan Pertanian 39(1):21-34', url: 'https://www.academia.edu/105632055/TANAH_VULKANIK_DI_LAHAN_KERING_BERLERENG_DAN_POTENSINYA_UNTUK_PERTANIAN_DI_INDONESIA_Volcanic_Soils_in_Sloping_Dry_Land_and_Its_Potential_for_Agriculture_in_Indonesia' };
const SUPRAYOGO = { label: 'Suprayogo et al. 2020 — Infiltration-friendly land uses, cuenca del Rejoso, Java oriental, HESSD doi:10.5194/hess-2020-2', url: 'https://hess.copernicus.org/preprints/hess-2020-2/' };
const WIDDOWSON = { label: 'Widdowson y Cox 1996 — Uplift and erosional history of the Deccan Traps: evidence from laterites, EPSL 137:57-69', url: 'https://www.sciencedirect.com/science/article/abs/pii/0012821X9500211T' };
const INDRARATNE = { label: 'Indraratne 2020 — Soil mineralogy of Sri Lanka, en Mapa (ed.) The Soils of Sri Lanka, Springer doi:10.1007/978-3-030-44144-9_4', url: 'https://link.springer.com/chapter/10.1007/978-3-030-44144-9_4' };
const CHAKRABORTY = { label: 'Chakraborty, Mukherjee y Ahmed 2015 — A review of groundwater arsenic in the Bengal Basin, Current Pollution Reports 1:220-247', url: 'https://link.springer.com/article/10.1007/s40726-015-0022-0' };
const POWO_PIMIENTA = { label: 'Kew POWO — Piper nigrum, área nativa', url: 'https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:682369-1' };
const POWO_CARDAMOMO = { label: 'Kew POWO — Elettaria cardamomum, área nativa', url: 'https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:796556-1/general-information' };

// ─── Sólo las usa la ficha del Decán central (290) ───────────────────────────

const ONE_EARTH_290 = { label: 'One Earth — ecorregión 290 «Central Deccan Plateau Dry Deciduous Forests»', url: 'https://www.oneearth.org/ecoregions/central-deccan-plateau-dry-deciduous-forests/' };
const FAO_VERTISOLES = { label: 'FAO — Developing, testing and transferring improved Vertisol technology: the Indian experience', url: 'https://www.fao.org/4/x5493e/x5493e03.htm' };
const FAO_FORMACIONES = { label: 'FAO — Diversity of woody-vegetation formations (las series de bosque seco de la India)', url: 'https://www.fao.org/4/w4442E/w4442e05.htm' };

/** Aviso de alcance, porque de estos dos se leyó **el resumen y no el trabajo**.
 *  Los dos son de Elsevier y están detrás de pago; la copia de acceso abierto de
 *  Pathak en el repositorio del ICRISAT devuelve 403 incluso desde un navegador
 *  real. Todos los números que esta ficha les atribuye —los coeficientes de
 *  escorrentía, la reducción por camellón— están textualmente en el resumen
 *  publicado, y ninguno sale del cuerpo del trabajo. Si alguien consigue los PDF,
 *  lo que falta es el reparto del suelo perdido en toneladas por hectárea. */
const PATHAK = { label: 'Pathak, Sudi, Wani y Sahrawat 2013 — Hydrological behavior of Alfisols and Vertisols in the semi-arid zone, Agricultural Water Management 118:12-21, doi:10.1016/j.agwat.2012.11.012 (leído el resumen)', url: 'https://doi.org/10.1016/j.agwat.2012.11.012' };
const GARG = { label: 'Garg et al. 2021 — Impact of raised beds on surface runoff and soil loss in Alfisols and Vertisols, Catena 211:105972, doi:10.1016/j.catena.2021.105972 (leído el resumen)', url: 'https://doi.org/10.1016/j.catena.2021.105972' };

/** Universidad agraria de Maharashtra, citada **sólo** por el repertorio de
 *  cultivos del Decán semiárido. Su jurisdicción son los diez distritos de
 *  Maharashtra occidental —Nashik, Ahmednagar, Pune, Solapur, Satara, Sangli y
 *  demás—, que están a sotavento de los Ghats y caen en la ecorregión vecina de
 *  matorral espinoso (IM1301), no en ésta. La entrega de GPT la usó como fuente
 *  de los cultivos sin notar eso. La lista sobrevive porque el documento de la
 *  FAO cubre la zona que sí corresponde, de Hyderabad a Gwalior y Maharashtra y
 *  el norte de Karnataka, y nombra los mismos cultivos. */
const MPKV = { label: 'Mahatma Phule Krishi Vidyapeeth — zonas agroclimáticas y cultivos de Maharashtra occidental', url: 'https://mpkv.ac.in/Home/MpkvAtaGlance' };
const ONE_EARTH_297 = { label: 'One Earth — ecorregión 297 «North Deccan Dry Deciduous Forests»', url: 'https://www.oneearth.org/ecoregions/north-deccan-dry-deciduous-forests/' };
const ONE_EARTH_298 = { label: 'One Earth — ecorregión 298 «South Deccan Plateau Dry Deciduous Forests»', url: 'https://www.oneearth.org/ecoregions/south-deccan-plateau-dry-deciduous-forests/' };

// ─── Las tres del 05/11/2026: manglar de Sundarbans, Irrawaddy y matorral del Decán ──

const ONE_EARTH_323 = { label: 'One Earth — ecorregión 323 «Sundarbans Mangroves»', url: 'https://www.oneearth.org/ecoregions/sundarbans-mangroves/' };
const ONE_EARTH_294 = { label: 'One Earth — ecorregión 294 «Irrawaddy Dry Forests»', url: 'https://www.oneearth.org/ecoregions/irrawaddy-dry-forests/' };
const ONE_EARTH_280 = { label: 'One Earth — ecorregión 280 «Sumatran Peat Swamp Forests»', url: 'https://www.oneearth.org/ecoregions/sumatran-peat-swamp-forests/' };
const ONE_EARTH_286 = { label: 'One Earth — ecorregión 286 «Tonle Sap-Mekong Peat Swamp Forests»', url: 'https://www.oneearth.org/ecoregions/tonle-sap-mekong-peat-swamp-forests/' };
const IMANUDIN = { label: 'Imanudin et al. 2024 — Variability of hydro-physical properties in drained peat soil (Perigi, Ogan Komering Ilir, Sumatra del Sur): napa a 45-47 cm en agosto-septiembre, pasado el límite crítico de 40 cm del reglamento indonesio PP 57/2016', url: 'https://repository.unsri.ac.id/161155/' };
const CAHYA = { label: 'Cahya, Suwignyo et al. 2022 — Increasing rice productivity in degraded peatlands, BIOVALENTIA 8(1):69: el sonor tradicional promedia 1-2 t/ha y el ensayo de Jajar Legowo llegó a 3,7', url: 'https://www.cifor-icraf.org/publications/pdf_files/articles/ABaral2206.pdf' };
const KEW_MELALEUCA = { label: 'Plants of the World Online (Kew) — Melaleuca cajuputi Maton & Sm. ex R.Powell, nativa de Camboya y Vietnam', url: 'https://powo.science.kew.org/taxon/115161-3' };
const TONLE_SAP_ARROZ = { label: 'Rice production in Tonle Sap floodplains in response to anthropogenic changes (Univ. of Washington): el arroz de recesión se siembra tras la bajante', url: 'https://digital.lib.washington.edu/bitstreams/bd67d9e6-9d59-485d-959b-93a2718c389f/download' };
const ONE_EARTH_315 = { label: 'One Earth — ecorregión 315 «Deccan Thorn Scrub Forests»', url: 'https://www.oneearth.org/ecoregions/deccan-thorn-scrub-forests/' };

// ─── Las dos turberas del 12/11/2026: Borneo (221) y la península malaya (264) ──

const ONE_EARTH_221 = { label: 'One Earth — ecorregión 221 «Borneo Peat Swamp Forests»', url: 'https://www.oneearth.org/ecoregions/borneo-peat-swamp-forests/' };
const ONE_EARTH_264 = { label: 'One Earth — ecorregión 264 «Peninsular Malaysian Peat Swamp Forests»', url: 'https://www.oneearth.org/ecoregions/peninsular-malaysian-peat-swamp-forests/' };

/** El espesor de la turba del Kapuas, medido en los dos extremos del gradiente
 *  y los dos adentro del polígono 221: la cúpula al sur de Putussibau y el
 *  delta en Rasau Jaya. Acceso abierto CC BY. De acá salen los 18 m barrenados,
 *  la media modelada de 5,16 ± 2,66 m sobre 3.833 km², los 2.790 ± 1.440 Mg C/ha
 *  y el dato de agua que importa para diseño: la mitad de la cúpula está debajo
 *  del lecho del río y el humedal guarda el doble de agua que el propio Kapuas. */
const RUWAIMANA = { label: 'Ruwaimana, Anshari, Silva y Gavin 2020 — The oldest extant tropical peatland in the world: a major carbon reservoir for at least 47 000 years, Environmental Research Letters 15:114027, doi:10.1088/1748-9326/abb853 (acceso abierto, CC BY)', url: 'https://doi.org/10.1088/1748-9326/abb853' };

/** Quince perfiles de Kalimantan con 55 fechados: de acá salen el promedio de
 *  444 cm en turba costera contra 774 cm en la interior y —lo que más sirve— el
 *  rango de napa, 5-50 cm en turba sin drenar y 60-90 cm en turba drenada.
 *  Aviso de alcance: de sus cuatro regiones, Sentarum y el lago Siran caen
 *  adentro del 221 y Mempawah no, así que el promedio mezcla adentro y afuera. */
const ANSHARI_2026 = { label: 'Anshari, Ruwaimana, Ritonga, Gangga, Loisel, Galego-Sala, van der Kaars y Novita 2026 — Peatland inception and development across Kalimantan, Indonesia, Scientific Reports 16:5496, doi:10.1038/s41598-026-35152-x (acceso abierto, CC BY)', url: 'https://doi.org/10.1038/s41598-026-35152-x' };

/** Fisonomía de una cúpula intacta del noroeste de Borneo con LiDAR aéreo. Está
 *  **cerrado**: todo lo que la ficha le atribuye está en el resumen publicado y
 *  nada sale del cuerpo del trabajo. Lo que falta, si alguien consigue el PDF,
 *  es qué cúpula es: el resumen dice «noroeste de Borneo» y no la nombra, así
 *  que no se puede resolver el sitio contra el polígono. */
const NGUYEN_LIDAR = { label: 'Nguyen, Hutyra, Hardiman y Raciti 2016 — Characterizing forest structure variations across an intact tropical peat dome using field samplings and airborne LiDAR, Ecological Applications 26(2):587-601, doi:10.1890/15-0017 (leído el resumen)', url: 'https://doi.org/10.1890/15-0017' };

/** La única evidencia de rendimiento paludícola que está medida **adentro** de
 *  una de estas ecorregiones: los tres jardines de sagú están en Mukah,
 *  Sarawak, y Mukah da 221. Acceso libre en J-Stage. Las tres condiciones son
 *  turba profunda con drenaje mínimo, turba profunda con inundación estacional
 *  y turba somera sin drenaje, y la tercera es la que funciona. */
const JONG_SAGU = { label: 'Jong, Watanabe, Hirabayashi, Matsuda, Purwanto, Kakuda y Ando 2006 — Growth performance of sago palms (Metroxylon sagu Rottb.) in peat of different depth and soil water table, Sago Palm 14(2):59-64, doi:10.57418/sagopalm.14.2_59 (acceso libre)', url: 'https://doi.org/10.57418/sagopalm.14.2_59' };

/** Jelutong. El estudio es de Jambi y Jambi da **280**, la turbera de Sumatra,
 *  no éstas: acá se cita por dos cosas que sí valen para los dos polígonos, que
 *  el área nativa de la especie cubre la península malaya, Sumatra y Borneo, y
 *  que la plantación creció bien sobre turba sin drenar. Y por una tercera que
 *  es la advertencia: de las 1.769 ha plantadas quedan unas 200, porque el fuego
 *  se llevó 7.000 ha de la concesión en 1997 y otras 5.000 en 2003. */
const TATA_JELUTONG = { label: 'Tata, van Noordwijk, Jasnari y Widayati 2016 — Domestication of Dyera polyphylla (Miq.) Steenis in peatland agroforestry systems in Jambi, Indonesia, Agroforestry Systems 90(4):617-630, doi:10.1007/s10457-015-9837-3 (acceso abierto, CC BY)', url: 'https://doi.org/10.1007/s10457-015-9837-3' };

/** Nomenclatura. Se cita GBIF y no Kew POWO porque POWO contesta **403 incluso
 *  desde un navegador real** —se probó el 12/11/2026, con la verificación
 *  anti-bot de Cloudflare—, y un link que no abre no sirve de cita aunque sea el
 *  canónico. Acá se verificaron seis binomios contra el backbone de GBIF y dos
 *  nombres vulgares contra ITIS. */
const GBIF_NOMBRES = { label: 'GBIF Secretariat 2023 — GBIF Backbone Taxonomy, doi:10.15468/39omei (nombres aceptados y sinónimos)', url: 'https://www.gbif.org/dataset/d7dddbf4-2cf0-4f39-9b2a-bb099caae36c' };

/** El informe que contesta cuánto del polígono 323 es manglar y cuánto es isla
 *  habitada con terraplén. **La entrega lo citó por una URL que no lo sirve**:
 *  `sundarbanaffairswb.in` devuelve 200 con la página de error del propio
 *  Departamento de Asuntos del Sundarban. Las cifras que la entrega le
 *  atribuía son correctas y están textualmente acá, en el documento real del
 *  repositorio del Banco Mundial, que es el que se cita. */
const BANCO_MUNDIAL_SUNDARBANS = { label: 'Banco Mundial 2014 — Building Resilience for Sustainable Development of the Sundarbans: Strategy Report (informe 88061-IN)', url: 'https://documents.worldbank.org/curated/en/879351468259748207/pdf/880610REVISED00ns000Strategy0Report.pdf' };
const UNESCO_SUNDARBANS = { label: 'UNESCO MAB — reserva de biosfera Sunderban (lado indio)', url: 'https://www.unesco.org/en/mab/sunderban' };
/** Programa de Humedales de la UICN, volumen del lado de Bangladesh, que es el
 *  60 % del bosque de la ecorregión. De acá sale el presupuesto de
 *  precipitación menos evapotranspiración, que es el dato que decide el diseño.
 *  Aviso: la entrega lo citaba como respaldo del modificador de pasturas y el
 *  volumen **no habla de pastoreo de ganado**; su única mención de pastoreo es
 *  a los ciervos. */
const UICN_SUNDARBANS = { label: 'Hussain y Acharya (eds.) — Mangroves of the Sundarbans, vol. 2: Bangladesh, Programa de Humedales de la UICN', url: 'https://portals.iucn.org/library/sites/library/files/documents/WTL-013-v2.pdf' };

/** Perfil hídrico nacional de la FAO para Myanmar: de acá sale el rango de
 *  lluvia de la zona seca —que el encargo pedía y la entrega declaró no
 *  encontrado, estando en este mismo PDF que la entrega citó dos veces— y la
 *  historia del riego desde el siglo XI. */
const FAO_MYANMAR_AGUA = { label: 'FAO 2012 — Irrigation in Southern and Eastern Asia in figures, AQUASTAT Water Report 37, capítulo de Myanmar', url: 'https://www.fao.org/fileadmin/user_upload/faowater/docs/WR_37_web.pdf' };
const FAO_MYANMAR_SUELOS = { label: 'FAO — Improving plant nutrient management for better farmer livelihoods (tabla nacional de tipos de suelo de Myanmar y cultivos adecuados)', url: 'https://www.fao.org/4/ag120e/ag120e15.htm' };

/** Agencia de aguas subterráneas de Maharashtra, ficha del distrito de Dhule,
 *  que está adentro del polígono 315: de acá salen el reparto de basalto, los
 *  niveles de agua por división geológica y los 36 phad bandharas. */
const GSDA_DHULE = { label: 'GSDA Maharashtra — ficha hidrogeológica del distrito de Dhule', url: 'https://gsda.maharashtra.gov.in/en-dhule-district/' };
/** Comisionado divisional de Nashik, mismo distrito: da 674 mm donde el GSDA da
 *  512, y es la que trae el gradiente interno y los cultivos. */
const DIVCOM_NASHIK = { label: 'Comisionado Divisional de Nashik, Gobierno de Maharashtra — perfil del distrito de Dhule', url: 'https://divcomnashik.maharashtra.gov.in/en/dhule-district-2/' };
/** Catenas de Sambalpur y Koraput, Odisha: adentro del polígono 297. Licencia
 *  de la Sociedad India de Ciencia del Suelo: uso académico y no comercial del
 *  material, así que de acá sale el hallazgo citado y nunca el texto ni la tabla. */
const BANDYOPADHYAY = { label: 'Bandyopadhyay et al. 2025 — Quantitative pedogenesis to assess soil maturity vis-à-vis impact on soil quality in Easternghats of Odisha, J. Indian Soc. Soil Sci. 73(2):129-147', url: 'https://epubs.icar.org.in/index.php/JISSS/article/view/172097' };
const KALAM = { label: 'Kalam et al. 2025 — Tropical dry woodland loss in India since 1880 and its relation to current megafauna distributions, Ecological Applications 35(5):e70054, doi:10.1002/eap.70054 (acceso abierto CC-BY)', url: 'https://edepot.wur.nl/698015' };

/** Ficha de ecorregión de WWF, que es la descripción publicada del polígono.
 *  Aviso de calidad: esas páginas se autodeclaran «no longer being updated…
 *  for historical reference only». Se usan igual porque describen los mismos
 *  polígonos que la app consulta, pero conviene saberlo antes de citarlas
 *  como estado actual de nada. */
const wwf = (im: string, nombre: string) => ({
  label: `WWF — ecorregión ${im.toUpperCase()} «${nombre}»`,
  url: `https://ecoregions.worldwildlife.org/ecoregions/${im}`,
});

export const BIOMAS_REGIONALES_INDOMALAYA: Record<string, BiomaFicha> = {
  // ─────────────────────────────────────────────────────────────────────────
  // India — los Ghats occidentales
  // ─────────────────────────────────────────────────────────────────────────

  // IN · ECO_ID 253 · bioma 1 · confianza media
  ghats_norte_deciduo: {
    id: 'ghats_norte_deciduo',
    nombre: 'Bosques húmedos deciduos de los Ghats del norte',
    emoji: '🌳',
    color: '#6D8B3A',
    resumen: 'Franja de bosque húmedo deciduo que rodea las selvas montanas en el tramo norte de los Ghats occidentales, en Maharashtra y Karnataka: unos 48.000 km². Llueven entre 1.500 y 2.000 mm con 4 a 5 meses secos, la media anual es de 24 a 27 °C y tierra adentro la máxima pasa de 40 °C. Más de tres cuartos del hábitat natural fue desmontado o convertido.',
    vegetacion: 'Tecales (Tectona grandis) con Grewia tiliifolia, Lagerstroemia lanceolata, Dillenia pentagyna, Pterocarpus marsupium, Xylia xylocarpa, Adina cordifolia y palisandro (Dalbergia latifolia). Sobre la laterita el sotobosque típico es de Cleistanthus collinus, Holarrhena antidysenterica, Bauhinia racemosa y Kydia calycina. La pimienta negra, que se cultiva en toda la región, no es nativa de acá: POWO le da a Sri Lanka como área nativa única.',
    fauna: 'Tigre, elefante asiático, gaur, loris esbelto (Loris tardigradus) y oso bezudo. Más de 345 aves, entre ellas el cálao gris de Malabar (Ocyceros griseus) y el gran cálao (Buceros bicornis).',
    suelos: 'El sustrato es el basalto del Deccan. Sobre las mesetas residuales de la escarpa hay una coraza laterítica formada a partir de los basaltos de la Formación Panhala, y en la planicie del Konkan otra laterita más joven. HWSD v2 da Nitisols 59 % —de los suelos más productivos del trópico húmedo según FAO—, Plinthosols dístricos 12 % (la laterita), Luvisols crómicos 11 % y Vertisols 9 %; SoilGrids da Leptosols 29 %, Luvisols 29 % y Vertisols 25 %. Lo que manda en el diseño es la estacionalidad: 4 a 5 meses secos después de un monzón concentrado, y una infiltración que depende de si la coraza laterítica está intacta o rota.',
    saberes: [],
    especies: [
      'Teca (Tectona grandis)',
      'Palisandro de la India (Dalbergia latifolia)',
      'Vengai o kino de Malabar (Pterocarpus marsupium)',
      'Irul (Xylia xylocarpa)',
      'Cleistanthus collinus',
    ],
    cultivos: ['arroz', 'mijo', 'sorgo', 'mani', 'caupi', 'garbanzo', 'cana_azucar', 'algodon', 'sesamo', 'coco', 'granado', 'vetiver'],
    aptitud: [
      { uso: 'huerta', delta: -5, razon: 'Regla de acequia: el −25 del bioma se escala por la fracción de suelo con limitante severa, y acá esa fracción es chica. El suelo derivado de basalto es mayormente de base alta —Nitisols 59 %, más Luvisols y Vertisols en HWSD v2— y la laterita lixiviada es el 12 %; SoilGrids tampoco ve lixiviación importante. El texto del bioma exagera la limitación de fertilidad.' },
    ],
    fuentes: [wwf('im0134', 'North Western Ghats moist deciduous forests'), WIDDOWSON, HWSD, SOILGRIDS, HENGL, FAO_SUELOS, POWO_PIMIENTA, RESOLVE],
  },

  // IN · ECO_ID 254 · bioma 1 · confianza media
  ghats_norte_montano: {
    id: 'ghats_norte_montano',
    nombre: 'Selvas montanas de los Ghats del norte',
    emoji: '⛰️',
    color: '#2E5D34',
    resumen: 'Selvas siempreverdes del tramo norte de los Ghats occidentales: unos 30.800 km². La cordillera sube de golpe desde casi el nivel del mar por el oeste y baja a unos 500 m sobre la meseta del Deccan por el este. Las laderas de barlovento reciben más de 2.500 mm y hacia el este hay sombra de lluvia. Queda un 42 % del hábitat y un 13 % está protegido.',
    vegetacion: 'Dipterocarpáceas, Clusiáceas, Anacardiáceas, Sapotáceas y Meliáceas, con Lauráceas por encima de 900 m. Aparecen Syzygium spp., Rhododendron nilgiricum, Myristica malabarica y Diospyros sylvatica.',
    fauna: 'Murciélago de cola libre de Wroughton (Otomops wroughtoni), civeta de Malabar (Viverra civettina), tigre y elefante. Más de 325 aves, entre ellas la paloma de los Nilgiri (Columba elphinstonii) y el cálao gris de Malabar.',
    suelos: 'Las cumbres y mesetas de la escarpa conservan una coraza laterítica desarrollada sobre los basaltos de la Formación Panhala, la más joven de la secuencia del Deccan. HWSD v2 da Plinthosols dístricos 43 % —esa laterita— y Nitisols 50 %; SoilGrids da Cambisols 28 %, Luvisols 25 %, Acrisols 21 % y Leptosols 19 %. La minería de hierro y manganeso de la región está ligada a estas mismas lateritas, lo que da una pista de dónde la coraza está expuesta.',
    saberes: [],
    especies: [
      'Nuez moscada silvestre de Malabar (Myristica malabarica)',
      'Rododendro de los Nilgiri (Rhododendron nilgiricum)',
      'Ébano de montaña (Diospyros sylvatica)',
      'Jambos (Syzygium spp.)',
    ],
    cultivos: ['arroz', 'cafe', 'mijo', 'batata', 'taro', 'zapallo_milpa', 'poroto_trepador', 'mani', 'vetiver', 'pasto_elefante'],
    aptitud: [
      { uso: 'huerta', delta: -10, razon: 'Regla de acequia: el perfil es de coraza laterítica sobre basalto y esa laterita sí es pobre y lixiviada, pero no domina el polígono. HWSD v2 da 43 % de Plinthosols dístricos contra 50 % de Nitisols, y SoilGrids 21 % de Acrisols. Queda a mitad de camino del −25 del bioma.' },
    ],
    fuentes: [wwf('im0135', 'North Western Ghats montane rain forests'), WIDDOWSON, HWSD, SOILGRIDS, HENGL, RESOLVE],
  },

  // IN · ECO_ID 270 · bioma 1 · confianza media
  ghats_sur_deciduo: {
    id: 'ghats_sur_deciduo',
    nombre: 'Bosques húmedos deciduos de los Ghats del sur',
    emoji: '🐘',
    color: '#7CB342',
    resumen: 'Franja de bosque húmedo deciduo que rodea las selvas montanas del tramo sur de los Ghats, en Kerala y Tamil Nadu: unos 23.700 km². Por la sombra de lluvia, algunos sectores de sotavento reciben menos de un quinto de los 3.000 mm o más que caen arriba. Queda alrededor de un cuarto del hábitat.',
    vegetacion: 'Adina cordifolia, Albizia odoratissima, A. procera, Alstonia scholaris, Bombax ceiba, cedro rojo (Toona ciliata), palisandro (Dalbergia latifolia), Lagerstroemia, Pterocarpus marsupium, teca, Terminalia y Xylia xylocarpa.',
    fauna: 'Tigre, elefante, gaur, langur de los Nilgiri (Semnopithecus johnii), oso bezudo, cuón y loris esbelto. Hay 322 aves, entre ellas el florícano menor.',
    suelos: 'El basamento es precámbrico, del terreno granulítico del sur de la India: charnockitas y gneises. Los suelos lateríticos de referencia de Kerala son Ultisols de pH y CIC bajos, con arcillas 1:1 y gibbsita. HWSD v2 da Nitisols 40 %, Luvisols crómicos 31 %, Plinthosols 16 % y Umbrisols ácricos 7 %; SoilGrids da Cambisols 43 %, Acrisols 20 % y Luvisols 18 %. En los sectores de sotavento el limitante es el agua antes que el suelo, y la amenaza principal que registra WWF es el pastoreo con quema.',
    saberes: [],
    especies: [
      'Cedro rojo de la India (Toona ciliata)',
      'Árbol del diablo (Alstonia scholaris)',
      'Teca (Tectona grandis)',
      'Ceibo de la India (Bombax ceiba)',
      'Palisandro de la India (Dalbergia latifolia)',
    ],
    cultivos: ['arroz', 'coco', 'mijo', 'mani', 'caupi', 'sesamo', 'cana_azucar', 'platano', 'batata', 'chile_seco', 'vetiver'],
    aptitud: [
      { uso: 'huerta', delta: -5, razon: 'Regla de acequia: mosaico sobre charnockita y gneis, con suelo dominante de base alta. HWSD v2 da Nitisols y Luvisols con 24 % de laterita y Umbrisols ácricos, y SoilGrids da 23 % de Acrisols: las dos bases coinciden en una fracción lixiviada chica. El −25 del bioma no describe esta ficha.' },
    ],
    fuentes: [
      wwf('im0150', 'South Western Ghats moist deciduous forests'),
      { label: 'Chandran et al. 2005 — Lateritic soils of Kerala: mineralogy, genesis and taxonomy, Aust. J. Soil Res. 43(7):839-852', url: 'https://connectsci.au/sr/article-abstract/43/7/839/45941/Lateritic-soils-of-Kerala-India-their-mineralogy?redirectedFrom=fulltext' },
      { label: 'Raith et al. 1990 — The granulite terrane of the Nilgiri Hills (Southern India), Springer doi:10.1007/978-94-009-2055-2_17', url: 'https://link.springer.com/content/pdf/10.1007/978-94-009-2055-2_17.pdf' },
      HWSD, SOILGRIDS, HENGL, RESOLVE,
    ],
  },

  // IN · ECO_ID 271 · bioma 1 · confianza baja · sin modificador
  ghats_sur_montano: {
    id: 'ghats_sur_montano',
    nombre: 'Selvas montanas y sholas de los Ghats del sur',
    emoji: '☁️',
    color: '#1B5E20',
    resumen: 'Selvas montanas por encima de 1.000 m en el tramo sur de los Ghats, con varios picos de más de 2.000 m: unos 22.500 km². El monzón del suroeste deja más de 2.500 mm, y en algunos sectores más de 8.000 mm al año. Casi dos tercios del bosque natural fue desmontado, sobre todo para té, café, cardamomo y teca.',
    vegetacion: 'Selva montana siempreverde con Cullenia exarillata, Mesua ferrea, Palaquium ellipticum y Podocarpus wallichianus. Entre 1.900 y 2.220 m está el complejo shola-pastizal: manchones de bosque —Pygeum gardneri, Schefflera racemosa, Rhododendron nilgiricum— en una matriz de pastizal de Chrysopogon zeylanicus y Themeda tremula. El cardamomo es nativo de acá y se cultiva bajo el dosel.',
    fauna: 'Tigre, elefante, tahr de los Nilgiri (Nilgiritragus hylocrius) y macaco de cola de león (Macaca silenus). Tiene tres aves endémicas estrictas, entre ellas el bisbita de los Nilgiri (Anthus nilghiriensis).',
    suelos: 'El basamento son granulitas enderbíticas y charnockitas arcaicas: el macizo de los Nilgiri expone corteza inferior metamorfizada hace unos 2.500 millones de años. HWSD v2 da Plinthosols dístricos 43 %, Nitisols 41 %, Umbrisols ácricos 11 % y Luvisols 6 %; SoilGrids da Cambisols 68 %, Acrisols 21 % y Luvisols 9 %. Las dos bases discrepan por más de 30 puntos en la fracción lixiviada, así que esta ficha no corrige el modificador del bioma: hace falta la cartografía de NBSS&LUP de los distritos de montaña. El dato que sí sirve para diseñar es hídrico: el mosaico shola-pastizal funciona como esponja de cabecera.',
    saberes: [],
    especies: [
      'Cardamomo (Elettaria cardamomum)',
      'Nahor (Mesua ferrea)',
      'Cullenia exarillata',
      'Podocarpo (Podocarpus wallichianus)',
      'Rododendro de los Nilgiri (Rhododendron nilgiricum)',
    ],
    cultivos: ['cafe', 'taro', 'batata', 'zapallo_milpa', 'papa', 'poroto_trepador', 'platano', 'vetiver', 'trebol_blanco'],
    fuentes: [
      wwf('im0151', 'South Western Ghats montane rain forests'),
      { label: 'Raith et al. 1990 — The granulite terrane of the Nilgiri Hills (Southern India), Springer doi:10.1007/978-94-009-2055-2_17', url: 'https://link.springer.com/content/pdf/10.1007/978-94-009-2055-2_17.pdf' },
      { label: 'Kerala Soil Survey — Soils of Kerala, agrupamiento taxonómico', url: 'https://www.keralasoils.gov.in/en/taxanomic-grouping-soils' },
      HWSD, SOILGRIDS, HENGL, POWO_CARDAMOMO, RESOLVE,
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Sri Lanka — las tres zonas de la isla
  // ─────────────────────────────────────────────────────────────────────────

  // LK · ECO_ID 274 · bioma 1 · confianza media
  sri_lanka_humedo_bajo: {
    id: 'sri_lanka_humedo_bajo',
    nombre: 'Selvas bajas de la zona húmeda de Sri Lanka',
    emoji: '🐸',
    color: '#2E7D32',
    resumen: 'Selvas por debajo de 1.000 m en el cuarto suroeste de Sri Lanka: unos 12.500 km². El monzón del suroeste, extendido por los períodos intermonzónicos, deja más de 5.000 mm, y la temperatura casi no varía en el año (27 a 30 °C). Queda alrededor del 8 % de la selva original. Tiene más de 250 ranas endémicas.',
    vegetacion: 'Selva de dipterocarpáceas con Dipterocarpus zeylanicus, D. hispidus, Shorea affinis, Vitex altissima, Mesua ferrea y Syzygium rubicundum. La pimienta negra tiene acá su única área nativa según POWO, aunque no se pudo verificar en qué zona de la isla crece silvestre.',
    fauna: 'Leopardo de Sri Lanka (Panthera pardus kotiya), elefante asiático, cucal de pico verde (Centropus chlororhynchos) y tordo silbador de Sri Lanka (Myophonus blighi).',
    suelos: 'WWF los describe como «podzólicos rojo-amarillos», que es la designación local de los suelos ácidos lixiviados. La zona húmeda tiene Ultisols, Inceptisols, Histosols y Entisols, con meteorización avanzada: caolinita y gibbsita, sin esmectitas. HWSD v2 da Acrisols 45 %, Plinthosols 16 %, Cambisols flúvicos 15 %, Umbrisols ácricos 12 % y Luvisols 9 %; SoilGrids da Acrisols 55 %, Cambisols 23 % y Ferralsols 19 %. Es uno de los pocos lugares del lote donde el −25 del bioma casi acierta, y el motor es la lluvia: más de 5.000 mm lavando el perfil.',
    saberes: [],
    especies: [
      'Hora (Dipterocarpus zeylanicus)',
      'Shorea affinis',
      'Na o palo de hierro (Mesua ferrea)',
      'Milla (Vitex altissima)',
      'Pimienta negra (Piper nigrum)',
    ],
    cultivos: ['arroz', 'coco', 'cacao', 'platano', 'taro', 'name', 'yuca', 'batata', 'caupi', 'arbol_pan', 'gliricidia', 'vetiver'],
    aptitud: [
      { uso: 'huerta', delta: -20, razon: 'Regla de acequia: acá el −25 del bioma casi acierta y el modificador apenas lo matiza. Tres fuentes coinciden —WWF con suelos podzólicos rojo-amarillos, HWSD v2 con 45 % de Acrisols y SoilGrids con 55 %, más laterita y Ferralsols—, y la mineralogía de caolinita y gibbsita confirma la meteorización avanzada. Queda −20 y no −25 por los Cambisols flúvicos de los valles, que no sufren esa limitación.' },
    ],
    fuentes: [wwf('im0154', 'Sri Lanka lowland rain forests'), INDRARATNE, HWSD, SOILGRIDS, HENGL, FAO_SUELOS, POWO_PIMIENTA, RESOLVE],
  },

  // LK · ECO_ID 275 · bioma 1 · confianza media
  sri_lanka_montano: {
    id: 'sri_lanka_montano',
    nombre: 'Selvas montanas de Sri Lanka',
    emoji: '🌫️',
    color: '#33691E',
    resumen: 'Selvas montanas y submontanas por encima de 1.000 m en el macizo central, con picos de más de 2.500 m, y en la cordillera de Knuckles: unos 3.100 km² en el polígono. Llueven de 2.500 a 5.000 mm, la mayor parte con el monzón del suroeste y un aporte del noreste entre diciembre y marzo. La temperatura baja unos 0,5 °C cada 100 m.',
    vegetacion: 'Dipterocarpus, Shorea gardneri, Calophyllum y Syzygium, con Rhododendron en el bosque nuboso de altura. El reemplazo por plantaciones de té es la amenaza principal.',
    fauna: 'Mamíferos endémicos como Srilankamys ohiensis y la musaraña Feroculus feroculus. Aves endémicas como el tordo silbador de Sri Lanka y el lorito colgante (Loriculus beryllinus). También vive el leopardo de Sri Lanka.',
    suelos: 'WWF dice que el tipo predominante son los suelos podzólicos rojo-amarillos, y la mineralogía de la zona húmeda confirma una meteorización avanzada. HWSD v2 da Acrisols 79 % y Luvisols crómicos 21 %. SoilGrids no ve lixiviación —Cambisols 73 %— pero predice 17 % de Andosols en una isla sin vulcanismo, así que acá esa base es poco confiable y desempata WWF. Es cabecera de la isla, en pendiente, con el té reemplazando bosque: la erosión es el problema que se agrava.',
    saberes: [],
    especies: [
      'Shorea gardneri',
      'Keena (Calophyllum spp.)',
      'Rododendro (Rhododendron sp.)',
      'Jambos (Syzygium spp.)',
    ],
    cultivos: ['cafe', 'papa', 'zapallo_milpa', 'cebolla', 'poroto_trepador', 'taro', 'batata', 'trebol_blanco', 'vetiver'],
    aptitud: [
      { uso: 'huerta', delta: -20, razon: 'Regla de acequia, con desempate por la fuente que nombra el suelo: WWF describe podzólicos rojo-amarillos y HWSD v2 da 79 % de Acrisols. SoilGrids daría 0, pero predice Andosols en una isla sin volcanes, lo que la descalifica acá. El −25 del bioma casi acierta; el matiz viene del 21 % de Luvisols.' },
    ],
    fuentes: [wwf('im0155', 'Sri Lanka montane rain forests'), INDRARATNE, HWSD, SOILGRIDS, HENGL, POWO_CARDAMOMO, RESOLVE],
  },

  // LK · ECO_ID 301 · bioma 2 (bosque tropical seco) · confianza baja
  // Sin modificador a propósito: el bioma ya penaliza la huerta en −10 por falta
  // de agua, que es justo lo que esta ficha dice que es el límite. Ver el
  // encabezado y el README del relevamiento.
  sri_lanka_zona_seca: {
    id: 'sri_lanka_zona_seca',
    nombre: 'Bosques secos siempreverdes de la zona seca de Sri Lanka',
    emoji: '🐘',
    color: '#A1887F',
    resumen: 'La mayor parte de Sri Lanka, salvo el cuarto suroeste, el macizo central y la península de Jaffna: unos 48.200 km². Es llana, con inselbergs y colinas aisladas; el punto más alto es Ritigala, con 766 m. Llueven de 1.500 a 2.000 mm con el monzón del noreste, de diciembre a marzo, y el resto del año es mayormente seco. La recorren numerosos reservorios antiguos que formaban parte de un extenso sistema de riego. Alrededor del 75 % está deforestado y un 17 % protegido.',
    vegetacion: 'Bosque seco siempreverde con Manilkara hexandra, Chloroxylon swietenia, Drypetes sepiaria, Limonia acidissima, Vitex altissima, Syzygium spp. y Chukrasia tabularis. Hay sabanas talawa con Terminalia y Pterocarpus marsupium, y pastizales villu con Cymbopogon y Themeda.',
    fauna: 'Elefante asiático —entre 2.500 y 4.000 individuos—, leopardo de Sri Lanka, oso bezudo y loris esbelto. Hay 270 aves, entre ellas la gallina de Sri Lanka (Gallus lafayettii) y el pelícano oriental (Pelecanus philippensis). En los reservorios viven cocodrilos de las marismas y marinos, y varanos acuáticos (Varanus salvator).',
    suelos: 'Acá la meteorización es menor que en la zona húmeda: caolinita, esmectita, vermiculita y mica, sin minerales muy meteorizados. Los «Reddish Brown Earths» de la zona seca se clasifican como Alfisols, y HWSD v2 lo confirma con Luvisols 76 %, de base alta, más Fluvisols éutricos 9 %. SoilGrids da 53 % de Acrisols, pero la mineralogía descrita no es la de un Ultisol. La fertilidad no es el límite acá: el agua sí, con una sola estación de lluvias. Los reservorios antiguos que recorren la zona son la infraestructura de cosecha de agua que responde a eso, y son el antecedente de diseño más útil de la región.',
    saberes: [],
    especies: [
      'Palu (Manilkara hexandra)',
      'Satinwood de Ceilán (Chloroxylon swietenia)',
      'Manzana de madera (Limonia acidissima)',
      'Hulanhik (Chukrasia tabularis)',
      'Gammalu (Pterocarpus marsupium)',
    ],
    cultivos: ['arroz', 'mijo', 'sorgo', 'sesamo', 'caupi', 'mani', 'coco', 'granado', 'batata', 'chile_seco', 'cebolla', 'vetiver', 'moringa'],
    fuentes: [
      wwf('im0212', 'Sri Lanka dry-zone dry evergreen forests'),
      INDRARATNE,
      { label: 'Dassanayake, De Silva y Mapa 2020 — Major soils of the Dry Zone and their classification, doi:10.1007/978-3-030-44144-9_5', url: 'https://link.springer.com/chapter/10.1007/978-3-030-44144-9_5' },
      { label: 'Mapa y Yapa 1992 — Gravel horizon in reddish brown earth soils (alfisols), Tropical Agriculturist 148:53-61 (registro AGRIS)', url: 'https://agris.fao.org/search/en/records/64722fc653aa8c896301c0e9' },
      HWSD, SOILGRIDS, HENGL, RESOLVE,
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // La llanura indogangética y el Brahmaputra
  // ─────────────────────────────────────────────────────────────────────────

  // IN, BT · ECO_ID 222 · bioma 1 · confianza baja · sin modificador
  valle_brahmaputra: {
    id: 'valle_brahmaputra',
    nombre: 'Bosques semisiempreverdes del valle del Brahmaputra',
    emoji: '🦏',
    color: '#2E7D32',
    resumen: 'Llanura aluvial del Brahmaputra, casi toda en Assam, con bordes en Arunachal Pradesh, Nagaland y las tierras bajas de Bután: unos 56.700 km². El monzón del suroeste entra encajonado entre el Himalaya y las colinas Mizo y descarga entre 1.500 y 3.000 mm. Queda alrededor de un cuarto del bosque y un 5 % está protegido.',
    vegetacion: 'Dosel de 20 a 30 m con Syzygium, Cinnamomum, Artocarpus, magnoliáceas, Terminalia myriocarpa, T. citrina, T. tomentosa, Tetrameles, Stereospermum y sal (Shorea robusta). En el sotobosque hay Phoebe, Machilus, Actinodaphne, Polyalthia, Mesua ferrea y bambúes (Dendrocalamus hamiltonii, Melocanna bambusoides).',
    fauna: '122 mamíferos, entre ellos el rinoceronte indio (Rhinoceros unicornis), el elefante asiático, el tigre, el jabalí pigmeo (Sus salvanius), la liebre híspida (Caprolagus hispidus), el langur dorado (Semnopithecus geei) y la pantera nebulosa. Más de 370 aves, y en el río el delfín del Ganges (Platanista gangetica).',
    suelos: 'Aluviones profundos del Brahmaputra y de afluentes como el Manas y el Subansiri. Los suelos de Assam son ácidos, de pH 4,5 a 5,8, en todas las zonas agroclimáticas salvo la de colinas. Las bases globales no coinciden en el grupo: HWSD v2 da Acrisols 71 %, Cambisols éutricos 17 % y Regosols dístricos 6 %, y SoilGrids da Cambisols 83 % con Fluvisols, Vertisols y Acrisols cerca del 4-5 % cada uno. La acidez medida no resuelve la diferencia, porque no dice si el perfil es un Acrisol lixiviado o un Cambisol dístrico aluvial, así que esta ficha no corrige el modificador del bioma. El agua pesa en las dos direcciones: unas 250.000 ha crónicamente inundables y, de diciembre a febrero, humedad de suelo muy baja que obliga a regar.',
    saberes: [],
    especies: [
      'Sal (Shorea robusta)',
      'Nahor o palo de hierro (Mesua ferrea)',
      'Hollock (Terminalia myriocarpa)',
      'Binong (Tetrameles nudiflora)',
      'Bambú (Dendrocalamus hamiltonii)',
    ],
    cultivos: ['arroz', 'colza', 'papa', 'cana_azucar', 'batata', 'taro', 'name', 'lenteja', 'sesamo', 'guandul', 'platano', 'vetiver'],
    fuentes: [
      wwf('im0105', 'Brahmaputra Valley semi-evergreen forests'),
      { label: 'Baishya et al. 2009 — Constraints and opportunities of crop diversification in Assam, Indian J. Agronomy 54(2):200-205', url: 'https://pub.isa-india.in/index.php/ija/article/view/4781' },
      HWSD, SOILGRIDS, HENGL, RESOLVE,
    ],
  },

  // IN, BD · ECO_ID 238 · bioma 1 · confianza media
  gangetica_inferior: {
    id: 'gangetica_inferior',
    nombre: 'Llanura gangética inferior',
    emoji: '🌾',
    color: '#9CCC65',
    resumen: 'Llanura baja del Ganges y el Brahmaputra en Bihar, Bengala Occidental, Assam, Uttar Pradesh, Odisha y la mayor parte de Bangladesh: unos 253.500 km². El monzón deja más de 3.500 mm entre junio y septiembre, y los ciclones del golfo de Bengala causan inundaciones extensas. Queda alrededor del 3 % bajo bosque natural: es una de las llanuras rurales más densamente poblarizadas del planeta.',
    vegetacion: 'Bombax ceiba, Albizia procera, Duabanga sonneratioides, Sterculia villosa, sal (Shorea robusta), Acacia catechu, sisu (Dalbergia sissoo) y Pterospermum acerifolium. Las especies adaptadas al fuego son Ziziphus mauritiana, Madhuca longifolia y Butea monosperma.',
    fauna: 'Tigre, rinoceronte indio, elefante asiático, gaur, oso bezudo (Melursus ursinus) y nutria lisa (Lutrogale perspicillata). Aves: florícano de Bengala (Houbaropsis bengalensis), florícano menor (Sypheotides indicus) y pigargo de Pallas (Haliaeetus leucoryphus).',
    suelos: 'Aluvión arcilloso de drenaje pobre y, en los bajos ribereños más estables pero inundables, suelos más arenosos con parches de arcilla. HWSD v2 da Gleysols 36 %, Cambisols 26 %, Fluvisols 16 % —mayormente calcáricos— y Luvisols 10 %; los lixiviados suman 7 % y la turba 1,5 %. SoilGrids coincide: Fluvisols 45 %, Cambisols 38 %, 6 % lixiviado. El límite acá no es la fertilidad, es el agua, y en un sentido que conviene decir antes de perforar: el acuífero de la cuenca de Bengala tiene arsénico geogénico. En Bangladesh hay entre 30 y 35 millones de personas expuestas a más de 50 µg/L, y desde los años setenta esa agua riega el arroz de estación seca, que es la principal vía dietaria donde el agua de bebida está limpia. Para la huerta de un predio conviene cosecha de lluvia y agua superficial antes que pozo.',
    saberes: [],
    especies: [
      'Ceibo de la India (Bombax ceiba)',
      'Sal (Shorea robusta)',
      'Sisu (Dalbergia sissoo)',
      'Mahua (Madhuca longifolia)',
      'Llama del bosque (Butea monosperma)',
    ],
    cultivos: ['arroz', 'colza', 'lenteja', 'cana_azucar', 'papa', 'batata', 'taro', 'name', 'mijo', 'sesamo', 'guandul', 'platano', 'cebolla', 'vetiver'],
    aptitud: [
      { uso: 'huerta', delta: 0, razon: 'Se cancela la penalización del bioma, con razón: es aluvión reciente y fértil, no suelo lixiviado. HWSD v2 y SoilGrids coinciden en Gleysols, Cambisols y Fluvisols con sólo 6-7 % lixiviado, así que la frase del bioma —«la fertilidad está en la biomasa viva y no en el suelo»— es falsa acá. Lo que sí limita es el agua: drenaje pobre, ciclones y arsénico geogénico en el acuífero, que van en el texto de suelos porque no son atributos de fertilidad.' },
    ],
    fuentes: [wwf('im0120', 'Lower Gangetic Plains moist deciduous forests'), CHAKRABORTY, HWSD, SOILGRIDS, HENGL, PEATMAP, RESOLVE],
  },

  // IN · ECO_ID 287 · bioma 1 · confianza media
  gangetica_superior: {
    id: 'gangetica_superior',
    nombre: 'Llanura gangética superior',
    emoji: '🌾',
    color: '#AFB42B',
    resumen: 'Curso superior del Ganges en Uttar Pradesh, Haryana y Bihar: unos 262.600 km². La lluvia viene del monzón del golfo de Bengala y decrece de este a oeste. Queda menos del 5 % del hábitat y menos del 1 % está protegido.',
    vegetacion: 'Sal (Shorea robusta) de 25 a 35 m, con Terminalia tomentosa, T. bellirica, Lagerstroemia parviflora, Adina cordifolia, Dillenia pentagyna, Stereospermum suaveolens y Ficus. Hay parches de pastizal con Saccharum spontaneum, S. narenga, S. bengalense y vetiver (Chrysopogon zizanioides).',
    fauna: 'Tigre, rinoceronte indio, elefante, gaur, barasinga (Rucervus duvaucelii), oso bezudo y antílope de cuatro cuernos (Tetracerus quadricornis). Aves: avutarda india (Ardeotis nigriceps), florícano menor, cálao gris indio (Ocyceros birostris) y cálao pío oriental (Anthracoceros albirostris). También el delfín del Ganges, el cocodrilo de las marismas (Crocodylus palustris) y el gavial.',
    suelos: 'Aluviones profundos depositados por el Ganges. HWSD v2 da Cambisols éutricos 50 %, Luvisols 37 % y Fluvisols calcáricos 5 %, sin suelos lixiviados, y SoilGrids coincide con Cambisols 93 %. Lo que ninguna de las dos bases registra a esta escala son los suelos sódicos («usar»), que sí son reales: de los 2,35 millones de ha salinas o sódicas de la llanura indogangética, 1,79 millones son sódicas, con pH de 8,5 a 10, PSI mayor a 15 y baja permeabilidad, y Uttar Pradesh tiene 1,37 millones de ha afectadas por sales. Sobre los 26 millones de ha de la ecorregión eso es menos del 7 %, pero en un predio concreto lo cambia todo: costra blanca, pH arriba de 8,5 o un suelo que no infiltra indican «usar», y ahí la huerta no arranca hasta la enmienda con 10 a 15 t/ha de yeso.',
    saberes: [],
    especies: [
      'Sal (Shorea robusta)',
      'Kans (Saccharum spontaneum)',
      'Vetiver (Chrysopogon zizanioides)',
      'Jarul (Lagerstroemia parviflora)',
      'Haldu (Haldina cordifolia)',
    ],
    cultivos: ['trigo', 'arroz', 'cana_azucar', 'colza', 'mijo', 'lenteja', 'garbanzo', 'papa', 'cebolla', 'sesamo', 'guandul', 'batata', 'vetiver'],
    aptitud: [
      { uso: 'huerta', delta: 0, razon: 'Se cancela la penalización del bioma, con razón: es aluvión gangético maduro y de base alta. HWSD v2 da 87 % entre Cambisols éutricos y Luvisols, sin ningún suelo lixiviado, y SoilGrids coincide. Los parches sódicos (usar) son el limitante real a escala de predio —y muy fuerte donde caen— pero son menos del 7 % del área y ninguna base los mapea acá: van como advertencia en el texto de suelos, no como número.' },
    ],
    fuentes: [
      wwf('im0166', 'Upper Gangetic Plains moist deciduous forests'),
      { label: 'Kumar y Sharma 2020 — Soil salinity and food security in India, Front. Sustain. Food Syst. doi:10.3389/fsufs.2020.533781', url: 'https://www.frontiersin.org/journals/sustainable-food-systems/articles/10.3389/fsufs.2020.533781/full' },
      HWSD, SOILGRIDS, HENGL, RESOLVE,
    ],
  },

  // BD, IN · ECO_ID 282 · bioma 1 · confianza baja
  pantanos_sundarbans: {
    id: 'pantanos_sundarbans',
    nombre: 'Pantanos salobres de los Sundarbans',
    emoji: '🐅',
    color: '#26A69A',
    resumen: 'Pantanos detrás del manglar de los Sundarbans, a caballo entre Bangladesh y Bengala Occidental: unos 14.500 km². El agua es apenas salobre y se vuelve dulce en la estación lluviosa, cuando las plumas del Ganges y el Brahmaputra empujan fuera la intrusión salina. Llueven más de 3.500 mm y los ciclones son frecuentes y devastadores. Sólo 130 km² están protegidos.',
    vegetacion: 'Heritiera fomes (sundri), Xylocarpus moluccensis, Bruguiera conjugata, Sonneratia apetala, Avicennia officinalis y Sonneratia caseolaris.',
    fauna: 'Tigre, leopardo, delfín del Ganges (Platanista gangetica) y gavial (Gavialis gangeticus).',
    suelos: 'Recibe aluvión cada año del Ganges y el Brahmaputra. HWSD v2 da Gleysols 59 %, Histosols 25 %, Fluvisols 6 %, Solonchaks 5 % y un 3,5 % de tiónicos; PEATMAP marca 7 % de turba y SoilGrids ve casi sólo Fluvisols (98 %). El riesgo que crece es hídrico y viene de aguas arriba: el desvío de caudal del Ganges en la represa de Farakka reduce el empuje de agua dulce que expulsa la cuña salina, así que la salinidad estacional es una variable que se mueve. A eso se suma el arsénico geogénico del acuífero del delta de Bengala, que hace preferible la cosecha de lluvia al pozo.',
    saberes: [],
    especies: [
      'Sundri (Heritiera fomes)',
      'Keora (Sonneratia apetala)',
      'Mangle negro (Avicennia officinalis)',
      'Pasur (Xylocarpus moluccensis)',
    ],
    cultivos: ['arroz', 'coco', 'batata', 'taro', 'caupi', 'sesamo', 'chile_seco', 'platano', 'vetiver'],
    aptitud: [
      { uso: 'huerta', delta: -5, razon: 'Regla de acequia: aluvión deltaico sin lixiviación —Gleysols y Fluvisols en las dos bases—, así que el −25 del bioma no aplica. Lo que queda negativo son las fracciones menores con limitante severa: Solonchaks 5 %, Gleysols tiónicos 3,5 % y turba 7 % según PEATMAP. La salinidad estacional sí limita, y no está en este número.' },
    ],
    fuentes: [wwf('im0162', 'Sundarbans freshwater swamp forests'), CHAKRABORTY, HWSD, SOILGRIDS, HENGL, PEATMAP, RESOLVE],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Indochina — Irrawaddy, Chao Phraya, Mekong y río Rojo
  // ─────────────────────────────────────────────────────────────────────────

  // MM · ECO_ID 234 · bioma 1 · confianza baja
  pantanos_irrawaddy: {
    id: 'pantanos_irrawaddy',
    nombre: 'Pantanos del delta del Irrawaddy',
    emoji: '🌊',
    color: '#00796B',
    resumen: 'Delta del Irrawaddy sobre el golfo de Bengala, con manglares y pantanos de agua dulce: unos 15.100 km², casi todo llano. Por el oeste lo limita la cordillera de Rakhine, que baja de 1.287 m al norte a 428 m al sur. No tiene áreas protegidas.',
    vegetacion: 'En el norte, teca, Xylia xylocarpa var. kerrii, Bombax malabaricum, Millettia pendula, Dalbergia kurzii, Spondias pinnata, Terminalia bellirica, T. tomentosa y Vitex. En el sur, Xylia, Bombax, Dalbergia kurzii, T. bellirica, Adina cordifolia y Spondias. El bambú Melocanna bambusoides es extenso, y también hay Bambusa tulda y Dendrocalamus longispathus.',
    fauna: 'Elefante asiático, sambar (Cervus unicolor), ciervo porcino (C. porcinus), jabalí, tigre, leopardo y cocodrilo marino (Crocodylus porosus). Es un paso importante de aves migratorias: chorlos, playeros, agujas, cigüeñas, garzas y patos.',
    suelos: 'Al oeste hay lutitas y rocas sedimentarias con suelos pardo amarillentos a gley, y al este suelos franco arenosos y calcáreos. HWSD v2 da Gleysols éutricos 93 %, con Solonchaks gleicos 3 % y Nitisols 3 %; SoilGrids da Fluvisols 81 % y Gleysols 11 %, y PEATMAP registra 8 % de turba. Es aluvión fértil: lo que manda en la huerta del delta es el anegamiento, y eso no entra en el número porque se resuelve con obra de agua —camellones y bordos—, no con enmienda.',
    saberes: [],
    especies: [
      'Pyinkado (Xylia xylocarpa var. kerrii)',
      'Palisandro de Birmania (Dalbergia kurzii)',
      'Ciruelo jobo de monte (Spondias pinnata)',
      'Teca (Tectona grandis)',
      'Bambú (Melocanna bambusoides)',
    ],
    cultivos: ['arroz', 'coco', 'platano', 'batata', 'taro', 'name', 'caupi', 'sesamo', 'chile_seco', 'vetiver'],
    aptitud: [
      { uso: 'huerta', delta: -5, razon: 'Regla de acequia: aluvión deltaico fértil y sin lixiviación —Gleysols éutricos 93 % en HWSD v2, Fluvisols 81 % en SoilGrids—, así que el −25 del bioma no aplica. Quedan −5 por los parches salinos (alrededor de 3 %) y la turba (8 % según PEATMAP). Atención: si el predio está en la llanura inundable, el límite real es el anegamiento y este número lo subestima.' },
    ],
    fuentes: [wwf('im0116', 'Irrawaddy freshwater swamp forests'), HWSD, SOILGRIDS, HENGL, PEATMAP, RESOLVE],
  },

  // MM · ECO_ID 235 · bioma 1 · confianza media
  irrawaddy_deciduo: {
    id: 'irrawaddy_deciduo',
    nombre: 'Bosques húmedos deciduos del Irrawaddy',
    emoji: '🌳',
    color: '#6D8B3A',
    resumen: 'Cuenca del Irrawaddy, cuencas del Bago Yoma y piedemonte del Rakhine Yoma: unos 138.000 km². Llueven más de 1.500 mm con períodos secos marcados. El bosque ocupa tierras bien drenadas, onduladas o de colina, de hasta 1.000 m: no es la llanura de inundación.',
    vegetacion: 'Teca (Tectona grandis), pyinkado (Xylia xylocarpa var. kerrii), Terminalia tomentosa, T. bellirica, T. pyrifolia, padauk (Pterocarpus macrocarpus) y Mitragyna rotundifolia. Bambúes: Bambusa polymorpha, Cephalostachyum pergracile y Dendrocalamus hamiltonii.',
    fauna: 'Elefante, tigre, gaur (Bos gaurus), sambar, oso malayo (Helarctos malayanus) y cuón. Unas 350 aves, entre ellas el casi endémico charlatán de garganta blanca (Turdoides gularis).',
    suelos: 'WWF los adscribe a la «serie Irrawaddian»: arenas fluviales con fósiles de vertebrados terrestres y acuáticos. HWSD v2 da un mosaico —Acrisols 31 %, Gleysols 17 %, Nitisols 13 %, Cambisols flúvicos 12 %, Luvisols crómicos 12 % y Vertisols 7 %—, o sea alrededor de 60 % no lixiviado; SoilGrids ve más Acrisols (56 %), Luvisols 15 % y Vertisols 9 %. Las dos quedan dentro de 5 puntos de corrección, así que el valor se propone.',
    saberes: [],
    especies: [
      'Teca (Tectona grandis)',
      'Pyinkado (Xylia xylocarpa var. kerrii)',
      'Padauk (Pterocarpus macrocarpus)',
      'Terminalia (Terminalia bellirica)',
      'Bambú (Cephalostachyum pergracile)',
    ],
    cultivos: ['arroz', 'mijo', 'sorgo', 'sesamo', 'mani', 'caupi', 'garbanzo', 'lenteja', 'cana_azucar', 'maiz_tropical', 'algodon', 'vetiver'],
    aptitud: [
      { uso: 'huerta', delta: -10, razon: 'Regla de acequia: mosaico con mayoría no lixiviada. HWSD v2 da 31 % de Acrisols contra Nitisols, Luvisols, Vertisols y Gleysols aluviales; SoilGrids da 56 % de Acrisols, que daría −15. El −25 del bioma exagera, pero la fracción ácida es real.' },
    ],
    fuentes: [wwf('im0117', 'Irrawaddy moist deciduous forests'), HWSD, SOILGRIDS, HENGL, RESOLVE],
  },

  // TH · ECO_ID 224 · bioma 1 · confianza baja
  pantanos_chao_phraya: {
    id: 'pantanos_chao_phraya',
    nombre: 'Pantanos del Chao Phraya',
    emoji: '🌾',
    color: '#558B2F',
    resumen: 'Llanura aluvial del Chao Phraya en el centro de Tailandia, unos 400 km de largo por 180 de ancho: alrededor de 38.900 km². Clima monzónico húmedo con unos 1.400 mm al año. La llanura central baja fue una gran bahía del mar de la China Meridional hace 6.000 a 8.000 años; la alta, a más de 20 m sobre el nivel del mar, nunca tuvo inundación mareal. Casi no queda vegetación original: la reemplazaron el arrozal, la ciudad, los camarones y las hortalizas.',
    vegetacion: 'Pantano boscoso con Dipterocarpus alatus y formaciones de Typha, Phragmites y Pandanus, que pasaban a manglar hacia la costa. Hoy es casi todo arrozal y área urbana.',
    fauna: 'Mamíferos endémicos: Niviventer hinpoon, Leopoldamys neilli e Hipposideros halophyllus. En el pasado vivían acá el tigre, el elefante y el rinoceronte de Java. Aves: cigüeña picoabierta asiática (Anastomus oscitans) y la golondrina de río de ojos blancos (Pseudochelidon sirintarae).',
    suelos: 'En la llanura central baja hay limos cuaternarios de 15 a 30 m sobre arcillas marinas blandas, y en esas arcillas se formó pirita a partir de raíces de manglar. El resultado es suelo sulfatado ácido: Tailandia tiene unos 8.800 km² concentrados en esta llanura de unos 36.000 km², con pH de campo de 4,6 a 5,1 que cae a 3,5-3,7 cuando el suelo se seca al aire. HWSD v2 da Gleysols 37 % —30 % tiónicos—, Acrisols gleicos 28 %, Fluvisols éutricos 22 % en los albardones y Vertisols 5 %; SoilGrids da Fluvisols 57 % y Gleysols 15 %, pero no distingue los tiónicos. La regla de diseño que sigue de esto es concreta y es la versión local de «el agua manda»: no bajar el nivel freático por debajo de la capa pirítica y no exponer material sulfídico en excavaciones, porque drenarlo o removerlo libera ácido sulfúrico.',
    saberes: [],
    especies: [
      'Yang (Dipterocarpus alatus)',
      'Totora (Typha sp.)',
      'Carrizo (Phragmites sp.)',
      'Pandanos (Pandanus spp.)',
    ],
    cultivos: ['arroz', 'coco', 'platano', 'cana_azucar', 'batata', 'taro', 'caupi', 'chile_seco', 'cebolla', 'vetiver'],
    aptitud: [
      { uso: 'huerta', delta: -10, razon: 'Regla de acequia: el −25 del bioma acierta en el signo y se equivoca en la causa. No es lixiviación: es suelo sulfatado ácido, 30 % de Gleysols tiónicos en HWSD v2 y alrededor de 24 % según el mapeo tailandés, con pH de 3,5 a 3,7 en seco. La fracción de Acrisols gleicos es discutida —28 % contra 5 %—, así que el total honesto queda entre −7 y −15. Drenar para hacer huerta oxida la pirita.' },
    ],
    fuentes: [
      wwf('im0107', 'Chao Phraya freshwater swamp forests'),
      { label: 'Janjirawuttikul, Umitsu y Vijarnsorn 2010 — Paleoenvironment of acid sulfate soil formation in the Lower Central Plain of Thailand, Res. J. Environ. Sci. 4(4):336-358', url: 'https://scialert.net/fulltext/?doi=rjes.2010.336.358' },
      HWSD, SOILGRIDS, HENGL, PEATMAP, RESOLVE,
    ],
  },

  // TH · ECO_ID 225 · bioma 1 · confianza media
  // Única ficha del catálogo con `especies: []`: WWF no nombra ninguna planta
  // con nombre científico para IM0108. Ver el encabezado.
  chao_phraya_deciduo: {
    id: 'chao_phraya_deciduo',
    nombre: 'Bosques deciduos de la llanura del Chao Phraya',
    emoji: '🍂',
    color: '#8D6E63',
    resumen: 'Mosaico de parches de bosque húmedo deciduo a los dos lados del Chao Phraya, con afinidades florísticas con varias ecorregiones vecinas: unos 20.300 km². Llueven entre 1.000 y 1.100 mm al oeste y unos 1.300 mm al este, y el 80 % cae con el monzón del suroeste, de mayo a octubre. Hay karst calizo en las llanuras de Ratchaburi y Phetchaburi. Un 7 % está protegido.',
    vegetacion: 'Bosque húmedo deciduo en parches; sobre el karst de Ratchaburi y Phetchaburi persiste bosque más seco. La ficha de WWF de esta ecorregión no nombra especies dominantes, y por eso la lista de especies nativas va vacía en vez de con nombres deducidos de las ecorregiones vecinas. Las conversiones que WWF cuenta como amenaza principal son mandioca y caña de azúcar.',
    fauna: 'Elefante asiático, banteng, gibón de gorro (Hylobates pileatus), cocodrilo siamés (Crocodylus siamensis), faisán siamés (Lophura diardi), urraca de Indochina (Cissa hypoleuca), cigüeña lanuda (Ciconia episcopus), serau y el murciélago endémico Myotis rosseti.',
    suelos: 'Acá la premisa del nombre engaña: la ecorregión ocupa las terrazas y colinas lixiviadas que bordean la llanura, no el aluvión de creciente. HWSD v2 da Acrisols 62 %, Luvisols crómicos 12 %, Leptosols 10 % sobre el karst y Nitisols 7 %; SoilGrids coincide con Acrisols 66 %, Cambisols 19 % y Luvisols 7 %. Según FAO, en Acrisols la agricultura de bajos insumos rinde poco y prosperan los cultivos tolerantes a la acidez, que es exactamente la mandioca que se expandió acá.',
    saberes: [],
    especies: [],
    cultivos: ['yuca', 'cana_azucar', 'maiz_tropical', 'mijo', 'sorgo', 'mani', 'caupi', 'sesamo', 'batata', 'guandul', 'gliricidia', 'vetiver'],
    aptitud: [
      { uso: 'huerta', delta: -15, razon: 'Regla de acequia: las dos bases coinciden en que dominan los Acrisols —62 % en HWSD v2 y 66 % en SoilGrids—, suelos ácidos lixiviados de terraza y colina. El −25 del bioma exagera poco; el 20 % de Luvisols y Nitisols es lo que modera el valor.' },
    ],
    fuentes: [wwf('im0108', 'Chao Phraya lowland moist deciduous forests'), HWSD, SOILGRIDS, HENGL, FAO_SUELOS, RESOLVE],
  },

  // KH · ECO_ID 285 · bioma 1 · confianza media
  pantanos_tonle_sap: {
    id: 'pantanos_tonle_sap',
    nombre: 'Bosques inundables del Tonlé Sap',
    emoji: '🐟',
    color: '#4DB6AC',
    resumen: 'Llanura de inundación del Tonlé Sap, en Camboya: unos 25.900 km², de los cuales un 17 % es agua libre del lago. La mayor parte queda bajo agua al menos seis meses, de agosto a enero o febrero, y el bosque enano pantanoso, de seis a ocho meses. La estructura de la vegetación depende sobre todo de la microvariación de humedad del suelo y del pulso de inundación. Queda muy poco bosque en estado prístino.',
    vegetacion: 'Matorral de árboles bajos con euforbiáceas, fabáceas y combretáceas, Barringtonia acutangula y Terminalia cambodiana, endémica local. El bosque enano pantanoso lo dominan Barringtonia acutangula y Diospyros cambodiana. Tiene la invasora Mimosa pigra.',
    fauna: 'Gibón de gorro, tigre, cuón, oso malayo, pantera nebulosa, leopardo y banteng. Aves: grulla sarus oriental (Grus antigone), ibis de hombros blancos (Pseudibis davisoni) e ibis gigante (Thaumatibis gigantea).',
    suelos: 'Aluvión lacustre-fluvial. HWSD v2 da Gleysols 71 % —58 % éutricos y 12 % tiónicos— con Fluvisols éutricos 25 % y Acrisols 3 %; SoilGrids da Fluvisols 78 %, Acrisols 12 % y Cambisols 5 %, y PEATMAP no registra turba. La fertilidad no es el problema: el limitante es la inundación de seis a ocho meses. La huerta cabe en la ventana de bajante o sobre bordos altos, y ese diseño con el pulso del agua es lo que hay que resolver acá, no la enmienda.',
    saberes: [],
    especies: [
      'Barringtonia de río (Barringtonia acutangula)',
      'Ébano de Camboya (Diospyros cambodiana)',
      'Terminalia cambodiana',
    ],
    cultivos: ['arroz', 'maiz_tropical', 'batata', 'sesamo', 'caupi', 'mani', 'chile_seco', 'cebolla', 'platano', 'vetiver'],
    aptitud: [
      { uso: 'huerta', delta: -5, razon: 'Regla de acequia: aluvión lacustre-fluvial casi sin lixiviación, así que el −25 del bioma no aplica. Las dos bases coinciden y lo que queda negativo es el 12 % de Gleysols tiónicos de HWSD v2. El limitante real es la inundación de seis a ocho meses, que no es fertilidad y por eso no está en este número.' },
    ],
    fuentes: [wwf('im0164', 'Tonle Sap freshwater swamp forests'), HWSD, SOILGRIDS, HENGL, PEATMAP, RESOLVE],
  },

  // VN · ECO_ID 266 · bioma 1 · confianza media
  pantanos_rio_rojo: {
    id: 'pantanos_rio_rojo',
    nombre: 'Pantanos del río Rojo',
    emoji: '🌾',
    color: '#7CB342',
    resumen: 'Pantanos de agua dulce del curso inferior del río Rojo, en el norte de Vietnam: unos 10.700 km². El pantano boscoso crecía sobre suelos minerales inundados de forma permanente o estacional, en franjas de hasta 5 km a lo largo de los ríos o alrededor de lagos. Está casi totalmente desmontado para agricultura y asentamientos, y no tiene áreas protegidas.',
    vegetacion: 'Según los registros históricos que cita WWF, la comunidad original pudo haber estado dominada por Melaleuca, sin especie confirmada. Casi no queda bosque pantanoso en pie.',
    fauna: 'Sin aves ni mamíferos endémicos. Históricamente sostenía gran diversidad de peces de agua dulce, aves y mamíferos.',
    suelos: 'HWSD v2 da Gleysols 51 % —46 % éutricos y 6 % tiónicos—, Fluvisols éutricos 31 %, Technosols 8 % (suelo urbano) y Acrisols 8 %; SoilGrids da Cambisols 64 %, Acrisols 28 % y Fluvisols 8 %, y PEATMAP no registra turba. Es aluvión deltaico fértil, con la misma cautela que el Chao Phraya por el 6 % de Gleysols tiónicos: al excavar o bajar la napa, ojo con exponer material sulfídico.',
    saberes: [],
    especies: [
      'Melaleuca (Melaleuca sp.)',
    ],
    cultivos: ['arroz', 'maiz_tropical', 'batata', 'taro', 'cebolla', 'chile_seco', 'caupi', 'sesamo', 'platano', 'vetiver'],
    aptitud: [
      { uso: 'huerta', delta: -5, razon: 'Regla de acequia: aluvión deltaico con Gleysols y Fluvisols éutricos dominantes, así que el −25 del bioma no aplica. Las dos bases coinciden en −5: sólo 8 % de Acrisols y 6 % de Gleysols tiónicos entran como limitante severa.' },
    ],
    fuentes: [wwf('im0147', 'Red River freshwater swamp forests'), HWSD, SOILGRIDS, HENGL, PEATMAP, RESOLVE],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // La Sonda — Sumatra, Java, Bali y el suroeste de Borneo
  // ─────────────────────────────────────────────────────────────────────────

  // ID · ECO_ID 278 · bioma 1 · confianza media
  sumatra_bajo: {
    id: 'sumatra_bajo',
    nombre: 'Selvas bajas de Sumatra',
    emoji: '🌳',
    color: '#1B5E20',
    resumen: 'Tierras bajas de Sumatra, con Simeulue, Nias y casi toda Bangka: unos 260.000 km². Clima tropical húmedo, con cerca de 6.000 mm al oeste de Barisan y más de 2.500 mm al este, y casi nunca más de tres meses secos seguidos. Hacia 1997 quedaba alrededor del 40 %, con una pérdida de unos 2.800 km² por año entre 1985 y 1997.',
    vegetacion: 'Selva de dipterocarpáceas con emergentes de hasta 70 m: Dipterocarpus, Parashorea, Shorea y Dryobalanops, con 111 especies de la familia, 6 de ellas endémicas. También hay bosques de ulin (Eusideroxylon zwageri) y más de 100 especies de Ficus. Crecen acá Rafflesia arnoldii, la flor más grande del mundo, y Amorphophallus titanum.',
    fauna: 'Rinoceronte de Sumatra (Dicerorhinus sumatrensis), tapir malayo (Tapirus indicus), elefante asiático (Elephas maximus), tigre de Sumatra (Panthera tigris), orangután, siamang (Hylobates syndactylus) y pantera nebulosa. Más de 450 aves, entre ellas 10 cálaos y el argos real (Argusianus argus).',
    suelos: 'WWF describe como predominantes los suelos podzólicos, asociados con litosoles, y rendzinas sobre las calizas del norte; en la nomenclatura indonesia antigua, «podzólico» es un suelo ácido lixiviado, aproximadamente Ultisol. HWSD v2 lo confirma: Acrisols 47 %, Umbrisols ácricos 17 %, Fluvisols 7,5 %, Ferralsols 6 % e Histosols 2,6 %; SoilGrids da Ferralsols 49 %, Histosols 19 %, Nitisols 15 % y Acrisols 9 %. Lo importante para este lote es lo que no hay: los Andosols son el 0,1 % en SoilGrids y no figuran entre los grupos principales de HWSD. La fertilidad volcánica de Sumatra está en Barisan y no baja a estas tierras bajas. Según FAO, en Acrisols la agricultura de bajos insumos rinde poco y prosperan los cultivos tolerantes a la acidez.',
    saberes: [],
    especies: [
      'Keruing (Dipterocarpus spp.)',
      'Meranti (Shorea spp.)',
      'Alcanforero de Borneo (Dryobalanops spp.)',
      'Ulin (Eusideroxylon zwageri)',
      'Rafflesia (Rafflesia arnoldii)',
      'Aro gigante (Amorphophallus titanum)',
    ],
    cultivos: ['arroz', 'coco', 'platano', 'cacao', 'cana_azucar', 'taro', 'name', 'yuca', 'caupi', 'guandul', 'gliricidia', 'crotalaria', 'vetiver', 'pasto_elefante'],
    aptitud: [
      { uso: 'huerta', delta: -20, razon: 'Regla de acequia, y acá el −25 del bioma es casi correcto: la premisa volcánica del lote no se sostiene en esta ecorregión. Tres fuentes coinciden en suelos lixiviados —WWF con podzólicos, HWSD v2 con 72 % entre Acrisols, Umbrisols ácricos y Ferralsols, SoilGrids con 58 %—. Queda −20 y no −25 por el 7-8 % de Fluvisols de las vegas.' },
    ],
    fuentes: [wwf('im0158', 'Sumatran lowland rain forests'), HWSD, SOILGRIDS, HENGL, WRB, FAO_SUELOS, SUKARMAN, RESOLVE],
  },

  // ID · ECO_ID 279 · bioma 1 · confianza baja
  sumatra_montano: {
    id: 'sumatra_montano',
    nombre: 'Selvas montanas de Barisan',
    emoji: '⛰️',
    color: '#33691E',
    resumen: 'Bosques por encima de 1.000 m a lo largo de la cordillera de Barisan, que recorre toda la costa oeste de Sumatra: unos 73.000 km². Llueven más de 2.500 mm al año y casi nunca hay más de tres meses secos seguidos. Es la ecorregión mejor conservada del lote, con alrededor de 40 % protegido, incluido Kerinci-Seblat. Por su posición sobre la divisoria de la isla es cabecera de las cuencas de las dos vertientes.',
    vegetacion: 'El montano bajo tiene fagáceas y lauráceas: Lithocarpus, Quercus, Castanea y Cinnamomum. El montano alto es un bosque enano o élfico con coníferas como Dacrycarpus imbricatus y ericáceas (Rhododendron, Vaccinium). En el piso subalpino hay árboles bajos con gramíneas (Agrostis, Festuca), juncos y ciperáceas.',
    fauna: 'Siete mamíferos endémicos, entre ellos el langur de Thomas (Presbytis thomasi), el conejo de Sumatra (Nesolagus netscheri) y Mus crociduroides, además del tigre y el rinoceronte de Sumatra y el serau (Capricornis sumatraensis). Ocho aves endémicas, como el faisán de Sumatra (Lophura hoogerwerfi), el cuco terrestre de Sumatra (Carpococcyx viridis) y Cochoa beccarii.',
    suelos: 'Barisan es un cinturón de plegamiento con vulcanismo de los últimos 25 millones de años, y aun así WWF describe como predominantes los suelos podzólicos, o sea lixiviados. HWSD v2 da Umbrisols 65 % —40 % ácricos y 22 % cámbicos—, Andosols 18 % y Acrisols 5 %; SoilGrids da Cambisols 37 %, Andosols 32 % y Ferralsols 28 %. Los Andosols son reales pero no dominan: están en los conos activos. Sumatra concentra el 48 % de los Andosols de Indonesia, unos 2,6 millones de ha, y el 62 % de los suelos volcánicos del país está sobre pendientes de más del 30 %. Advertencia de escala: esta ficha promedia conos fértiles con laderas de Umbrisols ácricos, y donde el predio caiga sobre un cono activo el valor real está más cerca de 0.',
    saberes: [],
    especies: [
      'Podocarpo (Dacrycarpus imbricatus)',
      'Robles tropicales (Lithocarpus spp., Quercus spp.)',
      'Canelos (Cinnamomum spp.)',
      'Rododendros (Rhododendron spp.)',
      'Rafflesia (Rafflesia arnoldii)',
    ],
    cultivos: ['cafe', 'papa', 'cebolla', 'zapallo_milpa', 'taro', 'batata', 'maiz_tropical', 'poroto_trepador', 'vetiver', 'trebol_blanco'],
    aptitud: [
      { uso: 'huerta', delta: -15, razon: 'Regla de acequia, con desempate por WWF, que nombra suelos podzólicos: la cordillera volcánica no es un bloque andosólico. HWSD v2 da 50 % lixiviado —Umbrisols ácricos sobre todo— contra 18 % de Andosols; SoilGrids daría −5 con 28 %. Confianza baja a propósito: el promedio de esta ficha borra la diferencia entre el cono y la ladera, y la pendiente agrava el límite.' },
    ],
    fuentes: [wwf('im0159', 'Sumatran montane rain forests'), HWSD, SOILGRIDS, HENGL, WRB, SUKARMAN, RESOLVE],
  },

  // ID · ECO_ID 277 · bioma 1 · confianza baja
  /**
   * El 280 es la turbera de Sumatra, y no es el 277.
   *
   * Dos polígonos vecinos con nombre casi igual —«Sumatran freshwater swamp» y
   * «Sumatran peat swamp»— y el agua en lugares distintos: en el 277 viene del
   * río y de la lluvia, en el 280 está en el suelo. Lo que decide el uso acá no es
   * la fertilidad: es la napa.
   */
  pantanos_turba_sumatra: {
    id: 'pantanos_turba_sumatra',
    nombre: 'Turberas de Sumatra',
    emoji: '\u{1F33F}',
    color: '#47765A',
    resumen: '87.710 km² sobre la costa sudoriental de Sumatra. Bosque pantanoso mixto y bosque de bintangur sobre turba de varios metros, localmente de más de 30.000 años, con el dosel más bajo y los árboles más finos hacia el interior de las cúpulas. El drenaje, la tala y la quema para palma aceitera transformaron grandes áreas y alimentaron los incendios de turba que en 2015 cerraron escuelas y aeropuertos de toda la región.',
    vegetacion: 'El bosque permanece anegado gran parte del año sobre arcillas ácidas y turba de hojarasca que se descompone lentamente. En el bosque mixto, Koompassia malaccensis, Durio lowianus, Gonystylus bancanus, Shorea teysmanniana, Tetramerista glabra y Swintonia glauca; los bosques de bintangur, dominados por Calophyllum lowii, ocupan la turba más profunda y alejada de los ríos. Koompassia y Durio arman el dosel ribereño, y Shorea, Palaquium y Swintonia el del interior. One Earth no publica un rango de lluvia ni un calendario de meses secos para la ecorregión.',
    fauna: 'Más de 220 especies de aves, entre ellas la cigüeña de Storm, el pato de alas blancas y la cigüeña lechosa. Gibón de manos blancas, siamang, tigre de Sumatra en baja densidad, oso malayo y varias nutrias; las arborícolas, los carnívoros grandes y las nutrias dependen de que el bosque siga inundado.',
    suelos: 'Orgánicos y ácidos, saturados la mayor parte del año, con turba de varios metros. La fuente distingue turba ribereña de turba interior más profunda pero no dice qué proporción del polígono es cada una, y no se pudo resumir HWSD v2, SoilGrids ni PEATMAP sobre el 280: no se hereda el reparto del 277, que es muy distinto. Lo que sí hay es el número que decide: el límite crítico de napa en turba es de 40 cm por reglamento indonesio (PP 57/2016), y el estudio de campo de Perigi midió 45-47 cm en agosto-septiembre —ya pasado el límite— sin bloqueo de canales, con la napa bajando más cuanto más lejos del canal. Esa medición es de un lote piloto de unas 10 ha y no representa la ecorregión.',
    saberes: [],
    especies: [
      'Tualang (Koompassia malaccensis)',
      'Durio de Low (Durio lowianus)',
      'Ramin (Gonystylus bancanus)',
      'Bintangur (Calophyllum lowii)',
      'Meranti de turbera (Shorea teysmanniana)',
      'Tetramerista (Tetramerista glabra)',
      'Swintonia (Swintonia glauca)',
    ],
    cultivos: ['arroz'],
    aptitud: [
      { uso: 'huerta', delta: -25, razon: 'Se confirma el −25 del bioma húmedo pero por otro mecanismo: acá la limitante no es la pérdida de bases por lixiviación sino que una huerta convencional pide bajar la napa, y airear turba la oxida. Medido en plantaciones drenadas del Sudeste Asiático: 142 cm de hundimiento en los primeros cinco años y unos 5 cm por año después, con el 92 % del acumulado por oxidación a los dieciocho años. El número no se extrapola a un predio sin suelo orgánico ni a cultivos paludícolas sin drenaje.' },
      { uso: 'forestal', delta: 0, razon: 'Se cancela el +20 del bioma húmedo. Ese +20 dice que el sistema que sostiene el bioma es agroforestal de varios estratos, y en turba eso sigue siendo cierto sólo si la napa no baja: el límite crítico son 40 cm y el reglamento indonesio lo fija. Lo que se cancela es la lectura de que el puntaje habilita el camino habitual para llegar ahí, que es drenar: Hooijer et al. miden que el hundimiento y la pérdida de carbono siguen siendo considerables incluso con la napa más alta que una plantación puede sostener. La versión que funciona es paludícola —sagú y jelutong, que todavía no tienen id en el catálogo—, y el jelutong tiene su evidencia adentro de este mismo polígono: la concesión de Jambi que plantó 1.769 ha de Dyera polyphylla sobre turba sin drenar está al lado del Parque Nacional de Berbak, que da 280, y creció bien; de esas 1.769 ha quedan unas 200, porque el fuego se llevó 7.000 ha de la concesión en 1997 y otras 5.000 en 2003, o sea que lo que decide no es la tolerancia de la especie sino el fuego del paisaje de alrededor— y la app no tiene cómo saber si el predio va a drenar, así que no regala el positivo.' },
    ],
    fuentes: [ONE_EARTH_280, IMANUDIN, CAHYA, HOOIJER, TATA_JELUTONG, RESOLVE],
  },

  /**
   * El 286 es la turbera del Tonlé Sap, y tampoco es el 285.
   *
   * Y acá hay una vuelta más: la propia fuente dice que el polígono es un
   * **mosaico** y no una turbera continua —hay humedales de gramíneas sobre
   * arcillas aluviales fértiles—, así que ninguno de los dos números se puede
   * leer como si todo el polígono fuera Histosol.
   */
  pantanos_tonle_sap_mekong_turba: {
    id: 'pantanos_tonle_sap_mekong_turba',
    nombre: 'Turberas del Tonlé Sap y el Mekong',
    emoji: '\u{1F33F}',
    color: '#47765A',
    resumen: '29.450 km² en Camboya y Vietnam, alrededor del Tonlé Sap y a lo largo de sus conexiones con el Mekong, con extensiones hacia Haut Chhlong y Blao. Mezcla bosque pantanoso de agua dulce somera, humedales de gramíneas sobre arcillas aluviales y sectores de bosque de turbera. One Earth la describe como un remanente muy transformado: grandes áreas fueron drenadas y convertidas.',
    vegetacion: 'En el anillo exterior, con drenaje deficiente y agua somera estancada, la anoxia acumula materia orgánica; la formación boscosa más extendida la dominan Livistona cochinchinensis y árboles de Eugenia, Elaeocarpus y Calophyllum. En el mosaico hay áreas extensas de ciperáceas y gramíneas altas —Phragmites karka, Saccharum arundinaceum, Coix gigantea— sobre arcillas aluviales fértiles. Detrás de los manglares del delta, los bosques de Melaleuca retienen agua y frenan la acidificación. One Earth los cita como Melaleuca leucadendron, pero esa identificación para Indochina es dudosa: Kew acepta Melaleuca cajuputi como nativa de Camboya y Vietnam. El régimen sigue el pulso monzónico del sistema Tonlé Sap-Mekong y la fuente no da serie local de lluvia ni calendario de meses secos.',
    fauna: 'One Earth no da un total de mamíferos ni de aves. Señala desaparecidos localmente el búfalo de agua silvestre, el ciervo de Eld, el ciervo porcino indochino y el banteng, y que la nutria de nariz peluda persiste; los carrizales son hábitat de grulla sarus oriental, ibis gigante, ibis de hombros blancos e ibis cabecinegro.',
    suelos: 'Es un mosaico y no una turbera continua, y eso cambia cómo se lee todo lo demás: la fuente vincula la turba al anegamiento somero, al drenaje pobre y a la descomposición lenta, pero identifica también humedales de gramíneas asentados sobre arcillas aluviales fértiles. No se pudo verificar un porcentaje de Histosols en HWSD v2 ni en SoilGrids, ni de turba en PEATMAP, para el polígono 286: no se sustituye por el del vecino 285 ni por dato nacional, y tampoco hay cuantificación de suelos tiónicos ni del cambio de pH que provocan las zanjas. La evidencia de arroz de recesión es de campos del área de Krong Stueng Saen, no una prueba de que todo el 286 se cultive sin drenar.',
    saberes: [],
    especies: [
      'Palma de abanico indochina (Livistona cochinchinensis)',
      'Carrizo gigante (Phragmites karka)',
      'Caña silvestre (Saccharum arundinaceum)',
      'Coix gigante (Coix gigantea)',
      'Melaleuca de hoja estrecha (Melaleuca cajuputi)',
      'Elaeocarpus de Griffith (Elaeocarpus griffithii)',
      'Barringtonia de frutos agudos (Barringtonia acutangula)',
    ],
    cultivos: ['arroz'],
    aptitud: [
      { uso: 'huerta', delta: -25, razon: 'Se confirma el −25 del bioma húmedo pero por el mosaico hidrológico y no por lixiviación: el arroz de recesión se puede sembrar tras la bajante en las llanuras aluviales, mientras que habilitar huerta en el sector de turba con zanjas airea el perfil orgánico y arranca una subsidencia que no se revierte —142 cm en cinco años y unos 5 cm por año después en plantaciones drenadas de la región—. El puntaje no convierte el polígono entero en Histosol: el predio se evalúa por su suelo y su napa medidos.' },
      { uso: 'forestal', delta: 0, razon: 'Se cancela el +20 del bioma húmedo, con la misma razón que en la turbera de Sumatra y una salvedad propia. El +20 dice que el sistema del bioma es agroforestal de varios estratos, y sobre turba eso vale sólo sin bajar la napa; lo que no se puede regalar es el positivo, porque la app no sabe si el predio cae en el sector de turba o en las arcillas aluviales, y en el primero el camino habitual para plantar es drenar. En las arcillas del mosaico el +20 sería correcto, así que acá el cero es una abstención por no poder distinguir dónde cae el predio, no un veredicto sobre todo el polígono.' },
    ],
    fuentes: [ONE_EARTH_286, TONLE_SAP_ARROZ, KEW_MELALEUCA, HOOIJER, RESOLVE],
  },

  /**
   * El 221 es la turbera de Borneo, y lo primero de la ficha es **dónde no
   * está**.
   *
   * El nombre invita a leerlo como «las turberas de Borneo», y el polígono no
   * es eso: son veintinueve parches de la franja costera de toda la isla más
   * los dos complejos de lagos interiores, el del Mahakam y el del Kapuas. Las
   * cúpulas grandes de Kalimantan central —Sebangau, Mawas— caen en el 273 y en
   * el 281, y el Parque Nacional Tanjung Puting está repartido entre cuatro
   * ecorregiones, con sólo su sector sur acá. Eso importa en los dos sentidos:
   * un predio sobre turba profunda de Kalimantan central no recibe esta ficha, y
   * las cifras que las fuentes dan «de Tanjung Puting» no son de este polígono.
   *
   * La otra mitad de la ficha es el espesor, porque es lo que decide si la
   * alternativa paludícola rinde o no, y está medido adentro del polígono.
   */
  pantanos_turba_borneo: {
    id: 'pantanos_turba_borneo',
    nombre: 'Turberas de Borneo',
    emoji: '\u{1F33F}',
    color: '#47765A',
    resumen: '67.620 km² repartidos en veintinueve parches: la franja costera de Borneo —Indonesia, Malasia y Brunéi, los tres confirmados contra el polígono— y los complejos de lagos interiores del Mahakam y del Kapuas. One Earth dice que la turba puede pasar de 20 m, que alrededor del 14 % de la ecorregión está protegido y que la mayor parte de las turberas fue drenada y quemada. El polígono no es la suma de las turberas de la isla: las cúpulas grandes de Kalimantan central —Sebangau, Mawas— dan 273 y 281, y el Parque Nacional Tanjung Puting está repartido entre cuatro ecorregiones, con sólo su sector sur acá.',
    vegetacion: 'Bosque anegado la mayor parte del año sobre arcillas ácidas, donde la anoxia frena la descomposición de la hojarasca. El dosel lo dominan Gonystylus bancanus, Dactylocladus stenostachys, Copaifera palustris y seis especies de Shorea, con Shorea albida formando a veces rodales puros; en el norte de la isla Shorea se reemplaza por Dacrydium beccarii y Casuarina. En los estratos medio e inferior, Alangium havilandii, Blumeodendron tokbrai, Ctenolophon parvifolius, dos Diospyros, Kokoona ovatolanceolata y Palaquium cochleariifolium. Pandanus ridleyi y Pandanus brevifolius aparecen donde la turba es más somera, y crecen más de treinta especies de palmera. De la fisonomía lo único medido viene de una cúpula intacta del noroeste de Borneo relevada con LiDAR aéreo: sobre un gradiente de 4 m de altura de cúpula, hacia el interior sube la densidad de tallos y bajan la altura del dosel, el área de copa y su rugosidad, con 217,7 ± 28,3 Mg C/ha de biomasa aérea medida en el terreno y 222,4 ± 24,4 estimados para toda la cúpula, más de lo publicado antes para turbera y para selva tropical en general. Ese gradiente es de altura de cúpula y no de espesor de turba, y los propios autores avisan que acá la altura de dosel que ve el LiDAR no predice bien la biomasa: su coeficiente de variación es 0,08, tres veces menor que el del diámetro de los tallos.',
    fauna: 'One Earth señala densidades muy altas de primates endémicos donde la turbera sigue intacta: orangután de Borneo (Pongo pygmaeus), mono narigudo (Nasalis larvatus), langur bandeado de Borneo (Presbytis chrysomelas), langur rojo y un gibón que la página llama «southern Bornean gibbon». A ese nombre la ficha no le pone binomial, porque los dos candidatos son especies distintas: Hylobates albibarbis, que ITIS llama gibón de barba blanca de Borneo y cuyos registros con coordenada en GBIF se centran en el sur de la isla, e Hylobates muelleri, el gibón de Müller, cuyos registros se centran en el este. También varios félidos, entre ellos la pantera nebulosa de la Sonda (Neofelis diardi), endémica, y el gato cabeciplano. La diversidad de aves es más baja que en la selva de tierra firme, y el número que suele citarse —más de 200 especies— es del Parque Nacional Tanjung Puting, que está repartido entre cuatro ecorregiones. En los ríos y caños, arowana asiático (Scleropages formosus), nutrias, falso gavial y cocodrilos.',
    suelos: 'Histosols: turba ácida, saturada y pobre en oxígeno sobre arcillas, y el espesor es el dato que decide todo lo demás. Está medido adentro del polígono y en los dos extremos del gradiente. Tierra adentro, en la cúpula al sur de Putussibau, Kapuas superior: 2-4 m en el borde y unos 17-18 m en el centro, con un máximo barrenado de 18 m y una media modelada de 5,16 ± 2,66 m sobre 3.833 km², que dan 2.790 ± 1.440 Mg C/ha —más del doble que la turba indonesia promedio y más que la boreal, de 600 a 700, o que la turba forestada más densa del Amazonas, 1.390—. En la costa, en Rasau Jaya, delta del Kapuas: 4-6 m donde la cúpula quedó intacta, con más del 90 % de materia orgánica, y menos de 1 m con apenas 20-30 % de orgánico —técnicamente ya no es turba— en los seis kilómetros del sur que el programa de transmigración de los años setenta cultivó y quemó. Una síntesis de quince perfiles de Kalimantan promedia 444 cm en la turba costera contra 774 cm en la interior; de sus cuatro regiones, Sentarum y el lago Siran caen adentro del 221 y Mempawah no, así que ese promedio mezcla adentro y afuera del polígono. No se pudo resumir HWSD v2, SoilGrids ni PEATMAP sobre el 221: no se afirma un porcentaje de Histosols y no se hereda el reparto del 219 ni del 273. Lo que sí hay es el rango de napa que publica esa misma síntesis: en turba tropical sin drenar la napa va de 5 a 50 cm y en turba drenada de 60 a 90 cm, contra el límite crítico de 40 cm que el reglamento indonesio PP 57/2016 fija para la turba. O sea que una turba drenada está pasada del límite por definición y no por accidente. Y hay un dato de agua que no es de suelo y vale para el diseño: la mitad de la cúpula de Putussibau está por debajo del lecho del Kapuas, y el humedal del Kapuas superior guarda alrededor del doble del volumen de agua que el propio río y sus lagos de planicie. La turba no está al lado del agua: es el almacenamiento.',
    saberes: [],
    especies: [
      'Ramin (Gonystylus bancanus)',
      'Shorea de turbera (Shorea albida)',
      'Dactiloclado (Dactylocladus stenostachys)',
      'Copaifera de turbera (Copaifera palustris)',
      'Alangio de Borneo (Alangium havilandii)',
      'Kokoona (Kokoona ovatolanceolata)',
      'Pandano de turba somera (Pandanus ridleyi)',
      'Dacrydium de Borneo (Dacrydium beccarii)',
    ],
    aptitud: [
      { uso: 'huerta', delta: -25, razon: 'Se confirma el −25 del bioma húmedo pero por el mismo mecanismo que en la turbera de Sumatra y no por lixiviación: la limitante no es la pérdida de bases sino que una huerta convencional pide bajar la napa, y airear turba la oxida. Medido en plantaciones drenadas del Sudeste Asiático: 142 cm de hundimiento en los primeros cinco años y unos 5 cm por año después, con el 92 % del acumulado por oxidación a los dieciocho años. Acá se le puede poner número a la napa: sin drenar la turba tropical está entre 5 y 50 cm y drenada entre 60 y 90, contra un límite crítico reglamentario de 40 cm, así que el drenaje de huerta no se acerca al límite, lo pasa. Y la pérdida no termina en el predio: cada hectárea de turba perdida libera unos 2.800 Mg C, y la caída de captura de las turberas drenadas de Kalimantan es de 32,4 Mt C por año, unas 47,5 veces la caída natural de los últimos cuatro mil años. El número no se extrapola a un predio sin suelo orgánico ni a cultivos paludícolas sin drenaje.' },
      { uso: 'forestal', delta: 0, razon: 'Se cancela el +20 del bioma húmedo, y acá por primera vez con la alternativa medida adentro del mismo polígono. El +20 dice que el sistema que sostiene el bioma es agroforestal de varios estratos, y sobre turba eso vale sólo si la napa no baja; lo que se cancela es la lectura de que el puntaje habilita el camino habitual para llegar ahí, que es drenar. La versión paludícola existe y está medida en Mukah, Sarawak, adentro de esta ecorregión: en turba somera —de 0,5 a 1,5 m según la definición de Sarawak—, sin drenaje artificial y con la napa unos 10 cm abajo de la superficie, más del 80 % de las palmas de sagú formó tronco a los 5-6 años y maduró a los 10-11, con 8 m de tronco y 45 cm de diámetro, sin una sola aplicación de fertilizante. En turba profunda no: con drenaje mínimo y la napa alta todo el año, apenas un 20 % formó tronco a los 10-15 años y ninguna maduró; con inundación estacional de más de 1 m, menos del 10 % a los ocho años. Lo que separa los dos resultados es el espesor y no el agua, porque en turba somera la raíz llega al subsuelo mineral y come de ahí mientras la turba profunda es extremadamente pobre en macro y micronutrientes. Por eso el cero y no un positivo: la app no sabe si el predio cae en el borde somero o en la cúpula, y en la cúpula no hay versión que funcione sin drenar.' },
    ],
    fuentes: [ONE_EARTH_221, RUWAIMANA, ANSHARI_2026, NGUYEN_LIDAR, JONG_SAGU, TATA_JELUTONG, HOOIJER, GBIF_NOMBRES, RESOLVE],
  },

  /**
   * El 264 es la cuarta turbera del conjunto, y la que se distingue por lo que
   * tiene **abajo**: arcilla marina sulfídica.
   *
   * Eso corta para los dos lados y las dos puntas están en la ficha. Drenar acá
   * no sólo oxida la turba: acerca el aire a los sulfuros de la arcilla, que es
   * la receta de un suelo sulfatado ácido. Y al mismo tiempo, el sagú está
   * reportado creciendo sano justamente sobre suelos minerales sulfídicos de pH
   * extremadamente bajo.
   *
   * Dos cosas de nomenclatura que la fuente trae mal y que acá quedan escritas
   * para que nadie las copie de nuevo: One Earth escribe «S. teysmaniana» con
   * una n de menos —es *teysmanniana*, y Kew la pasó al género *Rubroshorea*
   * mientras el backbone de GBIF la sigue aceptando en *Shorea*— y
   * «Crytostachys renda» por *Cyrtostachys renda*. Y una que no es grafía:
   * *Pandanus atrocarpus*, que la página cita como pandano de la turbera, es
   * **sinónimo**; el nombre aceptado es *Benstonea atrocarpa*.
   */
  pantanos_turba_malaca: {
    id: 'pantanos_turba_malaca',
    nombre: 'Turberas de la península malaya',
    emoji: '\u{1F33F}',
    color: '#47765A',
    resumen: '3.630 km² en siete parches sobre las dos costas de la península malaya, todos en Malasia: el mayor en la costa oriental, en Pahang, y el segundo en la occidental, en el norte de Selangor, los dos confirmados contra el polígono. One Earth dice que casi todos los remanentes están talados o degradados y que queda muy poco bosque prístino, y le pone nivel de protección 1 sobre 10 —que es el porcentaje de la meta de la Red de Seguridad Global y no el porcentaje protegido—. Lo que distingue a esta turbera de las otras tres del conjunto es lo que hay abajo: arcilla marina sulfídica.',
    vegetacion: 'Bosque de tierras bajas permanentemente anegado sobre turba de hojarasca semidescompuesta, con árboles de raíces zancudas, contrafuertes y neumatóforos, y dosel en tres estratos. Comparte la mayoría de sus especies con la selva baja vecina —Koompassia malaccensis, Durio carinatus, Bhesa paniculata, Shorea platycarpa, Shorea teysmanniana, Shorea uliginosa, Stemonurus scorpioides y otras—, y las que One Earth da como restringidas a la turbera son siete: Gonystylus bancanus, Macaranga pruinosa, Campnosperma coriaceum, Blumeodendron tokbrai, Parartocarpus venenosus, Ixora grandiflora y Pternandra galeata. Son comunes la palma lacre Cyrtostachys renda y los rodales del pandano Benstonea atrocarpa, y los Ficus estranguladores del borde dan fruto a aves, mamíferos y hasta a peces cuando cae al agua. Donde se taló quedan rodales puros de Macaranga pruinosa y Cratoxylum arborescens. One Earth no publica rango de lluvia ni calendario de meses secos para la ecorregión.',
    fauna: 'Casi toda fauna de selva baja que también entra acá: tigre —al que la página nombra sin subespecie—, tapir malayo (Tapirus indicus), leopardo (Panthera pardus) y pantera nebulosa, más tres nutrias, la de nariz peluda (Lutra sumatrana), la lisa y la de uñas chicas, y el binturong, el civeta arborícola grande que casi no baja al suelo y al que por eso mismo la tala amenaza. Los relevamientos contaron 194 especies de aves en turbera talada, de ellas 15 de humedal y 29 migratorias, y la propia página avisa que en bosque intacto el número sería mayor.',
    suelos: 'Histosols orgánicos, ácidos y pobres en nutrientes, con agua negra de taninos a pH 2,9-4,5, y abajo arcilla marina sulfídica o aluvión fluvial. Ese sustrato es lo propio de esta ficha y corta para los dos lados. Drenar turba la oxida y la hunde —142 cm en cinco años y unos 5 cm por año después en plantaciones drenadas de la región, con el 92 % del hundimiento por oxidación a los dieciocho años—, y acá el drenaje además acerca el aire a los sulfuros de la arcilla, que es como se fabrica un suelo sulfatado ácido. One Earth describe la acidez natural del agua pero no cuantifica cuánto baja el pH al oxidarse los sulfuros, ni en cuánto tiempo, ni con qué se corrige, y no se traslada acá el 12 % de Gleysols tiónicos que HWSD v2 da para el 285, que es otro polígono y otra cuenca. Tampoco se pudo resumir HWSD v2, SoilGrids ni PEATMAP sobre el 264: no hay porcentaje de Histosols ni medición de espesor para este polígono, y no se hereda el reparto del 265. Del otro lado, el mismo sustrato es donde una de las dos especies paludícolas anda bien: el sagú crece sano sobre suelos minerales sulfídicos de pH extremadamente bajo en Batu Pahat y en la estación de Rampangi, sobre suelo sulfatado ácido, aunque eso los autores lo reportan como observación propia y no como ensayo.',
    saberes: [],
    especies: [
      'Ramin (Gonystylus bancanus)',
      'Macaranga de turbera (Macaranga pruinosa)',
      'Campnosperma de turbera (Campnosperma coriaceum)',
      'Blumeodendron (Blumeodendron tokbrai)',
      'Parartocarpus (Parartocarpus venenosus)',
      'Ixora de turbera (Ixora grandiflora)',
      'Pternandra (Pternandra galeata)',
      'Palma lacre (Cyrtostachys renda)',
      'Pandano de turbera (Benstonea atrocarpa)',
    ],
    aptitud: [
      { uso: 'huerta', delta: -25, razon: 'Se confirma el −25 del bioma húmedo pero por dos mecanismos encadenados, y ninguno es la lixiviación. El primero es el de todas las turberas: una huerta convencional pide bajar la napa, airear turba la oxida, y eso está medido en 142 cm de hundimiento en los primeros cinco años y unos 5 cm por año después, con el 92 % del acumulado por oxidación a los dieciocho años. El segundo es propio de acá: debajo de la turba hay arcilla marina sulfídica, así que el mismo drenaje que oxida la turba expone los sulfuros y arranca la acidificación de un suelo sulfatado ácido. Cuánto baja el pH, en cuánto tiempo y con qué se corrige no está en las fuentes abiertas que se pudieron leer para este polígono, y no se rellena con el dato tiónico de otra cuenca: lo que se afirma es la dirección del proceso, no su magnitud. El número no se extrapola a un predio sin suelo orgánico.' },
      { uso: 'forestal', delta: 0, razon: 'Se cancela el +20 del bioma húmedo, con la misma razón que en las otras tres turberas: el +20 dice que el sistema que sostiene el bioma es agroforestal de varios estratos, y sobre turba eso vale sólo si la napa no baja, así que lo que se cancela es la lectura de que el puntaje habilita el camino habitual para llegar ahí, que es drenar. La alternativa paludícola es la misma y acá está peor documentada que en Borneo: no hay ensayo de sagú ni de jelutong adentro de este polígono. Lo que sí hay son dos cosas. Que el área nativa del jelutong de pantano (Dyera polyphylla) cubre la península malaya, y que la plantación de 1.769 ha que se hizo con él sobre turba sin drenar, en Jambi, creció bien y hoy son unas 200 ha porque el fuego se llevó 7.000 ha de la concesión en 1997 y otras 5.000 en 2003: o sea que lo que decide no es la tolerancia de la especie sino el fuego y el drenaje del paisaje de alrededor. Y que el sagú está reportado creciendo sano sobre suelos minerales sulfídicos de pH extremadamente bajo, que es exactamente lo que hay debajo de esta turba. Ninguno de los dos tiene id en el catálogo de cultivos, y no por olvido: de ninguno se encontró temperatura base, GDD de ciclo, temperatura letal ni Kc, y un perenne que madura a los diez años no entra en el motor de cultivos sin esos campos.' },
    ],
    fuentes: [ONE_EARTH_264, JONG_SAGU, TATA_JELUTONG, HOOIJER, GBIF_NOMBRES, RESOLVE],
  },

  pantanos_sumatra: {
    id: 'pantanos_sumatra',
    nombre: 'Pantanos de agua dulce de Sumatra',
    emoji: '🐊',
    color: '#00897B',
    resumen: 'Parches disjuntos de pantano de agua dulce en la llanura aluvial del este de Sumatra: unos 18.000 km². Clima tropical húmedo. Los árboles soportan inundaciones prolongadas que vuelven anaeróbico el suelo, y el agua viene del río y de la lluvia, no de la turba. Queda menos de un quinto del hábitat natural.',
    vegetacion: 'Adina, Alstonia, Campnosperma, Dillenia, Dyera, Erythrina, Eugenia, Ficus, Gluta, Lophopetalum, Memecylon, Metroxylon, Pandanus, Pentaspadon, Shorea y Vatica. En el sur, Melaleuca cubre áreas extensas: WWF la cita como M. leucadendron, pero esa especie es nativa de Maluku a Australia, así que la especie queda sin confirmar.',
    fauna: 'Elefante asiático, tapir malayo, tigre de Sumatra, pantera nebulosa, cocodrilo marino, falso gavial (Tomistoma schlegelii) y pato de alas blancas (Asarcornis scutulata).',
    suelos: 'WWF describe suelos aluviales fértiles y muy variados, pero los mapas ven turba. HWSD v2 da Fluvisols dístricos 42 %, Acrisols férricos 18 %, Histosols 17 % y Gleysols úmbricos 16 %; PEATMAP marca 25 % de turba y SoilGrids llega a 88 % de Histosols, lo que probablemente signifique que el polígono incluye bordes de las turberas vecinas. Donde hay turba, la cautela no es de fertilidad sino de nivel de agua: drenarla la hunde unos 5 cm por año de forma sostenida, y más del 90 % de ese hundimiento es oxidación, no compactación.',
    saberes: [],
    especies: [
      'Melaleuca o cayeputi (Melaleuca sp.)',
      'Sagú de pantano (Metroxylon sagu)',
      'Jelutong (Dyera sp.)',
      'Meranti (Shorea sp.)',
    ],
    cultivos: ['arroz', 'coco', 'platano', 'taro', 'name', 'yuca', 'caupi', 'cacao', 'gliricidia', 'vetiver'],
    aptitud: [
      { uso: 'huerta', delta: -10, razon: 'Regla de acequia: el valor es negativo por turba y lixiviación parcial, no por lo que dice el bioma. Sobre Fluvisols dominantes (42 % en HWSD v2) hay 25 % de turba según PEATMAP y 18 % de Acrisols. SoilGrids, con 88 % de Histosols, daría −25. Confianza baja: donde caiga turba, la regla de diseño es no drenar, porque el hundimiento es de unos 5 cm/año y no se revierte.' },
    ],
    fuentes: [wwf('im0157', 'Sumatran freshwater swamp forests'), HWSD, SOILGRIDS, HENGL, PEATMAP, HOOIJER, RESOLVE],
  },

  // ID · ECO_ID 305 · bioma 3 (coníferas tropicales) · confianza baja · sin modificador
  pinar_toba: {
    id: 'pinar_toba',
    nombre: 'Pinares tropicales de Toba',
    emoji: '🌲',
    color: '#4E6E3A',
    resumen: 'Pinares de Pinus merkusii en el norte de Sumatra, alrededor del lago Toba y sobre Barisan: unos 2.800 km². Son los únicos rodales naturales de esta especie al sur del ecuador. Ocupan los sectores más secos de la cordillera, sobre todo las laderas del este, a la sombra de lluvia, y se queman con frecuencia por causas naturales y humanas.',
    vegetacion: 'Pinar de Pinus merkusii en mosaico con selva montana. La lista de especies es corta a propósito: la ficha de WWF sólo nombra al pino como flora.',
    fauna: 'Doce aves casi endémicas, entre ellas el pavón bronceado (Polyplectron chalcurum), el minivet de la Sonda (Pericrocotus miniatus) y el niltava de Sumatra (Niltava sumatrana). No tiene mamíferos endémicos ni casi endémicos.',
    suelos: 'Las fuentes no concuerdan y no se encontró ninguna regional abierta que nombre el suelo de los pinares de Toba. HWSD v2 da Umbrisols ácricos 49 %, Cambisols dístricos 17 %, Acrisols 16 % y Andosols 10 %, o sea 66 % con limitante severa; SoilGrids da Andosols 54 %, Ferralsols 26 % y Cambisols 17 %, o sea 26 %. Diez puntos de diferencia es más de lo que la regla admite, así que esta ficha no corrige el modificador del bioma. Haría falta la cartografía de BBSDLP de Sumatra Utara o un estudio de perfiles sobre la toba del Toba.',
    saberes: [],
    especies: [
      'Pino de Sumatra o tusam (Pinus merkusii)',
    ],
    cultivos: ['cafe', 'papa', 'maiz_tropical', 'mani', 'cebolla', 'batata', 'poroto_trepador', 'vetiver', 'pasto_elefante'],
    fuentes: [wwf('im0304', 'Sumatran tropical pine forests'), HWSD, SOILGRIDS, HENGL, RESOLVE],
  },

  // ID · ECO_ID 289 · bioma 1 · confianza baja
  java_occidental_bajo: {
    id: 'java_occidental_bajo',
    nombre: 'Selvas bajas de Java occidental',
    emoji: '🌾',
    color: '#558B2F',
    resumen: 'Tierras por debajo de 1.000 m que rodean la cordillera volcánica del oeste de Java: una franja de unos 500 km de largo y nunca más de 60 km de ancho. Es la parte más húmeda y más rica en especies de Java, y queda sólo un 5 % del hábitat original. Alberga al rinoceronte de Java.',
    vegetacion: 'Selva siempreverde y semisiempreverde con Artocarpus elasticus, Dysoxylum caulostachyum, langsat (Lansium domesticum) y Planchonia valida. Hacia el este aparecen bosque húmedo deciduo y seco deciduo, con 1.500 a 4.000 mm y 4 a 6 meses secos. También hay bosques sobre caliza y pantanos de agua dulce. En total más de 3.800 especies de plantas, entre ellas dos Rafflesia.',
    fauna: '101 mamíferos y más de 350 aves. Vive acá el rinoceronte de Java (Rhinoceros sondaicus), en peligro crítico, con el gibón de Java (Hylobates moloch), el surili (Presbytis comata) y el águila-azor de Java (Spizaetus bartelsi).',
    suelos: 'El sustrato son volcanitas terciarias y cuaternarias, aluviones y calizas coralinas levantadas, pero eso no se traduce en suelo volcánico joven: ninguna de las dos bases muestra dominio andosólico en la franja baja, que es lo contrario de la premisa con la que arrancó este lote. Los Andosols quedan en los conos, que corresponden a la ficha montana. HWSD v2 da un mosaico —Acrisols 24 %, Fluvisols 22 %, Leptosols 12 %, Nitisols 10 %, Luvisols 10 % y Technosols 9,5 % de suelo urbano—; SoilGrids da Cambisols 48 % y Ferralsols 31 %. Según FAO, los Nitisols están entre los suelos más productivos del trópico húmedo.',
    saberes: [],
    especies: [
      'Terap (Artocarpus elasticus)',
      'Langsat (Lansium domesticum)',
      'Dysoxylum caulostachyum',
      'Planchonia valida',
    ],
    cultivos: ['arroz', 'coco', 'platano', 'cana_azucar', 'cacao', 'taro', 'name', 'batata', 'yuca', 'arbol_pan', 'caupi', 'gliricidia', 'vetiver'],
    aptitud: [
      { uso: 'huerta', delta: -5, razon: 'Regla de acequia: sólo el 24 % de HWSD v2 son Acrisols lixiviados; el resto es mosaico de Fluvisols, Nitisols y Luvisols de base alta. SoilGrids da una fracción mayor (37 %), que daría −10, así que el valor queda con confianza baja hasta abrir el mapa nacional de BBSDLP. El −25 del bioma sobreestima la limitación de fertilidad.' },
    ],
    fuentes: [wwf('im0168', 'Western Java rain forests'), HWSD, SOILGRIDS, HENGL, WRB, FAO_SUELOS, RESOLVE],
  },

  // ID · ECO_ID 230 · bioma 1 · confianza baja · sin modificador
  java_oriental_bali_bajo: {
    id: 'java_oriental_bali_bajo',
    nombre: 'Bosques bajos estacionales de Java oriental y Bali',
    emoji: '🌿',
    color: '#7CB342',
    resumen: 'Tierras bajas de la mitad este de Java y de Bali: unos 54.000 km², más secos y menos diversos que los del oeste. Hay bosque húmedo deciduo con 1.500 a 4.000 mm y 4 a 6 meses secos, y bosque seco deciduo con menos de 1.500 mm y más de 6 meses secos. Quedan fragmentos mínimos de bosque natural y menos del 4 % está protegido. Acá la cuestión del agua es la estación seca, no el exceso de lluvia.',
    vegetacion: 'Bosque húmedo deciduo, selva semisiempreverde en la costa sur, bosque seco deciduo y bosque sobre caliza en laderas de suelo somero. Los árboles comunes de tierras bajas son Homalium tomentosum, Albizia lebbekoides, Cassia fistula, Tetrameles nudiflora y Artocarpus elasticus. Los incendios antrópicos dejan rodales monoespecíficos. El clavo de olor, que es la base de los sistemas agroforestales de la zona media, no es nativo: POWO le da como área nativa sólo Maluku, al este de la línea de Wallace.',
    fauna: 'Endemismos como el ciervo de Bawean (Axis kuhlii) y el cerdo verrugoso de Java (Sus verrucosus), además de banteng (Bos javanicus) y marta de garganta amarilla (Martes flavigula robinsoni). El estornino de Bali (Leucopsar rothschildi) está en peligro crítico. Los tigres de Java y de Bali se extinguieron. Hay presión fuerte de caza, sobre todo de murciélagos frugívoros.',
    suelos: 'Volcanitas terciarias y cuaternarias, aluviones y calizas coralinas levantadas, con suelos someros en las laderas calcáreas. Las dos bases globales se contradicen de plano: HWSD v2 da Luvisols 34 %, Vertisols 20 %, Fluvisols 15 %, Andosols 8 %, Leptosols 8 % y Nitisols 5 %, sin suelos lixiviados, y SoilGrids da Ferralsols 60 % y Acrisols 20 %, o sea 82 % lixiviado. SoilGrids WRB tiene sesgos documentados en el trópico y su mapa se volvió a correr por distorsiones en latitudes bajas, pero HWSD también es de escala gruesa, así que esta ficha no corrige el modificador del bioma hasta abrir el mapa de BBSDLP. El dato hídrico que sí sirve viene de la cuenca del Rejoso: en la zona media, de 400 a 800 m, los sistemas agroforestales necesitaron más de 80 % de cobertura arbórea para sostener la infiltración.',
    saberes: [],
    especies: [
      'Binong (Tetrameles nudiflora)',
      'Caña fístula (Cassia fistula)',
      'Albizia lebbekoides',
      'Homalium tomentosum',
      'Terap (Artocarpus elasticus)',
    ],
    cultivos: ['arroz', 'maiz_tropical', 'cana_azucar', 'coco', 'mijo', 'sorgo', 'mani', 'caupi', 'batata', 'yuca', 'chile_seco', 'cafe', 'vetiver', 'pasto_elefante'],
    fuentes: [
      wwf('im0113', 'Eastern Java-Bali rain forests'),
      SUPRAYOGO, HWSD, SOILGRIDS, HENGL, WRB,
      { label: 'Kew POWO — Syzygium aromaticum, área nativa', url: 'https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:601421-1' },
      RESOLVE,
    ],
  },

  // ID · ECO_ID 229 y 288 · bioma 1 · confianza media
  // Fusionada como se entregó. Las notas del relevamiento muestran dos subzonas
  // con datos distintos (229: 62 % Andosols y 0 % Acrisols; 288: 29 % y 28 %);
  // partirla obligaría a escribir dos textos que el relevamiento no escribió.
  java_bali_montano: {
    id: 'java_bali_montano',
    nombre: 'Selvas montanas volcánicas de Java y Bali',
    emoji: '🌋',
    color: '#2E7D32',
    resumen: 'Bosques por encima de unos 1.000 m sobre los conos volcánicos de Java y del centro de Bali, una de las islas más activas del planeta, con veinte volcanes con actividad histórica. Húmedo y casi sin estación seca al oeste; al este y en Bali el clima pasa a tropical con estación seca. Queda poco bosque —una quinta parte al oeste y alrededor de un cuarto al este— y en fragmentos aislados, cumbre por cumbre.',
    vegetacion: 'Por debajo de unos 1.200 m hay selva siempreverde y semisiempreverde. El montano bajo lo dominan fagáceas y lauráceas (Lithocarpus, Quercus, Castanopsis), con emergentes escasos como Altingia excelsa y podocarpáceas, y abundantes helechos arborescentes. Desde unos 1.800 m empieza el bosque montano alto, cargado de musgo, con Dacrycarpus y ericáceas (Rhododendron, Vaccinium, Gaultheria). Por encima de 3.000 m queda un bosque subalpino de un solo estrato arbóreo, con edelweiss de Java. Entre 1.000 y 1.200 m hay un recambio florístico real, con géneros templados como Primula, Ranunculus, Viola y Berberis.',
    fauna: 'Al oeste viven 64 mamíferos, 14 de ellos endémicos o casi endémicos, entre ellos el gibón de Java (Hylobates moloch) y el surili (Presbytis comata), los primates más amenazados de Indonesia. Más de 230 aves con 30 endemismos, como el águila-azor de Java (Spizaetus bartelsi) y la salangana de los volcanes (Aerodramus vulcanorum). El leopardo de Java (Panthera pardus melas) y el cuón (Cuon alpinus) persisten en el sector oriental.',
    suelos: 'Acá sí hay suelo volcánico joven, y es el caso que motivó todo el lote. HWSD v2 da Andosols 41 %, Luvisols 21 % y Acrisols 18 %, más Leptosols, Cambisols y Regosols; SoilGrids ve sobre todo Cambisols (75 %) con 14 % de Andosols, y discrepa en el grupo pero coincide en que lo lixiviado es minoría. El reparto no es parejo: el sector este y Bali tiene 62 % de Andosols y 0 % de Acrisols, y el oeste 29 % y 28 %. En Lembang, en Java occidental, los perfiles son Typic Hapludands con solum de 150 cm o más, densidad aparente de 0,40 a 0,68 g/cm³ y retención de fósforo mayor al 90 %: ahí está el límite real, no en la fertilidad de base. El otro límite es la pendiente: el 62 % de los suelos volcánicos de Indonesia está sobre más del 30 %, y en el Dieng los andisoles de ladera bajo papa pasaron de unas 30 t/ha a 12-15 t/ha por desbalance de nutrientes y erosión. El dato hídrico más útil viene del Rejoso, en las laderas del Bromo: hicieron falta más de 55 % de cobertura arbórea arriba y más de 80 % en la zona media para mantener la infiltración y la erosión en niveles aceptables.',
    saberes: [],
    especies: [
      'Altingia (Altingia excelsa)',
      'Podocarpo de Java (Dacrycarpus imbricatus)',
      'Edelweiss de Java (Anaphalis javanica)',
      'Robles tropicales (Lithocarpus spp., Quercus spp., Castanopsis spp.)',
      'Rododendros y arándanos de montaña (Rhododendron spp., Vaccinium spp.)',
    ],
    cultivos: ['papa', 'cafe', 'cebolla', 'zapallo_milpa', 'taro', 'batata', 'maiz_tropical', 'poroto_trepador', 'trebol_blanco', 'vetiver'],
    aptitud: [
      { uso: 'huerta', delta: -5, razon: 'Regla de acequia: el texto del bioma —«suelos lixiviados, la fertilidad está en la biomasa viva»— no describe esta ficha. HWSD v2 da 41 % de Andosols y 21 % de Luvisols contra 18 % de Acrisols, y SoilGrids también ve minoría lixiviada (10 %), así que las dos bases dan −5. El límite real es otro: pendiente, erosión y retención de fósforo mayor al 90 % en los perfiles de Lembang. Si algún día acequia penaliza la pendiente por separado, la fracción andosólica podría valer positivo; la regla actual no puede darlo.' },
    ],
    fuentes: [
      wwf('im0112', 'Eastern Java-Bali montane rain forests'),
      wwf('im0167', 'Western Java montane rain forests'),
      { label: 'Hati et al. 2021 — Differences in Andisols properties, Lembang, Java occidental, IOP Conf. Ser. EES 648:012009', url: 'https://iopscience.iop.org/article/10.1088/1755-1315/648/1/012009' },
      { label: 'Tamad, Soesanto y Karim 2023 — Potato cultivation in slope Andisols (Dieng), BIOTROPIA 30(2)', url: 'https://journal.biotrop.org/index.php/biotropia/article/download/1902/742' },
      SUPRAYOGO, SUKARMAN, HWSD, SOILGRIDS, HENGL, WRB, RESOLVE,
    ],
  },

  // ID · ECO_ID 273 · bioma 1 · confianza baja
  pantanos_borneo_suroeste: {
    id: 'pantanos_borneo_suroeste',
    nombre: 'Pantanos del suroeste de Borneo',
    emoji: '🌴',
    color: '#00695C',
    resumen: 'Pantanos de agua dulce sobre llanuras aluviales bajas, justo tierra adentro de la costa suroeste de Borneo, con algunos parches hacia el centro: unos 36.600 km². Clima tropical húmedo. Se inundan periódicamente con agua dulce rica en minerales, de pH mayor a 6. Queda boscoso sólo alrededor del 1,4 % del área original.',
    vegetacion: 'Adina, Alstonia, Campnosperma, Dillenia, Dyera, Erythrina, Eugenia, Ficus, Gluta, Lophopetalum, Memecylon, Metroxylon, Pandanus, Pentaspadon, Shorea y Vatica, con leguminosas altas (Koompassia), Calophyllum, Melanorrhoea y sagú de pantano (Metroxylon sagu).',
    fauna: 'Macaco cangrejero (Macaca fascicularis), orangután de Borneo (Pongo pygmaeus) y más de 360 aves.',
    suelos: 'WWF define esta ecorregión como pantano mineral: terrazas aluviales profundas, fértiles y bien regadas, sin cantidades importantes de turba. Los mapas no le dan la razón. HWSD v2 da Histosols 28 %, Fluvisols dístricos 27 %, Gleysols 23 % y Podzols gleicos 16 % —arenas blancas muy pobres—; PEATMAP marca 41 % del polígono como turbera y SoilGrids llega a 96 % de Histosols, lo que sugiere que el polígono incluye bordes de las turberas vecinas. La consecuencia de diseño es dura y no es de fertilidad: sobre turba, hacer huerta exige drenar, y drenar hunde y quema la turba —unos 142 cm en los primeros cinco años y después alrededor de 5 cm por año, con más del 90 % por oxidación—. En la parte mineral, con pH mayor a 6, la huerta es viable con manejo del agua.',
    saberes: [],
    especies: [
      'Sagú de pantano (Metroxylon sagu)',
      'Jelutong (Dyera sp.)',
      'Terentang (Campnosperma sp.)',
      'Kempas (Koompassia sp.)',
    ],
    cultivos: ['arroz', 'coco', 'platano', 'taro', 'name', 'yuca', 'caupi', 'gliricidia', 'vetiver'],
    aptitud: [
      { uso: 'huerta', delta: -15, razon: 'Regla de acequia: el número es negativo por turba, no por lixiviación. Con HWSD v2 más PEATMAP la fracción con limitante severa es 62 % —41 % de turba, 19 % de lixiviados sobre todo Podzols y 2 % de tiónicos—; SoilGrids, con 96 % de Histosols, daría −25. Confianza baja por esa horquilla. Donde caiga turba la regla no es enmendar sino no drenar: el hundimiento es de unos 5 cm/año y no se revierte.' },
    ],
    fuentes: [wwf('im0153', 'Southwest Borneo freshwater swamp forests'), HWSD, SOILGRIDS, HENGL, PEATMAP, HOOIJER, RESOLVE],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Filipinas
  // ─────────────────────────────────────────────────────────────────────────

  // PH · ECO_ID 241 · bioma 1 · confianza baja
  luzon_bajo: {
    id: 'luzon_bajo',
    nombre: 'Selvas bajas de Luzón',
    emoji: '🌾',
    color: '#689F38',
    resumen: 'Tierras bajas de Luzón por debajo de unos 1.000 m: unos 95.600 km², con la llanura central, el valle del Cagayán y el arco de Bicol. Las temperaturas van de 25 a 28 °C y el régimen de lluvia cambia por sector: el suroeste recibe lluvia todo el año, el valle del Cagayán es seco de noviembre a abril, el sureste es más lluvioso de mayo a enero y el noroeste tiene estación lluviosa de mayo a octubre. Queda un 24 % de cobertura forestal.',
    vegetacion: 'Selva de dipterocarpáceas de hasta 60 m de altura, con troncos de 1 a 2 m de diámetro. Hay manglares, bosque de playa con Casuarina y Barringtonia, y pastizales.',
    fauna: 'El águila filipina (Pithecophaga jefferyi) tiene entre 52 y 104 individuos en Luzón. Viven acá el zorro volador de corona dorada (Acerodon jubatus), la musaraña-ratón de Isarog (Archboldomys luzonensis) y la oropéndola de Isabela (Oriolus isabellae).',
    suelos: 'HWSD v2 da Nitisols 43 % —de los más productivos del trópico húmedo según FAO, aunque con alta sorción de fósforo—, Acrisols 16 %, Vertisols 10 %, Cambisols gleicos 10 %, Luvisols 8 % y Andosols 7 %; SoilGrids da Cambisols 41 %, Acrisols 23 %, Gleysols 11 %, Ferralsols 11 % y Vertisols 7 %. Esta ficha promedia la llanura aluvial central, el valle del Cagayán y el arco volcánico de Bicol, así que el número es grueso. Los Gleysols y Cambisols gleicos —alrededor del 10 %— señalan drenaje impedido en la llanura: es un problema de agua, no de fertilidad.',
    saberes: [],
    especies: [
      'Dipterocarpáceas (Dipterocarpaceae)',
      'Casuarina (Casuarina spp.)',
      'Barringtonia (Barringtonia spp.)',
    ],
    cultivos: ['arroz', 'coco', 'maiz_tropical', 'cana_azucar', 'platano', 'batata', 'taro', 'name', 'caupi', 'mani', 'yuca', 'chile_seco', 'cebolla', 'vetiver'],
    aptitud: [
      { uso: 'huerta', delta: -5, razon: 'Regla de acequia: el texto del bioma no describe esta ficha. HWSD v2 da 43 % de Nitisols más Vertisols y Luvisols de base alta, con sólo 16 % de Acrisols; SoilGrids da 33 % lixiviado, que daría −10. Lo que limita en la llanura es el drenaje impedido, que no entra en este número.' },
    ],
    fuentes: [wwf('im0123', 'Luzon rain forests'), HWSD, SOILGRIDS, HENGL, WRB, FAO_SUELOS, RONDA, RESOLVE],
  },

  // PH · ECO_ID 240 · bioma 1 · confianza baja · sin modificador
  luzon_montano: {
    id: 'luzon_montano',
    nombre: 'Selvas montanas de Luzón',
    emoji: '🏔️',
    color: '#2E5D34',
    resumen: 'Bosques por encima de unos 1.000 m en la Sierra Madre norte y sur, los montes Sapocoy, Magnas y Agnamala, y los montes de Zambales: unos 8.300 km². En algunos sectores llueven hasta 10.000 mm al año, el cuádruple que en las tierras bajas. La Sierra Madre tiene poca estacionalidad; el norte de la Cordillera Central y Zambales son más estacionales. Luzón es oceánica: nunca estuvo unida al continente.',
    vegetacion: 'Desde unos 1.000 m los robles y laureles reemplazan a las dipterocarpáceas de abajo. Abundan las epífitas y los pandanos trepadores (Freycinetia), y en las cumbres hay bosque montano alto o élfico. El frío frena la descomposición y el suelo acumula un mantillo grueso de humus.',
    fauna: 'Archboldomys musseri es endémico estricto. Entre los casi endémicos están Otopteropus cartilagonodus, Tryphomys adustus y Apomys sacobianus. Hay aves como la pita de Koch (Pitta kochi), Ptilinopus marchei y el cálao de Luzón (Penelopides manillae), y mamíferos grandes como el macaco cangrejero, el cerdo verrugoso filipino (Sus philippensis) y el ciervo filipino (Cervus mariannus).',
    suelos: 'Pese al nombre del lote, acá no hay andisoles dominantes: son el 1 % en las dos bases. HWSD v2 da Acrisols 71 % y Nitisols 26 %, y SoilGrids da Cambisols 69 %, Acrisols 19 % y Ferralsols 11 %: 20 puntos de diferencia en la fracción lixiviada, así que esta ficha no corrige el modificador del bioma. A escala nacional los Ultisols son el orden más extenso de Filipinas, con 41,5 % del territorio, pero eso es un dato de país y no desempata un polígono. Haría falta la cartografía de BSWM de la Sierra Madre y Zambales; en Zambales hay además un complejo ofiolítico ultramáfico que no se verificó para esta ficha.',
    saberes: [],
    especies: [
      'Pandanos trepadores (Freycinetia spp.)',
      'Robles y laureles (Fagaceae, Lauraceae)',
    ],
    cultivos: ['taro', 'batata', 'cafe', 'papa', 'zapallo_milpa', 'name', 'maiz_tropical', 'poroto_trepador', 'vetiver'],
    fuentes: [wwf('im0122', 'Luzon montane rain forests'), HWSD, SOILGRIDS, HENGL, FAO_SUELOS, RONDA, RESOLVE],
  },

  // PH · ECO_ID 303 · bioma 3 (coníferas tropicales) · confianza baja · sin modificador
  pinar_luzon: {
    id: 'pinar_luzon',
    nombre: 'Pinares de la Cordillera Central de Luzón',
    emoji: '🌲',
    color: '#5D7B3A',
    resumen: 'Pinares de Benguet (Pinus kesiya) por encima de 1.000 m en la Cordillera Central, al noroeste de Luzón: unos 7.000 km². Llueven alrededor de 2.500 mm al año, y más de 4.000 mm algunos años en el monte Pulog. La estacionalidad es marcada —seco de noviembre a abril, lluvias máximas de mayo a agosto—, las temperaturas rondan los 20 °C y rara vez pasan de 26 °C. Los tifones golpean las laderas del oeste.',
    vegetacion: 'Pinar de Pinus kesiya, que WWF también cita como P. insularis, entre 1.000 y 2.500 m. Forma un paisaje de pastizal con árboles, intercalado con bosque montano.',
    fauna: 'Las ratas de las nubes (Crateromys, Phloeomys) son mamíferos endémicos. Hay 23 aves casi endémicas, y el piquituerto (Loxia curvirostra) vive en el pinar.',
    suelos: 'HWSD v2 da Acrisols 72 % y Nitisols 27 %; SoilGrids da Cambisols 83 % y Acrisols 10 %. Son 15 puntos de diferencia, y esta ficha no corrige el modificador del bioma: haría falta la cartografía de BSWM de Benguet y Mountain Province. Lo que sí está medido y pesa más que el grupo de suelo es la erosión: sin medidas de conservación, la pérdida en Benguet es de unas 62 t/ha/año. Sea cual sea el suelo, la ladera es el límite dominante para la huerta acá.',
    saberes: [],
    especies: [
      'Pino de Benguet (Pinus kesiya)',
    ],
    cultivos: ['papa', 'cebolla', 'zapallo_milpa', 'maiz_tropical', 'poroto_trepador', 'batata', 'taro', 'cafe', 'trebol_blanco', 'vetiver'],
    fuentes: [wwf('im0302', 'Luzon tropical pine forests'), HWSD, SOILGRIDS, HENGL, RONDA, FAO_SUELOS, RESOLVE],
  },

  // PH · ECO_ID 248 · bioma 1 · confianza baja · sin modificador
  mindoro: {
    id: 'mindoro',
    nombre: 'Selvas de Mindoro',
    emoji: '🐃',
    color: '#4C8C4A',
    resumen: 'La isla de Mindoro y las islas Semirara: unos 10.100 km². La costa oeste tiene estación lluviosa con el monzón del suroeste, de junio a octubre, y seca con el del noreste, de noviembre a febrero. En 1988 quedaba un 8,5 % de bosque.',
    vegetacion: 'Selva siempreverde de tierras bajas hasta unos 400 m o más, bosque abierto entre 650 y 1.000 m y bosque musgoso por encima. Históricamente hubo selva de dipterocarpáceas y bosque semicaducifolio, y quedan restos de Pinus merkusii a baja altura.',
    fauna: 'Tamaraw (Bubalus mindorensis), cerdo verrugoso filipino, cocodrilo filipino y paloma apuñalada de Mindoro (Gallicolumba platenae).',
    suelos: 'Mindoro no es un arco volcánico joven: junto con Palawan y las Calamianes se separó del continente asiático hace unos 32 millones de años, bajo el mar, y emergió hace 5 a 10 millones. Eso confirma la sospecha del lote, pero no alcanza para dar un número: HWSD v2 da Acrisols 50 %, Nitisols 29 %, Cambisols gleicos 16 % y Andosols 2 %, y SoilGrids da Cambisols 53 %, Acrisols 22 %, Gleysols 11 % y Andosols 9,5 %. Son 25 puntos de diferencia en la fracción lixiviada, así que esta ficha no corrige el modificador del bioma. Haría falta la cartografía de BSWM de Mindoro.',
    saberes: [],
    especies: [
      'Pino de Mindoro (Pinus merkusii)',
      'Dipterocarpáceas (Dipterocarpaceae)',
    ],
    cultivos: ['arroz', 'coco', 'maiz_tropical', 'batata', 'yuca', 'caupi', 'mani', 'platano', 'taro', 'vetiver'],
    fuentes: [wwf('im0130', 'Mindoro rain forests'), HWSD, SOILGRIDS, HENGL, FAO_SUELOS, RESOLVE],
  },

  // PH · ECO_ID 231 · bioma 1 · confianza baja · sin modificador
  negros_panay: {
    id: 'negros_panay',
    nombre: 'Selvas de Negros, Panay y Cebú',
    emoji: '🌋',
    color: '#43A047',
    resumen: 'Negros, Panay, Cebú, Masbate, Ticao y Guimaras: unos 35.000 km². Clima tropical húmedo con unos 2.419 mm al año, y julio y agosto como los meses más lluviosos. Las costas oeste de Panay y Negros tienen estación seca de noviembre a febrero. En 1988 Negros tenía 4 % de bosque, Panay 8 % y Cebú un 0,3 % del original.',
    vegetacion: 'Selva de dipterocarpáceas de 45 a 65 m (Dipterocarpus, Shorea, Hopea, con narra, Pterocarpus indicus), bosque de dipterocarpáceas de colina alto y bosque montano con robles, laureles y castaños.',
    fauna: 'Ciervo moteado filipino (Cervus alfredi), cerdo verrugoso de las Visayas (Sus cebifrons), cocodrilo filipino, paloma apuñalada de Negros (Gallicolumba keayi), cálao tarictic (Penelopides panini) y pájaro-flor de Cebú (Dicaeum quadricolor).',
    suelos: 'La geología varía isla por isla y casi todas emergieron hace 6 millones de años o menos: Negros tiene una cadena de volcanes y Cebú un espinazo abrupto de calizas, margas y karst con pendientes de más del 18 %. HWSD v2 da Nitisols 39 %, Luvisols 19 %, Acrisols 14 %, Andosols 9 % y Vertisols 8 %, y SoilGrids da Acrisols 58 %, Cambisols 30 % y Andosols 5 %: casi 50 puntos de diferencia. Esta ficha no corrige el modificador del bioma, y el motivo de fondo es que junta una isla volcánica, una de calizas y una tercera sin separar sus suelos. Haría falta la cartografía de BSWM por provincia.',
    saberes: [],
    especies: [
      'Narra (Pterocarpus indicus)',
      'Apitong y afines (Dipterocarpus spp.)',
      'Lauán (Shorea spp.)',
      'Yakal y afines (Hopea spp.)',
    ],
    cultivos: ['cana_azucar', 'arroz', 'coco', 'maiz_tropical', 'platano', 'batata', 'yuca', 'mani', 'caupi', 'chile_seco', 'vetiver'],
    fuentes: [wwf('im0114', 'Greater Negros-Panay rain forests'), HWSD, SOILGRIDS, HENGL, FAO_SUELOS, RESOLVE],
  },

  // PH · ECO_ID 246 · bioma 1 · confianza media
  mindanao_montano: {
    id: 'mindanao_montano',
    nombre: 'Selvas montanas de Mindanao',
    emoji: '🦅',
    color: '#2F6B3A',
    resumen: 'Bosques montanos de Mindanao hasta 2.700 m —Kitanglad, Apo y los altos de Bukidnon—: unos 18.100 km². Clima tropical húmedo modificado por la altura: en Malaybalay llueven 2.569 mm y a 1.500 m, 2.825 mm. Hacia 1988 quedaba alrededor del 29 % del bosque de Mindanao. Es el hábitat del águila filipina.',
    vegetacion: 'Bosque de dipterocarpáceas de colina (Hopea, Shorea, Dipterocarpus), bosque montano bajo y alto (Lithocarpus, Cinnamomum, Agathis), bosque musgoso élfico y pastizales de cumbre. Abundan los helechos arborescentes (Cyathea) y las orquídeas epífitas.',
    fauna: 'Águila filipina (Pithecophaga jefferyi), en peligro crítico; martín pescador de gorro azul (Actenoides hombroni); cerdo verrugoso filipino (Sus philippensis); ciervo filipino (Cervus mariannus nigricans); tupaya filipina (Urogale everetti); rata lunar de Mindanao (Podogymnura truei).',
    suelos: 'Casi toda Bukidnon es de origen volcánico, salvo el sur, que es sedimentario, y esa es justamente la trampa: son suelos volcánicos ya meteorizados, no andisoles jóvenes, porque el Andisol pierde sus propiedades al meteorizarse. La revisión regional los clasifica como Inceptisols, Ultisols y Alfisols, y nombra el limitante principal: la fijación de fósforo, entre 85 y 90 % del P inorgánico agregado queda no disponible; un pH menor a 5,5 agrega riesgo de toxicidad por aluminio. HWSD v2 da Nitisols 45 %, Acrisols 35 % y Andosols 18 %; SoilGrids da Ferralsols 44 %, Cambisols 39 % y Acrisols 12 %. Todos los suelos de altura de Bukidnon son deficientes en nitrógeno y fósforo.',
    saberes: [],
    especies: [
      'Almácigas (Agathis spp.)',
      'Lauán y afines (Shorea spp., Hopea spp., Dipterocarpus spp.)',
      'Helechos arborescentes (Cyathea spp.)',
      'Canelos (Cinnamomum spp.)',
    ],
    cultivos: ['cafe', 'cacao', 'platano', 'taro', 'batata', 'maiz_tropical', 'zapallo_milpa', 'papa', 'cebolla', 'gliricidia', 'vetiver'],
    aptitud: [
      { uso: 'huerta', delta: -10, razon: 'Regla de acequia, con la revisión regional de Bukidnon como tercera fuente: no son andisoles jóvenes sino suelos volcánicos meteorizados —Inceptisols, Ultisols y Alfisols—. HWSD v2 da 35 % de Acrisols contra 45 % de Nitisols y SoilGrids 55 % lixiviado, dentro de los 5 puntos. El −25 del bioma exagera, pero el límite existe y tiene nombre: fijación de fósforo del 85-90 %, acidez y pendiente.' },
    ],
    fuentes: [
      wwf('im0128', 'Mindanao montane rain forests'),
      { label: 'Dejarme-Calalang y Colinet 2014 — A review of soils and crops in the Bukidnon Highlands, BASE 18(4):544-557', url: 'https://popups.uliege.be/1780-4507/index.php?id=11691' },
      HWSD, SOILGRIDS, HENGL, FAO_SUELOS, RONDA, RESOLVE,
    ],
  },

  // PH · ECO_ID 247 · bioma 1 · confianza baja · sin modificador
  mindanao_visayas_oriental: {
    id: 'mindanao_visayas_oriental',
    nombre: 'Selvas bajas de Mindanao y las Visayas orientales',
    emoji: '🌧️',
    color: '#388E3C',
    resumen: 'Tierras bajas de Mindanao, Samar, Leyte, Bohol y sus islas satélite, por debajo de 1.000 m: unos 105.000 km². Durante el Pleistoceno fueron una sola isla, el «Gran Mindanao». Clima tropical húmedo. En el norte los tifones, de julio a noviembre, pueden aportar hasta un tercio de la lluvia anual; Mindanao queda al sur de la trayectoria principal.',
    vegetacion: 'El bosque dominante era de dipterocarpáceas —caoba filipina— desde el nivel del mar hasta más de 400 m, de 45 a 65 m de altura y con tres estratos. En el bosque de colina alto aparecen Shorea polysperma, robles, castaños y Elaeocarpus. Hay manglar y bosque de playa.',
    fauna: 'Cerdo verrugoso filipino, ciervo filipino, tarsero filipino (Tarsius syrichta), colugo filipino (Cynocephalus volans), tupaya filipina, águila filipina y cocodrilo filipino (Crocodylus mindorensis).',
    suelos: 'Geología heterogénea: Mindanao y las Visayas llegaron a su posición actual en los últimos 25 millones de años, y el borde oriental tiene ofiolitas mesozoicas en Samar, Tacloban, Malitbog, el sureste de Bohol, Dinagat y Pujada. HWSD v2 da Nitisols 46 %, Acrisols 20 %, Luvisols 11 %, Cambisols 9 %, Gleysols 7 % y Andosols 4,5 %; SoilGrids da Acrisols 38 %, Ferralsols 31 % y Cambisols 27 %, o sea 68 % lixiviado contra 20 %. Esta ficha no corrige el modificador del bioma, y hay una razón más: sobre las unidades ultramáficas de Dinagat se forman lateritas niquelíferas, pobres en nutrientes, que ningún promedio de ecorregión representa. Eso pide una capa geológica aparte, no un número.',
    saberes: [],
    especies: [
      'Lauán (Shorea polysperma)',
      'Dipterocarpáceas (Dipterocarpaceae)',
      'Elaeocarpos (Elaeocarpus spp.)',
    ],
    cultivos: ['coco', 'arroz', 'cacao', 'platano', 'name', 'taro', 'batata', 'yuca', 'caupi', 'arbol_pan', 'gliricidia', 'vetiver'],
    fuentes: [
      wwf('im0129', 'Mindanao-Eastern Visayas rain forests'),
      { label: 'Dimalanta et al. 2020 — Proto-Philippine Sea Plate ophiolites, Geoscience Frontiers doi:10.1016/j.gsf.2019.01.005', url: 'https://www.sciencedirect.com/science/article/pii/S1674987119300349' },
      { label: 'Barrientos et al. 2024 — Cagdianao nickel laterite, Dinagat, IOP Conf. Ser. EES 1373:012041', url: 'https://ouci.dntb.gov.ua/en/works/4YEdKGR4/' },
      HWSD, SOILGRIDS, HENGL, FAO_SUELOS, RESOLVE,
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // El Decán central — la única del bloque que no es bioma húmedo
  // ─────────────────────────────────────────────────────────────────────────

  // IN · ECO_ID 290 · bioma 2 · confianza media
  decan_central_hardwickia: {
    id: 'decan_central_hardwickia',
    nombre: 'Bosques secos del Decán central',
    emoji: '🐅',
    color: '#8C7B52',
    resumen: 'Centro de la meseta del Decán, en India: unos 240.000 km² repartidos entre Madhya Pradesh, Maharashtra, Karnataka y Andhra Pradesh, con el Godavari cruzándola y el extremo occidental de la cordillera de Satpura en el norte. Es la ecorregión de los bosques de Hardwickia, un tipo de vegetación que WWF separó a propósito de los bosques secos de teca y de sal que cubren el resto de la meseta. Se perdió alrededor del 80 % del hábitat natural según la evaluación de WWF de 2002, y hay una segunda medición que va al lado y no en lugar de ésa: Kalam y otros (2025), que reconstruyeron el monte seco de la India desde 1880 con mapas satelitales empalmados con mapas históricos, miden para esta ecorregión 4,7 millones de hectáreas perdidas, el 66,2 %, entre 1880 y 2020, y 1,03 millones, el 30 %, entre 1995 y 2020. No son la misma cuenta: una es fracción de hábitat natural y la otra superficie de monte seco. Lo que queda, en todo caso, no está pulverizado: hay bloques de más de 5.000 km² sobre los bordes sur y este, y por eso la ecorregión pesa en la estrategia continental del tigre. Dieciséis áreas protegidas cubren cerca del 3 %, y la mayor es la reserva de tigres de Nagarjunasagar, de más de 3.500 km². Estado declarado: crítico o en peligro.',
    vegetacion: 'La asociación característica es el monte de Hardwickia binata con Albizia amara. Dosel superior de 15 a 25 m sobre un estrato de 10 a 15 m, con lianas en el bosque maduro y sotobosque escaso. El acompañamiento cambia de norte a sur: en el norte teca, incienso de la India, Lannea coromandelica, Anogeissus latifolia, Albizia lebbeck, Lagerstroemia parviflora, Diospyros tomentosa y khair; en el sur sándalo rojo, palo de kino, Chloroxylon swietenia, Terminalia chebula, T. tomentosa y Dalbergia latifolia. Donde no hay teca, Hardwickia domina sola: en los distritos de Chittoor, Cuddapah y Kurnool forma un bosque de dos pisos, un estrato de unos 20 m casi puro que emerge sobre otro de unos 15 m con las especies comunes de la serie seca. La teca, en cambio, se queda en los mejores sitios, porque sólo arraiga en suelo bien drenado. Y conviene saber que el árbol que define a esta ecorregión de bosque seco deciduo es de hoja perenne, de copa liviana, hecho para la seca y para el fuego, con raíz pivotante profunda que alcanza la reserva de agua subterránea; se lo encuentra más seguido en suelos muy superficiales o esqueléticos, rebrota de tocón y los plantines se recuperan después de quemarse. Una flora fósil del Mioceno, con géneros de selva húmeda perennifolia como Dipterocarpus, Hopea y Mesua, dice que el clima de acá fue otro. El matorral espinoso que la rodea no es siempre un estado natural distinto: la fuente advierte que parte de esas formaciones son probablemente series de reemplazo que hoy ocupan superficie de las series más húmedas.',
    fauna: 'Ochenta y dos especies de mamíferos, ninguna endémica de la ecorregión: tigre (Panthera tigris), búfalo salvaje (Bubalus arnee), cuón (Cuon alpinus), oso bezudo (Melursus ursinus), antílope de cuatro cuernos o chousingha (Tetracerus quadricornis), gaur (Bos gaurus), antílope negro (Antilope cervicapra), chinkara (Gazella bennettii) y la ardilla gigante de la India (Ratufa indica). Las aves son más ricas: casi 300 especies, y una sola casi endémica, la corredora de Jerdon (Rhinoptilus bitorquatus), nocturna, redescubierta en 1986 después de que el último registro fuera de 1900. La única población conocida se reparte entre esta ecorregión y la del matorral espinoso del Decán, y dos santuarios se crearon para protegerla: Sri Lankamaleswara, de 464 km², y Sri Penusila Narasimha, de 1.031 km².',
    suelos: 'Acá no hay reparto de HWSD ni de SoilGrids: es la única ficha del bloque sin porcentajes, porque el relevamiento no los extrajo para este polígono y no se inventan. Lo que sí hay es algo mejor para diseñar, porque está medido adentro de la ecorregión. En Patancheru, al lado de Hyderabad, el ICRISAT tiene microcuencas de 2 a 5 ha sobre vertisol profundo, vertisol de profundidad media y alfisol, con escurrimiento y pérdida de suelo medidos de 8 a 12 años y una serie hidrológica de 1976 a 2010. El resultado va contra la intuición de cualquier tabla por textura: en años normales, de 600 a 900 mm, el vertisol arcilloso con cultivo escurre del 7 al 11 % de la lluvia y el alfisol arenoso, que tiene conductividad saturada más alta, escurre del 16 al 17 %. El motivo que dan los autores es doble: el alfisol se encostra y se sella, y el vertisol se agrieta al principio de la temporada y además guarda muchísima agua. Esa es la clave del lugar. La infiltración de un vertisol no es un número sino una curva que se derrumba: 76 mm por hora en la primera media hora, 34 en la segunda, 4 mm por hora ya en la segunda hora y 0,21 después de 144 horas. Y la capacidad de agua útil es de unos 230 mm en el vertisol profundo contra unos 120 en el somero, que es lo que decide si hay cosecha después de las lluvias. De ahí sale la práctica tradicional y su costo: más de la mitad de la superficie de vertisol se deja en barbecho durante toda la temporada de lluvia para llenar el perfil, y un vertisol profundo en barbecho escurre 17 %, tanto como la arena, porque le queda menos almacenamiento libre. En Sholapur, sobre pendiente del 1 al 2 %, eso midió 50 cm de suelo perdidos en cien años. Tres cosas para el diseño. La primera: la obra publicada para este suelo es un camellón ancho con surco a pendiente del 0,4 al 0,8 %, o sea un drenaje con desagües y cauces empastados, no una zanja de infiltración a nivel; el limitante del monzón acá es el exceso de agua y el anegamiento, no la falta. La segunda: ese camellón bajó el escurrimiento de 35 a 40 mm en vertisol y de 15 a 20 en alfisol, y la pérdida de suelo del 30 al 60 %, pero no en los eventos de alta intensidad, y entre una y dos tormentas grandes se llevan la mayor parte del total anual en los dos suelos. La tercera, sobre el número que da esta misma app: el grupo hidrológico se deriva de la conductividad saturada, así que un vertisol cae en grupo D, con la leyenda de poca infiltración y alta escorrentía, y el coeficiente anual que sale de ahí queda muy por encima del 7 al 11 % medido con cultivo y del 17 % en barbecho. Si vas a dimensionar una represa en este suelo, el número medido es el que vale.',
    saberes: [],
    especies: [
      'Anjan (Hardwickia binata)',
      'Albizia amara',
      'Sándalo rojo (Pterocarpus santalinus)',
      'Incienso de la India (Boswellia serrata)',
      'Teca (Tectona grandis)',
      'Dhaura (Anogeissus latifolia)',
      'Khair (Senegalia catechu)',
      'Palo de kino (Pterocarpus marsupium)',
    ],
    cultivos: ['sorgo', 'mijo', 'maiz_tropical', 'trigo', 'garbanzo', 'guandul', 'mani', 'girasol', 'algodon', 'soja'],
    aptitud: [
      { uso: 'huerta', delta: -10, razon: 'Se mantiene el número del bioma y se cambia la variable que lo decide. El bioma dice que sin riego ni cosecha de agua la huerta queda parada varios meses del año, y acá lo que manda no es el total de lluvia sino la profundidad del perfil: un vertisol profundo guarda unos 230 mm de agua útil y uno somero unos 120, y con esa diferencia se cosecha o no se cosecha después de las lluvias, sin una gota de riego. Más de la mitad de la superficie de vertisol se maneja así, con barbecho en la temporada de lluvia para llenar el perfil. Así que antes que la lluvia anual, mirá la reserva de agua útil en el panel de suelo: con reserva alta la ventana de la huerta se corre al post-monzón y este castigo sobra, y con reserva baja el ciclo se corta en cuanto paran las lluvias y el límite es más duro que lo que dice este número. Un solo delta no puede decir las dos cosas, y por eso queda el del bioma.' },
      { uso: 'forestal', delta: 15, razon: 'El bioma no dice nada del uso forestal y acá es lo que la tierra degradada acepta. Se perdió cerca del 80 % del hábitat natural, y la especie que define la ecorregión vuelve igual: Hardwickia binata es de hoja perenne y copa liviana, aguanta la seca y el fuego, rebrota de tocón, los plantines se recuperan después de quemarse, tiene raíz pivotante profunda que alcanza la reserva de agua subterránea y se la encuentra más seguido en suelos muy superficiales o esqueléticos. La fuente agrega lo que cierra el caso: regenera incluso en suelos compactados por el ganado, que es justo la condición de la que habría que partir. El contrapeso está escrito en la misma fuente y hay que decirlo: su madera es la más dura y pesada de la India y resistente a las termitas, y por eso se la extrae en todas partes. Este número vale para rearmar el monte, no para cosechar el que queda en pie.' },
    ],
    fuentes: [wwf('im0201', 'Central Deccan Plateau dry deciduous forests'), ONE_EARTH_290, FAO_FORMACIONES, FAO_VERTISOLES, PATHAK, GARG, KALAM, MPKV, RESOLVE],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Las otras dos del Decán — el norte y el sur de la misma meseta seca
  // ─────────────────────────────────────────────────────────────────────────

  // IN · ECO_ID 297 · bioma 2 · confianza media
  decan_norte_sal: {
    id: 'decan_norte_sal',
    nombre: 'Bosques secos del Decán norte',
    emoji: '🦌',
    color: '#9B784A',
    resumen: 'El extremo norte de los bosques secos deciduos de la India: unos 58.000 km² —5.845.000 ha— en una isla seca a sombra de lluvia de los Ghats orientales, rodeada por completo de bosque deciduo húmedo. Hoy esa isla cae en Odisha, Chhattisgarh y Jharkhand, y hay que decirlo porque las dos fuentes la describen con los estados de antes del año 2000, Bihar, Orissa y Madhya Pradesh: Jharkhand y Chhattisgarh se separaron en noviembre de 2000 y Orissa se llama Odisha desde 2011. Las cuatro áreas protegidas de la propia tabla de WWF lo confirman —Sunabeda y Debrigarh en Odisha, Kanger Ghati y Gomarda en Chhattisgarh— y su justificación de delineación nombra la provincia biótica de Chhota-Nagpur, que es la meseta de Jharkhand. Cuánto queda lo contestan dos evaluaciones distintas y van las dos: WWF (2002) dice más de tres cuartas partes del hábitat aclarado o degradado, con unos pocos bloques intactos de más de 2.000 km², y One Earth (2020) dice cerca del 90 %. Las cuatro protegidas suman 1.460 km² en la tabla del WCMC de 1997 —unos 1.600 km² para One Earth—, alrededor del 2,5 % de la ecorregión, y sólo una pasa los 500 km². No es rica ni endémica: no hay mamíferos endémicos de la ecorregión y ninguna de las 261 aves lo es. Lo que la hace pesar es otra cosa: es un eslabón del programa del tigre de la India. Estado declarado: crítico o en peligro.',
    vegetacion: 'El tipo forestal corresponde a las vegetaciones Shorea-Buchanania-Cleistanthus y Shorea-Cleistanthus-Croton que mapearon Gaussen y otros en 1973. La original era un bosque multiestrato dominado por el sal (Shorea robusta), y en buena parte quedó reemplazada por teca (Tectona grandis), que prefiere las condiciones más secas; lo que hay hoy es mayormente matorral abierto, convertido a matorral y sabana arbolada por el pastoreo intensivo, el fuego y la extracción de productos no madereros. Las asociaciones que la fuente enumera son Anogeissus latifolia, Dalbergia latifolia, Pterocarpus marsupium, Stereospermum suaveolens, Spondias pinnata, Cleistanthus collinus, Acacia lenticularis, Flacourtia indica, Boswellia serrata, Butea monosperma, Sterculia urens, Cochlospermum religiosum y Euphorbia nivulia, con manchones gregarios de bambú macizo (Dendrocalamus strictus) en los sectores más húmedos. Hay un dato de esa lista que sirve para plantar y conviene no pasar de largo: Cleistanthus collinus puede liberar sustancias tóxicas para otras especies, y por eso aparecen rodales monoespecíficos. Un manchón puro de esa especie no es un buen sitio de arranque para una mezcla. Y sobre el pastoreo: la fuente dice que el fuego se prende con regularidad para favorecer tierra de pastoreo. Eso mide la presión que hay, no la aptitud del sitio, así que el +10 de pasturas del bioma queda como está, con su advertencia de descanso, y no se mueve con ese argumento.',
    fauna: 'Sesenta y ocho especies de mamíferos, ninguna endémica de la ecorregión. Entre las amenazadas, el tigre (Panthera tigris), el cuón o dhole (Cuon alpinus), el oso bezudo (Melursus ursinus) y el antílope de cuatro cuernos o chousingha (Tetracerus quadricornis), que es la especie emblema que elige One Earth: unos 60 cm a la cruz, uno de los antílopes más chicos que se conocen, con dos pares de cuernos —uno detrás de las orejas y otro en la frente—, solitario o en grupos de tres a cinco, que vive en bosque seco con sotobosque o cobertura de pasto densa y se corre de donde hay actividad humana. Las 261 aves no incluyen ninguna endémica. Dos son cálaos, el gris indio (Ocyceros birostris) y el oriental de pico blanco (Anthracoceros albirostris), y las dos necesitan árboles altos y maduros para anidar, por lo que las fuentes las proponen como especies focales del manejo forestal: si el monte que queda no tiene árboles grandes, los cálaos no están, y eso se puede mirar sin ser biólogo.',
    suelos: 'Acá tampoco hay reparto de HWSD ni de SoilGrids: no se extrajo para este polígono y no se inventa. Pero hay algo mejor que una presunción, y contesta la pregunta que importaba: esta ecorregión está afuera de la traza basáltica del Decán, y el vertisol negro del encabezado del bloque no se hereda. Bandyopadhyay y otros (2025) midieron índices de pedogénesis en catenas de los distritos de Sambalpur y Koraput, en Odisha, y Sambalpur es justamente donde está Debrigarh, una de las cuatro áreas protegidas de la ecorregión. Lo que encontraron: en piedemontes y tierras altas de granito-gneis, cuarcita y khondalita, alfisoles rojos ferruginosos (Typic Rhodustalfs), y Rhodic Paleustalfs en las tierras altas de charnockita, con alta rojez y alto desarrollo relativo del perfil, o sea perfiles maduros y relictuales. En los valles entre cerros, los valles y las planicies la pedogénesis está estancada y con gleyización —Aquic Rhodustalfs, Aquic Haplustalfs, Oxyaquic Haplustalfs y Typic Endoaqualfs— bajo condiciones reducidas. La consecuencia de diseño está en el propio trabajo, porque el índice de calidad de suelo les sale inverso al de pedogénesis: los valles y las planicies, con calidad alta, son los que aguantan diversificación de cultivos, y las tierras altas y los piedemontes, al revés, los promueven para agrihorticultura, agroforestería y horti-silvicultura. Eso es evidencia de catenas en dos distritos y no un porcentaje para el polígono entero, así que no se declara ninguna distribución: lo que sí se puede decir es cuál es el orden que aparece y qué cambia según dónde caiga el predio en la ladera.',
    saberes: [],
    especies: [
      'Sal (Shorea robusta)',
      'Teca (Tectona grandis)',
      'Dhaura (Anogeissus latifolia)',
      'Palo de rosa de la India (Dalbergia latifolia)',
      'Palo de kino (Pterocarpus marsupium)',
      'Incienso de la India (Boswellia serrata)',
      'Cleistanthus collinus',
      'Bambú macizo (Dendrocalamus strictus)',
    ],
    aptitud: [
      { uso: 'huerta', delta: -10, razon: 'Se mantiene el número del bioma y se cambia la variable. El bioma penaliza porque sin riego ni cosecha de agua la huerta queda parada varios meses del año, y eso sigue valiendo. Lo que agrega el lugar es dónde cae el predio en la ladera: el trabajo de pedogénesis hecho en catenas de esta misma ecorregión encuentra el índice de calidad de suelo invertido respecto del de madurez, y de ahí saca que los valles y las planicies son los que aguantan diversificación de cultivos, mientras las tierras altas y los piedemontes de alfisol rojo maduro los promueve para agrihorticultura y agroforestería. Así que antes que la lluvia, mirá la pendiente y la posición en el relieve: en el fondo de valle el sitio da más de lo que este número dice, y en la media loma la huerta es la menos indicada de las opciones que el lugar acepta. Un solo delta no puede decir las dos cosas, y por eso queda el del bioma. El contrapeso del valle está en el mismo trabajo y hay que decirlo: esa calidad alta viene con gleyización, o sea con agua estancada parte del año.' },
      { uso: 'forestal', delta: 10, razon: 'El bioma seco no nombra el uso forestal, y acá hay con qué nombrarlo. Entre tres cuartas partes y el 90 % del hábitat ya está aclarado o degradado, así que lo probable es que el predio esté sobre tierra alta o de piedemonte y no sobre monte en pie, y el trabajo de catenas de esta ecorregión promueve para esas posiciones, textualmente, agrihorticultura, agroforestería y horti-silvicultura: sistemas con árbol, sobre el suelo que ya hay. El contrapeso es lo que impide leer esto como una autorización para cortar: los dos cálaos de la ecorregión necesitan árboles altos y maduros para anidar, y lo que queda de monte grande es justamente lo escaso. Este número vale para armar monte nuevo, no para carnear el que está en pie. Y una advertencia de plantación: Cleistanthus collinus, que está en la lista de la fuente, puede liberar sustancias tóxicas para otras especies, y un rodal puro de esa especie no es un buen punto de partida para una mezcla.' },
      { uso: 'reserva', delta: 15, razon: 'Las acciones de conservación prioritarias que publica la ficha de esta ecorregión no hablan sólo de las reservas: la segunda pide asegurar los bosques y los montes poco degradados que dan conectividad o están pegados a las reservas existentes, como hábitat protegido adicional. Eso está dirigido a la tierra de afuera, que es donde está el predio. Cuatro áreas protegidas sobre alrededor del 2,5 % de la ecorregión, una sola de más de 500 km², y bloques de más de 2.000 km² todavía en pie: lo escaso acá no son las especies —no hay endemismos y la propia fuente dice que no es excepcionalmente rica— es la superficie conectada. Si una parte del predio es monte o monte poco degradado y linda con lo que queda, dejarla es la decisión que la evaluación pide.' },
    ],
    fuentes: [wwf('im0208', 'Northern Dry Deciduous Forests'), ONE_EARTH_297, BANDYOPADHYAY, RESOLVE],
  },

  // IN · ECO_ID 298 · bioma 2 · confianza media
  decan_sur_elefantes: {
    id: 'decan_sur_elefantes',
    nombre: 'Bosques secos del Decán sur',
    emoji: '🐘',
    color: '#A77B45',
    resumen: 'La mitad sur de la meseta del Decán, a sotavento de los Ghats occidentales, repartida entre Karnataka y Tamil Nadu: unos 82.000 km² —8.243.000 ha— de bosque seco alto. Acá vive la población de elefante asiático más grande del mundo. One Earth describe el rango de elefantes Brahmagiri-Nilgiri-Ghats orientales, 12.000 km² que entran desde el bosque deciduo húmedo de los piedemontes hasta el corazón de esta ecorregión, con unos 6.300 animales; WWF, citando a Sukumar (1989), estima más de 6.000 para la población de los Nilgiris a los Ghats orientales y la llama la mayor población única de elefantes de la India. Más del 80 % del bosque natural está aclarado, con dos bloques contiguos grandes que aguantan en el norte, y las siete áreas protegidas suman unos 1.110 km², poco más del 1 % de la ecorregión, ninguna de más de 500 km²: la propia evaluación llama a esa cobertura lamentablemente inadecuada. El estado pasó de en peligro a crítico por la presión de la población humana sobre los bloques que quedan. Y hay una segunda medición, de otro tipo y con otra ventana, que va al lado y no en lugar de la primera: Kalam y otros (2025) reconstruyeron el monte seco de la India desde 1880 y para esta ecorregión miden una pérdida de 1,7 millones de hectáreas, el 62 %, entre 1880 y 2020, y de 0,5 millones, el 34,6 %, entre 1995 y 2020. No son la misma cuenta: una es la fracción de bosque natural aclarada según la evaluación de WWF y la otra es superficie de monte seco de un conjunto de mapas satelitales empalmado con mapas históricos.',
    vegetacion: 'Champion y Seth (1968) los clasifican como bosques deciduos mixtos secos del sur, donde la teca no es conspicua. La estructura es de tres pisos: dosel superior de 15 a 25 m, estrato intermedio de 10 a 15 y sotobosque de 3 a 5, con lianas en el bosque maduro y denso. La vegetación se caracteriza por Boswellia serrata, Anogeissus latifolia, Acacia catechu, Terminalia tomentosa, Terminalia paniculata, Terminalia bellirica, Chloroxylon swietenia, Albizia amara, Cassia fistula, Hardwickia binata, Dalbergia latifolia, Stereospermum personatum, Pterocarpus marsupium, Diospyros montana y Shorea talura. El sándalo indio (Santalum album) es una de las especies importantes de este bosque y fue extraído selectivamente de casi todos los bosques de la ecorregión: es la madera considerada la segunda más cara del mundo. La lluvia anual va de 900 a 1.500 mm, porque la cordillera intercepta la humedad del monzón del suroeste y el relieve ondulado modula cuánta sombra de lluvia le toca a cada sector, con veranos de más de 40 °C. Al oeste la flanquea bosque deciduo húmedo y al este matorral espinoso, así que la ecorregión es probablemente una transición de humedad de oeste a este. Hay un dato que explica qué pasa si se pastorea sin descanso, y está visto en el paisaje y no deducido: las plantas espinosas se vuelven más comunes donde la presión de pastoreo es alta, y la mayor parte de estos bosques secos ya está degradada a matorral espinoso. Por eso el +10 de pasturas del bioma queda como está, con su advertencia de descanso: el dato dice qué cuesta ignorarla, no que el sitio no sirva. Y una abstención, que también es una decisión: el bioma seco no nombra el uso forestal y acá no se le agrega, al revés de lo que se hizo en el Decán central. El único árbol de alto valor que la fuente destaca ya fue extraído selectivamente de casi todos los bosques, y eso habla de la presión de extracción y no de si el sitio cría monte; y las prioridades publicadas para esta ecorregión son de conservar lo que está en pie y de conectar, no de plantar. Si aparece un trabajo de restauración de bosque seco del sur del Decán, el número sale de ahí.',
    fauna: 'Setenta y cinco especies de mamíferos, una casi endémica: el murciélago frugívoro de Salim Ali (Latidens salimalii), en peligro crítico. Entre las amenazadas, el elefante asiático (Elephas maximus), el cuón (Cuon alpinus), el oso bezudo (Melursus ursinus), el chousingha (Tetracerus quadricornis), el gaur (Bos gaurus) y la ardilla gigante grisácea (Ratufa macroura). Unas 260 aves, con dos casi endémicas: el charlatán rufo (Turdoides subrufus) y el bulbul de garganta amarilla (Pycnonotus xantholaemus). Dos más están amenazadas a escala global y la fuente pide atención para ellas, la avutarda india (Ardeotis nigriceps) y el florican menor (Eupodotis indica). Dos unidades de conservación del tigre de prioridad alta, Periyar-Kalakad y Dandeli-Bandipur, se pisan con partes de la ecorregión. Y una advertencia que la fuente da sobre los errores de planificación, que vale para el diseño de un predio: acá la conservación mal planificada introdujo especies exóticas y convirtió pastizal y matorral abierto, que son justamente los hábitats que la avutarda y el florican necesitan. El claro no es automáticamente tierra disponible.',
    suelos: 'Tampoco hay reparto de HWSD ni de SoilGrids para este polígono, y acá además no hay un trabajo medido adentro de la ecorregión como el que tiene el Decán norte. Lo que hay es una sola frase del primario, y es la que decide el diseño: las laderas onduladas tienen suelos muy someros. En una ecorregión donde la lluvia va de 900 a 1.500 mm, un perfil somero significa poca reserva de agua útil por más que llueva, y eso se mira en el panel de suelo. Dos cosas que no se afirman. La primera: el vertisol negro del encabezado del bloque no se hereda tampoco acá, porque éste es otro basamento y otro relieve que el del Decán central, y cuál es el orden dominante sigue sin contestarse con datos comparables. La segunda: existen porcentajes de órdenes publicados para el estado de Tamil Nadu entero y no entraron, por dos motivos que se suman, que un estado no es el polígono y que la página que los publica no abre desde acá, así que no se cita lo que no se pudo leer. Lo que falta para cerrar esto es el resumen zonal de las dos bases de suelo contra el polígono 298, que es trabajo de este lado y no de bibliografía.',
    saberes: [],
    especies: [
      'Sándalo indio (Santalum album)',
      'Incienso de la India (Boswellia serrata)',
      'Dhaura (Anogeissus latifolia)',
      'Anjan (Hardwickia binata)',
      'Palo de rosa de la India (Dalbergia latifolia)',
      'Chloroxylon swietenia',
      'Albizia amara',
      'Terminalia tomentosa',
    ],
    aptitud: [
      { uso: 'huerta', delta: -10, razon: 'Se confirma el número del bioma y se nombran las dos variables que lo mueven adentro de la ecorregión, porque acequia las mide las dos. La primera es la lluvia anual, que va de 900 a 1.500 mm según cuánta sombra de lluvia le toque al sector: al oeste la flanquea bosque deciduo húmedo y al este matorral espinoso, así que el extremo seco de esta ecorregión ya es vecino de la estepa espinosa y el húmedo no. La segunda es la profundidad del perfil: la fuente dice que las laderas onduladas tienen suelos muy someros, y un perfil somero deja poca reserva de agua útil por más que llueva. Mirá los dos campos juntos: con lluvia alta y perfil profundo este castigo es más duro que el sitio, y con cualquiera de las dos cosas en contra —900 mm, o media loma somera— es más suave que el sitio. El bioma penaliza por falta de agua y eso no se cancela con un argumento de suelo: queda el −10 y lo que cambia es dónde mirar.' },
      { uso: 'reserva', delta: 20, razon: 'Las acciones prioritarias que publica la ficha de esta ecorregión son tres y dos están dirigidas a la tierra de afuera de las reservas: planificar el uso del suelo para evitar el desmonte no regulado y recuperar conectividad, e integrar al sistema de áreas protegidas los bosques y las áreas de conservación no tradicionales. Siete áreas protegidas sobre poco más del 1 % de la ecorregión, ninguna de más de 500 km², con la propia evaluación llamando a eso lamentablemente inadecuado, y todo adentro de un rango de 12.000 km² que sostiene la población de elefante asiático más grande del mundo. Un predio ahí comparte terreno con ese corredor, se lo planifique o no, y dejar en reserva lo que queda de monte es la pieza que el sistema público no tiene. Lo que este número no dice es dónde pasa el corredor: la ecorregión entera lo contiene, el trazado fino no está en estas fuentes y se verifica en el terreno.' },
    ],
    fuentes: [wwf('im0209', 'South Deccan Plateau dry deciduous forests'), ONE_EARTH_298, KALAM, RESOLVE],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Las tres del 05/11/2026 — cada una destraba una práctica ya escrita
  // ─────────────────────────────────────────────────────────────────────────

  // IN/BD · ECO_ID 323 · bioma 14 · confianza media
  manglares_sundarbans: {
    id: 'manglares_sundarbans',
    nombre: 'Manglares del Sundarbans',
    emoji: '🌊',
    color: '#2F6B57',
    resumen: 'El manglar más grande del mundo, en el delta que forman juntos el Ganges, el Hooghly, el Padma, el Brahmaputra y el Meghna: 2.048.000 ha repartidas entre Bangladesh y la India, sobre un delta de más de 10.000 km². El nombre es el del árbol que lo domina, Heritiera fomes, que en bengalí se llama sundri. Y hay algo que el nombre de la ficha esconde y que decide todo lo demás: el polígono no es sólo manglar. El Banco Mundial cuenta, del lado indio, unos 4.200 km² de bosque de reserva y unos 5.400 km² de área no forestada sobre el borde norte y noroeste, que es la parte habitada: 54 islas con más de 4,4 millones de personas, repartidas en 19 bloques administrativos de North y South 24 Parganas. Eso no está afuera de la ecorregión: Gosaba, Basanti, Sagar e Hingalganj —cuatro de esos bloques— dan los cuatro 323 contra RESOLVE. Del bosque total, unos 10.200 km², cerca del 40 % cae en Bengala Occidental y el resto en Bangladesh. El 40 % del bosque de reserva indio está declarado área protegida, y la reserva de tigres del Sundarbans suma 2.585 km², de los cuales 1.600 son tierra y 985 son agua. One Earth le pone meta de conservación del 35 % y nivel de protección 9 sobre 10, el más alto de las fichas de este bloque. La mitad del manglar, en cambio, ya se cortó para leña.',
    vegetacion: 'Comunidad dominada por Heritiera fomes, con Avicennia, Xylocarpus, Sonneratia, Bruguiera, Ceriops, Aegiceras y Rhizophora, y nipa —una palma adaptada a estuarios— bordeando los canales. El bosque sin disturbar tiene dosel denso y un sotobosque de plantines y renovales de las mismas especies del dosel. UNESCO cuenta 81 especies de plantas de manglar, la mayor diversidad de manglar del planeta. Y acá hay que detenerse en la lluvia, porque las tres fuentes no dicen lo mismo y la diferencia es grande: One Earth da más de 3.500 mm anuales para la ecorregión; UNESCO da 1.920 mm de media anual para la reserva de biosfera india; y el volumen de la UICN para el lado de Bangladesh mide, adentro del bosque, de 1.600 mm en el oeste a 2.000 mm en el este, con el 80 a 85 % cayendo entre mayo y septiembre. Dos mediciones independientes caen entre 1.600 y 2.000 y la cifra de escala de ecorregión casi la duplica. No se elige una: acequia lee la lluvia en el punto y el panel de clima es el que manda. Lo que sí hay que leer de esas fuentes es el balance, que es el dato que diseña: el presupuesto de precipitación de la UICN da una estación seca severa de seis meses en la que la lluvia queda por debajo de la demanda de evapotranspiración por unos 500 mm, con el peor momento entre febrero y abril, cuando la humedad del suelo está en su mínimo anual y el único agua disponible para transpirar es la superficial de los ríos y los caños. En el invierno seco las mareas se quedan bajas y áreas grandes del manglar pasan un período expuesto, sin inundación mareal. Los ciclones violentos aparecen de mediados de mayo a mediados de junio y otra vez en octubre y principios de noviembre; los de otoño duran más, traen lluvia y vienen con marea de tormenta.',
    fauna: 'Es el único manglar que sostiene una población viable de tigre (Panthera tigris), que vive y nada entre las islas y caza chital, jabalí y hasta macacos; la gente que entra a juntar miel, pescar y hacer carbón también cae de vez en cuando. Más de 170 especies de aves, con 12 rapaces coexistiendo. Entre los mamíferos amenazados, el gato pescador (Prionailurus viverrinus), que se mete al agua a cazar peces y cangrejos sobre el borde de los canales, el gato selvático, pangolines y zorros voladores. En el agua, el cocodrilo de pantano y el marino (Crocodylus porosus), el varano acuático —el segundo lagarto más grande del mundo—, tiburones y delfines del Ganges (Platanista gangetica). Y los saltarines del fango, peces que respiran aire, salen del agua a los bancos de barro y trepan a los árboles. UNESCO cuenta para la reserva india 1.586 especies animales: más de 40 mamíferos, 163 aves, 56 reptiles, 165 peces, 23 moluscos, 15 langostinos y 67 cangrejos.',
    suelos: 'Aluvión deltaico reciente, fino, bajo mareas. Acá no hay reparto de HWSD ni de SoilGrids —no se extrajo para este polígono y no se inventa—, y el trabajo sobre suelos sulfatados ácidos del delta del Ganges, que es de licencia CC-BY, no se cita porque su editorial contesta con una verificación anti-bot y no se pudo leer. Lo que sí hay es el mecanismo completo, medido y publicado, y es más útil que cualquier porcentaje. El terraplén que protege también hunde. Los terraplenes del Sundarbans —3.500 km en total, de los cuales 800 km son vulnerables a romperse, y construidos desde mediados del siglo XIX— se levantaron para dejar afuera la marea, y al hacerlo cortaron por completo la deposición de sedimento adentro de las áreas protegidas: la tierra ya no tiene cómo subir sola. El resultado es tierra baja, típicamente por debajo de la línea de marea alta, que se inunda con lluvia fuerte y pasa períodos largos de agua estancada durante el kharif, y eso condiciona qué se puede sembrar, con qué variedad y cuánto se cosecha. De ahí el predominio del arroz aman de monzón: el informe lo dice sin vueltas, para el agricultor no hay elección efectiva. La sal entra por dos caminos distintos, y conviene saber cuál es cuál porque se corrigen distinto: por inundación mareal cuando el terraplén se rompe, y por ascenso capilar desde las capas de abajo durante el rabi, el invierno. Para cultivar hay que lavar esas sales hacia abajo con agua dulce, y agua dulce casi no hay: los acuíferos dulces están, en promedio, entre 160 y 400 m de profundidad. Un análisis de más de 10.000 muestras de suelo de ocho bloques encontró el 32,4 % con salinidad alta —conductividad eléctrica por encima de 3 mmho/cm— y cerca del 40 % del área bruta cultivada de los bloques de North 24 Parganas está afectada por sal. Después de un ciclón la sal se suele lavar con unas pocas lluvias fuertes y la tierra vuelve a servir; después del Aila el suelo tardó más de un año de lluvias, y el mecanismo de la casa fue migrar a Calcuta y volver cuando el suelo se recuperó. Dos números de escala, para no diseñar sobre una finca imaginaria: la tenencia media entre quienes cultivan es de 0,36 ha, el 55,5 % de los que tienen tierra propia tienen entre 0,01 y 0,20 ha, y sólo el 16,3 % hace policultivo. El arroz es la producción principal; el informe nombra además frutas, verduras, sésamo, algodón, legumbres y hoja de betel, y el girasol, el algodón y el poroto mungo entran por programas de fomento. La hoja de betel y el mungo no tienen id en el catálogo de cultivos y van nombrados acá.',
    saberes: [],
    especies: [
      'Sundri (Heritiera fomes)',
      'Mangle gris (Avicennia marina)',
      'Mangle rojo (Rhizophora apiculata)',
      'Keora (Sonneratia apetala)',
      'Mangle de flores grandes (Bruguiera gymnorhiza)',
      'Goran (Ceriops decandra)',
      'Nipa (Nypa fruticans)',
    ],
    cultivos: ['arroz', 'sesamo', 'algodon', 'girasol'],
    aptitud: [
      { uso: 'huerta', delta: -35, razon: 'Se confirma el número del bioma y se cambia la variable que lo decide. El bioma castiga por suelo salino y anegado, y para el manglar intermareal eso basta; pero el polígono incluye 54 islas con 4,4 millones de personas que cultivan, así que la pregunta no se puede contestar con la lluvia anual. La variable es si la parcela está detrás de un terraplén y cuánta sal sube en el rabi. Y la respuesta medida no es buena para la huerta: adentro del terraplén la deposición de sedimento se cortó, la tierra no sube, queda por debajo de la marea alta y se anega largo en el kharif, y el informe del Banco Mundial dice que la tierra intermareal ganada sólo sirve para un solo cultivo de arroz, porque el riego de invierno es imposible por la salinidad de la marea. La restricción principal que declaran los propios productores es la falta de riego: el 42 % depende de la lluvia y sólo el 6 % tiene pozo o estanque. Así que antes que el total de lluvia, mirá el agua dulce disponible y la época: si hay forma de lavar sal con agua dulce en el rabi, este castigo es más duro que el sitio; si no la hay, es exactamente el sitio.' },
      { uso: 'frutales', delta: -35, razon: 'Se confirma, y por un motivo que es propio de lo perenne y no aparece en el número de la huerta. El bioma ya dice que ningún frutal tolera la salinidad y la falta de oxígeno del suelo intermareal, y que plantar exige drenar. Lo que agrega el lugar es el riesgo que corre una inversión de varios años: la sal entra cuando el terraplén se rompe, y hay 800 km de terraplén vulnerable sobre 3.500. Un cultivo anual pierde una temporada y vuelve a sembrar cuando unas lluvias fuertes lavaron la sal; después del ciclón Aila el suelo tardó más de un año de lluvias en recuperarse, y eso es lo que mata un monte frutal recién plantado. Si igual se planta, el criterio no es la especie sino la cota y la distancia al terraplén.' },
      { uso: 'pasturas', delta: -30, razon: 'Se confirma. Sobre el manglar intermareal el número es del bioma y no hace falta discutirlo. Detrás del terraplén el límite es otro y conviene nombrarlo: no hay base forrajera que sostener, porque la tierra baja y anegada va al único cultivo posible, el arroz de monzón, y la tenencia media entre quienes cultivan es de 0,36 ha. Lo que se mide después del ciclón dice cuánto cuesta ignorarlo —el 80 % de los hogares encuestados tenía menos animales que el año anterior, el 40 % por inundación, el 30 % por enfermedad y el 15 % por falta de forraje—, pero eso mide lo que pasó y no la aptitud del sitio: el delta queda por lo primero.' },
      { uso: 'reserva', delta: 30, razon: 'Se confirma el número del bioma con el mecanismo del lugar, que es defensa de costa y es cuantificable. Los bosques del Sundarbans forman la barrera natural que protege de los ciclones y de la marea a los cerca de 14 millones de habitantes de la región metropolitana de Calcuta y a los asentamientos del delta. Y hay una lectura más chica y más directa para quien tiene un predio acá: el manglar que queda por delante del terraplén es lo que sostiene al terraplén, de cuyos 3.500 km ya hay 800 vulnerables. Dejar el manglar en pie no es una concesión al paisaje, es la obra de protección más barata que hay en el predio. One Earth le pone meta de conservación del 35 % con nivel de protección 9 sobre 10, y el 40 % del bosque de reserva indio ya está declarado área protegida.' },
    ],
    fuentes: [ONE_EARTH_323, BANCO_MUNDIAL_SUNDARBANS, UNESCO_SUNDARBANS, UICN_SUNDARBANS, RESOLVE],
  },

  // MM · ECO_ID 294 · bioma 2 · confianza media
  bosques_secos_irrawaddy: {
    id: 'bosques_secos_irrawaddy',
    nombre: 'Bosques secos del Irrawaddy',
    emoji: '🐢',
    color: '#A8753F',
    resumen: 'Varios manchones de bosque seco en las cuencas del Irrawaddy, el Sittaung y el Salween, en el centro de Myanmar: 3.516.000 ha —unos 35.160 km²— en el único país que la ecorregión toca. Es la zona seca del país, a sombra de lluvia, y es además una de las regiones más pobladas y más cultivadas de Myanmar: casi todo el bosque ya fue convertido y lo que queda está degradado. Tiene uno de los tres refugios importantes de la tortuga estrellada birmana, en peligro crítico, y el santuario de vida silvestre de Minzontaung —22,6 km², chico— sostiene una población globalmente importante de esa especie, protegida por la creencia local de que matarla o juntarla trae mala suerte. Una corrección de lectura, porque es fácil de repetir: One Earth le pone meta de conservación del 9 % y nivel de protección 1, y ese nivel no es la fracción protegida sino el porcentaje de la meta de la Red de Seguridad Global en una escala de 0 a 10; la página no publica qué porcentaje de la ecorregión está protegido. La mayoría de los mamíferos grandes que vivían acá fue extirpada.',
    vegetacion: 'Árboles espinosos, achaparrados y de poca altura —Terminalia oliveri, Tectona hamiltoniana, Senegalia catechu y Bauhinia racemosa— y los bosques de dipterocarpáceas que localmente se llaman Indaing, que se clasifican en Indaing alto y bajo por la estructura: el alto tiene dipterocarpáceas grandes y altas, y el bajo son los mismos bosques achaparrados, en buena medida por corte y quema repetidos del alto. Los dos tipos están extendidos y se caracterizan por Dipterocarpus tuberculatus, Shorea oblongifolia, Shorea siamensis y teca (Tectona grandis), la madera por la que Birmania fue famosa. También son comunes los bambúes altos: Dendrocalamus strictus, Bambusa polymorpha y B. tulda. La lluvia es el dato que ordena todo lo demás, y hay que leerlo entero: son unos 650 mm anuales, que empiezan alrededor de mediados de julio y caen de forma esporádica y torrencial hasta octubre, y la frase que explica el diseño es que rara vez hay más de quince días de lluvia en el año. La FAO encuadra la zona seca central entre 500 y 1.000 mm en su perfil hídrico y entre 728 y 849 mm en su documento de suelos, contra una media nacional de 2.341 mm; el extremo húmedo del país, en la costa de Rakhine y Tanintharyi, llega a 4.000 o 6.000 mm. Dos cosas más que esta ecorregión tiene y que no son la lluvia: los vientos del sur del verano erosionan los sustratos blandos de arenisca y arcilla, y el rango térmico amplio meteoriza esas rocas blandas; y la recarga subterránea es casi nula, por lo que la escasez de agua es extrema.',
    fauna: 'Más de 300 especies de aves, con dos casi endémicas que lo son de los bosques secos de Myanmar: la urraca arbórea encapuchada de cola de raqueta (Crypsirina cucullata) y el charlatán de garganta blanca (Turdoides gularis). La urraca está restringida a la zona seca del centro del país, en especial a las planicies de inundación del Irrawaddy y el Sittaung, y sus poblaciones cayeron fuerte en los últimos años. La ecorregión se pisa con el Área de Aves Endémicas de las Planicies del Irrawaddy justamente por esas dos especies de rango restringido, y contiene varias Áreas Clave de Biodiversidad, sobre todo en tramos del río. La fauna que queda en las áreas protegidas es mayormente de talla media y chica: muntíaco, ciervo de Eld, sambar, leopardo común, gato selvático y chacal dorado. La especie emblema es la tortuga estrellada birmana.',
    suelos: 'No hay reparto de HWSD ni de SoilGrids para este polígono: no se extrajo y no se inventa. Y hay una advertencia que vale más que una presunción, porque el encabezado de este bloque habla del Decán: el vertisol negro de la traza basáltica no se hereda acá. Es otro país y otro basamento, y lo que el primario describe son sustratos blandos de arenisca y arcilla, erosionados por el viento del verano y meteorizados por el rango térmico, que no es basalto. Lo que sí se puede citar es la tabla nacional de tipos de suelo de la FAO, con el aviso de que es nacional y no una estadística del polígono: la catena de luvisoles ocupa 1,78 millones de ha —el 2,6 % del país— y la FAO le asigna como cultivos adecuados arroz, chile, maní, sésamo, algodón, legumbres, caña de azúcar, forraje, girasol, sorgo y hortalizas; el vertisol ocupa 0,48 millones de ha —el 0,7 %— con una lista parecida. Los luvisoles pueden tener un horizonte arcilloso compacto y poca reserva útil arriba; el vertisol guarda humedad pero se fisura y se anega por temporada. Cuál de los dos le toca al predio no lo contesta esta ficha: lo contesta el panel de suelo.',
    saberes: [],
    especies: [
      'Teca de hojas chicas (Tectona hamiltoniana)',
      'Terminalia oliveri',
      'Khair (Senegalia catechu)',
      'Bauhinia racemosa',
      'Dipterocarpo del Indaing (Dipterocarpus tuberculatus)',
      'Shorea siamensis',
      'Teca (Tectona grandis)',
      'Bambú macizo (Dendrocalamus strictus)',
    ],
    cultivos: ['arroz', 'mani', 'sesamo', 'chile_seco', 'algodon', 'sorgo', 'cana_azucar', 'girasol', 'maiz_tropical'],
    aptitud: [
      { uso: 'huerta', delta: -10, razon: 'Se confirma el número del bioma y se afila el motivo, que es más duro de lo que el bioma supone. El bioma dice que sin riego ni cosecha de agua la huerta queda parada varios meses del año. Acá la FAO dice algo peor: en Mandalay, Sagaing y Magway, que son la zona seca central, hace falta riego suplementario para el arroz de la temporada de lluvia, porque la lluvia no alcanza a cubrir la demanda del cultivo. No es que falte agua en la seca: falta también cuando llueve. Y el agua que hay es traída, con una historia larga: las primeras obras se hicieron cerca de Bagan en los siglos XI y XII, eran desvíos sobre tributarios del Irrawaddy medio y se construyeron justamente para darle seguridad al cultivo de la temporada principal. Hoy, de 1.841.000 ha regadas en el país en 2000, el 46 % se riega con bomba, el 31 % por canal, el 11 % por tanque y el 4 % por pozo entubado; todo el riego de Myanmar es por superficie y la expansión del bombeo eléctrico está limitada por el suministro de electricidad. Así que la variable es si el predio está adentro de un área de riego o tiene un pozo cavado a mano, y no cuánto llueve. Y una consecuencia de diseño que sale de los quince días de lluvia al año: con esa distribución el que decide es el almacenamiento, no repartir la infiltración a lo largo de la temporada.' },
      { uso: 'pasturas', delta: 10, razon: 'Se confirma el número del bioma con su advertencia, que acá tiene una razón extra y visible. El bioma dice que el pulso estacional favorece el pastoreo pero sólo con descanso, porque al final de la seca el suelo queda expuesto justo cuando llegan las primeras lluvias fuertes. En esta ecorregión las primeras lluvias son torrenciales y esporádicas desde mediados de julio, y el suelo descubierto tiene además dos agentes que el bioma no nombra: los vientos del sur del verano, que erosionan los sustratos blandos de arenisca y arcilla, y el rango térmico, que los meteoriza. La cobertura al final de la seca no es un detalle estético acá, es lo que impide que el perfil se vaya con la primera tormenta.' },
      { uso: 'reserva', delta: 15, razon: 'El bioma seco no nombra el uso de reserva y acá hay con qué nombrarlo, porque la tercera acción prioritaria que publica la ficha de la ecorregión está dirigida a la tierra de afuera de las áreas protegidas: traer los bosques que quedan, en especial los de las Áreas Clave de Biodiversidad que no están protegidas, bajo un paraguas de protección. La escala dice por qué: el único área protegida que la ficha nombra son 22,6 km² sobre 35.160, casi todo el bosque ya fue convertido y lo que queda está degradado. Dos aves de rango restringido dependen de eso —la urraca encapuchada está confinada a la zona seca y a las planicies de inundación del Irrawaddy y el Sittaung, y viene cayendo— y las Áreas Clave de Biodiversidad están sobre tramos del río. Si una parte del predio es monte en pie y linda con el río, dejarla es la pieza que el sistema público no tiene.' },
    ],
    fuentes: [ONE_EARTH_294, FAO_MYANMAR_AGUA, FAO_MYANMAR_SUELOS, RESOLVE],
  },

  // IN/LK · ECO_ID 315 · bioma 13 · confianza media
  matorral_espinoso_decan: {
    id: 'matorral_espinoso_decan',
    nombre: 'Matorral espinoso del Decán',
    emoji: '🌵',
    color: '#9B754A',
    resumen: 'El matorral espinoso bajo y ralo de las partes áridas de la meseta del Decán: 34.100.000 ha —341.000 km²— que se extienden por varios estados de la India y llegan hasta la península de Jaffna, en el norte de Sri Lanka. Lo primero, porque ya costó una entrada de otro lote: el 315 no es el 290. Dhule, Sakri, Shindkheda, Malegaon y Jalgaon dan los cinco 315, y Jaffna también; el Decán central de Hardwickia es otro polígono. Llueve menos de 750 mm, con casi todo entre mayo y octubre, y el verano pasa de 40 °C. Esas condiciones más siglos de influencia humana dieron el matorral de dosel bajo con árboles espinosos cortos y ralos que la ecorregión representa; hay manchones de bosque seco deciduo repartidos que bien pueden haber sido la vegetación original, antes de que la actividad humana empujara la transición al matorral. Once áreas protegidas apenas cubren el 1 % de la superficie. Acá vive la única población conocida de la corredora de Jerdon, un ave nocturna y terrestre descripta en 1848, redescubierta en 1986 después de que el último registro fuera de 1900. Y los manchones de bosque seco de las sierras de Tirupathi, que siguen bien forestadas, son conocidos por su flora medicinal y por una cícada endémica y amenazada, Cycas beddomei, restringida a esas sierras.',
    vegetacion: 'Dominan las acacias espinosas, que pasan a matorral de Euphorbia donde la lluvia es más baja y el sustrato queda expuesto y rocoso. La FAO ubica a esta formación dentro de las de matorral espinoso seco de la India, que van de bosque bajo a estepa desértica y aparecen desde el extremo sureste de la península por la faja semiárida del Decán a sotavento de los Ghats hasta Rajastán: vegetación xerófila, predominantemente espinosa, sobre suelos generalmente erosionados, pobres en nutrientes o fisiológicamente secos, con flora pobre y muy marcada por factores de degradación biótica. De esa clasificación salen las dos series que le corresponden a este polígono, Albizia amara en el sur de la India y Acacia catechu con Acacia arabica —hoy Vachellia nilotica— en la llanura del Decán y Gujarat. La misma fuente agrega una advertencia que conviene no saltear: parte de estos matorrales espinosos son probablemente series de reemplazo que hoy ocupan superficie de las series más húmedas, así que encontrar matorral no prueba que el sitio no dé más. La falta de un dosel cerrado deja pasar el sol y permite que crezcan pastos abajo, y esos pastos con las acacias sostienen varios mamíferos pastadores y ramoneadores y aves especialistas de pastizal: la avutarda india, el florican menor y la corredora de Jerdon. Prosopis juliflora, exótica y espinosa, está invadiendo las áreas degradadas junto con otras exóticas y empuja al ganado hacia las reservas forestales a buscar pastoreo. Y una distinción que decide un número: la fuente dice que el pastoralismo es un motor principal de la degradación, del pastoreo intenso con vacunos a la extracción de recursos del monte. Eso mide lo que hace la gente, no lo que el sitio aguanta, así que el −15 de pasturas del bioma queda con su propio argumento y no se mueve con ése.',
    fauna: 'Los herbívoros van del chousingha o antílope de cuatro cuernos, que es chico, al antílope negro y el ciervo manchado, y de ahí al sambar, el nilgai y el gaur. Entre los carnívoros grandes, tigre, leopardo común, chacal dorado, hiena rayada y jaurías de cuón; entre los chicos, gato selvático y zorro indio. Puede que queden poblaciones chicas de lobo indio en las áreas más remotas, pero se cree que la mayoría fue eliminada por una combinación de envenenamiento en represalia por la depredación de ganado y de falta de presas. El oso bezudo está pero no es común. La especie emblema es la corredora de Jerdon (Rhinoptilus bitorquatus), y la ecorregión comparte su única población con la del Decán central.',
    suelos: 'Acá no hay reparto de HWSD ni de SoilGrids —no se extrajo para este polígono— pero sí hay algo medido adentro, y es lo mejor que tiene esta ficha. La agencia de aguas subterráneas de Maharashtra, en su ficha del distrito de Dhule, que da 315, reporta el 93 % del distrito sobre basalto de la traza del Decán y el 7 % sobre aluvión del Tapi, y nombra los basaltos presentes: masivo, porfídico, amigdaloidal y zeolítico. Y da el dato que hay que mirar antes de contar con un pozo: el nivel del agua por división geológica. En las sierras del norte, sobre basalto amigdaloidal negro, está entre 2 y 5 m en la temporada de lluvia y entre 8 y 12 m en verano; en la sierra de Satmala, sobre basalto vesicular fracturado y zeolítico, entre 5 y 8 m contra 10 y 12 m. Esa distancia entre las dos columnas es la advertencia: el nivel que hay cuando llueve no es el nivel que hay cuando el cultivo lo necesita. Tres de los cuatro tahsils del distrito están declarados propensos a sequía. Y la lluvia anual no tiene un solo valor ni adentro de un mismo distrito: el GSDA da 512 mm para Dhule y el comisionado divisional de Nashik da 674 mm para el mismo Dhule, un 32 % de diferencia entre dos oficinas del mismo estado. La segunda agrega el gradiente interno, que es lo que de verdad sirve: el 88 % de la lluvia cae en el monzón del suroeste, julio es el mes más lluvioso, y Navapur, sobre el borde occidental contra los Ghats y el Satpuda, llega a 1.097,1 mm. Así que no se toma un anual de tabla: acequia lo lee en el punto. Lo que no se hace acá, y es una decisión: no se transfiere el escurrimiento medido del Decán central. En las microcuencas del ICRISAT, que están adentro del 290, el vertisol arcilloso con cultivo escurre del 7 al 11 % de la lluvia y el alfisol arenoso del 16 al 17 %, al revés de lo que dice cualquier tabla por textura. Es la misma provincia basáltica, pero es otro polígono, otra lluvia y otras pendientes, y no se encontró una medición comparable para el 315. Si aparece una, el número sale de ahí y no de acá.',
    saberes: [],
    especies: [
      'Albizia amara',
      'Khair (Senegalia catechu)',
      'Babul (Vachellia nilotica)',
      'Acacias espinosas (Acacia spp.)',
      'Euphorbias arborescentes (Euphorbia spp.)',
      'Cícada de Beddome (Cycas beddomei)',
    ],
    cultivos: ['trigo', 'mijo', 'sorgo', 'cebolla', 'algodon'],
    aptitud: [
      { uso: 'huerta', delta: -25, razon: 'Se confirma el número del bioma y se le corrige el ejemplo, que acá está mal elegido. El bioma dice que sin agua traída de otro lado no hay huerta y que el sistema histórico es el oasis; es cierto lo primero y no lo segundo. El sistema histórico del noroeste de Maharashtra es el phad: un desvío comunitario que saca agua del río con un bandhara, la pasa por canal a través de bloques de parcelas y la devuelve al río. No es un oasis, que concentra agua propia en un punto, sino un reparto en tránsito, con turnos. El GSDA cuenta 36 phad bandharas en el solo distrito de Dhule, muchos en buen estado y funcionando, y el registro le atribuye más de mil años. Que exista y sea viejo no levanta el castigo, y esto es lo que decide: la misma administración dice que la mayor parte del distrito no está bajo riego y que el cultivo depende fuertemente del monzón. Así que la variable es si el predio cae en el área de mando de un phad o abajo de un bandhara. Si cae, este número es más duro que el sitio; si no cae, es el sitio, y lo que define la ventana de la huerta es la profundidad del nivel de agua en verano, que acá se va a 8 o 12 m sobre basalto.' },
      { uso: 'pasturas', delta: -15, razon: 'Se confirma, y como límite de carga y de recuperación, que es lo que el bioma quiso decir: la carga que aguanta es baja y el error se paga con desertificación. Lo que agrega el lugar son las dos condiciones físicas que lo explican: lluvia por debajo de 750 mm concentrada entre mayo y octubre, con el resto del año seco, y sectores con el sustrato expuesto y rocoso, donde el matorral de acacias ya pasó a matorral de Euphorbia. Que acá el pastoralismo sea un motor principal de la degradación, con pastoreo intenso de vacunos, no se usa para este número: mide lo que está pasando y no lo que el sitio puede. Hay una consecuencia de manejo que sí sale de eso y vale decirla: Prosopis juliflora está invadiendo lo degradado y empuja al ganado hacia las reservas, así que el costo de sobrecargar no se paga sólo en kilos sino en una invasora que ocupa el lugar del pasto.' },
      { uso: 'reserva', delta: 15, razon: 'Se confirma el número del bioma, y acá el argumento es de superficie y no de costra biológica. Once áreas protegidas apenas cubren el 1 % de la ecorregión, y la propia evaluación dice que todavía quedan manchones dispersos del hábitat original que pueden y deberían conservarse. Lo que depende de esos manchones tiene nombre: la única población conocida de la corredora de Jerdon, la avutarda india, el florican menor y la cícada endémica Cycas beddomei. Y la primera acción recomendada está dirigida a la tierra de afuera de las reservas: evitar más conversión y degradación de los manchones que quedan, incluido el control de las invasoras. Si una parte del predio es matorral o bosque seco en pie, dejarla y controlar Prosopis es exactamente lo que la evaluación pide, y es también lo que evita que el pastoreo se corra a la reserva de al lado.' },
    ],
    fuentes: [ONE_EARTH_315, GSDA_DHULE, DIVCOM_NASHIK, FAO_FORMACIONES, RESOLVE],
  },
};
