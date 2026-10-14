# Muestreos de las entregas de GPT

El validador chequea la forma. Lo que no puede chequear ningún script es si la
fuente dice lo que la entrada dice, y para eso el validador sortea **una de cada
diez entradas con semilla fija** y exige abrirla. Acá queda lo que pasó al
abrirlas, lote por lote.

| Encargo | Lote | Forma | Muestreo | Veredicto |
|---|---|---|---|---|
| licencias | 01 | limpia | `giahs_chakra_napo` ✅ | **cerrado**, ver `RESPUESTAS_LICENCIAS.md` |
| forraje | 01 | limpia | `bosque_tropical_seco` ✅ | **no se monta**, ver `RESPUESTAS_FORRAJE.md` |
| fuentes-propias | 01 | limpia | `iliria_adriatico` ✅ | **montado** el 11/10/2026 |
| practicas-indomalaya | 01 | limpia | `ghats_norte_montano` ⛔ | **vuelve** |
| fuentes-propias | 02 | limpia | `golfo_persico_mangle` ✅ | **montado** el 12/10/2026 |
| fuentes-propias | 03 | limpia | `abedular_montano_escandinavo` ✅ | **montado** el 13/10/2026 |
| fuentes-propias | 04 | limpia | `magreb_bosque_mediterraneo` · `alto_atlas_enebro` ✅ | **montado** el 13/10/2026 |
| fuentes-propias | 05 | limpia | — | **montado** el 14/10/2026, 8 de 17 |
| fuentes-propias | 06 | limpia | `tundra_artica_canadiense` ⚠ | **montado** el 14/10/2026, 7 de 14 |

---

## fuentes-propias, lote 01 — pasa, y ya está montado

Seis fichas de los Apeninos a los Cárpatos, una fuente local cada una y seis
dominios distintos: el repositorio de Bolonia, la revista de la facultad de
forestales de Sarajevo, los documentos del Parque Nacional de Plitvice, la
Universidad de Plovdiv, Forests (MDPI) y un plan de manejo rumano. Eso es
exactamente lo que «fuente propia del lugar» quiere decir, y es lo contrario del
problema que el encargo venía a resolver —fichas sostenidas sólo por marcos
generales de todo el paquete—.

**El muestreo cayó en `iliria_adriatico` y aguantó.** La entrada dice que el plan
territorial de Plitvice registra ahí los hábitats Natura 2000 de bosques ilirios
de haya (91K0) y de roble y carpe (91L0). Bajé el PDF —5 MB, 8.436 líneas de
texto— y los dos están.

Vale contar cómo, porque es donde se podía resbalar: en la tabla de hábitats
objetivo la extracción desalinea las columnas y deja `91K0` pegado a «Travnjaci
beskoljenke (Molinion caeruleae)», que es un prado de *Molinia* y es el código
6410. Leída así, la entrada parecía equivocada. Alineando la lista de códigos con
la de nombres, 91K0 es «Ilirske bukove šume (Aremonio-Fagion)». Y más adelante el
documento lo dice en inglés y bien alineado, sin lugar a interpretación:

> 91KO  Illyrian Fagus sylvatica forests (Aremonio-Fagion)
> 91LO  Illyrian oak-hornbeam forests (Erythronio-carpinion)

Además la entrada aclara en `nota` que es una fuente local del parque y **no un
inventario de toda la ecorregión**, que es la cautela correcta y muestra que
entendió qué se estaba pidiendo.

Las seis URL abren, salvo la de Bolonia, que devuelve 403 a `curl` y una
verificación anti-bot de Cloudflare en el navegador. El enlace está bien —es un
handle institucional, un identificador estable— pero **esa hay que abrirla a
mano**: acá no se resuelven verificaciones de bots.

### Montado el 11/10/2026

Las seis entraron a `biomasRegionalesEuropaUE.ts` como constantes con nombre, al
lado de las del paquete, y **la cuenta de fichas sin fuente propia bajó de 62 a
56** —medido con `medir-espesor-fichas.mjs`, con el mismo criterio que la
estableció: una fuente es del paquete cuando la comparten cinco fichas o más—.

Dos cosas que se corrigieron al montar, y las dos son de forma de cita:

- **Rhodopi apuntaba al PDF en `mdpi-res.com`**, el host de archivos. Quedó en su
  DOI, `10.3390/f13030377`, que es la forma estable: verifiqué en el navegador
  que resuelve al artículo con ese título exacto, *Forests* 2022, 13(3), 377.
- **Stara Planina llegaba como un *bitstream* sin cita.** Abrí el PDF y la
  portada da la referencia completa: *Ecologia Balkanica* 2025, 17(1), 141-150,
  Kirova, Stoeva y Stoyanov, del Instituto de Investigación Forestal de la
  Academia Búlgara de Ciencias. El rótulo ahora la lleva.

El alcance de cada fuente —«un sitio de los Apeninos, no toda la cadena»— quedó
en el comentario de su constante y no en la interfaz: es información para quien
escriba el párrafo de la ficha, no una advertencia para quien mira el mapa.

Lo que **no** se hizo: las `verificacion` de la entrega traen material que podría
engordar el texto de las fichas —el hayedo dacio de Piatra Craiului entre 500 y
1200 m con más de 3.300 ha, las 22.000 ha de hábitat abierto que Rhodopi perdió
hacia el bosque entre 1984 y 2019—. Eso es reescribir fichas y es otro trabajo;
el encargo era la fuente.

