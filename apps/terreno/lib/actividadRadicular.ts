/**
 * El factor de actividad radicular por temperatura de suelo, que es la pieza
 * del modelo de Wight y Hanks que faltaba.
 *
 * ## Por qué existe este archivo
 *
 * `forrajeBalance.ts` corría sin él y lo declaraba en
 * `ADVERTENCIAS.sin_actividad_radicular`: sin el factor, las capas de 30-60 y
 * 60-90 cm entregan agua que en suelo frío no entregarían, y el índice `T/Tp`
 * sale alto. Era una de las tres degradaciones declaradas que empujan para el
 * mismo lado, y **la única que tenía una curva publicada esperando**.
 *
 * El 08/11/2026, al poner la `Eo` del método del trabajo, quedó medido por
 * primera vez cuánto lee alto la cadena contra los doce índices que la Tabla 1
 * publica: sesgo **+0,16** y techo —índice ≥ 0,99— en **10 de 12** temporadas,
 * contra valores publicados que van de 0,40 a 0,98. Ese número es lo que
 * convierte este factor en algo comprobable y no en prolijidad.
 *
 * ## La fuente, y el hallazgo que la hizo usable
 *
 * Wight, J. R., y Hanks, R. J. (1981). «A water-balance, climate model for
 * range herbage production». *J. Range Management* 34(4):307-311, **Figura 1**,
 * página 308: *«Relationship between relative root activity and soil
 * temperature (approximated from data of de Jong 1974)»*.
 *
 * La fuente de origen —**de Jong, E. (1974). "Modelling. VII. Soil water
 * simulation models". Tech. Rep. No. 61, IBP, Matador Project**, literatura gris
 * canadiense de 1974— no está digitalizada y no se consiguió. **No hizo falta:
 * la Figura 1 trae su propia ecuación impresa adentro del recuadro**, que es
 * exactamente el caso en que una figura sí se puede copiar.
 *
 * Y de paso quedó corregida una cita que estaba mal en nuestra propia acta: los
 * dos «de Jong» del trabajo son personas distintas y aportan cosas distintas.
 * **E. de Jong (1974)** es de dónde sale la relación actividad-temperatura de la
 * Figura 1. **R. de Jong (1978)**, «Energy and the Forage Crop», Agriculture
 * Canada, Swift Current, es de dónde salen las curvas de temperatura de suelo
 * que el trabajo combinó con la Figura 1 para dibujar la Figura 3.
 *
 * ```
 * Y = 0,0408 · e^(0,19·T)        T en °C, Y fracción (el eje está en %)
 * ```
 *
 * El eje va de 0 a 18 °C y de 0 a 100 %; la curva toca el 100 % y se corta
 * contra el borde superior del recuadro en **T = 16,84 °C**, que es exactamente
 * donde la ecuación da 1. Arriba de eso **se satura en 1**: la figura no dibuja
 * nada por encima del 100 % y una actividad relativa mayor que 1 no significa
 * nada.
 *
 * ## El caso resuelto
 *
 * Son dos, y el primero es el interesante porque la figura se valida contra sí
 * misma: **la curva dibujada y la ecuación impresa son dos cosas distintas en el
 * papel**, y tienen que coincidir.
 *
 * 1. **La curva dibujada, digitalizada píxel por píxel** de la página escaneada
 *    —1.092 columnas entre 0,3 y 16,8 °C— cae a **0,59 puntos porcentuales** de
 *    la ecuación impresa en todo el tramo de 0 a 16 °C. Y ajustando una
 *    exponencial a esos 1.092 puntos sin mirar la ecuación sale
 *    `Y = 0,04038·e^(0,19074·T)`: **0,6 % en la constante y 0,4 % en el
 *    exponente**. Los puntos están en `PUNTOS_DE_LA_FIGURA_1` y el test los usa.
 * 2. **La saturación.** La ecuación da 1 en 16,837 °C; la curva dibujada llega
 *    al 98 % en 16,80 y ahí se funde con el marco.
 *
 * ## Unidades y rango de validez
 *
 * `t_suelo_c` en **grados Celsius**, el factor **adimensional entre 0 y 1**. La
 * figura cubre **0 a 18 °C**, que es el rango de la temperatura del suelo
 * profundo en la pradera mixta del norte de las Grandes Planicies durante la
 * estación de crecimiento. Afuera:
 *
 * - **Arriba de 16,84 °C** se satura en 1 y no se advierte nada: es lo que
 *   dibuja la figura.
 * - **Abajo de 0 °C** la exponencial se sigue evaluando, y da menos de 0,02 a
 *   −5 °C y menos de 0,007 a −10. Es extrapolación y se advierte, pero la
 *   alternativa —cortar en seco a cero— cambiaría el resultado en menos que el
 *   error de leer la figura, y metería un salto donde la física no lo tiene.
 *
 * El trabajo aplica el factor a la **segunda y la tercera capa** y asume
 * explícitamente que la temperatura no restringe la transpiración de la capa
 * superficial. Acá se hace lo mismo: `actividadDeLasCapas` devuelve 1 para la
 * primera.
 *
 * ## De dónde sale la temperatura del suelo, y qué se pierde
 *
 * El trabajo usó **curvas generales** de temperatura de suelo de de Jong (1974)
 * para Swift Current, Saskatchewan —o sea una curva estacional fija, la misma
 * todos los años— y los propios autores dicen que el refinamiento lógico es un
 * submodelo de temperatura de suelo (Hanks, Austin y Ondrechen 1971). Dan un
 * ejemplo de lo que la curva fija les costó: en la primavera de 1977, con abril
 * y mayo mucho más cálidos que lo normal, el modelo subestimó la extracción de
 * la capa de 30-60 cm.
 *
 * acequia tiene el refinamiento que ellos pedían y no por mérito propio: el
 * reanálisis ya corre un modelo de suelo. **ERA5-Land publica la temperatura
 * del suelo por capa y por día desde 1940**, y la serie llega por el mismo
 * pedido a Open-Meteo que ya trae la lluvia y la radiación.
 *
 * Lo que se pierde está en la geometría de las capas, y hay que decirlo: las
 * capas de ERA5-Land son 0-7, 7-28, **28-100** y 100-255 cm, así que las dos
 * capas del modelo que llevan factor —30-60 y 60-90— **caen las dos adentro de
 * la misma capa del dato** y reciben la misma temperatura. En primavera, que es
 * cuando esto decide algo, los 60-90 están más fríos que el promedio de 28-100:
 * el factor de la tercera capa sale **alto**, y el índice con él. Es la
 * dirección que ya tenía el error, más chica.
 *
 * ## Qué se rompe si cambia
 *
 * Lo mismo que con la `Eo`: el `Yp` de un predio se despeja de un corte
 * dividiendo por un índice, y después se multiplica por los índices de los otros
 * años. **Las dos puntas tienen que haber corrido con el mismo factor.** Si una
 * ruta consigue la temperatura del suelo y la otra no, los kilos salen mal sin
 * que nada se rompa, y por eso `CorteDeForrajeBloque` compara las dos corridas
 * antes de multiplicar.
 */

