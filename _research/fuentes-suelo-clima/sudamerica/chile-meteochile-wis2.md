# Chile — WIS2 SYNOP y CLIMAT (Dirección Meteorológica de Chile)

**Tipo:** clima | precipitación
**Estado:** INTERMITENTE
**Prioridad sugerida:** alta

## Qué mejora sobre la fuente global

Observaciones de estaciones horarias y colección climática mensual/dia, más locales que NASA POWER. La colección mensual contiene temperatura y precipitación.

## Cobertura

Chile, según estaciones DMC. El índice del servicio mostraba 2.042.059 observaciones horarias y 2.635 elementos en `climat-monthly-dayli`.

## Licencia

Los metadatos declaran `wmo:dataPolicy: core`, apto para uso comercial sin condiciones bajo Resolución 1 OMM. Referencia: https://wischile.meteochile.gob.cl/oapi/collections/discovery-metadata/items/urn%3Awmo%3Amd%3Acl-meteochile%3Aclimat-monthly?f=html

## Acceso técnico

OGC API Features con `bbox`. Ejemplo intentado:

`GET https://wischile.meteochile.gob.cl/oapi/collections/urn%3Awmo%3Amd%3Acl-meteochile%3Asynop-onehours/items?f=json&limit=3&bbox=-70.9,-33.7,-70.4,-33.2&name=total_precipitation_or_total_water_equivalent&sortby=-reportTime`

## Campos que devuelve

Geometría, WIGOS, `name`, `phenomenonTime`, `reportTime`, `units`, `value`. El navegador indexado muestra `air_temperature`, humedad, presión y precipitación; CLIMAT incluye máximas, mínimas, medias y acumulado.

## Qué falta o qué no da

Disponibilidad TLS estable. No se confirmó ETP. La colección mensual principal está anunciada, pero en la UI verificada no tenía enlace de observaciones; sí lo tenía `climat-monthly-dayli`.

## Verificación

El 2026-08-31 la consulta falló dos veces durante el handshake TLS: `SEC_E_ILLEGAL_MESSAGE`; no se obtuvo JSON en vivo desde este cliente. La página oficial indexada una semana antes sí devolvía, entre otros:

```text
0-20000-0-85469-202606010000-0 | air_temperature (maximum value) | Celsius | 26.3
0-20000-0-85469-202606010000-3 | total_accumulated_precipitation | ...
```

Por eso queda INTERMITENTE, no MUERTA. `kg m-2` de agua equivale a `mm`.
