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
- India: **NBSS&LUP** (National Bureau of Soil Survey and Land Use Planning) y
  el *Soil Health Card* por distrito.
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

**Y si es un gradiente, no se propone delta.** Hay ecorregiones donde una mitad
es apta y la otra no —típicamente un gradiente de lluvia o de napa— y un
modificador único mentiría en una de las dos. Ya se decidió que esos casos se
arreglan con texto: `modificadores_propuestos: []` y la explicación en `notas`.
En este reino va a pasar en el Decán, que va de 500 a 1.200 mm.

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

```json
{
  "encargo": "fichas-indomalaya",
  "lote": 1,
  "fecha": "2026-10-23",
  "continua": false,
  "entradas": [
    {
      "id": "decan_vertisoles_secos",
      "nombre": "Bosques secos deciduos de la meseta del Decán",
      "emoji": "🌾",
      "color": "#8D6E63",
      "resumen": "…",
      "vegetacion": "…",
      "fauna": "…",
      "suelos": "…",
      "saberes": [],
      "especies": [
        { "nombre": "Teca", "cientifico": "Tectona grandis", "tipo": "nativa", "nota": "…" }
      ],
      "cultivos": ["sorgo", "mijo_perla", "garbanzo", "algodon", "…"],
      "fuentes": [{ "label": "Título tal como lo muestra la página", "url": "https://…" }],
      "verificacion": "Qué dicen esas páginas, con sus palabras, sobre este lugar.",
      "_meta": {
        "ecorregiones_resolve": [290, 297, 298],
        "nombre_resolve": "Central Deccan Plateau dry deciduous forests; …",
        "paises": ["India"],
        "confianza": "alta",
        "base_de_suelos_usada": "NBSS&LUP + HWSD v2 + SoilGrids",
        "notas": "…",
        "modificadores_propuestos": [
          {
            "uso": "huerta",
            "delta": 0,
            "pisa_global": -10,
            "razon": "El mecanismo, no la conclusión.",
            "confianza": "media",
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
2. **El `label` se copia del título que muestra la página**, no se redacta.
3. **Nada de DOI de memoria.**
4. **`saberes` siempre vacío.**
5. **Nativa y cultivo son dos cosas distintas** — y en este reino la mitad de los
   cultivos del mundo son nativos.
6. **Siete especies con binomial.**
7. **El modificador lleva el mecanismo, la fuente y la confianza.**
8. **Si es un gradiente, no se propone delta.**
9. **Confirmar el modificador global vale igual que corregirlo.**
10. **Mejor una ficha que aguanta que tres con una floja.**
11. Una ficha por lote. Un bloque JSON. Sin prosa antes ni después.
