/**
 * Cobertura del suelo (C3) — ESA WorldCover 10 m (2021).
 * Composición de clases de uso/cobertura del predio a partir del histograma
 * calculado en el servidor (Microsoft Planetary Computer). Deriva el % de
 * vegetación, la banda de forraje medido de esas clases y una nota de CN
 * (escorrentía). Orientativo — resolución 10 m, clasificación satelital global.
 *
 * `forrajePorCobertura` no se guarda con el resto: se calcula al mostrarlo,
 * desde `items`. Así un proyecto guardado antes del 17/10/2026 también recibe la
 * banda medida en vez del número inventado que tenía adentro.
 */
import { FORRAJE_MEDIDO } from './forrajeMedido';
import type { Mojon } from './types';

export interface ClaseCobertura {
  valor:  number;
  nombre: string;
  color:  string;
  grupo:  'vegetacion' | 'agua' | 'suelo' | 'artificial';
}

// Paleta y nombres oficiales ESA WorldCover v200.
export const CLASES_WC: Record<number, ClaseCobertura> = {
  10:  { valor: 10,  nombre: 'Bosque / arbolado',   color: '#006400', grupo: 'vegetacion' },
  20:  { valor: 20,  nombre: 'Arbustal',            color: '#ffbb22', grupo: 'vegetacion' },
  30:  { valor: 30,  nombre: 'Pastizal',            color: '#ffff4c', grupo: 'vegetacion' },
  40:  { valor: 40,  nombre: 'Cultivo',             color: '#f096ff', grupo: 'vegetacion' },
  50:  { valor: 50,  nombre: 'Construido / urbano', color: '#fa0000', grupo: 'artificial' },
  60:  { valor: 60,  nombre: 'Suelo desnudo / ralo', color: '#b4b4b4', grupo: 'suelo' },
  70:  { valor: 70,  nombre: 'Nieve / hielo',       color: '#f0f0f0', grupo: 'suelo' },
  80:  { valor: 80,  nombre: 'Agua',                color: '#0064c8', grupo: 'agua' },
  90:  { valor: 90,  nombre: 'Humedal herbáceo',    color: '#0096a0', grupo: 'agua' },
  95:  { valor: 95,  nombre: 'Manglar',             color: '#00cf75', grupo: 'vegetacion' },
  100: { valor: 100, nombre: 'Musgo / liquen',      color: '#fae6a0', grupo: 'vegetacion' },
};

export interface ItemCobertura {
  clase: ClaseCobertura;
  pct:   number;   // % del predio
}

export interface DatosCobertura {
  items:        ItemCobertura[];   // ordenadas por % desc
  veg_pct:      number;            // % con vegetación (bosque+arbusto+pasto+cultivo…)
  arbolado_pct: number;            // % bosque/arbolado
  agua_pct:     number;
  artificial_pct: number;
  suelo_pct:    number;            // suelo desnudo
  dominante:    string;            // clase dominante
  cn_hint:      string;            // nota sobre escorrentía/CN
  interpretacion: string[];
  anio:         number;
  fuente:       string;
}

interface RespCobertura {
  counts?: number[];
  clases?: number[];
  year?:   number;
  error?:  string;
}

/**
 * Las clases de WorldCover que un animal puede pastorear.
 *
 * Quedan afuera el manglar (95) y el musgo/liquen (100) aunque la clasificación
 * los cuente como vegetación. El liquen por un motivo medido: su biomasa en pie
 * puede ser cincuenta veces su crecimiento anual, así que tratarlo como forraje
 * es el error de contar el stock como si fuera el flujo. Ver `forrajeMedido.ts`.
 */
export const CLASES_PASTOREABLES = [10, 20, 30, 40] as const;

export interface BandaDeClase {
  clase_wc: number;
  kg_ms_ha_anio_min: number;
  kg_ms_ha_anio_max: number;
  /** Cuántos sitios medidos sostienen la banda. */
  sitios: number;
}

/**
 * La banda medida de una clase de cobertura, o `null` si no hay ni un sitio.
 *
 * Se deriva de `FORRAJE_MEDIDO` y no de una tabla: el mínimo de los mínimos y el
 * máximo de los máximos de los sitios que declararon esa `clase_wc`. Por eso se
 * corrige sola cuando entra una medición nueva, y hay un test que la compara
 * contra el arreglo para que las dos no puedan separarse.
 *
 * **Sólo entran las mediciones de secano**, y eso no es un detalle del filtro: un
 * píxel de WorldCover dice que hay un cultivo y **no dice si está fertilizado ni
 * si está regado**. Las dos únicas mediciones que acequia tiene de la clase 40
 * son una avena con 115 kg N/ha y una alfalfa con 1.300 mm de riego, que difieren
 * 3,04 veces entre sí por eso mismo; la segunda recibió más agua de riego que la
 * lluvia anual de cualquiera de los sitios de secano del archivo, cuyo techo es
 * el 1.119 mm del altiplano de Puno. Si entraran, cualquier
 * predio con un lote sembrado recibiría la oferta de una alfalfa bajo riego.
 */
