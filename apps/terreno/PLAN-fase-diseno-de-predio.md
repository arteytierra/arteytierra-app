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

### 1.3 El patrón keyline hace el offset desde donde la fuente dice que no

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

**Fuente a abrir:** la literatura de geometría de patrones keyline, y la tabla
comparativa de métodos de trazado del manual de agricultura regenerativa que la
sistematiza —la que reporta qué fracción de la superficie queda efectivamente
drenada con línea guía contra contorno puro, y la diferencia es grande—.

### 1.4 El lado del muro: la app pregunta y podría recomendar

El paso que elige de qué lado del espejo va el muro hoy se pregunta a ciegas. Los
dos criterios que deciden son **menor pendiente del eje** y **menor recorrido
hasta el cauce**, y los dos salen del DEM que la app ya tiene cargado. Puede
sugerir el lado y explicar por qué, dejando que el usuario lo cambie.

### 1.5 Falta el coeficiente de simultaneidad de un conjunto de viviendas

El dimensionamiento de la red de agua usa el coeficiente de una vivienda. Para un
conjunto de `N` viviendas el coeficiente es otro y es el que hace que una red de
diez casas no se dimensione como diez redes de una. La expresión clásica de la
hidráulica sanitaria es:

```
KE = (19 + N) / (10 · (N + 1))
```

Hay que abrir la norma o el manual de hidráulica sanitaria que la publica, porque
hay variantes según el país y el tipo de consumo.

---

## 2. Las etapas

### Etapa A — Modulación ganadera *(la que destraba todo lo demás)*

El rodeo ya se carga por categorías con su equivalente vaca y su fuente
(`lib/categorias.ts`, cerrado el 02/10/2026). Lo que falta es lo que se hace con
eso: **partir el campo en módulos de pastoreo**.

Lo que entra:

- **Superficie efectiva**, no total: se descuentan los caminos, las cañadas, los
  afloramientos y lo inundable. La app ya conoce buena parte de eso por cobertura
  y relieve.
- **Carga objetivo por ambiente**, no una sola para todo el predio: un bajo dulce
  y una loma arenosa no sostienen lo mismo, y la app ya distingue ambientes.
- **Rodeo máximo manejable**, de donde sale el número de módulos: el tamaño de
  rodeo lo limita el manejo —el agua, el encierre, la mano de obra—, no el pasto.
- Los **criterios de emplazamiento** de cada módulo: acceso, agua, forma, y que la
  cantidad de módulos sea **la menor posible** que cumpla el manejo. Cada
  subdivisión es alambre, es portón y es recorrido.

El criterio de diseño que vale la pena escribir en el código: **holgados en la
carga objetivo, estrictos en todo lo demás.** La carga tiene un rango real de
incertidumbre —la app ya lo publica— y apretarla es donde se pierde el campo.

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

### Etapa C — Pastoreo: el menú de manejos

La relación que gobierna el pastoreo rotativo es aritmética y se puede derivar sin
tabla ajena:

```
descanso = ocupación × (parcelas / parcelas_por_cambio − 1)
```

Con eso la app puede ofrecer un **menú de manejos** para la misma cantidad de
parcelas: cuántos días de ocupación, cuántos de descanso, y qué exigencia le pone
al animal. Lo que agrega criterio por encima de la aritmética:

- se diseña para el **descanso promedio**, no para el mejor mes;
- una **reserva del 5 al 10 %** de la superficie como fusible del año seco;
- **etapas de intensificación**: no se subdivide todo de una, se subdivide en
  etapas que el productor pueda pagar y manejar;
- las parcelas se igualan **por comida**, no por superficie: la parcela mejor
  lleva alrededor de un 10 % menos de hectáreas, y la forma importa —una parcela
  muy alargada se pastorea desparejo—.

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

### Etapa E — Represa: las tablas de diseño y la comparación de candidatos

El cálculo de embalse y de muro ya existe y es bueno. Lo que falta:

- las **tablas de diseño publicadas** de pequeñas represas de tierra —ancho de
  coronamiento, taludes y revancha según la altura del muro y la clase de suelo—
  en `lib/criterios.ts`, que hoy tiene parte de eso. **Fuente a abrir:** el manual
  clásico de diseño y construcción de pequeñas represas de tierra.
