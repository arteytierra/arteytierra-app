/**
 * El índice de suficiencia hídrica **año por año**, y el forraje de cada año.
 *
 * ## Qué faltaba
 *
 * `forrajeCorte.ts` cierra la mitad de la cadena: del corte de pasto del predio
 * sale el `Yp`, el techo del sitio. Pero el `Yp` **no es el pasto de un año** —es
 * lo que el campo daría con el agua sin limitar— y cargarlo en el campo «Forraje
 * (kg MS/ha·año)» dimensionaría el rodeo para un año que puede no llegar. La
 * ecuación 1 de Wight y Hanks necesita el índice del año que se quiere
 * planificar:
 *
 *     Y = Yp · (T / Tp)
 *
 * Y el índice de un año pasado no está tabulado en ninguna parte: hay que correr
 * el balance diario de esa temporada. Una corrida por año. Eso es este archivo.
 *
 * ## Las tres decisiones que hubo que tomar, y lo que se midió de cada una
 *
 * **1. La ventana de la temporada no se mueve con el año.** El usuario sabe
 * cuándo rebrotó y cuándo cortó *su* año; de los otros treinta y cuatro no sabe
 * nada. Acá se usa la misma ventana de calendario —mismo mes y día de arranque,
 * misma cantidad de días— para todos. Es lo que hizo el trabajo original en la
 * punta de arranque (15 de abril, todos los años) y no en la de cierre (al pico,
 * de 68 a 99 días según el año). Cuánto importa está medido en
 * `LA_VENTANA_NO_SE_MUEVE_CON_EL_ANIO`.
 *
 * **2. El agua inicial del perfil sale de la cadena, no de un supuesto.** Para
 * un corte suelto el agua del perfil al arranque de la temporada es el dato
 * desconocido que más pesa, y `forrajeCorte.ts` devuelve una banda por eso. Acá
 * desaparece: el balance corre **continuo** sobre toda la serie —`b = 0` fuera
 * de la temporada, pastura dormida, igual que `sembrarPerfil`— así que cada
 * temporada arranca con el agua que dejó la anterior. Lo único desconocido es
 * con qué arrancó la cadena, y eso se olvida: cuánto tarda está medido en
 * `LA_CADENA_OLVIDA_EL_ARRANQUE`.
 *
 * **3. La nieve no se acumula.** El modelo no tiene nieve: la precipitación de
 * un día entra al perfil ese día. En un sitio de invierno frío eso corre el agua
 * del deshielo meses hacia atrás, donde tiene tiempo de evaporarse. Cuánta agua
 * se mueve de lugar está medido en `LA_NIEVE_NO_SE_ACUMULA`, y el sesgo que deja
 * tiene signo conocido.
 *
 * ## Y lo que apareció al medir
 *
 * Cuatro cosas, en orden de lo que cuestan.
 *
 * **El error de la `Eo` no se cancela a lo largo de la cadena: crece.** El
 * forraje de un año es `Yp · índice`, y el `Yp` sale de dividir por otro índice,
 * así que lo razonable era esperar que un error de escala en la demanda
 * atmosférica se fuera por el cociente. Medido, no: con la `Eo` un 14 % alta el
 * `Yp` solo se mueve 11,6 % y el forraje del peor año se mueve **54,7 %**, porque
 * con el agua muy limitada el índice no responde en proporción. Leer Jensen-Haise
 * (1963) pasó de deuda a deuda cara. Ver `EL_ANIO_SECO_LO_DECIDE_LA_EO`.
 *
 * **Un año bueno da 1,47 veces el forraje de uno malo** entre el p90 y el p10 del
 * mismo potrero, y 18 de 63 temporadas quedaron por debajo del año promedio. Que
 * el año promedio sobreestoque está publicado; acá está por cuánto, y por qué el
 * número medido da 28,6 % y no 50. Ver `EL_PROMEDIO_SOBREESTOCA`.
 *
 * **La lluvia anual explica el 26 % de la varianza del índice** en el sitio donde
 * el modelo está validado. Es la única variable que mira `prodForrajera`. Ver
 * `LA_LLUVIA_ANUAL_NO_PREDICE_EL_ANIO`.
 *
 * **Y el peor año de los 63 es el que fue**: 1988, el año que la estación del
 * propio sitio midió a 45,7 % de lo normal. Es un chequeo de una sola dirección y
 * es el único que hay. Ver `EL_ANIO_MAS_SECO_ES_EL_QUE_FUE`.
 *
 * **Y la tercera degradación declarada del balance se pagó el 09/11/2026**: la
 * extracción de las capas de 30-60 y 60-90 cm ya se restringe por temperatura de
 * suelo, como en el trabajo original. Destapa el techo del índice —de 10 de 12
 * temporadas saturadas a 4— pero **deja en pie las tres cuartas partes del
 * sesgo**. Ver `EL_FACTOR_DESTAPA_EL_TECHO_PERO_NO_EL_SESGO` y
 * `lib/actividadRadicular.ts`. Todas las mediciones de abajo son de esa corrida.
 *
 * De paso, la corrida de 65 años delató **dos avisos mal puestos** del balance: el
 * de la `Eo` fuera de rango se evaluaba con los inviernos adentro y salía siempre,
 * y el del `b` por defecto **desaparecía** justo porque la cadena pasa el `b` día
 * por día. Los dos están corregidos acá, con el motivo al lado: un aviso que sale
 * siempre no avisa, y una degradación que se calla al cambiar la forma de llamar a
 * la función es peor que no tenerla.
 *
 * ## Unidades y rango de validez
 *
 * Todo el agua en mm. El índice es adimensional en [0, 1]. El forraje en
 * kg MS/ha de **materia en pie al pico**, que es la magnitud del `Yp` y la que
 * pide la cadena de abajo (ver `EL_PICO_NO_ES_LA_PRODUCCION_ANUAL` en
 * `forrajeCorte.ts`). El rango de validez es el del balance —pradera mixta del
 * norte de las Grandes Planicies, escurrimiento nulo, perfil de 90 cm en tres
 * capas— más el de cada decisión de acá.
 *
 * ## Qué se rompe si cambia
 *
 * Lo consume el bloque del corte de forraje del panel de Pastoreo, que es el que
 * escribe el campo «Forraje», que alimenta la carga animal, el rodeo y el agua de
 * bebida. Un índice alto de más es una carga alta de más.
 */
import {
  type DiaDeBalance,
  type EntradasBalanceForraje,
  type ResultadoBalanceForraje,
  ADVERTENCIAS,
  B_PRADERA_MIXTA,
  EO_DIARIA_DE_LA_PRUEBA,
  TEMPORADA_DE_LA_PRUEBA,
  correrBalanceForraje,
} from './forrajeBalance';
import {
  type AvisoDeCorte,
  type DiaDeSerie,
  type Direccion,
  AVISO_ETO,
  EL_AGUA_INICIAL_NO_SE_OLVIDA,
  capasDe90,
  eoDelDia,
} from './forrajeCorte';
import {
  AVISO_EO_JENSEN_HAISE,
  type CoeficientesEo,
} from './eoJensenHaise';
import {
  actividadDeLasCapas,
  AVISO_ACTIVIDAD_RADICULAR,
} from './actividadRadicular';
import { avisoDelAguaInicial } from './aguaDelPerfil';
import { avisoDelEscurrimiento } from './escurrimientoForraje';

// ─── El sitio donde se midió todo lo de este archivo ─────────────────────────

/**
 * Sidney, Montana: el sitio de validación de Wight y Hanks (1981), y el mismo
 * donde se despejó el `Yp` a 0,02 %.
 *
 * Todo lo que este archivo mide se midió ahí a propósito. Es el único lugar del
 * mundo donde se sabe, con el número publicado al lado, que esta cadena de
 * cálculo da bien: medir una sensibilidad donde el modelo no está validado
 * mezclaría el efecto que se busca con el error del modelo.
 *
 * La serie es Open-Meteo / ERA5 diaria, 1960-2024, **23.742 días sin un solo
 * hueco**, con la ventana del trabajo —15 de abril, 84 días, la mediana de los 68
 * a 99 de los doce años de la prueba— y el perfil de 90 cm en tres capas de 50 mm
 * de agua útil cada una, que son los 150 mm de `AWC_POR_DEFECTO_MM`.
 *
 * Para dar una idea de la escala: ahí llueven 425 mm al año y 178 mm en la
 * temporada de crecimiento.
 */
export const SITIO_DE_LA_MEDICION = {
  nombre: 'Sidney, Montana (EE.UU.)',
  lat: 47.72,
  lng: -104.16,
  serie:
    'Open-Meteo / ERA5 diaria, 1960-01-01 a 2024-12-31, 23.742 días, sin nulos. Lluvia, '
    + 'radiación global y temperaturas máxima y mínima: la Eo se calcula por Jensen-Haise '
    + 'modificada con las normales del mes más cálido de la propia serie.',
  ventana: { arranque: '04-15', dias: 84 },
  aw_por_capa_mm: [50, 50, 50],
  lluvia_anual_mm: 425.5,
  lluvia_de_la_temporada_mm: 177.8,
  anios_que_quedan: 62,
  por_que_ahi: 'es el único sitio donde esta cadena tiene un valor publicado al lado contra el que compararse',
} as const;

// ─── Las tres decisiones, medidas ────────────────────────────────────────────

/**
 * La ventana de calendario no se mueve con el año, y cuánto cuesta eso.
 *
 * El pastizal no rebrota el mismo día todos los años: en un año frío o seco
 * arranca más tarde. La punta de arranque está respaldada —el trabajo usó el 15
 * de abril fijo para los doce años— y la de cierre no: el trabajo cortó al pico
 * de cada año, y eso varió de 68 a 99 días.
 *
 * Medido en Sidney, cociente contra la ventana del trabajo:
 *
 * ```
 *                            mediana del índice      p10
 *  arranque −15 días              0,971×            1,106×
 *  arranque +15 días              0,871×            0,801×
 *  largo 68 días (mínimo)         0,968×            1,029×
 *  largo 99 días (máximo)         0,941×            0,867×
 * ```
 *
 * Dos cosas para leer de ahí. La primera es que **la ventana importa**: quince
 * días de arranque mueven el índice entre un 6 y un 24 % según el percentil y el
 * lado, y el largo de la temporada todavía más, porque alargarla agrega demanda
 * sin agregar perfil.
 *
 * La segunda es la que decide el diseño, y **no es la que yo había escrito antes
 * de mirar las cuatro filas**. Había puesto que el `p10` se mueve siempre más que
 * la mediana —que la ventana pesa más en los años secos, que son los que deciden
 * la carga—; de los cuatro casos eso vale en dos. El patrón real es asimétrico:
 * cuando la ventana le **da** más agua al pastizal (arranque adelantado,
 * temporada más corta) el `p10` se mueve más que la mediana; cuando se la
 * **quita**, menos.
 *
 * Lo que queda, que es más débil y es verdad: la ventana **no desplaza la
 * distribución, le cambia la forma**. Y eso importa para el diseño porque
 * significa que una ventana equivocada no se puede corregir después con un
 * factor. Por eso las dos fechas las declara el usuario y no las pone la app, y
 * por eso el aviso de la ventana sale siempre.
 */
