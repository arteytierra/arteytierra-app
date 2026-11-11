# Veredicto — prácticas, fase 6, repesca (lote 11)

Entrega del 11/11/2026. Seis blancos pedidos, cuatro entradas y dos vacías
declaradas. **Entraron tres** y por primera vez en esta fase **ninguna se cayó
por la fuente**: las cuatro fuentes dicen lo que la entrega dice, y las dos que
no entraron lo hicieron una por polígono y la otra por un host que ya no existe.

| id propuesto | lugar | veredicto | dónde quedó |
|---|---|---|---|
| `ghats_norte_montano` | arboleda Kolavade Rai, Mulshi, Pune | **montada** | 254, ficha que estaba en cero |
| `ghats_norte_deciduo` | aldea de Paud, Mulshi, Pune | **montada** | 253, ficha que estaba en cero |
| `ghats_sur_deciduo` | arrozales tribales de Wayanad | **montada, movida** | 271 `ghats_sur_montano`, que pasa de 1 entrada a 2 |
| `pinar_toba` | Kayu Aro Barat, Kerinci, Jambi | **no entra** | el lugar da 279 y el host de la fuente no resuelve |

El catálogo pasa de **457 entradas sobre 225 fichas a 460 sobre 227**, y
Indomalaya baja de **13 fichas sin ninguna práctica a 11**, de 38.

---

## 1. Las dos que abren ficha, y lo que las fuentes dieron de más

Las dos salen del mismo taluka —Mulshi, distrito de Pune— y las separa la cresta
de los Ghats. Es el mejor resultado posible de un encargo que pedía aldea y
coordenada en vez de región.

**El devrai de Kolavade → 254.** La coordenada que la entrega declaró
(18°27′18,66″ N, 73°33′30,93″ E) **no es una geocodificación nuestra**: es la que
la tabla 1 del artículo publica para esa arboleda, con su deidad (Bhiravnath) y su
estado (*threatened*). Resuelve 254. Y la cita textual está donde la entrega dijo:
«In Tamini, Kharavade, and Kolavade villages, the local people have established
temple trusts», seguida de que el fideicomiso es el responsable de implementar las
reglas locales.

Lo que apareció al leer el trabajo entero y la entrega no había subido:

- **La regla es oral y colectiva**, y eso cambia cómo se lee el sitio: «The
  knowledge of the resources that can be collected from the groves and those that
  are considered taboo is spread from one person to another without any written
  rules», y la saben no sólo los sacerdotes sino la mayoría de los vecinos.
- **El uso está medido sobre los quince devrai**, no afirmado: en nueve se junta
  rama caída seca como leña, en seis se pastorea, en ocho se juntan frutos de
  *Mangifera indica* y *Artocarpus heterophyllus*, de agosto a octubre se
  sobrecosechan flores de *Curcuma elata* para el Ganesh y en dos se extrae toddy.
  Reparto de estado: 40 % protegidos, 40 % amenazados, 20 % destruidos.
- **Dos observaciones que un relevamiento de territorio puede usar directo.** Los
  parches no están medidos ni demarcados por el servicio forestal, la
  administración de rentas ni el panchayat, así que el límite es flexible y lo
  marca el uso. Y los devrai «are frequently associated with an emergent stream
  and have better soil as compared to adjacent areas»: **el devrai no está donde
  sobró lugar, está donde está el agua.** Eso es exactamente lo que acequia lee.
- **El retroceso está fechado y tiene mecanismo.** En las dos décadas anteriores
  al estudio se vendieron grandes paños a especuladores por la suba del precio de
  la tierra, «with a consequent loss of protective sentiments»; y los sacerdotes
  jóvenes dejaron de hacer la ceremonia del grano (Kaul) con la que antes se
  negaba permiso para talar, porque creen que no tienen el poder de la generación
  anterior.

**El riego de Paud → 253.** Era el sexto blanco, el único que el encargo pidió sin
tener candidata, porque `ghats_norte_deciduo` se había quedado sin ninguna cuando
la coordenada de Kolavade mudó esa entrada del 253 al 254. La cita está textual
—«Many farmers have invested in hydraulic systems through which water is drawn
from the river or pumped from groundwater resources and used for irrigation»— y
también los dos datos de contexto: Paud son 4.000 habitantes 30 km al oeste de
Pune, al sur del río Mula, con el 18 % de los residentes en el campo en 2011, y
las pautas de cultivo «have changed significantly over the last 50 years».

