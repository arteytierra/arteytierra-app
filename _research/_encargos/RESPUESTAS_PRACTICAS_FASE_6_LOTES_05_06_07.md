# Respuestas — prácticas, fase 6, lotes 05, 06 y 07

Entrega del 01/11/2026, tres lotes de seis entradas. **Entraron 14 de 18**, y
quedaron montadas como **15 entradas sobre 11 fichas**: el subak balinés cruza el
límite entre dos polígonos y se escribió una vez en cada ficha.

El número que conviene retener es otro. En el lote anterior **una** de once
entradas cayó en la ficha que la entrega proponía; en este, **nueve de catorce**.
No es suerte y vale saber por qué, porque se repite: este lote nombró **aldea y
distrito** en lugar de región. Donde el `lugar` decía "aldea de Horsik, distrito
de Ajibata" o "San Fernando, Bukidnon", resolver el polígono llevó un minuto. En
el lote anterior, donde decía "Región de Mulshi" u "once distritos del estado",
hubo que sondear límites a mano y en un caso no alcanzó.

## Cómo se verificó

Para cada entrada: Nominatim sobre el lugar declarado, consulta del ECO_ID al
FeatureServer público de RESOLVE —el mismo que usa `app/api/bioma/route.ts`— y
búsqueda de ese ECO_ID en las tablas `ecorregiones*.ts`. Donde el punto cayó
cerca de un límite se agregaron puntos: Horsik se sondeó con siete, el distrito
de Ajibata con tres, Soreang y Mulshi con cuatro cada uno, y el archipiélago de
Jambelí con tres.

Dos avisos nuevos sobre RESOLVE, los dos medidos:

- **Nominatim no encuentra todo lo que tiene.** "Horsik, Ajibata, Toba Samosir,
  North Sumatra, Indonesia" no devolvió nada y "Horsik" solo devolvió el nodo de
  la aldea al primer intento. Si la consulta larga falla, hay que probar el nombre
  pelado antes de dar el lugar por inhallable.
- **Un punto costero puede estar afuera de todo polígono.** Baybay, Leyte
  devolvió vacío en seis consultas repartidas en dos tandas, y sus barangays
  Caridad, Mailhi y Patag dan 247 sin problema. No es el error intermitente que
  anotamos la vez pasada: es un centroide que cae en el agua.

## Las 14 que entraron

| Ficha montada | Práctica | ECO_ID | La entrega proponía |
|---|---|---|---|
| `sumatra_montano` | Café arábica con semilla del propio cafetal | 279 | `pinar_toba` |
| `java_bali_montano` | Talun-kebun, el barbecho de bambú | 288 | `java_occidental_bajo` |
| `java_bali_montano` | Subak, desde el lago del cráter | 229 | `java_oriental_bali_bajo` |
| `java_oriental_bali_bajo` | Subak, el templo de paso del tramo bajo | 230 | **la misma** |
| `pantanos_borneo_suroeste` | Arroz local en el pantano de marea | 273 | **la misma** |
| `luzon_bajo` | La estación manda: el mar y el bosque | 241 | `luzon_montano` |
| `mindoro` | Roza de media hectárea, raíces antes del fuego | 248 | **la misma** |
| `mindanao_montano` | Guardar la diversidad del arroz de secano | 246 | **la misma** |
| `mindanao_visayas_oriental` | Abacá a la sombra | 247 | **la misma** |
| `california_klamath_sierra_valle` | La quema de otoño que dejaba afuera lo productivo | 423 | `chaparral_californiano` |
| `california_klamath_sierra_valle` | Sidra de manzanita en mortero de roca | 423 | `chaparral_californiano` |
| `manglares_pacifico_suramericano` | Custodia: cierres rotativos de 6 a 30 días | 615 | **la misma** |
| `manglares_pacifico_suramericano` | Reforestar y vigilar como condición de la tenencia | 615 | **la misma** |
| `galapagos_matorral_xerico` | Plantar nativas en los sitios más arruinados | 601 | **la misma** |
| `galapagos_matorral_xerico` | Caja de captación de agua para el plantín | 601 | **la misma** |

