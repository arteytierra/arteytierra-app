# El índice de forraje año por año — cómo se midió

Acta de la medición que respalda las constantes de
`apps/terreno/lib/forrajeAnios.ts`. Esto **no es código y no se monta**: está
para que cualquiera pueda repetir las mediciones y para que los números del
módulo no sean afirmaciones sueltas.

Fecha: 06/11/2026.

> **Leérselo con `FORRAJE_EO_JENSEN_HAISE.md` al lado.** El 08/11/2026 se leyó
> Jensen-Haise (1963), la `Eo` del balance dejó de ser la ETo de referencia de
> FAO-56 y **las nueve mediciones de acá se rehicieron**. Los números de este
> acta son los de la corrida con la ETo: quedan porque son el otro extremo de
> una banda que sigue abierta —la demanda de fuera de temporada— y porque la
> comparación entre las dos corridas es lo que mide esa banda. La tabla
> completa de qué dio cada medición con cada `Eo` está en la sección 6 del acta
> nueva.

## El sitio y la serie

**Sidney, Montana (EE.UU.)**, `47,72 N · −104,16 O`. Es el sitio de validación
de Wight y Hanks (1981) y el mismo del que se despejó el `Yp` a 0,02 % (ver
`WIGHT_HANKS_1981.md`). Se eligió a propósito: medir una sensibilidad donde el
modelo no está validado mezcla el efecto que se busca con el error del modelo.

```
https://archive-api.open-meteo.com/v1/archive
  ?latitude=47.72&longitude=-104.16
  &start_date=1960-01-01&end_date=2024-12-31
  &daily=precipitation_sum,et0_fao_evapotranspiration&timezone=auto
```

23.742 días, **cero nulos**. Lluvia media anual 425,5 mm; lluvia media de la
temporada 177,8 mm. Un segundo pedido con `daily=temperature_2m_mean` sobre la
misma ventana, para la fracción que cae bajo cero.

Ventana de temporada: **15 de abril, 84 días** —la mediana de los 68 a 99 días
de los doce años de la prueba—. Perfil de 90 cm en tres capas de 30 con 50 mm de
agua útil cada una, o sea los 150 mm de `AWC_POR_DEFECTO_MM`.

La medición corrió con las propias funciones de `lib/forrajeAnios.ts` desde un
test descartable, no con una reimplementación: lo que se mide es el código que
se publica. 62 temporadas quedan después de descartar las tres primeras.

## 1. Cuánto sobrevive el agua con la que arranca la cadena

Dos corridas de la cadena completa, del perfil vacío y del lleno, comparando el
índice de cada temporada.

| temporada | diferencia |
|---|---|
| 1 | 73,398 % |
| 2 | 21,423 % |
| 3 | 0,385 % |
| 4 | 0 % |
| 5 | 0,042 % |
| 6 en adelante | < 0,01 % |

**Tres temporadas, y ese tres es de Sidney.** La serie sintética del test del
módulo —más árida, ~230 mm de lluvia contra ~840 de demanda anual— todavía
arrastraba un **9,5 %** en la cuarta. Por eso `indicesPorAnio` no usa este
número: corre las dos cadenas y marca las temporadas que no coinciden.

## 2. La ventana de temporada

Cociente contra la ventana del trabajo, 62 temporadas.

| variante | mediana | p10 |
|---|---|---|
| arranque −15 días (31/03) | 1,065 | 1,239 |
| arranque +15 días (30/04) | 0,758 | 0,871 |
| largo 68 días | 1,100 | 1,278 |
| largo 99 días | 0,717 | 0,769 |

El `p10` se mueve más que la mediana **sólo** cuando la variante le da más agua
al pastizal. Lo que queda es que la ventana no desplaza la distribución: le
cambia la forma, así que una ventana equivocada no se corrige con un factor.

## 3. La distribución del índice

| | |
|---|---|
| mínimo | 0,051 |
| p10 | 0,194 |
| p25 | 0,344 |
| mediana | 0,675 |
| p75 | 0,882 |
| p90 | 0,985 |
| máximo | 1,000 |
| promedio | 0,603 |
| p90/p10 | **5,08** |
| temporadas bajo el promedio | 29 de 62 (46,8 %) |

El 46,8 y no 50 es porque el índice no puede pasar de 1: la distribución queda
sesgada a la izquierda y el promedio cae por debajo de la mediana.

El agua con la que la cadena arrancó cada temporada fue de **0,1 a 147,6 mm** de
los 150 posibles, con media 52,2.

## 4. La lluvia contra el índice

Coeficiente de determinación, 62 temporadas:

- lluvia del año calendario: **R² = 0,207**
- lluvia de la temporada: **R² = 0,522**

Es el techo de lo que puede explicar la variable que mira `prodForrajera`.

## 5. La nieve que el modelo no acumula

