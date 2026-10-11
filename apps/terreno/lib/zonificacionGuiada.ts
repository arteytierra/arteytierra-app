/**
 * Zonificación guiada: qué dice el terreno sobre las zonas que alguien dibujó.
 *
 * ── La premisa del enunciado, y lo que faltaba de verdad ─────────────────────
 *
 * La etapa H pedía «la zonificación como ejercicio guiado, no como un dibujo
 * libre». Mirando `zonificacion.ts`, lo que falta no es una guía: es que **nada
 * mira el dibujo**. Hoy se dibuja un polígono, se le elige una categoría y se
 * muestra su superficie. Ningún motor de la app —y hay quince que podrían—
 * vuelve a mirar ese polígono.
 *
 * Y hay algo peor que una ausencia. `calcularResumenZonificacion` **suma** las
 * áreas de las zonas, así que:
 *
 * - dos zonas que se pisan cuentan dos veces la superficie pisada, y
 * - los porcentajes por categoría se calculan sobre esa suma inflada, así que
 *   son porcentajes de un total que no existe, y
 * - una zona dibujada **afuera del predio** entra al resumen como si estuviera
 *   adentro.
 *
 * Eso es exactamente el modo de fallar de esta app: no se estrella, imprime un
 * número plausible. Este módulo calcula la **unión** y el **recorte al predio**,
 * y publica las tres cifras juntas para que la diferencia se vea.
 *
 * ── La zona de Mollison es una frecuencia, no un radio ───────────────────────
 *
 * Las seis primeras categorías que ofrece la app son las zonas 0 a 5 de la
 * permacultura, y están **definidas por la frecuencia de visita**, no por la
 * distancia. La fuente lo dice en los dos sentidos: da la frecuencia de cada
 * zona, y aclara que el dibujo de anillos concéntricos es una convención de
 * representación —«zones often are shown as concentric circles. This may not
 * always be the case, depending on the site.»—.
 *
 * Entonces el número de zona **declara un presupuesto de viajes por año**, y lo
 * que cuesta una zona mal puesta es ese presupuesto por la distancia. Esto se
 * puede calcular, y tiene dos consecuencias que un dibujo de anillos esconde:
 *
 * 1. **La distancia no ordena el costo.** Una zona 1 a 150 m del centro cuesta
 *    más caminata por año que una zona 3 a 500 m, porque la frecuencia pesa más
 *    que la distancia. Los anillos concéntricos dicen lo contrario.
 * 2. **La ida y vuelta no es el doble de la ida.** Subir y bajar la misma ladera
 *    se hacen a velocidades distintas, y la función publicada que las da es
 *    asimétrica —su máximo está en una bajada suave, no en el llano—.
 *
 * ── Lo que este módulo NO inventa ────────────────────────────────────────────
 *
 * No hay una pendiente máxima publicada para una huerta, ni una superficie
 * mínima publicada para un bosque de alimento. Esas cifras circulan y no tienen
 * fuente primaria, así que acá no están. Lo que sí hay es **lo que los motores
 * de la app ya saben, apuntado a cada zona**: la pérdida de suelo de la USLE con
 * la pendiente y la longitud de ladera **de esa zona** (no las del predio), las
 * exclusiones de `emplazamiento.ts` donde cae una zona de vivienda, el retiro de
 * curso de agua, y la distancia al bebedero de `abrevadero.ts`.
 *
 * Y de ahí sale el hallazgo que sólo existe porque hay un polígono dibujado:
 * **la longitud de ladera de la USLE adentro de una zona es la dimensión de la
 * zona medida pendiente abajo**, así que la misma hectárea de cultivo girada 90°
 * cambia su pérdida de suelo por la raíz de la relación de lados. Una franja de
 * 200 × 50 m pierde el **doble** cruzada que tendida sobre la curva de nivel, y
 * el mapa de erosión de la app nunca lo supo porque nunca miró la zona.
 *
 * ── Las fuentes ──────────────────────────────────────────────────────────────
 *
 * 1. **Piner, A., «Appendix G. Permaculture Design»**, *North Carolina Extension
 *    Gardener Handbook*, NC State Extension Publications, 1/02/2022. Es la
 *    descripción institucional y de acceso libre de las zonas de Mollison.
 *    Textual: la zona 0 es «the house itself»; la zona 1, las actividades
 *    «multiple times each day» y los elementos «that need to be accessed
 *    quickly»; la zona 2, «about once a day»; la zona 3, «several times a week»;
 *    la zona 4, «monthly or seasonally»; la zona 5, «an area that is not managed
 *    at all, but is a place to observe and learn from nature». Y sobre el dibujo:
 *    «zones often are shown as concentric circles. This may not always be the
 *    case, depending on the site.»
 *
 * 2. **Tobler, W. (1993), «Three Presentations on Geographical Analysis and
 *    Modeling», NCGIA Technical Report 93-1**, UC Santa Barbara. La función de
 *    caminata, estimada —dice el propio reporte— «from empirical data given by
 *    Imhof (1950, pp 217-220)», y el método: «one simply calculates the slope of
 *    the terrain, and then converts this to a walking velocity», sobre una
 *    matriz de elevaciones. La expresión vive en la **figura II** del reporte,
 *    que es una imagen; los coeficientes se reprodujeron de la literatura
 *    derivada y se verificaron contra las dos cifras que el propio reporte y la
 *    bibliografía afirman: **5 km/h en el llano** y un máximo de **6 km/h en una
 *    bajada de 2,86°**. Las dos salen de la fórmula de acá (ver los tests).
 *
 * 3. **Wischmeier, W.H. & Smith, D.D.**, USLE, vía `usle.ts` de esta misma app,
 *    que ya trae R, K, LS y C con su fuente y su banda.
 *
 * 4. **NRCS CPS 391 «Riparian Forest Buffer»** y el resto de las fuentes de
 *    `emplazamiento.ts`, que este módulo no vuelve a citar: delega.
 *
 * 5. **NRCS**, la distancia al bebedero, vía `abrevadero.ts`.
 *
 * ── Rango de validez ─────────────────────────────────────────────────────────
 *
 * - La función de Tobler se ajustó sobre datos de **excursionismo a pie, sin
 *   carga, en terreno alpino**. Empujar una carretilla de compost no es eso, y
 *   el módulo lo dice en vez de corregirlo con un factor inventado. El 3/5 fuera
 *   de sendero es de la fuente; cualquier otro ajuste no lo es.
 * - Las frecuencias por zona son **las palabras de la fuente convertidas a
 *   viajes por año por mí**. La conversión se declara zona por zona y se publica
 *   como **rango**, no como número.
 * - Las operaciones de polígono (unión, intersección, recorte) se hacen en
 *   lat/lng con turf, que las trata como planas. A escala de predio el error es
 *   despreciable frente al del propio dibujo a mano alzada; a escala de miles de
 *   kilómetros no lo sería.
 * - La pendiente de una zona sale del DEM al **paso efectivo**, con la misma
 *   advertencia de `emplazamiento.ts`: el error relativo publicado está en
 *   metros y es fijo, así que muestrear más fino no mejora la pendiente.
 * - No mira napa, servidumbres, catastro, caminos existentes ni la norma local.
 *
 * Lo lee `components/ZonificacionGuiadaBloque.tsx`, dentro del panel de
 * Zonificación.
 */
