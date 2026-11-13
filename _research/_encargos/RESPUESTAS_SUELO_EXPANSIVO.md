# El suelo expansivo: reconocerlo, y avisar en vez de corregir

*12/11/2026. Cierra el pendiente que abrió el lote del Decán el 23/10/2026
(`RESPUESTAS_FICHAS_INDOMALAYA_DECAN.md`, sección «Lo cuarto, que no estaba
pedido»), que era el único de ese lote que exigía tocar el motor.*

El encargo tenía un paso previo declarado: **«la app no sabe reconocer un suelo
expansivo»**. Eso es lo que se resolvió, y con eso el aviso.

---

## 1. La pregunta, que no era la del encargo

El encargo propuso tres caminos para inferir el suelo expansivo: arcilla alta
más mineralogía esmectítica, la clase WRB «Vertisols» de HWSD v2, o la clase
textural que ya calcula `textura.ts`. Los tres se evaluaron y **ninguno de los
tres es el que quedó**:

- **La clase textural sola es justamente la que se equivoca.** El Latossolo del
  Cerrado tiene 47,1 % de arcilla y no se hincha; el vertisol de Gezira tiene
  50,6 % y se hincha. Los dos son «arcillosos» para el triángulo del USDA. Si la
  textura alcanzara, el error del Decán no existiría.
- **HWSD v2 no tiene servicio de consulta por punto**, igual que PEATMAP: habría
  que empaquetar y rasterizar a mano, que es la clase de trabajo que produce un
  mapa plausible y corrido unos kilómetros. Queda anotado, no descartado.
- **La mineralogía no la entrega nadie** a escala global por punto.

Lo que sí hay, y lo dice la propia fuente del dato, es la **CEC**. Poggio et al.
(2021), el trabajo que publica SoilGrids 2.0, al evaluar sus propios mapas
escribe que el mapa de CEC «identifica claramente grandes regiones de arcillas
muy meteorizadas (p. ej. el sudeste de Estados Unidos y de China, el centro de
Brasil) y de arcillas 2:1 de CEC alta (p. ej. los vertisoles de *black cotton*
de la meseta del Decán y de Sudán)».

O sea: la variable estaba nombrada en el paper del dato que la app ya usa, y lo
que faltaba era pedirla. `cec` no viajaba en la consulta.

---

## 2. Los umbrales, los tres de WRB y leídos del primario

El PDF del **WRB 2022** (4.ª ed., 18/12/2022) abre con `curl` pelado y se leyó
entero en las secciones que importan:

| umbral | de dónde sale |
|---|---|
| **arcilla ≥ 30 %** | criterio 1 del *horizonte vértico* (§3.1.40) y del *protovértico* (§3.1.32) |
| **actividad ≥ 24 cmol(c)/kg de arcilla** | complemento exacto de las *propiedades siderálicas* (§3.2.13): «≥ 8 % de arcilla y una CEC (por NH4OAc 1 M, pH 7) de < 24 cmol(c)/kg de arcilla» |
| **LEP ≥ 6 %** | el vértico «usually» tiene COLE ≥ 0,06, y el protovértico lo acepta **solo**, en su criterio 2d |

Y dos cosas más que el WRB dejó servidas:

- **La definición de campo** que el aviso le pasa al usuario: grietas de
  contracción de ≥ 0,5 cm que abren y cierran con el agua (§3.2.12), agregados en
  cuña inclinados entre 10° y 60°, caras de deslizamiento en ≥ 10 % de las caras
  de los agregados.
- **La frase que corrobora toda la hidrología del lote**, en §3.2.12: las grietas
  «controlan la infiltración y la percolación del agua, incluso cuando están
  rellenas de material de la superficie».

Los métodos coinciden, y eso había que verificarlo porque el umbral es
método-específico: la CEC de WoSIS —el dato con el que SoilGrids se entrena— está
«buffered at pH 7» (Batjes et al. 2020), igual que la de WRB.

---

## 3. Lo medido, que es lo que decide el diseño