Lo que se montó y la entrega había dejado afuera es la segunda mitad de la frase,
que es la parte de diseño: el acceso al agua pasó a depender de la capacidad
financiera, eso creó jerarquías entre usuarios, y como no hay asociaciones
formales aparecieron **acuerdos informales entre vecinos** para compartir el
acceso o el equipo —la pieza replicable— pero el mismo vacío «has also reinforced
arbitrary, micro-political power structures by making lower-capital farmers more
dependent on capital-strong ones». La obra de riego y el arreglo de quién la usa
son la misma decisión.

---

## 2. La que se mueve de polígono, y por qué no hay nada que discutir

La entrega propuso el control mecánico de defoliadores de Wayanad para
`ghats_sur_deciduo`, el 270, que es uno de los dos blancos que pedían el extremo
correcto de un polígono. **No alcanza, y no por un caso de borde:** el artículo
publica cinco sitios de encuesta con coordenada y **los cinco dan 271**.

| sitio | coordenada publicada | ECO_ID |
|---|---|---|
| Mananthavady | 11,8014 N / 76,0044 E | 271 |
| Edavaka | 11,7715 / 75,9637 | 271 |
| Panamaram | 11,7381 / 76,0740 | 271 |
| Pulpally | 11,6732 / 76,1833 | 271 |
| Thrissileri | 11,8465 / 76,0227 | 271 |

Hay un detalle que conviene dejar anotado aunque no cambie el resultado, porque es
la variante de la regla 6 aplicada al revés: **la coordenada que el artículo
imprime al lado de «Pulpally» cae trece kilómetros al sur del pueblo de Pulpally**,
que resuelve 270. O sea que el nombre del lugar y la coordenada del lugar dan
fichas distintas. Vale la coordenada: es la que dice dónde se relevó, y además es
la que concuerda con los otros cuatro sitios. El 270 sigue en cero.

La entrada se montó en `ghats_sur_montano`, que pasa de una entrada a dos, y el
veredicto del lote 4 que decía «Pulpally y Sulthan Bathery dan 270» queda
corregido en su propio test: eso es verdad del pueblo y falso del sitio relevado.

### La corrección de método que esta entrada obligó a hacer

La entrega no lo hizo mal, pero el trabajo tiene dos cosas que se parecen y no son
lo mismo, y juntarlas es exactamente la falla que este circuito ya cometió —la
fuente correcta midiendo otra magnitud—:

> «Pest incidence in control plots ranged from 33.7% to 41.5%, which decreased to
> 14.2%-18.5% after treatment.»

Ese ensayo midió **las formulaciones que se pulverizan** (suero diluido,
aminoácidos de pescado, extracto de semilla de neem, emulsión de tabaco, emulsión
de aceite de neem, jeevamrutham), una por una en la tabla 3. **El método mecánico
de las ramas no es uno de los tratamientos medidos**: está descrito, con especies
—*Ficus hispida*, *Artemisia nilagarica*, *Ziziphus oenopolia* y *Cymbopogon
citratus*— y con las plagas que ataca, pero sin número. La entrada montada dice
las dos cosas y dice cuál es cuál, y agrega que los propios autores piden
validación científica antes de integrar esto a un esquema formal de manejo.

---

## 3. La que no entra, por dos motivos a la vez

`pinar_toba` es el **cuarto fracaso consecutivo** de esa ficha, y esta vez **la
mitad de la culpa es del encargo**, que escribió «Siulak y las laderas del Gunung
Kerinci». Medido:

| punto | ECO_ID |
|---|---|
| Siulak (1,9626 S / 101,3125 E) | **305** |
| Sungai Asam, Kayu Aro Barat (1,8317 / 101,2775) | 279 |
| Kampung Baru, Kayu Aro Barat (1,8128 / 101,2766) | 279 |
| Giri Mulyo, Kayu Aro Barat (1,7708 / 101,2615) | 279 |
| cumbre del Gunung Kerinci (1,697 / 101,264) | 279 |
| Sungai Penuh (2,0617 / 101,3917) | 279 |

Siulak está adentro; las laderas del volcán, donde fue la entrega, no. El 279 ya
tiene cuatro entradas, una más que el piso, así que la práctica no se montó ahí
tampoco: no suma cobertura y no habría quedado verificada.

**Y hay un segundo motivo, nuevo en el circuito.** Las dos URLs de la entrada
cuelgan de `repository.pertanian.go.id`, y ese host **no tiene registro A**: la
zona autoritativa de `pertanian.go.id` (Cloudflare) devuelve sólo el SOA para ese
subdominio, mientras el dominio padre resuelve normal. No es un 403, no es una
verificación anti-bot, no es un 200 con la portada del portal: el nombre no existe
en ningún DNS. **Van cinco variedades de fuente cerrada** contando EUDASM,
`thaiscience.info`, `sundarbanaffairswb.in` y `pub.epsilon.slu.se`.

