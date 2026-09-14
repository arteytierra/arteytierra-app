/**
 * Contexto actual del predio: qué actividad industrial hay alrededor, a qué
 * distancia y en qué rumbo.
 *
 * ── Qué decide este archivo, y por qué así ──────────────────────────────────
 *
 * **No se nombra a nadie.** Ni la empresa, ni la marca, ni el nombre propio del
 * rasgo. La decisión es de producto —a quien diseña un predio le sirve saber que
 * hay una cantera a 3 km al noroeste, no de quién es— y además es la única forma
 * de que la app no termine afirmando algo sobre un tercero a partir de un dato
 * que nadie auditó.
 *
 * Y no está escrita como una promesa: está escrita en la estructura. `clasificar`
 * sólo puede devolver textos de las tablas de este archivo. Los tags `name` y
 * `operator` no se leen en ningún lado, así que el nombre no viaja al cliente ni
 * queda en la caché. Si mañana alguien quisiera mostrarlo, no le alcanzaría con
 * cambiar el panel: tendría que cambiar esto.
 *
 * ── La fuente ───────────────────────────────────────────────────────────────
 *
 * OpenStreetMap vía Overpass API, consultado en vivo (ODbL 1.0 — la misma
 * licencia con la que ya se resuelven los saberes territoriales). Los tags
 * usados se eligieron mirando el uso real en taginfo, no el wiki: los que
 * quedaron tienen entre 4.000 y 380.000 usos en el planeta.
 *
 * **Su límite, que es el dato más importante de todo el módulo:** el relevamiento
 * de OSM es desparejo. Una lista vacía significa "no hay nada mapeado en este
 * radio", nunca "no hay nada". En buena parte de Sudamérica la minería chica y
 * los pozos no están cargados. Por eso el resultado distingue explícitamente
 * entre no haber encontrado y no haber podido preguntar (`consultado`), y la
 * interfaz nunca escribe "no hay".
 *
 * ── Qué se dejó afuera a propósito ──────────────────────────────────────────
 *
 * Los ductos (`man_made=pipeline`, 377.000 usos, y relevantes por servidumbre).
 * Un ducto es una línea de decenas de kilómetros: Overpass devuelve su centro, y
 * la distancia a ese centro no dice nada sobre a qué distancia pasa del predio.
 * Un número plausible y equivocado es peor que no tenerlo. Para incluirlos hay
 * que traer la geometría completa y medir contra el trazado.
 *
 * `landuse=industrial` también queda afuera: 1,4 millones de usos, marca
 * cualquier parque industrial y en el periurbano ahogaría la lista. La fábrica
 * concreta ya entra por `man_made=works`.
 */
import { rumboDeAzimut } from './sectores';

/**
 * Radio de consulta, en kilómetros.
 *
 * 25 km es el orden en que una fuente puntual puede llegar al agua superficial y
 * al aire de una cuenca chica. Más lejos que eso, que llegue o no depende de la
 * red de drenaje y del viento, no de la distancia en línea recta: afirmarlo sería
 * inventar. Es un radio de "qué está pasando cerca", no un modelo de dispersión.
 */
export const RADIO_CONTEXTO_KM = 25;

/** Tope de elementos que se le piden a Overpass. Ver `truncado`. */
export const TOPE_ELEMENTOS = 400;

export type ClaseContexto =
  | 'mineria'
  | 'hidrocarburos'
  | 'energia'
  | 'residuos'
  | 'industria';

/** Lo que se muestra de un rasgo. Nada de acá sale de un tag de texto libre. */
export interface Etiqueta {
  clase:    ClaseContexto;
  que:      string;            // "Cantera a cielo abierto"
  detalle?: string;            // "oro" — sólo de las tablas de abajo
}

export interface Presencia extends Etiqueta {
  cantidad: number;
  dist_km:  number;   // al rasgo más cercano del grupo; 0 = toca el predio
  rumbo:    string;   // rosa de 16 puntas, hacia el más cercano
}

export interface ContextoActual {
  radio_km:   number;
  presencias: Presencia[];
  /** false = el servicio no respondió. Distinto de una lista vacía. */
  consultado: boolean;
  /** Se alcanzó el tope de elementos: los conteos son un piso, no un total. */
  truncado:   boolean;
}

/** Caja envolvente, tal como la devuelve Overpass con `out bb`. */
export interface Caja { minlat: number; minlon: number; maxlat: number; maxlon: number }

// ─── Tablas de traducción ───────────────────────────────────────────────────
// Un valor que no esté acá no se muestra: se cae a `undefined`. Es preferible
// decir "cantera" a secas antes que pasarle al usuario un valor crudo de OSM.

/** `resource=*` — arranca por los valores más usados del planeta, según taginfo. */
const RECURSO: Record<string, string> = {
  aggregate: 'áridos', coal: 'carbón', clay: 'arcilla', gold: 'oro',
  sand: 'arena', iron_ore: 'hierro', gravel: 'ripio', peat: 'turba',
  limestone: 'caliza', oil: 'petróleo', stone: 'piedra', salt: 'sal',
  copper: 'cobre', lithium: 'litio', silver: 'plata', marble: 'mármol',
  granite: 'granito', dimension_stone: 'piedra de corte',
};

