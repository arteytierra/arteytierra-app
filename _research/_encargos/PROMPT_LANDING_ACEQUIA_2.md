# Prompt para el agente de la landing `acequia.app` — segunda entrega

*Pegar esto completo en una sesión nueva, en el repositorio
`arteytierra/acequia-landing`. No hace falta nada más.*

---

Trabajás en la vidriera de **acequia**, el sitio `acequia.app`, que vive en este
repositorio. La aplicación está en **otro** repositorio y en otro proyecto de
Vercel: no la tenés a mano y no hace falta. Todo lo que necesitás saber de ella
está en este pedido o te lo da un endpoint público que ya existe.

Se responde y se escribe en **español argentino**, en el código y en los
mensajes de commit.

Son **tres fases** y hay una parada después de cada una. **La fase 1 es urgente
porque el sitio hoy afirma cosas falsas sobre el precio y sobre la prueba
gratis.** La fase 2 es la grande y la que más valor agrega. La fase 3 es una
revisión página por página.

Hay un pedido anterior a éste (`PROMPT_LANDING_ACEQUIA.md`). Su fase 1 está
hecha —el sitio ya arma las tarjetas desde el catálogo publicado y ya existe la
sección de las 34 funciones— y **su fase 2 no**: no hay página `/metodo` en el
sitemap. Esa fase 2 queda absorbida por la fase 2 de este pedido, que la
reemplaza y la amplía. No trabajes las dos.

---

# Fase 1 — El sitio está anunciando un precio y una prueba que ya no existen

## Lo que cambió en la aplicación el 23 de noviembre de 2026

Tres decisiones de Jonatan, ya desplegadas y cobrando:

1. **La prueba sin cargo es sólo del plan Personal.** Antes la prueba era del
   checkout y no del plan: el alta de cualquier plan contratable arrancaba con
   tres días en cero. Ahora **Profesional y Estudio se cobran desde el primer
   día**. Quien quiera mirar antes de pagar empieza la prueba en Personal y, al
   terminarla o durante, pasa al plan que quiera: eso lo resuelve el checkout,
   que cierra la suscripción anterior en el proveedor antes de abrir la nueva,
   así que no hay dos débitos.
2. **Profesional pasó de USD 15 a USD 20 por mes, y Estudio de 35 a 40.** El
   anual sigue siendo diez meses: 200 y 400. La frase «2 meses gratis» del
   selector de período sigue siendo cierta.
3. **El piloto fundador pasó a ser el plan Profesional sin costo durante seis
   meses** (180 días), en vez de Personal durante una semana. Sigue siendo sin
   tarjeta, con código de acceso, de 6 a 10 participantes.

Por qué la prueba es de Personal y no de otro plan, que es el argumento que la
vidriera puede usar y conviene que use: **Personal ya habilita todo el análisis
y todo el diseño.** Son 27 de las 34 funciones con candado. Lo único que
Profesional agrega encima es el informe con marca propia, y los diez proyectos.
O sea que la prueba de Personal muestra el producto entero, no una versión
recortada. Hay un test en el repositorio de la app que lo defiende: si algún día
una función de análisis o de diseño pasara a Profesional, ese test rompe.

## Los renglones que hoy son falsos, uno por uno

Están transcriptos del sitio en producción. Los marco con **F** (falso hoy) o
**V** (viejo, hay que actualizar el número, y eso lo resuelve el snapshot).

**Home (`/`)**

- **F** · Botón del encabezado y del hero: «Empezar 3 días». Está bien para
  quien va a Personal, y es lo que pasa si el botón lleva al registro y después
  a Personal. Verificá a dónde lleva: si lleva a elegir plan, el texto promete
  tres días sobre cualquiera de ellos.
- **F** · Bajo el hero: «Acceso completo por 3 días. Requiere medio de pago y
  podés cancelar antes del primer cobro.» Falta decir de qué plan.
- **F** · Sección de planes: «**Probá cualquier plan pago durante 3 días.** Hoy
  no se cobra; al finalizar comienza la suscripción elegida si no cancelás.»
  Esto es exactamente lo que dejó de ser verdad.
- **F** · Tarjeta de Profesional: botón «**Probar 3 días**». Tiene que decir
  algo como «Suscribirme» o «Empezar con Profesional».
- **V** · Tarjeta de Profesional: «USD 15 / mes». Y Estudio: «USD 35 / mes».
- **F** · CTA del final: «Creá tu cuenta, elegí un plan y accedé durante 3 días
  a todas sus funciones» y el botón «Empezar prueba».

**Planes (`/planes`)**

- **F** · Bajada: «**Empezá con 3 días de acceso completo al plan pago que
  elijas.** El primer cobro se realiza al terminar la prueba si no cancelás.»
- **F** · Tarjeta de Profesional: botón «Probar 3 días».
- **V** · Los dos precios.
- **F** · La sección «Una prueba clara» entera, los cuatro pasos: «1 Elegís tu
  plan — Mensual o anual, antes de crear la cuenta · 2 Autorizás el pago — Hoy
  no se realiza ningún cobro · 3 Usás todo por 3 días · 4 Decidís». El paso 2
  es falso para Profesional y Estudio. Esta sección hay que reescribirla
  diciendo que son **dos caminos distintos**, no uno.
- **F** · FAQ «¿Cuándo se cobra?»: «El primer cobro se intenta al finalizar los
  3 días de prueba.» Hay que separar los dos casos.
