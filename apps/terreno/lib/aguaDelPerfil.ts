/**
 * El agua con la que arranca la temporada, medida y no simulada.
 *
 * ## Por qué existe este archivo
 *
 * `SWS` inicial —cuánta agua útil tiene el perfil el día del rebrote— es el dato
 * que más mueve el modelo de Wight y Hanks (1981). El trabajo lo **medía con
 * sonda de neutrones** cada 15 de abril y nunca corrió un invierno. acequia no
 * tiene sonda, así que venía resolviéndolo de dos formas, las dos declaradas y
 * las dos flojas:
 *
 * - en el corte suelto, devolviendo una **banda** entre el perfil seco y el
 *   lleno (`ypDelCorte.banda_kg_ha`), que en una temporada seca se abre tanto
 *   que no sirve para dimensionar nada;
 * - en la serie larga, con una **cadena continua** que corre el balance fuera de
 *   temporada con `b = 0` para que el arranque se olvide
 *   (`LA_CADENA_OLVIDA_EL_ARRANQUE`). El precio es que toda la demanda del
 *   invierno entra como evaporación de suelo, cosa que nadie publicó, y según
 *   cómo se la trate el `p10` de la distribución **se mueve 3,3 veces**
 *   (`EL_INVIERNO_DECIDE_LA_COLA_SECA`).
 *
 * Medido contra los doce índices que la Tabla 1 del trabajo publica, lo que
 * quedaba del sesgo de la cadena —+0,132 después de montar el factor de
 * actividad radicular— estaba concentrado en las tres temporadas que el trabajo
 * arrancó con el perfil seco. Este archivo trae el dato que faltaba.
 *
 * ## De dónde sale
 *
 * De **ERA5-Land**, el mismo pedido a Open-Meteo que ya trae la lluvia, la
 * radiación y la temperatura del suelo. Publica contenido volumétrico de agua
 * por capa —`soil_moisture_0_to_7cm`, `7_to_28cm`, `28_to_100cm` y
 * `100_to_255cm`, en m³/m³, diario desde 1940— y en Sidney los 23.742 días de
 * 1960 a 2024 vienen **sin un solo nulo**.
 *
 * El contenido volumétrico **no es** agua útil: hay que restarle el límite
 * inferior y dividir por el rango que la planta puede sacar. Los dos números son
 * del modelo de suelo que corre adentro de ERA5-Land —HTESSEL— y están
 * publicados: la **Tabla 8.9 del IFS Documentation CY45R1, Parte IV, capítulo
 * 8.6.2**, da el contenido a saturación, a capacidad de campo, en el punto de
 * marchitez permanente y residual para las seis clases de textura del esquema.
 *
 * HTESSEL **no usa una textura única**: toma la dominante de cada punto del mapa
 * de la FAO. Ese campo (`slt`) no viaja por Open-Meteo —y tampoco está en el
 * catálogo de ERA5-Land, según el propio ECMWF—, así que la clase se identifica
 * desde la propia serie: el contenido volumétrico no puede pasar la saturación
 * de su clase y en sesenta años la roza. Ver `COMO_SE_IDENTIFICA_LA_TEXTURA`.
 *
 * Esa huella se arregló el **11/11/2026** y vale la pena saber qué tenía, porque
 * era justamente el modo de falla que este repo persigue —un número plausible y
 * equivocado— y uno de apagado silencioso:
 *
 * - la regla **decía** que el máximo roza el techo pero no lo verificaba, así que
 *   un píxel de arena del Kalahari que llega a 0,360 salía `gruesa` con el techo
 *   43 milésimas arriba, y errarle a `media-fina` cuesta 0,556 de fracción de
 *   agua útil, o sea 83 mm sobre 150;
 * - y el margen se medía entre *diferencias* de distancia, cosa que no puede
 *   separar dos clases más juntas que el propio margen: `media-fina` era
 *   inalcanzable y en Sidney, el sitio de calibración, la textura devolvía
 *   `null`. Ver `LAS_CLASES_QUE_NO_SE_SEPARAN` y `EL_HUSO_MUEVE_EL_MAXIMO`.
 *
 * ## Qué está medido contra qué
 *
 * Dos casos resueltos, los dos del propio trabajo:
 *
 * 1. **La Figura 5 (p. 310)** publica el agua medida con sonda de neutrones y la
 *    predicha, capa de 30 cm por capa de 30 cm, para 1967, 1968, 1969 y 1977 en
 *    Sidney. Digitalizada, da 158 mediciones contra las que comparar el camino
 *    de acequia: `CONTRA_LA_FIGURA_5`. De paso confirma los **50 mm de agua útil
 *    por capa** que el arnés venía suponiendo.
 * 2. **Los doce índices de la Tabla 1**, contra los que se mide qué pasa cuando
 *    la temporada arranca con este dato en vez de con el invierno simulado:
 *    `LA_CADENA_ARRANCA_HUMEDA_DE_MAS`.
 *
 * Y un control independiente que **no confirma**, y hay que decirlo:
 * `EL_SEGUNDO_MODELO_NO_CONFIRMA`.
 *
 * ## Unidades y rango de validez
 *
 * Entra contenido volumétrico en m³/m³ y sale una **fracción adimensional de
 * agua útil**, 0 a 1, que después se multiplica por el `AW` en mm de cada capa
 * del predio. Vale entre el punto de marchitez y la capacidad de campo de la
 * clase: afuera se recorta, y cuántos días cae afuera está medido en
 * `LOS_DIAS_FUERA_DE_RANGO`.
 *
 * ## Qué se rompe si cambia
 *
 * Lo consumen `forrajeCorte.ts` —el `Yp` deja de ser una banda y pasa a ser un
 * punto— y `forrajeAnios.ts` —la cadena deja de correr inviernos—. Las dos
 * rutas tienen que degradarse igual o los kilos salen mal sin que se note: por
 * eso `CorteDeForrajeBloque.tsx` compara las dos corridas antes de multiplicar.
 */

import type { AvisoDeCorte, Direccion } from './forrajeCorte';

export const FUENTES_AGUA_DEL_PERFIL = {
  humedad_del_suelo:
    'ERA5-Land (Muñoz-Sabater et al., 2021, Earth Syst. Sci. Data 13:4349-4383) por Open-Meteo '
    + 'Historical Weather API: soil_moisture_0_to_7cm_mean, soil_moisture_7_to_28cm_mean y '
    + 'soil_moisture_28_to_100cm_mean, media diaria, m³/m³, desde 1940.',
  parametros_hidraulicos:
    'IFS Documentation CY45R1, Part IV: Physical Processes, cap. 8.6.2 «Soil properties», '
    + 'Tablas 8.8 y 8.9 (ECMWF, 2018). ERA5-Land corre H-TESSEL del ciclo CY45R1, así que esa '
    + 'es la tabla que rige sus números.',
  caso_resuelto:
    'Wight, J. R., & Hanks, R. J. (1981), Figura 5, p. 310: contenido de agua medido con sonda '
    + 'de neutrones y predicho por el modelo, por capa de 30 cm, en Sidney, Montana, para 1967, '
    + '1968, 1969 y 1977. Digitalizada de la copia escaneada del repositorio de la Universidad '
    + 'de Arizona (handle 10150/646128).',
  control_independiente:
    'NASA POWER / MERRA-2, GWETROOT («Root Zone Soil Wetness») y GWETPROF («Profile Soil '
    + 'Moisture»), diarias desde 1981. Otro modelo de suelo, otra escala: 0 es suelo seco y 1 '
    + 'suelo saturado, no capacidad de campo.',
  que_dice_el_trabajo:
    'Wight y Hanks (1981), p. 309: «At the Sidney site, soil water was determined biweekly '
    + 'throughout the growing season by the neutron method at the study area weather station».',
} as const;