/** `plant:source=*` — con qué genera una central eléctrica. */
const FUENTE_ENERGIA: Record<string, string> = {
  solar: 'solar', hydro: 'hidroeléctrica', wind: 'eólica', gas: 'a gas',
  biomass: 'a biomasa', coal: 'a carbón', oil: 'a fuel oil', battery: 'de baterías',
  waste: 'por quema de residuos', biogas: 'a biogás', diesel: 'a gasoil',
  geothermal: 'geotérmica', nuclear: 'nuclear',
};

/**
 * Clasifica un rasgo de OSM. `null` si no es nada de lo que se busca.
 *
 * Lee sólo los tags que deciden la actividad. `name` y `operator` no se tocan.
 */
export function clasificar(tags: Record<string, string>): Etiqueta | null {
  const recurso = (t?: string) => (t ? RECURSO[t] : undefined);

  if (tags['landuse'] === 'quarry') {
    return { clase: 'mineria', que: 'Cantera a cielo abierto', detalle: recurso(tags['resource']) };
  }
  if (tags['landuse'] === 'landfill') {
    return { clase: 'residuos', que: 'Relleno sanitario o basural' };
  }
  if (tags['industrial'] === 'mine') {
    return { clase: 'mineria', que: 'Mina', detalle: recurso(tags['resource']) };
  }

  switch (tags['man_made']) {
    case 'mineshaft': return { clase: 'mineria', que: 'Pozo de mina', detalle: recurso(tags['resource']) };
    case 'adit':      return { clase: 'mineria', que: 'Socavón de mina', detalle: recurso(tags['resource']) };
    // El dique de colas es el rasgo que más importa de toda la lista: acumula el
    // residuo del procesamiento, y lo que sale de ahí va al agua, no al aire.
    case 'tailings_pond':   return { clase: 'mineria', que: 'Dique de colas (residuo minero)' };
    case 'petroleum_well':  return { clase: 'hidrocarburos', que: 'Pozo de petróleo o gas' };
    case 'flare':           return { clase: 'hidrocarburos', que: 'Antorcha de quema de gas' };
    case 'gasometer':       return { clase: 'hidrocarburos', que: 'Gasómetro' };
    case 'wastewater_plant': return { clase: 'residuos', que: 'Planta de tratamiento de efluentes' };
    case 'works':            return { clase: 'industria', que: 'Planta industrial' };
    default: break;
  }

  if (tags['power'] === 'plant') {
    const f = tags['plant:source'];
    return { clase: 'energia', que: 'Central eléctrica', detalle: f ? FUENTE_ENERGIA[f] : undefined };
  }
  return null;
}

// ─── Distancia y rumbo ──────────────────────────────────────────────────────

const R_TIERRA_KM = 6371;
const GRADO = Math.PI / 180;

/**
 * Distancia sobre la esfera (haversine), en km. R = 6371 km (radio medio, IUGG).
 *
 * Error contra el elipsoide WGS84: hasta ~0,5 %. A 25 km son 125 m, bastante
 * menos que la precisión con la que está dibujado un polígono en OSM.
 */
export function distanciaKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = (lat2 - lat1) * GRADO;
  const dLon = (lon2 - lon1) * GRADO;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * GRADO) * Math.cos(lat2 * GRADO) * Math.sin(dLon / 2) ** 2;
  return 2 * R_TIERRA_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Azimut inicial del arco mayor, en grados (0 = N, 90 = E). */
export function azimutGrados(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const f1 = lat1 * GRADO, f2 = lat2 * GRADO, dl = (lon2 - lon1) * GRADO;
  const y = Math.sin(dl) * Math.cos(f2);
  const x = Math.cos(f1) * Math.sin(f2) - Math.sin(f1) * Math.cos(f2) * Math.cos(dl);
  return ((Math.atan2(y, x) / GRADO) + 360) % 360;
}

/**
 * Distancia al punto más cercano de la caja envolvente del rasgo, no a su centro.
 *
 * Importa más de lo que parece: una cantera de dos kilómetros de lado cuyo centro
 * está a 3 km puede tener el frente de explotación a 2 km del alambrado. Medir al
 * centro sería tranquilizar con un número que no corresponde. Da 0 cuando el
 * punto cae adentro del rasgo.
 */
export function distanciaACajaKm(lat: number, lon: number, caja: Caja): number {
  const cLat = Math.min(Math.max(lat, caja.minlat), caja.maxlat);
  const cLon = Math.min(Math.max(lon, caja.minlon), caja.maxlon);
  return distanciaKm(lat, lon, cLat, cLon);
}

// ─── Agregación ─────────────────────────────────────────────────────────────

export interface RasgoCrudo {
  tags?:   Record<string, string>;
  lat?:    number;
  lon?:    number;
  center?: { lat: number; lon: number };
  bounds?: Caja;
}

