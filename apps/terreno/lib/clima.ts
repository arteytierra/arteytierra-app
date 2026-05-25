/**
 * Datos climáticos históricos vía NASA POWER API (climatología 1981–2023).
 * Sin clave de API — uso libre, fuente NASA.
 * ETP calculada con la fórmula de Hargreaves (sólo necesita T_max, T_min, latitud).
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
}

// ─── NASA POWER API ───────────────────────────────────────────────────────────

type PowerParameters =
  'PRECTOTCORR' |     // precipitación mm/día
  'T2M' |             // temperatura media 2m °C
  'T2M_MAX' |         // temperatura máx 2m °C
  'T2M_MIN' |         // temperatura mín 2m °C
  'WS10M' |           // viento medio 10m m/s
  'WD10M';            // dirección viento 10m grados

interface PowerResponse {
  properties: {
    parameter: Record<string, Record<string, number>>;
  };
}

const DAYS_IN_MONTH = [31,28,31,30,31,30,31,31,30,31,30,31] as const;
const MONTH_KEYS    = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'] as const;

export async function obtenerClima(lat: number, lng: number): Promise<DatosClima> {
  const params: PowerParameters[] = ['PRECTOTCORR','T2M','T2M_MAX','T2M_MIN','WS10M','WD10M'];
  const url =
    'https://power.larc.nasa.gov/api/temporal/climatology/point' +
    `?parameters=${params.join(',')}` +
    `&community=AG` +
    `&longitude=${lng.toFixed(4)}` +
    `&latitude=${lat.toFixed(4)}` +
    `&format=JSON`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`NASA POWER respondió con error ${res.status}.`);

  const json: PowerResponse = await res.json();
  const param = json.properties.parameter;

  const precip = param['PRECTOTCORR'] ?? {};
  const tmean  = param['T2M'] ?? {};
  const tmax   = param['T2M_MAX'] ?? {};
  const tmin   = param['T2M_MIN'] ?? {};
  const viento = param['WS10M'] ?? {};
  const wdir   = param['WD10M'] ?? {};

  const meses: MesDato[] = MONTH_KEYS.map((key, i) => {
    const days    = DAYS_IN_MONTH[i] ?? 30;
    const precip_mm = (precip[key] ?? 0) * days;  // mm/día → mm/mes
    const tmax_c    = tmax[key] ?? 0;
    const tmin_c    = tmin[key] ?? 0;
    const tmean_c   = tmean[key] ?? (tmax_c + tmin_c) / 2;
    const viento_ms = viento[key] ?? 0;
    const etp_mm    = calcularETPHargreaves(lat, i as MesIndex, tmax_c, tmin_c, tmean_c);
    return {
      mes: MESES[i] ?? key,
      precip_mm: Math.round(precip_mm * 10) / 10,
      tmax_c:    Math.round(tmax_c    * 10) / 10,
      tmin_c:    Math.round(tmin_c    * 10) / 10,
      tmean_c:   Math.round(tmean_c   * 10) / 10,
      viento_ms: Math.round(viento_ms * 10) / 10,
      etp_mm:    Math.round(etp_mm    * 10) / 10,
      balance_mm: Math.round((precip_mm - etp_mm) * 10) / 10,
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

  return {
    lat, lng,
    precip_anual_mm, etp_anual_mm, tmean_anual_c, viento_dir_ppal,
    meses,
    fuente: 'NASA POWER Climatology (promedio 1981–2023)',
    weather_spark_url: `https://weatherspark.com/y/${encodeURIComponent(`${lat.toFixed(2)},${lng.toFixed(2)}`)}`,
  };
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
  const days = DAYS_IN_MONTH[mes] ?? 30;
  const Ra = radiacionExtraterrestre(lat_deg, mes);
  const tdiff = Math.max(tmax - tmin, 0);
  // ETP diaria en mm → multiplicar por días del mes
  const etp_diaria = 0.0023 * Ra * Math.pow(tdiff, 0.5) * (tmean + 17.8);
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
