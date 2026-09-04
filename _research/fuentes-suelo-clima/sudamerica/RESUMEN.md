# Sudamérica — resumen priorizado

Relevamiento verificado el **2026-08-31**. El orden pondera: mejora real sobre SoilGrids 250 m o NASA POWER, posibilidad de consulta por punto/bbox, licencia compatible con un producto comercial y salud actual del servicio.

| Orden | Fuente | Tipo | Estado | Prioridad | Mejora sobre la fuente global | Bloqueo o siguiente acción |
|---:|---|---|---|---|---|---|
| 1 | Uruguay — MGAP, CONEAT/APDN | suelo / agua disponible | VIVA | alta | Cartografía edáfica parcelaria/nacional y APDN en mm; mucha más resolución y semántica local que SoilGrids | Implementar primero `query` por punto; mantener atribución según Datos Abiertos de Uruguay |
| 2 | Paraguay — DMH WIS2 | precipitación / evaporación / clima observado | VIVA | alta | Observación in situ reciente; es la única fuente relevada con evaporación diaria comprobada en la respuesta | Reutilizar adaptador WIS2; validar reglas de calidad antes de persistir |
| 3 | Argentina — SMN WIS2 | precipitación / clima observado | VIVA | alta | Estaciones nacionales actuales, con hora y ubicación exactas, frente a la grilla modelada de POWER | Reutilizar adaptador WIS2; descartar valores negativos de precipitación marcados por control de calidad |
| 4 | Brasil — INMET WIS2 | precipitación / clima observado | VIVA | alta | Red nacional densa, SYNOP horario y DAYCLI diario; mejor resolución temporal/local que POWER | Reutilizar adaptador WIS2; aplicar control de consistencia a máximas y medias |
| 5 | Colombia — IDEAM WIS2 | precipitación / clima observado | VIVA | alta | Observaciones nacionales actuales por bbox, más locales que POWER | Reutilizar adaptador WIS2 y conservar flags de calidad |
| 6 | Perú — SENAMHI WIS2 | precipitación / clima observado | VIVA | alta | Observaciones nacionales actuales por bbox, más locales que POWER | Reutilizar adaptador WIS2 y conservar flags de calidad |
| 7 | Chile — MeteoChile WIS2 | precipitación / clima observado | INTERMITENTE | alta | La colección oficial promete observación nacional actual por bbox | No implementar hasta que el servidor repare la negociación TLS y se pueda volver a guardar una respuesta real |
| 8 | Uruguay — INUMET catálogo abierto | clima observado | VIVA | media | Datos meteorológicos nacionales descargables y actualizados | Resolver el cruce estable estación↔coordenadas; hoy no cumple por sí solo la consulta geográfica |
| 9 | Suriname — MDS vía Caribbean WIS2 | precipitación / clima observado | VIVA | media | Observaciones nacionales actuales y normalizadas | Reutilizar adaptador WIS2; cobertura espacial reducida |
| 10 | Guyana — Hydromet vía Caribbean WIS2 | precipitación / clima observado | VIVA | media | Observaciones nacionales actuales y normalizadas | Reutilizar adaptador WIS2; medir densidad antes de prometer cobertura |
| 11 | Brasil — IBGE BDiA Pedología | suelo | DESCARTADA | alta si se aclara licencia | Polígonos y atributos pedológicos oficiales, más expresivos que SoilGrids | Pedir confirmación escrita de licencia comercial para la capa/servicio; el endpoint vivo no publica una licencia suficiente |
| 12 | Perú — SENAMHI PISCO | precipitación / temperatura / PET | DESCARTADA | alta si se aclara licencia y acceso | Series históricas peruanas de alta resolución; PET cubriría una carencia importante | Falta licencia comercial inequívoca y contrato estable de consulta por punto/bbox |
| 13 | Ecuador — INAMHI geoservicios | clima / cartografía | DESCARTADA | media si se aclara licencia | Capas nacionales y WFS operativo | La difusión pública no sustituye una licencia comercial explícita |
| 14 | Colombia — IDEAM Socrata precipitación | precipitación | DESCARTADA | baja | Registros oficiales consultables por API | CC BY-SA introduce obligación de compartir adaptaciones; no pasa la regla dura del proyecto |
| 15 | Colombia — IGAC suelos | suelo | DESCARTADA | alta si cambia licencia | Cartografía nacional de suelos potencialmente mucho más detallada que SoilGrids | Licencia BY-SA/ambigua para el uso previsto y endpoint actual sin respuesta fiable |
| 16 | Paraguay — DMH históricos a pedido | clima mensual / precipitación | DESCARTADA | baja | Podría aportar series históricas oficiales | Entrega manual y arancelada, sin API punto/bbox ni licencia de reutilización automatizada |
| 17 | Argentina — GeoINTA cartas de suelo | suelo | MUERTA | baja | Habría mejorado la resolución y nomenclatura local | El WFS histórico redirige y termina en 404; no hay licencia recuperable |
| 18 | Chile — CIREN/IDE Minagri histórico | suelo | MUERTA | baja | Habría aportado cartografía edáfica nacional | El WFS citado históricamente devuelve 404 y no se recuperó licencia comercial |
| 19 | Bolivia — IDE-EPB | suelo / cartografía | MUERTA | baja | Potencial de capas nacionales | El host no resuelve por DNS; no hay endpoint ni licencia verificables |

## Orden recomendado de implementación

1. **Uruguay MGAP/CONEAT** para suelo y APDN: es la mejora edáfica lista para integrar.
2. **Un adaptador WIS2 común** para Argentina, Brasil, Colombia, Perú y Paraguay. El modelo de datos, la consulta OGC API Features y las unidades se repiten; Paraguay añade evaporación.
3. Incorporar Suriname y Guyana al mismo adaptador cuando se acepte una cobertura de estaciones más rala.
4. Reprobar Chile periódicamente; no cambiar su estado hasta obtener una consulta TLS normal y una respuesta real.
5. Gestionar por escrito las licencias de IBGE BDiA, PISCO, IGAC e INAMHI antes de escribir código.

## Conversiones y cautelas comunes

- En WIS2, precipitación y evaporación expresadas como `kg m-2` de agua equivalen numéricamente a **mm**: `1 kg/m² = 1 mm`.
- Temperatura: `K → °C = K - 273,15`; cuando llega en °C no hay conversión.
- Presión: `Pa → hPa = Pa / 100`; conservar la unidad declarada por el parámetro BUFR.
- Viento: `m/s → km/h = m/s × 3,6` sólo si la aplicación exige km/h.
- No convertir ni persistir un valor meteorológico sin revisar sus flags de calidad y el período de acumulación.

## Vacíos del relevamiento

- No se verificó una fuente nacional implementable de **suelo** fuera de Uruguay que cumpla simultáneamente endpoint por punto/bbox, servicio vivo y licencia comercial inequívoca.
- No se encontró una API nacional elegible de normales de **clima mensual**; WIS2 aporta observaciones, no reemplaza por sí solo las climatologías mensuales de POWER.
- PISCO sería la mejor candidata regional para PET/ETP histórica, pero queda descartada hasta aclarar licencia y acceso.
- Para Venezuela no se logró verificar un servicio nacional vivo por punto/bbox con licencia comercial explícita. Guayana Francesa quedó fuera por pertenecer administrativamente a Francia y al reparto europeo.

