# Encargo de forraje — lote 16

**Para:** una conversación nueva de GPT con búsqueda web.
**Salida:** un solo archivo, `16.json`, con la forma de la sección 6.
**Fecha del encargo:** 20/10/2026.

---

## 1. Qué es esto

acequia es una app que calcula cuántos animales aguanta un campo. Ese número sale
hoy de una función que mira **una sola variable**, la lluvia anual, y devuelve uno
de cinco escalones. No tiene fuente. Si se equivoca, no se cae: imprime un número
plausible y alguien compra vacas con eso.

Vengo armando el archivo de mediciones publicadas que la va a reemplazar. Quince
lotes. **Diecisiete mediciones en ocho biomas**, cada una con su método, su unidad
literal, su rango de validez y un test que la vuelve a derivar de la fuente.

El lote 15 fue el más útil de los quince y este encargo es su continuación
directa. Leé la sección 2 antes de buscar nada.

---

## 2. Lo que hizo el lote 15, porque este lote es su segunda mitad

Trajiste la serie de Lauenroth y Sala (1992): el Central Plains Experimental
Range, estepa de pasto corto de Colorado, **cincuenta años** con lluvia y
producción medidas en el mismo campo con el mismo método. Está montada.

### a. El hallazgo

La Figura 2 de ese trabajo publica dos rectas de ANPP contra lluvia anual:

| modelo | ecuación | qué cambia entre sus puntos |
|---|---|---|
| regional, Sala et al. (1988) | `ANPP = −34 + 0,60 × P` | el sitio entero |
| largo plazo, el mismo campo, 50 años | `ANPP = 56 + 0,13 × P` | sólo el año |

**La pendiente del modelo espacial es 4,6 veces la del campo real.** El artículo
dice la consecuencia: *«under dry conditions, the regional model underestimates
ANPP and under wet conditions, overestimates ANPP»*.

La función de mi app es un modelo espacial, y con los 588 mm del año más húmedo de
esa serie devuelve 300 g/m², que es **exactamente** la predicción regional que el
artículo midió como significativamente demasiado alta. Sobre los cincuenta años se
pasa en 35 de 50.

### b. Lo que eso convierte en la pregunta de este lote

Un solo sitio no alcanza para rehacer la función. **Lo que hace falta ahora son
más series largas, de biomas y regímenes de lluvia distintos, para saber si la
pendiente temporal es siempre mucho más baja que la espacial.** Si lo es en cuatro
sitios, el reemplazo se construye con pendientes temporales y el asunto está
resuelto en lo esencial.

### c. Y lo que no era

El lote 14 había sugerido, con cinco años de Patagonia, que la respuesta a la
lluvia es asimétrica: la sequía baja la producción y la lluvia de más no la sube.
**Con los cincuenta años no se replica**: los años secos caen un 30 % y los
húmedos suben un 30 %. Lo corregí. No busques asimetría: buscá pendientes.

### d. El único error que tuvo tu entrega, y dónde estaba

**1943 tiene 490 mm y pusiste 790.** 99 de 100 cifras bien, pero ésa era la más
influyente de la serie: habría sido el año más húmedo por lejos, con producción
alta, y un punto así en la punta derecha es justo lo que hace parecer más
empinada la relación que el lote vino a medir.

De ahí sale la regla P, que te da una forma de agarrar ese error sin mí: **si la
fuente publicó la regresión, ajustá tu propia transcripción y comparala.** Yo hice
eso con tus cien cifras y me dio 13,1 + 0,1722 con r² = 0,391 contra el 13 +
0,172 y r² = 0,39 publicados. Si el 790 hubiera entrado en mi ajuste, no habría
cerrado, y así lo encontré.

---

## 3. Qué hace falta

### a. Dos a cuatro series largas más, de sitios distintos — PRIORIDAD

Mismo requisito que el lote 15: **un sitio, cinco años o más** de producción anual
medida con la lluvia anual del mismo año y el mismo método, **año por año y no en
rangos** (regla O).

Lo que cambia es el criterio de selección. Quiero series que **no se parezcan al
CPER**, para poder comparar pendientes:

- un pastizal **húmedo**, de 700 mm para arriba. Konza Prairie en Kansas es el
  candidato obvio: pastizal de pasto alto, unos 835 mm, con tratamientos de fuego
  y pastoreo de larga data y datos abiertos en el portal EDI de las LTER.
