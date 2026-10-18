# Encargo de forraje — lote 11: el dosel, de nuevo y con las reglas arregladas

El lote 10 volvió **vacío, con tres rechazos**. Uno de los tres estaba bien y
quedó cerrado del lado de acequia. Los otros dos fueron **más estrictos que las
reglas**, y la culpa es de cómo estaban escritas. Este encargo las arregla y
vuelve a pedir el mismo frente.

Es un documento autosuficiente: no hace falta haber visto los anteriores.

---

## 1. Qué es esto y para quién

acequia (`app.acequia.app`) analiza un predio y le dice al productor cuántos
animales puede sostener. Para eso necesita **kilos de materia seca comible por
hectárea y por año**, y hoy ese número sale de una escalera por lluvia anual sin
ninguna fuente publicada.

Lo que ya hay, verificado abriendo cada fuente primaria: **diez mediciones en
siete de los quince biomas** de RESOLVE, cada una con método, unidad literal,
estacionalidad, rango de validez y coordenada publicada. Tres de las diez son
sotobosque de bosque cerrado.

Y lo que ya está medido, que es lo que ordena este encargo: **la capa herbácea de
un sitio, medida contra todo lo aéreo de ese mismo sitio, va de 0,0039 a 0,92 —un
factor 236— y lo que la mueve no es el clima sino cuánta luz llega al piso.**

| sitio | capa herbácea | aéreo total del sitio | cociente | dosel |
|---|---|---|---|---|
| Waring's Woods, Pseudotsuga, Oregón | 6 | 1.540 g MS/m²/año | **0,0039** | cerrado, 4,9 % de cobertura herbácea |
| Cascade Head 1A, aliso rojo, Oregón | 41 | 1.630 g MS/m²/año | 0,0252 | 35,2 % de cobertura herbácea |
| Very Shallow 23-31 PZ, Edwards Plateau | 1.840 | 2.000 lb/acre/año | **0,92** | pradera con leñosas dispersas |

Los dos sitios de Oregón están a 200 km uno del otro, tienen el mismo clima,
producen casi lo mismo de rodal —1.540 y 1.630— y su sotobosque difiere 6,5
veces. De las variables que harían falta, **el dosel es la única que acequia ya
mide en cada predio**: lee ESA WorldCover a 10 m.

Falta la curva. Tres puntos son dos puntas y un sitio en el medio.

---

## 2. Qué pasó con el lote 10, para no repetirlo

### El rechazo que estaba bien, y que acequia ya cerró

El lote 10 fue a buscar **la coordenada de las parcelas de Gautam y Mandal
(2016)** en Sunsari, Nepal, y encontró que una publicación posterior del mismo
grupo (Gautam y Mandal, 2018, *Our Nature* 16(1), sección «Study area») describe
el bosque con el rectángulo **26°41′–26°50′ N, 87°09′–87°21′ E**, 220–370 m. Se
negó a convertir ese rectángulo en un punto.

**Hizo bien, y ahora se sabe por qué con un número.** Consulté el servicio de
ecorregiones de RESOLVE en las cuatro esquinas y el centro de ese rectángulo:

| punto | ecorregión | bioma |
|---|---|---|
| 26°41′ N, 87°09′ E | Terai-Duar savanna and grasslands | **7** |
| 26°41′ N, 87°21′ E | Terai-Duar savanna and grasslands | **7** |
| centro | Terai-Duar savanna and grasslands | **7** |
| 26°50′ N, 87°09′ E | Himalayan subtropical broadleaf forests | **1** |
| 26°50′ N, 87°21′ E | Himalayan subtropical pine forests | **3** |

**Un rectángulo de 17 × 20 km cruza tres biomas.** Así que esa medición sigue sin
poder montarse, y el motivo ya no es formal sino medido.

Pero cambia de valor: si las parcelas están en el Terai —a 220-370 m es lo más
probable—, **serían la primera medición del bioma 7, la sabana tropical, que
acequia persigue desde hace cuatro lotes sin una sola entrada.** Si en el trabajo
de 2016, en una tesis asociada, en un suplemento o en cualquier publicación del
mismo grupo aparece la **coordenada de una parcela** (o el nombre del bosque
comunitario concreto, que suele estar georreferenciado en los registros
forestales de Nepal), eso vale más que varias entradas nuevas. Si no aparece,
decilo y no se insiste más.

