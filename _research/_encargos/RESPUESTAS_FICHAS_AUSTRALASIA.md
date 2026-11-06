# Fase 3 — Fichas de Australasia y Oceanía: veredictos

Un lote por ficha. Cada veredicto dice qué trajo la entrega, qué se verificó,
qué se cambió al montar y qué falta.

---

## Lote 1 — `matorrales_del_pilbara` → `pilbara_matorral` · **montado, con el modificador dado vuelta**

**La entrega vino completa y bien hecha.** Es la primera del circuito que llega
con las cuatro URLs abiertas, los siete nombres binomiales correctos, el campo
`suelos` con la base nombrada y una nota explicando por qué `cultivos` quedó
vacío. Las cuatro fuentes se verificaron una por una:

| Fuente | |
|---|---|
| `oneearth.org/ecoregions/pilbara-shrublands/` | 200, HTML, 62.010 bytes |
| `link.springer.com/article/10.1186/s42408-024-00317-4` | 200, HTML, 545.801 bytes |
| `library.dbca.wa.gov.au/Journals/082156/082156-92.pdf` | 200, PDF, **6.487.691 bytes, 429 páginas** |
| `library.dpird.wa.gov.au/misc_pbns/15/` | 200, HTML, 36.100 bytes |

Y lo que se afirmaba sobre cada una resultó cierto, incluida la que parecía más
arriesgada: **sí**, el relevamiento del Pilbara da la clase de la *Australian
Soil Classification* (Isbell 1996) para cada grupo de suelo, y **sí**, los
Kandosols rojos y los Calcarosols están entre ellos. Nada que corregir ahí.

**Pero el modificador estaba al revés, y es lo único que importaba del lote.**

### Lo que proponía la entrega

```
uso: pasturas · delta: 0 · pisa_global: −15 · confianza: media
```

con esta razón: que el informe pastoral de DPIRD estima capacidades por sistema
de tierras y tipo de pastura y documenta manejo ganadero en el Pilbara, «por eso
un castigo uniforme de desierto no representa por sí solo el sistema productivo
regional».

Las dos premisas son verdaderas. La conclusión no se sigue de ellas: **es un
argumento desde la existencia de un documento de manejo, no un mecanismo.** Y la
regla 7 del encargo pide el mecanismo justamente por esto.

### Lo que dice el primario, que es el que estaba sin abrir

El *Technical Bulletin 92* —Van Vreeswyk, Payne, Leighton y Hennig, 2004— es el
relevamiento oficial de la región: 181.723 km², cuatro campañas de campo entre
1995 y 1999, **12.445 evaluaciones de traverse**, más de 720 perfiles de suelo,
102 sistemas de tierras. La entrega lo citó y no lo usó; abre con `curl` pelado.

La vegetación del Pilbara está en **mejor** estado que la de cualquier otra
región relevada de Australia Occidental:

| | Pilbara | promedio de los rangelands de WA ya relevados |
|---|---|---|
| estado bueno o muy bueno | **77 %** | 39 % |
| regular | 11 % | 34 % |
| pobre o muy pobre | 12 % | 27 % |

Un dato así, leído de apuro, confirma la entrega. Pero el informe no deja que se
lea de apuro, porque explica la diferencia en la misma página:

> «The relatively low overall impact of pastoralism is due to the large areas of
> vegetation of moderate to very low pastoral value, i.e. the spinifex hummock
> grasslands.»

**El Pilbara está en buen estado porque la mayor parte no se puede pastorear.**
El 52 % de la superficie son superficies erosionales —sierras, pedimentos,
planicies pedregosas— y otro 18 % son arenales con espinifex. El espinifex duro
es, en palabras del informe, «largely unattractive to stock». Lo comestible son
las praderas de *tussock* y los matorrales de quenopodiáceas, que viven en la
planicie aluvial (4 % del área) y la llanura de inundación (7,5 %): **un octavo
de la superficie**. Y ahí es exactamente donde el informe mide el daño:

- Las praderas de *tussock* y los matorrales de quenopodiáceas son las
  formaciones «most extensively and substantially altered», por pastoreo
  preferencial y porque «they often have fragile soils which are inherently
  susceptible to erosion».