## fuentes-propias, lote 02 — las seis aguantan, y una casi arrastra una retractación

Seis fichas de Medio Oriente, seis instituciones del lugar, siete fuentes. Forma
limpia y los seis `id` existen en el catálogo —cosa que importa, porque en el
borrador del encargo yo mismo había inventado seis ids que no existían y un id
inexistente hace que la entrada no se muestre nunca—.

**El muestreo cayó en `golfo_persico_mangle` y aguantó**: la revisión de *Wetlands*
dice literalmente que *Avicennia marina* es la única especie de mangle del Golfo,
que su sustrato predominante es arenoso y de bajo contenido orgánico, y que
tolera variaciones extremas de temperatura y salinidad. Las tres afirmaciones, en
el resumen, con esas palabras.

Pero el muestreo no decidió nada acá, porque **se abrieron las seis**. Esa es la
regla que dejó el lote 01: una de cada diez alcanza para decidir si un lote se
monta, no alcanza cuando lo que la entrada afirma va a pasar al texto que lee el
usuario. Las seis verificaron exacto, y cinco de las seis dicen bastante más de
lo que la entrega había copiado.

| ficha | lo que afirmaba | |
|---|---|---|
| `mesopotamia_marismas` | Huwaizah, Hammar y centrales se alimentan del Tigris y el Éufrates | ✅ literal |
| `harrat_basalto` | ocho perfiles de Harrat Khaybar en cuatro geoformas | ✅ literal |
| `desierto_arabigo` | cuatro grupos vegetales en el Wadi Al-Jufair | ✅ literal |
| `nefud_rub_al_khali` | 135 especies, 108 géneros, 37 familias en el Nafud Al-Urayq | ✅ literal |
| `golfo_llanura_costera` | nueve subunidades intermareales en la costa de Kuwait | ✅ literal |
| `golfo_persico_mangle` | única especie, sustrato arenoso y bajo en orgánico | ✅ literal (muestreo) |

### La trampa de la retractación

El artículo del Wadi Al-Jufair **existe dos veces**. La versión de enero de 2012,
*Saudi Journal of Biological Sciences* 19(1):43-54, DOI
`10.1016/j.sjbs.2011.09.004`, está **RETRACTADA**, con su nota de retractación
publicada en 19(3):393. Y hay una republicación en 19(3):357-368, DOI
`10.1016/j.sjbs.2012.04.003`, sin retractación.

La entrega apuntó a la republicación —el PII `S1319562X12000319` resuelve al DOI
de abril, lo verifiqué en Crossref—, o sea que eligió bien. Pero buscando por
título aparece primero la retractada: PMC tiene las tres fichas y la retractada
sale arriba. **Por eso la URL montada es el DOI y no un buscador: el DOI fija cuál
de las dos versiones es**, y queda anotado arriba de la constante para que nadie
la «corrija» al enlace equivocado.

Es un modo de fallar que no estaba previsto en el encargo. Las tres condiciones de
una fuente —que abra, que sea la publicación y no un intermediario, que sea un
trabajo publicado— las cumple una retractación igual de bien que un artículo
vivo. Hay que agregar la cuarta: **que no esté retractada**, y se chequea en
Crossref, que lo trae en `updated-by`.

### Una contradicción con la ficha, que se escribió en vez de taparse

La revisión del Golfo describe el sustrato del mangle de acá como **arenoso y de
bajo contenido orgánico**, y la ficha venía diciendo «limos y arcillas de marea
con sulfuros», con toda una advertencia de manejo colgada de eso: drenarlos oxida
los sulfuros y da un suelo ácido sulfatado con pH por debajo de 3. Las dos cosas
pueden ser ciertas en sitios distintos de la misma ecorregión, pero no en el
mismo. Se agregó el párrafo que lo dice: donde el sustrato es arena con poca
materia orgánica hay menos sulfuro acumulado y el riesgo es más bajo, y hay que
mirar el sitio antes de suponer cuál de los dos tocó. Borrar la advertencia
hubiera sido peor que dejarla sola.

### Montado el 12/10/2026

Las siete fuentes entraron a `biomasRegionalesMedioOriente.ts` como constantes con
nombre y alcance declarado en su comentario, y **la cuenta de fichas sin fuente
propia bajó de 56 a 50** —MedioOriente de 23 a 17, medido con
`medir-espesor-fichas.mjs`—. El `suelos` promedio del paquete subió de 453 a 567
caracteres, porque las seis fichas también recibieron texto.

Lo que entró al texto, en una línea cada uno:

- **Ahwar**: el expediente separa los cuatro humedales por régimen de agua, y la
  distinción decide qué se puede hacer. Huwaizah es el único de agua dulce y el
  único que no fue desecado a fondo, así que de ahí volvieron las aves al
  reinundarse el resto; en el Hammar, al revés, el mar entra empujado por la
  marea. El CRIMW modeló la hidrología para fijar el caudal mensual mínimo de cada
  componente.
- **Harrat Khaybar**: cerca del 63 % de los perfiles son Andosoles vítricos y el
  37 % Solonchaks, y son poligenéticos —andisolización de un paleoclima subhúmedo,
  horizontes sálicos y cálcicos del clima árido de hoy—. Que las propiedades
  ándicas aguanten en seco y caliente cambia el pronóstico de agua del suelo.
