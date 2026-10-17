# Encargo — forraje: las tres fracciones que faltan, y los biomas que quedan

Reemplaza a `ENCARGO_FORRAJE_LO_QUE_FALTA.md`, que ya se respondió con los lotes
06, 07 y 08. Hay **10 mediciones montadas en 7 biomas de 15**, y el modelo
climático ya está escrito en el código. Lo que falta cambió de naturaleza otra
vez, y conviene entender por qué antes de buscar nada.

Este pedido es largo a propósito: son **cuatro frentes** y cada uno da para una
entrega. No hace falta terminarlos todos de una.

---

## Lo que ya está montado, y no hay que volver a buscar

| bioma | sitios montados | tipo de cifra |
|---|---|---|
| 4 · bosque templado caducifolio y mixto | Różańsko (Polonia) | sotobosque |
| 5 · bosque templado de coníferas | Cascade Head 1A (Oregón) | sotobosque |
| 8 · pastizal templado | Dakota, Edwards Plateau, Delta del Paraná, Waring's Woods | pastizal ×3 + sotobosque ×1 |
| 10 · pastizal y matorral montano | Altiplano de Puno | pastizal |
| 11 · tundra | cuatro comunidades de Alaska y Yukón | pastizal |
| 12 · bosque y matorral mediterráneo | Lesbos | pastizal |
| 13 · desierto y matorral xerófilo | Montecillo (México) | pastizal |

Y está montado el **Miami Model de Lieth**, verificado en dos fuentes
independientes, como contraste climático: devuelve NPP total del ecosistema, dice
si limita el agua o la temperatura, y puede desmentir una cifra imposible.

Siguen vacíos: **1, 2, 3, 6, 7, 9**. Afuera por decisión: **14 (manglar)** y
**98 (roca y hielo)**.

---

## Por qué el pedido vuelve a cambiar de forma

Los lotes 06 y 08 encontraron juntos una cosa que ordena todo lo demás. La ficha
del ORNL de Montecillo publica las tres fuentes que midieron la **misma** serie
de cosechas:

| fuente | NPP aérea | NPP subterránea | NPP total |
|---|---|---|---|
| García-Moya y Montañez Castro (1992) | 669 | 1.007 | 1.676 |
| Scurlock et al. (2002) | 609 | 1.174 | 1.783 |
| Scurlock y Olson (2013) | 1.063 | 678 | 1.741 |

**El total coincide dentro de un 6 %. La parte aérea se mueve un 75 %, y la
subterránea un 73 % en sentido contrario.** Los algoritmos no discuten cuánta
materia seca produce ese pastizal: discuten **cuánta quedó arriba y cuánta
abajo**. Y el trabajo polaco del lote 08 lo confirmó midiéndolo de frente, con
seis algoritmos sobre las mismas cosechas: el método mueve el resultado 1,96× y
el año sólo 1,38×.

Eso tiene una consecuencia práctica grande y es el eje de este encargo. **La
cantidad robusta es la NPP total, y es justamente la que el Miami Model
predice.** Lo que acequia necesita —kilos de pasto comible por hectárea y por
año— se obtiene de ahí bajando por tres escalones, y de los tres **no tiene
fuente para ninguno**:

```
NPP total del ecosistema        ← el Miami Model la estima, y los métodos coinciden
   × fracción aérea             ← FALTA (fracción A)
   × fracción herbácea del piso ← FALTA (fracción B), depende del dosel
   × fracción comible           ← FALTA (fracción C)
= kilos de forraje por hectárea y por año
```

Cada escalón es un cuerpo de literatura propio, publicado y grande. **Eso es lo
que pide este encargo**, y es más valioso que una medición más de un bioma, porque
convierte un modelo que ya está en el código en un número usable.

Las mediciones de biomas que faltan siguen pedidas, en el frente 4.

---

## Las reglas, que son las mismas y se cumplen todas

