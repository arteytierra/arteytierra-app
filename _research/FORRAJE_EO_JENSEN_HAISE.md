# La `Eo` del modelo de forraje — cómo se leyó Jensen-Haise y qué cambió

Acta de la medición que respalda `apps/terreno/lib/eoJensenHaise.ts` y la
remedición de las constantes de `apps/terreno/lib/forrajeAnios.ts`. Esto **no es
código y no se monta**: está para que cualquiera pueda repetir las mediciones.

Fecha: 08/11/2026.

> **Las mediciones de las secciones 5 y 6 se rehicieron el 09/11/2026**, al
> montar el factor de actividad radicular por temperatura de suelo: ver
> `FORRAJE_ACTIVIDAD_RADICULAR.md`. El sesgo contra los doce indices publicados
> baja de +0,156 a +0,132, las temporadas en el techo de 10 a 4, la mediana de
> la serie de 0,999 a 0,935 y el p10 de 0,741 a 0,672. Los numeros de abajo que
> no digan lo contrario son los de la corrida sin ese factor.

## La deuda que se venía a pagar

El balance de Wight y Hanks (1981) pide `Eo` y acequia le daba la **ETo de
referencia de FAO-56** de la serie diaria. El lote anterior midió que el cociente
entre las dos era de 1,14 a 1,20 en el sitio de validación, y dejó escrito que
ese número **mezclaba dos causas que no se podían separar**: la diferencia de
superficie de referencia y el sesgo propio de ERA5 en ese píxel. Separarlas
necesitaba leer el trabajo de 1963.

## Las fuentes, y qué ecuación es cada una

**Jensen, M. E. y Haise, H. R. (1963).** «Estimating evapotranspiration from
solar radiation». *J. Irrigation and Drainage Division, ASCE* 89(IR4):15-41. La
forma original, en °F y langleys por día:

```
ETr = CT · (T − Tx) · Rs        CT = 0,014    Tx = 26,4 °F
```

**La variante modificada** —Jensen (1966) y Jensen et al. (1970)— hace `CT` y
`Tx` función de la altitud y de la aridez:

```
CT = 1 / (C1 + C2 · CH)      C1 = 68 − 3,6 · (elev_pies/1000)    C2 = 13
CH = 50 / (e2 − e1)          e en milibares
Tx = 27,5 − 0,25 · (e2 − e1) − (elev_pies/1000)
e  = 6,105 · exp( 25,22 · (Tk − 273)/Tk − 5,31 · ln(Tk/273) )
λ  = 595 − 0,51 · T(°C)      cal/g
```

con `e2` y `e1` a la media de máximas y la media de mínimas **del mes más
cálido**. `e2 − e1` es un índice de aridez: más oscilación diaria, `CH` más
chico, `CT` más grande, más evaporación por unidad de radiación. Es la corrección
por advección.

Las tres fuentes que se abrieron, y coinciden:

| fuente | qué aportó |
|---|---|
| **USBR, AgriMet** — «Computation of the 1982 Kimberly-Penman and the Jensen-Haise Evapotranspiration Equations», Dockter 1994, rev. Palmer 2008 | la formulación completa con el FORTRAN de `ETPCOMP` y `JENSEN` en los apéndices, el calor latente función de la temperatura, y **`CLIMAT.DAT`**: altitud, `CsubT` y `TsubX` de 70 estaciones |
| **WWRC 87-06**, University of Wyoming, cap. 4 | los mismos coeficientes en las mismas unidades, la forma original de 1963, y que la original **subestima** el uso de agua de alfalfa mientras la modificada lo clava |
| **ILRI**, *Drainage Principles and Applications*, publicación 16, ec. 5.7 | la forma en °C: `ETp = (0,025·Ta + 0,08)·Rs/28,6`, que coincide con la original de 1963 dentro del **1,6 % entre 10 y 30 °C** |

