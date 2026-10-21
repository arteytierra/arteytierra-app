# Encargo de forraje — lote 20

**Un solo lote esta vez, y es a propósito.** Los lotes 17, 18 y 19 fueron en un
documento y volvieron 1 de 3: el 18 trajo el mejor material desde el lote 11, y
el 17 y el 19 volvieron vacíos. La diferencia no fue la dificultad de la
pregunta: fue que **el 18 tenía una ruta nombrada y los otros dos tenían un tema**.
Así que este encargo nombra las rutas, incluso las URLs, y pide menos.

Fecha: 21/10/2026. Entregá **un solo archivo**, `20.json`.

---

## 1. Qué es esto

Estoy reemplazando una función de mi app que calcula producción de forraje a
partir de la lluvia anual y **no tiene ninguna fuente**. Es una escalera de cinco
escalones:

```
< 300 mm → 700 kg MS/ha/año · < 500 → 1.500 · < 700 → 3.000
< 900 → 5.000 · ≥ 900 → 7.000
```

Ese número multiplica todo lo que viene después en la app: la oferta de pasto, la
carga animal, el tamaño del rodeo y el agua que hay que almacenar para esa
hacienda. Alguien excava una represa con eso.

Llevo diecinueve lotes juntando mediciones publicadas para reemplazarla. Van 22
sitios montados. **No necesito más sitios con un número de kg/ha**: necesito las
tres cosas que el lote 18 mostró que faltan, y están abajo en orden de
importancia.

---

## 2. Lo que encontró el lote 18, porque cambia el objetivo

Trajiste Patton, Dong, Nyren y Nyren (2007), *Rangeland Ecology & Management*
60(6):656-665: diecisiete años, cinco intensidades de pastoreo, dos sitios
ecológicos del mismo campo en Dakota del Norte, con la carga en AUM/ha y la lluvia
y la temperatura del suelo como covariables. Está montado entero.

Lo que salió de ahí, y por qué manda el lote 20:

### a. La pendiente contra la lluvia es una función del manejo

En las lomadas, al inicio de la temporada: el no pastoreado sube **46,31 kg/ha por
cm** de lluvia del año agrícola, el liviano **32,48**, y el moderado, el fuerte y
el extremo **no se distinguen de cero**. En los bajos del mismo campo, al final de
la temporada, pasa lo contrario: el no pastoreado **no responde** y los cuatro
pastoreados suben 46,85.

O sea que «cuánto sube la producción por milímetro» no tiene una respuesta en ese
sitio: tiene cinco por sitio ecológico y por momento, dos de ellas cero, y quién
responde a la lluvia se da vuelta entre una loma y un bajo.

### b. Y la ventana sobre la que se suma la lluvia cambia la pendiente 2 a 3 veces

Esto es lo que más me sirve y lo descubrí de rebote. Ese trabajo **no usa lluvia
anual**: usa `P2E`, que es la lluvia sumada **desde el fin de la temporada de
crecimiento del año ANTERIOR hasta el fin de la temporada de pastoreo del año en
curso**. Con esa ventana, la pendiente del total en las lomadas es 28,63 kg/ha por
cm, o sea 0,286 g/m² por mm.

Comparado con lo que tengo:

| de dónde sale | pendiente, g/m² por mm | qué compara |
|---|---|---|
| Lauenroth y Sala (1992), entre sitios | 0,60 | sitios distintos, cada uno acomodado a su lluvia |
| **Patton et al. (2007), año agrícola** | **0,286** | el mismo sitio, años distintos |
| Oesterheld et al. (2001), equilibrio | 0,22 | el mismo sitio, lluvia sostenida |
| Oesterheld et al. (2001), un año | 0,13 | el mismo sitio, la respuesta de un año |
| Jobbágy y Sala (2000), gramíneas, lluvia anual | 0,024 (no significativa) | el mismo sitio, años distintos |

