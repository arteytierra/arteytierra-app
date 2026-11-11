# El escurrimiento del balance de forraje

**10/11/2026.** Acta del lote que saca el supuesto de escurrimiento nulo del
balance de Wight y Hanks (1981). Lo montado está en
`apps/terreno/lib/escurrimientoForraje.ts`; esto es de dónde salió, qué se midió
y qué quedó afuera.

## La deuda

El trabajo original dice, en una línea: «In this study, we assumed there was no
runoff». Es razonable donde corrió —una planicie glaciada arenosa en Sidney,
Montana, donde el escurrimiento es marginal— y acequia lo heredaba **en
cualquier predio**, con cualquier pendiente y cualquier suelo. Estaba declarado
en `ADVERTENCIAS.escorrentia_nula` de `forrajeBalance.ts` y era, junto con el
agua bajo el límite inferior, la última de las degradaciones que empujaban el
índice `T/Tp` para arriba.

El encargo ponía tres caminos: pasarle el SCS-CN que el motor hidrológico del
predio ya calcula, buscar qué hicieron otros al llevar este balance a sitios con
pendiente, o decir que ninguna fuente cierra y dejar la elección declarada.

Cerró el segundo, y de la mejor manera posible.

## Lo que hizo el propio autor

Seis años después del artículo, **Wight publicó `ERHYM-II`** —*Ekalaka Rangeland
Hydrology and Yield Model*, USDA-ARS ARS-59, 1987—, que es este mismo balance
convertido en modelo de pastizal: la misma `Eo` de Jensen-Haise (1963), el mismo
`Kc`, la misma `Tp` como producto de un coeficiente por una curva de crecimiento
relativo, la misma `E = Ep/√t` con la evaporación del suelo limitada a los
primeros 300 mm, la misma extracción capa por capa desde arriba restringida por
densidad de raíces y temperatura. Y **escurrimiento diario por una curva número
modificada**.

O sea que no había que inventar cómo meterle escurrimiento a este balance: había
que averiguar qué hizo el que lo escribió.

Las ecuaciones de ERHYM-II están publicadas textualmente en la evaluación
independiente del modelo:

> Weltz, M. A., y Blackburn, W. H. (1993). «Modeling water balance with the
> ERHYM model on south Texas rangelands». *Water Resources Bulletin*
> 29(3):461-471.

que es la fuente que el código cita, porque es la que se pudo leer entera y la
que además **mide el error del método**.

```
[10]  Q = (P − 0,2·S)² / (P + 0,8·S)      si P > 0,2·S, si no Q = 0
[11]  S = Smx · (UL − Sm) / UL
[12]  Smx = 25400/CN_I − 254                   (mm; en pulgadas, 1000/CN − 10)
```

La 10 es la curva número de siempre. **La 11 es la que hace la diferencia**: la
retención máxima potencial no es una constante de tormenta de diseño sino una
función del agua que el perfil tiene ese día, que es justo lo que este balance ya
lleva en la mano. Con el perfil seco `S = Smx` y casi nada escurre; con el perfil
lleno `S = 0` y escurre toda la lluvia. Es también lo que hace SWAT por defecto
—su documentación llama a esa opción «calcular el CN diario como función de la
humedad del suelo»—, así que no es una rareza de ERHYM-II.

La 12 pide el `CN` de la condición antecedente **seca** (ARC I), y las tablas de
cobertura publican el de la media (ARC II). La conversión es la **Tabla 10-1 del
NEH-630**, transcripta fila por fila en `CN_DE_LA_TABLA_10_1`.

## Lo que el manual dice de su propio método

Hay que leerlo antes de celebrar nada. El cap. 10 del NEH-630 (2004), en la
sección que discute los límites del método:

> In the years following the development of the runoff equation, it has been
> adopted for use in applications that were not envisioned by the originator.
> Some of these applications are as an infiltration method for individual storm
> runoff events and **as a loss function for continuous simulation. Such
> applications are not within the intended usage of curve number procedures.**

