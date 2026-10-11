/**
 * La calibración de precipitación aplicada a la **serie diaria**.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * POR QUÉ EXISTE ESTE ARCHIVO
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * acequia tiene dos lluvias del mismo predio y las dos se usan para calcular:
 *
 *   • la **climatología mensual** (NASA POWER, calibrada con CHIRPS) alimenta
 *     aridez, receptividad, escorrentía, captación, módulos de pastoreo y los
 *     umbrales de bioconstrucción;
 *   • la **serie diaria** (ERA5 vía Open-Meteo) alimenta el balance hídrico, el
 *     período de crecimiento, las rachas secas y la tormenta de diseño.
 *
 * Cuando alguien carga el total anual de un pluviómetro, `aplicarCalibracionPrecip`
 * corregía **sólo la climatología**. La serie diaria seguía con el número del
 * reanálisis, así que la mitad de la app quedaba calibrada y la otra mitad no, y
 * la discrepancia que `contrastarPrecip` declara no se cerraba nunca por más dato
 * local que se cargara. Esto la cierra.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * EL MÉTODO, Y DÓNDE DEJA DE VALER
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * **Escalado lineal** (*linear scaling*): cada valor de lluvia se multiplica por
 * el cociente entre el total observado y el total simulado del mismo período. Es
 * el más viejo y el más simple de los métodos de corrección de sesgo, y está
 * revisado y evaluado contra otros cinco en:
 *
 *   Teutschbein, C. & Seibert, J. (2012). «Bias correction of regional climate
 *   model simulations for hydrological climate-change impact studies: Review and
 *   evaluation of different methods». *Journal of Hydrology* 456-457, 12-29.
 *
 * Lo que ese trabajo dice, y es exactamente el rango de validez de este archivo:
 * el escalado lineal **corrige la media de forma perfecta por construcción y no
 * corrige la distribución**. Preserva el coeficiente de variación, así que no
 * sabe nada de los extremos: para eso hace falta mapeo de cuantiles, que pide la
 * distribución diaria observada —treinta años de planilla de estación— y no un
 * número.
 *
 * De ahí sale la regla de este archivo, que es la parte importante:
 *
 *   SE CALIBRA lo que es una **acumulación**: la serie dekadal con la que corre
 *   el balance hídrico y los totales anuales.
 *
 *   NO SE CALIBRA lo que es un **extremo**: la tormenta de diseño. Multiplicar
 *   el cuantil de Gumbel por el mismo factor que la media es afirmar que el
 *   sesgo del reanálisis es proporcional en toda la distribución, y eso es
 *   justamente lo que la fuente dice que el método no puede sostener. Con esa
 *   tormenta se dimensionan vertederos y alcantarillas.
 *
 *   NO SE MUEVE la racha seca, y no por una decisión sino por aritmética:
 *   multiplicar los milímetros de cada día no convierte ningún día seco en
 *   húmedo ni al revés. La racha es invariante ante el escalado lineal. Si el
 *   sesgo del reanálisis está en la **frecuencia** de días con lluvia —llueve
 *   poquito todos los días donde en realidad llueve mucho tres veces—, el
 *   escalado no lo toca y la racha sigue equivocada. Queda declarado.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * EL FACTOR NO ES EL MISMO QUE EL DE LA CLIMATOLOGÍA
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Y esto es lo que hace falta mirar dos veces. El pluviómetro dice «acá llueven
 * 700 mm». La climatología dice 595 y la serie diaria dice 943. El objetivo es
 * uno solo —700— pero los factores son dos: 700/595 = 1,18 para una y 700/943 =
 * 0,74 para la otra. Usar el factor de la climatología sobre la serie la dejaría
 * en 1.113 mm, más lejos del pluviómetro que antes de calibrar.
 *
 * Por eso este archivo calcula su propio factor contra la media de **esta** serie
 * y no recibe el de `aplicarCalibracionPrecip`.
 */

import type { CalibracionPrecip } from './clima';
import type { CalibracionSerie, Extremos, SerieDekadalPorAnio } from './climaExtremos';

/** Afuera de esta banda un solo factor ya no describe el sesgo. */
export const FACTOR_MIN = 0.5;
export const FACTOR_MAX = 2;

/** Por debajo de esto la corrección no cambia ninguna decisión. */
const FACTOR_NEUTRO = 0.02;

export const FUENTE_ESCALADO_LINEAL =
  'Teutschbein, C. & Seibert, J. (2012). Bias correction of regional climate model ' +
  'simulations for hydrological climate-change impact studies: Review and evaluation ' +
  'of different methods. Journal of Hydrology 456-457, 12-29.';

const r1 =(v: number) => Math.round(v * 10) / 10;
const pct = (v: number) => Math.round(Math.abs(v) * 100);

