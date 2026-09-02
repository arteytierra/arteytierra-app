/**
 * Contexto ecológico y cultural del predio.
 *
 * Este archivo tiene las 12 fichas sudamericanas y el resolutor `resolverBioma`,
 * que elige entre los tres catálogos según cuánta precisión haya disponible:
 *
 *   lib/contexto.ts          12 fichas sudamericanas (por Köppen y ubicación)
 *   lib/biomasRegionales.ts  22 fichas de Norteamérica, Mesoamérica, Caribe y
 *                            Europa (por ECO_ID curado de RESOLVE)
 *   lib/biomasGlobales.ts    15 fichas de bioma global (cubren todo el planeta)
 *
 * Los "análogos" en climas parecidos del mundo se derivan de la clase Köppen y
 * son independientes de la ficha.
 *
 * Contenido curado de referencia (sin costo ni IA). Es material orientativo y de
 * divulgación; verificá con fuentes locales antes de decisiones de manejo.
 */

import type { Koppen } from './clima';
import { biomaGlobal, enSudamerica, fichaDeEcorregion, type Ecorregion } from './ecorregiones';
import { BIOMAS_REGIONALES } from './biomasRegionales';
import { BIOMAS_GLOBALES } from './biomasGlobales';
import type { BiomaFicha, Fuente, SaberCultural } from './biomaTipos';
import { ANALOGOS_KOPPEN, EQUIVALENTES, type Analogo } from './analogos';

export type { BiomaFicha, Fuente, SaberCultural };

export type BiomaId =
  | 'selva_tropical'
  | 'sabana_cerrado'
  | 'chaco_seco'
  | 'monte'
  | 'espinal'
  | 'pampa'
  | 'yungas'
  | 'puna_altoandino'
  | 'estepa_patagonica'
  | 'bosque_andino_patagonico'
  | 'mediterraneo'
  | 'desierto_costero';


// ─── Fichas por bioma ─────────────────────────────────────────────────────────

const W = (q: string) => `https://es.wikipedia.org/wiki/${encodeURIComponent(q)}`;

