# Encargo de forraje — lotes 21 a 24, para cerrar

**Esto cierra el encargo de forraje.** Van veinte lotes y 27 sitios montados. Lo
que falta no es más mediciones: es **una forma para el reemplazo**, y los cuatro
lotes de acá abajo son exactamente lo que falta para escribirla. Después de estos
cuatro, el encargo se declara terminado con lo que haya.

Entregá **cuatro archivos**, `21.json`, `22.json`, `23.json` y `24.json`, **en ese
orden**. El 21 es el más importante de los cuatro por mucha distancia: si sólo
pudieras hacer uno, hacé el 21.

Fecha: 22/10/2026.

---

## 1. Dónde estoy, en cinco renglones

Tengo que reemplazar una función que calcula producción de forraje a partir de la
lluvia anual y **no tiene ninguna fuente**: una escalera de cinco escalones
—700 / 1.500 / 3.000 / 5.000 / 7.000 kg MS/ha/año— que multiplica todo lo que
viene después en mi app: la oferta de pasto, la carga animal, el tamaño del rodeo
y el agua que hay que almacenar para esa hacienda. Alguien dimensiona una represa
con eso.

Veinte lotes midieron **por qué está mal**. Ahora hace falta con qué cambiarla.

## 2. Lo que ya sé, para que no lo busques de nuevo

Esto es el resumen de veinte lotes. Cada punto está verificado contra la fuente
primaria y montado con tests.

| lo que mueve la producción | cuánto | estado |
|---|---|---|
| la lluvia entre sitios | 0,60 g/m² por mm | sabido, y es la pendiente equivocada |
| la lluvia en el mismo sitio, un año | 0,13 | sabido |
| la lluvia en el mismo sitio, en equilibrio | 0,22 | sabido |
| **la capa que se mide** | r² 0,015 la herbácea contra 0,728 la leñosa | **un solo sitio** |
| el estado del año anterior | ×1,24 según la racha; coeficiente 0,41 | cerrado |
| el manejo del pastoreo | ×1,36 | cerrado |
| la fertilización y la degradación | ×12 | cerrado |
| **el almacenaje de agua del suelo** | decide si la lluvia predice algo | **un solo sitio** |
| **la posición en el relieve** | ×1,5 a 2,0 | **cuatro ecosistemas, todos de EE.UU.** |
| la ventana sobre la que se suma la lluvia | la dirección sí, el coeficiente no | **un solo sitio, con palanca** |
| el año contra el lugar | el año pesa 4 veces más | sabido |

**Las cuatro filas en negrita son los cuatro lotes de este encargo.** Y la
conclusión que las ordena es ésta: ya tengo medido que una función de la lluvia
anual no alcanza, **y no tengo la función que sí**. Por eso el lote 21 es lo que
es.

### Lo que encontró el lote 20, porque explica el 21

Hart y Samuel (1985) ajustaron la misma producción contra cuatro ventanas de
lluvia y el r² va de 0,03 a 0,95. Reajusté su tabla y el 0,95 **lo pone un año**:
marzo-abril de 1983 llovió 250 mm contra 18 a 78 de los otros seis años de la
serie, y sacando ese año el r² cae a 0,001. Sacando cualquier otro, no se mueve.

Pero el mismo trabajo trae un resultado que sí es firme y que es el que importa:
**en subsuelo arenoso la lluvia explica la producción y en subsuelo limoso del
mismo campo no la explica con ninguna ventana.** Y los autores dicen qué hace
falta, con nombre y apellido:

> *«Correlation of production with precipitation was good on soils with sandy
> subsoils and therefore little water storage capacity; plants growing on such
> soils were dependent on current rainfall. On a soil with loamy subsoil and
> higher water storage capacity, current rainfall was less important and stored
> water from past rains had some impact. On such soils, **a more complex
> water-balance model (Wight and Hanks 1981) might be needed to predict herbage
> production**.»*

Veinte lotes buscando mediciones, y la fuente de uno de ellos nombra el modelo.
Eso es el lote 21.

---

# LOTE 21 — el modelo publicado de balance hídrico (el que importa)

