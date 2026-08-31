# Canadá — CaPA / HRDPA-RDPA vía MSC GeoMet (Environment and Climate Change Canada)

**Tipo:** precipitación
**Estado:** VIVA
**Prioridad sugerida:** baja — **no sirve para lo que la buscábamos**

## Qué mejora sobre la fuente global

CaPA (Canadian Precipitation Analysis) fusiona radar, pluviómetros y el modelo
numérico. La variante HRDPA llega a **2,5 km**, contra los ~50 km de NASA POWER
y el 1 km de Daymet. Sobre el papel es la mejor precipitación disponible para
Canadá.

En la práctica **no reemplaza a Daymet en la app**, y la razón es el archivo, no
la calidad: el servicio en vivo guarda muy poco pasado.

| Capa | Resolución | Ventana disponible en GeoMet (31/08/2026) |
|---|---|---|
| `HRDPA_2.5km_Precip-Accum24h-T12Z` | 2,5 km | `2026-07-30` → `2026-08-30` — **31 días** |
| `RDPA_10km_Precip-Accum24h-T12Z` | 10 km | `2023-06-21` → `2026-08-30` — ~3 años |

Con 31 días no se arma ninguna climatología, y con 3 años tampoco: la
variabilidad interanual de la lluvia en Canadá es demasiado grande para promediar
tres años y llamarlo normal. El archivo largo de CaPA existe, pero como GRIB2
para bajar en bloque, y eso queda afuera por la regla del README (nos interesan
las fuentes consultables por punto, en vivo).

**Para qué sí sirve:** saber cuánta lluvia cayó en el predio en los últimos días
o semanas. Es otra funcionalidad —"lluvia reciente", no "clima del lugar"— y si
alguna vez se hace, ésta es la fuente para Canadá.

## Cobertura

Canadá entero y el norte de Estados Unidos (el dominio del modelo se pasa de la
frontera). Bounding box aproximado del dominio HRDPA:
`[-152.0, 38.0, -40.0, 70.0]`.

## Licencia

Open Government Licence – Canada 2.0. **Permite uso comercial**, con atribución.

- Términos: https://open.canada.ca/en/open-government-licence-canada
- Atribución: **"Contiene información obtenida de Environment and Climate Change
  Canada, bajo la Open Government Licence – Canada"**.

## Acceso técnico

- **Endpoint:** `GET https://geo.weather.gc.ca/geomet` — WMS 1.3.0
  (`GetCapabilities`, `GetMap`, `GetFeatureInfo`). También hay WCS.
- **Sin clave ni registro.**
- **Formato:** el punto sale por `GetFeatureInfo` con
  `info_format=application/json`.

**Ejemplo real que funciona** (acumulado de 24 h sobre Calgary):

```
https://geo.weather.gc.ca/geomet?service=WMS&version=1.3.0&request=GetFeatureInfo&layers=HRDPA_2.5km_Precip-Accum24h-T12Z&query_layers=HRDPA_2.5km_Precip-Accum24h-T12Z&crs=EPSG:4326&bbox=51.00,-114.12,51.10,-114.02&width=100&height=100&i=50&j=50&info_format=application/json&time=2026-08-30T12:00:00Z
```

**Respuesta real:**

```json
{
  "type": "FeatureCollection",
  "layer": "HRDPA_2.5km_Precip-Accum24h-T12Z",
  "features": [
    {
      "type": "Feature",
      "id": "HRDPA_2.5km_Precip-Accum24h-T12Z(-114.07707,51.057286)",
      "geometry": { "type": "Point", "coordinates": [-114.0771, 51.0573] },
      "properties": {
        "value": 0.053500004,
        "class": "0.0",
        "title_en": "HRDPA T12Z - Precipitation - 24-hour accumulation [mm]",
        "time": "2026-08-30T12:00:00Z",
        "dim_reference_time": "N/A"
      }
    }
  ]
}
```

Dos detalles que cuestan tiempo si no se saben:

- **WMS 1.3.0 con `EPSG:4326` invierte el orden de los ejes**: el `bbox` va
  `lat_min,lon_min,lat_max,lon_max`, no al revés. Con `CRS:84` va lon/lat.
- **El parámetro `time` es obligatorio y tiene que caer dentro de la ventana**
  que declara `GetCapabilities`. Una fecha fuera de rango no da error claro.

- **Límites de request:** no publicados; el `GetCapabilities` completo pesa
  ~40 MB, así que conviene no pedirlo en caliente.
- **Latencia observada:** ~1 s el `GetFeatureInfo`. Medido el 31/08/2026.

## Campos que devuelve

| Campo | Qué es | Unidad |
|---|---|---|
| `properties.value` | acumulado de precipitación del intervalo de la capa | mm |
| `properties.time` | fin del intervalo acumulado | ISO 8601 UTC |
| `geometry.coordinates` | centro de la celda que respondió | grados |

Una capa por intervalo: `Accum6h` y `Accum24h`, esta última en dos cortes
(`T06Z` y `T12Z`). Las capas `-Prelim` son la pasada preliminar, antes de que
entren todos los pluviómetros: para un dato definitivo hay que usar la capa sin
`Prelim`.

## Qué falta o qué no da

- **Todo lo que no sea lluvia**: no hay temperatura, viento, radiación ni
  humedad en estas capas.
- **Archivo largo**: es lo que la descarta para clima. Ver arriba.

## Verificación

Probado el **31/08/2026**: `GetCapabilities` y `GetFeatureInfo` responden, con
dato real en Calgary. Las ventanas temporales de la tabla salen de la
`<Dimension name="time">` de ese mismo `GetCapabilities`.
