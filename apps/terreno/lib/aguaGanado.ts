/**
 * Consumo de agua de la hacienda, en función de la categoría y de la temperatura.
 *
 * ## Qué estaba mal
 *
 * `categorias.ts` declaraba litros por cabeza y por día como si fueran una
 * constante del animal —50 para una vaca, 30 para un ternero— y esos valores no
 * tenían fuente. **No son una constante: dependen de la temperatura, y con
 * fuerza.** Entre los dos extremos de la tabla publicada (4,4 y 32,2 °C) una
 * **vaca seca se multiplica por 2,4** y un novillo en engorde por 2,37.
 *
 * La vaca con cría al pie sube menos —×1,4— y no porque tome poco, sino por algo
 * que está publicado y hay que saberlo: **entre 80 y 90 °F su consumo BAJA**,
 * porque con estrés calórico severo cae la producción de leche. Así que la que
 * manda el pico del verano es la vaca seca, no la que está criando.
 *
 * Es el mismo error que tenía el equivalente vaca, en el otro extremo de la
 * cadena, y es más grave. Una receptividad optimista sale en un informe y se
 * discute; quedarse corto en el embalse es hacienda sin beber en enero, que es
 * exactamente el mes en que el coeficiente fijo se equivoca más.
 *
 * ## La fuente
 *
 * **NASEM (2016), _Nutrient Requirements of Beef Cattle_, 8.ª edición revisada,
 * actualización 2016**, National Academies of Sciences, Engineering and Medicine.
 * La tabla que reproduce este módulo celda por celda es la que publica, adaptada,
 * NDSU Extension: Meehan, M.A., Galbreath, J., Mostrom, M. y Stokka, G.,
 * «Livestock Water Requirements», AS1763 (revisión de febrero de 2026), North
 * Dakota State University.
 * https://www.ndsu.edu/agriculture/sites/default/files/2026-02/as1783.pdf
 *
 * Las guías de consumo del NRC se remontan al trabajo original de **Winchester,
 * C.F. y Morris, M.J. (1956), «Water intake rates of cattle», _Journal of Animal
 * Science_ 15(3):722-740**, que es donde se midieron.
 *
 * El contraste por grado de temperatura sale de una segunda publicación
 * independiente: Spencer, C., Lalman, D., Rolf, M. y Richards, C. (2016),
 * «Estimating Water Requirements for Mature Beef Cows», MF3303 / ANSI-3299,
 * Kansas State University y Oklahoma State University.
 * https://bookstore.ksre.ksu.edu/pubs/estimating-water-requirements-for-mature-beef-cows_MF3303.pdf
 *
 * Esa publicación aporta tres cosas que este módulo usa:
 *   1. **Por debajo de 40 °F (4,4 °C) la temperatura no influye de forma
 *      significativa** en el consumo (NRC); por arriba, el consumo sube de forma
 *      lineal. De ahí el piso de la tabla.
 *   2. Los coeficientes por grado Fahrenheit medidos en tres trabajos distintos:
 *      **1,44 lb/°F** en vacas lecheras en lactancia (Murphy et al. 1983),
 *      **0,61 lb/°F** en toros lecheros en crecimiento (Meyer et al. 2006) y
 *      **0,50 lb/°F** en novillos de feedlot (Hicks et al. 1988), con una media
 *      de **0,85 lb/°F**. Cada uno de los tres reproduce la pendiente de una
 *      clase distinta de la tabla del NASEM, y eso está en el test: son dos
 *      publicaciones independientes que se validan entre sí.
 *   3. La advertencia que decide cómo se usa este número, abajo.
 *
 * ## Agua TOTAL, no agua de bebida. Esto importa para la represa
 *
 * La tabla publica **consumo total**, que incluye el agua que viene en el
 * alimento. La publicación de Kansas lo dice con todas las letras: *el consumo
 * de agua libre puede ser sustancialmente menor que estas estimaciones cuando la
 * vaca come alimentos con humedad considerable*. Y la humedad del forraje no es
 * un detalle: un pasto en estado vegetativo tiene 20 a 35 % de materia seca, o
 * sea **65 a 80 % de agua**.
 *
 * Este módulo devuelve el **total** a propósito, y la represa se dimensiona con
 * eso. Es la decisión conservadora y es la correcta para esta app: acequia no
 * sabe si el pasto de ese predio va a estar verde en enero, y errar para el lado
 * de la represa grande cuesta plata, mientras errar para el lado chico cuesta
 * hacienda. El descuento por humedad del forraje queda como un ajuste explícito
 * que el usuario prende —no como un supuesto escondido—, y cuando se implemente
 * va con su propia fuente.
 *
 * Nótese además que los dos efectos se suman en el peor momento: en la seca el
 * forraje está maduro (80 a 90 % de materia seca, casi sin agua) **y** hace
 * calor. El coeficiente fijo de 50 litros se equivocaba en los dos a la vez.
 *
 * ## Rango de validez
 *
 * - **Temperatura:** la tabla va de 40 a 90 °F (4,4 a 32,2 °C). Por debajo se
 *   usa la columna de 40 °F, que es lo que indica la fuente. Por encima de 32,2
 *   °C el valor se marca como extrapolado.
 * - **Peso vivo:** cada clase tiene su rango publicado (ver `SERIES`). Fuera de
 *   ese rango se usa el extremo más cercano, y si la diferencia pasa el
 *   `TOLERANCIA_PESO` se informa.
 * - **Especies:** el bovino tiene curva de temperatura. El ovino y el porcino
 *   tienen **rangos publicados sin respuesta térmica** (tablas 4 y 5 de AS1763).
 *   El equino y el caprino **no tienen fuente de consumo en este módulo** y
 *   conservan el valor declarado en `categorias.ts`, diciéndolo.
 * - No cubre vaca lechera en producción (ver la tabla 2 de AS1763, que llega a
 *   36 a 41 galones por día) ni animales en confinamiento con dieta húmeda.
 *
 * ## Quién lee esto
 *
 * `rodeo.ts` (la demanda mensual del rodeo) y por esa vía el balance de la
 * represa y la red de agua. Cambiar un número de acá cambia cuánta agua dice la
 * app que hay que guardar.
 */
