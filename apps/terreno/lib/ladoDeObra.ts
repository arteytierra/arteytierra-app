/**
 * De qué lado. Las dos decisiones que acequia pedía a ciegas.
 *
 * Antes de calcular una represa el usuario toma dos decisiones de lado, y las
 * dos le cambian la mitad de los números de la pantalla:
 *
 *   1. **De qué lado del espejo va el muro** —cuál de las aristas del polígono
 *      se cierra—, que decide el largo del coronamiento, el perfil del terreno
 *      bajo el eje, el volumen de terraplén, la cuenca de aporte y, desde que
 *      el vaso lo encuentra el terreno, también el vaso entero.
 *   2. **De qué lado va el vertedero**, que decide si hay que excavar un canal
 *      o no, si el vertido vuelve al cauce o se queda al pie del muro, y —esto
 *      no estaba a la vista— la carga sobre el vertedero, que es uno de los
 *      tres términos de la cota de coronamiento.
 *
 * La primera se preguntaba con una sugerencia sin fuente: «el lado más bajo».
 * Suele acertar, pero no es un criterio publicado, y en un predio con dos
 * vaguadas el lado más bajo del polígono puede ser el que no se va a cerrar.
 * La segunda no se preguntaba: la app ponía 0,3 m de carga por defecto y
 * seguía.
 *
 * ── Lo que dicen las fuentes, y la corrección que apareció leyéndolas ───────
 *
 * El plan de esta corrección pedía los dos criterios de la clase 9 del curso
 * —«el lado con menor pendiente» y «el lado con menor recorrido para volver al
 * cauce»— para elegir el lado del muro. Leyendo el relevamiento resultó que
 * **esos dos criterios no son del muro: son del vertedero.** En las notas están
 * bajo el título «Vertedero · De qué lado», y el método de diseño en 6 pasos de
 * esa misma clase los ubica en el paso 3, «elegir el lado del vertedero», que
 * es un paso distinto del de elegir el cierre. Así que el plan pedía la función
 * correcta con los criterios del otro lado.
 *
 * Para el muro la misma clase da otros criterios, y son los que entraron acá:
 * la **relación de almacenamiento** —«m³ de agua por m³ de tierra movida», que
 * en la planilla de comparación de candidatos del curso es la columna
 * «Eficiencia VTM/VTA»—, la **relación entre el largo del muro y el largo del
 * espejo**, y la ventana de **profundidad natural de 2,5 a 5,5 m**. Los tres se
 * pueden calcular hoy, y no se podían antes: hacen falta el vaso real del
 * terreno (`vaso.ts`) y la sección del muro integrada sobre el eje
 * (`dimensionarMuro`), y las dos cosas existen desde hace dos pushes.
 *
 * Y para el vertedero, AH-590 dice lo mismo que el curso con sus palabras y le
 * pone los números y un piso que el enunciado de dos criterios no tiene: **más
 * plano no es mejor**. Todo eso está en la sección 11 de `represaDiseno.ts`,
 * con las citas; acá está sólo lo que hay que medir sobre el relieve.
 *
 * ── Rango de validez ───────────────────────────────────────────────────────
 *
 * Las dos funciones miden sobre la grilla de elevación, así que no pueden ser
 * mejores que ella: con celdas de 30 m un canal de vertedero de 15 m de ancho
 * no existe en el modelo, y la pendiente que se informa es la del terreno
 * alrededor y no la del canal. Lo que estos cálculos resuelven es **comparar
 * dos lados entre sí**, que es la pregunta que se les hace; no reemplazan el
 * relevamiento de campo ni el dimensionamiento del vertedero.
 *
 * Fuentes:
 *   · USDA SCS (1997), «Ponds — Planning, Design, Construction», Agriculture
 *     Handbook 590: vertederos de tierra, cuadros 8 y 10 y figura 21.
 *   · K.D. Nelson (1985), «Design and Construction of Small Earth Dams», vía el
 *     relevamiento de la clase 9 del curso de Planificación de Tierras.
 */
import type { GrillaElevacion } from './grillaElevacion';
import { N8, dimsCelda, flujoD8 } from './cuencaHidro';
import {
  ladoAguasArribaDeMuro, nivelVaso, vasoDesdeMuro, latLngDeCelda,
  CELDAS_MINIMAS_VASO,
  type Muro, type Vaso, type TipoTope,
} from './vaso';
import {
  clasificarPendienteVertedero, coronaMinima, revanchaMinima, taludesMinimos,
  ORDEN_APTITUD_VERTEDERO, VERTEDERO_SALIDA_MAX_TABULADO_PCT, FUENTE_AH590, FUENTE_NELSON_CURSO,
  type PendienteVertedero,
} from './represaDiseno';
import { dimensionarMuro, perfilTerreno, balanceTierra, type ResultadoEmbalse } from './cutfill';

// ─── Constantes del curso (Nelson) ───────────────────────────────────────────

/**
 * Ventana de profundidad natural del vaso. «Moverse entre 2,5 m y 5,5 m de
 * profundidad natural. Menos de 2,5 m: mala calidad y mucha evaporación. Más de
 * 5,5 m natural termina en 8-9 m de muro → ingeniero civil.»
 */
export const PROF_NATURAL_MIN_M = 2.5;
export const PROF_NATURAL_MAX_M = 5.5;

/**
 * Relación de almacenamiento de referencia. La clase 9 ubica a las presas de
 * ladera en «eficiencia ~1 o menor» y a las de drenaje —gully dams— como «las
 * más comunes y eficientes»: por debajo de 1 m³ de agua por m³ de tierra el
 * cierre elegido se está portando como una presa de ladera.
 */