Doce puntos donde se sabe la respuesta. Arcilla y actividad son el promedio
ponderado de 30 a 100 cm leído de la API de consulta de SoilGrids (250 m); en los
cinco puntos de Estados Unidos, `taxorder` y `lep_r` salen de Soil Data Access en
el mismo punto. Medido el 12/11/2026.

| punto | arcilla | actividad | SSURGO | veredicto |
|---|---|---|---|---|
| Heiden, Riesel TX | 49,1 % | 68 | **Vertisols**, LEP 12,0–12,2 | medido |
| Capay, Sacramento CA | 36,0 % | 70 | **Vertisols**, LEP 7,8–9,9 | medido |
| Gezira, Sudán | 50,6 % | 68 | — | posible |
| Entre Ríos, AR | 46,3 % | 62 | — | posible |
| ICRISAT, Patancheru | 44,1 % | 64 | — | posible |
| Darling Downs, AU | 61,9 % | 56 | — | posible |
| Argiudol de Pergamino, AR | 32,1 % | 86 | — | **posible (falso positivo)** |
| Latossolo del Cerrado, BR | 47,1 % | 16 | — | nulo |
| Turbera de Riau, Sumatra | 50,4 % | 18 | — | nulo |
| Wedowee, Piedmont de GA | 41,4 % | 14 | Ultisols, **LEP 1,5** | nulo |
| Clarion, Boone IA | 24,8 % | 77 | Mollisols, **LEP 2,5** | nulo |
| Llanura del Pilbara, AU | 25,9 % | 103 | — | nulo |

Tres cosas de esa tabla, y cada una cambió el diseño:

**El corte de 24 cae en un hueco vacío.** Los cuatro suelos de arcilla de baja
actividad miden de 14 a 18; todo lo demás, de 56 para arriba. No hay nada entre
18 y 56. El umbral publicado no está decidiendo casos de borde: separa dos
poblaciones. Eso importa porque la variabilidad entre laboratorios de la CEC a
pH 7 es del 18 % (rango 13 a 25 %) y se propaga entera al cociente; con un
umbral en medio de la nube, el aviso sería una moneda.

**El piso de arcilla hace el trabajo fino, y lo justifica una medición.** Clarion,
en Iowa, mide actividad 77 —su arcilla es esmectítica de verdad, es till— y
**LEP 2,5 % medido**: no se hincha porque tiene 24,8 % de arcilla. El piso de
30 % de WRB lo deja afuera, y al Pilbara también. La actividad dice de qué está
hecha la arcilla; la cantidad decide si eso se nota. Sin este punto habría sido
tentador usar la actividad sola.

**Y el tramo de control no es un detalle de prolijidad.** En superficie una parte
grande de la CEC la aporta el humus, no la arcilla, y el cociente miente para
arriba. Clarion lo muestra dentro del mismo perfil: 94 cmol/kg de arcilla en los
primeros 5 cm contra 60 a los 100-200 cm, con la misma arcilla. El cálculo va
entre 30 y 100 cm, donde el aporte orgánico ya es chico y las dos capas de
SoilGrids caen enteras adentro.

### El falso positivo, declarado en el módulo y en el test

El Argiudol de Pergamino pasa los dos umbrales —32,1 % de arcilla, actividad
86— y **no es un suelo expansivo**: su arcilla es ilítica. Es el límite real de
la inferencia, porque «arcilla de alta actividad» incluye a la ilita y a la
vermiculita, que tienen CEC alta y no se hinchan. Por eso:

- el nivel inferido se llama **`posible`** y nunca dice «es»;
- el texto manda a la calicata con los tres criterios de campo de WRB;
- y hay un test que falla si alguna vez el texto de un `posible` empieza en
  indicativo.

Un `posible` en la Pampa, además, no cuesta nada: el coeficiente anual de la
Pampa también está sobreestimado, por llanura en vez de por grietas.

---

## 4. Lo que se montó

**`apps/terreno/lib/sueloExpansivo.ts`** (nuevo). `detectarSueloExpansivo(perfil,
{ taxorder })` devuelve `null` o un diagnóstico con tres criterios, en orden de
calidad del dato:

1. `vertisol_ssurgo` — `taxorder = 'Vertisols'`. Es la clasificación del
   edafólogo y no necesita el tramo de control.