- **Wadi Al-Jufair**: cuatro asociaciones en 15 km² que se diferencian en textura,
  humedad, materia orgánica, pH, conductividad y minerales. Dentro de un mismo
  uadi el suelo cambia lo suficiente para decidir qué va dónde.
- **Nafud Al-Urayq y Rub al-Jali**: los dos arenales dan respuestas opuestas. En el
  Nafud, 135 especies y anuales y perennes por igual, con la diversidad alta en el
  uadi y la arena somera y la baja en el hábitat salinizado. En el Rub al-Jali,
  unas 37 especies sobre 500.000 km², apenas diez que pesen, anuales
  prácticamente ausentes y nada de porte arbóreo.
- **Costa de Kuwait**: nueve subunidades, cuatro fangosas al norte con sabkha
  extensa detrás y energía de oleaje baja, cinco arenosas al sur con energía de
  moderada a alta.
- **Mangle del Golfo**: límite norte de los manglares del Indo-Pacífico, y las
  amenazas de las últimas dos décadas son de obra más que de clima. Hay
  restauraciones documentadas que funcionaron, así que replantar acá no es una
  apuesta.

Una corrección de precisión al escribir: la entrega decía *Calligonum crinitum*
subsp. *arabicum*, y el resumen de Mandaville dice «una subespecie endémica de
*Calligonum crinitum*» sin nombrarla. El nombre de la subespecie es correcto, pero
no está en el documento, así que en la ficha quedó como lo dice el documento.

## fuentes-propias, lote 03 — las seis aguantan, y dos dicen lo contrario de lo que parecía

Llegó sin pedirlo, junto con el 02: seis fichas de EuropaUE, forma limpia, los
seis ids existen. **Se abrieron las seis y se montó el 13/10/2026.**

| ficha | lo que afirmaba | |
|---|---|---|
| `mediterraneo_oriental_conifera` | el pinar de Pafos llega a 1.352 m | ✅ literal |
| `chipre_troodos` | 1,0 · 1,3 · 1,7 % de carbono en los primeros 25 cm | ✅ literal |
| `costa_conifera_escandinava` | 31 sitios de pícea costera en Noruega central | ✅ literal |
| `abedular_montano_escandinavo` | más de 40 años en Kautokeino y Karasjok | ✅ literal (muestreo) |
| `egeo_esclerofilo` | 270 taxones en Enousses, frígana en tres franjas | ✅ literal |
| `creta_mediterranea` | muestreo en Asterusia y Psiloritis, del mar a más de 1.000 m | ⚠ el núcleo sí, los dos macizos no se pudieron abrir |

Seis de seis verifican lo que afirman, y **cinco dicen bastante más de lo que la
entrega copió**. Dos de esos extras dan vuelta la conclusión fácil, que es
exactamente lo que esta app necesita de una fuente propia:

- **El Troodos.** La concentración de carbono orgánico sube al abandonar el
  cultivo: 1,0 % en productivo, 1,3 % en abandonado, 1,7 % en bosque estatal, y
  en pares de viñedos aterrazados 0,9 contra 1,4 % en los primeros 10 cm, con la
  diferencia creciendo con los años de abandono. Pero cuando los mismos autores
  calculan el **stock** hasta la roca, corrigiendo por fragmentos gruesos, el
  resultado se invierte: **22 Mg/ha en los productivos contra 21 en los
  abandonados**, sin ninguna tendencia con el tiempo de abandono. La corrección
  por pedregosidad bajó los stocks entre 17 y 78 %. Concentración y stock no son
  lo mismo, y en una terraza de montaña manda el segundo. Si la ficha se escribe
  con los tres porcentajes y nada más, acequia afirma que abandonar acumula
  carbono y el artículo que estaría citando dice lo contrario. Están los dos
  números en la ficha.
- **El bosque costero noruego.** Los macrolíquenes epífitos no se reparten por el
  rodal: se concentran en las cárcavas de arroyo, y dos de ellos aparecen **diez
  veces más** en el fondo de la cárcava que en la ladera de al lado. Y los 31
  sitios habían sido cortados selectivamente dos veces o más en cien años —entre
  el 31 y el 124 % del volumen que hoy tienen en pie— sin que ninguna variable
  de historia de corta explique la abundancia actual una vez descontada la
  estructura del rodal. O sea: lo que hay que no tocar es la cárcava, no el
  rodal entero. Es el mismo hallazgo que el raleo moderado de Stara Planina en el
  lote 01, por otro camino.
- **La Finnmarksvidda** es el espejo exacto del Rhodopi. Acá el pastoreo
  intensivo de renos entre 1961 y 1987 hizo caer los brezales de liquen alrededor
  del 80 % y expandir el abedular (+90 % en Kautokeino), con los tipos de arándano
  y musgo triplicados. En el Rhodopi fue el **abandono** del pastoreo el que cerró
  el hábitat abierto. Las dos fichas dicen ahora que la carga animal no ajusta un
  rendimiento: cambia el tipo de vegetación.
- **Enousses** aporta una medida de presión de uso: el porcentaje de terófitos y
  leguminosas es alto en los islotes que se usan para agricultura y pastoreo, y se
  aparta en los chicos sin uso. La proporción de anuales en un matorral del Egeo
  es legible como disturbio, no sólo como clima.
