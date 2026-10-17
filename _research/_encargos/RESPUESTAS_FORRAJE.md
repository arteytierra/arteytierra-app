# Respuestas del encargo de forraje

Lo que vuelve de `ENCARGO_FORRAJE.md`, lote por lote, después de validar la forma
y después de abrir el muestreo. La entrega cruda vive en
`C:\Arte y Tierra\encargos-gpt\entregas\forraje\`, afuera del repositorio.

| Lote | Biomas | Estado |
|---|---|---|
| 01 | `bosque_tropical_humedo`, `bosque_tropical_seco`, `conifera_tropical` | **entregado, no se monta** (10/10/2026) |
| 02 | `sabana_tropical`, `pastizal_templado` ×2, `pastizal_montano` | **montado 3 de 4** el 15/10/2026 |
| 03 | `pastizal_inundable`, `tundra`, `mediterraneo` | **montado 2 de 3** el 15/10/2026 |
| 04 | `sabana_tropical` ×2, `pastizal_inundable` ×2 | **montado 1 de 4** el 16/10/2026, y en otro bioma |
| 05 | `sabana_tropical` ×2, `pastizal_inundable` | **ninguna de 3** el 16/10/2026 — y es el lote más útil |
| 06 | biomas 7 ×3, 13, + el modelo | **montadas 1 de 4** el 17/10/2026, y el modelo entró |
| 07 | biomas 1 ×2, 2 ×2 | **ninguna de 4** el 17/10/2026 |
| 08 | biomas 4, 5, 6 | **montadas 3 de 4** el 17/10/2026 |
| 09 | la fracción aérea de la NPP | **cerrado en contra** el 17/10/2026 — y destapó la segunda fracción |

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

---

## Lote 04 — una de cuatro, montada en un bioma al que no apuntaba

Pedía las dos cosas que faltan: sabana tropical (bioma 7) y pastizal inundable
(bioma 9). **Las dos siguen vacías.** Entró una sola entrada y entró en el
pastizal templado, que ya tenía dos.

| entrada | bioma pedido | bioma real | |
|---|---|---|---|
| Serengeti, Tanzania | 7 | **7** ✓ | no entra: biomasa en pie |
| Kruger, Sudáfrica | 7 | **7** ✓ (ecorregión 48, no 65) | no entra: un cuadrante suelto |
| Delta Medio del Paraná | 9 | **8** ✗ | **entra**, en `pastizal_templado` |
| Pantanal, Nhecolândia | 9 | **9** ✓ | no entra: disponibilidad por fecha |

Es el primer lote que trajo el campo `bioma_verificado` completo —coordenada,
`ECO_ID` y `BIOME_NUM`, que es lo que el encargo agregó justamente porque las
dos entradas rechazadas antes tenían el bioma mal— y es el primero en el que
**tres de los cuatro biomas verifican**. El campo funcionó.

### El bioma estaba verificado y seguía estando mal

La falla que queda es más fina que las anteriores y hay que escribirla porque va
a volver: **la coordenada verificada no era la del sitio medido.** Era un punto
de referencia regional elegido para representarlo, y la entrega lo declaraba sin
alarma, con la frase «el punto RESOLVE consignado es el ancla regional
prevalidada en el encargo».

La tesis del Delta publica su sitio exacto, 33° 49′ S y 59° 27′ O. El punto
consultado estaba unos 65 km al este.

| punto | ECO_ID | bioma | |
|---|---|---|---|
| el ancla regional, −33,9 / −58,8 | 585 | 9 | Paraná flooded savanna |
| **el sitio de la tesis, −33,8167 / −59,45** | **576** | **8** | **Pampa Húmeda** |
| cinco puntos más alrededor del sitio | 576 | 8 | Pampa Húmeda |

Lo mismo pasó en Kruger, más chico: el ancla da mopane (65) y el sitio publicado
da Limpopo lowveld (48). Ahí los dos caen en el bioma 7, así que la entrada no
cambiaba de lugar, pero la ecorregión informada no era la del estudio. Y la
entrega lo admitió sola: «el servicio REST de RESOLVE no fue accesible durante
esta comprobación».

De ahí sale el renglón que va al encargo siguiente: **el bioma se consulta sobre
la coordenada que la fuente publica, no sobre una que la represente.** A esta
escala un ancla regional puede caer en otro bioma sin dejar de parecer el mismo
paisaje.

### Y por eso la isla de Baradero queda archivada en el pastizal templado

Es un pastizal de albardón que se inunda —al final del invierno de 2013 estuvo
40 días bajo agua— y aun así la medición no va al bioma 9. El motivo no es
terminológico: cuando alguien marque ese predio en acequia, la app va a resolver
`resolve_pastizal_templado`, porque resuelve por polígono. Una medición guardada
en el bioma que el paisaje parece, en vez de en el que el mapa dice, no se usa
nunca o se usa en el lugar equivocado.

### Lo que la entrega dejó en null y la tesis sí tenía

Las cuatro entradas vinieron con **todos** los campos de kg MS/ha·año vacíos, y
el validador las rechazó a las cuatro por eso. En tres casos estaba bien: miden
lo que está parado, no lo que creció.

En el Delta no. La tesis no sólo midió biomasa en pie: **midió tasas de
crecimiento neto por diferencia entre cortes**, que es como se mide producción,
y publica el acumulado en su propia conclusión:

> En el período de primavera a otoño, descansos bimestrales o más prolongados
> del pastoreo permiten obtener producciones forrajeras desde los 8200 kg
> MS\*ha-1.

La entrega informó el pico de biomasa en pie (10.533 kg/ha de MS viva total en
verano) y dejó el acumulado afuera. Lo que entró al código:

| | kg MS/ha, primavera a otoño |
|---|---|
| MS **total** del pastizal | 11.200–11.400 |
| MS **forrajera** | 6.700–8.250 |
| de eso, cosecha de verano del tratamiento sin cortes | 6.733 |
| de eso, cosecha acumulada del de cortes bimestrales | 7.417 → 8.250 |

### Las dos lecturas de la misma cosecha, que es el hallazgo del lote

La escalera, con los 1.056 mm del sitio, da **7.000 kg MS/ha/año**.

- contra la fracción **forrajera** (6.700–8.250): cae adentro. Es la primera vez
  en seis sitios que no se pasa ni se queda corta.
- contra la herbácea **total** (11.200–11.400): se queda **1,6 veces corta**.

El mismo sitio, el mismo año, la misma cosecha, y el veredicto se da vuelta
según cuál de las dos se compare. La escalera nunca dijo cuál de las dos es, y
eso no se arregla calibrándola. Por eso el código ahora tiene un tipo de cifra
nuevo, `ms_forrajera`, separado de `ms_herbacea_total`: en este sitio la total es
de 1,36 a 1,70 veces la forrajera, así que confundirlas sobreestima la carga
animal hasta un 70 %.

### El pastizal más grande entregó menos forraje

La tercera forma de la trampa del stock, y la más incómoda, porque acá el stock
no sólo no es el flujo: lo contradice.

| tratamiento | MS viva parada en verano | forraje cosechado |
|---|---|---|
| clausurado, sin cortes | **10.533 kg/ha** | 6.733 en una sola cosecha |
| cortes bimestrales | 2.237 kg/ha | **7.417 acumulados** |

Una diferencia de 8.296 kg a favor del que nadie tocó, y de 684 kg de forraje a
favor del que se cortó tres veces. El mecanismo lo da la tesis: al dejar crecer
el canopeo sin interrupción las propias forrajeras se dan sombra, la tasa de
crecimiento neto se vuelve **negativa** en otoño —muere más material del que se
genera— y lo que se ve parado es en buena parte material viejo. Con cortes, la
tasa se mantuvo arriba de 40 kg MS/ha/día casi cuatro meses, el doble de tiempo.

La propia tesis aclara que el 23 % de diferencia **no dio significativo** con
tres clausuras de 4 × 4 m y un año de datos, y que la comparación es empírica.
Va escrito en `donde_deja_de_valer`.

### Por qué las otras tres no entran

**Serengeti** (bioma 7 verificado, CC-BY). Publica 0,14 ± 0,10 kg/m² de biomasa
herbácea en pie fuera de copas, promedio de lecturas mensuales entre mayo de
2016 y mayo de 2018 con disco de pastura calibrado para el ecosistema. Son 1.400
± 1.000 kg/ha: el desvío es el 71 % de la media. Biomasa en pie promediada sobre
dos años no es producción anual y no hay serie de crecimiento para derivarla.

**Kruger** (bioma 7 verificado en los dos puntos). La cifra que trae —12.006
kg/ha— es **el mayor cuadrante cosechado de 50 × 50 cm**, en un trabajo cuyo
tema es comparar LiDAR contra campo. Son 300 g de materia seca en un marco de
un cuarto de metro cuadrado: posible en una mata densa, y sin significado como
cifra de sitio. El propio resumen dice que para biomasa absoluta hace falta
parametrizar con cosecha destructiva en cada sitio. La entrega, para su crédito,
la dejó en prosa y no en el campo numérico.

**Pantanal** (bioma 9 verificado en el sitio publicado, −19,0667 / −56,60). Esta
es la que más duele, porque es la única medición que existe del bioma 9 y está
abierta. Verifica literal: 523 kg/ha en febrero de 2010 y 1.698 en noviembre de
2008, marcos de 0,5 × 0,5 m, estufa a 65 °C por 48 h, normal de 1.182,5 mm con
el 72 % entre noviembre y marzo. Pero es disponibilidad por fecha, no
producción, y no hay tasas de crecimiento.

Lo que sí dejó, y queda escrito en el módulo, es la razón de fondo por la que un
número por bioma no va a alcanzar en el pastizal inundable. El propio documento
compara su cifra con otras dos del mismo Pantanal y la misma especie dominante:

| | kg MS/ha |
|---|---|
| Nhecolândia, Fazenda Nhumirim (este trabajo) | 523–1.698 |
| Nhecolândia, campos húmedos (Santos et al. 2013) | ~3.000 |
| Barão de Melgaço, baixada (Crispim et al. 2008) | 5.971 |

**Factor 11 dentro de un solo bioma**, y en dos de los tres casos dentro de una
sola subregión. Lo que manda es la fase hidrológica. Y el régimen regional —30 a
40 cm de agua, 3 a 4 meses, 30 % de la superficie inundada— ni siquiera describe
el predio: el otro documento de Embrapa dice que **en plena creciente el 73 % de
la hacienda estaba seca**.

### Lo que NO se hizo, a propósito

- **No se abrió el texto completo de las dos de Wiley.** Las dos son de acceso
  abierto (CC-BY y CC-BY-NC-ND) y las dos están detrás de una verificación
  anti-bot de Cloudflare, en los dos hosts del editor. No se resolvió. Se
  probaron tres repositorios: el noruego exige autenticación para el archivo, el
  de Brighton no publica el PDF y el de la NSF no responde desde esta máquina.
  De Kruger se leyó el resumen completo; de Serengeti, sólo los metadatos.
  Ninguna de las dos entraba igual, por el tipo de cifra.
- **No se convirtió ninguna biomasa en pie a producción anual.** Hay factores
  medidos para hacerlo —1,5 a 3 veces en el altiplano, 77 a 211 en la tundra—
  pero son de otros sitios y otros climas. Aplicarlos acá sería exactamente el
  relleno con promedio ajeno que el contrato prohíbe.
- **No se usó la producción anual que cita el documento del Pantanal** (1.578 a
  8.329 kg/ha para *Hymenachne amplexicaulis*, de Camarão et al. 2006). Es una
  cita de segunda mano, de llanuras de inundación amazónicas y no del Pantanal.
  Va al encargo siguiente como fuente a buscar de primera mano.
- **No se recalculó la conversión a kg/ha del Delta.** El área del aro de
  muestreo no está indicada en ninguna parte del texto de la tesis —la entrega
  decía que sí— así que la escala se toma como viene. Queda escrito en `metodo`.

---

## Lote 05 — ninguna de tres, y es el lote que más cambió el plan

Tres entradas, las tres de producción anual y no de biomasa en pie, que era lo
que el encargo había pedido. **Los tres biomas verifican.** Y no se montó
ninguna. El motivo es el hallazgo.

| entrada | bioma pedido | bioma real | |
|---|---|---|---|
| Nylsvley, Sudáfrica | 7 | **7** ✓ (ECO_ID 38) | no entra: la fuente avisa que puede estar subestimada |
| Parque Nacional de Nairobi | 7 | **7** ✓ (ECO_ID 57) | no entra: hay cinco cifras publicadas para el mismo sitio |
| Pantanal norte, Mato Grosso | 9 | **9** ✓ (ECO_ID 584) | no entra: tasas diarias, y año atípico |

Primero lo administrativo: **las tres vinieron con `bioma_verificado` en null**,
que es el campo que el encargo 05 había vuelto obligatorio. Los verifiqué yo y
los tres dan bien, así que no cambió ningún veredicto, pero el campo volvió sin
llenar.

### La savana no está sin medir: está medida y no se ponen de acuerdo

La hipótesis con la que se venían pidiendo lotes era que el bioma 7 estaba vacío
por falta de mediciones. **Es falsa.** Nylsvley y el Parque Nacional de Nairobi
son dos de las savanas mejor documentadas del planeta, con series de monitoreo
mensual de años, publicadas y abiertas en la base de productividad primaria del
ORNL. El problema es que para el mismo sitio hay varias cifras y no se parecen.

La ficha del ORNL de Nairobi lo tabula ella misma, para la savana **sin tratar**:

| fuente | unidades | ANPP | BNPP | TNPP |
|---|---|---|---|---|
| Kinyamario e Imbamba (1992) | g/m²/año | 1.004 | 875 | 1.880 |
| Scurlock y Olson (2013) | g/m²/año | 811 | 431 | 1.242 |
| GPPDI clase A, sitio 31 | **gC**/m²/año | 104 | 58 | 162 |
| GPPDI clase B, sitio 62 (MI 108) | gC/m²/año | 60 | 40 | 100 |
| GPPDI clase B, sitio 62 (MI 109) | gC/m²/año | 100 | 60 | 160 |
| GPPDI clase B, sitio 62 (MI 110) | gC/m²/año | 370 | 190 | 560 |
| EMDI clase B, sitio 62 | gC/m²/año | 235 | 125 | 360 |

Con una nota al pie que lo explica: *«NPP values for this site reported in other
published accounts differ due to different measurement and calculation
methods»*. Pasando el carbono a materia seca —aproximadamente el doble, y es la
otra trampa de esa tabla— el rango publicado para **un solo pastizal** va de
unos 1.300 a 10.040 kg MS/ha/año. **Factor 7,6 para el mismo pasto.**

En Nylsvley es más explícito todavía. La cifra que acequia querría es la que la
ficha describe como *«the grazeable above-ground plant material of the grass
layer (grasses + forbs) in open areas between trees»*: 76 g/m²/año, o sea 760
kg/ha, de los cuales el pasto aporta 60. Pero la misma ficha agrega:

> The Grunow et al. (1980) smooth function calculation of ANPP **may have
> substantially underestimated** productivity at Nylsvley. […] The three
> estimates do not agree because different calculation methods were used.

Y da una «mejor estimación» de 482 g/m²/año para el total herbáceo con raíces.

**Por eso no se montó ninguna.** Poner 760 kg/ha como la producción medida de la
savana —el bioma donde cae la mayoría de los predios ganaderos— con el proveedor
del dato avisando que puede estar sustancialmente subestimada, es exactamente el
número plausible y equivocado que `forrajeMedido.ts` existe para evitar. Y poner
10.040 es el mismo error del otro lado.

### Una corrección: el 10.040 de la entrega no estaba mal

Lo iba a reportar como error. La compilación de Scurlock y Olson, que la propia
entrega citaba, da **811** g/m²/año para Nairobi, y el 10.040 no aparece en
ninguna parte de ese PDF. Pero sí está en la base primaria del ORNL: *«Between
October 1984 and September 1986, ANPP averaged 1,004 g/m²/yr»*. La entrega sacó
el número de la fuente correcta; las dos cifras son reales y describen el mismo
sitio con algoritmos distintos. **El que estaba por equivocarse era yo.**

### Lo que esto hace con el plan de reemplazar la escalera

Es la consecuencia importante y conviene que quede escrita sin vueltas:
**reemplazar `prodForrajera` por un número medido por bioma no va a funcionar en
la savana.** La dispersión de la literatura en un solo sitio (7,6×) es mayor que
el error que se le reprocha a la escalera.

Y la misma compilación midió, de paso, exactamente cuánto vale una escalera de
lluvia. Sobre los 53 sitios con control de calidad y menos de 3.000 mm encontró
*«a good straight-line fit between ANPP and annual precipitation»*, **r² = 0,56**
en 50 de 53. Sobre las compilaciones grandes y menos curadas —720 registros de
Osnabrück, 117 de IBP Woodlands— *«the correlation between ANPP and precipitation
was poor in each case»*.

Leído de frente: en el mejor de los casos la lluvia anual explica algo más de la
mitad de la variación. La escalera no está rota por mala calibración; está
incompleta por construcción.

Lo que sigue de ahí es un camino concreto, y es lo mejor que trajo el lote. El
modelo clásico con el que esa compilación se compara es el **«Miami Model» de
Lieth (1975)**, y su forma es el dato: **NPP es el MÍNIMO de una función de la
lluvia y una función de la temperatura**, con el supuesto de que uno de los dos
siempre limita. Contra ese modelo el ajuste mejora, y en los sitios boscosos la
temperatura resulta la limitante en **41 de 48**.

Que es, palabra por palabra, el diagnóstico que el módulo ya tenía escrito
mirando Dakota contra Puno: con menos lluvia y más calor, Dakota produce más. La
diferencia es que ahora hay una fuente publicada que lo dice, una forma funcional
para escribirlo, y acequia ya tiene la temperatura del predio. **Ese es el
reemplazo, y no una tabla por bioma.**

### El Pantanal norte: no monta, y explica el bioma 9 mejor que nadie

Pozer y Nogueira (2004, *Braz. J. Biol.* 64(4), SciELO, abierto) midieron
productividad primaria neta mes por mes durante un año en pasturas nativas
inundables, con parcelas permanentemente protegidas, temporalmente protegidas y
expuestas al ganado. Marcos de 0,25 m², separación en biomasa viva y muerta, NPP
por diferencia mensual. Doce cosechas.

No monta por dos razones: publica **tasas diarias** —3,8 g MS/m²/día en mayo y
5,1 en noviembre— y no un total anual, y los autores declaran que el año fue
**atípico**, con una inundación que impidió el crecimiento de las macrófitas
acuáticas grandes.

Pero deja dos cosas que ninguna cifra anual puede llevar:

1. **Cerca del 70 % de la producción anual ocurre durante la inundación**, no
   durante las lluvias (Penha et al. 1999, citado ahí), porque son las macrófitas
   acuáticas grandes las que encuentran entonces sus mejores condiciones. En el
   bioma 9 el calendario del forraje lo marca el pulso del agua y no el del
   cielo: una función de la lluvia anual no se equivoca en el nivel, se equivoca
   en el mes.
2. **La inversión del stock, por tercera vez y en un bioma nuevo:** *«the
   greatest total biomass values were for the protected pasture due to
   accumulated dead biomass»*. El potrero sin ganado tiene más pasto parado
   porque acumula material muerto. El mismo trabajo señala que por eso el ganado
   cumple una función de manejo: evita el exceso de biomasa muerta que sube el
   riesgo de incendio.

### Lo que NO se hizo, a propósito

- **No se montó una cifra con un rango de 7,6×.** Sería honesta y sería inútil:
  con ese ancho no se dimensiona un rodeo. Lo correcto es que el bioma siga
  declarado vacío y que el módulo explique por qué.
- **No se derivó un anual de las tasas diarias del Pantanal.** 5,1 g/m²/día es el
  pico, no la media, y el año fue atípico por declaración de sus autores.
- **No se montó Towoomba** (Sudáfrica, −24,90 / 28,35, bioma 7 verificado, 198
  g/m²/año en la compilación), que encontré leyendo la misma tabla y que es el
  punto más informativo del bioma: está a 60 km de Nylsvley, en la **misma
  ecorregión**, con 6 mm de diferencia de lluvia anual, y la compilación le da
  **2,6 veces** su producción. Tiene ficha propia en el ORNL (1949-1990) que no
  alcancé a leer. Es el reintento más valioso y va primero en el encargo nuevo.
- **No se montaron dos filas que llenarían otros dos biomas.** Vindhyan (India,
  bioma 2 verificado, 538 g/m²/año con 298 mm) y Montecillo (México, bioma 13
  verificado, 1.063 g/m²/año con 590 mm) salen de la misma tabla con control de
  calidad y tienen coordenada publicada. No entran todavía porque la compilación
  da un valor por sitio **sin decir de qué tratamiento** —y advierte que muchos
  sitios tenían parcelas fertilizadas o irrigadas—, y porque las dos cifras son
  llamativamente altas para su lluvia. Van como pistas verificadas al encargo.

---

## Lotes 06, 07 y 08 — el encargo ómnibus, y el modelo que sí entró

Los tres llegaron juntos el 17/10/2026, doce entradas en total. Entraron
cuatro, y una de ellas no es una medición sino la formulación del **Miami
Model**, que es lo que estaba trabando el reemplazo de `prodForrajera`.

Primero lo administrativo, que esta vez tiene una causa única y declarada:
**las doce entradas vinieron con `bioma_verificado` en `null`**, con la nota «la
consulta al servicio ArcGIS Resolve_Ecoregions no fue accesible». Verifiqué las
nueve coordenadas publicadas por mi cuenta y **siete dieron lo que la entrega
suponía. Dos no.**

| sitio | coordenada publicada | bioma que supuso la entrega | bioma real |
|---|---|---|---|
| Parque Nacional de Nairobi | 1,33 S / 36,83 E | 7 | **7** ✓ (ECO_ID 57) |
| Nylsvley | 24,65 S / 28,70 E | 7 | **7** ✓ (ECO_ID 38) |
| Towoomba | 24,90 S / 28,35 E | 7 | **7** ✓ (ECO_ID 38, la misma que Nylsvley) |
| Montecillo | 19,46 N / 98,91 O | 13 | **13** ✓ (Central Mexican matorral) |
| Lamto | 6,22 N / 5,03 O | 1 | **1** ✓ (Eastern Guinean forests) |
| Olokemeji | 7,42 N / 3,55 E | 1 | **1** ✓ (Nigerian lowland forests) |
| Różańsko | 52°52′30″ N / 14°45′22″ E | 4 | **4** ✓ (Baltic mixed forests) |
| Cascade Head 1A | 45,05 N / 123,96 O | 4 | **5** ✗ Central Pacific NW coastal forests |
| Waring's Woods | 44,60 N / 123,27 O | 5 | **8** ✗ Willamette Valley oak savanna |

Los dos errores son el mismo error y es el que el encargo 05 ya había nombrado:
**se clasificó por lo que el sitio parece y no por lo que el polígono dice.** Un
rodal de Pseudotsuga de 47.120 g/m² de biomasa arbórea parece bosque de
coníferas; la coordenada que su propia ficha publica cae en una sabana de robles,
bioma 8. Las dos entradas se montaron en el bioma verificado, no en el supuesto,
y la de Waring's Woods vale justamente por eso.

### Lo que entró

| entrada | bioma | cifra montada | |
|---|---|---|---|
| Montecillo, pastizal salino de Texcoco | **13** | 6.090–10.630, típico 6.692 kg MS/ha/año | primera del bioma |
| Różańsko, sotobosque de robledal-carpinal | **4** | 378–940 kg MS/ha/año | primera del bioma, primer sotobosque |
| Cascade Head 1A, sotobosque de aliso | **5** | 410 kg MS/ha/año | primera del bioma |
| Waring's Woods, sotobosque de Pseudotsuga | **8** | 60 kg MS/ha/año | el piso del dosel |
| Miami Model de Lieth | — | `lib/miamiModel.ts` | el modelo, con sus dos fuentes |

De seis mediciones en cuatro biomas se pasó a **diez en siete**, de quince.

### El hallazgo del lote 06: los algoritmos no discuten cuánto, discuten dónde

Es la explicación de todo lo que el lote 05 había descrito sin poder explicar. La
ficha del ORNL de Montecillo tabula las tres fuentes publicadas para la **misma**
serie de cosechas:

| fuente | NPP aérea | NPP subterránea | NPP total |
|---|---|---|---|
| García-Moya y Montañez Castro (1992) | 669 | 1.007 | 1.676 |
| Scurlock et al. (2002) | 609 | 1.174 | 1.783 |
| Scurlock y Olson (2013) | 1.063 | 678 | 1.741 |

**El total coincide dentro de un 6 %. La parte aérea se mueve un 75 %, y la
subterránea un 73 % en sentido contrario.** Los tres algoritmos están de acuerdo
en cuánta materia seca produce ese pastizal y en desacuerdo sobre cuánta quedó
arriba y cuánta abajo. Y lo que acequia necesita para dimensionar un rodeo es
exactamente la columna frágil.

Eso resuelve dos cosas de un golpe: por qué la sabana tenía un factor 7,6, y por
qué el 1.063 de Montecillo que el lote 05 había anotado como «llamativamente
alto» no era un error de nadie —es la cifra de Scurlock y Olson 2013 para el
mismo sitio, con otro reparto.

### El lote 08 lo midió de frente: seis algoritmos, las mismas cosechas

Rawlik y Jagodziński (*Ecosystems* 24, 2021, acceso abierto) cosecharon el
sotobosque de un robledal-carpinal polaco semanalmente en abril y mayo y cada
quince días el resto, dos temporadas, y calcularon la producción anual con seis
algoritmos sobre esas mismas cosechas:

| método | 2010 | 2011 |
|---|---|---|
| 1 · máximo de biomasa en pie del año | 37,8 | 41,0 |
| 2 · suma de diferencias positivas entre cosechas | 50,2 | 58,3 |
| 3 · suma de los máximos de cada especie | 59,8 | 72,6 |
| 4 · biomasa × densidad, al máximo de biomasa | 52,7 | 72,7 |
| 5 · biomasa × densidad, al máximo de densidad | 52,1 | 68,6 |
| 6 · biomasa × densidad, al máximo del producto | 74,3 | 94,0 |

**El algoritmo mueve el resultado 1,96× y el año 1,38× como máximo.** Cambiar de
método importa más que cambiar de año. La entrega reportó cuatro de los seis
métodos; los seis están en el artículo y los seis están en el test.

Y el método 1 —máximo de biomasa en pie, el más usado porque es el más barato—
subestima alrededor de la mitad. Es el mismo método con el que el lote 04 había
traído Serengeti y Kruger.

### Towoomba: el reintento más valioso del lote 05, resuelto y negativo

El lote 05 había dejado marcada una anomalía: Towoomba y Nylsvley, a 60 km, en la
misma ecorregión, con 6 mm de diferencia de lluvia, y un factor 2,6 de producción.
La ficha primaria del ORNL lo explica en su segunda línea: Towoomba era un
**ensayo de fertilización** de varias hectáreas, cinco niveles de nitrógeno por
tres de fósforo en bloques aleatorizados, **sobre un área de la que se removieron
todos los árboles**, con una sola medición de biomasa por año. El 198 g/m²/año
sale de la fila `P0N3`, un tratamiento fertilizado.

Nunca fueron comparables. Y la advertencia estaba en la compilación: *«18 sites
have data for more than one "treatment" (fertilized or irrigated plots…)»*, con
un valor por sitio y sin decir de cuál. **Coordenada verificada, bioma verificado
y fuente abierta, y sigue siendo un ensayo agronómico.**

### Lo que hace el dosel, medido contra su propio rodal

El transecto OTTER de Oregón publica las dos cosas en la misma tabla, y es la
comparación que faltaba:

| sitio | cobertura herbácea | NPP del rodal | capa herbácea | la herbácea es |
|---|---|---|---|---|
| Cascade Head 1A, aliso rojo | 35,2 % | 1.630 | 41 | 2,5 % |
| Waring's Woods, Pseudotsuga | 4,9 % | 1.540 | 6 | **0,4 %** |

En g MS/m²/año. Los dos rodales producen casi lo mismo y su sotobosque difiere
6,8 veces; la cobertura herbácea difiere 7,2. Lo que decide el forraje de un
bosque es la luz que llega al piso.

Dos consecuencias:

1. **Waring's Woods está en el bioma 8, el de la pradera de Dakota.** Dentro de un
   mismo bioma hay 2.643–3.063 kg MS/ha/año a cielo abierto y **60** bajo dosel
   cerrado: un factor 44 que ninguna función del clima puede dar.
2. **El `arbolado: 800` de `cobertura.ts` resultó ser el número mejor respaldado
   de toda la cadena, y por accidente.** Lo medido: 60 en conífera densa, 410 en
   aliso, 378–940 en robledal-carpinal y 1.300–1.700 en bosque húmedo tropical de
   Nepal. El 800 cae adentro para hoja ancha y queda unas 13 veces alto para
   conífera cerrada. No se tocó: ahora tiene cuatro mediciones al lado.

### El Miami Model entró, y no es el reemplazo

Esto es lo más importante del lote 06 y conviene decirlo sin adornos, porque
contradice lo que yo mismo escribí el 16/10.

La formulación llegó completa y la verifiqué en **dos fuentes independientes**,
porque la constante de la exponencial de la lluvia es el tipo de número que una
digitalización arruina sin que se note: Lieth, «Vegetation and CO₂ Changes»
(IIASA, 1978), pp. 103-104, y el documento del GPPDI del ORNL, p. 14. Las dos
imprimen lo mismo:

```
NPP_T = 3000 / (1 + e^(1,315 − 0,119·T))
NPP_P = 3000 · (1 − e^(−0,000664·P))
NPP   = min(NPP_T, NPP_P)          en g de materia seca/m²/año
```

Difieren en cuántos puntos lo calibraron: 52 el ORNL, «about 65 data pairs»
Lieth. Se cita el rango.

**Lo que no se puede hacer con esto es calcular forraje**, y hay dos mediciones
que lo prueban, las dos verificadas en su fuente primaria esta vez:

- **No es un techo.** En Montecillo, con las dos medias anuales que su propia
  ficha publica (580 mm y 15,1 °C), el modelo da 959 g/m²/año de NPP total y la
  NPP total **medida** ahí es de 1.676. El modelo lee **1,75 veces bajo**. Peor:
  la NPP aérea sola, medida, es 669, o sea el 70 % de todo lo que el modelo le
  atribuye al ecosistema entero. El sesgo tiene nombre y está publicado: el
  modelo se calibró con datos de la era del IBP, y la compilación que lo valida
  avisa que sus propias medias de NPP total de pastizal son *«more than twice as
  high»* que los rangos de Lieth.
- **No es forraje.** En Waring's Woods la capa herbácea es el 0,4 % de la NPP del
  rodal, y en Cascade Head el 2,5 %. En un bosque, el número que devuelve el
  modelo es entre diez y doscientas cincuenta veces el pasto que hay para comer.

**Entonces se montó como contraste y no como cálculo.** `lib/miamiModel.ts`
devuelve la NPP, cuál de las dos ramas limita, y un veredicto de una sola
dirección sobre una cifra de forraje: `plausible`, `alto` o `imposible`. Está
enchufado en `calcularReceptividad` y aparece en el panel de Receptividad cuando
el clima del predio trae la temperatura media anual.

Sirve para una cosa concreta, que es exactamente el punto ciego de la escalera:
**con 900 mm la escalera dice 7.000 kg MS/ha/año tanto a 20 °C como a −10 °C, y a
−10 °C el modelo dice que todo el ecosistema produce 2.265.** Ese predio ahora
recibe un aviso. Lo que no puede hacer es confirmar nada, y la frase que imprime
lo dice con esas palabras.

Cuánto le creyó la literatura, para que quede escrito: r² = 0,30 contra 30 sitios
intensivos, 0,44 contra 189 puntos de Osnabrück, 0,36 contra 48 de IBP Woodlands,
y *«the overall fit […] is remarkably good […] suggesting that this simple
statistical model is quite robust»*. Entre el 30 % y el 44 % de la variación.

### Lo que no entró, y por qué

- **Nairobi, Nylsvley y Towoomba (bioma 7).** Las tres verifican el bioma y las
  tres se cayeron por motivos ya escritos: Nairobi tiene siete cifras publicadas
  con un factor 7,6, Nylsvley viene con la advertencia de su propio proveedor, y
  Towoomba es un ensayo fertilizado sin árboles. **El bioma 7 sigue vacío después
  de tres lotes dedicados**, y ahora el motivo está entendido y no sólo descrito.
- **Lamto y Olokemeji (bioma 1).** Lamto trae ANPP 830, BNPP 1.320 y TNPP 2.150
  g/m²/año de Menaut y César (1979), con serie mensual y coordenada verificada: es
  la mejor candidata de las ocho que no entraron. No entró por la misma razón que
  Nairobi —su ficha tabula cuatro fuentes y la del GPPDI da 192 **gC**/m²/año, un
  factor cercano a 2 cuando se pasa a materia seca— y por una segunda que es del
  sitio: *«normally 50-90 % of above-ground grass biomass is burned annually»*, o
  sea que más de la mitad de esa producción se la lleva el fuego todos los años.
  Olokemeji publica 680 g/m²/año para **un solo año (1957)** estimado como el
  máximo de materia total cortada, que es el método 1 de la tabla polaca.
- **Vindhyan y Rajasthan (bioma 2).** Vindhyan da 377–664 g/m²/año en tres sitios
  no pastoreados con método descrito (*trough-peak*), y es un buen dato. No entra
  porque **la entrega no pudo publicar una coordenada puntual** y sin coordenada
  no hay bioma verificado, que es la regla que el lote 04 pagó caro. Rajasthan
  llegó sin coordenada, sin fechas y sin algoritmo.
- **Los líquenes de Finlandia (bioma 6).** Una revisión regional, sin sitio ni
  coordenada ni años. Pero deja la **cuarta confirmación de la inversión del
  stock, y la más extrema**: el crecimiento anual de los pastizales de líquenes
  más productivos de Escandinavia y Finlandia es de 60 a 160 kg/ha mientras la
  biomasa en pie es de 500 a 1.500, y los rodales viejos de *Cladonia stellaris*
  pasan los 3.000 kg/ha con crecimiento anual bajo. **Hasta 50 veces más stock
  que flujo**, con recuperación de 3 a 5 años tras un pastoreo intenso.
- **El bioma 3 (coníferas tropicales) volvió vacío**, con el motivo correcto: no
  se encontró fuente primaria abierta con flujo anual de sotobosque en pinares de
  *Pinus caribaea*.

### Lo que NO se hizo, a propósito

- **No se convirtió ningún gC a materia seca para montarlo.** El factor ~2 es
  conocido y es justamente por donde se cuela el error; las cifras en carbono
  quedan citadas en la prosa y ninguna entró como kg MS.
- **No se le puso a Cascade Head la lluvia del transecto.** La ficha publica «de
  2.510 mm en la costa a 220 mm en el extremo este» y Cascade Head es el sitio
  costero, así que el 2.510 le correspondería. Queda en `null`: un extremo de
  transecto no es la lluvia medida del punto.
- **No se promedió un máximo con un mínimo para sacar una media anual.** Varias
  fichas del ORNL publican «mean monthly minimum 10,7 °C (enero)» y «mean monthly
  maximum 29,5 °C (marzo)», que son el mes más frío y el más cálido. Promediarlos
  es el error que acequia ya cometió con las máximas de POWER. Por eso Nairobi,
  que tiene lluvia publicada, igual no se puede contrastar con el modelo.
- **No se tocó el `arbolado: 800` de `cobertura.ts`** aunque ahora hay cuatro
  mediciones de sotobosque alrededor. Cambiar ese número cambia la oferta de
  forraje de todo predio con bosque y merece su propia decisión.
- **No se reclasificó la entrada de Nepal del lote 01** a `ms_sotobosque`. El tipo
  dice cómo se midió, no dónde, y reclasificarla pide volver a la fuente.

## Lote 09 — la primera fracción quedó cerrada, y en contra

El encargo de las tres fracciones pedía bajar de la NPP total al forraje por
`NPP total × fracción aérea × fracción herbácea del piso × fracción comible`, y
el frente 1 era la fracción aérea. Volvió con **tres rechazos y un cálculo
derivado**, y las cuatro cosas son correctas.

### Los tres rechazos están bien argumentados y hay que respetarlos

| fuente propuesta | por qué no entra |
|---|---|
| Mokany, Raison y Prokushkin (2006), *Critical analysis of root:shoot ratios* | Es razón de **biomasa en pie**, no reparto de producción. Compiló 786 observaciones de 266 fuentes y descartó el 62 % por muestreo de raíces no verificable. Su relación publicada con lluvia y temperatura media anual es de la razón de biomasa: usarla como función climática de producción es cambiar la magnitud sin avisar. |
| Poorter et al. (2012), *Biomass allocation to leaves, stems and roots* | El propio artículo define su objeto como *biomass allocation*. Fracciones de masa en pie y curvas de respuesta experimental; ninguna fracción ANPP/TNPP por bioma. |
| Jackson et al. (1996), *Global analysis of root distributions* | Distribución y biomasa de raíces. No es una partición de producción anual. |

Las tres son las fuentes obvias si uno busca «cuánto de la planta está arriba», y
las tres miden **lo que está parado**. Es el mismo error que ya apareció cuatro
veces en este encargo —Puno, el Delta, el Pantanal, los líquenes finlandeses— y
esta vez apareció del lado de las síntesis globales, que son las que más invitan
a usarlas como constante.

### El único cálculo que trajo es el que cierra la puerta

Montecillo, el sitio del bioma 13 que entró con el lote 06, es el único donde
cuatro publicaciones distintas repartieron **la misma serie de cosechas** en sus
dos mitades. Verifiqué las cuatro filas abriendo la ficha del ORNL:

| fuente | ANPP | BNPP | TNPP | aérea/total |
|---|---|---|---|---|
| García-Moya y Montañez Castro (1992) | 669 | 1.007 | 1.676 | 0,399 |
| Scurlock y Olson (2013) | 1.063 | 678 | 1.741 | **0,611** |
| Scurlock et al. (2002), método #5 | 609 | 1.174 | 1.783 | **0,342** |
| GPPDI Class A #67, Olson et al. (2013a) | 130 | 97 | 227 | 0,573 |

Las tres primeras en g MS/m²/año, la cuarta en g C/m²/año. Las cuatro cierran por
dentro (ANPP + BNPP = TNPP), así que no hay error de transcripción en ninguna. Y
la entrega acertó en algo que es exactamente donde se arruinan estas cadenas: el
cociente de la fila en carbono **sí** se puede usar, porque es carbono sobre
carbono, aunque su magnitud no se pueda convertir.

**La fracción aérea va de 0,342 a 0,611 —un factor 1,79— y cruza el 0,5 por el
medio: dos de las cuatro dicen que abajo hay más y dos dicen que arriba.** Ni el
signo del reparto está determinado.

Puesto contra lo que la misma ficha publica año por año, el reparto de culpas
queda claro:

| qué varía | cuánto mueve |
|---|---|
| el año, con el mismo método (1.994 / 1.422 / 1.611 g MS/m²/año) | **1,40×** el total |
| el algoritmo, en materia seca (1.676 / 1.741 / 1.783) | **1,06×** el total |
| el algoritmo, sobre el reparto arriba/abajo | **1,79×** la fracción |

El total es robusto. Lo frágil es dónde quedó, y eso es lo que acequia necesita.
**Conclusión: la cadena de tres fracciones no se puede construir con fracciones
publicadas.** La primera ya entra con un factor 1,79 y no hay ninguna síntesis
global que la dé.

De paso, dos correcciones a lo que estaba montado:

- La ficha de Montecillo tiene **cuatro** filas publicadas, no tres. La cuarta no
  entra en el rango de kg MS porque está en carbono, pero existe y ahora está
  anotada.
- La entrega etiquetó las cuatro filas con `tratamiento: "quemado"`, y eso es
  media verdad. El sitio es una **clausura sin pastoreo**; el incendio de febrero
  de 1986 fue accidental y cayó adentro de la ventana de tres años que la ficha
  promedia. Que el fuego cada 4-5 años sea el régimen histórico del lugar —y
  además intencional, «to improve forage quality during the dry season»— no lo
  convierte en el tratamiento del ensayo.

### Lo que el lote destapó sin buscarlo: la segunda fracción ya estaba en casa

Si la primera fracción no se puede fijar, la pregunta es cuál de las tres mueve
de verdad el número. Y la respuesta estaba en `forrajeMedido.ts` desde el lote
02, sin que nadie la mirara como fracción: **tres sitios montados publican el
numerador y el denominador en la misma tabla y en la misma unidad.**

| sitio | capa herbácea | aéreo total del sitio | herbácea/total | dosel |
|---|---|---|---|---|
| Waring's Woods, Pseudotsuga | 6 | 1.540 g MS/m²/año | **0,0039** | cerrado, 4,9 % herbáceo |
| Cascade Head 1A, aliso rojo | 41 | 1.630 g MS/m²/año | 0,0252 | 35,2 % herbáceo |
| Very Shallow 23-31 PZ, Edwards Plateau | 1.840 | 2.000 lb/acre/año | **0,92** | pradera con leñosas dispersas |

**De 0,0039 a 0,92: un factor 236.** Y no lo mueve el clima: los dos sitios de
Oregón están a 200 km, producen casi lo mismo de rodal y su sotobosque difiere
6,5 veces. El Edwards Plateau es el hallazgo más barato de todo el encargo: la
ficha del NRCS publica desde el lote 02 la producción de gramíneas y hierbas
(1.840 lb/acre) al lado del total del sitio incluyendo arbustos y árboles (2.000
lb/acre), y ese 0,92 es una fracción herbácea publicada que estaba en el repo
hace cinco días.

Eso cambia a qué apuntar: **la fracción que decide es la segunda, y la variable
que la mueve es cuánta luz llega al piso.** Que es, justamente, lo único de las
tres que acequia ya mide en cada predio.

## La revisión de los kg/ha por cobertura de `cobertura.ts`

Pedida aparte y hecha el 17/10/2026. Los cuatro pesos que esa ruta usaba para
ponderar forraje por clase de cobertura —**pastizal 3.500, arbustal 1.800,
cultivo 4.500, arbolado 800** kg MS/ha·año— no tenían fuente, igual que la
escalera de `prodForrajera`. Lo que cambió es que ahora hay diez mediciones para
contrastarlos.

### Qué dicen las mediciones de cada peso

| peso | lo medido | veredicto |
|---|---|---|
| pastizal 3.500 | 350 a 10.630 en seis sitios (tundra 350-960, Puno 626-1.958, Edwards 825-2.578, Dakota 2.643-3.063, Montecillo 6.090-10.630, Delta 6.700-8.250) | cae adentro, y adentro de un **factor 30**. Queda por encima de cuatro de los seis sitios. |
| arbustal 1.800 | un solo sitio: la frygana de Lesbos, 300-5.800 | cae adentro de una banda de un único sitio, con un factor 19 |
| cultivo 4.500 | **nada** | sin una sola medición, antes y después |
| arbolado 800 | 60 bajo conífera cerrada, 410 bajo aliso, 378-940 en robledal-carpinal (+ 1.300-1.700 en Nepal, sin montar) | cae adentro para hoja ancha y queda **13 veces alto** para conífera densa |

### Dos errores de cálculo, además de los pesos

Mirando la fórmula aparecieron dos cosas que no eran los coeficientes:

1. **Un predio todo manglar imprimía «0 kg MS/ha·año».** El guard era `veg_pct >
   0`, y el manglar y el musgo/liquen cuentan como vegetación; el numerador
   quedaba en cero con el denominador protegido en 1. Cero es un número, y salía
   en pantalla con el mismo formato que una medición.
2. **El protector de la división escalaba el resultado.** El denominador era
   `Math.max(1, suma_de_los_pct)`, así que cualquier predio con menos de 1 % de
   clases pastoreables salía multiplicado por ese porcentaje: con 0,5 % de
   pastizal devolvía la mitad del peso del pastizal.

### Qué quedó

Los cuatro pesos se fueron. `forrajePorCobertura` ahora devuelve una **banda**
—mínimo y máximo— derivada de `FORRAJE_MEDIDO`: cada medición declara su
`clase_wc`, la clase de WorldCover que un satélite vería en ese sitio, y la banda
de una clase es el mínimo de los mínimos y el máximo de los máximos de sus
sitios. Hay un test que la vuelve a derivar por otro camino, así que las dos no
pueden separarse.

La salida dice además **sobre qué parte del predio se calculó** y qué clases
quedaron afuera por no tener medición, que es el cultivo. Y no se guarda con el
resto del análisis: se calcula al mostrarlo, así que un proyecto guardado antes
de hoy también recibe la banda en vez del número que tiene adentro.

Un detalle del campo nuevo que vale por sí solo: **Waring's Woods es bioma 8 y
clase 10 a la vez** —pradera templada por RESOLVE, dosel cerrado de conífera por
WorldCover—, y esa discordancia no es ruido del dato, es el dato. El bioma dice
qué clima hay; la clase dice qué hay encima; y lo que decide el forraje es lo
segundo.

### Lo que NO se hizo, a propósito

- **No se montó Nepal** (1.300-1.700 kg MS/ha/año de NPP herbácea en bosque
  húmedo tropical, Gautam & Mandal 2016), que está citado en dos archivos desde
  el lote 01. Le falta la coordenada publicada, y sin eso no entra: es la regla D
  del encargo anterior. Consecuencia declarada: **el techo de la banda del
  arbolado, 940, está sesgado bajo.**
- **No se estrechó la banda con la lluvia.** Se podría cruzar con el clima del
  predio para descartar los sitios de lluvia muy distinta, y sería otro cálculo
  sin fuente encima de uno que sí la tiene. La lluvia la usa `prodForrajera`, y
  los dos números siguen al lado a propósito.
- **No se le puso `temp_media_c_anual` a Lesbos** aunque su fuente publica 17 °C
  de media. La lluvia que acompaña esa media es la normal de 415 mm, y los campos
  de lluvia de la entrada son las dos temporadas medidas (354 y 797 mm):
  emparejar una normal con una temporada es mezclar dos cosas, que es la regla E.
- **No se tocó `prodForrajera`.** Sigue sin fuente, y después de este lote es la
  única de las dos rutas de forraje que no tiene ninguna.
