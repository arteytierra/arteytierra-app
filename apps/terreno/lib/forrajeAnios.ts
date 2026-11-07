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
 * **Un año bueno da 5,1 veces el forraje de uno malo** en el mismo potrero, y 29
 * de 62 temporadas quedaron por debajo del año promedio. Que el año promedio
 * sobreestoque está publicado; acá está por cuánto, y por qué el número medido da
 * 46,8 % y no 50. Ver `EL_PROMEDIO_SOBREESTOCA`.
 *
 * **La lluvia anual explica el 21 % de la varianza del índice** en el sitio donde
 * el modelo está validado. Es la única variable que mira `prodForrajera`. Ver
 * `LA_LLUVIA_ANUAL_NO_PREDICE_EL_ANIO`.
 *
 * **Y el peor año de los 62 es el que fue**: 1988, el año que la estación del
 * propio sitio midió a 45,7 % de lo normal. Es un chequeo de una sola dirección y
 * es el único que hay. Ver `EL_ANIO_MAS_SECO_ES_EL_QUE_FUE`.
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
} from './forrajeCorte';

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
  serie: 'Open-Meteo / ERA5 diaria, 1960-01-01 a 2024-12-31, 23.742 días, sin nulos',
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
 *  arranque −15 días              1,065×            1,239×
 *  arranque +15 días              0,758×            0,871×
 *  largo 68 días (mínimo)         1,100×            1,278×
 *  largo 99 días (máximo)         0,717×            0,769×
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
    arranque_menos_15: { mediana: 1.065, p10: 1.239 },
    arranque_mas_15: { mediana: 0.758, p10: 0.871 },
    largo_68: { mediana: 1.1, p10: 1.278 },
    largo_99: { mediana: 0.717, p10: 0.769 },
  },
  /**
   * La mediana y el `p10` no se mueven en la misma proporción, así que una
   * ventana equivocada no se corrige después con un factor.
   */
  no_desplaza_la_distribucion: true,
  /** El patrón real, asimétrico, de las cuatro filas medidas. */
  el_p10_se_mueve_mas:
    'sólo cuando la ventana le da más agua al pastizal; cuando se la quita, se mueve menos '
    + 'que la mediana',
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
  en_sidney_pct: { t1: 73.398, t2: 21.423, t3: 0.385, t4_en_adelante_maximo: 0.042 },
  temporadas_en_sidney: 3,
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
    anios: 62,
    anios_bajo_el_promedio: 29,
    fraccion_bajo_el_promedio_pct: 46.8,
    indice: {
      minimo: 0.051, p10: 0.194, p25: 0.344, mediana: 0.675,
      p75: 0.882, p90: 0.985, maximo: 1, promedio: 0.603,
    },
    /** `p90/p10`: cuántas veces más forraje da un año bueno que uno malo. */
    ancho: 5.08,
  },
  por_que_no_da_50:
    'El índice no puede pasar de 1, así que la distribución queda sesgada a la izquierda y el '
    + 'promedio (0,603) cae por debajo de la mediana (0,675). Contra la mediana la mitad de los '
    + 'años queda corta por definición.',
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
  r2_contra_lluvia_del_anio: 0.207,
  r2_contra_lluvia_de_la_temporada: 0.522,
  /** El agua con la que la cadena arrancó cada temporada, en mm, sobre 150 de tope. */
  agua_inicial_medida_mm: { minimo: 0.1, maximo: 147.6, promedio: 52.2 },
  que_se_lleva_el_resto: 'cuándo llovió, con qué agua arrancó el perfil y cuánta demanda atmosférica hubo',
  por_que_importa:
    'prodForrajera decide el forraje con la lluvia anual y nada más. Esto mide el techo de lo '
    + 'que esa variable puede explicar, en el único sitio donde la cadena está validada.',
} as const;

