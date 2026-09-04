# Argentina — WIS2 de observaciones horarias (SMN)

**Tipo:** clima | precipitación
**Estado:** VIVA
**Prioridad sugerida:** alta

## Qué mejora sobre la fuente global

Observación de estaciones reales, con coordenadas y frecuencia horaria, frente a la celda aproximada de 0,5° de NASA POWER. Sirve para lluvia reciente y variables meteorológicas, no para una normal climática completa.

## Cobertura

Argentina; estaciones puntuales SMN. El metadato declara datos desde 2025-12-22 y resolución horaria. La cobertura depende de la red SYNOP.

## Licencia

El registro marca `wmo:dataPolicy: core`. La Política Unificada de Datos de la OMM define `core` como datos gratuitos y sin restricciones, sin cargo ni condiciones de uso, incluidos usuarios privados. Apto para uso comercial. Referencias: https://public.wmo.int/wmo-unified-data-policy-resolution-res1 y https://docs.wis2box.wis.wmo.int/en/latest/user/recommended.html

## Acceso técnico

OGC API Features, JSON/GeoJSON, sin clave. Admite `bbox`, `datetime`, `name`, paginación y orden. Ejemplo comprobado:

`GET https://w2b.smn.gov.ar/oapi/collections/urn%3Awmo%3Amd%3Aar-smn%3Aslt0ci/items?f=json&limit=3&bbox=-58.6,-34.8,-58.3,-34.4&name=total_precipitation_or_total_water_equivalent&sortby=-reportTime`

## Campos que devuelve

`geometry`, `name`, `phenomenonTime`, `reportTime`, `units`, `value`, `wigos_station_identifier`. Variables declaradas: temperatura, precipitación, presión, humedad, viento, radiación, insolación y evaporación, aunque no todas aparecen en todas las estaciones.

## Qué falta o qué no da

No reemplaza una climatología 30 años ni entrega ETP calculada. Hay que elegir estación cercana, controlar duplicados por ventanas de acumulación y agregar por mes. Se observó `-0.1 kg m-2` en precipitación: tratar como código/traza o dato inválido, nunca sumarlo como lluvia negativa.

## Verificación

Probado el 2026-08-31. Respuesta real recortada:

```json
{"features":[{"geometry":{"coordinates":[-58.58444,-34.455]},"properties":{"name":"total_precipitation_or_total_water_equivalent","phenomenonTime":"2026-08-30T00:00:00Z/2026-08-30T06:00:00Z","units":"kg m-2","value":0.0,"wigos_station_identifier":"0-20000-0-87553"}}],"numberMatched":232}
```

Conversión: para agua, `1 kg m-2 = 1 mm`; no cambia el valor.
