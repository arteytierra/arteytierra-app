/**
 * El «Miami Model» de Lieth: productividad primaria neta a partir del clima.
 *
 * NPP = **mínimo** de una función de la temperatura y una función de la lluvia,
 * con el supuesto de que uno de los dos factores siempre limita.
 *
 * ```
 * NPP_T = 3000 / (1 + e^(1,315 − 0,119 · T))      T = temperatura media anual, °C
 * NPP_P = 3000 · (1 − e^(−0,000664 · P))          P = lluvia media anual, mm
 * NPP   = min(NPP_T, NPP_P)                       en g de MATERIA SECA/m²/año
 * ```
 *
 * ## De dónde sale
 *
 * Lieth (1972, 1973, 1975). Las dos regresiones se leyeron de dos fuentes
 * independientes, porque la constante de la exponencial de la lluvia es el tipo
 * de número que una digitalización arruina sin que se note:
 *
 * - **Lieth, H. «Vegetation and CO₂ Changes»**, en *Carbon Dioxide, Climate and
 *   Society* (IIASA / Pergamon, 1978), pp. 103-104. Ahí están las ecuaciones (1)
 *   y (2) con esos coeficientes, y el texto dice que se construyeron con «about
 *   65 data pairs».
 *   https://pure.iiasa.ac.at/821/1/XB-78-502.pdf
 * - **Scurlock, Cramer, Olson et al., «An Introduction to the Global Primary
 *   Production Data Initiative»** (ORNL/GPPDI), p. 14, que las reimprime como
 *   `NPP = min[NPP_T, NPP_P]` y dice «a set of 52 NPP data points grouped into
 *   four regions from the tundra to the tropics».
 *   https://digital.library.unt.edu/ark:/67531/metadc691089/m2/1/high_res_d/631208.pdf
 *
 * Las dos coinciden en los coeficientes y difieren en cuántos puntos lo
 * calibraron (52 contra 65). Se cita el rango.
 *
 * ## Qué devuelve, exactamente
 *
 * **NPP TOTAL de materia seca: aérea más subterránea, leñosa más herbácea.** No
 * es forraje, no es la capa herbácea y no es lo que se puede cosechar. Confundir
 * las dos cosas es el error más caro que permite este archivo, y por eso el
 * resultado no se llama `forraje` en ninguna parte.
 *
 * El orden de magnitud de la distancia está medido, y en dos sitios se puede
 * comparar contra la NPP del propio rodal, sin pasar por el modelo:
 *
 * | sitio | NPP del rodal, medida | capa herbácea, medida | la herbácea es |
 * |---|---|---|---|
 * | Waring's Woods, Oregón (Pseudotsuga, 4,9 % de cobertura herbácea) | 1.540 g/m²/año | 6 g/m²/año | **0,4 %** |
 * | Cascade Head 1A, Oregón (Alnus rubra, 35,2 % de cobertura) | 1.630 g/m²/año | 41 g/m²/año | **2,5 %** |
 *
 * Los cuatro números salen de la misma ficha del ORNL (proyecto OTTER, transecto
 * de Oregón). Y en el bosque de roble y carpe de Różańsko, donde no hay NPP del
 * rodal pero sí clima publicado (8,8 °C y 541 mm), el modelo da 905 g/m²/año
 * contra una capa herbácea medida de 37,8 a 94,0: entre el **4 % y el 10 %**.
 *
 * O sea: en un predio con dosel cerrado, el número que devuelve esta función es
 * entre **diez y doscientas cincuenta veces** el pasto que hay para comer.
 *
 * ## Rango de validez, y qué pasa afuera
 *
 * 1. **Lluvia.** Lieth excluyó los climas más húmedos de la correlación simple,
 *    y Scurlock y Olson (2002) repiten la exclusión por encima de **3.000 mm**.
 *    Por debajo de unos 1.000 mm la función de la lluvia es prácticamente una
 *    recta —lo que Lieth llama «Walter's ratio»— y la curva de saturación sólo
 *    pesa arriba de los 3.000. Acá, arriba de 3.000 mm se devuelve el número con
 *    una advertencia.
 * 2. **Temperatura.** El texto de la GPPDI resume el comportamiento esperado:
 *    *«regions with mean annual temperature below 5 °C are temperature-limited,
 *    while the majority of warmer regions are limited by precipitation»*. Con
 *    estos coeficientes el cruce a 5 °C cae en **597 mm**: con menos lluvia que
 *    eso manda la lluvia aunque haga frío. La frase de la fuente es «in
 *    general», no un umbral, y Scurlock y Olson lo dicen explícito: *«there was
 *    no simple temperature threshold beyond which NPP is limited by
 *    precipitation»*.
 * 3. **Sesgo conocido y con nombre: en pastizal lee BAJO.** El modelo se calibró
 *    con los datos de la era del Programa Biológico Internacional, y la misma
 *    compilación que lo valida avisa que las medias de NPP total de pastizal que
 *    ella reúne son *«more than twice as high»* que los rangos de Lieth. No es
 *    una sospecha: la subestimación de la NPP de pastizales por el IBP está
 *    discutida en Long et al. (1989) y en Scurlock y Hall (1998). **Por eso este
 *    número no sirve como techo duro**, y hay un sitio de este repositorio donde
 *    se puede medir el sesgo con las dos cifras publicadas: el pastizal salino de
 *    Montecillo, México, con 580 mm y 15,1 °C de medias anuales publicadas en su
 *    propia ficha. El modelo da **959** g/m²/año de NPP total; la NPP total
 *    medida ahí es de **1.676**. El modelo lee **1,75 veces bajo**. Peor: la NPP
 *    aérea sola, medida, es de 669, o sea el **70 %** de todo lo que el modelo
 *    le atribuye al ecosistema entero.
 * 4. **No mira nada más.** Ni suelo, ni estacionalidad de la lluvia, ni fuego, ni
 *    pastoreo, ni la altura sobre el mar. Los modelos de la misma familia que sí
 *    los miran (Templin, Hamburg, Osnabrück, HRBM) son otros y no están acá.
 *
 * ## Cuánto le creyó la literatura
 *
 * Scurlock y Olson (2002, *Environmental Reviews* 10, pp. 99-102) lo contrastaron
 * contra tres conjuntos de datos y publicaron los r²:
 *
 * | conjunto | NPP contra lluvia sola | NPP contra el Miami Model |
 * |---|---|---|
 * | 30 sitios intensivos con NPP total | r² = 0,24 | **r² = 0,30** |
 * | Osnabrück, 189 puntos con lluvia y temperatura | «poor» | **r² = 0,44** |
 * | IBP Woodlands, 48 puntos | «poor» | **r² = 0,36** |
 *
 * Y su conclusión, textual: *«the overall fit […] is remarkably good […]
 * suggesting that this simple statistical model is quite robust»*. En el conjunto
 * de bosques el modelo predice que **la temperatura es la limitante en 41 de los
 * 48 puntos**, que es justamente lo que una escalera por lluvia no puede ver.
 *
 * Leído de frente: explica entre el 30 % y el 44 % de la variación. Sirve para
 * decir **qué limita** y para detectar un número imposible. No sirve para poner
 * una cifra de forraje en un informe.
 *
 * ## Qué se rompe si cambia
 *
 * Lo consume `contrastarForraje`, y por ahí la receptividad de `produccion.ts`.
 * Si se tocan los coeficientes, el contraste cambia de veredicto en los predios
 * del borde: fríos y húmedos.
 */

