# Informe de investigación — ampliación geográfica de acequia

Fecha de cierre: 30/08/2026.

## Qué encontré

El problema de `determinarBioma` no se corrige agregando más excepciones de latitud y longitud. Köppen describe el régimen térmico y de lluvias, pero no la historia biogeográfica, el sustrato ni la comunidad de especies. Puerto Rico, el Piedmont estadounidense y el nordeste argentino pueden compartir `Cfa` y requerir fichas completamente distintas. La salida robusta es separar clima, bioma global y ecorregión regional.

La capa más práctica para esa separación es [RESOLVE Ecoregions 2017](https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017). Tiene 846 ecorregiones, 14 biomas, un `ECO_ID` estable y licencia CC BY 4.0. Además de la descarga oficial, encontré un [FeatureServer público](https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/Resolve_Ecoregions/FeatureServer/0) que respondió consultas por punto y devuelve `ECO_ID`, `ECO_NAME`, `BIOME_NUM`, `BIOME_NAME`, `REALM` y `LICENSE`. No tiene SLA; por eso la recomendación no es depender ciegamente de ese servidor, sino consultarlo desde backend, cachear y mantener una copia propia de contingencia.

No existe un artefacto oficial simplificado menor de 2 MB que yo pudiera verificar. La descarga mundial ronda 150 MB comprimidos y el catálogo advierte que algunas geometrías superan el millón de vértices. Comprimir todo a menos de 2 MB en el bundle comprometería islas, costas y límites montanos, precisamente donde acequia necesita ser más honesta. El cliente no debería cargar el mundo para resolver un punto.

La taxonomía actual de 12 fichas se rompe porque mezcla escalas: `pampa` y `espinal` son unidades regionales; `mediterraneo` es un bioma climático amplio; `puna_altoandino` agrega altura y región. Propongo conservar esas fichas como perfiles sudamericanos, no como lista exhaustiva mundial. La clasificación nueva tiene tres pasos: bioma RESOLVE global, sobrescritura por `ECO_ID` curado y Köppen completo como respaldo. La [tabla completa](./clasificador.md) mapea los 14 `BIOME_NUM` y registra los `ECO_ID` verificados para las 22 fichas nuevas.

Las fichas separan las tres praderas norteamericanas porque su régimen hídrico, fuego y aptitud de manejo cambian mucho entre tallgrass, mixed y shortgrass. También separan el chaparral californiano del mediterráneo europeo. Que ambos entren en el bioma 12 de RESOLVE no autoriza a mezclar especies, pueblos ni sistemas agrarios. En cambio, el karst caribeño no se convirtió en bioma: es una condición geológica e hidrológica que atraviesa bosque húmedo y seco. Conviene mostrarlo como alerta superpuesta de infiltración, suelo somero, dolinas y vulnerabilidad del acuífero.

Los análogos quedaron por clase Köppen completa, no por grupo grueso. Incluí 21 clases y excluí `EF`. Hielo perpetuo no tiene uso agrícola terrestre real; cualquier instalación cerrada sería una infraestructura independiente del clima exterior, no un análogo del territorio. `ET` sí quedó porque existen usos productivos reales: pastoreo de renos Sámi, agricultura altoandina con waru-waru y qochas, y horticultura protegida en Alaska. `Dwb` tiene muy poca representación en la ronda América–Europa; se limitó a sectores de la Rusia europea y se marcó con regiones concretas, sin abrir la investigación a Asia.

