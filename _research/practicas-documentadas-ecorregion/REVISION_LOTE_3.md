# Revisión del tercer lote — bloque D: México, Centroamérica y Estados Unidos — 15/09/2026

Un archivo de GPT: `bloque-d-mexico-centroamerica-eeuu.json`, **26 entradas, las
26 montadas** en `apps/terreno/lib/practicasHistoricas.ts`. Se suma
`sur_templado_humedo_eeuu`, que venía pendiente del primer lote y se pudo
verificar recién ahora: **27 fichas nuevas**, de 61 a 88 sobre 222.

Los 26 `fichaId` existen, no se repiten, ninguno pisa una ficha que ya tuviera
práctica, y los 26 pasan los chequeos mecánicos del test —fuente https con
rótulo, sin enciclopedias, período con cuerpo, detalle de más de 120
caracteres, `tipo` y `vigencia` dentro de los valores cerrados—.

## Verificación de las fuentes

Se abrió cada URL y se buscó la frase de `verificacion` palabra por palabra.
**18 de 26 pasaron a la primera; las 26 quedaron verificadas.** Es el primer
lote sin ninguna cita caída.

El verificador aprendió un artefacto nuevo, de la misma familia que los
anteriores: el **ordinal en superíndice**. El HTML del NPS escribe
`mid-20<sup>th</sup> century` y, al sacar las etiquetas, queda `mid-20 th
century`, que no coincide con `mid-20th century`. Se junta el número con su
sufijo antes de comparar. Era el único "no dice" real de los ocho.

### Las ocho que no pasaron a la primera

| Ficha | Qué pasó | Resultado |
|---|---|---|
| `alaska_tundra_hielo_beringia` | Ordinal en superíndice: `mid-20<sup>th</sup> century`. | Verificada con el normalizador corregido. |
| `california_klamath_sierra_valle` | `research.fs.usda.gov` devuelve **403 a todo**, navegador incluido. | Montada contra *Fire Ecology* 17:6, que es abierta y publicó el artículo. |
| `pacifico_noroeste_bosques_coniferas` | Lo mismo; el artículo está en Elsevier, con muro de pago. | Montada contra la copia abierta de **PDXScholar**. |
| `sudeste_sabanas_pino_largo` | Lo mismo. | Montada contra *Sustainability* 2(9), abierta. |
| `gulf_mississippi_piney_woods` | **404**: la URL llevaba la coma de "1,000" y la página del NPS usa un guion. | Montada con la dirección corregida. |
| `cuba_bosques_karst_y_pinares` | UNESCO WHC devuelve **403** a cualquier cliente que no sea un navegador. | Montada; frase verificada en el navegador. |
| `tehuacan_cuicatlan_matorral` | Lo mismo. | Montada; frase verificada en el navegador. |
| `selva_maya_peten_yucatan` | Cita **abreviada**: ver abajo. | Montada. |

**Ninguna falló la cita.** Las siete primeras fallaron por el archivo, no por lo
que decía.

### Una cita abreviada, otra vez

`selva_maya_peten_yucatan`. UNESCO escribe "promueven el equilibrio entre las
actividades humanas **que allí se desarrollan** y el cuidado de la biosfera"; la
`verificacion` entregada saca esas tres palabras. Lo que la entrada afirma está
literal en la fuente, así que se montó, pero **es la segunda vez**: en el lote
anterior pasó lo mismo con `amazonia_noroccidental_tierra_firme`, que abrevió
"Globally Important Agricultural Heritage System (GIAHS)" a "GIAHS". La regla ya
estaba escrita en el encargo y volvió a pasar; queda subrayada.

### Tres etiquetas que nombraban otro documento

Es un defecto nuevo y del que conviene acordarse, porque no lo caza ningún test:
la etiqueta de la fuente describía algo distinto de lo que abre la URL.

- `pacifico_noroeste_bosques_coniferas` decía *"Historical Indigenous land-use
  explains plant functional trait diversity"*, que es **otro artículo**. El que
  sostiene la cita es *Traditional knowledge of fire use by the Confederated
  Tribes of Warm Springs in the eastside Cascades of Oregon*.
- `sudeste_sabanas_pino_largo` decía *"Native American use of fire in the
  longleaf pine ecosystem"*; el documento es *Changes in Woodland Use from
  Longleaf Pine to Loblolly Pine*, de Zhang, Majumdar y Schelhas.
- `california_klamath_sierra_valle` atribuía al US Forest Service un artículo
  que publicó *Fire Ecology*.

