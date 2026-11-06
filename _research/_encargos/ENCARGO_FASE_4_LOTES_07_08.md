# Fase 4 — lotes 7 y 8: las dos turberas, que son las últimas dos fichas con trabajo detenido atrás

*Va junto con `ENCARGO_FASE_4_FICHAS_INDOMALAYA.md` y `ANEXO_IDS_CULTIVOS.md`.
Dos archivos: `07.json` y `08.json`, **una ficha cada uno**.
Fecha: 06/11/2026.*

---

## 1. Por qué estas dos, y por qué juntas

Por lo mismo que los tres lotes anteriores, que entraron enteros: cada una tiene
una práctica fechada del territorio **ya entregada, ya verificada y ya leída**,
que no se puede montar porque la ficha donde vive no existe.

| ECO_ID | Nombre de RESOLVE | La práctica que espera |
|---|---|---|
| **286** | Tonle Sap-Mekong peat swamp forests | la siembra de arroz al retroceder la crecida, con las doce fincas medidas de Krong Stueng Saen |
| **280** | Sumatran peat swamp forests | el *sonor* de Perigi: arroz sembrado al voleo sobre turba quemada |

Y hay un segundo motivo, que apareció al medirlo y es el que las junta. **En
RESOLVE existen cuatro ecorregiones cuyo nombre dice «peat swamp forests», las
cuatro en Indomalaya, y acequia no tiene ficha de ninguna:**

| ECO_ID | | Estado |
|---|---|---|
| 221 | Borneo peat swamp forests | sin ficha |
| 264 | Peninsular Malaysian peat swamp forests | sin ficha |
| **280** | Sumatran peat swamp forests | **este lote** |
| **286** | Tonle Sap-Mekong peat swamp forests | **este lote** |

Eso importa más de lo que parece, porque acequia **ya tiene un módulo de turba**.
Detecta suelo orgánico en el punto del predio a partir del carbono orgánico del
perfil, con los dos umbrales de la WRB y del USDA, y avisa que drenar no es una
penalización de rinde sino una pérdida que no se deshace. Ese módulo se escribió
para cuatro ecorregiones del relevamiento de Indomalaya —pantanos del suroeste de
Borneo, pantanos de agua dulce de Sumatra, Sundarbans y delta del Irrawaddy—
donde la turba aparece **en los bordes**, entre el 7 % y el 41 % del polígono.
O sea: el aviso de turba de acequia está calibrado contra las ecorregiones que
tienen turba de refilón, y no contra las dos que **son** turba. Estas dos fichas
son las que le faltan a ese módulo para estar completo.

**Dos fichas, y las dos salen al centro del asunto de acequia:** una capa que
decide si el usuario drena o no drena.

---

## 2. Lo que ya está medido y no hay que volver a averiguar

Cuatro polígonos vecinos, resueltos contra RESOLVE por coordenada. **No los
confundas y no los uses de insumo**, porque dos de ellos ya tienen ficha propia
y escrita:

| ECO_ID | Qué es | Ficha de acequia |
|---|---|---|
| 285 | Tonle Sap **freshwater** swamp forests | `pantanos_tonle_sap`, ya existe |
| **286** | Tonle Sap-Mekong **peat** swamp forests | **la de este lote 7** |
| 277 | Sumatran **freshwater** swamp forests | `pantanos_sumatra`, ya existe |
| **280** | Sumatran **peat** swamp forests | **la de este lote 8** |

- Las doce fincas del trabajo del Tonle Sap publican su coordenada —de 12°39′ a
  12°41′ N, 104°47′ E— y **las doce dan 286**. El 285 empieza más cerca del lago:
  One Earth lo describe bien, el 286 forma un anillo **por afuera** del 285.
- **Perigi, Pangkalan Lampam, Ogan Komering Ilir** da **280**, y está a veinte
  kilómetros del sitio por el que ya se rechazó el *lebak* de Pampangan, que cayó
  en el mismo 280 cuando se lo proponía para el 277.

Las dos fichas que ya existen van a quedar al lado de las tuyas en el mismo
panel, así que **no repitas lo que ellas dicen ni las contradigas sin decirlo**.
Esto es lo que ya está escrito ahí, y es lo que tenés que superar:

- `pantanos_tonle_sap` (285): aluvión lacustre-fluvial, HWSD v2 con 71 % de
  Gleysols —58 % éutricos y 12 % **tiónicos**— y Fluvisols éutricos 25 %;
  SoilGrids con Fluvisols 78 %; **PEATMAP no registra turba**. Modificador:
  `huerta −5`, porque el −25 del bioma no aplica sobre aluvión casi sin
  lixiviación, y con la aclaración de que el limitante real —seis a ocho meses de
  inundación— no es fertilidad y por eso no está en ese número.
- `pantanos_sumatra` (277): HWSD v2 con Fluvisols dístricos 42 %, Acrisols
  férricos 18 %, **Histosols 17 %** y Gleysols úmbricos 16 %; **PEATMAP marca
  25 % de turba y SoilGrids llega a 88 % de Histosols**, lo que probablemente
  signifique que el polígono **incluye bordes de las turberas vecinas** — y esas
  turberas vecinas son justamente el 280. Modificador: `huerta −10`, con
  confianza baja declarada y con la regla de diseño escrita: donde caiga turba,
  no drenar, porque el hundimiento es de unos 5 cm por año y no se revierte.

---

## 3. La corrección al encargo grande, y es la pregunta del lote

Las dos ecorregiones son **bioma 1**, bosque tropical y subtropical húmedo, y hoy
heredan dos modificadores globales y nada más:

- `huerta −25` — «En los suelos lixiviados que dominan el bioma la fertilidad
  está en la biomasa viva y no en el suelo: abierto y desnudo se lava en pocas
  temporadas, así que la huerta va en claros chicos y con cobertura permanente.»
- `forestal +20` — «El sistema productivo que sostiene este bioma es agroforestal
  de varios estratos, no de suelo limpio.»

**Sobre una turbera el mecanismo del `huerta −25` es el equivocado.** Una turbera
tropical no es un suelo lixiviado: es suelo orgánico, y su limitante no es que la
lluvia se lleve las bases sino que **para cultivarla hay que drenarla, y drenarla
la destruye**. La turba drenada se hunde unos 142 cm en los primeros cinco años y
después alrededor de 5 cm por año, y más del 90 % de ese hundimiento es
**oxidación y no compactación** (Hooijer et al. 2012, que está abierto en
`bg.copernicus.org`). O sea: el carbono se va a la atmósfera y la cota no vuelve.

Que el mecanismo esté mal **no quiere decir que el número esté mal**, y eso es
exactamente lo que hay que resolver. Hay tres respuestas defendibles y las tres
sirven si traen el mecanismo:

1. **El −25 se confirma y cambia la razón**: sobre turba ombrotrófica —la de
   cúpula, alimentada sólo por lluvia— la fertilidad realmente está en la
   biomasa, el pH baja de 4 y las bases son escasísimas, así que el número llega
   bien por un camino que el bioma no nombra.
2. **El −25 se endurece**, porque un número negativo de rinde no alcanza para
   decir «esto no se deshace».
3. **El −25 se parte**, porque el polígono no es todo turba y en la parte aluvial
   el límite es el pulso del agua y no la fertilidad, igual que en el 285.

Lo que no sirve es elegir sin decir cuál de las tres es.

**Y después está el `forestal +20`, que es la pregunta más filosa de las dos
fichas y hay que contestarla de frente.** Ese +20 recomienda uso forestal
agroforestal de varios estratos. En una turbera del sudeste asiático, el uso que
la destruyó **fue forestal**: plantaciones de acacia y de palma aceitera, que
antes de plantar **drenan**. Un +20 heredado sin revisar le está diciendo al
usuario que la vocación de su predio es plantar árboles, en el único suelo del
catálogo donde plantar árboles del modo habitual es el error irreversible.

- ¿Sobrevive el +20, se anula con `delta: 0` o se da vuelta?
- Si sobrevive, **¿con qué sistema?** Hay una respuesta publicada y con nombre
  —la **paludicultura**: cultivo sobre turba **sin drenarla**, con especies que
  toleran el agua— y si la encontrás documentada con superficie, especies y
  rendimiento, eso vale el lote entero.
- Si no sobrevive, decilo con la cifra de hundimiento que lo justifica.

**Ojo, que esto es contrato y ya costó entradas:** en acequia un modificador
regional **reemplaza** al global de ese uso y hereda los demás. Omitir un
modificador **no es neutral**: deja el global entero, con su razón. Y un
`delta: 0` **no es «no sé»**: es una cancelación explícita, y necesita su razón.
Confirmar un modificador global vale igual que corregirlo, porque convierte un
delta heredado en un delta respaldado.

---

