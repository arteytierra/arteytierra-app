/**
 * Lo que está MEDIDO de producción forrajera natural, bioma por bioma.
 *
 * ## Por qué existe este archivo
 *
 * `prodForrajera` —en `produccion.ts`, con dos copias más en `pastoreo.ts` y en
 * el panel de Cobertura— es una escalera de cinco escalones por lluvia anual
 * que **no tiene ninguna fuente**:
 *
 * ```
 * < 300 mm → 700 kg MS/ha/año · < 500 → 1.500 · < 700 → 3.000
 * < 900 → 5.000 · ≥ 900 → 7.000
 * ```
 *
 * Ese número multiplica todo lo que viene después: la oferta de pasto, la carga
 * animal, el tamaño del rodeo y el agua que hay que almacenar para esa hacienda.
 * Este archivo es el primer paso para reemplazarla: **las mediciones primero, el
 * reemplazo después**, que es el orden que pide `skills/motor-de-calculo`.
 *
 * ## Lo que estas mediciones ya demuestran
 *
 * La escalera no está «un poco alta» ni «un poco baja»: se equivoca **en las dos
 * direcciones**, y por eso el problema no es calibrarla sino que mira una sola
 * variable. Con la lluvia de cada sitio:
 *
 * | Sitio | Lluvia | Escalera | Medido | |
 * |---|---|---|---|---|
 * | Dakota, pradera de altura | 381–508 mm | 1.500–3.000 | 2.643–3.063 | va bien |
 * | Texas, Edwards Plateau | 508–762 mm | 3.000–5.000 | 825–2.578 | alta 2–4× |
 * | Altiplano de Puno, 3.900 m | 410–1.119 mm | 1.500–7.000 | 626–1.958 | alta hasta 11× |
 * | Lesbos, fryganas | 354–797 mm | 1.500–5.000 | 300–5.800 | el rango medido es más ancho que la escalera entera |
 * | Tundra de Alaska y Yukón | no publicada | — | 350–960 | fuera de todo escalón |
 * | Delta del Paraná, albardón | 1.056 mm | 7.000 | 6.700–8.250 forrajera, 11.200–11.400 total | acierta o se queda 1,6× corta, según cuál se compare |
 *
 * En el norte de las Grandes Llanuras, con 381–508 mm, se miden casi 3.000
 * kg/ha/año; en el altiplano peruano, con MÁS lluvia, se miden 626. La
 * diferencia la explican el frío, el largo de la estación de crecimiento y la
 * profundidad del suelo, que la escalera no mira.
 *
 * ## El trabajo de Lesbos midió el experimento que la escalera necesitaba
 *
 * Sin proponérselo: midió **los mismos potreros en dos años que difieren 2,25
 * veces en lluvia**, 797,3 mm contra 353,6 mm. Si la producción saliera de la
 * lluvia anual, el año húmedo tendría que haber rendido mucho más. Pasó lo
 * contrario en el tramo que importa: la producción diaria de la última época fue
 * de 12,1 kg/ha/día en el año húmedo y de **21,6 en el seco**. La razón la da el
 * propio trabajo: el 45 % de la lluvia del año húmedo cayó entre fines de
 * diciembre y fines de febrero, fuera de la ventana de crecimiento.
 *
 * Y en el mismo clima, el mismo año y la misma isla, los potreros «mejorados»
 * —terrazas mantenidas, piedras sacadas, chacra en el pasado— produjeron 15,9
 * kg MS/ha/día contra 5,5 de los sin tocar: un factor de **2,9 que no es clima
 * sino historia de uso**. La escalera no puede ver ninguna de las dos cosas.
 *
 * ## La trampa del pastizal perenne, y cómo empeora con el frío
 *
 * En un pastizal perenne, lo que está parado no es lo que creció este año, y la
 * distancia entre las dos cosas crece con el frío:
 *
 * - **Altiplano de Puno:** la biomasa en pie es de 1,5 a 3 veces la anual (del
 *   38,5 % al 66,3 % no creció este año).
 * - **Tundra de Alaska:** la fitomasa total es de 74 a 76 toneladas por
 *   hectárea y la producción aérea anual de 0,35 a 0,96. Entre **77 y 211
 *   veces**. Sólo la fracción aérea ya es unas 7 veces la anual.
 *
 * Cualquier cifra tomada de una foto de campo —o de un índice satelital de
 * biomasa— está midiendo el stock y no el flujo. En tundra el error es de dos
 * órdenes de magnitud.
 *
 * Y el Delta del Paraná la midió de una tercera forma, la más incómoda, porque
 * ahí el stock no sólo no es el flujo: **lo contradice**. En el mismo potrero y
 * el mismo verano, la parcela clausurada sin cortar llegó a 10.533 kg/ha de
 * materia seca viva parada contra 2.237 de la parcela cortada cada dos meses,
 * una diferencia de 8.296 kg a favor de la que nadie tocó. Pero lo cosechado en
 * forraje fue 6.733 kg en una sola cosecha de la clausurada contra **7.417
 * acumulados** en la cortada, y hacia el final del ciclo 6.700 contra 8.250. El
 * pastizal con la pila más grande entregó menos.
 *
 * El trabajo explica por qué y el mecanismo importa: al dejar crecer el canopeo
 * sin interrupción, las propias forrajeras se dan sombra, la tasa de crecimiento
 * neto se vuelve **negativa** en otoño —muere más material del que se genera— y
 * la biomasa que se ve parada es en buena parte material viejo en camino a
 * muerto. Con cortes bimestrales la tasa se mantuvo arriba de 40 kg/ha/día casi
 * cuatro meses, el doble de tiempo. La tesis aclara que la diferencia de 23 % no
 * dio significativa con tres clausuras de 4 × 4 m y un año de datos, así que es
 * una comparación empírica; pero el signo es el de siempre, y es el contrario
 * del que sugiere mirar el pasto.
 *
 * ## El bioma verificado puede estar verificado y estar mal
 *
 * El lote 04 fue el primero que vino con el campo `bioma_verificado` que pedía
 * el encargo, justamente porque las dos entradas rechazadas antes tenían el
 * bioma equivocado. Vino completo, con coordenada, `ECO_ID` y `BIOME_NUM`. Y
 * una de las cuatro seguía estando mal, por un motivo nuevo: **la coordenada
 * verificada no era la del sitio medido**, sino un punto de referencia regional
 * elegido para representarlo, y la entrega lo declaraba sin alarma.
 *
 * La tesis del Delta publica su sitio exacto —33° 49′ S, 59° 27′ O— y el punto
 * consultado estaba unos 65 km al este. Sobre el punto regional, RESOLVE
 * devuelve `ECO_ID` 585, Paraná flooded savanna, `BIOME_NUM` 9. Sobre el punto
 * de la tesis, y sobre otros cinco a su alrededor, devuelve `ECO_ID` 576,
 * **Pampa Húmeda, `BIOME_NUM` 8**. Lo mismo, más chico, en Kruger: el ancla da
 * mopane (`ECO_ID` 65) y el sitio publicado da Limpopo lowveld (48), aunque ahí
 * los dos caen en el bioma 7 y la entrada no cambiaba de lugar.
 *
 * De ahí sale la regla que vale para cualquier medición que entre acá: **el
 * bioma se consulta sobre la coordenada que la fuente publica, no sobre una que
 * la represente.** El polígono es lo que decide, y a esa escala un ancla
 * regional puede estar en otro bioma sin dejar de parecer el mismo paisaje.
 *
 * La consecuencia práctica es la que manda en el archivo: la isla de Baradero
 * es físicamente un pastizal de albardón que se inunda, y aun así la medición
 * queda archivada en el pastizal templado. Porque cuando alguien marque ese
 * predio en acequia, la app va a resolver `resolve_pastizal_templado`, y una
 * medición guardada en el bioma que el paisaje parece —en vez de en el que el
 * mapa dice— no se usa nunca, o se usa en el lugar equivocado.
 *
 * ## La sabana no está sin medir: está medida y no se ponen de acuerdo
 *
 * Esto salió del lote 05 y cambia el plan, así que va antes de lo demás.
 *
 * La hipótesis con la que se venía trabajando era que el bioma 7 estaba vacío
 * por falta de mediciones. Es falso. Hay dos sitios de savana entre los mejor
 * documentados del planeta —Nylsvley en Sudáfrica y el Parque Nacional de
 * Nairobi— con series de monitoreo mensual de años, publicadas y abiertas en la
 * base de productividad primaria del ORNL. El problema es otro: **para el mismo
 * sitio hay varias cifras publicadas de producción aérea y no se parecen.**
 *
 * La propia ficha del ORNL de Nairobi lo tabula, para la savana sin tratar:
 *
 * | fuente | unidades | ANPP |
 * |---|---|---|
 * | Kinyamario e Imbamba (1992) | g/m²/año | 1.004 |
 * | Scurlock y Olson (2013) | g/m²/año | 811 |
 * | GPPDI clase A, sitio 31 | gC/m²/año ← carbono | 104 |
 * | GPPDI clase B, sitio 62 (MI 108 / 109 / 110) | gC/m²/año | 60 / 100 / 370 |
 * | EMDI clase B, sitio 62 | gC/m²/año | 235 |
 *
 * Y lo explica en una línea: *«NPP values for this site reported in other
 * published accounts differ due to different measurement and calculation
 * methods»*. Pasando el carbono a materia seca —que es aproximadamente el doble,
 * y es la otra trampa de esa tabla— el rango publicado para **un solo pastizal**
 * va de unos 1.300 a 10.040 kg MS/ha/año. **Un factor 7,6 para el mismo pasto.**
 *
 * En Nylsvley es igual de incómodo y más explícito. La cifra que acequia querría
 * —*«the grazeable above-ground plant material of the grass layer (grasses +
 * forbs) in open areas between trees»*— es de 76 g/m²/año, o sea 760 kg/ha, y de
 * eso el pasto aporta 60. Pero la misma ficha agrega que *«the Grunow et al.
 * (1980) smooth function calculation of ANPP **may have substantially
 * underestimated** productivity at Nylsvley»*, da una «mejor estimación» de 482
 * g/m²/año para el total herbáceo con raíces, y cierra con *«the three estimates
 * do not agree because different calculation methods were used»*.
 *
 * Por eso **no se montó ninguna de las dos**. Poner 760 kg/ha como la
 * producción medida de la savana —el bioma donde cae la mayoría de los predios
 * ganaderos— con el proveedor del dato avisando que puede estar sustancialmente
 * subestimada, es exactamente el número plausible y equivocado que este archivo
 * existe para evitar. Y poner 10.040 es lo mismo del otro lado.
 *
 * La consecuencia para el plan es grande: **reemplazar la escalera por un número
 * medido por bioma no va a funcionar en la savana**, porque la dispersión de la
 * literatura en un solo sitio es mayor que el error que se le reprocha a la
 * escalera. Para este bioma las salidas honestas son dos, y ninguna es una
 * tabla: o un modelo con algoritmo nombrado, o decir que no hay dato y no
 * imprimir un número de forraje.
 *
 * ## El modelo que la literatura sí propone, y que no es la lluvia sola
 *
 * La compilación de Scurlock y Olson (2002, *Environmental Reviews* 10) es la
 * referencia de esa base y midió, de paso, exactamente lo que acequia necesita
 * saber sobre su propia escalera. Sobre los 53 sitios con control de calidad y
 * menos de 3.000 mm de lluvia encontró *«a good straight-line fit between ANPP
 * and annual precipitation»* con **r² = 0,56** en 50 de 53. Y sobre las
 * compilaciones grandes y menos curadas —720 registros de Osnabrück, 117 de IBP
 * Woodlands— *«the correlation between ANPP and precipitation was poor in each
 * case»*.
 *
 * Leído de frente: en el mejor de los casos, con los datos más limpios del
 * mundo, la lluvia anual explica algo más de la mitad de la variación y deja el
 * resto. La escalera no está rota por estar mal calibrada; está incompleta por
 * construcción.
 *
 * Lo que sigue de ahí es el camino concreto. El modelo clásico con el que esa
 * compilación se compara es el **«Miami Model» de Lieth (1975)**, y su forma es
 * el dato importante: **NPP es el MÍNIMO de una función de la lluvia y una
 * función de la temperatura**, con el supuesto de que uno de los dos factores
 * siempre limita. Contra ese modelo el ajuste mejora (r² = 0,30 contra 0,24 de
 * la lluvia sola, en los 30 sitios con NPP total), y en los sitios boscosos el
 * modelo predice que **la temperatura es la limitante en 41 de 48**.
 *
 * Que es, palabra por palabra, el diagnóstico que este archivo ya había escrito
 * mirando Dakota contra Puno: con menos lluvia y más calor, Dakota produce más.
 * La diferencia es que ahora hay una fuente publicada que lo dice y una forma
 * funcional para escribirlo — y acequia ya tiene la temperatura del predio, de
 * POWER y de Daymet. **Ese es el reemplazo de `prodForrajera`, y no una tabla
 * por bioma.**
 *
 * ## Los algoritmos no discuten cuánto se produce: discuten DÓNDE
 *
 * Esto salió del lote 06 y es la explicación del desorden que el lote 05 había
 * descrito sin poder explicar. En el pastizal salino de Montecillo, México, la
 * ficha del ORNL tabula las tres fuentes publicadas para la MISMA serie de
 * cosechas mensuales:
 *
 * | fuente | NPP aérea | NPP subterránea | NPP total |
 * |---|---|---|---|
 * | García-Moya y Montañez Castro (1992) | 669 | 1.007 | 1.676 |
 * | Scurlock et al. (2002) | 609 | 1.174 | 1.783 |
 * | Scurlock y Olson (2013) | 1.063 | 678 | 1.741 |
 *
 * Mirá las dos últimas columnas y después la primera. **El total coincide dentro
 * de un 6 %. La parte aérea se mueve un 75 %, y la subterránea un 73 % en
 * sentido contrario.** Los tres algoritmos miden lo mismo y están de acuerdo en
 * cuánta materia seca produce ese pastizal; lo que no deciden igual es **cuánta
 * quedó arriba y cuánta abajo**.
 *
 * Y lo que acequia necesita para dimensionar un rodeo es exactamente la columna
 * que no se sostiene. Por eso en la sabana la dispersión llegaba a 7,6× y por eso
 * no hay cómo arreglarlo eligiendo mejor la fuente: no es que una esté mal, es
 * que el reparto arriba/abajo es la parte frágil de todos los métodos.
 *
 * ## El experimento que faltaba: seis algoritmos, las mismas cosechas
 *
 * Todo lo anterior era inferencia sobre tablas de terceros. El lote 08 trajo el
 * trabajo que lo mide de frente: Rawlik y Jagodziński cosecharon el sotobosque
 * de un robledal-carpinal de Polonia, semanalmente en abril y mayo y cada quince
 * días el resto, durante dos temporadas, y después calcularon la producción anual
 * **con seis algoritmos sobre esas mismas cosechas**:
 *
 * | método | 2010 | 2011 |
 * |---|---|---|
 * | 1 · máximo de biomasa en pie del año | 37,8 | 41,0 |
 * | 2 · suma de las diferencias positivas entre cosechas | 50,2 | 58,3 |
 * | 3 · suma de los máximos de cada especie | 59,8 | 72,6 |
 * | 4 · biomasa × densidad de brotes, al máximo de biomasa | 52,7 | 72,7 |
 * | 5 · biomasa × densidad, al máximo de densidad | 52,1 | 68,6 |
 * | 6 · biomasa × densidad, al máximo del producto | 74,3 | 94,0 |
 *
 * En g MS/m²/año. **El algoritmo mueve el resultado casi el doble (1,96×) y el
 * año lo mueve 1,38× como máximo.** Dicho de otro modo: cambiar de método
 * importa más que cambiar de año, y el método 1 —el máximo de biomasa en pie,
 * que es el más usado porque es el más barato— subestima alrededor de la mitad.
 *
 * Es el mismo método con el que el lote 04 había traído Serengeti y Kruger, y la
 * razón por la que esas dos no entraron.
 *
 * ## Towoomba contra Nylsvley: no era ecología, era fertilizante
 *
 * El lote 05 había dejado una pregunta marcada como «el reintento más valioso»:
 * Towoomba y Nylsvley están a 60 km, en la MISMA ecorregión (ECO_ID 38, bioma
 * 7), con 6 mm de diferencia de lluvia anual, y la compilación le da a Towoomba
 * 2,6 veces la producción. Si eso fuera real, el bioma no explicaría nada.
 *
 * No es real. La ficha primaria del ORNL dice que el sitio de Towoomba era un
 * **ensayo de fertilización** de varias hectáreas, con cinco niveles de nitrógeno
 * y tres de fósforo en bloques aleatorizados, **sobre un área de la que se
 * removieron todos los árboles**, y con una medición de biomasa por año. El valor
 * de 198 g/m²/año sale de la fila `P0N3`: un tratamiento fertilizado.
 *
 * Los dos sitios nunca fueron comparables, y la advertencia estaba escrita en la
 * compilación: *«18 sites have data for more than one "treatment" (fertilized or
 * irrigated plots, different soil types, stand ages, etc.)»* y la tabla publica
 * un valor por sitio sin decir de cuál. **Una cifra con coordenada verificada,
 * bioma verificado y fuente abierta puede seguir siendo un ensayo agronómico.**
 *
 * ## Lo que hace el dosel, medido contra su propio rodal
 *
 * Los lotes 07 y 08 abrieron los biomas de bosque, y ahí la pregunta no es
 * cuánto produce el ecosistema sino cuánto de eso puede comer un animal. El
 * transecto OTTER de Oregón lo publica junto, en la misma tabla:
 *
 * | sitio | cobertura herbácea | NPP del rodal | capa herbácea | la herbácea es |
 * |---|---|---|---|---|
 * | Cascade Head 1A, aliso rojo | 35,2 % | 1.630 | 41 | 2,5 % |
 * | Waring's Woods, Pseudotsuga | 4,9 % | 1.540 | 6 | **0,4 %** |
 *
 * En g MS/m²/año. Los dos rodales producen casi lo mismo y su sotobosque difiere
 * 6,8 veces; la cobertura herbácea difiere 7,2. **Lo que decide el forraje de un
 * bosque es la luz que llega al piso, y la NPP del rodal no la ve.**
 *
 * Dos consecuencias que valen más que las cifras:
 *
 * 1. **Waring's Woods cae en el bioma 8**, el de la pradera de Dakota: la
 *    coordenada que la ficha publica (44,60 N / −123,27 O) da la sabana de robles
 *    del valle Willamette. Dentro de un mismo bioma hay entonces 2.643-3.063
 *    kg MS/ha/año a cielo abierto y **60** bajo un dosel cerrado. Un factor 44
 *    que ninguna función del clima puede dar, porque no es clima.
 * 2. **El 800 de `cobertura.ts` resultó ser el número mejor respaldado de la
 *    cadena, y por accidente.** Esa ruta pondera kg/ha por clase de cobertura y
 *    le asigna 800 kg MS/ha/año al arbolado. Lo medido: 60 en conífera densa, 410
 *    en aliso, 378-940 en robledal-carpinal, 1.300-1.700 en bosque húmedo
 *    tropical de Nepal. El 800 cae adentro para bosque de hoja ancha y queda
 *    unas 13 veces alto para un dosel de conífera cerrado. **Desde el 17/10/2026
 *    ya no existe:** la clase arbolado de `cobertura.ts` toma la banda de los
 *    sitios de sotobosque montados acá, y las otras tres clases también. El
 *    1.300-1.700 de Nepal sigue sin montar, y el 17/10 a la noche se supo por qué
 *    con un número: la única ubicación que su grupo publica es un rectángulo de
 *    26°41'-26°50' N por 87°09'-87°21' E, y **ese rectángulo de 17 × 20 km cruza
 *    tres biomas** —7 en las dos esquinas del sur y en el centro, 1 en la esquina
 *    noroeste y 3 en la noreste—. Un área publicada no es una coordenada hasta
 *    que da un solo bioma. Así que la banda del arbolado llega hasta 940 y no
 *    hasta 1.700: el techo está sesgado bajo, y queda dicho.
 *
 * ## La inversión del stock, cuarta confirmación y la más extrema
 *
 * Viene del lote 08 y no montó porque es una revisión regional sin sitio ni
 * coordenada: en los pastizales de líquenes más productivos de Escandinavia y
 * Finlandia el **crecimiento anual** es de 60 a 160 kg/ha mientras la **biomasa
 * en pie** es de 500 a 1.500, y los rodales viejos de *Cladonia stellaris* pasan
 * los 3.000 kg/ha con crecimiento anual bajo. Hasta 50 veces más stock que flujo,
 * y una recuperación de 3 a 5 años después de un pastoreo intenso.
 *
 * Es el mismo error que Puno, el Delta y el Pantanal, en un cuarto bioma: contar
 * lo que está parado como si fuera lo que creció. Acá llevaría a cargar cincuenta
 * veces de más.
 *
 * ## El cultivo está medido y no se puede usar como el cultivo de un predio
 *
 * El lote 12 fue a buscar la clase 40 de WorldCover, la única de las cuatro
 * pastoreables que no tenía ninguna medición, y trajo dos, las dos de INTA, las
 * dos con coordenada publicada y las dos verificadas en bioma 8:
 *
 * | sitio | insumos | kg MS/ha/año | cortes |
 * |---|---|---|---|
 * | Avena, 14 cultivares, Marcos Juárez, 2024 | 115 kg N/ha | 5.460 - **6.539** - 7.862 | 4 |
 * | Alfalfa, 10 cultivares, Curacó, 2013-14 | **1.300 mm de riego** | 18.674 - **19.880** - 21.035 | 5 |
 *
 * **Y ninguna de las dos puede alimentar la banda de la clase 40.** El motivo no
 * es la calidad del dato, que es mejor que la de varias que sí están montadas:
 * es que un píxel de ESA WorldCover dice que hay un cultivo y **no dice si está
 * fertilizado ni si está regado**, y entre esas dos mediciones hay un factor
 * 3,04 que lo explica casi todo.
 *
 * El riego de Curacó son **1.300 mm en una temporada**, más que la lluvia anual
 * de cualquiera de los doce sitios de secano de este archivo: el techo de todos
 * es el 1.119 mm del altiplano de Puno. Y los 19.880 kg MS/ha son
 * **1,87 veces la medición de secano más alta que acequia tiene** (los 10.630 de
 * la NPP aérea de Montecillo). Meter eso en la banda del cultivo haría que
 * cualquier predio con un lote sembrado recibiera la oferta de forraje de una
 * alfalfa bajo riego en el Monte.
 *
 * Por eso cada medición ahora declara sus `insumos` y **la banda usa sólo las de
 * `secano`**. La clase 40 sigue sin banda, y el motivo pasó de «no hay datos» a
 * «los datos que hay miden otra cosa», que es una respuesta distinta y mejor.
 *
 * Dos cosas de la avena que valen por sí solas. Es un verdeo **fertilizado en un
 * año malo**: la fuente publica 11 mm en mayo, cero en junio, julio y septiembre,
 * y una helada de −9,4 °C el 9 de agosto que «se registraron daños en la biomasa
 * aérea en la mayoría de los genotipos». Insumos para arriba y clima para abajo,
 * en la misma cifra, sin forma de separarlos. Y el reparto entre cortes importa
 * más que el total para cualquiera que planifique un invierno: el primer corte y
 * el cuarto aportan el 60 % del año, y los dos del medio —los del invierno
 * pleno— el 40 %.
 *
 * Lo que el lote NO encontró, y es la parte que faltaba: **rastrojo**. Dos
 * búsquedas vacías con el motivo escrito. Es el dato que de verdad haría falta,
 * porque un rastrojo de maíz es lo que un predio mixto realmente pastorea en
 * otoño, y porque es la única familia de las tres donde el número no depende de
 * lo que el productor le puso al cultivo sino de lo que la cosecha dejó.
 *
 * ## El lote 09 cerró la primera fracción, y la cerró en contra
 *
 * El plan del 17/10 era bajar de la NPP total al forraje por tres fracciones:
 * aérea, herbácea del piso y comible. El lote 09 fue a buscar la primera y
 * volvió con tres rechazos bien argumentados —Mokany 2006, Jackson 1996 y
 * Poorter 2012 miden razón raíz:tallo o reparto de BIOMASA EN PIE, que no se
 * convierte en reparto de producción— y con una sola cosa: el cociente
 * ANPP/TNPP de Montecillo, sobre las cuatro filas que la ficha del ORNL tabula
 * para la MISMA serie de cosechas.
 *
 * | fuente | ANPP | BNPP | TNPP | aérea/total |
 * |---|---|---|---|---|
 * | García-Moya y Montañez Castro (1992) | 669 | 1.007 | 1.676 | 0,399 |
 * | Scurlock y Olson (2013) | 1.063 | 678 | 1.741 | **0,611** |
 * | Scurlock et al. (2002), método #5 | 609 | 1.174 | 1.783 | **0,342** |
 * | GPPDI #67, Olson et al. (2013a) | 130 | 97 | 227 | 0,573 |
 *
 * Las tres primeras en g MS/m²/año y la cuarta en g C/m²/año, que es la fila que
 * no se puede convertir y cuyo cociente igual sirve: es carbono sobre carbono.
 * Las cuatro cierran por dentro —669 + 1.007 = 1.676, y así las cuatro—, así que
 * no hay error de transcripción en ninguna.
 *
 * **Y no se ponen de acuerdo ni en cuál mitad es la grande.** Dos dicen que
 * abajo hay más (669 contra 1.007; 609 contra 1.174) y dos dicen que arriba
 * (1.063 contra 678; 130 contra 97). La fracción aérea va de 0,342 a 0,611, un
 * factor 1,79, y cruza el 0,5 por el medio.
 *
 * Puesto contra lo que la misma ficha publica año por año, el reparto de culpas
 * queda claro: la NPP TOTAL varía **1,40×** entre años con el mismo método
 * (1.994 en 1985, 1.422 en 1986 con el incendio, 1.611 en 1987) y sólo **1,06×**
 * entre los tres algoritmos en materia seca. El total es robusto; lo que el
 * algoritmo discute es el reparto. Es el mismo veredicto que Rawlik sacó de un
 * bosque polaco, con datos que no se tocan y en otro continente.
 *
 * **Consecuencia: la cadena de tres fracciones no se puede armar con fracciones
 * publicadas.** La primera ya trae un factor 1,79 y no hay ninguna síntesis
 * global que la dé: las tres que existen miden biomasa en pie.
 *
 * ## La segunda fracción ya estaba en este archivo, sin que nadie la mirara
 *
 * La que mueve el número no es la primera: es la segunda. Y está medida en tres
 * sitios que ya estaban acá, los tres publicando numerador y denominador en la
 * misma unidad y en la misma tabla:
 *
 * | sitio | capa herbácea | aéreo total | herbácea/total | dosel |
 * |---|---|---|---|---|
 * | Waring's Woods, Pseudotsuga | 6 | 1.540 g MS/m²/año | **0,0039** | cerrado |
 * | Cascade Head 1A, aliso rojo | 41 | 1.630 g MS/m²/año | 0,0252 | 35,2 % herbáceo |
 * | Very Shallow 23-31 PZ, Edwards | 1.840 | 2.000 lb/acre/año | **0,92** | leñosas dispersas |
 *
 * De 0,0039 a 0,92 hay un factor **236**, y lo que lo mueve no es el clima ni el
 * bioma: es cuánta luz llega al piso. Las dos puntas de Oregón están a 200 km
 * una de otra, producen casi lo mismo de rodal y tienen el mismo clima.
 *
 * Eso convierte el problema en otro, y en uno que acequia sí puede medir: el
 * dosel sale de `cobertura.ts`, que lee ESA WorldCover a 10 m en cada predio.
 * Por eso ahora cada medición declara su `clase_wc` y la banda de forraje por
 * clase de cobertura se deriva de acá, en vez de los cuatro pesos inventados que
 * esa ruta tenía.
 *
 * ## Qué NO hace este archivo todavía
 *
 * **Estas mediciones siguen sin entrar en la cuenta, y el motivo cambió.** Antes
 * era que faltaban puntos; ahora es que los puntos que hay dicen que una tabla
 * por bioma no puede funcionar: en el bioma 8 conviven 3.063 y 60 kg/ha según el
 * dosel, en el bioma 7 un solo pastizal tiene siete cifras publicadas con un
 * factor 7,6, y el reparto arriba/abajo —que es justo el que acequia necesita—
 * es la parte frágil de todos los algoritmos. `prodForrajera(precip_mm)` sigue
 * recibiendo sólo la lluvia, y la sabana tropical, donde cae la mayoría de los
 * predios ganaderos, **sigue sin ninguna medición acá**.
 *
 * Lo que sí se enchufó, el 17/10/2026, es otra cosa y más chica: el Miami Model
 * de Lieth (`miamiModel.ts`) como **contraste**. No reemplaza la escalera —da NPP
 * total del ecosistema, que en un bosque es hasta 250 veces el pasto comible—,
 * pero nombra la limitante y puede desmentir un número imposible, que es el punto
 * ciego exacto de una función de la lluvia sola. La escalera dice 7.000 kg/ha con
 * 900 mm tanto a 20 °C como a −10 °C; a −10 °C el modelo dice que todo el
 * ecosistema produce 2.265. Es un test de una sola dirección y está escrito como
 * tal: puede decir que una cifra está mal, nunca que esté bien.
 *
 * La sabana (bioma 7) y el pastizal inundable (bioma 9) siguen en cero después
 * de DOS lotes dedicados a los dos —el 04 y el 05—, por dos motivos distintos:
 * el del 05 está arriba, y en el 04 el motivo fue que las tres entradas que no
 * entraron **miden lo que está parado, no lo que creció**. Serengeti
 * publica 0,14 ± 0,10 kg/m² de biomasa herbácea en pie promediada sobre dos
 * años de lecturas mensuales con disco de pastura; Kruger publica el mayor
 * cuadrante cosechado de 50 × 50 cm, 12.006 kg/ha, que es una muestra suelta y
 * no una cifra de sitio en un trabajo cuyo tema es comparar LiDAR contra campo;
 * y el Pantanal de la Nhecolândia publica disponibilidad por fecha, 523 kg/ha en
 * febrero de 2010 y 1.698 en noviembre de 2008. Ninguna de las tres se puede
 * convertir a producción anual sin una serie de tasas de crecimiento que ninguno
 * de los tres trabajos midió.
 *
 * Lo del Pantanal igual conviene tenerlo escrito, porque es la única medición
 * que existe hoy del bioma 9 y porque su propio documento la compara con otras
 * dos del mismo Pantanal, y con la misma especie dominante: unos 3.000 kg/ha en
 * campos húmedos de la Nhecolândia y 5.971 en un ambiente de baixada de Barão
 * de Melgaço. Entre 523 y 5.971 hay un **factor 11 dentro de un solo bioma**, y
 * en dos de los tres casos dentro de una sola subregión. Es la razón de fondo
 * por la que un número por bioma no va a alcanzar en el pastizal inundable: lo
 * que manda es la fase hidrológica, y ahí el régimen regional —30 a 40 cm de
 * agua, 3 a 4 meses, 30 % de la superficie— ni siquiera describe el predio: en
 * plena creciente, el 73 % de la hacienda medida estaba seca.
 *
 * El lote 05 le puso número a eso, con un trabajo del Pantanal norte que midió
 * productividad neta mes por mes durante un año (Pozer y Nogueira, 2004). Dos
 * cosas que ninguna cifra anual puede llevar. Una: **cerca del 70 % de la
 * producción anual ocurre durante la inundación**, no durante las lluvias,
 * porque son las macrófitas acuáticas grandes las que encuentran entonces sus
 * mejores condiciones. En este bioma el calendario del forraje lo marca el pulso
 * del agua y no el del cielo, así que una función de la lluvia anual no se
 * equivoca en el nivel: se equivoca en el mes. Dos: ese trabajo tampoco se montó
 * porque publica tasas diarias —3,8 y 5,1 g MS/m²/día en los picos— y no un
 * total anual, y porque sus autores declaran que **el año medido fue atípico** y
 * que justamente las macrófitas que aportan ese 70 % no crecieron.
 *
 * Y de paso confirma la inversión del stock por tercera vez y en un bioma nuevo:
 * *«the greatest total biomass values were for the protected pasture due to
 * accumulated dead biomass»*. El potrero sin ganado tiene más pasto parado
 * porque acumula material muerto; el mismo trabajo señala que por eso el ganado
 * cumple una función de manejo, evitando el exceso de biomasa muerta que sube el
 * riesgo de incendio.
 *
 * Mientras tanto esto sirve para lo que sí se puede hacer hoy: contrastar, y
 * tener escrito con qué.
 *
 * ## De dónde salen los ids de bioma
 *
 * Son los del bioma global de RESOLVE (`BIOME_NUM` → `resolve_*`), tal como los
 * define `ecorregiones.ts`. Están verificados contra el FeatureServer: la
 * Caatinga, por ejemplo, es `BIOME_NUM` 2 y no 7, así que una medición de la
 * Caatinga describe el bosque tropical seco y NO la sabana.
 */

