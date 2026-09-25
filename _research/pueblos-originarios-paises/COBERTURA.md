# Cobertura — fuentes de pueblos originarios por país

Verificación actualizada el 2026-09-24. Argentina no se vuelve a relevar porque el encargo la declara terminada.

| País | ¿Registro? | ¿Censo? | ¿Descargable? | Licencia apta | Qué falta |
|---|---|---|---|---|---|
| Chile | Sí. Capa pública SMA/CONADI basada en el RNAI, 4.311 puntos vigentes. | Sí. Censo 2024, 2.105.863 personas; tablas por región y comuna. | Sí. Registro por API paginada; censo en XLSX. | Registro: no dice. Censo: sí, CC BY-SA 4.0, con atribución y CompartirIgual. | Conseguir una licencia explícita para reutilizar comercialmente la capa del registro y confirmar con CONADI una exportación pública del RNAI que no mezcle años de georreferenciación ni repita claves. |
| Bolivia | Sí, pero no como base pública. El RIPIO registra la identidad de pueblos solicitantes en trámites TIOC. | Sí. Censo 2024, 4.302.484 personas autoidentificadas; tabulados por departamento, provincia y municipio/TIOC. | Registro: no. Censo: sí, cuatro XLSX, cuestionario y metadatos. | Registro: no dice. Censo: no se aprueba para uso comercial sin confirmación escrita del INE; sus términos no otorgan una licencia y condicionan el uso comercial. | Obtener del Viceministerio de Tierras una exportación del RIPIO con cobertura, campos, coordenadas y licencia; pedir al INE autorización o aclaración escrita para uso comercial de los tabulados. |
| Paraguay | Sí, pero no como base pública. El INDI registra liderazgos, personerías, inmuebles y organizaciones. | Sí. Censo 2022, total oficial de 140.049 personas combinando el operativo indígena y casos del Censo Nacional; tablas hasta comunidad, aldea, barrio, núcleo e individualidades. | Registro: no. Censo: sí, CSV y PDF. | Registro: no dice. Censo: sí, Licencia de Uso de la Información Pública del Gobierno Paraguayo, con atribución y sin sugerir patrocinio oficial. | Obtener del INDI una exportación del registro con vigencia, campos, geometría y licencia; para una capa puntual, conseguir las coordenadas oficiales porque los CSV censales sólo publican nombres de localidad. |
| Perú | Sí. La BDPI publica 9.332 localidades indígenas u originarias y un archivo complementario de 40.279 centros poblados censales. | Sí. Censo 2017, resultado final recodificado de 5.984.708 personas indígenas u originarias de 12 años y más; anexos por departamento, sexo, edad y área. | Sí. BDPI y censo en XLSX y PDF; la geometría del visor no tiene descarga vectorial ni API documentada. | BDPI: no dice. Censo: uso comercial expresamente contemplado por INEI, aunque sin licencia estándar adjunta a cada archivo. | Obtener del Ministerio de Cultura una licencia o autorización comercial para la BDPI y una exportación estable de geometrías de localidades; no sustituirlas por las coordenadas de centros poblados. |
| Brasil | Sí. FUNAI publica 4.676 puntos de aldeas (4.667 activos y 9 inactivos); la capa complementaria tiene 639 Tierras Indígenas. | Sí. Censo 2022 actualizado: 1.694.836 personas; 391 rótulos específicos y tabla por municipio. | Parcial. El ODS de FUNAI y los XLSX/JSON del IBGE descargan; el WFS XLSX/CSV de FUNAI devolvió 403. | FUNAI: no dice uso comercial ni transformación; requiere aclaración. IBGE: sí bajo la política de datos abiertos, con atribución y sin licencia estándar por archivo. | Obtener de FUNAI un enlace estable en formato admitido y autorización escrita para transformación comercial; no montar el WFS mientras devuelva 403. |
| Uruguay | No se identificó un registro administrativo nacional específico. La lista de organizaciones invitadas por la INDDHH no es un padrón. | Sí. Censo 2023: 6,3% declara ascendencia indígena; no se publica un total absoluto exacto ni pueblo específico en los cuadros agregados. | Parcial. Los XLSX, diccionario y cuestionario descargan; los microdatos individuales exigen aceptar condiciones restrictivas. | No aprobada. Los cuadros agregados no adjuntan licencia estándar y los microdatos limitan el uso a investigación y prohíben redistribución o venta sin consentimiento. | Pedir al INE el total absoluto oficial y autorización comercial para reutilizar los cuadros agregados; confirmar institucionalmente si existe o se proyecta un padrón de comunidades u organizaciones. |
| Colombia | Sí. La ANT publica 984 polígonos de resguardos indígenas formalizados; 0 geometrías nulas. | Sí. CNPV 2018: 1.905.617 personas; 123 rótulos con población y 22.298 casos `Indigena Sin Información`. | Sí. Registro por FeatureServer/GeoJSON y censo por XLSX/PDF; la descarga CSV del Hub estaba rezagada en 968 filas. | ANT: sí, CC BY-SA 4.0, con atribución y CompartirIgual. DANE: no aprobada para redistribución en la app sin visto bueno escrito. | Consumir la API viva de ANT y no el CSV rezagado; separar el derivado CC BY-SA; pedir al DANE autorización escrita antes de montar los tabulados censales en el producto pago. |
| Ecuador | Sí. La SGDPN publica un registro acumulativo verificable de 4.410 filas, con organizaciones y ubicación administrativa, pero sin geometría y con duplicados declarados. | Sí. Censo 2022: 1.302.057 personas; 33 rótulos específicos, 17.675 `No sabe/No responde` y 1.420 en `Otras nacionalidades/Otros Pueblos`. | Sí. Registro acumulativo en PDF y censo en XLSX/PDF; los CSV mensuales 2026 devolvieron HTTP 403 y no se verificaron. | Registro: sí, `Creative Commons Attribution`, sin versión indicada. Censo: no tiene licencia estándar adjunta al recurso y requiere aclaración para redistribución comercial. | Pedir a la SGDPN una exportación tabular acumulativa y georreferenciada, y confirmar la versión de CC BY; pedir al INEC autorización escrita para montar los tabulados censales en el producto pago. |

