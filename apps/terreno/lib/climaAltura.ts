/**
 * Corrección de la temperatura por la diferencia de altura entre el predio y la
 * celda de la que sale el dato climático.
 *
 * ── Por qué existe, que es un caso de libro de este proyecto ─────────────────
 *
 * NASA POWER entrega la climatología en una grilla de ~50 km (0,5°). En llanura
 * eso no molesta. En montaña la celda promedia el valle con la cumbre, y el dato
 * que devuelve corresponde a la altura media de la celda, que puede estar a un
 * kilómetro del predio.
 *
 * Medido el 28/09/2026 sobre Armenia (Quindío, Colombia), capital cafetera a
 * 1.483 m: POWER le asigna a la celda **2.266,93 m** —784 m de más— y devuelve
 * una media anual de **15,1 °C** donde la real anda en 20 y algo. Con esos
 * 15,1 °C, el café arábigo —que pide entre 18 y 22 °C de media anual— salía
 * marcado como no viable en la región cafetera más documentada del continente.
 * Filandia, a 20 km y 400 m más arriba, devolvía **exactamente los mismos
 * números**: es la misma celda.
 *
 * Nada se rompió: la app no tiró ninguna excepción y todos los números salieron
 * plausibles. Es el modo de fallar del que habla `lib/README.md`.
 *
 * ── El dato para arreglarlo ya venía en la respuesta ─────────────────────────
 *
 * POWER informa la altura que le asigna a la celda en
 * `geometry.coordinates[2]`, y el proxy de `/api/clima` pasa el JSON crudo tal
 * cual: el número ya llegaba al cliente y se descartaba. No hay que pedir nada
 * nuevo a nadie.
 *
 * ── El método, y hasta dónde vale ───────────────────────────────────────────
 *
 * Se corrige con un gradiente térmico vertical constante:
 *
 *     ΔT = (altura_celda − altura_predio) / 1000 × GRADIENTE_TERMICO_C_KM
 *
 * Si el predio está **más abajo** que la celda, la corrección es **positiva**
 * (hace más calor). Unidades: metros entra, °C sale.
 *
 * El valor de 6,5 °C/km es el de la atmósfera estándar. **No es una constante
 * de la naturaleza**: es un promedio. El gradiente real de la temperatura del
 * aire en superficie varía con la humedad, la estación y la exposición de la
 * ladera, y queda acotado entre el adiabático saturado —del orden de 5 °C/km,
 * aire húmedo— y el adiabático seco, 9,8 °C/km. En los 784 m de Armenia, esa
 * horquilla da entre 3,9 y 7,7 °C de corrección contra los 5,1 que aplicamos:
 * una incertidumbre de ±2 °C sobre un error de 5,1 °C que, sin corregir, se
 * arrastra entero. Corregir con el promedio es peor que medir en el predio y
 * mucho mejor que no corregir, y eso es exactamente lo que la pantalla dice.
 *
 * **Lo que NO se corrige, y no es un olvido:**
 *
 * - **La precipitación.** También cambia con la altura, pero no con un gradiente:
 *   depende de la ladera de barlovento, de la orientación y del régimen, y no
 *   hay un número global que se pueda aplicar. Para eso está la calibración por
 *   CHIRPS (~5 km) y la manual, en `lib/clima.ts`.
 * - **El viento, la radiación y la humedad relativa.** Misma razón: no tienen un
 *   gradiente vertical universal.
 * - **La clase Köppen del mapa de Beck.** Ese mapa es de 1 km y ya resuelve la
 *   altura por su cuenta: corregirlo sería corregir dos veces. Lo que sí se
 *   recalcula es el Köppen *calculado* de las medias, porque deriva de ellas.
 *
 * ── Qué se rompe si esto cambia ─────────────────────────────────────────────
 *
 * Todo lo que derive de la temperatura, que es mucho: la ETP de Hargreaves y con
 * ella el balance hídrico y el índice de aridez, los grados-día, las horas de
 * frío, los meses con riesgo de helada, el Köppen calculado, la evaluación de
 * especies de `lib/especies.ts` y el calendario de `lib/calendario.ts`. Tocar el
 * gradiente mueve todos esos números a la vez.
 *
 * Fuentes:
 *  - American Meteorological Society, Glossary of Meteorology — «Standard
 *    atmosphere»: gradiente de 6,5 °C/km en la tropósfera.
 *    https://glossary.ametsoc.org/wiki/Standard_atmosphere
 *  - AMS Glossary — «Dry-adiabatic lapse rate»: 9,8 °C/km.
 *    https://glossary.ametsoc.org/wiki/Dry-adiabatic_lapse_rate
 *  - AMS Glossary — «Saturation-adiabatic lapse rate», el otro extremo de la
 *    horquilla. https://glossary.ametsoc.org/wiki/Saturation-adiabatic_lapse_rate
 */

