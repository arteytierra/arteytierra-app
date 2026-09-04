# Cuba — SYNOP WIS2 (INSMET)

**Tipo:** clima | precipitación
**Estado:** DESCARTADA
**Prioridad sugerida:** media

## Qué mejora sobre la fuente global

Observaciones horarias oficiales de estaciones SYNOP, con variables de temperatura, precipitación, humedad, viento, radiación y evaporación.

## Cobertura

Cuba; registro WIS2 nacional `cu-insmet`.

## Licencia

`wmo:dataPolicy: core`: licencia/política apta para uso comercial.

## Acceso técnico

El Global Discovery Catalogue sólo expone metadatos y tópicos MQTT, no una colección HTTP de observaciones consultable por punto/bbox:

`GET https://wis2-gdc.weather.gc.ca/collections/wis2-discovery-metadata/items/urn%3Awmo%3Amd%3Acu-insmet%3Acore.surface-based-observations.synop?f=json`

Respuesta real recortada:

```text
id: urn:wmo:md:cu-insmet:core.surface-based-observations.synop
wmo:dataPolicy: core
links: catálogo y tópicos/brokers WIS2; sin URL OGC API de observaciones HTTP
```

## Campos que devuelve

Metadatos: variables, cobertura, contacto, política y tópico. No devuelve valores desde esa URL.

## Qué falta o qué no da

Endpoint OGC API nacional/regional para consultas espaciales. Consumir MQTT y alojar el flujo completo no cumple la regla de acceso puntual/bbox.

## Verificación

Revisado el 2026-08-31. El registro seguía vivo y declaraba `wmo:dataPolicy: core`, pero sus enlaces públicos eran sólo catálogo/brokers; no se halló nodo de observaciones HTTP. DESCARTADA técnica, no legalmente.