/** Una clase de textura de H-TESSEL. */
export type ClaseDeTextura = 'gruesa' | 'media' | 'media-fina' | 'fina' | 'muy-fina' | 'organica';

export interface TexturaDeHTessel {
  clase: ClaseDeTextura;
  /** El nombre con el que la tabla del IFS la publica. */
  nombre_en_la_tabla: string;
  /** Contenido volumétrico a saturación, m³/m³. */
  saturacion: number;
  /** A capacidad de campo, m³/m³. En van Genuchten, el potencial de −0,10 bar. */
  capacidad: number;
  /** En el punto de marchitez permanente, m³/m³. El potencial de −15 bar. */
  marchitez: number;
  /** Contenido residual, m³/m³. */
  residual: number;
  /** `capacidad − marchitez`: el agua que la planta puede sacar, m³/m³. */
  agua_util: number;
}

/**
 * Tabla 8.9 del IFS CY45R1: el contenido volumétrico de agua de cada clase de
 * textura, en m³/m³.
 *
 * El `agua_util` es la última columna de la tabla publicada, `θcap − θpwp`.
 * Conviene mirarla antes de creerle a un número en mm: una capa de 30 cm va de
 * **51 mm** de agua útil en la clase gruesa a **119 mm** en la orgánica.
 */
export const TEXTURAS_DE_HTESSEL: readonly TexturaDeHTessel[] = [
  { clase: 'gruesa', nombre_en_la_tabla: 'Coarse', saturacion: 0.403, capacidad: 0.244, marchitez: 0.059, residual: 0.025, agua_util: 0.185 },
  { clase: 'media', nombre_en_la_tabla: 'Medium', saturacion: 0.439, capacidad: 0.347, marchitez: 0.151, residual: 0.010, agua_util: 0.196 },
  { clase: 'media-fina', nombre_en_la_tabla: 'Medium-Fine', saturacion: 0.430, capacidad: 0.383, marchitez: 0.133, residual: 0.010, agua_util: 0.251 },
  { clase: 'fina', nombre_en_la_tabla: 'Fine', saturacion: 0.520, capacidad: 0.448, marchitez: 0.279, residual: 0.010, agua_util: 0.170 },
  { clase: 'muy-fina', nombre_en_la_tabla: 'Very Fine', saturacion: 0.614, capacidad: 0.541, marchitez: 0.335, residual: 0.010, agua_util: 0.207 },
  { clase: 'organica', nombre_en_la_tabla: 'Organic', saturacion: 0.766, capacidad: 0.663, marchitez: 0.267, residual: 0.010, agua_util: 0.396 },
] as const;

/**
 * Cómo se sabe qué textura le tocó al píxel, sin el campo `slt`.
 *
 * El mapa de textura de H-TESSEL (`slt`, paramId 43) se distribuye por el CDS de
 * Copernicus y **no viaja por Open-Meteo**, que es por donde acequia pide los
 * datos; para ERA5-Land ECMWF dice además que ese campo invariante «todavía no
 * está en el catálogo». Pero la clase deja una huella que la propia serie
 * delata: **el contenido volumétrico nunca puede pasar la saturación de su
 * clase**, y en una serie larga alguna vez la roza.
 *
 * La regla tiene tres partes y las tres hacen falta:
 *
 * 1. **El techo descarta.** De las seis clases quedan sólo las que el máximo de
 *    la serie no pasó. Es la única parte dura de todo esto: si el máximo pasó
 *    una saturación, esa clase está descartada y no hay vuelta.
 * 2. **La elegida es la de techo más bajo** de las que quedaron, que es la que
 *    el máximo roza.
 * 3. **Y tiene que rozarlo de verdad.** Si el máximo queda más de
 *    `acercamiento_maximo` por debajo de ese techo, la serie no se acercó a
 *    ninguna saturación: hay cinco o seis clases posibles y la más cercana no es
 *    evidencia de nada. Devuelve `null`.
 *
 * La tercera parte es nueva del 11/11/2026 y **cierra un agujero**: hasta ese
 * día, un máximo de 0,360 en la arena del Kalahari devolvía «gruesa» por ser la
 * saturación más cercana, con el máximo 43 milésimas abajo del techo. Entre
 * «gruesa» y «media-fina» hay 0,556 de fracción de agua útil de diferencia, o
 * sea 83 mm sobre 150: una apuesta de ese tamaño sobre una brecha de 43
 * milésimas es justo el número plausible y equivocado que este código no tiene
 * que imprimir.
 *
 * Probado en ocho píxeles de climas y suelos distintos, con 65 años de serie. En
 * siete de los ocho el máximo cae a 6 milésimas o menos de la saturación de una
 * clase, que es la huella; el octavo no se identifica:
 *
 * ```
 *                        máximo   clase         se acerca a
 *  Sidney, Montana        0,434   media              0,005
 *  Swift Current, Sask.   0,435   media              0,004
 *  Sand Hills, Nebraska   0,435   media              0,004
 *  Loess de Iowa          0,438   media              0,001
 *  Quindío, Colombia      0,438   media              0,001
 *  Pampa argentina        0,515   fina               0,005
 *  Sahel de Malí          0,424   media-fina         0,006
 *  Kalahari               0,360   (ninguna)          0,043
 * ```
 *
 * Y una segunda verificación que no entra en la decisión: el piso de la capa
 * profunda tiene que quedar cerca del punto de marchitez de la clase elegida. En
 * Sidney el percentil 1 de la capa de 28-100 cm da **0,157** contra el 0,151
 * publicado. **No se puede usar para decidir** y conviene saber por qué: en
 * Quindío ese percentil da 0,344 porque el perfil nunca se seca, y en Swift
 * Current baja a 0,045 porque el agua líquida se va cuando el suelo se congela.
 * El piso mide el clima, no la textura.
 *
 * ## Dónde falla
 *
 * Con una serie corta, o en un píxel que nunca se satura —árido sin un solo
 * evento grande—, el máximo no llega a ningún techo y la identificación no sale.
 * Ahí devuelve `null`, no se siembra el perfil y se vuelve a la banda, que es la
 * degradación declarada.
 *
 * Y hay un par de clases que esta huella **no puede separar nunca**, porque sus
 * saturaciones están más cerca entre sí que el ruido del propio estimador:
 * `LAS_CLASES_QUE_NO_SE_SEPARAN`. Ese caso no devuelve `null` —ver ahí por
 * qué—: devuelve la más ajustada y **declara la duda** en `en_duda`.
 */
