# Plan: la fase de diseño del predio

acequia hoy **analiza** un territorio: dice qué clima tiene, qué suelo, por dónde
corre el agua, qué ecosistema le toca. Lo que falta es la mitad que sigue:
**diseñar el predio productivo** sobre ese análisis. Cuántos animales, en cuántos
módulos, con cuántos días de descanso, bebiendo de dónde, con qué represa, con la
sombra puesta donde sirve y las estructuras donde el terreno las admite.

Esta fase es ese salto. Son diez etapas y cinco correcciones a cosas que hoy ya
están en producción y están mal.

---

## 0. De dónde sale cada número, y la regla que gobierna este plan

El contenido de esta fase viene de la bibliografía técnica de manejo de predios:
los manuales de diseño de pequeñas represas, las tablas de requerimiento animal
de los organismos de investigación agropecuaria, los manuales de agricultura
regenerativa, la literatura de geometría de patrones de cultivo, y las normas de
hidráulica que ya usa la app.

**La regla, que no se negocia:** cada número de esta fase entra al código
**después** de haber abierto su fuente primaria publicada y leído su rango de
validez. No se codifica desde un apunte, un resumen ni una tabla de segunda mano.
Es la skill `motor-de-calculo` aplicada al pie: *la fuente primero, el código
después*. Y la cita va en el encabezado del módulo, que es trazabilidad interna:
el que mantenga ese cálculo en dos años tiene que poder ir al libro.

### Lo que no se copia, y por qué eso no limita nada

No se copia texto, tablas, gráficos, planos ni imágenes de ningún material
didáctico de terceros. Lo que se usa son **los métodos y los datos técnicos
publicados**, que es otra cosa: una fórmula de pérdida de carga, el requerimiento
energético de una vaca de cría o el talud recomendado para un terraplén arcilloso
son hechos técnicos de dominio público, y cada uno tiene su fuente primaria
accesible. Esa fuente se abre, se lee y se cita en el código; la redacción que
sale en pantalla es propia y está escrita para alguien que está diseñando un
predio, que es un lector distinto del de un manual.

Tampoco se nombra ningún curso ni autor en la app, en la guía pública ni en un
mensaje de commit. Lo que se nombra son las fuentes técnicas, que es lo que
corresponde y lo que el contrato del repositorio ya exige.

### Los tres criterios sin respaldo publicado: no se usan

Hay tres criterios que circulan en el ambiente y que **no tienen fuente
publicada**. Ninguno entra a acequia así, y no por una cuestión de permisos: sin
fuente, acequia no puede afirmar un número. Es la misma regla que gobierna todo
`lib/`. Lo interesante es que dos de los tres **la app los puede calcular mejor
que la regla de pulgar**:

| El atajo sin respaldo | Qué hace acequia en su lugar |
|---|---|
| Las horas en que se concentra la bebida según la distancia al bebedero | **Resuelto con dos normas de diseño del NRCS**, y mejor que el atajo: lo que manda no es una cantidad de horas, es **cuántos animales beben a la vez** por el caudal al que bebe cada uno. La distancia sí entra, pero decidiendo si el rodeo llega junto o de a poco —el umbral publicado son 604 m—, que duplica los espacios de bebida. Hecho: `lib/abrevadero.ts`. |
| «El evento extremo es la lluvia diaria máxima caída en 90 minutos» | La app ya tiene motor de tormenta de diseño con recurrencias (`lib/tormenta.ts`). La duración sale de la curva, no de un número fijo. **Esto ya está resuelto adentro.** |
| Topes de tamaño de cuenca en hectáreas para un embalse | Un tope en hectáreas es el atajo de «el vertedero se vuelve carísimo». acequia delinea la cuenca real, calcula el aporte y dimensiona el vertedero: puede decir **el costo**, que es la pregunta de abajo. Ver etapa E. |

El primero es el único hueco real y queda anotado en la sección 4.

---

## 1. Las cinco correcciones, que no son agregados

Esto ya está en producción y está mal. Va antes que cualquier etapa nueva.

### 1.1 El agua del ganado es un número fijo por cabeza

`lib/categorias.ts` declara litros por cabeza y por día por categoría —50 para
una vaca— como si fuera una constante del animal. **No lo es: depende de la
temperatura, y con fuerza.** La literatura de requerimientos nutricionales de
bovinos de carne publica el consumo por categoría *y por temperatura ambiente*, y
entre los extremos de ese rango —del orden de 4 a 32 °C— el consumo se multiplica
por algo más de **dos veces**.

Es el mismo error que tenía el equivalente vaca, en el otro extremo de la cadena,
y es más grave: un informe de receptividad optimista se discute, pero quedarse
corto en el embalse es hacienda sin beber en enero.

La app ya sabe la temperatura mes a mes del predio. El dato está; lo que falta es
que el consumo lo lea.

**Fuente a abrir:** la tabla de consumo de agua por categoría y temperatura de la
serie de requerimientos nutricionales de bovinos de carne de la academia nacional
de ciencias de EE.UU. (edición 2016), que recopila el trabajo original de los
años 50. Está publicada y hay que leerla, no citarla de memoria.

### 1.2 El caudal de pico no es el consumo diario dividido 24

El consumo diario se reparte por 24 horas en el dimensionamiento. El ganado no
bebe así: la bebida se concentra en unas pocas horas del día, y el caudal de pico
—no el promedio— es **lo que elige el diámetro del caño y el tamaño del
bebedero**. La diferencia no es de ajuste fino: entre un reparto parejo y una
concentración en cuatro horas hay un factor de cinco.

Esta corrección depende de la fuente que falta (ver arriba). Hasta tenerla, lo
honesto es: la app calcula con un factor de concentración **que el usuario
elige**, muestra el rango, y dice que el promedio diario subdimensiona.

### 1.3 El patrón keyline hace el offset desde donde la fuente dice que no ✅ *04/10/2026*

`lib/keyline.ts` genera el patrón de cultivo paralelando las **curvas de nivel**.
La literatura de geometría keyline dice explícitamente que no se haga eso: el
paralelo se traza desde la **línea guía** —que cruza la curva con una pendiente
deliberada— y por eso el patrón drena hacia donde el diseño quiere. Paralelando
la curva, el agua queda encerrada o se vuelca hacia el lugar equivocado.

Faltan además tres cosas que vuelven el patrón ejecutable con una máquina:

- la **cabecera** de maniobra en los extremos, del orden de dos a cuatro veces el
  ancho del implemento;
- el **ángulo mínimo de giro** del tractor, que vuelve impracticables los vértices
  muy cerrados;
- el aviso de que arriba de cierta pendiente el laboreo en curva deja de ser
  seguro.

Y una aclaración conceptual que hoy la app no hace: **el punto clave sirve para
ubicar cuerpos de agua**, no para trazar el patrón de cultivo. Son dos usos
distintos del mismo relieve.

**Es la corrección más delicada de las cinco**, porque hay proyectos guardados con
patrones generados por el código actual. Cambiar la geometría les cambia el
dibujo. Tiene que entrar con migración y con aviso, como el rodeo.

**Hecha el 04/10/2026.** Módulo nuevo `lib/keylineGeometria.ts` con los criterios
publicados y las citas; `lib/keyline.ts` reescrito en su parte del patrón; 62
tests. Cuatro fuentes: **Yeomans, «Water for Every Farm»** (el método de P.A.
Yeomans, 1954), **Georgi Pavlov (HUMA)** con prólogo de Darren J. Doherty, y los
estándares **NRCS 330 «Contour Farming»** (octubre 2017) y **386 «Field Border»**
(enero 2024).

Lo que apareció y no estaba previsto, que es más grave que lo que sí:

1. **La métrica estaba al revés.** `generarPatronCultivo` medía la «pendiente
   residual a lo largo de las líneas» y daba **«excelente» cuando tendía a
   cero**. Esa pendiente que aparece sola al parear una curva *es el mecanismo
   del método*: es la que saca el agua del eje del valle y la reparte en el
   lomo. acequia puntuaba la herramienta por el criterio opuesto al del método
   que le da el nombre, y Yeomans tiene la frase exacta para eso: *«Although any
   cultivation parallel to a contour guide line is "contour cultivation", it is
   not necessarily Keyline pattern cultivation.»* Ahora el veredicto es qué
   fracción del patrón deriva **hacia la ladera** y cuánta de esa deriva cae
   dentro de la banda publicada.
2. **La deriva tiene techo y piso publicados, y acequia no tenía ninguno.** El
   estándar 330 los fija: el techo es *«one-half of the up-and-down-hill slope
   percent […] with a maximum 4-percent row grade»*, y el piso es *«not less than
   0.2 percent on slopes where ponding is a concern […] soil hydrologic groups C
   or D»*. O sea que **el 0,5 % que la app llamaba «excelente» puede estar por
   debajo del mínimo publicado** en un suelo C o D: ahí el surco encharca. Y el
   grupo hidrológico ya estaba en la app, en la pestaña de suelo. Es el mismo
   patrón de la etapa E: no faltaba el dato, faltaba que dos paneles se hablen.
