/**
 * Datos climáticos históricos vía NASA POWER API (climatología 1981–2023).
 * Sin clave de API — uso libre, fuente NASA.
 * ETP calculada con la fórmula de Hargreaves (sólo necesita T_max, T_min, latitud).
 * Clasificación Köppen-Geiger según Peel et al. (2007).
 * Resultados son valores promedio históricos — orientativos, no de precisión agronómica.
 */

export const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'] as const;
export type MesIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export interface MesDato {
  mes: string;
  precip_mm: number;   // precipitación mensual media (mm)
  tmax_c:    number;   // temperatura máxima media (°C)
  tmin_c:    number;   // temperatura mínima media (°C)
  tmean_c:   number;   // temperatura media (°C)
  etp_mm:    number;   // ETP mensual Hargreaves (mm)
  balance_mm: number;  // balance hídrico = precip - ETP (mm)
  viento_ms: number;   // viento medio (m/s)
  // ── Nuevos (ola 2) ──
  viento_max_ms?: number;  // racha/viento máximo (m/s)
  viento_dir?:    string;  // dirección predominante del mes (rumbo N, NE, …)
  viento_dir_deg?: number; // dirección en grados
  rh_pct?:    number;  // humedad relativa media (%)
  rocio_c?:   number;  // punto de rocío (°C)
  t_range_c?: number;  // amplitud térmica diaria media (°C)
  rad_kwh?:   number;  // radiación solar incidente (kWh/m²/día)
  helada_riesgo?: boolean; // riesgo de helada (tmin medio ≤ 3 °C)
}

export interface Koppen {
  codigo: string;       // ej. 'BSk'
  grupo: string;        // ej. 'Árido'
  descripcion: string;  // ej. 'Estepa fría (semiárido frío)'
}

export interface IndiceAridez {
  valor: number;        // P / ETP anual
  clase: string;        // 'Árido', 'Semiárido', …
}

export interface Heladas {
  meses_riesgo: string[];   // meses con tmin medio ≤ 3 °C
  meses_seguras: string[];  // meses con tmin medio ≤ 0 °C
  periodo_libre: string;    // descripción del período libre de heladas
}

export interface DatosClima {
  lat: number;
  lng: number;
  precip_anual_mm: number;
  etp_anual_mm:    number;
  tmean_anual_c:   number;
  viento_dir_ppal: string;   // dirección predominante del viento (N, NE, E...)
  meses: MesDato[];
  fuente: string;
  weather_spark_url: string;
  // ── Nuevos (ola 2) ──
  rh_anual_pct?:    number;  // humedad relativa media anual (%)
  rad_anual_kwh?:   number;  // radiación media anual (kWh/m²/día)
  amplitud_anual_c?: number; // amplitud térmica media anual (°C)
  viento_medio_ms?: number;  // viento medio anual (m/s)
  viento_max_ms?:   number;  // viento máximo registrado (m/s)
  koppen?:          Koppen;
  aridez?:          IndiceAridez;
  gdd_anual?:       number;  // grados-día de crecimiento base 10 °C
  heladas?:         Heladas;
  mes_mas_seco?:    string;
  mes_mas_humedo?:  string;
  /** Presente si la precipitación fue calibrada con un dato local. */
  calibracion?:     CalibracionPrecip;
}

/**
 * Calibración manual de la precipitación con un dato local conocido.
 *
 * Por qué: la lluvia de los reanálisis de grilla gruesa (NASA POWER ~50 km,
 * ERA5 ~9-30 km) borra el efecto orográfico. Medido en Aguas Buenas (PR): la
 * grilla da 1121 mm/año donde llueven ~1879 mm (0.60×). El sesgo es errático
 * según el sitio (0.58× a 1.42× en 5 climas probados), así que no hay factor
 * global posible: lo resuelve el dato de la estación que conoce el profesional.
 */
export interface CalibracionPrecip {
  modo:        'anual' | 'mensual';
  anual_mm?:   number;    // total anual conocido → re-escala la curva mensual
  mensual_mm?: number[];  // 12 valores, si se tienen
  fuente?:     string;    // "Estación X (INTA)" — queda registrado en el informe
  /** `chirps` la puso la app sola; `manual` la cargó el usuario y manda. */
  origen?:     'manual' | 'chirps';
}