import * as turf from '@turf/turf';
import { CATEGORIAS_ZONA, type CategoriaZona, type Zona } from './zonificacion';
import type { GrillaElevacion } from './grillaElevacion';
import {
  BUFFER_ES_POR_ORILLA, bufferCauce, type PropositoBuffer,
  evaluarEmplazamiento, indiceDePunto, type ContextoEmplazamiento,
  type Exclusion, type Requisito,
} from './emplazamiento';
import { LAMBDA_MAX_M, TOLERANCIA_T_HA, factorLS, perdidaSuelo, type EntradaUSLE, type PerdidaSuelo } from './usle';
import type { Mojon } from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// FUENTES
// ═══════════════════════════════════════════════════════════════════════════════

export const FUENTE_NCSU_PERMA =
  'Piner, A., «Appendix G. Permaculture Design», North Carolina Extension Gardener Handbook, NC State Extension, 2022';
export const FUENTE_TOBLER =
  'Tobler, W. (1993), «Three Presentations on Geographical Analysis and Modeling», NCGIA Technical Report 93-1, UC Santa Barbara';
export const FUENTE_IMHOF =
  'Imhof, E. (1950), Gelaende und Karte, Rentsch, Zúrich, pp. 217-220 (los datos sobre los que Tobler ajustó la función)';

export const EL_ANILLO_NO_ES_LA_ZONA =
  'La fuente dice que los anillos concéntricos son una convención de dibujo: ' +
  '«zones often are shown as concentric circles. This may not always be the ' +
  'case, depending on the site». Lo que define la zona es la frecuencia de ' +
  'visita, y el terreno decide dónde se puede ir seguido.';

export const LA_CARRETILLA_NO_ES_UN_EXCURSIONISTA =
  'La función de caminata se ajustó sobre datos de excursionismo a pie y sin ' +
  'carga. Llevar una carretilla de compost o un balde de agua es más lento, y ' +
  'cuánto más no está publicado: acá no se corrige con un factor inventado. ' +
  'Los tiempos son un piso, no una estimación de la jornada.';

// ═══════════════════════════════════════════════════════════════════════════════
// 1 · LA GEOMETRÍA DEL DIBUJO: SUMA, UNIÓN Y RECORTE NO SON LO MISMO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Los tipos de GeoJSON se derivan de las propias funciones de turf en vez de
 * importar `geojson`: ese paquete está en el árbol de dependencias pero no es
 * una dependencia declarada de la app, y un tipo prestado de una transitiva se
 * rompe en el próximo `pnpm install`.
 */
type PoligonoSimple = ReturnType<typeof turf.polygon>;
type Poligono = NonNullable<ReturnType<typeof turf.intersect>>;

/** Convierte los vértices de una zona en un polígono cerrado, o `null`. */
export function poligonoDeZona(z: Pick<Zona, 'vertices'>): PoligonoSimple | null {
  const v = z.vertices;
  if (v.length < 3) return null;
  if (!v.every(p => Number.isFinite(p?.lat) && Number.isFinite(p?.lng))) return null;
  const coords = v.map(p => [p.lng, p.lat] as [number, number]);
  const first = coords[0]!;
  const last = coords[coords.length - 1]!;
  if (first[0] !== last[0] || first[1] !== last[1]) coords.push(first);
  if (coords.length < 4) return null;
  try {
    return turf.polygon([coords]);
  } catch {
    return null;
  }
}

/** El predio, de los mojones. Hace falta para saber qué queda afuera. */
export function poligonoDePredio(mojones: Mojon[]): PoligonoSimple | null {
  return poligonoDeZona({ vertices: mojones });
}

/** Área en m² de un polígono, 0 si no se puede. */
function area(p: Poligono | null): number {
  if (!p) return 0;
  try {
    const a = turf.area(p);
    return Number.isFinite(a) ? a : 0;
  } catch {
    return 0;
  }
}

/** La intersección de dos polígonos, o `null` si no se tocan. */
function interseccion(a: PoligonoSimple, b: PoligonoSimple): Poligono | null {
  try {
    return turf.intersect(turf.featureCollection([a, b])) as Poligono | null;
  } catch {
    return null;
  }
}

export interface Solape {
  id_a:     string;
  id_b:     string;
  nombre_a: string;
  nombre_b: string;
  area_m2:  number;
  /** Fracción de la zona más chica que está pisada. */
  frac_de_la_menor: number;
}

/**
 * Los pares de zonas que se pisan, con la superficie pisada.
 *
 * No es necesariamente un error —una zona 2 puede contener la huerta, y un
 * silvopastoril es por definición dos usos sobre el mismo suelo—, así que el
 * módulo los **lista** en vez de prohibirlos. Lo que sí es un error es sumar las
 * áreas como si no se pisaran, que es lo que hoy hace el resumen.
 */
export function solapamientos(zonas: Zona[]): Solape[] {
  const polys = zonas.map(z => ({ z, p: poligonoDeZona(z) }));
  const out: Solape[] = [];
  for (let i = 0; i < polys.length; i++) {
    const a = polys[i]!;
    if (!a.p) continue;
    for (let j = i + 1; j < polys.length; j++) {
      const b = polys[j]!;
      if (!b.p) continue;
      const inter = interseccion(a.p, b.p);
      const m2 = area(inter);
      if (m2 <= 0) continue;
      const menor = Math.min(area(a.p), area(b.p));
      out.push({
        id_a: a.z.id, id_b: b.z.id,
        nombre_a: a.z.nombre, nombre_b: b.z.nombre,
        area_m2: Math.round(m2 * 10) / 10,
        frac_de_la_menor: menor > 0 ? Math.round((m2 / menor) * 1000) / 1000 : 0,
      });
    }
  }
  return out.sort((x, y) => y.area_m2 - x.area_m2);
}

