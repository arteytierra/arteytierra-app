# Respuestas del encargo de licencias

Acá se anota lo que vuelve de `ENCARGO_LICENCIAS.md`, pregunta por pregunta. La
entrega cruda llega a `C:\Arte y Tierra\encargos-gpt\entregas\licencias\` —que
está afuera del repositorio a propósito— y se valida con
`validar-entrega-gpt.mjs` antes de leerse en detalle. Esto es el resultado
después de la validación y después del muestreo, no la entrega.

| # | Pregunta | Estado | Lote |
|---|---|---|---|
| 1 | Polígonos de los sitios SIPAM/GIAHS de la FAO | **Cerrada: no hay polígono** | `01.json`, 10/10/2026 |
| 2 | Licencia del censo de los Estados Unidos (AIANNH) | abierta | — |
| 3 | Texto de la OGL v3.0 del Reino Unido | abierta | — |
| 4 | Vías pecuarias del MITECO: licencia y si alguien las tiene como polígono | abierta | — |
| 5 | Si INE Bolivia / DANE / INEC Ecuador / INE Uruguay cambiaron términos | abierta | — |
| 6 | Global Mangrove Watch y los institutos de suelos del Magreb | abierta | — |

---

## 1. Los sitios SIPAM/GIAHS de la FAO — cerrada, y por una razón anterior a la licencia

**La FAO no publica la geometría.** Ni polígono, ni shapefile, ni GeoJSON, ni
WMS, ni WFS. La ficha de cada sitio es una página descriptiva con texto, foto,
país, año y estado; no enumera un formato vectorial ni declara condiciones para
uno. Verificado el 10/10/2026 sobre la ficha de la chakra amazónica de Napo
—abierta y además recorrida buscando cualquier enlace a `.zip`, `.shp`,
`.geojson`, `.kml`, `.gpkg`, WMS, WFS, ArcGIS o GeoServer: **cero**—.

El mapa interactivo de GIAHS existe, pero es una visualización: no ofrece
descarga ni menciona licencia. Que un sitio aparezca ubicado en un mapa de la
web no es una geometría reutilizable.

Así que la pregunta por la licencia no llegó a plantearse: **no se puede
licenciar un dato que no está publicado.** El pendiente decía «la FAO publica el
polígono; hay que ver bajo qué licencia» y la premisa era falsa.

### Y si la publicara, tampoco alcanzaría

Esto es lo que el lote agregó y vale más que la respuesta: la FAO tiene **dos
regímenes distintos** y ninguno de los dos sirve para acequia.

Los *Terms and Conditions* separan explícitamente las bases estadísticas del
resto del contenido web. Para «todo el otro contenido» —donde caen las fichas
GIAHS— la frase es literal:

> «All other content on the FAO website (except where otherwise indicated), may
> be copied, printed and downloaded for private study, research and teaching
> purposes, and for use in **non-commercial** products or services»

Y manda los usos comerciales a `copyright@fao.org` o al formulario de licencia.
NC es descalificante: acequia cobra.

El otro régimen —el que a primera vista parecía la puerta buena— son las bases
estadísticas corporativas, que sí están bajo **CC BY 4.0**. Pero la CC BY no
viene sola: las *Statistical Database Terms of Use* le atornillan unos
«Additional terms of use» cuyo punto 1, *Prohibited uses*, dice que los datasets

> «shall not be used for or in conjunction with the promotion of a commercial
> enterprise and/or its product(s) or service(s)»

y antes acotan el propósito a «research, statistical, scientific and
evidence-based decision-making purposes», agregando que no se usarán «for any
other purposes and/or in any other manner than as expressly provided herein».

O sea: una CC BY 4.0 con una restricción de propósito y una cláusula
no-promocional encima. Si lo que la FAO llama CC BY 4.0 no se puede usar en un
producto que se vende, entonces **la FAO está cerrada como familia de fuentes de
dato para acequia**, no sólo estas cuatro fichas. Vale la pena anotarlo porque el
rótulo «CC BY 4.0» invita a darlo por admitido, y acá no lo es: es el mismo error
que el de PDOK, donde la política del portal decía CC BY 4.0 y el registro del
dataset decía CC BY-NC-ND. **La licencia que vale es la del dato concreto, con
sus términos adicionales leídos.**

Esto no toca las **citas**. `practicasHistoricas.ts` cita fichas de la FAO como
fuente de una afirmación —rótulo y URL— y eso es una referencia, no una
redistribución de dato. Lo que queda cerrado es montar geometría o datasets de
la FAO adentro de la app.

### Viñales no era de la FAO

Cuarta pregunta del lote, y la respuesta corrige un error mío: **Viñales no es un
sitio GIAHS.** La página regional de América Latina y el Caribe dice que hay 11
sistemas designados en 5 países —Brasil, Chile, Ecuador, México y Perú—. Cuba no
está. Viñales es un paisaje cultural de la UNESCO, que es otra cosa y otra
licencia, y así estaba bien anclado en el inventario de saberes
(`cac_vinales_y_conuco_cubano` cita UNESCO, no FAO). El error estaba sólo en los
documentos de pendientes, que lo habían metido en la lista de la FAO; nunca llegó
al código.

### Qué se hace con esto

Nada que montar: los tres saberes mexicanos y ecuatorianos **no se activan**, y
el motivo ya no es «falta verificar la licencia» sino «no hay geometría y el
portal es NC». Siguen siendo dos saberes activos de 85. Si alguna vez hace falta
el polígono de Xochimilco o de Tlaxcala, la vía no es la FAO: es la cartografía
nacional —INEGI, en el caso mexicano, cuyos Términos de Libre Uso sí autorizan
uso comercial— o un acuerdo con quien administra el sitio.

**Lo que esto desbloquea es tiempo:** era el pendiente nº 3 de los saberes y
figuraba como «un encargo de una tarde». Ya está contestado y la respuesta es
que no había nada que conseguir.
