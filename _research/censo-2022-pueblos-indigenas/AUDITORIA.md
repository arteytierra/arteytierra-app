# Censo 2022 — población indígena, segunda fuente de la capa de pueblos originarios

Relevamiento del 17/09/2026. Qué se buscó, qué se encontró, qué quedó afuera y
por qué. La capa que ya estaba —el registro de comunidades del INAI— está
auditada en `../pueblos-originarios-argentina/AUDITORIA.md`.

## La pregunta, que es otra

El registro del INAI cuenta **comunidades con trámite ante el Estado**. El censo
cuenta **personas que se reconocen indígenas o descendientes, donde viven**. No
se reemplazan ni se suman: se muestran juntas porque donde discrepan está lo que
ninguna de las dos dice sola.

El caso que lo deja claro: en la Ciudad Autónoma de Buenos Aires el registro del
INAI no tiene **ninguna** comunidad inscripta, y el censo cuenta **74.724
personas** que se reconocen indígenas. Ninguno de los dos números está mal.

## La fuente

INDEC, Censo Nacional de Población, Hogares y Viviendas 2022, levantado el
**18 de mayo de 2022**, resultados definitivos del módulo de población indígena
publicados en **marzo de 2024**.

Cuatro series de cuadros, 73 planillas:

| Cuadro | Qué trae | Para qué |
|---|---|---|
| `c10` (nacional) | por jurisdicción: población en viviendas particulares e indígena | el control de todo lo demás |
| `c8_<n>` (provincial) | personas por pueblo declarado, y las que no declararon | la lista de pueblos |
| `c1_<n>` (provincial) | por departamento: población indígena | el dato a escala del predio |
| `est_c3_<n>` (provincial) | por departamento: población en viviendas particulares | el denominador |

Resultado: **1.306.730 personas**, 24 jurisdicciones, **527 departamentos**,
**58 rótulos de pueblo**, sobre 45.618.787 personas en viviendas particulares
(2,9% del país).

### Por qué el cuarto cuadro

Porque el porcentaje se calcula con el denominador que corresponde. La población
indígena se cuenta **sobre viviendas particulares**; el cuadro de población total
por departamento (`est_c1`) incluye viviendas colectivas. Usarlo habría dado un
porcentaje apenas más chico —medio punto en Anta— y mal calculado. Son 24
archivos más para que la división sea la correcta.

## El hallazgo: cinco archivos de censo.gob.ar tienen adentro otra provincia

Los cuadros se publican en dos lugares con el mismo nombre de archivo:
`censo.gob.ar/wp-content/uploads/…` e `indec.gob.ar/ftp/cuadros/poblacion/…`.

En censo.gob.ar, cinco de los veinticuatro cuadros 8 **no son de la provincia
que dice el nombre del archivo**:

| Archivo | Contiene |
|---|---|
| `c2022_chubut_poblacion_indigena_c8_5.xlsx` | cuadro 8.9 — Formosa |
| `c2022_cordoba_poblacion_indigena_c8_6.xlsx` | cuadro 8.11 — La Pampa |
| `c2022_sanjuan_poblacion_indigena_c8_18.xlsx` | cuadro 8.20 — Santa Cruz |
| `c2022_tdf_poblacion_indigena_c8_23.xlsx` | cuadro 8.24 — Tucumán |
| `c2022_santacruz_poblacion_indigena_c8_20.xlsx` | cuadro 8 — total del país |

En indec.gob.ar los veinticuatro son correctos. La misma copia de censo.gob.ar
tiene defectos más chicos: en su cuadro 1.23.3 el título no nombra a Ushuaia.

**Cómo apareció:** el generador compara el total de cada cuadro 8 contra el
cuadro nacional antes de escribir nada, y Chubut dio 47.459 donde el cuadro 10
dice 46.670. Sin esa comparación, la app habría publicado los pueblos de Formosa
como si fueran los de Chubut: Wichí, Pilagá y Qom en la cordillera, con el
número redondo y la fuente citada. Es exactamente la falla que describe
`apps/terreno/lib/README.md` — no se estrella, imprime algo plausible.

Por eso el generador identifica cada cuadro **por su número** (`Cuadro 8.17` es
Salta) y no por el nombre del archivo, y baja de indec.gob.ar.

## Lo que se verifica antes de escribir la tabla

Todas son condiciones de corte: si una falla, no se genera nada.

1. El cuadro abierto es el de la provincia esperada, por número de cuadro.
2. El total del cuadro 8 == el del cuadro 10 nacional, provincia por provincia.
3. Los pueblos + «sin información» == el total de la provincia.
4. Los departamentos suman el total de la provincia.
5. Las 24 jurisdicciones suman el total del país, en población y en población
   indígena.
6. Ningún departamento tiene más gente indígena que habitantes.
7. Cada departamento del cuadro 1 tiene su par en el cuadro 3, y al revés.

