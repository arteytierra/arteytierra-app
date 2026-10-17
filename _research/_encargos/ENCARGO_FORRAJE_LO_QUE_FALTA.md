# Encargo — forraje: todo lo que falta, en un solo pedido

Reemplaza a los encargos por lote. Después de cinco lotes hay **6 mediciones
montadas en 4 biomas de 15**, y lo que falta no es más búsqueda del mismo tipo:
el lote 05 mostró que el pedido estaba mal formulado. Esto lo reformula.

## Lo que ya está cubierto, y no hay que volver a buscar

| bioma | sitios montados |
|---|---|
| 8 · pastizal templado | Dakota (MLRA 53B), Edwards Plateau (MLRA 81B), Delta del Paraná |
| 10 · pastizal y matorral montano | Altiplano de Puno |
| 11 · tundra | cuatro comunidades de Alaska y Yukón |
| 12 · bosque y matorral mediterráneo | Lesbos |

## Lo que cambia respecto de los cinco lotes anteriores

En el lote 05 llegaron Nylsvley (Sudáfrica) y el Parque Nacional de Nairobi: dos
de las savanas mejor documentadas del planeta, con series mensuales de años,
abiertas en la base de productividad primaria del ORNL. **Y no se pudo montar
ninguna de las dos.** No porque faltara el dato, sino porque para el mismo sitio
hay varias cifras publicadas y no se parecen. La propia ficha del ORNL de
Nairobi lo tabula, para el pastizal sin tratar:

| fuente | unidades | ANPP |
|---|---|---|
| Kinyamario e Imbamba (1992) | g/m²/año | 1.004 |
| Scurlock y Olson (2013) | g/m²/año | 811 |
| GPPDI clase A, sitio 31 | **gC**/m²/año | 104 |
| GPPDI clase B, sitio 62 (MI 108 / 109 / 110) | gC/m²/año | 60 / 100 / 370 |
| EMDI clase B, sitio 62 | gC/m²/año | 235 |

Pasando el carbono a materia seca —aproximadamente el doble— el rango publicado
para un solo pastizal va de unos 1.300 a 10.040 kg MS/ha/año: **un factor 7,6
para el mismo pasto**. Y la ficha de Nylsvley dice de su propia cifra de 76
g/m²/año que *«may have substantially underestimated productivity»*.

De ahí salen las dos reglas nuevas, y son las que más importan de todo este
archivo.

### Regla A — para cada sitio, TODAS las cifras publicadas, con su algoritmo

No se pide «la producción de este sitio». Se pide **la lista de valores
publicados para ese sitio**, cada uno con quién lo publicó, en qué unidades, y
con qué método o algoritmo se calculó. Si hay una sola, va una sola y se dice que
es una sola. Si hay cinco, van las cinco.

```json
"cifras": [
  { "valor": 1004, "unidad": "g_ms_m2_anio", "fuente_idx": 0,
    "metodo": "suma de incrementos de fitomasa viva, pie muerto y mantillo, muestreo mensual",
    "periodo": "octubre de 1984 a septiembre de 1986" },
  { "valor": 811, "unidad": "g_ms_m2_anio", "fuente_idx": 1,
    "metodo": "recálculo de la compilación, algoritmo no detallado en la tabla",
    "periodo": "no lo dice" },
  { "valor": 104, "unidad": "g_c_m2_anio", "fuente_idx": 2,
    "metodo": "GPPDI clase A", "periodo": "no lo dice" }
]
```

**`unidad` es obligatoria y literal, y tiene que distinguir carbono de materia
seca.** Es la trampa más cara de esta tabla: leer un gC/m² como si fuera g MS/m²
se equivoca por un factor de dos y el número sigue pareciendo razonable. Los
valores aceptados son `g_ms_m2_anio`, `g_c_m2_anio`, `kg_ms_ha_anio`,
`lb_acre_anio` y `t_ms_ha_anio`. **No convertir nada**: va el número y la unidad
tal como los publica la fuente, y la conversión la hace el código.

