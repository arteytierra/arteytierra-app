import { cacheGet, cacheSet } from '@/lib/db/cache';
import { requierePlan } from '@/lib/auth/apiGuard';

/**
 * Precipitación mensual de CHIRPS (~5 km), vía la API de ClimateSERV (SERVIR).
 *
 * Por qué: la lluvia de NASA POWER viene de una grilla de ~50 km, que promedia
 * el relieve y subestima fuerte en terreno quebrado. Medido contra estaciones:
 *
 *   Aguas Buenas (PR)  POWER 1122 · ERA5 1212 · CHIRPS 1904 · real 1879
 *   Córdoba (AR)                              · CHIRPS  759 · real  ~790
 *   Mendoza (AR)                              · CHIRPS  221 · real  ~220
 *
 * ClimateSERV tarda entre 20 s y varios minutos, así que la ruta NO espera: la
 * primera llamada encola el trabajo y devuelve `procesando`; el cliente vuelve
 * a preguntar. Como la climatología no cambia, el resultado se cachea un año y
 * la segunda visita a la misma celda es instantánea.
 */

const HDRS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

const API        = 'https://climateserv.servirglobal.net/api';
const DATATYPE   = '0';          // UCSB CHIRPS Rainfall
const DESDE      = '01/01/2004';
const HASTA      = '12/31/2023';
const TTL_DATO   = 60 * 60 * 24 * 365;  // climatología: no cambia
const TTL_JOB    = 60 * 15;             // si el trabajo se cuelga, se reintenta

/** CHIRPS sólo cubre la franja 50°S–50°N (queda afuera la Patagonia austral). */
const LAT_MAX = 50;

export interface PrecipCHIRPS {
  /** 12 medias mensuales, en mm. */
  meses:  number[];
  anual:  number;
  años:   number;
  fuente: string;
}

/** Celda de ~0.05° = resolución nativa de CHIRPS; maximiza los aciertos de caché. */
function celda(v: number): string {
  return (Math.round(v / 0.05) * 0.05).toFixed(2);
}

function poligono(lat: number, lng: number): string {
  const d = 0.03; // menos que la celda CHIRPS: promedia 1–4 píxeles, no una comarca
  return JSON.stringify({
    type: 'Polygon',
    coordinates: [[
      [lng - d, lat - d], [lng + d, lat - d],
      [lng + d, lat + d], [lng - d, lat + d], [lng - d, lat - d],
    ]],
  });
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: HDRS });
}

async function encolar(lat: number, lng: number): Promise<string | null> {
  const u = new URL(`${API}/submitDataRequest/`);
  u.search = new URLSearchParams({
    datatype: DATATYPE, begintime: DESDE, endtime: HASTA,
    intervaltype: '0', operationtype: '5', geometry: poligono(lat, lng),
  }).toString();

  const r = await fetch(u, { signal: AbortSignal.timeout(25_000) });
  if (!r.ok) return null;
  // Responde con la lista `["<uuid>"]`.
  const id = (await r.text()).replace(/[[\]"\s]/g, '');
  return /^[0-9a-f-]{36}$/i.test(id) ? id : null;
}

interface RegistroCS { year: number; month: number; raw_value: number | null }

/** Promedia por mes calendario sobre todos los años con dato. */
function climatologia(datos: RegistroCS[]): PrecipCHIRPS | null {
  // -9999 es el relleno de ClimateSERV para píxeles sin dato.
  const validos = datos.filter(d => d.raw_value != null && d.raw_value > -100);
  if (validos.length < 365) return null;

  const suma = Array<number>(12).fill(0);
  const años = new Set<number>();
  for (const d of validos) {
    const i = d.month - 1;
    if (i < 0 || i > 11) continue; // el mes viene de una API externa
    suma[i] = (suma[i] ?? 0) + (d.raw_value as number);
    años.add(d.year);
  }
  const n = años.size;
  if (n < 5) return null; // muy pocos años para llamarlo climatología

  const meses = suma.map(v => Math.round((v / n) * 10) / 10);
  return {
    meses,
    anual:  Math.round(meses.reduce((s, v) => s + v, 0)),
    años:   n,
    fuente: `CHIRPS ~5 km (${n} años)`,
  };
}

export async function GET(req: Request) {
  const bloqueo = await requierePlan('analisis.clima');
  if (bloqueo) return bloqueo;

  const p    = new URL(req.url).searchParams;
  const lat  = parseFloat(p.get('lat') ?? '');
  const lng  = parseFloat(p.get('lng') ?? '');
  const job  = p.get('job');
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return new Response('Missing lat/lng', { status: 400 });
  }
  if (Math.abs(lat) > LAT_MAX) {
    return json({ estado: 'no_disponible', motivo: `CHIRPS sólo cubre entre ${LAT_MAX}°S y ${LAT_MAX}°N.` });
  }

  const clave    = `precip_chirps:${celda(lat)},${celda(lng)}`;
  const claveJob = `${clave}:job`;

  const cacheado = await cacheGet<PrecipCHIRPS>(clave);
  if (cacheado) return json({ estado: 'listo', ...cacheado });

  // ── ¿Hay un trabajo en curso? ──
  const idJob = job ?? (await cacheGet<{ id: string }>(claveJob))?.id ?? null;

  if (!idJob) {
    let nuevo: string | null;
    try {
      nuevo = await encolar(lat, lng);
    } catch {
      return json({ estado: 'error', motivo: 'ClimateSERV no responde.' }, 503);
    }
    if (!nuevo) return json({ estado: 'error', motivo: 'ClimateSERV rechazó el pedido.' }, 502);
    await cacheSet(claveJob, { id: nuevo }, TTL_JOB);
    return json({ estado: 'procesando', job: nuevo, progreso: 0 });
  }

  // ── Consultar avance ──
  let progreso = 0;
  try {
    const r = await fetch(`${API}/getDataRequestProgress/?id=${idJob}`, { signal: AbortSignal.timeout(20_000) });
    progreso = parseFloat((await r.text()).replace(/[[\]"\s]/g, '')) || 0;
  } catch {
    return json({ estado: 'procesando', job: idJob, progreso: 0 });
  }
  if (progreso < 100) return json({ estado: 'procesando', job: idJob, progreso });

  // ── Listo: bajar y resumir ──
  try {
    const r = await fetch(`${API}/getDataFromRequest/?id=${idJob}`, { signal: AbortSignal.timeout(30_000) });
    const j = await r.json() as { data?: RegistroCS[] };
    const clima = climatologia(j.data ?? []);
    if (!clima) return json({ estado: 'no_disponible', motivo: 'CHIRPS no tiene datos para este punto.' });
    await cacheSet(clave, clima, TTL_DATO);
    return json({ estado: 'listo', ...clima });
  } catch {
    return json({ estado: 'procesando', job: idJob, progreso: 99 });
  }
}
