# Fase 5 — Fichas ecológicas: África tropical y austral, 109 en cero

*Pegar primero `GPT_LOCAL_REGLAS.md` y después esto. Entregas en
`C:\Arte y Tierra\encargos-gpt\entregas\fichas-africa\NN.json` — carpeta nueva,
el primer lote es el **01**.*

---

## Dónde quedó este reino, medido

La app clasifica el punto del predio en una de las **846 ecorregiones de
RESOLVE** y le muestra una ficha: vegetación, fauna, suelos, especies y
**modificadores de aptitud** que suben o bajan el puntaje de cada uso del
terreno. Sin ficha, el punto recibe el modificador del **bioma global** y nada
más.

**El reino afrotropical tiene 116 ecorregiones. 7 tienen ficha. 109 no.** Es el
hueco más grande del planeta después de Australasia, y el norte de África y el
Magreb ya están cerrados por otro paquete, así que lo que falta es África
**tropical y austral**.

### Por qué este reino va último de los tres de fichas, y por qué va igual

Hay que decirlo con honestidad porque cambia qué se espera de la fase: **en
África el modificador global probablemente acierte.** La sabana africana *es* el
arquetipo del bioma de sabana tropical, así que el `pasturas +20` está escrito
sobre ella. El bosque húmedo del Congo *es* el caso del que salió el
`huerta −25`: la fertilidad está en la biomasa viva, el suelo lixiviado se lava
en pocas temporadas.

Entonces esta fase no corrige un error: **agrega profundidad**. Y eso vale, por
tres razones concretas:

1. **Las 31 ecorregiones de sabana son el bloque de ganadería extensiva más
   grande del mundo**, con literatura de producción forrajera y de carga animal
   que no existe para ningún otro bioma con esta densidad. Una ficha que nombra
   el *miombo*, el *mopane* y el *bushveld* con su carga publicada es lo único
   que hace útil el `+20`.
2. **Hay suelos que el bioma global no puede expresar.** El *fynbos* sudafricano
   crece sobre arenas derivadas de cuarcita, extremadamente pobres en fósforo, y
   hereda los modificadores del bioma mediterráneo, que están escritos sobre el
   olivo y la vid. El *Karoo* suculento es un desierto de lluvia invernal, que es
   la excepción del bioma de desiertos. Madagascar es un reino biogeográfico
   aparte metido adentro de este.
3. **Es donde la app tiene más usuarios potenciales sin ficha**, por población
   rural y por superficie bajo agricultura de secano.

---

## Qué es una ficha, y qué no

**Describe la ecorregión, no el predio.**

**`saberes` va siempre vacío.** Los saberes territoriales son otra capa, con otro
contrato y otras cautelas. No los metas acá aunque la fuente los nombre. Y en
este reino eso importa el doble: hay muchísimo saber pastoril documentado y
atribuirlo a escala de ecorregión sería inventar.

**Nativa y cultivo son dos cosas distintas.** Ojo acá: el sorgo, el mijo perla,
el café arábica, el teff, el ñame, la palma de aceite, el caupí y la sandía son
**nativos de este reino**. Si es nativo de la ecorregión va como nativa, y que
además se cultive se cuenta en el texto.

---

## Los seis campos

| Campo | Qué va | Largo |
|---|---|---|
| `resumen` | Dónde queda, qué tamaño, qué lo define, cuánto queda del hábitat original | 2 a 4 oraciones |
| `vegetacion` | Las formaciones con géneros y especies nombradas, el rango de lluvia y los meses secos | 3 a 5 oraciones |
| `fauna` | Cuántos mamíferos y aves, y las que la fuente destaca con binomial | 2 a 3 oraciones |
| `suelos` | **El más importante.** Ver abajo | 3 a 6 oraciones |
| `especies` | Siete, nombre común y binomial | 7 entradas |
| `cultivos` | Los que la región produce de verdad | 8 a 15 ids |

### `suelos` es el campo del que sale la aptitud

El criterio: **nombrar el orden de suelo, decir cómo se comporta, decir qué
implica para quien lo trabaja.** Las tres cosas, en ese orden. Y **cruzar dos
bases y decir si coinciden**: la app usa HWSD v2 y SoilGrids, y cuando difieren
eso es información, no un problema.

**Mapas y fuentes nacionales de este reino que vale nombrar:**
- **Sudáfrica**: el *Land Type Survey* y la clasificación sudafricana de suelos;
  el ARC (Agricultural Research Council) publica abierto.
- **Etiopía**: el *Ethiopian Soil Information System* (EthioSIS) y el atlas de
  ATA.