2. `lep_ssurgo` — una capa del primer metro con LEP ≥ 6 % **y** ≥ 30 % de arcilla
   en ese mismo horizonte, que es como lo pide WRB. Se mira por capa y no
   promediado, porque el criterio es de horizonte.
3. `actividad_arcilla` — la inferencia, el único camino fuera de Estados Unidos.

`null` significa «con este dato no se puede afirmar que lo haya», y no «acá no
hay». Hay guardias para los tres huecos: perfil vacío, CEC ausente —la caché de
30 días guarda respuestas anteriores al 12/11/2026 y no la trae—, y CEC en cero,
que es NoData río arriba. Ese último importa: un cero diría «arcilla de baja
actividad», que es el diagnóstico **contrario** al que corresponde.

**El camino del dato.** `cec` entró a `PROPIEDADES` de `soilgridsCog.ts` (COG de
1 km, `d_factor` 10, mmol(c)/kg → cmol(c)/kg) y a `PROPS` de
`app/api/suelo/route.ts` (API de 250 m). La concurrencia contra files.isric.org
subió de 42 a 48 para que las seis lecturas nuevas entren en la misma ráfaga: lo
que cuesta es la latencia, y una tanda más es un viaje más completo. En SSURGO se
agregaron `cec7_r` y `lep_r` al SQL, y `taxorder` —que ya se consultaba y no se
leía— ahora viaja hasta el diagnóstico.

**`CapaSuelo`** lleva `cec?: number | null` y `lep?: number | null`, opcionales a
propósito y documentado por qué. **`DatosSuelo`** lleva `expansivo`, calculado en
`obtenerSuelo` en el mismo lugar que `organico`: un solo criterio para los dos
builders.

**El aviso, en `saludCalculo.ts`**, con un matiz que es la mitad del valor:

- **En Represa** es `alerta` si el suelo está medido y `aviso` si es inferido, y
  dice los números: 7 a 11 % medido contra 32 % de la tabla, 16 a 17 % del
  alfisol donde la tabla acierta. La acción no es mirar un pozo de infiltración
  —eso mide el vaso, no el aporte— sino bajar el coeficiente a mano hacia el
  extremo inferior y, si la represa no aguanta, medir el escurrimiento de una
  temporada en el predio.
- **En Cuenca** es `aviso`, y manda la desconfianza al lugar que le toca: **para
  la tormenta de diseño el grupo D está bien**, porque un T10 o un T50 cae con el
  perfil húmedo y las grietas cerradas, y ahí la infiltración medida es 0,21 mm/h
  contra 76 mm/h en la primera media hora. El caudal pico no cambia. Lo que está
  mal es el coeficiente anual, y el aviso lo dice con esas palabras.

Sin esa distinción el aviso habría sido alarmista y, peor, habría empujado a
alguien a bajar el vertedero.

**Y en pantalla**: el panel de Suelo y el informe muestran el diagnóstico junto
al de turba y antes del perfil, por la misma razón —contradice los números de
agua que vienen después—. `CuencaPanel` y `CutFillPanel` lo reciben desde
`MapaTerrenoApp`.

**25 tests** en `tests/unit/suelo/sueloExpansivo.test.ts`, con los doce perfiles
medidos adentro, los bordes de los tres umbrales en «≥», los cinco modos de «no
hay dato», el falso positivo declarado, y los avisos de las dos herramientas.

---

## 5. Lo que no se tocó, y por qué

**`COEF_BASE_GRUPO` sigue en 0,28 para D.** Es deliberado y hay un test que lo
sostiene: Garg et al. es un sitio, un clima y un manejo, y reemplazar una tabla
global por el valor de Patancheru sería cambiar un número general por uno local.
La recomendación del encargo era avisar antes que cambiar, y es la correcta por
una razón más que la del encargo: el error no es un factor fijo. En el alfisol la
tabla acierta, en el vertisol con cultivo se pasa por tres, y en barbecho por
dos y medio. No hay un coeficiente que corrija eso; hay un aviso que lo explica.

Queda escrito al lado del número, en `cuenca.ts`, con la condición para el día
que alguien quiera tocarlo: rango de validez declarado y un test contra el caso
medido, como pide la skill `motor-de-calculo`.

