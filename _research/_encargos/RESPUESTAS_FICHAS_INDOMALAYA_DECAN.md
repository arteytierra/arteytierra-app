# Fase 4, lote 1 — el Decán central (ECO_ID 290)

Entregado el **23/10/2026**, montado el mismo día. La entrega está archivada en
`C:\Arte y Tierra\encargos-gpt\entregas\fichas-indomalaya\01.json` con un bloque
`_claude` que resume esto en campos.

**Una oración:** la entrega no propuso ningún modificador y el encargo le había
dicho que no lo hiciera, con el mismo argumento que ella repitió; los primarios
dicen que el argumento estaba cambiado de variable, así que el modificador se
monta igual, y en el camino apareció que esta ecorregión contradice un número
que calcula la propia app.

---

## Lo primero: la culpa del único faltante es del encargo

`ENCARGO_FASE_4_FICHAS_INDOMALAYA.md`, en la regla de los modificadores, dice:

> **Y si es un gradiente, no se propone delta.** Hay ecorregiones donde una
> mitad es apta y la otra no —típicamente un gradiente de lluvia o de napa— y un
> modificador único mentiría en una de las dos. Ya se decidió que esos casos se
> arreglan con texto: `modificadores_propuestos: []` y la explicación en `notas`.
> **En este reino va a pasar en el Decán, que va de 500 a 1.200 mm.**

La entrega devolvió `modificadores_propuestos: []` y en `notas` escribió: «El
amplio gradiente regional de lluvia, de 500 a 1.200 mm, cambia el balance entre
secano, drenaje y erosión. No se propone un delta único para la aptitud de
huerta.»

**Eso no es un criterio de la entrega: es obediencia.** Le dijimos cuál iba a ser
el caso, con qué números y qué contestar. Y el mismo encargo, doce líneas más
arriba, pone como ejemplo de una razón bien escrita —de las que **sí** justifican
un delta— esta frase:

> «los vertisoles negros del Decán se agrietan en la seca y acumulan la lluvia
> del monzón en el perfil, lo que sostiene un cultivo de secano sin riego»

El encargo se contradice: usa el mecanismo del vertisol del Decán como modelo de
una razón que alcanza para mover un número, y a la vez prohíbe mover el número
del Decán. Entre las dos instrucciones la entrega eligió la prohibición, que es
la más conservadora, y eso es lo correcto cuando hay contradicción.

**Corregido en `reglas/` el 23/10/2026** para los 15 lotes que faltan del bloque
1, que son todos del mismo cinturón y habrían heredado la misma abstención.

---

## Lo segundo: cuál es el gradiente de verdad

El rango de 500 a 1.200 mm es cierto y está en la fuente que la entrega citó.
Pero en esa misma página hay dos cosas que la entrega no bajó y que lo cambian.

**Uno: el gradiente de lluvia no es un continuo, son dos zonas cartografiadas.**
Virmani et al. (1982) reparten los vertisoles de la India central en dos zonas de
producción:

| zona | dónde | lluvia | sobre la ETP |
|---|---|---|---|
| no asegurada | Maharashtra y norte de Karnataka | 500 a 750 mm | 40 a 48 % |
| asegurada | de Hyderabad a Gwalior | 750 a 1.250 mm | 43 a 77 % |

**Dos, y es lo que decide: la variable que manda no es la lluvia, es la
profundidad del perfil.** La capacidad de agua útil es de unos **230 mm en el
vertisol profundo** y de unos **120 mm en el somero**, y de eso depende todo:

> «On the shallower vertic soils, cropping is confined to the rainy season
> because the limited water storage capacity is insufficient to support crop
> growth for very long after the rains have ceased.»

Con 230 mm guardados se cosecha después del monzón **sin una gota de riego**;
con 120 el ciclo se corta cuando paran las lluvias. Dos predios con la misma
lluvia y distinta profundidad están en situaciones opuestas, y dos predios con
distinta lluvia y el mismo perfil profundo están en la misma.

Eso tiene una consecuencia práctica que la ficha ahora dice: **acequia ya mide
esa variable.** El panel de suelo calcula la reserva de agua útil del perfil y la
clasifica en baja, moderada o alta. La ficha manda a mirar ese número antes que
el total de lluvia. Un gradiente que la app no puede leer obliga a abstenerse;
uno que la app sí lee se puede convertir en una instrucción.