Vienen de errores pagados. Ninguna es negociable.

### Regla A — todas las cifras publicadas de cada sitio, con su algoritmo

No «la producción del sitio»: **la lista** de valores publicados, cada uno con
quién lo publicó, en qué unidad, y con qué método. Si hay una sola, va una sola y
se dice que es una sola.

**`unidad` es obligatoria y literal, y tiene que distinguir carbono de materia
seca.** Leer un gC/m² como g MS/m² se equivoca por un factor dos y el número
sigue pareciendo razonable. Aceptadas: `g_ms_m2_anio`, `g_c_m2_anio`,
`kg_ms_ha_anio`, `lb_acre_anio`, `t_ms_ha_anio`, y para este encargo también
`fraccion_0_1`, `porcentaje`, `razon_raiz_tallo`. **No convertir nada**: el número
y la unidad como los publica la fuente.

### Regla B — cuando la fuente tiene ANPP, BNPP y TNPP, van las tres

Siempre. Es la columna que resultó frágil y no se puede reconstruir después. Si
sólo hay una, se dice cuál es.

### Regla C — el tratamiento se nombra o la cifra no sirve

**Esta regla la paga el lote 05 entero.** Towoomba (Sudáfrica) parecía el dato
más valioso del bioma 7: a 60 km de Nylsvley, misma ecorregión, 6 mm de
diferencia de lluvia anual y 2,6 veces la producción. La ficha primaria del ORNL
dice en su segunda línea que era un **ensayo de fertilización** con cinco niveles
de nitrógeno por tres de fósforo, **sobre un área de la que se removieron todos
los árboles**, y que el 198 g/m²/año sale de la fila `P0N3`: un tratamiento
fertilizado.

Coordenada verificada, bioma verificado, fuente abierta — y una parcela
agronómica. Para cada cifra va un campo `tratamiento` con uno de:
`control_sin_tratar`, `fertilizado`, `irrigado`, `pastoreado`, `clausurado`,
`quemado`, `no_lo_dice`. **`no_lo_dice` es una respuesta válida y mucho mejor que
adivinar.**

### Regla D — sin coordenada publicada no hay entrada

El bioma se consulta sobre **la coordenada que la fuente publica**, no sobre una
que represente la región. Vindhyan (India) se cayó del lote 07 por esto: cifras
buenas, método descrito (*trough-peak*), tres sitios nombrados, y ninguna
coordenada puntual en el resumen accesible. Si la coordenada está en el PDF
completo o en el archivo de metadatos, hay que abrirlo.

Van dos campos: `coordenada_de_la_fuente` (textual, como la publica) y
`es_el_sitio_publicado` (`true` sólo si es del sitio medido y no una referencia
regional).

### Regla E — nunca promediar un máximo con un mínimo para sacar una media

Varias fichas del ORNL publican «mean monthly minimum 10,7 °C (enero)» y «mean
monthly maximum 29,5 °C (marzo)»: son **el mes más frío y el más cálido**, y no
promedian a la media anual. Por eso el Parque Nacional de Nairobi, que tiene la
lluvia publicada, igual no se puede contrastar con el modelo climático.

`temperatura_c` se llena **sólo** si la fuente publica una media anual y lo dice
así. En cualquier otro caso va `null` y el motivo en `nota`.

### Regla F — flujo y no stock

`en_pie_o_anual` tiene que ser `crecimiento_anual`. Lo que está parado no es lo
que creció, y la distancia es enorme: el lote 08 trajo la cuarta confirmación y
la más extrema, en los pastizales de líquenes de Escandinavia, donde el
crecimiento anual es de 60 a 160 kg/ha y la biomasa en pie de 500 a 1.500, con
rodales viejos arriba de 3.000. **Hasta cincuenta veces más stock que flujo.**

### Regla G — la advertencia de la fuente va textual