Si la fuente dice algo sobre la confiabilidad de su propia cifra —que puede estar
subestimada, que el año fue atípico, que el algoritmo cambió— **eso va textual**,
en `advertencia_de_la_fuente`. Es lo que decidió el lote 05 y vale más que el
número.

### Regla B — el algoritmo importa tanto como el sitio

Si se encuentra un trabajo que **compara algoritmos de estimación de NPP
herbácea en el mismo sitio**, eso es más valioso que una medición nueva y hay
que mandarlo. Pistas concretas: Singh et al. (1975) y Scurlock et al. (2002a)
están citados para eso; la línea de trabajo del GPPDI (Global Primary Production
Data Initiative) y del EMDI existe justamente para homogeneizar estas cifras.

Y si se encuentra la formulación original del **«Miami Model» de Lieth (1975)**
—con la fórmula completa, sus constantes, sus unidades y su rango de validez— eso
también se manda, en una entrada aparte con `"id": "modelo"`. Es el modelo con el
que la compilación del ORNL se compara y su forma es lo que acequia necesita:
**NPP es el mínimo de una función de la lluvia y una función de la temperatura.**
Una escalera de lluvia sola no puede dar eso.

## Las reglas de los lotes anteriores, que siguen valiendo

1. **El bioma se verifica sobre la coordenada que publica la fuente**, no sobre
   un punto que la represente. En el lote 04 el ancla estaba a 65 km del sitio y
   los dos puntos caían en biomas distintos. Va `coordenada_de_la_fuente`
   textual, y `bioma_verificado` con `es_el_sitio_publicado`.
2. **Tiene que ser un flujo y no un stock.** `en_pie_o_anual` en
   `crecimiento_anual`. Biomasa en pie no sirve: en el altiplano es 1,5 a 3 veces
   la producción anual, en la tundra 77 a 211, y en el Delta del Paraná el
   potrero con más pasto parado entregó MENOS forraje cosechado.
3. **Decir si es lo herbáceo total o sólo lo forrajero** (`fraccion`). En el
   Delta la total fue de 1,36 a 1,70 veces la forrajera.
4. **Las cuatro condiciones de siempre:** que diga quién midió y cuándo (año de
   medición, no de publicación), que se pueda abrir sin login ni pago, que diga
   qué midió con unidades y qué incluye, y que diga dónde.
5. **Una fuente que no se pudo abrir es un reintento, no una ausencia.** Va a
   `vacias` con el motivo y vuelve.

## La consulta del bioma

```
https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/Resolve_Ecoregions/FeatureServer/0/query
  ?geometry=<lng>,<lat>&geometryType=esriGeometryPoint&inSR=4326
  &spatialRel=esriSpatialRelIntersects&outFields=ECO_NAME,ECO_ID,BIOME_NUM&returnGeometry=false&f=json
```

Si el servicio no responde, la entrada va con `"bioma_verificado": null` y se
dice. Nunca con un `ECO_ID` recordado.

## Los nueve biomas que faltan, por orden de importancia

### Prioridad 1 — donde pastorea casi todo el mundo

**Bioma 7 · `sabana_tropical`.** El más importante y el más difícil, por lo de
arriba. Lo que se pide acá NO es otra medición: es **el conjunto de cifras
publicadas para los sitios que ya se conocen**, con algoritmo y unidades, más
cualquier trabajo que compare algoritmos. Sitios ya verificados como bioma 7:

| sitio | lat, lng | ECO_ID |
|---|---|---|
| Nylsvley, Sudáfrica | −24,65 / 28,70 | 38 · Central bushveld |
| Towoomba, Sudáfrica | −24,90 / 28,35 | 38 · Central bushveld |
| Parque Nacional de Nairobi | −1,33 / 36,83 | 57 · Southern Acacia-Commiphora |
| Serengeti sur | −2,25 / 34,25 | 57 |
| Kruger, basaltos del sur | −25,2364 / 31,9039 | 48 · Limpopo lowveld |

Towoomba tiene ficha propia en el ORNL (1949-1990) que no se alcanzó a leer: es
el reintento más valioso del bioma, porque está a 60 km de Nylsvley, en la misma
ecorregión y con 6 mm de diferencia de lluvia, y la compilación le da 198
g/m²/año contra 76. Dos sitios casi idénticos y un factor 2,6.

