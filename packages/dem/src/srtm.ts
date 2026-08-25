/**
 * Respaldo SRTM 30 m vía OpenTopoData (lo que usaba `/api/elevacion` antes).
 * Se llama cuando GLO-30 falla o deja huecos. Chunk de 100 (límite del servicio).
 */
import type { LatLng } from './tipos';

const SRTM = 'https://api.opentopodata.org/v1/srtm30m';

export async function puntosSrtm(coords: LatLng[]): Promise<Array<number | null>> {
  const out: Array<number | null> = new Array(coords.length).fill(null);
  for (let i = 0; i < coords.length; i += 100) {
    const chunk = coords.slice(i, i + 100);
    const locs = chunk.map(c => `${c.lat},${c.lng}`).join('|');
    const res = await fetch(`${SRTM}?locations=${encodeURIComponent(locs)}`, { signal: AbortSignal.timeout(25_000) });
    if (!res.ok) throw new Error(`OpenTopoData respondió ${res.status}`);
    const json = await res.json() as { status: string; results?: Array<{ elevation: number | null }> };
    if (json.status !== 'OK' || !json.results) throw new Error('OpenTopoData: estado no OK');
    json.results.forEach((r, k) => { out[i + k] = r.elevation; });
  }
  return out;
}
