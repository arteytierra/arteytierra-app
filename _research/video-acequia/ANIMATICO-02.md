# El animático del segundo video, en sus dos variantes

Esto es lo que propone `IDEA-VIDEO-02.md` §8, hecho, y con las tres frases que
Jonatan grabó el 22/11/2026 ya adentro.

    salida/animatico-02a.mp4   1920×1080 · 88,0 s · el acto 1 en CINE
    salida/animatico-02b.mp4   1920×1080 · 88,0 s · el acto 1 en CAPTURA

Las dos tienen la voz definitiva, los subtítulos karaoke quemados, las ocho
piezas de Remotion y los cortes de la app en su lugar. Lo único que falta son
las dos piezas que todavía no existen, y están puestas de **cartel negro del
largo exacto que les toca**, con el nombre adentro. Eso es lo que hace que esto
sea un animático y no un corte: se mira, se discute, y recién después se
renderiza.

Se arma con:

```bash
py -3.12 _research/video-acequia/tiempos-02.py && bash _research/video-acequia/animatico.sh
```

---

## 1 · Lo primero: el video pasó de 75 a 88 segundos

Las tres frases suman **11,5 s de habla** a 1,1×, más 2,2 s de pausas
alrededor. El documento de la idea calculaba 75 s **sin** esas frases, porque
cuando lo escribí todavía no estaban grabadas y §6 decía que eran «para la
versión larga, no para esta».

Ahora están, así que **esta es la versión larga**: 88,0 s, 76 % de ellos con
alguien hablando. Si querés el corte de 75 s, sale de acá sacando N2 —la frase
del hemisferio, que es la más larga— y con ella los siete segundos de
`sol-y-viento`: queda en 81 s. Sacando también N3 y el anexo, 78 s.

Mi opinión: **88 s está bien para la landing y para YouTube**, que es donde va
a vivir. Para el feed ya están los verticales, que se cortan de acá y no
cambian.

---

## 2 · Dónde entró cada frase nueva

| frase | dura | cae en | sobre qué imagen |
|---|---|---|---|
| **N1** «Esto lo construimos nosotros, con las mismas cuentas que hace la app.» | 2,79 s | 12,63 s | la obra de Tay Pichín, que ya venía desde el segundo 0,4 |
| **N3** «Cada número dice de dónde salió y de qué fecha es.» | 2,38 s | 66,50 s | `18-anexo-fuentes`, el anexo del informe en la app |
| **N2** «Y funciona en cualquier parte del mundo. Acá el sol de verano pasa por el norte, y la app lo sabe porque lo calcula, no porque se lo dijeron.» | 6,29 s | 69,48 s | el acto 01 de `sol-y-viento`: las tres trayectorias reales |

Las tres respetan la regla de siempre —nada se muestra mientras la voz dice
otra cosa— y ninguna se parte: la única pausa interna que tienen es la de
0,32 s después de «mundo», que está por debajo del umbral de 0,35 s y por lo
tanto es una coma, no un límite.

**El orden del final cambió** y quedó mejor de lo que estaba: el informe, la
advertencia, los tres segundos de silencio con «La observación», **el anexo de
fuentes con su frase**, **el sol pasando por el norte**, el giro y el cierre.
Es una escalera: *te lo entrego, te aviso cuándo no confiar, te digo de dónde
salió cada número, y además funciona en cualquier parte*.

### Lo que hubo que corregirles

Las tres tomas nuevas se grabaron **entre 5 y 7 LU más fuerte** que la de
octubre: −21,5, −21,1 y −19,5 LUFS contra −26,5. Eso no lo arregla la
normalización final, porque es una sola para toda la pista y lo que hace es
conservar las diferencias de adentro. Entran con −5,0, −5,4 y −7,0 dB, escritos
en `tiempos-02.py` al lado de cada archivo.

La sala **no** hubo que igualarla, aunque la de octubre está en −84 dB RMS y la
de las nuevas entre −61 y −75. De cada frase quedan al aire 180 ms de sala —los
márgenes del corte— y abajo corre la cama a unos −33 dBFS, que se la come. Se
midió antes de decidir no hacer nada.

Las palabras para el karaoke salieron de faster-whisper sobre el archivo
entero, no sobre el recorte: transcribir el recorte **perdía palabras** —se
comía el «app» de N1 y convertía «dijeron» en «dijera»—. Están en
`palabras-02.json` con tres correcciones a mano: el arranque de la primera
palabra de cada toma, que whisper hace empezar en 0 porque le mete el silencio
de adelante; el final de la última, que se pasaba del habla; y las comas.

---

## 3 · La bisagra se corrió al segundo 30,4

En la idea el corte más importante caía en 27,3. N1 lo empuja tres segundos:
ahora **«Por eso hice acequia» entra en 30,40** y ahí es donde el desorden se
ordena. Sigue siendo el único corte que tiene que pegar para que el video
funcione, y sigue estando exactamente igual de construido: lo que viene antes
es el antes, y lo que viene después es el predio limpio.

---

## 4 · En qué se diferencian A y B

**Sólo en el acto 1.** De la bisagra al final son el mismo video, plano por
plano, cuadro por cuadro.

| | A · cine | B · captura |
|---|---|---|
| los primeros 30 s | la obra construida (15,5 s), la ortofoto cruda (3,5 s), «Las ocho ventanas» (11,0 s) | el descenso, el perímetro a 2×, la obra reducida a 3,6 s, el perímetro a tiempo real y los cinco planos de capas con su pie de fuente |
| «Las ocho ventanas» | 11,0 s, la pieza entera | 3,0 s, sólo el amontonamiento |
| reparto | **46 s de cine · 23 s de app · 14 s de cartel** | **31 s de cine · 46 s de app · 6 s de cartel** |
| qué cuenta | de dónde viene el oficio, y por qué el antes era un desorden | qué hace la app, desde el primer segundo |

