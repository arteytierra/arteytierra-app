/**
 * Zanjas de infiltración (swales): zanjas A NIVEL, siguiendo la curva de nivel,
 * espaciadas ladera abajo para interceptar la escorrentía y hacerla infiltrar.
 *
 * Se generan como curvas de nivel a un intervalo VERTICAL elegido (la separación
 * entre swales) y se recortan al predio. Para cada una se estima el agua que
 * intercepta en un evento de lluvia de diseño: la franja aguas arriba (hasta el
 * swale siguiente) capta lluvia y escurre hacia la zanja.
 *
 *   ancho de franja ≈ intervaloVertical / pendiente_media   (separación horizontal
 *   entre curvas); volumen = largo · ancho · lluvia · coef. de escorrentía.
 *
 * Orientativo: no dimensiona la sección de la zanja ni valida el suelo; sirve para
 * planear el trazado y estimar captación. Complementa el mapa de erosión (dónde) y
 * las escorrentías (por dónde va el agua).
 */
import * as turf from '@turf/turf';
import type { GrillaElevacion } from './grillaElevacion';
import { recortarGrillaA } from './grillaElevacion';
import { calcularCurvas, MAX_NIVELES, nivelesEstimados } from './curvasNivel';
import {
  separacionVerticalZanjas, acotar,
  type Recomendacion, type InfiltracionSuelo, type CoberturaLadera,
} from './criterios';

export interface SwaleLinea {
  cota:        number;
  puntos:      Array<{ lat: number; lng: number }>;
  longitud_m:  number;
  captacion_ha: number;
  volumen_m3:  number;
}

export interface OpcionesSwales {
  intervaloV: number;   // separación vertical entre swales (m)
  precipMm:   number;   // lluvia de diseño (mm por evento)
  coef:       number;   // coeficiente de escorrentía 0..1
  /**
   * Pendiente media del área, en %. Si viene, se usa para convertir la
   * separación vertical en la horizontal (el ancho de franja de captación).
   *
   * Importa que la calcule quien llama y no esta función: la recomendación de
   * separación sale de la misma pendiente (`lib/criterios`), y si cada lado
   * usara su propia estimación el ancho de franja no coincidiría con la
   * distancia de tabla que el usuario cree haber elegido.
   */
  pendiente_pct?: number;
  /** talud de las paredes (H:V). 1,5 es el estándar estable y desmalezable. */
  taludZ?:    number;
  /** profundidad máxima admitida para la zanja (m) */
  profMax_m?: number;
  /** Ksat del suelo (mm/h) para verificar que la zanja se vacíe a tiempo */
  ksat_mm_h?: number | null;
}

/** Sección trapezoidal de la zanja, dimensionada para el volumen interceptado. */
export interface SeccionSwale {
  base_m:       number;   // ancho de fondo
  prof_m:       number;   // profundidad
  talud_z:      number;   // H:V
  ancho_sup_m:  number;   // ancho de boca = base + 2·z·prof
  area_m2:      number;   // sección transversal (capacidad por metro lineal)
  /** área transversal que HARÍA FALTA para el volumen interceptado */
  area_req_m2:  number;
  /** capacidad de todo el trazado. Es también el movimiento de suelo: lo que se
   *  excava es exactamente lo que almacena. */
  capacidad_m3: number;
  suficiente:   boolean;
  /** cuánto del volumen interceptado entra en la zanja (%) */
  cobertura_pct: number;
  /** separación vertical que haría entrar el volumen (m), si no entra */
  intervalo_sugerido: number | null;
}

export type ClaseInfiltracion = 'rapida' | 'ok' | 'lenta' | 'muy_lenta';

export interface InfiltracionSwale {
  ksat_suelo_mm_h:  number;   // el de SoilGrids/Saxton-Rawls
  ksat_diseno_mm_h: number;   // con factor de seguridad
  horas_vaciado:    number;
  clase:            ClaseInfiltracion;
}