El balance de forraje es exactamente eso. Así que esto no se monta como «ahora el
escurrimiento está bien»: se monta porque es lo que hizo el autor del balance, y
con la cota medida al lado.

## El caso resuelto

Ejemplos 10-1 y 10-2 del NEH-630: una tormenta de 4,3 pulgadas sobre pastura en
buen estado y suelo del grupo hidrológico C. El manual publica `CN = 74`,
`S = 3,51` pulgadas y tres escurrimientos, uno por condición antecedente:

| ARC | CN | Q publicado | % de la lluvia |
|---|---|---|---|
| I | 55 | 0,65 " | 15,1 |
| II | 74 | 1,82 " | 42,3 |
| III | 88 | 3,01 " | 70,0 |

Los tres se reproducen al segundo decimal de pulgada, y la `S` de la tabla sale
de la fórmula. Hay un cuarto test que compara la implementación contra
`escurrimientoSCS` de `cuenca.ts` —la misma ecuación escrita en función del `CN`
en vez de en función de `S`— en veinticinco combinaciones.

## La cota del método, medida por otros

Weltz y Blackburn encerraron en lisímetros no pesables —trincheras de 2,5 m con
doble plástico y aforador, parcelas de 5 × 7 m con el eje largo en el sentido de
la pendiente— tres matorrales de mezquite, tres interespacios de pastizal y tres
parcelas de suelo desnudo en La Copita, Alice, Texas. Suelo franco arenoso fino
del grupo **D**, perfil de 120 cm, sonda de neutrones cada dos semanas, 1985 con
890 mm de lluvia.

Con el `CN` de tabla del sitio —76 a 89 según la condición hidrológica— el
escurrimiento simulado salió **ocho a doce veces** el medido. Entonces
calibraron: de los 21 eventos de más de 12,7 mm despejaron un `CN` por evento,
que fue de 25 a 97, y usaron la mediana, **43**.

Con ese `CN` calibrado:

| parcela | ET med/sim | drenaje med/sim | escurrimiento med/sim |
|---|---|---|---|
| pastizal | 834 / 818 | 24 / 3 | **28 / 55** |
| matorral | 887 / 890 | 0 / 0 | **19 / 56** |
| suelo desnudo | 643 / 529 | 144 / 177 | 84 / 84 |

O sea **dos a tres veces de más** donde hay vegetación, con Nash-Sutcliff
negativo en las dos parcelas con plantas: el promedio de lo medido predice mejor
el escurrimiento anual que el modelo. En suelo desnudo da igual y el
Nash-Sutcliff sube a 0,83.

La forma del error también está publicada y es la que hay que esperar acá: el
método **subestima los eventos chicos** (menos de 25 mm) y **sobreestima los
grandes**, y simula aproximadamente la mitad de los eventos de escurrimiento que
hubo. La ecuación 11 es la causa: con el perfil seco `0,2·S` se come las lluvias
chicas enteras, aunque en el campo escurran igual porque la superficie se sella
en los primeros minutos.

Dos citas más del mismo trabajo: Wilcox y otros (1990) encontraron que la curva
número es un mal estimador del escurrimiento mensual y anual en cuencas de
matorral del centro de Idaho; Wood y Blackburn (1984) midieron que sobreestima el
escurrimiento el 67 % de las veces en los pastizales que evaluaron.

**Conclusión, que es lo que va al aviso:** el escurrimiento que sale es una
**cota superior**, así que el índice `T/Tp` es una **cota inferior** y el `Yp`
despejado de un corte es una **cota superior**.

## Lo que esto no arregla: la pendiente

Uno esperaría que meter escurrimiento resolviera el «cualquier pendiente» del
supuesto original. No lo resuelve, y conviene decirlo antes que después: **la
curva número no tiene término de pendiente**. Se compone de grupo hidrológico,
cobertura y condición hidrológica, y nada más. La documentación de SWAT lo dice
sin vueltas: «los números de curva de condición de humedad II que dan las tablas
se suponen apropiados para pendientes del 5 %».

