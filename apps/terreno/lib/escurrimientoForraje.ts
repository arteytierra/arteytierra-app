/**
 * El escurrimiento del balance diario de forraje, y por qué deja de ser cero.
 *
 * ## Qué estaba mal
 *
 * El balance de Wight y Hanks (1981) asume **escurrimiento nulo**: toda la
 * lluvia del día entra al perfil y lo que pasa capacidad de campo se cuenta como
 * drenaje. Los autores lo dicen en una línea —«In this study, we assumed there
 * was no runoff»— y era razonable: corrieron en una planicie glaciada arenosa de
 * Sidney, Montana, donde el escurrimiento es un componente marginal del balance.
 *
 * acequia heredaba el supuesto **en cualquier predio**, con cualquier pendiente
 * y cualquier suelo, y estaba declarado en `ADVERTENCIAS.escorrentia_nula` como
 * una de las degradaciones que empujan el índice `T/Tp` para arriba. De las
 * cuatro de ese archivo, era la última que quedaba sin pagar junto con el agua
 * bajo el límite inferior.
 *
 * ## La fuente, y por qué cierra el linaje
 *
 * El camino no fue inventar cómo meterle escurrimiento a este balance: fue
 * averiguar qué hizo **el propio Wight**. Seis años después del artículo publicó
 * `ERHYM-II` —*Ekalaka Rangeland Hydrology and Yield Model*, USDA-ARS ARS-59,
 * 1987—, que es este mismo balance llevado a modelo de pastizal: la misma `Eo`
 * de Jensen-Haise (1963), el mismo `Kc`, la misma `Tp` como producto de un
 * coeficiente por una curva de crecimiento relativo, la misma `E = Ep/√t` de la
 * evaporación del suelo limitada a los primeros 300 mm, y la misma extracción
 * capa por capa desde arriba restringida por densidad de raíces y temperatura.
 * Y, lo que acá importa, **escurrimiento diario por una curva número
 * modificada**.
 *
 * Las ecuaciones de ERHYM-II están publicadas textualmente en la evaluación
 * independiente del modelo:
 *
 * > Weltz, M. A., y Blackburn, W. H. (1993). «Modeling water balance with the
 * > ERHYM model on south Texas rangelands». *Water Resources Bulletin*
 * > 29(3):461-471.
 *
 * que es la fuente que este archivo cita, porque es la que se pudo leer entera
 * y la que además **mide el error del método** (ver `CONTRA_LA_COPITA`).
 *
 * ```
 * [10]  Q = (P − 0,2·S)² / (P + 0,8·S)      si P > 0,2·S, si no Q = 0
 * [11]  S = Smx · (UL − Sm) / UL
 * [12]  Smx = 25400/CN_I − 254                      (mm; en pulgadas, 1000/CN − 10)
 * ```
 *
 * La ecuación 10 es la curva número de siempre (NRCS, *National Engineering
 * Handbook*, Part 630, cap. 10, ec. 10-11, con `Ia = 0,2·S`). **La 11 es la que
 * hace la diferencia**: la retención máxima potencial no es una constante de
 * tormenta de diseño sino una función del agua que el perfil tiene en ese
 * momento, que es justo lo que este balance ya lleva en la mano. Con el perfil
 * seco `S = Smx` y casi nada escurre; con el perfil lleno `S = 0` y escurre toda
 * la lluvia del día. Es también lo que hace SWAT por defecto —su documentación
 * llama a esa opción «calcular el CN diario como función de la humedad del
 * suelo»—, así que no es una rareza de ERHYM-II.
 *
 * ## Unidades
 *
 * Todo en **milímetros**: `pptn_mm`, `s_mm`, `smx_mm`, `sws_mm`, `ul_mm`. El
 * `CN` es adimensional, de 0 a 100, y es el de **condición de humedad
 * antecedente media (ARC II)**, que es lo que publican las tablas del manual y
 * lo que tiene `COBERTURAS` en `cuenca.ts`. La conversión a ARC I la hace la
 * Tabla 10-1 del manual, acá adentro. No hay ninguna conversión implícita: la
 * forma `1000/CN − 10` de la ecuación 12 está en pulgadas y se usa la forma SI.
 *
 * ## Rango de validez, que acá es la parte importante
 *
 * El manual de la NRCS dice, de su propio método, lo que `LO_QUE_DICE_EL_MANUAL`
 * cita entero: usarlo como función de pérdida en simulación continua **no está
 * dentro del uso previsto** del procedimiento. Así que esto no se monta como
 * «ahora el escurrimiento está bien»: se monta porque es lo que hizo el autor
 * del balance, y con la cota medida al lado.
 *
 * Y la cota medida existe: en La Copita, Texas, el escurrimiento simulado salió
 * **dos a tres veces** el medido con el CN calibrado del sitio, y **ocho a doce
 * veces** con el CN de tabla. O sea que el número es una **cota superior del
 * escurrimiento**, y por lo tanto el índice `T/Tp` que sale es una **cota
 * inferior**. Ver `CONTRA_LA_COPITA` y `AVISO_ESCURRIMIENTO`.
 *
 * La otra mitad hay que decirla fuerte porque es la que uno esperaría que
 * estuviera: **la curva número no tiene término de pendiente**. Corrige suelo y
 * cobertura, no inclinación. Ver `LA_TABLA_NO_TIENE_PENDIENTE`.
 *
 * ## Qué se rompe si cambia
 *
 * El índice `T/Tp` de `forrajeBalance.ts`, y por lo tanto todo lo que cuelga de
 * él: el `Yp` que `ypDelCorte` despeja de un corte medido, la distribución de 65
 * temporadas de `indicesPorAnio`, y los kilos que el panel multiplica. Las dos
 * rutas tienen que correr con **el mismo** escurrimiento o los kilos salen mal
 * sin que nada se rompa: `CorteDeForrajeBloque.tsx` las compara antes de
 * multiplicar, igual que ya hace con la `Eo`, el factor de actividad radicular y
 * el agua inicial.
 */