export const BIOMAS: Record<BiomaId, BiomaFicha> = {
  selva_tropical: {
    id: 'selva_tropical',
    nombre: 'Selva tropical y subtropical',
    emoji: '🌴',
    color: '#1B5E20',
    resumen: 'Bosque húmedo de altísima biodiversidad y biomasa, con lluvias abundantes y poca estación seca (Amazonía, selva paranaense/misionera).',
    vegetacion: 'Bosque siempreverde multiestrato, lianas, epífitas, palmeras; suelos cubiertos de hojarasca con reciclaje rápido de nutrientes.',
    fauna: 'Enorme diversidad de aves, primates, felinos (yaguareté), anfibios e insectos polinizadores.',
    suelos: 'Mayormente lateríticos/oxisoles, ácidos y pobres: la fertilidad está en la biomasa viva, no en el suelo. Cuidar la cobertura es clave.',
    saberes: [
      { cultura: 'Pueblos amazónicos (varios)', practicas: 'Chacras policultivo de mandioca, maíz, batata y frutales; manejo de "islas de bosque" y enriquecimiento del monte; las "terra preta" (tierras negras antrópicas) muestran fertilización con carbón y residuos.' },
      { cultura: 'Guaraní (selva paranaense)', practicas: 'Agricultura de claros rotativos (kokue), policultivo maíz-poroto-zapallo, aprovechamiento de yerba mate, palmito y plantas medicinales del monte.' },
      { cultura: 'Criollo/colono', practicas: 'Yerbales y cultivos bajo monte, sistemas agroforestales con sombra; el riesgo es la tala y la erosión al descubrir el suelo.' },
    ],
    especies: ['Yerba mate', 'Palmito (pindó)', 'Cedro', 'Lapacho', 'Mandioca'],
    fuentes: [
      { label: 'Selva paranaense (Wikipedia)', url: W('Selva_paranaense') },
      { label: 'Terra preta amazónica', url: W('Terra_preta') },
      { label: 'FAO — Sistemas agroforestales', url: 'https://www.fao.org/forestry/agroforestry/es/' },
    ],
  },
  sabana_cerrado: {
    id: 'sabana_cerrado',
    nombre: 'Sabana / Cerrado',
    emoji: '🌾',
    color: '#9E9D24',
    resumen: 'Pastizales con árboles dispersos y marcada estación seca; el fuego es un proceso ecológico natural (cerrado brasileño, llanos).',
    vegetacion: 'Gramíneas altas, árboles de corteza gruesa resistente al fuego, palmares en bajos húmedos.',
    fauna: 'Aves de pastizal, ciervos, oso hormiguero, gran diversidad de polinizadores.',
    suelos: 'Profundos pero ácidos y pobres en fósforo; responden bien al manejo de materia orgánica.',
    saberes: [
      { cultura: 'Pueblos de los llanos', practicas: 'Quemas controladas estacionales para renovar pasto y manejar fauna; cultivo en bajos húmedos y vegas.' },
      { cultura: 'Ganadería criolla extensiva', practicas: 'Pastoreo a campo con razas rústicas, aprovechamiento de palmares (frutos, hojas), rotación según lluvias.' },
    ],
    especies: ['Palma carandá', 'Algarrobo', 'Pastos nativos (Paspalum, Andropogon)'],
    fuentes: [
      { label: 'Cerrado (Wikipedia)', url: W('Cerrado') },
      { label: 'Sabana (Wikipedia)', url: W('Sabana') },
    ],
  },
  chaco_seco: {
    id: 'chaco_seco',
    nombre: 'Chaco seco',
    emoji: '🌵',
    color: '#A1887F',
    resumen: 'Gran llanura de bosque xerófilo cálido, con lluvias estivales y largo período seco; uno de los bosques secos más extensos del continente.',
    vegetacion: 'Quebrachos, algarrobos, mistol, bosque espinoso con cactáceas y bromeliáceas; pastizales en aperturas.',
    fauna: 'Tatú, pecarí, tortugas, gran riqueza de aves; fauna adaptada a la sequía.',
    suelos: 'Franco-arenosos a arcillosos, fértiles pero frágiles; muy sensibles a la erosión y salinización al desmontar.',
    saberes: [
      { cultura: 'Wichí, Qom (Toba), Pilagá', practicas: 'Recolección estacional de algarroba, mistol y chañar (harinas, arrope, bebidas); apicultura de meliponas (abejas sin aguijón); pesca y horticultura en costas de ríos.' },
      { cultura: 'Criollo chaqueño', practicas: 'Cría de cabras y vacunos a monte; "puestos" con aguadas y represas; aprovechamiento de la sombra y forraje del algarrobo; carbón y postes de quebracho (históricamente sobreexplotado).' },
    ],
    especies: ['Algarrobo blanco y negro', 'Quebracho colorado', 'Mistol', 'Chañar', 'Tusca'],
    fuentes: [
      { label: 'Gran Chaco (Wikipedia)', url: W('Gran_Chaco') },
      { label: 'INTA — Región Chaqueña', url: 'https://www.argentina.gob.ar/inta' },
    ],
  },
  monte: {
    id: 'monte',
    nombre: 'Monte de llanuras y mesetas',
    emoji: '🏜️',
    color: '#BCAAA4',
    resumen: 'Arbustal árido y semiárido dominado por jarillas, típico del centro-oeste argentino; muy adaptado a la escasez de agua.',
    vegetacion: 'Estepa arbustiva de jarilla, retamo, algarrobos en bajos y cauces; vegetación rala con suelo desnudo entre matas.',
    fauna: 'Guanaco, mara, zorros, reptiles; fauna de hábitos crepusculares por el calor.',
    suelos: 'Aridisoles pedregosos o arenosos, pobres en materia orgánica; salinidad frecuente en bajos.',
    saberes: [
      { cultura: 'Huarpe', practicas: 'Manejo del agua de deshielo con acequias y "lagunas" (humedales de Guanacache); cultivo en oasis, recolección de algarroba, cestería con junco.' },
      { cultura: 'Criollo cuyano/puntano', practicas: 'Acequias de riego heredadas, cría caprina a campo, jarilla como leña y medicina; sombra y forraje del algarrobo; cosecha de agua en represas.' },
    ],
    especies: ['Jarilla', 'Algarrobo dulce', 'Retamo', 'Chañar', 'Tuna/penca'],
    fuentes: [
      { label: 'Monte (ecorregión) — Wikipedia', url: W('Monte_(ecorregión)') },
      { label: 'Lagunas de Guanacache', url: W('Lagunas_de_Guanacache') },
    ],
  },
  espinal: {
    id: 'espinal',
    nombre: 'Espinal / bosque seco templado',
    emoji: '🌳',
    color: '#8D6E63',
    resumen: 'Bosques y sabanas de algarrobo y ñandubay que rodean la Pampa; transición entre el pastizal húmedo y las regiones más secas.',
    vegetacion: 'Bosque abierto de algarrobos, ñandubay, espinillo; pastizales entre los árboles.',
    fauna: 'Aves de bosque y pastizal, zorros, vizcachas; corredores de fauna entre regiones.',
    suelos: 'Fértiles, francos; gran parte transformado a agricultura y ganadería.',
    saberes: [
      { cultura: 'Pueblos del litoral y centro', practicas: 'Recolección de algarroba y frutos del monte, caza y pesca; uso de la madera dura para herramientas.' },
      { cultura: 'Criollo', practicas: 'Sistemas silvopastoriles con algarrobo y ñandubay (sombra + forraje + madera), apicultura, postes y leña; manejo del monte como reserva forrajera para la seca.' },
    ],
    especies: ['Ñandubay', 'Algarrobo', 'Espinillo (aromito)', 'Tala'],
    fuentes: [
      { label: 'Espinal (Wikipedia)', url: W('Espinal_(ecorregión)') },
      { label: 'Sistemas silvopastoriles (INTA)', url: 'https://www.argentina.gob.ar/inta' },
    ],
  },
  pampa: {
    id: 'pampa',
    nombre: 'Pampa / pastizal templado',
    emoji: '🌾',
    color: '#7CB342',
    resumen: 'Vasta llanura de pastizales templados con lluvias suficientes; una de las regiones agrícolo-ganaderas más productivas del mundo.',
    vegetacion: 'Pastizales de flechillas y otras gramíneas, sin árboles naturales salvo en bordes y barrancas.',
    fauna: 'Venado de las pampas, ñandú, aves de pastizal, gran diversidad de pastos.',
    suelos: 'Molisoles profundos, oscuros y muy fértiles; el mayor capital del bioma — cuidar estructura y materia orgánica.',
    saberes: [
      { cultura: 'Pueblos pampeanos (Het, luego mapuche-tehuelche)', practicas: 'Cultura cazadora-recolectora de guanaco y ñandú; uso del fuego para manejar el pastizal y atraer fauna; redes de intercambio.' },
      { cultura: 'Gaucho / criollo', practicas: 'Ganadería extensiva sobre pastizal natural, pastoreo trashumante histórico; el desafío actual es la rotación y la conservación del pastizal frente a la agricultura continua.' },
    ],
    especies: ['Flechilla', 'Paja colorada', 'Cortadera', 'Tala (en bordes)'],
    fuentes: [
      { label: 'Pampa (Wikipedia)', url: W('Pampa') },
      { label: 'Pastizales — Fundación Vida Silvestre', url: 'https://www.vidasilvestre.org.ar/' },
    ],
  },
  yungas: {
    id: 'yungas',
    nombre: 'Yungas / selva de montaña',
    emoji: '⛰️',
    color: '#2E7D32',
    resumen: 'Selva nubosa en laderas de montaña con fuerte gradiente de altura; "fábrica de agua" que capta humedad de las nubes.',
    vegetacion: 'Bosque montano en franjas según altitud: selva pedemontana, bosque montano nuboso y pastizales de neblina arriba.',
    fauna: 'Yaguareté, taruca, tucanes, gran endemismo; corredores altitudinales esenciales.',
    suelos: 'Suelos de ladera ricos en materia orgánica pero erosionables; la pendiente exige cobertura permanente.',
    saberes: [
      { cultura: 'Pueblos andinos del NOA (incl. influencia incaica)', practicas: 'Andenes/terrazas de cultivo en ladera para frenar erosión y ganar suelo; cultivo escalonado por pisos altitudinales (maíz abajo, papa y quinoa arriba); caminos y acopio.' },
      { cultura: 'Criollo del pedemonte', practicas: 'Agricultura de subsistencia en terrazas, ganadería trashumante (verano arriba, invierno abajo), aprovechamiento de la madera y plantas medicinales del monte.' },
    ],
    especies: ['Cedro coya', 'Nogal criollo', 'Tipa', 'Pacará', 'Maíz andino'],
    fuentes: [
      { label: 'Yungas (Wikipedia)', url: W('Yungas') },
      { label: 'Andenes / terrazas de cultivo', url: W('Andén_(agricultura)') },
    ],
  },
  puna_altoandino: {
    id: 'puna_altoandino',
    nombre: 'Puna y altoandino',
    emoji: '🏔️',
    color: '#90A4AE',
    resumen: 'Altiplano frío de gran altitud (>3000 m), seco, con fuerte radiación, heladas casi todo el año y amplísima amplitud térmica diaria.',
    vegetacion: 'Estepa de pajonales (ichu), tolas, cojines y queñoa; vegetación rala adaptada al frío y la sequía.',
    fauna: 'Vicuña, llama, guanaco, vizcacha, flamencos altoandinos en salares.',
    suelos: 'Pobres, pedregosos y de escaso desarrollo; el agua (deshielo, vertientes) es el factor limitante.',
    saberes: [
      { cultura: 'Pueblos andinos (kolla, atacama, aymara; herencia incaica)', practicas: 'Camellones/waru-waru y qochas (lagunas) para amortiguar heladas y cosechar agua; andenes; cultivo de papas amargas y su deshidratación en chuño aprovechando heladas; pastoreo de camélidos; chacras dispersas en varios pisos para repartir riesgo.' },
      { cultura: 'Criollo puneño', practicas: 'Pastoreo de llamas y ovejas, intercambio de productos entre pisos (trueque), manejo de vegas y bofedales (humedales de altura) como forraje permanente.' },
    ],
    especies: ['Ichu (paja brava)', 'Tola', 'Queñoa', 'Papa andina', 'Quinoa'],
    fuentes: [
      { label: 'Puna (Wikipedia)', url: W('Puna_(región)') },
      { label: 'Waru waru / camellones', url: W('Waru_waru') },
      { label: 'FAO — Sistemas SIPAM andinos', url: 'https://www.fao.org/giahs/es/' },
    ],
  },
  estepa_patagonica: {
    id: 'estepa_patagonica',
    nombre: 'Estepa patagónica',
    emoji: '💨',
    color: '#A1A89B',
    resumen: 'Meseta fría, seca y muy ventosa; pastizales y arbustales bajos adaptados al viento persistente del oeste.',
    vegetacion: 'Coirones (pastos en mata), arbustos bajos (neneo, calafate); cobertura rala con suelo expuesto.',
    fauna: 'Guanaco, choique (ñandú petiso), zorros, maras; fauna adaptada al frío y al viento.',
    suelos: 'Aridisoles delgados y pedregosos, muy vulnerables a la erosión eólica si se sobrepastorea.',
    saberes: [
      { cultura: 'Tehuelche y mapuche', practicas: 'Cultura cazadora-recolectora del guanaco (alimento, abrigo, toldos); trashumancia siguiendo pasturas y agua; uso de reparos naturales contra el viento.' },
      { cultura: 'Criollo patagónico', practicas: 'Ganadería ovina extensiva con manejo de carga para no degradar el coironal; uso de mallines (humedales) como reserva forrajera; cortinas y reparos contra el viento dominante del oeste.' },
    ],
    especies: ['Coirón', 'Neneo', 'Calafate', 'Mata negra'],
    fuentes: [
      { label: 'Estepa patagónica (Wikipedia)', url: W('Estepa_patagónica') },
      { label: 'Mallines patagónicos (INTA)', url: 'https://www.argentina.gob.ar/inta' },
    ],
  },
  bosque_andino_patagonico: {
    id: 'bosque_andino_patagonico',
    nombre: 'Bosque andino-patagónico',
    emoji: '🌲',
    color: '#388E3C',
    resumen: 'Bosques templado-húmedos de la cordillera sur, con lluvias y nieve abundantes; uno de los bosques templados mejor conservados.',
    vegetacion: 'Lengas, ñires, coihues, cipreses y la selva valdiviana en el oeste más húmedo.',
    fauna: 'Huemul, pudú, huillín, carpintero gigante; especies de bosque frío.',
    suelos: 'Suelos volcánicos (andisoles) jóvenes, ricos pero ácidos; alta retención de agua.',
    saberes: [
      { cultura: 'Mapuche', practicas: 'Recolección del piñón de la araucaria (pehuén) como alimento base; huertas (lof) de papa y cereales rústicos; manejo del bosque y plantas medicinales (lawen); aprovechamiento de la madera sin talar todo el monte.' },
      { cultura: 'Criollo cordillerano', practicas: 'Ganadería en claros y mallines, huertas familiares protegidas del frío, fruticultura de clima frío; manejo del fuego con cuidado por el riesgo de incendios.' },
    ],
    especies: ['Araucaria (pehuén)', 'Lenga', 'Ñire', 'Coihue', 'Ciprés de la cordillera'],
    fuentes: [
      { label: 'Bosque andino-patagónico (Wikipedia)', url: W('Bosque_andino_patagónico') },
      { label: 'Araucaria / pehuén', url: W('Araucaria_araucana') },
    ],
  },
  mediterraneo: {
    id: 'mediterraneo',
    nombre: 'Matorral mediterráneo',
    emoji: '🫒',
    color: '#C0CA33',
    resumen: 'Clima de veranos secos y calurosos e inviernos suaves y lluviosos (Chile central); matorral esclerófilo adaptado a la sequía estival.',
    vegetacion: 'Matorral y bosque esclerófilo (espino, quillay, litre), suculentas; hojas duras que resisten la seca.',
    fauna: 'Aves, reptiles y mamíferos pequeños adaptados a la estacionalidad marcada.',
    suelos: 'Variables, a menudo delgados en ladera; la lluvia invernal concentra la disponibilidad de agua.',
    saberes: [
      { cultura: 'Pueblos de Chile central', practicas: 'Cultivo aprovechando la lluvia invernal, recolección de frutos del matorral, manejo de quebradas con más humedad.' },
      { cultura: 'Tradición agrícola mediterránea', practicas: 'Secano: cultivos de invierno-primavera (trigo, legumbres), olivos y vides de bajo riego, terrazas en ladera, captación de la lluvia estacional.' },
    ],
    especies: ['Quillay', 'Espino', 'Litre', 'Olivo', 'Vid'],
    fuentes: [
      { label: 'Clima mediterráneo (Wikipedia)', url: W('Clima_mediterráneo') },
      { label: 'Bosque esclerófilo', url: W('Bosque_esclerófilo') },
    ],
  },
  desierto_costero: {
    id: 'desierto_costero',
    nombre: 'Desierto costero',
    emoji: '🌫️',
    color: '#D7CCC8',
    resumen: 'Desiertos extremadamente áridos junto al Pacífico (Atacama, Sechura) donde casi no llueve, pero la niebla (camanchaca) aporta humedad.',
    vegetacion: 'Vegetación casi ausente salvo en "lomas" de neblina que florecen con la humedad costera.',
    fauna: 'Escasa; aves marinas y fauna especializada de oasis y lomas.',
    suelos: 'Salinos y minerales, prácticamente sin materia orgánica; el agua proviene de niebla y napas, no de lluvia.',
    saberes: [
      { cultura: 'Pueblos costeros andinos', practicas: 'Aprovechamiento de oasis y ríos de deshielo, cultivo en valles, captación de humedad de las lomas; pesca y recolección marina.' },
      { cultura: 'Tecnología tradicional/contemporánea', practicas: 'Atrapanieblas (mallas que cosechan agua de la camanchaca), riego por goteo desde napas y vertientes, agricultura de oasis muy eficiente en agua.' },
    ],
    especies: ['Tamarugo', 'Cactáceas', 'Flora de lomas'],
    fuentes: [
      { label: 'Desierto de Atacama (Wikipedia)', url: W('Desierto_de_Atacama') },
      { label: 'Atrapanieblas', url: W('Atrapaniebla') },
    ],
  },
};

