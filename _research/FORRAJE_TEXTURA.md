# La textura del píxel, que no se identificaba

**11/11/2026.** Qué tenía roto la identificación de la clase de textura de
H-TESSEL, cómo se midió y con qué quedó reemplazada.

Lo que se montó está en `apps/terreno/lib/aguaDelPerfil.ts`. Esto es la
trazabilidad. El lote anterior —el escurrimiento, commit `7e6acbf`— encontró el
defecto de paso y lo anotó; esto lo arregla y además **corrige el diagnóstico**,
porque la causa no era la que se anotó.

---

## 1. Por qué hay que identificar nada

ERA5-Land publica **contenido volumétrico de agua** (m³/m³). El balance de Wight
y Hanks necesita **fracción de agua útil** (0 a 1). Para pasar de uno al otro
hacen falta el punto de marchitez y la capacidad de campo del suelo de ese
píxel, y el modelo de suelo que corre adentro de ERA5-Land —H-TESSEL— los toma
de una tabla de seis clases de textura, la **Tabla 8.9 del IFS Documentation
CY45R1, Parte IV, cap. 8.6.2**:

| Clase | θsat | θcap | θmarch | Agua útil |
|---|---|---|---|---|
| gruesa | 0,403 | 0,244 | 0,059 | 0,185 |
| media | 0,439 | 0,347 | 0,151 | 0,196 |
| media-fina | 0,430 | 0,383 | 0,133 | 0,251 |
| fina | 0,520 | 0,448 | 0,279 | 0,170 |
| muy-fina | 0,614 | 0,541 | 0,335 | 0,207 |
| orgánica | 0,766 | 0,663 | 0,267 | 0,396 |

**Verificado contra una segunda fuente.** Los mismos números están en la tabla
de parámetros HYPRES que publica el ESDAC de la Comisión Europea, como el ajuste
de **horizonte superficial** (topsoil) de Wösten, Lilly, Nemes & Le Bas (1999),
*Geoderma* 90:169-185 — que es de donde H-TESSEL los tomó. Coinciden dígito por
dígito. La tabla del repo no tiene errores de transcripción.

Qué clase le tocó a cada punto lo dice el campo `slt` del reanálisis, y **no se
puede conseguir**:

- no viaja por Open-Meteo, que es el único canal por el que acequia pide esta
  serie;
- y tampoco está en el catálogo de ERA5-Land. En el foro de ECMWF (Michela, 16
  de diciembre de 2019) la respuesta es explícita: la textura de suelo es «otro
  campo del modelo climático (invariante) que todavía no se provee en el
  catálogo de ERA5-Land». Habría que ir al CDS de Copernicus, que pide cuenta.

**La ruta de reemplazarlo por SoilGrids quedó cerrada por falta de fuente.** La
idea era obvia: pedir % de arcilla y arena a SoilGrids y mapear a la clase
FAO/HYPRES. Pero los **límites de arcilla y arena que definen cada clase** no
están publicados en ninguna fuente citable que se haya podido leer: no están en
`hy_meta.htm` del ESDAC, ni en el `Hypres_param.doc`, ni en la documentación de
HiHydroSoil v2.0. Según el contrato de `motor-de-calculo` —la fuente primero, el
código después— ese código no se escribe.

Entonces queda **una sola señal**: el contenido volumétrico no puede pasar la
saturación de su clase, y en una serie de sesenta años la roza. Eso es la huella.

## 2. El defecto, que eran tres y no uno

### 2.1. La regla decía «y la roza» y no lo verificaba

El `regla` de la constante decía textualmente *«el máximo de la serie no puede
pasar la saturación de su clase, y la roza»*. La primera mitad estaba
implementada. **La segunda no.** El código filtraba las clases cuya saturación
el máximo no pasa y después elegía **la más cercana**, sin pedirle que estuviera
cerca.

Consecuencia, medida: el píxel de arena profunda del Kalahari (−22,0 / 22,0), 65
años de serie, máximo **0,360**. El techo más bajo que queda es el de `gruesa`,
0,403: **43 milésimas arriba**. La regla devolvía `gruesa` igual. Y errarle entre
`gruesa` y `media-fina` cuesta **0,556 de fracción de agua útil**, o sea 83 mm
sobre 150.