import type { CategoriaAnimal } from './categorias';

/** 1 galón estadounidense, en litros. */
export const GALON_L = 3.785411784;
/** 1 libra, en kilogramos. */
export const LIBRA_KG = 0.45359237;

/** Las seis temperaturas de la tabla publicada, en °F. */
export const TEMP_TABLA_F = [40, 50, 60, 70, 80, 90] as const;

/** Las mismas, en °C, que es la unidad en la que la app conoce el clima. */
export const TEMP_TABLA_C = TEMP_TABLA_F.map(f => ((f - 32) * 5) / 9);

/**
 * Hasta qué fracción del peso publicado se acepta sin avisar. Una vaca criolla
 * de 400 kg pesa un 2 % menos que las 900 lb de la tabla: eso no es motivo de
 * advertencia. Un ternero de 100 kg contra las 400 lb mínimas sí lo es.
 */
export const TOLERANCIA_PESO = 0.1;

/**
 * Clases de la tabla publicada. `cria_promedio` no es una clase de la fuente:
 * ver `aguaAnimal`.
 */
export type ClaseAgua = 'crecimiento' | 'terminacion' | 'prenada' | 'lactando' | 'toro' | 'cria_promedio';

interface SerieAgua {
  clase:       Exclude<ClaseAgua, 'cria_promedio'>;
  pesoVivo_lb: number;
  /**
   * Galones por cabeza y por día, uno por cada temperatura de `TEMP_TABLA_F`.
   * `null` = la fuente **no publica esa celda**; se completa con `extender`.
   */
  gal: Array<number | null>;
}

/**
 * La tabla 1 de AS1763, transcrita celda por celda.
 *
 * Dos rarezas que **están en la fuente y no se corrigen**:
 *
 * 1. La vaca en lactancia **baja** de 17,9 a 16,2 galones entre 80 y 90 °F. No
 *    es un error de transcripción: bajo estrés calórico severo cae la producción
 *    de leche, y con ella el consumo. Si algún día alguien "arregla" ese número
 *    porque le parece raro, estará borrando el dato.
 * 2. El toro de 1.600 lb y el novillo en terminación de 1.000 lb tienen la misma
 *    columna, dígito por dígito. Así está publicado.
 *
 * La columna de **vaca preñada llega hasta 70 °F**: la fuente la rotula
 * «wintering», es una categoría de invierno y no publica el verano. Se extiende
 * con `extender`, abajo, y el test comprueba que el método reproduce las cuatro
 * celdas que sí están publicadas.
 */