/**
 * 1 lb/acre = 1,120851 kg/ha.
 *
 * Exacto por definición, no redondeado: 0,45359237 kg ÷ 0,40468564224 ha. Las
 * fuentes del NRCS publican todo en lb/acre y es la conversión que más veces se
 * hace mal en esta cadena.
 */
export const LB_ACRE_A_KG_HA = 0.45359237 / 0.40468564224;

/** lb/acre → kg/ha, redondeado al kilo. */
export function lbAcreAKgHa(lb_acre: number): number {
  return Math.round(lb_acre * LB_ACRE_A_KG_HA);
}

/**
 * 1 g/m² = 10 kg/ha. Exacto: 10.000 m² por hectárea ÷ 1.000 g por kilo.
 *
 * La bibliografía de ecología publica en g/m² y la de producción ganadera en
 * kg/ha, así que este factor aparece cada vez que se cruzan las dos.
 */
export function gM2AKgHa(g_m2: number): number {
  return Math.round(g_m2 * 10);
}

/**
 * Qué clase de cifra es, que es lo que decide si se puede usar y cómo.
 *
 * `ms_herbacea_total` y `ms_forrajera` **no son la misma cifra y la diferencia
 * no es un detalle**: la primera cuenta todo lo herbáceo y la segunda sólo las
 * especies que el animal come. En el Delta del Paraná, el único sitio donde las
 * dos están medidas en la misma cosecha, la total es de 1,36 a 1,70 veces la
 * forrajera —11.200 a 11.400 kg/ha contra 6.700 a 8.250—, porque el abrojo
 * grande y las demás no forrajeras se llevan una parte grande del pastizal
 * degradado. Pasar una total a un cálculo de carga animal como si fuera forraje
 * sobreestima hasta un 70 %.
 *
 * Y es exactamente el error que la escalera de `prodForrajera` deja pasar sin
 * que se note, porque **nunca dijo cuál de las dos es**. Con la lluvia de ese
 * sitio la escalera da 7.000: cae adentro del rango forrajero y se queda 1,6
 * veces corta contra el total. El mismo sitio, el mismo año, la misma cosecha,
 * y el veredicto se da vuelta según qué se esté comparando.
 *
 * Entre la primera y la última hay un factor de varias veces, no un porcentaje.
 * `oferta_aprovechable` ya trae descontada la fracción que el animal no come;
 * `ms_herbacea_total` y `npp_herbacea` no descuentan nada. **El uso admisible lo
 * aplica después `bandaUso` en `modulacion.ts`**, así que meter una
 * `oferta_aprovechable` donde el cálculo espera un total descuenta dos veces.
 */
