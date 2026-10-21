# Encargo de forraje — lotes 17, 18 y 19

**Para:** una conversación nueva de GPT con búsqueda web.
**Salida:** **tres** archivos, `17.json`, `18.json` y `19.json`, los tres con la
forma de la sección 7.
**Fecha del encargo:** 21/10/2026.

> **Cómo usar este documento.** Son tres encargos distintos con reglas
> compartidas. Entregá **uno por vez y en este orden**: primero `17.json`,
> después `18.json`, después `19.json`. Cada archivo tiene que ser autónomo —no
> «ver el anterior»— y cada uno responde a su propia sección. El 17 es el más
> importante de los tres por lejos: si sólo llegás a hacer uno bien, que sea ése.

---

## 1. Qué es esto

acequia es una app que calcula cuántos animales aguanta un campo. Ese número sale
hoy de una función que mira **una sola variable**, la lluvia anual, y devuelve uno
de cinco escalones. No tiene fuente. Si se equivoca no se cae: imprime un número
plausible y alguien compra vacas con eso.

Vengo armando el archivo de mediciones publicadas que la va a reemplazar.
Dieciséis lotes. **Veinte mediciones en ocho biomas**, cada una con su método, su
unidad literal, su rango de validez y un test que la vuelve a derivar de la
fuente. Más dos series de años consecutivos y tres pares de manejo.

Leé la sección 2 antes de buscar nada: el lote 16 cambió la pregunta.

---

## 2. Lo que encontró el lote 16, porque cambia el objetivo

Trajiste cuatro cosas y tres sirvieron mucho. Pero el hallazgo no estaba pedido y
hay que entenderlo para que estos tres lotes tengan sentido.

### a. La capa que mi app predice no responde a la lluvia

La Tabla 2 de Jobbágy y Sala (2000) —la serie de Río Mayo que trajiste— publica
las dos capas **separadas todos los años**: gramíneas y arbustos. Ajustando cada
una contra la lluvia anual, en g/m²/año contra mm:

| lo que se ajusta | ordenada | pendiente | r² | n |
|---|---|---|---|---|
| **gramíneas** | 24,6 | **0,024** | **0,015** | 15 |
| arbustos | 10,0 | 0,125 | 0,728 | 10 |
| total | 34,4 | 0,141 | 0,346 | 10 |

Mi función predice **forraje**: la capa herbácea, lo que una vaca come. En ese
sitio la lluvia anual explica el **1,5 %** de la variación del forraje y el **73 %**
de la de la leñosa. Y la correlación del total —la que se ve si no se separan las
capas, y la que vos reportaste— sale **enteramente de los arbustos**.

El trabajo lo dice: *«The differential effect of precipitation on grass and shrub
ANPP masked the association when these functional groups were pooled»*.

En el CPER del lote 15, donde la columna medida sí es forraje, la lluvia explica
el 39 %. Así que no es que la lluvia nunca sirva: **deja de servir donde hay
leñosas compitiendo por el agua profunda**, que es buena parte de los campos que
mi app analiza.

**Eso es ahora la pregunta principal, y es el lote 17.**

### b. La memoria ya tiene coeficiente, así que ese frente está cerrado

Trajiste Oesterheld et al. (2001): `ANPP(t) = 14,8 + 0,13 pp(t) + 0,41 ANPP(t−1)`,
r² = 0,58, n = 47. Está montado. **No busques más retardos**: con uno alcanza para
saber la forma, y lo que falta no es otro coeficiente.

De paso: escribiste que esa ecuación no se podía re-ajustar con lo que tengo,
porque mi serie guarda forraje aire-seco y no ANPP. **Se podía.** La ecuación 1
del mismo trabajo del que sale la serie —`ANPP = 46 + 0,76 × forraje`— pasa de una
columna a la otra, y ya estaba montada. Con eso el ajuste dio 14,92 + 0,1303 pp +
0,4085 ANPP(t−1), r² = 0,581, F(2,44) = 30,5, n = 47: los siete números
publicados. De ahí sale la **regla T**.

