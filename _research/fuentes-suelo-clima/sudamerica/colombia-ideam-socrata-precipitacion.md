# Colombia — precipitación automática en datos.gov.co (IDEAM)

**Tipo:** precipitación
**Estado:** DESCARTADA
**Prioridad sugerida:** baja

## Qué mejora sobre la fuente global

Observaciones cada 10 minutos, cerca de 800 estaciones y coordenadas; técnicamente mejora mucho NASA POWER y ofrece historia anterior a WIS2.

## Cobertura

Colombia, estaciones automáticas. Datos crudos con advertencias de calidad.

## Licencia

DESCARTADA: el metadato API declara `CC_40_BY_SA`, Creative Commons Attribution-ShareAlike 4.0. La regla del proyecto excluye fuentes copyleft/share-alike. Metadato: https://www.datos.gov.co/api/views/s54a-sgyg

## Acceso técnico

Socrata SODA, sin clave para consultas pequeñas:

`GET https://www.datos.gov.co/resource/s54a-sgyg.json?$limit=3&$where=latitud%20between%204.5%20and%204.7%20and%20longitud%20between%20-74.2%20and%20-74.0`

## Campos que devuelve

Código/nombre de estación, sensor, fecha, valor, departamento, municipio, zona hidrográfica, latitud, longitud, descripción y unidad.

## Qué falta o qué no da

Licencia compatible. Los registros son preliminares/no validados; requieren deduplicación y control de calidad.

## Verificación

Probado el 2026-08-31. Respuesta real recortada:

```json
[{"codigoestacion":"0021202250","fechaobservacion":"2015-12-06T00:50:00.000","valorobservado":"0","nombreestacion":"DOÑA JUANA - FOPAE","latitud":"4.5","longitud":"-74.133","descripcionsensor":"Precipitacion","unidadmedida":"mm"}]
```
