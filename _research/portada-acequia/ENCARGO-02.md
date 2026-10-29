# Encargo 02 · La portada recortada y tres piezas nuevas

Continuación de [`PORTADA.md`](./PORTADA.md), que sigue siendo el contrato de
fondo: **la animación muestra lo que la aplicación hace de verdad, con datos de
un predio real, o no se publica.**

Todo sobre el mismo predio de la primera animación. **El nombre no se publica**
—lo cerró Jonatan el 25/10/2026—: una cosa es que el equipo sepa de qué predio
es y otra poner el proyecto de un cliente, y con él la ubicación de su tierra,
en una página pública. Eso lo autoriza el cliente. Hasta entonces el crédito de
la página dice «Predio real», y por eso el `alt` propuesto en `PORTADA.md`
cambió: nombraba el predio y la provincia.

## Segunda vuelta · 27/10/2026

Jonatan pidió cuatro cambios sobre la entrega del 26. Están hechos y son los
que mandan de acá en adelante; lo que sigue más abajo describe la primera
vuelta, y cada sección dice qué cambió.

1. **Las lecturas pasan a durar 2 s y dan una vuelta entera**, arrancando desde
   la pose y girando hacia la derecha, con las capas en este orden: shader de
   elevaciones, curvas de nivel, escorrentías, represas. Más una con todo
   encendido de una vez, para bucle.
2. **Todas las demás piezas miran el otro lado de la ladera**, el que tiene más
   cuencas y más paisaje.
3. **El lazo del agua se mira desde más lejos**, para ver dibujarse muchas
   cuencas en vez de un cauce.
4. **El agua y las represas llevan efecto.**

### El otro lado de la ladera no se eligió a ojo

165° es el espejo exacto de los −15° de la primera entrega. Que además sea el
mejor rumbo posible lo dice el relieve. Partiendo el predio por la mitad
perpendicular a la mirada, sobre los 536 nodos de cadena y los 28.157 nodos de
grilla que caen dentro del polígono:

| rumbo | cadena cerca / lejos | cota del fondo − cota del frente |
|---|---|---|
| −15 (antes) | 155 / 381 | **−52 m** |
| 165 (ahora) | **381 / 155** | **+52 m** |
| 180 | 373 / 163 | +59 m |
| 225 | 321 / 215 | +78 m |

Desde −15° se miraba ladera abajo: el agua corría alejándose de la cámara y el
fondo del cuadro era la planicie, 52 m más baja que el primer plano, así que no
había horizonte que mirar. Desde 165° el predio se ve de frente, dos tercios de
la red de escurrimiento quedan en la mitad cercana y el cordón de 300 a 442 m
queda de fondo. 180° y 225° levantan más el fondo pero pierden cadena cercana.

> **El póster publicado de la portada deja de servir.** La pose ya no es la de
> la primera animación. El `poster` de la página tiene que cambiar por el nuevo
> —`portada-poster.jpg`—, que sale de esta misma corrida.

### El shader de elevaciones vuelve, pero en vector

Es el mismo cálculo de la app: cada nodo de la grilla es el centro de una celda
—igual que en `shaderDesdeGrilla`— y el color sale de `colorElev` sobre la rampa
**Terreno**, la que usa la app por defecto, con el rango tomado de la cota más
baja y la más alta *de este predio*. Lo único que cambia es el soporte: la app
lo pinta en un `canvas` y acá son polígonos.

Eso es lo que permite que vuelva sin reabrir el defecto (a). La regla no era
«la rampa no va»: era **«nada que se pueda desfasar»**. Un `canvas` no se drapea
sobre el relieve y un polígono sí.

Dos números del armado: **128 clases** sobre 369 m de desnivel son 2,9 m por
clase —con 32 aparecen terrazas falsas en las laderas suaves—, y las celdas
contiguas de la misma clase se juntan en un rectángulo por fila, que baja de
28.157 polígonos a 21.202 y saca las costuras internas.

