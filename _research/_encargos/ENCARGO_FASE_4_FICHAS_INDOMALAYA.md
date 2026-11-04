# Fase 4 — Fichas ecológicas: Indomalaya, los 72 que faltan

*Pegar primero `GPT_LOCAL_REGLAS.md` y después esto. Entregas en
`C:\Arte y Tierra\encargos-gpt\entregas\fichas-indomalaya\NN.json` — carpeta
nueva, el primer lote es el **01**.*

---

## Dónde quedó este reino, medido

La app clasifica el punto del predio en una de las **846 ecorregiones de
RESOLVE** y le muestra una ficha: vegetación, fauna, suelos, especies y
**modificadores de aptitud** que suben o bajan el puntaje de cada uso del
terreno. Sin ficha, el punto recibe el modificador del **bioma global** y nada
más.

**Indomalaya tiene 106 ecorregiones. 34 tienen ficha. 72 no.**

Las 33 que se montaron en septiembre de 2026 cubren el arco volcánico y las
llanuras más pobladas, y fueron el encargo de mayor rendimiento del catálogo: Java,
Bali, Sumatra, Luzón, Mindanao, Mindoro, Negros, Sri Lanka, los Ghats, la llanura
gangética, el valle del Brahmaputra y los pantanos de Irrawaddy, Chao Phraya,
Tonle Sap y el Río Rojo. **No hay que volver a tocar esas.**

Lo que queda es otra cosa y conviene decirlo con precisión, porque cambia el
argumento. El error grande que motivó el encargo original —el `huerta −25` del
bosque húmedo tropical escrito sobre el oxisol amazónico y heredado sobre
andisoles volcánicos— **ya está matizado**: el bioma global lo dice ahora
explícitamente y las 33 fichas lo resuelven predio por predio.

Entonces la razón de esta fase no es un modificador equivocado. Es más simple:
**son las regiones con más gente del planeta sin ninguna ficha.** El cinturón
seco del Decán, la llanura indogangética seca, Indochina entera, Borneo, la
península malaya y el Himalaya. Agricultura de secano de milenios, con instituto
agronómico nacional en cada país y literatura abundante.

---

## Qué es una ficha, y qué no

**Describe la ecorregión, no el predio.** Se escribe para que alguien que cae
ahí entienda en qué sistema está: qué crece, sobre qué suelo, con qué agua, y
qué usos el lugar banca o castiga.

**`saberes` va siempre vacío.** Los saberes territoriales son otra capa, con
otro contrato y otras cautelas. No los metas acá aunque la fuente los nombre.

**Nativa y cultivo son dos cosas distintas.** Ojo especialmente en este reino,
porque acá se domesticó medio mundo: el arroz, la banana, la caña de azúcar, los
cítricos, el mango, el coco, la pimienta, la nuez moscada, el clavo y la berenjena
son **nativos de acá**. Si es nativo de la ecorregión va como nativa, y que además
se cultive se cuenta en el texto.

---

## Los seis campos, y qué se espera de cada uno

| Campo | Qué va | Largo |
|---|---|---|
| `resumen` | Dónde queda, qué tamaño, qué lo define, cuánto queda del hábitat original | 2 a 4 oraciones |
| `vegetacion` | Las formaciones con géneros y especies nombradas, el rango de lluvia y los meses secos | 3 a 5 oraciones |
| `fauna` | Cuántos mamíferos y aves, y las que la fuente destaca con binomial | 2 a 3 oraciones |
| `suelos` | **El más importante.** Ver abajo | 3 a 6 oraciones |
| `especies` | Siete, nombre común y binomial | 7 entradas |
| `cultivos` | Los que la región produce de verdad | 8 a 15 ids |

### `suelos` es el campo del que sale la aptitud

El criterio, que ya se usó en las 33 fichas de este reino y en 47 sudamericanas:
**nombrar el orden de suelo, decir cómo se comporta, decir qué implica para quien
lo trabaja.** Las tres cosas, en ese orden.

Y lo que las hizo buenas: **cruzar dos bases y decir si coinciden.** La app usa
HWSD v2 y SoilGrids. Cuando difieren, eso es información. La ficha de Java
occidental, que es el modelo a imitar, dice textualmente que el sustrato es
volcánico pero que **ninguna de las dos bases muestra dominio andosólico en la
franja baja, que es lo contrario de la premisa con la que arrancó el lote** —y da
los dos repartos, HWSD y SoilGrids, con sus porcentajes—. Eso es una ficha que se
puede auditar.

