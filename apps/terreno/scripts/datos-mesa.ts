/**
 * El dato del ENCARGO 03 — la secuencia de la mesa de trabajo, el perfil del
 * terreno y el par crudo/leído.
 *
 *   pnpm --filter @arteytierra/terreno datos-mesa
 *
 * Escribe dos archivos:
 *
 *   packages/placas/generado/cuetiepa-mesa.json   lo que dibuja la animación
 *   …/salida-encargo-03/perfil-del-terreno.json   la ENTREGA B, que no es video
 *
 * Es un generador aparte del de la portada **a propósito**: las diez piezas del
 * encargo 02 están aprobadas sobre `cuetiepa.json` y ese archivo no se vuelve a
 * tocar. Lo que los dos comparten —los mojones, el margen, la grilla, el
 * relieve en caché— vive en `predio-portada.ts`, así que las capas nuevas caen
 * exactamente sobre las viejas.
 *
 * ── Lo que este archivo NO inventa, y es la mitad del trabajo ───────────────
 *
 * El encargo pide para el acto 04 «emplazamiento, caminos y zonificación por
 * frecuencia de visita», y nombra `zonificacion.ts`. Leído el código:
 *
 *   · `emplazamiento.ts` SÍ calcula. `prepararEmplazamiento` +
 *     `evaluarEmplazamiento` dicen, celda por celda, si el terreno admite una
 *     construcción y por qué no cuando no. Eso es la capa, y no es «acá va la
 *     casa»: es dónde el terreno la rechaza.
 *   · `caminos.ts` NO calcula un camino. Es la herramienta de dibujo: toma los
 *     vértices que traza el usuario y le mide el largo y el perfil. Lo que sí
 *     rutea sobre el relieve es `trazarCaminoRelieve` en `cuencaHidro.ts`
 *     —criterio Yeomans: por las divisorias, cruzando las vertientes en un
 *     punto—, y es lo que usa el master plan. Ése es el camino que se dibuja.
 *   · `zonificacion.ts` TAMPOCO calcula las zonas de Mollison: define las
 *     categorías y mide el área de los polígonos que dibuja el usuario.
 *     `zonificacionGuiada.ts` las verifica, no las genera. Lo que la app sí
 *     calcula es **el tiempo de caminata sobre el relieve real** (Tobler), y su
 *     propia constante `EL_ANILLO_NO_ES_LA_ZONA` dice que lo que define la zona
 *     es la frecuencia de visita y que «el terreno decide dónde se puede ir
 *     seguido». Así que la capa son isócronas de ida y vuelta a pie: no son
 *     anillos concéntricos, se estiran sobre la curva de nivel y se aplastan
 *     contra la ladera, que es justo lo que la fuente dice que pasa.
 *
 * `calcularMasterPlan` sí ubicaría viviendas y potreros, pero pide un
 * **programa declarado** —cuántas casas, cuántas hectáreas de qué— que este
 * predio no tiene. Inventarlo sería inventar el proyecto del cliente.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as turf from '@turf/turf';

import { shaderDesdeGrilla } from '../lib/shaders';
import { atribucionDe } from '../lib/elevacion/atribucion';
import {
  N8, analizarRelieve, buscarSitiosRepresa, dimsCelda, trazarCaminoRelieve,
} from '../lib/cuencaHidro';
import { CELDAS_MINIMAS_MURO, nivelVaso, vasoDesdeMuro } from '../lib/vaso';
import {
  PENDIENTE_CAMINO_NORMAL_PCT, evaluarEmplazamiento, indiceDePunto,
  prepararEmplazamiento, resumenEmplazamiento,
} from '../lib/emplazamiento';
import { FRECUENCIA_ZONA, costoDeCaminata, velocidadTobler } from '../lib/zonificacionGuiada';
import { CATEGORIAS_ZONA } from '../lib/zonificacion';
import type { GrillaElevacion } from '../lib/grillaElevacion';
import { MOJONES, PREDIO, grillaDelPredio, metros, red } from './predio-portada';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const GENERADO = path.resolve(aqui, '../../../packages/placas/generado');
const ENTREGA = 'C:\\Arte y Tierra\\Acequia\\portada animacion\\salida-encargo-03';

type Punto = { lat: number; lng: number };
type Par = [number, number];

/** Cuántos puntos tiene la serie del perfil. El encargo pide 120 a 200. */
const PUNTOS_PERFIL = 180;

/**
 * Los cortes de las isócronas, en MINUTOS de ida y vuelta a pie.
 *
 * Son números redondos y elegidos, y por eso se dicen. Lo que no se elige es su
 * consecuencia: para cada corte se publica —con `costoDeCaminata`, que es la
 * función de la app— cuántas horas por año cuesta llegar hasta ahí con el
 * presupuesto de viajes que cada zona de Mollison declara. Ése es el número que
 * decide si una zona está bien puesta, y no el radio del anillo.
 */
const CORTES_MIN = [5, 10, 20, 40];

/** El edificio con el que se mide la plataforma: el que trae la app por defecto. */
const EDIFICIO = { ancho_m: 10, largo_m: 12 };

const r1 = (x: number) => Math.round(x * 10) / 10;
const r2 = (x: number) => Math.round(x * 100) / 100;

// ─── Utilidades sobre la grilla ──────────────────────────────────────────────