## 4. Lote 7 — ECO_ID 286, Tonle Sap-Mekong peat swamp forests

**Rutas probadas el 06/11/2026:**

| Ruta | Estado |
|---|---|
| `https://www.oneearth.org/ecoregions/tonle-sap-mekong-peat-swamp-forests/` | 200, `text/html`, 62.333 bytes — **abre y se leyó** |
| `https://en.wikipedia.org/wiki/Tonle_Sap-Mekong_peat_swamp_forests` | 200, `text/html` |
| `https://bg.copernicus.org/articles/9/1053/2012/` | 200 — Hooijer et al. 2012, el hundimiento de la turba drenada |
| `https://www.cepf.net/Documents/final.indoburma_indochina.ep.pdf` | la citan: perfil del hotspot Indo-Birmano, CEPF 2012. Probala |

`ecoregions.worldwildlife.org` no contesta al acceso automático y
`www.cifor-icraf.org/knowledge/publication/...` devuelve 403, pero **el dominio
de CIFOR sí sirve PDF de libros** (`cifor-icraf.org/publications/pdf_files/...`
abrió esta semana con curl pelado). Si una publicación de CIFOR es la que tiene
el dato, buscá la ruta de archivo y no la de catálogo.

**Lo que One Earth ya dijo, para que no lo repitas y lo uses de punto de
partida.** 29.450 km². Camboya y Vietnam. Objetivo de conservación 7 %, nivel de
protección 2 —y ojo: **ese «2» es el porcentaje de la meta de la Global Safety
Net en escala de 0 a 10, no el porcentaje protegido**; ya se confundió una vez—.
El anillo exterior del 285, con drenaje pobre y agua somera estancada que vuelve
anóxico el perfil y retarda la descomposición: así se acumula la turba. La
formación más extendida la domina la palma *Livistona cochinchinensis*, de más de
30 m, con *Eugenia*, *Elaeocarpus* y *Calophyllum* de dosel, con raíces zancudas
o neumatóforos. Hay además superficies grandes de humedal de gramíneas y ciperáceas
con *Phragmites karka*, *Saccharum arundinaceum* y *Coix gigantea*. Y el polígono
**llega hasta Vietnam**: las regiones de Haut Chhlong y Blao, y los pantanos de
corteza de papel detrás del manglar, en el delta del Mekong.

**Las cinco preguntas del lote, en orden de lo que vale:**

1. **¿Dónde hay turba en el 286 y cuánta?** El nombre de RESOLVE dice turba y One
   Earth, en la misma página, dice que los humedales de gramíneas están «on
   fertile alluvial clay sediments». Las dos cosas pueden ser ciertas a escala de
   ecorregión, y es exactamente la contradicción que el 277 ya tiene escrita. Lo
   que hace falta es el reparto: **porcentaje de Histosols en HWSD v2, porcentaje
   en SoilGrids, porcentaje de turba en PEATMAP, y espesor si alguna fuente lo
   publica.** Si las dos bases discrepan por más de diez puntos, decilo: eso es
   información y la ficha lo declara, no lo promedia.
2. **El arroz de recesión, que es la práctica que espera, y la distinción que
   nadie escribió todavía.** Sembrar detrás del agua que baja es la única forma de
   cultivar un humedal **sin drenarlo**: el agua se va sola y vuelve sola. Si
   encontrás fuentes que lo midan —fecha de siembra contra cota, rendimiento,
   superficie, cuántos ciclos— traelas, porque eso convierte el `huerta` de esta
   ficha en un número con diseño adentro en vez de una advertencia.
3. **El suelo ácido sulfatado.** El 285, al lado, tiene 12 % de Gleysols
   tiónicos, y la propia página de One Earth dice que los pantanos de *Melaleuca*
   cumplen la función de «reducing soil acidification». El delta del Mekong es uno
   de los lugares del mundo donde eso está mejor medido. **¿Qué parte del 286 es
   tiónica, y qué pasa con el pH cuando se excava o se baja la napa?** acequia
   abre zanjas y represas: esto es un aviso de obra, no un dato de color.
4. **El pulso de inundación con números.** Meses bajo agua, profundidad de la
   columna, y qué cambió con las represas de aguas arriba. El 285 dice «de agosto
   a enero o febrero» y «seis a ocho meses» para el bosque enano. Para el 286,
   que está más afuera y con agua más somera y más estancada, el régimen es otro
   y es el dato que ordena todo el diseño.
