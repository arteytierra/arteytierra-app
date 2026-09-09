# Acequia — todo lo que falta, al 08/09/2026

Informe de estado. Los números no son estimaciones: salen de contar los catálogos
de `apps/terreno/lib/` y de cruzarlos contra `resolve-eco-id-bioma-2026-09-07.json`,
que son las 847 ecorregiones de RESOLVE. Donde algo no se midió, lo digo.

Punto de partida: **222 fichas ecológicas** (12 a mano en `contexto.ts` + 210
regionales en ocho catálogos) y **409 ECO_ID curados**. La app funciona y está en
producción. Lo que sigue no es una lista de bugs, es una lista de deudas.

---

## 1. El ecosistema natural de base — la deuda más grande

**396 ecorregiones de 847 tienen ficha. Las otras 451 reciben el bioma global y
nada más.**

| Reino | Con ficha | Total |
|---|---|---|
| Neotropic | 174 | 179 |
| Nearctic | 114 | 115 |
| Palearctic | 94 | 205 |
| Oceania | 6 | 24 |
| Afrotropic | 7 | 116 |
| Indomalayan | 1 | 106 |
| Australasia | 0 | 83 |
| Antarctica | 0 | 18 |

América está cerrada. Europa, Medio Oriente y el norte de África, cerrados. Lo que
falta es **Asia entera, África tropical y Oceanía**.

### Por qué no alcanza con "ya hereda el bioma global"

El bioma global no miente igual en todas partes. El caso concreto y medido: **216
ecorregiones heredan `huerta -25` del bosque tropical húmedo**, y esa razón está
escrita sobre el oxisol amazónico —"la fertilidad está en la biomasa viva"—. Es
cierto en la Amazonia y en el Congo. Es falso en Java, Bali, Luzón y buena parte de
Nueva Guinea, que se sostienen sobre andisoles volcánicos: los suelos más fértiles
del planeta, con las densidades rurales más altas del mundo.

**145 de esas 216 no tienen ninguna ficha que pueda matizarlo.** Y no se arregla
bajando el delta global: la distinción es geográfica y el bioma global no tiene
forma de expresar geografía. Se arregla con fichas regionales.

El mismo patrón, ya identificado en otros tres lugares: la estepa kazaja y mongola
hereda `huerta +10` del pastizal templado, que está calibrado sobre chernozem. Es
el error que ya se corrigió cuatro veces (badia siria, meseta de Anatolia, pradera
de pastos cortos, High Plains) — y en Asia no hay ficha que lo pise.

### El encargo, en orden de lo que más rinde

1. **Sudeste asiático volcánico** — Java, Bali, Sumatra, Luzón, Mindanao. Donde el
   error es más grande y donde hay más gente.
2. **África tropical húmeda** — cuenca del Congo, Guinea, franja costera. Acá el
   modificador global acierta; la ficha suma por especies, suelos y saberes.
3. **Sabana africana** — 31 ecorregiones. `pasturas +20` es correcto (la sabana
   africana *es* el arquetipo del bioma). Otra vez profundidad, no corrección.
4. **Australasia** — 83 ecorregiones en cero, con un problema propio: los rangelands
   áridos australianos heredan `pasturas -15` del desierto global, y son una de las
   ganaderías extensivas más grandes del mundo.
5. **Asia paleártica** — 111 ecorregiones: Siberia, Asia central, China, Japón, Corea.

Circuito de siempre: GPT releva a JSON en `_research/`, Claude monta a `lib/`.

---

## 2. La aptitud — está sana donde hay fichas, ciega donde no

El motor está terminado y es bueno. `componerAptitud` compone uso por uso: la
región pisa sólo lo que nombra y hereda el resto, así que una corrección cuesta una
entrada y no borra las otras. 33 fichas regionales tienen corrección propia.

El barrido de herencia se completó donde había algo que auditar: **21 fichas y 3
biomas globales corregidos** entre el 06 y el 07/09, en América, Europa, Medio
Oriente y norte de África.

