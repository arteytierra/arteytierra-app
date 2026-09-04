# Paraguay — históricos y ETP por solicitud (DINAC-DMH)

**Tipo:** clima | precipitación | ETP/evaporación
**Estado:** DESCARTADA
**Prioridad sugerida:** baja

## Qué mejora sobre la fuente global

Dispone de observación diaria/mensual, evaporación, heliofanía, ETP Thornthwaite y balance hídrico por localidad.

## Cobertura

Red meteorológica nacional de Paraguay.

## Licencia

No hay licencia abierta para esta provisión; es un servicio arancelado por registro/parámetro/localidad y requiere solicitud. No es reutilización automática autorizada.

## Acceso técnico

No existe endpoint público por punto/bbox. Página oficial:

`GET https://www.meteorologia.gov.py/servicio-publico/`

## Campos que devuelve

Temperatura, humedad, precipitación, evaporación, heliofanía, ETP Thornthwaite y balance hídrico, según pedido.

## Qué falta o qué no da

API, licencia comercial/republicación y costo compatible con consultas de producto. La tarifa publicada es USD 7,70 por registro diario de cada parámetro, en forma mensual y por localidad.

## Verificación

Revisado el 2026-08-31. Respuesta real de la página: `El costo de la provisión de los datos ... 7,70 U$D ... por la provisión del registro diario de cada parámetro en forma mensual y por localidad.` El acceso público reciente debe hacerse por la ficha WIS2 separada.
