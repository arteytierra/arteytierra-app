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
| 06 | `b2-t01-suelo-cobertura-…-06y07` | 74 s | Suelo: botón 4–7 s, **resultado a los 7 s**. Cobertura: botón 28–32 s, **resultado a los 33 s**. Shader de pendientes 39–62 s |
| 07 | `b2-t01-topografia-04` | 68 s | El relieve cargando: **el panel se llena a los 12,5 s y el shader pinta a los 13 s**. Shader a pantalla completa ~45–55 s |
| 08 | `b3-t01-aptitud,escorrentias,cuenca-09` | 127 s | Aptitud 0–25 s; curvas ~30–60 s; **la cuenca resuelve 98–102 s; los números 106–110 s; la salud del cálculo 116–126 s** |
| 09 | `b3-t01-caminos,keyline,swales-11` | 214 s | Camino trazándose 8–18 s; **el perfil de elevación aparece a los 32 s**; red de servicios ~45–57 s; **keyline 58–62 s**; swales ~110–214 s |
| 10 | `b3-t01-cortavientos,cortafuegos-13` | 132 s | Clima repetido 0–55 s (no sirve); cortina trazándose 62–80 s; **la cortina puesta 83–95 s**; cortafuegos 98–125 s |
| 11 | `b3-t01-embalseycaptacion-10` | 405 s | **Los sitios de represa sugeridos con su volumen, 95–100 s**; dibujo del espejo 101–200 s; captación de lluvia ~290–405 s |
| 12 | `b3-t01-masterplan…guardadodfx-14` | 210 s | Master plan 0–64 s; **el informe PDF 65–122 s** (el anexo de fuentes en 115–122); **el menú de exportar 139–147 s**; **escritorio personal ~170–190 s**; AutoCAD 192–210 s — **ver abajo, no se usa** |
| 13 | `b3-t01-sectores-14` | 61 s | Los sectores con los abanicos de sol y viento. Entero, lo mejor 38–48 s |
| 14 | `b3-t01-swale,produccion,potreros,calendario-12` | 375 s | Swales 0–132 s; **el panel de pastoreo con los 28 potreros a los 135 s**; los potreros dibujados en el mapa desde ~200 s; calendario ~340–375 s |
| 15 | `b3-t01-swalebueno-11` | 156 s | Los swales de cerca sobre el shader. **Lo mejor, 36–50 s**; de 70 s en adelante está demasiado cerca |

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
subtropical de invierno seco. **992 mm** de lluvia anual, 19,1 °C de media,
ETP 1502 mm (Hargreaves), humedad 63 %, viento principal ENE a 3,6 m/s,
GDD 3326.

**Suelo** (*ISRIC SoilGrids v2.0 · 0–5 cm · ~250 m*) — **franco-arcilloso**
(28 % arcilla, 39 % limo, 33 % arena), pH 6,2, carbono orgánico 35,9 g/kg (muy
alto), fertilidad alta, densidad aparente 1,16 g/cm³, agua útil 288,4 mm.
**Grupo hidrológico C**, infiltración lenta.

**Cobertura** (*ESA WorldCover 10 m*) — **bosque/arbolado 100 %**, suelo desnudo
0 %.

**Ecorregión** (*RESOLVE*) — Yungas / selva de montaña.

**Pastoreo** — 28 potreros de 1,11 ha, balance forrajero 531 %, carga
instantánea 4,5 EV/ha, 4.779 m de alambrado, 932 postes, 2 bebederos.

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
| `05-clima` | 03 | 9,3 | 3,5 | "Cargando…" → la ficha Cwa con los 992 mm |
| `06-suelo` | 06 | 5,5 | 3,5 | Botón → franco-arcilloso, pH 6,2, 35,9 g/kg |
| `07-cobertura` | 06 | 30,5 | 4,5 | "Analizando cobertura…" → bosque/arbolado 100 % |
| `08-ecorregion-yungas` | 04 | 28,8 | 3,5 | "Cargando el contexto…" → Yungas / selva de montaña |
| `09-cuenca-resolviendo` | 08 | 97,5 | 5,0 | "Calculando cuenca…" → 281,98 ha → la cuenca se dibuja sola |
| `10-cuenca-numero` | 08 | 106,5 | 3,0 | El panel con CN 73 y los 179.787 m³ en pantalla |
| `11-keyline` | 09 | 58,0 | 4,0 | Botón → keypoint a 823 m → las keylines sobre el relieve |
| `12-swales` | 15 | 38,0 | 5,0 | Los swales sobre las curvas de nivel |
| `13-represa` | 11 | 95,5 | 4,0 | Los sitios sugeridos, cada uno con su volumen |
| `14-camino-perfil` | 09 | 30,5 | 3,5 | "Consultando el relieve…" → el perfil de elevación se dibuja |
| `15-cortina` | 10 | 84,0 | 4,0 | La cortina puesta, con su franja de protección |
| `16a-potreros-panel` | 14 | 135,0 | 4,5 | 28 potreros, 1,11 ha, 531 % de balance, 4.779 m de alambrado |
| `16b-potreros-mapa` | 14 | 229,0 | 4,5 | Los mismos números con las subdivisiones dibujadas. **Trae el cartelito amarillo de "Dibujando polígono"** |
| `17-informe` | 12 | 65,3 | 4,7 | Página en blanco → la tapa → el resumen ejecutivo |
| `18-anexo-fuentes` | 12 | 115,5 | 4,0 | El anexo: cada capa con su fuente y su fecha |
| `19-exportar` | 12 | 139,5 | 4,0 | El menú con "Informe PDF" y "DXF (AutoCAD)" |
| `20-salud-del-calculo` | 08 | 116,5 | 4,5 | Confianza media · fuera del rango de Kirpich |
| `21-sectores-cierre` | 13 | 39,0 | 6,0 | Todo el diseño junto con los abanicos de sol y viento |
| `22-shader-pendientes` | 06 | 39,0 | 4,0 | De reserva: el shader de pendientes a pantalla completa |

