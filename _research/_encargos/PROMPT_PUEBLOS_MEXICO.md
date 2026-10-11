# Encargo — Pueblos originarios de México (y después Centroamérica, Caribe y Norteamérica)

Mismo método que Chile, Paraguay, Perú, Brasil, Bolivia, Colombia, Ecuador y
Uruguay, que ya están relevados con este contrato. Ahora arranca el bloque norte
y empieza por **México**.

Versión autocontenida: sirve para pegar en una sesión que **no tiene acceso al
repo**. Si la sesión sí está en el repo, agregarle al final:

> Estás en el repo. El contrato está implementado en
> `_research/pueblos-originarios-paises/` —mirá `colombia.json` y `peru.json`
> como referencia de formato— y el resumen país por país en `COBERTURA.md` de la
> misma carpeta. Escribí `mexico.json` ahí y agregá la fila y la sección de
> México a `COBERTURA.md`. No toques `apps/`, `packages/` ni `supabase/`.

---

## Para qué es

**acequia** (https://acequia.app) es una aplicación de análisis de territorio
para diseño regenerativo. Alguien marca su predio y la app le dice qué clima,
qué relieve, qué suelo y qué ecosistema le toca. Una de las secciones responde
**qué pueblos originarios hay en ese territorio**, siempre según las fuentes
oficiales de cada país y siempre citando al organismo.

Es un producto pago, con un plan gratuito. Eso importa dos veces: por la
licencia, y porque **un dato equivocado sale impreso en un informe que alguien
usa para decidir**. Acá no se completa un hueco con una estimación. Si algo no
se sabe, se dice que no se sabe; si una fuente no se pudo abrir, se declara que
no se pudo abrir.

## Qué hay y qué falta, para que no dupliques trabajo

Montado en la app: **Argentina, Chile, Paraguay, Perú y Brasil**.
Relevado pero sin montar, esperando una autorización de licencia: **Bolivia,
Colombia, Ecuador y Uruguay**.
Sin nada: **México, toda Centroamérica, todo el Caribe, Estados Unidos, Canadá y
Groenlandia.** Ese es el hueco.

La regla que se ganó con los ocho anteriores, y que rige acá: **cada país entra
con su denominador y con sus palabras.** No hay un total continental, no se
comparan porcentajes entre países y no se «normaliza» el nombre de un pueblo. El
censo argentino tiene lista abierta, el chileno cerrada, el paraguayo es un
operativo aparte, el peruano ni siquiera lista pueblos sino dos grandes grupos.
Cada uno se explica solo.

## México tiene una trampa que los ocho anteriores no tenían

En México **no hay un solo número de población indígena: hay tres o cuatro, y
son todos oficiales**. El Censo de Población y Vivienda 2020 del INEGI pregunta
por lo menos por autoadscripción indígena y por hablantes de lengua indígena, y
además publica un indicador derivado de población en hogares o viviendas
indígenas. Son universos distintos —uno cuenta identidad, otro cuenta lengua,
otro cuenta hogares— y dan totales muy diferentes.

**Tu primer trabajo es averiguar cuáles son exactamente, con qué pregunta
literal y con qué universo, y elegir uno explicando por qué.** Los otros van en
`lo_que_no_dice` y en `trampas`. Lo que no se puede hacer es tomar el número más
grande porque es el más grande, ni sumar dos de ellos.

Tres organismos distintos, que no dicen lo mismo y no se reemplazan entre sí:

- **INEGI** — el censo. Es el que da personas.
- **INPI** (Instituto Nacional de los Pueblos Indígenas, sucesor de la CDI) — lo
  institucional: catálogo de pueblos y comunidades, regiones indígenas, atlas.
  Averiguá **si existe un padrón o registro de comunidades comparable al del
  INAI argentino**, con altas, bajas y cobertura declarada. Si no existe, se dice
  que no existe: `registro.existe: false` es una respuesta correcta y ya pasó en
  Uruguay.
- **INALI** — el catálogo de lenguas indígenas nacionales, con sus familias,
  agrupaciones y variantes. Es un catálogo lingüístico, **no un padrón de
  pueblos**, y esa distinción tiene que quedar escrita: una agrupación
  lingüística no es un pueblo y las cifras de una no sirven para la otra.

Y una cosa a verificar antes de escribir nada: **hubo una reforma
constitucional en México sobre pueblos y comunidades indígenas y afromexicanas
que los reconoce como sujetos de derecho público.** Fijate si a partir de eso se
creó, o se está creando, algún registro nacional nuevo, y en qué estado está. Si
cambió el panorama, el relevamiento tiene que reflejar el panorama de hoy, no el
de 2020.

También: el censo 2020 pregunta por **población afromexicana**. No es lo mismo
que población indígena y no se suma. Si la app algún día la muestra será en otra
sección; acá se menciona en `lo_que_no_dice` para que quede constancia de que se
la vio y se la dejó afuera a propósito.

## El contrato — un JSON por país

Exactamente estas claves, en este orden. Nada de campos extra, nada de campos
faltantes.

```json
{
  "pais": "México",
  "iso3": "MEX",
  "registro": {
    "existe": true,
    "organismo": "…",
    "nombre": "…",
    "que_cuenta": "Qué es una fila. Y qué NO es: 'no es un padrón de todas las comunidades del país'.",
    "url_pagina": "…",
    "url_archivo": "…",
    "formato": "api | xlsx | csv | geojson | shp | pdf | ods",
    "fecha_distribucion": "AAAA-MM-DD",
    "licencia": "nombre completo de la licencia, como la escribe el organismo",
    "licencia_url": "…",
    "uso_comercial": "si | no | no_dice",
    "niveles": ["nacional", "estado", "municipio", "…"],
    "columnas": ["…"],
    "filas": 0,
    "tiene_coordenadas": false,
    "filas_sin_coordenada": 0,
    "verificado": false,
    "como_se_verifico": "Qué abriste, qué día, qué contaste y qué comprobaste."
  },
  "censo": {
    "existe": true,
    "organismo": "…",
    "anio": 2020,
    "fecha_relevamiento": null,
    "pregunta": "La pregunta literal del cuestionario, entre comillas.",
    "universo": "A quiénes se les preguntó. Ej: 'personas de 3 años y más'.",
    "total_declarado": 0,
    "poblacion_base": 0,
    "url_cuadros": "…",
    "urls_archivos": ["…"],
    "niveles": ["…"],
    "hay_desagregado_por_pueblo": false,
    "hay_desagregado_por_territorio": false,
    "sin_declarar_pueblo": 0,
    "verificado": false,
    "como_se_verifico": "…"
  },
  "pueblos": ["…"],
  "lo_que_no_dice": ["…"],
  "trampas": ["…"],
  "notas": "…"
}
```

Qué significa cada campo difícil:

- **`pueblos`** es la lista de rótulos **tal como los escribe la fuente**, sin
  traducir, sin corregir la grafía y sin unificar variantes. Si la fuente
  escribe «Náhuatl» y otra «nahua», van los dos como los escribe cada una y se
  dice de dónde sale cada lista. Si el censo no desagrega por pueblo, `pueblos`
  va vacío y `hay_desagregado_por_pueblo` en `false`.
- **`total_declarado`** es un número que la fuente publica. **Nunca se calcula.**
  En Uruguay el censo publica «6,3 % declara ascendencia indígena» y no un total:
  ahí `total_declarado` quedó en `null`, porque multiplicar 6,3 % por la
  población habría sido una estimación nuestra disfrazada de dato oficial.
- **`sin_declarar_pueblo`** son los casos que la propia fuente marca como sin
  especificar. Va el número de la fuente; si no lo publica, `null`.
- **`verificado`** es `true` **sólo si bajaste el archivo y lo abriste.** Si el
  enlace oficial devuelve 403 y encontrás un espejo que sí funciona,
  `verificado` queda en `false` y los dos hechos van en `como_se_verifico`. Eso
  es literalmente lo que pasó con FUNAI en Brasil y es la razón por la que ese
  país todavía no se monta.
- **`uso_comercial`** tiene tres valores y `no_dice` es el más común. **No lo
  deduzcas del dominio ni de que sea un organismo público.** Si la página no
  declara licencia, es `no_dice`, y entonces el dato no se monta hasta que haya
  una autorización escrita.
- **`trampas`** es lo más valioso del archivo: cada cosa que haría que alguien
  monte el dato mal. «Cada persona podía declarar hasta dos etnias, así que no se
  suman rótulos como si fueran personas» es una trampa real de Brasil. «El CSV
  del portal está rezagado 16 filas respecto de la API viva» es una trampa real
  de Colombia.

## Las reglas duras

1. **La URL se verifica en la página oficial, no se deduce del dominio.** Si no
   la encontraste, decí que no la encontraste.
2. **Cada cifra que escribas la contaste vos en el archivo abierto.** Si el
   archivo dice que hay 4.589 filas georreferenciadas pero no trae columna de
   coordenadas, eso se escribe así y no se reporta un número de filas sin
   coordenada que nadie contó.
3. **No se suman rótulos como si fueran personas** ni se cruzan dos fuentes para
   que una «confirme» a la otra.
4. **No se completa un hueco con un promedio ni con una estimación.** `null` es
   una respuesta.
5. **Si la fuente nombra un pueblo, se lo nombra como ella.** No se traduce ni se
   normaliza un etnónimo, y no se usa un nombre de pueblo en minúscula como
   ejemplo genérico.
6. **No se publican sitios sagrados, coordenadas de comunidades, recetas
   medicinales ni calendarios ceremoniales.** Si una fuente los trae, se dice que
   existen y se dice que no se van a usar.

## Después de México, en este orden

El orden no es por población: es por **lo que se puede montar**.

1. **Guatemala.** La proporción de población indígena más alta del hemisferio, y
   censo reciente del INE con desagregado por pueblo.
2. **Estados Unidos y Canadá.** Son los más fáciles y por eso van temprano: el
   dato federal estadounidense es de dominio público y Canadá publica bajo una
   licencia de gobierno abierto, así que no hay que pedirle permiso a nadie. En
   Estados Unidos mirá el censo (población American Indian and Alaska Native) y
   las capas de áreas tribales del Census Bureau; en Canadá, Statistics Canada y
   el organismo federal de servicios indígenas. Además la app ya tiene fuente
   nacional de suelo en Estados Unidos, así que ahí hay usuarios.
3. **Panamá, Costa Rica, Nicaragua y Honduras.** Tienen comarcas o territorios
   indígenas con polígonos reales, que es lo que la capa necesita y casi nunca
   consigue.
4. **El Caribe.** Más chico y más disperso. El caso con territorio propio es el
   Territorio Kalinago en Dominica; el resto hay que ver qué publica cada oficina
   de estadística.
5. **Belice, El Salvador, Cuba, República Dominicana, Haití y Groenlandia.**

**Un país por vez.** No arranques el siguiente hasta que el anterior esté
cerrado.

## Fase 2, si te alcanza: cartografía y licencia

Esto es distinto del JSON y no lo mezcles con él. Para cada pueblo que aparezca
en el relevamiento mexicano, la pregunta es: **¿existe cartografía oficial de sus
territorios, publicada y descargable, y qué licencia tiene?**

Sirve porque la app tiene una capa de saberes territoriales que **no se activa
por país ni por ecorregión**: hace falta un polígono con procedencia y licencia
verificadas y que el predio caiga adentro. Hoy hay 30 saberes documentados de
México, Centroamérica y el Caribe y ninguno con territorio aprobado, justamente
porque falta ese polígono. Así que acá **no hace falta escribir más saberes
nuevos** —de eso hay— sino contestar si hay con qué darles territorio.

Entregá eso como una tabla aparte: pueblo o territorio, organismo, URL, formato,
si trae geometría, licencia y `uso_comercial`. Sin geometría o sin licencia, la
fila igual sirve: dice qué hay que pedir.

## Cómo trabajar

1. **Buscá y abrí antes de escribir.** Ninguna cifra sale de memoria.
2. **Antes del JSON, pasame un resumen de lo que encontraste**: qué organismos,
   qué censo, cuántos números distintos de población indígena hay y cuál
   proponés como `total_declarado` y por qué. Esperá que lo confirme.
3. Recién después, el JSON completo en **un solo bloque de código**, para que se
   pueda guardar de una.
4. Al final, un bloque aparte con la **fila para la tabla de cobertura** en el
   formato `| País | ¿Registro? | ¿Censo? | ¿Descargable? | Licencia apta | Qué
   falta |`, y una sección «Estado de México» con las comprobaciones que hiciste,
   en viñetas.
5. Si de todo esto sale que hace falta pedirle una autorización por escrito a un
   organismo mexicano, **decilo y redactá el pedido**, en español de México y
   dirigido al canal que verificaste en la página oficial del organismo. **No lo
   mandes**: los pedidos los manda Jonatan.