export const RELACION_LADERA = 1;

/**
 * **Relación de almacenamiento: m³ de agua por m³ de tierra movida.**
 *
 * El orden del cociente importa y el relevamiento del curso lo trae de las dos
 * maneras: el vocabulario de la clase 9 define «relación de almacenamiento =
 * m³ de agua por m³ de tierra movida», y la columna de la planilla de
 * comparación quedó anotada como «Eficiencia VTM/VTA», que es el recíproco. Los
 * dos números de su propio ejemplo resuelto deciden cuál es cuál, y dan exacto:
 * subir la cota de 92,7 a 93,7 pasa de 10,3 a 23,9 ML de agua con 1.990 →
 * 3.700 m³ de tierra, y el costo baja de 1,51 a 1,21 US$ por m³ de agua. Ese
 * costo es `tierra/agua × precio del m³ de tierra`, así que el cociente de los
 * dos costos tiene que ser el de las dos relaciones invertidas:
 * 1,51/1,21 = 1,2479 contra (1.990/10.300)/(3.700/23.900) = 1,2480. Cierra a la
 * cuarta cifra, y de paso deja ver el precio implícito del movimiento de tierra
 * de ese ejemplo, 7,82 US$/m³.
 *
 * O sea: **más grande es mejor**, y mejorar el cierre abarata el m³ de agua. El
 * recíproco —tierra por agua— es el que ya usa `compararCotas` para el costo.
 * Por eso acequia nunca imprime este número a secas ni lo llama «eficiencia»:
 * lo imprime con sus unidades puestas.
 *
 * Y es **el mismo número** que la pestaña ya mostraba como «Eficiencia del
 * sitio» una vez elegido el lado: agua total sobre tierra movida en banco, de
 * `balanceTierra`. Lo único que faltaba era poder calcularlo **antes** de
 * elegir, para los lados que el usuario todavía no eligió, y tener la
 * referencia publicada contra la que leerlo.
 */
export function relacionAlmacenamiento(agua_m3: number, tierra_m3: number): number | null {
  if (!Number.isFinite(agua_m3) || !Number.isFinite(tierra_m3) || tierra_m3 <= 0) return null;
  return Math.round((agua_m3 / tierra_m3) * 100) / 100;
}

/**
 * Dos lados empatan cuando se diferencian menos que esto. No es un criterio
 * publicado: es la franja en la que la grilla no alcanza para distinguirlos, y
 * entonces la decisión vuelve al usuario, que vio el terreno.
 */
export const EMPATE_FRAC = 0.15;

/**
 * Tope de celdas para comparar todos los lados de un polígono. Cada lado pide
 * un Priority-Flood completo, así que el costo es el de la grilla por la
 * cantidad de aristas.
 */
export const CELDAS_MAX_COMPARACION = 400_000;

// ─── Geometría auxiliar ──────────────────────────────────────────────────────

const M_POR_GRADO_LAT = 111_320;

function mPorLng(g: GrillaElevacion): number {
  return M_POR_GRADO_LAT * Math.cos((g.latMin + g.latMax) / 2 * Math.PI / 180);
}

/** Largo en metros de un segmento dado por dos puntos geográficos. */
export function largoSegmento_m(
  g: GrillaElevacion,
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  return Math.hypot((b.lng - a.lng) * mPorLng(g), (b.lat - a.lat) * M_POR_GRADO_LAT);
}

/** Distancia de un punto al segmento a–b, en metros. */
function distAlSegmento_m(
  g: GrillaElevacion,
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
  p: { lat: number; lng: number },
): number {
  const k = mPorLng(g);
  const ax = a.lng * k, ay = a.lat * M_POR_GRADO_LAT;
  const bx = b.lng * k, by = b.lat * M_POR_GRADO_LAT;
  const px = p.lng * k, py = p.lat * M_POR_GRADO_LAT;
  const vx = bx - ax, vy = by - ay;
  const largo2 = vx * vx + vy * vy;
  if (largo2 <= 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / largo2));
  return Math.hypot(px - (ax + t * vx), py - (ay + t * vy));
}

// ─── El lado del vertedero ───────────────────────────────────────────────────

/** Por qué se cortó el seguimiento del agua desde un estribo. */
export type MotivoCorte =
  /** Llegó al cauce que el muro interrumpe: lo que la fuente pide. */
  | 'cauce'
  /** Se quedó en una hoya del terreno: el agua se encharca antes de volver. */
  | 'hoya'
  /** Llegó al límite de la grilla: más allá el modelo no sabe. */
  | 'borde_del_dem';

export interface CaminoDeSalida {
  /** Recorrido desde el estribo hasta el corte (m). */
  largo_m:             number;
  /** Desnivel bajado en ese recorrido (m). */
  desnivel_m:          number;
  /** Pendiente media del recorrido (%). Es el `So` del canal de salida. */
  pendiente_media_pct: number;
  /** El tramo más empinado del recorrido (%). */
  pendiente_max_pct:   number;
  llegaAlCauce:        boolean;
  motivoCorte:         MotivoCorte;
  /**
   * true si el recorrido pasa a menos de una celda y media del eje del muro.
   * AH-590 lo prohíbe: *«the direction of slope of the exit channel must be
   * such that discharge does not flow against any part of the dam»*.
   */
  haciaElMuro:         boolean;
  /** true si el recorrido se cruza al lado de aguas arriba: vuelve al vaso. */
  vuelveAlVaso:        boolean;
  /** El recorrido, para dibujarlo en el mapa. */
  puntos:              Array<{ lat: number; lng: number }>;
}