- una **sabana tropical** con serie larga. Es el bioma que más se pastorea del
  mundo y el que más me cuesta: ver la sección 4.
- un **matorral o arbustal**, que mataría dos pájaros: serie larga y clase 20.
- un **desierto o semidesierto**: Jornada Experimental Range en Nuevo México,
  Sevilleta, o las series del CSIC en el sudeste español.
- una serie **del hemisferio sur**: INTA en Patagonia o la pampa deprimida, INIA
  en Uruguay, CSIRO en Australia.

**Lo que más vale de cada serie, si la fuente lo publica:** la ecuación que la
propia fuente ajustó entre producción y lluvia, con ordenada, pendiente, r², n y
grados de libertad. Con eso puedo verificar la serie entera, y además es lo que se
compara entre sitios. Si la fuente no la ajustó, traé la serie igual y decilo.

Si la serie viene de un **portal de datos** y no de un artículo, mejor: decí el
identificador del dataset, su licencia y qué archivo mirás.

### b. El retardo, con un coeficiente

El trabajo del CPER describe el retardo pero no lo modela: después de las sequías
de 1954 y 1964 llovió normal y la producción siguió baja, y lo explica por la
estructura de la vegetación.

Busco una fuente que lo **cuantifique**: un modelo donde la producción del año
dependa de la lluvia de este año **y de la del anterior**, con los dos
coeficientes publicados. O una autocorrelación publicada de la serie de
producción. O un «legacy effect» medido.

Pistas con nombre: Oesterheld, Loreti, Semmartin y Sala sobre variabilidad
interanual de la ANPP en pastizales; los trabajos de Sala y Gherardi sobre
legados de las fluctuaciones de precipitación; Reichmann y Sala sobre pulsos y
legados en la estepa de pasto corto; los trabajos de Wiegand en el Karoo.

**Esto es lo segundo más importante del lote**, porque es lo único que puede
decirme qué forma tiene que tener el reemplazo. Una función sin memoria no puede
dar bien un año posterior a una sequía, y en un campo real eso pasa seguido.

### c. El tamaño de los eventos de lluvia, en un segundo sitio

El CPER publica un modelo con cuatro clases de tamaño de evento que llega a
r² = 0,45, donde los eventos de 15 a 30 mm **solos** dan 0,33, contra 0,39 del
total anual. O sea: cómo llega el agua explica más que cuánta agua llega.

**Esto es accionable para la app**, y por eso lo pido: acequia ya baja series
diarias de lluvia, así que puede calcular la distribución de tamaños de evento.
Si en un segundo sitio el tamaño de los eventos vuelve a ganarle al total anual,
el reemplazo de la función se construye con la serie diaria y no con el total.

Busco: un trabajo que relacione producción con **la distribución de tamaños de
los eventos** de lluvia, con los umbrales que usó y los coeficientes de cada
clase. Si publica el r² del modelo completo y el de cada variable sola, mejor.

### d. El arbustal, la clase 20, tercer intento

Sigue siendo la banda más floja: **un solo sitio, factor 19 entre sus puntas, y la
única de las cuatro que el usuario ya ve en pantalla**.

El lote 15 la declaró vacía con el motivo correcto, así que acá va la pista que me
faltó darte: **las fichas de sitio ecológico del NRCS son el camino.** Publican
producción anual por tipo de planta —gramíneas, hierbas, arbustos, árboles— en
lb/acre para un año flaco, uno representativo y uno bueno, y además describen la
cobertura. Ya hay dos fichas de ésas montadas en mi archivo, así que el formato lo
conozco y lo puedo convertir.

Lo que necesito son fichas de **MLRA dominadas por arbustal cerrado**: las de
*Artemisia tridentata* de la Gran Cuenca y la meseta de Columbia, las de chaparral
de California, las de mezquital y chamizal del sudoeste. Buscá en el catálogo EDIT
del NRCS.

**Requisito duro:** la ficha tiene que publicar la cobertura leñosa en porcentaje
con su método (regla N), y decime en `por_que_seria_clase_20` qué te hace pensar
que ese píxel es arbustal y no pastizal con arbustos.

### e. Los catorce pares de Lesbos, con una instrucción mejor

