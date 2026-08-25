import { SITE_ORIGIN } from '@/lib/http';
import { calcularExtremos, type SerieDiaria } from '@/lib/climaExtremos';
import { cacheGet, cacheSet } from '@/lib/db/cache';
import { requierePlan } from '@/lib/auth/apiGuard';

const HDRS      = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': SITE_ORIGIN };
const CACHE_TTL = 60 * 60 * 24 * 90; // 90 días — reanálisis histórico, casi estático

// Ventana de análisis: 35 años completos (determinista → caché estable).
const START = '1991-01-01';
const END   = '2025-12-31';

async function openCache(): Promise<Cache | null> {
  try { return await caches.open('terreno-clima-diario-v1'); } catch { return null; }
}

export async function GET(req: Request) {
  const bloqueo = await requierePlan('analisis.clima');
  if (bloqueo) return bloqueo;

  const p   = new URL(req.url).searchParams;
  const lat = p.get('lat');
  const lng = p.get('lng');
  if (!lat || !lng) return new Response('Missing lat/lng', { status: 400 });

  // Redondeo a 2 decimales (~1 km — bajo la resolución de ERA5 pero estable para caché)
  const latR = parseFloat(lat).toFixed(2);
  const lngR = parseFloat(lng).toFixed(2);

  const cacheKey = `https://terreno-cache/clima-diario?lat=${latR}&lng=${lngR}`;
  const dbKey    = `clima-diario:${latR},${lngR}`;
  const cache    = await openCache();

  if (cache) {
    const hit = await cache.match(cacheKey);
    if (hit) return new Response(hit.body, { status: 200, headers: HDRS });
  }
  const dbHit = await cacheGet<{ raw: string }>(dbKey);
  if (dbHit?.raw) return new Response(dbHit.raw, { status: 200, headers: HDRS });

  const daily = 'temperature_2m_max,temperature_2m_min,precipitation_sum,et0_fao_evapotranspiration,windspeed_10m_max';
  const url = 'https://archive-api.open-meteo.com/v1/archive'
    + `?latitude=${latR}&longitude=${lngR}`
    + `&start_date=${START}&end_date=${END}`
    + `&daily=${daily}&timezone=auto`;

  let res: Response;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(40_000) });
  } catch {
    return new Response(JSON.stringify({ error: 'Open-Meteo no disponible, reintentá en unos segundos.' }), { status: 503, headers: HDRS });
  }

  if (!res.ok) {
    return new Response(JSON.stringify({ error: `Open-Meteo respondió con error ${res.status}.` }), { status: res.status, headers: HDRS });
  }

  let raw: {
    elevation?: number;
    daily?: {
      time?: string[];
      temperature_2m_max?: Array<number | null>;
      temperature_2m_min?: Array<number | null>;
      precipitation_sum?: Array<number | null>;
      et0_fao_evapotranspiration?: Array<number | null>;
      windspeed_10m_max?: Array<number | null>;
    };
  };
  try {
    raw = await res.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Respuesta inválida de Open-Meteo.' }), { status: 502, headers: HDRS });
  }

  const d = raw.daily;
  if (!d?.time?.length) {
    return new Response(JSON.stringify({ error: 'Open-Meteo no devolvió serie diaria para este punto.' }), { status: 502, headers: HDRS });
  }

  const serie: SerieDiaria = {
    time:   d.time,
    tmax:   d.temperature_2m_max ?? [],
    tmin:   d.temperature_2m_min ?? [],
    precip: d.precipitation_sum ?? [],
    et0:    d.et0_fao_evapotranspiration ?? [],
    wind:   d.windspeed_10m_max ?? [],
  };

  const extremos = calcularExtremos(serie, {
    fuente:      'Open-Meteo / ERA5 (reanálisis, ~10 km)',
    elevacion_m: typeof raw.elevation === 'number' ? Math.round(raw.elevation) : null,
  });

  if (!extremos) {
    return new Response(JSON.stringify({ error: 'Serie insuficiente para calcular extremos.' }), { status: 502, headers: HDRS });
  }

  const payload = JSON.stringify(extremos);
  if (cache) {
    await cache.put(cacheKey, new Response(payload, {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${CACHE_TTL}` },
    }));
  }
  await cacheSet(dbKey, { raw: payload }, CACHE_TTL);

  return new Response(payload, { status: 200, headers: HDRS });
}