/** Los cuatro números del modelo, con su fuente en el encabezado. */
export const MIAMI = {
  /** La asíntota de las dos funciones, en g MS/m²/año. */
  ASINTOTA_G_M2_ANIO: 3000,
  /** Término constante del exponente de la función de temperatura. */
  T_A: 1.315,
  /** Coeficiente de T en el exponente, por °C. */
  T_B: 0.119,
  /** Coeficiente de P en el exponente, por mm. */
  P_K: 0.000664,
} as const;

/**
 * Dominio donde se devuelve un número. Afuera de esto se devuelve `null`, porque
 * el modelo se calibró de la tundra a los trópicos y no más allá.
 */
export const DOMINIO_MIAMI = {
  TEMP_MIN_C: -25,
  TEMP_MAX_C: 35,
  LLUVIA_MAX_MM: 12_000,
  /** Arriba de acá la fuente misma excluye el dato: se avisa, no se recorta. */
  LLUVIA_FUERA_DE_AJUSTE_MM: 3000,
} as const;

export type LimitanteMiami = 'temperatura' | 'lluvia' | 'empate';

export interface ResultadoMiami {
  /** El mínimo de las dos funciones, g de materia seca/m²/año. */
  npp_ms_g_m2_anio: number;
  /** El mismo número en la unidad del campo: kg MS/ha/año. Es ×10. */
  npp_ms_kg_ha_anio: number;
  /** La rama de temperatura, sin aplicar el mínimo. */
  por_temperatura_g_m2_anio: number;
  /** La rama de lluvia, sin aplicar el mínimo. */
  por_lluvia_g_m2_anio: number;
  /** Cuál de las dos manda. `empate` cuando están a menos del 10 %. */
  limitante: LimitanteMiami;
  /**
   * Cuánto más chica es la rama que manda, en % de la otra. 0 en el empate
   * perfecto. Sirve para no afirmar «la limitante es el frío» cuando las dos
   * funciones pasan una al lado de la otra.
   */
  margen_pct: number;
  advertencias: string[];
}

