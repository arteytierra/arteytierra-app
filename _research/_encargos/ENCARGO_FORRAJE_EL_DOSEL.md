# Encargo de forraje — la fracción que sí mueve el número

Reemplaza a `ENCARGO_FORRAJE_LAS_TRES_FRACCIONES.md`, del 17/10/2026 a la
mañana. Ese encargo pedía tres fracciones; el lote 09 fue a buscar la primera y
volvió con la respuesta de que **no existe publicada**, con números para
probarlo. Este encargo parte de ahí y apunta a la segunda, que es la que decide.

---

## 1. Dónde estamos, sin adornos

acequia tiene **diez mediciones de producción herbácea en siete de los quince
biomas** de RESOLVE, todas verificadas abriendo la fuente primaria, todas con
método, unidad, estacionalidad y rango de validez escritos. Tres de las diez son
sotobosque de bosque cerrado y no pastizal abierto.

Lo que **no** tiene es la forma de llegar de ahí al número que el usuario
necesita: cuántos kilos de materia seca comible produce *su* predio por hectárea
y por año.

Hubo dos planes y los dos están cerrados, con la medición que los cerró:

**Plan 1, una tabla de forraje por bioma.** Cerrado el 17/10. En el bioma 8
conviven 3.063 kg MS/ha/año en la pradera de Dakota a cielo abierto y **60** bajo
un dosel cerrado de Pseudotsuga en Oregón. Un factor 44 adentro del mismo bioma,
que ninguna función del clima puede dar porque no es clima.

**Plan 2, bajar de la NPP total por tres fracciones** (`NPP total × fracción
aérea × fracción herbácea del piso × fracción comible`). Cerrado por el lote 09.
En Montecillo, el único sitio donde cuatro publicaciones repartieron **la misma
serie de cosechas**, la fracción aérea va de **0,342 a 0,611** —factor 1,79— y
cruza el 0,5 por el medio: dos dicen que abajo hay más y dos dicen que arriba. Y
las tres síntesis globales que uno buscaría (Mokany 2006, Jackson 1996, Poorter
2012) miden **biomasa en pie**, que no se convierte en reparto de producción.

El lote 09 dejó, además, el dato que ordena todo lo que sigue. Puesto contra lo
que la misma ficha publica año por año:

| qué varía | cuánto mueve |
|---|---|
| el año, con el mismo método | **1,40×** la NPP total |
| el algoritmo, en materia seca | **1,06×** la NPP total |
| el algoritmo, sobre el reparto arriba/abajo | **1,79×** la fracción |

**La producción total de un sitio es un dato robusto. Dónde quedó, no.** Y lo
que acequia necesita es justo dónde quedó.

---

## 2. Lo que cambia el plan: la segunda fracción está medida y mueve 236 veces

Si la primera fracción no se puede fijar, la pregunta correcta es cuál de las
tres mueve de verdad el resultado. La respuesta ya estaba en acequia, en tres
sitios montados que publican **el numerador y el denominador en la misma tabla y
en la misma unidad**:

| sitio | capa herbácea | aéreo total del sitio | herbácea/total | dosel |
|---|---|---|---|---|
| Waring's Woods, Pseudotsuga, Oregón | 6 | 1.540 g MS/m²/año | **0,0039** | cerrado, 4,9 % de cobertura herbácea |
| Cascade Head 1A, aliso rojo, Oregón | 41 | 1.630 g MS/m²/año | 0,0252 | 35,2 % de cobertura herbácea |
| Very Shallow 23-31 PZ, Edwards Plateau | 1.840 | 2.000 lb/acre/año | **0,92** | pradera con leñosas dispersas |

**De 0,0039 a 0,92: un factor 236.** Los dos sitios de Oregón están a 200 km uno
del otro, tienen el mismo clima, producen casi lo mismo de rodal —1.540 y
1.630— y su sotobosque difiere 6,5 veces. **No lo hace el clima. Lo hace la luz
que llega al piso.**

Y eso es una buena noticia, porque de las tres fracciones, la del dosel es **la
única que acequia ya mide en cada predio**: lee ESA WorldCover a 10 m y sabe qué
porcentaje es bosque, arbustal, pastizal o cultivo.