- **Creta** da 347 taxones de 43 familias con un promedio de **47,2 ± 12,5
  especies por parcela de 4 m²**, y los dos factores que más explican la
  composición son el **pH del suelo** y la altitud —21 % de la variación—, con 22
  especies indicadoras de roca calcárea y 24 de rocas pobres en cal.

### Lo único que no se montó, y por qué

La entrada de Creta decía que el muestreo era de la Asterusia y las laderas del
Psiloritis. Puede ser cierto —los dos macizos son de Creta central— pero eso
está en los métodos, no en el resumen, y el texto completo no se pudo abrir: la
editorial tiene una verificación anti-bot y acá no se resuelven. La ficha dice
«Creta central», que es lo que dice el resumen, y la banda quedó en 11 a 1.400 m,
que es la publicada, no en «más de 1.000 m». Es la regla de Piatra Craiului
aplicada a una entrada que no estaba mal: estaba sin verificar.

Dos de las seis fuentes están cerradas en el editor y se leyeron por el resumen,
que es público. Eso quedó escrito en el comentario de su constante: quien la abra
tiene que saber hasta dónde se pudo chequear.

**La cuenta bajó de 50 a 44** y EuropaUE de 17 a 11, con el `vegetacion` promedio
del paquete subiendo de 610 a 646 caracteres.

## fuentes-propias, lote 04 — las trece aguantan, y el norte de África cierra

Trece fichas, trece entradas, ninguna vacía. **Se abrieron las trece y se montó
el 13/10/2026.** No se usó el muestreo de una de cada diez: el texto de estas
fichas va a pantalla, así que rige la regla del lote 01 y se abren todas.

| ficha | lo que afirmaba | |
|---|---|---|
| `magreb_bosque_mediterraneo` | 358 taxones en pastizales forestales del norte marroquí | ✅ literal |
| `atlas_conifera_montana` | muestra de 32 árboles | ✅ literal (texto completo) |
| `alto_atlas_enebro` | relevamientos de campo 2020–2022, cuatro zonas, 1.600–3.400 m | ⚠ las zonas y la banda ✅; los relevamientos de campo, no |
| `nilo_delta` | 34 perfiles, dos zonas de manejo | ✅ literal |
| `chotts_sebkhas` | nueve imágenes Landsat 8–9 de 2014–2022 | ✅ literal |
| `sahara_occidental_erg` | el registro entre imágenes impidió medir la migración | ✅ literal |
| `sahara_oriental` | 55 perfiles y 211 muestras | ✅ literal (texto completo) |
| `sahara_sur` | Landsat sirve para el patrón regional, no para las dunas menores | ✅ literal |
| `sahara_costa_atlantica` | promedios anuales de 1,6 a 6 L/m²/día | ✅ literal —y son tres años distintos, no una banda |
| `ahaggar_tassili` | comunidades de los uadis de Tamanrasset | ✅ literal |
| `uweinat_tibesti` | 121 registros del Tibesti de la expedición de Corti | ✅ literal (texto completo en PMC) |
| `mar_rojo_costa_desierto` | 5 expediciones 1998–2004, 179 especies, 51 familias, seis uadis | ✅ literal |
| `sahara_norte_estepa` | 188 familias, suplementación, acuíferos, camiones cisterna | ✅ literal —pero la cita estaba en el host |

**Ninguna de las trece está retractada.** Las doce con DOI tienen el campo
`updated-by` de Crossref vacío; la restante —la del Gebel Elba, de 2006, sin
DOI— se chequeó contra OpenAlex y contra la propia página de la revista. Es la
cuarta condición que entró al encargo después del gemelo retractado del lote 02,
y es la primera vez que se aplica a un lote entero de una sola pasada.

### Cuatro extras que dan vuelta la lectura fácil

- **Sidi Ifni y el promedio de un año.** La ficha decía «rendimientos de varios
  litros por metro cuadrado y día» y no tenía con qué respaldarlo. El sistema de
  captación de niebla más grande del mundo está justo ahí y tiene cuatro años de
  registro: promedios anuales de **1,6 L/m²/día en 2020, 6,0 en 2021 y 3,9 en
  2022**, con picos mensuales de 8,5 en marzo y abril, 7,6 en junio y un máximo
  de **21 en abril de 2021**. Y acá está lo que esta app tiene que aprender de
  memoria: la estimación con la que se dimensionó el proyecto fue de **7
  L/m²/día, de un solo año de medición en 2007**, y quedó por encima de los tres
  años medidos después. Un promedio anual de un año de datos no es un promedio
  anual. Los autores lo dicen con todas las letras: la variabilidad entre años no
  se había evaluado en la fase experimental.
  Y hay un segundo vuelco, geográfico: la malla **no está en la costa**. Está en
  el monte Boutemzguida, a 1.225 m y a 35 km del mar, mientras la ciudad de Ifni
  está a 60 m. La niebla se cosecha donde el relieve la intercepta.
- **El Gran Erg Oriental, donde el método falla.** El artículo mide avance de
  duna con correlación de imágenes sobre el archivo Landsat, y el número que
  logra medir —15,83 m/año— es de la depresión de Bodelé, **en Chad**, que no es
  de esta ficha. En el Gran Erg Oriental, que sí lo es, los resultados salieron
  tan variables que no se pudo determinar la migración, porque los puntos de
  control del procesamiento caen sobre crestas de duna, que se mueven, y eso
  deforma la escena. Si la ficha hubiera copiado el único número del artículo le
  habría atribuido al erg argelino una velocidad que nadie determinó. La entrega
  no lo hizo —citó el fracaso, que es lo correcto— y el comentario de la
  constante lo deja escrito para el que venga.