**Resultado:** el `huerta −10` del bioma **se mantiene** —un solo delta no puede
decir las dos cosas, y en eso la entrega tenía razón— y lo que se reescribe es la
razón, que es lo que llega a la pantalla. La del bioma dice «sin riego o cosecha
de agua, la huerta queda parada varios meses del año», y acá el agua no viene del
riego ni de una cisterna: viene del perfil.

---

## Lo tercero: el uso que el bioma no nombra

El bosque tropical seco global trae `pasturas +10` y `huerta −10`. **No trae
nada de forestal**, y acá es lo que la tierra arruinada acepta.

Se perdió cerca del **80 %** del hábitat natural. Y la especie que define la
ecorregión vuelve igual. De la ficha de formaciones de la FAO, sobre *Hardwickia
binata*:

> «an evergreen species with light crown cover, perfectly suitable for drought,
> adapted to fire, and resistant to most disturbances. Its deep tap roots
> enables it to exploit the groundwater reserves. **It can regenerate even on
> soils that have been compacted by livestock.** It is found more frequently on
> very superficial or skeletal soils.»

Más el rebrote de tocón y la recuperación de los plantines después del fuego. Es
el perfil exacto de una especie de restauración: regenera donde el ganado
compactó, sobre suelo esquelético, después de quemarse.

El contrapeso está en One Earth y hay que decirlo en la misma razón, porque sin
él el número se lee como una licencia de corte: su madera es **la más dura y
pesada de la India** y resistente a las termitas, se usa para ruedas de carro,
molinos de aceite, morteros y arados, y por eso «is widely sourced». El delta
vale para rearmar el monte, no para cosechar el que queda en pie.

**Montado: `forestal +15`.** Es el único positivo del bloque de Indomalaya, y por
eso hubo que declararlo como excepción en el test del bloque (ver abajo).

**`pasturas` queda heredado y sin tocar**, a propósito. El +10 del bioma viene con
la advertencia de que «al final de la seca el suelo queda expuesto justo cuando
llegan las primeras lluvias fuertes», y acá eso no es una cautela genérica: está
medido. No había nada que corregir, así que no se repite.

---

## Lo cuarto, que no estaba pedido: esta ecorregión contradice a la app

Esto es el hallazgo del lote y vale más que el modificador.

**Lo que la app hace.** `lib/suelos.ts` asigna el grupo hidrológico por la
conductividad saturada de la capa más limitante del primer metro, con los
umbrales del NRCS: por debajo de 3,6 mm/h es **grupo D**, con esta leyenda
textual en el código —«Suelos arcillosos/expansivos. Poca infiltración, alta
escorrentía y anegamiento»— y CN 80 para pastura. De ahí sale también el
coeficiente de escorrentía **anual** que alimenta el rendimiento de la represa:
`COEF_BASE_GRUPO` da 0,28 para D y 0,13 para B, modulado por la cobertura.

**Lo que está medido adentro de esta ecorregión.** El ICRISAT tiene en Patancheru,
al lado de Hyderabad, microcuencas de 2 a 5 ha sobre vertisol profundo, vertisol
de profundidad media y alfisol, con escurrimiento y pérdida de suelo medidos de 8
a 12 años, y una serie hidrológica de 1976 a 2010:

| | vertisol (arcilla, K baja) | alfisol (arenoso, K alta) |
|---|---|---|
| años normales, 600 a 900 mm | **7 a 11 %** | **16 a 17 %** |
| años secos, menos de 500 mm | menos de 2 % | menos de 2 % |
| vertisol profundo **en barbecho** | **17 %** | — |

**La arcilla escurre la mitad que la arena.** Al revés de lo que dice cualquier
tabla por textura y al revés de lo que calcula acequia. Los autores lo explican:
el alfisol se encostra y se sella, y el vertisol se agrieta al principio de la
temporada y además guarda muchísima agua.

Y con cultivo, el número que la app daría para el vertisol —grupo D, 0,28 por el
factor de cultivo en línea, 1,15— es **32 %**, contra un 7 a 11 % medido. En
barbecho la app daría 42 % contra 17 % medido. En el alfisol arenoso, en cambio,
la app da 15 % contra 16 a 17 % medido, o sea **acierta**.

