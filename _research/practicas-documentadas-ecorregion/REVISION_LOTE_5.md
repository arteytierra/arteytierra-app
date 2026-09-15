# Revisión del quinto lote — bloques E, F y G: Canadá, Groenlandia y Europa — 15/09/2026

Tres archivos de GPT: `bloque-e-canada-alaska-groenlandia.json` (9 entradas),
`bloque-f-europa-no-comunitaria.json` (8) y `bloque-g-union-europea.json` (24).
**Se montaron las 41.** De 114 a **155 fichas sobre 222**, y con esto los nueve
bloques del anexo quedan abiertos: no falta ningún continente, faltan fichas
sueltas.

Los 41 `fichaId` existen, no se repiten, ninguno pisa una ficha que ya tuviera
práctica, y los 41 pasan los chequeos mecánicos.

## Verificación de las fuentes

**Las 41 quedaron verificadas. Ninguna cita caída, por tercer lote seguido.**
35 pasaron automáticamente; las otras seis se resolvieron una por una.

| Ficha | Qué pasó | Resultado |
|---|---|---|
| `montano_iberico` | **Guion blando** dentro de una palabra: la UGR escribe `opera&shy;tivas`. | Verificada con el normalizador corregido. |
| `cantabrico_atlantico_iberico` | Cita **reescrita**: ver abajo. | Montada. |
| `columbia_britanica_interior` | Wiley responde con un desafío de Cloudflare que no se resuelve. | Montada contra PubMed Central, que sirve el mismo artículo abierto. |
| `creta_mediterranea` | ScienceDirect pide resolver un captcha. | Montada contra la copia abierta del Dipòsit Digital de la UB. |
| `carpatos_montano` | `fao.org/family-farming` sigue detrás de Cloudflare. | Verificada contra la copia archivada del 17/03/2025; se conserva la URL de la FAO. |
| `sarmatico_boreonemoral` | `julkaisut.metsa.fi` no responde desde acá: la conexión no se establece, el dominio entero está caído. | Verificada contra la copia archivada de 2023; se conserva la URL viva. |

El artefacto tipográfico nuevo es el **guion blando** (`&shy;`, U+00AD): no se ve
en pantalla, no corta la palabra al leerla, y parte la comparación en dos. Se
suma a la lista: guion de corte de renglón en PDF, entidades numéricas, ordinal
en superíndice y marcador de nota al pie.

### La cita reescrita, una vuelta de tuerca

`cantabrico_atlantico_iberico`. La tesis dice "sitúan el origen del sistema
agrario en terrazas de Galicia **en** los primeros siglos de la Alta Edad
Media"; la `verificacion` escribió "...de Galicia **data de** los primeros
siglos...". No es una abreviación: es una reescritura. Afirma lo mismo y la
entrada se montó, pero una cita entre comillas que nadie va a encontrar buscando
esas palabras deja de servir para lo único que sirve.

Es la quinta vez que la frase entregada no es exactamente la de la fuente. Ya
hubo dos abreviadas en el tercer lote y el cuarto, una más en el segundo, y una
corregida de ortografía en el cuarto.

## Tres etiquetas que nombraban otro documento

Sigue siendo el defecto que ningún test caza y que aparece en todos los lotes.

- `columbia_britanica_interior` citaba *"Indigenous stewardship and the
  historical fire regime at Ne Sextsine"*, que es un título inventado. El
  artículo se llama *The contribution of Indigenous stewardship to an historical
  mixed-severity fire regime in British Columbia, Canada*, de Copes-Gerbitz,
  Daniels y Hagerman.
- `creta_mediterranea` citaba *"Journal of Archaeological Science: Reports (2021)
  — Olive management and pastoralism in East Crete"*. Ni la revista ni el título:
  es *Mediterranean polyculture revisited: olive, grape and subsistence
  strategies at Palaikastro, East Crete*, de Livarda y otros, en el *Journal of
  Anthropological Archaeology*.
- `carpatos_montano` citaba a la plataforma de la FAO como si fuera la autora.
  El documento es de **Barbara Knowles** (Pogány-havas Microregion Association,
  2011); la FAO sólo lo cataloga.

Las tres se corrigieron al montar, con autor, año y revista.

## El `detalle` contra la fuente

Después de lo que pasó en el cuarto lote, este se revisó entero con la misma
lupa: qué oración de la fuente respalda cada afirmación del `detalle`. **Ninguna
entrada falló como fallaron `socotra` y `uweinat_tibesti`.** Los números y los
nombres propios están donde tienen que estar: los 200 km del Köç Yolu, los 3.000
años del South Downs, los 46 sitios de cercos gwich'in, los 250 y 400 años de
los caches de Many Caches, los 4 o 5 meses en las alturas de Anatolia, San Jorge
el 23 de abril y San Demetrio el 26 de octubre para la trashumancia del Pindo.

Lo único que apareció, y va anotado porque es una diferencia de grado y no de
tipo, son cuatro agregados menores que la fuente no dice con esas palabras: el
nombre **yayla** para las pasturas de altura que la FAO llama "highlands and
plateaus"; el nombre **tratturi** para las que UNESCO llama "royal shepherd's
tracks"; el **encierro nocturno** de las ovejas en South Downs, donde la fuente
describe la transferencia de fertilidad sin mencionar el encierro; y los
**canales** del delta del Po, donde UNESCO habla de drenaje y de
reclamación. Ninguno cambia lo que la entrada afirma. Los dos primeros incluso
van en la dirección correcta —poner el nombre local de la práctica— que es
justamente lo que el lote anterior se había olvidado de hacer.

## Control editorial

**Es el mejor lote en autoría.** El bloque E la nombra en las nueve entradas y
con cuidado: "El pueblo T'exelc, hoy Williams Lake First Nation"; el pueblo
syilx Okanagan; los haida; las comunidades ojibwa; los gwich'in; el conocimiento
Inuvialuit en la interpretación de Many Caches; los inuit de Baffin. En G están
los sámi, los tushin de Georgia, el pueblo khinalig, las comunidades valacas del
Pindo, los colonos griegos dorios de Quersoneso, la familia Este en el Po.

Y varias entradas ponen el límite de lo que la fuente prueba, que es la otra
mitad del oficio:

- `haida_gwaii_hipermaritimo` aclara que la descripción de los jardines de trébol
  viene de Charles Newcombe a fines del siglo XIX y que las excavaciones citadas
  **no hallaron prueba arqueológica de cultivo**, así que no proyecta antigüedad.
- `islandia_abedular` avisa que algunos indicadores paleoecológicos podrían
  reflejar pastoreo y no sólo pradera de heno, "por lo que la función no se
  presenta como exclusiva".
- `meseta_anatolia_estepa` documenta la rotación cereal-barbecho "pero no
  demuestra que sea óptimo bajo las condiciones climáticas actuales".
- `creta_mediterranea` y `crimea_submediterraneo` se registran como históricas
  porque la fuente reconstruye usos prehistóricos sin continuidad predial.
- `templado_occidental_europeo` no presenta el bocage como un patrón intacto:
  dice que la mecanización y la concentración parcelaria simplificaron el
  paisaje.

## Lo que GPT dejó afuera

Los tres informes de cobertura están al lado de este archivo. Con este lote
cerrado, lo que falta ya no se ordena por continente sino por ficha: son las
ecorregiones que no tuvieron evidencia específica en cada bloque, más `socotra` y
`uweinat_tibesti`, devueltas en el cuarto lote.