/**
 * El error de la `Eo` no se cancela a lo largo de la cadena: **crece**, y crece
 * justo en el año seco.
 *
 * El lote anterior dejó anotada una deuda: el balance usa la ETo de referencia de
 * FAO-56 y el trabajo usó la `Eo` de Jensen-Haise (1963), que no son la misma
 * superficie. `ETO_NO_ES_EO` midió la elasticidad del `Yp` solo —0,78 a 1,22— y
 * quedó pendiente leer Jensen-Haise. Acá se midieron las dos mitades que
 * faltaban, y las dos salieron peor de lo esperado.
 *
 * ## Primero, cuánto es la diferencia
 *
 * Mismo sitio, misma ventana: la ETo de FAO-56 de ERA5 en la temporada de Sidney
 * promedia **4,62 mm/día** sobre los 62 años y **4,41** sobre 1968-1979, que
 * solapa el período de la prueba. La `Eo` que se deduce de la Tabla 1 del trabajo
 * va de 3,53 a 4,20, con media 3,87. O sea un cociente de **1,14 a 1,20**.
 *
 * Eso mezcla dos cosas y no se pueden separar acá: la diferencia de superficie de
 * referencia, y el sesgo propio de ERA5 en ese píxel contra el instrumento que
 * midieron Wight y Hanks. Separarlas sigue necesitando leer Jensen-Haise.
 *
 * ## Y después, lo que se esperaba que lo salvara
 *
 * El forraje de un año es `Yp · índice_j`, y `Yp = Y_corte / índice_corte`. O sea
 * que el número final es **el cociente de dos índices** calculados con la misma
 * serie, y lo razonable es esperar que un error de escala en la `Eo` se cancele.
 *
 * Medido escalando la `Eo` por 1,142 sobre la cadena entera, con el año de índice
 * mediano como año del corte:
 *
 * ```
 *  el Yp solo                              +11,6 %
 *  el forraje de un año, mediana            15,6 %
 *  el forraje de un año, p90                41,3 %
 *  el forraje del peor año (2017)           54,7 %
 * ```
 *
 * **No cancela: amplifica.** El motivo es que el índice no responde linealmente:
 * en una temporada con el agua muy limitada, subir la demanda un 14 % no baja el
 * índice un 14 % sino mucho más, porque la evaporación del suelo también se lleva
 * agua que habría transpirado. El año del corte está a media agua y se mueve poco;
 * el año seco se mueve tres veces más, y el cociente se lleva la diferencia.
 *
 * ## Qué significa
 *
 * Que leer Jensen-Haise (1963) y cerrar la diferencia de superficie **dejó de ser
 * prolijidad y es la deuda más cara del motor de forraje**: un 14 % en la `Eo`
 * son 55 % en el forraje del año que decide la carga animal. Y que en la
 * interfaz, el número del año seco no puede mostrarse con la misma confianza que
 * el de la mediana: es el más útil y el más frágil a la vez.
 */
export const EL_ANIO_SECO_LO_DECIDE_LA_EO = {
  /** La ETo de FAO-56 de ERA5 en la temporada de Sidney, mm/día. */
  eto_era5_mm_dia: { media_62_anios: 4.62, media_1968_1979: 4.41, minimo: 3.7, maximo: 6.65 },
  /** La `Eo` deducida de la Tabla 1 del trabajo, mm/día. */
  eo_de_la_tabla_1_mm_dia: { minimo: 3.53, maximo: 4.2, media: 3.87 },
  cociente: { sobre_62_anios: 1.196, sobre_1968_1979: 1.142 },
  no_se_pueden_separar:
    'El cociente mezcla la diferencia de superficie de referencia con el sesgo de ERA5 en ese '
    + 'píxel contra el instrumento del trabajo. Separarlas necesita leer Jensen-Haise (1963).',
  /** Lo que mueve escalar la `Eo` por 1,142 en la cadena entera, en %. */
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
    'Leer Jensen-Haise (1963) y cerrar la diferencia de superficie dejó de ser prolijidad: un '
    + '14 % en la Eo son 55 % en el forraje del año que decide la carga animal.',
} as const;

/**
 * El año más seco de los 62 es el que fue, y lo dice la estación del lugar.
 *
 * Es un chequeo de una sola dirección —si fallaba, algo estaba roto; que pase no
 * valida el modelo— pero es el único disponible y es barato. El modelo pone a
 * **1988 último de 62**, con índice 0,051. Y 1988 es la sequía que en el este de
 * Montana todavía se usa como vara de comparación.
 *
 * Contra lo que midió la estación del propio sitio: el Eastern Agricultural
 * Research Center de Sidney, Montana, para el año agrícola 1987-88 —septiembre a
 * agosto— anotó **6,18 pulgadas contra 13,53 de promedio 1949-88**, o sea el
 * 45,7 % de lo normal. Y en los tres meses que caen dentro de la ventana del
 * modelo, abril a junio, **2,23 pulgadas contra 5,90**: el 37,8 %.
 *
 * ERA5, en la ventana del modelo, dio **77,5 mm contra 177,8 de media**: el
 * 43,6 %. Dos fuentes independientes y una diferencia de seis puntos. Y la cadena
 * además le entregó a esa temporada un perfil con **1,3 mm de agua de los 150
 * posibles**, contra 52 de promedio, que es lo que explica un índice de 0,05 y no
 * de 0,4: el otoño y el invierno previos también habían sido secos.
 *
 * Los cinco peores salieron 1988, 1990, 2017, 1985 y 1980; los cinco mejores
 * 2011, 1975, 1972, 1963 y 1965.
 */
