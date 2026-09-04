# Caribe — climatología de estaciones (Caribbean RCC/CIMH)

**Tipo:** clima | precipitación
**Estado:** DESCARTADA
**Prioridad sugerida:** media

## Qué mejora sobre la fuente global

Normales 1991–2020 de lluvia mensual y temperatura por estación para numerosos territorios caribeños, basadas en observaciones terrestres.

## Cobertura

Caribe regional: decenas de territorios/estaciones, con cobertura desigual.

## Licencia

DESCARTADA. La propia página marca la información como propietaria: los países la cedieron a CariCOF y pide contactar para acceso a los datos. Sólo autoriza compartir la información gráfica/textual de la página con cita, no reutilizar comercialmente la base.

## Acceso técnico

Sitio web interactivo, sin API pública por punto/bbox:

`GET https://rcc.cimh.edu.bb/caribbean-climatology/`

Estaciones: `https://rcc.cimh.edu.bb/caribbean-climatology/stations/`.

## Campos que devuelve

Normales de precipitación mensual y temperatura media por estación, mostradas en páginas/gráficos.

## Qué falta o qué no da

Licencia comercial y endpoint JSON/GeoJSON. CAROGEN requiere usuario/permisos.

## Verificación

Revisado el 2026-08-31. Respuesta real de la página: `The climate data ... were kindly made available by the participating member states ... Please contact us for questions pertaining to access to these data`. La restricción es explícita.