27.658 mm de precipitación en 65 años, de los cuales **4.695 mm (17,0 %)** caen
en días de temperatura media bajo 0 °C. El modelo los mete al perfil el día que
nevaron, meses antes de cuando llegan: el índice sale **bajo**.

## 6. La ETo de FAO-56 contra la `Eo` de la Tabla 1

Misma ventana, mismo sitio.

| | mm/día |
|---|---|
| ETo de ERA5, media 62 años | 4,62 |
| ETo de ERA5, media 1968-1979 | 4,41 |
| ETo de ERA5, envolvente | 3,70 a 6,65 |
| `Eo` de la Tabla 1 (12 años) | 3,53 a 4,20, media 3,87 |
| cociente sobre 62 años | **1,196** |
| cociente sobre 1968-1979 | **1,142** |

Mezcla la diferencia de superficie de referencia con el sesgo propio de ERA5 en
ese píxel. **Separadas el 08/11/2026**: el sesgo de ERA5 es chico —temperatura
sin sesgo contra la estación del lugar, radiación 2,2 % alta contra NASA
POWER— y la superficie de referencia es casi todo el resto. Con la `Eo`
calculada por el método del trabajo el cociente baja de 1,162 a **1,015**. Ver
`FORRAJE_EO_JENSEN_HAISE.md`.

## 7. El error de la `Eo` NO se cancela a lo largo de la cadena

El forraje de un año es `Yp · índice_j` y `Yp = Y_corte / índice_corte`, o sea el
cociente de dos índices de la misma serie. La hipótesis era que un error de
escala en la `Eo` se fuera por el cociente. **Falso.** Escalando la `Eo` por
1,142 sobre la cadena entera, con el año de índice mediano (2020) como año del
corte:

| | movimiento |
|---|---|
| el `Yp` solo | +11,6 % |
| el forraje de un año, mediana | 15,6 % |
| el forraje de un año, p90 | 41,3 % |
| el forraje del peor año (2017) | **54,7 %** |

No cancela: amplifica, y amplifica justo en los años secos, que son los que
deciden la carga animal. El índice no responde linealmente: con el agua muy
limitada, subir la demanda un 14 % baja el índice mucho más, porque la
evaporación del suelo también se lleva agua que habría transpirado.

**Consecuencia:** leer Jensen-Haise (1963) pasó de prolijidad a la deuda más
cara del motor de forraje. **Pagada el 08/11/2026**: la `Eo` se calcula por el
método del trabajo, así que el error de escala que se mide acá ya no existe por
construcción. La medición queda porque es la razón por la que no se podía dejar
así.

## 8. Deriva de la serie

Pendiente del índice: **−0,042 por década**, con **R² = 0,065**.

| mitad | mediana | p10 | `Tp` mm/día |
|---|---|---|---|
| 1963-1993 | 0,708 | 0,152 | 1,731 |
| 1994-2024 | 0,568 | 0,250 | 1,682 |

La mediana bajó y el `p10` subió: una pendiente sola no describe las dos, y la
tendencia explica el 6,5 % de la varianza. Por eso la ventana de la serie se
queda entera en vez de recortarse a los últimos veinte años, que dejaría el `p10`
decidido por dos temporadas.

## 9. El chequeo de una sola dirección: 1988

El modelo pone a **1988 último de 62**, con índice 0,051. Contra el registro de
la estación del propio sitio —Eastern Agricultural Research Center, Sidney,
Montana, Montana State University, resumen del año agrícola 1987-88 y promedios
1949-88—:

| | medido | promedio | fracción |
|---|---|---|---|
| año agrícola, pulgadas | 6,18 | 13,53 | 45,7 % |
| abril a junio, pulgadas | 2,23 | 5,90 | 37,8 % |
| ERA5 en la ventana, mm | 77,5 | 177,8 | 43,6 % |

Dos fuentes independientes a seis puntos de distancia. Y la cadena le entregó a
esa temporada un perfil con **1,3 mm de los 150**, contra 52 de promedio: el
otoño y el invierno previos también habían sido secos.

Cinco peores: 1988, 1990, 2017, 1985, 1980. Cinco mejores: 2011, 1975, 1972,
1963, 1965.

Si el peor año del modelo no hubiera sido una sequía conocida, algo estaría
roto. Que lo sea **no valida el modelo**.

## Fuentes citadas

- Wight, J. R., y Hanks, R. J. (1981). «A water-balance, climate model for range
  herbage production». *J. Range Management* 34(4):307-311. DOI
  `10.2307/3897857`.
- Lyons, R. K., y Machen, R. V. (2001). «Stocking Rate: The Key Grazing
  Management Decision». Texas A&M AgriLife Extension, RWFM-PU-060.
- Eastern Agricultural Research Center, Sidney, Montana (Montana State
  University). Resumen climático del año agrícola 1987-88.
- Open-Meteo / ERA5, API de archivo. Licencia: ver
  `project_terreno_openmeteo_licencia`.
