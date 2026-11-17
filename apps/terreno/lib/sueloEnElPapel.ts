/**
 * Lo que un suelo expansivo le cambia a las tres entregas de papel.
 *
 * ## Qué es esto
 *
 * La planilla de replanteo, la lista de materiales y el plan por etapas son
 * **lo que el productor se lleva**: el informe explica el predio, estas tres
 * hojas son con las que se trabaja. Hasta acá ninguna de las tres leía el
 * suelo. Este archivo devuelve el aviso que le corresponde a cada una cuando el
 * punto tiene un diagnóstico de suelo expansivo.
 *
 * ## El caso que lo pidió
 *
 * El aviso de suelo expansivo llegó a los cuatro paneles de agua (12/11/2026) y
 * al resumen ejecutivo del informe (13/11/2026). Las tres hojas de papel
 * quedaron afuera, y repiten el mismo patrón que apareció en el resumen: **no
 * es que callen sobre el suelo, es que dos de ellas afirman cosas que en un
 * vertisol son falsas.**
 *
 * El plan por etapas imprime un recuadro que explica que los dos modos de
 * equivocarse con el mes no cuestan lo mismo: si el suelo está demasiado seco
 * «la norma dice mojarlo por aspersión», que es un camión; si está demasiado
 * mojado, se pierde el mes. En un suelo expansivo la primera mitad no es
 * cierta. Y la planilla imprime una exactitud de relieve «± X m punto a punto»
 * junto a una columna de cuánto subir o bajar desde el mojón, como si la
 * superficie estuviera quieta.
 *
 * ## Las fuentes
 *
 * Las tres salen del mismo volumen de la ILCA que ya sostiene el aviso de los
 * paneles, *Management of Vertisols in sub-Saharan Africa* (1988), abierto
 * entero en el repositorio de la FAO:
 *
 * - **Asnakew Woldeab 1988**, «Physical properties of Ethiopian Vertisols»,
 *   `https://www.fao.org/4/x5493e/x5493e0a.htm`. Es la fuente del aviso del
 *   plan por etapas, y dice las cuatro cosas que hacen falta, textual: secos,
 *   los vertisoles son duros e «impossible to plough with oxen-drawn
 *   implements» y pueden ser difíciles incluso con maquinaria pesada; mojados
 *   son plásticos y pegajosos; «tillage and seedbed preparation are only
 *   possible within a narrow soil-moisture range»; y —la que desarma el
 *   recuadro— para mojar un vertisol seco hace falta mucha lluvia porque el
 *   agua «tends to move into cracks rapidly» y moja las capas hondas,
 *   «leaving the surface relatively dry». De ahí sale también la práctica del
 *   altiplano etíope: arar con las lluvias cortas de marzo y abril, cuando la
 *   trabajabilidad «is relatively good», y la descripción de la superficie en
 *   seco, partida en prismas por grietas verticales cada 20 a 30 cm.
 * - **Swindale 1988**, mismo volumen, `x5493e03.htm`: el camellón ancho con el
 *   surco a pendiente, los desagües de parcela y los cauces empastados. Es el
 *   diseño que la lista de materiales no cotiza. Las constantes de la banda de
 *   pendiente viven en `saludCalculo.ts` y no se reescriben acá.
 * - **Escobedo 1988**, mismo volumen: sobre vertisoles de Etiopía central las
 *   obras físicas de conservación dieron resultados «not very significant»
 *   para mucha mano de obra, con la recomendación de correr el énfasis al
 *   manejo agronómico antes que a mover tierra. Es el aviso de la lista.
 * - **USDA/NRCS**, para la extensibilidad lineal: `lep_r` es «el cambio de
 *   longitud de un terrón no confinado cuando el contenido de agua baja de
 *   húmedo a seco, informado como cambio porcentual para el suelo entero». La
 *   definición completa y el tramo de control están en `sueloExpansivo.ts`.
 *
 * ## El límite declarado
 *
 * Acá hay un solo número derivado, `movimientoVerticalMaxCm`, y es una
 * **conversión de unidades con una cota superior declarada**, no un modelo:
 * el LEP se mide sobre un terrón *sin confinar* y de húmedo a seco de estufa,
 * y además `sueloExpansivo.ts` se queda con el **máximo** de los horizontes
 * del primer metro, no con el promedio. El movimiento real del campo es menor
 * que eso. Lo que el número da es el orden de magnitud, y el texto lo dice.
 * No se usa para calcular nada: ni la planilla, ni la lista, ni el plan
 * cambian un solo valor por este archivo. Las tres siguen devolviendo
 * exactamente los mismos números; lo que cambia es lo que se lee al lado.
 *
 * ## Qué se rompe si esto cambia
 *
 * Lo consume `components/EntregasDePapel.tsx` y nada más. Si se toca el texto
 * del plan por etapas hay que mirar el recuadro de la asimetría del
 * componente, porque este aviso **lo reemplaza** cuando hay suelo expansivo:
 * dejar los dos sería imprimir el consejo viejo arriba del nuevo, que es
 * justamente el error que encontramos en el resumen ejecutivo.
 */
