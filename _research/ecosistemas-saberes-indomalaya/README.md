# Indomalaya — las 33 ecorregiones que corrigen un número

Relevamiento pedido el **26/09/2026** con el encargo de
`_research/_encargos/` y entregado en tres tandas. Transcripto al repo el
**26/09/2026**. **No es código y no se monta desde acá**: el montaje vive en
`apps/terreno/lib/biomasRegionalesIndomalaya.ts` y
`apps/terreno/lib/ecorregionesIndomalaya.ts`, y este directorio es la
trazabilidad de dónde salió cada número.

| Archivo | Qué trae |
|---|---|
| `tanda-1-volcanicas.json` | 13 fichas · 14 ECO_ID · Java, Bali, Sumatra, Filipinas |
| `tanda-2-aluviales.json` | 12 fichas · 12 ECO_ID · Ganges, Brahmaputra, Irrawaddy, Chao Phraya, Mekong, río Rojo, turberas |
| `tanda-3-ghats-sri-lanka.json` | 7 fichas · 7 ECO_ID · Ghats occidentales y Sri Lanka |
| `asignacion-eco-id.json` | el mapeo ECO_ID → ficha y la lista de las que no proponen modificador |

**32 fichas para 33 ECO_ID**: `java_bali_montano` cubre 229 y 288.

## De qué se trataba

El bioma global `resolve_bosque_tropical_humedo` penaliza la huerta en −25 con
esta razón: «en los suelos lixiviados que dominan el bioma la fertilidad está en
la biomasa viva y no en el suelo». 216 ecorregiones heredaban eso sin pisarlo y
145 no tenían ninguna ficha regional. La sospecha con la que se armó el encargo
era que media Indomalaya se sostiene sobre andisoles volcánicos, que son lo
contrario de un suelo lixiviado.

**La sospecha era falsa en su mitad volcánica y verdadera, más grande, en la
aluvial.**

- **Grupo A (volcánicas).** Los andisoles están en los conos, no repartidos por
  la ecorregión. De 13 fichas, sólo 6 proponen modificador, y son chicos.
  `sumatra_bajo` confirma que ahí el −25 era casi correcto: −20.
- **Grupo B (aluviales).** 11 de 12 proponen modificador. Las dos llanuras
  gangéticas —516.000 km² de aluvión fértil— pasan de −25 a **0**.
- **Grupo C (Ghats y Sri Lanka).** 6 de 7 proponen modificador. Sri Lanka
  húmedo es el otro caso donde el −25 acertaba.

## La regla del número, que es nuestra y no de HWSD

Cada ficha calcula su delta con esta regla, escrita por el relevamiento:

> `valor = −25 × fracción de suelos con limitante severa, redondeado a 5`

Con la fracción tomada de HWSD v2 (y contrastada con SoilGrids WRB). En el
grupo A la fracción son los lixiviados y ácidos; en el grupo B se suman los
tiónicos (sulfatados ácidos), los salinos o sódicos y la turba de PEATMAP. Se
propone un valor sólo si las dos bases quedan a ≤5 puntos, o si una tercera
fuente que nombre el suelo desempata; si no, la ficha se abstiene, y nueve lo
hacen.

**Dos cosas hay que decir de esta regla y quedan dichas también en el código:**

1. **Es una regla de acequia, no un resultado publicado.** HWSD y SoilGrids son
   la fuente de las *fracciones de suelo*; el −25 de referencia y el
   multiplicador son decisión nuestra. El campo `fuente` de cada
   `modificadores_propuestos` dice las bases de suelo, y eso se lee como si el
   delta saliera de ellas. No sale.
2. **No puede dar un número positivo por construcción.** El multiplicador es
   −25 y la fracción va de 0 a 1, así que el techo es 0. La hipótesis original
   —que el andisol de Java merece un bono— nunca podía confirmarse con esta
   regla. El relevamiento lo justifica con pendiente y retención de fósforo
   (>90 % en Lembang), y el argumento es bueno, pero es una decisión, no un
   hallazgo.

El texto completo de la regla se repite palabra por palabra en el campo
`notas` de cada ficha. Es redundante y se dejó así a propósito: la
transcripción es fiel a lo entregado.

## Qué se cambió al montar, y por qué

**Las 23 que proponen modificador se montaron, menos una.**

`sri_lanka_zona_seca` (301) propone `huerta: 0` con `pisa_global: null`, porque
el relevamiento no tenía el valor global de su bioma. Lo tenemos: el bioma
`resolve_bosque_tropical_seco` penaliza la huerta en −10, y su razón es
**«sin riego o cosecha de agua, la huerta queda parada varios meses del año»**
—es decir, agua, no suelo—. La ficha dice exactamente lo mismo: «lo que limita
la huerta acá es el agua, no el suelo». Como `componerAptitud` hace que el
delta regional *reemplace* al global, montar un 0 habría cancelado una
advertencia hídrica con un argumento de fertilidad. **No se montó el
modificador**: la ficha hereda el −10 del bioma, que es correcto, y su texto de
suelos explica que los Reddish Brown Earths no son el límite.

**`java_bali_montano` quedó fusionada (229 + 288), como se entregó.** Las notas
del relevamiento muestran dos subzonas con datos distintos —229 con 62 % de
Andosols y 0 % de Acrisols; 288 con 29 % y 28 %— y deltas distintos según la
base. Partirla obligaría a escribir dos textos que el relevamiento no escribió.
Una ficha que cubre varios ECO_ID es el caso normal del catálogo. Queda
anotado como deuda si aparece el mapa nacional de BBSDLP.

**Las razones se reescribieron** para que digan de dónde sale el número: la
regla es de acequia y las bases de suelo son el insumo. El contenido técnico y
los porcentajes son los del relevamiento.

**Se corrigió el bioma global.** La razón de huerta de
`resolve_bosque_tropical_humedo` decía que la restricción «no aplica» donde el
suelo es volcánico joven y nombraba «Java, Bali, Luzón, buena parte de Nueva
Guinea». Eso es lo que este relevamiento desmiente: en Java occidental bajo, en
Luzón montano y en Luzón bajo los andisoles son minoría en las dos bases. La
frase ahora dice que la excepción es el cono volcánico, no la isla.

## Lo que quedó afuera, y es una decisión aparte

- **PEATMAP** (Xu et al. 2018, archivo de Leeds) se **cita** como fuente de la
  fracción de turba de cuatro fichas. **Montar la capa** —que es lo que
  recomienda el relevamiento, para que donde caiga turba aparezca una cautela
  explícita de no drenar— es distribuir un dataset y necesita revisar su
  licencia. No verificada. Pendiente.
- **HWSD v2**: la página de FAO no declara licencia. Alcanza para citarla, no
  para montar la tabla.
- **Las páginas de ecorregión de WWF** se autodeclaran «no longer being
  updated… for historical reference only». Se usan igual, porque son la
  descripción publicada de los polígonos RESOLVE que la app ya usa, pero
  conviene saberlo.
- **Los enclaves ultramáficos** de Dinagat, Samar y Zambales, y los **parches
  sódicos (usar)** de la llanura gangética, son limitantes reales que ningún
  promedio de ecorregión representa. El relevamiento propone tratarlos como
  capa aparte o alerta puntual. No hecho.
- **`saberes: []` en las 32**, como en todo el catálogo regional: sin geometría
  con procedencia, licencia y acuerdo, no se atribuye una práctica a un pueblo.
