# Argentina — GeoINTA / cartas de suelo (INTA)

**Tipo:** suelo
**Estado:** MUERTA
**Prioridad sugerida:** baja

## Qué mejora sobre la fuente global

Las cartas oficiales de suelo y unidades cartográficas podrían aportar clasificación y detalle local superior a SoilGrids.

## Cobertura

Variable por provincia/proyecto; no se encontró un servicio nacional vigente y uniforme.

## Licencia

No se encontró una licencia de reutilización comercial aplicable a las capas. Aunque el servicio reviviera, no debe integrarse sin autorización o licencia explícita.

## Acceso técnico

El WFS histórico redirige a un sitio WordPress que ya no contiene GeoServer:

`GET https://geointa.inta.gob.ar/geoserver/ows?service=WFS&request=GetCapabilities`

## Campos que devuelve

Ninguno actualmente. La documentación histórica menciona mapas/unidades de suelo, pero no se pudo obtener un esquema vivo.

## Qué falta o qué no da

Endpoint operativo, catálogo de capas, licencia exacta y ejemplo de atributos. No debe confundirse con visualizadores o descargas provinciales aisladas.

## Verificación

Probado el 2026-08-31. Respuesta real: HTTP `301 Location: https://geo.inta.gob.ar`; al seguirla, `https://geo.inta.gob.ar/geoserver/ows?...` respondió `404` desde el sitio web institucional.