function latLngDe(g: GrillaElevacion, r: number, c: number): Punto {
  const dLat = (g.latMax - g.latMin) / (g.rows - 1);
  const dLng = (g.lngMax - g.lngMin) / (g.cols - 1);
  return { lat: g.latMin + r * dLat, lng: g.lngMin + c * dLng };
}

/**
 * La cota en un punto cualquiera, interpolada bilineal entre los cuatro nodos
 * que lo rodean.
 *
 * Es la misma interpolación con la que `obtenerGrillaDEM` lee los píxeles del
 * COG, así que el perfil no es más fino que el dato: es el dato leído entre sus
 * nodos, igual que lo hace la vista 3D al drapear.
 */
function cotaEn(g: GrillaElevacion, p: Punto): number {
  const fr = ((p.lat - g.latMin) / (g.latMax - g.latMin)) * (g.rows - 1);
  const fc = ((p.lng - g.lngMin) / (g.lngMax - g.lngMin)) * (g.cols - 1);
  const r0 = Math.floor(fr), c0 = Math.floor(fc);
  if (r0 < 0 || c0 < 0 || r0 >= g.rows - 1 || c0 >= g.cols - 1) return NaN;
  const tr = fr - r0, tc = fc - c0;
  const z = (r: number, c: number) => g.elev[r * g.cols + c]!;
  const a = z(r0, c0), b = z(r0, c0 + 1), c_ = z(r0 + 1, c0), d = z(r0 + 1, c0 + 1);
  if (![a, b, c_, d].every(Number.isFinite)) return NaN;
  return (a * (1 - tc) + b * tc) * (1 - tr) + (c_ * (1 - tc) + d * tc) * tr;
}

/**
 * Junta en un rectángulo por fila las celdas contiguas con el mismo valor.
 *
 * Es la misma técnica que el shader vectorial de la portada y por la misma
 * razón: sin esto son 83.100 polígonos de 12,3 m, uno por nodo, y cada borde
 * interno es una costura que el antialias dibuja.
 */
