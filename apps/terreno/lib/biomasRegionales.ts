/**
 * Fichas regionales de ecosistema — Norteamérica, Canadá y Groenlandia,
 * Mesoamérica, Caribe, la Unión Europea y sus asociados, y Sudamérica.
 *
 * Se activan por ECO_ID de RESOLVE (ver la lista blanca en lib/ecorregiones.ts),
 * nunca por clima: dos regiones pueden compartir clase Köppen y no compartir ni
 * especies ni sistemas productivos. Cada ficha lleva arriba los países, los
 * ECO_ID verificados y el nivel de confianza de su investigación.
 *
 * Las 12 fichas sudamericanas originales siguen viviendo en lib/contexto.ts —son
 * las que resuelve la heurística Köppen cuando no se puede consultar RESOLVE—; el
 * resto de Sudamérica está en lib/biomasRegionalesSudamerica.ts. Las de bioma
 * global, más gruesas, en lib/biomasGlobales.ts.
 *
 * ARCHIVO GENERADO desde la investigación de cobertura geográfica (30/08/2026).
 * Si lo editás a mano, dejá constancia acá abajo.
 */

import type { BiomaFicha } from './biomaTipos';
import { BIOMAS_REGIONALES_AMERICA } from './biomasRegionalesAmerica';
import { BIOMAS_REGIONALES_CANADA } from './biomasRegionalesCanada';
import { BIOMAS_REGIONALES_EUROPA } from './biomasRegionalesEuropa';
import { BIOMAS_REGIONALES_EUROPA_UE } from './biomasRegionalesEuropaUE';
import { BIOMAS_REGIONALES_SUDAMERICA } from './biomasRegionalesSudamerica';

