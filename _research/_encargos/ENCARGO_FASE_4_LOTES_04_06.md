# Fase 4 — lotes 4, 5 y 6: las tres fichas que tienen una práctica esperando

*Va junto con `ENCARGO_FASE_4_FICHAS_INDOMALAYA.md` y `ANEXO_IDS_CULTIVOS.md`.
Tres archivos: `04.json`, `05.json` y `06.json`, **una ficha cada uno**.
Fecha: 02/11/2026.*

---

## 1. Por qué estas tres y no las del orden del encargo

Porque son las únicas tres del catálogo que tienen trabajo terminado detenido
atrás. En la fase 6 —prácticas fechadas del territorio— volvieron tres entradas
**verificadas, con la fuente abierta y leída**, y no se pueden montar porque la
ficha donde viven no existe:

| ECO_ID | Ficha que falta | La práctica que espera |
|---|---|---|
| **323** | manglar de Sundarbans | el arroz tolerante a la sal de las islas habitadas de South 24 Parganas |
| **294** | bosques secos del Irrawaddy | el cultivo mixto de la zona seca de Myanmar |
| **315** | matorral espinoso del Decán | el riego *phad* del noroeste de Maharashtra |

Cada ficha que entra desbloquea una entrada que ya está escrita. Es el mejor
cambio por token de toda la fase.

**Y los lotes 2 y 3 de esta fase nunca volvieron.** Siguen válidos tal como están
escritos —el Decán central sobre vertisoles y la meseta sur del Decán— y se
pueden hacer después de éstos, o antes si preferís. Pero estos tres van primero.

---

## 2. Antes de nada: dos correcciones al encargo grande, las dos mías

**a. El ejemplo de JSON traía una respuesta puesta.** Decía `"id":
"decan_vertisoles_secos"`, el nombre, el emoji, el color,
`"ecorregiones_resolve": [290, 297, 298]`, la teca con su binomial,
`"base_de_suelos_usada": "NBSS&LUP + HWSD v2 + SoilGrids"` y el modificador
`huerta · delta 0 · pisa_global −10`. **El ejemplo es la instrucción más fuerte
de un documento**: en la fase 5 una entrega devolvió el ejemplo completado, con
las descripciones investigadas alrededor. Ya está neutralizado. Si tenés una
copia vieja del encargo, pedí la nueva.

**b. EUDASM ya no sirve como ruta, y el encargo lo recomendaba.** El archivo de
suelos del JRC europeo —el espejo que tenía escaneados los mapas del NBSS&LUP,
que es el organismo indio cuyo sitio está muerto— devuelve hoy **código 200 con
un cuerpo de 244 bytes que dice «Request Rejected»**. Es un cortafuegos que
rechaza con código de éxito, y pasa en las cuatro rutas probadas: India,
Bangladesh, Myanmar y el Atlas de África. Es intermitente: el dominio a secas sí
contesta HTML de verdad.

De ahí sale una regla que vale para todo: **un 200 no quiere decir que la página
abrió.** Se confirma leyendo el contenido, y para eso está el campo
`verificacion`. Si EUDASM te toca abierto, usalo y decilo; si te toca rechazado,
va a `vacias` y la ficha se escribe con **HWSD v2 y SoilGrids**, que es lo que la
app usa igual.

---

## 3. Lote 4 — ECO_ID 323, Sundarbans mangroves

**Rutas probadas el 02/11/2026:**

| Ruta | Estado |
|---|---|
| `https://www.oneearth.org/ecoregions/sundarbans-mangroves/` | 200, 62.657 bytes |
| `https://en.wikipedia.org/wiki/Sundarbans_mangroves` | 200, 662.099 bytes |
| `https://www.fao.org/3/ad652e/ad652e00.htm` | 200 — zonificación ecológica global de la FAO |

`whc.unesco.org` devuelve 403 al acceso automático; desde un navegador real abre.
Si no podés abrirlo, no lo cites.

**La pregunta del lote.** Bioma 14, manglar. Hoy hereda cinco modificadores, que
son los más duros del catálogo:

- `reserva +30` · `huerta −35` · `pasturas −30` · `frutales −35` · `forestal −25`

La razón del `huerta −35` y del `pasturas −30` es «suelo salino y anegado», y
para el manglar es correcta. **Pero el polígono 323 no es sólo manglar.**
Contiene islas habitadas, con terraplenes, donde vive y cultiva una cantidad
enorme de gente. Y la práctica que espera esta ficha es precisamente arroz
tolerante a la sal en esas islas.

Eso es lo que hay que resolver, y no está resuelto acá:

- ¿Hasta dónde llega el polígono de RESOLVE? ¿Qué parte es manglar y qué parte es
  isla con terraplén y arrozal? Si encontrás una cifra de superficie o de
  población, con su año, mejor.
- Si una parte del polígono se cultiva de verdad, **¿eso cambia el modificador o
  no?** Hay dos respuestas defendibles y las dos sirven si traen el mecanismo:
  que el −35 se mantenga porque la aptitud del manglar es ésa y el cultivo existe
  sólo donde se lo drenó —que es lo que el bioma advierte—, o que se matice
  porque el polígono incluye tierra ganada con terraplén donde el cultivo es el
  uso normal. **Lo que no sirve es decidirlo sin decir cuál de las dos cosas es.**
- El suelo: salinidad, acidez sulfatada, qué pasa cuando se drena. Y qué dicen
  HWSD v2 y SoilGrids, con sus porcentajes.
- Los ciclones y la intrusión salina: si hay datos de cuánto avanzó la sal, con
  año y fuente.

---

## 4. Lote 5 — ECO_ID 294, Irrawaddy dry forests

