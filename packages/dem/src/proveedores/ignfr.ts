/**
 * Francia — IGN RGE ALTI (1 m / 5 m). El servicio de altimetría de la
 * Géoplateforme devuelve cotas por lista de puntos (batch). Se consulta la grilla
 * por chunks de 400 (límite práctico de largo de URL en GET; POST devuelve 500),
 * con una resolución interna acotada que luego se sube a cols×rows por vecino.
 * Verificado 06/08/2026: Paris 34.9 m, Chamonix 1035.7 m; GET de 500 pts → 200 OK.
 */
import type { BBox } from '../tipos';

const REST  = 'https://data.geopf.fr/altimetrie/1.0/calcul/alti/rest/elevation.json';
const CHUNK = 400;    // puntos por request (URL segura ~7.6 KB)
const CAP   = 6000;   // nodos máx. consultados al servicio por grilla
const CONC  = 4;      // requests en paralelo

async function elevBatch(lons: string[], lats: string[]): Promise<number[]> {
  const url = `${REST}?lon=${lons.join('|')}&lat=${lats.join('|')}&resource=ign_rge_alti_wld&zonly=true`;
  const r = await fetch(url, { signal: AbortSignal.timeout(25_000) });
  if (!r.ok) throw new Error(`IGN ${r.status}`);
  const j = await r.json() as { elevations?: number[] };
  if (!Array.isArray(j.elevations)) throw new Error('IGN payload');
  return j.elevations;
}

export async function grillaIgnFr(bbox: BBox, cols: number, rows: number): Promise<Float32Array | null> {
  const [w, s, e, n] = bbox;

  // Resolución interna acotada (fila 0 = sur)
  let ic = cols, ir = rows;
  if (cols * rows > CAP) {
    const k = Math.sqrt(CAP / (cols * rows));
    ic = Math.max(2, Math.floor(cols * k));
    ir = Math.max(2, Math.floor(rows * k));
  }
  const lons: string[] = [], lats: string[] = [];
  for (let r = 0; r < ir; r++) {
    const lat = s + (r / (ir - 1)) * (n - s);
    for (let c = 0; c < ic; c++) { lons.push((w + (c / (ic - 1)) * (e - w)).toFixed(6)); lats.push(lat.toFixed(6)); }
  }
  const total = ic * ir;
  const vals = new Array<number>(total).fill(NaN);

  try {
    const inicios: number[] = [];
    for (let i = 0; i < total; i += CHUNK) inicios.push(i);
    for (let g = 0; g < inicios.length; g += CONC) {
      await Promise.all(inicios.slice(g, g + CONC).map(async i => {
        const ev = await elevBatch(lons.slice(i, i + CHUNK), lats.slice(i, i + CHUNK));
        for (let k = 0; k < ev.length; k++) vals[i + k] = ev[k]!;
      }));
    }
  } catch { return null; }

  // Subir a cols×rows por vecino más cercano (IGN usa -99999 para sin dato)
  const elev = new Float32Array(rows * cols).fill(NaN);
  let ok = 0;
  for (let r = 0; r < rows; r++) {
    const ri = ir === rows ? r : Math.min(ir - 1, Math.round((r / (rows - 1)) * (ir - 1)));
    for (let c = 0; c < cols; c++) {
      const ci = ic === cols ? c : Math.min(ic - 1, Math.round((c / (cols - 1)) * (ic - 1)));
      const v = vals[ri * ic + ci]!;
      if (Number.isFinite(v) && v > -1000 && v < 9000) { elev[r * cols + c] = v; ok++; }
    }
  }
  return ok >= rows * cols * 0.5 ? elev : null;
}