export interface CandidatoVertedero {
  /** Cuál de las dos puntas del muro. `a` y `b` son los del `Muro` que entró. */
  extremo:    'a' | 'b';
  punto:      { lat: number; lng: number };
  camino:     CaminoDeSalida;
  pendiente:  PendienteVertedero;
  /** true si este estribo queda descartado por una razón de la fuente. */
  descartado: boolean;
  motivo:     string | null;
}

export interface LadoVertedero {
  candidatos:  CandidatoVertedero[];
  /** El estribo recomendado, o `null` si ninguno sirve o si empatan. */
  recomendado: 'a' | 'b' | null;
  empate:      boolean;
  /**
   * Dónde se derrama el vaso por sí solo, si el tope es una silla de montar y
   * no una punta del muro. Es el *natural spillway* de AH-590, el que no pide
   * excavar nada, y le gana a los dos estribos.
   */
  derrameNatural: { lat: number; lng: number } | null;
  lectura:     string;
  advertencias: string[];
  fuentes:     string[];
}

export interface OpcionesVertedero {
  /** Un punto que está del lado del agua. El centroide del espejo sirve. */
  referenciaAguasArriba?: { lat: number; lng: number };
  /** El vaso ya calculado, para aprovechar su cota y su punto de derrame. */
  vaso?: Vaso | null;
}

/**
 * De qué lado del muro conviene el vertedero, con los dos criterios publicados.
 *
 * El orden de los criterios es el de la fuente, que los numera: primero la
 * **pendiente** —porque es la que decide si el vertido encárcava o no, y eso es
 * seguridad de la obra— y después el **recorrido hasta el cauce**, que es costo.
 * Un estribo cuyo vertido iría contra el muro queda descartado antes de
 * comparar nada: AH-590 no lo plantea como preferencia.
 *
 * El cauce no se define con un umbral de acumulación inventado: se define
 * siguiendo el agua desde el punto más bajo del eje del muro hacia aguas abajo.
 * Ese recorrido **es** el curso que la represa interrumpe, que es exactamente
 * el cauce al que la fuente pide volver.
 */