La única advertencia que quedó viva: **Antártida Argentina** no tiene población
en viviendas particulares —sus 81 habitantes están todos en colectivas—, así que
no entra en la tabla. No entra como cero: no entra.

## Los nombres de pueblo no se cruzan con los del INAI

El censo escribe `Qom/Toba`, `Wichi` sin tilde, `Selk´Nam/Ona` con un apóstrofo
tipográfico raro; el INAI escribe `Qom (Toba)`, `Wichí`, `Selk'nam`. Emparejar
las grafías haría creer que una fuente confirma a la otra, cuando son dos
preguntas distintas hechas por dos organismos distintos. Se muestran como las
escribe cada uno, y hay un test que falla si alguien las unifica.

Tampoco se corrige nada dentro del censo: los 58 rótulos son los publicados.

## Lo que la capa no dice

- **No dice de quién es la tierra.** El censo cuenta autorreconocimiento en el
  lugar de residencia, con la migración interna adentro: alguien que se reconoce
  kolla y vive en Rosario suma en Santa Fe. Eso está escrito en la pantalla, no
  sólo acá.
- **No es un padrón de pueblos.** 431.703 personas —el 33% de las que se
  reconocen indígenas— no declararon pueblo. La cifra viaja al lado de la lista,
  por provincia.
- **No baja del departamento.** El INDEC publica hasta radio censal en Redatam,
  pero eso es una consulta interactiva y no una descarga; y a escala de predio el
  departamento ya es la unidad útil.
- **No compara con el Censo 2010.** La pregunta cambió —2010 preguntó por hogar
  y 2022 a cada persona—, así que la variación no es comparable sin explicarla.

## Cobertura por jurisdicción

| Jurisdicción | Personas | % de la población | Deptos. | Pueblos declarados |
|---|---:|---:|---:|---:|
| Jujuy | 81.538 | 10,1 | 16 | 47 |
| Salta | 142.870 | 10,0 | 23 | 44 |
| Chubut | 46.670 | 7,9 | 15 | 48 |
| Formosa | 47.459 | 7,8 | 9 | 34 |
| Neuquén | 54.436 | 7,7 | 16 | 42 |
| Río Negro | 48.194 | 6,4 | 13 | 44 |
| Chaco | 53.798 | 4,8 | 25 | 42 |
| Catamarca | 19.668 | 4,6 | 16 | 41 |
| La Pampa | 15.659 | 4,4 | 22 | 36 |
| Santa Cruz | 12.525 | 3,7 | 7 | 47 |
| Tierra del Fuego | 5.942 | 3,2 | 3 | 43 |
| La Rioja | 10.645 | 2,8 | 18 | 37 |
| Santiago del Estero | 28.022 | 2,6 | 27 | 44 |
| Ciudad Autónoma de Buenos Aires | 74.724 | 2,4 | 15 | 53 |
| Mendoza | 45.389 | 2,2 | 18 | 50 |
| Tucumán | 37.646 | 2,2 | 17 | 39 |
| Buenos Aires | 371.830 | 2,1 | 135 | 55 |
| Misiones | 26.006 | 2,0 | 17 | 41 |
| Córdoba | 69.218 | 1,8 | 26 | 52 |
| San Juan | 14.457 | 1,8 | 19 | 38 |
| Santa Fe | 57.193 | 1,6 | 19 | 50 |
| San Luis | 8.340 | 1,5 | 9 | 42 |
| Entre Ríos | 18.693 | 1,3 | 17 | 43 |
| Corrientes | 15.808 | 1,3 | 25 | 41 |
| **Total del país** | **1.306.730** | **2,9** | **527** | **58** |

Ordenada por proporción, que es lo que dice algo del territorio: Buenos Aires
tiene la población indígena más grande del país en números absolutos —371.830
personas— y está en el puesto 17 por proporción. Y la cantidad de pueblos
declarados crece con la mezcla de población, no con la presencia histórica: en
la Ciudad de Buenos Aires se declararon 53 de los 58 pueblos del país.

Los porcentajes y las dos últimas columnas se calculan de la tabla generada; el
detalle completo está en `censo2022-jurisdicciones.tsv` y
`censo2022-pueblos.tsv`, que son la copia congelada y auditable de lo que se
extrajo de las planillas.

## Lo que sigue

- Los **registros provinciales** de comunidades: el CSV del INAI distingue
  inscripción nacional, provincial y por convenio, y todavía no se muestra.
- **Otros países.** La capa entera es argentina. El equivalente de cada país
  existe pero no es homologable: Chile tiene el registro de CONADI y su censo,
  Perú la Base de Datos de Pueblos Indígenas, Brasil la FUNAI y el IBGE. Cada
  uno mide una cosa distinta y hay que auditarlos de uno en uno.
- **La comparación 2010 → 2022**, si se decide explicar el cambio de pregunta.
