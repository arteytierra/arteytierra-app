# Colombia — estaciones automáticas WIS2 (IDEAM)

**Tipo:** clima | precipitación
**Estado:** VIVA
**Prioridad sugerida:** alta

## Qué mejora sobre la fuente global

Observaciones horarias oficiales y georreferenciadas de la red automática, con resolución local muy superior a NASA POWER.

## Cobertura

Colombia; metadato espacial nacional y temporal desde 2025-04-23. La densidad es la de estaciones automáticas.

## Licencia

El registro oficial declara `wmo:dataPolicy: core`; permite uso gratuito, privado y comercial sin condiciones. Es una vía legal distinta del conjunto Socrata CC BY-SA. Metadato: https://wis.ideam.gov.co/oapi/collections/discovery-metadata/items/urn%3Awmo%3Amd%3Aco-ideam%3Aautomaticas?f=json

## Acceso técnico

OGC API Features sin clave. Ejemplo en Bogotá:

`GET https://wis.ideam.gov.co/oapi/collections/urn%3Awmo%3Amd%3Aco-ideam%3Aautomaticas/items?f=json&limit=3&bbox=-74.2,4.5,-74.0,4.8&name=total_precipitation_or_total_water_equivalent&sortby=-reportTime`

## Campos que devuelve

Geometría 3D, identificador WIGOS, variable normalizada, intervalo, hora de reporte, unidad y valor. Palabras clave incluyen temperatura, precipitación, presión, humedad, viento, radiación, insolación y evaporación.

## Qué falta o qué no da

No provee por sí solo una normal mensual de largo plazo ni garantiza que cada palabra clave exista en cada estación. Hay que agregar por intervalo y controlar ventanas solapadas.

## Verificación

Probado el 2026-08-31. Respuesta real recortada:

```json
{"features":[{"geometry":{"coordinates":[-74.08892,4.63723,2558.0]},"properties":{"name":"total_precipitation_or_total_water_equivalent","phenomenonTime":"2026-08-31T02:00:00Z/2026-08-31T03:00:00Z","units":"kg m-2","value":0.0,"wigos_station_identifier":"0-170-0-21205012"}}],"numberMatched":11227}
```

Conversión: `1 kg m-2 = 1 mm` de agua.