**Tampoco se tocó el grupo hidrológico.** Su leyenda textual —«Suelos
arcillosos/expansivos»— sigue igual, y ahora hay un módulo que distingue las dos
cosas que esa frase junta. Cambiar el grupo sería cambiar el CN del evento, que
es justamente el número que **no** está mal.

---

## 6. Las fuentes, y las que no abrieron

Abiertas y leídas:

- **WRB 2022**, 4.ª ed. — `wrb.isric.org`, PDF de 6,0 MB, abre con `curl`.
  §3.1.32, §3.1.40, §3.2.12 y §3.2.13.
- **Poggio et al. 2021**, SoilGrids 2.0, SOIL 7:217-240,
  doi:10.5194/soil-7-217-2021 — acceso abierto en soil.copernicus.org.
- **Batjes, Ribeiro y van Oostrum 2020**, WoSIS snapshot 2019, ESSD 12:299-320,
  doi:10.5194/essd-12-299-2020 — acceso abierto.
- **USDA-NRCS Soil Data Access** — la definición oficial de «Linear
  Extensibility» se leyó consultando `sdvattribute` por el mismo POST que usa la
  app. Dominio público.
- **rest.isric.org** — declara en cada respuesta `mapped_units: mmol(c)/kg`,
  `target_units: cmol(c)/kg`, `d_factor: 10`. Es la unidad, dicha por el servicio.
- **FAO x5493e** — la curva de infiltración de Virmani y Swindale, ya citada en
  la ficha del Decán.

Cerradas, y una variedad nueva para la lista:

- **`www.nrcs.usda.gov` no contesta nada**: `HTTP 000`, con y sin `--http1.1`.
  No es un 403 ni un muro de cookies: la conexión no se establece. Eso dejó
  afuera las *Keys to Soil Taxonomy*, que era de donde iban a salir las clases de
  actividad catiónica (superactive / active / semiactive / subactive). **No se
  citaron**, y no hizo falta: WRB da el mismo corte con otro nombre y sí abre.
  Ojo con la asimetría: `sdmdataaccess.sc.egov.usda.gov`, que es del mismo
  organismo, funciona perfecto.
- **`www.isric.org`** devuelve error de TLS (`curl` 35). `rest.isric.org`,
  `files.isric.org` y `wrb.isric.org` andan. Lo que se iba a leer ahí —la FAQ con
  la tabla de propiedades— estaba también en la respuesta del servicio.

---

## 7. Lo que queda abierto

- **El horizonte vértico de SSURGO sin usar.** `taxsubgrp` trae cosas como
  `Udic Haplusterts` y `Typic Haploxererts`, y los subgrupos vérticos de otros
  órdenes (`Vertic Argiudolls`, por ejemplo) son suelos con comportamiento
  vértico que **no** son Vertisols. Hoy caen a la inferencia o al LEP. Leer
  `/vertic|ert/` en `taxsubgrp` los sumaría, y hay que medir primero si eso
  agrega falsos positivos.
- **HWSD v2 sobre polígono.** Sigue en la lista del relevamiento zonal que ya
  estaba pendiente para los polígonos de Indomalaya. Si entra, su clase WRB
  «Vertisols» sería un tercer criterio `medido` fuera de Estados Unidos.
- **El pH como corroborador.** Los seis vertisoles medidos dan de 6,9 a 8,4 en el
  tramo de control y los cuatro de baja actividad de 4,9 a 5,6. Se ve una
  separación, pero es consecuencia del clima y del material parental y no de la
  mineralogía, así que sumarlo al criterio sería confundir correlación con
  mecanismo. Queda como dato, no como umbral.
- **La obra que corresponde. Cerrado el 12/11/2026, ver la sección 8.** La ficha del Decán ya dice que acá el diseño
  publicado no es una zanja de infiltración a nivel sino un camellón ancho con
  surco a pendiente del 0,4 al 0,8 %. Eso todavía no lo sabe el panel de Swales
  ni el de líneas clave: el aviso de suelo expansivo está en Cuenca y en Represa,
  no en las herramientas que empujan a retener. Es el siguiente paso natural y es
  otro lote.
