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
 *   3. Köppen         → sólo dentro de Sudamérica, donde la heurística original
 *                       fue escrita y validada. Nunca por descarte fuera de ahí.
 *
 * Los datos vienen de RESOLVE Ecoregions 2017 (Dinerstein et al., BioScience
 * 2017), 846 ecorregiones y 14 biomas, licencia CC BY 4.0. Se consultan desde
 * `/api/bioma`, nunca desde el navegador: la descarga completa ronda los 150 MB.
 *
 * Fuentes:
 *   https://doi.org/10.1093/biosci/bix014
 *   https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017
 */

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
 * Ecorregiones con ficha regional curada.
 *
 * Es una lista blanca deliberada: 30 de las 846 ecorregiones. Un ECO_ID que no
 * esté acá cae al bioma global, nunca a una ficha vecina "parecida". Ampliar
 * esta tabla es la forma de mejorar la cobertura sin tocar el clasificador.
 *
 * Verificadas contra el FeatureServer de RESOLVE.
 */
export const ECO_ID_A_FICHA: Record<number, string> = {
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