Seis fichas que estaban en cero abrieron: `java_bali_montano`,
`java_oriental_bali_bajo`, `pantanos_borneo_suroeste`, `mindoro`,
`mindanao_montano` y `mindanao_visayas_oriental`. Indomalaya baja de 21 fichas sin
prácticas a 15.

## Las cinco mudanzas, y por qué los nombres engañan

**`pinar_toba` otra vez, y esta vez es grave.** Es el segundo lote consecutivo en
que la ficha se propone y no corresponde. El 305 —Sumatran tropical pine forests—
es el pinar de Kerinci, 400 km al sur del lago; la orilla del lago Toba es 279,
montano. Horsik da 279 en siete puntos, Parapat y Balige también. **La ficha que
se llama como el lago no contiene las orillas del lago.** Mientras el nombre siga
así, cualquier práctica del Toba va a venir propuesta ahí.

**`chaparral_californiano` es sólo el chaparral *montano*.** La ficha mapea
únicamente el 424. El chaparral del interior —el 423, que es donde están las
Coast Ranges pomo y el pie de la Sierra en North Fork— cae en
`california_klamath_sierra_valle`, junto con el 357, el 366, el 385 y el 425. Las
dos entradas de chaparral se movieron ahí, y la ficha que se llama "chaparral
californiano" sigue con una sola práctica.

**`luzon_montano` no es la Sierra Madre habitada.** El test del primer lote ya
decía que el pendiente era "relevar la Sierra Madre, no mudar Ifugao", y la
entrega hizo exactamente eso: relevó la Sierra Madre. Pero los asentamientos agta
están en los ríos y la costa, y San Mariano, Palanan, Divilacan y Maconacon dan
todos **241**, selva baja. El 240 —el montano de Luzón— sigue en cero, y lo que
falta es el interior de altura, no el parque.

**`java_occidental_bajo` no incluye Soreang.** Sadu, Soreang, Pasirjambu y
Banjaran dan 288, montano de Java occidental. El 289, que es el Java occidental
bajo de verdad, sigue en cero.

**El subak no es de una ficha.** Jatiluwih y Wongaya Gede (Batukaru) y el lago
Batur dan 229; Mengwi y Pejeng dan 230. El sistema baja cruzando el límite, así
que la entrada se escribió dos veces, y cada una nombra los componentes inscritos
que caen en su polígono: arriba, Pura Ulun Danu Batur y las terrazas de Catur
Angga Batukaru; abajo, el tramo bajo del Pakerisan y el templo real de Taman
Ayun.

## Un hallazgo sobre el catálogo, no sobre la entrega

`java_bali_montano` cubre el 229 y el 288 **a propósito** —está escrito en el
encabezado de `ecorregionesIndomalaya.ts`—, y la consecuencia recién se ve ahora
que la ficha tiene prácticas: adentro de una misma ficha conviven el talún de
bambú de Soreang y el subak de Batukaru, a mil kilómetros uno del otro, con
climas y culturas agrícolas distintos. Pasa lo mismo, y peor, con
`california_klamath_sierra_valle`, que lumpea cinco ecorregiones y ahora carga la
quema pomo de las Coast Ranges junto con la pesca yurok del bajo Klamath y la
sidra de manzanita del pie de la Sierra.

No se tocó nada: partir una ficha es trabajo de fase 4 y los catálogos se
regeneran desde los paquetes de `_research/`, así que la división tendría que
hacerse río arriba. Queda anotado como pendiente con dos candidatos claros:
`java_bali_montano` → occidental y oriental, y `california_klamath_sierra_valle`
→ al menos separar el chaparral del interior de la sierra y del valle.

## Las 4 que no entraron, y por qué