## 21.a Qué busco

**Un modelo publicado que prediga producción de forraje o ANPP a partir del agua
disponible, y no de la lluvia.** Con sus ecuaciones, sus parámetros, sus unidades,
su validación y su rango de validez. No quiero que me expliquen el concepto:
quiero poder escribirlo en código y testearlo contra un caso resuelto.

Lo que mi app ya tiene y puede alimentar a un modelo así:

- lluvia **diaria** de tres fuentes (NASA POWER, CHIRPS, ERA5)
- temperatura diaria máxima, mínima y media
- evapotranspiración potencial calculada
- textura del suelo por horizonte y capacidad de agua disponible, de SoilGrids
- pendiente, orientación y acumulación de flujo celda por celda, de un DEM
- la clase de cobertura de ESA WorldCover

O sea: **si el modelo pide agua del suelo, se la puedo calcular.** Lo que no
tengo es el modelo.

## 21.b Las rutas, con los identificadores exactos

Están todas en el repositorio abierto de la Universidad de Arizona, que aloja el
archivo del *Journal of Range Management* y de *Rangeland Ecology & Management*.
**Los busqué y existen**; te paso los handles para que no los busques:

| trabajo | handle |
|---|---|
| Wight y Hanks (1981) — «A Water-Balance, Climate Model for Range Herbage Production» | `10150/646128` |
| «Herbage production as a function of soil moisture stress in a semiarid area» | `10150/191071` |
| «Evaluating Soil Water Models on Western Rangelands» | `10150/645642` |
| «Use of stochastically generated weather records with rangeland simulation models» | `10150/644802` |
| «Simulation Models and Management of Rangeland Ecosystems: Past, Present, and Future» | `10150/639178` |

**Cómo se abren**, porque tiene truco y lo documenté: la página del ítem es
`https://repository.arizona.edu/items/<uuid>` y se llega con
`https://repository.arizona.edu/server/api/discover/search/objects?query=<título>`,
que devuelve el uuid. **La descarga directa del PDF da 403** con cualquier
encabezado. Lo que funciona es abrir la página del ítem en el navegador y pedir el
archivo desde esa misma página; y el repositorio publica además **el texto
extraído como archivo aparte** (el bundle `TEXT`), que para buscar es mejor que el
PDF. Los uuid de los archivos salen de
`/server/api/core/items/<uuid>/bundles` y después `/bundles/<uuid>/bitstreams`.

Si alguno no se puede abrir, decilo con el handle y seguí con los otros.

## 21.c Lo que tiene que traer cada modelo

Esto es distinto de lo que vienen trayendo los lotes anteriores, así que leelo con
atención. Por cada modelo:

1. **Las ecuaciones completas, una por una**, con el significado de cada símbolo y
   **las unidades de cada símbolo**. Si el modelo tiene cinco ecuaciones
   encadenadas, van las cinco.
2. **Los parámetros con sus valores publicados**, y de qué sitio o qué tipo de
   vegetación salió cada uno. Si un parámetro se calibra, decilo y decí contra qué.
3. **El paso de tiempo**: diario, por década, mensual. Y qué variables de entrada
   pide en cada paso.
4. **La validación**: contra qué sitios, cuántos años, qué r² o qué error, y en qué
   unidades. **Esto es lo que me deja escribir el test.** Si el trabajo publica una
   tabla de observado contra estimado, **va la tabla entera**, fila por fila.
5. **El rango de validez declarado**: qué climas, qué suelos, qué vegetación, y qué
   dicen los autores que pasa afuera.
6. **Qué NO modela.** Si ignora el manejo, el pastoreo, la capa leñosa o la
   posición en el relieve, decilo. Es la mitad de la información.
7. **Los modelos que lo sucedieron**, si el trabajo o los que lo citan los nombran:
   ERHYM-II, SPUR, PHYGROW, GPFARM, SWAT, APEX. Con su cita, no con su descripción.

## 21.d Lo que NO sirve en este lote

- Un modelo de teledetección. Si pide un índice satelital de entrada, no me sirve:
  mi app no procesa imágenes.
