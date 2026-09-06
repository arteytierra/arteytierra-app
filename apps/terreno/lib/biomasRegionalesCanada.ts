/**
 * Fichas regionales de Canadá y Groenlandia.
 *
 * ESCRITO A MANO, a diferencia de los otros tres bloques. La lista de qué
 * escribir salió de enumerar contra el FeatureServer de RESOLVE todas las
 * ecorregiones de la envolvente canadiense y restar las que ya tenían ficha
 * (ver el encabezado de `ecorregionesCanada.ts`); el contenido de cada ficha se
 * apoya en el Marco Ecológico Nacional de Canadá, en el sistema canadiense de
 * clasificación de suelos y en la clasificación biogeoclimática de Columbia
 * Británica, que son las tres cartografías con las que estas regiones se
 * describen en su propio país.
 *
 * `saberes` va vacío en todas, igual que en los bloques generados. Estas son
 * tierras de las Primeras Naciones, los Inuit, los Métis y los Kalaallit, y
 * atribuirle prácticas a un pueblo porque el predio cayó adentro de su
 * ecorregión es exactamente lo que la capa de `lib/saberes.ts` existe para no
 * hacer: sin geometría con procedencia, licencia y acuerdo, no se activa nada.
 *
 * Las diez fichas describen 22 ECO_ID. Los agrupamientos no son por número sino
 * por cómo se comportan el suelo y el agua: el escudo cerrado va aparte de la
 * taiga abierta con permafrost, el desierto polar aparte de la tundra
 * arbustiva, y la montaña ártica aparte de las dos.
 */

import type { BiomaFicha } from './biomaTipos';