export const LA_VENTANA_NO_SE_MUEVE_CON_EL_ANIO = {
  del_trabajo: { arranque: '04-15', dias_minimo: 68, dias_maximo: 99, dias_mediana: 84 },
  /** Cociente contra la ventana del trabajo, en la mediana del índice y en el p10. */
  cocientes: {
    arranque_menos_15: { mediana: 0.971, p10: 1.106 },
    arranque_mas_15: { mediana: 0.871, p10: 0.801 },
    largo_68: { mediana: 0.968, p10: 1.029 },
    largo_99: { mediana: 0.941, p10: 0.867 },
  },
  /**
   * Con el invierno simulado de la cadena, antes de sembrar el perfil con la
   * humedad del reanálisis. La mediana no se movía casi nada porque estaba
   * pegada al techo; ahora que bajó a 0,83 se mueve hasta un 13 %.
   */
  con_la_cadena_daba: {
    arranque_menos_15: { mediana: 1.0003, p10: 1.104 },
    arranque_mas_15: { mediana: 0.962, p10: 0.759 },
    largo_68: { mediana: 1.006, p10: 1.101 },
    largo_99: { mediana: 0.968, p10: 0.760 },
  },
  /** Sin el factor de actividad radicular el p10 se movía casi el doble. */
  sin_el_factor_daba: {
    arranque_menos_15: { mediana: 1.001, p10: 1.204 },
    arranque_mas_15: { mediana: 0.923, p10: 0.699 },
    largo_68: { mediana: 1.001, p10: 1.223 },
    largo_99: { mediana: 0.928, p10: 0.705 },
  },
  /**
   * La mediana y el `p10` no se mueven en la misma proporción, así que una
   * ventana equivocada no se corrige después con un factor.
   */
  no_desplaza_la_distribucion: true,
  /** El patrón real, asimétrico, de las cuatro filas medidas. */
  el_p10_se_mueve_mas:
    'en tres de las cuatro variantes: el p10 se mueve de 2,9 a 19,9 % y la mediana de 2,9 a '
    + '12,9 %. La excepción es acortar la temporada a 68 días, donde los dos se mueven casi lo '
    + 'mismo. Con el agua inicial medida la mediana se despegó del techo —0,83 contra 0,93— así '
    + 'que ahora también tiene a dónde moverse, y la asimetría de antes se achicó: lo que sigue '
    + 'en pie es que la ventana se ve más en la cola seca, que es la que decide una carga.',
  /**
   * Medido antes con la ETo de FAO-56, el patrón era asimétrico: el p10 se movía
   * más sólo cuando la ventana le daba más agua. Con la `Eo` de Jensen-Haise se
   * mueve más en las cuatro, porque la mediana ya no tiene a dónde subir.
   */
  con_la_eto_era_asimetrico: true,
  que_se_hace: 'las dos fechas las declara el usuario para su propio año y se repiten en los demás; el aviso sale siempre',
  por_que_no_se_corrige:
    'No hay forma de saber qué día rebrotó un pastizal en 1987, y estimarlo con la '
    + 'temperatura sería otro modelo sin validar encadenado a este.',
} as const;

/**
 * Cuánto sobrevive el agua con la que arrancó la cadena, y por qué el número no
 * se puede clavar.
 *
 * Para un corte suelto esto era una banda. `EL_AGUA_INICIAL_NO_SE_OLVIDA` midió
 * que calentar el perfil con la lluvia real de 270 días previos cierra la
 * incertidumbre en una temporada húmeda y **no** en una seca, donde quedaba 2,82×
 * de ancho. Una cadena de décadas es otra cosa: alcanza con que pase un año
 * húmedo para que el perfil se llene y se olvide de todo.
 *
 * Medido en Sidney, corriendo la cadena entera dos veces —del perfil vacío y del
 * lleno— y comparando el índice de cada temporada:
 *
 * ```
 *  temporada 1:  73,4 %
 *  temporada 2:  21,4 %
 *  temporada 3:   0,385 %
 *  temporada 4 y todas las que siguen:  menos de 0,05 %
 * ```
 *
 * Tres temporadas. **Y ese tres es de Sidney, no del método.** El primer test de
 * este módulo corre una serie sintética más árida —unos 230 mm de lluvia contra
 * 840 de demanda anual— y ahí a la cuarta temporada la cadena todavía arrastraba
 * un **9,5 %** de su arranque, porque ninguna temporada llega a llenar el perfil
 * y entonces no hay nada que lo borre. El mecanismo es el que dice el motivo de
 * abajo, y donde ese mecanismo no ocurre, el descarte no alcanza.
 *
 * Por eso `indicesPorAnio` **no usa este número**: corre la cadena dos veces y
 * marca, temporada por temporada, las que todavía no coinciden. Cuesta una
 * corrida más de milisegundos y es correcto en cualquier clima. En un sitio donde
 * nunca converja, todas las temporadas salen marcadas y no hay distribución: ésa
 * es la respuesta honesta y no un número con tres años menos.
 */
export const LA_CADENA_OLVIDA_EL_ARRANQUE = {
  /** Diferencia relativa del índice entre arrancar la cadena vacía y llena, en %. */
  en_sidney_pct: { t1: 60.679, t2: 38.622, t3: 0.308, t4_en_adelante_maximo: 0.308 },
  temporadas_en_sidney: 2,
  /** Sin el factor de actividad radicular hacían falta tres: 65,5 / 31,9 / 1,2 %. */
  sin_el_factor_daba: { t1: 65.477, t2: 31.882, t3: 1.158, temporadas: 3 },
  /** La serie sintética del test, más árida: ahí tres temporadas no alcanzan. */
  en_una_serie_arida_pct: { t4_en_adelante_maximo: 9.5 },
  /** Debajo de esto se considera que las dos cadenas son la misma. */
  umbral_por_defecto_pct: 0.5,
  no_se_clava: true,
  por_que_no_se_clava:
    'El tres de Sidney sale de que ahí alguna temporada llena el perfil. Donde la lluvia nunca '
    + 'alcanza para eso, el arranque sobrevive indefinidamente, así que el descarte se mide por '
    + 'corrida: la cadena corre dos veces y se marcan las temporadas que todavía no coinciden.',
  contra_el_corte_suelto:
    'Calentar 270 días antes de una temporada seca dejaba la banda del Yp en 2,82 veces de '
    + 'ancho. En Sidney la cadena la cierra a menos de 0,05 % en cuatro temporadas.',
  por_que_alcanza_cuando_alcanza:
    'Basta una temporada húmeda para llenar el perfil y borrar con qué se arrancó. En una serie '
    + 'de décadas eso suele pasar temprano; en un clima árido puede no pasar nunca.',
  /**
   * Y lo que esta prueba **no** cubre, que se descubrió al cambiar la `Eo`.
   *
   * La convergencia mide si se olvida **el estado inicial**, que ocurre una sola
   * vez. No dice nada de la demanda atmosférica de **fuera de temporada**, que
   * se repite todos los inviernos y decide con cuánta agua arranca cada
   * temporada: ahí las dos cadenas convergen igual de rápido y aterrizan en
   * distribuciones distintas. Ver `EL_INVIERNO_DECIDE_LA_COLA_SECA`.
   */
  no_cubre_el_invierno:
    'La convergencia dice que se olvida el estado inicial, no que la demanda de fuera de '
    + 'temporada esté bien. Esa se repite cada año y no se cancela nunca.',
  /**
   * Y desde el 09/11/2026 esto es el **camino de respaldo**: si la serie trae la
   * humedad de suelo del reanálisis, cada temporada arranca con el agua medida y
   * no hay cadena, ni inviernos que correr, ni temporadas que descartar. Todo
   * esto sigue valiendo para una serie que no la traiga. Ver `aguaDelPerfil.ts`.
   */
  ya_no_es_el_camino_principal: true,
} as const;

/**
 * La nieve no se acumula, y el sesgo que eso deja tiene signo conocido.
 *
 * El modelo no tiene nieve: la precipitación de un día entra al perfil ese día.
 * En un sitio de invierno frío el agua del deshielo queda contabilizada meses
 * antes de cuando llega de verdad, con todo ese tiempo para que la capa
 * superficial la evapore.
 *
 * Medido en Sidney: el **17 %** de la precipitación de 65 años cae en días de
 * temperatura media bajo cero —4.695 de 27.658 mm—. Eso acota cuánta agua está
 * puesta en el mes equivocado; no es cuánto error produce, porque parte de esa
 * agua igual habría drenado o evaporado.
 *
 * **El perfil arranca la temporada más seco de lo que estaría**, así que el
 * índice sale bajo. Para dimensionar una carga animal ése es el lado barato; para
 * despejar un `Yp` es el caro, porque el despeje divide por el índice. Es una de
 * las razones por las que el `Yp` se despeja de la temporada que el usuario midió
 * —donde el agua del perfil se puede declarar— y no de un año cualquiera de la
 * cadena.
 */
export const LA_NIEVE_NO_SE_ACUMULA = {
  fraccion_bajo_cero_pct: 17,
  medido: { total_mm: 27658, en_dias_bajo_cero_mm: 4695 },
  umbral: 'temperatura media diaria bajo 0 °C, Open-Meteo / ERA5',
  sesgo_del_indice: 'bajo' as Direccion,
  por_que:
    'El agua del deshielo entra al perfil el día que nevó, meses antes de cuando llega, '
    + 'y en el medio la capa superficial la evapora. La temporada arranca más seca.',
  donde_no_importa: 'donde la temperatura media no baja de cero, o sea el trópico y el subtrópico',
  /**
   * Y cuánto es, que se pudo medir al cambiar la `Eo`: **casi nada**.
   *
   * Se corrió la cadena con la lluvia de los días bajo cero acumulada hasta el
   * primer día sobre cero, que es un deshielo grosero pero acota. Con la `Eo` de
   * Jensen-Haise mueve el p10 un **0,8 %** y la mediana un 0,03 %. Con la ETo de
   * FAO-56 movía el p10 un 11 % y el agua inicial del perfil un 16 %.
   *
   * El motivo es la `Eo` de los días helados: Jensen-Haise devuelve **0,12
   * mm/día** promediados sobre los 6.992 días bajo cero de la serie, porque su
   * intercepto de temperatura está en −6,5 °C. La ETo de referencia de FAO-56
   * devuelve 0,72, seis veces más, que sobre 6.992 días son cinco metros de
   * demanda que el pastizal helado no tiene. La degradación que estaba anotada
   * acá era, en buena medida, la sustitución de la `Eo`.
   */
  medido_con_deshielo_diferido: {
    con_jensen_haise: { p10_pct: -0.8, mediana_pct: -0.45 },
    /** Antes de montar el factor de actividad radicular daba +0,8 % en el p10. */
    sin_el_factor_de_actividad_radicular: { p10_pct: 0.8, mediana_pct: -0.03 },
    con_la_eto_de_fao_56: { p10_pct: 11.0, agua_inicial_pct: 16.1 },
    eo_de_los_dias_bajo_cero_mm_dia: { jensen_haise: 0.122, eto_fao_56: 0.719, dias: 6992 },
  },
  /**
   * Y con el agua inicial medida la degradación **desaparece**, que es el
   * resultado esperable y conviene tenerlo medido: diferir el deshielo mueve el
   * `p10` y la mediana **0,00 %**, exactamente cero.
   *
   * El motivo es que la nieve nunca molestó adentro de la temporada: molestaba
   * en el invierno que la cadena simulaba para llegar al 15 de abril. Si el agua
   * de ese 15 de abril está medida, lo que haya hecho la nieve antes ya está
   * adentro del dato.
   */
  con_el_agua_medida: { p10_pct: 0, mediana_pct: 0, dejo_de_aplicar: true },
} as const;

// ─── Lo que apareció al medir ────────────────────────────────────────────────

/**
 * El año promedio sobreestoca, y acá está por cuánto.
 *
 * Está publicado, y es la razón de ser de este archivo. Texas A&M AgriLife
 * Extension, sobre la carga animal calculada con la lluvia media:
 *
 * > «the range will be overstocked at least half the time»
 *
 * Medido con el modelo en las 62 temporadas de Sidney, la distribución del índice
 * es:
 *
 * ```
 *  mínimo  0,051  ·  p10  0,194  ·  p25  0,344  ·  mediana  0,675
 *  p75     0,882  ·  p90  0,985  ·  máximo  1,000  ·  promedio  0,603
 * ```
 *
 * De donde salen las dos cifras que importan. **Un año bueno da 5,1 veces el
 * forraje de un año malo** en el mismo potrero y con el mismo `Yp` —p90 sobre
 * p10—: eso no es incertidumbre del cálculo, es la variabilidad del lugar, y es
 * lo que un solo número de forraje no puede contener. Y **29 de las 62 temporadas
 * quedaron por debajo del año promedio**, el 46,8 %.
 *
 * Ese 46,8 y no 50 tiene una razón, y conviene decirla porque corrige la cita
 * para abajo: el índice **no puede pasar de 1**, así que la distribución está
 * sesgada a la izquierda y el promedio (0,603) queda por debajo de la mediana
 * (0,675). Contra la mediana, en cambio, la mitad de los años queda corta por
 * definición. La conclusión práctica es la misma que la publicada: el año
 * promedio no es un año conservador.
 */
