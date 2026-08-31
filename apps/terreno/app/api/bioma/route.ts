import { SITE_ORIGIN } from '@/lib/http';
import { cacheGet, cacheSet } from '@/lib/db/cache';
import { requierePlan } from '@/lib/auth/apiGuard';
import type { Ecorregion } from '@/lib/ecorregiones';

/**
 * Ecorregión del predio — RESOLVE Ecoregions 2017 vía FeatureServer público.
 *
 * Devuelve ECO_ID, ECO_NAME, BIOME_NUM y BIOME_NAME para un punto. Sin API key.
 * El servicio no publica SLA, así que cacheamos fuerte: el mapa es estático
 * desde 2017 y una celda de ~1 km es de sobra para un predio.
 *
 * Si el servicio falla devolvemos 503 y la interfaz se queda con la
 * clasificación por Köppen, que es lo que ya hacía antes. Nunca inventamos
 * una ecorregión.
 */

const HDRS      = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': SITE_ORIGIN };
const CACHE_TTL = 60 * 60 * 24 * 365; // 1 año — RESOLVE 2017 no cambia
const RESOLVE   = 'https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/Resolve_Ecoregions/FeatureServer/0/query';

interface Body { lat?: number; lng?: number }

interface RespuestaArcGIS {
  features?: Array<{ attributes?: Record<string, unknown> }>;
  error?: { message?: string };
}

export async function POST(req: Request) {
  const bloqueo = await requierePlan('analisis.contexto');
  if (bloqueo) return bloqueo;

  let body: Body;
  try { body = await req.json() as Body; } catch { return err('JSON inválido', 400); }

  const lat = Number(body.lat), lng = Number(body.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return err('Faltan lat/lng.', 400);
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return err('Coordenadas fuera de rango.', 400);

  // ~1 km de resolución: dos predios vecinos comparten ecorregión.
  const dbKey = `bioma:${lat.toFixed(2)},${lng.toFixed(2)}`;
  const dbHit = await cacheGet<{ raw: string }>(dbKey);
  if (dbHit?.raw) return new Response(dbHit.raw, { status: 200, headers: HDRS });

  const params = new URLSearchParams({
    f: 'json',
    geometry: JSON.stringify({ x: lng, y: lat, spatialReference: { wkid: 4326 } }),
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: 'ECO_ID,ECO_NAME,BIOME_NUM,BIOME_NAME,REALM',
    returnGeometry: 'false',
  });

  let js: RespuestaArcGIS;
  try {
    const r = await fetch(`${RESOLVE}?${params}`, { signal: AbortSignal.timeout(12_000) });
    if (!r.ok) return err(`RESOLVE respondió ${r.status}.`, 502);
    js = await r.json() as RespuestaArcGIS;
  } catch {
    return err('No se pudo consultar la ecorregión (RESOLVE no disponible).', 503);
  }

  if (js.error) return err(`RESOLVE: ${js.error.message ?? 'error'}`, 502);

  const at = js.features?.[0]?.attributes;
  // Punto en el mar o isla sin polígono: no forzamos el vecino más cercano.
  if (!at || at.ECO_ID == null) return err('Sin ecorregión terrestre en ese punto.', 404);

  const eco: Ecorregion = {
    eco_id:     Number(at.ECO_ID),
    eco_name:   String(at.ECO_NAME ?? ''),
    bioma_num:  Number(at.BIOME_NUM),
    bioma_name: String(at.BIOME_NAME ?? ''),
    realm:      at.REALM ? String(at.REALM) : undefined,
  };

  const payload = JSON.stringify(eco);
  await cacheSet(dbKey, { raw: payload }, CACHE_TTL);
  return new Response(payload, { status: 200, headers: HDRS });
}

function err(msg: string, status: number) {
  return new Response(JSON.stringify({ error: msg }), { status, headers: HDRS });
}
