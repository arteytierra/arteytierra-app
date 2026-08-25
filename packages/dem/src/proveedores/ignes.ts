/**
 * España — IGN MDT (PNOA-LiDAR, 5 m / 25 m; CC-BY 4.0, scne.es). Se pide una
 * ventana vía WCS 2.0.1 GetCoverage → GeoTIFF en ETRS89 geográfico
 * (EPSG:4258 ≈ WGS84 a esta escala) y se remuestrea a la grilla pedida.
 * Verificado 10/08/2026: Madrid/El Retiro → 632–675 m.
 *
 * La imagen viene con fila 0 = NORTE; se voltea a fila 0 = sur (como el resto).
 */
import { fromArrayBuffer } from 'geotiff';
import type { BBox } from '../tipos';

const WCS = 'https://servicios.idee.es/wcs-inspire/mdt';
const CRS = 'http://www.opengis.net/def/crs/EPSG/0/4258';
const PX_POR_GRADO_5M = 22_200;   // ~5 m de paso a latitudes medias
const MAX_LADO_PX     = 3_000;    // techo de descarga; predios enormes → 25 m o GLO-30

export async function grillaIgnEs(bbox: BBox, cols: number, rows: number): Promise<Float32Array | null> {
  const [w, s, e, n] = bbox;
  // 5 m salvo predios muy grandes (para acotar el tamaño de la descarga nativa).
  const usar5m = Math.max(e - w, n - s) * PX_POR_GRADO_5M <= MAX_LADO_PX;
  const coverage = usar5m ? 'Elevacion4258_5' : 'Elevacion4258_25';
  const url = `${WCS}?SERVICE=WCS&VERSION=2.0.1&REQUEST=GetCoverage&COVERAGEID=${coverage}`
    + `&SUBSET=lat(${s},${n})&SUBSET=long(${w},${e})&FORMAT=image/tiff`
    + `&SUBSETTINGCRS=${encodeURIComponent(CRS)}&OUTPUTCRS=${encodeURIComponent(CRS)}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    if (!res.ok) return null;
    if (!(res.headers.get('content-type') ?? '').includes('tiff')) return null;  // error WCS = XML

    const tiff  = await fromArrayBuffer(await res.arrayBuffer());
    const image = await tiff.getImage();
    const W = image.getWidth(), H = image.getHeight();
    if (W < 2 || H < 2) return null;
    const band = (await image.readRasters() as unknown as ArrayLike<number>[])[0]!;

    const elev = new Float32Array(rows * cols).fill(NaN);
    let ok = 0;
    for (let r = 0; r < rows; r++) {
      const sy = Math.min(H - 1, Math.round((1 - r / (rows - 1)) * (H - 1)));  // r=0 (sur) → fila inferior
      for (let c = 0; c < cols; c++) {
        const sx = Math.min(W - 1, Math.round((c / (cols - 1)) * (W - 1)));
        const v = band[sy * W + sx]!;
        if (Number.isFinite(v) && v > -1000 && v < 9000) { elev[r * cols + c] = v; ok++; }
      }
    }
    return ok >= rows * cols * 0.5 ? elev : null;   // cobertura parcial → mejor GLO-30
  } catch { return null; }
}