export type TipoDeCifra =
  | 'oferta_aprovechable'
  | 'receptividad'
  | 'ms_herbacea_total'
  | 'ms_forrajera'
  | 'npp_herbacea'
  | 'ms_sotobosque'
  | 'ms_cultivo_sembrado';

/**
 * Las clases de cifra que NO traen descontado el uso admisible.
 *
 * Son las únicas que pueden entrar acá mientras río abajo `bandaUso` descuente
 * por su cuenta. La diferencia entre `ms_herbacea_total` y `npp_herbacea` es de
 * método —cosecha contra producción primaria estimada— y no de si descuenta.
 *
 * `ms_sotobosque` se agregó con el lote 08 y no es un matiz: es la capa herbácea
 * de abajo de un dosel cerrado, que **no es comparable con el pastizal abierto
 * del mismo bioma**. En el bioma 8 convive la pradera de Dakota, con 2.643 a
 * 3.063 kg MS/ha/año, y el sotobosque de un rodal de Pseudotsuga del valle
 * Willamette, con 60: un factor 44 que no lo hace el clima sino la sombra.
 */
export const TIPOS_SIN_DESCONTAR: readonly TipoDeCifra[] = [
  'ms_herbacea_total',
  'ms_forrajera',
  'npp_herbacea',
  'ms_sotobosque',
  'ms_cultivo_sembrado',
] as const;

