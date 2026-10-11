/**
 * Trampas de aire: dónde va una ventosa en una cañería del predio.
 *
 * Una cañería que sube y baja junta aire en los puntos altos. El aire no se va
 * solo —el agua lo empuja hacia arriba, y arriba es justo donde está— y una
 * burbuja atrapada estrangula la sección: la línea pierde caudal sin que se
 * rompa nada y sin que haya nada que ver. Es la falla más difícil de diagnosticar
 * de una red de agua rural, porque el síntoma es «llega menos agua que antes» y
 * la causa está enterrada en una loma a 300 m.
 *
 * La app ya dibuja perfiles de terreno sobre una traza (`lib/caminos.ts`), así
 * que puede **encontrar** esos puntos antes de que se entierre el caño, que es
 * cuando la solución cuesta una ventosa y no una excavadora.
 *
 * ── LA FUENTE ───────────────────────────────────────────────────────────────
 * **USDA NRCS (2021)**, «Conservation Practice Standard — Irrigation Pipeline
 * (Code 430)», NRCS California, agosto de 2021. Es una norma de diseño, no una
 * recomendación, y da tres criterios geométricos que se pueden aplicar sobre un
 * perfil:
 *
 *   1. *«Include air valves at all high points along the pipeline.»* Y más
 *      abajo: *«High points in the pipeline require a CAV unless an outlet is
 *      located at that point.»* O sea: un bebedero en el punto alto reemplaza a
 *      la ventosa, porque ventea igual.
 *   2. *«Install an air valve at least every 2,500 feet on horizontal runs.»*
 *      Son 762 m. En un tramo largo y plano no hay punto alto que encontrar, y
 *      sin embargo hay que ventear.
 *   3. *«place an AVR or COMB valve at changes of grade in downward direction of
 *      flow in excess of 10 degrees to ensure adequate air release during
 *      filling.»* Éste es el criterio fino: no hace falta que haya una loma, con
 *      que la cañería quiebre hacia abajo más de 10° alcanza.
 *
 * La norma también pide ventosa *«at all summits, upstream and downstream of all
 * in-line valves as needed, at the entrance, and at the end(s) of the
 * pipelines»*, y acequia agrega esos dos extremos a la lista.
 *
 * ── LOS TRES TIPOS, QUE NO SON INTERCAMBIABLES ──────────────────────────────
 * · **CAV** (purga continua): saca el aire que se va juntando mientras la línea
 *   trabaja con presión. Es la del punto alto.
 * · **VR** (rompevacío): deja entrar aire cuando la línea se vacía, para que no
 *   la aplaste la depresión.
 * · **AVR / COMB**: hace las dos cosas. Es la del llenado y la de los quiebres.
 *
 * ── EL SUPUESTO, DECLARADO ──────────────────────────────────────────────────
 * El perfil que mira este módulo es el **del terreno**. La cañería se supone
 * enterrada a tapada constante, así que sigue la forma del terreno. Si la traza
 * va a tener una zanja de profundidad variable —para suavizar un quiebre, por
 * ejemplo— el perfil de la cañería no es éste y el resultado hay que revisarlo a
 * mano.
 *
 * ── EL ÚNICO NÚMERO QUE ES DE acequia Y NO DE LA NORMA ──────────────────────
 * `PROMINENCIA_MIN_M`. La norma dice «todos los puntos altos» y no define cuánto
 * tiene que sobresalir un punto para contar, porque el que la escribió tenía un
 * plano de obra y no un modelo de elevación con ruido. Sobre un DEM global de
 * 30 m, cualquier ondulación de unos pocos decímetros puede ser el dato y no el
 * terreno, y marcar quince ventosas falsas es peor que no marcar ninguna: nadie
 * cree una lista de quince. Está declarado como criterio propio, es un parámetro,
 * y con un DEM de dron se baja.
 */

import type { PuntoPerfilElevacion } from './caminos';

export const FUENTE_NRCS_430 =
  'USDA NRCS (2021) — Conservation Practice Standard: Irrigation Pipeline (Code 430), NRCS California';

/** 1 pie = 0,3048 m. */
export const PIE_M = 0.3048;

/** «at least every 2,500 feet on horizontal runs» = 762 m. */
export const ESPACIADO_MAX_M = 2500 * PIE_M;

/** «changes of grade in downward direction of flow in excess of 10 degrees». */
export const QUIEBRE_DESCENDENTE_GRADOS = 10;

/**
 * Prominencia mínima para que una ondulación del perfil cuente como punto alto.
 *
 * **De acequia, no de la norma.** Ver el encabezado del módulo.
 */
export const PROMINENCIA_MIN_M = 1.0;

/** Diámetro del orificio de purga de una CAV: «Normal orifice venting diameter is 1/16 to 3/8 inch». */
export const ORIFICIO_CAV_MM: readonly [number, number] = [
  Math.round((1 / 16) * 25.4 * 10) / 10,
  Math.round((3 / 8) * 25.4 * 10) / 10,
];