export const EL_PROMEDIO_SOBREESTOCA = {
  cita: 'the range will be overstocked at least half the time',
  fuente:
    'Lyons, R. K., y Machen, R. V. — «Stocking Rate: The Key Grazing Management Decision», '
    + 'Texas A&M AgriLife Extension, RWFM-PU-060 (2001)',
  tambien_publicado:
    'el mismo trabajo dice que en uno de cada dos años la lluvia queda por debajo de la media',
  medido_en_sidney: {
    anios: 65,
    anios_bajo_el_promedio: 27,
    fraccion_bajo_el_promedio_pct: 41.5,
    indice: {
      minimo: 0.166, p10: 0.451, p25: 0.611, mediana: 0.831,
      p75: 0.938, p90: 0.984, maximo: 1, promedio: 0.755,
    },
    /** `p90/p10`: cuántas veces más forraje da un año bueno que uno malo. */
    ancho: 2.18,
    /**
     * El cuarto de arriba **se despegó del techo** al montar el factor de
     * actividad radicular: antes `p75`, `p90` y el máximo eran los tres 1,000 y
     * el índice no distinguía entre una temporada de cada cuatro. Ahora el p75
     * da 0,975 y el p90 0,990, y hay cinco mejores años que se pueden nombrar.
     * Lo que no cambió es el signo: la distribución sigue pegada al tope y el
     * `ancho` sigue sin medir lo que parece medir.
     */
    el_cuarto_de_arriba_esta_en_el_techo: false,
    /**
     * Con el invierno simulado de la cadena, antes de sembrar el perfil con la
     * humedad del reanálisis: la distribución entera estaba corrida para arriba
     * y sólo 28,6 % de los años quedaban bajo el promedio. Con el agua medida da
     * **41,5 %**, que es bastante más cerca del «al menos la mitad» publicado.
     */
    con_la_cadena_daba: {
      anios: 63, anios_bajo_el_promedio: 18, fraccion_bajo_el_promedio_pct: 28.6,
      indice: {
        minimo: 0.161, p10: 0.672, p25: 0.852, mediana: 0.935,
        p75: 0.975, p90: 0.990, maximo: 1, promedio: 0.869,
      },
      ancho: 1.473,
    },
    sin_el_factor_daba: {
      indice: { minimo: 0.157, p10: 0.741, p25: 0.896, mediana: 0.999, p75: 1, p90: 1, promedio: 0.908 },
      ancho: 1.35,
      anios: 62,
      el_cuarto_de_arriba_en_el_techo: true,
    },
  },
  /**
   * Medido antes con la ETo de FAO-56, esta misma distribución daba mediana
   * 0,675, p10 0,194 y ancho 5,08, con 29 de 62 bajo el promedio. La `Eo` del
   * modelo la mueve entera para arriba. Las dos están en
   * `EL_INVIERNO_DECIDE_LA_COLA_SECA`, que es donde se explica cuánto de esa
   * diferencia queda sin resolver.
   */
  con_la_eto_daba: { mediana: 0.675, p10: 0.194, ancho: 5.08, bajo_el_promedio_pct: 46.8 },
  por_que_no_da_50:
    'El índice no puede pasar de 1, así que la distribución queda sesgada a la izquierda y el '
    + 'promedio (0,869) cae por debajo de la mediana (0,935). Contra la mediana la mitad de los '
    + 'años queda corta por definición. Con el factor de actividad radicular el techo dejó de '
    + 'estar poblado —el p75 bajó de 1,000 a 0,975— pero la asimetría sigue.',
  que_se_hace:
    'se muestra la distribución y el año del registro que le corresponde a cada percentil, y la '
    + 'elección del año que se planifica queda del usuario: no hay un percentil publicado para '
    + 'esa decisión y acequia no lo inventa.',
} as const;

/**
 * La lluvia anual no predice el año, y es la única variable que mira
 * `prodForrajera`.
 *
 * `prodForrajera` es la escalera de cinco escalones por lluvia anual que todavía
 * multiplica la carga, el rodeo y el agua de bebida cuando nadie cortó pasto. Ya
 * se sabía que **no tiene fuente** y que se equivoca en las dos direcciones
 * —hasta 11× alta en el altiplano y 2,3× baja en Dakota, medido en
 * `forrajeMedido.ts`—. Esto mide algo más de fondo: que la variable que mira no
 * alcanza ni en el sitio donde el modelo está validado.
 *
 * Coeficiente de determinación del índice contra la lluvia, Sidney, 62
 * temporadas:
 *
 * ```
 *  lluvia del año calendario   R² = 0,207
 *  lluvia de la temporada      R² = 0,522
 * ```
 *
 * La lluvia de la temporada explica el doble que la del año, como era de esperar,
 * y **ninguna de las dos alcanza**: con la lluvia anual queda sin explicar el
 * 79 % de la varianza del índice. El resto se lo llevan cuándo llovió, con qué
 * agua arrancó el perfil y cuánta demanda atmosférica hubo —el agua inicial de la
 * cadena fue de 1 a 148 mm de los 150 posibles—, que es exactamente lo que el
 * balance diario calcula y una escalera por totales no puede.
 */
export const LA_LLUVIA_ANUAL_NO_PREDICE_EL_ANIO = {
  r2_contra_lluvia_del_anio: 0.265,
  r2_contra_lluvia_de_la_temporada: 0.546,
  /** El agua con la que arrancó cada temporada, en mm, sobre 150 de tope. */
  agua_inicial_medida_mm: { minimo: 19.2, maximo: 150, promedio: 79.6 },
  /**
   * Con el invierno simulado de la cadena daban 0,256 y 0,428, con el perfil
   * arrancando en 121,1 mm de promedio. Sembrar la temporada con la humedad
   * medida **sube** lo que explica la lluvia de la temporada: con el perfil casi
   * lleno todos los años, la lluvia tenía menos de qué decidir.
   */
  con_la_cadena_daba: {
    r2_anual: 0.256, r2_temporada: 0.428,
    agua_inicial_mm: { minimo: 32.3, maximo: 150, promedio: 121.1 },
  },
  /** Sin el factor de actividad radicular daban 0,219 y 0,357. */
  sin_el_factor_daba: { r2_anual: 0.219, r2_temporada: 0.357 },
  /** Con la ETo de FAO-56 daban 0,207 y 0,522, y el agua inicial 0,1 a 147,6. */
  con_la_eto_daba: {
    r2_anual: 0.207, r2_temporada: 0.522,
    agua_inicial_mm: { minimo: 0.1, maximo: 147.6, promedio: 51.4 },
  },
  que_se_lleva_el_resto: 'cuándo llovió, con qué agua arrancó el perfil y cuánta demanda atmosférica hubo',
  por_que_importa:
    'prodForrajera decide el forraje con la lluvia anual y nada más. Esto mide el techo de lo '
    + 'que esa variable puede explicar, en el único sitio donde la cadena está validada.',
} as const;

/**
 * Las dos mitades del error de la `Eo`, separadas, y la `Eo` reemplazada.
 *
 * El lote anterior dejó esta deuda: el balance usaba la ETo de referencia de
 * FAO-56 y el trabajo usó la `Eo` de Jensen-Haise (1963), el cociente medido era
 * de 1,14 a 1,20, y separar las dos causas —superficie de referencia contra
 * sesgo de ERA5— necesitaba leer el trabajo de 1963. Se leyó. Las dos mitades
 * están medidas en `LAS_DOS_MITADES_DEL_ERROR_DE_LA_EO`, en
 * `lib/eoJensenHaise.ts`, y el resultado corto es:
 *
 * - **el sesgo de ERA5 en ese píxel es chico**: la temperatura media diaria no
 *   tiene sesgo contra la estación del lugar (−0,02 °C en 1.066 días) y la
 *   radiación lee 2,2 % alta contra NASA POWER, que es satelital;
 * - **la superficie de referencia es casi todo el resto**: con la `Eo` calculada
 *   por el método del trabajo sobre la misma serie, el cociente contra la Tabla 1
 *   baja de 1,162 a 1,015.
 *
 * Así que la cadena **ya no usa la ETo**: calcula la `Eo` por Jensen-Haise
 * modificada cuando la serie trae radiación y temperaturas. Con eso, el `b`
 * publicado reproduce la columna `Tp` de la Tabla 1 con **+1,3 %** de error
 * medio, donde con la ETo daba **+16,5 %** y hasta +35,6 %.
 *
 * ## La amplificación que estaba medida acá sigue siendo cierta, y ya no aplica
 *
 * Lo que este bloque decía —que un error de escala en la `Eo` no se cancela en
 * el cociente de dos índices sino que crece, del 11,6 % en el `Yp` solo al
 * 54,7 % en el forraje del peor año— **se midió y está bien**. Lo que cambió es
 * que ese error de escala ya no existe por construcción: era la sustitución, y
 * la sustitución se fue. Queda como la razón por la que no se podía dejar así.
 *
 * ## Y lo que apareció debajo
 *
 * La `Eo` de la temporada quedó anclada contra un valor publicado, pero la de
 * **fuera de temporada** no, y es la que decide con cuánta agua arranca cada
 * temporada. Eso es lo que ahora domina la cola seca de la distribución, y está
 * medido aparte en `EL_INVIERNO_DECIDE_LA_COLA_SECA`.
 */
export const EL_ANIO_SECO_LO_DECIDE_LA_EO = {
  /** La `Eo` de Jensen-Haise en la temporada de Sidney, mm/día. */
  eo_del_modelo_mm_dia: { media_62_anios: 3.945, media_1968_1979: 3.816, minimo: 3.267, maximo: 5.443 },
  /** Sobre las 65 temporadas que quedan con el agua medida: 3,949 mm/día. */
  eo_del_modelo_sobre_65_anios_mm_dia: 3.949,
  /** La ETo de FAO-56 de ERA5 en la misma ventana, que es lo que se usaba antes. */
  eto_era5_mm_dia: { media_62_anios: 4.611, media_1968_1979: 4.415, minimo: 3.705, maximo: 6.647 },
  /** La `Eo` deducida de la Tabla 1 del trabajo, mm/día. */
  eo_de_la_tabla_1_mm_dia: { minimo: 3.53, maximo: 4.2, media: 3.87 },
  cociente: { sobre_62_anios: 1.196, sobre_1968_1979: 1.142 },
  /** Ahora sí se pudieron separar, y acá está cuál era cuál. */
  ya_se_separaron: {
    sesgo_de_era5: 'chico: temperatura sin sesgo contra la estación, radiación 2,2 % alta contra POWER',
    superficie_de_referencia: 'casi todo el resto: con la Eo del método el cociente baja de 1,162 a 1,015',
    donde_esta_medido: 'LAS_DOS_MITADES_DEL_ERROR_DE_LA_EO, en lib/eoJensenHaise.ts',
  },
  /** El error con el que el `b` publicado reproduce la `Tp` publicada, en %. */
  tp_reproducida_pct: { con_la_eo_del_modelo: 1.3, con_la_eto: 16.5 },
  /**
   * Lo que movía escalar la `Eo` por 1,142 en la cadena entera, en %. Medido con
   * la ETo, que era la sustitución que ya no está.
   */
  con_la_eo_14_pct_alta: {
    el_yp_solo_pct: 11.6,
    el_forraje_del_anio_pct: { mediana: 15.6, p90: 41.3, maximo: 54.7, peor_anio: 2017 },
  },
  no_cancela: true,
  por_que_crece:
    'El índice no responde linealmente: con el agua muy limitada, subir la demanda un 14 % baja '
    + 'el índice mucho más, porque la evaporación del suelo también se lleva agua que habría '
    + 'transpirado. El año del corte está a media agua y se mueve poco; el seco se mueve tres '
    + 'veces más, y el cociente de los dos se lleva la diferencia.',
  la_deuda:
    'Pagada: la Eo se calcula por Jensen-Haise modificada y el b publicado reproduce la Tp '
    + 'publicada con +1,3 %. Lo que queda abierto es la demanda de fuera de temporada, que es '
    + 'otra cosa y está en EL_INVIERNO_DECIDE_LA_COLA_SECA.',
} as const;

