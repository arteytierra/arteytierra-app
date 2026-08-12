/**
 * Cortinas rompevientos (cortavientos) como FRANJA multiestrato, no como línea:
 * una cortina real combina varias alturas (emergentes + dosel medio + arbustivo
 * de borde) para frenar el viento de forma porosa. La herramienta:
 *   • dibuja/sugiere el EJE de la cortina,
 *   • lo engorda a una BANDA de plantación (ancho configurable),
 *   • proyecta la ZONA PROTEGIDA a sotavento (≈ alto × factor) y reporta los
 *     metros de protección, tipo el diseño de una represa (ancho + alto → efecto).
 *
 * La sugerencia ubica la cortina del lado por donde entra el viento FRÍO
 * (hacia el polo: sur en el hemisferio sur), aguas arriba de la casa, para que
 * la vivienda quede dentro de la zona protegida.
 *
 * Orientativo: no elige el vivero real ni valida cortavientos por normativa.
 */
import * as turf from '@turf/turf';

export interface EstratoCortina {
  estrato:  string;
  altura:   string;
  especies: string[];
}

/** Estratos genéricos para el espinal / monte nativo argentino (orientativo). */
export const ESTRATOS_CORTINA: EstratoCortina[] = [
  { estrato: 'Emergente (alto)',    altura: '12–20 m', especies: ['Algarrobo blanco (Prosopis alba)', 'Quebracho blanco (Aspidosperma q.-blanco)', 'Tala (Celtis ehrenbergiana)'] },
  { estrato: 'Dosel medio',         altura: '6–12 m',  especies: ['Espinillo (Vachellia caven)', 'Molle de beber (Schinus fasciculatus)', 'Chañar (Geoffroea decorticans)'] },
  { estrato: 'Arbustivo / borde',   altura: '1–4 m',   especies: ['Jarilla (Larrea divaricata)', 'Piquillín (Condalia microphylla)', 'Tusca (Vachellia aroma)'] },
];

const AZIMUT_DIR: Record<string, number> = { N: 0, NE: 45, E: 90, SE: 135, S: 180, SO: 225, O: 270, NO: 315 };
const DIR_DESDE_AZ = (az: number): string =>
  (['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'] as const)[Math.round((az % 360) / 45) % 8]!;

/** Factor de protección a sotavento (× la altura de la cortina). Barrera porosa
 *  multiestrato: efecto útil hasta ~15–20 H; se usa 15 como valor de diseño. */
const FACTOR_PROTECCION = 15;

export interface OpcionesCortina {
  ancho_m: number;         // ancho de la franja de plantación
  alto_m:  number;         // altura de diseño (estrato más alto a la madurez)
  vientoFrioAz?: number;   // azimut DESDE donde llega el viento frío (0=N, 180=S)
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
  dir_viento_frio: string;       // etiqueta (N/S/…)
  estratos:       EstratoCortina[];
  origen:         'sugerida' | 'dibujada';
}

/** Azimut DESDE donde llega el viento frío según hemisferio (hacia el polo). */
export function azimutVientoFrio(latCentro: number): number {
  return latCentro < 0 ? 180 : 0;   // hem. sur → frío del S; hem. norte → del N
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
  const eje = recortarEje(ejeCrudo, mojones);
  if (eje.length < 2) return null;
  const latRef = eje.reduce((s, p) => s + p.lat, 0) / eje.length;
  const { kx, ky } = proj(latRef);

  const ancho_m = Math.max(2, opts.ancho_m);
  const alto_m  = Math.max(1, opts.alto_m);
  const azFrio  = opts.vientoFrioAz ?? azimutVientoFrio(latRef);
  const azSotavento = (azFrio + 180) % 360;   // el resguardo queda a sotavento

  const proteccion_m = Math.round(alto_m * FACTOR_PROTECCION);
  const banda = bandaDeEje(eje, ancho_m, kx, ky);
  const zonaProtegida = zonaSotavento(eje, proteccion_m, azSotavento * Math.PI / 180, kx, ky);

  return {
    eje, banda, zonaProtegida, ancho_m, alto_m,
    longitud_m: Math.round(longitudEje(eje, kx, ky)),
    proteccion_m,
    area_banda_ha: Math.round(areaHa(banda) * 100) / 100,
    area_protegida_ha: Math.round(areaHa(zonaProtegida) * 100) / 100,
    dir_viento_frio: DIR_DESDE_AZ(azFrio),
    estratos: ESTRATOS_CORTINA,
    origen,
  };
}

/**
 * Sugiere una cortina que protege la casa (o el centro del predio) del viento
 * frío: la ubica aguas arriba de la casa, perpendicular al viento, de largo
 * proporcional al predio, y recorta al polígono.
 */
export function sugerirCortina(
  casa: { lat: number; lng: number } | null,
  mojones: Array<{ lat: number; lng: number }>,
  opts: OpcionesCortina,
): CortinaResultado | null {
  if (mojones.length < 3) return null;
  const cx = mojones.reduce((s, m) => s + m.lng, 0) / mojones.length;
  const cy = mojones.reduce((s, m) => s + m.lat, 0) / mojones.length;
  const centro = casa ?? { lat: cy, lng: cx };
  const { kx, ky } = proj(centro.lat);

  const azFrio = opts.vientoFrioAz ?? azimutVientoFrio(centro.lat);
  const alto_m = Math.max(1, opts.alto_m);

  // Punto aguas arriba de la casa (hacia la fuente del viento frío).
  const radFrio = azFrio * Math.PI / 180;
  const upwind = { ex: Math.sin(radFrio), ny: Math.cos(radFrio) };
  const offset = Math.min(45, Math.max(12, alto_m * 3));   // que la casa quede bien dentro del resguardo
  const p0 = { lat: centro.lat + (upwind.ny * offset) / ky, lng: centro.lng + (upwind.ex * offset) / kx };

  // Eje perpendicular al viento, largo proporcional a la diagonal del predio.
  let latMin = Infinity, latMax = -Infinity, lngMin = Infinity, lngMax = -Infinity;
  for (const m of mojones) { latMin = Math.min(latMin, m.lat); latMax = Math.max(latMax, m.lat); lngMin = Math.min(lngMin, m.lng); lngMax = Math.max(lngMax, m.lng); }
  const diagM = Math.hypot((lngMax - lngMin) * kx, (latMax - latMin) * ky);
  const largo = Math.min(180, Math.max(60, diagM * 0.5));
  const azPerp = (azFrio + 90) * Math.PI / 180;
  const px = Math.sin(azPerp), py = Math.cos(azPerp);
  const eje = [
    { lat: p0.lat - (py * largo / 2) / ky, lng: p0.lng - (px * largo / 2) / kx },
    { lat: p0.lat + (py * largo / 2) / ky, lng: p0.lng + (px * largo / 2) / kx },
  ];

  return construirCortina(eje, { ...opts, vientoFrioAz: azFrio }, mojones, 'sugerida');
}
