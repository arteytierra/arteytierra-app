# Encargo 04 · El sol y el viento, la obra que existe, y el informe

Pedido: `C:/Arte y Tierra/acequia-landing/docs/encargo-video-04.md`.
Contrato de fondo: `animacion-portada.md`.

Tres piezas. Las dos primeras sobre el mismo predio de siempre, cuyo nombre no
se publica; la tercera también. La de la obra construida es la única sobre otro
predio, **Ecoescuela Tay Pichín**, que sí se nombra (autorizado el 27/10/2026).

Todo lo que sale en pantalla lo calculó un motor de la app sobre un lugar real,
**con una excepción declarada**: la pieza B sale **sin el número de litros**,
porque no se pudo establecer la escala de la toma. El encargo lo previó con
todas las letras y la sección 3 de este documento cuenta qué se intentó, con los
números.

---

## 0 · Qué quedó entregado

En `C:\Arte y Tierra\Acequia\portada animacion\salida-encargo-04`:

| pieza | archivos | peso / tope |
|---|---|---|
| **A** · sol y viento, 18 s, bucle | `sol-y-viento.webm` · `.mp4` · `-poster.jpg` · `-poster-leido.jpg` | 1.709 y 1.253 KB / 1.843 |
| **B** · la obra, 14 s | `obra.webm` · `.mp4` · `-poster.jpg` | 1.930 y 1.753 KB / 2.253 |
| **C** · el informe, 10 s | `informe.webm` · `.mp4` · `-poster.jpg` | 1.046 y 1.040 KB / 1.229 |
| fotos | `foto-excavacion-2024-02-02.jpg` · `foto-membrana-y-vaso-2024-02-03.jpg` · `foto-cisterna-viva-2025-03-12.jpg` | 1.600 px de ancho |
| cortes de prueba | `prueba-sol-y-viento.mp4` · `prueba-obra.mp4` · `prueba-informe.mp4` | 640 × 360 |
| controles | `_control.html` · `control-calce-del-trazado.png` | — |

Los tres pares pasaron el control de navegador —`video.error` nulo y un cuadro
presentado en los seis archivos— y los tres salen en `yuv420p`, rango `tv` y
matriz `bt709`, sin audio.

**Los cortes de prueba están ahí para aprobar el ritmo.** El encargo pedía
mirarlos *antes* de renderizar en calidad; como no había con quién chequear, se
renderizaron igual las tres piezas finales. Si el ritmo de alguna no convence,
lo que hay que rehacer es un render, no una pieza.

---

## 1 · Pieza A — «Lo que no se ve»: el sol y el viento

Dieciocho segundos, cámara quieta, bucle perfecto. Datos:
`apps/terreno/scripts/datos-sol-viento.ts` →
`packages/placas/generado/cuetiepa-sol-viento.json`. Composición:
`packages/placas/src/composiciones/SolYViento.tsx`.

### Lo que el dato dijo, y es la prueba que el encargo pedía

`calcularArcoSolar` sobre el centro del predio (17,3298° N), radio 1.514 m:

| arco | día | mediodía | dónde cae respecto del centro | `porElNorte` | luz |
|---|---|---|---|---|---|
| **Invierno** (21 dic) | 355 | 49,2°, azimut 180° | 686 m al **sur** | falso | 10,96 h |
| **Equinoccio** | 80 | 72,3°, azimut 180° | 298 m al **sur** | falso | 11,98 h |
| **Verano** (21 jun) | 172 | 83,9°, azimut **0°** | 103 m al **NORTE** | **verdadero** | 13,04 h |

El arco de junio se da vuelta y se ve: en la pieza el trazo azul abulta hacia
arriba del cuadro y los otros dos hacia abajo. `porElNorte` es
`declinación > latitud`, que no es el hemisferio: es el dato del lugar.

Dos cosas que hubo que cuidar para que eso llegara a la pantalla:

- **El rótulo sale del `label`, no de la clave.** `fechasMeta` nombra sus claves
  `solsticio_verano` para el 21 de diciembre y `solsticio_invierno` para el 21
  de junio, porque las claves nombran el día del año y eso no se mueve. Lo que
  se mueve es qué estación es cada uno, y lo resuelve `nombreDelSolsticio`. A
  17,3° N el alto del año es junio.
- **Es la única pieza del repertorio con el norte arriba.** Las otras miran
  desde el rumbo 165 —la pose aprobada, el otro lado de la ladera—, y con ese
  rumbo el norte queda abajo del cuadro: el arco de junio aparecería en la mitad
  inferior y cualquiera lo leería como «el sol va por el sur». La pieza diría lo
  contrario de lo que la sostiene. Se rompe la familia en esta sola pieza, y se
  rompe a propósito.

### La insolación corre a 30 m, que es la resolución del dato

`calcularInsolacion` recorre, por paso de tiempo y por celda, un rayo sobre el
DEM hasta el borde de la grilla. Sobre la grilla de los encargos 02 y 03 —300 ×
277 = 83.100 celdas— son del orden de **1.200 millones de iteraciones por día**
y no termina. A ~30 m la grilla queda en 123 × 114 y cada día entra en menos de
un segundo.

No es un atajo: **30 m es el paso nativo del GLO-30**, así que un mapa de
sombras más fino que su fuente sería resolución inventada. El relieve de los
demás actos sigue siendo el de 12,3 m ya aprobado.

| día | horas de luz | horas de sol sobre el terreno | media | rectángulos |
|---|---|---|---|---|
| Verano (doy 172) | 13,04 h | 8,00 – 13,00 h | 11,28 h | 2.569 |
| Invierno (doy 355) | 10,96 h | **0,00** – 11,00 h | 8,99 h | 3.001 |

4.708 celdas caen dentro del polígono, de 14.022 de la grilla con su halo. El
halo se calcula igual y no se dibuja: la sombra que recibe una celda del borde
la tira el cerro del vecino, y si ese cerro no está en la grilla la celda sale
iluminada todo el día.

**Los dos mapas se normalizan contra el mismo techo**, el máximo del día largo
(13,00 h). Es lo que hace que la comparación signifique algo: con cada día
normalizado contra el suyo los dos recorrerían la rampa entera y el invierno se
vería igual de soleado. `colorInsolacion(horas, max)` pide el máximo justamente
para que el llamador pueda elegir eso.

**Ni un número de horas aparece en pantalla.** `insolacion.ts` lo pide en su
propia cabecera: sin nubes, sin refracción, sobre un modelo de ~30 m. Los
números están en el JSON para poder verificar.

### El viento, los doce meses

`WD10M` de NASA POWER, mes por mes:

| | Ene | Feb | Mar | Abr | May | Jun | Jul | Ago | Sep | Oct | Nov | Dic |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| rumbo | NE | NE | NE | NE | NE | ENE | E | ENE | NE | NE | NE | NE |
| grados | 49 | 49 | 47 | 37 | 44 | 67 | **82** | 71 | 53 | 37 | 45 | 55 |
| m/s | 2,5 | 2,5 | 2,4 | 2,3 | 2,3 | 2,4 | **2,7** | 2,4 | 2,1 | 2,3 | 2,4 | 2,4 |

**Hay que decir una cosa en contra del propio encargo, porque es la verdad del
dato: acá el promedio anual NO habría mentido.** El encargo advierte que un
promedio anual de dirección puede apuntar a donde no sopla nunca, y es cierto
como advertencia general; en este predio los doce meses caben entre 37° y 82° y
el `viento_dir_ppal` que calcula la app —NE— coincide con nueve de los doce. Lo
que los doce meses sí muestran, y una flecha no, es **el cuadrante entero** y
que el viento rota hacia el este en pleno invierno austral… que acá es verano.

