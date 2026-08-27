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
import { calcularCurvas, MAX_NIVELES, nivelesEstimados } from './curvasNivel';

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
  const anchoM = (grilla.lngMax - grilla.lngMin) * kx;
  const altoM  = (grilla.latMax - grilla.latMin) * ky;
  const diagM  = Math.hypot(anchoM, altoM);

  // Pendiente media del predio → separación horizontal entre swales (ancho de franja).
  const pendMedia = Math.max((grilla.elev_max - grilla.elev_min) / Math.max(diagM, 1), 0.008);
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
 * un swale de un criadero de mosquitos. Se usa la lámina equivalente sobre el
 * FONDO (la infiltración por los taludes se desprecia, criterio conservador) y
 * el Ksat afectado por un factor de seguridad.
 *
 * Referencia habitual de diseño de infiltración: vaciar en 24–48 h.
 */
export function verificarInfiltracion(
  seccion: SeccionSwale | null,
  ksat_mm_h: number | null,
): InfiltracionSwale | null {
  if (!seccion || ksat_mm_h === null || !(ksat_mm_h > 0) || !(seccion.base_m > 0)) return null;

  const kDiseno   = ksat_mm_h / FS_KSAT;
  const lamina_mm = (seccion.area_m2 / seccion.base_m) * 1000;
  const horas     = lamina_mm / kDiseno;

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
