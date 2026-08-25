/**
 * EE.UU. — USGS 3DEP (1 m / 10 m, dominio público). Se pide una grilla ya
 * remuestreada al tamaño deseado vía el ImageServer `exportImage` (devuelve un
 * GeoTIFF F32 en EPSG:4326). Verificado 06/08/2026: Boulder CO → 1573–1831 m.
 *
 * La imagen viene con fila 0 = NORTE; se voltea a fila 0 = sur (como el resto).
 */
import { fromArrayBuffer } from 'geotiff';
import type { BBox } from '../tipos';

const IMG = 'https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer/exportImage';

export async function grillaUsgs3dep(bbox: BBox, cols: number, rows: number): Promise<Float32Array | null> {
  const [w, s, e, n] = bbox;
  const url = `${IMG}?bbox=${w},${s},${e},${n}&bboxSR=4326&imageSR=4326&size=${cols},${rows}`
    + `&format=tiff&pixelType=F32&interpolation=RSP_BilinearInterpolation&f=image`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    if (!res.ok) return null;
    if (!(res.headers.get('content-type') ?? '').includes('tiff')) return null;  // error ArcGIS = JSON

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