5. **Las especies, siete, con binomial** — y **una advertencia que ya se cobró una
   ficha**: One Earth nombra *Melaleuca leucadendron*, igual que WWF en el 277.
   Esa especie es **nativa de Maluku a Australia**, así que en Indochina el nombre
   es dudoso y en la ficha del 277 quedó declarado «especie sin confirmar». Si
   vas a nombrar el *Melaleuca* del delta, buscá qué especie es de verdad; si no
   lo podés confirmar, escribilo como género y decí por qué. Lo mismo con *Coix
   gigantean* y *Tristania obovate*, que están mal escritas en One Earth.

---

## 5. Lote 8 — ECO_ID 280, Sumatran peat swamp forests

**Rutas probadas el 06/11/2026:**

| Ruta | Estado |
|---|---|
| `https://www.oneearth.org/ecoregions/sumatran-peat-swamp-forests/` | 200, `text/html`, 61.257 bytes — **abre y se leyó** |
| `https://en.wikipedia.org/wiki/Sumatran_peat_swamp_forests` | 200, `text/html` |
| `https://bg.copernicus.org/articles/9/1053/2012/` | 200 — Hooijer et al. 2012 |
| `https://repository.unsri.ac.id/161155/1/ICoASTES%20FUll%20Manuscript%20Momondkk-Usri24.pdf` | abre: es la fuente del *sonor* de Perigi, trabajo de campo de 2024 sobre **turba drenada** |

One Earth cita tres trabajos que conviene probar, porque los tres son del centro
del asunto: **Posa, Wijedasa y Corlett 2011** (*BioScience* 61(1):49-57,
biodiversidad y conservación de turberas tropicales), **Wösten et al. 2006**
(hidrología y ecología de turberas degradadas por fuego) y **Page y Hooijer 2016**
(*Phil. Trans. R. Soc. B* 371:20150176, «In the line of fire: the peatlands of
Southeast Asia»). El último es de la Royal Society y suele tener copia en PMC.

**Lo que One Earth ya dijo.** 87.710 km², Indonesia, costa sureste de Sumatra.
Objetivo de conservación 35 % y nivel de protección 2 en la escala de 0 a 10 de la
Global Safety Net. Suelos de arcilla ácida saturados casi todo el año, donde la
hojarasca no se descompone y se acumula: capas de **varios metros**, algunas de
**más de 30.000 años**. Dos tipos de bosque: el pantanoso mixto —*Koompassia
malaccensis*, *Durio lowianus*, *Gonystylus bancanus*, *Shorea teysmanniana*,
*S. uliginosa*, *Tetramerista glabra*, *Swintonia glauca*— y el de *bintangur*
(*Calophyllum lowii*), menos diverso, **sobre turba más profunda y más lejos de
los ríos**, que localmente llaman *hutan dare*, «bosque joven», por el dosel bajo
y los diámetros chicos. Y el dato que ordena la ficha entera: en 2015 el humo de
los incendios de esta ecorregión cerró escuelas, costó miles de millones y llegó
a Tailandia. Los incendios arrancaron después de que se **drenó, se desmontó y se
quemó** turba para plantar palma aceitera.

**Las cinco preguntas del lote:**

1. **El espesor de la turba y su geografía dentro del polígono.** Es el dato que
   más cambia la ficha, porque de él sale todo lo demás: cuántos años de cultivo
   hay antes de que la cota baje al límite de drenaje. Con el espesor y los
   5 cm/año de Hooijer, la cuenta se hace y **es un número que acequia puede
   imprimir**. Si además encontrás el reparto por profundidad —menos de 1 m,
   1 a 3 m, más de 3 m, que es la clasificación que usa la normativa indonesia—,
   mejor todavía, porque ahí hay umbrales legales además de físicos.
2. **Cúpula o ribera: ¿qué tipo de turba es?** No es un detalle taxonómico. La
   turba de cúpula es ombrotrófica, la alimenta sólo la lluvia, y entonces sí es
   pobrísima en nutrientes y muy ácida: ahí el `huerta −25` del bioma acierta por
   accidente. La turba de ribera recibe sedimento del río y no es lo mismo. One
   Earth ya da una pista —el *bintangur* está «in deeper peat and further from
   rivers»—, así que el gradiente existe y está descripto. **Si el polígono es
   mayormente cúpula, decilo, porque es la primera vez en el catálogo que la razón
   del bioma llegaría bien.**
