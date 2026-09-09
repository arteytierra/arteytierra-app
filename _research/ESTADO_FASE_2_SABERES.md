# Fase 2 — saberes territoriales: estado al 04/09/2026

La fase 2 estaba trabada en un empate: había 86 saberes relevados en tres
paquetes de investigación, con tres formatos distintos, y ninguno se podía usar
porque no hay geometría. La conclusión que se venía repitiendo —"documentados,
ninguno activable"— era correcta pero no avanzaba: sin capa en el código, cargar
el primer polígono seguía siendo un proyecto entero.

Eso ya está hecho. La capa existe, la regla está escrita y probada, y el registro
de geometrías está vacío **a propósito**. Agregar un saber a producción es ahora
cargar un polígono y cambiar un estado, no construir nada.

## Qué se montó

| Archivo | Qué es |
| --- | --- |
| `apps/terreno/lib/saberesTipos.ts` | `SaberTerritorial`, `GeometriaSaber`, `EstadoTerritorio`. Sólo formas. |
| `apps/terreno/lib/saberesTerritoriales.ts` | Los 85 saberes. **Generado**, no se edita a mano. |
| `apps/terreno/lib/saberes.ts` | La compuerta de activación, el registro de geometrías (vacío) y las licencias admitidas. |
| `apps/terreno/tests/unit/contexto/saberes.test.ts` | 25 tests: el inventario, la compuerta condición por condición, y que hoy no se activa nada en ningún país. |
| `_research/build-saberes-territoriales.mjs` | El generador. Se corre desde la raíz: `node _research/build-saberes-territoriales.mjs`. |

## Por qué 85 y no 86

`cac_milpa_maya_ich_kool` y `mx_ich_kool_milpa_maya` eran el mismo saber
documentado dos veces, una vez desde el inventario centroamericano y otra desde
el mexicano. Se fusionaron en `milpa_maya_ich_kool`, con la unión de las fuentes
y de las dos cautelas. Reparto final:

- mesoamérica y Caribe: 9
- México y Estados Unidos: 21
- Europa occidental: 26
- Sudamérica: 29

De los 85: **59 tienen fuente verificable** y **45 declaran ECO_ID compatibles**.

## La regla de activación

Ocho condiciones, en este orden. Falla una y el saber no se muestra como propio
del predio:

1. El saber tiene al menos una fuente verificable.
2. Su estado territorial es `aprobado`.
3. Existe una geometría registrada con su id.
4. La licencia de esa geometría está en `LICENCIAS_ADMITIDAS`.
5. La geometría declara fuente y URL.
6. El país del punto está entre los países del saber.
7. Si el saber declara ECO_ID compatibles, el del punto está entre ellos.
8. El punto cae dentro del polígono.

El país, el Köppen y el ECO_ID **filtran**; nunca activan. Ésa es la regla
entera de esta capa y hay un test que la fija: un punto en la Argentina con el
ECO_ID correcto, pero fuera del polígono, no activa nada.

Para uso editorial —una nota, un índice, una convocatoria— está
`saberesDocumentados({ pais, region })`, que lista sin pretender que el saber
sea del predio de quien mira.

## Lo que falta, y en qué orden conviene

**1. Los tres europeos con cartografía oficial ya publicada.** Estaban marcados
`cartografia_oficial_sin_licencia` y se suponía que les faltaba un solo paso:
verificar la licencia. **Verificado el 08/09/2026, y el resultado es uno de tres,
no tres de tres.**

Ninguno de los tres es un saber de un pueblo originario, así que no requiere
acuerdo comunitario: alcanza con que la licencia permita redistribuir el
polígono. Pero la licencia no era el único problema.

| Saber | Licencia | Geometría | Veredicto |
|---|---|---|---|
| Polders y waterschappen (NL) | CC-BY-4.0 | Polígonos | **Viable** |
| Cañadas reales (ES) | Atribución propia del MITECO | **Líneas** | Bloqueado ×2 |
| Crofting townships (GB) | Los límites no son datos abiertos | — | Bloqueado |

