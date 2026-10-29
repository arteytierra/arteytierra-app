# Resumen para implementación

Se proponen **21 fichas ecológicas** y **10 capas culturales locales**. Con ellas se cubren los tipos terrestres de RESOLVE presentes en Centroamérica y el Caribe: bosques húmedos y secos, bosques montanos y pinares tropicales, sabanas de pino, humedales inundables, matorrales xéricos y manglares.

## Prioridad sugerida

| Prioridad | Ficha o capa | Motivo |
|---|---|---|
| 1 | `corredor_seco_centroamericano` + Quesungual/Kuxur Rum | Alta utilidad agronómica y adaptación a sequía; fuentes FAO específicas. |
| 1 | `talamanca_caribe_sur` + cacao Bribri/Cabécar | Sistema agroforestal bien documentado por CATIE, con cobertura territorial clara. |
| 1 | `selva_maya_peten_yucatan` + milpa maya/concesiones forestales | Continuidad ecológica regional y fuentes FAO/UNESCO. |
| 1 | `bosawas_mosquitia_pinares_humedos` + conocimiento Mayangna | Gran vacío actual; fuente UNESCO participativa y específica. |
| 1 | `darien_humedo_panama` + nainu Guna | Práctica territorial documentada y fácil de separar por comarca. |
| 2 | Cuba: bosque, karst, pinares y humedales + Viñales/conuco | Buenas fuentes UNESCO y FAO; requiere separar ecorregión de paisaje cultural. |
| 2 | Jamaica húmeda + Cockpit Country Maroon | Fuente patrimonial oficial; activar solo dentro del área protegida. |
| 2 | Antillas Menores + agroforestería Kalinago de Dominica | Útil y documentada; no trasladar a todas las islas. |
| 2 | Hispaniola húmeda/seca/pinar + conservación campesina haitiana | Alta relevancia, pero hace falta geometría subnacional. |
| 2 | Manglares mesoamericanos y antillanos | Ecosistema prioritario; los saberes pesqueros deben ser locales. |
| 3 | Bahamas, Puerto Rico, Trinidad y Tobago, matorral xérico caribeño | Fichas ecológicas listas; conviene una segunda ronda participativa antes de agregar saberes culturales detallados. |

## Cambio mínimo recomendado en el modelo

El mapeo actual `ECO_ID -> ficha` alcanza para ecología, pero no para cultura. Claude debería mantener dos resoluciones independientes:

```text
ECO_ID                         -> ficha ecológica
ECO_ID + país + área local     -> saber o práctica contextual
```

El campo `saberes` de las fichas funciona como vista previa editorial. Para producción conviene mover cada entrada a una tabla separada con `country_codes`, `admin1`, `bbox/polygon`, `fuente`, `confianza` y `consentimiento_requerido`.

## Salvaguardas editoriales

- Usar tiempo presente solo cuando la fuente describe una práctica viva.
- No llamar “ancestral” a toda práctica campesina; distinguir indígena, afrodescendiente y tradición rural local.
- No inferir que una comunidad ocupa toda la geometría de RESOLVE.
- No convertir manejo de fuego, plantas medicinales o sitios sagrados en instrucciones operativas.
- Identificar especies introducidas en sistemas tradicionales (café, cítricos, plátano) sin confundirlas con vegetación nativa.
