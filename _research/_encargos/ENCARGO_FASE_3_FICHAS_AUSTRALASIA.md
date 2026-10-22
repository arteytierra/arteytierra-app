# Fase 3 — Fichas ecológicas: Australasia y Oceanía, 101 en cero

*Pegar primero `GPT_LOCAL_REGLAS.md` y después esto. Entregas en
`C:\Arte y Tierra\encargos-gpt\entregas\fichas-australasia\NN.json` — carpeta
nueva, el primer lote es el **01**.*

---

## Por qué este reino va antes que los otros dos

La app clasifica el punto del predio en una de las **846 ecorregiones de
RESOLVE** y le muestra una ficha ecológica: vegetación, fauna, suelos, especies
y, lo que más pesa, **modificadores de aptitud** que suben o bajan el puntaje de
cada uso del terreno —huerta, pasturas, forestal, frutales, reserva—.

Medido hoy: **429 ecorregiones tienen ficha. 417 no.** Las que no tienen reciben
el modificador del **bioma global** y nada más.

Y ahí está el problema de este reino en particular. **Australasia tiene 83
ecorregiones y cero fichas. Oceanía, 24 y seis.** De esas 83, diez son desiertos
y matorrales xéricos australianos, que heredan del bioma global de desiertos:

> `pasturas −15` · *«La carga que aguanta es baja y el error se paga con
> desertificación, no con menos kilos.»*

Esa razón está escrita sobre el desierto como arquetipo. Y los *rangelands*
áridos de Australia son **una de las ganaderías extensivas más grandes del
mundo**: Pilbara, Mulga, Mitchell Grass Downs, Carnarvon. No son un desierto sin
ganado al que hay que desalentar: son un sistema pastoril con un siglo de manejo
documentado, estaciones de cientos de miles de hectáreas y literatura técnica
propia. El modificador no está matizado por ninguna ficha, y no se arregla
bajando el delta global —porque en el Sahara y en el Namib está bien—: se arregla
con fichas regionales.

Es el mismo error que ya se corrigió cuatro veces en otros lugares —la badia
siria, la meseta de Anatolia, la pradera de pastos cortos y las High Plains— y
acá no hay ficha que lo pise.

Después vienen las otras dos cosas de este reino, por orden: las **sabanas
tropicales del norte de Australia** (9 ecorregiones), que heredan `pasturas +20`
y donde ese valor probablemente esté bien pero falta la profundidad; los
**mallee y bosques mediterráneos del suroeste** (10), que son una región
agrícola real con un suelo muy particular; y los bosques templados de **Nueva
Zelanda y Tasmania** (14), donde la ganadería de pastoreo es la actividad
principal del país.

---

## Qué es una ficha, y qué no

**Una ficha describe la ecorregión, no el predio.** Se escribe para que alguien
que cae ahí entienda en qué sistema está metido: qué crece, sobre qué suelo, con
qué agua, y qué usos el lugar banca o castiga.

**No lleva saberes.** El campo `saberes` va **siempre vacío**: los saberes
territoriales son otra capa, con otro contrato y otras cautelas. No los metas
acá, aunque la fuente los nombre.

**Nativa y cultivo son dos cosas distintas** y no se mezclan. Si una especie es
nativa de la ecorregión va como nativa, y que además se cultive se cuenta en el
texto. Ojo en este reino: la macadamia es nativa de Queensland, el *Eucalyptus*
es nativo de todo el continente, el kumara llegó con los maoríes y no es nativo
de Nueva Zelanda.

---

## Los seis campos de texto, y qué se espera de cada uno

| Campo | Qué va | Largo que se busca |
|---|---|---|
| `resumen` | Dónde queda, qué tamaño tiene, qué lo define y cuánto queda del hábitat original | 2 a 4 oraciones |
| `vegetacion` | Las formaciones, con géneros y especies nombradas, el rango de lluvia y los meses secos | 3 a 5 oraciones |
| `fauna` | Cuántos mamíferos y aves, y las especies que la fuente destaca con su binomial | 2 a 3 oraciones |
| `suelos` | **El más importante.** Ver abajo | 3 a 6 oraciones |
| `especies` | Siete, con nombre común y binomial | 7 entradas |
| `cultivos` | Los que la región produce de verdad, en ids | 8 a 15 ids |

### El campo `suelos` es el que más pesa, y por qué

De ahí sale el razonamiento de la aptitud. Una ficha que dice dos líneas de
suelo no puede sostener una corrección de modificador, y una corrección sin
razón escrita no se monta.

El criterio, que ya se usó en 47 fichas sudamericanas y en las diez de Canadá:
**nombrar el orden de suelo, decir cómo se comporta y decir qué implica para
quien lo trabaja.** Las tres cosas, en ese orden.

