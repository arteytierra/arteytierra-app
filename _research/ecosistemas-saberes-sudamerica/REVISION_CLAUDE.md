# Revisión de la entrega — Sudamérica

Revisado el 04/09/2026 contra el JSON crudo de RESOLVE que la propia entrega
trae en `insumos/`, y contra el estado real de `apps/terreno/lib/`.

**Veredicto: la entrega es correcta y se puede montar.** Hay un bug corregido,
tres decisiones que conviene tomar en el montaje y una deuda que ya venía de
antes.

## Bug corregido

El generador no corría. `generar-entrega.mjs:200-201` validaba
`p._meta.ecoregiones_resolve` (sin la segunda `r`) mientras los datos usan
`ecorregiones_resolve`, que es lo que dice el contrato. Cortaba en la primera
ficha con un error engañoso —"ecorregiones_resolve inválido"— mostrando un
`_meta` que en realidad estaba bien.

Corregido. Con eso `node generar-entrega.mjs` termina en `valido: true` y
escribe los nueve archivos de la entrega.

## Lo que verifiqué contra la fuente, no contra el texto

Los seis vacíos de prioridad 1 apuntan al ECO_ID correcto. Nombres tomados del
FeatureServer de RESOLVE:

| Prioridad | ECO_ID | `ECO_NAME` en RESOLVE |
| --- | --- | --- |
| Caatinga | 525 | Caatinga |
| Chaco húmedo | 571 | Humid Chaco |
| Pantanal | 584 | Pantanal |
| Páramos | 590, 591, 593, 594 | Cordillera Central / de Mérida / Northern Andean / Santa Marta páramo |
| Chocó–Darién | 454 | Chocó-Darién moist forests |
| Valles secos interandinos | 479, 523, 526, 538, 542 | Marañón / Bolivian montane / Cauca Valley / Magdalena Valley / Patía valley dry forests |

Los cuatro páramos que existen en RESOLVE están los cuatro; no quedó ninguno
afuera. Las curaciones que ya teníamos y que la entrega conserva también
chequean: 592 es *High Monte* (bien mapeado a `monte`), 587/588/589 son las tres
punas centrales, 574 es *Uruguayan savanna* —que efectivamente no es *Humid
Pampas* (576)— y por eso sale de `pampa` con razón.

La partición de `selva_tropical` en 33 → Mata Atlántica (costera / interior /
restingas / araucaria), Amazonía de tierra firme (NO / SO / oriental),
várzeas–igapós, campinaranas y Escudo Guayanés es la partición estándar de la
literatura amazónica, y cada ECO_ID cae donde corresponde.

Los controles mecánicos dan bien y los verifiqué a mano: ninguna de las 12
fichas actuales queda huérfana, ninguno de los 143 ECO_ID reservados por la
entrega americana se pisa, las 59 fichas tienen `saberes: []`, y las 29 entradas
de la fase 2 están todas en `documentado_sin_geometria` con fuente y cautela
propias, ninguna autoactivable.

## Tres decisiones para el montaje

### 1. La heurística Köppen queda apuntando a la ficha equivocada

Esto la entrega no lo ve, porque mira `ecorregiones.ts` y el problema está en
`contexto.ts`.

`apps/terreno/lib/contexto.ts:307` dice:

```ts
case 'A': return (c === 'Af' || c === 'Am') ? 'selva_tropical' : 'sabana_cerrado';
```

Si `selva_tropical` pasa a significar *selva paranaense* —Alto Paraná, `Cfa`—
entonces un predio amazónico que caiga por la heurística climática recibe una
ficha del Alto Paraná, que es exactamente el problema que esta entrega viene a
arreglar. La heurística sólo corre cuando no se pudo consultar RESOLVE, pero
corre.

Al montar hay que reapuntar ese `Af/Am` a una de las fichas amazónicas nuevas
—`amazonia_oriental_tierra_firme` es la de mayor superficie— o dejar que caiga
al bioma global.

Lo mismo con `puna_altoandino` en la línea 303: cualquier punto por encima de
2800 m va a puna, que es justo la confusión páramo/puna que la entrega corrige a
nivel de ECO_ID pero que sigue viva en el camino climático.

### 2. Conviene renombrar el id `selva_tropical`