export interface ResultadoSwales {
  swales:        SwaleLinea[];
  total_long_m:  number;
  total_vol_m3:  number;
  total_capt_ha: number;
  ancho_franja_m: number;
  intervaloV:    number;
  /** Pendiente media usada para el trazado (%). */
  pendiente_pct: number;
  /** null si el trazado sale pero no se pidió dimensionar */
  seccion:       SeccionSwale | null;
  /** null si no hay dato de suelo cargado */
  infiltracion:  InfiltracionSwale | null;
}

const LARGO_MIN_M = 15;   // descarta tramos sueltos demasiado cortos

/** Escalones "lindos" de separación vertical, para sugerir uno que entre en el tope. */
const ESCALONES_V = [0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4, 5, 7.5, 10, 15, 20, 25, 50];

export type MotivoSwales = 'sin_relieve' | 'demasiados_swales' | 'sin_tramos';

export interface DiagnosticoSwales {
  puede:       boolean;
  motivo:      MotivoSwales | null;
  desnivel_m:  number;
  /** cuántos swales pediría la separación elegida */
  niveles:     number;
  max_niveles: number;
  /** menor separación "linda" que entra en el tope (null si ni la mayor alcanza) */
  intervalo_sugerido: number | null;
}

/**
 * Por qué no se pueden trazar swales con esta separación, antes de intentarlo.
 *
 * El caso real que se veía en predios de miles de hectáreas: el desnivel total
 * es de cientos de metros, así que una separación de 1,5 m pide cientos de
 * curvas y `calcularCurvas` corta en seco al pasarse de `MAX_NIVELES`. El
 * mensaje viejo culpaba a "poco desnivel o intervalo muy grande" — justo al
 * revés de lo que pasaba.
 */
export function diagnosticarSwales(grilla: GrillaElevacion, intervaloV: number): DiagnosticoSwales {
  const desnivel = grilla.elev_max - grilla.elev_min;
  const niveles  = nivelesEstimados(desnivel, intervaloV);
  const sugerido = ESCALONES_V.find(v => nivelesEstimados(desnivel, v) <= MAX_NIVELES) ?? null;

  const base = { desnivel_m: +desnivel.toFixed(1), niveles, max_niveles: MAX_NIVELES, intervalo_sugerido: sugerido };
  if (!(intervaloV > 0) || desnivel < intervaloV) {
    return { ...base, puede: false, motivo: 'sin_relieve' };
  }
  if (niveles > MAX_NIVELES) {
    return { ...base, puede: false, motivo: 'demasiados_swales' };
  }
  return { ...base, puede: true, motivo: null };
}

/**
 * Pendiente media del área, en porcentaje.
 *
 * Se calcula como el promedio del módulo del gradiente celda por celda, con
 * diferencias centradas. Es distinto —y bastante mejor— que el atajo anterior,
 * que dividía el desnivel total por la diagonal del encuadre: en un predio con
 * una loma en el medio y dos faldeos, ese cociente daba una pendiente casi nula
 * porque los extremos estaban a la misma cota, cuando en realidad todo el
 * terreno tiene caída. Como la tabla de separación de zanjas se lee justamente
 * por pendiente, ahí el atajo mandaba a trazar swales a 30 m en una ladera del
 * 25 % que pide 12 m.
 *
 * `limite` es el polígono de la parcela, y resuelve la limitación que este
 * cálculo arrastraba. `recortarGrillaA` devuelve la **ventana rectangular** de
 * la parcela con las cotas intactas —el marching squares necesita las cuatro
 * esquinas de cada celda, así que no puede enmascarar a NaN—, y sin el polígono
 * el promedio salía de esa ventana entera. En un predio grande eso no es un
 * detalle: una franja diagonal sobre una ladera tiene una envolvente que abarca
 * media estancia, y la separación de zanjas terminaba leída de una pendiente
 * que no era la de la franja. El gradiente se sigue midiendo con los vecinos de
 * la grilla completa —el de una celda de borde es real y usarlo es correcto—;
 * lo que el polígono decide es **qué celdas entran al promedio**.
 *
 * Si el polígono es más angosto que el paso de la grilla no queda ninguna celda
 * adentro. Ahí se cae a la ventana, que es la respuesta vieja: peor que la
 * nueva, mejor que un cero.
 */
