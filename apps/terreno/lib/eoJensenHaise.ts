/**
 * La `Eo` que pide el modelo de forraje, calculada como la calcularon sus autores.
 *
 * ## Qué calcula, y por qué este archivo existe
 *
 * El balance de Wight y Hanks (1981) —`forrajeBalance.ts`— pide `Eo` y acequia
 * le venía dando la **ETo de referencia de FAO-56** de la serie diaria, porque
 * era lo que había. Estaba declarado como degradación en `ETO_NO_ES_EO` y la
 * deuda era leer Jensen-Haise (1963) para medir la diferencia. Se leyó, y la
 * sustitución era peor de lo anotado: con la ETo de FAO-56, el `b` publicado
 * **infla la `Tp` de la Tabla 1 un 16,5 % en promedio y hasta un 35,6 %**.
 *
 * El motivo es que `b = 0,435` no es un parámetro libre: se despejó de
 * `Tp/(Kc·Eo)` con la `Eo` **del trabajo**. Aplicar ese `b` con otra `Eo` rompe
 * la derivación. Así que la forma de arreglarlo no es un factor de conversión
 * —eso sería inventar un número adentro de un motor de cálculo— sino calcular
 * la `Eo` con el método del trabajo. Eso es lo que hace este archivo.
 *
 * Con la `Eo` de acá, el mismo `b` reproduce la columna `Tp` publicada con un
 * error medio de **+1,6 %**. Ver `LAS_DOS_MITADES_DEL_ERROR_DE_LA_EO`.
 *
 * ## La fuente
 *
 * Jensen, M. E., y Haise, H. R. (1963). «Estimating evapotranspiration from
 * solar radiation». *Journal of the Irrigation and Drainage Division,
 * Proceedings of the ASCE* 89(IR4):15-41. La forma original, en grados
 * Fahrenheit y langleys por día:
 *
 * ```
 * ETr = CT · (T − Tx) · Rs        CT = 0,014      Tx = 26,4 °F
 * ```
 *
 * Esa forma se modificó después —Jensen (1966) y Jensen et al. (1970)— para que
 * `CT` y `Tx` dependan de la **altitud** y de la **aridez** del sitio:
 *
 * ```
 * CT = 1 / (C1 + C2 · CH)      C1 = 68 − 3,6 · (elev_pies/1000)      C2 = 13
 * CH = 50 / (e2 − e1)          e en milibares
 * Tx = 27,5 − 0,25 · (e2 − e1) − (elev_pies/1000)
 * ```
 *
 * donde `e2` y `e1` son las presiones de vapor de saturación a la **media de
 * máximas y la media de mínimas del mes más cálido** del lugar. La diferencia
 * `e2 − e1` es un índice de aridez: cuanto más seca y continental la plaza, más
 * amplia la oscilación diaria, más chico `CH` y más grande `CT`, o sea más
 * evaporación por unidad de radiación. Es la corrección por advección.
 *
 * La formulación de acá, con la conversión de unidades y el calor latente, es la
 * que publica el **U.S. Bureau of Reclamation** para su programa AgriMet
 * —«Computation of the 1982 Kimberly-Penman and the Jensen-Haise
 * Evapotranspiration Equations as Applied in the U.S. Bureau of Reclamation's
 * Pacific Northwest AgriMet Program», Dockter, 1994, revisado por Palmer en
 * 2008, con el FORTRAN de `ETPCOMP` y `JENSEN` en los apéndices— y coincide con
 * la del informe **WWRC 87-06** de la University of Wyoming, capítulo 4. Las dos
 * fuentes dan los mismos coeficientes en las mismas unidades, y la forma en °C
 * de la ILRI (*Drainage Principles and Applications*, publicación 16, ecuación
 * 5.7: `ETp = (0,025·Ta + 0,08)·Rs/28,6`) coincide con la original de 1963
 * **dentro del 1,6 % entre 10 y 30 °C**: lo que queda es el calor latente, que
 * la ILRI fija en 2,45 MJ/kg y el USBR hace función de la temperatura del día.
 *
 * ## Unidades, sin ninguna conversión implícita
 *
 * - `rs_mj_m2`: radiación global del día, **MJ/m²**. Un langley es 1 cal/cm², o
 *   sea 0,04184 MJ/m².
 * - `t_media_c`: temperatura media del día, **°C**. El método la define como
 *   media de máxima y mínima, que es con lo que se calibró.
 * - `tx_f`: el intercepto del eje de temperatura, en **°F**, como lo publican
 *   las fuentes. No se convierte a °C para que el número sea el de la tabla.
 * - El calor latente del USBR es `λ = 595 − 0,51·T(°C)` en **cal/g**, así que
 *   depende de la temperatura del día: a 0 °C son 595 y a 30 °C, 579,7.
 * - La salida es **mm/día**.
 *
 * ## Rango de validez, y qué pasa afuera
 *
 * El método es de **superficie de referencia alfalfa** —el USBR la define como
 * alfalfa bien provista de agua con 30 a 50 cm de crecimiento— y se derivó en el
 * **oeste de Estados Unidos**, en clima árido y semiárido. Wight y Hanks le
 * dicen «evaporación de una superficie de agua libre», que es la lectura de la
 * época; lo que importa acá no es el nombre sino que su `Kc = 0,85` y su
 * `b = 0,435` se ajustaron contra **esta** magnitud.
 *
 * Las 51 estaciones del archivo `CLIMAT.DAT` del USBR que traen coeficiente van
 * de **24 a 1.893 m** de altitud. Afuera de eso el término de altitud extrapola
 * —a 4.000 m, `C1` baja a 21 y `CT` se duplica— y el resultado sale con
 * advertencia.
 *
 * En clima húmedo tropical el método no sirve, y no por la altitud: `e2 − e1`
 * se hace chico, `CH` grande y `CT` chico, de modo que el método **devuelve
 * poco justo donde la ETo real es alta**. Eso **no lo atrapa** el envolvente de
 * `RANGO_DE_ARIDEZ` —Yakarta da 13 a 15 mb, que cae adentro— y queda dicho
 * acá: lo que avisa en el trópico es el rango de validez del balance que
 * consume esta `Eo`, calibrado en pradera mixta templada. La ILRI anota además
 * que los métodos de radiación subestiman en primavera y sobreestiman en
 * verano, porque le dan demasiado peso a la temperatura y poco a la radiación.
 *
 * ## Los casos resueltos
 *
 * Son dos, los dos en `tests/unit/economia/eoJensenHaise.test.ts`:
 *
 * 1. **`CLIMAT.DAT`, el apéndice C del USBR, publica altitud, `CsubT` y `TsubX`
 *    de 70 estaciones, 51 de ellas con Jensen-Haise configurado.** `CT` y `Tx`
 *    están atados por `e2 − e1`, así que de la altitud y de `Tx` sale `CT` sin
 *    ningún grado de libertad. **49 de las 51 reproducen el `CsubT` publicado**
 *    dentro de la banda que deja el redondeo de `Tx` a una décima. De las dos que no: `RXGI` publica `Tx = 6,3` y con
 *    16,3 —su estación gemela `AHTI`, a altitud parecida, publica 16,2— da
 *    exactamente el `CT` de la tabla, así que es un dígito perdido; y `DRLM`
 *    queda a 0,2 °F de cerrar. Que el cálculo detecte un error de tipeo en la
 *    tabla de origen es la mejor evidencia de que es el mismo cálculo.
 * 2. **La Tabla 1 de Wight y Hanks publica `Kc·Eo` de doce temporadas.** Con la
 *    serie de ERA5 del mismo sitio, la `Eo` de este archivo reproduce esa
 *    columna con un cociente medio de **1,015** (mediana 1,023, de 0,948 a
 *    1,097), y con el `b` publicado reproduce la columna `Tp` con **+1,6 %** de
 *    error medio. La ETo de FAO-56, para comparar, da 1,162 y +16,5 %.
 *
 * ## Qué se rompe si cambia
 *
 * `ventanaDeBalance` en `forrajeCorte.ts` y `indicesPorAnio` en
 * `forrajeAnios.ts` prefieren esta `Eo` cuando la serie trae radiación y
 * temperaturas, y caen a la ETo de FAO-56 con aviso cuando no. **Las dos tienen
 * que usar la misma**: el `Yp` sale de dividir un corte por un índice y después
 * se multiplica por los índices de los otros años, así que una `Eo` en el corte
 * y otra en la serie se cancelarían mal y el error saldría disfrazado de kilos.
 * Las rutas `/api/clima-diario/ventana` y `/api/clima-diario/indices` entregan
 * los coeficientes ya calculados justamente para que no se puedan desincronizar.
 */