Dos cosas que descubrí armando la B y que no estaban en la idea:

- **El cartel de las ventanas tiene que ser de 3 s, no de 4.** Con cuatro, los
  cinco planos de capas quedan en 1,4 s cada uno y dejan de leerse: el cartel
  se come justo el tiempo que necesita la letanía. Con tres, los cinco
  respiran.
- **La obra, en la B, va por la cola.** Ahí sólo le tocan los 3,6 s de N1, y
  acelerar catorce segundos de fotos fechadas a 4× no es un plano, es un
  parpadeo. Van los últimos 3,6 s: la cisterna terminada, que es de lo que
  habla la frase.

---

## 5 · Las dos piezas que faltan, y la que ya no hace falta

| pieza | estado |
|---|---|
| A · «Las ocho ventanas» | **cartel**, 11,0 s en la A y 3,0 s en la B |
| B · «La observación» | **cartel**, 2,9 s, justo en el silencio que dejó la voz |
| C · «El arco que se da vuelta» | **no hace falta para este corte**: el acto 01 de `sol-y-viento` ya muestra las tres trayectorias reales y la de junio pasando por el norte, y con la frase de Jonatan arriba el argumento cierra. La versión de dos predios lado a lado sigue siendo mejor, pero ya no es lo que bloquea |
| D · «La ficha del lugar» | **pendiente**, y es lo que más falta: hoy el video salta entre dos predios reales sin decirlo |
| E · «El mismo cuadro, leído» | es para los verticales, no para este |

---

## 6 · Lo que no es definitivo y conviene no juzgar todavía

1. **Las piezas de Remotion suben de 1280×720 a 1920×1080.** Se renderizaron a
   720 para la web; acá se agrandan ×1,5 con lanczos, así que **las curvas de
   nivel y los textos chicos salen más blandos de lo que van a salir**. La
   entrega se rinde de nuevo con `--scale=1.5`, que no agranda píxeles: los
   dibuja, porque son composiciones y no metraje. No se hizo para el animático
   porque son ocho renders largos y lo que está a prueba es el corte.
2. **La cama sigue sintetizada.** Lo mismo que en el primero: se reemplaza
   dejando un `musica.mp3` en `videoapp-1/audio en off/`, sin tocar un script.
   Un tema con licencia sigue siendo lo que más cambiaría el resultado.
3. **Los verticales todavía no se rearmaron** con esta estructura. Los de hoy
   siguen siendo los del video 1.

---

## 7 · Cómo está hecho

Tres archivos nuevos y uno tocado.

| archivo | qué hace |
|---|---|
| `tiempos-02.py` | la línea de tiempo: las 23 unidades de voz con su archivo y su ganancia, los planos de las dos variantes, y de ahí salen los `seg_*`, las frases y los subtítulos |
| `animatico.sh` | arma la imagen, quema los subtítulos, ubica la voz frase por frase y mezcla |
| `cama.sh` | los cuatro acordes y el ruido rosa, sacados de `voz.sh` para que los dos videos suenen abajo exactamente igual |
| `voz.sh` | ahora carga `cama.sh` en vez de tener su propia copia |

Tres cosas que se aprendieron y conviene no volver a descubrir:

- **`seg_pieza` lleva un `tpad` que clona el último cuadro.** Un plano que pide
  la *cola* de una pieza calcula su segundo de arranque como `largo − duración`,
  y con dos decimales ese número se redondea para arriba y deja el pedido un
  cuadro más largo que la fuente. El segmento sale corto y **todo el video de
  ahí en adelante se corre 33 ms**. Se arregló por los dos lados: tres
  decimales en el generador y el `tpad` como red.
- **La cama no sale dos veces igual.** La parte tonal sí, pero `anoisesrc` no
  toma semilla y la capa de aire cambia en cada corrida. Dos camas de la misma
  duración difieren unos 37 dB por debajo de su propio nivel —inaudible— pero
  no dan el mismo hash. Así se verificó que sacar la función de `voz.sh` no
  cambió nada: lo que se comparó fue la señal diferencia, no el archivo.
- **`drawtext` toma la tipografía por fontconfig, que en esta máquina no tiene
  archivo de configuración.** Los carteles usan `fontfile` con el TTF copiado
  al lado, no `font=Inter`.
- **Un dos puntos adentro de un texto rompe el filtro, y las comillas simples
  no alcanzan.** `drawtext` separa sus opciones con `:`, así que
  «Cuenca de 282 ha: fuera del rango de Kirpich» corta la opción `text` ahí y
  lee el resto como el nombre de otra opción —`No option name near ' fuera
  del rango…'`—. Hay que escapar con barra invertida, y la barra va en una
  variable: escrita derecho se la come alguna de las capas de comillas por las
  que pasa la línea. La primera corrida murió justo ahí, en el cartel de la
  observación, que es el único texto del video con dos puntos.

---

## 8 · Lo que sigue, según qué contestes

- **Si pega el corte de la A**: se renderizan «Las ocho ventanas» y «La
  observación», se rinden las ocho piezas con `--scale=1.5`, se agrega la ficha
  del lugar y se rearman los dos verticales. Es el camino largo y es el que da
  el mejor video.
- **Si pega el de la B**: lo mismo, pero «Las ocho ventanas» es de 3 s y cuesta
  un tercio.
- **Si no pega la bisagra**: se ve ahí, en el segundo 30,4, y no después de
  renderizar tres piezas. Para eso se hizo esto.