3. **El suavizado destruía la directriz.** Esto lo encontró un test. Simplificar
   la directriz a las formas principales —lo que la fuente pide— y después
   suavizarla con un corte de esquina proporcional al tramo deja el vértice
   reemplazado por una cuerda a la mitad de cada arma. Sobre una curva cruda de
   187 vértices no se nota; sobre una directriz de 3 **da vuelta la deriva**: en
   una vertiente, cortar el ángulo hace que las líneas bajen hacia el eje del
   valle. El redondeo pasó a ser un **radio acotado** —por defecto el ancho del
   implemento, que es lo que la máquina puede girar—, que es además la lectura de
   Pavlov: entre líneas paralelas la distancia en los ángulos es mayor que entre
   sus rayos, así que redondear no rompe la equidistancia.
4. **El orden del veredicto también estaba mal, y lo encontró el mismo test.**
   Mirar la dirección de la deriva antes que su magnitud hace que un patrón que
   corre exactamente a nivel salga rotulado «deriva invertida», que es una alarma
   falsa: no hay deriva ninguna. Primero la magnitud, después el lado.

Y las tres cosas de máquina que faltaban, cada una con su número: el **headland**
de 2 a 4 veces el ancho del implemento (y 30 pies si esa franja además hace de
borde de lote, por el estándar 386), el **giro máximo del tractor** de 50 a 55°
—así que un vértice de 30° es indibujable— y los límites de aptitud: **2 a 10 %
de pendiente**, **100 a 400 pies de largo de ladera**, otro patrón arriba de
**20°**, y menos efectividad con una tormenta de 10 años y 24 h de más de
**6,5 pulgadas (165 mm)** —que acequia también calculaba ya, en la pestaña de
tormenta—.

La corrección conceptual que el plan pedía quedó escrita donde se lee: la nota
del keypoint ahora dice que sirve para **ubicar agua** —es la cota más alta a la
que un muro embalsa en ese valle, los *Keypoint dams* de Yeomans— y que el patrón
de cultivo no se dibuja desde ahí.

**La migración y el aviso.** `ResultadoPatron` lleva `version: 2`. Un patrón
guardado antes no la trae, y la pantalla lo reconoce: **no se redibuja solo**
—las líneas que están en el plano son del usuario— pero tampoco se le muestra un
veredicto que nunca se midió así. Dice qué cambió y ofrece recalcular. No hizo
falta migración de base: esto vive en el JSON del proyecto.

**Lo que queda, y no lo puede cerrar el cálculo:** validar la deriva contra un
predio real. En los dos terrenos sintéticos del test las dos reglas opuestas de
Yeomans salen reproducidas —en la vertiente conviene parear hacia abajo, en el
lomo hacia arriba— pero eso es geometría, no campo. Y queda sin implementar el
**trabajo en dos mitades** de una vertiente angosta (el *herring-bone* de
Yeomans, con el eje del valle como línea divisoria): hoy se avisa cuando el
patrón da la vuelta por el vértice, que es cuando hace falta, pero el patrón no
se parte solo.

### 1.4 El lado del muro: la app pregunta y podría recomendar ✅ *04/10/2026*

El paso que elige de qué lado del espejo va el muro se preguntaba a ciegas, con
una sugerencia sin fuente: «el lado más bajo». Suele acertar, pero no es un
criterio publicado, y en un predio con dos vaguadas el lado más bajo del
polígono puede ser el que no se va a cerrar.

**Hecha el 04/10/2026.** Módulo nuevo `lib/ladoDeObra.ts`, sección 11 de
`lib/represaDiseno.ts`, componente `VertederoBloque.tsx`, 42 tests en
`tests/unit/aguas/ladoDeObra.test.ts`.

**Lo primero que apareció es que este apartado pedía la función correcta con los
criterios del otro lado.** El plan tomaba «menor pendiente» y «menor recorrido
hasta el cauce» como los criterios del muro; en el relevamiento de la clase 9
esos dos están bajo el título «Vertedero · De qué lado», y el método de diseño
en 6 pasos de esa misma clase los ubica en el **paso 3, «elegir el lado del
vertedero»**, que es un paso distinto del de elegir el cierre. Así que entraron
las dos decisiones, cada una con los criterios que le corresponden.

**El lado del muro: la relación de almacenamiento.** Para el cierre la misma
clase da otros criterios: la **relación de almacenamiento** —«m³ de agua por m³
de tierra movida»—, la **relación entre el largo del muro y el largo del
espejo**, y la ventana de **profundidad natural de 2,5 a 5,5 m**. Los tres se
pueden calcular **hoy** y no se podían antes: hacen falta el vaso real del
terreno (`lib/vaso.ts`) y la sección del muro integrada sobre el eje
(`dimensionarMuro`). Ahora cada arista del polígono trae su relación antes de
elegir, y es **el mismo número** que la pestaña ya mostraba como «eficiencia del
sitio» después de elegir: sale de `balanceTierra`, de manera que los dos no se
pueden separar. Y tiene contra qué leerse, que es lo que faltaba: la clase 9
ubica a las presas de ladera en «eficiencia ~1 o menor», así que por debajo de 1
el cierre elegido se está portando como la posición menos eficiente del paisaje.

**El orden del cociente estaba en duda y lo decidió el ejemplo resuelto de la
propia fuente.** El relevamiento trae la relación de las dos maneras: el
vocabulario dice «m³ de agua por m³ de tierra movida» y la columna de la
planilla quedó anotada como «Eficiencia VTM/VTA», que es el recíproco. El
ejemplo del curso cierra la discusión y cierra fino: subir la cota de 92,7 a
93,7 pasa de 10,3 a 23,9 ML con 1.990 → 3.700 m³ de tierra, y el costo baja de
1,51 a 1,21 US$ por m³ de agua. Ese costo es `tierra/agua × precio del m³ de
tierra`, así que el cociente de los dos costos publicados tiene que ser el de
las dos relaciones invertidas: **1,51/1,21 = 1,2479 contra 1,2480**. Cierra a la
cuarta cifra, y de paso deja ver el precio implícito del movimiento de tierra de
ese ejemplo, 7,82 US$/m³. Es el caso resuelto del test.

**Y un número plausible y equivocado que el test encontró.** La primera versión
le calculaba la relación a todos los lados, y en una hoya con una sola salida
los tres lados que no cierran nada daban **la mejor relación de las cuatro**:
145.000 m³ de agua sobre un muro de altura cero. El agua estaba, pero la
sostenía el terreno y se iba por otro lado; el muro sobraba. Ahora, cuando la
cota de derrame no llega al punto más bajo del eje, el lado queda afuera del
ranking con el motivo escrito.

**El lado del vertedero, y el piso que el enunciado no tiene.** Los dos
criterios de la clase 9 se miden sobre el relieve: la pendiente del terreno
natural desde cada estribo y el recorrido de vuelta al cauce. El cauce no se
define con un umbral de acumulación inventado: se define siguiendo el agua desde
el punto más bajo del eje del muro hacia aguas abajo, y ese recorrido **es** el
curso que la represa interrumpe. El camino del estribo elegido se dibuja en el
mapa.

AH-590 dice lo mismo que el curso con sus palabras —*«use them only where the
soils and topography allow the peak flow to discharge safely at a point well
downstream and at a velocity that does not cause appreciable erosion»*, que son
los dos criterios en una oración— y agrega lo que el enunciado de dos criterios
deja afuera: **más plano no es mejor**. El canal de entrada *«should have a
slope toward the reservoir of not less than 2.0 percent to ensure drainage»*, y
el cuadro 10 —el de los vertederos naturales, sin excavar— empieza en 0,5 % de
pendiente de terreno natural y no tiene fila más plana. Un estribo casi
horizontal no es el mejor candidato: es uno que no drena. Ése es el test que
vale del apartado, y la pantalla lo dice con las dos pendientes al lado.

Lo demás que apareció en el manual y entró:

- **Si hay que excavar o no.** *«Excavation of the inlet channel or the exit
  channel, or both, can be omitted where the natural slopes meet the minimum
  slope requirements»*, y *«the natural slope of the exit channel should be
  altered as little as possible»*. El estribo que ya tiene la pendiente adecuada
  ahorra la obra entera del canal, y eso es lo que la app informa ahora en vez
  de un número suelto.
- **Que el vertido no vaya contra el muro.** *«The direction of slope of the
  exit channel must be such that discharge does not flow against any part of the
  dam.»* No es una preferencia: es la falla que rompe el talud de aguas abajo.
  Se verifica siguiendo el agua sobre el DEM, y el estribo que la lleva contra
  el terraplén queda descartado antes de compararlo con el otro.
