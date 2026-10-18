# Encargo de forraje — lote 14: el arbustal, y la sabana sin tratamiento

> Pegá este archivo entero en un chat nuevo. La salida es **un JSON**, `14.json`.
> Si una búsqueda no da, se declara vacía con el motivo: una vacía bien explicada
> vale más que una entrada dudosa, y en este encargo ya cerró tres caminos.

---

## 1. Qué es esto

acequia es una app de análisis de territorio. Cuando alguien marca un predio, la
app lee ESA WorldCover a 10 m y calcula cuánto forraje puede ofrecer cada clase de
cobertura. Esa banda **no se inventa**: sale de mediciones publicadas, una por
una, con coordenada verificada contra RESOLVE, unidad literal y rango de validez.

Trece lotes de este encargo construyeron catorce mediciones en siete biomas. El
estado de la banda hoy, y es el mapa de lo que falta:

| clase de WorldCover | banda (kg MS/ha/año) | sitios | factor |
|---|---|---|---|
| 10 bosque | 39 – 940 | 4 | 24 |
| **20 arbustal** | **300 – 5.800** | **1** | **19** |
| 30 pastizal | 350 – 10.630 | 7 | 30 |
| 40 cultivo | *sin banda* | 0 de secano | — |

La fila que este lote tiene que atacar es la segunda. **El arbustal tiene un solo
sitio** —la frygana de Lesbos— y ese sitio solo abre un factor 19, porque publica
su propio rango bueno-malo. Un predio de matorral en acequia recibe hoy una banda
que sale de una isla del Egeo, y eso es lo que hay que arreglar.

---

## 2. Las dos lecciones del lote 13, que son criterios de búsqueda

**La primera: la sabana es el bioma de los ensayos.** El lote 13 trajo las dos
primeras mediciones del bioma 7 que llegaron con todo en orden —la Unidad
Experimental Glencoe del INIA, coordenada de estación, `ECO_ID` 574 verificado,
fuente abierta CC-BY, consumo individual medido con TiO₂— y ninguna de las dos
entró. Dos motivos, y los dos son generalizables:

1. **Miden lo que está parado, no lo que creció.** Lo publicado es masa en pie
   sobre 5 cm antes y después de un pastoreo de cinco días. No hay producción
   anual y el trabajo no publica la tasa de acumulación que haría falta para
   anualizarla.
2. **Están fertilizadas.** El fósforo del suelo se mantuvo en 10 ppm *para
   estandarizar los potreros* — una decisión metodológica que el lector apurado
   lee como descripción del sitio.

Con Towoomba (lote 05, un ensayo de nitrógeno y fósforo sobre un área a la que le
sacaron todos los árboles) van **dos de dos**: toda medición de sabana que llegó
hasta acá con coordenada verificada, bioma verificado y fuente abierta resultó ser
un ensayo agronómico. No es casualidad y hay que usarlo como criterio: **es el
bioma donde está la ganadería, así que es el bioma donde están los ensayos.** Hay
que ir a buscar explícitamente el pastizal **sin tratar**: clausuras, parques
nacionales, reservas ecológicas, sitios de investigación ecológica de largo plazo.

**La segunda: el ancho de una fracción puede ser puro error de aritmética.** El
lote 13 encontró la primera fracción comible, y la encontró dos veces en el mismo
sitio. El artículo publica, para la **misma cosecha y el mismo tratamiento**, 10.533
kg MS/ha de materia seca viva total y 6.733 de forrajera: **0,639**. La tesis del
mismo trabajo pone «entre 11200 y 11400 kg ha-1» del período primavera-verano-otoño
al lado de «entre 6700 y 8250 kg» de forrajera, donde el 6.700 es una cosecha de
verano y el 8.250 una suma de tres cosechas. De ahí salen cuatro cocientes de
**0,588 a 0,737**, y el ancho de ese abanico no es variabilidad ecológica: es un
flujo dividido por un stock y una cosecha dividida por un total de tres estaciones.
El par bueno cae adentro del abanico, que es lo peor que podía pasar, porque
entonces el error no se nota mirando el resultado.