/** Las fuentes, con lo que cada una aporta. */
export const FUENTES_ACTIVIDAD_RADICULAR = {
  figura:
    'Wight, J. R., y Hanks, R. J. (1981). A water-balance, climate model for range herbage '
    + 'production. J. Range Management 34(4):307-311, Figura 1, p. 308. DOI 10.2307/3897857.',
  origen_de_la_curva:
    'de Jong, E. (1974). Modelling. VII. Soil water simulation models. Tech. Rep. No. 61, IBP, '
    + 'Matador Project, Universidad de Saskatchewan. No digitalizado; no hizo falta, porque la '
    + 'Figura 1 imprime la ecuación ajustada adentro del recuadro.',
  curvas_de_temperatura_del_trabajo:
    'de Jong, R. (1978). Energy and the Forage Crop, p. 24-40, en J. D. McElgunn (ed.), Pasture '
    + 'Systems for the Cow-Calf, Agriculture Canada Research Station, Swift Current, '
    + 'Saskatchewan. Son las curvas estacionales fijas que el trabajo usó, y la Figura 3 es el '
    + 'resultado de pasarlas por la Figura 1.',
  temperatura_del_suelo:
    'ERA5-Land, capa de 28 a 100 cm, media diaria, vía Open-Meteo '
    + '(soil_temperature_28_to_100cm_mean). Licencia CC-BY 4.0 de Copernicus.',
  control_independiente:
    'NASA POWER / MERRA-2, TSOIL3 (29,4 a 68,0 cm), diario desde 1981. Es otro modelo de suelo '
    + 'y otro reanálisis: sirve para medir el sesgo del dato, no para reemplazarlo.',
} as const;

/**
 * La ecuación impresa en la Figura 1.
 *
 * `Y = a · e^(k·T)` con `T` en °C e `Y` fracción. Satura en 1.
 */
