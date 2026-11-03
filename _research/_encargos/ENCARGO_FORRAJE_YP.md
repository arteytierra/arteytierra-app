# Encargo — `Yp`, el rendimiento potencial del sitio

*Escrito el 02/11/2026. Es el único parámetro que falta para que un índice
hídrico se convierta en kilos de pasto, y es el pedido más valioso de toda la
cadena ganadera. No es «más mediciones de forraje»: es otra cosa, y conviene
leer entero por qué antes de buscar.*

---

## Qué se destrabó, y qué quedó trabado

El 02/11/2026 quedó escrito y probado el balance hídrico diario de **Wight y
Hanks (1981)**, «A water-balance, climate model for range herbage production»,
*Journal of Range Management* 34(4):307-311. Ese modelo entrega una fracción:

```
T / Tp     la transpiración que de verdad ocurrió, sobre la que habría
           ocurrido con agua no limitante. Entre 0 y 1.
```

Y el kilo sale de su ecuación 1, que es de una sola línea:

```
Y = Yp · (T / Tp)
```

**`Yp` es lo que falta.** Sin él hay una fracción honesta y ningún número que
alguien pueda usar para contar vacas.

## Qué es `Yp`, textualmente

El artículo lo define como el rendimiento máximo que ocurriría **con agua no
limitante**, e incluye explícitamente los efectos de **composición de especies y
fertilidad del suelo** asociados al sitio. Dice que no sale del modelo: se
estima del dato de campo del sitio.

Los dos únicos valores que el trabajo publica:

| sitio | `Yp` | lluvia de temporada medida |
|---|---|---|
| Sidney, Montana — pradera mixta, planicie glaciada arenosa | **1.300 kg/ha** | 91 a 338 mm |
| Mandan, North Dakota — pradera mixta | **2.760 kg/ha** | no publicada |

**Difieren 2,1 veces entre dos sitios de pradera mixta del mismo país, a 400 km
uno del otro.** Ése es exactamente el problema: `Yp` no se puede poner por
defecto, no se puede promediar por bioma y no se puede deducir del clima. Si se
elige mal, todo el resultado se escala mal y el número sigue pareciendo
razonable. Es la definición del error que esta aplicación no puede cometer.

En Sidney el trabajo además dice de dónde salió el 1.300: los rendimientos
parecían **topear ahí sin importar cuánta lluvia cayera**, y cita para eso a
Wight y Black (1979).

## Lo que se pide, en una línea

**Valores publicados de producción de pastizal natural en condición de agua no
limitante, cada uno con el suelo y la vegetación que lo explican.**

No se pide la producción de un año cualquiera. Eso ya se relevó en veinticuatro
lotes y está montado. Se pide el **techo**: lo que el sitio da cuando el agua no
es lo que limita.

---

## Las cuatro clases de dato que sirven, por orden de valor

### Clase A — riego o agua no limitante, medido

Producción de pastizal **nativo bajo riego**, o en un tratamiento donde la
fuente diga que el agua no limitó. Es la definición de `Yp` aplicada
directamente y es el dato más valioso que puede llegar.

Pistas: los ensayos de riego y fertilización sobre pastizal nativo del norte de
las Grandes Planicies (ARS de Sidney y de Mandan, años 60 y 70, que son el
contexto del propio trabajo); los *irrigated native pasture* de Nebraska y
Nuevo México; ensayos de riego sobre estepa patagónica y sobre pastizal
pampeano del INTA; los *lysimeter* con pastizal nativo, que por construcción
corren con agua no limitante.

Si el ensayo es factorial —agua × fertilizante— **van todas las celdas**, porque
la celda de agua alta sin fertilizante y la de agua alta con fertilizante son
dos `Yp` distintos, y la diferencia entre las dos *es* la parte de fertilidad
que la definición menciona.

### Clase B — la ficha de sitio ecológico del NRCS, año favorable

Ésta es la vía sistemática y la que más puede rendir, porque publica
exactamente la forma que hace falta: **producción anual total en lb/acre para
año desfavorable, representativo y favorable**, atada a un sitio ecológico con
su suelo, su composición de especies y su rango de lluvia.

La columna de **año favorable** es un candidato a `Yp` publicado, con dos cosas
que ninguna otra fuente trae juntas: el suelo y la composición. Las otras dos
columnas van igual, porque la relación entre las tres es un dato por sí misma.

Las dos rutas están verificadas el 02/11/2026 y devuelven 200:

```
https://edit.sc.egov.usda.gov/catalogs/esd/081B/R081BY354TX
https://edit.sc.egov.usda.gov/services/descriptions/esd/081B/R081BY354TX.json
```

El patrón es `/catalogs/esd/<MLRA>/<id del sitio>`. La página HTML es la que
trae la tabla de producción anual por comunidad vegetal; la JSON trae el suelo
(`soilFeatures`), el clima (`climaticFeatures`) y `interpretations` con la
productividad del sitio, y sirve para no transcribir el suelo a mano.