export function pendienteMediaPct(
  grilla: GrillaElevacion,
  limite?: Array<{ lat: number; lng: number }> | null,
): number {
  const { rows, cols, elev } = grilla;
  if (rows < 3 || cols < 3) return 0;

  const latRef = (grilla.latMin + grilla.latMax) / 2;
  const dLat = (grilla.latMax - grilla.latMin) / (rows - 1);
  const dLng = (grilla.lngMax - grilla.lngMin) / (cols - 1);
  const dx = (dLng * 111_320 * Math.cos(latRef * Math.PI / 180));
  const dy = (dLat * 111_320);
  if (!(dx > 0) || !(dy > 0)) return 0;

  const poly = limite && limite.length >= 3 ? polígonoDe(limite) : null;

  let suma = 0, n = 0;          // celdas adentro del polígono
  let sumaTodo = 0, nTodo = 0;  // toda la ventana, por si no entra ninguna
  for (let r = 1; r < rows - 1; r++) {
    for (let c = 1; c < cols - 1; c++) {
      const zE = elev[r * cols + c + 1]!,      zW = elev[r * cols + c - 1]!;
      const zN = elev[(r + 1) * cols + c]!,    zS = elev[(r - 1) * cols + c]!;
      if (Number.isNaN(zE) || Number.isNaN(zW) || Number.isNaN(zN) || Number.isNaN(zS)) continue;
      const gx = (zE - zW) / (2 * dx);
      const gy = (zN - zS) / (2 * dy);
      const g = Math.hypot(gx, gy);
      sumaTodo += g; nTodo++;
      if (poly) {
        const lat = grilla.latMin + r * dLat;
        const lng = grilla.lngMin + c * dLng;
        if (!turf.booleanPointInPolygon(turf.point([lng, lat]), poly)) continue;
      }
      suma += g; n++;
    }
  }
  if (n > 0)     return +((suma / n) * 100).toFixed(2);
  if (nTodo > 0) return +((sumaTodo / nTodo) * 100).toFixed(2);
  return 0;
}

export function calcularSwales(
  grilla:  GrillaElevacion,
  mojones: Array<{ lat: number; lng: number }>,
  opts:    OpcionesSwales,
): ResultadoSwales | null {
  const { intervaloV, precipMm, coef } = opts;
  if (!(intervaloV > 0) || grilla.elev_max - grilla.elev_min < intervaloV) return null;

  // Proyección local a metros.
  const latRef = (grilla.latMin + grilla.latMax) / 2;
  const kx = 111_320 * Math.cos(latRef * Math.PI / 180);
  const ky = 111_320;
  // Pendiente media del área → separación horizontal entre swales (ancho de
  // franja). Se prefiere la que calculó quien llama, para que coincida con la
  // que se usó para recomendar el intervalo.
  const pendPct = opts.pendiente_pct && opts.pendiente_pct > 0
    ? opts.pendiente_pct
    : pendienteMediaPct(grilla, mojones);
  const pendMedia = Math.max(pendPct / 100, 0.008);
  const anchoFranja = Math.min(150, Math.max(4, intervaloV / pendMedia));

  const poly = polígonoDe(mojones);

  const curvas = calcularCurvas(grilla, intervaloV);
  if (curvas.length === 0) return null;

  const swales: SwaleLinea[] = [];
  for (const curva of curvas) {
    for (const linea of curva.lineas) {
      // Partir la línea en tramos consecutivos que caen dentro del predio.
      for (const tramo of tramosDentro(linea.puntos, poly)) {
        const longitud = longitudM(tramo, kx, ky);
        if (longitud < LARGO_MIN_M) continue;
        const captacion_m2 = longitud * anchoFranja;
        const volumen = captacion_m2 * (precipMm / 1000) * coef;
        swales.push({
          cota: curva.cota,
          puntos: tramo,
          longitud_m: Math.round(longitud),
          captacion_ha: +(captacion_m2 / 10_000).toFixed(3),
          volumen_m3: Math.round(volumen),
        });
      }
    }
  }
  if (swales.length === 0) return null;

  const total_long_m = Math.round(swales.reduce((s, x) => s + x.longitud_m, 0));
  const seccion = dimensionarSeccion(anchoFranja, precipMm, coef, total_long_m, intervaloV, opts);

  return {
    swales,
    total_long_m,
    total_vol_m3:  Math.round(swales.reduce((s, x) => s + x.volumen_m3, 0)),
    total_capt_ha: +(swales.reduce((s, x) => s + x.captacion_ha, 0)).toFixed(2),
    ancho_franja_m: Math.round(anchoFranja),
    intervaloV,
    pendiente_pct: +pendPct.toFixed(2),
    seccion,
    infiltracion: verificarInfiltracion(seccion, opts.ksat_mm_h ?? null),
  };
}

