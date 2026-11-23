# Resumen zonal de SoilGrids WRB contra un polígono de RESOLVE

**Estado: VIVA.** Método reproducible, servicio público, licencia CC BY 4.0.
Fecha del relevamiento: 22/11/2026.

Es la herramienta que faltaba para el ítem más viejo del backlog de
ecorregiones: *«el resumen zonal de HWSD v2 y SoilGrids contra los diez
polígonos»*. Resuelve la mitad de SoilGrids —la de HWSD no, y abajo está por
qué— y ya dio un resultado que da vuelta una ficha.

## Lo que se consigue y de dónde

| Qué | Servicio | Licencia | Tiempo |
|---|---|---|---|
| Geometría del polígono por ECO_ID | FeatureServer público de RESOLVE 2017 (ArcGIS) | CC BY 4.0 | ~0,7 s |
| Clase WRB modal y las 30 probabilidades | WCS de SoilGrids (`maps.isric.org/mapserv?map=/map/wrb.map`) | CC BY 4.0 | ~2 s por capa |

```
https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/Resolve_Ecoregions/FeatureServer/0/query
  ?f=geojson&where=ECO_ID=229&outFields=ECO_ID,ECO_NAME&returnGeometry=true&outSR=4326

https://maps.isric.org/mapserv?map=/map/wrb.map&SERVICE=WCS&VERSION=2.0.1
  &REQUEST=GetCoverage&COVERAGEID=MostProbable&FORMAT=image/tiff
  &SUBSET=X(106.064,110.606)&SUBSET=Y(-7.695,-6.512)
  &SUBSETTINGCRS=http://www.opengis.net/def/crs/EPSG/0/4326
  &OUTPUTCRS=http://www.opengis.net/def/crs/EPSG/0/4326
```

El TIFF sale a 0,002083° de píxel (≈ 230 m en el ecuador), deflate, 16 bits, y
lo lee PIL sin GDAL. Un polígono entero pesa 150 a 650 KB por capa.

**Lo que no sirve.** La API REST de SoilGrids tiene dos endpoints y hacen falta
los dos para descartarla: `properties/query` contesta en 26 s por punto y
`classification/query` —el que daría la clase WRB, que es justo el que hace
falta— no contestó en 45 s en ninguno de tres intentos. Un zonal por muestreo
de puntos quedaba en 20 a 45 minutos por polígono y encima con el endpoint
caído. El WCS da el raster entero en dos segundos: es un pedido por capa, no
uno por punto.

## Las dos cosas que hace el script

`soilgrids-zonal.py`, al lado de este documento.

### 1. Deduce el mapeo valor → clase en vez de suponerlo

El raster `MostProbable` trae enteros de 1 a 32 y **el mapeo no está publicado**:
el WCS no lo lista, el `GetFeatureInfo` del WMS devuelve el feature vacío y la
leyenda del WMS es un PNG de 113×473 con las etiquetas dibujadas. El orden
alfabético de las capas del `GetCapabilities` **no** es el mapeo: con ese orden
el suelo dominante de Java occidental sería Calcisols, que en una isla
volcánica húmeda no tiene sentido.

Lo que sí es verificable es la definición del producto: `MostProbable` es el
argmax de las 30 capas de probabilidad. Así que el script baja las 31 capas
sobre la misma grilla y, para cada valor que aparece, busca qué grupo maximiza
la probabilidad en esos píxeles. El servicio contesta su propio mapeo.

En los dos polígonos de Java la identificación salió **unánime al 100 %** en
los 17 valores presentes, lo que además confirma que las 31 capas comparten
grilla exactamente. El mapeo observado:

| Valor | Grupo | | Valor | Grupo |
|---|---|---|---|---|
| 2 | Alisols | | 12 | Gleysols |
| 3 | Andosols | | 16 | Leptosols |
| 4 | Arenosols | | 17 | Lixisols |
| 6 | Cambisols | | 19 | Nitisols |
| 10 | Ferralsols | | 20 | Phaeozems |
| 11 | Fluvisols | | 22 | Plinthosols |