export const CURVA_DE_LA_FIGURA_1 = {
  a: 0.0408,
  k: 0.19,
  /** `ln(1/a)/k`: la temperatura a la que la actividad relativa llega a 1. */
  satura_en_c: 16.837,
  en_cero_c: 0.0408,
} as const;

/** El rango que la figura dibuja. */
export const RANGO_DE_LA_FIGURA = { minimo_c: 0, maximo_c: 18 } as const;

/**
 * La curva dibujada, digitalizada de la página escaneada, en pares
 * `[temperatura °C, actividad relativa %]`.
 *
 * Son las lecturas en los grados enteros de las 1.092 columnas trazadas. El
 * test las compara contra la ecuación: es la figura validándose contra sí misma.
 */
export const PUNTOS_DE_LA_FIGURA_1 = [
  [1, 4.8], [2, 5.8], [3, 7.2], [4, 8.7], [5, 10.5], [6, 12.8], [7, 15.4], [8, 18.7],
  [9, 22.6], [10, 27.4], [11, 32.9], [12, 39.8], [13, 48.3], [14, 58.3], [15, 70.5], [16, 85.0],
] as const;

/** Lo que dio digitalizar la curva y ajustarle una exponencial sin mirar la ecuación. */
export const AJUSTE_A_LA_CURVA_DIBUJADA = {
  columnas: 1092,
  desde_c: 0.29,
  hasta_c: 16.81,
  a: 0.04038,
  k: 0.19074,
  /** La peor diferencia contra la ecuación impresa, en puntos porcentuales, de 0 a 16 °C. */
  peor_diferencia_pp: 0.59,
  /** Arriba de 16 °C la curva se funde con el borde del recuadro y el trazado la pierde. */
  peor_diferencia_pp_hasta_la_saturacion: 1.34,
} as const;

/**
 * Las capas del dato y las del modelo, que no son las mismas.
 *
 * Las del modelo son las tres de 30 cm de la prueba. Las de ERA5-Land son las
 * cuatro del esquema de suelo de ECMWF. La segunda y la tercera del modelo caen
 * **las dos** adentro de la capa de 28 a 100 cm.
 */
export const CAPAS = {
  modelo_cm: [[0, 30], [30, 60], [60, 90]],
  era5_land_cm: [[0, 7], [7, 28], [28, 100], [100, 255]],
  /** La capa del dato que alimenta a la segunda y a la tercera del modelo. */
  la_que_se_usa: 'soil_temperature_28_to_100cm_mean',
  /** La primera capa del modelo no lleva factor: lo dice el trabajo. */
  la_primera_no_lleva_factor: true,
} as const;

/**
 * El sesgo del dato de temperatura de suelo, medido contra una fuente que no es
 * ERA5 en el mismo píxel de Sidney, Montana.
 *
 * Es el mismo movimiento que se hizo con la radiación y la temperatura del aire
 * cuando se montó la `Eo`: antes de creerle al reanálisis, preguntarle a otro.
 * Acá el otro es **MERRA-2 por NASA POWER**, cuyo `TSOIL3` cubre 29,4 a 68,0 cm,
 * casi la segunda capa del modelo exacta.
 *
 * Con 16.071 días en común (1981-2024), ERA5-Land lee **+1,32 °C** más cálido en
 * el año entero y **+0,34 °C** adentro de la ventana del 15 de abril al 15 de
 * julio, que es la que decide. Parte de esa diferencia no es sesgo: el píxel de
 * POWER está a **722 m** y el de ERA5-Land a **589 m**, 133 m más abajo, que por
 * gradiente seco son del orden de 0,8 °C.
 *
 * Lo que importa para el motor es cuánto mueve eso al factor, y es poco:
 * **0,013** de actividad media en la ventana. El dato no es el problema acá.
 */
export const EL_SESGO_DEL_DATO_DE_SUELO = {
  dias: 16071,
  periodo: '1981-2024',
  era5_menos_merra2_c: { anio_entero: 1.32, en_la_ventana: 0.34 },
  eam_en_la_ventana_c: 1.3,
  /** Cuánto mueve ese sesgo al factor, que es lo único que llega al resultado. */
  diferencia_de_actividad_en_la_ventana: 0.013,
  altitud_del_pixel_m: { era5_land: 589, nasa_power: 722 },
  /** La capa de MERRA-2 que se comparó. */
  capa_de_merra2: 'TSOIL3, 29,4 a 68,0 cm',
} as const;