// ─── Dimensionado de la sección (H1) ──────────────────────────────────────────

const TALUD_Z_DEF   = 1.5;   // H:V — estable en la mayoría de los suelos y desmalezable
const PROF_MAX_DEF  = 0.8;   // m — más hondo pide entibado y se vuelve peligroso
const BASE_MIN_M    = 0.3;   // menos que esto no lo abre una retro
const BASE_MAX_M    = 3.0;   // más ancho que esto conviene partir en dos swales
/** Profundidades "de obra" — las que se replantean sin decimales raros. */
const PROFUNDIDADES = [0.3, 0.4, 0.5, 0.6, 0.8, 1.0];
/** Factor de seguridad sobre Ksat: el de laboratorio/pedotransferencia siempre
 *  sobreestima al de campo (compactación, sellado superficial, raíces). */
const FS_KSAT = 2;

/**
 * El salto de "visual" a ingeniería: cuánta zanja hay que abrir.
 *
 * El volumen interceptado por metro lineal es constante en todo el trazado
 * (`ancho de franja × lluvia × coeficiente`), así que una sola sección típica
 * sirve para todos los swales — que es además como se dibuja en un plano.
 *
 * Se busca la profundidad más CHICA de la escalera de obra que deje un ancho de
 * fondo razonable. Si ni con la profundidad máxima entra, se dice y se calcula
 * qué separación vertical lo haría entrar: como el área requerida es
 * proporcional al ancho de franja, y éste al intervalo vertical, achicar el
 * intervalo achica la sección en la misma proporción.
 */
export function dimensionarSeccion(
  anchoFranja_m: number,
  precipMm:      number,
  coef:          number,
  longitudTotal_m: number,
  intervaloV:    number,
  opts:          Pick<OpcionesSwales, 'taludZ' | 'profMax_m'> = {},
): SeccionSwale {
  const z       = opts.taludZ    ?? TALUD_Z_DEF;
  const profMax = opts.profMax_m ?? PROF_MAX_DEF;
  const areaReq = anchoFranja_m * (precipMm / 1000) * coef;   // m² de sección por metro

  const candidatas = PROFUNDIDADES.filter(p => p <= profMax + 1e-9);
  const escalera   = candidatas.length ? candidatas : [profMax];

  // `b = A/d − z·d` decrece al aumentar `d`: se recorre de menos a más honda y
  // se toma la primera que deje un fondo abrible. Si la más chica ya se pasa de
  // holgada, se usa el fondo mínimo (queda algo sobredimensionada, que es el
  // lado seguro para errar).
  let prof = escalera[escalera.length - 1]!;
  let base = BASE_MAX_M;
  for (const d of escalera) {
    const b = areaReq / d - z * d;
    prof = d;
    if (b > BASE_MAX_M) { base = BASE_MAX_M; continue; }   // muy playa: probar más honda
    base = Math.max(BASE_MIN_M, b);
    break;
  }

  const area  = prof * (base + z * prof);
  const capac = area * longitudTotal_m;
  const suficiente = area + 1e-6 >= areaReq;

  return {
    base_m:       +base.toFixed(2),
    prof_m:       +prof.toFixed(2),
    talud_z:      z,
    ancho_sup_m:  +(base + 2 * z * prof).toFixed(2),
    area_m2:      +area.toFixed(2),
    area_req_m2:  +areaReq.toFixed(2),
    capacidad_m3: Math.round(capac),
    suficiente,
    cobertura_pct: areaReq > 0 ? Math.round(Math.min(999, (area / areaReq) * 100)) : 100,
    // Redondeado a 0,25 m hacia abajo: los intervalos de obra son "lindos".
    intervalo_sugerido: suficiente || areaReq <= 0 ? null
      : Math.max(0.25, Math.floor((intervaloV * (area / areaReq)) * 4) / 4),
  };
}

