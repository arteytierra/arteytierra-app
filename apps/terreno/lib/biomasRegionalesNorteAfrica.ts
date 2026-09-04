/**
 * Fichas regionales del norte de África mediterráneo.
 *
 * ESCRITO A MANO. La lista salió de enumerar contra RESOLVE (ver el encabezado
 * de `ecorregionesNorteAfrica.ts`, con el alcance y lo que quedó afuera). Son
 * 14 fichas para 14 ECO_ID.
 *
 * El alcance incluye el Sahara de los cinco países mediterráneos, no sólo la
 * franja costera. Eso es deliberado: el oasis de foggara, el ghout de El Oued
 * y el jardín de uadi del Ahaggar son agricultura tan real como la huerta del
 * Rif, y son además el repertorio de técnicas de agua más útil que tiene la
 * región para el clima que viene.
 *
 * Cinco de estas ecorregiones —701, 797, 798, 833 y 839— habían quedado
 * declaradas como "fuera de alcance" al cerrar Europa, porque entraban por el
 * borde sur de las cajas ibérica y mediterránea sin pisar territorio europeo.
 * Ahora entran por derecho propio.
 *
 * `saberes` va vacío en todas, por la misma regla del resto del catálogo: sin
 * geometría con procedencia, licencia y acuerdo, `lib/saberes.ts` no activa
 * nada. Que un predio caiga en el Magreb no autoriza a atribuirle el manejo de
 * los agdal amazigh ni el reparto de la foggara.
 */

import type { BiomaFicha } from './biomaTipos';