3. **El *sonor* de Perigi, que es la práctica que espera, y la tensión que trae.**
   La práctica es quemar la vegetación del pantano cuando se seca, a mediados de
   agosto, y sembrar arroz al voleo o en hoyos sobre la ceniza. O sea: **la única
   práctica fechada que tenemos adentro de este polígono es la que la ficha va a
   advertir que no se haga.** Eso no es un problema, es el trabajo: la capa de
   saberes describe lo que se hizo y lo fecha, no lo recomienda, y la fuente misma
   distingue la persistencia del sistema de sus costos ecológicos. Lo que hace
   falta para escribirlo bien es **con qué se compara**: cuántas hectáreas,
   cuántos años aguanta una parcela, qué rinde, y qué pasa con las propiedades
   hidrofísicas del perfil después. Si hay trabajos que midan el *sonor* contra el
   fuego de plantación —escala, intención, control— traelos, porque la diferencia
   entre quemar dos hectáreas de pantano estacional y drenar mil para palma es la
   diferencia entre una práctica y un desastre, y la ficha tiene que poder decirla.
4. **¿Qué se puede cultivar sin drenar?** Acá hay una respuesta concreta que
   buscar: el **sagú** (*Metroxylon sagu*) crece en turba saturada sin drenaje y
   es un alimento, no un cultivo industrial; el *jelutong* (*Dyera*) da látex en
   pie. El `pantanos_sumatra` de al lado ya los nombra como especies. **El
   catálogo de cultivos de acequia no tiene id para el sagú**, así que si la
   respuesta es el sagú **va nombrado en `notas`** y no se reemplaza por un
   pariente: ése es el camino por el que un cultivo entra al catálogo.
5. **Las especies, siete u ocho, con binomial.** One Earth da la lista larga, así
   que acá lo que vale es elegir las que un diseño usaría —maderables en pie,
   látex, fruto, tolerancia a la saturación— y no copiar el párrafo. Y corregir lo
   que está mal escrito: la página pone «Callophyllum lowii» en un lugar y
   «Calophyllum lowii» en otro, y «Tristania obovate» por *obovata*.

---

## 6. Lo que vale para los dos

- **`saberes: []`, siempre.** Las prácticas van por otro encargo y las dos que
  destraban estas fichas ya están escritas: no las mandes de nuevo.
- **Siete especies con nombre común y binomial, y sólo flora.** Hay un test que
  verifica que en ese campo no entre un género de fauna. Los animales van en
  `fauna`, que es prosa.
- **`cultivos`**: ids de la primera columna del anexo, entre comillas, **sin
  mayúsculas, acentos, barras ni espacios**. Si lo que vas a escribir tiene alguna
  de esas cosas, estás copiando un nombre y no un id. Un cultivo que la región
  produce y el catálogo no tiene **se nombra en `notas`**.
- **Nada de Markdown adentro de los campos de texto.** Ni `**negrita**` ni
  comillas invertidas: esas cadenas salen tal cual en el panel y en el informe, y
  hay un test que las rechaza.
- **`verificacion`**: qué dicen esas páginas, con sus palabras, sobre **este**
  lugar.
- **`_meta.base_de_suelos_usada`**: qué abrió de verdad y qué no.
- **Un 200 no quiere decir que la página abrió, y van cuatro variedades
  distintas.** El archivo de suelos del JRC contesta 200 con 244 bytes que dicen
  «Request Rejected»; `thaiscience.info` contesta 200 con un stub;
  `sundarbanaffairswb.in` contesta 200 con su propia página de error; y
  `pub.epsilon.slu.se` contesta 200 con **la portada del portal de la
  universidad, para cualquier ruta**, 66.742 bytes de HTML que de lejos parecen un
  PDF chico. La regla que cierra las cuatro: **mirá el tipo de contenido, no sólo
  el código y el tamaño.** Un `text/html` donde esperabas `application/pdf` es el
  aviso.
- **No heredes el suelo del encabezado del bloque.** El encargo grande habla de
  andisoles volcánicos y de vertisoles del Decán. Acá no hay ni una cosa ni la
  otra: hay suelo orgánico, y es otra familia de problemas.
- Una ficha por archivo. Si una no entra en una respuesta, se corta y se sigue en
  la siguiente **sin repetir nada**, con `"continua": true` en la primera.

**Mejor una ficha que aguanta que una que rellena.** Y en estas dos, mejor una
cifra de espesor de turba que tres párrafos de descripción: de esa cifra sale un
número que el usuario va a leer antes de decidir si abre un canal.