Dejar un id llamado `selva_tropical` que sólo cubre el Alto Paraná es una trampa
para la próxima persona que lo lea. Verifiqué que el id no se persiste en
Supabase —no aparece en ninguna migración— y sólo vive en `contexto.ts` y
`ecorregiones.ts`, así que renombrarlo a `selva_paranaense` es un cambio
mecánico y seguro. Es la única de las 12 fichas actuales cuyo nombre queda
mintiendo después de la partición.

### 3. ECO_ID 0 sigue siendo una deuda global

RESOLVE usa el ECO_ID 0 —*Rock and Ice*— en varios continentes, y la entrega
americana se lo asignó a una ficha de Alaska. Esta entrega **no lo pisa**, que
es la decisión correcta, pero la deuda queda: un predio sobre roca o hielo
andino recibe hoy una ficha de Alaska. Hay que resolverlo con una ficha global
de roca/hielo antes de que la app se use en serio fuera de América.

## Números de la entrega

| | |
| --- | --- |
| ECO_ID auditados | 127 (125 en la caja continental + Galápagos 601 y Rapa Nui 628) |
| `AGREGAR` | 53 |
| `REEMPLAZAR` | 37 |
| `AMPLIAR_SIN_REMAPEAR` | 20 |
| `CONSERVAR_ACTUAL` | 17 |
| Fichas ecológicas | 59 (47 nuevas + las 12 actuales normalizadas) |
| Saberes documentados | 29, ninguno activable |
| Fichas huérfanas | 0 |
| Colisiones con la entrega americana | 0 |

## Montado el 04/09/2026

Las tres decisiones se tomaron así:

1. **La heurística Köppen se reapuntó.** `Af/Am` ya no devuelve la ficha del
   Alto Paraná sino `amazonia_oriental_tierra_firme`, y se agregó una regla de
   Misiones (`Cfa` entre -28,5° y -24° al este de -57°) para que la selva
   paranaense siga siendo alcanzable sin ecorregión. El camino de altura
   también se abrió: por encima de 2800 m, al norte del paralelo 8° S devuelve
   `paramos_andinos` y al sur `puna_altoandino`. `determinarBioma` pasó a
   devolver `BiomaHeuristicaId`, que son las 12 más esas dos.
2. **`selva_tropical` se renombró a `selva_paranaense`**, con su ficha acotada
   al Alto Paraná: se le sacó el saber de los pueblos amazónicos y la fuente de
   la terra preta, que describen territorio que ya no es suyo. `sabana_cerrado`
   se acotó igual al Cerrado, porque los Llanos se fueron a ficha propia.
3. **El ECO_ID 0 quedó afuera del montaje**, como pedía la entrega. La deuda
   sigue abierta.

La forma del montaje: `montar-sudamerica.mjs` (en esta carpeta) genera
`lib/ecorregionesSudamerica.ts` (90 ECO_ID → las 47 fichas nuevas) y
`lib/biomasRegionalesSudamerica.ts` (las 47 fichas, todas con `saberes: []`).
Los 19 ECO_ID que siguen perteneciendo a las 12 fichas de `contexto.ts` quedan
a mano en `SUDAMERICA_CURADO_A_MANO`, y los dos bloques se unen con spread. El
script corta con error si la entrega intentara pisar un ECO_ID ya reservado por
los paquetes de América o Europa; los 15 que comparte apuntan a la misma ficha.

`ECO_ID_SUDAMERICA` pasó de 56 a 109 y `BIOMAS_REGIONALES` de 83 a 130 fichas.
El test agrega cinco casos que defienden el montaje: los seis vacíos con dueña,
la Amazonía fuera de la ficha paranaense (por ecorregión y por heurística), la
Mata Atlántica y los campos uruguayos separados, las tres punas y los llanos, y
que ningún ECO_ID de los paquetes anteriores cambió de dueño.

## Estado del resto del mundo

- **Mesoamérica y Norteamérica:** montado. 142 ECO_ID en
  `apps/terreno/lib/ecorregionesAmerica.ts`.
- **Europa occidental:** montado y cerrado. 14 ECO_ID en
  `ecorregionesEuropa.ts`, incluidos los tres arreglos que importaban —796 para
  que `macaronesia` se encienda en Lanzarote, 805 para que el montado alentejano
  active `mediterraneo_europeo`, y 676 para los Pirineos.
- **Sudamérica:** esta entrega, revisada y **montada**: 109 ECO_ID, 47 fichas nuevas.
