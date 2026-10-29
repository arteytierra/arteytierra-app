/**
 * ECO_ID de RESOLVE de Australasia y Oceanía: el reino que estaba entero en cero.
 *
 * Australasia tiene 83 ecorregiones en RESOLVE y Oceanía 24. Antes de este lote
 * había **cero** fichas para Australasia y seis para Oceanía, así que las 83
 * recibían el modificador de su bioma global y nada más.
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
 * Lo que este lote **no** cubre: las otras 82 ecorregiones del reino siguen
 * cayendo al bioma global. El orden que viene está en el encargo de la fase 3:
 * el resto de los rangelands áridos, después las sabanas tropicales del norte,
 * después el suroeste mediterráneo y el mallee, Nueva Zelanda y Tasmania, Nueva
 * Guinea y por último las islas del Pacífico.
 *
 * Los nombres del comentario son los de RESOLVE (`ECO_ID`/`ECO_NAME`).
 */

export const ECO_ID_AUSTRALASIA: Record<number, string> = {
  // Australia Occidental — los rangelands áridos del noroeste
  213: 'pilbara_matorral',            // Pilbara shrublands
};
