# Fase 1 — Las licencias y las vías de dato

*Pegar primero `GPT_LOCAL_REGLAS.md` y después esto. Entregas en
`C:\Arte y Tierra\encargos-gpt\entregas\licencias\NN.json`, siguiendo la
numeración que ya existe: el próximo lote es el **04**.*

---

## Por qué esta fase va primera

Es la más barata de las cinco y la única donde **una respuesta de una línea
prende código que ya está escrito**. La app tiene capas construidas, probadas y
conectadas a la interfaz que no muestran nada porque falta saber si el dato se
puede usar. No hay que programar: hay que leer términos de uso y decir sí o no.

Medido: la capa de saberes territoriales tiene **ocho condiciones de activación,
25 tests que las fijan, y 2 saberes activos de 85**. Las otras 83 no están
bloqueadas por código. Están bloqueadas por esta fase.

## La regla que hace a esta fase difícil, y que ya costó dos veces

**La licencia que vale es la del dato concreto, con sus términos adicionales
leídos.** No la del portal, no la sigla del encabezado.

Dos casos verificados que conviene tener presentes porque son la forma del
error:

- **PDOK (Países Bajos).** La política general del portal declaraba CC BY 4.0.
  La ficha del dataset en el Nationaal Georegister declaraba **CC BY-NC-ND
  4.0**: prohíbe cobrar y prohíbe derivar, que son las dos cosas que hace esta
  app. Manda la del dataset.
- **FAO.** Las bases estadísticas corporativas dicen CC BY 4.0 y le atornillan
  unos *Additional terms of use* cuyo punto 1 prohíbe usar los datasets «in
  conjunction with the promotion of a commercial enterprise and/or its
  product(s) or service(s)». Una CC BY con una cláusula no-promocional encima no
  es una CC BY.

Entonces, para cada pregunta de abajo:

1. **Abrir la página de licencia del conjunto concreto**, no la del organismo.
2. **Copiar la frase textual** que concede o niega el uso comercial y el uso
   derivado. Si la página tiene un «Additional terms», leerlo y copiarlo también.
3. Si hay dos páginas que dicen cosas distintas, **entregar las dos** y decir
   cuál es más específica del dato.
4. **En licencias, la duda se resuelve del lado de no usar el dato.** Un «no
   pude confirmar» vale; un «parece que sí» no.

Lo que la app acepta para redistribuir geometría ajena adentro del producto:
`CC0-1.0`, `CC-BY-4.0`, `CC-BY-SA-4.0`, `ODbL-1.0`, dominio público, o permiso
expreso de la comunidad. **NC y ND descalifican. Siempre.** La app cobra.

Y una distinción que no hay que perder: **citar no es redistribuir.** Nombrar
una fuente con su rótulo y su URL para respaldar una afirmación es una
referencia y no necesita licencia de datos. Lo que necesita licencia es montar
el polígono o la serie adentro de la app.

---

## Bloque A — Las cinco preguntas que quedaron abiertas

Vienen de `ENCARGO_LICENCIAS.md`, donde la pregunta 1 ya se cerró. Estas cinco
están sin tocar. Una entrada por pregunta.

### A1 · `censo_eeuu_aiannh`

El censo de los Estados Unidos publica los límites **AIANNH** (American Indian,
Alaska Native, and Native Hawaiian areas) como shapefile dentro de TIGER/Line.
La app ya tiene trece saberes de Estados Unidos documentados y ninguno activo.

Qué hace falta: **bajo qué condiciones se puede redistribuir ese shapefile
dentro de un producto que se vende.** Buscar la declaración de términos del
Census Bureau sobre sus propios productos cartográficos y la frase que dice si
la obra es del gobierno federal de los EE.UU. y por lo tanto de dominio público.

Rutas nombradas: `www.census.gov/geographies/mapping-files/time-series/geo/tiger-line-file.html`,
la página de *Terms of Service* o *Policies* del propio Census, y
`www.usa.gov/government-works`.

### A2 · `ogl_v3_reino_unido`

Seis saberes británicos y cuatro irlandeses documentados, ninguno activo. El
Reino Unido publica mucho bajo la **Open Government Licence v3.0**.

Qué hace falta: **el texto de la OGL v3.0** y tres cosas de ese texto: si
permite uso comercial, si permite obras derivadas, y qué exige exactamente como
atribución. Y si la OGL declara compatibilidad con CC-BY-4.0, copiar esa frase:
si es compatible, entra sin discusión.