Si dice que su propia cifra puede estar subestimada, que el año fue atípico, que
el algoritmo cambió: va entre comillas en `advertencia_de_la_fuente`. Es lo que
más decisiones tomó en los ocho lotes anteriores.

---

## La consulta del bioma

Con la coordenada publicada, sobre el servicio de RESOLVE Ecoregions:

```
https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/Resolve_Ecoregions/FeatureServer/0/query?geometry=<lng>,<lat>&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=ECO_NAME,ECO_ID,BIOME_NUM&returnGeometry=false&f=json
```

Ojo con el orden: **longitud primero**, y el oeste y el sur van negativos.

En los lotes 06-08 las doce entradas vinieron con `bioma_verificado: null` y la
nota «el servicio no fue accesible». Está bien declararlo así; se verificaron del
otro lado y **dos de nueve estaban mal supuestas**, las dos del mismo modo: se
clasificó por lo que el sitio parece y no por lo que el polígono dice. Un rodal
de Pseudotsuga de 47.120 g/m² de biomasa arbórea parece bosque de coníferas, y la
coordenada que su ficha publica cae en una sabana de robles, bioma 8.

Si el servicio no responde, **la entrada igual se manda** con la coordenada bien
copiada y `bioma_verificado: null`. Lo que no se puede es inventar el bioma.

Los quince: 1 bosque tropical húmedo · 2 bosque tropical seco · 3 bosque tropical
de coníferas · 4 bosque templado caducifolio y mixto · 5 bosque templado de
coníferas · 6 bosque boreal/taiga · 7 sabana tropical · 8 pastizal templado ·
9 pastizal inundable · 10 montano · 11 tundra · 12 mediterráneo · 13 desierto y
matorral xerófilo · 14 manglar · 98 roca y hielo.

---

# Frente 1 — la fracción aérea de la NPP (`09.json`)

**El más valioso de los cuatro.** Es el escalón que convierte la cantidad robusta
—NPP total— en la que acequia necesita.

Lo que se pide: **razones raíz:tallo y fracciones aéreas de la NPP publicadas, por
tipo de vegetación o por bioma**, con el número de sitios detrás de cada valor.
Hay revisiones y síntesis globales dedicadas exactamente a esto, que es lo que las
hace valiosas: no son un sitio, son cientos.

Pistas concretas, por si ayudan a arrancar; no son obligatorias y puede haber
mejores:

- **Mokany, Raison y Prokushkin, «Critical analysis of root:shoot ratios in
  terrestrial biomes»** (*Global Change Biology*, 2006). Es la referencia del
  tema y tabula razones por bioma con el número de observaciones. Ojo con una
  distinción que ese trabajo hace y que importa mucho acá: una razón de
  **biomasa** raíz:tallo no es una razón de **producción** raíz:tallo.
- **Jackson et al., «A global analysis of root distributions for terrestrial
  biomes»** (*Oecologia*, 1996).
- **Poorter et al.** sobre asignación de biomasa, para ver cuánta variación hay
  dentro de un mismo tipo.
- La propia base del ORNL: muchas de sus fichas publican ANPP, BNPP y TNPP del
  mismo sitio, así que **la fracción aérea se puede calcular sitio por sitio**.
  Eso es una fuente primaria de este dato y vale tanto como una revisión.

Para cada valor hace falta saber:

- Si es **biomasa** o **producción**. No son lo mismo y confundirlas es el error
  caro de este frente.
- Si el denominador es la NPP total o sólo la de la capa herbácea.
- Cuántos sitios u observaciones hay detrás, y la dispersión que la fuente
  publique (desvío, rango, intervalo).
- Si la fuente avisa que su propio valor es poco confiable para algún bioma.
  Sabemos que lo va a decir del pastizal.

Y una pregunta directa, que la literatura sí trata y que vale escribir aunque la
respuesta sea «no se sabe»: **¿hay evidencia publicada de que la fracción aérea
cambie con la lluvia o con la temperatura dentro de un mismo bioma?** Si la hay,
con qué forma funcional.

