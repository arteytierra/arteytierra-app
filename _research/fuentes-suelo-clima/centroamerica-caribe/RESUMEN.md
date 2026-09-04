# Centroamérica y Caribe — resumen priorizado

Relevamiento verificado el **2026-08-31**. México se incluye en esta región según el reparto del encargo. Puerto Rico se excluye porque ya queda cubierto por SSURGO.

| Orden | Fuente | Tipo | Estado | Prioridad | Mejora sobre la fuente global | Bloqueo o siguiente acción |
|---:|---|---|---|---|---|---|
| 1 | Caribe — CMO WIS2 regional | precipitación / clima observado | VIVA | alta | Una sola OGC API da observaciones actuales y georreferenciadas de numerosos territorios insulares, más locales que POWER | Implementar un adaptador regional y medir cobertura por país/estación |
| 2 | Belice — NMS WIS2 | precipitación / clima observado | VIVA | alta | Colección nacional y espejo regional consultables por bbox; respuesta de precipitación comprobada | Puede compartir el adaptador WIS2 con el Caribe y Sudamérica |
| 3 | Honduras — CENAOS WIS2 | precipitación / clima observado | INTERMITENTE | alta | El backend entrega datos nacionales actuales por bbox | Certificado TLS vencido; no desactivar la validación en producción. Esperar reparación y volver a probar |
| 4 | México — INEGI Edafología Serie II | suelo | DESCARTADA | alta si aparece API | Información edáfica oficial, vectorial y con licencia comercial permisiva; mejora claramente SoilGrids | El producto comprobado es descarga masiva, no servicio vivo por punto/bbox. La referencia oficial localizada es Serie II, no una supuesta Serie VII |
| 5 | Nicaragua — INETER IDEET suelos | suelo | DESCARTADA | alta si se aclara licencia | WFS nacional vivo con cartografía temática potencialmente más detallada que SoilGrids | `Fees: NONE` y `AccessConstraints: NONE` no equivalen a licencia comercial; obtener autorización escrita |
| 6 | Costa Rica — IMN WIS2 | precipitación / clima observado | DESCARTADA | media | Metadatos y publicación WIS2 core oficiales | Sólo se comprobó catálogo/MQTT; no se localizó una consulta HTTP punto/bbox reproducible |
| 7 | Costa Rica — INTA/SNIT suelos | suelo | DESCARTADA | media | Cartografía nacional potencialmente superior a SoilGrids | No se verificó conjuntamente endpoint público estable y licencia comercial de la capa |
| 8 | Guatemala — INSIVUMEH | precipitación / evaporación / clima | DESCARTADA | media | La red observa lluvia, temperatura, evaporación y otras variables valiosas | La web describe productos, pero no ofrece API punto/bbox ni licencia de reutilización comercial verificable |
| 9 | República Dominicana — INDOMET datos mensuales | clima mensual / precipitación | DESCARTADA | media | CSV oficiales recientes y mensuales | Es descarga por archivo, no punto/bbox; la aplicación general de ODbL y las condiciones del sitio requieren aclaración para este uso |
| 10 | Cuba — INSMET WIS2 | precipitación / clima observado | DESCARTADA | media | Publicación WIS2 core legalmente reutilizable | Se comprobó catálogo/MQTT, pero no un endpoint HTTP de observaciones por punto/bbox |
| 11 | México — CONAGUA SIH | precipitación / clima observado | DESCARTADA | media | Red hidrometeorológica nacional densa | Acceso orientado a portal/descargas; no se verificó API pública contractual por punto/bbox ni licencia comercial suficiente |
| 12 | Caribe — CIMH climatología | clima mensual / precipitación | DESCARTADA | media | Series y productos climáticos regionales especializados | El material se declara propietario y no se obtuvo licencia comercial compatible |
| 13 | Panamá — ETESA Hidrometeorología | clima / precipitación | DESCARTADA | baja | Datos oficiales de estaciones | El esquema publicado es venta/solicitud de datos, sin API pública por punto/bbox ni licencia automatizable |
| 14 | Regional — SICA/CATIE | suelo / clima | DESCARTADA | baja | Podría armonizar varios países | No se identificó un servicio concreto, vivo, consultable por punto/bbox y con licencia comercial explícita |

## Orden recomendado de implementación

1. **CMO WIS2 regional** y **Belice NMS WIS2** con el mismo adaptador usado en Sudamérica.
2. Volver a probar Honduras sólo después de la renovación del certificado TLS; nunca usar `-k` ni desactivar la validación en la aplicación.
3. Si se admite preprocesamiento propio fuera de la regla de endpoint vivo, INEGI Edafología sería la primera fuente de suelo a reconsiderar; bajo la regla actual queda descartada.
4. Pedir licencia escrita a INETER antes de usar su WFS de suelos.

## Conversiones y cautelas comunes

- En WIS2, precipitación expresada como `kg m-2` de agua equivale numéricamente a **mm**: `1 kg/m² = 1 mm`.
- Temperatura: `K → °C = K - 273,15`; presión: `Pa → hPa = Pa / 100`; viento: `m/s → km/h = m/s × 3,6` cuando acequia lo requiera.
- El valor de precipitación sólo es comparable si se conserva el período de acumulación del descriptor BUFR.
- Las fuentes WIS2 relevadas son principalmente observaciones actuales; no deben presentarse como normales climáticas mensuales sin agregación y control de completitud.

## Vacíos del relevamiento

- No quedó ninguna fuente de **suelo** que cumpla a la vez licencia, servicio vivo y consulta por punto/bbox. INEGI es legalmente fuerte pero descarga masiva; INETER tiene WFS pero licencia insuficiente.
- No se verificó una fuente elegible de **ETP/PET**. INSIVUMEH menciona evaporación observada, pero carece de API y licencia; evaporación de tanque/Piché tampoco es ETP de referencia sin un modelo de conversión.
- No se verificaron APIs nacionales elegibles para El Salvador. En Guatemala y Panamá se hallaron productos o trámites, no contratos técnicos reutilizables.
- Para varias islas pequeñas, CMO WIS2 resuelve la disponibilidad regional, pero la densidad real de estaciones debe auditarse país por país antes de prometer cobertura.