Si la rampa Terreno choca mucho con el verde de la ortofoto, la **Clásica**
—verde abajo, ocres al medio, marrón arriba— es una línea de cambio: las dos
están en `PALETAS_ELEV`.

### Los efectos

- **La corriente.** Una banda clara recorre cada cadena de su cabecera a su
  desembocadura, con un halo ancho y desenfocado por debajo que es lo que hace
  que el agua se lea *encendida* sobre el verde del monte. Que baje y no suba
  depende del sentido en que están encadenados los puntos: se comprobó sobre el
  dato, comparando la cota del primer nodo con la del último en las 37 cadenas
  —**37 bajan, 0 suben**—, y no sobre el supuesto de que el D8 las ordena así.
- **El pulso del cierre.** Al encenderse las represas sale un anillo del sitio
  de cada cierre y se apaga al crecer. Marca dónde está el cierre, que es el
  dato; el vaso lo dibuja el espejo de agua. Es un anillo sobre el terreno, no
  un control: la regla de no inventar interfaz sigue en pie.

Los dos efectos son **periódicos**: dos ciclos por vuelta en las lecturas, tres
en los seis segundos del lazo del agua. Si no lo fueran, el bucle saltaría ahí
aunque la cámara cerrara perfecto.

## Lo que se arregló, defecto por defecto

Los cuatro defectos de la primera animación tenían una sola causa de fondo, y
los tres primeros se van solos al quitarla.

**(a) «Dos rectángulos superpuestos con otro ángulo.»** Eran el relieve
coloreado y las capas vectoriales. MapLibre dibuja una fuente `canvas` como un
cuadrilátero de cuatro vértices y **no la subdivide para drapearla** sobre el
terreno; las capas vectoriales sí van drapeadas. Con la cámara inclinada dejan
de coincidir y la costura cruza la imagen en diagonal. En la primera entrega eso
se había tapado haciendo que el relieve coloreado viviera sólo con la cámara
cenital y se fuera antes de inclinar — por eso la pieza tenía dos mitades que no
se parecían.

Acá **no hay un solo ráster propio**. El color del cuadro es el de la ortofoto y
el volumen lo pone el sombreado que MapLibre calcula de las mismas teselas de
relieve que levantan el terreno, así que la foto y el volumen no se pueden
desfasar entre sí. No queda nada que se pueda correr de lugar.

**(b) «Flota en un cuadro negro.»** La vista a sangre es ahora el punto de
partida y no el destino. No hay salto en el segundo 8 porque no hay dos escalas.

**(c) «Está blando.»** Lo blando era el canvas de 300 × 277 nodos ampliado a
1280 px. Las teselas de la ortofoto se piden al zoom en el que se ven.

**(d) «La rampa de color.»** Afuera de la portada, donde el único color
agregado sigue siendo el de las líneas. En las lecturas vuelve desde la segunda
vuelta, pedida, y vuelve **en vector**: ver arriba.

**La atribución ya no va quemada** y **tampoco hay viñeta**: el crédito y el
velo del hero los pone la página. Dos velos sobre el mismo cuadro eran parte del
«tiene mucho filtro».

## Las entregas

### A · La portada recortada — 13 s

La cámara nace en la vista a sangre y no sale de ahí. Lo que se revela son las
capas encendiéndose:

| cuadros | segundos | qué pasa |
|---|---|---|
| 0 – 90 | 0,0 – 3,0 | el perímetro se dibuja, lado por lado |
| 84 – 204 | 2,8 – 6,8 | las curvas de nivel se dibujan, de las cotas bajas a las altas |
| 198 – 318 | 6,6 – 10,6 | el agua se enciende, de los filos a los cauces |
| 318 – 390 | 10,6 – 13,0 | deriva casi imperceptible, y se detiene |

Los actos se pisan a propósito: marcan qué aparece, no cortes de cámara.

La deriva termina exactamente en la vista a sangre. En la segunda vuelta esa
vista mira el otro lado de la ladera, así que **el póster publicado hay que
cambiarlo**: sale uno nuevo con el último cuadro.