Lo que falta es la curva. Tres puntos no son una curva: son dos puntas y un sitio
en el medio.

---

## 3. Las ocho reglas

Las siete anteriores siguen en pie. La octava es nueva y sale del lote 09.

**A. Toda cifra publicada entra con su algoritmo y su unidad literal.** Cómo se
calculó la producción anual —máximo de biomasa en pie, suma de incrementos
positivos, suma de máximos por especie, cosecha por diferencia— y la unidad
**exactamente como la imprime la fuente**: `g/m²/yr`, `gC/m²/yr`, `lb/acre`,
`kg/ha`, `Mg/ha`, `%`, `fraccion_0_1`. Nunca convertir. Un `gC` que llega como
`g MS` arruina el dato por un factor ~2 sin que se note.

**B. Si la fuente publica ANPP, BNPP y TNPP, van las tres.** Y si publica más de
un algoritmo para la misma serie, van todos, uno por fila, sin promediar. Eso es
lo que permitió medir la discrepancia de Montecillo.

**C. El tratamiento de la parcela se nombra, y es distinto de los disturbios.**
Esta regla se parte en dos por lo que pasó con Montecillo. El lote 09 etiquetó
sus cuatro filas con `tratamiento: "quemado"`, y el sitio es en realidad una
**clausura sin pastoreo** donde cayó un incendio accidental adentro de la ventana
de tres años que la ficha promedia. Son dos campos:

- `tratamiento`: lo que el experimento hizo a propósito — fertilizado (con nivel
  y nutriente), clausurado, pastoreado (con carga), raleado (con intensidad),
  quemado como tratamiento, riego, control.
- `disturbios_en_la_ventana`: lo que pasó sin que nadie lo planeara y cayó
  adentro del período promediado — incendios, sequías, inundaciones, plagas.

Towoomba costó tres lotes por esto: 198 g/m²/año que parecían 2,6 veces la sabana
vecina y eran una fila fertilizada `P0N3` de un ensayo al que le habían sacado
todos los árboles. Y los 1.676 g/m²/año de Montecillo son el promedio de un año
bueno, el año del incendio y el de la recuperación.

**D. Sin coordenada publicada por la fuente, la entrada no existe.** La
coordenada va **como la imprime la publicación**, y se declara si es el punto del
sitio, el centroide de un área o la esquina de una caja. No se busca el pueblo en
un mapa. Esto ya descartó entradas buenas y seguirá descartándolas: es la única
forma de verificar el bioma del lado de acequia.

**E. Nunca se promedia un máximo con un mínimo, ni una normal con una temporada
medida.** Varias fichas del ORNL publican «mean monthly minimum 10,7 °C (enero)»
y «mean monthly maximum 29,5 °C (marzo)»: son el mes más frío y el más cálido y
**no promedian a la media anual**. Y si la fuente publica una normal de largo
plazo (415 mm, 17 °C) y además las dos temporadas que midió (354 y 797 mm), las
dos cosas van por separado y rotuladas. Mezclarlas fabrica un clima que nunca
existió.

**F. Flujo, no stock.** Producción anual, no biomasa en pie. Si la fuente publica
disponibilidad a una fecha, o el pico de la estación, o una lectura de disco de
pastura, eso **no es** producción anual y no se puede convertir sin una serie de
tasas de crecimiento. En los líquenes de Finlandia el stock llega a **50 veces**
el flujo anual. Es el error que ya descartó Serengeti, Kruger, el Pantanal, Puno
y el Delta.

**G. La advertencia de la fuente va textual.** Si el trabajo dice que su ficha es
provisional, que su método subestima, que el sitio no es representativo o que
otros autores publican otra cosa, va entre comillas y en el idioma original. La
advertencia de Montecillo —«NPP values for MNT1 reported in other published
accounts differ due to different measurement and calculation methods»— valió más
que varias de las cifras.

**H (nueva). Una fracción se arma con numerador y denominador de la misma tabla y
la misma unidad.** Si el numerador sale de una publicación y el denominador de
otra, no es una fracción: es dos estimaciones divididas entre sí, y la diferencia
de método se convierte en señal. Las tres fracciones herbáceas que acequia tiene
valen precisamente porque cada una sale de una sola tabla. Si una fuente publica
sólo una de las dos mitades, va como cifra suelta y se dice que falta la otra.