Eso es exactamente el modo de falla que persigue el `CLAUDE.md` de este repo: no
se estrella, imprime un número plausible y equivocado.

### 2.2. El margen se medía entre diferencias, y eso no puede separar un par pegado

La regla pedía `margen_minimo_al_segundo = 0,02` sobre la **diferencia de
distancias**: `|θsat₂ − max| − |θsat₁ − max| ≥ 0,02`. Pero `media` satura en
0,439 y `media-fina` en 0,430: **nueve milésimas**. Dos clases más juntas que el
margen nunca pueden cumplirlo, haga lo que haga el máximo.

Barriendo todos los máximos posibles, lo que la regla vieja podía devolver era:

```
  (ninguna)    0,300 – 0,349
  gruesa       0,350 – 0,406
  (ninguna)    0,407 – 0,433
  media        0,434 – 0,442     <- una ventana de 8,5 milésimas
  fina         0,443 – 0,523
  muy-fina     0,524 – 0,617
  organica     0,618 – 0,769
```

**`media-fina` era inalcanzable.** Para ningún máximo posible. Y `media` salía
sólo en una ventana de 8,5 milésimas, que es del orden del ruido del propio dato
(§3). Las dos clases más comunes de ERA5-Land.

### 2.3. Y por eso el camino estaba apagado en el sitio de calibración

En Sidney, Montana —el único sitio contra el que está medido todo este motor— el
máximo que ve la ruta de producción es **0,430**, que es la saturación de
`media-fina` clavada. Con la regla vieja eso devolvía `null`, y sin textura la
ruta de índices **cae a la cadena continua**, que es la degradación que el lote
del agua inicial había ido a eliminar. El camino principal del lote anterior
estaba apagado justo donde está la calibración.

## 3. La corrección del diagnóstico: es el huso, no el dato

El acta del escurrimiento anotó que el máximo de Sidney pasó de 0,434 a 0,430 y
concluyó que *«lo más probable es que el reanálisis se haya revisado entre un día
y el otro»*. **Eso está mal, y la causa es otra.**

Open-Meteo entrega **medias diarias**, y el huso horario que se pide es el que
define dónde empieza y termina el día. La saturación, en cambio, es un techo
**instantáneo**. Promediar 24 horas no puede dar más que el máximo horario, y
*qué* 24 horas se promedian cambia el resultado. Recalculado el máximo sobre todos
los archivos cacheados, cada uno con el huso con el que se pidió:

| Sitio | UTC | hora local | diferencia |
|---|---|---|---|
| Sidney, Montana (`America/Denver`) | 0,4340 | 0,4300 | −0,0040 |
| Swift Current, Saskatchewan | 0,4350 | 0,4390 | +0,0040 |
| Pampa argentina | 0,5150 | 0,5150 | 0,0000 |

Las dos mediciones son correctas: el acta midió un pedido en UTC y el lote del
escurrimiento midió un pedido en hora local. **El dato no cambió.** Lo que hay es
±4 milésimas de ruido de ventana de promediado, y los dos techos más juntos de la
tabla están a nueve. Cuatro milésimas es poco para casi todo y decisivo para
esto.

Hay dos cosas más que esto zanja:

- **La premisa «la media diaria subestima sistemáticamente» es falsa.** En Swift
  Current el máximo en hora local cae en **0,4390 clavado**, que es la saturación
  de `media`: una media diaria *puede* llegar al techo. Por eso no hizo falta
  bajar la serie horaria, que era el plan B (el script quedó escrito y sin
  correr).
- **Y el huso de la ruta no se cambia.** Pedir UTC arreglaría Sidney y rompería
  el balance, que necesita que el día sea el día **local**: la lluvia de un día y
  la evapotranspiración de ese día tienen que ser del mismo día. Lo que se
  cambia es la regla, que ahora absorbe el ruido.