Está incompleto a propósito: son los valores que aparecieron, y el script
vuelve a deducirlo en cada corrida en vez de leer esta tabla. **Si alguna vez
la unanimidad baja de 100 %, el valor queda sin nombre y se reporta**, que es
lo contrario de asignarle el grupo plausible.

Un dato que esto corrigió sobre la marcha: por el tamaño de las clases yo había
conjeturado que el valor 10 era Andosols. Es Ferralsols. La conjetura habría
invertido el resultado entero de este relevamiento.

#### El mapeo es el índice alfabético, y hubo un off-by-one en el medio

Deducido en nueve polígonos de cuatro continentes, el resultado coincide
**exactamente** con el índice alfabético base 0 de las 30 capas de
probabilidad: el valor *v* es la clase número *v* de la lista alfabética, con
Acrisols en 0 y Vertisols en 29. Dieciocho valores validados con unanimidad del
100 % y ni uno que se corra.

Eso contradice lo que este mismo documento decía al principio —que el orden
alfabético **no** era el mapeo, porque habría hecho dominantes a los Calcisols
en la Java volcánica—. La deducción estaba bien y la refutación estaba mal: el
cálculo que la descartó leía la lista en base 1. En base 0 cierra en los
dieciocho casos.

La deducción se queda igual de todas formas, y no por ceremonia: es la que
verificó el mapeo, es la que detectó el próximo defecto de esta lista, y es la
que avisa si ISRIC alguna vez reordena la leyenda.

#### El valor 0 es dos cosas, y separarlas movió todos los porcentajes

Esto estuvo mal medio día y es el defecto más caro que tuvo el script. El
valor 0 es **Acrisols** —el primero de la lista— y es también el **relleno del
ráster donde no hay suelo**. El script descartaba todo el 0 como «sin dato»,
así que tiraba los Acrisols y calculaba el resto sobre un denominador chico.

Medido, con dos cuadrados:

| Cuadrado | Valor 0 | Las 30 probabilidades ahí |
|---|---|---|
| Atlántico abierto, 25º W 10º N | el 100 % de los píxeles | **todas en 0** |
| Guinea forestal, 8,9º W 8,1º N | el 12 % de la tierra | Acrisols 21,5, la más alta de las 30 |

Así que el 0 no se puede descartar sin tirar los Acrisols ni contar sin sumar
el océano. La prueba que los separa es la capa de Acrisols, y es exacta: si en
un píxel con valor 0 la probabilidad de Acrisols es mayor que cero, el píxel es
Acrisols, porque un argmax no puede valer cero mientras las 30 clases suman
100; y si vale cero, no hay dato. Con eso, el valor 0 pasa a deducirse como
cualquier otro, y **sale Acrisols al 100 % de unanimidad en los nueve
polígonos**.

Cuánto movía:

| ECO_ID | Acrisols que se estaban tirando | Clase dominante antes → después |
|---|---|---|
| 294, Irrawaddy seco | **21,5 %** | Vertisols 44,0 % → **34,6 %** |
| 297, Decán norte | 7,8 % | Luvisols 42,4 % → 39,1 % |
| 298, Decán sur | 1,6 % | Vertisols 43,1 % → 42,4 % |
| 290, 315, 323, 221, 216 | 0,0 a 0,3 % | prácticamente sin cambio |

En el Irrawaddy la diferencia era de diez puntos en la clase dominante, y en el
Decán sur la fracción lixiviada de la regla pasaba de 9,7 % a 11,1 %, o sea de
proponer 0 a proponer −5.

#### Y el submuestreo sólo vale hasta 2x

El tercer hallazgo del día, y corrige al segundo. Este documento afirmaba, con
una medición, que `SCALESIZE` con `INTERPOLATION=NEAREST` **no interpola**. Vale
hasta la mitad y no más. Pedido un cuadrado de dos grados del miombo seco a
cuatro escalas:

| Escala | Tamaño | Clases distintas | Valores que el nativo no tiene |
|---|---|---|---|
| nativa | 960×960 | 8 | — |
| mitad | 480×480 | 7 | ninguno |
| **un cuarto** | 240×240 | **27** | **19** |
| un octavo | 120×120 | 21 | 15 |

