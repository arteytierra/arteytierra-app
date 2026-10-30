/**
 * Cortinas rompevientos (cortavientos) como FRANJA multiestrato, no como línea:
 * una cortina real combina varias alturas (emergentes + dosel medio + arbustivo
 * de borde) para frenar el viento de forma porosa. La herramienta:
 *   • dibuja/sugiere el EJE de la cortina,
 *   • lo engorda a una BANDA de plantación (ancho configurable),
 *   • proyecta la ZONA PROTEGIDA a sotavento (≈ alto × factor) y reporta los
 *     metros de protección, tipo el diseño de una represa (ancho + alto →
 *     efecto).
 *
 * ── Contra qué viento ──────────────────────────────────────────────────────
 *
 * Lo decide `lib/viento.ts` con la serie medida, y **ya no hay default por
 * latitud**. Hasta el 30/10/2026 este archivo exportaba:
 *
 *     export function azimutVientoFrio(latCentro: number): number {
 *       return latCentro < 0 ? 180 : 0;   // el aire frío viene del polo
 *     }
 *
 * y eso erraba por 51° en Chiapas, 136° en Córdoba y 136° en Ámsterdam, cada
 * uno contra su propia serie de POWER. El detalle de los tres casos y de la
 * estadística está en la cabecera de `viento.ts`; acá sólo importa la
 * consecuencia: **`vientoFrioAz` es obligatorio**. Sin viento medido y sin un
 * rumbo elegido por quien conoce el predio, esta función devuelve `null` en vez
 * de poner la cortina del lado que le parece.
 *
 * Fuente del diseño: Brandle, J.R., Hodges, L., Tyndall, J. y Sudmeyer, R.A.
 * (2009), «Windbreak Practices», en *North American Agroforestry: An Integrated
 * Science and Practice*, 2.ª ed., H.E. Garrett (ed.), American Society of
 * Agronomy, cap. 29.
 *
 * Orientativo: no elige el vivero real ni valida cortavientos por normativa.
 */
import * as turf from '@turf/turf';

import { rumboDeAzimut, type Rumbo } from './viento';

export interface EstratoCortina {
  estrato: string;
  altura:  string;
  /** Qué hace ese estrato en la barrera. No es decoración: es el motivo por el
   *  cual la cortina lleva tres alturas y no una. */
  funcion: string;
}

/**
 * La ESTRUCTURA de una cortina multiestrato. Son alturas y funciones, no
 * especies, y eso es un arreglo del 30/10/2026.
 *
 * Hasta esa fecha esta constante nombraba tres ternas de especies del espinal
 * argentino —algarrobo blanco, quebracho blanco, jarilla, piquillín— y el panel
 * las mostraba bajo el título «Estratos sugeridos (nativas)» para **cualquier
 * predio del mundo**. Sobre el predio de Chiapas con el que se armaron los
 * videos de la vidriera, eso era una lista de especies de otro continente
 * presentada como flora nativa del lugar. No se estrella: se planta.
 *
 * La estructura sí es general y está publicada: Brandle et al. (2009)
 * recomiendan para una cortina de campo una densidad óptica de 40 a 60 % en la
 * estación de crecimiento, y señalan que cuando hace falta reparo con los
 * caducifolios sin hoja «the windbreak must contain either coniferous species
 * or a dense shrub understory» —de ahí el estrato de borde—. Las especies son
 * regionales y las resuelve la ficha del ecosistema del predio, que viaja por
 * `OpcionesCortina.floraNativa`; la misma fuente dice que «native species are
 * usually a good choice», no cuáles.
 */
export const ESTRATOS_CORTINA: readonly EstratoCortina[] = Object.freeze([
  {
    estrato: 'Emergente (alto)',
    altura:  '12–20 m',
    funcion: 'Fija la altura H de la barrera, que es lo que decide hasta dónde llega el reparo.',
  },
  {
    estrato: 'Dosel medio',
    altura:  '6–12 m',
    funcion: 'Da la porosidad del cuerpo: una barrera cerrada genera remolinos y protege menos que una porosa.',
  },
  {
    estrato: 'Arbustivo / borde',
    altura:  '1–4 m',
    funcion: 'Cierra el pie, por donde el aire se cuela y acelera. Es el estrato que falta cuando el caducifolio pierde la hoja.',
  },
]);

