/**
 * El agua del predio, reunida de una sola vez.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * QUÉ PROBLEMA RESUELVE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * acequia calcula agua en cinco pestañas y ninguna sabe de las otras:
 *
 *   • **Captación** lleva una lista de consumos a mano —personas, bovinos,
 *     huerta, cultivo— con litros por día por unidad.
 *   • **Producción** lleva el rodeo real, por lotes y categorías, y su agua sale
 *     de la tabla publicada por temperatura (`aguaGanado.ts`).
 *   • **Riego** calcula la lámina mes a mes con la ETc del cultivo.
 *   • **Represas** dimensiona embalses con su volumen y su espejo.
 *   • **Red de servicios** dimensiona el caño que lleva el agua.
 *
 * Y el panel de Balance de agua pedía que se cargara todo otra vez, a mano.
 * Peor que el trabajo repetido es lo que pasa cuando alguien lo hace bien: si
 * Captación tiene «bovinos: 40» y el rodeo tiene 40 cabezas, sumar las dos
 * listas dimensiona la reserva para ochenta vacas. Nadie lo nota, porque el
 * número que sale es perfectamente plausible.
 *
 * Este módulo es la reconciliación: junta los aportes de todos lados, **decide
 * cuál manda cuando dos describen la misma agua** y deja escrito por qué el otro
 * quedó afuera.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * QUIÉN MANDA, Y POR QUÉ
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * No es una preferencia: en los dos casos gana el que mide más fino.
 *
 * **Hacienda → el rodeo.** `lib/rodeo.ts` existe exactamente para esto: la misma
 * hacienda se cargaba en dos lados y el agua se dimensionaba para 40 vacas
 * mientras el pasto se planificaba para 62. El rodeo tiene lotes por categoría
 * con su coeficiente de AACREA, y su consumo sale de la tabla por temperatura
 * —entre 4 y 32 °C el consumo se multiplica por 2,4—, no de un litraje fijo.
 * La fila de Captación es un promedio de esa misma tabla.
 *
 * **Riego → el panel de Riego.** La fila «huerta» de Captación son 2 L/m²/día,
 * que es un promedio anual grueso, y su propio `supuesto` ya lo dice: «la demanda
 * real es la evapotranspiración del cultivo menos la lluvia efectiva, que acequia
 * ya calcula mes a mes». Esto es esa frase cumplida.
 *
 * **Doméstico → Captación.** Es la única que lo tiene y está bien que sea ella.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * LA MEDIA NO SIRVE PARA UNA RACHA SECA
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * El panel de reserva simulaba el vaciado con **un** número de demanda: el
 * promedio anual. Pero una racha seca no cae en un mes cualquiera —cae en la
 * seca—, y ahí el riego está en su máximo y la hacienda toma un 140 % más que en
 * invierno. Dimensionar la autonomía con el promedio del año es dimensionarla
 * para un día que no es el que importa.
 *
 * Por eso cada aporte declara dos números: `l_dia` (el promedio del año, que es
 * lo que sirve para el balance anual) y `pico_l_dia` (el peor día, que es lo que
 * sirve para la racha).
 *
 * Los picos se **suman**, lo que supone que caen juntos. En el verano del
 * hemisferio sur eso es casi cierto —la ETc máxima y el calor del ganado son el
 * mismo mes— y errar por ese lado es el correcto cuando se dimensiona una
 * reserva. Queda declarado igual.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * LA RED NO ES UN CONSUMO
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * El caudal de la Red de servicios es un caudal de **diseño del caño**, en
 * L/min: no se suma a nada. Multiplicarlo por 1.440 minutos daría el agua que
 * pasaría si la canilla quedara abierta todo el día. Lo que sí aporta es un
 * cruce que ninguna de las dos pestañas podía hacer sola: si el caño, abierto
 * las 24 horas, no llega a mover la demanda del día pico, la reserva puede estar
 * llena y el agua no llega igual.
 */

import type { CaptacionSnapshot, ResultadoCaptacion, TipoConsumo } from './captacion';
import type { RedAguaResumen } from './hidraulica';
import type { RiegoResumen } from './riego';
import type { FichaRepresa } from './represasGuardadas';
import { demandaMensualPorTemperatura_m3, litrosDe, type Rodeo } from './rodeo';
import { nuevaFuenteDefault, type FuenteAgua } from './reservaPredio';

