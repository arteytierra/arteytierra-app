# Censo 2024 de Chile — la capa de pueblos originarios, segundo país

Relevamiento del 18/09/2026. Qué se buscó, qué se encontró, qué quedó afuera y
por qué. La capa argentina está auditada en
`../censo-2022-pueblos-indigenas/AUDITORIA.md` y en
`../pueblos-originarios-argentina/AUDITORIA.md`.

El relevamiento de fuentes lo hizo GPT con el encargo de
`../_encargos/PROMPT_GPT_PUEBLOS_ORIGINARIOS_PAISES.md`; el JSON entregado está
en `../pueblos-originarios-paises/chile.json`. Este documento es la verificación
y el montaje.

## Se montó una de las dos fuentes, y la que falta se dice en la pantalla

| Fuente | Equivalente argentino | Estado |
|---|---|---|
| **Censo 2024 del INE** | Censo 2022 del INDEC | **montado** |
| Registro Nacional de Agrupaciones Indígenas (CONADI) | Listado de comunidades del INAI | **afuera** |

El registro de CONADI existe y tiene el dato: 4.311 comunidades vigentes, todas
con coordenada. El problema es cómo se llega a él. El sistema de consulta de
CONADI —`sistemas.conadi.cl/registro2.0/`— pide RUN y contraseña. La única copia
abierta que se encontró es una capa derivada que publica la **Superintendencia
del Medio Ambiente** en un servicio ArcGIS, y **no declara ninguna licencia de
reutilización**: el servicio nombra a CONADI como fuente y ahí termina.

Con eso no se escribe código. Es la regla 6 del encargo y es la misma que ya
rigió en [la capa de saberes territoriales](../../apps/terreno/lib/saberesTerritoriales.ts):
la licencia que vale es la del dataset, y acá no hay ninguna. Acequia cobra, así
que una fuente sin licencia declarada no es una fuente disponible.

Aunque la hubiera, la capa no estaría lista: su propia descripción dice que
actualiza a marzo de 2024 «con excepción de La Araucanía y Los Lagos» pero
igual contiene entidades de las dos regiones; `FECHA_GEO` es el año de
georreferenciación y no el de inscripción; y hay cuatro claves
`REGIÓN`+`REGISTRO` repetidas en ocho filas, una de ellas reusando el registro
1152 para dos comunidades distintas de Aysén. El campo `REGISTRO` no es
identificador único.

**Qué significa para el usuario:** en Chile la sección no dice si hay tierra
indígena inscripta al lado del predio. Eso está escrito en el panel y en el
informe, con el motivo, en vez de mostrar el censo solo como si fuera todo lo
que hay.

## La fuente que sí entró

INE de Chile, Censo de Población y Vivienda 2024, levantado entre el **9 de
marzo y el 31 de julio de 2024**. Cuarta entrega de resultados; la tabla de
pueblos indígenas se publicó el **30/06/2025** y se actualizó el **04/12/2025**.

Licencia **CC BY-SA 4.0** de los datos abiertos del INE: permite uso comercial
con atribución y **obliga a que las adaptaciones lleven la misma licencia**. Por
eso `apps/terreno/lib/censoIndigena2024Cl.ts` declara CC BY-SA 4.0 en su
encabezado: esa tabla es una adaptación de la publicación del INE y queda bajo
esa licencia. El resto del código de acequia no lo está.

Tres planillas, contra las 73 que hicieron falta en la Argentina:

| Archivo | Qué trae | Para qué |
|---|---|---|
| `P2-Pueblos-indigenas.xlsx` | por región y por comuna, personas por pueblo | el dato |
| `D1_Poblacion-censada-…-quinquenales.xlsx` | población censada por región y comuna | el denominador |
| `D3_Poblacion-censada-por-tipo-de-operativo.xlsx` | el universo abierto en tres | la verificación |

Resultado: **2.105.863 personas**, 16 regiones, 56 provincias, **346 comunas**,
**11 rótulos de pueblo**, sobre 18.480.432 personas censadas.

## El denominador, que es la única decisión de fondo

**El INE publica 11,5%. La app muestra 11,4%. Los dos están bien.**

El INE divide 2.105.863 por **18.370.540**, que son las personas que
*respondieron* la pregunta. Las 18.480.432 *censadas* incluyen a 109.892 que no
la contestaron.

El problema es que ese denominador no está publicado por comuna. Sólo está la
población censada. Así que la app divide por población censada en los cuatro
niveles —comuna, provincia, región, país— y el país le da 11,4%.

No se arregla y no es un redondeo: es otro denominador, elegido así porque
mostrar una comuna calculada sobre población censada al lado de un país
calculado sobre quienes respondieron sería **mezclar dos universos en la misma
frase**, que es exactamente el error que en la Argentina obligó a bajar 24
archivos extra. `CENSO_CL_PAIS.porcentajeIne` guarda la cifra oficial para poder
citarla como la publica el INE, y el panel la muestra al lado de la propia con
la explicación.

### El universo no es el mismo que el argentino