Un cuadrado que tiene ocho clases pasa a tener veintisiete. Arriba de 2x el
servidor sirve de una pirámide promediada y `NEAREST` no lo impide: el promedio
de dos códigos de leyenda es un tercer código que corresponde a una clase que
no está ahí. En el miombo aparecían **Cryosols, Chernozems y Kastanozems** en
Zambia.

La prueba vieja no lo detectaba porque comparaba la misma capa a dos escalas
vecinas, y el defecto empieza en la tercera. Por eso ahora el script **corta**
en vez de submuestrear más de 2x, y dice que el polígono necesita mosaico por
tiles. El único de los diez que no entra es el miombo seco (42), que pide 4,4x.

Lo que lo delató fue la deducción del mapeo: en el miombo submuestreado,
veintiséis de los treinta valores salían sin unanimidad y dos valores distintos
salían los dos Vertisols al 100 %, que es imposible para un argmax. Las grillas
estaban perfectamente alineadas —mismo origen, mismo paso, mismo tamaño—, así
que no era desalineación: era el dato.

### 2. Recorta al polígono, no al bbox

El bbox de una ecorregión de cumbres volcánicas es casi todo territorio ajeno.
El recorte es ray casting sobre el GeoJSON, en Python puro, por **scanline**:
para cada fila de latitud del raster se calculan una sola vez los cruces de
todos los anillos, y de ahí salen por paridad los intervalos de longitud que
están adentro. Las columnas se despejan por aritmética; la fila no se recorre.

**Cuánto cambia, medido en Java occidental:**

| | Bbox | Recortado al polígono |
|---|---|---|
| Cambisols | 72,8 % | 78,1 % |
| Andosols | 9,9 % | **17,8 %** |
| Ferralsols | 13,5 % | **3,5 %** |

Los andosoles casi se duplican y los ferralsoles bajan a un cuarto, en la
dirección que el paisaje predice: el polígono son los conos volcánicos y el
bbox le agrega las llanuras lixiviadas de alrededor. **Sin el recorte el
número no sirve.**

#### Por qué scanline y no un test por píxel

La primera versión probaba cada píxel contra cada vértice. Eso es
O(píxeles × vértices), y en el miombo seco son 6 Mpx × 14.608 vértices: 87 mil
millones de operaciones, horas de CPU. El scanline lo deja en
O(filas × vértices), unos 35 millones en el mismo caso. La prueba de que la
cuenta no cambió es el polígono 264, que ya estaba medido: vuelve a dar 67.718
píxeles adentro y la misma cuenta por clase, idéntica hasta el píxel, en 2,4 s.
(El porcentaje de Histosols de ese control era 92,4 %; con el arreglo del valor
0 que viene más abajo pasó a 91,7 %, porque el denominador creció.)

#### Y de paso arregló un error que nadie había visto

El FeatureServer **no anida los agujeros**. Devuelve el MultiPolygon con cada
anillo como una parte propia: un hoyo no viene adentro de su parche sino al
lado, y lo único que lo delata es que gira al revés. La versión vieja tomaba
`p[0]` como exterior y `p[1:]` como agujeros —el esquema de GeoJSON— y como
`p[1:]` venía siempre vacío, **nunca descontaba un agujero**: contaba el hoyo
como superficie de la ecorregión.

El scanline es inmune por construcción, porque la paridad no necesita saber
cuál anillo es cuál: un píxel adentro de un exterior y de un agujero cruza dos
bordes y queda afuera, que es lo correcto. Vale mientras los parches de una
ecorregión no se solapen entre sí, que es el caso.

Cuánto importaba, revisando las geometrías de todos los polígonos corridos:

| ECO_ID | Anillos invertidos | Bruto | Neto | Diferencia |
|---|---|---|---|---|
| 42 — miombo seco de Zambeze | 109 de 243 | 1.322.738 km² | 1.190.259 km² | **10 %** |
| 221 | 1 de 29 | 67.653 km² | 67.446 km² | 0,3 % |
| 423 — matorral interior de California | 1 de 11 | 164.283 km² | 71.308 km² | **130 %** |
| 216, 229, 264, 288, 290, 294, 297, 298, 305, 315, 323 | ninguno | — | — | — |

