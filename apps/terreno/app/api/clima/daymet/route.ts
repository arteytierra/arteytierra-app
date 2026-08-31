import { SITE_ORIGIN } from '@/lib/http';
import { cacheGet, cacheSet } from '@/lib/db/cache';
import { requierePlan } from '@/lib/auth/apiGuard';
import type { MesDaymet } from '@/lib/clima';

/**
 * Daymet V4 R1 — clima diario de 1 km para Norteamérica (ORNL DAAC / NASA).
 *
 * Contra los ~50 km de NASA POWER, Daymet resuelve el relieve: en un valle de
 * montaña la grilla gruesa promedia la ladera con el fondo y borra justo la
 * diferencia que le importa a quien va a plantar ahí.
 *
 * El servicio devuelve series diarias, no climatología, así que acá se piden 30
 * años y se promedian mes a mes. Son ~11.000 filas, ~600 kB y unos 4 s; queda
 * cacheado 90 días porque la ventana sólo se corre una vez por año.
 *
 * Licencia: los datos del ORNL DAAC son de acceso libre y sin restricción de
 * uso, con pedido de citar. La cita viaja en el campo `fuente`.
 * https://daymet.ornl.gov/
 */

export const runtime = 'nodejs';
export const maxDuration = 60;

const HDRS      = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': SITE_ORIGIN };
const CACHE_TTL = 60 * 60 * 24 * 90;
const AÑOS      = 30;

/** Daymet usa siempre un año de 365 días: descarta el 31/12 en los bisiestos. */
const DIAS_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

function mesDelDiaJuliano(yday: number): number {
  let acum = 0;
  for (let m = 0; m < 12; m++) {
    acum += DIAS_MES[m]!;
    if (yday <= acum) return m;
  }
  return 11;
}

/** Presión de vapor de saturación (Pa) a T °C — Tetens, la misma base que FAO-56. */
function presionSaturacion(t: number): number {
  return 610.94 * Math.exp((17.625 * t) / (t + 243.04));
}

/** Punto de rocío a partir de la presión de vapor real (Pa) — Tetens invertida. */
function puntoDeRocio(vp_pa: number): number {
  const l = Math.log(Math.max(vp_pa, 1) / 610.94);
  return (243.04 * l) / (17.625 - l);
}

