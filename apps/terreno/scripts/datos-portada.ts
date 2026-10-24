/**
 * El dato de la animación de la portada de acequia.app, generado una vez.
 *
 *   pnpm --filter @arteytierra/terreno portada
 *
 * Escribe `packages/placas/generado/<predio>.json` con el relieve, el color por
 * cota, las curvas de nivel y las cadenas de escorrentía de un predio real.
 * La composición de Remotion lo lee y no vuelve a tocar la red.
 *
 * POR QUÉ NO PASA POR `/api/dem`. La ruta es una cáscara: parsea el bbox,
 * aplica `requiereTopoDe()` —que sin sesión devuelve 401 y con plan Semilla
 * corta por superficie—, mira la caché y llama a `obtenerGrillaDEM()`. Esa
 * función lee los COG de Copernicus por *range request* y no toca ni la base ni
 * la sesión, así que llamándola directo sale el mismo dato del mismo código.
 * El candado está para que un usuario Semilla no le pegue al endpoint, no para
 * el que compila el repo.
 *
 * LA REGLA DEL ENCARGO, que es la que justifica todo este archivo: la animación
 * muestra un predio real leído con los datos de la app, o no se publica. Un
 * relieve modelado con ruido Perlin en una página que promete trazabilidad es
 * la única mentira que acá hace daño.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { obtenerGrillaDEM } from '../lib/elevacion/grilla';
import { atribucionDe } from '../lib/elevacion/atribucion';
import type { BBox } from '../lib/elevacion';
import { shaderDesdeGrilla, colorElevacion, PALETA_SHADER_POR_DEFECTO } from '../lib/shaders';
import { calcularEscorrentias } from '../lib/escorrentias';
import { calcularCurvas, intervaloAutomatico } from '../lib/curvasNivel';
import * as turf from '@turf/turf';
import type { GrillaElevacion } from '../lib/grillaElevacion';

/**
 * Cuetiepa, Chiapas (México). Los siete mojones son los que tiene cargados el
 * proyecto en la app, copiados del panel «Mojones».
 *
 * Es el predio que eligió Jonatan y sirve por lo que mide: 317 m de desnivel en
 * 417 ha, pendiente general del 20 % y el agua bajando al NNE por un valle que
 * se lee de un vistazo. En un campo llano el acto 02 no tendría nada que
 * encender.
 */
const MOJONES = [
  { lat: 17.33037, lng: -92.20731 },
  { lat: 17.34298, lng: -92.19452 },
  { lat: 17.33377, lng: -92.18491 },
  { lat: 17.33094, lng: -92.17740 },
  { lat: 17.31661, lng: -92.18529 },
  { lat: 17.32370, lng: -92.19383 },
  { lat: 17.32702, lng: -92.20223 },
];
const PREDIO = 'cuetiepa';

/**
 * Margen alrededor del predio, igual que `obtenerGrillaDensa`. No es estética:
 * la pendiente de una celda del borde necesita vecinos y el D8 necesita ver de
 * dónde baja el agua. Lo que se INFORMA se recorta después con `dentro`.
 */
const MARGEN = 0.08;

/**
 * 300 nodos de lado sobre ~3,4 km dan un paso de ~11 m, tres veces más fino que
 * los ~30 m del GLO-30. Eso NO inventa relieve: `obtenerGrillaDEM` interpola
 * bilineal entre píxeles reales, que es exactamente lo que hace la vista 3D de
 * la app al drapear. La resolución del dato sigue siendo 30 m y así se cita.
 */
const LADO = Number(process.argv[2]) || 300;

/**
 * Intervalo de las curvas, en metros. El automático sobre 369 m de desnivel
 * devuelve 50, que para un predio de 417 ha dibuja siete anillos y no se lee
 * como relieve. La app en pantalla usa 20 y es el que muestra la captura, así
 * que es el que va.
 */
const INTERVALO_M = 20;

const aqui = path.dirname(fileURLToPath(import.meta.url));
const SALIDA = path.resolve(aqui, '../../../packages/placas/generado');

function bboxDe(mojones: Array<{ lat: number; lng: number }>, margen: number): BBox {
  const lats = mojones.map(m => m.lat), lngs = mojones.map(m => m.lng);
  const s = Math.min(...lats), n = Math.max(...lats);
  const w = Math.min(...lngs), e = Math.max(...lngs);
  const dy = (n - s) * margen, dx = (e - w) * margen;
  return [w - dx, s - dy, e + dx, n + dy];
}

/** Metros entre dos puntos, plano local. Alcanza para un predio. */
function metros(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const dy = (b.lat - a.lat) * 111_320;
  const dx = (b.lng - a.lng) * 111_320 * Math.cos(((a.lat + b.lat) / 2) * Math.PI / 180);
  return Math.hypot(dx, dy);
}

