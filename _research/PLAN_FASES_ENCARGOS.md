# Todo lo que falta, en seis fases

*Escrito el 22/10/2026, con todo medido contra el repositorio en ese momento. No
hay estimaciones: donde hay un número salió de contar, y donde no se midió, se
dice.*

Este documento reemplaza como hoja de ruta a la sección 9 de
`PENDIENTES_ACEQUIA.md`, que es de septiembre y quedó vieja en varios puntos.
Los seis encargos están escritos en `_encargos/ENCARGO_FASE_*.md`, uno por fase,
autocontenidos y listos para pegar.

---

## Primero: el encargo de forraje se terminó, y no por éxito

Los lotes 21 a 24 —el encargo de cierre, el que por fin pedía el **modelo** en
lugar de más mediciones— volvieron el 22/10/2026 a las 19:48 y **volvieron
vacíos**: 2 entradas y 14 rutas declaradas vacías sobre cuatro lotes, y las dos
entradas están rotuladas por la propia entrega como `near_miss`.

El motivo del lote 21, que era el importante de los cuatro por mucha distancia,
está escrito ahí: *«Handle dado por el encargo; ruta API/página no accesible en
esta sesión.»* Es el 403 del repositorio abierto de la Universidad de Arizona, que
devuelve Apache 403 en **todos** los caminos de descarga de archivo
—`/server/api/core/bitstreams/<uuid>/content`, `/bitstreams/<uuid>/download`,
`/bitstream/handle/...`— incluso navegando directo con un navegador real.

**Y yo tengo la vía que funciona.** Está en memoria desde el lote 20: abrir la
página del ítem en el navegador de la app, rechazar el cartel de cookies y hacer
un `fetch` **del mismo origen** desde esa página, prefiriendo el *bundle* `TEXT`
sobre el PDF. Los uuid salen de `/server/api/core/items/<uuid>/bundles` y de
`/bundles/<uuid>/bitstreams`.

O sea: **el último pendiente del forraje no es un encargo. Es mío.** Wight &
Hanks (1981), handle `10150/646128`, con los otros cuatro handles del encargo de
cierre como respaldo. Es la función que reemplaza a `prodForrajera`, que es la
deuda número uno de toda la cadena ganadera: una escalera de cinco escalones sin
fuente que multiplica la oferta, el balance, la carga, el rodeo y el agua de la
represa, y que veinte lotes midieron equivocada entre 1,7 y 2,9 veces.

Lo demás del forraje está cerrado y verificado como ruta muerta: el portal EDI de
los LTER devuelve 403 a todo acceso público en los cuatro endpoints probados, así
que Konza, Jornada, Sevilleta y Shortgrass Steppe están cerrados para las dos
partes. Las 22 guías del catálogo NPP del ORNL que no se recuperan tampoco se van
a recuperar por esa vía.

**La lección, que ya está en memoria y vale para las seis fases:** un encargo con
ruta nombrada rinde y uno con tema vuelve vacío. Los lotes 17, 18 y 19 volvieron
1 de 3 y el que salió era el que nombraba una revista y un tipo de ensayo. El
lote 20, escrito con URLs y patrones de catálogo, volvió 2 de 3. El 21 al 24
nombraba handles exactos y volvió 0 de 4, **porque el obstáculo no era encontrar
la fuente sino abrirla**, y eso ningún encargo lo arregla. Por eso las seis fases
de abajo se eligieron entre lo que es *abrible*: términos de uso, tablas de
manuales de organismos, fichas de patrimonio, catálogos de ecorregiones.

---

## El reparto: qué es de quién

Antes de las fases, lo que **no** va a ninguna de ellas, porque no es trabajo de
relevamiento.

### Mío, con el navegador o con código

| Qué | Por qué está acá |
|---|---|
| **Wight & Hanks (1981)**, el modelo de balance hídrico que reemplaza a `prodForrajera` | La única vía que abre el repositorio de Arizona es el `fetch` del mismo origen desde el navegador. Es el pendiente más grande de la app |
| **Montar lo que vuelva de las seis fases** | Lo que entrega GPT nunca se commitea tal cual: se monta en TypeScript, se corre la compuerta y se commitea desde acá |
| **Swales dentro de un polígono** | Última herramienta abierta del lote C; erosión, cortafuegos y silvopastura están en producción |
| **Los cinco asientos del plan Estudio** | No existen en la base. Es una feature, no un ajuste |
| **Cierre automático de trazado** | El camino ignora `elementoPoli` y `espejoPendiente` |
| **`MapaTerrenoApp.tsx`** | 3.991 líneas, cierra sobre 393 identificadores. Los reducers de `useReliefShader` y de dibujo libre son lo que queda |
| **El balance hídrico que no llega al informe** | Está calculado y no se muestra donde haría falta |
| **El proxy de teselas Terrarium sin guardar** | Agujero conocido del tope por superficie: `grillaElevacion.ts` cae ahí cuando `/api/dem` no responde |