Ruta nombrada: `nationalarchives.gov.uk/doc/open-government-licence/version/3/`.

### A3 · `miteco_vias_pecuarias`

Las cañadas reales españolas. **Ya se sabe que la cartografía del MITECO son
líneas** —y un punto no cae «dentro» de una línea, así que la condición 8 de la
compuerta no se puede evaluar— y que su licencia es de atribución propia del
MITECO, que no está entre las admitidas.

Entonces la pregunta no es la del MITECO. Es: **¿alguien más publica las vías
pecuarias como polígono, bajo una licencia admitida?** Las comunidades autónomas
publican sus propios catálogos: Castilla y León, Castilla-La Mancha, Andalucía,
Extremadura y Aragón son las que tienen más kilómetros. Una vía pecuaria tiene
anchura legal declarada (cañada 75 m, cordel 37,5 m, vereda 20 m), así que puede
existir publicada como superficie y no como eje.

Rutas nombradas: los portales de datos abiertos de esas cinco comunidades, el
IDEE (`idee.es`), y OpenStreetMap, que es la vía por la que se activaron los dos
saberes que hoy funcionan.

### A4 · `censos_sudamericanos`

La capa de pueblos originarios tiene dato local de siete países. Faltan cuatro y
la pregunta es si cambiaron sus términos:

- **INE Bolivia** (`ine.gob.bo`)
- **DANE Colombia** (`dane.gov.co`)
- **INEC Ecuador** (`ecuadorencifras.gob.ec`)
- **INE Uruguay** (`ine.gub.uy`)

De cada uno: la página de términos de uso o de licencia de los microdatos y
tabulados censales, la frase textual sobre uso comercial, y si hay un tabulado
de población indígena por la unidad administrativa más chica publicada. Decir
**cuál es esa unidad** (departamento, provincia, municipio, cantón) y **sobre
qué población se calcula el porcentaje** —toda la población, o de cierta edad en
adelante—, porque el Perú lo publica «de 12 y más años» y sin esa aclaración el
número se lee contra los de Chile y la Argentina, que son sobre el total.

Una entrada por país, o las cuatro en una con un campo por país. Como salga más
corto.

### A5 · `mangrove_watch_y_magreb`

Dos cosas distintas, juntas porque las dos son fuentes de dato y no de saber.

**Global Mangrove Watch** publica extensión de manglar global por año. La app
tiene diez ecorregiones de manglar sin ficha y cita manglares en varias. ¿Cuál
es la licencia del dataset —no la del paper— y hay una vía de consulta por punto
o por caja?

**Los institutos de suelo del Magreb**: Marruecos, Argelia y Túnez. La app usa
SoilGrids global a 250 m en todo el norte de África. ¿Existe cartografía
nacional de suelos publicada, con licencia, en alguno de los tres? Si no existe,
decirlo: cerrar una ruta vale tanto como abrirla.

---

## Bloque B — Cinco fuentes de dato nombradas

Esto no es código todavía: son consultas. Cada una es una fuente que taparía un
hueco medido de la app.

### B1 · `chelsa_v21`

**CHELSA V2.1** son climatologías globales a 1 km. Es exactamente la forma de
producto que el motor necesita y taparía el hueco de Sudamérica, que hoy sólo
tiene NASA POWER a ~50 km mientras Norteamérica ya tiene Daymet a 1 km.

Tres cosas: **la licencia declarada del dataset** (con su frase y su URL, no la
del paper que lo describe); **si existe una vía de consulta por punto** —API,
servicio OGC, o sólo descarga de GeoTIFF globales—; y **el tamaño de los
archivos** si la única vía es la descarga, porque eso decide si se puede usar.

Rutas: `chelsa-climate.org`, la página del dataset en el repositorio de
EnviDat/WSL, y la documentación técnica (`CHELSA_tech_specification.pdf`).

### B2 · `inegi_cem_15m`

El **Continuo de Elevaciones Mexicano (CEM 3.0)** del INEGI, a 15 m. Nunca se
evaluó: el relevamiento de modelos de elevación cubrió Estados Unidos, Canadá y
Europa y se salteó México.