/** Las cartografías de referencia, repetidas en casi todas las fichas. */
const CANSIS_ECO = { label: 'CanSIS — Marco Ecológico Nacional de Canadá', url: 'https://sis.agr.gc.ca/cansis/nsdb/ecostrat/index.html' };
const CANSIS_SUELOS = { label: 'CanSIS — Suelos de Canadá', url: 'https://sis.agr.gc.ca/cansis/soils/index.html' };
const RESOLVE = { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' };
const BEC_BC = { label: 'BC — Biogeoclimatic Ecosystem Classification', url: 'https://www2.gov.bc.ca/gov/content/environment/plants-animals-ecosystems/ecosystems/biogeoclimatic-ecosystem-classification' };
const CAFF = { label: 'CAFF — Conservation of Arctic Flora and Fauna', url: 'https://www.caff.is/' };

export const BIOMAS_REGIONALES_CANADA: Record<string, BiomaFicha> = {
  // CA · ECO_ID 335 · la única del lote con agricultura de campo abierto
  san_lorenzo_tierras_bajas: {
    id: 'san_lorenzo_tierras_bajas',
    nombre: 'Tierras bajas del golfo de San Lorenzo',
    emoji: '🍁',
    color: '#7C6A4A',
    resumen: 'La franja marítima baja del golfo —la Isla del Príncipe Eduardo entera, el este de Nuevo Brunswick, las Islas de la Magdalena y las costas de Gaspesia y el oeste de Terranova—, donde el bosque acadiense de transición se apoya sobre areniscas rojas y el mar modera el invierno pero acorta igual la temporada a unos 140 días libres de helada.',
    vegetacion: 'Bosque acadiense mixto: abeto rojo y balsámico, pino blanco, arce azucarero, abedul amarillo y arce rojo, con alerce y abeto negro en los bajos anegados y matorral de arándano y ericáceas en los claros arenosos.',
    fauna: 'Alce, venado de cola blanca, liebre americana, zorro y marta; salmón del Atlántico y trucha de mar en los ríos cortos, y limícolas migratorias que usan las marismas y los bancos de arena del golfo.',
    suelos: 'Podzoles férrico-húmicos sobre arenisca roja pérmica: francos arenosos, ácidos, pobres en materia orgánica y muy erosionables. Es el suelo rojo de la papa de la Isla del Príncipe Eduardo, y la rotación corta lo deja desnudo justo cuando llegan las lluvias de otoño. Cortinas rompeviento, cultivos de cobertura, rotaciones largas y franjas en contorno pesan más acá que cualquier elección de variedad; el viento salino y el drenaje lento de los bajos completan el cuadro.',
    saberes: [],
    especies: [
      'Abeto rojo (Picea rubens)',
      'Abeto balsámico (Abies balsamea)',
      'Arce azucarero (Acer saccharum)',
      'Abedul amarillo (Betula alleghaniensis)',
      'Alerce americano (Larix laricina)',
    ],
    cultivos: ['maiz_tropical', 'soja', 'trigo', 'avena', 'arce_azucarero', 'manzano', 'arandano', 'trebol_blanco'],
    fuentes: [CANSIS_ECO, CANSIS_SUELOS, RESOLVE],
  },

  // CA · ECO_ID 345, 350, 355
  columbia_britanica_interior: {
    id: 'columbia_britanica_interior',
    nombre: 'Interior de Columbia Británica y piedemonte de Alberta',
    emoji: '🏔️',
    color: '#4E6B55',
    resumen: 'La mitad interior de Columbia Británica y el piedemonte albertano: mesetas y cuencas de origen glaciar entre cordones, con un cinturón húmedo en los Montes Columbia y valles francamente secos en la meseta del Fraser. El fuego y las plagas, no la sequía, son lo que reorganiza este bosque.',
    vegetacion: 'Pino contorta, abeto Douglas del interior, piceas blanca y de Engelmann y abeto subalpino; cedro rojo y tsuga en el cinturón húmedo interior, y álamo temblón, pinares abiertos y pastizal de manojo en los fondos de valle.',
    fauna: 'Alce, wapití, ciervo mula, oso negro y grizzly, lobo, y el caribú de montaña, en retroceso severo; el Fraser y sus afluentes sostienen las corridas de salmón que alimentan a todo el sistema.',
    suelos: 'Luvisoles grises y Brunisoles sobre till glaciar, con limos lacustres profundos en la cuenca del Fraser y Podzoles en el cinturón húmedo. Son suelos jóvenes, bien provistos pero fáciles de compactar con maquinaria; en las mesetas, la helada tardía y las bolsas de aire frío marcan el calendario más que la lluvia.',
    saberes: [],
    especies: [
      'Pino contorta (Pinus contorta var. latifolia)',
      'Abeto Douglas del interior (Pseudotsuga menziesii var. glauca)',
      'Picea de Engelmann (Picea engelmannii)',
      'Cedro rojo occidental (Thuja plicata)',
      'Álamo temblón (Populus tremuloides)',
    ],
    cultivos: ['trigo', 'cebada', 'colza', 'papa', 'manzano', 'alfalfa', 'raigras', 'espino_amarillo'],
    fuentes: [BEC_BC, CANSIS_ECO, RESOLVE],
  },

  // CA, US · ECO_ID 362 · el de más valor agrícola del lote
  okanagan_bosque_seco: {
    id: 'okanagan_bosque_seco',
    nombre: 'Bosque seco del Okanagan',
    emoji: '🍇',
    color: '#A2864F',
    resumen: 'El valle del Okanagan y su continuación al sur de la frontera, en el norte del estado de Washington: la esquina más seca del bosque templado norteamericano, con 250 a 400 mm al año a la sombra de lluvia de la Cascada. Es a la vez zona frutícola y vitícola de primer orden y una de las más pobres en agua de todo Canadá.',
    vegetacion: 'Pino ponderosa y abeto Douglas abiertos ladera arriba; abajo, pastizal de manojo con artemisa y antelope-brush, uno de los ecosistemas más amenazados del país.',
    fauna: 'Borrego cimarrón de California, tejón, murciélagos, búho llanero, cascabel del oeste y carpintero de Lewis; el fondo de valle concentra el endemismo y también el desarrollo.',
    suelos: 'Brunisoles y Chernozems oscuros en los fondos de valle, sobre arenas y gravas glaciofluviales de retención muy baja y drenaje rápido. Casi toda la producción es bajo riego desde el lago y los arroyos, así que el cuello de botella no es el suelo sino la asignación de agua y la eficiencia del riego; a eso se suman heladas tardías en los bajos, salinización en parcelas mal drenadas y un régimen de incendio que la supresión volvió más violento.',
    saberes: [],
    especies: [
      'Pino ponderosa (Pinus ponderosa)',
      'Antelope-brush (Purshia tridentata)',
      'Pasto azul de manojo (Pseudoroegneria spicata)',
      'Artemisa (Artemisia tridentata)',
      'Álamo negro del oeste (Populus trichocarpa)',
    ],
    cultivos: ['vid', 'manzano', 'cerezo', 'durazno', 'damasco', 'cebolla', 'lavanda', 'alfalfa'],
    aptitud: [
      { uso: 'frutales', delta: 15, razon: 'El Okanagan es la región frutícola de Canadá: amplitud térmica marcada y un lago que modera la helada. El cuello de botella es la asignación de riego y la eficiencia, no el suelo.' },
    ],
    fuentes: [BEC_BC, CANSIS_SUELOS, RESOLVE],
  },

  // CA · ECO_ID 365
  haida_gwaii_hipermaritimo: {
    id: 'haida_gwaii_hipermaritimo',
    nombre: 'Bosque hipermarítimo de Haida Gwaii',
    emoji: '🌲',
    color: '#2F5B4F',
    resumen: 'El archipiélago de Haida Gwaii, frente a la costa norte de Columbia Británica: selva templada lluviosa con más de 2000 mm al año, sin helada fuerte, y un mosaico de bosque viejo, turbera de meseta y matorral de viento en los cabos expuestos.',
    vegetacion: 'Picea de Sitka, tsuga occidental, cedro rojo y ciprés amarillo; en los planos mal drenados, bosque de turbera achaparrado con esfagno, y en los taludes, helechos y musgos que cubren todo.',
    fauna: 'Alto endemismo insular —oso negro, marta y aves con subespecies propias— y colonias de aves marinas; la introducción del venado de cola negra arrasó el sotobosque y es hoy el principal problema de regeneración del cedro.',
    suelos: 'Folisoles sobre roca y Podzoles muy lixiviados, con horizontes orgánicos profundos y saturación casi permanente. La fertilidad está en la capa de hojarasca, no en el mineral: drenar sin pensar y pisar el orgánico son las dos formas rápidas de perderla. Deslizamientos en las laderas descubiertas y viento salino en la costa completan el manejo.',
    saberes: [],
    especies: [
      'Picea de Sitka (Picea sitchensis)',
      'Cedro rojo occidental (Thuja plicata)',
      'Ciprés amarillo (Callitropsis nootkatensis)',
      'Tsuga occidental (Tsuga heterophylla)',
      'Salal (Gaultheria shallon)',
    ],
    cultivos: ['papa', 'avena', 'arandano', 'raigras', 'trebol_blanco', 'sauce_mimbre'],
    fuentes: [BEC_BC, CANSIS_ECO, RESOLVE],
  },

  // CA · ECO_ID 370, 373, 377
  escudo_canadiense_boreal: {
    id: 'escudo_canadiense_boreal',
    nombre: 'Bosque boreal cerrado del escudo canadiense',
    emoji: '🌲',
    color: '#3B5F44',
    resumen: 'La faja de bosque boreal continuo sobre roca precámbrica: Abitibi, Lac-Saint-Jean, Saguenay, el norte de Ontario y Manitoba, el este de Quebec y Terranova insular. Bosque cerrado, decenas de miles de lagos, y un ciclo de fuego de un siglo o siglo y medio que es el que arma el mosaico.',
    vegetacion: 'Abeto negro, abeto balsámico, pino banksiano, álamo temblón y abedul papelero, sobre un colchón continuo de musgos plumosos y esfagno en los bajos.',
    fauna: 'Alce, oso negro, lobo, marta, castor y el caribú forestal, en declive por la fragmentación; somorgujos, patos y paseriformes boreales usan la red de lagos y turberas para nidificar.',
    suelos: 'Podzoles delgados sobre till y roca desnuda, ácidos y con poca reserva de bases. La excepción es el Cinturón de Arcilla de Abitibi y Cochrane, con arcillas lacustres profundas, donde sí hay forraje y ganadería: ahí el problema se invierte —drenaje lento, riesgo de compactación en húmedo y una temporada de 90 a 110 días que obliga a ciclos cortos.',
    saberes: [],
    especies: [
      'Abeto negro (Picea mariana)',
      'Pino banksiano (Pinus banksiana)',
      'Abeto balsámico (Abies balsamea)',
      'Álamo temblón (Populus tremuloides)',
      'Abedul papelero (Betula papyrifera)',
    ],
    cultivos: ['papa', 'avena', 'cebada', 'arandano', 'alforfon', 'arroz_salvaje', 'trebol_blanco'],
    aptitud: [
      { uso: 'pasturas', delta: 10, razon: 'El Cinturón de Arcilla de Abitibi y Cochrane rompe la regla del Escudo: arcilla lacustre profunda, con forraje y ganadería reales. Ahí el problema se invierte y pasa a ser drenaje lento y compactación en húmedo, no falta de suelo.' },
    ],
    fuentes: [CANSIS_ECO, CANSIS_SUELOS, RESOLVE],
  },

  // CA · ECO_ID 374, 378, 379, 381, 382, 383
  taiga_canadiense_permafrost: {
    id: 'taiga_canadiense_permafrost',
    nombre: 'Taiga abierta con permafrost',
    emoji: '🪨',
    color: '#5C6E63',
    resumen: 'La taiga rala del norte: el escudo de Ungava y Labrador, Muskwa-Slave Lake, el delta del Mackenzie, las tierras bajas del sur de la bahía de Hudson y los altos del Yukón. El árbol se espacia hasta que manda el liquen, y por debajo hay permafrost discontinuo o esporádico que decide todo el drenaje.',
    vegetacion: 'Bosque abierto de abeto negro y alerce con tapiz de líquenes Cladonia; abedul enano, té del Labrador, arándanos y sauces en los bordes, y turberas de esfagno con palsas en los planos.',
    fauna: 'Caribú de la tundra en migración y caribú boreal residente, lobo, glotón y alce en los valles fluviales; oso polar en la costa de Hudson, y una de las concentraciones de aves acuáticas nidificantes más grandes del continente en las tierras bajas.',
    suelos: 'Criosoles con capa activa de 30 a 100 cm, suelos orgánicos profundos y Gleysoles en los planos; las tierras bajas de Hudson son una de las turberas más extensas del planeta y un reservorio de carbono de primer orden. El deshielo del permafrost cambia el drenaje y la portancia en pocos años: termokarst, colapso de palsas y taludes que fluyen. Acá el manejo no es agronómico sino de qué no tocar.',
    saberes: [],
    especies: [
      'Abeto negro (Picea mariana)',
      'Alerce americano (Larix laricina)',
      'Abedul enano (Betula glandulosa)',
      'Té del Labrador (Rhododendron groenlandicum)',
      'Liquen de reno (Cladonia rangiferina)',
    ],
    cultivos: ['papa', 'cebada', 'arandano'],
    fuentes: [CANSIS_ECO, CANSIS_SUELOS, CAFF],
  },

  // CA · ECO_ID 413, 414
  tundra_artica_canadiense: {
    id: 'tundra_artica_canadiense',
    nombre: 'Tundra ártica canadiense',
    emoji: '❄️',
    color: '#8AA0A6',
    resumen: 'La tundra continental y de las islas del sur del archipiélago, del Bajo y el Medio Ártico: sin árboles, con permafrost continuo, suelo estructurado en polígonos y una temporada de crecimiento de seis a diez semanas en que todo ocurre a la vez.',
    vegetacion: 'Tundra arbustiva de abedul enano y sauces bajos al sur, que se abre hacia el norte en tapiz de cárices, algodonera, Dryas, musgos y líquenes; los arbustos vienen avanzando hacia el norte con el calentamiento.',
    fauna: 'Grandes manadas de caribú de la tundra, buey almizclero, oso grizzly de la barren ground, zorro ártico, lemming —cuyos ciclos gobiernan a los depredadores— y millones de aves acuáticas y limícolas que nidifican en verano.',
    suelos: 'Criosoles túrbicos y estáticos sobre permafrost continuo, con crioturbación que da suelo poligonal, círculos de piedras y montículos de escarcha. La capa activa rara vez pasa los 80 cm, el agua no percola y el drenaje es lateral sobre el hielo. Cualquier perturbación de la cubierta vegetal profundiza el deshielo y es difícil de revertir.',
    saberes: [],
    especies: [
      'Abedul enano (Betula glandulosa)',
      'Sauce ártico (Salix arctica)',
      'Algodonera (Eriophorum vaginatum)',
      'Dryas (Dryas integrifolia)',
      'Liquen de reno (Cladonia rangiferina)',
    ],
    fuentes: [CAFF, CANSIS_SUELOS, RESOLVE],
  },

  // CA · ECO_ID 412
  alto_artico_desierto_polar: {
    id: 'alto_artico_desierto_polar',
    nombre: 'Desierto polar del Alto Ártico',
    emoji: '🧊',
    color: '#9FAFB8',
    resumen: 'Las islas del norte del archipiélago —Ellesmere, Devon, Axel Heiberg, Melville—: desierto polar con menos de 150 mm de precipitación al año, cobertura vegetal por debajo del 20 % en buena parte y meses enteros sin sol. Los oasis térmicos de fondo de fiordo concentran casi toda la vida.',
    vegetacion: 'Plantas en cojín y rastreras sobre suelo desnudo: sajifraga púrpura, Dryas, sauce ártico postrado, amapola ártica, musgos y costras de líquenes en las lajas.',
    fauna: 'Buey almizclero, caribú de Peary —en situación crítica—, liebre y zorro árticos, lobo blanco y búho nival; la costa y las polinias sostienen morsas, focas y aves marinas.',
    suelos: 'Criosoles estáticos y regosólicos de desierto polar, casi sin horizonte orgánico, con crioturbación, suelo poligonal de cuña de hielo y sales en superficie por evaporación. La formación de suelo es tan lenta que la huella de un vehículo puede quedar marcada durante décadas.',
    saberes: [],
    especies: [
      'Sajifraga púrpura (Saxifraga oppositifolia)',
      'Amapola ártica (Papaver radicatum)',
      'Sauce ártico (Salix arctica)',
      'Dryas (Dryas integrifolia)',
      'Cochlearia ártica (Cochlearia groenlandica)',
    ],
    fuentes: [CAFF, CANSIS_ECO, RESOLVE],
  },

  // CA · ECO_ID 415, 421
  montana_artica_baffin_torngat: {
    id: 'montana_artica_baffin_torngat',
    nombre: 'Montaña ártica: Baffin oriental y Torngat',
    emoji: '⛰️',
    color: '#77848F',
    resumen: 'Las cordilleras árticas del este: el borde montañoso de la isla de Baffin sobre el estrecho de Davis y la sierra Torngat, entre Nunavik y Labrador. Fiordos profundos, paredes de mil metros, campos de hielo y glaciares de valle; la vegetación ocupa apenas los bolsones protegidos.',
    vegetacion: 'Cobertura discontinua de musgos, líquenes y plantas en cojín sobre pedrera; en los fondos de valle y las laderas al reparo, matorral bajo de sauce, Cassiope, arándano y cárices.',
    fauna: 'Caribú de la manada Torngat, oso polar en la costa y —caso poco común a esta latitud— oso negro en los valles de la sierra; halcón gerifalte, salvelino ártico en los ríos y focas en los fiordos.',
    suelos: 'Suelos esqueléticos: Criosoles regosólicos y pedreras sobre gneis precámbrico, con horizonte orgánico sólo en las depresiones. La solifluxión, las avalanchas y los aludes de detrito mueven las laderas todos los años, y la retracción de los glaciares está exponiendo material morrénico todavía sin colonizar.',
    saberes: [],
    especies: [
      'Sauce lanudo (Salix lanata)',
      'Brezo ártico (Cassiope tetragona)',
      'Arándano rojo (Vaccinium vitis-idaea)',
      'Sajifraga púrpura (Saxifraga oppositifolia)',
      'Salvelino ártico (Salvelinus alpinus)',
    ],
    fuentes: [CAFF, CANSIS_ECO, RESOLVE],
  },

  // GL · ECO_ID 417, 418
  groenlandia_kalaallit_nunaat: {
    id: 'groenlandia_kalaallit_nunaat',
    nombre: 'Kalaallit Nunaat: la franja libre de hielo de Groenlandia',
    emoji: '🐑',
    color: '#6E8579',
    resumen: 'El borde de Groenlandia que el casquete deja libre. Al sur y en los fiordos interiores hay una estepa ártica sorprendentemente seca y abrigada —200 a 400 mm al año— donde se cría oveja y se cultiva forraje y hortaliza de raíz; al norte y al noreste, tundra de alto Ártico casi desnuda. El interior helado no entra en esta ficha: cae en roca y hielo.',
    vegetacion: 'Al sur, brezal enano de camarina y arándano con abedul enano, sauce gris y praderas de gramíneas en los fondos de fiordo; al norte, cojines dispersos, Dryas y líquenes sobre grava.',
    fauna: 'Buey almizclero, reno, liebre y zorro árticos, halcón gerifalte y, en el sur, pigargo europeo; los fiordos y las costas concentran focas, ballenas y colonias de aves marinas.',
    suelos: 'Criosoles y Regosoles delgados sobre morrena y arena glaciofluvial, muy sensibles a la deflación: el viento catabático levanta el suelo desnudo y las tormentas de polvo de los valles interiores son un fenómeno documentado. El pastoreo ovino del sur ya dejó erosión visible en las laderas, y una temporada libre de helada corta y variable obliga a asegurar el forraje antes que a buscar rendimiento.',
    saberes: [],
    especies: [
      'Abedul enano (Betula nana)',
      'Sauce gris (Salix glauca)',
      'Camarina negra (Empetrum nigrum)',
      'Angélica (Angelica archangelica)',
      'Dryas (Dryas octopetala)',
    ],
    cultivos: ['papa', 'cebada', 'raigras', 'trebol_blanco'],
    fuentes: [
      { label: 'Pinngortitaleriffik — Instituto de Recursos Naturales de Groenlandia', url: 'https://natur.gl/' },
      CAFF,
      RESOLVE,
    ],
  },
};
