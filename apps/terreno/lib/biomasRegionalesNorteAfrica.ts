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

/**
 * Fuentes propias de cada ficha: cada una mide algo en un lugar concreto de
 * esta región y no describe la ecorregión entera. El alcance real de cada una
 * está en su comentario, y es parte de la cita: una fuente del lugar es de un
 * lugar.
 */

/** Pastizales forestales del norte de Marruecos. Inventario florístico con
 *  palatabilidad y disponibilidad de forraje medida por cuadrante. */
const MAGREB_PASTIZAL = { label: 'Land 12(1):215 — Floristic Composition, Diversity, Palatability, and Forage Availability of Forest Rangelands in the Southern Mediterranean Region of Northern Morocco', url: 'https://doi.org/10.3390/land12010215' };

/** Cedral de Ifrane-Azrou, Atlas Medio: cuatro parcelas de 0,13 ha entre 1.830
 *  y 1.890 m, campaña de 2009 y 2010. No cubre el Alto Atlas, el Rif alto ni
 *  los Aurés. */
const CEDRO_ATLAS_MEDIO = { label: 'Forests 2(3):777-796 — Increasing Drought Sensitivity and Decline of Atlas Cedar (Cedrus atlantica) in the Moroccan Middle Atlas Forests', url: 'https://doi.org/10.3390/f2030777' };

/** Enebro turífero en la provincia de Azilal, Atlas Central. La distribución
 *  sale de imagen Landsat 8, modelo de elevación de 30 m, WorldClim y mapa
 *  geológico digitalizado: es una cartografía, no un transecto de campo.
 *
 *  La entrega afirmaba además que los relevamientos fueron de campo y de 2020 a
 *  2022. Puede estar en los métodos, pero el resumen —que es lo que se pudo
 *  leer, porque el texto completo está detrás de una verificación anti-bot que
 *  no se resuelve desde acá— describe teledetección y no fecha ninguna campaña.
 *  La ficha no lo dice. El resumen se chequeó en tres índices independientes
 *  (Crossref, OpenAlex y DOAJ) para no citar de oídas. */
const ENEBRO_AZILAL = { label: 'Geology, Ecology, and Landscapes 9(2):440-451 — Geographical distribution of the Thuriferous juniper (Juniperus thurifera L.) and the influencing factors in the Atlas Mountains of Azilal (Central High Atlas, Morocco)', url: 'https://doi.org/10.1080/24749508.2023.2203281' };

/** Sector oriental del delta del Nilo: 34 perfiles. No caracteriza el delta
 *  entero ni el valle. */
const DELTA_SALES = { label: 'Agronomy 11(12):2510 — Mapping Spatial Management Zones of Salt-Affected Soils in Arid Region: A Case Study in the East of the Nile Delta, Egypt', url: 'https://doi.org/10.3390/agronomy11122510' };

/** Chott Melrhir y Chott Merouane, en Argelia. No cubre el Chott el Yerid
 *  tunecino ni la depresión de Qattara. */
const CHOTT_MELRHIR = { label: 'Applied System Innovation 6(4):61 — A GRASS GIS Scripting Framework for Monitoring Changes in the Ephemeral Salt Lakes of Chotts Melrhir and Merouane, Algeria', url: 'https://doi.org/10.3390/asi6040061' };

/**
 * Migración de dunas medida con correlación de imágenes y archivo Landsat.
 *
 * Ojo con de dónde es cada número: las velocidades que el artículo logra medir
 * son de la depresión de Bodelé, en Chad, que está fuera de esta ecorregión. En
 * el Gran Erg Oriental —que sí es de acá— el método falló, y eso es justamente
 * lo que la ficha cita. Citarlo al revés sería atribuirle al erg argelino un
 * avance de duna que el trabajo no pudo determinar.
 */
const DUNAS_COSI_CORR = { label: 'Remote Sensing 11(20):2423 — Measuring Sand Dune Migration Rates with COSI-Corr and Landsat: Opportunities and Challenges', url: 'https://doi.org/10.3390/rs11202423' };

