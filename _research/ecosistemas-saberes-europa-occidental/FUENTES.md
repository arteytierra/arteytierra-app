# Fuentes — Europa occidental

Consultadas el **3 de septiembre de 2026**. Las once URL citadas en las fichas fueron verificadas con petición HTTP: todas devuelven 200.

## Fuente primaria de ecorregiones

- **RESOLVE Ecoregions 2017** (Dinerstein et al., *BioScience*), CC BY 4.0, consultado vía el FeatureServer público de ArcGIS que ya usa `apps/terreno/app/api/bioma/route.ts`. Es la única fuente de ECO_ID de este relevamiento: los 20 ECO_ID en alcance se obtuvieron preguntando por coordenada, no leyendo listados. Los 80 puntos y sus respuestas están en `insumos/puntos-verificados.tsv` y son reproducibles.
  `https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/Resolve_Ecoregions/FeatureServer/0/query`

## Regionalización y hábitats europeos

- EEA — Biogeographical regions in Europe · `https://www.eea.europa.eu/en/analysis/maps-and-charts/biogeographical-regions-in-europe-2`
- EEA — EUNIS habitat classification · `https://www.eea.europa.eu/en/datahub/datahubitem-view/638330ea-90e6-4e41-81ea-e70f25ae7117`
- JNCC — Habitats Directive, H91C0 Caledonian forest · `https://sac.jncc.gov.uk/habitat/H91C0/`
- JNCC — UK BAP priority habitats · `https://jncc.gov.uk/our-work/uk-bap-priority-habitats/`
- Natural England — National Character Area profiles · `https://www.gov.uk/government/publications/national-character-area-profiles-data-for-local-decision-making`
- IUCN UK Peatland Programme · `https://www.iucn-uk-peatlandprogramme.org/`

## Suelos

- JRC ESDAC — European Soil Data Centre · `https://esdac.jrc.ec.europa.eu/`

## España y Portugal

- MITECO — Mapa Forestal de España · `https://www.miteco.gob.es/es/biodiversidad/servicios/banco-datos-naturaleza/informacion-disponible/mfe50.html`
- MITECO — Lucha contra la desertificación · `https://www.miteco.gob.es/es/biodiversidad/temas/desertificacion-restauracion/lucha-contra-la-desertificacion.html`
- UNCCD — Desertification overview · `https://www.unccd.int/land-and-life/desertification/overview`

## Sistemas agroforestales

- FAO — Agroforestry in central, northern and eastern Europe · `https://www.fao.org/4/y1935e/y1935e03.pdf`

## Ya citadas en `lib/biomasRegionales.ts` y reutilizables

Estas ya están en el repo y siguen siendo válidas para las fichas europeas existentes: FAO GIAHS Montado de Serpa, FAO State of Mediterranean Forests 2018, FAO GIAHS Lanzarote, Gobierno de Canarias — directrices de ordenación del suelo agrario, UNESCO — riego tradicional, Comisión Europea — Natura 2000 en la región alpina.

## Nota sobre una fuente descartada

`nature.scot` devuelve 403 a cualquier petición automatizada, incluida la raíz del sitio. El contenido existe y es válido, pero como no se puede verificar programáticamente se citó en su lugar la ficha de la Directiva Hábitats de JNCC para el bosque caledonio, que sí responde 200 y cubre lo mismo.

## Vacíos declarados

- **Bélgica, Países Bajos y Luxemburgo** no tienen acá una fuente edafológica nacional propia; se apoyan en ESDAC. Si el pase de fuentes de suelo y clima llega a Europa occidental, corresponde relevar BIS (NL), la Carte des sols de Wallonie y la Databank Ondergrond Vlaanderen.
- **Suiza** tampoco: falta relevar swisstopo y la Bodenkarte federal. Queda anotado junto al pendiente ya existente de Suiza en el DEM.
- **Francia** tiene el RRP y GIS Sol, no relevados todavía.
- Para los tres saberes con cartografía oficial existente — cañadas reales, polders y waterschappen, crofting townships — falta verificar licencia antes de usar cualquier geometría.

## Credenciales

Ninguna. No hay claves de API, tokens ni credenciales en esta carpeta: todas las consultas fueron a servicios públicos sin autenticación.
