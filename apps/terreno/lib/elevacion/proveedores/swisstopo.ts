/**
 * Suiza — swissALTI3D (swisstopo), DTM 0,5 m / 2 m; datos abiertos (© swisstopo).
 * A diferencia del resto, swisstopo NO sirve el DEM en WGS84: los COG están en
 * LV95 (EPSG:2056, Mercator oblicuo suizo) y el height/profile REST solo acepta
 * LV95/LV03. Así que:
 *   1) se listan los tiles que cubren el bbox vía el catálogo STAC (query en
 *      WGS84) y, de cada km², se toma UN COG: la resolución que corresponde al
 *      paso de la grilla pedida (`resolucionSwisstopo`) y el año de vuelo más
 *      nuevo (`elegirTilesPorAnio`);
 *   2) de cada tile se lee SÓLO la ventana de píxeles que cubre el predio;
 *   3) cada nodo de la grilla se reproyecta WGS84→LV95 con la fórmula aproximada
 *      oficial de swisstopo (~1 m de error, sobra para muestrear el DEM) y se
 *      muestrea del tile que lo contiene.
 * Verificado 11/08/2026 contra el height REST oficial: coincide a ±0,2 m
 * (Berna 540,5 vs 540,3; etc.).
 *
 * Los COG traen fila 0 = NORTE (maxN); se indexa en consecuencia.
 */
import { fromUrl } from 'geotiff';
import type { BBox, GrillaProveedor } from '../tipos';

const STAC = 'https://data.geo.admin.ch/api/stac/v0.9/collections/ch.swisstopo.swissalti3d/items';
const MAX_TILES = 40;   // predio demasiado grande (cada tile = 1 km²) → mejor GLO-30

/** Las dos resoluciones que swisstopo publica del mismo km², en metros. */
export const RES_FINA = 0.5;
export const RES_GRUESA = 2;

/**
 * Tope de píxeles a leer en una corrida, sumando todos los tiles.
 *
 * No es el que manda —el criterio del paso de grilla ya acota el predio a unos
 * 600 m de lado, ~1,4 M de píxeles a 0,5 m— pero queda como red: si algún día
 * sube `MAX_NODOS` de `/api/dem`, esto evita que la ruta se vaya a buscar
 * decenas de MB dentro de los 60 s del plan.
 */
const MAX_PX = 4_000_000;

/** WGS84 (lat, lon en grados) → LV95 [E, N] en metros. Fórmula aproximada swisstopo. */
export function wgs84ToLv95(lat: number, lon: number): [number, number] {
  const phi = (lat * 3600 - 169028.66) / 10000;
  const lam = (lon * 3600 - 26782.5) / 10000;
  const E = 2600072.37 + 211455.93 * lam - 10938.51 * lam * phi
    - 0.36 * lam * phi * phi - 44.54 * lam * lam * lam;
  const N = 1200147.07 + 308807.95 * phi + 3745.25 * lam * lam
    + 76.63 * phi * phi - 194.56 * lam * lam * phi + 119.79 * phi * phi * phi;
  return [E, N];
}

/**
 * Qué resolución pedirle a swisstopo para esta grilla.
 *
 * Dos condiciones, y las dos son de costo, no de gusto:
 *
 * 1. **Que 0,5 m agregue algo.** Si la grilla pide un nodo cada 2 m o más, el
 *    DTM de 0,5 m se promedia hasta desaparecer: son los mismos números con
 *    dieciséis veces la descarga. El paso que se mira es el MÁS FINO de los dos
 *    ejes, porque alcanza con que uno pueda resolverlo.
 * 2. **Que la ventana entre.** A 0,5 m un km² son 2000×2000 px, ~16 MB en
 *    float32. Leer el tile entero —como se hacía hasta el 08/11/2026, cuando
 *    sólo se usaba el de 2 m y pesaba 1 MB— deja de ser gratis, y por eso ahora
 *    se lee por ventana. El tope es la red de seguridad.
 *
 * En la práctica la condición 1 es la que decide, y acota sola: con el tope de
 * 90.000 nodos de `/api/dem`, un paso por debajo de 2 m implica un predio de
 * menos de ~600 m de lado, o sea ~1,4 M de píxeles a 0,5 m.
 */
export function resolucionSwisstopo(
  extE: number, extN: number, cols: number, rows: number,
): number {
  if (cols < 2 || rows < 2) return RES_GRUESA;
  const paso = Math.min(extE / (cols - 1), extN / (rows - 1));
  if (!(paso < RES_GRUESA)) return RES_GRUESA;
  if ((extE / RES_FINA) * (extN / RES_FINA) > MAX_PX) return RES_GRUESA;
  return RES_FINA;
}

/**
 * swissALTI3D se releva por ciclos, así que el catálogo devuelve el MISMO km²
 * medido en años distintos: para `2600-1198` conviven `swissalti3d_2019_...` y
 * `swissalti3d_2025_...`. Hasta el 08/11/2026 se tomaban los dos, y como el
 * muestreo corta en el primer tile que contiene al nodo, el relieve salía del
 * relevamiento de 2019 —el orden en que los devuelve el STAC— con el de 2025
 * descargado al lado y tirado. Sobre terreno estable da lo mismo; sobre una
 * cantera, un desmonte o una obra, el predio de hace siete años es otro predio.
 * Y además duplicaba la descarga, con lo que `MAX_TILES` valía la mitad.
 *
 * Se agrupa por km² y queda el año más nuevo de cada uno, de la resolución
 * pedida. No se filtra por un año global porque el ciclo es rodante: hay km²
 * cuyo último vuelo es 2019 y descartarlos dejaría agujeros donde sí hay dato.
 */
const RE_TILE = /swissalti3d_(\d{4})_(\d{4}-\d{4})_(0\.5|2)_2056_[^/]*\.tif$/;