/** De dónde sale cada cosa, para que no haya que buscarla. */
export const FUENTES_EO = {
  original:
    'Jensen, M. E. y Haise, H. R. (1963). Estimating evapotranspiration from solar radiation. '
    + 'J. Irrigation and Drainage Division, ASCE 89(IR4):15-41.',
  modificada:
    'Jensen (1966) y Jensen et al. (1970), con la calibración de CT y Tx por altitud y aridez.',
  formulacion:
    'U.S. Bureau of Reclamation, AgriMet: Computation of the 1982 Kimberly-Penman and the '
    + 'Jensen-Haise Evapotranspiration Equations (Dockter 1994, rev. Palmer 2008), apéndices A a C. '
    + 'Coincide con WWRC 87-06, University of Wyoming, cap. 4.',
  superficie_de_referencia:
    'alfalfa bien provista de agua, 30 a 50 cm de crecimiento (definición del USBR)',
} as const;

/** Los coeficientes de la forma original de 1963, en °F. */
export const COEFICIENTES_DE_1963 = { ct: 0.014, tx_f: 26.4 } as const;

/** Un langley es una caloría por centímetro cuadrado. */
export const MJ_POR_LANGLEY = 0.04184;

/**
 * El rango de altitud de las estaciones con coeficientes publicados.
 *
 * Son las 51 de `CLIMAT.DAT` que traen `CsubT`. No es un límite físico del
 * método: es hasta dónde alguien lo aplicó y publicó los números.
 */
