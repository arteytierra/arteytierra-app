# Fase 5, lote 1 — El miombo húmedo zambeziano

**Entrega:** `encargos-gpt/entregas/fichas-africa/01.json`, 23/10/2026.
**Montado en:** commit del 23/10/2026, `apps/terreno/lib/biomasRegionalesAfrica.ts`
y `ecorregionesAfrica.ts`, bloque nuevo, el undécimo.
**ECO_ID:** 39 (Central Zambezian wet miombo woodlands) y 36 (Angolan wet miombo
woodlands), las dos a la misma ficha. Bioma 7, sabana y pastizal tropical.

África al sur del Sahara estaba entera en cero: de las 116 ecorregiones del reino
afrotropical tenían ficha siete, y las siete son de Arabia, por el paquete de
Medio Oriente.

---

## 1. La entrega estuvo bien escrita y el que se equivocó fue el encargo

Las seis URLs abren. Las descripciones son textuales de las fuentes. La
declaración de lo que no tenía es honesta y explícita: «no se extrajeron repartos
comparables de HWSD v2 y SoilGrids», «la estimación de 15 hectáreas por unidad
animal procede de una referencia histórica sobre miombo en Mozambique; no se
extrapola como tasa uniforme», y el modificador vino con `confianza: "baja"`
declarada. Eso es exactamente el reparto que rinde.

**Y ahora lo que falló, que es mío y es más grave que lo del lote 1 de
Indomalaya.** El ejemplo de JSON del encargo de la fase 5 traía esto:

```json
"id": "miombo_humedo_zambeziano",
"nombre": "Bosques de miombo húmedo zambeziano",
"emoji": "🌳",
"color": "#689F38",
"cultivos": ["maiz", "sorgo", "mijo_perla", "mandioca", "caupi", "…"],
"ecorregiones_resolve": [39, 36],
"modificadores_propuestos": [{ "uso": "pasturas", "delta": 20, "pisa_global": 20,
  "razon": "Confirmado, con el mecanismo y la carga publicada que lo sostiene." }]
```

La entrega devolvió el id, el nombre, el emoji, el color, el par de ecorregiones,
el uso del modificador, el delta, el `pisa_global` y la conclusión —confirmado—
tal como estaban en el ejemplo. **No es que haya copiado: es que no había nada que
decidir.** El ejemplo no ilustraba la forma, resolvía el caso.

> **El ejemplo es la instrucción más fuerte del documento.** Más que las reglas
> numeradas, más que el texto. Si el ejemplo trae la respuesta, lo que vuelve es
> la respuesta del ejemplo con las descripciones investigadas alrededor.

Y la versión chica del mismo problema explica algo que en el lote 1 de Indomalaya
diagnostiqué mal. Ahí concluí que los tres ids inválidos habían salido de copiar
la columna del nombre del anexo. **Para `mijo_perla` eso era falso: `mijo_perla`
estaba literalmente en el ejemplo del encargo de la fase 4.** Dos de los tres sí
eran de la columna del nombre (`maiz`, `gandul`); el tercero era mío. Acá se
repitió con tres de golpe: `maiz`, `mandioca` y `mijo_perla`, los tres del
ejemplo, ninguno válido.

**Arreglado en los tres encargos de fichas** —fase 3, 4 y 5—: el ejemplo ya no
trae ids de cultivo, ni ecorregiones, ni nombre, ni modificador resuelto, y
arriba tiene un aviso que dice que es una forma y no una respuesta.

---

## 2. El modificador que la entrega confirmó está mal, y lo dicen sus propias fuentes

El encargo de la fase 5 decía —con honestidad y con razón como criterio general—
que en África el modificador global probablemente acierte, porque la sabana
africana es el arquetipo del que salió el `pasturas +20`. **En el miombo húmedo no
acierta**, y lo que lo prueba está en las mismas páginas que la entrega citó.

El `+20` del bioma viene con esta razón: «Es un bioma de gramíneas y pastoreo: el
sistema pastoril es el nativo, no un reemplazo». El miombo no es un bioma de
gramíneas: es un bosque de Caesalpinioideae con un estrato herbáceo estacional.
Las dos fichas de One Earth dicen, textualmente:

> «There is a low density of large mammals, attributed to the harsh dry season,
> long droughts, and poor soils, which results in **vegetation of low nutrient
> content**» (ecorregión 39).

