# Brasil — BDiA Pedología (IBGE)

**Tipo:** suelo
**Estado:** DESCARTADA
**Prioridad sugerida:** alta

## Qué mejora sobre la fuente global

Mapa nacional oficial aproximado 1:250.000 con unidad SiBCS, orden/suborden, textura cualitativa, horizonte, erosión, pedregosidad, rocosidad y relieve. Complementaría SoilGrids con taxonomía local.

## Cobertura

Brasil completo; capa `BDIA:pedo_area`, además de puntos `BDIA:pedo_ponto`.

## Licencia

DESCARTADA por la regla dura. El WFS declara `Fees: NONE` y `AccessConstraints: NONE`, y la política federal brasileña promueve uso/reutilización, pero el metadato ISO de esta capa no nombra licencia ni contiene `resourceConstraints`. No alcanza para afirmar reutilización comercial del producto concreto. Metadato: https://metadados.inde.gov.br/geonetwork/srv/por/csw?service=CSW&version=2.0.2&request=GetRecordById&elementSetName=full&outputSchema=csw%3AIsoRecord&id=5b547ba5-321d-44af-aeda-1b3d6612e695

## Acceso técnico

WFS 1.0/1.1/2.0. Ejemplo:

`GET https://geoservicos.ibge.gov.br/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=BDIA%3Apedo_area&outputFormat=application%2Fjson&maxFeatures=1&propertyName=id1%2Cnom_unidad%2Clegenda%2Cordem%2Csubordem%2Cgrande_gru%2Csubgrupos%2Ctextura%2Chorizonte%2Cerosao%2Cpedregosid%2Crochosidad%2Crelevo&bbox=-46.64%2C-23.56%2C-46.63%2C-23.55`

## Campos que devuelve

`nom_unidad`, `legenda`, `ordem`, `subordem`, `grande_gru`, `subgrupos`, `textura`, `horizonte`, `erosao`, `pedregosid`, `rochosidad`, `relevo`.

## Qué falta o qué no da

Licencia exacta. Tampoco devuelve porcentajes numéricos de arcilla/arena/limo, pH, MO o Ksat; para esos campos seguiría SoilGrids.

## Verificación

Probado el 2026-08-31. Respuesta real recortada:

```json
{"features":[{"id":"pedo_area.63811","properties":{"nom_unidad":"CXa4","legenda":"CXa - Cambissolo Háplico Alumínico","ordem":"CAMBISSOLO","textura":"argilosa e média","horizonte":"A moderado","relevo":"montanhoso e escarpado"}}],"numberMatched":2}
```
