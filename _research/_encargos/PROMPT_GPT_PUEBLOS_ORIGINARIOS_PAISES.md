# Encargo — fuentes de pueblos originarios, país por país

Tarea de relevamiento de fuentes. **No se escribe código y no se estiman
números.** El resultado es un JSON por país con las fuentes oficiales
verificadas; con eso Claude arma la capa dentro de la app.

## Qué existe ya

Argentina está hecha, con dos fuentes que miden cosas distintas:

1. **Un registro administrativo** — INAI, «Listado de comunidades indígenas»:
   cuenta *comunidades con trámite ante el Estado*. 1.878 comunidades.
2. **Un censo** — INDEC 2022: cuenta *personas que se reconocen indígenas o
   descendientes, donde viven*. 1.306.730 personas.

Se muestran juntas porque no se reemplazan. En la Ciudad de Buenos Aires el
registro tiene cero comunidades y el censo cuenta 74.724 personas: los dos
números son ciertos.

**Se busca lo mismo para los demás países.** Argentina no se vuelve a relevar:
está abajo como ejemplo de un JSON terminado.

## Entregable

Una carpeta `_research/pueblos-originarios-paises/` con:

- `<pais>.json` — uno por país, con el esquema de abajo.
- `COBERTURA.md` — tabla: país, ¿registro?, ¿censo?, ¿descargable?, licencia
  apta, y en una línea qué falta.

## Orden de los países

Primero los cuatro limítrofes que comparten pueblos con la lista argentina
(mapuche, aymara, quechua, guaraní, wichí, qom):

1. Chile 2. Bolivia 3. Paraguay 4. Perú

Después: 5. Brasil 6. Uruguay 7. Colombia 8. Ecuador 9. México.

**Un país por vez, terminado y validado, antes de pasar al siguiente.** Cuatro
países bien relevados valen más que nueve a medias.

## Esquema del JSON

Todos los campos van siempre. Lo que no se sabe va en `null` y el motivo en
`notas`. **Nunca se rellena con lo probable.**

```json
{
  "pais": "string — nombre en español",
  "iso3": "ARG",
  "registro": {
    "existe": true,
    "organismo": "string — nombre completo del organismo",
    "nombre": "string — nombre exacto del dataset o registro",
    "que_cuenta": "string — una oración: qué unidad cuenta (comunidades, tierras tituladas, personerías…)",
    "url_pagina": "string — la página donde está publicado",
    "url_archivo": "string|null — link directo al csv/xlsx/shp/geojson; null si sólo hay consulta web",
    "formato": "csv|xlsx|shp|geojson|api|pdf|solo_consulta_web",
    "fecha_distribucion": "YYYY-MM-DD|null — la fecha de la versión publicada, no la de hoy",
    "licencia": "string — el texto de la licencia tal como la declaran",
    "licencia_url": "string|null",
    "uso_comercial": "si|no|no_dice",
    "niveles": ["nacional", "provincia|region|departamento", "municipio|comuna"],
    "columnas": ["los nombres de columna tal como vienen"],
    "filas": 0,
    "tiene_coordenadas": true,
    "filas_sin_coordenada": 0,
    "verificado": true,
    "como_se_verifico": "string — qué se abrió y qué se vio. Si el archivo se descargó, decir su tamaño y la primera fila."
  },
  "censo": {
    "existe": true,
    "organismo": "string",
    "anio": 2022,
    "fecha_relevamiento": "YYYY-MM-DD|null",
    "pregunta": "string — la pregunta textual del cuestionario, entre comillas, tal como está",
    "universo": "string — a quién se le preguntó (toda la población, mayores de X, viviendas particulares…)",
    "total_declarado": 0,
    "poblacion_base": 0,
    "url_cuadros": "string — la página de cuadros de resultados",
    "urls_archivos": ["links directos a los cuadros que sirven"],
    "niveles": ["nacional", "region", "departamento|municipio"],
    "hay_desagregado_por_pueblo": true,
    "hay_desagregado_por_territorio": true,
    "sin_declarar_pueblo": 0,
    "verificado": true,
    "como_se_verifico": "string"
  },
  "pueblos": ["los rótulos de pueblo tal como los escribe la fuente, sin corregir"],
  "lo_que_no_dice": [
    "string — cada límite en una oración. Mínimo dos.",
    "string"
  ],
  "trampas": [
    "string — todo lo que confundiría a quien lea los archivos sin aviso: archivos mal nombrados, totales que no cierran, dos versiones distintas del mismo cuadro, cambios de pregunta entre censos."
  ],
  "notas": "string — lo que no entró en ningún campo"
}
```

