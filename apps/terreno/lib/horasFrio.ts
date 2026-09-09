/**
 * Horas de frío invernal: el requisito que decide si un frutal de hoja caduca
 * cuaja en un lugar, y que la app venía nombrando sin calcular.
 *
 * Vive aparte de `calendario.ts` porque lo necesitan los dos lados: el
 * calendario para mostrarlo y `especies.ts` para evaluar el caduco. Si viviera
 * en cualquiera de los dos, el import sería circular.
 */
import type { MesDato } from './clima';

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

// ─── Horas de frío ────────────────────────────────────────────────────────────
//
// El frutal de hoja caduca no fructifica porque haga calor en verano: necesita
// haber pasado suficientes horas frías en invierno para salir de la dormancia.
// Sin ese frío la yema no abre pareja, la floración se estira, y el árbol vive
// pero no cuaja. Es la restricción que decide si un manzano tiene sentido en un
// lugar, y la app la venía nombrando —en el bioma global, en el catálogo de
// especies, en el aviso de clima futuro— sin calcularla en ningún lado.
//
// Modelo: horas de frío clásicas (Weinberger), la banda de 0 a 7,2 °C. Es el
// modelo en el que están publicados los requerimientos de casi todo el frutal
// caduco, que es la razón para usarlo: sirve para comparar contra un número que
// alguien más midió. El piso en 0 °C importa —abajo de cero el tejido está
// congelado y no acumula—, si no Siberia informaría un invierno ideal.
//
// De medias mensuales a horas: se modela el día como una sinusoide entre la
// mínima y la máxima media del mes. La fracción del día por debajo de un umbral
// X sale de invertir esa curva. Es una aproximación, no una medición: con datos
// horarios reales daría distinto, y por eso el resultado se muestra como banda y
// no como cifra exacta.

/** Umbral superior del modelo clásico de horas de frío (°C). */
export const UMBRAL_FRIO_C = 7.2;

/**
 * Fracción del día (0–1) con temperatura por debajo de `umbral`, modelando el
 * día como una sinusoide entre `tmin` y `tmax`.
 */
function fraccionDiaBajo(tmin: number, tmax: number, umbral: number): number {
  const media = (tmax + tmin) / 2;
  const amp   = (tmax - tmin) / 2;
  if (amp <= 0) return umbral > media ? 1 : 0;
  const k = (umbral - media) / amp;
  if (k >= 1)  return 1;
  if (k <= -1) return 0;
  return 0.5 + Math.asin(k) / Math.PI;
}

export type BandaFrio = 'nulo' | 'bajo' | 'medio' | 'alto';

export const LABEL_BANDA_FRIO: Record<BandaFrio, string> = {
  nulo:  'Sin frío invernal útil',
  bajo:  'Frío bajo',
  medio: 'Frío medio',
  alto:  'Frío alto',
};

export interface HorasFrio {
  /** Horas de frío estimadas de cada mes, en orden de enero a diciembre. */
  por_mes: number[];
  /** Total acumulado en la ventana de dormancia. */
  total: number;
  /** Los seis meses consecutivos que más frío acumulan: el invierno del predio,
   *  encontrado por los datos y no por el hemisferio. */
  ventana: { inicio: number; fin: number };
  banda: BandaFrio;
  /** Qué se puede plantar con ese frío, en una línea. */
  lectura: string;
}

export function calcularHorasFrio(meses: MesDato[]): HorasFrio | null {
  if (meses.length < 12) return null;

  const por_mes = meses.map((m, i) => {
    const dias = DAYS_IN_MONTH[i] ?? 30;
    const bajoUmbral = fraccionDiaBajo(m.tmin_c, m.tmax_c, UMBRAL_FRIO_C);
    const bajoCero   = fraccionDiaBajo(m.tmin_c, m.tmax_c, 0);
    return Math.round(Math.max(0, bajoUmbral - bajoCero) * 24 * dias);
  });

  // Ventana de dormancia: los seis meses consecutivos de mayor acumulación.
  // Circular, así que sirve igual en los dos hemisferios sin preguntar dónde
  // está el predio.
  let inicio = 0, total = -1;
  for (let i = 0; i < 12; i++) {
    let suma = 0;
    for (let k = 0; k < 6; k++) suma += por_mes[(i + k) % 12] ?? 0;
    if (suma > total) { total = suma; inicio = i; }
  }

  const banda: BandaFrio =
    total < 100 ? 'nulo'  :
    total < 400 ? 'bajo'  :
    total < 800 ? 'medio' : 'alto';

  const lectura =
    banda === 'nulo'  ? 'Acá el frutal de hoja caduca no cuaja. La fruta viene de perennes de clima cálido, no de manzano ni de cerezo.'
    : banda === 'bajo'  ? 'Alcanza para higuera, granado y vid, y para las variedades de bajo requerimiento de durazno y almendro. Manzano y cerezo de variedad común no van a cuajar parejo.'
    : banda === 'medio' ? 'Entra casi todo el carozo y el pecán. Manzano, cerezo y avellano piden variedades elegidas por requerimiento, no cualquiera.'
    : 'Frío de sobra para todo el caduco, incluido manzano, cerezo, avellano y pistacho. Acá el límite lo pone la helada tardía sobre la flor, no el frío del invierno.';

  return { por_mes, total, ventana: { inicio, fin: (inicio + 5) % 12 }, banda, lectura };
}