### c. Lo que invertiste, y por qué importa tanto

**Pusiste los arbustos donde van las gramíneas, en las trece filas.** La Tabla 2
tiene *Grass ANPP* primero y *Shrub ANPP* segundo; asignaste el primer valor a los
arbustos. Los trece totales y las trece lluvias estaban bien.

No es un detalle de presentación. Con el orden invertido, el hallazgo de la
sección 2a sale **exactamente al revés**: parecería que el forraje responde con
r² = 0,73 y la leñosa no. Y los años 1990, 1991 y 1992, que describiste como «solo
arbustos disponible», son lo contrario —sólo gramíneas—, que son los tres años de
forraje puro de la serie.

También dejaste afuera dos filas que la tabla tiene, 1972 y 1975. De ahí sale la
**regla S**.

### d. El cuello de botella ya no es encontrar: es ubicar

De los tres pastizales sudafricanos que entraron —29, 27 y 30 temporadas medidas—
**ninguno alimenta un número en pantalla**, y por tres motivos distintos:

- **Bloemfontein:** la serie junta dos lugares a 5 km y los trata como un
  conjunto, y la única coordenada publicada no cae en ninguno de los dos.
- **Ukulinga:** la coordenada publicada tiene **los dos números permutados** —
  29°24′ E / 30°24′ S cae a 250 km de la granja que la propia fuente nombra en
  KwaZulu-Natal—. El error es de la fuente, no tuyo: lo reportaste tal cual y la
  frase del texto lo delató, que es exactamente para lo que existe la regla M.
- **Towoomba:** su píxel es arbustal estable, pero el ensayo **desmontó todas las
  leñosas en 1949**.

De ahí salen las reglas **U** y **V**, y buena parte del lote 19.

### e. Y el tercer sitio que no trajiste era el mejor

La tabla de Swemmer tiene **tres** sitios y entregaste dos. El que faltaba,
Towoomba, cerró una pregunta que venía del lote 05 y aportó el único píxel de
arbustal estable del archivo después de Lesbos. **Cuando una tabla tiene tres
filas comparables, van las tres** — regla U.

---

# LOTE 17 — la capa herbácea medida aparte de la leñosa

**Esto es lo más importante que te puedo pedir hoy.** Un solo sitio sostiene el
hallazgo de la sección 2a, y si se confirma en tres o cuatro sitios cambia el
diseño del reemplazo de mi función.

## 17.a Qué busco, exactamente

Trabajos que publiquen, **para el mismo sitio y los mismos años**, la producción
primaria neta aérea **de la capa herbácea y de la capa leñosa por separado**, con
la lluvia de cada año.

El caso ideal es una serie de cinco años o más, como la de Río Mayo. Pero sirve
también un solo año si las dos capas están separadas y hay varios sitios
comparables en la misma tabla.

**Lo que decide si sirve:** que se pueda ajustar la capa herbácea contra la lluvia
por separado. Si la fuente publica sólo el total, no sirve para esto.

## 17.b Dónde mirar

Sistemas donde las dos capas coexisten y compiten, que es donde el fenómeno se da:

- **Estepas y matorrales áridos y semiáridos.** El resto de Patagonia (otros
  distritos fitogeográficos: Central, Subandino, Magallánico), el Monte argentino,
  la Puna, el Chaco árido. INTA y la Universidad de Buenos Aires (IFEVA)
  publicaron mucho de esto y bastante está abierto.
- **Sabanas y bushveld**, donde el reparto árbol/pasto es *el* tema de la
  disciplina. Nylsvley tiene series de años; también Kruger, el Serengeti,
  Lamto en Costa de Marfil, y los sitios de la red SAFARI.
- **Matorral mediterráneo y chaparral**: California, Chile central, la cuenca
  mediterránea, el fynbos y el karoo sudafricanos.
- **El desierto de Chihuahua y el Gran Cuenca**: Jornada Basin LTER y Sevilleta
  LTER publican producción por grupo funcional, y el Jornada tiene series largas.