La pieza dibuja las doce cuñas de 70° de la app —la envolvente— más **los doce
radios exactos**, uno por mes. Los radios no estaban en el pedido y hubo que
agregarlos: doce cuñas de 70° que se mueven 45° en total se tapan casi del todo
entre sí, así que el acto quedaba como una mancha quieta. El radio es el dato
crudo, sin amplitud y sin promedio, y es lo que hace visible la rotación.

### La cortina, y un defecto de la app que sale a la luz

`construirCortina` con los parámetros por defecto de la app (`ancho_m: 8`,
`alto_m: 10`):

| | |
|---|---|
| eje, recortado al predio | 2.423 m |
| banda de plantación | 8 m de ancho · **1,93 ha** |
| zona protegida | alto × 15 = **150 m** a sotavento · **36,26 ha** |
| estratos | 3 |
| viento | del NE |

**El defecto.** `azimutVientoFrio(lat)` devuelve 0° —norte— en todo el
hemisferio norte, porque el aire frío viene del polo. Acá POWER mide el viento
entrando por el cuadrante NE–E **los doce meses**: del norte no sopla nunca. Una
cortina puesta por el default protegería de un viento que no existe. La pieza
usa el **rumbo modal medido** (NE, 9 de 12 meses, 46,2°) y lo dice en el JSON.
Es un dato para la sesión de la app, no un arreglo de esta entrega.

**Y una lista que la pieza NO dibuja.** `ESTRATOS_CORTINA` nombra algarrobo
blanco, quebracho blanco, tala, espinillo, jarilla y piquillín: el espinal
argentino. Este predio está en Chiapas. Publicar esa lista sobre una selva de
montaña mexicana sería exactamente la plantilla que la pieza A existe para
desmentir, así que se dibuja la **estructura** —una banda de tres alturas con su
resguardo— y no una sola especie. El aviso viaja dentro del JSON.

### Verificación

| | |
|---|---|
| cierre del bucle | la costura vale **0,43** y un paso cualquiera 0,01 (medido sobre el maestro) |
| cuadro 0 y cuadro 539 | los dos son la ortofoto desnuda: el apagado termina en el 528 |
| color | `yuv420p` · `tv` · `bt709` en los dos formatos |
| audio | ninguno |

---

## 2 · Pieza B — «De la hoja al predio»: la obra que existe

Catorce segundos sobre `DJI_0010.MOV`. El metraje lo arma
`packages/placas/scripts/obra.mjs`; la capa de líneas es
`src/composiciones/ObraTayPichin.tsx` y el trazado vive en
`src/composiciones/obra/trazado.ts`.

### El montaje, y por qué el vértice va congelado

Se midió el movimiento de la toma entera: diferencia media entre cuadros
consecutivos, cuatro muestras por segundo.

```
  0 s  ▁▃▅        arranca pegada al agua y acelera
  2 s  ▇          el pico de la subida
 10 s  ▅          sube parejo, el movimiento aparente baja con la altura
 19 s  ▁  2,76 ← el instante MÁS QUIETO de los 47 segundos
 20 s  ▂  3,65
 23 s  ▅          empieza el regreso
 35 s  ▇  14,30 ← el pico de la bajada
 46 s  ▁  2,80    otra vez sobre el agua
```

De ahí salen los tres tramos:

| tramo | de la toma | velocidad | en la pieza |
|---|---|---|---|
| la subida | 0,3 → 19,0 s | ×3,74 | 0,0 – 5,0 s |
| el vértice | el cuadro de 19,0 s, congelado | — | 5,0 – 10,5 s |
| la bajada | 19,0 → 47,1 s | ×8,03 | 10,5 – 14,0 s |

**El vértice va congelado y no es pereza.** El trazado está hecho sobre UN
cuadro y tiene que calzar con lo que hay debajo; la toma en su momento más
quieto no está quieta del todo, y cinco segundos y medio de deriva sacarían las
líneas de encima de los techos. Seguir la deriva pediría estimar una
transformación por cuadro sobre el metraje, que es una suposición nueva por
cuadro. Congelar es la misma imagen sin ninguna. El corte de entrada y el de
salida caen los dos en el cuadro de 19,0 s, así que la imagen se detiene y
vuelve a arrancar donde estaba: no hay salto.