Los que ya estaban publicados —264, 323, 229, 288, 305— no tienen ningún anillo
invertido, así que **sus números quedan como estaban**. El que sí cambiaba era
el 42, y estaba sin correr.

## El resultado: Java occidental contra Java oriental y Bali

La ficha `java_bali_montano` de acequia cubre dos ecorregiones —288 *Western
Java montane rain forests* y 229 *Eastern Java-Bali montane rain forests*— y el
backlog pedía partirla. Esto es lo que apareció al medir cada una por separado.

| | Oeste (288) | Este + Bali (229) |
|---|---|---|
| Píxeles dentro del polígono con dato | 490.320 | 297.888 |
| Peso en la ficha única | 62 % | 38 % |
| Cambisols | 78,1 % | 70,9 % |
| Andosols | **17,8 %** | **9,1 %** |
| Ferralsols | 3,5 % | 18,0 % |
| Acrisols | 0,5 % | 1,9 % |
| **Fracción lixiviada/ácida (grupo A)** | **4,1 %** | **19,9 %** |
| Delta de la regla de acequia | **0** | **−5** |

### Primero, la validación

Agregando los dos polígonos ponderados por píxel, la fracción lixiviada da
**10,1 %**. La ficha le atribuye a SoilGrids **10 %**. Coinciden a menos de un
punto, así que este método y el del relevamiento original miden lo mismo: lo
que faltaba no era corregir el agregado, era desagregarlo.

### Y después, el problema

La ficha declara el reparto de HWSD v2 por sector: *«el sector este y Bali
tiene 62 % de Andosols y 0 % de Acrisols, y el oeste 29 % y 28 %»*. Puesto al
lado de lo medido acá:

| | HWSD v2 (ficha) | SoilGrids (este relevamiento) |
|---|---|---|
| Lixiviado en el **oeste** | 28 % → delta −5 | 4,1 % → delta **0** |
| Lixiviado en el **este + Bali** | 0 % → delta 0 | 19,9 % → delta **−5** |
| Andosoles donde abundan | el este (62 % vs 29 %) | el oeste (17,8 % vs 9,1 %) |

**Las dos bases están exactamente invertidas.** Cada una dice que el sector
lixiviado es el que la otra da por limpio, y lo mismo con los andosoles.

Y lo que hay que entender de esto es por qué no se veía: **la ficha única
propone −5 y lo justifica diciendo que las dos bases coinciden, y coinciden de
verdad… en el promedio.** HWSD agregado da 18 % → −5; SoilGrids agregado da
9,1 % → 0 o −5 según el borde del redondeo. El acuerdo entre fuentes que la
regla exige se cumplió por aritmética, promediando dos sectores sobre los que
las fuentes dicen lo contrario una de la otra.

Es el modo de falla de acequia en su forma más difícil de ver: no es un número
roto, es un número con dos fuentes que lo respaldan, y el respaldo es casualidad
del promedio.

## Qué se puede partir y qué no

**Se puede partir el texto, y está listo para partirse.** La ficha ya tiene todo
separado por sector y citado:

- Clima: húmedo y casi sin estación seca al oeste; tropical con estación seca al
  este y en Bali.
- Fauna: los 64 mamíferos y el gibón de Java (*Hylobates moloch*) son del oeste;
  el leopardo de Java y el cuón persisten en el sector oriental.
- Los estudios, cada uno con su sector: Lembang (Typic Hapludands, retención de
  fósforo > 90 %) es Java occidental; Rejoso, en las laderas del Bromo (> 55 %
  de cobertura arbórea arriba y > 80 % en la zona media) es Java oriental.
