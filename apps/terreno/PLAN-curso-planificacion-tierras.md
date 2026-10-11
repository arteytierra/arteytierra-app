# Plan: lo que el curso de Planificación de Tierras le agrega a acequia

> **Reemplazado el 02/10/2026 por [`PLAN-fase-diseno-de-predio.md`](./PLAN-fase-diseno-de-predio.md).**
>
> Este documento queda como registro de cómo se llegó a la lista de trabajo, pero
> **el plan que se ejecuta es el otro**, y hay dos diferencias que importan:
>
> 1. **Ninguna cita ni pedido de permiso a terceros.** La sección 4 de acá dejaba
>    abierta la decisión de citar al autor o pedirle autorización. Esa decisión ya
>    se tomó: no se cita a nadie y no se pide nada. Cada número entra a la app
>    desde su **fuente técnica primaria publicada**, abierta y leída por nosotros,
>    y esa es la fuente que se escribe en el código.
> 2. **Los tres criterios sin respaldo publicado no se usan.** Acá quedaban como
>    una decisión pendiente; en el plan nuevo están descartados, y dos de los tres
>    resultaron ser atajos que la app puede calcular mejor que la regla de pulgar.
>
> Si los dos documentos se contradicen, manda el nuevo.


Leí las 20 presentaciones del curso. El relevamiento clase por clase, con los números y
las fórmulas, está en `_research/curso-planificacion-tierras/`.

Este documento es la traducción de ese material a trabajo concreto sobre la app: qué
confirma, qué corrige y qué agrega, en orden de lo que más mueve la aguja.

---

## 0. Lo primero: el curso y acequia son el mismo producto

El curso **se da en Google Earth** porque, dice textualmente la clase 5, aprender un GIS
llevaría demasiado tiempo. Y admite lo que eso cuesta: *"Google Earth no soporta modelo de
elevación… no podremos extraer curvas, drenajes, cuencas, modelar."*

Eso es exactamente lo que acequia hace. **acequia es el GIS que el alumno de ese curso no
tiene que aprender.** No es una analogía: la lista de ejercicios del curso —delimitar la
cuenca de un punto, sacar el perfil de un camino, calcular la captación de un embalse,
dimensionar la telescópica de una red, contar las parcelas de un módulo— es, una por una,
una pestaña de `/mapa` o una que debería existir.

Y hay un segundo hallazgo, más chico pero más útil: **el curso sigue la Plataforma
Regrarians y el riel de `/mapa` ya sigue el mismo orden**. Clima → Geografía → Agua →
Accesos → Ecosistema → Estructuras → Subdivisiones → Suelo → Economía. Los cinco grupos
del riel caen encima de esas capas sin forzar nada. No hay que reorganizar: hay que llenar.

### Lo que no es nuestro

Las diapositivas, los planos de los proyectos de sus clientes y la redacción del curso son
del autor. No se copian. Lo que sí se usa es **la fuente primaria que el curso cita**, que
en casi todos los casos es un libro o un paper identificable: Nelson 1985 para represas, el
Regrarians Handbook para alcantarillado y coeficientes de cultivo, Winchester & Morris 1956
/ NASEM 2016 para el agua del ganado. Eso además es lo que pide la skill `motor-de-calculo`:
fuente con nombre propio. Donde el curso dice "criterio propio" y no hay respaldo publicado,
está marcado abajo como tal y la decisión de usarlo o no es de Jonatan.

---

## 1. Las cinco correcciones

Esto no es "agregar features". Es material que dice que algo que hoy hacemos está
incompleto o mal.

### 1.1 El agua del ganado no es un número fijo por cabeza — es energía y temperatura

Hoy `lib/rodeo.ts` guarda `litros_animal_dia` y arranca del valor de tabla de
`TIPOS_ANIMAL`: bovino adulto 50 l/día, joven 30, equino 50. Ese número después alimenta el
balance de la represa (`demandaMensual_m3`) y la hidráulica.

La clase 8 muestra que **ese número no existe**. El consumo sale de la tabla de Winchester &
Morris (1956) adaptada en NASEM (2016), y lo que la hace generalizable es esta fila:

| Temp. media (°C) | 4,4 | 7,2 | 10,0 | 12,2 | 14,4 | 17,8 | 21,1 | 23,9 | 26,6 | 29,3 | 32,0 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **litros de agua por kg de materia seca ingerida** | 3,1 | 3,2 | 3,3 | 3,6 | 3,8 | 4,2 | 4,5 | 4,8 | 5,2 | 6,3 | 7,3 |