import { COBERTURAS, type GrupoHidro } from './cuenca';
import type { AvisoDeCorte, Direccion } from './forrajeCorte';

/** De dónde sale cada cosa de este archivo. */
export const FUENTES_ESCURRIMIENTO = {
  el_modelo:
    'Wight, J. R. (1987). «ERHYM-II: model description and user guide for the BASIC version». '
    + 'USDA-ARS, ARS-59. El mismo autor del balance de 1981, con escurrimiento diario por curva '
    + 'número modificada.',
  las_ecuaciones:
    'Weltz, M. A., y Blackburn, W. H. (1993). «Modeling water balance with the ERHYM model on '
    + 'south Texas rangelands». Water Resources Bulletin 29(3):461-471. Publica textualmente las '
    + 'ecuaciones 10, 11 y 12 de ERHYM-II y la evaluación independiente del modelo.',
  la_curva_numero:
    'USDA NRCS, National Engineering Handbook, Part 630 Hydrology, cap. 10 «Estimation of direct '
    + 'runoff from storm rainfall» (210-VI-NEH, julio 2004): ecuación 10-11, Tabla 10-1 y los '
    + 'ejemplos 10-1 y 10-2.',
  la_tabla_de_cn:
    'Los CN por cobertura y grupo hidrológico salen de `COBERTURAS` en `cuenca.ts`, que es la '
    + 'tabla 9-1 del mismo manual (210-VI-NEH, 2004) en condición ARC II.',
  caso_resuelto:
    'Ejemplos 10-1 y 10-2 del NEH-630 (2004): pastura en buen estado sobre grupo hidrológico C, '
    + 'CN 74, '
    + 'lluvia de 4,3 pulgadas. El manual publica S = 3,51 pulgadas y Q = 1,82, y para ARC I y III '
    + 'CN 55 y 88 con Q = 0,65 y 3,01.',
  la_cota_medida:
    'La Copita Research Area, Alice, Texas: lisímetros de pastizal, matorral de mezquite y suelo '
    + 'desnudo, 1985. Tabla 1 de Weltz y Blackburn (1993).',
} as const;

/**
 * Lo que la NRCS dice de su propio método, que es la razón por la que esto sale
 * con una cota al lado y no como una corrección.
 *
 * La cita es del cap. 10 del NEH-630 (2004), p. 10-15, y no está escondida en
 * una nota al pie: está en la sección que discute los límites del método.
 */
export const LO_QUE_DICE_EL_MANUAL = {
  cita:
    'In the years following the development of the runoff equation, it has been adopted for use '
    + 'in applications that were not envisioned by the originator. Some of these applications are '
    + 'as an infiltration method for individual storm runoff events and as a loss function for '
    + 'continuous simulation. Such applications are not within the intended usage of curve number '
    + 'procedures.',
  donde: 'NEH-630, cap. 10 (2004), sección 630.1002, p. 10-15',
  que_significa_acá:
    'El balance de forraje es exactamente una simulación continua con la curva número de función '
    + 'de pérdida. El método no fue hecho para esto. Se usa igual porque es lo que hizo el autor '
    + 'del balance en ERHYM-II, y porque el error está medido: ver CONTRA_LA_COPITA.',
  y_lo_otro_que_dice:
    'Los CN se derivaron de caudales de crecida anual, y el manual no recomienda aplicarlos a '
    + 'caudales chicos. En un día de lluvia mediana de pastizal el escurrimiento es justamente '
    + 'chico, que es donde el propio manual dice que la ecuación anda peor.',
} as const;

/**
 * La Tabla 10-1 del NEH-630: el `CN` de las condiciones antecedentes I (seca) y
 * III (húmeda) que corresponden a cada `CN` de la II (media).
 *
 * Hace falta porque la ecuación 12 de ERHYM-II pide **el CN de la clase I**, y
 * las tablas de cobertura —la 9-1 del manual, que es la que `cuenca.ts` tiene en
 * `COBERTURAS`— publican el de la clase II.
 *
 * Es la tabla, no un ajuste: cada fila está transcripta del manual. Las filas
 * van de 100 a 30 de uno en uno y después de cinco en cinco, que es como el
 * manual las publica; entre dos filas se interpola lineal, y eso sí es una
 * decisión nuestra y queda a la vista.
 *
 * El manual aclara de dónde salen las dos columnas: son **curvas envolventes**
 * del 10 y el 90 % de la distribución del `CN` observado, no una relación física
 * con la lluvia de los cinco días anteriores. De hecho dice lo contrario de eso:
 * que no aparece relación entre la precipitación antecedente y el `CN`.
 */
