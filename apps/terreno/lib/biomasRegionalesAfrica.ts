/**
 * Fichas regionales del África tropical y austral: arranca con 1 ficha para 2 ECO_ID.
 *
 * El alcance y el porqué del recorte están en `ecorregionesAfrica.ts`. Acá va lo
 * que hay que saber para tocar los números.
 *
 * ## Esta ficha corrige el modificador del bioma, y no era lo esperado
 *
 * El encargo de la fase 5 decía que en África el modificador global
 * probablemente acierte, porque este reino es el arquetipo del que salió. En el
 * miombo húmedo no acierta. El bioma de sabana le pone `pasturas +20` con la
 * razón «el sistema pastoril es el nativo, no un reemplazo», y acá el sistema
 * nativo es un bosque: las fuentes de las dos ecorregiones dicen que la densidad
 * de herbívoros está limitada por una vegetación de bajo contenido de nutrientes
 * y que la tsetsé afecta al ganado doméstico. Queda en **0**, con la razón
 * reescrita. No se baja a negativo porque el pastoreo existe: está en los
 * parches, sobre ríos y humedales.
 *
 * Y se **agrega** `huerta −20`, que el bioma de sabana no nombra. El mecanismo es
 * el chitemene: el sistema agrícola de este bosque importa la fertilidad como
 * ceniza de una superficie de monte mucho mayor que la chacra, porque el suelo
 * del lugar no la tiene. `componerAptitud` reemplaza por uso y agrega los usos
 * que el global no nombra, así que una ficha puede sumar un modificador nuevo;
 * es el mismo patrón que el `forestal +15` del Decán central.
 *
 * ## Las cargas publicadas, que son el corazón del lote
 *
 * De Tinley (1977), citando a Myre y Antão (1972), en el informe de paisajes de
 * Gorongosa (2008):
 *
 * | formación | hectáreas por unidad animal |
 * |---|---|
 * | miombo | **15** |
 * | sabana de Urochloa (tipo Combretum-Acacia) | 6 a 8 |
 * | pastizal aluvial inundable | 3 a 4 |
 * | bajos herbáceos sobre suelo pesado, Chokwe, 656 mm (Timberlake y Reddy 1986) | 2,3 |
 *
 * Y el relevamiento de campo del mismo informe, 139 parcelas, ordena 24
 * comunidades por carga: el miombo húmedo alto y cerrado queda **último**, con 18
 * ha/LSU, contra 6 del Acacia-Combretum, 2 del pastizal corto de Cynodon y 1 del
 * pastizal de inundación de Echinochloa. Ese ordenamiento es una estimación
 * visual y el informe lo declara: vale como corroboración, no como medición.
 *
 * ## El mecanismo, y el problema que le abre al motor de la app
 *
 * El mismo informe da la razón, y es contraintuitiva: la correlación entre lluvia
 * y biomasa de herbívoros (Coe et al. 1977) **se deteriora por encima de 800 a
 * 900 mm**, en particular sobre sustrato pobre, y la carga puede incluso caer en
 * zonas muy húmedas por lixiviación de nutrientes y el pasto de baja calidad que
 * resulta. Fritz y Duncan (1994) refinaron el enfoque incorporando la fertilidad
 * del sustrato. **Los dos trabajos originales no se leyeron: lo que está
 * verificado es que el informe de Gorongosa lo dice y los cita.**
 *
 * Esto choca de frente con `prodForrajera` de `produccion.ts`, que es una
 * escalera creciente por lluvia anual y cuyo último escalón es `≥ 900 mm → 7.000
 * kg MS/ha/año`. El miombo húmedo recibe 1.000 a 1.400 mm, así que cae en el
 * escalón más alto, y `bandaUso` lo clasifica como pastizal húmedo con 50 % de
 * uso admisible. La cuenta que hace la app, con sus propios números:
 *
 *     7.000 kg/ha × 0,50 = 3.500 kg MS/ha/año aprovechables
 *     1 EV con forraje natural (1,87 Mcal EM/kg) come 9,9 kg/día = 3.619 kg/año
 *     → 0,97 EV/ha, o sea 1,03 ha por EV (1,25 con forraje grosero)
 *
 * **La app dice una hectárea por animal y la cifra publicada para el miombo son
 * quince.** La comparación es aproximada porque el EV de acequia está definido en
 * energía (18,54 Mcal EM/día) y la unidad animal de la fuente es una vaca de 450
 * kg, pero el orden de magnitud no depende de eso. El error va para arriba, que
 * es el lado peligroso: promete pasto que no existe, y de ahí salen la carga
 * objetivo, el tamaño del rodeo y el agua de bebida que dimensiona la represa.
 *
 * **El motor no se toca en este commit**, por la misma razón que no se tocó con
 * el vertisol del Decán: una tabla global no se reemplaza desde una formación.
 * Lo que corresponde es que la escalera deje de ser monótona en la lluvia, y eso
 * necesita el reemplazo que vienen armando los 24 lotes de forraje. Mientras no
 * exista, la única advertencia que recibe el usuario es el texto de esta ficha, y
 * sólo si su predio cae en estas dos ecorregiones.
 *
 * ## Lo que esta ficha no trae
 *
 * No hay reparto porcentual de HWSD v2 ni de SoilGrids por ecorregión: no se
 * extrajo. Lo que hay es la cartografía continental del Soil Atlas of Africa del
 * JRC, que está derivada de HWSD, reclasificada a WRB y corrigió el 13 % del dato
 * de suelos del continente, a escala 1:3.000.000. A esa escala el nombre del
 * orden sirve y el porcentaje por ecorregión no.
 */