Dato ya verificado y que vale de ancla: **los Términos de Libre Uso del INEGI
autorizan el uso comercial** —se verificó para el censo de lengua indígena—. Lo
que falta es si el CEM entra en esos mismos términos y **si hay una vía de
consulta por punto o por caja**, o sólo descarga por hoja.

Rutas: `inegi.org.mx/app/geo2/elevacionesmex/`, los Términos de Libre Uso de la
Información del INEGI, y el servicio WMS/WCS del INEGI si existe.

### B3 · `uruguay_coneat`

**MGAP/CONEAT** es la única fuente de suelo sudamericana que pasó licencia en el
relevamiento previo y sigue sin implementar. Era la prioridad 1.

Qué hace falta: confirmar la licencia hoy, y **la vía de consulta**: si hay WFS,
WMS o GeoJSON de los grupos CONEAT, y si el índice de productividad CONEAT viene
con el polígono o hay que cruzarlo con una tabla aparte. Si viene aparte, traer
las dos URLs.

Rutas: `www.gub.uy/ministerio-ganaderia-agricultura-pesca/`, el visor de suelos
del MGAP, y el catálogo de la IDE de Uruguay (`ide.uy`).

### B4 · `ign_argentina_y_ecuador`

Los dos quedaron afuera del enrutador de elevación: **Argentina por licencia y
Ecuador por copyleft**. La pregunta es si cambiaron condiciones.

De cada uno: la página de licencia vigente del modelo digital de elevaciones
nacional, la frase textual sobre uso comercial y sobre obras derivadas, y la
fecha de la versión de esos términos. Si siguen igual, decirlo con la frase: una
ruta cerrada y verificada es un resultado.

Rutas: `ign.gob.ar` (MDE-Ar), `www.geoportaligm.gob.ec` (IGM Ecuador).

### B5 · `wis2_que_entrega`

**WIS2** de la OMM cubre ocho países de una. El relevamiento previo lo marcó
como prometedor y hay una sospecha anotada que conviene confirmar o desmentir:
que **entrega observaciones de estación y no climatologías**, con lo cual no
reemplaza a NASA POWER para lo que la app calcula.

Qué hace falta: qué variables entrega, con qué paso de tiempo, si hay serie
histórica o sólo tiempo real, y la licencia. Si la sospecha es correcta,
decirlo así y no venderlo mejor de lo que es.

---

## Bloque C — La geometría de los saberes, que es el bloqueo real

Esta es la parte más grande de la fase y la que más rinde si sale.

**El estado, medido:** 85 saberes territoriales en el inventario. **2 activos**
—el Quesungual sobre el departamento de Lempira, Honduras, y el waterschap
neerlandés—, 2 marcados «cartografía oficial sin licencia resuelta» y **81
documentados sin geometría**.

Los dos que funcionan se activaron **los dos por la misma vía: OpenStreetMap
bajo ODbL**, disolviendo las jurisdicciones antes de simplificar. Esa es la ruta
probada y por eso se nombra primero.

### Qué hay que traer, por saber

Para cada id de la lista: **¿existe un polígono publicado que lo delimite, bajo
una licencia admitida?** Tres respuestas posibles y las tres sirven:

- **`si`** — con la URL del conjunto, la licencia textual, el formato y qué
  delimita exactamente el polígono (la jurisdicción administrativa, el área
  protegida, el territorio reconocido, la cuenca).
- **`no_hay`** — se buscó y no existe geometría publicada. Decir dónde se buscó.
- **`hay_pero_no_sirve`** — existe y falla por un motivo nombrado: es línea y no
  polígono, la licencia es NC o ND, es un producto pago, o delimita otra cosa.

**Lo que no hay que hacer:** proponer dibujar el polígono, proponer un buffer
alrededor de una línea, ni ofrecer «la provincia entera» cuando el saber es de
un valle. Un polígono que no delimita el saber es peor que ninguno, porque
activa el saber en todo el que caiga adentro.

Y una cosa que no es técnica y manda igual: **cuando el saber es de un pueblo o
una comunidad, el polígono es sólo la mitad del permiso.** Si el saber es
indígena, traer la geometría igual y marcar `requiere_acuerdo: true`; nadie lo
va a activar sin el acuerdo, pero saber que el mapa existe cambia a quién se le
escribe.

### Los primeros, en orden de lo que más rinde