Eso es exactamente la falla que nombra `CLAUDE.md`: «un coeficiente de
escorrentía mal puesto no tira una excepción, sale en el informe, y alguien
dimensiona una represa con eso». Acá el error va para arriba, así que la represa
se dimensiona para un agua que no llega: tres a cuatro veces más chica de lo que
debería ser el vaso, o mejor dicho, un vaso tres o cuatro veces más grande que el
agua disponible.

**Qué se hizo con esto.** El aviso quedó escrito en el campo `suelos` de la ficha,
que es el texto que llega al panel y al informe, con un test que lo sostiene.
**No se tocó el motor**, y eso es deliberado: Garg et al. es un sitio, un clima y
un manejo, y cambiar `COEF_BASE_GRUPO` para suelos expansivos a partir de
Patancheru sería reemplazar un número general por uno local. Falta además el paso
previo: **la app no sabe reconocer un suelo expansivo.** SoilGrids no da COLE ni
límite de contracción; se podría inferir de arcilla alta más mineralogía
esmectítica, y eso es trabajo de otro lote. Queda anotado como pendiente y
abierto como tarea aparte.

### Por qué la curva de infiltración va entera en la ficha

Porque un solo número miente. Virmani y Swindale (1984), vertisol del ICRISAT:

| desde el inicio | infiltración |
|---|---|
| 0 a 0,5 h | 76 mm/h |
| 0,5 a 1 h | 34 mm/h |
| 1 a 2 h | 4 mm/h |
| después de 144 h | 0,21 ± 0,1 mm/h |

Factor 360 entre la primera media hora y el estado húmedo. Cualquier Ksat único
describe el suelo agrietado o el suelo sellado, nunca los dos, y la obra se
diseña con uno de los dos.

### Y la advertencia de diseño, que es la gemela de la del Pilbara

La obra publicada para este suelo no es una zanja de infiltración a nivel: es un
**camellón ancho con surco a pendiente del 0,4 al 0,8 %**, o sea un drenaje, con
desagües de parcela y cauces empastados, porque el limitante del monzón acá es el
exceso de agua y el anegamiento. En el Pilbara el error era encauzar la lámina; en
el Decán el error es retenerla en un perfil que ya está lleno. Las dos veces la
familia de herramientas de acequia —swales, líneas clave, curvas a nivel— empuja
en la dirección equivocada, y las dos veces el motor no lo sabe.

Con un límite que hay que decir, porque está en la misma fuente: el camellón bajó
el escurrimiento de 35 a 40 mm en vertisol y de 15 a 20 en alfisol, y la pérdida
de suelo del 30 al 60 %, **pero no en los eventos de alta intensidad** — y entre
una y dos tormentas grandes se llevan la mayor parte del total anual. La obra
funciona salvo justamente cuando más importa.

### El barbecho, que es el eslabón que cierra todo

Más de la mitad de la superficie de vertisol se deja **en barbecho durante toda
la temporada de lluvia** para llenar el perfil y cosechar después del monzón. O
sea: el suelo está desnudo cuando cae el 80 a 90 % de la lluvia anual. Un
vertisol profundo en barbecho escurre 17 %, tanto como la arena, porque le queda
menos almacenamiento libre. Y en Sholapur, sobre pendiente del **1 al 2 %**, eso
midió **50 cm de suelo perdidos en cien años**.

El daño no lo hace el cultivo ni el animal: lo hace el barbecho, y el barbecho
existe porque es la única forma de tener una cosecha en la seca. Es un buen
ejemplo de por qué el campo `suelos` es el que importa.

---

## Verificación de las cuatro fuentes, una por una

| fuente | abre | qué verificó | veredicto |
|---|---|---|---|
| One Earth 290 | 200, 61.564 bytes | ID 290, 24.069 mil ha, «almost 300 species of birds», corredora de Jerdon, «sixteen protected areas cover almost 3 percent», bosques dominados por Hardwickia | **todo cierto** |
| FAO x5493e (vertisoles) | 200, 75.170 bytes | 500 a 1.200 mm, 80 a 90 % de junio a septiembre, abril a junio cálidos y secos, inviernos secos y templados, material parental básico, drenaje impedido, Inceptisoles vérticos y Fluvents | **todo cierto** |
| FAO w4442e (formaciones) | 200, 78.799 bytes | las series de teca y de Hardwickia, la teca en los mejores sitios y sólo en suelo bien drenado | **cierto** |
| MPKV | 200, 90.262 bytes | la lista de cultivos de las zonas de escasez y meseta central | **cierto pero de la región vecina** |