import type { BiomaFicha } from './biomaTipos';

const RESOLVE = { label: 'Dinerstein et al. 2017 — RESOLVE Ecoregions 2017 (polígonos)', url: 'https://storage.googleapis.com/teow2016/Ecoregions2017.zip' };

const ONE_EARTH_39 = { label: 'Central Zambezian Wet Miombo Woodlands | One Earth', url: 'https://www.oneearth.org/ecoregions/central-zambezian-wet-miombo-woodlands/' };

/** La entrega de GPT citó esta misma página en `stage.oneearth.org`, que es el
 *  servidor de pruebas de One Earth. Devuelve exactamente el mismo contenido y el
 *  mismo tamaño que el de producción, así que el dato era bueno, pero la URL no
 *  entra: un host de staging no es una fuente citable y puede desaparecer. */
const ONE_EARTH_36 = { label: 'Angolan Wet Miombo Woodlands | One Earth', url: 'https://www.oneearth.org/ecoregions/angolan-wet-miombo-woodlands/' };

const ATLAS_AFRICA = { label: 'Soil Atlas of Africa - ESDAC - European Commission', url: 'https://esdac.jrc.ec.europa.eu/content/soil-map-soil-atlas-africa' };

/** Andrew Ker, IDRC, 1995. De acá salen los órdenes de suelo de la zona de sabana
 *  subhúmeda y los números de fósforo, capacidad de intercambio y aluminio. */
const KER_SABANA = { label: 'Farming Systems of the African Savanna', url: 'https://idrc-crdi.ca/sites/default/files/openebooks/280-5/index.html' };

/** Aviso de alcance: el distrito de Nyimba, en la provincia Oriental de Zambia,
 *  está en el miombo SECO —el propio trabajo lo ubica «in the arid ecozone» y
 *  describe miombo seco, mopane y munga—, que es el ECO_ID 42 y no estas dos. Se
 *  cita sólo por el repertorio de cultivos del miombo zambiano, no por el suelo
 *  ni por la carga. La entrega de GPT lo usó como fuente de cultivos sin notar
 *  eso. */
