/**
 * Fichas regionales de Australasia y Oceanía: 2 fichas para 2 ECO_ID.
 *
 * El alcance y el porqué del recorte están en `ecorregionesAustralasia.ts`. Acá
 * va lo que hay que saber para tocar los números.
 *
 * ## Esta ficha confirma el modificador del bioma en vez de corregirlo
 *
 * Las 32 fichas húmedas de Indomalaya existen para corregir un número. Esta existe para
 * **confirmarlo**, y eso es un resultado, no un lote fallido: el bioma global de
 * desierto le pone `pasturas −15` al Pilbara con la razón «la carga que aguanta
 * es baja y el error se paga con desertificación», y el relevamiento oficial de
 * la región dice exactamente eso con números.
 *
 * Lo que cambia es la razón, y la diferencia importa porque la razón viaja hasta
 * la pantalla. La del bioma describe un desierto sin ganado. Acá hay 44
 * estaciones ganaderas sobre 105.240 km² —el 58 % de la superficie relevada— y
 * el mecanismo del castigo es otro: un mosaico, no un promedio.
 *
 * Van Vreeswyk, Payne, Leighton y Hennig (2004), sobre 12.445 evaluaciones de
 * traverse en 181.723 km²:
 *
 * | | |
 * |---|---|
 * | vegetación en estado bueno o muy bueno | 77 % |
 * | regular | 11 % |
 * | pobre o muy pobre | 12 % |
 * | promedio de los rangelands de WA ya relevados | 39 / 34 / 27 |
 *
 * El Pilbara está en mejor estado que cualquier otra región relevada de
 * Australia Occidental, y el informe explica por qué sin dejar lugar a dudas:
 * «The relatively low overall impact of pastoralism is due to the large areas of
 * vegetation of moderate to very low pastoral value, i.e. the spinifex hummock
 * grasslands». El 52 % de la superficie son superficies erosionales —sierras,
 * pedimentos, planicies pedregosas— y un 18 % más son arenales con espinifex:
 * nada de eso se come. El forraje está en las planicies aluviales (4 %) y las
 * llanuras de inundación (7,5 %), o sea en un octavo de la superficie, y es
 * justo ahí donde el informe mide el daño: las praderas de tussock y los
 * matorrales de quenopodiáceas son las formaciones «most extensively and
 * substantially altered», sobre suelos duplex sin manto pedregoso que son
 * «highly susceptible to erosion».
 *
 * Por eso la lectura correcta del 77 % no es «el sistema aguanta». Es «la mayor
 * parte no se pastorea». Leerlo al revés era lo que proponía la entrega de GPT
 * —que pedía bajar el castigo a 0— y es el error más costoso que podía cometerse
 * acá: `componerAptitud` hace que el delta regional **reemplace** al global, así
 * que un 0 no suma, borra.
 *
 * ## Por qué esto no es un caso de gradiente
 *
 * La regla del encargo dice que cuando media ecorregión es apta y la otra mitad
 * no, un delta único miente en una de las dos mitades y el arreglo es de texto.
 * Acá hay mosaico pero **las dos mitades empujan para el mismo lado**, por
 * motivos distintos: el espinifex de los cerros no alimenta, y la planicie
 * aluvial que sí alimenta es la que se erosiona. No hay ninguna fracción del
 * Pilbara donde el `−15` sobre pasturas sea optimista de más.
 *
 * ## Lo que no se usó, con ruta nombrada
 *
 * La carga animal por sistema de tierras y tipo de pastura —en hectáreas por
 * unidad vacuna— está publicada en el informe complementario del mismo
 * relevamiento: Van Vreeswyk, Payne y Leighton (2004), «Pastoral resources and
 * their management in the Pilbara region of Western Australia», Miscellaneous
 * Publication 21/2004, 162 páginas. La página del repositorio abre
 * (library.dpird.wa.gov.au/misc_pbns/15/) y **el PDF pesa 108,3 MB**, así que no
 * se bajó: ningún número de esta ficha sale de ahí y ninguno se le atribuye. Es
 * la ruta para el día en que haga falta una carga en kilos y no un modificador.
 *
 * ## Lo demás
 *
 * `saberes` va vacío, como en todo el catálogo regional generado: sin geometría
 * con procedencia, licencia y acuerdo, `lib/saberes.ts` no activa nada. El
 * estudio de ecología del fuego nombra a dieciséis pueblos cuyos territorios
 * cubren el Pilbara y documenta que el corrimiento del manejo tradicional del
 * fuego engrosó el mosaico de edades de quema; eso está en el texto como lo dice
 * la fuente, y no como una práctica atribuida a nadie desde un mapa.
 *
 * `cultivos` queda sin declarar a propósito, no vacío por olvido: el catálogo de
 * `lib/especies.ts` no tiene ni una especie que el Pilbara produzca, y la
 * producción de la región es carne sobre pastura nativa. Sin el campo, la ficha
 * cae al catálogo por clase Köppen, que es más grueso pero no miente con una
 * lista inventada.
 *
 * ## Y la del Murchison, del 06/11/2026, confirma tres y por motivos nuevos
 *
 * El ECO_ID 216 son 46,38 millones de hectáreas: diez veces el Pilbara y todo
 * el interior árido de Australia Occidental. El relevamiento oficial que lo
 * describe —Technical Bulletin 84, Curry, Payne, Leighton, Hennig y Blood sobre
 * la campaña de 1985 a 1988— cubre 88.360 km², o sea **un quinto del polígono**,
 * y eso hay que decirlo porque el polígono no tiene un solo relevamiento sino
 * tres, de los diez del mismo programa estatal, y el del Murchison es el extremo
 * degradado:
 *
 * | relevamiento | km² | bueno / regular / pobre |
 * |---|---|---|
 * | **Murchison (1985)** | 88.360 | **21 / 37 / 42** |
 * | Sandstone–Yalgoo–Paynes Find (1992) | 94.710 | 45 / 32 / 23 |
 * | Goldfields del noreste (1988) | 100.570 | 39 / 32 / 29 |
 * | los diez relevamientos juntos | 843.576 | 46 / 30 / 24 |
 *
 * El Murchison es **el peor de los diez** en la clase pobre y el peor en la
 * clase buena, y los porcentajes son de evaluaciones de traverse, tomadas cada
 * kilómetro, no de superficie: el boletín usa superficie y da 42 / 37 / 21, la
 * auditoría nacional usa evaluaciones y da los mismos tres números. Que
 * coincidan es suerte de redondeo, no identidad, y por eso el texto dice cuál es
 * cuál.
 *
 * ## Tres correcciones de polígono, y dos de ellas al encargo que yo escribí
 *
 * **1. El bajo Murchison no es esta ecorregión.** El encargo invitaba a usar el
 * relevamiento de la cuenca baja si aparecía, y la entrega lo encontró —2002 a
 * 2003, unos 13.000 km², 78 % bueno contra el 21 % de acá— y lo presentó con su
 * alcance declarado. Seis puntos medidos contra RESOLVE dentro de esa área
 * —Kalbarri, los acantilados de Zuytdorp, dos puntos interiores, el sur de Shark
 * Bay y el norte de Geraldton— dan **ECO_ID 205, Southwest Australia savanna,
 * bioma 12**. No es un subárea del 216 ni un segundo muestreo del mismo sistema:
 * es otra ecorregión en otro bioma, mediterránea y de arenales con brezal. El
 * contraste 21 contra 78 no mide una recuperación ni un cambio de escala: mide
 * dos lugares distintos. **Ninguna cifra de ese informe entra acá.**
 *
 * **2. El propio relevamiento del Murchison se sale del polígono por el
 * suroeste.** Yalgoo y Mullewa, que están dentro del área relevada, dan 205. El
 * boletín ya lo avisaba sin saberlo: describe el clima como árido «with the
 * exception of the moister far south-western corner». Ese rincón es el que cae
 * afuera.
 *
 * **3. One Earth se equivoca de clima en su propia página.** Dice que la
 * ecorregión «remains one of the largest landscapes of relatively intact
 * temperate Mediterranean-climate woodland left in the world», sobre un matorral
 * árido de 190 a 240 mm. Es la segunda errata que esta fase le encuentra a One
 * Earth en Australasia, después del snappy gum presentado como acacia en la
 * página del Pilbara. Las determinaciones y el clima salen del relevamiento.
 *
 * ## Lo que decide el modificador de pasturas, y no es lo del Pilbara
 *
 * En el Pilbara el mecanismo es que **la mayor parte no se puede pastorear**: el
 * forraje vive en un octavo de la superficie. Acá no: los 74 sistemas de tierras
 * tienen capacidad asignada, incluso los cerros. Lo que pasa es otra cosa, y es
 * la escalera de capacidades que el boletín publica sistema por sistema, en
 * hectáreas por equivalente oveja seca (ha/dse) para condición buena, estimada
 * sobre el verano de noviembre a abril y suponiendo un invierno efectivo previo.
 * Contados los 66 sistemas cuyo encabezado se puede leer, que son el 90 % del
 * área relevada:
 *
 * | capacidad | superficie | sistemas |
 * |---|---|---|
 * | 5 ha/dse | **0,09 %** | 1 |
 * | 7 ha/dse | 8,9 % | 14 |
 * | 12 ha/dse | 39,1 % | 20 |
 * | 20 ha/dse | 39,8 % | 22 |
 * | 30 ha/dse | 2,0 % | 8 |
 *
 * Es un reparto, no un promedio, y el reparto es la información: **la mejor
 * tierra del relevamiento entero son 76 km²**. El sistema Merbla, el único con
 * «Pastoral potential: very high», son planicies aluviales con gilgai bajo
 * cerros de gabro «found very locally in far south-east», y el boletín mismo
 * aclara que su extensión restringida obliga a un control estricto del pastoreo.
 * El 79 % de la superficie está en 12 o 20 ha/dse, que para una oveja seca es
 * mucho, y encima esas cifras son para condición buena, que es el 21 % del área.
 *
 * Y hay un dato medido que cambia la aritmética de cualquiera que planifique
 * carga acá: el censo aéreo de canguros, cabras y otros animales grandes hecho
 * durante el relevamiento indica que **la presión de pastoreo del ganado
 * doméstico era menos del 50 % de la presión total**. Bajar el rodeo a la mitad
 * no baja la presión a la mitad.
 *
 * ## El agua, que es donde la ficha se separa del bioma
 *
 * El bioma de desierto castiga la huerta en −25 con la razón «sin agua traída de
 * otro lado no hay huerta; el sistema histórico acá es el oasis». Agua hay: el
 * boletín describe acuíferos somero extensos debajo del hardpan, que son el agua
 * con la que se desarrollaron la ganadería y la minería, y dice que el consumo
 * pastoril es chico frente al almacenamiento estimado. El problema es la
 * calidad, y su geografía está dada vuelta respecto de la intuición de diseño:
 * la salinidad **crece hacia las líneas de drenaje** y el agua menos salina está
 * en las divisorias, donde la roca está más cerca de la superficie, la napa es
 * profunda y el tiempo de residencia es corto. En el drenaje interno del lago
 * Austin pasa los 50.000 mg/L de sólidos disueltos. Más el nitrato, que supera
 * el estándar de la OMS para consumo humano en toda el área y su origen probable
 * no es contaminación sino fijación por la vegetación o las termitas.
 *
 * O sea: el −25 se confirma, pero no por falta de agua. Por una pregunta que se
 * contesta pozo por pozo y que en el lugar donde la app pondría la obra se
 * contesta peor.
 *
 * ## Y la lámina, que acá se vuelve a medir desde el otro lado
 *
 * El encargo preguntaba si el boletín trata bancos de contención, difusión de
 * agua o encauzamiento del escurrimiento laminar. **No los trata**: en 406
 * páginas no aparece ni un contour bank, ni un water spreading, ni un ponding
 * bank. La entrega contestó eso y es correcto. Lo que sí hay es mejor: el
 * boletín describe la obra que el paisaje ya tiene —los mulga groves elípticos y
 * a menudo interconectados que interceptan la lámina en las partes altas y son
 * «highly productive because of flow interception and deep soils», y los bancos
 * eólicos de wanderrie, transversales a la dirección del flujo— y registra que
 * el suelo más susceptible a la erosión son los duplex rojos con algo de
 * pendiente «subject to concentrated sheet flows after major rainfall events».
 * Concentrar la lámina es el mecanismo de la erosión, no el de la cosecha de
 * agua. Es lo mismo que midió el caso Jurrawarinna del Pilbara, por el otro
 * lado.
 *
 * ESCRITO A MANO desde los primarios (23/10/2026 el Pilbara, 06/11/2026 el
 * Murchison). El veredicto de cada lote, con lo que la entrega trajo y lo que se
 * corrigió, está en `_research/_encargos/RESPUESTAS_FICHAS_AUSTRALASIA.md`.
 */

