# Encargo — forraje, lote 04: la sabana y el pastizal inundable

*Pegar primero `GPT_LOCAL_REGLAS.md` y después esto, en un chat nuevo y suelto.
Entrega en `C:\Arte y Tierra\encargos-gpt\entregas\forraje\04.json`.*

Este archivo se lee solo: no hace falta el encargo general ni nada del proyecto.

---

## Lo primero, porque es lo que falló dos veces

Van tres lotes de este encargo. De las siete entradas que llegaron, **cinco se
montaron y dos se rechazaron, y las dos tenían el bioma equivocado**. No es
casualidad: las dos veces el bioma se eligió por cómo se ve la vegetación en el
texto, y no por el polígono que la clasifica.

| lote | entrada | vino como | es, verificado |
|---|---|---|---|
| 02 | Caatinga, Nordeste de Brasil | `sabana_tropical` (bioma 7) | **bioma 2**, bosque tropical seco · ECO_ID 525 |
| 03 | delta del río Tana, Kenia | `pastizal_inundable` (bioma 9) | **bioma 1**, bosque húmedo de la costa swahili · ECO_ID 25 |

El delta del Tana se comprobó con cuatro puntos distintos del delta: los cuatro
dan bioma 1, y recién bastante aguas arriba aparece el bioma 7. En **ningún**
punto del delta del Tana hay bioma 9. Que un lugar se llame «pastizal de
llanura de inundación» no lo pone en el bioma de pastizales inundables.

**Así que la primera tarea de cada entrada es el bioma, y va antes de elegir la
fuente.** Si no se puede verificar, la entrada no se entrega.

### Cómo se verifica el bioma de un lugar

Con el servicio público de RESOLVE Ecoregions 2017, que es el mapa que usa la
app. Se le pasa un punto en coordenadas y devuelve ecorregión, `ECO_ID` y
`BIOME_NUM`:

```
https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/Resolve_Ecoregions/FeatureServer/0/query
  ?geometry=<lng>,<lat>
  &geometryType=esriGeometryPoint&inSR=4326
  &spatialRel=esriSpatialRelIntersects
  &outFields=ECO_NAME,ECO_ID,BIOME_NUM,BIOME_NAME
  &returnGeometry=false&f=json
```

Si el sitio medido es una región y no un punto, se consultan **dos o tres puntos
separados** de esa región. Si no dan todos lo mismo, eso va en `nota` y se elige
el punto que corresponde al sitio donde se tomó la medición, no el más cómodo.

Y va en la entrada, en un campo nuevo y obligatorio:

```json
"bioma_verificado": {
  "lat": -15.8, "lng": -47.9,
  "eco_name": "Cerrado", "eco_id": 567, "biome_num": 7
}
```

### Lugares ya verificados, para ahorrar el paso

Esto está consultado y comprobado el 15/10/2026. Se puede usar tal cual:

| Lugar | bioma | ecorregión | `ECO_ID` | sirve para |
|---|---|---|---|---|
| Cerrado (Brasilia, −15,8 / −47,9) | **7** | Cerrado | 567 | `sabana_tropical` |
| Chaco seco (Salta, −24,5 / −62,0) | **7** | Dry Chaco | 569 | `sabana_tropical` |
| Llanos (Apure, 7,0 / −69,0) | **7** | Llanos | 572 | `sabana_tropical` |
| Chaco húmedo / Iberá (−28,5 / −57,2) | **7** | Humid Chaco | 571 | `sabana_tropical` |
| Serengeti (−2,3 / 34,8) | **7** | Southern Acacia-Commiphora bushlands | 57 | `sabana_tropical` |
| Kruger (−24,0 / 31,5) | **7** | Zambezian mopane woodlands | 65 | `sabana_tropical` |
| Victoria River District, NT (−16,0 / 131,0) | **7** | Victoria Plains tropical savanna | 189 | `sabana_tropical` |
| Pantanal (−18,0 / −56,5) | **9** | Pantanal | 584 | `pastizal_inundable` |
| Delta del Paraná (−33,9 / −58,8) | **9** | Paraná flooded savanna | 585 | `pastizal_inundable` |
| Delta del Okavango (−19,3 / 22,9) | **9** | Zambezian flooded grasslands | 76 | `pastizal_inundable` |
| Everglades (25,9 / −80,8) | **9** | Everglades flooded grasslands | 581 | `pastizal_inundable` |