> «Human populations are generally low due to the nutrient-poor soils that limit
> agricultural potential and the presence of **tsetse fly**, the vectors of
> trypanosomiasis that affect humans as well as **domestic livestock**»
> (ecorregión 36).

> «Patches of better grazing are scattered through the drier miombo, typically
> **associated with rivers and wetlands**» (ecorregión 36).

Y la carga de 15 hectáreas por unidad animal que la entrega usó como respaldo del
`+20` es, en su propia fuente, **el peor número de la tabla**. El informe de
Gorongosa cita a Tinley (1977), que cita a Myre y Antão (1972):

| formación | hectáreas por unidad animal |
|---|---|
| **miombo** | **15** |
| sabana de Urochloa (tipo Combretum-Acacia) | 6 a 8 |
| pastizal aluvial inundable | 3 a 4 |
| bajos herbáceos sobre suelo pesado, Chokwe, 656 mm (Timberlake y Reddy 1986) | 2,3 |

El relevamiento de campo del mismo informe —139 parcelas, estimación visual
declarada como tal— ordena 24 comunidades por carga y pone al **miombo húmedo
alto y cerrado último**, con 18 ha/LSU, contra 6 del Acacia-Combretum, 2 del
pastizal corto de Cynodon y 1 del pastizal de inundación de Echinochloa.

**El miombo es el piso de su propio bioma para pastoreo, no el techo.** El `+20`
queda en **0**. No baja a negativo porque el pastoreo extensivo existe y es real:
está en los parches, sobre ríos y humedales, el dambo.

### Y la otra razón de la entrega no era lo que parecía

La entrega citó también, como respaldo, que la ficha de One Earth «señala que se
propone aumentar la producción ganadera». La frase existe y dice esto:

> «Increase livestock production to reduce the price of domestic meat whilst at
> the same time increasing protection of protected areas through ground
> enforcement in order to **reduce poaching**.»

Es una acción prioritaria de conservación para bajar la caza furtiva ofreciendo
carne más barata. **No es una afirmación sobre la capacidad de carga de la
tierra.** Una recomendación de política no es una medición.

---

## 3. El hallazgo que no estaba pedido, y es el que más vale

**El motor de forraje de acequia promete en el miombo quince veces el pasto que
la literatura mide.**

`prodForrajera` de `produccion.ts` es una escalera creciente por lluvia anual y su
último escalón es `≥ 900 mm → 7.000 kg MS/ha/año`. El miombo húmedo recibe 1.000
a 1.400 mm, así que todo el rango cae en el escalón más alto. `bandaUso` lo
clasifica como pastizal húmedo, con 50 % de uso admisible. Con los propios
números de la app:

| paso | cuenta | resultado |
|---|---|---|
| forraje | `prodForrajera(1100)` | 7.000 kg MS/ha/año |
| uso admisible | `bandaUso(1100).inicial` | 0,50 |
| oferta aprovechable | 7.000 × 0,50 | 3.500 kg MS/ha/año |
| consumo de 1 EV | 18,54 Mcal EM/día ÷ 1,87 Mcal/kg × 365 | 3.619 kg MS/año |
| **carga** | 3.500 ÷ 3.619 | **0,97 EV/ha = 1,03 ha por EV** |
| con forraje grosero (1,55 Mcal/kg) | | 1,25 ha por EV |
| **publicado para miombo** | Myre y Antão 1972 | **15 ha por unidad animal** |

La comparación es aproximada: el EV de acequia está definido en energía y la
unidad animal de la fuente es una vaca de 450 kg. El orden de magnitud no depende
de eso: **la app se pasa por más de diez veces, y el error va para arriba.**

### Y el mecanismo explica por qué la escalera no se arregla subiendo o bajando

El informe de Gorongosa lo dice así, citando a Coe et al. (1977):

> la correlación entre lluvia y biomasa de herbívoros **se deteriora por encima de
> 800 a 900 mm**, en particular en ambientes pobres en nutrientes, y la carga
> **puede incluso caer** en zonas muy húmedas por lixiviación de nutrientes y el
> pasto de baja calidad que resulta.

