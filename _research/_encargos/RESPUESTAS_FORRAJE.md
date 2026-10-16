# Respuestas del encargo de forraje

Lo que vuelve de `ENCARGO_FORRAJE.md`, lote por lote, después de validar la forma
y después de abrir el muestreo. La entrega cruda vive en
`C:\Arte y Tierra\encargos-gpt\entregas\forraje\`, afuera del repositorio.

| Lote | Biomas | Estado |
|---|---|---|
| 01 | `bosque_tropical_humedo`, `bosque_tropical_seco`, `conifera_tropical` | **entregado, no se monta** (10/10/2026) |
| 02 | `sabana_tropical`, `pastizal_templado` ×2, `pastizal_montano` | **montado 3 de 4** el 15/10/2026 |
| 03 | `pastizal_inundable`, `tundra`, `mediterraneo` | **montado 2 de 3** el 15/10/2026 |

---

## Lote 01 — bien hecho y no se puede usar

La entrega pasó la validación de forma sin un aviso y el muestreo
—`bosque_tropical_seco`, elegido por la semilla fija— aguantó: el resumen del
artículo de Yadav & Yadav (2020) dice exactamente 242 g/m²/año de NPP herbácea
media, 257 arriba y 218 al medio de la ladera, con 90 % de la biomasa en partes
aéreas y 10 % en raíces, y efectivamente **no publica la lluvia anual**. La
conversión a 2.420 kg/ha está bien hecha. Dejó `conifera_tropical` vacío con el
motivo escrito, que es la respuesta correcta cuando no hay medición separada del
estrato herbáceo.

**Y aun así no se monta, por una razón que es mía y no de la entrega: pedí la
cantidad equivocada.**

El campo `que_cuenta` —el que el encargo declaraba como «el que más importa»—
dice las tres veces lo mismo: lo que volvió es **producción primaria neta del
estrato herbáceo**, medida bajo dosel cerrado, sin descontar palatabilidad,
accesibilidad ni pisoteo, y en un caso con las raíces adentro. Eso no es oferta
de forraje. Entre la NPP herbácea de un bosque y la materia seca que puede comer
un animal hay un factor que nadie midió en estas fuentes, así que el número no
puede reemplazar a `prodForrajera` ni acompañarlo.

Dicho de otro modo: el campo hizo su trabajo. Avisó que la cifra no es la que
hace falta antes de que entrara al código, que es precisamente para lo que se
escribió.

### Lo que la entrega encontró sin que se lo pidieran

Esto vale más que las dos entradas, y sale de comparar la medición de Nepal con
lo que la app hace hoy en ese mismo lugar.

La fuente es Gautam & Mandal, *Forest Ecosystems* 2016 (`10.1186/s40663-016-0070-y`) — verificada abriendo el artículo, porque al escribir esta nota puse de memoria un apellido equivocado y era justo el error que este repositorio documenta. El rodal de Sunsari recibe **1.998,6 mm/año**. Para esa lluvia:

| | kg MS/ha·año |
|---|---|
| `forrajePorLluvia(1998)` — la escalera, en Pastoreo | **7.000** |
| `forraje_sugerido` con 100 % arbolado — en Cobertura | **800** |
| Medido en Sunsari (NPP herbácea, que es un techo) | 1.300–1.700 |

**Las dos rutas de la app difieren por un factor de 8,8 para el mismo predio**, y
el panel de Cobertura le dice al usuario, textual, «usalo en Pastoreo como
referencia junto al valor por lluvia» — como si fueran dos estimaciones
comparables del mismo número. No lo son: una mira la lluvia y la otra mira la
cobertura, y en un predio forestado dan respuestas incompatibles.

La medición cae cerca de los 800 y no cerca de los 7.000. O sea que la escalera,
aplicada a un predio con dosel, **sobreestima la oferta por un factor de cuatro o
más**, y eso antes de descontar el uso admisible. La escalera se escribió pensando
en pastizal natural —su JSDoc lo dice— pero nada en el código impide aplicarla a
un bosque húmedo tropical, y nadie avisa cuando pasa.

No lo arreglo acá: la corrección necesita los biomas pastoriles, que es donde
está la literatura, y escribir un número nuevo sin eso sería repetir el error que
tiene hoy. Queda anotado en `pastoreo.ts`, al lado de la escalera.

### Qué cambia en el encargo

Dos cosas, las dos por errores de diseño míos:

1. **El orden estaba mal.** Ordené los 14 biomas como los lista RESOLVE, y así el
   primer lote se gastó entero en los tres biomas donde «producción forrajera»
   casi no significa nada y casi no está publicada: bosques cerrados. Los biomas
   donde la escalera hace daño de verdad y donde la bibliografía abunda son la
   sabana tropical, el pastizal templado, el montano y el desierto xerófilo.
   Esos pasan a ser el lote 02.
2. **La pregunta estaba mal planteada para los bosques.** Pedí «el rango
   publicado de producción de materia seca de su vegetación herbácea», y para un
   bosque eso devuelve NPP de sotobosque, que es una medición ecológica legítima
   y un dato forrajero inútil. Lo que hay que pedir primero es **oferta
   aprovechable o receptividad publicada**, y la NPP sólo como referencia
   rotulada.

Los tres biomas forestales vuelven al final, y con otra pregunta: no cuánto
produce el sotobosque, sino **si algún organismo publica carga animal admisible
para sistemas silvopastoriles** de ese bioma. Es la pregunta que un predio
forestado realmente tiene.

---

## Lote 02 — tres de cuatro, y las tres primeras mediciones entran al código

Se abrieron **las cuatro**, no la muestra: lo que vuelve de este encargo no es
texto de una ficha, es un número que multiplica la carga animal y el agua a
almacenar. Tres verifican y se montan en `lib/forrajeMedido.ts` (`f56b572`); una
no entra.

| entrada | lo que afirmaba | |
|---|---|---|
| `pastizal_templado` · MLRA 53B | 2.733 y 2.358 lb/ac/año, Loamy Upland | ✅ literal |
| `pastizal_templado` · MLRA 81B | 680–2.125 gramíneas + 56–175 hierbas lb/ac | ✅ literal, y la ficha dice más |
| `pastizal_montano` · Altiplano | 626 · 1.238 · 1.341 · 1.958 kg MS/ha | ✅ literal, confirmado contra la Tabla 3 |
| `sabana_tropical` · Caatinga | 400 kg/ha/año de forraje disponible | ❌ **bioma equivocado y no abre** |

### Lo que el lote demuestra, que vale más que las tres cifras

**La escalera de `prodForrajera` se equivoca en las dos direcciones.**

| sitio | lluvia anual | la escalera dice | medido |
|---|---|---|---|
| Dakota del N. y del S., Loamy Upland | 381–508 mm | 1.500–3.000 | **2.643–3.063** |
| Edwards Plateau, Very Shallow | 508–762 mm | 3.000–5.000 | **825–2.578** |
| Altiplano de Puno, 3.900–4.300 m | 410–1.119 mm | 1.500–7.000 | **626–1.958** |

Con **menos** lluvia que el altiplano peruano, la pradera de Dakota produce
**más**. Una función de una sola variable no puede dar las dos cosas bien, se
la calibre como se la calibre: lo que falta es el frío, el largo de la estación
de crecimiento y la profundidad del suelo. Hasta hoy el argumento para
reemplazarla era que no tenía fuente; ahora hay tres mediciones publicadas que
muestran el tamaño y la **forma** del error.

### El dato del Altiplano casi se monta mal

El resumen informa 626 / 1.238 / 1.341 / 1.958 kg MS/ha y parecen biomasa en
pie —que en un pajonal perenne de *Festuca* y *Calamagrostis* sería un stock
acumulado de varios años y no una producción anual—. Con eso montado, la app
habría dicho que el pajonal produce el doble de lo que produce.

No lo son, y lo prueba la Tabla 3 del mismo trabajo, que publica la biomasa
**total** acumulada y la fracción que corresponde al crecimiento del año:

| pastizal | total en pie | anual | permanente |
|---|---|---|---|
| *Festuca dolichophylla* «Chilliguar» | 2.554,1 | 48,46 % | 51,54 % |
| *Calamagrostis antoniana* «Phorke» | 3.185,2 | 61,46 % | 38,54 % |
| *Festuca dichoclada* «Yurac ichu» | 3.972,2 | 33,75 % | 66,25 % |
| *Calamagrostis amoena* «Kheña» | 1.483,7 | 42,20 % | 57,78 % |

3.185,2 × 0,6146 = 1.958, que es el número del resumen: **los cuatro ya son la
fracción anual**. La entrega estaba bien y la verificación sirvió igual, porque
sin abrir la tabla no había forma de saberlo.

De paso queda el dato que esto destapa, y es de los que sirven en pantalla: en
un pajonal altoandino **entre un tercio y dos tercios de lo que se ve parado no
creció este año**. Los autores dicen que determinar esas dos fracciones es
probablemente la contribución más importante del trabajo, y que en *Festuca
dolichophylla* la biomasa se mantiene constante en 5 de las 6 cosechas: «sólo
existe un reverdecimiento del pastizal pero no un incremento real de materia
seca».

### Por qué la Caatinga no entra

Dos motivos independientes, y cualquiera de los dos alcanza:

1. **Es otro bioma.** Venía como `sabana_tropical`, que es `BIOME_NUM` 7, y la
   Caatinga es `BIOME_NUM` **2** —bosque tropical y subtropical seco—.
   Verificado contra el FeatureServer de RESOLVE: `ECO_ID` 525, biome 2.
   Montarla ahí habría metido una cifra de bosque seco en la ficha de sabana,
   que es justo donde pastorea la mayoría.
2. **No abre.** La URL del MMA brasileño redirige hoy a `require_login`, no hay
   copia en archive.org y el path sin `@@download` devuelve la plantilla del
   sitio. La primera condición del circuito es que abra.

No es una entrega mal hecha: es una ficha mal asignada. La cifra —400 kg/ha/año
de forraje disponible y 10 ha por cabeza al año en caatinga arbórea— sería
pertinente para `bosque_tropical_seco`, que sigue vacío desde el lote 01, si
aparece con una fuente que se pueda abrir.

**Con lo cual la sabana tropical sigue sin ninguna medición**, y es el bioma
donde más falta: es donde cae la mayoría de los predios ganaderos. Hay un test
que lo dice en voz alta y que habrá que cambiar cuando entre una.

### Lo que NO se hizo, a propósito

**No se reemplazó `prodForrajera`.** Tres puntos de dos biomas no reemplazan una
función global, y el bioma que más importa no tiene ninguno. Además la función
recibe la lluvia y nada más —no sabe en qué bioma está el predio— así que
usarla con esto pide cambiarle la firma en las tres copias: `produccion.ts`,
`pastoreo.ts` y el panel de Cobertura. Cambiar un número sin fuente por otro sin
cobertura no es un arreglo.

Lo que sí quedó: las mediciones con su método, su rango de validez y su
estacionalidad; doce tests que las defienden contra la fuente —incluidas las
cuatro multiplicaciones de la Tabla 3 y la conversión exacta de lb/acre, que es
0,45359237 ÷ 0,40468564224—; y el tamaño del error escrito arriba de la
escalera, para que quien la toque sepa contra qué la está comparando.

### Una cosa más que la entrega no copió y el código sí

- La ficha de Texas publica la **curva de crecimiento mensual**:
  2-3-5-13-23-15-4-5-15-7-5-3 % de enero a diciembre. Mayo es el 23 % y julio y
  agosto juntos son el 9 %. Con eso la estacionalidad deja de ser una frase.
- Y el trabajo del Altiplano publica **receptividad por condición**: 2 unidades
  ovino por hectárea y año en los dos pastizales de planicie y 1 en los dos de
  áreas colinosas. Quedó anotada en `donde_deja_de_valer`, sin convertir a
  equivalente vaca: la conversión se hace acá, no en la entrega.

---

## Lote 03 — dos de tres, y el experimento que la escalera necesitaba

Se abrieron las tres. Dos verifican y se montan en `lib/forrajeMedido.ts`
(`bad9c31`); una no entra.

| entrada | lo que afirmaba | |
|---|---|---|
| `mediterraneo` · Lesbos | 300–5.800 kg MS/ha, cuatro fincas de Agra | ✅ literal, y el trabajo dice bastante más |
| `tundra` · Alaska y Yukón | 35–96 g/m²/año de vasculares aéreas | ✅ literal contra el resumen del editor |
| `pastizal_inundable` · delta del Tana | hasta 30 t/ha/año | ❌ **modelado, cerrado, y la cifra no está en el resumen** |

### Lesbos midió sin proponerse el experimento que faltaba

Hasta ahora el argumento contra la escalera de `prodForrajera` era comparar
sitios distintos: Dakota contra el altiplano. Siempre queda la salida de decir
que son suelos y manejos diferentes. Este trabajo cierra esa salida porque
midió **los mismos potreros, en el mismo paraje, en dos años que difieren 2,25
veces en lluvia**: 797,3 mm contra 353,6 mm.

Si la producción saliera de la lluvia anual, el año húmedo tenía que rendir
mucho más. Pasó lo contrario en el tramo que importa:

| época | año húmedo (797 mm) | año seco (354 mm) |
|---|---|---|
| 1º (oct–dic) | 5,8 kg MS/ha/día | 9,8 |
| 2º (dic–mar) | 5,2 | 4,4 |
| 3º (mar–jun) | **12,1** | **21,6** |

La explicación la da el propio trabajo: el 45 % de la lluvia del año húmedo
cayó entre fines de diciembre y fines de febrero, fuera de la ventana de
crecimiento, y fue más que todo el segundo año hidrológico junto. Textual:
*«el momento y la intensidad de la lluvia sugieren que el efecto sobre la
biomasa no es tan importante como los valores absolutos implican»*.

Y hay un segundo factor del mismo tamaño que la escalera tampoco ve. En el
mismo clima, el mismo año y la misma isla, los potreros «mejorados» —terrazas
mantenidas, piedras sacadas, chacra en el pasado— rindieron **15,9 kg MS/ha/día
contra 5,5** de los sin tocar. Un factor 2,9 que no es clima: es historia de
uso. Entre las cuatro majadas la diferencia va de 5,5 a 25,5.

Tres cosas más del trabajo que quedaron en el módulo:

- **El techo de 5.800 es una ex-chacra plana**, no la frygana. El propio trabajo
  dice que los potreros por debajo de 500 kg/ha están en suelos desfavorables y
  que los de arriba caen en el rango de las praderas mejoradas de la
  bibliografía, pero que casi todos esos fueron chacra hasta hace 30 o 40 años.
- **La proteína bruta va de 5,4 a 7,3 %**, que el trabajo califica de tan baja
  como la paja de cereal. Estos kilos de materia seca no son kilos de alimento.
- **Pastorear temprano y largar rindió más al final**: la jaula cosechada en
  diciembre y después dejada descansar fue la de mayor tasa en las dos
  temporadas.

### La tundra aporta lo que ningún escalón puede dar

350 a 960 kg MS/ha/año de plantas vasculares aéreas. El escalón más bajo de la
escalera —el de menos de 300 mm de lluvia— es 700 kg/ha/año. O sea que **no
existe valor de lluvia que haga que la escalera devuelva lo que se mide en
tundra**: el problema no es qué lluvia se le pasa, es que la lluvia no alcanza
como variable.

De este trabajo, que es de 1974, **sólo abre el resumen del editor**: el texto
completo está detrás de una verificación anti-bot de Cloudflare y no hay copia
en ningún repositorio (Unpaywall lo da como *bronze*, con el PDF sólo en el
sitio del editor). La cifra montada está textual en ese resumen, con su
definición al lado —*«between 35 and 96 g m-2 for aboveground vascular
plants»*—, así que se monta; pero queda escrito en el campo `metodo` que el
método primario no se verificó más allá de lo que el resumen declara.

Dos cautelas que salen del mismo resumen y no de ninguna suposición:

- **Excluye musgos y líquenes**, que el resumen cuantifica aparte: 28 a 116
  g/m²/año de musgo y 1 a 5 de liquen. En tundra eso es forraje real del reno y
  del caribú, sobre todo en invierno, y en el extremo el musgo solo produce más
  que todas las vasculares. Para pastoreo de renos la cifra es un piso.
- **La fitomasa total de los dos sitios estudiados a fondo era 7.401 y 7.567
  g/m²**, o sea 74 y 76 toneladas por hectárea, con recambio aéreo de unos 7
  años y subterráneo de 45 a 150.

### La trampa del pastizal perenne, y cómo empeora con el frío

Esa última cautela cierra algo que el lote 02 había dejado abierto. En un
pastizal perenne, lo que está parado no es lo que creció este año, y la
distancia entre las dos cosas crece con el frío:

| | en pie | anual | factor |
|---|---|---|---|
| Altiplano de Puno | 1.484–3.972 kg/ha | 626–1.958 | **1,5 a 3 veces** |
| Tundra de Alaska | 74.010–75.670 kg/ha | 350–960 | **77 a 211 veces** |

En el altiplano, confundir una cosa con la otra duplica el número. En tundra lo
multiplica por doscientos. Cualquier cifra tomada de una foto de campo —o de un
índice satelital de biomasa— está midiendo el stock y no el flujo, y el error
que comete depende del bioma.

### Por qué el delta del Tana no entra

Cuatro motivos independientes, y cualquiera de los cuatro alcanza:

1. **Es un modelo, no una medición.** El trabajo presenta un modelo acoplado
   vegetación-suelo y lo aplica al delta del Tana. Un valor simulado no es un
   caso resuelto de la literatura: es la salida de otra función sin fuente.
2. **No es forraje.** El propio resumen dice que el modelo tiene cuatro
   compartimentos de fitomasa: *«leaves, stems, roots, aerial dead matter»*. Las
   **raíces** y el material muerto no los come nadie. Treinta toneladas por
   hectárea de eso no son treinta toneladas de pasto.
3. **Está en otro bioma, otra vez.** Igual que la Caatinga del lote 02. Venía
   como `pastizal_inundable` —`BIOME_NUM` 9— y el delta del Tana es
   **`BIOME_NUM` 1**, bosque húmedo de la costa swahili, `ECO_ID` 25.
   Comprobado con cuatro puntos distintos del delta: los cuatro dan bioma 1, y
   recén bastante aguas arriba aparece el 7. En ningún punto del delta hay
   bioma 9. Los dos rechazos del circuito tenían el bioma mal, y las dos veces
   por lo mismo: se eligió por cómo se ve la vegetación en el texto y no por el
   polígono que la clasifica. De ahí sale el campo `bioma_verificado` del lote
   04.
4. **La cifra no está en el resumen público.** El trabajo es de acceso cerrado
   (OpenAlex: `closed`, sin copia en ningún repositorio). Se buscó la cifra en
   el resumen completo que publica Semantic Scholar —2.404 caracteres— y **no
   aparecen ni «30», ni «t/ha», ni «kg», ni «tonne»**. El resumen habla de una
   disminución importante de la productividad por los cambios hidrológicos,
   sin ninguna cifra.

Eso último es lo primero de todo el circuito que no se puede comprobar ni a
favor ni en contra: la cifra puede estar en el texto completo, pero el texto
completo no abre. La regla que ya estaba escrita alcanza para resolverlo —si no
se puede abrir y verificar, no se monta— y conviene que quede dicho que esta vez
se aplicó a una `verificacion` que citaba algo ausente del resumen, no a una
página caída.

**Con lo cual el pastizal inundable sigue sin medición**, igual que la sabana
tropical, y hay un test que lo dice en voz alta para los dos.

### Lo que NO se hizo, a propósito

Sigue sin reemplazarse `prodForrajera`. Ahora hay cinco sitios en cuatro biomas,
que es mejor que tres en dos, pero el bioma donde cae la mayoría de los predios
ganaderos sigue vacío y la función sigue sin recibir el bioma.

Lo que sí cambió en el contrato del módulo, y los dos cambios son para no
inventar:

- `lluvia_mm_min` y `lluvia_mm_max` ahora admiten `null`, porque el trabajo de
  tundra no publica lluvia para sus sitios. Rellenarla con la climatología de
  otro servicio ataría la cifra a un número que su propio trabajo nunca midió.
  El test exige las dos o ninguna: media lluvia no es un rango de validez.
- El test que pedía que toda cifra fuera `ms_herbacea_total` ahora pide lo que
  de verdad importa: que no traiga descontado el uso admisible, porque
  `bandaUso` lo descuenta río abajo. La tundra es `npp_herbacea` y tampoco
  descuenta nada.
