# Fase 4 — lote 3: ECO_ID 298, South Deccan Plateau dry deciduous forests

*Va junto con `ENCARGO_FASE_4_FICHAS_INDOMALAYA.md` y `ANEXO_IDS_CULTIVOS.md`.
Entregá un solo archivo, `03.json`, con una sola ficha. Fecha: 23/10/2026.*

---

## 1. Lo que cambió en el encargo grande, y por qué

Dos arreglos que ya están hechos y que conviene que sepas, porque los dos fueron
errores míos y los dos te hicieron trabajar de más:

**a. El ejemplo de JSON del encargo tenía la respuesta puesta.** En la fase 5
—África— el ejemplo traía el id, el nombre, el emoji, el color, las dos
ecorregiones del lote y el modificador propuesto, y la entrega devolvió eso
completado. En este encargo pasó la versión chica del mismo problema: el ejemplo
traía `"cultivos": ["sorgo", "mijo_perla", ...]` y `mijo_perla` **no existe en el
catálogo**, así que el id inválido del lote 1 no salió de la tabla del anexo:
salió de mi ejemplo. Los tres ejemplos están neutralizados y ahora dicen
`"cultivos": ["<ids del anexo, 8 a 15>"]`. **El ejemplo es una forma, no una
respuesta.**

**b. La regla del gradiente está reescrita**, y este lote es el primero donde
importa de verdad. Ya no dice «si es un gradiente, no se propone delta». Dice:
nombrá la variable del gradiente, preguntate si acequia la mide, y si la mide,
proponé el delta y que la razón mande a mirar ese campo.

---

## 2. Por qué este lote es el caso de prueba de esa regla

Porque la fuente de esta ecorregión **declara el gradiente ella misma**: dice que
la ecorregión «probablemente representa un gradiente de humedad de oeste a este»,
con la lluvia anual entre 900 y 1.500 mm según cómo el relieve ondulado modula la
sombra de lluvia de los Ghats occidentales, flanqueada por bosque húmedo deciduo
al oeste y por matorral espinoso al este.

Con la regla vieja eso cerraba el caso en una línea:
`modificadores_propuestos: []`. Con la nueva, no. **La variable del gradiente acá
es la lluvia anual, y la lluvia anual es el primer dato que acequia tiene de
cualquier predio.** Así que lo que corresponde es un delta con una razón que
diga en qué extremo del gradiente vale cada cosa y mande al usuario a mirar la
lluvia de su punto. Si al final te parece que no se puede, decilo, pero decilo
nombrando la variable y explicando por qué la app no alcanza.

---

## 3. Lo primero, igual que en el lote 2: no asumas el suelo del encabezado

La cabecera del bloque 1 dice que el tema son los **vertisoles negros**, el
*regur*. Vale para parte del bloque y no hay que heredarlo. Ésta es la mitad sur
de la meseta del Decán, sobre otro basamento y otro relieve, y **cuál es el orden
dominante es la pregunta del lote.** Averigualo de los mapas, decí qué dicen HWSD
v2 y SoilGrids con sus porcentajes y si coinciden, y si el orden que aparece no
es el que el encabezado daba por hecho, eso es el hallazgo y se escribe así en
`verificacion`.

---

## 4. Las rutas, probadas hoy una por una

**Las que abren con acceso automático:**

| Ruta | Qué es | Estado |
|---|---|---|
| `https://www.oneearth.org/ecoregions/south-deccan-plateau-dry-deciduous-forests/` | la ficha de One Earth de esta ecorregión | 200 |
| `https://en.wikipedia.org/wiki/South_Deccan_Plateau_dry_deciduous_forests` | la entrada de Wikipedia | 200 |
| `https://www.fao.org/4/w4442E/w4442e05.htm` | las series de bosque seco de la India, FAO | 200 |
| `https://esdac.jrc.ec.europa.eu/public_path/shared_folder/eudasm/asia/lists/cin.htm` | **EUDASM**, el archivo del JRC con los mapas del NBSS&LUP escaneados | 200 |
| `https://krishikosh.egranth.ac.in/` | boletines del NBSS digitalizados | 200 |

