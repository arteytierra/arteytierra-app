# Clasificador de bioma para América y Europa

Fecha de verificación: 30/08/2026.

## Decisión

Usá **RESOLVE Ecoregions 2017 como capa ecológica primaria**. Consultá por punto el `FeatureServer` público desde el backend, guardá en caché el resultado por `ECO_ID` y mantené una copia versionada de los polígonos en infraestructura propia para contingencia. Si la consulta y la copia fallan o el punto cae en `Rock and Ice`, usá la clase Köppen-Geiger completa como respaldo y mostrá una ficha climática genérica, nunca una ficha regional elegida sólo por latitud.

La lista de 12 biomas actuales no debe convertirse en la taxonomía global. Mezcla biomas, ecorregiones y unidades culturales de Sudamérica. Por ejemplo, `pampa`, `espinal` y `chaco_seco` pertenecen a escalas distintas de una clase climática `Cfa`; por eso la misma rama manda Puerto Rico al Espinal. Conviene separar tres niveles:

1. `BIOME_NUM` de RESOLVE: taxonomía global estable de 14 biomas.
2. `ECO_ID` de RESOLVE: llave espacial que selecciona una ficha regional curada cuando existe.
3. Köppen completo: respaldo climático y eje independiente para los análogos productivos.

No conviene embeber el shapefile mundial en el cliente. La descarga oficial ronda 150 MB comprimidos y varios polígonos tienen más de un millón de vértices. No encontré un GeoJSON oficial simplificado, versionado y menor de 2 MB. Una simplificación propia a ese tamaño perdería islas y bordes montanos, justamente los lugares donde la heurística actual más falla. La consulta debe ocurrir del lado servidor.

## Comparación de alternativas

