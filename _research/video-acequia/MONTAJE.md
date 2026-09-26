# Plan de montaje — video de acequia

Qué hay en cada clip, qué entra en qué segundo, y las tres cosas que hay que
resolver antes de exportar. Sale del guión de `PROMPT-video-acequia.md` y del
metraje entregado en `C:\Arte y Tierra\Acequia\videoapp-1`.

El metraje no se commitea. Acá vive el plan; los archivos se quedan afuera.

---

## Lo que llegó

15 clips, 36 minutos, **1920×1080 · 30 fps · H.264 · sin audio**. Los 30 fps
coinciden con los de `packages/placas`, así que las placas y el metraje van al
mismo paso y no hay conversión en el medio.

Que no haya audio simplifica dos cosas: no hay nada que normalizar, y **los
subtítulos de los verticales no salen de Whisper sino del guión** — los textos
en pantalla ya están escritos, así que el SRT se tipea, no se transcribe ni se
corrige.

Las tomas vinieron largas y con varios paneles cada una, así que abajo va lo que
tiene cada clip y en qué minuto. Los tiempos son aproximados —salen de mirar 24
cuadros por clip— y se afinan al cortar.

| # | Archivo | Dur. | Qué tiene, y dónde |
|---|---|---|---|
| 01 | `b1-t01-ZOOM-01` | 27 s | El descenso de Sudamérica a la parcela, 0–21 s. Cierra sobre el polígono con los seis mojones |
| 02 | `b1-t01-cuadrofijo-02` | 25 s | La parcela quieta 0–10 s; el panel de Mojones con **31,1494 ha · 2,385 km** desde ~17 s |
| 03 | `b2-t01-clima-05` | 123 s | El clima cargando ~8–20 s; la ficha **Cwa** y los números desde ~100 s |
| 04 | `b2-t01-contextoyentorno-08` | 153 s | Ecorregión **Yungas / selva de montaña** ~30–50 s; pueblos originarios ~60–90 s; entorno y especies ~95–125 s |
| 05 | `b2-t01-mojones-03` | 37 s | El perímetro dibujándose clic por clic, ~12–32 s |
| 06 | `b2-t01-suelo-cobertura-…-06y07` | 74 s | Suelo cargando ~3–15 s; cobertura ~45–60 s; el shader de pendientes ~60–74 s |
| 07 | `b2-t01-topografia-04` | 68 s | El relieve cargando: polígono → shader → curvas, ~5–20 s. Shader a pantalla completa ~45–55 s |
| 08 | `b3-t01-aptitud,escorrentias,cuenca-09` | 127 s | Aptitud 0–25 s; curvas dibujándose ~30–60 s; **la cuenca resolviendo ~100–120 s; la salud del cálculo ~120–127 s** |
| 09 | `b3-t01-caminos,keyline,swales-11` | 214 s | Caminos con perfil de elevación 0–35 s; red de servicios ~45 s; **keyline ~55–90 s**; swales ~110–214 s |
| 10 | `b3-t01-cortavientos,cortafuegos-13` | 132 s | Clima repetido 0–55 s (no sirve); **cortinas ~60–100 s**; cortafuegos ~100–125 s; carbono ~125–132 s |
| 11 | `b3-t01-embalseycaptacion-10` | 405 s | Sitios de represa y embalse 0–200 s; captación de lluvia ~290–405 s |
| 12 | `b3-t01-masterplan…guardadodfx-14` | 210 s | Master plan 0–60 s; **el informe PDF ~60–105 s**; menú de exportar y DXF ~105–140 s; **escritorio personal ~170–190 s — ver abajo**; AutoCAD con el plano ~192–210 s |
| 13 | `b3-t01-sectores-14` | 61 s | Los sectores con los abanicos de sol y viento. Entero |
| 14 | `b3-t01-swale,produccion,potreros,calendario-12` | 375 s | Swales dimensionados 0–60 s; **potreros ~130–250 s**; producción ~250–300 s; calendario ~340–375 s |
| 15 | `b3-t01-swalebueno-11` | 156 s | Los swales de cerca sobre el shader. La mejor toma de swales |

---

## Tres cosas antes de exportar

### 1. Hay una barra de Chrome en los 15 clips — ya está resuelta