El agua, además de encenderse de los filos a los cauces, ahora corre: la banda
clara recorre cada cadena desde que arranca el acto 03 hasta el final de la
pieza. En los dos segundos y medio del acto 04 es lo único que se mueve, además
de la deriva.

### B · Las lecturas — 2 s cada una, una vuelta entera

Reemplazan a la pieza de ocho segundos que se recorría con el scroll. Son seis
archivos, todos de dos segundos, **a 60 cuadros por segundo**, con la cámara
dando una vuelta completa hacia la derecha desde la pose:

| archivo | qué enciende |
|---|---|
| `lectura-relieve` | el shader de elevaciones |
| `lectura-curvas` | las curvas de nivel, sobre el shader |
| `lectura-agua` | las escorrentías, con la corriente bajando |
| `lectura-represas` | los cierres, con su espejo y el pulso |
| `lectura-todo` | las cuatro juntas — **la del bucle** |
| `lectura-secuencia` | las cuatro encendiéndose una tras otra: 0,0 · 0,5 · 1,0 · 1,5 s |

**El shader va de base en las cuatro, y por eso es el que prende primero.** Una
represa sola es un charco azul en medio del monte: lo que la explica es la
hondonada donde está, y eso lo dice la rampa. Es además como se ve en la app —la
capa de elevación queda puesta y arriba se prenden las otras—.

Tres decisiones con número:

- **60 fps y no 30.** Una vuelta entera en dos segundos son 180° por segundo: a
  30 fps eso da 6° por cuadro y, sin desenfoque de movimiento, el giro
  estroboscopia. A 60 son 3° y queda continuo. Cuesta el doble de cuadros de
  render y nada de peso.
- **«Hacia la derecha» es rumbo decreciente.** Un rasgo que está al norte se ve
  arriba con rumbo 0; con rumbo −10 se ve 10° a la derecha de arriba.
- **El encuadre se calcula con la sombra girada a 45°**, que es el peor caso de
  una vuelta entera; con los 15° de las piezas quietas, al predio se le van las
  puntas fuera del cuadro a mitad de giro. La diferencia entre los dos cálculos
  es de 0,18 niveles de zoom.

`lectura-secuencia` es la **única que no es un bucle** —acumula capas, así que
el último cuadro no se parece al primero— y por eso es la única que lleva
fotograma clave corto en el MP4: es la que la página puede recorrer con
`currentTime`. Las otras cinco se reproducen en bucle y cierran porque son
periódicas.

> **Quedó afuera el estado «Aptitud»**, que en la entrega anterior era la
> tercera lectura: el pedido nombra cuatro capas y ésa no está entre ellas. La
> advertencia sigue valiendo si alguna vez vuelve: **la app la calcula de
> pendiente, orientación, agua acumulada y altura relativa —puro relieve—**, no
> toca un dato de suelo, así que rotularla «Suelo» prometería un análisis
> edafológico que la pieza no trae. Son cinco clases, no tres, y en este predio
> dan 88,6 % forestal, 10 % pasturas y 1,3 % frutales.

### C · Tres lazos del lienzo — 6 s cada uno

`perimetro` (el polígono se traza y se cierra), `giro` (el relieve va y vuelve
despacio bajo las curvas) y `agua` (**las treinta y siete cadenas se dibujan a
la vez, desde más lejos**).

**El bucle es periódico, no tiene el primer y el último cuadro idénticos.** Eso
último, cumplido al pie de la letra, mete dos cuadros iguales seguidos y produce
una trabita de 1/30 s en cada vuelta. Lo que hace que un bucle no salte es que
el cuadro *siguiente* al último caiga sobre el primero, y eso se mide: el script
extrae las dos puntas y compara la luminancia media de su diferencia.

Dos decisiones del lazo del giro, por si hay que discutirlas:

- **Va y vuelve en vez de dar la vuelta entera.** Una órbita completa también
  cierra el bucle, pero 360° en seis segundos son 60° por segundo y el predio
  deja de leerse. El vaivén es una sinusoide: en los extremos la velocidad llega
  a cero y vuelve sin golpe. No es un rebote —un rebote se pasa de su destino y
  vuelve, y esto nunca se pasa.
