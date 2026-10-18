# Encargo de forraje — lote 15

**Para:** una conversación nueva de GPT con búsqueda web.
**Salida:** un solo archivo, `15.json`, con la forma de la sección 6.
**Fecha del encargo:** 18/10/2026.

---

## 1. Qué es esto

acequia es una app que calcula cuántos animales aguanta un campo. Ese número sale
hoy de una función que mira **una sola variable**, la lluvia anual, y devuelve uno
de cinco escalones. No tiene fuente. Si se equivoca, no se cae: imprime un número
plausible y alguien compra vacas con eso.

Vengo armando el archivo de mediciones publicadas que la va a reemplazar. Catorce
lotes. **Dieciséis mediciones montadas en ocho biomas**, cada una con su método, su
unidad literal, su rango de validez y un test que la vuelve a derivar de la fuente.

Lo que vos traés se verifica antes de montarse: abro la fuente, le pregunto a
RESOLVE por la coordenada, le pregunto a ESA WorldCover qué hay en ese píxel, y
compruebo que las cifras estén donde decís. **Lo que no verifica, no entra, y el
motivo queda escrito.** Eso no es desconfianza: tres de los últimos cuatro lotes
encontraron un error mío con las reglas que yo había escrito para revisarte a vos.

---

## 2. Las tres lecciones del lote 14, que son el criterio de búsqueda de este

El lote 14 fue a buscar la clase 20 del arbustal, trajo exactamente lo que le pedí,
y **no sirvió**. Entender por qué es el trabajo de este lote.

### a. Una coordenada bien formada no es una coordenada verificada

Las dos que llegaron eran de un pueblo. Las dos tenían grados, minutos y hemisferio
impecables.

| lo que publicaba la fuente | lo que hay en ese píxel |
|---|---|
| Calabozo, «study site»: 8,93 N / 67,42 W | **93 % construido**: es la ciudad |
| Río Mayo: 45°41′ S / 70°16′ W, al minuto | la clase cambia con la escala; 13 % construido a 2 km |

Y lo peor: la ficha de Calabozo publica **dos** coordenadas separadas 12,3 km y,
cuatro párrafos más abajo, dice que el sitio está *«about 10-km south-southeast of
Calabozo»*. **La fuente se desmiente sola.** La entrega no lo notó, y yo tampoco
hasta que consulté el píxel.

Por eso este lote trae una regla nueva, la M, y un campo que pide **todas** las
coordenadas que publique la fuente más cualquier frase sobre la distancia a un
pueblo.

### b. La clase de cobertura es una propiedad del mapa, no de la vegetación

El lote 14 trajo una estepa que su propia fuente llama **arbustiva**, con 12 % de
cobertura de arbustos y tres especies leñosas medidas una por una. El píxel de
WorldCover ahí dice **pastizal**: el arbustal es el 9,4 %, el 6,5 % y el 3,1 % de
los píxeles a 500 m, 2 km y 5 km, y baja al ampliar.

**Lo que un agrónomo llama estepa arbustiva, el satélite lo llama pastizal.** Ése
fue mi error de método durante cinco lotes: pedir «arbustal» y recibir trabajos que
usan esa palabra.

Para que un píxel de 10 m salga clase 20 hace falta un arbustal **de verdad
cerrado**. En la práctica: cobertura leñosa alta —no 12 %, más bien 30 % para
arriba— y nada de dosel arbóreo. Un trabajo que no publique la cobertura leñosa con
su método no sirve para este frente, aunque mida forraje perfecto.

### c. Cuando se corrige un número, se busca el número

El lote 13 encontró que un par de cifras mías no era una fracción y lo corrigió **en
el lugar donde lo había encontrado**. El lote 14 encontró el mismo error en tres
lugares más del mismo archivo, incluido el título de un test que decía «en el mismo
muestreo» y pasaba igual.

Para vos esto significa: si una cifra aparece dos veces en el trabajo con valores
distintos, **traé las dos y decí dónde está cada una**. No elijas.

---

## 3. Qué hace falta

### a. La serie de años de un solo sitio — PRIORIDAD, y es nueva

Esto desplaza al arbustal como prioridad, y el lote 14 es el motivo.

Río Mayo midió cinco años en el mismo lugar. Con lluvias de 55 a 191 mm, la
producción fue de 21 a 79 g/m²/año. **Los cinco años caen en el mismo escalón de la
función que quiero reemplazar, y la función les da 700 kg/ha a todos.** Un factor
3,6 adentro de un tramo que devuelve una constante.