/**
 * La cadena lee **alto** contra los doce índices publicados, y cuánto.
 *
 * `forrajeBalance.ts` dice que la columna `T` de la Tabla 1 no se puede
 * reproducir porque haría falta la lluvia diaria de Sidney de 1967 a 1978, que
 * el artículo no publica. Es cierto para *reproducir*; para **comparar** alcanza
 * con la lluvia de ERA5 del mismo píxel, declarando la diferencia. Se hizo, y la
 * diferencia no es chica: la lluvia de ERA5 en las doce temporadas da **+24,6 mm**
 * de media contra la publicada, y va de −76 a +103 mm. Así que esto no es una
 * validación del índice: es una cota de cuánto se parece, con una entrada que no
 * es la misma.
 *
 * Los doce valores publicados —`T/Tp` de la Tabla 1— van de **0,40 a 0,98**, con
 * mediana 0,90. La cadena con la `Eo` del modelo da un sesgo de **+0,16** y
 * llega al techo en **10 de las 12**, o sea que se queda sin resolución justo
 * donde el trabajo medía 0,56, 0,58 y 0,40.
 *
 * ## Las tres causas declaradas, y todas empujan para el mismo lado
 *
 * Están las tres en `ADVERTENCIAS` de `forrajeBalance.ts` desde el principio, y
 * esto es la primera medición de cuánto suman juntas:
 *
 * - **no se aplica el factor de actividad radicular por temperatura de suelo**,
 *   que el trabajo usa en las capas de 30-60 y 60-90: sin él esas capas entregan
 *   agua que en suelo frío no entregarían;
 * - **el escurrimiento se asume nulo**, como en la prueba original, y en el
 *   campo algo escurre;
 * - **no se declara el agua bajo el límite inferior** de la capa superficial, así
 *   que el suelo se seca menos de lo que podría.
 *
 * Y una cuarta que no es del modelo: la lluvia de ERA5 contra el pluviómetro.
 *
 * ## Qué se hace con esto
 *
 * Se dice. El orden de los años aguanta —1988 queda último en los tres
 * tratamientos de `EL_INVIERNO_DECIDE_LA_COLA_SECA`— y la mediana sirve para
 * decir «un año normal»; el número de la cola seca no se puede presentar como
 * una cifra. Es lo mismo que ya decía `AVISO_DEL_ANIO_SECO`, ahora con el sesgo
 * medido contra valores publicados en vez de razonado.
 */
export const LA_CADENA_LEE_ALTO_CONTRA_LOS_DOCE = {
  anios: 12,
  publicado: { minimo: 0.402, mediana: 0.904, maximo: 0.985 },
  /**
   * Error absoluto medio, sesgo, temporadas en el techo y correlación contra los
   * doce publicados, con el agua inicial de cada temporada **medida** de la
   * humedad de suelo del reanálisis. Es el camino principal desde el
   * 09/11/2026: ver `LA_CADENA_ARRANCA_HUMEDA_DE_MAS` en `aguaDelPerfil.ts`.
   */
  con_el_agua_medida: { eam: 0.064, sesgo: 0.061, en_el_techo: 2, r: 0.858 },
  /**
   * Y sin 1971, que es la única temporada que queda lejos: **EAM 0,037 y sesgo
   * +0,033 sobre once**. 1971 es también la temporada donde la lluvia de ERA5
   * más difiere del pluviómetro del trabajo: 243,5 mm contra 141, un 73 % más.
   * No es prueba de nada —sobre las otras once el residuo no correlaciona con esa
   * diferencia, r = 0,08— pero es la coincidencia que hay.
   */
  sin_1971: { anios: 11, eam: 0.037, sesgo: 0.033 },
  /**
   * Lo mismo con el invierno simulado de la cadena, que es como corría hasta el
   * 09/11/2026 y es como sigue corriendo cuando no hay humedad de suelo.
   */
  con_el_factor: { eam: 0.133, sesgo: 0.132, en_el_techo: 4, r: 0.704 },
  /** Lo mismo, antes de montarlo. El techo era lo que más molestaba. */
  sin_el_factor: { eam: 0.156, sesgo: 0.156, en_el_techo: 10, r: 0.539 },
  con_la_eto_de_fao_56: { eam: 0.148, sesgo: -0.063, en_el_techo: 2 },
  /** La lluvia de ERA5 menos la publicada, en mm, en esas doce temporadas. */
  lluvia_era5_menos_publicada_mm: { media: 24.6, minimo: -76.3, maximo: 102.5 },
  no_es_una_validacion:
    'La entrada no es la misma: la lluvia sale de ERA5 y el trabajo midió con pluviómetro, con '
    + 'hasta 100 mm de diferencia en una temporada. Es una cota de parecido, no una validación.',
  por_que_lee_alto:
    'Las degradaciones declaradas del balance empujaban todas para el mismo lado, y en dos lotes '
    + 'del 09/11/2026 se pagaron las dos que tenían fuente: el factor de actividad radicular, que '
    + 'se llevó la sexta parte del sesgo y seis de las diez temporadas que estaban en el techo, y '
    + 'el agua inicial medida, que se llevó la mitad de lo que quedaba. El 10/11/2026 se pagó la '
    + 'tercera, el escurrimiento, que ahora sale de la curva número con la retención ligada al '
    + 'agua del perfil cuando el predio declara un CN; sin CN sigue corriendo con escurrimiento '
    + 'nulo. Y es la primera que empuja para el otro lado, así que no se suma a las anteriores: '
    + 'en Sidney, que es plano y arenoso, no mueve nada con el grupo hidrológico que le toca. '
    + 'Quedan el agua bajo el límite inferior y la lluvia de ERA5, que difiere hasta 103 mm de la '
    + 'medida con pluviómetro.',
  /**
   * Dónde quedaba el resto cuando el invierno lo simulaba la cadena: **las tres
   * peores temporadas publicadas eran las tres que más lejos quedaban**. 1977
   * publicaba 0,40 y la cadena daba 0,88; 1971 publica 0,58 y daba 0,96; 1968
   * publica 0,56 y daba 0,72. Son las tres que el trabajo arrancó con el perfil
   * seco y la cadena arrancaba con 132, 137 y 88 mm de los 150.
   *
   * Con el agua medida dos de las tres se acomodaron solas —1977 a 0,44 y 1968 a
   * 0,61— y queda **sólo 1971**, que para el reanálisis no arrancó seca.
   */
  el_resto_esta_en_los_anios_secos: [1977, 1971, 1968],
  con_el_agua_medida_queda: [1971],
  /**
   * Y con el escurrimiento de la curva número encima, que es lo último que se
   * montó. Mueve poco **y en Sidney no mueve nada con el grupo hidrológico que el
   * sitio tiene de verdad**, que es el A: hay que llegar al D para que el sesgo
   * baje de +0,070 a +0,059. La tabla entera, con la fracción de lluvia que
   * escurre y lo que mueve en los kilos, está en
   * `EN_SIDNEY_NO_TOCA_LA_COLA_SECA` de `escurrimientoForraje.ts`.
   *
   * Ojo con comparar estos números con los de `con_el_agua_medida`: la corrida
   * del 10/11/2026 da +0,070 donde el acta anotó +0,061, y la diferencia no se
   * pudo cerrar —la serie de humedad de suelo que Open-Meteo entrega cambió—.
   * Los de acá son todos de la misma corrida, así que entre ellos se comparan.
   */
  con_el_escurrimiento: {
    grupo_de_sidney: 'A',
    sin_escurrir: { eam: 0.072, sesgo: 0.070 },
    grupo_a: { eam: 0.072, sesgo: 0.070 },
    grupo_d: { eam: 0.067, sesgo: 0.059 },
    el_p10_no_se_mueve: true,
  },
  que_aguanta: 'el orden de los años y la mediana; no el valor de la cola seca',
} as const;

/**
 * El factor de actividad radicular destapa el techo, y deja en pie el sesgo.
 *
 * Es la respuesta a la pregunta que `LA_CADENA_LEE_ALTO_CONTRA_LOS_DOCE` dejó
 * abierta el 08/11/2026: de las tres degradaciones declaradas que empujan el
 * índice para arriba, la que tenía una curva publicada esperando era el factor
 * de actividad radicular por temperatura de suelo. Se montó
 * —`lib/actividadRadicular.ts`— y se midió contra los mismos doce índices.
 *
 * ```
 *                        sin el factor   con el factor
 *   EAM                      0,156           0,133
 *   sesgo                   +0,156          +0,132
 *   temporadas en el techo   10 de 12        4 de 12
 *   correlación r             0,539           0,704
 * ```
 *
 * ## Lo que sí arregló
 *
 * **El techo.** Diez de las doce temporadas daban índice ≥ 0,99 contra valores
 * publicados que van de 0,40 a 0,98: el modelo no distinguía entre un año bueno
 * y uno excelente, y tampoco entre uno bueno y uno malo-pero-no-pésimo. Con el
 * factor quedan cuatro, la correlación con los publicados pasa de 0,54 a 0,70, y
 * en la serie de 63 años el `p75` se despega de 1,000 por primera vez.
 *
 * Eso es más importante que el sesgo para lo que la app hace, porque el `Yp` se
 * despeja dividiendo por el índice del año del corte: un índice clavado en 1
 * convierte cualquier corte en el techo del sitio.
 *
 * ## Lo que no arregló
 *
 * **Las tres cuartas partes del sesgo.** De +0,156 a +0,132. Y lo que queda está
 * concentrado donde más duele: las tres temporadas peores de las doce —1977 con
 * 0,40 publicado, 1968 con 0,56, 1971 con 0,58— siguen leyendo 0,88, 0,72 y
 * 0,96. Son las tres que el trabajo arrancó con el perfil seco.
 *
 * Así que la hipótesis queda medida y es sólo parte de la respuesta. Lo que
 * sigue en la lista, en orden de lo que probablemente pese:
 *
 * 1. **El agua con la que arranca cada temporada**, que en los años secos sale
 *    alta y es la decisión de `EL_INVIERNO_DECIDE_LA_COLA_SECA`.
 * 2. **El escurrimiento nulo**, que el trabajo asumió en una planicie glaciada
 *    arenosa y acequia hereda en cualquier pendiente.
 * 3. **El agua bajo el límite inferior** de la capa superficial, que nadie
 *    declara y que hace que el suelo se seque menos de lo que se seca.
 * 4. **La lluvia de ERA5**, que difiere del pluviómetro hasta 103 mm en una
 *    temporada y no se arregla desde acá.
 */