**En este reino hay además mapas nacionales muy buenos**, y nombrarlos vale:
- India: **NBSS&LUP** (National Bureau of Soil Survey and Land Use Planning).
  **Ojo con la ruta, probada el 23/10/2026:** `nbsslup.in` es un dominio
  estacionado en venta, `nbsslup.icar.gov.in` no resuelve y
  `soilhealth.dac.gov.in` devuelve 403. Lo que sí abre son los espejos:
  **Krishikosh** (`krishikosh.egranth.ac.in`), que tiene boletines del NBSS
  digitalizados.

  **Y una corrección, medida el 02/11/2026: EUDASM ya no sirve como ruta.** Este
  encargo recomendaba el archivo digital de suelos del JRC europeo
  (`esdac.jrc.ec.europa.eu/public_path/shared_folder/eudasm/asia/lists/cin.htm`,
  con las hojas estatales de Bengala Occidental, Gujarat, Haryana, Tamil Nadu y
  Punjab escaneadas) porque el 23/10/2026 devolvía 200. **Devuelve 200 y el
  cuerpo dice «Request Rejected».** Son 244 bytes: un cortafuegos del JRC que
  rechaza con código de éxito. Pasa en las cuatro rutas probadas —India,
  Bangladesh, Myanmar y el Atlas de África— y es intermitente: el dominio
  `esdac.jrc.ec.europa.eu` a secas sí contesta HTML de verdad. Si te toca
  abierto, usalo y decilo; si te toca rechazado, va a `vacias` y la ficha se
  escribe con HWSD v2 y SoilGrids. **Lo que no se puede hacer es citarlo por el
  código 200.**
- Indonesia: **BBSDLP** / Balai Besar Litbang Sumberdaya Lahan Pertanian.
- Malasia: el *Soil Map of Peninsular Malaysia* del Departamento de Agricultura.
- Tailandia: **LDD**, Land Development Department.
- Vietnam, Camboya y Laos: los perfiles de país de la FAO y los atlas del
  Mekong River Commission.
- Nepal, Bután y el Himalaya indio: **ICIMOD** publica mucho y abierto.

---

## Los modificadores de aptitud: el corazón del encargo

Usos posibles: `huerta`, `pasturas`, `forestal`, `frutales`, `reserva`. `delta`
entero **entre −35 y +25**.

**La ficha pisa sólo el uso que nombra y hereda el resto.** Proponer sólo lo que
hay que cambiar.

Lo que una propuesta necesita para montarse:

1. El **delta propuesto** y el **delta global que pisa**, los dos números.
2. La **razón con el mecanismo, no la conclusión.** «Más fértil» no sirve; «los
   vertisoles negros del Decán se agrietan en la seca y acumulan la lluvia del
   monzón en el perfil, lo que sostiene un cultivo de secano sin riego» sí.
3. La **fuente** abierta y verificada.
4. La **confianza**: `alta`, `media` o `baja`. Una propuesta con confianza baja,
   declarada, es mejor que ninguna.

### La presión de uso que documenta la fuente no es aptitud del sitio

**Agregado el 04/11/2026, después de los lotes 2 y 3.** Es el error que los dos
cometieron, y el único de los dos: cuatro de los siete modificadores que
propusieron salían de citas verdaderas sobre lo que la gente hace.

- «El fuego se prende regularmente para abrir terreno para el pastoreo», y de ahí
  `pasturas` de +10 a 0.
- «El sobrepastoreo es una presión sobre los bosques secos», y lo mismo.
- «Extracción no sostenible de productos forestales» y «el sándalo fue extraído
  selectivamente de casi todos los bosques», y de ahí `forestal` en −10 y −15.

**Las cuatro citas son reales y ninguno de los cuatro números se montó.** El
modificador mide **qué aguanta el sitio**, no qué le están haciendo. Que se
prenda fuego para abrir pastoreo es, si algo, evidencia de que el pastoreo
funciona ahí. Y bajar el puntaje por eso tiene dos costos concretos:

1. **Un `delta: 0` no es neutro: borra.** El delta de la ficha *reemplaza* al del
   bioma, así que cancelar el +10 de pasturas se lleva puesto el texto que venía
   con él —«sólo con descanso: al final de la seca el suelo queda expuesto justo
   cuando llegan las primeras lluvias fuertes»—, que era exactamente la
   advertencia que correspondía. Se pierde información, no se gana.
2. **Deja dos fichas del mismo bioma con el signo opuesto.** Con la misma clase
   de evidencia —80 % del hábitat perdido y madera de alto valor extraída en
   todas partes— el lote 1 montó `forestal` en **+15**, porque lo que la tierra
   degradada acepta es monte. Si tu propuesta y la de la ficha vecina salen al
   revés del mismo mecanismo, el signo se escribió antes del motivo.

Lo que hay que hacer con ese dato, que es bueno: **ponerlo en el texto.** Una
transición medida en el paisaje —«donde la presión de pastoreo es alta aparecen
las espinosas, y la mayor parte de estos bosques ya está degradada a matorral
espinoso»— le dice al usuario cuánto cuesta pastorear sin descanso, y lo lee en
`vegetacion` sin que mueva ningún número.

Y si al escribir la razón te sale la frase «la fuente no identifica una variable
que mida la app» —una de las dos entregas la escribió textual— eso **ya es la
respuesta**: abstenerse, que es heredar.

### Si parece un gradiente, primero decí cuál es la variable

**Corregido el 23/10/2026, después del lote 1.** La versión anterior de esta
regla decía «si es un gradiente, no se propone delta» y agregaba que eso iba a
pasar en el Decán, que va de 500 a 1.200 mm. El lote 1 hizo exactamente eso y la
regla estaba mal en la mitad que importa: **en el Decán el gradiente de lluvia no
es la variable que decide.** Lo que decide es la profundidad del perfil —230 mm
de agua útil en el vertisol profundo contra 120 en el somero—, y eso la app lo
mide: el panel de suelo calcula la reserva de agua útil y la clasifica.

Entonces la regla es ésta, en tres pasos:

1. **Nombrá la variable del gradiente**, no el gradiente. No «va de 500 a 1.200
   mm» sino «lo que cambia entre una mitad y la otra es *x*».
2. **Preguntate si acequia mide esa variable.** La app mide lluvia anual,
   estacionalidad, pendiente, orientación, textura, pH, carbono orgánico, reserva
   de agua útil del perfil, grupo hidrológico y profundidad de capa limitante.
3. Y entonces:
   - **Si la app mide la variable**, se propone delta y la razón manda a mirar
     ese campo. Un gradiente legible no es una excusa para abstenerse: es una
     instrucción que se puede escribir. Ejemplo montado: el Decán central
     mantiene el `huerta −10` del bioma y su razón dice que antes que la lluvia
     anual hay que mirar la reserva de agua útil, porque con reserva alta la
     ventana se corre al post-monzón y con reserva baja el ciclo se corta.
   - **Si la app no la mide** —una napa que nadie cartografió, una mineralogía
     que no está en SoilGrids—, ahí sí: `modificadores_propuestos: []` y la
     explicación en `notas`, con la variable nombrada.

**Y un gradiente no es lo mismo que un mosaico.** Si las dos mitades empujan para
el mismo lado por mecanismos distintos, un delta único no miente en ninguna: va
el delta y el mosaico se cuenta en el texto. Eso ya pasó en el Pilbara.

### Los modificadores globales que estos biomas heredan hoy

Para que la propuesta sepa contra qué compite:

- **Bosque húmedo tropical** (42 de las 72): `huerta −25`, `forestal +20`.
- **Bosque seco tropical** (11): `pasturas +10`, `huerta −10`.
- **Desiertos y matorral xérico** (5): `huerta −25`, `pasturas −15`,
  `reserva +15`.
- **Bosque templado de hoja ancha** (3): `frutales +10`.
- **Conífera templada** (2) y **conífera tropical** (2): `forestal +15`,
  `huerta −10`.
- **Pastizal de montaña** (1): `forestal +10`, `huerta −10`.
- **Sabana tropical** (1): `pasturas +20`, `forestal −10`.
- **Pastizal inundable** (1): `reserva +20`, `huerta −20`, `pasturas +5`.
- **Manglar** (4): `reserva +30`, `huerta −35`, `pasturas −30`,
  `frutales −35`, `forestal −25`.