// ─── Clasificador de bioma ────────────────────────────────────────────────────

/**
 * Determina el bioma a partir de la clasificación Köppen, la posición y la
 * altitud (si se conoce).
 *
 * Ojo: es una heurística **sudamericana**. Las 12 fichas describen ecosistemas
 * de acá, así que aplicarla afuera devuelve resultados sin sentido (un predio
 * en Ohio comparte `Cfa` con Entre Ríos y salía "Espinal"). Fuera de Sudamérica
 * usá `resolverBioma`, que consulta la ecorregión real antes de llegar acá.
 */
export function determinarBioma(
  koppen: Koppen,
  lat: number,
  lng: number,
  elevacion?: number,
): BiomaId {
  const c = koppen.codigo;
  const grupo = c.charAt(0);
  const altoAndino = (elevacion ?? 0) >= 2800 || c === 'ET' || c === 'EF';

  // Altiplano / puna: altitud o clima polar de montaña
  if (altoAndino) return 'puna_altoandino';

  switch (grupo) {
    case 'A': // Tropical
      return (c === 'Af' || c === 'Am') ? 'selva_tropical' : 'sabana_cerrado';

    case 'B': { // Árido
      const frio = c.endsWith('k');
      // Desierto costero del Pacífico (Atacama/Sechura)
      if (c.startsWith('BW') && lng < -68 && lat < -13 && lat > -31) return 'desierto_costero';
      // Patagonia fría y ventosa
      if (frio && lat < -38) return 'estepa_patagonica';
      // Chaco seco (cálido, latitudes bajas del norte argentino/Paraguay/Bolivia)
      if (!frio && lat > -27) return 'chaco_seco';
      // Resto: Monte
      return 'monte';
    }

    case 'C': { // Templado
      if (c.startsWith('Cs')) return 'mediterraneo';
      if ((c === 'Cfb' || c === 'Cfc') && lat < -38) return 'bosque_andino_patagonico';
      if (c.startsWith('Cw')) return 'yungas';            // invierno seco subtropical de altura → NOA
      if (c === 'Cfa') return lat > -28 ? 'espinal' : 'pampa';
      return 'pampa';
    }

    case 'D': // Continental (raro en LatAm, sur frío de montaña)
      return 'bosque_andino_patagonico';

    default:
      return 'monte';
  }
}

