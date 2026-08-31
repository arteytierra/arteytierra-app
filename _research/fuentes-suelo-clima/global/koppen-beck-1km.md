# Global — Mapas Köppen-Geiger de 1 km (Beck et al., 2023)

**Tipo:** clima
**Estado:** VIVA
**Prioridad sugerida:** alta — era el mejor hallazgo del relevamiento europeo, y
no es europeo: sirve para todo el planeta. **IMPLEMENTADA** el 31/08/2026 con el
período 1991–2020.

## Qué mejora sobre la fuente global

Hoy `acequia` **calcula** el Köppen del predio a partir de las medias mensuales
de NASA POWER (celda de ~50 km) aplicando las reglas de la clasificación. Eso
funciona, pero hereda dos problemas: la celda es gruesa —un valle y la ladera de
enfrente caen en el mismo píxel— y las reglas tienen umbrales duros, así que un
predio que está a medio grado de un límite salta de clase con cualquier error de
la fuente. Es justo donde más importa: los límites de Köppen son bordes
ecológicos reales.

Beck et al. publicaron el mapa **ya clasificado, a 1 km**, construido a partir de
un ensamble de varias fuentes de temperatura y precipitación con corrección de
sesgo. Pasar de calcularlo a leerlo cambia tres cosas:

| | Köppen calculado hoy | Beck 1 km |
|---|---|---|
| Resolución | ~50 km (POWER) | **1 km** |
| Origen | una sola fuente, reglas aplicadas por nosotros | ensamble de fuentes, corregido |
| Períodos | uno solo (1981–2023) | 1901–1930, 1931–1960, 1961–1990, **1991–2020**, y proyecciones a 2041–2070 y 2071–2099 |
| Errores de borde | saltan con cualquier ruido de POWER | ya resueltos en el dato |

Lo de los períodos abre algo que hoy la app no puede decir: **si el clima del
predio ya cambió de clase, y a cuál va**. Comparar 1961–1990 contra 1991–2020 en
el mismo punto es leer dos píxeles. Y las proyecciones SSP permiten mostrar a qué
clase se dirige el lugar, que para plantar un monte —que tarda treinta años— es
la pregunta correcta.

Importa además porque el Köppen alimenta a los análogos y a las ecorregiones
(`lib/analogos.ts`, `lib/ecorregiones.ts`): mejorarlo mejora todo lo que cuelga
de él.

## Cobertura

**Mundial**, sin huecos, incluidos océanos (con valor "sin clase"). No hace falta
bounding box: es la fuente para cualquier punto del planeta.

## Licencia

**CC BY 4.0** — permite uso comercial, obliga a atribuir.

- Términos: https://creativecommons.org/licenses/by/4.0/
- Registro: https://doi.org/10.6084/m9.figshare.21789074.v2
- Atribución: **"Köppen-Geiger 1 km — Beck et al. (2023), CC BY 4.0"**

## Acceso técnico

**Acá está la excepción a la regla del README.** No hay servicio en vivo que
devuelva el píxel por punto: el dato se publica como archivo. Pero el archivo que
necesitamos es un GeoTIFF de **12,5 MB para el mundo entero**, no un raster
nacional de 40 GB. La regla existe para no terminar hosteando terabytes; 12,5 MB
entra en el repo o en un bucket sin discutir. **Es una decisión de Jonatan, no
mía**, porque cambia el criterio escrito.

- **Origen:** figshare, artículo `21789074`.
- **Metadatos (JSON, sin clave):**
  `GET https://api.figshare.com/v2/articles/21789074`
- **Descarga:** `GET https://ndownloader.figshare.com/files/61012822`
  → `koppen_geiger_tif.zip`, 130,6 MB, 73 entradas.

El zip trae todos los períodos y resoluciones. Contenido real de la tabla central
del zip, leído por *range request* sin bajar el archivo entero:

```
1901_1930/koppen_geiger_0p00833333.tif        7,5 MB comprimido / 12,5 MB
1931_1960/koppen_geiger_0p00833333.tif        7,6 MB comprimido / 12,6 MB
1961_1990/koppen_geiger_0p00833333.tif        7,4 MB comprimido / 12,5 MB
1991_2020/koppen_geiger_0p00833333.tif        7,4 MB comprimido / 12,5 MB   ← el presente
2041_2070/ssp126/koppen_geiger_0p00833333.tif 6,9 MB comprimido / 12,0 MB
2041_2070/ssp245/koppen_geiger_0p00833333.tif 6,9 MB comprimido / 12,0 MB
2041_2070/ssp370/koppen_geiger_0p00833333.tif 6,9 MB comprimido / 12,0 MB
2041_2070/ssp585/koppen_geiger_0p00833333.tif 6,9 MB comprimido / 12,0 MB
2071_2099/ssp126/koppen_geiger_0p00833333.tif 6,9 MB comprimido / 12,0 MB
2071_2099/ssp585/koppen_geiger_0p00833333.tif 6,9 MB comprimido / 12,0 MB
legend.txt
```

