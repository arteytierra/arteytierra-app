/**
 * El balance hídrico diario de Wight y Hanks (1981), y la fracción que devuelve.
 *
 * ## Qué calcula, y qué deliberadamente no
 *
 * Devuelve **`T/Tp`**, un índice de suficiencia hídrica del forraje: cuánto de
 * la transpiración que el pastizal habría tenido con agua no limitante llegó a
 * ocurrir de verdad. Es una fracción adimensional entre 0 y 1.
 *
 * **No devuelve kg/ha.** El kilo sale de la ecuación 1 del trabajo,
 * `Y = Yp · T/Tp`, y `Yp` —el rendimiento potencial del sitio— no sale de este
 * modelo: el artículo es explícito en que incluye composición de especies y
 * fertilidad, que se estima con producción medida del lugar, y que entre sus dos
 * sitios de prueba difiere 2,1 veces (1.300 kg/ha en Sidney, Montana; 2.760 en
 * Mandan, North Dakota). Multiplicar esta fracción por un `Yp` inventado es
 * exactamente cómo acequia imprimiría un número plausible y equivocado, así que
 * la multiplicación no está en este archivo. Ver `rendimientoWightHanks` en
 * `forrajeMedido.ts`, que la hace cuando alguien trae un `Yp` con fuente.
 *
 * ## La fuente
 *
 * Wight, J. R., y Hanks, R. J. (1981). «A water-balance, climate model for
 * range herbage production». *Journal of Range Management* 34(4):307-311.
 * DOI `10.2307/3897857`, handle `10150/646128`. Deriva de Hanks (1974),
 * *Agron. J.* 66:660-665, y de Rasmussen y Hanks (1978), *Agron. J.*
 * 70:940-944. La reconstrucción ecuación por ecuación, con el OCR del que salió
 * y la vía por la que el repositorio la entregó, está en
 * `_research/WIGHT_HANKS_1981.md`.
 *
 * Las ecuaciones:
 *
 * ```
 * [1]  Y = Yp · (T / Tp)                               ← no está acá, ver arriba
 * [2]  Tp = b · Kc · Eo                 b = 0,5 × LAI relativo de la fecha
 * [3]  T  = Tp · (SWS/AW) / c           si SWS/AW ≤ c
 * [4]  T  = Tp                          si SWS/AW > c
 * [6]  E  = Ep · t^(−1/2)               t = días desde que la superficie se mojó
 * [7]  Ep = Kc · Eo − Tp
 * ```
 *
 * ## Unidades
 *
 * Todo el agua en **milímetros**: `pptn_mm`, `eo_mm`, `aw_mm`, `sws_mm`. Los
 * espesores de capa en centímetros. El tiempo en días. `b`, `kc`, `c` y el
 * índice son adimensionales. No hay ninguna conversión implícita adentro.
 *
 * ## Rango de validez
 *
 * Calibrado en **pradera mixta del norte de las Grandes Planicies**: Sidney,
 * Montana —sitio arenoso de planicie glaciada— y Mandan, North Dakota.
 * Estación de crecimiento del 15 de abril al pico de materia en pie, de 68 a 99
 * días en los doce años de la prueba. El artículo asume **escurrimiento nulo**
 * («In this study, we assumed there was no runoff»), que es lo que este balance
 * hace también mientras no se le declare un `cn_arc_ii`: ver abajo. Perfil de
 * 90 cm en tres capas de 30, que el artículo dice que se pueden repartir por
 * horizonte o por raíces cuando hay dato.
 *
 * Afuera de eso el modelo corre igual, y por eso cada supuesto que no se pudo
 * traer sale como una advertencia en el resultado. Están nombradas una por una
 * en `ADVERTENCIAS`.
 *
 * **Y una de ellas puede empujar para el otro lado**, así que no alcanza con
 * leer la lista: hasta el 10/11/2026 todas las degradaciones de este archivo
 * empujaban el índice **para arriba**, o sea hacia la respuesta optimista, que
 * para dimensionar una carga animal es la cara. El escurrimiento no: cuando
 * corre, el índice sale **bajo**, porque el método escurre de más. Cada
 * advertencia dice su dirección con la palabra en mayúsculas.
 *
 * ## El escurrimiento, que es opcional y por qué
 *
 * Si se declara `cn_arc_ii` —el número de curva del predio en condición de
 * humedad antecedente media—, cada día se le resta a la lluvia el escurrimiento
 * de la curva número con la retención ligada al agua que el perfil tiene ese
 * día. No es una idea nuestra: es lo que hizo el propio Wight en `ERHYM-II`
 * (USDA-ARS ARS-59, 1987), que es este mismo balance convertido en modelo de
 * pastizal. Las ecuaciones, las fuentes y la cota medida del error están en
 * `escurrimientoForraje.ts`. Sin `cn_arc_ii` el escurrimiento es cero, como en
 * el trabajo original, y el resultado lo advierte.
 *
 * ## El caso resuelto
 *
 * La Tabla 1 del trabajo publica `Kc·Eo`, `Tp`, `T`, `ET` y drenaje de doce
 * años, y eso permite tres pruebas distintas, las tres en
 * `tests/unit/economia/forrajeBalance.test.ts`:
 *
 * 1. **El `b` medio sale de la tabla.** `Tp/(Kc·Eo)` es, por la ecuación 2, el
 *    `b` de la estación promediado y ponderado por `Eo`. Los doce años dan
 *    0,435 con un desvío de 0,014 — ver `B_PRADERA_MIXTA`.
 * 2. **Con ese `b` constante el balance reproduce la columna `Tp`** dentro del
 *    5 % en once de los doce años.
 * 3. **La tabla cierra su propio balance de agua.** `P − ET − drenaje` es el
 *    cambio de almacenaje de la temporada, y en los doce años va de −62 a
 *    +34 mm: cabe en un perfil arenoso de 90 cm y no lo desborda.
 *
 * La columna `T` **no se puede reproducir** y conviene decirlo fuerte: haría
 * falta la lluvia diaria de Sidney de 1967 a 1978, que el artículo no publica.
 * Lo que sí se verifica de `T` es la conservación —el agua que entra sale o se
 * queda, al milímetro— y las cotas físicas: `T ≤ Tp`, y el índice en [0, 1].
 *
 * ## Qué se rompe si cambia
 *
 * Hoy, nada: ningún panel y ningún informe leen este archivo todavía.
 * `prodForrajera` —la escalera de cinco escalones sin fuente, en
 * `produccion.ts` con copias en `pastoreo.ts` y en el panel de Cobertura—
 * sigue siendo la que decide la oferta de pasto. **El reemplazo necesita además
 * una fuente para `Yp`**, y hasta que exista desconectar la escalera dejaría a
 * la cadena ganadera sin kilos. El orden está escrito en
 * `_research/WIGHT_HANKS_1981.md`: primero esta fracción, después `Yp`, y
 * recién entonces la escalera.
 */