export const RANGO_DE_ALTITUD = { minima_m: 24, maxima_m: 1893, estaciones: 51 } as const;

/**
 * El envolvente de aridez de esas mismas estaciones, en milibares.
 *
 * `e2 − e1` sale despejado del `TsubX` publicado de cada una, y las 51 van de
 * **6,9 mb** —dos estaciones costeras a 24 m— a **32,4 mb**, con mediana 26,5.
 * Afuera de eso el método se está aplicando en un clima donde nadie lo
 * publicó.
 *
 * **Este aviso no alcanza para el trópico húmedo**, y conviene decirlo: un sitio
 * como Yakarta o Singapur da 13 a 15 mb, que cae cómodo adentro del envolvente,
 * y ahí el método igual no sirve. Lo que avisa en ese caso es el rango de
 * validez del balance que consume esta `Eo`, que está calibrado en pradera mixta
 * templada. El que sí queda afuera por acá es el clima marítimo frío y húmedo,
 * de oscilación diaria chica.
 */
export const RANGO_DE_ARIDEZ = { minima_mb: 6.9, maxima_mb: 32.4, mediana_mb: 26.5 } as const;

/**
 * Cuántos años de serie hacen falta para las normales del mes más cálido.
 *
 * El período normal de la OMM son 30 años. Con menos, el mes más cálido puede
 * salir mal elegido y `e2 − e1` queda ruidoso, así que abajo de 10 se rechaza y
 * entre 10 y 30 sale con advertencia.
 */
export const ANIOS_PARA_LAS_NORMALES = { minimo: 10, recomendado: 30 } as const;