/**
 * ¿Se vacía la zanja antes de la próxima lluvia? Es la verificación que separa
 * un swale de un criadero de mosquitos.
 *
 * El agua no baja sólo por el fondo. Una zanja de talud 1,5:1 y 0,5 m de hondo
 * tiene 1,8 m de boca contra 0,3 m de fondo: contar sólo el fondo tiraba a la
 * basura cinco sextos de la superficie mojada y daba tiempos de vaciado
 * disparatados —cualquier suelo que no fuera arena salía advertido—. Acá se
 * integra el descenso del pelo de agua con el ancho mojado que le corresponde a
 * cada altura, contando los taludes al 50 % (criterio del BRE Digest 365 para
 * pozos y zanjas de infiltración: la carga sobre una pared vertical es menor que
 * sobre el fondo, y se toma la mitad del área lateral).
 *
 * Con `q(h) = K·(b + z·h)` por metro lineal y `A'(h) = b + 2·z·h` de superficie
 * de agua, la integral sale cerrada:
 *
 *     t = (1/K) · [ 2·d − (b/z)·ln(1 + z·d/b) ]
 *
 * que para talud vertical (z = 0) degenera en el caso obvio, `t = d/K`.
 *
 * El Ksat sigue afectado por el factor de seguridad: el de pedotransferencia
 * siempre sobreestima al de campo (compactación, sellado, colmatación).
 * Referencia habitual de diseño: vaciar en 24–48 h.
 */
export function verificarInfiltracion(
  seccion: SeccionSwale | null,
  ksat_mm_h: number | null,
): InfiltracionSwale | null {
  if (!seccion || ksat_mm_h === null || !(ksat_mm_h > 0) || !(seccion.base_m > 0)) return null;

  const kDiseno = ksat_mm_h / FS_KSAT;
  const horas   = horasVaciado(seccion, kDiseno);

  const clase: ClaseInfiltracion =
    horas <= 2  ? 'rapida'   :
    horas <= 24 ? 'ok'       :
    horas <= 48 ? 'lenta'    : 'muy_lenta';

  return {
    ksat_suelo_mm_h:  +ksat_mm_h.toFixed(2),
    ksat_diseno_mm_h: +kDiseno.toFixed(2),
    horas_vaciado:    +horas.toFixed(1),
    clase,
  };
}

/** Cuánto tarda en vaciarse la zanja llena, con el `ksat` de diseño en mm/h. */
export function horasVaciado(
  seccion: Pick<SeccionSwale, 'base_m' | 'prof_m' | 'talud_z'>,
  ksat_mm_h: number,
): number {
  const k = ksat_mm_h / 1000;                       // m/h
  const { base_m: b, prof_m: d, talud_z: z } = seccion;
  if (!(k > 0) || !(d > 0)) return 0;
  if (!(z > 0) || !(b > 0)) return d / k;
  return (2 * d - (b / z) * Math.log(1 + (z * d) / b)) / k;
}

function polígonoDe(mojones: Array<{ lat: number; lng: number }>): ReturnType<typeof turf.polygon> | null {
  if (mojones.length < 3) return null;
  const anillo = mojones.map(m => [m.lng, m.lat] as [number, number]);
  anillo.push(anillo[0]!);
  try { return turf.polygon([anillo]); } catch { return null; }
}

/** Parte una polilínea en los tramos consecutivos cuyos vértices caen dentro del predio. */
function tramosDentro(
  puntos: Array<{ lat: number; lng: number }>,
  poly:   ReturnType<typeof turf.polygon> | null,
): Array<Array<{ lat: number; lng: number }>> {
  if (!poly) return puntos.length >= 2 ? [puntos] : [];
  const tramos: Array<Array<{ lat: number; lng: number }>> = [];
  let actual: Array<{ lat: number; lng: number }> = [];
  for (const p of puntos) {
    if (turf.booleanPointInPolygon(turf.point([p.lng, p.lat]), poly)) {
      actual.push(p);
    } else if (actual.length) {
      tramos.push(actual);
      actual = [];
    }
  }
  if (actual.length) tramos.push(actual);
  return tramos.filter(t => t.length >= 2);
}