export function bandaDeClase(clase_wc: number): BandaDeClase | null {
  const sitios = FORRAJE_MEDIDO.filter(m => m.clase_wc === clase_wc && m.insumos === 'secano');
  if (sitios.length === 0) return null;
  return {
    clase_wc,
    kg_ms_ha_anio_min: Math.min(...sitios.map(m => m.kg_ms_ha_anio_min)),
    kg_ms_ha_anio_max: Math.max(...sitios.map(m => m.kg_ms_ha_anio_max)),
    sitios: sitios.length,
  };
}

export interface ForrajeDeCobertura {
  kg_ms_ha_anio_min: number;
  kg_ms_ha_anio_max: number;
  /** % del predio sobre el que se calculó la banda. Es el denominador real. */
  pct_con_fuente: number;
  /** % del predio pastoreable que quedó afuera porque su clase no tiene medición. */
  pct_sin_fuente: number;
  /** Los nombres de esas clases, para poder decirlas en pantalla. */
  clases_sin_fuente: string[];
  /** Cuántos sitios medidos hay detrás de la banda. */
  sitios: number;
  advertencias: string[];
}

/**
 * Forraje por composición de cobertura, kg MS/ha·año — una banda, no un número.
 *
 * **Fuente: `forrajeMedido.ts`.** Acá no hay ningún coeficiente. Cada clase
 * aporta la banda de los sitios medidos que declararon esa `clase_wc`, y la
 * banda del predio es el promedio ponderado por el % de cada clase: el de los
 * mínimos y el de los máximos.
 *
 * **Lo que había acá hasta el 17/10/2026, y por qué se fue.** Cuatro pesos
 * —pastizal 3.500, arbustal 1.800, cultivo 4.500, arbolado 800— sin ninguna
 * fuente, promediados igual que ahora, y el resultado impreso como un entero con
 * separador de miles. Dos de los cuatro no tenían ni una medición detrás
 * (arbustal y cultivo; el cultivo tiene dos desde el lote 12 y ninguna sirve
 * para la banda, porque una está fertilizada y la otra regada) y los otros dos quedaron
 * contradichos por las mediciones que aparecieron entre el 10 y el 17 de
 * octubre: el arbolado va de 39 a 940 kg MS/ha·año según cuánta luz pase el
 * dosel y el pastizal de 350 a 10.630 según el sitio. Un entero en el medio de
 * eso no era una estimación, era una decoración.
 *
 * Y el 17/10 a la noche quedó medido adentro de un solo bosque: en el Manitou
 * Experimental Forest de Colorado, las once parcelas bajo dosel de ponderosa y
 * las tres aberturas del mismo bosque, cosechadas el mismo día con el mismo
 * método, dan 39-503 contra 521-658 kg MS/ha·año. Mismo suelo, misma lluvia,
 * mismo año: **un factor 13 que la clase de cobertura ve y el clima no.**
 *
 * **Unidades.** `pct` en porcentaje del predio; la banda en kilos de materia seca
 * por hectárea y por año. Es producción anual, no lo que está parado.
 *
 * **Rango de validez.** Veintidós sitios en cinco continentes es poco —y doce de
 * los veintidós son los que la banda puede usar—, y la clase de cobertura por sí
 * sola no determina el forraje: adentro de cada banda queda un
 * factor sin resolver, 24 en el arbolado y 30 en el pastizal. Lo que lo
 * resolvería es el dosel para el monte —`FRACCION_HERBACEA_DEL_SITIO` mide un
 * factor 236 entre sus cuatro puntos— y la lluvia para el pastizal, que es lo que
 * calcula `prodForrajera` en `produccion.ts`. Mientras eso no esté, una banda
 * ancha es la respuesta correcta y un número no lo es.
 *
 * **El arbustal sigue con un solo sitio, y el lote 14 encontró por qué cuesta
 * tanto.** Fue a buscar la clase 20 y trajo una estepa que la fuente describe
 * como arbustiva, con 12 % de cobertura de arbustos. El píxel de WorldCover ahí
 * dice pastizal: el arbustal es el 9,4 % a 500 m, el 6,5 % a 2 km y el 3,1 % a
 * 5 km. **Lo que un agrónomo llama estepa arbustiva, este mapa lo llama
 * pastizal**, así que la banda de la clase 20 no se llena buscando trabajos sobre
 * arbustos: se llena buscando sitios cuyo píxel sea 20. Es una propiedad del
 * mapa, no de la vegetación, y confundirlas es lo que mantuvo esta banda en un
 * solo sitio durante cinco lotes.
 *
 * **Y el lote 18 midió el techo de este método, con dos mediciones del mismo
 * día.** Los sitios ecológicos silty y overflow del CGREC están intercalados
 * adentro de los mismos doce potreros: **la misma coordenada, la misma clase 30 y
 * la misma estabilidad** —91 %, 85 % y 85 % de pastizal en las tres ventanas—, y
 * producen 2.501-3.410 contra 3.087-4.362 kg MS/ha·año. Un factor 1,3 que un
 * satélite de 10 m no puede ver porque los dos sitios son el mismo píxel.
 *
 * Y es peor que un factor: **responden al manejo con el signo al revés.** En las
 * lomadas el pastoreo liviano produce más que el fuerte (3.410 contra 2.637); en
 * los bajos, liviano, moderado y fuerte no se diferencian entre sí. La clase de
 * cobertura no distingue una lomada de un bajo, y lo que los separa es a dónde va
 * el agua de escurrimiento, que es justamente lo que acequia **sí** calcula con el
 * DEM. Es la pista más concreta que hay de por dónde tiene que entrar la mejora:
 * no por más clases de cobertura, sino por cruzar la clase con la posición en el
 * relieve.
 *
 * **El lote 16 le agregó la trampa inversa.** Si la clase es una propiedad del
 * mapa, lo coherente es buscar sitios cuyo píxel sea 20, y el lote 16 encontró
 * uno: la Estación Towoomba, con 66, 53 y 44 % de arbustal en las tres ventanas.
 * **Tampoco alimenta la banda**, porque la fuente dice que el ensayo desmontó
 * todas las leñosas en 1949 y la parcela medida tiene 58 m², menos que un píxel
 * de WorldCover. El píxel describe el bushveld de alrededor y no la parcela.
 *
 * Buscar por píxel sigue siendo la estrategia correcta, y ahora se sabe que hay
 * que preguntarle a la fuente qué le hicieron a la parcela antes de aceptarla.
 *
 * **Qué NO es.** No es por hectárea de predio: es por hectárea de las clases
 * pastoreables que tienen medición. Un predio mitad pastizal y mitad suelo
 * desnudo devuelve la banda del pastizal, y `pct_con_fuente` dice sobre qué parte
 * se calculó. Multiplicar la banda por las hectáreas del predio sin mirar ese
 * porcentaje sobreestima, y por eso el porcentaje sale en pantalla al lado.
 *
 * **Qué se rompe si cambia.** Lo muestra `CoberturaPanel` y nada más. No entra en
 * el cálculo de receptividad, que sale de la lluvia y se contrasta con el Miami
 * Model. Los dos números viven al lado a propósito, y el panel explica por qué
 * difieren.
 */
