/**
 * Fichas regionales de Norteamérica, México, Centroamérica y el Caribe.
 *
 * ARCHIVO GENERADO desde _research/ecosistemas-saberes-mesoamerica-norteamerica/
 * fase-1-ecologia/fichas-ecologicas-nuevas.json. No editar a mano: se regenera
 * desde el paquete de investigación, que es donde vive la trazabilidad (fuentes,
 * puntos verificados por consulta espacial y nivel de confianza por ficha).
 *
 * `saberes` va vacío a propósito en todas. Los saberes de estas regiones son
 * subnacionales y necesitan geometría propia con procedencia y licencia; viven
 * en la fase 2 del paquete y se montan aparte, en `lib/saberes.ts`, donde no se
 * activan sin geometría con procedencia y licencia. Dejar
 * la lista vacía es la garantía de que no atribuimos prácticas a un pueblo por
 * el solo hecho de que su territorio caiga adentro de una ecorregión.
 */

import type { BiomaFicha } from './biomaTipos';

export const BIOMAS_REGIONALES_AMERICA: Record<string, BiomaFicha> = {
  // US · confianza alta
  alaska_costa_taiga: {
    id: 'alaska_costa_taiga',
    nombre: 'Alaska: bosque costero y taiga',
    emoji: '🌲',
    color: '#315E52',
    resumen: 'Desde selva templada lluviosa del sureste y costas del Pacífico hasta taiga interior, turberas, grandes ríos y bosques discontinuos sobre permafrost.',
    vegetacion: 'Sitka spruce, western hemlock, cedros, white y black spruce, abedul, álamo, sauces y tundra arbustiva en transición.',
    fauna: 'Salmón, oso pardo y negro, alce, caribú, castor, águila calva y aves migratorias.',
    suelos: 'Spodosoles húmedos y turberas costeras; Gelisoles con permafrost en interior. Deshielo altera drenaje, estabilidad y carbono del suelo.',
    saberes: [],
    especies: [
      'Sitka spruce (Picea sitchensis)',
      'Black spruce (Picea mariana)',
      'Abedul de Alaska (Betula neoalaskana)',
      'Salmón rojo (Oncorhynchus nerka)',
    ],
    cultivos: ['papa', 'cebada', 'avena', 'arandano', 'raigras', 'trebol_blanco'],
    fuentes: [
      { label: 'NOAA — Multiple Knowledge Systems and Subsistence', url: 'https://www.fisheries.noaa.gov/alaska/socioeconomics/multiple-knowledge-systems-and-subsistence' },
      { label: 'ADF&G — Local knowledge of Mulchatna caribou', url: 'https://www.adfg.alaska.gov/index.cfm?adfg=wildlifenews.view_article&articles_id=864' },
      { label: 'USGS — Alaska ecoregions', url: 'https://www.usgs.gov/media/files/ecomap-ecoregions-and-subregions-alaska' },
    ],
  },

  // US · confianza alta
  alaska_tundra_hielo_beringia: {
    id: 'alaska_tundra_hielo_beringia',
    nombre: 'Alaska: tundra, Beringia e hielos de montaña',
    emoji: '❄️',
    color: '#75939A',
    resumen: 'Tundras costeras, llanuras de Beringia, montañas, Aleutianas e icefields donde permafrost, nieve, viento, humedales y hielo marino controlan la vida.',
    vegetacion: 'Cárices, cotton grass, musgos, líquenes, sauces enanos, Dryas y praderas de gramíneas/forbs en Aleutianas.',
    fauna: 'Caribú, buey almizclero, zorro ártico, osos, aves acuáticas y marinas; costa e hielo conectan ecosistemas terrestres y marinos.',
    suelos: 'Gelisoles con capa activa sobre permafrost, turbas y criosuelos; termokarst, erosión costera y deshielo cambian hidrología con rapidez.',
    saberes: [],
    especies: [
      'Cottongrass (Eriophorum spp.)',
      'Sauce ártico (Salix arctica)',
      'Caribú (Rangifer tarandus)',
      'Zorro ártico (Vulpes lagopus)',
    ],
    fuentes: [
      { label: 'NOAA — Multiple Knowledge Systems and Subsistence', url: 'https://www.fisheries.noaa.gov/alaska/socioeconomics/multiple-knowledge-systems-and-subsistence' },
      { label: 'NOAA — Sea ice and Alaska Native community', url: 'https://www.pmel.noaa.gov/arctic-zone/workshop_summary.html' },
      { label: 'USGS — Alaska ecoregions', url: 'https://www.usgs.gov/media/files/ecomap-ecoregions-and-subregions-alaska' },
    ],
  },

  // MX · confianza media
  altiplano_mexicano_matorral: {
    id: 'altiplano_mexicano_matorral',
    nombre: 'Matorrales del Altiplano y Meseta Central',
    emoji: '🌾',
    color: '#9A8B55',
    resumen: 'Cuencas interiores semiáridas del centro-norte de México con matorral xerófilo, pastizal y parches de mezquital entre sierras.',
    vegetacion: 'Nopales, magueyes, mezquites, huizaches, gobernadora, candelilla, yucas y pastos de temporal.',
    fauna: 'Águila real, zorra del desierto, venado, liebres, roedores, reptiles y polinizadores de agaves y cactáceas.',
    suelos: 'Calcisoles y suelos someros con carbonatos, tepetate o sales; conservar cobertura y dirigir escorrentía es crucial ante lluvias cortas e intensas.',
    saberes: [],
    especies: [
      'Nopal (Opuntia spp.)',
      'Maguey (Agave spp.)',
      'Mezquite (Prosopis spp.)',
      'Candelilla (Euphorbia antisyphilitica)',
    ],
    cultivos: ['maiz_tropical', 'poroto_trepador', 'zapallo_milpa', 'amaranto', 'chile_seco', 'nopal', 'agave', 'mezquite'],
    fuentes: [
      { label: 'FAO — recursos no maderables de zonas áridas mexicanas', url: 'https://www.fao.org/4/j2215s/j2215s08.htm' },
      { label: 'CONABIO — Ecosistemas de México', url: 'https://www.biodiversidad.gob.mx/ecosistemas/ecosismex.html' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // AI, AG, BB, BQ, DM, GD, GP, KN, LC, MF, MQ, MS, BL, SX, VC, VG, VI · confianza alta
  antillas_menores_bosques_humedos_secos: {
    id: 'antillas_menores_bosques_humedos_secos',
    nombre: 'Bosques húmedos y secos de las Antillas Menores',
    emoji: '🌋',
    color: '#397054',
    resumen: 'Arco de islas volcánicas y calizas donde las laderas de barlovento sostienen selvas húmedas y bosque montano, mientras sotaventos y costas tienen bosque seco y matorral.',
    vegetacion: 'Gommier, palmas, helechos arborescentes y epífitas en montañas húmedas; gumbo-limbo, acacias, cactáceas y matorral costero en zonas secas.',
    fauna: 'Loros insulares, murciélagos, ranas, lagartijas y aves marinas muestran alto endemismo y gran vulnerabilidad a invasoras y pérdida de hábitat.',
    suelos: 'Andisoles jóvenes y erosionables en islas volcánicas; calizas someras en islas bajas. Huracanes, pendientes y lluvias intensas favorecen deslizamientos cuando falta cobertura.',
    saberes: [],
    especies: [
      'Gommier (Dacryodes excelsa)',
      'Cacao (Theobroma cacao)',
      'Árbol del pan (Artocarpus altilis)',
      'Coco (Cocos nucifera)',
      'Larouman (Ischnosiphon arouma)',
    ],
    cultivos: ['coco', 'platano', 'name', 'taro', 'arbol_pan', 'cacao', 'cafe', 'batata'],
    fuentes: [
      { label: 'FAO — sistemas agroforestales tradicionales de Dominica', url: 'https://www.fao.org/4/x5656e/x5656e05.htm' },
      { label: 'FAO — recursos forestales y conocimiento Kalinago', url: 'https://www.fao.org/4/x6689e/X6689E13.htm' },
      { label: 'CEPF — Caribbean Islands Ecosystem Profile', url: 'https://www.cepf.net/sites/default/files/cepf-caribbean-islands-ecosystem-profile-december-2020-english.pdf' },
    ],
  },

  // US · confianza alta
  apalaches_bosques_y_rivercane: {
    id: 'apalaches_bosques_y_rivercane',
    nombre: 'Bosques de los Apalaches y Piedmont',
    emoji: '🌳',
    color: '#476B3D',
    resumen: 'Cordillera y piedemonte de bosques templados muy diversos, barrancos húmedos, cumbres frías, ríos y antiguos claros mantenidos por perturbaciones y uso humano.',
    vegetacion: 'Robles, nogales, arces, tulípero, castaño rebrotante, hemlock y rododendros; canebrakes de rivercane ocupan planicies aluviales y riberas abiertas.',
    fauna: 'Oso negro, venado, pavo silvestre, salamandras, peces y mejillones de agua dulce; la conectividad altitudinal ayuda frente al calentamiento.',
    suelos: 'Ultisoles y Alfisoles meteorizados, ácidos y erosionables en ladera; coluvios y aluviones son más profundos, con riesgo de pérdida por caminos y suelos desnudos.',
    saberes: [],
    especies: [
      'Robles (Quercus spp.)',
      'Tulípero (Liriodendron tulipifera)',
      'Tsuga (Tsuga canadensis)',
      'Rivercane (Arundinaria gigantea)',
    ],
    cultivos: ['arce_azucarero', 'manzano', 'castano', 'maiz_tropical', 'poroto_trepador', 'zapallo_milpa', 'arandano', 'avena'],
    fuentes: [
      { label: 'NPS — Rivercane', url: 'https://home.nps.gov/articles/000/rivercane.htm' },
      { label: 'NPS — Native influence on Blue Ridge', url: 'https://www.nps.gov/blri/learn/historyculture/native-american-culture-and-influence.htm' },
      { label: 'EPA — Ecoregions of North America', url: 'https://www.epa.gov/eco-research/ecoregions-north-america' },
    ],
  },

  // BS, TC · confianza base_ecologica
  bahamas_pinares_manglares: {
    id: 'bahamas_pinares_manglares',
    nombre: 'Pinares y manglares de Bahamas',
    emoji: '🏝️',
    color: '#4E8063',
    resumen: 'Islas calizas bajas con pinares abiertos en las islas mayores, monte bajo, humedales de marea y manglares muy expuestos a huracanes y salinidad.',
    vegetacion: 'Pino caribeño var. bahamensis, palmas, matorral de coppice y cuatro especies principales de mangle según elevación e hidroperiodo.',
    fauna: 'Loro de Bahamas, reptiles, murciélagos, aves migratorias, peces juveniles, langostas y caracoles marinos dependen del vínculo tierra-humedal-arrecife.',
    suelos: 'Extremadamente someros sobre caliza, alcalinos y con poca agua dulce almacenada. El tránsito y el fuego severo dañan raíces; en manglar, cualquier cambio de flujo tiene efectos rápidos.',
    saberes: [],
    especies: [
      'Pino de Bahamas (Pinus caribaea var. bahamensis)',
      'Palma de sabal (Sabal palmetto)',
      'Mangle rojo (Rhizophora mangle)',
      'Mangle negro (Avicennia germinans)',
      'Cocoplum (Chrysobalanus icaco)',
    ],
    cultivos: ['coco', 'batata', 'name', 'guandul', 'chile_seco', 'maiz_tropical', 'sisal'],
    fuentes: [
      { label: 'CEPF — Caribbean Islands Ecosystem Profile', url: 'https://www.cepf.net/sites/default/files/cepf-caribbean-islands-ecosystem-profile-december-2020-english.pdf' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // MX · confianza base_ecologica
  baja_california_desiertos_y_sierras: {
    id: 'baja_california_desiertos_y_sierras',
    nombre: 'Desiertos, oasis y sierras de Baja California',
    emoji: '🌵',
    color: '#B38A54',
    resumen: 'Península árida con planicies pedregosas, dunas, oasis, costas del golfo y sierras que sostienen bosques secos o pino-encino como islas biogeográficas.',
    vegetacion: 'Cardones, cirios, torotes, agaves, yucas y gobernadora; en oasis aparecen palmas y vegetación riparia, y en Sierra de la Laguna bosques secos y pinares aislados.',
    fauna: 'Borrego cimarrón, berrendo peninsular, venado bura, reptiles y aves endémicas; oasis y aguadas concentran biodiversidad y son extremadamente vulnerables.',
    suelos: 'Aridisoles y entisoles poco desarrollados, abanicos aluviales salinos y arenas; la costra biológica y la vegetación dispersa reducen erosión eólica e hídrica.',
    saberes: [],
    especies: [
      'Cardón (Pachycereus pringlei)',
      'Cirio (Fouquieria columnaris)',
      'Torote (Bursera microphylla)',
      'Pino piñonero (Pinus cembroides)',
    ],
    cultivos: ['datilera', 'granado', 'olivo', 'vid', 'cebolla', 'nopal', 'agave', 'mezquite'],
    fuentes: [
      { label: 'CONABIO — Ecosistemas de México', url: 'https://www.biodiversidad.gob.mx/ecosistemas/ecosismex.html' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // MX · confianza media
  balsas_jalisco_bosques_secos: {
    id: 'balsas_jalisco_bosques_secos',
    nombre: 'Bosques secos de Balsas y Jalisco',
    emoji: '🍂',
    color: '#9B7443',
    resumen: 'Selvas bajas caducifolias de valles y costa del Pacífico con estación seca marcada y fuerte recambio florístico entre cuencas.',
    vegetacion: 'Copales y cuajiotes, pochote, parota, cactáceas columnares y leguminosas; gran parte pierde hojas durante la sequía.',
    fauna: 'Jaguar, ocelote, venado, iguana negra, murciélagos y aves endémicas del Pacífico mexicano.',
    suelos: 'Suelos someros y pedregosos en laderas, aluviales en valles; la cobertura de hojarasca amortigua lluvias torrenciales al inicio del temporal.',
    saberes: [],
    especies: [
      'Copales (Bursera spp.)',
      'Parota (Enterolobium cyclocarpum)',
      'Pochote (Ceiba aesculifolia)',
      'Pitaya (Stenocereus spp.)',
    ],
    cultivos: ['maiz_tropical', 'poroto_trepador', 'zapallo_milpa', 'chile_seco', 'cana_azucar', 'agave', 'gliricidia', 'vetiver'],
    fuentes: [
      { label: 'CONABIO — La milpa', url: 'https://www.biodiversidad.gob.mx/diversidad/sistemas-productivos/milpa' },
      { label: 'CONABIO — Ecosistemas de México', url: 'https://www.biodiversidad.gob.mx/ecosistemas/ecosismex.html' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // BZ, GT, HN, NI, CO · confianza media
  bosque_atlantico_mosquitia: {
    id: 'bosque_atlantico_mosquitia',
    nombre: 'Bosques húmedos del Caribe centroamericano y la Mosquitia',
    emoji: '🌧️',
    color: '#146B57',
    resumen: 'Llanuras cálidas y muy húmedas de Belice, Guatemala, Honduras y Nicaragua, con selvas siempreverdes, ríos, pantanos, lagunas y bosques costeros.',
    vegetacion: 'Caoba, cedro, santa maría, palmas, heliconias, lianas y bosques pantanosos; hacia la costa se enlazan con manglares y sabanas inundables.',
    fauna: 'Jaguar, tapir, manatí antillano, águila harpía, monos y gran diversidad de peces y tortugas conectan cuencas, bosque y litoral.',
    suelos: 'Muy meteorizados y lixiviados en terrazas, aluviales o hidromorfos en bajos. La fertilidad se concentra en biomasa y mantillo; drenarlos o dejarlos desnudos degrada rápido el sistema.',
    saberes: [],
    especies: [
      'Caoba (Swietenia macrophylla)',
      'Santa María (Calophyllum brasiliense)',
      'Palma yolillo (Raphia taedigera)',
      'Cacao (Theobroma cacao)',
      'Mangle rojo (Rhizophora mangle)',
    ],
    cultivos: ['cacao', 'coco', 'yuca', 'platano', 'arroz', 'caupi', 'pupunha', 'inga'],
    fuentes: [
      { label: 'UNESCO — transmisión del conocimiento Mayangna', url: 'https://ich.unesco.org/en/project-education/reinforcing-the-transmission-of-mayangna-knowledge-and-culture-in-the-classroom-00493' },
      { label: 'UNESCO — programa LINKS en América Latina y el Caribe', url: 'https://www.unesco.org/es/links/lac' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // PA · confianza base_ecologica
  bosque_seco_panameno: {
    id: 'bosque_seco_panameno',
    nombre: 'Bosque seco panameño',
    emoji: '🍂',
    color: '#9A8146',
    resumen: 'Remanentes de bosque tropical seco del arco pacífico de Panamá, con estación seca marcada y fuerte transformación histórica por agricultura y ganadería.',
    vegetacion: 'Dosel bajo o mediano de especies caducifolias, árboles espinosos, guanacaste, indio desnudo y pastizales secundarios.',
    fauna: 'Venado cola blanca, ñeque, iguanas, murciélagos y aves frugívoras usan riberas, cercas vivas y fragmentos de bosque.',
    suelos: 'Arcillosos a pedregosos, con déficit hídrico estacional. Cobertura seca, árboles dispersos y franjas ribereñas reducen temperatura y erosión al inicio de las lluvias.',
    saberes: [],
    especies: [
      'Guanacaste (Enterolobium cyclocarpum)',
      'Indio desnudo (Bursera simaruba)',
      'Espavé (Anacardium excelsum)',
      'Guácimo (Guazuma ulmifolia)',
      'Jobo (Spondias mombin)',
    ],
    cultivos: ['maiz_tropical', 'poroto_trepador', 'sorgo', 'sesamo', 'cana_azucar', 'guandul', 'gliricidia', 'vetiver'],
    fuentes: [
      { label: 'FAO Panamá — sistemas alimentarios y semillas', url: 'https://www.fao.org/panama/noticias/detail-events/fr/c/1145785/' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // US · confianza alta
  california_klamath_sierra_valle: {
    id: 'california_klamath_sierra_valle',
    nombre: 'California: Klamath, Sierra Nevada, Valle Central y bosques interiores',
    emoji: '🌲',
    color: '#4E7147',
    resumen: 'Gradiente mediterráneo desde pastizales del Valle Central y chaparral hasta bosques mixtos de Klamath y coníferas de Sierra Nevada.',
    vegetacion: 'Robles, pino ponderosa, sugar pine, cedro incienso, sequoias, chaparral, pastos anuales y humedales remanentes.',
    fauna: 'Oso negro, puma, venado, fisher, salmón, águila real y fauna endémica de charcas vernales.',
    suelos: 'Alfisoles y Ultisoles montanos, suelos aluviales profundos en el valle y sustratos ultramáficos en Klamath; fuego severo y sequía elevan erosión.',
    saberes: [],
    especies: [
      'Avellano de California (Corylus cornuta var. californica)',
      'Pino ponderosa (Pinus ponderosa)',
      'Roble azul (Quercus douglasii)',
      'Salmón Chinook (Oncorhynchus tshawytscha)',
    ],
    cultivos: ['almendro', 'nogal', 'vid', 'olivo', 'naranjo', 'durazno', 'arroz', 'lavanda', 'alfalfa'],
    fuentes: [
      { label: 'USFS — Karuk and Yurok cultural burning', url: 'https://research.fs.usda.gov/treesearch/62061' },
      { label: 'NOAA — Original Salmon Stewards', url: 'https://www.fisheries.noaa.gov/west-coast/endangered-species-conservation/original-salmon-stewards' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // MX, US · confianza media
  californias_chaparral_costero: {
    id: 'californias_chaparral_costero',
    nombre: 'Chaparral costero y montano de las Californias',
    emoji: '🌿',
    color: '#7A8050',
    resumen: 'Mosaico mediterráneo binacional de matorral costero, chaparral, encinares y bosques abiertos, con inviernos lluviosos, veranos secos y fuegos de recurrencia variable.',
    vegetacion: 'Salvias, artemisias, chamise, manzanitas, ceanothus y encinos; en altura se agregan coníferas. El matorral costero no responde igual al fuego que todo el chaparral.',
    fauna: 'Venado bura, puma, coyote, codornices, reptiles y polinizadores; numerosas especies tienen distribución restringida por islas de relieve y urbanización.',
    suelos: 'Suelos someros sobre granitos, lutitas o rocas sedimentarias, muy sensibles a erosión después de incendio; costras hidrofóbicas y lluvias intensas pueden disparar flujos de detritos.',
    saberes: [],
    especies: [
      'Chamise (Adenostoma fasciculatum)',
      'Encinos (Quercus spp.)',
      'Manzanitas (Arctostaphylos spp.)',
      'Salvia negra (Salvia mellifera)',
    ],
    cultivos: ['olivo', 'vid', 'almendro', 'aguacate', 'naranjo', 'cerezo', 'higuera', 'veza'],
    fuentes: [
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
      { label: 'USFS — Indigenous fire stewardship', url: 'https://research.fs.usda.gov/treesearch/62060' },
    ],
  },

  // MX · confianza alta
  centro_mexico_volcanes_bajio: {
    id: 'centro_mexico_volcanes_bajio',
    nombre: 'Eje Volcánico, altiplanos del centro y Bajío',
    emoji: '🌋',
    color: '#657545',
    resumen: 'Montañas volcánicas de pino-encino y oyamel rodeadas por valles templados, bosques secos del Bajío, humedales y una larga historia agrícola.',
    vegetacion: 'Pinos, encinos, oyamel, aile, zacatonales de altura y selva baja en cuencas cálidas; humedales sobreviven en depresiones y riberas.',
    fauna: 'Mariposa monarca, teporingo, ajolotes, venado cola blanca, aves rapaces y polinizadores.',
    suelos: 'Andosoles porosos de ceniza, Vertisoles en valles y suelos endurecidos por tepetate; urbanización, erosión y extracción de agua alteran infiltración.',
    saberes: [],
    especies: [
      'Oyamel (Abies religiosa)',
      'Ahuejote (Salix bonplandiana)',
      'Maguey (Agave spp.)',
      'Maíz (Zea mays)',
    ],
    cultivos: ['maiz_tropical', 'poroto_trepador', 'zapallo_milpa', 'amaranto', 'chia', 'aguacate', 'durazno', 'nopal', 'agave'],
    fuentes: [
      { label: 'FAO — Chinampas', url: 'https://www.fao.org/giahs/giahs-around-the-world/mexico-chinampas-agricultural-system/en' },
      { label: 'FAO — Metepantle', url: 'https://www.fao.org/giahs/giahs-around-the-world/mexico-meteplante/en' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // MX · confianza media
  chiapas_bosques_montanos: {
    id: 'chiapas_bosques_montanos',
    nombre: 'Bosques montanos de Chiapas y Chimalapas',
    emoji: '🌧️',
    color: '#2F6D51',
    resumen: 'Sierras húmedas con bosque mesófilo, pino-encino y selvas de montaña que conectan Oaxaca, Chiapas y Guatemala.',
    vegetacion: 'Liquidámbar, encinos, pinos, magnolias, helechos arborescentes, bromelias y orquídeas; el dosel intercepta niebla.',
    fauna: 'Quetzal, pavón, tapir, jaguar, ocelote y anfibios endémicos sensibles a temperatura y humedad.',
    suelos: 'Suelos ácidos, húmedos y ricos en materia orgánica superficial; al desmontarse pierden estructura y se erosionan rápidamente en pendientes.',
    saberes: [],
    especies: [
      'Liquidámbar (Liquidambar styraciflua)',
      'Encinos (Quercus spp.)',
      'Pinos (Pinus spp.)',
      'Cacao (Theobroma cacao)',
    ],
    cultivos: ['cafe', 'aguacate', 'maiz_tropical', 'poroto_trepador', 'platano_sombra', 'inga', 'nogal_cafetero', 'vetiver'],
    fuentes: [
      { label: 'FAO — traditional agrifood systems in Mexico', url: 'https://www.fao.org/newsroom/story/traditional-agrifood-systems-conserve-biodiversity-and-support-nutrition-in-mexico/en' },
      { label: 'CONAFOR — política forestal con pertinencia cultural', url: 'https://www.gob.mx/conafor/prensa/conafor-emite-las-reglas-de-operacion-del-programa-desarrollo-forestal-sustentable-para-el-bienestar-2025?idiom=es-MX' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // GT, HN, SV, NI, CR · confianza alta
  corredor_seco_centroamericano: {
    id: 'corredor_seco_centroamericano',
    nombre: 'Bosque seco y corredor seco centroamericano',
    emoji: '🌵',
    color: '#A07B43',
    resumen: 'Vertiente pacífica y valles interiores con estación seca prolongada, lluvias irregulares y parches de bosque caducifolio. Incluye el singular matorral espinoso del valle del Motagua.',
    vegetacion: 'Árboles caducifolios, acacias, jiote, guanacaste, madre cacao, cactáceas y pastos estacionales; el dosel se abre marcadamente durante la seca.',
    fauna: 'Venado cola blanca, iguanas, murciélagos polinizadores, loras y mamíferos medianos dependen de remanentes, cercas vivas y riberas.',
    suelos: 'Frecuentemente someros y erosionables, con pulsos intensos de lluvia después de meses secos. Rastrojo, raíces vivas y mínima quema mejoran infiltración y amortiguan temperatura.',
    saberes: [],
    especies: [
      'Madre cacao (Gliricidia sepium)',
      'Jiote (Bursera simaruba)',
      'Guanacaste (Enterolobium cyclocarpum)',
      'Maíz (Zea mays)',
      'Frijol común (Phaseolus vulgaris)',
    ],
    cultivos: ['maiz_tropical', 'sorgo', 'caupi', 'guandul', 'sesamo', 'gliricidia', 'nopal', 'vetiver'],
    fuentes: [
      { label: 'FAO — sistema agroforestal Quesungual', url: 'https://www.fao.org/4/Y5030E/y5030e19.htm' },
      { label: 'FAO Guatemala — Kuxur Rum', url: 'https://www.fao.org/guatemala/detalle/historia-de-inter%C3%A9s-humano/detail/combatir-la-sequ%C3%ADa-con-t%C3%A9cnicas-ancestrales/es' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // CR, NI, PA · confianza media
  costa_rica_bosques_humedos_estacionales: {
    id: 'costa_rica_bosques_humedos_estacionales',
    nombre: 'Bosques húmedos y estacionales de Costa Rica',
    emoji: '🦥',
    color: '#2B7A4B',
    resumen: 'Desde selvas lluviosas caribeñas hasta bosques estacionales del Pacífico, Costa Rica concentra fuertes gradientes de lluvia, relieve y exposición en poca distancia.',
    vegetacion: 'Bosques altos con palmas, lianas y epífitas en el Caribe; en el Pacífico aparece mayor caducidad, guanacaste, pochote y parches de sabana.',
    fauna: 'Jaguar, danta, perezosos, monos, lapas y anfibios dependen de corredores entre áreas protegidas, fincas y riberas.',
    suelos: 'Volcánicos, muy meteorizados o aluviales según la zona. Pendientes y lluvias intensas exigen cobertura, raíces profundas y protección de nacientes y cauces.',
    saberes: [],
    especies: [
      'Guanacaste (Enterolobium cyclocarpum)',
      'Pochote (Pachira quinata)',
      'Guarumo (Cecropia spp.)',
      'Cacao (Theobroma cacao)',
      'Laurel (Cordia alliodora)',
    ],
    cultivos: ['cafe', 'cacao', 'cana_azucar', 'yuca', 'vainilla', 'pupunha', 'platano_sombra', 'inga'],
    fuentes: [
      { label: 'SINAC — Área de Conservación Guanacaste', url: 'https://sinac.go.cr/ES/ac/acg/Paginas/default.aspx' },
      { label: 'SINAC — Área de Conservación Tortuguero', url: 'https://www.sinac.go.cr/ES/ac/acto/pnt/Paginas/default.aspx' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // CU · confianza alta
  cuba_bosques_karst_y_pinares: {
    id: 'cuba_bosques_karst_y_pinares',
    nombre: 'Bosques, karst y pinares de Cuba',
    emoji: '🇨🇺',
    color: '#3B744B',
    resumen: 'Mosaico insular excepcionalmente diverso: bosques húmedos y secos, pinares sobre sustratos pobres, mogotes calizos, matorral xeromorfo y humedales costeros.',
    vegetacion: 'Palmas, bosques semideciduos, pinos cubanos, encinares, cuabales y cactáceas; los mogotes conservan flora muy especializada y endémica.',
    fauna: 'Tocororo, zunzuncito, jutías, almiquí, iguanas y numerosos moluscos terrestres; humedales y costas sostienen cocodrilos, aves y tortugas marinas.',
    suelos: 'Muy variables: calizas someras, serpentinas pobres, arenas ácidas y turbas. En laderas de mogote y pinares la alteración del drenaje o del mantillo produce pérdidas difíciles de revertir.',
    saberes: [],
    especies: [
      'Palma real (Roystonea regia)',
      'Pino cubano (Pinus cubensis)',
      'Júcaro (Bucida buceras)',
      'Caguairán (Guibourtia hymenaeifolia)',
      'Ceiba (Ceiba pentandra)',
    ],
    cultivos: ['cafe', 'cacao', 'platano', 'yuca', 'name', 'batata', 'coco', 'cana_azucar', 'inga'],
    fuentes: [
      { label: 'UNESCO — Valle de Viñales', url: 'https://whc.unesco.org/en/list/840/' },
      { label: 'UNESCO — Guanahacabibes', url: 'https://www.unesco.org/en/mab/peninsula-de-guanahacabibes' },
      { label: 'FAO — conuco cubano', url: 'https://www.fao.org/4/w8801e/w8801e03.htm' },
    ],
  },

  // PA, CO · confianza alta
  darien_humedo_panama: {
    id: 'darien_humedo_panama',
    nombre: 'Bosques húmedos del Darién y Panamá oriental',
    emoji: '🌿',
    color: '#175E45',
    resumen: 'Selvas de tierras bajas y montañas aisladas en el oriente panameño, atravesadas por grandes ríos y conectadas ecológicamente con el Chocó colombiano.',
    vegetacion: 'Bosque siempreverde alto, palmas, lianas, cativales y bosques inundables; la composición cambia con relieve, drenaje y cercanía al litoral.',
    fauna: 'Águila harpía, jaguar, tapir, pecaríes y primates; ríos y estuarios sostienen peces, reptiles y aves acuáticas.',
    suelos: 'Muy húmedos y meteorizados, con aluviones fértiles a orillas de ríos y pendientes frágiles en serranías. La cobertura forestal regula caudales y protege suelos.',
    saberes: [],
    especies: [
      'Cativo (Prioria copaifera)',
      'Chunga (Astrocaryum standleyanum)',
      'Cacao (Theobroma cacao)',
      'Yuca (Manihot esculenta)',
      'Plátano (Musa spp.)',
    ],
    cultivos: ['cacao', 'platano', 'yuca', 'arroz', 'name', 'coco', 'pupunha', 'inga'],
    fuentes: [
      { label: 'FAO — agricultura nainu en Panamá', url: 'https://www.fao.org/fileadmin/templates/esw/esw_new/documents/SARD/good_practices_Latin_America/13_Nainu_agriculture_Panama1.pdf' },
      { label: 'FAO Panamá — sistemas alimentarios indígenas', url: 'https://www.fao.org/panama/noticias/detail-events/fr/c/1145785/' },
      { label: 'UNESCO — Darién', url: 'https://www.unesco.org/en/mab/darien' },
    ],
  },

  // US · confianza alta
  everglades_manglares_sur_florida: {
    id: 'everglades_manglares_sur_florida',
    nombre: 'Everglades y manglares del sur de Florida',
    emoji: '🐊',
    color: '#3E8066',
    resumen: 'Río somero de pastos, sloughs, islas de árboles, cipresales, pineland y manglares gobernado por el pulso estacional de agua y fuego.',
    vegetacion: 'Sawgrass, nenúfares, ciprés calvo, pino slash, hardwood hammocks y mangles rojo, negro y blanco.',
    fauna: 'Caimán, cocodrilo americano, pantera de Florida, manatí, caracolero y aves zancudas.',
    suelos: 'Marl calcáreo y turbas poco profundas sobre caliza; drenaje provoca oxidación, subsidencia y fuegos de suelo, mientras exceso de nutrientes cambia la vegetación.',
    saberes: [],
    especies: [
      'Sawgrass (Cladium jamaicense)',
      'Ciprés calvo (Taxodium distichum)',
      'Mangle rojo (Rhizophora mangle)',
      'Pino slash del sur de Florida (Pinus elliottii var. densa)',
    ],
    cultivos: ['coco', 'naranjo', 'aguacate', 'arbol_pan', 'batata', 'cana_azucar'],
    fuentes: [
      { label: 'NPS — Everglades ecosystems and people', url: 'https://www.nps.gov/articles/everglades.htm' },
      { label: 'NPS — Big Cypress foundation', url: 'https://www.nps.gov/bicy/learn/management/foundation-overview.htm' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // US · confianza media
  gran_cuenca_meseta_colorado: {
    id: 'gran_cuenca_meseta_colorado',
    nombre: 'Gran Cuenca, Meseta del Colorado y estepas de Wyoming',
    emoji: '🏜️',
    color: '#8A8458',
    resumen: 'Cuencas frías, mesetas, cañones y montañas interiores con sagebrush, salares, bosques de piñón-enebro y coníferas en altura.',
    vegetacion: 'Big sagebrush, saltbush, greasewood, bunchgrasses, pino piñonero, enebros y bristlecone en cumbres.',
    fauna: 'Urogallo de las artemisias, berrendo, venado mulo, conejo pigmeo, borrego cimarrón y reptiles.',
    suelos: 'Aridisoles salinos o calcáreos, Mollisoles de montaña y costras biológicas; tránsito, invasoras y fuegos repetidos pueden cambiar el sistema de forma persistente.',
    saberes: [],
    especies: [
      'Big sagebrush (Artemisia tridentata)',
      'Pino piñonero (Pinus edulis/monophylla)',
      'Enebro de Utah (Juniperus osteosperma)',
      'Indian ricegrass (Achnatherum hymenoides)',
    ],
    cultivos: ['maiz_tropical', 'poroto_trepador', 'zapallo_milpa', 'trigo', 'cebada', 'papa', 'durazno', 'alfalfa'],
    fuentes: [
      { label: 'BLM — Pinyon and Juniper Woodlands', url: 'https://www.blm.gov/sites/default/files/docs/2024-08/Management%20and%20Conservation%20of%20Pinyon%20and%20Juniper%20Woodlands%20Comment%20Summary%20Report.pdf' },
      { label: 'NPS — Indigenous Knowledge, Southwest', url: 'https://home.nps.gov/subjects/tek/southwest.htm' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // US · confianza alta
  grandes_llanuras_pradera_alta_mixta: {
    id: 'grandes_llanuras_pradera_alta_mixta',
    nombre: 'Grandes Llanuras: pradera alta, mixta y sabanas',
    emoji: '🦬',
    color: '#8C9B4E',
    resumen: 'Amplio cinturón de pastizales desde Texas al norte, con praderas altas en el este, mixtas hacia el oeste y sabanas arboladas en Cross Timbers y Edwards Plateau.',
    vegetacion: 'Big bluestem, little bluestem, Indian grass, switchgrass, gramíneas mixtas, robles y enebros en transiciones.',
    fauna: 'Bisonte, berrendo, perritos de la pradera, tejón, aves de pastizal y polinizadores; fuego y herbivoría sostienen heterogeneidad.',
    suelos: 'Mollisoles profundos y ricos en carbono en pradera alta, más someros y secos al oeste; erosión, labranza y raíces perdidas reducen estructura.',
    saberes: [],
    especies: [
      'Bisonte (Bison bison)',
      'Big bluestem (Andropogon gerardii)',
      'Little bluestem (Schizachyrium scoparium)',
      'Indian grass (Sorghastrum nutans)',
    ],
    cultivos: ['trigo', 'sorgo', 'mijo', 'girasol', 'cebada', 'maiz_tropical', 'alfalfa'],
    fuentes: [
      { label: 'USFWS — Bison management and Tribal connection', url: 'https://www.fws.gov/policy-library/701fw8' },
      { label: 'EPA — Ecoregions of North America', url: 'https://www.epa.gov/eco-research/ecoregions-north-america' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // US · confianza media
  gulf_mississippi_piney_woods: {
    id: 'gulf_mississippi_piney_woods',
    nombre: 'Llanura del Mississippi, Golfo y Piney Woods',
    emoji: '🌲',
    color: '#3E7650',
    resumen: 'Planicies húmedas del bajo Mississippi y este de Texas con bosques aluviales, cipresales, humedales y pinares sobre terrazas arenosas.',
    vegetacion: 'Ciprés calvo, tupelo, robles de humedal, liquidámbar, pino loblolly y shortleaf, rivercane y praderas húmedas.',
    fauna: 'Caimán, oso negro de Luisiana, venado, aves acuáticas, peces migratorios y anfibios.',
    suelos: 'Entisoles e Inceptisoles aluviales, Vertisoles arcillosos y Ultisoles arenosos; diques y drenaje desconectan sedimentos y pulsos de inundación.',
    saberes: [],
    especies: [
      'Ciprés calvo (Taxodium distichum)',
      'Tupelo (Nyssa aquatica)',
      'Pino loblolly (Pinus taeda)',
      'Rivercane (Arundinaria gigantea)',
    ],
    cultivos: ['pecan', 'batata', 'mani', 'arroz', 'soja', 'algodon', 'caupi', 'arandano'],
    fuentes: [
      { label: 'NPS — Rivercane', url: 'https://home.nps.gov/articles/000/rivercane.htm' },
      { label: 'EPA — Ecoregions of North America', url: 'https://www.epa.gov/eco-research/ecoregions-north-america' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // US · confianza alta
  hawaii_bosques_humedos_secos: {
    id: 'hawaii_bosques_humedos_secos',
    nombre: 'Hawái: bosques húmedos y secos',
    emoji: '🌺',
    color: '#2E735A',
    resumen: 'Bosques volcánicos insulares desde laderas lluviosas con ʻōhiʻa y helechos hasta bosques secos de sotavento con fuerte endemismo.',
    vegetacion: 'ʻŌhiʻa lehua, koa, hāpuʻu, lama y wiliwili; invasoras, enfermedades, ungulados y fuego amenazan regeneración.',
    fauna: 'Honeycreepers, nēnē, murciélago hawaiano y numerosos invertebrados y caracoles endémicos.',
    suelos: 'Andisoles jóvenes o muy meteorizados sobre lava y ceniza; edad del sustrato y lluvia controlan fósforo, drenaje y profundidad.',
    saberes: [],
    especies: [
      'ʻŌhiʻa lehua (Metrosideros polymorpha)',
      'Koa (Acacia koa)',
      'Hāpuʻu (Cibotium spp.)',
      'Wiliwili (Erythrina sandwicensis)',
    ],
    cultivos: ['taro', 'arbol_pan', 'name', 'batata', 'cafe', 'cacao', 'platano', 'coco', 'cana_azucar'],
    fuentes: [
      { label: 'NOAA — Hawaiʻi Indigenous Knowledge', url: 'https://sanctuaries.noaa.gov/bwet/hawaii/indigenous-knowledge.html' },
      { label: 'NOAA — Moku climate resilience', url: 'https://www.coast.noaa.gov/states/stories/hawaii.html' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // US · confianza media
  hawaii_matorrales_altos_bajos: {
    id: 'hawaii_matorrales_altos_bajos',
    nombre: 'Hawái: matorrales altos, bajos e islas noroccidentales',
    emoji: '🌋',
    color: '#6E815D',
    resumen: 'Matorrales tropicales desde costas ventosas y secas hasta cumbres frías sobre el límite del bosque, más islas noroccidentales bajas expuestas a sal y oleaje.',
    vegetacion: 'ʻŌhelo, pūkiawe, māmane en transición, pastos y arbustos costeros; en islas bajas dominan comunidades tolerantes a sal.',
    fauna: 'Nēnē, petreles, albatros, focas monje y numerosos invertebrados endémicos; la fauna cambia radicalmente entre cumbre e isla baja.',
    suelos: 'Cenizas volcánicas jóvenes, tefras y lavas en islas altas; arenas coralinas en islas bajas. Erosión, pisoteo e invasoras tienen efectos duraderos.',
    saberes: [],
    especies: [
      'ʻŌhelo (Vaccinium reticulatum)',
      'Pūkiawe (Leptecophylla tameiameiae)',
      'Māmane (Sophora chrysophylla)',
      'Albatros de Laysan (Phoebastria immutabilis)',
    ],
    cultivos: ['batata', 'coco', 'cafe', 'sisal', 'moringa'],
    fuentes: [
      { label: 'NOAA — Hawaiʻi Indigenous Knowledge', url: 'https://sanctuaries.noaa.gov/bwet/hawaii/indigenous-knowledge.html' },
      { label: 'NOAA — Moku climate resilience', url: 'https://www.coast.noaa.gov/states/stories/hawaii.html' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // HT, DO · confianza media
  hispaniola_bosque_humedo: {
    id: 'hispaniola_bosque_humedo',
    nombre: 'Bosques húmedos de La Española',
    emoji: '🌧️',
    color: '#28704A',
    resumen: 'Bosques de tierras bajas y laderas húmedas compartidos por Haití y República Dominicana, con gran endemismo y marcada variación por orientación y altitud.',
    vegetacion: 'Bosques siempreverdes y semideciduos con palmas, caobas, helechos, epífitas y árboles de hoja ancha; las fincas de café sombreado forman mosaicos secundarios.',
    fauna: 'Solenodonte, jutía, cigua palmera, barrancolíes y anfibios endémicos dependen de remanentes conectados y microclimas húmedos.',
    suelos: 'Calizos o volcánicos, generalmente erosionables en laderas. Árboles de sombra, barreras vivas y residuos protegen infiltración y estabilidad frente a lluvias intensas.',
    saberes: [],
    especies: [
      'Caoba antillana (Swietenia mahagoni)',
      'Palma real (Roystonea hispaniolana)',
      'Café (Coffea arabica)',
      'Guama (Inga vera)',
      'Yuca (Manihot esculenta)',
    ],
    cultivos: ['cacao', 'cafe', 'platano', 'yuca', 'name', 'arbol_pan', 'coco', 'vainilla', 'inga'],
    fuentes: [
      { label: 'FAO — manejo comunitario de cuencas en Haití', url: 'https://www.fao.org/4/v3960e/v3960e09.htm' },
      { label: 'CEPF — perfil del ecosistema de las islas del Caribe', url: 'https://www.cepf.net/sites/default/files/cepf-caribbean-islands-ecosystem-profile-december-2020-english.pdf' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // HT, DO · confianza base_ecologica
  hispaniola_seco_pinar_humedales: {
    id: 'hispaniola_seco_pinar_humedales',
    nombre: 'Bosques secos, pinares y humedales de La Española',
    emoji: '🦩',
    color: '#8B884B',
    resumen: 'Mosaico de valles secos, bosques espinosos, pinares montanos y humedales salinos como la cuenca de Enriquillo. Los contrastes de lluvia y altitud son extremos.',
    vegetacion: 'Cactáceas y arbustos espinosos en bajos secos; pino criollo y sabinas en altura; eneas, mangles y vegetación halófila alrededor de lagos y lagunas.',
    fauna: 'Iguanas rinoceronte y de Ricord, flamencos, cocodrilo americano, aves endémicas y mamíferos nativos sobreviven en hábitats muy fragmentados.',
    suelos: 'Calizos, pedregosos o salinos en zonas bajas y delgados en montañas. El fuego repetido degrada pinares; en cuencas cerradas, cambios hídricos alteran rápidamente salinidad y vegetación.',
    saberes: [],
    especies: [
      'Pino criollo (Pinus occidentalis)',
      'Guayacán (Guaiacum officinale)',
      'Caya amarilla (Sideroxylon foetidissimum)',
      'Cactáceas columnares',
      'Mangle botón (Conocarpus erectus)',
    ],
    cultivos: ['guandul', 'sorgo', 'batata', 'chile_seco', 'coco', 'sisal', 'moringa', 'nopal'],
    fuentes: [
      { label: 'FAO — conservación campesina de suelo en Haití', url: 'https://www.fao.org/4/v3960e/v3960e09.htm' },
      { label: 'CEPF — Caribbean Islands Ecosystem Profile', url: 'https://www.cepf.net/sites/default/files/cepf-caribbean-islands-ecosystem-profile-december-2020-english.pdf' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // US · confianza alta
  interior_noroeste_palouse_willamette: {
    id: 'interior_noroeste_palouse_willamette',
    nombre: 'Praderas, robledales y estepas del Noroeste interior',
    emoji: '🌾',
    color: '#86945A',
    resumen: 'Mosaico de Palouse, Willamette, Blue Mountains y estepa Snake–Columbia con praderas, robledales, matorral de artemisia y coníferas montanas.',
    vegetacion: 'Camas, Idaho fescue, bluebunch wheatgrass, Oregon white oak, sagebrush, pino ponderosa y abeto Douglas.',
    fauna: 'Ciervo mulo, wapití, urogallo de las artemisias, aves de pradera, salmón y polinizadores.',
    suelos: 'Mollisoles de loess fértil en Palouse, Vertisoles en Willamette y Aridisoles en estepa; erosión eólica/hídrica aumentó con conversión agrícola.',
    saberes: [],
    especies: [
      'Camas (Camassia quamash)',
      'Oregon white oak (Quercus garryana)',
      'Bluebunch wheatgrass (Pseudoroegneria spicata)',
      'Sagebrush (Artemisia tridentata)',
    ],
    cultivos: ['trigo', 'cebada', 'lenteja', 'garbanzo', 'colza', 'lupulo', 'avellano', 'arandano', 'raigras'],
    fuentes: [
      { label: 'NPS — Camas', url: 'https://home.nps.gov/articles/000/camas.htm' },
      { label: 'NPS — Indigenous burning at Fort Vancouver', url: 'https://www.nps.gov/articles/fovaclrindiancountry.htm' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // JM · confianza alta
  jamaica_bosque_humedo_karstico: {
    id: 'jamaica_bosque_humedo_karstico',
    nombre: 'Bosques húmedos y karst de Jamaica',
    emoji: '🦜',
    color: '#236746',
    resumen: 'Bosques montanos y de caliza húmeda, desde Blue and John Crow Mountains hasta el relieve de torres y depresiones de Cockpit Country.',
    vegetacion: 'Bosque siempreverde con helechos, bromelias, orquídeas, palmas y numerosos árboles endémicos; el karst crea microhábitats abruptos.',
    fauna: 'Jutía jamaicana, boa jamaicana, colibrí pico rojo, mariposas y caracoles endémicos; muchas especies tienen rangos mínimos.',
    suelos: 'Terra rossa y suelos orgánicos se acumulan en grietas y depresiones sobre caliza; en pendientes son someros y extremadamente sensibles a remoción y caminos.',
    saberes: [],
    especies: [
      'Guácima azul (Talipariti elatum)',
      'Palma de sierra (Gaussia attenuata)',
      'Bromelias',
      'Orquídeas',
      'Helechos arborescentes',
    ],
    cultivos: ['cafe', 'cacao', 'name', 'platano', 'arbol_pan', 'coco', 'vainilla', 'inga'],
    fuentes: [
      { label: 'UNESCO — Cockpit Country Protected Area', url: 'https://whc.unesco.org/en/tentativelists/6822/' },
      { label: 'Forestry Department Jamaica — State of Jamaica’s Forests 2024', url: 'https://www.forestry.gov.jm/resourcedocs/State_of_Jamaica_s_Forests_Report_2024-1.pdf' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // JM · confianza base_ecologica
  jamaica_bosque_seco: {
    id: 'jamaica_bosque_seco',
    nombre: 'Bosques secos de Jamaica',
    emoji: '🌵',
    color: '#8A7A42',
    resumen: 'Bosques y matorrales estacionales de costas y sotaventos jamaicanos, con alta diversidad local pese a doseles bajos y déficit hídrico.',
    vegetacion: 'Árboles semideciduos, arbustos espinosos, cactáceas y vegetación costera tolerante a sal y viento.',
    fauna: 'Iguana jamaicana, aves terrestres, murciélagos y reptiles endémicos se concentran en remanentes secos aislados.',
    suelos: 'Calizos, someros y de baja retención de agua. La cobertura de hojarasca y el control del fuego son esenciales; la recuperación tras desmonte es lenta.',
    saberes: [],
    especies: [
      'Lignum vitae (Guaiacum officinale)',
      'Cactáceas',
      'Bursera spp.',
      'Acacias nativas',
      'Plumeria spp.',
    ],
    cultivos: ['guandul', 'batata', 'sorgo', 'chile_seco', 'coco', 'sisal', 'moringa'],
    fuentes: [
      { label: 'CEPF — Caribbean Islands Ecosystem Profile', url: 'https://www.cepf.net/sites/default/files/cepf-caribbean-islands-ecosystem-profile-december-2020-english.pdf' },
      { label: 'Forestry Department Jamaica — State of Jamaica’s Forests 2024', url: 'https://www.forestry.gov.jm/resourcedocs/State_of_Jamaica_s_Forests_Report_2024-1.pdf' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // BS, CU, HT, DO, JM, PR, AG, DM, GD, KN, LC, VC, VG, VI, TC · confianza alta
  manglares_antillanos: {
    id: 'manglares_antillanos',
    nombre: 'Manglares de Bahamas y las Antillas',
    emoji: '🐚',
    color: '#26786D',
    resumen: 'Manglares insulares en bahías, lagunas y costas protegidas, conectados con pastos marinos y arrecifes. Son barrera frente a tormentas y vivero de peces e invertebrados.',
    vegetacion: 'Mangle rojo, negro, blanco y botoncillo forman franjas cortas condicionadas por marea, salinidad, agua dulce y sustrato calizo.',
    fauna: 'Peces juveniles, langostas, cangrejos, moluscos, garzas, pelícanos, tortugas y manatíes usan el continuo manglar-pradera-arrecife.',
    suelos: 'Sedimentos saturados y anóxicos almacenan carbono. Rellenos, canales, contaminación o bloqueo de mareas pueden matar el bosque aunque los árboles no se talen.',
    saberes: [],
    especies: [
      'Mangle rojo (Rhizophora mangle)',
      'Mangle negro (Avicennia germinans)',
      'Mangle blanco (Laguncularia racemosa)',
      'Botoncillo (Conocarpus erectus)',
    ],
    fuentes: [
      { label: 'UNESCO — restauración comunitaria en Guanahacabibes', url: 'https://www.unesco.org/en/articles/mangres-project-advances-cuba-community-involvement-guanahacabibes-peninsula-biosphere-reserve' },
      { label: 'CEPF — Caribbean Islands Ecosystem Profile', url: 'https://www.cepf.net/sites/default/files/cepf-caribbean-islands-ecosystem-profile-december-2020-english.pdf' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // BZ, GT, HN, SV, NI, CR, PA, MX · confianza media
  manglares_centroamericanos: {
    id: 'manglares_centroamericanos',
    nombre: 'Manglares de Centroamérica',
    emoji: '🦀',
    color: '#287C6D',
    resumen: 'Bosques intermareales del Caribe y el Pacífico centroamericano, ligados a estuarios, lagunas y deltas. Amortiguan oleaje, almacenan carbono y son criaderos de fauna acuática.',
    vegetacion: 'Mangle rojo en bordes inundados, mangle negro y blanco hacia el interior y botoncillo en sectores más altos; salinidad e hidroperiodo ordenan las franjas.',
    fauna: 'Cangrejos, moluscos, peces juveniles, garzas, cocodrilos y manatíes dependen de raíces, canales y conexión con pastos marinos y arrecifes.',
    suelos: 'Lodos anóxicos ricos en carbono y sales. Abrir drenajes, compactar o cortar el flujo de mareas puede causar acidificación, subsidencia y mortalidad del bosque.',
    saberes: [],
    especies: [
      'Mangle rojo (Rhizophora mangle)',
      'Mangle negro (Avicennia germinans)',
      'Mangle blanco (Laguncularia racemosa)',
      'Botoncillo (Conocarpus erectus)',
    ],
    fuentes: [
      { label: 'UNESCO — MangRes Panamá', url: 'https://www.unesco.org/en/mab/mangres-panama' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // MX · confianza media
  manglares_mexico: {
    id: 'manglares_mexico',
    nombre: 'Manglares del Golfo, Caribe y Pacífico mexicano',
    emoji: '🌊',
    color: '#16736C',
    resumen: 'Bosques intermareales en lagunas, deltas y estuarios que amortiguan oleaje, retienen sedimentos y sostienen criaderos de peces y crustáceos.',
    vegetacion: 'Mangle rojo, negro, blanco y botoncillo, con tulares, popales, dunas y selvas inundables según salinidad e hidroperiodo.',
    fauna: 'Cocodrilos, manatí en el Caribe, aves migratorias, peces juveniles, moluscos y crustáceos.',
    suelos: 'Sedimentos saturados, salinos y pobres en oxígeno, ricos en carbono; relleno, dragado o corte del flujo mareal puede liberar carbono y causar subsidencia.',
    saberes: [],
    especies: [
      'Mangle rojo (Rhizophora mangle)',
      'Mangle negro (Avicennia germinans)',
      'Mangle blanco (Laguncularia racemosa)',
      'Botoncillo (Conocarpus erectus)',
    ],
    fuentes: [
      { label: 'CONABIO — Regiones hidrológicas prioritarias', url: 'https://www.biodiversidad.gob.mx/pais/regiones-hidrologicas-prioritarias-de-mexico' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // AI, AW, BQ, CW, KY, SX, VG, VI · confianza base_ecologica
  matorral_xerico_caribeno: {
    id: 'matorral_xerico_caribeno',
    nombre: 'Matorrales xéricos del Caribe',
    emoji: '🌵',
    color: '#A48655',
    resumen: 'Paisajes áridos de islas bajas y sotaventos —incluidas las islas ABC, Caimán y sectores de las Antillas— dominados por viento, salinidad y lluvias muy variables.',
    vegetacion: 'Cactáceas columnares, agaves, acacias, divi-divi, arbustos espinosos y vegetación halófila; el dosel es bajo y discontinuo.',
    fauna: 'Iguanas, lagartijas, murciélagos, aves terrestres y marinas presentan endemismos insulares y dependen de charcas temporarias y vegetación costera.',
    suelos: 'Calizos o volcánicos, someros, salinos y con poca materia orgánica. La compactación y el ramoneo intenso reducen infiltración; la revegetación debe usar procedencias locales.',
    saberes: [],
    especies: [
      'Divi-divi (Libidibia coriaria)',
      'Cactáceas columnares',
      'Agaves (Agave spp.)',
      'Uva de playa (Coccoloba uvifera)',
      'Acacias nativas',
    ],
    cultivos: ['sisal', 'guandul', 'sorgo', 'batata', 'chile_seco', 'coco', 'moringa', 'nopal'],
    fuentes: [
      { label: 'CEPF — Caribbean Islands Ecosystem Profile', url: 'https://www.cepf.net/sites/default/files/cepf-caribbean-islands-ecosystem-profile-december-2020-english.pdf' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // GT, HN, SV, NI, MX · confianza alta
  montanas_mayas_pino_encino: {
    id: 'montanas_mayas_pino_encino',
    nombre: 'Montañas mayas y bosques de pino-encino',
    emoji: '⛰️',
    color: '#416B3A',
    resumen: 'Bosques montanos de Guatemala, Honduras, El Salvador y Nicaragua, con pinares, encinares, bosque nuboso y mosaicos agrícolas determinados por altitud, exposición y fuego.',
    vegetacion: 'Pinos tropicales, encinos, liquidámbar y alisos; en laderas húmedas aparecen helechos arborescentes, epífitas y lauráceas.',
    fauna: 'Quetzal, pavo de cacho, tapir y felinos usan gradientes altitudinales; anfibios y aves endémicas son especialmente sensibles a pérdida de bosque nuboso.',
    suelos: 'Suelos volcánicos o arcillosos de ladera, con materia orgánica superficial. La cobertura permanente, barreras vivas y manejo de caminos son críticos frente a deslizamientos y erosión.',
    saberes: [],
    especies: [
      'Pino ocote (Pinus oocarpa)',
      'Pino de altura (Pinus pseudostrobus)',
      'Encinos (Quercus spp.)',
      'Liquidámbar (Liquidambar styraciflua)',
      'Aliso (Alnus acuminata)',
    ],
    cultivos: ['cafe', 'maiz_tropical', 'poroto_trepador', 'zapallo_milpa', 'aguacate', 'inga', 'nogal_cafetero', 'vetiver'],
    fuentes: [
      { label: 'CATIE — milpa y agrobiodiversidad K’iche’', url: 'https://repositorio.catie.ac.cr/handle/11554/9716' },
      { label: 'CATIE — conocimientos Maya Mam y K’iche’ en restauración', url: 'https://repositorio.catie.ac.cr/handle/11554/12692' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // US · confianza alta
  noreste_grandes_lagos_bosques: {
    id: 'noreste_grandes_lagos_bosques',
    nombre: 'Bosques del Nordeste y Grandes Lagos',
    emoji: '🍁',
    color: '#4F7444',
    resumen: 'Bosques templados desde Allegheny y Nueva Inglaterra hasta los Grandes Lagos, con arces, hayas, coníferas, humedales y transiciones boreales.',
    vegetacion: 'Arce azucarero, haya, abedules, robles, hemlock, pinos y abetos; pine barrens costeros forman mosaicos abiertos dependientes de fuego.',
    fauna: 'Alce en el norte, venado cola blanca, oso negro, castor, lince canadiense, aves forestales y peces de lagos y ríos.',
    suelos: 'Spodosoles ácidos en materiales glaciares, Alfisoles más fértiles al sur y turberas orgánicas; drenaje y textura varían a escala fina.',
    saberes: [],
    especies: [
      'Arce azucarero (Acer saccharum)',
      'Haya americana (Fagus grandifolia)',
      'Tsuga (Tsuga canadensis)',
      'Manoomin (Zizania palustris)',
    ],
    cultivos: ['arce_azucarero', 'manzano', 'arandano', 'arroz_salvaje', 'avena', 'papa', 'maiz_tropical', 'soja', 'trebol_blanco'],
    fuentes: [
      { label: 'NPS — Indigenous Knowledge, Central', url: 'https://www.nps.gov/subjects/tek/central.htm' },
      { label: 'USDA NAL — Three Sisters', url: 'https://www.nal.usda.gov/collections/stories/three-sisters' },
      { label: 'EPA — Ecoregions of North America', url: 'https://www.epa.gov/eco-research/ecoregions-north-america' },
    ],
  },

  // MX · confianza alta
  oaxaca_sierras_bosques_comunales: {
    id: 'oaxaca_sierras_bosques_comunales',
    nombre: 'Sierras de Oaxaca: pino-encino y bosque mesófilo',
    emoji: '⛰️',
    color: '#35684C',
    resumen: 'Relieve abrupto con pino-encino, bosque mesófilo, barrancas húmedas y mosaicos agrícolas de altísima diversidad biocultural.',
    vegetacion: 'Pinos, encinos, liquidámbar, magnolias, alisos, helechos arborescentes, epífitas y selvas en pisos bajos.',
    fauna: 'Jaguar, puma, tapir en vertientes bajas, venados, aves endémicas, salamandras y gran diversidad de insectos.',
    suelos: 'Cambisoles, Luvisoles y Andosoles de ladera; la niebla sostiene humedad, pero caminos, tala y fuego severo favorecen deslizamientos.',
    saberes: [],
    especies: [
      'Pinos (Pinus spp.)',
      'Encinos (Quercus spp.)',
      'Liquidámbar (Liquidambar styraciflua)',
      'Magnolias (Magnolia spp.)',
    ],
    cultivos: ['maiz_tropical', 'poroto_trepador', 'zapallo_milpa', 'cafe', 'amaranto', 'chile_seco', 'inga', 'agave'],
    fuentes: [
      { label: 'CONAFOR — Pedir permiso al bosque', url: 'https://www.gob.mx/conafor/articulos/pedir-permiso-al-bosque' },
      { label: 'CONAFOR — Pueblos Mancomunados', url: 'https://www.gob.mx/conafor/prensa/pueblos-mancomunados-de-oaxaca-ejemplo-de-aprovechamiento-forestal-sostenible' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // US · confianza base_ecologica
  ozarks_transicion_bosque_pradera: {
    id: 'ozarks_transicion_bosque_pradera',
    nombre: 'Ozarks y transición bosque–pradera del Medio Oeste',
    emoji: '🌳',
    color: '#687342',
    resumen: 'Mesetas y colinas interiores con robledales, pinares, sabanas, dolinas, manantiales y bordes de pradera definidos por sustrato y fuego.',
    vegetacion: 'Robles y nogales, pino shortleaf, cedro rojo, pastos de pradera y comunidades calcáreas en claros.',
    fauna: 'Venado, pavo, oso negro recolonizante, murciélagos cavernícolas, salamandras y peces de manantial.',
    suelos: 'Alfisoles y Ultisoles sobre calizas, dolomías y areniscas; suelos delgados en lomas y arcillas residuales en mesetas, con karst vulnerable a contaminación.',
    saberes: [],
    especies: [
      'Roble blanco (Quercus alba)',
      'Pino shortleaf (Pinus echinata)',
      'Big bluestem (Andropogon gerardii)',
      'Cedro rojo (Juniperus virginiana)',
    ],
    cultivos: ['pecan', 'maiz_tropical', 'soja', 'trigo', 'durazno', 'batata', 'arandano', 'alfalfa'],
    fuentes: [
      { label: 'EPA — Ecoregions of North America', url: 'https://www.epa.gov/eco-research/ecoregions-north-america' },
      { label: 'NRCS — Ecological Site Descriptions', url: 'https://www.nrcs.usda.gov/getting-assistance/technical-assistance/ecological-sciences/ecological-site-descriptions' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // US · confianza alta
  pacifico_noroeste_bosques_coniferas: {
    id: 'pacifico_noroeste_bosques_coniferas',
    nombre: 'Bosques de coníferas del Pacífico Noroeste',
    emoji: '🌲',
    color: '#235E48',
    resumen: 'Bosques lluviosos costeros, Puget Lowland y Cascadas con enormes coníferas, ríos salmoneros y gradientes desde selva templada hasta bosque seco oriental.',
    vegetacion: 'Abeto Douglas, western hemlock, cedro rojo, Sitka spruce, pino ponderosa al este, huckleberries y sotobosque de helechos.',
    fauna: 'Salmón y steelhead, oso negro, wapití Roosevelt, búho moteado, castor y anfibios forestales.',
    suelos: 'Andisoles volcánicos y Spodosoles húmedos, con gran acumulación orgánica; caminos y tala cerca de cauces elevan sedimento y temperatura del agua.',
    saberes: [],
    especies: [
      'Abeto Douglas (Pseudotsuga menziesii)',
      'Cedro rojo occidental (Thuja plicata)',
      'Huckleberry (Vaccinium membranaceum)',
      'Salmón Chinook (Oncorhynchus tshawytscha)',
    ],
    cultivos: ['avellano', 'arandano', 'manzano', 'cerezo', 'papa', 'lupulo', 'raigras', 'trebol_blanco'],
    fuentes: [
      { label: 'USFS — Warm Springs fire knowledge', url: 'https://research.fs.usda.gov/treesearch/59061' },
      { label: 'NOAA — Puget Sound Tribal co-management', url: 'https://www.fisheries.noaa.gov/west-coast/sustainable-fisheries/puget-sound-salmon-and-steelhead-fisheries' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // MX · confianza media
  pacifico_sur_chiapas_bosque_seco: {
    id: 'pacifico_sur_chiapas_bosque_seco',
    nombre: 'Bosques secos del Pacífico sur y Depresión de Chiapas',
    emoji: '🍂',
    color: '#A16F3C',
    resumen: 'Planicies, laderas y valles cálidos desde Guerrero y Oaxaca hasta Chiapas, con selva caducifolia y transición a sabanas y bosques montanos.',
    vegetacion: 'Copales, cazahuates, parota, pochote, guanacaste, cactáceas y pastos estacionales.',
    fauna: 'Jaguar, ocelote, venado, pecarí, iguanas, chachalacas y murciélagos.',
    suelos: 'Litosoles en laderas y suelos arcillosos o aluviales en valles; quema frecuente y pérdida de cobertura aumentan erosión y temperatura superficial.',
    saberes: [],
    especies: [
      'Parota (Enterolobium cyclocarpum)',
      'Pochote (Ceiba aesculifolia)',
      'Copal (Bursera spp.)',
      'Cazahuate (Ipomoea spp.)',
    ],
    cultivos: ['maiz_tropical', 'chile_seco', 'cana_azucar', 'zapallo_milpa', 'guandul', 'gliricidia', 'vetiver'],
    fuentes: [
      { label: 'CONABIO — La milpa', url: 'https://www.biodiversidad.gob.mx/diversidad/sistemas-productivos/milpa' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // MX · confianza base_ecologica
  revillagigedo_ecosistemas_insulares: {
    id: 'revillagigedo_ecosistemas_insulares',
    nombre: 'Islas Revillagigedo',
    emoji: '🏝️',
    color: '#4E7866',
    resumen: 'Islas volcánicas oceánicas remotas con matorral, bosque seco y alto endemismo, extremadamente sensibles a especies invasoras y perturbación.',
    vegetacion: 'Matorral y bosque bajo adaptado a viento, sal y sequía; la composición difiere entre islas y pisos altitudinales.',
    fauna: 'Aves marinas y terrestres endémicas, reptiles y grandes agregaciones marinas alrededor del archipiélago.',
    suelos: 'Suelos volcánicos jóvenes, someros y expuestos a erosión; recuperación puede ser lenta tras invasiones o pérdida de cobertura.',
    saberes: [],
    especies: [
      'Guayabillo (Psidium socorrense)',
      'Palma de Socorro (Brahea edulis)',
      'Zenzontle de Socorro (Mimus graysoni)',
    ],
    fuentes: [
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
      { label: 'CONABIO — Ecosistemas de México', url: 'https://www.biodiversidad.gob.mx/ecosistemas/ecosismex.html' },
    ],
  },

  // US · confianza base_ecologica
  rocosas_norte_praderas_montanas: {
    id: 'rocosas_norte_praderas_montanas',
    nombre: 'Rocosas del norte y praderas de piedemonte',
    emoji: '🏔️',
    color: '#536B4B',
    resumen: 'Bosques montanos, valles secos, parque de álamos y praderas de piedemonte en un paisaje de nieve, fuego y gradientes altitudinales.',
    vegetacion: 'Pino ponderosa, lodgepole, abeto Douglas, alerce occidental, álamos y pastizales de festucas.',
    fauna: 'Alce, ciervo mulo, wapití, oso grizzly, lobo, glotón y urogallos.',
    suelos: 'Mollisoles en praderas y suelos forestales ácidos o volcánicos en montaña; deshielo controla humedad y erosión.',
    saberes: [],
    especies: [
      'Pino ponderosa (Pinus ponderosa)',
      'Abeto Douglas (Pseudotsuga menziesii)',
      'Álamo temblón (Populus tremuloides)',
      'Festuca de Idaho (Festuca idahoensis)',
    ],
    cultivos: ['cebada', 'trigo', 'avena', 'papa', 'colza', 'alfalfa', 'trebol_blanco'],
    fuentes: [
      { label: 'USDA-NRCS — Indigenous Stewardship Methods', url: 'https://www.nrcs.usda.gov/sites/default/files/2024-10/IndigenousStewardship.pdf' },
      { label: 'EPA — Ecoregions of North America', url: 'https://www.epa.gov/eco-research/ecoregions-north-america' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // US · confianza alta
  rocosas_sur_sky_islands: {
    id: 'rocosas_sur_sky_islands',
    nombre: 'Rocosas del sur y bosques montanos del Suroeste',
    emoji: '🏔️',
    color: '#4C6848',
    resumen: 'Cordilleras desde Arizona y Nuevo México a Colorado y Utah, con islas de pino-encino, coníferas frías, praderas altas y cabeceras nivales.',
    vegetacion: 'Pino ponderosa, pinyon-juniper, abeto Douglas, spruce, aspen, encinos de Arizona y praderas subalpinas.',
    fauna: 'Wapití, venado mulo, oso negro, puma, borrego cimarrón y aves montanas.',
    suelos: 'Molisoles de pradera, Alfisoles forestales y suelos volcánicos; incendios severos pueden causar repelencia al agua y erosión en cuencas.',
    saberes: [],
    especies: [
      'Pino ponderosa (Pinus ponderosa)',
      'Álamo temblón (Populus tremuloides)',
      'Pino piñonero (Pinus edulis)',
      'Blue grama (Bouteloua gracilis)',
    ],
    cultivos: ['maiz_tropical', 'poroto_trepador', 'zapallo_milpa', 'chile_seco', 'manzano', 'durazno', 'pecan', 'alfalfa'],
    fuentes: [
      { label: 'NPS — Ancestral Pueblo Farming', url: 'https://home.nps.gov/band/learn/historyculture/ancestral-pueblo-farming.htm' },
      { label: 'NPS — Indigenous Knowledge, Southwest', url: 'https://home.nps.gov/subjects/tek/southwest.htm' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // BZ, HN, NI · confianza base_ecologica
  sabanas_pino_belice_mosquitia: {
    id: 'sabanas_pino_belice_mosquitia',
    nombre: 'Sabanas y pinares de Belice y la Mosquitia',
    emoji: '🌲',
    color: '#718B45',
    resumen: 'Mosaico tropical de pino caribeño, pastizal, palmares y humedales sobre suelos ácidos, arenosos o encharcables. El fuego y el agua determinan la apertura del paisaje.',
    vegetacion: 'Pino caribeño, palmas, ciperáceas, gramíneas y arbustos resistentes al fuego, con islas de bosque latifoliado y bosques de galería.',
    fauna: 'Venado cola blanca, tapir, felinos, aves de sabana y fauna acuática usan el mosaico; la conectividad con selvas vecinas es esencial.',
    suelos: 'Arenosos, ácidos, pobres en nutrientes y con drenaje muy variable. Las quemas fuera de régimen, el drenaje y el tránsito pesado dañan turbas, raíces y costras superficiales.',
    saberes: [],
    especies: [
      'Pino caribeño (Pinus caribaea)',
      'Palma de guano (Sabal spp.)',
      'Nance (Byrsonima crassifolia)',
      'Ciperáceas (Cyperaceae)',
      'Encinos tropicales (Quercus spp.)',
    ],
    cultivos: ['maiz_tropical', 'yuca', 'arroz', 'caupi', 'coco', 'guandul', 'pasto_elefante', 'gliricidia'],
    fuentes: [
      { label: 'UNESCO — conocimiento Mayangna y biodiversidad', url: 'https://ich.unesco.org/en/project-education/reinforcing-the-transmission-of-mayangna-knowledge-and-culture-in-the-classroom-00493' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // BZ, GT, MX · confianza alta
  selva_maya_peten_yucatan: {
    id: 'selva_maya_peten_yucatan',
    nombre: 'Selva Maya de Petén y Yucatán',
    emoji: '🌳',
    color: '#1F6B45',
    resumen: 'Bosque tropical de tierras bajas sobre calizas que conecta el norte de Guatemala, Belice y la península de Yucatán. Alterna selva alta o mediana, bajos estacionalmente inundables y claros en distintas fases de sucesión.',
    vegetacion: 'Ramón, chicozapote, caoba, cedro, ceibas, palmas y lianas; la altura y caducidad cambian con la profundidad del suelo y la duración de la sequía.',
    fauna: 'Jaguar, tapir centroamericano, pecarí de labios blancos, mono aullador y pavo ocelado requieren grandes corredores forestales y aguadas conservadas.',
    suelos: 'Suelos calizos someros y pedregosos alternan con arcillas en depresiones. El mantillo y la cobertura sostienen la fertilidad; removerlos acelera escorrentía, erosión y pérdida de humedad.',
    saberes: [],
    especies: [
      'Ramón (Brosimum alicastrum)',
      'Chicozapote (Manilkara zapota)',
      'Caoba (Swietenia macrophylla)',
      'Ceiba (Ceiba pentandra)',
      'Cacao (Theobroma cacao)',
    ],
    cultivos: ['maiz_tropical', 'poroto_trepador', 'zapallo_milpa', 'chile_seco', 'yuca', 'cacao', 'inga', 'vetiver'],
    fuentes: [
      { label: 'FAO — Ich Kool, milpa maya', url: 'https://www.fao.org/giahs/giahs-around-the-world/mexico-ich-kool-mayan-milpa-system/en' },
      { label: 'UNESCO — Reserva de Biosfera Maya', url: 'https://www.unesco.org/es/articles/reserva-de-biosfera-maya-un-referente-latinoamericano-un-ejemplo-al-mundo' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // MX · confianza alta
  selva_maya_yucatan: {
    id: 'selva_maya_yucatan',
    nombre: 'Selva Maya y península de Yucatán',
    emoji: '🌳',
    color: '#1E6B45',
    resumen: 'Planicie kárstica con selvas húmedas y secas, bajos inundables, cenotes y acahuales que conectan México con Guatemala y Belice.',
    vegetacion: 'Ramón, chicozapote, caoba, ceiba, zapotes, palmas y lianas; altura y caducidad responden a lluvia, roca y profundidad de suelo.',
    fauna: 'Jaguar, tapir, pecarí de labios blancos, mono aullador, pavo ocelado y gran diversidad de murciélagos.',
    suelos: 'Leptosoles calizos someros alternan con arcillas de bajos; la fertilidad se concentra en mantillo y biomasa, y el agua subterránea es vulnerable a contaminación.',
    saberes: [],
    especies: [
      'Ramón (Brosimum alicastrum)',
      'Chicozapote (Manilkara zapota)',
      'Caoba (Swietenia macrophylla)',
      'Ceiba (Ceiba pentandra)',
    ],
    cultivos: ['maiz_tropical', 'poroto_trepador', 'zapallo_milpa', 'chile_seco', 'yuca', 'platano', 'inga', 'vetiver'],
    fuentes: [
      { label: 'FAO — Ich Kool, milpa maya', url: 'https://www.fao.org/giahs/giahs-around-the-world/mexico-ich-kool-mayan-milpa-system/en' },
      { label: 'CONABIO — La milpa', url: 'https://www.biodiversidad.gob.mx/diversidad/sistemas-productivos/milpa' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // MX, US · confianza media
  sierras_madre_pino_encino: {
    id: 'sierras_madre_pino_encino',
    nombre: 'Bosques de pino-encino de las Sierras Madre',
    emoji: '🌲',
    color: '#3F6C45',
    resumen: 'Cordilleras Occidental y Oriental con gradientes de pino, encino, bosque mixto y pequeñas islas húmedas sobre cuencas áridas.',
    vegetacion: 'Pinos, encinos, madroños, enebros y pastizales montanos; composición cambia con altitud, orientación y régimen de fuego.',
    fauna: 'Oso negro, puma, venado cola blanca, guacamaya verde y aves montanas; barrancas conectan ambientes templados y tropicales.',
    suelos: 'Suelos forestales someros sobre roca volcánica o caliza; mantillo y raíces estabilizan pendientes, mientras caminos mal trazados concentran erosión.',
    saberes: [],
    especies: [
      'Pino de Chihuahua (Pinus leiophylla)',
      'Pino real (Pinus engelmannii)',
      'Encinos (Quercus spp.)',
      'Madroño (Arbutus spp.)',
    ],
    cultivos: ['maiz_tropical', 'poroto_trepador', 'amaranto', 'durazno', 'manzano', 'aguacate', 'cafe', 'chile_seco'],
    fuentes: [
      { label: 'CONAFOR — Silvicultura comunitaria', url: 'https://www.gob.mx/conafor/documentos/silvicultura-comunitaria-27813' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // MX · confianza media
  sonora_sinaloa_bosque_seco_desierto: {
    id: 'sonora_sinaloa_bosque_seco_desierto',
    nombre: 'Desierto Sonorense y transición seca de Sonora–Sinaloa',
    emoji: '🌵',
    color: '#C28E3F',
    resumen: 'Gradiente desde desierto cálido de lluvias bimodales hasta bosque seco subtropical del piedemonte y planicies sinaloenses.',
    vegetacion: 'Saguaro y sahuaro, palo verde, palo fierro, mezquite, ocotillo y cactáceas; hacia el sur aumentan árboles caducifolios y lianas.',
    fauna: 'Berrendo sonorense, venado bura, pecarí, monstruo de Gila, tortuga del desierto, murciélagos nectarívoros y aves del matorral.',
    suelos: 'Aridisoles calcáreos, gravas y abanicos con pulsos breves de infiltración; desmontes y tránsito rompen costras y aceleran erosión.',
    saberes: [],
    especies: [
      'Saguaro (Carnegiea gigantea)',
      'Palo fierro (Olneya tesota)',
      'Mezquite (Prosopis spp.)',
      'Palo verde (Parkinsonia spp.)',
    ],
    cultivos: ['sorgo', 'chile_seco', 'cebolla', 'naranjo', 'datilera', 'nopal', 'agave', 'mezquite'],
    fuentes: [
      { label: 'CONABIO — Ecosistemas de México', url: 'https://www.biodiversidad.gob.mx/ecosistemas/ecosismex.html' },
      { label: 'EPA — Ecoregions of North America', url: 'https://www.epa.gov/eco-research/ecoregions-north-america' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // US · confianza media
  sudeste_sabanas_pino_largo: {
    id: 'sudeste_sabanas_pino_largo',
    nombre: 'Sabanas y pinares abiertos del Sudeste',
    emoji: '🔥',
    color: '#7A8B47',
    resumen: 'Planicies costeras y piedemontes con pino de hoja larga, sabanas húmedas, claros y bosques mixtos históricamente mantenidos por fuego frecuente de baja severidad.',
    vegetacion: 'Pino longleaf, wiregrass, palmettos, robles y una flora herbácea muy rica; pequeños cambios de relieve controlan humedad.',
    fauna: 'Tortuga gopher, pájaro carpintero de cresta roja, codorniz bobwhite, venado y anfibios de humedales temporarios.',
    suelos: 'Ultisoles muy meteorizados y arenosos, con bajos húmedos; exclusión de fuego cierra el dosel, pero quemar sin contexto también puede degradar.',
    saberes: [],
    especies: [
      'Pino longleaf (Pinus palustris)',
      'Wiregrass (Aristida stricta)',
      'Saw palmetto (Serenoa repens)',
      'Rivercane (Arundinaria spp.)',
    ],
    cultivos: ['pecan', 'batata', 'mani', 'caupi', 'maiz_tropical', 'sorgo', 'durazno', 'arandano'],
    fuentes: [
      { label: 'NRCS — Cultural Burning factsheet index', url: 'https://www.nrcs.usda.gov/resources/guides-and-instructions/prescribed-burning-ac-338-conservation-practice-standard' },
      { label: 'NPS — Rivercane', url: 'https://home.nps.gov/articles/000/rivercane.htm' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // CR, PA · confianza alta
  talamanca_caribe_sur: {
    id: 'talamanca_caribe_sur',
    nombre: 'Talamanca y Caribe sur',
    emoji: '🍫',
    color: '#285C43',
    resumen: 'Gradiente continuo desde tierras bajas caribeñas hasta bosques nubosos, robledales y páramos de la cordillera de Talamanca entre Costa Rica y Panamá.',
    vegetacion: 'Selva húmeda, palmas y bosques ribereños abajo; lauráceas, robles, bambúes, epífitas y vegetación achaparrada en altura.',
    fauna: 'Jaguar, tapir, quetzal, águila harpía y numerosos anfibios aprovechan la continuidad altitudinal y las cuencas bien conservadas.',
    suelos: 'Suelos ácidos y muy húmedos en laderas, con elevada materia orgánica en sectores fríos. La remoción del dosel aumenta erosión, deslizamientos y pérdida de nutrientes.',
    saberes: [],
    especies: [
      'Cacao (Theobroma cacao)',
      'Laurel (Cordia alliodora)',
      'Guaba (Inga spp.)',
      'Robles de altura (Quercus spp.)',
      'Pejibaye (Bactris gasipaes)',
    ],
    cultivos: ['cacao', 'cafe', 'yuca', 'vainilla', 'pupunha', 'platano_sombra', 'inga', 'nogal_cafetero'],
    fuentes: [
      { label: 'CATIE — cacaotales Bribri y Cabécar', url: 'https://repositorio.catie.ac.cr/handle/11554/6038' },
      { label: 'CATIE — plantas útiles en fincas Bribri y Cabécar', url: 'https://repositorio.catie.ac.cr/handle/11554/6675' },
      { label: 'UNESCO — La Amistad', url: 'https://www.unesco.org/en/mab/la-amistad' },
    ],
  },

  // MX · confianza base_ecologica
  tamaulipas_texas_pastizal_mezquital: {
    id: 'tamaulipas_texas_pastizal_mezquital',
    nombre: 'Pastizales costeros y mezquitales de Tamaulipas–Texas',
    emoji: '🌾',
    color: '#8E9B57',
    resumen: 'Llanuras cálidas binacionales del Golfo con pastizales, mezquital, matorral espinoso, lagunas y humedales costeros.',
    vegetacion: 'Mezquite, ébano, acacias, huisache, nopales, gramíneas y vegetación halófila; fuego, sequía, huracanes y pastoreo moldean el mosaico.',
    fauna: 'Ocelote, pecarí, venado cola blanca, aves migratorias, codornices y polinizadores.',
    suelos: 'Vertisoles arcillosos, suelos calizos o salinos y arenas costeras; drenaje deficiente alterna con sequía y agrietamiento.',
    saberes: [],
    especies: [
      'Mezquite (Prosopis glandulosa)',
      'Ébano tejano (Ebenopsis ebano)',
      'Huisache (Vachellia farnesiana)',
      'Zacates nativos (Bouteloua spp.)',
    ],
    cultivos: ['sorgo', 'mijo', 'chile_seco', 'naranjo', 'alfalfa', 'guandul', 'nopal', 'mezquite'],
    fuentes: [
      { label: 'EPA — Ecoregions of North America', url: 'https://www.epa.gov/eco-research/ecoregions-north-america' },
      { label: 'CONABIO — Ecosistemas de México', url: 'https://www.biodiversidad.gob.mx/ecosistemas/ecosismex.html' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // MX · confianza alta
  tehuacan_cuicatlan_matorral: {
    id: 'tehuacan_cuicatlan_matorral',
    nombre: 'Valle de Tehuacán–Cuicatlán',
    emoji: '🌵',
    color: '#91814A',
    resumen: 'Valle semiárido de extraordinario endemismo, con bosques de cactáceas columnares y una secuencia milenaria de domesticación y manejo del agua.',
    vegetacion: 'Tetechos, cardones, biznagas, izotes, agaves, mezquites y selvas secas en gradientes de altitud y sustrato.',
    fauna: 'Murciélagos polinizadores, guacamaya verde, venados, felinos, reptiles y aves asociadas a cactus columnares.',
    suelos: 'Suelos calizos o yesosos, someros y pedregosos, con aluviones en fondos de valle; captar escorrentía sin erosionar exige diseño local.',
    saberes: [],
    especies: [
      'Tetecho (Neobuxbaumia tetetzo)',
      'Agaves (Agave spp.)',
      'Izote (Yucca periculosa)',
      'Mezquite (Prosopis laevigata)',
    ],
    cultivos: ['maiz_tropical', 'amaranto', 'chia', 'chile_seco', 'nopal', 'agave', 'mezquite'],
    fuentes: [
      { label: 'UNESCO — Tehuacán-Cuicatlán', url: 'https://whc.unesco.org/en/list/1534' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // TT · confianza alta
  trinidad_tobago_bosques: {
    id: 'trinidad_tobago_bosques',
    nombre: 'Bosques de Trinidad y Tobago',
    emoji: '🐦',
    color: '#2D684A',
    resumen: 'Bosques húmedos y secos de islas próximas a Sudamérica, con afinidades continentales y un gradiente completo desde crestas lluviosas hasta costas y arrecifes.',
    vegetacion: 'Bosque siempreverde de cresta y ladera, palmas y lianas; parches de bosque seco, manglar y vegetación litoral en cotas bajas.',
    fauna: 'Motmot de Trinidad, greenlet de Tobago, guácharos, monos, ocelotes en Trinidad y gran diversidad de anfibios, reptiles y aves.',
    suelos: 'Arcillosos y muy lavados en zonas húmedas; más someros y secos en laderas de sotavento. La cobertura protege cuencas cortas que reaccionan rápido a lluvias extremas.',
    saberes: [],
    especies: [
      'Mora (Mora excelsa)',
      'Palmas (Arecaceae)',
      'Heliconias',
      'Cacao (Theobroma cacao)',
      'Mangle rojo (Rhizophora mangle)',
    ],
    cultivos: ['cacao', 'cafe', 'coco', 'name', 'platano', 'arroz', 'caupi', 'inga'],
    fuentes: [
      { label: 'UNESCO — North-East Tobago Biosphere Reserve', url: 'https://www.unesco.org/en/mab/north-east-tobago' },
      { label: 'CEPF — Caribbean Islands Ecosystem Profile', url: 'https://www.cepf.net/sites/default/files/cepf-caribbean-islands-ecosystem-profile-december-2020-english.pdf' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },

  // MX · confianza media
  veracruz_tabasco_selvas_humedales: {
    id: 'veracruz_tabasco_selvas_humedales',
    nombre: 'Selvas, montañas y humedales de Veracruz–Tabasco',
    emoji: '🌧️',
    color: '#276F58',
    resumen: 'Gradiente del Golfo desde selvas húmedas y bosques montanos hasta selva seca, dunas, ríos y Pantanos de Centla.',
    vegetacion: 'Ceiba, ramón, caoba, chicozapote, palmas, mangles interiores, popales y tulares; en montaña aparecen liquidámbar, encinos y epífitas.',
    fauna: 'Jaguar, tapir, manatí, mono aullador, cocodrilos, peces migratorios y grandes concentraciones de aves acuáticas.',
    suelos: 'Aluviales e hidromorfos en planicies, volcánicos en Los Tuxtlas y ácidos en montaña; drenaje y relleno alteran inundación y oxidación de materia orgánica.',
    saberes: [],
    especies: [
      'Ceiba (Ceiba pentandra)',
      'Ramón (Brosimum alicastrum)',
      'Tule (Typha domingensis)',
      'Mangle rojo (Rhizophora mangle)',
    ],
    cultivos: ['cafe', 'cacao', 'vainilla', 'cana_azucar', 'yuca', 'platano_sombra', 'inga', 'nogal_cafetero', 'pasto_elefante'],
    fuentes: [
      { label: 'CONABIO — Regiones hidrológicas prioritarias', url: 'https://www.biodiversidad.gob.mx/pais/regiones-hidrologicas-prioritarias-de-mexico' },
      { label: 'CONABIO — Ecosistemas de México', url: 'https://www.biodiversidad.gob.mx/ecosistemas/ecosismex.html' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
    ],
  },
};