import type { BiomaFicha } from './biomaTipos';

const RESOLVE = { label: 'Dinerstein et al. 2017 — RESOLVE Ecoregions 2017 (polígonos)', url: 'https://storage.googleapis.com/teow2016/Ecoregions2017.zip' };

/** Ficha de ecorregión de One Earth, escrita por David Olson (WWF-Hong Kong)
 *  sobre los mismos polígonos de RESOLVE que la app consulta. Aviso de calidad:
 *  la página del Pilbara trae una errata botánica —presenta el snappy gum,
 *  Eucalyptus leucophloia, como «one of many acacia species»—, así que las
 *  determinaciones se tomaron del relevamiento oficial y no de ahí. */
const ONE_EARTH = { label: 'Pilbara Shrublands | One Earth', url: 'https://www.oneearth.org/ecoregions/pilbara-shrublands/' };

/** El relevamiento oficial de la región: 181.723 km², cuatro campañas de campo
 *  entre 1995 y 1999, 12.445 evaluaciones de traverse, más de 720 perfiles de
 *  suelo y 102 sistemas de tierras. Es la fuente de todos los números de esta
 *  ficha. */
const TB92 = { label: 'Technical bulletin 92 : Inventory and condition survey of the Pilbara region, Western Australia', url: 'https://library.dbca.wa.gov.au/Journals/082156/082156-92.pdf' };

