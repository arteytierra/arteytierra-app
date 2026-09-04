# Caribe — nodo regional WIS2 (Caribbean Meteorological Organization)

**Tipo:** clima | precipitación | evaporación
**Estado:** VIVA
**Prioridad sugerida:** alta

## Qué mejora sobre la fuente global

Observaciones SYNOP horarias oficiales por estación y bbox, con coordenadas y unidades normalizadas; aportan el estado local real frente a la grilla aproximada de NASA POWER.

## Cobertura

En la prueba el nodo publicaba Anguila, Suriname, San Vicente y Granadinas, Montserrat, Antigua y Barbuda, Granada, Guyana, Islas Caimán, Santa Lucía, San Cristóbal y Nieves, Turcas y Caicos, Belice, Jamaica, Bahamas, Dominica, Islas Vírgenes Británicas y Sint Maarten. Bahamas además tenía DAYCLI y CLIMAT.

## Licencia

Las colecciones SYNOP y climáticas citadas están en tópicos `data/core`. La Política Unificada OMM define `core` como libre, sin cargo y sin condiciones de uso, incluidos usuarios privados/comerciales. Referencias: https://wiscaribbeancmo.org/ y https://public.wmo.int/wmo-unified-data-policy-resolution-res1

## Acceso técnico

OGC API Features sin clave, con `bbox`, `name`, `datetime`, orden y paginación. Ejemplo Jamaica:

`GET https://wiscaribbeancmo.org/oapi/collections/urn%3Awmo%3Amd%3Ajm-msj%3Acore.surface-based-observations.synop/items?f=json&limit=2&bbox=-78.5,17.5,-76.0,18.8&sortby=-reportTime`

Ejemplo Antigua: cambiar colección a `urn:wmo:md:ag-antiguamet:core.surface-based-observations.synop`.

## Campos que devuelve

`geometry`, `name`, `phenomenonTime`, `reportTime`, `units`, `value`, `wigos_station_identifier`. Según estación: temperatura, precipitación, presión, humedad, viento, radiación, insolación y evaporación.

## Qué falta o qué no da

Historia expuesta corta/variable, densidad desigual y ausencia de normales largas para la mayoría. Antes de sumar precipitación hay que diferenciar intervalos de 1, 3, 6 o 24 horas. Los METAR “recommended” tienen licencia separada y quedan fuera de esta aprobación.

## Verificación

Probado el 2026-08-31. Respuesta real Jamaica:

```json
{"features":[{"geometry":{"coordinates":[-77.91667,18.5,8.0]},"properties":{"name":"non_coordinate_pressure","reportTime":"2026-08-31T01:00:00Z","units":"hPa","value":1013.0,"wigos_station_identifier":"0-20000-0-78388"}}],"numberMatched":28580}
```

Para precipitación/evaporación, `kg m-2` de agua equivale exactamente a `mm`.
