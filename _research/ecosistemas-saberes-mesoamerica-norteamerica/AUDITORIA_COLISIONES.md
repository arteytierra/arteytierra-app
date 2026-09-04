# Auditoría de colisiones

## Choques señalados por Claude

### Puerto Rico — ECO_ID 495 y 543

Se conserva el estado actual:

- `495 → bosque_humedo_tropical_caribeno`
- `543 → matorral_seco_caribeno`

La ficha investigada `puerto_rico_bosques_humedos_secos` queda como respaldo editorial, no como destino del resolutor. Unificar bosque húmedo y seco reduciría precisión y dejaría dos fichas existentes huérfanas.

### Bosque seco centroamericano — ECO_ID 527

Se conserva:

- `527 → bosque_tropical_seco_mesoamericano`

“Corredor Seco” es una región climática y socioeconómica más amplia que una sola ecorregión. Quesungual y Kuxur Rum pasan a la fase territorial; no son nombres alternativos de ECO_ID 527.

### País como segunda llave

Se descarta para la ecología. `fichaDeEcorregion(ecoId)` no necesita cambiar su firma. El país no puede hacer que el mismo ECO_ID represente ecosistemas distintos.

La selección cultural sí necesita un resolutor separado. País es un filtro necesario en muchas entradas, pero no reemplaza una geometría local.

## Colisiones adicionales corregidas

- `435` ya no puede elegir una ficha mexicana o estadounidense según país: conserva `desiertos_calidos_norteamericanos` hasta una revisión editorial explícita.
- `384` y `437` usan una única ficha binacional nueva: `tamaulipas_texas_pastizal_mezquital`.
- `494` y `519` usan `selva_maya_peten_yucatan`, que describe la continuidad transfronteriza. Ich Kool queda en la fase territorial mexicana.
- `502` y `553` usan `montanas_mayas_pino_encino`; las atribuciones K’iche’, Mam o mexicanas se filtran territorialmente.
- `612` usa `manglares_antillanos`, no una variante exclusiva de Florida.
- `613` y `617` usan `manglares_centroamericanos`; los saberes costeros mexicanos no se generalizan al polígono completo.

## Política para las colisiones con el catálogo productivo

En esta entrega gana siempre la asignación ya presente en `lib/ecorregiones.ts`. Es la opción de menor riesgo y garantiza que ninguna ficha actual quede sin activación. La investigación nueva puede ampliar texto, fuentes o especies en una revisión posterior, pero una mejora editorial no implica remapear el ECO_ID.

El detalle completo y procesable está en `fase-1-ecologia/decisiones-colisiones.json`.