Las tres dicen que la superficie de referencia es **alfalfa** bien provista de
agua, con 30 a 50 cm de crecimiento. Wight y Hanks le dicen «evaporación de una
superficie de agua libre», que es la lectura de la época; lo que importa no es el
nombre sino que su `Kc = 0,85` y su `b = 0,435` se ajustaron contra **esta**
magnitud.

## 1. El caso resuelto que no necesita ninguna serie

`CLIMAT.DAT` publica `ELEV`, `CsubT` y `TsubX` de 70 estaciones, 51 con
Jensen-Haise configurado. **`CT` y `Tx` están atados por `e2 − e1`**, así que de
la altitud y de `Tx` sale `CT` sin ningún grado de libertad:

```
e2 − e1 = 4 · (27,5 − Tx − elev_kft)
CT      = 1 / (68 − 3,6·elev_kft + 13·50/(e2 − e1))
```

**49 de las 51 cierran** dentro de la banda que deja el redondeo de `Tx` a una
décima. Las dos que no:

- **`RXGI`** publica `Tx = 6,3`, y con **16,3** —su gemela `AHTI`, a 129 m de
  diferencia de altitud, publica 16,2— da exactamente el `CT` de la tabla. Es un
  dígito perdido en la fuente. Que el cálculo detecte un error de tipeo es la
  mejor evidencia de que es el mismo cálculo.
- **`DRLM`** queda a 0,2 °F de cerrar.

De ahí salen los dos rangos de validez que el módulo declara: altitud **24 a
1.893 m** y aridez **6,9 a 32,4 mb** de `e2 − e1`, con mediana 26,5.

## 2. El sitio, la serie y los coeficientes

Mismo sitio que todo lo demás: **Sidney, Montana**, `47,72 N · −104,16 O`.

```
https://archive-api.open-meteo.com/v1/archive
  ?latitude=47.72&longitude=-104.16
  &start_date=1960-01-01&end_date=2024-12-31
  &daily=shortwave_radiation_sum,temperature_2m_max,temperature_2m_min,
         temperature_2m_mean,et0_fao_evapotranspiration,precipitation_sum
  &timezone=auto
```

23.742 días, **cero nulos** en las seis variables. Altitud del píxel 589 m.

Normales del mes más cálido de la propia serie, julio 1961-1990: **Tmax 28,69 °C,
Tmin 16,33**, `e2 − e1` = **20,91 mb** → `CT` = **0,010855**, `Tx` = **20,34 °F**.

Dos fuentes **que no son ERA5**, para medir su sesgo:

- **GHCN-Daily `USC00247560 SIDNEY`**, 47,728 / −104,147, 589,2 m: a 4 km del
  píxel y a la misma altura. 31.398 días con máxima y mínima desde 1910.
- **NASA POWER** diario, `ALLSKY_SFC_SW_DWN`, 1984-2024: satelital, no sale del
  mismo reanálisis.

## 3. Las dos mitades, separadas

### La temperatura de ERA5 no tiene sesgo, pero achata la amplitud

En las doce ventanas de la prueba —1.066 días— el **punto medio** diario de ERA5
contra la estación difiere **−0,02 °C**. La **amplitud**, en cambio:

| | amplitud diaria | máxima | mínima |
|---|---|---|---|
| estación | 15,17 °C | 22,12 °C | 6,95 °C |
| ERA5 | 11,53 °C | 20,27 °C | 8,75 °C |
| diferencia | **−3,64** | −1,84 | +1,80 |

Es el achatamiento típico de una celda de 31 km, casi simétrico, y entra en el
cálculo por `e2 − e1`.

### La radiación de ERA5 lee 2,2 % alta

41 temporadas de 84 días, 1984-2024: POWER 22,173 MJ/m²·día, ERA5 22,666.
Cociente medio **1,0222**, de 0,955 a 1,088.

### Entonces el sesgo de los datos no explica el 16 %