El INDEC cuenta población indígena **sólo sobre viviendas particulares**. El INE
de Chile censó también viviendas colectivas (119.027 personas) y personas en
situación de calle (21.750), **y les hizo la misma pregunta**. Por eso acá el
denominador correcto es la población censada entera, y no hace falta el cuarto
cuadro de estructura que en la Argentina fue la razón de 24 descargas.

`D3` está en el relevamiento sólo para verificar esto: 18.339.655 + 119.027 +
21.750 = 18.480.432. Hay un test que lo comprueba.

## Lo que se verifica antes de escribir la tabla

Todas son condiciones de corte: si una falla, no se genera nada.

1. Cada hoja es la que dice ser, por su título, y no por su posición.
2. Las 16 regiones suman el total del país, y también cada columna de pueblo.
3. Las 346 comunas suman el total del país.
4. Las comunas de cada región suman el total de esa región.
5. Los pueblos + «Otro» + «Pueblo no declarado» suman el total, por región y
   por comuna.
6. Las dos planillas hablan de las mismas 346 comunas, **emparejadas por código
   y no por nombre**: la tabla de pueblos se actualizó en diciembre de 2025 por
   el cambio de nombre de una comuna y la de población es de marzo, así que un
   emparejamiento por texto podía perder una comuna sin avisar.
7. Ninguna comuna tiene más gente de pueblos originarios que habitantes.
8. La población de las comunas cierra con la de su región y con el total, y el
   total coincide entre `D1` y `D3`.
9. Ninguna provincia tiene más gente indígena que habitantes.

Todas pasaron en la primera corrida. **No apareció nada como los cinco archivos
con otra provincia adentro que publica `censo.gob.ar`**: las planillas del INE
están bien armadas y son una sola por tema, que es la mitad de las maneras de
equivocarse.

## Las dos trampas que sí tiene esta publicación

**El nombre del archivo dice junio y el contenido es de diciembre.** La URL es
`/2025/06/P2-Pueblos-indigenas.xlsx` y la nota al pie de la tabla comunal dice
que se actualizó el 04/12/2025 «debido al cambio de nombre de la comuna de
Paihuano y la eliminación de la supresión de celdas con 50 casos o menos».
Quien haya bajado el archivo antes de diciembre tiene otra tabla, con celdas
suprimidas. La fecha que vale es la de la nota, no la de la ruta.

**Las dos últimas columnas no son pueblos.** «Otro» (20.631) y «Pueblo no
declarado» (2.395) están al lado de los once rótulos y tienen la misma forma.
Tomarlas como pueblos habría dado trece. El generador las separa por nombre y
corta si alguna vez dejan de estar.

## Las dos listas de pueblos no se comparan

**La chilena es cerrada.** Once alternativas para marcar: los pueblos
reconocidos por la ley 19.253 y sus modificaciones, con **Chango desde 2020** y
**Selk'nam desde 2023**. Quien se reconoce de otro pueblo marca «Otro», y son
20.631 personas.

**La argentina es abierta.** 58 rótulos escritos por quien respondía.

Consecuencias que se ven en los números y que hay que saber leer:

- **Sin declarar pueblo: 0,1% en Chile contra 33% en la Argentina.** No es que
  en Chile la gente sepa más de su origen: es la diferencia entre marcar una
  casilla y escribir una respuesta.
- **Los once pueblos aparecen en las dieciséis regiones.** En la Argentina la
  cantidad de pueblos declarados variaba de 34 a 55 según la jurisdicción y eso
  decía algo; acá no dice nada, porque las casillas existen en todas partes. Por
  eso la tabla de abajo no tiene esa columna y sí la de «Otro».
- **«Quechua» no es el mismo dato en los dos países.** En Chile es una casilla
  que 46.519 personas marcaron; en la Argentina es una respuesta que escribieron
  33.532. Los nombres no se cruzan y hay un test que falla si alguien los
  unifica.

## Cómo se resuelve la comuna, que en Chile no es obvio

Nominatim **no devuelve la comuna en un campo administrativo propio**. Devuelve:

- `state` = la región, con prefijo: «Región de la Araucanía» contra «La
  Araucanía» del INE. Se resuelve normalizando.
- `county` = la **provincia**, no la comuna: «Provincia de Cautín».
- La comuna cae en `city`/`town`/`village` cuando es una sola localidad, y en
  **`suburb` cuando el punto está en una conurbación**.

Ese último caso es el peligroso. Un punto en **Ñuñoa devuelve `city: "Santiago"`
y `suburb: "Ñuñoa"`**. Emparejar por `city` —que es lo que hacía el resolvedor
argentino con `localidad`— habría publicado Ñuñoa con los números de la comuna
de Santiago: **23.972 personas en vez de 9.927**, dos veces y media, con la
fuente citada. Lo mismo con Maipú, Puente Alto y las otras comunas del Gran
Santiago.

Por eso se agregó `Ubicacion.comuna`, que toma `suburb` ?? `city_district`. Es
**opcional**: los payloads de `/api/entorno` cacheados de antes no lo traen, y
el resolvedor tiene que poder contestar sin él.

