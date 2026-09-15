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
 * ── Lo que no es un lugar sino una traza: ductos y líneas ───────────────────
 *
 * Un ducto (`man_made=pipeline`, 377.000 usos) y una línea de alta tensión
 * (`power=line`, 1,18 millones) no ocupan un punto: son una traza de decenas de
 * kilómetros. Overpass devuelve la caja que los envuelve, y la distancia al
 * centro de esa caja no dice nada sobre por dónde pasan —un gasoducto que cruza
 * el alambrado y otro que pasa a 40 km pueden dar el mismo número—. Por eso
 * estuvieron afuera del módulo hasta poder medirlos bien.
 *
 * Ahora se les pide la geometría completa (`out geom`) y se mide contra el
 * trazado, segmento por segmento: la distancia es al punto más cercano de la
 * traza y el rumbo apunta a ese punto. Es la única magnitud de este archivo que
 * no sale de una fórmula entre dos puntos, así que tiene su propio caso
 * publicado en el test. Ver `distanciaASegmentoKm`.
 *
 * Y valen la molestia porque no son contexto: son una restricción. Una
 * servidumbre de paso es una franja donde no se planta, no se construye y no
 * entra una máquina alta. Saber que la línea pasa a 300 m al este cambia dónde
 * va la cortina forestal.
 *
 * ── Qué se dejó afuera a propósito ──────────────────────────────────────────
 *
 * `power=minor_line`, la línea de distribución rural: 1,64 millones de usos,
 * más que la de alta tensión, y está en el fondo de cualquier campo. Marcarla
 * sería marcar todo.
 *
 * `landuse=industrial`: 1,4 millones de usos, marca cualquier parque industrial
 * y en el periurbano ahogaría la lista. La fábrica concreta ya entra por
 * `man_made=works`.
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

/**
 * Radio de consulta para las trazas, en kilómetros.
 *
 * Más chico que el otro a propósito. Un ducto o una línea a 20 km no imponen
 * nada sobre el predio: no hay servidumbre, no hay franja, no hay restricción de
 * plantación. Lo que importa de una traza es que pase cerca, y a 10 km ya dejó
 * de pasar cerca. Además la geometría completa se paga por vértice, y traer el
 * trazado de cada línea en 25 km a la redonda es un payload que no compra nada.
 */
export const RADIO_LINEAL_KM = 10;

/** Tope de elementos que se le piden a Overpass. Ver `truncado`. */
export const TOPE_ELEMENTOS = 400;

/** Tope aparte para las trazas: cada una viene con todos sus vértices. */
export const TOPE_LINEAS = 120;

export type ClaseContexto =
  | 'mineria'
  | 'hidrocarburos'
  | 'energia'
  | 'residuos'
  | 'industria'
  | 'infraestructura';

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
 * `substance=*` — qué lleva un ducto. Los valores salen de taginfo ordenados por
 * uso: `gas` (176.000) y `oil` (89.500) son los dos que mandan.
 *
 * Importa cuál es, y no como curiosidad: un acueducto y un poliducto de
 * combustible no significan lo mismo a cien metros de la casa.
 */
const SUSTANCIA: Record<string, string> = {
  gas: 'gas', natural_gas: 'gas natural', oil: 'petróleo',
  hydrocarbons: 'hidrocarburos', ngl: 'líquidos de gas natural',
  lpg: 'GLP', LNG: 'GNL', fuel: 'combustible',
  water: 'agua', hot_water: 'agua caliente', rainwater: 'agua de lluvia',
  sewage: 'cloacal', wastewater: 'efluentes', waterwaste: 'efluentes',
  drain: 'desagüe', heat: 'calor', steam: 'vapor',
  brine: 'salmuera', slurry: 'pulpa mineral (mineroducto)',
  chemicals: 'productos químicos', ammonia: 'amoníaco', hydrogen: 'hidrógeno',
  ethylene: 'etileno', propylene: 'propileno',
};