- **Que el derrame natural le gana a los dos estribos.** *«A natural spillway
  does not require excavation to provide enough capacity to conduct the pond
  outflow to a safe point of release.»* Si el vaso ya tiene una silla de montar
  por donde derramar —la que `lib/vaso.ts` encuentra y marca en el mapa— el
  bloque lo dice antes de recomendar un estribo.
- **El tramo a nivel: 25 pies** (figura 21). Es lo que hace que el vertedero
  trabaje en lámina y no concentrando, que es la falla típica que describe el
  curso.
- **Que la pendiente del terreno natural es un insumo de la carga sobre el
  vertedero** y no un dato suelto: *«with the required discharge capacity (Q),
  the end slope of the embankment (Z1), and the slope of the natural ground (Z2)
  known, the maximum depth of water above the level portion (Hp) can be obtained
  from table 10»*. O sea que elegir el lado del vertedero mueve la carga, y la
  carga mueve la cota de corona, que es el hallazgo de la etapa E. Las dos
  decisiones estaban desconectadas.

**Lo que queda abierto, y no lo puede cerrar el cálculo:** que la carga sobre el
vertedero se lea del cuadro 10 con la pendiente del estribo elegido en vez de
escribirse a mano —es el cierre natural de esto y de la etapa E—, y validar
contra un predio real que el recorrido del vertido vaya para donde el dueño sabe
que va. Y queda sin implementar el paso 4 del método de la clase 9: que la
corona se dibuje hasta el pelo de agua del lado del vertedero y hasta la altura
del libre bordo del lado opuesto, que cambia el largo del coronamiento según de
qué lado quedó el vertedero.

### 1.5 Falta el coeficiente de simultaneidad de un conjunto de viviendas ✅ *04/10/2026*

El dimensionamiento de la red de agua usaba el coeficiente de una vivienda. Para
un conjunto de `N` viviendas el coeficiente es otro y es el que hace que una red
de diez casas no se dimensione como diez redes de una.

**Hecha el 04/10/2026.** `lib/artefactos.ts` (`simultaneidadConjunto`,
`demandaConjunto`), el campo «¿a cuántas viviendas iguales sirve esta red?» en
`RedServiciosPanel`, y 41 tests en `tests/unit/aguas/artefactos.test.ts` (eran
24).

**Fuente leída:** Vázquez Arenas, G., «Instalaciones I», tema 1, 3ª parte
(Universidad Politécnica de Cartagena, OpenCourseWare), apartado «Coeficiente de
simultaneidad en viviendas de igual tipo», contrastada con el material de
formación del **Govern de les Illes Balears**, que publica la misma expresión y
la misma distinción entre los dos coeficientes. **Y acá va una respuesta
negativa que el apartado pedía:** ninguna de las dos nombra una norma para esta
expresión. Lo que hay es la fórmula publicada con sus condiciones, y eso es lo
que acequia cita; no se le pone un número de norma que no se vio.

De paso, el nombre. Las dos fuentes llaman **Kv** al coeficiente entre viviendas
y **Ke** al de los artefactos de una vivienda; este apartado lo tenía al revés.

**Las cuatro cosas que apareció yendo a la fuente, y la primera es la que
importa:**

1. **Hay un piso publicado, `Kv ≥ 0,25`, y la fórmula sola se le va por
   abajo.** La expresión tiende a 0,10 cuando `N` crece, así que **por abajo se
   escapa del rango en el que la publicaron**, y se escapa enseguida: el cruce
   es exacto en `N = 11`, donde `Kv = 30/120 = 0,25` justo. Desde 12 viviendas
   la fórmula cruda queda por debajo del piso, y con 50 da 0,135 contra 0,25:
   **un 46 % menos de caudal de diseño**, o sea un caño calculado para la mitad
   del agua. Es exactamente la falla que este repositorio vigila —un número
   plausible y equivocado, del lado barato— y era lo que este apartado llamaba
   «una línea de código». La línea sola, en un loteo, dimensiona mal.
2. **El coeficiente es para un conjunto de viviendas IGUALES.** *«Este
   coeficiente se aplicará al número de viviendas iguales, es decir no habrá 15
   viviendas iguales sino que se considerará que habrá 15·Kv viviendas.»* Ocho
   cabañas más la casa principal no son un conjunto de nueve: son dos conjuntos,
   cada uno con su `N` y su `Kv`. `demandaConjunto` toma grupos por eso. Y lo
   que la fuente **no** dice es cómo combinar grupos distintos, así que acequia
   suma los aportes —el lado conservador: dos grupos de 8 y 2 piden más caño que
   uno solo de 10— y lo escribe en las advertencias en vez de inventar una
   regla.
3. **Hay un umbral, y el ejemplo del curso cae justo en el borde.** *«Este
   coeficiente de simultaneidad se aplicará cuando el número de viviendas en un
   edificio sea superior a 10»*, y *«se omitirá su cálculo […] en las
   instalaciones interiores cuando el número de viviendas sea menor de 10»*. Las
   dos oraciones acotan el umbral a **edificios e instalaciones interiores**, y
   la misma fuente dice que el coeficiente *«resulta principalmente práctico en
   el cálculo de las redes urbanas»*, que es el caso de un loteo. Así que para
   una red acequia lo aplica, pero avisa: las diez cabañas del ejemplo, con su
   0,26, están exactamente en el borde de lo que la fuente discute.
4. **Y el de artefactos, el que ya estaba, le falta un 20 % según una de las dos
   fuentes.** La de Cartagena lo pide explícitamente —*«este valor de Kp […] se
   debe aumentar en un 20 % del resultado para constituir así un factor de
   seguridad frente a posible uso de la instalación en horas punta»*— y la
   balear publica la misma expresión sin mayoración ninguna. La discrepancia se
   deja a la vista en vez de resolverla por decreto: el panel informa los dos
   números y dice que las fuentes no coinciden. El caudal de diseño no cambia
   —lo manda Hunter— porque éste es el método de contraste.

**Y una deuda que el apartado no mencionaba:** el piso de 0,2 del coeficiente de
artefactos es de acequia y no está publicado. Con la mayoración recién muerde
arriba de 37 artefactos en el mismo tramo, que en una vivienda rural no pasa,
pero ahora cuando muerde se avisa y se dice de quién es el número.

**Lo que queda abierto:** el panel toma **un** tipo de vivienda a la vez, que es
el caso del plan —un loteo, las cabañas, las casas del personal—; los grupos
múltiples están en el motor y calculados, pero sin pantalla. Y valen las mismas
condiciones de la fuente que acequia no puede verificar sola: que las viviendas
sean realmente iguales y que el consumo sea doméstico.

---

## 2. Las etapas

### Etapa A — Modulación ganadera ✅ *02/10/2026*

Hecha. `lib/modulacion.ts`, y la receptividad de `produccion.ts` corregida con
la fuente abierta y leída antes de escribir una línea de código.

**Lo que apareció yendo a la fuente, y no estaba previsto: un tercer número sin
respaldo, del mismo tipo que los dos anteriores.** El coeficiente de cosecha
estaba fijo en 0,50 con el argumento de «take half, leave half». La publicación
que sistematiza esa regla —Holechek (1988), después de revisar los estudios de
intensidad de pastoreo de quince tipos de pastizal— dice textualmente dónde
vale: *«appears applicable only to humid and annual grassland ranges»*. En un
arbustal de menos de 300 mm el uso admisible publicado es **30 %, no 50 %**: la
receptividad que mostraba acequia era **1,67 veces** la que corresponde, y el
error era más grande justo donde el margen es más fino. Es el mismo error del
equivalente vaca y del agua de bebida, por tercera vez: el valor de una
situación buena aplicado a todo el planeta. Ahora el uso sale de la banda de
precipitación del predio —30 / 40 / 50 %, y 55 % si el pastizal es de anuales—,
que son los valores que la fuente recomienda **justo para el caso de acequia**:
cuando no hay información local de intensidad de pastoreo.

**Superficie efectiva: son dos cosas distintas y mezclarlas es el error clásico.**

- Lo que **no es tierra de pastoreo** —espejo de agua, humedal, construido,
  hielo— se resta en hectáreas, leído de la cobertura. El suelo desnudo **no** se
  resta: un pastizal ralo sigue siendo campo, y lo que corresponde es que
  produzca poco forraje, no que desaparezca del plano.
- Lo que el ganado **no usa igual** —el terreno quebrado, la distancia a la
  aguada— es un **factor sobre la capacidad**, no hectáreas que desaparecen. Esas
  hectáreas siguen existiendo y siguen produciendo pasto.

Las dos reducciones salen de las tablas 3 y 4 de Holechek: pendiente (sin
reducción hasta 10 %, 30 % entre 11 y 30, 60 % entre 31 y 60, no pastoreable
arriba de 60) y distancia al agua (sin reducción hasta la milla, 50 % hasta las
dos millas, no pastoreable más lejos). La pendiente la calcula acequia **celda
por celda sobre el DEM**, con la pendiente máxima local contra las ocho vecinas:
lo que decide si una vaca sube una loma es la parte más empinada del camino, no
el promedio.

