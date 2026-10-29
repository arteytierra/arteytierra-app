# Encargo 03 · La mesa de trabajo, el perfil y el par crudo/leído

Pedido: `C:/Arte y Tierra/acequia-landing/docs/encargo-video-03.md`.
Contrato de fondo: `animacion-portada.md`. Las diez piezas del encargo 02 están
aprobadas y **no se rehicieron**: este encargo agrega dos piezas y dos archivos.

Todo sobre el mismo predio y la misma grilla que las anteriores. El nombre del
predio no se publica.

---

## 1 · Lo primero: tres capas que el encargo pedía y la app no calcula

El acto 04 pedía «emplazamiento, caminos y zonificación por frecuencia de
visita», y nombraba `zonificacion.ts`. Leído el código, de las tres cosas **una
se calcula, una se calcula en otro lado y una no se calcula**:

| lo que pedía el encargo | lo que hay de verdad |
|---|---|
| emplazamiento | **sí**. `prepararEmplazamiento` + `evaluarEmplazamiento` dicen, celda por celda, si el terreno admite una construcción y por qué regla no cuando no. No dice dónde va la casa: dice dónde **no** va. |
| caminos (`caminos.ts`) | **no ahí**. `caminos.ts` es la herramienta de dibujo: toma los vértices que traza el usuario y les mide el largo y el perfil. Lo que sí existe es el corredor de `accesibilidad()` —y `trazarCaminoRelieve`, el ruteo por crestas de `cuencaHidro.ts`, que usa el master plan—. |
| zonificación de Mollison (`zonificacion.ts`) | **no**. `zonificacion.ts` define las categorías y mide el área de los polígonos que dibuja el usuario; `zonificacionGuiada.ts` los **verifica**, no los genera. Lo que la app sí calcula es el **tiempo de caminata sobre el relieve** (Tobler). |

`calcularMasterPlan` sí ubicaría viviendas y potreros, pero pide un **programa
declarado** —cuántas casas, cuántas hectáreas de qué— que este predio no tiene.
Inventarlo sería inventar el proyecto del cliente.

Y hay una frase de la propia biblioteca que resuelve el problema en vez de
dejarlo abierto. `zonificacionGuiada.ts` exporta esto:

> `EL_ANILLO_NO_ES_LA_ZONA` — «La fuente dice que los anillos concéntricos son
> una convención de dibujo […] Lo que define la zona es la frecuencia de visita,
> y **el terreno decide dónde se puede ir seguido**.»

Así que la capa son **isócronas de ida y vuelta a pie**, calculadas con la
función de Tobler de la app sobre el relieve real. No son anillos concéntricos y
se ve que no lo son: se estiran sobre la curva de nivel y se aplastan contra la
ladera. Es la tesis de la biblioteca, dibujada.

Esto es lo mismo que el encargo ya había hecho con el «bosque comestible», que
tampoco existe como capa. La diferencia es que acá aparecieron dos más.

---

## 2 · Entrega A · La secuencia de la mesa de trabajo

`MesaDeTrabajo.tsx` · 16,00 s · 480 cuadros a 30 fps · 1280×720 · bucle.

| | acto | cuadros | qué se ve |
|---|---|---|---|
| 01 | **La cota** | 0–100 | el shader de elevaciones subiendo de las cotas bajas a las altas |
| 02 | **La forma** | 100–200 | las curvas de nivel **dibujándose**, cada una sobre su propio recorrido, de cota en cota |
| 03 | **El agua** | 200–320 | las líneas de acumulación encendiéndose de los filos al cauce; después el vaso, el muro y el punto de derrame |
| 04 | **El diseño** | 320–440 | el predio se vela, se enciende el corredor por el que se puede llegar, lo que el terreno admite, y las bandas de caminata |
| — | **Vuelve** | 440–468 | todo se apaga junto y queda la ortofoto desnuda |

**El acto 04 dura 4 s y no 3,5.** Son tres cosas y no una —lo que el terreno
rechaza, por dónde se llega, cada cuánto se puede volver— y en 3,5 s se pisan.
Los treinta cuadros salen del acto 01, que es el más simple de los cuatro y el
que menos los necesita.

### El primer y el último cuadro SÍ son idénticos, y acá eso no es un defecto