### Los dos rechazos que fueron de más, y la regla que los causó

**Caso 1: Metz (1974), Manitou Experimental Forest.** Catorce parcelas
permanentes sobre un gradiente natural de densidad de ponderosa, con cosechas de
junio, julio y agosto de 1972 y agosto de 1973, y la figura de la relación con el
dosel armada sobre las cosechas de agosto. Se rechazó por la regla del flujo
contra el stock.

**Eso fue de más.** La regla existe para atajar un error real —en los líquenes de
Finlandia la biomasa en pie llega a **50 veces** el crecimiento anual, y
Serengeti, Kruger y el Pantanal publican disponibilidad a una fecha—, pero **una
cosecha a ras de la capa herbácea del año, en el pico de la estación, es un
método de producción publicado y reconocido**: es el «peak standing crop», el
método 1 de los seis que Rawlik y Jagodziński compararon sobre las mismas
cosechas en un robledal polaco. Subestima entre un 50 % y un 52 % respecto del
método 6, y acequia ya tiene montada esa medición **con el sesgo declarado**.

La diferencia que importa: el stock es un problema cuando la biomasa **se acumula
de un año al otro** —líquenes, pajonal perenne, material muerto en pie de una
pastura perenne, leñosas—. Una cosecha de herbáceas del año en su pico es
producción con sesgo conocido, no stock.

Entonces Metz entra, si trae lo demás. Lo que de verdad faltaba es la
coordenada, y ahí va el caso 2.

**Caso 2: la coordenada de un bosque experimental.** Metz ubica el sitio «a unas
28 millas al noroeste de Colorado Springs» y no imprime coordenadas. Se rechazó
por eso, y con la regla vieja correspondía.

**La regla estaba mal escrita.** El Manitou Experimental Forest es una estación
de investigación con nombre propio, administrada por el Servicio Forestal de
Estados Unidos, que **publica la ubicación de sus propios bosques
experimentales**. Esa coordenada institucional es una coordenada publicada, no
una búsqueda en un mapa: la publica el mismo organismo que administra el sitio,
para ese sitio. Lo mismo vale para los sitios LTER, las estaciones
experimentales del INTA, de Embrapa, del INIA y del CSIRO.

Va con dos condiciones: **declarar que es la coordenada de la estación y no de la
parcela**, y **decir la superficie de la estación**, porque acequia verifica el
bioma sobre ese punto y necesita saber cuánta incertidumbre tiene.

---

## 3. Las nueve reglas

**A. Toda cifra publicada entra con su algoritmo y su unidad literal.** Cómo se
calculó la producción anual y la unidad **exactamente como la imprime la
fuente**: `g/m²/yr`, `gC/m²/yr`, `lb/acre`, `kg/ha`, `Mg/ha`, `%`,
`fraccion_0_1`. **Nunca convertir.** Un `gC` que llega como `g MS` arruina el dato
por un factor ~2 sin que se note.

**B. Si la fuente publica ANPP, BNPP y TNPP, van las tres.** Y si publica más de
un algoritmo para la misma serie, van **todos**, uno por fila, sin promediar. Las
dos entregas más valiosas de todo este encargo fueron justamente ésas: seis
algoritmos sobre las mismas cosechas en Polonia, y cuatro publicaciones sobre la
misma serie en México.

**C. El tratamiento de la parcela se nombra, y es distinto de un disturbio.** Dos
campos separados:

- `tratamiento`: lo que el experimento hizo a propósito — fertilizado (con nivel
  y nutriente), clausurado, pastoreado (con carga), raleado (con intensidad),
  quemado como tratamiento, riego, control.
- `disturbios_en_la_ventana`: lo que pasó sin que nadie lo planeara, adentro del
  período promediado — incendios, sequías, inundaciones, plagas.

Esto costó tres lotes: Towoomba publicaba 198 g/m²/año que parecían 2,6 veces la
sabana vecina y era una fila fertilizada `P0N3` de un ensayo al que le habían
quitado todos los árboles. Y el promedio de Montecillo de 1.676 g/m²/año es el de
un año bueno, el año de un incendio accidental y el de la recuperación.