- Los suelos duplex de la planicie aluvial salina: «These soils support the most
  preferentially grazed vegetation and are highly susceptible to erosion».
- El 6,5 % de los 12.445 puntos tenía erosión acelerada; 1,2 % severa o extrema.
- Se cartografiaron **310 km² de degradación severa y erosión**, el 0,2 % del
  área, en 25 de los 102 sistemas de tierras, y el informe recomienda **sacarlos
  del uso ganadero**: «continued use will only exacerbate the problem».
- El **12 %** de la tierra en uso ganadero está en estado pobre sin llegar a
  degradación severa.
- El impacto se concentra alrededor de las aguadas, y «disproportionately severe
  in proximity to stock water points… particularly evident in large paddocks
  (>50 km²)» (Cridland y Stafford Smith 1993, citado en el informe).
- La distribución de tres especies altamente palatables —*Astrebla pectinata*,
  *Chrysopogon fallax* y el cachiyuyo *Atriplex bunburyana*— ya se redujo, y en
  diciembre de 2000 hubo que construir una clausura para que el cachiyuyo
  plateado no se extinguiera localmente.

### Por qué un 0 ahí no era un matiz: era un borrado

`componerAptitud` en `lib/contexto.ts` hace que el delta regional **reemplace**
al global para ese uso. Un `delta: 0` no suma cero: **saca la entrada del bioma y
pone la propia.** Con lo cual la única advertencia que un usuario recibe sobre la
carga en un rangeland árido desaparecía, en el reino donde más hectáreas hay bajo
pastoreo extensivo. Es el mismo error que ya se había frenado una vez con la zona
seca de Sri Lanka, que proponía cancelar una advertencia hídrica con un argumento
de fertilidad.

### Qué quedó montado

```
uso: pasturas · delta: −15 · confirma el global · confianza: alta
uso: reserva  · delta:  15 · confirma el global · confianza: alta
```

**El número del bioma se confirma y la razón se reescribe**, que es lo que la
ficha podía aportar de verdad. La razón del bioma describe un desierto sin
ganado; la del Pilbara describe un mosaico medido, y se la lleva el usuario a la
pantalla y al informe:

> «El castigo del bioma se confirma, pero por otro motivo: no es que todo el
> Pilbara sea frágil, es que el forraje está en un octavo de la superficie. […]
> La vegetación regional da 77 % en buen estado contra 39 % del promedio de los
> rangelands de Australia Occidental, y eso mide cuánto no se pastorea, no cuánto
> aguanta.»

La huerta **no se toca**: el bioma la castiga en −25 por falta de agua y con 250
a 400 mm de lluvia de verano eso está bien. La regla de composición del encargo
—pisar sólo el uso que se nombra— se cumple sin repetir lo que ya estaba bien.

El de `reserva` mantiene el 15 y corrige el mecanismo. El bioma dice que la
costra biológica «tarda décadas en formarse y se destruye en una pasada»; el
relevamiento del Pilbara mide otra cosa: la costra de criptógamas se rompe con el
pisoteo **pero se rearma sola si el horizonte superficial quedó entero**. Lo
irreversible no es la costra: es perder los 25 a 50 cm que hay arriba del hardpan.

### ¿No era un caso de gradiente?

La regla 8 dice que cuando media ecorregión es apta y la otra no, el arreglo es
de texto y no de delta. Acá hay mosaico, sí, pero **las dos mitades empujan para
el mismo lado por motivos distintos**: el espinifex de los cerros no alimenta, y
la planicie aluvial que sí alimenta es la que se erosiona. No hay ninguna
fracción del Pilbara donde el −15 sobre pasturas sea optimista de más, así que un
delta único no miente en ninguna mitad. El mosaico va en el texto igual, porque
es lo que le sirve a quien diseña.

### El hallazgo que no estaba en el encargo y vale más que el modificador

En la planicie de hardpan del sistema de tierras **Jurrawarinna**:

> «Overland sheet flow processes on this near level hardpan plain of the
> Jurrawarinna land system have been disrupted and channelised. The result has
> been water starvation, death of mulga shrubs and soil erosion.»

