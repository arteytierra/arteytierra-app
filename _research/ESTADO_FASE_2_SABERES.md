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

**1. Los tres europeos con cartografía oficial ya publicada.** Están marcados
`cartografia_oficial_sin_licencia` y les falta un solo paso: verificar la
licencia de uso. Son el camino más corto al primer saber activo.

- Cañadas reales (ES) — cartografía del MITECO / vías pecuarias.
- Polders y waterschappen (NL) — cartografía de los waterschappen.
- Crofting townships (GB) — registro de la Crofting Commission.

Ninguno de los tres es un saber de un pueblo originario, así que no requiere
acuerdo comunitario: alcanza con que la licencia permita redistribuir el
polígono. Es el orden correcto para estrenar la capa sin apurar una
conversación que no corresponde apurar.

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
