# Pueblos originarios, Argentina — cómo se armó y qué decide

Fecha: 2026-09-17. Montado en `apps/terreno/lib/pueblosOriginariosAr.ts`.

Es la tercera capa de la sección de contexto, y la única que no sale del mapa
físico ni de la bibliografía: sale de un registro del Estado.

## La fuente, y por qué ésta

INAI — **«Listado de comunidades indígenas»**, distribución del **23/02/2024**,
publicada en el portal de datos abiertos del Ministerio de Justicia
(`datos.jus.gob.ar`, dataset `listado-de-comunidades-indigenas`), con licencia
**CC BY 4.0**. Junta dos registros: el **Re.Na.C.I.**, que inscribe la personería
jurídica, y el **Re.Te.C.I.**, el relevamiento territorial de la **Ley 26.160**.

1.878 comunidades, 23 provincias, 229 departamentos, 50 rótulos de pueblo.

Se descartó **Native Land Digital**, que es la fuente que aparece primero
buscando mapas de territorios indígenas: es un proyecto colaborativo que él
mismo aclara que no es un registro ni una fuente autoritativa, y sus polígonos
no tienen procedencia por territorio. Para una app que va a imprimir esto en un
informe, la diferencia entre un mapa colaborativo y un registro con número de
resolución es toda la diferencia.

El **Censo 2022 del INDEC** —1.306.730 personas que se reconocen indígenas o
descendientes, 2,9% de la población en viviendas particulares, con cuadros por
pueblo y provincia— contesta otra pregunta: cuántas personas se autorreconocen
en el lugar donde viven, que incluye la migración interna. Es un dato valioso y
es la continuación natural de esta capa, pero mezclarlo con el registro en una
misma lista haría que ninguno de los dos números se entienda. Queda para un
segundo paso.

## El hallazgo que decidió el diseño

El CSV trae `comunidad_latitud_decimales` y `comunidad_longitud_decimales`, y lo
natural era contestar por distancia: «tantas comunidades registradas en 50 km».

**No se puede: 858 de las 1.878 filas no tienen coordenada.** El 46% del
registro. Una respuesta por radio se habría visto perfectamente bien y habría
estado mal casi la mitad de las veces, sin ninguna señal de que algo faltaba —el
número plausible y equivocado del que habla `apps/terreno/lib/README.md`.

Provincia y departamento, en cambio, están en las 1.878 filas. Por eso la
agregación es administrativa: es la única escala a la que el registro contesta
entero.

De paso, la agregación resuelve algo más. Con las coordenadas se podía dibujar
un mapa de dónde vive cada comunidad, y eso ni el usuario lo pidió ni hace falta
para diseñar un predio. Lo que se muestra es una lista de pueblos y un conteo:
la app no dice dónde está nadie.

## Las cinco respuestas posibles, y ninguna es «no hay»

`registroDelPunto` devuelve una unión y no un objeto con campos opcionales, para
que el panel esté obligado a escribir una frase distinta en cada caso:

| Estado | Cuándo | Qué dice el panel |
|---|---|---|
| `sin_ubicacion` | todavía no se corrió Entorno | ofrece el botón para correrlo |
| `fuera_de_argentina` | el predio está en otro país | que el registro es argentino, y que eso no dice nada del otro país |
| `jurisdiccion_desconocida` | el geocodificador devolvió un rótulo que no es ninguno de los 24 | que preferimos no contestar |
| `sin_comunidades` | Ciudad de Buenos Aires, la única | que ninguna comunidad hizo ahí el trámite |
| `con_registro` | hay datos | los pueblos, los conteos y el estado del relevamiento |

La cuarta fila es la que más importa y la que casi no se escribe. Si mañana
Nominatim renombrara «Córdoba» a «Provincia de Córdoba», una comparación exacta
devolvería vacío, y un vacío en esta capa se lee como «acá no hay pueblos
originarios». Por eso la lista de jurisdicciones es cerrada: lo que no está en
ella es un nombre que no reconocemos, no un territorio vacío.

## El emparejamiento del departamento, y por qué a veces no contesta

Nominatim devuelve el departamento en `state_district` con tres formas distintas
—«Departamento Iruya», «Partido de Tandil», «Rivadavia» pelado— y el INAI
abrevia seis: «Grl. José de San Martín», «Dr. Manuel Belgrano», «Juan F.
Ibarra», «Mayor Luis J. Fontana», «Libertador Grl. San Martín», «José C. Paz».

El normalizador saca tildes, puntuación, los sustantivos de la división
(«departamento», «partido», «comuna»), los artículos y las iniciales sueltas, y
expande las abreviaturas. Después hay tres pasos:

1. nombre normalizado exacto;
2. si no, que uno sea subconjunto de palabras del otro —así «General San Martín»
   encuentra a «Grl. José de San Martín»—, **pero sólo si el candidato es
   único**;
3. si hay dos, no se elige: se contesta la provincia y se dice que la precisión
   es provincial.

El tercer paso es la regla entera. **Un departamento equivocado es peor que
ninguno**: es afirmar que hay comunidades registradas de un pueblo en un lugar
donde no las hay, o al revés.

Los casos del test salen de consultar Nominatim de verdad, punto por punto: la
quebrada de Iruya, el Pilcomayo en Salta, Tandil, la Ciudad de Buenos Aires,
Zapala, Cushamen, Ushuaia. No son ejemplos inventados.