**Qué MLRA buscar, por orden:**

1. `053B`, `054`, `055`, `058` — pradera mixta de Dakota y Montana. Son la
   región donde Wight y Hanks calibraron, así que un `Yp` de ahí se puede
   comparar contra 1.300 y 2.760 y eso es una prueba.
2. `081`, `070`, `042` — Edwards Plateau, altiplano de Nuevo México, desierto
   chihuahuense. Son semiáridos con fichas muy completas.
3. `150`, `151`, `155`, `156` — marismas de Florida y del Golfo, para el
   pastizal inundable, que es el bioma que lleva tres lotes sin entrar.

Y una advertencia que ya costó un lote: **un rango de lluvia ancho esconde
error.** Si la ficha publica «381 a 508 mm», ese rango cruza umbrales y permite
que cualquier cosa parezca acertada. Va el rango textual como lo publica la
ficha, sin promediarlo.

### Clase C — el año más húmedo de una serie larga, pero sólo si la fuente lo dice

Un año húmedo **no es** un año de agua no limitante, y eso está medido: en el
trabajo de Lesbos el 45 % de la lluvia del año húmedo cayó fuera de la ventana
de crecimiento y el año seco produjo *más* por día en el tramo que importa. Y en
Sidney el año de más lluvia de la serie, 1969 con 338 mm, rindió 1.245 kg/ha,
casi lo mismo que 1970 con 218 mm.

Entonces el año más húmedo de una serie sirve **sólo si la fuente dice que el
agua no limitó ese año**, o si publica un índice de estrés hídrico que lo
muestre. Si no lo dice, la entrada va igual pero con
`"agua_no_limitante": "no_lo_dice"`, y sirve como cota inferior de `Yp` y no
como `Yp`.

### Clase D — un `Yp` despejado, declarado como tal

El propio trabajo ofrece una salida: `Yp = Y · Tp/T` para años
representativos. Para nosotros es circular —pide un `Y` medido y un modelo ya
corrido—, pero si una publicación ya lo hizo para un sitio, el número vale.
Tiene que venir con `"como_se_obtuvo": "despejado"` y con el modelo que se usó.
Un `Yp` despejado y uno medido no se mezclan.

---

## Lo que NO sirve, y por qué

1. **NPP total del rodal.** Incluye madera y raíces. Un animal no come madera.
   Ya se rechazó por esto en los lotes de bosque.
2. **Biomasa en pie.** Es un stock, no un flujo. En la tundra lo parado es de 77
   a 211 veces la producción anual; en el Delta del Paraná el potrero con más
   pasto parado entregó **menos** forraje cosechado.
3. **Pastura implantada, pradera sembrada, alfalfa, cultivo forrajero.** `Yp` es
   del sitio con su composición natural. Una pastura sembrada mide el techo de
   otra cosa. Si la fuente compara nativo contra implantado, va la fila del
   nativo y se menciona la otra en `nota`.
4. **Un `Yp` sin suelo ni vegetación.** La definición dice que `Yp` incluye
   composición de especies y fertilidad. Un número suelto no se puede transferir
   a ningún otro sitio, así que no sirve para nada. **Es el motivo de rechazo más
   probable de este encargo.**
5. **Carbono leído como materia seca.** gC/m² no es g MS/m²: se equivoca por un
   factor dos y el número sigue pareciendo razonable. `unidad` es obligatoria y
   literal.

---

## El pedido que vale más que todos los sitios juntos

Si existe un trabajo que **relacione el rendimiento potencial con algo medible
sin ir al campo** —profundidad del suelo, agua útil del perfil, textura,
nitrógeno disponible, carbono orgánico, largo de la estación de crecimiento—,
eso es más valioso que veinte sitios, porque es lo único que permitiría que la
aplicación estime `Yp` en un predio donde nadie cortó pasto nunca.

Puede venir como una regresión, como una tabla por clase de suelo, o como una
figura con sus ejes. Va con `"id": "relacion"` y con la ecuación completa, sus
coeficientes, sus unidades, su r² y la cantidad de sitios con que se ajustó.

Pistas: la literatura de *site index* y de *range site productivity* del NRCS;
los trabajos que relacionan producción con agua útil disponible (AWC) en
semiárido; Wight y Black (1979), que es la fuente del techo de 1.300 kg/ha de
Sidney y puede traer la relación adentro; y la línea de Sala, Parton, Joyce y
Lauenroth (1988) sobre producción primaria en el pastizal central de Estados
Unidos, que ya está montada como modelo de lluvia y puede tener la parte de
suelo que acá hace falta.

**Si no existe, decirlo también vale.** Una búsqueda que concluye «no hay una
relación publicada entre rendimiento potencial y propiedades de suelo para
pastizal natural» es un resultado, y cierra una pregunta abierta.

