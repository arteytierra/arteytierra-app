/**
 * Caudal de pico y dimensionamiento del bebedero.
 *
 * ## Qué estaba mal
 *
 * La app repartía el consumo diario en 24 horas. **El ganado no bebe así.** Va al
 * agua dos veces por día, bebe durante unos cinco minutos y se queda un rato
 * alrededor; el resto del día el bebedero está quieto. El número que elige el
 * diámetro del caño y el tamaño del bebedero no es el consumo diario dividido 24,
 * es el **caudal de pico**, y entre los dos hay más de un orden de magnitud.
 *
 * Un ejemplo con números de este módulo: 100 vacas a 31 L/día son 3.100 L/día, o
 * sea 129 L/h repartidos parejos. El caudal de pico de ese mismo rodeo, con diez
 * espacios de bebida a 2 GPM cada uno, es de **4.542 L/h**: treinta y cinco veces
 * más. Una cañería calculada con los 129 L/h deja a la mitad del rodeo esperando.
 *
 * ## La fuente, y por qué ésta y no una regla de pulgar
 *
 * Esto no se resuelve con un «la bebida se concentra en 4 a 6 horas», que es el
 * tipo de criterio que circula sin respaldo. Hay **normas de diseño publicadas**
 * que dan el mecanismo completo, y el mecanismo es mejor que el atajo porque
 * explica de qué depende:
 *
 * - **USDA-NRCS, _Conservation Practice Standard: Watering Facility (Code 614)_**,
 *   Oklahoma, abril de 2021. De ahí salen los dos caudales por espacio de bebida
 *   y la ventana de dos horas:
 *     • «Flow rates must be adequate to supply **2.0 GPM / Drinking Head** for
 *       large livestock. Flow rates for small livestock such as sheep, pigs and
 *       goats are to be based on **0.5 GPM / Drinking Head**.»
 *     • «The system shall be designed to water **all the livestock in the grazing
 *       unit within two hours**.»
 *     • Un animal «will drink for approximately **5 minutes**».
 *
 * - **USDA-NRCS South Dakota, _Design Technical Note SD2006-1: Watering Facility
 *   Design Criteria for Cattle_**, Ken Taylor, 1 de abril de 2010. De ahí sale
 *   cuántos animales beben a la vez, que es lo que convierte el caudal por
 *   espacio en el caudal del sistema:
 *     • **1 espacio por cada 20 animales (5 % del rodeo)** cuando hay agua en
 *       cada potrero y el ganado llega de a uno o en grupos chicos; para eso la
 *       distancia al bebedero tiene que ser **menor a 1.980 pies (604 m)**.
 *     • **1 espacio por cada 10 animales (10 % del rodeo)** cuando la distancia
 *       pasa los 604 m, cuando el bebedero es centralizado, o donde los animales
 *       se agolpan y pelean por el acceso.
 *     • El ganado «generally travel at least twice a day to the watering
 *       facility», así que el diseño entrega **la mitad de la necesidad diaria en
 *       cada visita**, y se queda hasta una hora en el lugar.
 *     • Perímetro: **12 pulgadas por animal en bebederos circulares y 18 en los
 *       de lados rectos**, por espacio de bebida.
 *
 * Fijate que la distancia al bebedero **sí entra**, pero no como un número de
 * horas: entra decidiendo si el rodeo llega junto o de a poco, que es lo que
 * duplica la cantidad de espacios necesarios. Eso es un mecanismo y se puede
 * discutir; «4 a 6 horas» no.
 *
 * ## Rango de validez
 *
 * Las dos normas son de servicios de conservación de suelos de Estados Unidos y
 * están calibradas para rodeos de cría extensiva en praderas templadas, que es
 * razonablemente parecido al Cono Sur. Lo que la propia nota técnica advierte y
 * conviene repetir: *sizing the watering facility based upon flow rate and water
 * storage can be difficult because cattle watering behavior is somewhat hard to
 * predict. It depends on herd size, stock densities, and topography of a
 * pasture.* Por eso la norma da dos escenarios y no una fórmula, y por eso este
 * módulo devuelve los dos y deja que el usuario elija.
 *
 * No cubre tambo, feedlot ni bebederos bajo techo.
 *
 * ## Quién lee esto
 *
 * La red de agua (elige diámetro) y la represa (elige el tamaño del tanque de
 * reserva). Los litros por día vienen de `aguaGanado.ts`.
 */