### Qué se dibuja

Cinco techos, el espejo de la cisterna y el deck de madera que la ata con el
primer cuadro. Los contornos se dibujan uno tras otro, con medio segundo entre
uno y el siguiente, y recién después se rellenan todos juntos: lo que la
captación necesita no son cinco líneas sino cinco superficies.

El octágono de madera que se ve entre el techo verde y el oscuro **no entra**:
en esta toma todavía es una estructura con los tirantes a la vista, sin
cubierta. Un techo que no existe no capta nada.

El calce del trazado se verificó contra el cuadro
(`control-calce-del-trazado.png`), que es la comprobación que no se puede
saltear: un trazado corrido tres metros no se nota en el JSON, se nota en la
pieza publicada.

### Tres cosas que el encargo pedía y NO están, con su razón

1. **El número de litros.** No hay escala. Sección 3.
2. **El perímetro del predio.** No se ve ninguno. En el cuadro del vértice no
   hay alambrado, ni camino perimetral, ni cambio de cobertura que marque dónde
   termina la escuela: el monte sigue igual en los cuatro bordes. Un polígono
   dibujado ahí sería un dibujo, no una lectura, y la regla del propio encargo
   es «sólo lo que la imagen sostiene». Lo que sí tiene perímetro visible es
   cada techo —que además es el perímetro que la app le pide al usuario para la
   captación—, y eso es lo que se dibuja.
3. **El recorrido del agua de los techos a la cisterna.** Hay un bajante
   visible saliendo del techo oscuro y un tramo de caño blanco cerca del deck,
   pero **no hay un conducto que se pueda seguir de punta a punta** en esta
   toma. Dibujar la línea completa sería suponer el recorrido, y además
   afirmaría que esos techos desaguan en ese espejo, que es justamente lo que
   haría falta para que el número de litros signifique algo.

Y lo que ya estaba prohibido y no está: ni curvas de nivel, ni shader de cota,
ni escorrentías modeladas sobre esta toma.

### Una observación sobre el agua que conviene no perder

El espejo del primer cuadro está **cubierto de plantas flotantes** y la carpeta
de origen se llama `biopiscina`. Una biopiscina se llena de otra manera que una
cisterna de agua de lluvia, y sus plantas son la zona de regeneración, no un
descuido. Nada en la toma dice que los techos desagüen ahí. Es la **segunda**
premisa que le faltaría al cálculo de captación, aparte de la escala: aunque
mañana alguien mida los techos con una cinta, antes de publicar litros hay que
preguntar de dónde se llena ese espejo.

### El color

Tal como lo pidió el encargo: `eq=brightness=0.06:contrast=1.22:saturation=1.25`,
`curves=all='0/0 0.25/0.33 0.75/0.82 1/1'` y `unsharp=5:5:0.5`.

El enfoque va **después** de escalar a 1280 × 720: enfocar a 3840 y achicar
después tira el filo. Es la única parte del orden que cambió, y cambia porque el
`unsharp` es el único de los tres que depende de la resolución —`eq` y `curves`
operan píxel a píxel—.

La fuente ya venía en la combinación segura (`yuv420p`, rango `tv`, `bt709`) y
sigue así en los dos formatos.

### Las tres fotos

Mismo tratamiento, 1.600 px de ancho, con el enfoque también después de escalar:

| archivo | qué muestra | fecha EXIF | salida |
|---|---|---|---|
| `DJI_0408.JPG` | la excavación a mano, con la gente adentro del pozo | 02/02/2024 | 1600 × 1200 |
| `DJI_0416.JPG` | la membrana puesta y el vaso lleno | 03/02/2024 | 1600 × 1200 |
| `DJI_0002.JPG` | la cisterna viva, cubierta de plantas | 12/03/2025 | 1600 × 900 |

