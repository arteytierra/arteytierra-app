import { cacheGet, cacheSet } from '@/lib/db/cache';

/**
 * Imagen histórica (D2) — ESRI World Imagery Wayback.
 * Descarga el índice de "releases" (versiones fechadas de la imagen satelital
 * global) y lo reduce a ~1 fecha por año para una línea de tiempo manejable.
 * Cada release trae una plantilla de tiles WMTS con su número embebido.
 * Sin clave. Los tiles se cargan luego directo desde ArcGIS en el navegador.
 */

const HDRS      = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
const CACHE_TTL = 60 * 60 * 24 * 30; // 30 días — el índice cambia poco
const CONFIG    = 'https://s3-us-west-2.amazonaws.com/config.maptiles.arcgis.com/waybackconfig.json';

interface ReleaseCfg { itemTitle?: string; itemURL?: string }

export async function GET() {
  const dbKey = 'wayback:releases:v1';
  const dbHit = await cacheGet<{ raw: string }>(dbKey);
  if (dbHit?.raw) return new Response(dbHit.raw, { status: 200, headers: HDRS });

  let cfg: Record<string, ReleaseCfg>;
  try {
    const r = await fetch(CONFIG, { signal: AbortSignal.timeout(25_000) });
    if (!r.ok) return err(`Wayback respondió ${r.status}.`, 502);
    cfg = await r.json() as Record<string, ReleaseCfg>;
  } catch {
    return err('No se pudo cargar el índice histórico (Wayback no disponible).', 503);
  }

  // Parsea todas las releases con su fecha (del título "… (Wayback YYYY-MM-DD)").
  const todas = Object.entries(cfg).flatMap(([rel, v]) => {
    const m = (v.itemTitle ?? '').match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!m || !v.itemURL) return [];
    const fecha = `${m[1]}-${m[2]}-${m[3]}`;
    // Plantilla de tiles al estilo Leaflet ({z}/{y}/{x})
    const tileUrl = v.itemURL.replace('{level}', '{z}').replace('{row}', '{y}').replace('{col}', '{x}');
    return [{ rel, fecha, anio: Number(m[1]), tileUrl }];
  });

  // Reduce a la última release de cada año (línea de tiempo limpia).
  const porAnio = new Map<number, { rel: string; fecha: string; anio: number; tileUrl: string }>();
  for (const r of todas) {
    const prev = porAnio.get(r.anio);
    if (!prev || r.fecha > prev.fecha) porAnio.set(r.anio, r);
  }
  const releases = [...porAnio.values()]
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .map(r => ({ rel: r.rel, fecha: r.fecha, label: `${r.anio}`, tileUrl: r.tileUrl }));

  const payload = JSON.stringify({ releases });
  await cacheSet(dbKey, { raw: payload }, CACHE_TTL);
  return new Response(payload, { status: 200, headers: HDRS });
}

function err(msg: string, status: number) {
  return new Response(JSON.stringify({ error: msg }), { status, headers: HDRS });
}
