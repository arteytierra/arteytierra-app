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


---

## El lote 2: el miombo seco (ECO_ID 42)

*Entregado el 05/11/2026, leído y montado el 06/11/2026. **Entra, con cuatro
correcciones.** Una de ellas es un error aritmético —el primero del circuito que
se detecta recalculando y no leyendo— y otra es a una premisa falsa que puse yo
en el encargo.*

### El hallazgo del lote no lo trajo la entrega: lo trajo abrir su fuente

La entrega citó *The Miombo in Transition* (Campbell, ed., CIFOR, 1996) y lo usó
para la distribución de suelos y para la tasa de rebrote. El libro abre —5,9 MB,
273 páginas— y en el capítulo 2, de Peter Frost, está la tabla que resuelve el
problema que la ficha del miombo húmedo sólo pudo citar de segunda mano a través
del informe de Gorongosa:

| variable dependiente | contra | regresión | r | p |
|---|---|---|---|---|
| biomasa leñosa (Mg/ha) | lluvia anual (mm) | Y = 0,14·X − 56,21 | 0,833 | <0,05 |
| área basal leñosa (m²/ha) | lluvia anual (mm) | Y = 0,01·X + 4,14 | 0,605 | <0,01 |
| **rinde herbáceo** | lluvia anual (mm) | **Y = 2,43 − 0,001·X** | **0,147** | **NS** |

**A escala regional la lluvia anual no predice el estrato herbáceo del miombo, y
la pendiente ajustada es negativa.** Lo que sí predice es la leñosa. Y el rinde
herbáceo cae con el área basal leñosa, exponencialmente, por la figura 2.7
(Robertson 1984, Malaui): `Y = 1878,4·A^(−0,45)`, F₁,₁₀ = 6,570, p = 0,028. El
dosel se cierra alrededor de 10 m²/ha de área basal, y ése es el punto por debajo
del cual el rinde de pasto empieza a subir con fuerza: la sombra es el factor
principal que lo suprime.

**La unidad del epígrafe está mal.** Dice Mg/ha, y con esa lectura un área basal
de 10 m²/ha daría 666 Mg/ha de pasto. Son kg/ha, y la prueba es que sólo esa
lectura cae dentro del rango de biomasa herbácea que publica el propio libro: 0,1
a 4,0 Mg/ha. Es el tipo de error de unidad que la skill del motor de cálculo pide
buscar, y acá estaba en el primario.

Compuestas las dos regresiones sobre el rango de lluvia de esta ecorregión
—composición mía, no un resultado publicado, y la ficha lo dice—:

| lluvia | área basal | rinde herbáceo |
|---|---|---|
| 600 mm | 10,1 m²/ha | ~660 kg/ha |
| 900 mm | 13,1 m²/ha | ~589 kg/ha |
| 1.000 mm | 14,1 m²/ha | ~570 kg/ha |

Más lluvia hace más madera y la madera le hace sombra al pasto. Y todo el rango
de esta ecorregión está en o arriba del cierre del dosel, así que el pasto está
en la rama suprimida de la curva de punta a punta.

Contra eso, `prodForrajera` da 7.000 kg MS/ha/año desde 900 mm: **doce veces**. Y
si se corrige el rinde de fin de temporada a producción anual con el factor que
publica la misma fuente —el pico de rinde es sólo el 25 a 35 % de la producción
aérea anual medida a lo largo de la temporada—, quedan unos 1.960 kg/ha y la app
sigue leyendo unas 3,6 veces alto. El motor no se toca, por el mismo motivo que
con el vertisol del Decán.

**Ese factor del 25 a 35 % es, además, un aviso para el trabajo de `Yp` que quedó
abierto de este lado: un corte de fin de temporada no es la producción anual.**

### Las cuatro correcciones

**1. El error aritmético: la curva de rebrote tabulada con las edades corridas.**
La entrega reprodujo la figura 2.9 verbatim —`B = 84,20/(1+28,76·0,82^t)`, r² =
0,886— y después la tabuló mal:

| edad | la entrega dice | la ecuación da |
|---|---|---|
| 10 | 17,0 | 17,0 ✅ |
| 20 | 54,5 | 54,6 ✅ |
| 30 | 70,1 | **78,3** |
| 40 | 78,4 | **83,3** |
| 50 | 82,0 | **84,1** |