const DIAS_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;
const MESES_ABR = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'] as const;

// ═══════════════════════════════════════════════════════════════════════════
// 1 · LAS DEMANDAS
// ═══════════════════════════════════════════════════════════════════════════

/** Para qué es el agua. Dos aportes del mismo rubro describen la misma agua. */
export type RubroAgua = 'domestico' | 'ganaderia' | 'riego' | 'otro';

export type OrigenDemanda = 'captacion' | 'rodeo' | 'riego';

export const ROTULO_ORIGEN: Readonly<Record<OrigenDemanda, string>> = {
  captacion: 'Captación',
  rodeo:     'Producción · hacienda',
  riego:     'Riego',
};

/** Quién manda en cada rubro cuando hay dos. El porqué está en el encabezado. */
export const MANDA_EN: Readonly<Record<RubroAgua, OrigenDemanda>> = {
  domestico:  'captacion',
  ganaderia:  'rodeo',
  riego:      'riego',
  otro:       'captacion',
};

export interface AporteDemanda {
  id:     string;
  rubro:  RubroAgua;
  origen: OrigenDemanda;
  rotulo: string;
  /** Promedio del año, en litros por día. */
  l_dia:  number;
  /** El peor día del año, en litros por día. Nunca menor que `l_dia`. */
  pico_l_dia: number;
  /** Mes del pico (0 = enero), o `null` cuando el origen no lo reparte. */
  mes_pico: number | null;
  /** Doce valores en m³/mes, cuando el origen los tiene. */
  mensual_m3: number[] | null;
  /**
   * `null` significa que suma. Un texto significa que no suma, y es la razón:
   * otro origen ya describe esta misma agua con mejor dato.
   */
  descartado: string | null;
}

export interface DemandaUnificada {
  aportes:      AporteDemanda[];
  /** Los que suman, nada más. */
  total_l_dia:  number;
  pico_l_dia:   number;
  mes_pico:     number | null;
  /** Doce valores en m³/mes con todo lo que suma. */
  mensual_m3:   number[];
  anual_m3:     number;
  /** Cuántos aportes quedaron afuera por estar contados dos veces. */
  descartados:  number;
  advertencias: string[];
}

/** A qué rubro pertenece cada fila de consumo de Captación. */
export function rubroDeConsumo(tipo: TipoConsumo): RubroAgua {
  switch (tipo) {
    case 'domestico':         return 'domestico';
    case 'huerta':
    case 'cultivo_extensivo': return 'riego';
    case 'bovinos':
    case 'caprinos_ovinos':
    case 'porcinos':
    case 'aves':
    case 'equinos':           return 'ganaderia';
    default:                  return 'otro';
  }
}

/** El peor día que describe una serie mensual de m³, en litros por día. */
function picoDeMensual(mensual_m3: number[]): { l_dia: number; mes: number | null } {
  let mejor = 0, mes: number | null = null;
  for (let m = 0; m < 12; m++) {
    const l = ((mensual_m3[m] ?? 0) * 1000) / (DIAS_MES[m] ?? 30);
    if (l > mejor) { mejor = l; mes = m; }
  }
  return { l_dia: mejor, mes };
}

export interface EntradaDemandas {
  captacion?: CaptacionSnapshot | null;
  rodeo?:     Rodeo | null;
  /** Temperaturas medias mensuales del predio, para el agua de la hacienda. */
  tmean_c?:   number[] | null;
  riego?:     RiegoResumen | null;
}

/**
 * Junta todo lo que el predio consume, de todas las pestañas, sin contar dos
 * veces la misma agua.
 *
 * Devuelve siempre la lista completa —incluidos los aportes descartados, con su
 * motivo—, porque un número que desaparece sin explicación es peor que uno
 * repetido: el que lo cargó en Captación tiene que poder ver qué pasó con él.
 */