/**
 * `voltage=*` en kilovoltios, o `undefined`.
 *
 * El tag viene en voltios y a veces con varios valores separados por `;`, uno
 * por terna. Se toma el mayor, que es el que manda la franja de servidumbre.
 *
 * No es un texto libre que se muestre crudo: sólo pasa si parsea entero y si
 * cae en el rango de una línea de transmisión real (1 kV a 1.200 kV). Un
 * "132000 (ex 33000)" no entra, y está bien que no entre.
 */
export function tensionKv(voltage: string | undefined): string | undefined {
  if (!voltage) return undefined;
  let mayor = 0;
  for (const parte of voltage.split(';')) {
    if (!/^\d{3,7}$/.test(parte.trim())) return undefined;
    mayor = Math.max(mayor, Number(parte.trim()));
  }
  if (mayor < 1_000 || mayor > 1_200_000) return undefined;
  return `${Math.round(mayor / 1000)} kV`;
}

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
    // Traza, no lugar: la distancia se mide contra el trazado. Ver el encabezado.
    case 'pipeline': {
      const s = tags['substance'];
      return { clase: 'infraestructura', que: 'Ducto', detalle: s ? SUSTANCIA[s] : undefined };
    }
    default: break;
  }

  if (tags['power'] === 'plant') {
    const f = tags['plant:source'];
    return { clase: 'energia', que: 'Central eléctrica', detalle: f ? FUENTE_ENERGIA[f] : undefined };
  }
  if (tags['power'] === 'line') {
    return { clase: 'infraestructura', que: 'Línea de alta tensión', detalle: tensionKv(tags['voltage']) };
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

// ─── Distancia a una traza ──────────────────────────────────────────────────

/** Un vértice del trazado, tal como lo devuelve Overpass con `out geom`. */
export interface Vertice { lat: number; lon: number }

/**
 * Punto de destino a `km` de (lat, lon) siguiendo un azimut inicial.
 *
 * Fórmula directa sobre la esfera. Acá sirve para una sola cosa: ubicar el punto
 * del trazado que queda más cerca del predio, que es al que después se le mide
 * el rumbo.
 */
function destino(lat: number, lon: number, azGrados: number, km: number): Vertice {
  const d = km / R_TIERRA_KM, t = azGrados * GRADO;
  const f1 = lat * GRADO, l1 = lon * GRADO;
  const f2 = Math.asin(Math.sin(f1) * Math.cos(d) + Math.cos(f1) * Math.sin(d) * Math.cos(t));
  const l2 = l1 + Math.atan2(
    Math.sin(t) * Math.sin(d) * Math.cos(f1),
    Math.cos(d) - Math.sin(f1) * Math.sin(f2),
  );
  return { lat: f2 / GRADO, lon: (((l2 / GRADO) + 540) % 360) - 180 };
}

const acotar = (x: number) => Math.min(1, Math.max(-1, x));

/**
 * Distancia al punto más cercano de un tramo de traza, y ese punto.
 *
 * Es el error de rumbo (*cross-track distance*) del formulario de navegación,
 * recortado a los extremos del tramo: si la perpendicular cae fuera del tramo,
 * lo más cercano es una de las dos puntas.
 *
 * `Math.acos` devuelve siempre un valor positivo, así que el tramo "hacia atrás"
 * no se distingue solo: lo decide el coseno del ángulo entre el rumbo al punto y
 * el rumbo del tramo. Sin ese chequeo, una línea que termina 5 km al norte del
 * predio se reporta como si pasara al lado.
 *
 * Unidades: grados decimales entra, kilómetros sale. Válido sobre la esfera de
 * 6371 km; a las distancias de este módulo (≤ 25 km) el error contra el
 * elipsoide es de metros.
 */
export function distanciaASegmentoKm(
  lat: number, lon: number, a: Vertice, b: Vertice,
): { km: number; punto: Vertice } {
  const d13 = distanciaKm(a.lat, a.lon, lat, lon);
  const d12 = distanciaKm(a.lat, a.lon, b.lat, b.lon);
  if (d12 === 0) return { km: d13, punto: a };
  if (d13 === 0) return { km: 0, punto: a };

  const t13 = azimutGrados(a.lat, a.lon, lat, lon) * GRADO;
  const t12 = azimutGrados(a.lat, a.lon, b.lat, b.lon) * GRADO;

  if (Math.cos(t13 - t12) < 0) return { km: d13, punto: a };

  const dxt = Math.asin(acotar(Math.sin(d13 / R_TIERRA_KM) * Math.sin(t13 - t12))) * R_TIERRA_KM;
  const dat = Math.acos(acotar(
    Math.cos(d13 / R_TIERRA_KM) / Math.cos(dxt / R_TIERRA_KM),
  )) * R_TIERRA_KM;

  if (dat > d12) return { km: distanciaKm(b.lat, b.lon, lat, lon), punto: b };
  return { km: Math.abs(dxt), punto: destino(a.lat, a.lon, t12 / GRADO, dat) };
}

/** Lo mismo sobre la polilínea entera: el tramo más cercano gana. */
export function distanciaATrazaKm(
  lat: number, lon: number, traza: Vertice[],
): { km: number; punto: Vertice } | null {
  if (traza.length === 0) return null;
  if (traza.length === 1) {
    const v = traza[0]!;
    return { km: distanciaKm(lat, lon, v.lat, v.lon), punto: v };
  }
  let mejor: { km: number; punto: Vertice } | null = null;
  for (let i = 1; i < traza.length; i++) {
    const r = distanciaASegmentoKm(lat, lon, traza[i - 1]!, traza[i]!);
    if (!mejor || r.km < mejor.km) mejor = r;
  }
  return mejor;
}

// ─── Agregación ─────────────────────────────────────────────────────────────

export interface RasgoCrudo {
  tags?:     Record<string, string>;
  lat?:      number;
  lon?:      number;
  center?:   { lat: number; lon: number };
  bounds?:   Caja;
  /** Trazado completo, sólo en lo que se pidió con `out geom`. */
  geometry?: Vertice[];
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

    const m = medir(r, lat, lng);
    if (!m) continue;

    const clave = `${et.que}|${et.detalle ?? ''}`;
    const previo = grupos.get(clave);
    if (!previo) {
      grupos.set(clave, { ...et, cantidad: 1, dist_km: m.dist_km, rumbo: rumboDeAzimut(m.azimut) });
      continue;
    }
    previo.cantidad += 1;
    if (m.dist_km < previo.dist_km) {
      previo.dist_km = m.dist_km;
      previo.rumbo = rumboDeAzimut(m.azimut);
    }
  }

  return [...grupos.values()].sort((a, b) => a.dist_km - b.dist_km);
}