## 4. El par que no se separa, y cuánto cuesta no separarlo

`media` y `media-fina` a nueve milésimas es información que **no está en el
dato**: una serie puede perfectamente quedarse nueve milésimas corta de su propia
saturación. Ninguna regla la saca. La pregunta útil no es cómo separarlas sino
cuánto cuesta errar, y está medido tres veces.

### 4.1. Es el único par así, y el más barato de los quince

Para cada par de clases, dos números: cuán juntos están los techos —que es lo
que el máximo puede resolver— y la **máxima diferencia de fracción de agua útil**
sobre el rango de humedad compartido, que es lo que la elección equivocada cuesta
aguas abajo. `fraccionDeAguaUtil` es lineal por tramos con quiebres en el
marchitez y en la capacidad de campo de cada clase, así que el máximo cae
**siempre** en un quiebre o en un extremo: evaluar esos seis puntos es exacto, no
un muestreo.

| Par | d(θsat) | max \|Δf\| |
|---|---|---|
| **media vs media-fina** | **0,009** | **0,144** |
| muy-fina vs orgánica | 0,152 | 0,308 |
| fina vs muy-fina | 0,094 | 0,452 |
| gruesa vs media | 0,036 | 0,526 |
| fina vs orgánica | 0,246 | 0,543 |
| gruesa vs media-fina | 0,027 | 0,556 |
| … | … | … |
| gruesa vs orgánica | 0,363 | 1,000 |

De los quince pares, **uno solo** tiene los techos más juntos que
`margen_minimo_al_segundo`; los otros catorce están a 0,027 o más, así que el
techo los separa. Y ese único par es también **el más barato de los quince, por
lejos**: 0,144 contra 0,308 del que le sigue. Hay un factor de dos donde poner un
tope y poder justificar dónde: `discrepancia_maxima = 0,20`.

### 4.2. La literatura tampoco las separa

Contra el caso resuelto que ya tenía el archivo —las 159 mediciones con sonda de
neutrones de la Figura 5 de Wight y Hanks (1981), digitalizadas—, corriendo la
conversión completa con cada clase:

| Clase forzada | EAM | RMSE |
|---|---|---|
| media | 0,1725 | 0,2193 |
| media-fina | 0,1742 | **0,2163** |
| las otras cuatro | 0,39 – 0,41 | — |

**El EAM prefiere `media` y el RMSE prefiere `media-fina`**, y las dos difieren
menos de una milésima en el EAM. Las otras cuatro clases quedan dos veces y media
peor, o sea que la huella sí separa lo que tiene que separar: lo que no separa es
este par, y el dato de campo tampoco.

### 4.3. Aguas abajo cuesta 2 %, y caerse cuesta 33 %

Las 66 temporadas de Sidney corridas con cada una de las dos clases, y sin
textura —que es la cadena simulando el invierno, la degradación a la que se caía
antes—:

```
               contra los doce      distribución        Yp      kilos
                EAM     sesgo      p10    mediana     kg/ha    en el p10
 media         0,072   +0,070     0,452    0,820      1.449       655
 media-fina    0,061   +0,057     0,432    0,774      1.550       670
 sin textura   0,142   +0,140     0,677    0,935      1.283       869
```

Tres cosas.

**Las dos clases se parecen mucho más entre sí que cualquiera de las dos a la
cadena**: 0,072 y 0,061 contra 0,142, o sea menos de la mitad del error.

**Y en los kilos se parecen todavía más, porque el error se cancela.** Es la
primera vez en este bloque que las dos direcciones juegan a favor: la clase más
húmeda baja el índice, y el `Yp` se despeja **dividiendo** por el índice, así que
sube. 0,452 × 1.449 contra 0,432 × 1.550 son **655 y 670 kg/ha**: un 2 %. (El
`Yp` sale de un corte de 1.200 kg/ha en la temporada de índice mediano; los kilos
son el `Yp` por el índice del p10, que es la cuenta con la que se dimensiona la
carga.) En el día del rebrote, `media-fina` entrega 5,8 mm menos que `media` sobre
150, con extremos de −19 y +6,4.