---

## 4. Los cuatro frentes, en orden

**Un frente por entrega, no los cuatro juntos.** El frente 1 primero: es el que
convierte el dato que acequia ya tiene —el porcentaje de dosel— en forraje.

### `10.json` — Frente 1: la curva de forraje contra el dosel

**Lo que hace falta: pares del MISMO sitio con dos o más niveles de dosel.** Un
sitio con 0 %, 30 % y 60 % de cobertura arbórea y su producción herbácea en cada
nivel vale más que veinte sitios sueltos, porque entre sitios el clima se mete en
el medio y no se puede separar.

Dónde buscar, en orden de probabilidad:

- **Las curvas del Servicio Forestal de EE.UU.** Hay una literatura vieja y
  abierta que publica exactamente esto, en general como producción herbácea
  contra área basal o contra cobertura de dosel en pino ponderosa, juniperus y
  encinares: Clary y Ffolliott, McConnell y Smith (1970), Pase (1958), Jameson
  (1967), y las Research Notes y General Technical Reports de las estaciones
  Rocky Mountain e Intermountain. Casi todo está en el repositorio del Forest
  Service y en Treesearch, en acceso abierto.
- **Ensayos de raleo con medición del piso.** Un raleo es el experimento ideal:
  el mismo suelo, el mismo clima, el mismo año, y dos doseles. Si la publicación
  mide la capa herbácea antes y después, o en la parcela raleada y el control, es
  un par perfecto.
- **Silvopastoril medido.** CATIE en Costa Rica, CIPAV en Colombia, INTA en el
  Chaco y en el Delta, Embrapa Florestas en Brasil. Interesa la producción de
  forraje bajo distintas densidades de árboles, con la densidad publicada.
- **Dehesa y montado.** Encinares de España y Portugal con carga ganadera y
  producción herbácea medida bajo copa y fuera de copa. Es una de las pocas
  literaturas que publica justamente «bajo copa contra entre copas».
- **Sabana africana y australiana con cobertura leñosa cuantificada.** Acá se
  cruzan dos pendientes —el bioma 7 sigue vacío— y si aparece un sitio con
  cobertura leñosa publicada y producción herbácea anual, resuelve dos cosas de
  una vez.

Lo que **no** sirve para este frente: cualquier cosa que dé cobertura de dosel
sin producción herbácea, o producción herbácea sin la cobertura de dosel de esa
misma parcela. Y las clasificaciones cualitativas —«bosque abierto», «denso»—
no son una variable: hace falta el número que la fuente midió.

Un cuidado que vale la entrega entera: **cobertura de dosel, área basal, densidad
de árboles e índice de área foliar no son intercambiables.** Decir cuál usa la
fuente, con su unidad, y no traducir entre ellas.

### `11.json` — Frente 2: el cultivo, que no tiene ni una medición

De las cuatro clases de cobertura que acequia considera pastoreables —bosque,
arbustal, pastizal, cultivo— el **cultivo no tiene ni un solo sitio medido**, y
es la clase que aparece en la mayoría de los predios que usan la app. Hasta hoy
tenía un peso inventado de 4.500 kg MS/ha/año.

Lo que hace falta es producción de materia seca **pastoreable** de tierra de
cultivo, con el cultivo nombrado y el manejo declarado:

- **Rastrojo.** Materia seca de rastrojo de maíz, sorgo, soja o trigo disponible
  para pastoreo, medida, con el rendimiento de grano del lote al lado si la
  fuente lo publica. INTA, Embrapa, INIA Uruguay, NRCS, y la literatura de
  pastoreo de rastrojos de Estados Unidos y el Cono Sur.
- **Verdeos y cultivos forrajeros anuales.** Avena, centeno, raigrás, moha,
  sorgo forrajero: kg MS/ha/año medidos, no de catálogo comercial.
- **Pasturas implantadas**, si la fuente distingue implantada de natural.