Encauzar el escurrimiento laminar **no dio más agua abajo: mató la mulga por
falta de agua**. En estos paisajes el agua y los nutrientes se retienen en
montículos de planta y pequeños focos de drenaje —el *parche fértil* de Tongway
1994— y concentrar la lámina en un canal desarma el mecanismo. Jurrawarinna es
uno de los tres sistemas de tierras con mayor proporción cartografiada como
severamente degradada (5,0 %).

acequia dibuja swales y líneas clave. Eso está escrito en el campo `suelos`, que
es el que llega al panel y al informe, y hay un test que lo sostiene.

### Lo que se corrigió de la entrega, en detalle

| Qué | Entrega | Montado |
|---|---|---|
| `pasturas` | `delta 0`, confianza media | `−15`, confianza alta, con el mecanismo medido |
| `reserva` | no la proponía | `15`, con la corrección del mecanismo de la costra |
| lluvia | «inferior a 450 mm» (del paper de fuego) | **250 a 400 mm** (del relevamiento), más el <450 del bioregión |
| *Triodia wiseana* | «Spinifex de hojas anchas» | **espinifex de caliza** («limestone spinifex» en el informe) |
| *Eucalyptus leucophloia* | «la fuente lo cita entre los eucaliptos» | es snappy gum y **One Earth lo presenta como acacia**: errata de la página, anotada en el código |
| base de suelos | «Kandosols rojos… Calcarosols» | **21 Soil Groups, cada uno con su clase de la ASC**, más de 720 perfiles |
| id | `matorrales_del_pilbara` | `pilbara_matorral` (ningún id del catálogo lleva artículos) |
| `cultivos` | `[]` con nota | **sin declarar**, para que caiga al catálogo Köppen en vez de quedar vacío |
| fauna | 325 aves, 36 mamíferos, 23 murciélagos, 140 reptiles | se agregan 13 anfibios, 245 hormigas, los dos endémicos y los **3.000 invertebrados del acuífero con 90 % de endemismo** |

Lo que la entrega **hizo bien y conviene no perder**: se negó a proponer una
carga animal regional, y lo dijo con el motivo correcto —las capacidades del
informe pastoral son por tipo de pastura y sistema de tierras, no extrapolables—.
Esa es la conducta que el encargo pide.

### Lo que falta, con ruta nombrada

La **carga animal en hectáreas por unidad vacuna, por sistema de tierras y tipo
de pastura**, está en el informe complementario del mismo relevamiento: Van
Vreeswyk, Payne y Leighton (2004), *Pastoral resources and their management in
the Pilbara region of Western Australia*, Miscellaneous Publication 21/2004, 162
páginas. **La página abre y el PDF pesa 108,3 MB**, así que no se bajó: ningún
número de la ficha sale de ahí, ninguno se le atribuye, y la fuente no está en
`fuentes`. Hay un test que verifica justamente eso, y es el lugar donde habrá que
sacarlo de ahí el día que alguien lo baje.

### Qué quedó en el código

| Archivo | Qué |
|---|---|
| `apps/terreno/lib/ecorregionesAustralasia.ts` | **nuevo**: el mapa ECO_ID → ficha del reino. Arranca con el 213. |
| `apps/terreno/lib/biomasRegionalesAustralasia.ts` | **nuevo**: la ficha, con el porqué del confirmar en vez de corregir. |
| `apps/terreno/lib/ecorregiones.ts` | el bloque entra en `RESTO_DEL_MUNDO`: 320 → **321** ECO_ID con ficha. |
| `apps/terreno/lib/biomasRegionales.ts` | el bloque entra en el catálogo: 242 → **243** fichas regionales. |
| `apps/terreno/tests/unit/contexto/aptitudAustralasia.test.ts` | **nuevo**, 12 tests. El central frena el `delta 0`. |
| `apps/terreno/tests/unit/contexto/ecorregiones.test.ts` | los conteos y los diez bloques. |

### Un pendiente que esto abrió