**La que no abre sola:**
`https://ecoregions.worldwildlife.org/ecoregions/im0209` es la página de WWF de
esta ecorregión —**IM0209**— y devuelve 403 al acceso automático. Desde un
navegador real abre. Si no podés abrirla, no la cites: va a `vacias` con lo que
intentaste.

**Y el sitio del NBSS&LUP sigue muerto:** `nbsslup.in` es un dominio estacionado
en venta y `nbsslup.icar.gov.in` no resuelve. **Pero para esta ecorregión EUDASM
sirve mucho más que para la del lote 2**, y eso es lo mejor que trae este pedido:
en el listado de la India hay «TAMIL NADU. Soils. Sheet 3», «A preliminary soil
map of the Madras presidency» y «National Atlas of India. Southern India. Plate
203. Soil Regions», además del nacional «Soils of India. (Suborder
Associations)», NBSS&LUP Nagpur 1985, a 1:7.000.000. De Odisha no había nada; de
acá hay hoja estatal.

---

## 5. Tres cosas de este lote en particular

**a. El sándalo indio es de acá, no del lote 1.** En el lote 1 pusiste *Santalum
album* entre las especies del Decán central y hubo que sacarlo: la fuente lo
ubica en otra región y otra altura. Esta ecorregión es su lugar, y su propia
fuente le dedica un párrafo entero: es la madera más caraísima después de una
sola, y fue extraída selectivamente de casi todos los bosques. No es un dato
suelto: una especie extraída selectivamente de casi todo su rango cambia lo que
se puede decir del uso forestal.

**b. La población de elefantes manda sobre el uso del suelo, y eso se cuenta.**
Esta ecorregión contiene el corredor de elefantes más grande del mundo, con la
población estimada más grande de elefante asiático. Un predio ahí tiene un
conflicto de uso que la ficha debería nombrar en el texto, aunque no mueva ningún
delta: no es lo mismo planificar una huerta donde pasa un corredor de seis mil
elefantes que donde no.

**c. Más del 80 % del bosque natural está talado y hay 7 áreas protegidas cuya
cobertura la propia fuente llama inadecuada.** Igual que en el lote 2: si
encontrás dos evaluaciones con cifras distintas, **dame las dos con su año y su
fuente**, no la más alta.

---

## 6. El modificador: contra qué compite

Bioma 2, bosque seco tropical. Hoy hereda:

- `pasturas +10`
- `huerta −10`

Los dos números van en la propuesta: el `delta` y el `pisa_global`. El mecanismo
y no la conclusión, la fuente abierta, la confianza declarada. Y confirmar vale
igual que corregir: en el lote 1 el `huerta −10` se confirmó y lo que cambió fue
la razón.

Los usos son `huerta`, `pasturas`, `frutales`, `forestal` y `reserva`, con `delta`
entero entre −35 y +25. **La ficha pisa sólo el uso que nombra**, hereda el resto,
y puede agregar un uso que el bioma global no nombre. En el lote 1 se agregó
`forestal`, que el bosque seco no trae, por un mecanismo propio de esa
ecorregión. **No lo copies: si acá corresponde, el mecanismo tiene que ser el de
acá.**

---

## 7. Los cultivos

El id es siempre la primera columna del anexo, va entre comillas y **nunca tiene
mayúsculas, acentos, barras ni espacios**. Si lo que vas a escribir tiene
cualquiera de esas cosas, estás copiando un nombre y no un id. Y un cultivo que
la región produce pero el catálogo no tiene **se nombra en `notas`**; no se
reemplaza por un pariente.

---

## 8. La entrega

Un solo archivo, `03.json`, una sola ficha, el bloque JSON y nada de prosa
alrededor. Lo que no puede faltar:

- `_meta.ecorregiones_resolve: [298]`
- `_meta.nombre_resolve: "South Deccan Plateau dry deciduous forests"`
- `_meta.paises`
- `_meta.confianza`
- `_meta.base_de_suelos_usada`, diciendo qué se usó de verdad y qué no abrió
- `verificacion`: qué dicen esas páginas, con sus palabras, sobre este lugar
- `saberes: []`, siempre
- siete especies con nombre común y binomial
- `modificadores_propuestos`, con el mecanismo, la fuente y la confianza

**Mejor una ficha que aguanta que una que rellena.**
