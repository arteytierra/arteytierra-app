# Uruguay — CONEAT y Agua Disponible (MGAP)

**Tipo:** suelo
**Estado:** VIVA
**Prioridad sugerida:** alta

## Qué mejora sobre la fuente global

Unidad oficial CONEAT y agua potencialmente disponible neta (APDN) en mm, a resolución cartográfica nacional; el APDN es una mejora agronómica directa frente a inferir capacidad de agua sólo desde SoilGrids.

## Cobertura

Uruguay completo. Capa de grupos CONEAT y carta temática APDN.

## Licencia

Licencia de Datos Abiertos Uruguay v0.1: permite uso comercial/no comercial, transformación e incorporación en productos y aplicaciones; exige atribución de organismo, conjunto, licencia y modificaciones. Texto: https://www.gub.uy/agencia-reguladora-compras-estatales/datos-y-estadisticas/datos/licencia-datos-abiertos. Los términos del catálogo aplican la licencia DAG por defecto a datos públicos sin licencia específica.

## Acceso técnico

ArcGIS REST sin clave. Ejemplo APDN en Montevideo:

`GET https://mapas.mgap.gub.uy/arcgis/rest/services/SNIA_Temas/Cartas_Tematicas/MapServer/8/query?f=pjson&where=1%3D1&geometry=-56.1645%2C-34.9011&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=%2A&returnGeometry=false`

Grupo CONEAT: `https://dgrn.mgap.gub.uy/arcgis/rest/services/CONEAT/SuelosConeat/MapServer/1/query?...`

## Campos que devuelve

`GC` (grupo CONEAT), `APDN`, `Clasificacion_APD`, `OBJECTID`; la capa CONEAT básica devuelve `SC`.

## Qué falta o qué no da

No da porcentajes de textura, pH, materia orgánica ni Ksat. Mantener SoilGrids como fallback para esos campos y usar MGAP para grupo/agua disponible.

## Verificación

Probado el 2026-08-31. Respuesta real:

```json
{"features":[{"attributes":{"GC":"10.6a","APDN":119.0,"Clasificacion_APD":"71-120 mm, Moderadamente Alta","OBJECTID":33061}}]}
```

APDN ya está en `mm`; no requiere conversión.
