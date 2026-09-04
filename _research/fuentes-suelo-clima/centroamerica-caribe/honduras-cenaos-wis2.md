# Honduras — WIS2 SYNOP (CENAOS/COPECO)

**Tipo:** clima | precipitación
**Estado:** INTERMITENTE
**Prioridad sugerida:** alta

## Qué mejora sobre la fuente global

Datos oficiales horarios por estación y coordenada, con mucho más detalle local que NASA POWER.

## Cobertura

Honduras; colección nacional `urn:wmo:md:hn-cenaos:uspxz9`.

## Licencia

Tópico WIS2 `core`: libre y sin condiciones, incluido uso comercial, bajo Resolución 1 OMM.

## Acceso técnico

OGC API Features. Ejemplo:

`GET https://wiscenaos.copeco.gob.hn/oapi/collections/urn%3Awmo%3Amd%3Ahn-cenaos%3Auspxz9/items?f=json&limit=2&bbox=-89.4,12.8,-83.1,16.5&sortby=-reportTime`

## Campos que devuelve

Geometría, WIGOS, variable, tiempos, unidades y valor.

## Qué falta o qué no da

Certificado TLS válido. Una integración normal rechaza la conexión; no se debe desactivar validación en producción. Tampoco aporta climatología larga ni ETP confirmada.

## Verificación

Probado el 2026-08-31. Con validación normal falló `SEC_E_CERT_EXPIRED`. Reintentando sólo para diagnóstico con `curl -k`, el backend sí devolvió:

```json
{"features":[{"geometry":{"coordinates":[-88.24113,14.93845,284.0]},"properties":{"name":"non_coordinate_pressure","reportTime":"2026-08-31T04:00:00Z","units":"hPa","value":982.3,"wigos_station_identifier":"0-340-1-SABH3"}}],"numberMatched":411856}
```

INTERMITENTE hasta renovar el certificado.