De 4,4 a 32 °C el consumo **se multiplica por 2,35**. Un rodeo de 40 bovinos a 50 l/día son
2.000 l/día mire el termómetro lo que quiera: en Capilla del Monte en enero y en Esquel en
julio, el mismo número. La app ya sabe la temperatura media mensual del predio y acaba de
aprender a calcular los kg de materia seca por día (`consumoEV_kgMS_dia`, de la auditoría del
equivalente vaca). **Las dos piezas están y no se hablan.**

Es el mismo error que acabamos de corregir en el equivalente vaca, en el otro extremo de la
misma cadena: ahí el problema era un `8` de kg de pasto aplicado a todo el planeta, acá es un
`50` de litros aplicado a todo el planeta. Y es más grave, porque el agua no se negocia:
quedarse corto en el embalse no es un informe optimista, es hacienda sin beber en enero.

La clase da además la tabla en **porcentaje del peso vivo** (promedio 7% a 4,4 °C → 11% a
23,9 °C; máximo 10% → 15%), y el procedimiento completo de los cuatro números que hay que
calcular siempre: **consumo anual, de seca, del día pico e instantáneo (caudal)**.

### 1.2 El caudal de pico no es el consumo diario dividido 24

La clase 8 insiste: *"el consumo de agua en días de calor se concentra en pocas horas"*. El
criterio que usan —marcado por el autor como propio— reparte así:

| Distancia máxima al bebedero | Horas en las que se concentra la bebida |
|---|---|
| 100 a 250 m | 6 |
| 250 a 800 m | 5 |
| 800 a 1600 m | 4 |

Caudal = consumo del día pico ÷ esas horas. En el ejemplo, 45.360 l del día pico con 800 m de
distancia dan 2,52 l/s; dividido 24 h darían 0,52 l/s, **cinco veces menos**. Y el caudal es
lo que elige el diámetro de los caños, que es lo que cuesta la plata.

Hoy `lib/hidraulica.ts` recibe un caudal y lo resuelve bien. Lo que no hay es quién calcule
ese caudal desde el rodeo. Y acequia **ya conoce la distancia al bebedero**: la calcula
`lib/potreros.ts` cuando ubica los bebederos con su radio de cobertura.

El curso agrega también un piso de contraste (7 l/hora por UG de 380 kg, bibliografía
uruguaya) que usan "para tener una noción de cuánto nos estamos desviando". Eso es
exactamente lo que hace `saludCalculo.ts`: dos métodos, y si no coinciden se avisa.

### 1.3 El keyline: estamos haciendo el offset desde donde la fuente dice que no ✅ *04/10/2026*

> Hecha. `lib/keylineGeometria.ts` + `lib/keyline.ts`, 62 tests. Las cuatro cosas de este
> apartado entraron —directriz simplificada en vez de la curva cruda, headland, giro máximo,
> límite de pendiente— y además aparecieron dos defectos más de fondo: la métrica premiaba la
> deriva cerca de cero, que es el mecanismo del método medido al revés, y el suavizado por
> corte de esquina daba vuelta la deriva en cuanto la directriz quedaba simplificada. El
> detalle completo está en `PLAN-fase-diseno-de-predio.md`, §1.3.

`lib/keyline.ts` genera el patrón con *"líneas paralelas a la curva por el keypoint"* y, en
`generarPatronCultivo`, *"líneas paralelas a espaciado fijo"*. El folleto de Georgi Pavlov
(HUMA), con prólogo de Darren Doherty, dice literalmente lo contrario:

> **No desplazar directamente de las curvas de nivel**, en lugar de eso desplazarse desde un
> perfil libre y simplificado de un contorno que solo considere las formas principales del
> terreno.

La razón es geométrica y está explicada: una curva es *"una multitud de líneas rectas unidas
entre sí, cada ángulo con su propia trayectoria"*, así que copiarla produce formas que no se
pueden predecir ni manejar con una máquina. Por eso trabajan con **líneas guía triangulares**
y recién al final redondean.

Y hay tres cosas más que el patrón de hoy no sabe:

- **Headland**: 2 a 4 veces el ancho de la maquinaria (máquina de 5 m → franja de 10 a 20 m),
  en el borde del área y **también entre conjuntos de patrones**. Hoy el patrón llega hasta
  el alambrado y la máquina no tiene dónde girar.
- **El ángulo máximo de giro de un tractor es 50-55°.** Un patrón con un vértice de 30° es
  indibujable a campo. El folleto además da la salida: entre líneas paralelas la distancia en
  los ángulos es mayor que entre los rayos, así que **se pueden redondear los vértices sin
  romper la equidistancia**.
- **Arriba de 20° de pendiente el patrón Keyline puede no corresponder** y conviene ir
  perpendicular a las curvas.

Y una corrección conceptual que simplifica el código en vez de complicarlo: *"los keypoints
se volvieron irrelevantes para crear la geometría Keyline"* gracias al software; siguen
importando sólo para **ubicar cuerpos de agua**. El keypoint que `analizarKeyline` calcula
(la rodilla del perfil) está bien y sirve — para la represa, no para el patrón.