export const COMO_SE_IDENTIFICA_LA_TEXTURA = {
  regla: 'el máximo de la serie no puede pasar la saturación de su clase, y la roza',
  /** Cuánto se le perdona al máximo pasarse de un techo, en m³/m³. */
  tolerancia_por_arriba: 0.003,
  dias_minimos: 3650,
  /**
   * Cuánto puede quedar el máximo **por debajo** del techo elegido y seguir
   * contando como huella, en m³/m³. En los ocho píxeles probados el máximo cae a
   * 6 milésimas o menos; 20 deja holgura para el ruido del huso horario
   * (`EL_HUSO_MUEVE_EL_MAXIMO`) y descarta al que no se acerca a nada.
   */
  acercamiento_maximo: 0.02,
  /**
   * A cuánto por encima del máximo tiene que estar el techo siguiente para que
   * la serie lo descarte, en m³/m³. Más cerca que esto, el píxel podría ser de
   * esa otra clase y nunca haber tocado su saturación.
   */
  margen_minimo_al_segundo: 0.02,
  /**
   * Cuánta fracción de agua útil se tolera que cueste equivocarse entre dos
   * clases que la serie no separa, adimensional. Ver
   * `LAS_CLASES_QUE_NO_SE_SEPARAN`: el único par que el techo no separa cuesta
   * 0,144 y el par que le sigue 0,308, así que el tope cae en el medio.
   */
  discrepancia_maxima: 0.20,
  probada_en: [
    { sitio: 'Sidney, Montana', maximo: 0.434, clase: 'media', saturacion: 0.439, acercamiento: 0.005 },
    { sitio: 'Swift Current, Saskatchewan', maximo: 0.435, clase: 'media', saturacion: 0.439, acercamiento: 0.004 },
    { sitio: 'Sand Hills, Nebraska', maximo: 0.435, clase: 'media', saturacion: 0.439, acercamiento: 0.004 },
    { sitio: 'Loess de Iowa', maximo: 0.438, clase: 'media', saturacion: 0.439, acercamiento: 0.001 },
    { sitio: 'Quindío, Colombia', maximo: 0.438, clase: 'media', saturacion: 0.439, acercamiento: 0.001 },
    { sitio: 'Pampa argentina (-34,0 / -61,0)', maximo: 0.515, clase: 'fina', saturacion: 0.520, acercamiento: 0.005 },
    { sitio: 'Sahel de Malí (14,5 / -4,0)', maximo: 0.424, clase: 'media-fina', saturacion: 0.430, acercamiento: 0.006 },
  ],
  /** El que no se identifica, y es el que justifica `acercamiento_maximo`. */
  el_que_no_sale: {
    sitio: 'Kalahari (-22,0 / 22,0), arena profunda',
    maximo: 0.360,
    el_techo_mas_bajo_que_queda: 0.403,
    acercamiento: 0.043,
    que_devolvia_antes: 'gruesa',
    lo_que_costaba_errar: 0.556,
  },
  verificacion_que_no_decide: {
    que: 'el piso de la capa profunda contra el punto de marchitez de la clase elegida',
    sidney: { percentil_1_de_la_serie: 0.157, marchitez_publicada: 0.151 },
    por_que_no_decide:
      'mide el clima y no la textura: en Quindío da 0,344 porque el perfil nunca se seca y en '
      + 'Swift Current 0,045 porque el agua líquida se va al congelarse el suelo',
  },
  cuando_no_se_puede:
    'serie corta, píxel que nunca se acerca a un techo, o dos clases que la serie no separa y '
    + 'cuya diferencia cuesta más que `discrepancia_maxima`: devuelve null y no se siembra',
} as const;

/**
 * El par de clases que esta huella no puede separar, y por qué igual se usa.
 *
 * `media` satura en 0,439 y `media-fina` en 0,430: **nueve milésimas**. Un
 * máximo compatible con el techo de una es compatible con el de la otra, porque
 * una serie puede perfectamente quedarse nueve milésimas corta de su propia
 * saturación. La información no está en el dato y no hay regla que la saque.
 *
 * Es el único par así: de los quince pares de la tabla, los otros catorce tienen
 * las saturaciones a 27 milésimas o más, o sea arriba de
 * `margen_minimo_al_segundo`.
 *
 * Hasta el 11/11/2026 el código resolvía esto devolviendo `null`, y eso tenía dos
 * consecuencias que nadie había medido:
 *
 * - **`media-fina` no salía nunca**, para ningún máximo posible, y `media` salía
 *   sólo en una ventana de 8,5 milésimas;
 * - y en Sidney —el sitio contra el que está medido todo este motor— el máximo
 *   pedido como lo pide la ruta de producción da 0,430 justo, así que **el
 *   camino estaba apagado en el propio sitio de calibración**.
 *
 * Lo que decide el asunto es cuánto cuesta equivocarse, y está medido dos veces.
 * La primera, contra la literatura: las 159 mediciones con sonda de neutrones de
 * la Figura 5 **no separan las dos clases** —EAM 0,1725 con `media` contra
 * 0,1742 con `media-fina`, y el RMSE las ordena al revés—. La segunda, aguas
 * abajo, en `LA_DUDA_CUESTA_MENOS_QUE_CAERSE`: elegir mal entre las dos mueve
 * los kilos de la cola seca un 2 %, y caerse a la cadena los mueve un 33 %.
 *
 * Así que la elección no se esquiva: se toma la de techo más ajustado, se deja
 * la otra escrita en `en_duda` y se declara lo que costaría haber errado en
 * `discrepancia`. Lo que sí devuelve `null` es una duda **cara**: si las clases
 * que la serie no descarta difieren en más de `discrepancia_maxima` de fracción
 * de agua útil, no hay respuesta que valga la pena dar.
 */
export const LAS_CLASES_QUE_NO_SE_SEPARAN = {
  que_mide:
    'la máxima diferencia de fracción de agua útil entre dos clases, barriendo el contenido '
    + 'volumétrico compartido; adimensional, 0 a 1, y se multiplica por el AW del predio',
  pares_en_la_tabla: 15,
  el_unico_par: {
    clases: ['media', 'media-fina'] as const,
    distancia_de_saturaciones: 0.009,
    discrepancia: 0.144,
    donde_peor: 0.347,
  },
  el_par_que_le_sigue: {
    clases: ['muy-fina', 'organica'] as const,
    distancia_de_saturaciones: 0.152,
    discrepancia: 0.308,
  },
  /** El tope cae entre los dos, y por eso se puede justificar dónde. */
  por_eso_el_tope: 0.20,
  contra_la_figura_5: {
    n: 159,
    media: { eam: 0.1725, rmse: 0.2193 },
    media_fina: { eam: 0.1742, rmse: 0.2163 },
    que_dice: 'las dos reproducen la sonda igual de bien; el EAM prefiere media y el RMSE media-fina',
    las_otras_cuatro: 'EAM de 0,39 a 0,41, o sea dos veces y media peor',
  },
  el_resto_de_la_tabla:
    'las otras catorce parejas tienen las saturaciones a 0,027 o más, así que el techo las separa',
} as const;

/**
 * El huso horario con el que se pide la serie mueve el máximo, y cuánto.
 *
 * Open-Meteo entrega **medias diarias** y el día lo define el huso que se pida.
 * La saturación, en cambio, es un techo instantáneo. Promediar 24 horas no puede
 * dar más que el máximo horario, y qué 24 horas se promedian cambia el resultado:
 * el mismo píxel, la misma serie, pedido en UTC y en hora local, da máximos que
 * difieren **4 milésimas**, para un lado o para el otro.
 *
 * ```
 *                        UTC     hora local   diferencia
 *  Sidney, Montana      0,4340     0,4300       -0,0040
 *  Swift Current        0,4350     0,4390       +0,0040
 *  Pampa argentina      0,5150     0,5150        0,0000
 * ```
 *
 * Cuatro milésimas es poco para casi todo y **decisivo para esto**, porque las
 * dos clases más comunes tienen los techos a nueve. En Swift Current el máximo
 * local cae en 0,4390 clavado, la saturación de `media`: el techo existe y se
 * toca. En Sidney el mismo dato en hora local se queda en 0,4300, que es la
 * saturación de `media-fina` clavada, y ahí la huella ya no distingue.
 *
 * Por eso la regla no se juega a un filo: `acercamiento_maximo` es cinco veces
 * este ruido, y cuando el ruido alcanza para cambiar de clase la respuesta sale
 * con la duda declarada en vez de con un `null`.
 *
 * **Y por eso la ruta no cambió de huso.** Pedir la serie en UTC arreglaría
 * Sidney y rompería el balance, que necesita que el día sea el día del predio:
 * la lluvia de un día y la evapotranspiración de ese día tienen que ser del
 * mismo día local.
 */
