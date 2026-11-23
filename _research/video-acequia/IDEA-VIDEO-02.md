# Idea para el segundo video de acequia

El primero ya existe: `acequia-completo.mp4`, 72 s, con tu voz, la cama de
fondo y los subtítulos con la palabra encendida. Es un recorrido por la app.
Está bien y no hay que tirarlo.

Esto es una idea para **otro**, que usa lo mismo que ya está grabado —tu voz, los
quince clips de pantalla— pero le mete adentro las once piezas de Remotion que
se renderizaron después, en los encargos 02, 03 y 04. Esas piezas no existían
cuando se montó el primero.

> **Esta idea ya está armada y se puede mirar.** El animático de §8 existe, en
> las dos variantes, y con las tres frases de §6 adentro —Jonatan las grabó el
> 22/11/2026—. Eso corre algunos números de acá: el video dura 88 s y no 75, y
> la bisagra cae en el segundo 30,4 y no en el 27,3. Lo que cambió, y por qué,
> está en `ANIMATICO-02.md`. Este documento queda como estaba: es la idea, no
> el corte.

---

## 1 · Lo que hay, hoy

### La voz

Una toma, veinte unidades de habla, **55,2 s netos a 1,1×**. Es una historia en
primera persona y tiene forma de tres actos sin que nadie se lo haya propuesto:

| unidades | segundos de video | qué dice |
|---|---|---|
| U01 – U07 | 0,5 → 26,3 | **el antes.** Quince años diseñando; cada dato lo iba a buscar a un lado distinto. «Y así sin parar.» |
| U08 – U09 | 27,3 → 36,2 | **el giro.** «Por eso hice acequia, que recopila los datos y los cruza.» |
| U10 – U16 | 37,1 → 54,7 | **el diseño.** Agua, represa, servicios, caminos, cortina, animal. |
| U17 – U20 | 55,4 → 72,2 | **el informe, la honestidad y el cierre.** «Empezar no cuesta nada.» |

### Las imágenes

Dos familias, y la diferencia entre ellas es lo que hace posible esta idea:

| | captura de pantalla | piezas de Remotion |
|---|---|---|
| qué muestra | **el producto**: paneles, botones, el cursor, alguien trabajando | **el dato**: el terreno leído, sin interfaz |
| de dónde sale | 15 clips, `videoapp-1/cortes/` (23 cortes listos) | 11 piezas, `portada animacion/salida-encargo-0{2,3,4}` |
| cómo se ve | 1080p, cadencia real de 21 a 30 fps, con la banda tapando la barra de Screenity | 1280×720, 30 fps clavados, sin nada que tapar |
| predio | 31,1494 ha en Burruyacu, Tucumán | 417 ha en Cuetiepia, 17° N · y la obra, Tay Pichín |

Las piezas disponibles: `portada` 13 s · `portada-giro` 27 s (13 quieto + giro
de 12) · seis `lectura-*` de 12 s · tres `lazo-*` de 6 s · `mesa-de-trabajo`
16 s · `sol-y-viento` 18 s · `obra` 14 s · `informe` 10 s.

---

## 2 · El hallazgo: en el primer video la imagen contradice a la voz

Veintiséis segundos —el 36 % del video— son el **antes**: «la topografía la
sacaba de un programa, el clima de dos o tres plataformas, el suelo de donde
encontrara». Y en pantalla, mientras tanto, está acequia entregando esos mismos
datos en un panel.

El tiempo verbal no coincide. La voz dice *iba a buscar* y la imagen dice *acá
está*. No se nota como error, se nota como que el principio es largo — que es
exactamente lo que se siente hoy.

**Eso es lo que arregla el video nuevo**, y no hace falta volver a grabar nada
para arreglarlo: hace falta otra imagen para esos veintiséis segundos.

---

## 3 · La idea

**Título de trabajo: «Antes de acequia».**

Una regla, y de ella sale todo lo demás:

> El **cine** cuenta lo que no se puede filmar —el pasado, la idea, el terreno
> entero— y la **captura** cobra cada promesa que la voz hace sobre la app.

En limpio, acto por acto:

| acto | quién manda la imagen | por qué |
|---|---|---|
| 1 · el antes | cine | no hay nada que filmar: es un recuerdo |
| 2 · el giro | cine → captura | la idea, y acto seguido la idea funcionando |
| 3 · el diseño | **captura** | acá la voz promete cosas concretas y hay que mostrarlas en la app, con el cursor adentro |
| 4 · el informe | las dos | el PDF en cine, la advertencia en la app |

El corte más importante del video es uno solo: **el segundo 27,3**, cuando
decís «Por eso hice acequia». Antes de ahí el desorden; después, el predio
limpio. Si ese corte pega, el video funciona.

---

## 4 · El plano por plano

Los segundos salen de donde cae cada unidad de voz, que ya está medido en
`tiempos.py`. **La voz manda y la imagen se acomoda**, igual que en el primero.

