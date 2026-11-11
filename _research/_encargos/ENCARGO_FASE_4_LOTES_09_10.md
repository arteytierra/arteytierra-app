# Fase 4 — lotes 9 y 10: las otras dos turberas, y el cultivo que todavía no existe

*Va junto con `ENCARGO_FASE_4_FICHAS_INDOMALAYA.md` y `ANEXO_IDS_CULTIVOS.md`.
Dos archivos: `09.json` y `10.json`, **una ficha cada uno**.
Fecha: 11/11/2026.*

---

## 1. Por qué estas dos

Porque cierran un conjunto de cuatro que está nombrado y medido. **En RESOLVE
existen cuatro ecorregiones cuyo nombre dice «peat swamp forests», las cuatro en
Indomalaya**, y hasta el 06/11/2026 acequia no tenía ficha de ninguna:

| ECO_ID | | Estado |
|---|---|---|
| **221** | Borneo peat swamp forests | **este lote** — 67.620 km², la más grande de las cuatro por lejos |
| **264** | Peninsular Malaysian peat swamp forests | **este lote** — 3.630 km², la más chica |
| 280 | Sumatran peat swamp forests | montada el 06/11/2026 |
| 286 | Tonle Sap-Mekong peat swamp forests | montada el 06/11/2026 |

El lote anterior entró entero y con eso acequia pasó a tener dos de las cuatro.
Estas dos no vienen a destrabar una práctica detenida —no hay ninguna esperando
en el 221 ni en el 264—: vienen a completar la calibración de un módulo que ya
existe y que hoy decide sobre el peor suelo posible con la mitad de las fichas.

**acequia ya tiene módulo de turba.** Detecta suelo orgánico en el punto del
predio a partir del carbono del perfil, con los dos umbrales de la WRB y del
USDA, y avisa que drenar no es una penalización de rinde sino una pérdida que no
se deshace. Ese módulo se escribió contra cuatro ecorregiones donde la turba
aparece **en los bordes**, entre el 7 % y el 41 % del polígono. Con el 280 y el
286 montados tiene dos ecorregiones que **son** turba; con estas dos tiene las
cuatro, y entre ellas el gradiente completo: 20 metros de espesor en el interior
de Borneo contra parches remanentes de tres mil kilómetros cuadrados en Malaca.

Y hay un segundo motivo, que es el más importante y está explicado en la sección
3: **las dos fichas montadas cancelaron el `forestal +20` del bioma húmedo y lo
dejaron en 0, sin alternativa escrita.** Este lote es la oportunidad de que ese 0
deje de ser un callejón.

---

## 2. Lo que ya está medido y no hay que volver a averiguar

Está escrito en las fichas del 280 y del 286 y en
`_research/_encargos/RESPUESTAS_FICHAS_FASE_4_LOTES_07_08.md`. **No lo repitas:
usalo de piso y decime si en el 221 o el 264 es distinto.**

- **El hundimiento de la turba drenada, con números.** En plantaciones drenadas
  del Sudeste Asiático: **142 cm en los primeros cinco años y unos 5 cm por año
  después**, con el **92 % del acumulado por oxidación a los dieciocho años**
  (Hooijer et al., 2012). De ahí sale la cuenta que acequia puede imprimir: con
  el espesor y los 5 cm por año, cuántos años le quedan a esa turba.
- **El límite crítico de napa son 40 cm**, y el reglamento indonesio lo fija.
- **El `huerta −25` del bioma se confirma pero por otro mecanismo**: no es
  pérdida de bases por lixiviación, es que una huerta convencional pide bajar la
  napa y airear turba la oxida.
- **El `forestal +20` se canceló a 0 en las dos.** El razonamiento: el +20 dice
  que el sistema que sostiene el bioma es agroforestal de varios estratos, y en
  turba eso sigue siendo cierto **sólo si la napa no baja**. Lo que se cancela no
  es el destino sino el camino habitual para llegar ahí, que es drenar.
