# Guyana — SYNOP en WIS2 Caribe (Hydrometeorological Service Guyana / CMO)

**Tipo:** clima | precipitación
**Estado:** VIVA
**Prioridad sugerida:** media

## Qué mejora sobre la fuente global

Observaciones horarias de estaciones con coordenadas, muy superiores a NASA POWER para estado reciente local.

## Cobertura

Guyana; red SYNOP publicada por `gy-hydromet` en el nodo regional CMO.

## Licencia

Tópico WIS2 `core`: datos sin cargo ni condiciones de uso, aptos para uso comercial.

## Acceso técnico

`GET https://wiscaribbeancmo.org/oapi/collections/urn%3Awmo%3Amd%3Agy-hydromet%3Acore.surface-based-observations.synop/items?f=json&limit=2&bbox=-59.0,5.5,-57.0,7.5&sortby=-reportTime`

## Campos que devuelve

Geometría, WIGOS, nombre de variable, tiempos, unidades y valor.

## Qué falta o qué no da

Climatología larga, ETP validada y garantía de cobertura densa fuera de aeropuertos/estaciones principales.

## Verificación

Probado el 2026-08-31:

```json
{"features":[{"geometry":{"coordinates":[-58.25,6.5,30.0]},"properties":{"name":"non_coordinate_pressure","reportTime":"2026-08-31T04:00:00Z","units":"hPa","value":1013.2,"wigos_station_identifier":"0-20000-0-81002"}}],"numberMatched":85608}
```