---

## El orden de los lotes

**Una ficha por lote.** Si no entra, se corta con `"continua": true` y se sigue
sin repetir nada. Una ficha puede agrupar varias ecorregiones cuando describen
el mismo sistema; los ids van en `_meta.ecorregiones_resolve`.

### Bloque 1 — El cinturón seco del Decán y la India seca (16). Primero.

Es el bloque con más agricultura de secano y más población rural del reino sin
una sola ficha. Los **vertisoles negros** —el *regur* o *black cotton soil*— son
uno de los suelos agrícolas más característicos del planeta y no están descriptos
en ninguna parte de la app. La literatura es abundante: ICRISAT está justo ahí y
publica abierto, y el NBSS&LUP tiene la cartografía.

**Pero el regur no cubre las 16, y esta cabecera llevaba a error.** Verificado
el 23/10/2026, antes de mandar el lote 2: el **297** está en el oeste de Odisha
y en Chhattisgarh, en la cuenca media del Mahanadi, a sombra de lluvia de los
Ghats orientales, **fuera de la traza basáltica del Decán**. El suelo de cada
ecorregión de este bloque se averigua, no se hereda del encabezado.

- 290 — Central Deccan Plateau dry deciduous forests
- 297 — North Deccan dry deciduous forests
- 298 — South Deccan Plateau dry deciduous forests
- 293 — East Deccan dry-evergreen forests
- 228 — East Deccan moist deciduous forests
- 295 — Khathiar-Gir dry deciduous forests
- 296 — Narmada Valley dry deciduous forests
- 292 — Chhota-Nagpur dry deciduous forests
- 261 — Orissa semi-evergreen forests
- 315 — Deccan thorn scrub forests
- 314 — Aravalli west thorn scrub forests
- 318 — Thar desert *(el desierto más densamente poblado del mundo: el `−15` de
  pasturas merece revisión, hay pastoreo de camello, cabra y oveja documentado)*
- 317 — Indus Valley desert
- 312 — Rann of Kutch seasonal salt marsh
- 316 — Godavari-Krishna mangroves
- 323 — Sundarbans mangroves

### Bloque 2 — Indochina (18)

Camboya, Laos, Vietnam, Tailandia y Myanmar. Arroz de secano y de inundación,
agricultura de ladera, y el único bloque del reino con cuatro ecorregiones de
bosque seco siempreverde, que es una formación rara y poco descripta.

- 291 — Central Indochina dry forests
- 299 — Southeast Indochina dry evergreen forests
- 294 — Irrawaddy dry forests
- 257 — Northern Khorat Plateau moist deciduous forests
- 258 — Northern Thailand-Laos moist deciduous forests
- 256 — Northern Indochina subtropical forests
- 239 — Luang Prabang montane rain forests
- 255 — Northern Annamites rain forests
- 272 — Southern Annamites montane rain forests
- 260 — Northern Vietnam lowland rain forests
- 300 — Southern Vietnam lowland dry forests
- 223 — Cardamom Mountains rain forests
- 237 — Kayah-Karen montane rain forests
- 284 — Tenasserim-South Thailand semi-evergreen rain forests
- 250 — Myanmar coastal rain forests
- 286 — Tonle Sap-Mekong peat swamp forests
- 319 — Indochina mangroves
- 321 — Myanmar Coast mangroves

### Bloque 3 — Borneo, la península malaya y Sumatra (10)

Acá está la turba tropical, que es el caso donde la app ya tiene una regla fuerte
y conviene que la ficha la respalde: **la turba no se drena**, y hay una nota en
el código que advierte que 20 % de carbono no es 20 % de materia orgánica. Cuatro
de estas diez son *peat swamp forests*.

- 219 — Borneo lowland rain forests
- 220 — Borneo montane rain forests
- 221 — Borneo peat swamp forests
- 281 — Sundaland heath forests *(los *kerangas*: arena blanca, extremadamente
  pobre, un caso de suelo que define todo)*
- 265 — Peninsular Malaysian rain forests
- 263 — Peninsular Malaysian montane rain forests
- 264 — Peninsular Malaysian peat swamp forests
- 280 — Sumatran peat swamp forests
- 322 — Sunda Shelf mangroves
- 262 — Palawan rain forests