---

# Frente 2 — el forraje bajo el dosel (`10.json`)

Los lotes 07 y 08 dejaron esto medido en dos puntos del mismo transecto de
Oregón, publicados en la misma tabla:

| sitio | cobertura herbácea | NPP del rodal | capa herbácea | la herbácea es |
|---|---|---|---|---|
| Cascade Head 1A, aliso rojo | 35,2 % | 1.630 | 41 | 2,5 % |
| Waring's Woods, Pseudotsuga | 4,9 % | 1.540 | 6 | **0,4 %** |

En g MS/m²/año. Los dos rodales producen casi lo mismo y su sotobosque difiere
6,8 veces; la cobertura herbácea difiere 7,2 veces. **Lo que decide el forraje de
un bosque es la luz que llega al piso.**

Dos puntos no son una curva. Lo que se pide: **relaciones publicadas entre la
producción de forraje del sotobosque y la densidad del dosel**, con la variable
del dosel explícita —cobertura de copas en %, área basal en m²/ha, índice de área
foliar, o densidad de árboles por hectárea— y la forma de la relación tal como la
fuente la publica: tabla, ecuación o gráfico descrito.

Esta es literatura abundante y vieja, de manejo de pastizal arbolado y de
silvopastura. Dónde mirar:

- El **Servicio Forestal de Estados Unidos** publicó curvas forraje-dosel para
  pinares de *Pinus ponderosa* desde los años 60 y 70, y para otros tipos
  forestales. Buscar por «herbage production», «canopy cover», «basal area»,
  «overstory-understory relationships». Los nombres que aparecen seguido son
  **Clary**, **McConnell y Smith**, **Pase**, **Jameson**.
- La literatura de **silvopastura** de climas templados y tropicales, con
  mediciones de pasto bajo distintas densidades de árbol: CATIE y CIPAV en
  América Latina, y los sistemas de *dehesa* y *montado* en la península ibérica.
- Trabajos de **raleo**, que son los más útiles de todos porque miden el mismo
  sitio antes y después: la densidad cambia y el clima no.

Para cada relación hace falta decir si la cifra de forraje es **toda la capa
herbácea** o sólo las especies palatables, porque esa es la fracción C y es otra
cosa.

Interesa especialmente, y es una pregunta concreta: **¿la relación se satura, o
es lineal hasta el dosel cerrado?** Y si la fuente publica un umbral de cobertura
arriba del cual el forraje es despreciable, cuál es.

---

# Frente 3 — qué parte del pasto es comible (`11.json`)

El escalón más chico de los tres y el que más se usa a ojo. acequia hoy aplica un
«uso admisible» por banda de lluvia que sí tiene fuente, pero eso es otra cosa:
es **cuánto se le puede sacar sin arruinar la planta**. La fracción C es anterior
y es física: **de la materia seca herbácea que creció, cuánta es de especies que
el animal come.**

El lote 04 la midió sin proponérselo, en el Delta del Paraná: la materia seca
total del mismo muestreo era de 11.200 a 11.400 kg/ha y la de las **especies
forrajeras** de 6.700 a 8.250. O sea que las forrajeras eran del 59 % al 74 % del
total herbáceo, en un pastizal natural degradado de albardón.

Un punto no alcanza. Lo que se pide: **mediciones publicadas que separen, en el
mismo muestreo, la materia seca de especies forrajeras de la materia seca
herbácea total.** Con la lista de especies si la publica, y con el criterio con
que las clasificó, que puede ser distinto entre trabajos y hay que poder verlo.

Dónde mirar: trabajos de composición botánica de pastizales naturales de los
institutos nacionales de agricultura —INTA en Argentina, Embrapa en Brasil, INIA
en Uruguay, Perú y Chile, Agriculture and Agri-Food Canada, el NRCS en Estados
Unidos—, y la literatura de condición y tendencia de pastizal, que mide
exactamente esto porque es su herramienta de diagnóstico.

