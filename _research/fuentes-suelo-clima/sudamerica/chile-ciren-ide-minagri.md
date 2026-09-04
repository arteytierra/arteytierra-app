# Chile — suelos CIREN en IDE Minagri (CIREN)

**Tipo:** suelo
**Estado:** MUERTA
**Prioridad sugerida:** baja

## Qué mejora sobre la fuente global

Las capas agrológicas de CIREN podrían aportar series y clases locales a escala predial/regional, por encima de SoilGrids.

## Cobertura

Capas regionales, no una cobertura homogénea nacional confirmada.

## Licencia

Los metadatos públicos consultados muestran `License Not Specified`; por lo tanto tampoco sería integrable comercialmente sin aclaración escrita.

## Acceso técnico

WFS histórico probado:

`GET https://ide.minagri.gob.cl/geoserver/CIREN/ows?service=WFS&version=2.0.0&request=GetCapabilities`

## Campos que devuelve

Ninguno: el endpoint ya no devuelve capacidades WFS.

## Qué falta o qué no da

Nuevo endpoint de capas, esquema de atributos, cobertura y licencia comercial exacta.

## Verificación

Probado el 2026-08-31. Respuesta real: HTML de IDE Minagri con título `404 Not Found` y texto `La página que buscas no existe`. La documentación antigua puede seguir circulando, pero la URL operativa dejó de existir.