export function elegirTilesPorAnio(hrefs: string[], resM: number): string[] {
  const buscada = resM === RES_FINA ? '0.5' : '2';
  const mejor = new Map<string, { anio: number; href: string }>();
  for (const href of hrefs) {
    const m = RE_TILE.exec(href);
    if (!m || m[3] !== buscada) continue;
    const anio = Number(m[1]), km2 = m[2]!;
    const previo = mejor.get(km2);
    if (!previo || anio > previo.anio) mejor.set(km2, { anio, href });
  }
  return [...mejor.values()].map(v => v.href);
}

/**
 * Envolvente LV95 del predio.
 *
 * Se recorre el PERÍMETRO y no sólo las cuatro esquinas: LV95 es un Mercator
 * oblicuo, así que un rectángulo en lat/lon no es un rectángulo en LV95 y los
 * puntos medios de los lados se escapan un poco de la caja de las esquinas. Con
 * el margen de abajo sobra, pero recorrer el borde cuesta nada y evita que un
 * nodo del borde quede fuera de la ventana leída.
 */
function envolventeLv95(bbox: BBox): [number, number, number, number] {
  const [w, s, e, n] = bbox;
  const PASOS = 16;
  let mnE = Infinity, mnN = Infinity, mxE = -Infinity, mxN = -Infinity;
  for (let i = 0; i <= PASOS; i++) {
    const t = i / PASOS;
    const puntos: Array<[number, number]> = [
      [s + t * (n - s), w], [s + t * (n - s), e],
      [s, w + t * (e - w)], [n, w + t * (e - w)],
    ];
    for (const [lat, lng] of puntos) {
      const [E, N] = wgs84ToLv95(lat, lng);
      if (E < mnE) mnE = E; if (E > mxE) mxE = E;
      if (N < mnN) mnN = N; if (N > mxN) mxN = N;
    }
  }
  const MARGEN_M = 5;
  return [mnE - MARGEN_M, mnN - MARGEN_M, mxE + MARGEN_M, mxN + MARGEN_M];
}

interface Tile {
  /** bbox LV95 del tile COMPLETO (no de la ventana leída). */
  bb: [number, number, number, number];
  /** tamaño del tile completo, en píxeles. */
  W: number; H: number;
  /** esquina superior izquierda de la ventana leída, en píxeles del tile. */
  x0: number; y0: number;
  /** tamaño de la ventana leída, en píxeles. */
  ww: number; hh: number;
  band: ArrayLike<number>;
}

export async function grillaSwisstopo(
  bbox: BBox, cols: number, rows: number,
): Promise<GrillaProveedor | null> {
  const [w, s, e, n] = bbox;
  if (cols < 2 || rows < 2) return null;
  try {
    const [pmnE, pmnN, pmxE, pmxN] = envolventeLv95(bbox);
    const resM = resolucionSwisstopo(pmxE - pmnE, pmxN - pmnN, cols, rows);

    const res = await fetch(`${STAC}?bbox=${w},${s},${e},${n}&limit=100`, { signal: AbortSignal.timeout(30_000) });
    if (!res.ok) return null;
    const j = await res.json() as { features?: Array<{ assets?: Record<string, { href: string }> }> };
    const feats = j.features ?? [];
    const urls = elegirTilesPorAnio(
      feats.flatMap(f => Object.values(f.assets ?? {}).map(a => a.href)),
      resM,
    );
    if (urls.length === 0 || urls.length > MAX_TILES) return null;   // fuera de Suiza, o predio enorme → GLO-30

    const tiles: Tile[] = [];
    let pxLeidos = 0;
    for (const u of urls) {
      try {
        const image = await (await fromUrl(u)).getImage();
        const bb = image.getBoundingBox() as [number, number, number, number];
        const [mnE, mnN, mxE, mxN] = bb;
        const W = image.getWidth(), H = image.getHeight();

        // Ventana = intersección del tile con la envolvente del predio, en px.
        // Un píxel de margen a cada lado para no perder el borde por redondeo.
        const x0 = Math.max(0, Math.floor((pmnE - mnE) / (mxE - mnE) * W) - 1);
        const x1 = Math.min(W, Math.ceil((pmxE - mnE) / (mxE - mnE) * W) + 1);
        const y0 = Math.max(0, Math.floor((mxN - pmxN) / (mxN - mnN) * H) - 1);  // norte → py menor
        const y1 = Math.min(H, Math.ceil((mxN - pmnN) / (mxN - mnN) * H) + 1);
        const ww = x1 - x0, hh = y1 - y0;
        if (ww <= 0 || hh <= 0) continue;                 // el tile no toca al predio
        pxLeidos += ww * hh;
        if (pxLeidos > MAX_PX) return null;               // red de seguridad → GLO-30

        const rasters = await image.readRasters({ window: [x0, y0, x1, y1] });
        const band = (rasters as unknown as ArrayLike<number>[])[0]!;
        tiles.push({ bb, W, H, x0, y0, ww, hh, band });
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
          const px = Math.min(t.W - 1, Math.floor((E - mnE) / (mxE - mnE) * t.W)) - t.x0;
          const py = Math.min(t.H - 1, Math.floor((mxN - N) / (mxN - mnN) * t.H)) - t.y0;
          if (px < 0 || px >= t.ww || py < 0 || py >= t.hh) continue;  // cayó fuera de la ventana leída
          const v = t.band[py * t.ww + px]!;
          if (Number.isFinite(v) && v > -1000 && v < 9000) { elev[r * cols + c] = v; ok++; }
          break;
        }
      }
    }
    return ok >= rows * cols * 0.5 ? { elev, pasoFuenteM: resM } : null;
  } catch { return null; }
}