export function ladoDelVertedero(
  g: GrillaElevacion,
  muro: Muro,
  opciones?: OpcionesVertedero,
): LadoVertedero | null {
  const { rows, cols, elev } = g;
  if (rows < 3 || cols < 3) return null;

  const lado = ladoAguasArribaDeMuro(g, muro, opciones);
  if (!lado) return null;
  const flujo = flujoD8(g);
  if (!flujo) return null;
  const { down } = flujo;
  const { dx, dy } = dimsCelda(g);
  const paso_m = Math.max(Math.abs(dx), Math.abs(dy));

  const advertencias: string[] = [...lado.advertencias];
  const { signo, ladoDe, eje, ejeConDato } = lado;

  const esObra = new Uint8Array(rows * cols);
  for (const i of eje) esObra[i] = 1;

  const puntoDe = (i: number) => latLngDeCelda(g, (i / cols) | 0, i % cols);
  const enBorde = (i: number) => {
    const r = (i / cols) | 0, c = i % cols;
    return r === 0 || c === 0 || r === rows - 1 || c === cols - 1;
  };

  /** Un paso fuera del muro, hacia aguas abajo: el vecino más alejado del vaso. */
  const salirDelMuro = (i: number): number => {
    const r0 = (i / cols) | 0, c0 = i % cols;
    let mejor = -1, mejorLado = Infinity;
    for (const [dr, dc] of N8) {
      const r = r0 + dr, c = c0 + dc;
      if (r < 0 || c < 0 || r >= rows || c >= cols) continue;
      const ni = r * cols + c;
      if (esObra[ni] || Number.isNaN(elev[ni]!)) continue;
      const p = latLngDeCelda(g, r, c);
      const s = signo * ladoDe(p.lat, p.lng);
      if (s < mejorLado) { mejorLado = s; mejor = ni; }
    }
    return mejorLado < 0 ? mejor : -1;
  };

  /** Seguir el agua celda a celda desde `desde`, con `down`. */
  const seguir = (desde: number, corte: (i: number) => boolean): {
    celdas: number[]; largo_m: number; desnivel_m: number; pendMax_pct: number;
    motivo: MotivoCorte;
  } => {
    const celdas = [desde];
    let largo = 0, pendMax = 0;
    const e0 = elev[desde]!;
    let cur = desde;
    let motivo: MotivoCorte = 'hoya';
    const visto = new Set<number>([desde]);
    if (corte(desde)) return { celdas, largo_m: 0, desnivel_m: 0, pendMax_pct: 0, motivo: 'cauce' };
    for (let paso = 0; paso < rows * cols; paso++) {
      const sig = down[cur]!;
      if (sig < 0) { motivo = enBorde(cur) ? 'borde_del_dem' : 'hoya'; break; }
      if (visto.has(sig)) { motivo = 'hoya'; break; }
      const dr = ((sig / cols) | 0) - ((cur / cols) | 0);
      const dc = (sig % cols) - (cur % cols);
      const d = Math.hypot(dc * dx, dr * dy);
      const caida = elev[cur]! - elev[sig]!;
      if (d > 0 && caida > 0) {
        const pend = (caida / d) * 100;
        if (pend > pendMax) pendMax = pend;
      }
      largo += d;
      celdas.push(sig);
      visto.add(sig);
      cur = sig;
      if (corte(sig)) { motivo = 'cauce'; break; }
    }
    return {
      celdas, largo_m: largo,
      desnivel_m: Math.max(0, e0 - elev[cur]!),
      pendMax_pct: pendMax, motivo,
    };
  };

  // ── El cauce que el muro interrumpe ───────────────────────────────────────
  let ejeMasBajo = ejeConDato[0]!;
  for (const i of ejeConDato) if (elev[i]! < elev[ejeMasBajo]!) ejeMasBajo = i;
  const pieDelMuro = salirDelMuro(ejeMasBajo);
  const cauce = new Set<number>();
  if (pieDelMuro >= 0) {
    const r = seguir(pieDelMuro, () => false);
    for (const i of r.celdas) cauce.add(i);
  }
  if (cauce.size < 3) {
    advertencias.push(
      'Aguas abajo del muro el relieve no dibuja un cauce sobre esta grilla: el recorrido de vuelta no se ' +
      'puede medir y los dos estribos quedan comparados sólo por su pendiente.');
  }
  /** Llegó al cauce: la celda está en el cauce o pegada a él. */
  const enCauce = (i: number): boolean => {
    if (cauce.has(i)) return true;
    const r0 = (i / cols) | 0, c0 = i % cols;
    for (const [dr, dc] of N8) {
      const r = r0 + dr, c = c0 + dc;
      if (r < 0 || c < 0 || r >= rows || c >= cols) continue;
      if (cauce.has(r * cols + c)) return true;
    }
    return false;
  };

  // ── Los dos estribos ──────────────────────────────────────────────────────
  const extremos: Array<{ extremo: 'a' | 'b'; celda: number; punto: { lat: number; lng: number } }> = [
    { extremo: 'a', celda: ejeConDato[0]!,                     punto: muro.a },
    { extremo: 'b', celda: ejeConDato[ejeConDato.length - 1]!, punto: muro.b },
  ];

  const candidatos: CandidatoVertedero[] = [];
  for (const ex of extremos) {
    const arranque = salirDelMuro(ex.celda);
    if (arranque < 0) {
      candidatos.push({
        extremo: ex.extremo, punto: ex.punto, descartado: true,
        motivo: 'Desde esta punta del muro no hay celda con dato del lado de aguas abajo: la grilla se corta ahí.',
        camino: {
          largo_m: 0, desnivel_m: 0, pendiente_media_pct: 0, pendiente_max_pct: 0,
          llegaAlCauce: false, motivoCorte: 'borde_del_dem', haciaElMuro: false, vuelveAlVaso: false,
          puntos: [],
        },
        pendiente: clasificarPendienteVertedero(NaN),
      });
      continue;
    }
    const r = seguir(arranque, enCauce);
    const puntos = r.celdas.map(puntoDe);
    // El vertido no puede ir contra el muro. Se mira desde el segundo punto: el
    // primero sale del estribo y por definición está pegado al muro.
    let haciaElMuro = false, vuelveAlVaso = false;
    for (let k = 1; k < puntos.length; k++) {
      const p = puntos[k]!;
      if (signo * ladoDe(p.lat, p.lng) > 0) vuelveAlVaso = true;
      if (distAlSegmento_m(g, muro.a, muro.b, p) < paso_m * 1.5) haciaElMuro = true;
    }
    const pendMedia = r.largo_m > 0 ? (r.desnivel_m / r.largo_m) * 100 : 0;
    const pendiente = clasificarPendienteVertedero(r.largo_m > 0 ? pendMedia : NaN);
    if (r.pendMax_pct > VERTEDERO_SALIDA_MAX_TABULADO_PCT && pendiente.aptitud !== 'fuera_de_tabla') {
      pendiente.advertencias.push(
        `La pendiente media del recorrido es ${pendMedia.toFixed(1)} %, pero tiene un tramo de ` +
        `${r.pendMax_pct.toFixed(0)} %: la media está en tabla y ese tramo no. Es donde se encárcava.`);
    }

    let motivo: string | null = null;
    if (vuelveAlVaso) {
      motivo = 'El agua que saliera por acá se vuelve al embalse en vez de irse: no es una salida.';
    } else if (haciaElMuro) {
      motivo =
        'El recorrido del vertido pasa pegado al muro. AH-590 lo prohíbe —«the direction of slope of the ' +
        'exit channel must be such that discharge does not flow against any part of the dam»— porque es ' +
        'así como se rompe el talud de aguas abajo. Se arregla con un dique de encauce, no eligiendo este lado.';
    }

    candidatos.push({
      extremo: ex.extremo, punto: ex.punto, pendiente,
      descartado: motivo !== null, motivo,
      camino: {
        largo_m: Math.round(r.largo_m),
        desnivel_m: Math.round(r.desnivel_m * 10) / 10,
        pendiente_media_pct: Math.round(pendMedia * 100) / 100,
        pendiente_max_pct: Math.round(r.pendMax_pct * 10) / 10,
        llegaAlCauce: r.motivo === 'cauce',
        motivoCorte: r.motivo,
        haciaElMuro, vuelveAlVaso, puntos,
      },
    });
  }

  // ── El derrame natural, si lo hay ─────────────────────────────────────────
  const vaso = opciones?.vaso ?? null;
  const derrameNatural = vaso && vaso.tipoTope === 'derrame' && !vaso.derramePorEstribo
    ? vaso.puntoDerrame : null;

  // ── La recomendación ──────────────────────────────────────────────────────
  const vivos = candidatos.filter(c => !c.descartado);
  let recomendado: 'a' | 'b' | null = null;
  let empate = false;
  if (vivos.length === 1) {
    recomendado = vivos[0]!.extremo;
  } else if (vivos.length === 2) {
    const [p, q] = vivos as [CandidatoVertedero, CandidatoVertedero];
    const oP = ORDEN_APTITUD_VERTEDERO[p.pendiente.aptitud];
    const oQ = ORDEN_APTITUD_VERTEDERO[q.pendiente.aptitud];
    if (oP !== oQ) {
      recomendado = oP < oQ ? p.extremo : q.extremo;
    } else {
      // Misma aptitud de pendiente: manda el recorrido, que es el criterio 2.
      // Un recorrido que no llega al cauce no compite con uno que sí llega.
      if (p.camino.llegaAlCauce !== q.camino.llegaAlCauce) {
        recomendado = p.camino.llegaAlCauce ? p.extremo : q.extremo;
      } else {
        const corto = p.camino.largo_m <= q.camino.largo_m ? p : q;
        const largo = corto === p ? q : p;
        const dif = largo.camino.largo_m > 0
          ? (largo.camino.largo_m - corto.camino.largo_m) / largo.camino.largo_m : 0;
        if (dif < EMPATE_FRAC) { empate = true; recomendado = null; }
        else recomendado = corto.extremo;
      }
    }
  }

  const nombre = (e: 'a' | 'b') => e === 'a' ? 'la punta A del muro' : 'la punta B del muro';
  const partes: string[] = [];
  if (derrameNatural) {
    partes.push(
      'El terreno ya tiene por dónde derramar: la silla de montar que le pone el techo al vaso. ' +
      'Ese es el vertedero natural que AH-590 prefiere a cualquier canal excavado —«a natural spillway ' +
      'does not require excavation to provide enough capacity to conduct the pond outflow to a safe ' +
      'point of release»—, así que antes de elegir un estribo conviene ir a mirar ese punto.');
  }
  if (vaso?.derramePorEstribo) {
    partes.push(
      'Ojo que hoy el vaso derrama por una punta del muro, no por una silla: eso no es un vertedero, ' +
      'es el agua yéndose por el estribo. Se arregla alargando el muro.');
  }
  if (vivos.length === 0) {
    partes.push(
      'Ninguna de las dos puntas devuelve el agua a un lugar seguro: las dos la llevan contra el muro o ' +
      'de vuelta al embalse. La fuente tiene una salida para eso y es una obra, no una elección: un dique ' +
      'de encauce que lleve el vertido a un punto de descarga seguro aguas abajo.');
  } else if (empate) {
    const [p, q] = vivos as [CandidatoVertedero, CandidatoVertedero];
    partes.push(
      `Las dos puntas dan parecido: ${p.camino.pendiente_media_pct} % y ${p.camino.largo_m} m de vuelta al ` +
      `cauce de un lado, ${q.camino.pendiente_media_pct} % y ${q.camino.largo_m} m del otro. En esa franja la ` +
      'grilla no alcanza para distinguirlas, así que la decisión es tuya: elegí por lo que viste en el campo.');
  } else if (recomendado) {
    const g1 = vivos.find(c => c.extremo === recomendado)!;
    const otro = candidatos.find(c => c.extremo !== recomendado);
    partes.push(`Conviene ${nombre(recomendado)}. ${g1.pendiente.nota}`);
    if (g1.camino.llegaAlCauce) {
      partes.push(`El vertido vuelve al cauce en ${g1.camino.largo_m} m, bajando ${g1.camino.desnivel_m} m.`);
    } else if (g1.camino.motivoCorte === 'hoya') {
      partes.push(
        `Pero el agua no llega al cauce: se queda en una hoya a los ${g1.camino.largo_m} m. Eso es un ` +
        'encharcamiento al pie de la represa, y la fuente pide descargar «at a point well downstream».');
    } else {
      partes.push(
        `El recorrido llega al límite de la grilla a los ${g1.camino.largo_m} m sin encontrar el cauce: ` +
        'más allá el modelo no sabe, así que ese número es un mínimo.');
    }
    if (otro) {
      const peor = ORDEN_APTITUD_VERTEDERO[otro.pendiente.aptitud]
                 > ORDEN_APTITUD_VERTEDERO[g1.pendiente.aptitud];
      const masTendida = otro.camino.pendiente_media_pct < g1.camino.pendiente_media_pct;
      if (otro.descartado) {
        partes.push(`La otra punta queda descartada. ${otro.motivo}`);
      } else if (peor && masTendida) {
        // Esto es lo que hay que decir y no estaba: la punta perdedora es la
        // MÁS TENDIDA. Si la pantalla sólo elogia a la ganadora, el usuario ve
        // que la app eligió el lado más empinado y piensa que se equivocó.
        partes.push(
          `Y ojo con la otra punta, porque es la más tendida de las dos —${otro.camino.pendiente_media_pct} % ` +
          `contra ${g1.camino.pendiente_media_pct} %— y aun así no es la que conviene: el criterio de «menor ` +
          `pendiente» tiene piso. ${otro.pendiente.nota}`);
      } else if (peor) {
        partes.push(`La otra punta queda peor. ${otro.pendiente.nota}`);
      } else {
        partes.push(
          `La otra punta cae ${otro.camino.pendiente_media_pct} % y vuelve al cauce en ${otro.camino.largo_m} m.`);
      }
    }
  }

  return {
    candidatos, recomendado, empate, derrameNatural,
    lectura: partes.join(' '),
    advertencias,
    fuentes: [FUENTE_AH590, FUENTE_NELSON_CURSO],
  };
}

