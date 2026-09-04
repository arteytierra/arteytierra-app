/**
 * Ecorregiones RESOLVE de Canadá y Groenlandia → fichas regionales.
 *
 * ESCRITO A MANO, no generado. Las otras tres tablas salen de paquetes de
 * investigación; ésta salió de una enumeración: se le pidió al FeatureServer de
 * RESOLVE todas las ecorregiones cuya geometría interseca la envolvente de
 * Canadá y el Ártico —71 ECO_ID— y se restaron las que ya tenían ficha.
 * Quedaban 22, más el ECO_ID 0 que es roca y hielo y no lleva ficha regional a
 * propósito.
 *
 * Por qué faltaban: el paquete de Norteamérica se llamó "Mesoamérica y
 * Norteamérica" y cubrió muy bien Estados Unidos y México, pero de Canadá tomó
 * las praderas, las Rocosas y la costa del Pacífico. El escudo, la taiga, el
 * Ártico, el golfo de San Lorenzo y el interior de Columbia Británica quedaron
 * afuera, y el paquete igual cerró declarando "0 ECO_ID faltantes" porque esa
 * cuenta se hacía contra su propia lista. Un predio en el Okanagan —fruta y
 * viñedos— recibía "Bosque templado de coníferas" y nada más.
 *
 * Los 22 ECO_ID y sus nombres son los que devuelve el servicio, no los que
 * parecen por número: el bloque 370–383 mezcla escudo cerrado con taiga abierta
 * y el 412–421 mezcla tundra de llanura con montaña ártica.
 */

export const ECO_ID_CANADA: Record<number, string> = {
  // Tierras bajas del golfo de San Lorenzo
  335: 'san_lorenzo_tierras_bajas',        // Gulf of St. Lawrence lowland forests

  // Interior montañoso de Columbia Británica y piedemonte de Alberta
  345: 'columbia_britanica_interior',      // Alberta-British Columbia foothills forests
  350: 'columbia_britanica_interior',      // Central British Columbia Mountain forests
  355: 'columbia_britanica_interior',      // Fraser Plateau and Basin conifer forests

  // Bosque seco del Okanagan (sigue al sur de la frontera: Okanogan, WA)
  362: 'okanagan_bosque_seco',             // Okanogan dry forests

  // Bosque hipermarítimo de Haida Gwaii
  365: 'haida_gwaii_hipermaritimo',        // Queen Charlotte Islands conifer forests

  // Bosque boreal cerrado sobre el escudo canadiense
  370: 'escudo_canadiense_boreal',         // Central Canadian Shield forests
  373: 'escudo_canadiense_boreal',         // Eastern Canadian forests
  377: 'escudo_canadiense_boreal',         // Midwest Canadian Shield forests

  // Taiga abierta con permafrost
  374: 'taiga_canadiense_permafrost',      // Eastern Canadian Shield taiga
  378: 'taiga_canadiense_permafrost',      // Muskwa-Slave Lake taiga
  379: 'taiga_canadiense_permafrost',      // Northern Canadian Shield taiga
  381: 'taiga_canadiense_permafrost',      // Northwest Territories taiga
  382: 'taiga_canadiense_permafrost',      // Southern Hudson Bay taiga
  383: 'taiga_canadiense_permafrost',      // Watson Highlands taiga

  // Desierto polar del Alto Ártico
  412: 'alto_artico_desierto_polar',       // Canadian High Arctic tundra

  // Tundra arbustiva del Bajo y Medio Ártico
  413: 'tundra_artica_canadiense',         // Canadian Low Arctic tundra
  414: 'tundra_artica_canadiense',         // Canadian Middle Arctic Tundra

  // Montaña ártica: Baffin oriental y Torngat
  415: 'montana_artica_baffin_torngat',    // Davis Highlands tundra
  421: 'montana_artica_baffin_torngat',    // Torngat Mountain tundra

  // Groenlandia — la franja libre de hielo
  417: 'groenlandia_kalaallit_nunaat',     // Kalaallit Nunaat Arctic steppe
  418: 'groenlandia_kalaallit_nunaat',     // Kalaallit Nunaat High Arctic tundra
};
