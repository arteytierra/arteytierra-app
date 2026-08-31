import { SITE_ORIGIN } from '@/lib/http';
import { cacheGet, cacheSet } from '@/lib/db/cache';
import { requierePlan } from '@/lib/auth/apiGuard';

/**
 * SSURGO vía Soil Data Access (USDA-NRCS).
 *
 * Es el relevamiento de suelos de Estados Unidos: polígonos mapeados en campo,
 * con perfiles descriptos horizonte por horizonte y agua útil, conductividad y
 * grupo hidrológico medidos, no estimados por pedotransferencia. Donde hay
 * SSURGO, SoilGrids queda muy atrás.
 *
 * El servicio recibe T-SQL por POST y devuelve una tabla. Dominio público
 * (obra del gobierno federal de EE.UU., 17 U.S.C. §105): uso comercial libre.
 * https://sdmdataaccess.sc.egov.usda.gov/
 */

const HDRS      = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': SITE_ORIGIN };
const CACHE_TTL = 60 * 60 * 24 * 90;   // 90 días: SSURGO se actualiza una vez al año
const SDA_URL   = 'https://sdmdataaccess.sc.egov.usda.gov/Tabular/post.rest';

/**
 * Perfil del componente dominante de la unidad cartográfica que cae en el punto.
 *
 * Va el componente dominante y no todos: una unidad cartográfica es un mosaico
 * (85% Clarion, 10% Nicollet, 5% otro) y promediarlos daría un suelo que no
 * existe en ningún lado. El porcentaje viaja en la respuesta para que el panel
 * pueda decir qué tan representativo es.
 */
function consulta(lng: string, lat: string): string {
  return `
    SELECT TOP 60 mu.muname, mu.mukey, c.cokey, c.compname, c.comppct_r, c.hydgrp,
           c.taxorder, c.drainagecl, c.slope_r,
           h.hzname, h.hzdept_r, h.hzdepb_r,
           h.claytotal_r, h.sandtotal_r, h.silttotal_r,
           h.om_r, h.dbthirdbar_r, h.ph1to1h2o_r, h.ksat_r, h.awc_r,
           h.wthirdbar_r, h.wfifteenbar_r
    FROM mapunit mu
    JOIN component c ON c.mukey = mu.mukey
    LEFT JOIN chorizon h ON h.cokey = c.cokey
    WHERE mu.mukey = (SELECT TOP 1 mukey FROM SDA_Get_Mukey_from_intersection_with_WktWgs84('point(${lng} ${lat})'))
      AND c.comppct_r = (SELECT MAX(c2.comppct_r) FROM component c2 WHERE c2.mukey = mu.mukey)
    ORDER BY h.hzdept_r
  `.replace(/\s+/g, ' ').trim();
}

export async function GET(req: Request) {
  const bloqueo = await requierePlan('analisis.suelo');
  if (bloqueo) return bloqueo;

  const p   = new URL(req.url).searchParams;
  const lat = p.get('lat');
  const lng = p.get('lng');
  if (!lat || !lng) return new Response('Missing lat/lng', { status: 400 });

  // 4 decimales (~11 m): los polígonos de SSURGO son chicos y redondear más
  // grueso haría saltar de una unidad cartográfica a la vecina.
  const latR = parseFloat(lat).toFixed(4);
  const lngR = parseFloat(lng).toFixed(4);
  if (!isFinite(+latR) || !isFinite(+lngR)) return new Response('Bad lat/lng', { status: 400 });

  const dbKey = `suelo-ssurgo:${latR},${lngR}`;
  const hit   = await cacheGet<{ raw: string }>(dbKey);
  if (hit?.raw) return new Response(hit.raw, { status: 200, headers: HDRS });

  let res: Response;
  try {
    res = await fetch(SDA_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ SERVICE: 'query', FORMAT: 'JSON+COLUMNNAME', QUERY: consulta(lngR, latR) }),
      signal:  AbortSignal.timeout(30_000),
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Soil Data Access no disponible.' }), { status: 503, headers: HDRS });
  }

  if (!res.ok) {
    return new Response(JSON.stringify({ error: `Soil Data Access respondió ${res.status}.` }), { status: res.status, headers: HDRS });
  }

  const text = await res.text();

  // Fuera de las áreas relevadas, SDA responde 200 con la tabla vacía. Eso no es
  // un error: es "acá no hay SSURGO", y el cliente tiene que caer a SoilGrids.
  let filas = 0;
  try { filas = (JSON.parse(text) as { Table?: unknown[] }).Table?.length ?? 0; } catch { filas = 0; }
  if (filas < 2) {
    return new Response(JSON.stringify({ sinDatos: true }), { status: 200, headers: HDRS });
  }

  await cacheSet(dbKey, { raw: text }, CACHE_TTL);
  return new Response(text, { status: 200, headers: HDRS });
}
