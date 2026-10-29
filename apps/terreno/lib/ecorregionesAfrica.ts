/**
 * ECO_ID de RESOLVE del África tropical y austral: el reino más grande en cero.
 *
 * El reino afrotropical tiene 116 ecorregiones en RESOLVE. Antes de este lote
 * tenían ficha **siete**, y las siete son de Arabia —el escarpe del Yemen,
 * Socotra, los manglares del Mar Rojo—, que entraron por el paquete de Medio
 * Oriente. África al sur del Sahara estaba entera en cero: las 109 restantes
 * recibían el modificador de su bioma global y nada más. El norte de África
 * mediterráneo es otro reino y ya está cerrado por su propio paquete.
 *
 * ## Por qué arranca por el miombo
 *
 * Porque las 31 ecorregiones de sabana de este reino son el bloque de ganadería
 * extensiva más grande del planeta, y todas heredan el mismo número:
 *
 *     pasturas +20 · «Es un bioma de gramíneas y pastoreo: el sistema pastoril
 *                     es el nativo, no un reemplazo.»
 *
 * Esa razón está escrita sobre la sabana arquetípica —la de gramíneas, la del
 * Serengeti y el bushveld— y el encargo de la fase 5 decía, con honestidad, que
 * en África el modificador global probablemente acierte, porque este reino es el
 * lugar del que salió. **En el miombo húmedo no acierta, y el lote lo encontró en
 * las fuentes de la propia ecorregión.**
 *
 * El miombo no es un pastizal con árboles: es un bosque de Caesalpinioideae
 * donde el estrato de gramíneas es estacional y de bajo contenido de nutrientes.
 * La ficha de One Earth de la mitad central dice que la densidad de grandes
 * herbívoros es baja y lo atribuye a la estación seca dura, las sequías largas y
 * los suelos pobres, «which results in vegetation of low nutrient content»; la de
 * la mitad angoleña dice que la población humana es baja por los suelos pobres y
 * por la mosca tsetsé, vector de la tripanosomiasis, «that affect humans as well
 * as domestic livestock». Y las cargas publicadas para la formación la ponen en
 * el piso de su propio bioma, no en el techo: 15 hectáreas por unidad animal en
 * miombo contra 6 a 8 en sabana de Urochloa y 3 a 4 en pastizal aluvial
 * inundable.
 *
 * El veredicto completo, con el problema que esto le abre al motor de forraje de
 * la app, está en `_research/_encargos/RESPUESTAS_FICHAS_AFRICA_MIOMBO.md`.
 *
 * ## Lo que este lote no cubre
 *
 * Las otras 107 ecorregiones del reino siguen cayendo al bioma global. El orden
 * que viene está en el encargo de la fase 5: el resto de las sabanas y el mopane,
 * después el Congo y los bosques húmedos de África occidental, después el Karoo
 * y los desiertos del suroeste, después los pastizales de montaña y los
 * inundables, y al final el fynbos, los bosques secos y los manglares.
 *
 * Los nombres del comentario son los de RESOLVE (`ECO_ID`/`ECO_NAME`).
 */

export const ECO_ID_AFRICA: Record<number, string> = {
  // El miombo húmedo — una sola formación partida en dos ecorregiones, las dos
  // de la bioregión AT11 y las dos del centro de endemismo zambeziano.
  39: 'miombo_humedo_zambeziano', // Central Zambezian wet miombo woodlands
  36: 'miombo_humedo_zambeziano', // Angolan wet miombo woodlands
};
