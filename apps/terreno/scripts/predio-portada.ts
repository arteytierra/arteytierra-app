/**
 * El predio de las animaciones de acequia.app, en un solo lugar.
 *
 * Lo leen los dos generadores —`datos-portada.ts`, que escribe el dato de las
 * diez piezas del encargo 02, y `datos-mesa.ts`, que escribe el del encargo
 * 03—. Está acá y no copiado en los dos por lo de siempre: dos listas de
 * mojones iguales son dos listas que un día dejan de serlo, y las piezas del
 * encargo 02 están aprobadas sobre ESTA geometría.
 *
 * EL NOMBRE DEL PREDIO NO SE PUBLICA. Sirve para trabajar; publicar el proyecto
 * de un cliente —y con él la ubicación de su tierra— lo autoriza el cliente.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { obtenerGrillaDEM } from '../lib/elevacion/grilla';
import { proporcionDeMesetas, UMBRAL_MESETAS } from '../lib/elevacion/muestreo';
import type { BBox, FuenteDEM } from '../lib/elevacion';
import { PASO_RELIEVE, type FuenteRelieve, type GrillaElevacion } from '../lib/grillaElevacion';

/**
 * Cuetiepa, Chiapas (México). Los siete mojones son los que tiene cargados el
 * proyecto en la app, copiados del panel «Mojones».
 *
 * Es el predio que eligió Jonatan y sirve por lo que mide: 317 m de desnivel en
 * 417 ha, pendiente general del 20 % y el agua bajando al NNE por un valle que
 * se lee de un vistazo. En un campo llano no habría nada que encender.
 */
export const MOJONES = [
  { lat: 17.33037, lng: -92.20731 },
  { lat: 17.34298, lng: -92.19452 },
  { lat: 17.33377, lng: -92.18491 },
  { lat: 17.33094, lng: -92.17740 },
  { lat: 17.31661, lng: -92.18529 },
  { lat: 17.32370, lng: -92.19383 },
  { lat: 17.32702, lng: -92.20223 },
];

export const PREDIO = 'cuetiepa';

/**
 * Margen alrededor del predio, igual que `obtenerGrillaDensa`. No es estética:
 * la pendiente de una celda del borde necesita vecinos y el D8 necesita ver de
 * dónde baja el agua. Lo que se INFORMA se recorta después con `dentro`.
 */
export const MARGEN = 0.08;

/**
 * 300 nodos de lado sobre ~3,4 km dan un paso de ~11 m, tres veces más fino que
 * los ~30 m del GLO-30. Eso NO inventa relieve: `obtenerGrillaDEM` interpola
 * bilineal entre píxeles reales, que es exactamente lo que hace la vista 3D de
 * la app al drapear. La resolución del dato sigue siendo 30 m y así se cita.
 */
export const LADO = 300;

/**
 * Intervalo de las curvas, en metros. El automático sobre 369 m de desnivel
 * devuelve 50, que para un predio de 417 ha dibuja siete anillos y no se lee
 * como relieve. La app en pantalla usa 20 y es el que muestra la captura.
 */
export const INTERVALO_M = 20;

export type Punto = { lat: number; lng: number };

export function bboxDe(mojones: Punto[], margen: number): [number, number, number, number] {
  const lats = mojones.map(m => m.lat), lngs = mojones.map(m => m.lng);
  const s = Math.min(...lats), n = Math.max(...lats);
  const w = Math.min(...lngs), e = Math.max(...lngs);
  const dy = (n - s) * margen, dx = (e - w) * margen;
  return [w - dx, s - dy, e + dx, n + dy];
}

/** Metros entre dos puntos, plano local. Alcanza para un predio. */
export function metros(a: Punto, b: Punto): number {
  const dy = (b.lat - a.lat) * 111_320;
  const dx = (b.lng - a.lng) * 111_320 * Math.cos(((a.lat + b.lat) / 2) * Math.PI / 180);
  return Math.hypot(dx, dy);
}

/**
 * Un punto como par `[lng, lat]` redondeado a seis decimales, que es el orden
 * de los 0,1 m: más decimales son peso de archivo y menos mueven la línea.
 * El orden lng-lat es el de GeoJSON, así que la composición lo usa tal cual.
 */
export function red(p: Punto): [number, number] {
  return [Math.round(p.lng * 1e6) / 1e6, Math.round(p.lat * 1e6) / 1e6];
}

export const RUMBOS = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSO','SO','OSO','O','ONO','NO','NNO'];

export function rumbo(desde: Punto, hacia: Punto): string {
  const dy = hacia.lat - desde.lat;
  const dx = (hacia.lng - desde.lng) * Math.cos(((desde.lat + hacia.lat) / 2) * Math.PI / 180);
  const deg = (Math.atan2(dx, dy) * 180 / Math.PI + 360) % 360;
  return RUMBOS[Math.round(deg / 22.5) % 16]!;
}

// ─── El relieve, una sola vez para los dos generadores ─────────────────────

/**
 * El relieve, leído una vez y guardado en disco.
 *
 * La ventana COG de Copernicus tarda entre veinte segundos y dos minutos por
 * tile, y el dato no cambia: volver a bajarlo en cada ajuste de la animación es
 * regalar dos minutos y una chance de caer al respaldo malo. El archivo queda
 * en `generado/`, que está gitignorado. `--refrescar` lo ignora y vuelve a
 * bajar.
 *
 * Está acá, y no en cada generador, por la misma razón que los mojones: los dos
 * encargos tienen que leer EL MISMO relieve o las piezas del 03 no encajan con
 * las del 02 que ya están aprobadas.
 */
