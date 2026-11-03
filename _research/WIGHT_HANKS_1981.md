# Wight y Hanks (1981) — el modelo que reemplaza a `prodForrajera`

*Extraído el 02/11/2026. Es la deuda número uno de toda la cadena ganadera y
estuvo veinticuatro lotes de relevamiento sin poder abrirse.*

**La cita, copiada de la página del ítem:**

> Wight, J. R., & Hanks, R. J. (1981). A water-balance, climate model for range
> herbage production. *Journal of Range Management*, 34(4), 307-311.

DOI `10.2307/3897857`. Handle `http://hdl.handle.net/10150/646128`. Los autores
son, respectivamente, *range scientist* del USDA —Northwest Watershed Research
Center, Boise, antes en el Northern Plains Soil and Water Research Center de
Sidney, Montana— y profesor del Departamento de Ciencia del Suelo y
Biometeorología de Utah State University. Manuscrito recibido el 12 de diciembre
de 1979. Derechos de la Society for Range Management; digitalizado en un proyecto
conjunto con las bibliotecas de la Universidad de Arizona.

## Cómo se abrió, porque el repositorio devuelve 403 a la descarga directa

La vía está medida y es la única que funciona:

1. Abrir la página del ítem en el navegador —el handle redirige a
   `/items/7633e1ec-63d3-4d91-bbfc-1458ab601fa6`— y esperar a que la aplicación
   Angular hidrate. Antes de hidratar, la página no tiene texto.
2. Desde esa página, un `fetch` **del mismo origen** a
   `/server/api/core/items/<uuid>/bundles`. Devuelve tres: `ORIGINAL`, `TEXT` y
   `THUMBNAIL`.
3. `/server/api/core/bundles/<uuid del TEXT>/bitstreams` da el único archivo:
   `7199-7080-1-PB.pdf.txt`, 25.660 bytes.
4. `/server/api/core/bitstreams/<uuid>/content` devuelve el texto completo:
   **25.634 caracteres**, OCR, legible.

No hubo que rechazar ningún cartel de cookies esta vez. Los cuatro pasos dieron
200 a la primera.

---

## El modelo, ecuación por ecuación

La numeración es la del trabajo. El OCR desarma la tipografía matemática, así que
cada ecuación va reconstruida desde la lista de definiciones del propio artículo,
que sí sobrevivió entera.

**[1] El supuesto básico.** El rendimiento relativo iguala a la transpiración
relativa:

```
Y / Yp = T / Tp        →        Y = Yp · (T / Tp)
```

- `Y` = rendimiento real
- `Yp` = rendimiento potencial, el que habría con agua no limitante
- `T` = transpiración real
- `Tp` = transpiración potencial

**[2] La transpiración potencial:**

```
Tp = b · Kc · Eo
```

- `Eo` = evaporación de una superficie de agua libre, estimada de tanque o
  calculada por un método como Jensen-Haise (1963)
- `Kc` = coeficiente de cultivo
- `b` = 0,5 × índice de área foliar relativo (LAI relativo)

**[3] y [4] La transpiración real, por el método combinado:**

```
T = Tp · (SWS / AW) / c      si  SWS / AW ≤ c
T = Tp                        si  SWS / AW > c
```

- `SWS` = agua disponible existente en el suelo
- `AW` = capacidad de almacenaje de agua disponible
- `c` = el valor de `SWS/AW` a partir del cual `T` deja de ser función lineal de
  `SWS/AW`

**[6] y [7] La evaporación del suelo**, función de la potencial y del tiempo
desde que la superficie se mojó por última vez:

```
E  = Ep · t^(-1/2)
Ep = Kc · Eo − Tp
```

con `t` en días desde el último mojado. La evaporación del suelo está limitada al
agua de la capa superficial que exceda el contenido de suelo seco al aire, que es
algo menor que el límite inferior de disponibilidad (punto de marchitez
permanente).

### Cómo corre

Día por día. El perfil se divide en capas; en este estudio **tres capas de 30 cm**
para poder comparar contra mediciones de campo hechas a esos incrementos, y el
artículo dice explícitamente que las capas se pueden asignar por horizonte o por
distribución de raíces cuando hay dato.

El agua entra por precipitación y sale por evaporación de suelo, transpiración y
drenaje. Tras una lluvia, si la capa superficial pasa capacidad de campo, el agua
baja a la siguiente, y así hasta que se agote la lluvia o se llenen todas las
capas; **el excedente se cuenta como drenaje**. La extracción también va capa por
capa desde la superficie: si la capa `i` no puede satisfacer la `Tp` diaria, la
demanda completa se aplica a la capa `i+1`, pero la extracción no puede exceder la
diferencia entre `Tp` y la `T` ya obtenida de las capas anteriores.