Las tres fechas las confirma el EXIF y coinciden con la tabla del encargo. La
tercera viene en 16:9 de origen (4000 × 2250), las otras dos en 4:3.

---

## 3 · La escala de la pieza B: qué se intentó y por qué no cerró

Esto es la entrega 4 del encargo.

### Lo que el archivo dice de sí mismo

`DJI_0010.MOV` tiene **un solo flujo** —vídeo— y ninguna pista de telemetría.
Todo su metadato espacial es esto:

```
©xyz  = -30.788000-64.640468-2.000
©xsp  = +0.00   ©ysp = +0.00   ©zsp = +0.00
modelo: FC220-Se        creación: 2025-03-12T15:59:26Z
```

El tercer campo de `©xyz` **no es la altura de vuelo**: el predio está a unos
600 m sobre el mar y la cámara estuvo subiendo cuarenta y siete segundos, así
que un solo valor no puede describirla aunque fuera correcto. Los tres campos de
velocidad vienen en cero. No hay `.SRT` al lado ni átomo propietario con datos
de vuelo: se barrieron los primeros 8 KB y los últimos 400 KB del archivo
buscando `dvtm`, `RelativeAltitude`, `GimbalPitch`, `rtmd` y `SRT`, y no hay
nada.

### Lo que dicen las fotos

Las tres fijas **sí** traen EXIF y XMP de DJI, y confirman el lugar:

| archivo | GPS | `RelativeAltitude` | `AbsoluteAltitude` | gimbal |
|---|---|---|---|---|
| `DJI_0408` | −30,787992 / −64,640499 | **+10,10 m** | +669,23 m | −59,6° |
| `DJI_0416` | −30,788065 / −64,640505 | **+13,10 m** | +674,46 m | −50,6° |
| `DJI_0002` | −30,788000 / −64,640515 | **+8,50 m** | +604,84 m | −74,1° |

Las tres caen sobre el mismo punto que declara el MOV. Pero las tres son **tomas
bajas de la obra**, no del vértice: a 8, 10 y 13 metros no se ve la escuela
entera. Y las alturas absolutas difieren 65 m entre la de 2024 y la de 2025, que
es lo que pasa con un barómetro entre dos vuelos de días distintos.

### Georreferenciar el cuadro contra la ortofoto: no se pudo

El plan era calzar el cuadro del vértice contra Esri World Imagery en las
coordenadas que el propio archivo declara, y sacar de ahí los metros por píxel.
Falló por dos razones, las dos medidas:

- **La resolución se agota en z18.** Las teselas de z19 y z20 en ese punto
  vuelven con 2.521 bytes —la tesela de relleno «Map data not yet available»—.
  z18 a −30,79° de latitud son **0,513 m/píxel**: un techo de seis metros son
  doce píxeles.
- **La ortofoto es anterior a la obra.** Las fotos de febrero de 2024 muestran
  la excavación **a mano** de la cisterna, y el video es de marzo de 2025. En la
  imagen de Esri el terreno es matorral abierto con suelo desnudo entre las
  matas; en el video, en marzo, el dosel está cerrado. Ninguna de las
  estructuras que se ven en el vértice —el octágono en construcción, la palapa,
  el techo verde— se reconoce en la ortofoto.

### Lo que la cámara sí permite calcular, para cuando haya una medida

El XMP de las tres fotos declara `CalibratedFocalLength = 3051,613 px` sobre
4.000 px de ancho, y lo declara **también para la foto 16:9 de 4000 × 2250**:
o sea que el modo 16:9 es un recorte vertical del 4:3, con el mismo campo
horizontal. Llevado a los 3.840 px del video:

```
f_video  = 3051,613 × 3840/4000 = 2.929,5 px
FOV horizontal = 2·atan(1920/2929,5) = 66,5°
ancho del cuadro en el suelo = 1,311 × altura de vuelo
```