**La pregunta que esto abre es la que quiero que contestes:** ¿cuánto de esa
dispersión es la ventana sobre la que se suma la lluvia, y no el sitio ni el
método? Porque mi app tiene lluvia **diaria** de tres fuentes: puede sumar
cualquier ventana. Si la ventana correcta duplica el r², es la mejora más barata y
más grande que me queda por hacer, y no necesito ningún dato nuevo para
implementarla: necesito saber cuál es.

### c. Un píxel de satélite no distingue una loma de un bajo, y los dos estaban medidos

Las parcelas silty y overflow de ese ensayo están intercaladas adentro de los
mismos doce potreros: **la misma coordenada, la misma clase de cobertura y la
misma estabilidad del píxel** —91 %, 85 % y 85 % de pastizal en tres ventanas de
500 m, 2 km y 5 km— y producen 2.501-3.410 contra 3.087-4.362 kg/ha. Un factor 1,3
que un satélite de 10 m no puede ver, y además **responden al manejo con el signo
al revés**.

Lo que los separa es a dónde va el agua de escurrimiento. **Y eso mi app sí lo
calcula**, con el modelo de elevación. Así que ahí hay una mejora disponible que
no depende de más clases de cobertura.

### d. Por qué el 17 y el 19 volvieron vacíos, y qué hago distinto

El 17 pedía «tres o cuatro sitios con la capa herbácea medida aparte» y el 19
pedía cinco biomas, una clase de cobertura y cuatro atrasos. Los dos eran temas.
El 18 pedía pares de manejo **y vos encontraste un journal concreto**.

Entonces: de acá en adelante nombro rutas. Si una ruta que nombro no da nada,
decilo en `vacias` con el nombre de la ruta, que eso también es información
—quiere decir que no vuelva a pedirla—.

### e. Lo del lote 17, que resolví y te cuento porque cambia una regla

Marcaste que la ficha del ORNL DAAC de Río Mayo lista los campos del archivo anual
como `ANPP_shrub` antes que `ANPP_grass`, al revés de la Tabla 2 del artículo, y
te negaste a presentar el reajuste como verificado. **Eso estuvo bien hecho y el
dato era correcto.** La discrepancia se resolvió en contra del orden invertido,
por dos evidencias:

1. La misma ficha, en su sección de revisiones, publica los valores **debajo de
   los nombres de columna**, y dice que los corrigió «to agree with the values
   reported on page 544». Para 1983 pone 10,8 en `ANPP_shrub` y 10,6 en
   `ANPP_grass`.
2. Sólo esa asignación reproduce las tres regresiones publicadas: 24,582 +
   0,02405·P con r² 0,0146 para gramíneas, 10,042 + 0,12484·P con r² 0,7278 para
   arbustos, 34,432 + 0,14122·P con r² 0,3459 para el total.

Y tu propio ajuste de la versión invertida delata el mecanismo: 24,361 +
0,0165·P es **la regresión de las gramíneas calculada sobre diez años en vez de
quince**. La inversión manda la columna de gramíneas a la casilla de la leñosa.

**La regla que sale de esto:** cuando el orden de dos columnas está en duda, **la
regresión publicada es el árbitro**. No hace falta otra fuente.

---

# FRENTE A — la ventana de la lluvia (el más importante, por lejos)

## A.1 Qué busco, exactamente

Mediciones de producción de pastizal donde la fuente **ajuste la producción contra
más de una ventana de lluvia** y publique el r² de cada una. O, si no las compara,
que **declare con precisión cuál ventana usó**.

Lo que me sirve, en orden:

1. **El mismo trabajo compara dos o más ventanas.** Por ejemplo: lluvia del año
   calendario contra lluvia del año hidrológico contra lluvia de la estación de
   crecimiento contra lluvia de los últimos doce meses previos a la cosecha. Con
   el r² de cada una. **Esto es el premio mayor de este encargo.**
2. **El trabajo usa una ventana no obvia y la define.** Como `P2E`. Entonces
   quiero la definición textual y los coeficientes.
3. **El trabajo separa la lluvia en tramos**: la del otoño-invierno previo contra
   la de la primavera-verano, o la que cae antes del inicio del crecimiento contra
   la que cae durante. Con coeficientes separados.