Dos sorpresas de esa tabla que conviene mirar: **los Esteros del Iberá son bioma
7 y no 9**, así que una medición de Iberá va a `sabana_tropical`; y el **Delta
del Paraná sí es bioma 9**, lo que lo vuelve probablemente la mejor entrada
posible para este lote, porque el INTA publica de ahí.

## Los dos ids de este lote

| `id` | Bioma de RESOLVE | `BIOME_NUM` | estado hoy |
|---|---|---|---|
| `sabana_tropical` | Tropical & Subtropical Grasslands, Savannas & Shrublands | **7** | sin ninguna medición |
| `pastizal_inundable` | Flooded Grasslands & Savannas | **9** | sin ninguna medición |

Son los dos que quedaron vacíos y **son los dos que más importan**: el bioma 7
es donde cae la mayoría de los predios ganaderos del mundo, y el bioma 9 es
donde la ganadería extensiva de Sudamérica tiene su reserva de forraje de la
seca.

**Hay un tercero opcional**, vacío desde el lote 01: `bosque_tropical_seco`
(`BIOME_NUM` **2**). Si aparece una fuente abierta de caatinga, bosque seco
chiquitano, bosque seco del Pacífico o monte espinoso, entra ahí. Los 400
kg/ha/año de forraje disponible y 10 ha/cabeza/año de la caatinga del lote 02
corresponden a este bioma y servirían **si se consigue una fuente que abra** —
la del lote 02 redirige hoy a `require_login`.

## Lo que se pide, en este orden de preferencia

1. **Oferta forrajera aprovechable** —materia seca que un animal puede comer, ya
   descontada la fracción no palatable o inaccesible—.
2. **Receptividad o carga animal admisible** publicada por un organismo
   (EV/ha, UG/ha, AU/ha, LSU/ha, cabezas/ha, coeficiente de agostadero).
3. **Materia seca herbácea aérea total**, sin descontar nada.
4. **NPP herbácea**, sólo si no hay ninguna de las anteriores.

Las cuatro sirven, **pero hay que decir cuál es**, en `tipo_de_cifra`, que sólo
admite estos cuatro valores:

```
"oferta_aprovechable" | "receptividad" | "ms_herbacea_total" | "npp_herbacea"
```

## Tres cosas que este lote pide y los anteriores no

### 1. Si está en pie o si creció este año

Es la trampa de todo pastizal perenne, y en este encargo ya se midió cuánto
cuesta. En el Altiplano de Puno la biomasa en pie es de **1,5 a 3 veces** la
producción anual; en la tundra de Alaska, de **77 a 211 veces**. En los dos
casos el trabajo publicaba las dos cifras y había que leer la tabla para no
montar el stock creyendo que era el flujo.

En sabana y en pastizal inundable el riesgo es el mismo o peor, porque las
gramíneas son perennes y altas y la biomasa muerta en pie puede ser la mayor
parte de lo que se ve. Campo nuevo y obligatorio:

```json
"en_pie_o_anual": "crecimiento_anual" | "biomasa_en_pie" | "no_lo_dice"
```

Si es `biomasa_en_pie` la entrada **igual se entrega** —es información útil— pero
hay que decirlo, y si el trabajo además publica la fracción anual, va en `nota`
con la cifra y la tabla de donde sale.

### 2. Cuánto leñoso tiene el sitio, en la sabana

En una sabana el pasto y el árbol compiten, y la producción herbácea cae fuerte
cuando sube la cobertura leñosa. Una cifra de sabana **sin la cobertura de
árboles y arbustos del sitio no se puede usar**, porque no se sabe si describe
un pastizal abierto o un monte cerrado, y entre los dos hay un factor de varias
veces. Campo nuevo:

```json
"cobertura_lenosa_pct": 15
```