function longitudM(puntos: Array<{ lat: number; lng: number }>, kx: number, ky: number): number {
  let total = 0;
  for (let i = 1; i < puntos.length; i++) {
    const a = puntos[i - 1]!, b = puntos[i]!;
    total += Math.hypot((b.lng - a.lng) * kx, (b.lat - a.lat) * ky);
  }
  return total;
}

// ─── Trazado por parcelas (varias a la vez) ──────────────────────────────────

/**
 * Un área a trazar: una parcela dibujada, o el predio entero.
 *
 * Por qué varias a la vez. La tabla de separación se lee por pendiente, y la
 * pendiente cambia de una ladera a otra dentro del mismo campo: trazar todo el
 * predio con un solo intervalo es exactamente el error que la tabla viene a
 * corregir. Con parcelas, cada una recibe su propia pendiente, su propia
 * recomendación y su propio trazado, y el total se suma para el presupuesto.
 */
export interface AreaSwales {
  id:       string;
  nombre:   string;
  /** null = todo el predio (se usa el límite de mojones). */
  vertices: Array<{ lat: number; lng: number }> | null;
}

/** Contexto del suelo y la cobertura que afina la recomendación de separación. */
export interface ContextoSwales {
  infiltracion?: InfiltracionSuelo | null;
  cobertura?:    CoberturaLadera | null;
}

/** Lo que hace falta saber de un área ANTES de trazar: su pendiente y qué pide. */
export interface AnalisisArea {
  id:            string;
  nombre:        string;
  pendiente_pct: number;
  desnivel_m:    number;
  recomendacion: Recomendacion;
}

/**
 * Mide cada área y le calcula su separación recomendada, sin trazar nada.
 *
 * Es lo que alimenta los controles del panel: cada parcela muestra su pendiente
 * real y arranca en el valor que pide la tabla, con su propio rango de trabajo.
 */
export function analizarAreas(
  grilla:  GrillaElevacion,
  mojones: Array<{ lat: number; lng: number }>,
  areas:   AreaSwales[],
  ctx:     ContextoSwales = {},
): AnalisisArea[] {
  return areas.map(a => {
    const g = a.vertices ? (recortarGrillaA(grilla, a.vertices) ?? grilla) : grilla;
    const pendiente_pct = pendienteMediaPct(g, a.vertices ?? mojones);
    return {
      id: a.id,
      nombre: a.nombre,
      pendiente_pct,
      desnivel_m: +(g.elev_max - g.elev_min).toFixed(1),
      recomendacion: separacionVerticalZanjas({
        pendiente_pct,
        infiltracion: ctx.infiltracion ?? null,
        cobertura:    ctx.cobertura ?? null,
      }),
    };
  });
}

export interface BloqueSwales {
  id:            string;
  nombre:        string;
  pendiente_pct: number;
  /** La separación que se usó, ya acotada al rango de la recomendación. */
  intervaloV:    number;
  recomendacion: Recomendacion;
  resultado:     ResultadoSwales | null;
  /** Por qué no salió, cuando `resultado` es null. */
  diagnostico:   DiagnosticoSwales | null;
}

export interface ResultadoSwalesMulti {
  bloques:       BloqueSwales[];
  total_swales:  number;
  total_long_m:  number;
  total_vol_m3:  number;
  total_capt_ha: number;
  /** Movimiento de suelo sumado de las parcelas que salieron. */
  total_excavacion_m3: number;
}

/**
 * Traza swales en varias áreas de una vez, cada una con su propia separación.
 *
 * La separación de cada área se acota al rango de su recomendación antes de
 * calcular: si el usuario pidió un valor fuera de rango, la app se lo dijo en el
 * panel y acá no lo obedece a ciegas. El valor efectivamente usado vuelve en
 * `intervaloV` de cada bloque, así que en el informe queda escrito lo que se
 * trazó y no lo que se pidió.
 */