Aviso para no perder tiempo: **Lamto (Costa de Marfil) y Olokemeji (Nigeria) NO
son bioma 7.** Los verifiqué y dan bioma 1. Si aparecen, van ahí.

**Bioma 9 · `pastizal_inundable`.** Tres lotes sin entrar. Lo que falta es un
total anual, porque lo que hay son tasas por fecha. El dato que ordena la
búsqueda: según Penha et al. (1999), citado por Pozer y Nogueira, **cerca del
70 % de la producción anual ocurre durante la inundación**, por las macrófitas
acuáticas grandes. Entonces una fuente que mida sólo la estación seca o sólo las
especies terrestres está midiendo el 30 %. Pistas: Camarão et al. (2006) de
primera mano, que el documento de Embrapa cita con producción anual de 1.578 a
8.329 kg/ha para *Hymenachne amplexicaulis*; INTA Delta del Paraná; los Llanos
de Venezuela y Colombia; y las fichas de sitio ecológico del NRCS para las MLRA
de marisma de Florida y del Golfo (150, 151, 155, 156), que publican producción
anual por comunidad y por año seco, normal y húmedo — que es exactamente la
forma que hace falta.

**Bioma 13 · `desierto_matorral_xerofilo`.** Nunca se pidió y es de los que más
importa: media Argentina, el norte de México, Australia central, el Sahel
pastoril. Acá las **fichas de sitio ecológico del NRCS** son la mejor fuente del
mundo y publican exactamente lo que el archivo necesita, en lb/acre por año seco
/ normal / húmedo: buscar MLRA de Arizona, Nuevo México, Nevada y el oeste de
Texas. También INTA Patagonia y los trabajos de receptividad del monte y la
estepa patagónica. Aviso: Montecillo (México, −19,46 / −98,91) da bioma 13
verificado y la compilación le pone 1.063 g/m²/año, que para 590 mm de lluvia es
muy alto y huele a parcela manejada: hace falta la ficha primaria del ORNL
(«NPP Grassland: Montecillo, Mexico, 1984-1994») antes de creerlo.

### Prioridad 2 — pastoreo bajo monte

El error a evitar en los cuatro biomas de bosque es **mandar la NPP del rodal**.
La productividad total de un bosque incluye la madera, y un animal no come
madera. Lo que se pide es **la capa herbácea o el sotobosque pastoreable**, y si
la fuente no la separa, la entrada no sirve y se dice por qué.

**Bioma 2 · `bosque_tropical_seco`.** Vacío desde el lote 01. La Caatinga se
rechazó dos veces. Pista verificada: Vindhyan (India, 24,30 N / 83,00 E) da
bioma 2 y la compilación le pone 538 g/m²/año con 298 mm de lluvia, que es
llamativo y pide la fuente primaria. También: el bosque seco chiquitano, el
Chaco seco (INTA Santiago del Estero y Chaco publican receptividad y producción
de pastizal bajo monte), y los *dry deciduous* de India con trabajos de IBP.

**Bioma 1 · `bosque_tropical_humedo`.** El lote 01 trajo Sunsari (Nepal) con NPP
herbácea de 1.300 a 1.700 kg/ha, que quedó sin montar. Acá entran Lamto
(−6,22 / −5,03, bioma 1 verificado, 830 g/m²/año en la compilación) y Olokemeji
(7,42 / 3,55, bioma 1, 680), los dos con ficha en el ORNL. Son los mosaicos
bosque-savana, y para acequia valen como bioma 1 porque es lo que RESOLVE
devuelve ahí. También los sistemas silvopastoriles amazónicos de EMBRAPA.

**Bioma 3 · `bosque_coniferas_tropical`.** Chico y real: los pinares de pino
caribe de Honduras, Nicaragua y Belice se pastorean. Buscar en CATIE y en la FAO.

### Prioridad 3 — los templados y el boreal

