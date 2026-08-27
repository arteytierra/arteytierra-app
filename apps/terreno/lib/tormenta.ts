/**
 * Desagregación de la tormenta de diseño (H5).
 *
 * El clima nos da UNA sola lámina: la lluvia máxima diaria para cada período de
 * retorno (Gumbel sobre máximos anuales de P24h). Eso alcanza para lo que se
 * dimensiona por VOLUMEN —un swale, una cisterna, el llenado de una represa—,
 * porque ahí lo único que importa es cuánta agua cae en el evento.
 *
 * No alcanza para lo que se dimensiona por CAUDAL. El pico de una cuenca chica
 * no lo produce el total del día: lo produce la ráfaga de unos pocos minutos
 * que coincide con su tiempo de concentración. Un vertedero, una alcantarilla o
 * un cruce de camino se dimensionan contra esa ráfaga, no contra el acumulado
 * de 24 h.
 *
 * Este módulo hace ese pasaje. Con curvas IDF locales no haría falta; sin ellas
 * se usa la ley potencia lámina–duración, que es la desagregación empírica
 * clásica (Chow / IMD):
 *
 *     P(d) = P(24 h) · (d / 24 h)^n
 *
 * `n` cae entre 0.20 y 0.40 según el clima; 0.30 es el valor medio habitual y
 * da P(1 h) ≈ 0.39 · P(24 h), dentro del rango 0.3–0.5 que se observa en
 * climas con lluvia convectiva. Es un supuesto, y se declara como tal en la
 * salud del cálculo: si hay curvas IDF de la estación local, mandan ellas.
 */

/** Exponente de la ley potencia lámina–duración. Empírico; ver el docstring. */
export const EXP_DURACION = 0.30;

/**
 * Piso de duración (min). Abajo de ~10 minutos las curvas IDF se aplanan y la
 * ley potencia se dispara: una cuenca con tc de 3 min daría una intensidad
 * irreal. Se recorta ahí, del lado conservador (intensidad alta, no infinita).
 */
export const DUR_MIN_MIN = 10;

/** Lámina de lluvia (mm) para una duración dada, desagregada desde la de 24 h. */
export function laminaDuracion(p24_mm: number, dur_min: number, n = EXP_DURACION): number {
  if (p24_mm <= 0 || dur_min <= 0) return 0;
  const dur_h = dur_min / 60;
  return p24_mm * Math.pow(dur_h / 24, n);
}

/** Intensidad media (mm/h) de la ráfaga de esa duración. */
export function intensidadDuracion(p24_mm: number, dur_min: number, n = EXP_DURACION): number {
  if (dur_min <= 0) return 0;
  return laminaDuracion(p24_mm, dur_min, n) / (dur_min / 60);
}

/**
 * Duración de diseño para el caudal pico: el tiempo de concentración, que es
 * cuando toda la cuenca aporta a la vez, con el piso de `DUR_MIN_MIN`.
 */
export function duracionDeDiseno(tc_min: number): number {
  return Math.max(DUR_MIN_MIN, Math.round(tc_min * 10) / 10);
}

/**
 * Caudal pico por método racional: Q = C · i · A / 3.6.
 *
 * `coef` es la fracción de lluvia que escurre EN EL EVENTO (la que devuelve el
 * SCS-CN como Q/P), no un coeficiente anual. `i` en mm/h, `area_km2` en km²,
 * resultado en m³/s. Válido en cuencas chicas —hasta unas 200 ha—, que es el
 * mismo dominio donde Kirpich está calibrado.
 */
export function caudalPicoRacional(coef: number, intensidad_mm_h: number, area_km2: number): number {
  if (coef <= 0 || intensidad_mm_h <= 0 || area_km2 <= 0) return 0;
  return coef * intensidad_mm_h * area_km2 / 3.6;
}
