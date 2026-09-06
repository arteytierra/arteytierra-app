/**
 * Fichas regionales de Medio Oriente.
 *
 * ESCRITO A MANO. La lista de qué escribir salió de enumerar contra RESOLVE
 * (ver el encabezado de `ecorregionesMedioOriente.ts`, que además deja escrito
 * el alcance y qué quedó afuera). Son 28 fichas para 31 ECO_ID.
 *
 * El agrupamiento sigue cómo se comportan el suelo y el agua, no el número de
 * ECO_ID: la montaña aterrazada del Yemen va junto con el escarpe que la
 * sostiene, el falaj del Hajar une el piedemonte con la montaña que lo
 * alimenta, y el Kopet Dag es una sola unidad aunque RESOLVE la parta en
 * bosque y semidesierto.
 *
 * Es la región donde nació la agricultura de secano y donde se inventaron casi
 * todas las técnicas de agua que la app usa como referencia —qanat, falaj,
 * riego por avenidas, terraza de piedra seca—, así que las fichas se detienen
 * más de lo habitual en cómo se maneja el agua.
 *
 * `saberes` va vacío en todas, igual que en el resto del catálogo. Que un
 * predio caiga dentro de una ecorregión no autoriza a atribuirle las prácticas
 * de los Ma'dan de las marismas ni de los awamir del Hajar: sin geometría con
 * procedencia, licencia y acuerdo, `lib/saberes.ts` no activa nada.
 */

import type { BiomaFicha } from './biomaTipos';

