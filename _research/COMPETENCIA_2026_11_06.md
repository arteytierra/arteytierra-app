# Relevamiento de competencia de acequia

Fecha del relevamiento: **6 de noviembre de 2026**.
Método: búsqueda web más lectura directa de las páginas de cada producto.
Todo lo que figura acá se leyó en el sitio del producto, salvo donde se aclara
que es una afirmación de marketing sin verificación independiente.

> Las páginas cambian. Cada dato de abajo vale a la fecha del encabezado.
> Antes de decidir algo sobre esta base, volver a mirar.

---

## Resumen en una línea

Hay cuatro productos vivos que se parecen a acequia, y **ninguno de los cuatro
calcula una magnitud física**. Dibujan, clasifican capas y cuentan celdas.
Ninguno dice cuántos metros cúbicos junta una represa, cuántos milímetros
escurren con una tormenta de diez años, cuánta evapotranspiración hay, cuántos
equivalentes vaca entran ni cuánto suelo se pierde.

El revés: **LandScope gana en relieve**, con LiDAR público de 0,5 a 2,5 m en
catorce países, dos de ellos (Países Bajos y Suiza) justo los que acequia tiene
pendientes.

---

## Tabla comparativa

| | Cobertura | Fuentes citadas | ¿Calcula física? | Precio |
|---|---|---|---|---|
| LandScope | 14 países con LiDAR | sí, por país y resolución | no | USD 449-549/mapa · 3.960/año |
| Permalogica | no lo dice | ninguna | no | USD 250/proyecto |
| Keyline | sólo EE. UU. | 3DEP, NAIP, lidar Oregon | no | detrás del login |
| Permacultr | global | ERA5, SoilGrids, SRTM, OpenTopoData | no | gratis (public preview) |
| **acequia** | global + 6 DEM nacionales | sí, con rango de validez | **sí** | USD 7-35/mes |

---

## 1. LandScope — https://landscope.earth/

El más maduro y el competidor más directo.

- **Quién:** Mitch Rawlyk (BSc Earth System Science, MSc Applied Meteorology,
  certificado de ciencia de datos aplicada del MIT), con campo propio en
  Alberta central, Canadá. CTO: Kyle "Mickey". La página dice que arrancó en
  **septiembre de 2024**.
- **Estado:** workshop en vivo de **LandScope V2 el 12 de noviembre de 2026**.
  Es el único de los cuatro con un lanzamiento en curso.
- **Qué entrega:** workspace web con 25+ capas derivadas de LiDAR — elevación,
  hillshade, curvas a 0,5 / 1 / 2 / 3 m, pendiente en 10 clases (grados y %),
  aspecto en 8 direcciones, **TWI por percentiles (90 / 92,5 / 95)**,
  acumulación de flujo (conteo de celdas aguas arriba), red de drenaje en 4
  clases y **geomorphons en 10 clases**. Mapa 3D, polígonos, secciones
  transversales, medición y comentarios.
- **Cobertura con resolución, tal como la publica:**

  | País | Fuente | Resolución |
  |---|---|---|
  | Estados Unidos | USGS 3DEP | 1 m |
  | Canadá | NRCan HRDEM | 1 m |
  | Inglaterra | Environment Agency | 1 m |
  | Escocia | Scottish Government | mejor disponible |
  | Gales | DataMapWales | 1 m |
  | Irlanda | GSI | 1 m |
  | Nueva Zelanda | LINZ | 1 m |
  | **Países Bajos** | AHN | **0,5 m** |
  | Francia | IGN LiDAR HD / RGE ALTI | 0,5-1 m |
  | **Suiza** | swisstopo | **0,5 m** |
  | Noruega | Kartverket | 1 m |
  | Austria | BEV | 1 m |
  | Portugal | DGT | 0,5 m (continental) |
  | **Uruguay** | IDEuy | **2,5 m** |

  Fuera de esa lista acepta que el usuario suba su propio DEM. La FAQ dice que
  en EE. UU. el 85 % tiene cobertura inmediata y el resto "within 72 hours".
  **Inconsistencias de su propia web:** el texto dice "12 countries" y la tabla
  lista 14; la FAQ nombra México, Polonia, España, Italia y Australia, que no
  están en la tabla, y omite Noruega, Países Bajos, Irlanda y Uruguay, que sí.