- **F** · FAQ «¿Puedo cancelar durante la prueba?» — la respuesta está bien pero
  presupone que todos tienen prueba.

**Piloto (`/piloto`)** — todo el eje temporal de la página cambió:

- **F** · «…quieran probar la plataforma **durante una semana**, con
  acompañamiento directo.»
- **F** · «01 Una semana de prueba guiada».
- **F** · El bloque «La semana piloto» completo, con su cronograma de Día 1 a
  Día 7.
- **F** · «Qué necesitás: Un predio y **aproximadamente dos horas en total**.»
- **F** · «Qué recibís: Ingreso sin costo y sin tarjeta» — sigue siendo cierto
  pero ahora se puede decir mucho mejor: **el plan Profesional completo, sin
  costo, durante seis meses.** Es la oferta más fuerte que tiene el sitio y hoy
  está escrita como si fuera una demo de una semana.
- Qué sí se queda textual: «Sin costo ni tarjeta», «Buscamos entre 6 y 10
  personas», el bloque «Qué queremos aprender» y el formulario.
- **F** · El encabezado dice «Programa fundador · **Cupo cerrado**» y abajo hay
  un formulario abierto que dice «Quiero participar». Ya está decidido por
  Jonatan el **23/11/2026: el cupo queda abierto.** Sacá ese rótulo o cambialo
  por uno que diga que la convocatoria está abierta, y dejá el formulario como
  está. Lo que no se toca es el tamaño del grupo: siguen siendo **entre 6 y 10
  personas**, y eso es parte de la oferta —hay acompañamiento directo—, no una
  escasez inventada. Si algún día se llena, se cierra con un rótulo; hoy no.

**Un criterio para reescribir el cronograma del piloto.** No lo estires de siete
días a seis meses multiplicando: el sentido del cambio es otro. Seis meses no es
«más tiempo para explorar funciones», es **que el participante cruce estaciones**.
El calendario agrícola, el balance hídrico mes a mes y el descanso del pastoreo
sólo se pueden juzgar contra la época del año en que se los lee; una semana de
noviembre no dice nada sobre la ventana de siembra de marzo. Y lo que se busca
no cambió: que alguien lleve **un predio real de punta a punta** y vuelva a
entrar en la época siguiente. Si el cronograma se reescribe, que sea con esa
idea: un arranque acompañado, una entrega de diseño, y una vuelta en la
estación siguiente.

## La fuente única, y lo que agregó

El endpoint es el mismo de siempre:

```
GET https://arteytierra.org/api/terreno/estado-pagos
```

Público, sin clave, con CORS para `https://acequia.app`, y sale del mismo
paquete de configuración que usa el cobro. **Consultalo antes de escribir una
línea de esta fase**: lo que conteste es lo que está desplegado cobrando, y mi
información puede ser más vieja que él.

Lo que agregó el 23/11/2026:

```json
{
  "prueba": true,
  "diasPrueba": 3,
  "planPrueba": "personal",
  "planes": {
    "semilla":     { "mensual": null, "anual": null, "proyectos": 1,  "cuentas": 1, "checkoutPropio": false, "pruebaDias": 0 },
    "personal":    { "mensual": 7,    "anual": 70,   "proyectos": 2,  "cuentas": 1, "checkoutPropio": true,  "pruebaDias": 3 },
    "profesional": { "mensual": 20,   "anual": 200,  "proyectos": 10, "cuentas": 1, "checkoutPropio": true,  "pruebaDias": 0 },
    "estudio":     { "mensual": 40,   "anual": 400,  "proyectos": 10, "cuentas": 5, "checkoutPropio": false, "pruebaDias": 0 }
  }
}
```

Cómo se lee lo nuevo, y es importante:

- **`pruebaDias` es por plan y es el que manda en la tarjeta.** `diasPrueba`, el
  de arriba, es el de Personal y no sirve para decidir el botón de otra tarjeta:
  usarlo es exactamente cómo aparece un «Probar 3 días» sobre un plan que cobra
  hoy. La regla para el botón es una sola: **si `pruebaDias` es 0, la tarjeta no
  puede decir «probar» ni «gratis» ni «hoy no se cobra».**
- **`planPrueba`** está para poder nombrar el plan en prosa sin deducirlo de los
  ceros, en frases como «la prueba sin cargo es del plan Personal».
- `checkoutPropio: false` sigue significando que el alta pasa por una persona:
  Semilla (se resuelve con el registro) y Estudio (sus cinco cuentas se dan de
  alta a mano). Un plan con `checkoutPropio: false` **no puede tener un botón
  que lleve al checkout**.

Según mis notas, en este repositorio ya existe la maquinaria para esto y sólo
hay que usarla: **`npm run planes:traer`** congela el catálogo en
**`data/planes.json`**, las cuatro tarjetas se arman desde ahí, y
**`tests/catalogo-sincronizado.test.ts`** compara la instantánea contra el
endpoint etiqueta por etiqueta y salvedad por salvedad en cada `npm run check`
(con `SIN_RED=1` para saltearlo). **Verificá que esos tres nombres existan
todavía antes de confiar en ellos**; si cambiaron, usá lo que haya.