El `ANEXO_IDS_FICHAS.md` está generado al 17/09/2026 con 222 fichas y no conoce
`pilbara_matorral`. No se tocó a mano a propósito —es un archivo generado— pero
hay que regenerarlo antes de la fase 6, que es la de prácticas y lee ese anexo;
si no, el Pilbara nunca va a poder recibir una práctica histórica.

### Y uno que esto cerró

La entrega avisó que `cultivos` quedaba vacío «porque no se proporcionó el
catálogo de IDs». **Tenía razón y era culpa del encargo**: la fase 3 pide de 8 a
15 ids de cultivo y nunca mandó la lista. Se escribió
`_research/_encargos/ANEXO_IDS_CULTIVOS.md` con los 107 ids de
`lib/especies.ts`, y está copiado en `reglas/` para pegarlo con el lote 2. Mirar
esa lista deja a la vista otra cosa: **el catálogo no tiene ni una especie
australiana** —no hay macadamia, ni buffel, ni canola— así que las fichas del
suroeste mediterráneo y de las sabanas del norte van a poder llenar `cultivos`
con lo que ya existe (trigo, cebada, colza, alfalfa, sorgo, algodón, maní), y las
de los rangelands áridos y los atolones del Pacífico probablemente no.


---

## El lote 2: la mulga de Australia Occidental (ECO_ID 216)

*Entregado el 05/11/2026, leído y montado el 06/11/2026. **Entra entera.** Es la
segunda entrega del circuito que llega completa, y la primera a la que hubo que
corregirle una cosa que yo mismo había puesto en el encargo.*

### Lo que la entrega hizo bien, y es casi todo

Las siete URLs que declaró abren. Los números del boletín están donde dice que
están, verificados uno por uno contra el PDF de 406 páginas:

| dato | dónde | estado |
|---|---|---|
| 88.360 km², campaña de 1985 a 1988 | pág. 6 | ✅ |
| 19 tipos de tierra, 74 sistemas | pág. 6 | ✅ |
| ~830 especies vasculares | pág. 6 | ✅ (y 97 % nativas, 4,5 % endémicas) |
| 23 tipos mayores de vegetación | pág. 6 | ✅ (y «all but three are shrublands or low woodlands») |
| 1.256 sitios de condición | pág. 6 | ✅ (sobre 14 de los 23 tipos) |
| 42 / 37 / 21 por superficie | pág. 6 | ✅ |
| 13.441 evaluaciones de traverse, 1.560 km², 1,8 % | tabla A4 de la auditoría nacional | ✅ |
| 190–240 mm; invierno 55–80 %, verano <20 % | pág. 6 | ✅ |
| granito-greenstone de Yilgarn, hardpan silíceo | pág. 6 | ✅ |
| grupo 523, Duric Red Kandosol | informe 380, pág. 126 | ✅ |
| Bunny y Cole 12 ha/dse, Beringarra 7 | págs. de cada sistema | ✅ |
| «noviembre–abril, suponiendo invierno efectivo previo» | pág. 48 | ✅ |
| el boletín no trata bancos de contención ni difusión de agua | 406 páginas | ✅ |

Las capacidades por sistema se publican como «Estimated carrying capacity, good
condition: N ha/dse» y la entrega las leyó bien, con su unidad y su condición.
Y contestó la pregunta específica del encargo —si el boletín trata bancos de
contención, difusión de agua o encauzamiento del escurrimiento laminar— con un
no fundado: el texto describe el flujo laminar natural, los mulga groves que lo
interceptan y los bancos de wanderrie, y no propone ninguna obra. Verificado con
`grep` sobre el texto extraído: ni *contour bank*, ni *water spreading*, ni
*ponding bank*, ni *diversion bank* aparecen.

### Las tres correcciones, y dos son al encargo

**1. El relevamiento del bajo Murchison no es esta ecorregión, y yo invité a
usarlo.** El encargo decía: «La cuenca baja del Murchison se publicó aparte como
Technical Bulletin 96; si lo encontrás, vale». La entrega lo encontró —es el
Technical Bulletin 9 de DPIRD, campaña de 2002 a 2003, unos 13.000 km², 78 %
bueno / 9 % regular / 13 % pobre— y lo presentó con todo el cuidado del mundo,
aclarando que es un subárea y no un segundo muestreo del 216. No es un subárea:

| punto | ECO_ID | bioma |
|---|---|---|
| Kalbarri | 205 | 12 |
| acantilados de Zuytdorp | 205 | 12 |
| −27,80 / 114,90 | 205 | 12 |
| −27,50 / 115,30 | 205 | 12 |
| sur de Shark Bay | 205 | 12 |
| norte de Geraldton | 205 | 12 |

Seis de seis en **Southwest Australia savanna**, bioma 12 mediterráneo. El propio
resumen del informe lo decía sin que yo lo leyera: su límite oeste son los
acantilados de Zuytdorp sobre el Índico y su límite sur linda con tierra agrícola
al norte de Geraldton. El contraste entre su 78 % y el 21 % de acá no mide una
recuperación ni una diferencia de escala: mide dos ecorregiones distintas en dos
biomas distintos. **Ninguna cifra de ese informe entró en la ficha.**

**2. El relevamiento del Murchison se sale del polígono por el suroeste.**
Yalgoo y Mullewa, que están dentro del área relevada, dan 205. El boletín ya lo
avisaba en su propio resumen: describe el clima como árido «with the exception of
the moister far south-western corner». Ese rincón es el que cae afuera. El
88.360 km² del relevamiento es, además, un quinto del polígono: la ecorregión son
463.820 km².

**3. One Earth se equivoca de clima en su propia página.** Dice que el 216
«remains one of the largest landscapes of relatively intact temperate
Mediterranean-climate woodland left in the world», sobre un matorral árido de 190
a 240 mm. Es la segunda errata que esta fase le encuentra a One Earth en
Australasia, después del snappy gum presentado como acacia en la página del
Pilbara.

Y dos cosas menores: tres de las siete «especies» eran animales —la serpiente de
mulga moteada, el eslizón del Gran Desierto y el perico de Alexandra—, que por el
contrato de `biomaTipos.ts` pasan al campo `fauna`; y el 1.560 km² de degradación
severa lo atribuyó a la auditoría nacional cuando también está, como 1.561, en el
boletín mismo.

### Lo que el montaje agregó

**La escalera de capacidades, contada.** El encargo pedía «qué parte de la
superficie es realmente pastoreable» y la entrega contestó, con razón, que el
boletín no publica un porcentaje único. No lo publica; pero publica la capacidad
sistema por sistema y la superficie de cada sistema, así que el reparto se cuenta.
Sobre los 66 sistemas cuyo encabezado se puede parsear, que son el 90,1 % del área
relevada:

| capacidad | superficie | sistemas |
|---|---|---|
| 5 ha/dse | 0,09 % | 1 |
| 7 ha/dse | 8,87 % | 14 |
| 12 ha/dse | 39,10 % | 20 |
| 20 ha/dse | 39,80 % | 22 |
| 30 ha/dse | 1,99 % | 8 |

Eso es estrictamente mejor que un número único, y dice algo que un promedio
escondería: **la mejor tierra del relevamiento entero son 76 km²**. El sistema
Merbla, el único con «Pastoral potential: very high», son planicies aluviales con
gilgai bajo cerros de gabro «found very locally in far south-east», y el boletín
aclara que su extensión restringida obliga a un control estricto y responsivo del
pastoreo. El 79 % de la superficie está en 12 o 20 ha/dse.

Y el mecanismo resulta **distinto del Pilbara**, que era lo que había que
averiguar. En el Pilbara el forraje vive en un octavo de la superficie y el resto
no se come. Acá los 74 sistemas tienen capacidad asignada: lo que pasa es que la
escalera entera es flaca, y encima las capacidades valen para condición buena,
que es el 21 % del área.

**El Murchison es el peor de los diez relevamientos del estado.** La tabla A4 de
la auditoría nacional lo pone en fila con los otros nueve: 42 % de las
evaluaciones en estado pobre contra 24 % de los diez juntos, y 21 % bueno contra
46 %. Sólo el Nullarbor oriental se le acerca. Y el polígono está cubierto en
parte por tres de esos diez relevamientos —el Murchison, el de Sandstone–Yalgoo–
Paynes Find (45/32/23) y el de los Goldfields del noreste (39/32/29)—, todos
verificados por punto, así que el 216 tiene un gradiente de condición y el
Murchison es su extremo degradado.

