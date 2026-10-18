# Encargo de forraje — lote 13: la fracción comible

El lote 12 trajo las dos primeras mediciones de tierra de cultivo, las dos de
INTA y las dos bien hechas. **Y ninguna de las dos pudo entrar en el cálculo**,
por un motivo que vale aprender antes de seguir. Este encargo cambia de frente.

Es un documento autosuficiente: no hace falta haber visto los anteriores.

---

## 1. Qué es esto

acequia (`app.acequia.app`) analiza un predio y le dice al productor cuántos
animales puede sostener. Para eso necesita **kilos de materia seca comible por
hectárea y por año**.

Lo que ya tiene: **catorce mediciones de producción en siete de los quince biomas**
de RESOLVE, cada una verificada abriendo su fuente primaria, con método, unidad
literal, estacionalidad, rango de validez y coordenada publicada. Y desde el lote
11, la primera curva de forraje contra densidad de dosel.

Lo que falta es el último paso, y es el de este encargo: **de todo lo que el
pasto produce, cuánto come efectivamente el animal.**

acequia tiene **un solo punto** para eso. En el Delta Medio del Paraná, el único
sitio donde la materia seca herbácea total y la fracción forrajera están medidas
sobre la misma cosecha, la forrajera es el **59 a 74 %** de la total: 6.700 a
8.250 kg/ha contra 11.200 a 11.400. El resto se lo lleva el abrojo grande y las
demás especies que el animal no come, en un pastizal degradado.

Un punto no es una fracción. Y la consecuencia de que falte es concreta: cuando
acequia muestra una cifra de materia seca herbácea total y alguien la usa como
oferta de forraje, **sobreestima hasta un 70 %**.

---

## 2. La lección del lote 12, para no repetirla

El lote 12 trajo esto, y las dos entradas están montadas:

| sitio | insumos | kg MS/ha/año |
|---|---|---|
| Avena, 14 cultivares, EEA INTA Marcos Juárez, 2024 | 115 kg N/ha | 5.460 - **6.539** - 7.862 |
| Alfalfa, 10 cultivares, Curacó, La Pampa, 2013-14 | **1.300 mm de riego** | 18.674 - **19.880** - 21.035 |

Las dos en el bioma 8, las dos en Argentina, las dos con coordenada publicada que
verifiqué. **Entre las dos hay un factor 3,04, y lo explica el insumo.**

Ninguna alimenta el cálculo de forraje por cobertura, y el motivo es que un píxel
satelital dice que hay un cultivo y **no dice si está fertilizado ni si está
regado**. Los 1.300 mm de riego de la alfalfa son más agua que la lluvia anual de
cualquiera de los doce sitios de secano del archivo —el techo de todos es el
1.119 mm del altiplano de Puno—, y en una zona del Monte donde la lluvia natural
no llega a la mitad de eso. Si esa cifra entrara en la cuenta, cualquier predio
con un lote sembrado recibiría la oferta de una alfalfa bajo riego.

Así que ahora **cada medición declara sus `insumos`** y el cálculo usa sólo las de
secano. Las otras quedan en el archivo contestando la pregunta que de verdad
contestan: cuánto puede dar un lote cuando alguien le pone agua y nitrógeno.

**La lección para este lote:** una medición puede ser impecable y no servir para
lo que se la pidió. Decilo en la entrega cuando lo veas —en `nota` o en
`donde_deja_de_valer`— en vez de dejar que el número viaje solo.

---

## 3. Qué hace falta

Mediciones donde **el total y la parte comible salgan de la misma cosecha**.

### a. Composición y palatabilidad en el mismo sitio

Lo ideal: un trabajo que cosecha un pastizal, separa por especie, y clasifica cada
especie como forrajera o no forrajera para una especie animal determinada. De ahí
sale la fracción directo, y sale con numerador y denominador de la misma tabla.

Dónde: las **fichas de sitio ecológico del NRCS** publican producción por grupo de
plantas y a veces palatabilidad; la literatura de **condición de pastizal** de
INTA, Embrapa, INIA y el NRCS; y los trabajos de **composición botánica** que
miden el pastizal y la dieta en el mismo potrero.

### b. Dieta seleccionada contra oferta

Trabajos que midan qué come el animal —por observación directa, fístula
esofágica, microhistología de heces o n-alcanos— **y** la oferta del potrero en el
mismo momento. La relación entre las dos es la fracción, medida por el animal y no
estimada por el investigador.

### c. Utilización y pérdidas

Qué proporción de la oferta termina en el animal y qué se va en pisoteo,
senescencia y rechazo. Es la otra mitad del problema y suele publicarse aparte.
**Ojo con una cosa:** acequia ya aplica el uso admisible por su cuenta, con la
banda publicada de Holechek —30 / 40 / 50 % según la lluvia, 55 % en pastizal de
anuales—. Así que si una cifra ya trae descontado el uso admisible hay que decirlo
en letras grandes, porque si entra como si fuera un total se descuenta dos veces.

---

## 4. La trampa principal de este frente

