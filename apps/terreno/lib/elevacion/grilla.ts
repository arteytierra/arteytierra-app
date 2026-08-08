/**
 * Grilla densa de elevación GLO-30 leída server-side de los COGs de Copernicus.
 *
 * Lee la VENTANA de píxeles que cubre el bbox (una por tile 1°×1°) y muestrea
 * con bilineal a la grilla pedida. NO se usa `readRasters({bbox})` porque
 * interpreta mal la ventana geográfica y devuelve otra subzona (verificado
 * 06/08/2026). La lectura por ventana de píxeles sí coincide con las cotas
 * puntuales. Fila 0 = sur (latMin), igual que `GrillaElevacion` del cliente.
 */
import { fromUrl } from 'geotiff';
import type { BBox } from './tipos';
import { tileUrl, validaCota, puntosGlo30 } from './glo30';

const MAX_LADO = 2000;   // lado máx. de la ventana nativa por tile; si excede → muestreo por nodo

export interface GrillaDEM {
  rows: number; cols: number;
  bbox: BBox;              // [oeste, sur, este, norte]
  elev: Float32Array;      // row-major, fila 0 = sur; NaN = sin dato
  fuente: 'glo30';
}

interface Ventana {
  minX: number; maxX: number; minY: number; maxY: number; W: number; H: number;
  x0: number; y0: number; ww: number; hh: number;
  band: ArrayLike<number>; noData: number | null;
}

async function abrirVentana(latTile: number, lonTile: number, bbox: BBox): Promise<Ventana | null> {
  const [w, s, e, n] = bbox;
  const tiff  = await fromUrl(tileUrl(latTile + 0.5, lonTile + 0.5));
  const image = await tiff.getImage();
  const [minX, minY, maxX, maxY] = image.getBoundingBox() as [number, number, number, number];
  const W = image.getWidth(), H = image.getHeight();
  const noData = image.getGDALNoData();

  // Intersección bbox ∩ tile
  const iw = Math.max(w, minX), ie = Math.min(e, maxX);
  const is = Math.max(s, minY), inn = Math.min(n, maxY);
  if (!(ie > iw && inn > is)) return null;

  const toPx = (lng: number) => ((lng - minX) / (maxX - minX)) * W;
  const toPy = (lat: number) => ((maxY - lat) / (maxY - minY)) * H;
  let x0 = Math.max(0, Math.floor(toPx(iw)));
  let y0 = Math.max(0, Math.floor(toPy(inn)));   // inn = norte → py menor
  const x1 = Math.min(W, Math.ceil(toPx(ie)) + 1);
  const y1 = Math.min(H, Math.ceil(toPy(is)) + 1);
  const ww = x1 - x0, hh = y1 - y0;
  if (ww <= 0 || hh <= 0 || ww > MAX_LADO || hh > MAX_LADO) return null;

  const rasters = await image.readRasters({ window: [x0, y0, x1, y1] });
  const band = (rasters as unknown as ArrayLike<number>[])[0]!;
  return { minX, maxX, minY, maxY, W, H, x0, y0, ww, hh, band, noData };
}

function muestrear(v: Ventana, lat: number, lng: number): number {
  if (lng < v.minX || lng > v.maxX || lat < v.minY || lat > v.maxY) return NaN;
  const gx = ((lng - v.minX) / (v.maxX - v.minX)) * v.W - v.x0;
  const gy = ((v.maxY - lat) / (v.maxY - v.minY)) * v.H - v.y0;
  const px = Math.max(0, Math.min(v.ww - 2, Math.floor(gx)));
  const py = Math.max(0, Math.min(v.hh - 2, Math.floor(gy)));
  const fx = gx - px, fy = gy - py;
  const g = (xx: number, yy: number) => validaCota(v.band[yy * v.ww + xx]!, v.noData);
  const e00 = g(px, py), e10 = g(px + 1, py), e01 = g(px, py + 1), e11 = g(px + 1, py + 1);
  if (e00 == null || e10 == null || e01 == null || e11 == null) {
    return e00 ?? e10 ?? e01 ?? e11 ?? NaN;
  }
  const a = e00 + (e10 - e00) * fx;
  const b = e01 + (e11 - e01) * fx;
  return a + (b - a) * fy;
}

export async function grillaGlo30(bbox: BBox, cols: number, rows: number): Promise<GrillaDEM | null> {
  if (cols < 2 || rows < 2) return null;
  const [w, s, e, n] = bbox;
  const elev = new Float32Array(rows * cols).fill(NaN);

  try {
    const ventanas: Ventana[] = [];
    for (let la = Math.floor(s); la <= Math.floor(n); la++) {
      for (let lo = Math.floor(w); lo <= Math.floor(e); lo++) {
        const v = await abrirVentana(la, lo, bbox);
        if (v) ventanas.push(v);
      }
    }
    if (ventanas.length === 0) throw new Error('sin ventanas COG');

    let ok = 0;
    for (let r = 0; r < rows; r++) {
      const lat = s + (r / (rows - 1)) * (n - s);
      for (let c = 0; c < cols; c++) {
        const lng = w + (c / (cols - 1)) * (e - w);
        for (const v of ventanas) {
          const val = muestrear(v, lat, lng);
          if (Number.isFinite(val)) { elev[r * cols + c] = val; ok++; break; }
        }
      }
    }
    if (ok >= rows * cols * 0.2) return { rows, cols, bbox, elev, fuente: 'glo30' };
  } catch { /* cae a muestreo por nodo */ }

  // Respaldo: muestreo por nodo (maneja bbox multi-tile grande y fallos de ventana)
  const nodes: Array<{ lat: number; lng: number }> = [];
  for (let r = 0; r < rows; r++) {
    const lat = s + (r / (rows - 1)) * (n - s);
    for (let c = 0; c < cols; c++) nodes.push({ lat, lng: w + (c / (cols - 1)) * (e - w) });
  }
  const vals = await puntosGlo30(nodes);
  let ok = 0;
  for (let i = 0; i < vals.length; i++) { const v = vals[i]; if (v != null) { elev[i] = v; ok++; } }
  return ok >= rows * cols * 0.2 ? { rows, cols, bbox, elev, fuente: 'glo30' } : null;
}
