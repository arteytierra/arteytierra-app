/**
 * Fichas regionales del África tropical y austral: 2 fichas para 3 ECO_ID.
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
 *
 * ## El miombo seco, del 06/11/2026: la misma conclusión con pruebas propias
 *
 * El ECO_ID 42 son 119,26 millones de hectáreas en seis países y es la hermana
 * seca de las dos de arriba: 600 a 1.000 mm contra 1.000 a 1.600, hasta seis
 * meses de seca, y heladas en altura. El encargo avisaba la trampa simétrica del
 * lote anterior —ahora que el miombo húmedo quedó en `pasturas 0`, lo fácil es
 * copiar ese cero— y el cero vuelve a corresponder, pero por un camino distinto
 * y, esta vez, con el primario abierto en la mano.
 *
 * ## Lo que el primario dice y la ficha del miombo húmedo tuvo que citar de
 * segunda mano
 *
 * *The Miombo in Transition* (Campbell, ed., CIFOR, 1996) abre: 5,9 MB, 273
 * páginas. El capítulo 2, de Peter Frost, publica en su tabla 2.5 la regresión
 * que resuelve el problema que la ficha de arriba sólo podía insinuar a través
 * del informe de Gorongosa:
 *
 * | variable dependiente | contra | regresión | r | p |
 * |---|---|---|---|---|
 * | biomasa leñosa (Mg/ha) | lluvia anual (mm) | Y = 0,14·X − 56,21 | 0,833 | <0,05 |
 * | área basal leñosa (m²/ha) | lluvia anual (mm) | Y = 0,01·X + 4,14 | 0,605 | <0,01 |
 * | **rinde herbáceo** | lluvia anual (mm) | **Y = 2,43 − 0,001·X** | **0,147** | **NS** |
 *
 * **A escala regional la lluvia anual no predice el estrato herbáceo del
 * miombo, y la pendiente ajustada es negativa.** Lo que sí predice es la leñosa:
 * más lluvia, más área basal. Y el rinde herbáceo cae con el área basal leñosa,
 * exponencialmente, por la figura 2.7 (Robertson 1984, Malaui):
 *
 *     Y = 1878,4 · A^(−0,45)      F₁,₁₀ = 6,570   p = 0,028
 *
 * **La unidad declarada en el epígrafe está mal**: dice Mg/ha, y con esa lectura
 * un área basal de 10 m²/ha daría 666 Mg/ha de pasto. Son kg/ha, y se comprueba
 * porque sólo esa lectura cae dentro del rango de biomasa herbácea que el propio
 * libro publica, 0,1 a 4,0 Mg/ha. El dosel se cierra alrededor de 10 m²/ha de
 * área basal, y ése es el punto por debajo del cual el rinde de pasto empieza a
 * subir con fuerza: la sombra es el factor principal que lo suprime.
 *
 * Compuestas las dos regresiones sobre el rango de lluvia de esta ecorregión
 * —composición mía, no un resultado publicado—:
 *
 * | lluvia | área basal | rinde herbáceo |
 * |---|---|---|
 * | 600 mm | 10,1 m²/ha | ~660 kg/ha |
 * | 1.000 mm | 14,1 m²/ha | ~570 kg/ha |
 *
 * Más lluvia hace más madera y la madera le hace sombra al pasto. Todo el rango
 * de esta ecorregión está en o arriba del cierre del dosel, así que el pasto
 * está en la rama suprimida de la curva de punta a punta.
 *
 * ## Y acá vuelve a chocar con `prodForrajera`, ahora con dos lecturas
 *
 * La escalera de `produccion.ts` da 7.000 kg MS/ha/año desde 900 mm. La
 * composición publicada da 589 kg/ha a 900 mm. Son **doce veces**. Si se corrige
 * el rinde de fin de temporada a producción anual con el factor que el propio
 * libro publica —el pico de rinde es sólo el 25 a 35 % de la producción aérea
 * anual medida a lo largo de la temporada—, quedan unos 1.960 kg/ha y la app
 * sigue leyendo **unas 3,6 veces alto**. El error va para el lado peligroso, como
 * en el miombo húmedo, y el motor sigue sin tocarse por el mismo motivo.
 *
 * Ese factor del 25 a 35 % es, además, un aviso para el trabajo de `Yp` que
 * quedó abierto de este lado: **un corte de fin de temporada no es la producción
 * anual.**
 *
 * ## El canje entre árbol y pasto, cuantificado y con su trampa
 *
 * Descepar o anillar los árboles da un aumento medio del 260 % en el rinde
 * herbáceo, con desvío estándar de 419 % sobre n = 22: el desvío es más grande
 * que la media, así que es una dirección y no un coeficiente. El desmonte de
 * arbustos llega a 400 % (Barnes 1979). Se midieron 3 a 5 Mg/ha en parcelas
 * descepadas de miombo seco en Zimbabue, según el régimen de fuego y de
 * pastoreo. **Pero** el desmonte en un sitio de miombo seco del centro de
 * Zimbabue reemplazó *Panicum maximum*, palatable, por especies no palatables; y
 * en miombo seco sacar los árboles puede reducir el forraje disponible en los
 * años de sequía, porque el árbol tolera la seca mejor que la hierba. El mismo
 * capítulo aclara que en miombo **húmedo** ese perjuicio no se espera. Es la
 * diferencia entre las dos fichas, medida.
 *
 * ## Dos correcciones de polígono, y una es a la ficha de arriba
 *
 * **1. La meseta de Makonde no es esta ecorregión.** La entrega construyó todo
 * su párrafo de suelos sobre una exposición de Soilscapes del altiplano de
 * Makonde —Ferralsoles y Acrisoles arenosos, los camellones para retener lluvia,
 * los cultivos tras el desmonte— y de ahí sacó dos de sus ids de cultivo, el
 * arroz de secano y el sésamo. Dos puntos medidos en la meseta dan **ECO_ID 28,
 * Southern Swahili coastal forests and woodlands, bioma 1**: bosque húmedo
 * tropical, no sabana. Nada de Makonde entra. El arroz se cae; el sésamo se
 * sostiene por otra fuente, que está adentro.
 *
 * **2. Nyimba está en el 66 y no en el 42, y eso lo dije mal yo.** El comentario
 * de la constante `NYIMBA`, acá arriba, afirmaba que el distrito de Nyimba «está
 * en el miombo SECO, que es el ECO_ID 42». Medido: Nyimba da **ECO_ID 66,
 * Zambezian-Limpopo mixed woodlands**. La conclusión del comentario seguía
 * siendo la correcta —no atribuirle nada al 39 ni al 36—, pero nombraba la
 * ecorregión equivocada. Corregido en el mismo movimiento.
 *
 * Y un aviso de lectura: One Earth dice que la ecorregión se extiende «over
 * central Zimbabwe», y Gweru, en el centro de Zimbabue, da 66. Harare, en el
 * noreste, sí da 42. La prosa de la ficha pisa más que su propio polígono.
 *
 * ## Lo que sí está adentro, y es lo mejor del lote
 *
 * El análisis de suelos de Mbamba, Nkuti y Mariri, en la Reserva Nacional de
 * Niassa, Mozambique: dos puntos medidos dan 42. Son catorce muestras a dos
 * profundidades en siete sitios más cinco perfiles descriptos, y traen lo que
 * ninguna fuente continental puede dar: la capacidad de intercambio catiónico
 * efectiva baja de 3,84 a 1,52 meq/100 g en los primeros 20 cm según sea chacra
 * activa, chacra abandonada o monte, y a 1,96 / 0,67 / 0,86 entre 40 y 60 cm.
 * **Y el pH va de 6,5 a 7,3.** Eso contradice de frente el perfil lixiviado y
 * ácido con aluminio de la ficha del miombo húmedo: acá el límite es químico y
 * biológico, no de acidez ni de estructura —el informe describe buena condición
 * física, estructura, drenaje interno, permeabilidad y porosidad— y por eso el
 * maní y la soja, que allá quedaban castigados por el aluminio, acá están en la
 * lista.
 *
 * El informe también nombra la trampa que ninguna otra fuente del circuito
 * trajo: **la Striga**, *S. asiatica* y *S. hermonthica*, que se vuelve severa
 * después de dos o tres años seguidos de cereal y es, junto con la caída de
 * fertilidad, lo que hace abandonar la chacra. En Mbamba la superficie de
 * chacras activas y abandonadas pasó de 1.084 ha en 2006 a más de 2.215 ha
 * acumuladas en 2016, y lo abandonado nunca se reusó. La salida que el propio
 * informe propone es una «capa arable» armada con fijadores —soja, guandul,
 * lablab, girasol— más sésamo, y reforestación con *Faidherbia albida*, que tira
 * la hoja en la estación de lluvias en vez de en la seca.
 *
 * ## El modificador que el encargo pedía mal, y es culpa del encargo
 *
 * El encargo del lote 2 decía que el bioma 7 hereda «`pasturas +20`, `huerta
 * −10`». El bioma 7 hereda `pasturas +20` y **`forestal −10`**: no tiene huerta,
 * como esta misma cabecera ya decía dos secciones más arriba. La entrega
 * contestó con honestidad a una premisa falsa y propuso «conservar el −10» de
 * una huerta que no existía. Queda en **−20**, igual que el miombo húmedo pero
 * por un mecanismo propio, y declarado como lo que es: un agregado y no una
 * confirmación.
 *
 * ## Y la tasa de rebrote, que era el encargo extra y entró
 *
 * Tabla 2.7 del libro, verificada entrada por entrada. Incremento medio anual de
 * biomasa en parcelas de rebrote de miombo seco, en Mg/ha/año, con desvío
 * estándar y n:
 *
 * | conjunto | <10 años | 11-20 | 21-50 |
 * |---|---|---|---|
 * | de incremento volumétrico | 1,52 (0,61) **4** | 1,45 (0,44) **8** | 1,56 (0,67) **5** |
 * | Chidumayo 1991a | 1,41 (–) **1** | 1,95 (0,47) **5** | |
 * | Chidumayo 1993a | 1,17 (0,94) **4** | 1,48 (0,48) **4** | |
 *
 * El texto lo resume en 1,2 a 2,0 Mg/ha/año para miombo seco contra 2,2 a 3,4
 * para húmedo. La primera fila **no es biomasa medida**: el libro aclara en su
 * nota que la calculó del incremento de volumen suponiendo una densidad de
 * madera de 0,778 Mg/m³. La entrega lo dijo y hay que reconocerlo.
 *
 * La curva de la figura 2.9, también verbatim: B = 84,20/(1+28,76·0,82^t), con
 * r² = 0,886 **y la línea de regresión excluyendo sus dos puntos más altos**, lo
 * que la entrega no trajo y cambia cómo se lee la asíntota.
 *
 * **Y acá está el error aritmético del lote.** La entrega tabuló la curva con
 * las edades corridas: sus filas dicen 30, 40 y 50 años y los valores que trae
 * son los de 25, 30 y 35.
 *
 * | edad | la entrega dice | la ecuación da |
 * |---|---|---|
 * | 10 | 17,0 | 17,0 ✓ |
 * | 20 | 54,5 | 54,6 ✓ |
 * | 30 | 70,1 | **78,3** |
 * | 40 | 78,4 | **83,3** |
 * | 50 | 82,0 | **84,1** |
 *
 * Tres de cinco filas mal, y para el lado que importa: hace ver el rebrote más
 * lento de lo que el modelo publicado dice, o sea pediría una rotación más larga
 * que la necesaria. Es exactamente la falla que este repositorio vigila —un
 * número plausible y equivocado— y sólo se detecta recalculando. Lo que la
 * entrega sí no trajo y es el número que un diseño necesita: la producción de
 * biomasa en rebrote **hace pico a los 18 a 20 años**, mientras el incremento
 * relativo cae monótonamente desde el inicio.
 *
 * Con una salvedad que conviene anotar porque la encontré recalculando: el pico
 * de 18 a 20 años sale del texto, leído de la figura 2.10, y la figura declara
 * que la estimó de esta misma regresión; pero el incremento anual de una
 * logística se maximiza donde el término exponencial vale uno, que para esta
 * ecuación es a los **16,9 años**. La fuente no coincide del todo consigo misma.
 * La ficha dice las dos cosas en vez de elegir una, que es lo que corresponde
 * cuando la discrepancia es del primario y no de la lectura.
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

/** Aviso de alcance, corregido el 06/11/2026: el distrito de Nyimba, en la
 *  provincia Oriental de Zambia, no está en ninguna de estas dos —el propio
 *  trabajo lo ubica «in the arid ecozone» y describe miombo seco, mopane y
 *  munga—, pero tampoco está en el ECO_ID 42, como decía este comentario.
 *  Medido contra RESOLVE, Nyimba da **ECO_ID 66, Zambezian-Limpopo mixed
 *  woodlands**. La conclusión no cambia y la ecorregión nombrada sí. Se
 *  cita sólo por el repertorio de cultivos del miombo zambiano, no por el suelo
 *  ni por la carga. La entrega de GPT lo usó como fuente de cultivos sin notar
 *  eso. */
