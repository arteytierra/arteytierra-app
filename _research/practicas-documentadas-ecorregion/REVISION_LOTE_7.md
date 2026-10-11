# Revisión del séptimo lote — complemento E: prioridades y huecos — 16/09/2026

Un archivo de GPT: `complemento-e-prioridades-huecos.json`, 9 entradas.
**Se montaron las 9.** De 172 a **181 fichas sobre 222**.

Es el lote más chico y el más difícil: no abre bloques ni llena zonas enteras,
sino que reabre **las seis fichas que el encargo marcó como prioritarias** —las
cuatro de Europa con mucha bibliografía y las dos de Medio Oriente— y suma tres
huecos más. Las seis prioridades se cerraron.

Con las cuatro de Europa, **el bloque G queda cerrado**: 28 de 28. Ya son tres
los bloques completos —el catálogo base, Europa no comunitaria y la Unión
Europea—. H sube a 17 de 28 e I a 12 de 14.

Los 9 `fichaId` existen, no se repiten, ninguno pisa una ficha que ya tuviera
práctica, y los 9 pasan los chequeos mecánicos.

## Verificación de las fuentes

**Las 9 quedaron verificadas. Ninguna cita caída, por quinto lote seguido.**
4 pasaron automáticamente; las otras cinco se resolvieron una por una.

| Ficha | Qué pasó | Resultado |
|---|---|---|
| `dinaricos_karst`, `mar_rojo_costa_desierto` | Springer responde a `curl` con un desafío de JavaScript. | Los dos son **de acceso abierto**: se leyeron enteros con el navegador. 24/24 y 11/11 palabras. |
| `balcanes_mixto` | La URL apuntaba a ResearchGate, que responde 403. | Verificada en la revista, contra el resumen público de ScienceDirect. 8/8. |
| `mesopotamia_jazira` | Taylor & Francis responde con un desafío de Cloudflare y no hay copia archivada. | El resumen que el editor depositó en Crossref se lee en OpenAlex: la frase está textual. |
| `estepa_siria_badia` | Coincidía 11 de 18 palabras. | La cita le corrigió una errata a la fuente. Ver abajo. |

Dos rutas nuevas, las dos por el mismo motivo —leer un resumen que el editor no
deja leer—: **OpenAlex**, que devuelve el resumen depositado en Crossref cuando
el sitio del editor está cerrado, y el propio ScienceDirect con el navegador.
Se agregan a la cadena Crossref → Unpaywall → Semantic Scholar → PMC →
repositorio → Internet Archive.

## La fecha que la fuente no dice

`mar_rojo_costa_desierto` fechaba la práctica "desde aproximadamente **5500
años antes del presente**". El artículo no dice eso en ninguna parte. Lo que
dice es que sacudir y podar acacias para cosechar forraje son prácticas
antiguas *"depicted as early as the Egyptian New Kingdom (1539–1075 BCE)"* —dos
milenios más acá—.

Es el primer defecto de los siete lotes que cae sobre el **período**, y por eso
es el peor de todos los que llevamos. Esta capa se construye sobre una regla:
la práctica no se le atribuye a una cultura, se le atribuye a un tiempo. Si el
período no viene de la fuente, no queda nada que el lector pueda comprobar. La
entrada quedó fechada en el Reino Nuevo egipcio, que es lo que el artículo
sostiene.

## Cinco detalles que la fuente no sostenía

- `mar_rojo_costa_desierto` decía que los pastores cuidan *Acacia tortilis* con
  podas. El artículo es explícito en lo contrario para una de las dos
  subespecies: podan **subsp. raddiana** y **nunca subsp. tortilis**, porque
  ésta no rebrota bien después de cortada. Se agregó la distinción, y los
  nombres de la práctica: *waak* entre los beja, *janii* entre los ababda,
  *tahsiin* entre los maʿaza.
- `dinaricos_karst` atribuía la degradación del karst a "las quemas mal
  controladas". La fuente separa expresamente el fuego deliberado del incendio
  no controlado, y atribuye la deforestación y el uso insostenible del pastizal
  al **sobrepastoreo**. Y explica por qué se quemaba, que la entrada no decía:
  el rebrote posterior al fuego es mucho más rico en minerales y proteína, y
  junto con las sales de la ceniza mejoraba la calidad del forraje.
- `euxino_colquico` decía que en Tabakoni se recuperaron "molinos manuales".
  No hay molinos en el artículo: hay mijo, hojas de hoz, punzones y puntas de
  flecha. Se sacaron, y se agregó lo que sí dice y es más fuerte: la
  acumulación de granos del siglo XVIII a. C. es uno de los registros más
  antiguos de mijo cultivado en la región.
- `mesopotamia_jazira` cerraba advirtiendo que "intensificar secano bajo lluvias
  muy variables elevó la vulnerabilidad". El resumen —lo único legible— no dice
  eso. Se reemplazó por lo que sí dice: el halo de dispersión cerámica alrededor
  de cada asentamiento corresponde a los momentos de máxima población.