/** La superficie que ocupan las zonas de verdad: la unión, no la suma. */
export function areaUnion_m2(zonas: Zona[]): number {
  const polys = zonas.map(poligonoDeZona).filter((p): p is PoligonoSimple => p !== null);
  if (polys.length === 0) return 0;
  if (polys.length === 1) return area(polys[0]!);
  try {
    const u = turf.union(turf.featureCollection(polys)) as Poligono | null;
    return area(u);
  } catch {
    // Si la unión falla por una geometría degenerada, la suma es una cota
    // superior honesta: se devuelve eso y el llamador ya avisa de la diferencia.
    return polys.reduce((s, p) => s + area(p), 0);
  }
}

export interface RecorteZona {
  area_dibujada_m2: number;
  area_dentro_m2:   number;
  area_afuera_m2:   number;
  /** Fracción del polígono dibujado que cae afuera del predio. */
  frac_afuera:      number;
}

/** Cuánto de una zona cae adentro del predio, y cuánto no. */
export function recorteAlPredio(z: Zona, predio: PoligonoSimple | null): RecorteZona | null {
  const p = poligonoDeZona(z);
  if (!p) return null;
  const dibujada = area(p);
  if (!predio) {
    return { area_dibujada_m2: dibujada, area_dentro_m2: dibujada, area_afuera_m2: 0, frac_afuera: 0 };
  }
  const dentro = area(interseccion(p, predio));
  const afuera = Math.max(0, dibujada - dentro);
  return {
    area_dibujada_m2: Math.round(dibujada * 10) / 10,
    area_dentro_m2:   Math.round(dentro * 10) / 10,
    area_afuera_m2:   Math.round(afuera * 10) / 10,
    frac_afuera:      dibujada > 0 ? Math.round((afuera / dibujada) * 1000) / 1000 : 0,
  };
}

export interface BalanceZonificacion {
  /** Lo que hoy muestra el panel: la suma de las áreas, una por una. */
  suma_ha:        number;
  /** Lo que ocupan de verdad: la unión. */
  union_ha:       number;
  /** La unión recortada al predio. */
  dentro_ha:      number;
  /** Superficie del predio. */
  predio_ha:      number;
  /** Fracción del predio efectivamente zonificada. */
  frac_zonificada: number;
  /** Cuánto infla la suma respecto de la unión. */
  doble_conteo_ha: number;
  /** Cuánto de lo dibujado cae afuera del predio. */
  afuera_ha:      number;
  solapes:        Solape[];
  advertencias:   string[];
}

/**
 * Las tres superficies juntas, que es la única forma de que la diferencia se
 * vea. Si no hay solapes ni nada afuera, las tres coinciden y el bloque lo dice
 * en una línea: entonces el resumen de siempre estaba bien.
 */