(Hay también `0p1`, `0p5` y `1p0` para quien quiera menos resolución, y una
versión NetCDF de 755 MB que no nos sirve.)

**Lo mínimo que hay que hostear son 12,5 MB**: `1991_2020` a 1 km. Con tres más
—`1961_1990` y dos escenarios de `2071_2099`— son 50 MB y se puede mostrar el
desplazamiento climático del predio.

- **Formato:** GeoTIFF, un byte por píxel, valor entero = clase.
- **Grilla:** 0,00833333° (30 arcsec, ~1 km en el ecuador), global, EPSG:4326.
- **No pide clave ni registro.** La API de figshare responde sin token.
- **Latencia observada:** 1,4 s los metadatos. La descarga del zip, ~3 min.
  Medido el 31/08/2026.

**Corrección a lo que decía esta ficha antes de implementarla.** Decía que leer
un píxel era aritmética pura —calcular fila y columna y hacer un `seek` al
byte—. Es falso: al abrir el archivo resultó ser un GeoTIFF **teselado en
bloques de 256×256 y comprimido con LZW** (14.365 teselas, `photometric = 3`,
paleta de 8 bits). No hay byte al que saltar; el píxel vive adentro de un bloque
comprimido.

La aritmética de fila y columna sí vale:

```
col  = (lng + 180) / 0.00833333
fila = (90 - lat)  / 0.00833333
```

pero después hay que descomprimir la tesela. En la práctica salió más barato de
lo que suena: `geotiff` —que ya era dependencia de la app para importar MDE de
usuario— resuelve la ventana de 1×1 leyendo y descomprimiendo **sólo la tesela
que contiene el punto**, unos pocos kB. Los 933 millones de píxeles del mapa
nunca entran en memoria. Medido: ~40 ms la primera lectura (abre el archivo y
lee el directorio de teselas), ~3 ms las siguientes.

## Campos que devuelve

Un solo campo: la clase. `legend.txt` mapea el entero al símbolo y al color.

| Valor | Qué es | Equivale en la app a |
|---|---|---|
| 1–30 | clase Köppen-Geiger (Af, Am, Aw, BWh, … , EF) | `koppen` en `DatosClima` |
| 0 | sin clase (océano / sin dato) | caer al Köppen calculado |

**Ojo con las unidades.** No hay conversión de unidad, pero sí de vocabulario: el
código de la app usa los símbolos (`'Cfa'`), no los enteros. Hay que traducir con
`legend.txt` y **verificar que los 30 símbolos de Beck coincidan uno a uno con
los que ya maneja `lib/clima.ts`** antes de enchufarlo; si Beck distingue una
clase que la app agrupa, hay que decidir de qué lado se resuelve.

## Qué falta o qué no da

- **Sólo la clase, ningún número.** No trae precipitación, temperatura ni nada
  que se pueda usar para la ETP o el balance hídrico. NASA POWER y Daymet siguen
  siendo la fuente de los números; esto reemplaza únicamente la etiqueta.
- **No dice por qué.** El Köppen calculado hoy puede explicar qué mes seco o qué
  isoterma decidió la clase; el mapa sólo da el resultado. Si se muestran los dos
  y difieren, conviene decir cuál manda y no esconder la diferencia.

## Verificación

Probado el **31/08/2026**: la API de figshare responde, la licencia declarada en
el registro es CC BY 4.0, y la tabla central del zip se leyó por *range request*
(el servidor devolvió el rango pedido). Los tamaños de la tabla de arriba son los
reales del archivo publicado, no estimaciones.

**Implementación, el mismo día.** El archivo de `1991_2020` quedó en
`apps/terreno/datos/koppen/`, el lector en `apps/terreno/lib/koppenBeck.ts` y la
ruta en `app/api/clima/koppen/route.ts`. Se contrastó contra siete lugares
conocidos de los dos hemisferios (`tests/unit/clima/koppenBeck.test.ts`), que es
la moraleja que dejó Norteamérica: una fórmula de fila/columna con un signo
cambiado devuelve clases plausibles pero del hemisferio equivocado, y sólo se
nota comparando contra lugares que uno conoce.

Un resultado que vale anotar: **Madrid da `BSk`, no el `Csa` de manual.** No es
un error del mapa. Con ~420 mm anuales y ~15 °C de media, el umbral de aridez
(`2T + 14 = 44`, por 10 = 440 mm) queda por encima de la lluvia, así que cae en
B. Es exactamente el caso de borde que este mapa resuelve mejor que aplicar las
reglas sobre una celda de 50 km.

Las 30 clases de Beck son un subconjunto de las que ya producía
`clasificarKoppen`: la única que el clasificador puede dar y Beck no es `As`,
que Beck agrupa dentro de `Aw`. No hubo que decidir nada de vocabulario.
