# Encargo acotado — Indomalaya, prioridades 1 y 2 (33 ecorregiones)

Versión autocontenida del encargo grande
(`PROMPT_GPT_INDOMALAYA.md`), recortada a lo que corrige un número equivocado.
Sirve para pegar en una sesión que **no tiene acceso al repo**.

Si la sesión sí está en el repo, agregarle al final:

> Estás en el repo. Usá `apps/terreno/lib/ecorregionesSudamerica.ts` y las 47
> fichas sudamericanas como referencia de formato en vez de inventarlo, y escribí
> los archivos en `_research/ecosistemas-saberes-indomalaya/`. No toques `apps/`,
> `packages/` ni `supabase/`.

---

Necesito fichas ecológicas para 33 ecorregiones del reino Indomalayo. Son para
**acequia** (https://acequia.app), una aplicación de análisis de territorio para
diseño regenerativo: alguien marca su predio y la app le dice qué ecosistema le
toca, qué suelo tiene y qué usos le convienen.

Esto no es un ejercicio de redacción. **La app imprime números que la gente usa
para decidir dónde plantar y dónde excavar.** Si una fuente no existe, la ficha
sale sin ella; si un dato no se sabe, se dice que no se sabe. Un dato plausible
e inventado es el peor resultado posible, peor que no entregar la ficha.

## Por qué estas 33 y no otras

La app clasifica el mundo con las 847 ecorregiones de RESOLVE. Cuando no hay
ficha regional, cae al **bioma global**, que aplica modificadores de aptitud por
uso. El bioma "Bosque tropical y subtropical húmedo" lleva hoy:

```
huerta: -25 — "En los suelos lixiviados que dominan el bioma la fertilidad está
en la biomasa viva y no en el suelo: abierto y desnudo se lava en pocas
temporadas."
```

Eso es correcto sobre el oxisol amazónico y la cuenca del Congo. **En estas 33
es falso**, por dos razones distintas.

### Grupo A — suelos volcánicos jóvenes (14 ecorregiones)

Andisoles: de los suelos más fértiles del planeta, con las densidades rurales
más altas del mundo y horticultura continua desde hace siglos. El limitante ahí
es la pendiente y la erosión, no la fertilidad.

```
229  Eastern Java-Bali montane rain forests
230  Eastern Java-Bali rain forests
231  Greater Negros-Panay rain forests
240  Luzon montane rain forests
241  Luzon rain forests
246  Mindanao montane rain forests
247  Mindanao-Eastern Visayas rain forests
248  Mindoro rain forests
278  Sumatran lowland rain forests
279  Sumatran montane rain forests
288  Western Java montane rain forests
289  Western Java rain forests
303  Luzon tropical pine forests          (bioma: coníferas tropicales)
305  Sumatran tropical pine forests       (bioma: coníferas tropicales)
```

### Grupo B — llanuras y deltas aluviales (12 ecorregiones)

Aluvión joven recargado por la creciente, con arrozales continuos desde hace dos
mil años. Es exactamente lo contrario de un suelo lixiviado.

```
222  Brahmaputra Valley semi-evergreen forests
224  Chao Phraya freshwater swamp forests
225  Chao Phraya lowland moist deciduous forests
234  Irrawaddy freshwater swamp forests
235  Irrawaddy moist deciduous forests
238  Lower Gangetic Plains moist deciduous forests
266  Red River freshwater swamp forests
273  Southwest Borneo freshwater swamp forests
277  Sumatran freshwater swamp forests
282  Sundarbans freshwater swamp forests
285  Tonle Sap freshwater swamp forests
287  Upper Gangetic Plains moist deciduous forests
```

Ojo con 273 y 277: son turberas (peat/freshwater swamp) sobre Borneo y Sumatra.
Ahí el problema no es la fertilidad sino el drenaje y la subsidencia — drenar
una turbera tropical la oxida y la hunde. **No las trates como aluvión fluvial
normal**, y si el modificador que corresponde es negativo por otra razón,
decilo: el encargo no es "subir la huerta", es "que el número sea el correcto".

### Grupo C — Ghats occidentales y Sri Lanka (7 ecorregiones)

Laterita profunda, monzón de 2.000 a 7.000 mm, agricultura de ladera en
terrazas. No tienen el error de arriba: entran porque el bioma genérico no las
describe y son de las regiones agrícolas más antiguas del mundo.

```
253  North Western Ghats moist deciduous forests
254  North Western Ghats montane rain forests
270  South Western Ghats moist deciduous forests
271  South Western Ghats montane rain forests
274  Sri Lanka lowland rain forests
275  Sri Lanka montane rain forests
301  Sri Lanka dry-zone dry evergreen forests
```

## Qué entregar

Un JSON por ecorregión, agrupadas en fichas cuando varias comparten descripción
real (p. ej. Java occidental y oriental pueden compartir ficha; Luzón montano y
de tierras bajas probablemente no). **Una sola ficha dueña por ECO_ID**, y los
33 tienen que quedar asignados exactamente una vez.

```json
{
  "id": "java_bali_volcanico",
  "nombre": "Selvas volcánicas de Java y Bali",
  "emoji": "🌋",
  "color": "#2E7D32",
  "resumen": "…",
  "vegetacion": "…",
  "fauna": "…",
  "suelos": "…",
  "saberes": [],
  "especies": [
    { "nombre": "…", "cientifico": "…", "tipo": "nativa|cultivo", "nota": "…" }
  ],
  "fuentes": [{ "label": "…", "url": "…" }],
  "_meta": {
    "ecorregiones_resolve": [229, 230, 288, 289],
    "paises": ["Indonesia"],
    "confianza": "alta|media|baja",
    "notas": "…",
    "modificadores_propuestos": [
      {
        "uso": "huerta",
        "delta": 10,
        "razon": "…",
        "pisa_global": -25,
        "fuente": "…"
      }
    ]
  }
}
```

Reglas del contrato:

- `id` en español, snake_case. `nombre` en español. El nombre inglés de RESOLVE
  va en `_meta.notas`.
- **`saberes` va SIEMPRE vacío.** Los saberes tradicionales son otra capa, con
  otro contrato y otras cautelas. No los metas acá.
- `especies`: **nativa y cultivo son dos cosas distintas** y no se mezclan. Ojo
  en esta región: arroz, banana, caña, cítricos, mango, coco, pimienta, nuez
  moscada y clavo son *nativos* de acá. Si es nativo de la ecorregión va como
  nativa, y que además se cultive se cuenta en el texto.
- `usos` posibles para `modificadores_propuestos`: `huerta`, `forestal`,
  `pasturas`, `reserva`. `delta` entero, entre −35 y +25.

## Lo más importante: los modificadores

Para cada ficha del grupo A o B, `modificadores_propuestos` es obligatorio y
**tiene que traer el orden taxonómico del suelo con su fuente**: andisol,
entisol fluvéntico, histosol, oxisol, alfisol, vertisol. No "suelo fértil".

La fuente tiene que ser verificable: WRB/FAO, el mapa de suelos nacional, un
paper con DOI, la ficha de la ecorregión de WWF/RESOLVE. **Si no conseguís una
fuente que nombre el suelo, no propongas el delta**: dejá
`modificadores_propuestos: []` y explicá en `notas` qué falta. Es un resultado
aceptable y útil.

## Cómo trabajar

1. **Buscá primero, escribí después.** Para cada grupo de ecorregiones, buscá la
   descripción de RESOLVE/WWF y el suelo dominante antes de redactar nada.
2. **Cada URL que pongas en `fuentes` tiene que haber sido abierta.** Nada de
   citar de memoria. Si no pudiste abrirla, no va.
3. Entregá **de a 8 fichas por vez**, cada tanda en un solo bloque de código
   JSON, para que se pueda guardar de una. Después de cada tanda, parás y
   esperás.
4. Al final, un bloque aparte con: la lista de los 33 ECO_ID y a qué ficha fue
   cada uno, y cualquier ECO_ID que no hayas podido resolver y por qué.

## Cautelas

- Fuentes oficiales, académicas o de organismos internacionales, con fecha de
  consulta.
- No publiques sitios sagrados, coordenadas, recetas medicinales ni calendarios
  ceremoniales.
- **Si una fuente nombra un pueblo, nombralo como ella lo nombra.** No traduzcas
  ni "normalices" un etnónimo, y no uses un nombre de pueblo en minúscula como
  ejemplo genérico.
- La línea de Wallace: Sulawesi, las Molucas, Nusa Tenggara al este de Bali y
  Papúa **no son Indomalaya** y no entran acá. Bali sí; Lombok ya no.

Empezá por el grupo A. Antes de la primera tanda, decime qué agrupamiento de
ECO_ID en fichas proponés y por qué, y esperá que lo confirme.