- **La red NutNet (Nutrient Network)** y los sitios LTER en general: muchos
  publican biomasa por grupo funcional y por año.

## 17.c La trampa de este frente, y hay que decirla

Hay dos formas de separar capas y **no son la misma cosa**:

1. **Por grupo funcional dentro de la misma parcela**: se cosecha todo y se separa
   gramíneas, hierbas, arbustos. Esto es lo que sirve.
2. **Por tipo de parcela**: parcelas debajo de la copa contra parcelas en el
   claro. Esto mide otra cosa —el efecto del dosel— y ya lo tengo montado de
   Manitou, con un factor 13. **No lo confundas con lo anterior.** Si la fuente
   hace esto, decilo en `que_cuenta` y no lo presentes como capas separadas.

Y una tercera: si la fuente mide la leñosa por **elongación de ramas** sin contar
engrosamiento —como hace Jobbágy— la cifra leñosa está sesgada baja y lo declara.
Copiá esa declaración.

## 17.d Lo que tiene que traer cada entrada del lote 17

Además de todo lo de la sección 7:

- `serie_por_anio` con, por cada año, **la capa herbácea y la leñosa en campos
  separados y rotulados**, más la lluvia de ese año;
- el **orden de las columnas de la fuente**, textual, en `verificacion` — por la
  regla S;
- si la fuente ajustó alguna relación entre capas o entre capa y lluvia, va con
  todo y la verificás por re-ajuste (regla P).

---

# LOTE 18 — cuánto vale el manejo, con el clima quieto

## 18.a Por qué, con el número que lo justifica

El lote 16 montó tres pares de parcelas vecinas del mismo sitio, mismo clima, 27 a
30 años:

| sitio | qué cambia | control | tratado | factor |
|---|---|---|---|---|
| Bloemfontein | el estado del pastizal | 138 | 43 | **0,31** |
| Towoomba | nitrógeno y fósforo | 137 | 519 | **3,79** |
| Ukulinga | nitrógeno y fósforo | 323 | 562 | **1,74** |

**El rango del manejo es un factor 12.** En el CPER, cincuenta años de lluvia de
107 a 588 mm mueven la producción un factor 5,8. **El manejo pesa más que toda la
variación climática de medio siglo en un sitio**, y mi función no tiene dónde
ponerlo.

## 18.b El problema de esos tres, y lo que hace falta

Dos de los tres son **fertilización con dosis altas** —151 y 212 kg N/ha/año—, que
no es lo que decide un productor regenerativo. El tercero, el de Bloemfontein, es
el que sirve, y es uno solo.

**Lo que busco son pares control/manejo del mismo sitio donde lo que cambia sea
el PASTOREO.** En orden de utilidad:

1. **Carga animal**: el mismo campo con dos o tres cargas, varios años, con la
   producción de forraje medida en cada una. Los ensayos de carga de larga
   duración son un clásico: el CPER tiene uno (light/moderate/heavy), también el
   Jornada, el Charleville en Australia, los de INTA Anguil y Santa Cruz.
2. **Pastoreo rotativo contra continuo**, con producción medida y no sólo con
   ganancia animal. Hay docenas de trabajos y la mayoría mide el animal; necesito
   los que midan el pasto.
3. **Exclusión**: clausura contra pastoreado, varios años. Esto abunda y es el más
   fácil de encontrar.
4. **Descanso o diferimiento**: pastoreo en distintas estaciones.
5. **Estado o condición del pastizal**, como el par de Bloemfontein: bueno,
   regular y malo, en el mismo sitio.

## 18.c Qué tiene que traer cada par

- las dos (o tres) cifras de producción, **en la misma unidad y con el mismo
  método**;
- la lluvia del sitio, que es la misma para las dos parcelas;
- **la carga, con unidades**: animales por hectárea, kg de peso vivo por hectárea,
  o días-animal por hectárea. Sin unidad no sirve.
- los años promediados;
- la **cobertura basal o de copa** de cada tratamiento, si la fuente la publica
  con su método — por la regla N. En la tabla de Swemmer estaba y me dijiste que
  no. Mirala dos veces.