- el rango razonable de **profundidad útil** del vaso, que es lo que decide si el
  agua llega a fin de verano sin calentarse ni evaporarse de más;
- la **evaporación del espejo**, que no es la ETP de referencia: hay factores
  publicados para pasar de tanque a espejo libre, y hay un truco de diseño real
  —subir la cota y reducir la superficie para el mismo volumen— que la app puede
  cuantificar sola;
- y la pieza que **ningún competidor tiene**: comparar candidatos de embalse por
  cota, con el costo por metro cúbico de agua almacenada.

**Lo primero de esta etapa ya está hecho** (02/10/2026): la pestaña Represa ahora
**archiva** cada represa calculada con sus parámetros y sus números, y las ordena
por agua embalsada sobre tierra movida. Antes recalculaba arriba de la anterior y
comparar obligaba a anotar en un papel. Ver `lib/represasGuardadas.ts`.

Esta etapa va junto con `PLAN-embalse-vaso-real.md`.

### Etapa F — Cuatro piezas chicas que se usan siempre

Son chicas, son independientes entre sí, y ningún competidor las tiene juntas:

1. **Alcantarillado de un cruce de camino.** La sección necesaria sale de una
   fórmula publicada en función de la cuenca de aporte y de la lluvia, y la app ya
   delinea esa cuenca. De la sección sale el diámetro del caño.
2. **Electrificador.** No se elige por un solo criterio: hay que satisfacer a la
   vez la longitud de alambre, la cantidad de hilos y la vegetación que lo toca.
   Tres criterios simultáneos, y el que manda es el peor de los tres.
3. **Manguera móvil.** Dimensionarla con la pérdida de carga real —la app ya tiene
   el motor hidráulico— en lugar de la tabla de pulgar. El coeficiente de rugosidad
   que reproduce las tablas de uso agropecuario es más conservador que el del caño
   nuevo de catálogo, y eso hay que decirlo.
4. **Trampas de aire.** Un perfil de cañería con un punto alto intermedio junta
   aire y se tapa. La app ya dibuja perfiles de terreno: puede **detectar** el
   punto alto y avisar que ahí va una ventosa.

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
2. **Etapa A** —modulación— es la que sigue: desbloquea pastoreo y agua.
3. **Etapa C** —menú de manejos— tercero, porque es aritmética más criterio y
   depende de A.
4. **Etapa F** —las cuatro piezas chicas— en cualquier momento: son
   independientes y cada una es media jornada.
5. **Etapa E** junto con `PLAN-embalse-vaso-real.md`.
6. **La corrección 1.3** —keyline— cuando haya tiempo de hacerla con migración y
   aviso. Es la única que puede romperle el dibujo a un proyecto guardado.

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

**Lo que queda abierto ahora es otra cosa, y más chica:**

1. **El descuento por humedad del forraje.** La tabla de consumo es de agua
   **total**: incluye la que viene en el pasto, y un pasto vegetativo tiene 65 a
   80 % de agua. Hoy la app usa el total, que sobredimensiona la represa, y es la
   decisión correcta por defecto. Para que el descuento entre hace falta la fuente
   de materia seca del forraje por estado fenológico —hay una tabla publicada en
   la misma publicación de Kansas— y, sobre todo, que la app sepa en qué estado
   está el pasto de ese predio en cada mes. Lo segundo es más difícil que lo
   primero.
2. **El equino y el caprino no tienen fuente de consumo.** La publicación de NDSU
   trae una tabla de equinos del NRC de caballos (2007), pero es de nueve filas
   con niveles de actividad y temperaturas sueltas, no una curva, y acequia no
   tiene el concepto de nivel de actividad. Para el caprino no encontré tabla de
   consumo. Los dos conservan lo declarado y lo dicen en pantalla.
3. **El carnero declara 8 L/día y el rango publicado llega a 7,6.** Está apenas
   afuera. No lo cambié porque un litro no mueve ninguna decisión, pero queda
   anotado: es el tipo de cosa que aparece sólo cuando uno va a la fuente.