// ─── CHIRPS (~5 km) ───────────────────────────────────────────────────────────

interface RespuestaCHIRPS {
  estado:   'listo' | 'procesando' | 'no_disponible' | 'error';
  meses?:   number[];
  anual?:   number;
  años?:    number;
  fuente?:  string;
  job?:     string;
  progreso?: number;
}

/**
 * Precipitación mensual de CHIRPS, como calibración lista para aplicar.
 *
 * La lluvia de NASA POWER viene de una grilla de ~50 km y subestima mucho en
 * terreno quebrado (medido: 0.60x en Aguas Buenas, PR). CHIRPS trae ~5 km y da
 * en el clavo (1.01x ahí, 0.96x en Córdoba, 1.00x en Mendoza).
 *
 * La primera consulta de una zona encola un trabajo en ClimateSERV y puede
 * tardar minutos; después queda cacheada y es instantánea. Devuelve `null` si
 * no hay dato (fuera de 50°S–50°N, o si tarda demasiado): el llamador se queda
 * con POWER, que es peor pero existe.
 */
export async function obtenerPrecipCHIRPS(
  lat: number,
  lng: number,
  opts: { señal?: AbortSignal; onProgreso?: (pct: number) => void } = {},
): Promise<CalibracionPrecip | null> {
  const base = `/api/precipitacion?lat=${lat.toFixed(4)}&lng=${lng.toFixed(4)}`;
  const espera = (ms: number) => new Promise(r => setTimeout(r, ms));
  let job: string | undefined;

  // ~2 min de paciencia: alcanza para un trabajo nuevo sin dejar la promesa colgada.
  for (let intento = 0; intento < 25; intento++) {
    if (opts.señal?.aborted) return null;
    let r: RespuestaCHIRPS;
    try {
      const res = await fetch(job ? `${base}&job=${job}` : base, { signal: opts.señal });
      r = await res.json() as RespuestaCHIRPS;
    } catch {
      return null;
    }

    if (r.estado === 'listo' && r.meses?.length === 12) {
      return { modo: 'mensual', mensual_mm: r.meses, fuente: r.fuente ?? 'CHIRPS ~5 km', origen: 'chirps' };
    }
    if (r.estado !== 'procesando') return null;

    job = r.job ?? job;
    opts.onProgreso?.(r.progreso ?? 0);
    await espera(5000);
  }
  return null;
}

// ─── NASA POWER API ───────────────────────────────────────────────────────────

interface PowerResponse {
  properties: {
    parameter: Record<string, Record<string, number>>;
  };
}

const DAYS_IN_MONTH = [31,28,31,30,31,30,31,31,30,31,30,31] as const;
const MONTH_KEYS    = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'] as const;