Pedí esto en el lote 15 y volvió vacío porque las tablas que encontraste informan
resultados agregados por tipo de jaula. **Mirá el Apéndice A**: el artículo
—Psyllos et al., *Sustainability* 14(8):4623, abierto— tiene uno, y la
productividad de cada potrero se calcula como la biomasa de la jaula por la
cobertura herbácea **de ese potrero**, así que esos dos números por potrero
existen en algún lado.

Son catorce pares de cobertura contra producción en una sola fuente, un año y un
método. Mi curva de cobertura tiene hoy cuatro puntos de cuatro sitios distintos.

Si después de mirar el apéndice no están, declaralo vacío con eso escrito y no
vuelvo a pedirlo.

### f. Los atrasos

- **Si la serie del CPER es de secano.** La fuente no dice nada de fertilización
  ni riego y por la regla J quedó en `desconocido`. La documentación del sitio
  SGS/CPER de las LTER debería decir el régimen de manejo. Si se confirma, esa
  entrada pasa a `secano` y la banda de la clase 30 pasa de siete a ocho sitios.
- **Si la parcela sin quemar de Calabozo recibió riego.** San José, J.J. y Medina,
  Y.E. (1976), *Tropical Ecology* 17:113-124. Si el artículo aclara que fue el
  control sin riego, esa entrada pasa de `desconocido` a `secano` **y entonces hay
  que reescribir una afirmación de mi archivo**, porque sus 1.257 mm superan el
  techo de secano que hay hoy.
- **Bojórquez-Tapia, Ffolliott y Guertin (1990)**, *J. Range Manage.* 43(1):25-28:
  las dieciocho ecuaciones de forraje contra dosel de Arizona.
- **Moore y Deiter (1992)**, *J. Range Manage.* 45(3):267-271: formas y
  coeficientes. Ya tengo r² 0,76 lineal y 0,72 no lineal, SE 5,08 y 5,51 kg/ha.
- **Rastrojo:** un lote con residuo post-cosecha, rendimiento de grano y
  desaparición mensual por pastoreo medidos en el mismo lugar.
- **La coordenada de parcela del sitio Vindhyan** (bioma 2).
- **Biomas todavía en cero: 1, 2, 3, 6 y 9.**

**Sobre los dos del *Journal of Range Management*:** no insistas. El archivo de la
revista está detrás de Anubis, una prueba de trabajo anti-bot, y el repositorio de
Arizona devuelve 403 a todo lo que no sea un navegador. Lo comprobé yo. Si no
aparecen por otra vía en cinco minutos, vacío y seguí. Portales que sí andan: ORNL
DAAC, el portal EDI de las LTER, EDIT del NRCS, MDPI, SciELO, el repositorio del
INTA, FAO, mountainscholar y los repositorios institucionales europeos.

---

## 4. Las trampas de este frente

1. **Producción no es lo que está parado.** Si la cifra es una masa en un momento,
   es `stock` y lo decís (regla K).
2. **El total del ecosistema no es forraje.** Si incluye raíces, leñosas o materia
   muerta, decilo. En Calabozo el total con raíces es 682 y el aéreo 375.
3. **Aire-seco no es estufa-seco, y la diferencia no es un factor.** El CPER
   publica las dos columnas y la conversión es `ANPP = 46 + 0,76 × forraje`: el
   cociente entre ellas va de 2,85 a 1,12 a lo largo de la serie, así que elegir
   la columna equivocada **le cambia la forma a la serie**. De ahí la regla Q.
4. **La lluvia de un año no es la normal del lugar ni el ancho entre dos
   estaciones.** De ahí la regla R. Mi propio archivo tenía los tres mezclados en
   el mismo campo, y además, en una entrada, agua de riego.
5. **Un ensayo agronómico no describe un campo.** Fertilizado, regado, sembrado o
   con el fuego excluido por décadas: entra, pero declarado.
6. **El promedio de varios años esconde lo que este lote busca.** Para el frente
   (a) el promedio es justamente lo que no quiero.
7. **La mínima y la máxima no promedian a la media.** Tres fichas del ORNL
   publican «mean annual minimum-maximum temperatures of 22,0-36,0 °C» y eso no es
   29 de media anual.
8. **Una serie puede no ser del mismo lugar aunque sea del mismo sitio.** El CPER
   muestreó entre 3 y 35 ubicaciones distintas según el año, con historias de
   pastoreo distintas, y el trabajo lo declara. Si tu serie tiene eso, traé el n
   de cada año.