/** Lo que no se pudo traer, con la dirección del error de cada hueco. */
export const ADVERTENCIAS_EO = {
  normales_de_reanalisis:
    'Las normales del mes más cálido salieron de la misma serie de reanálisis que los días, y un '
    + 'reanálisis achata la oscilación diaria: en Sidney, Montana, la amplitud de ERA5 en la '
    + 'temporada es de 11,5 °C contra 15,2 °C de la estación del lugar, aunque el punto medio '
    + 'coincide. Una amplitud achatada baja e2−e1, baja CT y baja la Eo, así que la Tp sale baja '
    + 'y el índice T/Tp sale ALTO.',
  altitud_fuera_de_rango:
    'La altitud queda fuera de los 24 a 1.893 m de las estaciones con coeficientes publicados. El '
    + 'término de altitud de CT y de Tx es lineal y extrapola sin aviso: a 4.000 m duplica CT.',
  pocos_anios:
    'Las normales del mes más cálido salieron de menos de 30 años, que es el período normal de la '
    + 'OMM. El mes elegido y la amplitud quedan ruidosos.',
  aridez_fuera_de_rango:
    'El índice de aridez e2−e1 del sitio quedó fuera de los 6,9 a 32,4 mb de las estaciones que '
    + 'publicaron coeficientes. Por abajo —clima marítimo frío, de oscilación diaria chica— CT se '
    + 'hace chico y la Eo sale BAJA, así que el índice T/Tp sale ALTO. Por arriba, al revés. El '
    + 'trópico húmedo cae adentro de este envolvente y el método igual no sirve ahí: lo que avisa '
    + 'en ese caso es el rango de validez del balance que consume esta Eo.',
  dias_bajo_el_intercepto:
    'Algún día quedó con la temperatura media por debajo de Tx y su Eo se tomó como cero, que es '
    + 'lo que hace el programa del USBR: no calcula valores negativos.',
} as const;

/**
 * Presión de vapor de saturación, en milibares, por la forma que usa el
 * programa del USBR:
 *
 * ```
 * e = 6,105 · exp( 25,22 · (Tk − 273)/Tk − 5,31 · ln(Tk/273) )
 * ```
 *
 * `Tk` en kelvin, con la conversión del propio programa (`+273`, no `+273,15`).
 * Devuelve `null` si la temperatura no es un número finito o si cae en el cero
 * absoluto de esa conversión, donde el logaritmo no existe.
 */
export function saturacionMb(t_c: number): number | null {
  if (!Number.isFinite(t_c)) return null;
  const tk = t_c + 273;
  if (tk <= 0) return null;
  return 6.105 * Math.exp(25.22 * (tk - 273) / tk - 5.31 * Math.log(tk / 273));
}

export interface CoeficientesEo {
  /** `CT`, el coeficiente de temperatura. Para `Rs` en langleys por día. */
  ct: number;
  /** `Tx`, el intercepto del eje de temperatura, en **°F**. */
  tx_f: number;
  /** `e2 − e1`, el índice de aridez del sitio, en milibares. */
  e2_menos_e1_mb: number;
  /** `C1`, el término de altitud. */
  c1: number;
  /** `CH`, el término de humedad. */
  ch: number;
  elevacion_m: number;
  /** Cuál de las dos formas publicadas. */
  variante: 'modificada' | 'original_1963';
  /** El mes más cálido y sus normales, cuando salieron de una serie. */
  mes_mas_calido?: number;
  tmax_normal_c?: number;
  tmin_normal_c?: number;
  advertencias: string[];
}

/**
 * Los coeficientes de la variante modificada, de la altitud y de las normales
 * del mes más cálido.
 *
 * Devuelve `null` si algún número no es finito, si la altitud es absurda
 * —menos de 500 m bajo el mar o más de 9.000— o si la media de máximas no es
 * mayor que la de mínimas, que haría `e2 − e1 ≤ 0` y `CT` sin sentido.
 */