/**
 * A qué distancia y en qué dirección queda un rasgo. `null` si no trae posición.
 *
 * Tres formas, porque son tres cosas distintas:
 *
 *  - **Traza** (ducto, línea): al punto más cercano del trazado, y el rumbo
 *    hacia ese punto. El centro de una traza no significa nada.
 *  - **Superficie** (cantera, relleno): al borde de la caja envolvente —el
 *    frente de explotación está en el borde, no en el medio— y el rumbo hacia el
 *    centro, que es lo que ubica el rasgo en la rosa.
 *  - **Punto** (pozo, antorcha): lo obvio.
 */
function medir(r: RasgoCrudo, lat: number, lng: number): { dist_km: number; azimut: number } | null {
  if (r.geometry?.length) {
    const t = distanciaATrazaKm(lat, lng, r.geometry);
    if (t) return { dist_km: redondear(t.km), azimut: azimutGrados(lat, lng, t.punto.lat, t.punto.lon) };
  }
  const centro = centroDe(r);
  if (!centro) return null;
  const dist = r.bounds
    ? distanciaACajaKm(lat, lng, r.bounds)
    : distanciaKm(lat, lng, centro.lat, centro.lon);
  return { dist_km: redondear(dist), azimut: azimutGrados(lat, lng, centro.lat, centro.lon) };
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
 * Overpass QL. Dos conjuntos con dos salidas distintas, en una sola consulta.
 *
 * Lo que ocupa un lugar sale con `out tags bb` y no con `out tags center bb`:
 * pidiendo las dos formas, Overpass devuelve sólo la caja y los ways vienen sin
 * centro. La caja alcanza —da la distancia al borde y, promediando, el punto
 * para el rumbo—, y los nodos traen su `lat`/`lon` igual. Ver `centroDe`.
 *
 * Lo que es una traza sale con `out tags geom`, que trae todos los vértices, en
 * un radio más chico y con su propio tope: la geometría se paga por vértice.
 */
export function consultaOverpass(lat: number, lng: number, radioKm: number): string {
  const m = Math.round(radioKm * 1000);
  const mLineal = Math.round(RADIO_LINEAL_KM * 1000);
  const en = (filtro: string) => `nwr(around:${m},${lat},${lng})${filtro};`;
  const linea = (filtro: string) => `way(around:${mLineal},${lat},${lng})${filtro};`;
  return '[out:json][timeout:20];('
    + en('[landuse=quarry]')
    + en('[landuse=landfill]')
    + en('[industrial=mine]')
    + en('[man_made~"^(mineshaft|adit|tailings_pond|petroleum_well|flare|gasometer|wastewater_plant|works)$"]')
    + en('[power=plant]')
    + ')->.lugares;('
    + linea('[man_made=pipeline]')
    + linea('[power=line]')
    + ')->.trazas;'
    + `.lugares out tags bb ${TOPE_ELEMENTOS};`
    + `.trazas out tags geom ${TOPE_LINEAS};`;
}

/**
 * ¿Se alcanzó alguno de los dos topes? Entonces las cantidades son un piso.
 *
 * Los dos conjuntos vuelven mezclados en una sola lista, así que se separan por
 * lo único que los distingue: la traza trae `geometry` y el lugar no.
 */
export function hayTruncamiento(els: RasgoCrudo[]): boolean {
  const trazas = els.filter(e => e.geometry?.length).length;
  return trazas >= TOPE_LINEAS || (els.length - trazas) >= TOPE_ELEMENTOS;
}

// ─── Texto ──────────────────────────────────────────────────────────────────

export const ROTULO_CLASE: Record<ClaseContexto, string> = {
  mineria:       'Minería',
  hidrocarburos: 'Petróleo y gas',
  energia:       'Generación de energía',
  residuos:      'Residuos y efluentes',
  industria:     'Industria',
  infraestructura: 'Ductos y líneas',
};

/** "Cantera a cielo abierto (oro)" · "Central eléctrica (a gas)" */
export function titulo(p: Etiqueta): string {
  return p.detalle ? `${p.que} (${p.detalle})` : p.que;
}

/**
 * Cómo se cuenta un grupo. "46 en el radio" · "13 tramos mapeados"
 *
 * En una traza el conteo no es de ductos: es de *ways* de OpenStreetMap, y un
 * solo gasoducto puede estar cargado en trece tramos porque cambia el diámetro,
 * cruza una jurisdicción o lo mapeó otra persona. Escribir "13 ductos" sería el
 * error típico de este archivo: un número plausible que no es el que se cree.
 * Trece tramos mapeados sí es cierto, y además dice algo —que la red está densa
 * por ahí—.
 */
export function cantidadTexto(p: Presencia): string {
  if (p.clase !== 'infraestructura') return `${p.cantidad} en el radio`;
  return p.cantidad === 1 ? '1 tramo mapeado' : `${p.cantidad} tramos mapeados`;
}

/** "a 3,4 km al NNO" · "dentro del predio o lindando" · "cruza el predio o pasa al lado" */
export function ubicacionTexto(p: Presencia): string {
  // Una traza no está "adentro": pasa. Y si pasa, lo que hay que ir a mirar es
  // la servidumbre, no la distancia.
  if (p.dist_km === 0 && p.clase === 'infraestructura') return 'cruza el predio o pasa al lado';
  if (p.dist_km === 0) return 'dentro del predio o lindando';
  const km = p.dist_km < 10 ? p.dist_km.toLocaleString('es-AR') : String(p.dist_km);
  return `a ${km} km al ${p.rumbo}`;
}
