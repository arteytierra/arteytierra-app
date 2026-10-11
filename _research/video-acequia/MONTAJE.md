# Plan de montaje — video de acequia

Qué hay en cada clip, qué entra en qué segundo, y cómo se cortó. Sale del guión
de `PROMPT-video-acequia.md` y del metraje entregado en
`C:\Arte y Tierra\Acequia\videoapp-1`.

El metraje no se commitea. Acá vive el plan; los archivos se quedan afuera, en
`C:\Arte y Tierra\Acequia\videoapp-1\cortes\`.

---

## Lo que llegó

15 clips, 36 minutos, **1920×1080 · 30 fps · H.264 · sin audio**. Los 30 fps
coinciden con los de `packages/placas`, así que las placas y el metraje van al
mismo paso y no hay conversión en el medio.

Que no haya audio simplifica dos cosas: no hay nada que normalizar, y **los
subtítulos de los verticales no salen de Whisper sino del guión** — los textos
en pantalla ya están escritos, así que el SRT se tipea, no se transcribe ni se
corrige.

| # | Archivo | Dur. | Qué tiene, y dónde |
|---|---|---|---|
| 01 | `b1-t01-ZOOM-01` | 27 s | El descenso de Sudamérica a la parcela, 0–20 s. Cierra sobre el polígono con los seis mojones |
| 02 | `b1-t01-cuadrofijo-02` | 25 s | La parcela quieta 0–10 s; el panel de Mojones con **31,1494 ha · 2,385 km** desde ~17 s |
| 03 | `b2-t01-clima-05` | 123 s | El clima cargando 8–11 s; **la ficha Cwa aparece a los 11 s**; los números hasta ~25 s |
| 04 | `b2-t01-contextoyentorno-08` | 153 s | **Yungas / selva de montaña aparece a los 30 s**; ecosistema 30–48 s; pueblos originarios ~60–90 s; especies ~95–125 s |
| 05 | `b2-t01-mojones-03` | 37 s | El perímetro dibujándose clic por clic, 8–22 s; cierra en 22 s y el panel da la superficie en 24 s |
| 06 | `b2-t01-suelo-cobertura-…-06y07` | 74 s | Suelo: botón 4–7 s, **resultado a los 7,8 s**. Cobertura: botón 28–32 s, **resultado a los 33 s**. Shader de pendientes 39–62 s |
| 07 | `b2-t01-topografia-04` | 68 s | El relieve cargando: **el panel se llena a los 12,5 s y el shader pinta a los 13 s**. Shader a pantalla completa ~45–55 s |
| 08 | `b3-t01-aptitud,escorrentias,cuenca-09` | 127 s | Aptitud 0–25 s; curvas ~30–60 s; **la cuenca resuelve 98–102 s; los números 106–110 s; la salud del cálculo 116–126 s** |
| 09 | `b3-t01-caminos,keyline,swales-11` | 214 s | Camino trazándose 8–18 s; **el perfil de elevación aparece a los 32 s**; red de servicios 45–67 s; **el keypoint del keyline aparece a los 69,7 s** y el panel queda hasta 76; swales ~110–214 s |
| 10 | `b3-t01-cortavientos,cortafuegos-13` | 132 s | Clima repetido 0–55 s (no sirve); cortina trazándose 62–80 s; **la cortina puesta 83–95 s**; cortafuegos 98–125 s |
| 11 | `b3-t01-embalseycaptacion-10` | 405 s | **Los sitios de represa sugeridos con su volumen, 95–100 s**; dibujo del espejo 101–200 s; captación de lluvia ~290–405 s |
| 12 | `b3-t01-masterplan…guardadodfx-14` | 210 s | Master plan 0–64 s; **el informe PDF 65–122 s** (el anexo de fuentes en 115–122); **el menú de exportar 139–147 s**; **escritorio personal ~170–190 s**; AutoCAD 192–210 s — **ver abajo, no se usa** |
| 13 | `b3-t01-sectores-14` | 61 s | Los sectores con los abanicos de sol y viento. Entero, lo mejor 38–48 s |
| 14 | `b3-t01-swale,produccion,potreros,calendario-12` | 375 s | Swales 0–132 s; **el panel de pastoreo con los 28 potreros a los 135 s**; los potreros dibujados en el mapa desde ~200 s; calendario ~340–375 s |
| 15 | `b3-t01-swalebueno-11` | 156 s | Los swales de cerca sobre el shader. **Un cartel modal tapa la pantalla entre 37 y 41 s**; lo mejor es 42–50; de 70 s en adelante está demasiado cerca |

---

## Las cuatro cosas que aparecieron en el metraje

### 1. Hay una barra de Chrome en los 15 clips — resuelta con la banda

Todos los clips traen abajo la barra que avisa que se está compartiendo la
pantalla: *"Screenity … está compartiendo tu pantalla · Dejar de compartir ·
Ocultar"*. Está en **x 587–1341, y 960–1017** sobre 1920×1080, y no se mueve.

Recortarla no sirve. Para que el cuadro siga siendo 16:9 habría que sacar 114
píxeles de cada lado y agrandar el resto: se pierde el riel de herramientas de
la izquierda y media columna del panel de capas de la derecha. En un video que
justamente muestra una app, eso es peor que la barra.

Se tapa con **una banda opaca abajo de todo**, de 140 px sobre 1080. Cuesta el
13 % del alto y a cambio se lleva también la atribución de Leaflet y la barra de
estado, le da lugar fijo a las fuentes al pie, y no pierde un píxel de la
interfaz. `BandaBase` es el PNG; `Fuente`, los MOV con alfa que van encima.

**Para la próxima grabación:** esa barra tiene un botón *Ocultar*.

### 2. El clip 12 tiene material personal — no se usa entre 170 y 192 s

Entre ~170 y ~190 s el clip sale de la app y muestra el escritorio de Windows:
archivos, íconos y **una foto de una nena**. Quedó grabado el camino de bajar el
DXF y abrirlo en AutoCAD.

No es una preferencia de estilo: es material de un menor en un video que va a
una landing pública. Ninguno de los cortes entregados toca ese tramo.

### 3. El tramo de AutoCAD es de otro cliente — el plano no se muestra

Del segundo 192 en adelante el clip 12 abre AutoCAD, pero lo que abre es
`Cabañas - Las gramillas2.dwg`: un legajo de obra completo —fachadas,
instalación sanitaria, instalación eléctrica, fundaciones, planilla de áreas—
con el rótulo **"PROYECTO RINCÓN DE ONGAMIRA"**. El DXF de acequia sólo aparece
como cuatro polígonos verdes sueltos pegados dentro de ese mismo dibujo, entre
196 y 197 s, y después queda un `Dibujo1` vacío.

Es trabajo de un tercero, con su rótulo, en un video público. Y aunque no lo
fuera, no hay ningún cuadro donde se vea el plano del terreno solo y legible.

**Se saca el plano de AutoCAD del montaje.** En su lugar entra algo mejor, que
ya estaba grabado: **el anexo de fuentes y metodología del informe** (clip 12,
115–122 s), donde cada capa aparece con su fuente y su fecha —Esri World
Imagery, Copernicus GLO-30, NASA POWER, Open-Meteo/ERA5, SoilGrids, ESA
WorldCover, GBIF—, más **el menú de exportar** (139–147 s), donde se lee
"Informe PDF" y "DXF (AutoCAD)" en la misma lista. El argumento queda dicho sin
mostrar el archivo de otro.

**Para la próxima grabación:** abrir el DXF en un AutoCAD limpio, sin otros
dibujos abiertos.

### 4. Los 30 fps y la ubicación: ninguno de los dos es problema

El descenso del plano 01 dura 20 segundos y en el montaje entra en 6,7, así que
hay que **acelerarlo tres veces**, no frenarlo. Acelerar un zoom que va de a
escalones junta los escalones y queda más parejo que el original.

Y las coordenadas quedan a la vista —el informe dice "Municipio de La Ramada y
La Cruz, Departamento Burruyacu, Tucumán" y los paneles muestran el centroide—.
**Jonatan decidió que no hace falta taparlas.** El titular no aparece por ningún
lado: el proyecto se llama "Terreno sin nombre".

---

## Los números, leídos del metraje

No hizo falta anotarlos: se leen de los propios clips. Todos salen de la corrida
real sobre este predio y **ninguno está redondeado**.

**El predio** — 31,1494 ha · perímetro 2,385 km · 6 mojones.

**Relieve** (*Copernicus GLO-30 · © DLR e.V. · ~30 m/píxel*) — mín. 788 m, máx.
861 m, desnivel 72,6 m, media 818 m. **Pendiente media 21,5 %** (12,1°). El agua
corre hacia el SO.

**Clima** (*NASA POWER · Köppen Beck 1 km, 1991–2020*) — **Cwa**, templado
subtropical de invierno seco. **908 mm** de lluvia anual, 19,1 °C de media,
ETP 1502 mm (Hargreaves), humedad 63 %, viento principal ENE a 3,6 m/s,
GDD 3326.

**Suelo** (*ISRIC SoilGrids v2.0 · 0–5 cm · ~250 m*) — **franco-arcilloso**
(28 % arcilla, 39 % limo, 33 % arena), pH 6,2, carbono orgánico 35,9 g/kg (muy
alto), fertilidad alta, densidad aparente 1,16 g/cm³, agua útil 288,4 mm.
**Grupo hidrológico C**, infiltración lenta.

**Cobertura** (*ESA WorldCover 10 m*) — **bosque/arbolado 100 %**, suelo desnudo
0 %.

**Ecorregión** (*RESOLVE*) — Yungas / selva de montaña.

**Pastoreo** — 28 potreros de 1,11 ha, balance forrajero 533 %, carga
instantánea 4,5 EV/ha, 4.787 m de alambrado, 933 postes, 2 bebederos.

**Sectores** — 5 detectados: viento ENE, viento frío de invierno, sol de verano
(trayectoria alta), sol de invierno (trayectoria baja), riesgo de fuego en la
ladera SO.

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

Por eso el bloque final se arma con el clip 08 (116–121 s) y no con otro.

---

## Los cortes

Están en `C:\Arte y Tierra\Acequia\videoapp-1\cortes\`, numerados en el orden en
que entran. Cada uno trae algo de aire de más en los dos extremos: el corte fino
lo hace CapCut.

| Archivo | Fuente | Desde | Dur. | Qué se ve |
|---|---|---|---|---|
| `01-descenso` | 01 | 0,5 | 20,0 | Sudamérica → la parcela. **Va a 3×** |
| `02-descenso-cola` | 01 | 20,5 | 3,0 | El polígono ya encuadrado, velocidad normal |
| `03-perimetro` | 05 | 7,0 | 17,0 | Los seis mojones clic por clic, hasta que cierra. **Va a 5,5×** |
| `04-relieve` | 07 | 10,8 | 3,5 | Botón → el panel se llena → el shader pinta con las curvas |
| `05-clima` | 03 | 9,3 | 3,5 | "Cargando…" → la ficha Cwa con los 908 mm |
| `06-suelo` | 06 | 6,3 | 4,5 | "Consultando SoilGrids…" → franco-arcilloso, pH 6,2, 35,9 g/kg |
| `07-cobertura` | 06 | 30,5 | 4,5 | "Analizando cobertura…" → bosque/arbolado 100 % |
| `08-ecorregion-yungas` | 04 | 28,8 | 3,5 | "Cargando el contexto…" → Yungas / selva de montaña |
| `09-cuenca-resolviendo` | 08 | 97,5 | 5,0 | "Calculando cuenca…" → 281,98 ha → la cuenca se dibuja sola |
| `10-cuenca-numero` | 08 | 106,5 | 3,0 | El panel con CN 73 y los 179.787 m³ en pantalla |
| `11-keyline` | 09 | 68,3 | 4,0 | Botón → "Analizando relieve…" → keypoint a 823 m, con las dos pendientes |
| `12-swales` | 15 | 42,0 | 5,0 | Los seis swales puestos sobre el hipsométrico, con el panel dimensionándolos |
| `13-represa` | 11 | 95,5 | 4,0 | Los sitios sugeridos, cada uno con su volumen |
| `14-camino-perfil` | 09 | 30,5 | 3,5 | "Consultando el relieve…" → el perfil de elevación se dibuja |
| `15-cortina` | 10 | 84,0 | 4,0 | La cortina puesta, con su franja de protección |
| `16a-potreros-panel` | 14 | 132,3 | 4,5 | 533 % de balance forrajero, 28 potreros de 1,11 ha, 4.787 m de alambrado, 933 postes |
| `16b-potreros-mapa` | 14 | 229,0 | 4,5 | Los mismos números con las subdivisiones dibujadas. **Trae el cartel amarillo de "Dibujando polígono"** |
| `17-informe` | 12 | 68,6 | 3,6 | Página en blanco → la tapa con "Terreno sin nombre" y la foto |
| `17b-resumen` | 12 | 73,2 | 3,6 | El scroll que llega al resumen ejecutivo con los siete números |
| `18-anexo-fuentes` | 12 | 115,5 | 4,0 | El anexo: cada capa con su fuente y su fecha |
| `20-salud-del-calculo` | 08 | 116,5 | 4,5 | Confianza media · fuera del rango de Kirpich |
| `21-sectores-cierre` | 13 | 39,0 | 6,0 | Todo el diseño junto con los abanicos de sol y viento |
| `22-shader-pendientes` | 06 | 39,0 | 4,0 | De reserva: el shader de pendientes a pantalla completa |

**El 16 va en la versión `a`**, decidido por Jonatan: el panel limpio con los
veintiocho potreros, las 1,11 ha y el 533 % de balance, sin el cartel amarillo
de "Dibujando polígono" que arrastra la `b`. La `b` queda cortada por si alguna
vez hace falta ver las subdivisiones dibujadas sobre el terreno, pero no entra
en ningún montaje.

### El corte del informe se rehizo, y el de exportar se cayó

El `17-informe` original arrancaba en 65,3 y los primeros dos segundos y medio
eran **el menú de exportar abierto**, con "DXF (AutoCAD)" a la vista; la tapa
del informe recién aparecía sobre el final. Jonatan pidió no mostrar la parte de
exportar a AutoCAD, así que:

- `17-informe` se recortó de nuevo desde **68,6**, que es donde la página está en
  blanco y la tapa se dibuja sola.
- Se agregó `17b-resumen` desde **73,2**, el scroll que llega al resumen
  ejecutivo con la superficie, la lluvia, el clima, la pendiente, el agua útil,
  el suelo y la cobertura en una sola pantalla.
- **`19-exportar` se descartó y se borró.** Era el mismo menú visto de nuevo, y
  un corte que no va a entrar en ningún montaje no tiene por qué quedar en la
  carpeta de entrega esperando que alguien lo use por error.

El titular que acompañaba ese bloque decía *"Sale en PDF. Sale en DXF."*. Ahora
dice **"Todo esto sale en un informe." / "Con cada fuente y cada fecha."**: el
video no puede prometer una exportación que decidió no mostrar. La exportación a
DXF existe y sigue siendo un argumento fuerte para un profesional — pero va en la
landing y en la documentación, no acá.

### Cinco cortes estaban mirando otra cosa

Al armar los verticales hubo que mirar cada corte cuadro por cuadro para elegir
la columna del recorte, y ahí aparecieron cuatro que no mostraban lo que decía
su nombre. Los cuatro se volvieron a cortar. Queda anotado porque la lección no
es de este video: **un corte no está verificado hasta que alguien mira adentro**,
y una lista de tiempos tomada de una pasada rápida es una hipótesis.

| Corte | Qué mostraba | Qué muestra ahora |
|---|---|---|
| `11-keyline` | El panel de **red de servicios**, con alguien clickeando Agua / Riego / Gas. El keyline nunca aparecía: en el clip 09 está en 68–76 s, no en 58–62 | El botón, "Analizando relieve…" y el keypoint a 823 m con las dos pendientes |
| `12-swales` | Un **cartel modal** —"Se colocaron 6 swales en el plano"— tapando la pantalla con el fondo desenfocado | Los seis swales puestos sobre el hipsométrico, con el panel dimensionándolos |
| `17-informe` | Los primeros dos segundos y medio eran **el menú de exportar**, con "DXF (AutoCAD)" a la vista | La página en blanco y la tapa del informe dibujándose |
| `06-suelo` | Alcanzaba, pero justo: el "Consultando SoilGrids…" se va recién a los 7,8 s y el corte dejaba nueve décimas de resultado | Arranca en 6,3 y deja casi dos segundos de franco-arcilloso en pantalla |
| `16a-potreros-panel` | **También traía el cartel amarillo de "Dibujando polígono"** — el que se suponía que sólo tenía la `b`. Aparece a los 137 s y el corte arrancaba en 135 | Arranca en 132,3, sobre la ventana limpia de 132,5 a 136,8 |

Y tres números del relevamiento también estaban mal. La precipitación anual del
predio es **908 mm**, no 992 —se lee en el panel de clima, y el informe la
redondea a 900—; el balance forrajero es **533 %**, no 531; y el alambrado de
subdivisión son **4.787 m con 933 postes**, no 4.779 con 932.

Ninguno cambia el argumento del video, y por eso mismo vale anotarlos: los tres
venían de leer un panel a ojo en una captura chica, no de la app. Los números de
las placas sí salen de `Root.tsx` y se compararon contra el metraje uno por uno.

### Por qué se recomprimieron, en vez de cortar con `-c copy`

Porque **los quince clips traen un keyframe cada 2 segundos exactos**. Con
`-c copy` el corte no puede empezar donde uno quiere: salta al keyframe anterior,
hasta 2 segundos antes. En planos de 3 y 4 segundos eso no es un detalle, es
perder el plano: el corte del relieve tiene que empezar 1,7 s antes de que el
shader pinte, y el keyframe más cercano está a 10,0 o a 12,0.

Así que se recomprimió una sola vez, con x264 en CRF 16 y preset `slow`, que
sobre captura de pantalla a 1080p es indistinguible del original, y se forzó
CFR 30 para que CapCut no tenga que adivinar la cadencia. Es la única generación
que se agrega antes de la exportación final.

---


## El montaje, segundo a segundo

Suma **exactamente 90,0 s**: 2700 cuadros a 30 fps, con cada segmento fijado por
`-frames:v` y no por `-t`. Está armado y se arma solo con
[`montaje.sh`](montaje.sh); la tabla de abajo es lo mismo que dice el script,
escrito para leer.

**La banda va abajo de todo**, en los veintidós segmentos de metraje. Las dos
placas que van a pantalla completa —el cruce y el cierre— no la llevan, porque
no tienen nada que tapar.

| Entra | Dur. | Qué | Desde el corte | Encima |
|---|---|---|---|---|
| 0:00,0 | 0,4 | Negro | — | — |
| 0:00,4 | 6,7 | `01-descenso` **a 2,985×** | 0,0 | `Titular` "Un terreno cualquiera." desde 1,6 |
| 0:07,1 | 2,4 | `02-descenso-cola` | 0,3 | `Titular` "Todo lo que acequia ya sabe de él." |
| 0:09,5 | 3,1 | `03-perimetro` **a 5,484×** | 0,0 | `Titular` "No cargás nada." / "Marcás el perímetro." |
| 0:12,6 | 2,8 | `04-relieve` | 0,4 | RELIEVE — Copernicus GLO-30 · © DLR e.V. |
| 0:15,4 | 2,8 | `05-clima` | 0,4 | CLIMA — NASA POWER · Köppen Beck 1 km |
| 0:18,2 | 2,8 | `06-suelo` | 0,5 | SUELO — ISRIC SoilGrids v2.0 |
| 0:21,0 | 2,8 | `07-cobertura` | 0,9 | COBERTURA — ESA WorldCover 10 m |
| 0:23,8 | 2,8 | `08-ecorregion-yungas` | 0,5 | ECORREGIÓN — RESOLVE Ecoregions 2017 |
| 0:26,6 | 4,4 | `09-cuenca-resolviendo` | 0,3 | — |
| 0:31,0 | 12,0 | **`PlacaCruce`** | — | — |
| 0:43,0 | 3,0 | `10-cuenca-numero` | 0,0 | — |
| 0:46,0 | 3,5 | `11-keyline` | 0,3 | `Titular` "Dónde va el agua." |
| 0:49,5 | 3,0 | `12-swales` | 0,7 | — |
| 0:52,5 | 3,5 | `13-represa` | 0,3 | — |
| 0:56,0 | 3,0 | `14-camino-perfil` | 0,4 | `Titular` "Dónde va el camino." |
| 0:59,0 | 3,0 | `15-cortina` | 0,5 | `Titular` "Dónde va el árbol." |
| 1:02,0 | 3,5 | `16a-potreros-panel` | 0,5 | `Titular` "Dónde entra el animal." |
| 1:05,5 | 3,5 | `17-informe` | 0,0 | `Titular` "Todo esto sale en un informe." / "Con cada fuente y cada fecha." |
| 1:09,0 | 3,0 | `17b-resumen` | 0,5 | — |
| 1:12,0 | 3,5 | `18-anexo-fuentes` | 0,0 | — |
| 1:15,5 | 4,5 | `20-salud-del-calculo` | 0,0 | `Titular` "Y te dice cuándo no confiar en el número." |
| 1:20,0 | 5,0 | `21-sectores-cierre` | 1,0 | — |
| 1:25,0 | 5,0 | **`AperturaAppClara`** | — | — |

Cuatro decisiones de ritmo que no son obvias leyendo la tabla:

- **Nada de logo al principio.** Si el gancho no entra en dos segundos, el video
  no se ve. La marca aparece a los ochenta y cinco.
- **Volver al panel después de la placa del cruce** (0:43) no es relleno: es la
  prueba de que los 179.787 m³ están en la app y no los dibujó el editor.
- **Entre 0:46 y 1:05 no respira ningún plano.** Seis cortes secos: agua, swales,
  represa, camino, árbol, animal. Es la parte del video que más se parece a
  trabajar.
- **La salud del cálculo se lleva cuatro segundos y medio enteros**, más que
  cualquier otro plano de metraje. Es el único beat que un competidor no puede
  copiar sin construirlo.

---

## Los verticales

Dos, los dos de 1080×1920 y los dos con los subtítulos ya quemados.

### El recorte es dirigido, plano por plano

Un vertical sacado de un 16:9 pierde dos tercios del cuadro, así que **la
pregunta no es cómo recortar sino qué mirar**. Y en acequia hay dos cosas
distintas para mirar: el panel de la izquierda, que es donde están los números, y
el mapa de la derecha, que es donde pasa el dibujo.

La ventana es de **607×1080** —el alto completo, que es lo que manda el 9:16— y
después se agranda ×1,78 a 1080×1920. De yapa, los 140 px de la banda pasan a
ser 250, que es exactamente lo que devuelve `ALTO_BANDA` para vertical: los dos
formatos terminan usando la misma medida sin que haya que retocar nada.

| Plano | `x` | Qué queda adentro |
|---|---|---|
| `01-descenso` | 726 | El polígono centrado en el mapa |
| `03-perimetro` | 877 | Los mojones apareciendo, sin el panel |
| `04-relieve` | 860 | El shader pintando el terreno |
| `05-clima` | 70 | El panel: la ficha Cwa con los 908 mm |
| `06-suelo` | 70 | El panel: franco-arcilloso, pH 6,2 |
| `07-cobertura` | 70 | El panel: bosque 100 % |
| `08-ecorregion-yungas` | 70 | El panel: Yungas / selva de montaña |
| `09-cuenca-resolviendo` | 745 | La cuenca dibujándose sola |
| `11-keyline` | 40 | El panel: keypoint 823 m y las dos pendientes |
| `13-represa` | 40 | El panel: cuatro sitios con su relación agua/muro y sus litros |
| `16a-potreros-panel` | 40 | El panel de pastoreo completo |
| `20-salud-del-calculo` | 40 | Las cuatro observaciones, legibles |

El criterio es simple y se repite: **cuando lo que aparece se lee en el panel,
el recorte va al panel; cuando se dibuja en el mapa, va al mapa.** Los cinco
planos de "lo que llega solo" se reparten así: el relieve al mapa —porque el
shader es lo que se entiende en un segundo— y los otros cuatro al panel, porque
un color plano sobre el terreno no dice nada y un número sí.

Ocho de los doce terminaron yendo al panel, y no por comodidad: acequia dibuja
poco sobre el mapa y calcula mucho al costado. El keypoint del keyline es un
punto morado de veinte píxeles, y los sitios de represa **no se dibujan**: son
cuatro fichas con su relación agua/muro y sus litros. Recortar al mapa en esos
dos planos habría dejado un vertical de curvas de nivel bonitas que no dicen
nada.

### Vertical de 30 s — 900 cuadros

| Entra | Dur. | Qué | `x` | Encima |
|---|---|---|---|---|
| 0,0 | 2,8 | `01-descenso` a 7,14× | 726 | `TitularVertical` "Un terreno cualquiera." |
| 2,8 | 1,8 | `03-perimetro` a 9,44× | 877 | subtítulo |
| 4,6 | 1,2 | `04-relieve` | 860 | subtítulo |
| 5,8 | 1,2 | `05-clima` | 70 | subtítulo |
| 7,0 | 1,2 | `06-suelo` | 70 | subtítulo |
| 8,2 | 1,2 | `07-cobertura` | 70 | subtítulo |
| 9,4 | 1,2 | `08-ecorregion-yungas` | 70 | subtítulo |
| 10,6 | 1,8 | `09-cuenca-resolviendo` | 745 | subtítulo |
| 12,4 | 6,5 | **`PlacaCruceVertical`** a ritmo 1,8 | — | — |
| 18,9 | 1,8 | `11-keyline` | 40 | subtítulo |
| 20,7 | 1,5 | `13-represa` | 40 | subtítulo |
| 22,2 | 1,5 | `16a-potreros-panel` | 40 | subtítulo |
| 23,7 | 2,8 | `20-salud-del-calculo` | 40 | `TitularVertical` "Y te dice cuándo no confiar." |
| 26,5 | 3,5 | **`AperturaAppClaraVertical`** a ritmo 1,4 | — | — |

### Vertical de 15 s — 450 cuadros

| Entra | Dur. | Qué | `x` | Encima |
|---|---|---|---|---|
| 0,0 | 2,0 | `01-descenso` a 10× | 726 | `TitularVertical` "Un terreno cualquiera." |
| 2,0 | 0,8 | `04-relieve` | 860 | subtítulo |
| 2,8 | 0,8 | `05-clima` | 70 | subtítulo |
| 3,6 | 0,8 | `06-suelo` | 70 | subtítulo |
| 4,4 | 0,8 | `07-cobertura` | 70 | subtítulo |
| 5,2 | 5,0 | **`PlacaCruceVertical`** a ritmo 2,4 | — | — |
| 10,2 | 1,8 | `20-salud-del-calculo` | 40 | `TitularVertical` "Y cuándo no confiar." |
| 12,0 | 3,0 | **`AperturaAppClaraVertical`** a ritmo 1,67 | — | — |

### El `ritmo` de las placas, y por qué no se aceleró el archivo

La placa del cruce dura doce segundos en horizontal y el vertical de 30 s tiene
seis y medio para darle. Lo obvio sería acelerar el MP4 ya renderizado — y sería
un error: eso también acelera el contador, que es lo único de la placa que **no**
se puede apurar sin que se lea como un efecto en vez de como una cuenta.

Así que `PlacaCruce` y `AperturaAcequiaApp` tomaron una prop nueva, `ritmo`, que
escala el cuadro de entrada. Cada resorte se recalcula a la velocidad nueva y el
contador sigue siendo lineal con salida suave, sólo que más corto. Es una línea
de código y evita tres versiones distintas de la misma placa.

### Los subtítulos

Quemados, en ASS y no en SRT, por una razón concreta: cuando al filtro
`subtitles` de ffmpeg le entra un SRT, arma el script con PlayRes 384×288. Ahí
dentro, `MarginV 110` no son 110 píxeles sino 110 de 288 —o sea 733 sobre 1920—
y el subtítulo termina en el medio del cuadro. Declarando `PlayResX/Y` igual al
video, `Fontsize` y `MarginV` vuelven a ser píxeles de verdad.

`MarginV` es **110**: adentro de la banda de 250 px, sobre negro profundo, y
arriba de donde Instagram pone su interfaz.

Y el track **no repite lo que ya dice una placa**. Donde hay titular o donde la
placa lleva su propio texto, el subtítulo calla. Por eso el vertical de 30 s
tiene siete líneas y el de 15 s tiene dos: el resto del tiempo ya hay texto en
pantalla, y dos textos a la vez no se leen, se esquivan.

Los archivos son [`subtitulos-30s.ass`](subtitulos-30s.ass) y
[`subtitulos-15s.ass`](subtitulos-15s.ass).

---

## Cómo se produce todo

Dos comandos. El primero renderiza las 28 placas; el segundo arma los tres
videos.

```bash
pnpm --filter @arteytierra/placas render-video
```

```bash
bash _research/video-acequia/montaje.sh
```

El script de Remotion está en
[`packages/placas/scripts/render-video.mjs`](../../packages/placas/scripts/render-video.mjs)
y es, además de un script, **la lista de materiales del video**: si un titular
cambia de texto o una placa cambia de duración, se cambia ahí. Empaqueta una
sola vez y renderiza las veintiocho en serie; con `remotion render` suelto serían
veintiocho empaquetados.

El de montaje arma cada elemento como un segmento suelto —con su recorte, su
velocidad, la banda y los MOV con alfa ya encima, todos con los mismos parámetros
de codificación— y recién después los pega con el demuxer `concat` y `-c copy`.
Esa es la única parte del proceso donde `-c copy` es honesto: cada segmento
empieza en un keyframe porque acaba de nacer, así que el pegado no recomprime
nada y no agrega una generación.

Nada de esto toca el repo. Las placas caen en
`C:\Arte y Tierra\Acequia\videoapp-1\placas\` y los videos en
`…\videoapp-1\salida\`.

---

## Lo que queda

- **La música.** Sigue siendo lo que más cambia el resultado y lo único que no se
  puede resolver acá: hace falta una pista con licencia. Sin ella los tres
  videos están mudos, que es como están hoy.
- **La voz en off**, si se decide grabarla. El guión, con los tiempos, las
  pausas y lo que no se dice, está en [`VOZ-EN-OFF.md`](VOZ-EN-OFF.md).
- **El cuadrado de 1:1** para el feed, si hace falta. Sale del mismo material:
  es otra tabla de `x` y otra lista de segmentos.

### Para la próxima grabación

Tres cosas que costaron trabajo y se arreglan del lado de la cámara:

1. **La barra de Screenity tiene un botón *Ocultar*.** Apretarlo devuelve los
   140 px de abajo.
2. **Grabar con menos carga, o con OBS.** Los quince clips dicen 30 fps y
   ninguno los tiene: la cadencia real va de 21,2 a 29,9, y baja justo donde el
   panel estaba pesado.
3. **Abrir el DXF en un AutoCAD limpio**, sin otros dibujos abiertos y sin pasar
   por el escritorio.