/**
 * De dónde sale la producción, además del clima.
 *
 * Se agregó con el lote 12 y no es un adorno: es lo que separa una medición que
 * dice qué puede dar un lugar de una que dice qué puede dar un lugar **más los
 * insumos que alguien le puso**. `bandaDeClase` en `cobertura.ts` usa sólo las de
 * `secano`, porque un píxel de ESA WorldCover dice que hay un cultivo y no dice
 * si está fertilizado ni si está regado.
 *
 * La alfalfa de Curacó recibió **1.300 mm de riego en una temporada**, que es más
 * agua que la lluvia anual de cualquiera de los doce sitios de secano que había
 * antes: el techo de todos es el 1.119 mm del altiplano de Puno, y el sitio más
 * húmedo de tierras bajas, el Delta del Paraná, recibe 1.056.
 */
export type Insumos = 'secano' | 'fertilizado' | 'riego' | 'riego_y_fertilizado';

export interface MedicionForraje {
  /** Bioma global de RESOLVE al que pertenece el sitio medido. */
  bioma: string;
  /** Rótulo corto del sitio, para poder nombrarlo en pantalla. */
  sitio: string;
  /**
   * Clase de ESA WorldCover que un satélite vería en este sitio, o `null` si es
   * ambigua.
   *
   * **No es el bioma y no se deduce de él: es lo que hay ENCIMA.** Waring's
   * Woods está en el bioma 8, el de la pradera templada, y es un rodal cerrado
   * de Pseudotsuga: bioma 8 y clase 10 a la vez. Esa discordancia no es un
   * problema del dato, es el dato.
   *
   * Lo usa `cobertura.ts` para armar la banda de kg MS/ha/año de cada clase. Sin
   * este campo tenía que inventarlos, y los inventaba.
   */
  clase_wc: number | null;
  /**
   * Si la cifra se logró con insumos, y cuáles.
   *
   * **Sólo las de `secano` entran en la banda de forraje por clase de cobertura.**
   * Las otras son mediciones buenas que contestan otra pregunta.
   */
  insumos: Insumos;
  tipo: TipoDeCifra;
  kg_ms_ha_anio_min: number;
  kg_ms_ha_anio_max: number;
  /** Sólo si la fuente publica un valor central. Nunca el punto medio calculado. */
  kg_ms_ha_anio_tipico: number | null;
  /**
   * Lluvia anual del sitio, que es el rango donde la cifra vale.
   *
   * **`null` cuando la fuente no la publica**, y se queda en `null`: no se
   * rellena con la climatología de otro servicio, porque entonces la cifra
   * quedaría atada a un número que su propio trabajo nunca midió. Pasa en
   * tundra, donde además el agua no es lo que limita.
   */
  lluvia_mm_min: number | null;
  lluvia_mm_max: number | null;
  /**
   * Temperatura media anual del sitio, °C, **sólo si la fuente la publica como
   * media anual.**
   *
   * Se agregó con el lote 06 porque sin ella no se puede correr `miamiModel.ts`
   * sobre un sitio medido, que es la única forma de medirle el sesgo al modelo.
   * Y queda en `null` más veces de las que uno querría, por un motivo que vale
   * escribir: varias fichas del ORNL publican «mean monthly minimum 10,7 °C
   * (enero)» y «mean monthly maximum 29,5 °C (marzo)», que son el mes más frío y
   * el más cálido y **no promedian a la media anual**. Promediarlos es el mismo
   * error que acequia ya cometió con las máximas de POWER.
   */
  temp_media_c_anual: number | null;
  /** Cómo se midió. */
  metodo: string;
  /** Qué incluye y qué no. */
  que_cuenta: string;
  /** Cuándo crece, que es lo que la cifra anual esconde. */
  estacionalidad: string;
  /** Dónde deja de valer. */
  donde_deja_de_valer: string;
  /** Año o años en que se midió, no el de publicación. */
  medido_en: string;
  fuente: { label: string; url: string };
}

/**
 * Las mediciones, verificadas una por una abriendo la fuente.
 *
 * Son **catorce sitios en siete de los quince biomas** de RESOLVE, al 17/10/2026.
 * No son un modelo: son los puntos que hay. Cuatro de los catorce son sotobosque
 * de bosque cerrado y no pastizal, y eso cambia cómo se leen: ver
 * `ms_sotobosque`. Cada uno declara además su `clase_wc` y sus `insumos`, que es
 * de donde `cobertura.ts` saca la banda de cada clase de cobertura: siete en la
 * 30, uno en la 20, cuatro en la 10 y dos en la 40 que **no entran en ninguna
 * banda** porque una está fertilizada y la otra regada.
 *
 * Los dos últimos son el mismo lugar contado dos veces, y es deliberado: en
 * Manitou las parcelas bajo dosel y las aberturas del mismo bosque, el mismo día
 * y con el mismo método, difieren 13 veces. El clima no explica nada de eso.
 * El bioma que más se pastorea —la sabana tropical— sigue sin ninguno, y el
 * motivo está en la sección «La sabana no está sin medir».
 */
