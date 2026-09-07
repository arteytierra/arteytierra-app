# Plan de profundidad — América (Sur, Centro y Norte)

Fecha de medición: 2026-09-06. Instrumento: `scratchpad/audit-america.mjs` (recuento
por bloque de ficha sobre los catálogos de `apps/terreno/lib/`).

## 1. El punto de partida: la cobertura ya está cerrada

Las seis envolventes americanas (Canadá y Ártico, Alaska, EE.UU. contiguo, México,
Centroamérica, Caribe) más la sudamericana devuelven **0 ECO_ID sin ficha**. Esto
está verificado en `COBERTURA_RESOLVE_ENVOLVENTES.md` por enumeración del mapa
RESOLVE, no por una lista armada a mano.

Conclusión que ordena todo lo que sigue: **el trabajo ya no es cubrir más mapa, es
que las 137 fichas americanas que existen digan más de lo que dicen.**

## 2. La medición: tres capas escritas en momentos distintos, muy desparejas

| Capa | Fichas | Saberes | Aptitud propia | Especies | Fuentes | `suelos` |
|---|---|---|---|---|---|---|
| `contexto.ts` (Cono Sur, a mano) | 12 | 2 c/u | 3–4 c/u | 6–7 | 3 | ~100 car. |
| `biomasRegionales.ts` (americanas) | 15 | 2 c/u | **ninguna** | 5 | 3–4 | ~190 car. |
| `biomasRegionalesSudamerica.ts` | 47 | **0** | 8 de 47 | 5+ | 3+ | ~200 car. |
| `biomasRegionalesAmerica.ts` | 53 | **0** | 6 de 53 | **4 en 35** | **<3 en 12** | **~145 car.** |
| `biomasRegionalesCanada.ts` | 10 | **0** | 2 de 10 | 5+ | <3 en 1 | ~350 car. |

Totales americanos: **137 fichas, 109 sin corrección propia de aptitud, 110 sin
ningún saber.**

> **Corrección al leer este número (06/09).** "Sin aptitud propia" no es "sin
> aptitud". Los 15 biomas globales de RESOLVE llevan modificadores, y
> `conAptitudDelBioma` los hereda, así que ninguna ficha muestra la sección
> vacía. La pregunta útil no es cuántas fichas tienen `aptitud` escrito sino
> **dónde lo heredado dice algo falso para esa ecorregión**, que es un blanco
> mucho más chico y mucho más valioso. Ver el bloque 2.

Traducido a lo que ve un usuario: como `ContextoPanel.tsx:112` e `InformeView.tsx:359`
esconden la sección cuando la lista está vacía, **un predio en la Pampa muestra
saberes y uno en Yucatán, Iowa o la Amazonia no muestra ninguno.** La región de la
que menos sabemos es la mejor atendida, y sólo porque fue la primera que escribimos.

Lo que sí está sano: los 105 ids de cultivo usados en todo el catálogo existen los
105 en `especies.ts`. No hay ninguno roto perdiéndose en silencio.

## 3. Los bloques, en orden de lo que más rinde

### Bloque 1 — Activar el primer saber de América

De los 85 saberes de la fase 2, **59 son americanos, los 59 tienen fuente verificable
y 45 declaran ECO_ID compatibles.** De las ocho condiciones de activación de
`lib/saberes.ts`, la 1 y la 7 ya están cumplidas para todos. Falta el polígono con
licencia admitida y el `estado: 'aprobado'`.

Compárese con Europa, donde los 26 saberes tienen `fuentes: []` y están doblemente
bloqueados: acá el trabajo pendiente es cartográfico, no de escritorio.

Orden correcto, que respeta que el polígono es sólo la mitad del permiso:

1. Candidatos **no indígenas** primero, donde alcanza con verificar la licencia del
   polígono: Viñales y el conuco cubano (`cac_vinales_y_conuco_cubano`), Quesungual
   (`cac_quesungual`), ganadería familiar sobre campo natural en Uruguay.
2. Candidatos **indígenas** después, y sólo con acuerdo registrado de la comunidad
   portadora: Xochimilco, el Metepantle, la chakra de Napo. La licencia esperada es
   `comunitaria_con_permiso`, no una licencia abierta.