// ─── El lado del muro ────────────────────────────────────────────────────────

export interface CandidatoLadoMuro {
  /** Índice de la arista del polígono: va del vértice `i` al `i+1`. */
  i:                      number;
  largoMuro_m:            number;
  /** Cota más baja del terreno bajo esa arista: la sugerencia que había antes. */
  cotaMin_m:              number | null;
  celdasVaso:             number | null;
  cotaDerrame_m:          number | null;
  tipoTope:               TipoTope | null;
  volumenAgua_m3:         number | null;
  areaEspejo_m2:          number | null;
  /** Profundidad del agua contra el muro: la que manda su altura. */
  profEnMuro_m:           number | null;
  /** Profundidad natural máxima del vaso: la que la fuente acota a 2,5–5,5 m. */
  profNatural_m:          number | null;
  tierra_m3:              number | null;
  /** m³ de agua por m³ de tierra movida. La «relación de almacenamiento». */
  relacion:               number | null;
  /** Largo del muro ÷ largo del espejo. Más chico es mejor cierre. */
  razonMuroEspejo:        number | null;
  profundidadEnVentana:   boolean | null;
  /**
   * false cuando juntar el material prestando de adentro del vaso pediría bajar
   * el fondo más de lo razonable: ahí la tierra hay que traerla, y el m³ de agua
   * de ese lado cuesta otra cosa.
   */
  prestamoViable:         boolean | null;
  /** true si el candidato no se pudo evaluar y queda afuera del ranking. */
  descartado:             boolean;
  motivo:                 string | null;
}

