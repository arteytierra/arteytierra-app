# Alemania — DWD Open Data vía Bright Sky (Deutscher Wetterdienst)

**Tipo:** clima
**Estado:** VIVA
**Prioridad sugerida:** media — no reemplaza la climatología, pero abre algo que
la app hoy no tiene

## Qué mejora sobre la fuente global

No compite con NASA POWER en lo mismo. POWER y Daymet dan **grillas**: un valor
modelado para la celda donde cae el predio. El DWD da **estaciones**: lo que un
termómetro y un pluviómetro midieron de verdad, hora por hora, en un punto
concreto del terreno alemán.

Para el promedio de treinta años la grilla gana —cubre todo, sin huecos—. Pero
hay preguntas que sólo contesta una estación:

- **¿Cuál es la estación más cercana y a qué distancia está?** La respuesta trae
  el nombre, la altura y los metros que la separan del predio. Poder decir "la
  estación de München-Stadt está a 3,8 km y a 515 m de altura" es honestidad
  sobre el dato que ninguna grilla permite.
- **Radiación solar medida.** El campo `solar` viene del piranómetro, no de un
  modelo. Para dimensionar paneles o secaderos es otra categoría de dato.
- **Ráfaga máxima con dirección.** POWER da viento medio; acá está la ráfaga, que
  es lo que decide una cortina rompevientos o el anclaje de un techo.

Y hay una cosa que ni POWER ni Daymet dan: **los datos llegan hasta ayer**. El
registro más reciente de la estación de Múnich al momento de probar era del
30/08/2026. Daymet publica con más de un año de retraso.

## Cobertura

Alemania entera, con red densa: más de mil estaciones. Bounding box:
`[5.8, 47.2, 15.1, 55.1]`.

Bright Sky resuelve solo la estación más cercana y, si a esa le falta una
variable, la completa con otra —lo declara en `fallback_source_ids`, así que
queda registrado de dónde salió cada número—. El histórico por estación arranca
en fechas distintas; la de Múnich, en 2010.

## Licencia

**CC BY 4.0** — permite uso comercial, obliga a atribuir. El aviso legal del DWD
lo dice sin rodeos:

> *All open spatial data and spatial data services of the DWD as well as all DWD
> services that are defined as high-value datasets (HVD) may be re-used under the
> Creative Commons licence conditions CC BY 4.0 providing the source is
> acknowledged.*

- Términos: https://www.dwd.de/EN/service/legal_notice/legal_notice_node.html
- Atribución: **"Datos del Deutscher Wetterdienst (DWD), CC BY 4.0"**

Bright Sky —la capa que sirve el dato como JSON— es software libre (MIT), y su
instancia pública es gratuita y sin clave. Que además se pueda **auto-hostear**
es lo que la vuelve segura: si la instancia pública se cae o pone límites, el
adaptador sigue funcionando contra una propia. Es exactamente lo contrario del
caso Open-Meteo (ver `global/open-meteo-licencia.md`), donde el servicio es la
dependencia y no hay salida sin pagar.

## Acceso técnico

- **Endpoint:** `GET https://api.brightsky.dev/weather`
- **Sin clave ni registro.**
- **Formato:** JSON.

**Ejemplo real que funciona** (Múnich, un día de julio):

```
https://api.brightsky.dev/weather?lat=48.14&lon=11.58&date=2020-07-01&last_date=2020-07-02
```

**Respuesta real** (recortada — devuelve 25 registros horarios; éste es el de
mediodía, más la fuente que los sirvió):

```json
{
  "weather": [
    {
      "timestamp": "2020-07-01T12:00:00+00:00",
      "source_id": 46586,
      "precipitation": 0,
      "pressure_msl": 1008.4,
      "sunshine": 45,
      "temperature": 27.3,
      "wind_direction": 260,
      "wind_speed": 10.4,
      "cloud_cover": 87,
      "dew_point": 13.2,
      "relative_humidity": 42,
      "visibility": 59570,
      "wind_gust_direction": 290,
      "wind_gust_speed": 22.7,
      "condition": "dry",
      "solar": 0.928,
      "fallback_source_ids": { "solar": 46598 },
      "icon": "cloudy"
    }
  ],
  "sources": [
    {
      "id": 46586,
      "dwd_station_id": "03379",
      "observation_type": "historical",
      "lat": 48.1632,
      "lon": 11.5429,
      "height": 515.37,
      "station_name": "München-Stadt",
      "wmo_station_id": "10865",
      "first_record": "2010-01-01T00:00:00+00:00",
      "last_record": "2026-08-30T23:00:00+00:00",
      "distance": 3777
    }
  ]
}
```

- **Límites de request:** no publicados; la instancia pública pide "uso razonable".
  Para un uso intensivo, auto-hostear.
- **Latencia observada:** ~1 s por día pedido. Medido el 31/08/2026.

**Ojo con el volumen.** La respuesta es **horaria**. Treinta años son ~263.000
registros: no se pide de una. Para una climatología habría que ir año por año y
agregar del lado del servidor, como hace la ruta de Daymet, y cachear fuerte.
Por eso esto es "estación más cercana" y no "reemplazo de la climatología".

## Campos que devuelve

| Campo | Qué es | Unidad | Equivale en la app a |
|---|---|---|---|
| `temperature` | temperatura del aire | °C | `tmean_c` (agregando) |
| `precipitation` | precipitación de la hora | mm | `precip_mm` (sumando) |
| `relative_humidity` | humedad relativa | % | `rh_pct` |
| `dew_point` | punto de rocío | °C | `rocio_c` |
| `wind_speed` | viento medio | **km/h** | `viento_ms` — convertir |
| `wind_gust_speed` | ráfaga máxima | **km/h** | `viento_max_ms` — convertir |
| `wind_direction` / `wind_gust_direction` | dirección | grados | `viento_dir` |
| `solar` | radiación global de la hora | **kWh/m²** | `rad_kwh` (sumando el día) |
| `sunshine` | minutos de sol de la hora | min | no tiene equivalente hoy |
| `cloud_cover` | nubosidad | % | no tiene equivalente hoy |
| `sources[].distance` | distancia del predio a la estación | **m** | para declarar la fuente |

**Ojo con las unidades.** Dos conversiones obligatorias y una trampa:

1. **El viento viene en km/h, no en m/s** — dividir por 3,6. La app trabaja en
   m/s en todos lados. Un viento de 10,4 son 2,9 m/s, no 10,4.
2. **`solar` es el acumulado de esa hora en kWh/m², no una potencia.** Para el
   total diario se **suman** las 24 horas; no se promedia ni se multiplica por
   nada. Es lo contrario del `srad` de Daymet, que sí es una potencia media y hay
   que multiplicarlo por la duración del día.
3. **`sunshine` está en minutos**, aunque el registro sea horario: el techo es 60,
   no 1.

## Qué falta o qué no da

- **Climatología ya agregada.** No hay endpoint de normales: hay que construirlas
  sumando horas. Ver arriba.
- **Cobertura fuera de las estaciones.** Un predio a 40 km de la estación más
  cercana recibe el dato de esa estación, con otra altura y otra exposición. Por
  eso `distance` y `height` hay que **mostrarlos**, no esconderlos: es la
  diferencia entre un dato y un dato con su margen.
- **Suelo, relieve, nada de eso.** Es sólo clima.

## Verificación

Probado el **31/08/2026**: la API responde 200 en ~1 s con la serie horaria
completa de Múnich transcrita arriba, y `last_record` de la estación llegaba
hasta el 30/08/2026 — está viva y al día. El aviso legal del DWD con la licencia
CC BY 4.0 se leyó de la página oficial el mismo día.
