/**
 * ECO_ID de RESOLVE que caen en Medio Oriente.
 *
 * ESCRITO A MANO, con el mismo método que la Unión Europea: la lista no salió
 * de una lista, salió de enumerar contra el FeatureServer de RESOLVE todas las
 * ecorregiones cuya geometría interseca la región y restar las que ya tenían
 * ficha. Son 31 ECO_ID para 28 fichas.
 *
 * El alcance —qué cuenta como Medio Oriente— es una decisión, no un dato, así
 * que queda escrita acá: el Levante (Siria, Líbano, Israel y Palestina,
 * Jordania), Mesopotamia (Irak), la península arábiga entera (Arabia Saudita,
 * Yemen con Socotra, Omán, Emiratos, Qatar, Baréin y Kuwait), Irán, y el
 * Cáucaso sur (Armenia y Azerbaiyán). Turquía y Georgia ya habían entrado por
 * el bloque de la UE y sus asociados, así que no se repiten.
 *
 * Quedan afuera a propósito Asia central, Afganistán y Pakistán: las cajas de
 * Irán y de Arabia son polígonos que siguen la frontera justamente para no
 * arrastrarlos. Lo que sí entra desde el otro lado de esas fronteras entra
 * porque la ecorregión cruza y pisa territorio de la región:
 *
 * - 813 Badgyz y Karabil es sobre todo Turkmenistán y Afganistán, pero el
 *   pistachar cruza a Jorasán del Norte; su envolvente empieza en 60,88 °E y
 *   la frontera iraní ahí está en 61,2 °E.
 * - 838 Registán es Afganistán y Pakistán, pero verificado por punto que el
 *   arenal ocupa Sistán, en Irán.
 * - 815 desierto de la llanura caspia baja hasta el Turkmen Sahra de Golestán,
 *   también verificado por punto.
 * - 320 lleva el nombre del delta del Indo pero su envolvente llega a 48,8 °E:
 *   son los manglares de hara del Golfo, de Qeshm a Abu Dabi.
 */

export const ECO_ID_MEDIO_ORIENTE: Record<number, string> = {
  // Arabia del sur y el Cuerno arábigo
   56: 'arabia_sur_bosque_niebla',   // South Arabian fog woodlands, shrublands, and dune
   59: 'yemen_montana_aterrazada',   // Southwest Arabian montane woodlands and grasslands
  108: 'yemen_montana_aterrazada',   // Southwest Arabian Escarpment shrublands and woodlands
  109: 'asir_altiplano_seco',        // Southwest Arabian highland xeric scrub
  107: 'tihama_costa_arida',         // Southwest Arabian coastal xeric shrublands
  105: 'socotra',                    // Socotra Island xeric shrublands
  840: 'hadramaut_meseta',           // South Arabian plains and plateau desert

  // Mar Rojo y Golfo: la franja costera y el manglar
  115: 'mar_rojo_mangle',            // Red Sea mangroves
  837: 'mar_rojo_escarpe',           // Red Sea-Arabian Desert shrublands
  320: 'golfo_persico_mangle',       // Indus River Delta-Arabian Sea mangroves
  811: 'golfo_llanura_costera',      // Arabian-Persian Gulf coastal plain desert
  821: 'arabia_este_niebla',         // East Arabian fog shrublands and sand desert

  // Los desiertos de la península
  809: 'desierto_arabigo',           // Arabian desert
  810: 'nefud_rub_al_khali',         // Arabian sand desert
  831: 'desierto_norarabigo',        // North Arabian desert
  832: 'harrat_basalto',             // North Arabian highland shrublands

  // Omán
  722: 'hajar_falaj',                // Al-Hajar foothill xeric woodlands and shrublands
  723: 'hajar_falaj',                // Al-Hajar montane woodlands and shrublands

  // Levante y Mesopotamia
  739: 'estepa_siria_badia',         // Syrian xeric grasslands and shrublands
  830: 'mesopotamia_jazira',         // Mesopotamian shrub desert
  747: 'mesopotamia_marismas',       // Tigris-Euphrates alluvial salt marsh

  // Irán: el Caspio, la montaña y la meseta
  649: 'hircania_caspio',            // Caspian Hyrcanian mixed forests
  695: 'elburz_estepa_forestal',     // Elburz Range forest steppe
  815: 'caspio_llanura_desertica',   // Caspian lowland desert
  756: 'kopet_dag',                  // Kopet Dag woodlands and forest steppe
  829: 'kopet_dag',                  // Kopet Dag semi-desert
  813: 'badghyz_pistacho',           // Badghyz and Karabil semi-desert
  757: 'kuh_rud_montano',            // Kuh Rud and Eastern Iran montane woodlands
  820: 'kavir_cuencas_endorreicas',  // Central Persian desert basins
  841: 'iran_sur_nubo_sindico',      // South Iran Nubo-Sindian desert and semi-desert
  838: 'sistan_registan',            // Registan-North Pakistan sandy desert
};