/** 1 galón estadounidense por minuto, en litros por minuto. */
export const GPM_LMIN = 3.785411784;

/** Caudal máximo al que bebe un animal, por espacio de bebida, en L/min. */
export const CAUDAL_POR_ESPACIO_LMIN = {
  /** 2,0 GPM — bovinos y equinos. */
  grande: 2.0 * GPM_LMIN,
  /** 0,5 GPM — ovinos, caprinos y porcinos. */
  chico:  0.5 * GPM_LMIN,
} as const;

/** 1.980 pies, el umbral de distancia al bebedero de la nota técnica, en metros. */
export const UMBRAL_DISTANCIA_M = Math.round(1980 * 0.3048);

/** Horas en que la norma pide que abreve todo el rodeo de la unidad de pastoreo. */
export const VENTANA_ABREVADO_H = 2;

/** Horas del día en que el ganado usa el bebedero, para el diseño con reserva. */
export const VENTANA_USO_DIARIO_H = 12;

/** Viajes al agua por día, de los que sale la mitad de la necesidad por visita. */
export const VIAJES_POR_DIA = 2;

/**
 * Cómo llega el rodeo al agua. No es una preferencia estética: duplica la
 * cantidad de espacios de bebida y con ella el caudal del sistema.
 */
export type LlegadaAlAgua =
  /** De a uno o en grupos chicos: agua en cada potrero, a menos de 604 m. */
  | 'individual'
  /** Todo junto: bebedero centralizado, lejos, o donde se agolpan. */
  | 'rodeo';

export type PorteAnimal = 'grande' | 'chico';

/** Fracción del rodeo que bebe a la vez, según cómo llega. */
export const FRACCION_QUE_BEBE: Record<LlegadaAlAgua, number> = {
  individual: 0.05,   // 1 espacio cada 20 animales
  rodeo:      0.10,   // 1 espacio cada 10 animales
};

export const FUENTE_CAUDAL =
  'USDA-NRCS, Conservation Practice Standard «Watering Facility» (código 614), Oklahoma, abril de 2021.';

export const FUENTE_ESPACIOS =
  'USDA-NRCS South Dakota, Design Technical Note SD2006-1, «Watering Facility Design Criteria for Cattle», '
  + 'Ken Taylor, 1 de abril de 2010.';

/**
 * Cuántos animales pueden beber a la vez. Nunca menos de uno: un rodeo de cinco
 * vacas igual necesita un espacio, y el 5 % de 5 es 0,25.
 */
export function espaciosBebida(cabezas: number, llegada: LlegadaAlAgua): number {
  if (cabezas <= 0) return 0;
  return Math.max(1, Math.ceil(cabezas * FRACCION_QUE_BEBE[llegada]));
}

/**
 * Sugerencia de cómo va a llegar el rodeo, a partir de la distancia al bebedero.
 * El umbral es el de la nota técnica. `null` cuando no se sabe la distancia:
 * adivinar acá cambia el diámetro del caño.
 */
export function llegadaSegunDistancia(distancia_m: number | null): LlegadaAlAgua | null {
  if (distancia_m === null || !Number.isFinite(distancia_m) || distancia_m < 0) return null;
  return distancia_m <= UMBRAL_DISTANCIA_M ? 'individual' : 'rodeo';
}

/**
 * Caudal instantáneo que tiene que poder entregar el bebedero, en L/min: tantos
 * espacios de bebida como animales beban a la vez, cada uno al caudal al que un
 * animal puede tomar.
 *
 * **Esto dimensiona el bebedero, no necesariamente la cañería.** Si el bebedero
 * tiene reserva, la cañería puede ser más chica y rellenar entre visita y visita:
 * eso es `reservaNecesaria_l`.
 */
export function caudalPico_l_min(cabezas: number, llegada: LlegadaAlAgua, porte: PorteAnimal = 'grande'): number {
  return Math.round(espaciosBebida(cabezas, llegada) * CAUDAL_POR_ESPACIO_LMIN[porte] * 10) / 10;
}

/** El mismo caudal en L/h, que es la unidad en la que se lee una cañería. */
export function caudalPico_l_h(cabezas: number, llegada: LlegadaAlAgua, porte: PorteAnimal = 'grande'): number {
  return Math.round(caudalPico_l_min(cabezas, llegada, porte) * 60);
}