Sus filas de 30, 40 y 50 traen los valores de 25, 30 y 35. Tres de cinco mal, y
para el lado que hace ver el rebrote más lento de lo que el modelo publicado dice:
un diseño que la usara pediría una rotación más larga que la necesaria. Las
fracciones de asíntota que la entrega calculó son internamente consistentes con
sus propios valores de biomasa, así que el error es de las edades y no de la
cuenta — lo que lo hace más difícil de ver. **Es exactamente la falla que este
repositorio vigila —un número plausible y equivocado— y sólo se detecta
recalculando.** El test nuevo recalcula la ecuación.

Y hay una discrepancia que encontré en el mismo movimiento y que es del primario:
el texto dice que la producción hace pico «at about 18-20 years», leído de su
figura 2.10, que la figura declara estimada de esta misma regresión; pero el
incremento anual de una logística se maximiza donde el término exponencial vale
uno, que para esta ecuación es a los **16,9 años**. La ficha dice las dos cosas en
vez de elegir una.

**2. La meseta de Makonde no es esta ecorregión.** La entrega construyó todo su
párrafo de suelos sobre una exposición de Soilscapes del altiplano de Makonde
—Ferralsoles y Acrisoles arenosos, los camellones para retener lluvia, los
cultivos tras el desmonte— y de ahí sacó dos de sus ids de cultivo. Medido:

| punto | ECO_ID | bioma |
|---|---|---|
| Newala (−10,94 / 39,29) | **28** | 1 |
| −10,80 / 39,45 | **28** | 1 |
| −11,05 / 38,95 | **28** | 1 |
| Masasi (−10,72 / 38,80), más al oeste | 42 | 7 |

Southern Swahili coastal forests and woodlands: bosque húmedo tropical, no
sabana. **Nada de Makonde entró.** El arroz de secano se cayó de `cultivos`; el
sésamo se sostiene porque el informe de Niassa, que sí está adentro, lo propone.

**3. El encargo decía que el bioma 7 hereda «huerta −10». No la hereda.** El
bioma de sabana tropical tiene `pasturas +20` y `forestal −10`, y no nombra la
huerta — como la cabecera de este mismo archivo ya decía dos secciones más
arriba, porque el miombo húmedo la **agregó**. La entrega contestó con honestidad
a una premisa falsa y propuso «conservar el −10» de un modificador que no
existía. El error es mío. Queda en −20, igual que el miombo húmedo pero por un
mecanismo propio, y declarado como lo que es: un agregado.

**4. Nyimba está en el 66 y eso lo dije mal yo, acá al lado.** El comentario de
la constante `NYIMBA` en `biomasRegionalesAfrica.ts` afirmaba que el distrito
«está en el miombo SECO, que es el ECO_ID 42». Medido, Nyimba da **ECO_ID 66,
Zambezian-Limpopo mixed woodlands**. La conclusión del comentario —no atribuirle
nada al 39 ni al 36— seguía siendo correcta; la ecorregión nombrada no.
Corregido en el mismo commit.

Y un aviso de lectura: One Earth dice que la ecorregión se extiende «over central
Zimbabwe», y Gweru, en el centro de Zimbabue, da 66. Harare, en el noreste, sí da
42. La prosa de la ficha pisa más que su propio polígono.

### El polígono, medido

| punto | ECO_ID |
|---|---|
| Morogoro, Tanzania | 42 ✅ |
| Tabora, Tanzania | 42 ✅ |
| Masasi, Tanzania | 42 ✅ |
| Mariri y Mbamba, Niassa, Mozambique | 42 ✅ |
| Zomba, Malaui | 42 ✅ |
| Choma, sur de Zambia | 42 ✅ |
| Harare, noreste de Zimbabue | 42 ✅ |
| Menongue, suroeste de Angola | 42 ✅ |
| Gweru, centro de Zimbabue | 66 ✗ |
| Nyimba, Zambia | 66 ✗ |
| meseta de Makonde, Tanzania | 28 ✗ |
| Lusaka, Zambia | 76 ✗ |
| Kariba, Zimbabue | 65 ✗ |

### La fuente que no se pudo verificar, y con qué se reemplazó

La entrega sostuvo su mecanismo de pasturas en «67–162 g/m² de biomasa herbácea
aérea en miombo seco», citando `pub.epsilon.slu.se/23427/1/ruvuga_p_210506.pdf`.
**Ese host devuelve 200 con 66.742 bytes de la portada del portal de
investigación de la SLU para cualquier ruta**, incluida la del artículo real
—que es Ruvuga et al. 2021, *Evaluation of rangeland condition in miombo
woodlands in eastern Tanzania*, DOI `10.1016/j.jenvman.2021.112635`, cuya copia
de Epsilon está en `/23426/1/ruvuga_pr_et_al_210506.pdf`—. OpenAlex lo marca como
acceso abierto híbrido en ScienceDirect, que da **403 a curl y también al
navegador propio**. No se pudo verificar y no entró.

