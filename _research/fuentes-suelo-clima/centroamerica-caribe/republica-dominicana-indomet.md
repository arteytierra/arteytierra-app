# República Dominicana — acumulados mensuales abiertos (INDOMET)

**Tipo:** precipitación
**Estado:** DESCARTADA
**Prioridad sugerida:** media

## Qué mejora sobre la fuente global

Acumulados mensuales oficiales 2018–2026, potencialmente más representativos localmente que NASA POWER.

## Cobertura

República Dominicana; el archivo publicado es pequeño y se actualiza, pero no se verificaron coordenadas por estación en la página.

## Licencia

Los datos abiertos dominicanos se publican bajo ODbL según NORTIC A3. Permite uso comercial, pero obliga a compartir bases derivadas bajo ODbL; no obliga a abrir el código de la app. Aun así, los términos generales de INDOMET dicen que contenidos del portal están protegidos, y el recurso no expone ficha de licencia individual: requiere validación jurídica antes de usar.

## Acceso técnico

Descargas CSV/XLS/ODS, no consulta por punto/bbox:

`GET https://indomet.gob.do/transparencia/datos-abiertos/acumulados-de-precipitacion/`

## Campos que devuelve

Acumulados mensuales; la estructura exacta depende del archivo descargado.

## Qué falta o qué no da

Endpoint puntual/bbox, coordenadas/registro de estaciones y resolución de la contradicción entre ODbL de datos abiertos y términos generales. Por el criterio técnico del README queda DESCARTADA.

## Verificación

Probado el 2026-08-31. La página respondió y listó `Acumulados de precipitacion mensual INDOMET 2018–2026` en CSV, Excel y ODS, actualizado el 2026-07-18. No hubo respuesta JSON puntual.