Fritz y Duncan (1994) refinaron el enfoque incorporando la fertilidad del
sustrato. **Los dos trabajos originales no se leyeron**: lo verificado es que el
informe de Gorongosa lo afirma y los cita. Una búsqueda dirigida no encontró el
umbral de 800 a 900 mm confirmado en una fuente independiente abierta.

Esto es exactamente lo que los 24 lotes del encargo de forraje venían mostrando
desde el otro lado: la escalera no está «un poco alta», mira una sola variable.
Los 22 sitios medidos que hay montados son templados y áridos, y ninguno está por
encima de 900 mm sobre sustrato pobre. **El miombo da la dirección del error en el
extremo húmedo, que es justo el escalón donde la escalera se queda plana para
siempre.**

**El motor no se tocó**, y es deliberado, por la misma razón que no se tocó con el
vertisol del Decán: una tabla global no se reemplaza desde una formación. Lo que
corresponde es que la escalera deje de ser monótona en la lluvia, y eso necesita
el reemplazo que vienen armando los lotes de forraje. Mientras no exista, la
única advertencia que recibe el usuario es el texto de la ficha, y sólo si su
predio cae en estas dos ecorregiones. Hay tests que lo fijan en
`aptitudMiombo.test.ts`, incluido uno que falla si alguien cambia la escalera sin
pasar por el aviso.

---

## 4. El uso que el bioma no nombra: la huerta y el chitemene

La sabana global no trae ningún modificador de `huerta`, y acá hace falta, porque
el sistema agrícola de este bosque **no encuentra la fertilidad: la importa.**

La ficha de la ecorregión 39 lo nombra:

> «In Zambia, "citimene", a traditional form of ash-fertilizing agriculture, is
> also practiced, and increased human populations mean that this is **no longer
> sustainable**.»

El chitemene corta y quema la rama de una superficie de monte mucho mayor que la
chacra, y la ceniza es el fertilizante. Los números del suelo, del libro de Ker
(IDRC 1995) para la sabana africana:

| | |
|---|---|
| fósforo de superficie | 80 a 150 ppm |
| fósforo de superficie de un suelo templado, de contraste | 1.500 a 3.000 ppm |
| fósforo orgánico | 15 a 60 ppm |
| calcio y magnesio intercambiables | 0,3 a 3,0 meq/100 g |
| aluminio | castiga al maní y a la soja; la yuca y el café toleran la acidez |

Más los dos parches fértiles que las dos fuentes de la ecorregión nombran: los
**montículos de termita**, que concentran materia orgánica y nutrientes en un
paisaje que no los tiene, y el borde del **dambo**.

Se montó `huerta −20`. Es un uso agregado, no un reemplazo: `componerAptitud`
agrega los usos que el global no nombra, el mismo patrón que el `forestal +15` del
Decán central.

**Lo que no se propuso: `forestal`.** El bioma le pone −10 con la razón de que
forestar una sabana le cambia el régimen de fuego, y el miombo es el recurso
leñoso principal de la región —carbón, madera, leña para el tabaco—, así que el
−10 probablemente esté mal acá también. Pero no se encontró una tasa publicada de
rebrote o de rendimiento leñoso del miombo, y sin eso el número sería mío. Queda
nombrado y sin proponer.

---

## 5. Correcciones a la entrega