- **Dajla y la media que no describe.** Con 55 perfiles y 211 muestras, la
  conductividad eléctrica va de **2,3 a 165,8 dS/m con una media de 27,1**. Con
  ese rango la media no es una descripción de nada. Y lo que separa la tierra
  buena de la mala en el análisis multivariado no son las variables de sal sino
  **la profundidad, la grava y la fracción arena**, que es contraintuitivo en un
  oasis salino. Un detalle que explica el resto: en este clima no hay
  meteorización que forme arcilla, así que el carbonato aparece en tamaño arena.
- **El Gebel Elba y la ladera media.** De 179 especies en seis uadis, **92 —el
  51,4 %— aparecieron en un solo uadi o grupo de uadis**: relevar uno no
  describe el de al lado. Y a lo largo del gradiente de altitud del uadi
  Yahameib, la mayor diversidad **no está arriba, en la franja de niebla, sino a
  media ladera**, que es lo que los autores señalan como típico de montaña árida.

Y uno más, que no invierte nada pero afina el diagnóstico: en el cedral del
Atlas Medio, entre las variables de estructura del rodal la que mejor se asocia
al declive del cedro es **el área basal de la encina**, y la competencia más
fuerte se midió en los rodales de cedro más densos, cerca de 1.100 árboles por
hectárea. El cedral no se muere hacia pelado: se muere hacia otro bosque.

### Las dos correcciones

- **La cita de `sahara_norte_estepa` estaba en el host.** La entrega daba el
  handle de ORBi, el repositorio de la Universidad de Lieja, y aclaraba que ese
  registro la identifica como revisada por pares. La aclaración era cierta y el
  repositorio sirvió —de ahí salió el DOI y de ahí se pudo leer el postprint del
  editor—, pero el handle de un repositorio no es la publicación: el artículo
  salió en **Cybergeo, número 863, revista del CNRS**, y la ficha cita su DOI.
  Es la condición 2 del encargo aplicada tal cual está escrita.
  (El sitio de la revista responde con una verificación anti-bot de prueba de
  trabajo, que no se resuelve desde acá. El PDF del editor en ORBi hizo el
  trabajo sin tocar la verificación.)
- **El enebro pierde las fechas de campo.** La entrada afirmaba «relevamientos
  de campo de 2020–2022». El resumen —chequeado en tres índices independientes,
  Crossref, OpenAlex y DOAJ, para no citarlo de oídas— describe una cartografía
  hecha con imagen Landsat 8, modelo de elevación de 30 m, WorldClim y mapa
  geológico digitalizado, y no fecha ninguna campaña. El texto completo sólo
  existe en el editor, detrás de una verificación anti-bot. Puede estar en los
  métodos; la ficha no lo dice. Las cuatro zonas biogeográficas y la banda de
  1.600 a 3.400 m sí se montaron, porque están en el resumen. Es exactamente lo
  de Creta en el lote 03: no estaba mal, estaba sin verificar.

### Lo que esto desbloquea y lo que no

**La cuenta baja de 44 a 31 y NorteÁfrica cierra en 0.** Quedan Medio Oriente 17,
EuropaUE 11 y Canadá 3, que son los lotes 05 y 06 ya pedidos.

Y aparece de paso el primer **rendimiento forrajero medido** del catálogo para un
pastizal bajo monte mediterráneo: 3.143 kg de materia seca por hectárea en
primavera, en el norte de Marruecos, con 95 taxones evaluados por palatabilidad.
Está en el texto de la ficha y **no se conectó a ningún cálculo**: `prodForrajera`
sigue sin fuente y un solo dato de una región no la arregla. Pero es la primera
pista buena que entra por este camino, y conviene que el encargo de forraje la
tenga a mano.

## fuentes-propias, lotes 05 y 06 — las quince aguantan, las dieciseis vacias no

Los dos lotes llegaron juntos, el 13/10/2026. Entre los dos cubren las 31 fichas
que faltaban y traen **15 entradas y 16 `vacias`**. La forma es limpia y los 31
ids existen.

**Las 15 entradas se abrieron una por una y se montaron el 14/10/2026.** El
muestreo obligatorio cayó en `tundra_artica_canadiense`; igual se abrieron todas,
porque el texto va a pantalla.

### Lote 05 — Medio Oriente, 8 de 17

| ficha | lo que afirmaba | |
|---|---|---|
| `arabia_este_niebla` | agosto 2006, 4 hábitats, 32 muestras compuestas, duna a 50 km al SO | ✅ literal (texto completo en PMC) |
| `mar_rojo_mangle` | dos especies, *R. mucronata* sólo en Farasan | ✅ literal (texto completo) |
| `tihama_costa_arida` | aluvión de 50 m y más de 100 m, tritio | ✅ literal (resumen del editor) |
| `arabia_sur_bosque_niebla` | el doble bajo el dosel, 30 % por tronco, transpiración baja | ✅ literal (resumen) |
| `hadramaut_meseta` | cuatro fuentes, 17/11/2001 al 27/3/2002, seis parámetros sobre OMS | ✅ literal (resumen del editor) |
| `iran_sur_nubo_sindico` | cuatro sitios de Hormozgán, óptimo con salinidad media | ✅ literal (texto completo) |
| `kopet_dag` | 2.576 taxones, 702 géneros, 112 familias, 356 endémicos = 13,8 % | ✅ literal (resumen) |
| `sistan_registan` | 48 muestras del corredor de Niatak, el Hamún no es la fuente | ✅ el contenido; ❌ la cita |

