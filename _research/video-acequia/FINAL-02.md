# La versión final del segundo video

`salida/acequia-02-final.mp4` · 1920×1080 · **73,2 s** · 117 MB

Sale de las dos variantes del animático y de las cinco correcciones que pediste
el 24/11/2026 después de mirarlas. Esto cuenta qué hizo cada una, qué encontré
mirando los animáticos y qué queda abierto.

    py -3.12 _research/video-acequia/tiempos-02f.py
    bash    _research/video-acequia/final.sh

---

## 1 · Las cinco cosas que pediste

**El acto 1 es mitad A y mitad B.** Los primeros trece segundos son los de la
variante A: la obra construida, de la excavación a la cisterna terminada,
mientras contás de dónde venís. Después la foto del terreno crudo sobre «se me
iba más tiempo juntando datos que diseñando». Y de ahí sigue la variante B: la
letanía de capas, una por nombre, cada una con su pie de fuente.

Son trece y no diecinueve segundos porque sacar la frase nueva de la obra
—cosa que también pediste— se lleva tres segundos y medio, y bajar las pausas
a medio segundo se lleva el resto. El corte cae en el mismo lugar del relato,
no en el mismo segundo del reloj.

**Las tres tomas del 22/11 no están.** Quedó sola la grabación de octubre, las
veinte frases.

**La voz va a la velocidad a la que la grabaste.** Era 1,1×; ahora es 1,0.
Hablar se lleva 60,7 s en vez de 55,2.

**No hay carteles ni huecos.** «Las ocho ventanas» y «La observación» eran
catorce segundos de texto sobre negro, uno de cada seis del video. Y las dos
pausas que estaban abiertas a propósito para que respirara la imagen —2,80 s
después de «dónde va el agua» y 3,00 s después de «cuándo no confiar»— quedaron
en medio segundo como el resto.

**Las transiciones son disolveres de 0,2 s y ninguna pausa pasa de 0,5 s.** Los
veintidós cortes del video pasaron de secos a cruzados: un plano se funde en el
siguiente en seis cuadros.

De 88 s a 73,2 s. La voz ocupa el 83 % del video; en el animático era el 69 %.

---

## 2 · Lo que encontré mirando los animáticos

**El plano del relieve no mostraba el relieve.** Es la falla más cara de las
tres, porque rompía lo único que la letanía de capas tiene que hacer. En el
corte `04-relieve`, el shader de elevaciones tarda 2,1 s en encenderse, y el
plano entraba en el segundo 0,9 y duraba 1,67: un segundo y pico de polígono
vacío, y el relieve apareciendo justo cuando el plano se iba. Ahora entra en el
1,9 y el relieve **se enciende en pantalla**, que es mejor todavía que
encontrarlo ya puesto. Revisé los otros cuatro cortes de capa —clima, suelo,
cobertura, ecorregión— y ninguno tiene el problema: muestran su capa desde el
primer cuadro.

**Los subtítulos no se despegaban del fondo blanco.** El texto es blanco cálido
y las capturas de la app son blancas; con un contorno de 2 px, frases como «Con
toda esa información ya puedo» quedaban ilegibles. Subí el contorno a 3,5 px y
agregué una sombra de 1,5. Se verificó sobre la pieza del informe, que es el
fondo más claro del video.

**El cartel de «La observación» era redundante.** Decía a mano lo que la app
muestra de verdad en `20-salud-del-calculo`: «Confianza media · 1 observación ·
Cuenca de 282 ha: fuera del rango de Kirpich». Sacarlo no perdió el argumento:
lo mejoró, porque ahora se ve el dato en la pantalla y no un cartel que lo
describe.

---

## 3 · Lo que saqué, y por qué

Cuatro planos que estaban en el animático no entraron. No es recorte por
tiempo: cada uno tiene su razón.

| plano | por qué no está |
|---|---|
| `03-perimetro` a tiempo real | era el segundo 16 de la variante B. Con las pausas en medio segundo ya no hay lugar entre la foto del crudo y la letanía: meterlo deja cada capa en 1,7 s y la letanía deja de leerse, que es justo la falla que tenía B |
| `12-swales` | cinco segundos de la app donde no se mueve nada, con el mismo encuadre de curvas que ya contó `22b-capas-shader`. «Dónde va el agua» se lo quedó `lectura-agua`, que es el relieve con los cauces dibujados y dice exactamente eso de un vistazo |
| `18-anexo-fuentes` | vivía de la frase «cada número dice de dónde salió». Sin esa frase quedaba en 1,3 s, que no alcanza para leer una lista de fuentes |
| `sol-y-viento` | vivía de «y funciona en cualquier parte del mundo». Sin esa frase, las trayectorias del sol sobre «un proyecto entero en una fracción del tiempo» no las explica nadie |

