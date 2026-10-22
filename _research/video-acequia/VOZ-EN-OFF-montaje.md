# La voz grabada, pegada al montaje

Qué se midió de la grabación, cómo entra en el video, qué cambió del montaje
para que entre, y las dos cosas que faltan.

El guión definitivo —el que Jonatan grabó— es
`C:\Arte y Tierra\Acequia\videoapp-1\audio en off\guion voz en off.docx`.
La grabación, `voz en off app.acequia video-1.mpeg`. El armado está en
[`voz.sh`](voz.sh) y los planos nuevos, en [`montaje.sh`](montaje.sh).

---

## La grabación, medida

| | |
|---|---|
| Archivo | MP3 128 kbps, mono, 44,1 kHz |
| Largo | 83,25 s |
| Silencio de sala al principio | **6,03 s** |
| Habla | de 6,03 a 80,65 s → **74,6 s** |
| A 1,2× | **62,2 s** de habla con sus pausas, **56,2 s** de habla neta |
| Nivel de voz | −26,5 dB medio, pico −5,2 dB |
| Piso de ruido | **−82,5 dB** medio, pico −51,9 |

Dos cosas que importan de esa tabla:

**No hace falta reducción de ruido.** Cincuenta y seis decibeles entre la voz y
el piso de sala es una grabación limpia de verdad. Los seis segundos de sala que
dejaste al principio servirían para limpiarla, y justamente por eso se puede
comprobar que no hay nada que limpiar. Me alegra, porque la reducción de ruido
es lo que deja esas voces con sonido de pileta: acá no se toca nada.

**Y no hay saturación.** Pico en −5,2 dB, que es exactamente donde conviene.

---

## El problema de pegarla de corrido, y cómo se resolvió

A 1,2× el habla son 56,2 s y el video dura 90. Pegada de corrido, la voz se le
adelantaría al video desde el primer plano: para el minuto estaría hablando del
cierre sobre el informe.

Entonces se corta en **veintitrés frases** y cada una se ubica en el segundo
donde entra su plano. Eso es lo que en una locución se hace con las pausas,
hecho con números en vez de a oído. Los cortes caen en el medio de los silencios
que midió `silencedetect`, así que ninguna frase queda partida y cada una lleva
su propio fundido de 40 ms para que el corte no haga clic.

**La velocidad se cambia con `atempo`, no con `asetrate`.** `atempo` acelera sin
tocar el tono; `asetrate` te subiría la voz y sonarías a dibujito.

### La tabla completa

«Desde» es el segundo de la grabación cruda; «va a» es el segundo del video.