/** Cartografías y referencias que se repiten en casi todas las fichas. */
const RESOLVE = { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' };
const WRB = { label: 'WRB — Base Referencial Mundial del Recurso Suelo (FAO)', url: 'https://www.fao.org/soils-portal/data-hub/soil-classification/world-reference-base/es/' };
const SOILGRIDS = { label: 'ISRIC — SoilGrids', url: 'https://soilgrids.org/' };
const HWSD = { label: 'FAO — Harmonized World Soil Database v2.0', url: 'https://www.fao.org/soils-portal/data-hub/soil-maps-and-databases/harmonized-world-soil-database-v20/en/' };
const ICARDA = { label: 'ICARDA — Investigación agrícola en zonas secas', url: 'https://www.icarda.org/' };
const GIAHS = { label: 'FAO — SIPAM, Sistemas Importantes del Patrimonio Agrícola Mundial', url: 'https://www.fao.org/giahs/es/' };
const AFLAJ = { label: 'UNESCO — Sistemas de riego aflaj de Omán', url: 'https://whc.unesco.org/es/list/1207/' };
const HIRCANIA = { label: 'UNESCO — Bosques hircanos', url: 'https://whc.unesco.org/es/list/1584/' };

export const BIOMAS_REGIONALES_MEDIO_ORIENTE: Record<string, BiomaFicha> = {
  // SY JO IQ · ECO_ID 739 · la badia, estepa de pastoreo milenaria
  estepa_siria_badia: {
    id: 'estepa_siria_badia',
    nombre: 'Estepa siria (badia)',
    emoji: '🐑',
    color: '#A2955F',
    resumen: 'La badia: la franja de estepa entre el secano de trigo y el desierto pleno, de 100 a 250 mm de lluvia invernal, que cubre media Siria, el este de Jordania y el oeste de Irak. Es tierra de pastoreo desde hace milenios, no de cultivo, y casi todo lo que salió mal acá salió mal por confundir las dos cosas.',
    vegetacion: 'Matorral bajo de Artemisia herba-alba y Salsola, con pastizal efímero que verdea semanas después de las lluvias y desaparece. Donde el pastoreo aflojó vuelve rápido; donde se aró, no vuelve.',
    fauna: 'Gacela de Dorcas y órix reducidos a reintroducciones, liebre del Cabo, jerbo, alondra, avutarda hubara; el gran movimiento estacional de rebaños ovinos awassi sigue siendo el hecho ecológico dominante.',
    suelos: 'Calcisoles y Gypsisoles someros sobre caliza y marga, con costra caliza a poca profundidad y horizontes de yeso. Materia orgánica bajísima, estructura frágil y una costra biológica superficial que es lo que impide que el viento se lleve el resto. Ararla para sembrar cebada de secano —lo que se hizo masivamente desde los años sesenta con tractor y pozo— rompe esa costra y convierte estepa en fuente de polvo. La recuperación pasa por la figura del hima, la reserva de pastoreo diferido, más que por plantar.',
    saberes: [],
    especies: [
      'Ajenjo de estepa (Artemisia herba-alba)',
      'Salsola (Salsola vermiculata)',
      'Atriplex (Atriplex leucoclada)',
      'Pistacho de estepa (Pistacia atlantica)',
      'Retama blanca (Retama raetam)',
    ],
    cultivos: ['cebada', 'trigo', 'lenteja', 'garbanzo', 'olivo', 'pistacho', 'alfalfa'],
    fuentes: [ICARDA, HWSD, RESOLVE],
  },

  // IQ SY · ECO_ID 830 · la Yazira, cuna del secano
  mesopotamia_jazira: {
    id: 'mesopotamia_jazira',
    nombre: 'Llanura mesopotámica (Yazira)',
    emoji: '🌾',
    color: '#9C8F52',
    resumen: 'La llanura entre el Tigris y el Éufrates y la Yazira que la corona al norte. Acá se domesticaron el trigo y la cebada, y acá se inventó el riego por gravedad a gran escala hace cinco mil años. También acá se documentó por primera vez, en tablillas sumerias, que un suelo regado sin drenaje se saliniza.',
    vegetacion: 'Estepa de gramíneas y matorral bajo en el secano del norte; en la llanura regada, monocultivo de trigo, cebada, arroz y dátil, con tamarisco y álamo sobre los canales.',
    fauna: 'Jabalí, chacal dorado, zorro rojo, francolín negro, garza y limícolas sobre los arrozales; la fauna de gran porte de las riberas prácticamente desapareció.',
    suelos: 'Calcisoles y Fluvisoles calcáreos profundos sobre aluviones, con Solonchaks extendidos donde el riego subió la freática. El problema central no es la fertilidad —el limo del Tigris es bueno— sino el balance de sales: el agua de riego trae sal disuelta, la evaporación la concentra y sin drenaje subsuperficial la freática salada sube hasta la zona de raíces. La solución es de ingeniería y de acuerdo social a la vez: drenaje colector, láminas de lavado y turnos, y ninguna de las tres funciona parcela por parcela.',
    saberes: [],
    especies: [
      'Palmera datilera (Phoenix dactylifera)',
      'Tamarisco (Tamarix aphylla)',
      'Álamo del Éufrates (Populus euphratica)',
      'Regaliz (Glycyrrhiza glabra)',
      'Cebada silvestre (Hordeum spontaneum)',
    ],
    cultivos: ['trigo', 'cebada', 'algodon', 'lenteja', 'garbanzo', 'sesamo', 'datilera', 'alfalfa'],
    aptitud: [
      { uso: 'huerta', delta: -5, razon: 'El limo del Tigris es bueno; lo que limita es la sal. Sin drenaje colector y lámina de lavado la freática salada sube a la zona de raíces, y eso no se resuelve parcela por parcela.' },
    ],
    fuentes: [ICARDA, HWSD, WRB, RESOLVE],
  },

  // IQ IR · ECO_ID 747 · las marismas del sur
  mesopotamia_marismas: {
    id: 'mesopotamia_marismas',
    nombre: 'Marismas del Tigris y el Éufrates (Ahwar)',
    emoji: '🛶',
    color: '#5C7A5E',
    resumen: 'Los Ahwar del sur de Irak, el humedal más grande de Asia occidental: donde los dos ríos se desparraman antes del Shatt al-Arab. Fueron desecados deliberadamente en los años noventa hasta quedar en una fracción de su superficie, y reinundados parcialmente desde 2003.',
    vegetacion: 'Cañaveral denso de Phragmites australis y Typha, con praderas sumergidas y matorral de tamarisco en las orillas altas. La caña es material de construcción, forraje y sustrato productivo, no maleza.',
    fauna: 'Búfalo de agua doméstico como especie clave del sistema, nutria de Maxwell y aves endémicas como el papamoscas de Basora y la cerceta pardilla; escala mayor de invernada para aves del Paleártico occidental.',
    suelos: 'Gleysoles e Histosoles turbosos bajo agua permanente, con Solonchaks fuertes en las áreas que se secaron. La desecación oxidó la turba y dejó costras salinas duras que no se recuperan sólo con volver a inundar: el agua vuelve, pero el suelo quedó otro. El limitante actual es de caudal y calidad, no de tierra: las represas aguas arriba en Turquía, Siria e Irán bajaron el aporte y subieron la salinidad, y la cuña salina del Golfo avanza.',
    saberes: [],
    especies: [
      'Caña común (Phragmites australis)',
      'Enea (Typha domingensis)',
      'Tamarisco (Tamarix ramosissima)',
      'Junco (Schoenoplectus litoralis)',
      'Sauce del Éufrates (Salix acmophylla)',
    ],
    cultivos: ['arroz', 'datilera', 'trigo', 'cebada', 'berseem', 'alfalfa'],
    aptitud: [
      { uso: 'reserva', delta: 25, razon: 'Lo que queda de marisma quedó después de una desecación deliberada. El limitante hoy es caudal y salinidad aguas arriba: lo que se recupera se recupera con agua, no con obra en la parcela.' },
      { uso: 'huerta', delta: -20, razon: 'Donde se secó, la turba se oxidó y dejó costra salina dura. Volver a inundar trae el agua, pero el suelo ya quedó otro.' },
    ],
    fuentes: [WRB, HWSD, RESOLVE],
  },

  // SA IQ JO · ECO_ID 831 · el desierto del norte y el acuífero fósil
  desierto_norarabigo: {
    id: 'desierto_norarabigo',
    nombre: 'Desierto norarábigo',
    emoji: '🏜️',
    color: '#B0A06B',
    resumen: 'La mitad norte de la península: llanuras de grava, uadis anchos y el borde del Nefud, entre Jordania, Irak, Kuwait y el norte de Arabia Saudita. Menos de 100 mm anuales, con lluvia invernal errática que llena los uadis y después nada.',
    vegetacion: 'Matorral disperso de Haloxylon y Anabasis, con concentración de vida en el lecho de los uadis, donde la escorrentía se acumula: ahí aparecen acacias, gramíneas perennes y el pastoreo real.',
    fauna: 'Órix de Arabia reintroducido, gacela arábiga, zorro de Rüppell, lobo árabe, alondra, y la hubara que sigue siendo la presa emblemática de la cetrería regional.',
    suelos: 'Calcisoles, Gypsisoles y Regosoles de grava sobre pavimento desértico. Casi sin materia orgánica y con costra caliza o gípsica somera, pero de textura suelta y sin salinidad de origen: bajo riego producen bien, y ahí está el problema. La agricultura de pivote sobre acuíferos fósiles del Sáq y del Umm Er Radhuma minó reservas que no se recargan; el descenso piezométrico se mide en decenas de metros. Cualquier diseño acá arranca por preguntar de dónde viene el agua y cuánto queda, no por la tierra.',
    saberes: [],
    especies: [
      'Haloxylon (Haloxylon persicum)',
      'Acacia del desierto (Vachellia gerrardii)',
      'Retama (Retama raetam)',
      'Calligonum (Calligonum comosum)',
      'Panicum turgidum',
    ],
    cultivos: ['datilera', 'cebada', 'cebolla', 'granado', 'berseem', 'alfalfa'],
    fuentes: [ICARDA, HWSD, RESOLVE],
  },

  // SA JO SY · ECO_ID 832 · los harrat basálticos
  harrat_basalto: {
    id: 'harrat_basalto',
    nombre: 'Altiplano basáltico (harrat)',
    emoji: '🌋',
    color: '#7A7364',
    resumen: 'Los harrat: campos de lava cuaternaria que cubren el oeste de la península y el sur de Siria, del Yebel Druso al Harrat Khaybar. Roca negra fracturada, algo más de lluvia que el llano vecino por altura, y un régimen hídrico completamente distinto al del desierto de arena.',
    vegetacion: 'Estepa arbustiva sobre bolsones de suelo entre bloques, con enebro en las cotas altas del Hiyaz y pastizal denso en las depresiones donde se acumula el fino.',
    fauna: 'Cabra montés nubia, hiena rayada, caracal, buitre leonado y una densidad de reptiles alta por el refugio térmico de la roca fracturada.',
    suelos: 'Leptosoles y Vertisoles arcillosos oscuros en las depresiones, derivados de basalto. Muy fértiles en potasio y micronutrientes, pero pedregosos hasta lo impracticable salvo donde el fino se acumuló. La clave hidrológica es que el basalto fracturado infiltra en vez de escurrir: el agua desaparece de la superficie y reaparece en manantiales al pie del campo de lava. Eso explica el patrón histórico de asentamiento —el pueblo abajo, en el manantial; el pastoreo arriba, en la roca— y también que contaminar arriba se pague abajo.',
    saberes: [],
    especies: [
      'Enebro fenicio (Juniperus phoenicea)',
      'Pistacho del Atlas (Pistacia atlantica)',
      'Ajenjo (Artemisia sieberi)',
      'Higuera silvestre (Ficus palmata)',
      'Cebada silvestre (Hordeum spontaneum)',
    ],
    cultivos: ['cebada', 'trigo', 'vid', 'higuera', 'olivo', 'granado', 'alfalfa'],
    fuentes: [HWSD, WRB, RESOLVE],
  },

  // SA OM YE · ECO_ID 809 · el desierto arábigo propiamente dicho
  desierto_arabigo: {
    id: 'desierto_arabigo',
    nombre: 'Desierto arábigo',
    emoji: '🐪',
    color: '#C0AE77',
    resumen: 'La matriz que ocupa el centro de la península: llanuras de grava, mesetas calcáreas y uadis, entre el Nefud al norte y el Rub al-Jali al sur. Es el desierto de trabajo, el que se atraviesa y se pastorea, más que el de arena pura.',
    vegetacion: 'Matorral ralo de Haloxylon, Zygophyllum y Rhanterium, con acacias y Ziziphus concentradas en el uadi. Después de un año lluvioso la llanura se cubre de efímeras durante seis semanas.',
    fauna: 'Órix, gacela de arena, gato de las arenas, zorro de Rüppell, víbora cornuda, y el camello dromedario como el organismo que ordena todo el sistema de uso.',
    suelos: 'Calcisoles y Regosoles de grava, con pavimento desértico superficial que protege el fino de abajo. Romper ese pavimento con vehículos o arado es la degradación más común y la menos visible: debajo hay material erodible que el viento se lleva en una temporada. La agricultura viable es la del uadi —donde la escorrentía de una cuenca grande se concentra en una superficie chica—, no la del interfluvio.',
    saberes: [],
    especies: [
      'Acacia arábiga (Vachellia tortilis)',
      'Azufaifo (Ziziphus spina-christi)',
      'Haloxylon (Haloxylon salicornicum)',
      'Rhanterium epapposum',
      'Calotropis (Calotropis procera)',
    ],
    cultivos: ['datilera', 'cebolla', 'granado', 'moringa', 'berseem', 'alfalfa'],
    fuentes: [HWSD, SOILGRIDS, RESOLVE],
  },

  // SA OM AE YE · ECO_ID 810 · los grandes ergs
  nefud_rub_al_khali: {
    id: 'nefud_rub_al_khali',
    nombre: 'Grandes arenales (Nefud y Rub al-Jali)',
    emoji: '🏜️',
    color: '#CDB77E',
    resumen: 'Los dos mares de arena de la península: el Gran Nefud al norte y el Rub al-Jali al sur, el arenal continuo más grande del mundo. Dunas de cien metros y corredores interdunares donde ocurre todo lo que ocurre.',
    vegetacion: 'Vegetación casi ausente sobre la duna móvil; en el corredor interdunar, matas de Calligonum, Haloxylon y Cyperus conglomeratus que fijan arena y marcan dónde hay algo de humedad retenida.',
    fauna: 'Órix reintroducido en el Uruq Bani Maarid, gacela de arena, zorro fennec, lagarto Uromastyx; densidades bajísimas y movimientos enormes.',
    suelos: 'Arenosoles profundos, prácticamente sin horizonte ni materia orgánica, con infiltración total y cero escorrentía. La paradoja útil es que la arena gruesa conserva humedad en profundidad mejor que el limo: lo poco que llueve baja rápido, se escapa de la evaporación y queda a uno o dos metros. Eso es lo que sostiene las raíces profundas del arbusto perenne y lo que hace que plantar acá dependa de alcanzar esa lámina, no de regar arriba.',
    saberes: [],
    especies: [
      'Calligonum (Calligonum crinitum)',
      'Haloxylon (Haloxylon persicum)',
      'Cyperus conglomeratus',
      'Dipterygium glaucum',
      'Tribulus arabicus',
    ],
    fuentes: [HWSD, SOILGRIDS, RESOLVE],
  },

  // KW BH QA AE SA IR · ECO_ID 811 · la llanura del Golfo y la sabkha
  golfo_llanura_costera: {
    id: 'golfo_llanura_costera',
    nombre: 'Llanura costera del Golfo',
    emoji: '🧂',
    color: '#B5AE86',
    resumen: 'La franja plana entre el mar y el desierto interior, de Kuwait a los Emiratos y la orilla iraní: llanura de marea, sabkha salina y el palmeral histórico que aprovechó la lente de agua dulce flotando sobre la salada.',
    vegetacion: 'Halófitas de Halocnemum y Salicornia sobre la sabkha, matorral de Zygophyllum en la arena, y el oasis costero de dátil con su triple estrato de palmera, frutal y hortaliza.',
    fauna: 'Flamenco, ostrero, charrán y limícolas migratorias en la marisma; jerbo y zorro árabe en el interior; el litoral del Golfo es escala crítica de una de las grandes rutas migratorias de Asia.',
    suelos: 'Solonchaks y Gypsisoles sobre la sabkha, Arenosoles calcáreos tierra adentro, con freática salina a poca profundidad y ascenso capilar permanente. Todo el manejo gira en torno a no dejar que esa freática suba: mantillo grueso, riego frecuente y de lámina chica para lavar sin cargar el perfil, y palmera datilera como especie tolerante que da sombra a lo demás. La lente de agua dulce, que es lo que hizo posible el poblamiento, se contamina con agua salada apenas se bombea de más.',
    saberes: [],
    especies: [
      'Palmera datilera (Phoenix dactylifera)',
      'Halocnemum strobilaceum',
      'Salicornia europaea',
      'Zygophyllum qatarense',
      'Mangle gris (Avicennia marina)',
    ],
    cultivos: ['datilera', 'cebolla', 'granado', 'sesamo', 'moringa', 'berseem', 'alfalfa'],
    fuentes: [WRB, HWSD, RESOLVE],
  },

  // IR AE QA BH OM · ECO_ID 320 · el manglar de hara
  golfo_persico_mangle: {
    id: 'golfo_persico_mangle',
    nombre: 'Manglar del Golfo y el mar Arábigo',
    emoji: '🌿',
    color: '#4E7A63',
    resumen: 'Los manglares de hara del Golfo Pérsico y la costa arábiga, de Qeshm y Bandar Abbás a Abu Dabi y la costa omaní. RESOLVE los agrupa con los del delta del Indo, pero son parches finos y aislados, no un cinturón: cada uno depende de un aporte local de agua dulce o de un canal de marea concreto.',
    vegetacion: 'Casi monoespecífico de Avicennia marina, la única especie que aguanta la salinidad extrema y los 45 °C del verano del Golfo; algo de Rhizophora mucronata en la costa omaní.',
    fauna: 'Alevines de pargo y camarón que usan el manglar como cría —de ahí depende buena parte de la pesca artesanal—, garza, garceta dimorfa, cangrejo violinista y la tortuga verde en las playas vecinas.',
    suelos: 'Fluvisoles y Gleysoles tiónicos: limos y arcillas de marea con sulfuros. Ese es el punto de manejo: mientras están sumergidos son inertes, pero drenarlos o excavarlos oxida los sulfuros y produce un suelo ácido sulfatado con pH por debajo de 3, que libera aluminio y hierro y mata lo que quede aguas abajo. Un relleno costero mal hecho acá no daña sólo el manglar: acidifica el estuario.',
    saberes: [],
    especies: [
      'Mangle gris (Avicennia marina)',
      'Mangle rojo (Rhizophora mucronata)',
      'Arthrocnemum macrostachyum',
      'Halopeplis perfoliata',
      'Suaeda vermiculata',
    ],
    fuentes: [WRB, RESOLVE],
  },

  // OM AE YE · ECO_ID 821 · niebla del este arábigo
  arabia_este_niebla: {
    id: 'arabia_este_niebla',
    nombre: 'Arenales de niebla del este arábigo',
    emoji: '🌫️',
    color: '#A8A882',
    resumen: 'La franja del Wahiba y la costa omaní donde la niebla marina entra tierra adentro casi todas las noches del verano y aporta más humedad que la lluvia anual. Es un desierto que se moja por arriba.',
    vegetacion: 'Prosopis cineraria y acacia sobre los corredores interdunares, con líquenes y matas que capturan la niebla directamente en el follaje. La cara de la duna orientada al mar tiene mucha más cobertura que la opuesta.',
    fauna: 'Gacela árabe, gato de las arenas, camaleón árabe, y una fauna de invertebrados de niebla —tenebriónidos que beben del rocío condensado— que es la base de la cadena.',
    suelos: 'Arenosoles con un horizonte superficial ligeramente cohesivo por el humedecimiento nocturno. La lección de diseño es directa: acá el agua se cosecha del aire, no del suelo, y el árbol que da sombra no compite por lluvia sino que aumenta la captura de niebla debajo suyo. Talar el ghaf no libera agua para el pasto: la quita.',
    saberes: [],
    especies: [
      'Ghaf (Prosopis cineraria)',
      'Acacia arábiga (Vachellia tortilis)',
      'Heliotropium kotschyi',
      'Cyperus conglomeratus',
      'Zygophyllum qatarense',
    ],
    cultivos: ['datilera', 'sesamo', 'moringa', 'alfalfa'],
    fuentes: [HWSD, RESOLVE],
  },

  // SA EG SD YE · ECO_ID 837 · el escarpe del mar Rojo
  mar_rojo_escarpe: {
    id: 'mar_rojo_escarpe',
    nombre: 'Escarpe y llanura del mar Rojo',
    emoji: '⛰️',
    color: '#9A8C6B',
    resumen: 'La banda entre el mar Rojo y la cresta del Hiyaz: llanura costera estrecha, abanicos aluviales y un escarpe abrupto que intercepta lo poco que llueve. Toda la agricultura está en los uadis que bajan del escarpe.',
    vegetacion: 'Acacia y Balanites en el uadi, matorral de Euphorbia y Aloe sobre la ladera rocosa, halófitas en la costa. Densidad muy dependiente del uadi: entre uno y otro no hay casi nada.',
    fauna: 'Babuino hamadríade en el escarpe, cabra montés nubia, hiena rayada, águila perdicera, y la avifauna de paso del corredor del mar Rojo, uno de los cuellos de botella migratorios más importantes del mundo.',
    suelos: 'Leptosoles en la ladera y Fluvisoles gruesos en el abanico, mezcla de grava y arena con buena infiltración y nula retención. El sistema productivo clásico es el riego por avenida: se desvía la crecida del uadi con diques de tierra hacia parcelas con bordos, se la deja infiltrar y se siembra sobre la humedad almacenada. Depende de mantener los diques todos los años y de que aguas arriba no se intercepte la crecida.',
    saberes: [],
    especies: [
      'Acacia arábiga (Vachellia tortilis)',
      'Balanites (Balanites aegyptiaca)',
      'Azufaifo (Ziziphus spina-christi)',
      'Aloe (Aloe vera)',
      'Salvadora persica',
    ],
    cultivos: ['cafe', 'sorgo', 'mijo', 'datilera', 'granado', 'higuera', 'sesamo', 'moringa'],
    fuentes: [HWSD, RESOLVE],
  },

  // EG SA SD ER · ECO_ID 115 · manglares del mar Rojo
  mar_rojo_mangle: {
    id: 'mar_rojo_mangle',
    nombre: 'Manglar del mar Rojo',
    emoji: '🌱',
    color: '#4F7B6C',
    resumen: 'Parches de manglar en las dos orillas del mar Rojo, del Sinaí a Eritrea y de Yanbu a Yibuti. Crecen sin ningún aporte de río, en uno de los mares más salinos del planeta: el sistema más extremo donde el manglar todavía funciona.',
    vegetacion: 'Avicennia marina casi en exclusiva, con Rhizophora mucronata en el extremo sur. Porte bajo —tres a cinco metros— por el estrés salino.',
    fauna: 'Zona de cría de la pesca artesanal costera, garza de arrecife, águila pescadora, dugongo en las praderas vecinas y tortuga carey; el camello pastorea directamente el follaje del mangle en la costa sudanesa y saudí.',
    suelos: 'Fluvisoles salinos y arenas carbonatadas de origen coralino, no limos de río. Retienen poco y aportan poco nutriente: el manglar vive de reciclar su propia hojarasca, así que sacarle biomasa —leña, forraje— descapitaliza el sistema mucho más rápido que en un manglar de delta.',
    saberes: [],
    especies: [
      'Mangle gris (Avicennia marina)',
      'Mangle rojo (Rhizophora mucronata)',
      'Halopeplis perfoliata',
      'Suaeda monoica',
      'Limonium axillare',
    ],
    fuentes: [WRB, RESOLVE],
  },

  // YE SA · ECO_ID 107 · la Tihama
  tihama_costa_arida: {
    id: 'tihama_costa_arida',
    nombre: 'Tihama, llanura costera del mar Rojo',
    emoji: '🌾',
    color: '#B09E6E',
    resumen: 'La llanura aluvial entre la montaña yemení y el mar Rojo, ancha de treinta a sesenta kilómetros. Llueve casi nada, pero recibe toda el agua de la montaña: es la agricultura de crecida más extensa que queda en el mundo.',
    vegetacion: 'Sabana abierta de Acacia y Ziziphus, dunas costeras con Panicum, y el mosaico agrícola de sorgo, mijo, sésamo y algodón sobre las parcelas de avenida.',
    fauna: 'Gacela, zorro, hiena rayada, y una avifauna afrotropical que acá alcanza su límite norte —abejaruco, tejedor, tórtola—, marca de que biogeográficamente esto ya es África.',
    suelos: 'Fluvisoles limosos profundos, depositados capa sobre capa por cada crecida: el suelo se construye con el mismo evento que lo riega. Fértiles mientras el aporte siga; el limitante es la competencia por la crecida. Cuando se construyen presas o se cementan los desvíos aguas arriba, las parcelas de abajo pierden agua y limo a la vez y el suelo deja de renovarse. El reparto tradicional del agua de avenida —de aguas arriba a aguas abajo, por turno y no por volumen— es el que sostiene esa cadena.',
    saberes: [],
    especies: [
      'Sorgo (Sorghum bicolor)',
      'Acacia (Vachellia tortilis)',
      'Azufaifo (Ziziphus spina-christi)',
      'Dobera glabra',
      'Panicum turgidum',
    ],
    cultivos: ['mijo', 'sorgo', 'sesamo', 'algodon', 'datilera', 'sisal', 'moringa'],
    fuentes: [GIAHS, HWSD, RESOLVE],
  },

  // YE SA · ECO_ID 59, 108 · la montaña aterrazada
  yemen_montana_aterrazada: {
    id: 'yemen_montana_aterrazada',
    nombre: 'Montaña aterrazada del Yemen',
    emoji: '🪜',
    color: '#6E8451',
    resumen: 'El altiplano y el escarpe occidental del Yemen, entre 1.500 y 3.600 metros, donde el monzón deja de 400 a 1.000 mm. Es una de las mayores obras agrícolas del mundo: montañas enteras aterrazadas con muro de piedra seca a lo largo de más de dos milenios.',
    vegetacion: 'Restos de bosque de enebro y Olea en las cotas altas, matorral de Euphorbia y Dodonaea en el escarpe, y sobre las terrazas el policultivo de café, qat, sorgo, cebada, legumbre y frutal.',
    fauna: 'Babuino hamadríade, leopardo de Arabia casi extinto, y un endemismo aviar altísimo —serín del Yemen, tordo árabe, camachuelo de Arabia— que hace del altiplano un área de aves endémicas propia.',
    suelos: 'Cambisoles y Leptosoles someros sobre basalto y granito, con perfiles profundos sólo donde el muro los retuvo. Ese es el punto: acá el suelo es una construcción, no un dato del terreno. El muro de piedra seca frena la escorrentía, deja precipitar el sedimento y hace terraza; cuando el muro se cae —por emigración, por conflicto, porque nadie mantiene— la terraza revienta con la primera tormenta fuerte y arrastra la de abajo en cascada. La reparación es mucho más cara que el mantenimiento, y esa asimetría es el problema central del Yemen agrícola.',
    saberes: [],
    especies: [
      'Café arábigo (Coffea arabica)',
      'Enebro africano (Juniperus procera)',
      'Acebuche (Olea europaea subsp. cuspidata)',
      'Sorgo (Sorghum bicolor)',
      'Dodonaea viscosa',
    ],
    cultivos: ['cafe', 'sorgo', 'mijo', 'trigo', 'cebada', 'vid', 'granado', 'durazno'],
    aptitud: [
      { uso: 'huerta', delta: 0, razon: 'Acá el suelo es una construcción, no un dato del terreno: el muro de piedra seca frena la escorrentía y precipita el sedimento. Sobre terraza mantenida la huerta va; la variable no es la aptitud sino el mantenimiento, porque reparar cuesta mucho más que sostener.' },
    ],
    fuentes: [GIAHS, HWSD, WRB, RESOLVE],
  },

  // SA YE · ECO_ID 109 · el Asir seco de altura
  asir_altiplano_seco: {
    id: 'asir_altiplano_seco',
    nombre: 'Altiplano seco del Asir',
    emoji: '🌾',
    color: '#8E9161',
    resumen: 'La cara interior del macizo del Asir y del Hiyaz, a sotavento de la cresta: la altura del bosque de niebla pero con la lluvia cortada, entre 100 y 300 mm. Estepa de altura, no bosque.',
    vegetacion: 'Enebro disperso en las cotas más altas, acacia de montaña en retroceso por sequía, y un pastizal de altura con Artemisia y gramíneas perennes.',
    fauna: 'Cabra montés nubia, babuino, lobo árabe, buitre leonado; el enebral del Asir en retroceso está bien documentado y arrastra consigo la avifauna asociada.',
    suelos: 'Leptosoles y Cambisoles pedregosos sobre roca cristalina, someros y de baja retención pero con materia orgánica algo mayor que el llano por la menor temperatura. La agricultura tradicional es de terraza y de cosecha de escorrentía en cuenca chica; el trigo y la cebada de altura se siembran sobre la humedad de una tormenta concreta. La expansión reciente de pozos profundos para alfalfa cambió la escala del problema: se pasó de administrar la lluvia a vaciar el acuífero.',
    saberes: [],
    especies: [
      'Enebro africano (Juniperus procera)',
      'Acacia de montaña (Vachellia origena)',
      'Ajenjo (Artemisia abyssinica)',
      'Acebuche (Olea europaea subsp. cuspidata)',
      'Cebada (Hordeum vulgare)',
    ],
    cultivos: ['cafe', 'sorgo', 'mijo', 'trigo', 'granado', 'higuera', 'damasco', 'alfalfa'],
    fuentes: [HWSD, RESOLVE],
  },

  // OM YE · ECO_ID 56 · el bosque de niebla del Dofar
  arabia_sur_bosque_niebla: {
    id: 'arabia_sur_bosque_niebla',
    nombre: 'Bosque de niebla del Dofar',
    emoji: '🌫️',
    color: '#5F7F5A',
    resumen: 'El escarpe del Dofar omaní y el este del Yemen: la única parte de la península donde el monzón del suroeste toca tierra. Tres meses de jareef —niebla densa, llovizna y 25 °C— y nueve meses secos. Verde en agosto, ocre en enero.',
    vegetacion: 'Bosque bajo de Anogeissus dhofarica y Boswellia sacra —el árbol del incienso—, con pradera densa bajo la niebla y arbolado de Acacia en el llano. La condensación en la copa aporta más agua al suelo que la llovizna directa.',
    fauna: 'Leopardo de Arabia, la población viable más importante que queda; hiena rayada, caracal, tahr árabe, camaleón; endemismo alto en reptiles e invertebrados.',
    suelos: 'Cambisoles y Leptosoles arcillosos sobre caliza kárstica, con materia orgánica alta bajo el bosque y decreciendo rápido en la pradera pastoreada. Todo el sistema depende de la copa: el árbol peina la niebla y la deriva al suelo, así que la pérdida de arbolado no reduce la lluvia pero sí el agua que llega. La sobrecarga de camellos, que impide el reemplazo de Anogeissus, es la causa documentada del retroceso, y el efecto es hidrológico antes que forestal.',
    saberes: [],
    especies: [
      'Incienso (Boswellia sacra)',
      'Anogeissus dhofarica',
      'Rosa del desierto (Adenium obesum)',
      'Ficus vasta',
      'Euphorbia balsamifera',
    ],
    cultivos: ['coco', 'platano', 'cafe', 'sorgo', 'sesamo', 'moringa'],
    fuentes: [HWSD, WRB, RESOLVE],
  },

  // YE OM · ECO_ID 840 · la meseta del Hadramaut
  hadramaut_meseta: {
    id: 'hadramaut_meseta',
    nombre: 'Meseta y uadis del Hadramaut',
    emoji: '🏜️',
    color: '#AC9C6C',
    resumen: 'La meseta calcárea del sur de la península, cortada por uadis profundos —el Hadramaut, el Masila— que son el único lugar habitable y cultivable en cientos de kilómetros. Arriba, nada; abajo, palmerales y ciudades de barro.',
    vegetacion: 'Meseta desnuda con matorral ralo; en el fondo del uadi, palmeral de dátil, sorgo, alfalfa y arbolado de Ziziphus y Tamarix.',
    fauna: 'Gacela árabe, zorro de Blanford, hiena rayada, y una avifauna concentrada en el uadi que contrasta con la meseta vacía.',
    suelos: 'Leptosoles calcáreos en la meseta y Fluvisoles profundos en el uadi, construidos por crecidas sucesivas. Fertilidad buena en el fondo y salinización creciente donde el riego pasó de la avenida al pozo. El sistema histórico combina desvío de crecida y pozo somero de tracción animal; la bomba diésel rompió el equilibrio porque permite regar todo el año sin la lámina de lavado que traía la crecida.',
    saberes: [],
    especies: [
      'Palmera datilera (Phoenix dactylifera)',
      'Azufaifo (Ziziphus spina-christi)',
      'Tamarisco (Tamarix aphylla)',
      'Sorgo (Sorghum bicolor)',
      'Acacia (Vachellia tortilis)',
    ],
    cultivos: ['datilera', 'sorgo', 'mijo', 'sesamo', 'moringa', 'alfalfa'],
    fuentes: [HWSD, RESOLVE],
  },

  // YE · ECO_ID 105 · Socotra
  socotra: {
    id: 'socotra',
    nombre: 'Socotra',
    emoji: '🩸',
    color: '#8A7E5E',
    resumen: 'La isla yemení del mar Arábigo, aislada del continente desde hace millones de años: más de un tercio de sus plantas no existen en ningún otro lado. Clima árido con monzón de niebla en las montañas del Haghier.',
    vegetacion: 'Bosque de sangre de dragón (Dracaena cinnabari) en la meseta alta, matorral de Croton y Jatropha en el llano, y el árbol del pepino (Dendrosicyos socotranus), el único árbol de la familia de las cucurbitáceas.',
    fauna: 'Endemismo casi total en reptiles e invertebrados terrestres, sin mamíferos nativos salvo murciélagos; buitre egipcio abundante, estornino y camachuelo endémicos.',
    suelos: 'Leptosoles y Regosoles someros sobre granito y caliza, muy erosionables una vez perdida la cubierta. El sistema tradicional de pastoreo rotativo con cierres estacionales es lo que mantuvo el equilibrio; el reemplazo por pastoreo continuo de cabras está bloqueando la regeneración del dragón, cuyas poblaciones son hoy casi todas de individuos viejos. Es un caso donde el problema no es el suelo sino la ausencia de una cohorte joven.',
    saberes: [],
    especies: [
      'Sangre de dragón (Dracaena cinnabari)',
      'Árbol pepino (Dendrosicyos socotranus)',
      'Rosa del desierto de Socotra (Adenium obesum subsp. socotranum)',
      'Boswellia elongata',
      'Croton socotranus',
    ],
    cultivos: ['datilera', 'sorgo', 'mijo', 'moringa'],
    aptitud: [
      { uso: 'reserva', delta: 25, razon: 'Endemismo extremo y una sola cohorte vieja de dragos: el problema no es el suelo, es que no hay regeneración.' },
      { uso: 'pasturas', delta: -20, razon: 'El pastoreo continuo de cabras reemplazó al rotativo con cierres estacionales, y es justamente lo que bloquea esa regeneración.' },
    ],
    fuentes: [WRB, RESOLVE],
  },

  // OM AE · ECO_ID 722, 723 · el Hajar y sus aflaj
  hajar_falaj: {
    id: 'hajar_falaj',
    nombre: 'Montañas del Hajar y sus aflaj',
    emoji: '💧',
    color: '#7B8264',
    resumen: 'La cordillera del Hajar, entre Omán y los Emiratos, con el Yebel Ajdar por encima de los 3.000 metros. Roca ofiolítica —corteza oceánica levantada— y un sistema de riego por galería, el falaj, que lleva más de dos mil años en funcionamiento.',
    vegetacion: 'Enebro y acebuche en las cotas altas, acacia y Ziziphus en el piedemonte, y el oasis en terrazas con dátil, granada, nogal, damasco y la rosa del Yebel Ajdar bajo la sombra de la palmera.',
    fauna: 'Tahr árabe endémico del Hajar, leopardo de Arabia probablemente extinto acá, caracal, cabra montés, buitre egipcio; los pozos y charcas del uadi concentran toda la fauna en verano.',
    suelos: 'Leptosoles sobre ofiolita y Fluvisoles gruesos en el uadi, con presencia de serpentina en parte del macizo —relación calcio-magnesio invertida y níquel alto—, así que no todo suelo del Hajar sirve para lo mismo. La terraza de oasis es suelo construido: material acarreado, retenido por muro y mantenido con la materia orgánica del propio palmeral. El falaj conduce por gravedad desde la madre —una galería excavada hasta el acuífero del uadi— y se reparte por tiempo, no por caudal; sobrebombear con pozo aguas arriba baja el nivel y seca el falaj de aguas abajo sin que nadie haya tocado su canal.',
    saberes: [],
    especies: [
      'Palmera datilera (Phoenix dactylifera)',
      'Enebro (Juniperus excelsa subsp. polycarpos)',
      'Acebuche (Olea europaea subsp. cuspidata)',
      'Granado (Punica granatum)',
      'Azufaifo (Ziziphus spina-christi)',
    ],
    cultivos: ['datilera', 'granado', 'damasco', 'nogal', 'higuera', 'trigo', 'cebada', 'alfalfa'],
    aptitud: [
      { uso: 'frutales', delta: 10, razon: 'La terraza de oasis bajo palmeral es el sistema: suelo acarreado, sombra de datilera y riego por turno de falaj. Es frutal en tres estratos, no cuadro abierto.' },
      { uso: 'huerta', delta: -10, razon: 'Fuera del alcance del falaj no hay agua, y sobre serpentina la relación calcio-magnesio invertida y el níquel alto descartan parte del macizo.' },
    ],
    fuentes: [AFLAJ, GIAHS, HWSD, RESOLVE],
  },

  // IR · ECO_ID 841 · el sur nubo-síndico
  iran_sur_nubo_sindico: {
    id: 'iran_sur_nubo_sindico',
    nombre: 'Sur de Irán nubo-síndico',
    emoji: '🌴',
    color: '#B3A171',
    resumen: 'La franja entre el Zagros y el Golfo, de Juzestán a Baluchistán: calor extremo, humedad alta en la costa y una vegetación que ya no es paleártica sino tropical seca, emparentada con el Sahel y el Sind.',
    vegetacion: 'Sabana abierta de Prosopis cineraria y Vachellia, palmeral de dátil en los oasis y uadis, y matorral de Salvadora y Calotropis en las llanuras salinas.',
    fauna: 'Gacela india, onagro persa en el interior, hiena rayada, caracal, y la avifauna del Golfo en el litoral.',
    suelos: 'Calcisoles y Solonchaks sobre aluviones, con salinidad de origen alta en Juzestán por evaporitas y freática somera. Es la zona datilera histórica de Irán, y el manejo es de sales: lámina de lavado, drenaje y elección varietal, más que fertilización. La expansión de la caña de azúcar regada en Juzestán volcó drenajes salinos al Karún y agravó el problema aguas abajo, hasta el Shatt al-Arab.',
    saberes: [],
    especies: [
      'Palmera datilera (Phoenix dactylifera)',
      'Ghaf (Prosopis cineraria)',
      'Salvadora persica',
      'Acacia (Vachellia tortilis)',
      'Tamarisco (Tamarix aphylla)',
    ],
    cultivos: ['datilera', 'sesamo', 'sorgo', 'algodon', 'granado', 'cebolla', 'moringa'],
    fuentes: [HWSD, WRB, RESOLVE],
  },

  // IR · ECO_ID 820 · las cuencas endorreicas del Kavir
  kavir_cuencas_endorreicas: {
    id: 'kavir_cuencas_endorreicas',
    nombre: 'Cuencas endorreicas de Irán central',
    emoji: '🧂',
    color: '#B8AC80',
    resumen: 'El corazón de la meseta iraní: el Dasht-e Kavir y el Dasht-e Lut, cuencas cerradas rodeadas de montaña donde el agua entra y no sale. Es la región donde se inventó el qanat, y donde la civilización urbana dependió de él durante tres mil años.',
    vegetacion: 'Costra salina desnuda en el centro de la cuenca, halófitas de Halocnemum y Seidlitzia en el borde, y matorral de Artemisia y Zygophyllum en el abanico aluvial, que es donde está toda la agricultura.',
    fauna: 'Onagro persa, guepardo asiático —reducido a unas pocas decenas de individuos, todos acá—, gacela bocinegra, gato de las arenas, zorro de Blanford.',
    suelos: 'Solonchaks y Gypsisoles en el fondo de cuenca, Calcisoles de abanico en el borde. La regla del paisaje es simple y ordena todo: el abanico aluvial en la salida de la montaña tiene material grueso, buen drenaje y agua subterránea dulce; el fondo de cuenca tiene fino, sal y freática salada. El qanat existe justamente para llevar el agua del abanico a la superficie por gravedad sin bombear y sin subir la freática. La perforación masiva de pozos profundos desde los años sesenta secó miles de qanats y produjo hundimientos del terreno de decenas de centímetros por año en Teherán y Kermán.',
    saberes: [],
    especies: [
      'Haloxylon (Haloxylon ammodendron)',
      'Seidlitzia rosmarinus',
      'Tamarisco (Tamarix ramosissima)',
      'Ajenjo (Artemisia sieberi)',
      'Zygophyllum eurypterum',
    ],
    cultivos: ['pistacho', 'azafran', 'datilera', 'granado', 'trigo', 'cebada', 'alfalfa'],
    fuentes: [GIAHS, HWSD, WRB, RESOLVE],
  },

  // IR AZ · ECO_ID 649 · el bosque hircano
  hircania_caspio: {
    id: 'hircania_caspio',
    nombre: 'Bosque hircano del Caspio',
    emoji: '🌳',
    color: '#3F6B4A',
    resumen: 'La franja de bosque templado húmedo entre el mar Caspio y la ladera norte del Elburz, de Azerbaiyán a Golestán. Es un relicto del Terciario que sobrevivió a las glaciaciones: bosque de hoja caduca sin equivalente en el resto de Asia occidental, con hasta 2.000 mm de lluvia a pocos kilómetros del desierto.',
    vegetacion: 'Haya oriental y carpe en altura, con roble castaño, aliso, parrotia persa —el árbol de hierro— y boj en el piso bajo; el sotobosque es denso y el arrozal ocupa la llanura al pie.',
    fauna: 'Leopardo persa, oso pardo, lince, ciervo rojo del Caspio, jabalí; el tigre del Caspio se extinguió acá en el siglo XX.',
    suelos: 'Cambisoles y Luvisoles profundos, ácidos y con materia orgánica alta bajo bosque, sobre pendientes fuertes. Se degradan muy rápido cuando se abre el dosel: la lluvia intensa sobre suelo desnudo en pendiente produce cárcavas en una temporada. En la llanura, Gleysoles bajo arrozal con freática alta. La tensión productiva es la de siempre en un pie de monte húmedo: lo que se hace arriba —tala, pastoreo, camino forestal— llega abajo como sedimento y como crecida, y el arrozal de la llanura es el que lo paga.',
    saberes: [],
    especies: [
      'Haya oriental (Fagus orientalis)',
      'Árbol de hierro persa (Parrotia persica)',
      'Roble castaño (Quercus castaneifolia)',
      'Aliso del Cáucaso (Alnus subcordata)',
      'Boj (Buxus hyrcana)',
    ],
    cultivos: ['arroz', 'naranjo', 'avellano', 'castano', 'nogal', 'soja', 'arandano', 'vid'],
    fuentes: [HIRCANIA, SOILGRIDS, WRB, RESOLVE],
  },

  // IR · ECO_ID 695 · la cara seca del Elburz
  elburz_estepa_forestal: {
    id: 'elburz_estepa_forestal',
    nombre: 'Estepa forestal del Elburz',
    emoji: '🌰',
    color: '#7A8459',
    resumen: 'La cara sur del Elburz, a sotavento del bosque hircano: la misma montaña, la mitad de la lluvia. Estepa arbolada de enebro y almendro entre 1.500 y 3.000 metros, con el Damavand por encima de todo.',
    vegetacion: 'Enebro disperso, almendro y agracejo silvestres, y pastizal de altura con Astragalus almohadillado. Los valles llevan huerta de nogal y frutal bajo riego de deshielo.',
    fauna: 'Cabra bezoar, muflón del Elburz, leopardo persa, oso pardo, quebrantahuesos; la conexión con la ladera húmeda hace que muchas especies usen las dos vertientes estacionalmente.',
    suelos: 'Cambisoles y Leptosoles calcáreos someros, con Kastanozems en los pastizales de altura mejor conservados. El recurso crítico es el deshielo: la agricultura del valle depende del volumen y de la fecha en que baja la nieve, no de la lluvia. Un invierno con nieve escasa o con deshielo temprano deja los canales sin agua en el momento del llenado del grano, y eso ya no es excepcional.',
    saberes: [],
    especies: [
      'Enebro (Juniperus excelsa)',
      'Almendro silvestre (Prunus scoparia)',
      'Agracejo (Berberis integerrima)',
      'Nogal (Juglans regia)',
      'Astragalus gossypinus',
    ],
    cultivos: ['trigo', 'cebada', 'papa', 'nogal', 'vid', 'damasco', 'azafran', 'alfalfa'],
    fuentes: [SOILGRIDS, HWSD, RESOLVE],
  },

  // IR TM · ECO_ID 815 · la llanura desértica caspia
  caspio_llanura_desertica: {
    id: 'caspio_llanura_desertica',
    nombre: 'Llanura desértica caspia',
    emoji: '🌾',
    color: '#A9A26E',
    resumen: 'La llanura baja al este y sudeste del Caspio, buena parte por debajo del nivel del mar. En Irán es el Turkmen Sahra de Golestán: estepa de loess que fue pastizal turcomano y hoy es una de las cuencas trigueras del país.',
    vegetacion: 'Estepa de Artemisia y gramíneas en el sector seco, con Haloxylon en las arenas y halófitas en las depresiones; casi todo el sector iraní está convertido a trigo y algodón.',
    fauna: 'Onagro, gacela bocinegra, gato de Pallas, y las depresiones salinas del Caspio como sitio de invernada de aves acuáticas.',
    suelos: 'Calcisoles y Kastanozems sobre loess, con Solonchaks en las depresiones cerradas. El loess es el punto: tiene estructura débil, se disgrega con el impacto de la gota y forma cárcavas profundas y verticales con una sola tormenta sobre suelo desnudo. En Golestán las inundaciones y las cárcavas posteriores al desmonte del pastizal están bien documentadas. Es un suelo que rinde mucho y perdona poco: cobertura permanente o pérdida rápida.',
    saberes: [],
    especies: [
      'Haloxylon (Haloxylon aphyllum)',
      'Ajenjo (Artemisia sieberi)',
      'Trigo (Triticum aestivum)',
      'Regaliz (Glycyrrhiza glabra)',
      'Calligonum caput-medusae',
    ],
    cultivos: ['algodon', 'trigo', 'cebada', 'granado', 'vid', 'alfalfa'],
    fuentes: [SOILGRIDS, HWSD, RESOLVE],
  },

  // IR TM · ECO_ID 756, 829 · el Kopet Dag
  kopet_dag: {
    id: 'kopet_dag',
    nombre: 'Kopet Dag',
    emoji: '🌿',
    color: '#8A8B5A',
    resumen: 'La cordillera que forma la frontera entre Irán y Turkmenistán, con su piedemonte semidesértico al norte. RESOLVE la parte en dos —bosque estepario arriba, semidesierto abajo—, pero funciona como una sola unidad hidrológica: la montaña recoge, el piedemonte usa.',
    vegetacion: 'Bosque abierto de enebro, arce y pistacho en la montaña, con pastizal de altura; abajo, estepa de Artemisia y efímeras primaverales sobre loess.',
    fauna: 'Leopardo persa, muflón, cabra bezoar, hiena rayada, gato de Pallas; es uno de los corredores de leopardo mejor conservados de Asia occidental.',
    suelos: 'Calcisoles y Cambisoles sobre caliza en la montaña, Calcisoles de loess en el piedemonte, con horizonte cálcico neto. Fertilidad razonable y estructura frágil. La agricultura del piedemonte —trigo de secano, uva, granada, pistacho— vive de la escorrentía de la montaña captada en el abanico; el pastoreo de la ladera alta define cuánta de esa agua llega y con cuánto sedimento. Es el caso de manual donde la cuenca alta y la parcela baja pertenecen a manos distintas.',
    saberes: [],
    especies: [
      'Enebro (Juniperus turcomanica)',
      'Pistacho silvestre (Pistacia vera)',
      'Arce (Acer turcomanicum)',
      'Granado silvestre (Punica granatum)',
      'Almendro (Amygdalus spinosissima)',
    ],
    cultivos: ['trigo', 'cebada', 'pistacho', 'vid', 'damasco', 'nogal', 'alfalfa'],
    fuentes: [SOILGRIDS, HWSD, RESOLVE],
  },

  // IR TM AF · ECO_ID 813 · el pistachar de Badgyz
  badghyz_pistacho: {
    id: 'badghyz_pistacho',
    nombre: 'Sabana de pistacho de Badgyz',
    emoji: '🌰',
    color: '#97975E',
    resumen: 'La sabana de pistacho silvestre entre Turkmenistán, Afganistán y el norte de Jorasán iraní: el bosque abierto de Pistacia vera más grande del mundo, sobre colinas de loess. Es el origen genético del pistacho cultivado.',
    vegetacion: 'Pistachar abierto de porte bajo, con decenas de árboles por hectárea, sobre un tapiz de efímeras primaverales que se seca en junio. Sin sotobosque leñoso: es sabana, no bosque.',
    fauna: 'Onagro turcomano, urial, gacela bocinegra, leopardo; Badgyz sostuvo la mayor población de onagro salvaje del mundo.',
    suelos: 'Calcisoles de loess profundos, sueltos, con reserva de humedad importante en profundidad y estructura muy débil en superficie. El pistacho vive de esa reserva profunda y por eso resiste veranos de cero lluvia. El daño típico es doble: pastoreo que impide el reemplazo y corte de leña que abre el dosel; en cuanto se pierde la cobertura, el loess se acarcava. La regeneración natural existe pero es lenta y depende de años húmedos consecutivos.',
    saberes: [],
    especies: [
      'Pistacho (Pistacia vera)',
      'Almendro silvestre (Amygdalus bucharica)',
      'Férula (Ferula assa-foetida)',
      'Poa bulbosa',
      'Carex pachystylis',
    ],
    cultivos: ['pistacho', 'trigo', 'cebada', 'damasco', 'alfalfa'],
    fuentes: [SOILGRIDS, HWSD, RESOLVE],
  },

  // IR · ECO_ID 757 · Kuh Rud y las sierras del este
  kuh_rud_montano: {
    id: 'kuh_rud_montano',
    nombre: 'Sierras de Kuh Rud y el este iraní',
    emoji: '⛰️',
    color: '#8E8A63',
    resumen: 'Las cadenas interiores que cruzan la meseta iraní en diagonal, del Kuh Rud a las sierras de Kermán y Baluchistán. Islas de montaña entre desiertos: reciben algo más de lluvia y son la fuente de agua de todos los oasis de alrededor.',
    vegetacion: 'Bosque abierto de enebro y almendro en las cotas altas, matorral espinoso de Astragalus y Amygdalus en la ladera media, estepa de Artemisia abajo.',
    fauna: 'Cabra bezoar, muflón, leopardo persa, oso pardo en el norte del rango, buitre leonado; núcleos de fauna de montaña aislados unos de otros por el desierto.',
    suelos: 'Leptosoles y Calcisoles pedregosos sobre caliza y roca volcánica, someros y de baja retención. La montaña no se cultiva: se administra como cuenca de captación. El agua que infiltra acá es la que alimenta el acuífero del abanico donde arranca cada qanat, y esa cadena es lo que sostiene los oasis de Yazd, Kermán y Nain. Sobrepastorear la ladera es reducir la recarga de un pueblo que está a treinta kilómetros y no lo va a atribuir a eso.',
    saberes: [],
    especies: [
      'Enebro (Juniperus excelsa subsp. polycarpos)',
      'Almendro (Amygdalus lycioides)',
      'Astragalus microcephalus',
      'Ajenjo (Artemisia aucheri)',
      'Pistacho del Atlas (Pistacia atlantica)',
    ],
    cultivos: ['trigo', 'cebada', 'nogal', 'vid', 'damasco', 'azafran', 'pistacho', 'alfalfa'],
    fuentes: [SOILGRIDS, HWSD, RESOLVE],
  },

  // IR AF PK · ECO_ID 838 · Sistán y el viento de los 120 días
  sistan_registan: {
    id: 'sistan_registan',
    nombre: 'Arenales de Sistán y Registán',
    emoji: '💨',
    color: '#C2AC79',
    resumen: 'La cuenca de Sistán, entre Irán y Afganistán, y el arenal del Registán al sur. Un delta interior alimentado por el río Helmand que termina en los lagos Hamún, y encima el bad-e sad-o-bist-ruz, el viento de los ciento veinte días, que sopla del norte todo el verano.',
    vegetacion: 'Cañaveral y tamarisco en los Hamún cuando tienen agua, matorral de Haloxylon y Calligonum en la arena, y agricultura de crecida en el delta.',
    fauna: 'Cuando los lagos se llenan, decenas de miles de aves acuáticas invernantes; en seco, gacela bocinegra, zorro de Blanford, lagarto de arena. El ciclo lleno-seco es la característica ecológica central, y el problema es que el seco se volvió la norma.',
    suelos: 'Fluvisoles limosos de delta interior y Arenosoles en el arenal. Cuando los Hamún se secan, el limo del fondo queda expuesto al viento de los 120 días y se convierte en tormentas de polvo que sepultan pueblos y canales enteros: la degradación acá es literalmente aérea. El limitante es el reparto del Helmand entre Afganistán e Irán; sin caudal, ni el suelo del delta ni el cortaviento de tamarisco se sostienen.',
    saberes: [],
    especies: [
      'Tamarisco (Tamarix ramosissima)',
      'Caña común (Phragmites australis)',
      'Haloxylon (Haloxylon ammodendron)',
      'Calligonum comosum',
      'Alhagi maurorum',
    ],
    cultivos: ['trigo', 'cebada', 'datilera', 'sesamo', 'alfalfa'],
    fuentes: [HWSD, WRB, RESOLVE],
  },
};
