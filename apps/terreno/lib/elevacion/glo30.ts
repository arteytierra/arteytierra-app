/**
 * Proveedor Copernicus GLO-30 (DEM global 30 m) leído directo de los COGs
 * públicos en AWS Open Data (bucket `copernicus-dem-30m`, EPSG:4326, sin auth).
 *
 * Se lee por VENTANA con range requests (geotiff `fromUrl`), sin bajar el COG
 * entero. Cada COG cubre 1°×1° y se nombra por su esquina SO (floor de lat/lng).
 * Verificado 06/08/2026: punto (-26.59,-65.09) → tile S27/W066 → ~892 m.
 */
import { fromUrl } from 'geotiff';
import type { LatLng } from './tipos';

const BUCKET = 'https://copernicus-dem-30m.s3.eu-central-1.amazonaws.com';
const MAX_VENTANA = 640 * 640;   // por encima: lectura punto a punto

function tileName(lat: number, lon: number): string {
  const tLat = Math.floor(lat), tLon = Math.floor(lon);
  const latS = (tLat < 0 ? 'S' : 'N') + String(Math.abs(tLat)).padStart(2, '0');
  const lonS = (tLon < 0 ? 'W' : 'E') + String(Math.abs(tLon)).padStart(3, '0');
  return `Copernicus_DSM_COG_10_${latS}_00_${lonS}_00_DEM`;
}
function tileUrl(lat: number, lon: number): string {
  const n = tileName(lat, lon);
  return `${BUCKET}/${n}/${n}.tif`;
}

function valida(v: number, noData: number | null): number | null {
  if (!Number.isFinite(v)) return null;
  if (noData != null && v === noData) return null;
  if (v < -1000 || v > 9000) return null;   // guarda contra NoData sin declarar / océano
  return v;
}

interface Pt { lat: number; lng: number; idx: number }

async function leerTile(url: string, pts: Pt[], out: Array<number | null>): Promise<void> {
  const tiff  = await fromUrl(url);
  const image = await tiff.getImage();
  const [minX, minY, maxX, maxY] = image.getBoundingBox() as [number, number, number, number];
  const W = image.getWidth(), H = image.getHeight();
  const noData = image.getGDALNoData();

  const toPx = (lng: number) => ((lng - minX) / (maxX - minX)) * W;
  const toPy = (lat: number) => ((maxY - lat) / (maxY - minY)) * H;

  // Ventana que envuelve todos los puntos de este tile
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of pts) {
    const x = toPx(p.lng), y = toPy(p.lat);
    x0 = Math.min(x0, x); x1 = Math.max(x1, x);
    y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  x0 = Math.max(0, Math.floor(x0)); y0 = Math.max(0, Math.floor(y0));
  x1 = Math.min(W, Math.ceil(x1) + 1); y1 = Math.min(H, Math.ceil(y1) + 1);
  const ww = x1 - x0, hh = y1 - y0;
  if (ww <= 0 || hh <= 0) return;

  if (ww * hh <= MAX_VENTANA) {
    const rasters = await image.readRasters({ window: [x0, y0, x1, y1] });
    const band = (rasters as unknown as ArrayLike<number>[])[0]!;
    for (const p of pts) {
      const x = Math.round(toPx(p.lng)) - x0, y = Math.round(toPy(p.lat)) - y0;
      out[p.idx] = (x < 0 || y < 0 || x >= ww || y >= hh) ? null : valida(band[y * ww + x]!, noData);
    }
  } else {
    // Puntos muy dispersos: una ventana de 1px por punto
    for (const p of pts) {
      const px = Math.round(toPx(p.lng)), py = Math.round(toPy(p.lat));
      if (px < 0 || py < 0 || px >= W || py >= H) { out[p.idx] = null; continue; }
      const rasters = await image.readRasters({ window: [px, py, px + 1, py + 1] });
      const band = (rasters as unknown as ArrayLike<number>[])[0]!;
      out[p.idx] = valida(band[0]!, noData);
    }
  }
}

/** Cotas GLO-30 para una lista de puntos (orden preservado; null = sin dato). */
export async function puntosGlo30(coords: LatLng[]): Promise<Array<number | null>> {
  const out: Array<number | null> = new Array(coords.length).fill(null);
  const byTile = new Map<string, Pt[]>();
  coords.forEach((c, idx) => {
    const url = tileUrl(c.lat, c.lng);
    const arr = byTile.get(url);
    if (arr) arr.push({ lat: c.lat, lng: c.lng, idx });
    else byTile.set(url, [{ lat: c.lat, lng: c.lng, idx }]);
  });
  await Promise.all([...byTile.entries()].map(([url, pts]) =>
    leerTile(url, pts, out).catch(() => { /* deja null → respaldo en index */ })));
  return out;
}