export const EL_FACTOR_DESTAPA_EL_TECHO_PERO_NO_EL_SESGO = {
  sin_el_factor: { eam: 0.156, sesgo: 0.156, en_el_techo: 10, r: 0.539 },
  con_el_factor: { eam: 0.133, sesgo: 0.132, en_el_techo: 4, r: 0.704 },
  /** Lo que se llevó, en fracción del sesgo que había. */
  fraccion_del_sesgo_que_se_fue: 0.15,
  /** Las tres temporadas donde queda casi todo lo que no se explicó. */
  las_tres_que_siguen_lejos: [
    { anio: 1977, publicado: 0.402, con_el_factor: 0.879, sws_inicial_mm: 132 },
    { anio: 1968, publicado: 0.564, con_el_factor: 0.719, sws_inicial_mm: 88 },
    { anio: 1971, publicado: 0.577, con_el_factor: 0.957, sws_inicial_mm: 137 },
  ],
  /** Lo que cambia en la serie larga de Sidney, que es lo que ve el usuario. */
  en_la_serie_de_63_anios: {
    p10: { antes: 0.741, ahora: 0.672 },
    mediana: { antes: 0.999, ahora: 0.935 },
    p75: { antes: 1, ahora: 0.975 },
    ancho: { antes: 1.35, ahora: 1.473 },
    r2_contra_la_lluvia_de_temporada: { antes: 0.357, ahora: 0.428 },
  },
  /**
   * Y en los kilos: el `Yp` despejado del corte casi no se mueve —el año del
   * corte está cerca del techo en las dos corridas— pero el forraje de un año
   * cualquiera sí.
   */
  lo_que_mueve_en_los_kilos_pct: { yp: -0.8, mediana_del_anio: 3.2, p90: 11.9, maximo: 17.3 },
  lo_que_queda:
    'Era el agua inicial de las temporadas secas, el escurrimiento nulo, el agua bajo el límite '
    + 'inferior y la lluvia de ERA5. El primero se pagó el mismo día: con la humedad de suelo de '
    + 'ERA5-Land el sesgo baja de +0,132 a +0,061 y quedan el escurrimiento nulo, el agua bajo el '
    + 'límite inferior y la lluvia. Ver LA_CADENA_ARRANCA_HUMEDA_DE_MAS en aguaDelPerfil.ts.',
  /**
   * Y una cosa que no era obvia y la encontró el test: **el factor no baja el
   * índice temporada por temporada**. En una ventana suelta sólo puede bajarlo,
   * pero la cadena es continua y el agua que las capas frías no entregaron se
   * queda en el perfil. Una temporada posterior arranca más húmeda y puede
   * salir más alta: el peor año de la serie de Sidney sube de 0,157 a 0,161.
   */
  el_arrastre: {
    por_que: 'el agua que las capas frías no transpiran queda en el perfil para la temporada que sigue',
    el_peor_anio_sube: { anio: 1988, antes: 0.157, ahora: 0.161 },
  },
} as const;

/**
 * El invierno decide la cola seca, y el invierno no está validado.
 *
 * Esto es lo que apareció al poner la `Eo` del modelo, y es incómodo porque
 * reabre lo que el lote anterior había dado por cerrado.
 *
 * Wight y Hanks arrancaban el balance el 15 de abril **con el agua del perfil
 * medida con sonda de neutrones**. Nunca corrieron un invierno. La cadena
 * continua de acequia sí, y es su única forma de no inventar el agua inicial:
 * fuera de temporada `b` se fuerza a cero y la capa superficial evapora contra
 * `Kc·Eo` entero. O sea que **toda la demanda de fuera de temporada entra como
 * evaporación de suelo**, y nadie publicó si eso está bien.
 *
 * Cuánto se juega, medido con tres tratamientos de la misma serie, mismos 84
 * días de ventana y misma lluvia:
 *
 * ```
 *                                       p10      mediana   ancho   EAM contra los 12
 * Jensen-Haise todo el año              0,672    0,935     1,47    0,133  (+0,132)
 * Jensen-Haise en temporada, ETo afuera 0,311    0,753     3,13    0,114  (+0,024)
 * ETo de FAO-56 todo el año             0,201    0,611     4,57    0,150  (−0,094)
 * ```
 *
 * **El p10 se mueve 3,3 veces** entre el primero y el último. La distribución de
 * la cola seca no la decide el dato, la decide esta elección.
 *
 * ## Lo que cambió el 09/11/2026, y hay que decirlo aunque incomode
 *
 * Con el factor de actividad radicular montado, los tres tratamientos **ya no
 * son indistinguibles por el error**: el híbrido da 0,114 contra 0,133 del que
 * está elegido, un 14 % mejor. Antes iban 0,142 a 0,156 y ésa era una de las
 * razones para no elegir por ahí.
 *
 * La elección no cambia igual, y el motivo es que la ventaja del híbrido se
 * entiende: arranca las temporadas con **67 mm** de perfil contra 121 del
 * tratamiento elegido, o sea que compensa el sesgo que al balance le queda con
 * un invierno que evapora de más. Dos errores que se tapan no son un acierto, y
 * elegir por el EAM contra los doce sería ajustar contra el resultado con una
 * entrada —la lluvia de ERA5— que ni siquiera es la del trabajo.
 *
 * ## Lo que sí dice el trabajo, y acota un poco
 *
 * De las columnas publicadas se puede despejar cuánto perdió el perfil en cada
 * temporada, `P − ET − drenaje`: da **−65 a +35 mm**, o sea que en diez de las
 * doce el perfil **se descargó** durante la temporada. En las tres temporadas de
 * índice bajo —1968 con 0,56, 1971 con 0,58, 1977 con 0,40— eso obliga a que
 * hayan arrancado con poca agua, y la cadena con Jensen-Haise las arranca con 88,
 * 137 y 132 mm de los 150. Ahí lee claramente húmedo de más.
 *
 * ## Por qué igual se elige Jensen-Haise para todo el año
 *
 * Porque es **una** regla y no dos pegadas, porque es el método con el que se
 * ajustaron el `Kc` y el `b` que la cadena usa, y porque su `Eo` de los días
 * helados —0,12 mm/día contra 0,72 de la ETo de referencia— es la física del
 * problema: un suelo congelado bajo nieve no evapora tres cuartos de milímetro
 * por día. Partir la regla en dos tratamientos para acercar la cola sería
 * ajustar contra el resultado, que es exactamente lo que este archivo no hace.
 *
 * Lo que corresponde es decirlo, y está dicho en `AVISO_DEL_INVIERNO`.
 */
export const EL_INVIERNO_DECIDE_LA_COLA_SECA = {
  tratamientos: {
    jensen_haise_todo_el_anio: {
      p10: 0.672, mediana: 0.935, ancho: 1.47, eam: 0.133, sesgo: 0.132, sws_mm: 121,
    },
    jensen_haise_en_temporada: {
      p10: 0.311, mediana: 0.753, ancho: 3.13, eam: 0.114, sesgo: 0.024, sws_mm: 67,
    },
    eto_todo_el_anio: {
      p10: 0.201, mediana: 0.611, ancho: 4.57, eam: 0.150, sesgo: -0.094, sws_mm: 61,
    },
  },
  /** Cuántas veces se mueve el p10 entre el tratamiento más seco y el más húmedo. */
  el_p10_se_mueve_veces: 3.3,
  /**
   * Con el factor de actividad radicular los tres **dejaron de ser
   * indistinguibles**: el híbrido mide 0,114 de error contra 0,133 del elegido.
   * No se elige por ahí igual, y el motivo está arriba: el híbrido acierta
   * compensando un sesgo con otro, arrancando las temporadas 54 mm más secas.
   */
  no_se_puede_elegir_por_el_error: false,
  el_mejor_por_el_error_es_el_hibrido: true,
  /** Antes de montar el factor los tres iban de 0,142 a 0,156 y no se separaban. */
  sin_el_factor_daban: { eam: { minimo: 0.142, maximo: 0.156 }, el_p10_se_movia_veces: 3.8 },
  /** `P − ET − drenaje` de las doce temporadas publicadas, en mm. */
  lo_que_perdio_el_perfil_mm: { minimo: -65, maximo: 35, temporadas_que_se_descargaron: 10 },
  el_trabajo_no_corrio_inviernos:
    'Wight y Hanks arrancaban el 15 de abril con el agua del perfil medida con sonda de '
    + 'neutrones. La cadena continua es la forma de acequia de no inventar ese dato, y el precio '
    + 'es que la demanda de fuera de temporada queda sin validar.',
  por_que_jensen_haise_igual:
    'Es una sola regla, es el método con el que se ajustaron el Kc y el b que la cadena usa, y su '
    + 'Eo de los días helados —0,12 mm/día contra 0,72 de la ETo de referencia— es la física del '
    + 'problema. Partirla en dos tratamientos para acercar la cola sería ajustar contra el '
    + 'resultado.',
  que_se_hace:
    'Se declaraba en AVISO_DEL_INVIERNO, y ese aviso sigue saliendo cuando la serie no trae '
    + 'humedad de suelo. Cuando la trae, no hay invierno que correr.',
  /**
   * Y acá se cierra, el mismo día que se abrió.
   *
   * Con el agua del rebrote medida la cadena no corre ningún invierno, así que
   * los tres tratamientos dejan de ser tres: **«Jensen-Haise todo el año» y «el
   * híbrido» pasan a ser literalmente la misma corrida** —p10 0,451 los dos,
   * EAM 0,0641 contra 0,0640— porque lo único que los distinguía era la `Eo` de
   * fuera de temporada, que ya no se usa. Y lo que separa al tercero es sólo la
   * `Eo` de adentro de la temporada:
   *
   * ```
   *                                        p10      mediana    EAM contra los 12
   *   Jensen-Haise (y el híbrido)         0,451      0,831     0,064  (+0,061)
   *   ETo de FAO-56                       0,372      0,690     0,087  (−0,032)
   * ```
   *
   * **El `p10` pasa de moverse 3,3 veces a moverse 1,21.** Y la incomodidad del
   * lote anterior —que el híbrido medía mejor que el elegido compensando un
   * sesgo con otro— se disuelve: el híbrido es el elegido.
   */
  ya_no_decide: {
    con_el_agua_medida: {
      jensen_haise: { p10: 0.451, mediana: 0.831, eam: 0.064, sesgo: 0.061 },
      el_hibrido_es_el_mismo: true,
      eto_de_fao_56: { p10: 0.372, mediana: 0.690, eam: 0.087, sesgo: -0.032 },
      el_p10_se_mueve_veces: 1.21,
    },
    por_que: 'sin invierno simulado no hay demanda de fuera de temporada que tratar de tres formas',
  },
} as const;

/**
 * El año más seco de los 63 es el que fue, y lo dice la estación del lugar.
 *
 * Es un chequeo de una sola dirección —si fallaba, algo estaba roto; que pase no
 * valida el modelo— pero es el único disponible y es barato. El modelo pone a
 * **1988 último de 63**, con índice 0,161. Y 1988 es la sequía que en el este de
 * Montana todavía se usa como vara de comparación.
 *
 * Contra lo que midió la estación del propio sitio: el Eastern Agricultural
 * Research Center de Sidney, Montana, para el año agrícola 1987-88 —septiembre a
 * agosto— anotó **6,18 pulgadas contra 13,53 de promedio 1949-88**, o sea el
 * 45,7 % de lo normal. Y en los tres meses que caen dentro de la ventana del
 * modelo, abril a junio, **2,23 pulgadas contra 5,90**: el 37,8 %.
 *
 * ERA5, en la ventana del modelo, dio **77,5 mm contra 178,8 de media**: el
 * 43,4 %. Dos fuentes independientes y una diferencia de seis puntos. Y la cadena
 * además le entregó a esa temporada un perfil con **32,3 mm de agua de los 150
 * posibles**, contra 121 de promedio, que es lo que lo pone último y no sólo
 * bajo: el otoño y el invierno previos también habían sido secos.
 *
 * Los cinco peores salieron 1988, 1980, 1984, 1990 y 2021; los cinco mejores
 * 2011, 1978, 1976, 1972 y 1970. Los mejores recién se pueden nombrar desde que
 * el factor de actividad radicular despegó la mitad de arriba del techo: antes
 * estaban empatados en 1,000.
 */