export async function relieveConCache(
  salida: string, bbox: BBox, cols: number, rows: number, refrescar = false,
) {
  const cache = path.join(salida, `${PREDIO}-dem-${cols}x${rows}.json`);

  if (!refrescar && existsSync(cache)) {
    const g = JSON.parse(readFileSync(cache, 'utf8')) as {
      cols: number; rows: number; fuente: string; bbox: BBox; elev: Array<number | null>;
    };
    if (g.cols === cols && g.rows === rows && g.bbox.every((v, i) => v === bbox[i])) {
      console.log(`relieve    de la caché: ${path.basename(cache)}`);
      return {
        cols, rows, bbox,
        fuente: g.fuente as FuenteDEM,
        elev: Float32Array.from(g.elev, v => (v == null ? NaN : v)),
      };
    }
  }

  const dem = await obtenerGrillaDEM(bbox, cols, rows);
  if (!dem) throw new Error('obtenerGrillaDEM devolvió null — ¿hay cobertura de GLO-30 en ese bbox?');

  // Sólo se guarda si sirve: una caché con la grilla escalonada adentro es peor
  // que no tener caché, porque convierte un fallo de red de un día en un dato
  // malo permanente.
  if (proporcionDeMesetas(dem) <= UMBRAL_MESETAS) {
    mkdirSync(salida, { recursive: true });
    writeFileSync(cache, JSON.stringify({
      cols: dem.cols, rows: dem.rows, bbox: dem.bbox, fuente: dem.fuente,
      elev: Array.from(dem.elev, v => (Number.isFinite(v) ? Math.round(v * 100) / 100 : null)),
    }));
  }
  return dem;
}

/**
 * La grilla del predio, con su control de escalones ya hecho.
 *
 * Una grilla escalonada no se estrella: mata la hidrología en silencio. Sobre
 * una meseta el D8 no encuentra vecino más bajo y el agua, las zanjas y el
 * keyline salen vacíos sin un solo error.
 */
export async function grillaDelPredio(salida: string, lado = LADO, refrescar = false) {
  const bbox = bboxDe(MOJONES, MARGEN);
  const [w, s, e, n] = bbox;
  const anchoM = metros({ lat: (s + n) / 2, lng: w }, { lat: (s + n) / 2, lng: e });
  const altoM  = metros({ lat: s, lng: (w + e) / 2 }, { lat: n, lng: (w + e) / 2 });
  const cols = lado;
  const rows = Math.max(2, Math.round(lado * (altoM / anchoM)));

  console.log(`predio     ${PREDIO} · ${MOJONES.length} mojones`);
  console.log(`bbox       ${w.toFixed(5)}, ${s.toFixed(5)} → ${e.toFixed(5)}, ${n.toFixed(5)}`);
  console.log(`            ${(anchoM / 1000).toFixed(2)} × ${(altoM / 1000).toFixed(2)} km · grilla ${cols}×${rows} · paso ≈ ${(anchoM / cols).toFixed(1)} m`);

  const t0 = Date.now();
  const dem = await relieveConCache(salida, bbox, cols, rows, refrescar);
  const sinDato = Array.from(dem.elev).filter(v => !Number.isFinite(v)).length;
  console.log(`relieve    ${dem.cols}×${dem.rows} · fuente ${dem.fuente} · sin dato ${sinDato} · ${((Date.now() - t0) / 1000).toFixed(1)} s`);

  const escalones = proporcionDeMesetas(dem);
  console.log(`           nodos iguales a su vecino del este: ${(escalones * 100).toFixed(1)} %`);
  if (escalones > UMBRAL_MESETAS) {
    throw new Error(
      `El relieve vino ESCALONADO (${(escalones * 100).toFixed(0)} % de nodos repetidos). ` +
      'Es el respaldo de muestreo por nodo, que devuelve el píxel más cercano en vez de ' +
      'interpolar: sobre una meseta el D8 no encuentra vecino más bajo y el agua, las ' +
      'zanjas y el keyline salen vacíos sin un solo error. Volvé a correr para que lea la ' +
      'ventana COG (tarda ~2 min y queda en caché), y si insiste, es que Copernicus no ' +
      'responde.',
    );
  }

  // La fuente del relieve se COMPRUEBA en vez de suponerse. Antes acá decía
  // `fuente: 'glo30'` escrito a mano: si la caché viniera de otro proveedor, la
  // grilla informaría una resolución que no es la suya y eso sale publicado en
  // la procedencia del perfil. `PASO_RELIEVE` es la tabla de la app y es la que
  // decide qué fuentes se saben leer.
  const pasos = PASO_RELIEVE as Partial<Record<string, number>>;
  if (pasos[dem.fuente] == null) {
    throw new Error(
      `El relieve vino de «${dem.fuente}» y PASO_RELIEVE no conoce su paso. La procedencia ` +
      'saldría inventada, así que no se genera nada.');
  }
  const fuente = dem.fuente as FuenteRelieve;

  const elev = Float64Array.from(dem.elev, v => (Number.isFinite(v) ? v : NaN));
  const finitos = Array.from(elev).filter(Number.isFinite);
  const grilla: GrillaElevacion = {
    rows: dem.rows, cols: dem.cols,
    latMin: s, latMax: n, lngMin: w, lngMax: e,
    elev,
    elev_min: Math.min(...finitos),
    elev_max: Math.max(...finitos),
    fuente,
  };

  return { grilla, dem, bbox, anchoM, altoM, cols, rows, paso_fuente_m: pasos[fuente]! };
}