| Fuente | Cobertura y unidad | Consulta y tamaño | Licencia | Estabilidad, clave y evaluación |
|---|---|---|---|---|
| **RESOLVE Ecoregions 2017** | Mundial; 846 ecorregiones, 14 biomas y 8 reinos. Polígonos ecológicos, no una grilla climática. | `FeatureServer` público con `query`, JSON y GeoJSON; descarga oficial en shapefile de unos 150 MB. Earth Engine expone `RESOLVE/ECOREGIONS/2017`, pero exige registrar un proyecto. No hay GeoJSON oficial simplificado menor de 2 MB. | CC BY 4.0, declarada en el atributo `LICENSE` y en el catálogo de Earth Engine. Permite uso comercial con atribución. | El servicio ArcGIS no pide clave y respondió a consultas por punto durante esta investigación. No publica SLA; por eso hace falta caché y copia propia. Es la mejor base global porque devuelve `ECO_ID`, `ECO_NAME`, `BIOME_NUM`, `BIOME_NAME` y `REALM`. Fuentes: [catálogo de Google Earth Engine](https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017), [visor y descarga de RESOLVE](https://ecoregions.appspot.com/), [FeatureServer público](https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/Resolve_Ecoregions/FeatureServer/0), [artículo de Dinerstein et al.](https://doi.org/10.1093/biosci/bix014). |
| **WWF Terrestrial Ecoregions of the World, TEOW 2001** | Mundial; 867 ecorregiones terrestres agrupadas en 14 biomas y 8 reinos. Es el antecesor directo de RESOLVE. | Distribución histórica como shapefile. No encontré una API oficial de consulta por punto ni un artefacto web pequeño mantenido por WWF. | El artículo es citable, pero la página de descarga no presenta una licencia de datos tan clara como CC BY 4.0. No asumir permiso comercial por el solo hecho de poder descargarlo. | Taxonomía influyente, pero más vieja y operativamente peor documentada. Sirve para trazabilidad histórica, no como dependencia nueva. Fuentes: [WWF — Terrestrial Ecoregions of the World](https://www.worldwildlife.org/publications/terrestrial-ecoregions-of-the-world), [Olson et al. 2001](https://doi.org/10.1641/0006-3568(2001)051%5B0933:TEOTWA%5D2.0.CO;2). |
| **EPA/CEC Ecoregions of North America, niveles I–III** | Canadá, Estados Unidos y México; 15 regiones de nivel I, 50 de nivel II y 182 de nivel III. | Shapefiles de 28 MB, 30 MB y 34 MB. La página oficial no documenta una API de punto. Habría que hostear el vector o cargarlo en una base espacial. | Los datos de agencias federales de EE.UU. suelen ser de dominio público, pero la compilación trinacional no declara en su página una licencia de reutilización única. Verificar con EPA/CEC antes de redistribuirla en el producto. | Muy buena capa de control regional y más jerárquica que RESOLVE, pero no cubre Europa ni el Caribe insular. Sin clave; estabilidad alta de la descarga, integración media. Fuente: [US EPA — Ecoregions of North America](https://www.epa.gov/eco-research/ecoregions-north-america). |
| **EEA Biogeographical Regions** | Europa; regiones biogeográficas usadas para Natura 2000 y las Directivas de Aves y Hábitats. Es una zonificación continental relativamente gruesa. | `MapServer` público con consulta por punto y salida JSON/GeoJSON; también descarga. | Política de datos de la EEA: reutilización con atribución bajo su política abierta, con excepciones indicadas por dataset. Verificar la ficha concreta al descargar. | Sin clave y con infraestructura pública estable. Es un buen control para Europa, pero no distingue hábitats productivos con la granularidad de una ecorregión. Fuentes: [EEA — Biogeographical regions in Europe](https://www.eea.europa.eu/en/analysis/maps-and-charts/biogeographical-regions-in-europe-2), [servicio ArcGIS de regiones biogeográficas](https://bio.discomap.eea.europa.eu/arcgis/rest/services/BioRegions/BiogeographicalRegions_LAEA/MapServer/0), [política de datos de EEA](https://www.eea.europa.eu/en/datahub/eea-data-policy). |
| **EUNIS habitat classification** | Europa; clasificación jerárquica de hábitats terrestres, dulceacuícolas y marinos. Es mucho más detallada que una ficha de bioma. | Clasificación y tablas descargables; la EEA publica mapas de tipos de hábitat, pero no hay un único servicio oficial que determine con autoridad el hábitat real de cualquier punto europeo. La clase conceptual no equivale a un mapa exhaustivo. | Cada dataset asociado debe revisarse; el catálogo EEA aplica su política de reutilización y registra excepciones. | Excelente vocabulario y fuente editorial, pero demasiado granular y fragmentada para el primer salto del clasificador. Usarla para enriquecer una ficha, no para elegirla. Fuente: [EEA — EUNIS habitat classification](https://www.eea.europa.eu/en/datahub/datahubitem-view/638330ea-90e6-4e41-81ea-e70f25ae7117). |
| **Köppen-Geiger de Beck et al. 2018/2023, 1 km** | Mundial, ráster de clases climáticas. La edición 2023 ofrece períodos históricos y proyecciones 1901–2099; la climatología reciente incluye 1991–2020. | Archivos ráster descargables. No encontré un endpoint oficial sin clave de consulta por punto; hay que hostear un GeoTIFF/COG o precalcular teselas. | El dataset 2023 se distribuye en Figshare bajo CC BY 4.0. El código tiene licencia propia y no debe confundirse con la licencia de los datos. | Más fino y reproducible que derivar Köppen de POWER a unos 50 km. Sirve como respaldo climático, pero una clase no distingue Caribe húmedo, Piedmont ni Espinal si comparten `Cfa`. Sin clave para descarga; estabilidad alta del DOI, integración media. Fuentes: [Beck et al. 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10593765/), [datos de 1 km en Figshare](https://doi.org/10.6084/m9.figshare.21789074), [Beck et al. 2018](https://pmc.ncbi.nlm.nih.gov/articles/PMC6207062/). |
| **One Earth Bioregions 2023** | Mundial; reinos, subreinos y 185 bioregiones que agrupan ecorregiones. | Visor y datos descargables; no verifiqué una API de punto con SLA. | La licencia de los datos se presenta con restricciones no comerciales. No es compatible como base de un SaaS comercial sin permiso adicional. | Es una síntesis visual útil, pero menos granular y con una barrera de licencia decisiva. Fuente: [One Earth — Bioregions 2023](https://www.oneearth.org/bioregions-2023/). |

## Consulta primaria recomendada

Endpoint probado:

```text
https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/Resolve_Ecoregions/FeatureServer/0/query
```

Parámetros mínimos para una coordenada `lon,lat`:

```text
f=json
geometry={"x":LON,"y":LAT,"spatialReference":{"wkid":4326}}
geometryType=esriGeometryPoint
inSR=4326
spatialRel=esriSpatialRelIntersects
outFields=ECO_ID,ECO_NAME,BIOME_NUM,BIOME_NAME,REALM,LICENSE
returnGeometry=false
```

El servidor declara un máximo de 2.000 registros, irrelevante para una consulta de punto. El producto no debería invocarlo desde el navegador: el backend puede normalizar respuestas, reintentar, cachear y evitar que un cambio de CORS o de dominio rompa la interfaz. Guardá también la versión de fuente (`RESOLVE 2017`) y la fecha de consulta en el informe del predio.

Para la copia propia, descargá el shapefile oficial, conservá todos los polígonos, corregí geometrías y cargalo en PostGIS o GeoPackage. Una copia simplificada puede servir para visualización, pero la clasificación por punto debe ejecutarse contra geometría completa o una simplificación cuya pérdida topológica haya sido medida. En costas e islas, si ningún polígono intersecta, probá una tolerancia máxima documentada de 1 km sólo para errores geométricos; no “acerques” automáticamente un punto marino o una isla sin cobertura.

## Mapeo global completo de RESOLVE

Esta tabla cubre todas las clases externas posibles de `BIOME_NUM`. Los identificadores `resolve_*` son fichas globales de respaldo que conviene crear; no reemplazan las fichas regionales cuando existe un `ECO_ID` curado.

| `BIOME_NUM` | `BIOME_NAME` de RESOLVE | `id` global propuesto |
|---:|---|---|
| 1 | Tropical & Subtropical Moist Broadleaf Forests | `resolve_bosque_tropical_humedo` |
| 2 | Tropical & Subtropical Dry Broadleaf Forests | `resolve_bosque_tropical_seco` |
| 3 | Tropical & Subtropical Coniferous Forests | `resolve_bosque_coniferas_tropical` |
| 4 | Temperate Broadleaf & Mixed Forests | `resolve_bosque_templado_caducifolio_mixto` |
| 5 | Temperate Conifer Forests | `resolve_bosque_coniferas_templado` |
| 6 | Boreal Forests/Taiga | `resolve_bosque_boreal_taiga` |
| 7 | Tropical & Subtropical Grasslands, Savannas & Shrublands | `resolve_sabana_tropical` |
| 8 | Temperate Grasslands, Savannas & Shrublands | `resolve_pastizal_templado` |
| 9 | Flooded Grasslands & Savannas | `resolve_pastizal_inundable` |
| 10 | Montane Grasslands & Shrublands | `resolve_montano` |
| 11 | Tundra | `resolve_tundra` |
| 12 | Mediterranean Forests, Woodlands & Scrub | `resolve_mediterraneo` |
| 13 | Deserts & Xeric Shrublands | `resolve_desierto_matorral_xerofilo` |
| 14 | Mangroves | `resolve_manglar` |
| `null` o sin intersección terrestre | Rock and Ice, geometría faltante o servicio caído | `resolve_roca_hielo` si RESOLVE lo informa; en los demás casos, ficha de respaldo por Köppen con advertencia |

## Sobrescrituras regionales para las fichas nuevas

Cuando el `ECO_ID` esté en esta tabla, usá la ficha regional. Si no está, usá el mapeo global anterior. Un mismo `ECO_ID` puede tener varios polígonos: la llave sigue siendo el número, no el `OBJECTID`.

| `ECO_ID` | `ECO_NAME` verificado por consulta | `id` de ficha |
|---:|---|---|
| 329 | Appalachian mixed mesophytic forests | `bosque_templado_caducifolio_este` |
| 392 | Flint Hills tallgrass prairie | `pradera_pastos_altos` |
| 389 | Central-Southern US mixed grasslands | `pradera_mixta` |
| 395 | Nebraska Sand Hills mixed grasslands | `pradera_mixta` |
| 396 | Northern Shortgrass prairie | `pradera_pastos_cortos` |
| 402 | Western shortgrass prairie | `pradera_pastos_cortos` |
| 435 | Sonoran desert | `desiertos_calidos_norteamericanos` |
| 428 | Chihuahuan desert | `desiertos_calidos_norteamericanos` |
| 433 | Mojave desert | `desiertos_calidos_norteamericanos` |
| 430 | Great Basin shrub steppe | `estepa_arbustiva_gran_cuenca` |
| 351 | Central Pacific Northwest coastal forests | `bosque_coniferas_pacifico_noroeste` |
| 424 | California montane chaparral and woodlands | `chaparral_californiano` |
| 376 | Mid-Canada Boreal Plains forests | `taiga_borde_agricola` |
| 330 | Appalachian Piedmont forests | `sur_templado_humedo_eeuu` |
| 399 | Southeast US conifer savannas | `sur_templado_humedo_eeuu` |
| 534 | Jalisco dry forests | `bosque_tropical_seco_mesoamericano` |
| 527 | Central American dry forests | `bosque_tropical_seco_mesoamericano` |
| 487 | Oaxacan montane forests | `bosque_mesofilo_montana` |
| 432 | Meseta Central matorral | `matorral_xerofilo_altiplano_mexicano` |
| 495 | Puerto Rican moist forests | `bosque_humedo_tropical_caribeno` |
| 543 | Puerto Rican dry forests | `matorral_seco_caribeno` |
| 793 | Iberian sclerophyllous and semi-deciduous forests | `mediterraneo_europeo` |
| 651 | Celtic broadleaf forests | `atlantico_templado_oceanico` |
| 654 | Central European mixed forests | `templado_continental_europeo` |
| 674 | Pannonian mixed forests | `estepa_pontica_panonica` |
| 717 | Scandinavian and Russian taiga | `boreal_nordico_turberas` |
| 689 | Alps conifer and mixed forests | `alpino_montano_europeo` |
| 787 | Canary Islands dry woodlands and forests | `macaronesia` |
| 668 | Madeira evergreen forests | `macaronesia` |
| 645 | Azores temperate mixed forests | `macaronesia` |

La tabla no pretende agotar los 846 `ECO_ID`: agota las clases globales y registra las ecorregiones puntualmente verificadas para las 22 fichas de esta ronda. Antes de habilitar una ficha regional en un país nuevo, agregá sus `ECO_ID` mediante una revisión explícita; no infieras el perfil por parecido del nombre.

## Respaldo Köppen y reglas de incertidumbre

1. Si RESOLVE devuelve un `ECO_ID` curado, mostrá esa ficha y registrá RESOLVE como fuente de clasificación.
2. Si devuelve un `ECO_ID` no curado, mostrá la ficha global de su `BIOME_NUM`; no fuerces una de las 12 fichas sudamericanas.
3. Si RESOLVE no responde, consultá la copia local. Si tampoco responde, usá Köppen-Geiger 1 km si está disponible; mientras tanto, podés usar la clase calculada con POWER, pero rotulala como aproximación climática de unos 50 km.
4. Köppen nunca debe elegir saberes culturales. Esos contenidos se habilitan sólo cuando el punto pertenece a una ecorregión y un país documentados en la ficha.
5. En límites, devolvé la clase del punto y advertí que un predio puede cruzar más de una ecorregión. Para polígonos de predio, la mejora posterior correcta es intersectar el lote y reportar porcentajes, no clasificar sólo su centroide.

## Dos decisiones editoriales de esta ronda

Se creó `chaparral_californiano` separado de `mediterraneo_europeo`. Comparten el bioma 12 de RESOLVE y clases `Csa/Csb`, pero difieren en especies, regímenes de fuego, historia de manejo y tradiciones productivas. Una sola ficha “mediterránea” volvería a producir contenido plausible en el lugar equivocado.

No se creó un bioma independiente para karst y mogotes del Caribe. El karst es un condicionante geológico e hidrológico que atraviesa bosques húmedos y secos. Conviene modelarlo como una alerta superpuesta —suelos someros, infiltración rápida, dolinas y vulnerabilidad del acuífero— usando geología y relieve, no como sustituto de la ecorregión.