export const EL_HUSO_MUEVE_EL_MAXIMO = {
  por_que: 'Open-Meteo entrega medias diarias y el huso define el día; la saturación es un techo instantáneo',
  medido: [
    { sitio: 'Sidney, Montana', utc: 0.4340, local: 0.4300, huso: 'America/Denver' },
    { sitio: 'Swift Current, Saskatchewan', utc: 0.4350, local: 0.4390, huso: 'America/Swift_Current' },
    { sitio: 'Pampa argentina', utc: 0.5150, local: 0.5150, huso: 'America/Argentina/Buenos_Aires' },
  ],
  ruido: 0.004,
  los_dos_techos_mas_juntos: 0.009,
  por_que_no_se_cambia_el_huso:
    'el balance necesita que el día sea el día local, porque la lluvia y la evapotranspiración '
    + 'de un día tienen que ser del mismo día',
  como_se_absorbe: 'acercamiento_maximo es cinco veces el ruido, y la duda se declara en vez de anular',
} as const;

/**
 * Lo que cuesta la duda y lo que cuesta caerse, medido en Sidney.
 *
 * Las 66 temporadas de Sidney corridas con cada una de las dos clases que la
 * serie no separa, y sin textura —que es la cadena simulando el invierno, la
 * degradación a la que se caía antes—:
 *
 * ```
 *                contra los doce      distribución        Yp      kilos
 *                 EAM     sesgo      p10    mediana     kg/ha    en el p10
 *  media         0,072   +0,070     0,452    0,820      1.449       655
 *  media-fina    0,061   +0,057     0,432    0,774      1.550       670
 *  sin textura   0,142   +0,140     0,677    0,935      1.283       869
 * ```
 *
 * Tres cosas que importan.
 *
 * **Las dos clases se parecen mucho más entre sí que cualquiera de las dos a la
 * cadena.** Contra los doce índices publicados, las dos cortan el error de la
 * cadena a menos de la mitad.
 *
 * **Y en los kilos se parecen todavía más, porque el error se cancela.** La clase
 * más húmeda baja el índice y el `Yp` se despeja **dividiendo** por el índice, así
 * que sube: 0,452 × 1.449 contra 0,432 × 1.550 son 655 y 670 kg/ha, un 2 % de
 * diferencia. Es la primera vez en este bloque que las dos direcciones juegan a
 * favor.
 *
 * **Caerse cuesta dieciséis veces más.** La cadena pone 869 kg/ha en la cola
 * seca, un 33 % arriba, y es la cola seca la que dimensiona la carga.
 *
 * O sea que devolver `null` para no tener que elegir entre dos clases que
 * difieren un 2 % costaba un 33 %. Eso es lo que cambió el 11/11/2026.
 */
export const LA_DUDA_CUESTA_MENOS_QUE_CAERSE = {
  sitio: 'Sidney, Montana, ventana de 84 días desde el 15 de abril',
  por_clase: [
    { clase: 'media', n: 66, eam: 0.072, sesgo: 0.070, p10: 0.452, mediana: 0.820, yp_kg_ha: 1449, kilos_en_el_p10: 655 },
    { clase: 'media-fina', n: 66, eam: 0.061, sesgo: 0.057, p10: 0.432, mediana: 0.774, yp_kg_ha: 1550, kilos_en_el_p10: 670 },
    { clase: null, n: 64, eam: 0.142, sesgo: 0.140, p10: 0.677, mediana: 0.935, yp_kg_ha: 1283, kilos_en_el_p10: 869 },
  ],
  el_yp_sale_de: 'un corte de 1.200 kg/ha en la temporada de índice mediano',
  los_kilos_salen_de: 'el Yp por el índice del p10, que es la cuenta con la que se dimensiona la carga',
  /**
   * Los dos porcentajes van contra `media`, que es la clase que el máximo pedido
   * en UTC identifica y la más baja de las dos en la cola seca. Contra
   * `media-fina` errar sigue siendo 2 % y caerse da 30 %.
   */
  errar_entre_las_dos_pct: 2,
  caerse_a_la_cadena_pct: 33,
  por_que_se_cancela:
    'la clase más húmeda baja el índice y el Yp se despeja dividiendo por el índice, así que sube',
  en_el_dia_del_rebrote_mm:
    'media-fina entrega al rebrote 5,8 mm menos que media sobre 150, con extremos de -19 y +6,4',
} as const;

/**
 * La geometría: tres capas de 30 cm contra cuatro capas que no coinciden.
 *
 * El modelo parte el perfil en tres capas de 30 cm, que es como se midió con la
 * sonda. ERA5-Land lo parte en 0-7, 7-28, 28-100 y 100-255 cm. Entonces:
 *
 * - la capa de **0-30 cm** se arma pesando las tres primeras por el espesor que
 *   aporta cada una: 7/30, 21/30 y 2/30;
 * - las de **30-60 y 60-90 cm** caen las dos enteras adentro de la de 28-100, y
 *   por lo tanto **reciben la misma humedad**.
 *
 * Es la misma pérdida que ya tiene el factor de actividad radicular con la
 * temperatura, y la Figura 5 dice cuánto cuesta con un caso concreto: el 25 de
 * abril de 1967 la figura publica la capa de 30-60 cm al **71 %** de su agua
 * útil y la de 60-90 al **4 %** —un frente de mojado que todavía no bajó—, y el
 * reanálisis le da **31 %** a las dos. El perfil total sale bien igual (77 mm
 * contra 80 medidos) porque los dos errores se compensan, pero el reparto no.
 *
 * Eso importa porque las dos capas profundas no son intercambiables: la de 60-90
 * tiene menos raíces y, desde el 09/11/2026, menos actividad radicular. Partirla
 * pide un submodelo de humedad por profundidad, que es otra fuente.
 */
export const CAPAS_DEL_REANALISIS = {
  modelo_cm: [[0, 30], [30, 60], [60, 90]],
  era5_land_cm: [[0, 7], [7, 28], [28, 100], [100, 255]],
  pesos_de_la_primera: [7 / 30, 21 / 30, 2 / 30],
  las_dos_profundas: 'soil_moisture_28_to_100cm_mean, la misma para 30-60 y para 60-90',
  lo_que_se_pierde: {
    caso: '25 de abril de 1967, Sidney',
    figura: { capa_30_60: 0.71, capa_60_90: 0.04 },
    reanalisis: { capa_30_60: 0.31, capa_60_90: 0.31 },
    el_perfil_igual_cierra: { figura_mm: 80.1, reanalisis_mm: 76.8 },
  },
} as const;

/**
 * Cuántos días caen fuera del rango del modelo, en Sidney, 23.742 días.
 *
 * El recorte a [0, 1] no es gratis y conviene saber cuánto recorta. Lo que
 * importa de esta tabla es la última fila: **en los 65 días de rebrote de la
 * serie, la capa profunda nunca cayó abajo del punto de marchitez ni pasó la
 * capacidad de campo**, que es justo donde el dato se usa.
 *
 * Arriba sí recorta, y en una sola dirección: la capa superficial pasa de
 * capacidad de campo uno de cada nueve días —drenaje en tránsito, agua que el
 * modelo del reanálisis todavía no bajó— y queda abajo del marchitez uno de cada
 * dieciocho. El recorte de abajo es el que sesga, y está medido contra la
 * Figura 5: ver `ADVERTENCIAS_AGUA_DEL_PERFIL.la_superficie_no_baja_a_seco`.
 */
