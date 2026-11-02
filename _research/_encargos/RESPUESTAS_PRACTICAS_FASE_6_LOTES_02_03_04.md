# Respuestas — prácticas, fase 6, lotes 02, 03 y 04

Entrega del 01/11/2026. Tres lotes de seis entradas, 18 en total, sobre los 30
ids de Indomalaya que quedaban en cero. Montadas: **11 entradas sobre 9 fichas**.

El resultado en una línea: **de las 11 que entraron, una sola cayó en la ficha
que la entrega había propuesto.** Las otras diez se movieron después de
preguntarle a RESOLVE por la coordenada del lugar declarado.

No es un descuido de la entrega. Es la confirmación de la regla que salió del
lote 01: el `id` es una propuesta y lo que se verifica es el `lugar`. Y esta vez
quedó medido por qué los nombres invitan al error: "gangética superior" suena al
sur de Bihar, "montano de Sri Lanka" suena a Kandy, "deciduo del Chao Phraya"
suena al proyecto de riego entre Chai Nat y Sing Buri. Ninguna de las tres cosas
es cierta en el polígono.

## Cómo se verificó

Para cada entrada: se geocodificó el lugar declarado en Nominatim, se le preguntó
el ECO_ID al FeatureServer público de RESOLVE —el mismo que usa
`app/api/bioma/route.ts`— y se buscó ese ECO_ID en las tablas `ecorregiones*.ts`,
que son 431 mapeos. Donde el primer punto cayó cerca de un límite se agregaron
puntos: el taluka de Mulshi, el distrito de Siulak y los tres distritos de
Bangladesh se consultaron tres y cuatro veces cada uno.

**Un aviso para la próxima vez:** RESOLVE devolvió una vez un conjunto de rasgos
vacío para un punto que sí tiene polígono —la aldea de Air Terjun— y en la
consulta siguiente devolvió 279. Una sola consulta no es prueba: si la respuesta
viene vacía, hay que repetirla antes de concluir que el punto no tiene
ecorregión.

## Las 11 que entraron

| Ficha montada | Práctica | ECO_ID | La entrega proponía |
|---|---|---|---|
| `valle_brahmaputra` | Arroz con peces en la parcela inundable | 222 | **la misma** |
| `gangetica_inferior` | Ahar y pyne, cosecha de escorrentía en serie | 238 | `gangetica_superior` |
| `sri_lanka_humedo_bajo` | Huerto agroforestal doméstico de Matara | 274 | la misma |
| `sri_lanka_humedo_bajo` | Huerto-bosque kandyano | 274 | `sri_lanka_montano` |
| `pantanos_sundarbans` | Dhap, el huerto flotante de jacinto de agua | 282 | `gangetica_inferior` |
| `pantanos_irrawaddy` | Arroz de aguas profundas sembrado al voleo en seco | 234 | la misma |
| `pantanos_chao_phraya` | Arroz de aguas profundas y arroz flotante | 224 | la misma |
| `pantanos_chao_phraya` | El régimen de agua de la planicie y la cuenca de retardo | 224 | `chao_phraya_deciduo` |
| `pantanos_rio_rojo` | Terraplenes sobre los lomos naturales del cauce | 266 | la misma |
| `sumatra_bajo` | Jungle rubber, el caucho adentro de una agroforesta | 278 | la misma |
| `sumatra_montano` | Canela, café y papa en bosque comunitario (HKm) | 279 | la misma |

Siete entradas conservan la ficha propuesta y cuatro se movieron, pero de las
siete que la conservan, cinco se confirmaron con un punto que no era el que la
entrega daba: el lugar estaba bien y el id acertó, lo cual no es lo mismo que
haber sido verificado.

## Las 7 que no entraron, y por qué

**Dos porque el polígono no tiene ficha.** Son pendientes de la fase 4, no de
esta:

- *Selección de arroces tolerantes a la salinidad*, islas habitadas de South 24
  Parganas. Gosaba, Kakdwip y Patharpratima dan **323, Sundarbans mangroves**,
  que no tiene ficha curada. La entrega lo había puesto en `pantanos_sundarbans`,
  que es el 282 y es el pantano de agua dulce del lado de Bangladesh. Ironía
  útil: los huertos flotantes, que venían propuestos en otra ficha, son los que
  caen en el 282.
- *Cultivos mixtos y rotación de la zona seca de Myanmar*. Nyaung-U,
  Kyaukpadaung y Magway dan **294, Irrawaddy dry forests**, sin ficha. La entrega
  lo había puesto en `irrawaddy_deciduo`, que es el 235 —moist deciduous— y es
  otra cosa: el cultivo mixto de la zona seca responde a la sequía, no a la
  humedad.

**Una porque el lugar queda partido y no se pudo decidir.** Los *devrai* de
Mulshi: el taluka cruza la cresta de los Ghats y está medido de los dos lados
—Mulshi pueblo y la represa dan 254, el montano; Paud y Pirangut, diez kilómetros
al este, dan 253, el deciduo—. El artículo que la entrega cita está en Wiley
detrás de una verificación anti-bot, así que no se pudo leer dónde están los
quince bosques sagrados que estudió. Un resumen de buscador dice que están "en
zonas inaccesibles de mayor altitud cerca de la línea de cresta", lo que apuntaría
al 254, pero eso no es haber leído el trabajo y no alcanza para montar.

**Cuatro porque la fuente citada no abre.** Ninguna de las cuatro es culpa de la
entrega salvo la última:

- *Soppinabetta de Sringeri*: el host del IISc (`wgbis.ces.iisc.ac.in`) tiene el
  certificado TLS mal emitido para ese nombre. No abre ni con curl ni con fetch.
- *Arroz de Wayanad*: `nopr.niscpr.res.in` no responde, dos intentos con timeout
  de conexión. Puede ser transitorio.
- *Arroz de recesión del Tonle Sap*: el PDF del gobierno de Camboya da **403**,
  también en un navegador de verdad. El archivo no está servido en esa URL.
- *Pastoreo Toda del Nilgiri*: **la URL es el índice de la revista, no el
  trabajo.** La página de *Asian Highlands Perspectives* lista el monografía de
  Walker —"Sacred Dairies, Dairymen, and Buffaloes of the Nilgiri Mountains in
  South India", vol. 21, pp. 187-256— pero no enlaza su texto. Es el mismo error
  que el DOI de memoria de Rapa Nui: la cita existe y apunta al contenedor, no a
  la obra. Esta sí hay que marcarla como regla nueva.

El informe del IRD que sostenía la entrada del proyecto Borommathad tampoco abre
—el sitio está en mantenimiento—, pero ahí hubo reemplazo: Molle, Chompadist y
Bremard cubren el mismo régimen de agua del Chao Phraya en acceso libre, y la
entrada entró con esa fuente.

## El muestreo obligatorio

`validar-entrega-gpt.mjs` no marcó ni un error de forma en los cuatro lotes de la
carpeta y sorteó tres fuentes para abrir:

1. `valle_brahmaputra` → NITI Aayog. **Abierta y leída.** Aguanta y además da más
   de lo que la entrega trajo: 431 ha, 11 distritos, 867 beneficiarios, 2018-19 a
   2020-21, +10 a 25 % de rendimiento, 7 t/ha/año de arroz y ~2 t/ha de pescado,
   y el tamaño del hueco (2,3 M ha con potencial, 5,43 % de la producción
   pesquera del estado). Todo eso está ahora en el detalle.
2. `irrawaddy_deciduo` → PDF de la Universidad de Kyoto. Baja pero es un escaneo
   sin capa de texto: no se puede leer acá. La entrada no entró igual, por ficha
   inexistente.
3. `chao_phraya_deciduo` → IRD en mantenimiento. La entrada no entró con esa
   fuente.

## Reglas nuevas para el encargo

1. **La fuente tiene que apuntar a la obra, no al contenedor.** Un índice de
   revista, una página de volumen o un listado de artículos no sirven aunque
   nombren el trabajo. Si el texto no está enlazado, la entrada no se manda.
2. **Si la fuente no abre, la entrada no se manda.** Cuatro de dieciocho cayeron
   por esto. Vale la pena abrirla antes de escribir la entrada, no después.
3. **El lugar con coordenada vale el doble.** Donde la entrega dio aldea y
   distrito —Air Terjun, Pantanaw, Gosaba— la verificación tardó un minuto. Donde
   dio una región —"Región de Mulshi", "11 distritos del estado"— hubo que
   sondear el límite a mano, y en un caso no alcanzó.

## Lo que queda de Indomalaya

De los 30 ids en cero, 9 se abrieron. Quedan **21**, y conviene separarlos:

- **Vuelven a pedirse con otra fuente** (la práctica existe y está identificada):
  `ghats_norte_montano` (soppinabetta), `ghats_sur_montano` (pastoreo Toda del
  Nilgiri, o el arroz de Wayanad que también cae acá), `pantanos_tonle_sap`
  (arroz de recesión), `ghats_norte_deciduo` (devrai de Mulshi, con la aldea o la
  coordenada del bosque sagrado).
- **Esperan ficha, no fuente**: la práctica del manglar habitado de Sundarbans
  (ECO_ID 323) y la de la zona seca de Myanmar (ECO_ID 294). Montar esas fichas
  es fase 4.
- **Sin relevar todavía**: `ghats_sur_deciduo`, `sri_lanka_humedo_bajo` ya tiene
  dos, `sri_lanka_montano`, `gangetica_superior`, `pantanos_chao_phraya` ya tiene
  dos, `chao_phraya_deciduo`, `pantanos_rio_rojo` ya tiene una, `pinar_toba`,
  `java_occidental_bajo`, `java_oriental_bali_bajo`, `java_bali_montano`,
  `pantanos_borneo_suroeste`, `luzon_montano`, `mindoro`, `negros_panay`,
  `mindanao_montano`, `mindanao_visayas_oriental`, `decan_central_hardwickia`,
  `pantanos_sumatra`.

El *subak* balinés sigue siendo el mejor lote siguiente, por el mismo motivo de
siempre: UNESCO y FAO GIAHS son HTML que abre.

## Una trampa nueva que conviene anotar

`pinar_toba` no es Toba. El ECO_ID 305 —Sumatran tropical pine forests— incluye
el valle de Kerinci, 400 km al sur del lago Toba, y su límite con el 279 pasa por
el medio del distrito de Siulak: el centroide del distrito da 305 y la aldea
donde la fuente trabajó, dos kilómetros al este, da 279. Es el mismo problema que
`luzon_montano` y el quinto caso de nombre-contra-geometría de esta cadena de
encargos. Si alguna vez entra una práctica del valle de Kerinci con un punto
apenas distinto, va a caer en una ficha que se llama como un lago que está a
cuatrocientos kilómetros.
