# Fase 4, lotes 09 y 10 — las dos turberas que faltaban

Veredicto del 12/11/2026. Encargo:
`_research/_encargos/ENCARGO_FASE_4_LOTES_09_10.md`. Entregas:
`entregas/fichas-indomalaya/09.json` y `10.json`, las dos del 11/11/2026.

**Las dos entran.** Con el `221` de Borneo y el `264` de la península malaya,
las cuatro ecorregiones que RESOLVE llama «peat swamp forests» —y son todas de
Indomalaya— tienen ficha. El módulo de turba estaba calibrado contra cuatro
ecorregiones que tienen turba de refilón, en el 7 al 41 % del polígono, y contra
dos que son turba; ahora son las cuatro.

La entrega llegó **honesta y corta**: `confianza: media` en las dos, `saberes`
vacío, `cultivos` vacío, `modificadores_propuestos` vacío, y en las notas la
declaración explícita de que no se cruzó ninguna base de suelos con el polígono.
Casi todo lo que afirma se verificó palabra por palabra. Lo que se le corrigió
son cinco cosas, y la segunda es la que cambia el producto.

---

## 1. Los polígonos: el 221 no es «las turberas de Borneo»

Es lo primero que hay que saber de esta ficha y la entrega no lo decía, porque
no se puede saber sin medir. El nombre invita a leer el polígono como la suma de
la turba de la isla, y son **veintinueve parches**: la franja costera de todo
Borneo más los dos complejos de lagos interiores, el del Mahakam y el del
Kapuas. Las cúpulas grandes de Kalimantan central están afuera.

Medido contra el FeatureServer de RESOLVE, punto por punto:

| Lugar | Coordenada | ECO_ID |
|---|---|---|
| Sebangau, centro y sur (la turbera continua más grande de Borneo) | −2,45/113,85 y −2,65/113,75 | **273** |
| Sebangau, borde norte | −2,15/113,80 | **281** |
| Mawas, Kalimantan central | −2,30/114,40 | **273** |
| Tanjung Puting NP, norte y este | −2,55/111,80 y −2,90/112,10 | **281** |
| Tanjung Puting NP, noroeste y noreste | −2,60/111,65 y −2,45/112,05 | **219** |
| Tanjung Puting NP, sur | −3,20/111,85 | **221** |
| ex Mega Rice Project | −2,90/114,20 | **221** |
| Lago Melintang (Mahakam) | −0,15/116,43 | **221** |
| Lago Semayang (Mahakam) | −0,18/116,53 | **273** |
| Danau Sentarum (Kapuas) | 0,85/112,10 | **221** |
| Belait, Brunéi | 4,55/114,45 | **221** |
| Maludam NP, Sarawak | 1,62/111,05 | **221** |

Tres consecuencias:

1. **Un predio sobre la turba profunda de Kalimantan central no recibe esta
   ficha**: le toca el `273`, «Southwest Borneo freshwater swamp forests», que ya
   tiene ficha y cuyo texto habla de agua de río y no de turba. Queda anotado
   como pendiente: el 273 debería decir que se queda con las cúpulas que el 221
   no cubre.
2. **El «más de 200 especies de aves» de One Earth es una cifra del parque**, no
   de la ecorregión, porque Tanjung Puting está repartido entre cuatro. La ficha
   lo atribuye al parque y lo dice.
3. **El complejo del Mahakam está partido** entre 221 y 273: Melintang adentro,
   Semayang afuera. Las dos entregas decían «los complejos lacustres interiores
   del Mahakam y del Kapuas» siguiendo a One Earth, que es correcto como
   descripción y no como límite.

El 264, en cambio, es exactamente lo que la fuente describe: **siete parches**,
el mayor en la costa oriental de Pahang (lon 103,13-103,49, lat 2,71-3,51) y el
segundo en la occidental, el norte de Selangor (101,07-101,47 / 3,40-3,81).
Verificados: North Selangor PSF (3,60/101,25) y Pekan PSF (3,20/103,30) dan 264,
y el parche del este de Johor (1,80/104,10) también. El polígono no llega a
Singapur: su `ymin` es 1,652.

Los nombres y las superficies de RESOLVE coinciden con la entrega: 221 «Borneo
peat swamp forests», 67.620 km², bioma 1; 264 «Peninsular Malaysian peat swamp
forests», 3.630 km², bioma 1. Los dos heredan
`resolve_bosque_tropical_humedo`, con su −25 de huerta y su +20 de forestal.