### Bloque 4 — El Himalaya y el noreste de la India (12)

Pisos altitudinales, agricultura en terraza y la zona donde la app ya calcula
horas de frío y fotoperiodo, así que una ficha de acá cae sobre un calendario que
sabe hablarle. ICIMOD publica abierto y es la fuente natural.

- 233 — Himalayan subtropical broadleaf forests
- 302 — Himalayan subtropical pine forests
- 306 — Eastern Himalayan broadleaf forests
- 308 — Western Himalayan broadleaf forests
- 309 — Eastern Himalayan subalpine conifer forests
- 310 — Western Himalayan subalpine conifer forests
- 311 — Terai-Duar savanna and grasslands
- 244 — Meghalaya subtropical forests
- 249 — Mizoram-Manipur-Kachin rain forests
- 226 — Chin Hills-Arakan Yoma montane forests
- 304 — Northeast India-Myanmar pine forests
- 307 — Northern Triangle temperate forests
- 259 — Northern Triangle subtropical forests

### Bloque 5 — El sur de China, Taiwán y las islas (16)

Último. El sur subtropical de China es agricultura intensiva milenaria; las
islas son chicas pero algunas tienen casos propios.

- 236 — Jian Nan subtropical evergreen forests
- 268 — South China-Vietnam subtropical evergreen forests
- 232 — Hainan Island monsoon rain forests
- 283 — Taiwan subtropical evergreen forests
- 269 — South Taiwan monsoon rain forests
- 251 — Nansei Islands subtropical evergreen forests
- 242 — Malabar Coast moist forests
- 245 — Mentawai Islands rain forests
- 276 — Sulu Archipelago rain forests
- 218 — Andaman Islands rain forests
- 252 — Nicobar Islands rain forests
- 313 — Kinabalu montane alpine meadows
- 243 — Maldives-Lakshadweep-Chagos Archipelago tropical moist forests
- 227 — Christmas and Cocos Islands tropical forests
- 267 — South China Sea Islands
- 266 — *(ya cubierta: `pantanos_rio_rojo`. No tocar.)*

De estas, **267 South China Sea Islands** son arrecifes sin uso agrícola: va a
`vacias` con el motivo. Igual **227 Christmas y Cocos** si no sale fácil.

---

## La forma del JSON

**El ejemplo de abajo es una forma, no una respuesta.** Los nombres, los ids y
los números que trae son de relleno: no son los del lote que viene y no hay que
confirmarlos. Esto se escribe porque ya pasó dos veces —el lote 1 de Indomalaya
y el lote 1 de África— que la entrega devolvió el ejemplo completado en vez de
investigado. **Y los ids de cultivo del ejemplo no son válidos por ser del
ejemplo: los válidos son los de `ANEXO_IDS_CULTIVOS.md` y nada más.**

**El ejemplo de abajo es una forma, no una respuesta.** Lo que esta entre
`<`angulos`>` se reemplaza; nada de ahi es la contestacion de ningun lote. Esta
advertencia esta escrita porque ya costo dos veces: el ejemplo de la fase 5 traia
el modificador resuelto —`pasturas`, `delta 20`, «confirmado», confianza alta— y
la entrega devolvio eso con las descripciones investigadas alrededor. **El
ejemplo es la instruccion mas fuerte del documento**, mas que las reglas
numeradas.

