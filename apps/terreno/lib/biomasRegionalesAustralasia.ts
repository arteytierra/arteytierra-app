/**
 * Fichas regionales de Australasia y Oceanía: arranca con 1 ficha para 1 ECO_ID.
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
 * ESCRITO A MANO desde los primarios (23/10/2026). El veredicto del lote, con lo
 * que la entrega trajo y lo que se corrigió, está en
 * `_research/_encargos/RESPUESTAS_FICHAS_AUSTRALASIA.md`.
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
};