import {
  escurrimientoDelDiaMm,
  retencionDelDiaMm,
  retencionMaximaMm,
  cnSeco,
} from './escurrimientoForraje';

/**
 * El `b` medio de la temporada en pradera mixta, derivado de la Tabla 1.
 *
 * El trabajo publica la curva estacional de LAI relativo como **figura**
 * (Figura 2, calculada de Hanson 1973): no hay tabla de puntos ni ecuación, y
 * encima los autores piden construir una curva propia de la región donde se
 * aplique el modelo. Así que la curva no se puede copiar.
 *
 * Lo que sí se puede es despejarla. Por la ecuación 2, `Tp = b · Kc · Eo`, el
 * cociente `Tp/(Kc·Eo)` de cada año **es el `b` de la temporada promediado y
 * ponderado por `Eo`**, y las dos columnas están publicadas. Los doce años de
 * Sidney dan:
 *
 * ```
 * 1967 0,449   1970 0,447   1973 0,442   1976 0,441
 * 1968 0,424   1971 0,441   1974 0,429   1977 0,399
 * 1969 0,421   1972 0,444   1975 0,445   1978 0,438
 * ```
 *
 * Media **0,435**, desvío 0,014, y once de los doce entre 0,42 y 0,45. El año
 * que se despega es 1977, y no es ruido: es la temporada **más corta de la
 * serie, 68 días contra 86-99 de las otras**, en el año más seco. Un promedio
 * de temporada falla justo donde la temporada se cortó antes de que el dosel
 * llegara a su máximo, que es la limitación de usar una constante en vez de la
 * curva.
 *
 * Como `b = 0,5 × LAI relativo`, esto dice que el LAI relativo medio de la
 * temporada en Sidney fue de **0,87**.
 *
 * **Rango de validez: pradera mixta del norte de las Grandes Planicies.** Usar
 * este número en el Chaco, en el miombo o en el altiplano es extrapolar, y el
 * balance lo avisa cuando lo usa por defecto.
 */
