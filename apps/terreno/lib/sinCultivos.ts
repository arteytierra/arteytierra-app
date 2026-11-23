/**
 * Por qué estas ecorregiones no llevan lista de cultivos.
 *
 * Son las 26 fichas regionales que no declaran `cultivos`, y hasta el
 * 22/11/2026 la ausencia tenía una sola lectura en todo el programa: «todavía
 * no está curada». De ahí salían dos afirmaciones falsas en lugares distintos.
 * El bloque «en esta ecorregión» ofrecía el catálogo por clase Köppen con el
 * aviso de que faltaba curar y que preguntara en la zona; y el balance hídrico
 * del calendario ofrecía `CULTIVOS_KC` —diez del Cono Sur: soja, girasol,
 * olivo, alfalfa— sin ningún cartel. En un manglar del Caribe, en el Rub
 * al-Jali o en el desierto polar de Ellesmere la app calculaba cuánta agua le
 * falta al olivo en la planicie de marea, y después invitaba a verificarlo con
 * quien cultive ahí, donde no cultiva nadie.
 *
 * Lo que vuelve el error evitable es que las fichas ya lo sabían por otra vía:
 * veintidós de las veintinueve que había al principio declaran en `aptitud`
 * deltas de −30 a −40 en huerta, frutales, pasturas y forestal, y +25 o +30 en
 * reserva. La aptitud decía «acá no se produce» mientras el calendario ofrecía
 * tomate.
 *
 * ## Por qué vive acá y no en los catálogos
 *
 * Por lo mismo que `practicasHistoricas.ts`: los catálogos regionales son
 * archivos generados desde la investigación, y lo que se escriba ahí a mano se
 * pierde en el próximo montaje. Esto es una capa editorial que ningún montaje
 * pisa, y la inyecta `fichaPorId`, que es el único embudo por el que pasan las
 * tres vías de resolución del bioma.
 *
 * Tenerlas todas en un archivo tiene además una ventaja que la dispersión en
 * ocho catálogos no daba: **esta lista es el inventario del pendiente.** Las
 * entradas con motivo `sin_curar` son, literalmente, lo que falta curar, y se
 * leen de un vistazo en vez de salir de una consulta al catálogo entero.
 *
 * Nacieron tres y **hoy no queda ninguna**, el mismo día. Dos eran el Decán
 * —norte y sur— y la tercera Galápagos, y las tres se curaron con estadística
 * oficial de superficie sembrada: los planes de contingencia agrícola de
 * distrito del ICAR-CRIDA para la India y el boletín zonal del MAG-SIPA para
 * Ecuador. De dónde salió cada número, y cuáles cultivos quedaron afuera porque
 * `lib/especies.ts` todavía no los tiene —el ragi y el urad entre ellos—, está
 * en `_research/CULTIVOS_SIN_CURAR.md`.
 *
 * Que el motivo quede sin usar no quiere decir que sobre: una ecorregión nueva
 * sin lista entra por ahí, y el test está escrito para que esa cuenta pueda
 * bajar sola y no pueda subir sin que alguien lo decida.
 *
 * ## Cómo se escribe una entrada
 *
 * El motivo no se deduce de la aptitud ni del clima. Un delta muy negativo
 * dice «este uso rinde mal acá», que no es lo mismo que «la pregunta agrícola
 * no corresponde acá»: el Decán sur tenía −10 en huerta con agricultura plena,
 * y Galápagos −15 porque la zona alta sí produce y lo que limita es la
 * bioseguridad. Las dos entraron como `sin_curar` justamente por eso, y por eso
 * las dos terminaron con lista curada en vez de con declaración.
 *
 * Y el `detalle` se apoya en lo que la ficha ya tiene escrito y citado en
 * `resumen`, en `suelos` o en las razones de su `aptitud`. No hay afirmación
 * nueva en este archivo: hay una afirmación que estaba en prosa y ahora el
 * programa la puede leer.
 *
 * Lo que esto **no** hace es sacarle la herramienta al usuario. El borde de un
 * polígono de RESOLVE no es el borde de un sistema productivo —es el mismo
 * motivo por el que existe `tambienPorClima`—, y varias de estas ecorregiones
 * tienen adentro, en una fracción chica de su superficie, el lugar donde sí se
 * cultiva: los oasis del desierto líbico y la pradera de ceniza de las
 * Aleutianas. La lista genérica se sigue ofreciendo;
 * lo que cambia es que ahora dice de dónde salió y el detalle nombra la
 * excepción cuando la ficha la tiene documentada.
 */