/**
 * Lo que la temperatura del suelo hace adentro de una temporada en Sidney, que
 * es el motivo por el que este factor mueve tanto.
 *
 * Promediado sobre las doce temporadas de la Tabla 1, la capa de 28-100 cm de
 * ERA5-Land arranca el 15 de abril a **2,5 °C** y llega a **17,1 °C** en la
 * primera quincena de julio. Traducido por la curva, la actividad radicular de
 * las capas de abajo pasa de **0,07 a 1**.
 *
 * O sea que durante la primera parte de la estación de crecimiento —la que
 * decide el rebrote— **las dos capas profundas están prácticamente cerradas**, y
 * el balance que corría sin el factor las tenía abiertas de par en par.
 */
export const LO_QUE_HACE_LA_TEMPORADA = {
  abril_15_30: { t_suelo_c: 2.5, actividad: 0.066 },
  julio_1_15: { t_suelo_c: 17.1, actividad: 1.0 },
  media_de_la_ventana: { t_suelo_c: 10.4, actividad: 0.432 },
  temporadas: '1967-1978, 15/04 a 15/07',
} as const;

/**
 * La Figura 3 publicada contra el camino de acequia, en el mismo lugar.
 *
 * Es el segundo caso resuelto, y el que importa, porque valida **las dos piezas
 * juntas**: la curva y la fuente de temperatura. La Figura 3 del trabajo es la
 * actividad radicular estacional de las capas de 30-60 y 60-90 cm en **Swift
 * Current, Saskatchewan**, que Wight y Hanks obtuvieron pasando las curvas de
 * temperatura de de Jong (1978) por la Figura 1. acequia hace lo mismo con
 * ERA5-Land en el píxel de Swift Current —50,28 N, 107,80 O, climatología
 * 1961-1990— y las dos curvas se pueden comparar quincena por quincena.
 *
 * De febrero a mediados de junio, que es el tramo donde la curva decide algo y
 * donde la digitalización es confiable:
 *
 * ```
 *            acequia   Fig. 3 30-60   Fig. 3 60-90
 *  1 feb        3,6          1,8            1,8
 *  1 abr        3,6          2,2            2,2
 * 16 abr        4,1          3,9            3,1
 *  1 may        6,6          6,6            4,7
 * 16 may       16,6         11,7            7,5
 *  1 jun       33,8         21,2           12,4
 * 16 jun       49,6         36,2           20,5
 * ```
 *
 * **acequia lee alto, y la diferencia es un adelanto de 7 a 13 días** en la
 * rampa de primavera. Contra la curva de 30-60 el sesgo medio es de +4,2 puntos
 * porcentuales; contra la de 60-90, +7,7. Las dos lecturas tienen explicación y
 * ninguna es tranquilizadora:
 *
 * - ERA5-Land lee **+1,3 °C** más cálido que MERRA-2 en el perfil (ver
 *   `EL_SESGO_DEL_DATO_DE_SUELO`), y 1,3 °C en esta curva son un 28 % relativo.
 * - La capa de 28-100 cm es **una sola para las dos** del modelo, y la publicada
 *   dice exactamente cuánto cuesta eso: en primavera la actividad de 60-90 es
 *   **0,57 a 0,81** de la de 30-60, y nosotros les damos la misma.
 *
 * **Dirección del error: alta.** Más actividad es más extracción, más `T` y más
 * índice. Va en el mismo sentido que todo lo demás que el balance declara, y es
 * parte de por qué el sesgo contra los doce índices publicados no se cerró del
 * todo con este factor.
 */
export const CONTRA_LA_FIGURA_3 = {
  sitio: 'Swift Current, Saskatchewan — 50,28 N, 107,80 O',
  climatologia: '1961-1990, ERA5-Land, capa de 28 a 100 cm',
  tramo: 'de febrero a mediados de junio',
  quincenas: 9,
  /** `[etiqueta, acequia %, Fig. 3 de 30-60 %, Fig. 3 de 60-90 %]`. */
  medido: [
    ['feb-1', 3.6, 1.8, 1.8], ['mar-1', 3.4, 1.3, 1.3], ['mar-16', 3.5, 1.8, 1.8],
    ['abr-1', 3.6, 2.2, 2.2], ['abr-16', 4.1, 3.9, 3.1], ['may-1', 6.6, 6.6, 4.7],
    ['may-16', 16.6, 11.7, 7.5], ['jun-1', 33.8, 21.2, 12.4], ['jun-16', 49.6, 36.2, 20.5],
  ],
  sesgo_pp: { contra_30_60: 4.2, contra_60_90: 7.7 },
  eam_pp: { contra_30_60: 4.2, contra_60_90: 7.7 },
  adelanto_dias: { minimo: 7, maximo: 13 },
  /** Lo que la figura publicada dice que cuesta darles una sola temperatura. */
  cociente_publicado_60_90_sobre_30_60: { abr_16: 0.81, may_1: 0.72, may_16: 0.64, jun_1: 0.58 },
  sesgo_del_indice: 'alto',
} as const;

