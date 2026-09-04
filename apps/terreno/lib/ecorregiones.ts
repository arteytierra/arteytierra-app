/**
 * Ecorregiones RESOLVE 2017 — taxonomía global para ubicar el predio.
 *
 * Köppen describe el régimen de temperatura y lluvia, no la historia
 * biogeográfica ni la comunidad de especies. Puerto Rico, el Piedmont
 * estadounidense y el nordeste argentino comparten `Cfa` y no comparten casi
 * nada más. Por eso el bioma se resuelve en tres niveles:
 *
 *   1. ECO_ID curado  → ficha regional propia (la más específica que tengamos).
 *   2. BIOME_NUM      → bioma global de RESOLVE (14 clases, siempre disponible).
 *   3. Köppen         → sólo si no se pudo consultar la ecorregión, y sólo
 *                       dentro de Sudamérica, donde la heurística fue escrita y
 *                       validada. Nunca por descarte fuera de ahí.
 *
 * El orden importa: sabiendo la ecorregión real, el bioma global es un dato y
 * la heurística climática es una conjetura. Manda el dato.
 *
 * Los datos vienen de RESOLVE Ecoregions 2017 (Dinerstein et al., BioScience
 * 2017), 846 ecorregiones y 14 biomas, licencia CC BY 4.0. Se consultan desde
 * `/api/bioma`, nunca desde el navegador: la descarga completa ronda los 150 MB.
 *
 * Fuentes:
 *   https://doi.org/10.1093/biosci/bix014
 *   https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017
 */

import { ECO_ID_AMERICA } from './ecorregionesAmerica';
import { ECO_ID_CANADA } from './ecorregionesCanada';
import { ECO_ID_EUROPA } from './ecorregionesEuropa';
import { ECO_ID_SUDAMERICA_NUEVAS } from './ecorregionesSudamerica';

export interface Ecorregion {
  eco_id:      number;
  eco_name:    string;
  bioma_num:   number;
  bioma_name:  string;  // nombre original en inglés, tal como lo publica RESOLVE
  realm?:      string;
}

/** Los 14 biomas de RESOLVE, en castellano. Nombre solamente: el contenido de
 *  cada ficha global es trabajo aparte. */
export const BIOMAS_RESOLVE: Record<number, { id: string; nombre: string; emoji: string }> = {
  1:  { id: 'resolve_bosque_tropical_humedo',            nombre: 'Bosque tropical y subtropical húmedo',   emoji: '🌴' },
  2:  { id: 'resolve_bosque_tropical_seco',              nombre: 'Bosque tropical y subtropical seco',     emoji: '🌾' },
  3:  { id: 'resolve_bosque_coniferas_tropical',         nombre: 'Bosque tropical de coníferas',           emoji: '🌲' },
  4:  { id: 'resolve_bosque_templado_caducifolio_mixto', nombre: 'Bosque templado caducifolio y mixto',    emoji: '🍂' },
  5:  { id: 'resolve_bosque_coniferas_templado',         nombre: 'Bosque templado de coníferas',           emoji: '🌲' },
  6:  { id: 'resolve_bosque_boreal_taiga',               nombre: 'Bosque boreal / taiga',                  emoji: '🌲' },
  7:  { id: 'resolve_sabana_tropical',                   nombre: 'Sabana y pastizal tropical',             emoji: '🌾' },
  8:  { id: 'resolve_pastizal_templado',                 nombre: 'Pastizal templado',                      emoji: '🌾' },
  9:  { id: 'resolve_pastizal_inundable',                nombre: 'Pastizal y sabana inundable',            emoji: '💧' },
  10: { id: 'resolve_montano',                           nombre: 'Pastizal y matorral montano',            emoji: '⛰️' },
  11: { id: 'resolve_tundra',                            nombre: 'Tundra',                                 emoji: '❄️' },
  12: { id: 'resolve_mediterraneo',                      nombre: 'Bosque y matorral mediterráneo',         emoji: '🫒' },
  13: { id: 'resolve_desierto_matorral_xerofilo',        nombre: 'Desierto y matorral xerófilo',           emoji: '🌵' },
  14: { id: 'resolve_manglar',                           nombre: 'Manglar',                                emoji: '🌊' },
  98: { id: 'resolve_roca_hielo',                        nombre: 'Roca y hielo',                           emoji: '🏔️' },
};