/**
 * Agrupa los rasgos por lo que son y se queda con el más cercano de cada grupo.
 *
 * Treinta y siete pozos no son treinta y siete filas: son una fila que dice
 * treinta y siete, y esa cantidad es información. Un pozo aislado y un yacimiento
 * en producción no son lo mismo, aunque el más cercano esté a la misma distancia.
 */
export function agrupar(rasgos: RasgoCrudo[], lat: number, lng: number): Presencia[] {
  const grupos = new Map<string, Presencia>();

  for (const r of rasgos) {
    const et = clasificar(r.tags ?? {});
    if (!et) continue;

    const centro = centroDe(r);
    if (!centro) continue;

    const dist = redondear(r.bounds
      ? distanciaACajaKm(lat, lng, r.bounds)
      : distanciaKm(lat, lng, centro.lat, centro.lon));

    const clave = `${et.que}|${et.detalle ?? ''}`;
    const previo = grupos.get(clave);
    if (!previo) {
      grupos.set(clave, {
        ...et,
        cantidad: 1,
        dist_km: dist,
        rumbo: rumboDeAzimut(azimutGrados(lat, lng, centro.lat, centro.lon)),
      });
      continue;
    }
    previo.cantidad += 1;
    if (dist < previo.dist_km) {
      previo.dist_km = dist;
      previo.rumbo = rumboDeAzimut(azimutGrados(lat, lng, centro.lat, centro.lon));
    }
  }

  return [...grupos.values()].sort((a, b) => a.dist_km - b.dist_km);
}

/**
 * De dónde sale el punto al que se le mide el rumbo.
 *
 * Overpass **no devuelve `center` y `bounds` a la vez**: pidiéndole los dos, los
 * ways vuelven con caja y sin centro. Costó un rato descubrirlo porque no falla:
 * en una prueba sobre Añelo, 53 de 71 rasgos —todas las canteras, que son
 * polígonos— se descartaban por no tener centro, y el panel mostraba dieciocho
 * pozos y ninguna cantera, con total naturalidad. Un nodo trae `lat`/`lon`; un
 * way o una relación, la caja: el centro se calcula.
 */
function centroDe(r: RasgoCrudo): { lat: number; lon: number } | null {
  if (r.center) return r.center;
  if (r.bounds) {
    return {
      lat: (r.bounds.minlat + r.bounds.maxlat) / 2,
      lon: (r.bounds.minlon + r.bounds.maxlon) / 2,
    };
  }
  if (r.lat != null && r.lon != null) return { lat: r.lat, lon: r.lon };
  return null;
}

/**
 * Un decimal hasta 10 km, entero después.
 *
 * A 18 km, escribir "18,3" sugiere una precisión que ni el mapeo de OSM ni el
 * haversine tienen. Cerca sí importa: 0,4 km y 1,2 km son decisiones distintas.
 */
function redondear(km: number): number {
  return km < 10 ? Math.round(km * 10) / 10 : Math.round(km);
}

// ─── La consulta ────────────────────────────────────────────────────────────

/**
 * Overpass QL.
 *
 * `out tags bb` y no `out tags center bb`: pidiendo las dos formas, Overpass
 * devuelve sólo la caja y los ways vienen sin centro. La caja alcanza —da la
 * distancia al borde y, promediando, el punto para el rumbo—, y los nodos traen
 * su `lat`/`lon` igual. Ver `centroDe`.
 */
export function consultaOverpass(lat: number, lng: number, radioKm: number): string {
  const m = Math.round(radioKm * 1000);
  const en = (filtro: string) => `nwr(around:${m},${lat},${lng})${filtro};`;
  return '[out:json][timeout:20];('
    + en('[landuse=quarry]')
    + en('[landuse=landfill]')
    + en('[industrial=mine]')
    + en('[man_made~"^(mineshaft|adit|tailings_pond|petroleum_well|flare|gasometer|wastewater_plant|works)$"]')
    + en('[power=plant]')
    + `);out tags bb ${TOPE_ELEMENTOS};`;
}

// ─── Texto ──────────────────────────────────────────────────────────────────

export const ROTULO_CLASE: Record<ClaseContexto, string> = {
  mineria:       'Minería',
  hidrocarburos: 'Petróleo y gas',
  energia:       'Generación de energía',
  residuos:      'Residuos y efluentes',
  industria:     'Industria',
};

/** "Cantera a cielo abierto (oro)" · "Central eléctrica (a gas)" */
export function titulo(p: Etiqueta): string {
  return p.detalle ? `${p.que} (${p.detalle})` : p.que;
}

/** "a 3,4 km al NNO" · "dentro del predio o lindando" */
export function ubicacionTexto(p: Presencia): string {
  if (p.dist_km === 0) return 'dentro del predio o lindando';
  const km = p.dist_km < 10 ? p.dist_km.toLocaleString('es-AR') : String(p.dist_km);
  return `a ${km} km al ${p.rumbo}`;
}