### El problema con MPKV

La jurisdicción de MPKV son los **diez distritos de Maharashtra occidental**
—Nandurbar, Dhule, Jalgaon, Nashik, Ahmednagar, Pune, Solapur, Satara, Sangli y
Kolhapur—, el 38 % del estado. Eso está a sotavento de los Ghats y cae en la
ecorregión vecina de **matorral espinoso del Decán (315)**, no en la 290, cuya
porción de Maharashtra es Vidarbha, al este, bajo otra universidad agraria.

La lista de cultivos sobrevive porque el documento de la FAO cubre la zona que sí
corresponde —de Hyderabad a Gwalior, más Maharashtra y el norte de Karnataka— y
nombra los mismos cultivos: sorgo, cártamo, trigo y garbanzo en post-monzón,
sorgo o algodón con guandul intercalado en la lluvia, maíz con guandul en el
sistema mejorado, y soja y trigo en la zona asegurada. La fuente quedó en
`fuentes` **con el alcance escrito en un comentario del código**, citada sólo por
el repertorio de cultivos.

### Lo que no se usó, con la ruta nombrada

- **NBSS&LUP.** El encargo lo nombra como la cartografía de suelos de la India y
  es la fuente correcta del reparto dentro del polígono. No se consultó en este
  lote. **Es la primera cosa a buscar para los 15 lotes que faltan del bloque 1**,
  porque todos son del mismo cinturón de vertisoles y alfisoles rojos.
- **HWSD v2 y SoilGrids.** La entrega declaró honestamente que no los extrajo
  (`base_de_suelos_usada`), y es la única ficha del bloque sin porcentajes. Se
  dejó así y la ficha lo dice. Las otras 32 los traen porque el relevamiento de
  septiembre los extrajo; no hay en esta máquina ni los rásteres ni la
  herramienta para ponderar por polígono.
- **Pathak 2013 y Garg 2021.** De los dos **se leyó el resumen y no el trabajo**:
  los dos son de Elsevier y están detrás de pago, y la copia de acceso abierto de
  Pathak en el repositorio del ICRISAT devuelve **403 incluso desde un navegador
  real** (probado con curl pelado, con User-Agent y referer, y con el navegador
  del agente). Todos los números que la ficha les atribuye están textualmente en
  el resumen publicado. Lo que falta del cuerpo es la pérdida de suelo en
  toneladas por hectárea, y hay un test que verifica que la ficha **no** declara
  ninguna.

---

## Correcciones a la entrega

| # | qué decía | qué dice el primario |
|---|---|---|
| 1 | «Sándalo (*Santalum album*)» entre las especies | La ficha de la ecorregión nombra ***Pterocarpus santalinus***, el sándalo rojo, endémico de estos cerros. La FAO ubica a *Santalum album* en Madrás y Mysore, entre 600 y 1.200 m, que es otra región y otra altura. Corregido, y es la mejor corrección del lote: el sándalo rojo es uno de los árboles más traficados del mundo y una especie emblema de esta ecorregión |
| 2 | «*Acacia arabica*» entre las especies | La FAO la pone en la serie espinosa «de la llanura del Decán y Guyarat», que es la ecorregión vecina. La ficha de la 290 no la nombra. Sacada. Y el nombre está obsoleto: hoy es *Vachellia nilotica* |
| 3 | «en el centro de India también aparecen sabanas con *Albizia amara*» | La FAO pone la serie de *Albizia amara* en **el sur de India** y en la llanura de Madrás, no en el centro. Pero la especie sí corresponde, y mejor de lo que la entrega creía: la ficha de la ecorregión la nombra como **co-dominante** de la asociación característica, no como un extra de sabana. Promovida |
| 4 | no nombraba *Boswellia serrata* | La ficha de la ecorregión la nombra entre las especies del norte. Agregada: es el incienso de la India, un árbol de resina de suelos esqueléticos |
| 5 | no nombraba *Pterocarpus marsupium* | Nombrada por la ficha de la ecorregión entre las del sur. Agregada |
| 6 | «La fuente abierta consultada no da un total de mamíferos» | La ficha de la ecorregión sí: **82 especies, ninguna endémica**. El hueco que la entrega declaró estaba cerrado en la fuente que no usó |
| 7 | *Acacia catechu* | Correcto para la ecorregión, que la nombra. Se escribe con el nombre aceptado hoy, *Senegalia catechu* |
| 8 | no daba la estructura del bosque | 15 a 25 m de dosel superior sobre 10 a 15 m, lianas en el bosque maduro, sotobosque escaso; y donde no hay teca, Hardwickia forma un bosque de dos pisos de 20 m sobre 15 en Chittoor, Cuddapah y Kurnool. Agregado |
| 9 | «La mayor parte del hábitat natural fue convertida» | El número está publicado: **alrededor del 80 %**, con bloques de más de 5.000 km² sobre los bordes sur y este. Agregado |
| 10 | no mencionaba el sobrepastoreo | Las dos fuentes lo nombran entre las tres amenazas principales, junto con la conversión a plantaciones y la leña. Y la ficha de la ecorregión agrega una cuarta que nadie esperaba: «large hydroelectric projects present more severe, high-impact threats» |
| 11 | `especies` traía 7 entradas | Van **8**, una más de lo que pide el encargo: la asociación característica son dos especies y el acompañamiento se parte en norte y sur, así que con siete una de las dos mitades quedaba sin representar |