Lo que ganaron los últimos siete segundos con esas dos últimas bajas es **el
giro largo y continuo** que habías pedido para la portada: siete segundos a
velocidad real, de las curvas al shader de elevaciones, y resuelve en el cierre
de marca. A dos segundos la vuelta no se distinguía nada; a siete, sí.

---

## 4 · Lo que no me gusta y no puedo arreglar con montaje

**Del segundo 43 al 53 hay seis planos de la app casi idénticos**: represa,
servicios, camino, cortina, potreros. Todos tienen el mismo encuadre —panel
izquierdo, mapa con curvas, panel derecho— y cambian sólo en los detalles. El
corte entre ellos no se lee, y el disolver, que es más suave, lo disimula
todavía más. Estaba igual en las dos variantes del animático.

Esto no se arregla cortando distinto: hace falta material con otro encuadre
—un zoom, un plano del panel solo, un recorte—. Si querés, se graba.

---

## 5 · Cómo está hecho

Lo mismo que el animático, con dos diferencias.

**El pegado dejó de ser gratis.** Antes era `concat -c copy`: cada segmento
nacía en keyframe y no se recomprimía nada. Un disolver necesita los dos planos
a la vez en el mismo filtro, así que ahora el pegado es un render completo. Y
ya que hay que recomprimir, **los subtítulos se queman en la misma pasada**:
`xfade` y `subtitles` en un solo `filter_complex`. En dos pasos habría una
recompresión entera de más.

**Cada segmento se escribe con siete cuadros de más.** Esos cuadros no se ven
como plano: se los come el disolver con el que entra el siguiente. Por eso
todos los constructores terminan en `tpad=stop_mode=clone`: si a la fuente no
le quedaban esos cuadros, el último se clona, y clonar un cuadro abajo de un
disolver no se nota. Sin el tpad el segmento sale corto y todo el video de ahí
en adelante se corre, que es la clase de error que no se ve hasta que la voz no
cierra con la imagen.

El disolver arranca donde el corte caía antes, así que el momento percibido se
atrasa 0,1 s y no hubo que recalcular nada de la línea de tiempo.

**Tres cosas que aprendí armándolo:**

- `ffprobe -show_entries stream=nb_frames -of csv=p=0` deja la coma del
  separador aunque se pida un solo campo. La salida es `117,` y eso adentro de
  un `$(( ))` no es un cero: es un error de sintaxis.
- `-v error` **esconde el informe de `volumedetect`**, que es de nivel info. Un
  script que mide niveles con `-v error` no mide nada y no avisa.
- `loudnorm` en una pasada comprime y levanta tanto los tramos bajos que
  `silencedetect` no encuentra un solo silencio ni a −32 dB. Para verificar que
  cada frase cae donde la línea de tiempo dice hay que medir el nivel medio en
  una ventana antes y otra después de cada marca, y mirar el salto.

**Los archivos:** `tiempos-02f.py` no duplica la máquina, la reusa: importa
`tiempos-02.py` y le cambia las unidades, la velocidad, el arranque y la lista
de planos antes de llamar a sus funciones. Y los constructores de segmento
salieron a `piezas.sh`, que ahora comparten `animatico.sh` y `final.sh`: dos
copias de un `seg_h` es la forma segura de que un día los dos videos dejen de
verse igual.

---

## 6 · Lo que se verificó

| qué | resultado |
|---|---|
| duración y cuadros | 73,23 s · 2196 cuadros · 1920×1080 · 30 fps |
| códecs | H.264 High, yuv420p, bt709, rango limitado · AAC 48 kHz 192 k |
| carga en un navegador de verdad | `video.error` = ninguno · reproduce 6 s de corrido · busca a 17,5 / 42 / 60 / 72,9 s y llega |
| niveles | −15,6 LUFS · −1,4 dBTP · LRA 3,9 — idénticos al video 01 entregado |
| sincronía de la voz | las 20 frases entran en su marca: −91 dB en los 0,26 s de antes, −10 a −22 dB en los 0,26 s de después |
| el relieve corregido | el shader está encendido desde el primer cuadro del plano |
| el final | resuelve en `acequia.app` completo sobre crema, no en negro |

---

## 7 · Lo que sigue, si te sirve

1. **Las ocho piezas de Remotion están a 1280×720 y acá se agrandan ×1,5.** Las
   curvas de nivel y los textos chicos salen más blandos de lo que van a salir.
   La entrega se rinde de nuevo con `--scale=1.5`, que no agranda píxeles: los
   dibuja. Son ocho renders.
2. **La cama sigue sintetizada**: cuatro acordes y ruido rosa. Se reemplaza
   dejando un `musica.mp3` en `videoapp-1/audio en off/`.
3. **Los dos verticales** (15 s y 30 s) todavía son los del primer video.
4. El tramo del segundo 43 al 53, si se graba material con otro encuadre.