`null` sólo si la fuente de verdad no lo informa, y entonces se dice en `nota`.
Si la fuente da cobertura de copa, densidad de árboles por hectárea o área
basal, se transcribe tal cual en `nota` con su unidad, sin convertir.

**Y el fuego.** Casi toda la bibliografía de sabana mide sitios con un régimen de
quema, porque es como se maneja ese bioma. Si la fuente lo dice —cada cuántos
años, en qué estación— va en `estacionalidad` o en `donde_deja_de_valer`. Una
cifra de un sitio que se quema todos los años y otra de uno excluido del fuego
por veinte años no son comparables.

### 3. El régimen de inundación, en el pastizal inundable

Acá la lluvia anual explica **todavía menos** que en los otros biomas: lo que
manda es cuánto tiempo y a qué profundidad queda el agua, y de dónde viene. Un
pastizal que se inunda por la crecida de un río grande puede producir mucho en
un año de poca lluvia local. Campo nuevo:

```json
"regimen_de_inundacion": "Profundidad, duración y época de la inundación, y si viene de crecida fluvial, de marea o de lluvia local. Tal como lo diga la fuente."
```

Esto es obligatorio para `pastizal_inundable` y `null` para los otros. **Si la
fuente no describe el régimen, la cifra no sirve para este bioma**: sería como
dar una producción de riego sin decir cuánta agua se aplicó.

Y el que mide bien, mide por fase. Si la fuente separa la fase inundada, la
posinundación y la seca, las tres van en `estacionalidad`.

## La forma de cada entrada

```json
{
  "id": "sabana_tropical",
  "bioma_verificado": { "lat": 0, "lng": 0, "eco_name": "", "eco_id": 0, "biome_num": 7 },
  "tipo_de_cifra": "ms_herbacea_total",
  "en_pie_o_anual": "crecimiento_anual",
  "kg_ms_ha_anio_min": 0,
  "kg_ms_ha_anio_max": 0,
  "kg_ms_ha_anio_tipico": null,
  "receptividad_valor": null,
  "receptividad_unidad": null,
  "uso_admisible_pct": null,
  "cobertura_lenosa_pct": null,
  "regimen_de_inundacion": null,
  "metodo": "Cómo lo midió la fuente: cortes de biomasa, jaulas de exclusión, NPP por satélite, estimación de receptividad del organismo. Con el detalle que dé: tamaño del marco, altura de corte, temperatura de secado, cuántas cosechas.",
  "que_cuenta": "Qué incluye y qué no: aéreo o con raíces, todas las especies o sólo las palatables, con o sin descuento por acceso y pisoteo.",
  "rango_lluvia_mm": "Para qué rango de precipitación anual vale. Si la fuente no lo informa, decirlo así.",
  "estacionalidad": "Cómo se reparte en el año. Si la fuente publica una curva mensual o por fase, va la curva completa.",
  "donde_deja_de_valer": "Las condiciones fuera de las cuales la fuente no se aplica.",
  "region_medida": "Dónde se midió, con el detalle que dé la fuente.",
  "medido_en": "El año o los años en que se MIDIÓ, no el de publicación.",
  "fuentes": [{ "label": "título completo de la página, sin abreviar", "url": "https://…" }],
  "verificacion": "Qué dice literalmente la fuente que sostiene estos números, y DÓNDE se leyó: resumen público, PDF abierto, página del organismo.",
  "nota": ""
}
```

Notas sobre cuatro campos:

- **`receptividad_valor` / `receptividad_unidad`: no convertir.** Si el organismo
  publica 0,6 EV/ha, va `0.6` y `"EV/ha"` tal cual. El equivalente animal lo
  define cada país distinto y mezclarlos arruina el número. La conversión se
  hace acá.
- **`uso_admisible_pct`** sólo si la fuente publica un porcentaje de utilización
  recomendado. Si no lo publica, `null`. **No inventarlo**: depende del ambiente
  y suponerlo es la mitad del error. El «take half leave half» sólo tiene
  respaldo publicado en pastizal húmedo.