export function calcularSwalesMulti(
  grilla:  GrillaElevacion,
  mojones: Array<{ lat: number; lng: number }>,
  areas:   AreaSwales[],
  /** Separación vertical elegida por área, indexada por id. */
  intervalos: Record<string, number>,
  opts:    Omit<OpcionesSwales, 'intervaloV' | 'pendiente_pct'>,
  ctx:     ContextoSwales = {},
): ResultadoSwalesMulti {
  const bloques: BloqueSwales[] = [];

  for (const a of areas) {
    const g = a.vertices ? (recortarGrillaA(grilla, a.vertices) ?? grilla) : grilla;
    const limite = a.vertices ?? mojones;
    const pendiente_pct = pendienteMediaPct(g, limite);
    const rec = separacionVerticalZanjas({
      pendiente_pct,
      infiltracion: ctx.infiltracion ?? null,
      cobertura:    ctx.cobertura ?? null,
    });

    const pedido = intervalos[a.id] ?? (rec.aplica ? rec.valor : 1.5);
    const intervaloV = acotar(pedido, rec);

    const diag = diagnosticarSwales(g, intervaloV);
    const resultado = diag.puede
      ? calcularSwales(g, limite, { ...opts, intervaloV, pendiente_pct })
      : null;

    bloques.push({
      id: a.id, nombre: a.nombre, pendiente_pct, intervaloV, recomendacion: rec,
      resultado,
      diagnostico: resultado ? null
        : (diag.puede ? { ...diag, puede: false, motivo: 'sin_tramos' as const } : diag),
    });
  }

  const con = bloques.map(b => b.resultado).filter((r): r is ResultadoSwales => r !== null);
  return {
    bloques,
    total_swales:  con.reduce((s, r) => s + r.swales.length, 0),
    total_long_m:  Math.round(con.reduce((s, r) => s + r.total_long_m, 0)),
    total_vol_m3:  Math.round(con.reduce((s, r) => s + r.total_vol_m3, 0)),
    total_capt_ha: +(con.reduce((s, r) => s + r.total_capt_ha, 0)).toFixed(2),
    total_excavacion_m3: Math.round(con.reduce((s, r) => s + (r.seccion?.capacidad_m3 ?? 0), 0)),
  };
}

/**
 * Junta los bloques en un único resultado, para el mapa y el informe.
 *
 * Los totales se suman. Los escalares que describen el trazado (separación,
 * ancho de franja, pendiente) se promedian pesados por metros lineales, porque
 * un promedio simple daría el mismo peso a una parcela de 80 m que a una de
 * 4 km. La sección y la verificación de infiltración se conservan sólo si hay un
 * único bloque: con varias parcelas cada una tiene su propia sección y forzar
 * una sola sería inventar un número. El detalle por parcela vive en `bloques`.
 */
export function unirBloques(multi: ResultadoSwalesMulti): ResultadoSwales | null {
  const con = multi.bloques.filter(b => b.resultado !== null);
  if (con.length === 0) return null;

  const largo = (b: BloqueSwales) => b.resultado!.total_long_m || 1;
  const total = con.reduce((s, b) => s + largo(b), 0);
  const pesado = (f: (r: ResultadoSwales) => number) =>
    con.reduce((s, b) => s + f(b.resultado!) * largo(b), 0) / total;

  const unico = con.length === 1 ? con[0]!.resultado! : null;

  return {
    swales:        con.flatMap(b => b.resultado!.swales),
    total_long_m:  multi.total_long_m,
    total_vol_m3:  multi.total_vol_m3,
    total_capt_ha: multi.total_capt_ha,
    ancho_franja_m: Math.round(pesado(r => r.ancho_franja_m)),
    intervaloV:     +pesado(r => r.intervaloV).toFixed(2),
    pendiente_pct:  +pesado(r => r.pendiente_pct).toFixed(2),
    seccion:      unico?.seccion      ?? null,
    infiltracion: unico?.infiltracion ?? null,
  };
}
