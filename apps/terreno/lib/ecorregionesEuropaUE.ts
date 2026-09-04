/**
 * ECO_ID de RESOLVE que caen en la Unión Europea y en los países asociados a
 * ella, y que el paquete de Europa occidental no había mirado.
 *
 * ESCRITO A MANO. La lista no salió de una lista: salió de enumerar contra el
 * FeatureServer de RESOLVE todas las ecorregiones cuya geometría interseca el
 * territorio de la UE, del EEE y de los países candidatos, y restar las que ya
 * tenían ficha. El paquete había dejado anotados 15 ECO_ID "fuera de alcance";
 * la enumeración devolvió 34, y 19 de ellos no estaban en ninguna lista.
 *
 * El alcance —qué cuenta como Europa— es una decisión, no un dato, así que
 * queda escrita acá: entran los 27 de la UE, el EEE y la AELC (Noruega,
 * Islandia, Suiza, Liechtenstein), el Reino Unido, y los países candidatos
 * (Albania, Bosnia y Herzegovina, Kosovo, Montenegro, Macedonia del Norte,
 * Serbia, Moldavia, Ucrania, Georgia y Turquía).
 *
 * Quedan afuera a propósito, y esto importa para que el próximo barrido no lo
 * lea como olvido:
 *
 * - **Norte de África** —701 Atlas, 797 Libia y Egipto, 798 Magreb, 833 estepa
 *   norsahariana, 839 desierto atlántico sahariano—. Aparecen porque el borde
 *   sur de las cajas ibérica y mediterránea toca el continente africano, no
 *   porque pisen territorio europeo.
 * - **Rusia** —774 tundra de Kola, 778 desierto ártico ruso—. Verificado por
 *   punto: la de Kola no entra en la Laponia finlandesa ni en Finnmark, que
 *   resuelven a 780 y 717.
 * - **Svalbard y Jan Mayen**, que son Noruega pero que RESOLVE directamente no
 *   cubre: la consulta por punto no devuelve ninguna ecorregión.
 * - **Armenia y Azerbaiyán**, que tienen acuerdos de asociación de otro tipo y
 *   quedaron fuera del corte. El 812 entra igual, pero por Georgia: es el
 *   semidesierto del Kura en Kajetia.
 *
 * Macaronesia ya estaba cubierta por el paquete de Europa: Azores (645),
 * Madeira (668), Canarias (787) y el matorral de argán (796) resuelven todos a
 * la ficha `macaronesia`.
 */

export const ECO_ID_EUROPA_UE: Record<number, string> = {
  // Italia
  675: 'po_llanura_aluvial',            // Po Basin mixed forests
  644: 'apeninos_montano',              // Appenine deciduous montane forests
  802: 'apeninos_montano',              // South Apennine mixed montane forests
  795: 'mediterraneo_italiano_insular', // Italian sclerophyllous and semi-deciduous forests
  806: 'mediterraneo_italiano_insular', // Tyrrhenian-Adriatic sclerophyllous and mixed forests

  // Balcanes y Adriático
  660: 'dinaricos_karst',               // Dinaric Mountains mixed forests
  794: 'iliria_adriatico',              // Illyrian deciduous forests
  646: 'balcanes_mixto',                // Balkan mixed forests
  678: 'montana_balcanica_sur',         // Rodope montane mixed forests
  801: 'montana_balcanica_sur',         // Pindus Mountains mixed forests

  // Europa central y báltica
  647: 'baltico_morrena',               // Baltic mixed forests
  679: 'sarmatico_boreonemoral',        // Sarmatic mixed forests
  692: 'carpatos_montano',              // Carpathian montane forests

  // Estepa póntica y mar Negro
  735: 'estepa_pontica_chernozem',      // Pontic steppe
  661: 'estepa_forestal_este',          // East European forest steppe
  658: 'crimea_submediterraneo',        // Crimean Submediterranean forest complex
  665: 'euxino_colquico',               // Euxine-Colchic broadleaf forests
  650: 'caucaso_mixto',                 // Caucasus mixed forests
  812: 'kura_semidesierto',             // Azerbaijan shrub desert and steppe

  // Escandinavia e Islandia
  708: 'costa_conifera_escandinava',    // Scandinavian coastal conifer forests
  780: 'abedular_montano_escandinavo',  // Scandinavian Montane Birch forest and grasslands
  711: 'islandia_abedular',             // Iceland boreal birch forests and alpine tundra

  // Egeo, Creta y Chipre
  785: 'egeo_esclerofilo',              // Aegean and Western Turkey sclerophyllous and mixed forests
  789: 'creta_mediterranea',            // Crete Mediterranean forests
  790: 'chipre_troodos',                // Cyprus Mediterranean forests
  791: 'mediterraneo_oriental_conifera',// Eastern Mediterranean conifer-broadleaf forests

  // Anatolia
  786: 'tauro_conifera_montana',        // Anatolian conifer and deciduous mixed forests
  804: 'tauro_conifera_montana',        // Southern Anatolian montane conifer and deciduous forests
  703: 'ponto_anatolia_norte',          // Northern Anatolian conifer and deciduous forests
  652: 'meseta_anatolia_estepa',        // Central Anatolian steppe and woodlands
  725: 'meseta_anatolia_estepa',        // Central Anatolian steppe
  662: 'anatolia_oriental_montana',     // Eastern Anatolian deciduous forests
  727: 'anatolia_oriental_montana',     // Eastern Anatolian montane steppe
  688: 'zagros_estepa_forestal',        // Zagros Mountains forest steppe
};
