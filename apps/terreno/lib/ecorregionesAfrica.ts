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
 * ## El miombo seco, que llegó con el primario que le faltaba al húmedo
 *
 * El ECO_ID 42 son 119,26 millones de hectáreas en seis países y el lote 2 lo
 * cubre con su propia ficha. El `pasturas +20` vuelve a quedar en **0**, pero no
 * por copiar el cero de arriba: acá está abierto *The Miombo in Transition*
 * (CIFOR, 1996), que publica la regresión entre lluvia anual y rinde herbáceo
 * para todo el miombo y da **r de 0,147, no significativa y de pendiente
 * negativa**, mientras la biomasa y el área basal leñosas sí suben con la lluvia
 * y el rinde herbáceo cae exponencialmente contra el área basal. Más lluvia hace
 * más madera y la madera le hace sombra al pasto, que es exactamente lo que la
 * ficha del miombo húmedo sólo podía insinuar a través del informe de Gorongosa.
 *
 * Se **agrega** `huerta −20` —el bioma de sabana no la nombra— y se **mueve**
 * `forestal` de −10 a +5, porque la razón del global es forestar un pastizal y
 * acá no hay pastizal: la cobertura nativa es el bosque y el monte bajo de sus
 * propias especies es el sistema indígena. Paga poco: 1,2 a 2,0 Mg/ha/año de
 * incremento de biomasa en rebrote, con pico de producción a los 18 a 20 años.
 *
 * **Y dos puntos medidos corrigieron el lote, uno de ellos contra lo que yo
 * había escrito acá al lado.** La meseta de Makonde, sobre la que la entrega
 * construyó su párrafo de suelos y dos de sus cultivos, da **ECO_ID 28**, bioma
 * 1: bosque húmedo costero y no sabana. Y Nyimba, que el comentario de la
 * constante del archivo de fichas afirmaba que estaba en el 42, da **ECO_ID
 * 66**. Lo que sí está adentro, y es lo mejor del lote, es el análisis de suelos
 * de Niassa: capacidad de intercambio catiónico efectiva de 3,84 a 0,67 meq/100
 * g y **pH de 6,5 a 7,3**, o sea un suelo que no es ácido, al contrario del
 * perfil lixiviado con aluminio del miombo húmedo.
 *
 * ## Lo que estos lotes no cubren
 *
 * Las otras 106 ecorregiones del reino siguen cayendo al bioma global. El orden
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

  // El miombo seco, que es otro sistema y no una versión pobre del de arriba:
  // menos lluvia, el estrato herbáceo en la rama suprimida de la curva de dosel
  // de punta a punta, y el único tramo del miombo donde el desmonte contra la
  // tsetsé queda abierto.
  42: 'miombo_seco',              // Dry miombo woodlands
};
