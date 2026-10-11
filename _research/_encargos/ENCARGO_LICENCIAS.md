# Encargo — seis licencias, y cada una desbloquea meses de trabajo

*Pegar primero `GPT_LOCAL_REGLAS.md` y después esto. Entregas en
`C:\Arte y Tierra\encargos-gpt\entregas\licencias\NN.json`.*

---

## Qué clase de pregunta es ésta

Hay capas enteras de la app construidas, probadas y apagadas, esperando saber si
un dato se puede usar en un producto que cobra. **No es una pregunta técnica: es
leer la licencia del conjunto concreto.**

Y hay una lección que costó caro y gobierna este encargo entero:

> La licencia que vale es **la del conjunto de datos concreto**, no la del portal
> que lo publica.

El caso: el servicio neerlandés PDOK declara CC BY 4.0 como política general del
portal. Se dio por bueno y se escribió un informe diciendo que el dataset de
límites de waterschappen era viable. Al ir a buscarlo, la ficha del dataset en el
Nationaal Georegister declaraba en `gmd:otherConstraints` un enlace a **CC
BY-NC-ND 4.0**: prohíbe el uso comercial y prohíbe las obras derivadas, o sea
prohíbe las dos cosas que esta app hace. El polígono terminó entrando por
OpenStreetMap, por otra vía.

Así que de cada pregunta hace falta **la página del conjunto concreto, con la
frase literal de la condición**, y no la página de términos del organismo.

## Qué licencias sirven y qué no

Sirven, porque permiten uso comercial y obras derivadas con atribución:
**CC0, CC BY 3.0 y 4.0, ODbL 1.0, ODC-BY, la Open Licence de Statistics Canada**
y equivalentes.

**No sirven**, y es categórico:

- Cualquier cosa con **NC** (no comercial): la app cobra.
- Cualquier cosa con **ND** (sin obras derivadas): a un polígono hay que
  simplificarlo para que viaje al navegador, y eso es una obra derivada.
- "Uso libre y gratuito mencionando al organismo" **como condición propia de un
  ministerio**: puede ser de espíritu parecido a CC BY y no es CC BY; queda como
  caso a decidir, no como aprobada.
- La ausencia de licencia. Que una obra de un gobierno probablemente no tenga
  derecho de autor es una deducción razonable, y **una deducción no es una
  autorización**: alcanza para citar una cifra, no para montar los tabulados.

Si la respuesta es "no declara ninguna", eso **es** la respuesta y hay que
entregarla así, con la URL de la página donde debería estar y no está.

## Las seis preguntas

Una por lote, y el lote 01 son las cuatro de la FAO juntas porque es el mismo
portal.

### 1. Los polígonos de los sitios SIPAM/GIAHS de la FAO — ✅ CONTESTADA 10/10/2026

**No pedir este lote de nuevo.** La respuesta está en
`RESPUESTAS_LICENCIAS.md`: la FAO no publica la geometría de los sitios, su
contenido web es no comercial, y Viñales no es un sitio GIAHS. Lo que sigue se
deja escrito nada más que para que se entienda qué se preguntó.

¿La FAO publica la **geometría** (polígono, shapefile, GeoJSON, WMS) de los
sitios reconocidos, y bajo qué licencia? Interesan cuatro:

- Chinampas de Xochimilco, México
- Metepantle de Tlaxcala, México
- Chakra amazónica de Napo, Ecuador
- Viñales, Cuba

Para cada uno: si hay polígono, dónde está, en qué formato, qué licencia
declara **la página de ese conjunto**, y si la licencia de los datos de la FAO
(que suele ser CC BY-NC-SA para algunas colecciones y CC BY para otras) es la
que aplica a este material en particular.

Si no hay polígono publicado y lo que hay es una descripción con un mapa de
imagen, decirlo: cambia completamente lo que se puede hacer.

### 2. El censo de los Estados Unidos, datos de pueblos originarios

