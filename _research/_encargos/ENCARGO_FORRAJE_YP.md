# Encargo — `Yp`, segunda vuelta: tres blancos con nombre

*Reescrito el 02/11/2026. Reemplaza la primera versión de este archivo, que
pedía un barrido de valores publicados. **Ese barrido ya se hizo y cerró**: lo
que sigue es mucho más chico y mucho más preciso.*

---

## Qué pasó con la primera vuelta, para no repetirla

Volvieron tres lotes. Resultado:

- **Lote 1, seis fichas de sitio ecológico del NRCS (MLRA 058A y 058D).** Los
  números estaban bien y verificados contra la fuente. **Pero la columna alta de
  esas fichas no es `Yp`**, y eso quedó medido: en la ficha más comparable al
  sitio del trabajo original (`R058AE003MT — Sandy`, zona de 10 a 14 pulgadas,
  pradera mixta arenosa) la columna alta da 2.578 kg/ha de total y 2.062 sólo de
  pasto, contra el `Yp` = 1.300 publicado para el sitio arenoso de Sidney. **1,98
  y 1,59 veces.** Tres razones: la ficha cuenta todos los grupos vegetales
  (hierbas y arbustos incluidos), producción anual no es pico de materia en pie,
  y —esto es culpa del encargo, no de la entrega— **la ficha no define su columna
  alta como «año favorable»**. Se leyeron dos fichas completas y ninguna define
  sus tres columnas. El encargo pedía una columna que no existe con ese nombre.
- **Lote 2, ensayo de riego de Dirab, Arabia Saudita.** Rechazado. Cinco
  arbustos nativos trasplantados en hileras a 1 m en una estación experimental,
  cosechando hojas y ramillas cada tres meses: no es una comunidad de pastizal
  intacta. Y el rendimiento **baja** con más riego en tres de las cinco
  especies, así que la tabla no establece ningún techo hídrico.
- **Lote 3, relaciones.** Volvió vacío, con el motivo bien escrito. Correcto: no
  se encontró una ecuación publicada que prediga `Yp` desde una propiedad de
  suelo, y no se transformó ANPP en `Yp` para llenar el hueco.

**Nada de esto hay que volver a buscar.** Fichas del NRCS como fuente de `Yp`:
cerrado. Ensayos de riego sobre plantas trasplantadas en hileras: cerrado.

---

## Lo que ya no hace falta pedir, y por qué

`Yp` **se despeja**. El trabajo lo dice —`Yp = Y · Tp/T` para años
representativos— y eso quedó verificado contra su propia Tabla 1: los nueve años
representativos devuelven **1.299,7 kg/ha contra el 1.300 publicado, 0,02 %**. Y
el despeje **no arrastra la sequía** de la temporada medida (1,7 % de diferencia
entre temporadas secas y húmedas, con rendimientos medidos que difieren más del
60 %), así que alcanza **un corte de pasto en el predio del usuario**, el año que
se pueda cortar. Error de una sola temporada: mediano 3,3 %, peor 6,1 %.

O sea que el camino principal ya no pasa por la bibliografía. Pasa por pedirle
al usuario una medición. Está escrito en `despejarYp` y `YP_DESPEJADO_SIDNEY`.

---

## El pedido, entonces: tres blancos con nombre

No es un barrido. Son tres documentos o rutas concretas, y cada uno cierra algo.
**Si uno no se encuentra, eso también es una respuesta: decilo y seguí.**

### Blanco 1 — Wight y Black (1979), que es de donde salió el 1.300

El trabajo de 1981 dice que en Sidney «los rendimientos parecían topear ahí sin
importar cuánta lluvia cayera», y cita a **Wight y Black (1979)**. Ése es el
trabajo donde se estableció el `Yp` del sitio, así que es el lugar más probable
donde esté explicado **cómo se determina un `Yp`** y con qué propiedades del
sitio se relaciona.

Qué hace falta: la cita completa, si hay copia abierta y su URL, y si el trabajo
publica alguna relación entre producción potencial y una propiedad del suelo o
del sitio — profundidad, agua útil, textura, nitrógeno, materia orgánica. Si la
publica, la ecuación completa con coeficientes, unidades, `r²` y `n`.