4. **El trabajo usa el tamaño o el número de eventos** en vez del total. Ya tengo
   uno así (Swemmer 2007: los eventos de 15 a 30 mm explican el 33 % solos, contra
   el 46 % del total de la estación) y quiero más.

## A.2 Dónde mirar, con nombre

- **La colección «NPP Grassland» del ORNL DAAC.** Son fichas con una estructura
  fija, abiertas, y ya me dieron dos sitios (Río Mayo y el CPER). Viven en
  `https://daac.ornl.gov/NPP/guides/NPP_<CODIGO>.html` —la de Río Mayo es
  `NPP_RMY`— y cada una trae **un archivo climático mensual al lado del archivo de
  producción**, que es exactamente lo que hace falta para hablar de ventanas.
  Enumerá la colección entera desde el buscador del DAAC y decime qué sitios hay.
  Si una ficha trae producción anual **y** lluvia mensual del mismo sitio, es un
  sitio donde la ventana se puede estudiar.
- **El portal EDI de los LTER.** La ruta de descarga directa de un paquete es
  `https://pasta.lternet.edu/package/data/eml/<scope>/<id>/<rev>/<entidad>`, y el
  listado de entidades es
  `https://pasta.lternet.edu/package/data/eml/<scope>/<id>/<rev>`. Los scopes que
  me interesan: `knb-lter-knz` (Konza, pradera de pasto alto), `knb-lter-sgs`
  (Shortgrass Steppe), `knb-lter-jrn` (Jornada), `knb-lter-sev` (Sevilleta).
  **El lote 19 llegó al catálogo y no a los datos**: esta vez usá la ruta del
  paquete.
- **Rangeland Ecology & Management y su antecesor Journal of Range Management**,
  que están abiertos en el repositorio de la Universidad de Arizona. El PDF da 403
  a una descarga directa, así que **leé la página del ítem en el navegador**; el
  repositorio además publica el texto extraído como archivo aparte, que es mejor
  para buscar. Ahí salió el lote 18.
- *Journal of Arid Environments*, *Rangeland Journal* (Australia), *African
  Journal of Range and Forage Science*, *Agricultural and Forest Meteorology*.

## A.3 La trampa de este frente

Una ventana de lluvia **no es «anual»**. «Lluvia anual» puede ser: el año
calendario, el año hidrológico, los doce meses previos a la cosecha, el año
agrícola de la región, o la normal de largo plazo. Las cinco cosas dan números
distintos para el mismo año y el mismo sitio. **Si la fuente no dice desde cuándo
hasta cuándo sumó, el campo `ventana_de_la_lluvia` va con `desde: null` y
`hasta: null` y una nota diciendo que la fuente no lo dice.** No lo adivines y no
lo completes con «enero a diciembre» porque sea lo más probable.

Y la segunda: **la ventana de la lluvia y la ventana de la producción no son la
misma cosa.** Una cosecha de enero mide lo que creció el verano anterior. Las dos
van declaradas aparte.

---

# FRENTE B — la posición en el relieve, con producción medida

## B.1 Qué busco

Mediciones de producción donde el **mismo sitio, el mismo año y el mismo método**
cubran más de una posición topográfica. Lo que separa una loma de un bajo es el
agua que le llega o se le va, y mi app calcula eso con el modelo de elevación: si
tengo el factor medido, lo puedo aplicar.

Las posiciones que me interesan, con el vocabulario de la bibliografía de
pastizales:

- **loma / upland / divide**: pierde agua por escurrimiento.
- **ladera / sideslope / backslope**: con pendiente y su porcentaje si lo publica.
- **bajo con aporte / overflow / run-on / swale / footslope**: recibe el
  escurrimiento de arriba. **Éste es el que más me falta.**
- **plano / level / terrace**: ni aporta ni recibe.
- **bajo inundable / lowland / playa / depression**: con agua estancada parte del
  año, que es otra cosa.

## B.2 Lo que tiene que traer cada entrada

Lo de siempre más:

- `posicion_topografica`: la clase, **con la palabra textual que usa la fuente** y
  con la evidencia de por qué es esa clase (una frase de la fuente, no tu
  interpretación).
- `pendiente_pct` si la publica.
- `aporte_de_agua`: `recibe`, `pierde`, `ninguno` o `no_dice`, con la frase.
- Si hay más de una posición en la misma tabla, **van todas** (regla U), y tienen
  que compartir año, método y lluvia para que el cociente signifique algo.

## B.3 Dónde mirar

Las fichas de **sitio ecológico del NRCS** son el candidato obvio y ya me dieron
dos entradas, pero tienen un problema: publican producción por comunidad de
referencia y **no por posición topográfica medida**, y sus nombres de sitio
mezclan suelo con posición. Sirven si publican la tabla de producción de dos
sitios ecológicos que se diferencian **sólo** por el aporte de agua, con la frase
que lo dice. El catálogo abierto está en `https://edit.jornada.nmsu.edu/` y la
correlación de un punto con su sitio ecológico se puede consultar.

Y el otro candidato son los trabajos de **catena** o **toposequence** en
pastizales: buscá «catena», «toposequence», «topographic position», «run-on» con
«production» o «biomass» y «grassland» o «rangeland».

---

# FRENTE C — la capa herbácea medida aparte de la leñosa (tercer intento)

## C.1 Por qué insisto

Es la pregunta más importante que tengo abierta y la pedí dos veces sin resultado.
El motivo de la insistencia, con los números: en el único sitio del archivo donde
la capa herbácea está medida aparte todos los años, la lluvia anual explica el
**1,5 %** de la variación del forraje y el **73 %** de la de la leñosa. La
correlación del total —la que se vería si no se separaran las capas— sale entera
de los arbustos, que es la parte que un bovino no come.

**Con un solo sitio eso no se puede decidir.** Con tres o cuatro, sí.

## C.2 Qué califica, y es más angosto de lo que parece

Hace falta, en el mismo trabajo y el mismo sitio:

1. Producción **herbácea** de un año, con su método.
2. Producción **leñosa** del mismo año, con su método, que **va a ser otro
   método** —casi siempre dimensiones y densidad, no corte—.
3. La lluvia de ese mismo año, del mismo sitio.
4. Tres años o más, para que se pueda ajustar algo.

**La trampa, que ya expliqué dos veces y la repito porque es la que hace fracasar
este frente:** hay dos maneras de separar capas y sólo una sirve.

- **Sirve:** el trabajo mide las dos capas **en el mismo lugar**, y las publica
  por separado. Río Mayo, Patton.
- **No sirve:** el trabajo mide una capa en parcelas con leñosas y otra en
  parcelas sin leñosas, o mide el sotobosque de un bosque contra un pastizal
  vecino. Eso compara dos sitios y no dos capas, y ya tengo cuatro así.

## C.3 Las rutas nombradas

1. **La colección «NPP Grassland» del ORNL DAAC otra vez**, y acá es donde más
   espero. La ficha de Río Mayo separa `ANPP_shrub` de `ANPP_grass` en el mismo
   archivo: **si la colección tiene otras fichas con esa misma estructura de
   columnas, son exactamente lo que busco.** Enumerá la colección y mirá la tabla
   de columnas de cada ficha. Esto es un trabajo de catálogo, no de búsqueda, y
   por eso lo pongo primero.
2. **Jornada (`knb-lter-jrn`) y Sevilleta (`knb-lter-sev`)** por la ruta del
   paquete de EDI, no por el catálogo. Son los dos LTER de arbustal-pastizal de
   Estados Unidos y los dos miden grupos funcionales.
3. **La bibliografía de la estepa patagónica y del monte argentino**: Golluscio,
   Paruelo, Jobbágy, Bertiller, Aguiar, Cabido. Varios de esos trabajos miden
   gramíneas y arbustos aparte en el mismo sitio, y varios están en repositorios
   abiertos argentinos (CONICET Digital, SEDICI, el repositorio de la FAUBA).
   **Ojo con el sitio de publicaciones de la FAUBA**: migró y las URLs viejas dan
   404 de verdad; están en el Internet Archive.
