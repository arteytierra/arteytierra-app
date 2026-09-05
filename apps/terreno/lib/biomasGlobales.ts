/**
 * Fichas de bioma global — el respaldo cuando no hay ficha regional.
 *
 * Son los 14 biomas de RESOLVE 2017 (más roca y hielo). Cubren cualquier punto
 * terrestre del planeta, y por eso mismo son gruesas: describen el ecosistema a
 * escala de bioma y nada más.
 *
 * Deliberadamente **no llevan saberes ni especies**. Una lista de especies o de
 * prácticas culturales sólo es verdadera dentro de una región concreta: el
 * bosque templado caducifolio de Ohio y el de Hokkaido son el mismo bioma y no
 * comparten ni un árbol. Poner contenido regional acá sería exactamente el error
 * que estas fichas existen para evitar. Ese detalle llega cuando se cura el
 * ECO_ID y se escribe la ficha regional en lib/biomasRegionales.ts.
 *
 * Fuentes: Dinerstein et al., "An Ecoregion-Based Approach to Protecting Half
 * the Terrestrial Realm", BioScience 67(6), 2017.
 */

import type { BiomaFicha, Fuente, ModificadorAptitud } from './biomaTipos';

const DINERSTEIN: Fuente = {
  label: 'Dinerstein et al. (2017) — Ecorregiones terrestres del mundo',
  url: 'https://doi.org/10.1093/biosci/bix014',
};
const CATALOGO: Fuente = {
  label: 'RESOLVE Ecoregions 2017 — catálogo y descarga',
  url: 'https://developers.google.com/earth-engine/datasets/catalog/RESOLVE_ECOREGIONS_2017',
};
const FUENTES = [DINERSTEIN, CATALOGO];

/**
 * Arma una ficha global: sin saberes ni especies, siempre las mismas fuentes.
 *
 * Sí lleva modificadores de aptitud, y eso no contradice la regla de arriba.
 * Una especie o una práctica sólo son ciertas en una región; una restricción de
 * uso del suelo, en cambio, es una propiedad del bioma: que la fertilidad de la
 * selva húmeda esté en la biomasa y no en el suelo vale igual en el Amazonas y
 * en Borneo, y es justo lo que decide que ahí no se abre huerta a suelo desnudo.
 * Ese es el nivel al que estas fichas pueden hablar sin inventar.
 */
function global(
  id: string, nombre: string, emoji: string, color: string,
  resumen: string, vegetacion: string, fauna: string, suelos: string,
  aptitud: ModificadorAptitud[] = [],
): BiomaFicha {
  return { id, nombre, emoji, color, resumen, vegetacion, fauna, suelos, saberes: [], especies: [], aptitud, fuentes: FUENTES };
}

