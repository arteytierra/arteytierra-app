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
 * | Dakota, pradera de altura (ficha del NRCS) | 381–508 mm | 1.500–3.000 | 2.643–3.063 | parecía ir bien |
 * | Dakota, CGREC, el MISMO sitio ecológico, medido 17 años | 454 mm | 1.500 | 2.501–3.410 según el manejo | baja 1,7–2,3× |
 * | Texas, Edwards Plateau | 508–762 mm | 3.000–5.000 | 825–2.578 | alta 2–4× |
 * | Altiplano de Puno, 3.900 m | 410–1.119 mm | 1.500–7.000 | 626–1.958 | alta hasta 11× |
 * | Lesbos, fryganas | 354–797 mm | 1.500–5.000 | 300–5.800 | el rango medido es más ancho que la escalera entera |
 * | Tundra de Alaska y Yukón | no publicada | — | 350–960 | fuera de todo escalón |
 * | Delta del Paraná, albardón | 1.056 mm | 7.000 | 6.700–8.250 forrajera, 10.533 viva total del mismo muestreo | acierta contra la forrajera, 1,5× corta contra la total |
 *
 * En el norte de las Grandes Llanuras, con 381–508 mm, se miden casi 3.000
 * kg/ha/año; en el altiplano peruano, con MÁS lluvia, se miden 626. La
 * diferencia la explican el frío, el largo de la estación de crecimiento y la
 * profundidad del suelo, que la escalera no mira.
 *
 * **Y desde el lote 18 esta tabla ya no tiene ningún «va bien».** El único que
 * había era la fila de Dakota, y era un artefacto del rango: 381 a 508 mm cruza
 * el escalón de los 500 mm, así que la escalera devolvía «1.500 a 3.000» y el
 * medido caía adentro. El CGREC está en esa misma MLRA y en ese mismo sitio
 * ecológico —el mapa de suelos del punto lo correlaciona con `R053BY011ND`
 * «Loamy» de la MLRA `053B`— y publica **una** normal: 454 mm. Con un número en
 * vez de un rango la escalera devuelve 1.500, y diecisiete años de corte dan 2.501
 * a 3.410. Un rango de entrada ancho esconde el error de una escalera porque se
 * lleva dos escalones puestos; el acierto era del ancho y no de la escalera.
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
 * ## Lo que pone el manejo, medido con la carga animal
 *
 * El lote 16 midió el manejo por fertilización y estado del pastizal, y le salió
 * un factor 12. Faltaba el manejo que el usuario de acequia realmente decide: la
 * **carga animal**. El lote 18 lo trajo medido, con diecisiete años y cinco
 * intensidades en el mismo campo: `CONTRASTE_DE_CARGA`.
 *
 * Tres cosas de ahí, y la segunda es la que más vale:
 *
 * 1. **El manejo del pastoreo mueve la producción 1,36 veces**, con el mismo
 *    clima y el mismo suelo. Es mucho menos que el 12 de la fertilización y es la
 *    cifra relevante, porque es la que está en el rango de lo que un predio
 *    decide.
 * 2. **El coeficiente de uso admisible de acequia cae en el máximo medido.** Con
 *    454 mm `bandaUso` manda cosechar el 40 %, con piso de 35 %; el tratamiento
 *    que dejó más pasto en pie de los cinco es el de 35 % de cosecha. Es la
 *    primera vez que la tabla de Holechek se puede contrastar contra producción
 *    medida en vez de contra otra recomendación.
 * 3. **La pendiente contra la lluvia es una función del manejo.** En los sitios
 *    de lomada, el no pastoreado sube 46,31 kg/ha por cm de lluvia y los
 *    tratamientos moderado, fuerte y extremo **no se distinguen de cero**. Una
 *    función que sólo mira la lluvia no describe un campo pastoreado: describe
 *    uno en descanso.
 *
 * Y el descanso total produjo menos que el pastoreo liviano, 2.865 contra 3.410.
 * Eso **no se codifica**, y por qué no está en `CONTRASTE_DE_CARGA`: en el CPER,
 * el otro sitio de serie larga de este archivo, el mismo experimento dio lo
 * contrario, y el informe anterior de este mismo ensayo tampoco lo había visto.
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
 * ## El lote 13 trajo la fracción comible, y la trajo con dos denominadores
 *
 * La tercera fracción de la cadena —cuánto de la capa herbácea es comible— tiene
 * su primer valor verificado, y sale de un sitio que ya estaba en este archivo:
 * el pastizal de albardón de la isla de Baradero. El artículo publica, **en la
 * misma cosecha y en el mismo tratamiento**, 10.533 kg MS/ha de materia seca viva
 * total y 6.733 de materia seca viva forrajera. El cociente es **0,639**, y las
 * dos cifras están textuales en el cuerpo del artículo, no leídas de una figura.
 *
 * Lo que importa es lo que pasó al buscar ese mismo cociente en la tesis del
 * mismo trabajo. Su conclusión dice que la MS total del período primavera-verano-
 * otoño estuvo *«en el rango de 11200 y 11400 kg ha-1, de los cuales
 * aproximadamente entre 6700 kg (cosecha de verano del tratamiento S) y 8250 kg
 * (cosecha acumulada del tratamiento C) correspondieron a MS forrajera»*. De ahí
 * salen cuatro cocientes posibles, de 0,588 a 0,737, y **ninguno de los cuatro es
 * una fracción**: el 6.700 es una cosecha de verano y el 11.200 un total de tres
 * estaciones, así que numerador y denominador no cubren el mismo tiempo. El 8.250
 * es peor, porque es una suma de cosechas sucesivas: un flujo dividido por un
 * stock. Y el 11.200 incluye la materia seca MUERTA, que el método separa antes
 * de separar forrajera de no forrajera.
 *
 * El encargo del lote 13 había pedido un campo nuevo, `de_la_misma_tabla_que`,
 * justamente para poder auditar esto. Lo encontró en su primer uso, y lo encontró
 * acá adentro: la ficha del Delta decía «la MS total del mismo muestreo, que sí
 * suma las no forrajeras, da 11.200 a 11.400 kg/ha». No es del mismo muestreo y
 * no es sólo las no forrajeras. La cifra del mismo muestreo es 10.533. Corregido
 * abajo, y la diferencia entre 0,639 y el rango 0,588-0,737 es exactamente lo que
 * cuesta no mirar de qué tabla sale cada término.
 *
 * ## El bioma 7 llega medido por tercera vez, y por tercera vez no entra
 *
 * La sabana y el pastizal tropical es el bioma donde cae la mayoría de los predios
 * ganaderos del mundo, y el que este archivo persigue desde el lote 04. El lote 13
 * trajo las dos primeras mediciones uruguayas: la Unidad Experimental Glencoe del
 * INIA, campo natural sobre basalto, 32°00′24″ S 57°08′01″ W, `ECO_ID` 574,
 * Uruguayan savanna, **bioma 7 verificado contra RESOLVE**. Dos tratamientos —con
 * y sin Lotus— y un ensayo de consumo individual con TiO₂.
 *
 * No entran a `FORRAJE_MEDIDO`, y el motivo es el del lote 04 y no el del 12:
 * **miden lo que está parado, no lo que creció**. Lo publicado es masa en pie por
 * encima de 5 cm antes y después de un pastoreo de cinco días de primavera —1.387
 * y 2.372 kg MS/ha pre-pastoreo en los dos tratamientos—, no producción anual, y
 * el trabajo no publica la tasa de acumulación que haría falta para anualizarlas.
 * Un campo llamado `kg_ms_ha_anio_min` que recibiera 1.387 mentiría en la unidad,
 * que es el error que este archivo existe para no cometer.
 *
 * Además son fertilizadas: el fósforo del suelo se mantuvo en 10 ppm por
 * fertilización en los dos tratamientos, para estandarizar los potreros. Con
 * Towoomba son **dos de dos** en el bioma 7: toda medición de sabana que llegó
 * hasta acá con coordenada verificada, bioma verificado y fuente abierta resultó
 * ser un ensayo agronómico. No es casualidad y conviene escribirlo como criterio
 * de búsqueda: es el bioma donde está la ganadería, así que es el bioma donde
 * están los ensayos, y hay que ir a buscar el pastizal sin tratar.
 *
 * Tienen un segundo filo, más fino. Glencoe llueve **1.300 a 1.400 mm al año**, y
 * el lote 12 dejó escrita una afirmación que depende de que ningún sitio de secano
 * pase de 1.119: que los 1.300 mm de riego de la alfalfa de Curacó son más agua
 * que la lluvia de cualquier sitio de secano del archivo. La afirmación sobrevive
 * sólo porque Glencoe es `fertilizado` y no entra al conjunto de secano. El test
 * la dejó condicionada en vez de afirmada.
 *
 * Lo que las dos entradas sí dejan, y vale por sí solo, está en
 * `UTILIZACION_GLENCOE`.
 *
 * ## El bioma 7 entra, y lo que hubo que agregar para que entrara
 *
 * Al quinto lote. La sabana y el pastizal tropical —el bioma donde cae la mayoría
 * de los predios ganaderos del mundo— tiene por fin una medición montada: la
 * sabana de *Trachypogon* de la Estación Biológica de Los Llanos, en Calabozo,
 * Venezuela, con **375 g MS/m²/año de producción aérea**, o 3.750 kg/ha/año.
 * `ECO_ID` 572, Llanos, bioma 7 verificado contra RESOLVE.
 *
 * Entra donde Towoomba y Glencoe no entraron, y el motivo es simétrico a los de
 * ellas: **es un flujo anual y no una masa en pie**, y no es un ensayo
 * agronómico. Pero hizo falta agregar dos cosas al archivo para poder decir la
 * verdad sobre ella, y las dos son interesantes.
 *
 * **Primero, un valor de `insumos` que no afirma nada.** La ficha dice que en ese
 * trabajo se midieron parcelas quemadas, sin quemar *y el efecto del riego en la
 * estación seca*, y no dice qué le pasó a la parcela cuyo número se publica. El
 * tipo tenía cuatro valores y los cuatro afirmaban algo. Ahora hay
 * `desconocido`, que es lo que corresponde ante el silencio de la fuente;
 * `bandaDeClase` filtra por `secano`, así que esto queda afuera de las bandas sin
 * tocar una línea de cálculo.
 *
 * **Segundo, el campo `coordenada`.** Ver su propia documentación: `clase_wc`
 * decide la banda de cada clase de cobertura y el archivo no guardaba de dónde
 * había salido, así que ninguna asignación de clase se podía volver a revisar.
 *
 * Lo que la cifra NO dice, y hay que leerlo antes de usarla: el sitio es una
 * reserva protegida del pastoreo y del fuego desde 1960, y en enero de 1969 tenía
 * **100 g/m² de biomasa viva contra 1.025 de materia muerta en pie**. La
 * producción de la comunidad es ésa; lo que un animal encontraría ahí, no.
 *
 * ## Las dos coordenadas del lote 14 eran de un pueblo
 *
 * Y es el hallazgo que más lejos llega, porque no es sobre estos dos sitios.
 *
 * - La ficha del ORNL de Calabozo publica 8,93 N / 67,42 W como «study site». El
 *   píxel de ESA WorldCover ahí da **93 % construido**: es la ciudad. La propia
 *   ficha, cuatro párrafos más abajo, dice que el sitio está «about 10-km
 *   south-southeast of Calabozo». La coordenada que sirve es la otra que la misma
 *   ficha publica, la de la estación meteorológica, que está en la Estación
 *   Biológica: a 12,3 km de la primera, y ahí el pastizal es el 76, el 85 y el
 *   72 % de los píxeles a 500 m, 2 km y 5 km.
 * - El trabajo de Río Mayo publica 45°41′ S / 70°16′ W, **al minuto de arco**,
 *   que a esa latitud son ±1,5 km. Alrededor de ese punto hay 13 % de construido
 *   a 2 km —el pueblo— y la clase dominante se da vuelta según la ventana: 74 %
 *   pastizal a 500 m, 53 % a 2 km, y a 5 km lo pasa el suelo desnudo con 49 %.
 *
 * **La lección no es «verificar la coordenada»: es que una coordenada con formato
 * correcto no es una coordenada verificada.** Las dos tenían grados, minutos y
 * hemisferio bien puestos. Lo que las delató fue preguntarle al píxel qué hay
 * ahí. El criterio que quedó es la estabilidad: una clase que no cambia entre
 * 500 m, 2 km y 5 km se puede escribir, y una que cambia es `null`.
 *
 * ## El arbustal no avanzó, y el motivo es el que había que descubrir
 *
 * El lote 14 fue a buscar la clase 20, que es la banda más floja de las cuatro
 * —un solo sitio, factor 19— y la única que el usuario ya ve en pantalla. Trajo
 * una estepa **arbustiva**: 12 % de cobertura de arbustos, 25 % de gramíneas en
 * mata, tres especies leñosas medidas una por una.
 *
 * No alimenta la clase 20. El arbustal es el 9,4 %, el 6,5 % y el 3,1 % de los
 * píxeles en las tres ventanas, y **baja al ampliar**. Es decir: lo que un
 * agrónomo llama estepa arbustiva, el satélite lo llama pastizal.
 *
 * Eso cierra una puerta y abre otra. La banda de la clase 20 no se puede llenar
 * buscando trabajos que describan arbustos: hay que buscar sitios cuyo píxel sea
 * 20, que es una propiedad del mapa y no de la vegetación. Para el encargo
 * siguiente eso significa partir del producto —matorral mediterráneo cerrado,
 * chaparral, karoo, fynbos, *Artemisia* del Gran Cuenca— y no de la palabra
 * «arbustal» en un título.
 *
 * ## La primera medición debajo de 300 mm, y lo que le hace al primer escalón
 *
 * Río Mayo entra igual, y por otra puerta: con **191 mm**, es el sitio más seco
 * del archivo por lejos —el anterior era Lesbos con 354— y el primero que cae en
 * el primer escalón de `prodForrajera`, el de menos de 300 mm, que devuelve 700
 * kg MS/ha/año y nunca había tenido una medición que lo contradijera.
 *
 * Contra la capa de gramíneas, 530 kg/ha, la escalera se pasa 1,32 veces. Es el
 * mejor resultado que la escalera saca en todo este archivo, donde en el
 * altiplano se pasa once veces. Pero la medición trae algo que no se arregla
 * subiendo o bajando un escalón: **el mismo trabajo mide cuatro años más, con
 * lluvias de 55 a 167 mm, y la producción va de 21 a 75 g/m²/año.** Un factor
 * **3,6 adentro de un escalón que devuelve una constante**. Los cuatro años caen
 * en el mismo escalón que el año de 191 mm, y la escalera les da 700 a todos.
 *
 * Y los autores sacan la conclusión que le corresponde: «There was a large
 * reduction in ANPP during a year of extreme drought; however, there were no
 * increases in ANPP during years with above-average precipitation. This suggests
 * that the carrying capacity for the Patagonian steppe may not be linearly
 * related to precipitation». La respuesta a la lluvia es asimétrica: la sequía
 * baja la producción, la lluvia de más no la sube. Una escalera creciente no
 * puede representar eso, y una recta tampoco.
 *
 * ## Cincuenta años de un solo sitio, que es el experimento que faltaba
 *
 * Todo lo que hay más arriba en este archivo es un punto: un sitio, un año o dos,
 * una cifra. Con puntos de sitios distintos no se puede evaluar una función de la
 * lluvia, porque cada sitio cambia a la vez la lluvia y todo lo demás. El lote 15
 * trajo lo otro: **el mismo campo, cincuenta años**, en `SERIE_CPER`.
 *
 * Central Plains Experimental Range, estepa de pasto corto del norte de Colorado,
 * 1939 a 1990. Cien cifras —cincuenta de lluvia y cincuenta de producción— que
 * verifiqué de una forma que vale contar: **las ajusté por cuadrados mínimos y me
 * dieron la ecuación publicada**, `Forraje = 13 + 0,172 × lluvia` con r² = 0,39,
 * contra el 13,1 + 0,1722 y r² = 0,391 de mi ajuste. Si una sola de las cien
 * estuviera mal transcripta, los coeficientes no caerían ahí. El test lo repite.
 *
 * **Primer resultado: la lluvia anual explica el 39 %.** En un solo sitio, con el
 * mismo método, durante medio siglo. El otro 61 % lo reparten dos cosas que el
 * trabajo nombra: el tamaño de los eventos de lluvia —los de 15 a 30 mm solos dan
 * r² = 0,33, porque son los que mojan las capas que mandan— y el retardo, que es
 * lo que más duele acá: tras las sequías extremas de 1954 y 1964 llovió normal
 * —328 y 371 mm— y la producción siguió en 32 y 48 g/m² contra una media de 68.
 * **La producción de un año depende del estado en que la dejó el anterior**, y una
 * función de la lluvia del año no tiene dónde guardar eso.
 *
 * ## La asimetría, corregida dos veces: es del sitio
 *
 * El lote 14 dejó escrito, por Río Mayo, que la respuesta a la lluvia es
 * asimétrica: la sequía baja la producción y la lluvia de más no la sube. **En el
 * CPER no se replica**: agrupando por años secos, normales y húmedos, los secos
 * caen un 30 % y los húmedos suben un 30 %, simétrico. El lote 15 concluyó de ahí
 * que la observación de Río Mayo era un artefacto de cinco años con dos métodos.
 *
 * **El lote 16 mostró que esa segunda parte estaba mal**, trayendo los quince años
 * de Río Mayo con un solo método: la asimetría del total sigue ahí, los secos caen
 * un 35 % y los húmedos quedan 4 % abajo de los normales. No era un artefacto: es
 * una propiedad de ese campo, donde la lluvia de más se la llevan los arbustos.
 *
 * Así que la cadena de las tres lecturas termina en el medio. No se puede escribir
 * como propiedad general de la producción, que es lo que hizo el 14; y no se puede
 * declarar artefacto, que es lo que hice en el 15. **Dos sitios, dos respuestas, y
 * eso es el dato.**
 *
 * La asimetría que sí es general, porque es del modelo y no del campo, es otra
 * cosa y es peor para esta app: **es la del error de un modelo espacial.**
 *
 * ## La lápida de `prodForrajera`, y es una cita
 *
 * La Figura 2 del mismo trabajo publica dos rectas de ANPP contra lluvia anual:
 *
 * | modelo | ecuación | qué cambia entre sus puntos |
 * |---|---|---|
 * | regional, Sala et al. (1988) | `ANPP = −34 + 0,60 × P` | el sitio entero |
 * | largo plazo, CPER, 50 años | `ANPP = 56 + 0,13 × P` | sólo el año |
 *
 * **La pendiente del modelo espacial es 4,6 veces la del mismo sitio seguido medio
 * siglo.** (Esa razón es la que hace el propio trabajo; el lote 16 le puso una
 * condición que la baja a 2,7 y está dos secciones más abajo.) Y el trabajo dice
 * qué consecuencia tiene: «These vegetation structure
 * constraints on ANPP explain why, under dry conditions, the regional model
 * underestimates ANPP and under wet conditions, overestimates ANPP». A la lluvia
 * máxima observada en el CPER el regional predice **300 g/m² y el de largo plazo
 * 130**, una diferencia que el artículo reporta como significativa.
 *
 * `prodForrajera` es un modelo espacial: sus escalones salen de comparar lugares.
 * Y con esos mismos 588 mm **devuelve 3.000 kg MS/ha, que son 300 g/m²**: cae
 * sobre la predicción regional, que es la que este trabajo midió como demasiado
 * alta para ese campo. No es mérito ni casualidad del cálculo, es lo que le pasa a
 * cualquier función que intercambie espacio por tiempo, y el artículo lo llama
 * «a weakness of exchanging space for time in predicting production patterns».
 *
 * Sobre los cincuenta años, la escalera **se pasa en 35 de 50**, con una mediana
 * de 1,27 veces y un peor año de 2,62. Lo que está mal no es dónde están los
 * escalones: es que la pendiente de la familia a la que pertenece es cuatro veces
 * y media la que mide un campo real.
 *
 * ## Y una trampa de unidades que casi me come
 *
 * La Tabla 1 publica dos columnas de producción: forraje en **aire-seco** y ANPP
 * en **estufa-seco**. La conversión que da el trabajo no es un factor: es
 * `ANPP = 46 + 0,76 × forraje`, con ordenada al origen de 46 g/m². El cociente
 * entre las dos columnas va de **2,85 en el año más flaco a 1,12 en el más
 * gordo**, así que elegir la columna equivocada no escala la serie: **le cambia la
 * forma**, que es justamente lo que se está midiendo. La entrada montada usa la de
 * estufa. Y esa recta es lo más flojo del trabajo, que lo declara: r² = 0,28 sobre
 * catorce años, «the most important assumption for this analysis».
 *
 *
 * ## La segunda serie larga dice que la capa que importa no responde a la lluvia
 *
 * El lote 16 trajo lo que el encargo pedía: una segunda serie de años seguidos
 * del mismo campo, para ver si la pendiente temporal baja siempre tanto. Es
 * `SERIE_RIO_MAYO`, quince años de la estepa patagónica, Tabla 2 de Jobbágy y
 * Sala (2000). Y trajo de más algo que no estaba pedido y que vale más: **tiene
 * las capas separadas todos los años.**
 *
 * | lo que se ajusta contra la lluvia anual | pendiente | r² |
 * |---|---|---|
 * | **gramíneas**, 15 años | **0,024** | **0,015** |
 * | arbustos, 10 años | 0,125 | 0,728 |
 * | total, 10 años | 0,141 | 0,346 |
 *
 * `prodForrajera` predice **forraje**. En el único sitio del archivo donde el
 * forraje está medido aparte todos los años, la lluvia anual explica el 1,5 % de
 * su variación. Lo que responde a la lluvia es la leñosa, con el 73 %. Y los
 * autores lo dicen: «The differential effect of precipitation on grass and shrub
 * ANPP masked the association when these functional groups were pooled».
 *
 * Eso reordena el problema. Hasta el lote 15 la pregunta era qué pendiente poner;
 * ahora la pregunta es si la lluvia anual sirve para la capa herbácea. En el CPER
 * sí —ahí la columna es forraje y da r² = 0,39— y en Río Mayo no. La diferencia
 * entre los dos sitios es que uno tiene arbustos compitiendo por el agua profunda
 * y el otro no.
 *
 * **Y hay un corolario que un predio nota:** en un año lluvioso, en un sitio con
 * leñosas, el agua de más no va al forraje. La fracción herbácea de Río Mayo cae
 * de 0,60 a 0,28 entre el año más seco y el más húmedo de la serie.
 *
 * ## La memoria tiene coeficiente, y es el mismo campo del lote 15
 *
 * El lote 15 cerró diciendo que a `prodForrajera` «lo que le falta no es otra
 * variable: es memoria». El lote 16 lo trajo publicado y con número, sobre la
 * misma serie del CPER: `ANPP(t) = 14,8 + 0,13 × pp(t) + 0,41 × ANPP(t−1)`,
 * de Oesterheld, Loreti, Semmartin y Sala (2001). Está en
 * `MODELO_CON_MEMORIA_CPER`, y conviene mirar tres cosas.
 *
 * **La primera es cómo se verificó.** La entrega declaró que este modelo no se
 * podía re-ajustar con lo que hay en este archivo. Sí se podía: pasando la columna
 * de forraje de `SERIE_CPER` por `anppDeForraje`, el ajuste da 14,92 + 0,1303 pp +
 * 0,4085 ANPP(t−1), con r² = 0,581, F(2,44) = 30,5 y n = 47, contra 14,8 / 0,13 /
 * 0,41 / 0,58 / 30,4 / 47 publicados. Los siete números.
 *
 * **La segunda es qué se lleva la memoria.** La pendiente de la lluvia no cambia:
 * es 0,13 con memoria y sin memoria. Lo que cambia es la ordenada, de 55,8 a 14,8.
 * El término de memoria ocupa exactamente el lugar del nivel. Eso dice en qué
 * forma tiene que ser el reemplazo: la lluvia pone el incremento, el estado
 * anterior pone el nivel.
 *
 * **La tercera es que corrige un número que escribí yo.** El lote 15 dijo que la
 * pendiente espacial es 4,6 veces la temporal, comparando 0,60 contra 0,13. El
 * 0,13 es la respuesta de un año a un mm de más; el 0,60 compara sitios que ya
 * están acomodados a su lluvia. La comparación justa es contra el equilibrio del
 * mismo modelo, que da 0,22, y entonces la razón es **2,7 y no 4,6**. Sigue
 * siendo casi el triple y sigue siendo el problema, pero más de un tercio del 4,6
 * era comparar un año contra un siglo.
 *
 * ## Lo que el manejo vale, que es más que el clima
 *
 * `CONTRASTE_DE_MANEJO` es la pieza que faltaba y que no era sobre la forma de la
 * curva. Tres pares de parcelas vecinas del mismo sitio, con el mismo clima,
 * promediadas sobre 27 a 30 años: el estado del pastizal lleva la producción a
 * **0,31** y la fertilización alta a **3,79**. Un factor 12 entre las puntas.
 *
 * Para comparar: en el CPER, cincuenta años de lluvia de 107 a 588 mm mueven la
 * producción un factor 5,8. **El manejo pesa más que toda la variación climática
 * de medio siglo en un sitio**, y `prodForrajera` no tiene dónde ponerlo.
 *
 * El par que más importa es el de Bloemfontein, porque no es fertilización: las
 * parcelas en mal estado se armaron sacando especies a mano para representar
 * «grazing regimes of increasing intensity». Es un modelo experimental del
 * sobrepastoreo sostenido 29 años, y la producción cae a un tercio con la misma
 * lluvia.
 *
 * ## Un píxel de arbustal, y por qué no sirve
 *
 * El lote 14 cerró diciendo que la banda de la clase 20 no se llena buscando
 * trabajos sobre arbustos, porque la clase es una propiedad del mapa: hay que
 * buscar sitios cuyo píxel sea 20. El lote 16 encontró uno —Towoomba, 66 / 53 /
 * 44 % de arbustal en las tres ventanas— y es el segundo del archivo.
 *
 * **Y no sirve, por el motivo exactamente inverso al de Río Mayo.** La fuente
 * dice: «The site was cleared of all woody species at the start of the
 * experiment», en 1949. El píxel describe el bushveld de alrededor; la parcela
 * medida tiene 58 m², menos que un píxel, y está desmontada desde hace setenta
 * años.
 *
 * Así que la pinza queda cerrada por los dos lados. Lo que un agrónomo llama
 * estepa arbustiva, el mapa lo llama pastizal; y lo que el mapa llama arbustal,
 * el experimento puede haberlo desmontado. **La estrategia de partir del píxel
 * sigue siendo la correcta y ahora tiene su primera trampa documentada: hay que
 * preguntarle a la fuente qué le hicieron a la parcela.**
 *
 * ## Y de paso se cerró una pregunta del lote 05
 *
 * Ese mismo Towoomba es el de la sección «Towoomba contra Nylsvley». El lote 05
 * había marcado como «el reintento más valioso» que Towoomba produjera 2,6 veces
 * lo de Nylsvley estando a 60 km, en la misma ecorregión y con 6 mm de diferencia
 * de lluvia. El lote 05 lo resolvió mostrando que la cifra de la compilación
 * —198 g/m²/año— era de la fila `P0N3`, un tratamiento fertilizado. Lo que no
 * tenía era el control.
 *
 * Ahora está, y son tres cifras del mismo ensayo que se ordenan como tienen que
 * ordenarse: **control 137, sólo nitrógeno 198, nitrógeno más fósforo 519.**
 *
 * Y eso matiza la conclusión del lote 05. Contra los 76 g/m²/año de pasto comible
 * de Nylsvley, el control de Towoomba produce **1,8 veces**, no 2,6. El
 * fertilizante explicaba parte de la diferencia y no toda. Lo que queda tiene dos
 * candidatos, los dos ya escritos en este archivo: Towoomba está desmontado desde
 * 1949, y la ficha de Nylsvley avisa que su propia cifra «may have substantially
 * underestimated» la productividad del sitio. **Dos sitios a 60 km en la misma
 * ecorregión siguen sin ser comparables, y ahora se sabe que no es por el
 * fertilizante.**
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
 * dos están medidas en la MISMA cosecha, la total es **1,56 veces** la forrajera
 * —10.533 contra 6.733 kg/ha—, porque el abrojo grande y las demás no forrajeras
 * se llevan una parte grande del pastizal degradado. Pasar una total a un cálculo
 * de carga animal como si fuera forraje sobreestima un 56 %.
 *
 * **El 11.200 a 11.400 que anduvo dando vueltas por este archivo no es ese
 * número.** Es el total del período primavera-verano-otoño e incluye la materia
 * seca muerta; dividir por él da 1,36 a 1,70 y no significa nada. El lote 13 lo
 * corrigió en la ficha del Delta y **lo dejó escrito acá y en la tabla de arriba**,
 * que es como se propaga un error entre comentarios del mismo archivo: lo arregló
 * el lote 14 buscando TODAS las apariciones y no la que tenía a la vista.
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
export type Insumos =
  | 'secano'
  | 'fertilizado'
  | 'riego'
  | 'riego_y_fertilizado'
  /**
   * La fuente no lo dice, y por eso no se asume.
   *
   * Lo agregó el lote 14 y lo pedía un caso concreto: la ficha del ORNL de
   * Calabozo informa que en ese trabajo se midieron parcelas quemadas, sin
   * quemar **y el efecto del riego en la estación seca**, y no dice cuál de las
   * tres cosas le pasó a la parcela cuyo número se publica. El archivo tenía
   * cuatro valores y los cuatro afirmaban algo; faltaba el que no afirma nada.
   *
   * `bandaDeClase` filtra por `=== 'secano'`, así que esto queda afuera de las
   * bandas por construcción y no hace falta tocar nada más. **Es el valor que
   * hay que usar ante el silencio de la fuente**, nunca `secano`: un sitio sin
   * insumos declarados y un sitio declarado sin insumos no son lo mismo.
   */
  | 'desconocido';