### Lote 06 — EuropaUE y Canadá, 7 de 14

| ficha | lo que afirmaba | |
|---|---|---|
| `meseta_anatolia_estepa` | 2004, 37 sitios, 733 ha, 78 especies, condición 1,20 a 3,40 | ✅ literal |
| `estepa_pontica_chernozem` | cronosecuencia 6/15/31/50/97 años contra estepa virgen | ✅ literal, pero ablandado |
| `estepa_forestal_este` | 60 muestras de polen, Kursk y Járkov, seis clases de uso | ✅ literal (texto completo) |
| `zagros_estepa_forestal` | 47, 25 y 15 especies exclusivas por grado de perturbación | ✅ literal (texto completo) |
| `escudo_canadiense_boreal` | 147 parcelas permanentes en el límite del bosque de Quebec | ✅ literal (resumen) |
| `tundra_artica_canadiense` | 12 deslizamientos, tres áreas de Fosheim, 54 vasculares | ⚠ el núcleo ✅; las 54 plantas no |
| `alto_artico_desierto_polar` | julio-agosto 2013, Alexandra Fjord, dolomita y granito, 650 y 500 m | ⚠ el núcleo ✅; las cotas y el clima no |

**Ninguna de las quince está retractada.** Y por primera vez la cuarta condición
pescó un `updated-by` **no vacío**: el artículo del mangle de Hormozgán tiene un
corrigendum (10.3389/ffgc.2025.1610978, 29/04/2025). Se leyó. Corrige la figura 1
—el mapa de ubicación, reusado sin querer de una publicación anterior de uno de
los autores— y no toca ningún dato ni conclusión. El resultado honesto de mirar
ese campo es, esta vez, que no cambia nada; pero había que mirarlo.

### Cinco extras, y uno es una lección nueva

- **El Dofar gana dos veces.** La ficha ya decía que la condensación en la copa
  aporta más agua que la llovizna. El experimento de campo lo mide —bajo el dosel
  llega **el doble** de agua que la lluvia de arriba, y el **30 %** de esa
  precipitación neta baja por el tronco, así que entra concentrada al pie— y
  encuentra el mecanismo que faltaba: durante el jareef **la transpiración queda
  suprimida**, el árbol guarda lo que cosechó y lo gasta recien después, por tres
  meses más, lo que **aproximadamente duplica la estación de crecimiento**. Gana
  por cosechar y por no gastar, y las dos dependen de la copa.
- **Ellesmere repite el Troodos en otro bioma.** Los montículos de crioturbación
  con diapiro tienen **18 % más carbono orgánico** en el desierto dolomítico y
  9 % más en el granítico, y **29 % más nitrógeno disuelto total** en el
  dolomítico — y la **tasa bruta de mineralización de nitrógeno 30 % más baja en
  uno y 48 % más baja en el otro**. Más carbono no es más nitrógeno disponible:
  el carbono del diapiro es más recalcitrante. El stock y la tasa se mueven para
  lados distintos, igual que en la terraza chipriota.
- **Lo que vuelve rápido no es lo que importa.** Esta es la lección nueva, y
  apareció **dos veces en biomas opuestos, en los dos lotes**. En Askania-Nova las
  características funcionales de la estepa se recuperan en pocos años y la
  composición a los 50, pero **la proporción de especialistas de hábitat de estepa
  iguala a la virgen sólo en el campo de unos 97 años**, y la riqueza de
  vasculares sigue siendo menor en todos los campos viejos. En los
  deslizamientos de Fosheim hacen falta **50 años** para una composición
  florística parecida a la del terreno sin disturbar, **y todavía con menos
  riqueza, cobertura discontinua y sin estratificación**. Las dos entregas
  copiaron el número corto y dejaron el largo afuera. Para una app que le va a
  decir a alguien cuánto tarda en recuperarse un potrero, el número que vale es
  el de lo más lento.
- **El escalón del robledal.** En el Kurdistán iraní, las especies exclusivas
  caen 47, 25 y 15 con el grado de perturbación, pero **la curva de rarefacción
  del sitio moderadamente perturbado se parece a la del menos perturbado**. La
  pérdida no es proporcional a la apertura del dosel: el escalón está entre
  moderado y severo. Es el raleo moderado de Stara Planina por cuarta vez, y ya
  son suficientes veces como para que valga de criterio general.
- **La duna no tiene inóculo.** Bajo *Heliotropium kotschyi* en el arenal del
  Wahiba aparecieron **dos morfoespecies** de hongo micorrícico, y sólo después
  de cultivarlas en trampa, contra 25 en el conjunto de los hábitats; la
  abundancia y la riqueza más altas estaban **bajo las palmeras del palmeral**, y
  la especie más frecuente ahí es de las que se asocian a hábitats sin disturbio.
  El palmeral viejo es reservorio y no sólo cultivo, y plantar en arena viva es
  plantar donde no hay con qué colonizar la raíz.