Licencias admitidas hoy: `CC0-1.0`, `CC-BY-4.0`, `CC-BY-SA-4.0`, `ODbL-1.0`,
`dominio_publico`, `comunitaria_con_permiso`.

**Hecho (06/09) — Quesungual es el primer saber activo de la app.**

- Viñales se descartó: OSM no tiene ninguna geometría de Viñales en Cuba, y el
  polígono de UNESCO no publica licencia reutilizable. Quesungual sí: su regla
  del inventario admite `admin1` de forma explícita y el departamento de Lempira
  está en OSM bajo ODbL, que es una licencia admitida.
- Polígono: relación 4627393 de OpenStreetMap, 78 vías exteriores y 4.941
  vértices, simplificado con Douglas-Peucker a 0,002° → 256 vértices, 4.254 km²
  contra 4.253 km² del original (0,02 % de desvío). Verificado con dos puntos:
  Gracias adentro, Tegucigalpa afuera. Vive en `lib/geometriasSaberes.ts`.
- El polígono es **más amplio que la zona documentada**: la literatura ubica el
  Quesungual sobre todo en Lempira Sur. Es una cota superior honesta, no una
  delimitación del sistema, y así está escrito en el código. Cuando aparezca
  cartografía de los municipios del programa, se reemplaza.
- Se eligió un saber campesino y no de un pueblo originario a propósito: los
  saberes indígenas necesitan el acuerdo **antes** que el mapa.

**Hallazgo que hacía falta arreglar para que "activar" significara algo:** la
capa entera no estaba conectada a la interfaz. `saberesActivos` sólo la llamaban
los tests. Se agregó `/api/saberes` (resuelve el país por Nominatim y corre la
compuerta en el servidor), el hook `useSaberes` y la sección en `ContextoPanel` y
en `InformeView`, con la atribución del polígono que ODbL exige.

- El generador `build-saberes-territoriales.mjs` fijaba `estado` a
  `documentado_sin_geometria` para todos, ignorando el inventario. Ahora lo lee
  del paquete, que es donde corresponde decidirlo.

### Bloque 2 — Aptitud propia donde el bioma global miente

109 de 137 fichas americanas no corrigen nada. No hay que completar las 109: hay que
buscar dónde el bioma global dice algo falso. Desde `componerAptitud` (commit
`2b73a2e`) la región pisa sólo el `uso` que nombra y hereda el resto, así que cada
corrección cuesta una entrada y no borra nada.

El instrumento que faltaba: cruzar cada ECO_ID con su BIOME_NUM de RESOLVE y
listar, por ficha, **la aptitud heredada al lado de la propia**. Con eso a la
vista los errores saltan solos.

Ese insumo ya no falta para ninguna región: `_research/resolve-eco-id-bioma-2026-09-07.json`
tiene los **847 ECO_ID del mundo** con su bioma, nombre y realm, traídos del
FeatureServer con `returnDistinctValues`. Sirve para Asia, África y Oceanía
cuando les toque, sin volver a pedir nada.

**Hecho (06/09) — Sudamérica, 11 fichas + 1 bioma global:**

- El manglar global no hablaba de `forestal` ni de `frutales`, que son las dos
  formas habituales en que un manglar se pierde. Arreglado **una vez** en
  `biomasGlobales.ts`, con efecto sobre los manglares de todo el mundo.
  Lo mismo con `forestal` en roca y hielo.
- **Arenas blancas y areniscas** — campinaranas y pantepui heredaban
  `forestal +20` del bioma húmedo, cuya premisa (reciclado rápido de nutrientes)
  no vale sobre espodosol oligotrófico ni sobre cumbre de arenisca.
- **Bosque del que queda poco** — mata atlántica costera e interior, araucaria y
  restingas heredaban el mismo `+20` forestal. Pasan a `0` con razón escrita:
  agroforestal sobre lo ya abierto, no manejo del remanente.
- **Islas oceánicas** — Juan Fernández y las Desventuradas heredaban
  `frutales +10` del bosque templado caducifolio, que es exactamente lo que no
  corresponde donde las invasoras son la amenaza principal. Malpelo queda sin
  ningún uso agrícola en positivo. Galápagos y Rapa Nui reciben aptitud propia.