export const FORRAJE_MEDIDO: readonly MedicionForraje[] = [
  {
    bioma: 'resolve_pastizal_templado',
    sitio: 'Loamy Upland, MLRA 53B, Dakota del Norte y del Sur',
    clase_wc: 30,
    insumos: 'secano',
    tipo: 'ms_herbacea_total',
    // 2.733 y 2.358 lb/acre. El de abajo NO es un año malo: es el estado al que
    // el sitio transiciona con pastoreo continuo intenso o continuo de
    // primavera, dominado por juncia y grama azul. Van los dos porque la
    // diferencia entre ellos es manejo, y eso es justamente lo que esta app
    // tiene que poder mostrar.
    kg_ms_ha_anio_min: 2643,
    kg_ms_ha_anio_max: 3063,
    kg_ms_ha_anio_tipico: null,
    lluvia_mm_min: 381,
    lluvia_mm_max: 508,
    temp_media_c_anual: null,
    metodo: 'Producción anual de las comunidades de referencia de las fichas de sitio ecológico correlacionadas con la clase, en el informe CEAP de pastizales del NRCS.',
    que_cuenta: 'Producción anual aérea en peso seco de la comunidad herbácea. No descuenta palatabilidad, acceso ni pisoteo.',
    estacionalidad: 'Las especies nativas de estación fría crecen de fines de marzo a principios o mediados de julio; las de estación cálida, de mediados de mayo a fines de agosto. El rebrote de otoño depende de que haya humedad en el suelo.',
    donde_deja_de_valer: 'Clase de sitio Loamy Upland de la MLRA 53B. La propia fuente dice que la lluvia anual de la MLRA va de 15 a 20 pulgadas y que la media de la ficha es 20,0: la media está en el techo del rango, no en el medio.',
    medido_en: 'informe de 2018',
    fuente: {
      label: 'USDA NRCS — Evaluation of Ecological Site Classes and Community Classes for Regional Scale Modeling of Conservation Effects on Grazing Lands: MLRA 53B',
      url: 'https://www.nrcs.usda.gov/publications/ceap-GrazingLands-2018-EcologicalSiteMajorLandResourceArea53b.pdf',
    },
  },
  {
    bioma: 'resolve_pastizal_templado',
    sitio: 'Very Shallow 23-31 PZ, MLRA 81B, Edwards Plateau, Texas',
    // Clase 30 por la comunidad de referencia 1.1, que es pradera de gramíneas
    // medias; las leñosas están y la ficha las cuenta aparte, y de ahí sale la
    // fracción herbácea de 0,92 de `FRACCION_HERBACEA_DEL_SITIO`.
    clase_wc: 30,
    insumos: 'secano',
    tipo: 'ms_herbacea_total',
    // Gramíneas 680–2.125 lb/acre y hierbas 56–175, o sea 736–2.300 en conjunto,
    // con valor representativo 1.840. La ficha publica además el total del sitio
    // —800 / 2.000 / 2.500 lb/acre— que incluye arbustos y árboles; acá va la
    // fracción herbácea, que es la que pastorea un animal. La misma ficha dice
    // que las gramíneas son el 85 a 90 % de la producción anual.
    kg_ms_ha_anio_min: 825,
    kg_ms_ha_anio_max: 2578,
    kg_ms_ha_anio_tipico: 2062,
    lluvia_mm_min: 508,
    lluvia_mm_max: 762,
    temp_media_c_anual: null,
    metodo: 'Tabla de producción anual por tipo de planta de la ficha de sitio ecológico, comunidad de referencia 1.1 (pradera de gramíneas medias).',
    que_cuenta: 'Gramíneas, graminoides y hierbas. Excluye arbustos y árboles, que la ficha cuenta aparte. No descuenta palatabilidad ni acceso.',
    estacionalidad: 'La curva publicada reparte la producción por mes: 2-3-5-13-23-15-4-5-15-7-5-3 % de enero a diciembre. Mayo solo es el 23 % y julio y agosto juntos son el 9 %.',
    donde_deja_de_valer: 'Suelos de 4 a 10 pulgadas sobre caliche o roca, con 40 a 95 % de carbonato de calcio y capacidad de agua disponible de 0,3 a 1,8 pulgadas. La ficha es PROVISIONAL y se contradice en la lluvia: el nombre del sitio dice 23-31 pulgadas, la tabla climática dice rango real 20-30 y media 30.',
    medido_en: 'ficha actualizada el 19/09/2023',
    fuente: {
      label: 'USDA NRCS — Ecological site R081BY354TX, Very Shallow 23-31 PZ (MLRA 081B, Edwards Plateau)',
      url: 'https://edit.sc.egov.usda.gov/catalogs/esd/081B/R081BY354TX',
    },
  },
  {
    // El id del bioma 10 es `resolve_montano` y no `resolve_pastizal_montano`:
    // el encargo le había puesto el nombre corto y no existe con ese nombre.
    bioma: 'resolve_montano',
    sitio: 'Chuquibambilla (3.910 m) y La Raya (4.300 m), Puno, Altiplano peruano',
    clase_wc: 30,
    insumos: 'secano',
    tipo: 'ms_herbacea_total',
    // 626,4 · 1.237,0 · 1.340,8 · 1.957,7 kg MS/ha para los cuatro pastizales.
    // Son la biomasa ANUAL, ya separada de la permanente: la biomasa total en
    // pie promedio es de 1.484 a 3.972 kg/ha y la fracción muerta en pie va del
    // 38,5 % en Calamagrostis antoniana al 66,3 % en Festuca dichoclada. O sea
    // que en un pajonal altoandino entre un tercio y dos tercios de lo que se ve
    // parado no creció este año.
    kg_ms_ha_anio_min: 626,
    kg_ms_ha_anio_max: 1958,
    kg_ms_ha_anio_tipico: null,
    lluvia_mm_min: 410,
    lluvia_mm_max: 1119,
    temp_media_c_anual: null,
    metodo: 'Seis cosechas mensuales (diciembre a mayo) dentro de una clausura sin pastoreo de 2.500 m2, en dos bloques de 361 m2, con 30 unidades de muestreo por época, marco de 0,5 m2, corte a 2 cm y secado en estufa a 65 °C hasta peso constante.',
    que_cuenta: 'Materia seca aérea ANUAL del espectro total de especies del pastizal, separada de la biomasa permanente. Al estar dentro de clausura no descuenta consumo ni pisoteo.',
    estacionalidad: 'El mínimo cae en diciembre en los cuatro pastizales y el máximo entre febrero y mayo según la comunidad. En Calamagrostis antoniana va de 828 a 2.983 kg/ha entre diciembre y mayo: la misma pradera rinde 3,6 veces más al final de las lluvias que al principio.',
    donde_deja_de_valer: 'Pajonal altoandino por encima de 3.900 m, en Puno, con biotemperatura media anual de 4,6 a 12,9 °C. La fuente publica además receptividad por condición: 2 unidades ovino/ha/año en los dos pastizales de planicie y 1 en los dos de áreas colinosas.',
    medido_en: 'temporada de lluvias de 1982',
    fuente: {
      label: 'Revista de Ciencias Agrarias (UNA Puno) 7(1):73-83 — Relaciones suelo-comunidad vegetal en pastizales del Altiplano sur peruano',
      url: 'https://revistas.unap.edu.pe/agr/index.php/agr/article/view/465',
    },
  },
  {
    bioma: 'resolve_mediterraneo',
    sitio: 'Agra, oeste de Lesbos, Grecia — 14 potreros de cuatro majadas',
    // Frygana: arbustal, y es la ÚNICA medición de la clase 20. La cifra está
    // escalada a la hectárea del potrero —la jaula por el porcentaje de
    // cobertura herbácea de ese potrero—, así que es producción herbácea por
    // hectárea de arbustal y no de los claros entre arbustos.
    clase_wc: 20,
    insumos: 'secano',
    tipo: 'ms_herbacea_total',
    // «ranging from very small values close to 300 kg/ha to those of about 5800
    // kg/ha at a flat pasture plot, which in the past was used for annual
    // crops». El techo es ese potrero plano y ex-chacra, no la frygana: el
    // propio trabajo dice que los potreros por debajo de 500 kg/ha están en
    // suelos desfavorables y los de arriba, en el rango de las praderas
    // mejoradas de la bibliografía.
    kg_ms_ha_anio_min: 300,
    kg_ms_ha_anio_max: 5800,
    kg_ms_ha_anio_tipico: null,
    // Las dos temporadas medidas, que es de donde sale la cifra: 353,6 y 797,3
    // mm. La normal del lugar es mucho más angosta y va en `donde_deja_de_valer`.
    lluvia_mm_min: 354,
    lluvia_mm_max: 797,
    temp_media_c_anual: null,
    metodo: 'Jaulas de exclusión de malla 1 × 1,2 cm sobre 0,25 m2 y 0,7 m de alto, puestas en octubre, diciembre y marzo y cosechadas a ras entre fines de mayo y principios de junio; secado a 60 °C por 24 h. La productividad del potrero es la biomasa de la jaula multiplicada por el porcentaje de cobertura herbácea de ese potrero, promediada entre estaciones de muestreo.',
    que_cuenta: 'Herbáceas solamente, y por construcción: las estaciones de muestreo se eligieron sin suelo desnudo, sin piedras y sin vegetación perenne. NO cuenta el Sarcopoterium spinosum ni el Asphodelus ramosus, que cubren buena parte de estos potreros y que la majada sí ramonea en parte. No descuenta uso.',
    estacionalidad: 'Crecimiento moderado los primeros 5 o 6 meses y mucho más rápido en los 2 o 3 que siguen. Por época y por año: 5,8 · 5,2 · 12,1 kg MS/ha/día en el primero y 9,8 · 4,4 · 21,6 en el segundo. La jaula cosechada temprano y después dejada descansar fue la de mayor tasa en las dos temporadas: pastorear temprano y largar puede rendir más al final.',
    donde_deja_de_valer: 'Fryganas y ex-chacras del oeste de Lesbos, sobre roca volcánica ácida, con suelos de 15 a 30 cm o de 30 a 60 cm y pendientes de 6 a 12 % o más; sólo tres ex-chacras pasan los 60 cm y son casi planas. La normal del lugar es 415 mm y 17 °C de media, con 464,6 mm de media histórica en la estación de Sigri. Y el dato que no se puede ignorar: la proteína bruta de lo cosechado va de 5,4 a 7,3 %, que el propio trabajo califica de tan baja como la paja de cereal, así que estos kilos de materia seca no son kilos de alimento.',
    medido_en: 'dos temporadas de crecimiento consecutivas, de septiembre a junio',
    fuente: {
      label: 'Sustainability 14(8):4623 — Grazing Land Productivity, Floral Diversity, and Management in a Semi-Arid Mediterranean Landscape',
      url: 'https://doi.org/10.3390/su14084623',
    },
  },
  {
    bioma: 'resolve_tundra',
    sitio: 'Cuatro comunidades de pajonal de Eriophorum vaginatum, Alaska y Yukón',
    // Pajonal de ciperáceas. WorldCover podría verlo como 100 (musgo/liquen) en
    // vez de 30; va 30 porque lo medido es la producción del Eriophorum y no la
    // del liquen, que es exactamente el error que documenta la sección de la
    // inversión del stock.
    clase_wc: 30,
    insumos: 'secano',
    tipo: 'npp_herbacea',
    // «Yearly primary production was estimated to be between 35 and 96 g m-2
    // for aboveground vascular plants», o sea 350 a 960 kg/ha/año.
    kg_ms_ha_anio_min: 350,
    kg_ms_ha_anio_max: 960,
    kg_ms_ha_anio_tipico: null,
    // La fuente no publica lluvia para sus sitios y no se inventa. En tundra el
    // agua tampoco es lo que limita: limitan el frío y el largo del verano.
    lluvia_mm_min: null,
    lluvia_mm_max: null,
    temp_media_c_anual: null,
    metodo: 'Componentes de fitomasa y tasas de producción primaria en cuatro comunidades de pajonal de algodoncillo; recambio aéreo medido con bolsas de hojarasca. De este trabajo sólo se pudo leer el resumen del editor: el texto completo está detrás de una verificación anti-bot, así que el método primario no se verificó más allá de lo que el resumen declara.',
    que_cuenta: 'Producción primaria anual de las plantas vasculares AÉREAS. Excluye musgos y líquenes, que el mismo resumen cuantifica aparte —28 a 116 g/m2/año de musgo y 1 a 5 de liquen— y que en tundra son parte del forraje real del reno y del caribú, sobre todo en invierno. Para pastoreo de renos esta cifra es un piso y no el total.',
    estacionalidad: 'La comunidad de algodoncillo produce buena parte de su crecimiento nuevo temprano en el verano, en gran medida porque el Eriophorum vaginatum arranca temprano.',
    donde_deja_de_valer: 'Cuatro comunidades de Alaska y del Yukón, no todo el bioma. Y el dato que explica por qué acá no se puede mirar una foto de campo: la fitomasa total de los dos sitios estudiados a fondo era de 7.401 y 7.567 g/m2 —74 y 76 toneladas por hectárea— con un recambio aéreo de unos 7 años y subterráneo de 45 a 150. Lo que está parado es entre 77 y 211 veces la producción del año. El mismo trabajo agrega que después de un disturbio la capa activa se profundiza, hay más nutrientes disponibles y el algodoncillo responde creciendo más.',
    medido_en: 'publicado en 1974, Arctic and Alpine Research 6(3)',
    fuente: {
      label: 'Arctic and Alpine Research 6(3) — Primary Production in Arctic Cottongrass Tussock Tundra Communities',
      url: 'https://doi.org/10.1080/00040851.1974.12003782',
    },
  },
  {
    // El sitio físico es una isla de río, con albardón, bañado y 40 días de
    // agua encima al final del invierno. Pero va en el pastizal templado y no
    // en el inundable, y el motivo está en la sección de arriba: el polígono de
    // RESOLVE sobre la coordenada que la tesis publica dice Pampa Húmeda. Donde
    // acequia va a buscar esta medición es donde acequia clasifica el predio.
    bioma: 'resolve_pastizal_templado',
    sitio: 'Pastizal de albardón, isla de Baradero, Delta Medio del Paraná',
    clase_wc: 30,
    insumos: 'secano',
    tipo: 'ms_forrajera',
    // «En el período de primavera a otoño, descansos bimestrales o más
    // prolongados del pastoreo permiten obtener producciones forrajeras desde
    // los 8200 kg MS*ha-1», dice la conclusión. El rango sale del cuerpo:
    // 6.700 kg es la cosecha de verano del tratamiento SIN cortes y 8.250 la
    // cosecha ACUMULADA del de cortes bimestrales. Son las dos puntas de lo
    // medido, y la de arriba es la que el manejo alcanza.
    kg_ms_ha_anio_min: 6700,
    kg_ms_ha_anio_max: 8250,
    kg_ms_ha_anio_tipico: null,
    // La tesis publica una sola media anual para el sitio —1.055,6 mm de la
    // estación— y no un rango de totales anuales, porque midió un año. Van las
    // dos iguales en vez de inventar un ancho. El año medido NO fue el
    // promedio: unos 850 mm entre agosto y el 31 de diciembre de 2012, 450 en
    // la primavera, y un invierno de 2013 con apenas 50 mm.
    lluvia_mm_min: 1056,
    lluvia_mm_max: 1056,
    temp_media_c_anual: null,
    metodo: 'Tres clausuras de 4 × 4 m separadas unos 20 m, con boyero a 30 y 70 cm, cada una dividida en dos tratamientos: cortes bimestrales de la vegetación a 7 cm de altura y sin cortes. Afuera, pastoreo continuo con alta carga. Se muestreó por estación agronómica cortando con tijera de podar el material arraigado dentro de un aro, dejando 7 cm de remanente; secado en estufa a 65 °C hasta peso constante y pesado con precisión de ±1 g. La tasa de crecimiento se calculó por diferencia de forraje disponible entre corte y corte. El área del aro de muestreo NO está indicada en el texto de la tesis, así que la conversión a kg/ha no se puede recalcular desde acá.',
    que_cuenta: 'Materia seca VIVA de las especies forrajeras, cosechada por encima de los 7 cm. No incluye las no forrajeras —en este pastizal degradado el abrojo grande, Xanthium cavallinesii, es el que más crece en verano—, ni la materia seca muerta, ni nada por debajo de la altura de corte, ni raíces. No descuenta uso admisible. La MS total del mismo muestreo, que sí suma las no forrajeras, da 11.200 a 11.400 kg/ha.',
    estacionalidad: 'El pico de crecimiento va de fines de primavera a verano: las forrajeras marcan 60 a 70 kg MS/ha/día entre noviembre y enero en los dos tratamientos. Con cortes bimestrales la tasa se mantiene arriba de 40 kg/ha/día casi cuatro meses; sin cortes dura la mitad del tiempo y en otoño pasa a ser NEGATIVA, porque dentro del canopeo muere más material del que se genera. En invierno falta materia seca en el campo.',
    donde_deja_de_valer: 'Un pastizal degradado de albardón y caída de albardón en una isla del Delta Medio, con pastoreo previo intenso. Tres clausuras de 4 × 4 m en un solo año: el propio test de Wilcoxon no encontró evidencia estadística de diferencia entre los tratamientos por la variabilidad en pocos datos, así que el 23 % a favor de los cortes está comparado de forma empírica y la tesis lo dice. La cifra es de primavera a otoño y no de los doce meses: el invierno queda afuera, y al final del de 2013 el albardón estuvo anegado unos 40 días. Tampoco vale para el interior del bañado, que se inunda distinto.',
    medido_en: 'agosto de 2012 a septiembre de 2013',
    fuente: {
      label: 'Universidad Nacional de Rosario — Uso sustentable de un Pastizal Natural del delta Medio del Paraná, para la Producción Ganadera (tesis de maestría)',
      url: 'https://rephip.unr.edu.ar/bitstreams/8ecbddb4-5c07-43f2-87a3-ac4b11df3c0a/download',
    },
  },
  {
    // Primera medición del bioma 13, y la primera donde acequia tiene las dos
    // medias anuales publicadas por la propia ficha: 580 mm y 15,1 °C. Por eso
    // es el sitio contra el que se le mide el sesgo al Miami Model, que para ese
    // clima da 959 g/m²/año de NPP total contra 1.676 medidos. Ver `miamiModel.ts`.
    bioma: 'resolve_desierto_matorral_xerofilo',
    sitio: 'Pastizal salino de Montecillo (MNT1), borde del lecho del lago de Texcoco, México',
    clase_wc: 30,
    insumos: 'secano',
    tipo: 'ms_herbacea_total',
    // El rango NO es la variación entre años ni entre potreros: es la que hay
    // entre los algoritmos publicados para esta misma serie de cosechas.
    // García-Moya y Montañez Castro (1992) dan 669, Scurlock et al. (2002) dan
    // 609 y Scurlock y Olson (2013) dan 1.063. El típico es el del trabajo
    // primario, que es el único cuyo método la ficha describe. Hay una CUARTA
    // fila, la del GPPDI, que no entra en el rango porque está en carbono
    // (130 g C/m²/año) y no se convierte; su cociente aérea/total sí sirve y
    // está en `FRACCION_AEREA_MONTECILLO`.
    kg_ms_ha_anio_min: 6090,
    kg_ms_ha_anio_max: 10630,
    kg_ms_ha_anio_tipico: 6692,
    lluvia_mm_min: 580,
    lluvia_mm_max: 580,
    temp_media_c_anual: 15.1,
    metodo: 'Clausura de 1 ha en bloques aleatorizados. El día 15 de cada mes se cortaron 20 cuadrantes de 0,25 × 1,0 m a nivel del suelo, separando material vivo de material muerto, y se muestreó también la biomasa subterránea. La NPP anual se calculó con el «método #5» de la publicación asociada. Serie mensual de junio de 1984 a diciembre de 1994, con dos huecos declarados: febrero y marzo de 1986, cuando el incendio se llevó los datos, y de enero a septiembre de 1991, sin explicación.',
    que_cuenta: 'Materia seca AÉREA de un pastizal casi puro de Distichlis spicata var. mexicana, vivo más muerto, sin separar especies forrajeras de las que no lo son. La ficha publica además las otras dos piezas, y las dos importan: la NPP subterránea es de 1.007 g/m²/año, MAYOR que la aérea, y la NPP total de 1.676 g/m²/año, que la propia ficha califica de «high relative to many previous studies in semi-arid tropical grasslands».',
    estacionalidad: 'Unimodal. Los máximos de biomasa aérea caen durante la estación lluviosa de mayo a octubre o inmediatamente después, y los mínimos en la época más seca y fría. La ficha publica la serie mes por mes.',
    donde_deja_de_valer: 'Es una clausura SIN pastoreo, y el promedio de tres años contiene un incendio accidental de febrero de 1986: la NPP total fue de 1.994 g/m²/año en 1985, cayó a 1.422 en 1986 y volvió a 1.611 en 1987. No es un accidente del sitio sino su régimen: la ficha dice que el fuego cada 4-5 años es la práctica histórica y que es INTENCIONAL, «to improve forage quality during the dry season». El clima publicado es de la estación de Chapingo, a 5 km. Y el rango de arriba es dispersión de algoritmo, así que no se puede leer como la variación interanual del sitio.',
    medido_en: 'la cifra anual es el promedio de 1985 a 1987; la serie mensual va de junio de 1984 a diciembre de 1994',
    fuente: {
      label: 'ORNL DAAC — NPP Grassland: Montecillo, Mexico, 1984-1994, R1 (ficha de sitio)',
      url: 'https://daac.ornl.gov/NPP/guides/NPP_MNT.html',
    },
  },
  {
    // Primera medición del bioma 4, primer `ms_sotobosque`, y el experimento que
    // el módulo venía necesitando: SEIS algoritmos sobre las MISMAS cosechas.
    bioma: 'resolve_bosque_templado_caducifolio_mixto',
    sitio: 'Sotobosque de un robledal-carpinal dominado por haya, Różańsko, noroeste de Polonia',
    clase_wc: 10,
    insumos: 'secano',
    tipo: 'ms_sotobosque',
    // El mínimo es el método 1 en 2010 (37,835 g/m²) y el máximo el método 6 en
    // 2011 (93,958). Sin típico: la fuente no elige uno, compara los seis.
    kg_ms_ha_anio_min: 378,
    kg_ms_ha_anio_max: 940,
    kg_ms_ha_anio_tipico: null,
    lluvia_mm_min: 541,
    lluvia_mm_max: 615,
    temp_media_c_anual: 8.8,
    metodo: 'Sitio de 12 ha, dos temporadas de crecimiento (2010 y 2011). Se cosechó la capa herbácea de 7 a 10 marcos cuadrados de 0,6 × 0,6 m, todas las semanas en abril y mayo y cada dos semanas el resto de la temporada. Sobre ESAS cosechas se calcularon seis estimaciones de producción anual con seis algoritmos distintos: 1) el máximo de biomasa en pie del año, 2) la suma de las diferencias positivas entre cosechas sucesivas, 3) la suma de los máximos de cada especie, 4) y 5) biomasa de brote por densidad de brotes, al máximo de biomasa y al máximo de densidad, y 6) al máximo del producto.',
    que_cuenta: 'Toda la biomasa aérea de las plantas herbáceas del sotobosque, cortada al nivel del suelo. No incluye árboles, ni arbustos, ni raíces, y la fuente NO la define como forraje: es la capa herbácea de un bosque cerrado, que es lo máximo que podría comer un animal ahí adentro.',
    estacionalidad: 'Dos picos, uno en primavera y otro en septiembre-octubre. Y un dato que ninguna cifra anual puede llevar: la mitad de la producción anual la aporta UNA especie efímera de primavera, Anemone nemorosa, que para el verano ya no está; las dos siguientes, Galeobdolon luteum y Galium odoratum, aportan un 10 % cada una. En un bosque templado, la mitad del pasto del año pasa en abril.',
    donde_deja_de_valer: 'Un área homogénea de sotobosque dentro de un sitio forestal de 12 ha, con dosel de roble, carpe y haya de unos 100 años, y sólo dos temporadas. Pero lo que de verdad limita la cifra no es el sitio: es el algoritmo. El método 1 —el máximo de biomasa en pie, que es el más usado y el más barato— SUBESTIMA entre un 50 % y un 52 % respecto del método 6, y la diferencia entre métodos (hasta 2,0× dentro del mismo año) es mayor que la diferencia entre los dos años con el mismo método (1,08 a 1,38×).',
    medido_en: '2010 y 2011',
    fuente: {
      label: 'Rawlik y Jagodziński, «Herbaceous Layer Net Primary Production of Oak-Hornbeam Forest: Comparing Six Methods of Assessment Based on the Seasonal Dynamics of Biomass Increments», Ecosystems 24 (2021) 337-349',
      url: 'https://doi.org/10.1007/s10021-021-00658-0',
    },
  },
  {
    // Primera medición del bioma 5. Entra por el sotobosque, no por el rodal.
    bioma: 'resolve_bosque_coniferas_templado',
    sitio: 'Sotobosque de un rodal de aliso rojo, Cascade Head 1A, transecto OTTER, Oregón',
    clase_wc: 10,
    insumos: 'secano',
    tipo: 'ms_sotobosque',
    kg_ms_ha_anio_min: 410,
    kg_ms_ha_anio_max: 410,
    kg_ms_ha_anio_tipico: 410,
    // La ficha publica el rango de lluvia del transecto entero —de 2.510 mm en
    // la costa a 220 mm en el extremo este— y no una tabla por sitio. Este es el
    // sitio costero, así que el 2.510 le correspondería; no se escribe igual,
    // porque un extremo de transecto no es la lluvia medida del punto.
    lluvia_mm_min: null,
    lluvia_mm_max: null,
    temp_media_c_anual: null,
    metodo: 'Proyecto OTTER (Oregon Transect Ecosystem Research), campañas de 1989 a 1991. La ficha define la columna `ANPP_herb` como «above-ground net primary production of dominant herb species» y la publica en g/m²/año junto con la cobertura herbácea del rodal; arbustos y hierbas se cosecharon al final de la estación de crecimiento, antes de la caída de hojarasca. El método primario está en Law y Waring (1994) y no se detalla en la ficha.',
    que_cuenta: 'Producción aérea de las especies herbáceas DOMINANTES del sotobosque, con 35,2 % de cobertura herbácea, bajo un rodal de Alnus rubra con índice de área foliar 4,3. La misma ficha publica la NPP total del rodal, 1.630 g/m²/año, y ésa es la comparación que importa: la capa herbácea es el 2,5 % de lo que produce el rodal.',
    estacionalidad: 'Una cosecha al final de la temporada: la ficha no publica curva mensual.',
    donde_deja_de_valer: 'Un punto del transecto a 200 m de altura, y un rodal de aliso rojo FIJADOR DE NITRÓGENO, que no es un dosel cualquiera: la parcela vecina de bosque viejo de Picea-Tsuga (Cascade Head #1, con 71.080 g/m² de biomasa arbórea) viene sin medición herbácea, así que no hay con qué comparar el efecto del dosel en el mismo sitio. Son las especies dominantes y no toda la capa herbácea.',
    medido_en: '1989 a 1991',
    fuente: {
      label: 'ORNL DAAC — NPP Temperate Forest: OTTER Project Sites, Oregon, USA, 1989-1991, R1 (ficha de sitio)',
      url: 'https://daac.ornl.gov/NPP/guides/NPP_OTTER.html',
    },
  },
  {
    // Esta entrada está acá por lo que mide, no por lo que vale: es el bioma 8,
    // el MISMO que la pradera de Dakota, y produce 44 veces menos. La coordenada
    // publicada (44,60 N / −123,27 O) cae en la sabana de robles del valle
    // Willamette, ECO_ID 403, bioma 8. El rodal es de Pseudotsuga: lo que separa
    // los dos números es el dosel, no el clima.
    bioma: 'resolve_pastizal_templado',
    sitio: 'Sotobosque de un rodal de Pseudotsuga, Waring’s Woods, transecto OTTER, Oregón',
    // Bioma 8 y clase 10: el bioma dice pradera templada y arriba hay un dosel
    // cerrado de conífera. La discordancia es el dato.
    clase_wc: 10,
    insumos: 'secano',
    tipo: 'ms_sotobosque',
    kg_ms_ha_anio_min: 60,
    kg_ms_ha_anio_max: 60,
    kg_ms_ha_anio_tipico: 60,
    lluvia_mm_min: null,
    lluvia_mm_max: null,
    temp_media_c_anual: 11.2,
    metodo: 'Proyecto OTTER, campañas de 1989 a 1991; misma definición y mismo método que Cascade Head, con la cosecha al final de la estación de crecimiento. `ANPP_herb` = 6 g/m²/año, con 4,9 % de cobertura herbácea.',
    que_cuenta: 'Producción aérea de las especies herbáceas dominantes bajo un rodal de Pseudotsuga menziesii de 47.120 g/m² de biomasa arbórea. La NPP total del rodal, publicada en la misma tabla, es de 1.540 g/m²/año: la capa herbácea es el 0,4 % de eso. Y la cobertura herbácea explica el salto contra Cascade Head mejor que cualquier otra variable: 4,9 % contra 35,2 % de cobertura dan 6 contra 41 g/m²/año, o sea que las dos razones son casi la misma.',
    estacionalidad: 'Una cosecha al final de la temporada: la ficha no publica curva mensual.',
    donde_deja_de_valer: 'No es una cifra de pastizal y NO se puede usar como la producción del bioma 8: es el piso que deja un dosel cerrado dentro de ese bioma. La ficha agrega que la sequía es extrema en este sitio del valle interior. La media anual de 11,2 °C sí es media anual —la ficha la da por sitio, variando con la altura— pero la lluvia no está publicada por punto.',
    medido_en: '1989 a 1991',
    fuente: {
      label: 'ORNL DAAC — NPP Temperate Forest: OTTER Project Sites, Oregon, USA, 1989-1991, R1 (ficha de sitio)',
      url: 'https://daac.ornl.gov/NPP/guides/NPP_OTTER.html',
    },
  },
  {
    // Lote 11. El MISMO sitio entra dos veces, y ahí está todo el punto: once
    // parcelas bajo dosel de ponderosa y tres aberturas naturales, el mismo
    // suelo, el mismo clima, la misma cosecha de agosto de 1972 y el mismo
    // método. Bajo dosel 39-503 kg MS/ha, en las aberturas 521-658: un factor
    // 13 adentro de un bosque de 6.758 ha. Esta es la entrada del dosel; la
    // abertura es la que sigue.
    bioma: 'resolve_bosque_coniferas_templado',
    sitio: 'Once parcelas bajo dosel de ponderosa, Manitou Experimental Forest, Colorado',
    clase_wc: 10,
    insumos: 'secano',
    tipo: 'ms_sotobosque',
    // 35 lb/acre con 78 % de densidad de copa y 449 con 29 %. En lb/acre, que es
    // lo que publica la tesis; la conversión exacta es LB_ACRE_A_KG_HA.
    kg_ms_ha_anio_min: 39,
    kg_ms_ha_anio_max: 503,
    kg_ms_ha_anio_tipico: null,
    // 15,6 pulgadas publicadas para la estación. El Servicio Forestal publica
    // 398 mm como media de 65 años, que es lo mismo. Ver `donde_deja_de_valer`:
    // otras publicaciones del sitio dan 368 y 432.
    lluvia_mm_min: 396,
    lluvia_mm_max: 396,
    // «Aproximadamente 5 °C», y no lo publica la tesis sino otra publicación del
    // Servicio Forestal sobre la misma estación (Massman et al. 2004). Entra
    // porque el contraste no es sensible: con 396 mm la lluvia limita el Miami
    // Model para cualquier temperatura por encima de 1 °C.
    temp_media_c_anual: 5,
    metodo: 'Catorce parcelas permanentes de 0,25 a 0,98 acres sobre un gradiente NATURAL de densidad de ponderosa, en tres pastizales de la estación; once bajo dosel y tres aberturas. En cada parcela, 250 subparcelas de 1 × 2 pies medidas con herbage meter y doble muestreo: cada quinta subparcela se cortó a 0,5 pulgadas y se pesó seca en horno. Cosechas de junio, julio y agosto de 1972 y agosto de 1973; estas cifras son las de agosto de 1972. El algoritmo es peak standing crop —el método 1 de los seis de Rawlik—, que subestima: ver `CURVA_DOSEL_MANITOU`.',
    que_cuenta: 'Sotobosque por especie: Arizona fescue, blue grama, mountain muhly, ciperáceas, Artemisia frigida, Arctostaphylos y otras gramíneas y hierbas. Incluye arbustos BAJOS además de las herbáceas, así que no es estrictamente la capa herbácea. No descuenta palatabilidad ni acceso, y no es ingestión animal.',
    estacionalidad: 'El crecimiento y la lluvia se concentran de abril a agosto: la estación publica que el 70 % de las 15,6 pulgadas cae en esos cinco meses. Las cosechas de junio, julio y agosto de 1972 dan prácticamente el mismo nivel —las tres ecuaciones difieren en el tercer decimal de la pendiente—, así que para este sitio el pico es una meseta de tres meses y no un día.',
    donde_deja_de_valer: 'Parcelas alrededor de 2.440 m sobre suelos de granito de Pikes Peak; la estación entera va de 2.286 a 2.835 m e incluye bosque, pastizal y propiedad privada, así que su coordenada institucional no asigna por sí sola el bioma de cada parcela —verifiqué tres puntos que la abarcan y los tres dan bioma 5—. Y la lluvia del sitio tiene dispersión entre publicaciones: 396 mm en la tesis y en la ficha de la estación, 398 mm como media de 65 años en un paper del Servicio Forestal, 432 mm en la descripción del NCAR y 368 mm en la ficha de AmeriFlux, que mide 12 km² alrededor de su torre y no la estación entera. Un 17 % entre puntas, y el contraste del modelo no cambia de limitante en ese rango.',
    medido_en: 'agosto de 1972 (la serie completa es junio, julio y agosto de 1972 y agosto de 1973)',
    fuente: {
      label: 'Metz, Harley E. (1974), «Relationship between ponderosa pine and understory herbage production», tesis de maestría, Colorado State University, 90 p. — Tablas 1, 2 y 6',
      url: 'https://www.fs.usda.gov/rm/pubs_exp_forests/manitou/rmrs_1974_metz_h001.pdf',
    },
  },
  {
    // La otra mitad del mismo sitio: las tres aberturas naturales, con 0 % de
    // densidad de copa. Un satélite las vería como pastizal, no como bosque, y
    // por eso van en la clase 30 aunque estén adentro de un bosque experimental.
    bioma: 'resolve_bosque_coniferas_templado',
    sitio: 'Tres aberturas naturales sin dosel, Manitou Experimental Forest, Colorado',
    clase_wc: 30,
    insumos: 'secano',
    tipo: 'ms_herbacea_total',
    // 465, 474 y 587 lb/acre. Sin típico: la tesis no elige uno.
    kg_ms_ha_anio_min: 521,
    kg_ms_ha_anio_max: 658,
    kg_ms_ha_anio_tipico: null,
    lluvia_mm_min: 396,
    lluvia_mm_max: 396,
    temp_media_c_anual: 5,
    metodo: 'Las mismas parcelas, el mismo día y el mismo doble muestreo que la entrada anterior: lo único que cambia es que acá la densidad de copa es 0 %. Peak standing crop de agosto de 1972.',
    que_cuenta: 'Igual que bajo dosel: gramíneas, hierbas y arbustos bajos, sin separar forrajeras de no forrajeras y sin descontar uso.',
    estacionalidad: 'La misma: 70 % de la lluvia entre abril y agosto.',
    donde_deja_de_valer: 'Son tres parcelas de 0,25 a 0,98 acres, o sea claros de 0,1 a 0,4 ha adentro de un bosque de conífera. No son una pradera abierta: tienen el borde del rodal al lado, y la tesis no mide cuánto de eso las afecta. Para la banda de la clase 30 son el extremo bajo de lo que puede dar un pastizal de montaña con 396 mm.',
    medido_en: 'agosto de 1972',
    fuente: {
      label: 'Metz, Harley E. (1974), «Relationship between ponderosa pine and understory herbage production», tesis de maestría, Colorado State University, 90 p. — Tablas 1 y 2',
      url: 'https://www.fs.usda.gov/rm/pubs_exp_forests/manitou/rmrs_1974_metz_h001.pdf',
    },
  },
  {
    // Lote 12. Las dos primeras mediciones de tierra de cultivo, y las dos
    // quedan AFUERA de la banda de la clase 40 por su `insumos`. No es un
    // descarte: es lo que las dos miden. Ver la sección «El cultivo está medido
    // y no se puede usar como el cultivo de un predio cualquiera».
    bioma: 'resolve_pastizal_templado',
    sitio: 'Avena de catorce cultivares, EEA INTA Marcos Juárez, Córdoba',
    clase_wc: 40,
    insumos: 'fertilizado',
    tipo: 'ms_cultivo_sembrado',
    // Suma de cuatro cortes. El mínimo es MARIA INTA y el máximo MANUELA INTA;
    // el típico es el promedio de los catorce que publica el propio informe, no
    // un punto medio calculado.
    kg_ms_ha_anio_min: 5460,
    kg_ms_ha_anio_max: 7862,
    kg_ms_ha_anio_tipico: 6539,
    // Los 984 mm son la suma de la serie mensual de 2024 que publica el Cuadro 3,
    // o sea la lluvia DEL AÑO MEDIDO y no la normal del lugar. Se declara así
    // porque la diferencia importa: 2024 tuvo cero milímetros en junio, julio y
    // septiembre.
    lluvia_mm_min: 984,
    lluvia_mm_max: 984,
    // Promedio de las doce medias mensuales del mismo cuadro. Es una media anual
    // legítima —no un máximo promediado con un mínimo, que es lo que prohíbe la
    // regla— pero es la del año medido y no la normal.
    temp_media_c_anual: 19.3,
    metodo: 'Ensayo de catorce cultivares en parcelas de 7,2 m² con tres repeticiones, siembra directa el 27/03/2024. Cosecha mecanizada cada vez que el 50 % de las variedades alcanzaba EC 3.1 de Zadoks o 20 cm de altura, lo que pasara primero: cuatro cortes, el 13/06, 16/08, 18/09 y 29/10. La cifra anual es la SUMA de los cuatro. CV del 8,8 % y LSD de Fisher al 5 % de 294 kg MS/ha.',
    que_cuenta: 'Materia seca aérea de los cuatro cortes de un verdeo de invierno sembrado. No es consumo, no es fracción comible y no es rastrojo: el último rebrote se secó para sembrar soja de primera. Y no es lo que da el lote sin insumos: el ensayo recibió 69 kg N/ha de urea en presiembra, 100 kg/ha de MicroEssentials a la siembra y 46 kg N/ha más en la primera semana de agosto, o sea 115 kg N/ha en total.',
    estacionalidad: 'Verdeo anual de invierno, con el ciclo completo entre marzo y octubre. El reparto entre cortes no es parejo y el promedio de los catorce cultivares lo muestra: 1.994, 1.329, 1.254 y 1.964 kg MS/ha. El primer corte y el último aportan el 60 % del año.',
    donde_deja_de_valer: 'Un sitio y una campaña, y una campaña mala: la fuente informa 11 mm en mayo, cero en junio, julio y septiembre, y heladas en agosto con un mínimo de −9,4 °C que dañaron la biomasa aérea de la mayoría de los genotipos. Así que estos 6.539 kg MS/ha son de un verdeo fertilizado en un año seco y con heladas, lo cual tira para los dos lados y no se puede corregir. La coordenada es la de la estación meteorológica de la EEA, que tiene 1.451 ha, y no la del lote.',
    medido_en: 'campaña agrícola 2024',
    fuente: {
      label: 'Donaire, G. et al. — «Evaluación de cultivares de avena para producción de forraje en INTA EEA Marcos Juárez. Campaña agrícola 2024» (Cuadros 2, 3 y 4)',
      url: 'https://www.argentina.gob.ar/sites/default/files/2025/02/inta_crcordoba_eeamarcosjuarez_donaire_g_evaluacion_ave.pdf',
    },
  },
  {
    // La otra punta de lo que puede dar un cultivo: 19.880 kg MS/ha/año, que es
    // 1,87 veces la medición de secano más alta que tiene acequia y 3,04 veces
    // la avena fertilizada de arriba. La diferencia es el agua que alguien puso.
    bioma: 'resolve_pastizal_templado',
    sitio: 'Alfalfa de diez cultivares bajo riego, establecimiento Curacó, 25 de Mayo, La Pampa',
    clase_wc: 40,
    insumos: 'riego',
    tipo: 'ms_cultivo_sembrado',
    // Suma de cinco cortes. Mínimo CW660, máximo Sofía, y el típico es el
    // promedio de los diez que publica el Cuadro 1. La conclusión de la fuente
    // dice «un rango máximo entre 19-21 t MS/ha/año».
    kg_ms_ha_anio_min: 18674,
    kg_ms_ha_anio_max: 21035,
    kg_ms_ha_anio_tipico: 19880,
    // NO es lluvia: es riego, 1.300 mm por melgas cada quince días. Va acá
    // porque es el agua que recibió el cultivo, y queda dicho en todos lados que
    // la puso el hombre. La lluvia del lugar no la publica la fuente.
    lluvia_mm_min: 1300,
    lluvia_mm_max: 1300,
    temp_media_c_anual: null,
    metodo: 'Diez cultivares de distinto grado de reposo invernal en bloques aleatorizados con cuatro repeticiones, parcelas de 6 m² (1 × 6 m) con cinco surcos a 0,20 m, implantadas el 11/04/2013. Cortes al 10 % de floración o cuando los rebrotes de corona llegaban a unos 5 cm: cinco cortes, el 06/11/2013, 29/11/2013, 04/02/2014, 25/03/2014 y 05/05/2014. La cifra anual es la suma de los cinco. Diferencias por LSD de Fisher p<0,05; no publica error estándar.',
    que_cuenta: 'Materia seca aérea cosechada de una alfalfa implantada, que es un cultivo puro de una especie forrajera: a diferencia de un pastizal natural, acá no hay fracción no forrajera que descontar. No es consumo y no es campo natural.',
    estacionalidad: 'Cinco cortes de noviembre a mayo, y el reparto es muy desigual: el promedio de los diez cultivares da 3.561, 3.149, 3.162, 3.983 y 6.027 kg MS/ha. El último corte, el de mayo, aporta el 30 % del año.',
    donde_deja_de_valer: 'Un sitio y una temporada, bajo RIEGO GRAVITACIONAL: la fuente informa unos 1.300 mm aplicados por melgas cada quince días desde el 30 de agosto. Eso es más agua que la lluvia anual de cualquiera de los doce sitios de secano de este archivo —el techo de todos es el 1.119 mm de la puna de Puno—, en una zona del Monte donde la lluvia natural no llega a la mitad. La propia fuente dice que las diferencias de producción fueron independientes del grado de reposo invernal. No estima el potencial de secano, y por eso `insumos` es `riego`.',
    medido_en: 'temporada 2013-2014',
    fuente: {
      label: 'Zamora, C. D. et al. — «Evaluación de la producción de materia seca en variedades de alfalfa (Medicago sativa) de diferentes grados de reposo invernal, en el área bajo riego de 25 de Mayo, La Pampa» (p. 332 y Cuadro 1)',
      url: 'https://repositorio.inta.gob.ar/xmlui/bitstream/handle/20.500.12123/674/CR%20La%20Pampa-San%20Luis_EEA%20Anguil_Zamora_CD_Evaluaci%C3%B3n%20de%20la%20producci%C3%B3n%20de%20materia%20seca.pdf?isAllowed=y&sequence=1',
    },
  },
] as const;