/**
 * La media mensual de la serie, en mm, derivada de la dekadal: tres décadas
 * tilean exactamente un mes, así que la suma de tres es el mes y el promedio
 * entre años es la climatología de **esta** serie.
 *
 * Devuelve `null` si no hay dekadal —un `Extremos` guardado antes del 05/10/2026
 * no la trae— y entonces no hay forma de repartir la calibración por mes.
 */
export function mediaMensualDeSerie(dek: SerieDekadalPorAnio | undefined): number[] | null {
  if (!dek || dek.precip.length === 0) return null;
  const suma = new Array<number>(12).fill(0);
  let anios = 0;
  for (const fila of dek.precip) {
    if (!fila || fila.length !== 36) continue;
    anios++;
    for (let d = 0; d < 36; d++) {
      const m = Math.floor(d / 3);
      suma[m] = (suma[m] ?? 0) + (fila[d] ?? 0);
    }
  }
  if (anios === 0) return null;
  return suma.map(s => s / anios);
}

/**
 * El total anual que persigue una calibración, sea cual sea su modo.
 *
 * Un `CalibracionPrecip` en modo mensual trae los doce valores y ninguno anual;
 * el total es la suma. Devuelve `null` cuando la calibración no define ningún
 * objetivo utilizable, que es el caso de no calibrar.
 */
export function objetivoAnual(cal: CalibracionPrecip | null | undefined): number | null {
  if (!cal) return null;
  if (cal.modo === 'mensual' && cal.mensual_mm?.length === 12) {
    const t = cal.mensual_mm.reduce((s, v) => s + Math.max(0, v || 0), 0);
    return t > 0 ? t : null;
  }
  if (cal.modo === 'anual' && cal.anual_mm && cal.anual_mm > 0) return cal.anual_mm;
  return null;
}

/**
 * Devuelve una copia de los extremos con la lluvia escalada al dato local.
 *
 * Aplicar SIEMPRE sobre los extremos crudos. Encadenar sobre un resultado ya
 * calibrado multiplicaría el factor de nuevo, y el resultado seguiría pareciendo
 * razonable —que es exactamente el modo en que acequia falla—. Por eso además se
 * devuelve intacto lo que ya trae `calibracion_serie`.
 *
 * Qué toca y qué no está arriba, en el encabezado del archivo. En una línea: las
 * acumulaciones sí, los extremos no.
 */