- **No heredes el reparto de suelos del polígono vecino.** El 277 para Sumatra y
  el 285 para el Tonlé Sap tienen nombres casi iguales y repartos distintos; las
  dos fichas del lote anterior dijeron explícitamente que no heredaban, y por eso
  entraron con confianza media y no baja. Acá los vecinos tentadores son el **219
  (Borneo lowland rain forests)** y el **265 (Peninsular Malaysian rain
  forests)**, y tampoco se heredan.

---

## 3. La pregunta que vale más que la ficha: el cultivo paludícola

Cuando el `forestal` quedó en 0, la razón escrita en la ficha dice que la versión
que funciona sobre turba **sin drenarla** es paludícola, y nombra dos: **sagú
(*Metroxylon sagu*) y jelutong (*Dyera polyphylla*, antes *D. lowii*)**. Y
después dice la parte incómoda: **ninguno de los dos tiene id en el catálogo de
cultivos de acequia.**

O sea que hoy la app sabe decir «no drenes» y no sabe decir «hacé esto». Esa es
la diferencia entre una advertencia y un diseño, y es justo lo que estas dos
ecorregiones —el corazón mundial del sagú y del jelutong— pueden cerrar.

**Lo que hace falta por especie, y es una lista finita.** Son los campos con los
que vive un cultivo en `lib/especies.ts`, y cada uno tiene que venir con fuente:

| campo | qué es | nota |
|---|---|---|
| `cientifico` | binomial aceptado | si el nombre cambió, decí los dos y cuál es el aceptado hoy, con la fuente |
| `perenne` | si el ciclo se reinicia o no | el sagú es monocárpico: florece una vez y muere. Decilo, porque no es ni anual ni perenne del modo habitual |
| `tbase_c` | temperatura base de acumulación térmica | si no está publicada, **decí que no está**: es mejor que un número inventado |
| `gdd_ciclo` | grados-día para producir | en un cultivo que tarda 8 a 12 años en cosecharse esto puede no aplicar. Si no aplica, explicá por qué |
| `tmin_letal_c` | mínima media mensual por debajo de la cual no pasa | |
| `agua_mm` | agua del ciclo, en mm | |
| `kc` | coeficiente de cultivo FAO-56 | si no existe para la especie, decí contra qué cultivo se aproxima y por qué |
| rendimiento | t/ha o kg por palma, con el ciclo | separá **ensayo** de **rendimiento real de productor**: el circuito ya rechazó una entrega por confundirlos |
| napa | a qué profundidad de napa produce | es el dato que decide todo: si produce con napa a 20 cm, el cultivo es la respuesta al `forestal: 0` |

Y la pregunta de diseño que los envuelve: **¿hay rendimiento publicado de sagú o
jelutong sobre turba con la napa por encima de los 40 cm?** Si lo hay, acequia
puede dejar de decir sólo «no drenes». Si no lo hay, **decilo con esas palabras**:
eso también cierra una pregunta, y es la respuesta que el motor necesita para no
prometer lo que nadie midió.

Esto va en `notas` de la ficha que corresponda, no en `cultivos` —el id todavía
no existe, y un id que no está en el anexo rompe el montaje.

---

## 4. Lote 9 — ECO_ID 221, Borneo peat swamp forests

**Rutas probadas el 11/11/2026:**

| Ruta | Estado |
|---|---|
| `https://www.oneearth.org/ecoregions/borneo-peat-swamp-forests/` | 200, `text/html`, 62.344 bytes — **abre y se leyó** |
| `https://en.wikipedia.org/wiki/Borneo_peat_swamp_forests` | 200, `text/html`, 171.579 bytes |
| `https://bg.copernicus.org/articles/9/1053/2012/` | 200 — Hooijer et al. 2012, el hundimiento, acceso abierto |
| `https://www.nature.com/articles/s41467-018-07820-8` | 200, 432.051 bytes — probala, es *Nature Communications* |
| `https://www.cifor-icraf.org/publications/pdf_files/Books/BPage0901.pdf` | **403**. El catálogo de CIFOR rebota; si una publicación de CIFOR tiene el dato, buscá otra ruta de archivo |

