# Fase 4 — Wallacea: cinco fichas en cero sobre islas volcánicas

*Va junto con `ENCARGO_FASE_4_FICHAS_INDOMALAYA.md` —de ahí salen el formato de
salida y las reglas— y `ANEXO_IDS_CULTIVOS.md`. Entregas en
`C:\Arte y Tierra\encargos-gpt\entregas\fichas-wallacea\NN.json`, **carpeta
nueva**, **una ficha por archivo**, del `01` al `05` en el orden de la sección 4.
Fecha: 21/11/2026.*

---

## 1. Por qué este lote y no otro

El hueco quedó medido el 11/11/2026: de las **106 ecorregiones de Indomalaya, 42
tienen ficha**, y de las que heredan el bioma global de bosque tropical húmedo
quedan **68 sin ninguna** entre Indomalaya y Australasia. Australasia está casi
en cero: **2 fichas de 83**.

De todo lo que queda, **Sulawesi y las Molucas es el lote que más rinde**, por
tres razones que se suman:

1. **Son cinco fichas en cero sobre islas con población rural densa**, no sobre
   un archipiélago deshabitado.
2. **El modificador que heredan está escrito sobre otro suelo.** El bioma global
   `resolve_bosque_tropical_humedo` pone `huerta −25` con esta razón: «en los
   suelos lixiviados que dominan el bioma la fertilidad está en la biomasa viva y
   no en el suelo». Eso describe el oxisol amazónico. Acá hay arco volcánico
   activo, y un andisol joven es **lo contrario** de un suelo lixiviado.
3. **Y hay una vuelta de tuerca que este lote tiene y los anteriores no.** En el
   relevamiento de Indomalaya las volcánicas resultaron una falsa alarma en buena
   medida: los andisoles estaban en los conos y no repartidos por la ecorregión,
   y de 13 fichas sólo 6 propusieron corrección. Acá el candidato a desmentir el
   −25 convive con un candidato a **confirmarlo por un mecanismo completamente
   distinto**, que es la sección 2.

**Ninguno de los cinco ECO_ID tiene ficha hoy** —se verificó en los once
catálogos de `lib/ecorregiones*.ts` el 21/11/2026—, así que los cinco muestran
hoy el texto y los deltas del bioma global y nada más.

---

## 2. La pregunta que vale más que las cinco fichas juntas

**En estas islas el suelo puede tirar para los dos lados, y el reparto por área
es lo que decide el número.**

De un lado, el **arco volcánico**: andisoles jóvenes, derivados de ceniza, con
buena estructura y reservas de nutrientes, que es donde está la agricultura
intensiva de Minahasa, de Bolaang Mongondow, del norte de Halmahera.

Del otro, y es lo que hace interesante a este lote, el **cinturón ultramáfico**.
El arco oriental de Sulawesi tiene uno de los mayores afloramientos de ofiolita
del mundo: la literatura publica **más de 10.000 km²** en un trabajo y **más de
15.000 km² con 700 km de largo** en otro —las dos cifras están en circulación y
**no coinciden**, así que si usás una, decí cuál y de dónde—, con la masa
peridotítica en torno al 70 % del conjunto. Halmahera tiene lo suyo, que es por
lo que ahí hay minería de níquel a escala, y Seram y Buru tienen afloramientos
propios.

Y el suelo que sale de ahí es **casi el peor caso agrícola posible**, por
mecanismos que no son el del oxisol amazónico: deficiencia de fósforo y potasio,
**desbalance catiónico con relación calcio-magnesio muy baja**, y
concentraciones fitotóxicas de níquel, cromo y cobalto. No es «poca fertilidad»:
es un suelo que envenena a la planta que no está adaptada, y la flora
serpentinícola es endémica justamente por eso.

**Lo que se pide, entonces, no es un número: es el reparto.** Para cada
ecorregión:

- qué fracción del polígono es volcánica reciente, qué fracción es ultramáfica y
  qué fracción es ninguna de las dos (caliza, aluvión, metamórfico);
- y si ese reparto está publicado o si es una lectura tuya de un mapa geológico
  —decilo, cambia la confianza de la ficha.

**Si la ecorregión no se puede resumir en un solo delta, decilo con esas
palabras.** Es una respuesta válida y mejor que un promedio: acequia puede
imprimir un modificador con la razón explicando que depende del substrato, y el
usuario está parado en un lugar concreto. Lo que no sirve es un −10 de compromiso
sin mecanismo, que es el error que ya costó un lote entero en el Pilbara: **un
delta se justifica con un mecanismo, no con la existencia de un documento.**

Una búsqueda directa del 21/11/2026 encontró geología y minería de níquel en
abundancia y **nada sobre agricultura en esos suelos**. Puede que no exista, y si
no existe **eso también es una respuesta**: ponelo en `notas` y mandá el
modificador con confianza baja o sin proponerlo.

---

## 3. Lo que NO hay que pedir, buscar ni repetir

- **Los campos agronómicos del sagú y del jelutong.** Se pidieron dos veces en la
  fase 4 y no volvieron; no se piden de nuevo. Si una fuente de este lote los
  trae de regalo, anotalo en `notas` y seguí. Lo que sí interesa del sagú acá es
  **el sistema**: las Molucas son su territorio histórico y si hay un manejo
  fechado de palmar de sagú eso es una **práctica**, que va por el encargo de
  prácticas y no por este.