| # | Lo que decía | Lo que quedó | Por qué |
|---|---|---|---|
| 1 | `pasturas 20`, confirmado | `pasturas 0` | Las tres cargas de la misma fuente ponen al miombo en el piso, y las dos fichas de One Earth nombran la tsetsé y la vegetación de bajo contenido de nutrientes |
| 2 | sin modificador de huerta | `huerta −20` agregado | El chitemene y los números de fósforo y aluminio |
| 3 | fuente en `stage.oneearth.org` | la misma página en `www.oneearth.org` | Un host de staging no es una URL citable. Devuelve el mismo contenido y el mismo tamaño, así que el dato era bueno |
| 4 | `Syncerus caffer` entre las `especies` | pasó al campo `fauna` | `especies` es flora nativa por contrato, en `biomaTipos.ts` |
| 5 | siete especies con el género repetido como nombre común | ocho binomiales de dosel | «Brachystegia» no es el nombre común de *B. floribunda* |
| 6 | faltaba *Brachystegia taxifolia* | agregada | La fuente de la 39 la nombra entre los dominantes del dosel |
| 7 | «Alfisoles en amplias zonas de Tanzania y Zambia» | Alfisoles en la zona de sabana subhúmeda, Oxisoles en Angola, la RCA y el Congo, y Oxisoles extendiéndose por Zambia y Mozambique | Ker dice que los Oxisoles «extend through Zambia, Mozambique»; la entrega le atribuyó a Zambia el orden de mayor fertilidad |
| 8 | el Atlas «presenta una cartografía basada en HWSD» | derivado de HWSD, reclasificado a WRB, **corrigió el 13 %** del dato del continente, a 1:3.000.000 | El 13 % es la parte que es información |
| 9 | 147,4 M ha sin reparto | 102,4 M ha la central y 45,0 M ha la angoleña | Los dos tamaños están publicados por separado |
| 10 | no mencionaba la riqueza florística | «la más alta de todas las ecorregiones de miombo de África», más de 3.000 especies, pico en Zambia | Es el dato más distintivo de la 39 y estaba en la página |
| 11 | no mencionaba las áreas protegidas | la 39 tiene red extensa y **ninguna en Angola**; las de la 36 están todas en Angola | Está en las dos páginas y es relevante para quien planifica ahí |
| 12 | `cultivos` con 8 ids, 3 inválidos | 8 ids, todos válidos | Ver abajo |
| 13 | JSON sin cerrar | se cerró al archivar | Faltaban el `}` y el `]` finales |

Y una que **no** se corrigió, porque la entrega tenía razón: el total de más de
170 mamíferos, los cuatro casi endémicos y el endemismo estricto están
textualmente en la página angoleña, y que la página central no dé totales también
es cierto.

---

## 6. Los ids de cultivo

| La entrega puso | Existe | Qué quedó |
|---|---|---|
| `maiz` | no | `maiz_tropical` |
| `mandioca` | no | `yuca` (el catálogo lo llama «Yuca / mandioca») |
| `mijo_perla` | no | **nada**, ver abajo |
| `sorgo` | sí | `sorgo` |
| `tabaco` | no | nada: no está en el catálogo |
| `mani` | sí | `mani` |
| `frijol` | no | nada: el catálogo sólo tiene `poroto_trepador`, de hábito trepador |
| `soja` | sí | `soja` |
| — | — | se agregaron `caupi`, `girasol` y `batata` |

Los tres primeros salieron del ejemplo del encargo. Y el caso de `mijo` merece
explicación, porque es el más fino: **el catálogo tiene `mijo` = mijo perla,
*Pennisetum glaucum*, y el cereal del chitemene es el mijo africano, *Eleusine
coracana***, que es otra especie con otro ciclo y otro requerimiento de agua. El
trabajo de Nyimba nombra *Eleusine coracana* explícitamente. Poner `mijo` habría
impreso «Mijo perla» con sus 350 mm y su clima BSh en una ecorregión de 1.200 mm.
**Queda afuera y el faltante queda nombrado.**

Faltan en `lib/especies.ts`, entonces: **tabaco** (*Nicotiana tabacum*), **mijo
africano** (*Eleusine coracana*) y **poroto de hábito arbustivo** (*Phaseolus
vulgaris*, que está pero sólo como trepador de milpa). Los tres necesitan las seis
cifras del contrato de `motor-de-calculo` antes de entrar.

La ficha quedó con 8: `maiz_tropical`, `yuca` y `sorgo` de la fuente de la propia
ecorregión; `mani`, `soja`, `caupi`, `girasol` y `batata` del trabajo de Nyimba,
con su alcance escrito en el código.

---

## 7. Las fuentes, verificadas una por una

| Fuente | Estado | Qué dio |
|---|---|---|
| One Earth 39 | 200, abre pelada | tamaño, estados, clima, dosel, endemismos, riqueza florística, áreas protegidas, cultivos, chitemene, fuego, la vegetación de bajo contenido de nutrientes |
| One Earth 36 | 200 en producción | tamaño, clima, suelos lixiviados, 170 mamíferos, antílope sable gigante, tsetsé, los parches de pastoreo sobre ríos |
| Soil Atlas of Africa (JRC) | 200 | derivado de HWSD, reclasificado a WRB, 13 % corregido, 1:3.000.000 |
| Ker, *Farming Systems of the African Savanna* (IDRC 1995) | 200 | los órdenes de la sabana subhúmeda y los números de fósforo, CEC y aluminio |
| Gorongosa, *Landscapes* (2008) | 200, PDF de 39 páginas | las tres cargas de Myre y Antão, la tabla de 24 comunidades, el umbral de 800 a 900 mm |
| Nyimba (PMC) | 200 | el repertorio de cultivos del miombo zambiano |