## Estado de Chile

- JSON válido y todos los campos del contrato presentes.
- Registro: 4.311 filas comprobadas mediante cinco páginas de la API; 0 geometrías nulas.
- Censo: XLSX de 582.740 bytes abierto; 16 regiones y 346 comunas suman exactamente el total nacional.
- La capa administrativa no queda aprobada para montaje comercial porque no declara licencia.
- El censo permite uso comercial, pero las adaptaciones quedan sujetas a atribución y CompartirIgual.

## Estado de Bolivia

- JSON válido y todos los campos del contrato presentes.
- RIPIO: existencia y contenido mínimo confirmados en normativa oficial, pero sin base pública, filas ni licencia verificables; por eso `verificado` queda en `false`.
- Censo: cuatro XLSX abiertos. Los nueve departamentos, 113 provincias y 343 municipios/TIOC cierran exactamente con el total nacional.
- El cuadro de declaraciones tiene 133 categorías y suma 4.302.484; `Sin especificar` registra 83.684.
- El cuadro referencial tiene 57 categorías positivas y suma el mismo total; el INE aclara que el listado no es oficial ni vinculante.
- Los términos del INE no son una licencia abierta y restringen o condicionan el uso comercial, por lo que se requiere confirmación escrita antes del montaje en un producto pago.

## Estado de Paraguay

- JSON válido y todos los campos del contrato presentes.
- Registro: existencia, organismo, alcance y documentos obligatorios confirmados en la Ley N.º 904/81 y el Decreto N.º 8545/2006; no hay base pública, filas, coordenadas ni licencia verificables, por lo que `verificado` queda en `false`.
- Censo: P1, A2, A3 y C1 abiertos. P1, A2 y las 834 filas territoriales de A3 cierran en 137.547 personas del operativo indígena; el tríptico final añade 2.502 del Censo Nacional y publica 140.049.
- A3 cubre Asunción y 14 departamentos, con 118 pares departamento/distrito, pero no trae latitud, longitud ni geometría.
- El Censo Comunitario informa 557 comunidades y 494 respuestas afirmativas sobre personería. No es un padrón del INDI ni debe montarse como tal.
- Los resultados finales están bajo la Licencia de Uso de la Información Pública del Gobierno Paraguayo, que permite uso y transformación, incluso comercial, con atribución, fecha de actualización cuando se conozca y sin apariencia de patrocinio oficial.