---

## 2. Lo que cambia el producto: el sagú **sí** tiene rendimiento publicado con la napa alta

El encargo preguntaba una sola cosa que valía más que las dos fichas:

> ¿Hay rendimiento publicado de sagú o jelutong sobre turba con la napa por
> encima de los 40 cm?

Las dos entregas contestaron que no. La de Borneo lo escribió así: «No reporta la
profundidad numérica de napa; con drenaje mínimo en turba profunda la madurez no
se alcanzó. Por eso no hay evidencia de rendimiento de sagú con napa mantenida
por encima de 40 cm».

**Hay.** El resumen del trabajo no da la profundidad; la sección de materiales y
métodos la da. Son los tres jardines de Mukah, Sarawak, relevados entre noviembre
de 2004 y enero de 2005, sin una sola aplicación de fertilizante en todo el
ciclo:

| Jardín | Condición | Resultado |
|---|---|---|
| (a) plantado 1989-1994 | turba profunda, drenaje mínimo; «se cavaron canales pero la napa se mantuvo alta todo el año por mala salida del agua» | **20 %** formó tronco a los 10-15 años, **ninguna maduró**; 6-10 hojas, tronco de 1-4 m y 41 cm |
| (b) plantado 1995-1996 | turba profunda, inundación estacional de **más de 1 m** de noviembre a principios de marzo | **menos del 10 %** formó tronco a los 8 años |
| (c) plantado 1985-1992 | turba somera, **sin drenaje artificial**, «la napa estaba unos **10 cm** por debajo de la superficie» | **más del 80 %** formó tronco a los 5-6 años y **maduró a los 10-11**, con 8 m de tronco y 45 cm |

Y lo segundo, que es más importante que lo primero: **lo que separa los tres
jardines no es la napa, es el espesor.** En el jardín que fracasó la napa también
estuvo alta todo el año. La definición que usa el trabajo es la de Sarawak —turba
somera entre 0,5 y 1,5 m, turba profunda por encima de 1,5 m— y el mecanismo lo
escriben los autores: «en la turba somera los nutrientes quedan disponibles desde
el subsuelo mineral de abajo», mientras la turba profunda es «extremadamente pobre
en macro y micronutrientes», con C/N y CEC altos. En turba somera la raíz llega a
la arcilla y come de ahí.

Eso convierte el `forestal: 0` de un «no drenes» en un diseño con condición
medible: **la versión paludícola funciona donde la turba tiene de 0,5 a 1,5 m y
la napa se queda cerca de la superficie, y no funciona sobre la cúpula**, que es
la mayor parte del interior de este polígono. Y es la única evidencia de
rendimiento paludícola **medida adentro** de una de las cuatro turberas: Mukah
(2,8119/112,2912) da 221.

Contexto de rendimiento que el mismo trabajo cita, para que nadie confunda
capacidad con producción: unas **200 kg de almidón seco por palma** como
capacidad; **10 t/ha/año** de almidón en pequeños productores sobre suelo mineral
con mantenimiento mínimo y sin fertilizante (Jong 2000); **25 t/ha/año**
estimadas bajo cultivo intensivo en Batu Pahat (Flach 1984). Avisos del propio
trabajo: el relevamiento se hizo en plena estación lluviosa, «cuando la napa
estaba más alta de lo normal», y son tres bloques de 50 × 50 m por jardín.

### Y aun así, sagú y jelutong siguen sin poder entrar al catálogo

La pregunta 3 del encargo pedía los campos con los que vive un cultivo en
`lib/especies.ts`. La respuesta, después de leer los dos trabajos completos, es
que **no están y no se pueden inventar**: de ninguna de las dos especies hay
temperatura base, GDD de ciclo, temperatura letal ni Kc. Lo que hay es longitud
de ciclo (10-11 años en turba somera), tolerancia a pH, requisito de espesor y,
para el jelutong, **crecimiento en diámetro de 1,3 a 1,9 cm/año** con buen manejo.
Un perenne que madura a los diez años no entra en el motor de cultivos con eso.