- **La extensibilidad en el resto del mundo.** Nadie la publica a escala global.
  Si alguna vez aparece, reemplaza toda la inferencia de una.

---

## 8. El aviso en Swales y en líneas clave (12/11/2026)

Cerrado el mismo día, un lote después. El punto de arriba —«la obra que
corresponde»— era el único de la lista que no pedía datos nuevos sino leer la
fuente que ya estaba citada en la ficha, y resultó que esa fuente abre completa.

### 8.1 La fuente abrió, y es la misma que dio la curva

La ficha del Decán citaba el camellón del 0,4 al 0,8 % de segunda mano. El
primario es **Swindale 1988**, un capítulo del volumen de la ILCA *Management of
Vertisols in sub-Saharan Africa*, y está entero y abierto en el repositorio de
la FAO: `https://www.fao.org/4/x5493e/x5493e03.htm`. Es **el mismo documento**
del que salió la curva de infiltración de Virmani y Swindale 1984 que ya usaba
`sueloExpansivo.ts` — se había leído la tabla 2 y no el resto.

Lo que dice, textual y en una sola frase, es el aviso completo: la tecnología
del ICRISAT es un sistema de camellones anchos con surco «laid out on a gradual
slope (usually 0.4-0.8%)», donde el surco «provides good surface drainage to
prevent waterlogging», con desagües de parcela y cauces empastados; y el
elemento se enuncia como «shaping land to **promote disposal of excess water**».
El propósito declarado es sacar el agua que sobra. Una zanja a nivel hace lo
contrario.

### 8.2 Y no es un sitio ni un equipo, que era la objeción obvia

El veredicto anterior no cambió `COEF_BASE_GRUPO` porque Garg et al. es un
sitio, un clima y un manejo. La misma objeción valía acá, y el mismo volumen la
contesta con dos trabajos de otro país y otros equipos:

- **Astatke, Jutzi y Grunder 1988** (ILCA + Soil Conservation Research Project,
  Debre Zeit, altiplano etíope): el camellón sube el rendimiento *si la zona es
  de lluvia alta*, y en el año de poca lluvia del ensayo no hubo diferencia
  significativa contra el laboreo tradicional, «due to limited waterlogging». La
  ventaja aparece cuando hay exceso que drenar. **Y los propios autores piden
  investigar todavía cuál es la pendiente y el largo de surco óptimos**, que es
  exactamente por qué el 0,4–0,8 % no reemplaza al criterio del NRCS.
- **Escobedo 1988** (FAO/PNUD, Etiopía central): las obras físicas de
  conservación sobre vertisoles dieron resultados «not very significant» para
  mucha mano de obra, con la recomendación de correr el énfasis al manejo
  agronómico —materia orgánica, fajas de pasto, cultivo en callejones— antes que
  a mover tierra. Sobre este suelo, lo que flojea es justamente la parte de
  excavar.

Resumen de las dos, y texto completo del primero. Las URL exactas están en el
docblock de la sección nueva de `lib/saludCalculo.ts`.

### 8.3 Lo que se montó, y la cuenta que es nueva

Dos funciones en `apps/terreno/lib/saludCalculo.ts`, que devuelven un
`AvisoCalculo` suelto en vez de una `Confianza` —Swales ya muestra la de H0 y
líneas clave no tiene ninguna— y un componente chico,
`components/AvisoSueloObra.tsx`, que los pinta arriba y **sin plegar**: un suelo
expansivo no baja la confianza del cálculo, los números salen bien de los datos
que entraron; lo que cambia es qué obra corresponde, y eso no se puede esconder
detrás de un plegado que el usuario cerró.

**`avisoSwalesExpansivo`** pone el tiempo de vaciado de la zanja entre los dos
valores medidos, y eso es una cuenta exacta, no una analogía. En `swales.ts` el
vaciado sale de la integral cerrada

    t = (1/K) · [ 2·d − (b/z)·ln(1 + z·d/b) ]