Todos los clips traen abajo la barra que avisa que se está compartiendo la
pantalla: *"Screenity — Graba y anota tu pantalla está compartiendo tu
pantalla · Dejar de compartir · Ocultar"*. Está en **x 587–1341, y 960–1017**
sobre 1920×1080, y no se mueve nunca.

Recortarla no sirve. Para que el cuadro siga siendo 16:9 habría que sacar 114
píxeles de cada lado y agrandar el resto: se pierde el riel de herramientas de
la izquierda y media columna del panel de capas de la derecha. En un video que
justamente muestra una app, eso es peor que la barra.

Lo que se hace es taparla con **una banda opaca abajo de todo**, de 140 px sobre
1080. Cuesta el 13 % del alto del cuadro y a cambio:

- se lleva también la atribución de Leaflet y la barra de estado de la app;
- le da un lugar fijo a las fuentes al pie, que el guión pide en tipografía
  chica y que si no quedan flotando sobre la imagen;
- no pierde un solo píxel de la interfaz de acequia.

Está implementada: `BandaBase` es el PNG que se estira debajo de todo el
montaje, y `Fuente` son los MOV con alfa que se apoyan encima. Probada contra un
cuadro real: tapa la barra entera con margen.

**Para la próxima grabación:** esa barra tiene un botón *Ocultar*. Un clic antes
de empezar y no aparece.

### 2. El clip 12 tiene material personal — no se usa antes del segundo 192

Entre ~170 y ~190 s el clip 12 sale de la app y muestra el escritorio de
Windows: archivos, íconos, y **una foto de una nena**. Es el paso de descargar el
DXF y abrirlo en AutoCAD, y quedó grabado el camino.

De ese clip se usa el informe (60–105 s), el menú de exportar (105–140 s) y
**AutoCAD desde 192 s en adelante**. Nada de lo que hay en el medio.

No es una preferencia de estilo: es material de un menor en un video que va a
una landing pública.

### 3. Dónde queda el predio está a la vista

El informe dice *"Municipio de La Ramada y La Cruz, Departamento Burruyacu,
Tucumán, Argentina"* y los paneles muestran las coordenadas del centroide
(−26,626 / −64,985). El titular no aparece por ningún lado —el proyecto se llama
"Terreno sin nombre"— así que no hay dato personal, pero sí queda ubicado el
campo con precisión de metros.

Si el predio es de alguien, eso se decide antes de publicar, no después. Se
arregla fácil: la coordenada del encabezado del panel se tapa con el mismo
criterio que la barra, y del informe se elige otra página. **Decime si hay que
hacerlo** y lo dejo resuelto.

Lo que sí no es un problema: los 30 fps. El descenso del plano 01 dura 21
segundos y en el montaje entra en 7, así que hay que **acelerarlo tres veces**,
no frenarlo. Acelerar un zoom que va de a escalones junta los escalones y queda
más parejo que el original.

---

## Los números, leídos del metraje

No hizo falta que los anotaras: se leen de los propios clips. Todos salen de la
corrida real sobre este predio y **ninguno está redondeado**.

**El predio** — 31,1494 ha · perímetro 2,385 km · 6 mojones.

**Relieve** (*Copernicus GLO-30 · © DLR e.V. · ~30 m/píxel*) — mín. 788 m, máx.
861 m, desnivel 72,6 m, media 818 m. **Pendiente media 21,5 %** (12,1°). El agua
corre hacia el SO.

**Clima** (*NASA POWER · Köppen Beck 1 km, 1991–2020*) — **Cwa**, templado
subtropical de invierno seco. **992 mm** de lluvia anual, 19,1 °C de media,
ETP 1502 mm (Hargreaves), humedad 63 %, viento principal ENE a 3,6 m/s,
GDD 3326.

**Suelo** (*ISRIC SoilGrids v2.0 · 0–5 cm · ~250 m*) — **franco-arcilloso**
(28 % arcilla, 39 % limo, 33 % arena), pH 6,2, carbono orgánico 35,9 g/kg (muy
alto), fertilidad alta, densidad aparente 1,16 g/cm³. **Grupo hidrológico C**,
infiltración lenta.