### De Jonatan, y no se hace sin él

| Qué | Por qué |
|---|---|
| **Las cartas a los organismos de estadística** | Las manda él. No yo |
| **Las URL de webhook** en los paneles de Mercado Pago y PayPal | Panel de terceros |
| **Una transacción real controlada**: alta, primer cobro, cancelación en prueba, cambio de plan | Es el único bloque donde equivocarse cuesta plata |
| **Decidir si el cobro sigue abierto al público** o se restringe con `ACEQUIA_PAYMENTS_TEST_EMAILS` | Decisión comercial |
| **Cloudflare bloquea a ClaudeBot** por su cuenta | Hay que arreglarlo en el dashboard; afecta al posicionamiento que ya está en producción |
| **Validar `/mapa` e `/informe/*`** | Están detrás de login y no se verifican desde el navegador del agente |
| **Pasos 6 a 9 del runbook de mudanza a acequia.app** | La web nueva está fuera del repo y no compila para Vercel |
| **`PLAN-embalse-vaso-real.md`, pasos 3 a 5** | Bloqueados en una decisión suya |
| **El tercer espejo de Overpass** | Implica mandarle coordenadas de predio a un tercero: la decisión es suya |

### Cerrado, y conviene no volver a abrirlo

CPER en secano, el riego de Calabozo y los dos cortes de Ukulinga: inconfirmables.
Los dos trabajos de Arizona sobre el *Jornada Range*. El rastrojo de cultivo. El
portal EDI de los LTER (403 verificado en cuatro endpoints). Los sitios GIAHS de
la FAO como fuente de geometría: la FAO **no publica el polígono**, y si lo
publicara su licencia no serviría. Las cañadas reales del MITECO como geometría:
son líneas. Los límites de *crofting* escoceses: producto pago. El commit
malformado `b5f85ed`: arreglarlo cuesta un *rebase* de todo septiembre y un
redeploy de los dos proyectos para corregir una línea de asunto.

---

## Las seis fases

Están en orden de **rendimiento por token gastado**, que no es el orden de
importancia. La fase 1 es la más chica y la que más desbloquea; las fases 3, 4 y
5 son las más grandes y las que más tardan.

| Fase | Qué | Tamaño medido | Qué desbloquea |
|---|---|---|---|
| **1** | Licencias y vías de dato | 5 preguntas abiertas + 5 fuentes + 85 saberes | **2 saberes activos de 85.** Una respuesta de una línea prende código ya escrito |
| **2** | Los ocho números sin fuente | 8 lotes, uno por número | Ocho lugares donde la app imprime un número que nadie puede verificar |
| **3** | Fichas: Australasia y Oceanía | **101 ecorregiones en cero** de 107 | Donde el modificador heredado está **mal**: los *rangelands* áridos australianos con `pasturas −15` |
| **4** | Fichas: Indomalaya | **72 de 106** | Donde hay más gente sin ninguna ficha: el Decán, Indochina, Borneo, el Himalaya |
| **5** | Fichas: África tropical y austral | **109 de 116** | 31 ecorregiones de sabana: el bloque de ganadería extensiva más grande del mundo |
| **6** | Prácticas fechadas | **192 entradas**: 32 fichas en cero + 132 bajo el piso | La capa que llena las 220 fichas con `saberes: []` |

### Fase 1 — Licencias y vías de dato

`_encargos/ENCARGO_FASE_1_LICENCIAS_Y_VIAS.md`

Tres bloques. **A**: las cinco preguntas que quedaron abiertas del encargo de
licencias —el censo de EE.UU., la OGL británica, las vías pecuarias, cuatro
institutos de estadística sudamericanos, Global Mangrove Watch y los institutos
de suelo del Magreb—. **B**: cinco fuentes de dato nombradas —CHELSA V2.1, el CEM
del INEGI a 15 m, CONEAT de Uruguay, el IGN argentino y el ecuatoriano, y qué
entrega realmente WIS2—. **C**, que es el grueso: de los **81 saberes
territoriales documentados sin geometría**, cuáles tienen polígono publicado bajo
una licencia admitida.

