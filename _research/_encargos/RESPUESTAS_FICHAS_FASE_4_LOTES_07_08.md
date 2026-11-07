# Veredicto — fichas Indomalaya, lotes 7 y 8: las dos turberas

Entrega del 06/11/2026. Dos entradas, **las dos montadas**, con dos correcciones
de fondo y un número agregado que la entrega tenía en la mano y no había subido a
la ficha.

| lote | ECO_ID | ficha | veredicto |
|---|---|---|---|
| 7 | 286 Tonle Sap-Mekong peat swamp forests | `pantanos_tonle_sap_mekong_turba` | montada, con el modificador forestal reescrito |
| 8 | 280 Sumatran peat swamp forests | `pantanos_turba_sumatra` | montada, con el modificador forestal reescrito y el límite de napa agregado |

## Lo que la entrega hizo bien, y conviene que siga haciendo

**Declaró las ausencias en vez de rellenarlas.** Las dos fichas dicen que no se
pudo resumir HWSD v2, SoilGrids ni PEATMAP sobre el polígono, y las dos dicen
explícitamente que **no heredan el reparto del polígono vecino** —el 277 para
Sumatra, el 285 para el Tonlé Sap— que es exactamente lo que estaba tentador
hacer, porque los nombres son casi iguales. Eso es el comportamiento que el
encargo pedía y es por lo que las dos entran con confianza media y no baja.

**Separó un ensayo de un rendimiento.** La ficha de Sumatra no presenta los
3,7 t/ha del Jajar Legowo como lo que rinde el sonor: dice que el sonor
tradicional promedia 1-2 t/ha y que el 3,7 es un tratamiento experimental. La
fuente, releída, dice exactamente eso.

**Corrigió dos nombres botánicos con fuente.** One Earth escribe «Callophyllum
lowii» y «Shorea teysmaniana»; la entrega usa `Calophyllum lowii` y
`Shorea teysmanniana` y lo dice. Y donde One Earth pone `Melaleuca leucadendron`
para Indochina, la entrega va a Kew y usa `Melaleuca cajuputi`, que es la nativa
de Camboya y Vietnam. Las dos correcciones se montaron.

## Las dos correcciones al montar

### 1. El modificador forestal cancelaba lo que el bioma no dice

Las dos entradas proponían `forestal: delta 0` pisando el `+20` del bioma
húmedo, con esta razón:

> «Se cancela el +20 general porque no describe una plantación forestal segura
> para suelos orgánicos.»

El problema es que **el +20 nunca propuso una plantación**. Lo que dice, textual,
es que «el sistema productivo que sostiene este bioma es agroforestal de varios
estratos, no de suelo limpio». Y un sistema nativo de varios estratos sobre turba,
sin bajar la napa, es justamente la paludicultura que la propia entrega nombra
como la forma que funciona. Cancelar el +20 con ese argumento es cancelar otra
cosa, y es la trampa que ya está anotada para este bloque: un `delta 0` cancela, y
cancelar con el argumento equivocado borra la corrección que apuntaba al lado
correcto.

**La cancelación se mantiene, con otra razón.** Lo que no se puede regalar es el
número positivo, porque el camino habitual para llegar a una plantación en turba
es drenar, y Hooijer et al. miden que el hundimiento y la pérdida de carbono
siguen siendo considerables **incluso con la napa más alta que una plantación
puede sostener**. La app no sabe si el predio va a drenar, así que el cero es una
abstención y la razón lo dice. En el 286 hay además un motivo propio: el polígono
es un mosaico y en el sector de arcillas aluviales el +20 sería correcto, así que
ahí el cero es «no se puede distinguir dónde cae el predio» y no un veredicto
sobre el polígono entero.

### 2. El −25 de huerta se confirma, pero la razón no puede ser la del bioma

Las dos entradas confirman el valor y cambian el mecanismo —airear turba la oxida,
no es lixiviación—, y eso está bien y se montó. Lo que se agregó es el test que lo
fija: la razón de las dos fichas **no** puede decir «lixiviados», porque confirmar
un número con el argumento equivocado es tan malo como cambiarlo mal.