- **Qué NO calcula:** da estadísticas de elevación (máx, mín, media, desvío),
  pendientes en grados y %, y conteo de celdas. No hay volúmenes en m³,
  escurrimiento en mm, caudales, ETP, carga animal ni erosión. La guía menciona
  "cut-and-fill volumes" como uso posible, sin describir el cálculo. Reglas de
  pulgar como "cada 0,7 m de elevación da 1 PSI" o "las laderas al sur reciben
  40 % más radiación" son texto de marketing, no salida del producto.
- **Exporta:** KML, GeoTIFF, PDF, Shapefile, DXF, SVG. Además .kmz para Google
  Earth Pro y PNG.
- **Precios (USD):** demo gratis de 7 días a resolución completa, después
  "scouting mode" de baja resolución sin exportaciones. **Unlock One Map: 449
  durante el demo, 549 después**, pago único, acceso permanente a ese mapa, un
  colaborador; extras a 14/mes. **Atlas: 3.960/año**, o 397/mes con compromiso
  de 12 meses (4.764 total): mapas ilimitados, dueño + 2 colaboradores, extras
  a 29/mes, clientes ilimitados sin cargo. Un mapa comprado se acredita contra
  Atlas si se hace upgrade dentro de los 60 días.
- **Idioma:** sólo inglés.

## 2. Permalogica — https://www.permalogica.com/landanalysis

El único que usa "regenerativo" como posicionamiento explícito.

- **Quién:** oficina en Singapur (68 Circular Road); campo, laboratorio y
  estudio en Bayramiç, Çanakkale, Türkiye. La carta de /about está firmada
  "— Hakan", sin apellido ni cargo. Copyright 2023-2026. Sin changelog.
- **Qué entrega:** un análisis por proyecto con cuatro ejes — Solar, Topografía,
  Hidrología y Clima. Topografía: elevación, hillshade, tinted hillshade,
  curvas, aspecto y pendiente con categorías. Hidrología: áreas de captación,
  cauces y órdenes de cauce. Clima: temperatura, precipitación, viento,
  "humidynamics", condiciones de suelo y calidad del aire.
- **Formato:** un KMZ para explorar en Google Earth, visualizaciones PNG y los
  datos crudos en CSV, más "summary metrics" sin detallar. Curvas de nivel en
  **DXF para AutoCAD**.
- **Asistente de IA "Ada":** responde preguntas en lenguaje natural sobre los
  datos del propio proyecto. No nombra el modelo que usa.
- **Fuentes de datos:** **ninguna nombrada**, en ninguna de las páginas leídas.
  La única referencia es que la precisión depende de "the elevation data
  available for your land". **Tampoco dice si es global o sólo EE. UU.**; el
  demo es Golden Gate Park.
- **Qué NO calcula:** ningún número de escurrimiento, volumen, ETP, caudal,
  carga animal ni erosión. La hidrología muestra cuencas y órdenes de cauce sin
  nombrar el método (no aparece Strahler ni otro).
- **Precios (USD):** demo gratuita sin tarjeta sobre Golden Gate Park, con Ada
  incluido. **250 por proyecto** — "you only pay when you run an analysis on
  your own land"; no aclara si es pago único. Ada: un mes incluido, después
  10/mes por proyecto. No hay planes de suscripción: el cobro es por proyecto.
  Dice que si los datos de elevación son gruesos, avisa antes de cobrar y baja
  el precio.
- **Idioma:** sólo inglés.
- **Sin leer:** /sunanalysis, /climateanalysis, /resources, blog.

## 3. Keyline — https://keyline.land/

El más cercano en vocabulario y el más lejano en alcance.