**Dos son contrato, no fuente**, y esto es nuevo en la cadena de encargos:

- *Pantano lebak de Pampangan* (`pantanos_sumatra`). La fuente abre, es un
  artículo revisado y dice lo que la entrada afirma, pero lo dice en modo
  **recomendación**: "suggested management scheme for…", "can be managed for…",
  "primarily on water conservation by preparing fish pool". Describe la tipología
  del pantano y después propone qué habría que hacer. El contrato pide **qué se
  hizo acá y cuándo**; un esquema de manejo propuesto por los autores no es una
  práctica. La propia entrega lo había advertido en su `nota`, y eso está bien:
  la nota sirvió. Además, Pampangan y Ulak Depati dan **280** —turbera— que no
  tiene ficha, mientras `pantanos_sumatra` es el 277.
- *Café de Kintamani* (`java_bali_montano`). Catur y Kintamani dan 229, así que
  la ficha propuesta era la correcta. Lo que falla es el contenido: el trabajo es
  un estudio de **ingresos y viabilidad** —17.508.497 IDR/ha/año, R/C 4,40, B/C
  3,40, punto de equilibrio en 96,81 kg/ha— y de práctica agrícola dice una sola
  cosa: que el café se cultiva por encima de los 900 m y que el agroecosistema es
  apto. Eso es un número de rentabilidad y un rango altitudinal, no una práctica
  con mecanismo. **Si sirve, sirve en la capa de aptitud de cultivos, no acá.**

**Una por ficha inexistente**, como el manglar de Sundarbans del lote anterior:

- *Phad del noroeste de Maharashtra* (`decan_central_hardwickia`). Dhule, Sakri,
  Malegaon y Jalgaon dan **315**, Deccan thorn scrub forests, sin ficha;
  `decan_central_hardwickia` es el 290. Y por si quedara duda, el host de la
  fuente —`eacpm.gov.in`— no responde: ni la raíz, ni por http, ni con www, con
  timeout de conexión en todos los casos. No hay que volver a mandarla hasta que
  exista ficha para el 315.

**Una por fuente ilegible**, que es una variante nueva del problema:

- *Prácticas de los Ati y Suludnon de Iloilo* (`negros_panay`). Calinog,
  Lambunao e Iloilo dan 231, la ficha propuesta. La URL **abre**, y ahí está la
  trampa: es la ficha del repositorio institucional de UPLB y **corta el resumen
  justo antes de los hallazgos** ("…documented through key informant interviews,
  focus group discussions and farm visits the indigenous knowledge for climate
  change adaptation of"). Todo lo que la entrada afirma está después de ese
  corte. La copia abierta del artículo existe —JESAM 22(1):87-98, en
  `ovcre.uplb.edu.ph`— pero está detrás de una verificación anti-bot que no se
  levanta, ni con curl ni en un navegador de verdad, y eso no se fuerza. La
  práctica probablemente esté bien; falta una URL donde se lean los resultados.

## Una fuente reemplazada

El abacá de Leyte venía citado con la caracterización de los agroecosistemas de
2011, que está en *Journal of Natural Fibers* y es de pago. Se reemplazó por
**Bande, Asio, Sauerborn y Römheld (2016), *Annals of Tropical Research* 38(1):
19-35**, del mismo grupo, abierta, y mucho mejor para lo que acequia necesita:
mide **cuánta luz pasa**. Bajo cocal llega el 33 % arriba del abacá y el 11 %
debajo de su propio dosel; bajo plantación de nativas, el 36 % y el 9 %. Y la
fracción que transmite un cocotero depende de la edad de la palma: alrededor del
20 % entre los 8 y los 25 años, cerca del 50 % a los 40. Un cocal viejo deja luz
suficiente para el abacá y uno joven no, que es una regla de diseño y no una
observación.

## El muestreo obligatorio

`validar-entrega-gpt.mjs` no marcó ni un error de forma en los siete lotes de la
carpeta y sorteó cinco fuentes. Tres ya se habían abierto en la ronda anterior.
Las dos nuevas:

1. `pantanos_borneo_suroeste` → **el PDF es un escaneo sin capa de texto** (10,9
   MB y 817 caracteres extraíbles, todos números de página). El resumen se leyó
   en la página del artículo, que es la URL que quedó citada, y **aguanta y
   agrega**: la clave que la entrada ahora dice es que el Estado viene gastando
   desde los años setenta en obras de intensificación y "the success story is very
   limited", y que el rechazo del paquete tiene dos razones de diseño —baja el
   costo y libera tiempo para el resto de la chacra—. Los tres casos están tomados
   en desbordes **tipo B, C y D**, la clasificación local según hasta dónde llega
   la marea.
2. `decan_central_hardwickia` → **el host no responde.** Entrada rechazada por
   otro motivo igual.

## Y un detalle de proceso que ya falló una vez

El anexo de ids se generó en el commit anterior **antes** de montar las prácticas
del lote 02-04, así que quedó marcando 203 fichas con práctica cuando ya eran 212,
y nueve fichas de Indomalaya aparecían sin ✓ teniéndolo. Se regeneró acá y quedó
en 218. **El anexo se regenera en el mismo commit que monta prácticas, nunca
antes**: `node _research/generar-anexo-fichas.mjs` y la copia a `reglas/`.

## Reglas nuevas para el encargo

1. **Un estudio de ingresos no es una práctica.** Rentabilidad, R/C, punto de
   equilibrio y rango altitudinal son datos de aptitud, no de manejo. Si la
   fuente no dice *qué se hace y cómo*, la entrada no entra por más que la ficha
   sea la correcta.
2. **Una recomendación de los autores tampoco.** "Se sugiere", "convendría",
   "puede manejarse" describen lo que el autor propone, no lo que se hizo. El
   ancla de esta capa es el período: si no se puede fechar, no hay entrada.
3. **La URL tiene que mostrar los hallazgos, no sólo existir.** Una ficha de
   repositorio que corta el resumen antes de los resultados abre y no sirve: es
   la misma falla que el índice de revista del lote anterior, con otra cara.
4. **Nombrar aldea y distrito funcionó.** Nueve de catorce contra una de once.
   Queda como la regla que más rinde de todas.

## Lo que queda de Indomalaya

De las 21 que quedaban, abrieron 6. Quedan **15**:

- **Vuelven a pedirse con otra fuente** (la práctica ya está identificada):
  `ghats_norte_montano` (soppinabetta de Sringeri), `ghats_sur_montano` (pastoreo
  Toda del Nilgiri o el arroz de Wayanad), `pantanos_tonle_sap` (arroz de
  recesión), `ghats_norte_deciduo` (devrai de Mulshi, con la aldea o la coordenada
  del bosque sagrado), y ahora `negros_panay` (los Ati y Suludnon de Iloilo, con
  una URL donde se lean los resultados).
- **Esperan ficha, no fuente**: el manglar habitado de Sundarbans (323), la zona
  seca del Irrawaddy (294) y ahora el matorral espinoso del Decán (315), que es
  donde cae el phad.
- **Sin relevar todavía**: `ghats_sur_deciduo`, `sri_lanka_montano`,
  `gangetica_superior`, `irrawaddy_deciduo`, `chao_phraya_deciduo`,
  `pantanos_sumatra` (pero el lebak de Pampangan no sirve: cae en el 280),
  `pinar_toba` (el pinar de **Kerinci**, no el lago), `java_occidental_bajo` (el
  **289**: Bogor, Sukabumi, la costa norte; no Soreang) y `luzon_montano` (el
  interior de altura de la Sierra Madre y Zambales, no los asentamientos).

Los tres últimos conviene pedirlos con el polígono dicho en la consigna, porque
el nombre de la ficha lleva al lugar equivocado.
