# Auditoría de colisiones

## Resultado

- Cero de los 143 ECO_ID reservados por Mesoamérica/Norteamérica aparece en `mapeo-eco-id-nuevo.json`.
- Cero fichas sudamericanas actuales queda huérfana.
- 37 ECO_ID actuales se remapean para desarmar catálogos demasiado gruesos.
- Los 16 cruces con la entrega anterior conservan su dueño global.

## Choques que requieren atención humana

### ECO_ID 0 — Rock and Ice

La entrega anterior lo asignó a `alaska_tundra_hielo_beringia`, pero RESOLVE usa el mismo ECO_ID multipartes en roca y hielo de otros continentes, incluidos los Andes. Este paquete **no lo pisa**. Antes de producción global conviene usar una ficha global de roca/hielo y resolver Alaska con una capa específica.

### ECO_ID 454 — Chocó–Darién

Ya pertenece a `darien_humedo_panama`. Para cubrir la prioridad Chocó sin crear dos dueños, la acción es `AMPLIAR_SIN_REMAPEAR`: ampliar esa misma ficha para incluir el flanco pacífico hiperhúmedo colombiano.

### ECO_ID 578 — Patagonia y Malvinas/Falklands

El FeatureServer devuelve `Patagonian steppe` también en las islas. Se conserva `estepa_patagonica`; una descripción insular más fina exige geometría adicional.

### ECO_ID 601 — Galápagos

RESOLVE agrupa el archipiélago como matorral xerófilo aunque las islas altas tienen zonas húmedas. La ficha y la UI deben conservar esta advertencia.

El detalle máquina-legible está en `fase-1-ecologia/decisiones-colisiones.json`.
