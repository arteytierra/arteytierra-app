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

**(d) «La rampa de color.»** Afuera. El único color agregado es el de las
líneas.

**La atribución ya no va quemada** y **tampoco hay viñeta**: el crédito y el
velo del hero los pone la página. Dos velos sobre el mismo cuadro eran parte del
«tiene mucho filtro».

## Las tres entregas

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

**La deriva termina exactamente en la pose del último cuadro de la versión
anterior.** No es comodidad: es lo que hace que el póster ya publicado siga
sirviendo. Se comprobó apilando el cuadro nuevo contra `portada-ultimo.png` de
la primera entrega — mismo encuadre, mismo predio en el mismo lugar del cuadro.
Igual va un póster nuevo, porque el viejo tiene el crédito quemado.

### B · Las cuatro lecturas — 8 s

El mismo predio leído cuatro veces, sobre el mismo encuadre. **La cámara está
completamente fija.** Dos razones, y las dos importan: si derivara, quien se
detiene en la marca de «Agua» y en la de «Diseño» estaría comparando dos
encuadres distintos; y con el fondo quieto los cuadros intermedios pesan casi
nada, que es justo lo que hace falta cuando hay un fotograma clave cada cinco.

| marca | estado | qué se ve |
|---|---|---|
| 0,0 s | Relieve | la vista 3D con el sombreado del terreno |
| 2,0 s | Agua | las cadenas de acumulación y las confluencias |
| 4,0 s | **Aptitud** | los manchones de aptitud de uso, en los colores de la app |
| 6,0 s | Diseño | el keyline y el espejo de la retención, sobre las curvas |

Cada estado se sostiene quieto ±8 cuadros (0,53 s) alrededor de su marca.

> **El tercer estado se llama Aptitud y no Suelo.** La app lo calcula de
> pendiente, orientación, agua acumulada y altura relativa —puro relieve—; no
> toca un dato de suelo. Rotularlo «Suelo» en la página prometería un análisis
> edafológico que la pieza no trae. Y son **cinco clases, no tres**: en este
> predio dan 88,6 % forestal, 10 % pasturas y 1,3 % frutales, que es la lectura
> correcta de 417 ha al 30 % de pendiente. Conviene saber antes de rotular que
> ese estado va a leerse como un lavado de un solo color, porque eso es lo que
> dice el dato.

### C · Tres lazos del lienzo — 6 s cada uno

`perimetro` (el polígono se traza y se cierra), `giro` (el relieve va y vuelve
despacio bajo las curvas) y `agua` (el cauce principal se dibuja valle abajo).

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

| archivo | | duración | peso / tope | caudal | color |
|---|---|---|---|---|---|
| `portada.webm` | 1280×720 | 13,00 s | 1.708 / 2.560 KB | 1.076 kbps | yuv420p tv bt709 |
| `portada.mp4` | 1280×720 | 13,00 s | 1.514 / 2.560 KB | 954 kbps | yuv420p tv bt709 |
| `cuatro-lecturas.webm` | 1280×720 | 8,00 s | 1.364 / 3.072 KB | 1.397 kbps | yuv420p tv bt709 |
| `cuatro-lecturas.mp4` | 1280×720 | 8,00 s | 2.618 / 3.072 KB | 2.680 kbps | yuv420p tv bt709 |
| `lazo-perimetro.webm` | 1280×720 | 6,00 s | 451 / 900 KB | 616 kbps | yuv420p tv bt709 |
| `lazo-perimetro.mp4` | 1280×720 | 6,00 s | 370 / 900 KB | 505 kbps | yuv420p tv bt709 |
| `lazo-giro.webm` | 1280×720 | 6,00 s | 691 / 900 KB | 943 kbps | yuv420p tv bt709 |
| `lazo-giro.mp4` | 1280×720 | 6,00 s | 594 / 900 KB | 811 kbps | yuv420p tv bt709 |
| `lazo-agua.webm` | 1280×720 | 6,00 s | 395 / 900 KB | 539 kbps | yuv420p tv bt709 |
| `lazo-agua.mp4` | 1280×720 | 6,00 s | 322 / 900 KB | 439 kbps | yuv420p tv bt709 |
| `portada-poster.jpg` | | | 135 / 150 KB | | el **último** cuadro |
| `cuatro-lecturas-poster.jpg` | | | 143 / 150 KB | | el **primer** cuadro |

Ninguno tiene pista de audio. El fotograma clave de `cuatro-lecturas.mp4`: 48
claves, el hueco más largo son 5 cuadros. El cierre de los tres lazos, medido
sobre el maestro contra lo que vale un paso cualquiera de la misma pieza:

| lazo | la costura vale | un paso cualquiera vale |
|---|---|---|
| perímetro | 0,06 | 0,00 |
| giro | 9,15 | 9,08 |
| agua | 0,08 | 0,00 |

El del giro es el que lo demuestra: la unión del bucle se nota **exactamente lo
mismo** que cualquier otro cuadro de la pieza.

### Y en un navegador de verdad, que es lo que ffprobe no puede

Los diez archivos abiertos en Chromium, uno por uno: los diez cargan, los diez
tienen `video.error` nulo y los diez presentan un cuadro. Las cuatro marcas de
las lecturas se buscan exactas al milisegundo, entre 3 y 16 ms.

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
  archivos.

## Cómo se rehace

```bash
pnpm --filter @arteytierra/terreno datos-portada    # el dato, una vez
pnpm --filter @arteytierra/terreno datos-portada --refrescar   # ignorando la caché del relieve
pnpm --filter @arteytierra/placas  piezas           # las cinco piezas
pnpm --filter @arteytierra/placas  piezas --prueba  # los cortes en baja de A y B
pnpm --filter @arteytierra/placas  piezas --verificar   # medir sin renderizar
```