const RUMBOS = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSO','SO','OSO','O','ONO','NO','NNO'];
function rumbo(desde: { lat: number; lng: number }, hacia: { lat: number; lng: number }): string {
  const dy = hacia.lat - desde.lat;
  const dx = (hacia.lng - desde.lng) * Math.cos(((desde.lat + hacia.lat) / 2) * Math.PI / 180);
  const deg = (Math.atan2(dx, dy) * 180 / Math.PI + 360) % 360;
  return RUMBOS[Math.round(deg / 22.5) % 16]!;
}

async function main() {
  const bbox = bboxDe(MOJONES, MARGEN);
  const [w, s, e, n] = bbox;
  const anchoM = metros({ lat: (s + n) / 2, lng: w }, { lat: (s + n) / 2, lng: e });
  const altoM  = metros({ lat: s, lng: (w + e) / 2 }, { lat: n, lng: (w + e) / 2 });
  const cols = LADO;
  const rows = Math.max(2, Math.round(LADO * (altoM / anchoM)));

  console.log(`predio     ${PREDIO} · ${MOJONES.length} mojones`);
  console.log(`bbox       ${w.toFixed(5)}, ${s.toFixed(5)} → ${e.toFixed(5)}, ${n.toFixed(5)}`);
  console.log(`            ${(anchoM / 1000).toFixed(2)} × ${(altoM / 1000).toFixed(2)} km · grilla ${cols}×${rows} · paso ≈ ${(anchoM / cols).toFixed(1)} m`);

  const t0 = Date.now();
  const dem = await obtenerGrillaDEM(bbox, cols, rows);
  if (!dem) throw new Error('obtenerGrillaDEM devolvió null — ¿hay cobertura de GLO-30 en ese bbox?');
  const sinDato = Array.from(dem.elev).filter(v => !Number.isFinite(v)).length;
  console.log(`relieve    ${dem.cols}×${dem.rows} · fuente ${dem.fuente} · sin dato ${sinDato} · ${((Date.now() - t0) / 1000).toFixed(1)} s`);

  const elev = Float64Array.from(dem.elev, v => (Number.isFinite(v) ? v : NaN));
  const finitos = Array.from(elev).filter(Number.isFinite);
  const grilla: GrillaElevacion = {
    rows: dem.rows, cols: dem.cols,
    latMin: s, latMax: n, lngMin: w, lngMax: e,
    elev,
    elev_min: Math.min(...finitos),
    elev_max: Math.max(...finitos),
    fuente: 'glo30',
  };

  const ds = shaderDesdeGrilla(grilla, MOJONES);
  if (!ds) throw new Error('shaderDesdeGrilla devolvió null');
  const adentro = ds.celdas.filter(c => c.dentro !== false);

  // El punto más alto y el más bajo DEL PREDIO, que es lo que informa el panel.
  let alto = adentro[0]!, bajo = adentro[0]!;
  for (const c of adentro) {
    if (c.elevation > alto.elevation) alto = c;
    if (c.elevation < bajo.elevation) bajo = c;
  }
  const centro = (c: typeof alto) => ({ lat: (c.latMin + c.latMax) / 2, lng: (c.lngMin + c.lngMax) / 2 });
  const dist = metros(centro(alto), centro(bajo));
  const pendienteGeneral = ((alto.elevation - bajo.elevation) / dist) * 100;

  console.log('');
  console.log('CONTRA EL PANEL DE LA APP (captura del 23/10/2026)');
  console.log(`  elevación mín.    ${ds.elev_min.toFixed(0)} m        el panel dice 74 m`);
  console.log(`  elevación máx.    ${ds.elev_max.toFixed(0)} m       el panel dice 391 m`);
  console.log(`  desnivel          ${(ds.elev_max - ds.elev_min).toFixed(1)} m     el panel dice 317,1 m`);
  console.log(`  pendiente general ${pendienteGeneral.toFixed(1)} %      el panel dice 20,2 %`);
  console.log(`  escurre hacia     ${rumbo(centro(alto), centro(bajo))}         el panel dice NNE`);
  console.log('');

  const t1 = Date.now();
  const esc = calcularEscorrentias(ds);
  console.log(`agua       ${esc.cadenas.length} cadenas · acumulación máxima ${esc.acum_max} · ${((Date.now() - t1) / 1000).toFixed(1)} s`);

  // Las cadenas se recortan al predio. El D8 corre sobre la grilla entera
  // —necesita ver de dónde baja el agua— pero el halo es andamio: sin recortar,
  // el acto 02 enciende líneas de agua flotando en el negro, afuera del predio,
  // que es justo lo que la app NO dibuja.
  const anillo = MOJONES.map(m => [m.lng, m.lat] as [number, number]);
  anillo.push(anillo[0]!);
  const poligono = turf.polygon([anillo]);
  const adentroDelPredio = (p: { lat: number; lng: number }) =>
    turf.booleanPointInPolygon(turf.point([p.lng, p.lat]), poligono);

  const recortadas: Array<{ acum: number; puntos: Array<{ lat: number; lng: number }> }> = [];
  for (const c of esc.cadenas) {
    let tramo: Array<{ lat: number; lng: number }> = [];
    for (const p of c.puntos) {
      if (adentroDelPredio(p)) tramo.push(p);
      else { if (tramo.length >= 3) recortadas.push({ acum: c.acum_max, puntos: tramo }); tramo = []; }
    }
    if (tramo.length >= 3) recortadas.push({ acum: c.acum_max, puntos: tramo });
  }
  console.log(`           ${recortadas.length} tramos quedan dentro del predio`);

  const intervalo = INTERVALO_M;
  console.log(`           (el automático para este desnivel habría dado ${intervaloAutomatico(ds.elev_max - ds.elev_min, 417.8)} m)`);
  const curvas = calcularCurvas(grilla, intervalo);
  const tramos = curvas.reduce((a, c) => a + c.lineas.length, 0);
  console.log(`curvas     ${curvas.length} cotas cada ${intervalo} m · ${tramos} tramos`);

  // ── El JSON ────────────────────────────────────────────────────────────────
  // Las cotas van redondeadas a 0,1 m: el GLO-30 tiene error de varios metros,
  // así que el decimal que importa es uno y los otros son peso de archivo.
  const paleta = PALETA_SHADER_POR_DEFECTO.elev;
  const datos = {
    predio: PREDIO,
    generado: new Date().toISOString().slice(0, 10),
    fuente: dem.fuente,
    atribucion: atribucionDe(dem.fuente),
    resolucion_m: 30,
    bbox,
    cols: dem.cols,
    rows: dem.rows,
    paso_m: Math.round((anchoM / cols) * 10) / 10,
    elev_min: Math.round(ds.elev_min * 10) / 10,
    elev_max: Math.round(ds.elev_max * 10) / 10,
    pendiente_general_pct: Math.round(pendienteGeneral * 10) / 10,
    escurre_hacia: rumbo(centro(alto), centro(bajo)),
    mojones: MOJONES,
    paleta,
    /**
     * La rampa de color entera, muestreada en 256 pasos entre la cota mínima y
     * la máxima DEL PREDIO. Va acá y no se recalcula en el render por una razón
     * de principio: la paleta es la de la app (`colorElevacion`), y si el video
     * la reimplementara, el día que la app cambie de rampa la portada mostraría
     * una que ya no existe.
     */
    rampa: Array.from({ length: 256 }, (_, i) =>
      colorElevacion(
        ds.elev_min + (i / 255) * (ds.elev_max - ds.elev_min),
        ds.elev_min, ds.elev_max, paleta,
      )),
    /** row-major, fila 0 = sur. `null` = sin dato. */
    elev: Array.from(elev, v => (Number.isFinite(v) ? Math.round(v * 10) / 10 : null)),
    /** 1 = el nodo cae dentro del polígono del predio. */
    dentro: (() => {
      const m = new Uint8Array(dem.rows * dem.cols);
      for (const c of ds.celdas) if (c.dentro !== false) m[c.row * dem.cols + c.col] = 1;
      return Array.from(m);
    })(),
    intervalo_curvas_m: intervalo,
    // Las curvas tambien se recortan al predio, por la misma razon que el agua
    // y con el mismo metodo: la app las dibuja adentro del perimetro y no sobre
    // el campo del vecino. Ademas es lo que hace reconocible al predio en el
    // ultimo cuadro, que es el que queda fijo.
    curvas: curvas.map(c => ({
      cota: c.cota,
      lineas: c.lineas.flatMap(l => {
        const tramos: Array<Array<[number, number]>> = [];
        let tramo: Array<[number, number]> = [];
        for (const p of l.puntos) {
          if (adentroDelPredio(p)) {
            tramo.push([Math.round(p.lng * 1e6) / 1e6, Math.round(p.lat * 1e6) / 1e6]);
          } else {
            if (tramo.length >= 2) tramos.push(tramo);
            tramo = [];
          }
        }
        if (tramo.length >= 2) tramos.push(tramo);
        return tramos.map(puntos => ({ cerrada: false, puntos }));
      }),
    })).filter(c => c.lineas.length > 0),
    /** Ordenadas de menor a mayor acumulación: el acto 02 las enciende así. */
    cadenas: recortadas
      .slice()
      .sort((a, b) => a.acum - b.acum)
      .map(c => ({
        acum: c.acum,
        puntos: c.puntos.map(p => [
          Math.round(p.lng * 1e6) / 1e6,
          Math.round(p.lat * 1e6) / 1e6,
        ]),
      })),
    acum_max: esc.acum_max,
  };

  mkdirSync(SALIDA, { recursive: true });
  const destino = path.join(SALIDA, `${PREDIO}.json`);
  writeFileSync(destino, JSON.stringify(datos));
  const kb = (Buffer.byteLength(JSON.stringify(datos)) / 1024).toFixed(0);
  console.log('');
  console.log(`escrito    ${destino}  (${kb} KB)`);
}

main().catch(e => { console.error(e); process.exit(1); });