El campo `de_la_misma_tabla_que` que el lote 13 estrenó sirvió para esto. Se
queda, y este lote agrega dos campos más con la misma idea: hacer **auditable** una
regla que antes había que creer.

---

## 3. Qué hace falta

### a. El arbustal: la clase 20, que tiene un solo sitio — PRIORIDAD

Producción herbácea anual, de secano, en matorral, arbustal o estepa arbustiva.
Es lo que más vale de este lote, porque es lo único que cambia un número que el
usuario ya ve en pantalla.

Lo que sirve, en orden de preferencia:

- **Sitios de investigación de largo plazo con la producción publicada por tipo de
  vegetación.** El Jornada Experimental Range en Nuevo México (matorral chihuahuense
  de larrea y mezquite) publica series largas de producción aérea por unidad de
  vegetación, con coordenadas. La estepa patagónica tiene producción aérea publicada
  **separando pastos de arbustos**, que es justo el reparto que acequia necesita.
  El Karoo sudafricano y el matorral mediterráneo de España y Chile son los otros
  dos candidatos.
- **Fichas de sitio ecológico del NRCS** para MLRA de matorral: cuencas desérticas
  del sur, Gran Cuenca, Mojave. Publican producción anual en lb/acre por fase de
  comunidad, con valor representativo y años favorable y desfavorable — que es una
  banda, en la unidad correcta y de secano. Ya hay dos entradas montadas por esta
  vía, así que el camino está probado: lo que hace falta es declarar el área como
  área y no inventarle un punto.
- Cualquier medición de producción herbácea bajo arbustal con cobertura de arbustos
  declarada. **Si trae el porcentaje de cobertura leñosa, vale doble**, por lo que
  dice el punto c.

### b. La sabana sin tratamiento: el bioma 7

El bioma que concentra la ganadería del mundo sigue en cero después de cinco lotes.
Lo que hace falta es producción primaria aérea o producción forrajera anual en
sabana o pastizal tropical, **en una parcela sin fertilizar, sin regar y con el
manejo declarado**.

Candidatos que vale la pena agotar: el Cerrado brasileño medido en reservas
ecológicas con parcelas de exclusión de fuego de largo plazo; la sabana de
*Trachypogon* de los llanos venezolanos, que tiene producción primaria publicada
desde los años setenta por una estación biológica con nombre propio; las sabanas
de Costa de Marfil con series largas; los campos sulinos con tratamientos de
clausura; y las sabanas tropicales australianas medidas por redes de flujo.

**Lo que ya está cerrado y no hay que volver a traer:** Serengeti (stock en pie con
disco de pastura), Kruger (un cuadrante suelto en un trabajo de LiDAR), Nylsvley
(su propia ficha avisa que subestima), Towoomba (ensayo de fertilización), el
Pantanal norte y el de la Nhecolândia (tasas diarias y disponibilidad por fecha), y
Glencoe (stock en pie, fertilizado). Si volvés a una de ésas, tiene que ser con una
publicación distinta que resuelva el motivo por el que se rechazó, y diciendo cuál
era el motivo.

### c. Forraje contra cobertura leñosa: la curva que falta

acequia ya tiene **una** curva de forraje contra densidad de dosel, de un bosque de
ponderosa en Colorado, verificada reajustando la regresión sobre los catorce pares
publicados (dio 529,43 y −6,105 contra los 529,4 y −6,1 impresos). De esa curva
salió el hallazgo que ordena toda esta cadena: entre 1972 y 1973 el **nivel** de la
recta se movió 2,10 veces, pero la pendiente relativa quedó en 0,011522 contra
0,011495 —un 0,24 % de diferencia— y el punto de extinción en 86,8 % contra 87,0 %.
O sea: **lo que el dosel le hace al forraje se transfiere; cuánto forraje hay, no.**