**Rutas probadas el 02/11/2026:**

| Ruta | Estado |
|---|---|
| `https://www.oneearth.org/ecoregions/irrawaddy-dry-forests/` | 200, 62.037 bytes |
| `https://en.wikipedia.org/wiki/Irrawaddy_dry_forests` | 200, 94.898 bytes |
| `https://www.fao.org/3/ad652e/ad652e00.htm` | 200 |

**La pregunta del lote.** Bioma 2, bosque tropical y subtropical seco. Hoy
hereda:

- `pasturas +10` — «el pulso estacional favorece el pastoreo, pero sólo con
  descanso: al final de la seca el suelo queda expuesto justo cuando llegan las
  primeras lluvias fuertes»
- `huerta −10` — «sin riego o cosecha de agua, la huerta queda parada varios
  meses del año»

Ésta es la **zona seca** de Myanmar: sombra de lluvia, y es además una de las
regiones más pobladas y más cultivadas del país. Lo que se pide:

- **La lluvia anual, con su rango de un extremo al otro del polígono**, que es el
  primer dato que acequia tiene de cualquier predio. Si la ecorregión es un
  gradiente, nombrá la variable y proponé el delta igual, con una razón que mande
  a mirar ese campo: la regla vieja de «si es un gradiente no se propone delta»
  está reemplazada.
- Si hay riego histórico —tanques, canales, elevación desde el río— decilo, porque
  cambia por completo el sentido del `huerta −10`.
- El suelo, cruzando las dos bases, con porcentajes.
- Y una advertencia: **no heredes el suelo del encabezado del bloque.** El bloque
  1 de este encargo habla de vertisoles del Decán; esto es otro país y otro
  basamento. Cuál es el orden dominante es parte de la pregunta.

---

## 5. Lote 6 — ECO_ID 315, Deccan thorn scrub forests

**Rutas probadas el 02/11/2026:**

| Ruta | Estado |
|---|---|
| `https://www.oneearth.org/ecoregions/deccan-thorn-scrub-forests/` | 200, 60.546 bytes |
| `https://en.wikipedia.org/wiki/Deccan_thorn_scrub_forests` | 200, 154.683 bytes |
| `https://www.indiawaterportal.org/` | 200 |
| `https://krishikosh.egranth.ac.in/` | boletines del NBSS digitalizados |

**Lo primero, porque ya costó una entrada: 315 no es 290.** `decan_central_
hardwickia`, la ficha que el lote 1 montó, es el **ECO_ID 290**. El 315 es otro
polígono y está medido: Dhule, Sakri, Malegaon y Jalgaon dan los cuatro 315. Esta
ficha es nueva y es sólo el 315.

**La pregunta del lote.** Bioma 13, desierto y matorral xerófilo. Hoy hereda:

- `huerta −25` — «sin agua traída de otro lado no hay huerta; **el sistema
  histórico acá es el oasis, no el cuadro abierto**»
- `pasturas −15` — «la carga que aguanta es baja y el error se paga con
  desertificación»
- `reserva +15` — «la costra biológica del suelo se rompe con una pasada y tarda
  décadas»

Y acá hay una tensión que vale el lote entero. La razón del `huerta −25` dice que
el sistema histórico es el oasis, es decir agua traída de otro lado y
concentrada. **El sistema histórico del noroeste de Maharashtra es el *phad***: un
desvío comunitario desde el río hacia bloques de parcelas, con reparto y turnos.
Es, literalmente, agua traída de otro lado — pero no es un oasis.

Lo que se pide:

- Si el *phad* o el *bandhara* son el sistema de la región, **con qué superficie
  y desde cuándo**, y qué dice eso del `huerta −25`: ¿lo confirma porque sin ese
  desvío no hay huerta, o lo matiza porque el desvío existe y es viejo? Las dos
  respuestas sirven; la que no sirve es la que no elige.
- La lluvia anual y su variabilidad entre años, no sólo el promedio.
- **El suelo, y acá hay algo medido que conviene mirar de frente:** en el Decán
  hay trabajos que muestran que el vertisol escurre menos que el alfisol arenoso
  —del orden de 7 a 11 % contra 16 a 17 %—, que es lo contrario de lo que se
  espera de una arcilla. Si en el 315 aparece esa mezcla de órdenes, decí el
  reparto con porcentajes de HWSD v2 y SoilGrids, y si alguna fuente da
  coeficientes de escurrimiento medidos, traelos con la lluvia y el manejo con
  que se midieron. Eso vale muchísimo más que una descripción.
- Y las especies: es matorral espinoso, no bosque seco. Siete, con binomial.

---

## 6. Lo que vale para los tres

- `saberes: []`, siempre. Las prácticas van por otro encargo.
- Siete especies con nombre común y binomial.
- `cultivos`: ids de la primera columna del anexo, entre comillas, **sin
  mayúsculas, acentos, barras ni espacios**. Si lo que vas a escribir tiene
  alguna de esas cosas, estás copiando un nombre y no un id. Un cultivo que la
  región produce y el catálogo no tiene **se nombra en `notas`**, no se reemplaza
  por un pariente.
- `verificacion`: qué dicen esas páginas, con sus palabras, sobre este lugar.
- `_meta.base_de_suelos_usada`: qué abrió de verdad y qué no.
- Una ficha por archivo. Si una no entra en una respuesta, se corta y se sigue en
  la siguiente **sin repetir nada**, con `"continua": true` en la primera.
- Confirmar un modificador global vale igual que corregirlo: convierte un delta
  heredado en un delta respaldado.

**Mejor una ficha que aguanta que una que rellena.**