export const CN_DE_LA_TABLA_10_1: readonly (readonly [number, number, number])[] = [
  [100, 100, 100], [99, 97, 100], [98, 94, 99], [97, 91, 99], [96, 89, 99],
  [95, 87, 98], [94, 85, 98], [93, 83, 98], [92, 81, 97], [91, 80, 97],
  [90, 78, 96], [89, 76, 96], [88, 75, 95], [87, 73, 95], [86, 72, 94],
  [85, 70, 94], [84, 68, 93], [83, 67, 93], [82, 66, 92], [81, 64, 92],
  [80, 63, 91], [79, 62, 91], [78, 60, 90], [77, 59, 89], [76, 58, 89],
  [75, 57, 88], [74, 55, 88], [73, 54, 87], [72, 53, 86], [71, 52, 86],
  [70, 51, 85], [69, 50, 84], [68, 48, 84], [67, 47, 83], [66, 46, 82],
  [65, 45, 82], [64, 44, 81], [63, 43, 80], [62, 42, 79], [61, 41, 78],
  [60, 40, 78], [59, 39, 77], [58, 38, 76], [57, 37, 75], [56, 36, 75],
  [55, 35, 74], [54, 34, 73], [53, 33, 72], [52, 32, 71], [51, 31, 70],
  [50, 31, 70], [49, 30, 69], [48, 29, 68], [47, 28, 67], [46, 27, 66],
  [45, 26, 65], [44, 25, 64], [43, 25, 63], [42, 24, 62], [41, 23, 61],
  [40, 22, 60], [39, 21, 59], [38, 21, 58], [37, 20, 57], [36, 19, 56],
  [35, 18, 55], [34, 18, 54], [33, 17, 53], [32, 16, 52], [31, 16, 51],
  [30, 15, 50], [25, 12, 43], [20, 9, 37], [15, 6, 30], [10, 4, 22],
  [5, 2, 13], [0, 0, 0],
] as const;

/**
 * El caso resuelto del manual, en sus propias unidades y en las nuestras.
 *
 * Ejemplo 10-1: una tormenta de 4,3 pulgadas sobre pastura en buen estado y
 * suelo del grupo hidrológico C. La tabla 9-1 da `CN = 74`, la 10-1 da
 * `S = 3,51` pulgadas, y el resultado publicado es `Q = 1,82` pulgadas.
 *
 * Ejemplo 10-2: el mismo lugar y la misma lluvia en las otras dos condiciones
 * antecedentes. `CN = 55` y `88`, con `Q = 0,65` y `3,01` pulgadas, o sea el
 * 15,1 y el 70,0 % de la lluvia contra el 42,3 % de la condición media.
 *
 * Tres valores publicados que la ecuación 10 tiene que reproducir, y una
 * advertencia del propio manual al lado: «el escurrimiento en pulgadas o en
 * porcentaje no es proporcional al CN, así que el procedimiento no admite
 * atajos».
 */
export const EL_CASO_DEL_MANUAL = {
  cobertura: 'pastura en buen estado, grupo hidrológico C',
  cn_arc_ii: 74,
  lluvia_pulgadas: 4.3,
  lluvia_mm: 109.22,
  s_publicado_pulgadas: 3.51,
  s_publicado_mm: 89.154,
  por_condicion: [
    { arc: 'I', cn: 55, q_pulgadas: 0.65, q_mm: 16.51, pct_de_la_lluvia: 15.1 },
    { arc: 'II', cn: 74, q_pulgadas: 1.82, q_mm: 46.23, pct_de_la_lluvia: 42.3 },
    { arc: 'III', cn: 88, q_pulgadas: 3.01, q_mm: 76.45, pct_de_la_lluvia: 70.0 },
  ],
  pulgada_mm: 25.4,
} as const;

/**
 * La evaluación independiente de ERHYM-II, que es la cota de este cálculo.
 *
 * Weltz y Blackburn (1993) encerraron en lisímetros no pesables —trincheras de
 * 2,5 m con doble plástico y aforador de escurrimiento, parcelas de 5 × 7 m con
 * el eje largo en el sentido de la pendiente— tres matorrales de mezquite, tres
 * interespacios de pastizal y tres parcelas de suelo desnudo en La Copita, Alice,
 * Texas. Suelo franco arenoso fino del grupo hidrológico **D**, perfil de 120 cm
 * en cuatro capas de 30, sonda de neutrones cada dos semanas, año 1985 con 890 mm
 * de lluvia (27 % sobre la normal de 704).
 *
 * El `CN` de tabla del sitio iba de 76 a 89 según la condición hidrológica, y con
 * eso el escurrimiento simulado salió **ocho a doce veces** el medido. Así que
 * calibraron: de los 21 eventos de más de 12,7 mm de 1985 despejaron un `CN` por
 * evento, que fue de 25 a 97, y usaron la **mediana, 43**, que coincide con el
 * 43,2 que otro trabajo había estimado para una cuenca de suelos y vegetación
 * parecidos a 18 km de ahí.
 *
 * Con ese `CN` calibrado el modelo todavía sobreestima el escurrimiento **dos a
 * tres veces**, y el coeficiente de Nash-Sutcliff sale **negativo** en pastizal y
 * en matorral: el promedio de lo medido predice mejor el escurrimiento anual que
 * el modelo. En suelo desnudo, en cambio, da igual al medido y el Nash-Sutcliff
 * sube a 0,83.
 *
 * La forma del error también está publicada, y es la que hay que esperar acá: el
 * método **subestima el escurrimiento de los eventos chicos** (menos de 25 mm) y
 * **sobreestima el de los grandes** (más de 25 mm), y simula menos eventos de
 * escurrimiento que los que hubo —26 medidos en suelo desnudo contra la mitad
 * simulados—. La ecuación 11 es la causa: con el perfil seco `0,2·S` es grande y
 * un chaparrón de 12 mm no pasa el umbral, aunque en el campo escurra igual
 * porque la superficie se sella en los primeros minutos.
 *
 * Y una tercera cita del mismo trabajo, por si hiciera falta: en cuencas de
 * matorral del centro de Idaho, Wilcox y otros (1990) encontraron que la curva
 * número es un mal estimador del escurrimiento mensual y anual. Wood y Blackburn
 * (1984) midieron que sobreestima el escurrimiento el 67 % de las veces en los
 * pastizales que evaluaron.
 */