/** Fuego y mamíferos: el único de los cuatro que es literatura revisada y
 *  reciente, y el que trae el régimen de lluvia del bioregión completo. */
const FUEGO = { label: 'The influence of fire mosaics on mammal occurrence in north-western Australia', url: 'https://link.springer.com/article/10.1186/s42408-024-00317-4' };

/** Aviso de calidad, el segundo que esta fase le encuentra a One Earth en
 *  Australasia: la página del 216 dice que la ecorregión «remains one of the
 *  largest landscapes of relatively intact temperate Mediterranean-climate
 *  woodland left in the world», sobre un matorral árido de 190 a 240 mm. El
 *  clima y las determinaciones de esta ficha salen del relevamiento oficial. Lo
 *  que sí se cita de acá son las especies destacadas, las amenazas y los
 *  conteos de especies amenazadas. */
const ONE_EARTH_216 = { label: 'Western Australian Mulga Shrublands | One Earth', url: 'https://www.oneearth.org/ecoregions/western-australian-mulga-shrublands/' };

/** El relevamiento oficial del Murchison: 88.360 km², campaña de campo de 1985 a
 *  1988, 13.621 km de traverse, 679 sitios de inventario, 1.256 sitios de
 *  condición sobre 14 de los 23 tipos de vegetación, 19 tipos de tierra y 74
 *  sistemas. Es la fuente de casi todos los números de esta ficha. Abre con
 *  descarga directa y pesa 20,5 MB en 406 páginas. Ojo con la ruta: el host
 *  sirve el mismo PDF con y sin el segmento `/static/`, con tamaños distintos;
 *  la que se cita es la que la entrega midió. */