/** Oasis de Dajla, desierto occidental egipcio: 55 perfiles y 211 muestras de
 *  octubre de 2019. No representa Siwa, Bahariya, Farafra ni Jarga. */
const DAJLA_CALIDAD = { label: 'Land 10(10):1074 — Soil Quality Assessment Using Multivariate Approaches: A Case Study of the Dakhla Oasis Arid Lands', url: 'https://doi.org/10.3390/land10101074' };

/** Mar de arena de Ubari, Fezzán libio. Los propios autores avisan que no
 *  pudieron verificar nada en el terreno porque la zona es inaccesible. */
const UBARI_DUNAS = { label: 'International Archives of the Photogrammetry, Remote Sensing and Spatial Information Sciences XL-7/W3:1375-1380 — Comparison of two Satellite Imaging Platforms for Evaluating Sand Dune Migration in the Ubari Sand Sea (Libyan Fazzan)', url: 'https://doi.org/10.5194/isprsarchives-XL-7-W3-1375-2015' };

/** Sistema de captación de niebla de Sidi Ifni, suroeste de Marruecos, con
 *  cuatro años de registro. No caracteriza todo el litoral hasta Dajla. */
const NIEBLA_SIDI_IFNI = { label: 'Journal of Arid Environments 222:105174 — Multi-aspect assessment of operational fog collection systems: A rural development perspective, insights from the Sidi Ifni project in Morocco', url: 'https://doi.org/10.1016/j.jaridenv.2024.105174' };

/** Uadis de la región de Tamanrasset, en el Ahaggar. No es un inventario del
 *  Tassili n’Ajjer. */
const UADIS_TAMANRASSET = { label: 'Ecologia mediterranea 38(2):67-80 — Plant communities in the Tamanrasset region, Ahaggar, Algeria', url: 'https://doi.org/10.3406/ecmed.2012.1317' };

/** Síntesis de la flora de Chad. Lo que aporta a esta ficha es el Tibesti, y
 *  por compilación bibliográfica, no por muestreo nuevo: del Yebel Uweinat no
 *  habla. */
const FLORA_CHAD = { label: 'PhytoKeys 23:1-18 — The Flora of Chad: a checklist and brief analysis', url: 'https://doi.org/10.3897/phytokeys.23.4752' };

/** Seis uadis del parque nacional del Gebel Elba, extremo sur del desierto
 *  oriental egipcio. No cubre el desierto oriental entero. */
const GEBEL_ELBA = { label: 'Turkish Journal of Botany 30(2):121-136 — Floristic Diversity and Phytogeography of the Gebel Elba National Park, South-East Egypt', url: 'https://journals.tubitak.gov.tr/botany/vol30/iss2/6/' };

/**
 * Prácticas agro-silvo-pastoriles de 188 familias de la wilaya de Djelfa, en
 * el Atlas sahariano. No cubre el Suf, el Mzab ni los sectores libio y egipcio.
 *
 * La entrega citaba el handle del repositorio de Lieja, que es el host. La
 * publicación es Cybergeo —revista del CNRS, revisada por pares— y la cita va
 * por su DOI. El repositorio igual sirvió: de ahí salió el DOI, y tiene el
 * postprint del editor, que es lo que permitió leerla cuando el sitio de la
 * revista respondió con una verificación anti-bot.
 */
const DJELFA_PASTORAL = { label: 'Cybergeo: Revue Européenne de Géographie 863 — L\'amplification de la désertification par les pratiques agro-sylvopastorales dans les hautes plaines steppiques algériennes : les modes d\'habiter de la Wilaya de Djelfa', url: 'https://doi.org/10.4000/cybergeo.29257' };