- si el tratamiento cambió el suelo o la composición de especies con el tiempo, la
  frase de la fuente que lo dice: el 3,79 de Towoomba no es «lo que hace el
  fertilizante», es treinta años de fertilizante **más** lo que el fertilizante le
  hizo al suelo, y la propia fuente lo registra.

## 18.d Lo que NO sirve

- Ganancia de peso o producción de carne. Mido forraje, no animal.
- Un tratamiento sin su control del mismo sitio.
- Comparaciones entre predios distintos: eso es un modelo espacial y ya sé que
  miente.

---

# LOTE 19 — lo que falta ubicar, y las bandas vacías

Este lote es más de picapedrero y por eso va tercero. Son ocho frentes chicos e
independientes: traé lo que consigas, cada uno en su entrada.

## 19.a El arbustal, la clase 20 — cuarto intento, con la regla nueva

La banda del arbustal tiene **un solo sitio** y es la única que un usuario ya ve en
pantalla. Dos lotes intentaron llenarla y los dos fallaron, por motivos opuestos y
los dos instructivos:

- el lote 14 trajo una estepa que la fuente llama **arbustiva** y el píxel llama
  pastizal;
- el lote 16 encontró un píxel de **arbustal estable** cuyo ensayo había
  desmontado las leñosas en 1949.

**Entonces hacen falta las dos cosas a la vez:** un sitio cuyo píxel sea clase 20
y cuya parcela medida **siga teniendo las leñosas**. Candidatos por producto:
matorral mediterráneo cerrado, chaparral de California, karoo sudafricano, fynbos,
*Artemisia tridentata* del Gran Cuenca, mezquital y matorral espinoso
tamaulipeco, caatinga arbustiva.

Para cada candidato necesito: **cobertura leñosa en porcentaje con su método**
(regla N), coordenada publicada (regla M), y una frase que diga si la parcela fue
desmontada, raleada o quemada — **y si la fuente no dice nada sobre eso, decilo
explícitamente**, porque con Towoomba aprendí que el silencio no es «intacto».

Las fichas de sitio ecológico del **NRCS (EDIT)** siguen siendo la vía más
prometedora, pero la del lote 16 falló por no publicar el método de la cobertura.
Mirá si alguna lo publica, o si hay un *Technical Guide* asociado que lo diga.

## 19.b La clase 40 y los biomas vacíos

- La clase 40 (cultivo) tiene dos entradas y **ninguna de secano**: una está
  fertilizada y la otra regada. Falta un cultivo forrajero de secano, sin
  fertilizar, con producción medida.
- **Los biomas 1, 2, 3, 6 y 9 siguen en cero**: selva tropical húmeda, selva
  tropical seca, conífera tropical, bosque boreal y pastizal inundable. El 9
  —pastizal inundable— es el más relevante porque es donde cae mucha ganadería:
  los Esteros del Iberá, el Pantanal, la Ciénaga de Zapata, el delta del Okavango,
  las várzeas amazónicas.

## 19.c Konza, que quedó a mitad de camino

En el lote 16 identificaste bien el candidato —La Pierre et al. (2011), 25 años,
1984-2008, los paquetes PAB011 y AWE012 del Konza Prairie LTER— y declaraste que
el portal devolvió 403 y que no transcribías valores de un gráfico. **Las dos
decisiones fueron correctas.**

Reintentá por otra puerta: el portal **EDI** (Environmental Data Initiative) sirve
los paquetes de Konza con URLs de descarga directa del tipo
`https://pasta.lternet.edu/package/data/eml/knb-lter-knz/<id>/<rev>/<entidad>`, y
el **catálogo de Konza** (`lter.konza.ksu.edu`) publica los datasets con su
documentación. Si conseguís las filas anuales, Konza es una serie de 25 años en
pastizal templado con tres regímenes de fuego, que además separa grupos
funcionales: **serviría para el lote 17 y para el 18 a la vez.**