- Las dos fichas de WWF ya están citadas: `im0167` y `im0112`.
- **El Dieng queda del lado oeste**, y esto quedó resuelto acá: el polígono 288
  llega a 110,61 °E y el 229 empieza en 111,00 °E, y el plateau está en
  109,9 °E. El estudio de los andisoles de ladera bajo papa —30 t/ha que bajaron
  a 12-15 por desbalance de nutrientes y erosión— es del sector occidental.

**No se puede partir el delta de aptitud.** Con la regla actual, el signo del
delta de cada mitad depende de a qué base se le crea, y las dos son admisibles
—quedan a 5 puntos, justo en el límite que la regla tolera—. Partir hoy sería
elegir una base sin motivo y publicar el resultado como si fuera medido.

Lo que lo desempata es una tercera fuente que **nombre el suelo de cada
sector**, que es la salida que la propia regla prevé. La ficha ya cita dos
candidatas indonesias, SUKARMAN y SUPRAYOGO, y no están leídas con esta
pregunta en la mano. Eso es el próximo paso y es trabajo de fuente, no de
código.

## El otro uso del polígono: verificar el nombre de una ficha

La geometría de RESOLVE no sirve sólo para recortar un raster. Sirve para
preguntarle a una ficha si su nombre describe su territorio, y el 22/11/2026
eso resolvió un pendiente que llevaba cuatro lotes abiertos.

La ficha del ECO_ID 305 se llamaba `pinar_toba`. Cuatro entregas consecutivas
del encargo de prácticas propusieron para ella prácticas de las orillas del lago
Toba, y las cuatro veces la respuesta fue repetir la advertencia en el encargo
siguiente —«`pinar_toba` no es el lago Toba», tres y cuatro veces, con las
palabras cada vez más grandes—. A la cuarta quedó claro que el problema no
estaba en el encargo.

Medido contra el polígono, que son cinco parches, con el área por shoelace
corregida por la latitud media de cada uno:

| Parche (centro) | km² | % | Distancia al lago Toba |
|---|---|---|---|
| 96,93 E 4,38 N — Aceh | 896 | 32,5 % | 286 km |
| 101,27 E 2,07 **S** — Barisan, cerca del Kerinci | 780 | 28,3 % | 587 km |
| 96,26 E 5,04 N — Aceh | 635 | 23,1 % | 391 km |
| 98,89 E 2,78 N | 250 | 9,1 % | 22 km |
| 99,16 E 2,17 N | 192 | 7,0 % | 63 km |

Total 2.754 km², contra los ~2.800 km² que la ficha declara: coinciden al 1,6 %,
así que la medición del área también queda contrastada.

- **16 %** a menos de 120 km del lago que le daba el nombre.
- **56 % en Aceh**, a 286 y 391 km.
- **28 % al sur del ecuador** — el parche de los únicos rodales naturales de
  *Pinus merkusii* al sur del ecuador, que la ficha ya mencionaba sin ubicarlo.

La ficha pasó a `pinar_sumatra`. **Y la corrección que circulaba también estaba
mal**: lo que los encargos y los comentarios del código repitieron cuatro veces
fue «el 305 es el pinar de Kerinci», y Kerinci es el 28 %, no el grueso. Aceh
primero.

Esto además arregló una búsqueda de fuentes que estaba apuntada al lugar
equivocado. El campo `suelos` de la ficha decía que para resolver su
discrepancia de suelos haría falta «la cartografía de BBSDLP de Sumatra Utara»
—la provincia del lago, que cubre el 16 %—. Con el reparto medido, la que hace
falta primero es la de Aceh.

**La moraleja operativa:** cuando una ficha atrae el error dos veces, medir el
polígono sale más barato que volver a advertirlo en el encargo.

## La mitad que falta: HWSD v2

No hay servicio WCS ni WMS de HWSD v2 en ISRIC —`hwsd2.map`, `hwsd.map` y
`wise.map` devuelven 200 con cero capas—, así que **el HWSD de este documento es
el que trae la ficha y no sé con qué recorte se calculó.** Mientras eso no se
reproduzca con el mismo recorte al polígono, la comparación de arriba tiene esa
costura: parte de la inversión podría ser diferencia de método y no de datos.