Lo reemplazó el rango que publica el libro de CIFOR, que es más ancho, abierto y
citable: biomasa herbácea aérea de 0,1 a 4,0 Mg/ha en rodales mixtos poco
disturbados, el 2 a 5 % de la biomasa aérea total, con la mayoría de los
registros por debajo de 2,0 y las hierbas de hoja ancha en cerca del 30 %. Los
67–162 g/m² de la entrega caen dentro de ese rango, así que probablemente el dato
fuera bueno; eso no lo vuelve citable.

Y una corrección a mi propio aviso del encargo: decía que
`cifor-icraf.org/publications/` devuelve 403 y que hay que entrar por
`/knowledge/publication/`. Eso vale para el buscador. **El PDF del libro se sirve
directo desde `/publications/` y abre con curl pelado.**

### Lo que el montaje agregó

**El único suelo medido adentro del polígono**, y dice algo que contradice a la
ficha de arriba. El análisis de Mbamba, Nkuti y Mariri, en la Reserva Nacional de
Niassa: catorce muestras a dos profundidades en siete sitios más cinco perfiles
descriptos. ECEC muy baja y cayendo con la profundidad —3,84 / 1,53 / 1,52
meq/100 g en los primeros 20 cm de chacra activa, chacra abandonada y monte, y
1,96 / 0,67 / 0,86 entre 40 y 60—, con materia orgánica, nitrógeno total, fósforo
disponible y potasio intercambiable como lo deficitario en todo el perfil. Pero
la condición física es **buena** —estructura, drenaje interno, permeabilidad,
porosidad— y **el pH va de 6,5 a 7,3**: acá el suelo no es ácido. El miombo
húmedo se describe lixiviado, ácido y con aluminio que castiga al maní y a la
soja; en el miombo seco medido eso no está, y por eso el maní y la soja entran en
la lista de cultivos.

**La Striga**, que ninguna otra fuente del circuito trajo. *S. asiatica* y *S.
hermonthica* se vuelven severas después de dos o tres años seguidos de cereal
—maíz, sorgo, mijo— y son, junto con la caída de fertilidad, lo que hace abandonar
la chacra. En Mbamba la superficie de chacras activas y abandonadas pasó de 1.084
ha en 2006 a más de 2.215 acumuladas en 2016, y lo abandonado nunca se reusó. La
salida que propone la propia fuente es una capa arable armada con fijadores
—soja, guandul, lablab, girasol— más sésamo, y reforestación con *Faidherbia
albida*, que tira la hoja en la estación de lluvias en vez de en la seca.

**La estacionalidad de la proteína, que decide el año ganadero.** La proteína
bruta de las gramíneas baja de alrededor del 10 % en la temporada de crecimiento
a cerca del 3 % en la seca, con la fibra subiendo: el animal engorda en la húmeda
y pierde peso en la seca. El ramoneo de las especies del miombo mantiene más del
10 % todo el año, aunque algunas traen taninos condensados que reducen la
disponibilidad de nitrógeno al rumiante.

**El canje entre árbol y pasto, cuantificado y con su trampa.** Descepar o
anillar da un aumento medio del 260 % en el rinde herbáceo, con desvío estándar
de 419 % sobre n = 22: el desvío es más grande que la media, así que es una
dirección y no un coeficiente. El desmonte de arbustos llega a 400 %. Se midieron
3 a 5 Mg/ha en parcelas descepadas de miombo seco en Zimbabue, según el régimen de
fuego y de pastoreo. **Pero** el desmonte en un sitio de miombo seco del centro de
Zimbabue reemplazó *Panicum maximum*, palatable, por especies no palatables; y en
miombo seco sacar los árboles puede reducir el forraje disponible en los años de
sequía, porque el árbol tolera la seca mejor que la hierba. El mismo capítulo
aclara que en miombo **húmedo** ese perjuicio no se espera: es la diferencia entre
las dos fichas, medida.