## El número que la entrega tenía y no había subido

El estudio de Perigi, releído, trae el único número accionable del lote: el
**límite crítico de napa en turba es 40 cm**, fijado por el reglamento indonesio
**PP 57/2016**, y la medición de campo en agosto-septiembre dio **45-47 cm**, ya
pasado, sin bloqueo de canales. La entrega lo mencionaba de costado; ahora está en
el texto de suelos de la ficha, que es donde alguien que mira su predio lo puede
usar: es un número que se mide con un pozo.

## Las cuatro fuentes del lote muestreado, abiertas

El validador sorteó el lote 8. Las cuatro abren y las cuatro dicen lo que la
entrega dice:

- **One Earth 280**: ID 280, tamaño 8.771 (×1000 ha) = 87.710 km², «over 220 bird
  species», bintangur (`Callophyllum lowii` en la fuente), turba de «over 30.000
  years», los incendios de 2015, cigüeña de Storm y pato de alas blancas. ✓
- **Imanudin et al. 2024 (UNSRI)**: «The land survey was conducted in the dry
  season, namely August-September… the groundwater level was in the range of
  45-47 cm… all values had exceeded the critical compliance limit of 40 cm», y la
  cita del reglamento `PP 57. 2016`. ✓
- **Hooijer et al. 2012**: «Subsidence in the first 5 yr after drainage was found
  to be 142 cm, of which 75 cm occurred in the first year. After 5 yr… around
  5 cm yr⁻¹», y «Over 5 yr after drainage, 75 % of cumulative subsidence was
  caused by peat oxidation, and after 18 yr this was 92 %». ✓
- **Cahya et al. 2022 (CIFOR/BIOVALENTIA 8(1):69)**: «average productivity of
  1–2 tons ha⁻¹» para el sonor, «rice productivity of 3.7 tons ha⁻¹» para Jajar
  Legowo, diseño de parcela dividida en Perigi, diciembre 2019 a abril 2020. ✓

**Un detalle que no se pudo confirmar:** la entrega dice que las parcelas del
ensayo se prepararon «sin quema». El trabajo no lo afirma en su sección de
métodos: lo que describe son tratamientos de método de siembra y variedad. El
contraste que la fuente sí sostiene es entre la práctica tradicional —una vez al
año, sin mantenimiento— y el espaciamiento y las variedades mejoradas. Esa frase
quedó fuera del texto montado.

**Y una nota de método para la próxima:** dos de las cuatro fuentes fallaron la
primera vez por el User-Agent. La de CIFOR devolvió 403 con un UA de navegador y
200 con `curl` pelado; la de UNSRI, peor, **truncó en silencio** —6 kB y después
71 kB de un PDF de 370 kB, sin código de error— y recién bajó completa sin UA. Un
PDF truncado se ve como una fuente que «no abre», y eso es exactamente lo que haría
devolver un lote bueno.

## Lo que esto destraba, y lo que todavía falta

Montar estas dos fichas apagó tres tests que decían que había prácticas rechazadas
**por falta de polígono**. Ahora:

- **Las doce fincas del Tonlé Sap** (12°39′-12°41′ N, 104°47′ E, las doce dan 286)
  estaban verificadas y esperando ficha. La ficha llegó. Falta el **texto de la
  entrada**, que no quedó guardado en ningún veredicto: vuelve por
  `ENCARGO_FASE_6_REPESCA.md`.
- **El sonor de Perigi** (280) igual: ficha montada, fuente releída y confirmada,
  falta el texto.
- **El lebak de Pampangan** (280) sigue afuera, y ahora por un solo motivo en vez
  de dos: el artículo *propone* un esquema de manejo —reservar lebung, acompasar
  la siembra— y no registra lo que se hizo. El contrato pide un hecho fechado.

Lo que sigue sin resolver de las dos fichas es lo que el encargo preguntaba y la
entrega no pudo contestar, con razón: **qué parte de cada polígono es turba y
cuánto espesor tiene**. No se resolvió con una cifra inventada y así tiene que
seguir hasta que haya un recorte real de HWSD v2, SoilGrids o PEATMAP sobre los
polígonos 280 y 286.