| reconstrucción de la `Eo` | cociente contra la Tabla 1 |
|---|---|
| **Jensen-Haise modificada, normales de la serie** | **1,015** (mediana 1,023, de 0,948 a 1,097) |
| Jensen-Haise modificada, normales de la estación | 1,133 |
| Jensen-Haise original de 1963 | 1,098 |
| ETo de referencia de FAO-56 de ERA5 | 1,162 (mediana 1,178, de 1,054 a 1,322) |

La `Eo` de la Tabla 1 sale de `(Kc·Eo)/0,85` dividido por los días de temporada,
con la ventana del 15 de abril y el largo que publica cada año.

**Lo incómodo, y queda dicho en el módulo:** el 1,015 es medido, no construido,
pero se apoya en parte en que ERA5 achata la amplitud diaria. Con las normales de
la estación —que es como manda el método— quedaría un 10 % sin explicar, y ese
10 % estaría en la `Eo` de Wight y Hanks: su piranómetro, o los coeficientes de
su propia estación, que el artículo no publica. Acequia usa las normales de la
serie porque es lo único que puede calcular en cualquier predio del mundo.

Y el cociente entre las dos superficies de referencia sobre las 65 temporadas da
**1,166** (1,072 a 1,263), que cae justo en el **1,1 a 1,4** que la literatura
publica para `ETr/ETo` (Allen, ASABE, cap. 8).

## 4. El caso resuelto que decide: la columna `Tp`

`Tp = b · Kc · Eo`, y `b = 0,435` se despejó de `Tp/(Kc·Eo)` con la `Eo` **del
trabajo**. Así que aplicar ese `b` con otra `Eo` rompe la derivación. Con el `b`
publicado y `Kc = 0,85`, contra la columna `Tp` de la Tabla 1:

| `Eo` usada | error medio | mínimo | máximo |
|---|---|---|---|
| **Jensen-Haise de la serie** | **+1,3 %** | −7,5 % | +12,5 % |
| ETo de FAO-56 | +16,5 % | +3,2 % | +35,6 % |

Eso es lo que decide el cambio, y es también por qué el arreglo **no es un factor
de conversión**: el 1,166 es de un sitio y de una ventana, y lo que viaja es el
método.

## 5. Y lo que apareció debajo: el invierno

Acá el lote cambió de forma. La `Eo` de la temporada quedó anclada, pero la
cadena continua corre **todo el año**, y fuera de temporada `b = 0` manda toda la
demanda a evaporación de suelo. Wight y Hanks **nunca corrieron un invierno**:
arrancaban el 15 de abril con el agua del perfil medida con sonda de neutrones.

La `Eo` de los días bajo cero, promediada sobre los 6.992 de la serie:
**Jensen-Haise 0,122 mm/día, ETo de FAO-56 0,719**. Seis veces. Sobre 6.992 días
son cinco metros de demanda que un suelo congelado bajo nieve no tiene.

Tres tratamientos, misma ventana de 84 días y misma lluvia:

| tratamiento | p10 | mediana | p90 | ancho | EAM contra los 12 | sesgo | en el techo |
|---|---|---|---|---|---|---|---|
| Jensen-Haise todo el año | 0,741 | 0,999 | 1,000 | 1,35 | 0,156 | +0,156 | 10 de 12 |
| Jensen-Haise en temporada, ETo afuera | 0,303 | 0,819 | 1,000 | 3,30 | 0,142 | +0,057 | 6 de 12 |
| ETo de FAO-56 todo el año | 0,195 | 0,669 | 0,982 | 5,03 | 0,148 | −0,063 | 2 de 12 |

**El p10 se mueve 3,8 veces y los tres son indistinguibles por el error** contra
los doce índices publicados: 0,142 a 0,156. La cola seca de la distribución no la
decide el dato: la decide esta elección.

Se eligió Jensen-Haise para todo el año porque es **una** regla y no dos pegadas,
porque es el método con el que se ajustaron el `Kc` y el `b` que la cadena usa, y
porque 0,12 mm/día en suelo helado es la física del problema. Partir la regla en
dos tratamientos para acercar la cola sería ajustar contra el resultado.

### Los doce índices publicados, por primera vez comparados

