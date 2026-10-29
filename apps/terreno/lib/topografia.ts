/**
 * Elevaciones por punto vía `/api/elevacion`, que rutea a la mejor fuente
 * disponible para el lugar (servicio nacional donde lo hay —3DEP, IGN, HRDEM,
 * AHN, swissALTI3D—, Copernicus GLO-30 si no, SRTM de respaldo). El panel ya no
 * asume SRTM: la fuente viene en la respuesta y se muestra tal cual.
 *
 * ⚠️ Datos orientativos. Para proyectos de obra: contratar relevamiento GPS.
 */
import * as turf from '@turf/turf';
import { CREDITO_RELIEVE, PASO_RELIEVE, type FuenteRelieve } from './grillaElevacion';
import type { DatosShader } from './shaders';
import type { Mojon } from './types';

/**
 * Cuántos puntos acepta `/api/elevacion` en un pedido. El muestreo se
 * dimensiona contra esto y no contra un número elegido a dedo: la grilla de
 * 4×4 usaba 9 de los 100 disponibles.
 */
export const PUNTOS_POR_PEDIDO = 100;

export interface PuntoElevacion {
  lat:       number;
  lng:       number;
  elevation: number; // metros sobre nivel del mar
  etiqueta?: string;
}

export interface DatosTopografia {
  puntos:           PuntoElevacion[];    // elevación en cada mojón (numerados)
  centroide:        PuntoElevacion;
  grilla:           PuntoElevacion[];    // muestra interior del polígono
  elev_min:         number;
  elev_max:         number;
  elev_media:       number;
  desnivel:         number;              // max − min (m)
  /**
   * Pendiente GENERAL del predio: el desnivel entre el punto muestreado más
   * alto y el más bajo, dividido por la distancia entre esos dos puntos.
   *
   * No es la media de las pendientes del terreno y suele dar bastante más
   * chica: una ladera ondulada de 6,9 % de pendiente media celda a celda puede
   * tener 3,2 % de pendiente general, porque las ondas se cancelan entre las
   * dos puntas. Las dos son correctas y contestan preguntas distintas —ésta,
   * «cómo cae el predio en conjunto»; aquélla, «cómo está parado el suelo donde
   * uno pisa»—, así que no se pueden llamar las dos «pendiente media» en la
   * misma pantalla, que es lo que pasaba.
   */
  pendiente_pct:    number;              // pendiente general del predio (%)
  pendiente_grados: number;
  orientacion:      string;              // dirección del escurrimiento (N, NE...)
  escurrimiento:    { desde: PuntoElevacion; hacia: PuntoElevacion }; // alto → bajo
  resolucion:       string;
  fuente:           string;
  /**
   * La fuente sin traducir a texto de credito.
   *
   * `fuente` y `resolucion` son frases para la pantalla. Esto es el identificador,
   * que es lo que necesita `modeloDeclarado` para buscar la exactitud vertical
   * publicada del modelo: de un credito no se puede sacar un numero. Opcional
   * porque un proyecto guardado antes del 06/10/2026 no lo trae, y ahi el modelo
   * declarado dice que no puede declararse en vez de suponer una fuente.
   */
  fuenteRelieve?:   FuenteRelieve;
  /**
   * De dónde salen `elev_min`, `elev_max`, `desnivel`, `elev_media`,
   * `pendiente_pct`, `orientacion` y `escurrimiento`.
   *
   * `'muestra'`: de `puntos` + `centroide` + `grilla`, que son como mucho
   * `PUNTOS_POR_PEDIDO`. Es lo que hay antes de que el relieve denso esté
   * calculado, y **es una muestra**: un pico que caiga entre dos puntos no
   * aparece. `'grilla_densa'`: de todas las celdas del relieve que caen adentro
   * del polígono, que son decenas de miles.
   *
   * No es un detalle de implementación y por eso viaja con el dato: la app
   * mostraba «Elevación máx. 391 m» al lado de curvas de nivel rotuladas 420 y
   * 440 m **sobre el mismo predio y en la misma pantalla**. El máximo real eran
   * 441 m —la muestra de ~17 puntos se salteaba el pico— y la pendiente general
   * salía de ahí: 20,2 % contra 30,8 %, que es la diferencia entre dos
   * decisiones distintas de terrazas, keyline y caminos.
   *
   * Opcional por el mismo motivo que `fuenteRelieve`: un proyecto guardado antes
   * del 28/10/2026 no lo trae. Ausente se lee como `'muestra'` —era lo único que
   * había— y así lo muestra el panel, sin suponer que el dato es denso.
   */
  base?:            'muestra' | 'grilla_densa';
  /** Cuántos puntos tuvo la muestra. Sigue valiendo con `grilla_densa`: es lo que se pidió. */
  muestra_n?:       number;
  /** Cuántas celdas del predio entraron, cuando `base` es `'grilla_densa'`. */
  celdas_densas?:   number;
}

