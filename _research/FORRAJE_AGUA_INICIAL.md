# El agua con la que arranca la temporada

**10/11/2026.** Qué se buscaba, qué se encontró y qué quedó montado, sobre la
decisión más frágil que tenía el motor de forraje: con cuánta agua arranca cada
temporada el balance de Wight y Hanks (1981).

Lo que se montó está en `apps/terreno/lib/aguaDelPerfil.ts`. Esto es la
trazabilidad.

---

## 1. La deuda

El modelo arranca el 15 de abril con el `SWS` del perfil, y ese número es el que
más mueve el resultado. Wight y Hanks lo **medían con sonda de neutrones**;
acequia no tiene sonda, y lo venía resolviendo de dos formas, las dos declaradas
y las dos flojas:

- **El corte suelto** devolvía una banda entre el perfil seco y el lleno. En una
  temporada seca la banda se abre tanto que no sirve para dimensionar nada.
- **La serie larga** corría una cadena continua: el balance sigue corriendo
  fuera de temporada con `b = 0` para que el arranque se olvide. El precio es
  que **toda la demanda del invierno entra como evaporación de suelo**, cosa que
  nadie publicó, y medido, según cómo se tratara esa demanda el `p10` de la
  distribución **se movía 3,3 veces**.

Y había un número contra el que comprobar: después de montar el factor de
actividad radicular (commit `a9f5d66`), la cadena seguía leyendo **+0,132**
contra los doce índices `T/Tp` que la Tabla 1 del trabajo publica, con el resto
concentrado en las tres temporadas que el trabajo arrancó con el perfil seco
—1977, 1968 y 1971—, que la cadena arrancaba con 132, 88 y 137 mm de los 150.

---

## 2. La Figura 5, que publica el dato medido

El encargo la nombraba como camino 2, para digitalizar. Resultó ser el camino
principal, porque es **el único caso resuelto que existe** para esto.

La figura (p. 310) trae **cuatro temporadas —1967, 1968, 1969 y 1977— con tres
paneles cada una**, uno por capa de 30 cm, con el agua medida con sonda
(círculos, quincenal) y la predicha por el modelo (línea), de abril a
septiembre. Dos de esas cuatro, **1968 y 1977**, son dos de las tres temporadas
donde la cadena quedaba más lejos.

### Cómo se abrió

Lo de siempre con el escaneo de Arizona: `curl` con `?download=true` y la
cabecera `Referer` de la página del ítem; cada página guardada como ~49 tiras de
3.648 × 71 px en 1 bit que hay que coser en orden. La receta completa está en
`FORRAJE_ACTIVIDAD_RADICULAR.md`.

### Cómo se digitalizó

Los doce paneles tienen marco propio. Se calibró cada uno con sus marcas de eje:

- **Eje y**: las marcas de 25, 50 y 75 mm están a 64 px de distancia exacta, o
  sea 2,56 px por mm, y el cero cae en la línea de abajo del panel.
- **Eje x**: siete marcas equiespaciadas a 221,8 px. Los rótulos de mes caen
  **entre** las marcas, no debajo de ellas, así que las marcas son los primeros
  de abril, mayo, junio, julio, agosto, septiembre y octubre. La conversión a
  día usa el largo real de cada mes.

La línea predicha se trazó partiendo de la componente conexa más grande y
extendiéndola a los costados por continuidad —el truco que hizo falta porque los
círculos la cortan—, y los círculos medidos salieron del etiquetado de
componentes, filtrando por caja casi cuadrada de 9 a 18 px.

### Lo primero que salió no fue una comparación

Fue la **confirmación de un supuesto**. La envolvente de cada capa sobre las
cuatro temporadas:

| Capa | Mínimo | Máximo | Rango |
|---|---|---|---|
| 0-30 cm | 16,2 mm | 73,8 mm | 57,6 |
| 30-60 cm | 28,9 mm | 82,2 mm | 53,3 |
| 60-90 cm | 32,8 mm | 82,2 mm | 49,4 |

O sea **unos 50 mm de agua útil por capa**, 150 en el perfil de 90 cm, que es
exactamente lo que el arnés venía suponiendo **sin respaldo** y estaba declarado
como decisión nuestra. La capa superficial tiene más rango porque el trabajo la
deja secar por debajo del punto de marchitez, hasta el contenido de suelo seco
al aire, cosa que el propio artículo dice en la p. 309.