## Estado de Perú

- JSON válido y todos los campos del contrato presentes.
- BDPI: 9.332 filas numeradas sin huecos. Se comprobaron 5.279 comunidades campesinas, 2.292 comunidades nativas, 1.712 localidades sin tipo identificado por la DRA y 49 asentamientos PICI.
- El XLSX principal marca 4.589 localidades como georeferenciadas y 4.743 como no georeferenciadas, pero no contiene latitud, longitud ni geometría; por eso no se reporta una cantidad inventada de filas sin coordenada.
- El archivo complementario tiene 40.279 centros poblados censales con coordenadas. No se monta como si fueran 40.279 localidades: la unidad, la relación y el alcance son distintos.
- Censo: la tabla final recodificada publica 5.771.885 indígenas u originarios de los Andes y 212.823 de la Amazonía; suman exactamente 5.984.708 sobre una base de 23.196.391 personas censadas de 12 años y más.
- Los dos anexos XLSX se abrieron y los 25 totales departamentales cierran exactamente con los dos totales nacionales; la pregunta 25 y el cuadro final se revisaron visualmente en los PDF oficiales.
- La BDPI no declara licencia ni condiciones de reutilización comercial y queda pendiente de autorización. INEI sí contempla expresamente el uso de resultados por empresas privadas para actividades comerciales, con cita de la fuente.

## Estado de Brasil

- JSON válido y todos los campos del contrato presentes.
- FUNAI: el espejo ODS de aldeas contiene 4.676 filas, 13 columnas, 4.667 registros activos, 9 inactivos y ninguna coordenada ausente. Se comprobaron las filas inicial y final y 563 fechas de alta vacías.
- Los enlaces WFS oficiales para XLSX y CSV devolvieron HTTP 403 durante la prueba. Por la regla dura del encargo, `registro.verificado` queda en `false`, aunque el ODS oficial alternativo sí pudo descargarse y abrirse.
- La capa complementaria de Tierras Indígenas contiene 639 registros: 491 regularizados, 67 declarados, 37 delimitados, 24 encaminados a RI, 14 homologados y 6 en estudio. El ODS no incluye geometría.
- Censo: la API SIDRA publica el total actualizado de 1.694.836 personas, compuesto por 1.227.642 de color o raza indígena y 467.194 que se consideran indígenas bajo la pregunta territorial controlada.
- La tabla seleccionada registra 1.262.812 personas con una o dos etnias informadas y 432.024 en cuatro estados sin determinación completa. Cada persona podía declarar hasta dos etnias, por lo que no deben sumarse rótulos como si fueran personas únicas.
- La tabla complementaria 20 contiene 391 rótulos específicos, además de 12 agrupaciones oficiales y una categoría genérica americana que se excluyeron de `pueblos`. La tabla 25 aporta 38.273 filas numéricas para 4.833 municipios.
- El cuestionario oficial fue revisado visualmente: la pregunta de autoidentificación indígena sólo se aplicaba en áreas indígenas a quienes no habían marcado color o raza indígena; la pregunta de etnia admitía hasta dos respuestas.
- FUNAI permite reproducir con cita, pero no autoriza de modo explícito transformación ni uso comercial y el pie del sitio usa CC BY-ND 3.0; hace falta aclaración escrita antes del montaje. Los resultados del IBGE se encuadran en su política de datos abiertos, con atribución y las condiciones que correspondan, aunque los archivos no adjuntan una licencia estándar individual.

## Estado de Uruguay