En el encargo 02 se discutió lo contrario: dos cuadros iguales seguidos son una
trabita de 1/30 s en cada vuelta, y lo que hace que un bucle no salte es que la
animación sea **periódica**. Eso sigue valiendo. Lo que cambió es la pieza: acá
la **cámara está quieta** y las dos puntas son el mismo estado, la ortofoto sin
una sola línea. Donde nada se mueve, periódico e idéntico son la misma cosa. El
apagado termina en el cuadro 468 y los once que quedan son el cuadro 0, así que
el criterio del encargo se cumple al pie de la letra sin pagar ningún tirón.

### La inclinación bajó de 61° a 44°, y está medido por qué

Las piezas del encargo 02 van a 61° porque son un **paisaje**: lo que tienen que
dar es el cordón de fondo recortado contra el cielo. Ésta tiene que dejar
**leer** cuatro capas superpuestas, y a 61° la mitad lejana del predio se
comprime contra el horizonte. Medido sobre el cuadro 300: la represa de 6,66 ha
—un espejo de 370 × 543 m— cae en el fondo y se lee como una mancha, no como un
vaso con su muro. A 44° el predio se abre entero y las cuatro capas se
distinguen, sin irse a cenital, que sería un plano y no una mesa.

El rumbo no cambió: sigue siendo el mismo lado de la ladera que las diez piezas
aprobadas, así que las dos secciones de la página miran el mismo paisaje.

### Tres cosas que se probaron al revés primero

- **La rampa de cota se APAGA en el acto 04**, no se atenúa. Con ella al 50 %
  debajo, las bandas de caminata encima y el velo en el medio, el cuadro 435
  salía marrón y no se leía ni una cosa ni la otra. Lo que una mesa de trabajo
  hace con una capa que ya contó lo suyo es sacarla.
- **Las bandas de caminata van ARRIBA del velo.** Abajo del sombreado quedan
  mejor —el relieve se les nota encima en vez de parecer una calcomanía plana—
  pero el velo del mismo acto las apaga y quedan en una mancha parda.
- **Lo admitido va sin contorno.** Son 68 rectángulos de una fila cada uno, y
  dibujarle el borde a cada uno no marca la mancha: la raya.

### Lo que el acto 04 dice, que es un resultado y no una decoración

| | |
|---|---|
| el predio | 428,4 ha · 28.157 celdas de 12,3 m |
| el terreno **admite** una construcción en | **6,6 ha** (434 celdas, 1,5 %) |
| lo que más saca | **«Sin camino posible»: 95,5 %** |
| después | posición cóncava 14 % · el cauce 1,5 % |
| el corredor de ≤ 10 % de pendiente llega a | **7,5 ha del predio (1,7 %)** |
| a más de 40 min de ida y vuelta a pie | **382 de las 428 ha (89 %)** |

Lo que descarta la tierra en este predio **no es la pendiente de la plataforma:
es llegar**. Esa es la imagen del acto, y no hubo que forzarla.

---

## 3 · La represa: se dibuja el cierre y NO se certifica el vaso

El encargo pedía «el vaso y el muro de una represa posible, con su cota de
derrame», y el criterio de aceptación decía «no como una mancha azul». Las dos
cosas se cumplen y hay que decir en qué queda la tercera.

**El eje del muro se reconstruyó y se comprobó.** Perpendicular a por dónde baja
el agua en la celda del cierre —la dirección de máxima pendiente descendente
sobre el terreno relleno, que es la definición del D8—, caminando a los dos lados
mientras el terreno esté bajo el pelo de agua. Es el mismo criterio con que
`buscarSitiosRepresa` mide `ancho_muro_m`, y para que eso no sea una afirmación
se compara: **24,7 m reconstruidos contra 25 m de la librería**, dos celdas. Si
difirieran en más de una celda, el guion se niega a dibujar.

**Y después `vaso.ts` descarta los tres sitios.** Puesto el muro de verdad y
llenado el vaso con Priority-Flood, los tres marcan `derramePorEstribo`: el agua
se va por la punta del muro. Se barrieron las alturas de 3 a 20 m sobre los tres
sitios —`sondeo-represa.ts`— y **las veintisiete combinaciones** lo marcan.

Eso **no** es que el terreno no retenga. Es un límite de resolución:

- `buscarSitiosRepresa` rankea por eficiencia agua/muro, y la eficiencia premia
  siempre al muro más corto: con las alturas que la app trae por defecto los
  tres cierres miden 25 m, que sobre una grilla de 12,3 m son **dos celdas**.