export function coeficientesEo(e: {
  elevacion_m: number;
  tmax_normal_c: number;
  tmin_normal_c: number;
  mes_mas_calido?: number;
  anios_de_las_normales?: number;
  /** `false` sólo cuando las normales salieron de una estación, no de una grilla. */
  normales_de_reanalisis?: boolean;
}): CoeficientesEo | null {
  const { elevacion_m, tmax_normal_c, tmin_normal_c } = e;
  if (![elevacion_m, tmax_normal_c, tmin_normal_c].every(Number.isFinite)) return null;
  if (elevacion_m < -500 || elevacion_m > 9000) return null;
  const e2 = saturacionMb(tmax_normal_c);
  const e1 = saturacionMb(tmin_normal_c);
  if (e2 === null || e1 === null) return null;
  const de = e2 - e1;
  if (de <= 0) return null;

  const kft = elevacion_m * 3.28084 / 1000;
  const c1 = 68 - 3.6 * kft;
  const ch = 50 / de;
  const denominador = c1 + 13 * ch;
  if (denominador <= 0) return null;

  const advertencias: string[] = [];
  if (elevacion_m < RANGO_DE_ALTITUD.minima_m || elevacion_m > RANGO_DE_ALTITUD.maxima_m) {
    advertencias.push(ADVERTENCIAS_EO.altitud_fuera_de_rango);
  }
  if (de < RANGO_DE_ARIDEZ.minima_mb || de > RANGO_DE_ARIDEZ.maxima_mb) {
    advertencias.push(ADVERTENCIAS_EO.aridez_fuera_de_rango);
  }
  if (e.normales_de_reanalisis !== false) advertencias.push(ADVERTENCIAS_EO.normales_de_reanalisis);
  if (e.anios_de_las_normales !== undefined
      && e.anios_de_las_normales < ANIOS_PARA_LAS_NORMALES.recomendado) {
    advertencias.push(ADVERTENCIAS_EO.pocos_anios);
  }

  return {
    ct: 1 / denominador,
    tx_f: 27.5 - 0.25 * de - kft,
    e2_menos_e1_mb: de,
    c1,
    ch,
    elevacion_m,
    variante: 'modificada',
    ...(e.mes_mas_calido !== undefined ? { mes_mas_calido: e.mes_mas_calido } : {}),
    tmax_normal_c,
    tmin_normal_c,
    advertencias,
  };
}

/**
 * La `Eo` de un día, en mm.
 *
 * ```
 * λ · ETr = CT · (T°F − Tx) · Rs        Rs y λ·ETr en cal/cm²/día
 * λ = 595 − 0,51 · T°C                  cal/g
 * Eo[mm] = 10 · CT · (T°F − Tx) · Rs[ly] / λ
 * ```
 *
 * El `10 ·` es la conversión de cm a mm: `(cal/cm²)/(cal/g)` da g/cm², que con
 * densidad 1 son centímetros de agua.
 *
 * Devuelve `null` si los números no son finitos o si la radiación es negativa.
 * Nunca devuelve negativo: por debajo del intercepto de temperatura da **cero**,
 * que es lo que hace el programa del USBR.
 */
export function eoJensenHaiseMm(
  t_media_c: number,
  rs_mj_m2: number,
  c: Pick<CoeficientesEo, 'ct' | 'tx_f'>,
): number | null {
  if (!Number.isFinite(t_media_c) || !Number.isFinite(rs_mj_m2)) return null;
  if (!Number.isFinite(c.ct) || !Number.isFinite(c.tx_f)) return null;
  if (rs_mj_m2 < 0) return null;
  const lambda = 595 - 0.51 * t_media_c;
  if (lambda <= 0) return null;
  const t_f = t_media_c * 1.8 + 32;
  const rs_ly = rs_mj_m2 / MJ_POR_LANGLEY;
  return Math.max(0, 10 * c.ct * (t_f - c.tx_f) * rs_ly / lambda);
}

