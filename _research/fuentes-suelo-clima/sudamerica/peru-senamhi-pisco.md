# Perú — PISCO precipitación, temperatura y PET (SENAMHI)

**Tipo:** clima | precipitación | ETP/evaporación
**Estado:** DESCARTADA
**Prioridad sugerida:** alta

## Qué mejora sobre la fuente global

Producto grillado peruano de precipitación y temperatura de ~5–10 km, y PET reportada hasta 1 km en productos de investigación; mejora notablemente la resolución de NASA POWER y cubre desde 1981.

## Cobertura

Perú y cuencas transfronterizas. Versiones publicadas no son uniformes: PISCOp mensual/diaria continúa en algunos portales; temperatura y PET estable se documentan principalmente para 1981–2016.

## Licencia

DESCARTADA: SENAMHI lo presenta como gratuito/disponible, pero no se encontró licencia con autorización comercial ni términos de reutilización del conjunto PISCO. Gratuidad no equivale a licencia.

## Acceso técnico

Principalmente descarga de ráster/IRI Data Library, no una API nacional documentada por punto o bbox. Entrada publicada:

`GET https://iridl.ldeo.columbia.edu/SOURCES/.SENAMHI/.HSR/.PISCO/?Set-Language=es`

## Campos que devuelve

Según documentación: precipitación `P`, temperatura del aire `TA` y evapotranspiración potencial `PET`, diaria/mensual según subproducto.

## Qué falta o qué no da

Licencia comercial exacta, endpoint contractual por punto/bbox y definición vigente de versiones/latencia. Para la app no conviene descargar/servir mosaicos nacionales sin resolver eso.

## Verificación

Revisado el 2026-08-31. La página oficial SENAMHI seguía describiendo PISCO mensual desde 1981 y resolución aproximada de 5 km: https://www.senamhi.gob.pe/?dp=ica&p=sequias. No se obtuvo una respuesta JSON puntual; ésa es precisamente la razón técnica adicional del descarte.