import type { SinCultivos } from './biomaTipos';

/** Repetido en los ocho manglares, que comparten exactamente el argumento. */
const MANGLAR: SinCultivos = {
  motivo: 'no_corresponde',
  detalle: 'Es planicie intermareal: lodo salino y anóxico que la marea inunda y drena todos los días. Lo que la ficha registra no es que rinda poco, es que la obra agrícola mata el bosque: abrir drenajes, rellenar, compactar o cortar el flujo de mareas causa acidificación, subsidencia y mortalidad, con los árboles en pie. Lo que se produce acá es pesca y marisco, y depende de que el manglar siga funcionando.',
  uso: null,
};

export const SIN_CULTIVOS: Record<string, SinCultivos> = {
  // ─── Manglares (8) ──────────────────────────────────────────────────────────
  manglares_antillanos: MANGLAR,
  manglares_centroamericanos: MANGLAR,
  manglares_mexico: MANGLAR,
  manglares_amazon_orinoco_caribe_sur: MANGLAR,
  manglares_atlantico_sur_brasil: MANGLAR,
  manglares_pacifico_suramericano: MANGLAR,
  golfo_persico_mangle: {
    motivo: 'no_corresponde',
    detalle: 'Es manglar de hara en parches finos y aislados, no un cinturón: cada uno depende de un aporte local de agua dulce o de un canal de marea concreto, así que cualquier obra que lo toque lo deja sin la entrada de la que vive. Lo que se produce acá es pesca.',
    uso: null,
  },
  mar_rojo_mangle: {
    motivo: 'no_corresponde',
    detalle: 'Es el sistema más extremo donde el manglar todavía funciona: crece sin ningún aporte de río, en uno de los mares más salinos del planeta. No hay agua dulce que haga agricultura posible, y es justamente la falta de aporte fluvial lo que define la ecorregión.',
    uso: null,
  },

  // ─── Ártico y desierto polar (4) ────────────────────────────────────────────
  alto_artico_desierto_polar: {
    motivo: 'no_corresponde',
    detalle: 'Desierto polar: menos de 150 mm al año, cobertura vegetal por debajo del 20 % en buena parte y meses enteros sin sol. Los criosoles casi no tienen horizonte orgánico y la formación de suelo es tan lenta que la huella de un vehículo queda marcada durante décadas. Lo único que concentra vida son los oasis térmicos de fondo de fiordo, y son puntos, no superficie de cultivo.',
    uso: null,
  },
  tundra_artica_canadiense: {
    motivo: 'no_corresponde',
    detalle: 'La temporada de crecimiento es de seis a diez semanas y todo ocurre a la vez. Sobre permafrost continuo la capa activa rara vez pasa los 80 cm, el agua no percola y el drenaje es lateral sobre el hielo; cualquier perturbación de la cubierta vegetal profundiza el deshielo y es difícil de revertir. Lo que se produce acá es caza, pesca y pastoreo de caribú.',
    uso: null,
  },
  montana_artica_baffin_torngat: {
    motivo: 'no_corresponde',
    detalle: 'Fiordos profundos, paredes de mil metros, campos de hielo y glaciares de valle: la vegetación ocupa apenas los bolsones protegidos. No hay superficie continua con suelo y estación de crecimiento a la vez.',
    uso: null,
  },
  alaska_tundra_hielo_beringia: {
    motivo: 'no_corresponde',
    detalle: 'Permafrost con una capa activa de treinta a sesenta centímetros, revuelta por crioturbación, y lo que falta no es nutriente sino temperatura para liberarlo; la huella de un vehículo en verano rompe el aislante y se vuelve un canal que sigue ensanchándose por décadas. La excepción está dentro del mismo polígono y la ficha la nombra: en las Aleutianas no hay permafrost sino ceniza volcánica, y ahí sí hay pradera productiva.',
    uso: null,
  },

  // ─── Desierto hiperárido y costra salina (4) ────────────────────────────────
  nefud_rub_al_khali: {
    motivo: 'no_corresponde',
    detalle: 'No es un desierto con poca agua: es arena móvil sin freática accesible ni asentamiento permanente, y el arenal continuo más grande del mundo. Lo que hay se hace en el corredor interdunar y de paso, no en un predio. Sobre duna viva no se planta: se fija, y eso es obra y no producción.',
    uso: null,
  },
  sahara_occidental_erg: {
    motivo: 'no_corresponde',
    detalle: 'Menos de 50 mm al año y años enteros sin lluvia registrada, entre el Gran Erg Occidental, el Oriental y las llanuras de reg. No hay régimen de lluvia que sostenga un ciclo de cultivo a secano ni freática somera que lo reemplace.',
    uso: null,
  },
  sahara_oriental: {
    motivo: 'no_corresponde',
    detalle: 'Es el sector más seco del Sahara. Donde sí se cultiva —y hace milenios— es en las depresiones que perforan la meseta calcárea: Siwa, Bahariya, Farafra, Dajla y Jarga, que viven del mayor acuífero fósil del mundo. Son oasis: puntos sobre el polígono, y el agua que usan no se repone. Dar la ecorregión por cultivable sería extender el oasis a todo el desierto que lo rodea.',
    uso: null,
  },
  chotts_sebkhas: {
    motivo: 'no_corresponde',
    detalle: 'Son las depresiones cerradas donde termina todo el drenaje de la región, y con él la sal. La costra del chott no es pastizal inundable: es sal, lo que crece son halófitas que el ganado apenas toca, y el pisoteo del borde húmedo rompe la costra y activa la deflación. Con freática salina somera el árbol se cierra por sodio antes que por sequía.',
    uso: null,
  },

  // ─── Turberas (2) ───────────────────────────────────────────────────────────
  pantanos_turba_borneo: {
    motivo: 'no_corresponde',
    detalle: 'La turba puede pasar de 20 m de espesor y el cultivo convencional pide bajar la napa, que es lo único que no se puede hacer acá: airear turba la oxida. Está medido en plantaciones drenadas del Sudeste Asiático —142 cm de hundimiento en los primeros cinco años y unos 5 cm por año después, con el 92 % del acumulado por oxidación a los dieciocho años—, y es el mecanismo que ya quemó y drenó la mayor parte de la ecorregión.',
    uso: null,
  },
  pantanos_turba_malaca: {
    motivo: 'no_corresponde',
    detalle: 'Misma razón que en Borneo y una más propia de acá: además de que drenar oxida la turba —142 cm de hundimiento en cinco años—, debajo del perfil hay material sulfídico. Casi todos los remanentes ya están talados o degradados.',
    uso: null,
  },

  // ─── Sin suelo donde ponerlo (3) ────────────────────────────────────────────
  pantepui_guayana_alta: {
    motivo: 'no_corresponde',
    detalle: 'Mesetas de arenisca aisladas: casi no hay suelo, y el que hay es ácido y extremadamente pobre, con crecimiento lentísimo y el endemismo por tepuy más alto del planeta. La agricultura de los tepuyes está en las tierras bajas del pie, no arriba, y la vegetación de cumbre no rebrota como una pastura.',
    uso: null,
  },
  campos_rupestres: {
    motivo: 'no_corresponde',
    detalle: 'Suelo somero, arenoso y oligotrófico sobre afloramiento rocoso: no hay perfil donde poner una huerta. Cada afloramiento tiene su propia flora endémica, y lo que corresponde acá es no usar.',
    uso: null,
  },
  campinaranas_aguas_negras: {
    motivo: 'no_corresponde',
    detalle: 'Arena blanca ácida sin reserva de nutrientes ni capacidad de retener agua, a menudo encharcada. El espodosol es oligotrófico y producir exige traer todo de afuera, todos los años; extraer madera descapitaliza el suelo en vez de aprovecharlo, porque el sistema tarda décadas en volver.',
    uso: null,
  },

  // ─── Islas oceánicas protegidas o sin suelo (3) ─────────────────────────────
  revillagigedo_ecosistemas_insulares: {
    motivo: 'no_corresponde',
    detalle: 'El archipiélago está deshabitado y protegido, y es el corazón terrestre de la reserva marina más grande de México: su valor depende de que las islas sigan sin uso. No hay agua dulce permanente, el suelo volcánico es somero, y cada insumo que llega a la isla es una vía de entrada de especies invasoras — el ganado introducido ya fue el daño principal, con las ovejas de Socorro erradicadas después de décadas de erosión.',
    uso: null,
  },
  isla_malpelo_xerica: {
    motivo: 'no_corresponde',
    detalle: 'No hay suelo: detritos y guano en fisuras de roca volcánica, sin agua dulce, en un santuario marino deshabitado. El valor de Malpelo está en las aves marinas y en el mar que la rodea.',
    uso: null,
  },
  islas_desventuradas: {
    motivo: 'no_corresponde',
    detalle: 'Islotes hiperaislados e hiperáridos, San Félix y San Ambrosio, sin agua dulce permanente: no hay de dónde regar. El guano de las aves es el único aporte de nutrientes y depende de que no se las moleste, y la flora endémica terrestre es mínima.',
    uso: null,
  },

  // ─── Pastoril, no agrícola (2) ──────────────────────────────────────────────
  pilbara_matorral: {
    motivo: 'otro_uso',
    detalle: 'El 58 % de lo relevado son 44 estaciones ganaderas: es un sistema pastoril con siglo y medio de manejo documentado, no un desierto vacío. Llueven menos de 450 mm y caen casi todos entre diciembre y marzo, en tormenta o ciclón, sobre suelos pedregosos muy someros o arenas profundas. La lista que le corresponde a esta ecorregión es de forraje, no de hortaliza.',
    uso: 'pastoril extensivo',
  },
  mulga_australia_occidental: {
    motivo: 'otro_uso',
    detalle: 'Llueven 190 a 240 mm y la razón que da la fuente para que quede tanta superficie intacta no es la conservación sino la aridez: la lluvia variable y la falta de agua subterránea confiable frenaron la agricultura. Los suelos son «mainly shallow, sandy and infertile» sobre un hardpan silíceo. Lo que hubo entre 1992 y 2001 fue conversión a uso pastoril con degradación severa, así que acá la pregunta no es qué plantar sino con qué carga.',
    uso: 'pastoril extensivo',
  },

  // ─── Falta la lista, y nada más (0) ───────────────────────────────────────
  // Acá estaban `decan_norte_sal`, `decan_sur_elefantes` y
  // `galapagos_matorral_xerico`, que eran el pendiente de verdad: había
  // agricultura documentada y la ficha no decía cuál. Las tres tienen su lista
  // desde el 22/11/2026 y por eso salieron de acá. La sección queda, vacía,
  // porque es donde entra la próxima.
};

/**
 * La razón declarada de que esta ficha no lleve cultivos, si la hay.
 *
 * La inyecta `fichaPorId`, no los catálogos: ver la nota de arriba.
 */
export function sinCultivosDeFicha(id: string): SinCultivos | undefined {
  return SIN_CULTIVOS[id];
}
