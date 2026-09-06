import { SITE_ORIGIN } from '@/lib/http';
import { cacheGet, cacheSet } from '@/lib/db/cache';
import { requierePlan } from '@/lib/auth/apiGuard';
import { GEOMETRIAS_SABERES, saberesActivos } from '@/lib/saberes';
import type { SaberTerritorial } from '@/lib/saberesTipos';

/**
 * Saberes territoriales activos sobre el predio.
 *
 * Vive en el servidor por una razón sola: la compuerta necesita el país del
 * punto, y el país sale de Nominatim. El resto del cálculo —licencia, ECO_ID,
 * punto en polígono— es local y podría correr en el cliente, pero partirlo en
 * dos lados haría más difícil auditarlo.
 *
 * Devuelve `[]` casi siempre, y eso es correcto: hoy el registro de geometrías
 * tiene un solo polígono. La respuesta vacía no es un error ni un servicio
 * caído; es que en ese punto no hay ningún saber con cartografía aprobada.
 *
 * Cada saber viaja con la procedencia de su polígono porque ODbL pide
 * atribución donde el dato se muestra, no en un archivo aparte.
 */

const HDRS      = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': SITE_ORIGIN };
const CACHE_TTL = 60 * 60 * 24 * 180; // 180 días — las fronteras no se mueven
const UA        = `ArteyTierra-acequia/1.0 (${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://terreno.arteytierra.org'})`;

interface Body { lat?: number; lng?: number; ecoId?: number }

export interface SaberActivo {
  saber: SaberTerritorial;
  geometria: { fuente: string; url: string; licencia: string };
}

export async function POST(req: Request) {
  const bloqueo = await requierePlan('analisis.contexto');
  if (bloqueo) return bloqueo;

  let body: Body;
  try { body = await req.json() as Body; } catch { return err('JSON inválido', 400); }

  const lat = Number(body.lat), lng = Number(body.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return err('Faltan lat/lng.', 400);
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return err('Coordenadas fuera de rango.', 400);
  const ecoId = Number.isFinite(Number(body.ecoId)) ? Number(body.ecoId) : undefined;

  const pais = await paisDelPunto(lat, lng);

  // Sin país no se activa nada. Se devuelve 200 con la lista vacía: es una
  // respuesta legítima, no una falla que la interfaz tenga que reportar.
  // El flatMap con la guarda no es defensa contra un caso real: un saber activo
  // siempre tiene geometría, porque sin ella la compuerta lo habría frenado. Es
  // para no tener que afirmarlo con un `!` que nadie pueda verificar leyendo.
  const activos: SaberActivo[] = pais
    ? saberesActivos({ lat, lng, pais, ecoId }).flatMap((saber) => {
        const g = GEOMETRIAS_SABERES[saber.id];
        return g ? [{ saber, geometria: { fuente: g.fuente, url: g.url, licencia: g.licencia } }] : [];
      })
    : [];

  return new Response(JSON.stringify({ pais, saberes: activos }), { status: 200, headers: HDRS });
}

/**
 * País ISO 3166-1 alfa-2 del punto, vía Nominatim. Se cachea con clave de ~1 km
 * porque es lo único caro de esta ruta y porque Nominatim pide no golpearlo.
 * Si falla devuelve null y la compuerta corta ahí: preferimos no activar nada
 * antes que adivinar el país.
 */
async function paisDelPunto(lat: number, lng: number): Promise<string | null> {
  const key = `pais:${lat.toFixed(2)},${lng.toFixed(2)}`;
  const hit = await cacheGet<{ pais: string | null }>(key);
  if (hit) return hit.pais;

  let pais: string | null = null;
  try {
    const u = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=5&addressdetails=1`;
    const r = await fetch(u, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(12_000) });
    if (r.ok) {
      const j = await r.json() as { address?: { country_code?: string } };
      const cc = j.address?.country_code;
      if (cc && /^[a-z]{2}$/.test(cc)) pais = cc.toUpperCase();
    }
  } catch {
    // Sin país no activamos: devolver null es el comportamiento seguro.
    return null;
  }

  // Sólo se cachea el acierto. Un null puede ser un fallo transitorio de
  // Nominatim y no queremos congelarlo medio año.
  if (pais) await cacheSet(key, { pais }, CACHE_TTL);
  return pais;
}

function err(msg: string, status: number) {
  return new Response(JSON.stringify({ error: msg }), { status, headers: HDRS });
}