- Un modelo de cultivo que pida fenología de una variedad sembrada.
- Un modelo de biblioteca sin ecuaciones publicadas: si es un ejecutable y los
  coeficientes no están en el paper, no se puede escribir.
- Una revisión que diga que los modelos existen. Quiero las ecuaciones.

---

# LOTE 22 — el agua del suelo como moderador, con dos suelos del mismo campo

## 22.a Por qué

Hart y Samuel midieron **lo mismo en dos suelos del mismo campo** y les salió que
la lluvia predice la producción en uno y no en el otro. Eso es, de todo lo que
junté en veinte lotes, **lo más accionable que tengo con un solo sitio**: mi app
sabe la textura del suelo del predio y hoy aplica la misma función de la lluvia en
los dos casos.

Con un sitio no se puede decidir. Con dos o tres más, sí.

## 22.b Qué califica

En el mismo trabajo y el mismo campo:

1. Producción de pastizal medida en **dos o más suelos** que difieran en capacidad
   de almacenaje de agua, con la **misma** serie de años y el **mismo** método.
2. Una regresión de producción contra lluvia **por suelo**, con su r² y su n. O la
   serie año por año, que me deja ajustarla yo.
3. Y lo que describa el suelo: textura por horizonte, profundidad, capacidad de agua
   disponible, piedras. Con el nombre de la serie de suelo si lo publica.

**Lo que NO califica:** dos suelos de dos campos distintos, o dos campos con
climas distintos. El punto es que el clima esté quieto.

## 22.c Dónde mirar

- El archivo de Arizona otra vez, que es donde está este tipo de trabajo:
  buscá «soil» con «herbage production» y «precipitation», y «range site» con
  «production» y «water-holding capacity».
- Los sitios experimentales del USDA-ARS que publican por suelo o por sitio
  ecológico: Cheyenne, el CPER, Miles City, Mandan, Woodward, Sidney.
- *Soil Science Society of America Journal* y *Agronomy Journal*, que publican el
  lado del suelo de esta pregunta.
- Y en castellano: el INTA publica ensayos de pastizal por sitio ecológico y por
  unidad cartográfica de suelo, sobre todo en la Patagonia y el Caldenal.

---

# LOTE 23 — la posición en el relieve, fuera de Norteamérica

## 23.a Por qué

El factor topográfico es **lo único de toda esta lista que mi app ya puede
calcular hoy sin un dato nuevo**: la acumulación de flujo sobre el DEM dice qué
celda recibe el escurrimiento de las de arriba. Y tengo el factor medido:

| ecosistema | bajo contra loma | fuente |
|---|---|---|
| estepa de pasto corto, Colorado | **1,75** | Hoover et al. (2021), 36 años, medido |
| pradera de arenales | ~1,5 | Stephenson et al. (2019), citado |
| pradera de pasto alto | ~2,0 | Nippert et al. (2011), citado |
| pastizal boreal | ~2,0 | Bork et al. (2001), citado |

**Los cuatro son de Estados Unidos y Canadá.** Antes de que mi app multiplique por
1,75 el forraje de un bajo en Chubut, en Durango o en el Chaco, necesito saber si
el factor viaja.

## 23.b Qué califica

1. Producción medida en **dos o más posiciones topográficas del mismo sitio**, el
   mismo año y con el mismo método.
2. La posición nombrada **con la palabra de la fuente** —loma, media loma, bajo,
   bajo dulce, bajo salino, cañada, vega, mallín, playa, swale, footslope,
   toeslope, run-on— y la evidencia de por qué es esa posición: una frase de la
   fuente, no una interpretación.
3. Si la fuente publica por separado la sensibilidad de cada posición a la lluvia,
   mejor todavía: eso es un segundo factor y **no es el mismo que el del nivel**.

## 23.c Dónde mirar, y acá sí hay nombres en castellano

Esto en la pampa deprimida y en la Patagonia se estudia desde siempre y tiene
vocabulario propio:

- **La pampa deprimida**: pastizales de loma, media loma y bajo, con la cadena
  Sala, León, Rubio, Deregibus, Perelman, Burkart. Varios en *Ecología Austral* y
  en la *Revista de la Facultad de Agronomía*, abiertos.
- **La Patagonia**: los **mallines** contra la estepa de alrededor es exactamente
  esta pregunta y está medida muchas veces, con factores que pueden ser mucho más
  grandes que 2. INTA Bariloche y Esquel.
- **El Chaco y el Caldenal**: peladares, bajos, albardones.
- **Los llanos de Venezuela y Colombia**: banco, bajío y estero, que es un
  vocabulario de tres posiciones ya hecho.
- *African Journal of Range and Forage Science* y *Rangeland Journal*, para sabana
  y para Australia.
- `Ecología Austral` está abierta en `ojs.ecologiaaustral.com.ar` y SciELO
  Argentina también.

**Y una advertencia sobre los mallines y las vegas:** si el bajo tiene agua
freática al alcance de las raíces, **ya no es el mismo fenómeno**. El factor de
Hoover es redistribución de agua de lluvia cuesta abajo; una vega con napa es otra
cosa y hay que declararlo en `aporte_de_agua`, porque mi app no puede ver una napa.

---

# LOTE 24 — la capa herbácea medida aparte de la leñosa (cuarto intento, como tarea de catálogo)

## 24.a Por qué insisto una cuarta vez

Es la pregunta más importante que tengo abierta y la pedí en los lotes 17, 19 y 20
sin resultado. El motivo: en el único sitio donde la capa herbácea está medida
aparte todos los años, **la lluvia anual explica el 1,5 % de la variación del
forraje y el 73 % de la de la leñosa.** La correlación del total —la que se vería
sin separar las capas— sale entera de los arbustos, que es la parte que un bovino
no come. Con un sitio no se puede decidir si eso es general.

## 24.b Y esta vez lo pido distinto: como catálogo, no como búsqueda

Las tres veces anteriores pedí «sitios con las capas separadas» y las tres
volvieron vacías. El lote 20 dejó un dato que cambia el enfoque: **intentaste las
37 fichas del catálogo NPP del ORNL DAAC y recuperaste 15.** Eso no es una
búsqueda, es una lista finita.

Entonces el lote 24 es esto, y nada más que esto:

1. **Listá las 37 fichas** de la colección NPP del ORNL DAAC, con su código y su
   URL (`https://daac.ornl.gov/NPP/guides/NPP_<CODIGO>.html`).
2. Por cada una que se pueda abrir: **copiá su tabla de columnas**, la que dice qué
   trae el archivo de datos. En la de Río Mayo esa tabla dice `ANPP_shrub`,
   `ANPP_grass`, `ANPP_total1`, `ANPP_total2`, y es por eso que ese sitio sirve.
3. Marcá cuáles **separan capas o grupos funcionales** y cuáles no, y cuáles traen
   **archivo climático mensual al lado** del de producción.
4. De las que no se pudieron abrir, decí el código y el error.

Con esa lista en la mano yo decido a cuáles vale la pena volver, y si la respuesta
es «ninguna separa capas», eso **cierra la pregunta** y es un resultado. Es el tipo
de respuesta que no conseguí en tres intentos porque pedí el pescado en vez de la
red.

5. Y si te sobra tiempo: la bibliografía de la estepa patagónica y del monte
   —Golluscio, Paruelo, Jobbágy, Bertiller, Aguiar, Cabido— mide gramíneas y
   arbustos aparte en el mismo sitio más de una vez, y buena parte está en CONICET
   Digital y en SEDICI. **Ojo con el sitio de publicaciones de la FAUBA**: migró y
   las URLs viejas dan 404 de verdad; lo que hace falta está en el Internet
   Archive.

---

## 3. Las rutas muertas, que no hay que volver a probar

Esto lo verifiqué yo y no es culpa de ninguna herramienta:

- **El portal EDI de los LTER devuelve 403 a todo acceso público.** Probé
  `/package/eml/knb-lter-knz`, `/package/eml/knb-lter-knz/55`,
  `/package/data/eml/knb-lter-sgs/4/15` y `/package/eml/knb-lter-jrn/210011001`, y
  los cuatro contestan *«User 'EDI-… (Public Access)' is not authorized to execute
  service method»*. **Konza, Jornada, Sevilleta y Shortgrass Steppe están cerrados
  por esa vía**, y no voy a crear una cuenta. Si hace falta esa data, hay que
  entrar por el portal propio de cada sitio.
- **Wiley da 403 a todo lo automático** y muestra verificación anti-bot en el
  navegador, incluso con el artículo en acceso abierto.
- **`par.nsf.gov` no responde** desde esta máquina.
- Los dos trabajos de Arizona del lote 14 —Bojórquez-Tapia (1990) y Moore y Deiter
  (1992)— están cerrados por inaccesibles.
- Y estos tres quedan **contestados y cerrados**: si el CPER es de secano (no se
  puede confirmar), si la parcela sin quemar de Calabozo se regó (no se puede
  confirmar) y si los dos cortes de Ukulinga se suman o se promedian (la fuente no
  lo dice). No vuelvas sobre ninguno.
- Y tampoco vuelvas sobre los **biomas 1, 2, 3, 6 y 9 como tema**, ni sobre el
  arbustal de clase 20, ni sobre el rastrojo. Si aparecen de rebote mientras hacés
  21 a 24, bienvenidos.

## 4. Las trampas, incluida una nueva

**No digitalices gráficos.** Si el número está sólo en una figura, no va.

**Una media de largo plazo no es un año medido.** `normal_publicada` y
`rango_de_anios` son dos cosas distintas: el segundo significa el mínimo y el
máximo **del mismo punto en años distintos**.

**Las medias ajustadas por covarianza no son medias de los datos.** Una media
ajustada por ANCOVA está evaluada en el valor medio de la covariable, así que no es
el promedio de las observaciones y no se puede recalcular desde las filas.

**Los grupos pueden no sumar al total.** Si la fuente lo avisa, no «arregles»
ninguna fila para que cierre.

**Los encabezados de dos niveles corren las columnas**, y el pie de la tabla los
cuenta: ver la regla X.

**Y la nueva, que es la lección del lote 20: una regresión con n chico no significa
lo que su r² dice.** Me trajiste cuatro ventanas con r² de 0,03 a 0,95 y el 0,95
era un punto de palanca: un año con 250 mm donde los otros seis tenían 18 a 78. **La
única forma de que yo pueda ver eso es que me mandes la serie junto con la
ecuación.** De ahí sale la regla Z.

## 5. Las veintisiete reglas

Las veinticinco de siempre, con dos nuevas al final que salen del lote 20.

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
unidad.**

**I. Un área publicada no es una coordenada hasta que da un solo bioma.**

**J. El tratamiento es de la PARCELA, no de la estación.** Ante el silencio,
`desconocido`. Nunca `secano` por omisión.

**K. Toda cifra declara si es stock o flujo**, con el momento si es stock, y con el
**método de integración** si es un flujo.

**L. Una fracción comible declara cómo se atribuyó lo comible.**

**M. Todas las coordenadas que publique la fuente, y toda frase sobre dónde está el
sitio.**

**N. La clase de cobertura se declara con porcentajes, no con un nombre**, y el
porcentaje va con su método y su año.

**O. Una serie de años se entrega año por año.**

**P. Si la fuente ajustó una ecuación, va con todo —ordenada, pendiente, r², n,
grados de libertad, unidades de los dos ejes— y VOS LA VERIFICÁS** re-ajustando tu
propia transcripción, reportando el resultado en `verificacion_por_ajuste`.

**Q. Si la fuente publica la misma magnitud en dos bases**, van las dos más la
conversión con su r² y su n, porque puede no ser un factor.

**R. Toda cifra climática declara qué clase de número es.**

**S. Si la fuente publica capas o grupos separados, el ORDEN de las columnas se
verifica**, contra el encabezado textual **y** contra una segunda evidencia.

