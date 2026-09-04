# Guatemala — estaciones convencionales (INSIVUMEH)

**Tipo:** clima | precipitación | evaporación
**Estado:** DESCARTADA
**Prioridad sugerida:** media

## Qué mejora sobre la fuente global

Variables observadas locales: lluvia, Tmin/Tmax, humedad, brillo solar, radiación, evaporación de tanque/Piché y temperatura de suelo. Técnicamente permitiría incluso calcular ETP.

## Cobertura

Guatemala; red convencional, con descargas recientes por estación y tablas mensuales preliminares.

## Licencia

No se encontró licencia abierta comercial para estos datos. Algunos materiales INSIVUMEH usan CC BY-NC-SA, que prohíbe uso comercial; no puede extrapolarse una licencia más permisiva a la red.

## Acceso técnico

Página de variables/visor: `GET https://insivumeh.gob.gt/variables_clima/`. Permite seleccionar estación y descargar últimos 30 días, pero no documenta API por punto/bbox.

Mensuales: `https://insivumeh.gob.gt/datos-mensuales-usuario-final/`.

## Campos que devuelve

`lluvia (mm)`, `tmin/tmax/tseca (°C)`, `eva_tan/eva_piche (mm)`, `hum_rel (%)`, `bri_sola (h)`, viento, presión, radiación y temperaturas de suelo.

## Qué falta o qué no da

Licencia comercial, API estable y serie completa consultable programáticamente. Los últimos 30 días no forman climatología mensual histórica.

## Verificación

Revisado el 2026-08-31. La página oficial devolvió la lista real: `lluvia (mm) ... eva_tan (mm) ... eva_piche (mm) ... bri_sola (horas sol) ... rad_solar ... tsuelo_50 ...`; no publicó términos de reutilización junto al recurso.