const CURADAS_A_MANO: Record<string, BiomaFicha> = {
  // US, CA · ECO_ID 329 · Köppen Cfa, Dfa, Dfb · confianza alta
  // ECO_ID 329 es un ejemplo verificado por punto en los Apalaches; la ficha cubre varias ecorregiones RESOLVE y no debe activarse sólo por ese ID.
  bosque_templado_caducifolio_este: {
    id: 'bosque_templado_caducifolio_este',
    nombre: 'Bosque templado caducifolio del este',
    emoji: '🍂',
    color: '#587A4A',
    resumen: 'Bosques húmedos de hoja ancha de los Apalaches, Grandes Lagos y Nueva Inglaterra. El relieve, la historia glacial y el gradiente norte-sur forman un mosaico de robledales, arcedos y bosques mixtos.',
    vegetacion: 'Robles, arces, hayas, nogales y tsugas dominan según latitud, exposición y suelo; los claros y bordes sostienen arbustos de fruto y herbáceas perennes.',
    fauna: 'Venado de cola blanca, oso negro, pavo silvestre y salamandras dependen de la continuidad entre bosque, cursos de agua y claros.',
    suelos: 'Predominan Alfisoles y Ultisoles lixiviados, desde ácidos y pobres hasta ricos en calcio. Conviene mantener mantillo, evitar compactación y ajustar el manejo a la gran variación local.',
    saberes: [
      { cultura: 'Haudenosaunee y Anishinaabe', practicas: 'Manejan claros, bordes y sotobosque con fuego de baja intensidad y cosecha selectiva para favorecer frutos, nueces y plantas útiles. Integran maíz, poroto y zapallo en policultivos donde el sitio lo permite.' },
      { cultura: 'Campesinado apalachense', practicas: 'Combina huertas, frutales, pasturas pequeñas y manejo de bosque familiar. Conserva pendientes con cultivos en contorno, cobertura permanente y aprovechamiento selectivo de madera y productos no madereros.' },
    ],
    especies: [
      'Roble blanco americano (Quercus alba)',
      'Arce azucarero (Acer saccharum)',
      'Haya americana (Fagus grandifolia)',
      'Tsuga canadiense (Tsuga canadensis)',
      'Nogal negro (Juglans nigra)',
    ],
    fuentes: [
      { label: 'EPA HERO — Eastern temperate forests', url: 'https://hero.epa.gov/reference/3123056/' },
      { label: 'National Park Service — Indigenous Fire Practices Shape our Land', url: 'https://www.nps.gov/subjects/fire/indigenous-fire-practices-shape-our-land.htm' },
      { label: 'EPA — Ecoregions of North America', url: 'https://www.epa.gov/eco-research/ecoregions-north-america' },
    ],
  },

  // US, CA · ECO_ID 392 · Köppen Cfa, Dfa · confianza alta
  // ECO_ID 392, Flint Hills tallgrass prairie, fue verificado por consulta espacial.
  pradera_pastos_altos: {
    id: 'pradera_pastos_altos',
    nombre: 'Pradera de pastos altos',
    emoji: '🌾',
    color: '#9DAA55',
    resumen: 'Pradera húmeda del borde oriental de las Grandes Llanuras, desde Texas hasta Manitoba. El fuego y el pastoreo sostienen un estrato herbáceo alto que, sin disturbio, tiende a cerrarse con arbustos y árboles.',
    vegetacion: 'Andropogon grande, pasto indio, pasto varilla y Schizachyrium forman una matriz densa con gran diversidad de flores silvestres.',
    fauna: 'Bisonte, perrito de la pradera, gallo de las praderas y numerosas aves migratorias usan el mosaico de alturas y humedales.',
    suelos: 'Mollisoles profundos, oscuros y fértiles acumulan mucho carbono, pero quedan expuestos a erosión y pérdida de estructura cuando se labran sin cobertura. El manejo ganadero debe conservar raíces y descanso suficiente.',
    saberes: [
      { cultura: 'Osage, Kaw y Pawnee', practicas: 'Usan fuego planificado para renovar pastos, mantener espacios abiertos y orientar el uso de herbívoros. La quema se aplica con lectura de viento, humedad y estado de la vegetación.' },
      { cultura: 'Ganadería de Flint Hills', practicas: 'Combina pastoreo estacional de bovinos con quema prescripta para limitar leñosas y sostener pastos nativos. La carga se ajusta a la producción anual y a la recuperación después del fuego.' },
    ],
    especies: [
      'Andropogon grande (Andropogon gerardii)',
      'Pasto indio (Sorghastrum nutans)',
      'Pasto varilla (Panicum virgatum)',
      'Schizachyrium (Schizachyrium scoparium)',
      'Equinácea pálida (Echinacea pallida)',
    ],
    fuentes: [
      { label: 'National Park Service — Wildland Fire in Tallgrass Prairie', url: 'https://www.nps.gov/articles/wildland-fire-in-tallgrass-prairie.htm' },
      { label: 'National Park Service — Indigenous Fire Practices Shape our Land', url: 'https://www.nps.gov/subjects/fire/indigenous-fire-practices-shape-our-land.htm' },
      { label: 'EPA — Ecoregions of North America', url: 'https://www.epa.gov/eco-research/ecoregions-north-america' },
    ],
  },

  // US, CA · ECO_ID 389, 395 · Köppen BSk, Dfa, Dfb · confianza media
  // RESOLVE rotula gran parte de esta transición como Northern Shortgrass prairie (ECO_ID 396), por lo que su geometría no separa bien mixedgrass de shortgrass.
  pradera_mixta: {
    id: 'pradera_mixta',
    nombre: 'Pradera mixta',
    emoji: '🌿',
    color: '#A79B58',
    resumen: 'Franja semiárida central de las Grandes Llanuras donde conviven pastos altos y cortos. La composición cambia mucho con la textura del suelo, la lluvia del año y la presión de pastoreo.',
    vegetacion: 'Pasto trigo occidental, navajita azul, pasto aguja y Schizachyrium se alternan con artemisas bajas y flores de pradera.',
    fauna: 'Berrendo, bisonte, zorro veloz y aves de pastizal responden a la heterogeneidad creada por sequía, fuego y herbivoría.',
    suelos: 'Mollisoles y Aridisoles de textura franca a arcillosa almacenan carbono en raíces profundas. El sobrepastoreo reduce cobertura y favorece erosión e invasoras; conviene rotar potreros y dejar remanente.',
    saberes: [
      { cultura: 'Lakota, Dakota y Nakota', practicas: 'Manejan movilidad, fuego y cosecha de plantas según estaciones y disponibilidad. La lectura conjunta de agua, pasto y herbívoros evita concentrar el uso en un solo sitio.' },
      { cultura: 'Ganadería de las llanuras del norte', practicas: 'Usa pastoreo rotativo o diferido, reservas de forraje y descansos que cambian con la precipitación. Conserva bajos y humedales como áreas sensibles y fuentes de forraje tardío.' },
    ],
    especies: [
      'Pasto trigo occidental (Pascopyrum smithii)',
      'Navajita azul (Bouteloua gracilis)',
      'Pasto aguja (Hesperostipa comata)',
      'Schizachyrium (Schizachyrium scoparium)',
      'Artemisa plateada (Artemisia cana)',
    ],
    fuentes: [
      { label: 'US Forest Service — Northwestern Great Plains Mixed-Grass Prairie', url: 'https://research.fs.usda.gov/sites/default/files/feis/bps/11410_40.pdf' },
      { label: 'USDA NRCS — Mixedgrass Prairie ecological site', url: 'https://edit.sc.egov.usda.gov/catalogs/esd/052X/R052XN178MT' },
      { label: 'EPA — Ecoregions of North America', url: 'https://www.epa.gov/eco-research/ecoregions-north-america' },
    ],
  },

  // US, CA, MX · ECO_ID 396, 402 · Köppen BSk · confianza alta
  // ECO_ID 402 fue verificado en las llanuras cortas occidentales; ECO_ID 396 cubre la variante norte.
  pradera_pastos_cortos: {
    id: 'pradera_pastos_cortos',
    nombre: 'Pradera de pastos cortos',
    emoji: '🌱',
    color: '#B59B63',
    resumen: 'Pradera semiárida al pie oriental de las Rocosas, con lluvias escasas y gran variabilidad anual. Los pastos bajos forman céspedes resistentes a sequía y herbivoría.',
    vegetacion: 'Navajita azul y pasto búfalo dominan; se suman gramíneas en mata, yucas y arbustos dispersos en suelos arenosos o salinos.',
    fauna: 'Berrendo, perrito de la pradera, búho de madriguera y chorlito llanero dependen de áreas abiertas con vegetación baja.',
    suelos: 'Mollisoles poco profundos y Aridisoles tienen baja reserva de agua y alta sensibilidad a suelo desnudo. La carga animal debe bajar rápido en sequía y evitar concentraciones alrededor de aguadas.',
    saberes: [
      { cultura: 'Cheyenne del Sur y Arapaho', practicas: 'Organizan el uso estacional del territorio siguiendo agua, pasto y movimientos de herbívoros. El fuego de baja intensidad mantiene parches abiertos y renueva forraje cuando las condiciones lo permiten.' },
      { cultura: 'Agricultura de secano de las High Plains', practicas: 'Aplica cultivo en contorno, franjas alternadas y barbecho con rastrojo para frenar viento y conservar humedad. Los cortavientos y la cobertura reducen pérdida de suelo.' },
    ],
    especies: [
      'Navajita azul (Bouteloua gracilis)',
      'Pasto búfalo (Bouteloua dactyloides)',
      'Grama lateral (Bouteloua curtipendula)',
      'Yuca de las llanuras (Yucca glauca)',
      'Pasto galleta (Pleuraphis jamesii)',
    ],
    fuentes: [
      { label: 'US Forest Service — Western Great Plains Shortgrass Prairie', url: 'https://www.fs.usda.gov/database/feis/pdfs/other/NatureServe_2013.pdf' },
      { label: 'US Forest Service — Poa arida, plains bluegrass', url: 'https://research.fs.usda.gov/feis/species-reviews/poaari' },
      { label: 'EPA — Ecoregions of North America', url: 'https://www.epa.gov/eco-research/ecoregions-north-america' },
    ],
  },

  // US, MX · ECO_ID 428, 433, 435 · Köppen BWh, BSh · confianza alta
  // Se agrupan tres desiertos porque la ficha explicita sus diferencias; para diseño fino conviene conservar el ECO_ID y mostrar el nombre específico.
  desiertos_calidos_norteamericanos: {
    id: 'desiertos_calidos_norteamericanos',
    nombre: 'Desiertos cálidos norteamericanos',
    emoji: '🌵',
    color: '#C99B5C',
    resumen: 'Conjunto de los desiertos Sonorense, Chihuahuense y Mojave. Comparten aridez, pero difieren en estacionalidad de lluvias, heladas y composición vegetal.',
    vegetacion: 'Cactáceas columnares y leguminosas dominan en Sonora; matorrales de creosota, yucas y agaves son más frecuentes en Chihuahua y Mojave.',
    fauna: 'Tortugas del desierto, berrendos, pecaríes, correcaminos y polinizadores nocturnos dependen de aguadas y corredores intactos.',
    suelos: 'Aridisoles someros, pedregosos o salinos tienen costras biológicas frágiles y poca materia orgánica. Hay que concentrar tránsito, infiltrar escorrentía sin erosionar y evitar romper costras.',
    saberes: [
      { cultura: 'Tohono O’odham y Akimel O’odham', practicas: 'Mantienen agricultura ak-chin, que siembra en abanicos y cauces para captar la escorrentía del monzón. También manejan canales y cosechan saguaro, mezquite y otras especies del monte.' },
      { cultura: 'Pueblos Zuni y Hopi', practicas: 'Usan jardines en cuadrícula, hoyos de plantación y barreras de piedra para concentrar agua, sedimento y abrigo. Seleccionan variedades de maíz, poroto y zapallo adaptadas a ciclos cortos y lluvia incierta.' },
    ],
    especies: [
      'Saguaro (Carnegiea gigantea)',
      'Gobernadora (Larrea tridentata)',
      'Mezquite aterciopelado (Prosopis velutina)',
      'Agave de Palmer (Agave palmeri)',
      'Yuca de Mojave (Yucca schidigera)',
    ],
    fuentes: [
      { label: 'National Park Service — Sonoran Desert Network Ecosystems', url: 'https://www.nps.gov/im/sodn/ecosystems.htm' },
      { label: 'National Park Service — Native Peoples of the Sonoran Desert: The O’odham', url: 'https://home.nps.gov/articles/oodham.htm' },
      { label: 'National Park Service — Biological Soil Crusts of the Sonoran and Chihuahuan Deserts', url: 'https://www.nps.gov/articles/soil-crusts-of-sonoran-chihuahuan-deserts.htm' },
    ],
  },

  // US · ECO_ID 430 · Köppen BWk, BSk · confianza alta
  // ECO_ID 430, Great Basin shrub steppe, fue verificado por consulta espacial.
  estepa_arbustiva_gran_cuenca: {
    id: 'estepa_arbustiva_gran_cuenca',
    nombre: 'Estepa arbustiva de la Gran Cuenca',
    emoji: '🏜️',
    color: '#9A9271',
    resumen: 'Cuencas y sierras interiores frías del oeste de Estados Unidos. La aridez, las heladas y los suelos salinos sostienen estepas de artemisa y pastos perennes.',
    vegetacion: 'Artemisa grande, pastos en mata, atriplex y bosques abiertos de pino piñonero y enebro cambian con altitud y humedad.',
    fauna: 'Urogallo de las artemisas, berrendo, ciervo mulo y liebre cola negra requieren grandes superficies continuas.',
    suelos: 'Aridisoles fríos y suelos salinos o sódicos infiltran poco cuando pierden cobertura. El ciclo invasora-incendio, sobre todo con cheatgrass, puede impedir la recuperación del matorral.',
    saberes: [
      { cultura: 'Paiute del Norte y Shoshone Occidental', practicas: 'Manejan cosechas de semillas, raíces y piñones en circuitos estacionales y aplican fuego localizado donde favorece plantas útiles. La movilidad distribuye la presión sobre aguadas y parches productivos.' },
      { cultura: 'Ganadería de la Gran Cuenca', practicas: 'Ajusta carga y fecha de entrada al crecimiento de pastos perennes, con descanso de vegas y riberas. La restauración prioriza contener invasoras antes de sembrar y proteger el suelo después del fuego.' },
    ],
    especies: [
      'Artemisa grande (Artemisia tridentata)',
      'Pasto trigo azul (Pseudoroegneria spicata)',
      'Pino piñonero monofilo (Pinus monophylla)',
      'Enebro de Utah (Juniperus osteosperma)',
      'Atriplex de cuatro alas (Atriplex canescens)',
    ],
    fuentes: [
      { label: 'USGS — SageSTEP, Sagebrush Steppe Treatment Evaluation Project', url: 'https://www.usgs.gov/centers/forest-and-rangeland-ecosystem-science-center/science/sagestep-sagebrush-steppe-treatment' },
      { label: 'USGS — Piñon and Juniper Field Guide', url: 'https://pubs.usgs.gov/circ/1335/' },
      { label: 'USGS — Resilience and resistance in sagebrush ecosystems', url: 'https://www.usgs.gov/publications/resilience-and-resistance-sagebrush-ecosystems-are-associated-seasonal-soil' },
    ],
  },

  // US, CA · ECO_ID 351 · Köppen Cfb, Cfc · confianza alta
  // ECO_ID 351 es la costa central; hacia Alaska y California cambian los ECO_ID y la composición.
  bosque_coniferas_pacifico_noroeste: {
    id: 'bosque_coniferas_pacifico_noroeste',
    nombre: 'Bosque de coníferas del Pacífico noroeste',
    emoji: '🌲',
    color: '#285B4A',
    resumen: 'Bosques templados lluviosos de la costa entre el norte de California y Alaska. El clima oceánico, la niebla y los suelos profundos permiten árboles de gran porte y alta biomasa.',
    vegetacion: 'Pícea de Sitka, tsuga occidental, cedro rojo y abeto de Douglas forman doseles altos con helechos, musgos y arbustos de fruto.',
    fauna: 'Alce de Roosevelt, oso negro, búho moteado y salmónidos conectan bosque, estuario y cursos de agua.',
    suelos: 'Suelos ácidos, húmedos y ricos en materia orgánica pueden compactarse y erosionarse al abrir caminos. Conviene proteger madera muerta, drenajes y franjas ribereñas.',
    saberes: [
      { cultura: 'Pueblos Coast Salish', practicas: 'Mantienen jardines forestales con avellanos, manzanos silvestres, bayas y otras plantas alimentarias cerca de asentamientos. Usan cosecha selectiva, poda y trasplante para sostener diversidad y acceso.' },
      { cultura: 'Nuu-chah-nulth y Kwakwaka’wakw', practicas: 'Manejan cedro y otros materiales forestales mediante selección de individuos y extracción parcial que evita matar el árbol. Integran el manejo terrestre con estuarios, salmones y jardines de almejas.' },
    ],
    especies: [
      'Pícea de Sitka (Picea sitchensis)',
      'Tsuga occidental (Tsuga heterophylla)',
      'Cedro rojo occidental (Thuja plicata)',
      'Abeto de Douglas (Pseudotsuga menziesii)',
      'Arándano siempreverde (Vaccinium ovatum)',
    ],
    fuentes: [
      { label: 'National Park Service — Plants, Lewis and Clark National Historical Park', url: 'https://www.nps.gov/lewi/learn/nature/plants.htm' },
      { label: 'US Forest Service — Traditional and Local Ecological Knowledge About Forest Biodiversity in the Pacific Northwest', url: 'https://www.fs.usda.gov/pnw/pubs/pnw_gtr751.pdf' },
      { label: 'US Forest Service — Future Forests, Chapter 9: Temperate forests', url: 'https://www.fs.usda.gov/pnw/pubs/journals/pnw_2024_fusco001.pdf' },
    ],
  },

  // US, MX · ECO_ID 424 · Köppen Csa, Csb · confianza alta
  // Se crea ficha propia, en vez de enriquecer mediterraneo, porque especies, regímenes de fuego y tradiciones productivas no son intercambiables con Chile ni Europa.
  chaparral_californiano: {
    id: 'chaparral_californiano',
    nombre: 'Chaparral californiano',
    emoji: '🌿',
    color: '#7C8246',
    resumen: 'Matorrales y bosques abiertos de clima mediterráneo en California y el norte de Baja California. Los veranos secos y los incendios poco frecuentes pero intensos estructuran el paisaje.',
    vegetacion: 'Chamise, manzanitas, ceanotos y robles perennes forman matorrales densos; en valles aparecen pastizales y bosques abiertos de encino.',
    fauna: 'Puma, venado bura, codorniz de California y numerosos polinizadores usan el mosaico entre chaparral, robledal y cursos temporarios.',
    suelos: 'Suelos someros y pedregosos pierden estabilidad después del fuego y de la remoción mecánica. Las quemas demasiado frecuentes favorecen pastos exóticos y elevan el riesgo futuro.',
    saberes: [
      { cultura: 'Chumash y Tongva', practicas: 'Aplican fuego cultural localizado y manejo de encinares para favorecer bellotas, fibras y plantas comestibles. La frecuencia se adapta a cada comunidad vegetal y no equivale a quemar chaparral cerrado de forma repetida.' },
      { cultura: 'Agricultura mediterránea californiana', practicas: 'Usa cultivos perennes, cobertura invernal, curvas de nivel y franjas vegetadas para conservar suelo y agua. En secano ajusta densidad y variedad a la reserva hídrica del perfil.' },
    ],
    especies: [
      'Chamise (Adenostoma fasciculatum)',
      'Manzanita común (Arctostaphylos manzanita)',
      'Ceanoto de hoja entera (Ceanothus integerrimus)',
      'Encino costero (Quercus agrifolia)',
      'Salvia negra (Salvia mellifera)',
    ],
    fuentes: [
      { label: 'National Park Service — Wildland Fire in Chaparral', url: 'https://www.nps.gov/articles/wildland-fire-in-chaparral.htm' },
      { label: 'National Park Service — Indigenous Fire Practices Shape our Land', url: 'https://www.nps.gov/subjects/fire/indigenous-fire-practices-shape-our-land.htm' },
      { label: 'EPA — Ecoregions of North America', url: 'https://www.epa.gov/eco-research/ecoregions-north-america' },
    ],
  },

  // CA, US · ECO_ID 376 · Köppen Dfb, Dfc · confianza alta
  // La ficha no cubre tundra ni taiga abierta extrema; esas áreas requieren un perfil propio si se incorporan predios productivos tan al norte.
  taiga_borde_agricola: {
    id: 'taiga_borde_agricola',
    nombre: 'Bosque boreal y borde agrícola',
    emoji: '🌲',
    color: '#3F6655',
    resumen: 'Gran cinturón de coníferas, bosques mixtos, lagos y turberas de Canadá y Alaska. Hacia el sur pasa a tierras agrícolas con temporada corta y fuerte riesgo de heladas.',
    vegetacion: 'Píceas, pino gris, abeto balsámico, alerce, abedules y álamos forman rodales de distintas edades moldeados por fuego, insectos y anegamiento.',
    fauna: 'Caribú de bosque, alce, lince canadiense, castor y aves migratorias dependen de grandes mosaicos y humedales conectados.',
    suelos: 'Podzoles ácidos y suelos orgánicos fríos descomponen lento; el drenaje de turberas libera carbono y cambia el régimen de fuego. En el borde agrícola conviene minimizar laboreo y proteger cortinas.',
    saberes: [
      { cultura: 'Nehiyawak (Cree) y pueblos Dene', practicas: 'Organizan cosecha, pesca, trampeo y uso del fuego en ciclos estacionales que distribuyen la presión. Mantienen corredores ribereños, parches de frutos y accesos entre humedales y bosque.' },
      { cultura: 'Campesinado del cinturón arcilloso canadiense', practicas: 'Trabaja con cultivos de ciclo corto, forrajes perennes, drenaje medido y cortinas forestales. Mantiene rastrojo y nieve sobre el lote para reducir erosión y conservar humedad.' },
    ],
    especies: [
      'Pícea negra (Picea mariana)',
      'Pino gris (Pinus banksiana)',
      'Álamo temblón (Populus tremuloides)',
      'Alerce americano (Larix laricina)',
      'Abedul papirífero (Betula papyrifera)',
    ],
    fuentes: [
      { label: 'Natural Resources Canada — 8 facts about Canada’s boreal forest', url: 'https://natural-resources.canada.ca/forests-forestry/sustainable-forest-management/8-facts-about-canada-s-boreal-forest' },
      { label: 'Natural Resources Canada — Fire ecology', url: 'https://natural-resources.canada.ca/forests-forestry/wildland-fires/fire-ecology?wbdisable=true' },
      { label: 'Natural Resources Canada — Forest classification', url: 'https://natural-resources.canada.ca/forests-forestry/sustainable-forest-management/forest-classification' },
      { label: 'Natural Resources Canada — Peatland fires and carbon emissions', url: 'https://natural-resources.canada.ca/forests-forestry/wildland-fires/peatland-fires-carbon-emissions' },
    ],
  },

  // US · ECO_ID 330, 399 · Köppen Cfa · confianza alta
  // RESOLVE separa Piedmont forest (330) de Southeast US conifer savannas (399); ambos se mantienen en una ficha porque el manejo debe leer suelo y régimen de fuego local.
  sur_templado_humedo_eeuu: {
    id: 'sur_templado_humedo_eeuu',
    nombre: 'Sur templado húmedo de Estados Unidos',
    emoji: '🌳',
    color: '#4D744A',
    resumen: 'Piedmont y llanura costera del Atlántico y el Golfo, con veranos largos, lluvia abundante y fuerte gradiente de drenaje. Incluye bosques mixtos y sabanas de pino mantenidas por fuego.',
    vegetacion: 'Pino de hoja larga, pinos loblolly y shortleaf, robles, liquidámbar y un sotobosque muy diverso cambian entre arenas secas, arcillas y bajos húmedos.',
    fauna: 'Pájaro carpintero de cresta roja, tortuga gopher, venado y anfibios de charcas temporarias dependen de fuego frecuente y microrelieve.',
    suelos: 'Ultisoles meteorizados y ácidos tienen baja fertilidad natural; arenas costeras drenan rápido y bajos arcillosos se anegan. Conviene cubrir, corregir según análisis y no homogeneizar drenajes.',
    saberes: [
      { cultura: 'Muscogee (Creek) y Cherokee', practicas: 'Usan fuego frecuente de baja intensidad para mantener pinares abiertos, favorecer robles y facilitar cultivos y cosechas del bosque. Integran policultivos de maíz, poroto y zapallo en claros y fondos fértiles.' },
      { cultura: 'Silvicultura y ganadería del pino de hoja larga', practicas: 'Combina quema prescripta, regeneración del pino y silvopastoreo con carga controlada. El fuego reduce leñosas, conserva la cobertura herbácea y limita combustibles cuando se aplica en intervalos adecuados.' },
    ],
    especies: [
      'Pino de hoja larga (Pinus palustris)',
      'Roble blanco (Quercus alba)',
      'Liquidámbar americano (Liquidambar styraciflua)',
      'Pasto alambre (Aristida stricta)',
      'Palmito serrucho (Serenoa repens)',
    ],
    fuentes: [
      { label: 'US Forest Service — Longleaf Pine, Silvics of North America', url: 'https://research.fs.usda.gov/silvics/longleaf-pine' },
      { label: 'US Forest Service — Managing composition of piedmont forests with prescribed fire', url: 'https://research.fs.usda.gov/treesearch/23456' },
      { label: 'US Forest Service — Silviculture, prescribed fire and biodiversity in longleaf pine forests', url: 'https://research.fs.usda.gov/treesearch/28677' },
    ],
  },

  // MX, GT, BZ, SV, HN, NI, CR, PA · ECO_ID 527, 534 · Köppen Aw, As, BSh · confianza alta
  // Los ECO_ID listados son ejemplos de Chiapas y Jalisco, no una enumeración completa de los bosques secos mesoamericanos.
  bosque_tropical_seco_mesoamericano: {
    id: 'bosque_tropical_seco_mesoamericano',
    nombre: 'Bosque tropical seco mesoamericano',
    emoji: '🌳',
    color: '#8B8A4A',
    resumen: 'Bosque caducifolio cálido de la vertiente del Pacífico de México y Centroamérica. Tiene una estación seca de cinco a ocho meses y alto endemismo.',
    vegetacion: 'Copales, pochotes, tepeguajes, cazahuates y cactáceas pierden hojas o almacenan agua; la altura y densidad cambian con suelo y lluvia.',
    fauna: 'Venado de cola blanca, pecarí, armadillo, ocelote y polinizadores sostienen redes muy estacionales.',
    suelos: 'Suelos someros o pedregosos pierden cobertura y materia orgánica rápido al desmontar. La producción conviene organizarla como mosaico agroforestal, con descanso y control de erosión.',
    saberes: [
      { cultura: 'Nahua, Mixteco y Me’phaa', practicas: 'Mantienen milpas y tlacololes con maíz, poroto, zapallo, quelites y árboles útiles. Las barreras vivas, descansos y acomodo de residuos reducen escorrentía en laderas.' },
      { cultura: 'Campesinado de la costa del Pacífico mesoamericano', practicas: 'Integra pastoreo extensivo, cercas vivas, frutales y productos del monte. Conserva árboles forrajeros y de sombra dentro de potreros y deja franjas en cauces temporarios.' },
    ],
    especies: [
      'Copal chino (Bursera bipinnata)',
      'Copal santo (Bursera copallifera)',
      'Pochote (Ceiba aesculifolia)',
      'Tepeguaje (Lysiloma acapulcense)',
      'Cazahuate (Ipomoea arborescens)',
    ],
    fuentes: [
      { label: 'CONABIO — Selvas secas', url: 'https://biodiversidad.gob.mx/ecosistemas/selvaSeca' },
      { label: 'FAO AGRIS — Los sistemas agroforestales tradicionales de México', url: 'https://agris.fao.org/search/es/records/675abb150ce2cede71cf2d04' },
      { label: 'CONABIO — Ecosistemas de México', url: 'https://biodiversidad.gob.mx/ecosistemas/ecosismex' },
    ],
  },

  // MX, GT, HN, SV, NI, CR, PA · ECO_ID 487 · Köppen Cfb, Cwb, Cwa · confianza alta
  // RESOLVE no tiene una clase única de bosque de niebla; ECO_ID 487 es un ejemplo montano verificado. El clasificador necesita overrides por ECO_ID y elevación.
  bosque_mesofilo_montana: {
    id: 'bosque_mesofilo_montana',
    nombre: 'Bosque mesófilo de montaña',
    emoji: '🌫️',
    color: '#3F7059',
    resumen: 'Bosque de niebla en laderas húmedas de México y Centroamérica, por lo general entre 600 y 3.100 m. La nubosidad frecuente sostiene epífitas y alta diversidad en superficies muy fragmentadas.',
    vegetacion: 'Liquidámbares, encinos, magnolias, pinos, helechos arborescentes, bromelias y orquídeas forman varios estratos.',
    fauna: 'Quetzales, pavones, salamandras y pequeños mamíferos endémicos responden a humedad constante y continuidad del dosel.',
    suelos: 'Suelos ácidos, húmedos y ricos en materia orgánica pueden ser profundos o muy someros sobre pendientes fuertes. La remoción del dosel eleva erosión y reduce captación de niebla.',
    saberes: [
      { cultura: 'Nahua y Totonaco de la Sierra Norte de Puebla', practicas: 'Mantienen kuojtakiloyan, un sistema agroforestal de café, frutales, pimienta, vainilla, plantas medicinales y árboles nativos. La estructura multiestrato conserva suelo y regula humedad.' },
      { cultura: 'Zapoteco y Chinanteco de Oaxaca', practicas: 'Manejan cafetales bajo sombra y bosques comunitarios con selección de árboles, terrazas y barreras en contorno. Conservan nacientes y pendientes de alta infiltración fuera del laboreo.' },
    ],
    especies: [
      'Liquidámbar (Liquidambar styraciflua)',
      'Magnolia mexicana (Magnolia dealbata)',
      'Encino de niebla (Quercus germana)',
      'Árbol de las manitas (Chiranthodendron pentadactylon)',
      'Helecho arborescente (Cyathea fulva)',
    ],
    fuentes: [
      { label: 'CONABIO — Bosques nublados', url: 'https://biodiversidad.gob.mx/ecosistemas/bosqueNublado' },
      { label: 'FAO AGRIS — Los sistemas agroforestales tradicionales de México', url: 'https://agris.fao.org/search/es/records/675abb150ce2cede71cf2d04' },
      { label: 'CONABIO — Bosques templados', url: 'https://www.biodiversidad.gob.mx/ecosistemas/bosqueTemplado' },
    ],
  },

  // MX · ECO_ID 432 · Köppen BSk, BSh, Cwb · confianza alta
  // ECO_ID 432, Meseta Central matorral, fue verificado por consulta espacial.
  matorral_xerofilo_altiplano_mexicano: {
    id: 'matorral_xerofilo_altiplano_mexicano',
    nombre: 'Matorral xerófilo del Altiplano mexicano',
    emoji: '🌵',
    color: '#A28E61',
    resumen: 'Matorrales semiáridos y fríos del Altiplano mexicano, con heladas, lluvias estivales y gran diversidad de agaves, yucas y cactáceas. Incluye mezquitales, magueyales y pastizales abiertos.',
    vegetacion: 'Magueyes, nopales, mezquites, gobernadora y lechuguilla se distribuyen según suelo, salinidad y altitud.',
    fauna: 'Águila real, berrendo, liebre, tortuga del Bolsón y murciélagos nectarívoros usan un paisaje muy abierto.',
    suelos: 'Calcisoles y Aridisoles suelen ser someros, alcalinos y pobres en materia orgánica; también hay yesos y sales. Las barreras vivas y terrazas reducen erosión y mejoran infiltración.',
    saberes: [
      { cultura: 'Nahua de Tlaxcala', practicas: 'Mantiene metepantles con hileras de maguey, terrazas de piedra y policultivos de maíz, poroto, zapallo y quelites. Los magueyes estabilizan bordos, capturan agua y aportan alimentos, forraje y fibra.' },
      { cultura: 'Hñähñu (Otomí) del Valle del Mezquital', practicas: 'Maneja maguey, nopal, mezquite y cultivos de secano con bordos, jagüeyes y aprovechamiento múltiple. Ajusta siembra y cosecha a lluvias cortas y suelos calizos.' },
    ],
    especies: [
      'Maguey pulquero (Agave salmiana)',
      'Lechuguilla (Agave lechuguilla)',
      'Nopal cardón (Opuntia streptacantha)',
      'Mezquite dulce (Prosopis laevigata)',
      'Gobernadora (Larrea tridentata)',
    ],
    fuentes: [
      { label: 'CONABIO — Matorrales', url: 'https://www.biodiversidad.gob.mx/ecosistemas/matorral' },
      { label: 'FAO — Metepantle Ancestral Agricultural System in Tlaxcala', url: 'https://www.fao.org/giahs/giahs-around-the-world/mexico-meteplante/en' },
      { label: 'CONABIO — La biodiversidad en Hidalgo', url: 'https://www.biodiversidad.gob.mx/region/EEB/estudios/ee_hidalgo' },
    ],
  },

  // CU, DO, HT, JM, PR · ECO_ID 495 · Köppen Af, Am, Aw, Cfa · confianza media
  // La composición varía mucho entre islas. ECO_ID 495 corresponde a Puerto Rico; para Cuba, La Española y Jamaica se deben conservar sus ECO_ID propios.
  bosque_humedo_tropical_caribeno: {
    id: 'bosque_humedo_tropical_caribeno',
    nombre: 'Bosque húmedo tropical caribeño insular',
    emoji: '🌴',
    color: '#2D7655',
    resumen: 'Bosques húmedos y muy húmedos de las Antillas Mayores, expuestos a huracanes y a fuertes gradientes de lluvia y relieve. En pocas decenas de kilómetros pasan de llanuras costeras a bosques montanos.',
    vegetacion: 'Tabonuco, yagrumo, palma real, ausubo y helechos arborescentes forman doseles que cambian con altitud, sustrato y disturbio.',
    fauna: 'Coquíes, todies, cotorras antillanas, murciélagos y lagartos muestran alto endemismo insular.',
    suelos: 'Sobre volcanitas predominan arcillas meteorizadas y ácidas; sobre calizas, la profundidad cambia en pocos metros. La cobertura permanente y las raíces profundas son claves frente a lluvias intensas y pendientes.',
    saberes: [
      { cultura: 'Campesinado jíbaro puertorriqueño', practicas: 'Mantiene cafetales bajo sombra, huertos mixtos y árboles de fruto en laderas. La combinación de estratos protege suelo, amortigua viento y diversifica cosechas después de huracanes.' },
    ],
    especies: [
      'Tabonuco (Dacryodes excelsa)',
      'Yagrumo (Cecropia schreberiana)',
      'Ausubo (Manilkara bidentata)',
      'Palma real puertorriqueña (Roystonea borinquena)',
      'María (Calophyllum antillanum)',
    ],
    fuentes: [
      { label: 'US Forest Service — Guide to the ecological systems of Puerto Rico', url: 'https://research.fs.usda.gov/treesearch/35382' },
      { label: 'US Forest Service — Landscape units of Puerto Rico', url: 'https://research.fs.usda.gov/treesearch/38528' },
      { label: 'US Forest Service — Agroforestry, Regional Summary: Southeast and Caribbean', url: 'https://research.fs.usda.gov/download/treesearch/55779.pdf' },
      { label: 'FAO — Sistemas agroforestales con frutales, cultivos y cercas vivas en Cuba', url: 'https://www.fao.org/family-farming/detail/en/c/1649535/' },
    ],
  },

  // CU, DO, HT, JM, PR · ECO_ID 543 · Köppen Aw, As, BSh · confianza media
  // ECO_ID 543 corresponde a Puerto Rico. Se descartó una ficha separada de karst: el karst es sustrato y forma de relieve que atraviesa bosque húmedo y seco, por lo que debe ser una alerta superpuesta, no un bioma.
  matorral_seco_caribeno: {
    id: 'matorral_seco_caribeno',
    nombre: 'Matorral y bosque seco costero del Caribe',
    emoji: '🌵',
    color: '#A58A55',
    resumen: 'Bosques bajos y matorrales espinosos de costas secas y sotaventos de las Antillas. Reciben poca lluvia, sal en aerosol y vientos persistentes.',
    vegetacion: 'Guayacán, almácigo, cambrón, cactáceas columnares y arbustos deciduos crecen sobre caliza, arena o arcillas poco profundas.',
    fauna: 'Iguanas, aves terrestres endémicas, murciélagos y polinizadores se concentran en parches de vegetación y charcas temporarias.',
    suelos: 'Suelos calizos someros y con poca materia orgánica infiltran por grietas y se erosionan al quedar desnudos. Conviene evitar laboreo profundo y conservar arbustos nodriza y piedra superficial.',
    saberes: [
      { cultura: 'Campesinado del suroeste puertorriqueño', practicas: 'Maneja ganadería de baja carga, frutales resistentes, cercas vivas y cosecha de agua en un paisaje con sequía prolongada. Reserva sombra y vegetación en vaguadas y afloramientos.' },
    ],
    especies: [
      'Guayacán (Guaiacum officinale)',
      'Almácigo (Bursera simaruba)',
      'Cambrón (Vachellia farnesiana)',
      'Pitahaya de Puerto Rico (Leptocereus quadricostatus)',
      'Uva de playa (Coccoloba uvifera)',
    ],
    fuentes: [
      { label: 'Puerto Rico DRNA — Bosque Seco de Guánica', url: 'https://www.drna.pr.gov/programas-y-proyectos/zona-costanera/el-bosque-seco-de-guanica-patrimonio-de-la-humanidad/' },
      { label: 'US Forest Service — Structural variability and species diversity of a dwarf Caribbean dry forest', url: 'https://research.fs.usda.gov/treesearch/41810' },
      { label: 'US Forest Service — Guide to the ecological systems of Puerto Rico', url: 'https://research.fs.usda.gov/treesearch/35382' },
      { label: 'FAO — Sistemas agroforestales con frutales, cultivos y cercas vivas en Cuba', url: 'https://www.fao.org/family-farming/detail/en/c/1649535/' },
    ],
  },

  // ES, FR, IT, PT · ECO_ID 793 y 788, 799, 805 · Köppen Csa, Csb · confianza alta
  // El sur de Portugal, Doñana y Los Alcornocales son 805, no 793: la dehesa y el montado que describe esta ficha viven ahí y hasta el relevamiento de Europa occidental (09/2026) nunca se activaban. Los Balcanes y el Egeo tienen ECO_ID propios y todavía no están curados.
  // Se crea ficha propia. La etiqueta climática mediterráneo no alcanza para compartir especies y saberes entre Europa, California, Chile, Sudáfrica y Australia.
  mediterraneo_europeo: {
    id: 'mediterraneo_europeo',
    nombre: 'Bosque y matorral mediterráneo europeo',
    emoji: '🫒',
    color: '#7F8747',
    resumen: 'Paisajes de verano seco alrededor del Mediterráneo europeo, desde bosques esclerófilos hasta maquis, garriga y sistemas agroforestales abiertos. La disponibilidad de agua y el fuego varían mucho entre costa, meseta y montaña.',
    vegetacion: 'Encina, alcornoque, pinos mediterráneos, acebuche, madroño y arbustos aromáticos forman mosaicos con cultivos y pasturas.',
    fauna: 'Jabalí, conejo europeo, buitre negro, águila imperial e innumerables polinizadores usan la matriz agroforestal.',
    suelos: 'Suelos frecuentemente someros, pedregosos y pobres en materia orgánica pierden estructura con laboreo y fuego repetido. Terrazas, cubierta y arbolado disperso reducen escorrentía y evaporación.',
    saberes: [
      { cultura: 'Ganadería de dehesa extremeña y andaluza', practicas: 'Maneja encinas y alcornoques con pastoreo extensivo, poda selectiva y regeneración protegida. Combina bellota, forraje, corcho, leña y cultivos de secano en rotaciones largas.' },
      { cultura: 'Campesinado del montado alentejano', practicas: 'Integra alcornoque y encina con ovinos, caprinos, cereal, leguminosas y barbecho. Usa pastoreo rotativo, muros de piedra, pozos y cortafuegos para conservar suelo y agua.' },
    ],
    especies: [
      'Encina (Quercus ilex)',
      'Alcornoque (Quercus suber)',
      'Acebuche (Olea europaea var. sylvestris)',
      'Madroño (Arbutus unedo)',
      'Pino carrasco (Pinus halepensis)',
    ],
    fuentes: [
      { label: 'FAO — Montado Agrosilvipastoral System of the Serpa Hills', url: 'https://www.fao.org/giahs/giahs-around-the-world/portugal-montado-serpa' },
      { label: 'FAO — State of Mediterranean Forests 2018', url: 'https://openknowledge.fao.org/3/CA2081EN/ca2081en.PDF' },
      { label: 'EEA — Biogeographical regions in Europe', url: 'https://www.eea.europa.eu/en/analysis/maps-and-charts/biogeographical-regions-in-europe-2' },
    ],
  },

  // IE, GB · ECO_ID 651 · Köppen Cfb, Cfc · confianza alta
  // El 651 es Celtic broadleaf forests: Irlanda y Gran Bretaña. La llanura atlántica de Francia, Bélgica y los Países Bajos es 664 y la franja cantábrico-atlántica ibérica es 648; las dos tienen ficha propia desde el relevamiento de Europa occidental.
  // ECO_ID 651, Celtic broadleaf forests, es representativo pero no cubre toda la región atlántica.
  atlantico_templado_oceanico: {
    id: 'atlantico_templado_oceanico',
    nombre: 'Atlántico templado oceánico',
    emoji: '🌧️',
    color: '#4E8061',
    resumen: 'Franja oceánica húmeda de Irlanda, Bretaña, Cornualles, Galicia y costas vecinas. Tiene inviernos suaves, lluvias repartidas y paisajes muy transformados por pasturas, setos y bosque secundario.',
    vegetacion: 'Robles, hayas, abedules, acebos, brezales y praderas húmedas se organizan en mosaicos de bocage y fondos de valle.',
    fauna: 'Tejón, zorro, corzo, nutria y aves de seto dependen de bordes, humedales y corredores ribereños.',
    suelos: 'Cambisoles y Podzoles ácidos suelen saturarse en invierno y compactarse bajo ganado. Conviene conservar setos, drenajes vegetados y cobertura permanente, sin secar turberas.',
    saberes: [
      { cultura: 'Campesinado de bocage bretón y normando', practicas: 'Mantiene setos sobre taludes, árboles trasmochos y pequeñas parcelas mixtas. Los setos frenan viento y escorrentía, dan leña y forraje, y conectan hábitats.' },
      { cultura: 'Ganadería atlántica irlandesa y gallega', practicas: 'Trabaja con praderas permanentes, siega de heno, pastoreo rotativo y muros o setos vivos. Ajusta entradas a la capacidad portante del suelo para evitar barro y compactación.' },
    ],
    especies: [
      'Roble común (Quercus robur)',
      'Abedul pubescente (Betula pubescens)',
      'Acebo (Ilex aquifolium)',
      'Espino albar (Crataegus monogyna)',
      'Brezo común (Calluna vulgaris)',
    ],
    fuentes: [
      { label: 'EEA — Biogeographical regions in Europe', url: 'https://www.eea.europa.eu/en/analysis/maps-and-charts/biogeographical-regions-in-europe-2' },
      { label: 'FAO — Trees outside forests: Streuobst, hedgerows and riparian buffers', url: 'https://www.fao.org/4/x3989e/x3989e08.htm' },
      { label: 'EEA — Biogeographic Regions and the hydrological cycle', url: 'https://www.eea.europa.eu/en/analysis/publications/92-9167-030-8/page003.html' },
    ],
  },

  // DE, PL, CZ · ECO_ID 654 · Köppen Cfb, Dfb · confianza alta
  // Alsacia, el Jura francés y el Mittelland suizo son 686, con ficha propia; el 654 verificado por punto cae en Europa central, no en Francia ni en Suiza.
  // La región EEA Continental y el bioma RESOLVE de bosque templado no son equivalentes exactos; se usa la intersección como criterio.
  templado_continental_europeo: {
    id: 'templado_continental_europeo',
    nombre: 'Bosque templado continental europeo',
    emoji: '🌳',
    color: '#55744A',
    resumen: 'Bosques caducifolios y mixtos de Europa central, con inviernos fríos, veranos templados a cálidos y lluvias todo el año. La agricultura ocupa gran parte de las llanuras y deja bosques en parches.',
    vegetacion: 'Haya europea, roble común, carpe, tilo y abeto se combinan según suelo y altitud; los bordes agrícolas sostienen setos y frutales.',
    fauna: 'Corzo, jabalí, ciervo, gato montés y picamaderos negro usan matrices con bosque maduro y corredores.',
    suelos: 'Luvisoles y Cambisoles pueden ser fértiles pero se compactan y erosionan en pendientes. Rotaciones, cubierta invernal y franjas leñosas reducen pérdida de nutrientes.',
    saberes: [
      { cultura: 'Tradición Streuobst de Alemania y Austria', practicas: 'Mantiene frutales altos dispersos sobre pradera segada o pastoreada. Produce fruta, heno y sombra sin perder la cobertura permanente del suelo.' },
      { cultura: 'Campesinado forestal centroeuropeo', practicas: 'Usa monte bajo, trasmocho y setos para obtener leña, varas, forraje y límites vivos. Alterna cultivos, leguminosas y abonos verdes en parcelas pequeñas o franjas.' },
    ],
    especies: [
      'Haya europea (Fagus sylvatica)',
      'Roble común (Quercus robur)',
      'Carpe europeo (Carpinus betulus)',
      'Tilo de hoja pequeña (Tilia cordata)',
      'Abeto blanco (Abies alba)',
    ],
    fuentes: [
      { label: 'EEA — Biogeographical regions in Europe', url: 'https://www.eea.europa.eu/en/analysis/maps-and-charts/biogeographical-regions-in-europe-2' },
      { label: 'FAO — Trees outside forests: Streuobst, hedgerows and riparian buffers', url: 'https://www.fao.org/4/x3989e/x3989e08.htm' },
      { label: 'FAO — Agroforestry in central, northern and eastern Europe', url: 'https://www.fao.org/4/y1935e/y1935e03.pdf' },
    ],
  },

  // HU, RO, MD, UA, BG, RS · ECO_ID 674 · Köppen BSk, Dfa, Dfb · confianza media
  // ECO_ID 674 se llama Pannonian mixed forests y no representa por sí solo las estepas pónticas; la capa EEA Pannonian/Steppic resuelve mejor este perfil regional.
  estepa_pontica_panonica: {
    id: 'estepa_pontica_panonica',
    nombre: 'Estepa póntica y panónica',
    emoji: '🌾',
    color: '#A58E4C',
    resumen: 'Llanuras y cuencas secas de Hungría, Rumania, Moldavia y Ucrania, con estepas, praderas salinas y bosque-estepa. Gran parte de los chernozems está cultivada.',
    vegetacion: 'Festucas, estipas, agropiros y artemisas dominan; robles, olmos y fresnos persisten cerca de cursos de agua y en el bosque-estepa.',
    fauna: 'Avutarda, suslik europeo, hámster europeo y rapaces esteparias dependen de pastizales extensos y barbechos.',
    suelos: 'Chernozems y Phaeozems son muy fértiles; Solonetz y Solonchaks limitan raíces por sodio y sales. La erosión eólica y la pérdida de carbono aumentan con monocultivo y suelo desnudo.',
    saberes: [
      { cultura: 'Pastores de la puszta húngara', practicas: 'Manejan bovinos y ovinos rústicos sobre pastizales y praderas salinas, alternando áreas de pastoreo y heno. Ajustan acceso para evitar pisoteo de bajos húmedos y sobreuso de aguadas.' },
      { cultura: 'Campesinado cerealista del cinturón de chernozem', practicas: 'Usa rotaciones con cereal, oleaginosa, leguminosa y forraje, junto con cortinas y franjas en contorno. Mantiene rastrojo para reducir viento y conservar nieve y humedad.' },
    ],
    especies: [
      'Estipa plumosa (Stipa pennata)',
      'Festuca valesiaca (Festuca valesiaca)',
      'Agropiro crestado (Agropyron cristatum)',
      'Roble común (Quercus robur)',
      'Arce tártaro (Acer tataricum)',
    ],
    fuentes: [
      { label: 'FAO — Soil Map of the World, Volume V: Europe', url: 'https://www.fao.org/4/as354e/as354e.pdf' },
      { label: 'FAO — Grasslands of the World: Temperate Eurasia', url: 'https://www.fao.org/4/y8344e/y8344e0h.htm' },
      { label: 'EEA — Biogeographical regions in Europe', url: 'https://www.eea.europa.eu/en/analysis/maps-and-charts/biogeographical-regions-in-europe-2' },
    ],
  },

  // NO, SE, FI, EE, LV, LT · ECO_ID 717 · Köppen Dfb, Dfc · confianza alta
  // La ficha excluye tundra alpina y ártica. ECO_ID 717 fue verificado en Finlandia.
  boreal_nordico_turberas: {
    id: 'boreal_nordico_turberas',
    nombre: 'Bosque boreal nórdico y turberas',
    emoji: '🌲',
    color: '#46695B',
    resumen: 'Bosques de coníferas, lagos y turberas de Escandinavia, Finlandia y el Báltico. La temporada de crecimiento es corta y el drenaje natural controla la productividad y el carbono del suelo.',
    vegetacion: 'Pícea noruega, pino silvestre, abedules, sauces, arándanos y musgos esfagnos forman mosaicos con turberas abiertas.',
    fauna: 'Alce, reno, lince boreal, urogallo y aves de humedal requieren conectividad entre bosque y turbera.',
    suelos: 'Podzoles ácidos y turbas frías almacenan mucho carbono y nutrientes en superficie. Drenar o labrar turberas provoca subsidencia, emisiones y mayor riesgo de incendio.',
    saberes: [
      { cultura: 'Pueblo Sámi', practicas: 'Organiza el pastoreo de renos en rutas estacionales entre bosques, montes y líquenes de invierno. La movilidad y el acceso a corredores evitan concentrar presión en un solo parche.' },
      { cultura: 'Campesinado finlandés y carelio', practicas: 'Mantiene praderas de heno, pastoreo forestal y pequeñas parcelas en suelos minerales. Donde continúa la roza tradicional, usa ciclos largos y superficies limitadas, sin drenar turberas.' },
    ],
    especies: [
      'Pícea noruega (Picea abies)',
      'Pino silvestre (Pinus sylvestris)',
      'Abedul pubescente (Betula pubescens)',
      'Arándano rojo (Vaccinium vitis-idaea)',
      'Esfagno báltico (Sphagnum balticum)',
    ],
    fuentes: [
      { label: 'European Commission — Natura 2000 in the Boreal Region', url: 'https://www.termeszetvedelem.hu/_user/downloads/EUs%20kiadvanyok/Natura2000_boreal_region.pdf' },
      { label: 'EEA — Biogeographical regions in Europe', url: 'https://www.eea.europa.eu/en/analysis/maps-and-charts/biogeographical-regions-in-europe-2' },
      { label: 'FAO — Agroforestry in central, northern and eastern Europe', url: 'https://www.fao.org/4/y1935e/y1935e03.pdf' },
    ],
  },

  // ES, FR, AD, IT, CH, LI, DE, AT, SI, PL, SK, RO, UA · ECO_ID 689 · Köppen Cfb, Dfb, Dfc, ET · confianza alta
  // ECO_ID 689 son los Alpes y 676 los Pirineos, agregado en 09/2026 para que la ficha se active donde su propio texto dice; los Cárpatos siguen sin curar. La elevación debe ser un segundo criterio porque RESOLVE incluye valles y laderas en polígonos amplios.
  alpino_montano_europeo: {
    id: 'alpino_montano_europeo',
    nombre: 'Alpino y montano europeo',
    emoji: '🏔️',
    color: '#6E806B',
    resumen: 'Pisos montanos y alpinos de los Alpes, Pirineos, Cárpatos y otras cordilleras europeas. En pocos kilómetros cambian clima, suelo, bosque, pastura y riesgo natural.',
    vegetacion: 'Haya, abeto, pícea, alerce y pino cembro dan paso a matorrales bajos y praderas alpinas por encima del límite forestal.',
    fauna: 'Rebeco, íbice, marmota, águila real y urogallo usan distintos pisos y corredores altitudinales.',
    suelos: 'Leptosoles y Cambisoles son someros, pedregosos y muy variables; las pendientes concentran erosión y movimientos en masa. Conviene mantener césped, terrazas y drenaje difuso.',
    saberes: [
      { cultura: 'Pastores alpinos', practicas: 'Practican transhumancia vertical: suben el ganado a pasturas de verano y reservan praderas bajas para heno de invierno. La carga y la fecha de salida sostienen diversidad y evitan erosión.' },
      { cultura: 'Comunidades regantes de Valais, Tirol y Alpes vecinos', practicas: 'Distribuyen agua por gravedad mediante canales, acequias y turnos comunitarios para regar praderas. Mantienen tomas y canales en forma colectiva y ajustan caudal a pendiente y suelo.' },
    ],
    especies: [
      'Alerce europeo (Larix decidua)',
      'Pino cembro (Pinus cembra)',
      'Pícea noruega (Picea abies)',
      'Rhododendron ferrugíneo (Rhododendron ferrugineum)',
      'Edelweiss (Leontopodium nivale)',
    ],
    fuentes: [
      { label: 'European Commission — Natura 2000 in the Alpine Region', url: 'https://op.europa.eu/en/publication-detail/-/publication/9a738f76-c937-478d-b720-1562a53385e4/' },
      { label: 'FAO — Traditional Hay Milk Farming in the Austrian Alpine Arc', url: 'https://www.fao.org/giahs/giahs-around-the-world/austria-traditional-hay-milk-farming-system/en' },
      { label: 'UNESCO — Traditional irrigation: knowledge, technique, and organization', url: 'https://ich.unesco.org/en/RL/traditional-irrigation-knowledge-technique-and-organization-01979' },
    ],
  },

  // ES, PT · ECO_ID 645, 668, 787 · Köppen Csa, Csb, Cfb, BWh, BSh · confianza alta
  // Se listan ECO_ID verificados para Azores, Madeira y Canarias. Una sola ficha alcanza para contexto general, pero la app debe mostrar el archipiélago y el ECO_ID específico.
  macaronesia: {
    id: 'macaronesia',
    nombre: 'Macaronesia',
    emoji: '🌋',
    color: '#557F60',
    resumen: 'Archipiélagos atlánticos de Canarias, Madeira y Azores, con fuerte endemismo y gradientes desde costas áridas hasta laurisilva húmeda. El relieve volcánico genera muchos microclimas.',
    vegetacion: 'Laurisilva, fayal-brezal, pinar canario, tabaibal-cardonal y brezales azorianos cambian con isla, altitud y exposición a los alisios.',
    fauna: 'Lagartos gigantes, palomas de la laurisilva, murciélagos y numerosos invertebrados endémicos reflejan el aislamiento insular.',
    suelos: 'Andosoles volcánicos pueden retener mucha agua y fósforo; en vertientes áridas son someros y erosionables. Terrazas, muros y cobertura protegen suelo frente a pendiente, viento y lluvia torrencial.',
    saberes: [
      { cultura: 'Campesinado canario', practicas: 'Usa enarenado y jable para conservar humedad, zocos para cortar viento y gavias o nateros para captar escorrentía y sedimento. Mantiene bancales y muros de piedra en laderas.' },
      { cultura: 'Campesinado madeirense y azoriano', practicas: 'Cultiva terrazas pequeñas con frutales, viña, tubérculos y pasturas; en Madeira distribuye agua mediante levadas. Conserva setos y bordes para sostener suelo en pendientes volcánicas.' },
    ],
    especies: [
      'Laurel canario (Laurus novocanariensis)',
      'Til (Ocotea foetens)',
      'Pino canario (Pinus canariensis)',
      'Faya (Morella faya)',
      'Brezo arbóreo (Erica arborea)',
    ],
    fuentes: [
      { label: 'FAO — Agricultural Systems in Jable and Volcanic Sands in Lanzarote', url: 'https://www.fao.org/giahs/around-the-world/detail/spain-lanzarote-volcanic-systems/' },
      { label: 'Gobierno de Canarias — Directrices de ordenación del suelo agrario', url: 'https://www.gobiernodecanarias.org/agricultura/docs/desarrollo-rural/dosa_avance/01_Memoria_Avance_signed.pdf' },
      { label: 'EEA — Biogeographical regions in Europe', url: 'https://www.eea.europa.eu/en/analysis/maps-and-charts/biogeographical-regions-in-europe-2' },
      { label: 'EEA — EUNIS habitat classification', url: 'https://www.eea.europa.eu/en/datahub/datahubitem-view/638330ea-90e6-4e41-81ea-e70f25ae7117' },
    ],
  },
};

/**
 * Las 22 escritas a mano, las 53 americanas, las 8 europeas y las 47
 * sudamericanas que vienen de los paquetes de investigación, y dos bloques más
 * que también se escribieron a mano pero cuya lista salió de enumerar contra
 * RESOLVE en vez de un paquete: las 10 canadienses y las 28 del resto de la
 * Unión Europea y sus asociados. Los seis bloques son disjuntos: el test lo
 * verifica, porque un id repetido acá se resolvería en silencio a favor del
 * último y una ficha quedaría muerta sin que nada falle.
 */
export const BIOMAS_REGIONALES: Record<string, BiomaFicha> = {
  ...CURADAS_A_MANO,
  ...BIOMAS_REGIONALES_AMERICA,
  ...BIOMAS_REGIONALES_CANADA,
  ...BIOMAS_REGIONALES_EUROPA,
  ...BIOMAS_REGIONALES_EUROPA_UE,
  ...BIOMAS_REGIONALES_SUDAMERICA,
};

/** Los seis bloques por separado, para que el test pueda cruzarlos. */
export { CURADAS_A_MANO as BIOMAS_REGIONALES_CURADAS };
export { BIOMAS_REGIONALES_EUROPA_UE };
