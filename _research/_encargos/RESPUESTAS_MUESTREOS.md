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
| fuentes-propias | 03 | limpia | — | **recibido**, sin abrir todavía |

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

## fuentes-propias, lote 03 — recibido, no abierto

Llegó sin pedirlo, junto con el 02: seis fichas de EuropaUE —la conífera costera
escandinava, el abedular montano, el Egeo, Creta, el Troodos y la conífera del
Mediterráneo oriental—. Forma limpia y los seis ids existen. **No se abrió
ninguna fuente todavía, así que no se monta.** Dos cosas que ya se ven desde
afuera y habrá que chequear al abrirlo: `chipre_troodos` afirma tres porcentajes
de carbono orgánico (1,0 · 1,3 · 1,7 % en los primeros 25 cm) y
`mediterraneo_oriental_conifera` una cota de 1.352 m, y los números exactos son
justo lo que el lote 01 inventó.

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
