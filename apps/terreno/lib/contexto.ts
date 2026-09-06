/**
 * Contexto ecológico y cultural del predio.
 *
 * Este archivo tiene las 12 fichas sudamericanas y el resolutor `resolverBioma`,
 * que elige entre los tres catálogos según cuánta precisión haya disponible:
 *
 *   lib/contexto.ts          12 fichas sudamericanas (por Köppen y ubicación)
 *   lib/biomasRegionales.ts  210 fichas de Norteamérica, Canadá, Mesoamérica,
 *                            Caribe, Europa y sus asociados, Medio Oriente, el
 *                            norte de África mediterráneo y el resto de
 *                            Sudamérica (por ECO_ID curado de RESOLVE)
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
  | 'selva_paranaense'
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

/**
 * Lo que puede devolver la heurística climática: las 12 fichas de acá más las
 * dos sudamericanas regionales que el clima sí alcanza a distinguir. La
 * Amazonía y el páramo salieron de las 12 en el montaje de Sudamérica y
 * devolver la ficha vecina "parecida" era justamente el error a eliminar.
 */
export type BiomaHeuristicaId = BiomaId
  | 'amazonia_oriental_tierra_firme'
  | 'paramos_andinos';


// ─── Fichas por bioma ─────────────────────────────────────────────────────────

const W = (q: string) => `https://es.wikipedia.org/wiki/${encodeURIComponent(q)}`;