Interesa también, y vale como entrada aparte: **cuánto cambia esa fracción con la
condición del pastizal.** Si un trabajo mide la misma región en buena y en mala
condición, eso es más valioso que dos mediciones de sitios distintos.

---

# Frente 4 — los seis biomas que siguen vacíos (`12.json` y los que haga falta)

En orden de importancia para acequia, que es el orden en que la gente pastorea.

### 7 · sabana tropical — tres lotes y sigue vacío

Es donde cae la mayoría de los predios ganaderos del mundo y es el que más se
resistió. Lo que falló cada vez, para no repetirlo:

- **Nairobi**: siete cifras publicadas para el mismo pastizal, factor 7,6.
- **Nylsvley**: la ficha avisa que su propia cifra *«may have substantially
  underestimated productivity»*.
- **Towoomba**: ensayo de fertilización con los árboles removidos.
- **Serengeti y Kruger** (lote 04): miden biomasa en pie, no producción.

Lo que serviría, y es específico: **un sitio de sabana con serie de cosechas y un
algoritmo nombrado, en una parcela declarada como control sin tratar.** O —y esto
sería mejor todavía— **un trabajo que compare algoritmos sobre las mismas
cosechas en sabana**, como el polaco del lote 08 pero en el bioma 7. Si existe,
es la entrada más valiosa de todo este encargo.

Pistas no exploradas: los sitios del Programa Biológico Internacional en India
(Kurukshetra, Ujjain, Varanasi, Ratlam, Pilani) tienen fichas en el ORNL y algunos
caen en bioma 7; **Singh y Yadava** midieron un pastizal de Kurukshetra con serie
mensual. La red **SAFARI** del sur de África. Los *llanos* de Venezuela y
Colombia, con trabajos de **San José** y de **Sarmiento**, que son de la escuela
que más cuidó la distinción flujo-stock.

### 9 · pastizal inundable

El lote 05 dejó claro que lo que manda es la fase hidrológica y no la lluvia:
cerca del **70 % de la producción anual ocurre durante la inundación**. Lo que
falta es una cifra **anualizada** que incluya esa fase. Pistas: Camarão et al. en
Embrapa para *Hymenachne amplexicaulis*, que el lote 06 no pudo abrir; el
Pantanal con años no atípicos; los *esteros* del Iberá; el delta del Okavango; las
*várzeas* amazónicas.

### 2 · bosque tropical seco — un reintento barato

**Vindhyan ya está prácticamente resuelto.** 377 a 664 g MS/m²/año en áreas no
pastoreadas de tres sitios (Ranitali, Hathinala y Telburva), método *trough-peak*
descrito, dos ciclos anuales completos 1986/87 y 1987/88, ficha en el ORNL. Falta
**una sola cosa: la coordenada puntual de cada sitio**, que debe estar en el PDF
completo de la ficha o en su archivo de metadatos. Con eso entra.

### 1 · bosque tropical húmedo

Lamto (Costa de Marfil) es la mejor candidata y no entró por dos motivos: su
ficha tabula cuatro fuentes con una dispersión cercana a 2, y *«normally 50-90 %
of above-ground grass biomass is burned annually»*. Si hay un trabajo de Lamto
que publique la producción **corregida por el fuego**, o una parcela protegida
del fuego, eso resuelve el bioma. Alternativa: sotobosque de bosque húmedo
tropical con flujo anual, que es lo que ya aportó Nepal en el lote 01.

### 6 · bosque boreal y taiga

Hace falta **crecimiento anual de líquenes con sitio, coordenada y años medidos**.
La revisión del lote 08 da el orden de magnitud (60 a 160 kg/ha/año en los
pastizales más productivos) citando a **Ahti (1977)**, que es el trabajo primario
a buscar. También sirven mediciones de sotobosque de taiga —arándano, *Carex*—
con flujo anual.

