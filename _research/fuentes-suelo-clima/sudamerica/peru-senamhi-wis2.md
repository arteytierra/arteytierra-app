# Perú — WIS2 de estaciones horarias (SENAMHI)

**Tipo:** clima | precipitación
**Estado:** VIVA
**Prioridad sugerida:** alta

## Qué mejora sobre la fuente global

Observaciones oficiales horarias por estación y coordenada, muy superiores en localidad y actualidad a NASA POWER.

## Cobertura

Perú nacional; colección `pe-senamhi:synop-hourly`.

## Licencia

El conjunto se publica en el tópico WIS2 `data/core`; uso gratuito y sin condiciones, incluido comercial, conforme Resolución 1 OMM. Página: https://wis.senamhi.gob.pe/

## Acceso técnico

OGC API Features. Ejemplo bbox Lima:

`GET https://wis.senamhi.gob.pe/oapi/collections/urn%3Awmo%3Amd%3Ape-senamhi%3Asynop-hourly/items?f=json&limit=3&bbox=-77.2,-12.2,-76.8,-11.8&name=total_precipitation_or_total_water_equivalent&sortby=-reportTime`

## Campos que devuelve

Geometría, WIGOS, variable, intervalo, reporte, unidad y valor; temperatura, humedad, presión, viento y precipitación según estación.

## Qué falta o qué no da

No reemplaza climatología histórica ni PISCO; la serie expuesta por WIS2 es reciente. No se verificó ETP/evaporación publicada.

## Verificación

Probado el 2026-08-31. Respuesta real recortada:

```json
{"features":[{"geometry":{"coordinates":[-76.84194,-11.98744]},"properties":{"name":"total_precipitation_or_total_water_equivalent","phenomenonTime":"2026-08-31T02:00:00Z/2026-08-31T03:00:00Z","units":"kg m-2","value":0.0,"wigos_station_identifier":"0-604-1-15474502"}}],"numberMatched":19707}
```

Conversión: `kg m-2` de agua = `mm`.