Y los autores dicen cómo es la respuesta: *«There was a large reduction in ANPP
during a year of extreme drought; however, there were no increases in ANPP during
years with above-average precipitation. This suggests that the carrying capacity for
the Patagonian steppe may not be linearly related to precipitation»*.

**La sequía baja la producción; la lluvia de más no la sube.** Si eso es general, el
reemplazo de la función no es otra escalera ni una recta: es algo asimétrico. Y para
saber si es general hacen falta series, no puntos.

**Lo que busco:** un sitio con **cinco años o más** de producción anual medida y su
lluvia anual del mismo año, **con el mismo método todos los años**.

- Cada año es una fila propia, con su lluvia y su producción. **Rangos no.** Si la
  fuente sólo publica el rango, decilo y traé el rango, pero marcá que no hay
  año por año (regla O).
- Si el método cambió entre años, **decilo**: eso es exactamente lo que pasó en Río
  Mayo, donde el año detallado usa cinco cosechas y los otros cuatro usan biomasa
  de pico, y mezclarlos sería un error.
- La lluvia tiene que ser la **del año de la medición**, no la normal. Y si la
  fuente publica además la normal de largo plazo, traé las dos: en Río Mayo el año
  medido llovió 191 mm y la media de 37 años es 136.

**Pistas con nombre.** Las redes LTER de Estados Unidos publican series largas con
datos abiertos en el portal EDI: Shortgrass Steppe / Central Plains Experimental
Range en Colorado, Jornada Experimental Range en Nuevo México, Sevilleta en Nuevo
México, Konza Prairie en Kansas. Lauenroth y Sala publicaron en 1992 en *Ecological
Applications* una serie larguísima de producción forrajera de la estepa de pasto
corto norteamericana; si aparece accesible, es justo esto. Fuera de Estados Unidos:
las series del INIA y del INTA en Patagonia y la pampa, los ensayos de largo plazo
del CSIRO en Australia, y las estaciones del CSIC en el semiárido español.

**Si la serie viene de un portal de datos y no de un artículo**, está bien y a veces
es mejor: decí el identificador del dataset, su licencia y qué archivo mirás.

### b. El arbustal, la clase 20, pero buscado al revés

Sigue siendo la banda más floja: **un solo sitio, factor 19 entre sus puntas, y la
única de las cuatro que el usuario ya ve en pantalla**.

Pero no busques «arbustal». Buscá **paisajes que un mapa de cobertura global
clasifica como arbustal cerrado**, y después mirá si alguien midió forraje ahí:

- matorral y maquis mediterráneo de España, Portugal, Grecia y Turquía;
- chaparral de California;
- estepa de *Artemisia tridentata* de la Gran Cuenca, que las fichas de sitio
  ecológico del NRCS cubren bien;
- Karoo suculento y Karoo Nama en Sudáfrica;
- fynbos;
- mallee australiano;
- *caatinga* arbustiva del nordeste brasileño.

**Requisito duro de este frente:** el trabajo tiene que publicar la **cobertura
leñosa en porcentaje, con el método con que la midió**. Sin eso no puedo decidir la
clase y la entrada no alimenta la banda, por buena que sea la medición. Y decime en
el campo nuevo `por_que_seria_clase_20` qué te hace pensar que ese píxel es arbustal
y no pastizal con arbustos.

Lo que mido es **lo que come el animal por hectárea de arbustal**: la capa herbácea
del interespacio escalada a la hectárea, o el ramoneo accesible, o las dos por
separado. Nunca las dos sumadas en un número.

### c. Los catorce pares de Lesbos, que ya están en una fuente montada

Este se lo pido a vos porque no lo pedí nunca y es barato.

El trabajo de Lesbos que ya está en mi archivo —Psyllos et al., *Sustainability*
14(8):4623, abierto— calcula la productividad de cada potrero como la biomasa de la
jaula **por el porcentaje de cobertura herbácea de ese potrero**. Son catorce
potreros. Si publica la tabla con la cobertura y la productividad de cada uno, ahí
hay **catorce pares de cobertura contra producción en una sola fuente, un solo año y
un solo método**, que es la curva que vengo buscando desde el lote 08 y que hasta
ahora tengo con cuatro puntos de cuatro sitios distintos.

Traelos potrero por potrero: identificador del potrero, cobertura herbácea %,
cobertura leñosa % si la publica, productividad, y si está clasificado «improved» o
«undisturbed». Si la tabla está en un apéndice, decilo.

### d. La sabana sin tratamiento, que sigue haciendo falta

El bioma 7 ya entró —la sabana de *Trachypogon* de Calabozo, 375 g/m²/año aéreos—
pero con dos asteriscos: la parcela está protegida del pastoreo **y del fuego** desde
1960, y en enero de 1969 tenía diez veces más materia muerta en pie que biomasa
viva. Describe lo que la comunidad produce, no lo que un animal encontraría.