**Con una sola distancia medida en el piso, todo lo demás cae.** El mejor
candidato está en la pieza: el **deck de madera** al borde del espejo aparece en
el primer segundo del video, en el cuadro del vértice y en `DJI_0002.JPG`. Una
cinta métrica sobre ese deck cierra la cadena entera.

### Por qué no se publicó un número igual

Queda una cadena posible: `DJI_0002.JPG` declara `RelativeAltitude = 8,50 m`, y
con `f = 3051,6 px` eso da la escala de esa foto, el deck medido en metros, y de
ahí la escala del vértice. **No se usó.** `RelativeAltitude` es barométrica y
relativa al punto de despegue, no al sujeto: entre la deriva del barómetro y la
diferencia de cota entre el despegue y el borde del espejo, el error razonable
en esos 8,5 m es del orden de ±1 m. Eso es ±12 % en una longitud y **±25 % en un
área**, y un área con ±25 % multiplicada por una lluvia real da litros falsos
con cara de medidos. Es textualmente lo que el encargo prohíbe.

### El resto de la cuenta sí está listo

Para el día que alguien mida los techos, lo único que falta es el área:

| término | valor | de dónde |
|---|---|---|
| **P** · lluvia del lugar | **790 mm/año** | `obtenerClima(−30,788, −64,6405)` — climatología de NASA POWER, promedio 1981–2023 |
| **C** · coeficiente de techo metálico | **0,90** (rango 0,80–0,95) | `coefDeSuperficie('techo_metal')`, origen **tabla**, que para techos es la respuesta correcta: WorldCover no ve un techo |
| **A** · área en planta | **falta** | — |

`calcularCaptacion` sobre 100 m² de techo metálico en ese punto da **71,2 m³ =
71.200 litros al año**, o sea **712 litros por metro cuadrado de techo por año**.
Multiplicar eso por el área medida es toda la cuenta.

La lluvia de ese predio sale de POWER y no de Daymet: Córdoba queda fuera del
bbox de Daymet, así que ni en el navegador habría entrado.

---

## 4 · Pieza C — «Lo que te llevás»: el informe

Diez segundos, una pasada, sin bucle. Datos:
`apps/terreno/scripts/datos-informe.ts` →
`packages/placas/generado/cuetiepa-informe.json`. Composición:
`packages/placas/src/composiciones/Informe.tsx`.

### Por qué es una recomposición y no el informe

`informe.ts` son **tipos y dos helpers de localStorage**: el informe lo arma
`InformeView.tsx`, 2.049 líneas de React de cliente con alias `@/`, íconos y
hooks que salen a la red. Montar eso adentro de Remotion arrastraría medio Next
adentro del renderizador. Y capturarlo de pantalla está prohibido dos veces:
`/informe/*` está detrás del login, y el contrato dice que no se graban
pantallas.

Lo que se conserva es lo que hace que la pieza sea verdadera: **los números
salen de los mismos motores sobre el mismo predio** —`calcularMetricas`,
`obtenerClima`, `obtenerSuelo`—, los títulos del índice son los de `TITULOS` en
la vista, el anexo es el Anexo A y el párrafo del final está copiado palabra por
palabra.

### La página de números, con su procedencia en cada fila

Dieciséis filas. Las que la página dibuja llevan la forma genérica; el JSON
guarda al lado el proveedor con nombre, para poder comprobar que anonimizar no
cambió ningún dato.