export function balanceDeZonificacion(zonas: Zona[], mojones: Mojon[]): BalanceZonificacion {
  const predio = poligonoDePredio(mojones);
  const predio_m2 = area(predio);

  const suma_m2 = zonas.reduce((s, z) => s + area(poligonoDeZona(z)), 0);
  const union_m2 = areaUnion_m2(zonas);

  let dentro_m2 = 0;
  if (predio) {
    const polys = zonas.map(poligonoDeZona).filter((p): p is PoligonoSimple => p !== null);
    if (polys.length > 0) {
      try {
        const u = (polys.length === 1 ? polys[0]! : turf.union(turf.featureCollection(polys))) as Poligono;
        dentro_m2 = area(interseccion(u as PoligonoSimple, predio));
      } catch {
        dentro_m2 = union_m2;
      }
    }
  } else {
    dentro_m2 = union_m2;
  }

  const solapes = solapamientos(zonas);
  const doble_m2 = Math.max(0, suma_m2 - union_m2);
  const afuera_m2 = Math.max(0, union_m2 - dentro_m2);

  const ha = (m2: number) => Math.round((m2 / 10000) * 100) / 100;
  const advertencias: string[] = [];

  if (doble_m2 > 0.005 * Math.max(suma_m2, 1)) {
    advertencias.push(
      `La suma de las superficies de las zonas da ${ha(suma_m2)} ha y lo que ocupan de verdad son ` +
      `${ha(union_m2)}: ${ha(doble_m2)} ha están contadas dos veces porque hay zonas que se pisan. ` +
      'Los porcentajes por categoría del resumen de arriba se calculan sobre la suma, así que ' +
      'están divididos por un total que no existe.',
    );
  }
  if (afuera_m2 > 0.005 * Math.max(union_m2, 1)) {
    advertencias.push(
      `${ha(afuera_m2)} ha de lo dibujado caen afuera del perímetro de los mojones. Eso puede ser ` +
      'un mojón mal puesto o una zona mal cerrada, pero no es superficie del predio y no debería ' +
      'estar en el balance de usos.',
    );
  }
  if (!predio) {
    advertencias.push(
      'Sin el perímetro del predio (hacen falta tres mojones) no se puede saber qué parte de lo ' +
      'dibujado está adentro. Las superficies de acá son del dibujo, no del predio.',
    );
  }
  if (predio_m2 > 0 && union_m2 > 0 && dentro_m2 / predio_m2 > 0.995) {
    advertencias.push(
      'El predio está zonificado casi por completo. Vale recordar que los caminos, los alambrados ' +
      'y los retiros de curso de agua también ocupan superficie: si no tienen zona propia, están ' +
      'contados dentro de otro uso.',
    );
  }

  return {
    suma_ha:  ha(suma_m2),
    union_ha: ha(union_m2),
    dentro_ha: ha(dentro_m2),
    predio_ha: ha(predio_m2),
    frac_zonificada: predio_m2 > 0 ? Math.round((dentro_m2 / predio_m2) * 1000) / 1000 : 0,
    doble_conteo_ha: ha(doble_m2),
    afuera_ha: ha(afuera_m2),
    solapes,
    advertencias,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2 · LA ZONA DE MOLLISON ES UNA FRECUENCIA
// ═══════════════════════════════════════════════════════════════════════════════

/** Las seis categorías que son zonas de Mollison, en orden. */
export const CATEGORIAS_MOLLISON: readonly CategoriaZona[] =
  ['zona_0', 'zona_1', 'zona_2', 'zona_3', 'zona_4', 'zona_5'];

/** El número de zona de Mollison de una categoría, o `null` si no es una. */
export function numeroDeZona(c: CategoriaZona): number | null {
  const i = CATEGORIAS_MOLLISON.indexOf(c);
  return i < 0 ? null : i;
}

export interface FrecuenciaZona {
  zona:   number;
  /** Las palabras de la fuente, sin traducir el sentido. */
  textual: string;
  /** Viajes por año, mínimo y máximo. `null` en la 0 y en la 5. */
  viajes_anio: readonly [number, number] | null;
  /** Qué parte de esos números es conversión mía y no de la fuente. */
  nota:   string;
}

/**
 * La frecuencia de visita de cada zona, de NC State Extension, convertida a
 * viajes por año.
 *
 * **La conversión es mía y se declara.** La fuente da palabras —«multiple times
 * each day», «several times a week»— y acá se las lee como rangos: «multiple»
 * como 2 a 4, «several» como 2 a 4, «monthly or seasonally» como 4 a 12. Por eso
 * el resultado se publica como banda y nunca como número. La zona 0 es la casa,
 * así que su distancia a sí misma es cero; la zona 5 no se maneja, así que su
 * presupuesto de viajes de trabajo es cero por definición de la fuente —«not
 * managed at all»— y lo que pase ahí es observación.
 */
export const FRECUENCIA_ZONA: Readonly<Record<number, FrecuenciaZona>> = {
  0: {
    zona: 0, textual: 'the house itself', viajes_anio: null,
    nota: 'Es el centro. No se viaja a la zona 0: se viaja desde ella.',
  },
  1: {
    zona: 1, textual: 'multiple times each day', viajes_anio: [730, 1461],
    nota: '«Multiple» se lee acá como 2 a 4 veces por día. La fuente no da el número.',
  },
  2: {
    zona: 2, textual: 'about once a day', viajes_anio: [365, 365],
    nota: 'Es el único caso donde la fuente da un número y no hay banda que inventar.',
  },
  3: {
    zona: 3, textual: 'several times a week', viajes_anio: [104, 208],
    nota: '«Several times a week» se lee acá como 2 a 4 por semana.',
  },
  4: {
    zona: 4, textual: 'monthly or seasonally', viajes_anio: [4, 12],
    nota: '«Monthly or seasonally» se lee acá como 4 (estacional) a 12 (mensual) por año.',
  },
  5: {
    zona: 5, textual: 'not managed at all, but a place to observe and learn from nature', viajes_anio: null,
    nota: 'La fuente dice que no se maneja, así que no tiene presupuesto de viajes de trabajo.',
  },
};

/**
 * La velocidad de caminata de Tobler, en km/h, para una pendiente dada.
 *
 * `W = 6 · exp(−3,5 · |S + 0,05|)`, con `S` la pendiente como tangente (positiva
 * hacia arriba). Fuera de sendero se multiplica por **3/5**, que es el factor de
 * la fuente.
 *
 * Las dos comprobaciones que el reporte y la bibliografía afirman y que esta
 * fórmula tiene que reproducir: **5 km/h en el llano** (6·e^−0,175 = 5,037) y un
 * máximo de **6 km/h exactos** en una bajada de 5 % (−2,86°), que es donde el
 * valor absoluto se anula. El máximo **no está en el llano**, y de ahí sale que
 * la ida y la vuelta no son simétricas.
 */
export function velocidadTobler(
  pendiente_fraccion: number,
  opciones?: { fuera_de_sendero?: boolean },
): number {
  if (!Number.isFinite(pendiente_fraccion)) return 0;
  const w = 6 * Math.exp(-3.5 * Math.abs(pendiente_fraccion + 0.05));
  return opciones?.fuera_de_sendero ? w * 0.6 : w;
}

/** La pendiente a la que la caminata es más rápida: una bajada del 5 %. */
export const PENDIENTE_MAS_RAPIDA = -0.05;
/** Y la velocidad ahí, que es el tope de la función. */
export const VELOCIDAD_MAXIMA_KMH = 6;
/** Fuera de sendero, el factor de la fuente. */
export const FACTOR_FUERA_DE_SENDERO = 0.6;

export interface Tramo {
  /** Distancia horizontal, en metros. */
  largo_m:    number;
  /** Desnivel con signo: positivo subiendo. */
  desnivel_m: number;
}

export interface ViajeIdaYVuelta {
  dist_ida_m:    number;
  desnivel_m:    number;
  horas_ida:     number;
  horas_vuelta:  number;
  horas_total:   number;
  /** Cuánto se desvía del doble de la ida, en porcentaje. */
  asimetria_pct: number;
  /** Velocidad media de la ida y de la vuelta, en km/h. */
  kmh_ida:       number;
  kmh_vuelta:    number;
}

/**
 * El tiempo de ida y el de vuelta de un recorrido, por separado.
 *
 * El punto del cálculo es que **no son iguales**: la función de Tobler es
 * asimétrica respecto del llano, así que subir una ladera y bajarla cuestan
 * distinto, y el viaje redondo no es el doble de ninguno de los dos. En una
 * pendiente del 20 % la subida va a 2,50 km/h y la bajada a 3,55: el redondo es
 * un 19 % más lento que el doble de la bajada y un 16 % más rápido que el doble
 * de la subida.
 */
export function viajeIdaYVuelta(
  tramos: Tramo[],
  opciones?: { fuera_de_sendero?: boolean },
): ViajeIdaYVuelta | null {
  if (tramos.length === 0) return null;
  let dist = 0;
  let desnivel = 0;
  let hIda = 0;
  let hVuelta = 0;
  for (const t of tramos) {
    if (!(t.largo_m > 0) || !Number.isFinite(t.desnivel_m)) continue;
    dist += t.largo_m;
    desnivel += t.desnivel_m;
    const s = t.desnivel_m / t.largo_m;
    const vIda = velocidadTobler(s, opciones);
    const vVuelta = velocidadTobler(-s, opciones);
    if (vIda > 0)    hIda    += (t.largo_m / 1000) / vIda;
    if (vVuelta > 0) hVuelta += (t.largo_m / 1000) / vVuelta;
  }
  if (!(dist > 0)) return null;
  const total = hIda + hVuelta;
  const r3 = (x: number) => Math.round(x * 1000) / 1000;
  const r2 = (x: number) => Math.round(x * 100) / 100;
  return {
    dist_ida_m:    Math.round(dist * 10) / 10,
    desnivel_m:    Math.round(desnivel * 10) / 10,
    horas_ida:     r3(hIda),
    horas_vuelta:  r3(hVuelta),
    horas_total:   r3(total),
    asimetria_pct: hIda > 0 ? Math.round(((hVuelta - hIda) / hIda) * 1000) / 10 : 0,
    kmh_ida:       hIda > 0 ? r2((dist / 1000) / hIda) : 0,
    kmh_vuelta:    hVuelta > 0 ? r2((dist / 1000) / hVuelta) : 0,
  };
}

export interface CostoCaminata {
  zona:         number;
  frecuencia:   FrecuenciaZona;
  viaje:        ViajeIdaYVuelta;
  /** Kilómetros caminados por año, mínimo y máximo de la banda. */
  km_anio:      readonly [number, number];
  /** Horas caminadas por año. */
  horas_anio:   readonly [number, number];
  advertencias: string[];
}

/**
 * Lo que cuesta por año llegar a una zona, con el presupuesto de viajes que su
 * propio número declara.
 *
 * Es la cifra que el dibujo de anillos concéntricos no muestra: **una zona 1
 * lejos cuesta más que una zona 3 cerca**, porque la frecuencia pesa más que la
 * distancia. Con las bandas de la fuente, el factor entre la zona 1 y la zona 4
 * es de **61 a 365 veces** a igual distancia.
 */
export function costoDeCaminata(
  zona: number,
  tramos: Tramo[],
  opciones?: { fuera_de_sendero?: boolean },
): CostoCaminata | null {
  const frecuencia = FRECUENCIA_ZONA[zona];
  if (!frecuencia || !frecuencia.viajes_anio) return null;
  const viaje = viajeIdaYVuelta(tramos, opciones);
  if (!viaje) return null;

  const [vMin, vMax] = frecuencia.viajes_anio;
  const kmRedondo = (viaje.dist_ida_m * 2) / 1000;
  const r1 = (x: number) => Math.round(x * 10) / 10;

  const advertencias: string[] = [LA_CARRETILLA_NO_ES_UN_EXCURSIONISTA, frecuencia.nota];
  if (opciones?.fuera_de_sendero) {
    advertencias.push(
      'Calculado fuera de sendero: la fuente multiplica la velocidad por 3/5. Un camino hecho ' +
      'devuelve ese 40 %, y es la cuenta que justifica abrir el camino antes que mover la zona.',
    );
  }

  return {
    zona, frecuencia, viaje,
    km_anio:    [r1(kmRedondo * vMin), r1(kmRedondo * vMax)],
    horas_anio: [r1(viaje.horas_total * vMin), r1(viaje.horas_total * vMax)],
    advertencias,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3 · LA ZONA MEDIDA SOBRE EL TERRENO
// ═══════════════════════════════════════════════════════════════════════════════

export interface GeometriaZona {
  /** Celdas de la grilla cuyo centro cae adentro de la zona. */
  celdas:        number;
  pend_mediana_pct: number;
  pend_max_pct:  number;
  /** Rumbo medio de la pendiente, en grados desde el norte hacia donde baja. */
  rumbo_bajada_deg: number | null;
  /**
   * Longitud de ladera de la zona: su extensión medida **pendiente abajo**.
   * Es el `λ` que la USLE pide, y es una propiedad de la zona y de su
   * orientación, no del predio.
   */
  lambda_m:      number;
  /** La extensión perpendicular, que es el ancho sobre la curva de nivel. */
  ancho_m:       number;
  elev_min_m:    number;
  elev_max_m:    number;
  centro:        { lat: number; lng: number };
}

/** Centro de la celda `i` de la grilla, en lat/lng. */
function centroCelda(g: GrillaElevacion, i: number): { lat: number; lng: number } {
  const r = Math.floor(i / g.cols);
  const c = i % g.cols;
  const dLat = (g.latMax - g.latMin) / Math.max(1, g.rows - 1);
  const dLng = (g.lngMax - g.lngMin) / Math.max(1, g.cols - 1);
  return { lat: g.latMin + r * dLat, lng: g.lngMin + c * dLng };
}

/**
 * La geometría de una zona medida sobre el relieve: su pendiente, su orientación
 * y —lo que importa— **su longitud de ladera**.
 *
 * `lambda_m` se calcula proyectando las celdas de la zona sobre el versor de
 * máxima pendiente media y tomando la extensión de esa proyección. Es la
 * dimensión que la USLE llama `λ`, y depende de **cómo está girada la zona**: la
 * misma superficie tendida sobre la curva de nivel tiene un `λ` corto y girada
 * 90° lo tiene largo. Como `LS` va con `λ^m` y `m` vale 0,5 arriba del 5 % de
 * pendiente, girar una franja de 200 × 50 m **duplica** la pérdida de suelo.
 */
export function geometriaDeZona(
  z: Zona,
  ctx: ContextoEmplazamiento,
): GeometriaZona | null {
  const poly = poligonoDeZona(z);
  if (!poly) return null;
  const { g, pend } = ctx;

  const idx: number[] = [];
  const n = g.rows * g.cols;
  for (let i = 0; i < n; i++) {
    if (Number.isNaN(g.elev[i]!)) continue;
    const c = centroCelda(g, i);
    if (turf.booleanPointInPolygon(turf.point([c.lng, c.lat]), poly)) idx.push(i);
  }
  if (idx.length === 0) return null;

  // Pendientes y elevaciones de la zona.
  const pends = idx.map(i => (pend[i] ?? 0) * 100).sort((a, b) => a - b);
  const elevs = idx.map(i => g.elev[i]!);
  const mediana = pends[Math.floor(pends.length / 2)] ?? 0;
  const pendMax = pends[pends.length - 1] ?? 0;

  // Rumbo medio de la bajada: el gradiente promedio de las celdas de la zona.
  const { dx, dy } = dimsDeCelda(g);
  let gx = 0;
  let gy = 0;
  let conGrad = 0;
  for (const i of idx) {
    const r = Math.floor(i / g.cols);
    const c = i % g.cols;
    if (r < 1 || r > g.rows - 2 || c < 1 || c > g.cols - 2) continue;
    const zE = g.elev[i + 1]!;
    const zW = g.elev[i - 1]!;
    const zN = g.elev[i + g.cols]!;
    const zS = g.elev[i - g.cols]!;
    if (Number.isNaN(zE) || Number.isNaN(zW) || Number.isNaN(zN) || Number.isNaN(zS)) continue;
    gx += (zE - zW) / (2 * dx);
    gy += (zN - zS) / (2 * dy);
    conGrad++;
  }
  let ux = 0;
  let uy = 0;
  let rumbo: number | null = null;
  if (conGrad > 0) {
    gx /= conGrad;
    gy /= conGrad;
    const mod = Math.hypot(gx, gy);
    if (mod > 1e-9) {
      // Versor de máxima BAJADA: menos el gradiente, normalizado.
      ux = -gx / mod;
      uy = -gy / mod;
      // Rumbo desde el norte, en sentido horario. uy es la componente norte.
      rumbo = ((Math.atan2(ux, uy) * 180) / Math.PI + 360) % 360;
    }
  }

  // Extensión a lo largo de la bajada (λ) y perpendicular (ancho), en metros,
  // proyectando los centros de celda sobre los dos versores.
  let lambda = 0;
  let ancho = 0;
  const c0 = centroCelda(g, idx[0]!);
  if (ux !== 0 || uy !== 0) {
    let pMin = Infinity; let pMax = -Infinity;
    let qMin = Infinity; let qMax = -Infinity;
    for (const i of idx) {
      const c = centroCelda(g, i);
      // Metros respecto de la primera celda, con el mismo paso que la grilla.
      const ex = ((c.lng - c0.lng) / Math.max(1e-12, (g.lngMax - g.lngMin) / Math.max(1, g.cols - 1))) * dx;
      const ey = ((c.lat - c0.lat) / Math.max(1e-12, (g.latMax - g.latMin) / Math.max(1, g.rows - 1))) * dy;
      const p = ex * ux + ey * uy;         // a lo largo de la bajada
      const q = ex * -uy + ey * ux;        // perpendicular
      if (p < pMin) pMin = p; if (p > pMax) pMax = p;
      if (q < qMin) qMin = q; if (q > qMax) qMax = q;
    }
    lambda = Math.max(0, pMax - pMin);
    ancho = Math.max(0, qMax - qMin);
  }
  // En un plano sin gradiente resoluble no hay dirección de bajada: se usa el
  // lado del cuadrado equivalente, que es lo único defendible sin orientación.
  if (!(lambda > 0)) {
    const a = turf.area(poly);
    lambda = Math.sqrt(Math.max(0, a));
    ancho = lambda;
  }

  const r1 = (x: number) => Math.round(x * 10) / 10;
  return {
    celdas: idx.length,
    pend_mediana_pct: r1(mediana),
    pend_max_pct: r1(pendMax),
    rumbo_bajada_deg: rumbo === null ? null : Math.round(rumbo),
    lambda_m: r1(lambda),
    ancho_m: r1(ancho),
    elev_min_m: r1(Math.min(...elevs)),
    elev_max_m: r1(Math.max(...elevs)),
    centro: (() => {
      try {
        const cm = turf.centerOfMass(poly);
        const [lng, lat] = cm.geometry.coordinates as [number, number];
        return { lat, lng };
      } catch {
        return c0;
      }
    })(),
  };
}

/** Lados de celda en metros, igual que `emplazamiento.ts`. */
function dimsDeCelda(g: GrillaElevacion): { dx: number; dy: number } {
  const latMed = (g.latMin + g.latMax) / 2;
  const mPorGradoLat = 111_132;
  const mPorGradoLng = 111_320 * Math.cos((latMed * Math.PI) / 180);
  const dy = ((g.latMax - g.latMin) / Math.max(1, g.rows - 1)) * mPorGradoLat;
  const dx = ((g.lngMax - g.lngMin) / Math.max(1, g.cols - 1)) * mPorGradoLng;
  return { dx: Math.max(1e-6, dx), dy: Math.max(1e-6, dy) };
}

/**
 * Cuánto cambia la pérdida de suelo de la misma zona según cómo esté girada.
 *
 * Es el resultado que sólo aparece cuando hay un polígono: a igual superficie y
 * a igual pendiente, `LS` va con `λ^m`, y `λ` es la dimensión **pendiente
 * abajo**. Tender la zona sobre la curva de nivel o cruzarla cambia la pérdida
 * por `(largo/ancho)^m`, que con `m = 0,5` es la raíz de la relación de lados.
 */
export function girarLaZona(geo: GeometriaZona, pendiente_pct: number): {
  lambda_actual_m: number;
  lambda_girada_m: number;
  ls_actual:  number;
  ls_girada:  number;
  factor:     number;
  mejor:      'como_esta' | 'girada' | 'da_lo_mismo';
} {
  const a = Math.max(1, geo.lambda_m);
  const b = Math.max(1, geo.ancho_m);
  const lsA = factorLS(pendiente_pct, a);
  const lsB = factorLS(pendiente_pct, b);
  const r2 = (x: number) => Math.round(x * 100) / 100;
  const factor = lsB > 0 ? r2(lsA / lsB) : 1;
  return {
    lambda_actual_m: r2(a),
    lambda_girada_m: r2(b),
    ls_actual: r2(lsA),
    ls_girada: r2(lsB),
    factor,
    mejor: Math.abs(factor - 1) < 0.02 ? 'da_lo_mismo' : factor > 1 ? 'girada' : 'como_esta',
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4 · LA VERIFICACIÓN DE UNA ZONA
// ═══════════════════════════════════════════════════════════════════════════════

/** Qué le pide el terreno a cada categoría. Se delega, no se inventa. */
export type Chequeo =
  | 'erosion'        // la USLE sobre la pendiente y el λ de la zona
  | 'emplazamiento'  // las exclusiones y requisitos de emplazamiento.ts
  | 'retiro_cauce'   // el buffer ribereño
  | 'caminata';      // el presupuesto de viajes de la zona de Mollison

/**
 * Qué se le chequea a cada categoría y por qué.
 *
 * Las categorías que no están acá no tienen chequeo con fuente, y eso se dice:
 * un apiario o una zona de recreación no tienen pendiente máxima publicada, y
 * fabricarle una sería exactamente lo que esta app no hace.
 */
export const CHEQUEOS_POR_CATEGORIA: Readonly<Partial<Record<CategoriaZona, readonly Chequeo[]>>> = {
  zona_0:   ['emplazamiento', 'retiro_cauce'],
  zona_1:   ['caminata', 'erosion', 'retiro_cauce'],
  zona_2:   ['caminata', 'erosion', 'retiro_cauce'],
  zona_3:   ['caminata', 'erosion', 'retiro_cauce'],
  zona_4:   ['caminata', 'retiro_cauce'],
  zona_5:   ['retiro_cauce'],
  vivienda: ['emplazamiento', 'retiro_cauce'],
  huerta:   ['erosion', 'retiro_cauce'],
  cultivo:  ['erosion', 'retiro_cauce'],
  frutales: ['erosion', 'retiro_cauce'],
  pasturas: ['erosion', 'retiro_cauce'],
  agua:     ['retiro_cauce'],
  infraestructura: ['emplazamiento', 'retiro_cauce'],
};

export interface VerificacionZona {
  id:        string;
  nombre:    string;
  categoria: CategoriaZona;
  label:     string;
  geometria: GeometriaZona;
  recorte:   RecorteZona | null;
  /** Reglas de sí o no, con el mismo tipo que `emplazamiento.ts`. */
  exclusiones:  Exclusion[];
  /** Lo que cuesta, con su magnitud. */
  requisitos:   Requisito[];
  advertencias: string[];
  /** La pérdida de suelo de esta zona, si la categoría lo pide y hay datos. */
  erosion:   PerdidaSuelo | null;
  /** Y cuánto cambia si la zona se gira. */
  giro:      ReturnType<typeof girarLaZona> | null;
  /** El presupuesto de caminata, si es una zona de Mollison con centro. */
  caminata:  CostoCaminata | null;
}

export interface OpcionesVerificacion {
  /** Para la USLE. Sin `usle_c` no hay estimación y se dice. */
  usle?: EntradaUSLE | null;
  /** El propósito del retiro ribereño elegido por el usuario. */
  buffer?: PropositoBuffer;
  /** El centro desde donde se camina: la zona 0 dibujada, o la casa. */
  centro?: { lat: number; lng: number } | null;
  /** Si todavía no hay camino hecho hasta la zona. */
  fuera_de_sendero?: boolean;
}

/**
 * La verificación completa de una zona: lo que el terreno le dice al polígono.
 *
 * Devuelve las mismas tres listas que `emplazamiento.ts` —exclusiones,
 * requisitos y advertencias— a propósito: es la estructura que al puntaje del
 * master plan le faltaba, y repetirla acá quiere decir que una zona dibujada
 * dentro del retiro de un arroyo **no se compensa** con nada.
 */
export function verificarZona(
  z: Zona,
  ctx: ContextoEmplazamiento,
  predio: PoligonoSimple | null,
  opciones?: OpcionesVerificacion,
): VerificacionZona | null {
  const geometria = geometriaDeZona(z, ctx);
  if (!geometria) return null;

  const chequeos = CHEQUEOS_POR_CATEGORIA[z.categoria] ?? [];
  const exclusiones: Exclusion[] = [];
  const requisitos: Requisito[] = [];
  const advertencias: string[] = [];
  const recorte = recorteAlPredio(z, predio);

  if (recorte && recorte.frac_afuera > 0.01) {
    advertencias.push(
      `El ${Math.round(recorte.frac_afuera * 100)} % de esta zona cae afuera del perímetro de los ` +
      'mojones. Lo que se mide acá es sólo la parte de adentro.',
    );
  }

  // ── El emplazamiento, delegado celda por celda ──
  if (chequeos.includes('emplazamiento') || chequeos.includes('retiro_cauce')) {
    const i = indiceDePunto(ctx.g, geometria.centro.lat, geometria.centro.lng);
    const ev = i == null ? null : evaluarEmplazamiento(ctx, i);
    if (ev) {
      const soloRetiro = !chequeos.includes('emplazamiento');
      for (const ex of ev.exclusiones) {
        // Una zona de huerta no queda excluida por no tener camino de vehículo:
        // ese requisito es de una construcción. Para las que no son de
        // construcción se mira sólo el retiro de curso de agua y el cauce.
        if (soloRetiro && ex.regla !== 'buffer_cauce' && ex.regla !== 'cauce') continue;
        exclusiones.push(ex);
      }
      if (!soloRetiro) requisitos.push(...ev.requisitos);
      advertencias.push(...ev.advertencias);
    } else {
      advertencias.push(
        'El centro de masa de esta zona cae fuera de la grilla de relieve, así que no se pudo ' +
        'chequear el emplazamiento. Puede pasar con una zona en forma de C, cuyo centro de masa ' +
        'queda en el hueco.',
      );
    }
    if (chequeos.includes('retiro_cauce') && BUFFER_ES_POR_ORILLA) {
      const b = bufferCauce(opciones?.buffer ?? 'nutrientes');
      advertencias.push(
        `El retiro que se está aplicando es el de ${b.para} (${b.m.toFixed(1)} m) y es **por ` +
        'orilla**: el corredor mide el doble. Cambiar el propósito cambia el retiro por un factor ' +
        'de hasta 4,7.',
      );
    }
  }

  // ── La erosión, con la pendiente y el λ de ESTA zona ──
  let erosion: PerdidaSuelo | null = null;
  let giro: ReturnType<typeof girarLaZona> | null = null;
  if (chequeos.includes('erosion')) {
    if (opciones?.usle) {
      erosion = perdidaSuelo(opciones.usle, geometria.pend_mediana_pct, geometria.lambda_m);
      if (erosion.veces_tolerancia > 1) {
        requisitos.push({
          titulo: `Pérdida de suelo: ${erosion.t_ha_anio} t/ha/año, ${erosion.veces_tolerancia}× la tolerancia`,
          detalle:
            `Con la pendiente mediana de esta zona (${geometria.pend_mediana_pct} %) y su propia ` +
            `longitud de ladera (${geometria.lambda_m} m), la USLE da ${erosion.t_ha_anio} t/ha/año, ` +
            `contra la tolerancia de referencia de ${TOLERANCIA_T_HA} t/ha/año. La banda va de ` +
            `${erosion.min_t_ha} a ${erosion.max_t_ha}: el producto de cinco aproximaciones no da un punto.`,
          fuente: 'USLE (Wischmeier & Smith), vía lib/usle.ts',
        });
      }
      if (geometria.lambda_m >= LAMBDA_MAX_M) {
        advertencias.push(
          `La longitud de ladera de esta zona llega al tope de ${LAMBDA_MAX_M} m que la USLE ` +
          'admite. Arriba de eso el flujo se concentra en cárcavas, que es otro proceso: el número ' +
          'quedó recortado y es una cota inferior.',
        );
      }
    } else {
      advertencias.push(
        'Sin el factor C de la cobertura y sin la textura del suelo no se puede estimar la pérdida ' +
        'de suelo de esta zona. Corré los paneles de Suelo y de Cobertura: el número no se rellena ' +
        'con un promedio.',
      );
    }
    giro = girarLaZona(geometria, geometria.pend_mediana_pct);
    if (giro.mejor === 'girada' && giro.factor >= 1.2) {
      requisitos.push({
        titulo: `La zona está cruzada a la pendiente: ${giro.factor}× más pérdida que tendida`,
        detalle:
          `Esta zona mide ${giro.lambda_actual_m} m pendiente abajo y ${giro.lambda_girada_m} m ` +
          'sobre la curva de nivel. Tendida al revés, el factor topográfico de la USLE baja de ' +
          `${giro.ls_actual} a ${giro.ls_girada}: la misma superficie perdería ${giro.factor} veces ` +
          'menos suelo. Es la misma hectárea, girada.',
        fuente: 'Factor LS de la USLE: LS ∝ λ^m, con m = 0,5 arriba del 5 % de pendiente',
      });
    }
  }

  // ── La caminata, con el presupuesto que la propia zona declara ──
  let caminata: CostoCaminata | null = null;
  if (chequeos.includes('caminata')) {
    const num = numeroDeZona(z.categoria);
    const centro = opciones?.centro ?? null;
    if (num !== null && centro) {
      const tramos = tramosEntre(ctx, centro, geometria.centro);
      if (tramos) {
        caminata = costoDeCaminata(num, tramos, { fuera_de_sendero: opciones?.fuera_de_sendero });
      }
    } else if (num !== null && !centro) {
      advertencias.push(
        'La zona 0 es el centro desde el que se mide todo lo demás, y no está definida. Dibujala ' +
        '—o marcá la casa— y acá aparece lo que cuesta llegar a esta zona todos los años.',
      );
    }
  }

  // ── Las categorías sin chequeo, dicho ──
  if (chequeos.length === 0) {
    advertencias.push(
      `No hay ninguna cifra publicada que condicione una zona de «${CATEGORIAS_ZONA[z.categoria].label}» ` +
      'al terreno, así que acequia no le pone ninguna. Lo que se muestra es la geometría medida y ' +
      'nada más.',
    );
  }

  return {
    id: z.id, nombre: z.nombre, categoria: z.categoria,
    label: CATEGORIAS_ZONA[z.categoria].label,
    geometria, recorte, exclusiones, requisitos, advertencias, erosion, giro, caminata,
  };
}

/**
 * El perfil entre dos puntos del predio, en tramos de una celda, para que el
 * tiempo de viaje use la pendiente real y no la pendiente media.
 *
 * La diferencia importa: una pendiente media del 10 % con un tramo del 30 % no
 * se camina como un 10 % uniforme, porque la función de velocidad es convexa.
 */
export function tramosEntre(
  ctx: ContextoEmplazamiento,
  desde: { lat: number; lng: number },
  hasta: { lat: number; lng: number },
): Tramo[] | null {
  const { g } = ctx;
  const { dx, dy } = dimsDeCelda(g);
  const paso = (dx + dy) / 2;
  const dLat = (hasta.lat - desde.lat) * 111_132;
  const latMed = (desde.lat + hasta.lat) / 2;
  const dLng = (hasta.lng - desde.lng) * 111_320 * Math.cos((latMed * Math.PI) / 180);
  const dist = Math.hypot(dLat, dLng);
  if (!(dist > 0)) return null;

  const n = Math.max(1, Math.min(400, Math.round(dist / Math.max(1, paso))));
  const tramos: Tramo[] = [];
  let zPrev: number | null = null;
  for (let k = 0; k <= n; k++) {
    const t = k / n;
    const lat = desde.lat + (hasta.lat - desde.lat) * t;
    const lng = desde.lng + (hasta.lng - desde.lng) * t;
    const i = indiceDePunto(g, lat, lng);
    const z = i == null ? NaN : g.elev[i]!;
    if (zPrev !== null) {
      const largo = dist / n;
      const desnivel = Number.isNaN(z) || Number.isNaN(zPrev) ? 0 : z - zPrev;
      tramos.push({ largo_m: largo, desnivel_m: desnivel });
    }
    if (!Number.isNaN(z)) zPrev = z;
    else if (zPrev === null) zPrev = null;
  }
  return tramos.length > 0 ? tramos : null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5 · EL RELEVAMIENTO COMPLETO
// ═══════════════════════════════════════════════════════════════════════════════

export interface ZonificacionGuiada {
  balance:  BalanceZonificacion;
  zonas:    VerificacionZona[];
  /** Zonas que no se pudieron medir porque no pisan la grilla de relieve. */
  sin_medir: Array<{ id: string; nombre: string }>;
  /** Cuántas zonas tienen al menos una exclusión. */
  con_exclusion: number;
  advertencias: string[];
}

/** El relevamiento de todas las zonas dibujadas. */
export function revisarZonificacion(
  zonas: Zona[],
  mojones: Mojon[],
  ctx: ContextoEmplazamiento | null,
  opciones?: OpcionesVerificacion,
): ZonificacionGuiada {
  const balance = balanceDeZonificacion(zonas, mojones);
  const predio = poligonoDePredio(mojones);
  const advertencias: string[] = [...balance.advertencias];

  const out: VerificacionZona[] = [];
  const sin_medir: Array<{ id: string; nombre: string }> = [];

  if (!ctx) {
    advertencias.push(
      'Sin la grilla densa del relieve no se puede medir ninguna zona: la pendiente, la longitud ' +
      'de ladera y el retiro de curso de agua salen de ahí. Prendé las curvas de nivel.',
    );
  } else {
    for (const z of zonas) {
      const v = verificarZona(z, ctx, predio, opciones);
      if (v) out.push(v);
      else sin_medir.push({ id: z.id, nombre: z.nombre });
    }
    if (ctx.paso_efectivo_m > 15) {
      advertencias.push(
        `El relieve de acá tiene un paso efectivo de ${Math.round(ctx.paso_efectivo_m)} m. Las ` +
        'pendientes por zona y las longitudes de ladera heredan ese paso, y el borde de un retiro ' +
        `arrastra la mitad de la resolución de la fuente: ±${Math.round(ctx.paso_fuente_m / 2)} m.`,
      );
    }
  }

  const centroDefinido = opciones?.centro != null || zonas.some(z => z.categoria === 'zona_0');
  if (!centroDefinido && zonas.some(z => numeroDeZona(z.categoria) !== null)) {
    advertencias.push(EL_ANILLO_NO_ES_LA_ZONA);
  }

  return {
    balance,
    zonas: out,
    sin_medir,
    con_exclusion: out.filter(v => v.exclusiones.length > 0).length,
    advertencias,
  };
}