export const CONTRA_LA_COPITA = {
  sitio: 'La Copita Research Area, Alice, Texas — franco arenoso fino, grupo D, 120 cm, 1985',
  lluvia_mm: 890,
  normal_mm: 704,
  cn_de_tabla: { minimo: 76, maximo: 89 },
  cn_calibrado: 43,
  como_se_calibro:
    'mediana del CN despejado de los 21 eventos de más de 12,7 mm de 1985, que fue de 25 a 97',
  /** Tabla 1: medido contra simulado, en mm, con el CN calibrado. */
  balance_mm: [
    { parcela: 'pastizal', et: { medido: 834, simulado: 818 }, drenaje: { medido: 24, simulado: 3 }, escurrimiento: { medido: 28, simulado: 55 } },
    { parcela: 'matorral', et: { medido: 887, simulado: 890 }, drenaje: { medido: 0, simulado: 0 }, escurrimiento: { medido: 19, simulado: 56 } },
    { parcela: 'suelo desnudo', et: { medido: 643, simulado: 529 }, drenaje: { medido: 144, simulado: 177 }, escurrimiento: { medido: 84, simulado: 84 } },
  ],
  /** Cuántas veces el escurrimiento simulado supera al medido. */
  veces_de_mas: { con_el_cn_calibrado: { minimo: 2, maximo: 3 }, con_el_cn_de_tabla: { minimo: 8, maximo: 12 } },
  /** Nash-Sutcliff del escurrimiento. Negativo = el promedio medido predice mejor. */
  nash_sutcliff: { pastizal: -0.21, matorral: -2.32, suelo_desnudo: 0.83 },
  la_forma_del_error:
    'subestima el escurrimiento de los eventos de menos de 25 mm y sobreestima el de los de más '
    + 'de 25 mm; simula aproximadamente la mitad de los eventos de escurrimiento que hubo',
  en_fraccion_de_la_lluvia: { medido_pct: { minimo: 3, maximo: 6 }, et_de_las_planicies_pct: 96 },
  otros_dos:
    'Wilcox y otros (1990): la curva número es un mal estimador del escurrimiento mensual y anual '
    + 'en cuencas de matorral del centro de Idaho. Wood y Blackburn (1984): sobreestima el '
    + 'escurrimiento el 67 % de las veces en los pastizales evaluados.',
  /** La consecuencia, que es lo que va al aviso. */
  que_acota:
    'el escurrimiento que sale es una cota superior, así que el índice T/Tp es una cota inferior '
    + 'y el Yp despejado de un corte es una cota superior',
} as const;

/**
 * Lo que esta corrección **no** arregla: la pendiente.
 *
 * Uno esperaría que meter escurrimiento en el balance resolviera el «cualquier
 * pendiente» del supuesto original. No lo resuelve, y conviene decirlo antes que
 * después: **la curva número no tiene término de pendiente**. El `CN` se compone
 * de grupo hidrológico del suelo, cobertura y condición hidrológica, y nada más.
 * La documentación de SWAT lo dice sin vueltas: «los números de curva de
 * condición de humedad II que dan las tablas se suponen apropiados para
 * pendientes del 5 %».
 *
 * Hay dos ajustes publicados y ninguno se montó:
 *
 * · **Williams (1995)**, el que trae SWAT2012:
 *   `CN₂ₛ = (CN₃ − CN₂)/3 · [1 − 2·exp(−13,86·s)] + CN₂`, con `s` la pendiente
 *   media en fracción. Se puede calcular con lo que acequia ya tiene —la Tabla
 *   10-1 da `CN₃` y el DEM da la pendiente—, pero **SWAT+ lo sacó**: su propia
 *   documentación dice que no ajusta los CN por pendiente y que si el usuario lo
 *   quiere lo haga antes de cargar el número. Un ajuste que el modelo que lo
 *   popularizó dejó de aplicar no es terreno firme.
 * · **Huang y otros (2006)**, calibrado en el Loess Plateau de China para
 *   pendientes del **14 al 140 %**. Fuera de ese rango es extrapolación, y la
 *   mayoría de los predios de acequia están abajo del 14 %.
 *
 * Así que la corrección corrige **suelo y cobertura**, y la pendiente sigue sin
 * entrar. En un predio empinado el escurrimiento real es mayor que el que sale
 * de acá, que empuja en la misma dirección que el supuesto original: el índice
 * sigue leyendo alto. Queda declarado, no resuelto.
 */
export const LA_TABLA_NO_TIENE_PENDIENTE = {
  lo_que_dice_swat:
    'The moisture condition II curve numbers provided in the tables are assumed to be appropriate '
    + 'for 5% slopes.',
  donde: 'SWAT+ Theoretical Documentation, 2:1.1.1.4 «Slope Adjustments»',
  williams_1995: {
    ecuacion: 'CN2s = (CN3 − CN2)/3 · [1 − 2·exp(−13,86·s)] + CN2, con s en fracción',
    por_que_no: 'SWAT+ dejó de aplicarlo: «SWAT+ does not adjust curve numbers for slope»',
  },
  huang_2006: {
    rango_de_pendiente_pct: { minimo: 14, maximo: 140 },
    por_que_no: 'calibrado en el Loess Plateau para pendientes del 14 al 140 %',
  },
  pendiente_supuesta_pct: 5,
  direccion:
    'en un predio más empinado que el 5 % el escurrimiento real es mayor que el calculado, así '
    + 'que el índice sigue leyendo alto por ese lado',
} as const;