La regla que hace difícil esta fase y que ya costó dos veces: **la licencia que
vale es la del dato concreto, con sus términos adicionales leídos.** PDOK decía
CC BY 4.0 en el portal y CC BY-NC-ND en la ficha del dataset. La FAO dice CC BY
4.0 y le atornilla una cláusula que prohíbe el uso «in conjunction with the
promotion of a commercial enterprise». Y los dos saberes que hoy funcionan se
activaron los dos por la misma vía —OpenStreetMap bajo ODbL—, que es la ruta
probada y la que el encargo nombra primero.

### Fase 2 — Los ocho números sin fuente

`_encargos/ENCARGO_FASE_2_NUMEROS_SIN_FUENTE.md`

Ocho lugares identificados con archivo y número: el **triángulo textural USDA**
(hay diez clases simplificadas de las doce, escritas de memoria); la **eficiencia
de aplicación de los once sistemas de riego** (0,55 a 0,95, sin una sola cita, y
el número **divide** la necesidad de agua); la **pérdida por conducción** (no se
descuenta nada); el **agua de bebida de equinos y caprinos** (los otros cuatro
grupos sí tienen tabla publicada); el **coeficiente equivalente vaca de los
caprinos** (0,12, y el archivo mismo dice «sigue sin fuente»); el
**espaciamiento de postes** (salió por no tener con qué reponerlo); la **demanda
de la huerta en mm/día**; y la **simultaneidad del riego** (hoy se suman los
picos como coincidentes, cuando para viviendas la app ya usa un coeficiente
publicado).

Cada entrada tiene que venir con la tabla o la ecuación símbolo por símbolo, las
unidades en el nombre del campo, el rango de validez, qué pasa afuera, y **un
caso resuelto con sus números** para escribir el test. Y la serie junto con la
ecuación cuando la fuente publica una regresión: el lote 20 trajo cuatro ventanas
de lluvia con r² de 0,03 a 0,95 y **el 0,95 lo ponía un solo año de palanca**.

### Fases 3, 4 y 5 — Las fichas ecológicas

`ENCARGO_FASE_3_FICHAS_AUSTRALASIA.md`, `..._FASE_4_FICHAS_INDOMALAYA.md`,
`..._FASE_5_FICHAS_AFRICA.md`

**429 de las 846 ecorregiones de RESOLVE tienen ficha. 417 no**, y las que no
reciben el modificador del bioma global y nada más. El reparto medido:

| Reino | Con ficha | Total |
|---|---|---|
| Neotropic | 174 | 179 |
| Nearctic | 114 | 115 |
| Palearctic | 94 | 205 |
| Indomalayan | 34 | 106 |
| Afrotropic | 7 | 116 |
| Oceania | 6 | 24 |
| Australasia | 0 | 83 |
| Antarctica | 0 | 18 |

América está cerrada. Europa, Medio Oriente y el norte de África, cerrados. Lo
que falta es **Asia, África tropical y Oceanía**, y las tres fases van en el
orden en que el número hace daño:

- **Australasia primero**, aunque sea el reino con menos gente, porque es el
  único donde el modificador heredado está **equivocado** en una dirección cara:
  diez ecorregiones de desierto australiano heredan `pasturas −15` con la razón
  *«la carga que aguanta es baja y el error se paga con desertificación»*, y el
  Pilbara, el Mulga y el Mitchell Grass son una de las ganaderías extensivas más
  grandes del mundo, con literatura de carga animal propia. Es el mismo error que
  ya se corrigió cuatro veces: la badia siria, la meseta de Anatolia, la pradera
  de pastos cortos y las High Plains.
- **Indomalaya después**, por población. Acá el error grande que motivó el
  encargo original —el `huerta −25` del bosque húmedo escrito sobre el oxisol
  amazónico y heredado sobre andisoles volcánicos— **ya está matizado**, y las 33
  fichas montadas en septiembre resuelven el arco volcánico. Lo que queda son el
  cinturón seco del Decán, Indochina, Borneo, la península malaya y el Himalaya:
  las regiones con más gente del planeta sin ninguna ficha.
- **África última**, y con una advertencia honesta: acá el modificador global
  **probablemente acierte**, porque la sabana africana *es* el arquetipo del
  bioma y el Congo *es* el caso del que salió el `huerta −25`. Esta fase agrega
  profundidad, no corrección. Vale igual por las 31 ecorregiones de sabana, por
  el *fynbos* sobre arenas de cuarcita bajo modificadores escritos para el olivo,
  y por el Karoo suculento, que es un desierto de lluvia **invernal**.

Las tres fases comparten el contrato: `saberes` siempre vacío, nativa y cultivo
separados, siete especies con binomial, el campo `suelos` cruzando dos bases, y
el modificador con el **mecanismo** y no la conclusión. Y la regla que menos se
espera: **confirmar un modificador global vale igual que corregirlo.** Convierte
un delta heredado en un delta respaldado.

