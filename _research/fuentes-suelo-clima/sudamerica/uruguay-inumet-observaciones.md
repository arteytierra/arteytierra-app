# Uruguay — observaciones meteorológicas abiertas (INUMET)

**Tipo:** clima | precipitación
**Estado:** VIVA
**Prioridad sugerida:** media

## Qué mejora sobre la fuente global

Series horarias oficiales desde 2019, actualizadas diariamente, para precipitación y temperatura; son más locales que NASA POWER y permiten agregación mensual por estación.

## Cobertura

Uruguay, estaciones automáticas. El recurso de precipitación tenía 343.666 filas y temperatura 385.142 en la prueba.

## Licencia

`Licencia de DAG de Uruguay` (`odc-uy`), que permite uso comercial, transformación e integración con atribución. Metadato: https://catalogodatos.gub.uy/api/3/action/package_show?id=fd896b11-4c04-4807-bae4-5373d65beea2

## Acceso técnico

CKAN DataStore sin clave. Precipitación:

`GET https://catalogodatos.gub.uy/api/3/action/datastore_search?resource_id=cc785e9e-d9c8-4706-b013-9a6a5b0f7d01&limit=2`

Temperatura: recurso `f800fc53-556b-4d1c-8bd6-28b41f9cf146`. Heliofanía: `03e772e0-018e-48fa-8356-2573caa42c37`.

## Campos que devuelve

`fecha`, `estacion_id`, `precip_horario`; temperatura: `temp_aire`; heliofanía: `heliofania`.

## Qué falta o qué no da

Los registros no incluyen latitud/longitud y no se halló en el catálogo una tabla oficial para el join; por eso todavía no es directamente resoluble desde un punto. La consulta SQL agregada fue bloqueada por WAF; se puede paginar y agregar del lado cliente. No entrega ETP.

## Verificación

Probado el 2026-08-31. Respuesta real recortada:

```json
{"records":[{"fecha":"2020-01-01 00:00","estacion_id":"Aeropuerto Melilla G3","precip_horario":"0.2"},{"fecha":"2020-01-01 01:00","estacion_id":"Aeropuerto Melilla G3","precip_horario":"0"}],"total":343666}
```

Precipitación ya está en `mm`; convertir texto a decimal antes de sumar. Temperatura en `°C`; heliofanía en horas/día.