export const B_PRADERA_MIXTA = {
  valor: 0.435,
  es: 'b = 0,5 × LAI relativo, promediado sobre la temporada y ponderado por Eo',
  derivado_de: 'Tp/(Kc·Eo) de los doce años de la Tabla 1, Wight y Hanks (1981)',
  sitio: 'Sidney, Montana — pradera mixta, sitio arenoso de planicie glaciada',
  desvio: 0.0138,
  minimo: 0.3992,
  maximo: 0.4489,
  /** El año que se despega, y por qué. */
  excepcion: { anio: 1977, b: 0.3992, dias: 68, por_que: 'la temporada más corta de la serie' },
  /** Lo que implica sobre el LAI relativo, que es lo que la figura graficaba. */
  lai_relativo_medio: 0.87,
} as const;

/** Lo que el modelo no pudo traer, con la dirección del error de cada hueco. */
export const ADVERTENCIAS = {
  b_por_defecto:
    'El b (0,5 × LAI relativo) salió del promedio de temporada de Sidney, Montana, '
    + 'porque la curva del trabajo es una figura y sus autores piden construir una propia '
    + 'por región. Fuera de pradera mixta templada es extrapolación.',
  sin_actividad_radicular:
    'No se aplicó el factor de actividad radicular por temperatura de suelo, que el '
    + 'trabajo usa en las capas de 30-60 y 60-90 cm. Sin él esas capas entregan agua que '
    + 'en suelo frío no entregarían: el índice sale ALTO.',
  sin_agua_bajo_el_limite:
    'No se declaró cuánta agua puede sacar la evaporación por debajo del límite inferior '
    + 'en la capa superficial. Sin eso el suelo se seca menos, la lluvia siguiente no tiene '
    + 'que reponer ese déficit y el índice sale ALTO.',
  escorrentia_nula:
    'El modelo asume escurrimiento nulo, como la prueba original. En pendiente, con suelo '
    + 'sellado o con lluvias intensas parte de esa lluvia no entra al perfil: el índice sale ALTO.',
  escorrentia_por_curva_numero:
    'El escurrimiento salió de la curva número con la retención ligada al agua del perfil, '
    + 'como en ERHYM-II. El manual de la NRCS dice que ese no es el uso previsto del método y '
    + 'la única evaluación independiente midió que escurre dos a tres veces de más en pastizal '
    + 'semiárido, así que esta vez el índice sale BAJO. Ver escurrimientoForraje.ts.',
  cn_sin_retencion:
    'El CN declarado no deja una retención definida —en 0 es infinita y en 100 es cero—, así '
    + 'que el escurrimiento quedó en cero y el índice sale ALTO.',
  temporada_fuera_de_rango:
    'La temporada queda fuera de los 68 a 99 días de la validación.',
  sws_inicial_recortado:
    'Una capa arrancó con más agua útil que su capacidad de almacenaje y se recortó al tope.',
  eo_fuera_de_rango:
    'La Eo media diaria queda fuera de los 3,5 a 4,2 mm/día que se deducen de la Tabla 1.',
} as const;

/**
 * La Eo media diaria de la prueba, deducida de la Tabla 1 dividiendo `Kc·Eo` por
 * `Kc` y por los días de temporada.
 *
 * Los doce años caen entre **3,53 mm/día (1968) y 4,20 (1977)**, y el
 * envolvente se redondea para afuera. Es angosto porque son doce años del mismo
 * sitio: sirve para avisar que una Eo de 12 mm/día no es el clima donde este
 * modelo se calibró, no para rechazar nada.
 */
export const EO_DIARIA_DE_LA_PRUEBA = {
  minimo_mm: 3.5,
  maximo_mm: 4.3,
  medido: { minimo_mm: 3.53, anio_minimo: 1968, maximo_mm: 4.2, anio_maximo: 1977 },
} as const;

/** Los días de temporada de los doce años de la validación. */
export const TEMPORADA_DE_LA_PRUEBA = { minimo_dias: 68, maximo_dias: 99 } as const;