Así que las dos fichas se abstienen de `cultivos` entero —que es lo que hace que
la sección caiga al catálogo por clase Köppen, que avisa que es genérico— y lo
que se sabe vive en la razón del modificador forestal, en prosa y con fuente.
Están declaradas en `SIN_CULTIVOS` de `cultivos.test.ts` con el motivo escrito,
que es un motivo nuevo en esa lista: no es que no se cultive ni que la fuente no
abra, es que el motor no tiene cómo representar la especie.

---

## 3. El jelutong es del 280, y eso mejora una ficha que ya estaba

El trabajo de *Dyera polyphylla* es de Jambi, y el Parque Nacional de Berbak
—que es de donde la concesión sacó la semilla, a 25 km— da **280**: la turbera de
Sumatra, cuya razón de `forestal` nombraba al jelutong desde el 06/11/2026 **sin
fuente**. Ahora la tiene, y con ella la advertencia que es el verdadero
contenido del caso:

> La concesión plantó las primeras 60 ha en 1992 y llegó a **1.769 ha** de
> jelutong sobre **turba sin drenar**, con manejo forestal básico, y creció bien.
> En 1997 un incendio de turba se llevó **7.000 ha** de la concesión, incluidas
> las 1.769 de jelutong. En 2003 el fuego volvió sobre unas 5.000 ha y hoy
> quedan **unas 200 ha**.

O sea: la alternativa paludícola es real y no alcanza por sí sola. Lo que decide
no es la tolerancia de la especie al agua sino el fuego y el drenaje del paisaje
de alrededor. Eso está montado en la ficha del 280 y citado en la del 264.

Lo que el trabajo sí da para las dos fichas nuevas es el área nativa: *D.
polyphylla* es nativa de **la península malaya, Sumatra y Borneo**, así que la
especie corresponde a los dos polígonos aunque el ensayo no.

---

## 4. Lo que la entrega trajo mal

Cinco cosas, en orden de gravedad.

1. **Una lista de autores inventada.** El trabajo de jelutong llegó firmado
   «G. Galudra, G. van Noordwijk, A. Suyanto, S. Pradhan, M. Minang». Son cuatro
   autores y son otros: **Tata, Hesti L.; van Noordwijk, Meine; Jasnari;
   Widayati, Atiek** (Crossref y la propia página del editor). De los cinco
   apellidos entregados sólo uno pertenece al trabajo, y con la inicial
   equivocada. Es la primera autoría fabricada de este circuito: hasta ahora la
   regla 5 se rompía por omisión.
2. **La revista de al lado.** La síntesis de Kalimantan llegó como «Nature
   Communications» y está en **Scientific Reports** 16:5496 (20/01/2026), doi
   `10.1038/s41598-026-35152-x`. Las dos son de Nature Portfolio y son revistas
   distintas. Llegó también sin autores: son ocho, Anshari primero.
3. **La conclusión invertida del sagú**, que es el punto 2 de arriba: declaró
   ausente un número que estaba en el trabajo, y le atribuyó el resultado a la
   napa cuando la variable es el espesor.
4. **Un sinónimo montado como nombre aceptado.** *Pandanus atrocarpus* Griff.,
   que One Earth cita como el pandano de la turbera, es sinónimo: el aceptado es
   **Benstonea atrocarpa**, otro género. La entrega lo detectó como cuestión de
   grafía («la fuente lo cita con nombre de género completo; se conserva esa
   grafía») y no como lo que es.
5. **Un binomial puesto sobre un nombre vulgar ambiguo.** One Earth nombra un
   «southern Bornean gibbon» y la entrega le puso *Hylobates muelleri*. ITIS
   llama a *H. muelleri* «Müller's Bornean Gibbon» y a *H. albibarbis* «Bornean
   White-bearded Gibbon», y las medianas de los registros con coordenada de GBIF
   los ponen en −0,83/116,23 el primero y −2,62/111,89 el segundo: este contra
   sur. La ficha no elige: nombra los dos candidatos y dice por qué no elige.

Y una que no es error sino selección: de las siete especies que One Earth da como
restringidas a la turbera del 264, la entrega montó seis y dejó afuera
*Pternandra galeata*. Está adentro.

---

## 5. Lo que costó verificar