**Lo que One Earth ya dijo, para que no lo repitas.** 67.620 km² (6.762 miles de
ha). Indonesia, Malasia y Brunéi. Objetivo de conservación 53 %, nivel de
protección 3 —y ojo: **ese «3» es el porcentaje de la meta de la Global Safety
Net en escala de 0 a 10, no el porcentaje protegido**; ya se confundió una vez—.
Primera publicación: 23/09/2020. Son las turberas de la costa de Borneo **y las
de los lagos interiores del Mahakam y el Kapuas**. Suelos de arcilla ácida,
encharcados la mayor parte del año, con condiciones anaerobias que impiden que
hoja y madera se descompongan; así se acumula una capa de turba que **puede pasar
los 20 m**. Dosel dominado por *Gonystylus bancanus*, *Dactylocladus
stenostachys*, *Copaifera palustris* y seis especies de *Shorea*, con *Shorea
albida* formando a veces rodales puros; en el norte de Borneo las *Shorea* las
reemplazan *Dacrydium beccarii* y *Casuarina* spp. Estrato medio y bajo:
*Alangium havilandii*, *Blumeodendron tokbrai*, *Ctenolophon parvifolius*,
*Diospyros evena*, *Diospyros pseudomalabarica*, *Kokoona ovato-lanceolata* y
*Palaquium cochleariifolium*. Más de treinta palmas. **El 14 % de la ecorregión
está protegido, y la mayoría de las turberas fueron drenadas e incendiadas.**
*Gonystylus bancanus* figura como Vulnerable en la lista roja de la UICN.

**Las cinco preguntas del lote, en orden de lo que vale:**

1. **El espesor, que es el número del que sale una cuenta.** One Earth dice «can
   be over 20 m deep», que es un techo y no un dato. Lo que hace falta es
   **espesor típico y rango, con fuente, y el reparto de turba sobre el
   polígono**: porcentaje de Histosols en HWSD v2, en SoilGrids, y porcentaje en
   PEATMAP. Si las bases discrepan por más de diez puntos, **decilo**: eso es
   información, la ficha lo declara y no lo promedia. Y si hay diferencia entre la
   turba costera y la de los domos interiores del Kapuas y el Mahakam, esa es la
   distinción que más vale del lote.
2. **Una señal de espesor que se lee en el campo, y está a medias.** One Earth
   dice que *Pandanus ridleyi* y *Pandanus brevifolius* aparecen **en turba más
   somera**. Si hay bibliografía que ate especie o fisonomía a profundidad de
   turba —el gradiente clásico de los domos: dosel alto en el borde, bosque enano
   en el centro—, traela. Eso le daría a acequia algo que hoy no tiene: un
   indicador de espesor que no necesita un pozo.
3. **El fuego, que acá es la historia del polígono y no un riesgo abstracto.**
   Cuánta superficie se quemó y cuándo, qué pasa con la turba drenada que se
   enciende, y **si una turbera quemada se puede rehumedecer**: superficie
   rehumedecida, método, cuánto tarda, qué se recupera y qué no. acequia abre
   zanjas; necesita saber si lo que propone es reversible.
4. **El agua, con números.** Meses encharcados, profundidad de la columna, y la
   diferencia entre el domo —que se alimenta sólo de lluvia, ombrogénico— y la
   turbera de valle que recibe agua del río. No es lo mismo para diseñar: en un
   domo, el agua que se saca no vuelve.
5. **Las especies, siete, con binomial** — y **revisá las grafías de One Earth
   antes de copiarlas**. Al lote anterior le encontramos dos mal escritas en la
   misma página («Callophyllum lowii» y «Shorea teysmaniana»). Acá sospechá de
   *Palaquium cochleariifolium* y de *Kokoona ovato-lanceolata*. Si una grafía no
   la podés confirmar en una base taxonómica, escribí el género y decí por qué.