import type { AvisoCalculo } from './hidrologiaPredio';
import type { SueloExpansivo } from './sueloExpansivo';

/** Lo único que estas tres frases leen del predio. */
export interface EntradaPapelSuelo {
  /** El diagnóstico de suelo expansivo del punto (A4), si se pudo reconocer. */
  expansivo?: SueloExpansivo | null;
}

/**
 * El espesor sobre el que se informa el movimiento vertical, en centímetros.
 *
 * Un metro, que es el tramo del que `sueloExpansivo.ts` toma el LEP y el que
 * la gente tiene en la cabeza cuando piensa en «el suelo». Con este espesor la
 * cuenta es cómoda de leer: un LEP del 9 % sobre un metro son 9 cm.
 */
export const ESPESOR_PERFIL_CM = 100;

/** La separación de las grietas en seco, publicada para vertisoles etíopes. */
export const GRIETA_SEP_MIN_CM = 20;
export const GRIETA_SEP_MAX_CM = 30;

const r1 = (n: number) => Math.round(n * 10) / 10;
/** Un número escrito como se lee en el informe: con coma decimal. */
const coma = (n: number) => String(n).replace('.', ',');

/**
 * Cuánto se acorta el perfil al secarse, en centímetros, como cota superior.
 *
 * Es `lep_pct` por ciento de `espesor_cm`, y nada más que eso: una conversión
 * de unidades de una magnitud medida. **No es un pronóstico de cuánto va a
 * moverse la superficie.** El LEP se mide sobre un terrón sin confinar y
 * llevado a seco de estufa, dos condiciones que el campo no cumple, así que el
 * movimiento real es menor. Devuelve `null` si no hay LEP medido, que es el
 * caso de todo el mundo fuera de Estados Unidos.
 */
export function movimientoVerticalMaxCm(
  lep_pct: number | null | undefined,
  espesor_cm: number = ESPESOR_PERFIL_CM,
): number | null {
  if (typeof lep_pct !== 'number' || !Number.isFinite(lep_pct) || lep_pct <= 0) return null;
  return r1((lep_pct / 100) * espesor_cm);
}

/** `Suelo expansivo` o `Puede ser suelo expansivo`, según el nivel del dato. */
const titular = (x: SueloExpansivo) =>
  x.nivel === 'medido' ? 'Suelo expansivo' : 'Puede ser suelo expansivo';

const nivelDe = (x: SueloExpansivo): AvisoCalculo['nivel'] =>
  x.nivel === 'medido' ? 'alerta' : 'aviso';

/**
 * El aviso de la planilla de replanteo.
 *
 * La planilla dice dónde va cada estaca y cuánto subir o bajar desde el mojón
 * de referencia. Las dos cosas que este suelo le cambia son la cota —que se
 * mueve con el agua— y el agarre de la estaca, porque en seco la superficie
 * está partida en prismas. Ninguna de las dos cambia un número de la tabla.
 */
export function avisoPlanillaExpansivo(e: EntradaPapelSuelo): AvisoCalculo | null {
  const x = e.expansivo;
  if (!x) return null;
  const mov = movimientoVerticalMaxCm(x.lep_pct);
  const medida = mov !== null
    ? `La extensibilidad lineal medida acá es de ${coma(r1(x.lep_pct ?? 0))} %, que `
      + `sobre el primer metro son del orden de ${coma(mov)} cm. Es una cota `
      + 'superior y no un pronóstico —se mide sobre un terrón sin confinar y '
      + 'llevado a seco de estufa, y se toma el máximo del perfil—, pero da el '
      + 'orden de magnitud. '
    : 'Cuánto se mueve se mide con la extensibilidad lineal del perfil, que acá '
      + 'no está medida: el diagnóstico salió de la actividad de la arcilla. ';
  return {
    id: 'suelo_expansivo_planilla',
    nivel: nivelDe(x),
    titulo: `${titular(x)}: la cota de un mojón no es un número fijo`,
    detalle:
      'Esta planilla dice cuánto subir o bajar desde un mojón, y en un suelo '
      + 'que se hincha y se contrae esa cota se mueve con el agua. ' + medida
      + 'Replantear en seco y construir en húmedo no dan la misma cota. Dos '
      + 'consecuencias para la hoja: anotar en qué estado estaba el suelo el '
      + 'día que se llenó, y renivelar el mojón de referencia al empezar cada '
      + 'tramo en vez de arrastrar la cota del primero. Y una para la estaca: '
      + `en seco la superficie está partida por grietas cada ${GRIETA_SEP_MIN_CM} `
      + `a ${GRIETA_SEP_MAX_CM} cm y los prismas que quedan entre ellas están `
      + 'sueltos, así que una estaca clavada junto a una grieta no marca nada.',
  };
}