/** Una capa del perfil. El agua se mide **sobre el límite inferior de disponibilidad**. */
export interface CapaDeSuelo {
  /** Espesor, en cm. En la prueba fueron tres de 30. */
  espesor_cm: number;
  /** `AW`: capacidad de almacenaje de agua útil de la capa, en mm. */
  aw_mm: number;
  /** `SWS` al arranque de la temporada, en mm. Se recorta a `aw_mm`. */
  sws_inicial_mm: number;
  /**
   * Cuánta agua, en mm, puede sacar la evaporación de esta capa **por debajo**
   * del límite inferior, hasta el contenido de suelo seco al aire. Sólo tiene
   * sentido en la capa superficial: el trabajo acota la evaporación del suelo a
   * esa agua. Si no se declara, se asume 0 y el resultado lo advierte.
   */
  agua_bajo_el_limite_mm?: number;
  /**
   * Factor de actividad radicular de la capa, 0 a 1, función de la temperatura
   * del suelo (Figura 1 del trabajo, aproximada de de Jong 1974). El trabajo lo
   * aplica a la segunda y la tercera capa y asume que la temperatura no limita
   * la superficial. Si no se declara se asume 1 y el resultado lo advierte.
   */
  actividad_radicular?: number;
}

/** Un día de entrada del balance. */
export interface DiaDeBalance {
  /** Precipitación del día, en mm. */
  pptn_mm: number;
  /**
   * `Eo`, evaporación de una superficie de agua libre, en mm. El trabajo la
   * calculó por Jensen-Haise (1963) y dice que promedios de hasta diez días
   * resultaron satisfactorios.
   */
  eo_mm: number;
  /** `b` del día, si se tiene la curva de la región. Si falta, se usa el constante. */
  b?: number;
  /**
   * El factor de actividad radicular **de cada capa, ese día**, 0 a 1. Un
   * elemento por capa, de la superficie hacia abajo.
   *
   * Es la Figura 1 del trabajo evaluada con la temperatura del suelo del día:
   * ver `apps/terreno/lib/actividadRadicular.ts`. Los autores la aplican a la
   * segunda y la tercera capa y asumen que la temperatura no restringe la
   * superficial, así que lo normal es que el primer elemento sea 1.
   *
   * Si el día no lo trae se usa el de la capa (`CapaDeSuelo.actividad_radicular`),
   * y si tampoco está, 1 y una advertencia. **Un factor constante no es lo
   * mismo**: la temperatura del suelo de abril a septiembre recorre casi toda la
   * curva, que entre 5 y 17 °C va de 0,11 a 1.
   */
  actividad_radicular?: readonly number[];
}

export interface EntradasBalanceForraje {
  dias: readonly DiaDeBalance[];
  /** De la superficie hacia abajo. */
  capas: readonly CapaDeSuelo[];
  /** Coeficiente de cultivo. 0,85 en la prueba, constante toda la temporada. */
  kc?: number;
  /** El umbral de la ecuación 3. 1,0 en la prueba; trigo 0,5; pastizal nativo 0,7. */
  c?: number;
  /** `b` constante, si no viene día por día. Por defecto `B_PRADERA_MIXTA`. */
  b_constante?: number;
  /**
   * Cuánta lluvia hace falta para que la superficie cuente como mojada y el
   * reloj de la ecuación 6 vuelva a empezar, en mm.
   *
   * **El trabajo no fija este umbral**, así que el valor es una decisión
   * nuestra y queda acá a la vista. Por defecto 0: cualquier lluvia reinicia el
   * reloj, que es la lectura literal de «tiempo desde que la superficie se mojó
   * por última vez» y la que más evaporación produce.
   */
  umbral_mojado_mm?: number;
  /**
   * El número de curva del predio en condición de humedad antecedente **media**
   * (ARC II), que es lo que publican las tablas de cobertura y lo que tiene
   * `COBERTURAS` en `cuenca.ts`.
   *
   * Si viene, el balance resta el escurrimiento de cada día por las ecuaciones de
   * `escurrimientoForraje.ts`. Si no viene, el escurrimiento es **cero**, como en
   * el trabajo original, y el resultado lo advierte.
   *
   * **Las dos rutas que después se multiplican tienen que correr con el mismo
   * valor.** El `Yp` se despeja dividiendo por el índice, así que con
   * escurrimiento el índice sale bajo y el `Yp` alto; si una ruta escurre y la
   * otra no, el producto sale mal sin que nada se rompa.
   */
  cn_arc_ii?: number;
}