**Lo que queda pendiente en aptitud es exactamente lo del punto 1**: sin ficha
regional no hay dónde escribir la corrección. No es una tarea aparte.

Dos cosas de gradiente que se decidieron **no** tocar y conviene no volver a
discutir: la pradera mixta norteamericana y las cuencas endorreicas de Irán. Son
fichas donde una mitad es fértil y la otra no; un modificador único mentiría en una
de las dos. Ahí el arreglo es de texto, no de herencia.

---

## 3. Los calendarios — las cuatro deudas, cerradas el 08/09

> **Estado al 08/09/2026.** Los cuatro puntos de abajo están hechos y en
> producción. Esta sección deja de ser deuda pendiente y pasa a ser registro.
>
> - **Horas de frío** → `lib/horasFrio.ts`. Modelo clásico de Weinberger, banda
>   de 0 a 7,2 °C, estimada de las medias mensuales con el día modelado como
>   sinusoide. La ventana de dormancia son los seis meses consecutivos que más
>   acumulan, buscados en círculo, así que sirve en los dos hemisferios.
>   `evaluarEspecie` gana la tercera forma de fallar: el caduco que pasa el
>   invierno, junta el calor y aun así no cuaja. Trece especies llevan el número.
> - **El balance hídrico sigue a la ecorregión** → `cultivosDeFicha`. Cuando la
>   ficha declara cultivos, manda la ficha; sin ficha, la lista genérica.
> - **Cuatro familias de clima cálido** — raíces tropicales, musáceas, frutales
>   tropicales y granos de clima cálido. Y la tabla oculta las familias sin
>   ningún mes posible, diciendo cuántas ocultó.
> - **Fotoperiodo** → `lib/fotoperiodo.ts`. Duración del día por el modelo CBM
>   (Forsythe 1995) desde la latitud y el día del año, con el clamp de sol de
>   medianoche y noche polar. El umbral es el **período de Perséfone**: debajo de
>   10 h de luz el crecimiento vegetativo se detiene, debajo de 9 h no hay nada
>   que hacer a cielo abierto. `aptitudMes` toma la luz como tercer parámetro y
>   ésta **sólo puede bajar** el veredicto, nunca subirlo. Como a menos de ~40°
>   de latitud el día no baja nunca de 10 h, la regla no toca jamás un predio
>   tropical: corrige exactamente donde estaba el error.
>
> Lo que sigue abajo es el diagnóstico original, que se deja escrito porque
> explica por qué eran deudas y no mejoras.

Acá hay más deuda de la que figura en ningún plan. El calendario está calculado
100 % desde NASA POWER y no toca ninguna API extra, lo cual está bien. Pero:

**a) Las 9 familias vegetales están calibradas para huerta templada.** `FAMILIAS`
en `lib/calendario.ts` son hoja, crucíferas, solanáceas, cucurbitáceas, leguminosas,
raíces, aromáticas, cereales y frutales menores. Son las familias de una huerta del
Cono Sur. **No hay ninguna familia tropical**: ni raíces tropicales (mandioca, taro,
batata), ni musáceas, ni perennes de renta (café, cacao). Un predio en Java o en
Kerala recibe hoy un calendario que le habla de brócoli y arveja.

**b) Los cultivos del balance hídrico están hardcodeados y no siguen a la
ecorregión.** `CULTIVOS_KC` son 10 entradas fijas —huerta, tomate, maíz, alfalfa,
papa, zapallo, soja, pasturas, olivo, girasol— mientras `especies.ts` tiene **107
cultivos** y 187 fichas declaran cuáles corresponden. El balance por cultivo ignora
todo eso. Es la desconexión más visible entre las dos mitades del trabajo: el bloque
de ecorregión sí lee `ficha.cultivos`, el balance hídrico no.