- Rapa Nui **no** se declara improductiva: el manavai es un sistema probado en la
  isla y la huerta queda en positivo. La corrección tiene que distinguir "acá no
  se puede" de "acá no se puede así".

**Hecho (07/09) — Norteamérica, México y el Caribe: 4 fichas + 1 bioma global.**
Se revisaron las 63 fichas de los catálogos de América y Canadá, ficha por ficha
y bioma por bioma (varias tocan tres o cuatro biomas distintos). Sólo cuatro
tenían la herencia equivocada:

- **Revillagigedo** heredaba `pasturas +10` del bosque seco tropical. El ganado
  introducido fue el daño principal del archipiélago —las ovejas de Socorro se
  erradicaron tras décadas de erosión— y las islas están deshabitadas.
- **Matorrales altos y bajos de Hawái** heredaban `pasturas +20` de la sabana
  tropical. La ganadería de altura y las gramíneas forrajeras introducidas son la
  presión principal, y traen un ciclo de fuego que antes no existía.
- **Everglades** — lo que decide no es la fertilidad sino el drenaje: la turba
  sobre caliza se oxida, el suelo se hunde y después arde bajo tierra.
- **Alto Ártico, desierto polar** — la tundra global deja `pasturas` sin
  modificador **a propósito**, porque el caribú y las ovejas del sur de
  Groenlandia pastan tundra de verdad. Con menos de 150 mm al año y cobertura
  por debajo del 20 %, acá no. La negativa la pone la ficha regional, que es
  donde corresponde.
- **Bioma global:** la tundra no decía nada de `forestal`, siendo que "más allá
  del límite del bosque" es literalmente su definición. Arreglado una vez.

**Y algo que conviene anotar porque ahorra trabajo:** el Palouse y su loess, la
Gran Cuenca y la meseta del Colorado —los tres que este mismo plan había marcado
como sospechosos— **heredan bien**. El pastizal templado y el desierto ya dicen
lo correcto para ellos. El problema ahí es de texto, no de aptitud, y va al
bloque 3.

**Hecho (07/09) — Europa, Medio Oriente y norte de África: 5 fichas.** Son 78
fichas en cuatro catálogos (Europa occidental, resto de la UE y asociados,
Medio Oriente, norte de África), las 78 con ECO_ID mapeado. Cinco heredaban
mal, y una de ellas la rompí yo el día anterior:

- **Abedular montano escandinavo** — *regresión propia*. Al ponerle
  `forestal -35` a la tundra global, esta ficha —que es literalmente el último
  bosque antes del pastizal alpino— pasó a heredar que acá no se foresta. Ahora
  dice lo que corresponde: el bosque ya está, lo que sobra es sustituirlo por
  plantación de conífera. La lección es que un modificador global nuevo hay que
  cruzarlo contra **todas** las fichas que cuelgan de ese bioma, no sólo contra
  la que motivó el cambio.
- **Estepa siria (badia)** — el caso más claro de todos. Heredaba `huerta +10`
  del pastizal templado, que está calibrado sobre chernozem (Pampa, Ucrania).
  La ficha dice literalmente lo contrario en su propio resumen: "tierra de
  pastoreo desde hace milenios, no de cultivo, y casi todo lo que salió mal acá
  salió mal por confundir las dos cosas". `pasturas +20` se deja tal cual: ahí
  la corrección tiene que distinguir "acá no se puede" de "acá no se puede así".
- **Meseta de Anatolia** — mismo `huerta +10` heredado. El suelo da; lo que no
  da es el agua. La cuenca de Konya lleva décadas de bombeo por encima de la
  recarga, con subsidencia y dolinas de colapso.
- **Chotts y sebkhas** — heredaban `pasturas +5` del pastizal inundable, que
  supone crecida dulce estacional. Un chott es lo contrario: es donde termina
  la sal de toda la cuenca.
- **Grandes arenales (Nefud y Rub al-Jali)** — el desierto global está calibrado
  sobre desiertos con agricultura real. Acá no hay asentamiento permanente.
  `pasturas` se deja heredado a propósito: el pastoreo camellero del corredor
  interdunar existe.