Lo que **no** se congela, y esto ya fue un bug: `pagos`, `prueba` y `diasPrueba`
son el estado de quien cobra, cambian con un redeploy del otro lado y
congelarlos deja la vidriera anunciando lo contrario de lo que pasa. Fijate de
qué lado cae `pruebaDias`: va adentro de `planes`, así que viene con la
instantánea, **pero es una regla del producto y no una bandera de entorno** —no
cambia con un redeploy—, así que congelarlo está bien y el test lo va a
comparar igual.

Si algo de eso no estuviera, armalo ahora: ningún precio, ningún tope y ninguna
frase escritos a mano en un componente, y la build falla si el catálogo no se
pudo traer. Nunca una tarjeta con un precio de relleno.

Y revisá que los `Offer` del JSON-LD salgan del **mismo** snapshot. Si quedaron
tres precios escritos ahí, son un tercer lugar donde el número envejece.

## Lo que no se toca en esta fase

- **`robots.txt` se queda como está, con `Disallow: /`.** Es decisión de
  Jonatan. No lo cambies, no lo discutas en el código y no agregues un
  `llms.txt`.
- **Nada de SEO** mientras el sitio esté cerrado al rastreo: ni `sitemap.xml`,
  ni `lastmod`, ni schema nuevo. Lo que sí importa son las etiquetas **Open
  Graph**, porque los previsualizadores de WhatsApp y Telegram siguen andando
  con el sitio cerrado y casi todo el tráfico va a llegar por un link
  compartido. Si tocás metadatos, verificá que `og:image`, `og:title` y
  `og:description` sigan saliendo.
- El aviso del pie —«La información es orientativa y no reemplaza estudios
  profesionales ni relevamientos de campo»— **se queda, textual**.
- Las credenciales de Vercel y de Cloudflare no se tocan.

**Antes de cerrar la fase 1:** mostrale a Jonatan el antes y el después de las
cuatro tarjetas de precio y de los seis renglones de prueba, renglón por
renglón.

---

# Fase 2 — La mitad del producto no está nombrada en ningún lado

## El diagnóstico, y por qué la sección de las 34 funciones no lo resuelve

La home dice, con razón, «Las 34 funciones de acequia, enteras y sin letra
chica». Y están las 34. El problema es otro: **esas 34 no son las funciones, son
los permisos.** Es la matriz que decide qué desbloquea cada plan, y por eso cada
renglón agrupa cosas que no se parecen entre sí. Tres ejemplos del mismo
listado:

- «**Obras de agua: swales, zanjas y represas**» es un renglón. Adentro hay: el
  buscador de sitios donde el terreno cierra solo, la deducción del vaso del
  embalse a partir del muro, el diseño del muro contra el manual de la agencia,
  el balance mensual del embalse con su confiabilidad, el movimiento de suelo,
  el vertedero, el camellón ancho con surco a pendiente para suelo expansivo, el
  desagüe de parcela y el cauce empastado.
- «**Red de conducción y riego por gravedad**» es un renglón. Adentro hay un
  motor hidráulico completo: pérdida de carga, línea piezométrica sobre el
  perfil real del terreno, velocidad, clase de caño, dónde van las ventosas, y
  el cálculo inverso de «qué diámetro compro».
- «**Plan maestro sugerido para el predio**» es un renglón. Adentro hay
  diecisiete tipos de elemento —de la casa al gallinero— que el motor dimensiona
  y ubica, y un módulo de emplazamiento que distingue lo prohibido de lo caro.

Un visitante que lee la lista entiende el **alcance** del producto y no entiende
**qué hace**. Y las cosas que más convencen a un profesional son precisamente
las que quedan adentro de un renglón.

Esto tampoco se arregla alargando la lista a 120 renglones. Lo que hace falta es
otra cosa: **una página que muestre lo que hay adentro, con los números y las
fuentes a la vista.** La lista de 34 se queda donde está, que para lo que sirve
—saber desde qué plan está cada cosa— está bien.

## Qué construir

Una página pública nueva. Nombre sugerido **`/que-calcula`**, y si preferís
`/metodo` está bien también, pero entonces es ESTA página y no otra: no hagas
dos. Linkeada desde la sección «Metodología visible» de la home, desde
`/planes` (al lado de «Comparar todos los planes») y desde `/primeros-pasos`.

La estructura que quiero:

1. **Una entrada de cuatro líneas** con el contrato de la casa, que es lo único
   que hace distinta a acequia y lo que la lista de 34 no puede decir: todo lo
   que calcula una magnitud física tiene **fuente citada, unidades explícitas,
   rango de validez declarado y un test contra un caso resuelto de la
   literatura**. No es una aspiración: es el contrato que cumple cada motor, y es
   la razón por la que la app te dice «este número sale de un modelo global de
   30 m y no de uno nacional de 1 m» en vez de mostrar las dos cosas iguales.
2. **Seis bloques temáticos**, los de abajo. Cada bloque abre con una frase de
   para qué sirve y después enumera lo que tiene adentro.
3. En cada bloque, **al menos un caso con número y fuente**. Un número con
   fuente convence más que diez adjetivos, y se puede ir a verificar.
4. Y en cada bloque, **el límite**. Es la parte que casi nadie publica y es la
   que vende a un profesional: nadie le cree a un software que no dice para qué
   no alcanza.

## El inventario, verificado contra el código de la aplicación el 23/11/2026