**La mitad de la presión de pastoreo no es del ganado.** El censo aéreo de
canguros, cabras y otros animales grandes hecho durante la campaña indica que la
presión del ganado doméstico era menos del 50 % de la presión total. Para
cualquiera que dimensione un rodeo acá, eso cambia la aritmética: bajar el rodeo
a la mitad no baja la presión a la mitad.

**El suelo dominante, con sus atributos medidos.** La entrega citó el grupo 523
y dijo bien que tiene baja reserva de agua y profundidad radicular limitada. La
tabla del informe 380 da más y da lo que importa para una obra de agua:
permeabilidad de 0 a 50 cm **muy lenta**, fertilidad inherente **moderada** —no
baja, al revés de la generalidad regional—, declive de la estructura superficial
**alto**, y como calificador más restrictivo el subsuelo salino. Un franco rojo
de permeabilidad muy lenta sobre cemento, con poca reserva: ahí está la razón de
que la lámina exista.

**El agua subterránea, que invierte una intuición de diseño.** Hay acuíferos
somero extensos debajo del hardpan, y son el agua con la que se desarrollaron la
ganadería y la minería; el consumo pastoril es chico frente al almacenamiento
estimado. Pero el agua es de tipo cloruro de sodio y **la salinidad crece hacia
las líneas de drenaje**: la menos salina está en las divisorias, donde la roca
está más cerca de la superficie, la napa es profunda y el tiempo de residencia es
corto. En el drenaje interno del lago Austin pasa los 50.000 mg/L. Y el nitrato
supera el estándar de la OMS para consumo humano en toda el área, por fijación de
la vegetación o de las termitas y no por contaminación. O sea: el castigo de
huerta se confirma, pero no por falta de agua, y el lugar donde la app pondría la
obra es el que la tiene peor.

**La erosión, con sus dos métodos.** 15 a 17 % del área con erosión acelerada al
menos leve, por dos métodos independientes; escaldado y laminado superficial
sobre 10 a 50 % de la superficie como formas más comunes; sin cárcavas
espectaculares porque el suelo tiene menos de 50 cm sobre hardpan o roca; y las
planicies duplex erosionadas «will remain irreversibly deflated and degraded
until practical solutions are more fully researched and developed».

### El estado del acceso

| ruta | estado |
|---|---|
| `library.dbca.wa.gov.au/static/Journals/082156/082156-84.pdf` | 200, PDF, 406 pág. |
| `library.dbca.wa.gov.au/Journals/082156/082156-84.pdf` | 200, PDF, mismo documento, otro tamaño |
| `library.dpird.wa.gov.au/tech_bull/4/` | 200, HTML |
| `library.dpird.wa.gov.au/tech_bull/9/` | 200, HTML — **pero es el ECO_ID 205** |
| `oneearth.org/ecoregions/western-australian-mulga-shrublands/` | 200, con errata de clima |
| `library.dbca.wa.gov.au/Journals/080316/080316-380.pdf` | 200, PDF, 177 pág. |
| `library.dbca.wa.gov.au/static/FullTextFiles/621427.pdf` | 200, PDF, 193 pág., **67 MB**: hay que bajarlo en dos tramos con `curl -C -` |
| `parliament.wa.gov.au/.../tp-2364.pdf` | no se abrió: la entrega lo declaró como fuente y no lo usó para nada |

### Lo que queda abierto

- El Technical Bulletin 96 de la cuenca media, si existe aparte del 84 y del 9.
  El 9 resultó ser otra ecorregión; el 96 no se buscó.
- El informe complementario de carga animal del Murchison, si lo hay, al estilo
  del Miscellaneous Publication 21/2004 del Pilbara que pesa 108 MB.
- Los relevamientos de Sandstone–Yalgoo–Paynes Find y de los Goldfields del
  noreste, que cubren el resto del 216 y de los que acá sólo entró la fila de la
  tabla A4.