Dos cosas la hacen poco probable como explicación completa. Una, que el
agregado de SoilGrids reproduce el del relevamiento a menos de un punto, así
que al menos de ese lado el método coincide. La otra, que con ningún recorte
—bbox ni polígono— SoilGrids llega a ver 28 % de lixiviado en el oeste ni 62 %
de andosol en el este.

Para cerrarlo hay que bajar HWSD v2 de FAO (raster global, descarga directa, no
hay servicio por punto) y correr el mismo recorte. Es la continuación natural
de esto.

## La prueba en un polígono nuevo: las turberas de Malaca (264)

Para no publicar una herramienta sin probarla fuera del caso que la motivó, se
corrió completa sobre el ECO_ID 264, *Peninsular Malaysian peat swamp forests*,
otro de los diez del backlog. 67.718 píxeles adentro del polígono, seis valores
presentes, los seis identificados con unanimidad del 100 %.

| Grupo | Superficie |
|---|---|
| Histosols | **91,7 %** |
| Ferralsols | 7,3 % |
| Acrisols | 0,8 % |
| Nitisols, Cambisols, Fluvisols, Gleysols | 0,2 % entre todos |

El zonal descubre por su cuenta que la ecorregión de turberas es turba, que es
la mejor validación que puede dar: el resultado es verificable contra el nombre
del polígono.

Y da algo más. Con el **grupo B** de la regla —que a los lixiviados les suma la
turba y los salinos o sódicos— la fracción con limitante severa es del 99,8 % y
el delta sale **−25**, que es exactamente el que la ficha
`pantanos_turba_malaca` ya tiene puesto en huerta. Ese número venía del
relevamiento y no estaba reproducido con una medición propia; ahora lo está.

**Una limitación del grupo B que hay que tener presente.** Los suelos tiónicos
—sulfatados ácidos— son un *cualificador* de la WRB y no un grupo de
referencia, así que `MostProbable` no los puede distinguir. En las turberas con
material sulfídico debajo y en los manglares, la fracción del grupo B que este
script calcula es un **piso y no el total**. El script lo imprime en cada
corrida para que no se lea como cifra cerrada.

## El Decán: tres fichas que decían que acá no hay vertisol

Las tres fichas del Decán seco eran las únicas del bloque de Indomalaya sin
reparto de suelos, y las tres lo decían. Dos además afirmaban algo más fuerte:
que el vertisol negro de la traza basáltica **no se hereda** ahí, porque es otro
basamento. Medido contra el polígono:

| ECO_ID | Ficha | Píxeles con dato | Vertisols | Luvisols | Siguiente |
|---|---|---|---|---|---|
| 315 | Matorral espinoso del Decán | 1.649.131 | **76,6 %** | 8,0 % | Cambisols 5,6 % |
| 290 | Decán central | 2.389.695 | **74,3 %** | 17,2 % | Leptosols 3,2 % |
| 298 | Decán sur | 1.552.535 | **42,4 %** | 26,3 % | Cambisols 17,2 % |
| 297 | Decán norte | 1.138.984 | **32,5 %** | 39,1 % | Leptosols 9,7 % |

El gradiente es limpio y va del basalto al norte. Lo que no se sostenía era la
negación: en el norte el vertisol es un tercio del polígono y en el sur es el
orden dominante. Y el 315, que es el que más tiene, no negaba nada: su propia
ficha dice que el 93 % del distrito de Dhule está sobre basalto de la traza.

**Y lo que lo convierte en un defecto y no en un matiz** es que la app ya lo
sabía por otra vía. `lib/sueloExpansivo.ts` infiere el suelo expansivo punto a
punto de la arcilla y la CEC de SoilGrids, con los umbrales de la WRB 2022, y
habría marcado «posible» en un tercio del 297 y en más de dos quintos del 298
mientras el campo `suelos` de esas mismas fichas decía que ahí no hay. Dos
partes del mismo programa contestándose distinto, que es la misma forma del
defecto que había entre el calendario y la aptitud en los manglares.

### El promedio volvió a esconder la mitad del asunto

Como en Java, el número del polígono entero no es el número del predio. Por
tercios de superficie:

| 298, por latitud | Sur | Centro | Norte |
|---|---|---|---|
| Vertisols | **75,1 %** | 37,3 % | 14,9 % |
| Luvisols | 2,6 % | 28,9 % | **47,5 %** |

El 298 junta dos provincias de suelo —la llanura de suelo negro algodonero del
extremo meridional de la península y la meseta roja del norte— y el 42 % del
promedio no describe a ninguna de las dos. El 297, en cambio, lo tiene
repartido: 24 % al oeste, 48 % al centro, 25 % al este, y de 26 a 31 % de norte
a sur. Ahí el promedio sí sirve, y eso también hay que medirlo para saberlo.

### Lo que dice la estadística agrícola del mismo territorio

Los planes de contingencia agrícola de distrito del ICAR traen los suelos
mayores con su nombre vernáculo, así que se puede contrastar:

- **Kondagaon**, en la meseta de Bastar (297), nombra entre sus cinco suelos
  mayores el *Vertisols (Kanhar-clayey)*, sin superficie.
- **Sundargarh** (297, borde norte) da suelo negro 3,3 %, contra rojo 26,5 % y
  franco arenoso 17,0 %.
- **Chamarajanagar** (298, tercio central) da suelos negros medios 16,0 %,
  contra rojo franco 14,2 % y rojo franco arenoso 4,8 %. Esas tres filas suman
  el 35 % del distrito y el resto, que es bosque, queda sin clasificar:
  renormalizado sobre lo que sí clasificó, el negro es el 46 %, **el mismo
  orden que el 37,3 % que SoilGrids da para ese tercio**.

La estadística de distrito y el zonal no se contradicen; lo que no coincide es
la escala a la que cada uno mide. El detalle de las fuentes y de las listas de
cultivos que salieron del mismo trabajo está en
`_research/CULTIVOS_SIN_CURAR.md`.

### El control que no pasa: el Irrawaddy seco

El vertisol apareció también donde la ficha no lo esperaba y a 2.000 km del
Decán. El ECO_ID **294**, los bosques secos del Irrawaddy, da **34,6 % de
Vertisols**, 30,4 % de Luvisols y 21,5 % de Acrisols —y su ficha decía, con las
mismas palabras que las del Decán, que el vertisol negro de la traza basáltica
no se hereda ahí—.

Pero este polígono tenía una segunda fuente, y **no cierra**:

| | FAO, tabla nacional de Myanmar | 34,6 % / 30,4 % de este polígono |
|---|---|---|
| Vertisol | 0,48 Mha en todo el país | **1,22 Mha** — dos veces y media el total nacional |
| Catena de luvisoles | 1,78 Mha en todo el país | 1,07 Mha — el grueso, y es la zona seca |

El luvisol cierra perfecto: la catena nacional vive justamente en la zona seca
central, y este polígono se lleva tres cuartos de ella. El vertisol no cierra
de ninguna manera: SoilGrids mete en una sola ecorregión dos veces y media el
vertisol que la FAO le asigna al país entero.

**Qué se hace con eso, y qué no.** No se descarta la medición ni se descarta la
FAO: una tabla nacional vieja y un modelo global de 250 m no miden lo mismo ni
con la misma definición de clase. Lo que sí queda establecido es **cuál de las
treinta clases necesita una segunda fuente**, y es ésta. En la India la tiene y
la pasa —la estadística de distrito de Chamarajanagar da 46 % de suelo negro
sobre lo que clasificó, contra 37,3 % del zonal en ese mismo tercio—; en
Myanmar la tiene y la falla por un factor de dos y medio.

Esto importa más allá del campo `suelos` de una ficha, porque
`lib/sueloExpansivo.ts` infiere el suelo expansivo punto a punto de la arcilla y
la CEC **de las mismas capas de SoilGrids**. Si la clase está sobredicha en el
sudeste asiático, el aviso del panel lo está con ella. Por eso ese módulo
declara el nivel `posible` y manda al campo, y por eso la ficha del 294 escribe
los tres criterios de la WRB que se ven en una calicata: grietas de medio
centímetro que abren y cierran, agregados en cuña inclinados entre 10º y 60º y
caras de deslizamiento en el 10 % de las caras. Lo que resuelve esto no es otro
ráster: es un pozo.