**Todo lo que sigue está leído del código de la app, no de un folleto.** Los
números son los que van: no agregues ninguno, no redondees ninguno y no inventes
ninguno. Si te falta un dato para que una frase cierre, **preguntá antes de
publicarla**. Y si algo de acá choca con lo que ves en el sitio, es más probable
que mi información esté vieja que que el sitio esté mal: decilo antes de
resolverlo solo.

### Bloque 1 · El agua: de dónde viene, dónde se guarda y por qué caño pasa

Es el bloque más grande de la aplicación y el que menos aparece en el sitio.

**Represas.** La app busca los **sitios donde el terreno cierra solo** y, para
cada cierre, deduce el espejo de agua. Lo importante es el orden: **el usuario
elige el muro y el vaso lo encuentra el terreno.** Antes el volumen se sumaba
sobre el polígono dibujado, y eso fallaba de tres maneras: contaba agua que no
se queda ahí, dejaba subir el pelo de agua por encima de la silla de montar por
la que el agua se iría, y —al revés— subestimaba justamente al muro más
eficiente que existe, el que cierra una hoya que ya estaba.

El muro se diseña contra **USDA SCS (1997), «Ponds — Planning, Design,
Construction», Agriculture Handbook 590**, que es gratuito y de agencia pública,
así que cualquiera puede ir a verificar cada número. Lo que esa fuente arregló
vale como caso: el ancho de la corona, los taludes, la revancha y la zanja de
anclaje venían de «criterio corriente», sin tabla, y **los cuatro caían del lado
inseguro, con el error creciendo con la altura del muro**. Un muro más angosto y
con taludes más parados es un muro más barato en la pantalla y más frágil en el
campo.

Y el embalse tiene un **año**: balance mes a mes de lo que entra por escorrentía
contra la evaporación del espejo, la infiltración del vaso y la demanda de
bebida y riego, iterado hasta converger para sacarle el sesgo de la condición
inicial, y con una **confiabilidad en porcentaje de meses que cubren la
demanda**. La evaporación del espejo no es la evapotranspiración de referencia y
tampoco un factor constante: sale del **cuadro 12 de FAO-56** y distingue el
vaso somero del embalse hondo.

*El límite:* el modelo dice dónde cierra el vaso, no cuánto aguanta el muro. Eso
lo deciden una calicata y un proyecto. La página ya lo dice bien en la sección
«Un predio, cuatro lecturas» de la home; que lo siga diciendo acá.

**La red de agua por tubería.** Pérdida de carga por fricción con
**Hazen-Williams**, presión estática y dinámica en metros de columna de agua,
**línea piezométrica dibujada sobre el perfil real del terreno** de la traza,
velocidad, clase de caño (PN), y el cálculo que más se usa: el inverso, «qué
diámetro compro». Suma el caudal de los artefactos de la casa con su coeficiente
de simultaneidad, y tiene el coeficiente —que es otro— para la simultaneidad
**entre viviendas** de un conjunto.

Dos piezas que casi ningún software de predio tiene:

- **Dónde va una ventosa.** Una cañería que sube y baja junta aire en los puntos
  altos, el aire no se va solo y la burbuja estrangula la sección: la línea
  pierde caudal **sin que se rompa nada y sin que haya nada que ver**. Es la
  falla más difícil de diagnosticar de una red rural, porque el síntoma es
  «llega menos agua que antes» y la causa está enterrada en una loma a 300 m.
- **La manguera móvil**, que es la instalación más común de un predio chico y la
  que peor se dimensiona —se elige por el diámetro que había en la ferretería y
  se descubre que no llega cuando ya está desenrollada—. Se calcula con el
  coeficiente de una manguera, que no es el de un caño.

Las redes de servicio se trazan y se miden con el **código de colores de
señalización de servicios enterrados que se usa en obra**: azul agua, amarillo
gas, rojo electricidad, marrón cloacas, naranja telecomunicaciones, para que el
plano se lea igual que la zanja. *El límite, declarado:* por ahora sólo el agua
se dimensiona; gas y electricidad se trazan y se miden, porque su cálculo tiene
otra física.

**Aguadas y bebederos — y acá hay un caso para publicar tal cual.** La app
reparte el consumo diario en el día, pero **el ganado no bebe así**: va al agua
dos veces por día, bebe unos cinco minutos y el resto del día el bebedero está
quieto. El número que elige el diámetro del caño no es el consumo diario
dividido 24, es el **caudal de pico**, y entre los dos hay más de un orden de
magnitud:

> 100 vacas a 31 litros por día son 3.100 litros diarios, o sea **129 litros por
> hora** repartidos parejos. El caudal de pico de ese mismo rodeo, con diez
> espacios de bebida, es de **4.542 litros por hora: treinta y cinco veces
> más.** Una cañería calculada con los 129 deja a la mitad del rodeo esperando.

La fuente es **USDA-NRCS, «Conservation Practice Standard: Watering Facility
(Code 614)», Oklahoma, abril de 2021**, y se eligió una norma publicada en vez
de la regla de pulgar que circula («la bebida se concentra en 4 a 6 horas»)
porque la norma da el mecanismo completo, y el mecanismo explica de qué depende.

**Las obras de tierra.** Swales y zanjas a nivel; el **camellón ancho con surco
a pendiente** —que es el diseño publicado cuando el suelo es expansivo, donde
una zanja a nivel no corresponde—; el **desagüe de parcela** y el **cauce
empastado** que lo terminan, con su recorrido deducido del escurrimiento; y la
**alcantarilla de un cruce de camino**, del caudal de la cuenca al diámetro del
caño, contra **FHWA (2012), «Hydraulic Design of Highway Culverts», HDS-5**.