- **El lazo del agua se acerca.** El tramo de cauce más largo que queda dentro
  del perímetro mide unos 590 m y el predio tiene 3,4 km de ancho: a la escala
  de la vista a sangre esa línea es una rayita. El acercamiento sale de una
  cuenta, no del ojo, y está topeado porque más cerca la ortofoto de Esri ya no
  tiene tesela propia.

## De dónde sale cada capa

Ninguna la decide este código. Todas salen de funciones que ya existían en el
repo, con el predio y el relieve como única entrada:

| capa | función |
|---|---|
| shader de elevaciones | `colorElev` sobre la rampa **Terreno** de `PALETAS_ELEV`, celda por celda, con el rango de este predio |
| relieve y sombreado | teselas Terrarium de AWS Open Data, las que proxea `/api/terrarium` |
| ortofoto | Esri World Imagery, las mismas teselas que drapea la vista 3D de la app |
| curvas de nivel | `calcularCurvas` sobre la grilla de Copernicus GLO-30 |
| agua | `calcularEscorrentias` (D8 + acumulación) |
| confluencias | el primer punto que dos cadenas de la app comparten |
| aptitud de uso | `calcularAptitud` + `agruparAptitud` |
| keyline | `analizarKeyline` |
| retención | `buscarSitiosRepresa`, con el espejo de agua de cada cierre |

**El relieve es Copernicus GLO-30**, paso ~30 m, leído por la ventana de píxeles
del COG e interpolado bilineal a una grilla de 300 × 277 nodos (~12,3 m de
paso). © DLR e.V. 2010-2014 y © Airbus Defence and Space GmbH 2014-2018,
provisto bajo COPERNICUS por la UE y la ESA.

## Dos ausencias que son decisiones

**No hay zanjas de infiltración.** Con 30,4 % de pendiente la tabla de
`criterios` pide 3 m de separación vertical, que sobre 369 m de desnivel son
**124 zanjas contra un tope de diseño de 60**: `diagnosticarSwales` devuelve
`demasiados_swales` y la herramienta se niega. Dibujarlas igual sería pasarle
por encima al criterio de la app para llenar un cuadro. La capa está escrita y
vacía: el día que el predio o el área cambien, el dato entra sin tocar la
composición.

**No hay puntos de emplazamiento.** El motor los ubica a partir de un *programa*
que declara el usuario —cuántas casas, qué galpón, cuánto ganado—. Declarar un
programa sobre el predio de un cliente sería inventarle intenciones. Lo que sí
hay son las dos capas de diseño que este relieve define solo: el keyline y el
cierre de la represa.

Si querés las zanjas, hay dos caminos honestos: trazarlas sobre **un área
dentro** del predio en vez de las 417 ha enteras, que es como se usan de verdad,
o que el cliente declare el programa y entre el emplazamiento con él.

## Un defecto de la app que apareció generando el dato

La primera corrida del generador devolvió **cero cadenas de escurrimiento** en
un predio con 369 m de desnivel. No era el video: era el relieve.

`grillaGlo30` tiene dos caminos. El bueno lee la ventana de píxeles del COG e
interpola bilineal; el de respaldo —al que cae con cualquier excepción, incluido
un timeout de S3— pide una cota por nodo y usa el píxel más cercano. Sobre el
mismo bbox, dos corridas seguidas:

| | ventana COG | por nodo |
|---|---|---|
| nodos iguales a su vecino del este | 0,0 % | 62 % |
| celdas sin dirección de flujo D8 | ~0 | 29.577 |
| acumulación máxima | 2.238 | **4** |
| cadenas de escurrimiento | 123 | **0** |

La versión mala **no se nota mirándola**: las cotas dan casi iguales, el
sombreado se ve bien y las curvas de nivel se dibujan. Lo que se rompe en
silencio es todo lo que depende del D8. Quedó arreglado en el commit `aa54dce`:
se reintenta la ventana antes de degradar, la grilla dice quién la interpoló,
`/api/dem` ya no cachea treinta días una lectura escalonada, y las cuatro
herramientas de agua avisan en nivel alerta cuando lo es.