Hace falta la segunda curva, de otro tipo de vegetación, para saber si eso vale
afuera de ese rodal. Cualquier regresión publicada de producción herbácea contra
cobertura o densidad de copa sirve, **con los coeficientes y preferentemente con
los pares de datos**. Un matorral o una sabana arbolada serían ideales, porque
cierran los dos frentes de arriba al mismo tiempo.

### d. La segunda fracción comible, y de un pastizal que no esté degradado

La única que acequia tiene sale de un pastizal que su propia fuente declara
degradado por sobrepastoreo —*«La recuperación inicial de la cobertura a partir del
grupo de especies no forrajeras, revela la degradación del pastizal a causa de la
alta presión de pastoreo previa»*—, así que **0,639 es probablemente un piso** y no
hay con qué acotarlo.

Y hay una distinción que este lote tiene que declarar siempre, porque la primera
entrada la tenía y nadie la había separado: la fracción comible se puede atribuir
de tres maneras distintas, que no son el mismo número.

1. **Clasificación botánica.** Alguien separó la cosecha en especies forrajeras y
   no forrajeras según una lista de aptitud. Es lo que hay hoy. No es consumo.
2. **Dieta observada.** Composición de la dieta medida con animales fistulados,
   análisis microhistológico de heces o muestras de rumen, **contra la oferta por
   especie del mismo sitio y la misma estación**. Es la que de verdad hace falta.
3. **Preferencia declarada.** Índices de preferencia o palatabilidad publicados por
   especie. Sirve como contexto, no como fracción.

Lo más valioso de este punto es un trabajo que publique **oferta por especie y
dieta por especie, del mismo sitio y la misma estación**. Hay trabajos así en la
estepa norteamericana de pasto corto y en la Patagonia ovina.

### e. Los atrasos, que entran en cualquier entrega

Los tres siguen abiertos y los tres son de mayor valor que una entrada nueva
cualquiera:

- **Bojórquez-Tapia, Ffolliott y Guertin (1990)**, *Journal of Range Management*
  43(1):25-28: dieciocho ecuaciones de regresión de producción herbácea. Si alguna
  tiene la forma de la de Colorado, **su pendiente relativa decide si esa forma es
  transferible**, que es la pregunta más importante de todo el encargo. El archivo
  de la revista se mudó a `journals.librarypublishing.arizona.edu`; el dominio
  viejo redirige y `jrm.library.arizona.edu` ya no resuelve.
- **Moore y Deiter (1992)**, mismo journal, 45(3):267-271: las formas exactas y los
  coeficientes. De ese trabajo ya están confirmados el r² de 0,76 lineal y 0,72 no
  lineal y los errores estándar de 5,08 y 5,51 kg/ha; faltan las ecuaciones.
- **Rastrojo.** De las tres familias del cultivo, es la única cuyo número no depende
  de lo que el productor le puso al lote sino de lo que la cosecha dejó. Hace falta
  residuo post-cosecha en kg MS/ha **con la fracción consumible y la desaparición
  en el tiempo**, para maíz, trigo o soja.
- **La parcela de Vindhyan** (bioma 2, bosque tropical seco): está a **una
  coordenada publicada** de poder montarse. Si el grupo publica el punto de sus
  parcelas en cualquier trabajo, entra.

---

## 4. Las trampas de este frente

**El arbustal mide dos cosas con el mismo nombre.** «Producción» en un matorral
puede ser la producción herbácea del interespacio, la producción total incluyendo
el crecimiento leñoso, o el forraje accesible al animal incluyendo ramoneo. Los
tres son números legítimos y distintos, y en un matorral de larrea pueden diferir
por un orden de magnitud. **Decí siempre qué capa mide la cifra**, y si la fuente
publica más de una, van todas.

**El ramoneo no es forraje herbáceo.** Si una cifra incluye hojas y brotes de
arbustos comidos por cabras o por ganado, es otra magnitud: entra, pero rotulada
como tal y nunca sumada a la herbácea sin decirlo.

**Una ficha de sitio ecológico describe un sitio potencial, no un predio.** Publica
lo que ese sitio produciría en su comunidad de referencia. Eso sirve y está montado,
pero hay que declarar la fase de comunidad de la que sale el número, porque la misma
ficha publica varias y pueden diferir por tres veces.