const NYIMBA = { label: 'Factors Influencing Climate-Smart Agriculture Practices Adoption and Crop Productivity among Smallholder Farmers in Nyimba District, Zambia', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12371323/' };

/** Mismo aviso y más fuerte: Gorongosa está en Mozambique y no en estas dos
 *  ecorregiones. Se cita por las cargas de la FORMACIÓN miombo, que es a lo que
 *  se refiere la tabla de Myre y Antão, y por el mecanismo de los 800 a 900 mm.
 *  No hay carga publicada que se haya podido verificar adentro del 39 ni del 36. */
const GORONGOSA = { label: 'Landscapes of Gorongosa National Park Condensed version July 2008', url: 'https://gorongosa.org/wp-content/uploads/2020/11/GorongosaLandscapesJuly2008_condensed-1.pdf' };

export const BIOMAS_REGIONALES_AFRICA: Record<string, BiomaFicha> = {
  // AO, BI, CD, MW, MZ, TZ, ZM · ECO_ID 39 y 36 · bioma 7 · confianza media
  miombo_humedo_zambeziano: {
    id: 'miombo_humedo_zambeziano',
    nombre: 'Miombo húmedo zambeziano',
    emoji: '🌳',
    color: '#689F38',
    resumen: 'Una sola formación partida en dos ecorregiones de la meseta centroafricana: la central, de 102,4 millones de hectáreas, que cubre cerca del 70 % del centro y norte de Zambia, el tercio sudeste de la República Democrática del Congo, el oeste de Malaui, buena parte del oeste de Tanzania y partes de Burundi y del noreste de Angola; y la angoleña, de 45,0 millones, que ocupa todo el centro de Angola con las tierras altas de Huíla, Huambo y Bié. Juntas son 147,4 millones de hectáreas entre 1.000 y 1.600 metros, sobre una peneplanicie erosionada durante decenas de millones de años con inselbergs asomando. Del hábitat original no hay cifra publicada para el conjunto: la fuente dice que rodales de miombo prístino fueron talados o muy modificados en el pasado y después regeneraron. La red de áreas protegidas de la mitad central es extensa, con Kafue en Zambia y Upemba en el Congo, y no tiene ni una sola en Angola; las de la mitad angoleña están todas en Angola y son Luando, Cangandala y Mupa.',
    vegetacion: 'Lo que distingue al miombo de cualquier otra sabana, bosque o selva africana es el dominio de leguminosas de la subfamilia Caesalpinioideae, sobre todo de los géneros Brachystegia, Julbernardia e Isoberlinia. Los dominantes del dosel que nombran las fuentes son Brachystegia floribunda, B. glaberrima, B. taxifolia, Julbernardia globiflora, J. paniculata e Isoberlinia angolensis en la mitad central, y Brachystegia spiciformis, J. paniculata, Copaifera baumiana, B. boehmii, B. gossweilerii y B. wangermeeana en la angoleña. Casi todas las leñosas pierden la hoja en la seca y vuelven a brotar unas pocas semanas antes de que empiecen las lluvias, y muchas florecen en ese momento: el monte se adelanta a la lluvia en vez de esperarla. La lluvia es unimodal y se concentra en los meses más calurosos, de noviembre a marzo o abril, con una seca pronunciada en la estación fresca que llega a durar siete meses; en la mitad central son 1.000 a 1.200 mm y hasta 1.400 en altura, y en la angoleña va de menos de 800 mm en el sur a unos 1.400 en el norte y el oeste. Es parte del centro de endemismo zambeziano y tiene la riqueza florística más alta de todas las ecorregiones de miombo de África, con un pico en Zambia: puede sostener más de 3.000 especies de plantas y quizá varios cientos de endemismos.',
    fauna: 'La fuente de la mitad angoleña registra más de 170 especies de mamíferos, con cuatro casi endémicas chicas y una estricta, el ratón trepador de Vernay; la de la mitad central no da totales y nombra tres endemismos estrictos de mamífero, el ratón rayado de Rosevear y dos musarañas, la de Ansell y la de Upemba. La densidad de grandes herbívoros es baja, y la fuente lo atribuye a la estación seca dura, las sequías largas y los suelos pobres, que dan una vegetación de bajo contenido de nutrientes: eso sesga la comunidad hacia animales grandes y generalistas, el elefante y el búfalo africano (Syncerus caffer), que es la especie emblema de la mitad central. El antílope sable gigante (Hippotragus niger variani) es endémico de la mitad angoleña y estuvo diez años dado por extinto hasta que se lo redescubrió en 2005; quedan unos 40 individuos en Cangandala y menos de 50 en Luando, y la falta de machos maduros tras la caza de la guerra civil dejó como amenaza la hibridación con el antílope ruano. De aves no hay totales publicados y la fuente nombra como únicos endemismos estrictos al tejedor de Ruwet y al estrilda de cara negra (Estrilda erythronotos).',
    suelos: 'Acá no hay reparto de HWSD ni de SoilGrids por ecorregión: no se extrajo, y a la escala del dato que existe tampoco tendría sentido. El Soil Atlas of Africa del JRC es la base continental, está derivada de HWSD, fue reclasificada al sistema WRB y en el camino corrigió el 13 % del dato de suelos del continente, pero se publica a 1:3.000.000. Los órdenes, entonces: en la zona de sabana subhúmeda la mayor parte de los suelos de altura se clasifican como alfisoles, con oxisoles en Angola, la República Centroafricana y el Congo, y los oxisoles además son extensos en las zonas de alta lluvia de la cuenca del Congo y se prolongan por Zambia y Mozambique. La fuente de la mitad angoleña los describe muy lixiviados, tendientes a ácidos y pobres en materia orgánica, con drenaje restringido y anegamiento estacional en algunos sectores. Los números que importan para trabajarlos: el fósforo de superficie de estos suelos de sabana va de 80 a 150 ppm contra 1.500 a 3.000 ppm de un suelo templado, el fósforo orgánico queda entre 15 y 60 ppm, la capacidad de intercambio es tan baja que el calcio y el magnesio intercambiables suman 0,3 a 3,0 meq por 100 g, son arenosos, muchas veces someros sobre grava ferruginosa o plintita, y la acidez con aluminio castiga al maní y a la soja mientras la yuca y el café la toleran. Lo fértil está en parches y son dos: los montículos de termita, que concentran materia orgánica y nutrientes en un paisaje que no los tiene, y el borde del dambo, el bajo herbáceo estacional. Y una advertencia sobre el número que calcula esta misma app: su escalera de forraje crece con la lluvia anual y termina en 7.000 kg de materia seca por hectárea y por año para 900 mm o más, lo que acá da alrededor de una hectárea por equivalente vaca, mientras la carga publicada para el miombo son quince hectáreas por unidad animal. El motivo está en la literatura de la región: por encima de 800 a 900 mm, y sobre sustrato pobre, la relación entre lluvia y carga se deteriora y la carga puede incluso bajar, porque la lixiviación deja un pasto de baja calidad. Si vas a dimensionar un rodeo o el agua de bebida acá, la cifra de forraje de la app es la que hay que desconfiar.',
    saberes: [],
    especies: [
      'Miombo (Brachystegia spiciformis)',
      'Brachystegia floribunda',
      'Brachystegia boehmii',
      'Brachystegia taxifolia',
      'Julbernardia globiflora',
      'Julbernardia paniculata',
      'Isoberlinia angolensis',
      'Copaifera baumiana',
    ],
    // Los cuatro primeros son los que nombra la fuente de la propia ecorregión
    // 39 (maíz, yuca, sorgo y mijo; el tabaco, que es el cuarto que nombra, no
    // existe en el catálogo). Los otros cuatro salen del trabajo de Nyimba, que
    // es miombo zambiano pero seco: valen como repertorio regional de cultivos y
    // no como dato de esta ecorregión.
    cultivos: ['maiz_tropical', 'yuca', 'sorgo', 'mani', 'soja', 'caupi', 'girasol', 'batata'],
    aptitud: [
      { uso: 'pasturas', delta: 0, razon: 'El bioma suma 20 porque «el sistema pastoril es el nativo», y en el miombo el sistema nativo es un bosque. Las fuentes de las dos ecorregiones dicen que la densidad de grandes herbívoros está limitada por una vegetación de bajo contenido de nutrientes, y que la población humana es baja por los suelos pobres y por la mosca tsetsé, vector de la tripanosomiasis, que afecta tanto a las personas como al ganado doméstico. Las cargas publicadas para la formación ponen al miombo en el piso de su propio bioma y no en el techo: 15 hectáreas por unidad animal, contra 6 a 8 en sabana de Urochloa y 3 a 4 en pastizal aluvial inundable. El pasto bueno está en parches asociados a ríos y humedales, el dambo, no en el monte. Por eso el modificador queda en cero en vez de sumar, y no baja a negativo porque el pastoreo extensivo existe y es el de esos parches. Mirá la lluvia del punto antes de decidir: en el borde sur angoleño, por debajo de 800 mm, la relación entre lluvia y carga todavía no se da vuelta y ahí el premio del bioma se sostiene mejor.' },
      { uso: 'huerta', delta: -20, razon: 'El bioma de sabana no dice nada de la huerta y acá hay que decirlo, porque el sistema agrícola de este bosque no encuentra la fertilidad: la importa. El chitemene corta y quema la rama de una superficie de monte mucho mayor que la chacra para fertilizarla con la ceniza, y la fuente de la ecorregión avisa que con la población actual eso ya dejó de ser sostenible. El suelo es lixiviado y ácido, con 80 a 150 ppm de fósforo de superficie contra 1.500 a 3.000 de un suelo templado, con 0,3 a 3,0 meq por 100 g de calcio y magnesio intercambiables, muchas veces somero sobre grava ferruginosa o plintita, y con aluminio que castiga al maní y a la soja mientras la yuca lo tolera. Una huerta acá se planta en el parche fértil, que es el montículo de termita o el borde del dambo, y se sostiene con materia orgánica traída, no con el suelo del lugar.' },
    ],
    fuentes: [ONE_EARTH_39, ONE_EARTH_36, ATLAS_AFRICA, KER_SABANA, GORONGOSA, NYIMBA, RESOLVE],
  },
};