---

## 3. De dónde sale el agua en un predio cualquiera

De **ERA5-Land**, en el mismo pedido a Open-Meteo que ya trae la lluvia, la
radiación y la temperatura del suelo: `soil_moisture_0_to_7cm_mean`,
`7_to_28cm_mean` y `28_to_100cm_mean`, en m³/m³, diarias desde 1940. En Sidney,
23.742 días sin un solo nulo.

### El problema: contenido volumétrico no es agua útil

Hay que restarle el límite inferior y dividir por el rango que la planta puede
sacar, y esos dos números son del modelo de suelo que corre adentro de ERA5-Land,
que es **H-TESSEL**. Están publicados en la **Tabla 8.9 del IFS Documentation
CY45R1, Parte IV, cap. 8.6.2**:

| Textura | θsat | θcap | θpwp | θres | Agua útil |
|---|---|---|---|---|---|
| Coarse | 0,403 | 0,244 | 0,059 | 0,025 | 0,185 |
| **Medium** | **0,439** | **0,347** | **0,151** | 0,010 | **0,196** |
| Medium-Fine | 0,430 | 0,383 | 0,133 | 0,010 | 0,251 |
| Fine | 0,520 | 0,448 | 0,279 | 0,010 | 0,170 |
| Very Fine | 0,614 | 0,541 | 0,335 | 0,010 | 0,207 |
| Organic | 0,766 | 0,663 | 0,267 | 0,010 | 0,396 |

El PDF de la documentación son 12 MB y la descarga se corta: sale con
`curl --ssl-no-revoke -C -` repetido hasta que devuelve 416, y el texto se extrae
con `pypdf`.

### El problema de abajo del problema: qué textura le tocó al píxel

El mismo capítulo dice que **H-TESSEL usa la textura dominante de cada punto**,
del mapa de la FAO. Ese campo (`slt`, paramId 43) se distribuye por el CDS de
Copernicus y **no viaja por Open-Meteo**.

La salida fue leerla de la propia serie: el contenido volumétrico **no puede
pasar la saturación de su clase**, y en décadas alguna vez la toca. Probado en
cuatro píxeles de climas distintos:

| Sitio | Máximo de la serie | Clase | θsat | Margen al segundo |
|---|---|---|---|---|
| Sidney, Montana | 0,434 | media | 0,439 | 0,081 |
| Swift Current, Saskatchewan | 0,435 | media | 0,439 | 0,081 |
| Pampa argentina (−34,0 / −61,0) | 0,515 | fina | 0,520 | 0,094 |
| Quindío, Colombia | 0,438 | media | 0,439 | 0,081 |

En los cuatro el máximo cae a **cinco milésimas** de la saturación de una clase y
a más de ocho centésimas de la siguiente. No es un ajuste fino: es una huella.
Verificación que no entra en la decisión: el percentil 1 de la capa profunda de
Sidney da **0,157** contra el 0,151 publicado del punto de marchitez.

Dónde falla: serie corta o píxel que nunca se satura. Ahí `texturaDelPixel`
devuelve `null`, no se siembra y vuelve la banda.

### La geometría, que cuesta

Las tres capas del modelo contra las cuatro del reanálisis. La de 0-30 cm se arma
pesando 7/30, 21/30 y 2/30; las de **30-60 y 60-90 caen las dos adentro de la de
28-100 cm y reciben la misma humedad**. Es la misma pérdida que ya tenía la
temperatura, y la Figura 5 la muestra con un caso: el 25 de abril de 1967 publica
la capa de 30-60 al **71 %** de su agua útil y la de 60-90 al **4 %** —un frente
de mojado que todavía no bajó— y el reanálisis le da **31 %** a las dos. El
perfil total igual cierra (77 contra 80 mm) porque los dos errores se compensan.

---

## 4. El caso resuelto, medido

158 círculos digitalizados, cuatro temporadas, tres capas, en fracción de agua
útil:

| Capa | n | Sesgo | EAM |
|---|---|---|---|
| 0-30 cm | 50 | +0,074 | 0,161 |
| 30-60 cm | 66 | +0,033 | 0,145 |
| 60-90 cm | 42 | +0,031 | 0,119 |
| **Todas** | **158** | **+0,046** | **0,143** · r = 0,768 |

**ERA5-Land lee húmedo**, y el doble en la superficie que abajo, que es lo
esperable: ahí el suelo real baja del punto de marchitez y el reanálisis se
recorta en cero. El sesgo de +0,046 son unos **7 mm sobre 150**.

Y en el día que decide todo —con cuánta agua arranca la temporada— el error es
más chico y **no tiene signo**:

| Temporada | Día | Medido | ERA5-Land | Cadena de acequia |
|---|---|---|---|---|
| 1967 | 25 de abril | 80,1 mm | 76,8 | 129,9 |
| 1968 | 15 de abril | 53,1 mm | 69,2 | 90,0 |
| 1969 | 14 de abril | 109,4 mm | 110,7 | 138,9 |
| 1977 | 12 de abril | 76,0 mm | 58,1 | 132,2 |

- **ERA5-Land**: sesgo −0,95 mm, EAM **9,65 mm sobre 150**.
- **La cadena que simula el invierno**: **+43,1 mm**, las cuatro para el mismo
  lado.

---

## 5. El control independiente, que no confirma

Con la temperatura del suelo el patrón fue: antes de creerle al reanálisis,
preguntarle a otro. Acá el control **no cierra**, y va con el número antes que
escondido.

MERRA-2, por NASA POWER, publica `GWETROOT` y `GWETPROF` desde 1981. Contra el
15 de abril de ERA5-Land, 44 temporadas:

- **r = 0,695**. Sin la tendencia de cada uno, 0,713; con abril entero en vez de
  un día, 0,719; de Spearman, 0,659.
- De los **seis arranques más secos**, los dos modelos **no comparten ninguno**:
  ERA5-Land dice 2021, 1988, 2016, 2008, 1991 y 2012; MERRA-2 dice 1990, 1981,
  1984, 1985, 2004 y 2005.

Las escalas no son la misma —`GWETROOT` es grado de saturación, 0 seco y 1
saturado, no fracción de agua útil— así que la comparación es por correlación y
por orden, que no dependen de la escala.

**Por qué igual se usa ERA5-Land**: es el único de los dos que tiene contra qué
medirse. La Figura 5 publica agua medida con sonda de 1967 a 1977 y MERRA-2
empieza en 1981. Entre un dato que cierra contra una medición de campo y otro
que no se puede probar, se usa el que cierra y se declara que el otro discrepa.

Lo que esto acota es **la confianza en una temporada puntual**, no la
distribución de las 65.

---

## 6. Lo que pasó al montarlo

Mismas 65 temporadas de Sidney, misma `Eo`, mismo factor de actividad radicular,
misma ventana. Lo único que cambia es con qué agua arranca cada temporada.

### Contra los doce publicados

|  | EAM | Sesgo | En el techo | r |
|---|---|---|---|---|
| Cadena con invierno | 0,133 | +0,132 | 4 de 12 | 0,704 |
| **Sembrada del dato** | **0,064** | **+0,061** | **2 de 12** | **0,858** |

El error se parte al medio. Y las dos temporadas secas que la Figura 5 cubre se
acomodan solas:

| Año | Publicado | Cadena | Sembrada |
|---|---|---|---|
| 1977 | 0,402 | 0,879 | **0,443** |
| 1968 | 0,564 | 0,719 | **0,608** |
| 1971 | 0,577 | 0,957 | 0,942 ← no se mueve |

### 1971, que es lo que queda

El reanálisis dice que 1971 arrancó con **88 mm de los 150**: para ERA5-Land no
fue una temporada de perfil seco. Nuestra `Tp` de esa temporada da 131,5 contra
137 publicados —bien— y la `T` da **123,8 contra 79**. O sea que el modelo
encontró agua que el modelo del trabajo no tenía.

Y hay una coincidencia que hay que nombrar: 1971 es **la temporada donde la
lluvia de ERA5 más difiere del pluviómetro del trabajo** de las doce. ERA5 da
**243,5 mm** donde el pluviómetro midió **141**: un 73 % más.

