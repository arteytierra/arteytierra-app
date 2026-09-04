# Resumen ejecutivo

## Entrega

- 125 ECO_ID auditados dentro de la caja sudamericana.
- 2 ECO_ID insulares fuera de caja auditados y con ficha: Galápagos 601 y Rapa Nui 628.
- 59 fichas ecológicas entregadas: 12 actuales normalizadas y 47 nuevas.
- 53 AGREGAR, 37 REEMPLAZAR, 20 AMPLIAR_SIN_REMAPEAR y 17 CONSERVAR_ACTUAL.
- 29 saberes territoriales documentados; 0 autoactivables.
- 0 fichas actuales huérfanas y 0 de los 143 IDs anteriores pisados.

## Prioridad 1

| Vacío | Resolución | ECO_ID |
|---|---|---|
| Caatinga | `caatinga` | 525 |
| Chaco húmedo | `chaco_humedo` | 571 |
| Pantanal | `pantanal` | 584 |
| Páramos | `paramos_andinos` | 590, 591, 593, 594 |
| Chocó–Darién | ampliar `darien_humedo_panama`, sin remapear | 454 |
| Valles secos interandinos | `valles_secos_interandinos` | 479, 523, 526, 538, 542 |

## Partición de selva_tropical

`selva_tropical` conserva sólo 439 (Alto Paraná). Los restantes ECO_ID pasan a Mata Atlántica, Amazonía de tierra firme, várzeas–igapós, campinaranas y Escudo Guayanés.

## Orden recomendado de montaje

1. Ejecutar `node generar-entrega.mjs "C:\Arte y Tierra\0. Claude"` y exigir `valido: true`.
2. Montar ecología y remapeos; mantener ECO_NAME visible.
3. Resolver la deuda global de ECO_ID 0 antes de mostrar una ficha específica en roca/hielo andino.
4. Obtener geometrías culturales; hasta entonces no montar la fase 2 como contenido activable.