**Un año favorable no es un rango de años.** Varias fichas publican «desfavorable,
representativo, favorable»: son tres escenarios de un mismo sitio, y son
exactamente la banda que acequia necesita. Lo que no se puede es tomar el favorable
como el típico.

---

## 5. Las doce reglas

**A. Toda cifra entra con su algoritmo y su unidad literal.** Cómo se calculó, y la
unidad **exactamente como la imprime la fuente**: `kg/ha`, `g/m²`, `lb/acre`, `%`,
`fraccion_0_1`, `gC/m²`. **Nunca convertir.** Un `gC` que llega como `g MS` arruina
el dato por un factor ~2 sin que se note.

**B. Si la fuente publica las partes, van todas**, y si publica más de un método
para la misma medición, van todos, uno por fila, sin promediar. Las dos entregas
más valiosas de este encargo fueron exactamente ésas: seis algoritmos sobre las
mismas cosechas en un bosque polaco, y cuatro publicaciones sobre la misma serie en
México, que discrepan 1,79× en el reparto arriba/abajo y sólo 1,06× en el total.

**C. El tratamiento se nombra, y es distinto de un disturbio.** `tratamiento` para
lo que el experimento hizo a propósito —fertilización con nivel y nutriente, riego
con lámina, carga animal, clausura, quema, raleo— y `disturbios_en_la_ventana` para
lo que pasó sin que nadie lo planeara dentro del período promediado: sequía, helada,
incendio, inundación, plaga. **Y agregá los `insumos`**: `secano`, `fertilizado`,
`riego` o los dos.

**D. Coordenada publicada, declarando qué clase de coordenada es.** El punto de la
parcela, el centroide de un área, una esquina de caja, la caja completa, o la
ubicación que el organismo publica para una estación con nombre propio. Las cinco
sirven **si se declara cuál es**. Lo que no sirve es buscar la localidad en un mapa.

**E. Nunca se promedia un máximo con un mínimo, ni una normal con una temporada
medida.** Varias fichas publican «mean monthly minimum 10,7 °C (enero)» y «mean
monthly maximum 29,5 °C (marzo)»: son el mes más frío y el más cálido, y **no
promedian a la media anual**. En cambio el promedio de las doce medias mensuales
**sí** es una media anual, y si es la del año medido y no la normal, se dice.

**F. Flujo, no stock — con la excepción escrita.** Producción del ciclo, no biomasa
acumulada de años anteriores. **No sirve** disponibilidad a una fecha suelta,
lecturas de disco de pastura, biomasa en pie de líquenes o de pajonal perenne, ni
masa pre-pastoreo. **Sí sirve** la cosecha a ras de la biomasa del año en su pico,
declarada como «peak standing crop», con el sesgo dicho: subestima entre un 50 y un
52 % contra el mejor de los seis algoritmos publicados. En los líquenes de Finlandia
el stock llega a **50 veces** el flujo anual, y ése es el error que la regla ataja.

**G. La advertencia de la fuente va textual**, entre comillas y en su idioma. La que
más sirvió en todo el encargo fue una línea del ORNL: «NPP values for MNT1 reported
in other published accounts differ due to different measurement and calculation
methods».

**H. Una fracción se arma con numerador y denominador de la misma tabla y la misma
unidad.** Si sale de dividir una oferta publicada por un autor y un consumo
publicado por otro, no es una fracción: es dos estimaciones divididas entre sí, y la
diferencia de método se vuelve señal. El campo `de_la_misma_tabla_que` que el lote
13 estrenó encontró un error en su primer uso. Se queda.

**I. Un área publicada no es una coordenada hasta que da un solo bioma.** Mandala
igual, rotulada como área y con sus límites completos, pero cuanto más grande menos
probable que sirva. Caso cerrado: el único polígono que un grupo publica para unas
parcelas en Nepal mide 17 × 20 km y **cruza tres biomas**, así que esa medición no
se puede montar.

