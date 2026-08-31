# Estados Unidos / Canadá / México — Daymet V4 R1 (ORNL DAAC, NASA)

**Tipo:** clima
**Estado:** VIVA
**Prioridad sugerida:** alta — **IMPLEMENTADA** el 31/08/2026

## Qué mejora sobre la fuente global

Compite con NASA POWER (climatología mensual, grilla de ~50 km). Daymet trae
**1 km**, y la diferencia se nota justo donde importa: en terreno quebrado, la
celda de 50 km promedia la ladera con el fondo del valle y borra el gradiente
que decide qué se puede plantar y dónde. En Ames (Iowa), terreno llano y por lo
tanto el caso menos favorable para Daymet, ya hay 14% de diferencia en la lluvia
anual: **990 mm contra 865 mm de POWER**.

Variables que agrega o mejora: precipitación, temperatura máxima y mínima,
radiación solar y presión de vapor (de ahí humedad relativa y punto de rocío).

**No trae viento.** Por eso en la app Daymet no reemplaza a POWER sino que lo
pisa parcialmente: POWER arma la base y aporta viento medio, racha y dirección
—que mandan en cortinas, secado y confort—, y Daymet pisa el resto.

## Cobertura

Norteamérica continental (Canadá, Estados Unidos y México), más Hawái y Puerto
Rico. Verificado con dato real en Iowa, Calgary, Oaxaca, Hawái, Alaska, Yucatán
y Puerto Rico.

Bounding box para el router: `[-179.0, 13.0, -52.0, 84.0]`. Es grueso a
propósito: incluye mucho océano, y ahí el servicio responde 400, que el llamador
trata como "no hay dato" y cae a POWER.

Serie: **1980 hasta hoy**, con más de un año de retraso de publicación (en
agosto de 2026 el último año completo es 2024). Año de 365 días siempre: Daymet
descarta el 31 de diciembre en los bisiestos.

## Licencia

Datos del ORNL DAAC (NASA Earth Science Data). Acceso libre y sin restricción de
uso, incluido el comercial; sólo piden citar.

- Términos: https://daac.ornl.gov/citation.shtml
- Atribución tal como hay que mostrarla: **"Daymet V4 R1 — Thornton et al.,
  ORNL DAAC"**. En la app viaja en el campo `fuente` del clima, que el panel ya
  imprime.

## Acceso técnico

- **Endpoint:** `GET https://daymet.ornl.gov/single-pixel/api/data`
- **Formato:** CSV con cabecera de metadatos (también acepta `&format=json`).
- **Sin clave ni registro.**

**Ejemplo real que funciona** (30 años en un punto de Iowa):

```
https://daymet.ornl.gov/single-pixel/api/data?lat=41.90&lon=-93.60&vars=prcp,tmax,tmin,srad,vp,dayl&start=1995-01-01&end=2024-12-31
```

**Respuesta real** (recortada):

```
Latitude: 41.9  Longitude: -93.6
X & Y on Lambert Conformal Conic: 506022.01 -44135.47
Tile: 11744
Elevation: 310 meters
All years; all variables; Daymet Software Version 4.0
How to cite: Thornton; M.M.; R. Shrestha; Y. Wei; P.E. Thornton; S-C. Kao; and B.E. Wilson. 2022. Daymet: Daily Surface Weather Data on a 1-km Grid for North America; Version 4 R1. ORNL DAAC; Oak Ridge; Tennessee; USA. https://doi.org/10.3334/ORNLDAAC/2129
year,yday,dayl (s),prcp (mm/day),srad (W/m^2),tmax (deg c),tmin (deg c),vp (Pa)
2023,1,32445.20,0.00,183.29,4.63,-3.47,472.61
2023,2,32489.76,24.66,99.73,3.28,-2.00,527.22
2023,3,32537.96,7.13,94.13,4.10,-0.85,574.05
```

Fuera de cobertura devuelve **HTTP 400** con un cuerpo explícito:

```json
{"message":"Daymet Tile was not found with input lat and lon: /api/data?lat=-32.9&lon=-68.8&..."}
```

- **Límites de request:** no publican cuota. Una consulta de 30 años y 6
  variables son ~11.000 filas y ~600 kB.
- **Latencia observada:** 3,2 s para 30 años; 1 s para un año. Medido el
  31/08/2026.

**Devuelve series diarias, no climatología.** Hay que pedir N años y promediar
mes a mes del lado nuestro. En la app se piden 30 y se cachea 90 días, porque la
ventana sólo se corre una vez por año.

## Campos que devuelve

| Campo Daymet | Qué es | Unidad | Equivale en la app a |
|---|---|---|---|
| `prcp` | precipitación diaria | mm/día | `precip_mm` (sumar el mes, dividir por años) |
| `tmax` | máxima diaria | °C | `tmax_c` |
| `tmin` | mínima diaria | °C | `tmin_c` |
| `srad` | radiación de onda corta | W/m² | `rad_kwh` — **ver abajo** |
| `vp` | presión de vapor | Pa | `rh_pct` y `rocio_c` |
| `dayl` | duración del día | s | sólo para convertir `srad` |
| `swe` | agua equivalente en nieve | kg/m² | no se usa |

**Ojo con las unidades.** Dos trampas reales acá:

1. **`srad` está promediado sobre las horas de luz, no sobre las 24 h.** Para el
   total diario hay que multiplicarlo por `dayl`:
   `MJ/m²/día = srad × dayl / 1e6`, y después `kWh/m²/día = MJ / 3,6`. Tomarlo
   como promedio diario infla la radiación casi al doble en invierno.
2. **`vp` es presión de vapor en Pa**, no humedad relativa. Se convierte con
   Tetens: `RH = 100 × vp / es(tmean)` con
   `es(t) = 610,94 · exp(17,625·t / (t+243,04))`, y el punto de rocío es esa
   misma fórmula invertida.

## Qué falta o qué no da

- **Viento** (medio, racha, dirección): no lo mide. Queda POWER.
- **Climatología ya agregada**: hay que promediarla nosotros.
- **ETP**: no la trae. Se sigue calculando con Hargreaves a partir de las
  temperaturas de Daymet, que son mejores que las de POWER.

## Verificación

Probado el **31/08/2026**: responde. Se corroboraron los valores agregados
contra la realidad de Ames, Iowa — enero máxima media −1,6 °C y mínima −11,5 °C,
julio 29,2 / 17,6 °C, humedad relativa 62–77% — y contra POWER corregido, que
para el mismo enero da máxima −1,9 °C. Dos fuentes independientes a 0,3 °C.