- `vaso.ts` tiene su propio piso para eso (`CELDAS_MINIMAS_MURO = 3`) y marca
  `derramePorEstribo` cuando la silla de montar cae **a dos celdas o menos** del
  eje. Con un muro de 2 a 5 celdas y un radio de prueba de 2, el test no puede
  distinguir una silla del vaso del final del muro.

**A esta resolución la app puede UBICAR un cierre y no puede CERTIFICAR que
pare.** Así que la pieza dibuja lo que la app sí publica —el cierre, el ancho del
muro y el espejo de 6,66 ha que inunda, que es lo mismo que muestra el panel— y
el aviso queda acá escrito en vez de tapado. Para certificarlo haría falta
relieve de paso fino sobre el cierre, que es trabajo de campo, no de DEM global.

El punto de derrame que sí se dibuja sale de `vaso.ts`: **cota 319,2 m**, tipo
`derrame` (una silla de montar, no el borde del modelo).

---

## 4 · El camino: se dibuja el corredor, no una línea elegida

Lo que se dibuja es el **corredor entero** que devuelve `accesibilidad()`: todas
las celdas a las que se llega desde el acceso sin que ningún tramo pase del 10 %
—`PENDIENTE_CAMINO_NORMAL_PCT`, el que la app trae por defecto, de CPS 560—. Es
el mismo objeto con el que se decide la exclusión «Sin camino posible».

**Por qué no una línea.** Elegir UN sitio y dibujar SU camino obliga a elegir el
sitio, y probadas las 434 celdas que el terreno admite:

- la mejor por costo de plataforma (corte de 2,3 m³) se alcanza **sólo
  saliéndose del predio**: 7 de las 41 celdas de la traza caen afuera;
- la siguiente es **la celda del acceso misma**, camino de cero metros.

Las dos son respuestas correctas del criterio y ninguna es una imagen. El
corredor no hay que elegirlo: ya está calculado.

El acceso es la **celda de borde más baja**, que es la regla que ya usa
`calcularMasterPlan` cuando el usuario no marcó la tranquera.

### Un defecto de la app que apareció acá

`accesibilidad()` dice de sí misma que un lugar inalcanzable es uno al que no se
llega «ni zigzagueando **dentro del predio**», pero corre su Dijkstra sobre la
grilla entera, que llega hasta 1,08× el polígono. Medido: el corredor toca **490
celdas del predio y 3.262 del halo**. O sea que la exclusión «Sin camino
posible» de `emplazamiento.ts` puede admitir un sitio cuyo acceso pasa por el
campo del vecino, sin decirlo. Un camino por tierra ajena no es un camino: es
una servidumbre que hay que negociar.

Lo que se dibuja se recorta al predio. **Lo de la app queda abierto** — ver
sección 9.

### El otro ruteador, que no se dibuja

`trazarCaminoRelieve` (criterio Yeomans: por las divisorias, cruzando las
vertientes en un punto) devuelve 280 m con pendiente media 8,8 % y **máxima
15,2 %** para el mismo par de puntos donde `accesibilidad()` necesita 606 m. No
es que uno esté mal: el primero usa un **umbral de confort** y el segundo un
**límite duro**. Dibujar el corto al lado de una exclusión decidida con el otro
sería poner dos reglas distintas en el mismo cuadro.

---

## 5 · Las bandas de caminata

Dijkstra de ocho vecinos sobre el relieve, con el costo de cada paso dado por
`velocidadTobler` —la función de la app—, **fuera de sendero** (el factor 3/5 de
la fuente), que es lo que corresponde en un predio donde el camino todavía no
existe.

Se corre **dos veces** porque la función es asimétrica: subir una ladera y
bajarla no cuestan lo mismo, y el viaje redondo no es el doble de ninguno de los
dos. La suma de los dos mínimos es un **piso** del redondo —cada pierna puede
tomar su propio camino—, lo cual es coherente con lo que la biblioteca advierte
de estos tiempos: son un piso, no una estimación de la jornada
(`LA_CARRETILLA_NO_ES_UN_EXCURSIONISTA`).

**Los cortes son elegidos y se dicen: 5, 10, 20 y 40 minutos** de ida y vuelta.
Son números redondos, para que se lean. Lo que no se elige es su consecuencia,
que la calcula `costoDeCaminata` con el presupuesto de viajes que cada zona de
Mollison declara:

| ≤ | ha | frecuencia de la fuente | horas/año caminando |
|---|---|---|---|
| 5 min | 2,5 | *multiple times each day* | 60,8 – 121,8 |
| 10 min | 7,2 | *about once a day* | 60,8 |
| 20 min | 21,0 | *several times a week* | 34,7 – 69,3 |
| 40 min | 46,5 | *monthly or seasonally* | 2,7 – 8,0 |

El rincón más lejos del predio está a **198,9 minutos** de ida y vuelta.

**La quinta banda no se pinta.** Lo que está a más de 40 minutos son 382 de las
428 ha; pintarlo taparía el cuadro entero con el color de «lejos». Dejarlo en
blanco hace que lo que se vea sean las 46 ha a las que se puede volver seguido,
rodeadas de todo lo demás — que es el dato.

Los colores son los de `CATEGORIAS_ZONA.zona_1…zona_4` de la app. **Las bandas
son tiempo de caminata, no números de zona de Mollison**, y eso vale decirlo
porque el color sugiere lo segundo.

---

## 6 · Entrega B · El perfil del terreno (no es un video)

`salida-encargo-03/perfil-del-terreno.json`

**La traza no se eligió a ojo**: del punto más alto al más bajo del predio,
prolongada a los dos lados hasta el perímetro. Es la misma línea que define la
pendiente general que informa el panel de la app.

| | |
|---|---|
| entrada | −92,204943 · 17,328809 |
| salida | −92,192951 · 17,341477 |
| largo | **1.898,5 m** |
| cotas | 72,8 → 441,7 m · desnivel **368,9 m** |
| pendiente media de la traza | 19,4 % |
| puntos | **180**, sin un solo hueco |

La serie se muestrea **bilineal** entre los nodos de la grilla, que es la misma
interpolación con que `obtenerGrillaDEM` lee los píxeles del COG.

**Procedencia, completa, como pidió el encargo:**

> Copernicus GLO-30 · © DLR e.V. 2010-2014 y © Airbus Defence and Space GmbH
> 2014-2018, provisto bajo COPERNICUS por la UE y la ESA.
> Resolución **30 m**. Lectura: ventana COG por *range request* con
> `obtenerGrillaDEM()`. Remuestreo bilineal a 300×277 nodos, paso 12,3 m.

Y la advertencia, que va en el archivo: **el remuestreo no mejora la resolución
del dato**. La fuente sigue siendo de 30 m y así se cita. En pantalla la landing
no nombra proveedores, así que esto se lee «modelo de elevación global · 30 m».
Qué sale publicado lo decide el documento de alcance de la vidriera.

Con esto la franja de honestidad puede mostrar un número real con su
procedencia: **368,9 m de desnivel**.

---

## 7 · Entrega C · El par crudo contra leído

`crudo.png` / `leido.png` (1600×900) y `crudo.webp` / `leido.webp`.

La leída lleva curvas, agua, la represa posible, el corredor, lo admitido y las
bandas. **No lleva el shader de cota** —el encargo lo pide así, y tiene razón:
si la mitad leída repinta el color del suelo, lo que el visitante ve al correr
el borde es un filtro y no una lectura— ni el velo, que haría parecer la cortina
un control de brillo.

### Cómo se consiguió que estén alineadas, y cómo se comprobó

Primero se intentó lo que parecía correcto: `renderFrames` con los dos cuadros
en una sola corrida, un solo mapa, las mismas teselas. **Devolvió un segundo
cuadro a medio formar** —el terreno plano, la cámara sin asentar y una sola de
las once capas dibujada— y no siempre: dos corridas seguidas dieron resultados
distintos.

Lo que funciona es un `renderStill` por cuadro. Son dos mapas distintos, que es
justo lo que había que evitar, pero cada uno respeta el calentamiento de cuatro
segundos y las dos esperas por cuadro, y por eso salen enteros.

**Que eso alcance no se supone: se mide.** La medida que manda es cuántos
píxeles son exactamente iguales en las dos imágenes. La ortofoto es textura de
alta frecuencia: si la cámara se hubiera movido un píxel no coincidiría casi
ninguno.

```
  ✓ 87,4 % del cuadro es EXACTAMENTE el mismo píxel
  ✓ franja arriba      diferencia media 0,000
  ✓ franja izquierda   diferencia media 0,000
  ✓ franja derecha     diferencia media 0,000
    (sobre el cuadro entero, donde SÍ se dibuja: 7,809)
```