- **Quién:** una persona sola, **Andrew Haupt**. © 2026.
- **Qué es:** un **estudio de dibujo** ("drafting studio for land and water site
  design"), no un motor de análisis. Se traza sobre satelital atenuada: tanques,
  cañerías, canteros, estructuras, swales y líneas de propiedad.
- **Lo que sí hace bien:** la cañería conoce sus extremos. Se engancha a
  tanques, uniones y terminales, y la app mide **del dibujo** largo, caída y
  orden de flujo — ejemplo real de la portada: 2" main, 318 LF, fall 14,2 FT ·
  4,5 %. De ahí sale una **planilla de cañerías ordenada por flujo** (P-01
  318 LF, P-02 214 LF, P-03 96 LF, total 628 LF) y una **lámina con rótulo,
  planilla de rasgos, notas, norte y escala**, que no copia el dibujo sino que
  se genera de la geometría.
- **Datos:** curvas de **USGS 3DEP** y de lidar estatal donde el estado lo
  publica (cita Oregon DOGAMI), imágenes **USDA NAIP**, OpenStreetMap.
  **Sólo Estados Unidos.** Unidades imperiales (LF, FT).
- **Qué NO calcula:** nada hidrológico ni agronómico. Mide geometría dibujada.
- **Precio:** no visible; todo detrás de /sign-in.
- **Encuadre:** la página cita a **P. A. Yeomans, 1954** y el hallazgo de la
  keyline como origen del método. Mismo linaje conceptual que acequia.
- **Idioma:** sólo inglés.

## 4. Permacultr — https://permacultr.io/

El único global y el único gratis. El más parecido a acequia en arquitectura
de datos.

- **Quién:** **no lo dice.** Sin empresa, sin país, sin blog, sin changelog.
  Sólo "© 2026 Permacultr" y un /llms.txt. La app está en app.permacultr.io.
- **Qué entrega:** se dibuja el perímetro como polígono y se superponen capas,
  agrupadas en "Boundaries & Infrastructure", "Water systems", "Soil & Landform"
  y "Plants & Crops": curvas, pendiente, aspecto, elevación, pH, textura y
  carbono orgánico del suelo, normales climáticas de temperatura, precipitación
  y viento **resumidas por polígono**, rosa de vientos, caudal de agua y
  construcciones existentes. Permite croquizar zonas, swales, canteros, cercos
  y senderos con anotaciones.
- **Fuentes nombradas:** **OpenStreetMap, Copernicus ERA5, OpenTopoData,
  SoilGrids y SRTM**, más "regional datasets where available" sin nombrarlos.
  No publica resoluciones. No menciona lidar ni 3DEP.
- **Qué NO calcula:** nada. Es visualización de capas y resúmenes por polígono.
- **Exporta:** no menciona ningún formato de salida.
- **Precio:** "**Free during the public preview**". Sin planes publicados y sin
  fecha de fin de la preview.
- **Idioma:** sólo inglés.

## 5. Permaculture Practice — NO es un producto

https://permaculturepractice.com/permaculture-design-software/ es un **artículo
de blog** actualizado en noviembre de 2026, firmado "Perma", que lista QGIS,
Whitebox GAT, SAGA GIS, SketchUp, CAD libres, SAGE (permaculturegardens.org) y
"Adaptive Habitat Land Design" (un programa que corre dentro de Google Earth
Pro, con generador de curvas de 1 a 2 m). Aparece primero en Google y por eso
parece competencia. **No lo es.** Queda anotado para no volver a perder tiempo.

---

## Adyacentes: no compiten, pero son vecinos

**Overyield (Propagate)** — https://www.overyield.com/
El único de la vuelta con plata institucional: **USD 10 M de Serie A en 2022**,
con AgFunder entre los inversores (fundador: Ethan Steinberg). Diseña sistemas
agroforestales con mapas, suelo y clima, y **modela la economía** a nivel de
hilera, lote o varios campos. reNature lo adoptó. Afirman haber bajado el mapeo
de una instalación de 80 horas a 8 — claim propio, sin medición independiente.
Es SaaS por suscripción. **No hace hidrología ni obras de tierra.**

**Pastoreo** — segmento armado, maduro y barato.

- **PastureMap** (Grassroots Carbon): registra movidas, períodos de pastoreo y
  días de descanso, calcula carga y capacidad de carga y reporta días-animal por
  acre. **USD 10/mes** por 50 animales y un miembro de equipo (precio leído el
  5/11/2026). Maneja potreros, portones y aguadas.
- **AgriWebb**: el módulo de Grazing Planning dice cuántos días de pastoreo
  queda cada potrero, calculado desde el forraje disponible y el descanso
  objetivo, más una herramienta de carga a capacidad de carga.
- **MaiaGrazing**: armado alrededor del "grazing clock"; sigue la lluvia junto
  con los eventos de pastoreo para estimar capacidad de carga.

Son **registro y gestión del rodeo** — qué pasó y qué hacer la semana que
viene —, no análisis del territorio antes de tener animales. Ninguno publica que
implemente el marco de planificación de Holistic Management.

**LandPKS / Terraso** — https://landpks.terraso.org/
Tech Matters (ONG) con USDA-ARS. Gratis y de código abierto. **Soil ID global
desde octubre de 2025**: identifica suelos en el campo, offline, en cualquier
parte del mundo. El LandPKS Classic calcula la **Land Capability Classification**
desde pendiente, textura y limitantes del suelo. Hay un Story Maps y una app de
monitoreo en el roadmap. Es app de celular para **relevar**, no plataforma de
diseño, pero es el que más se parece a acequia en ética de datos abiertos.

---

## Argentina y Latinoamérica: no hay producto

- **INTA**: liberó un ejecutable de **USLE-RUSLE** para estimar pérdida de suelo
  por erosión en cualquier lote del país, de uso libre, con cinco factores
  (clima, suelo, topografía, cultivo, prácticas). Y **ID Geo**
  (https://geo.inta.gob.ar/) es repositorio abierto de datos geoespaciales de
  suelo, agua, clima y meteorología, con visor, geoservicios y geoportales
  regionales.
- **Koterra** (Chile, https://www.koterra.cl/): consultoría. Aplica Keyline y
  la metodología Regrarians con **Civil 3D, Global Mapper y QGIS a mano**.
  Ordena el diseño partiendo del clima y la topografía.
- **BioM** (Argentina, https://biom.com.ar/): consultoría. Parte de un DEM de
  alta resolución y combina **DEM Copernicus, 1.697 imágenes Sentinel-2
  (2016-2026) y la Carta de Suelos del INTA**.
- **Manejo de Suelo Regenerativo** (Chile): medición de suelo con sensores y
  laboratorio, centralizado en la nube (AgCloud).

**Koterra y BioM no son competencia: son el perfil del cliente.** Hoy hacen a
mano, proyecto por proyecto, con Civil 3D y QGIS, lo que acequia resuelve en una
sesión.

---

## Qué se hace con esto

**1. Mirar la V2 de LandScope el 12 de noviembre de 2026.** Es el único con un
lanzamiento en curso y el único con perfil técnico fuerte detrás. Si en la V2
aparece un cálculo con número —un volumen, un caudal, un escurrimiento— cambia
el tablero, porque tiene la base de relieve para hacerlo bien.

**2. Cerrar Países Bajos y Suiza**, ya anotados como pendientes en el DEM, y
considerar **Uruguay (IDEuy, 2,5 m)**, que abre el país vecino con dato
nacional. Noruega, Austria y Portugal son el escalón siguiente.

**3. Decirlo en la vidriera.** Lo único que separa a acequia de los cuatro es
que **devuelve números con fuente citada, unidad explícita y rango de validez**,
con un test contra un caso resuelto de la literatura detrás de cada uno. Los
otros venden capas; acequia vende una respuesta. Eso hoy no está dicho en
ningún lado. Ver el contrato en la skill `motor-de-calculo` y en
`apps/terreno/lib/README.md`.

**Nota sobre precio.** Están entre diez y cien veces arriba: LandScope cobra por
un solo mapa cinco veces lo que acequia cobra por un año de Profesional. Puede
leerse como que acequia deja plata sobre la mesa o como que ataca un mercado que
ellos no pueden servir, y las dos cosas pueden ser ciertas a la vez. Lo que sí
indica es que **nadie compite por precio en este nicho**, y que el productor que
no puede pagar USD 449 por un mapa hoy no tiene a quién comprarle.