**Y el hallazgo contraintuitivo: los dos factores no se multiplican.** La guía
B-829 de NMSU, que reproduce las dos tablas, da la regla: *«these should be
calculated separately with the greatest reduction percent used. They should not
be combined for a cumulative reduction.»* Multiplicar es lo que uno haría por
sentido común —una ladera lejana parece doblemente castigada— y descontaría dos
veces al mismo animal que no camina. Hay un test que fija que acequia **no**
multiplica.

**Una inconsistencia de las fuentes, resuelta y documentada.** Las dos
publicaciones traen la tabla de pendiente y traen además la cuenta escrita como
ecuación, y **no coinciden entre sí**: las dos tablas dicen factores
1,00 / 0,70 / 0,40 / 0, el ejemplo resuelto de Holechek usa 0,30 en la tercera
banda y la ecuación de B-829 usa además 0,60 en la segunda. Manda la tabla —es
la que las dos escriben igual y la que cada una presenta como resultado de la
literatura que cita—, así que acequia **no reproduce el resultado impreso** del
ejemplo: da 159 novillos donde el artículo imprime 152. Está en un test, para
que la diferencia esté explicada y no parezca un error nuestro.

**El rodeo máximo manejable sale del agua**, que es lo que el plan sospechaba: el
tamaño del rodeo lo limita el agua y no el pasto. Dando vuelta la ventana de dos
horas del CPS 614, una aguada de caudal conocido abreva una cantidad concreta de
cabezas. Y la distancia pone el otro tope: con la aguada en el centro de un
módulo cuadrado, hasta **518 ha** nadie camina más de la milla; con la aguada en
una esquina el mismo criterio baja el tope a **130 ha**. Un factor cuatro que se
decide con un portón, antes de comprar un rollo de alambre.

**Los módulos son el menor número que cumple todas las restricciones** —caudal,
distancia y el tope de cabezas que declare el productor— y la pantalla **dice
cuál es la que obliga**, porque es la única que vale la pena discutir: aflojar
cualquier otra no cambia nada. Eso es «holgados en la carga objetivo y estrictos
en todo lo demás» escrito en código.

**Y una cosa que el cálculo deja ver y que no se veía antes:** el descuento por
distancia al agua **no es un destino del campo, es una consecuencia de cuánta
agua hay**. La pantalla dice con cuántas aguadas desaparece.

**El rango de validez, que acá es media historia.** Los dos factores son guías
para una carga inicial, no mediciones, y su propio autor lo escribe. En 2020,
con collares GPS en seis campos de Nuevo México y Holechek entre los autores
(Millward et al., *Rangelands* 42(3):63-71), se midió cuánto valen: **la
pendiente se sostuvo** —donde falló fue por conservadora, 14 puntos
porcentuales— pero **el descuento por distancia no se sostuvo donde el agua es
escasa**: con una sola aguada el ganado caminó bastante más de la milla, hasta
39 puntos porcentuales más de superficie usada. Con varias aguadas la tabla
acertó. Por eso acequia reporta los dos factores por separado, dice cuál manda y
avisa cuando hay una sola aguada.

**Lo que quedó sin hacer de esta etapa, y es deliberado:** la *carga objetivo por
ambiente* en el sentido de un bajo dulce contra una loma arenosa. Lo que acequia
diferencia hoy es por **banda de pendiente y de distancia**, que es lo que tiene
fuente; para diferenciar por ambiente hace falta producción de forraje por
ambiente, y ese número —`prodForrajera`, una escalera por precipitación— es el
que sigue sin respaldo. Anotado en la sección 4.

### Etapa B — El agua del ganado, bien calculada ✅ *02/10/2026*

Hecha. Las correcciones 1.1 y 1.2 convertidas en dos módulos, y los dos con su
fuente abierta y leída antes de escribir una línea de código.

**`lib/aguaGanado.ts`** — consumo por categoría y temperatura, de la tabla del
**NASEM (2016)**, reproducida celda por celda. Diez categorías bovinas con curva
de temperatura; ovinos y porcinos con los rangos publicados; equinos y caprinos
conservan el valor declarado **diciendo que es declarado**. Una vaca seca se
multiplica por 2,4 entre los dos extremos de la tabla. La vaca con cría al pie
sube menos, y por algo que estaba publicado y no sabíamos: **entre 80 y 90 °F su
consumo baja**, porque con estrés calórico severo cae la producción de leche. Así
que la que manda el pico del verano es la vaca seca, no la que está criando.

**`lib/abrevadero.ts`** — caudal de pico, espacios de bebida y reserva del
bebedero, de dos normas de diseño del **USDA-NRCS**. El reparto parejo en 24 horas
subdimensionaba más de treinta veces.

**La represa ya consume la demanda mes a mes** y no un número repetido doce
veces, con los días reales de cada mes. El informe muestra el promedio y el mes
de más calor.

Y **Producción muestra el mismo número que Represa**: las dos leen el agua del mes
más caluroso. Si una pestaña mostrara el consumo con temperatura y la otra el
valor declarado, el mismo rodeo tendría dos consumos según dónde se lo mire, que es
el defecto que esta capa compartida vino a resolver.

Lo que quedó sin hacer de esta etapa, y es deliberado: **el descuento por humedad
del forraje**. La tabla publica consumo *total*, que incluye el agua del alimento,
y un pasto en estado vegetativo tiene 65 a 80 % de agua. Descontarlo bajaría mucho
el número, así que se deja el total —que es el lado seguro para una represa— y el
descuento va a entrar como un ajuste explícito que el usuario prende, con su
propia fuente. Está anotado en la sección 4.

### Etapa C — Pastoreo: el menú de manejos ✅ *02/10/2026*

Hecha. `lib/manejos.ts` nuevo, `lib/pastoreo.ts` corregido y la pestaña Pastoreo
rehecha, con las fuentes abiertas y leídas antes de escribir código.

**Lo primero que apareció yendo a la fuente es una advertencia contra esta misma
etapa, y viene del autor que ya citamos en la A.** Holechek, Gomez, Molinar y
Galt (1999), repasando los estudios de pastizal de larga duración: *«Rotation
grazing systems have been widely recommended by various government agencies
concerned with range management. However research shows stocking rate reductions
from heavy to conservative, have much higher probability of increasing grazing
capacity, reducing risk, increasing financial returns, and reducing erosion.»*
O sea: **acertarle a la carga rinde más que rotar.** La etapa A vale más que
esta, y eso ahora está escrito arriba del panel de Pastoreo, antes de cualquier
número. Un diseñador de potreros que no lo diga está vendiendo alambre.

**El hallazgo contraintuitivo, que da vuelta lo que todos suponen:** el tope de
días en una parcela es **más corto cuando el pasto crece más rápido**. A3529, con
número: *«Regrowth occurs after about four days during May and June and 10 days
during August and September, so the maximum grazing period should never be longer
than these averages.»* En plena temporada de crecimiento la planta vuelve a tener
hoja a los cuatro días, y si el rodeo todavía está ahí se la come por segunda vez
antes de que haya rearmado nada —que es lo único que la fuente llama *«a sure way
to kill desirable species»*—. Todo el mundo razona al revés: hay mucho pasto,
dejo el ganado más tiempo.

Y hay un **segundo tope, por conducta y no por planta**, de otra fuente: Gerrish
mide que el rodeo arma su querencia dentro de la parcela **a los tres días**, y
que **la repite en las vueltas siguientes**. Pasar de tres días no mata la
pastura: deja el potrero pastoreado desparejo para siempre. Los dos topes se
reportan por separado porque lo que se daña es distinto.

**El tipo de pastura es la decisión que más mueve de la etapa, y nadie la pide.**
Las gramíneas templadas y las tropicales piden descansos **opuestos**: la
templada necesita más descanso con calor —se frena— y la tropical menos, porque
el calor es cuando crece. El descanso estacional que tenía acequia era una
escalera fija de 30/35/45/80 días igual para toda la Tierra, así que **estaba
exactamente al revés en medio mundo**. Ahora sale de los rangos publicados por
tipo, y el tipo lo **sugiere el clima del punto** con el criterio de Collatz,
Berry y Clark (1998): un mes favorece a las C4 cuando su media llega a 22 °C y
llueven 25 mm o más. Es algo que acequia puede hacer y nadie más, porque ya tiene
las doce medias mensuales del punto; el usuario puede cambiarlo, y si la pastura
es implantada manda él.

**La aritmética tenía un término olvidado.** La fórmula es `parcelas = descanso ÷
ocupación + grupos de animales`, y el término de grupos son las parcelas ocupadas
al mismo tiempo: con dos rodeos pasando uno detrás del otro hacen falta dos
parcelas más, no una. acequia tenía el 1 cableado. Los dos ejemplos resueltos de
A3529 —30 ÷ 3 + 1 = 11 y 32 ÷ 2 + 1 = 17— cierran exactos y están en tests.