**Cobertura** (*ESA WorldCover 10 m, 2021*) — **bosque/arbolado 100 %**, suelo
desnudo 0 %.

**Ecorregión** (*RESOLVE*) — Yungas / selva de montaña.

### Y el cruce, que es el video

| | |
|---|---|
| Curva número (CN) | **73** |
| Tormenta de diseño | 134,4 mm en 24 h · retorno 10 años |
| Escurre | **63,8 mm — el 47 % de lo que cae** |
| Volumen escurrido | **179.787 m³** · unos 180 millones de litros |
| Cuenca de aporte | 281,98 ha |
| Tiempo de concentración | 44,6 min |
| Caudal pico | 23,69 m³/s · 84 L/s por hectárea |
| Ancho de vertedero | 84,81 m con 0,3 m de carga |

**Una distinción que no se puede pisar:** esos 180 millones de litros son de la
**cuenca de aporte, 282 ha**, no del predio de 31. La cuenca entra al campo desde
arriba. Decir "mi terreno tira 180 millones de litros" sería falso, y la placa
lleva el pie que lo aclara justamente para que no se pueda leer así.

### El regalo: la honestidad y el cruce están en el mismo panel

Abajo de ese mismo número, la app muestra:

> **Confianza media · 1 observación**
> *Cuenca de 282 ha: fuera del rango de Kirpich.* La fórmula del tiempo de
> concentración se calibró en cuencas de hasta ~80 ha. Más grande que eso,
> subestima el tc y por lo tanto **sobreestima** el caudal pico: queda del lado
> seguro para el vertedero, pero no es el caudal real.

El guión reservaba el bloque de la honestidad para el final —"y te dice cuándo
no confiar en el número"— dando por hecho que había que buscarlo en otra
pantalla. No hace falta: **está a cuatro centímetros del número estrella, en el
mismo panel, sobre el mismo cálculo**. Eso es mucho más fuerte que mostrarlo
aparte, porque no parece una sección de descargo sino lo que es: cómo piensa la
app.

Por eso el bloque final se arma con el clip 08 (~120–127 s) y no con otro.

---

## El montaje, segundo a segundo

Los clips van con `-c copy` —sin recomprimir— y el corte fino lo hace CapCut.
Las placas entran como clips más: MP4 las que van solas, MOV con alfa las que se
superponen.

**La banda va primero y abajo de todo**, estirada de 0:00 a 1:30. Todo lo demás
se apoya encima.

### 0:00 – 0:08 · El salto de escala

| Desde | Qué | Encima |
|---|---|---|
| 0:00,0 | Negro, 0,4 s | — |
| 0:00,4 | **Clip 01** desde ~2 s, a 3× | `Titular` "Un terreno cualquiera." entra en 0:02 |
| 0:07,0 | **Clip 01** cola, velocidad normal | `Titular` "Todo lo que acequia ya sabe de él." |

Nada de logo al principio: si el gancho no entra en dos segundos, el video no se
ve.

### 0:08 – 0:26 · Lo que llega solo

Seis cortes de tres segundos. En cada uno, el `Fuente` correspondiente sobre la
banda.

| Desde | Clip | Pie de fuente |
|---|---|---|
| 0:08 | **05** ~14 s — el perímetro dibujándose | `Titular` "No cargás nada." / "Marcás el perímetro." |
| 0:11 | **07** ~8 s — el relieve cargando | Relieve — Copernicus GLO-30 · © DLR e.V. |
| 0:14 | **03** ~10 s — el clima cargando | Clima — NASA POWER · Köppen Beck 1 km |
| 0:17 | **06** ~5 s — el suelo cargando | Suelo — ISRIC SoilGrids v2.0 |
| 0:20 | **06** ~48 s — la cobertura | Cobertura — ESA WorldCover 10 m (2021) |
| 0:23 | **04** ~35 s — la ficha de Yungas | Ecorregión — RESOLVE |

### 0:26 – 0:46 · El cruce

| Desde | Qué |
|---|---|
| 0:26 | **Clip 08** ~104 s — el panel de cuenca resolviendo, 5 s |
| 0:31 | **`PlacaCruce`**, 12 s enteros. Las cuatro capas entran, colapsan, sale CN 73 y el número cuenta hasta 179.787 |
| 0:43 | **Clip 08** ~116 s — vuelta al panel con el número en pantalla, 3 s |