**¿Alcanza el agua del predio?** Hay un inventario que suma todo lo que entra y
todo lo que se guarda contra todo lo que se gasta, y contesta **cuántos días
aguanta sin que entre nada** — contra la racha seca más larga del predio, que no
es un supuesto: está **medida del dato diario**.

### Bloque 2 · El ganado y el pasto

**Dos casos para publicar, y los dos son de los que convencen porque admiten un
error.**

El primero: **el equivalente vaca está definido en energía, no en kilos.** Son
**18,54 Mcal de energía metabolizable por día**. La app tenía en su lugar un
número en kilos de materia seca —el de una pastura de buena calidad, aplicado a
todo el planeta—, y en un pastizal natural el mismo animal necesita más kilos
para la misma energía. La tabla por categoría animal que lo reemplazó sale de
**AACREA**. *Qué muestra:* que la unidad importa más que el valor, y que una
constante heredada sin fuente es un error aunque el número parezca razonable.

El segundo: **la app dice que acertarle a la carga rinde más que rotar, y lo dice
citando a quien lo midió.** El módulo que dibuja las subdivisiones de pastoreo
abre con la advertencia de **Holechek, Gomez, Molinar y Galt (1999)**, que al
repasar los estudios clásicos de larga duración de pastizal natural concluyen
que bajar la carga de pesada a conservadora tiene mucha más probabilidad de
aumentar la capacidad de pastoreo, reducir el riesgo, mejorar el resultado
financiero y reducir la erosión, que rotar. *Qué muestra:* que el software
ordena las decisiones por lo que la evidencia sostiene, incluso cuando eso le
quita protagonismo a la función que está dibujando. **Si hay que gastar en una
sola cosa, se gasta en ajustar la carga, no en alambre.**

Lo demás del bloque:

- **El rodeo se carga por lotes y no como un animal promedio**, porque un campo
  no se carga con «bovinos adultos» sino con 40 vacas con cría, 12 vaquillonas y
  2 toros — y promediar eso a mano es justo la cuenta donde se equivoca la gente.
  Y es **un solo rodeo para toda la app**: antes la receptividad del pasto y el
  balance de la represa pedían la hacienda por separado, así que el agua se
  dimensionaba para 40 vacas mientras el pasto se planificaba para 62 y nadie
  tenía forma de notarlo. La app distingue un número **sugerido por el modelo**
  de uno **declarado por quien conoce el campo**, y lo dice en el informe.
- **El descanso entre pastoreos sale del tipo de pastura y de la temperatura de
  cada temporada del predio**, con rangos publicados, y la pastura se sugiere
  desde el clima del punto. Era una escalera fija de 30, 35, 45 y 80 días igual
  para toda la Tierra, y el cambio importante no es de valores: **una pastura
  tropical pide lo contrario que una templada**, así que la escalera vieja
  estaba al revés en medio mundo.
- **Las parcelas se dibujan sobre el mapa** cortando por área acumulada y no por
  distancia, para que cada potrero represente aproximadamente los mismos días de
  pastoreo, y los bebederos se ubican con su radio de cobertura.
- **El electrificador del alambrado**: el equipo, la puesta a tierra y el
  alambre por calibre, con el voltaje que tiene que llegar a la punta según el
  animal. Fuentes: **USDA NRCS (2015), «Fence (Code 382)», Texas**, y **Kurtz y
  Frey (2005), «Electric Fencing for Serious Graziers», NRCS**.
- **El agua del ganado por temperatura**: el consumo **se multiplica por 2,4
  entre 4 °C y 32 °C**, y el dato publicado es el consumo total, que incluye el
  agua que el animal toma del pasto.
- **Sombra para el ganado** y **silvopastura**: hileras de árboles plantadas **a
  nivel** sobre las curvas o las líneas clave, con pasto entre las hileras, para
  dar sombra, forraje y retención sin sacar superficie de pastoreo.

*El límite del bloque, y es importante escribirlo:* la producción de pasto no
sale de la lluvia. La app tiene mediciones publicadas montadas una por una, y lo
que mostraron es que **con menos lluvia que el altiplano peruano la pradera de
Dakota produce más**: una función de una sola variable no puede dar las dos
cosas bien. La estimación por lluvia **sigue en su lugar, con el tamaño de su
error escrito arriba**, porque unas pocas mediciones en cuatro biomas no
reemplazan una función global. Si querés el caso completo con la tabla de
sitios, está en el encargo anterior (`PROMPT_LANDING_ACEQUIA.md`, caso 4) y los
números de ahí siguen valiendo.

### Bloque 3 · Las líneas que se trazan encima

**Keyline, y acá hay un caso contraintuitivo que vale la pena.** La app dibujaba
el patrón de cultivo con paralelas a espaciado fijo y medía su calidad premiando
que la pendiente a lo largo de las líneas fuera cerca de cero. Las dos cosas
estaban mal, y la segunda es la que importa: **la deriva no es el error del
método, es el método.** Yeomans lo explica en una parrafada: las curvas de nivel
no son paralelas entre sí sobre el plano, así que una línea paralela a una curva
no se queda sobre la curva, desarrolla pendiente — y la desarrolla **hacia un
lado del valle y hacia el otro lado en la loma**. Esa pendiente es lo que mueve
el agua a donde se la quiere llevar. Hoy la app **verifica** la deriva de cada
tramo contra el terreno en vez de afirmarla, y declara el límite del método con
que la mide: la dirección del escurrimiento se decide con ocho direcciones
posibles.

