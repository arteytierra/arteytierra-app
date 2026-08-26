/**
 * Respaldo Open-Meteo Elevation API (Copernicus GLO-90, ~90 m).
 * Sin clave, sin auth, límites amplios (~10k req/día) y mucho más estable que
 * OpenTopoData —que rate-limitea la IP compartida de Vercel—. Se usa cuando
 * GLO-30 (COG) deja huecos, antes de caer a OpenTopoData.
 *
 * Acepta coordenadas en paralelo por query (lat=a,b&lng=x,y). Límite 100/req.
 */
import type { LatLng } from './tipos';

const OPEN_METEO = 'https://api.open-meteo.com/v1/elevation';

function valida(v: number | null | undefined): number | null {
  if (v == null || !Number.isFinite(v)) return null;
  if (v < -1000 || v > 9000) return null; // guarda contra NoData / océano
  return v;
}

export async function puntosOpenMeteo(coords: LatLng[]): Promise<Array<number | null>> {
  const out: Array<number | null> = new Array(coords.length).fill(null);
  for (let i = 0; i < coords.length; i += 100) {
    const chunk = coords.slice(i, i + 100);
    const lats = chunk.map(c => c.lat).join(',');
    const lngs = chunk.map(c => c.lng).join(',');
    const res = await fetch(
      `${OPEN_METEO}?latitude=${lats}&longitude=${lngs}`,
      { signal: AbortSignal.timeout(15_000) },
    );
    if (!res.ok) throw new Error(`Open-Meteo respondió ${res.status}`);
    const json = await res.json() as { elevation?: Array<number | null> };
    if (!Array.isArray(json.elevation)) throw new Error('Open-Meteo: sin elevación');
    json.elevation.forEach((v, k) => { out[i + k] = valida(v); });
  }
  return out;
}