| desde | dur. | qué se ve | de dónde | voz |
|---|---|---|---|---|
| 0,0 | 0,5 | negro | — | — |
| 0,5 | 11,4 | **la obra**: la excavación, la membrana, la cisterna viva, con sus fechas | `obra.mp4` (cine) | U01 · U02 — «Desde hace quince años…» |
| 12,6 | 2,9 | la ortofoto cruda, sin leer. Terreno pelado | `crudo` de `ParCrudoLeido` (cine) | U03 — «se me iba más tiempo…» |
| 16,1 | 10,2 | **«Las ocho ventanas»** — pieza nueva, ver §5 | cine | U04 · U05 · U06 · U07 — la letanía del antes |
| 27,3 | 2,9 | las ventanas se caen y queda **el predio**, en 3D, quieto | `portada.mp4` (cine) | U08 — «Por eso hice acequia» |
| 30,2 | 3,0 | las cuatro capas encendiéndose una atrás de otra | `lectura-secuencia` (cine) | U09 — «Lluvia, suelo, pendiente…» |
| 33,2 | 3,0 | alguien prendiendo y apagando capas, con la fuente citada abajo | `22b-capas-shader` (app) | U09 — «…en un solo lugar» |
| 37,1 | 2,2 | botón → «Analizando relieve…» → el keypoint a 823 m | `11-keyline` (app) | U10 — «ya puedo diseñar» |
| 39,6 | 1,7 | el agua corriendo sobre el relieve | `lectura-agua` (cine) | U11 — «dónde va el agua» |
| 41,3 | 1,9 | los seis swales puestos, con el panel dimensionándolos | `12-swales` (app) | (sigue la pausa de U11) |
| 43,2 | 1,8 | los cuatro sitios de represa con sus litros | `13-represa` (app) | U12 — «y cuánto junta» |
| 45,5 | 1,5 | el panel de red de servicios | `11b-servicios` (app) | U13 |
| 47,5 | 1,2 | el perfil de elevación dibujándose sobre el camino | `14-camino-perfil` (app) | U14 |
| 49,1 | 1,3 | la cortina puesta con su franja | `15-cortina` (app) | U15 — «dónde va la cortina» |
| 50,4 | 1,4 | 28 potreros, 1,11 ha, 533 % de balance | `16a-potreros-panel` (app) | U15 — «dónde entra el animal» |
| 52,2 | 2,5 | lo que el terreno **no** admite, y las bandas de caminata | `mesa-de-trabajo`, acto 04 (cine) | U16 — «entre otras utilidades» |
| 55,4 | 2,5 | la tapa del informe dibujándose sola | `informe.mp4` (cine) | U17 — «me entrega un informe» |
| 57,9 | 2,0 | el panel de salud del cálculo | `20-salud-del-calculo` (app) | U17 — «y hasta me avisa» |
| 59,9 | 3,0 | **«La observación»** — pieza nueva, ver §5 | cine | (pausa de 3 s) |
| 62,9 | 6,5 | el predio dando la vuelta completa, con el shader prendido | `portada-giro`, el tramo del giro (cine) | U18 · U19 |
| 69,9 | 5,0 | el cierre de marca | `AperturaAppClara` | U20 — «Empezar no cuesta nada» |

**Dura 75 s.** Tres más que el primero, y los tres se los lleva el cierre, que
hoy queda apretado contra el final de la voz.

El reparto: **unos 50 s de cine y 25 de app**. Puede sonar al revés de lo que
pide un video de producto, pero los once segundos del principio no son
animación: son tu obra construida, con las fotos fechadas. Y los diecisiete del
acto 3 —donde la voz promete siete cosas— son app pura, con el cursor adentro.
Si al verlo te parece que falta producto, hay una variante y es una línea:
**el acto 1 en captura** (el descenso y el perímetro, como hoy) y las ventanas
reducidas a cuatro segundos.

---

## 5 · Las piezas nuevas que haría

Cinco. Las tres primeras son las que el montaje de arriba necesita; las dos
últimas son para la versión larga y para las redes.

### A · «Las ocho ventanas» — 10 s · la que arregla el acto 1

Las fuentes apareciendo **de a una, cada una en su propio recuadro**, con su
nombre real, su resolución y su fecha, desalineadas, superponiéndose, sin
hablarse entre ellas:

> Copernicus GLO-30 · ~30 m — NASA POWER · 1991-2020 — Köppen Beck · 1 km —
> ISRIC SoilGrids v2.0 · 250 m — ESA WorldCover · 10 m — RESOLVE Ecoregions ·
> 2017 — Open-Meteo / ERA5 — GBIF

Al final hay ocho ventanas encimadas y ninguna sabe de las otras. Eso es
exactamente lo que dice la voz, y es lo que hacía falta antes de acequia.

Después, en el segundo 27,3, **se caen todas juntas** y abajo está el predio.

El dato es real y no hay que inventarlo: es el **anexo de fuentes del informe**,
el mismo que ya se ve en el clip 12. Es tipografía y tiempos, así que es la
pieza más barata de las cinco.

### B · «La observación» — 3 s · la que hoy no se lee