### Los ids de cultivo: cinco de doce no servían

Y acá hay una lección de formato, no de contenido.

| propuesto | qué pasa |
|---|---|
| `mijo_perla` | el id es **`mijo`**; «Mijo perla» es el nombre |
| `maiz` | el id es **`maiz_tropical`** |
| `gandul` | el id es **`guandul`**; «Guandul / gandul» es el nombre |
| `cartamo` | **no existe en el catálogo** |
| `poroto_urad` | **no existe en el catálogo** |

**Tres de los cinco salieron de leer la columna del nombre en vez de la del id**,
que es justo lo que la primera regla del anexo pide no hacer. El anexo se mandó
por primera vez en este lote —se escribió recién el 22/10/2026— y evidentemente
una tabla de tres columnas invita a copiar la del medio. Corregido en el anexo
con la trampa escrita y los tres casos como ejemplo.

Lo bueno: **`cultivos.test.ts` ya tenía el test que frena esto** —«todo id de
cultivo existe en el catálogo de especies», con el mensaje `ficha → id`— así que
los cinco habrían reventado la compuerta antes de llegar a producción. El costo
de este error es un ciclo de compuerta, no una falla en pantalla.

### El cártamo, que es la ausencia que importa

El cártamo no es un cultivo cualquiera en esta ficha: es **el oleaginoso de
post-monzón del vertisol**, el que se siembra sobre agua almacenada, que es el
mecanismo entero de la ecorregión. La fuente de la FAO lo nombra cuatro veces y
MPKV lo lista en el rabi de las dos zonas.

**No se agregó al catálogo, y es una decisión.** Una entrada de `lib/especies.ts`
necesita seis números: `tbase_c`, `gdd_ciclo`, `tmin_letal_c`, `agua_mm`, `kc` y
las clases Köppen. De FAO-56 salieron dos, leídos: **Kc medio 1,0 a 1,15** y
**ciclo de 125 a 145 días** (tablas 11 y 12; las entradas de la tabla 11 son de
California, no de la India). Los otros cuatro los habría puesto yo a ojo, y esos
números deciden qué cultivos la app ofrece y cuánta agua calcula. Bajo el
contrato de `motor-de-calculo` eso no se escribe.

**La ruta para el que lo haga:** FAO-56 tablas 11 y 12 para Kc y etapas; falta un
trabajo de temperaturas cardinales para `tbase_c` y `gdd_ciclo`, y el
requerimiento hídrico estacional publicado para `agua_mm`. Lo mismo vale para el
poroto urad (*Vigna mungo*), con menos urgencia: el catálogo ya tiene garbanzo,
guandul y caupí cubriendo el rol de legumbre.

La ficha quedó con **10 ids**, dentro de los 8 a 15 que pide el encargo.

---

## Lo que se montó

