/**
 * Ficha del clima al que va el predio, y dónde existe ese clima hoy.
 *
 * La app ya mostraba la deriva: tres códigos Köppen leídos del mapa de Beck en
 * tres períodos, y una línea diciendo qué se mueve. Eso alcanza para avisar,
 * no para decidir. Quien planta un monte —que tarda treinta años en ser
 * monte— necesita la pregunta siguiente: **si mi predio va a tener el clima
 * que hoy tiene tal otro lado, ¿qué cultivan ahí?**
 *
 * Este módulo une las dos piezas que la app ya tiene y nunca se habían cruzado:
 * la clase futura del mapa de 1 km, y el catálogo de análogos por clima. El
 * resultado no es un pronóstico del predio; es la lista de lugares reales que
 * ya viven en ese clima y de los sistemas productivos documentados en ellos.
 * Es lo más honesto que se puede decir con estos datos, y es accionable.
 *
 * ── Sobre el horizonte, sin maquillarlo ─────────────────────────────────────
 *
 * El horizonte útil para decidir qué plantar es de veinte o treinta años: 2046
 * a 2056. El mapa de Beck que viaja con la app no tiene esa ventana; la más
 * cercana disponible es 2071-2099. O sea que la ficha muestra un clima MÁS
 * TARDÍO y por lo tanto más marcado que el del horizonte de la decisión.
 *
 * Esa diferencia no se disimula: se dice. Y se dice con la lectura correcta, que
 * es la dirección y no la fecha. Si en 2071-2099 el predio es árido, en 2046 va
 * camino a serlo, y una plantación que se define hoy va a atravesar los dos
 * momentos. Interpolar entre períodos para fabricar un 2050 sería inventar
 * precisión que el dato no tiene.
 */
import type { Koppen, DerivaClima } from './clima';
import { analogosDeKoppen, type Analogos } from './contexto';

export interface FichaClimaFuturo {
  /** Clase de hoy (1991-2020), para leer el salto contra algo. */
  presente: Koppen;
  /** Clase de 2071-2099 bajo SSP2-4.5. */
  futuro: Koppen;
  /** La clase no cambia: el predio se queda en el mismo régimen. */
  estable: boolean;
  /** Qué parte de la clasificación se mueve, en palabras. */
  queCambia: string | null;
  /** Qué implica ese movimiento para el diseño, una consecuencia por línea. */
  consecuencias: string[];
  /** Dónde existe hoy el clima futuro, y qué se cultiva ahí. */
  analogos: Analogos | null;
  /** El desfasaje entre el horizonte de la decisión y el del mapa. */
  horizonte: string;
  /** Lo que esta ficha no es. Va siempre, incluso cuando no cambia nada. */
  advertencias: string[];
}

/** Las tres cosas que hay que saber antes de leer cualquier número de acá. */
const ADVERTENCIAS = [
  'Es un escenario, no un pronóstico. SSP2-4.5 describe un mundo posible con emisiones intermedias; que sea el más citado no lo hace el que va a pasar.',
  'El mapa es de 1 km. Alcanza para el régimen de la zona, no para el fondo de tu valle: un bajo helador o una ladera al reparo pueden desmentirlo dentro del mismo píxel.',
  'SSP2-4.5 es el escenario del medio. Hay uno más benigno y uno bastante peor, y ninguno de los dos está en esta pantalla.',
];

const HORIZONTE =
  'La decisión de qué plantar se toma a veinte o treinta años, y el mapa disponible cubre 2071-2099: lo que ves es un clima más tardío y por lo tanto más marcado que el del horizonte de tu plantación. Leelo como la dirección en la que se mueve el lugar, no como la fecha en la que llega.';

/**
 * Qué hacer con el cambio, según qué letra del código se movió.
 *
 * Las tres letras de Köppen no son igual de graves ni piden lo mismo. La
 * primera es el régimen de fondo: si se mueve, cambia la pregunta entera. La
 * segunda es cuándo llueve, y arrastra el calendario. La tercera es cuánto
 * aprieta el verano o el invierno, y arrastra la lista de especies.
 */
function consecuenciasDe(a: string, b: string): string[] {
  if (a === b) return [];
  const out: string[] = [];

  if (a[0] !== b[0]) {
    out.push('Cambia el régimen de fondo, no un matiz: lo que hay que rediseñar es el agua del predio —cuánta se junta, dónde se guarda, cuánto tiempo dura— antes que la lista de plantas.');
    if (b[0] === 'B') out.push('El destino es árido o semiárido: cosecha de agua, sombra y cobertura del suelo dejan de ser mejoras y pasan a ser la estructura del sistema.');
    if (b[0] === 'A') out.push('El destino es tropical: el problema se da vuelta y pasa a ser el exceso —drenaje, lavado de nutrientes y hongos— más que la falta.');
    if (a[0] === 'D' || a[0] === 'E') out.push('Se afloja el frío: van a entrar especies que hoy no cierran ciclo, y a salir las que necesitan horas de frío para cuajar.');
  } else if (a.length > 1 && b.length > 1 && a[1] !== b[1]) {
    out.push('Se corre la estación de las lluvias. El calendario de siembra que sirve hoy va a estar desfasado, y las obras de agua tienen que dimensionarse para el reparto nuevo, no para el actual.');
    if (b[1] === 's') out.push('El verano pasa a ser la estación seca: el almacenamiento de invierno deja de ser opcional.');
    if (b[1] === 'w') out.push('El invierno pasa a ser la estación seca: la reserva se llena en verano y tiene que durar la mitad fría del año.');
  } else if (a.length > 2 && b.length > 2 && a[2] !== b[2]) {
    out.push('Cambia el rigor térmico. El régimen de lluvia se mantiene, pero la lista de especies no: hay que revisar qué aguanta el verano nuevo y qué se queda sin las horas de frío que pedía.');
  } else {
    out.push('El movimiento es dentro del mismo grupo climático: el diseño de fondo sigue en pie y lo que corresponde es ajustar variedades, no replantear el sistema.');
  }

  out.push('Lo que se planta hoy y tarda décadas —monte, frutales, cortinas— conviene elegirlo con la lista del clima futuro, aunque la huerta anual se siga manejando con la del presente.');
  return out;
}

/**
 * Arma la ficha, o `null` si no hay con qué.
 *
 * Devuelve `null` cuando falta la clase futura: sin ella no hay nada que decir
 * y lo correcto es que la sección no aparezca, no que aparezca vacía.
 *
 * Cuando la clase NO cambia sí devuelve ficha, con `estable: true`. Eso también
 * es información y bastante buena: quiere decir que el diseño que se piensa hoy
 * sigue siendo el que corresponde, y merece estar escrito en algún lado.
 */
export function fichaClimaFuturo(
  presente: Koppen | null | undefined,
  deriva: DerivaClima | null | undefined,
): FichaClimaFuturo | null {
  if (!presente || !deriva?.futuro) return null;
  const futuro = deriva.futuro;
  const estable = presente.codigo === futuro.codigo;

  return {
    presente,
    futuro,
    estable,
    queCambia: deriva.queCambia,
    consecuencias: consecuenciasDe(presente.codigo, futuro.codigo),
    // Los análogos se piden para la clase FUTURA: son los lugares que ya viven
    // el clima al que va el predio. Ese es el aporte de esta ficha; pedirlos
    // para la clase de hoy ya lo hace el panel de contexto.
    analogos: analogosDeKoppen(futuro),
    horizonte: HORIZONTE,
    advertencias: ADVERTENCIAS,
  };
}