| | Frase | Desde | Dur. 1,2× | Va a | Sobre qué plano |
|---|---|---|---|---|---|
| 1 | «Desde hace quince años me dedico al diseño de proyectos ecosistémicos y regenerativos.» | 5,90 | 3,85 | **0,40** | El descenso |
| 2 | «Empecé por la bioarquitectura, después me interesé en entender al agua y el suelo, y así terminé especializándome en hidrología, agroecología y permacultura.» | 10,52 | 6,82 | **4,75** | El descenso y su cola |
| 3 | «Para iniciar un diseño se me iba más tiempo juntando datos que diseñando.» | 18,95 | 3,21 | **12,10** | El perímetro clic por clic |
| 4 | «La topografía la sacaba de un programa,» | 22,88 | 1,43 | **15,90** | Relieve |
| 5 | «el clima, de dos o tres plataformas,» | 24,60 | 1,92 | **18,70** | Clima |
| 6 | «el suelo, de donde encontrara,» | 26,90 | 1,42 | **21,50** | Suelo |
| 7 | «la cobertura, a ojo en el satélite,» | 28,70 | 1,83 | **24,30** | Cobertura |
| 8 | «el ecosistema y el contexto, googleando.» | 30,95 | 1,96 | **27,10** | Ecorregión |
| 9 | «Y así sin parar.» | 33,50 | 0,79 | **30,00** | La cuenca resolviéndose |
| 10 | «Por eso hice acequia, que recopila los datos y los cruza.» | 35,60 | 3,21 | **35,50** | La placa del cruce, +1,4 |
| 11 | «Lluvia, suelo, pendiente, elevación, cobertura, contexto y muchísimo más, en un solo lugar.» | 39,80 | 5,13 | **39,10** | La placa del cruce, +5,0 |
| 12 | «Con toda esa información ya puedo diseñar:» | 47,40 | 2,21 | **46,30** | El panel con el número |
| 13 | «dónde va el agua,» | 50,05 | 1,14 | **49,30** | Keyline |
| — | *«por dónde pasan las redes de servicios,»* | 51,70 | 1,42 | **—** | **no hay plano** |
| 14 | «dónde conviene la represa y cuánto junta,» | 51,70 | 1,67 | **55,80** | Represa |
| 15 | «por dónde voy a poner los caminos,» | 56,35 | 1,33 | **59,30** | Camino con perfil |
| 16 | «dónde va la cortina rompevientos,» | 58,10 | 1,54 | **62,30** | Cortina |
| 17 | «dónde entra el animal,» | 60,05 | 0,96 | **65,30** | Potreros |
| 18 | «entre otras utilidades que me simplifican la toma de decisiones.» | 61,45 | 2,62 | **66,50** | Potreros |
| 19 | «Además me entrega un informe completo del proyecto» | 65,00 | 2,17 | **69,50** | La tapa del informe |
| 20 | «y hasta me avisa cuándo no confiar en la información.» | 67,60 | 2,25 | **79,60** | La salud del cálculo |
| 21 | «Un proyecto entero en una fracción del tiempo que me llevaba antes.» | 71,10 | 3,17 | **84,00** | Los sectores, el diseño junto |
| 22 | «Mi nombre es Jonatan y te invito a conocer acequia.app.» | 75,50 | 2,92 | **89,00** | El cierre de marca |
| 23 | «Empezar no cuesta nada.» | 79,20 | 1,33 | **92,10** | El cierre de marca |

El orden del video no es el orden de la grabación en un solo lugar: la frase 20
—«y hasta me avisa cuándo no confiar»— se graba pegada al informe y en el video
va nueve segundos después, sobre el plano de la salud del cálculo, que es el que
la ilustra. Es el único salto.

---

## El montaje creció de 90,0 a 93,8 s

La presentación son diez segundos de habla: los quince años, la bioarquitectura,
las especialidades y la frase del tiempo perdido. La apertura del video tenía
doce segundos **en total** y necesita quince con setenta.

No se resolvió apurando la voz, porque apurada deja de sonar a alguien
contándote algo, que es el punto. Se resolvió **frenando la apertura**:

| | Antes | Ahora | Por qué entra |
|---|---|---|---|
| El descenso | 201 cuadros a 2,985× | **250 a 2,35×** | El corte tiene 20 s; a 2,35× usa 19,6 |
| El perímetro | 93 cuadros a 5,484× | **137 a 3,65×** | El corte tiene 17 s; a 3,65× usa 16,7 |
| Potreros | 105 cuadros | **126** | Para que entre «entre otras utilidades…» |

Misma fuente, nada nuevo que filmar, y de paso **el perímetro mejora**: 5,48×
era muy rápido para ver qué estaba pasando; a 3,65× se entiende que son clics.

El total queda en **2814 cuadros, 93,80 s**. Las placas no se re-renderizan: son
MP4 de largo fijo y simplemente caen más tarde.

---

## Lo que falta, que es poco y concreto

### 1. Un plano para «por dónde pasan las redes de servicios»

Esa frase está grabada y **no tiene imagen**. Revisé los veintitrés cortes: no
hay ninguno del panel de contexto. Los dos que sobran —`16b-potreros-mapa` y
`22-shader-pendientes`— son otra cosa y ponerla sobre cualquiera de ellos sería
mostrar algo distinto de lo que la voz dice, que es exactamente lo que este
video no puede hacer.

acequia **sí tiene** ese panel: el de contexto, el que dice qué hay alrededor y
por dónde pasan los ductos y las líneas, a cuántos kilómetros y en qué rumbo.
Hace falta **una grabación de pantalla de unos cuatro segundos de ese panel**, y
la frase entra entre la represa y el camino sin tocar nada más.