## Reglas, y son de corte

1. **Toda URL va abierta antes de escribirla.** Si el link no abre o el archivo
   no baja, `verificado: false` y en `como_se_verifico` qué pasó (404, pide
   registro, es una consulta interactiva).
2. **Ningún número sin cuadro.** `total_declarado`, `filas`,
   `sin_declarar_pueblo`: cada uno sale de una tabla publicada que se abrió. Si
   no se abrió, `null`. Un número aproximado o «del orden de» no sirve: la app
   lo va a imprimir como si fuera exacto.
3. **Los nombres de pueblo se copian, no se corrigen.** Ni tildes, ni
   mayúsculas, ni «esto es lo mismo que aquello». Si una fuente escribe
   `Qom/Toba` y otra `Qom (Toba)`, van las dos como están. Decidir cómo se llama
   un pueblo no es parte del encargo.
4. **No se cruzan las dos fuentes de un país entre sí, ni con Argentina.** No
   hay que armar una lista unificada.
5. **Contar las filas sin coordenada es obligatorio si el archivo tiene
   coordenadas.** En Argentina el 46% de las comunidades no tiene punto, y eso
   cambió el diseño entero de la capa: si no se cuenta, alguien va a calcular
   distancias sobre la mitad del registro sin saberlo.
6. **La licencia es parte del trabajo.** Si no permite uso comercial, va
   `uso_comercial: "no"` y se dice igual: con eso no se escribe código, y
   saberlo ahorra el relevamiento del resto.
7. **Wikipedia, notas de prensa, papers y ONG no son fuentes acá.** Sólo el
   organismo oficial. Si un dato sólo aparece en prensa, va en `notas` marcado
   como tal, nunca en un campo numérico.
8. **Si hay dos copias del mismo cuadro, se comparan.** Pasó en Argentina:
   cinco de los veinticuatro cuadros provinciales que publica `censo.gob.ar`
   tienen adentro otra provincia —el archivo llamado `chubut` trae Formosa— y en
   `indec.gob.ar` están bien. Eso va en `trampas`.
9. **`lo_que_no_dice` no se deja vacío.** Un registro de comunidades no dice
   dónde no hay pueblos originarios; un censo no dice de quién es la tierra.
   Cada fuente tiene su versión de esto y hay que escribirla.
10. **JSON válido, UTF-8, una entrada por país.** Se valida antes de entregar.

## Ejemplo terminado — Argentina

No hay que rehacerlo. Es el estándar de «listo»: este nivel de detalle en cada
campo es lo que se pide.