/**
 * Factor de protección a sotavento, en veces la altura de la cortina.
 *
 * Brandle et al. (2009): la zona de viento reducido a sotavento «typically
 * extends for a distance of 10 to 30 H», y para separar cortinas sucesivas
 * recomiendan 10 a 20 H «depending on the degree of protection desired». 15 es
 * el valor de diseño que usa la app: el medio de esa banda de separación, o sea
 * el extremo conservador de la banda de 10 a 30. El comentario anterior decía
 * «efecto útil hasta ~15–20 H» sin fuente, y eso recortaba la literatura por el
 * lado alto sin decir por qué.
 *
 * Lo lee también el `CortinasPanel`, que muestra `alto × 15` antes de construir
 * nada: si cambia acá, cambia allá.
 */
export const FACTOR_PROTECCION = 15;

/**
 * Largo mínimo de una cortina en veces su altura.
 *
 * Brandle et al. (2009): «The length of a windbreak should be at least ten
 * times its height to minimize the effect of wind flow around the ends of the
 * windbreak.» Por debajo de eso el aire da la vuelta por las puntas y la zona
 * protegida que esta función dibuja es más grande que la real, así que el
 * resultado lo avisa en `corta` en vez de callarse.
 */
export const LARGO_MINIMO_H = 10;

export interface OpcionesCortina {
  ancho_m: number;         // ancho de la franja de plantación
  alto_m:  number;         // altura de diseño (estrato más alto a la madurez)
  /**
   * Azimut DESDE donde llega el viento a frenar (0 = N, 180 = S).
   * **Obligatorio**: lo resuelve `vientoDeLaEstacionFria` con la serie medida,
   * o lo elige quien conoce el predio. Ver la cabecera.
   */
  vientoFrioAz: number;
  /**
   * Flora nativa del ecosistema del predio, si la ficha la trae. Va tal cual se
   * publica —sin asignar a estrato, porque la ficha no dice la altura— y vacía
   * cuando no hay ficha. Nunca se rellena con una lista de otra región.
   */
  floraNativa?: readonly string[];
}

export interface CortinaResultado {
  eje:            Array<{ lat: number; lng: number }>;
  banda:          Array<{ lat: number; lng: number }>;   // franja de plantación (área)
  zonaProtegida:  Array<{ lat: number; lng: number }>;   // área resguardada a sotavento
  ancho_m:        number;
  alto_m:         number;
  longitud_m:     number;
  proteccion_m:   number;        // alcance a sotavento
  area_banda_ha:  number;
  area_protegida_ha: number;
  viento_az:      number;        // el azimut con el que se orientó, en grados
  dir_viento_frio: Rumbo;        // el mismo, en la rosa de 16 puntas
  /** Largo por debajo de 10 H: el aire da la vuelta por las puntas y la zona
   *  protegida de arriba está sobreestimada. Ver `LARGO_MINIMO_H`. */
  corta:          boolean;
  /** El largo que le faltaría para llegar a 10 H. 0 cuando `corta` es falso. */
  falta_largo_m:  number;
  estratos:       readonly EstratoCortina[];
  flora_nativa:   readonly string[];
  origen:         'sugerida' | 'dibujada';
}

function proj(latRef: number) {
  return { kx: 111_320 * Math.cos(latRef * Math.PI / 180), ky: 111_320 };
}

function longitudEje(eje: Array<{ lat: number; lng: number }>, kx: number, ky: number): number {
  let d = 0;
  for (let i = 1; i < eje.length; i++) {
    d += Math.hypot((eje[i]!.lng - eje[i - 1]!.lng) * kx, (eje[i]!.lat - eje[i - 1]!.lat) * ky);
  }
  return d;
}