### Blanco 2 — la ficha de sitio ecológico del lugar real de Sidney

Sidney, Montana está en **la planicie glaciada: MLRA 52, Rangeland Resource Unit
52N**, no en la 058A que se relevó. El sitio del trabajo es «arenoso de planicie
glaciada», zona de 10 a 14 pulgadas. Existe entonces la ficha del sitio exacto
donde se calibró el modelo, y con ella se puede medir el desfasaje entre la
columna de una ficha y un `Yp` publicado **con el sitio apareado de verdad**, no
con un vecino.

Qué hace falta: la ficha del sitio **arenoso** de la MLRA 52 / RRU 52N de
Montana, zona de 10 a 14 pulgadas, con su tabla de producción anual completa
—todas las filas por grupo vegetal y las tres columnas, en lb/acre— y su suelo.
La serie vieja de Montana las publicaba como `52XN Sandy 10 to 14 inch pz`; el
PDF archivado que se probó devolvió 404, así que hay que encontrar dónde vive hoy
(el catálogo EDIT del NRCS responde en `https://edit.sc.egov.usda.gov/catalogs/esd/052/`
y las fichas tienen id del tipo `R052X...MT`). Si la ficha arenosa no existe en
esa unidad, decilo y traé la lista de los sitios que sí existen en la 52N.

**Importante:** esto **no** se pide como `Yp`. Se pide para medir el desfasaje.
No hace falta que la ficha diga nada sobre agua no limitante.

### Blanco 3 — una relación publicada entre rendimiento potencial y suelo

Es el que vale más que los otros dos juntos, sigue abierto, y ahora tiene con qué
validarse: **cualquier relación candidata tiene que devolver ≈1.300 kg/ha en el
sitio arenoso de Sidney, Montana, y ≈2.760 en Mandan, North Dakota** — dos sitios
de pradera mixta a 400 km, con lluvia parecida y una diferencia de 2,1 veces, que
es precisamente lo que una relación de suelo tendría que explicar.

Qué califica: una ecuación o tabla publicada que prediga producción de pastizal
natural **en condición de agua no limitante** —o rendimiento potencial, o techo
de producción— a partir de una o más propiedades medibles del suelo o del sitio.
Con la ecuación completa, los coeficientes, las unidades de cada variable, el
`r²`, el `n` y el rango de validez. Entra con `"id": "relacion"`.

Qué **no** califica, y ya se rechazó una vez: una relación de ANPP contra lluvia.
ANPP no es `Yp` —es producción realizada, no potencial— y convertir una en otra
es inventar. Si lo único que existe es ANPP contra lluvia, **la respuesta correcta
es que no existe la relación pedida**, y eso cierra la pregunta.

Pista no explorada: el trabajo de 1981 deriva de **Hanks (1974)**, *Agron. J.*
66:660-665, y de **Rasmussen y Hanks (1978)**, *Agron. J.* 70:940-944. Los dos
usan el mismo esquema de rendimiento relativo contra transpiración relativa, en
cultivos. Si alguno de los dos explica cómo se obtiene el rendimiento potencial
de un sitio, sirve igual aunque sea en trigo o en cebada: lo que se busca es el
método, y que quede dicho que la calibración es de cultivo y no de pastizal.

---

## Forma de la entrega

Las mismas reglas de siempre: `GPT_LOCAL_REGLAS.md` manda en todo lo que este
archivo no diga. Cada fuente con `label` y `url`. Cada entrada de `vacias` con su
`id` y su motivo. **Un hallazgo que no se encuentra se declara vacío con el
motivo escrito; nunca se rellena con lo más parecido.**

Tres lotes, uno por blanco:

- `entregas\yp\04.json` — blanco 1, Wight y Black (1979).
- `entregas\yp\05.json` — blanco 2, la ficha de la MLRA 52 / RRU 52N.
- `entregas\yp\06.json` — blanco 3, la relación.

Los tres pueden ir en el mismo chat: es un encargo y una carpeta.