**c) No hay horas de frío.** La app recomienda frutales, `biomasGlobales.ts` dice
literalmente que la parada invernal "da las horas de frío que los frutales de hoja
caduca necesitan para cuajar", `especies.ts` tiene una nota que dice "pide horas de
frío", y `climaFuturo.ts` avisa que van a salir las especies que las necesitan.
**Pero el requerimiento de frío no se calcula en ningún lado.** Es un cálculo barato
sobre datos que ya tenemos (Utah o Richardson sobre las medias mensuales) y cierra
un razonamiento que hoy está a medias.

**d) `aptitudMes` no mira fotoperiodo.** Decide con temperatura media, mínima y
helada. Para hoja y crucíferas en latitud alta eso sobrestima la ventana: la
temperatura da y la luz no.

> Una aclaración sobre el ejemplo con el que se escribió esto. Decía "en junio en
> Escocia la temperatura da, la luz no", y junio en Escocia es justamente el mes
> de más luz del año —diecisiete horas—. El mes que sobra por temperatura es el
> **de hombro**: octubre y noviembre tienen media de 8 a 10 °C, que a la lechuga
> le sirven, con nueve horas de día, que no. La corrección implementada mira la
> luz mes a mes, así que agarra el caso real esté donde esté —y, espejado, el
> mismo problema en Ushuaia entre mayo y julio.

Ninguna de las cuatro rompía nada. Las cuatro empeoraban a medida que la app se
usa más lejos del Cono Sur, que es justo la dirección en la que viene creciendo:
el clima extremo del calendario —Java de un lado, Escocia del otro— era donde
más se equivocaba. Las cuatro están cerradas, con 33 tests entre las dos tandas.

---

## 4. Los saberes territoriales — 1 activo de 85

La capa está construida, probada y conectada a la interfaz (`/api/saberes`, el hook,
la sección en `ContextoPanel` y en `InformeView`, con la atribución que ODbL exige).
La compuerta son ocho condiciones y hay 25 tests que la fijan.

**Activo: uno.** El Quesungual sobre el departamento de Lempira, Honduras, con
polígono de OSM bajo ODbL. Es el único porque es el único con cartografía de
licencia admitida.

Lo que falta, en el orden que corresponde:

1. ~~**Los tres europeos con cartografía oficial ya publicada.**~~ **Verificado el
   08/09/2026: es uno de tres, no tres de tres.** Sólo los **polders y
   waterschappen (NL)** quedan viables — PDOK publica polígonos bajo CC-BY-4.0,
   que sí está admitida, y hay servicio Atom. Las **cañadas reales (ES)** están
   bloqueadas dos veces: la licencia del MITECO es de atribución propia y no
   figura entre las admitidas, y sobre todo **la cartografía es de líneas**, con
   lo que la condición "el punto cae adentro del polígono" no tiene cómo
   evaluarse sin inventar un buffer. Los **crofting townships (GB)** también:
   el open data de la Crofting Commission es tabular, y los límites viven en un
   producto pago de Registers of Scotland derivado de Ordnance Survey. El detalle
   está en `ESTADO_FASE_2_SABERES.md`.
2. **Los 26 saberes europeos tienen `fuentes: []`** porque el relevamiento citó por
   región y no por saber. La condición 1 exige fuente, así que están doblemente
   bloqueados. Atribuir una URL a cada uno es trabajo de escritorio.
3. **Los sitios SIPAM/GIAHS de América** — Xochimilco, Metepantle, chakra de Napo,
   Viñales. La FAO publica el polígono; hay que ver bajo qué licencia. Viñales ya se
   descartó: OSM no lo tiene y UNESCO no publica licencia reutilizable.
4. **Todo lo demás, con acuerdo antes que con polígono.** Los saberes de pueblos
   originarios no se activan por tener el mapa. El polígono es la mitad del permiso.
5. **África, Asia y Oceanía** — sin relevar, ni en fase 1 ni en fase 2.

Además: los saberes cubanos de las dos fichas caribeñas están sacados, porque sus
ECO_ID curados son de Puerto Rico. Vuelven cuando se curen los de Cuba y La Española.