export function reunirDemandas(e: EntradaDemandas): DemandaUnificada {
  const aportes: AporteDemanda[] = [];
  const advertencias: string[] = [];

  // ── Captación: la lista cargada a mano ──
  const res: ResultadoCaptacion | null | undefined = e.captacion?.resultado;
  for (const c of res?.consumo_por_categoria ?? []) {
    if (!(c.litros_dia > 0)) continue;
    const mensual = Array.isArray(c.mensual_m3) && c.mensual_m3.length === 12 ? c.mensual_m3 : null;
    const pico = mensual ? picoDeMensual(mensual) : { l_dia: c.litros_dia, mes: null };
    aportes.push({
      id:     `captacion:${c.id}`,
      rubro:  rubroDeConsumo(c.tipo),
      origen: 'captacion',
      rotulo: c.nombre,
      l_dia:  c.litros_dia,
      pico_l_dia: Math.max(c.litros_dia, pico.l_dia),
      mes_pico:   pico.mes,
      mensual_m3: mensual,
      descartado: null,
    });
  }

  // ── El rodeo: lotes por categoría, con el agua por temperatura ──
  const rodeo = e.rodeo;
  const tmean = Array.isArray(e.tmean_c) && e.tmean_c.length === 12 ? e.tmean_c : null;
  if (rodeo) {
    const cabezas = rodeo.lotes.reduce((s, l) => s + Math.max(0, l.cabezas), 0);
    if (cabezas > 0) {
      const mensual = tmean ? demandaMensualPorTemperatura_m3(rodeo, tmean) : null;
      const anual_m3 = mensual ? mensual.reduce((s, v) => s + v, 0) : null;
      // Sin clima la tabla por temperatura no se puede evaluar y queda el
      // litraje declarado de cada categoría, que es lo que la app muestra
      // mientras el proyecto no tenga clima.
      const plano_l_dia = rodeo.lotes.reduce(
        (s, l) => s + Math.max(0, l.cabezas) * litrosDe(l), 0);
      const l_dia = anual_m3 !== null ? (anual_m3 * 1000) / 365 : plano_l_dia;
      const pico = mensual ? picoDeMensual(mensual) : { l_dia: plano_l_dia, mes: null };
      aportes.push({
        id:     'rodeo',
        rubro:  'ganaderia',
        origen: 'rodeo',
        rotulo: `Hacienda · ${cabezas} ${cabezas === 1 ? 'cabeza' : 'cabezas'}`,
        l_dia,
        pico_l_dia: Math.max(l_dia, pico.l_dia),
        mes_pico:   pico.mes,
        mensual_m3: mensual,
        descartado: null,
      });
      if (!tmean) {
        advertencias.push(
          'El agua de la hacienda está saliendo del litraje declarado de cada categoría y no de ' +
          'la tabla por temperatura, porque este proyecto todavía no tiene clima. Entre 4 y 32 °C ' +
          'el consumo de un bovino se multiplica por 2,4: sin clima, el número de verano queda corto.',
        );
      }
    }
  }

  // ── Riego: la lámina mes a mes del cultivo ──
  const riego = e.riego;
  if (riego && riego.volumen_anual_m3 > 0) {
    const l_dia = (riego.volumen_anual_m3 * 1000) / 365;
    // El pico es la lámina neta del mes de más demanda sobre la superficie
    // regada: 1 mm sobre 1 ha son 10 m³, o sea 10.000 L.
    const pico_l_dia = Math.max(l_dia, riego.neto_pico_mm_dia * riego.area_ha * 10_000);
    aportes.push({
      id:     'riego',
      rubro:  'riego',
      origen: 'riego',
      rotulo: `Riego · ${riego.cultivo}, ${riego.area_ha.toLocaleString('es-AR', { maximumFractionDigits: 2 })} ha`,
      l_dia,
      pico_l_dia,
      mes_pico:   null,
      mensual_m3: null,
      descartado: null,
    });
  }

  // ── La reconciliación ──
  for (const a of aportes) {
    const manda = MANDA_EN[a.rubro];
    if (a.origen === manda) continue;
    const dueno = aportes.find(x => x.rubro === a.rubro && x.origen === manda && x.l_dia > 0);
    if (!dueno) continue;
    a.descartado =
      a.rubro === 'ganaderia'
        ? `Ya está contada en «${dueno.rotulo}», que sale del rodeo cargado en Producción: lotes ` +
          'por categoría y agua por temperatura, en vez de un litraje fijo por cabeza.'
        : `Ya está contada en «${dueno.rotulo}», que sale de la ETc del cultivo mes a mes en vez ` +
          'de un promedio anual.';
  }

  const suman = aportes.filter(a => a.descartado === null);
  const total_l_dia = suman.reduce((s, a) => s + a.l_dia, 0);
  const pico_l_dia  = suman.reduce((s, a) => s + a.pico_l_dia, 0);

  const mensual_m3 = new Array<number>(12).fill(0);
  for (const a of suman) {
    for (let m = 0; m < 12; m++) {
      mensual_m3[m] = (mensual_m3[m] ?? 0) + (a.mensual_m3
        ? (a.mensual_m3[m] ?? 0)
        : (a.l_dia * (DIAS_MES[m] ?? 30)) / 1000);
    }
  }

  const mesesConPico = suman.map(a => a.mes_pico).filter((m): m is number => m !== null);
  const mes_pico = mesesConPico.length > 0 ? picoDeMensual(mensual_m3).mes : null;

  const descartados = aportes.length - suman.length;
  if (descartados > 0) {
    advertencias.push(
      `${descartados === 1 ? 'Un consumo cargado' : `${descartados} consumos cargados`} en Captación ` +
      `${descartados === 1 ? 'describe' : 'describen'} agua que otra pestaña ya calcula mejor, así ` +
      `que ${descartados === 1 ? 'no suma' : 'no suman'} dos veces. ` +
      'Abajo está cuál y por qué.',
    );
  }

  if (pico_l_dia > total_l_dia * 1.05 && total_l_dia > 0) {
    advertencias.push(
      `El día de más demanda pide ${Math.round(pico_l_dia).toLocaleString('es-AR')} L contra los ` +
      `${Math.round(total_l_dia).toLocaleString('es-AR')} L del promedio del año. La racha seca se ` +
      'simula con el pico, porque una racha seca no cae en un mes cualquiera: cae en la seca, que ' +
      'es cuando el riego está al máximo y la hacienda toma más. Los picos se suman como si cayeran ' +
      'juntos, que en verano es casi cierto y es el lado correcto para dimensionar una reserva.',
    );
  }

  return {
    aportes,
    total_l_dia,
    pico_l_dia,
    mes_pico,
    mensual_m3: mensual_m3.map(v => Math.round(v * 10) / 10),
    anual_m3:   Math.round(mensual_m3.reduce((s, v) => s + v, 0)),
    descartados,
    advertencias,
  };
}