Palearctic queda afuera de las seis fases a propósito: son 111 ecorregiones
—Siberia, Asia central, China, Japón, Corea— y es lo que viene después. Antarctica
no va nunca.

### Fase 6 — Prácticas fechadas

`_encargos/ENCARGO_FASE_6_PRACTICAS.md`

408 entradas sobre 200 fichas, con el piso en tres por ficha: **60 fichas tienen
una, 72 tienen dos y 68 llegaron a tres.** Y 54 fichas están en cero, de las
cuales **32 son de Indomalaya, montadas en septiembre y nunca relevadas** —el
único hueco real de cobertura— y 22 son decisiones de no sostener una afirmación
con una fuente que no alcanzaba. **Esas 22 no se tocan.**

Faltan 192 entradas. El piso de fuentes no lo pone el gusto: lo midió el
catálogo, que tiene 416 URLs sobre 123 dominios —85 de PubMed Central, 47 de la
FAO, 41 de SciELO, 30 de UNESCO, 27 del NPS— **y ninguna de periodismo**.

---

## Cómo se trabaja cada fase, que es lo que la abarata

El contrato completo está en `_encargos/GPT_LOCAL_REGLAS.md` y se pega al
principio de cada chat, antes del `ENCARGO_FASE_*.md`. Lo esencial:

- **Un chat nuevo y suelto por fase.** Sin Proyecto y sin memoria: arrastrar
  veinte lotes en un hilo es pagar los veinte en cada respuesta nueva.
- **Un bloque JSON por lote**, nada de prosa. Las explicaciones van en el campo
  `nota` de la entrada, no en el chat.
- **No releer lo entregado.** Cada lote es independiente.
- **Lotes chicos.** Es más barato cortar y seguir que reintentar un lote largo.
- **Apagar «mejorar el modelo para todos»** en la configuración de datos de
  ChatGPT antes de arrancar. La carpeta es local; la conversación no.

Y lo que pasa cuando llega:

```bash
node _research/validar-entrega-gpt.mjs "C:/Arte y Tierra/encargos-gpt/entregas/<carpeta>"
```

El script chequea la forma —campos obligatorios, URLs, ids repetidos, ids que no
existen en el catálogo— y después **elige una de cada diez entradas, con semilla
fija, para abrir la fuente y leerla**. Si una no aguanta, **vuelve el lote
entero**: el error es del método con que se escribió, no de esa entrada. Una cita
inventada es corta, plausible y pasa cualquier revisión de código.

Después se monta en el TypeScript, se corre la compuerta y se commitea. **Lo que
entrega GPT nunca se commitea tal cual.**

---

## Las seis reglas que salieron de los veinticuatro lotes de forraje

Valen para cualquier encargo y están escritas adentro de los seis documentos,
pero conviene tenerlas juntas:

1. **Ruta nombrada, no tema.** Con URL, con patrón de catálogo, con lista de ids.
   Un encargo que pide «tres o cuatro sitios con la capa separada» vuelve vacío
   cuatro veces seguidas; uno que pide «las 37 fichas de esta colección, copiá su
   tabla de columnas» es una lista finita.
2. **«Declarado imposible» vale revisarlo siempre.** Dos de dos: en el lote 16 la
   verificación declarada imposible salió derivando con una ecuación del mismo
   trabajo, y en el 20 reconstruyendo una tabla que el PDF desordena —y dio
   vuelta el resultado principal del lote—.
3. **Pedir qué cuenta el número, en un campo aparte y obligatorio.** Lo que más
   rechazó entregas no fue una cita falsa ni un bioma errado: fue **la fuente
   correcta midiendo otra magnitud**. Biomasa en pie donde hacía falta producción
   anual; NPP de sotobosque donde hacía falta oferta consumible. Eso no lo atrapa
   ningún muestreo de citas.
4. **La serie junto con la ecuación.** Es la única forma de sacar un año y ver si
   el r² lo pone un solo dato.
5. **Autores completos y en el orden de la cita.** Quién firma es evidencia: una
   entrega atribuyó un trabajo a tres autores que no eran, y los reales incluían a
   los autores de otra serie del mismo sitio ya montada, lo que cambiaba cómo se
   leía una discrepancia del 42 %.
6. **Un campo verificado se puede llenar bien y seguir estando mal.** Un lote
   trajo el bioma verificado con coordenada, `ECO_ID` y `BIOME_NUM` en las cuatro
   entradas, y una seguía mal: la coordenada consultada no era la del sitio medido
   sino **un punto que lo representa**, 65 km al este, y los dos puntos caen en
   biomas distintos. Cuando se pide un campo verificado hay que pedir **sobre
   qué** se verificó.