// ─── OpenTopoData API ─────────────────────────────────────────────────────────

interface TopoResponse {
  results: Array<{ elevation: number; location: { lat: number; lng: number } }>;
  status: string;
  /** Fuente que resolvió el pedido; la API la devuelve y antes se descartaba. */
  fuente?: FuenteRelieve;
}

async function fetchElevaciones(
  puntos: Array<{ lat: number; lng: number }>,
): Promise<{ elevaciones: number[]; fuente?: FuenteRelieve }> {
  // API acepta hasta 100 puntos por request
  const locs = puntos.map(p => `${p.lat},${p.lng}`).join('|');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const res = await fetch(
      `/api/elevacion?locations=${locs}`,
      { signal: controller.signal },
    );
    if (!res.ok) throw new Error(`OpenTopoData respondió ${res.status}`);
    const json: TopoResponse = await res.json();
    if (json.status !== 'OK') throw new Error('OpenTopoData: estado no OK');
    return { elevaciones: json.results.map(r => r.elevation), fuente: json.fuente };
  } finally {
    clearTimeout(timer);
  }
}

// ─── Grilla interior del polígono ─────────────────────────────────────────────

/**
 * Cuántas divisiones usar para la muestra interior, dado cuántos mojones hay.
 *
 * La muestra entra en un solo pedido de `PUNTOS_POR_PEDIDO` puntos, de los que
 * los mojones y el centroide ya ocupan su parte; el resto es la grilla interior,
 * que son (n − 1)² puntos. Antes `n` estaba clavado en 4: **9 puntos interiores
 * de los 100 disponibles**, o sea un predio de 417 ha descripto con 17 puntos y
 * un paso de muestreo de más de un kilómetro. Densificar no cuesta un pedido
 * más: cuesta cero.
 */
export function divisionesMuestra(nMojones: number, tope = PUNTOS_POR_PEDIDO): number {
  const libres = tope - nMojones - 1;          // −1 por el centroide
  if (libres < 4) return 1;                    // no entra ni una grilla de 2×2
  return 1 + Math.floor(Math.sqrt(libres));
}

function generarGrilla(
  mojones: Mojon[],
  n = 4,
): Array<{ lat: number; lng: number }> {
  if (mojones.length < 3) return [];
  if (n < 2) return [];

  const coords = mojones.map(m => [m.lng, m.lat] as [number, number]);
  coords.push(coords[0]!);
  const polygon = turf.polygon([coords]);

  const lats = mojones.map(m => m.lat);
  const lngs = mojones.map(m => m.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);

  const puntos: Array<{ lat: number; lng: number }> = [];
  for (let i = 1; i < n; i++) {
    for (let j = 1; j < n; j++) {
      const lat = minLat + (i / n) * (maxLat - minLat);
      const lng = minLng + (j / n) * (maxLng - minLng);
      const pt = turf.point([lng, lat]);
      if (turf.booleanPointInPolygon(pt, polygon)) {
        puntos.push({ lat, lng });
      }
    }
  }
  return puntos;
}

// ─── Pendiente y orientación desde plano ajustado ────────────────────────────