Y lo que convirtió las fichas buenas en fichas buenas: **cruzar dos bases y
decir si coinciden.** La app ya usa HWSD v2 y SoilGrids. Cuando las dos dan
cosas distintas, eso es información, no un problema: una ficha que dice «HWSD da
Acrisols 24 % y SoilGrids da Ferralsols 31 %, así que la limitación de fertilidad
es menor de lo que el bioma supone» vale mucho más que una que afirma un orden
sin respaldo.

Si no se puede acceder a esas bases, **la ficha se escribe con el mapa de suelos
nacional**, que en este reino existe y es bueno: Australia tiene el *Australian
Soil Classification* y el *Soil and Landscape Grid of Australia*; Nueva Zelanda
tiene *S-map* y el *New Zealand Soil Classification* de Landcare Research. Nombrar
cuál se usó.

---

## Los modificadores de aptitud: el corazón del encargo

Cada ficha puede proponer **modificadores que pisan al bioma global**. Son lo
más valioso que trae una ficha y lo más delicado.

Los usos posibles son cinco: `huerta`, `pasturas`, `forestal`, `frutales`,
`reserva`. El `delta` es un entero **entre −35 y +25**.

**La regla de composición:** la ficha pisa **sólo el uso que nombra** y hereda el
resto. Entonces una ficha que corrige `pasturas` no toca `huerta`: no hace falta
repetir los que están bien. **Proponer sólo lo que hay que cambiar.**

**Qué tiene que tener una propuesta para poder montarse:**

1. El **delta propuesto** y el **delta global que pisa**, los dos números.
2. La **razón, en una o dos oraciones**, que diga el *mecanismo* y no la
   conclusión. «Suelo más fértil» no sirve; «los suelos rojos de la llanura de
   Mitchell son arcillas pesadas autoacolchonantes que retienen la lluvia de
   monzón y sostienen una carga publicada de X, que es un orden más que el
   desierto arquetípico» sí.
3. La **fuente** que respalda el mecanismo, abierta y verificada.
4. La **confianza**: `alta`, `media` o `baja`. Una propuesta con confianza baja
   se monta igual, declarada, y es mejor que ninguna.

**Y la trampa que hay que declarar cuando aparece.** Hay fichas donde una mitad
de la ecorregión es apta y la otra no —típicamente un gradiente de lluvia o de
napa—. Ahí un modificador único **miente en una de las dos mitades**. Para esos
casos ya se decidió que el arreglo es de texto y no de delta: **decir que es un
gradiente, no proponer un número**. Pasó con la pradera mixta norteamericana y
con las cuencas endorreicas de Irán, y en este reino va a pasar en las sabanas de
Queensland y en el Murray-Darling. Si es un gradiente, poner
`modificadores_propuestos: []` y explicarlo en `notas`.

---

## La forma del JSON

**Una ficha por lote.** No seis: una. La ficha es larga y es más barato cortar
que reintentar. Si una ficha no entra en una respuesta, se corta y se sigue en el
lote siguiente **sin repetir nada**, con `"continua": true` en el primero.

Una ficha **puede agrupar varias ecorregiones de RESOLVE** cuando describen el
mismo sistema: así se montaron las 33 de Indomalaya —`java_bali_montano` cubre
dos ECO_ID—. Agrupar es bueno cuando el sistema es el mismo y malo cuando
esconde un contraste. Los ids agrupados van en `_meta.ecorregiones_resolve`.