## 19.d El dato que ya tengo y no puedo resolver solo

Tres preguntas de sí o no, cada una con su consecuencia:

1. **¿La serie del CPER es de secano?** Lauenroth y Sala (1992) no lo dice. La
   documentación del **SGS-LTER / CPER** debería decir si las ubicaciones
   muestreadas estaban en potreros sin riego ni fertilización. Si lo confirma, la
   clase 30 pasa de 7 a 8 sitios.
2. **¿La parcela sin quemar de Calabozo recibió riego?** San José y Medina (1976),
   *Tropical Ecology* 17:113-124. Si no lo recibió, Calabozo entra a la banda de
   la clase 30 y **fuerza a reescribir una afirmación mía**, porque sus 1.257 mm
   superan el techo actual de secano.
3. **¿Los dos cortes de Ukulinga se suman o se promedian?** La tesis de Swemmer
   dice que la ANPP se midió dos veces al año, en diciembre y febrero, segando una
   franja de 2,1 m, y no dice cómo se combinan. Es una ambigüedad de **factor 2**
   en una cifra montada. El artículo publicado de 2007 (*Journal of Ecology*
   95:780-788) puede decirlo, o Fynn y O'Connor, que usan el mismo ensayo.

## 19.e Los atrasos que siguen abiertos

- **Los catorce pares de Lesbos.** Psyllos et al. (2022), *Sustainability*
  14(8):4623. En el lote 16 verificaste que la Tabla 2 publica medias agregadas
  por potrero y no los pares. Falta mirar el **material suplementario** del
  artículo, que en MDPI se publica como archivo aparte.
- **Bojórquez-Tapia, Ffolliott y Guertin (1990)**, JRM 43(1):25-28, y **Moore y
  Deiter (1992)**, JRM 45(3):267-271. La barrera ya está documentada dos veces:
  el archivo de Arizona no entrega el texto. **No insistas.** Si aparece una copia
  en otro repositorio, bien; si no, quedan cerrados.
- **La coordenada de parcela del dataset Vindhyan.** Dos lotes no la encontraron.
  Cerrado salvo que aparezca sola.
- **El rastrojo de poscosecha**: una misma parcela con rendimiento de grano,
  residuo y desaparición mensual por pastoreo. Dos lotes no lo encontraron.

---

## 3. Las trampas de estos frentes

**Una serie de años no es una serie si cambia el método en el medio.** La de Río
Mayo la midieron dos equipos —Fernández-A. hasta 1988 y Jobbágy desde 1990— y por
eso no puedo decir si el campo se arbustizó o cambió el observador. Si la fuente
atribuye tramos a trabajos distintos, **decilo año por año**.

**El pico de biomasa no es la producción.** El lote 16 midió el factor en el mismo
sitio y el mismo año, con los dos métodos: la capa herbácea cambia **1,36 veces**
entre sumar los incrementos (método 7a de Singh et al. 1975) y medir una vez en el
pico, y la leñosa no cambia nada. Por eso la regla K es obligatoria y por eso el
método de integración va en `metodo`, con su nombre si tiene nombre.

**La media de una serie no es el rango de una serie.** Si la fuente publica «538
mm de media de 29 temporadas», eso es `normal_publicada`. `rango_de_anios` es
otra cosa: el mínimo y el máximo del mismo punto en años distintos. Me equivoqué
yo en esto, en las tres entradas sudafricanas, y lo agarró un test.

**Una cobertura basal no es una cobertura de copa.** Las dos van en porcentaje y
las dos necesitan método, pero miden cosas distintas: la basal es la fracción del
suelo que ocupan las matas al ras, la de copa es lo que proyecta el dosel. Decí
cuál es.

**Y la cobertura no predice la producción entre sitios.** 9,0 % → 138 g/m²,
12,6 % → 137, 15,8 % → 323, y Río Mayo con 25 % produce 28. Adentro de un sitio sí
la explica. No confundas los dos niveles.

---

## 4. Las veintidós reglas