**Biomas 4 y 5 · bosque templado caducifolio/mixto y de coníferas.** Pastoreo de
sotobosque y *dehesa* / montado ibérico, que es el caso mejor documentado:
INIA y CSIC publican producción de pasto bajo encinar en kg MS/ha/año. También
los *woodland pasture* del Reino Unido y los *silvopasture* del sudeste de
Estados Unidos (fichas del NRCS otra vez).

**Bioma 6 · `bosque_boreal_taiga`.** El forraje real acá es **liquen y
reno/caribú**, no pasto. Hay literatura escandinava y rusa con producción de
liquen en kg MS/ha/año y con capacidad de carga de reno por hectárea. Ojo con dos
cosas: el liquen tiene un recambio de décadas, no de un año —así que una biomasa
en pie de liquen es un stock larguísimo y hay que decirlo—, y el módulo de tundra
ya documenta que ahí lo parado es de 77 a 211 veces la producción anual.

## Lo que queda explícitamente afuera

**Bioma 14 · `manglar`** y **bioma 98 · `roca_hielo`**: no se busca nada. No es
que falte el dato: no hay un número de forraje que tenga sentido imprimir ahí, y
lo correcto es que acequia no lo imprima. Si llega una entrada de estos dos, se
descarta.

## La forma de cada entrada

```json
{
  "id": "sabana_tropical",
  "sitio": "nombre corto del lugar, para poder nombrarlo en pantalla",
  "coordenada_de_la_fuente": "textual, como la escribe la fuente",
  "bioma_verificado": { "lat": 0, "lng": 0, "eco_name": "", "eco_id": 0, "biome_num": 7, "es_el_sitio_publicado": true },
  "fraccion": "herbacea_total | solo_forrajeras | sotobosque_pastoreable | no_lo_dice",
  "en_pie_o_anual": "crecimiento_anual | biomasa_en_pie | no_lo_dice",
  "cifras": [{ "valor": 0, "unidad": "g_ms_m2_anio", "fuente_idx": 0, "metodo": "", "periodo": "" }],
  "advertencia_de_la_fuente": "textual, si la fuente dice algo sobre la confiabilidad de su propia cifra",
  "cuantas_cosechas": null,
  "lluvia_mm": "la media anual del sitio y, si la publica, el total de los años medidos",
  "temperatura_c": "la media anual del sitio, porque el modelo que hace falta la necesita",
  "que_cuenta": "aéreo o con raíces, todas las especies o sólo las forrajeras, vivo o con muerto, a qué altura se cortó",
  "estacionalidad": "cómo se reparte en el año; si hay curva mensual o tasas por período, va completa",
  "donde_deja_de_valer": "incluido el tamaño del experimento y si las diferencias dieron significativas",
  "region_medida": "",
  "medido_en": "el año o los años en que se MIDIÓ",
  "fuentes": [{ "label": "título completo, sin abreviar", "url": "https://…" }],
  "verificacion": "qué dice LITERALMENTE la fuente y dónde se leyó; si se citó una página, el número",
  "nota": ""
}
```

`temperatura_c` es nuevo y es obligatorio donde la fuente la publique: sin ella
no se puede evaluar un modelo que toma el mínimo entre lluvia y temperatura, y
ese es el camino que quedó abierto.

## Cómo entregarlo

**Un lote por prioridad, no los nueve biomas de una vez.** Tres entregas:

- `encargos-gpt/entregas/forraje/06.json` — prioridad 1: biomas 7, 9 y 13.
- `encargos-gpt/entregas/forraje/07.json` — prioridad 2: biomas 2, 1 y 3.
- `encargos-gpt/entregas/forraje/08.json` — prioridad 3: biomas 4, 5 y 6.

Cada una con la misma forma de siempre:

```json
{ "encargo": "forraje", "lote": 6, "fecha": "…", "entradas": [], "vacias": [] }
```

Dos a cuatro entradas por bioma, y mejor dos que aguanten que cuatro con una
floja. Ya está medido que dentro de un solo bioma la producción varía por un
factor 11 entre sitios, y que dentro de un solo sitio varía por un factor 7,6
según el algoritmo. **Las dos dispersiones son el dato, no el ruido**, así que
no hay que elegir «la mejor cifra»: hay que mandarlas todas y decir de dónde
sale cada una.