export const BIOMAS: Record<BiomaId, BiomaFicha> = {
  selva_paranaense: {
    id: 'selva_paranaense',
    nombre: 'Selva paranaense',
    emoji: '🌴',
    color: '#1B5E20',
    resumen: 'Selva subtropical húmeda del Alto Paraná —Misiones, el sur de Brasil y el este del Paraguay—, de altísima biodiversidad, con marcada estacionalidad térmica y sin estación seca larga.',
    vegetacion: 'Bosque siempreverde multiestrato, lianas, epífitas, palmeras; suelos cubiertos de hojarasca con reciclaje rápido de nutrientes.',
    fauna: 'Enorme diversidad de aves, primates, felinos (yaguareté), anfibios e insectos polinizadores.',
    suelos: 'Mayormente lateríticos/oxisoles, ácidos y pobres: la fertilidad está en la biomasa viva, no en el suelo. Cuidar la cobertura es clave.',
    saberes: [
      { cultura: 'Guaraní (selva paranaense)', practicas: 'Agricultura de claros rotativos (kokue), policultivo maíz-poroto-zapallo, aprovechamiento de yerba mate, palmito y plantas medicinales del monte.' },
      { cultura: 'Criollo/colono', practicas: 'Yerbales y cultivos bajo monte, sistemas agroforestales con sombra; el riesgo es la tala y la erosión al descubrir el suelo.' },
    ],
    especies: [
      'Yerba mate (Ilex paraguariensis)',
      'Palmito / pindó (Euterpe edulis)',
      'Cedro misionero (Cedrela fissilis)',
      'Lapacho negro (Handroanthus heptaphyllus)',
      'Guatambú (Balfourodendron riedelianum)',
      'Palo rosa (Aspidosperma polyneuron)',
      'Ambay (Cecropia pachystachya)',
    ],
    cultivos: ['yerba_mate', 'maracuya', 'cana_azucar', 'naranjo', 'maiz_tropical', 'poroto_trepador', 'yuca', 'crotalaria', 'vetiver'],
    aptitud: [
      { uso: 'huerta', delta: -20, razon: 'La fertilidad está en la hojarasca, no en el suelo rojo: descubierto se lava en dos o tres temporadas. Va en claro chico y con cobertura permanente.' },
      { uso: 'forestal', delta: 20, razon: 'El sistema que sostiene esta selva es agroforestal de varios estratos —yerbal bajo monte— antes que la parcela de suelo limpio.' },
      { uso: 'reserva', delta: 10, razon: 'Queda menos de la décima parte de la selva original: cada parche en pie vale más como conexión entre montes que como lote.' },
    ],
    fuentes: [
      { label: 'Fundación Vida Silvestre — Bosque Atlántico del Alto Paraná', url: 'https://www.vidasilvestre.org.ar/' },
      { label: 'Ministerio de Ecología de Misiones', url: 'https://ecologia.misiones.gob.ar/' },
      { label: 'INTA — yerba mate y sistemas bajo monte', url: 'https://www.argentina.gob.ar/inta' },
    ],
  },
  sabana_cerrado: {
    id: 'sabana_cerrado',
    nombre: 'Cerrado',
    emoji: '🌾',
    color: '#9E9D24',
    resumen: 'Sabana arbolada del altiplano central brasileño, con marcada estación seca y suelos profundos; el fuego es un proceso ecológico natural, no una anomalía.',
    vegetacion: 'Gramíneas altas, árboles de corteza gruesa resistente al fuego, palmares en bajos húmedos.',
    fauna: 'Aves de pastizal, ciervos, oso hormiguero, gran diversidad de polinizadores.',
    suelos: 'Profundos pero ácidos y pobres en fósforo; responden bien al manejo de materia orgánica.',
    saberes: [
      { cultura: 'Pueblos de sabana', practicas: 'Quemas controladas estacionales para renovar pasto y manejar fauna; cultivo en bajos húmedos y vegas.' },
      { cultura: 'Ganadería criolla extensiva', practicas: 'Pastoreo a campo con razas rústicas, aprovechamiento de palmares (frutos, hojas), rotación según lluvias.' },
    ],
    especies: [
      'Pequi (Caryocar brasiliense)',
      'Baru (Dipteryx alata)',
      'Buriti (Mauritia flexuosa)',
      'Carandá (Copernicia alba)',
      'Ipê do cerrado (Handroanthus ochraceus)',
      'Pastos nativos (Paspalum, Andropogon)',
    ],
    cultivos: ['sorgo', 'maiz_tropical', 'arroz', 'cana_azucar', 'guandul', 'crotalaria', 'pasto_elefante', 'vetiver'],
    aptitud: [
      { uso: 'huerta', delta: -10, razon: 'Suelo profundo pero ácido y muy pobre en fósforo: la huerta recién arranca después de varios años de materia orgánica.' },
      { uso: 'pasturas', delta: 10, razon: 'El pastizal con árboles dispersos es la forma nativa del bioma; la ganadería bien cargada lo imita en vez de reemplazarlo.' },
      { uso: 'reserva', delta: 5, razon: 'El fuego es parte del ecosistema, pero las veredas y bajos húmedos son el refugio que no se quema: conviene dejarlos aparte.' },
    ],
    fuentes: [
      { label: 'Embrapa Cerrados', url: 'https://www.embrapa.br/cerrados' },
      { label: 'MapBiomas — cobertura y uso del suelo en Brasil', url: 'https://brasil.mapbiomas.org/' },
      { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' },
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
    especies: [
      'Quebracho colorado santiagueño (Schinopsis lorentzii)',
      'Algarrobo blanco (Neltuma alba)',
      'Algarrobo negro (Neltuma nigra)',
      'Mistol (Ziziphus mistol)',
      'Chañar (Geoffroea decorticans)',
      'Tusca (Vachellia aroma)',
      'Palo santo (Bulnesia sarmientoi)',
    ],
    cultivos: ['maiz_tropical', 'sorgo', 'zapallo_milpa', 'poroto_trepador', 'cebolla', 'mistol', 'algarrobo_ar', 'chanar'],
    aptitud: [
      { uso: 'huerta', delta: -15, razon: 'Suelos fértiles pero frágiles: desmontados y a suelo desnudo se erosionan y se salinizan rápido. La huerta va con media sombra y reparo.' },
      { uso: 'pasturas', delta: -10, razon: 'La carga alta a monte abierto es la causa principal de degradación acá; el silvopastoril con sombra sostiene más animales que el desmonte.' },
      { uso: 'forestal', delta: 15, razon: 'Algarrobo, quebracho y mistol dan sombra, forraje y madera sin descubrir el suelo: es el uso que el bioma banca mejor.' },
    ],
    fuentes: [
      { label: 'INTA — Región Chaqueña', url: 'https://www.argentina.gob.ar/inta' },
      { label: 'Ministerio de Ambiente — Bosques nativos (Ley 26.331)', url: 'https://www.argentina.gob.ar/ambiente/bosques' },
      { label: 'FAO — sistemas silvopastoriles', url: 'https://www.fao.org/forestry/agroforestry/es/' },
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
    especies: [
      'Jarilla (Larrea divaricata, L. cuneifolia)',
      'Algarrobo dulce (Neltuma flexuosa)',
      'Retamo (Bulnesia retama)',
      'Chañar (Geoffroea decorticans)',
      'Tuna / penca (Opuntia sulphurea)',
      'Zampa (Atriplex lampa)',
    ],
    cultivos: ['vid', 'olivo', 'durazno', 'nogal', 'cebolla', 'alfalfa', 'algarrobo_ar', 'chanar'],
    aptitud: [
      { uso: 'huerta', delta: -25, razon: 'Sin riego no hay huerta: la lluvia del año no cubre ni un ciclo corto. Donde llega acequia, vertiente o napa la cuenta cambia por completo.' },
      { uso: 'pasturas', delta: -15, razon: 'La cobertura entre matas es rala y no se repone sola: el sobrepastoreo deja suelo desnudo y el viento se lleva lo poco que hay.' },
      { uso: 'reserva', delta: 10, razon: 'El jarillal tarda décadas en volver; conservar la mata en pie sale mucho más barato que restaurarla.' },
    ],
    fuentes: [
      { label: 'IADIZA-CONICET — ecología de zonas áridas', url: 'https://www.mendoza.conicet.gov.ar/portal/iadiza/' },
      { label: 'INTA — Mendoza y San Juan', url: 'https://www.argentina.gob.ar/inta' },
      { label: 'Lagunas de Guanacache, Desaguadero y del Bebedero (sitio Ramsar)', url: 'https://rsis.ramsar.org/ris/1467' },
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
    especies: [
      'Ñandubay (Neltuma affinis)',
      'Algarrobo negro (Neltuma nigra)',
      'Espinillo / aromito (Vachellia caven)',
      'Tala (Celtis ehrenbergiana)',
      'Chañar (Geoffroea decorticans)',
      'Flechilla (Nassella spp.)',
    ],
    cultivos: ['trigo', 'avena', 'girasol', 'maiz_tropical', 'naranjo', 'alfalfa', 'trebol_blanco', 'algarrobo_ar'],
    aptitud: [
      { uso: 'forestal', delta: 15, razon: 'El silvopastoril con algarrobo y ñandubay —sombra, forraje y madera sobre el mismo pastizal— es la forma histórica del bioma y la que mejor aguanta la seca.' },
      { uso: 'pasturas', delta: 5, razon: 'El pastizal bajo bosque abierto es el estado nativo: la pastura no compite con el monte, se complementan.' },
      { uso: 'reserva', delta: 5, razon: 'El Espinal es de los bosques nativos más reducidos del país; los relictos con árboles viejos ya casi no se reponen.' },
    ],
    fuentes: [
      { label: 'INTA — sistemas silvopastoriles del Espinal', url: 'https://www.argentina.gob.ar/inta' },
      { label: 'Ministerio de Ambiente — Bosques nativos (Ley 26.331)', url: 'https://www.argentina.gob.ar/ambiente/bosques' },
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
    especies: [
      'Flechilla (Nassella, Jarava spp.)',
      'Paja colorada (Paspalum quadrifarium)',
      'Cortadera (Cortaderia selloana)',
      'Pasto miel (Paspalum dilatatum)',
      'Tala (Celtis ehrenbergiana)',
      'Coronillo (Scutia buxifolia)',
    ],
    cultivos: ['trigo', 'maiz_tropical', 'girasol', 'durazno', 'avena', 'veza', 'alfalfa', 'trebol_blanco'],
    aptitud: [
      { uso: 'huerta', delta: 10, razon: 'Molisoles profundos y bien provistos: pocas veces vas a encontrar mejor suelo de huerta, mientras no se compacte.' },
      { uso: 'pasturas', delta: 10, razon: 'El pastizal es el ecosistema nativo, y la pastura rotada es lo que repone la materia orgánica que la agricultura continua saca.' },
      { uso: 'forestal', delta: -10, razon: 'No hay bosque nativo acá salvo en bordes y barrancas: forestar el pastizal cambia el bioma en lugar de trabajarlo.' },
      { uso: 'reserva', delta: 5, razon: 'Queda muy poco pastizal pampeano sin arar: un potrero de pastizal natural es hoy un bien escaso.' },
    ],
    fuentes: [
      { label: 'Alianza del Pastizal', url: 'https://alianzadelpastizal.org.ar/' },
      { label: 'INTA — pastizales naturales y manejo del pastoreo', url: 'https://www.argentina.gob.ar/inta' },
      { label: 'Fundación Vida Silvestre — Pastizales', url: 'https://www.vidasilvestre.org.ar/' },
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
    especies: [
      'Cedro coya (Cedrela lilloi)',
      'Nogal criollo (Juglans australis)',
      'Tipa blanca (Tipuana tipu)',
      'Pacará (Enterolobium contortisiliquum)',
      'Aliso del cerro (Alnus acuminata)',
      'Queñoa (Polylepis australis)',
      'Laurel de la falda (Cinnamomum porphyrium)',
    ],
    cultivos: ['cafe', 'cana_azucar', 'naranjo', 'aguacate', 'maiz_tropical', 'poroto_trepador', 'inga', 'nogal_cafetero', 'vetiver'],
    aptitud: [
      { uso: 'huerta', delta: -15, razon: 'La pendiente con lluvia fuerte se lleva el suelo apenas queda descubierto: acá la huerta va en terraza o andén, nunca en tabla corrida.' },
      { uso: 'forestal', delta: 20, razon: 'La selva de ladera es la que captura el agua de la nube y la entrega abajo; el uso que la mantiene en pie es el de varios estratos.' },
      { uso: 'reserva', delta: 10, razon: 'Los corredores altitudinales son lo que permite que la fauna suba y baje con la estación: cortarlos aísla al predio y a los vecinos.' },
    ],
    fuentes: [
      { label: 'Fundación ProYungas', url: 'https://proyungas.org.ar/' },
      { label: 'INTA — Yungas y pedemonte del NOA', url: 'https://www.argentina.gob.ar/inta' },
      { label: 'FAO — terrazas y andenes de ladera', url: 'https://www.fao.org/giahs/es/' },
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
    especies: [
      'Ichu / paja brava (Jarava ichu)',
      'Tola (Parastrephia lepidophylla)',
      'Queñoa (Polylepis tarapacana)',
      'Yareta (Azorella compacta)',
      'Cardón (Echinopsis atacamensis)',
      'Papa amarga (Solanum juzepczukii)',
      'Quinoa (Chenopodium quinoa)',
    ],
    cultivos: ['quinoa', 'papa', 'oca', 'ulluco', 'tarwi', 'amaranto', 'cebada', 'alfalfa'],
    aptitud: [
      { uso: 'huerta', delta: -20, razon: 'La helada es casi diaria y la radiación quema: sin muro, camellón o qocha que amortigüe, la huerta no pasa el año.' },
      { uso: 'frutales', delta: -25, razon: 'No hay una ventana libre de helada lo bastante larga como para que un frutal cierre ciclo.' },
      { uso: 'pasturas', delta: -10, razon: 'La estepa de ichu repone muy lento; el forraje de verdad está en las vegas y bofedales, que son chicos y se degradan rápido.' },
      { uso: 'reserva', delta: 10, razon: 'Vegas y bofedales son el corazón hídrico de la cuenca: valen más protegidos que pastoreados.' },
    ],
    fuentes: [
      { label: 'FAO SIPAM — sistemas agrícolas andinos', url: 'https://www.fao.org/giahs/es/' },
      { label: 'INTA — Puna, camélidos y bofedales', url: 'https://www.argentina.gob.ar/inta' },
      { label: 'Waru waru / camellones', url: W('Waru_waru') },
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
    especies: [
      'Coirón blanco (Festuca pallescens)',
      'Coirón amargo (Pappostipa speciosa)',
      'Neneo (Mulinum spinosum)',
      'Calafate (Berberis microphylla)',
      'Mata negra (Junellia tridens)',
      'Junco de mallín (Juncus balticus)',
    ],
    cultivos: ['papa', 'cebada', 'avena', 'cerezo', 'manzano', 'alfalfa', 'trebol_blanco', 'sauce_mimbre'],
    aptitud: [
      { uso: 'huerta', delta: -20, razon: 'El viento del oeste seca y quiebra: sin cortina y sin riego no hay huerta que prospere, por bueno que sea el suelo.' },
      { uso: 'frutales', delta: -15, razon: 'Sólo cierran con reparo y riego, como en los valles bajo riego; a campo abierto el viento arranca la flor antes del cuaje.' },
      { uso: 'pasturas', delta: -15, razon: 'El coironal se degrada con carga alta y no vuelve: la erosión eólica es la forma que toma el sobrepastoreo acá.' },
      { uso: 'reserva', delta: 10, razon: 'Los mallines son una porción mínima de la superficie y la mayor parte del forraje: protegerlos es lo que sostiene todo lo demás.' },
    ],
    fuentes: [
      { label: 'INTA Bariloche — manejo de pastizales y mallines patagónicos', url: 'https://www.argentina.gob.ar/inta' },
      { label: 'Observatorio Nacional de Degradación de Tierras y Desertificación', url: 'https://www.desertificacion.gob.ar/' },
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
    especies: [
      'Araucaria / pehuén (Araucaria araucana)',
      'Lenga (Nothofagus pumilio)',
      'Ñire (Nothofagus antarctica)',
      'Coihue (Nothofagus dombeyi)',
      'Ciprés de la cordillera (Austrocedrus chilensis)',
      'Maitén (Maytenus boaria)',
      'Michay (Berberis darwinii)',
    ],
    cultivos: ['manzano', 'cerezo', 'arandano', 'papa', 'avellano_chileno', 'trebol_blanco', 'sauce_mimbre', 'aliso'],
    aptitud: [
      { uso: 'huerta', delta: 5, razon: 'Los andisoles volcánicos retienen agua y materia orgánica: la huerta anda bien una vez corregida la acidez.' },
      { uso: 'frutales', delta: 10, razon: 'La fruta fina de clima frío —cereza, arándano, manzana— encuentra acá el frío invernal que pide y un verano sin lluvia sobre la fruta.' },
      { uso: 'forestal', delta: 15, razon: 'Manejo del bosque nativo antes que reemplazo por plantación: el ñire y la lenga se aprovechan sin talar el monte entero.' },
      { uso: 'reserva', delta: 10, razon: 'Es uno de los bosques templados mejor conservados del planeta, y el fuego es lo único que lo revierte de golpe.' },
    ],
    fuentes: [
      { label: 'CIEFAP — Centro de Investigación y Extensión Forestal Andino Patagónico', url: 'https://ciefap.org.ar/' },
      { label: 'Administración de Parques Nacionales', url: 'https://www.argentina.gob.ar/parquesnacionales' },
      { label: 'CONAF — bosque nativo (Chile)', url: 'https://www.conaf.cl/' },
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
    especies: [
      'Quillay (Quillaja saponaria)',
      'Espino (Vachellia caven)',
      'Litre (Lithrea caustica)',
      'Peumo (Cryptocarya alba)',
      'Boldo (Peumus boldus)',
      'Palma chilena (Jubaea chilensis)',
      'Chagual (Puya chilensis)',
    ],
    cultivos: ['vid', 'olivo', 'aguacate', 'almendro', 'cerezo', 'durazno', 'trigo', 'higuera', 'veza'],
    aptitud: [
      { uso: 'huerta', delta: -10, razon: 'La lluvia cae en invierno y la huerta pide agua en verano: sin acumulación o riego, ese desfasaje decide todo el diseño.' },
      { uso: 'frutales', delta: 15, razon: 'Olivo, vid y almendro son de este clima exacto: producen con el agua del invierno y agradecen el verano seco.' },
      { uso: 'reserva', delta: 5, razon: 'El matorral esclerófilo se recupera del fuego pero no del despeje repetido; la quebrada con más humedad es el núcleo a dejar en pie.' },
    ],
    fuentes: [
      { label: 'CONAF — bosque esclerófilo y sequía', url: 'https://www.conaf.cl/' },
      { label: 'INIA Chile — agricultura de secano mediterráneo', url: 'https://www.inia.cl/' },
      { label: 'Ministerio del Medio Ambiente de Chile', url: 'https://mma.gob.cl/' },
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
    especies: [
      'Tamarugo (Prosopis tamarugo)',
      'Algarrobo del norte (Neltuma chilensis)',
      'Cactus candelabro (Browningia candelaris)',
      'Flora de lomas (Nolana spp.)',
      'Añañuca (Rhodophiala spp.)',
      'Tillandsia de niebla (Tillandsia landbeckii)',
    ],
    cultivos: ['datilera', 'granado', 'vid', 'olivo', 'cebolla', 'alfalfa', 'nopal', 'tamarugo'],
    aptitud: [
      { uso: 'huerta', delta: -30, razon: 'No llueve. Todo cultivo depende de napa, río de deshielo o atrapanieblas: sin una de las tres, no hay huerta posible.' },
      { uso: 'frutales', delta: -20, razon: 'Sólo en oasis con agua asegurada; a secano ningún frutal cierra ciclo acá.' },
      { uso: 'pasturas', delta: -25, razon: 'No hay pasto que reponer: la carga ganadera sobre las lomas de neblina las destruye y no vuelven.' },
      { uso: 'reserva', delta: 15, razon: 'Las lomas de neblina son endemismo puro y florecen sólo algunos años: se protegen o se pierden.' },
    ],
    fuentes: [
      { label: 'CONAF — Reserva Nacional Pampa del Tamarugal', url: 'https://www.conaf.cl/' },
      { label: 'INIA Chile — agricultura del desierto de Atacama', url: 'https://www.inia.cl/' },
      { label: 'SERNANP Perú — lomas costeras', url: 'https://www.gob.pe/sernanp' },
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
): BiomaHeuristicaId {
  const c = koppen.codigo;
  const grupo = c.charAt(0);
  const altoAndino = (elevacion ?? 0) >= 2800 || c === 'ET' || c === 'EF';

  // Altiplano de altura. Al norte del paralelo 8° S la montaña húmeda es
  // páramo, no puna: recibe 1000-2000 mm al año contra menos de 400. Sin la
  // ecorregión no hay dato de lluvia acá, y la latitud es la única señal que
  // separa dos ecosistemas opuestos en lo único que importa para diseñar.
  if (altoAndino) return lat > -8 ? 'paramos_andinos' : 'puna_altoandino';

  switch (grupo) {
    case 'A': // Tropical
      // Tropical siempre húmedo en Sudamérica es, por superficie, Amazonía. La
      // selva paranaense es Cfa y se resuelve más abajo; mandar la Amazonía a
      // la ficha del Alto Paraná era el error que arregló el montaje.
      return (c === 'Af' || c === 'Am') ? 'amazonia_oriental_tierra_firme' : 'sabana_cerrado';

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
      // Misiones y el Alto Paraná: Cfa, pero selva, no espinal.
      if (c === 'Cfa' && lat > -28.5 && lat < -24 && lng > -57) return 'selva_paranaense';
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
 * Le presta a una ficha regional los modificadores de aptitud de su bioma.
 *
 * La corrección de aptitud vive en las fichas de bioma global —ahí es donde una
 * restricción de uso del suelo es cierta sin inventar nada— pero la ficha que
 * llega a la pantalla es la regional cuando existe. Sin este préstamo pasaba lo
 * contrario de lo buscado: **cuanto mejor cubierta estaba una región, menos
 * corrección recibía**, porque tener ficha regional tapaba la del bioma. Un
 * predio en Oaxaca o en el Cauca perdía la advertencia que sí veía uno en un
 * ECO_ID sin curar.
 *
 * La ficha regional que declara su propia lista manda: es más específica. Se
 * devuelve una copia para no ensuciar el catálogo, que es un módulo compartido.
 */
function conAptitudDelBioma(ficha: BiomaFicha, biomaNum: number): BiomaFicha {
  if (ficha.aptitud?.length) return ficha;
  const global = biomaGlobal(biomaNum);
  const heredada = global ? fichaPorId(global.id)?.aptitud : undefined;
  return heredada?.length ? { ...ficha, aptitud: heredada } : ficha;
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
      return {
        ficha: conAptitudDelBioma(ficha, eco.bioma_num),
        titulo: ficha.nombre, emoji: ficha.emoji,
        ecorregion: eco, fuente: 'ecorregion', aviso: null,
      };
    }
    // Adentro de Sudamérica antes mandaba la heurística Köppen cuando la
    // ecorregión no tenía ficha. Con las 56 ecorregiones sudamericanas curadas
    // eso dejó de convenir: lo que queda sin ficha es justamente lo que la
    // heurística clasifica mal —Sechura daba "Chaco seco", el páramo daba
    // "Puna"—, porque son ecosistemas que las 12 fichas argentinas no describen.
    // Sabiendo la ecorregión real, el bioma global es un dato; la heurística,
    // una conjetura. Manda el dato, y el aviso dice qué falta.
    // RESOLVE etiqueta la roca y el hielo con ECO_ID 0 y BIOME_NAME "N/A",
    // pero les deja BIOME_NUM 11 —tundra—, que no es lo que son: un glaciar
    // no tiene el suelo ni la vegetación de la tundra. El bioma 98 de la
    // propia tabla de RESOLVE sí los describe, así que corregimos el dato.
    const biomaNum = eco.eco_id === 0 ? 98 : eco.bioma_num;
    const global = biomaGlobal(biomaNum);
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
    // fichaPorId y no fichaBioma: la heurística puede devolver una ficha
    // regional sudamericana, que vive en el otro catálogo.
    const ficha = fichaPorId(determinarBioma(koppen, lat, lng, elevacion))!;
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