export interface ComparacionLadosMuro {
  candidatos:  CandidatoLadoMuro[];
  /** Índice de arista recomendado, o `null` si empatan o no hay ninguno. */
  recomendado: number | null;
  empate:      boolean;
  /** Índice del lado más bajo: la sugerencia vieja, para poder contrastarla. */
  masBajo:     number | null;
  lectura:     string;
  advertencias: string[];
  fuentes:     string[];
}

export interface OpcionesComparacionLados {
  /**
   * Banco necesario por m³ compactado. Es el mismo valor que el panel deduce de
   * la clase de suelo (arenoso 1,10 · areno-arcilloso 1,15 · arcilloso 1,25).
   */
  factorContraccion?: number;
  /**
   * Un punto del lado del agua, común a todos los lados. Si falta, para cada
   * arista se usa el promedio de los demás vértices del polígono, que es lo que
   * hace el panel: el usuario dibujó el espejo alrededor del vaso, así que el
   * interior del polígono es aguas arriba de cualquiera de sus lados.
   */
  referenciaAguasArriba?: { lat: number; lng: number };
  /** Clase de suelo del terraplén, para los taludes del cuadro 16. */
  material?: string | null;
  /** true si la corona se va a transitar con vehículo. */
  transitable?: boolean;
}

/**
 * Comparar los lados del espejo por el criterio publicado del cierre.
 *
 * Lo que se compara es la **relación de almacenamiento**: cuántos m³ de agua
 * deja cada cierre por cada m³ de tierra que hay que mover. Es el número con el
 * que la fuente elige entre candidatos, y es un cociente, así que cada lado se
 * evalúa a su propio pelo de agua máximo —su cota de derrame, que es hasta
 * dónde el terreno sostiene el agua sin vertedero— en vez de obligarlos a todos
 * a la misma cota, que para un lado sería holgada y para otro imposible.
 *
 * Los dos números que entran en el cociente salen cada uno de su motor y no de
 * una estimación nueva: el agua, del vaso real que encuentra el terreno; la
 * tierra, de la sección del muro integrada sobre el perfil del eje. La corona,
 * los taludes y la revancha son los **mínimos publicados** y son los mismos
 * para todos los lados: lo que se compara acá es la relación, no el
 * presupuesto.
 */