/** La rama de temperatura: g MS/m²/año a partir de la media anual en °C. */
export function nppPorTemperatura(temp_media_c: number): number {
  return MIAMI.ASINTOTA_G_M2_ANIO / (1 + Math.exp(MIAMI.T_A - MIAMI.T_B * temp_media_c));
}

/** La rama de lluvia: g MS/m²/año a partir de la lluvia media anual en mm. */
export function nppPorLluvia(lluvia_mm_anio: number): number {
  return MIAMI.ASINTOTA_G_M2_ANIO * (1 - Math.exp(-MIAMI.P_K * lluvia_mm_anio));
}

/**
 * NPP total del Miami Model. `null` cuando el clima cae fuera del dominio del
 * modelo, que es una respuesta y no una falla.
 *
 * Cadena de unidades: (°C, mm) → g MS/m²/año → ×10 → kg MS/ha/año.
 */
export function nppMiami(lluvia_mm_anio: number, temp_media_c: number): ResultadoMiami | null {
  if (!Number.isFinite(lluvia_mm_anio) || !Number.isFinite(temp_media_c)) return null;
  if (lluvia_mm_anio < 0 || lluvia_mm_anio > DOMINIO_MIAMI.LLUVIA_MAX_MM) return null;
  if (temp_media_c < DOMINIO_MIAMI.TEMP_MIN_C || temp_media_c > DOMINIO_MIAMI.TEMP_MAX_C) return null;

  const porT = nppPorTemperatura(temp_media_c);
  const porP = nppPorLluvia(lluvia_mm_anio);
  const npp = Math.min(porT, porP);
  const mayor = Math.max(porT, porP);

  // El margen se mide contra la rama que NO manda: es «cuánto más baja quedó la
  // limitante». Con las dos ramas iguales da 0 y el modelo no distingue.
  const margen_pct = mayor > 0 ? Math.round(((mayor - npp) / mayor) * 1000) / 10 : 0;
  const limitante: LimitanteMiami =
    margen_pct < 10 ? 'empate' : porT < porP ? 'temperatura' : 'lluvia';

  const advertencias: string[] = [];
  if (lluvia_mm_anio > DOMINIO_MIAMI.LLUVIA_FUERA_DE_AJUSTE_MM) {
    advertencias.push(
      `Con ${Math.round(lluvia_mm_anio)} mm al año el sitio queda arriba de los 3.000 mm que ` +
      'Lieth excluyó de la correlación: el modelo devuelve un número cerca de su asíntota y ' +
      'deja de distinguir climas.',
    );
  }
  if (limitante === 'empate') {
    advertencias.push(
      'Las dos ramas del modelo dan casi lo mismo, así que no dice si limita el frío o el agua.',
    );
  }
  advertencias.push(
    'Es NPP total —aérea y subterránea, leñosa y herbácea—, no forraje. Donde están medidas las ' +
    'dos cosas, la capa herbácea de un bosque es del 0,4 % al 10 % de este número.',
  );

  return {
    npp_ms_g_m2_anio: Math.round(npp * 10) / 10,
    npp_ms_kg_ha_anio: Math.round(npp * 10),
    por_temperatura_g_m2_anio: Math.round(porT * 10) / 10,
    por_lluvia_g_m2_anio: Math.round(porP * 10) / 10,
    limitante,
    margen_pct,
    advertencias,
  };
}

/**
 * El factor de subestimación documentado del modelo en pastizal, que es el que
 * separa «alto» de «imposible» en el contraste.
 *
 * Sale de una frase, no de una elección: las medias de NPP total de pastizal de
 * la compilación de Scurlock y Olson (2002) son *«more than twice as high»* que
 * los rangos de Lieth con los que el modelo se calibró. Entonces una cifra de
 * forraje que supere la NPP del modelo puede ser real hasta ese factor, y recién
 * más allá queda sin explicación posible.
 */