---

## 5. Espesar lo que ya existe (bloque 3 del plan de América)

El paquete de EE.UU., México y el Caribe es el más flaco de todos:

- **35 fichas con sólo 4 especies nativas**
- **12 fichas con menos de 3 fuentes**
- **`suelos` en ~145 caracteres**, contra ~350 en Canadá

El texto de suelos importa más de lo que parece: es de donde sale el razonamiento de
la aptitud. Una ficha que dice dos líneas de suelo no puede sostener una corrección.

Trabajo editorial puro, por tandas de diez. Consume horas y se nota poco, así que va
de fondo.

**Trampas ya desactivadas que conviene recordar** (costaron una vez):
`biomasRegionalesAmerica.ts` y `biomasRegionalesEuropa.ts` decían "ARCHIVO GENERADO,
no editar a mano" y **no tienen generador** — se mantienen a mano, encabezados ya
corregidos. `montar-sudamerica.mjs` sí regenera su archivo y borraba `cultivos` y
`aptitud` al correrlo; ya emite los dos desde el JSON del paquete.

---

## 6. Fuentes de datos — dos licencias que verificar antes de programar

Nada de esto es código todavía. Son consultas.

- **CHELSA V2.1** — climatologías globales a 1 km, declarada CC BY 4.0. Es
  exactamente la forma de producto que el motor necesita, y taparía el hueco de
  Sudamérica, que hoy sólo tiene NASA POWER mientras Norteamérica ya tiene Daymet a
  1 km. **Hay que verificar la licencia y la vía de consulta por punto**, no darlo
  por hecho.
- **CEM de INEGI a 15 m (México)** — nunca se evaluó. El audit de DEM cubrió EE.UU.,
  Canadá y Europa y saltó México.
- **Uruguay MGAP/CONEAT** — la única fuente de suelo sudamericana que pasó licencia
  y sigue sin implementar. Era la prioridad 1 del relevamiento.
- **WIS2** — cubre 8 países de una, pero entrega observaciones de estación, no
  climatologías. **No reemplaza a POWER** para lo que la app calcula. Conviene
  decirlo así y no sobrevenderlo.
- **Argentina** quedó afuera por licencia y **Ecuador** por copyleft (ver el
  comentario de `lib/elevacion/router.ts`). Si el IGN cambió condiciones vale
  revisarlo.
- **LUCAS Topsoil** es no comercial → incompatible con el SaaS. Cerrado.
- **Open-Meteo**: se sigue usando gratis. El disparador para pagar es el primer
  suscriptor, y hace falta el plan Professional, no el Standard.
- **Cloudflare** está en Proxied ON pero bloquea a ClaudeBot por su cuenta. Pendiente
  de arreglar en el dashboard — afecta al posicionamiento AEO que ya está en prod.

---

## 7. Deuda técnica del código

- **`MapaTerrenoApp.tsx`** — de 5.643 a 3.991 líneas. El JSX no sale: cierra sobre
  393 identificadores. La barra superior ya salió (`415db9c`). Sigue siendo el God
  component de la app.
- **Reducers pendientes** — `useReliefShader` y el grupo de dibujo libre.
- **Master Plan v2** — en producción, sin calibrar contra predios reales.
- **Cierre automático de trazado** — el camino ignora `elementoPoli` y
  `espejoPendiente`.
- **Swales dentro de un polígono** para terrenos grandes — última herramienta abierta
  del lote C (erosión ✅, cortafuegos ✅, silvopastura ✅).
- **El ECO_ID 0 de RESOLVE** (*Rock and Ice*) quedó afuera del montaje sudamericano a
  propósito. Es una deuda global abierta.
- **Commit `b5f85ed` malformado** — su subject quedó en `@` por un here-string de
  PowerShell dentro de Bash. Necesita amend + force-push, que no se hizo por no
  reescribir historia publicada sin decirlo.