---

## 5. Lote 10 — ECO_ID 264, Peninsular Malaysian peat swamp forests

**Rutas probadas el 11/11/2026:**

| Ruta | Estado |
|---|---|
| `https://www.oneearth.org/ecoregions/peninsular-malaysian-peat-swamp-forests/` | 200, `text/html`, 61.606 bytes — **abre y se leyó** |
| `https://en.wikipedia.org/wiki/Peninsular_Malaysian_peat_swamp_forests` | 200, `text/html`, 85.303 bytes |
| `https://bg.copernicus.org/articles/9/1053/2012/` | 200 — el mismo Hooijer, que midió en Malasia también |

**Lo que One Earth ya dijo.** 3.630 km² (363 miles de ha), **sólo Malasia**.
Objetivo 55 %, nivel de protección **1**, el más bajo de las cuatro. Primera
publicación: 23/09/2020. Son parches remanentes a lo largo de las costas este y
oeste de la península, la mayoría ya explotados y degradados, con muy poco
bosque prístino. La turba se forma con hoja y material vegetal semidescompuesto
depositado **sobre arcilla marina sulfídica o aluvión de río**. El agua es negra
por los taninos y alcaloides que lixivian de la hoja, y **ácida, con pH de 2,9 a
4,5**. Los nutrientes son bajos porque la hojarasca se acumula sin
descomponerse. Árboles con raíces zancudas, contrafuertes y neumatóforos. Casi
todas las especies del bosque bajo vecino aparecen también acá —*Austrobuxus
nitidus*, *Blumeodendron subrotundifolium*, *Bhesa paniculata*, *Campnosperma
auriculatum*, *C. coriaceum*, *Diospyros maingayi*, *Durio carinatus*,
*Koompassia malaccensis*, *Litsea grandis*, *Myristica gigantea*, *Polyalthia
glauca*, *P. sclerophylla*, *Shorea platycarpa*, *S. teysmaniana*, *S.
uliginosa*, *Stemonurus scorpioides*— y las **restringidas a la turbera** son
*Gonystylus bancanus*, *Macaranga pruinosa*, *Campnosperma coriaceum*,
*Blumeodendron tokbrai*, *Parartocarpus venenosus*, *Ixora grandiflora* y
*Pternandra galeata*. En lo explotado o disturbado hay **rodales puros de
*Macaranga pruinosa* y *Cratoxylum arborescens***. Se registraron 194 especies de
ave en turbera explotada.

**Las cuatro preguntas del lote:**

1. **La arcilla sulfídica de abajo, que es un aviso de obra y no un dato de
   color.** La turba está **sobre** arcilla marina sulfídica, y el agua ya está a
   pH 2,9-4,5 **sin tocar nada**. La pregunta es qué pasa con el pH cuando se
   excava o se baja la napa y ese sulfuro se oxida: **a qué pH se llega, en cuánto
   tiempo, y qué se puede hacer después**. acequia abre zanjas y represas: el
   usuario tiene que leer esto antes de marcar una línea. El 285, al lado del
   Tonlé Sap, tiene 12 % de Gleysols tiónicos y es el otro lugar donde esto está
   medido; si las cifras de Malaca no aparecen, decí qué se puede trasladar y qué
   no.
2. **El espesor y el reparto**, igual que en el 221: HWSD v2, SoilGrids, PEATMAP,
   y el espesor con fuente. Acá importa además **cuánto queda**: si los parches
   son remanentes, el polígono de RESOLVE de 2017 puede estar describiendo un
   bosque que ya no está, y eso la ficha lo tiene que decir.
3. **Si el `forestal 0` y el `huerta −25` del 280 y el 286 valen igual acá.** Son
   la misma familia de suelo pero no el mismo país ni el mismo reglamento: el
   límite de 40 cm de napa es indonesio. **¿Qué fija Malasia?** El National Action
   Plan on Peatlands y la ASEAN Peatland Management Strategy los nombra la propia
   página de One Earth: si alguno publica un límite de napa o una regla de manejo,
   es exactamente lo que la ficha necesita.