## La entrega, medida

Todo sale de `node scripts/piezas.mjs`, que mide con `ffprobe` lo que acaba de
escribir y sale con código 1 si algo no entra.

Todos 1280×720, `yuv420p` rango limitado `bt709`, **sin pista de audio**.

| archivo | duración | peso / tope | caudal |
|---|---|---|---|
| `portada.webm` | 13,00 s | 1.654 / 2.560 KB | 1.042 kbps |
| `portada.mp4` | 13,00 s | 1.515 / 2.560 KB | 954 kbps |
| `lectura-relieve.webm` | 2,00 s | 489 / 1.126 KB | 2.002 kbps |
| `lectura-relieve.mp4` | 2,00 s | 468 / 1.126 KB | 1.918 kbps |
| `lectura-curvas.webm` | 2,00 s | 490 / 1.126 KB | 2.005 kbps |
| `lectura-curvas.mp4` | 2,00 s | 473 / 1.126 KB | 1.938 kbps |
| `lectura-agua.webm` | 2,00 s | 490 / 1.126 KB | 2.005 kbps |
| `lectura-agua.mp4` | 2,00 s | 468 / 1.126 KB | 1.919 kbps |
| `lectura-represas.webm` | 2,00 s | 488 / 1.126 KB | 1.999 kbps |
| `lectura-represas.mp4` | 2,00 s | 467 / 1.126 KB | 1.912 kbps |
| `lectura-todo.webm` | 2,00 s | 490 / 1.126 KB | 2.007 kbps |
| `lectura-todo.mp4` | 2,00 s | 472 / 1.126 KB | 1.935 kbps |
| `lectura-secuencia.webm` | 2,00 s | 484 / 1.126 KB | 1.982 kbps |
| `lectura-secuencia.mp4` | 2,00 s | 591 / 1.126 KB | 2.422 kbps |
| `lazo-perimetro.webm` | 6,00 s | 685 / 900 KB | 935 kbps |
| `lazo-perimetro.mp4` | 6,00 s | 353 / 900 KB | 482 kbps |
| `lazo-giro.webm` | 6,00 s | 693 / 900 KB | 946 kbps |
| `lazo-giro.mp4` | 6,00 s | 602 / 900 KB | 822 kbps |
| `lazo-agua.webm` | 6,00 s | 557 / 900 KB | 761 kbps |
| `lazo-agua.mp4` | 6,00 s | 397 / 900 KB | 542 kbps |
| `portada-poster.jpg` | | 144 / 150 KB | el **último** cuadro |
| `lectura-relieve-poster.jpg` | | 135 / 150 KB | el **primer** cuadro |
| `lectura-todo-poster.jpg` | | 146 / 150 KB | el **primer** cuadro |
| `lectura-secuencia-poster.jpg` | | 135 / 150 KB | el **primer** cuadro |

`lectura-secuencia.mp4`: **24 claves, el hueco más largo son 5 cuadros.** Su
WebM tiene una sola clave, a propósito y por lo mismo de siempre: ver más
abajo.

El cierre de los bucles, medido sobre el maestro contra lo que vale un paso
cualquiera de la misma pieza:

| bucle | la costura vale | un paso cualquiera vale |
|---|---|---|
| `lectura-relieve` | 15,76 | 17,25 |
| `lectura-curvas` | 17,87 | 19,47 |
| `lectura-agua` | 16,12 | 17,50 |
| `lectura-represas` | 15,85 | 17,46 |
| `lectura-todo` | 18,08 | 19,76 |
| `lazo-perimetro` | 0,04 | 0,00 |
| `lazo-giro` | 8,25 | 8,18 |
| `lazo-agua` | 0,13 | 0,05 |

En las cinco lecturas la costura vale **menos** que un paso normal, que es lo
que tiene que pasar: con 3° por cuadro no hay un solo píxel quieto, así que un
paso cualquiera mide 17 y la unión mide lo mismo o menos. El número grande no
es un defecto, es la velocidad del giro; lo que importa es la comparación.