function pendienteOrientacion(
  puntos: PuntoElevacion[],
): { pendiente_pct: number; pendiente_grados: number; orientacion: string; escurrimiento: DatosTopografia['escurrimiento'] } {
  if (puntos.length < 2) {
    const p = puntos[0] ?? { lat: 0, lng: 0, elevation: 0 };
    return { pendiente_pct: 0, pendiente_grados: 0, orientacion: '—', escurrimiento: { desde: p, hacia: p } };
  }

  // Punto más alto y más bajo. De acá sale la pendiente GENERAL, no la media.
  const alto = puntos.reduce((best, p) => p.elevation > best.elevation ? p : best);
  const bajo = puntos.reduce((best, p) => p.elevation < best.elevation ? p : best);

  // Distancia horizontal entre ellos
  const dist = turf.distance(
    turf.point([alto.lng, alto.lat]),
    turf.point([bajo.lng, bajo.lat]),
    { units: 'meters' },
  );
  const dh = Math.abs(alto.elevation - bajo.elevation);

  const pendiente_pct    = dist > 1 ? (dh / dist) * 100 : 0;
  const pendiente_grados = dist > 1 ? (Math.atan(dh / dist) * 180) / Math.PI : 0;

  // Orientación: dirección del escurrimiento (de alto a bajo)
  const bear = turf.bearing(
    turf.point([alto.lng, alto.lat]),
    turf.point([bajo.lng, bajo.lat]),
  );
  const orientacion = gradosAOrientacion((bear + 360) % 360);

  return {
    pendiente_pct:    Math.round(pendiente_pct    * 10) / 10,
    pendiente_grados: Math.round(pendiente_grados * 10) / 10,
    orientacion,
    escurrimiento: { desde: alto, hacia: bajo },
  };
}

// ─── API pública ──────────────────────────────────────────────────────────────

export async function obtenerTopografia(mojones: Mojon[]): Promise<DatosTopografia> {
  if (mojones.length < 1) throw new Error('Se necesita al menos 1 mojón.');

  const centroCoords = {
    lat: mojones.reduce((s, m) => s + m.lat, 0) / mojones.length,
    lng: mojones.reduce((s, m) => s + m.lng, 0) / mojones.length,
  };
  const grillaCruda = generarGrilla(mojones, divisionesMuestra(mojones.length));

  // Combinar: mojones + centroide + grilla, dentro del tope del pedido. El
  // `slice` es el cinturón: `divisionesMuestra` ya dimensiona para que entre.
  const todos = [
    ...mojones.map(m => ({ lat: m.lat, lng: m.lng })),
    centroCoords,
    ...grillaCruda,
  ].slice(0, PUNTOS_POR_PEDIDO);

  const { elevaciones, fuente: fuenteRelieve } = await fetchElevaciones(todos);

  // Asignar elevaciones a mojones
  const puntos: PuntoElevacion[] = mojones.map((m, i) => ({
    lat: m.lat, lng: m.lng,
    elevation: elevaciones[i] ?? 0,
    etiqueta: `M${m.numero}`,
  }));

  const nMojones = mojones.length;
  const centroide: PuntoElevacion = {
    ...centroCoords,
    elevation: elevaciones[nMojones] ?? 0,
    etiqueta: 'Centro',
  };

  const grilla: PuntoElevacion[] = grillaCruda.map((p, i) => ({
    ...p,
    elevation: elevaciones[nMojones + 1 + i] ?? 0,
  }));

  // Stats
  const todosConElev = [...puntos, centroide, ...grilla];
  const elevs = todosConElev.map(p => p.elevation).filter(e => e > -1000);
  const elev_min   = Math.min(...elevs);
  const elev_max   = Math.max(...elevs);
  const elev_media = Math.round((elevs.reduce((s, e) => s + e, 0) / elevs.length) * 10) / 10;
  const desnivel   = Math.round((elev_max - elev_min) * 10) / 10;

  const { pendiente_pct, pendiente_grados, orientacion, escurrimiento } =
    pendienteOrientacion(todosConElev);

  return {
    puntos, centroide, grilla,
    elev_min, elev_max, elev_media, desnivel,
    pendiente_pct, pendiente_grados, orientacion, escurrimiento,
    // La fuente ya no se asume: la resuelve el router de elevación (servicio
    // nacional donde lo hay, GLO-30 si no) y la API la devuelve. Decir 'SRTM,
    // datos de 2000' sobre un predio suizo servido por swissALTI3D era falso.
    resolucion: fuenteRelieve ? `~${PASO_RELIEVE[fuenteRelieve]} m/píxel` : '~30 m/píxel',
    fuente: fuenteRelieve ? CREDITO_RELIEVE[fuenteRelieve] : 'Copernicus GLO-30 / SRTM',
    ...(fuenteRelieve ? { fuenteRelieve } : {}),
    base: 'muestra',
    muestra_n: todosConElev.length,
  };
}