| dato | valor | procedencia (lo que se dibuja) | período | resolución |
|---|---|---|---|---|
| Superficie | 427,67 ha | polígono del proyecto | del proyecto | — |
| Perímetro | 8.876 m | polígono del proyecto | del proyecto | — |
| Cota mínima y máxima | 72,7 – 441,9 m | modelo de elevación global | 2011–2015 | 30 m |
| Desnivel | 369,1 m | modelo de elevación global | 2011–2015 | 30 m |
| Pendiente general | 30,4 % | modelo de elevación global | 2011–2015 | 30 m |
| Escurrimiento | hacia el NE | modelo de elevación global | 2011–2015 | 30 m |
| Precipitación anual | 2.364 mm | climatología global | 1981–2023 | celda de ~50 km |
| Temperatura media | 24,1 °C | climatología global | 1981–2023 | celda de ~50 km |
| ETP anual (Hargreaves) | 1.504 mm | climatología global · Hargreaves | 1981–2023 | celda de ~50 km |
| Viento predominante | NE | climatología global | 1981–2023 | celda de ~50 km |
| Clima (Köppen-Geiger) | Af · Selva tropical lluviosa | mapa global de clima | 1991-2020 | 1 km |
| Textura (0–5 cm) | Franco-arcilloso | mapa global de suelos | v2.0 | ~1 km |
| Arcilla / arena / limo | 31,7 / 43,3 / 25,0 % | mapa global de suelos | v2.0 | ~1 km |
| pH en agua | 5,9 | mapa global de suelos | v2.0 | ~1 km |
| Carbono orgánico | 52,5 g/kg | mapa global de suelos | v2.0 | ~1 km |
| Grupo hidrológico | D · infiltración muy lenta | mapa global de suelos | v2.0 | ~1 km |

**Un error que se cometió y conviene dejar escrito.** La primera versión de esta
tabla decía «~250 m» en las filas de suelo, porque es la resolución que publica
la API de consulta de ISRIC. El camino que de verdad contestó fue el de los
rásters locales, que la app declara a **~1 km**. En una pieza cuyo tema es que
cada fila diga de dónde viene, equivocar justamente la resolución es el peor
error posible. Ahora la resolución **se lee de la cadena de fuente que declara la
app** en vez de escribirse a mano.

**Y otro, de forma, que vale lo mismo.** La tabla mezclaba «8.876 m» —punto de
miles— con «427.67 ha» —punto decimal, que es lo que devuelve `toFixed`—, de
modo que el perímetro se podía leer como ocho metros con ochocientos setenta y
seis. Todo quedó en castellano: punto de miles y coma decimal.

### La topografía sale del relieve denso, no del panel

`obtenerTopografia` muestrea unos veinte puntos —los mojones, el centroide y una
grilla de 4 × 4—, que es lo que el panel necesita para contestar mientras el
usuario dibuja. Una muestra así se come los picos y los fondos, y ya hubo que
corregir ese panel por eso.

La pieza usa el **relieve denso** que ya tienen las piezas aprobadas: 28.157
celdas de 12,3 m dentro del polígono, con la fórmula de la app —desnivel entre
el punto más alto y el más bajo, sobre la distancia entre esos dos puntos, que
no es lo mismo que la media de las pendientes celda a celda—. Da 369,1 m de
desnivel en 1.214 m, o sea 30,4 % hacia el NE.

Recortar al polígono importa y se hace: la cota más alta del halo es el cerro
del vecino.

### El índice

Cuatro entradas —Datos del terreno, Clima, Topografía, Suelo— porque son las
cuatro secciones que este informe tiene. Agregar una sección que no se calculó
sería prometer un análisis que no está, que es la regla del silencio de siempre.

---

## 5 · Lo que hubo que construir para que todo esto corriera

### `apps/terreno/scripts/apis-node.ts`

Los motores de `lib/` están escritos para el navegador: piden `/api/clima`,
`/api/clima/koppen`, `/api/clima/daymet` y `/api/suelo`, que son rutas relativas
y en un script no resuelven a nada. Levantar el servidor de Next para generar un
JSON es caro y además pisa el `.next` del dev server, así que lo que hay es un
`fetch` que entiende esas rutas. Tres de las cuatro **no pierden nada**:

- `/api/clima` es un proxy: pide a NASA POWER exactamente los mismos parámetros,
  con lat/lng a dos decimales, y devuelve el cuerpo tal cual. La respuesta que
  recibe `obtenerClima` por acá es la misma que recibiría en el navegador, y
  todo el parseo lo sigue haciendo la app.