export async function obtenerClima(lat: number, lng: number): Promise<DatosClima> {
  const url = `/api/clima?lat=${lat.toFixed(4)}&lng=${lng.toFixed(4)}`;

  const res = await fetch(url, { signal: AbortSignal.timeout(35_000) });
  // Si NASA (o el gateway de Vercel por timeout) devuelve un body vacío o no-JSON,
  // res.json() tira "Unexpected end of JSON input". Lo traducimos a algo accionable.
  let json: PowerResponse & { error?: string };
  try {
    json = await res.json() as PowerResponse & { error?: string };
  } catch {
    throw new Error(
      res.ok
        ? 'El servidor de clima (NASA POWER) tardó demasiado. Reintentá en unos segundos.'
        : `El servidor de clima respondió ${res.status}. Reintentá en unos segundos.`,
    );
  }
  if (json.error) throw new Error(json.error);
  if (!res.ok) throw new Error(`NASA POWER respondió con error ${res.status}.`);
  const param = json.properties.parameter;

  const precip  = param['PRECTOTCORR'] ?? {};
  const tmean   = param['T2M'] ?? {};
  const tmax    = param['T2M_MAX'] ?? {};
  const tmin    = param['T2M_MIN'] ?? {};
  const viento  = param['WS10M'] ?? {};
  const vientoMx= param['WS10M_MAX'] ?? {};
  const wdir    = param['WD10M'] ?? {};
  const rh      = param['RH2M'] ?? {};
  const rocio   = param['T2MDEW'] ?? {};
  const trange  = param['T2M_RANGE'] ?? {};
  const rad     = param['ALLSKY_SFC_SW_DWN'] ?? {};

  const meses: MesDato[] = MONTH_KEYS.map((key, i) => {
    const days    = DAYS_IN_MONTH[i] ?? 30;
    const precip_mm = (precip[key] ?? 0) * days;  // mm/día → mm/mes
    const tmax_c    = tmax[key] ?? 0;
    const tmin_c    = tmin[key] ?? 0;
    const tmean_c   = tmean[key] ?? (tmax_c + tmin_c) / 2;
    const viento_ms = viento[key] ?? 0;
    const etp_mm    = calcularETPHargreaves(lat, i as MesIndex, tmax_c, tmin_c, tmean_c);
    const dirDeg    = wdir[key];
    return {
      mes: MESES[i] ?? key,
      precip_mm: Math.round(precip_mm * 10) / 10,
      tmax_c:    Math.round(tmax_c    * 10) / 10,
      tmin_c:    Math.round(tmin_c    * 10) / 10,
      tmean_c:   Math.round(tmean_c   * 10) / 10,
      viento_ms: Math.round(viento_ms * 10) / 10,
      etp_mm:    Math.round(etp_mm    * 10) / 10,
      balance_mm: Math.round((precip_mm - etp_mm) * 10) / 10,
      viento_max_ms:  vientoMx[key] !== undefined ? Math.round(vientoMx[key]! * 10) / 10 : undefined,
      viento_dir:     dirDeg !== undefined ? gradosADireccion(dirDeg) : undefined,
      viento_dir_deg: dirDeg !== undefined ? Math.round(dirDeg) : undefined,
      rh_pct:    rh[key]     !== undefined ? Math.round(rh[key]!) : undefined,
      rocio_c:   rocio[key]  !== undefined ? Math.round(rocio[key]!  * 10) / 10 : undefined,
      t_range_c: trange[key] !== undefined ? Math.round(trange[key]! * 10) / 10 : undefined,
      rad_kwh:   rad[key]    !== undefined ? Math.round(rad[key]!    * 100) / 100 : undefined,
      helada_riesgo: tmin_c <= 3,
    };
  });

  // Dirección predominante del viento (promedio anual de dirección)
  const wdirAnual = wdir['ANN'] ?? wdir['JAN'] ?? 180;
  const viento_dir_ppal = gradosADireccion(wdirAnual);

  const precip_anual_mm = Math.round(meses.reduce((s, m) => s + m.precip_mm, 0));
  const etp_anual_mm    = Math.round(meses.reduce((s, m) => s + m.etp_mm,    0));
  const tmean_anual_c   = Math.round(
    (meses.reduce((s, m) => s + m.tmean_c, 0) / 12) * 10,
  ) / 10;

  // ── Agregados nuevos ──
  const prom = (vals: Array<number | undefined>) => {
    const xs = vals.filter((v): v is number => v !== undefined);
    return xs.length ? xs.reduce((s, v) => s + v, 0) / xs.length : undefined;
  };
  const rh_anual_pct    = redondear(prom(meses.map(m => m.rh_pct)), 0);
  const rad_anual_kwh   = redondear(prom(meses.map(m => m.rad_kwh)), 2);
  const amplitud_anual_c= redondear(prom(meses.map(m => m.t_range_c)), 1);
  const viento_medio_ms = redondear(prom(meses.map(m => m.viento_ms)), 1);
  const viento_max_ms   = redondear(Math.max(...meses.map(m => m.viento_max_ms ?? m.viento_ms)), 1);

  const koppen = clasificarKoppen(lat, meses);
  const aridez = clasificarAridez(precip_anual_mm, etp_anual_mm);
  const gdd_anual = Math.round(
    meses.reduce((s, m, i) => s + Math.max(m.tmean_c - 10, 0) * (DAYS_IN_MONTH[i] ?? 30), 0),
  );
  const heladas = estimarHeladas(meses, lat);

  const mesSeco   = meses.reduce((min, m) => (m.precip_mm < min.precip_mm ? m : min), meses[0]!);
  const mesHumedo = meses.reduce((max, m) => (m.precip_mm > max.precip_mm ? m : max), meses[0]!);

  return {
    lat, lng,
    precip_anual_mm, etp_anual_mm, tmean_anual_c, viento_dir_ppal,
    meses,
    fuente: 'NASA POWER Climatology (promedio 1981–2023)',
    weather_spark_url: `https://weatherspark.com/y/${encodeURIComponent(`${lat.toFixed(2)},${lng.toFixed(2)}`)}`,
    rh_anual_pct, rad_anual_kwh, amplitud_anual_c, viento_medio_ms, viento_max_ms,
    koppen, aridez, gdd_anual, heladas,
    mes_mas_seco:   mesSeco.mes,
    mes_mas_humedo: mesHumedo.mes,
  };
}