- **`kg_ms_ha_anio_tipico`** sólo si la fuente publica un valor central. Si lo
  que hay es un rango, `null`. No se calcula el punto medio.
- **`medido_en`** es nuevo y es el año del dato, no el de la revista. Una de las
  mediciones montadas es de la temporada de lluvias de 1982 y se publicó mucho
  después; eso cambia cómo se lee.

## La regla que rechazó al delta del Tana, escrita entera

El lote 03 trajo un valor de hasta 30 toneladas por hectárea y año que **no se
pudo usar por tres motivos además del bioma**. Los tres valen como regla:

1. **Un valor modelado no es una medición.** El trabajo presentaba un modelo
   acoplado vegetación-suelo y lo corría para ese delta. La app ya tiene una
   función sin fuente: cambiarla por la salida de otro modelo no arregla nada.
   **Si la cifra sale de una simulación, no entra.** Sí entra un trabajo que
   modela pero además publica los datos de campo con que lo calibró: en ese caso
   va la medición, se dice que se tomó de la calibración y no de la simulación,
   y el valor modelado se menciona en `nota`.
2. **La cifra tiene que ser de lo que un animal come.** Ese modelo tenía cuatro
   compartimentos: hojas, tallos, **raíces** y material muerto aéreo. Treinta
   toneladas de eso no son treinta toneladas de pasto. Nunca una cifra que
   incluya biomasa subterránea.
3. **La cita tiene que estar en algo que se pueda abrir.** El trabajo es de
   acceso cerrado, sin copia en ningún repositorio, y la cifra citada **no
   aparece en el resumen público**: se buscó en el resumen completo que publica
   Semantic Scholar, 2.404 caracteres, y no hay ni «30», ni «t/ha», ni «kg», ni
   «tonne». Puede estar en el texto completo, pero el texto completo no abre, y
   lo que no se puede contrastar no se monta.

Por eso el campo `verificacion` ahora pide **dónde** se leyó la cita, no sólo
cuál es. Antes de elegir una fuente: si tiene DOI, consultarlo en Crossref o en
OpenAlex y mirar si trae `abstract`; si no, buscar el PDF del organismo, el
repositorio de la universidad de un autor, PubMed Central o el portal de
revistas del país. Y si la tabla con los números está detrás del editor, el
resumen solo rara vez alcanza: mejor otra fuente.

## Dónde conviene buscar

Lo aprendido en tres lotes: **los organismos que publican tablas por sitio valen
mucho más que un paper suelto.** Tres de las cinco mediciones montadas salieron
de fichas del NRCS de Estados Unidos, que publican producción anual por sitio
ecológico en año favorable, normal y desfavorable, con curva mensual y con el
estado degradado aparte. Esa es la forma ideal.

### `sabana_tropical` (bioma 7)

- **Australia, Territorio del Norte y Queensland.** Es probablemente la mejor
  bibliografía abierta del bioma: los departamentos estatales publican
  crecimiento de pastura en kg MS/ha/año **por tipo de tierra**, con condición
  del pastizal y carga recomendada. Buscar «land type» + «pasture growth» +
  «carrying capacity» para el Victoria River District, el Barkly Tableland o el
  norte de Queensland. También CSIRO y el modelo GRASP, pero priorizar las
  publicaciones con tablas medidas.
- **Sudáfrica.** El Departamento de Agricultura publica un **mapa oficial de
  capacidad de pastoreo en LSU/ha** por región, y SANParks tiene monitoreo de
  biomasa de pasto de largo plazo en Kruger. La cifra de LSU/ha es `receptividad`
  y entra tal cual, sin convertir.
- **Brasil, Cerrado.** EMBRAPA Cerrados, sobre producción de pastagem nativa.
  Cuidado: mucho de lo publicado de ahí es pastura implantada de *Brachiaria*,
  que no sirve; tiene que ser nativa.
- **Argentina, Chaco seco y Chaco húmedo.** INTA, en especial las estaciones de
  Santiago del Estero y Sáenz Peña, sobre receptividad de monte y pastizal. Acá
  la cobertura leñosa es justamente la variable del manejo, así que suele venir
  informada.