4. Sabana africana con capas separadas: Nylsvley, Kruger, Serengeti.

---

## 3. Los atrasos, y cómo los pido esta vez

El lote 19 los rechazó todos. Tres de esos rechazos me sirvieron —el CPER,
Calabozo y Ukulinga quedan como están— y los cierro: **no vuelvas sobre esos
tres.**

De los demás, dos valen un intento más y sólo si sobra tiempo:

- **Konza, `knb-lter-knz`, paquete 55 revisión 18.** Llegaste al catálogo. Esta
  vez: `https://pasta.lternet.edu/package/data/eml/knb-lter-knz/55/18` lista las
  entidades, y cada entidad se baja con esa misma ruta más el identificador. Es
  producción de pradera de pasto alto con tratamientos de fuego y pastoreo,
  1984-2008.
- **Los 14 pares de Lesbos**, en el material suplementario de MDPI. Si el
  suplemento no se puede abrir, decilo y lo cierro.

Lo demás de la lista vieja queda cerrado: no pidas más los biomas 1, 2, 3, 6 y 9
como tema, ni el arbustal de clase 20, ni los dos trabajos de Arizona, ni el
rastrojo. Si aparecen de rebote mientras hacés A, B o C, bienvenidos; como objetivo
no van más.

---

## 4. Las trampas de estos frentes

**No digitalices gráficos.** Si el número está sólo en una figura, no va. Esto ya
lo venís respetando y es la razón por la que confío en el resto.

**Una media de largo plazo no es un año medido.** Si la fuente publica «media de
29 temporadas», eso es `normal_publicada` y no `rango_de_anios`. El campo
`rango_de_anios` significa el mínimo y el máximo **del mismo punto en años
distintos**.

**Las medias ajustadas por covarianza no son medias de los datos.** El lote 18
las trajo y hay que declararlo: una media ajustada por ANCOVA está evaluada **en
el valor medio de la covariable**, así que no es el promedio de las observaciones
y no se puede recalcular desde las filas. Si la tabla dice «adjusted for the
effects of X», va en `metodo_de_integracion` y en `que_cuenta`.

**Los grupos pueden no sumar al total, y la fuente a veces lo avisa.** Textual del
lote 18: «Because grass, forb, shrub, and total are each adjusted separately for
the effects of P2E and/or P2E and T2E, grass, forb, and shrub production does not
sum to total production». Si pasa eso, no «arregles» ninguna fila para que cierre.

**Los encabezados de dos niveles corren las columnas.** Es el error que tuvo el
lote 18 y la nueva regla X sale de ahí: ver abajo.

---

## 5. Las veinticinco reglas

Las veintidós de siempre, con tres nuevas al final que salen de los lotes 17 y 18.

**A. Toda cifra entra con su algoritmo y su unidad literal.** Las conversiones las
hago yo. Copiá la unidad como la escribe la fuente, con sus símbolos.

**B. Si la fuente publica las partes, van todas**, y si publica más de un método o
más de una estimación del mismo sitio, van todas con su nombre.

**C. El tratamiento se nombra, y es distinto de un disturbio.** Fertilización,
riego, siembra, corte: tratamiento. Fuego, sequía, plaga, desmonte previo:
disturbio. Van en campos distintos.

**D. Coordenada publicada, declarando qué clase de coordenada es.** Estación
experimental, centroide de área, punto de parcela, localidad.

**E. Nunca se promedia un máximo con un mínimo, ni una normal con una temporada
medida.** Si la fuente publica dos, van las dos.

**F. Flujo, no stock** — y si es stock, se declara y se dice en qué momento.

**G. La advertencia de la fuente va textual**, entre comillas y en su idioma.

**H. Una fracción se arma con numerador y denominador de la misma tabla y la misma
unidad.** Si hay que buscar el denominador en otro lado, no es una fracción: son
dos cifras.

**I. Un área publicada no es una coordenada hasta que da un solo bioma.**

