# Fase 2 — los números sin fuente: veredictos

Un lote por número. Cada veredicto dice qué se leyó, qué se verificó, qué quedó
en el código y qué falta.

---

## Lote 1 — `triangulo_textural_usda` · **cerrado, y la entrega volvió vacía**

**Lo que dijo la entrega.** Que buscó el Soil Survey Manual 2017 del NRCS, abrió
la página oficial del manual y la del Soil Texture Calculator, y que *«el PDF que
contiene las definiciones exactas no se pudo abrir con la herramienta de
consulta»*. Por eso no entregó la tabla: *«no incluyo una tabla basada solo en
texto indexado»*.

Esa última decisión está bien. Negarse a transcribir de memoria o de un resumen
indexado es exactamente lo que el encargo pide. Lo que falló no fue el criterio:
fue la conclusión sobre el acceso.

**El PDF abre.** Con `curl` pelado, sin cabeceras ni cookies:

```
https://www.nrcs.usda.gov/sites/default/files/2022-09/The-Soil-Survey-Manual.pdf
200  application/pdf  18.096.773 bytes
```

639 páginas. Texto extraído con `pypdf`. Las doce definiciones están en la
**página 124**, sección *Definitions of Soil Texture Classes and Subclasses*; el
triángulo es la **figura 3-7** de la 125; la agrupación general es la **tabla
3-1** de la 126; las nueve fracciones de tierra fina están en la **120**.

**Cuarta de cuatro.** Es la cuarta vez que una entrega declara inaccesible una
fuente que abre: la Universidad de Arizona dos veces —403 en todo camino de
descarga, sale con un `fetch` del mismo origen al bundle `TEXT`— y los PDF de
`census.gov`, que se sirven directo. El patrón ya no es una casualidad: **los PDF
de sitios `.gov` se sirven sin pelea y la herramienta de consulta de GPT no los
abre.** Los lotes de esta fase que viven en un PDF de un sitio oficial pasan a
ser míos.

### La verificación, que es más fuerte que los ejemplos que el encargo pedía

El encargo pedía las doce clases con sus límites y un caso resuelto. Las doce
definiciones son **desigualdades lineales**, así que hay una prueba mejor que un
puñado de puntos: que **partan el triángulo**.

Barridas las **5.151 celdas** enteras de arcilla/arena/limo en paso de 1 %, cada
una cae en **exactamente una** clase:

| | |
|---|---|
| celdas sin ninguna clase | **0** |
| celdas con más de una | **0** |

Un límite mal leído —un `>=` por un `>`, un 27 por un 28— habría dejado un hueco
o un solape. La partición perfecta prueba a la vez que la transcripción está bien
leída y que el código la implementa. Y el reparto queda fijado por un test:
arcilloso 1540, franco limoso 840, franco arenoso 565, franco arcillo arenoso
392, franco 349, franco arcilloso 325, franco arcillo limoso 273, arcillo limoso
231, arcillo arenoso 210, limoso 186, arenoso franco 155, arenoso 85.

### Las dos frases ambiguas, y cómo las resuelve la geometría

El manual tiene dos límites escritos de un modo que no dice si el extremo entra.
Probadas las cuatro combinaciones sobre el triángulo entero:

**1. «more than 20 to 45 percent sand»** (franco arcilloso). Sólo `arena > 20` y
`arena <= 45` cierra la partición. Las otras tres lecturas dejan 13 celdas
colgadas, 13 repetidas, o las dos cosas. Y es lo que dice el texto: *more than*
20, *to* 45. La redacción y la geometría coinciden.

**2. «between 70 and 90 percent sand»** (arenoso franco). Acá aparece algo más
lindo: **los dos números son redundantes**. Si `limo + 2·arcilla < 30` entonces
la arena ya pasa de 70 por aritmética, y si la arena pasa de 90 entonces
`limo + 1,5·arcilla` no puede llegar a 15. Las dos condiciones lineales ya
encierran el intervalo. Con **una sola excepción**: la celda
`(arcilla 10, arena 90, limo 0)`, que es el punto donde la recta
`limo + 1,5·arcilla = 15` —el borde entre arenoso y arenoso franco— toca el lado
de limo cero. Ahí, y sólo ahí, hace falta leer el 90 como inclusive; si no, ese
vértice del triángulo queda sin clase.

### Lo que estaba mal, medido

Había **dos** clasificadores en el repo, y los dos estaban mal.

**`clasificarTextura` de `lib/suelos.ts`** tenía **diez** salidas, no doce, y el
comentario arriba decía «(simplificada)» sin citar nada. Contra el manual:

| | |
|---|---|
| celdas mal clasificadas | **1.699 de 5.151 — el 33,0 %** |
| clases que no podía devolver nunca | franco arcillo arenoso, franco arcillo limoso |

Los errores grandes, en celdas: arcillo limoso llamado «Arcilloso» **231** (o sea
*todas*, no acertaba una); franco arcillo arenoso llamado «Franco» **224**;
franco limoso llamado «Franco-arcilloso» **196**; franco arcillo limoso llamado
«Franco-arcilloso» **168**; franco arcillo arenoso llamado «Arcillo-arenoso»
**168**.