/** Engorda el eje a una banda de ancho `anchoM` (offset ± perpendicular al eje). */
function bandaDeEje(eje: Array<{ lat: number; lng: number }>, anchoM: number, kx: number, ky: number): Array<{ lat: number; lng: number }> {
  const izq: Array<{ lat: number; lng: number }> = [], der: Array<{ lat: number; lng: number }> = [];
  const h = anchoM / 2;
  for (let i = 0; i < eje.length; i++) {
    const a = eje[Math.max(0, i - 1)]!, b = eje[Math.min(eje.length - 1, i + 1)]!;
    let dx = (b.lng - a.lng) * kx, dy = (b.lat - a.lat) * ky;
    const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
    const nx = -dy, ny = dx;   // normal izquierda
    izq.push({ lat: eje[i]!.lat + (ny * h) / ky, lng: eje[i]!.lng + (nx * h) / kx });
    der.push({ lat: eje[i]!.lat - (ny * h) / ky, lng: eje[i]!.lng - (nx * h) / kx });
  }
  return [...izq, ...der.reverse()];
}

/** Quad de la zona protegida: el eje + su copia desplazada `distM` a sotavento. */
function zonaSotavento(eje: Array<{ lat: number; lng: number }>, distM: number, azSotaventoRad: number, kx: number, ky: number): Array<{ lat: number; lng: number }> {
  const ex = Math.sin(azSotaventoRad) * distM, ny = Math.cos(azSotaventoRad) * distM;
  const off = eje.map(p => ({ lat: p.lat + ny / ky, lng: p.lng + ex / kx }));
  return [...eje, ...off.reverse()];
}

function areaHa(ring: Array<{ lat: number; lng: number }>): number {
  if (ring.length < 3) return 0;
  const coords = [...ring.map(p => [p.lng, p.lat] as [number, number]), [ring[0]!.lng, ring[0]!.lat] as [number, number]];
  try { return turf.area(turf.polygon([coords])) / 10_000; } catch { return 0; }
}

/** Recorta el eje al predio: conserva el tramo de puntos que cae dentro. */
function recortarEje(eje: Array<{ lat: number; lng: number }>, mojones?: Array<{ lat: number; lng: number }>): Array<{ lat: number; lng: number }> {
  if (!mojones || mojones.length < 3) return eje;
  const ring = [...mojones.map(m => [m.lng, m.lat] as [number, number]), [mojones[0]!.lng, mojones[0]!.lat] as [number, number]];
  let poly: ReturnType<typeof turf.polygon>;
  try { poly = turf.polygon([ring]); } catch { return eje; }
  // Densificar y quedarse con los puntos internos.
  const dens: Array<{ lat: number; lng: number }> = [];
  for (let i = 0; i < eje.length - 1; i++) {
    const a = eje[i]!, b = eje[i + 1]!;
    for (let t = 0; t < 1; t += 0.04) dens.push({ lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t });
  }
  dens.push(eje[eje.length - 1]!);
  const dentro = dens.filter(p => turf.booleanPointInPolygon(turf.point([p.lng, p.lat]), poly));
  return dentro.length >= 2 ? dentro : eje;
}

/** Construye la cortina (banda + zona protegida) a partir de un eje ya trazado. */
export function construirCortina(
  ejeCrudo: Array<{ lat: number; lng: number }>,
  opts: OpcionesCortina,
  mojones?: Array<{ lat: number; lng: number }>,
  origen: 'sugerida' | 'dibujada' = 'dibujada',
): CortinaResultado | null {
  if (!Number.isFinite(opts.vientoFrioAz)) return null;
  const eje = recortarEje(ejeCrudo, mojones);
  if (eje.length < 2) return null;
  const latRef = eje.reduce((s, p) => s + p.lat, 0) / eje.length;
  const { kx, ky } = proj(latRef);

  const ancho_m = Math.max(2, opts.ancho_m);
  const alto_m  = Math.max(1, opts.alto_m);
  const azFrio  = ((opts.vientoFrioAz % 360) + 360) % 360;
  const azSotavento = (azFrio + 180) % 360;   // el resguardo queda a sotavento

  const proteccion_m = Math.round(alto_m * FACTOR_PROTECCION);
  const banda = bandaDeEje(eje, ancho_m, kx, ky);
  const zonaProtegida = zonaSotavento(eje, proteccion_m, azSotavento * Math.PI / 180, kx, ky);
  const longitud_m = Math.round(longitudEje(eje, kx, ky));
  const largoMinimo = alto_m * LARGO_MINIMO_H;

  return {
    eje, banda, zonaProtegida, ancho_m, alto_m,
    longitud_m,
    proteccion_m,
    area_banda_ha: Math.round(areaHa(banda) * 100) / 100,
    area_protegida_ha: Math.round(areaHa(zonaProtegida) * 100) / 100,
    viento_az: Math.round(azFrio * 10) / 10,
    dir_viento_frio: rumboDeAzimut(azFrio),
    corta: longitud_m < largoMinimo,
    falta_largo_m: Math.max(0, Math.round(largoMinimo - longitud_m)),
    estratos: ESTRATOS_CORTINA,
    flora_nativa: opts.floraNativa ?? [],
    origen,
  };
}