Y una **corrección de dato en una ficha**: el porte del manglar del mar Rojo no
es de tres a cinco metros uniformes, como decía. Lo medido es una cuña: **2,46 m
de promedio junto al borde del agua —hasta 4— y 0,63 m hacia tierra**.

### Un número que no se montó porque el artículo se contradice

La revisión del manglar de Oriente Medio dice que la superficie registrada en
Arabia Saudita fue de **158.000 ha** entre 1990 y 2020 y que contra 2022 eso
implica una pérdida del **87 %**. La tabla de sitios **del mismo artículo** da
**20.400 ha**, que es el orden de magnitud del resto de la literatura. Las dos no
pueden ser ciertas. Se montó la que el artículo sostiene con su propia tabla y el
87 % quedó afuera, con el motivo escrito arriba de la constante. Una revisión que
cumple las cuatro condiciones igual puede traer un número mal copiado de su
propia fuente.

### Lo que no se montó, y por qué

Cuatro datos, todos por la regla de Creta —no estaban mal, estaban sin verificar—:

- Las **cotas de 650 y 500 m** y la media de estación de crecimiento de **3 a
  8 °C con menos de 50 mm** del artículo de los diapiros de Ellesmere. Ese
  artículo es de **acceso cerrado y sin copia en ningún repositorio**; su resumen
  es metadato publicado del editor y no trae esos números.
- Las **54 plantas vasculares** del artículo de Fosheim. Es de acceso abierto
  «bronce» en el editor, pero el editor y el repositorio de Insubria responden los
  dos con verificación anti-bot, que acá no se resuelve.
- El nombre del sitio del experimento del Dofar (**Gogub, Jebel al Qara**), por
  lo mismo: el resumen no lo trae y Wiley no abre.

### La cita en el host, segunda vez seguida

La fuente de `sistan_registan` venía como **un enlace de descarga directa en
`oiccpress.com`**, sin DOI y detrás de una verificación anti-bot. Buscando el
título en los índices aparece que el trabajo salió en la **Iranian Journal of
Earth Sciences 11(3):183-195**, de la Universidad Azad de Mashhad, **con DOI**, y
con copia abierta en el sitio de la revista y en el repositorio de la Universidad
de Pretoria. El contenido verifica literal; la cita estaba mal.

Es exactamente lo del lote 04 con el handle de Lieja, un lote después. Por eso la
condición 2 del encargo quedó reescrita con una instrucción operativa: **buscar
el título antes de dar por buena una URL que no sea un DOI.**

### Las 16 vacías: el problema de método

De 31 fichas, **16 volvieron vacías**, y los motivos son casi todos la misma
frase: «la página de la publicación candidata no se pudo abrir», «no quedó
abierta una publicación editorial o institucional con datos verificables».

**Eso no es «no hay fuente»: es «no la pude abrir».** Una `vacia` cierra una
ficha cuando no existe nada publicado que cumpla las cuatro condiciones, no
cuando la primera página no cargó. Y para varias se puede mostrar que la fuente
existe, porque están en editores que la misma entrega usó bien:

- `mar_rojo_escarpe` y `asir_altiplano_seco`: la **Saudi Journal of Biological
  Sciences** aportó dos fuentes buenas al lote 02.
- `tauro_conifera_montana`, `ponto_anatolia_norte` y `anatolia_oriental_montana`:
  **TUBITAK** es de donde salió la fuente de `meseta_anatolia_estepa` **de este
  mismo lote 06**, y abre sin problema.
- `badghyz_pistacho`: la tenía en la mano. La revisión de Khorassan-Kopet Dagh
  que entregó para `kopet_dag` **nombra el bosque de *Pistacia vera*** como uno
  de los tipos de vegetación principales del área.
- `socotra`, `elburz_estepa_forestal`, `euxino_colquico` y
  `kavir_cuencas_endorreicas`: los cuatro están en o junto a sitios de
  **Patrimonio Mundial**, y ese camino ya funcionó con las marismas de
  Mesopotamia en el lote 02.

Se pidieron de nuevo en `ENCARGO_FUENTES_PROPIAS_LOTE_07.md`, con el camino
señalado para cada una y con dos reglas nuevas: que si una página no abre hay que
probar las otras vías antes de declarar la ficha vacía —en estos dos lotes tres
fuentes se leyeron sólo porque se probó una segunda vía—, y que **el motivo de una
`vacia` tiene que ser chequeable por otro**: qué se buscó, el título de al menos
una publicación candidata, y por qué no sirve.

**La cuenta baja de 31 a 16.** Medio Oriente 9, EuropaUE 7, Canadá 0.

## practicas-indomalaya, lote 01 — vuelve, y no por mentir

Diez prácticas sobre cuatro fichas de los Ghats occidentales, que es la forma
correcta: `PRACTICAS_POR_FICHA` es un `Record<fichaId, PracticaHistorica[]>` y los
cuatro ids existen en el catálogo. (El validador lo había rechazado por «id
repetido»; el error era del validador y está arreglado.)

**El muestreo cayó en `ghats_norte_montano` y no se pudo verificar.** Sus dos
entradas cuelgan de un solo PDF en `oaji.net`, y **todo el host está en 502** —no
el archivo: la raíz del sitio también—, en tres intentos y desde el navegador.
Eso es una caída ajena y no una URL inventada.

