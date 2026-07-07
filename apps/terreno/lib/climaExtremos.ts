/**
 * Extremos climáticos y clima de riesgo, calculados sobre la serie DIARIA de
 * Open-Meteo (reanálisis ERA5, ~10 km, 1940–hoy). A diferencia de la climatología
 * mensual de NASA POWER, la serie diaria permite derivar los datos que hacen falta
 * para dimensionar con criterio de ingeniería rural:
 *
 *   • Fechas de heladas con percentiles (ventana libre de heladas real).
 *   • Tormenta de diseño (Gumbel sobre máximos anuales de lluvia diaria) → base
 *     para vertederos de represas, alcantarillas y separación de swales.
 *   • Rachas secas (percentiles) → autonomía de tanques/represas.
 *   • Variabilidad interanual de la precipitación (CV%).
 *
 * Todas las funciones son puras. Resultados orientativos — verificar con series
 * de estaciones locales antes de un proyecto ejecutivo.
 */

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface SerieDiaria {
  time:   string[];   // fechas ISO "YYYY-MM-DD"
  tmax:   Array<number | null>;
  tmin:   Array<number | null>;
  precip: Array<number | null>;
  et0:    Array<number | null>;
  wind:   Array<number | null>;
}

export interface PercentilFecha { p10: string; p50: string; p90: string }

export interface HeladasStats {
  hay_heladas:        boolean;
  umbral_c:           number;
  dias_helada_anio:   number;      // media de días con tmin ≤ umbral por año
  ultima_helada:      PercentilFecha | null;   // fin de la temporada fría (invierno→primavera)
  primera_helada:     PercentilFecha | null;   // inicio del otoño
  periodo_libre_dias: { p10: number; p50: number; p90: number } | null;
}

export interface TormentaDiseno {
  metodo:               string;
  p24h_max_registrada:  number;    // mayor lluvia diaria del período
  recurrencias:         Array<{ periodo_retorno: number; mm: number }>;
}