const SERIES: SerieAgua[] = [
  { clase: 'crecimiento', pesoVivo_lb: 400,   gal: [4.0, 4.3, 5.0, 5.8, 6.7, 9.5] },
  { clase: 'crecimiento', pesoVivo_lb: 600,   gal: [5.3, 5.8, 6.6, 7.8, 8.9, 12.7] },
  { clase: 'crecimiento', pesoVivo_lb: 800,   gal: [6.3, 6.8, 7.9, 9.2, 10.6, 15.0] },
  { clase: 'terminacion', pesoVivo_lb: 600,   gal: [6.0, 6.5, 7.4, 8.7, 10.0, 14.3] },
  { clase: 'terminacion', pesoVivo_lb: 800,   gal: [7.3, 7.9, 9.1, 10.7, 12.3, 17.4] },
  { clase: 'terminacion', pesoVivo_lb: 1000,  gal: [8.7, 9.4, 10.8, 12.6, 14.5, 20.6] },
  { clase: 'prenada',     pesoVivo_lb: 900,   gal: [6.0, 6.5, 7.4, 8.7, null, null] },
  { clase: 'prenada',     pesoVivo_lb: 1100,  gal: [6.7, 7.2, 8.3, 9.7, null, null] },
  { clase: 'lactando',    pesoVivo_lb: 900,   gal: [11.4, 12.6, 14.5, 16.9, 17.9, 16.2] },
  { clase: 'toro',        pesoVivo_lb: 1400,  gal: [8.0, 8.6, 9.9, 11.7, 13.4, 19.0] },
  { clase: 'toro',        pesoVivo_lb: 1600,  gal: [8.7, 9.4, 10.8, 12.6, 14.5, 20.6] },
];

/**
 * Serie de referencia para extender una columna truncada: el novillo en
 * terminación de 1.000 lb, que está publicado en las seis temperaturas y es el
 * peso más cercano a las vacas preñadas de 900 y 1.100 lb.
 *
 * Se eligió por eso y porque **el toro de 1.400 lb da la misma forma**: la razón
 * entre 90 y 40 °F es 2,368 en uno y 2,375 en el otro, una diferencia del 0,3 %.
 * Dos series independientes de la misma tabla coinciden en la forma, así que la
 * forma es del fenómeno y no de la serie.
 */
const REFERENCIA_FORMA = SERIES.find(s => s.clase === 'terminacion' && s.pesoVivo_lb === 1000)!;

/**
 * Completa las celdas que la fuente no publica, conservando la **forma** de la
 * serie de referencia: cada celda faltante se calcula como la celda de 40 °F de
 * esta serie multiplicada por la razón que tiene la referencia entre esa
 * temperatura y sus 40 °F.
 *
 * Por qué así y no con una recta. La tabla **no es lineal en el extremo
 * caliente**: entre 80 y 90 °F el novillo en crecimiento salta de 6,7 a 9,5
 * galones, cuatro veces más pendiente que la que traía. Extender con la recta de
 * los primeros tramos subestimaría el verano, que es el lado peligroso para una
 * represa.
 *
 * La prueba de que el método sirve es que **reproduce las cuatro celdas
 * publicadas de la columna de vaca preñada con 0,1 galón de error**, sin
 * haberlas usado. Está en el test.
 */
function extender(serie: SerieAgua): number[] {
  const base = serie.gal[0];
  if (base == null) throw new Error(`La serie ${serie.clase}/${serie.pesoVivo_lb} no tiene celda de 40 °F`);
  const refBase = REFERENCIA_FORMA.gal[0]!;
  return serie.gal.map((v, i) => v ?? (base * (REFERENCIA_FORMA.gal[i]! / refBase)));
}

/** Interpolación lineal entre dos puntos, con el x acotado al tramo. */
function entre(x: number, x0: number, x1: number, y0: number, y1: number): number {
  if (x1 === x0) return y0;
  const t = Math.min(1, Math.max(0, (x - x0) / (x1 - x0)));
  return y0 + (y1 - y0) * t;
}

/** Galones por día de una serie a una temperatura dada, en °F. */
function galDeSerie(serie: SerieAgua, tempF: number): number {
  const gal = extender(serie);
  const t = Math.min(90, Math.max(40, tempF));
  for (let i = 0; i < TEMP_TABLA_F.length - 1; i++) {
    const a = TEMP_TABLA_F[i]!, b = TEMP_TABLA_F[i + 1]!;
    if (t <= b) return entre(t, a, b, gal[i]!, gal[i + 1]!);
  }
  return gal[gal.length - 1]!;
}