/** Un día de serie con lo que necesita Jensen-Haise. */
export interface DiaConRadiacion {
  /** Fecha ISO `YYYY-MM-DD`. */
  fecha: string;
  t_max_c: number | null;
  t_min_c: number | null;
  rs_mj_m2: number | null;
}

export interface NormalesDelMesMasCalido {
  /** 1 a 12. */
  mes: number;
  tmax_c: number;
  tmin_c: number;
  dias_usados: number;
  anios: number;
}

/**
 * Las normales de máxima y de mínima del mes más cálido de la serie.
 *
 * El mes más cálido se elige por la media de `(máxima + mínima)/2`, no por la
 * máxima sola: un mes con máximas altas y mínimas muy bajas no es el más
 * cálido, y la diferencia cambia `e2 − e1`.
 *
 * Devuelve `null` si la serie no alcanza los diez años de
 * `ANIOS_PARA_LAS_NORMALES`, si al mes elegido le faltan días, o si no hay
 * ningún mes con datos. **No rellena nada**: un mes sin dato no es un mes
 * templado.
 */
export function normalesDelMesMasCalido(
  dias: readonly DiaConRadiacion[],
): NormalesDelMesMasCalido | null {
  const porMes: Array<{ max: number; min: number; n: number; anios: Set<number> }> = [];
  for (let m = 0; m < 12; m++) porMes.push({ max: 0, min: 0, n: 0, anios: new Set() });

  const aniosTotales = new Set<number>();
  for (const d of dias) {
    if (d.t_max_c === null || d.t_min_c === null) continue;
    if (!Number.isFinite(d.t_max_c) || !Number.isFinite(d.t_min_c)) continue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.fecha)) continue;
    const m = Number(d.fecha.slice(5, 7)) - 1;
    if (m < 0 || m > 11) continue;
    const c = porMes[m]!;
    c.max += d.t_max_c;
    c.min += d.t_min_c;
    c.n += 1;
    c.anios.add(Number(d.fecha.slice(0, 4)));
    aniosTotales.add(Number(d.fecha.slice(0, 4)));
  }
  if (aniosTotales.size < ANIOS_PARA_LAS_NORMALES.minimo) return null;

  let mejor = -1;
  let mejorT = -Infinity;
  for (let m = 0; m < 12; m++) {
    const c = porMes[m]!;
    if (c.n === 0) continue;
    const t = (c.max + c.min) / (2 * c.n);
    if (t > mejorT) { mejorT = t; mejor = m; }
  }
  if (mejor < 0) return null;
  const c = porMes[mejor]!;
  // Al mes elegido no le puede faltar la mitad de sus días: 25 por año es el
  // piso de un mes de 28 a 31 con algún hueco.
  if (c.n < 25 * c.anios.size) return null;

  return {
    mes: mejor + 1,
    tmax_c: c.max / c.n,
    tmin_c: c.min / c.n,
    dias_usados: c.n,
    anios: c.anios.size,
  };
}

/**
 * Los coeficientes directo de una serie diaria, que es como los piden las rutas.
 *
 * Devuelve `null` cuando las normales no se pueden sacar de la serie, y en ese
 * caso quien llama tiene que caer a la ETo de FAO-56 **con el aviso**, no seguir
 * como si nada.
 */
export function coeficientesDeLaSerie(
  dias: readonly DiaConRadiacion[],
  elevacion_m: number,
): CoeficientesEo | null {
  const n = normalesDelMesMasCalido(dias);
  if (n === null) return null;
  return coeficientesEo({
    elevacion_m,
    tmax_normal_c: n.tmax_c,
    tmin_normal_c: n.tmin_c,
    mes_mas_calido: n.mes,
    anios_de_las_normales: n.anios,
    normales_de_reanalisis: true,
  });
}

/**
 * La `Eo` día por día de una serie. `null` en los días a los que les falta algo.
 *
 * Los `null` se devuelven tal cual y no se rellenan: un día sin radiación no es
 * un día sin demanda atmosférica, y el balance rechaza la ventana que tenga uno.
 */