/**
 * Sugiere una cortina que protege la casa (o el centro del predio) del viento
 * frío: la ubica aguas arriba de la casa, perpendicular al viento, de largo
 * proporcional al predio, y recorta al polígono.
 *
 * El eje se traza perpendicular al viento porque es lo que maximiza el reparo:
 * «Windbreaks are most effective when they are oriented perpendicular to the
 * wind» (Brandle et al., 2009). Y el largo se estira hasta 10 H cuando el predio
 * lo permite, por el mismo motivo por el que `corta` existe.
 */
export function sugerirCortina(
  casa: { lat: number; lng: number } | null,
  mojones: Array<{ lat: number; lng: number }>,
  opts: OpcionesCortina,
): CortinaResultado | null {
  if (mojones.length < 3) return null;
  if (!Number.isFinite(opts.vientoFrioAz)) return null;
  const cx = mojones.reduce((s, m) => s + m.lng, 0) / mojones.length;
  const cy = mojones.reduce((s, m) => s + m.lat, 0) / mojones.length;
  const centro = casa ?? { lat: cy, lng: cx };
  const { kx, ky } = proj(centro.lat);

  const azFrio = ((opts.vientoFrioAz % 360) + 360) % 360;
  const alto_m = Math.max(1, opts.alto_m);

  // Punto aguas arriba de la casa (hacia la fuente del viento frío).
  const radFrio = azFrio * Math.PI / 180;
  const upwind = { ex: Math.sin(radFrio), ny: Math.cos(radFrio) };
  const offset = Math.min(45, Math.max(12, alto_m * 3));   // que la casa quede bien dentro del resguardo
  const p0 = { lat: centro.lat + (upwind.ny * offset) / ky, lng: centro.lng + (upwind.ex * offset) / kx };

  // Eje perpendicular al viento. El largo sale de la diagonal del predio, pero
  // el piso ya no es 60 m fijos: son los 10 H que pide la literatura, porque una
  // cortina de 10 m de alto y 60 m de largo deja entrar el aire por las puntas y
  // la app informaba su zona protegida como si no.
  let latMin = Infinity, latMax = -Infinity, lngMin = Infinity, lngMax = -Infinity;
  for (const m of mojones) { latMin = Math.min(latMin, m.lat); latMax = Math.max(latMax, m.lat); lngMin = Math.min(lngMin, m.lng); lngMax = Math.max(lngMax, m.lng); }
  const diagM = Math.hypot((lngMax - lngMin) * kx, (latMax - latMin) * ky);
  const largo = Math.min(Math.max(180, alto_m * LARGO_MINIMO_H), Math.max(alto_m * LARGO_MINIMO_H, diagM * 0.5));
  const azPerp = (azFrio + 90) * Math.PI / 180;
  const px = Math.sin(azPerp), py = Math.cos(azPerp);
  const eje = [
    { lat: p0.lat - (py * largo / 2) / ky, lng: p0.lng - (px * largo / 2) / kx },
    { lat: p0.lat + (py * largo / 2) / ky, lng: p0.lng + (px * largo / 2) / kx },
  ];

  return construirCortina(eje, { ...opts, vientoFrioAz: azFrio }, mojones, 'sugerida');
}