/** Interpola entre las series de una clase por peso vivo. */
function galDeClase(clase: Exclude<ClaseAgua, 'cria_promedio'>, pesoVivo_lb: number, tempF: number) {
  const series = SERIES.filter(s => s.clase === clase).sort((a, b) => a.pesoVivo_lb - b.pesoVivo_lb);
  const min = series[0]!, max = series[series.length - 1]!;

  const fuera = pesoVivo_lb < min.pesoVivo_lb * (1 - TOLERANCIA_PESO)
             || pesoVivo_lb > max.pesoVivo_lb * (1 + TOLERANCIA_PESO);

  if (pesoVivo_lb <= min.pesoVivo_lb) return { gal: galDeSerie(min, tempF), serie: min, fuera };
  if (pesoVivo_lb >= max.pesoVivo_lb) return { gal: galDeSerie(max, tempF), serie: max, fuera };

  for (let i = 0; i < series.length - 1; i++) {
    const a = series[i]!, b = series[i + 1]!;
    if (pesoVivo_lb <= b.pesoVivo_lb) {
      return {
        gal: entre(pesoVivo_lb, a.pesoVivo_lb, b.pesoVivo_lb, galDeSerie(a, tempF), galDeSerie(b, tempF)),
        serie: a, fuera,
      };
    }
  }
  return { gal: galDeSerie(max, tempF), serie: max, fuera };
}

/**
 * A qué clase de la tabla corresponde cada categoría de `categorias.ts`.
 *
 * `bovino_vaca_prom` es la única que no tiene clase propia en la fuente: es el
 * **promedio anual** de una vaca de cría, que la fuente del equivalente vaca
 * define como seis meses con cría al pie y seis meses seca. Por eso se calcula
 * como el promedio de las dos clases publicadas con esa misma partición mitad y
 * mitad. Es aritmética sobre celdas publicadas, no un número nuevo, y la UI lo
 * puede decir.
 */
const CLASE_POR_CATEGORIA: Record<string, Exclude<ClaseAgua, never>> = {
  bovino_vaca_prom:       'cria_promedio',
  bovino_vaca_cria:       'lactando',
  bovino_vaca_seca:       'prenada',
  bovino_vaquillona_1_2:  'crecimiento',
  bovino_vaquillona_2_3:  'crecimiento',
  bovino_ternero:         'crecimiento',
  bovino_novillito:       'crecimiento',
  bovino_novillo:         'crecimiento',
  bovino_novillo_engorde: 'terminacion',
  bovino_toro:            'toro',
};

/**
 * Rangos publicados para las especies que la fuente da como rango y no como
 * curva: tablas 4 (ovinos) y 5 (porcinos) de AS1763, en galones por día.
 *
 * **Advertencia de rango de validez que hay que mirar:** las bandas de peso de la
 * tabla de ovinos son de majada estadounidense —la oveja preñada arranca en 175
 * lb, o sea 79 kg— y una Corriedale o una Merino argentina pesa 50 a 60 kg. Para
 * un animal más liviano el valor real está en el extremo bajo del rango. Por eso
 * se informa el rango completo y no sólo un número.
 */
const RANGOS_GAL: Record<string, { clase: string; min: number; max: number }> = {
  ovino_oveja:   { clase: 'oveja preñada',      min: 1.0, max: 2.0 },
  ovino_borrego: { clase: 'borrego de engorde', min: 1.0, max: 1.5 },
  ovino_carnero: { clase: 'carnero',            min: 1.0, max: 2.0 },
  porcino:       { clase: 'cerda gestante',     min: 3.0, max: 6.0 },
};

export const FUENTE_TABLA =
  'NASEM (2016), Nutrient Requirements of Beef Cattle, 8.ª ed. rev., tabla reproducida en '
  + 'Meehan et al., «Livestock Water Requirements», NDSU Extension AS1763 (2026). '
  + 'Las guías del NRC provienen de Winchester y Morris (1956), J. Anim. Sci. 15(3):722-740.';

export const FUENTE_RANGOS =
  'Meehan et al., «Livestock Water Requirements», NDSU Extension AS1763 (2026), tablas 4 y 5.';