## Los nombres de los pueblos: qué se corrige y qué no

El campo `comunidad_pueblo` usa « - » para las comunidades que el registro anota
con más de un pueblo («Wichí - Guaraní», «Kolla - Wichí - Guaraní») y espacio
para las denominaciones compuestas («Mapuche Tehuelche»), que son otra cosa. Se
parte sólo por « - ».

Se corrigen **tres errores ortográficos** y nada más: `Diaguita Calchaqui` →
`Diaguita Calchaquí`, `Pilaga` → `Pilagá`, `kolla` → `Kolla`. Es la misma palabra
escrita mal en algunas filas.

**No se unifica nada más, y es deliberado.** Conviven en la tabla:

- `Ranquel` (La Pampa, San Luis, Córdoba, Mendoza) y `Rankel` (una comunidad de
  Buenos Aires, de la fila «Mapuche - Rankel»);
- `Mapuche Tehuelche` (39 comunidades) y `Tehuelche Mapuche` (una, en Chubut);
- `Diaguita`, `Diaguita Calchaquí` y `Diaguita (Cacano)`, que el registro usa en
  provincias distintas;
- `Chiriguano`, que viene de la fila «Wichí - Chiriguano» de Salta y es el
  exónimo de lo que el mismo registro llama `Ava Guaraní` en otras 23
  comunidades.

El último caso es el que más tienta. Reemplazarlo sería mejorar la lista y sería
también que una app decida cómo se llama un pueblo, a partir de una regla que
nadie le dio. La decisión es la contraria: el registro los escribe así, se
muestran así, y el panel dice que los nombres son los del registro. Hay un test
que falla si alguien los unifica.

Las dos filas multiétnicas —«Multiétnica (Diaguita - Kolla - Quechua - Guaraní -
Mapuche, Qom y otros)» y «kolla - Qom - otros (Multietnica)», las dos de Buenos
Aires— no se parten: despedazarlas por los guiones deja pedazos que no son
pueblos.

## Qué significa el conteo, que no es lo que parece

`comunidades` junto a un pueblo cuenta **las comunidades en las que el registro
anota a ese pueblo**, no las comunidades de ese pueblo. En Salta hay comunidades
anotadas como «Wichí - Chorote» o «Wichí - Qom (Toba)», y las dos columnas las
cuentan. Por eso la suma por pueblo puede pasar el total de la provincia —en
Salta lo pasa— y por eso el conteo nunca se muestra como un total. El panel lo
dice con esas palabras.

## El límite del dato

**Que un departamento no figure no significa que no haya pueblos originarios.**
Significa que no hay comunidades *registradas*, y el registro depende de que una
comunidad haya iniciado y sostenido un trámite ante el Estado. Su ausencia habla
del trámite, no de la gente.

Es el mismo criterio que rige `contextoActual.ts` con OpenStreetMap —vacío es
«no mapeado», nunca «no hay»—, y acá pesa más porque el vacío es sobre personas.
Hay un test que falla si el panel escribe «no hay pueblos originarios».

El otro límite es la fecha. Es una foto al 23/02/2024, no un servicio: el
registro se mueve y esta tabla no. La fecha se muestra siempre al lado de los
números, y regenerar con una distribución nueva hace fallar el test de totales
a propósito, para que nadie cambie 1.878 por otro número sin mirarlo.

## Cobertura del registro

| | Comunidades | Pueblos |
|---|---|---|
| Salta | 521 | 27 |
| Jujuy | 298 | 16 |
| Formosa | 160 | 4 |
| Misiones | 126 | 1 (Mbya Guaraní) |
| Chaco | 122 | 3 |
| Chubut | 113 | 5 |
| Río Negro | 108 | 3 |
| Santiago del Estero | 103 | 6 |
| Buenos Aires | 70 | 14 |
| Santa Fe | 67 | 8 |
| Neuquén | 57 | 2 |
| Mendoza | 35 | 5 |
| La Pampa | 19 | 3 |
| Tucumán | 18 | 3 |
| Córdoba | 14 | 4 |
| San Juan | 13 | 2 |
| Catamarca | 11 | 3 |
| Santa Cruz | 10 | 3 |
| Corrientes | 4 | 1 |
| Entre Ríos | 3 | 1 (Charrúa) |
| San Luis | 3 | 2 |
| Tierra del Fuego | 2 | 2 (Selk´Nam, Yagán) |
| La Rioja | 1 | 1 (Diaguita) |
| **Total** | **1.878** | **50 rótulos** |

Relevamiento territorial de la Ley 26.160, en todo el país: **989 culminados**,
146 iniciados, 127 en trámite, **612 sin relevar** y 4 sin dato. Es decir que un
tercio largo de las comunidades registradas todavía no tiene su territorio
medido, casi veinte años después de la ley.

## Lo que sigue

- El **Censo 2022 del INDEC** por pueblo y provincia, como segunda fuente y con
  su propia explicación de qué mide.
- Los **registros provinciales**: hay provincias con su propio registro además
  del nacional, y el CSV distingue el tipo de inscripción (`Nacional`,
  `Provincial`, `Provincial (por convenio)`), que todavía no se muestra.
- Otros países. Esta capa es argentina y lo dice cuando el predio está afuera.