export const EL_ANIO_MAS_SECO_ES_EL_QUE_FUE = {
  anio: 1988,
  puesto: 1,
  de: 65,
  indice: 0.166,
  estacion: {
    fuente:
      'Eastern Agricultural Research Center, Sidney, Montana (Montana State University) — '
      + 'resumen climático del año agrícola 1987-88, promedios 1949-88',
    anio_agricola_pulgadas: { medido: 6.18, promedio: 13.53, fraccion_pct: 45.7 },
    abril_a_junio_pulgadas: { medido: 2.23, promedio: 5.9, fraccion_pct: 37.8 },
  },
  era5_en_la_ventana: { medido_mm: 77.5, media_mm: 178.8, fraccion_pct: 43.4 },
  agua_inicial_del_perfil_mm: { ese_anio: 30.7, promedio: 79.6, tope: 150 },
  /** Con el invierno simulado de la cadena daban 32,3 y 121,1 mm, e índice 0,161. */
  con_la_cadena_daba: { indice: 0.161, agua_inicial_mm: 32.3, promedio_mm: 121.1, de: 63 },
  los_cinco_peores: [1988, 1980, 1990, 2021, 2008],
  /**
   * Y ahora sí hay cinco mejores que nombrar. Sin el factor de actividad
   * radicular una temporada de cada cuatro llegaba al techo del índice y
   * quedaban empatadas en 1,000, así que ordenarlas habría sido inventar un
   * orden que el cálculo no tenía. Con el factor el p75 baja a 0,975.
   */
  los_cinco_mejores: [2011, 1978, 1976, 1972, 1970],
  sin_el_factor_estaban_empatados_en_el_techo: true,
  /**
   * Con la ETo de FAO-56 este mismo año daba 0,051 y el perfil arrancaba con
   * 1,3 mm, y los cinco peores eran otros tres: 2017 y 1985 entraban, 2021 y
   * 1984 no. 1988 queda primero en los dos, que es lo único que este chequeo
   * de una dirección puede pedir.
   */
  con_la_eto_daba: {
    indice: 0.051,
    agua_inicial_mm: 1.3,
    los_cinco_peores: [1988, 1990, 2017, 1985, 1980],
  },
  que_prueba:
    'Es un chequeo de una sola dirección: si el peor año del modelo no hubiera sido una sequía '
    + 'conocida, algo estaría roto. Que lo sea no valida el modelo.',
} as const;

/**
 * La distribución es del pasado, y la deriva no se saca.
 *
 * Planificar con 62 temporadas es suponer que las que vienen se parecen a las que
 * fueron. La pregunta obvia es si conviene quedarse con los últimos veinte años
 * en vez de los sesenta, y la respuesta salió de medirlo en Sidney:
 *
 * ```
 *  pendiente del índice        −0,042 por década      R² = 0,065
 *  1963-1993    mediana 0,708    p10 0,152
 *  1994-2024    mediana 0,568    p10 0,250
 * ```
 *
 * Hay deriva de la mediana para abajo, pero **explica el 6,5 % de la varianza**:
 * la queda sepultada bajo la variabilidad año a año, que es cinco veces el ancho
 * de la serie. Y el `p10` —el número que decide la carga— se movió para el **otro
 * lado**: la cola seca de los últimos treinta años fue menos extrema que la de
 * los primeros treinta. La demanda de temporada casi no cambió (`Tp` de 1,73 a
 * 1,68 mm/día).
 *
 * Así que la ventana se queda entera. Recortar a los últimos veinte años tiraría
 * dos tercios del registro para perseguir una tendencia que explica el 6 % y que
 * en la cola apunta al revés, y dejaría el `p10` decidido por dos temporadas.
 *
 * Lo que sí corresponde es decirlo: **esto es la distribución de lo que pasó**, no
 * un pronóstico, y la tendencia no está removida.
 */
export const LA_DISTRIBUCION_ES_DEL_PASADO = {
  pendiente_del_indice_por_decada: -0.021,
  r2_de_la_tendencia: 0.033,
  mitades: {
    primera: { anios: '1960-1991', mediana: 0.880, p10: 0.406, tp_mm_dia: 1.481 },
    segunda: { anios: '1992-2024', mediana: 0.772, p10: 0.515, tp_mm_dia: 1.440 },
  },
  /**
   * Con el invierno simulado de la cadena daba −0,009 por década con R² 0,010.
   * Con el agua medida la pendiente se duplica y el R² se triplica, y **sigue
   * siendo nada**: 3,3 % de la varianza del índice. Y el `p10` sigue apuntando
   * al revés, ahora más marcado: 0,406 en la primera mitad contra 0,515 en la
   * segunda.
   */
  con_la_cadena_daba: {
    pendiente_por_decada: -0.009, r2: 0.010,
    mitades: { primera_mediana: 0.940, segunda_mediana: 0.918 },
  },
  /**
   * Con el factor de actividad radicular la pendiente pasa de −0,005 a −0,009 por
   * década y el R² de 0,002 a 0,010. Sigue siendo nada —un 1 % de la varianza— y
   * el `p10` sigue apuntando al otro lado.
   */
  sin_el_factor_daba: { pendiente_por_decada: -0.005, r2: 0.002 },
  /**
   * Con la ETo de FAO-56 esta tendencia daba −0,042 por década con R² 0,065, y
   * las dos mitades 0,708 contra 0,568 de mediana. **Con la `Eo` del modelo
   * desaparece**: −0,005 por década y R² 0,002, o sea dos milésimas de la
   * varianza. La diferencia está en la respuesta de cada método a la
   * temperatura: la ETo de FAO-56 de un reanálisis que se calienta sube, y la
   * `Eo` de Jensen-Haise sube bastante menos, porque entra por radiación y por
   * un coeficiente de temperatura calibrado contra el mes más cálido del sitio.
   *
   * O sea que lo que parecía una señal climática en el forraje era, en buena
   * parte, la deriva de la variable que se había puesto en lugar de la `Eo`.
   */
  con_la_eto_daba: {
    pendiente_por_decada: -0.042, r2: 0.065,
    mitades: { primera_mediana: 0.708, segunda_mediana: 0.568 },
  },
  por_que_no_se_recorta_la_ventana:
    'La tendencia explica el 3 % de la varianza del índice, o sea nada, y en la cola seca '
    + 'apunta al revés: el p10 de la segunda mitad es MÁS alto. Recortar a veinte años dejaría '
    + 'el p10 decidido por dos temporadas.',
  que_hay_que_decir: 'es la distribución de lo que pasó, no un pronóstico, y la tendencia no está removida',
} as const;

// ─── Los avisos que acompañan a una corrida ──────────────────────────────────

/** El aviso de la cadena continua, que sale siempre. */
export const AVISO_DE_LA_CADENA = {
  advertencia:
    'El agua del perfil al arranque de cada temporada no se midió: sale del balance continuo, o '
    + 'sea de lo que dejó la temporada anterior, y por eso las primeras temporadas de la serie no '
    + 'entran. La cadena no acumula nieve, pero con la Eo del modelo eso mueve el p10 menos del '
    + '1 %. Lo que sí pesa es la demanda atmosférica de fuera de temporada, que el trabajo '
    + 'original nunca corrió: según cómo se la trate, el p10 se mueve hasta 3,3 veces.',
} as const;

/** El aviso de la ventana fija, que también sale siempre. */
export const AVISO_DE_LA_VENTANA: AvisoDeCorte = {
  aviso:
    'La temporada de todos los años usa la misma ventana de calendario que declaraste para tu '
    + 'corte. El pastizal no rebrota el mismo día todos los años, y no hay forma de saber qué día '
    + 'rebrotó en un año pasado: corriendo el arranque quince días el índice del año seco se mueve '
    + 'hasta un 24 %, así que la ventana es una declaración y no un dato.',
  sesgo: 'desconocido',
};

/** El aviso del año seco, que es el más útil y el más frágil. */
export const AVISO_DEL_ANIO_SECO: AvisoDeCorte = {
  aviso:
    'El número del año seco es el que sirve para dimensionar la carga, y es también el más '
    + 'frágil: medido, un 14 % de error en la demanda atmosférica mueve el forraje de la mediana '
    + 'un 16 % y el del peor año hasta un 55 %, porque con el agua muy limitada el índice no '
    + 'responde en proporción. Tomalo como un orden de magnitud del año malo, no como una cifra.',
  sesgo: 'desconocido',
};

/**
 * El aviso del invierno, que es el que queda abierto después de arreglar la `Eo`.
 *
 * Sale siempre, porque la cadena continua siempre corre un invierno y el trabajo
 * original nunca corrió ninguno.
 */
export const AVISO_DEL_INVIERNO: AvisoDeCorte = {
  aviso:
    'Con cuánta agua arranca cada temporada sale de correr el balance fuera de temporada, que es '
    + 'la única forma de no inventar ese dato y es también lo que el trabajo original nunca hizo: '
    + 'ellos lo medían con sonda de neutrones el 15 de abril. Medido, según cómo se trate la '
    + 'demanda atmosférica de fuera de temporada el p10 de la distribución se mueve hasta 3,3 '
    + 'veces. La mediana y el orden de los años aguantan; el valor de la cola seca no es una '
    + 'cifra. Contra los doce índices que el trabajo publica la cadena lee ALTO, con un sesgo '
    + 'medido de +0,13.',
  sesgo: 'alto',
};

const UN_DIA_MS = 86_400_000;

const ES_MD = /^\d{2}-\d{2}$/;

function fechaISO(t: number): string {
  return new Date(t).toISOString().slice(0, 10);
}

function tiempoDe(fecha: string): number | null {
  const t = Date.parse(`${fecha}T00:00:00Z`);
  return Number.isFinite(t) ? t : null;
}

// ─── La ventana de cada año ──────────────────────────────────────────────────

/** La temporada de crecimiento de un año, con sus dos fechas inclusive. */
export interface VentanaDelAnio {
  /** El año en que **arrancó** la temporada. En el sur la ventana cruza el año. */
  anio: number;
  desde: string;
  hasta: string;
}

/**
 * Las ventanas de temporada de una tira de años, todas con la misma ventana de
 * calendario.
 *
 * `arranque_md` es `MM-DD`, el día en que el pastizal rebrota. `dias` es el
 * largo de la temporada, contando las dos puntas. **La ventana puede cruzar el
 * año** —en el hemisferio sur la temporada arranca en septiembre y termina en
 * enero— y en ese caso el `anio` es el del arranque.
 *
 * Devuelve `null` si `arranque_md` no es una fecha de calendario, si pide el 29
 * de febrero —que no existe en tres de cada cuatro años, así que la ventana
 * quedaría sin definir— o si los años o el largo no tienen sentido.
 */
export function ventanasDeCadaAnio(
  primer_anio: number,
  ultimo_anio: number,
  arranque_md: string,
  dias: number,
): VentanaDelAnio[] | null {
  if (!ES_MD.test(arranque_md)) return null;
  if (arranque_md === '02-29') return null;
  if (!Number.isInteger(dias) || dias < 1) return null;
  if (!Number.isInteger(primer_anio) || !Number.isInteger(ultimo_anio)) return null;
  if (primer_anio > ultimo_anio) return null;
  if (primer_anio < 1900 || ultimo_anio > 2100) return null;

  const salida: VentanaDelAnio[] = [];
  for (let anio = primer_anio; anio <= ultimo_anio; anio++) {
    const desde = `${String(anio).padStart(4, '0')}-${arranque_md}`;
    const t0 = tiempoDe(desde);
    if (t0 === null) return null;
    // Que la fecha exista de verdad: el 31 de abril parsea a 1 de mayo.
    if (fechaISO(t0) !== desde) return null;
    salida.push({ anio, desde, hasta: fechaISO(t0 + (dias - 1) * UN_DIA_MS) });
  }
  return salida;
}

// ─── El índice de cada año ───────────────────────────────────────────────────

/** Lo que la cadena sacó de una temporada. */
export interface IndiceDeUnAnio {
  anio: number;
  desde: string;
  hasta: string;
  /** `T/Tp` de la temporada. `null` si `Tp` dio cero: sin demanda no hay cociente. */
  indice: number | null;
  tp_mm: number;
  t_mm: number;
  /** Lo que llovió en la ventana, en mm. */
  pptn_mm: number;
  /**
   * Lo que escurrió en la ventana antes de entrar al perfil, en mm. **Cero**
   * cuando no se declaró un `cn_arc_ii`, que es el supuesto del trabajo
   * original. Ver `escurrimientoForraje.ts`.
   */
  escurrimiento_mm: number;
  /** El agua que la cadena dejó en el perfil el día antes del rebrote, en mm. */
  sws_inicial_mm: number;
  dias: number;
  /**
   * Cuánto se mueve el índice de esta temporada entre arrancar la cadena con el
   * perfil vacío y con el perfil lleno, en %. **Es una medición de esta corrida**,
   * no un supuesto: ver `LA_CADENA_OLVIDA_EL_ARRANQUE`.
   */
  diferencia_de_arranque_pct: number;
  /**
   * `true` mientras esa diferencia pasa el umbral, o sea mientras el arranque de
   * la cadena todavía pesa. Los años marcados **no entran** en la distribución.
   */
  el_arranque_todavia_pesa: boolean;
}

