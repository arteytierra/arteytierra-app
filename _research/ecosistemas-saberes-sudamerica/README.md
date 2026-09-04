# Ecosistemas y saberes — Sudamérica

Entrega de investigación para montaje por Claude. No modifica apps/, packages/ ni supabase/ y no incluye commits.

## Contrato

- **Ecología base:** un solo dueño global por ECO_ID. Todas las fichas tienen saberes vacío.
- **Saberes territoriales:** inventario separado; ninguna entrada se activa sin geometría aprobada. País, ECO_ID y Köppen son filtros, nunca prueba suficiente.
- _meta es trazabilidad de investigación y se retira al convertir a BiomaFicha.

## Fase 1 — ecología

- `fase-1-ecologia/fichas-ecologicas-nuevas.json`: 59 fichas, incluidas las 12 actuales normalizadas.
- `fase-1-ecologia/mapeo-eco-id-nuevo.json`: sólo altas y remapeos; no contiene IDs reservados por la entrega anterior.
- `fase-1-ecologia/mapeo-eco-id-final-auditoria.json`: dueño final esperado.
- `fase-1-ecologia/decisiones-colisiones.json`: colisiones y prueba de no orfandad.
- `fase-1-ecologia/reporte-validacion.json`: controles mecánicos.

## Fase 2 — saberes territoriales

`fase-2-saberes-territoriales/inventario-saberes-documentados.json` contiene 29 entradas atribuidas, todas sin geometría y no autoactivables.

## Advertencias de montaje

1. ECO_ID 0 ya está reservado con una ficha de Alaska aunque RESOLVE lo usa globalmente.
2. ECO_ID 454 conserva darien_humedo_panama; ampliarlo para Chocó colombiano, sin crear otro dueño.
3. ECO_ID 578 incluye Malvinas/Falklands además de Patagonia.
4. Galápagos 601 no separa zonas áridas y húmedas.

## Regenerar y validar

Desde esta carpeta:

```powershell
node .\generar-entrega.mjs "C:\Arte y Tierra\0. Claude"
```

Los dos reportes de validación deben indicar valido: true.