Las dieciocho de siempre, con cuatro nuevas al final que salen del lote 16.

**A. Toda cifra entra con su algoritmo y su unidad literal.** Las conversiones las
hago yo. Copiá la unidad como la escribe la fuente, con sus símbolos.

**B. Si la fuente publica las partes, van todas**, y si publica más de un método o
más de una estimación del mismo sitio, van todas con su nombre.

**C. El tratamiento se nombra, y es distinto de un disturbio.** Fertilización,
riego, siembra, corte: tratamiento. Fuego, sequía, plaga, desmonte previo:
disturbio. Van en campos distintos.

**D. Coordenada publicada, declarando qué clase de coordenada es.** Estación
experimental, centroide de área, punto de parcela, localidad.

**E. Nunca se promedia un máximo con un mínimo, ni una normal con una temporada
medida.** Si la fuente publica dos, van las dos.

**F. Flujo, no stock** — y si es stock, se declara y se dice en qué momento.

**G. La advertencia de la fuente va textual**, entre comillas y en su idioma.

**H. Una fracción se arma con numerador y denominador de la misma tabla y la misma
unidad.** Si hay que buscar el denominador en otro lado, no es una fracción: son
dos cifras.

**I. Un área publicada no es una coordenada hasta que da un solo bioma.**

**J. El tratamiento es de la PARCELA, no de la estación.** Ante el silencio de la
fuente, `desconocido`. Nunca `secano` por omisión.

**K. Toda cifra declara si es stock o flujo**, con el momento si es stock, y **con
el método de integración si es un flujo**: suma de incrementos, pico único,
diferencias positivas, con el nombre que la fuente le dé.

**L. Una fracción comible declara cómo se atribuyó lo comible.**

**M. Todas las coordenadas que publique la fuente, y toda frase sobre dónde está
el sitio.** Ninguna se descarta por parecer peor.

**N. La clase de cobertura se declara con porcentajes, no con un nombre**, y el
porcentaje va con su **método y su año de medición**. Sin método no sirve.

**O. Una serie de años se entrega año por año.** Una fila por año, con su lluvia,
su producción, su método y su n si varía.

**P. Si la fuente ajustó una ecuación, va con todo —ordenada, pendiente, r², n,
grados de libertad, unidades de los dos ejes— y VOS LA VERIFICÁS** re-ajustando tu
propia transcripción por cuadrados mínimos, reportando el resultado en
`verificacion_por_ajuste`. Así encontré el 790 de 1943 en el lote 15: es la única
forma de defender cien números con dos.

**Q. Si la fuente publica la misma magnitud en dos bases**, van las dos, más la
conversión con su r² y su n, porque puede no ser un factor.

**R. Toda cifra climática declara qué clase de número es**: `anio_medido`,
`rango_de_anios` (el mismo punto, años distintos), `rango_de_sitios`,
`normal_publicada` (una media de largo plazo) o `agua_de_riego`.

**S. Si la fuente publica capas o grupos separados, el ORDEN de las columnas se
verifica — y es nueva.** No alcanza con leer la tabla: hay que confirmar qué
columna es cuál, contra el encabezado textual **y** contra una segunda evidencia
—una frase del texto, el resumen, un archivo de datos del mismo dataset, un pie de
tabla—. Reportá en `verificacion` el encabezado tal como está escrito y qué te
confirmó el orden. En el lote 16 invertiste gramíneas y arbustos en trece filas y
el hallazgo salía al revés.

**T. Antes de declarar imposible una verificación, probá derivar — y es nueva.** Si
una ecuación usa una variable que no está, mirá si otra ecuación publicada de la
misma fuente la deriva de lo que sí está. En el lote 16 declaraste imposible el
re-ajuste del modelo de retardo, y la conversión que hacía falta estaba publicada
en el mismo trabajo del que salía la serie.

**U. Si una tabla tiene varios sitios o tratamientos comparables, van todos — y es
nueva.** No elijas el que parece encajar con el pedido. En el lote 16 la tabla
tenía tres sitios y trajiste dos; el que faltaba era el más útil de los tres.