### Y en un navegador de verdad, que es lo que ffprobe no puede

Los **veinte** archivos abiertos en Chromium, uno por uno: los veinte cargan,
los veinte tienen `video.error` nulo y los veinte presentan cuadro.

Las cuatro marcas de `lectura-secuencia` se buscan exactas, y de paso dejan
medida la razón de todo este asunto:

| marca | MP4 (clave cada 5) | WebM (una sola clave) |
|---|---|---|
| 0,0 s | 18 ms | 18 ms |
| 0,5 s | **4 ms** | 30 ms |
| 1,0 s | **5 ms** | 52 ms |
| 1,5 s | **4 ms** | 95 ms |

Las dos caen en el milisegundo exacto que se les pide; lo que cambia es lo que
tardan. **La página tiene que listar el MP4 primero.**

### El control también tenía dos verificaciones que mentían

Las dos daban falso NEGATIVO, que para el caso es tan inútil como un falso
positivo: lo primero que uno hace con un control que marca mal es dejar de
creerle.

1. **Muestreaba `currentTime` una sola vez**, 2,5 s después de arrancar, y
   preguntaba si se había movido respecto de una muestra tomada «ahora». Con
   piezas de dos segundos esa muestra cae después del final, donde el tiempo ya
   se quedó quieto en 2,0, y los cuatro MP4 de las lecturas daban «NO» teniendo
   `readyState` 4 y `video.error` nulo. Ahora pregunta cada décima y la
   pregunta es si se movió **alguna vez**.
2. **El primero de la lista daba «NO» por ser el primero**, con la página
   todavía montándose y el panel sin componer. Probado solo, llegaba a 2,99 s
   de 13. Ahora se reintenta una vez cuando el archivo cargó pero no avanzó:
   uno que de verdad no decodifica falla las dos veces.

La página de control (`_control.html`) queda en la carpeta de salida, junto a
los archivos. Necesita un servidor que atienda **peticiones por rango**: con
`python -m http.server` el navegador no puede buscar dentro del video,
`currentTime = 2` vuelve a 0 al instante y el control informa que la pieza no se
puede recorrer cuando el que no puede es el servidor.

## Tres cosas que costaron encontrar, por si hay que volver

**El cuadro 0 salía con el terreno plano.** Remotion renderiza en orden y en una
sola pestaña, así que el primer cuadro se captura con el mapa recién nacido.
`areTilesLoaded()` no sirve para detectarlo: contesta por lo que el mapa **ya
pidió**, y el terreno no pide sus teselas hasta que hay una pasada de dibujo con
la cámara puesta, así que en la primera consulta dice que sí teniendo pendiente
todo el relieve. Medido en el lazo del perímetro —misma cámara y mismas capas en
las dos puntas, tendrían que ser idénticas—: el cuadro 0 estaba a **18,9** de
diferencia media de luminancia del 179. Con el calentamiento de cuatro segundos
antes del primer cuadro, los cuadros 0, 1 y 2 salen idénticos. No era sólo de
los lazos: era un tirón al empezar en las cinco piezas.

**El fotograma clave corto es todo el peso del WebM.** Las cuatro lecturas con
una clave cada cinco cuadros pesaban 8.041 KB; las mismas sin claves cortas,
555 KB. Quince veces. No es rate control mal puesto, se probó de tres formas:
dos pasadas a 2.200 kbps → 8 MB, CBR forzado → 18 MB, calidad constante → 4,6 MB
a crf 46 y 3,5 MB bajando a 960 × 540. VP9 no puede codificar follaje a 720p con
una clave cada cinco cuadros dentro de 3 MB. x264 `veryslow` sí: 2.611 KB con
las mismas 48 claves. Por eso **el MP4 es el que la página recorre y el WebM
sólo reproduce**, que además es lo que este encargo ya decía. La página tiene
que listar el MP4 primero.