---

## La forma de cada entrada

```json
{
  "id": "sitio",
  "clase": "A_riego | B_ficha_nrcs | C_anio_humedo | D_despejado",
  "sitio": "nombre corto del lugar, para poder nombrarlo en pantalla",
  "coordenada_de_la_fuente": "textual, como la escribe la fuente",
  "bioma_verificado": { "lat": 0, "lng": 0, "eco_name": "", "eco_id": 0, "biome_num": 0, "es_el_sitio_publicado": true },
  "yp": [
    { "valor": 0, "unidad": "kg_ms_ha_anio", "fuente_idx": 0,
      "como_se_obtuvo": "medido_bajo_riego | medido_anio_favorable | ficha_anio_favorable | despejado",
      "agua_no_limitante": "la_fuente_lo_dice | se_deduce_del_tratamiento | no_lo_dice",
      "tratamiento": "qué se le hizo a la parcela: riego, fertilizante, los dos, nada",
      "periodo": "los años que cubre este número" }
  ],
  "las_otras_columnas": "si es una ficha del NRCS, los tres años: desfavorable, representativo y favorable, textuales",
  "fraccion": "herbacea_total | solo_forrajeras | sotobosque_pastoreable | no_lo_dice",
  "en_pie_o_anual": "crecimiento_anual | biomasa_en_pie | no_lo_dice",
  "suelo": "profundidad, textura, agua útil, materia orgánica, lo que la fuente publique, con unidades",
  "vegetacion": "composición de especies con su proporción, como la publique la fuente",
  "lluvia_mm": "la media anual del sitio y, si la publica, el rango de la ficha o los años medidos",
  "temperatura_c": "la media anual del sitio",
  "estacion_de_crecimiento": "largo en días o fechas de inicio y fin, si la fuente lo da",
  "que_cuenta": "aéreo o con raíces, todas las especies o sólo las forrajeras, vivo o con muerto, a qué altura se cortó",
  "donde_deja_de_valer": "incluido el tamaño del experimento y si las diferencias dieron significativas",
  "advertencia_de_la_fuente": "textual, si la fuente dice algo sobre la confiabilidad de su propia cifra",
  "region_medida": "",
  "medido_en": "el año o los años en que se MIDIÓ, no el de publicación",
  "fuentes": [{ "label": "título completo, sin abreviar", "url": "https://…" }],
  "verificacion": "qué dice LITERALMENTE la fuente y dónde se leyó; si se citó una página, el número",
  "nota": ""
}
```

Para la entrada de relación, en vez de `yp` va:

```json
{
  "id": "relacion",
  "ecuacion": "Yp = a + b · AWC    textual, como la publica la fuente",
  "coeficientes": { "a": 0, "b": 0 },
  "unidades": "qué entra y qué sale, con unidades",
  "ajuste": { "r2": 0, "n_sitios": 0, "error": "" },
  "rango_de_validez": "para qué lluvias, qué suelos y qué vegetación se ajustó",
  "fuentes": [], "verificacion": ""
}
```

## La consulta del bioma, igual que siempre

```
https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/Resolve_Ecoregions/FeatureServer/0/query
  ?geometry=<lng>,<lat>&geometryType=esriGeometryPoint&inSR=4326
  &spatialRel=esriSpatialRelIntersects&outFields=ECO_NAME,ECO_ID,BIOME_NUM&returnGeometry=false&f=json
```

Si el servicio no responde, la entrada va con `"bioma_verificado": null` y se
dice. **Nunca con un `ECO_ID` recordado.**

## Cómo entregarlo

Tres lotes, en este orden, porque el primero es el que puede cerrar el problema
y los otros dos son el respaldo:

- `encargos-gpt/entregas/yp/01.json` — **las fichas del NRCS**, clase B. Entre
  seis y diez sitios ecológicos, de las MLRA de arriba, con las tres columnas de
  producción y el suelo de cada uno. Es mecánico y es el lote que más rinde.
- `encargos-gpt/entregas/yp/02.json` — **riego y fertilidad**, clase A, más
  cualquier clase C o D que aparezca. Tres a seis sitios.
- `encargos-gpt/entregas/yp/03.json` — **la relación**, lo único del encargo que
  no es un sitio. Una entrada con `"id": "relacion"` por cada relación publicada
  que se encuentre, y si no se encuentra ninguna, el lote va con
  `"entradas": []` y el motivo escrito en `vacias`.

Cada archivo con la forma de siempre:

```json
{ "encargo": "yp", "lote": 1, "fecha": "…", "entradas": [], "vacias": [] }
```

Y la regla de los veinticuatro lotes anteriores, que acá vale el doble: **mejor
tres entradas que aguanten que ocho con una floja.** Una fuente que no se pudo
abrir es un reintento, no una ausencia: va a `vacias` con el motivo y vuelve.