/**
 * Devuelve una copia de los datos con la precipitación calibrada y **todo lo
 * derivado recomputado**: balance mensual, total anual, aridez, Köppen y meses
 * extremos (todos dependen de la lluvia).
 *
 * Aplicar SIEMPRE sobre los datos crudos: si se encadena sobre un resultado ya
 * calibrado, el factor se multiplica de nuevo.
 */
export function aplicarCalibracionPrecip(
  d: DatosClima,
  cal: CalibracionPrecip | null | undefined,
): DatosClima {
  if (!cal) return d;
  const r1 = (v: number) => Math.round(v * 10) / 10;

  let meses: MesDato[];
  if (cal.modo === 'mensual' && cal.mensual_mm?.length === 12) {
    meses = d.meses.map((m, i) => {
      const p = Math.max(cal.mensual_mm![i] ?? 0, 0);
      return { ...m, precip_mm: r1(p), balance_mm: r1(p - m.etp_mm) };
    });
  } else if (cal.modo === 'anual' && cal.anual_mm && cal.anual_mm > 0 && d.precip_anual_mm > 0) {
    const factor = cal.anual_mm / d.precip_anual_mm;
    meses = d.meses.map(m => {
      const p = m.precip_mm * factor;
      return { ...m, precip_mm: r1(p), balance_mm: r1(p - m.etp_mm) };
    });
  } else {
    return d;
  }

  const precip_anual_mm = Math.round(meses.reduce((s, m) => s + m.precip_mm, 0));
  const mesSeco   = meses.reduce((min, m) => (m.precip_mm < min.precip_mm ? m : min), meses[0]!);
  const mesHumedo = meses.reduce((max, m) => (m.precip_mm > max.precip_mm ? m : max), meses[0]!);

  return {
    ...d,
    meses,
    precip_anual_mm,
    koppen: clasificarKoppen(d.lat, meses),
    aridez: clasificarAridez(precip_anual_mm, d.etp_anual_mm),
    mes_mas_seco:   mesSeco.mes,
    mes_mas_humedo: mesHumedo.mes,
    calibracion: cal,
    fuente: `${d.fuente} · precipitación calibrada${cal.fuente ? ` con ${cal.fuente}` : ''}`,
  };
}

function redondear(v: number | undefined, dec: number): number | undefined {
  if (v === undefined || !Number.isFinite(v)) return undefined;
  const f = 10 ** dec;
  return Math.round(v * f) / f;
}

// ─── ETP Hargreaves ───────────────────────────────────────────────────────────

/**
 * ETP mensual con la fórmula de Hargreaves (1985).
 * ETP = 0.0023 × Ra × (Tmax−Tmin)^0.5 × (Tmean+17.8) × días_mes
 * Ra = radiación extraterrestre [MJ/m²/día] calculada para el 15 de cada mes.
 */