### 3 · bosque tropical de coníferas

El lote 07 lo devolvió vacío con el motivo correcto. Pinares de *Pinus caribaea* y
*Pinus oocarpa* de Honduras, Nicaragua, Belice y Cuba: se pastorean de hecho y
alguien tiene que haberlo medido. Buscar en CATIE, FAO y en las universidades
agrarias de la región. Si no aparece nada con flujo anual, **decirlo y dejarlo
vacío es la respuesta correcta.**

---

## La forma de cada entrada

Para los frentes 1, 2 y 3 —que no son mediciones de sitio sino relaciones— vale
dejar en `null` los campos que no apliquen (`coordenada_de_la_fuente`,
`bioma_verificado`, `estacionalidad`) y usar `region_medida` para decir el alcance
de la relación. Lo que **nunca** puede faltar es `unidad`, `metodo`,
`advertencia_de_la_fuente` y las fuentes con URL.

```json
{
  "encargo": "forraje",
  "lote": 9,
  "fecha": "2026-10-__",
  "entradas": [
    {
      "id": "fraccion_aerea",
      "sitio": "o el alcance de la relación, si no es un sitio",
      "coordenada_de_la_fuente": "textual como la publica la fuente, o null",
      "es_el_sitio_publicado": true,
      "bioma_verificado": null,
      "fraccion": "herbacea_total | solo_forrajeras | sotobosque_pastoreable | no_lo_dice",
      "en_pie_o_anual": "crecimiento_anual",
      "cifras": [
        { "valor": 0.0, "unidad": "fraccion_0_1", "fuente_idx": 0,
          "metodo": "cómo se obtuvo, y si es biomasa o producción",
          "tratamiento": "control_sin_tratar",
          "n_sitios": 0,
          "dispersion": "lo que la fuente publique: desvío, rango, intervalo",
          "periodo": "años medidos, o «no lo dice»" }
      ],
      "advertencia_de_la_fuente": "textual, entre comillas",
      "lluvia_mm": null,
      "temperatura_c": null,
      "que_cuenta": "qué incluye y qué no, con el numerador y el denominador explícitos",
      "estacionalidad": null,
      "donde_deja_de_valer": "el límite que la propia fuente declara",
      "region_medida": "alcance real: un sitio, una región, global",
      "medido_en": "años",
      "fuentes": [ { "label": "cita completa", "url": "https://..." } ],
      "verificacion": "dónde dice exactamente lo que se le atribuye: sección, tabla, página",
      "nota": "lo que quedó sin resolver y por qué"
    }
  ],
  "vacias": [
    { "id": "...", "motivo": "qué se buscó, dónde, y qué faltó para que entrara" }
  ]
}
```

## Cómo entregarlo

**Un frente por entrega, no los cuatro juntos.** El frente 1 primero, que es el
que desbloquea el cálculo.

- `09.json` — frente 1: la fracción aérea de la NPP.
- `10.json` — frente 2: el forraje bajo el dosel.
- `11.json` — frente 3: qué parte del pasto es comible.
- `12.json` — frente 4: los biomas vacíos, empezando por el 7 y el 2.

Un bloque JSON por entrega, nada más. Las entradas que no se pudieron resolver van
en `vacias` con el motivo, y **un `vacias` bien escrito vale tanto como una entrada
montada**: dice dónde no hay que volver a buscar.

Tres cosas que conviene tener a mano todo el tiempo:

1. **Si la fuente no lo dice, el campo va en `null`.** Ocho lotes de experiencia:
   lo que más entradas tiró abajo no fue la cita inventada, fue el campo bien
   llenado con el dato equivocado.
2. **La dispersión es el dato, no el ruido.** Si para un sitio hay cinco cifras,
   las cinco son la respuesta.
3. **Nada se convierte.** El número y la unidad como los publica la fuente.
