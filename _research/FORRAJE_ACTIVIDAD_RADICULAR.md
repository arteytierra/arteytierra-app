# El factor de actividad radicular, y lo que no alcanzó a explicar

> **Al día siguiente, 10/11/2026.** Lo que este lote dejó anotado como «lo que
> sigue» —el agua inicial de las temporadas secas— se pagó: con la humedad de
> suelo de ERA5-Land el sesgo contra los doce baja de **+0,132 a +0,061**, 1977
> y 1968 se acomodan y queda sólo 1971. Ver `FORRAJE_AGUA_INICIAL.md`. De paso
> se cayeron dos degradaciones declaradas: el invierno y la nieve.

**09/11/2026.** Tercera y última de las degradaciones declaradas del balance de
Wight y Hanks que tenía una fuente esperando. Se montó, se midió contra los doce
índices publicados, y el resultado es mitad y mitad: **destapa el techo del
índice y deja en pie las tres cuartas partes del sesgo**.

Acta anterior: `FORRAJE_EO_JENSEN_HAISE.md`, que es donde salió el número contra
el que esto se podía comprobar.

---

## 1. La deuda, y por qué ésta valía la pena antes que las otras dos

`forrajeBalance.ts` declaraba tres huecos y los tres empujaban el índice para
arriba: sin factor de actividad radicular, con escurrimiento nulo y sin agua
bajo el límite inferior. Al poner la `Eo` del método del trabajo quedó medido
cuánto suman: **sesgo +0,156 contra los doce índices de la Tabla 1, y techo
—índice ≥ 0,99— en 10 de 12 temporadas**, contra valores publicados que van de
0,40 a 0,98.

De las tres, ésta era la única con una curva publicada. Y es la que más se
parecía a la causa: la temporada arranca el 15 de abril con el suelo profundo
todavía frío, y sin el factor las capas de 30-60 y 60-90 cm entregan agua que en
suelo frío no entregarían.

---

## 2. La figura traía la ecuación adentro

El encargo decía que la curva es una figura y que había que conseguir de Jong
(1974) o una equivalente. **No hizo falta**: la Figura 1 de Wight y Hanks, en la
página 308, imprime la ecuación ajustada dentro del recuadro.

```
Y = 0,0408 · e^(0,19·T)       T en °C, Y fracción (el eje está en %)
```

El eje va de 0 a 18 °C y de 0 a 100 %. La curva toca el 100 % y se corta contra
el borde superior en **T = 16,84 °C**, que es exactamente donde la ecuación da 1;
arriba de eso satura.

### Cómo se abrió el PDF, que la vez pasada costó

El repositorio de la Universidad de Arizona devuelve 403 al bitstream, pero:

- la **API REST** (`/server/api/core/items/<uuid>/bundles` y
  `/bundles/<uuid>/bitstreams`) contesta 200 a `curl` pelado;
- el **texto OCR** se baja con un `fetch` del mismo origen desde la página del
  ítem, en el navegador;
- el **PDF** se baja con `curl` agregando `?download=true` **y** la cabecera
  `Referer` de la página del ítem. Eso devuelve 990 kB de PDF real.

El escaneo guarda cada página como ~49 tiras de 3.648 × 71 px en 1 bit, así que
hay que coserlas en orden para reconstruir la página. Los scripts quedaron en el
scratchpad de la sesión.

### El caso resuelto 1: la figura contra sí misma

La curva **dibujada** y la ecuación **impresa** son dos cosas distintas en el
papel, así que tienen que coincidir. Se trazó la curva columna por columna sobre
la página cosida —1.092 columnas entre 0,3 y 16,8 °C, con el marco calibrado en
x 261→1451,5 px = 0→18 °C e y 785→116,5 px = 0→100 %—:

| T °C | leído de la curva | ecuación |
|---|---|---|
| 2 | 5,8 % | 5,96 % |
| 6 | 12,8 % | 12,76 % |
| 10 | 27,4 % | 27,25 % |
| 14 | 58,3 % | 58,34 % |
| 16 | 85,0 % | 85,24 % |

**La peor diferencia entre 0 y 16 °C es de 0,59 puntos porcentuales.** Y
ajustando una exponencial a los 1.092 puntos sin mirar la ecuación sale
`Y = 0,04038·e^(0,19074·T)`: 0,6 % en la constante y 0,4 % en el exponente.

### De paso, una cita que estaba mal en nuestra propia acta

`WIGHT_HANKS_1981.md` decía que las curvas de temperatura de suelo salían de **de
Jong (1974)**. Leyendo la página 309 limpia, son **dos personas distintas**:

- **E. de Jong (1974)**, *Modelling. VII. Soil water simulation models*, Tech.
  Rep. No. 61, IBP, Matador Project → la relación actividad-temperatura, Fig. 1.
- **R. de Jong (1978)**, *Energy and the Forage Crop*, p. 24-40, en J. D.
  McElgunn (ed.), *Pasture Systems for the Cow-Calf*, Agriculture Canada, Swift
  Current → las curvas estacionales de temperatura de suelo, que pasadas por la
  Fig. 1 dan la Fig. 3.

Ninguna de las dos está digitalizada. Ninguna de las dos hizo falta.

---

## 3. La temperatura del suelo: el refinamiento que los autores pedían

El trabajo usó **curvas generales** —la misma curva estacional todos los años— y
los propios autores escriben que el refinamiento lógico sería un submodelo de
temperatura de suelo (Hanks, Austin y Ondrechen 1971). Dan el ejemplo de lo que
les costó: en la primavera de 1977, con abril y mayo mucho más cálidos que lo
normal, el modelo **subestimó** la extracción de la capa de 30-60 cm.

acequia tiene ese refinamiento sin mérito propio: el reanálisis ya corre un
modelo de suelo. **ERA5-Land publica la temperatura del suelo por capa y por
día desde 1940**, y llega por el mismo pedido a Open-Meteo que ya trae la lluvia
y la radiación (`soil_temperature_28_to_100cm_mean`).

### Lo que se pierde en la geometría, y cuánto es

| capas del modelo | capas de ERA5-Land |
|---|---|
| 0-30 (sin factor, lo dice el trabajo) | 0-7, 7-28 |
| **30-60** | **28-100** |
| **60-90** | **28-100** |

Las dos capas que llevan factor caen adentro de la misma capa del dato y reciben
**la misma temperatura**. La Figura 3 publicada dice exactamente cuánto cuesta
eso: en primavera la actividad de 60-90 es **0,57 a 0,81** de la de 30-60.

### El sesgo del dato, medido contra algo que no es ERA5

Mismo movimiento que con la radiación y la temperatura del aire cuando se montó
la `Eo`. El control es **MERRA-2 por NASA POWER**, cuyo `TSOIL3` cubre 29,4 a
68,0 cm, casi la segunda capa del modelo exacta. 16.071 días en común,
1981-2024:

| | ERA5-Land − MERRA-2 |
|---|---|
| año entero | **+1,32 °C** |
| ventana 15/04 a 15/07 | **+0,34 °C** |
| diferencia de actividad en la ventana | **0,013** |

Parte de eso no es sesgo: el píxel de POWER está a **722 m** y el de ERA5-Land a
**589**, 133 m más abajo, que por gradiente seco son ~0,8 °C. Para lo que el
motor hace con el número, el dato no es el problema.

### Lo que hace la temporada

Promediado sobre las doce temporadas de la Tabla 1, la capa de 28-100 cm arranca
el 15 de abril a **2,5 °C** y llega a **17,1 °C** en la primera quincena de
julio. Por la curva, eso es pasar de **0,07 a 1,00**: durante la primera parte de
la estación las dos capas profundas están prácticamente cerradas, y el balance
que corría sin factor las tenía abiertas de par en par.

---

## 4. El caso resuelto 2: la Figura 3 contra el camino de acequia

Éste es el que valida **las dos piezas juntas**. La Figura 3 es la actividad
estacional de Swift Current que los autores obtuvieron pasando las curvas de
de Jong (1978) por la Figura 1. acequia hace lo mismo con ERA5-Land en el píxel
de Swift Current (50,28 N · 107,80 O, climatología 1961-1990).

| quincena | acequia | Fig. 3 de 30-60 | Fig. 3 de 60-90 |
|---|---|---|---|
| 1 feb | 3,6 | 1,8 | 1,8 |
| 1 abr | 3,6 | 2,2 | 2,2 |
| 16 abr | 4,1 | 3,9 | 3,1 |
| 1 may | 6,6 | 6,6 | 4,7 |
| 16 may | 16,6 | 11,7 | 7,5 |
| 1 jun | 33,8 | 21,2 | 12,4 |
| 16 jun | 49,6 | 36,2 | 20,5 |

**acequia lee alto: +4,2 puntos porcentuales contra la curva de 30-60 y +7,7
contra la de 60-90**, lo que en la rampa de primavera es un adelanto de **7 a 13
días**. Las dos causas son las de arriba —ERA5-Land corre 1,3 °C cálido, y 1,3 °C
en esta curva son un 28 % relativo; y la capa única sirve a las dos del
modelo—. Dirección del error: **alta**, igual que todo lo demás que el balance
declara.