/** Diferencial de presión de diseño para el escape de aire: «limit the exhaust pressure differential to 2 psi». */
export const DELTA_ESCAPE_MCA = Math.round(2 * 0.70307 * 100) / 100;
/** Y para el rompevacío: «limit the vacuum pressure differential to 5 psi». */
export const DELTA_VACIO_MCA = Math.round(5 * 0.70307 * 100) / 100;

// ─── El resultado ─────────────────────────────────────────────────────────────

export type TipoVentosa = 'CAV' | 'AVR' | 'VR';

export type MotivoVentosa =
  | 'punto_alto'
  | 'quiebre_descendente'
  | 'tramo_largo'
  | 'entrada'
  | 'extremo';

export interface PuntoVentosa {
  distancia_m: number;
  elevacion_m: number;
  tipo:        TipoVentosa;
  motivo:      MotivoVentosa;
  /** Qué hay que hacer ahí, en una línea. */
  detalle:     string;
  /** Prominencia del punto alto (m), cuando el motivo es `punto_alto`. */
  prominencia_m?: number;
  /** Grados que quiebra hacia abajo, cuando el motivo es `quiebre_descendente`. */
  quiebre_grados?: number;
}

export interface ResultadoVentosas {
  puntos:        PuntoVentosa[];
  /** Largo total del perfil (m). */
  largo_m:       number;
  /** Desnivel entre las dos puntas (m); positivo si la línea sube. */
  desnivel_m:    number;
  orificio_cav_mm: readonly [number, number];
  avisos:        string[];
}

// ─── La detección ─────────────────────────────────────────────────────────────

/** Pendiente de un tramo, en grados (positiva si sube). */
function gradosTramo(a: PuntoPerfilElevacion, b: PuntoPerfilElevacion): number {
  const dx = b.distancia_m - a.distancia_m;
  if (dx <= 0) return 0;
  return (Math.atan((b.elevation - a.elevation) / dx) * 180) / Math.PI;
}

/**
 * Puntos altos del perfil con su prominencia.
 *
 * La prominencia de un punto alto es cuánto hay que bajar desde él, a los dos
 * lados, antes de volver a subir más alto. Es la medida que separa una loma de
 * una ondulación del dato: un escalón de ruido tiene prominencia de centímetros,
 * una loma real tiene metros.
 */
export function puntosAltos(
  perfil: readonly PuntoPerfilElevacion[], prominencia_min_m = PROMINENCIA_MIN_M,
): Array<{ i: number; prominencia_m: number }> {
  const salida: Array<{ i: number; prominencia_m: number }> = [];
  if (perfil.length < 3) return salida;

  for (let i = 1; i < perfil.length - 1; i++) {
    const z = perfil[i]!.elevation;
    if (!(z > perfil[i - 1]!.elevation && z >= perfil[i + 1]!.elevation)) continue;

    // Hacia atrás: el punto más bajo antes de que el perfil supere esta cota.
    let minIzq = z;
    for (let j = i - 1; j >= 0; j--) {
      const zj = perfil[j]!.elevation;
      if (zj > z) break;
      if (zj < minIzq) minIzq = zj;
    }
    // Hacia adelante: idem.
    let minDer = z;
    for (let j = i + 1; j < perfil.length; j++) {
      const zj = perfil[j]!.elevation;
      if (zj > z) break;
      if (zj < minDer) minDer = zj;
    }
    const prominencia_m = z - Math.max(minIzq, minDer);
    if (prominencia_m >= prominencia_min_m) salida.push({ i, prominencia_m });
  }
  return salida;
}

/**
 * Dónde van las ventosas de una traza de cañería.
 *
 * `salidas_m` son las distancias donde ya hay un bebedero, un hidrante o
 * cualquier salida abierta: la norma dice que en un punto alto con salida no hace
 * falta ventosa, así que acequia no la pide y lo explica. `tolerancia_salida_m`
 * es cuán cerca tiene que estar la salida del punto alto para que cuente.
 */