### Dos fuentes son de otra ecorregión, y la entrega no lo notó

- **Gorongosa está en Mozambique**, en el miombo del sur, y no en la 39 ni en la
  36. Se cita por las cargas de la **formación** miombo, que es a lo que se
  refiere la tabla de Myre y Antão. No se encontró ninguna carga publicada
  adentro de estas dos ecorregiones.
- **Nyimba es miombo seco.** El propio trabajo ubica el distrito «in the arid
  ecozone» y describe miombo seco, mopane y munga: eso es el **ECO_ID 42**, el
  próximo del bloque, no éste. Se cita sólo por los cultivos.

Es la tercera vez que pasa lo mismo: en el lote 1 de Indomalaya fue la MPKV, cuya
jurisdicción es la Maharashtra occidental de otra ecorregión. **Una fuente del
lugar correcto a escala de país puede ser del lugar equivocado a escala de
ecorregión**, y eso hay que verificarlo siempre.

---

## 8. Lo que no se usó, con la ruta nombrada

- **El reparto porcentual de HWSD v2 y SoilGrids por ecorregión.** No se extrajo
  ni en este lote ni en el del Decán. Hacerlo necesita cruzar el polígono de
  RESOLVE con el ráster, que es trabajo de GIS y no de lectura.
- **Coe et al. (1977) y Fritz y Duncan (1994)**, los dos primarios del umbral de
  800 a 900 mm. Están citados por el informe de Gorongosa y no se leyeron.
- **CIFOR**, que el encargo nombra como la fuente abierta de la literatura del
  miombo y que este lote no tocó. Es la ruta natural para la tasa de rebrote que
  falta para decidir el `forestal`.
- **Las cargas oficiales de Zambia.** Hay una tesis de evaluación de tierras de
  la Provincia Occidental que calcula capacidad de carga, pero es otra ecorregión
  y no se bajó.

---

## 9. Qué quedó montado

| | |
|---|---|
| bloque nuevo | `biomasRegionalesAfrica.ts` y `ecorregionesAfrica.ts`, el undécimo |
| fichas regionales | 244 → **245** |
| ECO_ID con ficha | 431 → **433** (109 sudamericanas + 324 del resto) |
| afrotropicales con ficha | 7 → **9**, de 116 |
| modificadores | `pasturas 20 → 0` corregido, `huerta −20` agregado, `forestal −10` heredado intacto |
| tests nuevos | `aptitudMiombo.test.ts`, 18 |

---

## 10. Pendientes que abre este lote

1. **Que la escalera de forraje deje de ser monótona en la lluvia.** Es el
   pendiente grande y ahora tiene las dos direcciones medidas: los 22 sitios
   templados y áridos por abajo, y el miombo por arriba.
2. **`forestal` del miombo**, con una tasa de rebrote publicada, vía CIFOR.
3. **Tres cultivos faltantes** en `lib/especies.ts`: tabaco, mijo africano y
   poroto arbustivo.
4. **El reparto de suelos por ecorregión**, que ya es un pendiente de dos lotes.
5. **`ANEXO_IDS_FICHAS.md` sigue sin regenerarse**: está fechado el 17/09/2026 con
   222 fichas y ahora hay 245.

---

## 11. Para el lote 2 de África

El bloque 1 sigue por el **42, Dry miombo woodlands**, que es justamente donde cae
el trabajo de Nyimba que este lote no pudo usar para el suelo. Tres cosas para ese
pedido:

1. **El miombo seco está por debajo del umbral**, con menos de 1.000 mm en buena
   parte, así que la pregunta de la carga se da vuelta: ahí el `+20` puede estar
   bien. Que lo conteste con la variable nombrada.
2. **Nyimba ya está verificado y es de esa ecorregión**: va como ruta nombrada.
3. **El ejemplo del encargo ya no trae respuesta**, así que el lote 2 es la
   primera prueba de si eso cambia lo que vuelve.