/** Un día del balance, ya corrido. Todo en mm. */
export interface DiaCorrido {
  dia: number;
  pptn_mm: number;
  tp_mm: number;
  t_mm: number;
  e_suelo_mm: number;
  drenaje_mm: number;
  /** Lo que escurrió antes de entrar al perfil, en mm. Cero sin `cn_arc_ii`. */
  escurrimiento_mm: number;
  /** La retención potencial `S` de ese día, en mm, o `null` si no hubo CN. */
  retencion_mm: number | null;
  /** Días desde el último mojado, el `t` de la ecuación 6. */
  dias_secos: number;
  /** `SWS` de cada capa al cierre del día. */
  sws_mm: readonly number[];
}

export interface ResultadoBalanceForraje {
  /** Transpiración potencial acumulada, mm. La columna `Tp` de la Tabla 1. */
  tp_mm: number;
  /** Transpiración real acumulada, mm. La columna `T`. */
  t_mm: number;
  /**
   * `T/Tp`, el índice de suficiencia hídrica. `null` cuando `Tp` es cero: sin
   * demanda no hay cociente, y un cero ahí sería una división por cero
   * disfrazada de sequía total.
   */
  indice: number | null;
  /** Evaporación del suelo acumulada, mm. */
  e_suelo_mm: number;
  /** `T + E`, la columna `ET` de la Tabla 1. */
  et_mm: number;
  drenaje_mm: number;
  /**
   * Escurrimiento acumulado, mm. Cero cuando no se declaró `cn_arc_ii`, que es
   * el supuesto del trabajo original.
   */
  escurrimiento_mm: number;
  pptn_mm: number;
  almacenaje_inicial_mm: number;
  almacenaje_final_mm: number;
  /**
   * El residuo de la conservación: `P + S₀ − (ET + drenaje + escurrimiento + S₁)`.
   * Tiene que
   * ser cero salvo el error de punto flotante. Si no lo es, el balance pierde
   * agua y el índice no vale nada.
   */
  cierre_mm: number;
  dias: number;
  advertencias: string[];
  serie: DiaCorrido[];
}

/**
 * Corre el balance día por día y devuelve `T/Tp`.
 *
 * El orden de cada día es el del trabajo: primero entra la lluvia y se reparte
 * de la superficie hacia abajo —lo que pasa la capacidad de la última capa es
 * drenaje—, después se extrae la transpiración capa por capa desde arriba, y al
 * final la evaporación del suelo sale sólo de la capa superficial.
 *
 * La transpiración de la capa `i` es la ecuación 3 aplicada con el `Tp` del día
 * entero y la humedad relativa de **esa** capa, acotada por dos cosas: el agua
 * que la capa tiene, y la demanda que las capas de arriba dejaron sin
 * satisfacer. Así se cumple lo que dice el texto, que la demanda completa pasa
 * a la capa siguiente pero la extracción total no puede exceder `Tp`.
 *
 * Devuelve `null` si no hay días o si alguna capa no tiene capacidad de
 * almacenaje: una capa con `AW` en cero no tiene cociente de humedad, y
 * devolver cero diría «no hay agua» cuando lo que no hay es capa.
 */