- **Un id de cultivo que no esté en `ANEXO_IDS_CULTIVOS.md`.** Rompe el montaje.
  El sagú no tiene id: si el cultivo que manda en la isla es el sagú, el campo
  `cultivos` lleva los que sí existen y el sagú se explica en `notas`. Ya pasó y
  se resolvió así en las turberas.
- **Heredar el reparto de suelos del polígono vecino.** El 156 y el 157 son la
  misma isla a dos alturas y **no tienen el mismo suelo**; Halmahera, Buru y
  Seram son tres islas distintas con tres geologías distintas. Las fichas de las
  turberas entraron con confianza media por declarar explícitamente que no
  heredaban.
- **Wikipedia como fuente**, nunca. Sirve para encontrar el nombre de un lugar o
  de una especie y después hay que ir al original. Tampoco ResearchGate,
  Academia.edu ni Scribd: hay un test que rechaza esos dominios.

---

## 4. Los cinco lotes

**Rutas probadas el 21/11/2026**, con el código y el tamaño que devolvieron. Las
diez abren. Están para que no gastes presupuesto buscando la puerta:

| ECO_ID | One Earth | Wikipedia (sólo para orientarte) |
|---|---|---|
| 156 | `https://www.oneearth.org/ecoregions/sulawesi-lowland-rainforests/` — 200, 61.731 B | `.../Sulawesi_lowland_rain_forests` — 200 |
| 157 | `https://www.oneearth.org/ecoregions/sulawesi-montane-rainforests/` — 200, 60.026 B | `.../Sulawesi_montane_rain_forests` — 200 |
| 140 | `https://www.oneearth.org/ecoregions/halmahera-rainforests/` — 200, 60.761 B | `.../Halmahera_rain_forests` — 200 |
| 138 | `https://www.oneearth.org/ecoregions/buru-rainforests/` — 200, 61.617 B | `.../Buru_rain_forests` — 200 |
| 151 | `https://www.oneearth.org/ecoregions/seram-rainforests/` — 200, 60.992 B | `.../Seram_rain_forests` — 200 |

**Ojo con el slug de One Earth**: es `-rainforests`, en una palabra. Con
`-rain-forests` devuelve un **404 que pesa 47.317 bytes de HTML**, que de lejos
parece una página buena. Es la quinta variedad de la trampa del 200: acá el
código es 404 y el tamaño miente.

### 4.1 · Lote 01 — ECO_ID 156, Sulawesi lowland rain forests

El grande y el que más decide: las tierras bajas de las cuatro penínsulas.
Adentro caen Minahasa y el valle de Palu, que son dos agriculturas distintas, y
el arco oriental con la ofiolita. Nombre de ficha propuesto: `sulawesi_bajo`.

### 4.2 · Lote 02 — ECO_ID 157, Sulawesi montane rain forests

La montaña, con los lagos de Poso y los Malili y la meseta de Toraja. Acá hay
agricultura de ladera documentada y arroz de terraza. Nombre propuesto:
`sulawesi_montano`.

### 4.3 · Lote 03 — ECO_ID 140, Halmahera rain forests

Arco volcánico activo y, al mismo tiempo, el ultramáfico de la bahía de Weda.
Las dos cosas en una isla chica: es el caso donde el reparto por substrato
importa más. Nombre propuesto: `halmahera`.

### 4.4 · Lote 04 — ECO_ID 138, Buru rain forests

La más chica y la menos relevada de las cinco. Si la fuente no alcanza, **decilo
y mandala a `vacias` con lo que intentaste**: una ficha floja sobre una isla
sobre la que nadie publicó es peor que ninguna, porque un delta inventado se
imprime igual que uno medido. Nombre propuesto: `buru`.

### 4.5 · Lote 05 — ECO_ID 151, Seram rain forests

Montaña alta, el Manusela, y el territorio del sagú. Nombre propuesto: `seram`.

---

## 5. Cómo se mide si este lote salió bien

No por cuántas fichas entraron. Por si **el `huerta −25` quedó mejor justificado
que antes**, en cualquiera de las tres direcciones posibles:

- **se desmiente** porque el reparto muestra andisol y agricultura intensiva, y
  entonces va un delta más alto con el mecanismo escrito;
- **se confirma por otro mecanismo** —el ultramáfico, el desbalance Ca:Mg, el
  níquel—, y eso es tan valioso como desmentirlo, porque hoy está confirmado por
  el motivo equivocado;
- **o no se puede decidir con lo publicado**, y queda escrito que no se puede.

Las tres cierran una pregunta. La única que no cierra nada es un delta sin
mecanismo.

---

## 6. El formato de salida

El de `ENCARGO_FASE_4_FICHAS_INDOMALAYA.md`, sección del bloque JSON, sin
cambios. Recordá de ahí las dos cosas que más costaron:

1. **El ejemplo es una forma, no una respuesta**: lo que está entre ángulos se
   reemplaza, y ningún valor del ejemplo es la contestación de ningún lote.
2. **Ninguna URL entra sin abrirse**, y el `label` se copia del título que la
   página muestra, no se redacta.

Y una de este lote: `_meta.ecorregiones_resolve` lleva **un solo ECO_ID** en cada
archivo, y `_meta.nombre_resolve` el nombre en inglés tal como lo escribe
RESOLVE.