/**
 * La primera curva de forraje contra dosel que entra a acequia, con sus cuatro
 * ecuaciones publicadas y los catorce pares de los que salieron.
 *
 * Fuente: Metz (1974), Tabla 6, para el Manitou Experimental Forest. `Y` es el
 * rendimiento herbáceo en **lb/acre de peso seco en horno** y `X` la **densidad
 * de copa en %** (crown canopy density). No es cobertura de copa, ni área basal,
 * ni densidad de árboles, y **no son intercambiables**: la tesis usa esta y sólo
 * esta.
 *
 * **Verificado por ajuste, no por lectura.** Los catorce pares de agosto de 1972
 * están en el arreglo `PARES_AGOSTO_1972`, y el cuadrado mínimo sobre esos
 * catorce puntos devuelve `Y = 529,4 − 6,1 X`, que es exactamente la ecuación
 * publicada. Eso prueba que los pares y la ecuación son la misma cosa, lo cual
 * importa porque el PDF de la tesis no se puede abrir desde esta máquina.
 *
 * **El hallazgo está en comparar los dos años, y es el que hace la curva
 * usable.** 1973 produjo casi el doble que 1972, cosa que la propia tesis
 * advierte. Pero la pendiente RELATIVA es la misma:
 *
 * | año | ecuación | pendiente / intercepto | dosel donde el forraje llega a 0 |
 * |---|---|---|---|
 * | agosto 1972 | Y = 529,4 − 6,1 X | 0,011522 | 86,8 % |
 * | agosto 1973 | Y = 1.113,5 − 12,8 X | 0,011495 | 87,0 % |
 *
 * Las dos pendientes relativas difieren un **0,24 %** y los dos puntos de
 * extinción un **0,2 %**, con un nivel absoluto que se mueve **2,10×**. O sea:
 * **la forma de la relación es estable y lo que cambia con el año es la escala.**
 * Eso es lo contrario de lo que pasa con los algoritmos de NPP, donde lo estable
 * es el total y lo frágil es el reparto, y es la razón por la que una fracción de
 * dosel tiene chance de transferirse y una fracción de NPP no.
 *
 * **Cuidado con el «SE» publicado.** La tesis imprime SE = 22,5 lb/acre para la
 * ecuación de agosto de 1972. Ése **no es el desvío de los residuos**: sobre los
 * catorce pares el residuo tiene un desvío de 80,2 lb/acre, y 22,5 coincide con
 * el error estándar de la media (21,4). Leerlo como dispersión de la predicción
 * subestima el ruido 3,6 veces.
 *
 * **Rango de validez.** Un sitio, un tipo de bosque (Pinus ponderosa sobre
 * granito, a 2.440 m, con 396 mm), dos temporadas, y un gradiente natural de
 * densidad —no un ensayo de raleo—. `X` va de 0 a 78 % en los datos; el 86,8 %
 * donde la recta cruza el cero es **extrapolación de dos parcelas**, no una
 * medición. Y la recta es la forma que la tesis eligió: con catorce puntos y un
 * r² de 0,79 no se puede distinguir de una exponencial o una hiperbólica, que es
 * justamente lo que Bojórquez-Tapia, Ffolliott y Guertin ajustaron en Arizona y
 * lo que todavía falta montar.
 *
 * **Qué se rompe si cambia: nada todavía, a propósito.** No la consume ningún
 * cálculo. Con un sitio no se le puede poner una curva de dosel a cualquier
 * predio del planeta; lo que hace es fijar la forma que hay que buscar en los
 * demás sitios, y dar el primer número a la pregunta de cuánto forraje tapa un
 * dosel.
 */
