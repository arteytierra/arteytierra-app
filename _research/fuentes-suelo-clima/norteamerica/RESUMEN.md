# Norteamérica — resumen del relevamiento

Estado al **31/08/2026**. Ordenado por cuánto mejora sobre la fuente global.

| Fuente | Tipo | Resolución | Cobertura | Licencia comercial | Estado | Prioridad |
|---|---|---|---|---|---|---|
| [SSURGO](eeuu-ssurgo.md) | suelo | polígono relevado a campo | EE.UU. + PR/VI | ✅ dominio público | **implementada** 30/08 | — |
| [Daymet V4 R1](eeuu-canada-mexico-daymet.md) | clima | 1 km | CA + EE.UU. + MX, HI, PR | ✅ libre, con cita | **implementada** 31/08 | — |
| [CaPA / HRDPA](canada-capa-hrdpa.md) | precipitación | 2,5 km | Canadá + norte EE.UU. | ✅ OGL-Canada 2.0 | viva, sin archivo largo | baja |

## Lo que quedó implementado

**Suelo (EE.UU.).** Donde hay SSURGO el perfil deja de ser un modelo y pasa a
ser el relevamiento: agua útil, conductividad y grupo hidrológico medidos en vez
de estimados. Fuera de las áreas relevadas cae a SoilGrids sin que el usuario
haga nada.

**Clima (Norteamérica).** Daymet pisa lluvia, temperatura, radiación y humedad
con celda de 1 km; el viento sigue saliendo de NASA POWER, que es lo único que
Daymet no mide. En Ames, Iowa —terreno llano, el caso menos favorable— la lluvia
anual pasa de 865 a 990 mm.

## Lo que el relevamiento descartó, y por qué

**CaPA-HRDPA no sirve para clima.** Es la mejor precipitación de Canadá (2,5 km,
radar + pluviómetros + modelo) pero el servicio en vivo guarda **31 días** de la
capa fina y ~3 años de la de 10 km. Con eso no se arma una normal climática. El
archivo largo existe como GRIB2 para bajar en bloque, que es justo lo que el
README excluye. Queda anotada para una funcionalidad distinta —"cuánta lluvia
cayó estas semanas"— si alguna vez se hace.

## El hallazgo que no estaba en el plan

Relevando Daymet apareció un error en cómo la app venía leyendo NASA POWER, y
era grande. En el endpoint de **climatología**, `T2M_MAX` y `T2M_MIN` no son la
máxima y la mínima **medias** del mes: son los **récords absolutos** de toda la
serie. Para enero en Iowa, POWER devuelve 12,9 °C y −35,5 °C, cuando la máxima
media real de ese mes es −2 °C.

La app los tomaba como medias. Como Hargreaves usa √(tmax − tmin), la ETP salía
inflada **en todo el mundo**:

| Sitio | ETP anual antes | corregida | factor | Índice de aridez |
|---|---|---|---|---|
| Iowa | 1776 mm | 996 mm | 1,78× | 0,49 → **0,87** |
| Mendoza | 2319 mm | 1495 mm | 1,55× | 0,12 → **0,19** |
| Manaos | 2008 mm | 1243 mm | 1,62× | 0,97 → **1,57** |
| Madrid | 1846 mm | 1218 mm | 1,52× | 0,24 → **0,37** |

El dato correcto está en el mismo endpoint: `T2M_RANGE` **sí** es la amplitud
térmica media diaria, así que `tmax = T2M + rango/2` y `tmin = T2M − rango/2`.
Para enero en Iowa da −1,9 / −11,0 °C, y Daymet —fuente independiente— da
−1,6 / −11,5 °C.

Arrastraba el balance hídrico mensual, el índice de aridez, la clasificación de
Köppen en los casos de borde y los meses marcados con riesgo de helada (Iowa
pasaba de 9 meses a 5, que son los reales).

**Moraleja para las otras regiones:** antes de dar por buena una variable de una
fuente nueva, contrastarla contra la realidad conocida de un sitio. El error no
estaba en el código sino en haber asumido qué significaba el campo.

## Qué sigue

Nada pendiente en Norteamérica. Lo siguiente es Europa: CERRA-Land y los mapas
Köppen de 1 km de Beck.
