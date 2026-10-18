# Encargo de forraje — lote 12: el cultivo, que no tiene ni una medición

El lote 11 fue el mejor de los doce: trajo la primera curva de forraje contra
dosel, con catorce pares y cuatro ecuaciones publicadas, y **la verifiqué
reajustando la regresión sobre los pares**. Este encargo cambia de frente.

Es un documento autosuficiente: no hace falta haber visto los anteriores.

---

## 1. Qué es esto

acequia (`app.acequia.app`) analiza un predio y le dice al productor cuántos
animales puede sostener. Para eso necesita **kilos de materia seca comible por
hectárea y por año**.

La app lee la cobertura del suelo de cada predio con ESA WorldCover a 10 m, que
la clasifica en bosque, arbustal, pastizal, cultivo y unas cuantas clases más que
no se pastorean. Para las cuatro que sí, acequia arma una banda de forraje con
las mediciones de campo que este encargo fue juntando, **doce sitios en siete de
los quince biomas de RESOLVE**, cada una verificada abriendo su fuente primaria.

Así está hoy la cosa:

| clase de WorldCover | sitios medidos | banda, kg MS/ha·año |
|---|---|---|
| 10, bosque/arbolado | 4 | 39 a 940 |
| 20, arbustal | 1 | 300 a 5.800 |
| 30, pastizal | 7 | 350 a 10.630 |
| **40, cultivo** | **0** | **ninguna** |

**Eso es este encargo: la clase 40.** Es la única de las cuatro sin una sola
medición, y es la que aparece en la mayoría de los predios que usan la app.
Hasta ayer tenía un peso inventado de 4.500 kg MS/ha/año, que se eliminó
justamente porque no tenía fuente.

---

## 2. Qué hace falta

Materia seca **pastoreable** de tierra de cultivo, con el cultivo nombrado y el
manejo declarado. Tres familias, en orden de utilidad:

### a. Rastrojo

Lo que queda en el lote después de la cosecha de grano y que un animal puede
comer: maíz, sorgo, soja, trigo, girasol, arroz. Interesa:

- **kg de materia seca por hectárea** de residuo, y si la fuente distingue,
  cuánto de eso es efectivamente consumible (la chala y la hoja contra la caña);
- el **rendimiento de grano del mismo lote**, si lo publica, porque la relación
  entre grano y residuo es la forma de transferir la cifra a otro lote;
- la **tasa de desaparición o pérdida con el tiempo**: un rastrojo de abril no es
  el mismo en agosto, y varias fuentes publican la caída por mes de pastoreo.

Dónde: INTA (Argentina), Embrapa (Brasil), INIA (Uruguay y Chile), el NRCS y las
extensiones universitarias de Estados Unidos, que tienen una literatura larga de
*corn residue grazing*. Y la FAO para arroz y trigo en Asia.

### b. Verdeos y cultivos forrajeros anuales

Avena, centeno, raigrás anual, cebada forrajera, moha, sorgo forrajero, maíz para
pastoreo directo. Interesa kg MS/ha/año **medidos en un ensayo**, no de catálogo
comercial, con la fecha de siembra y los cortes o pastoreos del ciclo.

### c. Pasturas implantadas

Sólo si la fuente distingue implantada de natural, y declarando la especie o la
mezcla. Una alfalfa bajo riego y un campo natural no son la misma clase de dato
aunque un satélite los confunda.

---

## 3. Las tres trampas de este frente

Son específicas y las tres ya arruinaron datos en lotes anteriores.

**1. El rastrojo no es producción del año.** Es lo que sobró de una producción que
en buena parte se fue en el grano. Decí explícitamente qué es la cifra:
producción anual de biomasa aérea del cultivo, residuo post-cosecha, o materia
seca pastoreable estimada a partir del residuo. Las tres son números distintos y
la diferencia es grande.

**2. Casi todo lo publicado de verdeos sale de un ensayo fertilizado.** Y sin el
nivel de nitrógeno declarado la cifra no sirve para un predio que no fertiliza.
Esto costó tres lotes: una cifra de sabana sudafricana que parecía 2,6 veces la
del sitio vecino resultó ser una fila `P0N3` de un ensayo de cinco niveles de
nitrógeno por tres de fósforo, en un área a la que le habían sacado todos los
árboles. Un sitio verificado, un bioma verificado y una fuente abierta pueden
seguir siendo una parcela agronómica.

**3. El riego cambia la clase de dato, no el número.** Un cultivo bajo riego no
mide lo que el clima del lugar puede dar. Si la fuente riega, va declarado, y con
la lámina si la publica.

