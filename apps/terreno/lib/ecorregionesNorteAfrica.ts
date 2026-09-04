/**
 * ECO_ID de RESOLVE del norte de África mediterráneo.
 *
 * ESCRITO A MANO, mismo método que la UE y Medio Oriente: enumerar contra el
 * FeatureServer de RESOLVE y restar lo mapeado. Son 14 ECO_ID y 14 fichas.
 *
 * El alcance, escrito: los cinco países que dan al Mediterráneo —Marruecos con
 * el Sáhara Occidental, Argelia, Túnez, Libia y Egipto— con su territorio
 * completo, no sólo la franja costera. Eso mete el Sahara adentro a propósito:
 * el oasis, el foggara y el chott son parte del mismo mundo agrícola que la
 * huerta del Rif o el Delta del Nilo, no un anexo.
 *
 * Estas cinco ecorregiones —701, 797, 798, 833, 839— habían quedado declaradas
 * como "fuera de alcance" cuando se cerró Europa, porque entraban por el borde
 * sur de las cajas ibérica y mediterránea sin pisar territorio europeo. Ahora
 * entran por derecho propio y la declaración se dio de baja.
 *
 * Quedan afuera, y verificado por punto, no por criterio:
 *
 * - 53 sabana de acacias del Sahel: entra por el borde sur de las cajas de
 *   Marruecos y Argelia, pero los puntos en Tinduf, Aousserd y Bordj Badji
 *   Mokhtar devuelven 842 y 846, no 53.
 * - 79 pastizal montano etíope: entra por el vértice sudeste de la caja de
 *   Egipto, en el triángulo de Halaib que administra Sudán. El punto sobre el
 *   Gebel Elba devuelve 836.
 *
 * Macaronesia —Canarias (787) y el matorral de argán (796)— ya estaba cubierta
 * por el paquete de Europa; el argán es Marruecos y resuelve a `macaronesia`.
 */

export const ECO_ID_NORTE_AFRICA: Record<number, string> = {
  // La franja mediterránea y el Atlas
  798: 'magreb_bosque_mediterraneo',  // Mediterranean woodlands and forests
  797: 'magreb_estepa_alfa',          // Mediterranean dry woodlands and steppe
  701: 'atlas_conifera_montana',      // Mediterranean conifer and mixed forests
  758: 'alto_atlas_enebro',           // Mediterranean High Atlas juniper steppe

  // El Nilo y las depresiones salinas
  744: 'nilo_delta',                  // Nile Delta flooded savanna
  745: 'chotts_sebkhas',              // Saharan halophytics

  // El Sahara
  833: 'sahara_norte_estepa',         // North Saharan Xeric Steppe and Woodland
  845: 'sahara_occidental_erg',       // West Sahara desert
  822: 'sahara_oriental',             // East Sahara Desert
  842: 'sahara_sur',                  // South Sahara desert
  839: 'sahara_costa_atlantica',      // Saharan Atlantic coastal desert
  846: 'ahaggar_tassili',             // West Saharan montane xeric woodlands
  844: 'uweinat_tibesti',             // Tibesti-Jebel Uweinat montane xeric woodlands

  // El mar Rojo egipcio
  836: 'mar_rojo_costa_desierto',     // Red Sea coastal desert
};