**El 16 va en dos versiones y hay que elegir una.** La `a` tiene el panel limpio
y todos los números pero los potreros todavía no están dibujados; la `b` los
tiene dibujados sobre el terreno pero arrastra el cartel amarillo de un modo de
dibujo que quedó abierto. Mi voto es la `a`: en cuatro segundos se leen los
números, y las líneas de subdivisión a ese zoom casi no se ven igual.

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

Suma **exactamente 90,0 s**. Las duraciones de acá son las que entran, no las
del archivo: los cortes traen aire y hay que ajustarlos en CapCut.

**La banda va primero y abajo de todo**, estirada de 0:00 a 1:30. Todo lo demás
se apoya encima.

### 0:00 – 0:08,4 · El salto de escala

| Entra | Sale | Qué | Encima |
|---|---|---|---|
| 0:00,0 | 0:00,4 | Negro | — |
| 0:00,4 | 0:07,1 | `01-descenso` **a 3×** (20,0 → 6,7 s) | `Titular` "Un terreno cualquiera." desde 0:02 |
| 0:07,1 | 0:08,4 | `02-descenso-cola`, 1,3 s de los 3,0 | `Titular` "Todo lo que acequia ya sabe de él." |

Nada de logo al principio: si el gancho no entra en dos segundos, el video no se
ve.

### 0:08,4 – 0:25,5 · Lo que llega solo

| Entra | Qué | Dur. | Pie de fuente |
|---|---|---|---|
| 0:08,4 | `03-perimetro` **a 5,5×** (17,0 → 3,1 s) | 3,1 | — · `Titular` "No cargás nada." / "Marcás el perímetro." |
| 0:11,5 | `04-relieve` | 2,8 | RELIEVE — Copernicus GLO-30 · © DLR e.V. |
| 0:14,3 | `05-clima` | 2,8 | CLIMA — NASA POWER · Köppen Beck 1 km |
| 0:17,1 | `06-suelo` | 2,8 | SUELO — ISRIC SoilGrids v2.0 |
| 0:19,9 | `07-cobertura` | 2,8 | COBERTURA — ESA WorldCover 10 m |
| 0:22,7 | `08-ecorregion-yungas` | 2,8 | ECORREGIÓN — RESOLVE |

### 0:25,5 – 0:45,5 · El cruce

| Entra | Qué | Dur. |
|---|---|---|
| 0:25,5 | `09-cuenca-resolviendo` | 5,0 |
| 0:30,5 | **`PlacaCruce`**, entera | 12,0 |
| 0:42,5 | `10-cuenca-numero` | 3,0 |

Volver al panel después de la placa no es relleno: es la prueba de que el número
de la placa está en la app y no lo dibujó el editor.

### 0:45,5 – 1:05,0 · Las decisiones

Seis cortes secos. Acá el video acelera y ningún plano respira.

| Entra | Qué | Dur. | Encima |
|---|---|---|---|
| 0:45,5 | `11-keyline` | 3,5 | `Titular` "Dónde va el agua." |
| 0:49,0 | `12-swales` | 3,5 | — |
| 0:52,5 | `13-represa` | 3,5 | — |
| 0:56,0 | `14-camino-perfil` | 3,0 | `Titular` "Dónde va el camino." |
| 0:59,0 | `15-cortina` | 3,0 | `Titular` "Dónde va el árbol." |
| 1:02,0 | `16a-potreros-panel` | 3,0 | `Titular` "Dónde entra el animal." |

### 1:05,0 – 1:25,0 · Lo que te llevás, y la honestidad

| Entra | Qué | Dur. | Encima |
|---|---|---|---|
| 1:05,0 | `17-informe` | 4,5 | `Titular` "Sale en PDF. Sale en DXF." |
| 1:09,5 | `18-anexo-fuentes` | 3,0 | — |
| 1:12,5 | `19-exportar` | 3,0 | — |
| 1:15,5 | `20-salud-del-calculo` | 4,5 | `Titular` "Y te dice cuándo no confiar en el número." |
| 1:20,0 | `21-sectores-cierre` | 5,0 | — |

Ese corte de la salud del cálculo se lleva cuatro segundos y medio enteros. Es
el beat más valioso del video y el único que un competidor no puede copiar sin
construirlo.

### 1:25,0 – 1:30,0 · Cierre

| Entra | Qué | Dur. |
|---|---|---|
| 1:25,0 | **`AperturaAppClara`** con la bajada "Un proyecto gratis. Sin tarjeta." | 5,0 |

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

- **El vertical de 30 s y el de 15 s**, después de aprobada la madre. El crop es
  dirigido plano por plano: el mapa se recorta bien, los paneles hay que
  reencuadrarlos.
- **El SRT de los verticales**, tipeado desde los textos del guión. Quemado con
  `MarginV` entre 80 y 140, que si no Instagram lo tapa.
- **La música.** Sigue siendo lo que más cambia el resultado y lo único que no
  puedo resolver acá: hace falta una pista con licencia.
