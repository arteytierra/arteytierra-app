/**
 * ECO_ID de RESOLVE de Indomalaya: el sur de Asia, Indochina y la Sonda.
 *
 * Son 34 ECO_ID y 33 fichas —`java_bali_montano` cubre 229 y 288—, y no salieron
 * de enumerar una envolvente como los lotes de la UE o el norte de África. Este
 * lote se recortó al revés: se buscaron las ecorregiones donde el bioma global
 * `resolve_bosque_tropical_humedo` estaba **diciendo un número equivocado**.
 *
 * Ese bioma penaliza la huerta en −25 porque «en los suelos lixiviados que
 * dominan el bioma la fertilidad está en la biomasa viva y no en el suelo».
 * 216 ecorregiones lo heredaban sin pisarlo y 145 no tenían ninguna ficha
 * regional. La sospecha era que media Indomalaya se sostiene sobre andisoles
 * volcánicos, que son lo contrario de un suelo lixiviado.
 *
 * El relevamiento dio dos resultados, y el segundo no era el que se buscaba:
 *
 * - **Las volcánicas eran una falsa alarma en buena medida.** Los andisoles
 *   están en los conos, no repartidos por la ecorregión. De 13 fichas sólo 6
 *   proponen corrección, y `sumatra_bajo` confirma que ahí el −25 era casi
 *   correcto.
 * - **Las aluviales eran el error grande.** Las dos llanuras gangéticas
 *   —516.000 km² de aluvión fértil y de las densidades rurales más altas del
 *   planeta— pasan de −25 a 0 con razón explícita.
 *
 * El relevamiento completo, con la regla del número y qué se cambió al montar,
 * está en `_research/ecosistemas-saberes-indomalaya/`.
 *
 * ## Y después entró una que no era de ese lote
 *
 * El **23/10/2026** se agregó el ECO_ID 290, el Decán central, que es la primera
 * de Indomalaya que **no** es bioma húmedo: es bosque tropical seco, bioma 2. No
 * entró por la regla de arriba —esa regla escala el −25 de huerta del bioma
 * húmedo y acá el bioma pone −10— sino porque adentro de esa ecorregión hay
 * décadas de escurrimiento medido que contradicen lo que la app misma calcula.
 *
 * El vertisol arcilloso del Decán escurre menos que el alfisol arenoso de al
 * lado, al revés de lo que dice cualquier tabla por textura, y acequia deriva el
 * grupo hidrológico de la conductividad saturada. El detalle está en la ficha y
 * el veredicto del lote en `_research/_encargos/RESPUESTAS_FICHAS_INDOMALAYA_DECAN.md`.
 *
 * Lo que este lote **no** cubre: el resto de Indomalaya (península malaya,
 * Borneo de tierra firme, Nueva Guinea, el Himalaya, Indochina seca) sigue
 * cayendo al bioma global. No es un olvido: son las que corregían un número,
 * no las de una región cerrada.
 *
 * Los nombres del comentario son los de RESOLVE (`ECO_ID`/`ECO_NAME`).
 */

export const ECO_ID_INDOMALAYA: Record<number, string> = {
  // India — los Ghats occidentales
  253: 'ghats_norte_deciduo',        // North Western Ghats moist deciduous forests
  254: 'ghats_norte_montano',        // North Western Ghats montane rain forests
  270: 'ghats_sur_deciduo',          // South Western Ghats moist deciduous forests
  271: 'ghats_sur_montano',          // South Western Ghats montane rain forests

  // Sri Lanka — las tres zonas de la isla
  274: 'sri_lanka_humedo_bajo',      // Sri Lanka lowland rain forests
  275: 'sri_lanka_montano',          // Sri Lanka montane rain forests
  301: 'sri_lanka_zona_seca',        // Sri Lanka dry-zone dry evergreen forests

  // El Decán central — la única de bioma seco (bioma 2) de este bloque
  290: 'decan_central_hardwickia',      // Central Deccan Plateau dry deciduous forests

  // La llanura indogangética y el Brahmaputra
  222: 'valle_brahmaputra',          // Brahmaputra Valley semi-evergreen forests
  238: 'gangetica_inferior',         // Lower Gangetic Plains moist deciduous forests
  287: 'gangetica_superior',         // Upper Gangetic Plains moist deciduous forests
  282: 'pantanos_sundarbans',        // Sundarbans freshwater swamp forests

  // Indochina — Irrawaddy, Chao Phraya, Mekong y río Rojo
  234: 'pantanos_irrawaddy',         // Irrawaddy freshwater swamp forests
  235: 'irrawaddy_deciduo',          // Irrawaddy moist deciduous forests
  224: 'pantanos_chao_phraya',       // Chao Phraya freshwater swamp forests
  225: 'chao_phraya_deciduo',        // Chao Phraya lowland moist deciduous forests
  285: 'pantanos_tonle_sap',         // Tonle Sap freshwater swamp forests
  266: 'pantanos_rio_rojo',          // Red River freshwater swamp forests

  // La Sonda — Sumatra, Java, Bali y el suroeste de Borneo
  278: 'sumatra_bajo',               // Sumatran lowland rain forests
  279: 'sumatra_montano',            // Sumatran montane rain forests
  277: 'pantanos_sumatra',           // Sumatran freshwater swamp forests
  305: 'pinar_toba',                 // Sumatran tropical pine forests
  289: 'java_occidental_bajo',       // Western Java rain forests
  230: 'java_oriental_bali_bajo',    // Eastern Java-Bali rain forests
  288: 'java_bali_montano',          // Western Java montane rain forests
  229: 'java_bali_montano',          // Eastern Java-Bali montane rain forests
  273: 'pantanos_borneo_suroeste',   // Southwest Borneo freshwater swamp forests

  // Filipinas
  241: 'luzon_bajo',                 // Luzon rain forests
  240: 'luzon_montano',              // Luzon montane rain forests
  303: 'pinar_luzon',                // Luzon tropical pine forests
  248: 'mindoro',                    // Mindoro rain forests
  231: 'negros_panay',               // Greater Negros-Panay rain forests
  246: 'mindanao_montano',           // Mindanao montane rain forests
  247: 'mindanao_visayas_oriental',  // Mindanao-Eastern Visayas rain forests
};
