/**
 * Importación de GeoTIFF (D6) — ortofoto de dron o MDE (IGN, etc.).
 * Lee la georreferencia del archivo, reproyecta sus esquinas a WGS84 (proj4) y
 * rasteriza la imagen a un canvas para usarla como overlay georreferenciado en
 * el mapa. Soporta EPSG:4326/3857, UTM WGS84 (326xx/327xx) y Gauss-Krüger
 * POSGAR 2007 fajas 1–7 (5343–5349). Se muestrea a ≤1024 px por lado.
 */
import { fromArrayBuffer } from 'geotiff';
import proj4 from 'proj4';

export interface GeoTIFFOverlay {
  url:    string;                          // dataURL PNG
  sw:     { lat: number; lng: number };
  ne:     { lat: number; lng: number };
  ancho:  number;                          // px originales
  alto:   number;
  epsg:   number | null;
  bandas: number;
}

/** Definición proj4 para un código EPSG (o null si no está soportado). */
function proj4Def(epsg: number | null): string | null {
  if (epsg == null) return 'EPSG:4326';   // sin GeoKeys → asumimos lat/lng
  if (epsg === 4326) return 'EPSG:4326';
  if (epsg === 3857 || epsg === 900913) return 'EPSG:3857';
  if (epsg >= 32601 && epsg <= 32660) return `+proj=utm +zone=${epsg - 32600} +datum=WGS84 +units=m +no_defs`;
  if (epsg >= 32701 && epsg <= 32760) return `+proj=utm +zone=${epsg - 32700} +south +datum=WGS84 +units=m +no_defs`;
  if (epsg >= 5343 && epsg <= 5349) {
    const faja = epsg - 5342; // 5343 → faja 1
    const lon0 = -72 + 3 * (faja - 1);
    const x0 = faja * 1_000_000 + 500_000;
    return `+proj=tmerc +lat_0=-90 +lon_0=${lon0} +k=1 +x_0=${x0} +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs`;
  }
  return null;
}

export async function cargarGeoTIFF(file: File): Promise<GeoTIFFOverlay> {
  const buf = await file.arrayBuffer();
  const tiff = await fromArrayBuffer(buf);
  const image = await tiff.getImage();

  const gk = (image.getGeoKeys() ?? {}) as Record<string, number>;
  const epsg = gk['ProjectedCSTypeGeoKey'] ?? gk['GeographicTypeGeoKey'] ?? null;
  const def = proj4Def(epsg);
  if (!def) throw new Error(`Proyección no soportada (EPSG ${epsg}). Reproyectá el GeoTIFF a WGS84 o UTM WGS84.`);

  // Esquinas del bounding box en el CRS del archivo → WGS84
  const bbox = image.getBoundingBox();
  const minX = bbox[0]!, minY = bbox[1]!, maxX = bbox[2]!, maxY = bbox[3]!;
  const toWgs = (x: number, y: number): [number, number] => {
    if (def === 'EPSG:4326') return [x, y]; // ya es lng,lat
    return proj4(def, 'EPSG:4326', [x, y]) as [number, number];
  };
  const esquinas = [toWgs(minX, minY), toWgs(maxX, minY), toWgs(maxX, maxY), toWgs(minX, maxY)];
  const lngs = esquinas.map(c => c[0]), lats = esquinas.map(c => c[1]);
  const sw = { lat: Math.min(...lats), lng: Math.min(...lngs) };
  const ne = { lat: Math.max(...lats), lng: Math.max(...lngs) };

  // Muestreo (cap 1024 px por lado)
  const W0 = image.getWidth(), H0 = image.getHeight();
  const escala = Math.min(1, 1024 / Math.max(W0, H0));
  const W = Math.max(1, Math.round(W0 * escala)), H = Math.max(1, Math.round(H0 * escala));

  const rasters = await image.readRasters({ width: W, height: H }) as unknown as {
    length: number; [i: number]: ArrayLike<number>;
  };
  const bandas = rasters.length;
  const nodata = image.getGDALNoData();

  // min/max por banda para normalizar (solo si el rango excede 0–255)
  const rango = (b: ArrayLike<number>) => {
    let mn = Infinity, mx = -Infinity;
    for (let i = 0; i < b.length; i++) { const v = b[i]!; if (!Number.isFinite(v)) continue; if (v < mn) mn = v; if (v > mx) mx = v; }
    return { mn, mx };
  };

  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(W, H);
  const d = img.data;

  if (bandas >= 3) {
    const R = rasters[0]!, G = rasters[1]!, B = rasters[2]!;
    const rr = rango(R), gr = rango(G), br = rango(B);
    const need = rr.mx > 255 || gr.mx > 255 || br.mx > 255;
    const norm = (v: number, r: { mn: number; mx: number }) => need ? (r.mx > r.mn ? ((v - r.mn) / (r.mx - r.mn)) * 255 : 0) : v;
    for (let i = 0; i < W * H; i++) {
      const p = i * 4;
      const rv = R[i]!, gv = G[i]!, bv = B[i]!;
      const na = nodata != null && rv === nodata && gv === nodata && bv === nodata;
      d[p] = norm(rv, rr); d[p + 1] = norm(gv, gr); d[p + 2] = norm(bv, br);
      d[p + 3] = na || !Number.isFinite(rv) ? 0 : 255;
    }
  } else {
    const A = rasters[0]!;
    const { mn, mx } = rango(A);
    for (let i = 0; i < W * H; i++) {
      const p = i * 4;
      const v = A[i]!;
      const na = (nodata != null && v === nodata) || !Number.isFinite(v);
      const g = mx > mn ? Math.round(((v - mn) / (mx - mn)) * 255) : 0;
      d[p] = d[p + 1] = d[p + 2] = g;
      d[p + 3] = na ? 0 : 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  return { url: canvas.toDataURL('image/png'), sw, ne, ancho: W0, alto: H0, epsg, bandas };
}