| archivo | qué |
|---|---|
| `lib/ecorregionesIndomalaya.ts` | `290: 'decan_central_hardwickia'`, y el encabezado pasa de 33 ECO_ID / 32 fichas a **34 / 33** |
| `lib/biomasRegionalesIndomalaya.ts` | la ficha, seis fuentes nuevas, y una sección nueva del encabezado que explica por qué esta ficha no sale de la regla del −25 del bloque |
| `lib/biomasGlobales.ts` | «las 32 fichas de Indomalaya» → «las 32 fichas de Indomalaya **que caen en este bioma**», para que siga siendo cierto |
| `lib/biomasRegionalesAustralasia.ts` | igual, «las 32 fichas **húmedas** de Indomalaya» |
| `tests/unit/contexto/aptitudDecan.test.ts` | **nuevo, 16 tests** |
| `tests/unit/contexto/aptitudIndomalaya.test.ts` | `FUERA_DE_LA_REGLA` y `DE_LA_REGLA()`: los cuatro invariantes del bloque pasan a valer sobre el cohorte de 32 |
| `tests/unit/contexto/ecorregiones.test.ts` | 243 → **244** fichas, 321 → **322** ECO_ID, «los 33 ECO_ID» → 34 |
| `tests/unit/contexto/fichasSaberes.test.ts` | 243 → **244** |

El catálogo queda en **244 fichas regionales y 322 ECO_ID con ficha**, de las 846
de RESOLVE, en diez bloques disjuntos.

### Los cuatro invariantes que esta ficha rompe a propósito

El test del bloque Indomalaya verificaba cuatro cosas sobre las 32 fichas, y las
cuatro son consecuencia de la regla `valor = −25 × fracción`:

1. todas las correcciones son de `huerta`;
2. ningún delta es positivo, porque la regla no puede darlo;
3. toda razón dice «Regla de acequia» o «Se cancela»;
4. las fuentes del delta son HWSD y SoilGrids.

Esta ficha rompe las cuatro, y está bien que las rompa: es de **bioma 2** y no de
bioma 1, su número no sale de ninguna fracción de suelo, y su positivo es
forestal. La solución no fue aflojar los invariantes sino **acotarlos al cohorte
que los produjo**, con una constante `FUERA_DE_LA_REGLA` que obliga a quien
agregue la próxima ficha seca a pasar por ahí y leer el motivo.

El test hizo exactamente lo que tenía que hacer: no me dejó montar un positivo en
silencio.

---

## Pendientes que abre este lote

1. **El motor de hidrología no sabe qué es un suelo expansivo.** Es el pendiente
   grande. Dos pasos: primero reconocerlo —SoilGrids no da COLE ni límite de
   contracción, habría que inferirlo de arcilla alta más mineralogía
   esmectítica—, y después decidir qué hacer con el grupo hidrológico y con
   `COEF_BASE_GRUPO`. Mientras eso no exista, la única advertencia que recibe el
   usuario es el texto de esta ficha, y sólo si cae en esta ecorregión.
2. **Falta el gemelo de este hallazgo para el swale.** El motor de swales sigue
   sin mirar la ficha antes de proponer una zanja de infiltración, igual que con
   el Pilbara. Van dos ecorregiones donde la herramienta empuja al revés.
3. **El cártamo y el poroto urad**, con la ruta de arriba.
4. **NBSS&LUP** para el reparto de suelos de los 15 lotes que faltan del bloque 1.
5. **`ANEXO_IDS_FICHAS.md` sigue sin regenerarse**: está fechado el 17/09/2026 con
   222 fichas y no conoce ni `pilbara_matorral` ni `decan_central_hardwickia`, así
   que ninguna de las dos podría recibir una práctica histórica en la fase 6.

---

## Para el lote 2

El bloque 1 sigue por el **297, North Deccan dry deciduous forests**. Mismo
cinturón, mismo reparto de trabajo: descripciones, estructura del bosque y
binomiales van a GPT, que en este lote los hizo bien; los números de suelo, de
escurrimiento y de erosión los bajo yo.

Tres cosas que cambian para ese lote:

1. **La regla del gradiente ya está corregida en `reglas/`.** Si una ecorregión
   del Decán tiene un gradiente, ahora el encargo pide identificar **la variable**
   del gradiente y preguntarse si la app la mide; sólo se abstiene si no la mide.
2. **El anexo de ids va corregido**, con la trampa de la columna del nombre
   escrita y los tres casos de este lote como ejemplo.
3. **Pedirle NBSS&LUP explícitamente**, que el encargo ya nombra y este lote no
   usó.