export function correrBalanceForraje(
  e: EntradasBalanceForraje,
): ResultadoBalanceForraje | null {
  if (e.dias.length === 0 || e.capas.length === 0) return null;
  if (e.capas.some(c => c.aw_mm <= 0)) return null;

  const kc = e.kc ?? 0.85;
  const c = e.c ?? 1.0;
  const bConstante = e.b_constante ?? B_PRADERA_MIXTA.valor;
  const umbralMojado = e.umbral_mojado_mm ?? 0;

  const advertencias: string[] = [];
  // El factor puede venir por capa (constante) o día por día. Falta sólo si no
  // llegó por ninguna de las dos vías en alguna capa por debajo de la primera.
  const faltaActividad = e.capas.length > 1 && e.capas.some(
    (cp, j) => j > 0 && cp.actividad_radicular === undefined
      && e.dias.some(d => d.actividad_radicular?.[j] === undefined),
  );
  if (faltaActividad) advertencias.push(ADVERTENCIAS.sin_actividad_radicular);
  if (e.capas[0]!.agua_bajo_el_limite_mm === undefined) {
    advertencias.push(ADVERTENCIAS.sin_agua_bajo_el_limite);
  }
  if (e.dias.some(d => d.b === undefined)) advertencias.push(ADVERTENCIAS.b_por_defecto);
  // El escurrimiento del día, si el llamador declaró un CN. `Smx` se calcula una
  // sola vez —es del sitio, no del día— y lo que cambia día a día es la fracción
  // de llenado del perfil, por la ecuación 11.
  const cnI = e.cn_arc_ii === undefined ? null : cnSeco(e.cn_arc_ii);
  const smx = cnI === null ? null : retencionMaximaMm(cnI);
  if (e.cn_arc_ii === undefined) advertencias.push(ADVERTENCIAS.escorrentia_nula);
  else if (smx === null) advertencias.push(ADVERTENCIAS.cn_sin_retencion);
  else advertencias.push(ADVERTENCIAS.escorrentia_por_curva_numero);
  if (e.dias.length < TEMPORADA_DE_LA_PRUEBA.minimo_dias
    || e.dias.length > TEMPORADA_DE_LA_PRUEBA.maximo_dias) {
    advertencias.push(ADVERTENCIAS.temporada_fuera_de_rango);
  }
  const eoMedia = e.dias.reduce((s, d) => s + d.eo_mm, 0) / e.dias.length;
  if (eoMedia < EO_DIARIA_DE_LA_PRUEBA.minimo_mm || eoMedia > EO_DIARIA_DE_LA_PRUEBA.maximo_mm) {
    advertencias.push(ADVERTENCIAS.eo_fuera_de_rango);
  }

  // El agua de cada capa, medida sobre el límite inferior. La superficial puede
  // bajar de cero hasta el contenido de aire seco; las otras no.
  const sws = e.capas.map(cp => Math.min(cp.sws_inicial_mm, cp.aw_mm));
  if (e.capas.some(cp => cp.sws_inicial_mm > cp.aw_mm)) {
    advertencias.push(ADVERTENCIAS.sws_inicial_recortado);
  }
  const almacenajeInicial = sws.reduce((s, x) => s + x, 0);
  // `UL` de la ecuación 11: la capacidad de agua útil del perfil entero.
  const ulTotal = e.capas.reduce((s, cp) => s + cp.aw_mm, 0);
  const pisoSuperficial = -(e.capas[0]!.agua_bajo_el_limite_mm ?? 0);

  let tpTotal = 0;
  let tTotal = 0;
  let eTotal = 0;
  let drenajeTotal = 0;
  let escurrimientoTotal = 0;
  let pptnTotal = 0;
  // El reloj de la ecuación 6. Arranca en 0 para que el primer día de la
  // temporada cuente como t = 1 y evapore la Ep entera: el trabajo no dice con
  // qué valor arranca, así que ésta es una decisión nuestra y queda a la vista.
  let diasSecos = 0;
  const serie: DiaCorrido[] = [];

  for (let i = 0; i < e.dias.length; i += 1) {
    const d = e.dias[i]!;
    const b = d.b ?? bConstante;
    const kcEo = kc * d.eo_mm;
    const tpDia = b * kcEo;                                   // [2]

    // Lo que escurre no entra al perfil. La retención se evalúa con el agua que
    // el perfil tiene **antes** de la lluvia del día, que es lo que hace un
    // modelo de paso diario, y el agua de la capa superficial se recorta en cero
    // porque puede estar por debajo del límite inferior.
    const retencion = smx === null
      ? null
      : retencionDelDiaMm(smx, sws.reduce((x, y) => x + Math.max(0, y), 0), ulTotal);
    const escDia = retencion === null ? 0 : escurrimientoDelDiaMm(d.pptn_mm, retencion);

    // La lluvia que quedó entra por arriba y cae en cascada.
    let sobrante = d.pptn_mm - escDia;
    for (let j = 0; j < sws.length && sobrante > 0; j += 1) {
      const hueco = e.capas[j]!.aw_mm - sws[j]!;
      const entra = Math.min(hueco, sobrante);
      sws[j] = sws[j]! + entra;
      sobrante -= entra;
    }
    const drenajeDia = sobrante;
    // El reloj de la ecuación 6 mira **la lluvia**, no la que infiltró: la
    // superficie se moja igual aunque después el agua escurra.
    diasSecos = d.pptn_mm > umbralMojado ? 1 : diasSecos + 1;

    // La transpiración sale capa por capa desde arriba.
    let tDia = 0;
    for (let j = 0; j < sws.length; j += 1) {
      const restante = tpDia - tDia;
      if (restante <= 0) break;
      const cp = e.capas[j]!;
      const disponible = Math.max(0, sws[j]!);
      const frac = Math.min(disponible / cp.aw_mm, c) / c;    // [3] y [4]
      const actividad = d.actividad_radicular?.[j] ?? cp.actividad_radicular ?? 1;
      const pedido = tpDia * frac * actividad;
      const sale = Math.min(pedido, restante, disponible);
      sws[j] = sws[j]! - sale;
      tDia += sale;
    }

    // La evaporación del suelo sale sólo de la capa superficial, y puede bajar
    // del límite inferior hasta el contenido de aire seco.
    const ep = Math.max(0, kcEo - tpDia);                     // [7]
    const demandaE = ep / Math.sqrt(diasSecos);               // [6]
    const eDia = Math.min(demandaE, Math.max(0, sws[0]! - pisoSuperficial));
    sws[0] = sws[0]! - eDia;

    tpTotal += tpDia;
    tTotal += tDia;
    eTotal += eDia;
    drenajeTotal += drenajeDia;
    escurrimientoTotal += escDia;
    pptnTotal += d.pptn_mm;
    serie.push({
      dia: i + 1,
      pptn_mm: d.pptn_mm,
      tp_mm: tpDia,
      t_mm: tDia,
      e_suelo_mm: eDia,
      drenaje_mm: drenajeDia,
      escurrimiento_mm: escDia,
      retencion_mm: retencion,
      dias_secos: diasSecos,
      sws_mm: [...sws],
    });
  }

  const almacenajeFinal = sws.reduce((s, x) => s + x, 0);
  const etTotal = tTotal + eTotal;

  return {
    tp_mm: tpTotal,
    t_mm: tTotal,
    indice: tpTotal > 0 ? tTotal / tpTotal : null,
    e_suelo_mm: eTotal,
    et_mm: etTotal,
    drenaje_mm: drenajeTotal,
    escurrimiento_mm: escurrimientoTotal,
    pptn_mm: pptnTotal,
    almacenaje_inicial_mm: almacenajeInicial,
    almacenaje_final_mm: almacenajeFinal,
    cierre_mm: pptnTotal + almacenajeInicial
      - (etTotal + drenajeTotal + escurrimientoTotal + almacenajeFinal),
    dias: e.dias.length,
    advertencias,
    serie,
  };
}