El beat más fuerte del video —la app avisando que el número no es confiable—
hoy es una captura de un panel chico. En el horizontal se lee con esfuerzo; en
el vertical, no se lee.

Pasado a placa, con el texto que la app realmente devuelve:

> **Confianza media · 1 observación**
> Cuenca de 282 ha: fuera del rango de Kirpich.
> Subestima el tiempo de concentración y **sobreestima** el caudal pico.

Entra justo en los tres segundos de silencio que dejaste después de «cuándo no
confiar». Hoy esos tres segundos están vacíos.

### C · «El arco que se da vuelta» — 8 s · el argumento que no se copia

`sol-y-viento` ya demuestra algo raro en el predio de 17° N: **el arco de junio
pasa por el norte**, y se ve, porque el trazo abulta para arriba mientras los
otros dos abultan para abajo. No es un efecto: es `declinación > latitud`.

La pieza nueva es esa misma composición **corrida dos veces, lado a lado**: el
predio de Tucumán a 26° S y el de 17° N. Los dos arcos reales, calculados por
`calcularArcoSolar`, uno espejo del otro.

Ningún competidor con una plantilla puede mostrar eso, porque una plantilla
tiene el sol de un hemisferio solo. Cuesta una corrida de
`datos-sol-viento.ts` sobre las coordenadas de Tucumán, que están en el
metraje.

**Necesita una frase tuya grabada** (ver §6). Si no se graba, no entra: la
regla de que nada se muestra mientras la voz dice otra cosa se respeta.

### D · «La ficha del lugar» — un rótulo, no una pieza

Un lower third con dato real que aparece sobre cada pieza de cine:

> PREDIO REAL · 417 ha · 17° N · Copernicus GLO-30

Resuelve un problema que si no se nota mal: **son dos predios distintos**, uno
de 31 ha en Tucumán y otro de 417 en Cuetiepia, y el video salta de uno al otro.
Disimularlo no se puede —el terreno es visiblemente otro—, así que conviene
decirlo. Y dicho, deja de ser un error de continuidad y pasa a ser el argumento:
la misma lectura, dos lugares que no se parecen en nada.

Los nombres no salen. Tay Pichín sí, que está autorizado desde el 27/10/2026.

### E · «El mismo cuadro, leído» — 4 s · para las redes

`ParCrudoLeido` ya existe: la ortofoto cruda y la ortofoto leída, el mismo
encuadre. Hoy es una pieza de 1600×900 para la landing. Como **cortina de
apertura de un vertical** —dos segundos de nada, un barrido, el terreno con
todo encendido— es la tesis entera en cuatro segundos y sin una palabra.

---

## 6 · Lo que hace falta de tu lado

**Tres frases para grabar**, si querés el argumento del hemisferio y el de la
obra. Son veinte segundos de grabación y se graban en una sentada, con el mismo
micrófono y la misma distancia que la toma anterior:

1. *«Esto lo construimos nosotros, con las mismas cuentas que hace la app.»*
   — para los once segundos de la obra, que hoy quedarían mudos de contenido
   propio (la voz ahí habla de otra cosa).
2. *«Y funciona en cualquier parte del mundo. Acá el sol de verano pasa por el
   norte, y la app lo sabe porque lo calcula, no porque se lo dijeron.»*
   — para la pieza C.
3. *«Cada número dice de dónde salió y de qué fecha es.»*
   — opcional, para el anexo de fuentes.

Si no se graban, el video de §4 **se arma igual y completo**: las tres frases
son para la versión larga, no para esta.

**La música sigue pendiente.** Es lo mismo que en el primero: la cama
sintetizada funciona y se reemplaza dejando un `musica.mp3` en
`videoapp-1\audio en off\`, sin tocar ningún script. Un tema con licencia sigue
siendo lo que más cambiaría el resultado.

---

## 7 · Los verticales

La misma estructura cortada en el giro, que es donde el video tiene su gancho:

- **30 s** — arranca en «Por eso hice acequia» (U08), entra el predio, las
  cuatro capas, cuatro planos del acto 3, la observación y el cierre.
- **15 s** — `ParCrudoLeido` de cortina, `lectura-secuencia`, «La observación»,
  cierre. Sin acto 1 y sin acto 3: en quince segundos no entra una historia,
  entra una tesis.

El recorte dirigido plano por plano ya está resuelto y medido en `MONTAJE.md`:
cuando el dato está en el panel el recorte va al panel, cuando se dibuja en el
mapa va al mapa. **Las piezas de cine no se recortan**: se renderizan de nuevo
en 1080×1920, que sale gratis porque son composiciones, no metraje.

---

## 8 · Lo que propongo hacer primero

Un **animático de 75 segundos**: el montaje de §4 armado con lo que ya existe
—las once piezas, los veintitrés cortes, tu voz— y con las tres piezas nuevas
reemplazadas por un cartel negro del largo exacto que les toca.

Se mira, se discute y recién después se renderiza algo. Es media jornada de
máquina y no compromete ninguna decisión: si el corte del segundo 27,3 no pega,
se ve ahí y no después de renderizar tres piezas.