/** Lo que hay que declarar cuando el escurrimiento corre, y lo que falta igual. */
export const ADVERTENCIAS_ESCURRIMIENTO = {
  fuera_del_uso_previsto:
    'La curva número se aplica como función de pérdida en una simulación continua, que el manual '
    + 'de la NRCS dice que no es el uso previsto del método. Es lo que hizo ERHYM-II, el modelo '
    + 'del mismo autor del balance, y el error está medido: dos a tres veces de más en pastizal '
    + 'semiárido.',
  sin_pendiente:
    'El CN no tiene término de pendiente: las tablas suponen 5 %. En un predio más empinado el '
    + 'escurrimiento real es mayor y el índice sigue saliendo ALTO por ese lado.',
  la_condicion_hidrologica_no_se_declara:
    'La condición hidrológica del pastizal —cuánto suelo cubre— no la declara nadie, así que se '
    + 'asume la neutra («regular»), igual que hace el motor hidrológico del predio. Un pastizal en '
    + 'buen estado escurre menos y uno sobrepastoreado bastante más.',
  el_perfil_entero_decide:
    'La ecuación 11 mira el agua de los 90 cm enteros, así que una capa profunda seca mantiene la '
    + 'retención alta aunque la superficie esté saturada. El suelo real se sella arriba: en esos '
    + 'días el modelo escurre menos de lo que corresponde.',
  los_eventos_chicos:
    'Con el perfil seco la abstracción inicial se come las lluvias chicas enteras, y en el campo '
    + 'esas lluvias escurren igual. Medido en La Copita: el modelo simuló la mitad de los eventos '
    + 'de escurrimiento que hubo.',
  sin_cn:
    'No se declaró un CN, así que el escurrimiento es cero como en el trabajo original: toda la '
    + 'lluvia entra al perfil y el índice sale ALTO.',
} as const;

/**
 * Las dos direcciones, que en este caso **se dan vuelta** respecto de las tres
 * degradaciones anteriores de este bloque.
 *
 * La `Eo` de Jensen-Haise, el factor de actividad radicular y el agua inicial
 * medida bajaban el índice desde arriba: el índice leía alto y el `Yp` despejado
 * leía bajo. Acá el escurrimiento **saca agua** del perfil, así que el índice
 * baja —pero por abajo del valor correcto, porque la cota medida dice que el
 * método escurre dos a tres veces de más—. O sea:
 *
 * ```
 *                        índice T/Tp      Yp despejado de un corte
 * sin escurrimiento          ALTO                  bajo
 * con escurrimiento          BAJO                  ALTO
 * ```
 *
 * Y el `Yp` es el que manda en los kilos de un predio ajeno: `Y = Yp · índice`.
 * Si el `Yp` sale alto y el índice bajo, el producto en el año medido se cancela
 * —es la misma corrida— pero en los otros años **no**, porque el índice de cada
 * año se mueve distinto. Por eso las dos rutas tienen que correr con el mismo
 * escurrimiento, y el componente las compara antes de multiplicar.
 */
export const AVISO_ESCURRIMIENTO = {
  aviso:
    'El escurrimiento sale de la curva número con la retención ligada al agua del perfil, que es '
    + 'lo que hace ERHYM-II, el modelo del mismo autor del balance. El manual de la NRCS dice que '
    + 'usar la curva número en simulación continua no es el uso previsto del método, y la única '
    + 'evaluación independiente que existe midió que sobreestima el escurrimiento entre dos y '
    + 'tres veces en pastizal semiárido —ocho a doce con el CN de tabla sin calibrar—. Así que el '
    + 'escurrimiento es una cota superior: el índice T/Tp sale BAJO y el Yp que se despeja '
    + 'dividiendo por él sale ALTO. Además el CN no tiene término de pendiente: las tablas suponen '
    + '5 %, y en un predio más empinado el escurrimiento real es mayor.',
  /** El índice sale bajo, porque el escurrimiento es una cota superior. */
  sesgo_del_indice: 'bajo' as Direccion,
  /** Y por lo tanto el `Yp` que se despeja dividiendo por el índice sale alto. */
  sesgo_del_yp: 'alto' as Direccion,
} as const;

/** El aviso, en la forma que consumen `ypDelCorte` e `indicesPorAnio`. */
export function avisoDelEscurrimiento(cual: 'indice' | 'yp'): AvisoDeCorte {
  return {
    aviso: AVISO_ESCURRIMIENTO.aviso,
    sesgo: cual === 'indice'
      ? AVISO_ESCURRIMIENTO.sesgo_del_indice
      : AVISO_ESCURRIMIENTO.sesgo_del_yp,
  };
}