Dos trampas específicas de este frente. Una: el rastrojo **no es producción del
año**, es lo que queda después de la cosecha, así que hay que declarar si la cifra
es producción anual de biomasa aérea, residuo post-cosecha o materia seca
pastoreable estimada. Otra: casi todo lo publicado de verdeos viene de un ensayo
con fertilización, y sin el nivel de nitrógeno declarado la cifra no sirve (regla
C, la lección de Towoomba).

### `12.json` — Frente 3: la fracción comible

De todo lo que el pasto produce, cuánto come el animal. acequia tiene **un solo
punto**: en el Delta Medio del Paraná, el único sitio donde la materia seca
herbácea total y la forrajera están medidas en la misma cosecha, la forrajera es
el **59 a 74 %** de la total (6.700-8.250 contra 11.200-11.400 kg/ha), porque el
abrojo grande y las demás no forrajeras se llevan el resto de un pastizal
degradado.

Hace falta más de un punto, y de otros biomas. Dónde: las fichas de sitio
ecológico del NRCS, que publican composición por especie y a veces palatabilidad;
la literatura de condición de pastizal de INTA, Embrapa, INIA y el NRCS; los
trabajos que miden composición botánica y dieta seleccionada en el mismo
pastizal.

El cuidado de este frente es que **«comible» depende del animal**: bovino, ovino,
caprino y equino no comen lo mismo del mismo potrero, y un caprino come
arbustivas que un bovino no toca. La especie animal va declarada o la cifra no
entra. Y la proteína bruta, si la fuente la publica, va también: en Lesbos la
materia seca cosechada tiene 5,4 a 7,3 % de proteína, que el propio trabajo
compara con la paja de cereal. Esos kilos existen y no son alimento.

### `13.json` — Frente 4: los seis biomas vacíos, en orden

Siguen en cero los biomas 1, 2, 3, 6, 7 y 9. El orden es por valor:

1. **Bioma 7, sabana tropical.** Es donde cae la mayoría de los predios
   ganaderos del mundo y lleva **tres lotes dedicados sin una sola entrada**. Lo
   que falló cada vez: Serengeti publica biomasa en pie con disco de pastura;
   Kruger publica el mayor cuadrante cosechado de 50 × 50 cm en un trabajo sobre
   LiDAR; el Pantanal publica disponibilidad por fecha; Towoomba era un ensayo de
   fertilización sin árboles; Nylsvley no tiene coordenada de punto. Pistas sin
   explorar: los sitios del IBP en la India (Varanasi, Ujjain, Kurukshetra), el
   programa SAFARI en Sudáfrica, y los llanos venezolanos —San José de los Llanos
   y los trabajos de Sarmiento—, que publican producción primaria con método.
2. **Bioma 9, pastizal inundable.** Dos lotes, ninguna entrada, por el mismo
   motivo: todo lo publicado es disponibilidad a una fecha.
3. **Bioma 2, bosque tropical seco.** Es el reintento más barato de todos: la
   serie del Vindhyan en la India tiene producción herbácea publicada con método
   y lo único que falta es **la coordenada de punto de sus parcelas**. Si aparece
   en el trabajo original o en una publicación posterior del mismo grupo, monta.
4. **Bioma 1, bosque tropical húmedo.** Lamto en Costa de Marfil tiene serie
   larga, pero su régimen de fuego anual hay que declararlo.
5. **Bioma 6, bosque boreal.** Ahti (1977) sobre pastizales de liquen, si publica
   crecimiento anual con sitio y coordenada. Ojo con la regla F acá, que es donde
   el stock llega a 50 veces el flujo.
6. **Bioma 3, coníferas tropicales.** Ya volvió vacío una vez con el motivo
   correcto: no hay fuente primaria abierta con flujo anual de sotobosque en
   pinares de *Pinus caribaea*. **Decirlo y dejarlo vacío sigue siendo la
   respuesta correcta.**

### Un pedido chico que va en cualquiera de las cuatro entregas