**J. El tratamiento es de la PARCELA, no de la estación.** Ante el silencio de la
fuente, `desconocido`. Nunca `secano` por omisión.

**K. Toda cifra declara si es stock o flujo**, con el momento si es stock, y **con
el método de integración si es un flujo**: suma de incrementos, pico único,
diferencias positivas, con el nombre que la fuente le dé.

**L. Una fracción comible declara cómo se atribuyó lo comible.**

**M. Todas las coordenadas que publique la fuente, y toda frase sobre dónde está
el sitio.** Ninguna se descarta por parecer peor.

**N. La clase de cobertura se declara con porcentajes, no con un nombre**, y el
porcentaje va con su **método y su año de medición**. Sin método no sirve.

**O. Una serie de años se entrega año por año.** Una fila por año, con su lluvia,
su producción, su método y su n si varía.

**P. Si la fuente ajustó una ecuación, va con todo —ordenada, pendiente, r², n,
grados de libertad, unidades de los dos ejes— y VOS LA VERIFICÁS** re-ajustando tu
propia transcripción por cuadrados mínimos, reportando el resultado en
`verificacion_por_ajuste`.

**Q. Si la fuente publica la misma magnitud en dos bases**, van las dos, más la
conversión con su r² y su n, porque puede no ser un factor.

**R. Toda cifra climática declara qué clase de número es**: `anio_medido`,
`rango_de_anios` (el mismo punto, años distintos), `rango_de_sitios`,
`normal_publicada` (una media de largo plazo) o `agua_de_riego`.

**S. Si la fuente publica capas o grupos separados, el ORDEN de las columnas se
verifica**, contra el encabezado textual **y** contra una segunda evidencia, y se
reporta en `verificacion`.

**T. Antes de declarar imposible una verificación, probá derivar.** Si falta una
variable, fijate si otra ecuación publicada por la misma fuente la deriva.

**U. Si una tabla tiene varios sitios o tratamientos comparables, van todos.**

**V. Una coordenada se contrasta contra la frase que nombra el lugar.** Si no
coinciden, van las dos con la discrepancia declarada, y no se corrige ninguna.

**W. Toda cifra de producción declara la VENTANA sobre la que se sumó su lluvia —y
es nueva.** Desde cuándo hasta cuándo, con las palabras de la fuente. «Anual» no
es una ventana: puede ser el año calendario, el hidrológico, los doce meses
previos a la cosecha o el año agrícola de la región, y los cuatro dan números
distintos para el mismo año. **Si la fuente no lo dice, el campo va en `null` con
la nota.** Nunca completado con lo más probable.

**X. En una tabla con encabezado de dos niveles, el número de columnas de
producción se verifica contra el pie —y es nueva.** La fila de errores estándar
agrupados, o de n, o de lo que la tabla publique por columna, **cuenta las
columnas de producción**: si tu lectura produce más columnas que valores en el
pie, se corrió un lugar. Es la verificación que atrapó el error del lote 18 y se
hace con la tabla a la vista, sin abrir nada más.

**Y. Una ecuación publicada vale más que una coordenada —y es nueva.** Si tenés
que elegir qué entregar, elegí la medición que trae **ecuación, pendiente y r²**
por encima de la que trae una coordenada linda. Lo aprendí con el lote 18: de esas
dos entradas, lo que terminó cambiando mi código no fueron los kg/ha —que
quedaron afuera de mi banda por otra regla— sino las pendientes y los umbrales.
**Una ecuación viaja a donde un píxel no llega.**

---

## 6. Lo que no quiero

- **Modelos globales.** Miami, Thornthwaite, MODIS NPP, teledetección. Ya tengo el
  Miami Model montado como contraste y lee 1,75 veces bajo. Quiero **mediciones de
  campo**.
- **Revisiones que citan a otros.** Quiero el trabajo que midió. Si una revisión me
  lleva al original, decime el original.
- **Números sin método.** Un kg/ha sin saber si es pico, suma de incrementos o
  stock no sirve para nada en esta cadena.