4. **Siete especies con binomial, y una trampa ya identificada.** One Earth
   escribe «*S. teysmaniana*» y «*Crytostachys renda*». La primera es la misma
   grafía que el lote anterior tuvo que corregir a *Shorea teysmanniana*; la
   segunda es *Cyrtostachys renda*. Las dos están mal en la fuente. Revisá el
   resto de la lista con el mismo criterio.

---

## 6. Lo que vale para los dos

- **`saberes: []`, siempre.** Las prácticas van por otro encargo.
- **No hay práctica esperando en estas dos**, así que no busques una: si
  encontrás una documentada y fechada de paso, nombrala en `notas` y seguí. El
  encargo de prácticas la pide aparte y con su propio contrato.
- **Siete especies con nombre común y binomial, y sólo flora.** Hay un test que
  verifica que en ese campo no entre un género de fauna. Los animales van en
  `fauna`, que es prosa.
- **`cultivos`**: ids de la primera columna del anexo, entre comillas, **sin
  mayúsculas, acentos, barras ni espacios**. Si lo que vas a escribir tiene alguna
  de esas cosas, estás copiando un nombre y no un id. Un cultivo que la región
  produce y el catálogo no tiene **se nombra en `notas`** —y el sagú y el jelutong
  son exactamente ese caso, con la lista de campos de la sección 3.
- **Nada de Markdown adentro de los campos de texto.** Ni `**negrita**` ni
  comillas invertidas: esas cadenas salen tal cual en el panel y en el informe, y
  hay un test que las rechaza.
- **`verificacion`**: qué dicen esas páginas, con sus palabras, sobre **este**
  lugar.
- **`_meta.base_de_suelos_usada`**: qué abrió de verdad y qué no.
- **Los autores completos y en el orden de la cita, en cada fuente.** Las cuatro
  entradas de la repesca del 11/11/2026 llegaron sin autores y hubo que buscarlos
  en los cuatro casos. Quién firma es parte de la cita.
- **Un 200 no quiere decir que la página abrió, y van cinco variedades.** El
  archivo de suelos del JRC contesta 200 con 244 bytes que dicen «Request
  Rejected»; `thaiscience.info` contesta 200 con un stub;
  `sundarbanaffairswb.in` contesta 200 con su propia página de error;
  `pub.epsilon.slu.se` contesta 200 con **la portada del portal de la
  universidad, para cualquier ruta**; y `repository.pertanian.go.id`, el último,
  **no tiene registro A**: el nombre no resuelve en ningún DNS aunque el dominio
  padre sí. La regla que cierra las cinco: **mirá el tipo de contenido, no sólo el
  código y el tamaño**, y si el host no resuelve, no insistas con otra ruta del
  mismo host.
- **Cuando el editor está cerrado por el camino, el DOI alcanza para encontrar
  una copia legítima.** `api.openalex.org/works/doi:<DOI>` y
  `api.semanticscholar.org/graph/v1/paper/DOI:<DOI>?fields=openAccessPdf` devuelven
  el PDF abierto con su licencia. Así entró el artículo CC-BY que Hindawi, Wiley y
  CORE rebotaban los tres.
- **No heredes el suelo del encabezado del bloque.** El encargo grande habla de
  andisoles volcánicos y de vertisoles del Decán. Acá no hay ni una cosa ni la
  otra: hay suelo orgánico, y es otra familia de problemas.
- Una ficha por archivo. Si una no entra en una respuesta, se corta y se sigue en
  la siguiente **sin repetir nada**, con `"continua": true` en la primera.

**Mejor una ficha que aguanta que una que rellena.** Y en estas dos, mejor una
cifra de espesor de turba o un rendimiento de sagú con la napa alta que tres
párrafos de descripción: de esas cifras sale un número que el usuario va a leer
antes de decidir si abre un canal.