**El resultado de geometría que nadie cree hasta verlo:** Gerrish compara dos
trazados del mismo campo y encuentra que *«the total linear footage of fence
required for the 16 paddock system is actually less than for the 12 paddock
system»*, porque un cuadrado tiene menos perímetro que un rectángulo de la misma
superficie. **Más parcelas con menos alambre.** acequia ahora elige la grilla que
menos alambre gasta en vez de suponer una, y hay un test que reproduce la
comparación: 12 parcelas en tiras piden 11 hilos de largo del bloque, 16 en
grilla de 4 × 4 piden 6.

**Dos distancias al agua publicadas que parecen contradecirse y no.** La etapa A
usa 1,6 km y esta usa 240 m. Contestan preguntas distintas: la milla decide *si
la hectárea cuenta para la capacidad de carga*, y los 800 pies de la guía de
Illinois deciden *si la parcela se va a comer pareja*. Está explicado en pantalla
porque un lector atento lo iba a notar. El radio de 300 m que usaba el dibujo de
potreros no venía de ninguna parte; ahora son los 244 m publicados.

**La pieza más útil de la etapa es la más barata: las alturas.** La tabla 7 de
A3529, pasada a centímetros. **El descanso en días es una estimación; la altura es
una medición**, y la fuente lo pide en una frase: *«It is crucial that you move
your animals according to the forage, not the calendar.»* Con cuatro renglones de
alturas de entrada y salida, un productor con una regla no necesita el
calendario. La altura de salida es el fusible de verdad: comerla más abajo no
ahorra superficie, **alarga el descanso**.

**El fusible del año seco no se inventó: salió de aplicar la misma fórmula dos
veces.** El plan decía «una reserva del 5 al 10 % de la superficie», y **no
encontré fuente para ese número**. Lo que sí está publicado es mejor: las
parcelas se dimensionan con el descanso de la temporada más lenta, así que en la
temporada rápida el mismo campo necesita muchas menos, y **las que sobran son el
heno** —A3529: *«Reduce the number of paddocks grazed in the spring by using them
to make hay. Put those paddocks back into the rotation in the middle of the
summer»*—. Es un número que acequia calcula y que no hay que adivinar: con 16
parcelas para 30 días de descanso, en la temporada de 14 sobran 8, la mitad del
campo. La otra mitad del fusible es carga y tiene números de Holechek y otros
(1999): el uso conservador resigna del 10 al 25 % de la ganancia en años normales
y devuelve del 30 al 60 % más en una sequía severa. Se paga poco todos los años y
se cobra mucho el año que importa.

**Cuatro números inventados que se fueron de `pastoreo.ts`:**

- el descanso estacional cableado, ya contado;
- el `+ 1` de los grupos, ya contado;
- **la carga instantánea en EV, que se calculaba como `peso / 400`.** Era el mismo
  error del equivalente vaca sobreviviendo en otro archivo: el EV está definido en
  **energía** —18,54 Mcal EM/día— y no en kilos de animal. Lo peor no es la
  magnitud: es que la fórmula vieja **no podía ver el forraje**, daba el mismo
  número comiendo paja o alfalfa. Ahora pasa por `consumoEV_kgMS_dia`, y hay un
  test que cruza los dos módulos y muestra cuánto se corrió: para un rodeo de
  400 kg al 2,8 %, la carga correcta es **0,94 veces** la vieja sobre forraje
  diferido, **1,13** sobre pastizal natural y **1,45** sobre pastura de calidad.
  No era que estuviera alta o baja: no tenía con qué saberlo;
- **los postes y el agua de bebida.** «1 poste cada 8 m» no tiene fuente y se
  fue: no hay con qué reponerlo y un número plausible es peor que ninguno. El agua
  se estimaba como el 10 % del peso vivo, cuando acequia **ya** la calcula desde
  la temperatura con tabla publicada: tener dos respuestas distintas a la misma
  pregunta es peor que tener una, así que se fue y el panel manda a la otra
  pestaña.

**Lo que no entró y es deliberado:** el reparto de parcelas **por comida y no por
superficie**, que es la regla que A3529 escribe explícitamente —*«It is more
important that the paddocks yield roughly equal amounts of forage than that they
have equal areas»*— y que casi todos los diseños rompen. La función existe
(`haEquivalente`) y el panel dice por qué no se aplica sola: para repartir por
comida hace falta **producción de forraje por ambiente**, y ése es
`prodForrajera`, el número que sigue sin fuente. Es la tercera etapa seguida que
choca contra el mismo faltante.

### Etapa D — Sombra para el ganado

Hoy la app calcula sombra de objetos para construcciones. Para el animal la
pregunta es otra: **cuántos metros cuadrados de sombra por unidad de ganado**, y
**a qué distancia** tiene que estar para que el rodeo la use. Los dos números
tienen literatura publicada —de bienestar animal y de sistemas silvopastoriles— y
hay que abrirla: varían con la categoría, con el clima y con el tipo de sombra
(árbol aislado, monte, media sombra).

El tercer dato lo tiene la app y nadie más: **en qué meses hace falta**, que sale
del gráfico climático del predio, y **dónde cae la sombra**, que sale del relieve
y de la orientación. La app ya corrigió el hemisferio sur en esos cálculos.

### Etapa E — Represa: las tablas de diseño y la comparación de candidatos ✅ *03/10/2026*

Hecha. Un módulo nuevo —`lib/represaDiseno.ts`—, dos bloques de interfaz en la
pestaña Represa, y **seis números del muro que estaban por debajo del mínimo
publicado**, todos del lado barato.

La fuente es el manual clásico del rubro, que además es gratuito y de agencia
pública, así que cualquiera puede ir a verificar cada número: **USDA SCS (1997),
*Ponds — Planning, Design, Construction*, Agriculture Handbook 590**. Para la
evaporación del espejo, **FAO-56 (Allen y otros, 1998), cuadro 12, apartado «p.
Special» y nota 25**.

**1 · La cota del coronamiento estaba corta, y es el número con el que se
construye.** Es el hallazgo de la etapa y no estaba en el plan. AH-590 define la
revancha como *«the vertical distance between the elevation of the water surface
in the pond **when the spillway is discharging at designed depth** and the
elevation of the top of the dam **after all settlement**»*. O sea que entre el
nivel normal del embalse y la corona hay **tres** cosas apiladas:

```
cresta del vertedero  +  carga de la crecida sobre el vertedero (Hp)
                      +  revancha
                      +  sobrealto por asentamiento
```

acequia sumaba sólo la del medio. Y el manual deja el orden de magnitud escrito
en un ejemplo de una línea: con `Hp` = 1,3 pies y una revancha de 1 pie, *«the
top of the dam should be constructed 2.3 feet higher than the spillway crest»*
— **la carga sobre el vertedero es más grande que la revancha**. Faltaba más de
la mitad de lo que hay que subir, antes de contar el asentamiento.

Lo irónico es que acequia **ya calculaba** la carga sobre el vertedero: está en
la pestaña Cuenca, en `head_vertedero_m`, junto con el ancho de vertedero que
hace falta para el caudal de pico. Los dos números existían en la app y no se
tocaban nunca. Ahora el bloque de criterios los apila con cada término a la
vista, y sin carga de vertedero avisa en vez de devolver una cota plausible.

Es la falla que no avisa: un muro angosto se nota al transitarlo, un muro corto
se nota una sola vez, con la crecida encima, y el modo de rotura de un terraplén
desbordado es la brecha.

**2 · El sobrealto por asentamiento no existía.** *«Most foundations are
yielding, and settlement may range from 1 to 6 percent of the height of the dam
[…] The settlement allowance for a rolled-fill dam should be about 5 percent of
the designed dam height […] Most pond dams less than 20 feet high, however, are
not rolled fill. For these dams the total settlement allowance should be about
10 percent.»* El 10 % es el caso corriente de un predio: un muro de menos de
6 m hecho con topadora, no compactado en capas con rodillo. Y el ejemplo de
cómputo del propio manual lo aplica al volumen: 7.029 yd³ + 10 % = 7.732 yd³.

No es lo mismo que el factor de contracción, que acequia ya tenía: ése dice
cuánto banco hay que mover para dejar un metro cúbico compactado. Éste dice que
el muro terminado es más grande que el dibujado. **acequia tenía uno y no el
otro, y el que faltaba abarata.** Es una casilla en pantalla, porque quien decide
si va rodillo es el que contrata la máquina.

**3 · Las tablas del muro quedaban todas por debajo del mínimo.** Las que había
eran de criterio corriente, sin tabla y sin fuente, y el error crecía con la
altura:

| | acequia tenía | AH-590 pide | |
|---|---|---|---|
| Corona, muro de 2 m | 1,5 m (mínimo 1,0) | **1,83 m** | «a conservative minimum top width is 6 feet» |
| Corona, muro de 5 m | 2,5 m | **3,05 m** | fila de 15 a 19 pies → 10 pies |
| Corona, muro de 8 m | 3,0 m | **4,27 m** | fila de 25 a 34 pies → 14 pies |
| Corona transitable | 3,0 m | **4,88 m** | 16 pies: la huella **más las dos banquinas** |
| Talud interno, muro < 5 m | 2,5:1 | **3:1** | cuadro 16: las dos filas tienen 3:1 aguas arriba |
| Zanja de anclaje, fondo | 2,0 m y rectangular | **2,44 m y 1,5:1** | 8 pies o el ancho de hoja de topadora |

El de los taludes es el que más cambia la obra. El cuadro 16 tiene **dos filas y
nada más**, y el texto que las acompaña las vuelve un mínimo y no una sugerencia:
*«For stability, the slopes should not be steeper than those shown in table 16,
but they can be flatter as long as they provide surface drainage»*. Las dos
tienen 3:1 aguas arriba, porque ese lado está saturado, lo golpea el oleaje y
sobre todo sufre el vaciado rápido, que es la condición que lo hace deslizar.
Los 2,5:1 que daba acequia no eran una variante admisible: estaban por debajo
del mínimo, en el lado que desliza, y **justo en el rango de altura más común de
un predio**.

Como la base del muro es `corona + alto × (talud interno + talud externo)`, los
seis errores iban al mismo lugar: al volumen de terraplén, o sea al
presupuesto, siempre del lado barato. Ahora los mínimos salen de
`represaDiseno.ts` y lo único de acequia es el **techo** del rango, que se
declara como tal.

**Y lo que la tabla NO cubre quedó declarado.** El cuadro 16 no tiene fila para
arena limpia ni para arcilla muy plástica: para esos materiales el manual no da
taludes, manda a investigar la fundación y consultar a un ingeniero. acequia no
inventa la fila faltante; devuelve la más tendida de las dos como piso y marca
`fueraDeTabla`. Lo mismo arriba de los 34 pies de altura, donde la tabla de
corona se termina.

**4 · La revancha la fija el largo del vaso, no la altura del muro.** Es
contraintuitivo y tiene sentido físico: la revancha está para que no la pase la
ola, y la altura de la ola la da el *fetch* —cuánta agua libre tiene el viento
para empujar— no cuánta agua hay abajo. *«If your pond is less than 660 feet
long, provide a freeboard of no less than 1 foot. The minimum freeboard is 1.5
feet for ponds between 660 and 1,320 feet long, and is 2 feet for ponds up to a
half mile long. For longer ponds an engineer should determine the freeboard.»*
acequia la tenía como un preset por tipo de obra —0,30 para una aguada, 0,50
para una represa de ladera— sin mirar el espejo. Ahora el preset es un piso de
uso y si el vaso es largo manda la tabla, con el dato que la app ya tenía: el
span máximo del espejo dibujado.

**5 · La profundidad útil del vaso, de la figura 12.** El mapa es de Estados
Unidos pero **la leyenda no es geográfica: es climática**, son las seis bandas
de humedad de «wet» a «arid», así que la tabla se puede aplicar afuera. De 5
pies de agua permanente en clima húmedo a 14 en clima árido. No es la
profundidad del vaso: es la lámina que tiene que seguir habiendo cuando la
represa está en su mínimo, para que la evaporación y la infiltración no se la
lleven. Y el manual pone el límite de su propia validez: vale *«if seepage and
evaporation losses are normal»*, y *«deeper ponds are needed […] where seepage
losses exceed 3 inches per month»*.

La correspondencia entre las bandas del manual y las clases de aridez P/ETP que
acequia ya calcula **es de acequia y está declarada**: los nombres coinciden casi
palabra por palabra pero las dos clasificaciones no se definen igual, así que
donde hay duda se toma el extremo profundo —un vaso de más sobra una vez y uno
de menos se seca cada verano—. Los dos extremos quedan dichos: el hiperárido se
sale de la figura, y la clase Húmedo de acequia junta «Humid» y «Wet».

**6 · La evaporación del espejo: el 1,05 tenía razón y no tenía condición.** La
simulación anual multiplicaba la ETP de referencia por un 1,05 fijo, sin fuente.
El número está bien, y está publicado: es la primera fila de agua libre del
cuadro 12 de FAO-56, *«Open Water, < 2 m depth or in subhumid climates or
tropics»*, Kc = 1,05. Lo que faltaba era la condición, y con ella la segunda
fila: *«Open Water, > 5 m depth, clear of turbidity, temperate climate»*, que
tiene **dos** valores, Kc mid 0,65 y Kc end 1,25. La nota 25 explica por qué:
*«initial and peak period evaporation is low as radiation energy is absorbed
into the deep water body. During fall and winter periods (Kc end), heat is
released from the water body that increases the evaporation above that for
grass.»*

Un embalse hondo en clima templado evapora **menos** que el pasto mientras se
calienta y **más** cuando devuelve el calor. Un factor constante borra justo esa
diferencia, y el mes que importa es el de la punta seca. El promedio anual de los
dos es 0,95 y no es lo que se usa; hay un test que se cae si alguien lo
«simplifica» así.

Y como la nota habla de estaciones, **hace falta el hemisferio**: la mitad que se
calienta en Córdoba es la que se enfría en Kansas. Cuando el predio tiene clima
cargado la mitad sale de la propia serie de temperatura del lugar, mes contra
mes, y no del calendario. Es la tercera vez que una fuente del norte entra a
acequia con las estaciones al revés y la app las corrige.

Entre 2 y 5 m la fuente no dice nada. acequia usa la fila somera y lo declara:
no se interpola entre las dos filas, porque nadie midió el medio, y 1,05 es el
valor más alto en la mitad cálida del año, que es la mitad en la que una represa
se queda sin agua.

**7 · Comparar candidatos por cota.** El archivo de represas ya existía
(02/10/2026) y los ordenaba por agua embalsada sobre tierra movida. Lo que
agrega esta etapa es la otra mitad de la decisión: **cuánta de esa agua se va por
evaporación en el año**, que depende del espejo y no del volumen. Para el mismo
volumen conviene el vaso concentrado, porque la evaporación se cobra por metro
cuadrado y el almacenamiento se paga por metro cúbico — y en un semiárido con
1.400 mm de ETP, un vaso de un metro de profundidad media evapora en el año más
que todo lo que guarda. Ése es el truco de diseño que el plan pedía cuantificar,
y ahora está con número al lado de cada candidato.

El mejor por evaporación y el mejor por tierra movida **casi nunca son el mismo
candidato**, y cuando no coinciden la app lo dice en vez de elegir: ahí la
decisión deja de ser técnica y depende de si en ese predio lo escaso es el agua
o la plata. El costo en plata necesita un precio por metro cúbico movido, que lo
pone el usuario y sale del catálogo del presupuesto: cuánto cuesta mover un
metro cúbico depende de la máquina, la distancia y el país, y eso no hay fuente
que lo publique. Lo que sí es transferible —y es el número que compara dos
emplazamientos sin pasar por la moneda— son los **metros cúbicos de tierra por
metro cúbico de agua**.

**Lo que queda de represa** es `PLAN-embalse-vaso-real.md`, que es otra cosa y
más grande: el vaso tiene que salir del muro y del terreno (Priority-Flood) en
vez del polígono dibujado, con la cota de derrame como límite. Ese plan tiene su
propio orden de cinco pasos y uno de ellos es mostrar los dos resultados en
paralelo para validar con predios reales antes de cambiar el número que ve el
usuario, así que no se cierra de un empujón.

### Etapa F — Cuatro piezas chicas que se usan siempre ✅ *03/10/2026*

Hecha. Cuatro módulos nuevos —`lib/alcantarilla.ts`, `lib/electrificador.ts`,
`lib/manguera.ts`, `lib/ventosas.ts`—, tres bloques de interfaz colgados de
paneles que ya existían, y **una corrección a `hidraulica.ts` que apareció
leyendo la norma**.

**1 · Alcantarillado de un cruce de camino.** La fuente es el manual estándar
del mundo entero para esto: FHWA (2012), *Hydraulic Design of Highway Culverts*,
HDS-5, 3.ª edición, con las regresiones del National Bureau of Standards. Lo que
hay que entender antes del número es que una alcantarilla tiene **dos formas de
ahogarse y hay que calcular las dos**: que la boca no deje entrar el agua
—control de entrada, donde el largo y la rugosidad del caño **no cambian nada**—
o que el caño no la pueda sacar —control de salida, donde sí pesan—. Manda la
peor, y es la razón por la que un caño que «da bien» por una cuenta rebalsa el
camino. acequia informa cuál ganó, porque la decisión de obra cambia: si manda la
entrada se mejora la boca, y si manda la salida se agranda el caño.