**`claseUSDA` de `lib/emplazamiento.ts`** tenía las doce —se había escrito aparte
justamente porque la otra estaba mal— pero se apartaba del texto en **43 celdas
(0,83 %)**, todas sobre las líneas de borde, y las cuatro familias eran **el
mismo error**: `>=` donde el manual dice *more than*, con lo cual el borde caía
en la clase **más gruesa**. Más grueso es más permeable: en el campo de
infiltración **sobra tasa de absorción** y el campo sale chico, y en la USLE
**falta erodabilidad**. Las dos del lado inseguro. Y una de esas 43 celdas es el
vértice `(10, 90, 0)`, el mismo que decide la lectura del «90».

### Esto no era un rótulo: cambia un número físico

`lib/usle.ts` indexa la erodabilidad **K** por el **nombre** de la clase. Así que
la clase equivocada entraba en el cálculo de erosión. Corregido el clasificador,
la K se mueve en **1.180 de las 5.151 celdas**: sube en 958 y baja en 222.

El caso que importa: un **franco arcillo arenoso** con arena 46 y arcilla 28 la
escalera lo llamaba «Arcillo-arenoso», cuya K es **0,017** contra **0,040**. Un
franco arcillo arenoso estaba recibiendo la erodabilidad de una arcilla arenosa,
**2,35 veces más baja**. Eso es erosión **subestimada**, que es el lado del que
nadie se entera hasta que se fue el suelo. Pasa en **273** celdas; en las otras
392 de esas dos clases la K no se mueve, porque la escalera las llamaba «Franco»
o «Franco-arcilloso» y las dos valen 0,040, que es el defecto.

> Esta medición desarmó lo primero que escribí en el doc de `usle.ts`, que era
> que a las dos clases nuevas la corrección no les cambiaba el número. Es falso
> en 273 de sus 665 celdas. Corregido ahí y acá.

### Lo que falta, con ruta nombrada

La **tabla de K por clase textural** de `usle.ts` sigue sin primario, y el motivo
salió de abrirlo: **Agriculture Handbook No. 537** (Wischmeier y Smith, 1978),
4,4 MB, 69 páginas, abierto también con `curl` desde `ars.usda.gov`, **no publica
ninguna tabla de K por clase textural**. Publica otras dos cosas:

1. El **nomograma de erodabilidad** (figura 3, p. 10), con su ecuación textual
   `100 K = 2.1 M^1.14 (10^-4)(12 - a) + 3.25(b - 2) + 2.5(c - 3)`, su límite de
   validez —menos del 70 % de limo más arena muy fina, y arriba de eso *el propio
   manual dice que el cambio no está descripto por ninguna ecuación*— y su
   precisión declarada: contra K medidos de 0,03 a 0,69, el 65 % de las
   soluciones difería en menos de 0,02 y el 95 % en menos de 0,04.
2. La **tabla 1** (p. 9) con los K medidos de **23 suelos con nombre propio**.
   Ahí están un «Cecil sandy clay loam» y un «Hagerstown silty clay loam», que
   eran la tentación. No se usan: son suelos, no clases, y el manual escribe en
   la misma página que la erodabilidad *«often varies within a standard texture
   class»*. Los franco limosos de esa tabla van de 0,05 a 0,69, un factor
   catorce.

Para correr el nomograma faltan **tres entradas que ningún servicio de los que
usa la app devuelve**, y están enumeradas en `FALTA_PARA_EL_NOMOGRAMA_K`: el
porcentaje de **arena muy fina** (0,10–0,05 mm) por separado —SoilGrids da la
arena entera, y el nomograma manda pasar la arena muy fina de la fracción arena a
la fracción limo antes de calcular `M`—, el **código de estructura** y la **clase
de permeabilidad del perfil**. Las tres se leen en un pozo, no en un mapa.

### Qué quedó en el código

| Archivo | Qué |
|---|---|
| `apps/terreno/lib/textura.ts` | **nuevo**: el único clasificador. Las doce definiciones con su frase del manual al lado, las nueve fracciones de tierra fina, la tabla 3-1, la normalización a 100 y el `null` cuando la suma se va más de 5 puntos. |
| `apps/terreno/lib/suelos.ts` | `clasificarTextura` delega. |
| `apps/terreno/lib/emplazamiento.ts` | `claseUSDA` es un reexporte; `grupoLTAR` devuelve `null` en vez de caer en el grupo del medio; `campoDeInfiltracion` no calcula sin clase. |
| `apps/terreno/lib/usle.ts` | el nomograma, su rango, su precisión y las tres entradas que faltan. |
| `apps/terreno/tests/unit/suelo/textura.test.ts` | **nuevo**, 39 tests. |

### Un pendiente que esto abrió

`grupoLTAR` devolvía el **grupo II** —«francos gruesos», el del medio— cuando no
reconocía la clase. Un dato de suelo roto dimensionaba un campo de infiltración
con una tasa que nadie midió. Ahora devuelve `null` y el campo entero no se
calcula. Es el patrón de siempre: acequia no falla estrellándose.
