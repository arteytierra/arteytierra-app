# Paraguay — WIS2 SYNOP (DINAC-DMH)

**Tipo:** clima | precipitación | evaporación
**Estado:** VIVA
**Prioridad sugerida:** alta

## Qué mejora sobre la fuente global

Observaciones puntuales oficiales horarias y evaporación diaria en estaciones, con una resolución local muy superior a NASA POWER. Es la única fuente viable encontrada en la región que devolvió evaporación real.

## Cobertura

Paraguay. Metadato desde 2025-11-18; cobertura nacional por red SYNOP.

## Licencia

`wmo:dataPolicy: core`: datos sin cargo ni condiciones de uso, aptos para sector privado/comercial. Metadato: https://wis2py.meteorologia.gov.py/oapi/collections/discovery-metadata/items/urn%3Awmo%3Amd%3Apy-dinac-dmh%3Asynop-obsmet?f=json

## Acceso técnico

OGC API Features. Evaporación:

`GET https://wis2py.meteorologia.gov.py/oapi/collections/urn%3Awmo%3Amd%3Apy-dinac-dmh%3Asynop-obsmet/items?f=json&limit=3&name=evaporation&sortby=-reportTime`

Precipitación por bbox Asunción:

`GET https://wis2py.meteorologia.gov.py/oapi/collections/urn%3Awmo%3Amd%3Apy-dinac-dmh%3Asynop-obsmet/items?f=json&limit=3&bbox=-57.7,-25.4,-57.4,-25.1&name=total_precipitation_or_total_water_equivalent`

## Campos que devuelve

Geometría, WIGOS, variable, intervalo, reporte, unidad y valor. Estaciones en colección separada.

## Qué falta o qué no da

La historia WIS2 es corta y la evaporación observada es esporádica (141 elementos al probar), no ETP FAO-56. No usarla como climatología sin evaluar completitud.

## Verificación

Probado el 2026-08-31. Respuesta real de evaporación:

```json
{"features":[{"geometry":{"coordinates":[-54.83557,-25.4452]},"properties":{"name":"evaporation","phenomenonTime":"2026-06-03T12:00:00Z/2026-06-04T12:00:00Z","units":"kg m-2","value":5.6000000000000005,"wigos_station_identifier":"0-20000-0-86246"}}],"numberMatched":141}
```

Conversión: `1 kg m-2` de agua = `1 mm`, por lo que el ejemplo equivale a `5.6 mm/día`.