Hay dos ajustes publicados y ninguno se montó:

- **Williams (1995)**, el que trae SWAT2012:
  `CN₂ₛ = (CN₃ − CN₂)/3 · [1 − 2·exp(−13,86·s)] + CN₂`. Se podría calcular con lo
  que acequia ya tiene —la Tabla 10-1 da `CN₃` y el DEM da la pendiente— pero
  **SWAT+ lo sacó**: su documentación dice que no ajusta los CN por pendiente y
  que si el usuario lo quiere lo haga antes de cargar el número. Un ajuste que el
  modelo que lo popularizó dejó de aplicar no es terreno firme.
- **Huang y otros (2006)**, calibrado en el Loess Plateau para pendientes del
  **14 al 140 %**. La mayoría de los predios de acequia están abajo del 14 %.

Así que la corrección corrige **suelo y cobertura**, y la pendiente sigue sin
entrar. En un predio empinado el escurrimiento real es mayor que el calculado, o
sea que por ese lado el índice sigue leyendo alto. Queda declarado en
`LA_TABLA_NO_TIENE_PENDIENTE`, no resuelto.

## Lo que mueve en Sidney: casi nada, y nada en la cola seca

El arnés es el de siempre, con la salvedad que el encargo anticipó: Sidney es
plano y arenoso, o sea el lugar donde el supuesto de escurrimiento nulo
probablemente esté bien. Sirve para comprobar que la corrección **no empeora**.

Como el `CN` sale del grupo hidrológico y nadie sabe el de Sidney en 1967, se
corrieron los cuatro. El de Sidney es el **A**.

```
                 esc/lluvia   esc por        contra los doce        distribución     Yp
                   anual      temporada    EAM   sesgo  techo    p10    mediana    kg/ha
  sin escurrir       0 %        0 mm      0,072  +0,070    3     0,452   0,820     1.449
  grupo A (49)     3,2 %      4,7 mm      0,072  +0,070    3     0,452   0,820     1.449
  grupo B (69)     4,4 %      7,7 mm      0,071  +0,069    3     0,452   0,820     1.449
  grupo C (79)     5,4 %     11,0 mm      0,069  +0,064    2     0,452   0,818     1.454
  grupo D (84)     6,2 %     13,7 mm      0,067  +0,059    2     0,452   0,806     1.482
```

**Tres cosas que esto dice.**

1. **En el grupo que Sidney tiene de verdad no mueve nada.** Con `CN 49` el índice
   de las doce temporadas publicadas sale igual hasta el tercer decimal. El
   escurrimiento existe —3,2 % de la lluvia— pero cae donde no cambia el
   resultado: en los días en que el perfil ya estaba lleno, que es agua que el
   balance contaba como **drenaje**. La prueba está en el drenaje acumulado de los
   66 años: **393 mm con `CN 49` y 0 mm con `CN 84`**. Lo que la curva número hace,
   sobre todo, es cambiarle el nombre a una pérdida que ya existía.

2. **No toca la cola seca.** El `p10` sale **0,452 con los cuatro grupos y sin
   escurrimiento**, idéntico. Es lo contrario de las tres degradaciones anteriores
   de este bloque, que movían justamente la cola. Y la cola seca es la que
   dimensiona la carga animal, así que **la carga no se mueve**. El motivo es la
   ecuación 11: en una temporada seca el perfil está vacío, la retención es máxima,
   y la poca lluvia que cae no llega a pasar la abstracción inicial. Lo que se
   mueve es la mediana y los años buenos.

3. **La fracción anual cae donde la literatura dice.** Con el grupo A da 3,2 % y
   con el B 4,4 %. Lo publicado para pastizales del oeste de Estados Unidos es
   **menos del 5 %** de la precipitación anual (Gifford 1975; Lauenroth y Sims
   1976; Wight y Neff 1983; Carlson y otros 1990) y lo medido en La Copita fue 3 a
   6 %. No es una validación —es una fracción agregada, no un evento— pero es la
   única cota de orden de magnitud que hay y el cálculo cabe adentro.