Buscando el artículo por su título aparece que existe: R.S. Bhohale (2013),
*International Journal of Science and Engineering*, vol. 1 núm. 2, **páginas
69-70**. Dos detalles que conviene separar:

- **A favor de la entrega:** el rótulo copia el título exacto, incluida la errata
  de la revista («Tribal **Trace** Areas» donde debería decir *Tract*). Eso es
  propio de haber visto el registro, no de haberlo imaginado.
- **En contra de montarlo:** son **dos páginas** en el número 2 del volumen 1 de
  una revista sin presencia indexada, llegada por un agregador que hoy no
  responde. Sobre esa base la entrada afirma una tabla histórica de superficie y
  producción 2005–2009 y un régimen de manantiales y pozos. No se puede abrir, así
  que no se puede desmentir, y una afirmación que no se puede desmentir es
  justamente lo que este archivo no acepta.

Y mirando el lote completo apareció algo más: **dos entradas se sostienen sólo en
`villagesquare.in`**, un sitio de periodismo. No es Wikipedia y el test no lo
rechaza, pero conviene medirlo contra lo que el catálogo ya usa: `practicasHistoricas.ts`
tiene **416 URLs sobre 123 dominios** —85 de PMC, 47 de la FAO, 30 de UNESCO, 27
del NPS, SciELO, Frontiers, Ecology & Society— y **ninguna de periodismo**. Serían
las dos primeras. Ese piso lo fijó el archivo con la práctica, no una preferencia
de ahora.

### Qué vuelve y qué se queda

De las diez, **seis están en línea con el catálogo**: las dos de la meseta de
Nilgiri (repositorio White Rose), el manejo del mosaico de pastizal (ATREE), los
bosques sagrados del sur (Nature Conservation Foundation) y las dos de
ResearchGate, que hay que resolver a su publicación de origen porque ResearchGate
es un host y no una fuente.

**Vuelven cuatro:** las dos de Mahabaleshwar y las dos de `villagesquare.in`. No
hay que reescribir el lote: hay que reemplazar la fuente de esas cuatro, o
dejarlas en `vacias` con el motivo. Una ficha con dos prácticas sostenidas vale
más que una con tres donde una no se puede chequear.

### Engordar las fichas con las `verificacion` encontró un error que el muestreo no (12/10/2026)

Las `verificacion` de la entrega traían material bueno y el paso siguiente era
escribirlo en el texto de las fichas, que es lo que lee el usuario. **Antes de
escribir un número en pantalla hay que abrir la fuente**, y el muestreo sólo
había cubierto una de las seis. Abrí las otras cinco:

| ficha | lo que afirmaba | veredicto |
|---|---|---|
| `iliria_adriatico` | 91K0 y 91L0 en Plitvice | ✅ exacto (ya en el muestreo) |
| `montana_balcanica_sur` | ~22.000 ha de abierto perdidas 1984–2019 | ✅ exacto, y hay más |
| `dinaricos_karst` | suelos hasta >2.000 m, agro en valles y poljes, drenaje en primavera y riego en seca | ✅ exacto |
| `balcanes_mixto` | 2022, seis empresas forestales, 950–1.150 m, Cambisoles | ✅ exacto |
| `carpatos_montano` | hayedo dacio >3.300 ha 500–1.200 m; picea ~3.600 ha 1.350–1.800 m | ❌ **no está en el documento** |
| `apeninos_montano` | Monte Cucco 500–1.000 m, carbono sube con la altitud bajo pinar | ⚠️ no verificable |

**Lo de Piatra Craiului no se sostiene.** Busqué las dos superficies y las dos
bandas altitudinales en las 7.619 líneas del plan de manejo y no aparecen: no hay
ninguna cifra de 3.300 ni de 3.600 ha en todo el documento, y de las bandas sólo
está «reaches 1800 m in altitude». La fuente es buena y pertinente —el plan
clasifica el hayedo dacio 41.1D y la picea subalpina carpática 42.21—, pero esos
números no son de ahí.

Lo que el plan **sí** deja medido es mejor para una app de diseño: el límite del
bosque no está a la misma altura en las dos laderas del macizo. En la occidental
el bosque compacto llega a 1.550 m y los últimos rodales de picea a 1.650; en la
oriental el bosque llega a 1.800 y hay piceas aisladas a 1.870 —unos 200 m de
diferencia por exposición, mismo cordón y mismo clima regional, según un transecto
de S. Mihăilescu (2001) citado en el plan—. **Eso** es lo que entró a la ficha.

**`apeninos_montano` no recibió nada.** Su fuente está detrás de una verificación
anti-bot y no se pudo leer; la cita queda, porque el handle institucional es
válido y abre en un navegador, pero lo que afirma no se escribió. Anotado arriba
de su constante.

**La lección del circuito:** el muestreo de una de cada diez alcanza para decidir
si un lote se monta. **No alcanza cuando el contenido va a pasar a texto que lee
el usuario** — ahí se abren todas. Una de seis tenía números inventados y era la
que el sorteo no había tocado.

Y una propia: escribí los dos agregados con negritas de Markdown (`**así**`), y
`DatoLinea` en `ContextoPanel` renderiza texto plano, así que se habrían visto los
asteriscos. Los saqué. De paso: **`biomasRegionalesIndomalaya.ts` tiene 12 campos
de ficha con asteriscos literales** que hoy se le muestran así al usuario.