### 1.4 El lado del muro: la app ya pregunta, pero puede recomendar ✅ *04/10/2026*

> Hecha. `lib/ladoDeObra.ts` + sección 11 de `lib/represaDiseno.ts`, 42 tests. Y con una
> corrección a este apartado: **los dos criterios que anoté acá son los del vertedero, no los
> del muro.** En las notas de la clase 9 están bajo «Vertedero · De qué lado», y el método en
> 6 pasos los ubica en el paso 3. Para el cierre la misma clase da otros, que ahora también
> entraron: la relación de almacenamiento (m³ de agua por m³ de tierra movida), la relación
> entre el largo del muro y el del espejo, y la ventana de profundidad natural de 2,5 a 5,5 m.
> Lo que apareció leyendo AH-590 es que «menor pendiente» tiene **piso**: el cuadro de
> vertederos naturales arranca en 0,5 % y el canal de entrada pide 2 %, así que el estribo más
> plano puede ser el que no drena. El detalle completo está en
> `PLAN-fase-diseno-de-predio.md`, §1.4.

Ayer agregué el paso que obliga a elegir de qué lado va el muro antes de calcular. La clase 9
da los dos criterios con los que esa elección se toma, y los dos son calculables desde el DEM:

1. **El lado con menor pendiente.**
2. **El lado con menor recorrido para volver al cauce.**

Así que el paso 3 de `CutFillPanel` puede dejar de ser una pregunta a ciegas y pasar a decir
"sugerimos este lado porque tiene 4% contra 11% de pendiente y 60 m contra 180 m de vuelta al
cauce", dejando que el usuario elija el otro igual. Es el patrón que ya usa toda la app:
recomendar con el porqué, no imponer.

### 1.5 Falta el coeficiente de simultaneidad entre viviendas ✅ *04/10/2026*

> Hecha. `lib/artefactos.ts` + el campo de viviendas en `RedServiciosPanel`, 41 tests. **No
> era una línea de código:** la fórmula tiene un piso publicado, `Kv ≥ 0,25`, y la expresión
> sola se le va por abajo a partir de 12 viviendas —con 50 da 0,135 contra 0,25, un caño para
> la mitad del agua—. También apareció que el coeficiente es para viviendas **iguales** (ocho
> cabañas más la casa principal son dos conjuntos, no uno de nueve), que el umbral de la
> fuente está en 10 y las diez cabañas del ejemplo caen justo en el borde, y que el `Kv`/`Ke`
> de este apartado estaba con los nombres invertidos: Kv es el de entre viviendas. El detalle
> completo está en `PLAN-fase-diseno-de-predio.md`, §1.5.

`lib/artefactos.ts` tiene bien el de una vivienda: `Kv = 1/√(n−1)` (NF P 41-201), el mismo que
usa el curso. Lo que no está es el de **un conjunto** —un loteo, cabañas, las casas del
personal—, que no es el mismo coeficiente aplicado dos veces:

```
KE = (19 + N) / (10 · (N + 1))        QmaxE = KE · N · Qvivienda
```

Para 10 cabañas: KE = 0,26 → 1,3 l/s, que son *"seis personas y media duchándose al mismo
tiempo"*. Es una línea de código y abre el caso "fraccionamiento", que hoy la app no resuelve.

---

## 2. Las piezas nuevas, ordenadas

### Etapa A — Modulación ganadera y categorías *(esto es la Etapa 2 que ya estaba aprobada)*

El curso trae el algoritmo entero y, mejor todavía, **los coeficientes verificados contra su
propia planilla resuelta**. Del "ejercicio de categorías cada 100 vacas":

| Categoría | Cabezas por 100 vacas | UG cada una | UG | % del total |
|---|---|---|---|---|
| Vacas | 100 | **1,00** | 100 | 70% |
| Terneras de 2º año | 26 | **0,80** | 20,8 | 14% |
| Terneras de 1er año | 29,9 | **0,65** | 19,4 | 14% |
| Toros | 2,5 | **1,30** | 3,3 | 2% |

(Verifiqué los cuatro coeficientes dividiendo las columnas de UG por las de cabezas. La
relación es 40 vacas por toro.)

El cálculo completo, que es una planilla y por lo tanto programable:

1. **Superficie efectiva a pastoreo** — y acá el curso es explícito: *no* incluye piquetes,
   enfermería ni callejones. Hoy la app calcula sobre el polígono entero.
2. **Carga objetivo por tipo de área**, distinta para cada módulo (en el ejemplo: cría 1,9 /
   terneras 2,8 / toros 0,9 UG/ha).