- **Kenia, Tanzania, Uganda**: los perfiles de KALRO, TARI y NARO, y el *Soil
  Atlas of Africa* de la Comisión Europea (JRC), que es la fuente regional
  abierta más completa y cubre todo el reino.
- **África occidental**: los perfiles de país de la FAO y AfricaSoils / AfSIS,
  que publica mapas a 250 m con documentación.
- **Zambia, Zimbabue, Malaui, Mozambique**: la literatura del *miombo* es
  abundante y mucha está en CIFOR, que publica abierto.
- **Madagascar**: los lateríticos *tany mena* tienen literatura propia; FOFIFA
  es el instituto nacional.

El *Soil Atlas of Africa* del JRC conviene tenerlo como respaldo de arranque
para todas: es una sola fuente abierta que cubre el reino entero y nombra los
órdenes por región.

---

## Los modificadores de aptitud

Usos: `huerta`, `pasturas`, `forestal`, `frutales`, `reserva`. `delta` entero
**entre −35 y +25**. La ficha pisa sólo el uso que nombra y hereda el resto.

Una propuesta necesita: el **delta propuesto** y el **global que pisa**; la
**razón con el mecanismo y no la conclusión**; la **fuente** abierta; y la
**confianza** (`alta`, `media`, `baja`).

**Y acá, más que en los otros dos reinos, hace falta la otra respuesta: el
modificador confirmado.** Si la ficha del *miombo* seco dice «el `+20` del bioma
es correcto, y acá está la carga publicada que lo sostiene», eso es un resultado
de pleno valor: convierte un delta heredado en un delta respaldado. **Confirmar
vale igual que corregir.** No hay que forzar una corrección donde no la hay.

**Si es un gradiente, no se propone delta.** La sabana sudaniana va de 400 a
1.200 mm de norte a sur; el Sahel es una franja de transición por definición. En
esos casos: `modificadores_propuestos: []` y la explicación en `notas`.

### Los modificadores globales que estos biomas heredan hoy

- **Sabana tropical** (31): `pasturas +20`, `forestal −10`.
- **Bosque húmedo tropical** (30): `huerta −25`, `forestal +20`.
- **Desiertos y matorral xérico** (16): `huerta −25`, `pasturas −15`,
  `reserva +15`.
- **Pastizal de montaña** (11): `forestal +10`, `huerta −10`.
- **Pastizal inundable** (8): `reserva +20`, `huerta −20`, `pasturas +5`.
- **Manglar** (5): `reserva +30`, `huerta −35`, `pasturas −30`, `frutales −35`,
  `forestal −25`.
- **Bosque seco tropical** (3): `pasturas +10`, `huerta −10`.
- **Mediterráneo** (3): `frutales +15`, `huerta −10`.
- **Pastizal templado** (2): `pasturas +20`, `huerta +10`, `forestal −10`.

---

## El orden de los lotes

**Una ficha por lote.** Si no entra, se corta con `"continua": true` y se sigue
sin repetir nada. Una ficha puede agrupar varias ecorregiones del mismo sistema;
los ids van en `_meta.ecorregiones_resolve`.

### Bloque 1 — Las sabanas y los bosques de miombo y mopane (31). Primero.

El bloque de ganadería extensiva más grande del planeta, y donde la literatura de
carga animal y producción forrajera es más abundante. Agrupar generosamente acá:
el miombo húmedo, el miombo seco y el mopane son tres sistemas distintos y las
subdivisiones de RESOLVE dentro de cada uno se parecen mucho.

- 39 — Central Zambezian wet miombo woodlands
- 36 — Angolan wet miombo woodlands
- 42 — Dry miombo woodlands
- 65 — Zambezian mopane woodlands
- 34 — Angolan mopane woodlands
- 66 — Zambezian-Limpopo mixed woodlands
- 64 — Zambezian Baikiaea woodlands
- 38 — Central bushveld
- 48 — Limpopo lowveld
- 47 — Kalahari Acacia woodlands
- 40 — Drakensberg Escarpment savanna and thicket
- 41 — Drakensberg grasslands
- 53 — Sahelian Acacia savanna *(la franja del Sahel: gradiente, cuidado)*
- 43 — East Sudanian savanna
- 62 — West Sudanian savanna
- 44 — Guinean forest-savanna
- 52 — Northern Congolian Forest-Savanna
- 58 — Southern Congolian forest-savanna
- 63 — Western Congolian forest-savanna
- 61 — Victoria Basin forest-savanna
- 51 — Northern Acacia-Commiphora bushlands and thickets
- 57 — Southern Acacia-Commiphora bushlands and thickets
- 55 — Somali Acacia-Commiphora bushlands and thickets
- 54 — Serengeti volcanic grasslands *(suelo volcánico sobre un pastizal de
  altísima carga: un caso propio)*