export const LOS_DIAS_FUERA_DE_RANGO = {
  sitio: 'Sidney, Montana, 1960-2024, 23.742 días',
  por_capa: [
    { capa: 'soil_moisture_0_to_7cm_mean', bajo_marchitez_pct: 5.67, sobre_capacidad_pct: 11.1 },
    { capa: 'soil_moisture_7_to_28cm_mean', bajo_marchitez_pct: 0.08, sobre_capacidad_pct: 5.0 },
    { capa: 'soil_moisture_28_to_100cm_mean', bajo_marchitez_pct: 0.32, sobre_capacidad_pct: 0.3 },
  ],
  los_dias_de_rebrote: {
    cuantos: 65,
    capa: 'soil_moisture_28_to_100cm_mean',
    minimo: 0.173,
    maximo: 0.348,
    capacidad_de_la_clase: 0.347,
    fuera_de_rango: 0,
  },
} as const;

/**
 * El caso resuelto: la Figura 5 del trabajo, 158 mediciones con sonda de
 * neutrones.
 *
 * La figura publica cuatro temporadas —1967, 1968, 1969 y 1977— con tres paneles
 * cada una, uno por capa de 30 cm, con el agua medida (círculos, quincenal) y la
 * predicha (línea) de abril a septiembre. Dos de esas cuatro, **1968 y 1977**,
 * son dos de las tres temporadas donde la cadena de acequia más lejos quedaba.
 *
 * Se digitalizó el escaneo columna por columna. Lo primero que sale de ahí no es
 * una comparación sino una **confirmación de un supuesto**: la envolvente de
 * cada capa sobre las cuatro temporadas da
 *
 * ```
 *   0-30 cm    16,2 .. 73,8 mm     rango 57,6
 *   30-60 cm   28,9 .. 82,2 mm     rango 53,3
 *   60-90 cm   32,8 .. 82,2 mm     rango 49,4
 * ```
 *
 * o sea unos **50 mm de agua útil por capa**, que es exactamente lo que el arnés
 * venía suponiendo sin respaldo —150 mm en el perfil de 90 cm— y que hasta hoy
 * estaba declarado como una decisión nuestra. La capa superficial tiene un rango
 * más ancho porque el trabajo la deja secar **por debajo** del punto de
 * marchitez, hasta el contenido de suelo seco al aire.
 *
 * Y después sí, la comparación, en fracción de agua útil, punto medido contra el
 * día que le toca del reanálisis:
 *
 * ```
 *               n     sesgo     EAM
 *   0-30 cm    50    +0,074    0,161
 *   30-60 cm   66    +0,033    0,145
 *   60-90 cm   42    +0,031    0,119
 *   todas     158    +0,046    0,143      r = 0,768
 * ```
 *
 * **ERA5-Land lee húmedo**, y más en la superficie que abajo, que es lo esperable
 * porque ahí el suelo real baja del punto de marchitez y el reanálisis recorta en
 * cero. El sesgo de +0,046 de agua útil son unos **7 mm sobre 150**.
 *
 * En el día que decide todo —con cuánta agua arranca la temporada— el error es
 * más chico que el sesgo medio y no tiene signo:
 *
 * ```
 *            medido    ERA5-Land    cadena de acequia
 *   1967     80,1 mm    76,8 mm        129,9 mm
 *   1968     53,1 mm    69,2 mm         90,0 mm
 *   1969    109,4 mm   110,7 mm        138,9 mm
 *   1977     76,0 mm    58,1 mm        132,2 mm
 * ```
 *
 * ERA5-Land: sesgo −0,95 mm, error absoluto medio **9,65 mm sobre 150**. La cadena
 * que simula el invierno: **+43,1 mm**, siempre para el mismo lado.
 */
export const CONTRA_LA_FIGURA_5 = {
  figura: 'Figura 5, p. 310 — «Field-measured and model-predicted soil water content (cm water/30-cm soil increment). Sidney, Montana»',
  temporadas: [1967, 1968, 1969, 1977],
  /** La envolvente de la figura por capa, en mm por capa de 30 cm. */
  envolvente_mm: [
    { capa: '0-30', minimo: 16.2, maximo: 73.8, rango: 57.6 },
    { capa: '30-60', minimo: 28.9, maximo: 82.2, rango: 53.3 },
    { capa: '60-90', minimo: 32.8, maximo: 82.2, rango: 49.4 },
  ],
  confirma_el_agua_util: { por_capa_mm: 50, perfil_mm: 150 },
  por_que_la_primera_tiene_mas_rango:
    'el trabajo deja la capa superficial secarse por debajo del punto de marchitez, hasta el '
    + 'contenido de suelo seco al aire, y el reanálisis no puede',
  /** Fracción de agua útil medida contra la del reanálisis. */
  en_fraccion_de_agua_util: {
    por_capa: [
      { capa: '0-30', n: 50, sesgo: 0.074, eam: 0.161 },
      { capa: '30-60', n: 66, sesgo: 0.033, eam: 0.145 },
      { capa: '60-90', n: 42, sesgo: 0.031, eam: 0.119 },
    ],
    todas: { n: 158, sesgo: 0.046, eam: 0.143, r: 0.768 },
    en_mm_sobre_el_perfil: 7,
  },
  /** El día del rebrote, que es donde el dato se usa. En mm sobre 150. */
  el_dia_del_rebrote: [
    { anio: 1967, dia: '25 de abril', medido: 80.1, reanalisis: 76.8, cadena: 129.9 },
    { anio: 1968, dia: '15 de abril', medido: 53.1, reanalisis: 69.2, cadena: 90.0 },
    { anio: 1969, dia: '14 de abril', medido: 109.4, reanalisis: 110.7, cadena: 138.9 },
    { anio: 1977, dia: '12 de abril', medido: 76.0, reanalisis: 58.1, cadena: 132.2 },
  ],
  resumen_del_arranque: {
    reanalisis: { sesgo_mm: -0.95, eam_mm: 9.65 },
    cadena: { sesgo_mm: 43.1, eam_mm: 43.1 },
  },
  sesgo_del_dato: 'alto',
} as const;

/**
 * La cadena arranca las temporadas húmeda de más, y cuánto cuesta.
 *
 * Esto es la respuesta a lo que `EL_FACTOR_DESTAPA_EL_TECHO_PERO_NO_EL_SESGO`
 * había dejado anotado como «lo que sigue». Medido sobre las mismas 65
 * temporadas de Sidney, misma `Eo`, mismo factor de actividad radicular, misma
 * ventana: **la cadena entrega al rebrote 120,7 mm de los 150 posibles y el
 * reanálisis dice 79,6**, una diferencia media de **+41,1 mm** que llega a +80 en
 * una temporada y que **nunca** va para el otro lado (el mínimo es −2,8 mm).
 *
 * Contra los doce índices publicados:
 *
 * ```
 *                            EAM     sesgo    en el techo    r
 *   cadena con invierno     0,133   +0,132      4 de 12     0,704
 *   sembrada del dato       0,064   +0,061      2 de 12     0,858
 * ```
 *
 * El error se parte al medio. Y las dos temporadas secas que la Figura 5 cubre
 * se acomodan solas:
 *
 * ```
 *          publicado   cadena   sembrada
 *   1977     0,402      0,879     0,443
 *   1968     0,564      0,719     0,608
 *   1971     0,577      0,957     0,942   ← no se mueve
 * ```
 *
 * **1971 queda y es el que no se explica.** El reanálisis dice que arrancó con
 * 88 mm de los 150 —no es una temporada de perfil seco para ERA5-Land— y el
 * trabajo publica un índice de 0,58. La Figura 5 no la cubre. De las cuatro
 * causas que quedaban, ésta no era la de 1971: lo que queda ahí es el
 * escurrimiento nulo, el agua bajo el límite inferior o la lluvia de ERA5, que
 * en esa temporada difiere del pluviómetro en +103 mm, el máximo de las doce.
 *
 * ## Y lo que se va de arriba
 *
 * Sembrar la temporada **saca el invierno del cálculo**. La cadena existía para
 * olvidar el arranque; si el arranque está medido, no hay nada que olvidar y no
 * hay que correr noviembre con `b = 0`. Con eso se cae
 * `EL_INVIERNO_DECIDE_LA_COLA_SECA`, que era la decisión más frágil del motor:
 * el `p10` que se movía 3,3 veces según cómo se tratara la demanda de fuera de
 * temporada deja de depender de eso. Y las dos primeras temporadas de la serie,
 * que la cadena descartaba porque el arranque todavía pesaba, vuelven: 65 en vez
 * de 63.
 */