export function calibrarExtremos(
  ex:  Extremos | null,
  cal: CalibracionPrecip | null | undefined,
): Extremos | null {
  if (!ex) return ex;
  if (ex.calibracion_serie) return ex;

  const objetivo = objetivoAnual(cal);
  if (objetivo === null || !cal) return ex;

  const antes = ex.precip_anual.media_mm;
  if (!Number.isFinite(antes) || antes <= 0) return ex;

  const factor_anual = objetivo / antes;
  if (!Number.isFinite(factor_anual) || factor_anual <= 0) return ex;

  // ── Los doce factores ──
  // Con calibración mensual el factor es de cada mes contra el mismo mes de ESTA
  // serie, que es lo que arregla el caso que más importa: un reanálisis puede
  // acertar el total del año y repartirlo mal entre estación seca y húmeda, y un
  // factor único no vería ese error.
  const mediaMes = mediaMensualDeSerie(ex.dekadal);
  let factor_mes = new Array<number>(12).fill(factor_anual);
  let modo: 'anual' | 'mensual' = 'anual';
  const advertencias: string[] = [];

  if (cal.modo === 'mensual' && cal.mensual_mm?.length === 12 && mediaMes) {
    const fs: number[] = [];
    let mesesSinDato = 0;
    for (let m = 0; m < 12; m++) {
      const serie = mediaMes[m] ?? 0;
      const obj   = Math.max(0, cal.mensual_mm[m] ?? 0);
      // Un mes que la serie da en cero no tiene cociente: ahí el escalado no
      // puede inventar lluvia donde el modelo no puso ninguna, y el factor del
      // año es lo menos malo.
      if (serie <= 0.1) { fs.push(factor_anual); mesesSinDato++; continue; }
      fs.push(obj / serie);
    }
    factor_mes = fs;
    modo = 'mensual';
    if (mesesSinDato > 0) {
      advertencias.push(
        `${mesesSinDato === 1 ? 'Un mes' : `${mesesSinDato} meses`} de la serie ${
          mesesSinDato === 1 ? 'viene' : 'vienen'
        } prácticamente en cero, así que ahí no hay cociente que calcular y se ` +
        'aplicó el factor del año. El escalado reparte la lluvia que el modelo ya ' +
        'puso: no la crea en un mes donde no puso ninguna.',
      );
    }
  }

  // Una corrección del 1 % no cambia ninguna decisión y sí ensucia la pantalla
  // con un aviso, así que ahí se deja la serie como está. Se mira mes por mes y
  // no sobre el total: una calibración mensual puede dejar el año en el mismo
  // número y correr la estación seca dos meses, que es el caso en que más falta
  // hace —y mirando sólo el anual se descartaría por «neutra».
  if (factor_mes.every(f => Math.abs(f - 1) < FACTOR_NEUTRO)) return ex;

  const despues_mm = Math.round(antes * factor_anual);

  // ── Lo que el método no corrige, dicho siempre ──
  advertencias.push(
    'La tormenta de diseño no se calibró: sigue saliendo de la serie cruda. ' +
    'El escalado lineal corrige la media por construcción y no corrige la ' +
    'distribución: multiplicar el cuantil de Gumbel por el mismo factor sería ' +
    'afirmar que el sesgo del reanálisis es proporcional en toda la distribución, ' +
    'y para eso hace falta mapeo de cuantiles, que pide la serie diaria de la ' +
    'estación y no un total. Con esa tormenta se dimensionan vertederos y ' +
    'alcantarillas.',
  );
  advertencias.push(
    'La racha seca tampoco se movió, y no por una decisión: multiplicar los ' +
    'milímetros de cada día no vuelve húmedo ningún día seco. Si el sesgo está en ' +
    'cuántos días llueve y no en cuánto, el escalado no lo ve.',
  );

  if (Math.abs(factor_anual - 1) < FACTOR_NEUTRO) {
    // El total del año no se movió: lo que se corrigió es el reparto entre
    // meses. La tormenta no queda ni corta ni larga, así que no hay lado del
    // que convenga equivocarse y decir que lo hay sería ruido.
    advertencias.push(
      'El total del año quedó donde estaba: lo que esta calibración corrigió es ' +
      'en qué meses llueve. El balance hídrico y el período de crecimiento sí ' +
      'cambian —son mes a mes—; los totales anuales, no.',
    );
  } else if (factor_anual > 1) {
    advertencias.push(
      `El dato local es un ${pct(factor_anual - 1)} % más lluvioso que la serie, así ` +
      'que la tormenta de diseño sin calibrar queda del lado corto. Para ' +
      'dimensionar lo que tiene que aguantar el agua conviene equivocarse para ' +
      'arriba: tomar el período de retorno siguiente es la forma barata de ' +
      'cubrirlo mientras no haya una serie diaria de estación.',
    );
  } else {
    advertencias.push(
      `El dato local es un ${pct(1 - factor_anual)} % menos lluvioso que la serie, así ` +
      'que la tormenta de diseño sin calibrar queda del lado prudente para ' +
      'vertederos y alcantarillas. Para lo contrario —saber si el agua alcanza— el ' +
      'que manda es el total calibrado, y ese ya está aplicado.',
    );
  }

  if (factor_anual < FACTOR_MIN || factor_anual > FACTOR_MAX) {
    advertencias.push(
      `El factor es ${factor_anual.toLocaleString('es-AR', { maximumFractionDigits: 2 })}×, ` +
      `fuera de la banda ${FACTOR_MIN}–${FACTOR_MAX}× en la que un solo número describe ` +
      'el sesgo de una grilla. Una diferencia así no suele ser un sesgo: suele ser ' +
      'que la estación y el predio no están en el mismo régimen —otra ladera, otra ' +
      'altura, otro lado de la cuenca—. Vale la pena revisar de dónde salió el dato ' +
      'antes de apoyar una obra en esto.',
    );
  }

  const calibracion_serie: CalibracionSerie = {
    factor_anual: Math.round(factor_anual * 1000) / 1000,
    factor_mes:   factor_mes.map(f => Math.round(f * 1000) / 1000),
    antes_mm:     Math.round(antes),
    despues_mm,
    objetivo_mm:  Math.round(objetivo),
    modo,
    fuente:       cal.fuente,
    advertencias,
  };

  const dekadal: SerieDekadalPorAnio | undefined = ex.dekadal
    ? {
        ...ex.dekadal,
        precip: ex.dekadal.precip.map(fila =>
          fila.map((v, d) => r1(v * (factor_mes[Math.floor(d / 3)] ?? factor_anual)))),
      }
    : undefined;

  return {
    ...ex,
    // El CV se preserva exactamente bajo escalado uniforme —media y desvío se
    // multiplican por lo mismo— y queda casi igual con factores mensuales. No se
    // recalcula para no inventar una precisión que el método no tiene.
    precip_anual: {
      ...ex.precip_anual,
      media_mm: despues_mm,
      min_mm:   Math.round(ex.precip_anual.min_mm * factor_anual),
      max_mm:   Math.round(ex.precip_anual.max_mm * factor_anual),
    },
    dekadal,
    calibracion_serie,
    fuente: `${ex.fuente} · lluvia escalada a ${Math.round(objetivo)} mm/año${
      cal.fuente ? ` (${cal.fuente})` : ''}`,
  };
}
