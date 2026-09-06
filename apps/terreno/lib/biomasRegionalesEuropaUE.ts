/**
 * Fichas regionales del resto de la Unión Europea y de los países asociados.
 *
 * ESCRITO A MANO, igual que el bloque canadiense y por la misma razón: la
 * lista de qué escribir salió de enumerar contra el FeatureServer de RESOLVE
 * en vez de heredarla de un paquete de investigación (ver el encabezado de
 * `ecorregionesEuropaUE.ts`, que también deja escrito qué quedó afuera y por
 * qué). Son 28 fichas para 34 ECO_ID.
 *
 * Los agrupamientos no siguen el número de ECO_ID sino cómo se comportan el
 * suelo y el agua: el karst dinárico va aparte del Adriático ilirio aunque se
 * toquen, la morrena joven del Báltico aparte del podzol arenoso sarmático, y
 * la meseta anatolia con su acuífero sobreexplotado aparte de la montaña del
 * Tauro que la alimenta.
 *
 * `saberes` va vacío en todas. No es una omisión: es la misma regla del resto
 * del catálogo. Un predio que cae dentro de una ecorregión no autoriza a
 * atribuirle prácticas a la trashumancia de los Balcanes ni a los polders
 * neerlandeses; sin geometría con procedencia, licencia y acuerdo, la capa de
 * `lib/saberes.ts` no activa nada.
 */

import type { BiomaFicha } from './biomaTipos';

