/**
 * Análogos climáticos por clase Köppen completa — GENERADO, no editar a mano.
 *
 * Reemplaza la vieja lista de 9 reglas por prefijo (`Cs`, `Cf`, `D`…) por las
 * 21 clases que la investigación documentó una por una, cada una con sus
 * regiones, sus sistemas productivos y sus fuentes. La diferencia importa: con
 * el prefijo, un predio en Finlandia y uno en Iowa compartían "frío de altura /
 * continental" y recibían los mismos camellones andinos.
 *
 * Las clases sin ficha propia se derivan a la más parecida vía EQUIVALENTES y
 * el consumidor avisa que es una aproximación. `EF` (hielo permanente) queda
 * afuera a propósito: no hay sistema agrícola análogo que ofrecer.
 *
 * Fuente de la clasificación: Beck et al., mapas Köppen-Geiger de 1 km.
 */

import type { Fuente } from './biomaTipos';

export interface Analogo {
  /** Clase Köppen a la que corresponde la ficha (ej. 'BSk'). */
  clase: string;
  titulo: string;
  /** Regiones del mundo con el mismo clima. */
  regiones: string[];
  /** Sistemas productivos documentados para ese clima. */
  tecnicas: string[];
  fuentes: Fuente[];
}

export const ANALOGOS_KOPPEN: Record<string, Analogo> = {
  Af: {
    clase:    'Af',
    titulo:   'Ecuatorial siempre húmedo',
    regiones: [
      'Amazonia occidental',
      'Chocó biogeográfico',
      'vertiente caribeña de Costa Rica',
      'Darién panameño',
    ],
    tecnicas: [
      'chakra amazónica kichwa',
      'agroforestería multiestrato de cacao',
      'forest farming',
      'terra preta nova',
    ],
    fuentes:  [
      { label: 'FAO — The Amazonian Chakra', url: 'https://www.fao.org/giahs/giahs-around-the-world/ecuador-amazonian-chakra/giahs-biodiversity/en' },
      { label: 'USDA NRCS — Sustaining Agroforestry Systems for Farms and Ranches', url: 'https://www.nrcs.usda.gov/conservation-basics/land/forests/agroforestry-systems' },
      { label: 'Embrapa — Plant productivity enhancement in a simulated Amazonian Dark Earth', url: 'https://www.embrapa.br/en/busca-de-publicacoes/-/publicacao/1136891/plant-productivity-enhancement-in-a-simulated-amazonian-dark-earth-terra-preta-nova' },
      { label: 'Beck et al. — High-resolution 1 km Köppen-Geiger maps', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10593765/' },
    ],
  },

  Am: {
    clase:    'Am',
    titulo:   'Tropical monzónico',
    regiones: [
      'Guayanas costeras',
      'costa atlántica de Brasil tropical',
      'sur de Florida',
      'sectores monzónicos del Caribe occidental',
    ],
    tecnicas: [
      'cafetal bajo sombra',
      'agroforestería multiestrato de cacao',
      'barrera forestal cortaviento',
      'buffer forestal ribereño',
    ],
    fuentes:  [
      { label: 'USDA Climate Hubs — Increase or implement agroforestry practices', url: 'https://www.climatehubs.usda.gov/approach/increase-or-implement-agroforestry-practices' },
      { label: 'USDA Forest Service — National Agroforestry Center', url: 'https://research.fs.usda.gov/centers/nac' },
      { label: 'Beck et al. — High-resolution 1 km Köppen-Geiger maps', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10593765/' },
    ],
  },

  Aw: {
    clase:    'Aw',
    titulo:   'Tropical de sabana con invierno seco',
    regiones: [
      'península de Yucatán',
      'llanos de Venezuela y Colombia',
      'Cerrado brasileño',
      'Pacífico seco centroamericano',
    ],
    tecnicas: [
      'milpa maya Ich Kool',
      'sistema agroforestal Quesungual',
      'silvopastoreo con cercas vivas',
      'pastoreo con quema en parches',
    ],
    fuentes:  [
      { label: 'FAO — Ich Kool: Mayan milpa of the Yucatan peninsula', url: 'https://www.fao.org/giahs/around-the-world/detail/mexico-milpa-maya/en' },
      { label: 'FAO — El sistema Quesungual', url: 'https://www.fao.org/honduras/noticias/detail-events/en/c/325833/' },
      { label: 'NPS — Patch-Burn Grazing', url: 'https://home.nps.gov/articles/000/patch-burn-grazing.htm' },
      { label: 'Beck et al. — High-resolution 1 km Köppen-Geiger maps', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10593765/' },
    ],
  },

  As: {
    clase:    'As',
    titulo:   'Tropical de sabana con verano seco',
    regiones: [
      'costa de Ceará y Rio Grande do Norte',
      'sotavento de las Antillas',
      'sectores de transición del Pacífico mesoamericano',
    ],
    tecnicas: [
      'sistema agroforestal Quesungual',
      'alley cropping',
      'cosecha de escorrentía en gavias',
      'silvopastoreo con cercas vivas',
    ],
    fuentes:  [
      { label: 'FAO — El sistema Quesungual', url: 'https://www.fao.org/honduras/noticias/detail-events/en/c/325833/' },
      { label: 'FAO — Agricultural Systems in Jable and Volcanic Sands in Lanzarote', url: 'https://www.fao.org/giahs/around-the-world/detail/spain-lanzarote-volcanic-systems/' },
      { label: 'USDA NRCS — Sustaining Agroforestry Systems for Farms and Ranches', url: 'https://www.nrcs.usda.gov/conservation-basics/land/forests/agroforestry-systems' },
      { label: 'Beck et al. — High-resolution 1 km Köppen-Geiger maps', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10593765/' },
    ],
  },

  BWh: {
    clase:    'BWh',
    titulo:   'Desértico cálido',
    regiones: [
      'desierto de Sonora',
      'desierto de Mojave',
      'desierto de Atacama',
      'Lanzarote',
    ],
    tecnicas: [
      'ak-chin o agricultura de avenida',
      'acequia comunitaria',
      'enarenado con picón',
      'cultivo en jable con socos',
    ],
    fuentes:  [
      { label: 'NPS — Native Peoples of the Sonoran Desert: The O\'odham', url: 'https://www.nps.gov/articles/oodham.htm' },
      { label: 'FAO — Agricultural Systems in Jable and Volcanic Sands in Lanzarote', url: 'https://www.fao.org/giahs/around-the-world/detail/spain-lanzarote-volcanic-systems/' },
      { label: 'Beck et al. — High-resolution 1 km Köppen-Geiger maps', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10593765/' },
    ],
  },

  BWk: {
    clase:    'BWk',
    titulo:   'Desértico frío',
    regiones: [
      'Puna seca',
      'Altiplano sur de Bolivia',
      'Patagonia extraandina árida',
      'Gran Cuenca alta',
    ],
    tecnicas: [
      'waru-waru o sukakollos',
      'qochas encadenadas',
      'terrazas andinas irrigadas',
      'cortina rompeviento de campo',
    ],
    fuentes:  [
      { label: 'FAO — Andean Agriculture, Peru', url: 'https://www.fao.org/giahs/giahs-around-the-world/peru-andean-agriculture/en' },
      { label: 'FAO — Waru-waru and raised fields', url: 'https://www.fao.org/4/i2232s/i2232s.pdf' },
      { label: 'USDA NRCS — Sustaining Agroforestry Systems for Farms and Ranches', url: 'https://www.nrcs.usda.gov/conservation-basics/land/forests/agroforestry-systems' },
      { label: 'Beck et al. — High-resolution 1 km Köppen-Geiger maps', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10593765/' },
    ],
  },

  BSh: {
    clase:    'BSh',
    titulo:   'Semiárido cálido',
    regiones: [
      'Chaco seco',
      'Sertão brasileño',
      'altiplano mexicano bajo',
      'sur de Texas',
    ],
    tecnicas: [
      'metepantle',
      'sistema agroforestal Quesungual',
      'silvopastoreo con cercas vivas',
      'bordos de contorno con franjas vegetadas',
    ],
    fuentes:  [
      { label: 'FAO — Metepantle Ancestral Agricultural System', url: 'https://www.fao.org/giahs/giahs-around-the-world/mexico-meteplante/en' },
      { label: 'FAO — El sistema Quesungual', url: 'https://www.fao.org/honduras/noticias/detail-events/en/c/325833/' },
      { label: 'USDA NRCS — Alley Cropping', url: 'https://www.nrcs.usda.gov/conservation-basics/land/forests/agroforestry-systems/alley-cropping' },
      { label: 'Beck et al. — High-resolution 1 km Köppen-Geiger maps', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10593765/' },
    ],
  },

  BSk: {
    clase:    'BSk',
    titulo:   'Semiárido frío',
    regiones: [
      'Grandes Llanuras occidentales',
      'Altiplano mexicano',
      'estepa patagónica',
      'estepa panónica seca',
    ],
    tecnicas: [
      'metepantle',
      'shelterbelt o cortina forestal',
      'living snowfence',
      'cultivo en franjas de contorno',
    ],
    fuentes:  [
      { label: 'FAO — Metepantle Ancestral Agricultural System', url: 'https://www.fao.org/giahs/giahs-around-the-world/mexico-meteplante/en' },
      { label: 'USDA NRCS — Sustaining Agroforestry Systems for Farms and Ranches', url: 'https://www.nrcs.usda.gov/conservation-basics/land/forests/agroforestry-systems' },
      { label: 'Beck et al. — High-resolution 1 km Köppen-Geiger maps', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10593765/' },
    ],
  },

  Csa: {
    clase:    'Csa',
    titulo:   'Mediterráneo de verano caluroso',
    regiones: [
      'Andalucía y Extremadura',
      'Alentejo',
      'California interior',
      'Chile central',
      'Italia meridional',
    ],
    tecnicas: [
      'dehesa',
      'montado',
      'acequias de careo',
      'enarenado volcánico',
    ],
    fuentes:  [
      { label: 'EU CAP Network — Agroforestry in the EU', url: 'https://eu-cap-network.ec.europa.eu/sites/default/files/publications/2023-09/EUCAPNetwork_CSPAnalysis_Analytical_work_supporting_the-establishment_of_agroforestry_systems.pdf' },
      { label: 'UNESCO — Traditional irrigation: knowledge, technique, and organization', url: 'https://ich.unesco.org/en/RL/traditional-irrigation-knowledge-technique-and-organization-01979' },
      { label: 'FAO — Agricultural Systems in Jable and Volcanic Sands in Lanzarote', url: 'https://www.fao.org/giahs/around-the-world/detail/spain-lanzarote-volcanic-systems/' },
      { label: 'Beck et al. — High-resolution 1 km Köppen-Geiger maps', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10593765/' },
    ],
  },

  Csb: {
    clase:    'Csb',
    titulo:   'Mediterráneo de verano templado',
    regiones: [
      'Galicia meridional',
      'norte de Portugal',
      'costa de Oregón',
      'litoral central de California',
      'Chile centro-sur',
    ],
    tecnicas: [
      'bocage con hedgerow laying',
      'Streuobstwiese o pradera-huerto',
      'water meadows por riego de gravedad',
      'silvopastoreo',
    ],
    fuentes:  [
      { label: 'EU CAP Network — Agroforestry in the EU', url: 'https://eu-cap-network.ec.europa.eu/sites/default/files/publications/2023-09/EUCAPNetwork_CSPAnalysis_Analytical_work_supporting_the-establishment_of_agroforestry_systems.pdf' },
      { label: 'UNESCO — Traditional irrigation: knowledge, technique, and organization', url: 'https://ich.unesco.org/en/RL/traditional-irrigation-knowledge-technique-and-organization-01979' },
      { label: 'USDA NRCS — Sustaining Agroforestry Systems for Farms and Ranches', url: 'https://www.nrcs.usda.gov/conservation-basics/land/forests/agroforestry-systems' },
      { label: 'Beck et al. — High-resolution 1 km Köppen-Geiger maps', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10593765/' },
    ],
  },

  Cwa: {
    clase:    'Cwa',
    titulo:   'Templado húmedo con invierno seco y verano caluroso',
    regiones: [
      'Bajío mexicano',
      'valles centrales de México',
      'Yungas bajas',
      'sudeste de Brasil interior',
    ],
    tecnicas: [
      'chinampa',
      'metepantle',
      'cultivo en callejones sobre contorno',
      'buffer forestal ribereño',
    ],
    fuentes:  [
      { label: 'FAO — Chinampas Agricultural System in Mexico City', url: 'https://www.fao.org/giahs/giahs-around-the-world/mexico-chinampas-agricultural-system/en' },
      { label: 'FAO — Metepantle Ancestral Agricultural System', url: 'https://www.fao.org/giahs/giahs-around-the-world/mexico-meteplante/en' },
      { label: 'USDA NRCS — Alley Cropping', url: 'https://www.nrcs.usda.gov/conservation-basics/land/forests/agroforestry-systems/alley-cropping' },
      { label: 'Beck et al. — High-resolution 1 km Köppen-Geiger maps', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10593765/' },
    ],
  },

  Cwb: {
    clase:    'Cwb',
    titulo:   'Templado de montaña con invierno seco',
    regiones: [
      'Altiplano central mexicano',
      'valles andinos de Perú',
      'altiplano boliviano húmedo',
      'sierras del sudeste de Brasil',
    ],
    tecnicas: [
      'waru-waru o sukakollos',
      'qochas encadenadas',
      'terrazas andinas irrigadas',
      'metepantle',
    ],
    fuentes:  [
      { label: 'FAO — Andean Agriculture, Peru', url: 'https://www.fao.org/giahs/giahs-around-the-world/peru-andean-agriculture/en' },
      { label: 'FAO — Waru-waru and raised fields', url: 'https://www.fao.org/4/i2232s/i2232s.pdf' },
      { label: 'FAO — Metepantle Ancestral Agricultural System', url: 'https://www.fao.org/giahs/giahs-around-the-world/mexico-meteplante/en' },
      { label: 'Beck et al. — High-resolution 1 km Köppen-Geiger maps', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10593765/' },
    ],
  },

  Cfa: {
    clase:    'Cfa',
    titulo:   'Subtropical húmedo sin estación seca',
    regiones: [
      'Piedmont del sudeste de Estados Unidos',
      'llanura costera del Golfo',
      'noreste argentino y Uruguay',
      'sur de Brasil',
      'sectores bajos de Puerto Rico',
    ],
    tecnicas: [
      'silvopastoreo',
      'alley cropping',
      'buffer forestal ribereño',
      'cortina forestal multiestrato',
    ],
    fuentes:  [
      { label: 'USDA Forest Service — National Agroforestry Center', url: 'https://research.fs.usda.gov/centers/nac' },
      { label: 'USDA NRCS — Sustaining Agroforestry Systems for Farms and Ranches', url: 'https://www.nrcs.usda.gov/conservation-basics/land/forests/agroforestry-systems' },
      { label: 'USDA Climate Hubs — Increase or implement agroforestry practices', url: 'https://www.climatehubs.usda.gov/approach/increase-or-implement-agroforestry-practices' },
      { label: 'Beck et al. — High-resolution 1 km Köppen-Geiger maps', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10593765/' },
    ],
  },

  Cfb: {
    clase:    'Cfb',
    titulo:   'Oceánico templado',
    regiones: [
      'Irlanda',
      'Bretaña',
      'Galicia',
      'Cornualles',
      'Países Bajos',
      'Pacífico noroeste costero',
    ],
    tecnicas: [
      'bocage con hedgerow laying',
      'Streuobstwiese o pradera-huerto',
      'water meadows por riego de gravedad',
      'pastoreo rotativo sobre pradera permanente',
    ],
    fuentes:  [
      { label: 'EU CAP Network — Agroforestry in the EU', url: 'https://eu-cap-network.ec.europa.eu/sites/default/files/publications/2023-09/EUCAPNetwork_CSPAnalysis_Analytical_work_supporting_the-establishment_of_agroforestry_systems.pdf' },
      { label: 'UNESCO — Traditional irrigation: knowledge, technique, and organization', url: 'https://ich.unesco.org/en/RL/traditional-irrigation-knowledge-technique-and-organization-01979' },
      { label: 'EU CAP Network — Agroforestry as a historical anchor for farm diversification', url: 'https://eu-cap-network.ec.europa.eu/projects/practice-abstracts/agroforestry-historical-anchor-farm-diversification_fr' },
      { label: 'Beck et al. — High-resolution 1 km Köppen-Geiger maps', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10593765/' },
    ],
  },

  Cfc: {
    clase:    'Cfc',
    titulo:   'Oceánico subpolar',
    regiones: [
      'islas Feroe',
      'costa occidental de Islandia',
      'costa noruega subpolar',
      'extremo austral de Chile',
      'islas Aleutianas',
    ],
    tecnicas: [
      'pradera de siega para heno',
      'pastoreo ovino rotativo',
      'shelterbelt',
      'túnel alto estacional',
    ],
    fuentes:  [
      { label: 'EU CAP Network — Agroforestry in the EU', url: 'https://eu-cap-network.ec.europa.eu/sites/default/files/publications/2023-09/EUCAPNetwork_CSPAnalysis_Analytical_work_supporting_the-establishment_of_agroforestry_systems.pdf' },
      { label: 'USDA NRCS — Sustaining Agroforestry Systems for Farms and Ranches', url: 'https://www.nrcs.usda.gov/conservation-basics/land/forests/agroforestry-systems' },
      { label: 'USDA NRCS — Seasonal High Tunnel System for Crops', url: 'https://www.nrcs.usda.gov/state-offices/pennsylvania/seasonal-high-tunnel-system-for-crops' },
      { label: 'Beck et al. — High-resolution 1 km Köppen-Geiger maps', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10593765/' },
    ],
  },

  Dfa: {
    clase:    'Dfa',
    titulo:   'Continental húmedo de verano caluroso',
    regiones: [
      'Medio Oeste estadounidense',
      'sur de Ontario',
      'llanura panónica',
      'bajo Danubio',
    ],
    tecnicas: [
      'prairie strips',
      'shelterbelt',
      'cultivo en franjas de contorno',
      'pastoreo con quema en parches',
    ],
    fuentes:  [
      { label: 'USDA NRCS — Sustaining Agroforestry Systems for Farms and Ranches', url: 'https://www.nrcs.usda.gov/conservation-basics/land/forests/agroforestry-systems' },
      { label: 'NPS — Patch-Burn Grazing', url: 'https://home.nps.gov/articles/000/patch-burn-grazing.htm' },
      { label: 'USDA Farm Service Agency — CP 43: Prairie Strips', url: 'https://www.fsa.usda.gov/resources/programs/conservation-reserve-program/practices-library/prairie-strips' },
      { label: 'Beck et al. — High-resolution 1 km Köppen-Geiger maps', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10593765/' },
    ],
  },

  Dfb: {
    clase:    'Dfb',
    titulo:   'Continental húmedo de verano templado',
    regiones: [
      'Grandes Lagos',
      'sur de Quebec',
      'Europa central oriental',
      'Báltico meridional',
      'sur de Finlandia',
    ],
    tecnicas: [
      'shelterbelt',
      'living snowfence',
      'forest farming de sotobosque',
      'Streuobstwiese o pradera-huerto',
    ],
    fuentes:  [
      { label: 'USDA NRCS — Sustaining Agroforestry Systems for Farms and Ranches', url: 'https://www.nrcs.usda.gov/conservation-basics/land/forests/agroforestry-systems' },
      { label: 'EU CAP Network — Agroforestry as a historical anchor for farm diversification', url: 'https://eu-cap-network.ec.europa.eu/projects/practice-abstracts/agroforestry-historical-anchor-farm-diversification_fr' },
      { label: 'Beck et al. — High-resolution 1 km Köppen-Geiger maps', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10593765/' },
    ],
  },

  Dfc: {
    clase:    'Dfc',
    titulo:   'Subártico sin estación seca',
    regiones: [
      'interior de Alaska',
      'norte de Canadá',
      'norte de Suecia',
      'norte de Finlandia',
      'taiga de Noruega interior',
    ],
    tecnicas: [
      'siida de pastoreo de renos',
      'wood pasture boreal',
      'pradera de siega para heno',
      'living snowfence',
    ],
    fuentes:  [
      { label: 'Sámi Parliament of Finland — Reindeer Herding', url: 'https://matkailu.samediggi.fi/en/sanasto/reindeer-herding/' },
      { label: 'EU CAP Network — Agroforestry in the EU', url: 'https://eu-cap-network.ec.europa.eu/sites/default/files/publications/2023-09/EUCAPNetwork_CSPAnalysis_Analytical_work_supporting_the-establishment_of_agroforestry_systems.pdf' },
      { label: 'USDA NRCS — Sustaining Agroforestry Systems for Farms and Ranches', url: 'https://www.nrcs.usda.gov/conservation-basics/land/forests/agroforestry-systems' },
      { label: 'Beck et al. — High-resolution 1 km Köppen-Geiger maps', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10593765/' },
    ],
  },

  Dwb: {
    clase:    'Dwb',
    titulo:   'Continental de invierno seco y verano templado',
    regiones: [
      'sectores continentales al oeste de los Urales',
      'Bashkortostán occidental',
      'corredor agrícola de Oremburgo occidental',
    ],
    tecnicas: [
      'shelterbelt',
      'living snowfence',
      'cultivo en franjas de contorno',
      'forest farming',
    ],
    fuentes:  [
      { label: 'USDA NRCS — Sustaining Agroforestry Systems for Farms and Ranches', url: 'https://www.nrcs.usda.gov/conservation-basics/land/forests/agroforestry-systems' },
      { label: 'USDA Forest Service — National Agroforestry Center', url: 'https://research.fs.usda.gov/centers/nac' },
      { label: 'Beck et al. — High-resolution 1 km Köppen-Geiger maps', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10593765/' },
    ],
  },

  Dsb: {
    clase:    'Dsb',
    titulo:   'Continental de verano seco y verano templado',
    regiones: [
      'Sierra Nevada de California alta',
      'cordillera de las Cascadas interior',
      'Montañas Rocosas meridionales',
      'valles interiores secos de los Alpes',
    ],
    tecnicas: [
      'transhumancia alpina',
      'riego tradicional por gravedad',
      'pradera de siega para heno',
      'living snowfence',
    ],
    fuentes:  [
      { label: 'UNESCO — Traditional irrigation: knowledge, technique, and organization', url: 'https://ich.unesco.org/en/RL/traditional-irrigation-knowledge-technique-and-organization-01979' },
      { label: 'EU CAP Network — Agroforestry in the EU', url: 'https://eu-cap-network.ec.europa.eu/sites/default/files/publications/2023-09/EUCAPNetwork_CSPAnalysis_Analytical_work_supporting_the-establishment_of_agroforestry_systems.pdf' },
      { label: 'USDA NRCS — Sustaining Agroforestry Systems for Farms and Ranches', url: 'https://www.nrcs.usda.gov/conservation-basics/land/forests/agroforestry-systems' },
      { label: 'Beck et al. — High-resolution 1 km Köppen-Geiger maps', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10593765/' },
    ],
  },

  ET: {
    clase:    'ET',
    titulo:   'Tundra',
    regiones: [
      'norte de Alaska',
      'Ártico canadiense habitado',
      'altas mesetas escandinavas',
      'altos Andes',
      'tierras altas de Islandia',
    ],
    tecnicas: [
      'siida de pastoreo de renos',
      'waru-waru o sukakollos',
      'túnel alto estacional',
      'qochas encadenadas',
    ],
    fuentes:  [
      { label: 'Sámi Parliament of Finland — Reindeer Herding', url: 'https://matkailu.samediggi.fi/en/sanasto/reindeer-herding/' },
      { label: 'FAO — Andean Agriculture, Peru', url: 'https://www.fao.org/giahs/giahs-around-the-world/peru-andean-agriculture/en' },
      { label: 'USDA NRCS — Alaska Curricula for Conservation Planners', url: 'https://www.nrcs.usda.gov/resources/education-and-teaching-materials/alaska-curricula-for-conservation-planners' },
      { label: 'Beck et al. — High-resolution 1 km Köppen-Geiger maps', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10593765/' },
    ],
  },
};

/**
 * Clases sin ficha propia → la documentada más parecida.
 * El criterio es el régimen térmico y de lluvia, no el orden alfabético: las
 * variantes muy frías (c, d) de cualquier régimen caen en el subártico `Dfc`,
 * que es donde efectivamente se parecen entre sí.
 */
export const EQUIVALENTES: Record<string, string> = {
  Csc: 'Csb',  // mediterráneo de verano frío: costa noroeste, versión fría de Csb
  Cwc: 'Cwb',  // altura tropical extrema: misma lógica de pisos altitudinales
  Dsa: 'Dsb',  // continental de verano seco, más caluroso
  Dsc: 'Dfc',
  Dsd: 'Dfc',
  Dwa: 'Dwb',  // monzónico continental caluroso (norte de China)
  Dwc: 'Dfc',
  Dwd: 'Dfc',
  Dfd: 'Dfc',
};