Encima de eso hay un **factor de actividad radicular función de la temperatura del
suelo**, aplicado a la segunda y la tercera capa. Se asumió que la temperatura no
restringe la transpiración de la capa superficial.

En este estudio **se asumió escurrimiento nulo**.

### Entradas

Capacidad de agua disponible (`AW`) de cada capa; contenido de agua a seco al aire
de la capa superficial; agua disponible (`SWS`) de cada capa al arranque de la
estación; precipitación diaria; y `Eo` diaria o periódica —promedios de hasta diez
días resultaron satisfactorios—.

---

## La calibración, que es la parte que no se puede copiar

El artículo dice que el modelo **no tiene coeficientes de calibración**, pero que
hubo que ajustar los factores que relacionan `Tp` con `Eo` y `T` con `SWS`:

- **`Kc` = 0,85**, constante para toda la estación de crecimiento. Se estimó
  graficando `ET/Eo` con la evapotranspiración medida semanalmente en un
  lisímetro hidráulico sembrado con pastizal nativo, en períodos de agua no
  limitante. `ET/Eo` iba de **0,7 en primavera y otoño a 0,9 a mitad de
  estación**, y 0,85 como promedio dio estimaciones tan buenas como usar la curva
  estacional completa.
- **`c` = 1,0** —relación lineal recta— resultó efectivo para este pastizal, así
  que **la ecuación [4] nunca se invocó**. Para trigo, Rasmussen y Hanks (1978)
  usaron `c` = 0,5; para pastizal nativo, de Jong y MacDonald (1975) reportaron
  0,7. El modelo **no es sensible a cambios chicos de `c`**, así que conocerlo con
  exactitud no es crítico.
- La **curva de LAI relativo** salió de datos de Hanson (1973), y el artículo dice
  que funcionó bien **pero que conviene desarrollar una curva representativa de la
  región donde se use el modelo**.
- Las **curvas de temperatura de suelo** se aproximaron de de Jong (1974) para
  **Swift Current, Saskatchewan**.
- Fecha de arranque: se usó el último día en que la temperatura mínima del aire
  bajó a −7 °C, y también corridas con 1 y 15 de abril y 1 de mayo. El 15 de
  abril y el arranque dependiente de temperatura fueron igual de efectivos.

### Y `Yp`, que es el problema de acequia

`Yp` es el rendimiento máximo que ocurriría con agua no limitante, e **incluye los
efectos de la composición de especies y de la fertilidad del suelo** asociados al
sitio. No sale del modelo: se estima del dato de campo del sitio, o por la
relación `Yp = Y · Tp / T` calculada para años representativos.

- Sidney, Montana: **≈ 1.300 kg/ha**. Los rendimientos parecían topear ahí sin
  importar cuánta lluvia cayera (Wight y Black 1979).
- Mandan, North Dakota: **≈ 2.760 kg/ha**.

---

## La validación, y el caso resuelto para el test

Sitios: pradera mixta cerca de Sidney, Montana —sitio arenoso de planicie
glaciada— y cerca de Mandan, North Dakota. En Sidney la cosecha se midió cortando
varias parcelas de 0,5 × 2,0 m a nivel del suelo, al llegar a madurez de las
gramíneas principales. El agua del suelo se midió por método neutrónico cada
quince días. `Eo` se calculó por Jensen-Haise.

**Tabla 1 del artículo, Sidney, Montana**, con `Yp` = 1.300 kg/ha. Todo en mm
salvo donde se indica:

| Año | Kc·Eo | Tp | T | ET | Drenaje | Rend. predicho | ET medida | Lluvia | Rend. medido | sȳ | Días |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1967 | 274 | 123 | 110 | 190 | 0 | 1.166 | 218 | 210 | 1.200 | 186 | 91 |
| 1968 | 297 | 126 | 71 | 159 | 0 | 730 | 177 | 158 | 742 | 34 | 99 |
| 1969 | 309 | 130 | 118 | 209 | 117 | 1.178 | 228 | 338 | 1.245 | 112 | 98 |
| 1970 | 300 | 134 | 124 | 209 | 0 | 1.199 | 183 | 218 | 1.205 | 84 | 86 |
| 1971 | 311 | 137 | 79 | 174 | 0 | 750 | 174 | 141 | 720 | 58 | 91 |
| 1972 | 297 | 132 | 130 | 226 | 42 | 1.275 | 229 | 206 | 1.215 | 84 | 90 |
| 1973 | 326 | 144 | 121 | 209 | 0 | 1.095 | 258 | 232 | **763** | 73 | 92 |
| 1974 | 317 | 136 | 123 | 214 | 0 | 1.180 | 230 | 179 | **933** | 71 | 91 |
| 1975 | 274 | 122 | 120 | 201 | 50 | 1.282 | 216 | 208 | 1.321 | 92 | 91 |
| 1976 | 297 | 131 | 118 | 207 | 0 | 1.175 | 223 | 193 | 1.100 | 93 | 88 |
| 1977 | 243 | 97 | 39 | 98 | 0 | 522 | 122 | 91 | 450 | 68 | 68 |
| 1978 | 249 | 109 | 103 | 186 | 0 | 1.223 | 202 | 220 | 1.246 | 176 | 81 |
| **Media** | **291** | **127** | **105** | **190** | **17** | **1.065** | **206** | **200** | **1.012** | | **89** |