Lo demás:

- **Caminos** trazados sobre las divisorias, con los cruces de cauce detectados y
  clasificados en puente o alcantarilla según el tamaño del cauce.
- **Cortinas rompevientos** perpendiculares al viento de los meses fríos
  **medido en ese predio**, con la superficie protegida detrás. Esto ya está en
  la home y está muy bien contado —incluido que la app decidía el viento frío
  con una regla de hemisferio y que primero se corrigió la app y después se
  publicó la pieza—. No lo toques: linkealo desde acá.
- **Fajas cortafuego** sobre las divisorias de agua. *El límite, ya escrito en
  la home:* dice dónde caen las divisorias, no qué ancho necesita la faja —eso
  lo deciden el combustible, la pendiente y el viento— ni reemplaza un plan de
  manejo del fuego.
- **Zonificación por frecuencia de visita**, y algo que no está nombrado: la
  **zonificación guiada**, que vuelve a mirar el polígono que dibujaste y le dice
  qué opina el terreno. Antes se dibujaba una zona, se le elegía una categoría y
  se mostraba su superficie, y ningún motor de la app volvía a mirar ese
  polígono — habiendo quince que podían.

### Bloque 4 · El plan maestro: dónde va cada cosa, en qué orden y cuánto cuesta

**Esto es lo que Jonatan nombró primero y es lo que menos aparece.** El usuario
declara el **programa** del predio y el motor dimensiona cada elemento y le
busca ubicación sobre el terreno. Los tipos de elemento son diecisiete, cada uno
con su huella y su distancia preferida a la zona 0 de permacultura:

> Casa / vivienda · Cabaña de alquiler · Galpón · Garage / cochera · Quincho /
> fogón · SUM / salón · **Gallinero** · Colmenas / apiario · Invernadero /
> vivero · Compostera · Corrales / manga · Acopio de agua · Huerta intensiva ·
> Pastoreo / ganadería · Cultivo extensivo · Monte frutal · y un elemento libre.

Se colocan en orden de dependencia —primero las anclas, después lo que depende
de ellas— y con un grafo de afinidades: el gallinero quiere estar cerca de la
huerta y del galpón, los corrales cerca del galpón y del pastoreo, las colmenas
cerca de los frutales.

**Y hay una distinción de fondo que conviene publicar, porque es exactamente el
tipo de cosa que un profesional valora.** La tabla de puntaje que ubica la casa
**suma y resta puntos y nunca descarta nada**: con suficientes bonos en los
otros términos, un lugar malo se queda con la casa igual. Pero **el retiro de un
curso de agua no es una penalización, es una prohibición**, y quien la incumple
no construyó peor: construyó donde no se puede. Son dos estructuras distintas de
regla y la app tenía una sola. Hoy tiene las dos, y lo que es cuestión de grado
se expresa en la magnitud física que está detrás —cuánto hay que cortar, cuánta
tierra se mueve, cuántas veces más grande que el edificio es el movimiento de
suelo, si el camino puede llegar— en vez de un puntaje arbitrario.

Las fuentes de los retiros y del camino, todas de agencia pública:

- **NRCS CPS 391 «Riparian Forest Buffer» (2020)**, para el retiro de un curso
  de agua, con una escalera de anchos **según para qué sirve el retiro**: unos
  11 m para frenar el transporte de sedimento, unos 15 m si lo que amenaza al
  cuerpo de agua son patógenos o nutrientes, y para hábitat 15 m para
  invertebrados y anfibios, 30 m para aves de interior y mamíferos chicos, y 50 m
  para mamíferos grandes. *Si publicás estos números, publicá también que son
  conversiones de 35, 50, 100 y 165 pies, que es como los dice la norma.*
- **NRCS CPS 560 «Access Road» (2020)**, para el camino: pendiente normal hasta
  10 %, hasta 15 % sólo si hace falta, ancho de calzada de 14 pies para una mano
  y 20 para doble mano, y taludes de corte y relleno de 2 horizontal a 1
  vertical como mínimo, 4 a 1 preferido.
- **US EPA, «Onsite Wastewater Treatment Systems Manual» (2002)**, para la
  posición en el paisaje y el área de reserva del tratamiento de efluentes:
  evitar vaguadas, depresiones y planicies de inundación; preferir laderas
  convexas y llanos de suelo profundo y permeable; y reservar alrededor del
  **200 % del área estimada de tratamiento**.

**Y un número que explica por qué esto no era un detalle de ajuste.** El motor
de emplazamiento decidía sobre una grilla de **10 × 10 celdas**: en un predio de
40 hectáreas cada celda mide 63 m de lado, o sea 0,4 ha, **cuarenta veces la
huella de una casa**. El retiro más chico que pide la norma —unos 11 m— es
**seis veces más fino que esa celda**. No se aplica un retiro de once metros con
una regla de sesenta. Hoy corre sobre la grilla densa que la app ya baja para
las curvas de nivel, que en ese mismo predio da un paso de unos 5 m.

Lo que completa el bloque:

- **El plan por etapas: en qué orden y en qué meses.** Un diseño sin «cuándo» no
  se puede empezar: el productor tiene el plano completo y la primera pregunta
  del lunes es qué se hace primero. El orden sigue los **ocho factores de la
  escala de permanencia de Yeomans**, de lo más permanente a lo más cambiable
  —clima, geografía, agua, accesos, sistemas, estructuras, subdivisiones,
  suelo—, que además existen en la app como bitácora de diseño del predio
  entero, guardada con el proyecto.
- **El presupuesto de obra y el repago**, armado con las cantidades que la app ya
  calculó —perímetro, tuberías, represa, riego— y con **precios editables**: la
  app aporta la estructura y las cantidades, el usuario pone los valores de su
  zona. La página tiene que decirlo así; prometer precios es prometer lo que no
  se puede sostener.
- **La lista de materiales, que no es el presupuesto.** La distinción no es
  nuestra: el capítulo 5 del Engineering Field Handbook enumera los pasos del
  diseño de una obra de predio y los números 5, 6 y 7 son tres cosas distintas
  —estimación de cantidades de material, especificaciones, estimación de
  costos—. La lista lleva cantidad, base de medición, calidad y estado.
- **La planilla de replanteo, que es el papel que va al lado del plano.** Un
  plano se mira; una planilla se usa con una cinta, un nivel y una mira, de pie
  en el terreno. AH-590 lo dice en una frase que conviene citar: el replanteo es
  lo que **transmite al terreno la información que está en los planos**.
- **Qué técnica de bioconstrucción admite el lugar.** Y acá hay un hallazgo
  publicable: se leyeron los códigos que de verdad regulan el fardo de paja, el
  cob y los materiales de tierra, y **ninguno condiciona nada a una clase de
  clima**. Condicionan a otras cosas, y la primera es la **categoría de diseño
  sísmico**. O sea que la pregunta intuitiva —«¿qué técnica va en este clima?»—
  no es la que hacen las normas.
- **Escenarios**: se pueden guardar varias versiones del diseño del mismo predio
  con nombre, cargarlas y compararlas. No está nombrado en el sitio y es
  exactamente lo que hace un proyectista.

### Bloque 5 · El clima, el sol y el tiempo

**El calendario agroclimático** —que el sitio nombra sólo como «calendario del
lugar (heladas, lluvias y ventanas de siembra)»— tiene adentro: grados-día de
crecimiento acumulados mes a mes, el balance de agua **por cultivo** con el
coeficiente de cultivo de **FAO-56**, el fotoperiodo, y las **horas de frío
invernal**, que es el requisito que decide si un frutal de hoja caduca cuaja en
un lugar. Se calcula todo desde el clima ya descargado, sin pedirle nada más a
ningún servicio.

**Los análogos climáticos, que el sitio no menciona y son de lo más original que
tiene.** Para la clase climática del predio, la app trae **las regiones del
mundo que tienen ese mismo clima y los sistemas productivos documentados en
ellas, cada uno con su fuente**. Son **21 clases de Köppen con ficha propia**,
levantadas una por una; las clases sin ficha se derivan a la más parecida y **la
app avisa que es una aproximación**; y el hielo permanente queda afuera a
propósito, porque no hay sistema agrícola análogo que ofrecer. La clasificación
sale de los mapas Köppen-Geiger de **Beck et al.**, de 1 km.

Y el cruce que eso habilita, que es la pregunta que hace quien planta un monte:
la app lee la clase climática del predio **en tres períodos** —o sea, muestra la
deriva— y para la clase futura contesta **dónde existe hoy ese clima y qué
cultivan ahí**. No es un pronóstico del predio: es la lista de lugares reales
que ya viven en ese clima. Es lo más honesto que se puede decir con estos datos,
y es accionable.

**El sol y la sombra.** Los tres recorridos del sol sobre el predio, el relieve
encendido por horas de sol, las sombras propias y las del relieve, y las
**cuencas visuales** —qué se ve desde dónde—. La home ya cuenta esto muy bien,
con sus dos límites escritos: el cálculo es sin nubes y sin refracción sobre un
modelo de 30 m, así que alcanza para comparar una ladera con otra y no para
prometerle horas de sol a un cultivo; y el rojo de la pendiente es lo más
empinado **de ese predio**, no un umbral. No lo reescribas: linkealo.

**Los extremos**, medidos del dato diario y no supuestos: heladas, rachas secas,
y los extremos del período medido.

### Bloque 6 · El suelo, lo vivo y lo que estuvo antes

- **El suelo por horizonte**: textura, carbono, pH y agua útil, con el grupo
  hidrológico y la roca madre de abajo. Y **reconoce un suelo expansivo** y
  cambia el diseño cuando lo encuentra: es lo que trae el camellón del bloque 1
  en vez de una zanja a nivel, y el aviso llega a las tres hojas que se llevan
  al campo.
- **Riesgo de erosión hídrica**, combinando la pendiente con el agua que
  concentra cada celda, **normalizado al predio** —así es robusto ante modelos
  de 1 m o de 30 m— y con un techo por pendiente absoluta para no pintar de rojo
  un predio llano. Cuando hay cobertura cargada entra además el factor de la
  USLE que le faltaba al índice.