**Dos de las verificaciones medían mal, y eso es peor que no medir.** `ffprobe`
con `-of csv=p=0` emite el separador aunque se pida un solo campo, así que cada
línea llega como `1,` y comparar contra `'1'` daba cero claves: el archivo
pasaba la verificación por la razón opuesta a la buena. Es el mismo error que el
`1280x720x` de la primera entrega. Y el salto del bucle daba `NaN` porque
`metadata=print` escribe por el canal de errores. Además el criterio estaba mal
pensado: comparar las dos puntas contra un número fijo no distingue un salto de
un paso normal —en el lazo del giro un cuadro mueve la cámara y con ella todos
los píxeles—, así que ahora se compara contra lo que vale un paso cualquiera de
la misma pieza, y se mide sobre el maestro: a 500 kbps el cuadro 179 arrastra
~1,7 de deriva de cuantización contra el 1, uniforme y sin una forma adentro, y
medir eso convertiría el criterio en un medidor de bitrate.

## Lo que queda abierto

- **La licencia de la imagen de Esri.** El relieve es Copernicus y se cita sin
  problema. La ortofoto es de un tercero y usarla dentro de la app no es lo
  mismo que usarla en una pieza promocional. **Confirmar los términos antes de
  publicar.** La alternativa libre es Sentinel-2, del mismo origen que el
  relieve, y se descarta por resolución: 10 m/píxel sobre un predio de 3 km de
  ancho son 300 píxeles.
- **Dónde va cada pieza en la landing**, el `<video>`, el
  `prefers-reduced-motion`, el `poster` y el crédito de texto: eso lo hace una
  sesión de web, sobre el repositorio `acequia-landing`. Desde acá salen los
  archivos. Tres cosas para esa sesión: **el MP4 va listado primero**, **el
  póster publicado de la portada hay que cambiarlo** —la pose cambió de lado—,
  y de las seis lecturas la página elige: `lectura-todo` si va en bucle,
  `lectura-secuencia` si se recorre con el scroll, o las cuatro sueltas si cada
  sección muestra una.
- **Qué hacer con la pieza vieja de ocho segundos.** `cuatro-lecturas.*` sigue
  en la carpeta de salida y ya no se genera: su composición se borró. Si el
  scroll la quería así, se recupera del commit `554850c`.

## Cómo se rehace

```bash
pnpm --filter @arteytierra/terreno datos-portada    # el dato, una vez
pnpm --filter @arteytierra/terreno datos-portada --refrescar   # ignorando la caché del relieve
pnpm --filter @arteytierra/placas  piezas           # las diez piezas
pnpm --filter @arteytierra/placas  piezas lectura-todo  # una sola
pnpm --filter @arteytierra/placas  piezas --prueba  # cortes en baja de las que cambiaron
pnpm --filter @arteytierra/placas  piezas --verificar   # medir sin renderizar
pnpm --filter @arteytierra/placas  piezas --recodificar # rehacer los formatos desde el maestro
node packages/placas/scripts/vistazo.mjs LecturaTodo 0 30 60 90   # un cuadro suelto, para mirar
```

`vistazo.mjs` existe por una cuenta: la entrega son ~1.650 cuadros y cada uno
espera a que el mapa cargue, así que una corrida completa pasa la hora.
Equivocarse de encuadre y enterarse al final cuesta esa hora dos veces.

**Ojo con una trampa del cuadro suelto:** salta a su rumbo de una, así que con
la vuelta entera pide de golpe todo un campo de teselas nuevo y puede salir con
el fondo lejano sin cargar —un recorte oscuro de bordes rectos arriba—. En la
película no pasa, porque los cuadros van en orden y se mueven 3°. Se comprobó
renderizando esos mismos cuadros dentro de un corte de prueba: limpios. Aun
así, de ahí salió un arreglo que sí hacía falta en la película: un cuarto de
segundo de reposo entre las dos esperas de cada cuadro, porque
`areTilesLoaded()` contesta por lo que el mapa YA PIDIÓ y lo que la pasada de
dibujo acaba de descubrir que falta todavía no está pedido.