export interface Extremos {
  fuente:        string;
  periodo:       string;           // "1991–2025"
  anios:         number;
  elevacion_m:   number | null;
  heladas:       HeladasStats;
  tormenta:      TormentaDiseno;
  sequia:        { racha_max_dias: number; racha_anual_p50: number; racha_anual_p90: number };
  precip_anual:  { media_mm: number; min_mm: number; max_mm: number; cv_pct: number };
  et0_anual_mm:  number;
  calor:         { dias_ge_35: number; dias_ge_40: number };  // media/año
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MESES_ABR = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function fmtDia(fecha: Date): string {
  return `${fecha.getUTCDate()} ${MESES_ABR[fecha.getUTCMonth()] ?? '?'}`;
}

function media(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function desvio(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = media(xs);
  const v = xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1);
  return Math.sqrt(v);
}

/** Percentil por interpolación lineal (xs no necesita estar ordenado). */
function percentil(xs: number[], p: number): number {
  if (xs.length === 0) return NaN;
  const s = [...xs].sort((a, b) => a - b);
  const idx = (p / 100) * (s.length - 1);
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  const frac = idx - lo;
  return (s[lo] ?? 0) * (1 - frac) + (s[hi] ?? 0) * frac;
}

function num(x: number | null | undefined): number {
  return x == null || Number.isNaN(x) ? NaN : x;
}

// ─── Núcleo ──────────────────────────────────────────────────────────────────

export function calcularExtremos(
  serie: SerieDiaria,
  meta: { fuente?: string; elevacion_m?: number | null } = {},
): Extremos | null {
  const n = serie.time.length;
  if (n < 365) return null;

  // Parseo a registros con año/mes/día
  interface Reg { y: number; m: number; fecha: Date; tmax: number; tmin: number; precip: number; et0: number; }
  const regs: Reg[] = [];
  for (let i = 0; i < n; i++) {
    const t = serie.time[i];
    if (!t) continue;
    const y = parseInt(t.slice(0, 4), 10);
    const m = parseInt(t.slice(5, 7), 10);
    const d = parseInt(t.slice(8, 10), 10);
    if (!y || !m || !d) continue;
    regs.push({
      y, m,
      fecha:  new Date(Date.UTC(y, m - 1, d)),
      tmax:   num(serie.tmax[i]),
      tmin:   num(serie.tmin[i]),
      precip: num(serie.precip[i]),
      et0:    num(serie.et0[i]),
    });
  }
  if (regs.length < 365) return null;

  const anioMin = regs[0]!.y;
  const anioMax = regs[regs.length - 1]!.y;
  const aniosSet = new Set(regs.map(r => r.y));
  const anios = aniosSet.size;

  // ── Heladas (tmin ≤ 0). Temporada de crecimiento = verano (cruza el año). ──
  const UMBRAL = 0;
  const heladas = regs.filter(r => !Number.isNaN(r.tmin) && r.tmin <= UMBRAL);
  let heladasStats: HeladasStats;

  if (heladas.length === 0) {
    heladasStats = { hay_heladas: false, umbral_c: UMBRAL, dias_helada_anio: 0, ultima_helada: null, primera_helada: null, periodo_libre_dias: null };
  } else {
    // "última helada" = última del semestre frío que va hacia el verano (jul–dic).
    // "primera helada" = primera del semestre que sale del verano (ene–jun).
    // Se emparejan por temporada g: jul(g)…jun(g+1).
    const ultimasSpring: Array<{ off: number; fecha: Date }> = [];  // off = días desde 1-jul
    const primerasAutumn: Array<{ off: number; fecha: Date }> = []; // off = días desde 1-ene
    const libres: number[] = [];

    for (let g = anioMin; g <= anioMax; g++) {
      const spring = heladas.filter(r => (r.y === g && r.m >= 7));
      const autumn = heladas.filter(r => (r.y === g + 1 && r.m <= 6));
      let ultima: Date | null = null, primera: Date | null = null;
      if (spring.length) ultima = spring.reduce((a, b) => (b.fecha > a.fecha ? b : a)).fecha;
      if (autumn.length) primera = autumn.reduce((a, b) => (b.fecha < a.fecha ? b : a)).fecha;

      if (ultima) {
        const jul1 = Date.UTC(g, 6, 1);
        ultimasSpring.push({ off: (ultima.getTime() - jul1) / 86_400_000, fecha: ultima });
      }
      if (primera) {
        const ene1 = Date.UTC(g + 1, 0, 1);
        primerasAutumn.push({ off: (primera.getTime() - ene1) / 86_400_000, fecha: primera });
      }
      if (ultima && primera) libres.push((primera.getTime() - ultima.getTime()) / 86_400_000);
    }

    const fechaDesde = (base: 'jul' | 'ene', off: number): string => {
      const ref = base === 'jul' ? Date.UTC(2001, 6, 1) : Date.UTC(2002, 0, 1);
      return fmtDia(new Date(ref + off * 86_400_000));
    };
    const pFecha = (arr: Array<{ off: number }>, base: 'jul' | 'ene'): PercentilFecha | null => {
      if (arr.length < 3) return null;
      const offs = arr.map(a => a.off);
      return {
        p10: fechaDesde(base, percentil(offs, 10)),
        p50: fechaDesde(base, percentil(offs, 50)),
        p90: fechaDesde(base, percentil(offs, 90)),
      };
    };

    heladasStats = {
      hay_heladas:        true,
      umbral_c:           UMBRAL,
      dias_helada_anio:   Math.round((heladas.length / anios) * 10) / 10,
      ultima_helada:      pFecha(ultimasSpring, 'jul'),
      primera_helada:     pFecha(primerasAutumn, 'ene'),
      periodo_libre_dias: libres.length >= 3
        ? { p10: Math.round(percentil(libres, 10)), p50: Math.round(percentil(libres, 50)), p90: Math.round(percentil(libres, 90)) }
        : null,
    };
  }

  // ── Tormenta de diseño: Gumbel sobre máximos anuales de lluvia diaria ──
  const maxPorAnio = new Map<number, number>();
  for (const r of regs) {
    if (Number.isNaN(r.precip)) continue;
    const prev = maxPorAnio.get(r.y) ?? 0;
    if (r.precip > prev) maxPorAnio.set(r.y, r.precip);
  }
  const maximos = [...maxPorAnio.values()].filter(v => v > 0);
  const mMax = media(maximos);
  const sMax = desvio(maximos);
  const beta  = sMax * Math.sqrt(6) / Math.PI;
  const mu    = mMax - 0.5772156649 * beta;
  const tormenta: TormentaDiseno = {
    metodo:              'Gumbel (momentos) sobre máximos anuales de P24h',
    p24h_max_registrada: Math.round(Math.max(...maximos, 0) * 10) / 10,
    recurrencias: [2, 5, 10, 25, 50, 100].map(T => {
      const yT = -Math.log(-Math.log(1 - 1 / T));
      return { periodo_retorno: T, mm: Math.max(0, Math.round((mu + beta * yT) * 10) / 10) };
    }),
  };

  // ── Rachas secas (precip < 1 mm) ──
  let rachaAct = 0, rachaMaxGlobal = 0;
  const rachaMaxAnio = new Map<number, number>();
  for (const r of regs) {
    const seco = Number.isNaN(r.precip) ? false : r.precip < 1;
    if (seco) {
      rachaAct++;
      if (rachaAct > rachaMaxGlobal) rachaMaxGlobal = rachaAct;
      const prev = rachaMaxAnio.get(r.y) ?? 0;
      if (rachaAct > prev) rachaMaxAnio.set(r.y, rachaAct);
    } else {
      rachaAct = 0;
    }
  }
  const rachasAnuales = [...rachaMaxAnio.values()];

  // ── Precipitación anual + CV ──
  const totalPorAnio = new Map<number, number>();
  const et0PorAnio   = new Map<number, number>();
  const conteoAnio   = new Map<number, number>();
  for (const r of regs) {
    if (!Number.isNaN(r.precip)) totalPorAnio.set(r.y, (totalPorAnio.get(r.y) ?? 0) + r.precip);
    if (!Number.isNaN(r.et0))    et0PorAnio.set(r.y, (et0PorAnio.get(r.y) ?? 0) + r.et0);
    conteoAnio.set(r.y, (conteoAnio.get(r.y) ?? 0) + 1);
  }
  // Solo años (casi) completos para totales anuales
  const aniosCompletos = [...conteoAnio.entries()].filter(([, c]) => c >= 350).map(([y]) => y);
  const totales = aniosCompletos.map(y => totalPorAnio.get(y) ?? 0).filter(v => v > 0);
  const et0s    = aniosCompletos.map(y => et0PorAnio.get(y) ?? 0).filter(v => v > 0);
  const mTot = media(totales);
  const cv   = mTot > 0 ? (desvio(totales) / mTot) * 100 : 0;

  // ── Calor ──
  let d35 = 0, d40 = 0;
  for (const r of regs) {
    if (Number.isNaN(r.tmax)) continue;
    if (r.tmax >= 35) d35++;
    if (r.tmax >= 40) d40++;
  }

  return {
    fuente:      meta.fuente ?? 'Open-Meteo / ERA5 (reanálisis, ~10 km)',
    periodo:     `${anioMin}–${anioMax}`,
    anios,
    elevacion_m: meta.elevacion_m ?? null,
    heladas:     heladasStats,
    tormenta,
    sequia: {
      racha_max_dias:  rachaMaxGlobal,
      racha_anual_p50: Math.round(percentil(rachasAnuales, 50)),
      racha_anual_p90: Math.round(percentil(rachasAnuales, 90)),
    },
    precip_anual: {
      media_mm: Math.round(mTot),
      min_mm:   Math.round(Math.min(...totales, mTot)),
      max_mm:   Math.round(Math.max(...totales, mTot)),
      cv_pct:   Math.round(cv),
    },
    et0_anual_mm: Math.round(media(et0s)),
    calor: {
      dias_ge_35: Math.round((d35 / anios) * 10) / 10,
      dias_ge_40: Math.round((d40 / anios) * 10) / 10,
    },
  };
}

// ─── Fetch desde el cliente ────────────────────────────────────────────────────

export async function obtenerExtremos(lat: number, lng: number): Promise<Extremos> {
  const res = await fetch(`/api/clima-diario?lat=${lat}&lng=${lng}`, { signal: AbortSignal.timeout(45_000) });
  if (!res.ok) {
    const txt = await res.text().catch(() => res.statusText);
    let msg = txt;
    try { msg = (JSON.parse(txt) as { error?: string }).error ?? txt; } catch { /* texto plano */ }
    throw new Error(msg.slice(0, 160));
  }
  const data = await res.json() as Extremos;
  return data;
}