**D. Coordenada publicada, declarando qué clase de coordenada es.** Puede ser el
punto de la parcela, el centroide de un área, una esquina de una caja, el
rectángulo entero, o **la ubicación que el organismo administrador publica para
una estación experimental con nombre propio**. Las cinco sirven **si se declara
cuál es**. Lo que no sirve es buscar el pueblo en un mapa y escribir eso. Mandá lo
que la fuente diga, con el rótulo puesto, y la verificación la hace acequia.

**E. Nunca se promedia un máximo con un mínimo, ni una normal con una temporada
medida.** Varias fichas publican «mean monthly minimum 10,7 °C (enero)» y «mean
monthly maximum 29,5 °C (marzo)»: son el mes más frío y el más cálido y **no
promedian a la media anual**. Y si la fuente publica una normal de largo plazo
(415 mm, 17 °C) y además las temporadas que midió (354 y 797 mm), las dos cosas
van por separado y rotuladas.

**F. Flujo, no stock — con la excepción escrita.** Producción anual, no biomasa
acumulada. **No sirven**: disponibilidad a una fecha, lecturas de disco de
pastura, biomasa en pie de líquenes o de pajonal perenne, stock de leñosas.
**Sí sirve**: la cosecha a ras de la capa herbácea del año en el pico de la
estación, declarada como «peak standing crop» o método 1, con el sesgo dicho. Si
hay duda, mandalo con el método textual y que acequia decida.

**G. La advertencia de la fuente va textual.** Si el trabajo dice que su ficha es
provisional, que su método subestima, que el sitio no es representativo o que
otros autores publican otra cosa, va entre comillas y en el idioma original.

**H. Una fracción se arma con numerador y denominador de la misma tabla y la
misma unidad.** Si el numerador sale de una publicación y el denominador de otra,
no es una fracción: es dos estimaciones divididas entre sí, y la diferencia de
método se vuelve señal. Si la fuente publica sólo una mitad, va como cifra suelta
y se dice que falta la otra.

**I (nueva). Un área publicada no es una coordenada hasta que da un solo
bioma.** Mandala igual, rotulada como área, con sus límites completos. Pero sabé
que si las esquinas caen en biomas distintos la entrada no se puede montar, como
acaba de pasar con Nepal: 17 × 20 km, tres biomas. Cuanto más chica el área
declarada, más probable que sirva.

---

## 4. Lo que hay que traer: `11.json`

**El frente es uno solo: la curva de forraje contra dosel.** Lo que hace falta son
**pares del mismo sitio con dos o más niveles de dosel**. Un sitio con 0 %, 30 % y
60 % de cobertura arbórea y su producción herbácea en cada nivel vale más que
veinte sitios sueltos, porque entre sitios distintos el clima se mete en el medio
y ya no se puede separar del efecto de la sombra.

### Los tres pedidos concretos, en orden

**1. Metz, Harley E. (1974), «Relationship between ponderosa pine and understory
herbage production», tesis de maestría, Colorado State University, 90 p.** El
lote 10 ya la localizó y leyó: catorce parcelas permanentes sobre un gradiente
natural de densidad, resumen en p. iii, diseño en pp. 18-19, Tablas 1 y 2 en
pp. 44-45, Figuras 10-11 en pp. 56-57. Ahora entra bajo la regla F corregida.
Hace falta:

- los pares parcela por parcela: la variable de dosel de cada una **con su
  unidad** (área basal, densidad, cobertura de copa — la que use la tesis) y el
  rendimiento herbáceo de agosto de cada una;
- si las figuras 10-11 traen una **ecuación ajustada**, su forma exacta, sus
  coeficientes, la unidad de cada uno y su r²;
- la ubicación que el Servicio Forestal publica para el **Manitou Experimental
  Forest** y su superficie, declarada como coordenada de estación (regla D);
- lluvia y temperatura media anual del bosque experimental, si la tesis o la
  ficha de la estación las publican como medias anuales (regla E).