- JSON válido, esquema y orden de claves exactos; todos los campos del contrato están presentes.
- Registro: no se localizó una base estatal específica y exhaustiva de pueblos, comunidades o tierras indígenas. La resolución 2026 de la INDDHH enumera organizaciones invitadas a un grupo de trabajo, pero no define altas, bajas, cobertura, identificadores, tabla ni geometría; por eso `registro.existe` y `registro.verificado` quedan en `false`.
- Censo: los cuadros 2.1.4 y 2.1.5 del Anuario 2025 se descargaron y abrieron. Publican 6,3% de respuestas afirmativas para ascendencia indígena y desglose porcentual para los 19 departamentos.
- Los cuadros agregados sólo publican porcentajes redondeados. `total_declarado` queda en `null`: multiplicar 6,3% por 3.499.451 sería una estimación y no un total oficial exacto.
- El diccionario de variables de julio de 2026 confirma una población ponderada de 3.499.451, PERER01_4 para ascendencia indígena, PERER02 para ascendencia principal y fecha de referencia 31 de mayo de 2023.
- El cuestionario oficial de 10 páginas se renderizó completo y se revisó visualmente la página 5. La pregunta 8 se aplica a todas las personas, permite responder Sí a varias ascendencias y no pregunta pueblo específico; por eso `pueblos` queda vacío y `sin_declarar_pueblo` en `null`.
- La presentación inicial de diciembre de 2024 difundió 6,4%; los Anuarios 2024 y 2025 publican 6,3% como dato final. Se adopta el valor más nuevo y se documenta el cambio.
- Los microdatos individuales no se descargaron: el acceso exige aceptar uso exclusivo para investigación científica y estadística, prohíbe redistribuir o vender sin consentimiento escrito y requiere obligaciones adicionales. Los cuadros agregados abiertos tampoco adjuntan una licencia estándar por archivo, por lo que hace falta confirmación del INE antes de uso comercial.

## Estado de Colombia

- JSON válido, esquema y orden de claves exactos; los 123 valores de `pueblos` son únicos y copian el primer bloque codificado del visor DANE.
- Registro: el servicio FeatureServer de la ANT devolvió 984 resguardos formalizados y una consulta geométrica separada confirmó 0 geometrías nulas.
- La capa tiene 19 `CODIGO_DANE` vacíos, 2 departamentos vacíos, 2 municipios vacíos y 1 `PUEBLO` vacío; esos registros no deben perderse al hacer joins.
- La descarga CSV del Hub devolvió sólo 968 filas y el GeoJSON completo descargado presentó un valor de coordenada dañado. Para montaje debe consultarse la API viva y controlarse que entregue 984 entidades.
- La licencia ANT es CC BY-SA 4.0: permite uso comercial, exige atribución y obliga a compartir bajo la misma licencia la base adaptada. Conviene mantener el derivado de datos separado del código de la app.
- Censo: la hoja `1` del visor XLSX suma exactamente 1.905.617 personas en sus primeros 124 rótulos; `Indigena Sin Información` aporta 22.298 y se guarda aparte.
- La hoja repite esos 124 rótulos con otra nomenclatura. Sumar sus 248 filas duplica exactamente el total y es un error de lectura.
- El cuadro de hogares particulares publica 1.876.752 indígenas, no 1.905.617, porque excluye los Lugares Especiales de Alojamiento. La ficha conserva el total indígena integral y documenta la diferencia.
- DANE autoriza la cita, pero su página de microdatos prohíbe reproducir los datos en medios que los pongan a disposición de múltiples usuarios sin visto bueno escrito. El censo queda pendiente de autorización para montaje comercial.

## Estado de Ecuador

- JSON válido, esquema y orden de claves exactos; los 33 valores de `pueblos` son únicos y copian literalmente los rótulos específicos de la hoja `3` del tabulado oficial.
- Registro: el PDF acumulativo de enero de 2023 tiene 441 páginas y filas numeradas de 1 a 4.410. Se revisaron visualmente la primera y la última página.
- Las 4.410 filas no equivalen a comunidades únicas: la matriz mezcla comunidades, uniones, asociaciones, fundaciones y movimientos, e incluye duplicados explícitos como la fila 4, marcada `REPETIDO CON 141`.
- El registro publica provincia, cantón y parroquia, pero no latitud, longitud ni geometría. Los CSV mensuales 2026 son más recientes, aunque el portal devolvió HTTP 403 y no pudieron verificarse.
- El catálogo nacional declara `Creative Commons Attribution` sin número de versión. Se admite uso comercial con atribución, pero no debe presentarse como CC BY 4.0 sin confirmación institucional.
- Censo: la hoja `1` publica 16.938.986 personas y 1.302.057 indígenas. La hoja `3` cierra ese total con 1.282.962 en 33 rótulos específicos, 1.420 en `Otras nacionalidades/Otros Pueblos` y 17.675 en `No sabe/No responde`.
- Se revisó visualmente la página 5 del cuestionario oficial: la pregunta 11 capta autoidentificación según cultura y costumbres y la 12 pregunta nacionalidad o pueblo a quienes respondieron Indígena.
- El valor preliminar difundido en 2023 fue 1.301.887. Se adopta 1.302.057 porque es el valor del XLSX temático posterior y reproducible.
- El recurso censal no adjunta una licencia estándar. Hace falta una confirmación del INEC antes de redistribuir los tabulados en una aplicación paga.