El dato está publicado y descargable hasta el nivel de bloque, con 704 áreas
AIANNH. Lo que falta es una licencia declarada. Pregunta concreta:

¿Hay **alguna** página oficial del Census Bureau que declare términos de uso,
licencia o condiciones de redistribución para los productos del censo decenal y
para los *TIGER/Line shapefiles*? Interesan la frase literal y la URL. Si la
única cosa que existe es una declaración general sobre obras del gobierno
federal y 17 U.S.C. § 105, también sirve saberlo con la cita exacta.

### 3. La Open Government Licence v3.0 del Reino Unido

No es para desbloquear nada: es para que haya una decisión tomada con el texto
delante. ¿Qué permite exactamente la OGL v3.0 en cuanto a **uso comercial** y
**obras derivadas**? La cláusula literal.

Y aclarar lo que ya se sabe para que no se confunda con una esperanza: los
límites de *crofting* escoceses **no** están bajo OGL —son del Crofting Register
de Registers of Scotland y derivan de Ordnance Survey—, así que admitir OGL no
los desbloquea. La pregunta es sobre la licencia, no sobre ese dataset.

### 4. Las vías pecuarias del MITECO, España

La Red General de Vías Pecuarias se puede usar "de modo libre y gratuito siempre
que se mencione al Ministerio para la Transición Ecológica y el Reto
Demográfico como autor y propietario de la información". Dos preguntas:

- ¿Esa condición está publicada en algún lado con rango de licencia, o es sólo
  una nota al pie del visor? URL y frase literal.
- ¿Existe en algún otro portal español —comunidades autónomas, IDEE— la misma
  red **en formato de polígono** y no de línea? Es la pregunta que decide: la
  cartografía del MITECO es de **líneas**, y un punto no cae "dentro" de una
  línea.

### 5. Los censos indígenas de Bolivia, Colombia, Ecuador y Uruguay

Están relevados y no se pueden montar porque el organismo que publica el censo no
declara una licencia que permita redistribuir sus tabulados en un producto pago.
**Hay cartas escritas pidiendo autorización y las manda Jonatan; esto no es para
escribir ni mandar ninguna carta.** Lo único que se pide es verificar, hoy, si
alguno de los cuatro institutos cambió sus términos:

INE Bolivia · DANE Colombia · INEC Ecuador · INE Uruguay.

Para cada uno: la URL de la página de términos o licencia de datos abiertos, la
frase literal, y si menciona uso comercial. **Si no cambió nada, eso es la
respuesta.**

### 6. Global Mangrove Watch y los atlas de suelos nacionales del Magreb

Las fichas de manglar y de norte de África son las que peor fuente propia
tienen (ver `ENCARGO_FUENTES_PROPIAS.md`). ¿Bajo qué licencia publica Global
Mangrove Watch sus capas por país, y los institutos INRA Marruecos / INRAT
Túnez / INRAA Argelia publican cartografía de suelos descargable con licencia
declarada?

## La forma de la entrega

```json
{
  "id": "giahs_xochimilco",
  "pregunta": "¿Publica la FAO el polígono del sitio y bajo qué licencia?",
  "respuesta": "si | no | no_declara | parcial",
  "licencia": "CC BY 4.0 | CC BY-NC-SA 3.0 IGO | ninguna declarada | …",
  "sirve": true,
  "por_que": "Por qué sirve o no, contra las reglas de arriba.",
  "frase_literal": "La condición, copiada tal cual de la página.",
  "formato_dato": "GeoJSON | shapefile | WMS | ninguno, sólo imagen | tabular",
  "fuentes": [{ "label": "…", "url": "…" }],
  "verificacion": "…",
  "nota": ""
}
```

`sirve` es un juicio contra las reglas de arriba, y si hay duda va `false` con la
duda en `por_que`. **En licencias, la duda se resuelve del lado de no usar el
dato**: montar una capa y tener que sacarla después cuesta más que no montarla.