/** De dónde salió el número, para que la UI pueda decirlo sin adivinar. */
export type OrigenAgua =
  | { tipo: 'tabla'; clase: ClaseAgua; serie_lb: number; extrapoladoPorCalor: boolean; pesoFueraDeTabla: boolean }
  | { tipo: 'rango'; clase: string; min_l_dia: number; max_l_dia: number }
  | { tipo: 'declarado' };

export interface AguaAnimal {
  /** Litros por cabeza y por día de agua **total** (bebida más la del alimento). */
  total_l_dia: number;
  origen:      OrigenAgua;
  /** La publicación que lo sostiene. Vacío cuando el origen es `declarado`. */
  fuente:      string;
}

/**
 * Agua total por cabeza y por día de una categoría, a una temperatura media.
 *
 * `tempC` es la **temperatura media diaria del mes**, que es lo que la tabla
 * usa. No la máxima: con la máxima el número sale alto todo el año.
 */
export function aguaAnimal(cat: CategoriaAnimal, tempC: number): AguaAnimal {
  const tempF = (tempC * 9) / 5 + 32;
  const pesoVivo_lb = cat.pesoVivo_kg / LIBRA_KG;

  const clase = CLASE_POR_CATEGORIA[cat.id];
  if (clase) {
    const extrapoladoPorCalor = tempC > 32.3;
    if (clase === 'cria_promedio') {
      // Mitad del año con cría al pie y mitad seca, que es la partición con la
      // que la fuente del equivalente vaca define el promedio anual.
      const lact = galDeClase('lactando', pesoVivo_lb, tempF);
      const pren = galDeClase('prenada',  pesoVivo_lb, tempF);
      return {
        total_l_dia: redondear((lact.gal + pren.gal) / 2 * GALON_L),
        origen: {
          tipo: 'tabla', clase, serie_lb: 900, extrapoladoPorCalor,
          pesoFueraDeTabla: lact.fuera || pren.fuera,
        },
        fuente: FUENTE_TABLA,
      };
    }
    const r = galDeClase(clase, pesoVivo_lb, tempF);
    return {
      total_l_dia: redondear(r.gal * GALON_L),
      origen: { tipo: 'tabla', clase, serie_lb: r.serie.pesoVivo_lb, extrapoladoPorCalor, pesoFueraDeTabla: r.fuera },
      fuente: FUENTE_TABLA,
    };
  }

  const rango = RANGOS_GAL[cat.id];
  if (rango) {
    // Se toma el extremo ALTO del rango publicado. La fuente no da respuesta
    // térmica para estas especies, así que no hay forma de subir el número en
    // verano: quedarse en el medio del rango sería dimensionar la represa con un
    // valor que la fuente ya dice que puede ser mayor.
    return {
      total_l_dia: redondear(rango.max * GALON_L),
      origen: { tipo: 'rango', clase: rango.clase, min_l_dia: redondear(rango.min * GALON_L), max_l_dia: redondear(rango.max * GALON_L) },
      fuente: FUENTE_RANGOS,
    };
  }

  // Equinos y caprinos: sin fuente de consumo en este módulo. Se conserva lo
  // declarado y se dice que es declarado, que es la regla del silencio.
  return { total_l_dia: cat.agua_l_dia, origen: { tipo: 'declarado' }, fuente: '' };
}

function redondear(l: number): number {
  return Math.round(l * 10) / 10;
}

/**
 * Cuánto se multiplica el consumo de una categoría entre los dos extremos de la
 * tabla. Es el número que explica de un saludo por qué un litraje fijo no sirve.
 * `null` para las categorías que no responden a la temperatura.
 */
export function factorTermico(cat: CategoriaAnimal): number | null {
  const frio = aguaAnimal(cat, TEMP_TABLA_C[0]!);
  if (frio.origen.tipo !== 'tabla') return null;
  const calor = aguaAnimal(cat, TEMP_TABLA_C[TEMP_TABLA_C.length - 1]!);
  return frio.total_l_dia > 0 ? Math.round((calor.total_l_dia / frio.total_l_dia) * 100) / 100 : null;
}

/** `true` si la categoría tiene curva de temperatura publicada. */
export function respondeALaTemperatura(cat: CategoriaAnimal): boolean {
  return cat.id in CLASE_POR_CATEGORIA;
}