**J. El tratamiento es de la PARCELA, no de la estación — y es nueva.** Es la
lección de Towoomba y de Glencoe, las dos veces en el mismo bioma. Una estación
experimental puede describir su campo natural en la introducción y aplicarle
fósforo en los métodos; un sitio de una compilación puede publicar un valor por
sitio **sin decir de qué tratamiento sale**, y la compilación que tiene ese problema
lo avisa con esta frase: *«18 sites have data for more than one "treatment"
(fertilized or irrigated plots, different soil types, stand ages, etc.)»*. Lo que va
en el JSON es lo que se le aplicó **a la parcela exacta de la que sale la cifra**, y
si la fuente no lo dice, el campo va en `desconocido`. **Nunca asumir secano por
omisión.**

**K. Toda cifra declara si es stock o flujo — y es nueva.** Un campo
`stock_o_flujo` con `stock`, `flujo` o `pico_de_stock`, por cifra y no por entrada.
Es el control de la regla F, y hace falta porque el componente no alcanza: el lote
13 trajo dos cifras rotuladas `ms_forrajera` que eran masa en pie antes y después de
un pastoreo, y el rótulo no lo decía. Si la cifra es un stock, agregá en qué fecha o
momento del ciclo se midió.

**L. Una fracción comible declara cómo se atribuyó lo comible — y es nueva.** Un
campo `atribucion_de_lo_comible` con `clasificacion_botanica`, `dieta_observada` o
`preferencia_declarada`, y si es botánica, **quién clasificó y contra qué lista**.
Las tres son números distintos y la diferencia entre la primera y la segunda es
justamente lo que esta cadena no sabe.

---

## 6. La forma del JSON

Un archivo, `14.json`:

```json
{
  "encargo": "forraje",
  "lote": 14,
  "fecha": "2026-10-18",
  "entradas": [
    {
      "id": "arbustal_01",
      "sitio": "nombre del sitio como lo escribe la fuente",
      "coordenada_de_la_fuente": "lat y lon como las publica, sin reformatear",
      "clase_de_coordenada": "parcela | centroide | esquina | caja | estacion_experimental",
      "superficie_declarada": "lo que la fuente dice del área, o null",
      "es_el_sitio_publicado": true,
      "bioma_verificado": null,
      "clase_wc_del_sitio": "qué vería un satélite: arbustal, pastizal, bosque abierto…",
      "insumos": "secano | fertilizado | riego | riego_y_fertilizado | desconocido",
      "insumos_de_la_parcela": "textual: qué dice la fuente que se le aplicó A ESA PARCELA (regla J)",
      "cobertura_lenosa_pct": "si la fuente la publica, con su método; si no, null",
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

`bioma_verificado` va en `null`: lo verifico yo contra el FeatureServer de RESOLVE
sobre la coordenada que publicás, y las dos veces que una entrega lo rellenó estaba
mal. `lluvia_mm` y `temperatura_c` sólo si la fuente las publica como medias anuales
—o como el total y la media del año medido, diciéndolo—; nunca compuestas a mano, y
nunca de otra fuente.

---

## 7. Lo que ya está montado, para no repetirlo

Catorce mediciones en siete biomas: pradera de Dakota, altiplano de Puno, pastizal
de albardón del Delta Medio del Paraná, pastizal salino de Montecillo, frygana de
Lesbos, brezal de líquenes de Finlandia, sotobosque de robledal polaco, sotobosque
de aliso rojo de Oregón, once parcelas bajo dosel de ponderosa y tres aberturas del
mismo bosque en Colorado, avena fertilizada de Marcos Juárez y alfalfa bajo riego de
La Pampa.

Más la curva de forraje contra dosel de Colorado, la partición arriba/abajo de
Montecillo por cuatro algoritmos, las tres fracciones herbáceas de sitio —de 0,0039
a 0,92, un factor 236— y la primera fracción comible, 0,639.

Biomas todavía en cero: **1, 2, 3, 6, 7 y 9**.
