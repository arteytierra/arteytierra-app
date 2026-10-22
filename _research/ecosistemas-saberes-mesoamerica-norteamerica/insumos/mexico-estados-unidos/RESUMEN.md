# Resumen para implementación

## Cobertura

| Bloque | Fichas | ECO_ID cubiertos | Prioridad |
|---|---:|---:|---|
| México y frontera ecológica | 17 | 45/45 de México | alta |
| Estados Unidos continental | 20, incluidas 3 binacionales | 70/70 del territorio continental consultado | alta |
| Alaska | 2 | 18/18, incluido `Rock and Ice` | alta |
| Hawái | 2 | 5/5 | alta |

Los totales nacionales se superponen en nueve ecorregiones fronterizas; por eso no deben sumarse como polígonos únicos. La matriz registra 45 intersecciones mexicanas y 93 estadounidenses.

## Orden recomendado

1. **Importar geometría y tabla ECO_ID**. Es la condición para que la ficha sea territorial y no una inferencia climática.
2. **México**: Selva Maya, centro volcánico, Oaxaca, Tehuacán-Cuicatlán y manglares. Tienen fuentes culturales especialmente claras: Ich Kool, chinampas, metepantle, manejo forestal comunitario y tecnologías de agua.
3. **Estados Unidos continental**: Suroeste Pueblo, Grandes Lagos–manoomin, Pacífico–salmón/camas/fuego cultural, Apalaches–rivercane y Grandes Llanuras–bisonte.
4. **Hawái**: ahupuaʻa/moku como capa de gobernanza biocultural, con geometría local y revisión comunitaria.
5. **Alaska**: publicar primero ecología. El conocimiento local/tradicional y la subsistencia deben quedar como contexto no operativo hasta existir colaboración con la comunidad concreta.

## Decisiones

- Una ficha ecológica puede agrupar varios ECO_ID contiguos; la UI debe conservar el nombre RESOLVE exacto del polígono detectado.
- Los arreglos productivos actuales (silvicultura comunitaria, co-manejo pesquero, restauración de bisonte) se presentan como prácticas vivas, no como reliquias.
- `saberes` es una vista previa editorial. Producción debería normalizarlo como capa separada con `country_codes`, `tribal_nation_or_community`, `admin1`, `bbox/polygon`, `source`, `confidence`, `consent_status` y `sensitivity`.
- No mezclar automáticamente México con Estados Unidos cuando comparten ECO_ID: el desierto de Sonora o el mezquital tamaulipeco no implican una cultura homogénea.

## Vacíos deliberados

- Islas menores estadounidenses no incorporadas no están dentro del país `USA` de la geometría consultada; Puerto Rico ya está cubierto en Centroamérica-Caribe.
- Las prácticas sin fuente institucional/tribal local se dejaron como `base_ecologica` o fuera de `saberes`.
- Los datos de suelo a escala de predio deben seguir viniendo de SSURGO en Estados Unidos; estas fichas aportan contexto de paisaje, no sustituyen el diagnóstico edáfico puntual.
