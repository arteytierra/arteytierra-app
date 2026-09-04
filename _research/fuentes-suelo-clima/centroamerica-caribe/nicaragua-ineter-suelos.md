# Nicaragua — geoservicios de suelo y precipitación (IDE-INETER)

**Tipo:** suelo | precipitación
**Estado:** DESCARTADA
**Prioridad sugerida:** alta

## Qué mejora sobre la fuente global

Capas locales de carbono orgánico, calcio, CIC, series de suelo por municipio/cuenca y mapas climatológicos de exceso de precipitación 1971–2010; potencialmente más detalladas que SoilGrids/POWER.

## Cobertura

Nicaragua; algunas capas nacionales y muchas parciales (Pacífico, cuencas, municipios).

## Licencia

DESCARTADA. El WFS dice `Fees NONE`/`AccessConstraints NONE` y el portal promueve reutilización, pero no nombra una licencia comercial. Términos de otra plataforma INETER (IDEC) restringen uso a académico/personal sin lucro y prohíben comercialización; sin términos específicos de IDE-INETER no se puede aprobar.

## Acceso técnico

WFS vivo:

`GET https://geoserverideet.ineter.gob.ni/geoserver/wfs?service=WFS&version=2.0.0&request=GetCapabilities`

Catálogo: https://www.ineter.gob.ni/ide-ineter/direccion-general-de-ordenamiento-territorial/

## Campos que devuelve

Dependen de la capa. El capabilities lista workspaces `wsINETER-OT`, `wsINETER-GC` y formatos GeoJSON/CSV/GML; capas visibles incluyen `Serie_Suelo_*` y productos de carbono/CIC.

## Qué falta o qué no da

Licencia comercial por dataset, diccionarios de atributos y cobertura consistente. No asumir que `AccessConstraints NONE` elimina derechos de autor.

## Verificación

Probado el 2026-08-31. Respuesta real recortada:

```xml
<wfs:WFS_Capabilities version="2.0.0"><ows:ProviderName>Instituto Nicaragüense de Estudios Territoriales</ows:ProviderName><ows:Fees>NONE</ows:Fees><ows:AccessConstraints>NONE</ows:AccessConstraints>...</wfs:WFS_Capabilities>
```