export interface EntradasIndicesPorAnio {
  /** La serie diaria continua, en orden, sin huecos ni `null`. */
  serie: readonly DiaDeSerie[];
  ventanas: readonly VentanaDelAnio[];
  /**
   * Los coeficientes para calcular la `Eo` por Jensen-Haise, que es el método
   * con el que se ajustaron el `Kc` y el `b` del modelo.
   *
   * Si vienen, cada día necesita radiación y las dos temperaturas, y un día al
   * que le falte algo **rechaza la corrida entera** igual que un `null`: ver
   * `eoDelDia`. Si no vienen se usa la ETo de FAO-56 de la serie, que es la
   * degradación que `ETO_NO_ES_EO` declara y que infla la `Tp` un 16,5 %.
   *
   * Tiene que ser **la misma** que usó el corte del que salió el `Yp`: el
   * forraje de un año es `Yp · índice`, con el `Yp` despejado de otro índice, y
   * dos `Eo` distintas en los dos extremos se cancelarían mal.
   */
  coeficientes_eo?: CoeficientesEo | null;
  /** Agua útil de cada capa de 30 cm, en mm, de la superficie hacia abajo. */
  aw_por_capa_mm: readonly number[];
  /**
   * Cuánto puede diferir el índice entre las dos cadenas para considerar que el
   * arranque ya no pesa, en %. Por defecto 0,5.
   *
   * **No hay forma de elegir con qué agua arranca la cadena**, y es a propósito:
   * la cadena corre siempre las dos puntas y la diferencia es lo que decide qué
   * temporadas sirven. Elegir una punta sería volver a inventar el dato que todo
   * este archivo existe para no inventar.
   */
  umbral_de_convergencia_pct?: number;
  /** Cuánta agua puede sacar la evaporación por debajo del límite, capa 1, en mm. */
  agua_bajo_el_limite_mm?: number;
  /**
   * El resto de las opciones del balance: `kc`, `c`, `b_constante`, el umbral y
   * el `cn_arc_ii` del escurrimiento.
   *
   * `cn_arc_ii` tiene que ser **el mismo** que usó el corte del que salió el
   * `Yp`: con escurrimiento el índice baja y el `Yp` sube, así que una ruta con
   * escurrimiento y la otra sin él no se cancelan.
   */
  opciones?: Omit<EntradasBalanceForraje, 'dias' | 'capas'>;
}

export interface IndicesPorAnio {
  anios: IndiceDeUnAnio[];
  /** Cuántas temporadas quedaron marcadas porque el arranque todavía pesa. */
  anios_descartados: number;
  /** Cuántos días corrió la cadena, de punta a punta. */
  dias_corridos: number;
  /** Las ventanas que la serie no cubría completas y quedaron afuera. */
  anios_sin_serie: number[];
  /**
   * Si la cadena corrió con el factor de actividad radicular por temperatura de
   * suelo. Tiene que coincidir con el de la corrida del corte de la que salió
   * el `Yp`: con factor y sin factor los índices no son comparables.
   */
  actividad_radicular: boolean;
  /**
   * Si cada temporada arrancó con el agua del perfil **medida** —la humedad de
   * suelo del reanálisis, por `aguaDelPerfil.ts`— en vez de con la que dejó el
   * invierno simulado de la cadena. Tiene que coincidir con el de la corrida del
   * corte de la que salió el `Yp`: sembrada y encadenada, los índices no son
   * comparables, y en la mediana de Sidney difieren 0,10.
   */
  agua_inicial_medida: boolean;
  /**
   * Si la corrida le restó a cada día el escurrimiento de la curva número. Se
   * compara igual que lo demás, y con más razón: es la única degradación del
   * balance que mueve el índice **para abajo**, así que una ruta con
   * escurrimiento y la otra sin él se multiplican mal en los dos sentidos.
   */
  escurrimiento: boolean;
  advertencias: string[];
  avisos: AvisoDeCorte[];
}

/**
 * Corre el balance **continuo** sobre toda la serie y devuelve el índice de cada
 * temporada.
 *
 * Una sola corrida, no una por año: así cada temporada arranca con el agua que
 * dejó la anterior y el agua inicial del perfil deja de ser un supuesto. Fuera
 * de las ventanas la pastura está dormida y `b` se fuerza a cero, que es la
 * misma decisión declarada de `sembrarPerfil`: no hay transpiración y la capa
 * superficial evapora contra `Kc·Eo` entero por la ecuación 7.
 *
 * Corre dos veces, del perfil lleno y del vacío, y la diferencia entre las dos
 * marca qué temporadas todavía arrastran el arranque. Devuelve `null` si la serie
 * viene vacía, con un `null` adentro, desordenada o con un día faltante. **Un `null` de la serie no es un día sin lluvia** y
 * rellenarlo con cero haría que una laguna del reanálisis se vea como una seca:
 * es el mismo criterio de `ventanaDeBalance`.
 */
