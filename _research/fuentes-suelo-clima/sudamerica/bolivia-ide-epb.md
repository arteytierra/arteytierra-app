# Bolivia — IDE-EPB / GeoBolivia

**Tipo:** suelo | clima | precipitación
**Estado:** MUERTA
**Prioridad sugerida:** baja

## Qué mejora sobre la fuente global

El catálogo se presenta como plataforma nacional de datos geoespaciales abiertos y podría contener capas oficiales locales.

## Cobertura

Bolivia; cobertura dependiente de cada organismo/capa.

## Licencia

No se encontró una licencia específica que habilite uso comercial de las capas de suelo/clima candidatas. “Abierto, colaborativo y gratuito” no basta para la regla legal.

## Acceso técnico

Endpoint WFS intentado:

`GET https://ideepb.geo.gob.bo/geoserver/ows?service=WFS&request=GetCapabilities`

Portal publicado: https://ideepb.geo.gob.bo/

## Campos que devuelve

Ninguno en la verificación del servicio.

## Qué falta o qué no da

DNS/endpoint operativo, capas relevantes, licencia por dataset y ejemplo puntual.

## Verificación

Probado el 2026-08-31. Respuesta real del cliente: `curl: (6) Could not resolve host: ideepb.geo.gob.bo`. La documentación del portal apareció en buscadores, pero el servicio no resolvió: MUERTA hasta nueva prueba.