export function serieDeEo(
  dias: readonly DiaConRadiacion[],
  c: CoeficientesEo,
): Array<number | null> {
  return dias.map(d => {
    if (d.t_max_c === null || d.t_min_c === null || d.rs_mj_m2 === null) return null;
    return eoJensenHaiseMm((d.t_max_c + d.t_min_c) / 2, d.rs_mj_m2, c);
  });
}

/**
 * Las dos mitades del error de la `Eo`, separadas, y ninguna es la que yo
 * esperaba.
 *
 * `EL_ANIO_SECO_LO_DECIDE_LA_EO` había medido que la ETo de FAO-56 de ERA5 lee
 * 1,14 a 1,20 veces la `Eo` de la Tabla 1, y dejó escrito que ese cociente
 * mezcla dos cosas que no se podían separar sin leer Jensen-Haise: la
 * diferencia de superficie de referencia y el sesgo de ERA5 en ese píxel. Se
 * leyó, y se pudo separar. Todo en Sidney, Montana, el sitio de la validación.
 *
 * ## Primera mitad: el sesgo de ERA5 es chico, y se midió contra otras fuentes
 *
 * - **La temperatura no tiene sesgo.** Contra la estación GHCN-Daily
 *   `USC00247560`, que está a 4 km del píxel y a la misma altura, el punto medio
 *   diario de ERA5 en las doce ventanas de la prueba —1.066 días— difiere
 *   **−0,02 °C**. Pero la **amplitud** sí: 11,5 °C contra 15,2 de la estación,
 *   con la máxima 1,8 °C baja y la mínima 1,8 °C alta. Es el achatamiento típico
 *   de una celda de 31 km, y entra en el cálculo por `e2 − e1`.
 * - **La radiación lee 2,2 % alta.** Contra NASA POWER, que es satelital y no
 *   sale del mismo reanálisis, sobre 41 temporadas de 1984 a 2024: cociente
 *   medio 1,022, de 0,955 a 1,088.
 *
 * O sea que los **datos** de ERA5 en ese punto explican a lo sumo dos o tres
 * puntos del 16 %.
 *
 * ## Segunda mitad: la superficie de referencia es casi todo lo demás
 *
 * Con la `Eo` de este archivo calculada sobre la misma serie, el cociente contra
 * la Tabla 1 baja de **1,162 a 1,015**. Las dos magnitudes son ETo de pasto de
 * FAO-56 contra ETr de alfalfa de Jensen-Haise, y el cociente medido entre ellas
 * sobre las 65 temporadas es **1,166**, que cae justo en el 1,1 a 1,4 que la
 * literatura publica para `ETr/ETo`.
 *
 * ## Lo que hay que decir y es incómodo
 *
 * El 1,015 es **medido, no construido**, pero se apoya en parte en el
 * achatamiento de la amplitud diaria de ERA5. Si los coeficientes se calculan
 * como manda el método, con las normales de la estación del lugar, `e2 − e1`
 * sube de 20,9 a 27,1 mb y la `Eo` sale **1,133** de la tabla, parecido a la
 * forma original de 1963 sin corregir, que da 1,098. O sea: con las normales
 * «buenas» quedaría un 10 % sin explicar, que estaría en la `Eo` de Wight y
 * Hanks —su piranómetro, o los coeficientes de su propia estación, que el
 * artículo no publica— y no en acequia.
 *
 * Acequia usa las normales de la misma serie porque es lo único que puede
 * calcular en cualquier predio del mundo, y porque eso la deja con el error más
 * chico medible en el único sitio donde hay con qué medirlo. La advertencia
 * `normales_de_reanalisis` dice la dirección.
 */