const TB84 = { label: 'Technical bulletin 84 : An inventory and condition survey of the Murchison River catchment, Western Australia', url: 'https://library.dbca.wa.gov.au/static/Journals/082156/082156-84.pdf' };

/** La ficha del mismo boletín en el repositorio de DPIRD, con resumen y partes.
 *  Se cita porque trae el aviso institucional de que el contenido puede estar
 *  desactualizado y en revisión, que es lo que convierte las capacidades de
 *  carga del boletín en referencias históricas y no en recomendaciones de hoy. */
const DPIRD_TB84 = { label: 'An inventory and condition survey of the Murchison River catchment, Western Australia — registro de la biblioteca de DPIRD', url: 'https://library.dpird.wa.gov.au/tech_bull/4/' };

/** Schoknecht y Pathan (2013), Resource Management Technical Report 380, 4.ª
 *  edición. De acá sale la ficha del grupo de suelo 523, que es el dominante del
 *  paisaje: sus atributos medidos —permeabilidad, reserva de agua, fertilidad
 *  inherente, declive de la estructura superficial— son los que importan para
 *  cualquier obra de agua. */
const SUELOS_WA = { label: 'Schoknecht y Pathan 2013 — Soil groups of Western Australia: a simple guide to the main soils of Western Australia (4.ª ed.), informe 380', url: 'https://library.dbca.wa.gov.au/Journals/080316/080316-380.pdf' };

/** La auditoría nacional que pone al Murchison en la fila de los diez
 *  relevamientos del Range Survey Program (tabla A4): 88.360 km², 13.441
 *  evaluaciones de traverse, 1.560 km² severamente degradados y erosionados
 *  (1,8 %), y clases de condición 21 / 37 / 42 **sobre evaluaciones**, contra
 *  46 / 30 / 24 de los diez juntos. Las evaluaciones se tomaron cada kilómetro y
 *  fueron casi 75.000 en 843.576 km². El PDF pesa 67 MB y hubo que bajarlo en
 *  dos tramos con `curl -C -`. */
const AUDITORIA_RANGELANDS = { label: 'National Land and Water Resources Audit — Rangelands: Tracking Changes, Australian Collaborative Rangeland Information System', url: 'https://library.dbca.wa.gov.au/static/FullTextFiles/621427.pdf' };