export function indicesPorAnio(e: EntradasIndicesPorAnio): IndicesPorAnio | null {
  if (e.serie.length === 0 || e.ventanas.length === 0) return null;
  if (e.serie.some(d => d.precip_mm === null)) return null;
  // La `Eo` de cada día, por el método del trabajo si hay coeficientes y por la
  // ETo de FAO-56 si no. Un día sin con qué calcularla rechaza la corrida: la
  // cadena es continua, así que un hueco de 1974 contamina 1975.
  const eoDeLaSerie = e.serie.map(d => eoDelDia(d, e.coeficientes_eo));
  if (eoDeLaSerie.some(v => v === null)) return null;

  // Serie continua, en orden y sin huecos.
  const t0 = tiempoDe(e.serie[0]!.fecha);
  if (t0 === null) return null;
  for (let i = 0; i < e.serie.length; i++) {
    const t = tiempoDe(e.serie[i]!.fecha);
    if (t === null || t !== t0 + i * UN_DIA_MS) return null;
  }
  const tFin = t0 + (e.serie.length - 1) * UN_DIA_MS;

  const bConstante = e.opciones?.b_constante ?? B_PRADERA_MIXTA.valor;

  // Qué día de la serie es el arranque y el cierre de cada ventana, y cuáles
  // ventanas la serie no cubre completas.
  const indiceDeDia = (fecha: string): number | null => {
    const t = tiempoDe(fecha);
    if (t === null || t < t0 || t > tFin) return null;
    return Math.round((t - t0) / UN_DIA_MS);
  };
  const dentro: Array<{ v: VentanaDelAnio; i0: number; i1: number }> = [];
  const anios_sin_serie: number[] = [];
  for (const v of e.ventanas) {
    const i0 = indiceDeDia(v.desde);
    const i1 = indiceDeDia(v.hasta);
    if (i0 === null || i1 === null || i1 < i0) anios_sin_serie.push(v.anio);
    else dentro.push({ v, i0, i1 });
  }
  if (dentro.length === 0) return null;

  // La cadena arranca en el primer día de la serie —ahí está el calentamiento—
  // y termina en el último día de la última ventana: correr más no agrega nada.
  const hastaDia = Math.max(...dentro.map(d => d.i1));
  const enTemporada = new Uint8Array(hastaDia + 1);
  for (const d of dentro) {
    for (let i = d.i0; i <= d.i1; i++) enTemporada[i] = 1;
  }

  // El factor de actividad radicular de cada día, si la serie trae temperatura
  // de suelo. O lo traen todos los días de la cadena o no lo trae ninguno: la
  // cadena es continua, y media corrida con las capas profundas cerradas y
  // media con ellas abiertas no es ninguno de los dos modelos.
  const actividadDeLaSerie: Array<number[] | null> = [];
  for (let i = 0; i <= hastaDia; i++) {
    actividadDeLaSerie.push(actividadDeLasCapas(e.serie[i]!.t_suelo_30_90_c, e.aw_por_capa_mm.length));
  }
  const conActividad = actividadDeLaSerie.every(a => a !== null);
  if (!conActividad && actividadDeLaSerie.some(a => a !== null)) return null;

  const dias: DiaDeBalance[] = [];
  for (let i = 0; i <= hastaDia; i++) {
    const d = e.serie[i]!;
    dias.push({
      pptn_mm: d.precip_mm as number,
      eo_mm: eoDeLaSerie[i] as number,
      b: enTemporada[i] === 1
        ? bConstante
        : EL_AGUA_INICIAL_NO_SE_OLVIDA.b_del_calentamiento,
      ...(conActividad ? { actividad_radicular: actividadDeLaSerie[i] as number[] } : {}),
    });
  }

  // ── Con cuánta agua arranca cada temporada ────────────────────────────────
  //
  // Dos caminos, y cuál corre lo decide el dato, no una opción.
  //
  // **Sembrada.** Si el primer día de todas las ventanas trae la fracción de
  // agua útil del reanálisis, cada temporada se corre sola arrancando de ahí,
  // que es exactamente lo que hacía el trabajo: medir el perfil con sonda de
  // neutrones el 15 de abril. No hay invierno que correr —y era la decisión más
  // frágil del motor, la que movía el `p10` 3,3 veces—, no hay arranque que
  // olvidar y las primeras temporadas de la serie dejan de descartarse. Medido
  // contra los doce índices publicados el error se parte al medio:
  // `LA_CADENA_ARRANCA_HUMEDA_DE_MAS`.
  //
  // **Encadenada.** Si falta en alguna ventana corre la cadena continua de
  // siempre: dos corridas, del perfil lleno y del vacío, y la diferencia entre
  // las dos marca qué temporadas todavía arrastran el arranque. Media serie
  // sembrada y media encadenada no es ninguno de los dos modelos, así que es
  // todo o nada.
  const fracciones = dentro.map(({ i0 }) => {
    const f = e.serie[i0]?.agua_util_por_capa ?? null;
    return f !== null && f !== undefined
      && f.length === e.aw_por_capa_mm.length
      && f.every(v => Number.isFinite(v))
      ? f
      : null;
  });
  const sembrada = fracciones.every(f => f !== null);

  const umbral = e.umbral_de_convergencia_pct
    ?? LA_CADENA_OLVIDA_EL_ARRANQUE.umbral_por_defecto_pct;

  let anios: IndiceDeUnAnio[];
  let advertenciasDelBalance: readonly string[];

  if (sembrada) {
    const corridas = dentro.map(({ i0, i1 }, k) => correrBalanceForraje({
      ...(e.opciones ?? {}),
      dias: dias.slice(i0, i1 + 1),
      capas: capasDe90(e.aw_por_capa_mm, 0, e.agua_bajo_el_limite_mm).map((c, j) => ({
        ...c,
        sws_inicial_mm: c.aw_mm
          * Math.max(0, Math.min(1, (fracciones[k] as readonly number[])[j] as number)),
      })),
    }));
    if (corridas.some(r => r === null)) return null;
    advertenciasDelBalance = (corridas[0] as ResultadoBalanceForraje).advertencias;
    anios = dentro.map(({ v, i0, i1 }, k) => {
      const r = corridas[k] as ResultadoBalanceForraje;
      return {
        anio: v.anio,
        desde: v.desde,
        hasta: v.hasta,
        indice: r.indice,
        tp_mm: r.tp_mm,
        t_mm: r.t_mm,
        pptn_mm: r.pptn_mm,
        escurrimiento_mm: r.escurrimiento_mm,
        sws_inicial_mm: r.almacenaje_inicial_mm,
        dias: i1 - i0 + 1,
        // Con el arranque medido no hay dos puntas que comparar: la diferencia
        // es cero por construcción y ninguna temporada se descarta.
        diferencia_de_arranque_pct: 0,
        el_arranque_todavia_pesa: false,
      };
    });
  } else {
    // No se elige una punta: elegirla sería volver a inventar el dato que este
    // archivo existe para no inventar, y cuántas temporadas tarda en olvidarse
    // depende del clima del sitio —dos en Sidney, más de cuatro en un clima
    // árido—, así que no se puede clavar.
    const correr = (fraccion: number) => correrBalanceForraje({
      ...(e.opciones ?? {}),
      dias,
      capas: capasDe90(e.aw_por_capa_mm, fraccion, e.agua_bajo_el_limite_mm),
    });
    const lleno = correr(1);
    const vacio = correr(0);
    if (lleno === null || vacio === null) return null;
    advertenciasDelBalance = lleno.advertencias;

    const acumular = (res: ResultadoBalanceForraje, i0: number, i1: number) => {
      let tp = 0;
      let t = 0;
      let pptn = 0;
      let esc = 0;
      for (let i = i0; i <= i1; i++) {
        const dc = res.serie[i];
        if (dc === undefined) continue;
        tp += dc.tp_mm;
        t += dc.t_mm;
        pptn += dc.pptn_mm;
        esc += dc.escurrimiento_mm;
      }
      return { tp, t, pptn, esc, indice: tp > 0 ? t / tp : null };
    };

    anios = dentro.map(({ v, i0, i1 }) => {
      const a = acumular(lleno, i0, i1);
      const b = acumular(vacio, i0, i1);
      // Si alguna de las dos no tiene cociente, la temporada no se puede comparar
      // y queda marcada: 100 % es «no se sabe», no «difiere cien por ciento».
      const dif = a.indice !== null && b.indice !== null && a.indice > 0
        ? Math.abs(b.indice - a.indice) / a.indice * 100
        : 100;
      // El agua del perfil el día antes del rebrote, de la cadena que se informa.
      const previo = i0 > 0 ? lleno.serie[i0 - 1] : undefined;
      const sws = previo !== undefined
        ? previo.sws_mm.reduce((x, y) => x + y, 0)
        : e.aw_por_capa_mm.reduce((x, y) => x + y, 0);
      return {
        anio: v.anio,
        desde: v.desde,
        hasta: v.hasta,
        indice: a.indice,
        tp_mm: a.tp,
        t_mm: a.t,
        pptn_mm: a.pptn,
        escurrimiento_mm: a.esc,
        sws_inicial_mm: sws,
        dias: i1 - i0 + 1,
        diferencia_de_arranque_pct: dif,
        el_arranque_todavia_pesa: dif > umbral,
      };
    });
  }

  // ── Las advertencias, corregidas para una corrida de décadas ───────────────
  //
  // Dos de las que emite el balance están medidas sobre los días que se le
  // pasan, y acá se le pasa la serie entera. Las dos salían mal y las dos se
  // notaron corriendo 65 años en Sidney:
  //
  // · `temporada_fuera_de_rango` compara el largo de la corrida contra los 68 a
  //   99 días de la validación. Una cadena de 23.565 días la dispara siempre, y
  //   lo que el modelo acota es el largo de **la temporada**.
  // · `eo_fuera_de_rango` compara la `Eo` media diaria contra los 3,5 a 4,3
  //   mm/día de la Tabla 1. Promediada con los inviernos adentro da la mitad de
  //   eso y también salía siempre. Lo que importa es la `Eo` de la temporada.
  //
  // Un aviso que sale siempre no avisa nada: es la forma más barata de que
  // alguien deje de leerlos. Así que las dos se recalculan sobre las ventanas.
  const advertencias = advertenciasDelBalance.filter(
    a => a !== ADVERTENCIAS.temporada_fuera_de_rango && a !== ADVERTENCIAS.eo_fuera_de_rango,
  );
  const largo = dentro[0]!.i1 - dentro[0]!.i0 + 1;
  if (largo < TEMPORADA_DE_LA_PRUEBA.minimo_dias
    || largo > TEMPORADA_DE_LA_PRUEBA.maximo_dias) {
    advertencias.push(ADVERTENCIAS.temporada_fuera_de_rango);
  }
  let eoEnTemporada = 0;
  let diasEnTemporada = 0;
  for (let i = 0; i <= hastaDia; i++) {
    if (enTemporada[i] !== 1) continue;
    eoEnTemporada += dias[i]!.eo_mm;
    diasEnTemporada++;
  }
  const eoMedia = diasEnTemporada > 0 ? eoEnTemporada / diasEnTemporada : 0;
  if (eoMedia < EO_DIARIA_DE_LA_PRUEBA.minimo_mm || eoMedia > EO_DIARIA_DE_LA_PRUEBA.maximo_mm) {
    advertencias.push(ADVERTENCIAS.eo_fuera_de_rango);
  }
  // Y una que el balance **dejaba de emitir** justo por cómo corre la cadena: la
  // del `b` por defecto sale cuando algún día viene con `b` sin declarar, y acá
  // todos los días lo traen. El `b` sigue siendo el promedio de temporada de
  // Sidney, así que la advertencia tiene que salir igual: que una degradación se
  // calle porque cambió la forma de llamar a la función es peor que no tenerla.
  if (e.opciones?.b_constante === undefined) advertencias.push(ADVERTENCIAS.b_por_defecto);

  const descartados = anios.filter(a => a.el_arranque_todavia_pesa).length;
  if (!sembrada) advertencias.push(AVISO_DE_LA_CADENA.advertencia);
  if (descartados > 0) {
    advertencias.push(
      `${descartados} de las ${anios.length} temporadas quedan marcadas y no entran en la `
      + 'distribución: el índice todavía se mueve más del umbral según con cuánta agua se '
      + 'arranque la cadena.',
    );
  }
  if (descartados === anios.length) {
    advertencias.push(
      'Ninguna temporada converge: en este punto el perfil nunca se llena, así que el agua '
      + 'inicial no se olvida y la serie no alcanza para dar una distribución. Hace falta medir '
      + 'el agua del suelo.',
    );
  }

  const avisoDeLaEo: AvisoDeCorte = e.coeficientes_eo
    ? { aviso: AVISO_EO_JENSEN_HAISE.aviso, sesgo: AVISO_EO_JENSEN_HAISE.sesgo_del_indice }
    : { ...AVISO_ETO };
  const avisos: AvisoDeCorte[] = [
    avisoDeLaEo,
    { ...AVISO_DE_LA_VENTANA },
    ...(!sembrada && e.coeficientes_eo ? [{ ...AVISO_DEL_INVIERNO }] : []),
    ...(sembrada ? [avisoDelAguaInicial('indice')] : []),
    ...(e.opciones?.cn_arc_ii !== undefined ? [avisoDelEscurrimiento('indice')] : []),
    ...(conActividad
      ? [{
        aviso: AVISO_ACTIVIDAD_RADICULAR.aviso,
        sesgo: AVISO_ACTIVIDAD_RADICULAR.sesgo_del_indice as Direccion,
      }]
      : []),
  ];

  return {
    anios,
    anios_descartados: descartados,
    dias_corridos: hastaDia + 1,
    anios_sin_serie,
    actividad_radicular: conActividad,
    agua_inicial_medida: sembrada,
    escurrimiento: e.opciones?.cn_arc_ii !== undefined,
    advertencias,
    avisos,
  };
}

// ─── La distribución ─────────────────────────────────────────────────────────

export interface Distribucion {
  n: number;
  minimo: number;
  p10: number;
  p25: number;
  mediana: number;
  p75: number;
  p90: number;
  maximo: number;
  promedio: number;
  /** Cuántos de los años quedaron **por debajo** del promedio. */
  anios_bajo_el_promedio: number;
  /** `p90/p10`, cuántas veces más da un año bueno que uno malo. */
  ancho: number | null;
}

/**
 * Los percentiles de una tira de valores, por interpolación lineal entre
 * estadísticos de orden (el método «tipo 7», el de `PERCENTILE` de la planilla).
 *
 * Es una frecuencia empírica del registro, no una distribución ajustada: con `n`
 * años la resolución de la cola es `1/n` y no hay nada abajo de eso. Con 35 años
 * el p10 lo deciden tres o cuatro temporadas.
 *
 * Devuelve `null` si no hay valores o si alguno no es finito.
 */
export function distribucion(valores: readonly number[]): Distribucion | null {
  if (valores.length === 0) return null;
  if (valores.some(v => !Number.isFinite(v))) return null;
  const v = [...valores].sort((a, b) => a - b);
  const n = v.length;
  const p = (q: number): number => {
    const pos = (n - 1) * q;
    const bajo = Math.floor(pos);
    const alto = Math.ceil(pos);
    const a = v[bajo]!;
    const b = v[alto]!;
    return a + (b - a) * (pos - bajo);
  };
  const promedio = v.reduce((a, b) => a + b, 0) / n;
  const p10 = p(0.1);
  const p90 = p(0.9);
  return {
    n,
    minimo: v[0]!,
    p10,
    p25: p(0.25),
    mediana: p(0.5),
    p75: p(0.75),
    p90,
    maximo: v[n - 1]!,
    promedio,
    anios_bajo_el_promedio: v.filter(x => x < promedio).length,
    ancho: p10 > 0 ? p90 / p10 : null,
  };
}

/** Los índices de los años que sirven, o sea sin los del arranque de la cadena. */
export function indicesQueSirven(anios: readonly IndiceDeUnAnio[]): number[] {
  return anios
    .filter(a => !a.el_arranque_todavia_pesa && a.indice !== null)
    .map(a => a.indice as number);
}

export interface ForrajeDeUnAnio {
  anio: number;
  indice: number;
  forraje_kg_ha: number;
}

/**
 * El forraje de cada año, que es la ecuación 1 aplicada año por año.
 *
 *     Y = Yp · (T / Tp)
 *
 * `yp_kg_ha` sale del corte del predio (`ypDelCorte`). Salen sólo los años que
 * sirven. Devuelve `null` con un `Yp` que no es un número o es negativo.
 */
export function forrajePorAnio(
  yp_kg_ha: number,
  anios: readonly IndiceDeUnAnio[],
): ForrajeDeUnAnio[] | null {
  if (!Number.isFinite(yp_kg_ha) || yp_kg_ha < 0) return null;
  const salida: ForrajeDeUnAnio[] = [];
  for (const a of anios) {
    if (a.el_arranque_todavia_pesa || a.indice === null) continue;
    if (a.indice < 0 || a.indice > 1) continue;
    salida.push({ anio: a.anio, indice: a.indice, forraje_kg_ha: yp_kg_ha * a.indice });
  }
  return salida;
}

/**
 * En qué fracción de los años el forraje llegó a `objetivo_kg_ha`.
 *
 * Es la frecuencia del registro y nada más: con `n` años el número salta de
 * `1/n` en `1/n`, y no dice nada de un año que no pasó. Devuelve `null` sin
 * años o con un objetivo que no es un número.
 */
export function frecuenciaDeAlcanzar(
  forrajes: readonly ForrajeDeUnAnio[],
  objetivo_kg_ha: number,
): number | null {
  if (forrajes.length === 0) return null;
  if (!Number.isFinite(objetivo_kg_ha)) return null;
  return forrajes.filter(f => f.forraje_kg_ha >= objetivo_kg_ha).length / forrajes.length;
}

/**
 * El año de la tira que corresponde a un percentil, con su forraje.
 *
 * Sirve para poder decir «el año que se está planificando es como 1988» en vez
 * de un número suelto, que es la única forma en que un percentil significa algo
 * para alguien que vio esos años. Devuelve `null` si no hay años.
 */
export function anioDelPercentil(
  forrajes: readonly ForrajeDeUnAnio[],
  q: number,
): ForrajeDeUnAnio | null {
  if (forrajes.length === 0) return null;
  if (!Number.isFinite(q) || q < 0 || q > 1) return null;
  const v = [...forrajes].sort((a, b) => a.forraje_kg_ha - b.forraje_kg_ha);
  const pos = Math.round((v.length - 1) * q);
  return v[Math.max(0, Math.min(v.length - 1, pos))] ?? null;
}