3. Las categorías con sus coeficientes, el % a reposición propia y la relación vaca/toro
   → cabezas y UG por categoría.
4. **La superficie de cada módulo se pondera por su carga objetivo**, no se reparte por igual.
5. **Máximo de rodeo por categoría** (en el ejemplo 900 de cría, 1.200 de reposición, 70 de
   toros) → de ahí sale **cuántos módulos** hacen falta.

Más tres criterios que valen como texto en la app:

- **"La menor cantidad posible de módulos"**: más módulos es más trabajo diario, más
  infraestructura y más mantenimiento.
- **Holgados en la carga objetivo, estrictos en todo lo demás.** Si uno es conservador en
  todo, el sistema sale carísimo; si es estricto en todo, queda corto.
- **"¡Cuidado, las UG no son iguales en todos los países!"** (Uruguay 380 kg, Paraguay 400 kg).
  Esto encaja exactamente con la auditoría del equivalente vaca: el EV es energía, la UG es
  peso vivo, y son dos cosas distintas que hoy la app mezcla en un solo `ev: 1.00`.

Y los **cuatro criterios para ubicar los módulos**, todos calculables: necesidad de
observación (la cría cerca de la casa, por las pariciones), la topografía (un arroyo como
divisoria), la calidad de la pastura (las categorías sensibles donde más rinde) y **el agua**
—poner el punto de distribución en el encuentro de los módulos para que no haya superposición
de consumos y bajen los diámetros.

**Qué toca:** `lib/rodeo.ts` (de un animal a lotes por categoría), `lib/produccion.ts`
(`TIPOS_ANIMAL` → categorías reales), un `lib/modulacion.ts` nuevo, y migración de los
proyectos guardados. Es lo que ya estaba planificado en `PLAN-animales-y-consumo.md`, ahora
con los números de una fuente en vez de inventados.

### Etapa B — El agua del ganado bien calculada

Cerrar 1.1 y 1.2: un `lib/aguaGanado.ts` que reciba el rodeo por categorías, la temperatura
mensual que ya tiene `lib/clima.ts` y la distancia al bebedero que ya calcula
`lib/potreros.ts`, y devuelva los cuatro números del curso (anual, de seca, día pico, caudal)
con su rango de validez y el contraste de los 7 l/h/UG.

Es la etapa de mejor relación valor/esfuerzo de todo el plan: es cálculo puro, tiene fuente
publicada, corrige un error real y **le da sentido a tres módulos que ya existen**. Después de
esto, el balance de la represa y la telescópica de la red dejan de depender de un número que
el usuario adivinó.

### Etapa C — Pastoreo: el menú de manejos

`lib/pastoreo.ts` hoy calcula los potreros a partir del descanso estacional. La clase 20 da la
tabla que falta, y es la que le cambia la conversación al usuario. Con N parcelas:

```
descanso_dias = ocupacion_dias × (N / parcelas_por_cambio − 1)
```

| Manejo | Con 60 parcelas | Exigencia | Comodidad |
|---|---|---|---|
| 2 parcelas 1 día | 29 d | 0,5 | 1 |
| 3 parcelas 2 días | 38 d | 0,6 | 0,8 |
| 1 día por parcela | 59 d | 1,0 | 1 |
| 3 parcelas 4 días | 76 d | 2,6 | 0,7 |
| 2 parcelas 3 días | 87 d | 1,5 | 0,8 |
| 2 días por parcela | 118 d | 2,0 | 1 |
| 2 parcelas 5 días | 145 d | 2,5 | 0,8 |
| 3 días por parcela | 177 d | 2,3 | 1 |
| 2 grupos (rodeo partido) | 29 d | 0,3 | 0,6 |
| 3 grupos | 19 d | 0,2 | 0,5 |

(Verificada contra las planillas de N = 30, 45, 60, 70, 80 y 100.)

El punto del curso es que **una cantidad de parcelas no es un sistema de pastoreo: es un
abanico de diez sistemas posibles.** Hoy la app entrega un número de potreros; con esta tabla
entrega el abanico y deja que el productor elija según cuánto esté dispuesto a trabajar.

Con eso vienen tres cosas más:

- **La estrategia de diseño**: no diseñar para el descanso máximo ni para el mínimo, sino
  **para el promedio de los descansos**, y resolver los extremos con la reserva.
- **La reserva como fusible: 5 a 10% del sistema.** Hoy no existe el concepto.
- **Las etapas de intensificación**, que es cómo esto se implementa de verdad: 10 potreros
  fijos (descanso 54-81 d) → se dividen a la mitad, 20 parcelas (57-76 d) → alambrado móvil
  en 2, 3 o 4 con avance frontal desde el bebedero (39-79 d). Un informe que entrega las tres
  etapas con su costo es otra clase de entregable que uno que entrega "hacé 71 potreros".

