# Colombia — suelos del geoportal (IGAC)

**Tipo:** suelo
**Estado:** DESCARTADA
**Prioridad sugerida:** media

## Qué mejora sobre la fuente global

Cartografía agrológica oficial con unidades/clases locales que puede complementar la estimación continua de SoilGrids.

## Cobertura

Colombia, con múltiples productos y escalas; no se confirmó una única capa homogénea nacional en el servicio probado.

## Licencia

DESCARTADA: la página actual de datos geoespaciales usa CC BY-SA 4.0 para productos, mientras antecedentes normativos citan CC BY 4.0. La contradicción y el share-alike vigente impiden aprobarla. Página oficial: https://www.igac.gov.co/datos-abiertos/datos-abiertos-geoespaciales

## Acceso técnico

Se intentó el ArcGIS REST publicado:

`GET https://mapas2.igac.gov.co/server/rest/services/ordenamiento/componentebiofisico/MapServer/27/query?f=pjson&where=1%3D1&geometry=-74.0721%2C4.711&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=%2A&returnGeometry=false`

## Campos que devuelve

No verificados en esta prueba por falta de respuesta.

## Qué falta o qué no da

Licencia inequívoca sin share-alike, endpoint estable y diccionario de atributos por capa.

## Verificación

Probado el 2026-08-31. Respuesta real del cliente: `Failed to connect to mapas2.igac.gov.co port 443 after 21284 ms`. Además de descartada legalmente, la instancia no fue operativa en la prueba.