/** Cartografías y referencias compartidas. */
const RESOLVE = { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' };
const WRB = { label: 'WRB — Base Referencial Mundial del Recurso Suelo (FAO)', url: 'https://www.fao.org/soils-portal/data-hub/soil-classification/world-reference-base/es/' };
const SOILGRIDS = { label: 'ISRIC — SoilGrids', url: 'https://soilgrids.org/' };
const HWSD = { label: 'FAO — Harmonized World Soil Database v2.0', url: 'https://www.fao.org/soils-portal/data-hub/soil-maps-and-databases/harmonized-world-soil-database-v20/en/' };
const ATLAS_AFRICA = { label: 'JRC — Soil Atlas of Africa', url: 'https://esdac.jrc.ec.europa.eu/content/soil-atlas-africa' };
const ICARDA = { label: 'ICARDA — Investigación agrícola en zonas secas', url: 'https://www.icarda.org/' };
const GIAHS = { label: 'FAO — SIPAM, Sistemas Importantes del Patrimonio Agrícola Mundial', url: 'https://www.fao.org/giahs/es/' };

export const BIOMAS_REGIONALES_NORTE_AFRICA: Record<string, BiomaFicha> = {
  // MA DZ TN LY · ECO_ID 798 · el bosque mediterráneo del Magreb
  magreb_bosque_mediterraneo: {
    id: 'magreb_bosque_mediterraneo',
    nombre: 'Bosque mediterráneo del Magreb',
    emoji: '🌳',
    color: '#5F7A4B',
    resumen: 'La franja húmeda del norte del Magreb: el Rif, la Cabilia, el Tell y el Cabo Bon, con 500 a 1.200 mm de lluvia invernal. Es la contracara africana del bosque mediterráneo ibérico, con las mismas especies y una historia de uso mucho más intensa.',
    vegetacion: 'Alcornocal y encinar denso, con quejigo, acebuche, lentisco, brezo y madroño; en la Cabilia aparecen manchas de roble zeen y de abeto numídico, endémico del norte de Argelia.',
    fauna: 'Macaco de Berbería —el único primate del norte de África—, jabalí, chacal, gineta, jineta, y el ciervo berberisco reintroducido; el leopardo y el león del Atlas desaparecieron.',
    suelos: 'Luvisoles y Cambisoles sobre esquisto y marga, profundos bajo bosque y muy erosionables en cuanto se abre. La combinación de pendiente fuerte, lluvia concentrada en pocos episodios y roca madre blanda hace del Rif una de las cuencas con mayor tasa de erosión medida del Mediterráneo: los embalses del norte de Marruecos pierden capacidad por colmatación mucho más rápido de lo previsto. El manejo que funciona es de cobertura y de terraza, y el alcornocal descorchado —que mantiene el dosel— es más protector que cualquier cultivo de ladera.',
    saberes: [],
    especies: [
      'Alcornoque (Quercus suber)',
      'Encina (Quercus ilex)',
      'Abeto numídico (Abies numidica)',
      'Acebuche (Olea europaea var. sylvestris)',
      'Lentisco (Pistacia lentiscus)',
    ],
    fuentes: [ATLAS_AFRICA, HWSD, RESOLVE],
  },

  // MA DZ TN LY EG · ECO_ID 797 · la estepa de alfa
  magreb_estepa_alfa: {
    id: 'magreb_estepa_alfa',
    nombre: 'Estepa de alfa y altiplanos',
    emoji: '🌾',
    color: '#A39A5F',
    resumen: 'Los Altiplanos entre el Tell y el Atlas sahariano, y su prolongación por la Yefara libia y la costa cirenaica: 200 a 400 mm, inviernos fríos y veranos secos. La estepa de alfa fue durante un siglo un recurso industrial de exportación y hoy es sobre todo pastoreo ovino.',
    vegetacion: 'Estepa de esparto o alfa (Stipa tenacissima) y Lygeum, con Artemisia herba-alba en los suelos más finos y matorral de Ziziphus en las depresiones.',
    fauna: 'Gacela de Cuvier y de Dorcas en retroceso, zorro rojo y de Rüppell, chacal, avutarda hubara, alondra de Dupont —cuya población norteafricana es clave para la especie—.',
    suelos: 'Calcisoles y Leptosoles con costra caliza somera, materia orgánica muy baja y estructura sostenida por el mismo tapiz de alfa. Es un sistema donde la mata y el suelo son la misma cosa: el macollo de esparto frena el viento, retiene el fino y crea un montículo fértil a su pie. Arrancarlo —para papel o para roturar y sembrar cebada— deja la costra caliza al descubierto y el proceso no se revierte con descanso. La recuperación exige replantar la mata, no sólo cerrar el pastoreo.',
    saberes: [],
    especies: [
      'Esparto o alfa (Stipa tenacissima)',
      'Albardín (Lygeum spartum)',
      'Ajenjo (Artemisia herba-alba)',
      'Azufaifo (Ziziphus lotus)',
      'Pistacho del Atlas (Pistacia atlantica)',
    ],
    fuentes: [ICARDA, ATLAS_AFRICA, HWSD, RESOLVE],
  },

  // MA DZ TN · ECO_ID 701 · la conífera de montaña del Atlas
  atlas_conifera_montana: {
    id: 'atlas_conifera_montana',
    nombre: 'Conífera de montaña del Atlas',
    emoji: '🌲',
    color: '#4E6B4C',
    resumen: 'Los pisos de montaña del Atlas Medio, el Alto Atlas, el Rif alto y el Aurés argelino, entre 1.400 y 2.600 metros. Es donde vive el cedro del Atlas, y donde se acumula la nieve que alimenta todos los uadis del sur.',
    vegetacion: 'Cedral de Cedrus atlantica con encina y quejigo, pinar de pino carrasco y pino salgareño, y enebral en la cota superior. El cedral del Atlas Medio es el bosque de mayor valor de conservación del norte de África.',
    fauna: 'Macaco de Berbería —cuya población principal está en el cedral—, muflón de Berbería, jabalí, águila real, pito de Levaillant; el cedral es un área de endemismo aviar norteafricano.',
    suelos: 'Cambisoles y Luvisoles pardos profundos sobre caliza y basalto, con horizonte orgánico bien formado bajo cedro. Es el suelo más fértil y con más carbono de todo el norte de África, y está en pendiente. La mortandad de cedro documentada desde los años ochenta —sequías encadenadas más pastoreo intensivo que impide la regeneración— abre el dosel y arranca la erosión en un suelo que tardó milenios. Acá el argumento de conservación es hidrológico: la montaña es el reservorio de nieve de todo el sur.',
    saberes: [],
    especies: [
      'Cedro del Atlas (Cedrus atlantica)',
      'Encina (Quercus ilex)',
      'Quejigo de Berbería (Quercus canariensis)',
      'Pino salgareño (Pinus nigra subsp. mauretanica)',
      'Enebro turífero (Juniperus thurifera)',
    ],
    fuentes: [ATLAS_AFRICA, SOILGRIDS, HWSD, RESOLVE],
  },

  // MA · ECO_ID 758 · el enebral de altura del Alto Atlas
  alto_atlas_enebro: {
    id: 'alto_atlas_enebro',
    nombre: 'Enebral de altura del Alto Atlas',
    emoji: '🌿',
    color: '#6E7A55',
    resumen: 'El piso por encima del cedral en el Alto Atlas marroquí, de 2.400 metros al Toubkal: enebro turífero disperso, pastizal almohadillado y nieve estacional. El agua de todo el Sus y del Draa nace acá.',
    vegetacion: 'Enebro turífero de porte achaparrado y edad de siglos, con matorral almohadillado espinoso de Alyssum, Bupleurum y Erinacea que es la forma que toma la vegetación cuando el viento y el diente no dejan crecer nada más alto.',
    fauna: 'Muflón de Berbería, zorro, águila real, quebrantahuesos, y una flora de invertebrados endémica de las cumbres.',
    suelos: 'Leptosoles y Cambisoles someros sobre caliza y cuarcita, con horizonte orgánico delgado y muy vulnerable al pisoteo. La gestión tradicional que sostuvo esto es el agdal: el cierre estacional del pastizal de altura decidido por la asamblea del pueblo, que abre y cierra el acceso en fechas fijas. Donde el agdal se mantiene, el pastizal aguanta; donde se rompió, el suelo se pela hasta la roca en una generación. Es el caso más claro de la región en que la variable de manejo es institucional, no técnica.',
    saberes: [],
    especies: [
      'Enebro turífero (Juniperus thurifera)',
      'Enebro rastrero (Juniperus sabina)',
      'Erizón (Erinacea anthyllis)',
      'Alyssum spinosum',
      'Festuca de altura (Festuca mairei)',
    ],
    fuentes: [ATLAS_AFRICA, SOILGRIDS, RESOLVE],
  },

  // EG · ECO_ID 744 · el Delta del Nilo
  nilo_delta: {
    id: 'nilo_delta',
    nombre: 'Delta y valle del Nilo',
    emoji: '🌾',
    color: '#7E9450',
    resumen: 'La franja verde que atraviesa el desierto y se abre en abanico al norte de El Cairo. Es una de las agriculturas más antiguas y más densas del planeta, y desde 1970 funciona con una regla nueva: la presa de Asuán retiene el limo que durante siete mil años renovó el suelo cada año.',
    vegetacion: 'Vegetación natural prácticamente inexistente: mosaico continuo de arroz, algodón, trigo, berseem, hortaliza y frutal, con palmeras datileras en los bordes y papiro reducido a relictos en los lagos del norte.',
    fauna: 'Garcilla bueyera y garza sobre los arrozales, ibis, y los lagos costeros —Manzala, Burullus, Idku— como una de las mayores concentraciones de aves acuáticas invernantes del Mediterráneo.',
    suelos: 'Fluvisoles y Vertisoles arcillosos profundos sobre limo basáltico etíope, entre los suelos agrícolas más fértiles que existen. Los tres problemas de hoy son consecuencia del mismo cambio: sin la crecida anual, no llega limo nuevo y la fertilidad depende enteramente del fertilizante; el riego permanente sin lámina de lavado suficiente saliniza el norte del delta, donde la freática salina está a un metro; y sin aporte de sedimento la costa retrocede y el mar entra. Encima, el ladrillo cocido con la propia arcilla de las mejores parcelas se comió decenas de miles de hectáreas de suelo de primera.',
    saberes: [],
    especies: [
      'Palmera datilera (Phoenix dactylifera)',
      'Papiro (Cyperus papyrus)',
      'Trébol de Alejandría (Trifolium alexandrinum)',
      'Tamarisco (Tamarix nilotica)',
      'Sicomoro (Ficus sycomorus)',
    ],
    fuentes: [ATLAS_AFRICA, HWSD, WRB, RESOLVE],
  },

  // TN DZ MA EG · ECO_ID 745 · chotts y sebkhas
  chotts_sebkhas: {
    id: 'chotts_sebkhas',
    nombre: 'Chotts y sebkhas saharianas',
    emoji: '🧂',
    color: '#B4AE8C',
    resumen: 'Las depresiones salinas cerradas del norte del Sahara: el Chott el Yerid y el Chott Melrhir, por debajo del nivel del mar, y la depresión de Qattara en Egipto. Son el punto final de todo el drenaje de la región, y donde termina la sal que el agua arrastró.',
    vegetacion: 'Costra de sal desnuda en el centro, cinturones concéntricos de halófitas —Halocnemum, Arthrocnemum, Suaeda, Tamarix— según la tolerancia de cada una, y palmeral en el borde donde aflora agua dulce.',
    fauna: 'Flamenco común en los años de agua, limícolas, gacela de Dorcas en los bordes, y una fauna de invertebrados halófilos específica.',
    suelos: 'Solonchaks y Gypsisoles con costra salina superficial y freática somera. La regla es que todo lo que se riega en la cuenca termina acá, y el agua de drenaje llega concentrada: cualquier expansión de riego aguas arriba se lee después en el chott. En el borde, el sistema del ghout de El Oued —el hoyo excavado hasta cerca de la freática, con la palmera plantada en el fondo y sin regar nunca— es la respuesta tradicional a este paisaje y funciona sólo mientras el nivel freático no suba: cuando el drenaje urbano lo elevó, los ghouts se ahogaron.',
    saberes: [],
    especies: [
      'Palmera datilera (Phoenix dactylifera)',
      'Halocnemum strobilaceum',
      'Arthrocnemum macrostachyum',
      'Tamarisco (Tamarix gallica)',
      'Suaeda fruticosa',
    ],
    fuentes: [GIAHS, ATLAS_AFRICA, WRB, RESOLVE],
  },

  // MA DZ TN LY EG · ECO_ID 833 · la estepa norsahariana y el oasis
  sahara_norte_estepa: {
    id: 'sahara_norte_estepa',
    nombre: 'Estepa norsahariana y oasis de foggara',
    emoji: '🌴',
    color: '#AFA067',
    resumen: 'La banda de transición entre la estepa de alfa y el desierto pleno, de 50 a 150 mm: el Atlas sahariano, el Suf, el Mzab, el borde libio y el egipcio. Es la franja del oasis, y donde está casi toda la población sahariana.',
    vegetacion: 'Matorral disperso de Ziziphus, Retama y Anabasis con pastizal efímero después de la lluvia; en el oasis, el sistema de tres estratos: palmera datilera arriba, frutal en medio —granado, higuera, damasco— y hortaliza o forraje abajo.',
    fauna: 'Gacela de Dorcas, fennec, zorro de Rüppell, lagarto Uromastyx, y una avifauna de oasis —tórtola, bulbul, verdecillo— que depende enteramente del palmeral.',
    suelos: 'Calcisoles y Gypsisoles con costra, y en el oasis un suelo enteramente construido: arena, estiércol y restos de palma acumulados durante siglos hasta formar un perfil que no existía. Esa es la técnica central de la región y la más transferible. El agua llega por foggara o khettara —galería de captación con pendiente suave que trae el agua del piedemonte por gravedad— y se reparte con el peine de distribución, que divide el caudal en partes proporcionales fijas y visibles. El sistema falla por dos vías: pozos profundos que bajan el nivel y secan la galería, y abandono del desarenado anual, que la colmata.',
    saberes: [],
    especies: [
      'Palmera datilera (Phoenix dactylifera)',
      'Azufaifo (Ziziphus lotus)',
      'Retama (Retama raetam)',
      'Granado (Punica granatum)',
      'Anabasis articulata',
    ],
    fuentes: [GIAHS, ATLAS_AFRICA, HWSD, RESOLVE],
  },

  // MA DZ · ECO_ID 845 · el Sahara occidental
  sahara_occidental_erg: {
    id: 'sahara_occidental_erg',
    nombre: 'Sahara occidental y grandes ergs',
    emoji: '🏜️',
    color: '#C6B27C',
    resumen: 'El Sahara del oeste: el Gran Erg Occidental y el Oriental en Argelia, la Hamada del Draa, el Erg Chebbi, y las llanuras de reg entre ellos. Menos de 50 mm y años enteros sin lluvia registrada.',
    vegetacion: 'Prácticamente nula sobre la duna y el reg; vida concentrada en el lecho del uadi, con acacia, Calotropis y Panicum que aprovechan crecidas que ocurren una vez por década.',
    fauna: 'Fennec, gato de las arenas, gacela de Dorcas, adax casi extinto, víbora de Avicena, y una fauna de invertebrados psamófila muy especializada.',
    suelos: 'Arenosoles en el erg y Leptosoles de pavimento en la hamada y el reg. Sin materia orgánica y sin capacidad de retención salvo en profundidad. La agricultura que existe es enteramente de agua importada del subsuelo o del uadi; el diseño acá se juega en dos cosas: cortaviento vivo para evitar el enterramiento por arena móvil, y elección de una lámina de riego que no acumule sal, porque no hay lluvia que lave.',
    saberes: [],
    especies: [
      'Acacia (Vachellia raddiana)',
      'Calotropis (Calotropis procera)',
      'Panicum turgidum',
      'Aristida pungens',
      'Tamarisco (Tamarix aphylla)',
    ],
    fuentes: [ATLAS_AFRICA, HWSD, RESOLVE],
  },

  // LY EG · ECO_ID 822 · el Sahara oriental y sus oasis
  sahara_oriental: {
    id: 'sahara_oriental',
    nombre: 'Sahara oriental y desierto líbico',
    emoji: '🏜️',
    color: '#C8B888',
    resumen: 'El desierto entre Libia y Egipto: el Gran Mar de Arena, la meseta calcárea del desierto occidental egipcio y las depresiones que la perforan —Siwa, Bahariya, Farafra, Dajla y Jarga—. Es el sector más seco del Sahara y el que tiene el mayor acuífero fósil del mundo debajo.',
    vegetacion: 'Nula en la meseta y el arenal; en las depresiones, palmeral y olivar de oasis alrededor de manantiales artesianos.',
    fauna: 'Gacela de Dorcas y dorcas blanca casi desaparecidas, fennec, zorro de Rüppell; los oasis funcionan como escalas de migración en pleno vacío.',
    suelos: 'Leptosoles calcáreos y Arenosoles, con Solonchaks en el fondo de las depresiones. La tensión central es del agua: el acuífero de Nubia, fósil, se recargó en un período húmedo hace miles de años y no se recarga hoy. Los manantiales artesianos de Siwa perdieron presión con la perforación masiva y el excedente sin drenaje formó lagos salinos que están comiéndose el palmeral desde abajo. Es un caso donde el problema no es la falta de agua sino la falta de salida para el agua usada.',
    saberes: [],
    especies: [
      'Palmera datilera (Phoenix dactylifera)',
      'Olivo (Olea europaea)',
      'Tamarisco (Tamarix nilotica)',
      'Alhagi graecorum',
      'Zygophyllum album',
    ],
    fuentes: [GIAHS, ATLAS_AFRICA, HWSD, RESOLVE],
  },

  // DZ LY EG · ECO_ID 842 · el Sahara meridional
  sahara_sur: {
    id: 'sahara_sur',
    nombre: 'Sahara meridional',
    emoji: '🐪',
    color: '#BFAE79',
    resumen: 'El borde sur del Sahara dentro de los países mediterráneos: el sur profundo de Argelia y Libia y el extremo del desierto egipcio, ya en transición hacia el régimen de lluvia estival del Sahel aunque todavía sin recibirla casi nunca.',
    vegetacion: 'Acacias dispersas en los uadis, Panicum y Aristida en la arena, y pulsos de efímeras cuando una lengua del monzón llega hasta acá, cosa que pasa unos pocos años por década.',
    fauna: 'Adax, gacela dama y guepardo sahariano en situación crítica; fennec, zorro pálido, y el corredor de aves migratorias que cruzan el desierto de una sola vez.',
    suelos: 'Regosoles y Arenosoles de reg y erg, prácticamente sin desarrollo. La vida útil del paisaje está en el uadi y en el pastoreo nómada de camello que lo aprovecha en pulsos. El daño que se acumula acá es el de pista y vehículo: la huella rompe el pavimento y libera el fino, y en un régimen sin lluvia que reconstituya nada esa marca queda por décadas.',
    saberes: [],
    especies: [
      'Acacia (Vachellia tortilis subsp. raddiana)',
      'Panicum turgidum',
      'Aristida pungens',
      'Cornulaca monacantha',
      'Balanites (Balanites aegyptiaca)',
    ],
    fuentes: [ATLAS_AFRICA, HWSD, RESOLVE],
  },

  // MA · ECO_ID 839 · la costa atlántica sahariana
  sahara_costa_atlantica: {
    id: 'sahara_costa_atlantica',
    nombre: 'Costa atlántica sahariana',
    emoji: '🌫️',
    color: '#A9A98A',
    resumen: 'La franja litoral del sur de Marruecos y el Sáhara Occidental, de Sidi Ifni a Dajla. Llueve casi nada, pero la corriente fría de Canarias genera niebla costera casi diaria: es un desierto húmedo, con humedad relativa alta y temperaturas suaves todo el año.',
    vegetacion: 'Matorral suculento de Euphorbia y Zygophyllum con líquenes que capturan la niebla directamente, y acacia y Argania en los uadis del norte, donde este ecosistema se enlaza con el argán marroquí.',
    fauna: 'Gacela de Dorcas y dorcas blanca, zorro de Rüppell, y una costa que es escala mayor para limícolas migratorias entre Europa y África occidental.',
    suelos: 'Regosoles y Arenosoles calcáreos, con una costra superficial de líquenes y cianobacterias que es lo que estabiliza la arena y capta la humedad de la niebla. Esa costra es el activo del sistema y lo que se pierde primero: el paso de vehículos y el pastoreo intensivo la rompen y el suelo pasa de fijo a móvil. La captación de niebla con malla —que en esta costa da rendimientos de varios litros por metro cuadrado y día— es la técnica que mejor se adapta acá, y funciona por la misma razón que el liquen.',
    saberes: [],
    especies: [
      'Argán (Argania spinosa)',
      'Euphorbia echinus',
      'Acacia (Vachellia raddiana)',
      'Zygophyllum gaetulum',
      'Launaea arborescens',
    ],
    fuentes: [ATLAS_AFRICA, HWSD, RESOLVE],
  },

  // DZ LY · ECO_ID 846 · Ahaggar y Tassili
  ahaggar_tassili: {
    id: 'ahaggar_tassili',
    nombre: 'Macizos del Ahaggar y el Tassili',
    emoji: '⛰️',
    color: '#8B8360',
    resumen: 'Los macizos volcánicos y de arenisca del sur de Argelia, con el Tahat por encima de los 2.900 metros. Islas de altura en pleno Sahara: más lluvia, menos calor, y refugios de especies que quedaron aisladas cuando el desierto se cerró alrededor. En sus paredes está el arte rupestre que documenta el Sahara verde.',
    vegetacion: 'Bosquetes relictos de ciprés del Tassili —quedan unas pocas decenas de árboles, todos viejos, de una especie que no existe en ningún otro lado—, olivo de Laperrine, mirto sahariano y acacia en los uadis.',
    fauna: 'Muflón de Berbería, guepardo sahariano, cocodrilo del Sahara extinguido en el siglo XX, gacela de Dorcas, y anfibios relictos en las gueltas permanentes.',
    suelos: 'Leptosoles y Cambisoles pedregosos sobre basalto y arenisca, algo más profundos en el fondo de los uadis. El sistema agrícola es el jardín de uadi: parcelas chicas de trigo, cebada, hortaliza y frutal en el lecho, regadas con la guelta o con un pozo somero, y protegidas con muretes de piedra que retienen el sedimento de cada crecida. La restricción real es la superficie: hay poca tierra utilizable y toda depende de que las crecidas sigan llegando y de que las gueltas no se agoten.',
    saberes: [],
    especies: [
      'Ciprés del Tassili (Cupressus dupreziana)',
      'Olivo de Laperrine (Olea europaea subsp. laperrinei)',
      'Mirto sahariano (Myrtus nivellei)',
      'Acacia (Vachellia laeta)',
      'Rhus tripartita',
    ],
    fuentes: [ATLAS_AFRICA, HWSD, RESOLVE],
  },

  // LY EG · ECO_ID 844 · Uweinat y Tibesti
  uweinat_tibesti: {
    id: 'uweinat_tibesti',
    nombre: 'Macizos de Uweinat y Tibesti',
    emoji: '🪨',
    color: '#8E8768',
    resumen: 'Los macizos del Sahara central-oriental: el Yebel Uweinat, en el punto donde se tocan Egipto, Libia y Sudán, y el Tibesti al sur. Como el Ahaggar, son islas de altura con lluvia ocasional y refugios biológicos, pero mucho más aisladas y menos habitadas.',
    vegetacion: 'Vegetación de uadi con acacia y Salvadora, matorral disperso en las laderas y comunidades relictas en las gargantas donde persiste algo de humedad. La cobertura total es mínima incluso para el Sahara.',
    fauna: 'Muflón de Berbería en el Tibesti, gacela de Dorcas, zorro pálido, y una fauna de invertebrados relictos en las gueltas.',
    suelos: 'Leptosoles sobre granito y arenisca, casi sin desarrollo, con acumulaciones de fino sólo en fondos de uadi y grietas. No es un paisaje productivo: es un refugio. El interés para el catálogo es hidrológico y de referencia —muestra qué queda cuando el Sahara se hace impracticable— y arqueológico, porque el arte rupestre del Uweinat documenta el mismo Sahara verde que el Tassili.',
    saberes: [],
    especies: [
      'Acacia (Vachellia tortilis)',
      'Salvadora persica',
      'Ficus salicifolia',
      'Panicum turgidum',
      'Cymbopogon schoenanthus',
    ],
    fuentes: [ATLAS_AFRICA, HWSD, RESOLVE],
  },

  // EG · ECO_ID 836 · el desierto costero del mar Rojo
  mar_rojo_costa_desierto: {
    id: 'mar_rojo_costa_desierto',
    nombre: 'Desierto costero del mar Rojo',
    emoji: '⛰️',
    color: '#9C9068',
    resumen: 'La franja entre el Nilo y el mar Rojo: el desierto oriental egipcio, las montañas del mar Rojo y el Gebel Elba en el extremo sur. Casi sin lluvia salvo tormentas violentas y esporádicas que bajan por los uadis, y una franja sur donde la niebla marina sostiene una vegetación sorprendentemente rica.',
    vegetacion: 'Acacia, Balanites y Salvadora en los uadis, matorral ralo en la montaña, y en el Gebel Elba una comunidad de nieblas con especies afrotropicales que no aparecen en ningún otro punto de Egipto.',
    fauna: 'Cabra montés nubia, gacela dorcas, hiena rayada, zorro de Rüppell, y el corredor migratorio del mar Rojo pasando por encima de todo.',
    suelos: 'Leptosoles en la montaña y Fluvisoles gruesos de grava en el uadi, sin retención y con infiltración muy rápida. La agricultura posible es la de crecida en el uadi, con diques de tierra y bordos, y depende por completo de tormentas que ocurren cada varios años: es agricultura de oportunidad, no de calendario. El pastoreo bisharin y ababda que estructuró históricamente el uso del territorio se organizó alrededor de esa irregularidad, moviéndose hacia donde llovió.',
    saberes: [],
    especies: [
      'Acacia (Vachellia tortilis)',
      'Balanites (Balanites aegyptiaca)',
      'Salvadora persica',
      'Moringa peregrina',
      'Dracaena ombet',
    ],
    fuentes: [ATLAS_AFRICA, HWSD, RESOLVE],
  },
};