export const CURVA_DOSEL_MANITOU = {
  /** `Y = a + b·X`, con Y en lb/acre de peso seco y X en % de densidad de copa. */
  ECUACIONES: [
    { fecha: 'junio 1972', a: 524.1, b: -5.9, r2: 0.755, se_publicado: 24.8 },
    { fecha: 'julio 1972', a: 523.7, b: -5.8, r2: 0.752, se_publicado: 24.7 },
    { fecha: 'agosto 1972', a: 529.4, b: -6.1, r2: 0.792, se_publicado: 22.5 },
    { fecha: 'agosto 1973', a: 1113.5, b: -12.8, r2: 0.794, se_publicado: 46.4 },
  ],
  /** `[densidad_de_copa_pct, lb_acre]` de las catorce parcelas, agosto de 1972. */
  PARES_AGOSTO_1972: [
    [78, 35], [73, 69], [40, 348], [0, 465], [0, 474], [46, 362], [42, 204],
    [35, 206], [0, 587], [29, 449], [41, 403], [51, 143], [66, 125], [53, 160],
  ],
} as const;

/** Evalúa una de las rectas de Manitou. Devuelve lb/acre, no kg/ha. */
export function forrajeManitouLbAcre(ecuacion: { a: number; b: number }, densidad_copa_pct: number): number {
  return ecuacion.a + ecuacion.b * densidad_copa_pct;
}

