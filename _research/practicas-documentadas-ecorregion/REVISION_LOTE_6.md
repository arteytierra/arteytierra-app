# Revisión del sexto lote — complementos B, C y D — 16/09/2026

Tres archivos de GPT: `complemento-b-sudamerica.json` (3 entradas),
`complemento-c-catalogo-base.json` (5) y `complemento-d-america.json` (9).
**Se montaron las 17.** De 155 a **172 fichas sobre 222**.

Es el primer lote que no abre un bloque nuevo: llena huecos declarados en
entregas anteriores. **El catálogo base queda cerrado**, 22 de 22, con sus cinco
ausencias resueltas. B sube a 37 de 47 y D a 36 de 53.

Los 17 `fichaId` existen, no se repiten, ninguno pisa una ficha que ya tuviera
práctica, y los 17 pasan los chequeos mecánicos.

## Verificación de las fuentes

**Las 17 quedaron verificadas. Ninguna cita caída, por cuarto lote seguido.**
7 pasaron automáticamente; las otras diez se resolvieron una por una, y en las
diez el problema fue el acceso, nunca la cita.

| Ficha | Qué pasó | Resultado |
|---|---|---|
| `bosque_humedo_occidente_ecuador` | ScienceDirect no atiende a este cliente. | El resumen es público: se leyó con el navegador. |
| `guayanas_bosques_inundables_delta`, `humedales_orinoco` | MDPI sirve el texto completo, pero no a `curl`. | Las dos frases están textuales; leído con el navegador. |
| `atlantico_templado_oceanico` | English Heritage responde 403. | Verificada contra la copia archivada; se conserva la URL viva. |
| `templado_continental_europeo` | `unesco.org/en/articles/...` devuelve 500 hoy. | Ídem. |
| `boreal_nordico_turberas` | `diva-portal.org` no responde: el dominio no conecta. | Ídem, contra la copia archivada del PDF. |
| `bahamas_pinares_manglares` | `doi.org` redirige a PNAS, que responde 403. | Montada contra PubMed Central, que sirve el mismo artículo abierto. |
| `gran_cuenca_meseta_colorado` | La ficha de eScholarship no trae el texto. | Verificada contra el PDF del mismo ítem; se conserva la URL de la ficha. |
| `hawaii_matorrales_altos_bajos` | `journals.uchicago.edu` responde con un desafío de Cloudflare. | Verificada contra el resumen archivado. Ver abajo. |
| `manglares_mexico` | SAGE responde con un desafío de Cloudflare. | Verificada contra la copia archivada; se conserva la URL viva. |

Ningún artefacto tipográfico nuevo: la lista sigue en cinco —guion de corte de
renglón en PDF, entidades numéricas, ordinal en superíndice, marcador de nota al
pie y guion blando—.

## Lo que este lote enseñó: la fuente de pago

`hawaii_matorrales_altos_bajos` citaba un artículo **cerrado** de *Current
Anthropology* y su `detalle` describía "alineamientos, senderos y parcelas",
"bandas de lluvia y suelos volcánicos aptos para cultivos como batata" y un
avance posterior "hacia zonas marginales de mayor costo y riesgo". Nada de eso
está en el resumen, que es lo único público. La fecha sí: las dos vías de
desarrollo, la primera desde el siglo XIV y la segunda después de mediados del
XVII.

No es el caso de `socotra` —ahí la fuente hablaba de otra cosa—, así que la
entrada no se devolvió: **se recortó al resumen y se dice que se recortó**. La
ficha ahora termina diciendo que el artículo es de acceso pago y que su resumen
fecha el desarrollo pero no describe la forma de los campos ni los cultivos. Un
resumen alcanza para fechar una práctica y casi nunca para describirla.

## Cuatro detalles más que la fuente no sostenía

Ninguno cambia lo que la entrada afirma en lo esencial, pero los cuatro
agregaban un mecanismo que la fuente no menciona. Se reescribieron contra el
texto abierto:

- `bosque_humedo_occidente_ecuador` decía que la asociación "reducía la
  dependencia de un único cultivo ante perturbaciones ambientales". El artículo
  no dice eso; dice que los conjuntos apuntan a **un mosaico de bosques
  fragmentados**, que es más interesante y sí está escrito.
- `guayanas_bosques_inundables_delta` decía que "la altura y la forma de los
  montículos respondían a la profundidad del agua". Rostain vincula sólo **la
  forma**, y con cautela ("seems to be related"); de la altura dice lo
  contrario, que **no siempre alcanzaba** y por eso se cavaron canales.
