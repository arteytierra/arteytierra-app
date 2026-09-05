/**
 * Aptitud de uso del suelo por celda de la grilla del shader.
 * Combina pendiente + orientación + acumulación hídrica + elevación relativa.
 * Resultados orientativos — no reemplazan relevamiento agronómico/edafológico.
 */
import * as turf from '@turf/turf';
import type { DatosShader, CeldaShader } from './shaders';
import type { DatosEscorrentia } from './escorrentias';
import type { ModificadorAptitud } from './biomaTipos';

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
  /** Los ajustes del ecosistema que efectivamente se aplicaron, con su razón.
   *  Van hasta la pantalla: un puntaje corregido sin decir por qué no se puede
   *  discutir, y acá el usuario sabe más del lugar que la app. */
  ajustes: ModificadorAptitud[];
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

/**
 * Aptitud de uso del suelo, corregida por el ecosistema si la ficha lo pide.
 *
 * El cálculo base es puro relieve: pendiente, orientación, agua que junta la
 * celda, altura relativa. Eso está bien para ordenar el predio entre sí —qué
 * parte es más apta que cuál— pero no sabe dónde queda el predio. Una ladera
 * norte de 8 % puntúa igual en la Amazonia y en la Patagonia, y sin embargo la
 * decisión no es la misma: en un bosque tropical el suelo desnudo se lava en
 * dos temporadas y el uso que corresponde es agroforestal, no huerta abierta.
 *
 * `modificadores` es donde entra esa corrección, y entra nombrada: cada delta
 * viaja con la razón que lo justifica y las dos llegan juntas a la interfaz.
 * Se aplican **antes** de elegir el uso dominante, que es el punto: si sólo se
 * ajustara el número mostrado, el mapa seguiría pintando el uso equivocado.
 */
export function calcularAptitud(
  shader: DatosShader,
  escorrentia?: DatosEscorrentia | null,
  modificadores?: ModificadorAptitud[] | null,
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

    // Corrección del ecosistema, acotada al mismo 0–100 que el resto.
    for (const m of modificadores ?? []) {
      scores[m.uso] = Math.max(0, Math.min(100, scores[m.uso] + m.delta));
    }

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

  return { celdas: resultCeldas, resumen, ajustes: modificadores ?? [] };
}

// ─── Agrupar celdas en polígonos contiguos ───────────────────────────────────
//
// Cada celda pertenece a UN solo tipo dominante, así que los polígonos que
// devolvemos son disjuntos por construcción: teselan el predio sin superponerse.
// (El método anterior — una única caja envolvente por tipo — cubría todo el
//  predio y las cajas se pisaban entre sí.)

export interface ClusterAptitud {
  tipo:    TipoAptitud;
  anillo:  Array<{ lat: number; lng: number }>;
  celdas:  number;
}

export function agruparAptitud(res: ResultadoAptitud, minCeldas = 3): ClusterAptitud[] {
  const key = (r: number, c: number) => `${r},${c}`;
  const porTipo = new Map<TipoAptitud, CeldaAptitud[]>();
  for (const c of res.celdas) {
    const arr = porTipo.get(c.dominante) ?? [];
    arr.push(c);
    porTipo.set(c.dominante, arr);
  }

  const clusters: ClusterAptitud[] = [];

  for (const [tipo, celdas] of porTipo) {
    const byPos = new Map<string, CeldaAptitud>(celdas.map(c => [key(c.row, c.col), c]));
    const visto = new Set<string>();

    for (const inicio of celdas) {
      const k0 = key(inicio.row, inicio.col);
      if (visto.has(k0)) continue;

      // Flood-fill 4-conexo: recolectar el grupo contiguo
      const grupo: CeldaAptitud[] = [];
      const cola: CeldaAptitud[] = [inicio];
      visto.add(k0);
      while (cola.length) {
        const c = cola.pop()!;
        grupo.push(c);
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
          const kk = key(c.row + dr, c.col + dc);
          const vecino = byPos.get(kk);
          if (vecino && !visto.has(kk)) { visto.add(kk); cola.push(vecino); }
        }
      }
      if (grupo.length < minCeldas) continue;

      const anillo = unirCeldas(grupo);
      if (anillo && anillo.length >= 3) {
        clusters.push({ tipo, anillo, celdas: grupo.length });
      }
    }
  }

  return clusters;
}

/** Une los rectángulos de un grupo contiguo en un solo anillo exterior. */
function unirCeldas(grupo: CeldaAptitud[]): Array<{ lat: number; lng: number }> | null {
  try {
    const polys = grupo.map(c => turf.polygon([[
      [c.lngMin, c.latMin], [c.lngMax, c.latMin],
      [c.lngMax, c.latMax], [c.lngMin, c.latMax],
      [c.lngMin, c.latMin],
    ]]));
    const merged = polys.length === 1
      ? polys[0]
      : turf.union(turf.featureCollection(polys));
    if (!merged) return null;

    const geom = merged.geometry;
    let ring: number[][] | undefined;
    if (geom.type === 'Polygon') {
      ring = geom.coordinates[0];
    } else {
      // MultiPolygon (raro con 4-conexión): tomar el anillo exterior mayor
      ring = geom.coordinates
        .map(p => p[0]!)
        .sort((a, b) => turf.area(turf.polygon([b])) - turf.area(turf.polygon([a])))[0];
    }
    if (!ring) return null;

    const pts = ring.slice(0, -1).map(([lng, lat]) => ({ lat: lat!, lng: lng! }));
    return limpiarColineales(pts);
  } catch {
    return null;
  }
}

/** Descarta vértices colineales para aligerar el anillo rectilíneo. */
function limpiarColineales(pts: Array<{ lat: number; lng: number }>): Array<{ lat: number; lng: number }> {
  if (pts.length < 4) return pts;
  const n = pts.length;
  const out: Array<{ lat: number; lng: number }> = [];
  for (let i = 0; i < n; i++) {
    const a = pts[(i - 1 + n) % n]!;
    const b = pts[i]!;
    const c = pts[(i + 1) % n]!;
    const cross = (b.lng - a.lng) * (c.lat - a.lat) - (b.lat - a.lat) * (c.lng - a.lng);
    if (Math.abs(cross) > 1e-12) out.push(b);
  }
  return out.length >= 3 ? out : pts;
}