export const SESGO_PASTIZAL = 2;

export type VeredictoContraste = 'plausible' | 'alto' | 'imposible';

export interface ContrasteForraje {
  /** La NPP total que da el modelo para ese clima, kg MS/ha/año. */
  npp_total_kg_ha_anio: number;
  /** Qué limita según el modelo. */
  limitante: LimitanteMiami;
  /** La cifra de forraje que se está contrastando, kg MS/ha/año. */
  forraje_kg_ha_anio: number;
  /** Qué fracción de la NPP total reclama esa cifra de forraje. */
  fraccion_de_la_npp: number;
  veredicto: VeredictoContraste;
  /** Una línea para la pantalla, ya redactada con los dos números. */
  frase: string;
  advertencias: string[];
}

/**
 * Contrasta una cifra de forraje contra el clima, y es un test de UNA sola
 * dirección.
 *
 * Puede decir que un número es imposible; **no puede decir que sea correcto.**
 * La razón es el sesgo del punto 3 del encabezado: el modelo lee bajo en
 * pastizal, así que «la cifra entra abajo de la NPP» no prueba nada, mientras que
 * «la cifra pide más del doble de toda la materia seca del ecosistema» sí.
 *
 * Donde se nota: un predio frío y húmedo. Con 900 mm y −10 °C la escalera de
 * `prodForrajera` promete 7.000 kg MS/ha/año de forraje y el modelo dice que todo
 * el ecosistema produce 2.265. Ese es exactamente el caso que una función de la
 * lluvia sola no puede ver, y el que la tundra medida confirma: entre 350 y 960
 * kg/ha/año contra una escalera que ahí da de 1.500 a 7.000.
 */
export function contrastarForraje(
  forraje_kg_ha_anio: number,
  lluvia_mm_anio: number,
  temp_media_c: number,
): ContrasteForraje | null {
  if (!Number.isFinite(forraje_kg_ha_anio) || forraje_kg_ha_anio < 0) return null;
  const m = nppMiami(lluvia_mm_anio, temp_media_c);
  if (!m) return null;
  if (m.npp_ms_kg_ha_anio <= 0) return null;

  const fraccion = forraje_kg_ha_anio / m.npp_ms_kg_ha_anio;
  const veredicto: VeredictoContraste =
    fraccion > SESGO_PASTIZAL ? 'imposible' : fraccion > 1 ? 'alto' : 'plausible';

  const kg = (n: number) => Math.round(n).toLocaleString('es-AR');
  const porQue =
    m.limitante === 'temperatura' ? 'y lo que limita es la temperatura, no el agua'
    : m.limitante === 'lluvia'    ? 'y lo que limita es el agua'
    :                               'sin que el modelo distinga si limita el frío o el agua';

  const frase =
    veredicto === 'imposible'
      ? `La cifra de ${kg(forraje_kg_ha_anio)} kg MS/ha/año de forraje pide ${fraccion.toFixed(1)} veces ` +
        `toda la materia seca que ese clima produce según el Miami Model (${kg(m.npp_ms_kg_ha_anio)} ` +
        `kg MS/ha/año de NPP total, ${porQue}). Está mal por un margen que ningún sesgo del modelo explica.`
      : veredicto === 'alto'
      ? `La cifra de ${kg(forraje_kg_ha_anio)} kg MS/ha/año supera la NPP total del Miami Model para ese ` +
        `clima (${kg(m.npp_ms_kg_ha_anio)} kg MS/ha/año, ${porQue}). Puede ser real —el modelo lee bajo ` +
        'en pastizal, hasta la mitad— pero no se puede sostener sin una medición del lugar.'
      : `El Miami Model da ${kg(m.npp_ms_kg_ha_anio)} kg MS/ha/año de NPP total para ese clima, ${porQue}. ` +
        `La cifra de forraje es el ${Math.round(fraccion * 100)} % de eso, que es un orden de magnitud ` +
        'posible; el contraste no la confirma, sólo no la descarta.';

  return {
    npp_total_kg_ha_anio: m.npp_ms_kg_ha_anio,
    limitante: m.limitante,
    forraje_kg_ha_anio,
    fraccion_de_la_npp: Math.round(fraccion * 100) / 100,
    veredicto,
    frase,
    advertencias: m.advertencias,
  };
}
