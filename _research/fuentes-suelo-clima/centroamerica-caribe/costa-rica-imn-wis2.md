# Costa Rica — WIS2 SYNOP (Instituto Meteorológico Nacional)

**Tipo:** clima | precipitación
**Estado:** DESCARTADA
**Prioridad sugerida:** media

## Qué mejora sobre la fuente global

Datos horarios oficiales de estaciones automáticas: temperatura, precipitación, presión, radiación, viento y humedad.

## Cobertura

Costa Rica; metadato desde 2024-09-25 y bbox nacional.

## Licencia

`wmo:dataPolicy: core`, legalmente apta para uso comercial.

## Acceso técnico

El Global Discovery Catalogue expone metadatos y suscripción MQTT, pero no un endpoint HTTP de observaciones consultable por punto/bbox:

`GET https://wis2-gdc.weather.gc.ca/collections/wis2-discovery-metadata/items/urn%3Awmo%3Amd%3Acr-imn%3Acore.surface-based-observations.synop?f=json`

## Campos que devuelve

El registro devuelve título, cobertura, variables, contacto, `wmo:dataPolicy` y tópicos MQTT; no valores de observación.

## Qué falta o qué no da

Una URL OGC API nacional o regional que permita bbox. MQTT exige ingerir y almacenar el flujo completo, fuera del criterio de consulta puntual; por eso se DESCARTA aunque la licencia sea correcta.

## Verificación

Probado el 2026-08-31. Respuesta real recortada:

```json
{"properties":{"title":"Hourly observations from fixed-land stations (cr-imn)","keywords":["temperature","precipitation","pressure","radiation","wind","humidity"],"wmo:dataPolicy":"core"},"links":[{"href":"mqtts://everyone:everyone@globalbroker.inmet.gov.br:8883","channel":"cache/a/wis2/cr-imn/data/core/weather/surface-based-observations/synop"}]}
```