**T. Antes de declarar imposible una verificación, probá derivar.** Si falta una
variable, fijate si otra ecuación publicada por la misma fuente la deriva. **Y es
la regla que más veces me dio algo**: con ella salió la regresión múltiple del lote
16 y la reconstrucción de la Tabla 2 del lote 20, las dos declaradas imposibles.

**U. Si una tabla tiene varios sitios o tratamientos comparables, van todos.**

**V. Una coordenada se contrasta contra la frase que nombra el lugar.** Si no
coinciden, van las dos con la discrepancia declarada y no se corrige ninguna.

**W. Toda cifra de producción declara la VENTANA sobre la que se sumó su lluvia.**
«Anual» no es una ventana. Si la fuente no lo dice, el campo va en `null` con la
nota.

**X. En una tabla con encabezado de dos niveles, el número de columnas de
producción se verifica contra el pie.** La fila de errores estándar agrupados, o de
n, cuenta las columnas: si tu lectura produce más columnas que valores en el pie,
se corrió un lugar.

**Y. Una ecuación publicada vale más que una coordenada.** Elegí la medición que
trae ecuación, pendiente y r² por encima de la que trae una coordenada linda.

**Z. Una ecuación se entrega CON la serie que la produjo —y es nueva.** Si la
fuente publica una regresión con n chico, hace falta la tabla de datos para poder
sacarle un año y ver si el ajuste lo sostiene uno solo. **Una ecuación sin su serie
es un número que no se puede auditar**, y el lote 20 lo mostró con un r² de 0,95
que era una observación. Si la serie está en la fuente, va. Si no está, decilo en
`verificacion_por_ajuste` con esas palabras: «la fuente no publica la serie».

**AA. Los autores van completos y en el orden de la cita —y es nueva.** No «Hoover
et al.» ni tres de seis: la lista como la imprime la fuente. **Quién firma es
evidencia**: en el lote 20 el segundo y el tercer autor del trabajo nuevo resultaron
ser los autores de las otras dos series del mismo sitio que ya tenía montadas, y eso
cambió cómo leí una discrepancia del 42 % entre las dos.

## 6. Lo que no quiero

- **Modelos globales de productividad** (Miami, Thornthwaite, MODIS NPP). Ya tengo
  el Miami Model montado como contraste y lee 1,75 veces bajo. El lote 21 pide lo
  contrario: un modelo de **balance de agua del suelo**, de paso diario o decádico,
  con ecuaciones.
- **Revisiones que citan a otros.** Quiero el trabajo que midió o que publicó el
  modelo.
- **Números sin método.**
- **Rellenar huecos.** Si un campo no está en la fuente, va `null` y una nota. Un
  `null` honesto me sirve más que un número plausible: toda esta cadena existe
  porque mi app ya tiene un número plausible y equivocado.

## 7. Lo que ya está montado

27 sitios. Los que importan para no duplicar:

| sitio | lo que tiene |
|---|---|
| Loamy Upland, MLRA 53B, Dakota | ficha NRCS, 2.643-3.063 kg/ha |
| CGREC, Streeter, Dakota (silty y overflow) | 17 años × 5 cargas de pastoreo |
| **Cheyenne, Wyoming (subsuelo arenoso y Ascalon)** | **el lote 20: cuatro ventanas × dos suelos** |
| **CPER, Colorado (serie de 50 años + loma, ladera y bajo)** | **el lote 20: 36 años por posición** |
| Very Shallow, Edwards Plateau, Texas | ficha NRCS |
| Chuquibambilla y La Raya, Puno | altiplano |
| Agra, Lesbos | 14 potreros, dos años de lluvia muy distinta |
| Cuatro pajonales de Eriophorum, Alaska y Yukón | tundra |
| Albardón, Delta del Paraná | total y forrajera de la misma cosecha |
| Montecillo, Texcoco | pastizal salino |
| Różańsko + 3 de Oregón + 2 de Manitou | sotobosque, con curva de dosel |
| Avena, Marcos Juárez + alfalfa, Curacó | cultivos, fertilizado y regado |
| Calabozo, Venezuela | sabana de Trachypogon |
| Río Mayo, Chubut | 15 años, capas separadas |
| Bloemfontein, Towoomba y Ukulinga | 29, 27 y 30 temporadas, con pares de manejo |

