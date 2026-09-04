# Belice — WIS2 SYNOP (National Meteorological Service)

**Tipo:** clima | precipitación
**Estado:** VIVA
**Prioridad sugerida:** alta

## Qué mejora sobre la fuente global

Observaciones oficiales horarias de estaciones, con coordenadas, muy superiores a NASA POWER para lluvia y tiempo reciente local.

## Cobertura

Belice; colección nacional `belize-hourly-synop`, también replicada en el nodo CMO.

## Licencia

Tópico WIS2 `core`, sin cargo ni condiciones de uso, apto comercialmente bajo Resolución 1 OMM.

## Acceso técnico

`GET https://wis.nms.gov.bz/oapi/collections/urn%3Awmo%3Amd%3Abz-nms%3Abelize-hourly-synop/items?f=json&limit=2&bbox=-89.3,15.8,-87.5,18.5&sortby=-reportTime`

La réplica regional también responde en `https://wiscaribbeancmo.org/oapi/...`.

## Campos que devuelve

Geometría, WIGOS, variable, intervalo, reporte, unidad y valor. Se verificaron presión, temperatura y precipitación.

## Qué falta o qué no da

Normales mensuales históricas y ETP. Las ventanas de precipitación pueden solaparse; seleccionar una duración consistente.

## Verificación

Probado el 2026-08-31. Respuesta real de precipitación en la réplica CMO:

```json
{"features":[{"geometry":{"coordinates":[-88.5629,18.0451,8.5]},"properties":{"name":"total_precipitation_or_total_water_equivalent","phenomenonTime":"2026-08-31T02:00:00Z/2026-08-31T03:00:00Z","units":"kg m-2","value":0.0,"wigos_station_identifier":"0-84-100-9907603"}}],"numberMatched":29926}
```

`kg m-2` de agua = `mm`.