**Países Bajos — el único que se puede montar.** Los `waterschapsgrenzen` se
publican por PDOK, cuya licencia general es CC-BY-4.0, que sí está en
`LICENCIAS_ADMITIDAS`. Son polígonos y hay servicio Atom:
`https://service.pdok.nl/hwh/waterschappen-waterschapsgrenzen-imso/atom/index.xml`.
Dos cosas antes de cargarlo: PDOK aclara que **cada dataset puede declarar la
suya en la metadata del NGR**, así que hay que confirmarla en la ficha concreta
y no en la política general; y el polígono delimita el **waterschap** —la
institución que administra el agua— y no el pólder. Es una cota superior
honesta, exactamente el mismo caso que Lempira con el Quesungual, y así hay que
escribirlo en el código.

**España — bloqueado por dos motivos, y el segundo no se arregla con una
licencia.** La Red General de Vías Pecuarias del MITECO se puede usar "de modo
libre y gratuito siempre que se mencione al Ministerio para la Transición
Ecológica y el Reto Demográfico como autor y propietario de la información".
Es atribución obligatoria bajo condición propia del ministerio: **no es ninguna
de las seis de `LICENCIAS_ADMITIDAS`**, aunque sea de espíritu parecido a
CC-BY. Y el problema de fondo es otro: **la cartografía es de líneas**, porque
una cañada es una vía. La condición 8 de la compuerta es que el punto caiga
adentro del polígono, y una línea no contiene un punto. Activarla pediría
inventar un buffer —¿de cuántos metros?—, que es exactamente la clase de
precisión inventada que la capa evita. Se suma que sólo está digitalizada en 17
provincias de cuatro comunidades autónomas.

**Reino Unido — bloqueado.** El open data de la Crofting Commission es el
*Register of Crofts*, que es **tabular** y va bajo Open Government Licence v3.0.
Los límites están en el *Crofting Register* de Registers of Scotland, cuyos
datos GIS se venden como producto a medida y derivan de Ordnance Survey. La
apertura bajo OGL de 2020 fue para los INSPIRE Index Polygons del Land Register,
no para crofting.

**Dos decisiones que quedan para Jonatan, no para el código:**

1. Si `LICENCIAS_ADMITIDAS` acepta o no `OGL-3.0` y las licencias de atribución
   propias de un organismo público. Ampliar la lista es una decisión de política
   de datos, no una corrección técnica, y no se toca sin que él lo diga. Aclaro
   que hacerlo **no desbloquea a ninguno de estos dos**: el británico no tiene
   geometría abierta y el español es de líneas.
2. Si la capa va a admitir alguna vez saberes de geometría lineal. Hoy no, y no
   parece que deba: media capa son sistemas de territorio, no de camino.

**2. Los sitios SIPAM/GIAHS de América.** Chinampas de Xochimilco, Metepantle
de Tlaxcala, chakra amazónica de Napo, Viñales. La FAO publica el polígono del
sitio; hay que ver bajo qué licencia.

**3. Todo lo demás — con acuerdo antes que con polígono.** Los saberes de
pueblos originarios de Sudamérica, Mesoamérica y Estados Unidos no se activan
por tener el mapa. El polígono es la mitad del permiso; la otra mitad es el
acuerdo de quien porta el saber, y va registrado en `fuente` y `url` de la
geometría con licencia `comunitaria_con_permiso`.

**4. Las fuentes por saber de Europa.** Los 26 europeos tienen `fuentes: []`
porque el relevamiento citó por región, no por saber (ver
`ecosistemas-saberes-europa-occidental/FUENTES.md`). Como la condición 1 exige
fuente, hoy están doblemente bloqueados. Atribuir una URL a cada uno es trabajo
de escritorio, no de campo.

**5. África, Asia y Oceanía.** Sin relevar, ni en fase 1 ni en fase 2.

## Cómo agregar la primera geometría

1. Conseguir el polígono de una fuente que publique licencia.
2. Verificar que la licencia esté en `LICENCIAS_ADMITIDAS` (`lib/saberes.ts`).
3. Si el saber es de un pueblo o una comunidad, tener su acuerdo registrado
   **antes** de cargarlo.
4. Agregar la entrada a `GEOMETRIAS_SABERES` y pasar el saber a
   `estado: 'aprobado'` en el inventario de `_research/`; después regenerar con
   `node _research/build-saberes-territoriales.mjs`.

El test `no deja ninguno aprobado mientras no haya cartografía con licencia` va
a fallar en ese momento. Es el recordatorio de actualizarlo a mano, con nombre y
apellido del saber que se activó.