El ejemplo resuelto de la guía de diseño 1 del manual quedó como test, y cierra:
para Q = 5,663 m³/s en un caño de 60,96 m al 1 %, el de 54″ con campana da 7,92
pies de carga contra los 7,9 que publica el propio programa HY-8 de la FHWA, y el
de 60″ da 6,70 contra 6,8. La alternativa métrica aceptable que publica el manual
—1.500 mm de hormigón con campana— es la que elige acequia, con el control de
entrada gobernando, igual que el manual.

Dos cosas que salieron de paso y valen por separado:

- **La boca vale más que el diámetro.** El coeficiente de pérdida de entrada va
  de 0,2 en una campana a 0,9 en un caño de chapa asomando del terraplén: un
  factor 4,5 por una obra de cabecero. Está en pantalla como una lista de bocas y
  no como un parámetro escondido.
- **La velocidad de salida no es la de sección llena.** Cuando manda el control
  de entrada el caño va parcialmente lleno, y la velocidad con la que el agua
  sale es la del tirante normal. En el ejemplo publicado son 4,8 m/s contra 3,2
  de sección llena: usar la de sección llena **subestima un tercio** justo el
  número con el que se decide si hay que proteger la salida contra socavación.
  acequia resuelve el tirante normal por Manning y reporta las dos.

**2 · Electrificador.** Cuatro fuentes: la especificación de obra del NRCS
(Fence, código 382), «Electric Fencing for Serious Graziers» del NRCS de Missouri
(Kurtz y Frey, 2005), la hoja de extensión de Virginia Tech (Booher, 2025) y la
del Ontario Forage Council (2018). **Y dos de ellas se contradicen justo en lo
que más plata mueve.** Virginia dice que los hilos no suman joules —*«multiple
connected wires reduces resistance and improves energizer function»*— y Ontario
dice que cinco hilos en cinco millas son veinticinco millas de alambre. No es que
una esté equivocada: Virginia habla de la **resistencia del conductor** (hilos en
paralelo, cuatro hilos es un cuarto de resistencia) y Ontario de la **fuga**
(cuatro hilos son cuatro veces más aisladores y cuatro veces más pasto tocando).
Cuál manda depende de la vegetación. acequia no elige: muestra las dos cotas,
dice de quién es cada una y recomienda la mayor.

Cruzar las dos reglas da un resultado que ninguna de las dos publica y que
ordena la decisión: **cuántos hilos hacen falta para que los hilos empiecen a
gobernar depende sólo de la vegetación** — con el alambre limpio hacen falta
siete, con algo de pasto cuatro, y con el alambre cargado dos. Está en un test.

Lo que de verdad arruina alambrados eléctricos no es el equipo, y por eso se
reportan tres criterios separados —se arreglan con tres compras distintas—:

- **La puesta a tierra, que nadie calcula.** El circuito se cierra por el suelo:
  si el suelo no conduce, el animal no siente nada aunque el voltímetro en el
  alambre marque bien. El piso son tres varillas de 6 pies separadas 10, y la
  regla que escala es 3 pies de varilla por joule de salida. Un equipo de 14 J
  pide 12,8 m de varilla, o sea **siete varillas y no tres**.
- **El alambre, que pesa más que el equipo en una tirada larga.** De la tabla de
  resistencias de Kurtz y Frey: el polihilo de seis conductores tiene **172 veces
  la resistencia** del calibre 12,5 recomendado, y el de tres conductores casi
  284. Por eso la fuente dice textualmente que no hay que depender del polihilo
  en tramos largos. La transcripción de esa tabla se verificó contra la frase de
  control de la propia fuente —*«16-gauge wire is 2.5 times as resistant… as
  12.5-gauge»*, y 136,9/56,4 = 2,43—, que es un test.
- **El voltaje en la punta, que se mide y no se calcula.** Ninguna de las cuatro
  fuentes publica la conductancia de fuga de un aislador ni de un metro de pasto
  mojado, así que **nadie puede predecir** el voltaje en el extremo del
  alambrado. Lo que sí está publicado es cuánto tiene que haber: 1.600 V para
  vacunos, 2.000 para ovinos y caprinos de pelo, 1.200 para equinos. Es la misma
  asimetría que las alturas de pastoreo de la etapa C: la cuenta orienta la
  compra, la medición decide si sirve. Y el ensayo de la tierra —cortocircuitar a
  300 pies y medir la última varilla, que tiene que dar 0 y se tolera hasta
  300 V— es la única verificación publicada que existe.

**3 · Manguera móvil.** El coeficiente correcto para una manguera no es el del
caño: Tajrishy y Hills (1992), en *Applied Engineering in Agriculture*, midieron
en laboratorio C = 135 y 140 para manguera de 76 y 102 mm. acequia usaba 150 —el
catálogo del caño nuevo— y Hazen-Williams va a la potencia 1,852, así que pasar
de 150 a 135 es un **21,5 % más de pérdida** sobre la misma manguera. Está del
lado peligroso: el número de catálogo hace parecer suficiente una manguera que no
alcanza, y en una tirada de 200 m eso es la diferencia entre que llegue agua al
bebedero y que llegue un chorrito. El panel avisa cuando el C de catálogo habría
alcanzado con una medida menos, que es el momento exacto en que se compra mal.

El ensayo midió **dos** diámetros, y la mayoría de las mangueras de un predio
quedan por debajo. acequia interpola entre los dos y afuera usa el más
desfavorable de los dos medidos, en lugar de extrapolar la tendencia: un valor
extrapolado sería plausible y nadie lo midió. Las pérdidas de los acoples entran
como largo equivalente, que es exactamente la forma en que la fuente las publica.

**4 · Trampas de aire.** Una cañería que sube y baja junta aire en los puntos
altos, y la burbuja estrangula la sección: la línea pierde caudal sin que se rompa
nada y sin que haya nada que ver. La norma de cañerías de riego del NRCS (CPS 430)
da **tres criterios geométricos** que se pueden aplicar sobre un perfil, y la app
ya dibuja perfiles: ventosa en todos los puntos altos, una cada 762 m (2.500 pies)
en tramos parejos aunque no haya nada que detectar, y de doble efecto en los
quiebres hacia abajo de más de 10°. Más la precisión que ahorra plata: si en el
punto alto ya hay un bebedero o un hidrante, la salida ventea y no hace falta
ventosa.

El único número de este módulo que es de acequia y no de la norma es la
**prominencia mínima** para que una ondulación cuente como punto alto. La norma
dice «todos los puntos altos» y no la define, porque quien la escribió tenía un
plano de obra y no un modelo de elevación con ruido. Sobre un DEM de 30 m,
marcar quince ventosas falsas es peor que no marcar ninguna —una lista de quince
no la cree nadie—, así que está declarado como criterio propio, es un parámetro
visible, y con un DEM de dron se baja.

**5 · Lo que apareció sin buscarlo: dos números sin fuente en `hidraulica.ts`.**
Leyendo la norma 430 para la manguera aparecieron dos límites que acequia venía
poniendo de pulgar, los dos del lado optimista:

- la **velocidad máxima** estaba en 2,0 m/s y la norma la pone en **1,52 m/s**
  (5 pies/s) a sección llena *«in pipelines with valves or some other flow
  control appurtenance… at the downstream end»*. No es por fricción: es por el
  golpe de ariete al cerrar. Toda línea que termina en una canilla o en un
  bebedero con flotante cae en esa condición, o sea casi todas;
- la **presión de trabajo admisible** era el 91 % de la nominal del caño (margen
  1,1) y la norma deja usar el **72 %** *«as a safety factor against surge»*, o
  sea un margen de 1,39.

Los dos quedaron corregidos con la cita al lado. Cambia lo que la pestaña Red de
servicios recomienda —30 m.c.a. pasaron de pedir PN4 a pedir PN6— y es más caro:
es lo que dice la norma. El test que fijaba el valor viejo se actualizó
explicando qué cambió y por qué, y quedó un segundo test que comprueba que
pasando el margen viejo a mano se obtiene lo de antes, así que el cambio es sólo
del valor por defecto.

**Un error propio que vale anotar**, porque es de la familia que este repositorio
caza con tests: la primera versión de `diametroAlcantarilla` llamaba a
`tiranteNormal(caudal, diámetro, …)` cuando la firma era `(diámetro, caudal, …)`.
Dos números, las dos del mismo tipo, y el resultado era una velocidad de salida de
11,4 m/s en lugar de 5,1 — alta, alarmante y perfectamente plausible. Lo cazó el
test del caso resuelto. La función pasó a recibir un objeto con los campos
nombrados para que no pueda volver a pasar.

### Etapa G — Clima: el balance hídrico mensual y la variabilidad

