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

### 2. Recorta al polígono, no al bbox

El bbox de una ecorregión de cumbres volcánicas es casi todo territorio ajeno.
El recorte es ray casting sobre el GeoJSON, en Python puro, por **scanline**:
para cada fila de latitud del raster se calculan una sola vez los cruces de
todos los anillos, y de ahí salen por paridad los intervalos de longitud que
están adentro. Las columnas se despejan por aritmética; la fila no se recorre.

**Cuánto cambia, medido en Java occidental:**

| | Bbox | Recortado al polígono |
|---|---|---|
| Cambisols | 72,8 % | 78,5 % |
| Andosols | 9,9 % | **17,9 %** |
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
píxeles adentro y 92,4 % de Histosols, idéntico hasta el píxel, en 2,4 s.

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
| Píxeles dentro del polígono con dato | 487.508 | 292.316 |
| Peso en la ficha única | 63 % | 37 % |
| Cambisols | 78,5 % | 72,3 % |
| Andosols | **17,9 %** | **9,3 %** |
| Ferralsols | 3,5 % | 18,3 % |
| **Fracción lixiviada/ácida (grupo A)** | **3,5 %** | **18,4 %** |
| Delta de la regla de acequia | **0** | **−5** |

### Primero, la validación

Agregando los dos polígonos ponderados por píxel, la fracción lixiviada da
**9,1 %**. La ficha le atribuye a SoilGrids **10 %**. Coinciden a menos de un
punto, así que este método y el del relevamiento original miden lo mismo: lo
que faltaba no era corregir el agregado, era desagregarlo.

### Y después, el problema

La ficha declara el reparto de HWSD v2 por sector: *«el sector este y Bali
tiene 62 % de Andosols y 0 % de Acrisols, y el oeste 29 % y 28 %»*. Puesto al
lado de lo medido acá:

| | HWSD v2 (ficha) | SoilGrids (este relevamiento) |
|---|---|---|
| Lixiviado en el **oeste** | 28 % → delta −5 | 3,5 % → delta **0** |
| Lixiviado en el **este + Bali** | 0 % → delta 0 | 18,4 % → delta **−5** |
| Andosoles donde abundan | el este (62 % vs 29 %) | el oeste (17,9 % vs 9,3 %) |

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
| Histosols | **92,4 %** |
| Ferralsols | 7,4 % |
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

## Cómo se corre, y qué queda del backlog

```
python -I soilgrids-zonal.py 297 ./salida
```

Toma el ECO_ID y se encarga del resto: trae la geometría, baja las 31 capas,
recorta y reporta. Las descargas quedan en caché en la carpeta de salida, así
que una segunda corrida sobre el mismo polígono no vuelve a bajar nada. Corta
con error —y no con un número— si RESOLVE truncó la geometría o si alguna capa
no vino: un polígono incompleto daría un zonal plausible y equivocado.

De los diez polígonos que pedía el backlog quedan hechos **264** (acá) y, fuera
de esa lista, **288** y **229**, que son los dos de Java. Faltan 290, 297, 298,
323, 294, 315, 216, 42 y 221. La descarga es lo que tarda —de dos a doce minutos por
polígono según el tamaño del bbox— y el análisis, con las capas ya en caché, son
segundos: el 264 entero sale en 2,4 s.

Dos de los que faltan, **297** (`decan_norte_sal`) y **298**
(`decan_sur_elefantes`), son además dos de las tres fichas que `lib/sinCultivos.ts`
tiene marcadas como `sin_curar`, así que el zonal y la lista de cultivos
conviene mirarlos juntos.

Lo que no entra en una tarde es HWSD.