- **Rellenar huecos.** Si un campo no está en la fuente, va `null` y una nota. Un
  `null` honesto me sirve más que un número plausible: toda esta cadena existe
  porque la app ya tiene un número plausible y equivocado.
- **Promedios de cosas distintas.** Dos sitios, dos métodos, dos años: no se
  promedian.

---

## 7. Lo que ya está montado, para no repetirlo

22 sitios. Los que importan para no duplicar:

| sitio | lo que tiene |
|---|---|
| Loamy Upland, MLRA 53B, Dakota | ficha NRCS, 2.643-3.063 kg/ha, 381-508 mm |
| **CGREC, Streeter, Dakota (silty y overflow)** | **el lote 18, entero** |
| Very Shallow 23-31 PZ, Edwards Plateau, Texas | ficha NRCS |
| Chuquibambilla y La Raya, Puno | altiplano, 626-1.958 |
| Agra, Lesbos | 14 potreros, 2 años de lluvia muy distinta |
| Cuatro pajonales de Eriophorum, Alaska y Yukón | tundra |
| Albardón, Delta del Paraná | total y forrajera de la misma cosecha |
| Montecillo, Texcoco | pastizal salino, fracción aérea |
| Różańsko, Polonia + 3 de Oregón + 2 de Manitou | sotobosque, con curva de dosel |
| Avena, Marcos Juárez + alfalfa, Curacó | cultivos, fertilizado y regado |
| Calabozo, Venezuela | sabana de Trachypogon |
| **Río Mayo, Chubut** | **15 años, capas separadas, `SERIE_RIO_MAYO`** |
| **CPER, Colorado** | **50 años, `SERIE_CPER`, con modelo de memoria** |
| Bloemfontein, Towoomba y Ukulinga | 29, 27 y 30 temporadas, con pares de manejo |

---

## 8. La forma del JSON

Un solo archivo, `20.json`. Mismo esqueleto que el 18, con los campos nuevos de
los frentes A y B marcados con ← NUEVO.

