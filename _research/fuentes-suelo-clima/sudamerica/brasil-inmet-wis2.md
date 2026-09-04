# Brasil — WIS2 SYNOP y DAYCLI (INMET)

**Tipo:** clima | precipitación | evaporación
**Estado:** VIVA
**Prioridad sugerida:** alta

## Qué mejora sobre la fuente global

Red oficial de estaciones con observaciones horarias y resumen diario, georreferenciadas; mejora fuertemente la resolución local y temporal de NASA POWER.

## Cobertura

Brasil. El catálogo de estaciones exponía 1.458 registros al verificar. Colecciones automáticas SYNOP, manuales y DAYCLI.

## Licencia

Ambas colecciones relevantes están declaradas `wmo:dataPolicy: core`: uso gratuito y sin condiciones, incluido comercial, bajo Resolución 1 OMM. Referencias: https://wis2bra.inmet.gov.br/oapi/collections/discovery-metadata/items/urn%3Awmo%3Amd%3Abr-inmet%3Asynop?f=html y https://public.wmo.int/wmo-unified-data-policy-resolution-res1

## Acceso técnico

OGC API Features sin clave. Ejemplo horario por bbox en São Paulo:

`GET https://wis2bra.inmet.gov.br/oapi/collections/urn%3Awmo%3Amd%3Abr-inmet%3Asynop/items?f=json&limit=3&bbox=-46.75,-23.65,-46.55,-23.45&name=total_precipitation_or_total_water_equivalent&sortby=-reportTime`

Resumen diario:

`GET https://wis2bra.inmet.gov.br/oapi/collections/urn%3Awmo%3Amd%3Abr-inmet%3Adaycli/items?f=json&limit=3&bbox=-46.75,-23.65,-46.55,-23.45&sortby=-reportTime`

## Campos que devuelve

Geometría, WIGOS, tiempos de observación/reporte, nombre normalizado de variable, unidad y valor. Precipitación, temperatura, humedad, presión, viento, radiación y potencialmente evaporación.

## Qué falta o qué no da

Historia publicada por WIS2 es reciente; para normales mensuales antiguas todavía haría falta otra vía. Control de calidad obligatorio: DAYCLI devolvió máximo `13.65 °C` y media `24.45 °C` para la misma estación/fecha, combinación imposible.

## Verificación

Probado el 2026-08-31. Respuesta real recortada:

```json
{"features":[{"geometry":{"coordinates":[-46.62007,-23.49629]},"properties":{"name":"total_precipitation_or_total_water_equivalent","phenomenonTime":"2026-08-31T02:00:00Z/2026-08-31T03:00:00Z","units":"kg m-2","value":0.0,"wigos_station_identifier":"0-76-0-3550308000000089"}}],"numberMatched":2183}
```

Conversión: `kg m-2` de agua a `mm`, factor 1.