export const BIOMAS_REGIONALES_AUSTRALASIA: Record<string, BiomaFicha> = {
  // AU · ECO_ID 213 · bioma 13 · confianza alta
  pilbara_matorral: {
    id: 'pilbara_matorral',
    nombre: 'Matorrales y espinifex del Pilbara',
    emoji: '🏜️',
    color: '#A65E3B',
    resumen: 'El noroeste árido de Australia, entre la costa del Índico y el interior de Australia Occidental: 17,91 millones de hectáreas sobre uno de los relieves más antiguos del planeta, con sierras de hierro bandeado de más de tres mil millones de años. Llueven menos de 450 mm y caen casi todos entre diciembre y marzo, en tormenta o ciclón. Queda en estado natural o casi natural la mayor parte de la superficie y cerca del 6 % está en áreas protegidas, pero el 58 % de lo relevado son 44 estaciones ganaderas: es un sistema pastoril con siglo y medio de manejo documentado, no un desierto vacío.',
    vegetacion: 'Manda el espinifex, el pastizal de montículos del género Triodia: Triodia wiseana en los cerros y las planicies de caliza, Triodia pungens en los arenales y las costas, con Triodia lanigera, T. basedowii y T. melvillei repartidas. Encima, arbustos y árboles dispersos de Acacia y Grevillea, con snappy gum (Eucalyptus leucophloia) en las sierras y matorral de kanji (Acacia inaequilatera) en los valles. Al sur aparecen los bosques de mulga; en las quebradas y los cauces, coolibah occidental (Eucalyptus victrix), eucalipto de río (E. camaldulensis) y melaleuca de río (Melaleuca argentea). Dos hábitats raros y chicos valen la mención: los pastizales de Themeda sobre arcillas agrietadas y los palmares endémicos de Livistona alfredii en Millstream. La flora relevada son 1.137 especies vasculares, 1.094 nativas. El fuego es parte del sistema y su régimen cambió: un tercio de los sitios de condición se había quemado en los tres años previos, y la literatura de fuego atribuye el engrosamiento del mosaico de edades de quema al corrimiento del manejo tradicional aborigen, con el espinifex maduro y largamente sin quemar como el hábitat que más pesa para los mamíferos chicos.',
    fauna: 'Es uno de los conjuntos de reptiles más ricos del mundo: más de 140 especies, con gecos crípticos, dragones que imitan guijarros y escincos que nadan en la arena, más la pitón oliva del Pilbara (Liasis olivaceus barroni). Se registran 325 aves, 13 anfibios, 245 especies de hormigas y más de 36 mamíferos nativos históricos —entre ellos el quoll septentrional (Dasyurus hallucatus), el bilby mayor (Macrotis lagotis), la mulgara de cola en pincel (Dasycercus blythi) y dos endémicos, el ningaui del Pilbara (Ningaui timealeyi) y la kaluta (Dasykaluta rosamondae)— más 23 murciélagos. Y una rareza que decide cosas: la fauna acuática subterránea del acuífero, con más de 3.000 especies de invertebrados documentadas y más del 90 % endémicas de la ecorregión, según la ficha de One Earth.',
    suelos: 'El relevamiento describió más de 720 perfiles y los agrupó en 21 Soil Groups de Australia Occidental, cada uno con su clase de la Australian Soil Classification (Isbell 1996), así que no corresponde asignarle un orden único a la ecorregión. Lo que sí es general: el color rojo, el manto pedregoso y la poca profundidad. Los más extensos son suelos pedregosos muy someros sobre las sierras y arenas profundas en los arenales; al sur, tierras rojas sobre un hardpan pardo rojizo casi continuo (Duric Red Kandosol) que corta el perfil a 25 o 50 cm; en las llanuras bajas, arcillas agrietadas y no agrietadas; y en manchones de planicie aluvial salina, suelos duplex —de contraste textural— que el informe define con una frase que es toda la ficha: sostienen la vegetación que el ganado prefiere y son altamente susceptibles a la erosión. Medido: el 6,5 % de los puntos tenía erosión acelerada y el 1,2 % severa o extrema; se cartografiaron 310 km² de degradación severa, el 0,2 % del área, concentrados en 25 de los 102 sistemas de tierras, y el informe recomienda sacarlos del uso ganadero. Y hay un hecho de diseño que conviene leer dos veces antes de mover tierra acá: en la planicie de hardpan del sistema Jurrawarinna el escurrimiento laminar fue interrumpido y encauzado, y el resultado que el informe registra no es más agua abajo sino lo contrario, muerte de mulga por falta de agua y erosión. En estos paisajes el agua y los nutrientes se retienen en montículos de planta y pequeños focos de drenaje —el parche fértil de Tongway—, y concentrar la lámina en un canal desarma el mecanismo. La costra de criptógamas, en cambio, se rompe con el pisoteo pero vuelve sola si el horizonte superficial quedó entero: lo irreversible no es la costra, es perder los 30 cm que hay arriba del hardpan.',
    saberes: [],
    especies: [
      'Espinifex de caliza (Triodia wiseana)',
      'Espinifex blando (Triodia pungens)',
      'Pasto cinta (Chrysopogon fallax)',
      'Cachiyuyo plateado (Atriplex bunburyana)',
      'Mulga (Acacia aneura)',
      'Coolibah occidental (Eucalyptus victrix)',
      'Palmera de Millstream (Livistona alfredii)',
    ],
    aptitud: [
      { uso: 'pasturas', delta: -15, razon: 'El castigo del bioma se confirma, pero por otro motivo: no es que todo el Pilbara sea frágil, es que el forraje está en un octavo de la superficie. El 52 % son sierras y planicies pedregosas y otro 18 % arenales de espinifex, que el ganado no come; lo comestible son las praderas de tussock y los matorrales de quenopodiáceas de la planicie aluvial y la llanura de inundación, que son las formaciones más alteradas del relevamiento y están sobre suelos duplex sin manto pedregoso. La vegetación regional da 77 % en buen estado contra 39 % del promedio de los rangelands de Australia Occidental, y eso mide cuánto no se pastorea, no cuánto aguanta.' },
      { uso: 'reserva', delta: 15, razon: 'Se mantiene el valor, con una corrección al mecanismo: acá la costra de criptógamas se rompe con una pasada de ganado pero se rearma sola si el horizonte superficial no se alteró. Lo que no vuelve es el suelo mismo, porque abajo hay hardpan o roca a 25 o 50 cm, y lo que está en juego además de la superficie es el acuífero, donde vive una fauna subterránea con más del 90 % de endemismo.' },
    ],
    fuentes: [ONE_EARTH, TB92, FUEGO, RESOLVE],
  },

  // AU · ECO_ID 216 · bioma 13 · confianza media
  mulga_australia_occidental: {
    id: 'mulga_australia_occidental',
    nombre: 'Matorrales de mulga de Australia Occidental',
    emoji: '🌵',
    color: '#9B573A',
    resumen: 'El interior árido de Australia Occidental: 46,38 millones de hectáreas de matorral y bosque bajo de mulga sobre el cratón de Yilgarn, diez veces la superficie del Pilbara. Llueven 190 a 240 mm y lo que decide el crecimiento es la lluvia de invierno, con 55 a 80 % de probabilidad de ser efectiva, mientras la de verano es muy poco confiable: menos del 20 %. Queda mucha superficie relativamente intacta, y la razón que da la fuente no es la conservación sino la aridez: la lluvia variable y la falta de agua subterránea confiable frenaron la agricultura. Entre 1992 y 2001 hubo conversión a uso pastoril con degradación severa y una sequía posterior bajó la intensidad. El objetivo de conservación es el 66 % de la superficie y el nivel de protección es 1 en una escala de 0 a 10, que es el porcentaje de esa meta ya protegido y no el porcentaje protegido. El relevamiento oficial que describe este paisaje cubre 88.360 km², un quinto del polígono, y es el extremo degradado de tres relevamientos que lo pisan.',
    vegetacion: 'Manda la mulga (Acacia aneura), en matorral y bosque bajo, con el algodonero del desierto (Ptilotus obovatus) como la otra perenne ubicua; alrededor, pastizal de Eriachne, espinifex del género Triodia, otras acacias y Eremophila. El relevamiento clasificó 23 tipos mayores de vegetación y todos menos tres son matorrales o bosques bajos, «the majority are naturally depauperate in grasses»: la escasez de gramíneas es del sistema y no del manejo. La flora relevada son unas 830 especies vasculares, 97 % nativas y cerca del 4,5 % endémicas o casi endémicas, sin ninguna que se considere extinta. La lluvia mensual media va de unos 5 mm en noviembre a unos 26 mm en enero y febrero, con muy baja confiabilidad en cualquier mes: el verano trae o lluvias generales raras o lluvias locales chicas que pueden ser muy intensas sobre poca superficie. Lo que está peor son los tipos que el ganado prefiere: los matorrales halofíticos de cachiyuyo y bluebush, los matorrales de mulga sobre hardpan y los pastizales arbustivos sobre calcrete, pastoreados preferentemente desde hace 80 a 110 años. Sobre las superficies disturbadas o desinfladas, casi siempre en las planicies aluviales del río y sus tributarios con suelos duplex, avanzan dos nativas no palatables: la acacia espinosa (Acacia victoriae) y la needle bush (Hakea preissii). Y el fuego acá no es aliado: la ficha de ecorregión avisa que quemas demasiado frecuentes degradan la mulga e impiden que el bosque se regenere.',
    fauna: 'La ficha de ecorregión registra 12 mamíferos, cuatro aves, cuatro reptiles y cuatro plantas amenazadas, y destaca la serpiente de mulga moteada (Pseudechis butleri), que vive sólo en los bosques y matorrales de mulga de Australia Occidental, el eslizón del Gran Desierto (Egernia kintorei), el talégalo mallee (Leipoa ocellata), el perico de Alexandra (Polytelis alexandrae) y la mulgara (Dasycercus cristicauda), más los emúes y las avutardas australianas que forrajean en el matorral. Las amenazas que nombra son el pisoteo y el ramoneo de herbívoros introducidos —cabras y conejos asilvestrados—, la depredación por dingos, perros y gatos asilvestrados, y tres malezas: el boxthorn africano (Lycium ferocissimum), la viborera (Echium plantagineum) y el mezquite (Prosopis spp.); la pérdida de los bettongs, canguros rata que cavan madrigueras, cambió la ecología en algunas zonas. Y hay un dato del relevamiento que decide cuentas de manejo: el censo aéreo de canguros, cabras y otros animales grandes hecho en la época de la campaña indica que la presión de pastoreo del ganado doméstico era menos del 50 % de la presión total de todos los animales que pastorean. El informe concluye que sin control de canguros y cabras no hay regeneración posible de la vegetación.',
    suelos: 'Geología de granito y rocas verdes del cratón arqueano de Yilgarn, con las sierras muy separadas entre sí por planicies muy llanas de coluvio y aluvión. Los suelos son «mainly shallow, sandy and infertile» y en la mayor parte de las áreas bajas están sobre un hardpan silíceo rojo pardo, y el grupo dominante del paisaje tiene ficha propia: el 523, red-brown hardpan shallow loam, cuyos nombres locales son Murchison cement loam y mulga loam, con Duric Red Kandosol como clase típica de la Australian Soil Classification. Es un franco rojo sobre hardpan a menos de 50 cm, y sus atributos medidos son los que mandan en cualquier obra de agua: fertilidad inherente moderada —no baja, al revés de lo que sugiere la generalidad regional—, permeabilidad de 0 a 50 cm muy lenta, reserva de agua del suelo baja, profundidad de enraizamiento moderadamente somera, carbono orgánico superficial bajo, declive de la estructura superficial alto y, como calificador más restrictivo de los tres que admite, el subsuelo salino. La erosión acelerada está extendida: por dos métodos distintos el relevamiento la estima en 15 a 17 % del área en grado al menos leve, y las formas más comunes son el escaldado y el laminado superficial sobre 10 a 50 % de la superficie. Lo más susceptible son los duplex rojos con algo de pendiente y sujetos a «concentrated sheet flows after major rainfall events», y como el suelo tiene menos de 50 cm sobre hardpan o roca la erosión no se nota en cárcavas espectaculares: se nota en planicies desinfladas, con el horizonte superficial ido y el subsuelo salino o el hardpan inerte quedando como superficie del terreno. Se cartografiaron 1.561 km² de degradación y erosión severas en manchas de más de 40 ha, el 1,8 % del área relevada, concentrados en los sistemas Beringarra, Ero y Sherwood, y el informe dice que la mayor parte de esas planicies duplex va a seguir irreversiblemente desinflada hasta que se investiguen soluciones prácticas. La obra de agua que este paisaje ya tiene, y que conviene leer antes de dibujar otra: la lámina escurre sobre enormes planicies de wash, los mulga groves elípticos y a menudo interconectados la interceptan en las partes altas y son «highly productive because of flow interception and deep soils», y los bancos eólicos de wanderrie se acomodan transversales a la dirección del flujo; entre los groves, el intergrove tiene menos de un metro de suelo sobre el hardpan y es, junto con los pisos de drenaje, lo que el sobrepastoreo preferencial degradó. En 406 páginas el boletín no propone ni un banco de contención ni una difusión de agua ni un encauzamiento: lo que registra es que concentrar la lámina es el mecanismo de la erosión. Y el agua subterránea, que es la parte que invierte una intuición de diseño: hay acuíferos somero extensos debajo del hardpan, son el agua con la que se desarrollaron la ganadería y la minería, y el consumo pastoril es chico frente al almacenamiento estimado, pero el agua es de tipo cloruro de sodio —sales cíclicas de la lluvia más sales lixiviadas de la roca y del perfil laterítico— y la salinidad crece hacia las líneas de drenaje: la menos salina está en las divisorias, donde la roca está más cerca de la superficie, la napa es profunda y el tiempo de residencia es corto, y aguas abajo se concentra por evaporación y por la transpiración de la vegetación freatófita. En el drenaje interno del lago Austin pasa los 50.000 mg/L de sólidos disueltos, y los análisis puntuales que publica el informe van de 620 a 7.680 mg/L. El nitrato supera el estándar de la OMS para consumo humano, 45 mg/L como NO₃, en toda el área y más allá, y su origen probable no es contaminación sino fijación de nitrógeno por la vegetación o por las termitas.',
    saberes: [],
    especies: [
      'Mulga (Acacia aneura)',
      'Algodonero del desierto (Ptilotus obovatus)',
      'Pasto wanderrie (Monachather paradoxa)',
      'Pasto wanderrie lanudo (Eragrostis eriopoda)',
      'Rhagodia del desierto (Rhagodia eremaea)',
      'Cachiyuyo negro (Maireana pyramidata)',
      'Acacia espinosa (Acacia victoriae)',
    ],
    // `cultivos` no se declara, por el mismo motivo que en el Pilbara: el
    // catálogo de lib/especies.ts no tiene ninguna especie que esta región
    // produzca y la producción es carne y lana sobre pastura nativa. La entrega
    // lo dejó vacío y explicado, que es la decisión correcta.
    aptitud: [
      { uso: 'pasturas', delta: -15, razon: 'El castigo del bioma se confirma, y el mecanismo es distinto del Pilbara: acá no es que la mayor parte no se pueda pastorear, es que todo se pastorea flaco y lo bueno es diminuto. El relevamiento publica la capacidad sistema por sistema, en hectáreas por equivalente oveja seca para condición buena, estimada sobre el verano de noviembre a abril y suponiendo un invierno efectivo previo, y el reparto sobre los 66 sistemas legibles —el 90 % del área— es 0,09 % de la superficie a 5 ha/dse, 8,9 % a 7, 39,1 % a 12, 39,8 % a 20 y 2,0 % a 30. La mejor tierra del relevamiento entero, el único sistema con potencial pastoril muy alto, son 76 km², planicies aluviales con gilgai bajo cerros de gabro, y el propio informe avisa que su extensión restringida obliga a un control estricto del pastoreo. Encima esas capacidades son para condición buena, y la condición buena es el 21 % del área: el Murchison es el peor de los diez relevamientos de rangeland de Australia Occidental, con 42 % de las evaluaciones en estado pobre contra 24 % de los diez juntos. Y una cuenta que conviene hacer antes de dimensionar un rodeo: el censo aéreo de la época del relevamiento indica que el ganado doméstico ejercía menos del 50 % de la presión de pastoreo total, así que bajar el rodeo a la mitad no baja la presión a la mitad.' },
      { uso: 'huerta', delta: -25, razon: 'El valor del bioma se confirma y la razón cambia entera. El bioma dice «sin agua traída de otro lado no hay huerta»; agua hay, y mucha: acuíferos somero extensos debajo del hardpan, que son con lo que se desarrollaron la ganadería y la minería, y el consumo pastoril es chico frente al almacenamiento estimado. El problema es la calidad y su geografía está dada vuelta respecto de la intuición: el agua es cloruro de sodio y la salinidad crece hacia las líneas de drenaje, así que la menos salina está en las divisorias —roca cerca de la superficie, napa profunda, tiempo de residencia corto— y el lugar donde uno pondría la obra es el que la tiene peor. En el drenaje interno del lago Austin pasa los 50.000 mg/L de sólidos disueltos y los análisis publicados van de 620 a 7.680; el nitrato supera el estándar de la OMS para consumo humano en toda el área, por fijación de la vegetación o de las termitas y no por contaminación. Sumale 190 a 240 mm de lluvia con lo efectivo en invierno y menos del 20 % de confiabilidad en verano. El −25 queda, pero como una pregunta que se contesta pozo por pozo.' },
      { uso: 'reserva', delta: 15, razon: 'Se mantiene el valor, con un mecanismo más duro que el del bioma. El bioma habla de la costra biológica que tarda décadas en formarse; acá lo medido es que el suelo mismo no vuelve. La erosión acelerada al menos leve cubre 15 a 17 % del área por dos métodos independientes, se cartografiaron 1.561 km² de degradación y erosión severas en manchas de más de 40 ha, y el informe dice que la mayor parte de las planicies duplex erosionadas va a seguir irreversiblemente desinflada. El perfil tiene menos de 50 cm sobre hardpan o roca, así que no hay nada abajo hacia donde erosionar: lo que queda como superficie del terreno es el subsuelo salino o el hardpan inerte. Y el suelo dominante del paisaje trae medido un declive alto de la estructura superficial, que es el camino por el que eso empieza.' },
    ],
    fuentes: [ONE_EARTH_216, TB84, DPIRD_TB84, SUELOS_WA, AUDITORIA_RANGELANDS, RESOLVE],
  },
};