## Donde sí pesa, y por qué igual no cambia los kilos

Segundo píxel: la pampa argentina (−34,0 / −61,0), textura «fina» identificada
sin ambigüedad, temporada de 84 días desde el 1º de octubre.

```
               esc/lluvia anual   p10     mediana    Yp kg/ha
  sin escurrir       0 %         0,776    1,000       1.200
  grupo A (49)    10,1 %         0,776    1,000       1.200
  grupo B (69)    22,4 %         0,776    0,999       1.201
  grupo D (84)    25,9 %         0,765    0,995       1.205
```

El escurrimiento es **siete veces mayor** que en Sidney y el índice se mueve casi
nada igual, porque ahí el índice está contra el techo: la mediana es 1,000 y el
agua no limita. O sea que el escurrimiento pesa donde el forraje no lo nota, y no
pesa donde sí.

**Y destapa una inconsistencia adentro de acequia**, que queda declarada porque
es la clase de cosa que imprime dos números plausibles y distintos:
`coefEscorrentiaAnual` de `cuenca.ts` —la tabla orientativa que alimenta el
rendimiento de la represa— da **0,13** para el grupo B en pastizal, y este cálculo
diario da **0,224** en el mismo píxel. En Sidney pasa al revés: la tabla dice 0,08
para el grupo A y el cálculo diario da 0,032. Las dos cosas responden preguntas
distintas —una es una fracción media de diseño y la otra una simulación día por
día— pero difieren por un factor de 1,7 en un lado y 2,5 en el otro. No se
arregla en este lote.

## Las dos direcciones, que esta vez van al revés

La trampa de este bloque ya había mordido tres veces, y acá cambia de signo:

```
                          índice T/Tp      Yp despejado de un corte
  sin escurrimiento          ALTO                   bajo
  con escurrimiento          BAJO                   ALTO
```

La `Eo` de Jensen-Haise, el factor de actividad radicular y el agua inicial
medida bajaban el índice desde arriba. El escurrimiento lo baja **de más**,
porque el método escurre de más. Medido: con el grupo D de Sidney el `Yp`
despejado de un corte en el año de índice mediano sube de 1.449 a 1.482 kg/ha, un
2,3 %, y el índice mediano baja de 0,820 a 0,806.

Hay un test que verifica que la dirección declarada es la **contraria** a la de
`AVISO_ACTIVIDAD_RADICULAR` y `AVISO_AGUA_INICIAL`, y otro que verifica que
cuando se juntan el agua medida y el escurrimiento el `sesgoNeto` del corte sale
`ambos`, que es lo que corresponde cuando dos degradaciones empujan para lados
distintos.

**El cuarto guardarrail.** `CorteDeForrajeBloque.tsx` compara ahora las dos
corridas también por el escurrimiento, con la misma forma que la `Eo`, el factor
y el agua. Este es el que se paga dos veces: el `Yp` se despeja **dividiendo** por
el índice del año del corte, así que si el corte escurrió y la serie no, el `Yp`
viene inflado y se reparte sobre índices sin escurrir.

## El CN del predio, que es una decisión

El `CN` sale del grupo hidrológico del suelo —Saxton-Rawls sobre SoilGrids— con
la cobertura **pastizal en condición regular**, que es la misma decisión neutra
que ya toma `hidrologiaPredio.ts` cuando mapea el pastizal de WorldCover. Que las
dos coincidan no es casual: es un predio y un CN.

La condición hidrológica —cuánto suelo cubre el pastizal— no la declara nadie, y
la diferencia no es chica: en grupo B, 61 en buen estado, 69 regular y 79
sobrepastoreado. Está en `ADVERTENCIAS_ESCURRIMIENTO`.

## Lo que se encontró de paso, y no es de este lote