Empezar por donde la jurisdicción administrativa **coincide** con el saber,
porque ahí OSM ya tiene el polígono:

1. `huerta_de_valencia_y_tribunal_de_las_aguas` — la huerta de Valencia tiene
   límite declarado y hay acequias con jurisdicción histórica.
2. `hortillonnages_de_amiens` — superficie chica, delimitada, con figura de
   protección francesa.
3. `winterage_del_burren` — el Burren tiene parque nacional y sitio LIFE con
   límite publicado.
4. `machair` — hábitat cartografiado por JNCC/NatureScot en Escocia.
5. `dehesa` y `montado` — los dos tienen código de hábitat de la Directiva
   Hábitats (6310), y la red Natura 2000 publica polígonos bajo licencia europea.
6. `bisses_del_valais` — los bisses son canales (líneas), pero el Valais puede
   publicar la superficie regada.
7. `polder_y_waterschap` — ya está activo; **no tocarlo**, está acá sólo para
   que se vea cuál es la forma de una respuesta buena.
8. `mx_chinampa_xochimilco` — Xochimilco tiene polígono de sitio Ramsar, de
   patrimonio UNESCO y de área natural protegida mexicana. Tres candidatos.
9. `cac_quesungual` — ya está activo, mismo caso que el 7.
10. `mx_bosque_comunal_sierra_norte_oaxaca` — las comunidades tienen bienes
    comunales con límite registrado.

Después, los 71 restantes, en lotes de seis. La lista completa de ids está en el
bloque de abajo.

### La lista completa de los 85 ids

Centroamérica y el Caribe: `cac_bosques_comunales_y_milpa_k_iche_mam`,
`cac_quesungual`, `cac_kuxur_rum`, `cac_conocimiento_mayangna_de_bosawas`,
`cac_cacao_bribri_y_cabecar`, `cac_agricultura_nainu_guna`,
`cac_vinales_y_conuco_cubano`, `cac_cockpit_country_maroon`,
`cac_agroforesteria_kalinago_de_dominica`.

México: `milpa_maya_ich_kool`, `mx_chinampa_xochimilco`,
`mx_metepantle_tlaxcala`, `mx_agua_tehuacan_cuicatlan`,
`mx_bosque_comunal_sierra_norte_oaxaca`, `mx_milpa_regional`,
`mx_silvicultura_comunitaria`, `mx_caborachi_extension_comunitaria`.

Estados Unidos: `us_three_sisters_local`, `us_ojibwe_manoomin`,
`us_rivercane_cherokee_southeast`, `us_tribal_bison_restoration`,
`us_pueblo_dryland_farming`, `us_pinyon_juniper_cultural_landscape`,
`us_karuk_yurok_cultural_burning`, `us_warm_springs_fire_huckleberry`,
`us_nimiipuu_camas`, `us_pacific_tribal_salmon_comanagement`,
`us_alaska_native_lktks`, `us_everglades_miccosukee_seminole`.

Península ibérica: `dehesa`, `montado`, `careo_de_sierra_nevada`,
`boqueras_y_riego_de_turbias`, `huerta_de_valencia_y_tribunal_de_las_aguas`,
`bancales_de_la_ribeira_sacra_y_del_duero_vinatero`,
`souto_y_minifundio_gallego`, `branas_y_pastos_de_montana_cantabricos`,
`trashumancia_por_canadas_reales`.

Francia, Bélgica, Países Bajos: `bocage_breton_y_normando`,
`bocage_de_las_ardenas`, `hortillonnages_de_amiens`, `marais_y_wateringues`,
`polder_y_waterschap`, `houtwallen_y_elzensingels`, `essen_y_plaggenboden`,
`landes_y_pastoreo_del_brezal`.

Islas británicas e Irlanda: `downland_grazing_sobre_creta`,
`hedgerow_y_enclosure`, `ffridd_y_hafod_hendre_gales`, `machair`, `crofting`,
`corte_de_turba_domestica`, `muinteanas_y_campos_de_piedra_del_oeste_irlandes`,
`winterage_del_burren`. Suiza: `bisses_del_valais`.