function calcularETPHargreaves(
  lat_deg: number,
  mes: MesIndex,
  tmax: number,
  tmin: number,
  tmean: number,
): number {
  const days   = DAYS_IN_MONTH[mes] ?? 30;
  const Ra     = radiacionExtraterrestre(lat_deg, mes); // MJ/m²/día
  const Ra_mm  = Ra / 2.45; // → mm/día equivalente de agua (Hargreaves usa esta unidad)
  const tdiff  = Math.max(tmax - tmin, 0);
  // ETP diaria en mm → multiplicar por días del mes
  const etp_diaria = 0.0023 * Ra_mm * Math.pow(tdiff, 0.5) * (tmean + 17.8);
  return Math.max(etp_diaria * days, 0);
}

/**
 * Ra [MJ/m²/día] para el día 15 de cada mes.
 * Fórmula FAO-56 (Allen et al. 1998).
 */
function radiacionExtraterrestre(lat_deg: number, mes: MesIndex): number {
  const Gsc = 0.082;  // constante solar MJ/m²/min
  const DOY_MID = [17,47,75,105,135,162,198,228,259,289,319,345] as const;
  const doy = DOY_MID[mes] ?? 180;

  const phi = (lat_deg * Math.PI) / 180;
  const dr  = 1 + 0.033 * Math.cos((2 * Math.PI * doy) / 365);
  const delta = 0.409 * Math.sin((2 * Math.PI * doy) / 365 - 1.39);

  const cosWs = -Math.tan(phi) * Math.tan(delta);
  // Clamp para evitar acos fuera de rango (latitudes extremas)
  const ws = Math.acos(Math.max(-1, Math.min(1, cosWs)));

  const Ra =
    (24 * 60) / Math.PI *
    Gsc * dr *
    (ws * Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.sin(ws));

  return Math.max(Ra, 0);
}

// ─── Köppen-Geiger (Peel et al. 2007) ─────────────────────────────────────────

const KOPPEN_DESC: Record<string, { grupo: string; desc: string }> = {
  Af:  { grupo: 'Tropical',    desc: 'Selva tropical lluviosa' },
  Am:  { grupo: 'Tropical',    desc: 'Monzónico tropical' },
  Aw:  { grupo: 'Tropical',    desc: 'Sabana tropical (invierno seco)' },
  As:  { grupo: 'Tropical',    desc: 'Sabana tropical (verano seco)' },
  BWh: { grupo: 'Árido',       desc: 'Desierto cálido' },
  BWk: { grupo: 'Árido',       desc: 'Desierto frío' },
  BSh: { grupo: 'Árido',       desc: 'Estepa cálida (semiárido cálido)' },
  BSk: { grupo: 'Árido',       desc: 'Estepa fría (semiárido frío)' },
  Csa: { grupo: 'Templado',    desc: 'Mediterráneo de verano cálido' },
  Csb: { grupo: 'Templado',    desc: 'Mediterráneo de verano templado' },
  Csc: { grupo: 'Templado',    desc: 'Mediterráneo de verano fresco' },
  Cwa: { grupo: 'Templado',    desc: 'Subtropical húmedo de invierno seco' },
  Cwb: { grupo: 'Templado',    desc: 'Subtropical de altura, invierno seco' },
  Cwc: { grupo: 'Templado',    desc: 'Templado frío de invierno seco' },
  Cfa: { grupo: 'Templado',    desc: 'Subtropical húmedo sin estación seca' },
  Cfb: { grupo: 'Templado',    desc: 'Oceánico templado' },
  Cfc: { grupo: 'Templado',    desc: 'Oceánico subpolar' },
  Dsa: { grupo: 'Continental', desc: 'Continental, verano seco y cálido' },
  Dsb: { grupo: 'Continental', desc: 'Continental, verano seco templado' },
  Dwa: { grupo: 'Continental', desc: 'Continental, invierno seco y cálido' },
  Dwb: { grupo: 'Continental', desc: 'Continental, invierno seco templado' },
  Dfa: { grupo: 'Continental', desc: 'Continental húmedo, verano cálido' },
  Dfb: { grupo: 'Continental', desc: 'Continental húmedo, verano templado' },
  Dfc: { grupo: 'Continental', desc: 'Subártico (taiga)' },
  ET:  { grupo: 'Polar',       desc: 'Tundra / altoandino' },
  EF:  { grupo: 'Polar',       desc: 'Hielo permanente' },
};