Midiendo esto apareció algo del lote anterior que hay que decir.

**La textura del píxel de Sidney hoy no se identifica.** El máximo de la serie de
humedad de ERA5-Land que Open-Meteo entrega da **0,430**, y el acta del
09/11/2026 anotó **0,434**. Con 0,430 la regla de `aguaDelPerfil.ts` queda ambigua
entre «media» (saturación 0,439) y «media-fina» (0,430), devuelve `null`, y la
ruta de índices **cae a la cadena continua**. En Swift Current pasó de 0,435 a
0,439. Lo más probable es que el reanálisis se haya revisado entre un día y el
otro.

> **No era eso. Corregido el 11/11/2026.** El reanálisis no se revisó: el máximo
> lo mueve **el huso horario con el que se pide la serie**. Open-Meteo entrega
> medias diarias y el huso define dónde empieza el día, mientras la saturación es
> un techo instantáneo, así que qué 24 horas se promedian cambia el resultado en
> ±4 milésimas. Sidney da 0,4340 en UTC y 0,4300 en `America/Denver`; Swift
> Current da 0,4350 en UTC y 0,4390 en hora local, o sea para el otro lado. Las
> dos mediciones eran correctas y medían pedidos distintos. Y el huso de la ruta
> **no se cambia**, porque el balance necesita que el día sea el día local: la
> lluvia de un día y la evapotranspiración de ese día tienen que ser del mismo
> día. Lo que se cambió es la regla. Ver `_research/FORRAJE_TEXTURA.md`.

Y hay algo peor, que no depende del dato sino de la aritmética de la regla.
Barriendo todos los máximos posibles de tres en tres milésimas, las clases que la
regla puede devolver son:

```
  gruesa       0,350 – 0,406
  (ninguna)    0,407 – 0,433
  media        0,434 – 0,442
  fina         0,443 – 0,523
  muy-fina     0,524 – 0,617
  organica     0,618 – 0,769
```

**«media-fina» no sale nunca**, para ningún máximo, y «media» sale sólo en una
ventana de nueve milésimas. El motivo es que las saturaciones de esas dos clases
están a 0,009 una de la otra y el criterio de desempate pide 0,02, así que
mientras las dos sean candidatas ninguna gana. Sidney cayó justo ahí.

Esto degrada de forma honesta —cae a la cadena, con la advertencia puesta— pero
deja el camino principal del lote anterior apagado en buena parte del mundo, y
los números del acta de ese lote (+0,061 de sesgo) **no reproducen**: con la clase
«media» forzada, hoy dan +0,070. Las mediciones de este lote son todas de la
misma corrida, así que entre ellas se comparan.

Quedó un encargo aparte para eso. No se tocó `aguaDelPerfil.ts` en este lote.

## Lo que quedó abierto

- **El agua bajo el límite inferior** de la capa superficial, que es la última de
  las degradaciones originales del balance que empuja el índice para arriba.
- **La lluvia de ERA5**, que difiere del pluviómetro hasta 103 mm en una
  temporada, y 1971 con ella.
- **La pendiente**, que la curva número no tiene y que ninguno de los dos ajustes
  publicados resuelve con fuente firme.
- **El sellado superficial**: la ecuación 11 mira el agua de los 90 cm enteros, así
  que una capa profunda seca mantiene la retención alta aunque la superficie esté
  saturada. El suelo real se sella arriba.
- **La inconsistencia con `coefEscorrentiaAnual`**, medida más arriba.
- ~~**La identificación de textura**, que es del lote anterior y está arriba.~~
  **Arreglada el 11/11/2026**, y el diagnóstico de acá arriba estaba errado: no era
  el dato revisado sino el huso horario. Ver `_research/FORRAJE_TEXTURA.md`. Sidney
  vuelve a identificar —`media-fina`, con `media` en duda declarada— y los +0,070
  de sesgo que este lote midió con la clase forzada son los que la ruta devuelve
  ahora.