La app tiene precipitación y ETP mensuales. Falta el **balance hídrico mes a mes**
—el excedente y el déficit, que es lo que dice cuándo se puede sembrar y cuándo
hay que tener agua guardada— y la **variabilidad entre años**, que es más
importante que el promedio: un predio con 800 mm de promedio y una desviación
grande se diseña distinto de uno con 800 mm parejos. El dato de serie larga ya
está cargado.

### Etapa H — Zonificación, estructuras y bioconstrucción

- La **zonificación** como ejercicio guiado, no como un dibujo libre: la app ya
  tiene zonas y el motor de master plan.
- **Emplazamiento de estructuras** con tabla de puntaje y zonas de exclusión:
  pendiente, orientación, acceso, distancia al agua, y el buffer que corresponde a
  cada cosa.
- **Bioconstrucción según el clima**: qué técnica es razonable en cada clima de
  Köppen. La app ya clasifica el clima del predio y ya muestra su deriva. La
  elección de técnica tiene bibliografía regional publicada por clima y es un
  relevamiento, no un cálculo.
- **Aleros**, que salen de la latitud y de la altura solar que la app ya calcula.

### Etapa I — Validar los patrones de cultivo solos

Una vez corregida la geometría (1.3), la app puede **auto-validarse**: verificar
por triángulos que las guías realmente drenan hacia donde dicen, y reportar la
pendiente fila por fila en lugar de un promedio. Es la clase de verificación que
convierte una herramienta de dibujo en una de diseño.

### Etapa J — Los entregables

Lo que el productor se lleva. La app ya emite informe y plano; falta:

- el **modelo declarado**: qué se asumió, con qué datos y con qué incertidumbre;
- la **planilla junto al plano**, que es como se trabaja en el campo;
- la **lista de materiales** con estado por renglón: Necesario / Repuesto /
  Pedido;
- el **pedido de relevamiento**: qué tiene que ir a medir el productor para que el
  siguiente cálculo sea mejor. Es lo que convierte una entrega en un ciclo.
- el **master plan por etapas**, que ya existe parcialmente.

---

## 3. En qué orden

1. ~~**Etapa B** —el agua del ganado—~~ **hecha el 02/10/2026.**
2. ~~**Etapa A** —modulación—~~ **hecha el 02/10/2026.**
3. ~~**Etapa C** —menú de manejos—~~ **hecha el 02/10/2026.**
4. ~~**Etapa F** —las cuatro piezas chicas—~~ **hecha el 03/10/2026**, y de paso
   corrigió dos números sin fuente de `hidraulica.ts` que ninguna etapa había
   mirado.

5. ~~**Etapa E** —la represa—~~ **hecha el 03/10/2026.** Abrió el manual de
   pequeñas represas del USDA y encontró **seis números del muro por debajo del
   mínimo publicado**, todos del lado barato, más uno que no era de cantidad sino
   de criterio: la cota del coronamiento le faltaba la carga de la crecida sobre
   el vertedero, que acequia ya calculaba en otra pestaña.

6. **`PLAN-embalse-vaso-real.md`** — **pasos 1 y 2 hechos el 03/10/2026**: el
   vaso ya sale del muro y del terreno (Priority-Flood, `lib/vaso.ts`), con la
   cota de derrame, el punto por donde se derrama marcado en el mapa y la
   profundidad contra el muro. El panel muestra los dos cálculos juntos y
   escribe la diferencia, que es el paso que **no puede cerrar el cálculo**: el
   paso 3 —que el vaso real pase a ser el número principal— necesita que Jonatan
   lo valide contra predios que conozca. Quedan abiertos también el paso 4
   (`dimensionarMuro` con `profEnMuro_m`) y el 5 (la simulación anual leyendo el
   área del espejo de la curva), los dos a la espera del 3.
7. ~~**La corrección 1.3** —keyline—.~~ **✅ 04/10/2026.** Entró con migración por
   versión y con aviso: un patrón guardado con los criterios viejos no se
   redibuja solo y la pantalla explica por qué no le muestra veredicto. Aparecieron
   dos defectos que el plan no preveía —la métrica medía lo contrario de lo que
   el método busca, y el suavizado daba vuelta la deriva— y los dos los encontró
   un test. Queda abierto el trabajo en dos mitades de una vertiente angosta.

8. ~~**La corrección 1.4** —el lado del muro y el del vertedero—.~~
   **✅ 04/10/2026.** El plan pedía la función correcta con los criterios del
   otro lado: los dos que citaba son los del vertedero, no los del cierre.
   Entraron las dos decisiones con sus criterios, y apareció un piso publicado
   que el enunciado no tiene —**más plano no es mejor**, un estribo casi
   horizontal no drena— y un número plausible y equivocado que el test encontró:
   los lados que no embalsan nada daban la mejor relación de todas. Queda
   abierto leer la carga sobre el vertedero del cuadro 10 con la pendiente del
   estribo elegido, que cierra esto con la etapa E.

9. ~~**La corrección 1.5** —la simultaneidad entre viviendas—.~~
   **✅ 04/10/2026.** Con las cinco correcciones del material del curso cerradas
   quedan sólo la 1.1 y la 1.2, bloqueadas en la tabla de agua por temperatura.
   Lo que apareció acá es lo mismo de siempre: la fórmula que el apartado daba
   por «una línea de código» tiene un **piso publicado** del que se escapa a
   partir de 12 viviendas, y con 50 dimensiona el caño para la mitad del agua.

Las etapas D, G, H, I y J después, en ese orden.

---

## 4. Lo que queda sin fuente, anotado para no olvidarlo

**El hueco que esta sección anunciaba se cerró el 02/10/2026**, y vale contar cómo,
porque es el patrón a repetir. El atajo sin respaldo era «la bebida se concentra
en 4 a 6 horas según la distancia al bebedero». Buscando la fuente aparecieron dos
**normas de diseño publicadas** del servicio de conservación de suelos de Estados
Unidos que no dan una cantidad de horas: dan el mecanismo. Lo que elige el caño es
cuántos animales beben a la vez —5 % del rodeo si hay agua en cada potrero, 10 % si
el bebedero es uno solo— por el caudal al que bebe cada uno, 2 GPM. La distancia
entra decidiendo cuál de los dos casos es, con un umbral publicado de 604 m.

El mecanismo es mejor que el atajo porque se puede discutir: alguien puede decir
«en mi campo llegan de a poco aunque el bebedero esté lejos» y mover ese
parámetro. Con «4 a 6 horas» no hay nada que mover.

**Lo que queda abierto ahora, en orden de cuánto mueve:**

1. **`prodForrajera` no tiene fuente, y es el número más grande de la cadena.**
   Es una escalera de cinco escalones por precipitación anual —700, 1.500, 3.000,
   5.000, 7.000 kg MS/ha/año— y multiplica absolutamente todo: la receptividad,
   la carga objetivo, el rodeo y el agua de la represa. Lo mismo vale para
   `forrajePorLluvia` de `pastoreo.ts`, que es una copia, y para el
   `forraje_sugerido` de `cobertura.ts`, que pondera kg/ha por clase de
   WorldCover sin fuente. **Es la deuda más grande que queda en toda la cadena
   ganadera**, y ya van **tres etapas seguidas** que chocan contra
   ella: bloquea la carga objetivo por ambiente de la etapa A, bloquea el reparto
   de parcelas por comida y no por superficie de la etapa C —que es una regla
   textual de la fuente y no un refinamiento— y le pone el techo de precisión al
   balance forrajero entero. Sin producción de forraje por ambiente no hay carga
   por ambiente ni parcelas igualadas por comida. La
   fuente a abrir son los mapas de productividad primaria neta de pastizales y
   las series de producción de materia seca de los organismos de investigación
   agropecuaria regionales; es un relevamiento, no una fórmula, y es del tamaño
   de una etapa propia.
2. **El descuento por humedad del forraje.** La tabla de consumo es de agua
   **total**: incluye la que viene en el pasto, y un pasto vegetativo tiene 65 a
   80 % de agua. Hoy la app usa el total, que sobredimensiona la represa, y es la
   decisión correcta por defecto. Para que el descuento entre hace falta la fuente
   de materia seca del forraje por estado fenológico —hay una tabla publicada en
   la misma publicación de Kansas— y, sobre todo, que la app sepa en qué estado
   está el pasto de ese predio en cada mes. Lo segundo es más difícil que lo
   primero.
3. **El equino y el caprino no tienen fuente de consumo.** La publicación de NDSU
   trae una tabla de equinos del NRC de caballos (2007), pero es de nueve filas
   con niveles de actividad y temperaturas sueltas, no una curva, y acequia no
   tiene el concepto de nivel de actividad. Para el caprino no encontré tabla de
   consumo. Los dos conservan lo declarado y lo dicen en pantalla.
4. **El carnero declara 8 L/día y el rango publicado llega a 7,6.** Está apenas
   afuera. No lo cambié porque un litro no mueve ninguna decisión, pero queda
   anotado: es el tipo de cosa que aparece sólo cuando uno va a la fuente.
