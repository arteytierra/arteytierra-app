# Suriname — SYNOP en WIS2 Caribe (Meteorological Service Suriname / CMO)

**Tipo:** clima | precipitación
**Estado:** VIVA
**Prioridad sugerida:** media

## Qué mejora sobre la fuente global

Observación horaria puntual oficial, con coordenadas y variables normalizadas, más local que NASA POWER.

## Cobertura

Suriname según estaciones SYNOP; la prueba encontró una estación en `[-55.2, 5.45]`.

## Licencia

Colección publicada en WIS2 `core`: libre y sin condiciones, incluido uso comercial, bajo Resolución 1 OMM.

## Acceso técnico

`GET https://wiscaribbeancmo.org/oapi/collections/urn%3Awmo%3Amd%3Asr-metservice%3Asynop-hourly-data/items?f=json&limit=2&sortby=-reportTime`

## Campos que devuelve

Geometría, WIGOS, variable, intervalo, reporte, unidad y valor.

## Qué falta o qué no da

Serie histórica larga/normal mensual y densidad espacial. La bbox inicial al norte de la estación devolvió cero, lo que confirma que hay que usar primero la colección `stations`.

## Verificación

Probado el 2026-08-31:

```json
{"features":[{"geometry":{"coordinates":[-55.2,5.45,15.0]},"properties":{"name":"air_temperature","reportTime":"2026-08-31T00:00:00Z","units":"Celsius","value":27.2,"wigos_station_identifier":"0-20000-0-81225"}}],"numberMatched":3216}
```