```json
{
  "encargo": "fichas-australasia",
  "lote": 1,
  "fecha": "2026-10-23",
  "continua": false,
  "entradas": [
    {
      "id": "pilbara_mulga",
      "nombre": "Matorrales de mulga del Pilbara",
      "emoji": "🏜️",
      "color": "#A1887F",
      "resumen": "…",
      "vegetacion": "…",
      "fauna": "…",
      "suelos": "…",
      "saberes": [],
      "especies": [
        { "nombre": "Mulga", "cientifico": "Acacia aneura", "tipo": "nativa", "nota": "…" }
      ],
      "cultivos": ["pasturas_nativas", "sorgo", "…"],
      "fuentes": [{ "label": "Título tal como lo muestra la página", "url": "https://…" }],
      "verificacion": "Qué dicen esas páginas, con sus palabras, sobre este lugar.",
      "_meta": {
        "ecorregiones_resolve": [213, 216],
        "nombre_resolve": "Pilbara shrublands; Western Australian Mulga shrublands",
        "paises": ["Australia"],
        "confianza": "alta",
        "base_de_suelos_usada": "Soil and Landscape Grid of Australia + HWSD v2",
        "notas": "…",
        "modificadores_propuestos": [
          {
            "uso": "pasturas",
            "delta": 0,
            "pisa_global": -15,
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

Reglas de forma: `id` en español, snake_case. `nombre` en español. El nombre
inglés de RESOLVE va en `_meta.nombre_resolve`. `emoji` uno solo. `color` un hex
que se parezca al paisaje.

---

## El orden de los lotes, que no es el de RESOLVE

Esto es una lección pagada: un encargo anterior listó los biomas en el orden del
catálogo de origen y **el primer lote se gastó entero en tres bosques cerrados**,
justo donde el dato que se buscaba casi no existe. **El orden lo decide dónde el
número hace daño.**

### Bloque 1 — Los rangelands áridos australianos (10). Primero y sin discusión.

Es donde el modificador heredado está mal y donde hay más hectáreas bajo
pastoreo. Hay literatura técnica abundante y abierta: el *Australian Rangelands*
*Journal*, los informes de la ACRIS (*Australian Collaborative Rangeland
Information System*), y las guías de carga animal de las agencias estatales de
WA, NT, SA y QLD.

- 213 — Pilbara shrublands
- 216 — Western Australian Mulga shrublands
- 191 — Eastern Australia mulga shrublands *(está en pastizal templado, va acá
  igual porque es el mismo sistema de mulga)*
- 207 — Carnarvon xeric shrublands
- 212 — Nullarbor Plains xeric shrublands
- 215 — Tirari-Sturt stony desert
- 209 — Gibson desert
- 210 — Great Sandy-Tanami desert
- 211 — Great Victoria desert
- 208 — Central Ranges xeric scrub
- 214 — Simpson desert

Los cuatro últimos son desierto de verdad, con carga muy baja: ahí el `−15`
global puede quedarse, y decirlo es un resultado. **La ficha que confirma el
modificador vale igual que la que lo corrige.**

### Bloque 2 — Las sabanas tropicales del norte y el Mitchell Grass (9)

Heredan `pasturas +20`. Son la zona de cría de ganado del norte de Australia.

- 187 — Mitchell Grass Downs *(la más importante del bloque: es el pastizal de
  arcilla negra, con carga publicada)*
- 186 — Kimberly tropical savanna
- 181 — Arnhem Land tropical savanna
- 184 — Carpentaria tropical savanna
- 183 — Cape York Peninsula tropical savanna
- 182 — Brigalow tropical savanna
- 185 — Einasleigh upland savanna
- 189 — Victoria Plains tropical savanna
- 188 — Trans Fly savanna and grasslands *(Nueva Guinea, otro país)*

### Bloque 3 — El suroeste mediterráneo y el mallee (10)

Región agrícola real, con trigo, oveja y un suelo muy pobre en fósforo que es la
característica que define el manejo. Hereda `frutales +15` y `huerta −10` del
bioma mediterráneo.

- 203 — Murray-Darling woodlands and mallee *(la cuenca agrícola más grande del
  país; ojo con el gradiente)*
- 202 — Jarrah-Karri forest and shrublands
- 206 — Southwest Australia woodlands
- 205 — Southwest Australia savanna
- 198 — Esperance mallee
- 199 — Eyre and York mallee
- 200 — Flinders-Lofty montane woodlands
- 204 — Naracoorte woodlands
- 197 — Coolgardie woodlands
- 201 — Hampton mallee and woodlands

### Bloque 4 — Nueva Zelanda y Tasmania (18)

La ganadería de pastoreo es la actividad principal de Nueva Zelanda y tiene la
mejor literatura de producción forrajera del hemisferio sur. Los *tussock*
grasslands de Canterbury-Otago y los *montane grasslands* de la Isla Sur son
sistemas pastoriles con series largas.

- 190 — Canterbury-Otago tussock grasslands
- 194 — New Zealand South Island montane grasslands
- 171 — New Zealand North Island temperate forests
- 172 — New Zealand South Island temperate forests
- 173 — Northland temperate kauri forests
- 180 — Westland temperate forests
- 169 — Fiordland temperate forests
- 170 — Nelson Coast temperate forests
- 175 — Richmond temperate forests
- 174 — Rakiura Island temperate forests
- 167 — Chatham Island temperate forests
- 178 — Tasmanian temperate forests
- 177 — Tasmanian Central Highland forests
- 179 — Tasmanian temperate rain forests
- 176 — Southeast Australia temperate forests
- 168 — Eastern Australian temperate forests
- 192 — Southeast Australia temperate savanna
- 193 — Australian Alps montane grasslands

### Bloque 5 — Nueva Guinea y las islas melanesias (31)

Nueva Guinea es el bloque con más gente del reino y con agricultura de subsistencia
documentada desde hace nueve mil años en las tierras altas de Wahgi. El bioma
global le da `huerta −25` por los suelos lixiviados, con la excepción volcánica
ya escrita: las tierras altas papúes son volcánicas y **la excepción puede
aplicar**. Esto es exactamente la clase de matiz que sólo una ficha puede poner.

- 139 — Central Range Papuan montane rain forests *(la más importante: es donde
  está la agricultura de altura)*
- 195 — Papuan Central Range sub-alpine grasslands
- 149 — Northern New Guinea montane rain forests
- 141 — Huon Peninsula montane rain forests
- 160 — Vogelkop montane rain forests
- 148 — Northern New Guinea lowland rain and freshwater swamp forests
- 155 — Southern New Guinea lowland rain forests
- 154 — Southern New Guinea freshwater swamp forests
- 161 — Vogelkop-Aru lowland rain forests
- 217 — New Guinea mangroves
- 144 — New Britain-New Ireland lowland rain forests
- 145 — New Britain-New Ireland montane rain forests
- 152 — Solomon Islands rain forests
- 159 — Vanuatu rain forests
- 146 — New Caledonia rain forests
- 164 — New Caledonia dry forests *(suelos ultramáficos, níquel: un caso de
  suelo que define todo, y vale una ficha propia)*
- 156 — Sulawesi lowland rain forests
- 157 — Sulawesi montane rain forests
- 151 — Seram rain forests
- 138 — Buru rain forests
- 140 — Halmahera rain forests
- 136 — Banda Sea Islands moist deciduous forests
- 163 — Lesser Sundas deciduous forests
- 166 — Timor and Wetar deciduous forests
- 165 — Sumba deciduous forests
- 150 — Queensland tropical rain forests
- 153 — Southeast Papuan rain forests
- 137 — Biak-Numfoor rain forests
- 162 — Yapen rain forests
- 135 — Admiralty Islands lowland rain forests
- 143 — Louisiade Archipelago rain forests
- 158 — Trobriand Islands rain forests

### Bloque 6 — Oceanía: las islas del Pacífico (18)

Último, porque son superficies chicas, pero con una particularidad que las hace
valer: en un atolón **el suelo es coralino, el agua es una lente de agua dulce
flotando sobre agua salada, y el sistema agrícola es el pozo de taro excavado
hasta la lente**. El bioma global de bosque húmedo tropical no describe nada de
eso. Es el contraste más grande entre bioma heredado y realidad de toda la lista.

- 627 — Palau tropical moist forests
- 618 — Carolines tropical moist forests
- 621 — Eastern Micronesia tropical moist forests
- 637 — Marianas tropical dry forests
- 638 — Yap tropical dry forests
- 622 — Fiji tropical moist forests
- 635 — Fiji tropical dry forests
- 629 — Samoan tropical moist forests
- 631 — Tongan tropical moist forests
- 634 — Western Polynesian tropical moist forests
- 619 — Central Polynesian tropical moist forests
- 620 — Cook Islands tropical moist forests
- 630 — Society Islands tropical moist forests
- 625 — Marquesas tropical moist forests
- 633 — Tubuai tropical moist forests
- 632 — Tuamotu tropical moist forests
- 626 — Ogasawara subtropical moist forests
- 624 — Kermadec Islands subtropical moist forests

### Los que no valen una ficha, y conviene saltearlos

Tres de la lista son islas sin agricultura ni ganadería: **142 Lord Howe**, **147
Norfolk** (que sí tiene algo, pero es minúscula) y **196 Antipodes Subantarctic
Islands tundra**. Y **37 Ascension** y **60 St. Helena** del otro reino. Si sale
fácil, van; si no, **a `vacias` con el motivo «superficie y uso agrícola
despreciables»**, que es una decisión y no un hueco. Hay veintidós fichas del
catálogo de prácticas vacías exactamente por esta clase de razón y están bien.

---

## Las reglas, en corto

1. **Ninguna URL entra sin abrirse.** Si no abre, la ficha va a `vacias`.
2. **El `label` se copia del título que muestra la página**, no se redacta.
3. **Nada de DOI de memoria.** Nada de «según la bibliografía».
4. **`saberes` siempre vacío.**
5. **Nativa y cultivo son dos cosas distintas.**
6. **Siete especies con binomial**, que es como cita el resto del catálogo.
7. **El modificador lleva el mecanismo, no la conclusión**, más la fuente y la
   confianza.
8. **Si es un gradiente, no se propone delta: se dice que es un gradiente.**
9. **Confirmar el modificador global vale igual que corregirlo.**
10. **Mejor una ficha que aguanta que tres con una floja**: una ficha no puede
    ser más fuerte que su fuente más floja.
11. Una ficha por lote. Un bloque JSON. Sin prosa antes ni después.