- **`/mapa` e `/informe/*` son auth-gated** y no se pueden verificar en preview. La
  validación en producción la hace Jonatan.

---

## 8. Comercial — el paso 8, que es el que traba la plata

Esto no es del motor ecológico pero es lo que separa a la app de cobrar.

**Estado hoy:** Semilla (gratis, 1 proyecto, cuatro funciones abiertas) está activo.
La prueba comercial de 3 días está **construida y apagada**.

`ACEQUIA_TRIAL_ENABLED` está en `false` y **tiene que quedar en `false`**. Prenderlo
hoy no es "no pasa nada": la migración `0051` no está aplicada, y `lib/auth/plan.ts`
pediría columnas que no existen. **La app rompe para todos, no sólo para los de
prueba.** Además, la mitad del código que lo lee está en el árbol de trabajo sin
commitear.

Orden que hay que respetar:

1. Punto de reversión, guardar constraints y funciones viejas.
2. Aplicar `0051` + los bloques de verificación 5, 6 y 7.
3. Crear los planes en **Mercado Pago** (AR) y **PayPal** (internacional) a los
   precios congelados: personal 7/70, diseñador 12/120, estudio 35/350 USD.
4. Probar el circuito entero en sandbox: alta con prueba, primer cobro, rechazo,
   cancelación durante la prueba, cambio de plan.
5. Sumar `https://app.acequia.app` al CORS del checkout, que vive en `apps/web`.
6. Prender `PAYMENT_WEBHOOKS_ENABLED`, después `NEXT_PUBLIC_PAYMENTS_ENABLED`, y
   **último de todo** `ACEQUIA_TRIAL_ENABLED`.
7. Una transacción real controlada con tarjeta propia antes de abrirlo.

**Reparto:** los webhooks con idempotencia, la lógica de cancelación durante la
prueba y los correos del ciclo de cobro los hago yo, cuando digas que arrancamos.
Aplicar `0051`, crear los planes y cargar variables en Vercel los hacés vos — no
toco credenciales ni aprieto botones irreversibles.

**Mudanza a acequia.app:** pasos 6 a 9 del runbook sin hacer. La web nueva está fuera
del repo y no compila para Vercel (vinext/Cloudflare).

---

## 9. Qué haría yo, y en qué orden

~~**Primero, lo barato que cierra razonamientos ya escritos.**~~ **Hecho el
08/09/2026:** horas de frío, el balance hídrico atado a `ficha.cultivos` y las
cuatro familias de clima cálido. El calendario ya sabe hablarle a Java, que era
la precondición para montar fichas de Java.

~~**Cuarto, las tres licencias europeas de saberes.**~~ **Verificado el
08/09/2026, y rindió menos de lo esperado:** una de tres, no tres de tres. Queda
por montar el polígono neerlandés, que es media tarde: confirmar la licencia en
la metadata del NGR, bajar el Atom de PDOK, simplificar y cargar la entrada en
`GEOMETRIAS_SABERES` con la atribución que CC-BY exige. Pasaría de 1 saber
activo a 2.

**Lo que queda, en orden:**

1. **Indomalaya volcánica.** El encargo de mayor rendimiento del catálogo: más
   error corregido por ficha escrita que cualquier otra región del planeta. Y
   ahora cae sobre un calendario que ya nombra lo que ahí se come.
2. **El polígono neerlandés**, arriba.
3. **Las fuentes por saber de los 26 europeos**, que están doblemente bloqueados
   por `fuentes: []`. Escritorio puro.
4. **El paso 8**, cuando vos digas. No antes, porque es el único bloque donde
   equivocarse cuesta plata y no sólo tiempo.

El bloque 3 —espesar EE.UU. y México— va de fondo, por tandas, sin bloquear nada.

---

*Verificación de regresión barata después de tocar cualquier catálogo:*
`node _research/enumerar-cobertura-resolve.mjs`. No se espera que aparezca nada.