## Cómo se corre, y qué queda del backlog

```
python -I soilgrids-zonal.py 297 ./salida
```

Toma el ECO_ID y se encarga del resto: trae la geometría, baja las 31 capas,
recorta y reporta. Las descargas quedan en caché en la carpeta de salida, así
que una segunda corrida sobre el mismo polígono no vuelve a bajar nada. **Corta
con error —y no con un número— en cuatro casos**: si RESOLVE truncó la
geometría, si una capa no vino después de los reintentos, si lo que vino no es
un TIFF sino la excepción XML del servidor, y si el bbox necesitaría más de 2x
de reducción. Los cuatro producirían un zonal plausible y equivocado.

Sobre los reintentos: el WCS de ISRIC sirve de a ratos un tile roto, con HTTP
400 y `ZIPDecode: Decoding error` o `_TIFFPartialReadStripArray`. Es
intermitente y no es de la petición —`MostProbable` sobre el mismo cuadrado de
la pampa dio 400 tres veces y 200 cinco minutos después—, y el 22/11/2026 tumbó
seis de los ocho polígonos de un lote. Con espera creciente los seis salieron.

### El recuento

De los diez polígonos que pedía el backlog están hechos **nueve**: 264, 290,
294, 297, 298, 315, 323, 221 y 216. Más **288** y **229**, los dos de Java,
que no estaban pedidos y que hay que volver a correr con el arreglo del valor 0.

| ECO_ID | Ficha | Clase dominante | Fracción del grupo A |
|---|---|---|---|
| 290 | Decán central | Vertisols 74,3 % | 0,5 % |
| 315 | Matorral espinoso del Decán | Vertisols 76,6 % | 4,6 % |
| 298 | Decán sur | Vertisols 42,4 % | 11,1 % |
| 297 | Decán norte | Luvisols 39,1 % | 7,8 % |
| 294 | Bosques secos del Irrawaddy | Vertisols 34,6 % | 21,9 % |
| 323 | Manglares del Sundarbans | Fluvisols 96,7 % | 0,2 % |
| 264 | Turberas de Malaca | Histosols 92,4 % | 7,4 % |
| 221 | Turberas de Borneo | Histosols 84,1 % | 1,1 % |
| 216 | Mulga de Australia Occidental | Cambisols 44,5 % | 0,0 % |

Dos que vale la pena mirar aparte:

- **221, las turberas de Borneo.** Histosols 84,1 % y Nitisols 14,4 %. Con el
  grupo B —turba incluida— la fracción es 85,2 % y el delta sale −25, que es
  exactamente el que la ficha `pantanos_turba_borneo` ya tenía puesto. Es el
  segundo número del relevamiento viejo que una medición propia reproduce, y el
  otro fue el de Malaca.
- **216, la mulga.** Cambisols 44,5 %, Leptosols 27,7 %, Arenosols 14,5 % y cero
  lixiviados. Coincide con lo que la ficha cita del primario, «mainly shallow,
  sandy and infertile», y con el *hardpan* a menos de 50 cm que describe la
  Australian Soil Classification para el grupo dominante del paisaje. La ficha
  no lo necesitaba: ya tenía la descripción por unidad de suelo, que es más
  fina que una clase WRB.

**El que falta es el 42, el miombo seco de Zambeze, y falta por una razón
escrita.** Su bbox pide 118 Mpx por capa, que entrando en el tope de 6 Mpx
necesitaría reducir 4,4x, y arriba de 2x el WCS promedia códigos de leyenda. El
script corta y lo dice. Para medirlo hay que hacer mosaico por tiles a
resolución nativa: unos veinte tiles de `MostProbable`, y la deducción del
mapeo en ventanas chicas aparte, porque el mapeo es global y no hace falta
bajar las 30 capas sobre los 118 Mpx. Eso es trabajo, no un parámetro.

Lo que no entra en una tarde es HWSD.