`forrajeBalance.ts` dice que la columna `T` no se puede **reproducir** porque
falta la lluvia diaria de Sidney de 1967 a 1978. Es cierto; para **comparar**
alcanza con la de ERA5, declarando la diferencia, que no es chica: **+24,6 mm** de
media en las doce temporadas, de −76 a +103.

| año | días | publicado | JH | ETo | `Tp` pub. | `Tp` JH | `Tp` ETo | lluvia pub. | lluvia ERA5 | SWS inicial JH |
|---|---|---|---|---|---|---|---|---|---|---|
| 1967 | 91 | 0,894 | 0,999 | 0,573 | 123 | 117,5 | 141,0 | 210 | 189 | 125 |
| 1968 | 99 | 0,564 | 0,764 | 0,260 | 126 | 141,3 | 170,8 | 158 | 180 | 88 |
| 1969 | 98 | 0,908 | 1,000 | 0,778 | 130 | 134,2 | 158,3 | 338 | 262 | 130 |
| 1970 | 86 | 0,925 | 0,996 | 0,924 | 134 | 124,8 | 140,9 | 218 | 206 | 149 |
| 1971 | 91 | 0,577 | 1,000 | 0,833 | 137 | 131,5 | 150,7 | 141 | 244 | 137 |
| 1972 | 90 | 0,985 | 1,000 | 1,000 | 132 | 122,1 | 136,2 | 206 | 234 | 147 |
| 1973 | 92 | 0,840 | 0,990 | 0,750 | 144 | 145,9 | 171,0 | 232 | 196 | 121 |
| 1974 | 91 | 0,904 | 0,998 | 0,487 | 136 | 142,9 | 162,5 | 179 | 209 | 148 |
| 1975 | 91 | 0,984 | 1,000 | 1,000 | 122 | 123,3 | 133,1 | 208 | 272 | 148 |
| 1976 | 88 | 0,901 | 1,000 | 0,977 | 131 | 134,1 | 156,8 | 193 | 255 | 130 |
| 1977 | 68 | 0,402 | 0,957 | 0,536 | 97 | 109,1 | 127,5 | 91 | 133 | 132 |
| 1978 | 81 | 0,945 | 1,000 | 0,958 | 109 | 109,4 | 118,5 | 220 | 309 | 144 |

La cadena lee **alto**: sesgo +0,16 y techo en 10 de 12. Las causas están
declaradas desde el principio en `ADVERTENCIAS` de `forrajeBalance.ts` y las tres
empujan para el mismo lado —sin factor de actividad radicular por temperatura de
suelo, con escurrimiento nulo, sin agua bajo el límite inferior— más la lluvia de
ERA5 contra el pluviómetro. Esto es la primera medición de cuánto suman juntas.

Y las columnas publicadas acotan por otro lado: `P − ET − drenaje` da **−65 a
+35 mm**, o sea que en diez de las doce temporadas el perfil **se descargó**. En
las tres de índice bajo —1968 con 0,56, 1971 con 0,58, 1977 con 0,40— eso obliga
a que hayan arrancado con poca agua, y la cadena las arranca con 88, 137 y
132 mm de los 150: ahí lee claramente húmedo de más.

## 6. Las nueve mediciones de `FORRAJE_INDICE_ANUAL.md`, rehechas

Todas con la `Eo` del modelo, mismo sitio, misma ventana, mismo perfil.

| medición | con la ETo de FAO-56 | con la `Eo` del modelo |
|---|---|---|
| temporadas que la cadena descarta | 2 | 3 (t1 65,5 %, t2 31,9 %, t3 1,2 %, t4 0 %) |
| mediana del índice | 0,669 | **0,999** |
| p10 | 0,195 | **0,741** |
| ancho p90/p10 | 5,03 | **1,35** |
| temporadas bajo el promedio | 30 de 63 (47,6 %) | 18 de 62 (29 %) |
| R² contra la lluvia anual | 0,207 | 0,219 |
| R² contra la lluvia de la temporada | 0,522 | 0,357 |
| agua inicial del perfil, promedio | 51,4 mm | **119,2 mm** |
| tendencia del índice por década | −0,042 (R² 0,065) | **−0,005 (R² 0,002)** |
| índice de 1988, el peor de la serie | 0,051 | 0,157 |
| deshielo diferido: cuánto mueve el p10 | +11 % | **+0,8 %** |