**Caerse cuesta dieciséis veces más.** La cadena pone 869 kg/ha en la cola seca,
un **33 %** arriba (contra `media`; contra `media-fina`, 30 %), y es la cola seca
la que dimensiona la carga.

O sea que devolver `null` para no tener que elegir entre dos clases que difieren
un 2 % costaba un 33 %.

## 5. La regla nueva

Tres pasos declarados, y la duda se declara en vez de anular:

1. **El techo descarta.** Quedan las clases cuya saturación el máximo no pasó,
   con `tolerancia_por_arriba = 0,003` de perdón. La elegida es la de **techo más
   bajo** entre las que quedan, que es la más ajustada.
2. **Y lo tiene que rozar.** Si al máximo le falta más de
   `acercamiento_maximo = 0,02` para llegar a ese techo, devuelve `null`: la
   serie no se acercó a ninguna saturación y la clase más cercana no prueba nada.
   El tope es **cinco veces** el ruido del huso (§3), y en los siete píxeles que
   identifican el acercamiento real es de 6 milésimas o menos.
3. **La duda se escribe.** Las clases de arriba que quedaron a menos de
   `margen_minimo_al_segundo` del máximo van en `en_duda`, y lo que costaría
   haber errado contra la peor de ellas va en `discrepancia`. Si esa discrepancia
   pasa `discrepancia_maxima = 0,20`, *entonces* sí devuelve `null`: una duda
   cara no vale la pena resolverla a la suerte.

Lo que la regla nueva puede devolver, barriendo todos los máximos posibles de
medio en medio milésimo:

```
  (ninguna)    0,3000 – 0,3830
  gruesa       0,3835 – 0,4060
  (ninguna)    0,4065 – 0,4100
  media-fina   0,4105 – 0,4190
  media-fina   0,4195 – 0,4330   + duda(media)
  media        0,4335 – 0,4420
  (ninguna)    0,4425 – 0,5000
  fina         0,5005 – 0,5230
  (ninguna)    0,5235 – 0,5940
  muy-fina     0,5945 – 0,6170
  (ninguna)    0,6175 – 0,7460
  organica     0,7465 – 0,7690
  (ninguna)    0,7695 – 0,8000
```

**Las seis clases son alcanzables**, cada una en los 20 milésimos abajo de su
techo, y los huecos del medio son píxeles que no rozan nada.

## 6. Píxel por píxel

Dieciocho series cacheadas, cada una con el huso con el que se pidió. Lo que
decía la regla vieja y lo que dice la nueva:

| Píxel | huso | días | máximo | vieja | nueva | |
|---|---|---|---|---|---|---|
| Sidney | UTC | 23.742 | 0,4340 | media | media | limpia, roza a 0,005 |
| Sidney | `America/Denver` | 24.107 | 0,4300 | **null** | **media-fina** | duda: media |
| Swift Current | UTC | 12.784 | 0,4350 | media | media | roza a 0,004 |
| Swift Current | local | 24.107 | 0,4390 | media | media | roza a 0,000 |
| Sand Hills, Nebraska | UTC | 23.742 | 0,4350 | media | media | roza a 0,004 |
| Loess de Iowa | UTC | 23.742 | 0,4380 | media | media | roza a 0,001 |
| Quindío, Colombia | UTC | 23.742 | 0,4380 | media | media | roza a 0,001 |
| Pampa argentina | local | 24.107 | 0,5150 | fina | fina | roza a 0,005 |
| Sahel de Malí | UTC | 23.742 | 0,4240 | **null** | **media-fina** | duda: media |
| Kalahari (arena) | UTC | 23.742 | 0,3600 | **gruesa** | **null** | no roza nada (0,043) |

Dos píxeles que estaban apagados se prenden —Sidney en hora local, que es el de
producción, y el Sahel— y uno que daba un número equivocado se apaga.