El 12,6 % que cambia es exactamente la huella del predio. El terreno no se movió.

### Y una franja que medía el encuadre en vez del desalineo

La primera versión usaba **cuatro** franjas de borde. La de abajo daba 1,52 con
las otras tres en cero, y no era un desalineo: el predio llega hasta el 97 % del
alto del cuadro, así que ahí sí se dibuja. Una franja mal elegida no mide un
desalineo, mide el encuadre. Es el mismo caso que las dos verificaciones que
mentían en el encargo 02: un falso negativo es tan inútil como un falso
positivo, porque lo primero que uno hace con él es desconfiar del control.

---

## 8 · La entrega, medida

```
mesa-de-trabajo.webm   1280x720  16,00 s   1332 KB / 1536   682 kbps  yuv420p tv bt709  sin audio
mesa-de-trabajo.mp4    1280x720  16,00 s   1120 KB / 1536   573 kbps  yuv420p tv bt709  sin audio
```

| | |
|---|---|
| tope del encargo | 1,5 MB por archivo · **entran los dos** |
| póster del cuadro 0 | `mesa-de-trabajo-poster.jpg` · 139 KB |
| póster del estado leído (cuadro 435) | `mesa-de-trabajo-poster-leido.jpg` · 148 KB |
| corte de prueba en baja | `prueba-mesa-de-trabajo.mp4` · 640×360 · 307 KB |

### El bucle: el cuadro 0 y el 479 son el MISMO ARCHIVO

Renderizados los dos cuadros por separado con `vistazo.mjs`, los dos PNG dan el
mismo md5 —`e63eee7d7e3e43614077d2ab6c40fbff`— y la diferencia píxel a píxel es
exactamente **0**. El criterio del encargo se cumple en el origen.

Sobre el maestro, en cambio, la costura mide **0,45** contra **0,02** de un paso
cualquiera. Eso **no es un salto del bucle**: es la deriva de cuantización del
H.264, que el cuadro 0 es un IDR y el 479 está a 479 cuadros del fotograma
clave. Es el mismo fenómeno que ya estaba medido en el encargo 02 —ahí daba 1,7
a 500 kbps; acá 0,45 a crf 12—. 0,45 sobre 255 es el 0,18 % de luminancia:
invisible.

### En un navegador de verdad, que es lo que ffprobe no puede

```
mesa-de-trabajo.webm   carga sí · error ninguno · presenta un cuadro sí · 16,00 s · 1332 KB
mesa-de-trabajo.mp4    carga sí · error ninguno · presenta un cuadro sí · 16,00 s · 1120 KB
```

Y las seis imágenes, con `control-imagenes.html`, que es lo mismo para lo que no
es video: una WebP mal escrita tampoco avisa hasta que está publicada.

```
✓ crudo.webp 1600×900   ✓ leido.webp 1600×900
✓ crudo.png  1600×900   ✓ leido.png  1600×900
✓ mesa-de-trabajo-poster.jpg 1280×720   ✓ mesa-de-trabajo-poster-leido.jpg 1280×720
```

### Los archivos