El orden es del campo más específico al menos, y la búsqueda se hace **sólo
dentro de la región ya resuelta**. Los 346 nombres de comuna son únicos en todo
el país, así que ahí no hay ambigüedad posible —a diferencia de la Argentina,
donde «Rosario» es subconjunto de dos departamentos de Salta y por eso no se
elige ninguno.

Si la comuna no casa, se contesta la **provincia**, que Nominatim sí da como
campo propio. Si tampoco, la **región**. Es un respaldo más fino que el
argentino. La única provincia que no empareja es **Bío-Bío**: Nominatim la
escribe con guion y el INE sin él, así que un punto ahí baja a la región. Es una
degradación, no un error, y la comuna igual se resuelve.

Los casos del test salen de consultar Nominatim de verdad, punto por punto.

## Cobertura por región

Ordenada por proporción, que es lo que dice algo del territorio.

| Región | Personas | % de la población censada | Comunas | «Otro» |
|---|---:|---:|---:|---:|
| Arica y Parinacota | 87.816 | 35,9 | 4 | 1.004 |
| La Araucanía | 347.285 | 34,4 | 32 | 357 |
| Aysén del General Carlos Ibáñez del Campo | 29.230 | 29,0 | 10 | 334 |
| Los Lagos | 236.886 | 26,6 | 30 | 1.256 |
| Atacama | 76.616 | 25,6 | 9 | 539 |
| Tarapacá | 89.987 | 24,3 | 7 | 1.256 |
| Los Ríos | 96.382 | 24,2 | 12 | 179 |
| Magallanes y de la Antártica Chilena | 38.658 | 23,2 | 11 | 292 |
| Antofagasta | 91.280 | 14,4 | 9 | 1.412 |
| Coquimbo | 92.753 | 11,1 | 15 | 1.063 |
| Biobío | 150.917 | 9,4 | 33 | 757 |
| Metropolitana de Santiago | 545.700 | 7,4 | 52 | 9.043 |
| Valparaíso | 103.716 | 5,5 | 38 | 1.761 |
| Libertador General Bernardo O'Higgins | 50.681 | 5,1 | 33 | 643 |
| Maule | 47.811 | 4,3 | 30 | 528 |
| Ñuble | 20.145 | 3,9 | 21 | 207 |
| **Total del país** | **2.105.863** | **11,4** | **346** | **20.631** |

La mayor cantidad está en la Metropolitana —545.700 personas— y es el puesto 12
por proporción: es donde vive más gente, no donde hay más presencia. Es el mismo
patrón que en la Argentina con Buenos Aires.

A escala de comuna el rango es mucho más ancho que el de los departamentos
argentinos: **General Lagos, en Arica y Parinacota, tiene 474 de 508 habitantes
(93,3%)**, y le siguen Camiña (87,2%), Alto Biobío (87,2%) y Saavedra (80,4%).

El detalle completo está en `censo2024-cl-regiones.tsv` y
`censo2024-cl-comunas.tsv`, que son la copia congelada y auditable de lo que se
extrajo de las planillas. Los `.xlsx` no se versionan.

## Lo que la capa no dice

- **No dice de quién es la tierra.** El censo cuenta autorreconocimiento en el
  lugar de residencia. Está escrito en la pantalla.
- **No dice si hay comunidad inscripta al lado del predio.** Esa es la fuente
  que falta, y el panel lo dice con el motivo.
- **No baja de la comuna.** El INE publica microdatos a nivel comuna-área en su
  base de datos, pero a escala de predio la comuna ya es la unidad útil.
- **No compara con el Censo 2017**, que dio 12,8%. La pregunta cambió —en 2024
  se usa la fórmula «es o se considera» y se agregaron dos pueblos—, así que la
  variación no es comparable sin explicarla.

## Bolivia, que quedó afuera

El mismo encargo entregó `../pueblos-originarios-paises/bolivia.json`, con el
Censo 2024 verificado: 4.302.484 personas, nueve departamentos, 113 provincias,
343 municipios, todo cerrando contra el total nacional. **No se montó.**

Los términos del portal del INE de Bolivia dicen textualmente que *«no se
permite utilizar los datos con fines comerciales sin autorización previa del INE
o sin respetar la fuente y contexto originales»*, y el catálogo ANDA agrega que
el acceso «no supone una cesión o licencia de derechos». Es la regla 6: con eso
no se escribe código.

El RIPIO —el registro boliviano, definido en el artículo 361 del Compendio de
Normativa Agraria— existe jurídicamente pero no tiene base pública descargable,
así que quedó `verificado: false`.

**Lo que destraba Bolivia es una autorización escrita del INE**, no más
relevamiento. El JSON queda listo para montar el día que esté.

## Lo que sigue

- **Paraguay y Perú**, que son los dos que faltan de los limítrofes que
  comparten pueblos con la lista argentina.
- El **registro de CONADI**, si aparece una exportación con licencia declarada.
- El pendiente técnico que esta capa agranda: las tablas de censo viajan en el
  bundle de `/mapa`. La chilena son 50 KB de fuente sobre los 90 KB de la
  argentina, y a medida que entren países hay que partirlas por país y cargarlas
  sólo cuando el predio cae en ese país.