/**
 * Qué es, exactamente, el número que hay en `lluvia_mm_min` y `lluvia_mm_max`.
 *
 * Lo agregó el lote 15 y lo pidieron tres tests de este módulo que se
 * contradijeron entre sí en cuanto entró una serie de cincuenta años. El campo de
 * lluvia guardaba **cinco cosas distintas** y nada en el código las separaba:
 *
 * - `anio_medido` — la lluvia del año o los años en que se cosechó. Es la que
 *   explica la cifra de producción que está al lado.
 * - `rango_de_anios` — las puntas observadas en una serie larga del mismo lugar.
 *   **No es un sitio seco y un sitio húmedo: es el mismo sitio en años distintos.**
 * - `rango_de_sitios` — el ancho entre los sub-sitios que la cifra promedia. En
 *   Puno son dos estaciones separadas por 400 m de altura.
 * - `normal_publicada` — una media de largo plazo o el rango climático que publica
 *   la ficha de la región. No es lo que llovió cuando se midió.
 * - `agua_de_riego` — **no es lluvia.** La alfalfa de Curacó recibió 1.300 mm por
 *   melgas y ese número vive en el campo de lluvia porque es el agua que recibió
 *   el cultivo. Estaba dicho en un comentario y era invisible para cualquier test.
 *
 * Y es `null` exactamente cuando la lluvia es `null`.
 *
 * **Qué se rompe si esto se ignora:** comparar sitios por lluvia sin mirar este
 * campo compara un año seco de una serie contra la normal de otro lugar, o le pasa
 * agua de riego a un modelo de precipitación.
 */
export type QueEsLaLluvia =
  | 'anio_medido'
  | 'rango_de_anios'
  | 'rango_de_sitios'
  | 'normal_publicada'
  | 'agua_de_riego';