- `ponto_anatolia_norte` ubicaba la avellana en "la costa **norte** del mar
  Negro". La fuente dice *"the Black Sea coast of the north of Turkey"*: el
  norte de Anatolia, que es la costa **sur** del mar Negro. Ordu, Giresun,
  Trabzon, Rize y Artvin están ahí. Un error de lectura que mueve la ficha
  1.000 km y de país.

## La cita que le corrigió una errata a la fuente

`estepa_siria_badia` citaba *"From earliest times until the end of the Second
World War, Syrian grazing lands were under tribal control"*. La página de la FAO
escribe **"Syria n grazing lands"**, con un espacio de más adentro de la palabra.
La cita venía con la errata arreglada y por eso no coincidía con la fuente.

Es el mismo defecto del cuarto lote, con la ortografía al revés: ahí se le
corrigió la ortografía a una cita en español, acá a una en inglés. Se acortó al
tramo que está escrito igual, que además es el que fecha la práctica.

## La URL que no era del editor

`balcanes_mixto` apuntaba a **ResearchGate**, que aloja copias subidas por
usuarios: no es el lugar de publicación, puede no ser la versión final y puede
desaparecer sin aviso. El artículo es de *Quaternary International* 496 y la URL
pasó al DOI. Es el primer caso en siete lotes; conviene que no haya un segundo.

## Dos fuentes de pago, las dos bien tratadas

`balcanes_mixto` y `mesopotamia_jazira` son artículos cerrados. En los dos el
resumen público alcanza para sostener lo que la entrada afirma —los 18
yacimientos, el robledal, la leña y el forraje en uno; los ocho milenios, el
Xerosol y los fosfatos en el otro— y las dos entradas lo dicen. Es el aviso que
entró al encargo después del sexto lote, funcionando.

## Una fuente que no es un paper

`badghyz_pistacho` se apoya en la agencia estatal de noticias de Turkmenistán.
Es la primera vez en toda la capa. La entrada aguanta porque lo que afirma es
la historia de un programa forestal del propio Estado —el ensayo de 1930 que
fracasó, la corrección al año siguiente, las casi cinco mil hectáreas de 1985,
el abandono de las densidades altas— y ahí el Estado es fuente primaria de sus
propios actos. La entrada además se declara experiencia técnica contemporánea y
no saber ancestral, que es lo correcto.

Pero un boletín oficial no es un trabajo revisado, y no habría que apoyar en él
una afirmación ecológica. Se agrega el aviso al encargo.

## Control editorial

El resto está cuidado, y este lote es el mejor en un punto donde los seis
anteriores fallaron: **las nueve etiquetas nombran autor, año, publicación y
volumen**. No hubo que corregir ninguna por falta de autor —sólo se completaron
cuatro con número de páginas y con la aclaración de si el texto es abierto o de
pago—. Van catorce corregidas en siete lotes, ninguna en éste.

Tres entradas ponen el límite de lo que la fuente prueba sin que nadie se lo
pida: `euxino_colquico` aclara que la evidencia vale para Tabakoni y sitios
comparables y no para toda la ecorregión ni para un pueblo que la fuente no
nombra; `dinaricos_karst` conserva la advertencia sobre degradación en vez de
leer la quema como receta; `ponto_anatolia_norte` aclara que un cultivo
documentado no prueba que su manejo histórico del suelo sea sostenible.

Y `mar_rojo_costa_desierto` nombra a los cinco pueblos como los nombra la
fuente: hadandawa, amar ar, bishaari, ababda y maʿaza.

## Nota de método

Buscar el primer `indexOf` de un término en un documento largo que cubre muchos
países da la ocurrencia equivocada. Verificando `estepa_siria_badia` casi doy
por inventadas la nacionalización y el transporte motorizado: la primera
aparición de "motor" en esa página de la FAO está en la sección de Mongolia
Interior, mil líneas antes que la de Siria. Hay que mirar **todas** las
ocurrencias.

## Lo que queda

**41 fichas de 222 siguen sin práctica:**

| Bloque | Sin entrada |
|---|---:|
| D. México, Centroamérica y Estados Unidos | 17 |
| H. Medio Oriente | 11 |
| B. Sudamérica | 10 |
| I. Norte de África | 2 |
| E. Canadá, Alaska y Groenlandia | 1 |

Las prioridades que quedan, por orden de dificultad creciente: los manglares y
las selvas húmedas de Centroamérica y el Caribe (bloque D), donde hay
bibliografía; `hircania_caspio` y `kopet_dag`, que son regiones agrícolas viejas
y el hueco sorprende; y después las islas oceánicas y los desiertos extremos
—`socotra`, `uweinat_tibesti`, `alto_artico_desierto_polar`,
`islas_desventuradas`, `revillagigedo_ecosistemas_insulares`—, donde lo más
probable es que la respuesta correcta sea que no hay nada que documentar.