/**
 * Gradiente térmico vertical, en °C por kilómetro de altura.
 *
 * Atmósfera estándar. Ver la nota de arriba sobre por qué es un promedio y no
 * una constante.
 */
export const GRADIENTE_TERMICO_C_KM = 6.5;

/**
 * Por debajo de esta diferencia de altura no se corrige nada.
 *
 * 50 m son 0,33 °C: menos que el redondeo con el que la app muestra la
 * temperatura, y menos que el error del propio modelo de elevación. Corregir ahí
 * sería ruido con apariencia de precisión.
 */
export const UMBRAL_IGNORAR_M = 50;

/**
 * Por encima de esta diferencia, la corrección se aplica pero se avisa fuerte.
 *
 * A 1.000 m la horquilla del gradiente (5 a 9,8 °C/km) abre un abanico de casi
 * 5 °C, que ya es del orden de la corrección misma. Sigue siendo mejor corregir
 * —el error sin corregir es de 6,5 °C— pero a esa altura el número pide un dato
 * medido en el predio, y la pantalla lo tiene que decir.
 */
export const UMBRAL_AVISO_M = 1000;

/** Qué tan confiable es la corrección, para que la interfaz no invente el tono. */
export type ConfianzaAltura = 'sin_correccion' | 'buena' | 'gruesa';

export interface CorreccionAltura {
  /** Altura que la fuente climática le asigna a su celda, en metros. */
  altura_celda_m: number;
  /** Altura del predio, del modelo de elevación, en metros. */
  altura_predio_m: number;
  /** predio − celda. Negativo = el predio está más abajo, y hace más calor. */
  desnivel_m: number;
  /** Lo que se le suma a cada temperatura mensual, en °C. Positivo = más calor. */
  delta_c: number;
  confianza: ConfianzaAltura;
  /** Una línea para la pantalla. Nunca vacía. */
  leyenda: string;
}

/**
 * Cuánto hay que corregir la temperatura, en °C.
 *
 * Positivo cuando el predio está más abajo que la celda. Devuelve exactamente 0
 * si la diferencia no llega al umbral o si alguno de los dos datos no es finito:
 * sin altura no se inventa una corrección.
 */
export function deltaTemperaturaC(alturaCeldaM: number, alturaPredioM: number): number {
  if (!Number.isFinite(alturaCeldaM) || !Number.isFinite(alturaPredioM)) return 0;
  const desnivel = alturaPredioM - alturaCeldaM;
  if (Math.abs(desnivel) < UMBRAL_IGNORAR_M) return 0;
  return (-desnivel / 1000) * GRADIENTE_TERMICO_C_KM;
}

/**
 * El diagnóstico completo, listo para guardar en los datos y mostrar.
 *
 * Devuelve `null` cuando no hay nada que corregir —falta una de las dos alturas,
 * o la diferencia no llega al umbral—. Un `null` acá significa "el dato de la
 * fuente se usa tal cual", que es distinto de "la corrección dio cero".
 */
export function diagnosticarAltura(
  alturaCeldaM: number | undefined | null,
  alturaPredioM: number | undefined | null,
): CorreccionAltura | null {
  if (alturaCeldaM == null || alturaPredioM == null) return null;
  if (!Number.isFinite(alturaCeldaM) || !Number.isFinite(alturaPredioM)) return null;

  const desnivel_m = Math.round(alturaPredioM - alturaCeldaM);
  if (Math.abs(desnivel_m) < UMBRAL_IGNORAR_M) return null;

  const delta_c = Math.round(deltaTemperaturaC(alturaCeldaM, alturaPredioM) * 10) / 10;
  const confianza: ConfianzaAltura =
    Math.abs(desnivel_m) > UMBRAL_AVISO_M ? 'gruesa' : 'buena';

  const masFrio = delta_c < 0;
  const arriba  = desnivel_m > 0;
  const signo   = delta_c > 0 ? '+' : '';

  const base =
    `El predio está ${Math.abs(desnivel_m).toLocaleString('es-AR')} m más ${arriba ? 'arriba' : 'abajo'} `
    + `que la celda de la que sale el dato climático (${Math.round(alturaCeldaM).toLocaleString('es-AR')} m), `
    + `así que la temperatura se corrigió ${signo}${delta_c.toLocaleString('es-AR')} °C `
    + `con el gradiente estándar de ${GRADIENTE_TERMICO_C_KM.toLocaleString('es-AR')} °C por kilómetro: `
    + `acá hace más ${masFrio ? 'frío' : 'calor'} que en el promedio de la celda.`;

  const aviso = confianza === 'gruesa'
    ? ' La diferencia de altura es grande y el gradiente real varía con la humedad,'
      + ' así que esta corrección es gruesa: si tenés una estación cerca, cargá el dato.'
    : '';

  return {
    altura_celda_m: Math.round(alturaCeldaM),
    altura_predio_m: Math.round(alturaPredioM),
    desnivel_m,
    delta_c,
    confianza,
    leyenda: base + aviso,
  };
}