/** Las degradaciones de este archivo, con la dirección del error de cada una. */
export const ADVERTENCIAS_ACTIVIDAD = {
  una_temperatura_para_dos_capas:
    'Las capas de 30-60 y 60-90 cm reciben la misma temperatura, porque ERA5-Land tiene una sola '
    + 'capa de 28 a 100 cm. En primavera los 60-90 están más fríos que ese promedio, así que el '
    + 'factor de la tercera capa sale ALTO y el índice con él.',
  bajo_cero:
    'La temperatura del suelo quedó por debajo de los 0 °C que dibuja la figura. La exponencial '
    + 'se extrapola, y ahí vale menos de 0,02: la extracción de esas capas queda prácticamente '
    + 'cerrada, que es lo que hace un suelo congelado.',
  fuera_de_la_pradera_mixta:
    'La curva se aproximó de datos de Swift Current, Saskatchewan, y los autores piden una curva '
    + 'propia de la región donde se aplique el modelo. En otro bioma es extrapolación.',
  sin_temperatura_de_suelo:
    'No llegó la temperatura del suelo, así que el factor no se aplicó y las capas profundas '
    + 'entregan agua que en suelo frío no entregarían: el índice sale ALTO.',
} as const;

/**
 * El aviso que viaja con el resultado, con **las dos direcciones**.
 *
 * Un factor más chico baja el índice, y el índice es el divisor cuando se
 * despeja el `Yp` de un corte: lo que para la serie de años es menos forraje,
 * para el `Yp` del predio es más. Como con `AVISO_EO_JENSEN_HAISE`, un solo
 * campo `sesgo` no alcanza para dos consumidores.
 */
export const AVISO_ACTIVIDAD_RADICULAR = {
  aviso:
    'La extracción de las capas de 30-60 y 60-90 cm se restringió por temperatura de suelo, como '
    + 'en el trabajo original. La temperatura sale de ERA5-Land, que tiene una sola capa entre 28 '
    + 'y 100 cm para las dos.',
  /** Queda el residuo: la tercera capa recibe una temperatura de primavera demasiado alta. */
  sesgo_del_indice: 'alto',
  sesgo_del_yp: 'bajo',
} as const;

/**
 * El factor de actividad radicular de una capa, a partir de su temperatura.
 *
 * Devuelve un número entre 0 y 1, o `null` si la temperatura no es finita: un
 * día sin temperatura de suelo no es un día de suelo helado, y rellenarlo con
 * cero cerraría el perfil por una laguna del dato.
 */
export function actividadRadicular(t_suelo_c: number | null | undefined): number | null {
  if (t_suelo_c === null || t_suelo_c === undefined) return null;
  if (!Number.isFinite(t_suelo_c)) return null;
  const y = CURVA_DE_LA_FIGURA_1.a * Math.exp(CURVA_DE_LA_FIGURA_1.k * t_suelo_c);
  return Math.max(0, Math.min(1, y));
}

/**
 * El factor de cada capa del modelo para un día, de la superficie hacia abajo.
 *
 * La primera capa va siempre en 1 —el trabajo asume que la temperatura no la
 * restringe— y las de abajo llevan el factor de la temperatura del tramo de
 * 30 a 90 cm. Devuelve `null` si no hay temperatura: quien llama decide, y en
 * esta cadena la decisión es correr sin el factor y advertirlo, no inventarlo.
 *
 * `capas` es cuántas tiene el perfil; con una sola, el resultado es `[1]`.
 */
export function actividadDeLasCapas(
  t_suelo_30_90_c: number | null | undefined,
  capas = 3,
): number[] | null {
  if (capas <= 0) return null;
  const f = actividadRadicular(t_suelo_30_90_c);
  if (f === null) return null;
  return Array.from({ length: capas }, (_, i) => (i === 0 ? 1 : f));
}