/**
 * Ecorregiones sudamericanas → fichas de `lib/contexto.ts` y de
 * `lib/biomasRegionalesSudamerica.ts`.
 *
 * Antes esta mitad casi no existía y adentro de Sudamérica mandaba la heurística
 * Köppen. Anda bien en la Argentina, que es donde se escribió, pero la caja de
 * Sudamérica llega hasta el paralelo 13 norte y ahí se rompía sola: el desierto
 * de Sechura (Perú, ~7° S) daba "Chaco seco" porque es árido cálido y está al
 * norte del paralelo 27; el matorral de la Guajira colombiana, lo mismo; y
 * cualquier páramo daba "Puna" por pasar los 2800 m, cuando el páramo recibe
 * 1000–2000 mm al año y la puna menos de 400.
 *
 * Los 19 de acá abajo son los que siguen perteneciendo a las 12 fichas de
 * `contexto.ts`: cada una se quedó con el territorio que efectivamente
 * describe. Los otros 90 pasaron a fichas propias —la Caatinga, el Chaco húmedo,
 * el Pantanal, los páramos, el Chocó, los valles secos interandinos y las nueve
 * particiones de la Amazonía y la Mata Atlántica ya no caen al bioma global ni a
 * la ficha argentina más parecida— y viven en el archivo generado.
 *
 * Los nombres del comentario son los de RESOLVE, verificados contra el
 * FeatureServer (`ECO_ID`/`ECO_NAME`).
 */
const SUDAMERICA_CURADO_A_MANO: Record<number, string> = {
  // Selva paranaense — el Alto Paraná y nada más: la Mata Atlántica y la
  // Amazonía tienen fichas propias desde el montaje de Sudamérica.
  439: 'selva_paranaense', // Alto Paraná Atlantic forests

  // Selva de montaña andina (la faja de bosque nublado)
  444: 'yungas',           // Bolivian Yungas
  460: 'yungas',           // Eastern Cordillera Real montane forests
  493: 'yungas',           // Peruvian Yungas
  504: 'yungas',           // Southern Andean Yungas

  // Cerrado brasileño. Los Llanos y las sabanas guayanesas se separaron.
  567: 'sabana_cerrado',   // Cerrado

  // Pastizales y bosques secos templados del Cono Sur. Los campos uruguayos
  // (574) pasaron a ficha propia: no son pampa húmeda.
  569: 'chaco_seco',       // Dry Chaco
  575: 'espinal',          // Espinal
  576: 'pampa',            // Humid Pampas

  // Áridos y semiáridos. La puna seca (587) y la húmeda (589) se separaron.
  577: 'monte',            // Low Monte
  592: 'monte',            // High Monte
  588: 'puna_altoandino',  // Central Andean puna
  598: 'desierto_costero', // Atacama desert
  608: 'desierto_costero', // Sechura desert

  // Patagonia y Chile
  578: 'estepa_patagonica',        // Patagonian steppe
  595: 'estepa_patagonica',        // Southern Andean steppe
  561: 'bosque_andino_patagonico', // Magellanic subpolar forests
  563: 'bosque_andino_patagonico', // Valdivian temperate forests
  596: 'mediterraneo',             // Chilean Matorral
};

/**
 * La mitad sudamericana completa. Los dos bloques son disjuntos y el test lo
 * verifica: un ECO_ID repetido se resolvería en silencio a favor del último.
 */
const SUDAMERICA: Record<number, string> = {
  ...SUDAMERICA_CURADO_A_MANO,
  ...ECO_ID_SUDAMERICA_NUEVAS,
};

/**
 * Ecorregiones del resto del mundo → fichas regionales de
 * `lib/biomasRegionales.ts`.
 *
 * Ninguna apunta a una ficha sudamericana: describir un predio de Kansas con la
 * vegetación del Espinal fue el bug que dio origen a toda esta tabla.
 */