/**
 * La fracción del forraje a cielo abierto que queda bajo un dosel, según la
 * recta de Manitou: `1 − (|b|/a)·X`.
 *
 * Es la forma de la relación, sin su escala, y es lo único de esta curva que los
 * dos años medidos sostienen por igual: 0,011522 contra 0,011495 por punto de
 * densidad de copa. Devuelve `null` fuera de 0-78 %, que es el gradiente medido,
 * porque más allá la recta sólo extrapola.
 */
export function fraccionPorDoselManitou(densidad_copa_pct: number): number | null {
  if (densidad_copa_pct < 0 || densidad_copa_pct > 78) return null;
  const ago72 = CURVA_DOSEL_MANITOU.ECUACIONES[2];
  if (ago72 === undefined) return null;
  return Math.max(0, 1 - (Math.abs(ago72.b) / ago72.a) * densidad_copa_pct);
}

/**
 * La fracción aérea de la NPP, medida donde cuatro algoritmos publicaron las dos
 * mitades sobre la MISMA serie de cosechas.
 *
 * Fuente: ficha de sitio del ORNL DAAC, «NPP Grassland: Montecillo, Mexico,
 * 1984-1994, R1», Tabla 1 (https://daac.ornl.gov/NPP/guides/NPP_MNT.html). Las
 * cuatro filas son las cuatro publicaciones que la ficha compila, con su propia
 * advertencia al lado: «NPP values for MNT1 reported in other published accounts
 * differ due to different measurement and calculation methods».
 *
 * **Unidades.** Las tres primeras filas están en g de materia seca/m²/año y la
 * cuarta en g de carbono/m²/año. La cuarta NO se convierte a materia seca —no
 * hay factor publicado para este sitio— pero su COCIENTE se puede usar igual,
 * porque es carbono sobre carbono.
 *
 * **Rango de validez: ninguno más allá de este sitio.** Es un pastizal salino
 * casi puro de Distichlis spicata, en clausura sin pastoreo, con un incendio
 * accidental de febrero de 1986 adentro de la ventana promediada. No es una
 * constante de bioma y menos una constante global: es la única medida que hay de
 * cuánto discrepan los algoritmos cuando se los deja repartir la misma cosecha.
 *
 * **Qué se rompe si cambia:** nada calcula con esto todavía, a propósito. Está
 * acá porque es la razón por la que la cadena «NPP total × fracción aérea ×
 * fracción herbácea × fracción comible» no se puede construir con fracciones
 * publicadas, y eso hay que poder mostrarlo con números.
 */
export const FRACCION_AEREA_MONTECILLO = [
  { fuente: 'García-Moya y Montañez Castro (1992)', anpp: 669, bnpp: 1007, tnpp: 1676, carbono: false },
  { fuente: 'Scurlock y Olson (2013)', anpp: 1063, bnpp: 678, tnpp: 1741, carbono: false },
  { fuente: 'Scurlock et al. (2002), método de cálculo #5', anpp: 609, bnpp: 1174, tnpp: 1783, carbono: false },
  { fuente: 'GPPDI Class A Site #67, Olson et al. (2013a)', anpp: 130, bnpp: 97, tnpp: 227, carbono: true },
] as const;

/**
 * NPP total de Montecillo año por año, g MS/m²/año, con el mismo método.
 *
 * De la misma ficha: «1985 being the most productive (1,994 g/m2/yr). NPP fell to
 * 1,422 in 1986 after the fire and then rose to 1,611 g/m2/yr in 1987 during the
 * recovery phase». El promedio publicado de 1.676 es el de estos tres años, así
 * que **viene con un incendio adentro** y no es una media de régimen estable.
 *
 * Sirve para separar dos dispersiones que se confunden: el año mueve el total
 * 1,40× y el algoritmo lo mueve 1,06×, mientras el algoritmo mueve el reparto
 * arriba/abajo 1,79×. Lo frágil no es cuánto, es dónde.
 */
export const TNPP_MONTECILLO_POR_ANIO = [
  { anio: 1985, tnpp_g_ms_m2_anio: 1994, nota: 'el más productivo de los tres' },
  { anio: 1986, tnpp_g_ms_m2_anio: 1422, nota: 'incendio accidental en febrero' },
  { anio: 1987, tnpp_g_ms_m2_anio: 1611, nota: 'recuperación' },
] as const;

/** Cuánto de la producción aérea de un sitio es capa herbácea. */
export interface FraccionHerbacea {
  sitio: string;
  /** Producción anual de la capa herbácea, en la unidad publicada. */
  herbacea: number;
  /** Producción anual de TODO lo aéreo del rodal o del sitio, en LA MISMA unidad. */
  aerea_total: number;
  unidad: 'g_ms_m2_anio' | 'lb_acre_anio';
  /** Lo que la fuente publica del dosel, con sus palabras. */
  dosel: string;
  fuente: string;
}

/**
 * La segunda fracción de la cadena, y la que de verdad mueve el número.
 *
 * Tres sitios, los tres con numerador y denominador en la misma tabla y en la
 * misma unidad, así que el cociente no arrastra ninguna conversión:
 *
 * - el transecto OTTER de Oregón, por las fichas de sitio del ORNL DAAC: capa
 *   herbácea contra NPP del rodal, en g MS/m²/año;
 * - la ficha de sitio ecológico R081BY354TX del NRCS: gramíneas y hierbas contra
 *   el total del sitio, que incluye arbustos y árboles, en lb/acre/año.
 *
 * **De 0,0039 a 0,92: un factor 236.** Y no lo mueve el clima. Los dos sitios de
 * Oregón están a 200 km, producen casi lo mismo de rodal —1.540 y 1.630— y su
 * sotobosque difiere 6,8 veces, con la cobertura herbácea difiriendo 7,2.
 *
 * **Rango de validez.** Son tres puntos y dos de ellos del mismo transecto; no
 * hay una curva, hay dos puntas y un sitio en el medio. No interpolar: lo que la
 * bibliografía forestal publica son curvas de forraje contra cobertura de dosel
 * por tipo de bosque, y mientras no estén montadas esto sólo acota.
 *
 * **Qué se rompe si cambia:** nada calcula con esto. Es la justificación de por
 * qué `cobertura.ts` separa la clase 10 de la clase 30 con bandas en vez de dos
 * números, y de por qué el dosel es la variable que falta.
 */
export const FRACCION_HERBACEA_DEL_SITIO: readonly FraccionHerbacea[] = [
  {
    sitio: 'Waring’s Woods, rodal de Pseudotsuga, transecto OTTER',
    herbacea: 6,
    aerea_total: 1540,
    unidad: 'g_ms_m2_anio',
    dosel: 'dosel cerrado de conífera; 4,9 % de cobertura herbácea',
    fuente: 'ORNL DAAC — transecto OTTER, ficha de sitio',
  },
  {
    sitio: 'Cascade Head 1A, rodal de aliso rojo, transecto OTTER',
    herbacea: 41,
    aerea_total: 1630,
    unidad: 'g_ms_m2_anio',
    dosel: 'aliso rojo; 35,2 % de cobertura herbácea',
    fuente: 'ORNL DAAC — transecto OTTER, ficha de sitio',
  },
  {
    sitio: 'Very Shallow 23-31 PZ, MLRA 81B, Edwards Plateau',
    herbacea: 1840,
    aerea_total: 2000,
    unidad: 'lb_acre_anio',
    dosel: 'pradera de gramíneas medias con leñosas dispersas, comunidad de referencia 1.1',
    fuente: 'USDA NRCS — Ecological site R081BY354TX',
  },
] as const;

/** El cociente de una fila, sin conversiones: las dos cifras vienen en la misma unidad. */
export function fraccionHerbacea(f: FraccionHerbacea): number {
  return f.herbacea / f.aerea_total;
}

/** La fracción aérea de una fila de Montecillo. Vale también para la fila en carbono. */
export function fraccionAerea(f: { anpp: number; tnpp: number }): number {
  return f.anpp / f.tnpp;
}

/** Las mediciones que hay para un bioma global. Vacío es «no hay», y es común. */
export function medicionesDeBioma(bioma: string): MedicionForraje[] {
  return FORRAJE_MEDIDO.filter(m => m.bioma === bioma);
}