**V. Una coordenada se contrasta contra la frase que nombra el lugar — y es
nueva.** Si la fuente dice «la granja X de la universidad Y, en la ciudad Z» y
publica una coordenada, fijate si la coordenada corresponde a esa ciudad. Si no
corresponde, van las dos cosas y decís cuál no cierra y por cuánto. No la
corrijas: reportá la discrepancia. En el lote 16 una fuente publicó la coordenada
con los dos números permutados y se vio exactamente así.

---

## 5. Lo que no quiero

- Resúmenes de resúmenes. Si no viste la tabla, no la transcribas.
- Promedios entre sitios o entre años que la fuente no promedió.
- Un número sin unidad, sin método o sin año.
- Rellenar un hueco con una media regional.
- Coordenadas inventadas, centroides calculados por vos, o valores leídos de un
  gráfico.
- Decirme que algo «suele ser» así. Si la fuente no lo dice, el campo va en
  `null` y el motivo en `motivo`.

Una vacía bien declarada vale más que una entrada dudosa. **Diez de las catorce
entregas tuvieron vacías y ninguna me molestó; los dos errores que encontré en
dos lotes estaban en entradas, no en vacías.**

---

## 6. Lo que ya está montado, para no repetirlo

**Los veinte sitios**, por bioma de RESOLVE:

- **pastizal templado (8):** MLRA 53B Dakota del Norte · Edwards Plateau Texas ·
  delta del Danubio · avena de Montecillo · alfalfa del Curacó · Różańsko ·
  estepa de Río Mayo Chubut · Central Plains Experimental Range Colorado
- **sabana tropical (7):** Calabozo Venezuela · Towoomba Limpopo · Ukulinga
  KwaZulu-Natal
- **conífera templada (3):** Manitou bajo dosel · Manitou en abertura ·
  Waring's Woods
- **bosque templado mixto (1):** Cascade Head
- **desierto y matorral xerófilo (1):** sitio del Monte
- **tundra (1):** sitio ártico
- **montano (10):** Chuquibambilla y Puno, altiplano peruano · Bloemfontein
  Estado Libre
- **mediterráneo (12):** frigana de Lesbos

**Las dos series de años:** CPER, cincuenta años, 1939-1990 (forraje aire-seco
y lluvia). Río Mayo, quince años, 1972-1997 (gramíneas, arbustos, total,
temperatura y lluvia).

**Los tres pares de manejo:** Bloemfontein control/mal estado, Towoomba
control/P2N3, Ukulinga control/N3P.

**Los modelos:** regional de Sala et al. (1988) · largo plazo del CPER · con
memoria de Oesterheld et al. (2001) · el de equilibrio derivado de ése ·
la conversión forraje↔ANPP de Lauenroth y Sala · la curva de dosel de Manitou con
sus catorce pares · la fracción comible · la utilización de Glencoe · la fracción
herbácea de cuatro sitios.

**Las barreras ya documentadas, no las vuelvas a golpear:** el archivo del
*Journal of Range Management* en Arizona (bloqueo anti-bot y 403 del repositorio);
MDPI y Wiley rechazan descargas automáticas pero sus DOI resuelven; el sitio de
publicaciones de la Facultad de Agronomía de la UBA migró y sus PDF viejos dan
404, pero están en el Internet Archive.

---

## 7. La forma del JSON

Un solo objeto por archivo, con `entradas` y `vacias`. Cada entrada:

```json
{
  "id": "capas_01",
  "sitio": "nombre del sitio como lo escribe la fuente",
  "coordenada_de_la_fuente": "lo que publica, textual",
  "coordenadas_todas": [
    { "valor": "...", "que_dice_que_es": "...", "precision": "..." }
  ],
  "ubicacion_en_palabras": "toda frase de la fuente sobre dónde está",
  "coordenada_contra_palabras": "si la coordenada no corresponde al lugar nombrado, qué no cierra y por cuánto; null si cierra",
  "clase_de_coordenada": "estacion_experimental | centroide_de_area | punto_de_parcela | localidad",
  "superficie_declarada": "tamaño de parcela y réplicas",
  "es_el_sitio_publicado": true,
  "bioma_verificado": null,
  "clase_wc_del_sitio": "lo que la fuente dice de la vegetación; la clase satelital la verifico yo",
  "cobertura_lenosa_pct": { "valor": null, "metodo": "...", "anio": null, "basal_o_copa": "basal | copa | null" },
  "cobertura_herbacea_pct": { "valor": null, "metodo": "...", "anio": null, "basal_o_copa": null },
  "desmonte_o_raleo": "qué dice la fuente sobre si la parcela fue desmontada, raleada o quemada; si no dice nada, decirlo así",
  "insumos": "secano | fertilizado | riego | riego_y_fertilizado | desconocido",
  "insumos_de_la_parcela": "qué dice la fuente de ESA parcela",
  "serie_por_anio": [
    {
      "anio": "1984",
      "lluvia_mm_del_anio": 191,
      "que_es_la_lluvia": "anio_medido",
      "herbacea": 39.0,
      "lenosa": 25.7,
      "total": 64.7,
      "unidad": "g_ms_m2_anio",
      "base_de_la_masa": "estufa_seco | aire_seco | no_dice",
      "metodo_de_integracion": "pico unico | suma de incrementos positivos | ...",
      "atribuido_a": "qué trabajo midió ESTE año, si la fuente lo dice",
      "n_de_este_anio": null,
      "dispersion": null,
      "stock_o_flujo": "flujo"
    }
  ],
  "orden_de_columnas": "el encabezado de la tabla tal como está escrito, en orden, y qué te confirmó cuál es cuál",
  "manejo_comparado": {
    "control": { "valor": null, "carga": null, "unidad_de_la_carga": null },
    "tratado": { "valor": null, "carga": null, "unidad_de_la_carga": null },
    "que_cambia": null,
    "anios": null,
    "cambios_colaterales": "si el tratamiento cambió suelo o especies, la frase de la fuente"
  },
  "ecuacion_de_la_fuente": {
    "formula": null, "ordenada": null, "pendiente": null,
    "r2": null, "n": null, "gl": null,
    "unidad_x": null, "unidad_y": null
  },
  "verificacion_por_ajuste": "tu re-ajuste por cuadrados mínimos sobre tu propia transcripción, con los coeficientes que te dieron, y si no coinciden decilo",
  "conversion_entre_bases": null,
  "lluvia_normal_mm": { "valor": null, "anios_de_la_serie": null, "sd": null },
  "cifras": [
    {
      "componente": "npp_herbacea | npp_aerea | ...",
      "valor": null, "unidad": null, "unidad_publicada": null,
      "base_de_la_masa": null, "stock_o_flujo": null, "momento_del_stock": null,
      "metodo_de_integracion": null,
      "capa_que_mide": null, "de_la_misma_tabla_que": null,
      "metodo": null, "ya_descuenta_uso_admisible": false,
      "tratamiento": null, "n_sitios": null, "dispersion": null, "periodo": null
    }
  ],
  "que_cuenta": "qué incluye y qué no",
  "disturbios_en_la_ventana": null,
  "temperatura_c": { "valor": null, "que_es": "media_anual | media_de_maximas | otra" },
  "estacionalidad": null,
  "donde_deja_de_valer": null,
  "medido_en": "año o años de la medición, no de la publicación",
  "advertencia_de_la_fuente": "textual, entre comillas",
  "fuentes": [ { "label": "...", "url": "..." } ],
  "verificacion": "qué tabla, qué página, qué sección leíste",
  "nota": "lo que no entra en ningún campo"
}
```

Y cada vacía:

```json
{ "id": "lo_que_no_se_pudo", "motivo": "qué buscaste, qué encontraste y por qué no alcanza" }
```

Los campos que no apliquen van en `null`. **Ninguno se borra**, porque un campo
ausente y un campo nulo no son lo mismo: el nulo dice que lo miraste.