```json
{
  "encargo": "forraje",
  "lote": 20,
  "fecha": "2026-10-__",
  "frente": "A | B | C",
  "entradas": [
    {
      "id": "slug_corto",
      "sitio": "nombre del sitio como lo llama la fuente",
      "coordenada_de_la_fuente": "textual, con hemisferio",
      "coordenadas_todas": [
        { "valor": "", "que_dice_que_es": "", "precision": "" }
      ],
      "ubicacion_en_palabras": "toda frase de la fuente sobre dónde está",
      "coordenada_contra_palabras": "coinciden | la discrepancia, descrita | null",
      "clase_de_coordenada": "estacion_experimental | punto_de_parcela | centroide_de_area | localidad",
      "superficie_declarada": null,
      "es_el_sitio_publicado": true,

      "posicion_topografica": {
        "clase": "loma | ladera | bajo_con_aporte | plano | bajo_inundable | no_dice",
        "palabra_de_la_fuente": "upland / overflow / footslope / …",
        "evidencia": "la frase de la fuente, textual",
        "pendiente_pct": null,
        "aporte_de_agua": "recibe | pierde | ninguno | no_dice"
      },

      "clase_wc_del_sitio": "descripción de la vegetación",
      "cobertura_lenosa_pct": { "valor": null, "metodo": null, "anio": null, "basal_o_copa": null },
      "cobertura_herbacea_pct": { "valor": null, "metodo": null, "anio": null, "basal_o_copa": null },
      "desmonte_o_raleo": null,
      "insumos": "secano | fertilizado | riego | riego_y_fertilizado | desconocido",
      "insumos_de_la_parcela": "qué dice la fuente de LA PARCELA; si no dice, 'no dice'",

      "ventana_de_la_lluvia": {
        "nombre_de_la_fuente": "P2E / crop-year / growing season / … , textual",
        "desde": "fin de la temporada de crecimiento del año anterior | 1 de enero | null",
        "hasta": "fin de la temporada de pastoreo | 31 de diciembre | null",
        "definicion_textual": "la frase de la fuente que la define",
        "unidad": "mm | cm"
      },

      "ajustes_por_ventana": [
        {
          "ventana": "cómo la llama la fuente",
          "variable_y": "qué produce: gramíneas, total, …",
          "ordenada": null, "pendiente": null, "r2": null, "n": null, "gl": null,
          "unidad_x": "cm", "unidad_y": "kg/ha",
          "significativa": true,
          "p": null
        }
      ],

      "serie_por_anio": [
        {
          "anio": "1989",
          "lluvia_mm_del_anio": null,
          "que_es_la_lluvia": "anio_medido | rango_de_anios | normal_publicada | rango_de_sitios | agua_de_riego",
          "ventana": "la misma etiqueta que arriba",
          "herbacea": null, "lenosa": null, "total": null,
          "unidad": "g/m²/yr",
          "base_de_la_masa": "estufa_seco | aire_seco | no_dice",
          "metodo_de_integracion": "pico único | suma de incrementos | diferencias positivas | media ajustada por ANCOVA",
          "stock_o_flujo": "flujo",
          "atribuido_a": "quién midió ese año, si la fuente lo dice",
          "n_de_este_anio": null,
          "dispersion": null
        }
      ],

      "orden_de_columnas": "el orden REAL de la tabla, contando las columnas de umbral o de letras si las hay",
      "errores_estandar_de_la_tabla": {
        "fila_del_pie": "los valores del pie, en orden",
        "cuantas_columnas_de_produccion": 0,
        "coinciden": true
      },

      "manejo_comparado": {
        "control": { "valor": null, "carga": null, "unidad_de_la_carga": null },
        "tratado": { "valor": null, "carga": null, "unidad_de_la_carga": null },
        "que_cambia": null,
        "definido_por": "carga fija | forraje remanente | días de ocupación | otro",
        "anios": null,
        "cambios_colaterales": null
      },

      "ecuacion_de_la_fuente": {
        "formula": null, "ordenada": null, "pendiente": null,
        "r2": null, "n": null, "gl": null, "unidad_x": null, "unidad_y": null
      },
      "verificacion_por_ajuste": "tu reajuste por cuadrados mínimos contra lo publicado",
      "conversion_entre_bases": null,

      "lluvia_normal_mm": { "valor": null, "anios_de_la_serie": null, "sd": null },
      "temperatura_c": { "valor": null, "que_es": "media anual | media del mes más frío | suma de grados-día | …" },

      "cifras": [
        {
          "componente": "npp_herbacea | npp_lenosa | ms_herbacea_total | …",
          "valor": null, "unidad": "kg/ha", "unidad_publicada": "kg ha−1",
          "base_de_la_masa": "estufa_seco",
          "stock_o_flujo": "flujo", "momento_del_stock": null,
          "metodo_de_integracion": "",
          "capa_que_mide": "grass | forb | shrub | total",
          "de_la_misma_tabla_que": "",
          "metodo": "",
          "ya_descuenta_uso_admisible": false,
          "tratamiento": null,
          "n_sitios": 1, "dispersion": null, "periodo": ""
        }
      ],

      "que_cuenta": "qué incluye y qué no",
      "disturbios_en_la_ventana": "",
      "estacionalidad": "",
      "donde_deja_de_valer": "",
      "medido_en": "",
      "advertencia_de_la_fuente": "textual, entre comillas, en su idioma",
      "fuentes": [{ "label": "", "url": "" }],
      "verificacion": "qué páginas, tablas y figuras abriste",
      "nota": ""
    }
  ],
  "vacias": [
    { "id": "", "ruta_que_probe": "la ruta nombrada en este encargo que no dio nada", "motivo": "" }
  ]
}
```

**Lo más importante del JSON, por si leés una sola línea:** `ajustes_por_ventana`
es el campo del frente A, y una entrada con ese arreglo lleno vale más que cinco
entradas con kg/ha. Si un trabajo compara dos ventanas de lluvia sobre la misma
producción, entregalo aunque le falte la coordenada, aunque le falte el método de
la cobertura y aunque sea de un solo año. Eso es la regla Y.