/** El nombre del mes de un índice 0-11, para imprimir. */
export function mesAbr(m: number | null): string | null {
  return m === null ? null : MESES_ABR[m] ?? null;
}

// ═══════════════════════════════════════════════════════════════════════════
// 2 · LA RED NO ES UN CONSUMO, PERO PUEDE SER EL CUELLO
// ═══════════════════════════════════════════════════════════════════════════

export interface ContrasteRed {
  caudal_l_min:    number;
  /** Lo máximo que el caño puede mover en un día, abierto las 24 horas. */
  techo_l_dia:     number;
  demanda_l_dia:   number;
  /** `true` cuando el caño no llega a mover la demanda del día pico. */
  estrangula:      boolean;
  /** Horas por día que el caño tendría que correr para cubrir la demanda. */
  horas_necesarias: number;
  lectura:         string;
}

/**
 * Pasa a L/min el caudal que la Red de servicios imprime como etiqueta.
 *
 * Devuelve `null` cuando no se puede leer, que es una respuesta y no un error:
 * inventar una unidad acá cambiaría el veredicto por un factor 60.
 */
export function caudalALMin(etiqueta: string | null | undefined): number | null {
  if (!etiqueta) return null;
  const txt = etiqueta.toLowerCase().replace(',', '.');
  const n = Number(/(-?\d+(?:\.\d+)?)/.exec(txt)?.[1]);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (txt.includes('m³/h') || txt.includes('m3/h')) return (n * 1000) / 60;
  if (txt.includes('m³/d') || txt.includes('m3/d')) return (n * 1000) / 1440;
  if (/l\s*\/\s*s/.test(txt)) return n * 60;
  if (/l\s*\/\s*h/.test(txt)) return n / 60;
  if (/l\s*\/\s*(min|m)\b/.test(txt)) return n;
  return null;
}

/**
 * ¿Alcanza el caño? Un cruce que ninguna de las dos pestañas podía hacer sola.
 *
 * La reserva puede estar llena y el agua no llegar igual: si el caudal de diseño
 * del caño, corriendo las 24 horas, no alcanza la demanda del día pico, el
 * cuello de botella no es el agua sino la conducción.
 */