export function forrajePorCobertura(items: readonly ItemCobertura[]): ForrajeDeCobertura | null {
  let acumMin = 0;
  let acumMax = 0;
  let pctConFuente = 0;
  let pctSinFuente = 0;
  let sitios = 0;
  const clasesSinFuente: string[] = [];

  for (const clase of CLASES_PASTOREABLES) {
    const pct = items.filter(it => it.clase.valor === clase).reduce((acc, it) => acc + it.pct, 0);
    if (pct <= 0) continue;
    const banda = bandaDeClase(clase);
    if (banda === null) {
      pctSinFuente += pct;
      clasesSinFuente.push(CLASES_WC[clase]?.nombre ?? `Clase ${clase}`);
      continue;
    }
    acumMin += pct * banda.kg_ms_ha_anio_min;
    acumMax += pct * banda.kg_ms_ha_anio_max;
    pctConFuente += pct;
    sitios += banda.sitios;
  }

  // Sin una sola clase pastoreable medida no hay banda, y decirlo es la
  // respuesta. La versión anterior dividía por `Math.max(1, …)`, así que un
  // predio todo manglar imprimía «0 kg MS/ha·año» con toda confianza, y un
  // predio con menos de 1 % de clases pastoreables salía escalado hacia abajo
  // por el propio protector de la división.
  if (pctConFuente <= 0) return null;

  const redondearPct = (x: number) => Math.round(x * 10) / 10;
  const min = Math.round(acumMin / pctConFuente);
  const max = Math.round(acumMax / pctConFuente);
  const advertencias: string[] = [];

  if (pctSinFuente > 0) {
    advertencias.push(
      `${redondearPct(pctSinFuente)} % del predio es ${clasesSinFuente.join(' y ').toLowerCase()} y no hay ninguna medición de campo para esas clases: queda afuera de la banda.`,
    );
  }
  if (pctConFuente < 20) {
    advertencias.push(`La banda se calculó sobre el ${redondearPct(pctConFuente)} % del predio, así que dice poco del resto.`);
  }
  if (min > 0 && max / min >= 5) {
    advertencias.push(
      `La clase de cobertura sola no define el forraje: entre los sitios medidos de estas clases hay un factor ${Math.round(max / min)}. Lo que estrecha la banda es la lluvia, y el dosel cuando hay monte.`,
    );
  }

  return {
    kg_ms_ha_anio_min: min,
    kg_ms_ha_anio_max: max,
    pct_con_fuente: redondearPct(pctConFuente),
    pct_sin_fuente: redondearPct(pctSinFuente),
    clases_sin_fuente: clasesSinFuente,
    sitios,
    advertencias,
  };
}