## Verificación al montar — 18 y 20/09/2026

Lo escrito arriba es el relevamiento. Esto es qué pasó cuando se fue a montar.

**Chile: montado, sólo el censo.** Commit en `apps/terreno/lib/censoIndigena2024Cl.ts`,
auditoría en `../censo-2024-pueblos-chile/AUDITORIA.md`. Se comprobaron las tres
planillas: 16 regiones, 56 provincias, 346 comunas, todo cierra contra el total
nacional. El `P2-Pueblos-indigenas.xlsx` bajado pesa los 582.740 bytes que dice
el JSON.

Dos correcciones al relevamiento:

- **`pueblos` tiene 12 entradas y los pueblos son 11.** «Otro» es una columna de
  la planilla junto a «Pueblo no declarado», no un rótulo de pueblo: son las
  20.631 personas que se reconocen de un pueblo que no está entre las
  alternativas. Tomarla como pueblo habría publicado doce.
- **El denominador.** El JSON pone `poblacion_base: 18370540`, que es el de la
  cifra oficial del INE (11,5%) y es correcto, pero ese número **no está
  publicado por comuna**. La app divide por población censada —18.480.432— en
  los cuatro niveles y muestra 11,4%, con la cifra del INE al lado.

Lo demás se verificó como está: la licencia CC BY-SA 4.0, la falta de licencia
de la capa SMA/CONADI, el límite de 1.000 registros de la API y la nota de
actualización del 04/12/2025.

**Bolivia: no se monta.** El relevamiento está bien y el censo cierra, pero los
términos del INE prohíben el uso comercial sin autorización previa. Es la regla
6 del encargo. Lo que lo destraba es una autorización escrita del INE, no más
relevamiento: el JSON queda listo para el día que esté.

**Para los que siguen:** dos cosas que este par dejó como lección. La columna
residual («Otro», «Sin especificar», «Otras declaraciones») nunca es un pueblo y
va contada aparte. Y conviene decir, cuando el organismo publica un porcentaje,
**sobre qué denominador lo calcula**: si no está publicado al nivel más fino, la
app tiene que usar otro y explicarlo.

**Paraguay: montado, sólo el censo.** Tabla en
`apps/terreno/lib/censoIndigena2022Py.ts`, armada por
`build-censo-paraguay.mjs` desde los cuatro CSV congelados en `csv-paraguay/`.
Se bajaron de nuevo y pesan exactamente lo que dice el JSON (2.655, 105.112,
23.907 y 1.408 bytes). El A2 y el A3 cierran entre sí departamento por
departamento: 15 jurisdicciones, 118 pares departamento/distrito, 834
localidades, 136.302 + 1.245 = 137.547. Los totales por pueblo se cotejaron
además contra el PDF de resultados —Nivaclé 18.280, Enlhet 9.874—, que los
publica en el cuerpo del texto.

Tres cosas que el relevamiento no podía ver y aparecieron al montar:

- **`country` de Nominatim es «Paraguay / Paraguái».** Comparar contra
  «Paraguay» a secas habría dejado la capa sin disparar nunca, y el síntoma
  habría sido una sección vacía y no un error.
- **Asunción no trae `state`.** Es el Distrito Capital y OSM la modela como
  ciudad: sin una rama propia, la única jurisdicción urbana del censo no
  contestaba. Y Paraguay no usa `county`, así que el distrito sale de
  `city`/`town`. Los 118 distritos casan por nombre.