En datos, tres fuentes ofrecen una mejora inmediata. [Daymet](https://daymet.ornl.gov/web_services.html) entrega series diarias de una celda de 1 km por REST en Norteamérica y Puerto Rico. [CaPA-HRDPA](https://open.canada.ca/data/en/dataset/c7c9d726-c48a-49e3-98ab-78a1ab87cda8) cubre Canadá a 2,5 km y combina pluviómetros, radar y modelo. [Soil Data Access](https://sdmdataaccess.nrcs.usda.gov/WebServiceHelp.aspx) expone SSURGO por REST, WFS y WMS, con un detalle mucho más útil que SoilGrids para predios de Estados Unidos y Puerto Rico. Para Europa, [CERRA-Land](https://cds.climate.copernicus.eu/datasets/reanalysis-cerra-land?tab=overview) cubre el norte fuera de CHIRPS a 5,5 km desde 1984 y agrega nieve, suelo y escorrentía.

## Qué no pude verificar

No encontré una API oficial, pública y documentada de consulta por punto para WWF TEOW. Tampoco encontré una licencia comercial inequívoca en su página de distribución. Aunque TEOW es la base histórica de muchas clasificaciones, RESOLVE es más claro para un SaaS por actualización y licencia.

La página trinacional [EPA/CEC de ecorregiones norteamericanas](https://www.epa.gov/eco-research/ecoregions-north-america) ofrece shapefiles y metadatos, pero no declara una licencia única de reutilización para la compilación Canadá–Estados Unidos–México. No asumiría que toda la compilación es dominio público sólo porque EPA la aloja. Se puede usar como control técnico mientras se pide confirmación de licencia.

No encontré una API pública contractual para CLICOM del SMN/CONAGUA. La [consulta oficial](https://smn.conagua.gob.mx/en/climatologia/informacion-climatologica/informacion-estadistica-climatologica) informa más de 5.400 estaciones y permite visor/KMZ, pero automatizarla sería scraping y la licencia comercial no está expuesta. En el inventario quedó `null`. Para México y el Caribe, GHCN-Daily vía NOAA puede cubrir parte de las estaciones, pero no reemplaza la validación con cada instituto nacional.

Tampoco encontré una red oficial unificada de estaciones del Caribe con API y licencia común. Puerto Rico entra bien por NOAA/USDA; en el resto de las Antillas habrá que revisar país por país. La ausencia de una API no significa ausencia de datos: significa que acequia no debería prometer integración automática hasta verificar acceso, calidad y reutilización.

La sorpresa negativa de suelo europeo fue [LUCAS Topsoil](https://esdac.jrc.ec.europa.eu/projects/LUCAS/Documents/LUCAS_SOIL_LIC_AGR_final_for_web.pdf). Es una fuente técnica excelente, pero el acuerdo publicado consultado limita el uso a fines no comerciales. Además son muestras puntuales, no un mapa predial. Lo marqué como incompatible con el SaaS salvo autorización específica; no conviene ocultar esa restricción detrás de “datos abiertos”.

## Qué me sorprendió

El mayor hallazgo operativo fue que RESOLVE sí tiene un servicio ArcGIS de consulta utilizable sin clave, aunque no esté presentado como API de producto en su página principal. Probé puntos de Puerto Rico, California, Grandes Llanuras, México, Canadá y Europa, y obtuve `ECO_ID` coherentes. Eso permite resolver el bug crítico sin enviar 150 MB al navegador.

También sorprendió la calidad de las alternativas para la brecha norte de CHIRPS. Daymet llega a 1 km y CaPA-HRDPA a 2,5 km; [CHELSA-W5E5](https://www.chelsa-climate.org/datasets/chelsaw5e5) ofrece 1 km global bajo CC0, aunque termina en 2016. Ninguna debe venderse como pluviómetro local: son campos modelados o analizados y tienen que convivir con estaciones y sus limitaciones.

En Europa hay un contraste fuerte entre buenos servicios interoperables y taxonomías difíciles de operacionalizar. EEA ofrece un MapServer público de regiones biogeográficas y Copernicus expone [EU-Hydro](https://copernicus.discomap.eea.europa.eu/arcgis/rest/services/EUHydro/EU_Hydro_RiverNetworkDatabase/MapServer). EUNIS, en cambio, es una clasificación excelente para describir hábitats pero no un único mapa autoritativo de punto. No conviene confundir un vocabulario con una cobertura espacial completa.

Detecté además un error conceptual en lo ya existente: calcular Köppen con climatologías POWER de unos 50 km puede desplazar clases cerca de costas, montañas e islas. [Beck et al. 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10593765/) ofrece Köppen-Geiger a 1 km bajo CC BY 4.0. No reemplaza RESOLVE, pero sería un respaldo climático mejor que la clasificación derivada de POWER. Hace falta hostear el ráster o convertirlo a COG; no encontré una API oficial de punto.

## Las cinco prioridades que tomaría

1. **Cambiar primero el clasificador, no el contenido.** Implementaría RESOLVE por punto desde backend con caché y copia propia. Si el `ECO_ID` no tiene ficha curada, mostraría el bioma global; nunca una ficha sudamericana por descarte.
2. **Integrar las 22 fichas con una lista blanca de `ECO_ID`.** Activaría saberes culturales sólo cuando coincidan ecorregión y país documentados. Para predios que cruzan límites, después calcularía porcentaje de área por ecorregión en lugar de usar sólo el centroide.
3. **Agregar Daymet y CaPA-HRDPA.** Daymet resuelve rápidamente series diarias a 1 km en Norteamérica y Puerto Rico; CaPA mejora la lluvia operacional en Canadá. Mantendría CHIRPS donde ya funciona y declararía cuál fuente calibró cada resultado.
4. **Agregar SSURGO antes que otra capa global de suelo.** En Estados Unidos y Puerto Rico aporta un salto de escala real. Conservaría SoilGrids como fallback y mostraría survey, fecha, escala y profundidad de cada propiedad.
5. **Reemplazar el Köppen de 50 km por Beck 1 km como respaldo y eje de análogos.** Mantendría los análogos independientes del bioma. Después sumaría estaciones oficiales por país empezando por NOAA, Environment Canada, DWD, Met Éireann, AEMET y Météo-France.

## Criterio de publicación

Antes de incorporar cualquier fila del inventario, guardaría en una ficha de procedencia: título oficial, organismo, versión, fecha de acceso, resolución, período, endpoint, licencia y limitación operativa. Si una consulta falla, la interfaz debe decir qué fallback usó. Si no hay licencia o API verificable, el dato queda afuera. Esa regla es más importante que completar el mapa.