export function fichaBioma(id: BiomaId): BiomaFicha {
  return BIOMAS[id];
}

/**
 * Busca una ficha por id en los tres catálogos, de la más específica a la más
 * gruesa: sudamericanas → regionales → biomas globales. Null si no existe.
 */
export function fichaPorId(id: string): BiomaFicha | null {
  return (BIOMAS as Record<string, BiomaFicha | undefined>)[id]
      ?? BIOMAS_REGIONALES[id]
      ?? BIOMAS_GLOBALES[id]
      ?? null;
}

// ─── Resolución en tres niveles ───────────────────────────────────────────────

export type FuenteBioma = 'ecorregion' | 'bioma_global' | 'koppen';

export interface ResultadoBioma {
  /** Ficha regional curada, si la hay para esta ecorregión. */
  ficha:      BiomaFicha | null;
  /** Título a mostrar siempre: nombre de la ficha, del bioma global o del Köppen. */
  titulo:     string;
  emoji:      string;
  /** Ecorregión exacta según RESOLVE, cuando se pudo consultar. */
  ecorregion: Ecorregion | null;
  fuente:     FuenteBioma;
  /** Qué le falta al resultado, en palabras. Vacío si la ficha es específica. */
  aviso:      string | null;
}

/**
 * Ubica el predio en el nivel más específico disponible.
 *
 * 1. ECO_ID con ficha curada → ficha regional.
 * 2. ECO_ID sin ficha        → bioma global de RESOLVE (dato real, sin ficha).
 * 3. Sin ecorregión          → Köppen, y sólo dentro de Sudamérica.
 *
 * El paso 3 nunca se aplica afuera: preferimos decir "no tenemos ficha" antes
 * que describir un predio de Kansas con la vegetación del Espinal.
 */