```json
{
  "encargo": "fichas-indomalaya",
  "lote": 1,
  "fecha": "2026-10-23",
  "continua": false,
  "entradas": [
    {
      "id": "<id_en_minúsculas_con_guion_bajo>",
      "nombre": "<el nombre en castellano>",
      "emoji": "<uno>",
      "color": "#RRGGBB",
      "resumen": "…",
      "vegetacion": "…",
      "fauna": "…",
      "suelos": "…",
      "saberes": [],
      "especies": [
        { "nombre": "<nombre común>", "cientifico": "<Binomial>", "tipo": "nativa", "nota": "…" }
      ],
      "cultivos": ["<ids del anexo, 8 a 15>"],
      "fuentes": [{ "label": "Título tal como lo muestra la página", "url": "https://…" }],
      "verificacion": "Qué dicen esas páginas, con sus palabras, sobre este lugar.",
      "_meta": {
        "ecorregiones_resolve": [<ECO_ID>],
        "nombre_resolve": "<el nombre de RESOLVE, en inglés>",
        "paises": ["<país>"],
        "confianza": "<alta | media | baja>",
        "base_de_suelos_usada": "<las bases que de verdad abrieron, y cuál no>",
        "notas": "…",
        "modificadores_propuestos": [
          {
            "uso": "<huerta | pasturas | frutales | forestal | reserva>",
            "delta": <entero entre -35 y 25>,
            "pisa_global": <el delta global de ese uso, tal como lo hereda hoy>,
            "razon": "El mecanismo, no la conclusión.",
            "confianza": "<alta | media | baja>",
            "fuente": "https://…"
          }
        ]
      }
    }
  ],
  "vacias": [
    { "id": "<id o ECO_ID>", "motivo": "Qué se buscó, dónde, y por qué no alcanzó." }
  ]
}
```

---

## Las reglas, en corto

1. **Ninguna URL entra sin abrirse.** Si no abre, va a `vacias`.
2. **El `label` se copia del título que muestra la página**, no se redacta. Si lo
   que muestra es el título interno del archivo —«DjVu Document» pasó— poné el
   título real del documento: la etiqueta la lee un usuario.
3. **Nada de DOI de memoria.**
4. **`saberes` siempre vacío.**
5. **Nativa y cultivo son dos cosas distintas** — y en este reino la mitad de los
   cultivos del mundo son nativos.
6. **Siete especies con binomial, y las siete son plantas.** `especies` es flora
   nativa por contrato del código. El tigre, el elefante y el gaur van en
   `fauna`, donde además ya estaban: en los lotes 2 y 3 aparecieron en las dos
   listas y hubo que sacarlos de una.
7. **El modificador lleva el mecanismo, la fuente y la confianza.**
8. **Si parece un gradiente, nombrá la variable y fijate si la app la mide.**
   Abstenerse sólo si no la mide. (Esta regla decía lo contrario hasta el
   23/10/2026 y así quedó escrita arriba, en su propia sección.)
9. **Confirmar el modificador global vale igual que corregirlo.**
10. **La presión de uso no es aptitud.** Si el argumento del delta es lo que la
    gente le hace al lugar y no lo que el lugar aguanta, el dato va al texto y el
    modificador no se propone. Ver su sección arriba.
11. **En `fuentes` va sólo lo que se usó.** Si declarás que no procesaste HWSD ni
    SoilGrids, sus páginas no van en la lista. Una fuente que no sostiene ninguna
    frase de la ficha se saca, y un 200 cuyo cuerpo dice «Request Rejected» no es
    una fuente abierta.
12. **La fuente de los cultivos tiene que abrir con acceso automático común.**
    Los lotes 2 y 3 trajeron ids válidos —eso ya salió bien— pero sus dos fuentes
    de cultivos, un PDF de `agri.odisha.gov.in` y un plan distrital de
    `agritech.tnau.ac.in`, **no resuelven desde la máquina donde se monta**, así
    que las dos fichas entraron sin lista de cultivos y caen al catálogo por
    clase Köppen, que es más grueso. Si la única fuente de cultivos que
    encontrás no abre pelada, decilo en `notas` y dejá `cultivos` afuera: es la
    misma regla 1, aplicada al campo donde más duele.
13. **Si este encargo afirma un hecho del territorio sin citar de dónde sale,
    verificalo.** Ya pasó cuatro veces y las cuatro te hizo trabajar en falso: la
    regla del gradiente del lote 1, los estados del 297 en el lote 2 —el encargo
    decía «oeste de Odisha y Chhattisgarh» y son tres, con Jharkhand—, EUDASM
    como ruta viva, y en otro encargo una «columna de año favorable» del NRCS que
    las fichas no publican con ese nombre. **Un hecho afirmado por el encargo sin
    fuente es una instrucción disfrazada de dato.** Si lo verificás y no coincide,
    eso es el hallazgo del lote y se escribe en `verificacion`.
14. **Mejor una ficha que aguanta que tres con una floja.**
15. Una ficha por lote. Un bloque JSON. Sin prosa antes ni después.