Y la corrección a `lib/potreros.ts`: hoy subdivide en **área igual**, y la clase 20 dice que
en campo heterogéneo lo que se busca es **comida equivalente, no área equivalente** — se
califica cada sector con un *coeficiente de productividad* y se reparten las parcelas según
eso. También da el descuento (**área − 10%** por caminos y callejones) y las formas aceptadas
por relación de lados: cuadrada A×A, 2B×3B, C×2C y C×3C.

### Etapa D — Sombra para el ganado

Nueva y enteramente cuantificada en la clase 16. `lib/sombras.ts` hace el mapa de sombras del
relieve, que es otra cosa.

- **Mínima 3-4 m²/UG · cómoda 7 m²/UG · elegida 5-6 m²/UG** (la bibliografía dice 4 a 8).
- Al área efectiva se le suma el borde: **3-4 m de retiro del alambrado + 6 m para el giro del
  tractor** que corta el pasto.
- Forma cuadrada o rectángulo 1:2. *(El lado de un cuadrado de 0,5 ha es 71,4 m, "que a campo
  se simplifica a 70 m" — el tipo de detalle que separa un plano de una obra.)*
- **Distancia máxima a la sombra: objetivo 300 m, aceptable 600 m, en extensivo 800 m**, y se
  verifica dibujando círculos de ese radio para ver la cobertura. Con la advertencia de que
  *"la medida no es lineal, porque a veces el camino no está del lado que da acceso"*.
- Y lo mejor para nosotros: **cuántos meses hace falta sombra se lee del gráfico climático**.
  acequia tiene el clima mensual. Puede decir "en este predio la sombra es crítica en
  diciembre, enero y febrero, y de abril a octubre no hace falta".

### Etapa E — Represa: las tablas de Nelson y la comparación de candidatos

La clase 9 es un resumen de **K.D. Nelson (1985), _Design and Construction of Small Earth
Dams_**, que es la fuente primaria que le falta a `lib/cutfill.ts`. Tres tablas van derecho a
`lib/criterios.ts`, que es el lugar de la casa para "todo parámetro de diseño con rango y
fuente":

- **Ancho mínimo de cresta** por altura: H<2 → 2,5 m; 2-3 → 2,8; 3-4 → 3,0; 4-5 → 3,3;
  5-6 → 3,5; 6-7 → 3,7; 7-8 → 3,9; 8-9 → 4,0; 9-10 → 4,2.
- **Talud** por altura: H<3 → 2,0:1 interno / 2,5:1 externo; 3-6 → 2,5:1; 6-10 → 3,0:1 interno.
- **Libre bordo por largo del espejo**: <600 m → 1,0 m; 600-1000 → 1,2; 1000-2000 → 1,3;
  2000-3000 → 1,5; 3000-4000 → 1,6; 4000-5000 → 1,7. *(Con el dato honesto de que en embalses
  chicos ellos usan 0,6-0,7 m y le aclaran al cliente que la bibliografía pide 1 m.)*

Más los **cuatro criterios de cuenca** que hoy no se chequean:

1. **Máximo**: menos de 200 ha, mejor menos de 50.
2. **Mínimo (reposición)**: la cuenca tiene que traer **50% más que consumo + evaporación, y
   el doble si se puede** — sin recambio el agua se concentra y baja la calidad.
3. **Llenado**: pedir 30% de recambio anual → que no tarde más de 3 años en llenarse.
4. **Colmatación**: embalse chico en cuenca grande se llena de sedimento. *"Embalses chicos en
   cuencas chicas, grandes en cuencas grandes."*

Y el entregable que convierte el panel en una herramienta de decisión: **la comparación de
candidatos por cota**. La planilla del curso tiene, por cada cota de pelo de agua: volumen de
tierra movida (+30% de esponjamiento), largo del talud, profundidad natural máxima, volumen de
agua, espejo, **eficiencia m³ de agua por m³ de tierra**, cuenca, captación anual,
**captación/volumen**, volumen después de la evaporación, valor de la obra y **US$ por m³ de
agua**. En el ejemplo, subir la cota un metro pasa de 10,3 a 23,9 ML con 1.990 → 3.700 m³ de
tierra: el costo por m³ de agua **baja** de 1,51 a 1,21. Hoy `calcularEmbalse` responde "qué
pasa si el pelo de agua va acá". La pregunta que el productor tiene es "¿a qué cota me
conviene?", y eso es una curva, no un número.

Tres criterios más, chicos y de alto impacto:

- **Profundidad natural entre 2,5 y 5,5 m.** Menos: mala calidad y mucha evaporación. Más:
  termina en un muro de 8-9 m, *"trabajos que prefiero no hacer, hablá con un ingeniero civil"*.
  Es un aviso que el panel puede dar solo.
- **Evaporación: 2/3 de la anual** (Nelson), calibrado en Uruguay como **70% del tanque A**.
  Y el truco de diseño: buscar la capacidad ignorando la evaporación y después **subir la cota
  la altura de la evaporación proyectada**.
- **Posición en la forma**: buscar donde las curvas se mantienen paralelas largo rato o se
  cierran; si se abren rápido, hay poco espejo. Ésa es la señal que `calcularEmbalse` podría
  buscar sola para proponer candidatos, en vez de esperar que el usuario dibuje.

Esto se cruza con `PLAN-embalse-vaso-real.md`, que ya está escrito: el Priority-Flood resuelve
**dónde llega el agua**, y esto resuelve **cuánto cuesta y si la cuenca da**. Van juntos.

### Etapa F — Cuatro piezas chicas que no existen y se usan siempre

**Alcantarillado y cruces de camino.** Fórmula del Regrarians Handbook, que verifiqué contra
el ejemplo resuelto del puente (cuenca 1.242 ha, C 0,35, sección 10,5 m² → 78 mm/h):

```
A = 0,183 · C · M^0,75 · R / 100          D = 2 · √(A / π)
```

A = sección (m²), C = coeficiente de escorrentía, M = cuenca (ha), R = máxima precipitación
horaria de la vida útil (mm/h). acequia ya tiene las tres entradas: `hidrologiaPredio.ts` da
el C y la tormenta de diseño, y `cuenca.ts` el área. Y el uso más lindo es el inverso, que es
el que hizo el curso: **dada una obra que ya existe, qué lluvia aguanta**. "Este puente
aguanta 48 mm/h; si lo elevás 50 cm, 78."

**Electrificador.** Se dimensiona pidiendo **los tres criterios a la vez**: distancia máxima
en línea recta, superficie cubierta y **kilómetros totales de alambre desplegado**. Los tres
salen del alambrado que la app ya dibuja. Casos reales para calibrar: 120 km / 6,8 km /
1.720 ha → 20 J; 170 km / 7,6 km / 2.647 ha → 32 J; 100 km / 5,4 km / 1.350 ha → 10 J;
5.700 ha → 15 J con 7 jabalinas. *"Es el corazón del sistema"* y el costo es bajo contra el
resto de la instalación. Hoy la app cuenta metros de alambrado y postes, y se detiene justo
antes del número que hace que todo eso funcione o no.

**La manguera móvil.** El mejor ejemplo didáctico de todo el curso: 800 animales tomando
7.200 l/h, sistema calculado y todas las tomas con el caudal correcto; se enchufa una manguera
de 1" y 30 m al bebedero y **se pierden 24 mca** —la pérdida en 1" a ese caudal es de 80 mca
cada 100 m—. Con 2" la misma manguera pierde 0,78 m. *"No olvidar pensar qué manguera móvil se
va a usar, qué diámetro, y colocarlo en las cuentas."* `lib/hidraulica.ts` resuelve esto en
tres líneas porque ya tiene Hazen-Williams; lo que falta es que el panel **pregunte por el
tramo móvil**, porque es el que arruina los sistemas bien calculados.

**Las trampas de aire.** Las válvulas de aire van a la salida de tomas y tanques, **cada
300-500 m en terreno plano**, y sobre todo **donde la cañería sube y después baja**. Eso
último es un problema de geometría sobre el perfil del terreno, y acequia ya dibuja el perfil
de la red: puede **marcar sola los puntos altos locales del trazado** y decir "acá va una
válvula de aire". Nadie más lo hace.

### Etapa G — Clima: el balance hídrico y la variabilidad

Dos cosas que la app tiene casi armadas.

**Balance hídrico mensual del suelo.** La tabla de la clase 2 (caso Esquel): precipitación →
% de precipitación efectiva → PP efectiva → ETP → diferencia → **reserva en el suelo con tope**
→ **exceso** → **déficit**, mes a mes. `lib/riego.ts` ya hace ETc = ETo·Kc y precipitación
efectiva, y `lib/suelos.ts` da el agua útil. Lo que falta es el acumulador con tope, que es
diez líneas, y lo que se gana son tres respuestas nuevas: cuándo el suelo tiene reserva,
cuánto excedente hay **para recargar acuíferos y llenar reservorios** y cuál es la demanda
real de riego.

**Variabilidad interanual como medida de riesgo.** El curso cuenta **qué porcentaje de los
años tuvo lluvia 30% menor al promedio** (Esquel 10% de los años; otra estación 24%) y le pone
la tendencia lineal de la serie. `lib/climaExtremos.ts` ya trae la serie diaria y calcula
Gumbel. Un predio que falla uno de cada cuatro años no es el mismo que falla uno de cada diez,
y hoy los dos se ven igual en pantalla: "800 mm al año".

También sale de acá una advertencia honesta que conviene escribir: el curso usa el **evento de
lluvia máxima diaria concentrado en 90 minutos** como evento extremo, y admite que es un
criterio propio porque el dato no se consigue. Nosotros usamos `tormenta.ts` con desagregación
por duración, que es mejor. Vale compararlos en un test: si dan parecido, buena señal.

### Etapa H — Zonificación, estructuras y bioconstrucción

**La zonificación como ejercicio, no como dibujo.** `lib/zonificacion.ts` hoy guarda polígonos
con su área. La clase 7 da el método, que es una planilla: listar los espacios → asignarle
superficie a cada uno → **cuántas visitas semanales requiere** → de las visitas y el área sale
la zona → y una columna de **distancia máxima** (casa 40 m, gallinero 30 m, huerta 15 m,
forestación 50 m). Con eso acequia puede **verificar sobre el mapa** si lo que el usuario
dibujó cumple: "la huerta intensiva quedó a 120 m de la casa y necesita 18 visitas por semana".
El criterio de fondo, que es una buena frase para la guía: *lo que va más cerca es lo que
requiere más observación, más trabajo, más visitas y lo que es complejo* — y la advertencia de
que **guiarse por la fertilidad del suelo para ubicar la huerta es un error**.

**Posicionamiento de estructuras con puntaje.** La clase 18 trae un caso con los seis análisis
que acequia puede hacer sola: **70 m de retiro del límite y 50 m del camino público**, **buffer
de 15 m a cada lado de los drenajes naturales**, altimetría (evitar inundables), orientación
(laderas al norte), pendiente suave alrededor y **cuenca visual proyectada desde cada
candidato** —que ya existe en `lib/viewshed.ts`—. Y después los cuantifica en una tabla de
puntajes por candidato: accesibilidad, privacidad, orientación, presión de agua, *"para
orientar a los propietarios en una decisión que al final es subjetiva"*. `lib/masterplan.ts` ya
ubica elementos; esto le agrega los retiros, los buffers y, sobre todo, **mostrar la tabla en
vez de sólo el resultado**.

**Bioconstrucción por Köppen.** La clase 18 tiene cinco juegos de estrategias constructivas
—tropical húmedo, tropical seco-húmedo, subtropical húmedo, mediterráneo y climas fríos— y
acequia **ya calcula el Köppen del punto con Beck a 1 km**, con dos períodos y la deriva. Es
una pestaña casi gratis y encaja perfecto con lo que ya hace `koppenTexto.ts`.

**Aleros.** El criterio no es geométrico, es climático y por eso nos sirve: se elige **a partir
de qué día del año se quiere que entre el sol**, mirando la estadística de temperatura, y de
ahí sale el vuelo. acequia tiene `arco_solar.ts`, `insolacion.ts`, `sombras.ts`, `estaciones.ts`
y la temperatura mensual. Falta la cuenta inversa: de la fecha al alero.

### Etapa I — Patrones de cultivo: validarlos solos

Además de las correcciones de 1.3, la clase 17 trae dos cosas que la app puede hacer y una
persona no:

**Validación automática del patrón.** Marcar los puntos altos del patrón con triángulos
amarillos y los bajos con azules: **si los amarillos caen en el drenaje y los azules en la
divisoria, el agua se mueve en la dirección buscada.** Eso es un test geométrico sobre el DEM,
y hoy el usuario de acequia no tiene forma de saber si el patrón que generamos funciona.

**Orientación de filas con pendiente por fila.** El criterio del técnico del caso: *"orientación
ideal 340°, pendiente no superior al 12% salvo algunas filas hasta 15%"*, y se reporta **la
pendiente promedio y la máxima de cada fila**. El curso lo resolvió iterando direcciones a
mano; es literalmente un bucle. Y reporta cuando no se cumple: *"los cuadros altos… 16% de
pendiente promedio y hasta 21% de máxima, excediendo los criterios iniciales"*. Eso es la
cultura de la casa: avisar, no esconder.

Y la tabla 2.1 del Regrarians Handbook, que es el argumento de venta del keyline y hoy no está
escrito en ninguna parte de la app: contorno 55%, cuadrícula 49%, mosaico 50%, **línea clave
96%**, sobre ocho criterios ponderados (equidistancia, erosión, agua en la cresta, densidad de
cultivo, drenaje de agua, drenaje de aire, estética, simetría).

### Etapa J — Los entregables

Esto es lo que el curso vende y la app todavía no: no cálculos, documentos.

- **El "modelo"**, que es el documento que fija los criterios antes de diseñar. La clase 4 da
  el modelo de pastoreo completo —alimentación, base de pastura, pastoreo referente, cambio de
  parcelas, guiado por, mínimo y máximo reposo, período de alto y bajo crecimiento, agua,
  plan B de agua, alambrado, porteras, ancho de callejones, categorías, carga objetivo,
  reserva— y los de vivienda, agricultura y fraccionamiento. **acequia ya conoce la mitad de
  esos campos porque los calculó.** Que el informe abra con el modelo declarado cambia
  completamente qué clase de documento es.
- **El plan de pastoreo "plano-planilla"**: la rotación con fechas automáticas, el descanso
  acumulado por parcela y las intervenciones (sanitarias, destete, entore, pesaje, toros
  dentro y fuera, ajuste de carga). El curso dice por qué la planilla del Manejo Holístico no
  les sirve tal cual: *"tenemos muchas parcelas"* y *"parte de la información ya vive en el ADN
  del diseño"*. Las dos razones desaparecen si lo hace la app.
- **El listado de materiales con columnas Necesario / Repuesto / Pedido**, por etapa. La app ya
  cuenta metros de alambrado, postes, caños y piezas.
- **El pedido de relevamiento**: 2-5 cm de pixel hasta 50 ha, 5-8 cm de 50 a 500, menos detalle
  arriba de 500, con la lista de entregables. Es un texto generado, y le ahorra al usuario una
  conversación que no sabe tener con el proveedor de drone.
- **Las etapas del masterplan** (análisis → conceptualización → zonificación → bosquejo y
  chequeo → diseño en detalle → detalles de instalación → listado de materiales →
  presupuestación → informe) como estado del proyecto, en vez de pestañas sueltas.

---

## 3. Qué haría primero

Si me tengo que quedar con cuatro cosas:

1. **Etapa B, el agua del ganado por temperatura.** Corrige un error real, es cálculo puro, la
   fuente está publicada y hace que tres módulos que ya existen se hablen. Es la continuación
   natural de la auditoría del equivalente vaca que cerramos ayer: el mismo error, el otro
   extremo de la cadena.
2. **Etapa A, modulación y categorías.** Ya estaba aprobada y ahora tiene números con fuente
   en vez de inventados. Es lo que más cambia la experiencia de cargar un campo.
3. **Etapa C, el menú de manejos de pastoreo.** Una tabla verificada, poco código, y convierte
   "hacé 71 potreros" en una conversación sobre cuánto querés trabajar.
4. **Etapa F, las cuatro piezas chicas.** Alcantarillado, electrificador, manguera móvil y
   trampas de aire son cada una menos de un día y las cuatro son cosas que ningún competidor
   hace.

La E (represa) va pegada a `PLAN-embalse-vaso-real.md` y conviene hacerlas juntas, no antes.

La 1.3 (keyline) es la más delicada: toca una herramienta que ya está en producción y que la
gente usa. Antes de cambiar el offset habría que ver cuántos proyectos guardados tienen un
patrón generado, porque regenerarlo les va a mover el dibujo.

---

## 4. Lo que decide Jonatan

- **Los criterios propios del autor.** Tres de los más útiles —las horas de concentración de la
  bebida según la distancia, el evento extremo como lluvia diaria máxima en 90 minutos, y los
  criterios de tamaño de cuenca para un embalse— están marcados por él como propios, sin
  respaldo publicado. Son buenos y no los tenemos de otra fuente. Tres caminos: buscar la
  fuente que los respalde, pedirle permiso para citarlo como comunicación personal, o no
  usarlos. **Mi recomendación es pedirle permiso**: el curso fue bueno, el tipo es generoso con
  lo que sabe, y una cita con nombre propio es mejor para los dos que una paráfrasis anónima.
- **Si esto entra en la guía pública.** Varias de las frases del curso son excelente material
  didáctico ("lo difícil de la ganadería es mantenerla simple", "el agua no es todo pero sin
  agua no hay nada", la lista de sesgos del planificador). No son nuestras. Se pueden citar
  entre comillas con atribución, pero eso implica nombrar el curso en la guía, que es una
  decisión comercial, no técnica.
- **Hasta dónde llega acequia.** El curso tiene una línea que conviene mirar de frente: *"no es
  nuestra responsabilidad el éxito del proyecto"*. Varias de las etapas de acá arriba
  —dimensionar un electrificador, elegir una bomba, calcular un puente— acercan la app al
  terreno del asesoramiento técnico con consecuencias. La app ya lo maneja bien (fuente, rango
  de validez, aviso cuando se sale), pero conviene decidir conscientemente dónde está el límite
  de lo que acequia afirma y dónde empieza "consultá a un ingeniero civil" — que es, por otra
  parte, lo que el propio curso dice tres veces.