donde `K` es el único factor fuera del corchete: para una misma sección, `t` es
inversamente proporcional al Ksat. Así que con el Ksat del perfil alcanza para
dar los dos extremos sin volver a tocar la geometría. Con un perfil de
1,4 mm/h: la misma zanja se vacía unas **54 veces más rápido** con el suelo
recién agrietado (76 mm/h) y unas **6,7 veces más lento** con el perfil húmedo y
las grietas cerradas (0,21 mm/h). El número que muestra el panel no es ninguno
de los dos, y hoy el panel lo mostraba solo.

**`avisoKeylineExpansivo`** es distinto a propósito, y la diferencia es la mitad
del valor: el patrón de líneas clave **mueve** el agua con una deriva, así que su
geometría no está mal acá —es la misma idea que el surco del camellón—. Lo que
estaría mal es leerlo como obra de retención y apoyarlo en el piso del estándar.
El aviso compara entonces el techo de la banda de deriva contra la pendiente
publicada, y la cuenta sale de las tres maneras:

| techo de la banda | qué dice el aviso |
|---|---|
| < 0,4 % | no llega ni al piso del diseño; hacen falta 1,6 % de pendiente de terreno para que el techo toque el 0,8 %, porque el techo es la mitad de la pendiente. Acá la herramienta es el desagüe de parcela, no el patrón de cultivo |
| 0,4 a 0,8 % | entra en la mitad baja de la banda publicada: drena, pero sin margen. Al techo y no al piso |
| ≥ 0,8 % | la banda publicada entra entera: apuntar al 0,4–0,8 % y no al 0,2 % del estándar |

Y un último párrafo con su límite declarado: lo que el arado de cincel busca
—abrir el perfil en profundidad— acá lo hace la contracción sola en cada
estación seca, porque son grietas que WRB define como de 0,5 cm o más que
«controlan la infiltración y la percolación incluso rellenas de material de la
superficie». **Eso es una consecuencia de la definición y no una medición**:
ensayos de arado Yeomans sobre vertisol no se encontraron publicados, así que el
aviso dice que el beneficio de pasarlo no se puede dar por hecho **ni
descartar**.

### 8.4 Lo que no se tocó, otra vez

`DERIVA_MIN_DRENAJE_PCT` sigue en 0,2 %, que es el «not less than 0.2 percent»
del NRCS 330, y `GRUPOS_QUE_ENCHARCAN` sigue siendo C y D. Hay un test que lo
sostiene, por lo mismo que el de `COEF_BASE_GRUPO`: el 0,4–0,8 % es la pendiente
*usual* de un sistema de cultivo de la India semiárida, no un umbral de validez
general, y sus propios autores la dan como pendiente a investigar. Reemplazar el
criterio del estándar por ese número sería cambiar un criterio general por uno
local, que es el error que este lote existe para no cometer.

Once tests nuevos en `tests/unit/suelo/sueloExpansivo.test.ts`, que ahora son 36.

## 9. El papel, donde el consejo equivocado estaba arriba (13/11/2026)

El lote del 12/11 dejó el aviso en las cuatro herramientas de agua, y al cerrarlo
quedó anotado que **no llegaba al informe**. Al ir a ponerlo apareció algo peor
que una ausencia.

### 9.1 El informe no omitía el suelo: recomendaba lo contrario

El diagnóstico de suelo expansivo ya se imprimía completo —`cautela`, `detalle` y
`efecto_hidrologico`— en la sección 5, «Análisis de suelo». Lo que no sabía nada
del suelo era el **resumen ejecutivo**, la página 2, que es la que se lee. Ahí
`InformeView.tsx` armaba los «aspectos a considerar» con umbrales sobre los datos
presentes, y un vertisol del Decán cumple dos de esos umbrales a la vez:
semiárido y grupo hidrológico D. Con eso escribía:

> Clima semiárido: priorizar captación, almacenamiento y **retención** de agua
> (represas, keyline, cobertura).

y, pasando el 8 % de pendiente:

> Pendiente general moderada (10 %): manejar el escurrimiento **con trazados a
> nivel**.

Las dos frases que más fuerte disparan sobre este suelo son las dos que empujan a
retener a nivel, y el diseño publicado hace lo opuesto: el camellón del ICRISAT
corre con el surco a pendiente para sacar el exceso (§8.1). El orden de lectura
agravaba el problema: la recomendación equivocada en la página 2, el suelo que la
desmiente treinta páginas después.

