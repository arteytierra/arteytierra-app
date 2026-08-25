/**
 * Países Bajos — AHN (Actueel Hoogtebestand Nederland), DTM 0,5 m; datos abiertos
 * de PDOK (dominio público). Se pide una ventana vía WCS 2.0.1 GetCoverage →
 * GeoTIFF en EPSG:4326 y, como AHN es 0,5 m nativo (una ventana chica ya supera
 * el MAXSIZE=4000 px del server), se usa la extensión de escalado (`SCALESIZE`)
 * para que el propio servicio devuelva EXACTAMENTE la grilla pedida.
 * Verificado 11/08/2026: Ámsterdam −1,3…2,5 m; Veluwe 48…53 m; Posbank 25…107 m.
 *
 * Gotcha: subset y escalado deben usar el MISMO nombre de eje. Con
 * `SUBSETTINGCRS=4326` MapServer mapea el eje geográfico al eje nativo `x`/`y`,
 * así que hay que subsetear y escalar por `x`/`y` (no `Long`/`Lat`), o rechaza el
 * pedido ("axis 'Long' corresponds to the same axis as the subset 'x'").
 *
 * La imagen viene con fila 0 = NORTE; se voltea a fila 0 = sur (como el resto).
 */
import { fromArrayBuffer } from 'geotiff';
import type { BBox } from '../tipos';

const WCS = 'https://service.pdok.nl/rws/ahn/wcs/v1_0';
const CRS = 'http://www.opengis.net/def/crs/EPSG/0/4326';

export async function grillaAhnNl(bbox: BBox, cols: number, rows: number): Promise<Float32Array | null> {
  const [w, s, e, n] = bbox;
  if (cols < 2 || rows < 2) return null;
  const enc = encodeURIComponent(CRS);
  const url = `${WCS}?service=WCS&version=2.0.1&request=GetCoverage&coverageId=dtm_05m`
    + `&SUBSET=x(${w},${e})&SUBSET=y(${s},${n})&SUBSETTINGCRS=${enc}&OUTPUTCRS=${enc}`
    + `&SCALESIZE=x(${cols}),y(${rows})&FORMAT=image/tiff`;
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
    return ok >= rows * cols * 0.5 ? elev : null;   // cobertura parcial (agua/edificios) → mejor GLO-30
  } catch { return null; }
}
