# Respuestas del encargo de licencias

Acá se anota lo que vuelve de `ENCARGO_LICENCIAS.md`, pregunta por pregunta. La
entrega cruda llega a `C:\Arte y Tierra\encargos-gpt\entregas\licencias\` —que
está afuera del repositorio a propósito— y se valida con
`validar-entrega-gpt.mjs` antes de leerse en detalle. Esto es el resultado
después de la validación y después del muestreo, no la entrega.

| # | Pregunta | Estado | Lote |
|---|---|---|---|
| 1 | Polígonos de los sitios SIPAM/GIAHS de la FAO | **Cerrada: no hay polígono** | `01.json`, 10/10/2026 |
| 2 | Licencia del censo de los Estados Unidos (AIANNH) | **Cerrada: dominio público, y hay otra cosa que pesa más** | `02.json` 12/10/2026 y `04.json` 22/10/2026 |
| 3 | Texto de la OGL v3.0 del Reino Unido | **Cerrada: admitida, y entró a la compuerta** | `03.json`, 12/10/2026 |
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


---

## 2. El censo de los Estados Unidos — cerrada, y el hallazgo no es la licencia

**Respondida dos veces y las dos bien**: el lote `02.json` del 12/10/2026 y el
`04.json` del 22/10/2026. El segundo llegó porque la tabla de arriba decía
«abierta» cuando ya estaba contestada: **el lote 02 estuvo diez días sin
procesar.** Vale anotarlo como falla del circuito y no de la entrega.

### La licencia

Los shapefiles TIGER/Line del Census Bureau —que incluyen los límites **AIANNH**,
las áreas de pueblos originarios, nativos de Alaska y hawaianos nativos— son
**de dominio público**. La frase está en la sección 1.2 de la documentación
técnica, verificada el 22/10/2026 en la página 12 del
`TGRSHP2026_TechDoc.pdf`, 173 páginas:

> «Copyright protection is not available for any work of the United States
> Government (Title 17 U.S.C., Section 105). Thus, you are free to reproduce
> census materials as you see fit. We would ask, however, that you cite the
> Census Bureau as the source.»

Uso comercial, sí. Obra derivada, sí. Atribución, pedida y no exigida
jurídicamente. Cae en `dominio_publico`, que ya estaba entre las admitidas, así
que **no hizo falta agregar nada a la compuerta.**

### Las dos cláusulas de la sección 1.1, que la entrega nombró

La primera es de marca, y es operativa si algún día se monta el dato:

> «TIGER/Line® is a registered trademark of the Census Bureau. TIGER/Line cannot
> be used as or within the proprietary product names of any commercial product
> including or otherwise relevant to Census Bureau data and may only be used to
> refer to the nature of such a product.»

Y pide que cualquier reempaquetado incluya «a conspicuously placed statement to
this effect on the product's cover, the first page of the website, or elsewhere
of comparable visibility». O sea: no se puede llamar al producto con
«TIGER/Line» adentro, y hay que poner un cartel visible. Las dos cosas son
cumplibles.

### Lo que el muestreo agregó, y vale más que la respuesta

La misma página trae una tercera cláusula que la entrega mencionó sin citar, y
que para esta capa pesa **más que la licencia**:

> «the boundary information in the TIGER/Line Shapefiles is for statistical data
> collection and tabulation purposes only. Their depiction and designation for
> statistical purposes **does not constitute a determination of jurisdictional
> authority or rights of ownership or entitlement** and are not legal land
> descriptions.»

La condición 8 de la compuerta de saberes es que el punto del predio caiga
adentro del polígono, y cuando eso se cumple la app afirma que **ese saber es de
ese lugar**. Un límite que declara explícitamente no ser una determinación de
autoridad jurisdiccional ni de derechos de propiedad no es el instrumento para
sostener esa afirmación. Con un parque nacional sería una formalidad; con
territorios de pueblos originarios no lo es.

Es el patrón de la FAO al revés. Allá el rótulo decía CC-BY 4.0 y los *additional
terms* lo cerraban. Acá el rótulo dice dominio público y lo que acota es **para
qué sirve el dato**. La licencia habilita y la cláusula aconseja lo contrario.

**Entonces los trece saberes de Estados Unidos no se activan con TIGER/Line**, y
no por licencia. Lo que corresponde ahí es lo que el paso 3 de la receta de
`saberes.ts` ya decía antes de esta consulta: el acuerdo antes que el mapa. La
consulta sirvió para saber que la licencia no es el obstáculo, que también es
información.

---

## 3. La OGL v3.0 del Reino Unido — cerrada, y es la primera licencia nueva de la compuerta

El lote `03.json`, del 12/10/2026, también sin procesar hasta hoy. Verificada el
22/10/2026 contra el texto de la licencia en
`nationalarchives.gov.uk/doc/open-government-licence/version/3/`.

La **Open Government Licence v3.0** concede, con estas palabras:

> «You are free to: copy, publish, distribute and transmit the Information;
> adapt the Information; **exploit the Information commercially** and
> non-commercially for example, by combining it with other Information, or by
> including it in your own product or application.»

Es mundial, gratuita, perpetua y no exclusiva. Lo único que pide es atribución,
con una fórmula por defecto cuando el proveedor no especifica una: «Contains
public sector information licensed under the Open Government Licence v3.0.»

**Para lo que esta app hace —redistribuir un polígono ajeno adentro de un
producto que se vende, y derivar de él— es funcionalmente equivalente a una
CC-BY.** Así que entró a `LICENCIAS_ADMITIDAS` como `OGL-3.0`, con tres
condiciones de su propio texto escritas al lado:

1. **Las exenciones**: no cubre datos personales, logos, escudos ni las Armas
   Reales, insignias militares, derechos de terceros que el proveedor no está
   autorizado a licenciar, otras formas de propiedad intelectual ni documentos
   de identidad. Un polígono entra; el logo del organismo que lo publica, no.
2. **La cláusula de no-respaldo**: la licencia «does not grant you any right to
   use the Information in a way that suggests any official status or that the
   Information Provider and/or Licensor endorse you or your use of the
   Information». La atribución nombra la fuente, no puede insinuar aval.
3. **Los derechos terminan automáticamente** si no se cumplen las condiciones,
   sin período de gracia escrito.

### Qué desbloquea, y qué no

**No activó ningún saber**, y hay un test que lo prueba: las dos geometrías del
registro siguen siendo las mismas dos, las dos por ODbL. Lo que esto hace es
sacar a la licencia de la lista de excusas para los **diez saberes británicos e
irlandeses** del inventario, porque el open data del Reino Unido se publica
mayoritariamente bajo OGL. Lo que les falta sigue siendo el polígono, y ahora se
ve cuál es el problema de cada uno.

Y una ruta que sigue muerta, confirmada por la propia entrega: **esto no
desbloquea los límites de crofting escoceses.** Viven en el Crofting Register y
derivan de Ordnance Survey, que es un producto pago. Que la Crofting Commission
publique datos tabulares bajo OGL no hace OGL a la cartografía.