export const LA_CADENA_ARRANCA_HUMEDA_DE_MAS = {
  sitio: 'Sidney, Montana, 65 temporadas, ventana de 84 días desde el 15 de abril',
  agua_al_rebrote_mm: {
    cadena: 120.7,
    sembrada: 79.6,
    diferencia_media: 41.1,
    diferencia_minima: -2.8,
    diferencia_maxima: 79.8,
    tope: 150,
  },
  contra_los_doce: {
    cadena: { eam: 0.133, sesgo: 0.132, en_el_techo: 4, r: 0.704 },
    sembrada: { eam: 0.064, sesgo: 0.061, en_el_techo: 2, r: 0.858 },
  },
  las_tres_que_estaban_lejos: [
    { anio: 1977, publicado: 0.402, cadena: 0.879, sembrada: 0.443 },
    { anio: 1968, publicado: 0.564, cadena: 0.719, sembrada: 0.608 },
    { anio: 1971, publicado: 0.577, cadena: 0.957, sembrada: 0.942 },
  ],
  la_que_no_se_explica: {
    anio: 1971,
    agua_al_rebrote_mm: 88.1,
    por_que_no_es_esta_causa: 'para el reanálisis 1971 no arrancó con el perfil seco',
    lo_que_queda: 'escurrimiento nulo, agua bajo el límite inferior, o la lluvia de ERA5, que en '
      + '1971 difiere del pluviómetro en +103 mm, el máximo de las doce temporadas',
  },
  /** En la serie larga de 63 (cadena) contra 65 (sembrada) temporadas. */
  en_la_distribucion: {
    cadena: { n: 63, p10: 0.672, mediana: 0.935, p75: 0.975, ancho: 1.47 },
    sembrada: { n: 65, p10: 0.451, mediana: 0.831, p75: 0.938, ancho: 2.18 },
  },
  baja_el_indice_en: { temporadas: 61, de: 65 },
  /**
   * Y en los kilos, que es lo que se mira. El cociente depende de en qué año se
   * tomó el corte del que sale el `Yp`, así que va la mediana sobre los 65
   * posibles años de corte, con el p10 y el p90 entre paréntesis.
   */
  lo_que_mueve_en_los_kilos: {
    anio_del_p10: { mediana: 0.74, p10: 0.67, p90: 0.99 },
    anio_de_la_mediana: { mediana: 0.98, p10: 0.89, p90: 1.31 },
    anio_del_p90: { mediana: 1.10, p10: 1.00, p90: 1.46 },
    que_significa:
      'no es un corrimiento parejo: la cola seca baja un cuarto y los años buenos suben un '
      + 'décimo, o sea que la distribución se abre. Para dimensionar carga animal el que manda '
      + 'es el primero.',
  },
  lo_que_se_cae:
    'con el agua inicial medida la cadena no necesita correr inviernos, así que '
    + 'EL_INVIERNO_DECIDE_LA_COLA_SECA —el p10 que se movía 3,3 veces según cómo se tratara la '
    + 'demanda de fuera de temporada— deja de aplicar, y vuelven las dos primeras temporadas de '
    + 'la serie que la cadena descartaba.',
} as const;

/**
 * El segundo modelo no confirma, y eso también es un resultado.
 *
 * Con la temperatura del suelo el patrón fue: antes de creerle al reanálisis,
 * preguntarle a otro. MERRA-2, por NASA POWER, publica `GWETROOT` y `GWETPROF`
 * desde 1981. Acá el control **no cierra**, y conviene decirlo con el número
 * antes que esconderlo:
 *
 * - correlación entre el 15 de abril de ERA5-Land y el `GWETROOT` de MERRA-2, 44
 *   años: **r = 0,695**. Sin la tendencia de cada uno, 0,713; promediando abril
 *   entero en vez de un día, 0,719. O sea que la mitad de la varianza del
 *   arranque es desacuerdo entre los dos modelos.
 * - y peor: de los **seis arranques más secos** de los 44 años, los dos modelos
 *   **no comparten ninguno**. ERA5-Land dice 2021, 1988, 2016, 2008, 1991 y
 *   2012; MERRA-2 dice 1990, 1981, 1984, 1985, 2004 y 2005.
 *
 * Las escalas no son la misma —`GWETROOT` es grado de saturación, 0 suelo seco y
 * 1 suelo saturado, y no fracción de agua útil entre marchitez y capacidad— así
 * que las series no se restan directamente; la comparación de arriba es por
 * correlación y por orden, que no dependen de la escala.
 *
 * **Por qué igual se usa ERA5-Land.** Porque de los dos es el único que tiene
 * contra qué medirse: la Figura 5 publica agua medida con sonda en cuatro
 * temporadas de 1967 a 1977, y MERRA-2 empieza en 1981. Entre un dato que cierra
 * contra una medición de campo y otro que no se puede probar, se usa el que
 * cierra, y se declara que un segundo modelo discrepa.
 *
 * Lo que esto acota es la confianza, no el método: el agua inicial de **una**
 * temporada puntual puede estar errada aunque la distribución de las 65 sea la
 * que es.
 */
export const EL_SEGUNDO_MODELO_NO_CONFIRMA = {
  control: 'NASA POWER / MERRA-2, GWETROOT, 1981-2024, 44 temporadas',
  r_al_15_de_abril: 0.695,
  r_sin_tendencia: 0.713,
  r_con_abril_entero: 0.719,
  r_de_spearman: 0.659,
  los_seis_arranques_mas_secos: {
    era5_land: [2021, 1988, 2016, 2008, 1991, 2012],
    merra2: [1990, 1981, 1984, 1985, 2004, 2005],
    en_comun: 0,
  },
  por_que_no_se_restan:
    'GWETROOT es grado de saturación —0 suelo seco, 1 suelo saturado— y no fracción de agua útil '
    + 'entre marchitez y capacidad de campo: la comparación es por correlación y por orden',
  por_que_igual_se_usa_era5:
    'es el único de los dos que tiene contra qué medirse: la Figura 5 publica agua medida con '
    + 'sonda de 1967 a 1977 y MERRA-2 empieza en 1981',
  que_acota: 'la confianza en una temporada puntual, no la distribución de la serie',
} as const;