Busco una segunda medición del bioma 7 que sea **producción anual aérea**, de un
pastizal o sabana **sin fertilizar, sin regar y sin excluir el fuego por décadas**.

**No me traigas** —ya están revisados y rechazados— Serengeti, Kruger, Nylsvley,
Towoomba, los dos Pantanales, Glencoe ni Calabozo.

### e. Los biomas que siguen en cero

**1, 2, 3, 6 y 9.** El 2 —bosque seco tropical y subtropical— está a una coordenada
de distancia: ver los atrasos.

### f. Los atrasos, que entran en cualquier entrega

- **Confirmar si la parcela sin quemar de Calabozo recibió riego.** San José, J.J. y
  Medina, Y.E. (1976), «Organic matter production in the Trachypogon savanna at
  Calabozo, Venezuela», *Tropical Ecology* 17:113-124. La ficha del ORNL dice que en
  ese trabajo se midió el efecto del riego en la estación seca y no dice a qué
  parcela. Si el artículo aclara que la parcela sin quemar fue el control sin riego,
  esa entrada pasa de `desconocido` a `secano` y cambia dos cosas en mi archivo.
- **Bojórquez-Tapia, Ffolliott y Guertin (1990)**, *J. Range Manage.* 43(1):25-28:
  las dieciocho ecuaciones de regresión de forraje contra dosel de Arizona, con sus
  coeficientes y su advertencia textual.
- **Moore y Deiter (1992)**, *J. Range Manage.* 45(3):267-271: las formas exactas y
  los coeficientes. Ya tengo confirmados r² 0,76 lineal y 0,72 no lineal, y SE de
  5,08 y 5,51 kg/ha.
- **Rastrojo:** un lote donde se midan en el mismo lugar el residuo de post-cosecha,
  el rendimiento de grano y la desaparición mensual por pastoreo.
- **La coordenada de parcela del sitio Vindhyan** (bioma 2). El dataset publica tres
  sitios separados 6 a 24 km y un polígono conjunto; necesito un punto por parcela.

**Aviso sobre los dos del *Journal of Range Management*:** lo intenté yo y no es que
busques mal. El archivo de la revista en `journals.uair.arizona.edu` está detrás de
**Anubis**, una prueba de trabajo anti-bot, y el repositorio de Arizona devuelve 403
a todo lo que no sea un navegador común. Si no los conseguís, declaralos vacíos con
eso escrito y no pierdas más tiempo. Portales que sí andan: ORNL DAAC, el portal EDI
de las LTER, EDIT del NRCS, MDPI, SciELO, el repositorio del INTA, FAO y los
repositorios institucionales europeos.

---

## 4. Las trampas de este frente

1. **Producción no es lo que está parado.** Un pastizal puede tener 1.400 kg/ha
   encima y haber producido 400 ese año, o al revés. Si la cifra es una masa en un
   momento, es `stock` y lo decís (regla K). Glencoe se rechazó por esto.
2. **El total del ecosistema no es forraje.** Si incluye raíces, leñosas o materia
   muerta, decilo en `que_cuenta`. En Calabozo el total con raíces es 682 y el aéreo
   375: confundirlos infla el forraje 1,82 veces, y el 682 es el número que anda
   citado por ahí.
3. **El uso admisible se descuenta una sola vez.** Mi app lo aplica después. Si tu
   cifra ya lo trae descontado, `ya_descuenta_uso_admisible: true`.
4. **Un ensayo agronómico no describe un campo.** Fertilizado, regado, sembrado o
   con el fuego excluido por décadas: todo eso entra, pero declarado.
5. **El promedio de varios años esconde la variabilidad que este lote busca.** Para
   el frente (a) el promedio es justamente lo que no quiero.
6. **La mínima y la máxima no promedian a la media.** Tres fichas del ORNL publican
   «mean annual minimum-maximum temperatures of 22,0-36,0 °C» y eso **no** es 29 de
   media anual. Si la fuente no publica la media anual, va `null`.

---

## 5. Las quince reglas

Las doce del lote 14 siguen en pie. Las tres últimas son nuevas y las tres nacen de
un error concreto del lote 14.

**A. Toda cifra entra con su algoritmo y su unidad literal.** Cómo se calculó, y la
unidad tal como la escribe la fuente en `unidad_publicada`. Las conversiones las
hago yo.

**B. Si la fuente publica las partes, van todas**, y si publica más de un método o
más de un año, van todos con su etiqueta. No elijas por mí.

