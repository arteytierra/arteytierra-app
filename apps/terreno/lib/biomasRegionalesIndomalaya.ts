/**
 * Fichas regionales de Indomalaya: 32 fichas para 33 ECO_ID.
 *
 * El alcance y el porqué del recorte están en `ecorregionesIndomalaya.ts`. Acá
 * va lo que hay que saber para tocar los números.
 *
 * ## La regla que produjo los modificadores es nuestra, no de HWSD
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
 * `saberes` va vacío en las 32, como en todo el catálogo regional: sin geometría
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
    suelos: 'Acá la meteorización es menor que en la zona húmeda: caolinita, esmectita, vermiculita y mica, sin minerales muy meteorizados. Los «Reddish Brown Earths» de la zona seca se clasifican como Alfisols, y HWSD v2 lo confirma con Luvisols 76 %, de base alta, más Fluvisols éutricos 9 %. SoilGrids da 53 % de Acrisols, pero la mineralogía descrita no es la de un Ultisol. **La fertilidad no es el límite acá: el agua sí**, con una sola estación de lluvias. Los reservorios antiguos que recorren la zona son la infraestructura de cosecha de agua que responde a eso, y son el antecedente de diseño más útil de la región.',
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
    suelos: 'Aluvión arcilloso de drenaje pobre y, en los bajos ribereños más estables pero inundables, suelos más arenosos con parches de arcilla. HWSD v2 da Gleysols 36 %, Cambisols 26 %, Fluvisols 16 % —mayormente calcáricos— y Luvisols 10 %; los lixiviados suman 7 % y la turba 1,5 %. SoilGrids coincide: Fluvisols 45 %, Cambisols 38 %, 6 % lixiviado. **El límite acá no es la fertilidad, es el agua, y en un sentido que conviene decir antes de perforar: el acuífero de la cuenca de Bengala tiene arsénico geogénico.** En Bangladesh hay entre 30 y 35 millones de personas expuestas a más de 50 µg/L, y desde los años setenta esa agua riega el arroz de estación seca, que es la principal vía dietaria donde el agua de bebida está limpia. Para la huerta de un predio conviene cosecha de lluvia y agua superficial antes que pozo.',
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
    suelos: 'Aluviones profundos depositados por el Ganges. HWSD v2 da Cambisols éutricos 50 %, Luvisols 37 % y Fluvisols calcáricos 5 %, **sin suelos lixiviados**, y SoilGrids coincide con Cambisols 93 %. Lo que ninguna de las dos bases registra a esta escala son los suelos sódicos (*usar*), que sí son reales: de los 2,35 millones de ha salinas o sódicas de la llanura indogangética, 1,79 millones son sódicas, con pH de 8,5 a 10, PSI mayor a 15 y baja permeabilidad, y Uttar Pradesh tiene 1,37 millones de ha afectadas por sales. Sobre los 26 millones de ha de la ecorregión eso es menos del 7 %, pero en un predio concreto lo cambia todo: costra blanca, pH arriba de 8,5 o un suelo que no infiltra indican *usar*, y ahí la huerta no arranca hasta la enmienda con 10 a 15 t/ha de yeso.',
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
    suelos: 'En la llanura central baja hay limos cuaternarios de 15 a 30 m sobre arcillas marinas blandas, y en esas arcillas se formó pirita a partir de raíces de manglar. **El resultado es suelo sulfatado ácido**: Tailandia tiene unos 8.800 km² concentrados en esta llanura de unos 36.000 km², con pH de campo de 4,6 a 5,1 que cae a 3,5-3,7 cuando el suelo se seca al aire. HWSD v2 da Gleysols 37 % —30 % tiónicos—, Acrisols gleicos 28 %, Fluvisols éutricos 22 % en los albardones y Vertisols 5 %; SoilGrids da Fluvisols 57 % y Gleysols 15 %, pero no distingue los tiónicos. La regla de diseño que sigue de esto es concreta y es la versión local de «el agua manda»: **no bajar el nivel freático por debajo de la capa pirítica y no exponer material sulfídico en excavaciones**, porque drenarlo o removerlo libera ácido sulfúrico.',
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
    suelos: 'WWF describe como predominantes los suelos podzólicos, asociados con litosoles, y rendzinas sobre las calizas del norte; en la nomenclatura indonesia antigua, «podzólico» es un suelo ácido lixiviado, aproximadamente Ultisol. HWSD v2 lo confirma: Acrisols 47 %, Umbrisols ácricos 17 %, Fluvisols 7,5 %, Ferralsols 6 % e Histosols 2,6 %; SoilGrids da Ferralsols 49 %, Histosols 19 %, Nitisols 15 % y Acrisols 9 %. Lo importante para este lote es lo que **no** hay: los Andosols son el 0,1 % en SoilGrids y no figuran entre los grupos principales de HWSD. La fertilidad volcánica de Sumatra está en Barisan y no baja a estas tierras bajas. Según FAO, en Acrisols la agricultura de bajos insumos rinde poco y prosperan los cultivos tolerantes a la acidez.',
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
    suelos: 'El sustrato son volcanitas terciarias y cuaternarias, aluviones y calizas coralinas levantadas, pero eso no se traduce en suelo volcánico joven: **ninguna de las dos bases muestra dominio andosólico en la franja baja**, que es lo contrario de la premisa con la que arrancó este lote. Los Andosols quedan en los conos, que corresponden a la ficha montana. HWSD v2 da un mosaico —Acrisols 24 %, Fluvisols 22 %, Leptosols 12 %, Nitisols 10 %, Luvisols 10 % y Technosols 9,5 % de suelo urbano—; SoilGrids da Cambisols 48 % y Ferralsols 31 %. Según FAO, los Nitisols están entre los suelos más productivos del trópico húmedo.',
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
    suelos: 'Volcanitas terciarias y cuaternarias, aluviones y calizas coralinas levantadas, con suelos someros en las laderas calcáreas. **Las dos bases globales se contradicen de plano**: HWSD v2 da Luvisols 34 %, Vertisols 20 %, Fluvisols 15 %, Andosols 8 %, Leptosols 8 % y Nitisols 5 %, sin suelos lixiviados, y SoilGrids da Ferralsols 60 % y Acrisols 20 %, o sea 82 % lixiviado. SoilGrids WRB tiene sesgos documentados en el trópico y su mapa se volvió a correr por distorsiones en latitudes bajas, pero HWSD también es de escala gruesa, así que esta ficha no corrige el modificador del bioma hasta abrir el mapa de BBSDLP. El dato hídrico que sí sirve viene de la cuenca del Rejoso: en la zona media, de 400 a 800 m, los sistemas agroforestales necesitaron más de 80 % de cobertura arbórea para sostener la infiltración.',
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
    suelos: 'Acá sí hay suelo volcánico joven, y es el caso que motivó todo el lote. HWSD v2 da Andosols 41 %, Luvisols 21 % y Acrisols 18 %, más Leptosols, Cambisols y Regosols; SoilGrids ve sobre todo Cambisols (75 %) con 14 % de Andosols, y discrepa en el grupo pero coincide en que lo lixiviado es minoría. El reparto no es parejo: el sector este y Bali tiene 62 % de Andosols y 0 % de Acrisols, y el oeste 29 % y 28 %. En Lembang, en Java occidental, los perfiles son Typic Hapludands con solum de 150 cm o más, densidad aparente de 0,40 a 0,68 g/cm³ y **retención de fósforo mayor al 90 %**: ahí está el límite real, no en la fertilidad de base. El otro límite es la pendiente: el 62 % de los suelos volcánicos de Indonesia está sobre más del 30 %, y en el Dieng los andisoles de ladera bajo papa pasaron de unas 30 t/ha a 12-15 t/ha por desbalance de nutrientes y erosión. El dato hídrico más útil viene del Rejoso, en las laderas del Bromo: hicieron falta más de 55 % de cobertura arbórea arriba y más de 80 % en la zona media para mantener la infiltración y la erosión en niveles aceptables.',
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
    suelos: 'WWF define esta ecorregión como pantano **mineral**: terrazas aluviales profundas, fértiles y bien regadas, sin cantidades importantes de turba. Los mapas no le dan la razón. HWSD v2 da Histosols 28 %, Fluvisols dístricos 27 %, Gleysols 23 % y Podzols gleicos 16 % —arenas blancas muy pobres—; PEATMAP marca 41 % del polígono como turbera y SoilGrids llega a 96 % de Histosols, lo que sugiere que el polígono incluye bordes de las turberas vecinas. La consecuencia de diseño es dura y no es de fertilidad: **sobre turba, hacer huerta exige drenar, y drenar hunde y quema la turba** —unos 142 cm en los primeros cinco años y después alrededor de 5 cm por año, con más del 90 % por oxidación—. En la parte mineral, con pH mayor a 6, la huerta es viable con manejo del agua.',
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
    suelos: 'HWSD v2 da Acrisols 72 % y Nitisols 27 %; SoilGrids da Cambisols 83 % y Acrisols 10 %. Son 15 puntos de diferencia, y esta ficha no corrige el modificador del bioma: haría falta la cartografía de BSWM de Benguet y Mountain Province. Lo que sí está medido y pesa más que el grupo de suelo es la erosión: **sin medidas de conservación, la pérdida en Benguet es de unas 62 t/ha/año**. Sea cual sea el suelo, la ladera es el límite dominante para la huerta acá.',
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
    suelos: 'Casi toda Bukidnon es de origen volcánico, salvo el sur, que es sedimentario, y esa es justamente la trampa: **son suelos volcánicos ya meteorizados, no andisoles jóvenes**, porque el Andisol pierde sus propiedades al meteorizarse. La revisión regional los clasifica como Inceptisols, Ultisols y Alfisols, y nombra el limitante principal: la **fijación de fósforo, entre 85 y 90 % del P inorgánico agregado queda no disponible**; un pH menor a 5,5 agrega riesgo de toxicidad por aluminio. HWSD v2 da Nitisols 45 %, Acrisols 35 % y Andosols 18 %; SoilGrids da Ferralsols 44 %, Cambisols 39 % y Acrisols 12 %. Todos los suelos de altura de Bukidnon son deficientes en nitrógeno y fósforo.',
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
    suelos: 'Geología heterogénea: Mindanao y las Visayas llegaron a su posición actual en los últimos 25 millones de años, y el borde oriental tiene ofiolitas mesozoicas en Samar, Tacloban, Malitbog, el sureste de Bohol, Dinagat y Pujada. HWSD v2 da Nitisols 46 %, Acrisols 20 %, Luvisols 11 %, Cambisols 9 %, Gleysols 7 % y Andosols 4,5 %; SoilGrids da Acrisols 38 %, Ferralsols 31 % y Cambisols 27 %, o sea 68 % lixiviado contra 20 %. Esta ficha no corrige el modificador del bioma, y hay una razón más: sobre las unidades ultramáficas de Dinagat se forman **lateritas niquelíferas**, pobres en nutrientes, que ningún promedio de ecorregión representa. Eso pide una capa geológica aparte, no un número.',
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
};