**Lo que el muestreo no cubre:** ninguno de los ocho píxeles salió `gruesa`,
`muy-fina` ni `organica`. Es informativo —el `slt` de ERA5-Land está dominado por
texturas medias, o sea justo por el par degenerado— pero significa que las
ventanas de esas tres clases están probadas contra la aritmética y no contra una
serie real. La bajada quedó en 8 de 16 píxeles por un HTTP 429 de Open-Meteo.

### Lo que se probó y se descartó: el piso seco como desempate

Si el techo no separa `media` de `media-fina`, el **piso** debería: sus puntos de
marchitez son 0,151 y 0,133, a 18 milésimas. En Sidney el percentil 1 de la capa
de 28-100 cm da **0,157** contra el 0,151 publicado de `media`, que se ve muy
bien. Pero no sirve:

- en **Quindío** el percentil 1 da **0,344**, porque el perfil nunca se seca;
- en **Swift Current** da **0,045**, con mínimo de **−0,001**: el agua líquida se
  va cuando el suelo se congela.

El piso mide el **clima**, no la textura. Queda escrito como
`verificacion_que_no_decide`, con el por qué.

## 7. Lo que quedó montado

- **`apps/terreno/lib/aguaDelPerfil.ts`**: `texturaDelPixel` reescrita, el tipo
  `TexturaDelPixel` con `acercamiento`, `en_duda` y `discrepancia`, la función
  nueva `discrepanciaDeAguaUtil`, y tres constantes con lo medido:
  `LAS_CLASES_QUE_NO_SE_SEPARAN`, `EL_HUSO_MUEVE_EL_MAXIMO` y
  `LA_DUDA_CUESTA_MENOS_QUE_CAERSE`. Advertencia nueva: `textura_en_duda`.
- **Las dos rutas de `clima-diario`** exponen la duda en `textura_del_pixel`, y
  la de índices la agrega a `advertencias`. **Las dos claves de caché subieron**:
  `clima-eo-coef-v2` → `v3` (el objeto guardado cambió de forma) y
  `clima-indices-v5` → `v6` (el resultado de la identificación cambió). Sin eso un
  hit viejo devolvería objetos sin los campos nuevos y con la textura vieja.
- **`CorteDeForrajeBloque.tsx`**: quinto guardarrail. Las dos rutas identifican la
  textura **por separado**, cada una del máximo de su propio pedido; si eligieron
  clases distintas, los dos índices salieron de dos suelos distintos y los kilos
  no se muestran.
- **`tests/unit/economia/aguaDelPerfil.test.ts`**: 49 tests. Entre ellos, que las
  seis clases sean alcanzables barriendo todos los máximos; que la clase elegida
  sea siempre la del techo más bajo que el máximo no pasó; que
  `discrepanciaDeAguaUtil` dé lo mismo que un barrido fino en los quince pares;
  que de los quince el techo no separe más que a uno y que sea el más barato; que
  el Kalahari devuelva `null`; que el 0,430 de producción devuelva `media-fina`
  con la duda escrita; y la coherencia interna de las tres constantes nuevas.

## 8. Lo que queda abierto

1. **El `slt` de verdad.** Si alguna vez se abre una cuenta del CDS de
   Copernicus, el campo está ahí y la huella deja de ser necesaria. Mientras no
   haya cuenta, esto es lo que hay.
2. **Los límites de arcilla y arena de las clases FAO/HYPRES.** Si aparecen
   publicados en una fuente citable, SoilGrids alcanza para desempatar `media` de
   `media-fina` y la duda se cierra. Sin la fuente, el código no se escribe.
3. **Las tres clases que ningún píxel del muestreo tocó** (`gruesa`, `muy-fina`,
   `organica`). Falta probarlas contra series reales: la bajada murió en 8 de 16
   píxeles por rate limit.
4. **La serie horaria.** No hizo falta —Swift Current demuestra que la media
   diaria llega al techo— pero mediría el ruido del promediado en vez de
   acotarlo con tres sitios. El script quedó escrito.
5. **Qué pasa si el píxel es mixto de verdad.** H-TESSEL usa la clase
   *dominante*, pero un píxel de 9 km puede ser dos suelos. La huella no puede
   verlo y nadie publicó cuánto importa.