export const BIOMAS_REGIONALES_NORTE_AFRICA: Record<string, BiomaFicha> = {
  // MA DZ TN LY · ECO_ID 798 · el bosque mediterráneo del Magreb
  magreb_bosque_mediterraneo: {
    id: 'magreb_bosque_mediterraneo',
    nombre: 'Bosque mediterráneo del Magreb',
    emoji: '🌳',
    color: '#5F7A4B',
    resumen: 'La franja húmeda del norte del Magreb: el Rif, la Cabilia, el Tell y el Cabo Bon, con 500 a 1.200 mm de lluvia invernal. Es la contracara africana del bosque mediterráneo ibérico, con las mismas especies y una historia de uso mucho más intensa.',
    vegetacion: 'Alcornocal y encinar denso, con quejigo, acebuche, lentisco, brezo y madroño; en la Cabilia aparecen manchas de roble zeen y de abeto numídico, endémico del norte de Argelia. Un inventario de los pastizales forestales del norte marroquí registró 358 taxones de 228 géneros y 66 familias, con dominio de Asteraceae, Fabaceae, Poaceae y Lamiaceae y casi la mitad de la flora —el 48,3 %— en terófitas: anuales que cumplen el ciclo entre las lluvias. De los 95 taxones cuya palatabilidad conocían los pastores, 32 cayeron en el grupo muy apetecido, y el 93 % de los taxones evaluados se consideró fuente potencial de forraje; la disponibilidad depende de la estación y el valor más alto medido fue de 3.143 kg de materia seca por hectárea en primavera. El dato dice que esto no es sólo monte: es pastizal bajo monte, y lo que lo sostiene son anuales que no figuran en ninguna lista de leñosas.',
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
    cultivos: ['olivo', 'vid', 'trigo', 'higuera', 'almendro', 'alcornoque', 'encina', 'algarrobo_es', 'garbanzo'],
    fuentes: [ATLAS_AFRICA, HWSD, RESOLVE, MAGREB_PASTIZAL],
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
    cultivos: ['cebada', 'trigo', 'lenteja', 'garbanzo', 'olivo', 'pistacho', 'alfalfa'],
    aptitud: [
      { uso: 'pasturas', delta: -15, razon: 'La mata de esparto y el suelo son la misma cosa: el macollo frena el viento y hace montículo fértil a su pie. Arrancarlo deja la costra caliza al descubierto y eso no se revierte con descanso: hay que replantar la mata.' },
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
    vegetacion: 'Cedral de Cedrus atlantica con encina y quejigo, pinar de pino carrasco y pino salgareño, y enebral en la cota superior. El cedral del Atlas Medio es el bosque de mayor valor de conservación del norte de África. Un estudio dendrocronológico en el cedral de Ifrane-Azrou, sobre 32 cedros de cuatro parcelas de 0,13 hectáreas entre 1.830 y 1.890 metros, fechó la caída del crecimiento a comienzos de los años ochenta, sobre sequías registradas en 1993, 1995 y 1999 y una tendencia de calentamiento que arranca en los setenta. Lo que no se esperaba: entre las variables de estructura del rodal, la que más se asocia al declive del cedro es el área basal de la encina —entre las del árbol, el crecimiento previo y la edad—, y la competencia más fuerte se midió justo en los rodales de cedro más densos, cerca de 1.100 árboles por hectárea. Los autores lo leen como un cambio de dominancia en curso hacia la encina, que tolera mejor la sequía: el cedral no se está muriendo hacia pelado sino hacia otro bosque.',
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
    cultivos: ['nogal', 'manzano', 'damasco', 'trigo', 'cebada', 'papa', 'alfalfa'],
    fuentes: [ATLAS_AFRICA, SOILGRIDS, HWSD, RESOLVE, CEDRO_ATLAS_MEDIO],
  },

  // MA · ECO_ID 758 · el enebral de altura del Alto Atlas
  alto_atlas_enebro: {
    id: 'alto_atlas_enebro',
    nombre: 'Enebral de altura del Alto Atlas',
    emoji: '🌿',
    color: '#6E7A55',
    resumen: 'El piso por encima del cedral en el Alto Atlas marroquí, de 2.400 metros al Toubkal: enebro turífero disperso, pastizal almohadillado y nieve estacional. El agua de todo el Sus y del Draa nace acá.',
    vegetacion: 'Enebro turífero de porte achaparrado y edad de siglos, con matorral almohadillado espinoso de Alyssum, Bupleurum y Erinacea que es la forma que toma la vegetación cuando el viento y el diente no dejan crecer nada más alto. Una cartografía del enebro turífero en el Alto Atlas de Azilal, hecha sobre imagen Landsat 8 con modelo de elevación de 30 metros, clima de WorldClim y mapa geológico digitalizado, lo ubicó en cuatro zonas biogeográficas —Ait Bouguemez, Zaouit Ahansal, Anergui y Tifirt N\'ait Hamza— entre 1.600 y 3.400 metros, sobre todo en laderas de orientación norte y oeste, pendientes de moderadas a fuertes, litología de caliza, caliza margosa y arenisca, y los climas semiárido y subhúmedo de frío a muy frío. Y agrega una distinción que al diseñar importa: sólo en algunas de esas zonas quedan rodales bien conservados, así que la superficie que la especie ocupa es mayor que la que mantiene en buen estado.',
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
    cultivos: ['cebada', 'nogal', 'manzano', 'damasco', 'papa', 'alfalfa'],
    aptitud: [
      { uso: 'pasturas', delta: 0, razon: 'El pastizal de altura aguanta donde se mantiene el agdal —el cierre estacional que decide la asamblea del pueblo— y se pela hasta la roca donde se rompió. La variable acá es institucional, no técnica.' },
      { uso: 'reserva', delta: 10, razon: 'El horizonte orgánico sobre caliza y cuarcita es delgado y el pisoteo lo levanta en una temporada.' },
    ],
    fuentes: [ATLAS_AFRICA, SOILGRIDS, RESOLVE, ENEBRO_AZILAL],
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
    suelos: 'Fluvisoles y Vertisoles arcillosos profundos sobre limo basáltico etíope, entre los suelos agrícolas más fértiles que existen. Los tres problemas de hoy son consecuencia del mismo cambio: sin la crecida anual, no llega limo nuevo y la fertilidad depende enteramente del fertilizante; el riego permanente sin lámina de lavado suficiente saliniza el norte del delta, donde la freática salina está a un metro; y sin aporte de sedimento la costa retrocede y el mar entra. Encima, el ladrillo cocido con la propia arcilla de las mejores parcelas se comió decenas de miles de hectáreas de suelo de primera. Un relevamiento del sector oriental del delta, con 34 perfiles descritos, lo partió en dos zonas de manejo que son las dos salinas y se diferencian en grado: una, el 45,04 % de la superficie, con conductividad eléctrica media de 20,32 dS/m, relación de adsorción de sodio 47,19, sodio intercambiable 32,85 % y densidad aparente 1,47 Mg/m³; la otra, el 54,96 %, con 12,30 dS/m, 26,6, 26,6 % y 1,27 Mg/m³, y pH de 7,75 contra 8,31. La lectura útil no es el promedio sino el contraste: en la misma vuelta de delta la sal y la compactación cambian al doble, así que la lámina de lavado y el drenaje se dimensionan por zona y no por región.',
    saberes: [],
    especies: [
      'Palmera datilera (Phoenix dactylifera)',
      'Papiro (Cyperus papyrus)',
      'Trébol de Alejandría (Trifolium alexandrinum)',
      'Tamarisco (Tamarix nilotica)',
      'Sicomoro (Ficus sycomorus)',
    ],
    cultivos: ['arroz', 'algodon', 'trigo', 'cebolla', 'naranjo', 'datilera', 'sesamo', 'berseem'],
    aptitud: [
      { uso: 'huerta', delta: 15, razon: 'Vertisoles y fluvisoles profundos sobre limo etíope, entre los mejores suelos agrícolas que existen. El castigo del bioma desierto describe la meseta, no el delta.' },
      { uso: 'reserva', delta: 0, razon: 'Acá no hay costra biológica de desierto que cuidar. Lo que sí hay que cuidar es la lámina de lavado: en el norte del delta la freática salina está a un metro.' },
    ],
    fuentes: [ATLAS_AFRICA, HWSD, WRB, RESOLVE, DELTA_SALES],
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
    suelos: 'Solonchaks y Gypsisoles con costra salina superficial y freática somera. La regla es que todo lo que se riega en la cuenca termina acá, y el agua de drenaje llega concentrada: cualquier expansión de riego aguas arriba se lee después en el chott. En el borde, el sistema del ghout de El Oued —el hoyo excavado hasta cerca de la freática, con la palmera plantada en el fondo y sin regar nunca— es la respuesta tradicional a este paisaje y funciona sólo mientras el nivel freático no suba: cuando el drenaje urbano lo elevó, los ghouts se ahogaron. Una serie de nueve imágenes Landsat 8 y 9 entre 2014 y 2022 sobre el Chott Melrhir y el Chott Merouane confirma lo que el paisaje insinúa y ordena el calendario: están secos la mayor parte del tiempo y se llenan en los períodos de lluvia, con la superficie de agua cambiando de un año al otro. Acá no hay una cota de espejo con la que diseñar: hay una probabilidad de que el fondo esté inundado.',
    saberes: [],
    especies: [
      'Palmera datilera (Phoenix dactylifera)',
      'Halocnemum strobilaceum',
      'Arthrocnemum macrostachyum',
      'Tamarisco (Tamarix gallica)',
      'Suaeda fruticosa',
    ],
    aptitud: [
      { uso: 'pasturas', delta: -25, razon: 'La costra del chott no es pastizal inundable: es sal. Lo que crece son halófitas que el ganado apenas toca, y el pisoteo del borde húmedo rompe la costra y activa la deflación.' },
      { uso: 'forestal', delta: -25, razon: 'Con freática salina somera el árbol se cierra por sodio antes que por sequía. La excepción es el tamarisco de borde, que es cortina, no plantación.' },
    ],
    fuentes: [GIAHS, ATLAS_AFRICA, WRB, RESOLVE, CHOTT_MELRHIR],
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
    suelos: 'Calcisoles y Gypsisoles con costra, y en el oasis un suelo enteramente construido: arena, estiércol y restos de palma acumulados durante siglos hasta formar un perfil que no existía. Esa es la técnica central de la región y la más transferible. El agua llega por foggara o khettara —galería de captación con pendiente suave que trae el agua del piedemonte por gravedad— y se reparte con el peine de distribución, que divide el caudal en partes proporcionales fijas y visibles. El sistema falla por dos vías: pozos profundos que bajan el nivel y secan la galería, y abandono del desarenado anual, que la colmata. Un estudio de 188 familias de la wilaya de Djelfa, en el Atlas sahariano, con observación de campo, encuesta y análisis estadístico, agrega dos mecanismos que no son los de la galería. El primero da vuelta una conclusión fácil: los hogares de los cuatro medios relevados —forestal, de matorral, estepario, y de duna y chott— suplementan la alimentación del rebaño, y el efecto de eso no es aliviar el pastizal sino agrandar el rebaño, con lo cual el sobrepastoreo aumenta. El segundo es el agua: el abastecimiento ya no es el tradicional, una parte sobreexplota el acuífero de abajo y la mayoría compra agua de camión cisterna. Y los autores encuentran que la capacidad de adaptar el modo de habitar depende del capital del hogar, que es lo que permite suplir las faltas locales, mientras el conjunto de esas prácticas acentúa la desertificación.',
    saberes: [],
    especies: [
      'Palmera datilera (Phoenix dactylifera)',
      'Azufaifo (Ziziphus lotus)',
      'Retama (Retama raetam)',
      'Granado (Punica granatum)',
      'Anabasis articulata',
    ],
    cultivos: ['datilera', 'cebada', 'granado', 'higuera', 'olivo', 'cebolla', 'alfalfa'],
    fuentes: [GIAHS, ATLAS_AFRICA, HWSD, RESOLVE, DJELFA_PASTORAL],
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
    suelos: 'Arenosoles en el erg y Leptosoles de pavimento en la hamada y el reg. Sin materia orgánica y sin capacidad de retención salvo en profundidad. La agricultura que existe es enteramente de agua importada del subsuelo o del uadi; el diseño acá se juega en dos cosas: cortaviento vivo para evitar el enterramiento por arena móvil, y elección de una lámina de riego que no acumule sal, porque no hay lluvia que lave. Y hay que tener cuidado con las cifras de avance de duna. Un trabajo que midió desplazamiento con correlación de imágenes sobre el archivo Landsat obtuvo velocidades medias de 15,83 metros por año, pero en la depresión de Bodelé, en Chad; al aplicar el mismo flujo al Gran Erg Oriental los resultados salieron tan variables que no se pudo determinar la migración, porque los puntos de control del procesamiento de Landsat caen sobre crestas de duna, que se mueven, y eso deforma la escena. Lo que queda para el diseño es metodológico: en este erg el avance de arena hay que medirlo con puntos de control sobre roca, y mientras no esté medido el cortaviento se dimensiona por el lado seguro.',
    saberes: [],
    especies: [
      'Acacia (Vachellia raddiana)',
      'Calotropis (Calotropis procera)',
      'Panicum turgidum',
      'Aristida pungens',
      'Tamarisco (Tamarix aphylla)',
    ],
    fuentes: [ATLAS_AFRICA, HWSD, RESOLVE, DUNAS_COSI_CORR],
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
    suelos: 'Leptosoles calcáreos y Arenosoles, con Solonchaks en el fondo de las depresiones. La tensión central es del agua: el acuífero de Nubia, fósil, se recargó en un período húmedo hace miles de años y no se recarga hoy. Los manantiales artesianos de Siwa perdieron presión con la perforación masiva y el excedente sin drenaje formó lagos salinos que están comiéndose el palmeral desde abajo. Es un caso donde el problema no es la falta de agua sino la falta de salida para el agua usada. En el oasis de Dajla, 55 perfiles excavados hasta 150 centímetros o hasta la roca, con 211 muestras tomadas en octubre de 2019, dan la medida de la variación: la conductividad eléctrica va de 2,3 a 165,8 dS/m con una media de 27,1, el sodio intercambiable de 2,3 a 34,6 % con media de 15,6 y la grava de 0 a 12,4 %. Con ese rango la media no describe nada, y de hecho las variables que separan la tierra buena de la mala en el análisis no son las de sal sino la profundidad, la grava y la fracción arena. Entre el 70 y el 85 % de la superficie quedó como apta con limitaciones leves a moderadas y entre el 20 y el 30 % con limitaciones altas a severas, según el juego de indicadores. Un detalle que explica el resto: en este clima no hay meteorización que forme arcilla, así que el carbonato aparece en tamaño arena, con cuarzo y calcita dominando la fracción liviana.',
    saberes: [],
    especies: [
      'Palmera datilera (Phoenix dactylifera)',
      'Olivo (Olea europaea)',
      'Tamarisco (Tamarix nilotica)',
      'Alhagi graecorum',
      'Zygophyllum album',
    ],
    fuentes: [GIAHS, ATLAS_AFRICA, HWSD, RESOLVE, DAJLA_CALIDAD],
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
    suelos: 'Regosoles y Arenosoles de reg y erg, prácticamente sin desarrollo. La vida útil del paisaje está en el uadi y en el pastoreo nómada de camello que lo aprovecha en pulsos. El daño que se acumula acá es el de pista y vehículo: la huella rompe el pavimento y libera el fino, y en un régimen sin lluvia que reconstituya nada esa marca queda por décadas. Sobre el mar de arena de Ubari, en el Fezzán libio —61.000 km² de dunas longitudinales orientadas suroeste-noreste que pasan de los 200 metros de altura—, comparar Landsat contra WorldView-2 mostró que la resolución gruesa alcanza para mapear el patrón de crestas e interdunas y su orientación, pero no detecta las dunas chicas ni las superpuestas. Y los autores dejan dicho lo que más importa acá: no pudieron verificar nada en el terreno porque la zona es inaccesible. Todo lo que se afirma de este sector sale de imágenes, y conviene saberlo antes de apoyar una decisión en eso.',
    saberes: [],
    especies: [
      'Acacia (Vachellia tortilis subsp. raddiana)',
      'Panicum turgidum',
      'Aristida pungens',
      'Cornulaca monacantha',
      'Balanites (Balanites aegyptiaca)',
    ],
    cultivos: ['mijo', 'sorgo', 'caupi', 'sesamo', 'datilera', 'acacia_goma', 'moringa'],
    fuentes: [ATLAS_AFRICA, HWSD, RESOLVE, UBARI_DUNAS],
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
    suelos: 'Regosoles y Arenosoles calcáreos, con una costra superficial de líquenes y cianobacterias que es lo que estabiliza la arena y capta la humedad de la niebla. Esa costra es el activo del sistema y lo que se pierde primero: el paso de vehículos y el pastoreo intensivo la rompen y el suelo pasa de fijo a móvil. La captación de niebla con malla es la técnica que mejor se adapta acá y funciona por la misma razón que el liquen, y el sistema operativo más grande del mundo está justo en este litoral: el de Sidi Ifni, que en un registro de cuatro años dio promedios anuales de 1,6 litros por metro cuadrado y día en 2020, 6,0 en 2021 y 3,9 en 2022, con picos mensuales promedio de 8,5 en marzo y abril, 7,6 en junio y un máximo de 21 en abril de 2021. Dos cosas de ese registro cambian el diseño. La primera es que la estimación inicial del proyecto —7 litros por metro cuadrado y día, sacados de un solo año de medición en 2007— quedó por encima de los tres años medidos después: dimensionar con un año de datos sobreestimó el recurso, y la variabilidad entre años es de casi cuatro veces. La segunda es dónde se cosecha: la malla no está en la playa sino en el monte Boutemzguida, a 1.225 metros y a 35 kilómetros de la costa, mientras la ciudad de Ifni está a 60 metros. La niebla se capta donde el relieve la intercepta, no donde se la ve. La misma evaluación avisa que el agua de niebla resolvió la bebida y no el resto: sigue habiendo contaminación de la freática por falta de saneamiento y mal manejo de los residuos sólidos.',
    saberes: [],
    especies: [
      'Argán (Argania spinosa)',
      'Euphorbia echinus',
      'Acacia (Vachellia raddiana)',
      'Zygophyllum gaetulum',
      'Launaea arborescens',
    ],
    cultivos: ['datilera', 'cebolla', 'moringa', 'alfalfa'],
    fuentes: [ATLAS_AFRICA, HWSD, RESOLVE, NIEBLA_SIDI_IFNI],
  },

  // DZ LY · ECO_ID 846 · Ahaggar y Tassili
  ahaggar_tassili: {
    id: 'ahaggar_tassili',
    nombre: 'Macizos del Ahaggar y el Tassili',
    emoji: '⛰️',
    color: '#8B8360',
    resumen: 'Los macizos volcánicos y de arenisca del sur de Argelia, con el Tahat por encima de los 2.900 metros. Islas de altura en pleno Sahara: más lluvia, menos calor, y refugios de especies que quedaron aisladas cuando el desierto se cerró alrededor. En sus paredes está el arte rupestre que documenta el Sahara verde.',
    vegetacion: 'Bosquetes relictos de ciprés del Tassili —quedan unas pocas decenas de árboles, todos viejos, de una especie que no existe en ningún otro lado—, olivo de Laperrine, mirto sahariano y acacia en los uadis. Un relevamiento de los uadis alrededor de Tamanrasset identificó seis asociaciones vegetales y ordena la variación por dos gradientes: la altitud y el sustrato del lecho, que va de rocoso a gravoso a arena profunda. Dos de las seis eran nuevas: la de Rhus tripartita con olivo de Laperrine en los uadis rocosos, y la de Acacia raddiana con Salvadora persica en los lechos anchos de arena compacta. De las otras cuatro, la de Cassia aschrek con Panicum turgidum va sobre arena con grava, la de Leptadenia pyrotechnica con Chrozophora brocchiana aguanta de arenoso-limoso a arenoso-gravoso, la de Tamarix aphylla con Farsetia ramosissima ocupa los uadis arenosos anchos, y la de Tamarix gallica con Desmostachya bipinnata es la de los uadis donde el agua está cerca de la superficie. Esa última es la más útil para leer un terreno: la planta dice dónde buscar.',
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
    cultivos: ['trigo', 'cebada', 'datilera', 'higuera', 'granado', 'cebolla', 'alfalfa'],
    fuentes: [ATLAS_AFRICA, HWSD, RESOLVE, UADIS_TAMANRASSET],
  },

  // LY EG · ECO_ID 844 · Uweinat y Tibesti
  uweinat_tibesti: {
    id: 'uweinat_tibesti',
    nombre: 'Macizos de Uweinat y Tibesti',
    emoji: '🪨',
    color: '#8E8768',
    resumen: 'Los macizos del Sahara central-oriental: el Yebel Uweinat, en el punto donde se tocan Egipto, Libia y Sudán, y el Tibesti al sur. Como el Ahaggar, son islas de altura con lluvia ocasional y refugios biológicos, pero mucho más aisladas y menos habitadas.',
    vegetacion: 'Vegetación de uadi con acacia y Salvadora, matorral disperso en las laderas y comunidades relictas en las gargantas donde persiste algo de humedad. La cobertura total es mínima incluso para el Sahara. El Tibesti llega a 3.415 metros —es el macizo más alto del Sahara—, cubre unos 50.000 km² y tiene una altitud media por encima de los 2.000 metros, y la síntesis de la flora de Chad describe su vegetación saharomontana como florísticamente rica y sin relación con la de las tierras bajas de alrededor, con la vegetación leñosa concentrada en algunas gargantas profundas. O sea: el refugio no es la ladera, es la garganta. De registros florísticos del macizo, ese inventario recoge 121 de la expedición de Corti de 1942, 374 de Maire y Monod de 1950 y 136 de Scholz de 1966, y cita una estimación previa de unas 450 especies para el Tibesti, con elementos mediterráneos, saharianos, sahelianos y afromontanos mezclados.',
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
    cultivos: ['datilera', 'mijo', 'cebada', 'alfalfa'],
    fuentes: [ATLAS_AFRICA, HWSD, RESOLVE, FLORA_CHAD],
  },

  // EG · ECO_ID 836 · el desierto costero del mar Rojo
  mar_rojo_costa_desierto: {
    id: 'mar_rojo_costa_desierto',
    nombre: 'Desierto costero del mar Rojo',
    emoji: '⛰️',
    color: '#9C9068',
    resumen: 'La franja entre el Nilo y el mar Rojo: el desierto oriental egipcio, las montañas del mar Rojo y el Gebel Elba en el extremo sur. Casi sin lluvia salvo tormentas violentas y esporádicas que bajan por los uadis, y una franja sur donde la niebla marina sostiene una vegetación sorprendentemente rica.',
    vegetacion: 'Acacia, Balanites y Salvadora en los uadis, matorral ralo en la montaña, y en el Gebel Elba una comunidad de nieblas con especies afrotropicales que no aparecen en ningún otro punto de Egipto. Cinco expediciones entre 1998 y 2004 a seis uadis del parque nacional del Gebel Elba —35.600 km²— registraron 179 especies de 51 familias, con Compositae 12 %, Leguminosae 9 % y Gramineae 6,7 % a la cabeza y predominio de terófitas, la firma de una flora desértica. La mitad de esa flora es local en sentido estricto: 92 especies, el 51,4 %, aparecieron sólo en un uadi o en un grupo de uadis, así que relevar uno no describe el de al lado. Entre los elementos fitogeográficos manda el saharo-arábigo con el 48 %, seguido del sudano-zambeziano con el 19,6 % y del mediterráneo con el 14 %, y es ese componente sudano-zambeziano el que hace del Elba una continuación del trópico sudanés. El hallazgo que contradice la intuición está en el gradiente de altitud del uadi Yahameib: la mayor diversidad no está arriba, en la franja de niebla, sino a media ladera.',
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
    cultivos: ['datilera', 'sesamo', 'cebolla', 'moringa', 'alfalfa'],
    fuentes: [ATLAS_AFRICA, HWSD, RESOLVE, GEBEL_ELBA],
  },
};