- 50 — Masai xeric grasslands and shrublands
- 45 — Horn of Africa xeric bushlands
- 35 — Angolan scarp savanna and woodlands
- 49 — Mandara Plateau woodlands
- 46 — Itigi-Sumbu thicket
- 37 — Ascension scrub and grasslands *(isla minúscula: a `vacias` si no sale
  fácil)*
- 60 — St. Helena scrub and woodlands *(ídem)*

### Bloque 2 — El Congo y los bosques húmedos de África occidental (30)

Acá el `huerta −25` está bien y el aporte es la profundidad: especies, suelos y
qué sistema agrícola banca el lugar. Las *swamp forests* del Congo son turba
tropical —la turbera tropical más grande del mundo se descubrió acá en 2017— y la
app tiene una regla fuerte al respecto: **la turba no se drena.** Vale que la
ficha la respalde.

- 3 — Central Congolian lowland forests
- 24 — Northeast Congolian lowland forests
- 26 — Northwest Congolian lowland forests
- 29 — Western Congolian swamp forests
- 10 — Eastern Congolian swamp forests *(las dos *swamp*: la turbera de la
  Cuvette Centrale)*
- 5 — Congolian coastal forests
- 1 — Albertine Rift montane forests
- 8 — East African montane forests
- 9 — Eastern Arc forests
- 12 — Ethiopian montane forests
- 2 — Cameroon Highlands forests
- 21 — Mount Cameroon and Bioko montane forests
- 7 — Cross-Sanaga-Bioko coastal forests
- 6 — Cross-Niger transition forests
- 23 — Nigerian lowland forests
- 22 — Niger Delta swamp forests
- 11 — Eastern Guinean forests
- 30 — Western Guinean lowland forests
- 14 — Guinean montane forests
- 25 — Northern Swahili coastal forests
- 28 — Southern Swahili coastal forests and woodlands
- 16 — Kwazulu Natal-Cape coastal forests
- 19 — Maputaland coastal forests and woodlands
- 15 — Knysna-Amatole montane forests
- 17 — Madagascar humid forests
- 18 — Madagascar subhumid forests
- 4 — Comoros forests
- 20 — Mascarene forests
- 13 — Granitic Seychelles forests
- 27 — São Tomé, Príncipe, and Annobón forests

### Bloque 3 — El Karoo, el Namib y los desiertos del suroeste (16)

Acá hay dos cosas que el bioma global no puede decir. Una: el **Karoo suculento**
es un desierto de **lluvia invernal**, al revés que el arquetipo, y eso cambia
toda la estacionalidad del cálculo. Dos: el Karoo y el Kalahari tienen ganadería
ovina y caprina extensiva con literatura de carga, así que el `pasturas −15`
merece revisión igual que en Australia.

- 110 — Succulent Karoo xeric shrublands *(el de lluvia invernal: el más
  importante del bloque)*
- 101 — Nama Karoo shrublands
- 94 — Gariep Karoo
- 102 — Namaqualand-Richtersveld steppe
- 97 — Kalahari xeric savanna
- 104 — Namibian savanna woodlands
- 103 — Namib Desert *(desierto de niebla: la niebla es la fuente de agua, y eso
  es un mecanismo que la app no tiene en ningún lado)*
- 98 — Kaokoveld desert
- 99 — Madagascar spiny thickets
- 100 — Madagascar succulent woodlands
- 106 — Somali montane xeric woodlands
- 95 — Hobyo grasslands and shrublands
- 92 — Djibouti xeric shrublands
- 93 — Eritrean coastal desert
- 91 — Aldabra Island xeric scrub *(a `vacias` si no sale)*
- 96 — Ile Europa and Bassas da India xeric scrub *(ídem)*

### Bloque 4 — Los pastizales de montaña y los pastizales inundables (19)

Dos bloques juntos porque son los dos sistemas de pastoreo estacional del reino:
se sube al pastizal de montaña en una estación y se baja al bajo inundable en la
otra. Es la trashumancia africana y está documentada.

- 79 — Ethiopian montane grasslands and woodlands *(el *teff* y la cebada de
  altura: agricultura de secano a 2.500 m)*