/**
 * Lo que el escurrimiento mueve en Sidney, que es el arnés de siempre: **casi
 * nada, y nada de nada en la cola seca.**
 *
 * Era lo esperable y conviene decirlo antes del número: Sidney es una planicie
 * glaciada arenosa, o sea el lugar donde el supuesto de escurrimiento nulo
 * probablemente esté bien. El arnés sirve para comprobar que la corrección **no
 * empeora**, no para comprobar que mejora.
 *
 * Como el `CN` del predio sale del grupo hidrológico del suelo y nadie sabe el de
 * 1967, se corrieron los cuatro grupos. El de Sidney es el **A**.
 *
 * ```
 *                  esc/lluvia   esc por        contra los doce        distribución        Yp
 *                    anual      temporada    EAM   sesgo  techo    p10    mediana     kg/ha
 *   sin escurrir       0 %        0 mm      0,072  +0,070    3     0,452   0,820      1.449
 *   grupo A (49)     3,2 %      4,7 mm      0,072  +0,070    3     0,452   0,820      1.449
 *   grupo B (69)     4,4 %      7,7 mm      0,071  +0,069    3     0,452   0,820      1.449
 *   grupo C (79)     5,4 %     11,0 mm      0,069  +0,064    2     0,452   0,818      1.454
 *   grupo D (84)     6,2 %     13,7 mm      0,067  +0,059    2     0,452   0,806      1.482
 * ```
 *
 * ## Las tres cosas que esto dice
 *
 * **1. En el grupo que Sidney tiene de verdad no mueve nada.** Con `CN 49` el
 * índice de las doce temporadas publicadas sale igual hasta el tercer decimal, y
 * el `Yp` también. El escurrimiento existe —3,2 % de la lluvia— pero cae donde
 * no cambia el resultado: en los días en que el perfil ya estaba lleno, que es
 * agua que el balance anterior contaba como **drenaje**. La prueba está en el
 * drenaje acumulado de los 66 años: 393 mm con `CN 49` y **0 mm** con `CN 84`.
 * Lo que la curva número hace, sobre todo, es cambiarle el nombre a una pérdida
 * que ya existía.
 *
 * **2. No toca la cola seca.** El `p10` de la distribución de 66 temporadas sale
 * **0,452 con los cuatro grupos y sin escurrimiento**, idéntico. Es lo contrario
 * de las tres degradaciones anteriores de este bloque, que movían justamente la
 * cola. Y la cola seca es la que dimensiona la carga animal, así que **la carga
 * no se mueve**. El motivo es la ecuación 11: en una temporada seca el perfil
 * está vacío, la retención es máxima, y la poca lluvia que cae no llega a pasar
 * la abstracción inicial. Lo que se mueve es la mediana y los años buenos.
 *
 * **3. La fracción anual cae donde la literatura dice.** Con el grupo A da
 * **3,2 %** de la lluvia y con el B 4,4 %. Lo publicado para pastizales del oeste
 * de Estados Unidos es **menos del 5 %** de la precipitación anual (Gifford 1975;
 * Lauenroth y Sims 1976; Wight y Neff 1983; Carlson y otros 1990, citados por
 * Weltz y Blackburn) y lo medido en La Copita fue 3 a 6 %. No es una validación
 * —es una fracción agregada, no un evento— pero es la única cota de orden de
 * magnitud que hay y el cálculo cabe adentro.
 *
 * ## Con qué se corrió, que hay que decirlo
 *
 * El camino sembrado —el agua inicial de cada temporada medida de la humedad de
 * ERA5-Land, `aguaDelPerfil.ts`— **hoy no se enciende en Sidney**: el máximo de
 * la serie da 0,430 y ahí la identificación de textura queda ambigua entre
 * «media» y «media-fina», así que devuelve `null` y la ruta cae a la cadena. Para
 * medir sobre el camino principal se le **forzó** la clase «media», que es la que
 * el acta del 10/11/2026 registró.
 *
 * Y con esa clase forzada el sesgo contra los doce da **+0,070**, no el +0,061
 * que registra `LA_CADENA_LEE_ALTO_CONTRA_LOS_DOCE.con_el_agua_medida`. La
 * diferencia no se pudo cerrar: el máximo de la serie de humedad que Open-Meteo
 * entrega hoy es 0,430 y el acta anotó 0,434, y en Swift Current pasó de 0,435 a
 * 0,439, así que lo más probable es que el reanalísis se haya revisado entre un
 * día y el otro. **Los números de esta tabla son los de esta corrida**, y quedan
 * al lado de los otros en vez de reemplazarlos a escondidas.
 *
 * Sobre la cadena —que es lo que la ruta corre hoy en Sidney— el escurrimiento
 * mueve un poco más, porque la cadena arranca las temporadas más húmedas y por
 * lo tanto escurre antes: el sesgo baja de +0,140 a +0,126 con el grupo D, y el
 * `p10` de 0,677 a 0,649. Sigue siendo chico.
 */