- `humedales_orinoco` explicaba que los conucos evitaban "que el exceso
  estacional de agua asfixiara raíces o arrastrara semillas". La fuente le
  atribuye función de drenaje, sin ese detalle fisiológico.
- `manglares_mexico` decía que los corrales concentraban la pesca "con el
  movimiento de la marea" y que el arte "evitaba embarcaciones o redes
  complejas". Ninguna de las dos cosas está. Lo que sí está, y es mejor, es que
  las capturas abundantes podían malograrse cuando caían tiburones grandes o
  cocodrilos, **que rompían la estructura con la cola**.

Y `atlantico_templado_oceanico` afirmaba que el flujo "adelantaba el crecimiento
del pasto": es el efecto por el que se hacían las praderas de agua, pero English
Heritage no lo dice y la segunda fuente es la ficha de un PDF que no abre desde
acá. Se reescribió con lo que la página sí dice, que ya es bastante: canales
cortados junto al río, limo fértil sobre el pasto, compuertas para abrir o
cerrar el flujo.

## Volvió la autoría callada

`sonora_sinaloa_bosque_seco_desierto` hablaba de "otros agricultores tempranos"
que sembraban junto a los cauces. El Servicio de Parques escribe: *"Early
practitioners employed runoff irrigation, called Ak-Chin by the Tohono O'odham"*.
La fuente nombra al pueblo y la entrada no. Es el error del primer lote —hohokam,
ojibwe, taíno— que no había vuelto a aparecer desde que el encargo separó las dos
mitades de la regla. Se agregó.

## Siete etiquetas sin autor

El defecto de siempre, esta vez todas de la misma forma: la revista o el
organismo puesto donde va el autor. "Quaternary International — Late
pre-Columbian agroforestry…", "Current Anthropology — Variable Development…",
"University of California eScholarship — Agriculture Among the Paiute…". Ninguna
miente y todas abren el documento correcto, pero ninguna permite encontrar el
trabajo si la URL se cae, que es justamente para lo que sirve una referencia.

Se completaron con autor, año, revista y volumen: Stahl y Pearsall (2011);
Rostain (2010); Norstedt, Maher Hasselquist y Laudon (2021); Fall, van Hengstum,
Lavold-Foote, Donnelly y otros (2021); Lawton, Wilke, DeDecker y Mason (1976);
Ladefoged y Graves (2008); Elliott, Maezumi, Robinson, Burn, Gosling,
Mickleburgh, Walters y Beier (2022); Rubio-Cisneros, Aburto-Oropeza, Jackson y
Ezcurra (2017). Con esto van **catorce etiquetas corregidas en seis lotes**.

## Un nombre propio que la fuente escribe mal

`humedales_orinoco` decía "El misionero **Joseph** Gumilla". El nombre es
correcto —el jesuita firmaba Joseph Gumilla—, pero la fuente escribe "Juan
Gumilla" y "Father Gumilla". Corregirle el nombre a la fuente en silencio deja
una entrada que no se puede comprobar contra ella, igual que la cita con la
ortografía arreglada del cuarto lote. Quedó **"el misionero Gumilla"**, que es
lo que las dos sostienen.

## Control editorial

El resto del lote está cuidado. Siete entradas nombran al pueblo como lo nombra
la fuente: los mayas peninsulares, los otomacos, los arauquinoides, los lucayos,
los cimarrones de Sotavento del Cockpit Country, los paiute de Owens Valley, las
poblaciones ostionoides y taínas de La Española. Y dos ponen el límite de lo que
la fuente prueba: `gran_cuenca_meseta_colorado` aclara que el origen anterior no
está fechado, y `jamaica_bosque_seco` dice que la transición del paisaje no se
explica por el paleoclima, que es exactamente lo que el artículo demuestra.

Una sola fuente sostiene dos fichas: el artículo de Rostain (2010) alimenta
`guayanas_bosques_inundables_delta` y `humedales_orinoco`, cada una con su propia
frase y en su propia ecorregión.

## Lo que queda

**50 fichas de 222 siguen sin práctica**, y ya no se ordenan por continente:

| Bloque | Sin entrada |
|---|---:|
| D. México, Centroamérica y Estados Unidos | 17 |
| H. Medio Oriente | 14 |
| B. Sudamérica | 10 |
| G. Unión Europea | 4 |
| I. Norte de África | 4 |
| E. Canadá, Alaska y Groenlandia | 1 |

Más de la mitad son islas, manglares y desiertos: ecorregiones donde o no hubo
agricultura documentada, o la documentación no distingue la ecorregión del país.
Ahí es donde hay que buscar distinto, no más.