/** Cartografías de referencia, repetidas en casi todas las fichas. */
const ESDAC = { label: 'ESDAC — Centro Europeo de Datos de Suelo (JRC)', url: 'https://esdac.jrc.ec.europa.eu/' };
const ATLAS_SUELOS = { label: 'JRC — Soil Atlas of Europe', url: 'https://esdac.jrc.ec.europa.eu/content/soil-atlas-europe' };
const EEA_BIO = { label: 'AEMA — Regiones biogeográficas de Europa', url: 'https://www.eea.europa.eu/en/datahub' };
const RESOLVE = { label: 'RESOLVE Ecoregions 2017', url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017' };
const WRB = { label: 'WRB — Base Referencial Mundial del Recurso Suelo (FAO)', url: 'https://www.fao.org/soils-portal/data-hub/soil-classification/world-reference-base/es/' };
const SOILGRIDS = { label: 'ISRIC — SoilGrids', url: 'https://soilgrids.org/' };
const LANDGRAEDSLAN = { label: 'Landgræðslan — Servicio islandés de conservación de suelos', url: 'https://land.is/' };
const TARIM = { label: 'Türkiye — Ministerio de Agricultura y Bosques', url: 'https://www.tarimorman.gov.tr/' };

export const BIOMAS_REGIONALES_EUROPA_UE: Record<string, BiomaFicha> = {
  // IT · ECO_ID 675 · la llanura más productiva del sur de Europa
  po_llanura_aluvial: {
    id: 'po_llanura_aluvial',
    nombre: 'Llanura aluvial del Po',
    emoji: '🌾',
    color: '#8C9A4E',
    resumen: 'La cuenca del Po entre los Alpes y los Apeninos, casi enteramente convertida hace siglos: es la llanura agrícola más productiva del sur de Europa y también la más regada. El agua no llega de la lluvia de verano sino del deshielo alpino y de los fontanili, las surgencias de la línea donde la grava del piedemonte se topa con los limos.',
    vegetacion: 'Del bosque original de roble, olmo, fresno y carpe quedan manchones y las hileras de álamo y sauce sobre los canales. Hoy domina el arrozal, el maíz, la alfalfa y el álamo de plantación, con setos vivos donde sobrevivió la parcelación antigua.',
    fauna: 'Garza real y garcilla bueyera sobre los arrozales, cigüeñuela, corzo, jabalí y zorro en las riberas; el esturión del Adriático y el propio Po perdieron casi todo por represas y contaminación difusa.',
    suelos: 'Fluvisoles y Cambisoles profundos sobre aluviones calcáreos, con Gleysoles en los bajos y suelos gruesos de grava en el abanico del piedemonte. Fertilidad alta y capacidad de retención buena, pero el problema es de manejo: compactación por maquinaria pesada, pérdida de materia orgánica bajo monocultivo de maíz y nitratos que llegan al freático, que acá está a pocos metros. El riego por gravedad heredado recarga el acuífero y sostiene los fontanili; sustituirlo por goteo baja el consumo bruto y a la vez seca las surgencias, y esa es la disyuntiva real de la cuenca.',
    saberes: [],
    especies: [
      'Álamo negro (Populus nigra)',
      'Roble carballo (Quercus robur)',
      'Fresno oxifilo (Fraxinus angustifolia)',
      'Carpe blanco (Carpinus betulus)',
      'Sauce blanco (Salix alba)',
    ],
    cultivos: ['arroz', 'maiz_tropical', 'soja', 'remolacha_azucarera', 'vid', 'durazno', 'manzano', 'alfalfa'],
    aptitud: [
      { uso: 'huerta', delta: 10, razon: 'Fluvisoles profundos con freática a pocos metros: fertilidad y retención altas. Lo que limita es el manejo —compactación, pérdida de materia orgánica y nitratos—, no la capacidad del suelo.' },
    ],
    fuentes: [ATLAS_SUELOS, ESDAC, RESOLVE],
  },

  // IT · ECO_ID 644, 802
  apeninos_montano: {
    id: 'apeninos_montano',
    nombre: 'Montaña apenínica',
    emoji: '⛰️',
    color: '#6B7A52',
    resumen: 'La espina de la península, del norte de la Toscana a Calabria: haya arriba, castaño y roble abajo, y un sustrato de flysch y arcillas escamosas que hace de esta la montaña más deslizante de Europa occidental. El agua es abundante en invierno y desaparece en verano.',
    vegetacion: 'Hayedo por encima de los 900–1000 m, castañar y robledal de quejigo y roble albar por debajo, con pinares de pino laricio en Calabria y pastizales de altura mantenidos por siglos de pastoreo estival.',
    fauna: 'Lobo apenínico, oso marsicano en los Abruzos, gato montés, corzo y jabalí; buitre leonado reintroducido y águila real en los cortados.',
    suelos: 'Cambisoles y Regosoles poco profundos sobre flysch margoso-arenoso y arcillas escamosas, con Leptosoles en las crestas calcáreas. La erosión no es difusa sino en cárcavas —los calanchi— y en deslizamientos de ladera entera cuando la arcilla se satura. Todo lo que decide acá es la cobertura permanente: el terraceo antiguo, el castañar injertado y los pastizales con carga controlada sostienen la ladera mucho más que cualquier enmienda; el abandono del terraceo es la principal causa de los desprendimientos actuales.',
    saberes: [],
    especies: [
      'Haya (Fagus sylvatica)',
      'Castaño (Castanea sativa)',
      'Quejigo (Quercus pubescens)',
      'Pino laricio de Calabria (Pinus nigra subsp. laricio)',
      'Abeto blanco (Abies alba)',
    ],
    cultivos: ['castano', 'trigo', 'olivo', 'vid', 'papa', 'lenteja', 'nogal', 'raigras'],
    fuentes: [ATLAS_SUELOS, EEA_BIO, RESOLVE],
  },

  // IT, MT, FR · ECO_ID 795, 806
  mediterraneo_italiano_insular: {
    id: 'mediterraneo_italiano_insular',
    nombre: 'Mediterráneo tirreno-adriático e insular',
    emoji: '🫒',
    color: '#7E8B5A',
    resumen: 'La franja costera de la península y las islas del Tirreno y el canal de Sicilia: Cerdeña, Sicilia, Córcega, el archipiélago toscano, Malta, Lampedusa. Verano seco de tres a cinco meses, lluvia concentrada en episodios cortos y violentos, y una historia agrícola de terrazas que hoy se está cayendo por abandono.',
    vegetacion: 'Encinar y alcornocal, maquis de lentisco, brezo, mirto y jara, y garriga en los suelos más delgados; pino carrasco y pino piñonero en las dunas y las laderas costeras, con olivo, viña, algarrobo y almendro como cultivo permanente de siempre.',
    fauna: 'Muflón y ciervo sardo, gato montés, jabalí, tortuga mora, halcón de Eleonora en los acantilados isleños y pardela cenicienta en las colonias marinas.',
    suelos: 'Luvisoles crómicos y terra rossa sobre caliza, Regosoles y Leptosoles en las laderas, y Arenosoles en los cordones litorales. Poco profundos, pedregosos, con pH alto y muy poca materia orgánica: el límite no es la fertilidad sino el agua almacenada y la profundidad efectiva de raíz. La terraza de piedra seca es la infraestructura hidrológica de esta región —frena el escurrimiento del aguacero y alarga la reserva— y cuando se derrumba la pérdida de suelo en un solo evento supera lo que se acumula en décadas. En las islas, la salinización del acuífero costero por sobreextracción es el otro techo.',
    saberes: [],
    especies: [
      'Encina (Quercus ilex)',
      'Alcornoque (Quercus suber)',
      'Lentisco (Pistacia lentiscus)',
      'Algarrobo (Ceratonia siliqua)',
      'Pino carrasco (Pinus halepensis)',
    ],
    cultivos: ['olivo', 'vid', 'naranjo', 'almendro', 'higuera', 'trigo', 'alcornoque', 'algarrobo_es'],
    fuentes: [ATLAS_SUELOS, ESDAC, RESOLVE],
  },

  // SI, HR, BA, ME, RS, AL · ECO_ID 660
  dinaricos_karst: {
    id: 'dinaricos_karst',
    nombre: 'Karst de los Alpes Dináricos',
    emoji: '🕳️',
    color: '#5F7A63',
    resumen: 'La cadena que corre de Eslovenia a Albania paralela al Adriático, y el karst más estudiado del mundo —la palabra viene de acá—. Llueve muchísimo, hasta 3000 mm al año en Montenegro, y aun así la superficie está seca: el agua se va por las fisuras y reaparece kilómetros más lejos.',
    vegetacion: 'Hayedo-abetal en las alturas, carpe negro y roble en las laderas bajas, y pastizales y matorral de enebro en las mesetas deforestadas por siglos de pastoreo y de tala para la marina veneciana.',
    fauna: 'Oso pardo, lobo y lince —la población dinárica es de las mayores de Europa—, rebeco balcánico, y una fauna subterránea única, con el proteo de las cuevas como especie insignia.',
    suelos: 'Leptosoles y Cambisoles cálcicos en bolsones sobre caliza y dolomía, con acumulaciones profundas de terra rossa sólo en las dolinas y los poljes. La superficie útil es discontinua: el suelo está en los huecos, no en las laderas. La regla del karst manda todo el manejo: no hay escurrimiento superficial que captar, y lo que se aplica arriba —purines, fertilizante, combustible— llega al acuífero en horas y sale en el manantial del que bebe el pueblo de abajo. Los poljes, que se inundan estacionalmente, son la única tierra de labor seria y a la vez la más expuesta.',
    saberes: [],
    especies: [
      'Haya (Fagus sylvatica)',
      'Abeto blanco (Abies alba)',
      'Carpe negro (Ostrya carpinifolia)',
      'Pino negro dinárico (Pinus nigra subsp. dalmatica)',
      'Enebro común (Juniperus communis)',
    ],
    cultivos: ['papa', 'centeno', 'castano', 'vid', 'olivo', 'lavanda', 'raigras', 'trebol_blanco'],
    aptitud: [
      { uso: 'huerta', delta: -15, razon: 'Sobre caliza el suelo está en los huecos, no en las laderas: la tierra de labor son las dolinas y los poljes, y en el polje el riesgo pasa a ser la inundación estacional.' },
      { uso: 'reserva', delta: 15, razon: 'Lo que se aplica arriba llega al acuífero en horas y sale en el manantial del que bebe el pueblo de abajo. Acá la protección del agua manda sobre la elección de uso.' },
    ],
    fuentes: [ATLAS_SUELOS, EEA_BIO, RESOLVE],
  },

  // HR, BA, ME, AL, SI · ECO_ID 794
  iliria_adriatico: {
    id: 'iliria_adriatico',
    nombre: 'Bosque caducifolio ilirio',
    emoji: '🌳',
    color: '#6E8455',
    resumen: 'La banda de transición entre la costa dálmata y el interior dinárico —Istria, la Lika, la Bosnia occidental, el norte de Albania—, donde el clima mediterráneo se va volviendo continental a medida que se sube. Es de las zonas de Europa con mayor diversidad de árboles caducifolios, porque acá sobrevivieron especies que la glaciación borró más al norte.',
    vegetacion: 'Robledales de quejigo y roble albar, carpe blanco y negro, fresno de flor, tilo y arce; castañares en los suelos ácidos y hayedo en la parte alta, con manchas de bosque relicto de sorbos y cerezos silvestres.',
    fauna: 'Corzo, jabalí, gato montés, chacal dorado en expansión, lobo y oso en el contacto con los Dináricos; quirópteros cavernícolas en las dolinas y una entomofauna de bosque maduro poco común en Europa.',
    suelos: 'Cambisoles eútricos y Luvisoles sobre marga, arenisca y caliza fisurada, más profundos y de mejor retención que los del karst puro. Es el suelo agrícola real de la región: los valles de Istria y la Posavina bosnia sostienen viña, olivo, frutales y forraje. La erosión aparece cuando se labra la ladera; el manejo que funciona es el mismo de siempre acá, parcela pequeña con seto vivo, frutal de secano y pradera permanente en la pendiente fuerte.',
    saberes: [],
    especies: [
      'Roble albar (Quercus petraea)',
      'Carpe negro (Ostrya carpinifolia)',
      'Fresno de flor (Fraxinus ornus)',
      'Tilo de hoja pequeña (Tilia cordata)',
      'Cerezo silvestre (Prunus avium)',
    ],
    cultivos: ['maiz_tropical', 'trigo', 'vid', 'castano', 'manzano', 'nogal', 'durazno', 'trebol_blanco'],
    fuentes: [ATLAS_SUELOS, EEA_BIO, RESOLVE],
  },

  // RS, BG, RO, MK, GR · ECO_ID 646
  balcanes_mixto: {
    id: 'balcanes_mixto',
    nombre: 'Bosque mixto balcánico',
    emoji: '🍂',
    color: '#7A7A45',
    resumen: 'El interior de la península balcánica: Serbia, el norte de Macedonia, buena parte de Bulgaria y el sur de Rumanía. Continental de verdad —invierno frío, verano caluroso y seco—, con la lluvia repartida pero con un déficit de julio y agosto que decide el rendimiento de todo lo que se siembra en secano.',
    vegetacion: 'Robledales de cerro, roble húngaro y quejigo en las lomas, carpe y tilo en las umbrías, hayedo por encima de los 800 m; matorral de espino, endrino y lilo silvestre en los bordes y pastizal seco en las solanas.',
    fauna: 'Corzo, jabalí, chacal dorado, lobo en las sierras, tortuga mediterránea y una comunidad de rapaces de campo abierto —aguilucho cenizo, cernícalo primilla— que depende del mosaico agrícola tradicional.',
    suelos: 'Cambisoles eútricos y Luvisoles sobre loess y sedimentos terciarios, con Vertisoles arcillosos —los smonitza— en las cuencas y Chernozems degradados en el borde con la llanura panónica. Son suelos buenos y profundos; el problema es el agua de verano y la erosión de las lomas cuando se labra en la pendiente. Los Vertisoles se agrietan al secarse y se vuelven intrabajables al mojarse, y la ventana de laboreo puede ser de días: en esas tierras la siembra directa y la cobertura permanente valen más que cualquier fertilización.',
    saberes: [],
    especies: [
      'Roble cerro (Quercus cerris)',
      'Roble húngaro (Quercus frainetto)',
      'Haya (Fagus sylvatica)',
      'Carpe blanco (Carpinus betulus)',
      'Endrino (Prunus spinosa)',
    ],
    cultivos: ['trigo', 'maiz_tropical', 'girasol', 'vid', 'durazno', 'castano', 'nogal', 'alfalfa'],
    fuentes: [ATLAS_SUELOS, EEA_BIO, RESOLVE],
  },

  // BG, GR, MK, AL, RS · ECO_ID 678, 801
  montana_balcanica_sur: {
    id: 'montana_balcanica_sur',
    nombre: 'Montaña balcánica meridional: Ródope y Pindo',
    emoji: '🐑',
    color: '#5E6E4A',
    resumen: 'Los macizos del sur de la península —Ródope, Rila y Pirin del lado búlgaro, Pindo del griego y albanés—, donde el Mediterráneo se cruza con lo continental y la altura define todo. Es el territorio de la trashumancia balcánica: siglos de rebaños subiendo en primavera y bajando en otoño construyeron el paisaje que hoy se ve.',
    vegetacion: 'Hayedo y abetal de abeto griego y de Bulgaria en la franja media, pinares de pino negro y pino silvestre en el piso superior, con pino bosnio en las crestas calcáreas del Pindo; pastizal alpino y subalpino arriba, y robledal y castañar en los fondos de valle.',
    fauna: 'Oso pardo, lobo, rebeco balcánico, cabra montés de Creta en poblaciones introducidas, y el buitre negro y el quebrantahuesos, que dependen directamente de que siga habiendo ganadería extensiva.',
    suelos: 'Cambisoles dístricos y Podzoles sobre granito, gneis y esquisto en el Ródope, y Leptosoles rendzínicos sobre caliza en el Pindo: dos comportamientos distintos bajo el mismo clima. Los ácidos retienen agua y materia orgánica pero fijan el fósforo; los calcáreos drenan de inmediato y no perdonan una tormenta con el suelo desnudo. El agua llega del deshielo y baja rápido: en las dos mitades lo que sostiene la ladera es el pastizal con carga ajustada y el bosque de ribera, y el abandono del pastoreo está cerrando los claros y aumentando el riesgo de incendio de copa.',
    saberes: [],
    especies: [
      'Pino negro (Pinus nigra)',
      'Pino bosnio (Pinus heldreichii)',
      'Abeto griego (Abies cephalonica)',
      'Haya oriental (Fagus sylvatica subsp. orientalis)',
      'Pino silvestre (Pinus sylvestris)',
    ],
    cultivos: ['papa', 'centeno', 'cebada', 'castano', 'nogal', 'manzano', 'lavanda', 'trebol_blanco'],
    fuentes: [ATLAS_SUELOS, EEA_BIO, RESOLVE],
  },

  // DK, DE, PL, SE, LT · ECO_ID 647
  baltico_morrena: {
    id: 'baltico_morrena',
    nombre: 'Bosque mixto báltico sobre morrena joven',
    emoji: '🌾',
    color: '#6F8468',
    resumen: 'La franja del sur del Báltico —Dinamarca, el norte de Alemania, el norte de Polonia, el sur de Suecia—, construida entera por el último glaciar hace apenas diez mil años. Morrena de fondo arcillosa, cordones de arena, y miles de lagos y turberas en los huecos que dejó el hielo al derretirse.',
    vegetacion: 'Hayedo y robledal-carpinal en la morrena rica, pinar sobre los arenales, alisedas y bosques pantanosos en los bajos; hoy es de los paisajes más agrícolas de Europa, con cereal, colza y pradera y el bosque reducido a rodales y cortinas.',
    fauna: 'Corzo, ciervo, jabalí, castor reintroducido, grulla común y ánsares en paso masivo; el bisonte europeo sobrevive en poblaciones manejadas del lado polaco.',
    suelos: 'Luvisoles y Cambisoles sobre till arcilloso, Podzoles en los cordones arenosos e Histosoles en las cuencas cerradas. Los de morrena son de los mejores suelos agrícolas del norte de Europa: profundos, bien provistos y de retención alta. El asunto es el drenaje —casi toda esta llanura está drenada artificialmente desde el siglo XIX— y la consecuencia es doble: las turberas drenadas se mineralizan y se hunden varios centímetros al año liberando carbono, y el agua sale tan rápido que arrastra nitratos y fósforo al Báltico, que es el mar eutrofizado por excelencia. Rehumedecer turberas y reconstruir franjas de amortiguación en las zanjas es acá el trabajo central.',
    saberes: [],
    especies: [
      'Haya (Fagus sylvatica)',
      'Roble carballo (Quercus robur)',
      'Pino silvestre (Pinus sylvestris)',
      'Aliso negro (Alnus glutinosa)',
      'Carpe blanco (Carpinus betulus)',
    ],
    cultivos: ['centeno', 'papa', 'colza', 'cebada', 'avena', 'alforfon', 'manzano', 'trebol_blanco'],
    fuentes: [ATLAS_SUELOS, ESDAC, RESOLVE],
  },

  // PL, LT, LV, EE, FI, SE, UA · ECO_ID 679
  sarmatico_boreonemoral: {
    id: 'sarmatico_boreonemoral',
    nombre: 'Bosque mixto sarmático',
    emoji: '🌲',
    color: '#4F6B4E',
    resumen: 'La banda boreonemoral que va del centro de Polonia a los Bálticos, el sur de Finlandia y buena parte de Suecia: la costura donde la conífera del norte y el caducifolio del sur conviven en el mismo rodal. Verano corto, invierno largo, y agua sobrada casi todo el año.',
    vegetacion: 'Pino silvestre y picea con roble, tilo, arce y avellano en el sotobosque; abedular y aliseda en las etapas de recolonización, y grandes extensiones de turbera alta con brezo y esfagno.',
    fauna: 'Alce, lobo, lince, castor, urogallo y águila pescadora; en los rodales viejos, el pico dorsiblanco y otras especies que sólo viven donde queda madera muerta en pie.',
    suelos: 'Podzoles arenosos y Arenosoles sobre depósitos glaciofluviales, con Histosoles ocupando una fracción enorme del territorio —en Estonia y Letonia, cerca de una quinta parte—. Ácidos, pobres en bases, con el fósforo y el boro limitando antes que el nitrógeno; el encalado es la operación básica de cualquier cultivo. La materia orgánica se acumula porque el frío frena la descomposición, y por eso mismo drenar una turbera acá libera carbono durante décadas. En agricultura, lo determinante es el drenaje controlado y la elección de variedades para una temporada de 120 a 160 días.',
    saberes: [],
    especies: [
      'Pino silvestre (Pinus sylvestris)',
      'Picea común (Picea abies)',
      'Abedul pubescente (Betula pubescens)',
      'Tilo de hoja pequeña (Tilia cordata)',
      'Aliso negro (Alnus glutinosa)',
    ],
    cultivos: ['centeno', 'avena', 'papa', 'cebada', 'lino', 'alforfon', 'arandano', 'trebol_blanco'],
    fuentes: [ATLAS_SUELOS, ESDAC, RESOLVE],
  },

  // RO, SK, PL, UA, CZ, RS · ECO_ID 692
  carpatos_montano: {
    id: 'carpatos_montano',
    nombre: 'Bosque montano de los Cárpatos',
    emoji: '🌲',
    color: '#456B4B',
    resumen: 'El arco de los Cárpatos, de la Moravia checa a las Puertas de Hierro pasando por Eslovaquia, el sur de Polonia, Ucrania occidental y Rumanía. Guarda los mayores restos de bosque primario templado de Europa y las poblaciones más grandes de grandes carnívoros del continente fuera de Rusia.',
    vegetacion: 'Hayedo puro en la franja media, hayedo-abetal con picea arriba, y picea pura en el piso subalpino; pino enano y pastizal alpino en las crestas, con robledales y prados de siega de alta diversidad en los valles.',
    fauna: 'Oso pardo, lobo, lince, bisonte europeo reintroducido en varios sectores, ciervo, gato montés; salamandra alpina y una fauna saproxílica que existe donde nunca se sacó la madera caída.',
    suelos: 'Cambisoles dístricos y Podzoles sobre flysch y esquisto, con Rendzinas en las franjas calcáreas y Leptosoles en las crestas. Poco profundos y ácidos, sostenidos por el bosque: la tala rasa en pendiente fuerte, que en varias partes del arco pasó a gran escala, dispara erosión, arrastre de materia orgánica y crecidas súbitas aguas abajo. El sistema tradicional de prados de siega y pastoreo estival de altura mantuvo esa ladera durante siglos y su abandono es hoy un problema tan concreto como la tala.',
    saberes: [],
    especies: [
      'Haya (Fagus sylvatica)',
      'Abeto blanco (Abies alba)',
      'Picea común (Picea abies)',
      'Arce sicómoro (Acer pseudoplatanus)',
      'Pino enano (Pinus mugo)',
    ],
    cultivos: ['papa', 'centeno', 'avena', 'cebada', 'manzano', 'nogal', 'raigras', 'trebol_blanco'],
    fuentes: [ATLAS_SUELOS, EEA_BIO, RESOLVE],
  },

  // UA, MD, RO, HU · ECO_ID 735 · el mejor suelo agrícola de Europa
  estepa_pontica_chernozem: {
    id: 'estepa_pontica_chernozem',
    nombre: 'Estepa póntica y chernozem',
    emoji: '🌻',
    color: '#8A7940',
    resumen: 'La estepa que va del bajo Danubio al mar de Azov, casi toda arada: es donde está el chernozem, el suelo negro más profundo del mundo y la razón por la que Ucrania y Moldavia pesan lo que pesan en el mercado mundial de granos. Poca lluvia, muy mal repartida, y un viento seco de verano que puede arruinar la cosecha en una semana.',
    vegetacion: 'De la estepa de plumeros y festucas quedan retazos en barrancos y márgenes; el resto es trigo, girasol, maíz, cebada y colza. En las quebradas y las riberas sobreviven bosquecillos de roble, olmo y arce tártaro.',
    fauna: 'Marmota bobak, sisón y avutarda en los pocos pastizales grandes que quedan, águila esteparia, y una comunidad de roedores y sus depredadores que colapsó con la agricultura continua.',
    suelos: 'Chernozems con horizonte húmico de 60 a 120 cm, estructura granular estable y una reserva de nutrientes que permitió sembrar sin fertilizar durante generaciones. Nada de eso es indestructible: bajo laboreo continuo la materia orgánica cayó a la mitad en el siglo XX, el horizonte se compacta y el suelo desnudo entre cosechas se vuela con el viento seco. Acá el agua es siempre el límite —de 350 a 500 mm y evapotranspiración alta—, así que todo el manejo apunta a captarla y guardarla: barbecho con rastrojo en pie, siembra directa, cortinas rompeviento en faja, y cultivo en contorno en las lomas suaves, que es de donde se va el suelo.',
    saberes: [],
    especies: [
      'Plumero (Stipa capillata)',
      'Festuca valesiaca (Festuca valesiaca)',
      'Roble carballo (Quercus robur)',
      'Arce tártaro (Acer tataricum)',
      'Almendro enano (Prunus tenella)',
    ],
    cultivos: ['trigo', 'girasol', 'maiz_tropical', 'cebada', 'colza', 'soja', 'damasco', 'alfalfa'],
    fuentes: [ATLAS_SUELOS, WRB, RESOLVE],
  },

  // UA, MD, RO · ECO_ID 661
  estepa_forestal_este: {
    id: 'estepa_forestal_este',
    nombre: 'Estepa forestal de Europa oriental',
    emoji: '🌳',
    color: '#7F8547',
    resumen: 'La franja de transición al norte de la estepa: mosaico de robledales en las cabeceras de barranco y pastizal en los interfluvios, sobre el mismo loess. Llueve algo más que en la estepa —de 450 a 600 mm— y eso alcanza para que el árbol se sostenga sin riego.',
    vegetacion: 'Robledales de carballo con fresno, tilo, arce y olmo en las quebradas húmedas, pastizal de plumeros en las lomas, y hoy campos de trigo, remolacha, girasol y maíz ocupando casi todo lo llano.',
    fauna: 'Corzo, jabalí, tejón, hámster común, águila moteada y milano negro; las poblaciones de aves esteparias sobreviven sobre todo en las quebradas que nunca se pudieron arar.',
    suelos: 'Chernozems lixiviados y Phaeozems bajo el pastizal, y Luvisoles grises bajo el bosque, todos sobre loess profundo. Fertilidad muy alta pero con más acidez y menos carbonato que la estepa pura, así que responden mejor al aporte de materia orgánica y peor al laboreo agresivo. La forma característica de la degradación acá es la cárcava: el loess es cohesivo en seco y se desmorona saturado, y una vía de agua mal ubicada abre en pocos años un barranco que no se cierra más. Las fajas forestales de protección plantadas a mediados del siglo XX siguen siendo la pieza que ordena esta cuenca.',
    saberes: [],
    especies: [
      'Roble carballo (Quercus robur)',
      'Tilo de hoja pequeña (Tilia cordata)',
      'Arce campestre (Acer campestre)',
      'Fresno común (Fraxinus excelsior)',
      'Olmo campestre (Ulmus minor)',
    ],
    cultivos: ['trigo', 'girasol', 'maiz_tropical', 'remolacha_azucarera', 'soja', 'cebada', 'manzano', 'alfalfa'],
    fuentes: [ATLAS_SUELOS, WRB, RESOLVE],
  },

  // UA · ECO_ID 658
  crimea_submediterraneo: {
    id: 'crimea_submediterraneo',
    nombre: 'Complejo submediterráneo de Crimea',
    emoji: '🍇',
    color: '#87874F',
    resumen: 'La cornisa sur de Crimea, entre las mesetas calcáreas de la Yaila y el mar Negro: una isla de clima submediterráneo metida en plena zona esteparia, protegida del norte por la propia montaña. Es tierra de viña, frutal y bosque esclerófilo, en muy poca superficie.',
    vegetacion: 'Encinar de coscoja y quejigo, pinares de pino de Crimea y pino de Pallas, enebrales altos y matorral de pistacho; hayedo y carpinal en la vertiente alta, y pastizal de meseta —la yaila— en la cumbre plana.',
    fauna: 'Ciervo de Crimea, muflón introducido, jabalí, murciélagos cavernícolas en el karst de la Yaila y una flora endémica de las más ricas de la cuenca del mar Negro.',
    suelos: 'Cambisoles cálcicos, terra rossa y Leptosoles sobre caliza jurásica, delgados y pedregosos en la ladera y algo más profundos en los conos de deyección donde se instaló siempre la viña. El agua es el límite absoluto: la meseta karstificada de arriba no retiene nada y alimenta manantiales al pie, y toda la agricultura de la costa depende de esas surgencias y de embalses pequeños. Terrazas, cobertura viva entre hileras y control del escurrimiento de las cárcavas son lo que evita que la ladera se descalce.',
    saberes: [],
    especies: [
      'Pino de Crimea (Pinus nigra subsp. pallasiana)',
      'Enebro alto (Juniperus excelsa)',
      'Quejigo (Quercus pubescens)',
      'Pistacho mútico (Pistacia mutica)',
      'Coscoja (Quercus coccifera)',
    ],
    cultivos: ['vid', 'durazno', 'damasco', 'almendro', 'nogal', 'trigo', 'olivo', 'lavanda'],
    fuentes: [ATLAS_SUELOS, EEA_BIO, RESOLVE],
  },

  // GE, TR · ECO_ID 665 · lo más lluvioso de la región
  euxino_colquico: {
    id: 'euxino_colquico',
    nombre: 'Bosque euxino-cólquico',
    emoji: '🌧️',
    color: '#3F6B4F',
    resumen: 'La costa sudeste del mar Negro —Cólquida georgiana y la costa póntica turca—, donde el aire cargado del mar choca contra la montaña y descarga: de 2000 a más de 4000 mm al año, sin estación seca. Es bosque templado lluvioso, un refugio glaciar donde sobrevivieron especies terciarias que Europa perdió.',
    vegetacion: 'Bosque denso de haya oriental, castaño, aliso del Cáucaso, tilo y carpe, con un sotobosque siempreverde de rododendro póntico, laurel y acebo que hace la masa casi impenetrable; en los claros y las vegas, té, avellano, cítricos y kiwi como cultivos de la región.',
    fauna: 'Oso pardo, lince, corzo, chacal, nutria; y sobre todo el embudo migratorio de Batumi, por donde pasan cada otoño cientos de miles de rapaces y cigüeñas.',
    suelos: 'Acrisoles y Alisoles fuertemente lixiviados, ácidos, ricos en hierro y aluminio y pobres en bases: la lluvia constante se lleva todo lo soluble. La fertilidad vive en los primeros centímetros de hojarasca, y el suelo desnudo en pendiente se pierde en una temporada. En las llanuras de Cólquida el problema es el opuesto —turberas y humedales drenados que se hunden y se acidifican—. Para producir acá manda la cobertura permanente, el drenaje bien pensado en el llano y el encalado; el té y el avellano funcionan justamente porque toleran el pH bajo.',
    saberes: [],
    especies: [
      'Haya oriental (Fagus orientalis)',
      'Aliso del Cáucaso (Alnus subcordata)',
      'Rododendro póntico (Rhododendron ponticum)',
      'Castaño (Castanea sativa)',
      'Abeto del Cáucaso (Abies nordmanniana)',
    ],
    cultivos: ['avellano', 'naranjo', 'castano', 'nogal', 'arandano', 'maiz_tropical', 'vid', 'raigras'],
    fuentes: [SOILGRIDS, WRB, RESOLVE],
  },

  // GE, TR · ECO_ID 650
  caucaso_mixto: {
    id: 'caucaso_mixto',
    nombre: 'Bosque mixto del Cáucaso',
    emoji: '🏔️',
    color: '#4E7059',
    resumen: 'Las laderas del Gran y del Pequeño Cáucaso en territorio georgiano: un gradiente brutal, de vega subtropical a nieve permanente en menos de cien kilómetros. Uno de los focos de diversidad vegetal más densos de la zona templada y el lugar donde se domesticó la vid.',
    vegetacion: 'Robledal y carpinal abajo, hayedo oriental y abetal de abeto de Nordmann con picea oriental en la franja media, abedular retorcido y matorral de rododendro caucásico en el límite del bosque, y pastizal alpino arriba.',
    fauna: 'Tur del Cáucaso occidental y oriental, rebeco, oso pardo, lobo, lince, urogallo del Cáucaso y quebrantahuesos; el leopardo persa sobrevive en poblaciones mínimas del sur.',
    suelos: 'Cambisoles y Phaeozems de montaña sobre esquisto, caliza y volcánicas, profundos y bien estructurados bajo bosque, con Leptosoles en las crestas. La herencia agrícola son las terrazas de viña y frutal de las laderas de Kajetia y Racha, sostenidas por muros de piedra seca. El riesgo dominante es geomorfológico antes que químico: deslizamientos y flujos de detritos en las cuencas deforestadas, y crecidas repentinas de deshielo. El pastoreo estival de altura, con su calendario de subida y bajada, es lo que mantuvo el pastizal en pie, y la sobrecarga concentrada en los pocos valles accesibles es hoy el problema.',
    saberes: [],
    especies: [
      'Abeto de Nordmann (Abies nordmanniana)',
      'Picea oriental (Picea orientalis)',
      'Haya oriental (Fagus orientalis)',
      'Rododendro caucásico (Rhododendron caucasicum)',
      'Vid silvestre (Vitis vinifera subsp. sylvestris)',
    ],
    cultivos: ['nogal', 'castano', 'vid', 'manzano', 'durazno', 'trigo', 'cebada', 'papa'],
    fuentes: [SOILGRIDS, WRB, RESOLVE],
  },

  // GE · ECO_ID 812
  kura_semidesierto: {
    id: 'kura_semidesierto',
    nombre: 'Semidesierto y estepa del Kura',
    emoji: '🏜️',
    color: '#9A8B5C',
    resumen: 'El extremo seco de Georgia, en la Kajetia baja y el valle del Kura: 200 a 400 mm al año, verano largo y caluroso, y una estepa arbustiva que en Europa no se parece a casi nada. Vashlovani y las badlands de arcilla son el emblema.',
    vegetacion: 'Estepa de ajenjo y salsoláceas, matorral de pistacho y enebro disperso, y bosques de galería de álamo, tamarisco y sauce sobre los ríos, que son la única franja verde permanente.',
    fauna: 'Gacela subgutural en poblaciones reintroducidas, lobo, hiena rayada, oso en el borde montano, tortuga mediterránea, y una comunidad de rapaces —buitre leonado, alimoche— que nidifica en los cortados de arcilla.',
    suelos: 'Calcisoles, Solonchaks y Solonetz en las depresiones, y Kastanozems en la franja de transición a la estepa. Alcalinos, con carbonato y a menudo yeso a poca profundidad, y con sales que suben por capilaridad apenas se riega sin drenaje. Ese es exactamente el modo de arruinar esta tierra: riego por gravedad sin salida de sales, que en pocas campañas deja el perfil salinizado. Lo que funciona es riego medido con drenaje, cobertura para cortar la evaporación, especies tolerantes —viña, pistacho, almendro, cereal de ciclo corto— y bosque de ribera intacto, que acá es infraestructura y no adorno.',
    saberes: [],
    especies: [
      'Pistacho mútico (Pistacia mutica)',
      'Enebro poligamo (Juniperus polycarpos)',
      'Ajenjo (Artemisia lerchiana)',
      'Tamarisco (Tamarix ramosissima)',
      'Álamo del Éufrates (Populus euphratica)',
    ],
    cultivos: ['algodon', 'trigo', 'cebada', 'granado', 'vid', 'damasco', 'pistacho', 'alfalfa'],
    fuentes: [SOILGRIDS, WRB, RESOLVE],
  },

  // NO · ECO_ID 708
  costa_conifera_escandinava: {
    id: 'costa_conifera_escandinava',
    nombre: 'Conífera costera escandinava',
    emoji: '🌲',
    color: '#3D6357',
    resumen: 'La franja oceánica de Noruega entre los fiordos y la montaña: lluvia todo el año, hasta 3000 mm en las bocas de valle, e inviernos suavizados por la corriente del Atlántico norte a una latitud donde debería haber tundra. Es el bosque de coníferas más oceánico de Europa.',
    vegetacion: 'Picea común y pino silvestre con abedul pubescente, aliso gris y serbal; sotobosque denso de arándano, musgos y hepáticas oceánicas, y en los enclaves más templados, restos de bosque costero de tilo, olmo y avellano.',
    fauna: 'Alce, nutria, castor europeo, águila de cola blanca —la mayor población de Europa—, y ríos con salmón atlántico y trucha de mar que son el eje ecológico y económico de cada valle.',
    suelos: 'Podzoles húmicos y Leptosoles sobre roca cristalina, delgados, muy ácidos y con un horizonte orgánico grueso porque el frío y el agua frenan la descomposición; Histosoles en las repisas mal drenadas. La tierra cultivable es poca y está en los fondos de fiordo, sobre depósitos marinos levantados, y ahí el problema es la arcilla marina sensible, que puede licuarse y provocar deslizamientos. Todo el manejo pasa por no romper la cobertura en pendiente, mantener el bosque de ribera y trabajar con pradera permanente y ganadería más que con cultivo anual.',
    saberes: [],
    especies: [
      'Picea común (Picea abies)',
      'Pino silvestre (Pinus sylvestris)',
      'Abedul pubescente (Betula pubescens)',
      'Aliso gris (Alnus incana)',
      'Serbal de cazadores (Sorbus aucuparia)',
    ],
    cultivos: ['cebada', 'avena', 'centeno', 'papa', 'arandano', 'raigras', 'trebol_blanco'],
    fuentes: [ATLAS_SUELOS, EEA_BIO, RESOLVE],
  },

  // NO, SE, FI · ECO_ID 780
  abedular_montano_escandinavo: {
    id: 'abedular_montano_escandinavo',
    nombre: 'Abedular montano escandinavo',
    emoji: '🌿',
    color: '#7C8C6E',
    resumen: 'La cinta de abedul retorcido que corona los Escandes y cubre buena parte de la Laponia noruega, sueca y finlandesa: el último bosque antes del pastizal alpino y de la tundra. Temporada de crecimiento de tres meses escasos y suelo helado buena parte del año.',
    vegetacion: 'Abedular abierto de abedul pubescente montano sobre una alfombra de arándano, camarina, brezo y liquen; sauces de altura en las vaguadas húmedas y pastizal alpino con hierbas y juncáceas por encima del límite arbóreo.',
    fauna: 'Reno —semidomesticado en casi toda su extensión—, glotón, lemming, zorro ártico, lagópodo alpino y una comunidad de limícolas que cría acá y migra a medio mundo.',
    suelos: 'Podzoles delgados y Leptosoles sobre till, con Histosoles y suelos crioturbados en los llanos: ácidos, pobres en bases y con la actividad biológica limitada por el frío más que por la química. La capa de liquen y musgo es la que aísla y la que retiene, y una vez rota por vehículos o por sobrepastoreo tarda décadas en recuperarse. No es tierra de cultivo: lo que se maneja acá es carga de pastoreo, rutas y calendario, y esa es una decisión que le corresponde a los pueblos que la habitan, no a un mapa.',
    saberes: [],
    especies: [
      'Abedul pubescente montano (Betula pubescens subsp. czerepanovii)',
      'Sauce lanudo (Salix lanata)',
      'Arándano (Vaccinium myrtillus)',
      'Camarina negra (Empetrum nigrum)',
      'Liquen de reno (Cladonia rangiferina)',
    ],
    cultivos: ['papa', 'cebada', 'arandano', 'raigras', 'trebol_blanco'],
    fuentes: [ATLAS_SUELOS, EEA_BIO, RESOLVE],
  },

  // IS · ECO_ID 711
  islandia_abedular: {
    id: 'islandia_abedular',
    nombre: 'Abedular boreal y tundra alpina de Islandia',
    emoji: '🌋',
    color: '#6E7C7A',
    resumen: 'Islandia entera fuera de los glaciares: una isla volcánica joven donde el bosque de abedul que cubría entre un cuarto y un tercio del territorio al momento del asentamiento quedó reducido a poco más del uno por ciento. Es el caso de erosión inducida más documentado del Atlántico norte, y también el de restauración más sostenido.',
    vegetacion: 'Abedular bajo de abedul pubescente con sauce y serbal, brezales de camarina y arándano, praderas de gramíneas en las tierras bajas y desiertos de arena volcánica sin vegetación en el interior.',
    fauna: 'Zorro ártico como único mamífero terrestre nativo, reno introducido en el este; y una avifauna marina y de humedal enorme —frailecillo, charrán ártico, correlimos, colimbos— que es lo que sostiene la ecología de la costa.',
    suelos: 'Andosoles sobre ceniza volcánica: livianos, porosos, con una capacidad de retención de agua altísima y una fertilidad química buena, pero con una cohesión bajísima. Secos y sin cobertura vuelan con el viento, y ese es el mecanismo que desmanteló el suelo de media isla tras la deforestación y el pastoreo de ovejas. Sobre eso se apoya todo el trabajo del servicio de conservación de suelos desde 1907: cerrar el pastoreo en las áreas erosionadas, sembrar altramuz de Nootka y gramíneas para fijar la arena, y replantar abedul. En agricultura, la ventana térmica es el límite: pradera, forraje y horticultura con geotermia.',
    saberes: [],
    especies: [
      'Abedul pubescente (Betula pubescens)',
      'Serbal de cazadores (Sorbus aucuparia)',
      'Sauce lanudo (Salix lanata)',
      'Camarina negra (Empetrum nigrum)',
      'Cárice de arena (Leymus arenarius)',
    ],
    cultivos: ['papa', 'cebada', 'avena', 'raigras', 'trebol_blanco'],
    aptitud: [
      { uso: 'pasturas', delta: -15, razon: 'El andosol seco y sin cubierta vuela con el viento, y ese es el mecanismo que desmanteló el suelo de media isla con el pastoreo de ovejas. Cerrar el pastoreo en el área erosionada es el primer paso.' },
      { uso: 'forestal', delta: 10, razon: 'Fijar la arena con altramuz y gramínea y replantar abedul es el trabajo de conservación de suelos de la isla desde 1907.' },
    ],
    fuentes: [LANDGRAEDSLAN, WRB, RESOLVE],
  },

  // GR, TR · ECO_ID 785
  egeo_esclerofilo: {
    id: 'egeo_esclerofilo',
    nombre: 'Esclerófilo del Egeo y Anatolia occidental',
    emoji: '🏛️',
    color: '#8B8A55',
    resumen: 'Las dos orillas del Egeo y sus islas, más el occidente turco: el Mediterráneo clásico, con verano seco largo y lluvia de invierno. Es un paisaje agrícola de cinco mil años, y buena parte de lo que hoy parece natural son terrazas, olivares y pastizales de pastoreo antiguo.',
    vegetacion: 'Encinar y coscojar, maquis alto de lentisco, madroño y brezo, garriga de tomillo, jara y salvia en los suelos más pobres, y pinares de pino carrasco y pino de Calabria; olivo, viña, higuera y algarrobo como cultivo estructural.',
    fauna: 'Chacal dorado, tejón, garduña, cabra montés en las islas, tortuga mora, camaleón común en el sur y una densidad alta de reptiles y aves de matorral.',
    suelos: 'Luvisoles crómicos, terra rossa y Leptosoles sobre caliza y esquisto, con Fluvisoles fértiles en los valles del Meandro y el Gediz. Poco profundos, alcalinos, con carencia frecuente de hierro y zinc por el pH alto. El agua es todo el problema: la lluvia cae cuando el cultivo no la usa y falta cuando la necesita, así que la reserva del suelo y la sombra del árbol deciden el año. Las terrazas, el olivar de secano con cobertura y la cisterna son el sistema histórico; en los valles regados el techo actual es el descenso del acuífero y la intrusión salina en la franja costera.',
    saberes: [],
    especies: [
      'Encina (Quercus ilex)',
      'Pino de Calabria (Pinus brutia)',
      'Lentisco (Pistacia lentiscus)',
      'Algarrobo (Ceratonia siliqua)',
      'Madroño griego (Arbutus andrachne)',
    ],
    cultivos: ['olivo', 'vid', 'higuera', 'almendro', 'trigo', 'garbanzo', 'sesamo', 'algarrobo_es'],
    fuentes: [ATLAS_SUELOS, EEA_BIO, RESOLVE],
  },

  // GR · ECO_ID 789
  creta_mediterranea: {
    id: 'creta_mediterranea',
    nombre: 'Mediterráneo de Creta',
    emoji: '🐐',
    color: '#95884E',
    resumen: 'Creta y las islas del Egeo meridional: montaña caliza que llega a 2400 m a pocos kilómetros del mar, con una cara norte que recibe lluvia y una cara sur casi árida. La isla concentra una flora endémica excepcional y una historia de pastoreo caprino igual de larga.',
    vegetacion: 'Ciprés mediterráneo silvestre y pino de Calabria en la montaña, encinar y quejigar en las umbrías, maquis y frigana —el matorral espinoso en almohadilla— dominando las laderas pastoreadas; palmeral de Theophrastus en algunos arenales del sur.',
    fauna: 'Kri-kri, la cabra montés cretense, en Samariá y los islotes; tejón, garduña, quebrantahuesos en poblaciones mínimas, y una fauna de invertebrados y reptiles con altísimo endemismo.',
    suelos: 'Leptosoles y Cambisoles cálcicos sobre caliza karstificada, con terra rossa en las dolinas y llanuras interiores —Lasithi, Mesará— que son la tierra de labor real. La profundidad efectiva es de pocos decímetros en la mayor parte de la isla, y el karst se lleva el agua hacia abajo sin dejarla en el perfil. La sobrecarga de cabras es el factor histórico de degradación: sin regeneración del matorral la ladera queda con la roca a la vista. El olivar en terraza, la cisterna y las galerías de captación son la respuesta local, y en las llanuras regadas el límite hoy es la salinización del acuífero costero.',
    saberes: [],
    especies: [
      'Ciprés mediterráneo (Cupressus sempervirens)',
      'Pino de Calabria (Pinus brutia)',
      'Palmera de Creta (Phoenix theophrasti)',
      'Algarrobo (Ceratonia siliqua)',
      'Aulaga cretense (Sarcopoterium spinosum)',
    ],
    cultivos: ['olivo', 'vid', 'naranjo', 'algarrobo_es', 'higuera', 'almendro', 'garbanzo', 'lenteja'],
    fuentes: [ATLAS_SUELOS, EEA_BIO, RESOLVE],
  },

  // CY · ECO_ID 790
  chipre_troodos: {
    id: 'chipre_troodos',
    nombre: 'Mediterráneo de Chipre y el macizo del Troodos',
    emoji: '🪨',
    color: '#7F7F5E',
    resumen: 'Chipre, con dos geologías que no se parecen en nada: la ofiolita del Troodos —un fragmento de corteza oceánica levantado, con serpentinita y peridotita— y la caliza del Pentadáctilos y la llanura sedimentaria de la Mesaoria entre las dos. Es la isla más seca del Mediterráneo europeo.',
    vegetacion: 'Pino de Calabria en casi toda la montaña, cedro de Chipre en el rodal relicto del Tripylos, encinar de encina de Chipre y enebrales altos; maquis y garriga en la costa, y la Mesaoria enteramente agrícola, con cereal y olivo.',
    fauna: 'Muflón de Chipre, zorro, erizo de orejas largas, y una lista de endemismos vegetales y de reptiles muy larga para la superficie; las salinas de Larnaca y Akrotiri sostienen la invernada de flamencos.',
    suelos: 'Sobre la ofiolita, suelos serpentínicos con relación calcio-magnesio invertida y niveles altos de níquel y cromo: fértiles en apariencia y hostiles en la práctica, con una flora adaptada que no conviene reemplazar. En la Mesaoria, Vertisoles y Calcisoles profundos, agrietables, buenos para cereal de secano pero con muy poca ventana de laboreo. El techo es hídrico y estructural a la vez: menos de 500 mm en el llano, embalses que dependen de un año bueno, y desalinización cubriendo la diferencia. Terrazas en la montaña, secano bien elegido en el llano y control estricto del riego son lo que hay.',
    saberes: [],
    especies: [
      'Cedro de Chipre (Cedrus brevifolia)',
      'Pino de Calabria (Pinus brutia)',
      'Encina de Chipre (Quercus alnifolia)',
      'Enebro fenicio (Juniperus phoenicea)',
      'Algarrobo (Ceratonia siliqua)',
    ],
    cultivos: ['olivo', 'vid', 'algarrobo_es', 'almendro', 'naranjo', 'higuera', 'papa', 'garbanzo'],
    fuentes: [ATLAS_SUELOS, WRB, RESOLVE],
  },

  // TR · ECO_ID 791
  mediterraneo_oriental_conifera: {
    id: 'mediterraneo_oriental_conifera',
    nombre: 'Conífera y frondosa del Mediterráneo oriental',
    emoji: '🌲',
    color: '#6C7C52',
    resumen: 'La franja del extremo oriental del Mediterráneo que entra en Turquía por Hatay y los montes Amanos: donde el Mediterráneo se encuentra con la influencia continental y la del Próximo Oriente. Es un corredor biogeográfico estrecho y con una diversidad desproporcionada para su tamaño.',
    vegetacion: 'Pino de Calabria y cedro del Líbano en la montaña, abetos y cipreses en los enclaves húmedos, encinar y quejigar en la franja media, y maquis de lentisco, laurel y algarrobo abajo; olivo, cítrico y pistacho como cultivos permanentes.',
    fauna: 'Oso pardo sirio en poblaciones muy reducidas, lobo, chacal, caracal, y el cuello de botella migratorio de Belén, por donde pasa buena parte de las rapaces que cruzan de Eurasia a África.',
    suelos: 'Luvisoles crómicos y terra rossa sobre caliza, Leptosoles en la ladera fuerte y Fluvisoles profundos en la llanura del Amik. Alcalinos, con clorosis férrica frecuente en frutales sobre caliza activa. El régimen es de lluvia invernal fuerte y verano seco absoluto, con episodios que en una tarde mueven el suelo de una ladera desnuda entera. Terrazas, olivar con cobertura y control de cárcavas sostienen la parte alta; en la llanura, el drenaje de los antiguos humedales dejó suelos con riesgo de salinización y hundimiento.',
    saberes: [],
    especies: [
      'Cedro del Líbano (Cedrus libani)',
      'Pino de Calabria (Pinus brutia)',
      'Quejigo de Anatolia (Quercus infectoria)',
      'Laurel (Laurus nobilis)',
      'Pistacho terebinto (Pistacia terebinthus)',
    ],
    cultivos: ['olivo', 'vid', 'higuera', 'almendro', 'pistacho', 'trigo', 'garbanzo', 'algarrobo_es'],
    fuentes: [TARIM, SOILGRIDS, RESOLVE],
  },

  // TR · ECO_ID 786, 804
  tauro_conifera_montana: {
    id: 'tauro_conifera_montana',
    nombre: 'Conífera montana del Tauro y Anatolia mediterránea',
    emoji: '🌲',
    color: '#5A7350',
    resumen: 'La cadena del Tauro y la montaña anatolia mediterránea, que separa la costa de la meseta interior. Acá está el agua de Anatolia: la nieve que se acumula en invierno alimenta los karsts y sale por manantiales enormes que sostienen los regadíos de abajo.',
    vegetacion: 'Cedro del Líbano y abeto del Tauro en la franja alta, pino negro y pino de Calabria en la media, enebrales altos de enebro fenicio y poligamo en las solanas secas, y encinar y quejigar en los fondos; pastizal de montaña arriba, pastoreado desde siempre.',
    fauna: 'Cabra bezoar, corzo, lobo, oso pardo, lince caracal en el piedemonte, buitre leonado y águila real; una de las áreas de mayor riqueza de plantas bulbosas del mundo.',
    suelos: 'Leptosoles rendzínicos y Cambisoles cálcicos sobre caliza masiva, con terra rossa profunda sólo en las dolinas y los poljes de altura, que son las únicas parcelas de labor. Es karst puro: no hay escurrimiento, el agua baja por las fisuras, y lo que se hace arriba se bebe abajo. La sobrecarga de pastoreo y los incendios de pino en la ladera baja son los dos motores de pérdida de suelo, y una vez que se va, sobre la caliza no vuelve. La recuperación pasa por regular carga, mantener el enebral —que es el que fija la ladera seca— y no tocar las zonas de recarga.',
    saberes: [],
    especies: [
      'Cedro del Líbano (Cedrus libani)',
      'Abeto del Tauro (Abies cilicica)',
      'Pino negro (Pinus nigra subsp. pallasiana)',
      'Enebro poligamo (Juniperus excelsa)',
      'Quejigo de Anatolia (Quercus infectoria)',
    ],
    cultivos: ['manzano', 'nogal', 'damasco', 'cebada', 'trigo', 'lenteja', 'pistacho', 'papa'],
    fuentes: [TARIM, SOILGRIDS, RESOLVE],
  },

  // TR · ECO_ID 703
  ponto_anatolia_norte: {
    id: 'ponto_anatolia_norte',
    nombre: 'Conífera y frondosa del norte de Anatolia',
    emoji: '🌰',
    color: '#4F7050',
    resumen: 'La cadena póntica que corre paralela al mar Negro, en su vertiente menos lluviosa y en la interior: bosque húmedo pero sin el exceso de la Cólquida, con nieve en invierno y sin sequía marcada. Es la zona de avellana, castaño y apicultura de Turquía.',
    vegetacion: 'Abeto de Nordmann y picea oriental en la franja alta, hayedo oriental y castañar en la media, robledal y carpinal abajo, con pino silvestre en las solanas interiores; avellano, tanto silvestre como cultivado, en toda la vertiente norte.',
    fauna: 'Oso pardo, lobo, lince, corzo, gato montés, urogallo caucásico en el extremo oriental; el paso migratorio de rapaces por la costa es de los mayores de Eurasia.',
    suelos: 'Cambisoles y Luvisoles dístricos sobre andesita, esquisto y flysch, ácidos y de buena profundidad bajo bosque, con Leptosoles en las crestas. La lluvia bien repartida y las pendientes fuertes hacen que la erosión aparezca apenas se abre el dosel: el avellanar en terraza, que es el sistema tradicional, sostiene la ladera cuando se mantiene la cobertura entre plantas y la pierde cuando se limpia el suelo con herbicida. La materia orgánica es alta y el pH bajo, así que el encalado y el aporte de bases pesan más que el nitrógeno.',
    saberes: [],
    especies: [
      'Abeto de Nordmann (Abies nordmanniana)',
      'Haya oriental (Fagus orientalis)',
      'Avellano (Corylus avellana)',
      'Castaño (Castanea sativa)',
      'Picea oriental (Picea orientalis)',
    ],
    cultivos: ['avellano', 'maiz_tropical', 'castano', 'nogal', 'cerezo', 'arandano', 'papa', 'raigras'],
    fuentes: [TARIM, SOILGRIDS, RESOLVE],
  },

  // TR · ECO_ID 652, 725
  meseta_anatolia_estepa: {
    id: 'meseta_anatolia_estepa',
    nombre: 'Estepa de la meseta de Anatolia central',
    emoji: '🌾',
    color: '#9E9257',
    resumen: 'La meseta interior, encerrada entre el Tauro y la cadena póntica, que le cortan la humedad de los dos mares: de 250 a 400 mm al año, invierno frío y verano seco y caluroso. Es el granero de Turquía y, a la vez, el caso más serio de sobreextracción de acuífero de la región.',
    vegetacion: 'Estepa de ajenjo, festuca y plumeros, con bosquetes abiertos de quejigo y enebro en las lomas y almendro y pistacho silvestres en las quebradas; cereal de secano, remolacha, girasol y regadío intensivo en las cuencas cerradas.',
    fauna: 'Gacela subgutural en el sur, lobo, zorro, gato de las estepas, avutarda, alondras y aláudidos de estepa; los lagos salinos —el Tuz Gölü— sostienen la mayor colonia de flamenco de la región.',
    suelos: 'Kastanozems y Calcisoles sobre loess y sedimentos lacustres, con Solonchaks y Solonetz alrededor de los lagos salinos y Vertisoles en las cuencas. Fértiles en química, muy limitados en agua, con carbonato y a veces yeso a poca profundidad. Dos degradaciones dominan: la salinización del regadío sin drenaje y la subsidencia por bombeo, que en la cuenca de Konya abrió cientos de dolinas de colapso. El barbecho tradicional con rastrojo, la siembra directa, las cortinas rompeviento y el cambio a cultivos de menor demanda hídrica son las palancas reales; el riego eficiente por sí solo aumentó la superficie regada y empeoró el balance.',
    saberes: [],
    especies: [
      'Quejigo de Anatolia (Quercus infectoria)',
      'Enebro poligamo (Juniperus excelsa)',
      'Almendro silvestre (Amygdalus orientalis)',
      'Ajenjo (Artemisia fragrans)',
      'Plumero (Stipa lessingiana)',
    ],
    cultivos: ['trigo', 'cebada', 'lenteja', 'garbanzo', 'girasol', 'damasco', 'azafran', 'alfalfa'],
    fuentes: [TARIM, WRB, RESOLVE],
  },

  // TR · ECO_ID 662, 727
  anatolia_oriental_montana: {
    id: 'anatolia_oriental_montana',
    nombre: 'Montaña y estepa de Anatolia oriental',
    emoji: '❄️',
    color: '#7E8266',
    resumen: 'El altiplano del este turco, entre 1500 y 2500 m, con volcanes como el Ararat y el Nemrut y el lago Van en el centro. Invierno largo y muy frío —seis meses con nieve—, verano corto y seco. Es la cabecera del Éufrates, el Tigris y el Aras: el agua de media región nace acá.',
    vegetacion: 'Robledales abiertos de quejigo y roble de Líbano en las laderas más húmedas, estepa de ajenjo y astrágalos en almohadilla en el altiplano, pastizal subalpino en las cumbres y bosques de galería de álamo y sauce en los ríos.',
    fauna: 'Cabra bezoar, oveja armenia, lobo, oso pardo, lince, y una avifauna de humedal de altura —flamenco, malvasía, zampullines— en Van, Erçek y los lagos volcánicos.',
    suelos: 'Cambisoles y Leptosoles sobre volcánicas y calizas, con Kastanozems en las cuencas planas y suelos con crioturbación en las cotas altas. Profundidad escasa, pedregosidad alta y un ciclo de hielo-deshielo que desmenuza la superficie y la deja lista para irse con el primer deshielo. La ganadería extensiva con pastoreo estival es el uso que la región soporta, y la degradación característica es el sobrepastoreo del pastizal de altura seguido de erosión laminar y en surcos. El bosque de galería y los prados de siega de los valles son las dos piezas que conviene no perder.',
    saberes: [],
    especies: [
      'Roble de Líbano (Quercus libani)',
      'Quejigo (Quercus pubescens)',
      'Astrágalo espinoso (Astragalus microcephalus)',
      'Álamo blanco (Populus alba)',
      'Espino cerval (Rhamnus pallasii)',
    ],
    cultivos: ['trigo', 'cebada', 'papa', 'lenteja', 'nogal', 'damasco', 'alfalfa', 'trebol_blanco'],
    fuentes: [TARIM, SOILGRIDS, RESOLVE],
  },

  // TR · ECO_ID 688
  zagros_estepa_forestal: {
    id: 'zagros_estepa_forestal',
    nombre: 'Estepa forestal del Zagros',
    emoji: '🌳',
    color: '#8A8250',
    resumen: 'El extremo noroccidental del Zagros, en el sudeste de Turquía —Hakkari, Şırnak, el sur de Van—: bosque abierto de roble sobre montaña plegada, con lluvia de invierno y primavera y un verano seco de cinco meses. Es el bosque de secano más extenso de Asia occidental y la cuna de la agricultura de cereal.',
    vegetacion: 'Robledal abierto de roble de Líbano, roble brant y quejigo, con almendro, pistacho, arce montpellier, espino y peral silvestre; pastizal y estepa de gramíneas entre los árboles, y bosques de galería de álamo y plátano oriental en los ríos.',
    fauna: 'Cabra bezoar, oveja armenia, oso pardo, leopardo persa en registros esporádicos, lobo, hiena rayada, buitre leonado y quebrantahuesos.',
    suelos: 'Leptosoles y Cambisoles cálcicos sobre caliza y roca metamórfica, delgados en la ladera y algo más profundos en los coluvios y los fondos de valle, donde está toda la agricultura. Alcalinos, con carbonato libre y hierro poco disponible. La cobertura arbórea abierta es lo que mantiene el suelo en pendiente: el corte para leña, el pastoreo de cabras y los incendios abren claros que la lluvia de invierno vacía en pocas temporadas. El sistema histórico combina cereal de secano en el valle, frutal de secano y pastoreo estacional en el monte, y funciona mientras el roble se mantenga en rebrote.',
    saberes: [],
    especies: [
      'Roble de Líbano (Quercus libani)',
      'Roble brant (Quercus brantii)',
      'Pistacho terebinto (Pistacia khinjuk)',
      'Almendro silvestre (Amygdalus orientalis)',
      'Plátano oriental (Platanus orientalis)',
    ],
    cultivos: ['trigo', 'cebada', 'garbanzo', 'lenteja', 'nogal', 'vid', 'pistacho', 'damasco'],
    fuentes: [TARIM, SOILGRIDS, RESOLVE],
  },
};