**C. El tratamiento se nombra, y es distinto de un disturbio.** `tratamiento` para lo
que el experimento hizo a propósito; `disturbios_en_la_ventana` para lo que pasó sin
que nadie lo planeara.

**D. Coordenada publicada, declarando qué clase de coordenada es.** Nunca una que
hayas compuesto vos, ni la del pueblo más cercano como si fuera la del sitio.

**E. Nunca se promedia un máximo con un mínimo, ni una normal con una temporada
medida.**

**F. Flujo, no stock — con la excepción escrita.** Producción del ciclo, no biomasa
en un momento. Si traés un stock, se declara como tal.

**G. La advertencia de la fuente va textual**, entre comillas y en su idioma.

**H. Una fracción se arma con numerador y denominador de la misma tabla y la misma
cosecha.** `de_la_misma_tabla_que` es obligatorio.

**I. Un área publicada no es una coordenada hasta que da un solo bioma.**

**J. El tratamiento es de la PARCELA, no de la estación.** `insumos_de_la_parcela` es
textual, y ante el silencio de la fuente va `desconocido`, nunca `secano`.

**K. Toda cifra declara si es stock o flujo**, con el momento si es stock.

**L. Una fracción comible declara cómo se atribuyó lo comible:**
`clasificacion_botanica`, `dieta_observada` o `preferencia_declarada`.

**M. Todas las coordenadas que publique la fuente, y toda frase sobre dónde está el
sitio — y es nueva.** Es la lección del lote 14. Si la fuente publica dos
coordenadas, van las dos en `coordenadas_todas`, cada una con qué dice que es. Y si
en algún párrafo dice «a 10 km al sur-sudeste de tal pueblo» o «en el campo
experimental tal», **eso va textual** en `ubicacion_en_palabras`, porque es lo que
permite darse cuenta de que la coordenada publicada es la del pueblo. Si la
coordenada está dada al minuto de arco y no al segundo, decilo: a 45° de latitud un
minuto es kilómetro y medio.

**N. La clase de cobertura se declara con porcentajes, no con un nombre — y es
nueva.** `cobertura_lenosa_pct` y `cobertura_herbacea_pct` con el método con que se
midieron, y `null` si la fuente no los publica. «Arbustal», «estepa arbustiva» y
«sabana» son nombres y no sirven para decidir una clase. Para el frente (b) va
además `por_que_seria_clase_20`.

**O. Una serie de años se entrega año por año — y es nueva.** Una fila por año, con
la lluvia de ese año y la producción de ese año, y `metodo_de_este_anio` si el método
no fue el mismo en todos. Un rango de cinco años en dos números es lo que hace
invisible un factor 3,6.

---

## 6. La forma del JSON

Un archivo, `15.json`:

```json
{
  "encargo": "forraje",
  "lote": 15,
  "fecha": "2026-10-19",
  "entradas": [
    {
      "id": "serie_01",
      "sitio": "nombre del sitio como lo escribe la fuente",
      "coordenada_de_la_fuente": "la principal, como la publica, sin reformatear",
      "coordenadas_todas": [
        { "valor": "8.88 N, -67.32 W", "que_dice_que_es": "estación meteorológica", "precision": "centésima de grado" }
      ],
      "ubicacion_en_palabras": "textual: toda frase de la fuente sobre dónde está el sitio (regla M)",
      "clase_de_coordenada": "parcela | centroide | esquina | caja | estacion_experimental | pueblo",
      "superficie_declarada": "lo que la fuente dice del área, o null",
      "es_el_sitio_publicado": true,
      "bioma_verificado": null,
      "clase_wc_del_sitio": "qué vería un satélite, y por qué",
      "cobertura_lenosa_pct": { "valor": null, "metodo": "cómo la midió la fuente" },
      "cobertura_herbacea_pct": { "valor": null, "metodo": "cómo la midió la fuente" },
      "por_que_seria_clase_20": "sólo para el frente del arbustal; si no, null",
      "insumos": "secano | fertilizado | riego | riego_y_fertilizado | desconocido",
      "insumos_de_la_parcela": "textual: qué dice la fuente que se le aplicó A ESA PARCELA",
      "serie_por_anio": [
        {
          "anio": "1984/85",
          "lluvia_mm_del_anio": 191,
          "produccion": 79,
          "unidad": "g_ms_m2_anio",
          "capa_que_mide": "gramíneas más arbustos, sin hierbas de hoja ancha",
          "metodo_de_este_anio": "cinco cosechas, método 7a de Singh et al. 1975",
          "dispersion": "SE = 19 g DM m-2 yr-1",
          "stock_o_flujo": "flujo"
        }
      ],
      "lluvia_normal_mm": { "valor": 136, "anios_de_la_serie": 37, "rango": "47 a 230" },
      "cifras": [
        {
          "componente": "ms_herbacea_total | ms_forrajera | npp_aerea | ms_ramoneo | fraccion_comible | utilizacion | consumo_observado",
          "valor": 0,
          "unidad": "kg_ms_ha | g_ms_m2_anio | lb_acre_anio | fraccion_0_1 | porcentaje",
          "unidad_publicada": "la unidad literal de la fuente",
          "stock_o_flujo": "stock | flujo | pico_de_stock",
          "momento_del_stock": "si es stock, la fecha o el momento del ciclo; si no, null",
          "capa_que_mide": "herbácea del interespacio | total incluyendo leñoso | forraje accesible…",
          "de_la_misma_tabla_que": "qué otra cifra de esta entrada comparte tabla, fecha y tratamiento",
          "atribucion_de_lo_comible": "sólo si el componente es fraccion_comible; si no, null",
          "metodo": "cómo se midió y se calculó",
          "ya_descuenta_uso_admisible": false,
          "tratamiento": "lo que el experimento hizo a propósito en esta parcela",
          "fase_de_comunidad": "si viene de una ficha de sitio ecológico, de qué fase sale",
          "n_sitios": 1,
          "dispersion": "desvío, error estándar o rango, con su n, como lo publica",
          "periodo": "los años o la temporada que promedia"
        }
      ],
      "que_cuenta": "qué incluye y qué no: capa, altura de corte, vivo o muerto, raíces",
      "disturbios_en_la_ventana": "lo que pasó sin que nadie lo planeara, o null",
      "lluvia_mm": null,
      "temperatura_c": null,
      "estacionalidad": "cómo se reparte en el año, con las palabras de la fuente",
      "donde_deja_de_valer": "el rango de validez, dicho en contra de la cifra",
      "medido_en": "las fechas del trabajo de campo",
      "advertencia_de_la_fuente": "textual, entre comillas, en su idioma",
      "fuentes": [{ "label": "...", "url": "..." }],
      "verificacion": "página, tabla o figura de donde sale cada número",
      "nota": "lo que no entra en ningún campo y hay que saber"
    }
  ],
  "vacias": [
    { "id": "lo_que_se_buscó", "motivo": "qué se buscó, dónde, y por qué no sirve" }
  ]
}
```

`serie_por_anio` sólo para el frente (a); en las demás entradas va en `null`, y
`cifras` es donde van los números como siempre. `bioma_verificado` va en `null`: lo
verifico yo contra el FeatureServer de RESOLVE sobre la coordenada que publicás, y
las dos veces que una entrega lo rellenó estaba mal. `lluvia_mm` y `temperatura_c`
sólo si la fuente las publica como medias anuales —o como el total y la media del año
medido, diciéndolo—; nunca compuestas a mano, y nunca de otra fuente.

**Antes de mandar, revisá tres cosas:** que cada cifra tenga su unidad publicada
textual, que cada coordenada diga qué clase de coordenada es, y que ninguna entrada
diga `secano` sin que la fuente lo diga.

---

## 7. Lo que ya está montado, para no repetirlo

Dieciséis mediciones en ocho biomas: pradera de Dakota, Edwards Plateau, altiplano de
Puno, pastizal de albardón del Delta Medio del Paraná, pastizal salino de Montecillo,
frygana de Lesbos, brezal de líquenes de Finlandia, sotobosque de robledal polaco,
sotobosque de aliso rojo de Oregón, sotobosque de Pseudotsuga de Oregón, once
parcelas bajo dosel de ponderosa y tres aberturas del mismo bosque en Colorado, avena
fertilizada de Marcos Juárez, alfalfa bajo riego de La Pampa, **sabana de Trachypogon
de Calabozo** y **estepa de Río Mayo**.

Más la curva de forraje contra dosel de Colorado, la partición arriba/abajo de
Montecillo por cuatro algoritmos, las **cuatro** fracciones herbáceas de sitio —de
0,0039 a 0,92, un factor 236—, la primera fracción comible, 0,639, y la utilización
aparente de Glencoe con su consumo individual medido.

Biomas todavía en cero: **1, 2, 3, 6 y 9**.

Bandas por clase de cobertura, que es lo que esto alimenta:

| clase | sitios | kg MS/ha/año | factor |
|---|---|---|---|
| 10 arbolado | 4 | 39 – 940 | 24 |
| **20 arbustal** | **1** | **300 – 5.800** | **19** |
| 30 pastizal | 7 | 350 – 10.630 | 30 |
| 40 cultivo | 0 de secano | — | — |