const NYIMBA = { label: 'Factors Influencing Climate-Smart Agriculture Practices Adoption and Crop Productivity among Smallholder Farmers in Nyimba District, Zambia', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12371323/' };

/** Mismo aviso y más fuerte: Gorongosa está en Mozambique y no en estas dos
 *  ecorregiones. Se cita por las cargas de la FORMACIÓN miombo, que es a lo que
 *  se refiere la tabla de Myre y Antão, y por el mecanismo de los 800 a 900 mm.
 *  No hay carga publicada que se haya podido verificar adentro del 39 ni del 36. */
const GORONGOSA = { label: 'Landscapes of Gorongosa National Park Condensed version July 2008', url: 'https://gorongosa.org/wp-content/uploads/2020/11/GorongosaLandscapesJuly2008_condensed-1.pdf' };

const ONE_EARTH_42 = { label: 'Dry Miombo Woodlands | One Earth', url: 'https://www.oneearth.org/ecoregions/dry-miombo-woodlands/' };

/** Campbell, B. (ed.), CIFOR, 1996, 273 páginas. El primario del miombo, y el
 *  que esta ficha necesitaba: el capítulo 2 de Peter Frost trae la tabla 2.5 con
 *  la regresión entre lluvia y rinde herbáceo —no significativa y de pendiente
 *  negativa—, la figura 2.7 con la caída exponencial del pasto contra el área
 *  basal leñosa, la tabla 2.7 con el incremento de biomasa en rebrote y la
 *  figura 2.9 con la curva logística del rodal. El capítulo 7 de Chidumayo,
 *  Gambiza y Grundy trae el canje entre árbol y pasto y la estacionalidad de la
 *  proteína. Aviso de ruta: el encargo decía que `cifor-icraf.org/publications/`
 *  devuelve 403 y que hay que entrar por `/knowledge/publication/`. Eso vale
 *  para el buscador; **este PDF se sirve directo desde `/publications/`** y abre
 *  con curl pelado. */
const CIFOR_MIOMBO = { label: 'Campbell (ed.) 1996 — The Miombo in Transition: Woodlands and Welfare in Africa, CIFOR', url: 'https://www.cifor-icraf.org/publications/pdf_files/Books/Miombo.pdf' };

/** El único dato de suelo medido adentro del polígono: Mbamba, Nkuti y Mariri,
 *  en la Reserva Nacional de Niassa, Mozambique, los dos puntos resueltos como
 *  ECO_ID 42. Catorce muestras a dos profundidades en siete sitios, cinco
 *  perfiles descriptos, cuatro de estiércol y una de ceniza. De acá sale la
 *  ECEC, el pH, la textura, el clima del sitio, la Striga y el repertorio de
 *  cultivos. El sitio llueve 1.418,4 mm, muy por encima del rango ecorregional:
 *  es un rincón húmedo de un polígono seco y nada de acá es un promedio
 *  regional. */
const NIASSA_SUELOS = { label: 'Mariri / Niassa 2017 — Soil Analysis for Fertility Decline Assessment and its Recovering for Sustainable & Permanent Food Crops Production in Mbamba', url: 'https://biblioteca.biofund.org.mz/wp-content/uploads/2021/02/1614239147-2017_Mariri%20Soil%20Analysis.pdf' };

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

  // AO, MW, MZ, TZ, ZM, ZW · ECO_ID 42 · bioma 7 · confianza media
  miombo_seco: {
    id: 'miombo_seco',
    nombre: 'Miombo seco',
    emoji: '🪵',
    color: '#8D6E3A',
    resumen: 'La hermana seca del miombo: 119,26 millones de hectáreas repartidas entre el centro de Tanzania, Mozambique, el sudeste de Malaui, la meseta centroafricana sobre el noreste de Zimbabue y el sur de Zambia, y un área grande del suroeste de Angola. Llueven 600 a 1.000 mm, casi todo entre noviembre y marzo, y la seca fresca puede durar seis meses; las máximas medias van de 18 a 30 °C y las mínimas de 9 a 21 según la altura, con heladas en los sectores altos. El relieve es variable, de planicies llanas u onduladas a terreno quebrado, con granitos y gneises intrusivos asomando sobre el bosque como cerros redondeados —los dwalas— o inselbergs. Es parte del centro de endemismo zambeziano pero la mayoría de sus plantas son de amplia distribución y el endemismo local es bajo. El objetivo de conservación es el 37 % de la superficie y el nivel de protección es 7 en una escala de 0 a 10, que mide el porcentaje de esa meta ya protegido y no el porcentaje protegido. Afuera de las áreas protegidas, gran parte del hábitat fue convertida a lo que la fuente llama farmland de baja calidad, o está degradada por corta y fuego.',
    vegetacion: 'Lo mismo que define al miombo en general, el dominio de leguminosas Caesalpinioideae, con Brachystegia spiciformis y Julbernardia globiflora como los dominantes del dosel y Uapaca kirkiana, Brachystegia boehmii, Monotes glaber, Faurea saligna y Combretum molle como las otras comunes; en el miombo angoleño se vuelven localmente dominantes J. paniculata, Copaifera baumiana, B. gossweilerii, B. wangermeeana, Guibourtia coleosperma e Isoberlinia angolensis. Los géneros asociados son Afzelia, Burkea, Erythrophleum, Ficus, Monotes, Pterocarpus, Swartzia, Uapaca y Xeroderris, y la especie emblema de la ecorregión es la teca africana (Baikiaea plurijuga). Lo que importa para el uso es el estrato herbáceo, y está medido: la biomasa herbácea aérea de rodales mixtos relativamente poco disturbados va de 0,1 a 4,0 Mg/ha, que es el 2 a 5 % de la biomasa aérea total, con la mayoría de los valores registrados por debajo de 2,0; las hierbas de hoja ancha son cerca del 30 % de eso. La producción herbácea anual, medida siguiendo la biomasa y la necromasa a lo largo de la temporada, da 1,5 Mg/ha/año en miombo más seco de Zimbabue —57 % gramíneas, 43 % hierbas— contra 3,3 en Zaire. Y un aviso de método que vale para cualquier medición de pasto: el pico de rinde es sólo el 25 a 35 % de la producción aérea anual medida a lo largo de la temporada, así que un corte de fin de temporada subestima la producción tres o cuatro veces. La calidad es estacional y decide el año: la proteína bruta de las gramíneas baja de alrededor del 10 % en la temporada de crecimiento a cerca del 3 % en la seca, con la fibra subiendo, y el animal que vive de pasto engorda en la húmeda y pierde peso en la seca. El ramoneo de las especies del miombo, en cambio, mantiene más del 10 % de proteína bruta todo el año, aunque algunas especies tienen taninos condensados que reducen la disponibilidad de nitrógeno para el rumiante. El fuego es natural —las tormentas del comienzo de las lluvias lo prendían— y lo que cambió es la frecuencia y la estación en que se prende.',
    fauna: 'La diversidad de mamíferos es alta y el endemismo bajo. Los característicos del miombo son el antílope sable (Hippotragus niger), el alcéfalo de Lichtenstein (Alcelaphus lichtensteinii) y el duiker común, y además hay búfalo africano, kudú mayor, elefante, eland, grysbok de Sharpe, rinoceronte negro y cebra de Burchell, con león, leopardo, hiena manchada y perro salvaje africano entre los carnívoros grandes. Por las sequías anuales y los fuegos frecuentes, muchas especies dependen al menos estacionalmente de vegetación que no es miombo, adentro o al lado de la ecorregión, para comida, agua o refugio. De aves la riqueza es alta y el único casi endémico es el carpintero de Stierling. La caza furtiva de marfil es el proceso que más pesa: en el ecosistema Selous-Mikumi los elefantes bajaron de 70.406 en 2006 a 15.217 en 2014, y en la Reserva de Niassa de 20.364 a 4.441 entre 2009 y 2014. Y hay un insecto que decide el uso de la tierra más que cualquier mamífero: la mosca tsetsé, Glossina morsitans en el miombo, con G. palpalis y G. pallidipes más locales en ambientes ribereños y de monte cerrado, vector de Trypanosoma rhodesiense, que da la enfermedad del sueño en las personas, y de T. brucei, que da nagana en el ganado. Es benigna en la fauna silvestre trypanotolerante, que funciona como reservorio, y algunas razas bovinas indígenas son trypanotolerantes pero fueron reemplazadas en gran medida por razas exóticas susceptibles. Lo que separa al miombo seco del húmedo está acá: el desmonte puede erradicar la tsetsé localmente, y donde eso funcionó fue en las zonas más secas y de suelos relativamente someros, donde el rebrote leñoso es subóptimo y la tierra desmontada resultó fácil de mantener abierta; en las zonas más húmedas, sobre suelos profundos y bien drenados, el bosque vuelve y la mosca persiste.',
    suelos: 'Por zona de lluvia, la síntesis de CIFOR separa dos repartos: en el miombo de menor lluvia, Cambisoles ferrálicos y crómicos, Luvisoles crómicos y plínticos y Arenosoles; en el de mayor lluvia, Ferralsoles, Acrisoles, Luvisoles y Nitisoles. La base continental sigue siendo el Soil Atlas of Africa del JRC, derivado de HWSD y reclasificado a WRB, a escala 1:3.000.000: a esa escala el nombre del orden sirve y el porcentaje por ecorregión no, y no se extrajo ninguno. Lo que sí hay es medición adentro del polígono, en Mbamba, Nkuti y Mariri, en la Reserva Nacional de Niassa: catorce muestras a dos profundidades en siete sitios más cinco perfiles descriptos. La textura va de arena a arena franca en los primeros 20 cm y de franco arenoso a arcillo-arenoso por debajo de 60. La condición física es buena —estructura, drenaje interno, permeabilidad y porosidad—, con muy poca actividad biológica en la chacra abandonada y relativamente alta en el monte. La capacidad de intercambio catiónico efectiva es muy baja y cae con la profundidad: 3,84, 1,53 y 1,52 meq/100 g en los primeros 20 cm de chacra activa, chacra abandonada y monte, y 1,96, 0,67 y 0,86 entre 40 y 60 cm. Lo que falta es materia orgánica, nitrógeno total, fósforo disponible y potasio intercambiable, en todo el perfil; el calcio y el magnesio intercambiables están de moderadamente altos a muy altos en el suelo superficial de la chacra activa y del monte, y bajos en la abandonada. Y el pH va de 6,5 a 7,3, o sea de ligeramente ácido a muy ligeramente alcalino: acá el suelo no es ácido, al contrario del perfil lixiviado con aluminio del miombo húmedo, así que el límite es químico y biológico y no de acidez ni de estructura. El clima medido en ese sitio —1.418,4 mm de lluvia, 1.345,3 mm de evapotranspiración potencial, 69,6 % de humedad relativa media y 24,5 °C de media anual— está muy por encima del rango de la ecorregión: es un rincón húmedo de un polígono seco y ninguno de esos valores es un promedio regional. Y el aviso sobre el forraje que calcula esta misma app, que acá tiene primario: su escalera crece con la lluvia anual y termina en 7.000 kg de materia seca por hectárea y por año para 900 mm o más, pero a escala regional la lluvia anual no predice el estrato herbáceo del miombo —la regresión publicada da r de 0,147, no significativa, y de pendiente negativa— mientras sí predice la biomasa leñosa y el área basal leñosa, y el rinde herbáceo cae exponencialmente con el área basal. Compuestas las dos relaciones publicadas sobre el rango de esta ecorregión, el rinde herbáceo baja de unos 660 kg/ha con 600 mm a unos 570 kg/ha con 1.000 mm: más lluvia hace más madera y la madera le hace sombra al pasto. Contra los 7.000 kg de la app son doce veces, o unas 3,6 veces si se corrige el rinde a producción anual con el factor de 25 a 35 % que publica la misma fuente. Si vas a dimensionar un rodeo o el agua de bebida acá, la cifra de forraje de la app es la que hay que desconfiar.',
    saberes: [],
    especies: [
      'Miombo (Brachystegia spiciformis)',
      'Julbernardia globiflora',
      'Brachystegia boehmii',
      'Uapaca kirkiana',
      'Monotes glaber',
      'Combretum molle',
      'Teca africana (Baikiaea plurijuga)',
      'Mninga (Pterocarpus angolensis)',
    ],
    // Los once salen del informe de Niassa, que es el único dato agronómico
    // medido adentro del polígono: los cereales de base (maíz, sorgo, mijo), las
    // raíces (yuca, batata) y las leguminosas que la gente ya cultiva (maní,
    // caupí, guandul), más las cuatro que el propio informe propone introducir
    // para armar la capa arable (soja, guandul, girasol y sésamo; el lablab y el
    // poroto bambara no existen en el catálogo y no se sustituyeron). El arroz
    // de secano salió de la lista: venía de la meseta de Makonde, que da ECO_ID
    // 28 y bioma 1.
    cultivos: ['maiz_tropical', 'sorgo', 'mijo', 'yuca', 'batata', 'mani', 'caupi', 'guandul', 'soja', 'girasol', 'sesamo'],
    aptitud: [
      { uso: 'pasturas', delta: 0, razon: 'El bioma suma 20 porque «el sistema pastoril es el nativo», y acá el nativo es un bosque, igual que en el miombo húmedo pero con el primario abierto. El estrato herbáceo es el 2 a 5 % de la biomasa aérea: 0,1 a 4,0 Mg/ha, con la mayoría de los registros por debajo de 2,0. La lluvia anual no lo predice —la regresión publicada a escala regional da r de 0,147, no significativa, y de pendiente negativa— y lo que sí sube con la lluvia es el área basal leñosa, mientras el rinde herbáceo cae exponencialmente contra ella: el dosel se cierra alrededor de 10 m²/ha y todo el rango de lluvia de esta ecorregión está en o arriba de ese cierre. La calidad decide el resto: la proteína bruta de las gramíneas baja de 10 % a 3 % en la seca, que acá dura hasta seis meses, y el animal pierde peso en la mitad del año que importa; el ramoneo mantiene más de 10 % todo el año pero trae taninos condensados. Y la tsetsé restringe dónde se puede tener ganado, con el agravante de que las razas indígenas trypanotolerantes fueron reemplazadas por exóticas susceptibles. No baja a negativo porque el pastoreo es real y porque el miombo seco es justamente donde el desmonte queda abierto: pero el pasto que se compra desmontando es más pasto de peor especie —en el centro de Zimbabue el desmonte reemplazó Panicum maximum por no palatables— y menos confiable en los años de sequía, porque el árbol tolera la seca mejor que la hierba. Mirá la cobertura leñosa del punto antes de decidir, no la lluvia: acá la variable es el dosel, y nadie publicó todavía la densidad de árboles que optimiza el forraje.' },
      { uso: 'huerta', delta: -20, razon: 'El bioma de sabana no nombra la huerta, así que esto es un agregado y no una confirmación. El mecanismo no es el chitemene del miombo húmedo: acá el suelo medido no es ácido —el pH va de 6,5 a 7,3— y la condición física es buena, con estructura, drenaje y porosidad sanos. Lo que falta es capacidad de retener nutrientes y los nutrientes mismos: la capacidad de intercambio catiónico efectiva es de 3,84 a 1,52 meq/100 g en los primeros 20 cm y baja a 0,67 entre 40 y 60, y lo deficitario en todo el perfil es materia orgánica, nitrógeno, fósforo y potasio. A eso se le suma una seca de hasta seis meses y una trampa biológica que ninguna otra fuente del catálogo trajo: la Striga, asiatica y hermonthica, se vuelve severa después de dos o tres años seguidos de cereal y es, junto con la caída de fertilidad, lo que hace abandonar la chacra; en Mbamba la superficie de chacras pasó de 1.084 ha en 2006 a más de 2.215 acumuladas en 2016 y lo abandonado nunca se reusó. La salida que propone la propia fuente es construir la capa arable con fijadores de nitrógeno —soja, guandul, lablab, girasol— y con Faidherbia albida, que tira la hoja en la estación de lluvias; no es cal lo que falta, es carbono y nitrógeno.' },
      { uso: 'forestal', delta: 5, razon: 'El bioma castiga el forestal en −10 porque «forestar una sabana no es restaurarla», y esa razón no aplica acá: no hay pastizal que forestar, la cobertura nativa es el bosque y una rotación de monte bajo con sus propias especies es el sistema indígena, no una conversión. Pero paga poco y conviene decir cuánto. El incremento medio anual de biomasa en parcelas de rebrote de miombo seco es de 1,2 a 2,0 Mg/ha/año según tres conjuntos de parcelas —1,52 ± 0,61 sobre 4 parcelas, 1,45 ± 0,44 sobre 8 y 1,56 ± 0,67 sobre 5 para rodales de menos de 10, de 11 a 20 y de 21 a 50 años, más 1,41 y 1,95 de un trabajo y 1,17 y 1,48 de otro—, contra 2,2 a 3,4 en miombo húmedo, y la primera serie no es biomasa medida sino calculada del incremento de volumen suponiendo 0,778 Mg/m³ de densidad de madera. La biomasa en pie del rodal sigue una logística ajustada con r² de 0,886 excluyendo sus dos puntos más altos, que da unos 17 Mg/ha a los diez años, 55 a los veinte y 78 a los treinta, y la producción hace pico, según el texto del libro, a los 18 a 20 años: ésa es la rotación. La ecuación publicada pone ese pico un poco antes —el incremento anual de una logística se maximiza donde el término exponencial vale uno, acá a los 17 años—, así que la fuente no coincide del todo consigo misma y la rotación razonable es esa década larga, no un año exacto. La existencia en pie de madera aserrable es baja y dominada por fustes chicos, con alto potencial de regeneración bajo manejo. Y el uso compite de frente con la pastura por la sombra: descepar o anillar sube el rinde herbáceo un 260 % en promedio, con desvío de 419 % sobre 22 casos, así que es una dirección y no un coeficiente. El +5 dice que el uso es legítimo y nativo, no que rinda.' },
    ],
    fuentes: [ONE_EARTH_42, CIFOR_MIOMBO, NIASSA_SUELOS, ATLAS_AFRICA, RESOLVE],
  },
};