**Y una que se decidió no tocar:** las cuencas endorreicas de Irán central. El
fondo salino y el abanico aluvial con qanat conviven en la misma ficha, así que
un modificador único mentiría en una de las dos mitades. Es un problema de
texto —de gradiente dentro de la ficha—, no de herencia.

**De paso:** `biomasRegionalesEuropa.ts` decía "ARCHIVO GENERADO. No editar a
mano" y **no tiene generador**, exactamente igual que el catálogo americano. El
encabezado quedó corregido.

**Pendiente:** el resto del mundo —África subsahariana, Asia y Oceanía— con el
mismo método y la tabla que ya está descargada.

### Bloque 3 — Espesar el paquete de EE.UU., México y el Caribe

Es el más flaco: **35 fichas con sólo 4 especies nativas, 12 con menos de 3 fuentes,
`suelos` en ~145 caracteres contra los ~350 de Canadá.** El texto de suelos importa
más de lo que parece porque es de donde sale el razonamiento de la aptitud: una ficha
que dice dos líneas de suelo no puede sostener una corrección.

**Cuidado — y acá había una mina (verificado y desactivado el 06/09):**

- `montar-sudamerica.mjs` **sí** reescribe `lib/biomasRegionalesSudamerica.ts`, y
  no emitía `cultivos` ni `aptitud`: correrlo borraba 73 líneas de trabajo hecho
  a mano encima de lo generado, sin avisar. Se comprobó corriéndolo contra una
  copia. Arreglado: los dos campos se migraron al JSON del paquete y el generador
  ahora los emite; regenerar deja el archivo idéntico.
- `biomasRegionalesAmerica.ts` decía "ARCHIVO GENERADO, no editar a mano" y
  **no existe ningún script que lo regenere**. Quien respetara el encabezado no
  podía corregir nada. Encabezado corregido: hoy se mantiene a mano.
- `biomasRegionalesCanada.ts` siempre fue a mano y su encabezado ya lo decía.

Trabajo editorial puro, por tandas de diez.

### Bloque 4 — Datos duros, y un hueco de encuadre en el relevamiento

El relevamiento de `fuentes-suelo-clima/` buscó **servicios nacionales vivos**, y por
eso Sudamérica quedó casi vacía: para clima sólo tenemos NASA POWER, mientras
Norteamérica y México ya tienen Daymet a 1 km.

- **Uruguay MGAP/CONEAT** es la única fuente de suelo sudamericana que pasó licencia
  y sigue sin implementar. Era la prioridad 1 del relevamiento.
- **El adaptador WIS2 compartido** cubre 8 países de una, pero entrega observaciones
  de estación, no climatologías. **No reemplaza a POWER** para lo que la app calcula;
  conviene decirlo así y no sobrevenderlo.
- **Hueco no evaluado: climatologías globales de 1 km.** CHELSA V2.1 es CC BY 4.0 y
  es exactamente la forma de producto que el motor necesita. Hay que **verificar** la
  licencia y la vía de consulta por punto, no darlo por hecho.
- **Relieve:** el CEM de INEGI a 15 m para México **nunca se evaluó** — el audit de
  DEM cubrió EE.UU., Canadá y Europa y saltó México. Argentina quedó afuera a
  propósito por licencia y Ecuador por copyleft (ver el comentario de
  `lib/elevacion/router.ts`); si el IGN cambió condiciones vale revisarlo, pero eso
  es una consulta, no una tarea de código.

### Bloque 5 — Re-correr la enumeración de envolventes

`_research/enumerar-cobertura-resolve.mjs` como verificación de regresión después de
tocar el catálogo. Barato. No se espera que aparezca nada.

## 4. Recomendación

Bloques 1 y 2 juntos, en ese orden. El 1 estrena una capa entera ya construida y
probada; el 2 es barato ahora y caro después. El 3 consume más horas y se nota menos:
va de fondo, por tandas. El 4 todavía no es programar — son dos verificaciones de
licencia (CHELSA y el CEM mexicano) antes de escribir una línea.
