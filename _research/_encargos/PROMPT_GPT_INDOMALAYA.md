# Encargo — Ecosistemas y saberes del reino Indomalayo

Mismo método que Mesoamérica/Norteamérica, Europa y Sudamérica. Ahora toca
**Indomalaya**: el subcontinente indio, Indochina, Sundaland y Filipinas.

Carpeta nueva: `_research/ecosistemas-saberes-indomalaya/`

No toques `apps/`, `packages/` ni `supabase/`. No hagas commit. El montaje a
`lib/` lo hace Claude.

## Por qué esta región y no otra

De las 847 ecorregiones de RESOLVE, la app tiene ficha regional para 396.
Indomalaya tiene **106 ecorregiones y una sola ficha**: el ECO_ID 320 (delta del
Indo), que entró de rebote con el lote de Medio Oriente. Las otras **105 reciben
el bioma global de RESOLVE y nada más**.

Eso no es sólo falta de profundidad. En esta región el bioma global **dice algo
falso**, y lo dice tres veces.

### Error 1 — los suelos volcánicos jóvenes

El bioma `resolve_bosque_tropical_humedo` lleva el modificador `huerta: -25`,
con esta razón: *"la fertilidad está en la biomasa viva y no en el suelo"*. Es
cierto sobre el oxisol amazónico y sobre la cuenca del Congo, que son la mayor
parte del bioma. **No es cierto en Java, Bali, Sumatra, Luzón ni Mindanao**, que
se sostienen sobre andisoles volcánicos jóvenes: de los suelos más fértiles del
planeta, con las densidades rurales más altas del mundo y horticultura continua
desde hace siglos. Ahí el limitante es la pendiente y la erosión, no la
fertilidad.

ECO_ID afectados: **229, 230, 231, 240, 241, 246, 247, 248, 278, 279, 288, 289**
(y 303, 305, que caen en el bioma de coníferas tropicales).

### Error 2 — las llanuras aluviales de arroz

El mismo `huerta: -25` lo heredan las grandes llanuras y deltas aluviales de
Asia, que son exactamente lo contrario de un suelo lixiviado: aluvión joven,
recargado por la creciente, con arrozales continuos desde hace dos mil años y de
las densidades de población más altas del planeta.

ECO_ID afectados: **222** (valle del Brahmaputra), **224, 225** (Chao Phraya),
**234, 235** (Irrawaddy), **238, 287** (llanura gangética baja y alta), **266**
(río Rojo), **273** (sudoeste de Borneo), **277** (Sumatra), **282**
(Sundarbans), **285** (Tonle Sap).

Este segundo error no estaba relevado antes de este encargo. Por población
afectada es probablemente más grande que el primero.

**No hay que arreglar nada de esto tocando el bioma global.** El delta global es
correcto para la mayoría de las 216 ecorregiones que lo heredan; cambiarlo
rompería la Amazonia para arreglar Java. La distinción es geográfica y sólo se
expresa con fichas regionales.

### Error 3 — el semiárido indio

`Deccan thorn scrub` (315), `Aravalli west thorn scrub` (314), `Thar desert`
(318) e `Indus Valley desert` (317) caen en desierto y matorral xerófilo, que
lleva `pasturas: -15`. El Decán y Rajastán sostienen uno de los rodeos caprinos
y bovinos más grandes del mundo sobre pastoreo comunal de monte. Es el mismo
caso que ya se corrigió tres veces en el Paleártico (badia siria, meseta de
Anatolia, cuencas endorreicas de Irán) y una en Norteamérica (pradera de pastos
cortos).

## Las 106 ecorregiones del reino

Ya tomada: **320** (Indus River Delta-Arabian Sea mangroves). No la toques.

Las 105 restantes, por grupo geográfico, para que ordenes el trabajo:

**Sundaland e insular** — 219 220 221 227 229 230 245 262 263 264 265 273 277
278 279 280 281 288 289 305 322
**Filipinas** — 231 240 241 246 247 248 276 303
**Indochina** — 223 224 225 232 234 235 237 239 250 255 256 257 258 260 266 268
272 284 285 286 291 294 299 300 319 321
**Subcontinente indio, húmedo** — 228 238 242 253 254 261 270 271 282 287 323
**Subcontinente indio, seco y espinoso** — 290 292 293 295 296 297 298 312 314
315 316 317 318
**Sri Lanka** — 274 275 301
**Himalaya y noreste indio** — 222 226 233 244 249 259 302 304 306 307 308 309
310 311 313
**Borde subtropical chino, taiwanés y japonés** — 236 251 269 283
**Islas oceánicas y arrecifes** — 218 243 252 267

Los nombres exactos que publica RESOLVE están en
`_research/resolve-eco-id-bioma-2026-09-07.json`, con su bioma y su reino. Es la
fuente para los ECO_ID: no los inventes ni los infieras por parecido de nombre.

## Orden de prioridad

1. **Los 12 ECO_ID volcánicos y los 13 aluviales.** Son los que hoy imprimen un
   número equivocado. Si sólo llegás a esto, el encargo ya valió.