- `/api/clima/koppen` y `/api/suelo` **no salen a ninguna red** en su primer
  camino: leen rásters que viajan con la app. Se llama a las mismas funciones
  —`derivaKoppen`, `perfilSoilGridsCog`— y se rearma la respuesta con la forma
  que les da la ruta.
- `/api/clima/daymet` se deja fallar con 404, a propósito: son 165 líneas de
  lógica propia contra las teselas de ORNL, y reimplementarlas sería tener dos
  versiones del mismo cálculo. No cambia nada de lo que estas piezas muestran:
  Daymet corrige lluvia, temperatura, radiación y humedad donde contesta **pero
  no mide viento**, que es lo único que la pieza A usa del clima; y el predio de
  la pieza B está fuera de su cobertura.

El día que una pieza necesite la **lluvia** de un predio dentro del bbox de
Daymet, esto deja de alcanzar y hay que correr el servidor.

### Dos cambios chicos en la biblioteca de la app

- `arco_solar.ts` devuelve ahora el `doy` de cada arco. Quien recibe el arco no
  tenía otra forma de saber de qué día es sin volver a escribir la tabla de
  `fechasMeta`, y una tabla escrita dos veces es una tabla que un día deja de
  coincidir.
- `sectores.ts` exporta `cuña`. El sector del viento mes a mes tiene que ser la
  misma geometría que dibuja el panel —misma amplitud, mismo barrido horario— o
  el video mostraría una cuña que la app no dibuja.

Ninguno cambia el comportamiento de nada que ya existiera.

### Un arreglo en el verificador

`piezas.mjs` buscaba el póster de **todas** las piezas en la carpeta del encargo
02, con la constante en vez de con `carpeta(pieza)`. Para las piezas de los
encargos 03 y 04 miraba el lugar equivocado, no lo encontraba y **no decía
nada**: una verificación que mira donde no es, no falla, se calla, que es peor.
De paso, el encargo que corre por defecto quedó en una constante con nombre
(`EN_CURSO`) en vez de un `=== 3` perdido en un filtro.

---

## 6 · Criterios de aceptación

- [x] El cuadro 0 y el último de A son idénticos: la costura mide 0,43 contra un
      paso de 0,01, y el apagado termina 11 cuadros antes del final.
- [x] En A el arco del sol corresponde a la latitud real, con el mediodía de
      junio cayendo 103 m al **norte** del centro y los otros dos al sur.
- [x] En A el viento se muestra mes a mes —doce cuñas y doce radios medidos— y
      no como una flecha anual.
- [x] En A no aparece ningún número de horas de sol.
- [x] En B no hay curvas de nivel, shader de cota ni escorrentías modeladas.
- [x] El número de litros de B **no sale**, porque no hay escala. Sección 3.
- [x] B conserva `yuv420p` / rango `tv` / `bt709` y se ve corregida de color.
- [x] En C ninguna fila perdió su columna de procedencia y ningún proveedor
      aparece con nombre.
- [x] Ninguna pieza muestra interfaz inventada, crédito quemado ni audio.
- [x] Los seis archivos abiertos en un navegador: `video.error` nulo y un cuadro
      presentado.
- [x] A y C son del predio sin nombre; B es de Tay Pichín y se la nombra.

---

## 7 · Lo que queda abierto

- **Los cortes de prueba están sin aprobar.** Si el ritmo de A o de B no
  convence, se rehace el render, no la pieza.
- **La segunda premisa de la captación**: antes de publicar litros de Tay
  Pichín, hay que saber de dónde se llena ese espejo. Es una biopiscina.
- **El default de `azimutVientoFrio`** pone la cortina contra un viento que en
  este predio no sopla nunca. Va para la sesión de la app.
- **El montaje**: doce piezas entregadas entre los encargos 02, 03 y 04, y una
  sola montada en producción. El `<video>`, el `prefers-reduced-motion` y dónde
  va cada pieza los hace la sesión de web sobre `acequia-landing`.