export function ventosasEnPerfil(p: {
  perfil:               readonly PuntoPerfilElevacion[];
  prominencia_min_m?:   number;
  salidas_m?:           readonly number[];
  tolerancia_salida_m?: number;
}): ResultadoVentosas {
  const perfil = p.perfil;
  const avisos: string[] = [];
  const puntos: PuntoVentosa[] = [];
  const tol = p.tolerancia_salida_m ?? 20;
  const salidas = p.salidas_m ?? [];
  const prom_min = p.prominencia_min_m ?? PROMINENCIA_MIN_M;

  if (perfil.length < 2) {
    return {
      puntos, largo_m: 0, desnivel_m: 0, orificio_cav_mm: ORIFICIO_CAV_MM,
      avisos: ['El perfil no tiene suficientes puntos para analizar.'],
    };
  }

  const primero = perfil[0]!;
  const ultimo  = perfil[perfil.length - 1]!;
  const largo_m = ultimo.distancia_m - primero.distancia_m;
  const desnivel_m = ultimo.elevation - primero.elevation;

  const haySalidaCerca = (d: number): boolean => salidas.some(s => Math.abs(s - d) <= tol);

  // 1 · Todos los puntos altos.
  for (const { i, prominencia_m } of puntosAltos(perfil, prom_min)) {
    const pt = perfil[i]!;
    if (haySalidaCerca(pt.distancia_m)) {
      avisos.push(`En el punto alto de ${Math.round(pt.distancia_m)} m ya hay una salida: la norma no pide ventosa ahí, porque la salida ventea.`);
      continue;
    }
    puntos.push({
      distancia_m: pt.distancia_m, elevacion_m: pt.elevation,
      tipo: 'CAV', motivo: 'punto_alto', prominencia_m,
      detalle: `Punto alto de ${prominencia_m.toFixed(1)} m de prominencia. Acá se junta el aire mientras la línea trabaja: va una purga continua.`,
    });
  }

  // 2 · Quiebres hacia abajo de más de 10°.
  for (let i = 1; i < perfil.length - 1; i++) {
    const antes   = gradosTramo(perfil[i - 1]!, perfil[i]!);
    const despues = gradosTramo(perfil[i]!, perfil[i + 1]!);
    const quiebre = antes - despues;          // positivo = quiebra hacia abajo
    if (quiebre <= QUIEBRE_DESCENDENTE_GRADOS) continue;
    const pt = perfil[i]!;
    if (puntos.some(q => Math.abs(q.distancia_m - pt.distancia_m) <= tol)) continue;
    if (haySalidaCerca(pt.distancia_m)) continue;
    puntos.push({
      distancia_m: pt.distancia_m, elevacion_m: pt.elevation,
      tipo: 'AVR', motivo: 'quiebre_descendente', quiebre_grados: quiebre,
      detalle: `La traza quiebra ${quiebre.toFixed(0)}° hacia abajo. No es una loma, pero la norma pide ventosa de doble efecto igual: en el llenado el aire se queda acá.`,
    });
  }

  // 3 · Entrada y extremo, que la norma pide siempre.
  puntos.push({
    distancia_m: primero.distancia_m, elevacion_m: primero.elevation,
    tipo: 'AVR', motivo: 'entrada',
    detalle: 'Entrada de la línea: ventosa de doble efecto para el llenado y para que no se aplaste al vaciarse.',
  });
  puntos.push({
    distancia_m: ultimo.distancia_m, elevacion_m: ultimo.elevation,
    tipo: 'AVR', motivo: 'extremo',
    detalle: 'Extremo de la línea. Si termina en una salida abierta —un bebedero sin válvula— ya ventea y no hace falta.',
  });

  puntos.sort((a, b) => a.distancia_m - b.distancia_m);

  // 4 · Que no quede ningún tramo de más de 762 m sin ventear.
  const conTramos: PuntoVentosa[] = [];
  for (let i = 0; i < puntos.length; i++) {
    conTramos.push(puntos[i]!);
    const sig = puntos[i + 1];
    if (!sig) continue;
    let hueco = sig.distancia_m - puntos[i]!.distancia_m;
    let d = puntos[i]!.distancia_m;
    while (hueco > ESPACIADO_MAX_M) {
      d += ESPACIADO_MAX_M;
      conTramos.push({
        distancia_m: d,
        elevacion_m: interpolarCota(perfil, d),
        tipo: 'AVR', motivo: 'tramo_largo',
        detalle: `Tramo largo sin punto alto: la norma pide una ventosa cada ${Math.round(ESPACIADO_MAX_M)} m (2.500 pies) aunque el terreno sea parejo.`,
      });
      hueco = sig.distancia_m - d;
    }
  }

  if (largo_m > ESPACIADO_MAX_M) {
    avisos.push(`La línea mide ${Math.round(largo_m)} m. La norma avisa que en cañerías de más de ${Math.round(ESPACIADO_MAX_M)} m puede hacer falta ventear de más para poder llenarla.`);
  }
  if (conTramos.filter(q => q.motivo === 'punto_alto').length === 0 && largo_m > 0) {
    avisos.push(`No hay ningún punto alto de más de ${prom_min.toFixed(1)} m de prominencia en esta traza. Con un DEM de 30 m eso puede ser el terreno o puede ser el dato: si la traza se va a enterrar, conviene bajar el umbral o relevar el perfil con GPS.`);
  }

  return { puntos: conTramos, largo_m, desnivel_m, orificio_cav_mm: ORIFICIO_CAV_MM, avisos };
}

/** Cota interpolada linealmente a una distancia dada del perfil. */
export function interpolarCota(perfil: readonly PuntoPerfilElevacion[], distancia_m: number): number {
  if (perfil.length === 0) return 0;
  const primero = perfil[0]!;
  if (distancia_m <= primero.distancia_m) return primero.elevation;
  for (let i = 1; i < perfil.length; i++) {
    const a = perfil[i - 1]!, b = perfil[i]!;
    if (distancia_m <= b.distancia_m) {
      const dx = b.distancia_m - a.distancia_m;
      if (dx <= 0) return b.elevation;
      const t = (distancia_m - a.distancia_m) / dx;
      return a.elevation + t * (b.elevation - a.elevation);
    }
  }
  return perfil[perfil.length - 1]!.elevation;
}
