# Ecuador — nodo geográfico y datos hidrometeorológicos (INAMHI)

**Tipo:** clima | precipitación
**Estado:** DESCARTADA
**Prioridad sugerida:** media

## Qué mejora sobre la fuente global

Capas oficiales nacionales, estaciones, isoyetas/isotermas y otros recursos hidrometeorológicos; potencial detalle local superior a NASA POWER.

## Cobertura

Ecuador; gran catálogo GeoNode/GeoServer, con coberturas variables y varios productos estáticos.

## Licencia

DESCARTADA por licencia insuficiente. INAMHI anunció en 2025 acceso gratuito y “sin restricciones” para empresas y ciudadanía, pero el WFS no identifica licencia del dataset y no se localizó texto jurídico de reutilización comercial/redistribución para cada capa. Aviso: https://www.inamhi.gob.ec/info-liberada/

## Acceso técnico

WFS vivo:

`GET https://geoservicios.inamhi.gob.ec/geoserver/ows?service=WFS&request=GetCapabilities`

## Campos que devuelve

Capacidades WFS con múltiples capas; formatos GML, GeoJSON, CSV, KML y SHAPE-ZIP. No se seleccionó una capa operativa porque ninguna candidata resolvió simultáneamente licencia + serie puntual.

## Qué falta o qué no da

Licencia exacta por recurso, inventario estable de capas de observación y una serie temporal consultable por punto/bbox. Muchas capas son mapas/estaciones, no valores vivos.

## Verificación

Probado el 2026-08-31. Respuesta real recortada:

```xml
<wfs:WFS_Capabilities version="2.0.0"><ows:Fees>NONE</ows:Fees><ows:AccessConstraints>NONE</ows:AccessConstraints>...<ows:Value>application/json</ows:Value>...</wfs:WFS_Capabilities>
```

`NONE` técnico no sustituye una licencia de reutilización.