---

## 4. Las nueve reglas

**A. Toda cifra entra con su algoritmo y su unidad literal.** Cómo se calculó, y
la unidad **exactamente como la imprime la fuente**: `kg/ha`, `t/ha`, `Mg/ha`,
`lb/acre`, `g/m²`, `kg MS/ha`. **Nunca convertir**: la conversión la hace acequia
y tiene test. Un `gC` que llega como `g MS` arruina el dato por un factor ~2 sin
que se note, y un `t/ha` leído como `kg/ha` por mil.

**B. Si la fuente publica las partes, van todas.** Grano y residuo; aéreo y
subterráneo; por corte y total del ciclo. Y si publica más de un método para la
misma medición, van **todos**, uno por fila, sin promediar. Las dos entregas más
valiosas de este encargo fueron exactamente ésas: seis algoritmos sobre las mismas
cosechas en un bosque polaco, y cuatro publicaciones sobre la misma serie en
México, que discrepan 1,79× en el reparto arriba/abajo y sólo 1,06× en el total.

**C. El tratamiento se nombra, y es distinto de un disturbio.** Dos campos:
`tratamiento` para lo que el experimento hizo a propósito —fertilización con
nivel y nutriente, riego con lámina, densidad de siembra, carga animal, labranza
o siembra directa— y `disturbios_en_la_ventana` para lo que pasó sin que nadie lo
planeara —granizo, sequía, helada, plaga— adentro del período promediado.

**D. Coordenada publicada, declarando qué clase de coordenada es.** Puede ser el
punto de la parcela, el centroide de un área, una esquina de caja, la caja
completa, o **la ubicación que el organismo publica para una estación
experimental con nombre propio** (una EEA del INTA, una unidad de Embrapa, un
sitio LTER). Las cinco sirven **si se declara cuál es**. Lo que no sirve es buscar
la localidad en un mapa y escribir eso. Mandá lo que la fuente diga, con el rótulo
puesto, y la verificación del bioma la hace acequia.

**E. Nunca se promedia un máximo con un mínimo, ni una normal con una temporada
medida.** Varias fichas publican «mean monthly minimum 10,7 °C (enero)» y «mean
monthly maximum 29,5 °C (marzo)»: son el mes más frío y el más cálido, y **no
promedian a la media anual**. Si la fuente publica una normal de largo plazo y
además las campañas que midió, las dos van por separado y rotuladas.

**F. Flujo, no stock — con la excepción escrita.** Producción del ciclo, no
biomasa acumulada de años anteriores. **No sirve** disponibilidad a una fecha
suelta sin el ciclo, ni lecturas de disco de pastura, ni biomasa en pie de leñosas
o de pajonal perenne. **Sí sirve** la cosecha a ras de la biomasa del ciclo en su
pico, declarada como «peak standing crop», con el sesgo dicho: subestima entre un
50 y un 52 % contra el mejor de los seis algoritmos publicados. En un rastrojo el
«stock» es justamente el objeto, así que acá la regla es simple: decí a qué fecha
respecto de la cosecha corresponde la medición.

**G. La advertencia de la fuente va textual**, entre comillas y en su idioma. Si
el trabajo dice que su ficha es provisional, que su método subestima o que otros
autores publican otra cosa, eso vale más que la cifra. La advertencia que más
sirvió en todo el encargo fue una sola línea del ORNL: «NPP values for MNT1
reported in other published accounts differ due to different measurement and
calculation methods».

**H. Una fracción se arma con numerador y denominador de la misma tabla y la
misma unidad.** Grano sobre biomasa total, residuo sobre grano, comible sobre
residuo: las dos cifras de la misma tabla. Si salen de publicaciones distintas no
es una fracción, es dos estimaciones divididas entre sí, y la diferencia de método
se vuelve señal.

**I. Un área publicada no es una coordenada hasta que da un solo bioma.** Mandala
igual, rotulada como área y con sus límites completos, pero cuanto más grande,
menos probable que sirva. Un caso cerrado: el único polígono que un grupo publica
para unas parcelas en Nepal mide 17 × 20 km y **cruza tres biomas** —consulté las
cuatro esquinas y el centro—, así que esa medición no se puede montar.

---

## 5. La forma del JSON

Un archivo, `12.json`:

```json
{
  "encargo": "forraje",
  "lote": 12,
  "fecha": "2026-10-__",
  "entradas": [
    {
      "id": "cultivo_01",
      "sitio": "nombre del sitio o de la estación, como lo llama la fuente",
      "coordenada_de_la_fuente": "lo que publique, con el valor completo",
      "clase_de_coordenada": "parcela | centroide_de_area | esquina_de_caja | caja_completa | estacion_experimental",
      "superficie_declarada": "si es área o estación, cuánto mide",
      "es_el_sitio_publicado": true,
      "bioma_verificado": null,
      "familia": "rastrojo | verdeo | cultivo_forrajero | pastura_implantada",
      "cultivo": "especie o mezcla, con cultivar si lo publica",
      "cifras": [
        {
          "componente": "residuo_post_cosecha | materia_seca_pastoreable | produccion_aerea_del_ciclo | rendimiento_de_grano | por_corte",
          "valor": 4200,
          "unidad": "kg_ms_ha",
          "unidad_publicada": "kg MS/ha",
          "a_que_fecha": "qué momento del ciclo, o cuántos días después de cosecha",
          "metodo": "cómo se midió y cómo se calculó, textual",
          "tratamiento": "fertilización con nivel y nutriente, riego con lámina, densidad, labranza",
          "n_sitios": 1,
          "dispersion": "desvío, error estándar o rango, como lo publique",
          "periodo": "campañas de ESTA cifra"
        }
      ],
      "desaparicion_en_el_tiempo": "si publica la caída del rastrojo por mes o por día de pastoreo, la serie entera. null si no",
      "riego": "secano | riego, con lámina si la publica",
      "que_cuenta": "qué partes de la planta incluye y cuáles no",
      "disturbios_en_la_ventana": "granizo, sequía, helada, plaga",
      "lluvia_mm": null,
      "temperatura_c": null,
      "estacionalidad": "cuándo está disponible, que en un rastrojo es la mitad del dato",
      "donde_deja_de_valer": "suelo, rendimiento del lote, zona, lo que la fuente limite",
      "medido_en": "campañas de medición, no año de publicación",
      "advertencia_de_la_fuente": "textual, entre comillas, en su idioma",
      "fuentes": [{ "label": "cita completa", "url": "PDF o DOI" }],
      "verificacion": "en qué página, tabla o figura está cada cifra",
      "nota": "lo que no cabe en ningún campo"
    }
  ],
  "vacias": [
    { "id": "lo_que_se_buscó", "motivo": "qué se buscó, dónde, y por qué no entra" }
  ]
}
```

---

## 6. Dos cosas que quedaron pendientes del lote 11

No son el frente de esta entrega, pero si aparecen de paso, entran. Las dos son
el mismo pedido: **el texto completo de un artículo del *Journal of Range
Management***, cuyo archivo está en la Universidad de Arizona y se mudó de
dominio.

1. **Bojórquez-Tapia, Ffolliott y Guertin (1990), «Herbage production-forest
   overstory relationships in two Arizona ponderosa pine forests», JRM 43(1):
   25-28, DOI 10.2307/3899114.** Son **dieciocho ecuaciones de regresión** entre
   producción herbácea y variables del dosel, sobre mediciones repetidas de 1959 a
   1980 en dos bosques de ponderosa, con formas logarítmica, exponencial e
   hiperbólica. Hace falta: las ecuaciones aceptadas con forma, coeficientes,
   unidades y r²; de qué bosque es cada una; la variable de dosel de cada una con
   su unidad; y la advertencia textual de los autores, que dicen que sirven más
   para planificación de largo plazo que para predecir un año.
2. **Moore y Deiter (1992), «Stand density index as a predictor of forage
   production in northern Arizona pine forests», JRM 45(3): 267-271.** El lote 11
   ya abrió la copia digitalizada y confirmó Kaibab Plateau, SDI, forraje del año
   corriente de graminoides, hierbas y arbustos, r² 0,76 lineal y 0,72 no lineal,
   con SE de 5,08 y 5,51 kg/ha. Falta **la forma y los coeficientes exactos de las
   dos ecuaciones**, que es lo único que acequia necesita para poder compararlas
   con la recta de Colorado.

Por qué importan tanto: la recta que entró del lote 11 —de un bosque de
ponderosa en Colorado— dice que el forraje cae **1,15 % del valor a cielo abierto
por cada punto de densidad de copa**, y que a 87 % de dosel llega a cero. Las dos
temporadas medidas dan esa misma pendiente relativa con una diferencia del
0,24 %, aunque el nivel absoluto entre los dos años se mueva 2,1 veces. **Si las
ecuaciones de Arizona dan una pendiente relativa parecida, la forma es
transferible y acequia puede usarla; si dan otra, no.** Es la diferencia entre
tener una función y tener una anécdota.
