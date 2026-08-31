# Europa — CERRA-Land vía Climate Data Store (Copernicus / ECMWF)

**Tipo:** clima
**Estado:** VIVA — **DESCARTADA por la forma de acceso**, no por la licencia ni
por la calidad
**Prioridad sugerida:** baja

## Qué mejora sobre la fuente global

CERRA es el reanálisis regional europeo: **5,5 km** contra los ~50 km de la
climatología de NASA POWER y los ~10 km de ERA5. CERRA-Land es su capa de
superficie y suelo —precipitación, humedad del suelo, nieve, evaporación— desde
1984. Para un predio en los Alpes o en el Cantábrico, donde el relieve arma el
clima en pocos kilómetros, la diferencia entre 50 km y 5,5 km es la diferencia
entre describir la región y describir el predio.

Sobre el papel es exactamente lo que Europa necesita, y es el equivalente europeo
de lo que Daymet hace en Norteamérica.

## Por qué queda afuera igual

**El CDS no se consulta, se le encarga.** No hay endpoint que devuelva el valor
de un punto: se envía un trabajo, entra en una cola compartida con todo el mundo,
y cuando termina deja un archivo GRIB o NetCDF para descargar. Los tiempos van de
minutos a horas según la carga.

Eso no se puede poner detrás de un usuario que marcó su terreno y está esperando
el análisis. Y tampoco se resuelve precalculando: sería bajar Europa entera y
hostearla, que es justo lo que el README excluye.

Es el mismo motivo que baja a CaPA en Canadá (`norteamerica/canada-capa-hrdpa.md`),
aunque por la razón inversa: a CaPA le falta archivo, a CERRA le falta puerta.

Aparecieron en el catálogo del CDS procesos nuevos con nombre prometedor
—`reanalysis-era5-land-timeseries`, `reanalysis-era5-single-levels-timeseries`—
que sí están pensados para series por punto. **Vale la pena volver a mirarlos
cuando exista uno equivalente para CERRA**, porque cambiarían el veredicto de
esta ficha. Hoy siguen corriendo sobre la misma cola asincrónica.

## Cobertura

Europa continental más el norte de África y una franja del Atlántico. Bounding
box aproximado del dominio: `[-58.0, 20.0, 74.0, 72.0]` (es grande porque la
proyección Lambert del modelo, al pasarla a lat/lon, se abre mucho en los
bordes).

## Licencia

Licencia de productos Copernicus / ECMWF. **Permite uso comercial**, con
atribución. Es de las licencias más cómodas que hay: no es el problema acá.

- Términos: https://cds.climate.copernicus.eu/datasets/reanalysis-cerra-land
- Atribución: **"Generado con datos del Copernicus Climate Change Service (C3S)"**,
  más el aviso de que ni la Comisión Europea ni ECMWF responden por el uso que
  se les dé.

## Acceso técnico

- **Endpoint:** `https://cds.climate.copernicus.eu/api/retrieve/v1/processes` —
  OGC API Processes. El proceso es `reanalysis-cerra-land`.
- **Pide clave**: hay que crear una cuenta gratuita en el CDS y aceptar los
  términos del dataset **uno por uno** desde la web. La clave no se commitea
  (regla del README).
- **Formato de salida:** GRIB o NetCDF. No JSON.

**El listado de procesos sí responde sin clave**, y sirve para confirmar que el
dataset sigue publicado:

```
GET https://cds.climate.copernicus.eu/api/retrieve/v1/processes?limit=200
```

**Respuesta real** (recortada — 164 procesos en total; los relevantes):

```json
{"processes":[
  {"id":"reanalysis-cerra-land",
   "title":"CERRA-Land sub-daily regional reanalysis data for Europe from 1984 to present",
   "description":"The Copernicus European Regional ReAnalysis Land (CERRA-Land) dataset provides spatially and temporally consistent historical reconstructions of surface and soil variables at the same horizontal resolution as the CERRA high-resolution reanalysis. …"},
  {"id":"reanalysis-cerra-single-levels"},
  {"id":"reanalysis-era5-land-timeseries"},
  {"id":"reanalysis-era5-single-levels-timeseries"},
  {"id":"derived-era5-land-daily-statistics"}
]}
```

- **Límites de request:** cola por usuario, con tope de trabajos simultáneos y de
  tamaño del pedido. No hay número publicado estable.
- **Tiempo de respuesta observado:** 1,7 s el listado de procesos. La ejecución
  de un pedido real no se midió porque requiere cuenta; la documentación del CDS
  habla de minutos a horas.

## Campos que devuelve

| Campo | Qué es | Unidad | Equivale en la app a |
|---|---|---|---|
| `total_precipitation` | precipitación acumulada | m (¡metros!) | `precip_mm` — × 1000 |
| `2m_temperature` | temperatura a 2 m | **K** | `tmean_c` — − 273,15 |
| `volumetric_soil_moisture` | humedad del suelo por capa | m³/m³ | no tiene equivalente hoy |
| `snow_depth_water_equivalent` | nieve en equivalente de agua | m | no tiene equivalente hoy |
| `surface_runoff` | escorrentía superficial | m | contrastable con el CN |

**Ojo con las unidades.** El estándar de ECMWF es **kelvin y metros**, no grados
y milímetros. Un `total_precipitation` de `0.0035` son 3,5 mm, no 0,0035. Es el
error clásico con datos de ECMWF y da resultados que parecen plausibles —tres
órdenes de magnitud abajo se lee como "un año seco"— así que no salta solo.

## Qué falta o qué no da

- **Viento**: está en `reanalysis-cerra-single-levels`, no en la capa Land. Serían
  dos pedidos.
- **La puerta**: ver arriba. Es lo único que falta y es lo que la descarta.

## Verificación

Probado el **31/08/2026**: el catálogo de procesos del CDS responde 200 y
`reanalysis-cerra-land` figura publicado con su descripción. No se ejecutó un
pedido real: requiere cuenta y aceptar los términos del dataset a mano, y el
resultado —un archivo encolado— ya alcanza para el veredicto.