- **Faltaba una cuarta respuesta.** El censo cubrió 14 de los 17 departamentos;
  en Cordillera, Misiones y Ñeembucú la app decía «no reconocemos ese
  departamento», que es falso. Ahora dice que el operativo no fue para allá, que
  es otra cosa.

Y una decisión que conviene que quede escrita: **no hay porcentaje por
departamento.** Acá el censo indígena es un operativo aparte del censo nacional,
así que el numerador y el denominador medirían universos distintos. El país sí
lo lleva —140.049 de 6.109.903, 2,3%— porque el INE publica las dos puntas.

**Para los que siguen:** cuando el censo indígena sea un operativo separado del
nacional, verificar **antes de montar** si existe un denominador publicado al
mismo nivel que el numerador. Si no existe, la respuesta correcta es mostrar
personas y no proporciones. Y probar el rótulo de país que devuelve Nominatim
antes de escribir la comparación: los países bilingües no se llaman como uno
espera.

**Perú: montado, sólo el censo.** Tabla en `apps/terreno/lib/censoIndigena2017Pe.ts`,
armada por `build-censo-peru.mjs` desde los tres anexos congelados en
`xlsx-peru/`. Se bajaron de nuevo del INEI y pesan exactamente lo que dice el
JSON: anexo01 230.707 bytes y anexo04 227.366. Se sumó un tercero que el
relevamiento no pedía, anexo07 (225.673 bytes), y el motivo es el denominador.

**Cómo se arma el denominador, que es lo propio de este país.** El INEI no
publica ningún cuadro con las cuatro autoidentificaciones juntas por
departamento: publica un anexo por grupo —andino, amazónico, afroperuano— y cada
uno compara el suyo contra la **misma** columna residual «Blanca(o), mestiza(o) y
otra(o)». Las cuatro son excluyentes y exhaustivas y cierran exacto:
5.771.885 + 212.823 + 828.894 + 16.382.789 = 23.196.391, que es la población
censada de 12 y más años. El script verifica que la columna residual sea idéntica
en los tres anexos antes de usarla una sola vez, y que los 25 departamentos
sumen el país en las cuatro categorías. Si algo no cierra, no escribe nada.

Tres cosas que el relevamiento no podía ver y aparecieron al montar:

- **Nominatim escribe «Ancash» sin tilde** donde el INEI escribe «Áncash».
  Casa igual porque `normalizarNombreAdmin` saca los diacríticos, pero conviene
  que quede escrito: es el primer país donde el geocodificador y la fuente
  discrepan en la ortografía de una jurisdicción entera.
- **La provincia peruana viene en `region`, no en `county`.** `/api/entorno`
  llena `departamento` con `county ?? state_district`, así que en Perú ese campo
  trae «Lima Metropolitana» o nada. No se mira: el departamento sale de `state`,
  que es `provincia` en la ubicación. Los niveles están corridos respecto de la
  Argentina y confundirlos devolvería «Maynas» donde el censo dice «Loreto».
- **Lima se abre en dos y no se monta abierta.** Los cuadros traen «Provincia de
  Lima» —los 43 distritos— y «Región Lima» —las otras nueve provincias—, y suman
  exacto contra Lima. Quedan fuera por dos motivos: sus proporciones indígenas
  son casi la misma (17,2% y 17,9%), y el geocodificador no las separa sin
  riesgo, porque a Callao, que es **otro departamento**, también le pone
  `state_district` «Lima Metropolitana». El script comprueba que cierren y las
  descarta.

Y dos decisiones que conviene que queden escritas. **El porcentaje es sobre las
personas de 12 y más años**, que es a quienes se les hizo la pregunta, y las dos
pantallas lo dicen al lado del número: sin eso se leería contra los de Chile y la
Argentina, que son sobre toda la población. Y **la respuesta es departamental y
no baja**: los anexos abren por edad, sexo y área urbana o rural, no por
provincia ni por distrito. En lugar del detalle territorial, el panel muestra la
**lengua materna**, que sí viene por departamento, y aclara que no es el pueblo:
2.473.986 de los 5.771.885 indígenas de los Andes declaran castellano.

La BDPI queda afuera por licencia, como CONADI y como el INDI, pero por un
tercer motivo: el archivo de 9.332 localidades **se baja entero** y no declara
licencia en ninguna parte. Acceso público no es permiso. Tampoco trae geometría:
marca 4.589 localidades como georreferenciadas y no publica una sola coordenada.