/**
 * Cuántas veces se equivoca el reparto parejo en 24 horas. Es el número que
 * explica la corrección de un saludo.
 */
export function factorContraPromedio(litrosDia: number, cabezas: number, llegada: LlegadaAlAgua, porte: PorteAnimal = 'grande'): number | null {
  if (litrosDia <= 0 || cabezas <= 0) return null;
  const promedio_l_h = litrosDia / 24;
  return Math.round((caudalPico_l_h(cabezas, llegada, porte) / promedio_l_h) * 10) / 10;
}

/** Las dos estrategias de reserva que distingue la nota técnica. */
export type EstrategiaReserva =
  /** Densidad moderada: media necesidad diaria por visita, menos una hora de caudal. */
  | 'moderada'
  /** Densidad baja: necesidad diaria menos doce horas de caudal. */
  | 'baja';

export interface Reserva {
  /** Litros que tiene que aportar el tanque o bebedero. */
  litros: number;
  /** Litros que entrega la cañería dentro de la ventana de la estrategia. */
  aportaCañeria_l: number;
  /** Litros que hay que cubrir en esa ventana. */
  aCubrir_l: number;
  estrategia: EstrategiaReserva;
}

/**
 * Reserva que tiene que tener el bebedero para que la cañería alcance.
 *
 * Las dos estrategias salen de la nota técnica y las dos están probadas contra
 * sus ejemplos resueltos:
 *
 * - **Densidad moderada** (rodeos chicos en potreros chicos): el ganado llega dos
 *   veces por día, así que hay que poder entregarle **la mitad de la necesidad
 *   diaria en cada visita**, y se descuenta lo que la cañería mete en **una
 *   hora**, que es lo que el animal se queda en el lugar.
 * - **Densidad baja** (rodeos grandes en potreros grandes): el ganado usa el
 *   bebedero a lo largo de unas **doce horas** y no espera a la madrugada, así
 *   que se descuenta lo que la cañería mete en doce horas.
 *
 * Si la cañería sola alcanza, la reserva es cero y eso es una respuesta válida.
 */
export function reservaNecesaria_l(
  necesidadDiaria_l: number,
  caudalCañeria_l_min: number,
  estrategia: EstrategiaReserva,
): Reserva {
  const horas    = estrategia === 'moderada' ? 1 : VENTANA_USO_DIARIO_H;
  const aCubrir  = estrategia === 'moderada' ? necesidadDiaria_l / VIAJES_POR_DIA : necesidadDiaria_l;
  const aporta   = Math.max(0, caudalCañeria_l_min) * 60 * horas;
  return {
    litros:          Math.max(0, Math.round(aCubrir - aporta)),
    aportaCañeria_l: Math.round(aporta),
    aCubrir_l:       Math.round(aCubrir),
    estrategia,
  };
}

/**
 * Perímetro mínimo del bebedero, en metros.
 *
 * Se toma **el mayor de los dos criterios publicados**, que es cómo se usan dos
 * normas que no dicen lo mismo:
 *   • SD2006-1: 12 pulgadas por espacio de bebida en bebederos circulares, 18 en
 *     los de lados rectos.
 *   • CPS 614 (Oklahoma): como mínimo 1 pulgada por cabeza del rodeo, lo que pone
 *     un piso en rodeos grandes aunque beban pocos a la vez.
 */
export function perimetroMinimo_m(cabezas: number, llegada: LlegadaAlAgua, forma: 'circular' | 'recto' = 'circular'): number {
  const pulgadasPorEspacio = forma === 'circular' ? 12 : 18;
  const porEspacios = espaciosBebida(cabezas, llegada) * pulgadasPorEspacio;
  const porRodeo    = Math.max(0, cabezas) * 1;
  return Math.round((Math.max(porEspacios, porRodeo) * 0.0254) * 10) / 10;
}

/**
 * ¿Alcanza el caudal para abrevar todo el rodeo en las dos horas que pide la
 * norma? Con reserva en el bebedero la pregunta cambia, pero sin reserva ésta es
 * la comprobación directa.
 */
export function abrevaEnLaVentana(necesidadDiaria_l: number, caudal_l_min: number): boolean {
  // En cada visita hay que entregar la mitad de la necesidad diaria.
  const porVisita = necesidadDiaria_l / VIAJES_POR_DIA;
  return caudal_l_min * 60 * VENTANA_ABREVADO_H >= porVisita;
}