(De julio en adelante el trazado de la Figura 3 no es confiable: la curva de
30-60 satura contra el borde del recuadro y las dos se cruzan, así que la
comparación se corta en junio y así está declarado.)

---

## 5. Lo que el factor hizo contra los doce índices publicados

Mismo arnés que el lote anterior: la serie de Sidney, Montana (47,72 N ·
104,16 O), ventana del 15 de abril y los días de cada temporada tal como la
Tabla 1 los publica.

| | sin el factor | con el factor |
|---|---|---|
| error absoluto medio | 0,156 | **0,133** |
| sesgo | +0,156 | **+0,132** |
| temporadas en el techo (≥ 0,99) | **10 de 12** | **4 de 12** |
| correlación con los publicados | 0,539 | **0,704** |

Año por año:

| año | publicado | sin factor | con factor |
|---|---|---|---|
| 1967 | 0,894 | 0,999 | 0,974 |
| 1968 | 0,564 | 0,764 | **0,719** |
| 1969 | 0,908 | 1,000 | 0,952 |
| 1970 | 0,925 | 0,996 | 0,992 |
| 1971 | 0,577 | 1,000 | **0,957** |
| 1972 | 0,985 | 1,000 | 0,995 |
| 1973 | 0,840 | 0,990 | 0,980 |
| 1974 | 0,904 | 0,998 | 0,989 |
| 1975 | 0,984 | 1,000 | 0,977 |
| 1976 | 0,901 | 1,000 | 0,999 |
| 1977 | **0,402** | 0,957 | **0,879** |
| 1978 | 0,945 | 1,000 | 1,000 |

**Lo que arregló: el techo.** Diez de doce temporadas daban ≥ 0,99, o sea que el
modelo no distinguía un año bueno de uno excelente ni de uno malo-pero-no-pésimo.
Quedan cuatro, y la correlación con los publicados sube de 0,54 a 0,70. Para lo
que la app hace eso importa más que el sesgo, porque el `Yp` se despeja
dividiendo por el índice del año del corte: un índice clavado en 1 convierte
cualquier corte en el techo del sitio.

**Lo que no arregló: las tres cuartas partes del sesgo**, y lo que queda está
concentrado en las tres peores temporadas publicadas —1977, 1968 y 1971—, que son
las tres que el trabajo arrancó con el perfil seco y la cadena arranca con 132,
88 y 137 mm de los 150.

Así que la hipótesis quedó medida y es **sólo parte** de la respuesta.

---

## 6. Lo que cambió en la serie de 63 años, medición por medición

| | sin el factor | con el factor |
|---|---|---|
| temporadas usables | 62 | 63 |
| p10 | 0,741 | **0,672** |
| mediana | 0,999 | **0,935** |
| p75 | 1,000 | **0,975** |
| p90 | 1,000 | 0,990 |
| ancho (p90/p10) | 1,35 | 1,473 |
| temporadas de calentamiento | 3 | **2** |
| R² contra la lluvia de temporada | 0,357 | **0,428** |
| R² contra la lluvia del año | 0,219 | 0,256 |
| tendencia por década | −0,005 (R² 0,002) | −0,009 (R² 0,010) |
| peor año | 1988, 0,157 | 1988, **0,161** |
| nieve: lo que mueve el deshielo diferido en el p10 | +0,8 % | −0,8 % |

En los kilos: el `Yp` despejado del corte se mueve **−0,8 %** —el año del corte
está cerca del techo en las dos corridas— pero el forraje de un año cualquiera se
mueve una mediana de 3,2 %, un p90 de 11,9 % y hasta **17,3 %**.

### El arrastre, que no era obvio

En una ventana suelta el factor sólo puede **bajar** el índice. En la cadena
continua, no: el agua que las capas frías no transpiraron **se queda en el
perfil**, y una temporada posterior puede arrancar más húmeda y salir más alta.
El peor año de la serie sube de 0,157 a 0,161. Lo encontró un test que afirmaba
lo contrario, y quedó escrito en `EL_FACTOR_DESTAPA_EL_TECHO_PERO_NO_EL_SESGO`.

### Y el invierno se volvió a mover

Los tres tratamientos de la demanda de fuera de temporada, rehechos con el
factor:

| | p10 | mediana | ancho | EAM contra los 12 | SWS inicial |
|---|---|---|---|---|---|
| Jensen-Haise todo el año | 0,672 | 0,935 | 1,47 | 0,133 (+0,132) | 121 mm |
| JH en temporada, ETo afuera | 0,311 | 0,753 | 3,13 | **0,114** (+0,024) | 67 mm |
| ETo de FAO-56 todo el año | 0,201 | 0,611 | 4,57 | 0,150 (−0,094) | 61 mm |

El p10 se mueve **3,3 veces** (antes 3,8). Y hay que decirlo aunque incomode:
**los tres ya no son indistinguibles por el error**. Antes iban de 0,142 a 0,156
y ésa era una de las razones para no elegir por ahí; ahora el híbrido mide un
14 % mejor que el elegido.

La elección no cambia, y el motivo es que la ventaja del híbrido se entiende:
arranca las temporadas con 67 mm de perfil contra 121, o sea que **compensa el
sesgo que al balance le queda con un invierno que evapora de más**. Dos errores
que se tapan no son un acierto, y elegir por el error contra los doce —con una
entrada, la lluvia de ERA5, que ni siquiera es la del trabajo— sería ajustar
contra el resultado.

---

## 7. Lo que se montó

- **`apps/terreno/lib/actividadRadicular.ts`** — la curva, su rango, la
  saturación, el mapeo de capas, el sesgo del dato, la validación contra la
  Figura 3 y el aviso con **las dos direcciones** (`sesgo_del_indice: 'alto'`,
  `sesgo_del_yp: 'bajo'`, porque un índice más bajo sube el `Yp` despejado).
- **`forrajeBalance.ts`** — `DiaDeBalance.actividad_radicular?: number[]`, uno
  por capa y por día. El factor del día manda sobre el de la capa, y la
  advertencia `sin_actividad_radicular` sale si falta por cualquiera de las dos
  vías.
- **`forrajeCorte.ts`** — `DiaDeSerie.t_suelo_30_90_c`, y `ventanaDeBalance`
  aplica el factor si toda la ventana lo tiene. **Media ventana con las capas
  cerradas y media con ellas abiertas se rechaza**, igual que con la `Eo`.
- **`forrajeAnios.ts`** — lo mismo en la cadena continua, más las nueve
  mediciones rehechas y la constante nueva.
- **Las dos rutas** piden `soil_temperature_28_to_100cm_mean` y devuelven
  `actividad_radicular`, y **el componente compara las dos antes de
  multiplicar**: si una corrió con factor y la otra no, los kilos no se muestran.

## 8. Lo que queda abierto

1. **El agua con la que arranca cada temporada seca.** Sigue siendo lo que más
   pesa en la cola, y la elección del invierno sigue sin validar.
2. **El escurrimiento nulo**, heredado de una planicie glaciada arenosa.
3. **El agua bajo el límite inferior** de la capa superficial.
4. **La lluvia de ERA5**, hasta 103 mm de diferencia con el pluviómetro en una
   temporada. No se arregla desde acá, y pone el piso de cuánto puede parecerse
   cualquier reconstrucción.
5. **Las dos capas con una sola temperatura.** La Figura 3 dice que la de 60-90
   debería valer 0,57 a 0,81 de la de 30-60 en primavera. Para partirlas haría
   falta un submodelo de temperatura por profundidad, que es fuente nueva.

## Fuentes

- Wight, J. R., y Hanks, R. J. (1981). «A water-balance, climate model for range
  herbage production». *J. Range Management* 34(4):307-311. DOI
  `10.2307/3897857`, handle `10150/646128`. **Figura 1** (p. 308) y **Figura 3**
  (p. 309).
- de Jong, E. (1974). *Modelling. VII. Soil water simulation models*. Tech. Rep.
  No. 61, IBP, Matador Project, Universidad de Saskatchewan. No digitalizado.
- de Jong, R. (1978). «Energy and the Forage Crop», p. 24-40, en J. D. McElgunn
  (ed.), *Pasture Systems for the Cow-Calf*, Agriculture Canada Research Station,
  Swift Current. No digitalizado.
- Hanks, R. J., Austin, D. D., y Ondrechen, W. T. (1971). «Soil temperature
  estimation by a numerical method». *Soil Sci. Soc. Am. Proc.* 35:665-667. Es el
  submodelo que los autores proponen como refinamiento.
- **ERA5-Land** vía Open-Meteo, `soil_temperature_28_to_100cm_mean`, CC-BY 4.0 de
  Copernicus.
- **NASA POWER / MERRA-2**, `TSOIL3` y `TSOIL4`, diario desde 1981.