const RESTO_CURADO_A_MANO: Record<number, string> = {
  // Norteamérica — bosques y praderas
  329: 'bosque_templado_caducifolio_este',      // Appalachian mixed mesophytic forests
  330: 'sur_templado_humedo_eeuu',              // Appalachian Piedmont forests
  351: 'bosque_coniferas_pacifico_noroeste',    // Central Pacific Northwest coastal forests
  376: 'taiga_borde_agricola',                  // Mid-Canada Boreal Plains forests
  389: 'pradera_mixta',                         // Central-Southern US mixed grasslands
  392: 'pradera_pastos_altos',                  // Flint Hills tallgrass prairie
  395: 'pradera_mixta',                         // Nebraska Sand Hills mixed grasslands
  396: 'pradera_pastos_cortos',                 // Northern Shortgrass prairie
  399: 'sur_templado_humedo_eeuu',              // Southeast US conifer savannas
  402: 'pradera_pastos_cortos',                 // Western shortgrass prairie

  // Norteamérica — áridos y mediterráneo
  424: 'chaparral_californiano',                // California montane chaparral and woodlands
  428: 'desiertos_calidos_norteamericanos',     // Chihuahuan desert
  430: 'estepa_arbustiva_gran_cuenca',          // Great Basin shrub steppe
  432: 'matorral_xerofilo_altiplano_mexicano',  // Meseta Central matorral
  433: 'desiertos_calidos_norteamericanos',     // Mojave desert
  435: 'desiertos_calidos_norteamericanos',     // Sonoran desert

  // Mesoamérica
  487: 'bosque_mesofilo_montana',               // Oaxacan montane forests
  527: 'bosque_tropical_seco_mesoamericano',    // Central American dry forests
  534: 'bosque_tropical_seco_mesoamericano',    // Jalisco dry forests

  // Caribe
  495: 'bosque_humedo_tropical_caribeno',       // Puerto Rican moist forests
  543: 'matorral_seco_caribeno',                // Puerto Rican dry forests

  // Europa
  645: 'macaronesia',                           // Azores temperate mixed forests
  651: 'atlantico_templado_oceanico',           // Celtic broadleaf forests
  654: 'templado_continental_europeo',          // Central European mixed forests
  668: 'macaronesia',                           // Madeira evergreen forests
  674: 'estepa_pontica_panonica',               // Pannonian mixed forests
  689: 'alpino_montano_europeo',                // Alps conifer and mixed forests
  717: 'boreal_nordico_turberas',               // Scandinavian and Russian taiga
  787: 'macaronesia',                           // Canary Islands dry woodlands and forests
  793: 'mediterraneo_europeo',                  // Iberian sclerophyllous and semi-deciduous forests
};

/**
 * La unión de las tres mitades del resto del mundo. Las dos generadas vienen de
 * los paquetes de investigación y son disjuntas entre sí y con esta: un ECO_ID
 * repetido se resolvería en silencio a favor del último y el test lo rechaza.
 */
const RESTO_DEL_MUNDO: Record<number, string> = {
  ...RESTO_CURADO_A_MANO,
  ...ECO_ID_AMERICA,
  ...ECO_ID_CANADA,
  ...ECO_ID_EUROPA,
};

/**
 * La lista blanca completa. Un ECO_ID que no esté acá cae al bioma global de
 * RESOLVE, nunca a una ficha vecina 'parecida'. Ampliarla es la forma de mejorar
 * la cobertura sin tocar el clasificador.
 */
export const ECO_ID_A_FICHA: Record<number, string> = { ...SUDAMERICA, ...RESTO_DEL_MUNDO };

/** Las dos mitades por separado: el test verifica que ninguna invada a la otra. */
export { SUDAMERICA as ECO_ID_SUDAMERICA, RESTO_DEL_MUNDO as ECO_ID_RESTO_DEL_MUNDO };

/** Ficha regional curada para una ecorregión, o null si todavía no existe. */
export function fichaDeEcorregion(ecoId: number): string | null {
  return ECO_ID_A_FICHA[ecoId] ?? null;
}

/** Bioma global de RESOLVE. Cubre las 846 ecorregiones. */
export function biomaGlobal(biomaNum: number): { id: string; nombre: string; emoji: string } | null {
  return BIOMAS_RESOLVE[biomaNum] ?? null;
}

/**
 * Caja de Sudamérica continental. Delimita dónde vale la heurística Köppen de
 * `determinarBioma`: las 12 fichas originales describen ecosistemas de acá y
 * aplicarlas afuera es lo que hacía que un predio en Ohio saliera "Espinal".
 */
export function enSudamerica(lat: number, lng: number): boolean {
  return lat >= -56 && lat <= 13 && lng >= -82 && lng <= -34;
}

/** Atribución obligatoria por la licencia CC BY 4.0 de RESOLVE. */
export const ATRIBUCION_RESOLVE =
  'Ecorregiones: RESOLVE Ecoregions 2017 (Dinerstein et al.), CC BY 4.0.';