## 8. La forma del JSON

Mismo esqueleto de siempre para los lotes 22, 23 y 24. **El lote 21 es distinto** y
va primero.

### 21.json — un modelo, no una medición

```json
{
  "encargo": "forraje",
  "lote": 21,
  "fecha": "2026-10-__",
  "modelos": [
    {
      "id": "slug_corto",
      "nombre": "como lo llama la fuente",
      "cita": "autores completos, en orden, año, título, revista, volumen(número):páginas, DOI",
      "handle_o_url": "",
      "que_predice": "producción de forraje | ANPP | transpiración | …",
      "unidad_de_salida": "kg/ha/año | g/m²/día | …",
      "paso_de_tiempo": "diario | decádico | mensual",
      "ecuaciones": [
        {
          "orden": 1,
          "nombre": "cómo la llama la fuente, o el número de ecuación",
          "formula": "textual, como la imprime la fuente",
          "simbolos": [
            { "simbolo": "", "significa": "", "unidad": "", "de_donde_sale": "entrada | parámetro | salida de otra ecuación" }
          ]
        }
      ],
      "parametros": [
        { "simbolo": "", "valor": null, "unidad": "", "de_que_sitio_o_vegetacion": "", "calibrado": false, "contra_que_se_calibro": null }
      ],
      "entradas_que_pide": [
        { "variable": "", "unidad": "", "paso": "diario", "la_tengo": "sí | no | se puede derivar" }
      ],
      "validacion": {
        "sitios": [],
        "anios": null,
        "r2": null,
        "error": null,
        "unidad_del_error": "",
        "tabla_observado_vs_estimado": [
          { "sitio": "", "anio": null, "observado": null, "estimado": null, "unidad": "" }
        ]
      },
      "rango_de_validez": "qué climas, qué suelos, qué vegetación, con las palabras de la fuente",
      "que_NO_modela": "manejo, pastoreo, capa leñosa, relieve, lo que sea",
      "advertencia_de_la_fuente": "textual, entre comillas, en su idioma",
      "sucesores": [
        { "nombre": "", "cita": "" }
      ],
      "verificacion": "qué páginas, qué tablas y qué figuras abriste",
      "nota": ""
    }
  ],
  "vacias": [
    { "id": "", "ruta_que_probe": "el handle o la URL", "motivo": "" }
  ]
}
```

**Lo más importante del 21:** la tabla `tabla_observado_vs_estimado`. Es lo que me
deja escribir el test del caso resuelto, que es lo que la skill de mi repo exige
para que un cálculo pueda entrar. Un modelo sin esa tabla entra igual, pero con un
aviso de que no se puede verificar.

### 22.json, 23.json y 24.json — el esqueleto de siempre

El mismo del lote 20, con tres cosas:

- **El 22 agrega** `suelos_comparados`: un arreglo con, por cada suelo, su nombre
  de serie, su textura por horizonte, su profundidad, su capacidad de agua
  disponible si está publicada, **y su propia regresión** (ordenada, pendiente, r²,
  n, ventana). Más la serie año por año, por la regla Z.
- **El 23 agrega** `posicion_topografica`, con `clase`, `palabra_de_la_fuente`,
  `evidencia` textual, `pendiente_pct`, `aporte_de_agua` (`recibe` / `pierde` /
  `ninguno` / `no_dice`) y **`napa_al_alcance`** (`sí` / `no` / `no_dice`), que es la
  distinción que separa un bajo de una vega y que mi app no puede ver.
- **El 24 no lleva entradas de medición**: lleva un arreglo `fichas` con, por cada
  una de las 37, `codigo`, `url`, `titulo`, `se_pudo_abrir`, `columnas_del_archivo`
  (textual), `separa_capas` (sí/no), `trae_clima_mensual` (sí/no) y `error` si no se
  pudo abrir. Es un inventario, no una cosecha.

Y en los cuatro, `vacias` con **la ruta que probaste**, no sólo el motivo: saber
qué ruta no dio nada me ahorra pedirla de nuevo.