**Para los que siguen:** cuando el censo recorte el universo por edad, el
denominador correcto es el recortado y hay que escribirlo al lado del
porcentaje. Y cuando el denominador no esté en un solo cuadro, verificar que las
categorías que se suman sean excluyentes, exhaustivas y que cierren exacto contra
el total publicado; si no cierran, no es un denominador.

## Verificación al montar — 24/09/2026

**Brasil: montado, sólo el censo.** Tabla en
`apps/terreno/lib/censoIndigena2022Br.ts`, armada por `build-censo-brasil.mjs`
desde cinco respuestas de la API SIDRA congeladas en `sidra-brasil/`. Se
verificaron los cuatro cierres y cerraron todos: el nacional (1.694.836 sobre
203.080.756), los 27 estados contra el nacional, los 5.570 municipios contra su
estado uno por uno, y los dos quesitos contra el total en los 27.

Es el primer país que contesta a escala de **municipio**. Los otros cuatro
contestan en la división grande; acá no alcanza, porque el estado no dice nada
de un predio: Amazonas tiene 490.935 personas indígenas repartidas en un
territorio más grande que media Argentina, y São Gabriel da Cachoeira —un
municipio de ese mismo estado— tiene 48.256 sobre 51.795 habitantes, el 93%.

Tres cosas que el relevamiento no podía ver y aparecieron al montar:

- **240 nombres de municipio se repiten en más de un estado**, y ninguno se
  repite dentro del mismo. O sea que el municipio hay que buscarlo dentro del
  estado ya resuelto: en la lista global esos 240 empatan y `casarNombre` —bien—
  no contesta. Es la diferencia entre responder 5.570 municipios y responder
  5.330.
- **El geocodificador acierta el municipio, no la ciudad.** Se probaron tres
  puntos: `city`/`town` de Nominatim devuelve Codajás, Ribeirão Preto y Cuiabá,
  que son municipios enteros y no manchas urbanas. Pero en zona rural profunda
  puede contestar un paraje, así que la capa tiene **dos** formas de acertar:
  con municipio, o con el estado diciendo que es más grueso.
- **El guion de SIDRA es cero, no dato faltante.** Son 737 municipios sin
  ninguna persona indígena. Leerlos como «sin dato» y saltearlos habría hecho
  que la suma no cerrara. El generador distingue `-` de `..` y `...` y aborta si
  aparece uno de los otros dos.

**Colombia, Ecuador y Uruguay: no se montan, y por la misma razón que Bolivia.**
El relevamiento de los tres está bien y los censos cierran. Lo que falta es
permiso:

- **Colombia.** El DANE autoriza la cita pero prohíbe reproducir los datos en
  medios que los pongan a disposición de múltiples usuarios sin visto bueno
  escrito. Eso describe exactamente una app. El registro de resguardos de la ANT
  sí es CC BY-SA 4.0 y se podría usar, pero es otra capa —geometría de
  resguardos, no censo— y su cláusula de CompartirIgual obliga a mantener el
  derivado separado.
- **Ecuador.** El recurso censal del INEC no adjunta licencia estándar. El
  registro de la SGDPN es `Creative Commons Attribution` sin número de versión,
  pero es un PDF de 441 páginas sin geometría y con duplicados declarados.
- **Uruguay.** Los cuadros agregados del Anuario no adjuntan licencia y los
  microdatos limitan el uso a investigación y prohíben redistribuir o vender.
  Además el censo pregunta por **ascendencia**, no por pueblo: no enumera
  Charrúa ni Chaná, publica 6,3% redondeado y ningún absoluto. Aunque hubiera
  permiso, esta capa no tendría qué mostrar sin cambiar lo que promete.

Lo que destraba a los cuatro —con Bolivia— es una autorización escrita, no más
relevamiento. Los JSON quedan listos para el día que esté.

**Para los que siguen:** cuando un país obliga a bajar de escala, lo primero que
hay que medir es si los nombres de la unidad chica son únicos dentro de la
grande, y **después de normalizar**, que es donde se pierden los acentos. Si no
lo son, el cruce tiene que ir anidado y no plano.
