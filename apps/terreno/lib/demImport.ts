/**
 * Importación de un modelo de elevación propio (GeoTIFF de una banda): dron con
 * RTK, estación total interpolada, o un MDE oficial descargado.
 *
 * Por qué existe: el MDE satelital que usa la app (Terrarium/SRTM) tiene ~30 m
 * de paso horizontal, así que no resuelve nada por debajo de un par de metros.
 * Para diseñar swales o keyline en un lote chico hace falta un relevamiento
 * real, y esto permite traerlo.
 *
 * Reusa el mismo manejo de proyecciones que `geotiffImport` (que lee GeoTIFF
 * para calcarlo de fondo); acá los valores se conservan como cotas en metros
 * en vez de normalizarse a grises.
 */
import { fromArrayBuffer } from 'geotiff';
import proj4 from 'proj4';
import { proj4Def } from './geotiffImport';
import type { GrillaElevacion } from './grillaElevacion';

export interface DEMImportado {
  grilla:  GrillaElevacion;
  /** Paso horizontal aproximado en metros — define hasta qué intervalo tiene sentido. */
  pasoM:   number;
  nombre:  string;
  epsg:    number | null;
  ancho:   number;
  alto:    number;
}

/** Tope de muestreo: 512×512 = 262 k celdas, suficiente para curvas finas sin colgar el hilo. */
const MAX_LADO = 512;

export async function cargarDEM(file: File): Promise<DEMImportado> {
  const tiff  = await fromArrayBuffer(await file.arrayBuffer());
  const image = await tiff.getImage();

  const gk   = (image.getGeoKeys() ?? {}) as Record<string, number>;
  const epsg = gk['ProjectedCSTypeGeoKey'] ?? gk['GeographicTypeGeoKey'] ?? null;
  const def  = proj4Def(epsg);
  if (!def) throw new Error(`Proyección no soportada (EPSG ${epsg}). Reproyectá el GeoTIFF a WGS84 o UTM WGS84.`);

  const bbox = image.getBoundingBox();
  const minX = bbox[0]!, minY = bbox[1]!, maxX = bbox[2]!, maxY = bbox[3]!;
  const aWgs = (x: number, y: number): [number, number] =>
    def === 'EPSG:4326' ? [x, y] : (proj4(def, 'EPSG:4326', [x, y]) as [number, number]);

  // El recuadro se aproxima por sus esquinas. En un predio (pocos km) el error
  // de no reproyectar celda por celda es despreciable frente al del propio MDE.
  const esquinas = [aWgs(minX, minY), aWgs(maxX, minY), aWgs(maxX, maxY), aWgs(minX, maxY)];
  const lngs = esquinas.map(c => c[0]), lats = esquinas.map(c => c[1]);
  const lngMin = Math.min(...lngs), lngMax = Math.max(...lngs);
  const latMin = Math.min(...lats), latMax = Math.max(...lats);

  const W0 = image.getWidth(), H0 = image.getHeight();
  const escala = Math.min(1, MAX_LADO / Math.max(W0, H0));
  const cols = Math.max(2, Math.round(W0 * escala));
  const rows = Math.max(2, Math.round(H0 * escala));

  const rasters = await image.readRasters({ width: cols, height: rows }) as unknown as {
    length: number; [i: number]: ArrayLike<number>;
  };
  if (rasters.length < 1) throw new Error('El GeoTIFF no tiene bandas.');
  if (rasters.length > 1) {
    throw new Error(`El archivo tiene ${rasters.length} bandas: parece una imagen, no un modelo de elevación. Para calcarlo de fondo usá "Pegar plano".`);
  }
  const banda = rasters[0]!;
  const nodata = image.getGDALNoData();

  // GrillaElevacion espera row 0 = latMin (sur); el GeoTIFF arranca por el norte.
  const elev = new Float64Array(rows * cols);
  let min = Infinity, max = -Infinity, validos = 0;
  for (let r = 0; r < rows; r++) {
    const src = (rows - 1 - r) * cols;
    const dst = r * cols;
    for (let c = 0; c < cols; c++) {
      const v = banda[src + c]!;
      // Los MDE suelen marcar el vacío con -9999 o -32768 además del nodata declarado.
      const vacio = !Number.isFinite(v) || (nodata != null && v === nodata) || v <= -9000;
      if (vacio) { elev[dst + c] = NaN; continue; }
      elev[dst + c] = v;
      if (v < min) min = v;
      if (v > max) max = v;
      validos++;
    }
  }
  if (validos === 0) throw new Error('El GeoTIFF no tiene cotas válidas.');

  // Paso horizontal: ancho real del recuadro dividido por las columnas leídas.
  const latMedia = ((latMin + latMax) / 2) * Math.PI / 180;
  const anchoM = (lngMax - lngMin) * 111_320 * Math.cos(latMedia);
  const altoM  = (latMax - latMin) * 110_540;
  const pasoM  = Math.max(0.01, Math.min(anchoM / cols, altoM / rows));

  return {
    grilla: { rows, cols, latMin, latMax, lngMin, lngMax, elev, elev_min: min, elev_max: max },
    pasoM,
    nombre: file.name,
    epsg,
    ancho: W0,
    alto:  H0,
  };
}
