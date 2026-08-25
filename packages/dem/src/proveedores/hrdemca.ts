/**
 * Canadá — HRDEM Mosaic (CanElevation, DTM 1–2 m; Open Government Licence – Canada).
 * WCS 1.1.1 GetCoverage → GeoTIFF (`datacube.services.geo.ca/ows/elevation`).
 * Cobertura PARCIAL (zonas relevadas con LiDAR, sobre todo el sur poblado); fuera
 * de ellas el servicio no devuelve dato y se cae a GLO-30.
 * Verificado 10/08/2026: Ottawa → 41–89 m.
 *
 * Se pide directamente a cols×rows con GridOffsets: el nativo es 1–2 m y bajar el
 * predio entero serían decenas de MB. La imagen viene con fila 0 = NORTE → flip.
 *
 * Gotchas WCS 1.1.1 de este servidor (backend rasterio/geotrellis):
 *  - parámetro `identifier=dtm` (no `coverage=`);
 *  - `BoundingBox` y `GridOrigin` en orden lat,lon (EPSG::4326 = eje Lat primero);
 *  - `format=image/geotiff` (no `image/tiff`); `store=false` → TIFF directo (no multipart);
 *  - `GridOrigin = n,w` (esquina NO) y `GridOffsets = -dLat,dLon`.
 */
import { fromArrayBuffer } from 'geotiff';
import type { BBox } from '../tipos';

const WCS = 'https://datacube.services.geo.ca/ows/elevation';
const CRS = 'urn:ogc:def:crs:EPSG::4326';

export async function grillaHrdemCa(bbox: BBox, cols: number, rows: number): Promise<Float32Array | null> {
  const [w, s, e, n] = bbox;
  const dLat = (n - s) / rows, dLon = (e - w) / cols;
  if (!(dLat > 0) || !(dLon > 0)) return null;

  const url = `${WCS}?service=WCS&version=1.1.1&request=GetCoverage&identifier=dtm`
    + `&BoundingBox=${s},${w},${n},${e},${encodeURIComponent(CRS)}`
    + `&format=image/geotiff&store=false`
    + `&GridBaseCRS=${encodeURIComponent(CRS)}`
    + `&GridType=${encodeURIComponent('urn:ogc:def:method:WCS:1.1:2dSimpleGrid')}`
    + `&GridCS=${encodeURIComponent('urn:ogc:def:cs:OGC:0.0:Grid2dSquareCS')}`
    + `&GridOrigin=${encodeURIComponent(`${n},${w}`)}`
    + `&GridOffsets=${encodeURIComponent(`${-dLat},${dLon}`)}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    if (!res.ok) return null;
    if (!(res.headers.get('content-type') ?? '').includes('tiff')) return null;  // error = text/plain

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