export const EN_SIDNEY_NO_TOCA_LA_COLA_SECA = {
  sitio: 'Sidney, Montana (47,72 N / -104,16 O) — 66 temporadas de 84 días desde el 15 de abril, '
    + 'agua útil 50 mm por capa de 30 cm, Eo por Jensen-Haise',
  grupo_de_sidney: 'A',
  con_la_textura_forzada: 'media',
  sin_escurrimiento: { eam: 0.072, sesgo: 0.070, en_el_techo: 3, p10: 0.452, mediana: 0.820, yp_kg_ha: 1449 },
  por_grupo: [
    { grupo: 'A', cn: 49, esc_anual_pct: 3.2, esc_por_temporada_mm: 4.7, eam: 0.072, sesgo: 0.070, en_el_techo: 3, p10: 0.452, mediana: 0.820, yp_kg_ha: 1449 },
    { grupo: 'B', cn: 69, esc_anual_pct: 4.4, esc_por_temporada_mm: 7.7, eam: 0.071, sesgo: 0.069, en_el_techo: 3, p10: 0.452, mediana: 0.820, yp_kg_ha: 1449 },
    { grupo: 'C', cn: 79, esc_anual_pct: 5.4, esc_por_temporada_mm: 11.0, eam: 0.069, sesgo: 0.064, en_el_techo: 2, p10: 0.452, mediana: 0.818, yp_kg_ha: 1454 },
    { grupo: 'D', cn: 84, esc_anual_pct: 6.2, esc_por_temporada_mm: 13.7, eam: 0.067, sesgo: 0.059, en_el_techo: 2, p10: 0.452, mediana: 0.806, yp_kg_ha: 1482 },
  ],
  /** El `p10` sale igual con los cuatro grupos y sin escurrimiento. */
  el_p10_no_se_mueve: { valor: 0.452, grupos: 4, por_que: 'en temporada seca la retención es máxima y la lluvia chica no pasa la abstracción inicial' },
  /** Lo que la curva número hace casi todo el tiempo: renombrar el drenaje. */
  el_drenaje_se_convierte_en_escurrimiento_mm: { cn_49: 393, cn_84: 0, de: 'los 66 años corridos seguidos' },
  /** Lo publicado para pastizales del oeste, contra lo que da el cálculo. */
  contra_lo_publicado: {
    publicado_pct: 'menos del 5 % de la precipitación anual en pastizales del oeste de EE.UU.; '
      + '3 a 6 % medido en La Copita',
    nuestro_pct: { grupo_a: 3.2, grupo_b: 4.4, grupo_c: 5.4, grupo_d: 6.2 },
    no_es_una_validacion: 'es una fracción agregada de 66 años, no un evento medido',
  },
  /** Sobre la cadena, que es lo que la ruta corre hoy en Sidney. */
  sobre_la_cadena: {
    sin_escurrimiento: { eam: 0.142, sesgo: 0.140, p10: 0.677, mediana: 0.935 },
    grupo_d: { eam: 0.129, sesgo: 0.126, p10: 0.649, mediana: 0.917 },
  },
  /** Por qué hubo que forzar la textura, y qué no cerró. */
  la_textura_no_se_identifica_hoy: {
    maximo_de_la_serie: 0.430,
    anotado_en_el_acta: 0.434,
    que_pasa: 'con 0,430 la regla queda ambigua entre media (sat. 0,439) y media-fina (sat. 0,430) '
      + 'y devuelve null, así que la ruta cae a la cadena continua',
    y_el_sesgo_sembrado: { esta_corrida: 0.070, el_acta: 0.061 },
    swift_current: { esta_corrida: 0.439, el_acta: 0.435 },
  },
} as const;

/**
 * Dónde el escurrimiento sí pesa, y por qué igual no cambia los kilos.
 *
 * El segundo píxel es el de la pampa argentina (-34,0 / -61,0), que es el otro
 * extremo: 970 mm de lluvia anual, textura «fina» identificada sin ambigüedad, y
 * una temporada de 84 días desde el 1º de octubre.
 *
 * ```
 *                esc/lluvia anual   p10     mediana    Yp kg/ha
 *   sin escurrir       0 %         0,776    1,000       1.200
 *   grupo A (49)    10,1 %         0,776    1,000       1.200
 *   grupo B (69)    22,4 %         0,776    0,999       1.201
 *   grupo C (79)    ~24 %          0,773    0,998       1.202
 *   grupo D (84)    25,9 %         0,765    0,995       1.205
 * ```
 *
 * El escurrimiento es **siete veces mayor** que en Sidney y el índice se mueve
 * casi nada igual, porque ahí el índice está contra el techo: la mediana es
 * 1,000 y el agua no limita. O sea que el escurrimiento pesa donde el forraje no
 * lo nota, y no pesa donde sí.
 *
 * **Lo que esto sí destapa es una inconsistencia adentro de acequia**, y queda
 * declarada porque es la clase de cosa que imprime dos números plausibles y
 * distintos: `coefEscorrentiaAnual` de `cuenca.ts` —la tabla orientativa que
 * alimenta el rendimiento de la represa— da **0,13** para el grupo B en pastizal,
 * y este cálculo diario da **0,224** en el mismo píxel. En Sidney pasa al revés:
 * la tabla dice 0,08 para el grupo A y el cálculo diario da 0,032. Las dos cosas
 * responden preguntas distintas —una es una fracción media de diseño y la otra
 * una simulación día por día— pero difieren por un factor de 1,7 en un lado y
 * 2,5 en el otro, y eso no se arregla en este archivo.
 */
export const DONDE_SI_PESA = {
  sitio: 'Pampa argentina (-34,0 / -61,0) — 66 temporadas de 84 días desde el 1º de octubre',
  textura: 'fina',
  sin_escurrimiento: { p10: 0.776, mediana: 1.0, yp_kg_ha: 1200 },
  por_grupo: [
    { grupo: 'A', cn: 49, esc_anual_pct: 10.1, p10: 0.776, mediana: 1.0, yp_kg_ha: 1200 },
    { grupo: 'B', cn: 69, esc_anual_pct: 22.4, p10: 0.776, mediana: 0.999, yp_kg_ha: 1201 },
    { grupo: 'C', cn: 79, esc_anual_pct: null, p10: 0.773, mediana: 0.998, yp_kg_ha: 1202 },
    { grupo: 'D', cn: 84, esc_anual_pct: 25.9, p10: 0.765, mediana: 0.995, yp_kg_ha: 1205 },
  ],
  por_que_no_mueve: 'el índice de la pampa está contra el techo —mediana 1,000—, así que el agua '
    + 'que se va no limitaba nada',
  /** La inconsistencia que esto destapa, declarada y no resuelta. */
  contra_el_coeficiente_anual_de_la_app: {
    que_es: 'coefEscorrentiaAnual de cuenca.ts, la tabla orientativa que alimenta el rendimiento '
      + 'de la represa',
    pampa: { la_tabla: 0.13, el_calculo_diario: 0.224, grupo: 'B' },
    sidney: { la_tabla: 0.08, el_calculo_diario: 0.032, grupo: 'A' },
    que_hacer: 'nada en este archivo: responden preguntas distintas, pero la diferencia está medida '
      + 'y escrita para que nadie presente las dos como el mismo número',
  },
} as const;

