# Mapa Köppen-Geiger de 1 km

Tres GeoTIFF teselados (256×256) con compresión LZW, 8 bits por píxel, globales,
EPSG:4326, celda de 0,00833333° (30 arcsec). Los tres son el mismo mapa en tres
momentos, así que se comparan píxel a píxel:

| Archivo | Período | Peso |
|---|---|---|
| `koppen_geiger_1961_1990_1km.tif` | 1961–1990 | 12,5 MB |
| `koppen_geiger_1991_2020_1km.tif` | **1991–2020** (el presente, el que manda) | 12,5 MB |
| `koppen_geiger_2071_2099_ssp245_1km.tif` | 2071–2099, escenario SSP2-4.5 | 12,0 MB |

El presente es el que da la clase del predio y alimenta análogos y biomas. Los
otros dos existen para una sola pregunta —¿el clima de acá ya cambió de clase, y
a cuál va?—, que es la que importa cuando se planta algo que tarda treinta años.

Del futuro se hostea **sólo SSP2-4.5**, el escenario intermedio del CMIP6, que es
el que se usa como referencia de planificación. Beck publica siete; traerlos
todos serían 84 MB para un abanico que nadie va a leer. Si alguna vez hace falta
el peor caso, SSP5-8.5 está en el mismo zip y entra sin tocar código: alcanza con
agregarlo a `PERIODOS` en `lib/koppenBeck.ts`.

Se lee desde `apps/terreno/lib/koppenBeck.ts`. **No es un raster plano:** está
comprimido y teselado, así que no se puede hacer un `seek` a un byte; se lee con
`geotiff`, que descomprime sólo la tesela que contiene el punto.

Los archivos viajan al bundle serverless por `outputFileTracingIncludes` en
`next.config.ts` (el glob es `./datos/koppen/*.tif`, así que toma los tres). Si
se mueven de carpeta hay que mover también esa entrada: sin ella la ruta funciona
en local y en producción devuelve siempre "sin dato".

## Licencia

**CC BY 4.0** — uso comercial permitido, con atribución obligatoria. La
atribución sale en la app debajo de la clase climática.

> Beck, H. E., T. R. McVicar, N. Vergopolan, A. Berg, N. J. Lutsko, A. Dufour,
> Z. Zeng, X. Jiang, A. I. J. M. van Dijk, and D. G. Miralles. *High-resolution
> (1 km) Köppen-Geiger maps for 1901–2099 based on constrained CMIP6
> projections*, Scientific Data 10, 724 (2023).

- Registro: https://doi.org/10.6084/m9.figshare.21789074.v2
- Licencia: https://creativecommons.org/licenses/by/4.0/

## Valores

`0` es "sin clase" (océano o sin dato). Del `1` al `30`, las clases en el orden
del `legend.txt` original, que es el que reproduce la constante `CLASES` del
lector. La ficha del relevamiento está en
`_research/fuentes-suelo-clima/global/koppen-beck-1km.md`.

## Los períodos que NO se hostean

El zip de origen trae además 1901–1930, 1931–1960, 2041–2070 y los otros seis
escenarios SSP de 2071–2099, todos a 1 km y de ~12 MB cada uno. No se bajaron
porque no responden ninguna pregunta que la app haga: tres puntos (de dónde
viene, dónde está, a dónde va) ya cuentan la trayectoria, y cada archivo extra
son 12 MB de repo para afinar un decimal de un escenario.

Descarga: `GET https://ndownloader.figshare.com/files/61012822` → zip de 130,6 MB
con los 73 archivos.