- **Carbono del suelo y de la biomasa**, y lo que el diseño captura.
- **Aptitud por especie y por uso**, que usa las horas de frío para los caducos.
- **Fichas por ecorregión**, cada una con una fuente del lugar y no de un
  promedio regional. **Prácticas fechadas del territorio**: qué se hizo en ese
  lugar y cuándo, con la licencia del dato verificada; donde no se puede decir
  de quién es una práctica, se dice qué se hizo y cuándo. Y **pueblos
  originarios con el dato local de siete países**, cada uno con su propio
  denominador y sus propias palabras, porque los censos no miden lo mismo.

### Y una cosa que no es una capa: traer tu propio dato

El sitio describe acequia como un lector de fuentes abiertas, y además **recibe
las tuyas**:

- **Importar un modelo de elevación propio** en GeoTIFF: un vuelo de dron con
  RTK, una estación total interpolada, o un modelo oficial descargado. Importa
  porque el modelo satelital de la app tiene unos 30 m de paso y no resuelve
  nada por debajo de un par de metros: para trazar un swale o una línea clave en
  un lote chico hace falta un relevamiento real. Y **una ortofoto de dron como
  fondo georreferenciado**, con las proyecciones que se usan de verdad en
  Argentina: además de las globales, **Gauss-Krüger POSGAR 2007, fajas 1 a 7**.
- **Imagen histórica**: la línea de tiempo de la imagen satelital, un release
  por año, para ver el predio antes.
- **Capas propias** para organizar el dibujo libre.
- Y la salida: **GeoJSON, KML y GPX**, **DXF por capas** y el **plano en PNG con
  rótulo, leyenda, norte y escala**.

## Lo que esta página NO puede decir

- No prometas **precisión**. El aviso del pie es la posición de la casa y esta
  página tiene que ser coherente con él: lo que hay es una lectura preliminar
  trazable, con las limitaciones a la vista.
- No digas que la app **reemplaza** una mensura, un cálculo estructural, un
  estudio geotécnico o un estudio hidrológico. Lo que hace es decirte dónde hay
  que ir a medir.
- No publiques el **inventario técnico completo** —todas las versiones, todas
  las licencias, todas las resoluciones—. Eso vive adentro de la app y en la
  guía, que es pública y gratis.
- No inventes testimonios, cantidad de usuarios ni casos de clientes.
- **No publiques un número que no esté en este pedido.** Si un bloque te queda
  corto sin un dato que no tenés, dejalo corto y preguntá.

---

# Fase 3 — Repaso de las páginas, una por una

Cosas que vi al leer el sitio completo y que no entran en las otras dos fases.
Cada una es chica; ninguna es urgente.

**Home.** Está bien escrita y no hace falta tocarle la estructura. Dos cosas:
la sección «Metodología visible» dice que la trazabilidad completa está «dentro
de la aplicación y en el manual de uso», y eso es falso **en la dirección
contraria**: la guía está afuera, es gratis y no hay que entrar. Verificá que el
enlace a `https://app.acequia.app/guia` esté puesto ahí (el encargo anterior lo
pedía); si está, es desde ahí que se linkea también la página nueva de la fase 2.

**`/primeros-pasos`.** El recorrido de cinco pasos está bien. Le falta lo mismo
que a la home: donde dice «Dentro de la aplicación, el manual identifica la
fuente activa…», la guía es pública. Y «Reservá entre 20 y 30 minutos para el
primer recorrido» es un número que conviene que Jonatan confirme, no yo.

**`/planes`.** Además de la fase 1: la FAQ «¿Cuántos proyectos puedo tener
abiertos?» está bien y explica la cosa correcta (es un tope de proyectos
abiertos a la vez, no de proyectos que podés hacer). Dejala.

**`/piloto`.** Todo lo de la fase 1. Y el formulario pide «Profesión u oficio» y
«Tipo de predio o proyecto» con una lista cerrada: está bien. El aviso
«Guardamos tu postulación sólo cuando el envío se completa» también.

**`/terminos`, `/privacidad`, `/arrepentimiento`.** **No las toques.** Están
pendientes de revisión legal y eso no lo resuelve un agente. Si la fase 1 cambia
un precio o la condición de la prueba y alguna de esas tres páginas repite ese
dato, **no lo edites: anotalo y avisale a Jonatan**, porque un texto legal que
dice un precio distinto del que se cobra es un problema de otra naturaleza que
un renglón de vidriera.

**`/registro` y `/ingresar`.** Son pantallas de la aplicación, no de la
vidriera. Si tienen copia del texto de la prueba, avisá en qué línea está en vez
de editarla acá.

---

# Cómo se cierra cada fase

1. La compuerta del repositorio en cero: typecheck, lint, tests y build.
2. Un commit por tema, con el mensaje explicando **por qué**, no qué.
3. El cambio commiteado y **no deployado**. Las notas de este proyecto dicen que
   pushear acá no deploya y que el deploy es un segundo paso manual:
   **verificá si eso sigue siendo así antes de darlo por hecho**, y no deployes
   vos. Dejá anotado el comando que falta. Si hay una rama distinta de `main`
   que es la viva, trabajá en esa.
4. Y en el reporte, tres cosas: qué quedó distinto renglón por renglón, qué
   quedó linkeado, y **qué no hiciste y por qué**.

Si algo de este pedido choca con lo que encontrás en el repositorio o con lo que
contesta el endpoint, **decilo antes de resolverlo por tu cuenta**. Es más
probable que mi información esté vieja que que el repositorio esté mal.
