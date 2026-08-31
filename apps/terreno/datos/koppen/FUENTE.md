# Mapa Köppen-Geiger de 1 km

`koppen_geiger_1991_2020_1km.tif` — 12,5 MB, GeoTIFF teselado (256×256) con
compresión LZW, 8 bits por píxel, global, EPSG:4326, celda de 0,00833333°
(30 arcsec). Es el período **1991–2020** del conjunto publicado por Beck et al.

Se lee desde `apps/terreno/lib/koppenBeck.ts`. **No es un raster plano:** está
comprimido y teselado, así que no se puede hacer un `seek` a un byte; se lee con
`geotiff`, que descomprime sólo la tesela que contiene el punto.

El archivo viaja al bundle serverless por `outputFileTracingIncludes` en
`next.config.ts`. Si se mueve de carpeta hay que mover también esa entrada: sin
ella la ruta funciona en local y en producción devuelve siempre "sin dato".

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

## Otros períodos

El zip de origen trae además 1901–1930, 1931–1960, 1961–1990 y proyecciones SSP
a 2041–2070 y 2071–2099, todos a 1 km y de ~12 MB cada uno. Con 1961–1990 y un
escenario de 2071–2099 se podría mostrar si el clima del predio ya cambió de
clase y hacia cuál va. Todavía no se bajaron: son ~37 MB más en el repo y esa es
una decisión aparte.