**La coordenada publicada de Gautam & Mandal 2016** («Effect of disturbance on
biomass, production and carbon dynamics in moist tropical forest of eastern
Nepal», *Forest Ecosystems*, https://doi.org/10.1186/s40663-016-0070-y). Esa
medición —1,3 a 1,7 Mg/ha/año de NPP herbácea de un bosque húmedo tropical con
1.998,6 mm— está citada en acequia desde el primer lote y **no se puede montar
porque le falta la coordenada de sus parcelas en Sunsari**. Es un campo. Y
desbloquea algo concreto: hoy la banda de forraje de la clase «bosque» va de 60 a
940 kg MS/ha/año, y esa medición la llevaría a 1.700. Mientras no esté, el techo
de esa banda está sesgado bajo y acequia lo declara.

---

## 5. La forma del JSON

Un archivo por entrega, `NN.json`, con el número del lote. Para el frente 1 la
forma cambia respecto de los lotes anteriores, porque lo que importa son los
pares:

```json
{
  "encargo": "forraje",
  "lote": 10,
  "fecha": "2026-10-__",
  "entradas": [
    {
      "id": "dosel_forraje_01",
      "sitio": "nombre del sitio como lo llama la fuente",
      "coordenada_de_la_fuente": "lat, lng como la imprime la publicación, y si es punto, centroide o esquina de caja",
      "es_el_sitio_publicado": true,
      "bioma_verificado": null,
      "clase_wc_del_sitio": "qué vería un satélite: bosque / arbustal / pastizal / cultivo",
      "tipo_de_dosel": "especie dominante, edad y estructura si la publica",
      "variable_del_dosel": "cobertura_de_dosel_pct | area_basal_m2_ha | densidad_arboles_ha | indice_de_area_foliar",
      "pares": [
        {
          "dosel": 0,
          "forraje": 1200,
          "unidad": "lb_acre_anio",
          "unidad_publicada": "lb/acre",
          "algoritmo": "cómo calculó la producción anual, o 'no descrito'",
          "n": 4,
          "dispersion": "desvío, error estándar o rango, como lo publica",
          "periodo": "años de ESTE par"
        }
      ],
      "la_curva_publicada": "si la fuente publica una ecuación: su forma exacta, los coeficientes, la unidad de cada uno y el r². Si no publica ninguna, null",
      "que_cuenta": "qué incluye el numerador: gramíneas solas, gramíneas y hierbas, todo lo herbáceo, con o sin arbustivas bajas",
      "tratamiento": "lo que el experimento hizo a propósito",
      "disturbios_en_la_ventana": "lo que pasó sin que nadie lo planeara, dentro del período",
      "lluvia_mm": null,
      "temperatura_c": null,
      "estacionalidad": "cuándo crece, si la fuente lo reparte",
      "donde_deja_de_valer": "suelo, pendiente, altitud, régimen, lo que la fuente limite",
      "region_medida": "tamaño y diseño de las parcelas",
      "medido_en": "años de medición, no de publicación",
      "advertencia_de_la_fuente": "textual y entre comillas, en su idioma",
      "fuentes": [{ "label": "cita completa", "url": "enlace al PDF o al DOI" }],
      "verificacion": "en qué página, tabla o figura está cada cifra",
      "nota": "lo que no cabe en ningún campo"
    }
  ],
  "vacias": [
    { "id": "lo_que_se_buscó", "motivo": "qué se buscó, dónde, y por qué no entra" }
  ]
}
```

Para los frentes 2, 3 y 4 vale la forma de los lotes anteriores: `cifras` con
`componente`, `valor`, `unidad`, `unidad_publicada`, `fuente_idx`, `metodo`,
`tratamiento`, `n_sitios`, `dispersion` y `periodo`.

### Lo que hace valiosa una entrega

Las entregas más útiles de este encargo no fueron las que trajeron más cifras.
Fueron tres:

- la que trajo **seis algoritmos sobre las mismas cosechas** (Rawlik y
  Jagodziński en un robledal polaco), porque midió el error del método en vez de
  sumar un punto;
- la que trajo **la tabla de cuatro fuentes para la misma serie** (la ficha de
  Montecillo), porque mostró que el desacuerdo está en el reparto y no en el
  total;
- y la que volvió **vacía con el motivo bien argumentado** (el lote 09), porque
  cerró un camino y evitó construir una cadena de tres fracciones sobre una
  fracción que no existe.

**`vacias` con un motivo preciso vale lo mismo que una entrada.** Lo que no sirve
es una cifra sin unidad literal, sin coordenada publicada, o que mida lo que está
parado.