function rectangulos<T extends string | number>(
  g: GrillaElevacion,
  valor: (i: number) => T | null,
  props: (v: T) => Record<string, unknown>,
) {
  const dLat = (g.latMax - g.latMin) / (g.rows - 1);
  const dLng = (g.lngMax - g.lngMin) / (g.cols - 1);
  const features: Array<{
    type: 'Feature'; properties: Record<string, unknown>;
    geometry: { type: 'Polygon'; coordinates: Par[][] };
  }> = [];
  for (let r = 0; r < g.rows; r++) {
    const lat = g.latMin + r * dLat;
    const y0 = lat - dLat / 2, y1 = lat + dLat / 2;
    let actual: T | null = null, desde = 0;
    // El barrido llega hasta `cols` —una columna de más, siempre vacía— para
    // cerrar el último tramo de la fila sin repetir el código afuera del bucle.
    for (let c = 0; c <= g.cols; c++) {
      const v = c < g.cols ? valor(r * g.cols + c) : null;
      if (v === actual) continue;
      if (actual !== null) {
        const x0 = g.lngMin + (desde - 0.5) * dLng;
        const x1 = g.lngMin + (c - 0.5) * dLng;
        features.push({
          type: 'Feature',
          properties: props(actual),
          geometry: {
            type: 'Polygon',
            coordinates: [[[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]],
          },
        });
      }
      actual = v; desde = c;
    }
  }
  return { type: 'FeatureCollection' as const, features };
}

/** Min-heap por costo, con el índice de celda como carga. */
class Cola {
  private k: number[] = [];
  private v: number[] = [];
  get size() { return this.k.length; }
  push(costo: number, i: number) {
    this.k.push(costo); this.v.push(i);
    let n = this.k.length - 1;
    while (n > 0) {
      const p = (n - 1) >> 1;
      if (this.k[p]! <= this.k[n]!) break;
      [this.k[p], this.k[n]] = [this.k[n]!, this.k[p]!];
      [this.v[p], this.v[n]] = [this.v[n]!, this.v[p]!];
      n = p;
    }
  }
  pop(): number {
    const top = this.v[0]!;
    const lk = this.k.pop()!, lv = this.v.pop()!;
    if (this.k.length > 0) {
      this.k[0] = lk; this.v[0] = lv;
      let n = 0;
      for (;;) {
        const a = 2 * n + 1, b = a + 1;
        let m = n;
        if (a < this.k.length && this.k[a]! < this.k[m]!) m = a;
        if (b < this.k.length && this.k[b]! < this.k[m]!) m = b;
        if (m === n) break;
        [this.k[m], this.k[n]] = [this.k[n]!, this.k[m]!];
        [this.v[m], this.v[n]] = [this.v[n]!, this.v[m]!];
        n = m;
      }
    }
    return top;
  }
}

/**
 * El tiempo de caminata desde un centro hasta cada celda, en horas.
 *
 * Dijkstra de ocho vecinos sobre el relieve, con el costo de cada paso dado por
 * **la función de Tobler de la app** (`velocidadTobler`), fuera de sendero —el
 * factor 3/5 de la fuente—, que es lo que corresponde en un predio donde el
 * camino todavía no existe.
 *
 * Se corre DOS VECES porque la función es asimétrica: subir una ladera y
 * bajarla no cuestan lo mismo, y el viaje redondo no es el doble de ninguno de
 * los dos. `ida` usa la pendiente tal cual; `vuelta` la usa invertida, que es
 * el costo de volver por ese mismo paso. La suma de los dos mínimos es un
 * **piso** del redondo —cada pierna puede tomar su propio camino— y eso es
 * coherente con lo que la propia biblioteca advierte de estos tiempos: son un
 * piso, no una estimación de la jornada.
 */
function horasDeCaminata(g: GrillaElevacion, centro: Punto) {
  const { rows, cols, elev } = g;
  const n = rows * cols;
  const { dist } = dimsCelda(g);
  const origen = indiceDePunto(g, centro.lat, centro.lng);
  if (origen == null) throw new Error('el centro de la caminata no cae en la grilla');

  const corrida = (invertida: boolean) => {
    const D = new Float64Array(n).fill(Infinity);
    const visto = new Uint8Array(n);
    const cola = new Cola();
    D[origen] = 0;
    cola.push(0, origen);
    while (cola.size > 0) {
      const i = cola.pop();
      if (visto[i]) continue;
      visto[i] = 1;
      const r = (i / cols) | 0, c = i % cols;
      const z = elev[i]!;
      for (let k = 0; k < 8; k++) {
        const nr = r + N8[k]![0], nc = c + N8[k]![1];
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
        const j = nr * cols + nc;
        if (visto[j]) continue;
        const nz = elev[j]!;
        if (Number.isNaN(nz) || Number.isNaN(z)) continue;
        const largo = dist[k]!;
        const s = ((invertida ? z - nz : nz - z) / largo);
        const v = velocidadTobler(s, { fuera_de_sendero: true });
        if (!(v > 0)) continue;
        const d = D[i]! + (largo / 1000) / v;
        if (d < D[j]!) { D[j] = d; cola.push(d, j); }
      }
    }
    return D;
  };

  const ida = corrida(false);
  const vuelta = corrida(true);
  const redondo = new Float64Array(n);
  for (let i = 0; i < n; i++) redondo[i] = ida[i]! + vuelta[i]!;
  return { ida, vuelta, redondo, origen };
}

// ─── El programa ─────────────────────────────────────────────────────────────

async function main() {
  const { grilla, dem, bbox, anchoM, paso_fuente_m } = await grillaDelPredio(
    GENERADO, undefined, process.argv.includes('--refrescar'));
  const { rows, cols } = grilla;
  const { areaCelda } = dimsCelda(grilla);

  const ds = shaderDesdeGrilla(grilla, MOJONES);
  if (!ds) throw new Error('shaderDesdeGrilla devolvió null');
  const adentro = ds.celdas.filter(c => c.dentro !== false);

  const dentro = new Uint8Array(rows * cols);
  for (const c of adentro) dentro[c.row * cols + c.col] = 1;

  const anillo = MOJONES.map(m => [m.lng, m.lat] as Par);
  anillo.push(anillo[0]!);
  const poligono = turf.polygon([anillo]);
  const esDelPredio = (p: Punto) =>
    turf.booleanPointInPolygon(turf.point([p.lng, p.lat]), poligono);

  // El punto más alto y el más bajo DEL PREDIO, que es lo que informa el panel.
  let alto = adentro[0]!, bajo = adentro[0]!;
  for (const c of adentro) {
    if (c.elevation > alto.elevation) alto = c;
    if (c.elevation < bajo.elevation) bajo = c;
  }
  const centroDe = (c: typeof alto): Punto =>
    ({ lat: (c.latMin + c.latMax) / 2, lng: (c.lngMin + c.lngMax) / 2 });
  const pAlto = centroDe(alto), pBajo = centroDe(bajo);
  const pendienteGeneral = ((alto.elevation - bajo.elevation) / metros(pAlto, pBajo)) * 100;

  console.log('');
  console.log(`predio     ${adentro.length} celdas adentro · ${r1(adentro.length * areaCelda / 1e4)} ha`);
  console.log(`           cota ${ds.elev_min.toFixed(0)} a ${ds.elev_max.toFixed(0)} m · pendiente general ${pendienteGeneral.toFixed(1)} %`);

  // ── ENTREGA B · El perfil del terreno ──────────────────────────────────────
  //
  // «Una línea que cruce el predio por donde el relieve se entienda mejor» no
  // se elige a ojo: es la línea del punto más alto al más bajo del predio, que
  // es la misma que define la pendiente general que el panel informa. Se
  // prolonga a los dos lados hasta el perímetro, así que la traza entra y sale
  // por un mojón a mojón y no empieza en el medio del campo.
  const traza = (() => {
    const dLat = pBajo.lat - pAlto.lat, dLng = pBajo.lng - pAlto.lng;
    // Se estira muy largo y se corta contra el polígono: así los extremos son
    // el perímetro y no un múltiplo arbitrario de la recta alto→bajo.
    const k = 4;
    const l1 = turf.lineString([
      [pAlto.lng - dLng * k, pAlto.lat - dLat * k],
      [pBajo.lng + dLng * k, pBajo.lat + dLat * k],
    ]);
    const corte = turf.lineSplit(l1, turf.polygonToLine(poligono) as never);
    // De los tramos que deja el corte, el que vale es el que está adentro.
    let mejor: Par[] | null = null, largo = -1;
    for (const f of corte.features) {
      const cs = (f.geometry.coordinates as Par[]);
      const medio = cs[Math.floor(cs.length / 2)]!;
      if (!esDelPredio({ lat: medio[1], lng: medio[0] })) continue;
      const l = turf.length(f, { units: 'meters' });
      if (l > largo) { largo = l; mejor = cs; }
    }
    if (!mejor) throw new Error('la traza del perfil no cortó el perímetro');
    return { entrada: mejor[0]!, salida: mejor[mejor.length - 1]!, largo_m: largo };
  })();

  const perfil = Array.from({ length: PUNTOS_PERFIL }, (_, i) => {
    const t = i / (PUNTOS_PERFIL - 1);
    const lng = traza.entrada[0] + (traza.salida[0] - traza.entrada[0]) * t;
    const lat = traza.entrada[1] + (traza.salida[1] - traza.entrada[1]) * t;
    return {
      distancia_m: r1(traza.largo_m * t),
      cota_m: r1(cotaEn(grilla, { lat, lng })),
    };
  });
  const cotas = perfil.map(p => p.cota_m).filter(Number.isFinite);
  console.log(`perfil     ${perfil.length} puntos sobre ${Math.round(traza.largo_m)} m · ` +
    `cota ${Math.min(...cotas).toFixed(0)} a ${Math.max(...cotas).toFixed(0)} m`);

  // ── La represa posible, con su vaso y su muro ──────────────────────────────
  //
  // El sitio lo elige el terreno: `buscarSitiosRepresa` recorre los cauces,
  // prueba muros a varias alturas y rankea por eficiencia agua/muro. Con las
  // mismas opciones que el encargo 02, así que es EL MISMO sitio que ya se ve
  // en la lectura de represas.
  const sitios = buscarSitiosRepresa(grilla, { clip: MOJONES, max: 3 });
  if (sitios.length === 0) throw new Error('el relieve no encuentra un cierre dentro del predio');
  const rel = analizarRelieve(grilla);
  const { dx: pasoX, dy: pasoY } = dimsCelda(grilla);
  const paso = (pasoX + pasoY) / 2;

  /**
   * El eje del muro de un sitio: perpendicular a por dónde baja el agua en la
   * celda del cierre, caminando a los dos lados mientras el terreno esté por
   * debajo del pelo de agua.
   *
   * Es el mismo criterio con que `buscarSitiosRepresa` mide `ancho_muro_m`, y
   * para que eso no sea una afirmación se COMPARA con el número que devolvió la
   * librería: si los dos anchos no coinciden dentro de una celda, la
   * reimplementación se separó y el muro que se dibuja no es el que se midió.
   */
  const ejeDelMuro = (s: typeof sitios[number]) => {
    const d = indiceDePunto(grilla, s.lat, s.lng);
    if (d == null) return null;
    const { dist } = dimsCelda(grilla);
    const r0 = (d / cols) | 0, c0 = d % cols;
    // Por dónde baja: el vecino de máxima pendiente descendente sobre el
    // terreno relleno, que es la definición del D8.
    let mejor = -1, mejorS = 0;
    for (let k = 0; k < 8; k++) {
      const nr = r0 + N8[k]![0], nc = c0 + N8[k]![1];
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      const pend = (rel.filled[d]! - rel.filled[nr * cols + nc]!) / dist[k]!;
      if (pend > mejorS) { mejorS = pend; mejor = k; }
    }
    if (mejor < 0) return null;
    const [dr, dc] = N8[mejor]!;
    const pr = -dc, pc = dr;                     // perpendicular al flujo
    const L = rel.filled[d]! + s.altura_m;       // pelo de agua
    const punta = (signo: number) => {
      let rr = r0, cc = c0, pasos = 0;
      for (let k = 0; k < 80; k++) {
        const nr = rr + pr * signo, nc = cc + pc * signo;
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) break;
        const e = rel.filled[nr * cols + nc]!;
        if (Number.isNaN(e) || e >= L) break;
        rr = nr; cc = nc; pasos++;
      }
      return { punto: latLngDe(grilla, rr, cc), pasos };
    };
    const p1 = punta(1), p2 = punta(-1);
    const celdas = p1.pasos + p2.pasos + 1;
    return { a: p1.punto, b: p2.punto, ancho_m: celdas * paso, celdas };
  };

  /**
   * El muro se dibuja, y el vaso NO se certifica. Las dos cosas son el mismo
   * hallazgo y hay que decirlo entero.
   *
   * `buscarSitiosRepresa` rankea por eficiencia agua/muro, y la eficiencia
   * premia siempre al muro más corto: con las alturas que la app trae por
   * defecto —3, 5 y 8 m— los tres sitios de este predio cierran en 25 m, que
   * sobre una grilla de 12,3 m son DOS CELDAS. `vaso.ts` tiene su propio piso
   * para eso (`CELDAS_MINIMAS_MURO = 3`) y además marca `derramePorEstribo`
   * cuando la silla de montar cae a dos celdas o menos del eje del muro.
   *
   * Barridas las alturas de 3 a 20 m sobre los tres sitios —ver
   * `sondeo-represa.ts`—, LAS VEINTISIETE combinaciones marcan
   * `derramePorEstribo`. Eso no es que el terreno no retenga: es que con un
   * muro de 2 a 5 celdas y un radio de prueba de 2 celdas, el test no puede
   * distinguir una silla del vaso del final del muro. A esta resolución la app
   * puede UBICAR un cierre y no puede CERTIFICAR que pare.
   *
   * Así que la pieza dibuja lo que la app sí publica —el cierre, el ancho del
   * muro y el espejo que inunda, que es lo mismo que muestra el panel— más la
   * cota de derrame que calcula `vaso.ts`, y el documento se lleva la
   * advertencia. Lo que no se hace es tapar el aviso ni inventar un muro más
   * largo para que el número cierre.
   */
  /** Cada sitio, con el muro puesto y el vaso llenado: qué dice cada prueba. */
  const candidatos = sitios.map((s, i) => {
    const eje = ejeDelMuro(s);
    if (!eje) return { s, i, eje: null, vaso: null, motivo: 'el cierre no cae en la grilla' };
    const dif = Math.abs(eje.ancho_m - s.ancho_muro_m);
    if (dif > pasoX) {
      return { s, i, eje, vaso: null,
        motivo: `el eje reconstruido mide ${r1(eje.ancho_m)} m y la librería ${s.ancho_muro_m} m` };
    }
    const centro = s.espejo.length >= 3
      ? (() => {
          const anillo = s.espejo.map(p => [p.lng, p.lat] as Par);
          anillo.push(anillo[0]!);
          const c = turf.centroid(turf.polygon([anillo]));
          return { lat: c.geometry.coordinates[1]!, lng: c.geometry.coordinates[0]! };
        })()
      : undefined;
    const v = vasoDesdeMuro(grilla, { a: eje.a, b: eje.b },
      centro ? { referenciaAguasArriba: centro } : undefined);
    if (!v) return { s, i, eje, vaso: null, motivo: 'vasoDesdeMuro devolvió null' };
    const motivo =
      eje.celdas < CELDAS_MINIMAS_MURO
        ? `el muro ocupa ${eje.celdas} celdas de ${paso.toFixed(0)} m y el mínimo son ${CELDAS_MINIMAS_MURO}`
        : v.derramePorEstribo
          ? 'el agua se derrama por la punta del muro: no lo arregla un vertedero, hay que alargarlo'
          : null;
    return { s, i, eje, vaso: v, motivo };
  });

  console.log(`represa    ${sitios.length} sitios, probados con el muro puesto:`);
  for (const c of candidatos) {
    console.log(`           #${c.i + 1} ${c.s.lat.toFixed(5)}, ${c.s.lng.toFixed(5)} · muro ${c.s.ancho_muro_m} m` +
      ` × ${c.s.altura_m} m · eficiencia ${c.s.eficiencia}` +
      (c.eje ? ` · eje ${r1(c.eje.ancho_m)} m sobre ${c.eje.celdas} celdas` : '') +
      (c.vaso ? ` · derrame ${r1(c.vaso.cotaDerrame_m)} m (${c.vaso.tipoTope})` : '') +
      (c.motivo ? `  ✗ ${c.motivo}` : '  ✓ retiene'));
  }

  const elegido = candidatos[0]!;
  if (!elegido.eje) throw new Error(`no se pudo reconstruir el eje del muro: ${elegido.motivo}`);
  const sitio = elegido.s;
  const muro = elegido.eje;
  const vaso = elegido.vaso;
  const certificado = candidatos.some(c => c.vaso && !c.motivo);
  console.log(`           va el #${elegido.i + 1} — el que elige la app por eficiencia`);
  console.log(`           ¿alguno pasa las dos pruebas de vaso.ts? ${certificado ? 'sí' : 'NINGUNO'}`);

  // El pelo de agua que se dibuja es el del buscador: la altura de muro que
  // eligió sobre la cota del cauce. Es el nivel al que corresponde el espejo
  // que publica, y el que ya se ve en la lectura de represas del encargo 02.
  const nivelDisenio = sitio.elev + sitio.altura_m;
  const nv = vaso ? nivelVaso(vaso, nivelDisenio) : null;
  if (vaso) {
    console.log(`           vaso.ts: fondo ${r1(vaso.cotaFondo_m)} m · derrame ${r1(vaso.cotaDerrame_m)} m ` +
      `(${vaso.tipoTope}) · pelo del buscador ${r1(nivelDisenio)} m`);
    for (const av of vaso.advertencias) console.log(`           aviso: ${av}`);
  }
  console.log(`           el buscador: espejo ${sitio.area_ha} ha · ${sitio.volumen_agua_m3.toLocaleString('es-AR')} m³ · ` +
    `muro de ${sitio.volumen_muro_m3.toLocaleString('es-AR')} m³`);

  // El espejo que se dibuja es el anillo que publica `buscarSitiosRepresa`
  // para ESTE sitio: el mismo que ya muestra el panel de la app y el mismo que
  // dibuja la lectura de represas del encargo 02. No se recalcula acá, porque
  // dos espejos distintos del mismo cierre en dos piezas de la misma página es
  // exactamente lo que no puede pasar.
  const geoEspejo = {
    type: 'FeatureCollection' as const,
    features: sitio.espejo.length >= 4 ? [{
      type: 'Feature' as const,
      properties: { area_ha: sitio.area_ha },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[...sitio.espejo.map(red), red(sitio.espejo[0]!)]],
      },
    }] : [],
  };
  // ── El emplazamiento ───────────────────────────────────────────────────────
  //
  // El acceso al predio: la celda de borde MÁS BAJA. No es una preferencia, es
  // la regla que ya usa `calcularMasterPlan` cuando el usuario no marcó la
  // tranquera —«por donde suele entrar el camino»— y acá se aplica igual.
  const acceso = (() => {
    const esBorde = (c: typeof alto) =>
      !dentro[(c.row - 1) * cols + c.col] || !dentro[(c.row + 1) * cols + c.col] ||
      !dentro[c.row * cols + c.col - 1] || !dentro[c.row * cols + c.col + 1];
    const borde = adentro.filter(esBorde);
    const b = borde.reduce((m, c) => (c.elevation < m.elevation ? c : m), borde[0]!);
    return centroDe(b);
  })();

  const ctx = prepararEmplazamiento(grilla, acceso, {
    ancho_m: EDIFICIO.ancho_m, largo_m: EDIFICIO.largo_m,
    camino_limite_pct: PENDIENTE_CAMINO_NORMAL_PCT,
  });
  if (!ctx) throw new Error('prepararEmplazamiento devolvió null');

  // Celda por celda: ¿el terreno la admite? y si no, ¿por cuál regla?
  const reglaDe = new Map<number, string>();
  const libres: Array<{ i: number; corte: number; camino: number }> = [];
  for (const c of adentro) {
    const i = c.row * cols + c.col;
    const ev = evaluarEmplazamiento(ctx, i);
    if (!ev) continue;
    if (ev.excluido) { reglaDe.set(i, ev.exclusiones[0]!.regla); continue; }
    libres.push({
      i,
      corte: ev.plataforma?.vol_corte_m3 ?? Infinity,
      camino: ev.camino?.largo_m ?? Infinity,
    });
  }
  const resumen = resumenEmplazamiento(ctx);
  console.log(`emplaza.   ${libres.length} de ${adentro.length} celdas admiten una construcción ` +
    `(${r1(libres.length * areaCelda / 1e4)} de ${r1(adentro.length * areaCelda / 1e4)} ha)`);
  for (const p of resumen.por_regla.filter(p => p.celdas > 0)) {
    console.log(`           saca ${String(p.pct).padStart(5)} % · ${p.titulo}`);
  }

  // ── Los caminos: el corredor que el terreno deja ──────────────────────────
  //
  // Lo que se dibuja NO es una línea elegida: es el CORREDOR entero que el
  // terreno admite, o sea todas las celdas a las que se llega desde el acceso
  // sin que ningún tramo pase del límite de pendiente. Es el objeto con el que
  // `accesibilidad()` decide la exclusión «Sin camino posible», que es la que
  // saca el 95,5 % del predio, y verlo explica el acto entero: lo que descarta
  // la tierra acá no es la pendiente de la plataforma, es llegar.
  //
  // Por qué no una línea: elegir UN sitio y dibujar SU camino obliga a elegir
  // el sitio, y probadas las 434 celdas que el terreno admite, la mejor por
  // costo de plataforma se alcanza sólo saliéndose del predio y la siguiente
  // es la celda del acceso misma —camino de cero metros—. Las dos son
  // respuestas correctas del criterio y ninguna es una imagen. El corredor no
  // hay que elegirlo: ya está calculado.
  //
  // Una cosa que salió de mirar esto y va al documento: `accesibilidad()` dice
  // de sí misma que un lugar inalcanzable es uno al que no se llega «ni
  // zigzagueando DENTRO DEL PREDIO», pero corre su Dijkstra sobre la grilla
  // entera, que llega hasta 1,08× el polígono. Acá se informa cuánto del
  // corredor cae afuera; lo que se DIBUJA se recorta al predio, porque un
  // camino por tierra del vecino no es un camino: es una servidumbre que hay
  // que negociar.
  const largoCamino = ctx.camino_largo_m;
  if (!largoCamino) throw new Error('accesibilidad() no devolvió el campo de distancias');
  let corredorDentro = 0, corredorFuera = 0;
  for (let i = 0; i < rows * cols; i++) {
    if (!Number.isFinite(largoCamino[i]!)) continue;
    if (dentro[i]) corredorDentro++; else corredorFuera++;
  }
  console.log(`caminos    el corredor de ≤ ${ctx.camino_limite_pct} % llega a ${corredorDentro} celdas del predio ` +
    `(${r1(corredorDentro * areaCelda / 1e4)} ha, ${r1(corredorDentro / adentro.length * 100)} %) ` +
    `y a ${corredorFuera} del halo, que no se dibujan`);

  // El corredor se dibuja en tramos por distancia al acceso, para que el acto
  // lo pueda ir encendiendo como se recorre: desde la tranquera hacia adentro.
  const PASOS_CORREDOR = 8;
  let largoMax = 0;
  for (let i = 0; i < rows * cols; i++) {
    if (dentro[i] && Number.isFinite(largoCamino[i]!) && largoCamino[i]! > largoMax) largoMax = largoCamino[i]!;
  }
  const geoCorredor = rectangulos(
    grilla,
    i => {
      if (!dentro[i] || !Number.isFinite(largoCamino[i]!)) return null;
      return Math.min(PASOS_CORREDOR - 1, Math.floor((largoCamino[i]! / Math.max(1, largoMax)) * PASOS_CORREDOR));
    },
    t => ({ t }),
  );

  // El sitio NO se dibuja, y queda en el archivo para el documento: entre las
  // celdas que el terreno admite, la que pide menos movimiento de tierra.
  if (libres.length === 0) throw new Error('el terreno no admite ninguna construcción');
  libres.sort((a, b) => (a.corte - b.corte) || (a.camino - b.camino));
  const iSitio = libres[0]!.i;
  const sitioCasa = latLngDe(grilla, (iSitio / cols) | 0, iSitio % cols);
  const evSitio = evaluarEmplazamiento(ctx, iSitio)!;
  console.log(`           el mejor sitio por plataforma: ${sitioCasa.lat.toFixed(5)}, ${sitioCasa.lng.toFixed(5)} · ` +
    `pendiente ${evSitio.pendiente_pct} % · ${evSitio.posicion} · corte ${evSitio.plataforma?.vol_corte_m3 ?? '—'} m³ · ` +
    `camino ${evSitio.camino?.largo_m ?? '—'} m (no se dibuja)`);
  // ── La caminata, que es lo que la app llama «frecuencia de visita» ─────────
  const t0 = Date.now();
  const { redondo } = horasDeCaminata(grilla, sitioCasa);
  const minutos = (i: number) => redondo[i]! * 60;
  const dentroMin = adentro.map(c => minutos(c.row * cols + c.col)).filter(Number.isFinite);
  const maxMin = Math.max(...dentroMin);
  console.log(`caminata   Tobler fuera de sendero, ida y vuelta desde el sitio · ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  console.log(`           el rincón más lejos del predio está a ${r1(maxMin)} min de ida y vuelta`);

  const banda = (i: number): number | null => {
    if (!dentro[i]) return null;
    const m = minutos(i);
    if (!Number.isFinite(m)) return null;
    for (let k = 0; k < CORTES_MIN.length; k++) if (m <= CORTES_MIN[k]!) return k;
    return CORTES_MIN.length;      // más lejos que el último corte
  };
  const COLOR_BANDA = [
    CATEGORIAS_ZONA.zona_1.color, CATEGORIAS_ZONA.zona_2.color,
    CATEGORIAS_ZONA.zona_3.color, CATEGORIAS_ZONA.zona_4.color,
    CATEGORIAS_ZONA.zona_5.color,
  ];
  const geoCaminata = rectangulos(grilla, banda, b => ({ b, c: COLOR_BANDA[b] }));

  // Qué cuesta cada corte por año, con el presupuesto de viajes que cada zona
  // declara. Es la consecuencia MEDIDA de un corte ELEGIDO.
  const costos = CORTES_MIN.map((min, k) => {
    const zona = k + 1;
    // Un tramo equivalente: la mitad del tiempo redondo es la ida, y el costo
    // anual se calcula con la función de la app sobre ese tramo.
    const c = costoDeCaminata(zona, [{ largo_m: 1, desnivel_m: 0 }]);
    const horasRedondo = min / 60;
    const [vMin, vMax] = FRECUENCIA_ZONA[zona]!.viajes_anio ?? [0, 0];
    return {
      corte_min: min,
      zona,
      frecuencia: FRECUENCIA_ZONA[zona]!.textual,
      viajes_anio: [vMin, vMax] as [number, number],
      horas_anio: [r1(horasRedondo * vMin), r1(horasRedondo * vMax)] as [number, number],
      celdas: adentro.filter(cc => minutos(cc.row * cols + cc.col) <= min).length,
      nota: c?.advertencias[1] ?? FRECUENCIA_ZONA[zona]!.nota,
    };
  });
  for (const c of costos) {
    console.log(`           ≤ ${String(c.corte_min).padStart(2)} min → ${r1(c.celdas * areaCelda / 1e4).toString().padStart(6)} ha · ` +
      `a ${c.frecuencia}: ${c.horas_anio[0]}–${c.horas_anio[1]} h/año caminando`);
  }

  // ── Los dos archivos ───────────────────────────────────────────────────────
  const procedencia = {
    fuente: dem.fuente,
    nombre_completo: atribucionDe(dem.fuente),
    resolucion_m: paso_fuente_m,
    lectura: 'ventana COG leída por range request con obtenerGrillaDEM()',
    remuestreo: `bilineal a ${cols}×${rows} nodos, paso ${r1(anchoM / cols)} m`,
    advertencia:
      'El remuestreo NO mejora la resolución del dato: la fuente sigue siendo de ' +
      `${paso_fuente_m} m y así se cita. En pantalla la landing no nombra ` +
      'proveedores, así que esto se lee «modelo de elevación global · 30 m».',
    generado: new Date().toISOString().slice(0, 10),
  };

  mkdirSync(ENTREGA, { recursive: true });
  const entregaB = {
    predio: 'predio real (el nombre no se publica)',
    traza: {
      entrada: { lng: r1e6(traza.entrada[0]), lat: r1e6(traza.entrada[1]) },
      salida:  { lng: r1e6(traza.salida[0]),  lat: r1e6(traza.salida[1]) },
      largo_m: r1(traza.largo_m),
      criterio:
        'Del punto más alto al más bajo del predio, prolongada a los dos lados hasta el ' +
        'perímetro. Es la misma línea que define la pendiente general que informa el panel.',
    },
    desnivel_m: r1(Math.max(...cotas) - Math.min(...cotas)),
    cota_min_m: r1(Math.min(...cotas)),
    cota_max_m: r1(Math.max(...cotas)),
    pendiente_media_pct: r1((Math.max(...cotas) - Math.min(...cotas)) / traza.largo_m * 100),
    puntos: perfil,
    procedencia,
  };
  writeFileSync(path.join(ENTREGA, 'perfil-del-terreno.json'), JSON.stringify(entregaB, null, 2));
  console.log(`\nescrito    ${path.join(ENTREGA, 'perfil-del-terreno.json')}`);

  const datos = {
    predio: PREDIO,
    generado: new Date().toISOString().slice(0, 10),
    bbox, cols, rows,
    procedencia,
    represa: {
      cierre: red(sitio),
      cota_cauce_m: sitio.elev,
      altura_m: sitio.altura_m,
      ancho_muro_m: sitio.ancho_muro_m,
      muro: [red(muro.a), red(muro.b)] as [Par, Par],
      muro_ancho_reconstruido_m: r1(muro.ancho_m),
      muro_celdas: muro.celdas,
      nivel_disenio_m: r1(nivelDisenio),
      area_ha: sitio.area_ha,
      volumen_agua_m3: sitio.volumen_agua_m3,
      volumen_muro_m3: sitio.volumen_muro_m3,
      eficiencia: sitio.eficiencia,
      // Lo que dice vaso.ts sobre el mismo cierre, avisos incluidos.
      vaso: vaso ? {
        cota_fondo_m: r1(vaso.cotaFondo_m),
        cota_eje_min_m: r1(vaso.cotaEjeMin_m),
        cota_derrame_m: r1(vaso.cotaDerrame_m),
        tipo_tope: vaso.tipoTope,
        derrame_por_estribo: vaso.derramePorEstribo,
        punto_derrame: vaso.puntoDerrame ? red(vaso.puntoDerrame) : null,
        volumen_m3: nv?.volumen_m3 ?? null,
        area_ha: nv ? r2(nv.area_inundada_m2 / 1e4) : null,
        prof_en_muro_m: nv?.profEnMuro_m ?? null,
        advertencias: vaso.advertencias,
        fuente: vaso.fuente,
      } : null,
      certificado_por_vaso: certificado,
      diagnostico: candidatos.map(c => ({
        sitio: red(c.s),
        eficiencia: c.s.eficiencia,
        ancho_muro_m: c.s.ancho_muro_m,
        altura_m: c.s.altura_m,
        eje_celdas: c.eje?.celdas ?? null,
        motivo: c.motivo,
      })),
      espejo: geoEspejo,
    },
    emplazamiento: {
      acceso: red(acceso),
      sitio: red(sitioCasa),
      edificio: EDIFICIO,
      pendiente_pct: evSitio.pendiente_pct,
      posicion: evSitio.posicion,
      plataforma: evSitio.plataforma,
      camino_al_sitio: evSitio.camino,
      resumen: {
        celdas_libres: resumen.celdas_libres,
        sitio_mejor_por_plataforma: red(sitioCasa),
        sitio_pendiente_pct: evSitio.pendiente_pct,
        sitio_posicion: evSitio.posicion,
        sitio_plataforma: evSitio.plataforma,
        sitio_camino: evSitio.camino,
        celdas_total: resumen.celdas_total,
        superficie_libre_ha: resumen.superficie_libre_ha,
        superficie_total_ha: resumen.superficie_total_ha,
        por_regla: resumen.por_regla,
      },
      // Lo que el terreno ADMITE, celda por celda. Va la admisión y no el
      // rechazo, y es por peso y por lectura las dos cosas: el rechazo son 3.242
      // rectángulos y 941 KB para pintar de rojo el 95,5 % del cuadro, mientras
      // que lo admitido son 6,6 ha sueltas que se ven como lo que son —cuatro
      // manchones—. En la pieza el rechazo se dibuja oscureciendo el predio
      // entero, que ya es un polígono que existe, y lo admitido se enciende
      // encima. Las cifras de cada regla quedan en `por_regla`.
      admite: rectangulos(
        grilla,
        i => (dentro[i] && !reglaDe.has(i) ? 1 : null),
        () => ({}),
      ),
    },
    caminos: {
      acceso: red(acceso),
      limite_pct: ctx.camino_limite_pct,
      celdas_dentro: corredorDentro,
      celdas_en_el_halo: corredorFuera,
      ha_dentro: r1(corredorDentro * areaCelda / 1e4),
      pct_del_predio: r1(corredorDentro / adentro.length * 100),
      largo_max_m: Math.round(largoMax),
      pasos: PASOS_CORREDOR,
      criterio:
        'El corredor que devuelve accesibilidad(): todas las celdas a las que se llega desde ' +
        'el acceso sin que ningún tramo pase del límite de pendiente. Es el mismo objeto con ' +
        'el que se decide la exclusión «Sin camino posible». Se recorta al predio para ' +
        'dibujarlo: accesibilidad() no lo recorta, aunque su documentación lo diga.',
      corredor: geoCorredor,
    },
    caminata: {
      centro: red(sitioCasa),
      cortes_min: CORTES_MIN,
      max_redondo_min: r1(maxMin),
      modelo:
        'Tobler (1993) fuera de sendero (×3/5), ida y vuelta por separado sobre el relieve, ' +
        'ocho vecinos. Los tiempos son un PISO: la fuente se ajustó sobre excursionismo a pie ' +
        'y sin carga.',
      costos,
      bandas: geoCaminata,
    },
  };
  mkdirSync(GENERADO, { recursive: true });
  const destino = path.join(GENERADO, `${PREDIO}-mesa.json`);
  writeFileSync(destino, JSON.stringify(datos));
  console.log(`escrito    ${destino}  (${(Buffer.byteLength(JSON.stringify(datos)) / 1024).toFixed(0)} KB)`);
}

const r1e6 = (x: number) => Math.round(x * 1e6) / 1e6;

main().catch(e => { console.error(e); process.exit(1); });
