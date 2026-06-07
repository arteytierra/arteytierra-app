/**
 * Aptitud de uso del suelo por celda de la grilla del shader.
 * Combina pendiente + orientación + acumulación hídrica + elevación relativa.
 * Resultados orientativos — no reemplazan relevamiento agronómico/edafológico.
 */
import type { DatosShader, CeldaShader } from './shaders';
import type { DatosEscorrentia } from './escorrentias';

export type TipoAptitud = 'huerta' | 'frutales' | 'pasturas' | 'forestal' | 'reserva';

export const COLORES_APTITUD: Record<TipoAptitud, string> = {
  huerta:   'rgb(46,125,50)',    // verde oscuro
  frutales: 'rgb(104,159,56)',   // verde oliva
  pasturas: 'rgb(249,168,37)',   // amarillo dorado
  forestal: 'rgb(93,64,55)',     // marrón
  reserva:  'rgb(120,144,156)',  // gris azulado
};

export const LABELS_APTITUD: Record<TipoAptitud, string> = {
  huerta:   'A — Huerta intensiva',
  frutales: 'B — Frutales',
  pasturas: 'C — Pasturas / silvopastoril',
  forestal: 'D — Forestal / conservación',
  reserva:  'E — Reserva / sin uso',
};

export interface CeldaAptitud {
  row:             number;
  col:             number;
  lat:             number;
  lng:             number;
  latMin:          number;
  latMax:          number;
  lngMin:          number;
  lngMax:          number;
  scores:          Record<TipoAptitud, number>; // 0–100
  dominante:       TipoAptitud;
  score_dominante: number;
}

export interface ResultadoAptitud {
  celdas:  CeldaAptitud[];
  resumen: Record<TipoAptitud, { celdas: number; pct: number }>;
}

// ─── Orientación de la celda (HemSur: N = más sol = mejor) ───────────────────

function orientacionNorte(c: CeldaShader, byPos: Map<string, CeldaShader>): number {
  const sur   = byPos.get(`${c.row - 1},${c.col}`);
  const norte = byPos.get(`${c.row + 1},${c.col}`);
  if (!sur || !norte) return 0.5;
  const dif = sur.elevation - norte.elevation;  // positivo = ladera norte (HemSur)
  return Math.max(0, Math.min(1, 0.5 + dif / 10));
}

// ─── Scoring por tipo ─────────────────────────────────────────────────────────

function scoreHuerta(pend: number, orient: number, acumRel: number, elevRel: number): number {
  let s = 0;
  s += pend < 3  ? 40 : pend < 7  ? 28 : pend < 12 ? 10 : -10;
  s += orient > 0.6 ? 25 : orient > 0.4 ? 15 : 5;
  s += acumRel < 0.1 ? 20 : acumRel < 0.3 ? 10 : acumRel < 0.6 ? 0 : -20;
  s += (elevRel >= 0.3 && elevRel <= 0.7) ? 15 : 5;
  return Math.max(0, Math.min(100, s));
}

function scoreFrutales(pend: number, orient: number, acumRel: number, elevRel: number): number {
  let s = 0;
  s += pend < 3  ? 20 : pend < 10 ? 35 : pend < 18 ? 20 : 0;
  s += orient > 0.55 ? 30 : orient > 0.4 ? 18 : 5;
  s += acumRel < 0.15 ? 20 : acumRel < 0.4 ? 10 : -10;
  s += (elevRel >= 0.3 && elevRel <= 0.75) ? 15 : 5;
  return Math.max(0, Math.min(100, s));
}

function scorePasturas(pend: number, acumRel: number): number {
  let s = 0;
  s += pend < 5  ? 35 : pend < 15 ? 30 : pend < 25 ? 15 : 0;
  s += acumRel < 0.3 ? 35 : acumRel < 0.6 ? 20 : 5;
  s += 30; // base alta: pasturas van en casi todo
  return Math.max(0, Math.min(100, s));
}

function scoreForestal(pend: number, orient: number): number {
  let s = 0;
  s += pend > 20 ? 40 : pend > 12 ? 30 : pend > 6 ? 15 : 5;
  s += orient < 0.45 ? 30 : orient < 0.55 ? 20 : 10; // orientación sur = forestal
  s += 30;
  return Math.max(0, Math.min(100, s));
}

function scoreReserva(pend: number, acumRel: number, elevRel: number): number {
  let s = 0;
  s += pend > 30 ? 40 : pend > 20 ? 25 : 5;
  s += acumRel > 0.7 ? 35 : acumRel > 0.5 ? 20 : 5;
  s += elevRel < 0.15 || elevRel > 0.9 ? 25 : 5;
  return Math.max(0, Math.min(100, s));
}

// ─── Función principal ────────────────────────────────────────────────────────

export function calcularAptitud(
  shader: DatosShader,
  escorrentia?: DatosEscorrentia | null,
): ResultadoAptitud {
  const { celdas, elev_min, elev_max } = shader;
  const byPos = new Map<string, CeldaShader>(celdas.map(c => [`${c.row},${c.col}`, c]));

  // Máximo de acumulación para normalizar (DatosEscorrentia.acumulacion es Map<string,number>)
  const acumMax = escorrentia ? Math.max(...Array.from(escorrentia.acumulacion.values()), 1) : 1;
  const acumPorPos: Map<string, number> = escorrentia?.acumulacion ?? new Map();

  const resultCeldas: CeldaAptitud[] = celdas.map(c => {
    const elevRel  = elev_max > elev_min ? (c.elevation - elev_min) / (elev_max - elev_min) : 0.5;
    const acum     = acumPorPos.get(`${c.row},${c.col}`) ?? 0;
    const acumRel  = acum / acumMax;
    const orient   = orientacionNorte(c, byPos);
    const pend     = c.pendiente_pct;
    const lat      = (c.latMin + c.latMax) / 2;
    const lng      = (c.lngMin + c.lngMax) / 2;

    const scores: Record<TipoAptitud, number> = {
      huerta:   scoreHuerta(pend, orient, acumRel, elevRel),
      frutales: scoreFrutales(pend, orient, acumRel, elevRel),
      pasturas: scorePasturas(pend, acumRel),
      forestal: scoreForestal(pend, orient),
      reserva:  scoreReserva(pend, acumRel, elevRel),
    };

    const entries   = Object.entries(scores) as [TipoAptitud, number][];
    const dominante: TipoAptitud = entries.reduce((a, b) => b[1] > a[1] ? b : a)[0];

    return {
      row: c.row, col: c.col, lat, lng,
      latMin: c.latMin, latMax: c.latMax, lngMin: c.lngMin, lngMax: c.lngMax,
      scores, dominante, score_dominante: scores[dominante],
    };
  });

  // Resumen por tipo
  const tiposAptitud: TipoAptitud[] = ['huerta', 'frutales', 'pasturas', 'forestal', 'reserva'];
  const resumen = Object.fromEntries(tiposAptitud.map(t => {
    const n = resultCeldas.filter(c => c.dominante === t).length;
    return [t, { celdas: n, pct: Math.round((n / resultCeldas.length) * 1000) / 10 }];
  })) as Record<TipoAptitud, { celdas: number; pct: number }>;

  return { celdas: resultCeldas, resumen };
}