Tres cosas de esa tabla merecen leerse dos veces:

1. **La tendencia desapareció.** Lo que parecía una señal climática en el forraje
   —el índice cayendo 0,042 por década— era en buena parte la deriva de la
   variable que se había puesto en lugar de la `Eo`: la ETo de FAO-56 de un
   reanálisis que se calienta sube, y la `Eo` de Jensen-Haise sube bastante
   menos. Queda en 0,2 % de la varianza, o sea nada.
2. **La degradación de la nieve era, en buena medida, la de la `Eo`.** Diferir la
   lluvia de los días bajo cero hasta el deshielo movía el p10 un 11 % y ahora lo
   mueve un 0,8 %.
3. **El cuarto de arriba de la distribución quedó clavado contra el techo**: `p75`,
   `p90` y el máximo son 1,000. El `ancho` de 1,35 no dice que los años se
   parezcan; dice que la mitad buena está contra el tope y el índice ahí no
   distingue.

## Lo que queda abierto

- **La demanda de fuera de temporada.** Es ahora lo que domina la cola seca y no
  tiene con qué validarse: el trabajo no corrió inviernos. Está declarado en
  `EL_INVIERNO_DECIDE_LA_COLA_SECA` y en `AVISO_DEL_INVIERNO`, y la interfaz lo
  muestra.
- **El factor de actividad radicular por temperatura de suelo.** Es la
  degradación declarada que más se parece a la causa del sesgo +0,16: el trabajo
  lo aplica en las capas de 30-60 y 60-90 cm, aproximado de de Jong (1974) para
  Swift Current. Sin él esas capas entregan agua que en suelo frío no
  entregarían. Es la primera vez que hay un número contra el que medir si se
  monta.
- **La lluvia de ERA5 contra el pluviómetro**, hasta 100 mm en una temporada. No
  es del modelo y no se arregla desde acá, pero pone el piso de cuánto puede
  parecerse cualquier reconstrucción.

## Fuentes

- Jensen, M. E. y Haise, H. R. (1963). *Estimating evapotranspiration from solar
  radiation*. J. Irrig. Drain. Div. ASCE 89(IR4):15-41.
- Jensen (1966); Jensen, Rob y Franzoy (1970) — la variante modificada.
- U.S. Bureau of Reclamation, Pacific Northwest AgriMet: *Computation of the 1982
  Kimberly-Penman and the Jensen-Haise Evapotranspiration Equations* (Dockter
  1994, rev. Palmer 2008). Apéndices A a C.
  `https://www.usbr.gov/pn/agrimet/aginfo/AgriMet%20Kimberly%20Penman%20Equation.pdf`
- University of Wyoming, WWRC 87-06, cap. 4.
  `http://library.wrds.uwyo.edu/wrp/87-06/ch-04.html`
- ILRI, *Drainage Principles and Applications*, publicación 16, cap. 5.
  `https://edepot.wur.nl/183107`
- Allen, R. G. — *Water Requirements*, cap. 8 de *Design and Operation of Farm
  Irrigation Systems*, ASABE: `ETr/ETo` de 1,1 a 1,4.
- Wight, J. R. y Hanks, R. J. (1981). *J. Range Management* 34(4):307-311. Ver
  `WIGHT_HANKS_1981.md`.
- NOAA NCEI, GHCN-Daily, estación `USC00247560`.
- NASA POWER, API diaria, `ALLSKY_SFC_SW_DWN`.
- Open-Meteo / ERA5, API de archivo. Licencia: ver
  `project_terreno_openmeteo_licencia` en la memoria.