---

## 5. Las dieciocho reglas

Las quince del lote 15 siguen en pie. Las tres últimas son nuevas y las tres
nacen de algo concreto del lote 15.

**A. Toda cifra entra con su algoritmo y su unidad literal.** Las conversiones las
hago yo.

**B. Si la fuente publica las partes, van todas**, y si publica más de un método o
más de un año, van todos con su etiqueta.

**C. El tratamiento se nombra, y es distinto de un disturbio.**

**D. Coordenada publicada, declarando qué clase de coordenada es.**

**E. Nunca se promedia un máximo con un mínimo, ni una normal con una temporada
medida.**

**F. Flujo, no stock — con la excepción escrita.**

**G. La advertencia de la fuente va textual**, entre comillas y en su idioma.

**H. Una fracción se arma con numerador y denominador de la misma tabla y la misma
cosecha.**

**I. Un área publicada no es una coordenada hasta que da un solo bioma.**

**J. El tratamiento es de la PARCELA, no de la estación.** Ante el silencio de la
fuente va `desconocido`, nunca `secano`.

**K. Toda cifra declara si es stock o flujo**, con el momento si es stock.

**L. Una fracción comible declara cómo se atribuyó lo comible.**

**M. Todas las coordenadas que publique la fuente, y toda frase sobre dónde está
el sitio.** Si la coordenada está al minuto de arco y no al segundo, decilo.

**N. La clase de cobertura se declara con porcentajes, no con un nombre.**

**O. Una serie de años se entrega año por año.** Una fila por año, con su lluvia,
su producción y `metodo_de_este_anio` si el método cambió.

**P. Si la fuente ajustó una ecuación, va con todo y VOS LA VERIFICÁS — y es
nueva.** Ordenada, pendiente, r², n, grados de libertad y la unidad de los dos
ejes, en `ecuacion_de_la_fuente`. Y después **ajustá tu propia transcripción por
cuadrados mínimos y comparala con la publicada**, y poné el resultado en
`verificacion_por_ajuste`. Si no coincide, hay una cifra mal copiada: buscala
antes de mandar. Así encontré el 790 de 1943, y es la única forma de defender cien
números con dos.

**Q. Si la fuente publica la misma magnitud en dos bases, van las dos y se dice
cuál es cuál — y es nueva.** Aire-seco y estufa-seco, con humedad o sin ella, peso
fresco y peso seco. Y **la ecuación de conversión con su r² y su n**, porque puede
no ser un factor: la del CPER tiene ordenada al origen de 46 g/m² y se ajustó con
r² = 0,28 sobre catorce años, cosa que el propio artículo llama su supuesto más
importante.

**R. Toda cifra climática declara qué clase de número es — y es nueva.** En
`que_es_la_lluvia`: `anio_medido`, `rango_de_anios` de una serie en el mismo
punto, `rango_de_sitios` entre los sub-sitios que la cifra promedia,
`normal_publicada` de largo plazo, o `agua_de_riego` si no es lluvia. Mi archivo
tenía los cinco mezclados en el mismo campo y tres de mis propios tests se
contradijeron entre sí por eso.

---

## 6. La forma del JSON

Un archivo, `16.json`:

```json
{
  "encargo": "forraje",
  "lote": 16,
  "fecha": "2026-10-21",
  "entradas": [
    {
      "id": "serie_01",
      "sitio": "nombre del sitio como lo escribe la fuente",
      "coordenada_de_la_fuente": "la principal, como la publica, sin reformatear",
      "coordenadas_todas": [
        { "valor": "40°49′ N, 104°46′ W", "que_dice_que_es": "sitio de estudio", "precision": "minuto de arco" }
      ],
      "ubicacion_en_palabras": "textual: toda frase de la fuente sobre dónde está el sitio",
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
          "anio": "1939",
          "lluvia_mm_del_anio": 117,
          "que_es_la_lluvia": "anio_medido",
          "produccion": 50,
          "unidad": "g_ms_m2_anio",
          "base_de_la_masa": "aire_seco | estufa_seco | fresco | no_dice",
          "capa_que_mide": "gramíneas, ciperáceas y hierbas; sin cactus",
          "metodo_de_este_anio": "cosecha de cuadrantes de 0,19 m² al final de la estación",
          "n_de_este_anio": 11,
          "dispersion": "SD = 12,1 entre ubicaciones",
          "stock_o_flujo": "flujo"
        }
      ],
      "ecuacion_de_la_fuente": {
        "que_relaciona": "producción forrajera contra precipitación anual",
        "forma": "y = 13 + 0,172 x",
        "unidad_y": "g MS/m²/año, aire-seco",
        "unidad_x": "mm/año",
        "r2": 0.39,
        "n": 50,
        "gl": "1,48",
        "donde_esta": "ecuación 2, p. 400"
      },
      "verificacion_por_ajuste": "ajusté las filas por cuadrados mínimos y me dio y = 13,1 + 0,1722 x con r² = 0,391: coincide con la publicada (regla P)",
      "conversion_entre_bases": {
        "forma": "estufa = 46 + 0,76 × aire_seco",
        "r2": 0.28,
        "n": 14,
        "es_un_factor": false,
        "donde_esta": "ecuación 1, p. 399"
      },
      "retardo_publicado": {
        "lo_modela": false,
        "coeficiente_anio_anterior": null,
        "como_lo_describe": "textual, si lo describe sin modelarlo"
      },
      "lluvia_normal_mm": { "valor": 321, "anios_de_la_serie": 52, "sd": 98 },
      "cifras": [
        {
          "componente": "ms_herbacea_total | ms_forrajera | npp_aerea | ms_ramoneo | fraccion_comible | utilizacion | consumo_observado",
          "valor": 0,
          "unidad": "kg_ms_ha | g_ms_m2_anio | lb_acre_anio | fraccion_0_1 | porcentaje",
          "unidad_publicada": "la unidad literal de la fuente",
          "base_de_la_masa": "aire_seco | estufa_seco | fresco | no_dice",
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

`serie_por_anio`, `ecuacion_de_la_fuente`, `verificacion_por_ajuste`,
`conversion_entre_bases` y `retardo_publicado` son para el frente (a); en las
demás entradas van en `null`. `bioma_verificado` va en `null`: lo verifico yo
contra el FeatureServer de RESOLVE sobre la coordenada que publicás, y las dos
veces que una entrega lo rellenó estaba mal.

**Antes de mandar, revisá cuatro cosas:** que cada cifra tenga su unidad publicada
y su base de masa, que cada coordenada diga qué clase de coordenada es, que
ninguna entrada diga `secano` sin que la fuente lo diga, y —si hay una ecuación
publicada— que tu propio ajuste la reproduzca.

---

## 7. Lo que ya está montado, para no repetirlo

Diecisiete mediciones en ocho biomas: pradera de Dakota, Edwards Plateau,
altiplano de Puno, pastizal de albardón del Delta Medio del Paraná, pastizal
salino de Montecillo, frygana de Lesbos, brezal de líquenes de Finlandia,
sotobosque de robledal polaco, sotobosque de aliso rojo de Oregón, sotobosque de
Pseudotsuga de Oregón, once parcelas bajo dosel de ponderosa y tres aberturas del
mismo bosque en Colorado, avena fertilizada de Marcos Juárez, alfalfa bajo riego
de La Pampa, sabana de Trachypogon de Calabozo, estepa de Río Mayo y **la serie de
cincuenta años del Central Plains Experimental Range**.

Más la curva de forraje contra dosel de Colorado, la partición arriba/abajo de
Montecillo por cuatro algoritmos, las cuatro fracciones herbáceas de sitio —de
0,0039 a 0,92, un factor 236—, la primera fracción comible, 0,639, la utilización
aparente de Glencoe con su consumo individual medido, y los dos modelos de ANPP
contra lluvia, el regional y el de largo plazo.

Biomas todavía en cero: **1, 2, 3, 6 y 9**.

Bandas por clase de cobertura, que es lo que esto alimenta:

| clase | sitios | kg MS/ha/año | factor |
|---|---|---|---|
| 10 arbolado | 4 | 39 – 940 | 24 |
| **20 arbustal** | **1** | **300 – 5.800** | **19** |
| 30 pastizal | 7 | 350 – 10.630 | 30 |
| 40 cultivo | 0 de secano | — | — |

Series largas montadas: **una**, de 321 mm de lluvia media y bioma 8. Es el número
que este lote tiene que subir.
