/**
 * Adaptador DEM → ModeloSitio (@arteytierra/anteproyectos-contracts).
 *
 * Obligación de la Pista A por el Checkpoint 0 (ver PLAN-DOS-PISTAS.md §3):
 * ninguna pista importa módulos internos de la otra, sólo el contrato y
 * este adaptador. Combina lib/sitio/geometria.ts (polígono geodésico) y
 * @arteytierra/dem (grilla de elevación real) en el `ModeloSitio` que
 * consume la Pista B.
 *
 * Sistema local: origen en el centroide del polígono, eje Y hacia el norte
 * verdadero (norte_deg = 0), conversión equirectangular (aproximación
 * válida a escala de un predio — mismo criterio que apps/terreno).
 */
import { obtenerGrillaDEM, type GrillaDEM, type FuenteDEM } from '@arteytierra/dem';
import type { GrillaElevacion, ModeloSitio, PuntoLocal } from '@arteytierra/anteproyectos-contracts';
import { calcularMetricas, centroide, type Mojon } from './geometria';

const M_LAT = 111_320;

function aLocal(lat: number, lng: number, origen: { lat: number; lng: number }): PuntoLocal {
  return {
    x_m: (lng - origen.lng) * M_LAT * Math.cos((origen.lat * Math.PI) / 180),
    y_m: (lat - origen.lat) * M_LAT,
  };
}

/** El contrato sólo distingue 3 fuentes; las nacionales de mayor resolución
 *  (usgs3dep, ignfr, etc.) se agrupan con glo30 — son igualmente "servicio
 *  externo automático", a diferencia de un DEM que subió el usuario. */
function fuenteContrato(f: FuenteDEM): GrillaElevacion['fuente'] {
  if (f === 'usuario') return 'propio';
  if (f === 'srtm30') return 'srtm';
  return 'glo30';
}

function bboxDe(mojones: Mojon[], margenGrados = 0.005) {
  const lats = mojones.map(m => m.lat);
  const lngs = mojones.map(m => m.lng);
  return [
    Math.min(...lngs) - margenGrados,
    Math.min(...lats) - margenGrados,
    Math.max(...lngs) + margenGrados,
    Math.max(...lats) + margenGrados,
  ] as [number, number, number, number];
}

function grillaAContrato(g: GrillaDEM, origen: { lat: number; lng: number }): GrillaElevacion {
  // GrillaDEM.elev es row-major, fila 0 = sur (ver @arteytierra/dem).
  const valores_m: number[][] = [];
  for (let r = 0; r < g.rows; r++) {
    const fila: number[] = [];
    for (let c = 0; c < g.cols; c++) {
      const v = g.elev[r * g.cols + c];
      fila.push(v != null && Number.isFinite(v) ? v : 0);
    }
    valores_m.push(fila);
  }
  const [w, s, e, n] = g.bbox;
  const origenLocal = aLocal(s, w, origen); // esquina suroeste, fila 0 = sur
  const pasoX_m = ((e - w) * M_LAT * Math.cos((origen.lat * Math.PI) / 180)) / Math.max(1, g.cols - 1);
  const pasoY_m = ((n - s) * M_LAT) / Math.max(1, g.rows - 1);

  return {
    valores_m, origenLocal, pasoX_m, pasoY_m,
    filas: g.rows, columnas: g.cols,
    fuente: fuenteContrato(g.fuente),
  };
}

export async function construirModeloSitio(id: string, mojones: Mojon[]): Promise<ModeloSitio> {
  if (mojones.length < 3) throw new Error('Se necesitan al menos 3 mojones para un ModeloSitio.');

  const origen = centroide(mojones)!;
  const metricas = calcularMetricas(mojones)!;
  const grillaDEM = await obtenerGrillaDEM(bboxDe(mojones), 20, 20);
  if (!grillaDEM) throw new Error('No se pudo obtener la grilla DEM del sitio.');

  const elevacionEnOrigen = grillaDEM.elev[
    Math.round(((origen.lat - grillaDEM.bbox[1]) / (grillaDEM.bbox[3] - grillaDEM.bbox[1])) * (grillaDEM.rows - 1)) * grillaDEM.cols
    + Math.round(((origen.lng - grillaDEM.bbox[0]) / (grillaDEM.bbox[2] - grillaDEM.bbox[0])) * (grillaDEM.cols - 1))
  ] ?? 0;

  const porNumero = new Map(mojones.map(m => [m.numero, m]));
  const linderos = metricas.linderos.map((l, i) => {
    const mDesde = porNumero.get(l.desde)!, mHasta = porNumero.get(l.hasta)!;
    return {
      id: `L${i + 1}`,
      desde: aLocal(mDesde.lat, mDesde.lng, origen),
      hasta: aLocal(mHasta.lat, mHasta.lng, origen),
      azimut_deg: l.azimut_deg,
      largo_m: l.longitud_m,
    };
  });

  return {
    id,
    sistema: { origen: { lat: origen.lat, lng: origen.lng, elevacion_m: elevacionEnOrigen }, norte_deg: 0 },
    poligono: mojones.map(m => aLocal(m.lat, m.lng, origen)),
    linderos,
    elevacion: grillaAContrato(grillaDEM, origen),
    accesos: [],
    vistas: [],
  };
}