- **Venezuela y Colombia, Llanos.** CIAT y las universidades llaneras.
- **África oriental.** ILRI y FAO para los rangelands; en el Serengeti y en el
  Mara hay series largas de biomasa de pasto.

### `pastizal_inundable` (bioma 9)

- **Delta del Paraná, Argentina.** Verificado como bioma 9, y el INTA Delta del
  Paraná publica producción de los pastizales de islas y carga animal. **Es la
  entrada más valiosa posible para este lote**, porque además es donde están los
  predios que usan la app.
- **Pantanal, Brasil.** EMBRAPA Pantanal publica producción de pastagem nativa y
  capacidad de soporte, y separa por unidad de paisaje y por fase de inundación,
  que es exactamente lo que pide el campo `regimen_de_inundacion`.
- **Estados Unidos.** Fichas de sitio ecológico del NRCS para sitios de marisma
  y de pradera húmeda: buscar «Fresh Marsh», «Wet Prairie», «Subirrigated» en
  las MLRA de Florida (155, 156) y de la costa del Golfo (150, 151). Son
  legibles, publican curva mensual y ya probaron servir dos veces.
- **Delta del Okavango, Botswana**, y los **llanos de Moxos, Bolivia**.
- **África: el Sudd sudanés y el delta interior del Níger**, vía FAO; los dos
  tienen bibliografía de pastoreo trashumante con estimaciones de carga.

## Varias entradas por bioma, y eso está bien

Un bioma tan grande no tiene un número. **Se pueden entregar varias entradas con
el mismo `id`**, una por región medida, y conviene: la sabana del Cerrado y la
del Serengeti no producen lo mismo, y tener las dos vale más que un promedio que
no describe ninguna.

Dos fuentes independientes por región cuando se puedan conseguir. **Si las dos no
coinciden, se entregan las dos y se dice en `nota`**: que dos mediciones
publicadas discrepen es información, no un problema a resolver promediando.

**Cuántas entradas:** entre cuatro y ocho en total, con al menos dos de cada
bioma. Más vale una entrada menos que una sin verificar.

## Lo que no entra

- Ningún número sin fuente abierta y verificada. **Abrir cada URL antes de
  escribirla**: un identificador inventado es corto, plausible y pasa cualquier
  revisión.
- Ningún valor modelado o simulado.
- Ninguna cifra que incluya raíces.
- Ningún promedio de dos fuentes. Si hay dos, van las dos.
- Ninguna extrapolación a una región donde no se midió.
- Nada de riego ni de pastura implantada y fertilizada. Esto es **producción
  natural**: lo que da el lugar sin sembrar y sin regar. Si la fuente mide
  pastura sembrada, se dice en `que_cuenta` y no se usa como si fuera lo mismo.
- Ningún pico estacional presentado como producción anual. Si una fuente da el
  máximo de una estación, eso va en `estacionalidad`, no en
  `kg_ms_ha_anio_max`.
- Si de un bioma no se consigue nada que cumpla, va en `vacias` con el motivo.

## Cómo se declara un hueco

Las tres reglas de siempre, que vienen del encargo de fuentes propias:

1. **Una vacía cuyo motivo es de acceso no es una vacía: es un reintento
   pendiente.** En ese encargo, 16 fichas volvieron vacías por «no se pudo abrir
   la página»; pedidas de nuevo con un camino señalado, **quince trajeron
   fuente**. Probar el DOI, el sitio del organismo, el repositorio de la
   universidad de un autor, el PDF del informe suelto, PubMed Central, el portal
   de revistas del país.
2. **El motivo tiene que ser chequeable por otro.** Tres cosas: qué se buscó, el
   título y el año de al menos una publicación candidata, y por qué no sirve.
   «No encontré nada» no es un motivo.
3. **Antes de elegir una fuente, mirar si su texto o su resumen es público.**

## La entrega

Un solo bloque JSON, sin prosa alrededor:

```json
{
  "encargo": "forraje",
  "lote": 4,
  "fecha": "2026-10-15",
  "entradas": [ … ],
  "vacias": [ { "id": "…", "motivo": "…" } ]
}
```