/** Clasifica el clima según Köppen-Geiger a partir de las medias mensuales. */
export function clasificarKoppen(lat: number, meses: MesDato[]): Koppen {
  const T = meses.map(m => m.tmean_c);
  const P = meses.map(m => m.precip_mm);
  const Pann = P.reduce((s, v) => s + v, 0);
  const Tann = T.reduce((s, v) => s + v, 0) / 12;
  const Thot = Math.max(...T);
  const Tcold = Math.min(...T);
  const Pdry = Math.min(...P);
  const mesesCalidos = T.filter(t => t >= 10).length;

  // Hemisferio: en el sur el verano es ONDEFM (índices 9,10,11,0,1,2)
  const sur = lat < 0;
  const idxVerano = sur ? [9,10,11,0,1,2] : [3,4,5,6,7,8];
  const idxInvierno = sur ? [3,4,5,6,7,8] : [9,10,11,0,1,2];
  const Pverano   = idxVerano.reduce((s, i) => s + (P[i] ?? 0), 0);
  const Pinvierno = idxInvierno.reduce((s, i) => s + (P[i] ?? 0), 0);
  const PsumDry = Math.min(...idxVerano.map(i => P[i] ?? 0));
  const PsumWet = Math.max(...idxVerano.map(i => P[i] ?? 0));
  const PwinDry = Math.min(...idxInvierno.map(i => P[i] ?? 0));
  const PwinWet = Math.max(...idxInvierno.map(i => P[i] ?? 0));

  // Umbral de aridez Pth
  let Pth: number;
  if (Pinvierno >= 0.7 * Pann)      Pth = 2 * Tann;
  else if (Pverano >= 0.7 * Pann)   Pth = 2 * Tann + 28;
  else                              Pth = 2 * Tann + 14;

  let codigo: string;

  // B — Árido
  if (Pann < 10 * Pth) {
    const segundo = Pann < 5 * Pth ? 'W' : 'S';
    const tercero = Tann >= 18 ? 'h' : 'k';
    codigo = `B${segundo}${tercero}`;
  }
  // A — Tropical
  else if (Tcold >= 18) {
    if (Pdry >= 60) codigo = 'Af';
    else if (Pdry >= 100 - Pann / 25) codigo = 'Am';
    else codigo = Pverano >= Pinvierno ? 'Aw' : 'As';
  }
  // C — Templado
  else if (Thot > 10 && Tcold > 0 && Tcold < 18) {
    let p = 'f';
    if (PsumDry < 40 && PsumDry < PwinWet / 3) p = 's';
    else if (PwinDry < PsumWet / 10) p = 'w';
    const t = Thot >= 21 ? 'a' : mesesCalidos >= 4 ? 'b' : 'c';
    codigo = `C${p}${t}`;
  }
  // D — Continental
  else if (Thot > 10 && Tcold <= 0) {
    let p = 'f';
    if (PsumDry < 40 && PsumDry < PwinWet / 3) p = 's';
    else if (PwinDry < PsumWet / 10) p = 'w';
    const t = Thot >= 21 ? 'a' : mesesCalidos >= 4 ? 'b' : Tcold < -38 ? 'd' : 'c';
    codigo = `D${p}${t}`;
  }
  // E — Polar / altoandino
  else {
    codigo = Thot > 0 ? 'ET' : 'EF';
  }

  const info = KOPPEN_DESC[codigo] ?? { grupo: '—', desc: codigo };
  return { codigo, grupo: info.grupo, descripcion: info.desc };
}

// ─── Índice de aridez (UNEP) ──────────────────────────────────────────────────