**Lo que abrió.** One Earth 221 y 264 (200, 62.344 y 61.606 bytes, con todo lo
que la entrega les atribuye). ERL `10.1088/1748-9326/abb853`, acceso abierto
CC BY, con el texto completo. Scientific Reports por PMC, CC BY, completo. Sago
Palm 14(2):59-64 en J-Stage, **acceso libre**, resumen y PDF de 837 KB con la
tabla y los materiales. Agroforestry Systems en SpringerLink, CC BY, completo.

**Lo que no.** Tres fuentes de la entrega quedaron sin leer y por eso salieron de
las fichas:

- **Kew POWO** (los cuatro taxones): 403 con `curl` y **403 también desde el
  navegador real**, con la interstitial de Cloudflare («Un momento…»). Es la
  misma pared que Hindawi, Wiley y CORE en el lote anterior. La nomenclatura se
  verificó contra el **backbone de GBIF** —seis binomios, con `status`
  ACCEPTED/SYNONYM— y los dos nombres vulgares de los gibones contra **ITIS**.
  Las dos rutas son abiertas y comprobables, y son las que quedaron citadas.
- **IFAD**: la URL no es una página, es una **descarga**. `curl` recibe 403 y el
  navegador abre el diálogo de guardar en vez de navegar. Con el documento se
  fueron sus números: las 880.389 ha de turba y las 270.176 ha de bosque de
  turbera de la península **no están en la ficha**. Es la decisión correcta y
  además no cuesta nada, porque la entrega los usaba sólo para aclarar que no son
  comparables con el polígono; un número que existe nada más que para
  desmentirse es peso muerto.
- **UNDP Malaysia**: 403 con 483 bytes. Mismo trato.

**Y una que está cerrada y se cita como tal.** El trabajo de LiDAR
(`10.1890/15-0017`, Ecological Applications 26(2):587-601) es de pago: Semantic
Scholar lo da `CLOSED` y no hay copia abierta. Todo lo que la ficha le atribuye
—el gradiente de 4 m, la densidad de tallos que sube y el dosel que baja hacia el
interior, 217,7 ± 28,3 Mg C/ha medidos en el terreno y 222,4 ± 24,4 para toda la
cúpula, y el aviso de que la altura de dosel que ve el LiDAR no predice bien la
biomasa porque su CV es 0,08 contra el del diámetro— está textualmente en el
resumen publicado, y el rótulo dice «leído el resumen». Lo que falta, si alguien
consigue el PDF, es **qué cúpula es**: el resumen dice «noroeste de Borneo» y no
la nombra, así que ese sitio es el único de todo el lote que no se pudo resolver
contra el polígono.

**Los sitios de las fuentes de espesor, resueltos uno por uno.** Esto es lo que
convierte «no transferible» en una afirmación medida:

| Sitio | Fuente | ECO_ID |
|---|---|---|
| Mukah, Sarawak (los tres jardines de sagú) | Jong et al. 2006 | **221** |
| Cúpula al sur de Putussibau, Kapuas superior | Ruwaimana et al. 2020 | **221** |
| Rasau Jaya, delta del Kapuas | Ruwaimana et al. 2020 | **221** |
| Danau Sentarum | Ruwaimana 2020 y Anshari 2026 | **221** |
| Lago Siran, Kalimantan Oriental | Anshari et al. 2026 | **221** |
| Ketapang | Ruwaimana et al. 2020 | 322, manglar |
| Gunung Palung NP | Ruwaimana et al. 2020 | 219, selva baja |
| Teluk Keramat | Ruwaimana et al. 2020 | 273, agua dulce |
| Anjongan, Mempawah | Anshari et al. 2026 | 281, brezales |
| Berbak NP / concesión de jelutong, Jambi | Tata et al. 2016 | **280** |

De ahí sale el aviso que lleva la ficha: el promedio de 444 cm en turba costera
contra 774 cm en turba interior **mezcla adentro y afuera** del polígono.

---

## 6. Lo que quedó montado

**`pantanos_turba_borneo`** (ECO_ID 221) y **`pantanos_turba_malaca`** (264), con
los ids en la convención de las dos que ya estaban (`pantanos_turba_sumatra`,
`pantanos_tonle_sap_mekong_turba`) y no los de la entrega (`borneo_turberas`,
`malasia_turberas`). Indomalaya pasa de 41 ECO_ID y 40 fichas a **43 y 42**.

Las dos con `huerta −25` confirmado por oxidación y no por lixiviación, y
`forestal 0` cancelando el +20. Lo propio de cada una:

- **El 221** trae el espesor medido en los dos extremos del gradiente y adentro
  del polígono —2-4 m en el borde de la cúpula de Putussibau y 17-18 m en el
  centro, máximo barrenado de 18 m, media modelada de 5,16 ± 2,66 m sobre
  3.833 km², 2.790 ± 1.440 Mg C/ha, contra 4-6 m en la costa intacta de Rasau
  Jaya y menos de 1 m con 20-30 % de orgánico donde el programa de
  transmigración de los setenta cultivó y quemó—, el **rango de napa** que hace
  accionable el límite de 40 cm del PP 57/2016 indonesio —5 a 50 cm sin drenar,
  60 a 90 cm drenada, o sea que una turba drenada está pasada del límite por
  definición—, la escala de la pérdida —2.800 Mg C por hectárea perdida y
  32,4 Mt C/año de caída de captura en Kalimantan, unas 47,5 veces la caída
  natural de los últimos cuatro mil años— y el dato de agua que importa para
  diseño: **la mitad de la cúpula de Putussibau está por debajo del lecho del
  Kapuas, y el humedal guarda alrededor del doble del volumen de agua que el
  propio río y sus lagos de planicie**. La turba no está al lado del agua: es el
  almacenamiento.
- **El 264** trae lo que tiene abajo, que es lo que lo distingue de las otras
  tres: **arcilla marina sulfídica**. El mismo drenaje que oxida la turba expone
  los sulfuros, que es como se fabrica un suelo sulfatado ácido. Cuánto baja el
  pH, en cuánto tiempo y con qué se corrige no está en ninguna fuente abierta
  que se haya podido leer para este polígono, así que la ficha afirma **la
  dirección del proceso y no su magnitud**, y no rellena con el 12 % de Gleysols
  tiónicos que HWSD v2 da para el 285, que es otra cuenca. Del otro lado, el
  mismo sustrato es donde el sagú está reportado creciendo sano —suelos minerales
  sulfídicos de pH extremadamente bajo en Batu Pahat y en la estación de
  Rampangi—, aunque como observación propia de los autores y no como ensayo.

**La ficha del 280 gana la fuente del jelutong** y su razón de forestal gana el
caso de Jambi con su advertencia de fuego.

**Tests.** `tests/unit/contexto/fichasTurberas0910.test.ts`, 26 tests nuevos con
cada coordenada medida anotada en comentarios: los veredictos de polígono, el
hallazgo del espesor contra la napa —con la frase «el espesor y no el agua»
asegurada, para que nadie vuelva a leer el estudio al revés—, el sustrato
sulfídico, las tres autorías corregidas y la ausencia de POWO, IFAD y UNDP en las
fuentes. Y ocho afirmaciones de conteo puestas al día en cinco archivos, de las
cuales **dos ya estaban mal antes de este lote**: la lista de cobertura de
Indomalaya de `ecorregiones.test.ts` tenía 36 entradas contra 43 del mapa, porque
las cinco que entraron el 05 y el 06/11 nunca se agregaron ahí y el test sólo
comprueba las que nombra; y el título de `fichasSaberes.test.ts` decía 252 contra
254 de su propia aserción. Las dos quedaron ciertas.

---

## 7. Lo que queda abierto de este lote

- **El 273 debería decir que se queda con las cúpulas de Kalimantan central.** Su
  ficha habla de agua de río y es la que recibe a un predio sobre Sebangau o
  Mawas, que son turba profunda. No se tocó acá porque es otro polígono y otra
  entrega; queda anotado.
- **Qué cúpula es la del LiDAR.** Es el único sitio del lote sin resolver contra
  el polígono.
- **El pH después de oxidar los sulfuros en el 264.** Es el número que falta para
  convertir la advertencia en una magnitud, y no está en las fuentes abiertas que
  se consultaron.
- **Los campos de `lib/especies.ts` para sagú y jelutong.** Siguen sin existir, y
  ahora se sabe exactamente cuáles faltan: tbase, GDD de ciclo, temperatura letal
  y Kc. Lo que sí hay está en el punto 2.
- **HWSD v2, SoilGrids y PEATMAP sobre el 221 y el 264.** Las dos fichas declaran
  que no se cruzaron, igual que las otras dos turberas. Es el mismo pendiente que
  arrastra el bloque entero desde el 06/11.