`C:\Arte y Tierra\Acequia\portada animacion\salida-encargo-03\`

| archivo | qué es |
|---|---|
| `mesa-de-trabajo.mp4` / `.webm` | la entrega A. **El MP4 va primero en la página** |
| `mesa-de-trabajo-poster.jpg` | el cuadro 0: la ortofoto desnuda |
| `mesa-de-trabajo-poster-leido.jpg` | el cuadro 435: la lectura puesta |
| `prueba-mesa-de-trabajo.mp4` | el corte en baja, para discutir el ritmo |
| `perfil-del-terreno.json` | la entrega B |
| `crudo.webp` / `leido.webp` | la entrega C, para la página (319 y 378 KB) |
| `crudo.png` / `leido.png` | la entrega C sin pérdida, para el archivo |
| `_control.html` / `_imagenes.html` | las dos hojas de control. No se publican |

---

## 9 · De dónde sale cada capa

| capa | función de la app |
|---|---|
| shader de cota | `shaderDesdeGrilla` + `colorElevacion`, rampa Terreno, rango del predio |
| curvas de nivel | `calcularCurvas`, intervalo 20 m |
| escorrentías | `calcularEscorrentias` (D8), recortadas al predio |
| represa | `buscarSitiosRepresa` (cierre, ancho de muro, espejo) |
| vaso y derrame | `vasoDesdeMuro` + `nivelVaso` (Priority-Flood) |
| emplazamiento | `prepararEmplazamiento` + `evaluarEmplazamiento` |
| corredor | `accesibilidad()`, límite `PENDIENTE_CAMINO_NORMAL_PCT` = 10 % |
| bandas de caminata | `velocidadTobler` (Tobler 1993, fuera de sendero) |
| relieve y sombreado | teselas Terrarium de AWS Open Data, exageración 1,4 |
| ortofoto | Esri World Imagery |

El dato lo escribe `apps/terreno/scripts/datos-mesa.ts`, que **no toca**
`cuetiepa.json`: las diez piezas aprobadas siguen leyendo exactamente el mismo
archivo. Lo que los dos generadores comparten —mojones, margen, grilla, caché
del relieve— se sacó a `predio-portada.ts`, y que esa extracción no cambió nada
está comprobado: `cuetiepa.json` regenerado es **idéntico byte a byte** al
aprobado salvo el campo de la fecha.

---

## 10 · Lo que queda abierto

- **La licencia de Esri para la ortofoto.** Sigue abierta desde el encargo 01.
  Usarla dentro de la app no es lo mismo que en una pieza promocional.
- ~~**`accesibilidad()` no recorta al predio** aunque su documentación diga que
  sí (sección 4).~~ **Cerrado el 28/10/2026.** El corredor se recorta al
  polígono salvo que se pida explícitamente lo contrario, y entonces la
  evaluación lo informa como servidumbre. Sobre este mismo predio las celdas
  alcanzadas pasan de 490 adentro más 3.262 del halo a **317 adentro y ninguna
  del halo**: 173 de las 490 que la app contaba como «con camino» sólo se
  alcanzaban cruzando el campo del vecino. Y apareció el modo de falla del
  propio arreglo —si el nodo del acceso redondea al halo, el corredor queda en
  una celda y el predio entero se informa sin camino—, resuelto arrancando en el
  nodo utilizable más cercano y midiendo cuánto se movió.
- ~~**`vaso.ts` no puede certificar una represa de chacra sobre un DEM de 30 m**
  (sección 3).~~ **Cerrado el 28/10/2026, y con más de lo que el encargo pedía.**
  La prueba del estribo se abstiene (`derramePorEstribo: null`) cuando el eje es
  más corto de lo que necesita para distinguir una punta del medio del muro, y
  el aviso habla del paso del relieve en vez de mandar a alargar el muro. Pero
  además se encontraron dos cosas que la sección 3 no había visto: **la prueba
  se medía contra todas las celdas del eje y no contra sus dos puntas** —un muro
  de 271 m con la silla en la celda 18 de 23 marcaba estribo—, y el vaso se iba
  **al lado seco del muro** en 13 de las 15 combinaciones probadas, hasta el
  97 % de las celdas inundadas. Eso último se contesta a cualquier resolución,
  así que ya no es cierto que a 30 m la app no pueda decir nada: puede decir que
  **ese muro no cierra**, que es la mitad más importante.
- **El póster.** El encargo pide el cuadro 0, que en esta pieza es la ortofoto
  desnuda: correcto como primer cuadro del bucle y flojo como imagen de reposo,
  porque no se ve que haya una lectura. Van los dos —`-poster.jpg` y
  `-poster-leido.jpg`— y la página elige.

---

## 11 · Cómo se rehace

```bash
pnpm --filter @arteytierra/terreno datos-mesa     # el dato (usa la caché del DEM)
pnpm --filter @arteytierra/placas piezas          # la entrega A, con su medición
pnpm --filter @arteytierra/placas par             # la entrega C, con su alineación
pnpm --filter @arteytierra/placas control-03      # servidor con Range, puerto 8733
```

Y después, en un navegador de verdad:
`http://localhost:8733/control-navegador.html` — la hoja abre cada archivo, lo
reproduce y mira `video.error` y `video.currentTime`. **ffprobe no alcanza**: la
WebM del primer encargo salía en rango completo con matriz bt470bg, ffmpeg la
decodificaba entera sin una queja y Chromium moría en el primer cuadro con
`PIPELINE_ERROR_DECODE`.

Para ver un cuadro suelto antes de largar una hora de render:

```bash
node scripts/vistazo.mjs MesaDeTrabajo 80 160 300 435
```