### 9.2 Lo que se montó

Las frases salieron del JSX a `lib/aspectosInforme.ts`, con fuente citada y
tests, y `InformeView.tsx` pasó a una línea: `aspectosAConsiderar(datos)`. La
entrada es un `Pick` de los tipos reales, así que declara exactamente qué campos
del informe lee cada frase y `InformeData` entra sin adaptador.

Con suelo expansivo cambian cuatro frases, y una es nueva:

| Frase | Sin suelo expansivo | Con suelo expansivo |
|---|---|---|
| la obra | *(no existía)* | va **primera**: la obra de agua acá no va a nivel, el camellón ancho con el surco a pendiente entre 0,4 y 0,8 %, y «una zanja a nivel hace lo contrario» |
| clima seco | «retención de agua (represas, keyline, cobertura)» | la reserva sigue siendo lo primero, pero se guarda en represa o tanque; el patrón de líneas clave sirve con la deriva en pendiente, «no para retenerla» |
| pendiente > 8 % | «con trazados a nivel» | «con trazados a pendiente suave, del orden de 0,4 a 0,8 %, y no a nivel» |
| pendiente > 15 % | «considerar terrazas, keyline o cobertura permanente» | el trazado va con pendiente y la cobertura permanente es lo que más rinde |
| grupo C o D | «baja infiltración y mayor escurrimiento» | la tabla le pone baja infiltración todo el año, y este suelo infiltra mucho más recién agrietado y mucho menos sellado: el escurrimiento anual queda «del lado optimista» |

La frase del grupo hidrológico es la que menos se esperaba y la que más se
necesitaba: era la única del resumen que afirmaba, sin matiz, justo lo que el
vertisol contradice media temporada. Dice la consecuencia de ingeniería —el
reservorio dimensionado con ese coeficiente queda optimista— y no repite el
`efecto_hidrologico`, que el informe ya imprime completo más adelante.

El `0,4 a 0,8 %` no se reescribió: sale de `BBF_SURCO_MIN_PCT` y
`BBF_SURCO_MAX_PCT` de `saludCalculo.ts`, y hay un test que lo comprueba
construyendo la banda desde esas constantes. Y el aviso no repite `cautela` ni
`detalle`: en esa página la frase decide una obra, no explica un suelo.

### 9.3 El límite que había que declarar al mudar el código

Mover esto a `lib/` lo hace **parecer** un motor de cálculo, y no lo es. El 8 % y
el 15 % de pendiente, los 100 mm de agua útil, los 30 días de racha seca y el
30 % de suelo descubierto no tienen fuente publicada: son cortes editoriales
heredados del componente, elegidos para decidir si una frase aparece, no para
calcular una magnitud. Están exportados con nombre, con el límite escrito arriba
del archivo, y quedaron en el mismo número. Lo único con fuente acá es la rama de
suelo expansivo.

Por eso el primer test es un candado de regresión: compara la lista completa
contra las frases heredadas **palabra por palabra**, en dos predios distintos.
Pasó en la primera corrida, que es la prueba de que la mudanza no cambió nada de
lo que ya se imprimía. Doce tests nuevos en
`tests/unit/diseno/aspectosInforme.test.ts`.

### 9.4 Lo que sigue abierto

- **El surco del camellón no es una geometría que la app pueda trazar.** El aviso
  lo nombra y el informe ahora también, pero no hay herramienta que lo dibuje:
  los swales se trazan a nivel por definición y el patrón de líneas clave sale de
  una directriz, no de una red de desagües de parcela con cauces empastados. Es
  la obra que falta, y es un lote con geometría propia.
- **Las otras entregas de papel.** `PlanillaDeReplanteo`, `ListaDeMaterialesSeccion`
  y `PlanDeEtapas` no leen el suelo. Si el plan de etapas ordena excavar una
  zanja a nivel, lo va a seguir ordenando.
- Y los tres de §7 siguen igual: el `taxsubgrp` vértico de SSURGO sin medir, HWSD
  v2 sobre polígono, y el pH como dato y no como umbral.