export const LAS_DOS_MITADES_DEL_ERROR_DE_LA_EO = {
  sitio: 'Sidney, Montana — el sitio de validación de Wight y Hanks (1981)',
  /** El cociente contra la `Eo` que se deduce de la Tabla 1, por reconstrucción. */
  contra_la_tabla_1: {
    jensen_haise_de_la_serie: {
      media: 1.0146, mediana: 1.0232, minimo: 0.9483, maximo: 1.0974, desvio: 0.04,
    },
    eto_fao_56: {
      media: 1.1622, mediana: 1.1784, minimo: 1.0543, maximo: 1.3222, desvio: 0.071,
    },
    jensen_haise_con_normales_de_estacion: { media: 1.1334 },
    original_1963: { media: 1.0983 },
  },
  /** El error con el que cada `Eo` reproduce la columna `Tp` con el `b` publicado, en %. */
  tp_reproducida_pct: {
    jensen_haise: { media: 1.6, minimo: -7.2, maximo: 12.8 },
    eto_fao_56: { media: 16.5, minimo: 3.2, maximo: 35.6 },
  },
  /** El sesgo propio de ERA5 en ese píxel, contra fuentes que no son ERA5. */
  sesgo_de_era5: {
    temperatura_punto_medio_c: -0.02,
    dias_comparados: 1066,
    estacion: 'GHCN-Daily USC00247560 SIDNEY, 47,728 / −104,147, 589 m',
    amplitud_diaria_c: { era5: 11.53, estacion: 15.17 },
    maxima_c: -1.84,
    minima_c: 1.8,
    radiacion_contra_power: { cociente: 1.0222, minimo: 0.9547, maximo: 1.0875, temporadas: 41 },
  },
  /** El cociente entre las dos superficies de referencia, sobre la serie entera. */
  eto_sobre_eo: { media: 1.166, mediana: 1.1649, minimo: 1.072, maximo: 1.2626, temporadas: 65 },
  eto_sobre_eo_publicado: 'la literatura da ETr/ETo de 1,1 a 1,4 (Allen, ASABE, cap. 8)',
  queda_sin_explicar:
    'Con las normales de la estación del lugar, que es como manda el método, la Eo de '
    + 'Jensen-Haise sale 1,133 de la Tabla 1. Ese 10 % está en la Eo del trabajo —su piranómetro, '
    + 'o los coeficientes de su propia estación, que el artículo no publica— y no se puede cerrar '
    + 'desde acá. Acequia usa las normales de la serie porque es lo único que puede calcular en '
    + 'cualquier predio, y queda dicho que parte del acuerdo se apoya en que ERA5 achata la '
    + 'amplitud diaria.',
} as const;

/**
 * El aviso que acompaña a toda `Eo` calculada por Jensen-Haise.
 *
 * El sesgo va declarado **dos veces** porque los dos consumidores miran cosas
 * opuestas: una `Eo` baja de más deja más agua en el perfil y sube el índice
 * `T/Tp`, y un índice alto de más baja el `Yp` que se despeja de un corte,
 * porque `Yp = Y/índice`. Es la misma degradación con el signo dado vuelta, y
 * escribir un solo número obligaría a que uno de los dos paneles mienta.
 */
export const AVISO_EO_JENSEN_HAISE = {
  aviso:
    'La Eo del balance se calculó por Jensen-Haise modificada, que es el método con el que Wight '
    + 'y Hanks ajustaron su Kc y su b, así que el b publicado reproduce la Tp de su Tabla 1 con '
    + '+1,6 % de error medio. Los coeficientes CT y Tx salen de las normales del mes más cálido de '
    + 'la misma serie de reanálisis, que achata la oscilación diaria: eso baja la Eo, empuja el '
    + 'índice T/Tp para ARRIBA y por lo tanto el Yp despejado de un corte para ABAJO. La superficie '
    + 'de referencia del método es alfalfa y se derivó en el oeste árido de Estados Unidos.',
  /** Hacia dónde empuja al índice `T/Tp`. */
  sesgo_del_indice: 'alto' as const,
  /** Y hacia dónde empuja al `Yp`, que es el mismo error con el signo dado vuelta. */
  sesgo_del_yp: 'bajo' as const,
};