export async function obtenerCobertura(mojones: Mojon[]): Promise<DatosCobertura> {
  const res = await fetch('/api/cobertura', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mojones: mojones.map(m => ({ lat: m.lat, lng: m.lng })) }),
    signal: AbortSignal.timeout(50_000),
  });
  const json = await res.json() as RespCobertura;
  if (json.error) throw new Error(json.error);
  if (!res.ok) throw new Error(`El servicio de cobertura respondió ${res.status}.`);

  const counts = json.counts ?? [];
  const clases = json.clases ?? [];
  const total = counts.reduce((s, c) => s + c, 0);
  if (total === 0) throw new Error('No se obtuvieron píxeles de cobertura para el predio.');

  const items: ItemCobertura[] = clases
    .map((v, i) => ({
      clase: CLASES_WC[v] ?? { valor: v, nombre: `Clase ${v}`, color: '#999', grupo: 'suelo' as const },
      pct: Math.round(((counts[i] ?? 0) / total) * 1000) / 10,
    }))
    .filter(it => it.pct > 0)
    .sort((a, b) => b.pct - a.pct);

  const pctDe = (pred: (c: ClaseCobertura) => boolean) =>
    Math.round(items.filter(it => pred(it.clase)).reduce((s, it) => s + it.pct, 0) * 10) / 10;

  const veg_pct        = pctDe(c => c.grupo === 'vegetacion');
  const arbolado_pct   = pctDe(c => c.valor === 10);
  const cultivo_pct    = pctDe(c => c.valor === 40);
  const agua_pct       = pctDe(c => c.grupo === 'agua');
  const artificial_pct = pctDe(c => c.grupo === 'artificial');
  const suelo_pct      = pctDe(c => c.valor === 60);
  const dominante      = items[0]?.clase.nombre ?? '—';

  // Nota de escorrentía/CN según impermeabilización y suelo desnudo.
  const cn_hint =
    artificial_pct + suelo_pct > 30 ? 'Alta proporción de suelo desnudo/impermeable: esperá más escorrentía (CN alto).'
    : arbolado_pct > 40 ? 'Buena cobertura arbórea: menor escorrentía y más infiltración (CN bajo).'
    : 'Cobertura mixta: escorrentía moderada.';

  const interpretacion: string[] = [];
  interpretacion.push(`Cobertura dominante: ${dominante} (${items[0]?.pct ?? 0} %).`);
  if (arbolado_pct >= 10) interpretacion.push(`${arbolado_pct} % de bosque/arbolado — valor para biodiversidad, sombra y captura de carbono.`);
  if (suelo_pct >= 15) interpretacion.push(`${suelo_pct} % de suelo desnudo/ralo: prioridad de restauración con cobertura vegetal.`);
  if (artificial_pct >= 10) interpretacion.push(`${artificial_pct} % construido/urbano dentro del polígono — revisá que el límite del predio sea correcto.`);
  if (cultivo_pct >= 20) interpretacion.push(`${cultivo_pct} % de cultivo: base para planificar rotaciones y riego por sector.`);
  if (interpretacion.length === 1) interpretacion.push('Predio mayormente natural. Usá el % de pastizal/arbusto para calibrar la carga de pastoreo.');

  return {
    items, veg_pct, arbolado_pct, agua_pct, artificial_pct, suelo_pct, dominante,
    cn_hint, interpretacion,
    anio: json.year ?? 2021,
    fuente: 'ESA WorldCover 10 m (2021) vía Microsoft Planetary Computer — orientativo',
  };
}

// Resumen para el informe.
export interface CoberturaResumen {
  dominante:    string;
  veg_pct:      number;
  arbolado_pct: number;
  suelo_pct:    number;
  artificial_pct: number;
  anio:         number;
  top: Array<{ nombre: string; pct: number }>;
}

export function resumirCobertura(d: DatosCobertura): CoberturaResumen {
  return {
    dominante: d.dominante, veg_pct: d.veg_pct, arbolado_pct: d.arbolado_pct,
    suelo_pct: d.suelo_pct, artificial_pct: d.artificial_pct, anio: d.anio,
    top: d.items.slice(0, 5).map(it => ({ nombre: it.clase.nombre, pct: it.pct })),
  };
}