export function contrastarRed(
  red: RedAguaResumen | null | undefined,
  demanda_l_dia: number,
): ContrasteRed | null {
  const caudal = caudalALMin(red?.caudal);
  if (caudal === null || !(demanda_l_dia > 0)) return null;

  const techo = caudal * 1440;
  const horas = demanda_l_dia / (caudal * 60);
  const estrangula = techo < demanda_l_dia;

  return {
    caudal_l_min:  Math.round(caudal * 10) / 10,
    techo_l_dia:   Math.round(techo),
    demanda_l_dia: Math.round(demanda_l_dia),
    estrangula,
    horas_necesarias: Math.round(horas * 10) / 10,
    lectura: estrangula
      ? `La traza está dimensionada para ${Math.round(caudal * 10) / 10} L/min. Abierta las 24 h ` +
        `mueve ${Math.round(techo).toLocaleString('es-AR')} L y el día pico pide ` +
        `${Math.round(demanda_l_dia).toLocaleString('es-AR')}: el cuello no es el agua, es el caño.`
      : `Con ${Math.round(caudal * 10) / 10} L/min, el caño cubre el día pico en ` +
        `${(Math.round(horas * 10) / 10).toLocaleString('es-AR')} h de bombeo.`,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 3 · LAS FUENTES QUE EL PREDIO YA TIENE DISEÑADAS
// ═══════════════════════════════════════════════════════════════════════════

export interface FuenteSugerida {
  /** Ya listo para entrar al inventario del panel. */
  fuente: FuenteAgua;
  /** De dónde salió, para decirlo en pantalla. */
  de:     string;
}

export interface FuentesDelPredio {
  sugeridas:  FuenteSugerida[];
  /** Represas marcadas en el plano que todavía no tienen volumen calculado. */
  sin_dimensionar: number;
  advertencias: string[];
}

export interface EntradaFuentes {
  /** Las represas archivadas del proyecto, con su ficha. */
  represas?: ReadonlyArray<{ id: string; nombre: string; ficha: FichaRepresa }> | null;
  /** Los elementos del plano. Sólo se cuentan: no traen volumen. */
  aguadas?:  ReadonlyArray<{ tipo: string }> | null;
  /** Lo que ya está en el inventario, para no ofrecer dos veces lo mismo. */
  yaCargadas?: ReadonlyArray<FuenteAgua> | null;
}

/**
 * Las represas ya diseñadas, listas para entrar al inventario del balance.
 *
 * Las aguadas del plano se **cuentan y no se convierten**: `ElementoAguada` es
 * un marcador con nombre y posición, sin volumen ni espejo. Darle un volumen por
 * defecto sería exactamente lo que este repositorio no hace — un número
 * plausible y sin medir, que después dimensiona la autonomía del predio.
 */
export function reunirFuentes(e: EntradaFuentes): FuentesDelPredio {
  const sugeridas: FuenteSugerida[] = [];
  const advertencias: string[] = [];
  const nombresCargados = new Set((e.yaCargadas ?? []).map(f => f.nombre.trim().toLowerCase()));

  for (const r of e.represas ?? []) {
    if (!(r.ficha.capacidad_m3 > 0)) continue;
    if (nombresCargados.has(r.nombre.trim().toLowerCase())) continue;
    const base = nuevaFuenteDefault('represa');
    sugeridas.push({
      fuente: {
        ...base,
        id:         `represa_${r.id}`,
        nombre:     r.nombre,
        volumen_m3: Math.round(r.ficha.capacidad_m3),
        espejo_m2:  Math.round(r.ficha.area_espejo_m2),
      },
      de: `Represas · ${r.ficha.prof_max_m.toLocaleString('es-AR', { maximumFractionDigits: 1 })} m de profundidad máxima`,
    });
  }

  const sin_dimensionar = (e.aguadas ?? []).filter(a => a.tipo === 'represa').length;
  if (sin_dimensionar > 0) {
    advertencias.push(
      `Hay ${sin_dimensionar} ${sin_dimensionar === 1 ? 'represa marcada' : 'represas marcadas'} en el ` +
      `plano sin dimensionar. Un marcador no tiene volumen ni espejo, así que no ${
        sin_dimensionar === 1 ? 'entra' : 'entran'} acá: ${sin_dimensionar === 1 ? 'pasala' : 'pasalas'} ` +
      'por Represas y el volumen aparece solo.',
    );
  }

  return { sugeridas, sin_dimensionar, advertencias };
}
