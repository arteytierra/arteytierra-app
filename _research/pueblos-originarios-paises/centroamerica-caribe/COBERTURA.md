# Cobertura — Centroamérica y Caribe (relevamiento del 26/09/2026)

| País | ¿Registro? | ¿Censo? | ¿Descargable? | Licencia apta | Qué falta |
|---|---|---|---|---|---|
| Guatemala **(montado)** | No encontrado (falta revisar RIC) | Sí, 2018, por pueblo hasta lugar poblado | Sí (xlsx, INE) | Sí: CC BY declarada en el dataset | Boleta literal; revisar RIC |
| Belice | No buscado | Sí, 2022, solo % | PDF de presentación | No declarada | Cifras absolutas y licencia |
| El Salvador | No buscado | Sí, 2024: 68.148 total, pueblos solo en % | No (página ArcGIS) | No declarada | Tabulados, cuestionario, autorización del BCR |
| Honduras | No buscado | 2013 existe; sin abrir | No (host temporal caído) | No verificada | Abrir fichas 2013 o esperar el censo 2025 |
| Nicaragua | No buscado | Sí, 2005: 443.847 (pueblos y comunidades étnicas) | Sí (PDF) | No declarada | Dato reciente, territorio y licencia |
| Costa Rica | No buscado | Sí, 2011: 104.143, por territorio indígena | Solo por espejo universitario | No verificada (inec.cr, 403) | Acceso al INEC y licencia; el Censo 2022 no publica etnicidad |
| Panamá | No buscado | Sí, 2023: 698.114, por grupo y comarca | Sí (pdf/xls, INEC) | Sí: CC BY 4.0 declarada (el pie dice «todos los derechos reservados») | Pregunta literal; confirmar la licencia por escrito |
| Dominica | No buscado | 2011 sin pregunta étnica; «Carib Territory» 2.145 habitantes | Sí (PDF) | No declarada | Dato étnico y polígono del territorio |
| San Vicente y las Granadinas | No buscado | Sí, 2023: «Indigenous People» 5.587 | Sí (PDF) | No declarada | Licencia |
| Trinidad y Tobago | — | Sin abrir (captcha) | — | — | Todo |
| República Dominicana | — | Sin pregunta por pueblo indígena («indio» es color de piel) | — | — | No se monta |
| Cuba | — | Sin abrir (sitio no responde) | — | — | Todo |
| Haití | — | No revisado | — | — | Todo |

## Estado de Guatemala

**Montado el 28/09/2026** en `apps/terreno/lib/censoIndigena2018Gt.ts`, por
departamento y por municipio, con las 22 comunidades lingüísticas mayas adentro
del pueblo Maya. Lo arma `build-censo-guatemala.mjs` desde los dos XLSX
congelados en `xlsx-guatemala/`, con siete verificaciones que lo hacen caer si
un total no cierra; las siete cerraron a la primera. Guatemala salió de
`PAISES_NACIONAL`: si se quedara, un predio guatemalteco vería dos bloques
diciendo cosas distintas sobre lo mismo.

Lo que **no** se montó, a propósito: las hojas A5.3 y A6.3, que bajan a 20.036
lugares poblados con el centroide de cada uno. Un centroide censal no es un
territorio y la capa no dibuja dónde vive un pueblo.

Lo que sigue pendiente: la boleta literal del censo 2018 y el Registro de
Información Catastral, que inscribe tierras comunales y podría ser la segunda
fuente que hoy falta.

- Abrí la API CKAN de datos.ine.gob.gt: el dataset «censo-2018-lugares-poblados» declara «Creative Commons Attribution».
- Bajé el cuadro A5. Total 14.901.286; Maya 6.207.503; Garífuna 19.529; Xinka 264.167. Las columnas suman exactamente el total, así que no hay categoría «no declarado».
- En la hoja A5_3 hay 20.036 lugares poblados, 313 de ellos sin coordenada.
- Bajé el cuadro A6: las 22 comunidades lingüísticas suman 6.207.503, igual al total Maya.
- No encontré la boleta 2018 ni un registro de comunidades.

## Estado de Panamá
- La página de publicación del Censo 2023 declara CC BY 4.0, pero su pie dice «Todos los derechos reservados».
- Abrí el Cuadro 20: 698.114 personas indígenas, y la suma de los grupos cierra.
- Según el comentario de población del INEC, la población censada es 4.064.780 y el 17,2 % es indígena.
- La definición oficial está en «Definiciones y explicaciones».
- «Naso» y «Teribe» figuran como filas separadas.

## Estado de Nicaragua
- Abrí la Tabla 1.13 del Resumen Censal 2005: 443.847 personas, y la suma de filas cierra.
- Ese total incluye Creole (Kriol) y Mestizo de la Costa Caribe.
- «No sabe» (47.473) e «Ignorado» (19.460) están dentro del total.

## Estado de Costa Rica
- inec.cr responde 403.
- La publicación 2011 «Territorios Indígenas» la abrí desde un espejo de la Universidad de Costa Rica: 104.143 personas indígenas (78.073 con pueblo, 26.070 sin pueblo) sobre 4.301.712.
- El Censo 2022 tuvo cobertura parcial y solo se publicó una estimación general.

## Estado de El Salvador
- La página «Etnia» del BCR informa 68.148 personas (1,1 %) y porcentajes por pueblo.
- El ítem del sitio tiene `licenseInfo: null`.
- No bajé ningún archivo.

## Estado de Belice
- Abrí la presentación del SIB (abril de 2024). Da solo porcentajes: Maya 9,8 % y Garifuna 4,0 %, sobre 397.483 personas en hogares.
- «Other» figura con 5,6 % en la presentación y 7,8 % en la nota de prensa.

## Estado de Dominica
- El informe del censo 2011 no trae tabla étnica.
- «Carib Territory» figura con 2.145 habitantes, que son residentes de la localidad y no personas Kalinago.

## Estado de San Vicente y las Granadinas
- Tabla 2-3 del informe 2023: «Indigenous People» 5.587 sobre un total de 108.764.
- El informe describe a este grupo como «Carib/Amerindian» y lo ubica concentrado en Sandy Bay y Georgetown.

## Estado de Honduras, Trinidad y Tobago, República Dominicana, Cuba y Haití
- **Honduras:** los PDF por pueblo están en temp.ine.gob.hn, que rechaza la conexión. El portal REDATAM devuelve error 500.
- **Trinidad y Tobago:** el sitio responde con un captcha.
- **República Dominicana:** la ONE responde 403. Su estudio de 2012 confirma que las categorías de los censos fueron fenotípicas.
- **Cuba:** el sitio de la ONEI no responde.
- **Haití:** no lo revisé.
