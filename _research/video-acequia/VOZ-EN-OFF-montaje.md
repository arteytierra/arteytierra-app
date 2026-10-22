# La voz grabada, pegada al montaje

Segunda vuelta. Qué estaba mal, qué se midió, qué cambió y qué queda.

El guión definitivo —el que Jonatan grabó— es
`C:\Arte y Tierra\Acequia\videoapp-1\audio en off\guion voz en off.docx`. La
grabación, `voz en off app.acequia video-1.mpeg`.

Los tres archivos que hacen el trabajo:

| | |
|---|---|
| [`tiempos.py`](tiempos.py) | **la línea de tiempo**: de acá salen los cuadros de cada plano, el segundo de cada frase y el milisegundo de cada palabra |
| [`montaje.sh`](montaje.sh) | la imagen y los subtítulos quemados |
| [`voz.sh`](voz.sh) | la voz ubicada, la cama de fondo y la mezcla |

```bash
py -3.12 _research/video-acequia/tiempos.py
bash _research/video-acequia/montaje.sh
bash _research/video-acequia/voz.sh
```

Sale `acequia-completo.mp4` en `$V/salida`, más los dos verticales, los tres
con voz, cama y subtítulos.

---

## Lo que estaba mal recortado, medido

No era impresión: eran **cuatro cortes hechos en el medio del habla**. El
método de la primera vuelta cortaba donde decía la tabla de planos, no donde
Jonatan respiraba. Corriendo `silencedetect=noise=-35dB:d=0.15` sobre la
grabación aparecen los silencios de verdad, y cuatro de los veintitrés cortes
no caían en ninguno:

| Corte | Lo que partió al medio |
|---|---|
| 24,60 s | «La topografía la sacaba de un programa, **‖** el clima, de dos o tres plataformas» — es un solo grupo respiratorio y las dos mitades se mandaron a 2,8 s de distancia |
| 50,05 s | «ya puedo diseñar **‖** dónde va el agua» — ídem |
| 53,70 s | cortaba «…y cuánto junta» antes de que terminara |
| 67,60 s | «un informe completo del proyecto **‖** y hasta me avisa cuándo no confiar» — las dos mitades quedaron a diez segundos |

Ahora la regla es una sola y está escrita en `tiempos.py`: **sólo es límite un
silencio de 0,35 s o más.** Las pausas más cortas —0,16 s después de
«hidrología», 0,24 s después de «bioarquitectura»— son comas y quedan adentro
de la frase. Con ese criterio la grabación da **veinte unidades** en vez de
veintitrés, y ninguna se parte.

Además cada corte se lleva 80 ms del silencio de antes y 100 ms del de después.
Eso hace dos cosas: que no se coma el principio de una palabra, y que el
fundido de 40 ms caiga sobre sala y no sobre un fonema.

**Comprobado sobre el resultado**, no sobre la intención: `silencedetect` sobre
la pista armada encuentra las veinte entradas de voz y la peor está **a 40 ms**
del segundo donde tenía que entrar.

---

## Velocidad 1,1

Como pediste. A 1,1× el habla neta son 55,2 s; a 1,2× eran 50,6. Se nota: a
1,2 la presentación ya empujaba.

La velocidad se cambia con `atempo`, que acelera sin tocar el tono. Con
`asetrate` la voz subiría de tono y sonarías a dibujito.

---

## El video pasó de 90 a 72 segundos

Esto es lo que arregla «que no quede tanto silencio», y no se arregla con la
música: se arregla con la tijera. Antes había 56 s de habla contra 94 de
video. Ahora hay **55,2 s de habla contra 72 de video: el 77 % del video tiene
alguien hablando.** El resto son las pausas que hiciste al grabar, más tres
respiros puestos a propósito.

Se dio vuelta el método. Antes la tabla de planos era fija y la voz se
acomodaba adentro; ahora **manda la voz**: las veinte frases se ponen una atrás
de otra con tus propias pausas, y cada plano dura lo que dura la frase que lo
acompaña. Dos consecuencias buenas que no estaban buscadas:

- **Los cortes de imagen caen en las pausas de la voz.** Se corta en la
  respiración, que es donde se corta.
- **Cuando una frase nombra dos cosas, la imagen corta en el medio de la
  frase.** «La topografía…» sobre el relieve y «…el clima» sobre el clima, con
  la voz corrida. Eso antes no se podía hacer porque la frase estaba partida.

La letanía de capas quedó en planos de 1,5 a 2,2 s —antes eran 2,8— y está
bien así: la frase tampoco respira hasta el final.

---

## Afuera la placa de la curva número

Te hago caso y estoy de acuerdo. **«Curva número 73» es jerga**: el que sabe
qué es el método SCS lo lee y el resto ve un número sin escala. Y era el único
momento en que el video dejaba de ser la app y se volvía una placa, que es
justo lo que hay que evitar cuando lo que se vende es una herramienta de
verdad. Se fue la placa (12 s) y con ella el panel de los 179.787 m³ (3 s).

En su lugar quedan dos planos de la app trabajando, que cubren las dos frases
que iban ahí:

| Frase | Ahora va sobre |
|---|---|
| «Por eso hice acequia, que recopila los datos y los cruza» | la cuenca resolviéndose sola, 5,2 s |
| «Lluvia, suelo, pendiente, elevación, cobertura, contexto y muchísimo más, en un solo lugar» | **el panel de capas**, con alguien prendiendo y apagando el hipsométrico y la pendiente, 6,2 s |

El panel de capas es un corte nuevo —`22b-capas-shader`, del clip 06 entre 54,8
y 61,8 s— y es mejor imagen que la placa para esa frase: es una lista de capas
con la fuente citada abajo («Copernicus GLO-30, paso ≈ 30 m»), y se ve a alguien
encendiéndolas. Dice lo mismo que decía la placa, pero mostrándolo.

**En los verticales la placa se queda**, porque dijiste que te gustan como
están. Si querés, sale de los tres con una línea.

---

## La frase de las redes de servicios se salvó

«Por dónde pasan las redes de servicios» estaba grabada y no tenía imagen. No
hizo falta que grabes nada: **el panel estaba filmado en el metraje crudo** —el
clip 09 lo tiene entre 45 y 67 s— y nunca se había cortado. Se cortó ahora,
`11b-servicios`, dos segundos, y la frase entra entre la represa y el camino.

De las veinte unidades grabadas **entran las veinte**. No sobra ninguna.

---

## Los titulares salieron del horizontal

Esto no lo pediste y es el cambio que más se ve, así que la razón: los
titulares (`t04-agua`, «Dónde va el agua», y los otros ocho) se escribieron
para un video mudo, cuando el texto era la única narración. Ahora **tu voz dice
exactamente eso**, y encima caen abajo a la derecha, que es justo donde van los
subtítulos nuevos. Eran dos capas de texto diciendo lo mismo, pisadas.

Quedan los pies `pie-*.mov` —«RELIEVE | Copernicus GLO-30 · © DLR e.V.»— que
citan la fuente de cada capa y viven adentro de la banda, abajo del subtítulo.
Esos no narran: documentan, y son el argumento más fuerte que tiene acequia.

En los verticales los titulares se quedan: ahí el subtítulo va adentro de la
banda y no se tocan.

---

## Los subtítulos con la palabra encendida

Van quemados en los tres videos. La palabra que está sonando queda en blanco
cálido lleno y el resto de la frase, al 61 %.

Un detalle técnico que vale la pena saber: **el karaoke nativo de ASS no sirve
para esto.** La etiqueta `\k` va *pintando* la frase y deja encendido todo lo
ya dicho, que es el efecto de karaoke de bar, no «se resalta la palabra que
digo». Así que se genera **un evento por palabra** —204 en el horizontal— con
la frase entera y sólo esa palabra encendida. Los tiempos salen de la
transcripción palabra por palabra de tu propia voz, corridos a 1,1× y a su
lugar en el video.

La transcripción ya está corregida: **«entrega»** como dijiste, «acequia» en
vez de «a Sequia», «Jonatan» en vez de «Jonathan», «quince» en vez de «15»,
«rompevientos» de una palabra. Está en [`palabras.json`](palabras.json), que es
dato, no código: si algo quedó mal escrito se arregla ahí y se vuelve a correr.

---

## La cama de fondo

Hay. Es lo que pediste para que no quede el vacío, y hace exactamente eso: en
los huecos largos se escucha y cuando entrás a hablar se baja sola
(`sidechaincompress`, que es el ducking de radio). Medido: en el hueco de los
swales la cama está a −26 dB y la voz a −14,5; mientras hablás la cama se va a
−43.

**Pero es sintetizada, no es un tema.** Son cuatro acordes largos en la menor,
cada uno de veinte segundos, encadenados con cinco de cruce, con cada nota
duplicada y desafinada 0,35 Hz para que suene a instrumento y no a tono de
prueba, y una capa de ruido rosa filtrado haciendo de aire. Todo abajo de
1,5 kHz para que no se pelee con tu voz.

Lo hice así por dos razones: no bajo música de ningún lado sin licencia, y el
video no podía esperar a esa decisión. **Si conseguís un tema, se cambia sin
tocar nada**: lo dejás en

    C:\Arte y Tierra\Acequia\videoapp-1\audio en off\musica.mp3

y `voz.sh` lo usa en lugar de la cama sintetizada, lo recorta al largo, le pone
las entradas y salidas y lo ducka igual. No hay que editar el script.

---

## Lo que queda

- **Un tema de verdad.** Ver arriba: es cambiar un archivo de lugar.
- **La intro nueva** que dijiste que te gustaría. Eso es filmar, no editar: con
  tres o cuatro segundos de manos sobre el teclado o del cuaderno con un croquis
  alcanza, y entra antes del descenso sin tocar nada de lo demás.
- **La placa del cruce en los verticales**, si querés que salga también de ahí.
- `17b-resumen` quedó afuera del horizontal: entre la tapa del informe y la
  salud del cálculo hay dos segundos de voz y no entran tres planos. Si te
  importa el resumen ejecutivo más que la tapa, se cambia uno por otro.