El PDF está en el sitio del Servicio Forestal
(`fs.usda.gov/rm/pubs_exp_forests/manitou/rmrs_1974_metz_h001.pdf`); desde acá
ese dominio responde 403, así que si vos podés abrirlo, abrilo. Si no, está el
repositorio digital de Colorado State University (Mountain Scholar) y
Treesearch.

**2. Bojórquez-Tapia, Ffolliott y Guertin (1990), «Herbage production-forest
overstory relationships in two Arizona ponderosa pine forests», *Journal of Range
Management* 43(1): 25-28, DOI 10.2307/3899114.** Es **dieciocho ecuaciones de
regresión** entre producción herbácea y variables del dosel, ajustadas sobre
mediciones repetidas de 1959 a 1980 en dos bosques de ponderosa, con formas
logarítmica, exponencial e hiperbólica. Es exactamente la curva que falta. Hace
falta:

- las ecuaciones que los autores aceptaron: forma, coeficientes, unidades, r², y
  **de qué bosque es cada una**;
- la variable de dosel de cada ecuación, con su unidad;
- qué cuenta el numerador: gramíneas solas, gramíneas y hierbas, todo lo
  herbáceo;
- los dos bosques nombrados, con la coordenada que la fuente publique;
- la advertencia de los propios autores, textual: dicen que las ecuaciones sirven
  más para planificación de largo plazo que para predecir un año concreto.

El archivo de JRM está en la Universidad de Arizona y se mudó de dominio. El
camino que vi: `rangelandsgateway.org/dlio/1646` apunta al visor de
`digitalcommons.library.arizona.edu` sobre el archivo
`jrm.library.arizona.edu/Volume43/Number1/azu_jrm_v43_n1_25_28_m.pdf`. Desde acá
ninguno de los dos resuelve. Probá también el repositorio
`repository.arizona.edu` y el portal nuevo
`journals.librarypublishing.arizona.edu`.

**3. Moore y Deiter (1992), «Stand density index as a predictor of forage
production in northern Arizona pine forests», *Journal of Range Management*.**
Kaibab Plateau, y el índice de densidad de rodal como predictor de forraje. Mismo
archivo, mismo tratamiento. Su revisión bibliográfica dice que trabajos
anteriores encontraron área basal y cierre de copa muy correlacionados con la
producción de forraje: si cita números con sitio, también sirven de pista.

### Si esos tres no alcanzan, dónde más hay exactamente esto

- **Las Research Notes y General Technical Reports del Servicio Forestal**,
  estaciones Rocky Mountain e Intermountain: Clary y Ffolliott, McConnell y Smith
  (1970), Pase (1958), Jameson (1967). Casi todo abierto en Treesearch.
- **Ensayos de raleo que midieron el piso.** Un raleo es el experimento ideal:
  mismo suelo, mismo clima, mismo año, dos doseles. Parcela raleada contra
  control es un par perfecto.
- **Silvopastoril medido**: CATIE (Costa Rica), CIPAV (Colombia), INTA (Chaco,
  Delta), Embrapa Florestas. Interesa forraje bajo distintas densidades de
  árboles, con la densidad publicada.
- **Dehesa y montado**: encinares de España y Portugal, que publican justamente
  «bajo copa contra entre copas».
- **Sabana africana y australiana con cobertura leñosa cuantificada.** Acá se
  cruzan dos pendientes: el bioma 7 sigue vacío, y un sitio con cobertura leñosa
  publicada más producción herbácea anual resuelve las dos de una vez.

### Lo que no sirve para este frente

Cobertura de dosel sin producción herbácea de esa misma parcela, o producción
herbácea sin la cobertura de dosel de esa misma parcela. Y las descripciones
cualitativas —«bosque abierto», «denso»— no son una variable: hace falta el
número que la fuente midió.

Un cuidado que puede arruinar la entrega entera: **cobertura de copa, área basal,
densidad de árboles e índice de área foliar no son intercambiables.** Decir cuál
usa la fuente, con su unidad, y **no traducir entre ellas**.

---

## 5. La forma del JSON

Un archivo, `11.json`:

```json
{
  "encargo": "forraje",
  "lote": 11,
  "fecha": "2026-10-__",
  "entradas": [
    {
      "id": "dosel_forraje_metz_manitou",
      "sitio": "nombre del sitio como lo llama la fuente",
      "coordenada_de_la_fuente": "lo que publique, con el valor completo",
      "clase_de_coordenada": "parcela | centroide_de_area | esquina_de_caja | caja_completa | estacion_experimental",
      "superficie_declarada": "si es área o estación, cuánto mide",
      "es_el_sitio_publicado": true,
      "bioma_verificado": null,
      "clase_wc_del_sitio": "qué vería un satélite: bosque / arbustal / pastizal / cultivo",
      "tipo_de_dosel": "especie dominante, edad y estructura si la publica",
      "variable_del_dosel": "cobertura_de_copa_pct | area_basal_m2_ha | area_basal_ft2_acre | densidad_arboles_ha | indice_densidad_rodal | indice_de_area_foliar",
      "pares": [
        {
          "dosel": 0,
          "forraje": 1200,
          "unidad": "lb_acre_anio",
          "unidad_publicada": "lb/acre",
          "algoritmo": "peak standing crop (cosecha de agosto) | suma de incrementos | ... | no descrito",
          "n": 4,
          "dispersion": "desvío, error estándar o rango, como lo publique",
          "periodo": "años de ESTE par"
        }
      ],
      "la_curva_publicada": "forma exacta de la ecuación, coeficientes, unidad de cada uno y r². null si no publica ninguna",
      "que_cuenta": "gramíneas solas, gramíneas y hierbas, todo lo herbáceo, con o sin arbustivas bajas",
      "tratamiento": "lo que el experimento hizo a propósito",
      "disturbios_en_la_ventana": "lo que pasó sin que nadie lo planeara, dentro del período",
      "lluvia_mm": null,
      "temperatura_c": null,
      "estacionalidad": "cuándo crece, si la fuente lo reparte",
      "donde_deja_de_valer": "suelo, pendiente, altitud, régimen",
      "region_medida": "tamaño y diseño de las parcelas",
      "medido_en": "años de medición, no de publicación",
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

**`vacias` con un motivo preciso vale lo mismo que una entrada**, y el lote 10 lo
probó: cerró Nepal con un argumento correcto. Pero antes de poner algo en
`vacias` por las reglas D o F, leé de nuevo los dos casos de la sección 2: **si la
duda es si una cosecha de pico cuenta como producción, o si una coordenada de
estación experimental cuenta como coordenada, la respuesta es que sí.** Mandalo
con el método y el rótulo textuales, y la verificación la hace acequia.

---

## 6. Después de este lote

Los tres frentes que siguen, para que se vea a dónde va esto. **No los hagas
ahora**: uno por entrega.

- **`12.json` — el cultivo.** De las cuatro clases de cobertura que acequia
  considera pastoreables (bosque, arbustal, pastizal, cultivo), el cultivo no
  tiene **ni un solo sitio medido**, y es la clase que aparece en la mayoría de
  los predios que usan la app. Hace falta materia seca pastoreable de tierra de
  cultivo con el cultivo nombrado y el manejo declarado: rastrojo de maíz, sorgo,
  soja o trigo; verdeos y cultivos forrajeros anuales; pasturas implantadas.
  Trampas: el rastrojo no es producción del año, y casi todo lo publicado de
  verdeos sale de un ensayo fertilizado (regla C).
- **`13.json` — la fracción comible.** acequia tiene un solo punto: en el Delta
  Medio del Paraná la materia seca forrajera es el 59 a 74 % de la herbácea total
  medida en la misma cosecha. Hace falta más de un punto y de otros biomas, y
  **la especie animal va declarada**: bovino, ovino, caprino y equino no comen lo
  mismo del mismo potrero.
- **`14.json` — los seis biomas vacíos**, en este orden: 7 (sabana tropical, tres
  lotes sin una entrada; pistas sin explorar: sitios del IBP en India, SAFARI en
  Sudáfrica, los llanos venezolanos de San José y los trabajos de Sarmiento),
  9 (pastizal inundable), 2 (bosque tropical seco: la serie del Vindhyan en India
  está a una coordenada de parcela de montar), 1, 6 y 3. El bioma 3 ya volvió
  vacío una vez con el motivo correcto, y **decirlo y dejarlo vacío sigue siendo
  la respuesta correcta**.
