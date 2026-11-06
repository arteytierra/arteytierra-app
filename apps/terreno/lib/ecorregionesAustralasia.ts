/**
 * ECO_ID de RESOLVE de Australasia y Oceanía: el reino que estaba entero en cero.
 *
 * Australasia tiene 83 ecorregiones en RESOLVE y Oceanía 24. Antes del primer
 * lote había **cero** fichas para Australasia y seis para Oceanía, así que las
 * 83 recibían el modificador de su bioma global y nada más. Van dos.
 *
 * El recorte no es geográfico: es por dónde el número heredado hace daño. Diez
 * de esas 83 son desiertos y matorrales xéricos australianos y heredan del bioma
 * global de desierto:
 *
 *     pasturas −15 · «La carga que aguanta es baja y el error se paga con
 *                     desertificación, no con menos kilos.»
 *
 * Esa razón está escrita sobre el desierto como arquetipo, y los rangelands
 * áridos australianos son una de las ganaderías extensivas más grandes del
 * mundo: no son un desierto sin ganado. La pregunta del lote era si el −15 está
 * mal ahí.
 *
 * **En el Pilbara la respuesta fue que no está mal, y el porqué resultó más útil
 * que una corrección.** El relevamiento oficial de la región —12.445
 * evaluaciones de traverse sobre 181.723 km²— mide la vegetación en 77 % buena,
 * 11 % regular y 12 % pobre, contra un promedio de 39 / 34 / 27 para todos los
 * rangelands de Australia Occidental ya relevados. El propio informe explica la
 * diferencia: «The relatively low overall impact of pastoralism is due to the
 * large areas of vegetation of moderate to very low pastoral value, i.e. the
 * spinifex hummock grasslands». Es decir: el Pilbara está en buen estado porque
 * la mayor parte no se puede pastorear. El forraje está en las praderas de
 * tussock y los matorrales de quenopodiáceas, que son las formaciones «most
 * extensively and substantially altered» y están sobre los suelos frágiles. Ver
 * el veredicto en `_research/_encargos/RESPUESTAS_FICHAS_AUSTRALASIA.md`.
 *
 * ## Y en el Murchison tampoco está mal, pero el mecanismo es otro
 *
 * El ECO_ID 216 son 46,38 millones de hectáreas, diez veces el Pilbara, y el
 * lote 2 lo cubre con el otro relevamiento oficial de la misma serie —Technical
 * Bulletin 84, campaña de 1985 a 1988, 88.360 km², 13.441 evaluaciones de
 * traverse—. El `−15` también se confirma y por un camino distinto: en el
 * Pilbara el forraje vive en un octavo de la superficie, mientras acá los 74
 * sistemas de tierras tienen todos capacidad asignada y lo que pasa es que la
 * escalera entera es flaca. El 79 % de la superficie está en 12 o 20 hectáreas
 * por equivalente oveja seca, la mejor tierra del relevamiento entero son 76
 * km², y esas capacidades valen para condición buena, que es el 21 % del área:
 * el Murchison es el peor de los diez relevamientos de rangeland del estado.
 *
 * **Y tres puntos medidos corrigieron el lote.** El relevamiento del bajo
 * Murchison, que el encargo invitaba a usar y la entrega encontró, cae en
 * **ECO_ID 205** —seis puntos medidos, de Kalbarri al norte de Geraldton—, que
 * es bioma 12 mediterráneo y no este matorral árido; su 78 % de vegetación en
 * buen estado no es una recuperación del 21 %, es otro lugar. El propio
 * relevamiento del Murchison se sale del polígono por el rincón suroeste, que es
 * el que su texto llama «the moister far south-western corner»: Yalgoo y Mullewa
 * dan 205. Y One Earth describe la ecorregión como «temperate
 * Mediterranean-climate woodland» sobre un matorral de 190 a 240 mm.
 *
 * Lo que estos dos lotes **no** cubren: las otras 81 ecorregiones del reino
 * siguen cayendo al bioma global. El orden que viene está en el encargo de la
 * fase 3: el resto de los rangelands áridos, después las sabanas tropicales del
 * norte, después el suroeste mediterráneo y el mallee, Nueva Zelanda y Tasmania,
 * Nueva Guinea y por último las islas del Pacífico.
 *
 * Los nombres del comentario son los de RESOLVE (`ECO_ID`/`ECO_NAME`).
 */

export const ECO_ID_AUSTRALASIA: Record<number, string> = {
  // Australia Occidental — los rangelands áridos del noroeste y del interior
  213: 'pilbara_matorral',            // Pilbara shrublands
  216: 'mulga_australia_occidental',  // Western Australian Mulga shrublands
};
