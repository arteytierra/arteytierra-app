/**
 * Fichas regionales de Europa occidental.
 *
 * ARCHIVO GENERADO desde _research/ecosistemas-saberes-europa-occidental/
 * fase-1-ecologia/fichas-ecologicas-propuestas.json. No editar a mano.
 *
 * Cubren el hueco que dejaban las cuatro fichas europeas viejas: la llanura
 * atlántica del noroeste, el templado occidental, el Cantábrico-atlántico
 * ibérico, la campiña calcárea inglesa, las turberas atlánticas del norte, el
 * pinar caledonio, el montano ibérico y el semiárido del sureste peninsular.
 *
 * `saberes` va vacío por la misma razón que en las americanas: la capa
 * territorial es fase 2 y vive en `lib/saberes.ts`.
 */

import type { BiomaFicha } from './biomaTipos';

export const BIOMAS_REGIONALES_EUROPA: Record<string, BiomaFicha> = {
  // FR, BE, NL, LU · confianza alta
  atlantico_llanura_noroeste: {
    id: 'atlantico_llanura_noroeste',
    nombre: 'Llanura atlantica del noroeste europeo',
    emoji: '🌾',
    color: '#6E8A5E',
    resumen: 'Llanuras y colinas bajas del oeste de Francia, Belgica, Paises Bajos y el sur de Luxemburgo, con inviernos suaves, lluvia repartida y viento persistente del oeste. Es la matriz agricola mas transformada de Europa occidental: casi todo el bosque original es hoy cultivo, pastura, bocage o plantacion.',
    vegetacion: 'Roble comun, roble albar, carpe, fresno y aliso quedan en bosquetes, setos y riberas; sobre arenas pobres aparecen brezales de Calluna y pinares plantados.',
    fauna: 'Corzo, liebre europea, zorro, tejon y aves de seto y de pradera humeda dependen casi por completo de bordes, canales y humedales remanentes.',
    suelos: 'Luvisoles y Cambisoles fertiles sobre loess conviven con Podzoles arenosos muy pobres y con Gleysoles y suelos de polder al nivel del mar. El riesgo dominante no es la sequia sino el encharcamiento invernal, la compactacion por maquinaria y la erosion laminar en loess; cubierta viva, setos sobre talud y drenaje vegetado son mas utiles que la zanja profunda.',
    saberes: [],
    especies: [
      'Roble comun (Quercus robur)',
      'Carpe europeo (Carpinus betulus)',
      'Fresno comun (Fraxinus excelsior)',
      'Aliso negro (Alnus glutinosa)',
      'Brezo comun (Calluna vulgaris)',
    ],
    fuentes: [
      { label: 'EEA - Biogeographical regions in Europe', url: 'https://www.eea.europa.eu/en/analysis/maps-and-charts/biogeographical-regions-in-europe-2' },
      { label: 'EEA - EUNIS habitat classification', url: 'https://www.eea.europa.eu/en/datahub/datahubitem-view/638330ea-90e6-4e41-81ea-e70f25ae7117' },
      { label: 'JRC ESDAC - European Soil Data Centre', url: 'https://esdac.jrc.ec.europa.eu/' },
    ],
  },

  // FR, BE, LU, CH, DE · confianza alta
  templado_occidental_europeo: {
    id: 'templado_occidental_europeo',
    nombre: 'Bosque templado de Europa occidental',
    emoji: '🍂',
    color: '#5F7248',
    resumen: 'Bosques caducifolios de media montana y colina del este de Francia, las Ardenas, Luxemburgo, el Jura y la meseta suiza. Tiene mas relieve, inviernos mas frios y mas bosque en pie que la llanura atlantica, y la ganaderia de pastura permanente pesa tanto como el cultivo.',
    vegetacion: 'Haya europea y roble albar dominan segun altitud y sustrato, con carpe, arce, tilo y abeto blanco en las cotas altas y umbrias.',
    fauna: 'Ciervo, corzo, jabali, gato montes, lince boreal reintroducido y picamaderos negro usan mosaicos de bosque maduro y claros.',
    suelos: 'Cambisoles y Luvisoles sobre calizas, areniscas y esquistos, con Leptosoles someros en crestas. En pendiente la erosion y el deslizamiento superficial son el riesgo real: conviene mantener cobertura permanente, fajas lenosas a favor de curva de nivel y caminos con desague frecuente.',
    saberes: [],
    especies: [
      'Haya europea (Fagus sylvatica)',
      'Roble albar (Quercus petraea)',
      'Abeto blanco (Abies alba)',
      'Arce sicomoro (Acer pseudoplatanus)',
      'Serbal de cazadores (Sorbus aucuparia)',
    ],
    fuentes: [
      { label: 'EEA - Biogeographical regions in Europe', url: 'https://www.eea.europa.eu/en/analysis/maps-and-charts/biogeographical-regions-in-europe-2' },
      { label: 'EEA - EUNIS habitat classification', url: 'https://www.eea.europa.eu/en/datahub/datahubitem-view/638330ea-90e6-4e41-81ea-e70f25ae7117' },
      { label: 'FAO - Agroforestry in central, northern and eastern Europe', url: 'https://www.fao.org/4/y1935e/y1935e03.pdf' },
    ],
  },

  // ES, PT, FR · confianza alta
  cantabrico_atlantico_iberico: {
    id: 'cantabrico_atlantico_iberico',
    nombre: 'Atlantico cantabrico e iberico noroccidental',
    emoji: '🌰',
    color: '#4C7A5A',
    resumen: 'Franja lluviosa del norte y noroeste iberico: Galicia, Asturias, Cantabria, Pais Vasco, el norte de Portugal y las Landas francesas. Recibe entre 1000 y mas de 2000 mm al ano, no tiene verano seco marcado y su paisaje es de minifundio, souto, prado de siega y plantacion forestal.',
    vegetacion: 'Carballo, rebollo, castano, abedul, laurel y acebo forman bosque y souto; el eucalipto y el pino radiata ocupan hoy gran parte de la superficie productiva, y el tojo y el brezo dominan los montes degradados.',
    fauna: 'Corzo, jabali, lobo iberico, nutria y el oso pardo cantabrico en los macizos dependen de la continuidad de bosque y ribera.',
    suelos: 'Cambisoles humicos y Umbrisoles acidos, ricos en materia organica pero de pH bajo y con aluminio disponible. La lluvia intensa sobre pendiente corta erosiona rapido tras corta o incendio; el encalado, la cobertura continua y las fajas de ribera pesan mas que el riego.',
    saberes: [],
    especies: [
      'Carballo (Quercus robur)',
      'Rebollo (Quercus pyrenaica)',
      'Castano (Castanea sativa)',
      'Abedul (Betula alba)',
      'Tojo (Ulex europaeus)',
    ],
    fuentes: [
      { label: 'EEA - Biogeographical regions in Europe', url: 'https://www.eea.europa.eu/en/analysis/maps-and-charts/biogeographical-regions-in-europe-2' },
      { label: 'JRC ESDAC - European Soil Data Centre', url: 'https://esdac.jrc.ec.europa.eu/' },
      { label: 'MITECO - Mapa Forestal de Espana', url: 'https://www.miteco.gob.es/es/biodiversidad/servicios/banco-datos-naturaleza/informacion-disponible/mfe50.html' },
    ],
  },

  // GB · confianza alta
  campina_calcarea_inglesa: {
    id: 'campina_calcarea_inglesa',
    nombre: 'Campina calcarea del sureste ingles',
    emoji: '🐑',
    color: '#8A9A6B',
    resumen: 'Colinas de creta y caliza del sureste de Inglaterra: Chilterns, North y South Downs, Kent y las llanuras cerealeras vecinas. Es la esquina mas seca y calida del Reino Unido, con 550 a 750 mm al ano, y un paisaje historico de hayedo sobre creta, downland pastoreado y setos de campo cerrado.',
    vegetacion: 'Haya y fresno sobre creta, roble en los suelos arcillosos, tejo en las laderas, y pastizal calcareo con orquideas donde el pastoreo se mantuvo.',
    fauna: 'Corzo, gamo, tejon, milano real reintroducido y una fauna de mariposas de pastizal calcareo excepcionalmente rica.',
    suelos: 'Rendzinas y Leptosoles muy someros sobre creta fisurada, alternando con Luvisoles arcillosos en los valles. La creta drena tan rapido que el agua desaparece del perfil: aca la retencion se juega en materia organica y sombra, no en zanjas, y una represa sobre creta rara vez sostiene lamina.',
    saberes: [],
    especies: [
      'Haya europea (Fagus sylvatica)',
      'Fresno comun (Fraxinus excelsior)',
      'Tejo (Taxus baccata)',
      'Espino albar (Crataegus monogyna)',
      'Viburno lantana (Viburnum lantana)',
    ],
    fuentes: [
      { label: 'JNCC - UK BAP priority habitats', url: 'https://jncc.gov.uk/our-work/uk-bap-priority-habitats/' },
      { label: 'Natural England - National Character Area profiles', url: 'https://www.gov.uk/government/publications/national-character-area-profiles-data-for-local-decision-making' },
      { label: 'EEA - Biogeographical regions in Europe', url: 'https://www.eea.europa.eu/en/analysis/maps-and-charts/biogeographical-regions-in-europe-2' },
    ],
  },

  // GB, IE · confianza alta
  atlantico_norte_turberas: {
    id: 'atlantico_norte_turberas',
    nombre: 'Borde atlantico norte: turbera, machair y viento',
    emoji: '🌬️',
    color: '#6B8080',
    resumen: 'Islas y costas expuestas del Atlantico norte: Orcadas, Shetland, Hebridas Exteriores y el noroeste de Donegal. Practicamente sin arbolado por viento y salinidad, con turbera de manto sobre casi toda la superficie y una franja de machair calcareo de conchilla sobre la costa oeste.',
    vegetacion: 'Brezal de Calluna y Erica, herbazales de Molinia y Eriophorum sobre turbera, y pastizal de machair muy florido sobre arena de conchilla; el arbol solo prospera en abrigos y hondonadas.',
    fauna: 'Colonias de aves marinas, limicolas nidificantes, nutria costera y focas definen el valor ecologico de la region.',
    suelos: 'Histosoles de turbera acida, encharcada y de muy baja capacidad portante, junto a Arenosoles calcareos de machair. La regla dominante es que la turbera no se drena: drenarla libera carbono, hunde la cota y no mejora la pastura de forma estable. El diseno se juega en cortavientos, carga ganadera y respeto del machair.',
    saberes: [],
    especies: [
      'Brezo comun (Calluna vulgaris)',
      'Brezo cuadrangular (Erica tetralix)',
      'Algodon de turbera (Eriophorum angustifolium)',
      'Molinia (Molinia caerulea)',
      'Esfagno (Sphagnum spp.)',
    ],
    fuentes: [
      { label: 'JNCC - UK BAP priority habitats', url: 'https://jncc.gov.uk/our-work/uk-bap-priority-habitats/' },
      { label: 'IUCN UK Peatland Programme', url: 'https://www.iucn-uk-peatlandprogramme.org/' },
      { label: 'EEA - Biogeographical regions in Europe', url: 'https://www.eea.europa.eu/en/analysis/maps-and-charts/biogeographical-regions-in-europe-2' },
    ],
  },

  // GB · confianza alta
  pinar_caledonio: {
    id: 'pinar_caledonio',
    nombre: 'Pinar caledonio y paramo escoces',
    emoji: '🌲',
    color: '#47664F',
    resumen: 'Tierras altas de Escocia, con los relictos de pinar caledonio de los Cairngorms y Strathspey rodeados de paramo de brezo, turbera y pastizal de montana. Frio, ventoso y muy lluvioso al oeste, con suelos pobres y una historia larga de deforestacion y pastoreo intenso.',
    vegetacion: 'Pino silvestre de la variedad escocesa con abedul, enebro, serbal y sotobosque de arandano y brezo; por encima del limite forestal, pastizal y matorral alpino.',
    fauna: 'Ciervo rojo, urogallo, lagopodo escoces, ardilla roja y aguila real; la altisima carga de ciervo es el principal obstaculo para que el bosque se regenere solo.',
    suelos: 'Podzoles muy acidos con horizonte de hierro y turberas de manto en las planicies altas. La regeneracion natural depende menos del suelo que del cercado frente al ramoneo; el drenaje historico de turbera es un pasivo a revertir, no un modelo a repetir.',
    saberes: [],
    especies: [
      'Pino silvestre escoces (Pinus sylvestris var. scotica)',
      'Abedul pubescente (Betula pubescens)',
      'Enebro comun (Juniperus communis)',
      'Serbal de cazadores (Sorbus aucuparia)',
      'Arandano (Vaccinium myrtillus)',
    ],
    fuentes: [
      { label: 'JNCC - Habitats Directive H91C0 Caledonian forest', url: 'https://sac.jncc.gov.uk/habitat/H91C0/' },
      { label: 'JNCC - UK BAP priority habitats', url: 'https://jncc.gov.uk/our-work/uk-bap-priority-habitats/' },
      { label: 'EEA - Biogeographical regions in Europe', url: 'https://www.eea.europa.eu/en/analysis/maps-and-charts/biogeographical-regions-in-europe-2' },
    ],
  },

  // ES, PT · confianza media
  montano_iberico: {
    id: 'montano_iberico',
    nombre: 'Montana iberica',
    emoji: '⛰️',
    color: '#7A8267',
    resumen: 'Sierras interiores y perifericas de la peninsula: Sistema Central, Sistema Iberico, Serra da Estrela, Gredos y Sierra Nevada. Combina inviernos frios con nieve y veranos secos mediterraneos, un contraste que ninguna ficha de llanura describe bien.',
    vegetacion: 'Pino silvestre, pino salgareno, sabina, enebro rastrero y rebollo segun altitud y exposicion, con piornales y pastizales de alta montana por encima del bosque.',
    fauna: 'Cabra montes, corzo, buitre leonado, aguila real y una flora endemica de cumbre especialmente rica en Sierra Nevada.',
    suelos: 'Leptosoles y Cambisoles someros y pedregosos sobre granito, cuarcita o caliza, muy erosionables una vez perdida la cubierta. El agua llega concentrada en deshielo y tormenta: terrazas, acequias de careo y arbolado de ladera valen mas que el almacenamiento en fondo de valle.',
    saberes: [],
    especies: [
      'Pino silvestre (Pinus sylvestris)',
      'Pino salgareno (Pinus nigra subsp. salzmannii)',
      'Rebollo (Quercus pyrenaica)',
      'Sabina albar (Juniperus thurifera)',
      'Piorno serrano (Cytisus oromediterraneus)',
    ],
    fuentes: [
      { label: 'MITECO - Mapa Forestal de Espana', url: 'https://www.miteco.gob.es/es/biodiversidad/servicios/banco-datos-naturaleza/informacion-disponible/mfe50.html' },
      { label: 'EEA - Biogeographical regions in Europe', url: 'https://www.eea.europa.eu/en/analysis/maps-and-charts/biogeographical-regions-in-europe-2' },
      { label: 'JRC ESDAC - European Soil Data Centre', url: 'https://esdac.jrc.ec.europa.eu/' },
    ],
  },

  // ES · confianza alta
  semiarido_sureste_iberico: {
    id: 'semiarido_sureste_iberico',
    nombre: 'Semiarido del sureste iberico',
    emoji: '🏜️',
    color: '#A89055',
    resumen: 'Almeria, Cabo de Gata y las cuencas vecinas: la esquina mas seca de Europa continental, con 200 a 350 mm al ano, lluvia torrencial concentrada en pocos episodios y una evapotranspiracion potencial que multiplica varias veces la precipitacion.',
    vegetacion: 'Espartales, tomillares, azufaifar, palmito y matorral suculento; el arbolado natural es disperso y bajo.',
    fauna: 'Camaleon comun, tortuga mora, alondra ricoti, aguilucho cenizo y una fauna esteparia dependiente del espartal.',
    suelos: 'Calcisoles, Gypsisoles y Leptosoles con costra caliza o yesifera, pobres en materia organica y con infiltracion muy baja una vez sellada la superficie. Los eventos de 60 a 100 mm en pocas horas mueven el suelo entero: la captacion de escorrentia, boqueras y careo de rambla, y el manejo de costra pesan mas que cualquier eleccion de especie.',
    saberes: [],
    especies: [
      'Esparto (Macrochloa tenacissima)',
      'Azufaifo (Ziziphus lotus)',
      'Palmito (Chamaerops humilis)',
      'Tomillo (Thymus spp.)',
      'Cornical (Periploca angustifolia)',
    ],
    fuentes: [
      { label: 'UNCCD - Desertification overview', url: 'https://www.unccd.int/land-and-life/desertification/overview' },
      { label: 'MITECO - Lucha contra la desertificacion', url: 'https://www.miteco.gob.es/es/biodiversidad/temas/desertificacion-restauracion/lucha-contra-la-desertificacion.html' },
      { label: 'JRC ESDAC - European Soil Data Centre', url: 'https://esdac.jrc.ec.europa.eu/' },
    ],
  },
};