Sudamérica: `chakra_amazonica_napo`, `aja_shuar_amazonia_ecuatoriana`,
`chakra_andina_cotacachi`, `agricultura_andina_cusco_puno`,
`sistema_camellidos_norte_chile`, `sistema_pehuenche_ngulumapu`,
`agricultura_chiloe`, `erva_mate_sombreada_parana`,
`apanhadores_sempre_vivas`, `quebradeiras_coco_babacu`,
`chagra_amazonia_colombiana`, `gobernanza_indigena_bosque_colombia`,
`bioay_ashaninka_yanesha`, `tacana_gestion_territorial`,
`pemon_gran_sabana`, `macushi_iwokrama_rupununi`, `patamona_kaieteur`,
`ip_lc_suriname_conservacion`, `kayapo_islas_bosque`,
`ribeirinhos_varzea_amazonica`, `yanesha_bora_barbeco_manejado`,
`pantaneiros_manejo_paisaje`, `wichi_monte_chaco`,
`guarani_erva_mate_bosque`, `caatingueiros_fundos_pasto`,
`ganaderia_familiar_campo_natural_uruguay`, `concheras_manglar_ecuador`,
`pesca_artesanal_orinoco_amazonia_colombia`.

---

## La forma del JSON

Un lote por respuesta, **cuatro a seis entradas**. Las preguntas de los bloques
A y B son más largas que las del C: si una sola entrada del bloque A ocupa todo
el lote, está bien.

```json
{
  "encargo": "licencias",
  "lote": 4,
  "fecha": "2026-10-23",
  "entradas": [
    {
      "id": "censo_eeuu_aiannh",
      "bloque": "A",
      "pregunta": "Bajo qué condiciones se puede redistribuir el shapefile AIANNH dentro de un producto comercial",
      "respuesta": "si | no | parcial | no_pude_confirmar",
      "licencia_declarada": "dominio público (obra del gobierno federal de EE.UU.)",
      "uso_comercial": "si | no | no_dice",
      "obra_derivada": "si | no | no_dice",
      "frase_textual": "La frase exacta de la página, entre comillas, en su idioma original.",
      "terminos_adicionales": "La frase del Additional terms si existe, o null.",
      "formato": "shapefile | geojson | wms | wfs | solo_visor | no_hay",
      "via_de_consulta": "Cómo se pide un punto o una caja, si se puede.",
      "fuentes": [{ "label": "Título tal como lo muestra la página", "url": "https://…" }],
      "verificacion": "Qué dice esa página, con sus palabras, en la página que se abrió.",
      "nota": "La duda, el límite, o la contradicción entre dos páginas."
    }
  ],
  "vacias": [
    { "id": "<id>", "motivo": "Qué se buscó, dónde, y por qué no alcanzó." }
  ]
}
```

Para el bloque C, la entrada es más corta y lleva estos campos en lugar de
`pregunta`/`respuesta`:

```json
{
  "id": "huerta_de_valencia_y_tribunal_de_las_aguas",
  "bloque": "C",
  "hay_poligono": "si | no_hay | hay_pero_no_sirve",
  "que_delimita": "La huerta histórica de Valencia según el PAT de la Huerta",
  "es_el_saber_o_una_aproximacion": "es_el_saber | aproximacion | otra_cosa",
  "geometria_tipo": "poligono | linea | punto",
  "licencia_declarada": "…",
  "uso_comercial": "si | no | no_dice",
  "obra_derivada": "si | no | no_dice",
  "frase_textual": "…",
  "requiere_acuerdo": false,
  "por_que_no_sirve": null,
  "fuentes": [{ "label": "…", "url": "https://…" }],
  "verificacion": "…"
}
```

`requiere_acuerdo` en `true` cuando el saber es de un pueblo o una comunidad
nombrada. No cambia la búsqueda; cambia qué se hace con el resultado.

---

## Las reglas, en corto

1. **Ninguna URL entra sin abrirse.** Si no abre, va a `vacias` con el motivo.
2. **La licencia del dato concreto**, no la del portal. Si hay dos, las dos.
3. **La frase textual, entre comillas y en su idioma.** Traducida no sirve: la
   palabra exacta es lo que decide.
4. **NC y ND descalifican.** No hay matiz ni interpretación favorable.
5. **Un «no» verificado vale tanto como un «sí».** Cerrar una ruta evita que
   alguien la vuelva a intentar. Decir dónde se buscó.
6. **La duda se resuelve del lado de no usar el dato.**
7. **No proponer dibujar, bufferear ni aproximar un polígono.**
8. Un bloque JSON por lote. Sin prosa antes ni después.