export function compararLadosDelMuro(
  g: GrillaElevacion,
  poligono: ReadonlyArray<{ lat: number; lng: number }>,
  opciones?: OpcionesComparacionLados,
): ComparacionLadosMuro | null {
  const n = poligono.length;
  if (n < 3 || g.rows < 3 || g.cols < 3) return null;

  const advertencias: string[] = [];
  if (g.rows * g.cols > CELDAS_MAX_COMPARACION) {
    advertencias.push(
      `La grilla tiene ${(g.rows * g.cols).toLocaleString('es-AR')} celdas y comparar los ${n} lados pide ` +
      'recorrerla una vez por lado. Se omite la comparación para no colgar la pantalla; el lado se elige a mano.');
    return {
      candidatos: [], recomendado: null, empate: false, masBajo: null,
      lectura: '', advertencias, fuentes: [FUENTE_NELSON_CURSO, FUENTE_AH590],
    };
  }

  const { dx, dy } = dimsCelda(g);
  const taludes = taludesMinimos(opciones?.material ?? null);
  let faltaCarga = false;

  const candidatos: CandidatoLadoMuro[] = [];
  for (let i = 0; i < n; i++) {
    const a = poligono[i]!, b = poligono[(i + 1) % n]!;
    const largoMuro = largoSegmento_m(g, a, b);

    const otros = poligono.filter((_, k) => k !== i && k !== (i + 1) % n);
    const ref = opciones?.referenciaAguasArriba ?? (otros.length > 0 ? {
      lat: otros.reduce((s, p) => s + p.lat, 0) / otros.length,
      lng: otros.reduce((s, p) => s + p.lng, 0) / otros.length,
    } : undefined);

    const vaso = vasoDesdeMuro(g, { a, b }, ref ? { referenciaAguasArriba: ref } : undefined);
    const base = {
      i, largoMuro_m: Math.round(largoMuro),
      cotaMin_m: vaso ? Math.round(vaso.cotaEjeMin_m * 10) / 10 : null,
    };
    if (!vaso) {
      candidatos.push({
        ...base, celdasVaso: null, cotaDerrame_m: null, tipoTope: null, volumenAgua_m3: null,
        areaEspejo_m2: null, profEnMuro_m: null, profNatural_m: null, tierra_m3: null,
        relacion: null, razonMuroEspejo: null, profundidadEnVentana: null, prestamoViable: null,
        descartado: true,
        motivo: 'Cerrando por este lado no se forma vaso: el terreno baja de los dos lados del eje o la arista cae fuera de la grilla.',
      });
      continue;
    }

    const nivel = nivelVaso(vaso, vaso.cotaDerrame_m);
    if (nivel.celdas < CELDAS_MINIMAS_VASO) {
      candidatos.push({
        ...base, celdasVaso: nivel.celdas, cotaDerrame_m: Math.round(vaso.cotaDerrame_m * 10) / 10,
        tipoTope: vaso.tipoTope, volumenAgua_m3: nivel.volumen_m3, areaEspejo_m2: nivel.area_inundada_m2,
        profEnMuro_m: nivel.profEnMuro_m, profNatural_m: nivel.prof_max_m, tierra_m3: null,
        relacion: null, razonMuroEspejo: null, profundidadEnVentana: null, prestamoViable: null,
        descartado: true,
        motivo: `El vaso de este lado son ${nivel.celdas} celdas, menos de ${CELDAS_MINIMAS_VASO}: a esa escala la forma que se mide es la de la grilla y no la del terreno.`,
      });
      continue;
    }

    // Largo del espejo: diagonal del rectángulo que envuelve las celdas
    // inundadas. Es una cota superior del diámetro real, así que la revancha
    // que sale de ahí es la conservadora.
    let rMin = Infinity, rMax = -Infinity, cMin = Infinity, cMax = -Infinity;
    for (let k = 0; k < nivel.celdas; k++) {
      const cel = vaso.celdas[k]!;
      if (cel.row < rMin) rMin = cel.row;
      if (cel.row > rMax) rMax = cel.row;
      if (cel.col < cMin) cMin = cel.col;
      if (cel.col > cMax) cMax = cel.col;
    }
    const largoEspejo = Math.hypot((cMax - cMin) * dx, (rMax - rMin) * dy);

    const revancha = revanchaMinima(largoEspejo).minimo_m;
    const alto = nivel.profEnMuro_m + revancha;
    const corona = coronaMinima(alto, opciones?.transitable ?? false).minimo_m;
    const perfil = perfilTerreno(g, a, b);
    const r = dimensionarMuro({
      profMax_m: nivel.profEnMuro_m,
      revancha_m: revancha,
      anchoCorona_m: corona,
      taludInterno: taludes.interno,
      taludExterno: taludes.externo,
      longitud_m: largoMuro,
      ...(opciones?.factorContraccion != null ? { factorContraccion: opciones.factorContraccion } : {}),
      ...(perfil ? { perfilTerreno_m: perfil } : {}),
    });
    if (r.cargaVertedero_m <= 0) faltaCarga = true;

    // El lado que no cierra nada. Si el vaso derrama a una cota que no llega al
    // punto más bajo del eje, el agua que se está contando la sostiene el
    // terreno y no el muro: la hoya ya estaba y se vacía por otro lado. El
    // cociente sale enorme —mucha agua sobre un muro de altura cero— y es el
    // número plausible y equivocado de siempre. Afuera del ranking, con motivo.
    if (nivel.profEnMuro_m <= 0) {
      candidatos.push({
        ...base, celdasVaso: nivel.celdas, cotaDerrame_m: Math.round(vaso.cotaDerrame_m * 10) / 10,
        tipoTope: vaso.tipoTope, volumenAgua_m3: nivel.volumen_m3, areaEspejo_m2: nivel.area_inundada_m2,
        profEnMuro_m: 0, profNatural_m: nivel.prof_max_m, tierra_m3: null,
        relacion: null, razonMuroEspejo: null, profundidadEnVentana: null, prestamoViable: null,
        descartado: true,
        motivo:
          'Cerrando por acá el muro no embalsa nada: el terreno derrama a una cota que no llega al punto ' +
          'más bajo del eje, así que el agua que hay la sostiene la hoya y se va por otro lado. El muro ' +
          'sobra.',
      });
      continue;
    }

    // Y el movimiento de tierra en BANCO, con la capacidad extra que da
    // prestar el material de adentro del vaso. No es una cuenta nueva: es
    // `balanceTierra`, el mismo camino por el que sale la «Eficiencia del
    // sitio» que la pestaña muestra una vez elegido el lado. Que los dos
    // números salgan de la misma función es lo que impide que se separen.
    const embalse: ResultadoEmbalse = {
      nivelAgua_m: vaso.cotaDerrame_m,
      volumen_m3: nivel.volumen_m3,
      area_inundada_m2: nivel.area_inundada_m2,
      prof_max_m: nivel.prof_max_m,
      prof_media_m: nivel.prof_media_m,
      elev_min: vaso.cotaFondo_m,
      elev_max: vaso.cotaDerrame_m,
      ancho_max_m: Math.round(largoEspejo),
      celdas: nivel.celdas,
    };
    const bal = balanceTierra(r, embalse);
    const tierra = bal.banco_m3;
    const agua = bal.volumenAgua_m3;
    candidatos.push({
      ...base,
      celdasVaso: nivel.celdas,
      cotaDerrame_m: Math.round(vaso.cotaDerrame_m * 10) / 10,
      tipoTope: vaso.tipoTope,
      volumenAgua_m3: agua,
      areaEspejo_m2: nivel.area_inundada_m2,
      profEnMuro_m: nivel.profEnMuro_m,
      profNatural_m: nivel.prof_max_m,
      tierra_m3: tierra,
      prestamoViable: bal.viable,
      relacion: relacionAlmacenamiento(agua, tierra),
      razonMuroEspejo: largoEspejo > 0 ? Math.round((largoMuro / largoEspejo) * 100) / 100 : null,
      profundidadEnVentana: nivel.prof_max_m >= PROF_NATURAL_MIN_M && nivel.prof_max_m <= PROF_NATURAL_MAX_M,
      descartado: false, motivo: null,
    });
  }

  if (faltaCarga) {
    advertencias.push(
      'La comparación no incluye la carga sobre el vertedero —todavía no se eligió el lado— así que los ' +
      'muros salen con el mínimo de altura y la tierra de todos está subestimada por igual. La relación ' +
      'entre lados se sostiene; los m³ de cada uno, no.');
  }
  if (candidatos.some(c => c.tipoTope === 'borde_del_dem')) {
    advertencias.push(
      'Algún lado llena su vaso hasta el límite de la grilla en vez de hasta una silla de montar: ahí el ' +
      'volumen informado es un mínimo y la comparación lo favorece sin motivo. Conviene ampliar el área analizada.');
  }

  const conCota = candidatos.filter(c => c.cotaMin_m !== null);
  const masBajo = conCota.length > 0
    ? conCota.reduce((p, q) => (q.cotaMin_m! < p.cotaMin_m! ? q : p)).i : null;

  const vivos = candidatos.filter(c => !c.descartado && c.relacion !== null);
  let recomendado: number | null = null;
  let empate = false;
  if (vivos.length === 1) {
    recomendado = vivos[0]!.i;
  } else if (vivos.length > 1) {
    const orden = [...vivos].sort((p, q) => q.relacion! - p.relacion!);
    const mejor = orden[0]!, segundo = orden[1]!;
    const dif = mejor.relacion! > 0 ? (mejor.relacion! - segundo.relacion!) / mejor.relacion! : 0;
    if (dif < EMPATE_FRAC) { empate = true; recomendado = null; }
    else recomendado = mejor.i;
  }

  const partes: string[] = [];
  const num = (v: number, d = 2) => v.toLocaleString('es-AR', { maximumFractionDigits: d });
  const mejorPorRelacion = vivos.length > 0
    ? vivos.reduce((p, q) => (q.relacion! > p.relacion! ? q : p)) : null;

  if (vivos.length === 0) {
    partes.push('Ningún lado del polígono forma un vaso que se pueda medir sobre esta grilla.');
  } else if (mejorPorRelacion) {
    const m = mejorPorRelacion;
    const frase = empate
      ? `Los dos mejores lados dan casi lo mismo, así que elegí vos: el lado ${m.i + 1} deja`
      : `Conviene cerrar por el lado ${m.i + 1}: deja`;
    partes.push(
      `${frase} ${num(m.relacion!)} m³ de agua por cada m³ de tierra movida, ` +
      `${num(m.volumenAgua_m3!, 0)} m³ embalsados con ${m.largoMuro_m} m de muro.`);
    if (m.relacion! <= RELACION_LADERA) {
      partes.push(
        `Aun así es el mejor de los lados y no un buen cierre: con ${num(m.relacion!)} m³ de agua por m³ de ` +
        'tierra se está portando como una presa de ladera, que es la posición de menor eficiencia que ' +
        'describe la fuente. Vale la pena probar otro lugar del predio antes que otro lado de este polígono.');
    }
    if (m.razonMuroEspejo !== null) {
      partes.push(
        `El muro mide ${num(m.razonMuroEspejo)} veces el largo del espejo: es la relación que la fuente ` +
        'manda mirar, y cuanto más chica, más cuello de botella y menos ladera.');
    }
    if (m.profundidadEnVentana === false) {
      partes.push(
        m.profNatural_m! < PROF_NATURAL_MIN_M
          ? `El vaso llega a ${num(m.profNatural_m!, 1)} m de profundidad natural, menos de los ${num(PROF_NATURAL_MIN_M, 1)} m ` +
            'que pide la fuente: a esa profundidad el agua se calienta, pierde calidad y la evaporación se ' +
            'lleva una fracción grande de lo embalsado.'
          : `El vaso llega a ${num(m.profNatural_m!, 1)} m de profundidad natural, más de los ${num(PROF_NATURAL_MAX_M, 1)} m ` +
            'que la fuente toma como límite: un muro así termina en 8 o 9 m y eso ya es proyecto de ingeniero.');
    }
    if (m.prestamoViable === false) {
      partes.push(
        'Para juntar el material de ese muro habría que bajar el fondo del vaso más de lo razonable: la ' +
        'tierra hay que traerla de un préstamo cercano, y entonces el m³ de agua de ese lado cuesta otra cosa.');
    }
    if (masBajo !== null && masBajo !== m.i) {
      const b = candidatos.find(c => c.i === masBajo)!;
      partes.push(
        `Ojo con esto: el lado más bajo es el ${masBajo + 1}, que es el que acequia venía sugiriendo, y no ` +
        'es el que conviene. ' +
        (b.relacion !== null
          ? `Cerrando por ahí la relación baja a ${num(b.relacion)} m³ de agua por m³ de tierra.`
          : 'Cerrando por ahí ese muro no sirve: el motivo está en su fila.') +
        ' La cota más baja no es un criterio publicado; la relación de almacenamiento sí.');
    }
  }

  return {
    candidatos, recomendado, empate, masBajo,
    lectura: partes.join(' '),
    advertencias,
    fuentes: [FUENTE_NELSON_CURSO, FUENTE_AH590],
  };
}
