# Cobertura: Norteamérica (relevamiento del 27/09/2026)

| País | ¿Registro? | ¿Censo? | ¿Descargable? | Licencia apta | Qué falta |
|---|---|---|---|---|---|
| Estados Unidos | Sí: lista federal de 575 entidades (Federal Register, 30/01/2026) | Sí, 2020: AIAN alone 3.727.135 (alone or in combination 9.666.058), hasta área AIANNH y bloque | Sí (PL 94-171, PDF, TIGER) | No declarada en las páginas abiertas; es obra federal, pero eso es deducción | Confirmar el total elegido; una declaración escrita de dominio público; conteo por tribu (DHC-A) |
| Canadá | Sí: First Nations Location, 638 First Nations (ISC) | Sí, 2021: 1.807.250, por grupo y residencia | Sí (CSV y SHP/GPKG) | Sí: Statistics Canada Open Licence (permite vender) y OGL-Canada (uso comercial) | Corregir 4 nombres con «?»; resultados del censo 2026 |
| Groenlandia | No encontrado | No hay pregunta étnica (registro de población) | Sí (API PxWeb) | No declarada | No hay dato de pueblo; no se monta |

## Estado de Estados Unidos
- La API de datos del censo exige clave, así que bajé el archivo nacional PL 94-171. Total nacional: 331.449.281. AIAN alone: 3.727.135. Hay 704 áreas AIANNH (nivel 250).
- La Supplementary Table 1 da AIAN alone 3.727.135, in combination 5.938.923 y alone or in combination 9.666.058. La tabla advierte que «alone or in combination» suma más que la población total.
- Pregunta de raza 2020 copiada del cuestionario oficial. La casilla AIAN pide la «enrolled or principal tribe» y da como ejemplos «Mayan» y «Aztec».
- Aviso 2026-01899 del Federal Register: «575 Tribal entities», incluida la alta de Lumbee. No conté las filas porque el PDF está a tres columnas.
- Tribal Leaders Directory (BIA): 602 filas, con datos personales de autoridades. No es la lista legal de 575.
- TIGER 2024 AIANNH: 864 polígonos (617 reservas o áreas estadísticas, 247 trust lands).

## Estado de Canadá
- Tabla 98-10-0264-01, con 75.600 filas. A nivel nacional: Indigenous identity 1.807.250 sobre 36.328.480. First Nations 1.048.405; Métis 624.220; Inuk (Inuit) 70.540; respuestas múltiples 28.855; «not included elsewhere» 35.225.
- Pregunta 24 copiada del cuestionario 2A-L 2021. Hay 63 reservas y asentamientos enumerados de forma incompleta.
- First Nations Location: 638 filas, todas con punto. Licencia OGL-Canada, que permite uso comercial. Hay 4 nombres con «?» por un problema de codificación.

## Estado de Groenlandia
- Tabla BEEST8 al 1 de enero de 2026: 56.740 habitantes, 49.721 de ellos nacidos en Groenlandia. Es un registro de población, sin pregunta étnica.

## Fase 2: cartografía con geometría (lo que abrí)

| Territorio | Organismo | URL | Formato | ¿Geometría? | Licencia | uso_comercial |
|---|---|---|---|---|---|---|
| American Indian / Alaska Native / Native Hawaiian Areas (864 polígonos) | U.S. Census Bureau, TIGER/Line 2024 | https://www2.census.gov/geo/tiger/TIGER2024/AIANNH/tl_2024_us_aiannh.zip | shp | Sí, polígonos | No declarada en la página abierta | no_dice |
| First Nations Location (638) | Indigenous Services Canada | https://open.canada.ca/data/en/dataset/b6567c5c-8339-4055-99fa-63f92114d9e4 | shp / gpkg | Solo puntos, no territorio | Open Government Licence - Canada | si |
| Reservas de Canadá (polígonos) | Por verificar (NRCan / ISC) | No abierto | — | — | — | — |

## Qué pedir
- **Estados Unidos:** una declaración escrita del Census Bureau o del BIA de que los datos son de dominio público y se pueden usar comercialmente. Todavía no verifiqué el canal de contacto oficial.
- **Canadá:** no hace falta autorización. Sí conviene pedirle a ISC los nombres correctos de las 4 First Nations con «?».