**La tsetsé, y lo que separa al seco del húmedo.** *Glossina morsitans* es el
vector principal en el miombo, con *G. palpalis* y *G. pallidipes* más locales en
ambientes ribereños y de monte cerrado; *Trypanosoma rhodesiense* da la enfermedad
del sueño en las personas y *T. brucei* da nagana en el ganado; es benigna en la
fauna trypanotolerante, que funciona como reservorio; y algunas razas bovinas
indígenas son trypanotolerantes pero **fueron reemplazadas en gran medida por
razas exóticas susceptibles**. Y el dato que separa esta ficha de la de arriba: el
desmonte puede erradicar la tsetsé localmente, y donde eso funcionó fue en **las
zonas más secas y de suelos relativamente someros**, donde el rebrote leñoso es
subóptimo y la tierra desmontada resultó fácil de mantener abierta; en las zonas
más húmedas, sobre suelos profundos y bien drenados, el bosque vuelve y la mosca
persiste.

**El forestal, movido de −10 a +5.** La razón del global es forestar un pastizal
y acá no hay pastizal: la cobertura nativa es el bosque y el monte bajo de sus
propias especies es el sistema indígena. Pero paga poco, y la tabla 2.7 dice
cuánto: 1,2 a 2,0 Mg/ha/año de incremento medio anual de biomasa en rebrote de
miombo seco contra 2,2 a 3,4 en húmedo. La existencia en pie de madera aserrable
es baja y dominada por fustes chicos, con alto potencial de regeneración bajo
manejo.

### La tasa de rebrote, que era el encargo extra y entró

Tabla 2.7, verificada entrada por entrada contra el PDF:

| conjunto | <10 años | 11-20 | 21-50 |
|---|---|---|---|
| calculado del incremento volumétrico | 1,52 (0,61) n=4 | 1,45 (0,44) n=8 | 1,56 (0,67) n=5 |
| Chidumayo 1991a | 1,41 (–) n=1 | 1,95 (0,47) n=5 | |
| Chidumayo 1993a | 1,17 (0,94) n=4 | 1,48 (0,48) n=4 | |

Y dos cosas que la entrega hizo bien y conviene reconocer: declaró que la primera
serie **no es biomasa medida** —el libro aclara que la calculó del incremento de
volumen suponiendo una densidad de madera de 0,778 Mg/m³— y distinguió el
incremento anual de la biomasa en pie acumulada, que son métricas distintas. Lo
que no trajo: que la regresión de la figura 2.9 **excluye sus dos puntos más
altos**, lo que cambia cómo se lee la asíntota de 84,2 Mg/ha.

### El estado del acceso

| ruta | estado |
|---|---|
| `oneearth.org/ecoregions/dry-miombo-woodlands/` | 200, 66.602 bytes |
| `cifor-icraf.org/publications/pdf_files/Books/Miombo.pdf` | 200, PDF, 273 pág. — **abre pese al aviso de mi encargo** |
| `biblioteca.biofund.org.mz/.../2017_Mariri Soil Analysis.pdf` | 200, PDF, 81 pág. |
| `ees.kuleuven.be/.../Frame-11_Sahel-and-Savannah_EA.pdf` | 200, PDF — pero es el ECO_ID 28 |
| `pub.epsilon.slu.se/<cualquier ruta>` | **200 con la portada del portal de la SLU**: host cerrado |
| `sciencedirect.com/.../S0301479721006976` | 403 a curl y al navegador |
| `onlinelibrary.wiley.com/doi/pdfdirect/10.1002/ldr.4149` | 403 |
| `esdac.jrc.ec.europa.eu/content/soil-map-soil-atlas-africa` | ya era constante del archivo |

### Lo que queda abierto

- **Lulandala et al. 2021**, *Excessive livestock grazing overrides the positive
  effects of trees on infiltration capacity and modifies preferential flow in dry
  miombo woodlands*, DOI `10.1002/ldr.4149`. Es miombo **seco** y es sobre
  capacidad de infiltración, que es exactamente lo que acequia calcula. Wiley da
  403 y las dos copias de Epsilon están en el host cerrado. Si aparece una copia
  abierta, es material de primera para el coeficiente de escorrentía de esta
  ecorregión.
- La densidad de árboles que optimiza el forraje. El propio libro la declara como
  hueco: «There is a need to establish the tree density that leads to optimum
  production of forage and other products derived from miombo woodland». Mientras
  no exista, no hay fracción de superficie pastoreable que declarar.
- El lablab y el poroto bambara, que el informe de Niassa nombra y
  `lib/especies.ts` no tiene.