export const EL_ANIO_MAS_SECO_ES_EL_QUE_FUE = {
  anio: 1988,
  puesto: 1,
  de: 62,
  indice: 0.051,
  estacion: {
    fuente:
      'Eastern Agricultural Research Center, Sidney, Montana (Montana State University) — '
      + 'resumen climático del año agrícola 1987-88, promedios 1949-88',
    anio_agricola_pulgadas: { medido: 6.18, promedio: 13.53, fraccion_pct: 45.7 },
    abril_a_junio_pulgadas: { medido: 2.23, promedio: 5.9, fraccion_pct: 37.8 },
  },
  era5_en_la_ventana: { medido_mm: 77.5, media_mm: 177.8, fraccion_pct: 43.6 },
  agua_inicial_del_perfil_mm: { ese_anio: 1.3, promedio: 52.2, tope: 150 },
  los_cinco_peores: [1988, 1990, 2017, 1985, 1980],
  los_cinco_mejores: [2011, 1975, 1972, 1963, 1965],
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
  pendiente_del_indice_por_decada: -0.042,
  r2_de_la_tendencia: 0.065,
  mitades: {
    primera: { anios: '1963-1993', mediana: 0.708, p10: 0.152, tp_mm_dia: 1.731 },
    segunda: { anios: '1994-2024', mediana: 0.568, p10: 0.25, tp_mm_dia: 1.682 },
  },
  por_que_no_se_recorta_la_ventana:
    'La tendencia explica el 6,5 % de la varianza y en la cola seca apunta al revés. '
    + 'Recortar a veinte años dejaría el p10 decidido por dos temporadas.',
  que_hay_que_decir: 'es la distribución de lo que pasó, no un pronóstico, y la tendencia no está removida',
} as const;

// ─── Los avisos que acompañan a una corrida ──────────────────────────────────

/** El aviso de la cadena continua, que sale siempre. */
export const AVISO_DE_LA_CADENA = {
  advertencia:
    'El agua del perfil al arranque de cada temporada no se midió: sale del balance continuo, o '
    + 'sea de lo que dejó la temporada anterior, y por eso las tres primeras temporadas de la '
    + 'serie no entran. La cadena no acumula nieve: donde el invierno baja de cero, el agua del '
    + 'deshielo entra al perfil el día que nevó y el índice sale BAJO.',
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
  /** El resto de las opciones del balance: `kc`, `c`, `b_constante`, el umbral. */
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
  if (e.serie.some(d => d.precip_mm === null || d.et0_mm === null)) return null;

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

  const dias: DiaDeBalance[] = [];
  for (let i = 0; i <= hastaDia; i++) {
    const d = e.serie[i]!;
    dias.push({
      pptn_mm: d.precip_mm as number,
      eo_mm: d.et0_mm as number,
      b: enTemporada[i] === 1
        ? bConstante
        : EL_AGUA_INICIAL_NO_SE_OLVIDA.b_del_calentamiento,
    });
  }

  // ── Las dos cadenas ───────────────────────────────────────────────────────
  //
  // Se corre del perfil lleno y del perfil vacío, y la diferencia entre las dos
  // es lo que dice **cuándo el arranque dejó de pesar**. No se elige una punta:
  // elegirla sería volver a inventar el dato que este archivo existe para no
  // inventar, y cuántas temporadas tarda en olvidarse depende del clima del sitio
  // —tres en Sidney, más de cuatro en un clima árido—, así que no se puede clavar.
  const correr = (fraccion: number) => correrBalanceForraje({
    ...(e.opciones ?? {}),
    dias,
    capas: capasDe90(e.aw_por_capa_mm, fraccion, e.agua_bajo_el_limite_mm),
  });
  const lleno = correr(1);
  const vacio = correr(0);
  if (lleno === null || vacio === null) return null;

  const acumular = (res: typeof lleno, i0: number, i1: number) => {
    let tp = 0;
    let t = 0;
    let pptn = 0;
    for (let i = i0; i <= i1; i++) {
      const dc = res.serie[i];
      if (dc === undefined) continue;
      tp += dc.tp_mm;
      t += dc.t_mm;
      pptn += dc.pptn_mm;
    }
    return { tp, t, pptn, indice: tp > 0 ? t / tp : null };
  };

  const umbral = e.umbral_de_convergencia_pct
    ?? LA_CADENA_OLVIDA_EL_ARRANQUE.umbral_por_defecto_pct;

  const anios: IndiceDeUnAnio[] = dentro.map(({ v, i0, i1 }) => {
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
      sws_inicial_mm: sws,
      dias: i1 - i0 + 1,
      diferencia_de_arranque_pct: dif,
      el_arranque_todavia_pesa: dif > umbral,
    };
  });

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
  const advertencias = lleno.advertencias.filter(
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
  advertencias.push(AVISO_DE_LA_CADENA.advertencia);
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

  const avisos: AvisoDeCorte[] = [{ ...AVISO_ETO }, { ...AVISO_DE_LA_VENTANA }];

  return {
    anios,
    anios_descartados: descartados,
    dias_corridos: hastaDia + 1,
    anios_sin_serie,
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