`sȳ` es el intervalo de confianza del 90 % de la media medida (±). El período de
crecimiento se midió del 15 de abril al pico de materia en pie.

**El `r²` es 0,74**, calculado por mínimos cuadrados contra la línea de valor
igual. El agua del suelo modelada correlacionó con la medida a `r²` = 0,91. Y el
resumen del artículo dice que los rendimientos predichos quedaron **dentro del
10 % de los medidos en 12 de los 15 años de prueba**, contando los dos sitios.

**Mandan**, tres años: predichos 1.930, 1.128 y 2.245 kg/ha para 1958, 1959 y
1960, contra medidos 1.767, 1.405 y 2.105.

### La ecuación [1] reproduce la tabla

Verificado año por año con `Yp` = 1.300 kg/ha:

| Año | `Yp · T/Tp` | Publicado |
|---|---|---|
| 1967 | 1.162,6 | 1.166 |
| 1968 | 732,5 | 730 |
| 1969 | 1.180,0 | 1.178 |
| 1970 | 1.203,0 | 1.199 |
| 1972 | 1.280,3 | 1.275 |
| 1977 | 522,7 | 522 |

Las seis dentro de un 0,4 %. **Ése es el test**: la ecuación [1] con la columna
`Tp` y la columna `T` de la tabla tiene que devolver la columna de rendimiento
predicho. Es un caso resuelto de la literatura, con doce años.

---

## Qué puede y qué no puede hacer acequia con esto

Esto es lo que hay que decidir antes de escribir una línea de código, y es la
razón por la que este documento existe antes que la función.

**Lo que acequia tiene:**

| Entrada del modelo | De dónde sale |
|---|---|
| precipitación diaria | POWER y Daymet, ya en el motor de clima |
| `Eo` / ETP diaria | ya se calcula, y la app ya corrigió que `T2M_MAX/MIN` de POWER son récords y no medias |
| `AW` por capa | SoilGrids y HWSD v2, con el reparto que la ficha declara |
| temperatura del suelo | se puede derivar de la del aire, con una fuente aparte |

**Lo que acequia no tiene, y hay que decir qué se hace:**

1. **`Yp`, el rendimiento potencial del sitio.** Es el número grande. El artículo
   es explícito: incluye composición de especies y fertilidad, se estima del dato
   de campo del sitio, y en los dos sitios del estudio difiere **2,1 veces** entre
   sí. Sin `Yp` el modelo no devuelve kg/ha: devuelve una fracción.
2. **La curva de LAI relativo de la región.** El artículo dice que la suya es de
   Hanson (1973) para pradera mixta del norte de las Grandes Planicies y que
   **conviene desarrollar una propia por región**. Usarla en el Chaco o en el
   miombo es extrapolar fuera del rango.
3. **Las curvas de actividad radicular por temperatura de suelo**, aproximadas de
   Swift Current, Saskatchewan. Mismo problema.

---

## Lo que se escribió el 02/11/2026, y el parámetro que la tabla devolvió

El balance diario quedó escrito en `apps/terreno/lib/forrajeBalance.ts`, con
`correrBalanceForraje` devolviendo `T/Tp` y las tres capas corriendo día por
día. Cuarenta y cuatro tests en
`apps/terreno/tests/unit/economia/forrajeBalance.test.ts`.

### El `b` que era una figura, despejado de la Tabla 1

El obstáculo que `FALTA_PARA_CORRER_WIGHT_HANKS` nombraba primero —que
`b = 0,5 × LAI relativo` es la Figura 2 y no hay tabla de puntos— **se resolvió
sin la figura**. Por la ecuación 2, `Tp = b · Kc · Eo`, el cociente
`Tp/(Kc·Eo)` de cada año *es* el `b` de la temporada promediado y ponderado por
`Eo`, y las dos columnas están impresas:

| año | `b` | año | `b` | año | `b` | año | `b` |
|---|---|---|---|---|---|---|---|
| 1967 | 0,449 | 1970 | 0,447 | 1973 | 0,442 | 1976 | 0,441 |
| 1968 | 0,424 | 1971 | 0,441 | 1974 | 0,429 | 1977 | **0,399** |
| 1969 | 0,421 | 1972 | 0,444 | 1975 | 0,445 | 1978 | 0,438 |

**Media 0,435, desvío 0,014, y once de los doce entre 0,42 y 0,45.** Como
`b = 0,5 × LAI relativo`, el LAI relativo medio de la temporada en Sidney fue
de 0,87.

El año que se despega es **1977, y no es ruido: es la temporada más corta de la
serie, 68 días contra 81 a 99 de las otras**, y queda trece días abajo de la
siguiente, así que no es la cola de un continuo. Un promedio de temporada falla
justo donde la temporada se cortó antes de que el dosel llegara a su máximo, que
es precisamente la limitación de usar una constante en vez de la curva. Con
`b = 0,435` constante el balance reproduce la columna `Tp` **dentro del 5 % en
once de los doce años**, y el que se pasa es 1977, por 8,97 % para arriba.

Esto no reemplaza el pedido de los autores de construir una curva propia por
región: el número es de pradera mixta del norte de las Grandes Planicies y usarlo
en el Chaco es extrapolar. Pero convierte un hueco en un valor por defecto con
fuente, rango de validez y dirección del error conocida.

### Lo demás que la tabla permitió probar, y lo que no

- **La tabla cierra su propio balance.** `P − ET − drenaje` es el cambio de
  almacenaje de la temporada, y en los doce años va de **−62 a +34 mm**: cabe en
  un perfil arenoso de 90 cm y no lo desborda. Si hubiera dado 200 mm, alguna
  columna estaría mal leída.
- **`E/Ep` da 0,52 de media** —despejando `E = ET − T` y `Ep = Kc·Eo − Tp`— con
  los doce años entre 0,40 y 0,60, y el más bajo es otra vez 1977.
- **La columna `T` no se puede reproducir** y hay que decirlo fuerte: haría falta
  la lluvia diaria de Sidney de 1967 a 1978, que el artículo no publica. De `T`
  se verifica la conservación al milímetro, que `T ≤ Tp` todos los días, y que el
  índice queda en [0, 1].
- **Cada degradación empuja el índice para arriba**, y eso está testeado como
  dirección, no como valor: sin el agua bajo el límite inferior el índice sale
  0,214 donde con ella sale 0,190; sin el factor de actividad radicular sale
  0,587 donde con 0,5 sale 0,524. El supuesto de escurrimiento nulo va en la
  misma dirección. Para dimensionar una carga animal la dirección del error es lo
  único que importa, y acá es siempre la optimista.

### Y `Yp` sigue siendo lo que falta

Queda un solo parámetro, y es el que fija la escala. El encargo para relevarlo
está escrito en `_research/_encargos/ENCARGO_FORRAJE_YP.md`: pide producción de
pastizal natural **en condición de agua no limitante**, con el suelo y la
composición que la explican, por cuatro vías —riego medido, la columna de año
favorable de las fichas de sitio ecológico del NRCS, el año húmedo sólo si la
fuente dice que el agua no limitó, y un `Yp` despejado declarado como tal— y,
sobre todo, **cualquier relación publicada entre rendimiento potencial y una
propiedad de suelo**, que es lo único que permitiría estimarlo en un predio donde
nadie cortó pasto nunca.

---

**Entonces lo que corresponde escribir es la fracción, no el kilo.** El aporte
real y transferible de Wight y Hanks es `T/Tp`: un **índice de suficiencia hídrica
del forraje**, calculado con balance diario, que acequia sí puede computar con
sus propias entradas y que es honesto por construcción porque no finge saber la
fertilidad del sitio. Y después el kilo se obtiene multiplicando por un `Yp` que
tiene que venir de otra parte, declarado como tal y con su propia fuente.

Eso **no es un reemplazo directo de `prodForrajera`**, que devuelve kg/ha de una
escalera por lluvia anual. Es la pieza de abajo, la que sí tiene fuente. El
reemplazo completo necesita además una fuente para `Yp`, y ahí es donde entra lo
que ya está medido en `forrajeMedido.ts`: la compilación de sitios donde la lluvia
anual explica poco más de la mitad de la variación, el Miami Model de Lieth con
su forma de mínimo entre lluvia y temperatura, y la banda de fracción herbácea
según el dosel.

**El orden, entonces:** primero `T/Tp` con este test; después `Yp` con su propia
fuente; y sólo cuando los dos existan se desconecta la escalera. Escribir el kilo
antes del `Yp` es exactamente cómo se imprime un número plausible y equivocado.