- 80 — Ethiopian montane moorlands
- 81 — Highveld grasslands *(el granero de Sudáfrica: maíz de secano)*
- 78 — East African montane moorlands
- 86 — Rwenzori-Virunga montane moorlands
- 87 — Southern Rift Montane forest-grassland
- 85 — Nyanga-Chimanimani Montane forest-grassland
- 84 — Mulanje Montane forest-grassland
- 77 — Angolan montane forest-grassland
- 82 — Jos Plateau forest-grassland
- 83 — Madagascar ericoid thickets
- 74 — Sudd flooded grasslands *(el humedal más grande de África: pastoreo
  estacional nilótico)*
- 71 — Inner Niger Delta flooded savanna *(el *bourgou*, con pastoreo
  trashumante documentado y arroz flotante)*
- 76 — Zambezian flooded grasslands
- 75 — Zambezian coastal flooded savanna
- 72 — Lake Chad flooded savanna
- 69 — East African halophytics
- 70 — Etosha Pan halophytics
- 73 — Makgadikgadi halophytics

### Bloque 5 — El fynbos, los bosques secos y los manglares (13)

- 89 — Fynbos shrubland *(arenas de cuarcita pobrísimas en fósforo, bajo
  modificadores mediterráneos escritos sobre el olivo: el contraste más grande
  del reino entre bioma heredado y realidad del suelo)*
- 90 — Renosterveld shrubland
- 88 — Albany thickets
- 32 — Madagascar dry deciduous forests
- 33 — Zambezian evergreen dry forests
- 31 — Cape Verde Islands dry forests
- 113 — Guinean mangroves
- 111 — Central African mangroves
- 112 — East African mangroves
- 114 — Madagascar mangroves
- 116 — Southern Africa mangroves
- 67 — Amsterdam-Saint Paul Islands temperate grasslands *(a `vacias`: islas
  subantárticas sin uso agrícola)*
- 68 — Tristan Da Cunha-Gough Islands shrub and grasslands *(ídem)*

---

## La forma del JSON

```json
{
  "encargo": "fichas-africa",
  "lote": 1,
  "fecha": "2026-10-23",
  "continua": false,
  "entradas": [
    {
      "id": "miombo_humedo_zambeziano",
      "nombre": "Bosques de miombo húmedo zambeziano",
      "emoji": "🌳",
      "color": "#689F38",
      "resumen": "…",
      "vegetacion": "…",
      "fauna": "…",
      "suelos": "…",
      "saberes": [],
      "especies": [
        { "nombre": "Miombo", "cientifico": "Brachystegia spiciformis", "tipo": "nativa", "nota": "…" }
      ],
      "cultivos": ["maiz", "sorgo", "mijo_perla", "mandioca", "caupi", "…"],
      "fuentes": [{ "label": "Título tal como lo muestra la página", "url": "https://…" }],
      "verificacion": "Qué dicen esas páginas, con sus palabras, sobre este lugar.",
      "_meta": {
        "ecorregiones_resolve": [39, 36],
        "nombre_resolve": "Central Zambezian wet miombo woodlands; Angolan wet miombo woodlands",
        "paises": ["Zambia", "Angola", "Tanzania", "República Democrática del Congo"],
        "confianza": "alta",
        "base_de_suelos_usada": "Soil Atlas of Africa (JRC) + HWSD v2 + SoilGrids",
        "notas": "…",
        "modificadores_propuestos": [
          {
            "uso": "pasturas",
            "delta": 20,
            "pisa_global": 20,
            "razon": "Confirmado, con el mecanismo y la carga publicada que lo sostiene.",
            "confianza": "alta",
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

Cuando el delta propuesto es igual al global, eso **no** es una entrada vacía: es
un modificador confirmado y se monta como tal. Poner `delta` igual a
`pisa_global` y decir en `razon` por qué se confirma.

---

## Las reglas, en corto

1. **Ninguna URL entra sin abrirse.** Si no abre, va a `vacias`.
2. **El `label` se copia del título que muestra la página.**
3. **Nada de DOI de memoria.**
4. **`saberes` siempre vacío** — y en este reino con más razón que en ninguno.
5. **Nativa y cultivo son dos cosas distintas**: el sorgo, el mijo, el café y el
   ñame son nativos de acá.
6. **Siete especies con binomial.**
7. **El modificador lleva el mecanismo, la fuente y la confianza.**
8. **Confirmar el modificador global es un resultado de pleno valor.** No forzar
   una corrección donde no la hay.
9. **Si es un gradiente, no se propone delta.**
10. **Mejor una ficha que aguanta que tres con una floja.**
11. Una ficha por lote. Un bloque JSON. Sin prosa antes ni después.
