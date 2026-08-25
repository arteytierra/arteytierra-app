/**
 * Suiza — swissALTI3D (swisstopo), DTM 0,5 m / 2 m; datos abiertos (© swisstopo).
 * A diferencia del resto, swisstopo NO sirve el DEM en WGS84: los COG están en
 * LV95 (EPSG:2056, Mercator oblicuo suizo) y el height/profile REST solo acepta
 * LV95/LV03. Así que:
 *   1) se listan los tiles que cubren el bbox vía el catálogo STAC (query en
 *      WGS84) y se toman los COG de 2 m;
 *   2) se leen enteros (tiles de 1 km² = 500×500 px, ~1 MB) una sola vez;
 *   3) cada nodo de la grilla se reproyecta WGS84→LV95 con la fórmula aproximada
 *      oficial de swisstopo (~1 m de error, sobra para muestrear el DEM) y se
 *      muestrea del tile que lo contiene.
 * Verificado 11/08/2026 contra el height REST oficial: coincide a ±0,2 m
 * (Berna 540,5 vs 540,3; etc.).
 *
 * Los COG traen fila 0 = NORTE (maxN); se indexa en consecuencia.
 */
import { fromUrl } from 'geotiff';
import type { BBox } from '../tipos';

const STAC = 'https://data.geo.admin.ch/api/stac/v0.9/collections/ch.swisstopo.swissalti3d/items';
const MAX_TILES = 40;   // predio demasiado grande (cada tile = 1 km²) → mejor GLO-30

/** WGS84 (lat, lon en grados) → LV95 [E, N] en metros. Fórmula aproximada swisstopo. */
function wgs84ToLv95(lat: number, lon: number): [number, number] {
  const phi = (lat * 3600 - 169028.66) / 10000;
  const lam = (lon * 3600 - 26782.5) / 10000;
  const E = 2600072.37 + 211455.93 * lam - 10938.51 * lam * phi
    - 0.36 * lam * phi * phi - 44.54 * lam * lam * lam;
  const N = 1200147.07 + 308807.95 * phi + 3745.25 * lam * lam
    + 76.63 * phi * phi - 194.56 * lam * lam * phi + 119.79 * phi * phi * phi;
  return [E, N];
}

interface Tile { bb: [number, number, number, number]; W: number; H: number; band: ArrayLike<number> }

export async function grillaSwisstopo(bbox: BBox, cols: number, rows: number): Promise<Float32Array | null> {
  const [w, s, e, n] = bbox;
  if (cols < 2 || rows < 2) return null;
  try {
    const res = await fetch(`${STAC}?bbox=${w},${s},${e},${n}&limit=100`, { signal: AbortSignal.timeout(30_000) });
    if (!res.ok) return null;
    const j = await res.json() as { features?: Array<{ assets?: Record<string, { href: string }> }> };
    const feats = j.features ?? [];
    const urls = feats
      .map(f => Object.values(f.assets ?? {}).find(a => /_2_2056_.*\.tif$/.test(a.href))?.href)
      .filter((u): u is string => !!u);
    if (urls.length === 0 || urls.length > MAX_TILES) return null;   // fuera de Suiza, o predio enorme → GLO-30

    const tiles: Tile[] = [];
    for (const u of urls) {
      try {
        const image = await (await fromUrl(u)).getImage();
        const band = (await image.readRasters() as unknown as ArrayLike<number>[])[0]!;
        tiles.push({ bb: image.getBoundingBox() as [number, number, number, number], W: image.getWidth(), H: image.getHeight(), band });
      } catch { /* tile caído → se ignora */ }
    }
    if (tiles.length === 0) return null;

    const elev = new Float32Array(rows * cols).fill(NaN);
    let ok = 0;
    for (let r = 0; r < rows; r++) {
      const lat = s + (r / (rows - 1)) * (n - s);
      for (let c = 0; c < cols; c++) {
        const lng = w + (c / (cols - 1)) * (e - w);
        const [E, N] = wgs84ToLv95(lat, lng);
        for (const t of tiles) {
          const [mnE, mnN, mxE, mxN] = t.bb;
          if (E < mnE || E > mxE || N < mnN || N > mxN) continue;
          const px = Math.min(t.W - 1, Math.max(0, Math.floor((E - mnE) / (mxE - mnE) * t.W)));
          const py = Math.min(t.H - 1, Math.max(0, Math.floor((mxN - N) / (mxN - mnN) * t.H)));  // fila 0 = norte
          const v = t.band[py * t.W + px]!;
          if (Number.isFinite(v) && v > -1000 && v < 9000) { elev[r * cols + c] = v; ok++; }
          break;
        }
      }
    }
    return ok >= rows * cols * 0.5 ? elev : null;
  } catch { return null; }
}