Mientras no esté, la frase queda afuera. Está marcada así en `voz.sh`.

### 2. Dos frases cortas más, del mismo micrófono y la misma sesión

Quedaron dos huecos donde el video sigue y la voz no:

- **0:50 a 0:56 — 5,4 s.** El plano de las zanjas de infiltración y el arranque
  de la represa. La grabación va de «dónde va el agua» directo a «dónde conviene
  la represa», y en el medio hay un plano de swales sin nada que lo nombre.
  Entra: **«zanjas de infiltración sobre la curva,»** (unos 2 s).
- **1:11 a 1:19 — 7,9 s.** El resumen ejecutivo y el anexo de fuentes. Son dos
  planos que en el guión anterior tenían una línea cada uno y ahora quedaron
  dentro de «un informe completo». Entra: **«con el resumen adelante, y cada
  capa con su fuente y su fecha,»** (unos 3,5 s).

Esa segunda es la que más recomiendo grabar, y no por el hueco: **la fuente
citada en cada capa es el argumento más fuerte que tiene acequia** y ahora mismo
el video lo muestra sin decirlo. Son cuatro segundos de grabación.

Si no se graban, los dos huecos quedan y los tapa la música. Se nota más el de
1:11, porque son ocho segundos.

### 3. Un chequeo de una palabra

La transcripción automática escuchó **«Además me entrego un informe»**. Si eso
es lo que salió, es un pick-up de cuatro palabras. Si dijiste «me entrega», no
hay nada que hacer: puede ser el reconocedor.

---

## Dos cosas de la grabación que están mejor que el guión

**No decís el número.** El guión viejo tenía «ciento ochenta millones de litros»
y vos lo dejaste afuera: el número queda en pantalla, contándose solo, y nadie
lo lee en voz alta. Es la mejor manera de usarlo, y además hace desaparecer el
riesgo que veníamos cuidando —que pareciera que esos litros son del predio de 31
hectáreas y no de la cuenca de 282—, porque la voz nunca los atribuye.

**Y la lista del cruce es más larga que la placa, sin que eso sea un problema.**
Vos decís seis entradas y «muchísimo más»; la placa muestra cuatro: lluvia,
suelo, pendiente y cobertura. Son las cuatro que entran en la curva número,
y agregarle *elevación* y *contexto* a esa placa diría que entran en el cálculo,
que no es cierto. Así que no se toca: la frase está ubicada a +5,0 s, sobre el
contador, y no sobre las fichas entrando. La voz habla de todo lo que acequia
junta y la placa muestra lo que alimenta ese número. No se pisan.

---

## Lo que arrastra

- **Los subtítulos.** Los dos verticales llevan subtítulos quemados escritos en
  el registro de narrador, y ahora la voz es otra persona. Hay que reescribir
  `subtitulos-30s.ass` y `subtitulos-15s.ass` como transcripción de lo que
  efectivamente se grabó. El de 90 s para YouTube está reescrito y con los
  tiempos nuevos en `subtitulos-93s.srt`.
- **El titular de los 8,7 s** —«Todo lo que acequia ya sabe de él.»— sigue
  siendo el único texto del video escrito como folleto. Contra esta voz suena
  prestado. Ahora cae sobre «Empecé por la bioarquitectura…», así que lo que
  corresponde es algo del orden de **«Quince años de oficio.»** o sacarlo.
- **La música.** Es lo único que queda después de esto, y ahora importa más que
  antes: hay dos huecos de cinco y ocho segundos, y la voz pide una base que no
  la tape.
- **Los verticales** siguen mudos y con los tiempos viejos. La voz de 90 s no se
  recorta para ellos: son otro texto, más corto.

## Cómo se corre

```bash
bash _research/video-acequia/montaje.sh   # el video, 93,8 s, mudo
bash _research/video-acequia/voz.sh       # la voz ubicada + el video con voz
```

Sale `acequia-93s-voz.mp4` en `$V/salida`. La voz queda normalizada a −16 LUFS,
que es nivel de voz sola; cuando entre la música, la mezcla entera se vuelve a
normalizar a −14 y la música baja 6 a 9 dB cada vez que entra la voz. Eso se
hace en el montaje final, no acá.