2. **Ghats occidentales y Sri Lanka.** Laterita profunda, monzón de 2.000 a
   7.000 mm y agricultura de ladera en terrazas; nada que ver con el bioma
   húmedo genérico.
3. **El semiárido indio** (error 3).
4. **Indochina de monzón estacional**, que hoy comparte bioma con la selva
   perhúmeda y tiene un régimen de agua completamente distinto.
5. **Himalaya y noreste indio**, donde el gradiente de altura hace difícil que
   una sola ficha describa la ecorregión entera: decilo en `confianza` cuando
   pase, no lo tapes.
6. El resto, por profundidad.

## Contrato de datos

Idéntico a las entregas anteriores. Cada ficha ecológica:

```
id, nombre, emoji, color, resumen, vegetacion, fauna, suelos,
saberes: []            // SIEMPRE vacío en la ficha ecológica
especies: [...],
fuentes: [{label, url}],
_meta: { ecorregiones_resolve: [...], paises: [...], confianza, notas }
```

`id` en español y en snake_case, como las 47 fichas sudamericanas
(`amazonia_noroccidental_tierra_firme`, `bosque_seco_chiquitano`). El nombre en
español; el ECO_NAME inglés de RESOLVE va en el comentario del mapeo.

Y las dos capas separadas desde el principio:

1. **Ecología base** — una sola ficha dueña por ECO_ID. Global, no por país.
2. **Saberes territoriales** — inventario aparte, con pueblo o portadores, país,
   territorio mínimo, fuente, cautelas y estado de geometría. País o Köppen
   nunca alcanzan para activar un saber.

## Lo que hay que entregar acá y no hacía falta antes

Para cada ficha que pise uno de los tres errores, un campo nuevo en `_meta`:

```
"modificadores_propuestos": [
  { "uso": "huerta", "delta": 10,
    "razon": "…", "pisa_global": -25, "fuente": "…" }
]
```

Con la fuente del suelo, no con el criterio de nadie: orden taxonómico
—andisol, entisol fluvéntico, oxisol, alfisol— y de dónde sale. La app no
publica un delta sin fuente citada, unidades y rango de validez.

## Especies

Dos listas separadas, como en las entregas anteriores: **nativa** y **cultivo**.
Nunca mezcladas. Acá hace falta cuidado extra: mucha especie que se cultiva en
todo el trópico es nativa de esta región (arroz, banana, caña, cítricos, mango,
coco, pimienta, nuez moscada, clavo). Si es nativa de la ecorregión va en
nativa, y que además se cultive se cuenta en el texto.

## Regla de colisiones

Para cada ECO_ID declarás la acción. `AGREGAR` es el caso normal acá, porque hay
105 sin dueño. `REEMPLAZAR` sólo podría tocar el 320 y no debería; si lo
proponés, decí qué ficha queda huérfana y cómo se evita.

## Alcance por país

India, Nepal, Bután, Bangladesh, Sri Lanka, Maldivas, Pakistán (la parte
indomalaya), Myanmar, Tailandia, Laos, Camboya, Vietnam, Malasia, Singapur,
Brunéi, Indonesia (Sumatra, Java, Bali, Kalimantan), Filipinas, y el borde
subtropical de China, Taiwán y las Ryukyu.

**Ojo con la línea de Wallace.** Sulawesi, las Molucas, Nusa Tenggara al este de
Bali y Papúa **no son Indomalaya**: RESOLVE las pone en Australasia y van en
otro encargo. Si una ficha te cruza la línea, partila.

## Entregables

- `README.md`
- `fase-1-ecologia/fichas-ecologicas-nuevas.json` (con `saberes: []`)
- `fase-1-ecologia/mapeo-eco-id-nuevo.json`
- `fase-1-ecologia/decisiones-colisiones.json`
- `fase-1-ecologia/reporte-validacion.json`
- `fase-2-saberes-territoriales/inventario-saberes-documentados.json`
- `MATRIZ_ECO_ID.md`, `AUDITORIA_COLISIONES.md`, `FUENTES.md`, `RESUMEN.md`

El `reporte-validacion.json` tiene que cerrar dos cuentas: que los ECO_ID
mapeados sumen 105, y que ninguno aparezca en dos fichas.

## Cautelas

Fuentes oficiales, académicas o de organismos internacionales, con fecha de
consulta. Para saberes tradicionales, atribución explícita y límites de uso: no
publiques sitios sagrados, coordenadas, recetas medicinales, calendarios
ceremoniales ni de extracción. Nada de convertir fuego, pastoreo, pesca o
medicina en receta universal.

Sobre los nombres de los pueblos: **si la fuente los nombra, nombralos como
ella**. No traduzcas ni "normalices" un etnónimo, y no uses un nombre de pueblo
en minúscula como ejemplo genérico.

Y no metas claves de API, tokens ni credenciales en la carpeta: es regla del
repo.

Avisá cuando esté listo para revisión.