export interface MedicionForraje {
  /** Bioma global de RESOLVE al que pertenece el sitio medido. */
  bioma: string;
  /** Rótulo corto del sitio, para poder nombrarlo en pantalla. */
  sitio: string;
  /**
   * La coordenada que **publica la fuente**, textual, o `null` si no publica
   * ninguna.
   *
   * Lo agregó el lote 14 por un defecto de este archivo: `clase_wc` decide la
   * banda de cada clase de cobertura y **no se guardaba de dónde había salido**,
   * así que ninguna asignación de clase se podía volver a revisar. El único sitio
   * de la clase 20 llevaba un comentario que decía «frygana: arbustal» y nada más.
   *
   * Las catorce entradas anteriores al lote 14 quedan en `null` porque sus
   * coordenadas están en los veredictos de `_research` y no acá; eso no las
   * invalida, pero sí marca cuáles no se pueden auditar sin volver a la fuente.
   *
   * **Tener coordenada no alcanza, y el lote 14 lo mostró dos veces.** Las dos
   * que llegaron eran de un pueblo y no del sitio: la de Calabozo cae con un
   * 93 % de píxeles construidos porque es la ciudad, y la propia ficha dice que
   * el sitio está «unos 10 km al sur-sudeste». Una coordenada se verifica
   * preguntándole al píxel qué hay ahí, no mirando si tiene el formato correcto.
   */
  coordenada: string | null;
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
  /** Qué clase de número es ese par. `null` sólo si la lluvia es `null`. */
  lluvia_que_es: QueEsLaLluvia | null;
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
 * Son **veintidós sitios en ocho de los quince biomas** de RESOLVE, al
 * 21/10/2026. No son un modelo: son los puntos que hay. Cuatro de los veintidós
 * son sotobosque de bosque cerrado y no pastizal, y eso cambia cómo se leen: ver
 * `ms_sotobosque`. Cada uno declara además su `clase_wc`, su `coordenada` y sus
 * `insumos`, que es de donde `cobertura.ts` saca la banda de cada clase de
 * cobertura.
 *
 * **Doce de los veintidós alimentan una banda, y los diez que no lo hacen son más
 * interesantes que los doce.** Siete están en la clase 30, uno en la 20, cuatro
 * en la 10. Afuera quedan: dos cultivos, porque uno está fertilizado y el otro
 * regado; seis con `insumos` en `desconocido` —la sabana de Calabozo, la estepa
 * de pasto corto del CPER, los pastizales de Bloemfontein y Towoomba y los dos
 * sitios ecológicos del CGREC—; y dos con `clase_wc` en `null`, la estepa de Río
 * Mayo y el pastizal de Ukulinga. Las diez exclusiones las hace un filtro y no un
 * juicio, que es la única forma de que sigan valiendo cuando nadie se acuerde de
 * por qué están.
 *
 * **Los dos del lote 18 son los que más duele dejar afuera.** Diecisiete años,
 * cinco intensidades de pastoreo, dos sitios ecológicos, coordenada que cae donde
 * dice y un píxel de clase 30 estable al 91, 85 y 85 % en las tres ventanas: es
 * la entrada mejor ubicada del archivo. Quedan afuera porque el trabajo **no
 * menciona la fertilización ni una vez**, y el silencio no se traduce a `secano`.
 * Lo que sí se pudo derivar es la mitad de la duda: una parcela regada no puede
 * responder a la lluvia del año agrícola con una pendiente significativa, y la de
 * ellas es 28,63 kg/ha por cm. Falta la otra mitad.
 *
 * **Los tres que entraron en el lote 16 están los tres afuera, y por tres motivos
 * distintos.** Son pastizales medidos 29, 27 y 30 años, que es más dato del que
 * tiene casi cualquier otra entrada de este archivo, y ninguno alimenta una banda:
 * Bloemfontein porque la serie junta dos lugares a 5 km y la coordenada publicada
 * no cae en ninguno; Ukulinga porque la coordenada publicada tiene los dos números
 * permutados y la permutación correcta da un píxel de bosque; Towoomba porque su
 * píxel es clase 20 pero el ensayo desmontó las leñosas en 1949. **El cuello de
 * botella de este archivo ya no es encontrar mediciones: es poder ubicarlas.**
 *
 * Dos de los veintidós traen algo que los otros veinte no: **años consecutivos
 * del mismo campo**. `SERIE_CPER` tiene cincuenta y `SERIE_RIO_MAYO` quince, y
 * son lo único de este archivo con lo que se puede evaluar una función de la
 * lluvia sin cambiar de sitio en cada punto. Los dos del CGREC traen otra cosa:
 * diecisiete años **de cinco manejos a la vez**, que es lo único con lo que se
 * puede evaluar cuánto del número lo pone el manejo y no el clima.
 *
 * Manitou aparece dos veces y es deliberado: las parcelas bajo dosel y las
 * aberturas del mismo bosque, el mismo día y con el mismo método, difieren 13
 * veces. El clima no explica nada de eso. **El bioma que más se pastorea —la
 * sabana tropical— ya tiene uno**, desde el lote 14, y cómo llegó está en la
 * sección «El bioma 7 entra».
 */
export const FORRAJE_MEDIDO: readonly MedicionForraje[] = [
  {
    bioma: 'resolve_pastizal_templado',
    sitio: 'Loamy Upland, MLRA 53B, Dakota del Norte y del Sur',
    coordenada: null,
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
    // 15 a 20 pulgadas: es el rango climático que publica la MLRA, no lo que
    // llovió en el año de la medición.
    lluvia_que_es: 'normal_publicada',
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
    coordenada: null,
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
    // La tabla climática de la ficha, que además se contradice con el nombre
    // del sitio. No es la lluvia de un año medido.
    lluvia_que_es: 'normal_publicada',
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
    coordenada: null,
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
    // No es un rango de años: son las dos estaciones, separadas por 400 m de
    // altura. El 1.119 es de La Raya y el 410 de Chuquibambilla.
    lluvia_que_es: 'rango_de_sitios',
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
    coordenada: null,
    // Frygana: arbustal, y es la ÚNICA medición de la clase 20. La cifra está
    // escalada a la hectárea del potrero —la jaula por el porcentaje de
    // cobertura herbácea de ese potrero—, así que es producción herbácea por
    // hectárea de arbustal y no de los claros entre arbustos.
    //
    // El lote 14 fue a ver de dónde salía ese 20, porque el comentario sólo
    // decía «frygana». Sale de mejor lugar que eso: el propio trabajo publica el
    // reparto de cobertura del área de estudio —«Land cover is dominated by
    // shrublands and phrygana vegetation amounting to 76% of the area, while the
    // rest comprises 17% olives and oak trees plots and 6.7% alluvial plains
    // cultivated with annual crops»—, que es una cifra de cobertura y no un
    // nombre de vegetación. NO publica coordenada, así que el píxel no se puede
    // consultar y el 76 % es lo mejor que hay. Nueve de los catorce potreros son
    // «improved» por terrazas, despiedre y cultivo previo, y ninguna de esas
    // mejoras es fertilizante ni riego: de ahí que `insumos` siga en `secano`.
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
    lluvia_que_es: 'anio_medido',
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
    coordenada: null,
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
    lluvia_que_es: null,
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
    coordenada: null,
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
    lluvia_que_es: 'normal_publicada',
    temp_media_c_anual: null,
    metodo: 'Tres clausuras de 4 × 4 m separadas unos 20 m, con boyero a 30 y 70 cm, cada una dividida en dos tratamientos: cortes bimestrales de la vegetación a 7 cm de altura y sin cortes. Afuera, pastoreo continuo con alta carga. Se muestreó por estación agronómica cortando con tijera de podar el material arraigado dentro de un aro, dejando 7 cm de remanente; secado en estufa a 65 °C hasta peso constante y pesado con precisión de ±1 g. La tasa de crecimiento se calculó por diferencia de forraje disponible entre corte y corte. El área del aro de muestreo NO está indicada en el texto de la tesis, así que la conversión a kg/ha no se puede recalcular desde acá.',
    que_cuenta: 'Materia seca VIVA de las especies forrajeras, cosechada por encima de los 7 cm. No incluye las no forrajeras —en este pastizal degradado el abrojo grande, Xanthium cavallinesii, es el que más crece en verano—, ni la materia seca muerta, ni nada por debajo de la altura de corte, ni raíces. No descuenta uso admisible. La MS viva total del MISMO muestreo —la que sí suma las no forrajeras— da 10.533 kg/ha, así que la fracción forrajera de esa cosecha es 0,639; ver `FRACCION_COMIBLE`. El rango de 11.200 a 11.400 kg/ha que publica la conclusión de la tesis es otra cosa y por partida doble: es el total del período primavera-verano-otoño, no de una cosecha, e incluye la materia seca muerta.',
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
    coordenada: null,
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
    // Media anual publicada por la ficha, no el total del año cosechado.
    lluvia_que_es: 'normal_publicada',
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
    coordenada: null,
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
    // Las dos temporadas medidas, 2010 y 2011. Es lo que se deduce del propio
    // alcance de la entrada; no volví a la fuente a confirmar cuál es cuál.
    lluvia_que_es: 'anio_medido',
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
    coordenada: null,
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
    lluvia_que_es: null,
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
    coordenada: null,
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
    lluvia_que_es: null,
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
    coordenada: null,
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
    // Media de 65 años de la estación, no el año de la cosecha.
    lluvia_que_es: 'normal_publicada',
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
    coordenada: null,
    clase_wc: 30,
    insumos: 'secano',
    tipo: 'ms_herbacea_total',
    // 465, 474 y 587 lb/acre. Sin típico: la tesis no elige uno.
    kg_ms_ha_anio_min: 521,
    kg_ms_ha_anio_max: 658,
    kg_ms_ha_anio_tipico: null,
    lluvia_mm_min: 396,
    lluvia_mm_max: 396,
    lluvia_que_es: 'normal_publicada',
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
    coordenada: null,
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
    lluvia_que_es: 'anio_medido',
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
    coordenada: null,
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
    lluvia_que_es: 'agua_de_riego',
    temp_media_c_anual: null,
    metodo: 'Diez cultivares de distinto grado de reposo invernal en bloques aleatorizados con cuatro repeticiones, parcelas de 6 m² (1 × 6 m) con cinco surcos a 0,20 m, implantadas el 11/04/2013. Cortes al 10 % de floración o cuando los rebrotes de corona llegaban a unos 5 cm: cinco cortes, el 06/11/2013, 29/11/2013, 04/02/2014, 25/03/2014 y 05/05/2014. La cifra anual es la suma de los cinco. Diferencias por LSD de Fisher p<0,05; no publica error estándar.',
    que_cuenta: 'Materia seca aérea cosechada de una alfalfa implantada, que es un cultivo puro de una especie forrajera: a diferencia de un pastizal natural, acá no hay fracción no forrajera que descontar. No es consumo y no es campo natural.',
    estacionalidad: 'Cinco cortes de noviembre a mayo, y el reparto es muy desigual: el promedio de los diez cultivares da 3.561, 3.149, 3.162, 3.983 y 6.027 kg MS/ha. El último corte, el de mayo, aporta el 30 % del año.',
    donde_deja_de_valer: 'Un sitio y una temporada, bajo RIEGO GRAVITACIONAL: la fuente informa unos 1.300 mm aplicados por melgas cada quince días desde el 30 de agosto. Eso es más agua que la lluvia anual de cualquiera de los doce sitios de SECANO de este archivo —el techo de todos es el 1.119 mm de la puna de Puno—, en una zona del Monte donde la lluvia natural no llega a la mitad. Dicho con cuidado, porque la afirmación ya zafó dos veces por un tecnicismo del filtro y no por el clima: Glencoe llueve 1.300 a 1.400 mm y queda afuera por fertilizada, y Calabozo llueve 1.257 y queda afuera porque sus insumos son `desconocido`. Lo que se sostiene sin asteriscos es la versión que le importa a `bandaDeClase`: es más agua que la lluvia de cualquier sitio que ENTRE a una banda. La propia fuente dice que las diferencias de producción fueron independientes del grado de reposo invernal. No estima el potencial de secano, y por eso `insumos` es `riego`.',
    medido_en: 'temporada 2013-2014',
    fuente: {
      label: 'Zamora, C. D. et al. — «Evaluación de la producción de materia seca en variedades de alfalfa (Medicago sativa) de diferentes grados de reposo invernal, en el área bajo riego de 25 de Mayo, La Pampa» (p. 332 y Cuadro 1)',
      url: 'https://repositorio.inta.gob.ar/xmlui/bitstream/handle/20.500.12123/674/CR%20La%20Pampa-San%20Luis_EEA%20Anguil_Zamora_CD_Evaluaci%C3%B3n%20de%20la%20producci%C3%B3n%20de%20materia%20seca.pdf?isAllowed=y&sequence=1',
    },
  },
  {
    // El bioma 7 entra al archivo después de cuatro lotes, y entra porque esta
    // vez la cifra es un flujo anual y no una masa en pie. Ver la sección «El
    // bioma 7 entra, y lo que hubo que agregar para que entrara».
    bioma: 'resolve_sabana_tropical',
    sitio: 'Sabana de Trachypogon, Estación Biológica de Los Llanos, Calabozo, Venezuela',
    // La ficha publica DOS coordenadas y hay que elegir con cuidado. La del
    // «study site», 8,93 N / 67,42 W, **es la ciudad de Calabozo**: el píxel de
    // WorldCover ahí da 93 % construido, y la propia ficha dice que el sitio
    // está «about 10-km south-southeast of Calabozo». La que va acá es la otra,
    // la de la estación meteorológica, que la ficha ubica EN la Estación
    // Biológica de Los Llanos, que es donde dice que está el sitio. Están a
    // 12,3 km una de la otra, con rumbo 117°.
    coordenada: '8,88 N, 67,32 W (estación meteorológica de la Estación Biológica; la ficha publica además 8,93 N / 67,42 W para el «study site», que es la ciudad)',
    // Clase 30 y es una asignación estable, que es el criterio: alrededor de la
    // coordenada de la estación biológica el pastizal es el 75,7 % a 500 m,
    // el 84,5 % a 2 km y el 71,6 % a 5 km, con el arbustal entre 0,6 y 9,7 %.
    // No cambia de clase según la ventana, a diferencia de Río Mayo.
    clase_wc: 30,
    // `desconocido` y no `secano`, y la diferencia la hace una sola frase de la
    // ficha: «Burned and unburned plots were measured, **as well as the effect
    // of irrigation during the dry season**». El archivo de la parcela sin
    // quemar trae `Treatmt = none`, pero ese campo distingue el fuego —el otro
    // archivo dice `burned`— y no dice nada del riego. Si alguien abre San José
    // y Medina (1976) y confirma que la parcela sin quemar no se regó, esto pasa
    // a `secano` **y entonces hay que reescribir la afirmación del lote 12**,
    // porque 1.257 mm es más que el 1.119 de Puno.
    insumos: 'desconocido',
    tipo: 'npp_herbacea',
    // 375 g MS/m²/año de producción AÉREA. La ficha publica también 307 bajo
    // tierra y 682 de total, y ésos no son esto: el 682 es el número que se
    // encuentra citado por ahí, y confundirlos infla el forraje 1,8 veces.
    kg_ms_ha_anio_min: 3750,
    kg_ms_ha_anio_max: 3750,
    kg_ms_ha_anio_tipico: 3750,
    // «mean annual precipitation of 1,257 mm», serie 1968-1986 de la estación de
    // la propia Estación Biológica.
    lluvia_mm_min: 1257,
    lluvia_mm_max: 1257,
    // Media 1968-1986, no el total de 1969, que es el año de la cifra.
    lluvia_que_es: 'normal_publicada',
    // La ficha publica «mean annual minimum-maximum temperatures of 22.0-36.0 C»,
    // que son la mínima y la máxima y NO promedian a la media anual. Es el mismo
    // caso que documenta `temp_media_c_anual`, y van tres fichas del ORNL así.
    temp_media_c_anual: null,
    metodo: 'Cosechas mensuales de biomasa aérea viva y materia muerta total del 15 de enero al 15 de octubre de 1969, más una estimación única de biomasa subterránea, en la parcela SIN QUEMAR (`clb1_npp.txt`). La producción primaria neta aérea anual que publica la ficha —375 g MS/m²/año— es un recálculo sobre esas cosechas atribuido a Scurlock y Olson (2012) sobre los datos de San José y Medina (1976). La propia ficha avisa que los datos se leyeron de gráficos publicados, así que el último dígito puede estar errado.',
    que_cuenta: 'Producción primaria neta AÉREA de la sabana de Trachypogon vestitus, con árboles dispersos de Curatella americana, Bowdichia virgilioides y Byrsonima crassifolia. No incluye la producción subterránea, que la misma ficha estima en 307 g/m²/año. No descuenta uso admisible, palatabilidad ni acceso, y no es consumo.',
    estacionalidad: 'Serie mensual de enero a octubre de 1969; acá va la estimación anual publicada. El dato de enero dice lo que la cifra anual esconde: 100 g/m² de biomasa viva contra 1.025 de materia muerta en pie.',
    donde_deja_de_valer: 'Un año y una parcela de reserva: el sitio de 260 ha «has been protected from grazing and burning since 1960, although occasional natural fires ignite during the dry season». Nueve años sin fuego en una sabana de Trachypogon dejan la hojarasca parada, y por eso la cifra describe lo que la comunidad produce y NO lo que un animal encontraría: en enero de 1969 había diez veces más materia muerta que viva. La parcela quemada del mismo año da 755 g/m²/año de NPP total contra 682 de la sin quemar, así que el fuego subió el total un 11 %; la ficha no publica el reparto aéreo/subterráneo de la quemada, así que no se puede decir cuánto de eso fue aéreo. Y para 1986/87 la misma parcela sin quemar da NPP total de 823 a 1.310, de 1,2 a 1,9 veces la de 1969. La propia ficha avisa que Esser (2013) y Olson et al. (2013) publican valores distintos del mismo sitio por usar otros métodos de cálculo.',
    medido_en: '15 de enero al 15 de octubre de 1969',
    fuente: {
      label: 'ORNL DAAC — NPP Grassland: Calabozo, Venezuela, 1969-1987, R1 (ficha de sitio), sobre datos de San José y Medina (1976)',
      url: 'https://daac.ornl.gov/NPP/guides/NPP_CLB.html',
    },
  },
  {
    bioma: 'resolve_pastizal_templado',
    sitio: 'Estepa arbustiva de Río Mayo, distrito Occidental, Chubut',
    // Al MINUTO de arco, que a 45° S son ±1,85 km en latitud y ±1,29 km en
    // longitud. Por eso `clase_wc` queda en `null`: ver el comentario de abajo.
    //
    // **El lote 16 la confirmó por una segunda fuente y con más precisión.** La
    // ficha del ORNL DAAC del mismo sitio publica 45,68 S / 70,27 W en decimales,
    // que es el mismo punto: 45°41′ son 45,683 y 70°16′ son 70,267. Sobre esa
    // versión el píxel da 65,8 / 61,5 / 41,5 % de pastizal en las tres ventanas
    // y el suelo desnudo lo pasa a 5 km con el 47,4 %, igual que con la otra.
    // **El veredicto no se mueve, y eso es lo que se le pide a un criterio:**
    // 400 metros de diferencia cambian los porcentajes y no cambian la decisión.
    coordenada: '45°41′ S, 70°16′ W (al minuto de arco: ±1,5 km); 45,68 S / 70,27 W en la ficha del ORNL del mismo sitio',
    // `null`, y el motivo es que la clase NO es estable en la escala de la
    // incertidumbre de la coordenada: alrededor del punto publicado el pastizal
    // es el 74,4 % a 500 m, el 52,7 % a 2 km y el 40,0 % a 5 km, donde lo pasa
    // el suelo desnudo con el 48,8 %. Además aparece un 13,2 % de construido a
    // 2 km, que es el pueblo de Río Mayo.
    //
    // **Lo que sí quedó firme es el negativo, y era el objetivo del encargo:**
    // el arbustal es el 9,4 %, el 6,5 % y el 3,1 % en las tres ventanas, y BAJA
    // al ampliar. Una estepa que la fuente describe con 12 % de cobertura de
    // arbustos no es un píxel de clase 20, así que esta medición no alimenta la
    // banda del arbustal, que sigue con un solo sitio.
    clase_wc: null,
    // El trabajo dice que los grandes herbívoros están excluidos desde 1983 y
    // **no reporta fertilización ni riego**. Por la regla del lote 14, el
    // silencio no se traduce a `secano`.
    insumos: 'desconocido',
    tipo: 'npp_herbacea',
    // 53 g MS/m²/año de la capa de gramíneas. El resumen publicado dice que «two
    // thirds of production were accounted for by perennial grasses and one third
    // by shrubs» sobre un total de 79, y 53/79 = 0,671: la cifra y la fracción
    // publicada en palabras coinciden. Los arbustos aportan 26 y NO van acá:
    // son elongación anual de Mulinum spinosum, Senecio filaginoides y Adesmia
    // campestris, que no es forraje de un bovino.
    //
    // **Y el lote 16 midió cuánto depende esta cifra del método, que es lo más
    // útil que trajo.** La Tabla 2 de Jobbágy y Sala publica el MISMO sitio y el
    // MISMO año 1984 con el método de biomasa de pico: 39,0 de gramíneas, 25,7 de
    // arbustos, 64,7 de total. Contra los 53 / 26 / 79 de acá:
    //
    // - la capa herbácea cambia **1,36 veces**;
    // - la leñosa no cambia nada: 26 contra 25,7, el 1,2 %;
    // - y por lo tanto el total cambia 1,22.
    //
    // La diferencia es toda de la capa que crece y senesce adentro del año, y es
    // el método de integración: acá se suman los incrementos positivos a lo largo
    // de cinco cosechas (método 7a de Singh) y allá se mide una sola vez en el
    // pico. **Un pico de biomasa subestima la producción herbácea de este sitio
    // un 26 %** y no toca la de los arbustos. Eso vale para toda entrada de este
    // archivo marcada como pico de stock, y es el mismo tipo de trampa que el
    // aire-seco contra el estufa-seco del lote 15: dos columnas de la misma
    // magnitud que no difieren por un factor parejo.
    kg_ms_ha_anio_min: 530,
    kg_ms_ha_anio_max: 530,
    kg_ms_ha_anio_tipico: 530,
    // 191 mm en el año detallado, textual en el resumen. La media de 37 años es
    // bastante menor y va en `donde_deja_de_valer`.
    lluvia_mm_min: 191,
    lluvia_mm_max: 191,
    lluvia_que_es: 'anio_medido',
    // El lote 14 la dejó en `null` porque el trabajo de Fernández-A. no la
    // publica. La Tabla 2 de Jobbágy y Sala (2000), del MISMO sitio y con el año
    // 1984 incluido, publica la temperatura media de los doce meses previos a
    // cada cosecha: 8,5 °C para 1984, y 8,5 ± 0,4 como media de los trece años
    // que la traen. Es media anual de verdad —no la mínima y la máxima, que es el
    // problema de las tres fichas del ORNL— así que acá sí corre `nppMiami`.
    temp_media_c_anual: 8.5,
    metodo: 'Cinco cosechas entre mayo de 1984 y mayo de 1985 para la capa de gramíneas, sumando los incrementos positivos de biomasa viva más el material muerto reciente (método 7a de Singh et al. 1975), sobre veinte parcelas de 0,2 × 5,0 m por fecha. Los arbustos, por doble muestreo: cosecha del crecimiento anual, dimensiones de la planta y densidad, con la copa aproximada a una semiesfera, sobre cuatro transectos de unos 100 individuos.',
    que_cuenta: 'Producción primaria neta aérea ANUAL de la capa de gramíneas, agrupadas. No incluye los arbustos, que el mismo trabajo publica aparte —26 g/m²/año, de donde sale la fracción herbácea de 0,671 en `FRACCION_HERBACEA_DEL_SITIO`—, ni las hierbas de hoja ancha, que cubren menos del 1 % y quedaron excluidas. No descuenta uso admisible.',
    estacionalidad: 'La biomasa verde de gramíneas ronda los 10 g/m² de mayo a septiembre, se multiplica por cinco entre septiembre y enero y vuelve al nivel inicial en mayo después de la sequía estival. El crecimiento de los arbustos se mide al final de la estación.',
    donde_deja_de_valer: 'Es el sitio más seco del archivo por lejos: 191 mm, menos de la mitad de los 354 de Lesbos, que era el anterior. Y el año medido fue húmedo para el lugar: la media de 37 años es 136 mm, con un rango de 47 a 230. El trabajo mide cuatro años más con un método menos detallado —sólo biomasa de pico— y da 21 a 75 g MS/m²/año de ANPP total con lluvias de 55 a 167 mm; son otro método y no se mezclan con el 79, pero dicen que en un solo sitio la producción se mueve 3,6 veces adentro del primer escalón de `prodForrajera`. El lote 16 trajo la serie completa de ese método —quince años, en `SERIE_RIO_MAYO`— y dice tres cosas más: el rango de lluvia llega a 276 mm y no a 167; la capa de gramíneas va de 14,7 a 48,7 g/m²/año, un factor 3,3; y la fracción herbácea del sitio, que acá se monta como un número, va de 0,281 a 0,604 según el año. La conclusión de los autores es la que importa: «There was a large reduction in ANPP during a year of extreme drought; however, there were no increases in ANPP during years with above-average precipitation. This suggests that the carrying capacity for the Patagonian steppe may not be linearly related to precipitation». La producción arbustiva está sesgada baja por decisión del método: «We did not consider diameter increases of branches but only their elongation; thus, our data may have a bias towards underestimation».',
    medido_en: '1984-1985 el año detallado; 1983/84, 1985/86, 1986/87 y 1988/89 con el método de pico',
    fuente: {
      label: 'Fernández-A., R. J., Sala, O. E. y Golluscio, R. A. (1991) — «Woody and herbaceous aboveground production of a Patagonian steppe», Journal of Range Management 44(5):434-437, DOI 10.2307/4002739',
      url: 'https://hdl.handle.net/10150/644811',
    },
  },
  {
    // Cincuenta años de un solo sitio, que es lo que esta cadena nunca había
    // tenido. Lo que la serie le hace a `prodForrajera` está en `SERIE_CPER` y
    // en la sección «Cincuenta años de un solo sitio» del encabezado.
    bioma: 'resolve_pastizal_templado',
    sitio: 'Central Plains Experimental Range, estepa de pasto corto, Colorado',
    // Al minuto de arco, como Río Mayo. La guía del ORNL del mismo sitio publica
    // además 40,82 / −104,77, que es el mismo punto en centésimas.
    coordenada: '40°49′ N, 104°46′ W (al minuto; la guía del ORNL da 40,82 N / 104,77 W)',
    // Clase 30, y es la asignación más limpia del archivo: **100 % de píxeles de
    // pastizal** en las tres ventanas y con las dos coordenadas publicadas. Es el
    // contraste exacto de Río Mayo, donde la clase se daba vuelta con la escala;
    // el criterio de estabilidad del lote 14 funciona en las dos direcciones.
    clase_wc: 30,
    // El trabajo no dice nada de fertilización ni de riego, y por la regla del
    // lote 14 el silencio no se traduce a `secano`. Acá además no cuesta nada:
    // 620 a 1.430 cae adentro de la banda de la clase 30, así que ser estricto
    // no cambia ningún número, sólo el recuento de sitios. Lo que sí dice el
    // trabajo, y es más grave que los insumos, está en `donde_deja_de_valer`.
    insumos: 'desconocido',
    tipo: 'npp_herbacea',
    // Columna ANPP_OD de la Tabla 1, en estufa-seco: 62 el año más flaco (1954),
    // 143 el más gordo (1981), 97 de media de los 50 años. **No es la columna de
    // forraje**, que está en aire-seco y da 22, 128 y 66: mezclarlas sería montar
    // masa con humedad como si fuera materia seca. Ver `ECUACION_FORRAJE_A_ANPP`.
    kg_ms_ha_anio_min: 620,
    kg_ms_ha_anio_max: 1430,
    kg_ms_ha_anio_tipico: 970,
    // El rango OBSERVADO en los 52 años, no una normal: 107 mm en 1964 y 588 en
    // 1967. Es el rango de lluvia más ancho del archivo, y es de un solo sitio.
    lluvia_mm_min: 107,
    lluvia_mm_max: 588,
    lluvia_que_es: 'rango_de_anios',
    // «Annual temperature averaged 8.6 ± 0.6 °C over the same time period».
    // Media anual de verdad, así que se puede contrastar con el Miami Model.
    temp_media_c_anual: 8.6,
    metodo: 'Cosecha de biomasa aérea viva y muerta adherida de gramíneas, ciperáceas y hierbas en cuadrantes de 0,19 m² (2 pie²) al final de la estación de crecimiento, todos los años de 1939 a 1990 salvo 1940 y 1980. Opuntia polyacantha NO se cosechó. Los años 1969 a 1972 se estimaron visualmente sin cosechar. Las masas se publican en AIRE-SECO y la columna de ANPP en estufa-seco se obtiene con la ecuación 1 del trabajo, ANPP = 46 + 0,76 × forraje, ajustada sobre los 14 años en que había las dos estimaciones.',
    que_cuenta: 'Estimación de producción primaria neta aérea de la capa herbácea, derivada del pico de materia seca al final de la estación. El propio trabajo justifica el método: «This method has been shown to provide good estimates of aboveground net primary production (ANPP) for ecosystems such as the shortgrass steppe in which the species that account for the majority of production have similar phenologies». Bouteloua gracilis es el 90 % de la cobertura basal y de la producción. No cuenta el cactus, no cuenta raíces y no descuenta uso admisible.',
    estacionalidad: 'Una cosecha al final de la estación de crecimiento, así que la serie no publica curva mensual. Los máximos de lluvia y de temperatura son junio, julio y agosto; los mínimos, diciembre, enero y febrero.',
    donde_deja_de_valer: 'La advertencia más importante no es el clima: **las ubicaciones muestreadas cambian de año en año y tienen historias de pastoreo distintas**, y el número de ubicaciones va de 3 en 1967 a 35 en 1977, con 11 de promedio. Cada cifra anual es un promedio sobre las parcelas que se muestrearon ESE año. El trabajo lo declara: «While the lack of identical sampling locations and number of locations from year to year limits the utility of the data set for some purposes, it nevertheless is valuable for an analysis of the relationship between precipitation and forage production». Por eso la serie sirve para la relación lluvia-producción y NO para comparar un año contra otro como si fuera la misma parcela. Segunda advertencia, del propio trabajo: «The most important assumption for this analysis is that the estimates of forage production (air-dry basis) for each year are proportional to ANPP (oven-dry basis)», y esa proporcionalidad se ajustó con r² = 0,28 sobre 14 años. La media de lluvia de los 52 años es 321 ± 98 mm; el rango de este campo es el observado y no una normal.',
    medido_en: '1939 a 1990, todos los años salvo 1940 y 1980',
    fuente: {
      label: 'Lauenroth, W. K. y Sala, O. E. (1992) — «Long-term forage production of North American shortgrass steppe», Ecological Applications 2(4):397-403, Tabla 1 y Figura 2',
      url: 'https://api.mountainscholar.org/server/api/core/bitstreams/8949c8af-f20c-47b4-a9e6-57ba814210c1/content',
    },
  },
  {
    bioma: 'resolve_montano',
    sitio: 'Pastizal de Themeda del Highveld, Bloemfontein, Estado Libre',
    // La fuente publica 26°15′ E, 28°50′ S, 1.350 m, y la nombra como la del
    // campus de la Universidad del Estado Libre. **No cae ahí.** El campus está
    // en 29°06′ S: la latitud publicada queda 31 km al norte. La longitud sí
    // coincide con la otra ubicación de la serie, la granja Sydenham.
    coordenada: '26°15′ E, 28°50′ S, 1.350 m (publicada; cae 31 km al norte del campus que la misma fuente nombra)',
    // `null`, y por un motivo nuevo en este archivo: **no hay un punto**. La serie
    // junta dos lugares a 5 km —Sydenham desde 1977 y el campus desde 1995— y los
    // trata como un solo conjunto, y la única coordenada publicada no cae en
    // ninguno de los dos. No es que la clase sea inestable: sobre la coordenada
    // publicada el pastizal es el 83,0, el 72,7 y el 64,8 % en las tres ventanas,
    // que sería estable. Es que esa estabilidad no dice nada del sitio medido.
    //
    // Y hay una segunda señal: el cultivo sube del 17 al 34 % al ampliar. Es una
    // granja de investigación agrícola, lo cual es coherente con el dato y no con
    // un píxel de pastizal natural.
    clase_wc: null,
    // El control conservó la vegetación existente sin manipular; no se declara
    // fertilización ni riego. Silencio, entonces `desconocido`.
    insumos: 'desconocido',
    tipo: 'npp_herbacea',
    // 138 g MS/m²/año de media de 29 temporadas, con CV del 53 %.
    kg_ms_ha_anio_min: 1380,
    kg_ms_ha_anio_max: 1380,
    kg_ms_ha_anio_tipico: 1380,
    // Media de las 29 temporadas de crecimiento con dato de producción. Es una
    // media de largo plazo y NO las puntas de una serie: escribí
    // `rango_de_anios` y un test del lote 15 lo atajó, porque ese valor significa
    // el mínimo y el máximo del mismo punto en años distintos, que es lo que
    // tienen el CPER y Río Mayo. Acá hay un solo número.
    lluvia_mm_min: 538,
    lluvia_mm_max: 538,
    lluvia_que_es: 'normal_publicada',
    // La fuente publica medias mensuales de 17 °C en julio a 33 °C en enero, que
    // son la mínima y la máxima del ciclo y NO promedian a la media anual. Es el
    // mismo caso de las tres fichas del ORNL.
    temp_media_c_anual: null,
    metodo: 'ANPP estimada como BIOMASA DE PICO EN PIE: ocho cuadrantes de 0,25 m² por parcela, ubicados al azar, cortados a 3 cm de altura al final de cada estación de crecimiento. Las parcelas enteras se volvían a cortar a la misma altura en julio, antes de la estación siguiente. Tres réplicas de 2 × 15 m. La lluvia diaria viene del aeropuerto de Bloemfontein y del campus.',
    que_cuenta: 'Biomasa total de graminoides producida en un año, que la fuente llama ANPP; las hierbas de hoja ancha son «a negligible component» en los tres sitios. Es un pico de stock y no una suma de incrementos: por lo que midió el lote 16 en Río Mayo, un pico subestima la producción herbácea de un sitio alrededor de un 26 %. No descuenta uso admisible.',
    estacionalidad: 'Estación de crecimiento definida del 1 de septiembre al 30 de abril. El 90 % de la lluvia cae en verano, con el CV más alto de los tres sitios: 35 %.',
    donde_deja_de_valer: 'Parcelas experimentales de 30 m² en dos lugares agrupados, no un potrero. El contraste que importa está en `CONTRASTE_DE_MANEJO`: las parcelas en mal estado del MISMO sitio, con la MISMA lluvia, producen 43 g/m² contra los 138 del control. La propia fuente avisa contra generalizar el patrón de eventos: «The lack of consistency in the relative importance of the precipitation variables among sites suggests that local, edaphic factors modify precipitation-ANPP relationships». Y el dato más relevante para `prodForrajera` es que acá la lluvia total de la estación explica el 46 % de la variación, mientras el tamaño y el número de eventos explican el 68 %.',
    medido_en: '29 temporadas de crecimiento, 1977 a 2006',
    fuente: {
      label: 'Swemmer, A. M. (2007) — «The effect of intra-seasonal variation in precipitation on the productivity of grasses and grasslands», tesis doctoral, Colorado State University, capítulo 2, Tablas 2.1 y 2.2; publicado como Swemmer, Knapp y Snyman (2007), Journal of Ecology 95:780-788',
      url: 'https://api.mountainscholar.org/server/api/core/bitstreams/26dfcae9-01ab-497a-ad1d-fde592c064de/content',
    },
  },
  {
    bioma: 'resolve_sabana_tropical',
    sitio: 'Pastizal del bushveld central, Estación Towoomba, Bela-Bela, Limpopo',
    // Ésta sí cae donde dice: Bela-Bela está en 24°53′ S, 28°20′ E. Y eso es lo
    // que delata la de Ukulinga, porque muestra que el formato de la fuente
    // —longitud primero, con E, y latitud después, con S— es deliberado.
    coordenada: '28°21′ E, 24°54′ S, 1.134 m',
    // **Clase 20, y estable: 65,9 / 52,9 / 44,3 % de arbustal en las tres
    // ventanas.** Es el segundo píxel de arbustal del archivo, después de la
    // frigana de Lesbos, y apareció donde nadie lo buscaba: en un trabajo sobre
    // lluvia en PASTIZALES, en el sitio que la entrega del lote 16 no incluyó.
    //
    // **Y no puede alimentar la banda de la clase 20.** El motivo está en la
    // fuente: «The site was cleared of all woody species at the start of the
    // experiment», en 1949. El píxel describe el bushveld de alrededor; la
    // parcela medida mide 58 m², menos que un píxel de WorldCover, y está
    // desmontada desde hace setenta años.
    //
    // Eso es el caso inverso al de Río Mayo y cierra la pinza. El lote 14 dejó
    // escrito que **lo que un agrónomo llama estepa arbustiva, el mapa lo llama
    // pastizal**. Acá: lo que el mapa llama arbustal, el experimento desmontó.
    // La estrategia de llenar la banda 20 partiendo del píxel sigue siendo la
    // correcta, y ahora tiene su primera trampa documentada: **el píxel no sabe
    // qué le hicieron a la parcela.** Hay un test que lo mantiene afuera.
    clase_wc: 20,
    insumos: 'desconocido',
    tipo: 'npp_herbacea',
    // 137 g MS/m²/año de media de 27 temporadas, con CV del 55 %. Es casi
    // idéntico a Bloemfontein con 107 mm más de lluvia.
    kg_ms_ha_anio_min: 1370,
    kg_ms_ha_anio_max: 1370,
    kg_ms_ha_anio_tipico: 1370,
    // Media de 38 años de lluvia; la producción son 27 temporadas. No son los
    // mismos años, y la fuente lo declara en el encabezado de la tabla.
    lluvia_mm_min: 645,
    lluvia_mm_max: 645,
    lluvia_que_es: 'normal_publicada',
    // Máxima media de 30,3 °C en diciembre y mínima media de 3 °C en julio: las
    // dos puntas, no la media anual.
    temp_media_c_anual: null,
    metodo: 'Segado anual a unos 5 cm cuando la mayoría de las gramíneas estaba en floración temprana, sobre parcelas de 6,4 × 9,1 m con cuatro réplicas. El material segado se secó al aire y se pesó, así que la masa es AIRE-SECO, igual que la serie del CPER y a diferencia de los otros dos sitios de esta misma fuente. La lluvia diaria se midió en el sitio.',
    que_cuenta: 'Biomasa de graminoides de un corte anual en floración temprana. En aire-seco: por la ecuación 1 de Lauenroth y Sala, pasar de aire-seco a estufa-seco en este rango de valores no es un factor parejo, así que esta cifra no es directamente comparable con las de Bloemfontein ni de Ukulinga aunque salgan de la misma tabla.',
    estacionalidad: 'Un corte por año en floración temprana. El 96 % de la lluvia cae en verano, la fracción más alta de los tres sitios, y su CV es el más bajo: 27 %.',
    donde_deja_de_valer: 'El sitio fue DESMONTADO de todas las leñosas en 1949 y el ensayo se mantuvo segado desde entonces: la cifra describe un pastizal manejado dentro de un paisaje de bushveld, y por eso está excluida de la banda de su clase. Trece años después del inicio, la propia fuente registró cambios grandes de composición, de nutrientes del suelo, de pH, de compactación y de infiltración en respuesta a TODOS los tratamientos de fertilización, lo que significa que ni el control quedó quieto. Es además el único de los tres sitios donde la lluvia total gana: explica el 32 % contra el 39 % del tamaño de eventos, una diferencia que la propia fuente considera no sustancial.',
    medido_en: '27 temporadas entre 1949 y 1981 (1949-1957, 1960-1975, 1977-1981)',
    fuente: {
      label: 'Swemmer, A. M. (2007) — «The effect of intra-seasonal variation in precipitation on the productivity of grasses and grasslands», tesis doctoral, Colorado State University, capítulo 2, Tablas 2.1 y 2.2; publicado como Swemmer, Knapp y Snyman (2007), Journal of Ecology 95:780-788',
      url: 'https://api.mountainscholar.org/server/api/core/bitstreams/26dfcae9-01ab-497a-ad1d-fde592c064de/content',
    },
  },
  {
    bioma: 'resolve_sabana_tropical',
    sitio: 'Pastizal de Themeda y Tristachya, granja Ukulinga, KwaZulu-Natal',
    // **La coordenada publicada tiene los dos números permutados**, y se nota
    // porque la fuente nombra el lugar sin ambigüedad: la granja Ukulinga de la
    // Universidad de KwaZulu-Natal, en Pietermaritzburg. Lo publicado —29°24′ E,
    // 30°24′ S— cae en el Cabo Oriental, a unos 250 km. La permutación que
    // corresponde al lugar nombrado es 30°24′ E, 29°24′ S.
    //
    // No es un error de la entrega: la fuente lo publica así, y el sitio de
    // Towoomba de la misma tabla usa el mismo formato y cae bien.
    coordenada: '29°24′ E, 30°24′ S, 845 m (publicada; los dos números están permutados y caen a 250 km de la granja que la fuente nombra)',
    // `null`, y acá el motivo es doble. La coordenada publicada no sirve. Y la
    // permutación que sí apunta a KwaZulu-Natal da **100 % de arbolado a 500 m**
    // y 98,4 % a 2 km, que no es un pastizal: ni corrigiendo el error se puede
    // escribir una clase para este sitio.
    clase_wc: null,
    // El control no recibe fertilizante; la fuente no menciona riego.
    insumos: 'desconocido',
    tipo: 'npp_herbacea',
    // 323 g MS/m²/año de media de 30 temporadas, CV del 26 %: el más productivo
    // y el más estable de los tres.
    kg_ms_ha_anio_min: 3230,
    kg_ms_ha_anio_max: 3230,
    kg_ms_ha_anio_tipico: 3230,
    // Media de 49 años de lluvia, contra 30 temporadas de producción.
    lluvia_mm_min: 798,
    lluvia_mm_max: 798,
    lluvia_que_es: 'normal_publicada',
    // Máxima media de 26,4 °C en febrero y mínima media de 8,8 °C en julio.
    temp_media_c_anual: null,
    metodo: 'Dos mediciones por año —diciembre, a mitad de la estación, y febrero, hacia el final— segando una franja de 2,1 m en cada parcela de 2,7 × 9,1 m, con tres réplicas. El material se pesó fresco y una submuestra se secó a masa constante para estimar la masa seca. Ensayo de fertilización de largo plazo establecido en 1951; acá va el tratamiento control.',
    que_cuenta: 'Biomasa de graminoides. **La fuente no declara si los dos cortes se suman o se promedian**, y eso deja la cifra con una ambigüedad de hasta un factor 2 que no se puede resolver con lo consultado. Hay un indicio indirecto a favor de la suma: con 323 g/m² la eficiencia de uso de la lluvia da 0,48 g/m²/mm, casi el doble que los 0,25 de Bloemfontein y los 0,21 de Towoomba, y la mitad de 323 los dejaría a los tres juntos. Es un indicio y no una verificación, así que la cifra va como la publica la fuente y la duda queda escrita.',
    estacionalidad: 'Estación de crecimiento del 1 de septiembre hasta la fecha del segundo corte. El 91 % de la lluvia cae en verano. Es el sitio con más eventos de lluvia, los más chicos y los intervalos más cortos de los tres.',
    donde_deja_de_valer: 'Parcelas de 25 m² en una meseta, sobre lutitas del grupo Ecca con 60 cm de suelo ácido y poco fértil. Es el sitio donde la lluvia total explica menos: el 22 %, contra el 44 % del tamaño de eventos combinado con el intervalo entre ellos, y la fuente concluye que ahí pesa más el intervalo que el tamaño. Setenta y cinco años de ensayo con cortes dos veces al año no son un potrero pastoreado. El contraste con el tratamiento fertilizado está en `CONTRASTE_DE_MANEJO`.',
    medido_en: '30 temporadas entre 1950 y 2000 (1950-1963, 1965-1979, 1997/98 y 1999/2000)',
    fuente: {
      label: 'Swemmer, A. M. (2007) — «The effect of intra-seasonal variation in precipitation on the productivity of grasses and grasslands», tesis doctoral, Colorado State University, capítulo 2, Tablas 2.1 y 2.2; publicado como Swemmer, Knapp y Snyman (2007), Journal of Ecology 95:780-788',
      url: 'https://api.mountainscholar.org/server/api/core/bitstreams/26dfcae9-01ab-497a-ad1d-fde592c064de/content',
    },
  },
  {
    // Diecisiete años, cinco intensidades de pastoreo, dos sitios ecológicos y
    // la carga publicada en AUM/ha. Es el primer par de manejo del archivo donde
    // la variable es el PASTOREO y no la fertilización, que era el agujero que
    // dejó el lote 16. El detalle, los tres momentos de la temporada y las
    // pendientes publicadas están en `CONTRASTE_DE_CARGA`.
    bioma: 'resolve_pastizal_templado',
    sitio: 'Sitios silty del Central Grasslands Research Extension Center, Streeter, Dakota del Norte',
    // Al minuto de arco, que acá son ±1,85 km en latitud y ±1,26 km en longitud,
    // sobre una estación de 1,54 km². La ubicación en palabras —«12 km al
    // noroeste de Streeter»— coincide con el punto, y el SSURGO del punto
    // devuelve 595 m de altura contra los 587 que publica el trabajo.
    coordenada: '46°46′ N, 99°28′ W, 587 m (publicada); el punto cae en el mapa de suelos con 595 m',
    // Clase 30 y ESTABLE en las tres ventanas: 91,0 % de pastizal a 500 m,
    // 85,3 % a 2 km y 84,9 % a 5 km. El cultivo llega al 12,6 % a 2 km y el agua
    // al 7,8 % a 5 km —son las lagunas del Coteau du Missouri—, y ninguno de los
    // dos se le acerca.
    //
    // **Pero el píxel no distingue este sitio del de al lado, y los dos están
    // medidos.** Las parcelas silty y las overflow están intercaladas adentro de
    // los mismos doce potreros: la misma coordenada, la misma clase 30 y la misma
    // estabilidad valen para las dos entradas, y producen 2.501–3.410 contra
    // 3.087–4.362 kg/ha. Un factor 1,3 que un satélite de 10 m no puede ver, y
    // que además responde al manejo con el signo al revés. Es el límite de buscar
    // por píxel dicho con dos mediciones del mismo día.
    clase_wc: 30,
    // El trabajo no menciona fertilización ni riego **ni una sola vez** en todo
    // el texto; lo verifiqué buscando los dos términos y sus variantes. Silencio,
    // entonces `desconocido`, igual que el CPER y Río Mayo.
    //
    // Y hay una derivación que vale escribir porque descarta la mitad de la duda:
    // la producción responde a la lluvia del año agrícola con pendiente
    // significativa —28,63 kg/ha por cm en el total—, y eso no podría pasar en
    // parcelas regadas. Lo que queda sin contestar es la fertilización, y por eso
    // la entrada no entra en la banda de la clase 30.
    insumos: 'desconocido',
    tipo: 'ms_herbacea_total',
    // Producción total al FINAL de la temporada, Tabla 6: 2.865 sin pastoreo,
    // 3.410 liviano, 3.156 moderado, 2.637 fuerte y 2.501 extremo. El mínimo y el
    // máximo son manejos del mismo sitio en los mismos diecisiete años, no años
    // buenos y malos.
    kg_ms_ha_anio_min: 2501,
    kg_ms_ha_anio_max: 3410,
    // No hay valor central publicado: lo que la fuente publica son cinco medias,
    // una por intensidad, y el promedio de las cinco no significa nada porque las
    // intensidades no son una muestra de nada.
    kg_ms_ha_anio_tipico: null,
    lluvia_mm_min: 454,
    lluvia_mm_max: 454,
    // Normal publicada de la estación, con el 72 % de mayo a septiembre.
    //
    // **Ojo con esta cifra, que no es la lluvia a la que están ajustadas las
    // medias.** Las medias son de covarianza y están ajustadas al valor medio de
    // P2E, que es la lluvia acumulada desde el fin de la temporada de crecimiento
    // ANTERIOR hasta el fin de la temporada de pastoreo de ese año. P2E termina
    // antes de que acabe el año calendario, así que es menor que la anual: los
    // umbrales publicados caen entre 24,8 y 53,2 cm. La normal anual describe el
    // clima del sitio; P2E es la variable del modelo.
    lluvia_que_es: 'normal_publicada',
    // El trabajo publica −16 °C de media en enero y 20 °C en agosto, que son el
    // mes más frío y el más cálido y NO promedian a la media anual. Es el mismo
    // caso de las fichas del ORNL.
    temp_media_c_anual: null,
    metodo: 'Comparación con jaulas (cage comparison, Cook y Stubbendieck 1986) en diecisiete años: cinco parcelas de 0,25 m² enjauladas al inicio de cada temporada, con dos parcelas sin jaula emparejadas a cada una —quince parcelas por sitio de monitoreo—. La producción de fin de temporada es el pico de adentro de la jaula más el crecimiento del pico al final, que se mide con una segunda jaula puesta en el pico: Pb + Gpe, con Gpe = Hie − Hop. Sólo se guarda el crecimiento del año. Secado en estufa a 66 °C durante 48 h. Medias ajustadas por análisis de covarianza con la lluvia del año agrícola y la temperatura del suelo bajo el tapiz a 100 mm de profundidad como covariables.',
    que_cuenta: 'Producción total de la temporada: gramíneas más hierbas de hoja ancha. En los sitios silty los arbustos no son un grupo aparte —«with occasional shrubs being placed with forbs»—, así que están adentro de la cifra de hierbas y no se pueden separar. La fuente avisa de algo que hay que respetar al usar la tabla: «Because grass, forb, and total are each adjusted separately for the effects of P2E and/or P2E and T2E, grass, forb, and shrub production does not sum to total production». No descuenta uso admisible, y ésa es la diferencia que importa acá: la cifra es lo que CRECIÓ en la parcela enjaulada, no lo que quedó después de que el animal comiera.',
    estacionalidad: 'Tres muestreos por temporada: al inicio del pastoreo, en el pico de producción —que se detectaba al empezar a secarse la vegetación, en general a mediados de julio— y al final del pastoreo. El largo de la temporada de pastoreo lo fijaba el manejo y fue de 55 días en 2002 a 181 en 1990. Dominan gramíneas de estación fría, con Poa pratensis que arranca en cuanto la superficie pasa de 0 °C si hay agua y se frena en las secas.',
    donde_deja_de_valer: 'Dos sitios ecológicos de una estación experimental, no un potrero comercial, y un pastizal que NO es la vegetación original: era pradera mixta, los colonos la araron y volvió a pasto en las sequías de los años 50, así que hoy la dominan Poa pratensis y Bromus inermis, dos invasoras introducidas. El propio trabajo lo aclara. Y el resultado central —que el pastoreo liviano produce más que el descanso— no se puede generalizar: Milchunas, Lauenroth y Burke (1994) corrieron un experimento parecido en el CPER, que es el otro sitio de serie larga de este archivo, y les salió lo contrario —el no pastoreado fue el más productivo—; las revisiones de Belsky (1986) y Painter y Belsky (1993) no encontraron evidencia de que la herbivoría beneficie a la planta; y el informe anterior de ESTE MISMO experimento, Biondini, Patton y Nyren (1998), tampoco había encontrado menos producción en el no pastoreado. Los autores lo dicen con todas las letras: la joroba apareció al estirar la serie, «underscoring the importance of long-term studies in ecological research».',
    medido_en: '1989 a 2005 la producción; 1991 a 2005 las cargas',
    fuente: {
      label: 'Patton, B. D., Dong, X., Nyren, P. E. y Nyren, A. (2007) — «Effects of Grazing Intensity, Precipitation, and Temperature on Forage Production», Rangeland Ecology & Management 60(6):656-665, Tablas 1 a 7, DOI 10.2111/07-008R2.1',
      url: 'https://repository.arizona.edu/items/170fb626-5783-4753-9770-7f7a26b05b33',
    },
  },
  {
    bioma: 'resolve_pastizal_templado',
    sitio: 'Sitios overflow del Central Grasslands Research Extension Center, Streeter, Dakota del Norte',
    // El mismo punto que la entrada anterior: los dos sitios ecológicos están
    // intercalados adentro de los mismos potreros.
    coordenada: '46°46′ N, 99°28′ W, 587 m (publicada); el mismo punto que los sitios silty',
    clase_wc: 30,
    insumos: 'desconocido',
    tipo: 'ms_herbacea_total',
    // Producción total al final de la temporada, Tabla 7: 4.131 liviano, 4.360
    // moderado, 4.362 fuerte y 3.087 extremo. **El no pastoreado no tiene media
    // publicada acá**, y no por falta de dato: su producción no responde a la
    // lluvia y las pastoreadas sí, así que la comparación depende del año y la
    // fuente publica umbrales en vez de una media. Es la decisión correcta y deja
    // esta banda sin el extremo de abajo.
    kg_ms_ha_anio_min: 3087,
    kg_ms_ha_anio_max: 4362,
    kg_ms_ha_anio_tipico: null,
    lluvia_mm_min: 454,
    lluvia_mm_max: 454,
    lluvia_que_es: 'normal_publicada',
    temp_media_c_anual: null,
    metodo: 'El mismo de los sitios silty: comparación con jaulas, quince parcelas de 0,25 m² por sitio de monitoreo, Pb + Gpe, estufa a 66 °C/48 h y medias ajustadas por covarianza. La diferencia es que acá la hierba se separó en TRES grupos y no en dos: gramíneas, hierbas de hoja ancha y arbustos.',
    que_cuenta: 'Producción total de la temporada: gramíneas, hierbas y arbustos. El grupo de arbustos no es despreciable y se mueve con el manejo en dirección propia —155 kg/ha en el extremo contra 556 en el fuerte—; lo domina Symphoricarpos occidentalis, que es un subarbusto que el ganado come. Vale la misma advertencia de la fuente: los cuatro grupos se ajustan por separado y no suman al total.',
    estacionalidad: 'La misma que los silty, con una diferencia de muestreo que la fuente declara: los sitios silty se muestreaban de 0 a 9 días antes que los overflow.',
    donde_deja_de_valer: 'Tierras bajas que reciben el escurrimiento de las laderas de arriba: son más productivas que los silty por el agua que les llega, no por el clima, y la fuente prohíbe explícitamente juntar los dos —«do not pool silty and overflow» es la lectura de su propia frase: «there was a significant difference in production between the range sites and an interaction between range site and grazing intensity»—. El manejo acá se comporta distinto que en los silty: liviano, moderado y fuerte no se diferencian entre sí y sólo el extremo cae. Y el grupo de hierbas pesa mucho más que en los silty: 902 a 1.283 kg/ha contra 387 a 699.',
    medido_en: '1989 a 2005 la producción; 1991 a 2005 las cargas',
    fuente: {
      label: 'Patton, B. D., Dong, X., Nyren, P. E. y Nyren, A. (2007) — «Effects of Grazing Intensity, Precipitation, and Temperature on Forage Production», Rangeland Ecology & Management 60(6):656-665, Tablas 2, 4 y 7, DOI 10.2111/07-008R2.1',
      url: 'https://repository.arizona.edu/items/170fb626-5783-4753-9770-7f7a26b05b33',
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
 * Cuatro sitios, los cuatro con numerador y denominador en la misma tabla y en
 * la misma unidad, así que el cociente no arrastra ninguna conversión:
 *
 * - el transecto OTTER de Oregón, por las fichas de sitio del ORNL DAAC: capa
 *   herbácea contra NPP del rodal, en g MS/m²/año;
 * - la ficha de sitio ecológico R081BY354TX del NRCS: gramíneas y hierbas contra
 *   el total del sitio, que incluye arbustos y árboles, en lb/acre/año.
 *
 * - la estepa de Río Mayo, en Chubut, por el trabajo de Fernández-A., Sala y
 *   Golluscio (1991): gramíneas contra el total aéreo del sitio, en g MS/m²/año.
 *   Es el primero que NO es un rodal ni una ficha de sitio ecológico: es una
 *   comunidad abierta donde la luz no es lo que falta.
 *
 * **De 0,0039 a 0,92: un factor 236.** Y no lo mueve el clima. Los dos sitios de
 * Oregón están a 200 km, producen casi lo mismo de rodal —1.540 y 1.630— y su
 * sotobosque difiere 6,8 veces, con la cobertura herbácea difiriendo 7,2.
 *
 * **El cuarto punto confirma la lectura por el otro extremo.** Río Mayo da 0,671
 * con 12 % de cobertura de arbustos: en una comunidad abierta, donde el dosel no
 * intercepta casi nada, dos tercios de lo que se produce arriba del suelo es
 * capa herbácea. El trabajo lo publica además en palabras —«two thirds of
 * production were accounted for by perennial grasses and one third by shrubs»—,
 * así que el cociente no sale de dividir dos cifras que alguien juntó: sale de la
 * frase del autor, y las cifras lo confirman.
 *
 * **Rango de validez.** Son cuatro puntos y dos de ellos del mismo transecto; no
 * hay una curva, hay dos puntas y dos sitios en el medio. No interpolar: lo que la
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
  {
    sitio: 'Estepa arbustiva de Río Mayo, distrito Occidental, Chubut',
    // 53 de gramíneas contra 79 de ANPP total del sitio. El total excluye las
    // hierbas de hoja ancha, que cubren menos del 1 %: es una omisión declarada
    // y acotada, no un denominador incompleto a ciegas.
    //
    // **Esta fila es la que el lote 16 aprendió a leer con cuidado.** El 0,671 es
    // de UN año y de UN método. El mismo sitio medido diez años con el método de
    // pico da de 0,281 a 0,604 —ver `fraccionHerbaceaRioMayo`— y el 0,671 queda
    // arriba de los diez. No es que uno esté mal: el método 7a captura la parte
    // de la producción herbácea que senesce antes del pico, y los arbustos no
    // tienen esa parte, así que subir el numerador sin subir el denominador sube
    // el cociente. La conclusión es que **la fracción herbácea de un sitio no es
    // un número**, y que el factor 236 de esta tabla mezcla sitio, año y método.
    herbacea: 53,
    aerea_total: 79,
    unidad: 'g_ms_m2_anio',
    dosel: 'estepa abierta sin dosel: 12 % de cobertura de arbustos y 25 % de gramíneas en mata',
    fuente: 'Fernández-A., Sala y Golluscio (1991), J. Range Manage. 44(5):434-437',
  },
] as const;

/** El cociente de una fila, sin conversiones: las dos cifras vienen en la misma unidad. */
export function fraccionHerbacea(f: FraccionHerbacea): number {
  return f.herbacea / f.aerea_total;
}

/**
 * Dos manejos del mismo sitio, con el mismo clima y la misma lluvia.
 *
 * Cada fila es un par de parcelas vecinas que sólo difieren en el manejo. Es el
 * único diseño que separa el efecto del manejo del efecto del clima, porque el
 * clima es literalmente el mismo.
 */
export interface ContrasteDeManejo {
  sitio: string;
  /** Qué cambia entre las dos parcelas. */
  que_cambia: string;
  /** El tratamiento de referencia: sin fertilizar y sin manipular. */
  control_g_ms_m2_anio: number;
  /** El otro manejo. */
  tratado_g_ms_m2_anio: number;
  /** Cobertura basal del control, en %, si la fuente la publica con su método. */
  cobertura_basal_control_pct: number | null;
  /** Cobertura basal del tratamiento, en %, si la fuente la publica. */
  cobertura_basal_tratado_pct: number | null;
  /** Cómo y cuándo se midió esa cobertura, porque un % sin método no sirve. */
  metodo_de_la_cobertura: string | null;
  /** Lluvia media anual del sitio, mm: la misma para las dos parcelas. */
  lluvia_mm: number;
  /** Años de producción promediados. */
  anios: number;
  fuente: string;
}

/**
 * Cuánto cambia la producción por el manejo, con el clima quieto.
 *
 * ## Por qué esto le faltaba a acequia
 *
 * `prodForrajera` es una función de la lluvia y nada más. Todo lo que este
 * archivo juntó hasta el lote 15 discute **la forma de esa función**: si la
 * pendiente es 0,13 o 0,60, si hay memoria, si la escalera se pasa. Nada decía
 * cuánto puede valer el manejo, que es la variable sobre la que el usuario de
 * esta app realmente decide.
 *
 * Estas tres filas lo miden, en el único diseño que puede medirlo: parcelas
 * vecinas con el mismo clima, promediadas sobre 27 a 30 años.
 *
 * | sitio | qué cambia | control | tratado | factor |
 * |---|---|---|---|---|
 * | Bloemfontein | el estado del pastizal | 138 | 43 | **0,31** |
 * | Towoomba | nitrógeno y fósforo | 137 | 519 | **3,79** |
 * | Ukulinga | nitrógeno y fósforo | 323 | 562 | **1,74** |
 *
 * **El rango completo del manejo en un mismo sitio es de 0,31 a 3,79 veces: un
 * factor 12.** Para comparar: en el CPER, cincuenta años de lluvia de 107 a
 * 588 mm mueven la producción un factor 5,8, y eso es toda la variación climática
 * de medio siglo en un sitio.
 *
 * El manejo pesa más que el clima interanual. No es una sorpresa agronómica —es
 * lo que cualquiera que trabaje en el campo diría— pero sí es la primera vez que
 * este archivo lo tiene con número, y cambia la prioridad: una función de la
 * lluvia mejor calibrada sigue ignorando la variable más grande.
 *
 * ## El par de Bloemfontein es el que más importa, y es el más barato de leer
 *
 * Los dos tratamientos fertilizados describen una práctica que la mayoría de los
 * predios de esta app no va a aplicar. El de Bloemfontein describe otra cosa: las
 * parcelas en mal estado **se crearon sacando especies a mano** para representar
 * «vegetation in good, moderate and poor states, as would be created by grazing
 * regimes of increasing intensity».
 *
 * O sea: es un modelo experimental del sobrepastoreo, sostenido 29 años, sin
 * tocar el clima. **Y la producción cae a 0,31.** La eficiencia de uso de la
 * lluvia cae de 0,25 a 0,08 g/m²/mm, y la cobertura basal de 9,0 a 3,4 %. La
 * fuente atribuye la caída a la cobertura y no a las especies: «lower RUE was
 * mainly a result of lower basal cover, not species composition».
 *
 * Eso le pone piso a algo que acequia hoy no modela: **el mismo predio, con la
 * misma lluvia, puede producir un tercio si el pastizal está degradado.** Y la
 * degradación no es un escenario remoto en los predios que esta app analiza.
 *
 * ## Rango de validez, que acá es estrecho
 *
 * Tres pares, dos de ellos del mismo tipo de tratamiento, los tres en Sudáfrica
 * y los tres en parcelas experimentales de 25 a 58 m² cortadas a máquina, no en
 * potreros pastoreados. Los dos sitios fertilizados recibieron dosis altas —151 y
 * 212 kg N/ha/año— que no son una fertilización de mantenimiento. Y la propia
 * fuente registra en Towoomba que trece años de tratamiento cambiaron la
 * composición, el pH, la compactación y la infiltración, así que el 3,79 no es
 * «lo que hace el fertilizante»: es lo que hacen treinta años de fertilizante
 * más todo lo que el fertilizante le hizo al suelo.
 *
 * **Qué se rompe si cambia:** nada calcula con esto todavía. Es la medida de
 * cuánto le falta a `prodForrajera` por un lado que no es la forma de la curva.
 */
export const CONTRASTE_DE_MANEJO: readonly ContrasteDeManejo[] = [
  {
    sitio: 'Pastizal de Themeda del Highveld, Bloemfontein, Estado Libre',
    que_cambia: 'el estado del pastizal: el tratamiento se creó retirando especies a mano para representar lo que harían regímenes de pastoreo cada vez más intensos',
    control_g_ms_m2_anio: 138,
    tratado_g_ms_m2_anio: 43,
    cobertura_basal_control_pct: 9.0,
    cobertura_basal_tratado_pct: 3.4,
    metodo_de_la_cobertura: 'Snyman (2000), medida de 1995 a 1999; la fuente no detalla la técnica',
    lluvia_mm: 538,
    anios: 29,
    fuente: 'Swemmer (2007), tesis, Tabla 2.1',
  },
  {
    sitio: 'Pastizal del bushveld central, Estación Towoomba, Bela-Bela, Limpopo',
    que_cambia: 'fertilización P2N3: 151,4 kg N/ha/año en tres aplicaciones más 37,9 kg P/ha/año',
    control_g_ms_m2_anio: 137,
    tratado_g_ms_m2_anio: 519,
    cobertura_basal_control_pct: 12.6,
    cobertura_basal_tratado_pct: 9.8,
    metodo_de_la_cobertura: 'promedio de mediciones de 1956 y 1982, de Donaldson et al. (1984)',
    lluvia_mm: 645,
    anios: 27,
    fuente: 'Swemmer (2007), tesis, Tabla 2.1',
  },
  {
    sitio: 'Pastizal de Themeda y Tristachya, granja Ukulinga, KwaZulu-Natal',
    que_cambia: 'fertilización N3P: 211,7 kg N/ha/año en dos aplicaciones más 28 kg P/ha/año',
    control_g_ms_m2_anio: 323,
    tratado_g_ms_m2_anio: 562,
    cobertura_basal_control_pct: 15.8,
    // La fuente lo dice: «data not available for the fertilised treatment».
    cobertura_basal_tratado_pct: null,
    metodo_de_la_cobertura: 'parcelas vecinas con el mismo régimen de corte, medidas en 1997, de Morris y Fynn (2003)',
    lluvia_mm: 798,
    anios: 30,
    fuente: 'Swemmer (2007), tesis, Tabla 2.1',
  },
] as const;

/** Cuántas veces produce el manejo tratado respecto del control del mismo sitio. */
export function factorDeManejo(c: ContrasteDeManejo): number {
  return c.tratado_g_ms_m2_anio / c.control_g_ms_m2_anio;
}

/**
 * La cobertura basal del control contra su producción, en los tres sitios.
 *
 * **No ordena nada, y eso es el dato.** Bloemfontein tiene 9,0 % de cobertura
 * basal y produce 138; Towoomba tiene 12,6 % y produce 137; Ukulinga tiene 15,8 %
 * y produce 323. Y la estepa de Río Mayo, que no es de esta fuente, tiene 25 % de
 * cobertura basal de gramíneas y produce 28.
 *
 * Es decir: **la cobertura basal no predice la producción entre sitios**, aunque
 * adentro de un sitio sí la explique —es lo que pasa en el par de Bloemfontein—.
 * Vale escribirlo porque la cobertura es lo que un satélite ve, y la tentación de
 * usarla como proxy de producción es grande.
 */
export function coberturaBasalContraProduccion(): readonly {
  sitio: string; cobertura_pct: number; produccion_g_ms_m2_anio: number;
}[] {
  return CONTRASTE_DE_MANEJO
    .filter(c => c.cobertura_basal_control_pct !== null)
    .map(c => ({
      sitio: c.sitio,
      cobertura_pct: c.cobertura_basal_control_pct as number,
      produccion_g_ms_m2_anio: c.control_g_ms_m2_anio,
    }));
}

/**
 * Lo que mueve la CARGA ANIMAL en el mismo campo, con el mismo clima.
 *
 * Diecisiete años, cinco intensidades, dos sitios ecológicos y tres momentos de
 * la temporada, en el Central Grasslands Research Extension Center de Dakota del
 * Norte. Es el contraste que le faltaba a `CONTRASTE_DE_MANEJO`, donde la
 * variable eran la fertilización y el estado del pastizal: acá la variable es
 * **cuántos animales por hectárea**, que es la que el usuario de acequia decide.
 *
 * ## Qué define cada tratamiento, que no es la carga
 *
 * Esto es lo primero que hay que leer bien, porque es lo que lo hace comparable
 * con esta app. **Los tratamientos se definieron por el forraje que DEJAN en
 * pie**, no por una carga fija: liviano deja el 65 % de lo que se produce en un
 * año medio, moderado el 50 %, fuerte el 35 % y extremo el 20 %. Las fechas de
 * entrada y salida se ajustaban todos los años para cumplir ese objetivo, así que
 * la carga es el RESULTADO y no el tratamiento: 1,3 ± 0,7 / 2,7 ± 1,0 / 4,4 ± 1,2
 * y 6,9 ± 2,1 AUM/ha de media de quince años.
 *
 * O sea que las cuatro intensidades son cuatro **usos admisibles**: 35, 50, 65 y
 * 80 % de cosecha. Y eso las pone en la misma escala que `BANDAS_USO` de
 * `modulacion.ts`, que es la tabla de Holechek.
 *
 * ## El coeficiente de cosecha de acequia cae en el máximo medido
 *
 * Con 454 mm, `bandaUso` devuelve la banda árida: cosechar el **40 %** como carga
 * inicial, con un rango de 35 a 45 %. La producción medida al final de la
 * temporada en los sitios silty, por intensidad:
 *
 * | Manejo | Cosecha | Carga | Total medido |
 * |---|---|---|---|
 * | sin pastoreo | 0 % | 0 | 2.865 |
 * | **liviano** | **35 %** | 1,3 AUM/ha | **3.410** |
 * | moderado | 50 % | 2,7 | 3.156 |
 * | fuerte | 65 % | 4,4 | 2.637 |
 * | extremo | 80 % | 6,9 | 2.501 |
 *
 * El 35 % que es el piso de la banda de acequia **es exactamente el tratamiento
 * liviano, y el liviano es el que más produjo de los cinco.** Es la primera vez
 * en esta cadena que el coeficiente de uso admisible se puede contrastar contra
 * producción medida y no contra otra recomendación: Holechek lo derivó de
 * consideraciones de receptividad, y diecisiete años de corte en un experimento
 * independiente dicen que ese uso es el que maximiza la oferta. Y es falsable en
 * las dos direcciones: cosechando el 65 % la producción cae un 23 % y cosechando
 * el 80 %, un 27 %.
 *
 * ## La curva tiene joroba, y acequia no la puede codificar
 *
 * El descanso total produjo MENOS que el pastoreo liviano: 2.865 contra 3.410, un
 * 19 % menos. Los autores lo atribuyen a la acumulación de broza, que inhibe el
 * crecimiento, y lo presentan como evidencia de la hipótesis de optimización por
 * pastoreo. **Y aun así no se puede escribir un factor de 1,19 por pastorear
 * liviano**, por cuatro razones que están en la propia fuente:
 *
 * 1. En el CPER —el otro sitio de serie larga de este archivo, ver `SERIE_CPER`—
 *    el mismo tipo de experimento dio lo contrario: el no pastoreado fue el más
 *    productivo (Milchunas, Lauenroth y Burke 1994).
 * 2. Las revisiones de Belsky (1986) y Painter y Belsky (1993) no encontraron
 *    evidencia de que la herbivoría beneficie a la planta pastoreada.
 * 3. **El informe anterior de este mismo experimento no vio la joroba**
 *    (Biondini, Patton y Nyren 1998). Apareció al estirar la serie, y los autores
 *    lo marcan: «underscoring the importance of long-term studies».
 * 4. En el otro sitio ecológico del mismo campo —los overflow— no hay joroba
 *    contra el descanso en la media: liviano, moderado y fuerte no se diferencian
 *    entre sí, y si superan al descanso depende de cuánto llovió ese año.
 *
 * Lo que sí se puede escribir es el rango y la advertencia, y es bastante: **el
 * manejo del pastoreo mueve la producción 1,36 veces en el mismo sitio con el
 * mismo clima**, y la dirección no es monótona.
 *
 * ## El signo del efecto depende de la lluvia del año, y está publicado en cm
 *
 * En los sitios overflow la fuente no publica una media del no pastoreado, y por
 * un motivo que vale entender: su producción **no responde a la lluvia** y la de
 * los pastoreados sí, así que la diferencia cambia de signo con el año. En vez de
 * una media publica el umbral, y están en `UMBRAL_P2E_OVERFLOW`: el pastoreado
 * supera al descanso si P2E pasa de 26,70 cm (liviano), 24,84 (moderado), 26,24
 * (fuerte) o 53,15 (extremo); y el extremo produce MENOS que el descanso si P2E
 * no llega a 31,52 cm.
 *
 * Eso es lo más parecido a un modelo de manejo × clima que esta cadena tiene
 * medido: **con poca lluvia el descanso gana, con mucha gana el pastoreo**, y el
 * punto de cruce está publicado para cada intensidad.
 *
 * ## La pendiente de la lluvia es una función del manejo
 *
 * Y es el hallazgo que más le pega a `prodForrajera`, que es una función de la
 * lluvia y nada más. En los sitios silty, al inicio de la temporada:
 *
 * - sin pastoreo: **46,31** kg/ha por cm de P2B (r² 0,58)
 * - liviano: **32,48** kg/ha por cm (r² 0,29)
 * - moderado, fuerte y extremo: **no se distinguen de cero**
 *
 * En los overflow, al final de la temporada, pasa lo contrario: el no pastoreado
 * no responde a la lluvia y los pastoreados suben 46,85 kg/ha por cm (r² 0,42,
 * entre 37,63 y 56,35 según la intensidad).
 *
 * O sea que la pregunta «¿cuánto sube la producción por milímetro?» **no tiene
 * una respuesta en este sitio**: tiene cinco por sitio ecológico y por momento, y
 * dos de ellas son cero. Y el que responde a la lluvia es el descanso en un sitio
 * ecológico y el pastoreo en el otro, en el mismo campo y los mismos años.
 *
 * ## El total esconde un cambio de composición
 *
 * Las gramíneas bajan con la carga y las hierbas de hoja ancha SUBEN. Al inicio
 * de la temporada en los overflow las hierbas van de 115 kg/ha en el descanso a
 * 282 en el extremo —se multiplican por 2,5— mientras las gramíneas bajan. Los
 * autores lo explican: el pastoreo ralea el tapiz y abre huecos para las hierbas
 * de primavera. **Un número de forraje total no ve eso**, y para una carga animal
 * importa, porque no todas las hierbas se comen igual.
 *
 * ## Y un cruce que vale más que todo lo anterior
 *
 * La primera entrada de este archivo es la ficha del NRCS del sitio ecológico
 * Loamy Upland de la MLRA 53B, con 2.643 a 3.063 kg MS/ha/año. **El CGREC está
 * adentro de esa MLRA y en ese sitio ecológico**: el mapa de suelos del punto
 * publicado devuelve el componente Williams al 45 % correlacionado con el sitio
 * ecológico `R053BY011ND` «Loamy», de la MLRA `053B`. Dos métodos que no se
 * parecen en nada —una tabla de comunidad de referencia de un relevamiento de
 * suelos contra diecisiete años de cortar pasto en cinco tratamientos— sobre el
 * mismo sitio ecológico:
 *
 * | | producción | razón entre extremos |
 * |---|---|---|
 * | NRCS, ficha de sitio ecológico | 2.643–3.063 | 0,86 |
 * | CGREC, medido 1989–2005 | 2.501–3.410 | 0,73 |
 *
 * Los rangos se superponen casi del todo y los dos tienen el mismo signo: el
 * extremo de abajo de los dos es un estado de pastoreo intenso y el de arriba, de
 * pastoreo leve. Es la corroboración independiente más fuerte que tiene este
 * archivo, y conviene no sobrevenderla: «pastoreo continuo intenso» de la ficha y
 * «fuerte» del experimento no son la misma definición, y que 2.643 y 2.637 queden
 * a seis kilos es una coincidencia y no una validación al 0,2 %.
 *
 * ## Rango de validez
 *
 * Una estación experimental, dos sitios ecológicos, un clima de 454 mm con el
 * 72 % en la estación de crecimiento, y un pastizal que **no es el original**:
 * era pradera mixta, se aró, volvió a pasto en las sequías de los años 50 y hoy
 * lo dominan dos gramíneas introducidas invasoras, Poa pratensis y Bromus
 * inermis. Un pastizal nativo puede responder distinto al mismo manejo. Y el
 * ganado es bovino: las tablas de ovino y caprino de `modulacion.ts` no se tocan
 * con esto.
 *
 * **Qué se rompe si cambia:** nada calcula con estas filas todavía. Lo que ya
 * cambian es lo que `prodForrajera` y `bandaUso` tienen escrito arriba de su
 * propio código.
 */
export type IntensidadDePastoreo =
  | 'sin_pastoreo'
  | 'liviano'
  | 'moderado'
  | 'fuerte'
  | 'extremo';

/** En qué momento de la temporada se cortó. */
export type MomentoDeLaTemporada = 'inicio' | 'pico' | 'fin';

export interface FilaDeCarga {
  /**
   * Sitio ecológico. `silty` son lomadas de suelo profundo; `overflow`, bajos que
   * reciben el escurrimiento de arriba. **No se juntan**: la fuente mide una
   * interacción significativa entre sitio ecológico e intensidad de pastoreo.
   */
  sitio_ecologico: 'silty' | 'overflow';
  momento: MomentoDeLaTemporada;
  intensidad: IntensidadDePastoreo;
  /** Carga media de 1991 a 2005, AUM/ha. Cero en la exclusión. */
  carga_aum_ha: number;
  /** Desvío de la carga entre años, AUM/ha. `null` en la exclusión. */
  carga_sd_aum_ha: number | null;
  /**
   * Forraje que el tratamiento DEJA en pie al final de la temporada, en % de lo
   * producido en un año medio. Es la definición del tratamiento, y su complemento
   * es el uso admisible: 100 − este número.
   */
  remanente_pct: number;
  /** kg/ha, media ajustada por covarianza. `null` cuando la fuente no publica una. */
  gramineas: number | null;
  hierbas: number | null;
  /**
   * `null` en los silty, y no por falta de dato: ahí los arbustos no son un grupo
   * aparte y están contados con las hierbas —«with occasional shrubs being placed
   * with forbs»—.
   */
  arbustos: number | null;
  total: number | null;
  /** Tabla de la que sale la fila. */
  tabla: string;
}

/**
 * Las treinta filas, transcritas de las Tablas 2 a 7 abriendo el PDF.
 *
 * **Dos de las seis tablas tienen columnas de umbral intercaladas entre las de
 * producción**, y es la trampa que se comió la entrega del lote 18: en la Tabla 2
 * el orden real es gramíneas, umbral de T2B, hierbas, arbustos, total, umbral,
 * umbral. Leer el encabezado resumido —«gramíneas, hierbas, arbustos, total»— y
 * contar columnas de izquierda a derecha corre todo un lugar, y entonces los
 * umbrales de temperatura entran como producción de hierbas.
 *
 * La segunda evidencia que lo atrapa, y que la regla S del encargo pedía, está en
 * la última fila de cada tabla: **el error estándar agrupado tiene un valor por
 * columna de producción y ninguno por columna de umbral.** La Tabla 2 trae cuatro
 * (47, 16, 12, 46) y la Tabla 3, tres (48, 11, 48). Si la lectura produce cinco
 * columnas de producción en una tabla con cuatro errores estándar, la lectura
 * está mal. Es una verificación que no necesita la fuente original: se hace con la
 * tabla a la vista.
 */
export const CARGA_CGREC: readonly FilaDeCarga[] = [
  // --- silty, inicio de la temporada (Tabla 3). SE agrupado 48 / 11 / 48.
  { sitio_ecologico: 'silty', momento: 'inicio', intensidad: 'sin_pastoreo', carga_aum_ha: 0,   carga_sd_aum_ha: null, remanente_pct: 100, gramineas: 1383, hierbas:  76, arbustos: null, total: 1469, tabla: 'Tabla 3' },
  { sitio_ecologico: 'silty', momento: 'inicio', intensidad: 'liviano',      carga_aum_ha: 1.3, carga_sd_aum_ha: 0.7,  remanente_pct:  65, gramineas: 1478, hierbas:  59, arbustos: null, total: 1546, tabla: 'Tabla 3' },
  { sitio_ecologico: 'silty', momento: 'inicio', intensidad: 'moderado',     carga_aum_ha: 2.7, carga_sd_aum_ha: 1.0,  remanente_pct:  50, gramineas: 1208, hierbas: 140, arbustos: null, total: 1371, tabla: 'Tabla 3' },
  { sitio_ecologico: 'silty', momento: 'inicio', intensidad: 'fuerte',       carga_aum_ha: 4.4, carga_sd_aum_ha: 1.2,  remanente_pct:  35, gramineas:  868, hierbas: 155, arbustos: null, total: 1048, tabla: 'Tabla 3' },
  { sitio_ecologico: 'silty', momento: 'inicio', intensidad: 'extremo',      carga_aum_ha: 6.9, carga_sd_aum_ha: 2.1,  remanente_pct:  20, gramineas:  693, hierbas: 159, arbustos: null, total:  875, tabla: 'Tabla 3' },
  // --- silty, pico (Tabla 5). SE agrupado 75 / 45 / 85.
  { sitio_ecologico: 'silty', momento: 'pico', intensidad: 'sin_pastoreo', carga_aum_ha: 0,   carga_sd_aum_ha: null, remanente_pct: 100, gramineas: 2340, hierbas: 409, arbustos: null, total: 2765, tabla: 'Tabla 5' },
  { sitio_ecologico: 'silty', momento: 'pico', intensidad: 'liviano',      carga_aum_ha: 1.3, carga_sd_aum_ha: 0.7,  remanente_pct:  65, gramineas: 2565, hierbas: 607, arbustos: null, total: 3186, tabla: 'Tabla 5' },
  { sitio_ecologico: 'silty', momento: 'pico', intensidad: 'moderado',     carga_aum_ha: 2.7, carga_sd_aum_ha: 1.0,  remanente_pct:  50, gramineas: 2177, hierbas: 683, arbustos: null, total: 2888, tabla: 'Tabla 5' },
  { sitio_ecologico: 'silty', momento: 'pico', intensidad: 'fuerte',       carga_aum_ha: 4.4, carga_sd_aum_ha: 1.2,  remanente_pct:  35, gramineas: 1763, hierbas: 671, arbustos: null, total: 2453, tabla: 'Tabla 5' },
  { sitio_ecologico: 'silty', momento: 'pico', intensidad: 'extremo',      carga_aum_ha: 6.9, carga_sd_aum_ha: 2.1,  remanente_pct:  20, gramineas: 1631, hierbas: 495, arbustos: null, total: 2145, tabla: 'Tabla 5' },
  // --- silty, fin de la temporada (Tabla 6). SE agrupado 90 / 55 / 98.
  // Es la fila anual: el pico de la jaula más el crecimiento del pico al final.
  { sitio_ecologico: 'silty', momento: 'fin', intensidad: 'sin_pastoreo', carga_aum_ha: 0,   carga_sd_aum_ha: null, remanente_pct: 100, gramineas: 2466, hierbas: 387, arbustos: null, total: 2865, tabla: 'Tabla 6' },
  { sitio_ecologico: 'silty', momento: 'fin', intensidad: 'liviano',      carga_aum_ha: 1.3, carga_sd_aum_ha: 0.7,  remanente_pct:  65, gramineas: 2771, hierbas: 632, arbustos: null, total: 3410, tabla: 'Tabla 6' },
  { sitio_ecologico: 'silty', momento: 'fin', intensidad: 'moderado',     carga_aum_ha: 2.7, carga_sd_aum_ha: 1.0,  remanente_pct:  50, gramineas: 2429, hierbas: 699, arbustos: null, total: 3156, tabla: 'Tabla 6' },
  { sitio_ecologico: 'silty', momento: 'fin', intensidad: 'fuerte',       carga_aum_ha: 4.4, carga_sd_aum_ha: 1.2,  remanente_pct:  35, gramineas: 1974, hierbas: 651, arbustos: null, total: 2637, tabla: 'Tabla 6' },
  { sitio_ecologico: 'silty', momento: 'fin', intensidad: 'extremo',      carga_aum_ha: 6.9, carga_sd_aum_ha: 2.1,  remanente_pct:  20, gramineas: 1982, hierbas: 510, arbustos: null, total: 2501, tabla: 'Tabla 6' },
  // --- overflow, inicio (Tabla 2). SE agrupado 47 / 16 / 12 / 46.
  // La referencia de los umbrales de esta tabla es el tratamiento EXTREMO, y por
  // eso su media de gramíneas y de total no se publica.
  { sitio_ecologico: 'overflow', momento: 'inicio', intensidad: 'sin_pastoreo', carga_aum_ha: 0,   carga_sd_aum_ha: null, remanente_pct: 100, gramineas:  920, hierbas: 115, arbustos: 124, total: 1194, tabla: 'Tabla 2' },
  { sitio_ecologico: 'overflow', momento: 'inicio', intensidad: 'liviano',      carga_aum_ha: 1.3, carga_sd_aum_ha: 0.7,  remanente_pct:  65, gramineas: 1017, hierbas: 136, arbustos:  64, total: 1273, tabla: 'Tabla 2' },
  { sitio_ecologico: 'overflow', momento: 'inicio', intensidad: 'moderado',     carga_aum_ha: 2.7, carga_sd_aum_ha: 1.0,  remanente_pct:  50, gramineas: 1095, hierbas: 180, arbustos:  77, total: 1428, tabla: 'Tabla 2' },
  { sitio_ecologico: 'overflow', momento: 'inicio', intensidad: 'fuerte',       carga_aum_ha: 4.4, carga_sd_aum_ha: 1.2,  remanente_pct:  35, gramineas:  998, hierbas: 227, arbustos: 106, total: 1402, tabla: 'Tabla 2' },
  { sitio_ecologico: 'overflow', momento: 'inicio', intensidad: 'extremo',      carga_aum_ha: 6.9, carga_sd_aum_ha: 2.1,  remanente_pct:  20, gramineas: null, hierbas: 282, arbustos:  41, total: null, tabla: 'Tabla 2' },
  // --- overflow, pico (Tabla 4). SE agrupado 102 / 76 / 57 / 134.
  { sitio_ecologico: 'overflow', momento: 'pico', intensidad: 'sin_pastoreo', carga_aum_ha: 0,   carga_sd_aum_ha: null, remanente_pct: 100, gramineas: 2351, hierbas:  755, arbustos: 464, total: 3574, tabla: 'Tabla 4' },
  { sitio_ecologico: 'overflow', momento: 'pico', intensidad: 'liviano',      carga_aum_ha: 1.3, carga_sd_aum_ha: 0.7,  remanente_pct:  65, gramineas: 2424, hierbas: 1424, arbustos: 381, total: 4194, tabla: 'Tabla 4' },
  { sitio_ecologico: 'overflow', momento: 'pico', intensidad: 'moderado',     carga_aum_ha: 2.7, carga_sd_aum_ha: 1.0,  remanente_pct:  50, gramineas: 2521, hierbas: 1171, arbustos: 509, total: 4172, tabla: 'Tabla 4' },
  { sitio_ecologico: 'overflow', momento: 'pico', intensidad: 'fuerte',       carga_aum_ha: 4.4, carga_sd_aum_ha: 1.2,  remanente_pct:  35, gramineas: 2290, hierbas: 1286, arbustos: 667, total: 4191, tabla: 'Tabla 4' },
  { sitio_ecologico: 'overflow', momento: 'pico', intensidad: 'extremo',      carga_aum_ha: 6.9, carga_sd_aum_ha: 2.1,  remanente_pct:  20, gramineas: 1719, hierbas:  850, arbustos: 269, total: 2769, tabla: 'Tabla 4' },
  // --- overflow, fin (Tabla 7). SE agrupado 115 / 80 / 49 / 137.
  // Acá la referencia de los umbrales es el NO PASTOREADO, y por eso es el que no
  // tiene media de gramíneas ni de total.
  { sitio_ecologico: 'overflow', momento: 'fin', intensidad: 'sin_pastoreo', carga_aum_ha: 0,   carga_sd_aum_ha: null, remanente_pct: 100, gramineas: null, hierbas:  575, arbustos: 387, total: null, tabla: 'Tabla 7' },
  { sitio_ecologico: 'overflow', momento: 'fin', intensidad: 'liviano',      carga_aum_ha: 1.3, carga_sd_aum_ha: 0.7,  remanente_pct:  65, gramineas: 2556, hierbas: 1283, arbustos: 285, total: 4131, tabla: 'Tabla 7' },
  { sitio_ecologico: 'overflow', momento: 'fin', intensidad: 'moderado',     carga_aum_ha: 2.7, carga_sd_aum_ha: 1.0,  remanente_pct:  50, gramineas: 2861, hierbas: 1152, arbustos: 356, total: 4360, tabla: 'Tabla 7' },
  { sitio_ecologico: 'overflow', momento: 'fin', intensidad: 'fuerte',       carga_aum_ha: 4.4, carga_sd_aum_ha: 1.2,  remanente_pct:  35, gramineas: 2510, hierbas: 1259, arbustos: 556, total: 4362, tabla: 'Tabla 7' },
  { sitio_ecologico: 'overflow', momento: 'fin', intensidad: 'extremo',      carga_aum_ha: 6.9, carga_sd_aum_ha: 2.1,  remanente_pct:  20, gramineas: 1982, hierbas:  902, arbustos: 155, total: 3087, tabla: 'Tabla 7' },
] as const;

/**
 * Los errores estándar agrupados de cada tabla, en el orden de las columnas de
 * producción.
 *
 * Está acá por lo que dice el comentario de `CARGA_CGREC`: **son el conteo de
 * columnas de producción de cada tabla**, y por eso sirven para verificar que la
 * transcripción no se corrió un lugar. Hay un test que los cuenta.
 */
export const SE_AGRUPADO_CGREC = {
  'Tabla 2': { gramineas: 47, hierbas: 16, arbustos: 12, total: 46 },
  'Tabla 3': { gramineas: 48, hierbas: 11, arbustos: null, total: 48 },
  'Tabla 4': { gramineas: 102, hierbas: 76, arbustos: 57, total: 134 },
  'Tabla 5': { gramineas: 75, hierbas: 45, arbustos: null, total: 85 },
  'Tabla 6': { gramineas: 90, hierbas: 55, arbustos: null, total: 98 },
  'Tabla 7': { gramineas: 115, hierbas: 80, arbustos: 49, total: 137 },
} as const;

/**
 * Las pendientes publicadas al FINAL de la temporada, que es la cifra anual.
 *
 * **La lluvia está en cm**, que es como la publica la fuente: para pasar a
 * kg/ha por mm hay que dividir por diez. Es exactamente la clase de conversión
 * que `skills/motor-de-calculo` manda escribir en el nombre.
 *
 * El dato que importa es `interactua_con_la_carga`: donde es `true`, no existe
 * una pendiente del sitio, existe una por tratamiento.
 */
export const PENDIENTES_CGREC_FIN = {
  silty: {
    gramineas_kg_ha_cm: 20.75,
    gramineas_kg_ha_c: 0.35,
    hierbas_kg_ha_cm: 7.10,
    total_kg_ha_cm: 28.63,
    total_kg_ha_c: 0.29,
    interactua_con_la_carga: false,
    nota: 'Ni la lluvia ni la temperatura interactúan con la intensidad de pastoreo al final de la temporada en los silty: una sola pendiente para los cinco tratamientos.',
  },
  overflow: {
    // Sólo los pastoreados. El no pastoreado no responde a ninguna de las dos.
    gramineas_kg_ha_cm: 31.44,
    gramineas_kg_ha_c: 0.24,
    hierbas_kg_ha_cm: 7.75,
    arbustos_kg_ha_cm: 4.23,
    arbustos_kg_ha_c: -0.08,
    total_kg_ha_cm: 46.85,
    total_r2: 0.42,
    total_min_kg_ha_cm: 37.63,
    total_max_kg_ha_cm: 56.35,
    interactua_con_la_carga: true,
    nota: 'El no pastoreado no responde ni a la lluvia ni a la temperatura; los cuatro pastoreados suben 46,85 kg/ha por cm de P2E y entre ellos no se diferencian.',
  },
} as const;

/**
 * El umbral de lluvia del año agrícola por encima del cual el pastoreo supera al
 * descanso, en los sitios overflow y para la producción total. En **cm** de P2E.
 *
 * Es el modelo de manejo × clima que la fuente publica como números. Debajo de
 * `extremo_por_debajo_de`, el pastoreo extremo produce MENOS que el descanso;
 * entre ese valor y su propio umbral, los dos no se distinguen.
 */
export const UMBRAL_P2E_OVERFLOW = {
  liviano: 26.70,
  moderado: 24.84,
  fuerte: 26.24,
  extremo: 53.15,
  extremo_por_debajo_de: 31.52,
} as const;

/** Las filas de un sitio ecológico y un momento, en orden de carga creciente. */
export function filasDeCarga(
  sitio_ecologico: 'silty' | 'overflow',
  momento: MomentoDeLaTemporada,
): readonly FilaDeCarga[] {
  return CARGA_CGREC
    .filter(f => f.sitio_ecologico === sitio_ecologico && f.momento === momento)
    .slice()
    .sort((a, b) => a.carga_aum_ha - b.carga_aum_ha);
}

/**
 * Cuántas veces produce un tratamiento respecto del DESCANSO del mismo sitio y
 * momento. `null` si a alguno de los dos le falta la media publicada.
 */
export function factorDeCarga(f: FilaDeCarga): number | null {
  const descanso = CARGA_CGREC.find(
    x => x.sitio_ecologico === f.sitio_ecologico
      && x.momento === f.momento
      && x.intensidad === 'sin_pastoreo',
  );
  if (!descanso || descanso.total === null || f.total === null) return null;
  return f.total / descanso.total;
}

/**
 * El uso admisible que define cada tratamiento, como fracción.
 *
 * Es el complemento del remanente, y es lo que lo hace comparable con
 * `BANDAS_USO` de `modulacion.ts`.
 */
export function usoDelTratamiento(f: FilaDeCarga): number {
  return (100 - f.remanente_pct) / 100;
}

/**
 * Cuál de los tratamientos medidos produjo más, en un sitio ecológico y momento.
 *
 * Devuelve `null` si no hay ninguna fila con total publicado.
 */
export function cargaQueMasProduce(
  sitio_ecologico: 'silty' | 'overflow',
  momento: MomentoDeLaTemporada,
): FilaDeCarga | null {
  const con = filasDeCarga(sitio_ecologico, momento).filter(f => f.total !== null);
  if (con.length === 0) return null;
  return con.reduce((a, b) => ((b.total as number) > (a.total as number) ? b : a));
}

/**
 * ¿El pastoreo supera al descanso con esta lluvia? Sólo para los overflow y para
 * la producción total, que es lo único que la fuente publica así.
 *
 * `true` si lo supera, `false` si produce menos, `null` si la fuente dice que con
 * esa lluvia los dos no se distinguen —que es una respuesta y no una falta de
 * dato—.
 */
export function pastoreoSuperaAlDescanso(
  intensidad: Exclude<IntensidadDePastoreo, 'sin_pastoreo'>,
  p2e_cm: number,
): boolean | null {
  const umbral = UMBRAL_P2E_OVERFLOW[intensidad];
  if (intensidad === 'extremo') {
    if (p2e_cm < UMBRAL_P2E_OVERFLOW.extremo_por_debajo_de) return false;
    if (p2e_cm > umbral) return true;
    return null;
  }
  return p2e_cm > umbral ? true : null;
}

/** La fracción aérea de una fila de Montecillo. Vale también para la fila en carbono. */
export function fraccionAerea(f: { anpp: number; tnpp: number }): number {
  return f.anpp / f.tnpp;
}

/**
 * Un par publicado del que se puede intentar sacar una fracción comible.
 *
 * `mismo_muestreo` es el campo que decide si el cociente significa algo. Si es
 * `false`, el numerador y el denominador no cubren el mismo tiempo, el mismo
 * tratamiento o la misma cosecha, y entonces el cociente NO es una fracción: está
 * en la tabla para mostrar cuánto se mueve el número cuando nadie mira de dónde
 * sale cada término.
 */
export interface ParComible {
  sitio: string;
  /** Lo que la fuente clasifica como forrajero, en kg MS/ha. */
  forrajera: number;
  /** El denominador, en LA MISMA unidad. */
  total: number;
  /** Qué incluye el denominador, con las palabras de la fuente. */
  que_incluye_el_total: string;
  /** Misma fecha, mismo tratamiento, misma unidad temporal. */
  mismo_muestreo: boolean;
  fuente: string;
}

/**
 * La tercera fracción de la cadena: cuánto de la capa herbácea es comible.
 *
 * Un solo sitio, y un solo par válido. El pastizal de albardón de la isla de
 * Baradero publica en el cuerpo del artículo, para la misma cosecha de verano y
 * el mismo tratamiento sin cortes, 10.533 kg MS/ha de materia seca VIVA total y
 * 6.733 de materia seca viva FORRAJERA. **0,639.**
 *
 * Las otras dos filas son el mismo sitio contado mal, y están para que se vea el
 * costo: la conclusión de la tesis pone «entre 11200 y 11400 kg ha-1» de MS total
 * del período de tres estaciones al lado de «entre 6700 y 8250 kg» de MS forrajera,
 * donde el 6.700 es una cosecha de verano y el 8.250 una suma de tres cosechas. El
 * abanico de cocientes va de **0,588 a 0,737**, y el ancho es un artefacto de
 * mezclar unidades temporales: no hay variabilidad ecológica ahí, hay aritmética
 * descuidada. El par bueno cae adentro de ese abanico, lo cual es lo peor que
 * podía pasar, porque significa que el error no se nota.
 *
 * **Qué cuenta como forrajero.** La clasificación es botánica y es del autor: las
 * forrajeras del sitio son casi todas gramíneas y predomina *Cynodon dactylon*; la
 * no forrajera que más pesa es *Xanthium cavallinesii*, el abrojo grande, que
 * crece fuerte en verano. **No es dieta observada ni palatabilidad medida**: es
 * aptitud forrajera asignada por especie. Un bovino podría comer menos que eso, o
 * elegir distinto.
 *
 * **Rango de validez.** Un sitio, un año, una cosecha de verano, una clausura de
 * 4 × 4 m en un pastizal que el propio trabajo declara degradado por sobrepastoreo
 * previo —y lo declara con esta frase, que es la que limita el número: *«La
 * recuperación inicial de la cobertura a partir del grupo de especies no
 * forrajeras, revela la degradación del pastizal a causa de la alta presión de
 * pastoreo previa»*. En un pastizal sano la fracción sería más alta. No hay una
 * segunda medición con la que acotar eso.
 *
 * **Qué se rompe si cambia:** nada calcula con esto todavía. Es el primer valor de
 * la tercera fracción y queda como piso documentado, al lado de la segunda
 * fracción de `FRACCION_HERBACEA_DEL_SITIO`.
 */
export const FRACCION_COMIBLE: readonly ParComible[] = [
  {
    sitio: 'Pastizal de albardón, isla de Baradero, Delta Medio del Paraná — cosecha de verano, tratamiento S',
    forrajera: 6733,
    total: 10533,
    que_incluye_el_total: 'MS VIVA total sobre 7 cm: forrajeras más no forrajeras, sin la materia seca muerta',
    mismo_muestreo: true,
    fuente: 'Marino, G. D. — Efectos del pastoreo en riqueza florística, biomasa y cobertura de un pastizal de albardón, Argentina (Revista Politécnica), cuerpo de resultados',
  },
  {
    sitio: 'El mismo sitio, la cosecha de verano de S contra el total del PERÍODO (cota baja)',
    forrajera: 6700,
    total: 11400,
    que_incluye_el_total: 'MS total de primavera-verano-otoño, que incluye la materia seca muerta',
    mismo_muestreo: false,
    fuente: 'Universidad Nacional de Rosario — tesis de maestría, conclusiones',
  },
  {
    sitio: 'El mismo sitio, la cosecha ACUMULADA de C contra el total del período (cota alta)',
    forrajera: 8250,
    total: 11200,
    que_incluye_el_total: 'MS total de primavera-verano-otoño; el numerador es la suma de tres cosechas sucesivas',
    mismo_muestreo: false,
    fuente: 'Universidad Nacional de Rosario — tesis de maestría, conclusiones',
  },
] as const;

/** El cociente de una fila. Sin conversiones: las dos cifras vienen en kg MS/ha. */
export function fraccionComible(p: ParComible): number {
  return p.forrajera / p.total;
}

/** Sólo los pares que de verdad son una fracción. Hoy devuelve uno. */
export function paresComibles(): readonly ParComible[] {
  return FRACCION_COMIBLE.filter(p => p.mismo_muestreo);
}

/**
 * El pastoreo de Glencoe, que mide lo que la cadena del forraje nunca había
 * medido: cuánto se saca de un pastizal cuando el animal come a voluntad.
 *
 * Unidad Experimental Glencoe del INIA, campo natural sobre basalto en Paysandú,
 * Uruguay. 32°00′24″ S, 57°08′01″ W → `ECO_ID` 574, Uruguayan savanna, bioma 7
 * verificado contra RESOLVE. 1.300 a 1.400 mm de lluvia media anual. Veintidós
 * vaquillonas Hereford de unos 198 kg en dos grupos de once, diseño cruzado, dos
 * períodos de quince días de octubre a noviembre de 2022. El consumo individual se
 * estimó con producción fecal y digestibilidad, con TiO₂ como marcador externo.
 *
 * **Por qué no entra en `FORRAJE_MEDIDO`:** las masas son stock en pie sobre 5 cm
 * antes y después de un pastoreo de cinco días, no producción anual, y el trabajo
 * no publica la tasa de acumulación que haría falta para anualizarlas. Además el
 * fósforo del suelo se mantuvo en 10 ppm por fertilización en los dos tratamientos.
 *
 * ## Lo que mide, y es lo que faltaba
 *
 * | tratamiento | en pie pre | en pie post | se fue | % de lo que había |
 * |---|---|---|---|---|
 * | campo natural | 1.387 | 971 | 416 | **30,0 %** |
 * | con Lotus | 2.372 | 1.866 | 506 | **21,3 %** |
 *
 * Los dos tratamientos recibieron la misma oferta objetivo —6 kg MS por 100 kg de
 * peso vivo por día, y la oferta lograda fue 6,1 y 6,5 %, sin diferencia
 * estadística— y el animal comió prácticamente lo mismo en los dos: 6,35 y 6,67 kg
 * MS por día, con `p = 0,314`. Pero el pastizal con Lotus tenía **1,71 veces** más
 * pasto parado. La consecuencia es aritmética y es la que importa: **la fracción
 * que se saca no es una propiedad del pasto, es la demanda del animal dividida por
 * lo que hay.** Con más pasto, la misma boca saca una fracción menor: 0,71 veces.
 *
 * Y las dos desapariciones absolutas, 416 y 506 kg/ha, son indistinguibles: el
 * error estándar publicado de cada masa es 112 kg/ha, así que el de cada diferencia
 * es unos 158, y los intervalos 258-574 y 348-664 se superponen por completo. Eso
 * cierra el argumento con la dispersión de la propia fuente y sin suponer nada: el
 * animal se llevó la misma cantidad de los dos potreros, como su consumo medido
 * indica, y la diferencia de porcentaje la hizo el denominador.
 *
 * ## El número que NO hay que comparar con `BANDAS_USO`
 *
 * Estos 21 a 30 % **no refutan** el 45 a 60 % de Holechek que `modulacion.ts` usa
 * para el pastizal húmedo, y la tentación de «corregir» esa tabla con esta
 * medición es el error que este bloque existe para bloquear. Son denominadores
 * distintos: el coeficiente de cosecha de Holechek es una fracción del
 * **crecimiento de la temporada** y estos 21 a 30 % son una fracción del **stock
 * en pie en un momento**, sacada en cinco días. Un pastizal que se pastorea toda
 * la temporada acumula varios eventos como éste sobre un pasto que rebrota entre
 * uno y otro.
 *
 * Lo que sí se puede poner al lado, porque las dos son adimensionales y las dos
 * preguntan qué proporción de lo disponible termina en el animal, es el cociente
 * entre lo comido y lo ofrecido, los dos publicados como porcentaje del peso vivo:
 * 3,1 sobre 6,1 y 3,3 sobre 6,5. Da **0,508 en los dos tratamientos**, con tres
 * decimales iguales, a pesar de las 1,71 veces de diferencia en el pasto parado.
 * Que caiga sobre el 0,50 de Holechek para el pastizal húmedo es una coincidencia
 * de la que no se puede derivar nada —la oferta es un objetivo de manejo elegido
 * por el investigador, no una propiedad del campo—, pero es la primera medición de
 * esta cadena que toca el orden de magnitud de ese coeficiente desde abajo.
 *
 * **Qué se rompe si cambia:** nada. Es contraste y es guardia, como el Miami Model.
 *
 * Fuente: Beretta et al. (2024), *Addition of Tannin-Containing Legumes to Native
 * Grasslands: Effects on Enteric Methane Emissions, Nitrogen Losses and Animal
 * Performance of Beef Cattle*, Sustainability 16(21):9135, CC-BY. Tabla 2 para las
 * masas y la oferta, Tabla 3 para el consumo.
 */
export const UTILIZACION_GLENCOE = {
  SITIO: 'Unidad Experimental Glencoe, INIA, Paysandú, Uruguay',
  COORDENADA: '32°00′24″ S, 57°08′01″ W',
  BIOMA: 'resolve_sabana_tropical',
  ECO_ID: 574,
  LLUVIA_MM_MIN: 1300,
  LLUVIA_MM_MAX: 1400,
  /** Error estándar publicado de cada masa en pie, en kg MS/ha. */
  SEM_MASA_KG_HA: 112,
  /** Error estándar publicado del consumo, en kg MS/animal/día. */
  SEM_CONSUMO_KG_DIA: 0.47,
  /** Días del pastoreo que separan el muestreo pre del post. */
  DIAS_DE_PASTOREO: 5,
  TRATAMIENTOS: [
    {
      id: 'NG',
      nombre: 'campo natural',
      masa_pre_kg_ha: 1387,
      masa_pos_kg_ha: 971,
      ofrecido_pct_pv: 6.1,
      consumo_kg_animal_dia: 6.35,
      consumo_pct_pv: 3.1,
    },
    {
      id: 'NG+L',
      nombre: 'campo natural con Lotus',
      masa_pre_kg_ha: 2372,
      masa_pos_kg_ha: 1866,
      ofrecido_pct_pv: 6.5,
      consumo_kg_animal_dia: 6.67,
      consumo_pct_pv: 3.3,
    },
  ],
} as const;

/**
 * La fracción del stock en pie que desapareció en el pastoreo.
 *
 * **No es consumo.** La desaparición aparente incluye pisoteo, caída y cualquier
 * pérdida entre los dos muestreos, y por eso el trabajo publica el consumo por
 * separado y con marcador. Y **no es un coeficiente de cosecha**: el denominador
 * es stock, no crecimiento de la temporada. Ver la advertencia de arriba.
 */
export function utilizacionAparente(t: { masa_pre_kg_ha: number; masa_pos_kg_ha: number }): number {
  return (t.masa_pre_kg_ha - t.masa_pos_kg_ha) / t.masa_pre_kg_ha;
}

/**
 * Lo comido sobre lo ofrecido, con las dos cifras en porcentaje del peso vivo.
 *
 * Es el único cociente de este bloque que se puede mirar al lado de un
 * coeficiente de uso, porque los dos son adimensionales y preguntan lo mismo. Da
 * 0,508 en los dos tratamientos de Glencoe.
 */
export function fraccionDelOfrecido(t: { consumo_pct_pv: number; ofrecido_pct_pv: number }): number {
  return t.consumo_pct_pv / t.ofrecido_pct_pv;
}

/** Las mediciones que hay para un bioma global. Vacío es «no hay», y es común. */
/**
 * Un año de la serie más larga que tiene este archivo.
 *
 * `forraje_aire_seco` está en g/m²/año y **en aire-seco**, que es como lo publica
 * la fuente; para pasarlo a materia seca de estufa hay que usar
 * `ECUACION_FORRAJE_A_ANPP`, que no es un factor sino una recta con ordenada.
 *
 * `ubicaciones` es cuántos lugares del campo se muestrearon ese año, y no es un
 * detalle: **no son los mismos todos los años, y tienen historias de pastoreo
 * distintas**. Va en la estructura para que nadie lea un año contra otro como si
 * fuera la misma parcela.
 */
export interface AnioCPER {
  anio: number;
  /** Precipitación anual medida ese año, mm. */
  lluvia_mm: number;
  /** Producción forrajera, g/m²/año, AIRE-SECO. */
  forraje_aire_seco: number;
  /** Desvío estándar entre las ubicaciones muestreadas ese año. */
  sd: number;
  /** Cuántas ubicaciones se muestrearon ese año: de 3 a 35. */
  ubicaciones: number;
}

/**
 * Cincuenta años de lluvia y producción en el mismo campo.
 *
 * Central Plains Experimental Range, estepa de pasto corto del norte de Colorado,
 * 1939 a 1990 salvo 1940 y 1980, de Lauenroth y Sala (1992), Tabla 1.
 *
 * **Para qué está acá.** Todo lo demás en este archivo es un punto: un sitio, un
 * año o dos, una cifra. `prodForrajera` es una función de la lluvia, y con puntos
 * de sitios distintos no se la puede evaluar, porque cada sitio cambia a la vez la
 * lluvia y todo lo demás. Cincuenta años del mismo campo cambian la lluvia y dejan
 * casi todo lo demás quieto, que es el experimento que hacía falta.
 *
 * **Qué dice.** La lluvia anual explica el **39 %** de la variación de la
 * producción en este sitio, y la ecuación publicada es
 * `Forraje = 13 + 0,172 × lluvia` (F = 30,83; gl = 1,48; P < 0,001; r² = 0,39).
 * El test de este módulo la vuelve a ajustar desde estas cincuenta filas por
 * cuadrados mínimos: si alguien toca un año, los coeficientes dejan de dar.
 *
 * **Lo que NO dice, y acá hay que leer las dos correcciones en orden.** La estepa
 * de Río Mayo sugería que la respuesta a la lluvia es asimétrica —la sequía baja
 * la producción y la lluvia de más no la sube—. En este campo eso **no se
 * replica**: agrupando por años secos, normales y húmedos, los secos caen un 30 %
 * y los húmedos suben un 30 %.
 *
 * El lote 15 concluyó de ahí que la asimetría «no se puede generalizar» porque
 * salía de cinco años con dos métodos distintos. **La primera mitad era correcta y
 * la segunda se pasó de largo**, y lo mostró el lote 16 al traer los quince años
 * de Río Mayo con un solo método, en `SERIE_RIO_MAYO`: ahí la asimetría del total
 * sigue estando, y fuerte —los años secos caen un 35 % y los húmedos no suben, se
 * quedan 4 % abajo de los normales—, con el doble de años y sin mezclar métodos.
 * Y con la capa de gramíneas aparece algo peor que una asimetría: los dos extremos
 * producen menos que el medio, un 31 % abajo en los secos y un 25 % en los
 * húmedos. (Son cuatro a seis años por grupo: alcanza para mostrar que no se
 * desarma, no para ponerle número a la curva.)
 *
 * **Entonces la asimetría es del sitio y no de la producción.** Lo que no se
 * puede es escribirla como propiedad general, que es lo que hizo el lote 14; y lo
 * que tampoco se puede es declararla artefacto, que es lo que hice en el 15. La
 * otra asimetría, la que sí es general porque es del modelo y no del campo, es la
 * del ERROR de un modelo espacial: ver `MODELO_REGIONAL_SALA_1988`.
 *
 * **Lo que explica el otro 61 %.** Dos cosas que el trabajo nombra. La primera es
 * el tamaño de los eventos de lluvia: un modelo con los cuatro rangos de tamaño
 * llega a r² = 0,45, y los eventos de 15 a 30 mm solos ya dan 0,33, porque son los
 * que mojan las capas de suelo que mandan en la producción. La segunda es el
 * retardo: 1954 y 1964 fueron sequías extremas, y los años siguientes llovió
 * normal —328 y 371 mm— y la producción siguió baja, 32 y 48 g/m². **La
 * producción de un año depende del estado en que la dejó el anterior**, y una
 * función de la lluvia del año no tiene dónde guardar eso.
 *
 * **Rango de validez.** Un sitio, dominado al 90 % por *Bouteloua gracilis*, con
 * 321 ± 98 mm de lluvia media. Las ubicaciones cambian año a año: sirve para la
 * relación lluvia-producción y no para comparar un año contra otro.
 *
 * **Qué se rompe si cambia:** nada calcula con esto. Es la evidencia de por qué
 * `prodForrajera` tiene que cambiar y de en qué dirección.
 */
export const SERIE_CPER: readonly AnioCPER[] = [
  { anio: 1939, lluvia_mm: 117, forraje_aire_seco:  50, sd:  12.1, ubicaciones: 11 },
  { anio: 1941, lluvia_mm: 325, forraje_aire_seco:  74, sd:  11.3, ubicaciones: 10 },
  { anio: 1942, lluvia_mm: 371, forraje_aire_seco: 123, sd:  33.3, ubicaciones:  7 },
  { anio: 1943, lluvia_mm: 490, forraje_aire_seco: 123, sd:  32.6, ubicaciones: 13 },
  { anio: 1944, lluvia_mm: 205, forraje_aire_seco:  75, sd:  24.2, ubicaciones:  7 },
  { anio: 1945, lluvia_mm: 288, forraje_aire_seco:  66, sd:  19.5, ubicaciones:  7 },
  { anio: 1946, lluvia_mm: 296, forraje_aire_seco:  67, sd:  15.2, ubicaciones:  9 },
  { anio: 1947, lluvia_mm: 338, forraje_aire_seco:  96, sd:  25.9, ubicaciones:  9 },
  { anio: 1948, lluvia_mm: 193, forraje_aire_seco:  50, sd:  14.5, ubicaciones: 10 },
  { anio: 1949, lluvia_mm: 341, forraje_aire_seco:  82, sd:  13.4, ubicaciones:  8 },
  { anio: 1950, lluvia_mm: 299, forraje_aire_seco:  54, sd:  20.7, ubicaciones: 18 },
  { anio: 1951, lluvia_mm: 330, forraje_aire_seco:  70, sd:  16.9, ubicaciones: 13 },
  { anio: 1952, lluvia_mm: 353, forraje_aire_seco:  95, sd:  24.8, ubicaciones:  5 },
  { anio: 1953, lluvia_mm: 301, forraje_aire_seco:  73, sd:  13.6, ubicaciones:  8 },
  { anio: 1954, lluvia_mm: 122, forraje_aire_seco:  22, sd:   4.3, ubicaciones:  6 },
  { anio: 1955, lluvia_mm: 328, forraje_aire_seco:  32, sd:   4.8, ubicaciones:  4 },
  { anio: 1956, lluvia_mm: 244, forraje_aire_seco:  50, sd:  13.0, ubicaciones:  4 },
  { anio: 1957, lluvia_mm: 415, forraje_aire_seco:  64, sd:  23.7, ubicaciones: 19 },
  { anio: 1958, lluvia_mm: 331, forraje_aire_seco:  77, sd:  20.7, ubicaciones: 19 },
  { anio: 1959, lluvia_mm: 307, forraje_aire_seco:  83, sd:  13.5, ubicaciones: 10 },
  { anio: 1960, lluvia_mm: 175, forraje_aire_seco:  57, sd:   8.1, ubicaciones: 14 },
  { anio: 1961, lluvia_mm: 404, forraje_aire_seco:  76, sd:  16.5, ubicaciones: 10 },
  { anio: 1962, lluvia_mm: 399, forraje_aire_seco:  81, sd:  16.3, ubicaciones: 10 },
  { anio: 1963, lluvia_mm: 338, forraje_aire_seco:  80, sd:  12.3, ubicaciones:  6 },
  { anio: 1964, lluvia_mm: 107, forraje_aire_seco:  25, sd:   4.4, ubicaciones:  6 },
  { anio: 1965, lluvia_mm: 371, forraje_aire_seco:  48, sd:  12.2, ubicaciones:  6 },
  { anio: 1966, lluvia_mm: 292, forraje_aire_seco:  49, sd:  11.9, ubicaciones:  6 },
  { anio: 1967, lluvia_mm: 588, forraje_aire_seco:  90, sd:  12.4, ubicaciones:  3 },
  { anio: 1968, lluvia_mm: 333, forraje_aire_seco:  77, sd:  26.0, ubicaciones:  6 },
  { anio: 1969, lluvia_mm: 417, forraje_aire_seco:  86, sd:  25.1, ubicaciones:  5 },
  { anio: 1970, lluvia_mm: 242, forraje_aire_seco:  72, sd:  18.7, ubicaciones:  6 },
  { anio: 1971, lluvia_mm: 262, forraje_aire_seco:  73, sd:   8.4, ubicaciones:  6 },
  { anio: 1972, lluvia_mm: 374, forraje_aire_seco:  24, sd:   4.4, ubicaciones:  7 },
  { anio: 1973, lluvia_mm: 275, forraje_aire_seco:  68, sd:  14.8, ubicaciones: 16 },
  { anio: 1974, lluvia_mm: 268, forraje_aire_seco:  22, sd:   5.7, ubicaciones: 13 },
  { anio: 1975, lluvia_mm: 324, forraje_aire_seco:  63, sd:  20.7, ubicaciones: 31 },
  { anio: 1976, lluvia_mm: 261, forraje_aire_seco:  44, sd:  12.0, ubicaciones: 28 },
  { anio: 1977, lluvia_mm: 248, forraje_aire_seco:  27, sd:   9.1, ubicaciones: 35 },
  { anio: 1978, lluvia_mm: 292, forraje_aire_seco:  37, sd:  16.2, ubicaciones: 30 },
  { anio: 1979, lluvia_mm: 494, forraje_aire_seco:  88, sd:  28.6, ubicaciones: 22 },
  { anio: 1981, lluvia_mm: 397, forraje_aire_seco: 128, sd:  50.4, ubicaciones: 16 },
  { anio: 1982, lluvia_mm: 475, forraje_aire_seco: 117, sd:  17.7, ubicaciones: 12 },
  { anio: 1983, lluvia_mm: 428, forraje_aire_seco:  91, sd:  29.5, ubicaciones: 16 },
  { anio: 1984, lluvia_mm: 407, forraje_aire_seco: 103, sd:  37.4, ubicaciones:  8 },
  { anio: 1985, lluvia_mm: 321, forraje_aire_seco:  84, sd:  10.7, ubicaciones:  8 },
  { anio: 1986, lluvia_mm: 265, forraje_aire_seco:  55, sd:   5.1, ubicaciones:  3 },
  { anio: 1987, lluvia_mm: 332, forraje_aire_seco:  63, sd:   4.8, ubicaciones:  8 },
  { anio: 1988, lluvia_mm: 335, forraje_aire_seco:  57, sd:   6.8, ubicaciones:  8 },
  { anio: 1989, lluvia_mm: 300, forraje_aire_seco:  55, sd:   5.7, ubicaciones:  6 },
  { anio: 1990, lluvia_mm: 357, forraje_aire_seco:  58, sd:   4.7, ubicaciones:  6 },
] as const;

/**
 * Un año de la serie de Río Mayo, con las dos capas separadas.
 *
 * La separación es lo que distingue a esta serie de la del CPER, y es el motivo
 * por el que vale el doble: **las gramíneas y los arbustos están medidos aparte
 * todos los años**. Esta app necesita la capa herbácea, no la suma.
 */
export interface AnioRioMayo {
  anio: number;
  /** Precipitación de enero a diciembre PREVIO a la cosecha de enero, mm. */
  lluvia_mm: number;
  /** ANPP de la capa de gramíneas, g MS/m²/año, por biomasa de pico. */
  gramineas: number;
  /** ANPP de los arbustos: elongación del año. `null` si ese año no se midió. */
  arbustos: number | null;
  /** Gramíneas + arbustos. `null` cuando falta el componente arbustivo. */
  total: number | null;
  /** Temperatura media anual del mismo período de doce meses, °C. */
  temp_c: number | null;
}

/**
 * Quince años de lluvia y producción en la estepa patagónica, con las capas
 * separadas.
 *
 * Tabla 2 de Jobbágy y Sala (2000), p. 544, para el sitio de Río Mayo, Chubut:
 * 1972, 1975 y 1983 a 1997. Los años 1983-1988 son de Fernández-A. et al. (1991)
 * y los de 1990-1997 los midieron los propios autores; el pie de la tabla lo
 * declara fila por fila.
 *
 * ## Por qué esta serie importa más que la del CPER, aunque tenga un tercio
 *
 * `SERIE_CPER` tiene cincuenta años y una sola columna de producción, que es la
 * del forraje del campo entero. Ésta tiene quince y **tres**: gramíneas,
 * arbustos y total. Y el hallazgo del trabajo está exactamente ahí:
 *
 * «Annual shrub production was associated with cumulative precipitation for the
 * whole year, whereas annual grass production was not associated with
 * precipitation.»
 *
 * Ajustando estas filas por cuadrados mínimos, en g/m²/año contra mm:
 *
 * | lo que se ajusta | ordenada | pendiente | r² | n |
 * |---|---|---|---|---|
 * | **gramíneas** contra lluvia | 24,6 | **0,024** | **0,015** | 15 |
 * | arbustos contra lluvia | 10,0 | 0,125 | 0,728 | 10 |
 * | total contra lluvia | 34,4 | 0,141 | 0,346 | 10 |
 *
 * **La capa que esta app tiene que predecir no responde a la lluvia anual.** La
 * lluvia explica el 1,5 % de la variación del forraje y el 73 % de la de la
 * leñosa. Y la correlación del total —la que se vería si no se separaran las
 * capas— sale enteramente de los arbustos, que es la parte que un bovino no come.
 * Los autores lo dicen así: «The differential effect of precipitation on grass
 * and shrub ANPP masked the association when these functional groups were
 * pooled».
 *
 * Eso es más grave para `prodForrajera` que lo del lote 15. Ahí el problema era
 * la pendiente: 0,13 medida contra 0,60 supuesta. Acá, en el único sitio del
 * archivo donde la capa herbácea está separada todos los años, **la pendiente
 * contra la lluvia anual es 0,024**.
 *
 * ## Cómo se verificó
 *
 * Transcribiendo la tabla entera y recalculando lo que el propio pie publica. Los
 * cinco estadísticos de columna salen: gramíneas 28,3 con SD 10,4 y CV 36,8 %;
 * arbustos 29,3 / 9,0 / 30,7; total 56,2 / 14,8 / 26,3; temperatura 8,5 / 0,4;
 * lluvia 155 / 52 / 33,6. Y los diez valores de la columna RUE —producción sobre
 * lluvia— dan los diez publicados a dos decimales. El test lo repite, así que
 * tocar una fila rompe la compuerta.
 *
 * ## El orden de las columnas, cuestionado y resuelto
 *
 * El lote 16 corrigió el reparto gramíneas/arbustos de la entrega, que venía
 * invertido en trece filas, y el lote 17 volvió con la objeción: **la ficha del
 * ORNL DAAC lista los campos del archivo anual como `ANPP_shrub` antes que
 * `ANPP_grass`**, al revés del orden de la Tabla 2 del artículo. La objeción está
 * bien planteada y el dato de la ficha es correcto. Queda resuelta igual, y por
 * dos evidencias que no dependen una de la otra:
 *
 * **Una: la propia ficha del ORNL nombra las columnas en una tabla de valores.**
 * Su sección de revisiones publica, año por año, los valores viejos y los nuevos
 * bajo los encabezados `ANPP_shrub` y `ANPP_grass`, y dice que los corrigió «to
 * agree with the values reported on page 544 of Jobbagy and Sala (2000)». Para
 * 1983 esa tabla pone 10,8 en `ANPP_shrub` y 10,6 en `ANPP_grass`; para 1997,
 * 45,8 y 17,9. Es exactamente lo que tiene este archivo. **El orden de los campos
 * en el encabezado del archivo de datos no dice cuál número es cuál en una tabla
 * del artículo**, y la ficha trae las dos cosas.
 *
 * **Dos: sólo esta asignación reproduce las tres regresiones publicadas.** Con
 * las columnas como están acá: gramíneas 24,582 + 0,02405·P con r² 0,0146,
 * arbustos 10,042 + 0,12484·P con r² 0,7278, total 34,432 + 0,14122·P con r²
 * 0,3459. Publicado: 24,6 / 0,024 / 0,015, 10,0 / 0,125 / 0,728 y 34,4 / 0,141 /
 * 0,346. Invirtiendo los diez años pareados sale 11,253 + 0,12016·P con r² 0,454
 * para la herbácea y 24,361 + 0,0165·P con r² 0,0094 para la leñosa, que no es
 * ninguna de las tres.
 *
 * Y el segundo número delata el mecanismo: 24,361 + 0,0165 es **la regresión de
 * las gramíneas calculada sobre diez años en vez de quince**. O sea que la
 * inversión no mezcla dos capas al azar: manda la columna de gramíneas a la
 * casilla de la leñosa y deja la columna de quince valores siendo una quimera de
 * cinco años de gramíneas más diez de arbustos. De ahí el r² de 0,454, que no es
 * ni el 0,015 de una capa ni el 0,728 de la otra.
 *
 * **Lo que la objeción sí dejó es un método**, y por eso vale el párrafo: cuando
 * el orden de dos columnas está en duda, la regresión publicada es el árbitro, y
 * no hay que ir a buscar otra fuente para usarla.
 *
 * ## Tres números distintos para «la lluvia de Río Mayo»
 *
 * Y los tres son correctos. La ficha del ORNL publica una normal de **153,0 mm**
 * con desvío de 52,3, armada con 14 años de dato anual del período 1968-1990. El
 * trabajo de 1991 publica una media de **136 mm** sobre 37 años, con rango de 47
 * a 230. Y el promedio de los quince años de esta serie es **155,5 mm**. Son tres
 * ventanas y tres fuentes para el mismo lugar, separadas por un 14 %. Cuál se usa
 * depende de contra qué se compare, y ninguna es «la» lluvia media del sitio: ver
 * la nota de `project_terreno_modelo_declarado`.
 *
 * ## La escalera contra esta serie
 *
 * Los quince años caen en el primer escalón de `prodForrajera`, el de menos de
 * 300 mm, que devuelve 700 kg MS/ha. Contra la capa de gramíneas medida, la
 * escalera **se pasa en 15 de 15 años**, con mediana de 2,37 veces y peor año de
 * 6,60. En el CPER se pasaba en 35 de 50 con mediana 1,27: acá siempre, y el
 * doble.
 *
 * ## Rango de validez
 *
 * Un sitio de 153 mm de lluvia media, a 500 m sobre el mar, con 25 % de cobertura
 * basal de gramíneas en mata y 12 % de arbustos. Los grandes herbívoros están
 * excluidos del área de muestreo desde 1983. La producción arbustiva está sesgada
 * baja por decisión declarada del método —se midió elongación y no engrosamiento
 * de ramas—, así que la fracción herbácea que sale de estas filas es, si acaso,
 * un techo.
 *
 * **Qué se rompe si cambia:** nada calcula con esto. Es la evidencia de que el
 * reemplazo de `prodForrajera` tiene que predecir la capa herbácea y no el total,
 * y de que para la capa herbácea la lluvia anual no alcanza ni como primer orden.
 */
export const SERIE_RIO_MAYO: readonly AnioRioMayo[] = [
  { anio: 1972, lluvia_mm: 123, gramineas: 32.5, arbustos: null, total: null, temp_c: 8.8 },
  { anio: 1975, lluvia_mm: 174, gramineas: 48.7, arbustos: null, total: null, temp_c: 8.5 },
  { anio: 1983, lluvia_mm:  55, gramineas: 10.6, arbustos: 10.8, total: 21.4, temp_c: 8.0 },
  { anio: 1984, lluvia_mm: 191, gramineas: 39.0, arbustos: 25.7, total: 64.7, temp_c: 8.5 },
  { anio: 1985, lluvia_mm: 142, gramineas: 41.8, arbustos: 33.6, total: 75.4, temp_c: 8.6 },
  { anio: 1986, lluvia_mm: 166, gramineas: 29.5, arbustos: 34.0, total: 63.5, temp_c: 8.7 },
  { anio: 1988, lluvia_mm: 105, gramineas: 36.4, arbustos: 23.9, total: 60.3, temp_c: 7.6 },
  { anio: 1990, lluvia_mm: 125, gramineas: 20.4, arbustos: null, total: null, temp_c: 7.8 },
  { anio: 1991, lluvia_mm: 170, gramineas: 29.9, arbustos: null, total: null, temp_c: 8.5 },
  { anio: 1992, lluvia_mm: 195, gramineas: 24.2, arbustos: null, total: null, temp_c: 9.1 },
  { anio: 1993, lluvia_mm: 126, gramineas: 30.5, arbustos: 26.5, total: 57.0, temp_c: null },
  { anio: 1994, lluvia_mm: 208, gramineas: 23.8, arbustos: 31.3, total: 55.1, temp_c: null },
  { anio: 1995, lluvia_mm: 163, gramineas: 24.9, arbustos: 33.9, total: 58.8, temp_c: 9.0 },
  { anio: 1996, lluvia_mm: 113, gramineas: 14.7, arbustos: 27.8, total: 42.6, temp_c: 8.5 },
  { anio: 1997, lluvia_mm: 276, gramineas: 17.9, arbustos: 45.8, total: 63.7, temp_c: 8.4 },
] as const;

/**
 * La fracción herbácea del mismo sitio, año por año.
 *
 * Diez años con las dos capas medidas. **Va de 0,281 a 0,604: un factor 2,15 en
 * el mismo lugar.**
 *
 * Esto le pone un límite a `FRACCION_HERBACEA_DEL_SITIO`, que tiene cuatro puntos
 * de cuatro sitios y presenta el 0,671 de Río Mayo como el valor del sitio. **El
 * valor del sitio no existe.** El factor 236 entre los cuatro puntos sigue siendo
 * real y sigue siendo mucho más grande que esto, pero ahora hay una medida de
 * cuánto de una diferencia entre sitios puede ser, en realidad, el año.
 *
 * La fracción baja cuando llueve más —r² = 0,22— y eso tiene el mecanismo que esta
 * misma serie publica: los arbustos responden a la lluvia y las gramíneas no, así
 * que **en un año lluvioso el agua de más no va al forraje, va a la leñosa**.
 *
 * Baja todavía más con el año que con la lluvia —r² = 0,56—, pero eso **no se
 * puede leer como arbustización del campo**: la primera mitad de la serie la midió
 * un equipo y la segunda otro, así que el tiempo está confundido con el
 * observador y con n = 10 no se separan.
 */
export function fraccionHerbaceaRioMayo(f: AnioRioMayo): number | null {
  return f.total === null ? null : f.gramineas / f.total;
}

/**
 * Cómo se pasa del forraje aire-seco de la serie a ANPP de estufa.
 *
 * Ecuación 1 de Lauenroth y Sala (1992): `ANPP = 46 + 0,76 × forraje`.
 *
 * **No es un factor, es una recta con ordenada al origen de 46 g/m².** La
 * consecuencia importa: el cociente ANPP/forraje va de **2,85** en el año más
 * flaco de la serie a **1,12** en el más gordo. Elegir la columna equivocada no
 * escala la serie, le cambia la forma, y por eso la entrada montada usa la de
 * estufa y lo dice.
 *
 * Y la recta es lo más débil del trabajo, que lo declara: se ajustó sobre los 14
 * años en que había las dos estimaciones, con **r² = 0,28**. El propio artículo la
 * llama «the most important assumption for this analysis».
 */
export const ECUACION_FORRAJE_A_ANPP = {
  ORDENADA: 46,
  PENDIENTE: 0.76,
  R2: 0.28,
  ANIOS_DEL_AJUSTE: 14,
  FUENTE: 'Lauenroth y Sala (1992), ecuación 1',
} as const;

/** Forraje aire-seco (g/m²/año) → ANPP de estufa (g/m²/año). */
export function anppDeForraje(forraje_aire_seco: number): number {
  return ECUACION_FORRAJE_A_ANPP.ORDENADA
    + ECUACION_FORRAJE_A_ANPP.PENDIENTE * forraje_aire_seco;
}

/**
 * Un modelo lineal de ANPP contra lluvia anual, en g/m²/año.
 *
 * Los dos que publica la Figura 2 de Lauenroth y Sala (1992), con sus palabras:
 * «Regional model ANPP = −34 + 0.60(Ann. Precipitation). Long-term model
 * ANPP = 56 + 0.13(Ann. Precipitation)».
 */
export interface ModeloANPP {
  id: string;
  ordenada: number;
  pendiente: number;
  que_cambia_entre_puntos: string;
}

/**
 * El modelo que cambia de sitio en cada punto, y por eso se equivoca en un sitio.
 *
 * Sala, Parton, Joyce y Lauenroth (1988) ajustaron ANPP contra lluvia anual sobre
 * la región de pastizales centrales de Estados Unidos: cada punto es un lugar
 * distinto, con su suelo, su temperatura y **su estructura de vegetación**.
 *
 * **Su pendiente es 4,6 veces la del mismo sitio medido durante cincuenta años.**
 *
 * Y el lote 16 le puso una condición a ese 4,6, que escribí yo y estaba
 * sobredimensionado: el 0,13 es la respuesta de **un** año a un mm de más, y el
 * 0,60 compara sitios que ya están acomodados a su lluvia. Contra el equilibrio
 * del mismo campo —`MODELO_EQUILIBRIO_CPER`, pendiente 0,22— la razón es **2,7**.
 * Sigue siendo casi el triple y sigue siendo el problema; pero más de un tercio
 * del 4,6 era comparar un año contra un siglo.
 *
 * El trabajo del CPER dice exactamente qué consecuencia tiene eso: «These
 * vegetation structure constraints on ANPP explain why, under dry conditions, the
 * regional model underestimates ANPP and under wet conditions, overestimates
 * ANPP». A la lluvia máxima observada en el CPER el modelo regional predice
 * **300 g/m² y el de largo plazo 130**, una diferencia significativa.
 *
 * ## Por qué esto es la lápida de `prodForrajera`
 *
 * `prodForrajera` es un modelo espacial: sus escalones salen de comparar lugares,
 * no de seguir uno. Y cae **sobre la curva regional**: con los 588 mm del año más
 * húmedo del CPER devuelve 3.000 kg MS/ha, que son 300 g/m², que es el número que
 * este trabajo midió como significativamente demasiado alto para ese campo.
 *
 * No es casualidad ni es mérito del cálculo: es lo que le pasa a cualquier función
 * que intercambie espacio por tiempo. El propio artículo lo llama «a weakness of
 * exchanging space for time in predicting production patterns».
 */
export const MODELO_REGIONAL_SALA_1988: ModeloANPP = {
  id: 'regional_sala_1988',
  ordenada: -34,
  pendiente: 0.60,
  que_cambia_entre_puntos: 'el sitio: suelo, temperatura y estructura de vegetación distintos en cada punto',
} as const;

/** El mismo campo, cincuenta años, con la estructura de vegetación quieta. */
export const MODELO_LARGO_PLAZO_CPER: ModeloANPP = {
  id: 'largo_plazo_cper',
  ordenada: 56,
  pendiente: 0.13,
  que_cambia_entre_puntos: 'sólo el año: un solo sitio y una sola estructura de vegetación',
} as const;

/**
 * El modelo que el lote 15 declaró faltante, con el coeficiente publicado.
 *
 * El lote 15 cerró diciendo que a `prodForrajera` «lo que le falta no es otra
 * variable: es memoria», porque tras las sequías de 1954 y 1964 llovió normal y
 * la producción siguió baja. Eso estaba publicado y con número:
 *
 * `ANPP(t) = 14,8 + 0,13 × pp(t) + 0,41 × ANPP(t−1)`
 *
 * Oesterheld, Loreti, Semmartin y Sala (2001), Tabla 1, sobre **la misma serie
 * del CPER** que está en `SERIE_CPER`. r² = 0,58, F(2,44) = 30,4, n = 47.
 *
 * ## Cómo se verificó, y vale contar porque la entrega lo dio por imposible
 *
 * La entrega del lote 16 declaró que este modelo no se podía re-ajustar con lo
 * que hay en este archivo, porque la columna de ANPP que lo alimenta no está:
 * `SERIE_CPER` guarda forraje aire-seco. **Sí se podía**, pasando la columna por
 * `anppDeForraje`, que es la ecuación 1 del mismo trabajo del que sale la serie:
 *
 * | | ordenada | pp(t) | ANPP(t−1) | r² | F | n |
 * |---|---|---|---|---|---|---|
 * | mi ajuste sobre `SERIE_CPER` | 14,92 | 0,1303 | 0,4085 | 0,581 | 30,5 | 47 |
 * | publicado | 14,8 | 0,13 | 0,41 | 0,58 | 30,4 | 47 |
 *
 * Los siete números, el estadístico F y los grados de libertad incluidos. El
 * n = 47 sale solo: la serie tiene cincuenta filas y le faltan 1940 y 1980, así
 * que los pares de años consecutivos son 50 − 1 − 2 = 47.
 *
 * Que los coeficientes caigan ahí prueba dos cosas de una. Que la serie está bien
 * transcripta —ya lo sabía— y que **la columna de ANPP de Oesterheld es la de
 * Lauenroth y Sala pasada por la ecuación 1**, que era una suposición mía.
 *
 * ## Lo que la memoria se lleva, y es la ordenada
 *
 * Comparando con el modelo sin memoria del lote 15, sobre el mismo campo:
 *
 * | | ordenada | pendiente de la lluvia |
 * |---|---|---|
 * | `MODELO_LARGO_PLAZO_CPER` | 56 | 0,13 |
 * | con memoria | 14,8 | 0,13 |
 *
 * **La pendiente de la lluvia es la misma.** La memoria no le saca nada a la
 * lluvia: le saca el nivel. Y la cuenta cierra: con la lluvia media del sitio,
 * 321 mm, el modelo sin memoria da 97,7 g/m², y 0,41 × 97,7 = 40,1, que sumado a
 * 14,8 da 54,9 ≈ 56. **El término de memoria ocupa exactamente el lugar de la
 * ordenada al origen.**
 *
 * Eso dice en qué forma tiene que ser el reemplazo: la lluvia del año pone el
 * incremento y el estado anterior pone el nivel.
 *
 * ## Y de acá sale una corrección al lote 15
 *
 * El lote 15 escribió que la pendiente espacial es **4,6 veces** la temporal,
 * comparando el 0,60 regional contra el 0,13 del CPER. La comparación no es justa,
 * y el modelo con memoria muestra por qué.
 *
 * El 0,13 es cuánto sube la producción de **un** año si ese año llueve un mm más.
 * El 0,60 compara sitios que llevan siglos con su lluvia: están en equilibrio. Lo
 * que hay que comparar contra el 0,60 es la respuesta de equilibrio de este
 * modelo, que se obtiene pidiendo ANPP(t) = ANPP(t−1):
 *
 * `ANPP* = (14,8 + 0,13 × P) / (1 − 0,41) = 25,1 + 0,2203 × P`
 *
 * **La pendiente de equilibrio es 0,22: 1,7 veces la de un año suelto.** Contra el
 * modelo regional la razón real no es 4,6 sino **2,7**. Sigue siendo mucho —el
 * modelo espacial sigue leyendo casi el triple de respuesta a la lluvia que el
 * campo— pero más de un tercio del 4,6 que escribí en el lote 15 era esto y no
 * estructura de vegetación.
 *
 * **Rango de validez.** Un sitio, el CPER. El propio trabajo avisa contra leerlo
 * como mecanismo: «it suggests, but does not prove, a causal relationship between
 * previous-year production and the response of this grassland to annual variations
 * in precipitation». Y no hay un segundo sitio con el coeficiente publicado, así
 * que el 0,41 no se transfiere a otro bioma.
 */
export const MODELO_CON_MEMORIA_CPER = {
  ORDENADA: 14.8,
  /** Cuánto aporta un mm de lluvia DEL AÑO, g/m² por mm. */
  PENDIENTE_LLUVIA: 0.13,
  /** Cuánto aporta la producción del año anterior, adimensional. */
  PESO_DEL_ANIO_ANTERIOR: 0.41,
  R2: 0.58,
  N: 47,
  FUENTE: 'Oesterheld, Loreti, Semmartin y Sala (2001), Tabla 1',
} as const;

/** ANPP del año, en g/m²/año, desde la lluvia del año y la ANPP del anterior. */
export function anppConMemoria(lluvia_mm: number, anpp_anterior: number): number {
  return MODELO_CON_MEMORIA_CPER.ORDENADA
    + MODELO_CON_MEMORIA_CPER.PENDIENTE_LLUVIA * lluvia_mm
    + MODELO_CON_MEMORIA_CPER.PESO_DEL_ANIO_ANTERIOR * anpp_anterior;
}

/**
 * El modelo con memoria llevado a equilibrio: la recta que hay que comparar
 * contra un modelo espacial.
 *
 * Pendiente 0,2203 y ordenada 25,1. Ver la discusión en
 * `MODELO_CON_MEMORIA_CPER`: comparar el 0,60 regional contra el 0,13 de un año
 * suelto sobreestima la discrepancia.
 */
export const MODELO_EQUILIBRIO_CPER: ModeloANPP = {
  id: 'equilibrio_cper',
  ordenada: MODELO_CON_MEMORIA_CPER.ORDENADA
    / (1 - MODELO_CON_MEMORIA_CPER.PESO_DEL_ANIO_ANTERIOR),
  pendiente: MODELO_CON_MEMORIA_CPER.PENDIENTE_LLUVIA
    / (1 - MODELO_CON_MEMORIA_CPER.PESO_DEL_ANIO_ANTERIOR),
  que_cambia_entre_puntos: 'la lluvia sostenida: el mismo sitio, con su producción ya acomodada a esa lluvia',
} as const;

/** ANPP en g/m²/año que predice un modelo para una lluvia anual en mm. */
export function anppDelModelo(m: ModeloANPP, lluvia_mm: number): number {
  return m.ordenada + m.pendiente * lluvia_mm;
}

/**
 * La lluvia donde los dos modelos se cruzan, en mm.
 *
 * Debajo de ese valor el modelo espacial lee bajo y arriba lee alto, que es la
 * asimetría que el trabajo describe. Contra el modelo de largo plazo da unos
 * 192 mm, y conviene saberlo porque **casi todos los sitios de este archivo están
 * arriba de esa cota**: de los veinte, el único que queda abajo es la estepa de
 * Río Mayo con 191 mm.
 *
 * Contra `MODELO_EQUILIBRIO_CPER`, que es la comparación justa, el cruce baja a
 * **156 mm** y entonces no queda ninguno abajo: el modelo espacial lee alto en
 * los veinte.
 *
 * La comparación se hace con cifras **de sitio** —una normal publicada o un año
 * medido—, no con el mínimo de una serie: los 107 mm del CPER son un año seco y
 * no un lugar seco, y es la misma distinción que el lote 15 tuvo que agregar.
 */
export function cruceDeModelos(a: ModeloANPP, b: ModeloANPP): number {
  return (b.ordenada - a.ordenada) / (a.pendiente - b.pendiente);
}

export function medicionesDeBioma(bioma: string): MedicionForraje[] {
  return FORRAJE_MEDIDO.filter(m => m.bioma === bioma);
}