export const ADVERTENCIAS_AGUA_DEL_PERFIL = {
  una_humedad_para_dos_capas:
    'Las capas de 30-60 y 60-90 cm reciben la misma humedad, porque las dos caen adentro de la '
    + 'capa de 28-100 cm del reanálisis. El perfil total cierra; el reparto entre las dos no. En '
    + 'la Figura 5 hay un caso con 71 % de agua útil arriba y 4 % abajo donde el reanálisis pone '
    + '31 % en las dos.',
  la_superficie_no_baja_a_seco:
    'El suelo real seca la capa superficial por debajo del punto de marchitez, hasta el contenido '
    + 'de suelo seco al aire; el reanálisis se recorta en el marchitez. Contra la Figura 5 eso '
    + 'hace que la capa de 0-30 cm lea 0,074 de agua útil alta, el doble que las dos de abajo.',
  textura_sin_identificar:
    'No se pudo identificar la clase de textura del píxel, por una de tres razones: la serie es '
    + 'más corta que diez años, el máximo nunca se acercó a la saturación de ninguna clase, o las '
    + 'clases que la serie no alcanza a descartar difieren tanto entre sí que elegir una sería '
    + 'una apuesta. Sin textura no hay cómo pasar de contenido volumétrico a agua útil, y el agua '
    + 'inicial vuelve a ser una banda.',
  textura_en_duda:
    'La textura del píxel quedó identificada pero no sola: hay otra clase cuya saturación la '
    + 'serie no alcanza a descartar, porque una serie puede quedarse unas milésimas corta de su '
    + 'propio techo. Se tomó la de techo más ajustado. Las 159 mediciones con sonda de la Figura '
    + '5 tampoco separan al único par que cae acá —`media` y `media-fina`—, y aguas abajo elegir '
    + 'mal mueve los kilos de la cola seca un 2 %, contra el 33 % que mueve no elegir.',
  sin_humedad_de_suelo:
    'La serie no trae humedad de suelo, así que el agua con la que arranca la temporada no está '
    + 'medida: o se declara, o sale la banda entre el perfil seco y el lleno, o la simula la '
    + 'cadena corriendo el invierno, que lee unos 40 mm húmeda de más.',
} as const;

/**
 * Lo que hay que declarar al sembrar el perfil con el reanálisis, y las dos
 * direcciones.
 *
 * La trampa de este bloque ya mordió dos veces: el factor baja el índice y el
 * índice bajo **sube** el `Yp` que se despeja de un corte, porque el despeje
 * divide. Acá pasa lo mismo y en el mismo sentido que las degradaciones
 * anteriores: el reanálisis lee **+0,046 de agua útil alto** contra las 158
 * mediciones de la Figura 5, así que el índice sigue leyendo **alto** —+0,061
 * contra los doce publicados, contra +0,132 de la cadena— y el `Yp` despejado
 * sigue saliendo **bajo**.
 */
export const AVISO_AGUA_INICIAL = {
  aviso:
    'El agua con la que arranca la temporada sale de la humedad de suelo de ERA5-Land, no de una '
    + 'medición del predio. Contra las 158 mediciones con sonda de neutrones que publica la '
    + 'Figura 5 del trabajo, el reanálisis lee 0,046 de agua útil alto —unos 7 mm sobre 150— y en '
    + 'el día del rebrote erra 9,65 mm sin signo. Un segundo modelo de suelo (MERRA-2) coincide '
    + 'sólo a medias: de los seis arranques más secos de 44 años no comparten ninguno, así que el '
    + 'arranque de una temporada puntual puede estar errado aunque la distribución de la serie no '
    + 'lo esté.',
  /** El índice `T/Tp` sigue leyendo alto, bastante menos que con el invierno simulado. */
  sesgo_del_indice: 'alto' as Direccion,
  /** Y por lo tanto el `Yp` que se despeja dividiendo por el índice sale bajo. */
  sesgo_del_yp: 'bajo' as Direccion,
} as const;

/** El aviso, en la forma que consumen `ypDelCorte` e `indicesPorAnio`. */
export function avisoDelAguaInicial(cual: 'indice' | 'yp'): AvisoDeCorte {
  return {
    aviso: AVISO_AGUA_INICIAL.aviso,
    sesgo: cual === 'indice' ? AVISO_AGUA_INICIAL.sesgo_del_indice : AVISO_AGUA_INICIAL.sesgo_del_yp,
  };
}

// ─── Las funciones ───────────────────────────────────────────────────────────

export interface TexturaDelPixel {
  textura: TexturaDeHTessel;
  /** El máximo de la serie que la identificó, en m³/m³. */
  maximo_de_la_serie: number;
  /**
   * Cuánto le faltó al máximo para llegar al techo de la clase elegida, en
   * m³/m³. Es la huella: en los ocho píxeles probados da 6 milésimas o menos.
   * Puede salir levemente negativo si el máximo pasó el techo adentro de
   * `tolerancia_por_arriba`.
   */
  acercamiento: number;
  /** Cuánto más arriba del máximo quedó el techo siguiente, en m³/m³. */
  margen_al_segundo: number;
  /**
   * Las clases que la serie **no alcanza a descartar**: su saturación está arriba
   * del máximo pero a menos de `margen_minimo_al_segundo`, así que el píxel
   * podría ser de una de ellas y nunca haber tocado su propia saturación. Vacío
   * es una identificación limpia. Ver `LAS_CLASES_QUE_NO_SE_SEPARAN`.
   */
  en_duda: readonly TexturaDeHTessel[];
  /**
   * Cuánta fracción de agua útil costaría haber errado contra la peor de las
   * clases de `en_duda`, adimensional. Cero cuando no hay duda. Si pasa
   * `discrepancia_maxima` la función devuelve `null` en vez de elegir.
   */
  discrepancia: number;
  dias: number;
}

/**
 * Cuánto se parecen dos clases **en lo que el motor realmente usa**.
 *
 * No alcanza con saber que dos clases son parecidas: lo que importa es si dan la
 * misma fracción de agua útil, que es lo único que sale de este archivo hacia el
 * balance. Devuelve la máxima diferencia absoluta de `fraccionDeAguaUtil` entre
 * las dos, barriendo el contenido volumétrico desde 0 hasta la más baja de las
 * dos saturaciones. Adimensional, 0 a 1; multiplicado por el `AW` de las capas
 * del predio da milimetros.
 *
 * La función es lineal por tramos con quiebres en el marchitez y en la capacidad
 * de campo de cada clase, así que el máximo cae **siempre** en un quiebre o en
 * un extremo: evaluar esos seis puntos es exacto, no un muestreo.
 */
export function discrepanciaDeAguaUtil(a: TexturaDeHTessel, b: TexturaDeHTessel): number {
  const hasta = Math.min(a.saturacion, b.saturacion);
  let peor = 0;
  for (const theta of [0, a.marchitez, b.marchitez, a.capacidad, b.capacidad, hasta]) {
    if (theta < 0 || theta > hasta) continue;
    const fa = fraccionDeAguaUtil(theta, a);
    const fb = fraccionDeAguaUtil(theta, b);
    if (fa === null || fb === null) continue;
    const d = Math.abs(fa - fb);
    if (d > peor) peor = d;
  }
  return peor;
}

/**
 * Qué clase de textura de H-TESSEL le tocó al píxel, leída de la propia serie.
 *
 * Entra el **máximo de contenido volumétrico** que la serie alcanzó en cualquiera
 * de sus capas, en m³/m³, y cuántos días tiene la serie. Sale la clase de techo
 * más bajo entre las que el máximo no pasó —la que roza— con la duda declarada,
 * o `null`.
 *
 * Devuelve `null` en cuatro casos, y los cuatro son degradaciones honestas:
 *
 * - la serie es más corta que `dias_minimos`;
 * - el máximo pasó la saturación de todas las clases;
 * - el máximo no se acerca a ningún techo a menos de `acercamiento_maximo`, así
 *   que no hay huella de nada;
 * - las clases que la serie no descarta difieren en más de `discrepancia_maxima`
 *   de fracción de agua útil, así que elegir una sería una apuesta cara.
 *
 * Ver `COMO_SE_IDENTIFICA_LA_TEXTURA` para la regla y los ocho píxeles donde se
 * probó, `LAS_CLASES_QUE_NO_SE_SEPARAN` para el único par que no separa y
 * `EL_HUSO_MUEVE_EL_MAXIMO` para el ruido del propio máximo.
 */