**«Comible» depende del animal, y no es un matiz.** Bovino, ovino, caprino y
equino no comen lo mismo del mismo potrero: un caprino ramonea arbustivas que un
bovino no toca, y un equino corta más al ras. **La especie animal va declarada o
la cifra no entra.** Si el trabajo midió con una majada mixta, decilo así.

Y hay una segunda, que ya apareció medida: **los kilos de materia seca pueden no
ser kilos de alimento.** En la frigana de Lesbos, el único sitio mediterráneo que
acequia tiene montado, la materia seca cosechada tiene entre **5,4 y 7,3 % de
proteína bruta**, que el propio trabajo compara con la paja de cereal. Esos kilos
existen, están bien medidos, y un animal no sostiene su peso con ellos. Si la
fuente publica proteína bruta, digestibilidad o energía, **va también**: es lo que
separa forraje de relleno.

---

## 5. Las nueve reglas

**A. Toda cifra entra con su algoritmo y su unidad literal.** Cómo se calculó, y
la unidad **exactamente como la imprime la fuente**: `kg/ha`, `g/m²`, `lb/acre`,
`%`, `fraccion_0_1`, `gC/m²`. **Nunca convertir.** Un `gC` que llega como `g MS`
arruina el dato por un factor ~2 sin que se note.

**B. Si la fuente publica las partes, van todas**, y si publica más de un método
para la misma medición, van todos, uno por fila, sin promediar. Las dos entregas
más valiosas de este encargo fueron exactamente ésas: seis algoritmos sobre las
mismas cosechas en un bosque polaco, y cuatro publicaciones sobre la misma serie
en México, que discrepan 1,79× en el reparto arriba/abajo y sólo 1,06× en el
total.

**C. El tratamiento se nombra, y es distinto de un disturbio.** `tratamiento` para
lo que el experimento hizo a propósito —fertilización con nivel y nutriente, riego
con lámina, carga animal, clausura, quema, raleo— y `disturbios_en_la_ventana`
para lo que pasó sin que nadie lo planeara dentro del período promediado: sequía,
helada, incendio, inundación, plaga. **Y agregá los `insumos`**, que es la lección
del lote 12: `secano`, `fertilizado`, `riego` o los dos.

**D. Coordenada publicada, declarando qué clase de coordenada es.** El punto de la
parcela, el centroide de un área, una esquina de caja, la caja completa, o la
ubicación que el organismo publica para una estación con nombre propio (una EEA
del INTA, una unidad de Embrapa, un sitio LTER, un bosque experimental del
Servicio Forestal). Las cinco sirven **si se declara cuál es**. Lo que no sirve es
buscar la localidad en un mapa.

**E. Nunca se promedia un máximo con un mínimo, ni una normal con una temporada
medida.** Varias fichas publican «mean monthly minimum 10,7 °C (enero)» y «mean
monthly maximum 29,5 °C (marzo)»: son el mes más frío y el más cálido, y **no
promedian a la media anual**. En cambio el promedio de las doce medias mensuales
**sí** es una media anual, y si es la del año medido y no la normal, se dice.

**F. Flujo, no stock — con la excepción escrita.** Producción del ciclo, no
biomasa acumulada de años anteriores. **No sirve** disponibilidad a una fecha
suelta, lecturas de disco de pastura, biomasa en pie de líquenes o de pajonal
perenne. **Sí sirve** la cosecha a ras de la biomasa del año en su pico, declarada
como «peak standing crop», con el sesgo dicho: subestima entre un 50 y un 52 %
contra el mejor de los seis algoritmos publicados. En los líquenes de Finlandia el
stock llega a **50 veces** el flujo anual, y ése es el error que la regla ataja.

**G. La advertencia de la fuente va textual**, entre comillas y en su idioma. La
que más sirvió en todo el encargo fue una línea del ORNL: «NPP values for MNT1
reported in other published accounts differ due to different measurement and
calculation methods».

**H. Una fracción se arma con numerador y denominador de la misma tabla y la misma
unidad.** **Esta regla es el corazón de este lote.** Si la fracción comible sale de
dividir una oferta publicada por un autor y un consumo publicado por otro, no es
una fracción: es dos estimaciones divididas entre sí, y la diferencia de método se
vuelve señal. Los tres cocientes de fracción herbácea que acequia tiene valen
precisamente porque cada uno sale de una sola tabla.

**I. Un área publicada no es una coordenada hasta que da un solo bioma.** Mandala
igual, rotulada como área y con sus límites completos, pero cuanto más grande
menos probable que sirva. Caso cerrado: el único polígono que un grupo publica
para unas parcelas en Nepal mide 17 × 20 km y **cruza tres biomas** —consulté las
cuatro esquinas y el centro—, así que esa medición no se puede montar.

---

## 6. La forma del JSON

Un archivo, `13.json`:

```json
{
  "encargo": "forraje",
  "lote": 13,
  "fecha": "2026-10-__",
  "entradas": [
    {
      "id": "comible_01",
      "sitio": "nombre del sitio como lo llama la fuente",
      "coordenada_de_la_fuente": "lo que publique, con el valor completo",
      "clase_de_coordenada": "parcela | centroide_de_area | esquina_de_caja | caja_completa | estacion_experimental",
      "superficie_declarada": "si es área o estación, cuánto mide",
      "es_el_sitio_publicado": true,
      "bioma_verificado": null,
      "clase_wc_del_sitio": "qué vería un satélite: bosque / arbustal / pastizal / cultivo",
      "insumos": "secano | fertilizado | riego | riego_y_fertilizado",
      "especie_animal": "bovino | ovino | caprino | equino | majada_mixta, y la categoría si la publica",
      "metodo_de_la_dieta": "composición botánica | fístula esofágica | microhistología | n-alcanos | clasificación por palatabilidad del autor | observación directa",
      "cifras": [
        {
          "componente": "ms_herbacea_total | ms_forrajera | fraccion_comible | consumo_observado | utilizacion | proteina_bruta_pct | digestibilidad_pct",
          "valor": 0.63,
          "unidad": "fraccion_0_1 | kg_ms_ha | porcentaje",
          "unidad_publicada": "tal como la imprime la fuente",
          "de_la_misma_tabla_que": "qué otro componente de esta misma lista comparte tabla con éste, que es lo que hace válido el cociente",
          "metodo": "cómo se midió y cómo se calculó, textual",
          "ya_descuenta_uso_admisible": false,
          "tratamiento": "carga animal, clausura, fertilización con nivel",
          "n_sitios": 1,
          "dispersion": "desvío, error estándar o rango, como lo publique",
          "periodo": "años de ESTA cifra"
        }
      ],
      "que_cuenta": "qué especies entran en el numerador y cuáles quedan afuera, con nombres",
      "disturbios_en_la_ventana": "sequía, incendio, inundación, plaga",
      "lluvia_mm": null,
      "temperatura_c": null,
      "estacionalidad": "si la fracción comible cambia a lo largo del año, cómo",
      "donde_deja_de_valer": "lo que la fuente limite, y lo que vos veas que la limita",
      "medido_en": "años de medición, no de publicación",
      "advertencia_de_la_fuente": "textual, entre comillas, en su idioma",
      "fuentes": [{ "label": "cita completa", "url": "PDF o DOI" }],
      "verificacion": "en qué página, tabla o figura está cada cifra",
      "nota": "lo que no cabe en ningún campo, incluido «esto no sirve para lo que se pidió, y por qué»"
    }
  ],
  "vacias": [
    { "id": "lo_que_se_buscó", "motivo": "qué se buscó, dónde, y por qué no entra" }
  ]
}
```

El campo `de_la_misma_tabla_que` es nuevo y es el que hace auditable la regla H:
si una fracción no puede nombrar con qué otra cifra comparte tabla, no es una
fracción.

---

## 7. Lo que sigue arrastrado, y entra en cualquier entrega

Tres pedidos chicos que vienen de lotes anteriores. Si aparecen de paso, van; no
hay que salir a buscarlos.

1. **Las dieciocho ecuaciones de Arizona.** Bojórquez-Tapia, Ffolliott y Guertin
   (1990), «Herbage production-forest overstory relationships in two Arizona
   ponderosa pine forests», *Journal of Range Management* 43(1): 25-28, DOI
   10.2307/3899114. Regresiones de producción herbácea contra variables del dosel
   sobre mediciones repetidas de 1959 a 1980, con formas logarítmica, exponencial
   e hiperbólica. Hacen falta las ecuaciones aceptadas con forma, coeficientes,
   unidades y r², de qué bosque es cada una, y la advertencia textual de los
   autores. El archivo del JRM está en la Universidad de Arizona y se mudó de
   dominio; desde acá `repository.arizona.edu` devuelve 403.
   **Por qué importa:** la curva que acequia montó del lote 11 —un bosque de
   ponderosa en Colorado— dice que el forraje cae **1,15 % del valor a cielo
   abierto por cada punto de densidad de copa**, y llega a cero al 87 % de dosel.
   Las dos temporadas medidas dan esa misma pendiente relativa con una diferencia
   del 0,24 %, aunque el nivel absoluto entre los dos años se mueva 2,1 veces. Si
   Arizona da una pendiente parecida, la forma es transferible y acequia tiene una
   función; si no, lo de Colorado es una anécdota de un bosque.
2. **Moore y Deiter (1992)**, «Stand density index as a predictor of forage
   production in northern Arizona pine forests», JRM 45(3): 267-271. El lote 11 ya
   abrió la copia digitalizada y confirmó Kaibab Plateau, el índice de densidad de
   rodal, forraje del año corriente de graminoides, hierbas y arbustos, y r² de
   0,76 lineal y 0,72 no lineal con SE de 5,08 y 5,51 kg/ha. Faltan **la forma y
   los coeficientes exactos**.
3. **Rastrojo.** El lote 12 lo buscó y volvió vacío dos veces. Es el dato que de
   verdad haría falta para la clase cultivo, porque es lo único de esa clase cuyo
   número **no depende de lo que el productor le puso** sino de lo que la cosecha
   dejó: materia seca de rastrojo de maíz, sorgo, soja o trigo, con el rendimiento
   de grano del mismo lote y, si se publica, la caída por mes de pastoreo.
