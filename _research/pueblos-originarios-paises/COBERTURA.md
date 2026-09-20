# Cobertura — fuentes de pueblos originarios por país

Verificación actualizada el 2026-09-20. Argentina no se vuelve a relevar porque el encargo la declara terminada.

| País | ¿Registro? | ¿Censo? | ¿Descargable? | Licencia apta | Qué falta |
|---|---|---|---|---|---|
| Chile | Sí. Capa pública SMA/CONADI basada en el RNAI, 4.311 puntos vigentes. | Sí. Censo 2024, 2.105.863 personas; tablas por región y comuna. | Sí. Registro por API paginada; censo en XLSX. | Registro: no dice. Censo: sí, CC BY-SA 4.0, con atribución y CompartirIgual. | Conseguir una licencia explícita para reutilizar comercialmente la capa del registro y confirmar con CONADI una exportación pública del RNAI que no mezcle años de georreferenciación ni repita claves. |
| Bolivia | Sí, pero no como base pública. El RIPIO registra la identidad de pueblos solicitantes en trámites TIOC. | Sí. Censo 2024, 4.302.484 personas autoidentificadas; tabulados por departamento, provincia y municipio/TIOC. | Registro: no. Censo: sí, cuatro XLSX, cuestionario y metadatos. | Registro: no dice. Censo: no se aprueba para uso comercial sin confirmación escrita del INE; sus términos no otorgan una licencia y condicionan el uso comercial. | Obtener del Viceministerio de Tierras una exportación del RIPIO con cobertura, campos, coordenadas y licencia; pedir al INE autorización o aclaración escrita para uso comercial de los tabulados. |
| Paraguay | Sí, pero no como base pública. El INDI registra liderazgos, personerías, inmuebles y organizaciones. | Sí. Censo 2022, total oficial de 140.049 personas combinando el operativo indígena y casos del Censo Nacional; tablas hasta comunidad, aldea, barrio, núcleo e individualidades. | Registro: no. Censo: sí, CSV y PDF. | Registro: no dice. Censo: sí, Licencia de Uso de la Información Pública del Gobierno Paraguayo, con atribución y sin sugerir patrocinio oficial. | Obtener del INDI una exportación del registro con vigencia, campos, geometría y licencia; para una capa puntual, conseguir las coordenadas oficiales porque los CSV censales sólo publican nombres de localidad. |
| Perú | Sí. La BDPI publica 9.332 localidades indígenas u originarias y un archivo complementario de 40.279 centros poblados censales. | Sí. Censo 2017, resultado final recodificado de 5.984.708 personas indígenas u originarias de 12 años y más; anexos por departamento, sexo, edad y área. | Sí. BDPI y censo en XLSX y PDF; la geometría del visor no tiene descarga vectorial ni API documentada. | BDPI: no dice. Censo: uso comercial expresamente contemplado por INEI, aunque sin licencia estándar adjunta a cada archivo. | Obtener del Ministerio de Cultura una licencia o autorización comercial para la BDPI y una exportación estable de geometrías de localidades; no sustituirlas por las coordenadas de centros poblados. |

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