/**
 * Las tres capas de 30 cm de la prueba, armadas desde el agua útil del perfil.
 *
 * El trabajo no publica el `AW` de Sidney por capa, así que esto **no es el
 * perfil de Sidney**: es el reparto que el artículo usó como geometría —tres
 * capas de 30 cm, elegidas para poder comparar contra mediciones neutrónicas
 * hechas a esos incrementos— con el agua útil repartida en partes iguales.
 *
 * Existe para que un llamador que sólo tiene el agua útil total del perfil
 * —que es lo que SoilGrids y HWSD entregan— pueda correr el balance sin
 * inventarse un reparto por capa. Cuando la ficha declara el reparto, se usa
 * ése: el artículo dice explícitamente que las capas se pueden asignar por
 * horizonte o por distribución de raíces cuando hay dato.
 */
export function tresCapasDe30(
  aw_total_mm: number,
  fraccion_inicial = 1,
  agua_bajo_el_limite_mm?: number,
): CapaDeSuelo[] {
  const aw = aw_total_mm / 3;
  const sws = aw * Math.max(0, Math.min(1, fraccion_inicial));
  return [
    { espesor_cm: 30, aw_mm: aw, sws_inicial_mm: sws, agua_bajo_el_limite_mm },
    { espesor_cm: 30, aw_mm: aw, sws_inicial_mm: sws },
    { espesor_cm: 30, aw_mm: aw, sws_inicial_mm: sws },
  ];
}