/**
 * Las mismas estadísticas, pero medidas sobre el relieve denso.
 *
 * Es una función pura y vive acá —y no adentro de `obtenerTopografia`— por un
 * motivo de orquestación: los dos pedidos de red salen **en paralelo** desde el
 * panel, así que la muestra no puede esperar al shader. Lo que se hace es
 * mejorarla cuando el shader llega.
 *
 * Qué celdas cuentan: las que caen adentro del polígono (`celda.dentro`). La
 * grilla llega hasta 1,15× el predio para que la pendiente tenga vecinos, y
 * `shaderDesdeGrilla` ya marca cada celda; contar el halo informaría la loma del
 * vecino como el techo del predio. `dentro === undefined` significa que no hubo
 * polígono con qué decidirlo y entonces cuentan todas, que es lo que
 * corresponde cuando no hay con qué distinguir.
 *
 * Lo que NO cambia: `puntos`, `centroide` y `grilla` siguen siendo la muestra.
 * Son los que dibuja el perfil de elevación por mojón, y ésos son puntos
 * medidos en un lugar concreto, no un resumen.
 */
export function topografiaConGrillaDensa(
  topo: DatosTopografia,
  shader: Pick<DatosShader, 'celdas' | 'fuente'>,
): DatosTopografia {
  const dentro = shader.celdas.filter(c => c.dentro !== false);
  if (dentro.length < 2) return topo;

  let alto = dentro[0]!, bajo = dentro[0]!, suma = 0;
  for (const c of dentro) {
    if (c.elevation > alto.elevation) alto = c;
    if (c.elevation < bajo.elevation) bajo = c;
    suma += c.elevation;
  }

  const centro = (c: { latMin: number; latMax: number; lngMin: number; lngMax: number }) => ({
    lat: (c.latMin + c.latMax) / 2,
    lng: (c.lngMin + c.lngMax) / 2,
  });
  const pAlto: PuntoElevacion = { ...centro(alto), elevation: alto.elevation, etiqueta: 'Más alto' };
  const pBajo: PuntoElevacion = { ...centro(bajo), elevation: bajo.elevation, etiqueta: 'Más bajo' };

  const { pendiente_pct, pendiente_grados, orientacion, escurrimiento } =
    pendienteOrientacion([pAlto, pBajo]);

  return {
    ...topo,
    elev_min:   bajo.elevation,
    elev_max:   alto.elevation,
    elev_media: Math.round((suma / dentro.length) * 10) / 10,
    desnivel:   Math.round((alto.elevation - bajo.elevation) * 10) / 10,
    pendiente_pct, pendiente_grados, orientacion, escurrimiento,
    base: 'grilla_densa',
    celdas_densas: dentro.length,
    ...(shader.fuente
      ? {
          fuenteRelieve: shader.fuente,
          resolucion: `~${PASO_RELIEVE[shader.fuente]} m/píxel`,
          fuente: CREDITO_RELIEVE[shader.fuente],
        }
      : {}),
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ORIENTACIONES = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSO','SO','OSO','O','ONO','NO','NNO'] as const;

function gradosAOrientacion(grados: number): string {
  const idx = Math.round(((grados % 360) + 360) % 360 / 22.5) % 16;
  return ORIENTACIONES[idx] ?? 'N';
}