| Año | ERA5 | Pluviómetro | Diferencia |
|---|---|---|---|
| 1971 | 243,5 | 141 | **+102,5** |
| 1978 | 309,0 | 220 | +89,0 |
| 1969 | 261,7 | 338 | −76,3 |
| … | | | |

No es prueba: sobre las otras once temporadas el residuo **no** correlaciona con
la diferencia de lluvia (r = 0,08). Pero es la coincidencia que hay, y sin 1971
el error contra los once restantes es **EAM 0,037 y sesgo +0,033**.

### En la distribución de las 65 temporadas

|  | n | p10 | mediana | p75 | ancho |
|---|---|---|---|---|---|
| Cadena | 63 | 0,672 | 0,935 | 0,975 | 1,47 |
| Sembrada | **65** | **0,451** | **0,831** | 0,938 | **2,18** |

Vuelven las dos primeras temporadas, que la cadena descartaba porque el arranque
todavía pesaba. El agua al rebrote pasa de 120,7 mm de promedio a **79,6**, con
una diferencia media de +41,1 mm que llega a +80 y nunca va para el otro lado
(mínimo −2,8).

### En los kilos, y las dos direcciones

El cociente depende de en qué año se tomó el corte del que sale el `Yp`, así que
va la mediana sobre los 65 posibles años de corte:

| | ×, mediana | p10 | p90 |
|---|---|---|---|
| Forraje del año del p10 | **0,74** | 0,67 | 0,99 |
| Forraje del año de la mediana | 0,98 | 0,89 | 1,31 |
| Forraje del año del p90 | 1,10 | 1,00 | 1,46 |

**No es un corrimiento parejo: la distribución se abre.** La cola seca baja un
cuarto y los años buenos suben un décimo. Para dimensionar carga animal manda el
primero, y va para el lado conservador.

Y la trampa de siempre, declarada en las dos direcciones: el dato lee **+0,046
de agua útil alto**, así que el índice sigue leyendo **alto** (+0,061 contra los
doce, contra +0,132 de antes) y el `Yp` que se despeja dividiendo por el índice
sigue saliendo **bajo**. Con un corte en el año de índice mediano, el `Yp`
despejado sube un **15,6 %**.

---

## 7. Lo que se cayó de arriba

Sembrar la temporada **saca el invierno del cálculo**, y con él se caen dos
degradaciones declaradas:

**El invierno.** `EL_INVIERNO_DECIDE_LA_COLA_SECA` medía que el `p10` se movía
3,3 veces según cómo se tratara la demanda atmosférica de fuera de temporada.
Con el agua medida, «Jensen-Haise todo el año» y «el híbrido» pasan a ser
**literalmente la misma corrida** —p10 0,451 los dos, EAM 0,0641 contra
0,0640—, porque lo único que los distinguía era la `Eo` de fuera de temporada.
Lo que queda separando al tercero es sólo la `Eo` de adentro:

```
                                   p10     mediana   EAM contra los 12
  Jensen-Haise (y el híbrido)     0,451     0,831    0,064  (+0,061)
  ETo de FAO-56                   0,372     0,690    0,087  (−0,032)
```

**El p10 pasa de moverse 3,3 veces a 1,21.** Y la incomodidad del lote anterior
—que el híbrido medía mejor que el elegido compensando un sesgo con otro— se
disuelve: el híbrido **es** el elegido.

**La nieve.** `LA_NIEVE_NO_SE_ACUMULA` acotaba el error de que el agua del
deshielo entre al perfil el día que nevó. Con el agua medida, diferir el deshielo
mueve el `p10` y la mediana **0,00 %**: exactamente cero. La nieve nunca molestó
adentro de la temporada; molestaba en el invierno que la cadena simulaba para
llegar al 15 de abril.

---

## 8. Las nueve mediciones de Sidney, rehechas

Todas se volvieron a correr con el agua sembrada. Lo que cambió:

| Medición | Con la cadena | Con el agua medida |
|---|---|---|
| Temporadas que sirven | 63 | **65** |
| Agua al rebrote, promedio | 121,1 mm | **79,6 mm** |
| Distribución: p10 / mediana / ancho | 0,672 / 0,935 / 1,47 | **0,451 / 0,831 / 2,18** |
| Años bajo el promedio | 28,6 % | **41,5 %** |
| R² contra la lluvia de la temporada | 0,428 | **0,546** |
| R² contra la lluvia del año | 0,256 | 0,265 |
| Tendencia por década / R² | −0,009 / 0,010 | −0,021 / **0,033** |
| Peor año: 1988, índice / agua inicial | 0,161 / 32,3 mm | 0,166 / **30,7 mm** |
| Cinco peores | 1988, 1980, 1984, 1990, 2021 | 1988, 1980, 1990, 2021, **2008** |
| Cinco mejores | 2011, 1978, 1976, 1972, 1970 | 2011, 1978, 1972, 1970, **1996** |
| Ventana ±15 días: mediana / p10 | 1,00 / 1,10 y 0,96 / 0,76 | 0,97 / 1,11 y 0,87 / 0,80 |

Tres cosas para leer de ahí:

1. **El 41,5 % de años bajo el promedio** se acerca bastante más al «al menos la
   mitad» que publica Lyons y Machen. La asimetría que falta es el techo del
   índice, que sigue estando.
2. **La lluvia de la temporada explica más** (0,43 → 0,55) porque con el perfil
   casi lleno todos los años la lluvia tenía menos de qué decidir. Sigue sin
   alcanzar, que es lo que esa constante existe para decir.
3. **La tendencia por década se duplicó y sigue sin existir**: 3,3 % de la
   varianza, y el `p10` sigue apuntando al revés —0,406 en la primera mitad
   contra 0,515 en la segunda—.

Y una que cambió de forma y hubo que reescribir el test: con el agua medida
**la mediana del índice nunca sube** al mover la ventana, ni siquiera
adelantando el arranque o acortando la temporada. El mecanismo es del modelo:
adelantar quince días siembra el perfil con el de fines de marzo, más seco y más
frío, y acortar a 68 días deja la temporada entera en la parte del año donde la
actividad radicular de las capas profundas todavía está cerrada. El `p10` sí
sube, y es el único de los dos que cambia de signo.

---

## 9. Qué quedó montado

- **`lib/aguaDelPerfil.ts`** (nuevo): las fuentes, la Tabla 8.9, la
  identificación de la textura, la geometría de las capas, el caso resuelto, el
  control que no confirma, las advertencias y el aviso con las dos direcciones.
  Funciones: `texturaDelPixel`, `fraccionDeAguaUtil`, `aguaUtilDelPerfil`,
  `aguaInicialPorCapaMm`, `humedadDeLaSerie`, `avisoDelAguaInicial`.
- **`lib/forrajeCorte.ts`**: `DiaDeSerie.agua_util_por_capa`,
  `VentanaDeBalance.agua_inicial_util`, y `ypDelCorte.agua_inicial_por_capa_mm`,
  que convierte la banda en un punto y deja sin efecto el calentamiento.
- **`lib/forrajeAnios.ts`**: si **todas** las ventanas traen el dato, cada
  temporada corre sola sembrada de ahí; si falta en alguna, vuelve la cadena
  entera. Es todo o nada. `IndicesPorAnio.agua_inicial_medida` lo informa.
- **Las dos rutas de `clima-diario`** piden la humedad de suelo. La de `ventana`
  no puede identificar la textura con 420 días, así que la saca del mismo pedido
  largo que ya hacía para las normales de la `Eo`.
- **`CorteDeForrajeBloque.tsx`**: tercer guardarrail. Si una corrida arrancó con
  el agua medida y la otra no, los kilos no se muestran.

## 10. Lo que queda abierto

1. **1971**, y con ella la lluvia de ERA5, que difiere del pluviómetro hasta
   +103 mm en una temporada. No se arregla desde acá: haría falta la serie del
   pluviómetro del sitio.
2. **El escurrimiento nulo**, que el trabajo asumió en una planicie glaciada
   arenosa y acequia hereda en cualquier pendiente.
3. **El agua bajo el límite inferior** de la capa superficial, que nadie declara.
4. **Partir las capas de 30-60 y 60-90**, que hoy comparten humedad y
   temperatura. Pide un submodelo por profundidad, que es otra fuente.
5. **El segundo modelo que no confirma**: si aparece una tercera fuente de
   humedad de suelo con medición de campo detrás, vale la pena volver.