/**
 * El aviso de la lista de materiales.
 *
 * Dice dos cosas y las dos son ausencias, no correcciones: la lista cotiza la
 * obra que el proyecto dibujó, y si sobre este suelo esa obra es la
 * equivocada, la lista entera lo es. Y antes de comprar para excavar, hay una
 * recomendación publicada que va en el otro sentido.
 */
export function avisoMaterialesExpansivo(e: EntradaPapelSuelo): AvisoCalculo | null {
  const x = e.expansivo;
  if (!x) return null;
  return {
    id: 'suelo_expansivo_materiales',
    nivel: nivelDe(x),
    titulo: `${titular(x)}: esta lista no cotiza la obra que este suelo pide`,
    detalle:
      'Dos cosas que la lista no sabe. La primera: el diseño publicado para un '
      + 'suelo expansivo —camellón ancho con el surco a pendiente, desagües de '
      + 'parcela y cauces empastados— no tiene acá ningún renglón, porque lo '
      + 'que se cotiza es la obra que el proyecto dibujó. Si esa obra cambia, '
      + 'la lista cambia entera, y el detalle está en «Análisis de suelo». La '
      + 'segunda, antes de comprar para mover tierra: sobre vertisoles de '
      + 'Etiopía central las obras físicas de conservación dieron resultados '
      + '«no muy significativos» para mucha mano de obra, y la recomendación '
      + 'publicada fue correr el énfasis al manejo agronómico —materia '
      + 'orgánica, fajas de pasto, cultivo en callejones— antes que a excavar. '
      + 'En este suelo conviene mirar dos veces el renglón de movimiento de '
      + 'suelo y una vez más el de semilla de cobertura.',
  };
}

/**
 * El aviso del plan por etapas, que **reemplaza** el recuadro de la asimetría.
 *
 * El recuadro del componente dice que equivocarse por seco se arregla con un
 * camión de agua y que equivocarse por mojado cuesta un mes. Sobre un vertisol
 * la primera mitad es falsa: el agua de aspersión se va por las grietas y la
 * superficie queda seca. Por eso esto no se imprime *además* del recuadro sino
 * *en lugar* de él.
 */
export function avisoEtapasExpansivo(e: EntradaPapelSuelo): AvisoCalculo | null {
  const x = e.expansivo;
  if (!x) return null;
  return {
    id: 'suelo_expansivo_etapas',
    nivel: nivelDe(x),
    titulo: `${titular(x)}: acá los dos modos de equivocarse cuestan caro`,
    detalle:
      'En un suelo común, llegar con el suelo demasiado seco se arregla '
      + 'mojando por aspersión. Acá no: el agua se mete por las grietas y moja '
      + 'las capas hondas dejando la superficie seca, y para mojar de verdad un '
      + 'perfil agrietado hace falta una cantidad grande de lluvia. Y seco, '
      + 'este suelo es imposible de arar con tracción animal y puede ser '
      + 'difícil hasta con maquinaria pesada. Del otro lado, mojado es plástico '
      + 'y pegajoso, y la estructura de la superficie se destruye al pisarla: '
      + 'el laboreo sólo es posible dentro de un rango de humedad angosto. '
      + 'Entonces la ventana no es una banda ancha con los costados peores, es '
      + 'angosta de los dos lados, y el mes bueno es el hombro de la '
      + 'temporada: en el altiplano etíope se ara con las lluvias cortas del '
      + 'arranque, cuando la trabajabilidad es razonable, y no en el centro de '
      + 'la seca ni en el de la lluvia. Si el calendario de abajo deja un solo '
      + 'mes verde, en este suelo ese mes es más corto de lo que parece.',
  };
}