Volver al panel después de la placa no es relleno: es la prueba de que el número
de la placa está en la app y no lo dibujó el editor.

### 0:46 – 1:08 · Las decisiones

Seis cortes secos. Acá el video acelera y ningún plano respira.

| Desde | Clip | Encima |
|---|---|---|
| 0:46 | **09** ~62 s — el keyline trazándose | `Titular` "Dónde va el agua." |
| 0:50 | **15** ~40 s — los swales sobre el shader | — |
| 0:54 | **11** ~120 s — el sitio de represa con su volumen | — |
| 0:58 | **09** ~12 s — el camino y su perfil | `Titular` "Dónde va el camino." |
| 1:01 | **10** ~75 s — la cortina y su sombra de viento | `Titular` "Dónde va el árbol." |
| 1:04 | **14** ~180 s — los potreros dividiéndose | `Titular` "Dónde entra el animal." |

### 1:08 – 1:20 · Lo que te llevás, y la honestidad

| Desde | Clip | Encima |
|---|---|---|
| 1:08 | **12** ~70 s — el informe pasando páginas | `Titular` "Sale en PDF. Sale en DXF." |
| 1:12 | **12** ~112 s — el menú de exportar, "DXF descargado" | — |
| 1:14 | **12** **desde 192 s** — el plano en AutoCAD | — |
| 1:16 | **08** ~121 s — la salud del cálculo desplegándose | `Titular` "Y te dice cuándo no confiar en el número." |

Ese último corte se lleva cuatro segundos enteros. Es el beat más valioso del
video y el único que un competidor no puede copiar sin construirlo.

### 1:20 – 1:30 · Cierre

| Desde | Qué |
|---|---|
| 1:20 | **Clip 13** ~45 s — los sectores con todo el diseño encima, alejándose |
| 1:25 | **`AperturaAppClara`** con la bajada "Un proyecto gratis. Sin tarjeta." |

El `.app` aparece al final del remate, que es exactamente para lo que se armó esa
placa.

---

## Cómo se renderizan las placas

Desde la raíz del repo. Las que se superponen van en **ProRes 4444**, que es lo
que lleva canal alfa; las que van solas, en MP4.

```bash
pnpm --filter @arteytierra/placas estudio
```

La banda, una vez, para estirarla toda la línea de tiempo:

```bash
pnpm --filter @arteytierra/placas exec remotion still src/index.ts BandaBase banda.png
```

El cruce, que va solo y a pantalla completa:

```bash
pnpm --filter @arteytierra/placas render PlacaCruce cruce.mp4
```

Un pie de fuente, uno por capa:

```bash
pnpm --filter @arteytierra/placas render Fuente pie-relieve.mov --codec=prores --prores-profile=4444 --props='{"capa":"Relieve","fuente":"Copernicus GLO-30 · © DLR e.V."}'
```

Un titular, con su segundo renglón cuando el guión lo pide:

```bash
pnpm --filter @arteytierra/placas render Titular tit-01.mov --codec=prores --prores-profile=4444 --props='{"texto":"No cargás nada.","segundo":"Marcás el perímetro.","anclaje":"derecha"}'
```

Los números del cruce viven en `packages/placas/src/Root.tsx`, en la constante
`CRUCE`, todos juntos. Si alguna vez se refilma con otro predio se cambian ahí y
las dos versiones —horizontal y vertical— salen iguales.

---

## Lo que queda

- **Los cortes de los clips**, con `-c copy`, una vez que estén confirmados los
  puntos de arriba. Los tiempos de esta tabla son de mirar 24 cuadros por clip:
  el corte fino se afina archivo por archivo.
- **El vertical de 30 s y el de 15 s**, después de aprobada la madre. El crop es
  dirigido plano por plano: el mapa se recorta bien, los paneles hay que
  reencuadrarlos.
- **El SRT de los verticales**, tipeado desde los textos del guión. Quemado con
  `MarginV` entre 80 y 140, que si no Instagram lo tapa.
- **La música.** Sigue siendo lo que más cambia el resultado y lo único que no
  puedo resolver acá: hace falta una pista con licencia.