export function resolverBioma(
  koppen: Koppen,
  lat: number,
  lng: number,
  elevacion?: number,
  eco?: Ecorregion | null,
): ResultadoBioma {
  if (eco) {
    const fichaId = fichaDeEcorregion(eco.eco_id);
    const ficha = fichaId ? fichaPorId(fichaId) : null;
    if (ficha) {
      return { ficha, titulo: ficha.nombre, emoji: ficha.emoji, ecorregion: eco, fuente: 'ecorregion', aviso: null };
    }
    // Adentro de Sudamérica antes mandaba la heurística Köppen cuando la
    // ecorregión no tenía ficha. Con las 56 ecorregiones sudamericanas curadas
    // eso dejó de convenir: lo que queda sin ficha es justamente lo que la
    // heurística clasifica mal —Sechura daba "Chaco seco", el páramo daba
    // "Puna"—, porque son ecosistemas que las 12 fichas argentinas no describen.
    // Sabiendo la ecorregión real, el bioma global es un dato; la heurística,
    // una conjetura. Manda el dato, y el aviso dice qué falta.
    const global = biomaGlobal(eco.bioma_num);
    const fichaG = global ? fichaPorId(global.id) : null;
    return {
      ficha: fichaG,
      titulo: fichaG?.nombre ?? global?.nombre ?? eco.bioma_name,
      emoji:  fichaG?.emoji ?? global?.emoji ?? '🌍',
      ecorregion: eco,
      fuente: 'bioma_global',
      aviso: `Descripción a escala de bioma: todavía no tenemos ficha regional para ${eco.eco_name}, así que no listamos especies ni saberes locales.`,
    };
  }

  if (enSudamerica(lat, lng)) {
    const ficha = fichaBioma(determinarBioma(koppen, lat, lng, elevacion));
    return { ficha, titulo: ficha.nombre, emoji: ficha.emoji, ecorregion: null, fuente: 'koppen', aviso: null };
  }

  return {
    ficha: null,
    titulo: koppen.descripcion,
    emoji:  '🌍',
    ecorregion: null,
    fuente: 'koppen',
    aviso: 'No se pudo consultar la ecorregión. Mostramos sólo la clasificación climática: las fichas de ecosistema de acequia todavía cubren Sudamérica.',
  };
}

// ─── Análogos por clima (Köppen) ──────────────────────────────────────────────

export type { Analogo };

export interface Analogos extends Analogo {
  /** Presente cuando la clase del predio no tiene ficha propia y se usó otra. */
  aviso: string | null;
}

/**
 * Devuelve los análogos de la clase Köppen del predio.
 *
 * `null` cuando no hay nada honesto que mostrar: `EF` (hielo permanente) no
 * tiene sistema agrícola análogo, y una clase que no reconocemos tampoco.
 */
export function analogosDeKoppen(koppen: Koppen): Analogos | null {
  const directo = ANALOGOS_KOPPEN[koppen.codigo];
  if (directo) return { ...directo, aviso: null };

  const equivalente = EQUIVALENTES[koppen.codigo];
  const ficha = equivalente ? ANALOGOS_KOPPEN[equivalente] : undefined;
  if (ficha) {
    return {
      ...ficha,
      aviso: `Tu predio es ${koppen.codigo} y todavía no tenemos análogos documentados para esa clase. Mostramos los de ${ficha.clase}, la más parecida en régimen de temperatura y lluvia.`,
    };
  }

  return null;
}