export function clasificarAridez(precipAnual: number, etpAnual: number): IndiceAridez {
  const valor = etpAnual > 0 ? precipAnual / etpAnual : 0;
  let clase: string;
  if (valor < 0.03)      clase = 'Hiperárido';
  else if (valor < 0.2)  clase = 'Árido';
  else if (valor < 0.5)  clase = 'Semiárido';
  else if (valor < 0.65) clase = 'Seco subhúmedo';
  else if (valor < 1)    clase = 'Subhúmedo';
  else                   clase = 'Húmedo';
  return { valor: Math.round(valor * 100) / 100, clase };
}

// ─── Heladas ──────────────────────────────────────────────────────────────────

/** Corrida contigua más larga de meses sin riesgo de helada (tmin > 3 °C),
 *  con el año tratado como cíclico (el verano austral cruza dic→ene). */
function corridaLibreMasLarga(meses: MesDato[]): { ini: string; fin: string; meses: number } | null {
  const n = meses.length;
  const ok = meses.map(m => m.tmin_c > 3);
  if (!ok.some(Boolean)) return null;
  if (ok.every(Boolean)) return { ini: meses[0]!.mes, fin: meses[n - 1]!.mes, meses: n };

  let mejorIni = -1, mejorLen = 0, ini = -1, len = 0;
  // Recorremos 2n para permitir corridas que envuelven el fin de año.
  for (let k = 0; k < 2 * n; k++) {
    const idx = k % n;
    if (ok[idx]) {
      if (len === 0) ini = idx;
      len++;
      if (len > mejorLen && len <= n) { mejorLen = len; mejorIni = ini; }
    } else {
      len = 0;
    }
  }
  const fin = (mejorIni + mejorLen - 1) % n;
  return { ini: meses[mejorIni]!.mes, fin: meses[fin]!.mes, meses: mejorLen };
}

function estimarHeladas(meses: MesDato[], lat: number): Heladas {
  const meses_riesgo  = meses.filter(m => m.tmin_c <= 3).map(m => m.mes);
  const meses_seguras = meses.filter(m => m.tmin_c <= 0).map(m => m.mes);

  let periodo_libre: string;
  if (meses_riesgo.length === 0)      periodo_libre = 'Sin riesgo significativo de heladas (todo el año).';
  else if (meses_riesgo.length >= 11) periodo_libre = 'Riesgo de heladas prácticamente todo el año (clima frío de altura).';
  else {
    // El período libre se define como la corrida CONTIGUA más larga de meses
    // sin riesgo (tmin > 3 °C), tratando el año como cíclico: en el hemisferio
    // sur el verano cruza el fin de año (p. ej. Nov–Mar). Tomar el primer y el
    // último mes libre en orden de calendario daba "Ene–Dic" —todo el año—
    // aunque el medio tuviera riesgo, contradiciendo `meses_riesgo`.
    const r = corridaLibreMasLarga(meses);
    periodo_libre = r
      ? `Período libre de heladas aproximado: ${r.ini}–${r.fin} (~${r.meses} meses).`
      : 'Período libre de heladas muy acotado.';
  }
  void lat;
  return { meses_riesgo, meses_seguras, periodo_libre };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const RUMBOS_VIENTO = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSO','SO','OSO','O','ONO','NO','NNO'] as const;

function gradosADireccion(grados: number): string {
  const idx = Math.round(((grados % 360) + 360) % 360 / 22.5) % 16;
  return RUMBOS_VIENTO[idx] ?? 'N';
}

/** Calcula el centroide geográfico de una lista de puntos. */
export function centroide(puntos: Array<{ lat: number; lng: number }>): { lat: number; lng: number } {
  if (puntos.length === 0) return { lat: -30.8, lng: -64.7 };
  return {
    lat: puntos.reduce((s, p) => s + p.lat, 0) / puntos.length,
    lng: puntos.reduce((s, p) => s + p.lng, 0) / puntos.length,
  };
}

/** Construye la URL de Weather Spark a partir de coordenadas. */
export function weatherSparkURL(lat: number, lng: number): string {
  // Weather Spark indexa por ciudad/región; la URL más directa es por coordenadas
  // aproximadas. Si el lugar no existe, redirige a la ciudad más cercana.
  return `https://weatherspark.com/map#key=0&lat=${lat.toFixed(3)}&lng=${lng.toFixed(3)}&metric=true`;
}
