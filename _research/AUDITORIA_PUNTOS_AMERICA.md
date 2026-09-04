# Auditoría de cobertura por punto — América (04/09/2026)

El paquete de Norteamérica-Mesoamérica declara "0 ECO_ID faltantes", pero eso
es dentro de **su propia caja**: la caja se armó con los ECO_ID que el
relevamiento decidió mirar. Nadie había preguntado todavía qué devuelve el
resolutor sobre puntos reales elegidos por fuera de esa lista.

Ese fue exactamente el error que en Europa hizo que `macaronesia` no se
encendiera en Lanzarote y que el montado alentejano no tuviera ficha: la
cobertura declarada era buena y la cobertura real no.

## Cómo se hizo

85 puntos —zonas agrícolas, cordilleras, desiertos, islas y hielos— consultados
contra el FeatureServer de RESOLVE y cruzados contra la lista blanca completa
(`ECO_ID_A_FICHA`, 295 entradas). Sin heurística: el ECO_ID que devuelve el
servicio contra la tabla que tiene la app.

## Resultado

**68 de 85 puntos devuelven ficha regional.** Los que no, no están repartidos al
azar: casi todos caen en un mismo lugar.

### El hueco es Canadá

Diez ECO_ID sin ficha, y nueve son canadienses:

| ECO_ID | ECO_NAME | Dónde pega |
| --- | --- | --- |
| 335 | Gulf of St. Lawrence lowland forests | Isla del Príncipe Eduardo, golfo |
| 355 | Fraser Plateau and Basin conifer forests | interior de Columbia Británica |
| 362 | Okanogan dry forests | Okanagan — fruta y viñedos |
| 370 | Central Canadian Shield forests | Abitibi, escudo quebequés |
| 373 | Eastern Canadian forests | Saguenay, Terranova |
| 381 | Northwest Territories taiga | delta del Mackenzie |
| 382 | Southern Hudson Bay taiga | Churchill |
| 383 | Watson Highlands taiga | Yukón |
| 414 | Canadian Middle Arctic Tundra | Iqaluit, Ártico central |
| 415 | Davis Highlands tundra | norte de Baffin |

Es coherente: el relevamiento se llamó "Mesoamérica y Norteamérica" y cubrió
muy bien Estados Unidos y México, pero de Canadá tomó las praderas, las Rocosas
y la costa del Pacífico, y dejó afuera el escudo, la taiga y el Ártico. Un
predio en el Okanagan —una de las zonas frutícolas más conocidas del
continente— hoy recibe "Bosque templado de coníferas" y nada más.

### El ECO_ID 0, confirmado en el terreno

El barrido encontró el bug y además una vuelta de tuerca que no estaba prevista.

RESOLVE marca la roca y el hielo con `ECO_ID 0` y `BIOME_NAME "N/A"`, pero les
deja `BIOME_NUM 11`, es decir tundra. Verificado en tres puntos: el Campo de
Hielo Sur, el casquete de Groenlandia y el macizo del Denali. Los tres.

Antes de esta sesión, esos tres puntos devolvían la ficha de la tundra de
Alaska y Beringia, porque el 0 estaba mapeado ahí. Sacar esa entrada los
mandaba al bioma global… que también estaba mal, porque el bioma que viene es
"tundra". Un glaciar no tiene el suelo ni la vegetación de la tundra.

Quedó corregido en dos lugares: el 0 salió de `ECO_ID_AMERICA`, y
`resolverBioma` fuerza el bioma 98 —"Roca y hielo", que la propia tabla de
RESOLVE define— cuando el ECO_ID es 0.

### Lo que sí anda

Estados Unidos, México, Centroamérica y el Caribe respondieron bien en los 55
puntos probados, incluidos los casos que suelen fallar: el Valle Central de
California, el Bajío, la Lacandona, los Everglades, los Pantanos de Centla, la
milpa yucateca, Viñales, las Blue Mountains y Trinidad. La Patagonia y la Puna
—que no eran el objeto de este barrido— también resolvieron bien de paso.

## Qué falta

1. Fichas para los diez ECO_ID canadienses de la tabla de arriba. Es el mismo
   trabajo que ya se hizo tres veces y no requiere decidir nada nuevo.
2. Repetir este barrido sobre Europa cuando se cierre el segundo pase; los 15
   ECO_ID que quedaron fuera de alcance (Italia, Alemania, Escandinavia, centro
   y este) van a aparecer acá igual que apareció Canadá.

## Actualización 04/09/2026 — el método cambió y el hueco era mayor

Este barrido por puntos encontró 10 ECO_ID canadienses sin ficha. Enumerar la
envolvente entera contra el FeatureServer encontró **22**. Los doce que faltaban
no eran menos importantes: eran los que no se me ocurrió tocar.

América quedó cerrada con diez fichas nuevas. El método, los resultados y lo que
implica para Europa están en `COBERTURA_RESOLVE_ENVOLVENTES.md`.