export function texturaDelPixel(
  maximo_de_la_serie: number,
  dias: number,
  dias_minimos = COMO_SE_IDENTIFICA_LA_TEXTURA.dias_minimos,
): TexturaDelPixel | null {
  const C = COMO_SE_IDENTIFICA_LA_TEXTURA;
  if (!Number.isFinite(maximo_de_la_serie) || maximo_de_la_serie <= 0) return null;
  if (!Number.isFinite(dias) || dias < dias_minimos) return null;

  // 1. El techo descarta: quedan las clases cuya saturación el máximo no pasó.
  //    Ordenadas por saturación, la primera es la del techo más ajustado.
  const candidatas = TEXTURAS_DE_HTESSEL
    .filter(t => t.saturacion >= maximo_de_la_serie - C.tolerancia_por_arriba)
    .slice()
    .sort((a, b) => a.saturacion - b.saturacion);
  const elegida = candidatas[0];
  if (elegida === undefined) return null;

  // 2. Y lo tiene que rozar: si el máximo quedó lejos del techo más bajo, la
  //    serie no se acercó a ninguna saturación y la más cercana no prueba nada.
  const acercamiento = elegida.saturacion - maximo_de_la_serie;
  if (acercamiento > C.acercamiento_maximo) return null;

  // 3. Las clases que la serie no alcanza a descartar, y lo que costaría errar.
  const en_duda = candidatas
    .slice(1)
    .filter(t => t.saturacion - maximo_de_la_serie < C.margen_minimo_al_segundo);
  let discrepancia = 0;
  for (const t of en_duda) {
    const d = discrepanciaDeAguaUtil(elegida, t);
    if (d > discrepancia) discrepancia = d;
  }
  if (discrepancia > C.discrepancia_maxima) return null;

  const segunda = candidatas[1];
  return {
    textura: elegida,
    maximo_de_la_serie,
    acercamiento,
    margen_al_segundo: segunda === undefined ? 1 : segunda.saturacion - maximo_de_la_serie,
    en_duda,
    discrepancia,
    dias,
  };
}

/**
 * De contenido volumétrico a fracción de agua útil, 0 a 1.
 *
 *     f = (θ − θpwp) / (θcap − θpwp)
 *
 * `θ` en m³/m³; sale adimensional. Se recorta a [0, 1]: por arriba es agua en
 * tránsito que el modelo del reanálisis todavía no drenó, y por abajo es la
 * superficie secándose más allá de lo que el reanálisis representa. Cuántos días
 * cae afuera, en `LOS_DIAS_FUERA_DE_RANGO`.
 */
export function fraccionDeAguaUtil(theta: number | null | undefined, t: TexturaDeHTessel): number | null {
  if (theta === null || theta === undefined || !Number.isFinite(theta)) return null;
  const rango = t.capacidad - t.marchitez;
  if (rango <= 0) return null;
  return Math.max(0, Math.min(1, (theta - t.marchitez) / rango));
}

/**
 * La fracción de agua útil de las tres capas de 30 cm del modelo, a partir de las
 * tres primeras capas de ERA5-Land.
 *
 * La de 0-30 cm se arma pesando 7/30, 21/30 y 2/30; las de 30-60 y 60-90 salen
 * las dos de la de 28-100 cm, que las contiene. Ver `CAPAS_DEL_REANALISIS`.
 * Devuelve `null` si falta cualquiera de las tres: media humedad no es una
 * humedad a medias, es otro perfil.
 */
export function aguaUtilDelPerfil(
  theta_0_7: number | null | undefined,
  theta_7_28: number | null | undefined,
  theta_28_100: number | null | undefined,
  t: TexturaDeHTessel,
): [number, number, number] | null {
  const a = theta_0_7;
  const b = theta_7_28;
  const c = theta_28_100;
  if (a === null || a === undefined || !Number.isFinite(a)) return null;
  if (b === null || b === undefined || !Number.isFinite(b)) return null;
  if (c === null || c === undefined || !Number.isFinite(c)) return null;
  const [p0, p1, p2] = CAPAS_DEL_REANALISIS.pesos_de_la_primera as unknown as [number, number, number];
  const superficial = fraccionDeAguaUtil(p0 * a + p1 * b + p2 * c, t);
  const profunda = fraccionDeAguaUtil(c, t);
  if (superficial === null || profunda === null) return null;
  return [superficial, profunda, profunda];
}

export interface HumedadDeLaSerie {
  textura: TexturaDelPixel;
  /** La fracción de agua útil de las tres capas de cada día, o `null` ese día. */
  por_dia: Array<readonly number[] | null>;
  /** Si los tres contenidos llegaron todos los días. */
  completa: boolean;
}

/**
 * La serie entera de humedad de ERA5-Land, de contenido volumétrico a fracción
 * de agua útil por capa del modelo.
 *
 * Hace las dos cosas de una: identifica la textura del píxel con el máximo de
 * toda la serie —que es lo único que la identifica, ver
 * `COMO_SE_IDENTIFICA_LA_TEXTURA`— y después convierte día por día. Devuelve
 * `null` si las tres listas no miden lo mismo o si la textura no se pudo
 * identificar; ahí no hay agua inicial medida y quien llama se degrada.
 *
 * `completa` dice si los tres contenidos llegaron **todos** los días. La cadena
 * de `forrajeAnios.ts` igual revisa sólo el primer día de cada ventana, pero una
 * serie con huecos es motivo para desconfiar del resto.
 */
export function humedadDeLaSerie(
  theta_0_7: ReadonlyArray<number | null | undefined>,
  theta_7_28: ReadonlyArray<number | null | undefined>,
  theta_28_100: ReadonlyArray<number | null | undefined>,
  dias_minimos = COMO_SE_IDENTIFICA_LA_TEXTURA.dias_minimos,
): HumedadDeLaSerie | null {
  const n = theta_0_7.length;
  if (n === 0 || theta_7_28.length !== n || theta_28_100.length !== n) return null;
  let maximo = 0;
  for (const lista of [theta_0_7, theta_7_28, theta_28_100]) {
    for (const v of lista) {
      if (v !== null && v !== undefined && Number.isFinite(v) && v > maximo) maximo = v;
    }
  }
  const textura = texturaDelPixel(maximo, n, dias_minimos);
  if (textura === null) return null;
  const por_dia: Array<readonly number[] | null> = [];
  let completa = true;
  for (let i = 0; i < n; i++) {
    const f = aguaUtilDelPerfil(theta_0_7[i], theta_7_28[i], theta_28_100[i], textura.textura);
    if (f === null) completa = false;
    por_dia.push(f);
  }
  return { textura, por_dia, completa };
}

/**
 * De fracción de agua útil a milímetros, con el `AW` de cada capa del predio.
 *
 * El reanálisis dice **qué tan lleno** está el perfil y el predio dice **de
 * cuánto**: la misma fracción son 50 mm en una capa arenosa de 30 cm y 119 en una
 * orgánica. Devuelve `null` si las dos listas no tienen el mismo largo.
 */
export function aguaInicialPorCapaMm(
  fraccion: readonly number[],
  aw_por_capa_mm: readonly number[],
): number[] | null {
  if (fraccion.length !== aw_por_capa_mm.length || fraccion.length === 0) return null;
  const out: number[] = [];
  for (let i = 0; i < fraccion.length; i++) {
    const f = fraccion[i] as number;
    const aw = aw_por_capa_mm[i] as number;
    if (!Number.isFinite(f) || !Number.isFinite(aw) || aw < 0) return null;
    out.push(Math.max(0, Math.min(1, f)) * aw);
  }
  return out;
}