### Para el próximo encargo: el 305 queda medido parte por parte

El polígono tiene **cinco pedazos** y sólo uno está en Kerinci. Pedirle una
práctica «al pinar de Toba» es pedírsela a un nombre que el polígono no honra —el
lago Toba está en el 279— y pedirla «en las laderas del Kerinci» tampoco sirve:

| parte | latitud | longitud | dónde es |
|---|---|---|---|
| 1 | −2,322 a −1,776 | 101,104 a 101,397 | filo oeste del valle de Kerinci (Siulak adentro) |
| 2 | 2,093 a 2,247 | 99,077 a 99,227 | Tapanuli sur |
| 3 | 2,660 a 2,852 | 98,766 a 99,020 | Tapanuli norte, al oeste del lago |
| 4 | 4,109 a 4,589 | 96,730 a 97,146 | Gayo / Aceh central |
| 5 | 4,913 a 5,138 | 96,026 a 96,475 | Aceh, extremo noroeste |

---

## 4. Las dos vacías declaradas

**`ghats_norte_montano` (el soppinabetta de Sringeri).** La entrega declaró que
ScienceDirect da 403 y que el informe de ATREE abre pero no documenta el mecanismo
completo. Es una decisión correcta y además **quedó sin consecuencia**: la misma
entrega llenó el 254 con el devrai. Esa ruta se cierra para siempre.

**`negros_panay` (los suludnon de Jayobo).** Cuarto intento, y el motivo cambió:
antes eran tres rutas con anti-bot, ahora el repositorio de la UPLB **sí abre** con
el resumen completo pero no nombra Barangay Jayobo ni permite atar práctica a
lugar. Eso es mejor información que un 403: dice que el problema puede no ser el
camino sino el texto disponible. No se vuelve a pedir esa entrada; si se quiere el
231, hay que buscar otro trabajo.

---

## 5. Lo que hubo que hacer para verificar, y conviene recordarlo

**El artículo de los devrai es CC-BY y resistió cuatro rutas.** Hindawi
(`downloads.hindawi.com`), Wiley (`onlinelibrary.wiley.com`) y CORE
(`core.ac.uk`, que es la que trajo la entrega) contestan las tres con la
verificación anti-bot de Cloudflare, también desde un navegador real. La Wayback
Machine **tiene el PDF archivado** —tres capturas, 2018, 2020 y 2022, de casi un
mega— pero el Internet Archive estaba caído ese día («Internet Archive services
are temporarily offline»), así que todas las llamadas volvían 429. Abrió por la
copia de Semantic Scholar, y por eso la entrada lleva **dos fuentes**: el DOI del
editor, que es la cita, y la copia abierta, que es la que el lector puede abrir.

Cómo se encontró: `api.semanticscholar.org/graph/v1/paper/DOI:…` y
`api.openalex.org/works/doi:…` devuelven el campo de PDF abierto con su licencia,
y de ahí salió también el nombre de la revista y los dos autores, que la entrega
no había puesto. Es una herramienta nueva para el circuito y sirve en general:
**cuando el editor está cerrado por el camino, el DOI alcanza para encontrar una
copia legítima.**

**El repositorio NOPR del CSIR no responde** (`ECONNREFUSED` contra
`nopr.niscpr.res.in:443`), que es el mismo host que ya había dejado caer una
entrada de Wayanad en el lote 2, **dos lotes atrás**. La ruta que sí abre es la de
la revista: `or.niscpr.res.in/index.php/IJTK/article/view/10870`, con el PDF en
`/article/download/10870/4552`. Esa es la que se montó.

**Y una falta de forma en las cuatro entradas:** ninguna puso los autores. La
regla 5 de los encargos de forraje —autores completos y en el orden de la cita—
está escrita para los números, pero vale igual acá: el rótulo que se monta tiene
que nombrar a quien firma, y hubo que buscarlo en los cuatro casos.

---

## 6. Qué quedó montado

En `apps/terreno/lib/practicasHistoricas.ts`:

- bloque nuevo `ghats_norte_montano`, una entrada (254);
- bloque nuevo `ghats_norte_deciduo`, una entrada (253);
- segunda entrada en `ghats_sur_montano` (271).

Tests: `apps/terreno/tests/unit/contexto/practicasRepesca.test.ts`, nuevo, con los
tres veredictos de polígono, el mecanismo de cada entrada y —el que más importa—
la frontera entre lo que el trabajo de Wayanad midió y lo que sólo describió. Se
corrigieron seis afirmaciones de `practicasLote4.test.ts` y una de
`practicasIndomalayaLote2.test.ts`, que fijaban el estado anterior.
