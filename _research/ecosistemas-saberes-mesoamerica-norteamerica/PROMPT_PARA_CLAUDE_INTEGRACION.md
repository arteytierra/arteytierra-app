# Prompt para Claude — integración americana en dos fases

Revisé los choques que encontraste y rehice la entrega conjunta. Usá solamente:

`C:\Arte y Tierra\0. Claude\_research\ecosistemas-saberes-mesoamerica-norteamerica\`

Los JSON de `insumos/` son trazabilidad y **no se ingieren directamente**.

## Fase 1 — montar ecología

Montá `fase-1-ecologia/fichas-ecologicas-nuevas.json` y `mapeo-eco-id-nuevo.json`.

Reglas duras:

- conservá todos los mapeos actuales de `lib/ecorregiones.ts`;
- no borres ninguna ficha regional existente;
- no cambies la firma de `fichaDeEcorregion(ecoId)`;
- un ECO_ID tiene un solo dueño global;
- retirale `_meta` al generar TypeScript;
- las fichas nuevas entran con `saberes: []`;
- tomá `decisiones-colisiones.json` como resolución explícita de los 29 choques auditados.

El reporte esperado es: 163 ECO_ID objetivo, 20 actuales conservados, 143 nuevos, 53 fichas nuevas, cero faltantes, cero duplicados y cero fichas actuales huérfanas.

Agregá tests de contrato, unicidad global, referencias ficha↔mapeo, ausencia de fichas huérfanas y casos de punto representativos. No agregues filtro por país al resolutor ecológico.

## Fase 2 — saberes territoriales

No la actives todavía en producción. El inventario tiene 31 entradas, todas marcadas `documentado_sin_geometria`.

Primero proponé el tipo y el origen de las geometrías. El resolutor cultural debe ser independiente, recibir punto/país/admin/ECO_ID y exigir una geometría aprobada. País y Köppen son filtros, no activadores. Mantené las cautelas de soberanía tribal, atribución comunitaria, sitios sensibles y ausencia de recetas de fuego, medicina, pesca, caza o recolección.

Antes de implementar fase 2, pedí una decisión sobre fuente, licencia y nivel de precisión de las geometrías. No inventes polígonos ni uses límites aproximados como territorios culturales.