Las tres se corrigieron al montar, con autor y año. Una etiqueta que no
corresponde al documento es la forma prolija de perder la trazabilidad: la cita
se verifica igual, pero el lector que la sigue termina en otro lado.

## La que se recuperó del primer lote

`sur_templado_humedo_eeuu` había quedado afuera porque el certificado de
`srs.fs.usda.gov` estaba vencido. Sigue vencido —caducó el 10/09/2026—, pero el
informe es GTR-SRS-166 del USDA Forest Service y **GovInfo**, el archivo
permanente de la imprenta del gobierno de Estados Unidos, sirve el mismo PDF
sobre un certificado válido. La frase está en la página 5. Se montó contra
GovInfo.

## Control editorial

**La autoría no se calló en ninguna de las 26**, por tercer lote consecutivo. Se
revisó en las dos direcciones: ninguna `verificacion` nombra un pueblo que el
texto publicado esconda, y ningún nombre propio del texto publicado falta en su
fuente. Ahtna, Kuna/Guna, Karuk, Yurok, Nez Perce/Nimiipuu, ojibwe de Red Cliff
y Bad River, salish, pend d'Oreille, Cherokee, seminola —con Holata Micco
nombrado—, zapotecos de Capulálpam, bribri, cabécar, mayas peninsulares,
Ichishkin, Kitsht Wasco y Numu de Warm Springs.

Dos formas de nombrar que vale la pena copiar: `darien_humedo_panama` escribe
"el pueblo que la fuente denomina Kuna" y después usa "Guna", que es el nombre
actual; `interior_noroeste_palouse_willamette` escribe "familias Nez Perce o
Nimiipuu". Las dos dejan al lector conectar el texto con la fuente sin quedarse
con la grafía vieja.

**Y aparece algo que no estaba pedido: la entrada que se niega a atribuir.**

- `baja_california_desiertos_y_sierras` aclara que la agricultura de los oasis
  "surgió con las misiones jesuitas, no como una práctica agrícola
  prehispánica", y que no debe atribuirse "a los pueblos indígenas que ya usaban
  esos lugares de agua".
- `cuba_bosques_karst_y_pinares` pide no presentar "una economía colonial del
  tabaco como saber indígena".
- `selva_maya_peten_yucatan` avisa que las concesiones forestales son "una
  institucionalidad contemporánea del Petén" y "no debe etiquetarse
  automáticamente como práctica maya ancestral".
- `ozarks_transicion_bosque_pradera` dice que la observación colonial de 1750
  "no identifica un pueblo concreto".
- `tehuacan_cuicatlan_matorral` advierte contra presentar doce mil años como "un
  único sistema inmutable".
- `alaska_costa_taiga` separa la estación de monitoreo del parque de la
  estructura tradicional Ahtna.

La regla del encargo tiene dos mitades —ni inventar ni borrar la autoría— y esta
es la primera vez que un lote ejercita la primera con este cuidado.

Casi todas las entradas cierran además con la advertencia que corresponde: que
la quema requiere autoridad tribal y evaluación de combustible, que un
diagnóstico de quince fincas no autoriza extrapolar a toda la Mosquitia, que un
registro histórico interrumpido en 1855 no prueba continuidad.

## Lo que GPT dejó afuera y avisó

26 de las 52 fichas pendientes del bloque D, listadas en `COBERTURA_BLOQUE_D.md`.
Los huecos que el propio informe señala como más importantes: manglares de
México y Centroamérica, bosques secos de Balsas-Jalisco y Panamá, pinares mayas
y de Belice-Mosquitia, La Española y Jamaica, Sonora-Sinaloa, Tamaulipas-Texas y
la Gran Cuenca.

## Pendientes para quien pueda abrir lo que yo no

Quedan cuatro, con su `verificacion` intacta en los JSON:

- `sabanas_guayanesas` — el documento de UNESCO (`whc.unesco.org/document/134048`)
  dispara una descarga en vez de abrirse; se reintentó y volvió a pasar.
- `campos_rupestres` — la nota de FAO Brasil ya no existe. Quedaría buscarla en
  el archivo web, que es el mismo documento; el intento de hoy dio 429.
- `bosque_mesofilo_montana` — el PDF de CONABIO no tiene capa de texto.
- `amazonia_suroccidental_tierra_firme` — la única cita caída de todos los lotes:
  necesita otra fuente o el texto completo del artículo de *Nature*.