// ─── Las funciones ───────────────────────────────────────────────────────────

/**
 * El `CN` de la condición antecedente **seca** (ARC I) que corresponde a un `CN`
 * de la condición media (ARC II), por la Tabla 10-1 del NEH-630.
 *
 * Interpola lineal entre dos filas publicadas, que es lo único que hace falta
 * abajo de 30 donde el manual publica de cinco en cinco. Devuelve `null` fuera
 * de [0, 100], que es el dominio del `CN`.
 */
export function cnSeco(cn_arc_ii: number): number | null {
  return deLaTabla(cn_arc_ii, 1);
}

/**
 * El `CN` de la condición antecedente **húmeda** (ARC III), por la misma tabla.
 *
 * No lo usa el balance: está porque el manual publica las dos columnas juntas,
 * porque el ejemplo 10-2 las compara, y porque el ajuste de pendiente de
 * Williams (1995) lo pediría si algún día se montara.
 */
export function cnHumedo(cn_arc_ii: number): number | null {
  return deLaTabla(cn_arc_ii, 2);
}

function deLaTabla(cn: number, columna: 1 | 2): number | null {
  if (!Number.isFinite(cn) || cn < 0 || cn > 100) return null;
  const filas = CN_DE_LA_TABLA_10_1;
  for (let i = 0; i < filas.length; i++) {
    const f = filas[i]!;
    if (cn === f[0]) return f[columna];
    if (cn > f[0]) {
      // Entre esta fila y la anterior, que tiene el CN más alto.
      const arriba = filas[i - 1];
      if (arriba === undefined) return f[columna];
      const peso = (cn - f[0]) / (arriba[0] - f[0]);
      return f[columna] + peso * (arriba[columna] - f[columna]);
    }
  }
  return filas[filas.length - 1]![columna];
}

/**
 * `Smx`, la retención máxima potencial con el perfil seco, en mm — la ecuación
 * 12 de ERHYM-II en forma SI.
 *
 * El `CN` que entra es el de la condición **seca** (ARC I), que es lo que pide la
 * ecuación: pasarle el de tabla sin convertir subestima la retención y por lo
 * tanto sobreestima el escurrimiento, que es la mitad del error de 8 a 12 veces
 * que midieron en La Copita.
 *
 * Devuelve `null` con un `CN` que no deja retención definida: en 0 la retención
 * es infinita y en 100 es cero, y las dos puntas son grados de «no corras esto»
 * más que números.
 */
export function retencionMaximaMm(cn_arc_i: number): number | null {
  if (!Number.isFinite(cn_arc_i) || cn_arc_i <= 0 || cn_arc_i >= 100) return null;
  return 25400 / cn_arc_i - 254;
}

/**
 * `S` del día, en mm — la ecuación 11: la retención escalada por cuánta agua
 * tiene el perfil.
 *
 * `sws_mm` es el agua útil del perfil entero medida sobre el límite inferior, y
 * `ul_mm` su capacidad; son exactamente las dos cantidades que el balance ya
 * lleva. Con el perfil seco devuelve `Smx` y con el perfil lleno devuelve 0, que
 * es toda la lluvia escurriendo.
 *
 * Se recorta a [0, Smx] porque la capa superficial del balance puede bajar por
 * debajo del límite inferior —el agua de suelo seco al aire— y eso daría un `S`
 * mayor que el máximo.
 */
export function retencionDelDiaMm(smx_mm: number, sws_mm: number, ul_mm: number): number {
  if (!Number.isFinite(smx_mm) || smx_mm <= 0) return 0;
  if (!Number.isFinite(ul_mm) || ul_mm <= 0) return 0;
  const lleno = Math.max(0, Math.min(1, sws_mm / ul_mm));
  return smx_mm * (1 - lleno);
}

/**
 * El escurrimiento de un día, en mm — la ecuación 10, la curva número de
 * siempre con `Ia = 0,2·S`.
 *
 * Es la misma ecuación que `escurrimientoSCS` de `cuenca.ts`, escrita en función
 * de `S` en vez de en función del `CN`, porque acá `S` cambia todos los días.
 * Hay un test que compara las dos.
 */
export function escurrimientoDelDiaMm(pptn_mm: number, s_mm: number): number {
  if (!Number.isFinite(pptn_mm) || pptn_mm <= 0) return 0;
  if (!Number.isFinite(s_mm) || s_mm <= 0) return pptn_mm;
  const ia = 0.2 * s_mm;
  if (pptn_mm <= ia) return 0;
  return (pptn_mm - ia) ** 2 / (pptn_mm + 0.8 * s_mm);
}

/**
 * El `CN` de condición media de un pastizal sobre un grupo hidrológico dado.
 *
 * Sale de `COBERTURAS` de `cuenca.ts`, que es la tabla 9-1 del NEH-630, en la
 * entrada `pastura_regular`. La condición hidrológica —cuánto suelo cubre el
 * pastizal— no la declara nadie, así que se toma **la neutra**, que es la misma
 * decisión que ya toma `hidrologiaPredio.ts` cuando mapea el pastizal de
 * WorldCover. Que las dos coincidan no es casual: es un predio y un CN.
 *
 * La diferencia entre las tres condiciones no es chica —en grupo B, 61 en buen
 * estado, 69 regular y 79 sobrepastoreado— y está declarada en
 * `ADVERTENCIAS_ESCURRIMIENTO.la_condicion_hidrologica_no_se_declara`.
 */
export function cnDePastizal(grupo: GrupoHidro): number | null {
  const cob = COBERTURAS.find(c => c.id === 'pastura_regular');
  return cob ? cob.cn[grupo] : null;
}
