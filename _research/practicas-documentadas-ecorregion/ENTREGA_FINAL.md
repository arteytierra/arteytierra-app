# Entrega final para integración

Fecha: 2026-09-16.

## Qué debe importar Claude

Las prácticas están exclusivamente en los archivos `.json` de esta carpeta. Los documentos `COBERTURA_*.md` explican alcance, ausencias y decisiones editoriales; no agregan registros para importar.

Para el último tramo del relevamiento:

- `complemento-e-prioridades-huecos.json`: 9 prácticas que ya habían reducido el listado original de 50 pendientes.
- `complemento-f-cierre-pendientes.json`: 18 prácticas nuevas del cierre.
- `bloque-h-medio-oriente.json`: contiene la versión corregida de `socotra`.
- `bloque-i-norte-africa.json`: ya no contiene la práctica rechazada de `uweinat_tibesti`.
- `COBERTURA_COMPLEMENTO_F_CIERRE.md`: inventario de las 19 aceptadas en el cierre y justificación de los 22 vacíos.

## Estado del conjunto

- 16 archivos JSON.
- 195 prácticas documentadas.
- 195 `fichaId` únicos; no hay duplicados entre archivos.
- Todos los objetos respetan exactamente el contrato `fichaId/practica/periodo/tipo/vigencia/detalle/fuentes/verificacion`.
- Todos los valores de `tipo` y `vigencia` pertenecen a sus enumeraciones permitidas.
- Todas las verificaciones tienen 25 palabras o menos.

## Integración segura

1. Importar los JSON como catálogo acumulativo, comprobando unicidad global de `fichaId`.
2. No crear objetos vacíos para los 22 casos sin respaldo: la ausencia es una decisión de investigación, no un error de generación.
3. Tomar `socotra` únicamente de `bloque-h-medio-oriente.json`.
4. No reintroducir `uweinat_tibesti` salvo que aparezca una fuente que sostenga práctica concreta, período y territorio exacto.
5. Conservar `fuentes` y `verificacion` junto con cada práctica para mantener la trazabilidad en la app.