```json
{
  "pais": "Argentina",
  "iso3": "ARG",
  "registro": {
    "existe": true,
    "organismo": "Instituto Nacional de Asuntos Indígenas (INAI)",
    "nombre": "Listado de comunidades indígenas",
    "que_cuenta": "Comunidades indígenas con personería inscripta en el Re.Na.C.I. y/o relevadas por el Re.Te.C.I. (Ley 26.160).",
    "url_pagina": "https://datos.jus.gob.ar/dataset/listado-de-comunidades-indigenas",
    "url_archivo": "https://datos.jus.gob.ar/dataset/listado-de-comunidades-indigenas",
    "formato": "csv",
    "fecha_distribucion": "2024-02-23",
    "licencia": "Creative Commons Atribución 4.0 Internacional",
    "licencia_url": "https://creativecommons.org/licenses/by/4.0/deed.es",
    "uso_comercial": "si",
    "niveles": ["nacional", "provincia", "departamento"],
    "columnas": ["comunidad_pueblo", "comunidad_provincia", "comunidad_departamento", "personeria_juridica_estado", "personeria_tipo_inscripcion", "relevamiento_estado", "comunidad_latitud_decimales", "comunidad_longitud_decimales"],
    "filas": 1878,
    "tiene_coordenadas": true,
    "filas_sin_coordenada": 858,
    "verificado": true,
    "como_se_verifico": "CSV descargado (678 KB), 1.878 filas de datos, 23 provincias y 229 departamentos distintos; la Ciudad de Buenos Aires no aparece."
  },
  "censo": {
    "existe": true,
    "organismo": "Instituto Nacional de Estadística y Censos (INDEC)",
    "anio": 2022,
    "fecha_relevamiento": "2022-05-18",
    "pregunta": "¿Se reconoce indígena o descendiente de pueblos indígenas u originarios?",
    "universo": "Población en viviendas particulares",
    "total_declarado": 1306730,
    "poblacion_base": 45618787,
    "url_cuadros": "https://censo.gob.ar/index.php/datos_definitivos/",
    "urls_archivos": [
      "https://www.indec.gob.ar/ftp/cuadros/poblacion/c2022_tp_poblacion_indigena_c10.xlsx",
      "https://www.indec.gob.ar/ftp/cuadros/poblacion/c2022_salta_poblacion_indigena_c8_17.xlsx"
    ],
    "niveles": ["nacional", "provincia", "departamento"],
    "hay_desagregado_por_pueblo": true,
    "hay_desagregado_por_territorio": false,
    "sin_declarar_pueblo": 431703,
    "verificado": true,
    "como_se_verifico": "73 planillas descargadas de indec.gob.ar. El total de cada cuadro provincial se comparó contra el cuadro 10 nacional y cierra en las 24 jurisdicciones; los departamentos suman el total de su provincia."
  },
  "pueblos": ["Mapuche", "Guaraní", "Diaguita", "Qom/Toba", "Kolla", "Wichi", "Quechua", "…los 58 del cuadro 8"],
  "lo_que_no_dice": [
    "El registro no dice dónde no hay pueblos originarios: depende de que una comunidad haya iniciado y sostenido un trámite, así que su ausencia habla del trámite y no de la gente.",
    "El censo cuenta autorreconocimiento en el lugar de residencia, con la migración interna adentro: no dice de quién es la tierra ni quién estuvo antes.",
    "Un tercio de quienes se reconocen indígenas no declaró pueblo, así que la lista de pueblos no es un padrón."
  ],
  "trampas": [
    "Cinco de los veinticuatro cuadros 8 publicados en censo.gob.ar contienen otra provincia (el de Chubut trae Formosa, el de Córdoba La Pampa, el de San Juan Santa Cruz, el de Tierra del Fuego Tucumán y el de Santa Cruz el total del país). En indec.gob.ar los veinticuatro son correctos.",
    "El cuadro de población total por departamento incluye viviendas colectivas, y la población indígena se cuenta sólo sobre viviendas particulares: para el porcentaje hay que usar el cuadro 3 de estructura.",
    "El Censo 2010 preguntó por hogar y el 2022 a cada persona, así que la variación entre ambos no es comparable sin explicarlo."
  ],
  "notas": "Native Land Digital se descartó como fuente: es colaborativo y su propio sitio aclara que no es un registro ni tiene validez legal."
}
```

## Antes de entregar cada país

- [ ] El JSON parsea.
- [ ] Todas las URLs abren, y las de archivo bajan un archivo.
- [ ] Cada número tiene un cuadro detrás que se abrió.
- [ ] `lo_que_no_dice` tiene al menos dos entradas.
- [ ] La licencia está transcripta, no resumida.
- [ ] Ningún nombre de pueblo fue corregido ni unificado.
- [ ] Si algo no se pudo verificar, está dicho en `como_se_verifico`.

Y avisar cuál país quedó listo, para montarlo.