export const BIOMAS_GLOBALES: Record<string, BiomaFicha> = {
  resolve_bosque_tropical_humedo: global(
    'resolve_bosque_tropical_humedo', 'Bosque tropical y subtropical húmedo', '🌴', '#1B5E20',
    'Bosques de hoja ancha con lluvia abundante y poca amplitud térmica anual. Son los ecosistemas terrestres más diversos del planeta y guardan la mayor parte de sus nutrientes en la biomasa viva, no en el suelo.',
    'Dosel alto y cerrado en varios estratos, con abundancia de epífitas, lianas y palmas. La luz que llega al piso es escasa, así que la regeneración depende de los claros que abren los árboles al caer.',
    'Diversidad muy alta y muy repartida: gran parte de la fauna vive en el dosel. Muchas especies frugívoras cumplen el rol de dispersar semillas, del que depende la regeneración del bosque.',
    'Suelos profundos pero pobres y ácidos, muy lixiviados por la lluvia. La fertilidad está en el mantillo y el reciclado rápido de materia orgánica: dejarlos desnudos los agota en pocos ciclos.',
    [
      { uso: 'huerta', delta: -25, razon: 'La fertilidad está en la biomasa viva, no en el suelo: abierto y desnudo se lava en pocas temporadas. La huerta va en claros chicos y con cobertura permanente.' },
      { uso: 'forestal', delta: 20, razon: 'El sistema productivo que sostiene este bioma es agroforestal de varios estratos, no de suelo limpio.' },
    ],
  ),

  resolve_bosque_tropical_seco: global(
    'resolve_bosque_tropical_seco', 'Bosque tropical y subtropical seco', '🌾', '#8D6E63',
    'Bosques de clima cálido con una estación seca marcada de varios meses. Menos altos y menos densos que la selva húmeda, y entre los más transformados del mundo por su aptitud agrícola y ganadera.',
    'Árboles y arbustos mayormente caducifolios, que pierden la hoja para atravesar la seca. Abundan las leguminosas, las espinosas y las especies con reservas en tronco o raíz.',
    'Fauna adaptada al pulso estacional, con migraciones locales y períodos de baja actividad durante la seca. La disponibilidad de agua concentra la vida en pocos sitios varios meses al año.',
    'Suelos en general más fértiles que los de la selva húmeda, con más arcilla y mejor reserva de bases. Vulnerables a la erosión justo cuando el suelo queda desnudo al final de la seca.',
    [
      { uso: 'pasturas', delta: 10, razon: 'El pulso estacional favorece el pastoreo, pero sólo con descanso: al final de la seca el suelo queda expuesto justo cuando llegan las primeras lluvias fuertes.' },
      { uso: 'huerta', delta: -10, razon: 'Sin riego o cosecha de agua, la huerta queda parada varios meses del año.' },
    ],
  ),

  resolve_bosque_coniferas_tropical: global(
    'resolve_bosque_coniferas_tropical', 'Bosque tropical de coníferas', '🌲', '#33691E',
    'Pinares y bosques de coníferas en zonas tropicales y subtropicales, casi siempre de montaña. Ocupan poca superficie mundial y suelen convivir con el fuego recurrente.',
    'Pinos y otras coníferas en dosel abierto, con sotobosque de gramíneas y arbustos. La estructura depende del régimen de fuego más que de la lluvia.',
    'Fauna de bosque abierto, con especialistas de pinares y de los pastizales asociados. La fragmentación es el problema principal en la mayor parte de su superficie.',
    'Suelos ácidos, con acumulación lenta de acículas y descomposición pausada. Ojo con la compactación y con la pérdida del horizonte orgánico tras un fuego intenso.',
    [
      { uso: 'forestal', delta: 15, razon: 'La estructura del bioma depende del fuego recurrente: el uso forestal con manejo de combustible es el que le corresponde.' },
      { uso: 'huerta', delta: -10, razon: 'Suelos ácidos y horizonte orgánico frágil, que se pierde con un fuego intenso o con el laboreo.' },
    ],
  ),

  resolve_bosque_templado_caducifolio_mixto: global(
    'resolve_bosque_templado_caducifolio_mixto', 'Bosque templado caducifolio y mixto', '🍂', '#587A4A',
    'Bosques de latitudes medias con cuatro estaciones marcadas y una parada invernal del crecimiento. La caída anual de hoja construye suelos profundos y es la base de su fertilidad.',
    'Árboles de hoja ancha caducifolia, a menudo mezclados con coníferas. Sotobosque estacional que aprovecha la luz de la primavera antes de que cierre el dosel.',
    'Fauna con estrategias de invernada: hibernación, migración o acumulación de reservas. Los bordes entre bosque, agua y claro concentran la mayor diversidad.',
    'Suelos con buen horizonte orgánico y fertilidad media a alta, muy variables según roca madre e historia glacial. Responden bien a la cobertura permanente y mal a la compactación.',
    [
      { uso: 'frutales', delta: 10, razon: 'La parada invernal da las horas de frío que los frutales de hoja caduca necesitan para cuajar.' },
    ],
  ),

  resolve_bosque_coniferas_templado: global(
    'resolve_bosque_coniferas_templado', 'Bosque templado de coníferas', '🌲', '#2E5E4E',
    'Bosques dominados por coníferas en climas templados, a menudo costeros o de montaña, con inviernos frescos y buena disponibilidad de humedad. Incluyen algunos de los bosques con más biomasa por hectárea del planeta.',
    'Coníferas de gran porte y longevidad, con sotobosque de helechos, musgos y arbustos donde hay humedad. La madera muerta en pie y caída es parte estructural del bosque, no un residuo.',
    'Fauna asociada a bosques maduros y a la continuidad del dosel; muchas especies dependen de árboles viejos, huecos y troncos caídos.',
    'Suelos ácidos con horizonte orgánico grueso y descomposición lenta por el frío y los taninos. Conservar la hojarasca es más importante acá que en casi cualquier otro bioma.',
    [
      { uso: 'forestal', delta: 15, razon: 'Bioma de mucha biomasa por hectárea, con la madera muerta como parte de la estructura.' },
      { uso: 'huerta', delta: -12, razon: 'Horizonte orgánico grueso y descomposición lenta: sacarle la hojarasca cuesta décadas de recuperar.' },
    ],
  ),

  resolve_bosque_boreal_taiga: global(
    'resolve_bosque_boreal_taiga', 'Bosque boreal / taiga', '🌲', '#37474F',
    'La franja de bosque de coníferas del hemisferio norte, con inviernos largos y muy fríos y una temporada de crecimiento corta. Enorme reserva de carbono, buena parte en el suelo y en turberas.',
    'Abetos, piceas, pinos y alerces en masas extensas, con abedules y álamos en las etapas jóvenes. Musgos y líquenes cubren el piso.',
    'Diversidad baja pero poblaciones grandes, con ciclos poblacionales marcados. El fuego y los insectos son los motores naturales de la renovación.',
    'Suelos fríos, ácidos y con drenaje lento; frecuentes turberas y, hacia el norte, permafrost. La descomposición es tan lenta que la materia orgánica se acumula durante siglos.',
    [
      { uso: 'huerta', delta: -25, razon: 'La estación de crecimiento es demasiado corta para casi cualquier ciclo a campo abierto.' },
      { uso: 'frutales', delta: -20, razon: 'El invierno excede lo que tolera la fruticultura de hoja caduca corriente.' },
      { uso: 'forestal', delta: 15, razon: 'El uso que el bioma banca es forestal, con turnos largos.' },
    ],
  ),

  resolve_sabana_tropical: global(
    'resolve_sabana_tropical', 'Sabana y pastizal tropical', '🌾', '#C9A227',
    'Pastizales tropicales con árboles dispersos, sostenidos por la combinación de lluvia estacional, fuego y herbivoría. No son un bosque degradado: son un ecosistema propio con su dinámica.',
    'Estrato de gramíneas continuo, con árboles y arbustos aislados o en bosquecitos. La proporción entre pasto y leñosas la definen el fuego, el pastoreo y la profundidad del suelo.',
    'Grandes herbívoros y sus depredadores donde todavía existen, más una fauna de pastizal que depende de que el pasto no quede ni raso ni cerrado todo el año.',
    'Suelos muy variables, de arenosos y pobres a arcillosos y fértiles; frecuentes los horizontes endurecidos. El pisoteo en la estación húmeda es la principal causa de compactación.',
    [
      { uso: 'pasturas', delta: 20, razon: 'Es un bioma de gramíneas y pastoreo: el sistema pastoril es el nativo, no un reemplazo.' },
      { uso: 'forestal', delta: -10, razon: 'Forestar una sabana no es restaurarla: le cambia el régimen de fuego y de agua que la sostiene.' },
    ],
  ),

  resolve_pastizal_templado: global(
    'resolve_pastizal_templado', 'Pastizal templado', '🌾', '#B08968',
    'Praderas y estepas de latitudes medias, con lluvia insuficiente para el bosque y suficiente para un tapiz de gramíneas denso. Sus suelos están entre los más fértiles del mundo, y por eso casi todo el bioma fue arado.',
    'Gramíneas perennes de raíz profunda con herbáceas de flor intercaladas. Casi toda la biomasa está bajo tierra: es lo que les permite rebrotar tras el fuego, la sequía o el pastoreo.',
    'Fauna de espacio abierto, con aves que nidifican en el suelo y mamíferos cavadores que estructuran el hábitat de muchas otras especies.',
    'Suelos negros, profundos y ricos en materia orgánica, construidos por milenios de raíces. Perdieron gran parte de su carbono con la agricultura continua; la cobertura permanente es lo que lo repone.',
    [
      { uso: 'pasturas', delta: 20, razon: 'El pastizal templado es el bioma donde el pastoreo rotativo tiene su mejor caso.' },
      { uso: 'huerta', delta: 10, razon: 'Suelos profundos y ricos en materia orgánica, de los mejores del planeta para cultivo.' },
      { uso: 'forestal', delta: -10, razon: 'El pastizal no es un bosque que falta: forestarlo baja la napa y pierde su suelo característico.' },
    ],
  ),

  resolve_pastizal_inundable: global(
    'resolve_pastizal_inundable', 'Pastizal y sabana inundable', '💧', '#4E8098',
    'Llanuras que se inundan de forma estacional o permanente, donde el pulso del agua manda sobre todo lo demás. Sostienen una productividad muy alta y concentraciones enormes de aves acuáticas.',
    'Pastizales y juncales tolerantes a la anegación, con vegetación acuática en los sectores más bajos y leñosas sólo en los albardones.',
    'Fauna acuática y aves migratorias en gran número; el calendario reproductivo de casi todo el sistema está atado al ciclo de crecida y bajante.',
    'Suelos hidromórficos, con horizontes reducidos y a veces salinos o sódicos. Drenarlos parece una mejora y suele terminar en oxidación de la materia orgánica, subsidencia y salinización.',
    [
      { uso: 'reserva', delta: 20, razon: 'El valor del bioma está en el pulso de inundación, que cualquier drenaje cancela.' },
      { uso: 'huerta', delta: -20, razon: 'Suelo saturado buena parte del año: la raíz no respira.' },
      { uso: 'pasturas', delta: 5, razon: 'Admite pastoreo estacional, en la ventana en que el bajo escurre.' },
    ],
  ),

  resolve_montano: global(
    'resolve_montano', 'Pastizal y matorral montano', '⛰️', '#6D8B74',
    'Pastizales, matorrales y turberas de altura, por encima del límite del bosque. Frío, radiación intensa y gran amplitud térmica diaria; muchas veces son la fábrica de agua de las cuencas de abajo.',
    'Pastos duros en mata, arbustos bajos y plantas en roseta o cojín, todas con adaptaciones al frío, al viento y a la sequía fisiológica.',
    'Fauna especializada y con rangos chicos, lo que la vuelve muy sensible al cambio climático: cuando sube la temperatura no tiene hacia dónde ir salvo hacia arriba.',
    'Suelos someros, pedregosos y con materia orgánica que se acumula por el frío. Se erosionan con facilidad y tardan muchísimo en rehacerse: el sobrepastoreo acá deja marcas de décadas.',
    [
      { uso: 'forestal', delta: 10, razon: 'Pendiente y pisos altitudinales: la cobertura leñosa es lo que sostiene la ladera.' },
      { uso: 'huerta', delta: -10, razon: 'La huerta sólo entra en terraza o en pie de ladera, no en la pendiente abierta.' },
    ],
  ),

  resolve_tundra: global(
    'resolve_tundra', 'Tundra', '❄️', '#78909C',
    'Ecosistemas sin árboles de las latitudes altas, con temporada de crecimiento de pocas semanas y suelo congelado buena parte del año. Guardan una cantidad enorme de carbono en el permafrost.',
    'Musgos, líquenes, gramíneas y arbustos enanos, todos de porte muy bajo y crecimiento lentísimo. Una huella de vehículo puede seguir visible décadas después.',
    'Pocas especies residentes y una llegada masiva de aves migratorias en el verano breve. Los grandes herbívoros se mueven en recorridos estacionales largos.',
    'Suelos delgados sobre permafrost, mal drenados en verano por la capa congelada de abajo. Cualquier alteración de la superficie acelera el deshielo y libera carbono.',
    [
      { uso: 'huerta', delta: -35, razon: 'Suelo helado buena parte del año y estación de crecimiento de pocas semanas.' },
      { uso: 'frutales', delta: -30, razon: 'No hay bioma frutícola acá: el ciclo no cierra.' },
      { uso: 'reserva', delta: 25, razon: 'La capa activa tarda siglos en recomponerse de una intervención.' },
    ],
  ),

  resolve_mediterraneo: global(
    'resolve_mediterraneo', 'Bosque y matorral mediterráneo', '🫒', '#8C9A5B',
    'Regiones con verano seco y caluroso e invierno suave y lluvioso, presentes en cinco puntos del planeta. Comparten forma pero no historia: cada una tiene su flora, su fauna y sus sistemas agrarios.',
    'Matorral esclerófilo de hoja dura y perenne, con bosques abiertos de encinas, pinos u otras especies según la región. Casi todas están adaptadas a un fuego recurrente.',
    'Diversidad alta y mucho endemismo, con fauna adaptada a atravesar el verano seco reduciendo su actividad.',
    'Suelos delgados, pedregosos y bajos en materia orgánica, muy erosionables en las lluvias fuertes del otoño sobre suelo desnudo y seco. La cobertura de verano es lo que los sostiene.',
    [
      { uso: 'frutales', delta: 15, razon: 'Es el bioma del olivo, la vid y el almendro: la seca de verano con frío de invierno les sienta.' },
      { uso: 'huerta', delta: -10, razon: 'La huerta de verano necesita riego: es justo cuando el bioma no tiene agua.' },
    ],
  ),

  resolve_desierto_matorral_xerofilo: global(
    'resolve_desierto_matorral_xerofilo', 'Desierto y matorral xerófilo', '🌵', '#C08552',
    'Zonas donde la evaporación supera largamente a la lluvia, que además es escasa e impredecible. La vida se organiza alrededor de dónde y cuándo aparece el agua.',
    'Vegetación rala y espaciada, con suculentas, arbustos de hoja chica y plantas anuales que completan su ciclo entero en las pocas semanas posteriores a una lluvia.',
    'Fauna mayormente nocturna o crepuscular, con estrategias muy finas de ahorro de agua. Los pocos sitios con agua permanente concentran casi toda la actividad.',
    'Suelos poco desarrollados, a veces salinos o con costras endurecidas, y con muy poca materia orgánica. La costra biológica de superficie tarda décadas en formarse y se destruye en una pasada.',
    [
      { uso: 'huerta', delta: -25, razon: 'Sin agua traída de otro lado no hay huerta; el sistema histórico acá es el oasis, no el cuadro abierto.' },
      { uso: 'pasturas', delta: -15, razon: 'La carga que aguanta es baja y el error se paga con desertificación, no con menos kilos.' },
      { uso: 'reserva', delta: 15, razon: 'La costra biológica del suelo se rompe con una pasada y tarda décadas.' },
    ],
  ),

  resolve_manglar: global(
    'resolve_manglar', 'Manglar', '🌊', '#00695C',
    'Bosques costeros de la franja intermareal tropical y subtropical, entre la tierra y el mar. Protegen la costa de tormentas, crían buena parte de la pesca y almacenan más carbono por hectárea que casi cualquier otro bosque.',
    'Pocas especies arbóreas, todas con adaptaciones a la sal y a la falta de oxígeno: raíces zanco, neumatóforos y excreción salina. Se ordenan en franjas según cuánto los cubre la marea.',
    'Zona de cría de peces, crustáceos y moluscos, y área de descanso de aves migratorias. Su productividad sostiene tanto al estuario como al arrecife vecino.',
    'Suelos anegados, salinos y sin oxígeno, con acumulación muy grande de carbono orgánico. Drenarlos o excavarlos oxida ese carbono y libera acidez sulfatada.',
    [
      { uso: 'reserva', delta: 30, razon: 'Es la defensa de costa y la guardería de la pesca: se conserva, no se convierte.' },
      { uso: 'huerta', delta: -35, razon: 'Suelo salino y anegado.' },
      { uso: 'pasturas', delta: -30, razon: 'Suelo salino y anegado.' },
    ],
  ),

  resolve_roca_hielo: global(
    'resolve_roca_hielo', 'Roca y hielo', '🏔️', '#90A4AE',
    'Superficies de roca desnuda, glaciares y hielo permanente, sin cobertura vegetal continua. No tienen uso agrícola: importan como cabecera de cuenca y como reserva de agua.',
    'Vegetación ausente o limitada a líquenes y musgos en grietas y bordes de deshielo, donde la colonización recién empieza.',
    'Fauna escasa y en general de paso, ligada a los bordes donde aparecen agua líquida y algo de vegetación.',
    'Sin suelo desarrollado: material mineral suelto, morrenas y regolito. Los suelos jóvenes de los frentes de deshielo son de los pocos ecosistemas en formación que se pueden observar en tiempo real.',
    [
      { uso: 'reserva', delta: 30, razon: 'Sin suelo no hay uso agrícola posible.' },
      { uso: 'huerta', delta: -40, razon: 'Sin suelo no hay uso agrícola posible.' },
      { uso: 'pasturas', delta: -30, razon: 'Sin suelo no hay uso agrícola posible.' },
      { uso: 'frutales', delta: -40, razon: 'Sin suelo no hay uso agrícola posible.' },
    ],
  ),
};