export async function GET(req: Request) {
  const bloqueo = await requierePlan('analisis.clima');
  if (bloqueo) return bloqueo;

  const p   = new URL(req.url).searchParams;
  const lat = p.get('lat');
  const lng = p.get('lng');
  if (!lat || !lng) return new Response('Missing lat/lng', { status: 400 });

  // 2 decimales (~1 km): es exactamente la celda de Daymet. Redondear más fino
  // multiplicaría las entradas de caché sin traer un dato distinto.
  const latR = parseFloat(lat).toFixed(2);
  const lngR = parseFloat(lng).toFixed(2);
  if (!isFinite(+latR) || !isFinite(+lngR)) return new Response('Bad lat/lng', { status: 400 });

  // Daymet publica con más de un año de retraso, así que la ventana termina dos
  // años atrás: pedir el año en curso devolvería la serie incompleta o vacía.
  const fin = new Date().getUTCFullYear() - 2;
  const ini = fin - (AÑOS - 1);

  const dbKey = `clima-daymet:${latR},${lngR}:${ini}-${fin}`;
  const hit   = await cacheGet<{ json: string }>(dbKey);
  if (hit?.json) return new Response(hit.json, { status: 200, headers: HDRS });

  const url = 'https://daymet.ornl.gov/single-pixel/api/data'
    + `?lat=${latR}&lon=${lngR}&vars=prcp,tmax,tmin,srad,vp,dayl`
    + `&start=${ini}-01-01&end=${fin}-12-31`;

  let res: Response;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(50_000) });
  } catch {
    return new Response(JSON.stringify({ error: 'Daymet no disponible.' }), { status: 503, headers: HDRS });
  }

  // Fuera de las celdas con dato (océano, o fuera de Norteamérica) Daymet
  // responde 400 con un mensaje. Eso no es un error nuestro: es "acá no hay
  // Daymet", y el cliente se queda con NASA POWER.
  if (res.status === 400) {
    return new Response(JSON.stringify({ sinDatos: true }), { status: 200, headers: HDRS });
  }
  if (!res.ok) {
    return new Response(JSON.stringify({ error: `Daymet respondió ${res.status}.` }), { status: res.status, headers: HDRS });
  }

  const csv    = await res.text();
  const lineas = csv.split(/\r?\n/);
  const iEnc   = lineas.findIndex(l => l.startsWith('year,yday'));
  if (iEnc < 0) return new Response(JSON.stringify({ sinDatos: true }), { status: 200, headers: HDRS });

  // Las columnas vienen con la unidad pegada al nombre ("prcp (mm/day)"), y el
  // orden no está garantizado: se buscan por prefijo en vez de por posición.
  const cols = lineas[iEnc]!.split(',');
  const col  = (pref: string) => cols.findIndex(c => c.trim().startsWith(pref));
  const iP = col('prcp'), iTx = col('tmax'), iTn = col('tmin'),
        iS = col('srad'), iV  = col('vp'),   iD  = col('dayl');
  if ([iP, iTx, iTn, iS, iV, iD].some(i => i < 0)) {
    return new Response(JSON.stringify({ error: 'Daymet cambió el formato de la tabla.' }), { status: 502, headers: HDRS });
  }

  const acum = Array.from({ length: 12 }, () => ({ p: 0, tx: 0, tn: 0, mj: 0, vp: 0, n: 0 }));
  const años = new Set<string>();

  for (let i = iEnc + 1; i < lineas.length; i++) {
    const f = lineas[i]!.split(',');
    if (f.length < cols.length) continue;
    const a = acum[mesDelDiaJuliano(+f[1]!)]!;
    a.p  += +f[iP]!;
    a.tx += +f[iTx]!;
    a.tn += +f[iTn]!;
    // srad viene en W/m² promediados sobre las horas de luz, no sobre el día
    // entero: para el total diario hay que multiplicarlo por la duración del día.
    a.mj += (+f[iS]! * +f[iD]!) / 1e6;
    a.vp += +f[iV]!;
    a.n++;
    años.add(f[0]!);
  }

  const n = años.size;
  if (n < 5 || acum.some(a => a.n === 0)) {
    return new Response(JSON.stringify({ sinDatos: true }), { status: 200, headers: HDRS });
  }

  const r = (v: number, dec = 1) => Math.round(v * 10 ** dec) / 10 ** dec;

  const meses: MesDaymet[] = acum.map(a => {
    const tmax_c  = a.tx / a.n;
    const tmin_c  = a.tn / a.n;
    const tmean_c = (tmax_c + tmin_c) / 2;
    const vp      = a.vp / a.n;
    return {
      // El acumulado es de los `n` años juntos: dividirlo da el mes medio.
      precip_mm: r(a.p / n),
      tmax_c:    r(tmax_c),
      tmin_c:    r(tmin_c),
      tmean_c:   r(tmean_c),
      t_range_c: r(tmax_c - tmin_c),
      rad_kwh:   r(a.mj / a.n / 3.6, 2),   // MJ/m²/día → kWh/m²/día
      rh_pct:    Math.min(100, Math.round((vp / presionSaturacion(tmean_c)) * 100)),
      rocio_c:   r(puntoDeRocio(vp)),
    };
  });

  const elev = /Elevation:\s*(-?\d+)/.exec(csv)?.[1];
  const json = JSON.stringify({
    meses,
    años:        n,
    elevacion_m: elev ? +elev : undefined,
    fuente: `Daymet V4 R1, celda de 1 km (promedio ${ini}–${fin}) — Thornton et al., ORNL DAAC`,
  });

  await cacheSet(dbKey, { json }, CACHE_TTL);
  return new Response(json, { status: 200, headers: HDRS });
}
