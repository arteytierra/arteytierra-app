# México — SIH y API de pronóstico (CONAGUA/SMN)

**Tipo:** clima | precipitación
**Estado:** DESCARTADA
**Prioridad sugerida:** baja

## Qué mejora sobre la fuente global

La red nacional tiene datos observados locales y la API pública ofrece pronóstico de corto plazo.

## Cobertura

México; estaciones hidrometeorológicas y pronóstico nacional.

## Licencia

No se encontró licencia específica de reutilización comercial para las series SIH/API en la documentación consultada.

## Acceso técnico

SIH publica archivos/descargas, no consulta puntual: `GET https://sih.conagua.gob.mx/climas.html`.

La API documentada `GET https://smn.conagua.gob.mx/tools/GUI/webservices/?method=1` devuelve un archivo comprimido de pronóstico de tres días, no clima mensual histórico.

Respuesta real recortada de esa consulta:

```text
Content-Type: application/octet-stream
[contenido comprimido de pronóstico; no JSON ni serie histórica]
```

## Campos que devuelve

Según producto: estaciones, precipitación/temperatura observada en archivos; la API de `method=1` es pronóstico, no la serie requerida.

## Qué falta o qué no da

Licencia comercial, endpoint histórico por punto/bbox, normales mensuales y ETP. No mejora la fuente global para el caso de uso pedido sin ingestión masiva.

## Verificación

Probado/revisado el 2026-08-31. El web service respondió contenido comprimido (`application/octet-stream`) y la documentación oficial lo limita a pronóstico de tres días; SIH siguió ofreciendo descargas por estación. DESCARTADA por alcance y licencia.
