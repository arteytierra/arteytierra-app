import type { PracticaHistorica } from './biomaTipos';

/**
 * Prácticas documentadas por ecorregión, fechadas y sin dueño declarado.
 *
 * ESCRITO A MANO. No lo genera ningún montaje y no lo pisa ninguna
 * regeneración — que es exactamente por qué vive acá y no adentro de las
 * fichas. Los catálogos `biomasRegionales*.ts` se rearman desde los paquetes de
 * `_research/`, así que todo lo que se escriba ahí se pierde en el próximo
 * montaje. Esta capa es editorial y transversal: una entrada puede caer sobre
 * una ficha sudamericana, una de Medio Oriente o una argentina vieja, y se
 * escribe siempre igual.
 *
 * POR QUÉ EXISTE
 *
 * 200 de las 222 fichas regionales tienen `saberes: []` a propósito: atribuirle
 * una práctica a un pueblo a escala de ecorregión sería inventar, porque una
 * ecorregión abarca muchos pueblos y ninguno la ocupa entera. El resultado era
 * una sección vacía que se leía como "acá no hay nada", que es falso y además
 * ofensivo. Que no se pueda decir **de quién** es una práctica no impide decir
 * **qué se hizo acá y cuándo**: eso es lo que el registro fecha.
 *
 * CÓMO SE ESCRIBE UNA ENTRADA
 *
 * El contrato completo está en el JSDoc de `PracticaHistorica`, en
 * `biomaTipos.ts`. Lo esencial: el sujeto es el registro y no el terreno; si la
 * fuente nombra al pueblo se lo nombra como lo nombra ella, en `detalle`; y sin
 * fuente publicada no hay entrada.
 *
 * SOBRE LAS FUENTES, QUE ES DONDE ESTO SE ARRUINA
 *
 * Una cita inventada es plausible, corta y pasa cualquier revisión de código.
 * Al armar este archivo, un DOI escrito de memoria para el artículo de los
 * jardines de piedra de Rapa Nui resolvió a un artículo distinto de la misma
 * revista: el identificador existía, el trabajo era otro. Por eso ninguna URL
 * entra acá sin abrirse primero, y por eso el test exige una fuente por
 * práctica: no prueba que la fuente diga lo que decimos —eso no lo puede probar
 * un test— pero deja cada afirmación a un clic de ser desmentida.
 *
 * ESTADO
 *
 * 201 entradas sobre 200 ecorregiones de 222, y el relevamiento está cerrado.
 * Las 22 fichas que siguen sin práctica no son un pendiente: son veintidós
 * decisiones de no sostener una afirmación con una fuente que no alcanzaba
 * —islas oceánicas sin agricultura documentada, manglares y desiertos donde la
 * bibliografía habla de un país entero y no de la ecorregión—. El motivo de
 * cada vacío está escrito una por una en `COBERTURA_COMPLEMENTO_F_CIERRE.md`.
 * Si aparece una fuente nueva, el encargo sigue en `_research/_encargos/`; cada
 * lote se verifica abriendo las URLs antes de montarlo.
 */
export const PRACTICAS_POR_FICHA: Record<string, PracticaHistorica[]> = {
  // ── Centro de México ────────────────────────────────────────────────────────
  centro_mexico_volcanes_bajio: [
    {
      practica: 'Chinampa',
      periodo: 'Prehispánica; en uso continuo en Xochimilco',
      tipo: 'suelo',
      vigencia: 'en_uso',
      detalle:
        'Plataformas de cultivo ganadas al lago, delimitadas con estacas vivas de ahuejote —el sauce nativo, que sujeta el borde con la raíz— y rellenadas con dos capas: una de materia orgánica y otra del lodo del fondo. El canal que las separa tiene metro y medio de profundidad y hace tres trabajos a la vez: riega por subirrigación, transporta, y es de donde sale la enmienda. La fertilidad no se repone con insumo externo sino retirando la vegetación acuática del canal, lo que de paso evita que el agua se eutrofice. La FAO lo reconoció como sistema del patrimonio agrícola mundial en 2017.',
      fuentes: [
        { label: 'FAO SIPAM — Sistema agrícola chinampero, México', url: 'https://www.fao.org/giahs/giahs-around-the-world/mexico-chinampas-agricultural-system/en' },
      ],
    },
    {
      practica: 'Metepantle',
      periodo: 'Más de 3.000 años según la FAO; en uso',
      tipo: 'suelo',
      vigencia: 'en_uso',
      detalle:
        'Terrazas de ladera con el borde plantado de maguey, y adentro maíz, poroto, zapallo y las hierbas espontáneas que se cosechan como quelites. La hilera de agave hace de estructura: sujeta el bordo, frena la escorrentía y produce por su cuenta —aguamiel, fibra, forraje—, de modo que la obra de conservación no compite con la superficie productiva sino que la amplía. La FAO lo reconoció en 2025 y lo describe en las zonas montañosas de Tlaxcala.',
      fuentes: [
        { label: 'FAO SIPAM — Sistema agrícola ancestral Metepantle, Tlaxcala', url: 'https://www.fao.org/giahs/giahs-around-the-world/mexico-meteplante/en' },
      ],
    },
  ],

  // ── Altiplano del Titicaca ──────────────────────────────────────────────────
  puna_humeda_central: [
    {
      practica: 'Campos elevados (waru waru, suka kollus)',
      periodo: 'Desde ~1000 a.C.; los fechados asociados llegan al inicio de nuestra era',
      tipo: 'suelo',
      vigencia: 'historica',
      detalle:
        'Plataformas de cultivo levantadas sobre la llanura lacustre, separadas por canales de agua. El canal es el instrumento: acumula calor durante el día y lo devuelve de noche, lo que sube la temperatura del cultivo un par de grados y corre el riesgo de helada en un altiplano donde la helada es el límite real, no la lluvia. Además drena el exceso y el sedimento que se saca del fondo vuelve a la plataforma como abono. Erickson fechó su origen alrededor del 1000 a.C. —bastante antes de lo que se suponía— y reconstruyó parcelas experimentales en Huatta para medir la mano de obra, que resultó menor que la estimada cuando el campo se usa por generaciones.',
      fuentes: [
        { label: 'Erickson, C. (1988) — Raised Field Agriculture in the Lake Titicaca Basin, Expedition 30(3), Penn Museum', url: 'https://www.penn.museum/sites/expedition/raised-field-agriculture-in-the-lake-titicaca-basin/' },
        { label: 'Erickson, C. (1987) — The dating of raised-field agriculture in the Lake Titicaca Basin (PDF, Univ. of Pennsylvania)', url: 'https://anthropology.sas.upenn.edu/sites/default/files/page/EricksonDatingRaisedFieldAgricultureLakeTiticacvaBasinPeru1987.pdf' },
      ],
    },
  ],

  // ── Rapa Nui ────────────────────────────────────────────────────────────────
  rapa_nui_bosque_subtropical_transformado: [
    {
      practica: 'Acolchado de piedra y recintos (manavai)',
      periodo: 'Primeros fechados en los siglos XIV y XV; uso más intenso entre el XVI y el XVIII',
      tipo: 'suelo',
      vigencia: 'historica',
      detalle:
        'Dos tecnologías que resuelven el mismo problema en una isla sin ríos permanentes: el recinto circular de piedra, que corta el viento y levanta la humedad adentro, y el acolchado lítico, que es roca volcánica esparcida sobre la superficie. La piedra baja la evaporación, amortigua la oscilación térmica sobre la raíz, protege de la erosión eólica e hídrica y va liberando nutrientes al meteorizarse. Es una respuesta de suelo y no de riego, y por eso es la referencia cuando el problema no es cuánta agua llega sino cuánta se queda. El relevamiento por imágenes satelitales de Ladefoged y colegas mostró que la práctica cubría buena parte de la isla, no unos pocos sitios.',
      fuentes: [
        { label: 'Ladefoged, T. et al. (2013) — The distribution of rock gardens on Rapa Nui as determined from satellite imagery, Journal of Archaeological Science', url: 'https://www.sciencedirect.com/science/article/abs/pii/S0305440312004049' },
      ],
    },
  ],

  // ── Montañas de Omán ────────────────────────────────────────────────────────
  hajar_falaj: [
    {
      practica: 'Falaj',
      periodo: 'El expediente de UNESCO lo data desde ~500 d.C.; en uso',
      tipo: 'agua',
      vigencia: 'en_uso',
      detalle:
        'Galería que capta el agua del acuífero aluvial en la cabecera del valle y la conduce por gravedad, bajo tierra, a veces durante kilómetros, hasta salir a la superficie donde está el oasis. No hay bombeo y no hay evaporación en el trayecto; el caudal lo fija el acuífero y no una decisión, lo que pone un techo natural a la extracción. Alrededor del canal hay una institución de reparto por turnos de tiempo, más miradores, aljibes y molinos. UNESCO inscribió cinco aflaj en 2006 como muestra de un sistema todavía vivo.',
      fuentes: [
        { label: 'UNESCO — Sistemas de riego aflaj de Omán (2006)', url: 'https://whc.unesco.org/es/list/1207/' },
      ],
    },
  ],

  // ── Meseta iraní ────────────────────────────────────────────────────────────
  kavir_cuencas_endorreicas: [
    {
      practica: 'Qanat',
      periodo: 'Milenios; UNESCO inscribió once qanats en 2016',
      tipo: 'agua',
      vigencia: 'en_retroceso',
      detalle:
        'La misma idea que el falaj, en la escala de una meseta entera: un túnel con pendiente mínima que saca a la superficie, por gravedad, el agua dulce del abanico aluvial en la salida de la montaña, sin tocar la freática salada del fondo de cuenca. Sostuvo ciudades durante tres mil años en un lugar donde el agua entra y no sale. Está en retroceso por una razón concreta y no por abandono cultural: la perforación masiva de pozos profundos desde los años sesenta bajó el nivel del acuífero, secó miles de qanats y produjo hundimientos del terreno de decenas de centímetros por año en Teherán y Kermán.',
      fuentes: [
        { label: 'UNESCO — The Persian Qanat (2016)', url: 'https://whc.unesco.org/en/list/1506/' },
      ],
    },
  ],

  // ── Norteamérica ──────────────────────────────────────────────────────────────
  bosque_templado_caducifolio_este: [
    {
      practica: 'Quemas dirigidas para favorecer robles y castaños',
      periodo: 'Anterior al asentamiento europeo; la fuente no fija una fecha inicial',
      tipo: 'fuego',
      vigencia: 'historica',
      detalle:
        'La síntesis histórica del este de Estados Unidos documenta quemas dirigidas para favorecer árboles productores de frutos secos, especialmente robles y castaños. El fuego de baja intensidad reducía el sotobosque y sostenía una estructura abierta: una respuesta a la pérdida de luz, accesibilidad y producción útil que aparece cuando el bosque cierra.',
      fuentes: [
        { label: 'National Park Service — Indigenous Fire Practices Shape our Land', url: 'https://www.nps.gov/subjects/fire/indigenous-fire-practices-shape-our-land.htm' },
      ],
    },
  ],
  pradera_pastos_altos: [
    {
      practica: 'Quema de pradera para renovar forraje y concentrar bisontes',
      periodo: 'Durante los últimos ~5.000 años, según la síntesis del parque',
      tipo: 'fuego',
      vigencia: 'historica',
      detalle:
        'El registro histórico-ecológico de las praderas altas documenta quemas que producían rebrotes nutritivos y atraían las manadas hacia sectores previsibles. La práctica resolvía dos límites del pastizal: la acumulación de material seco y la movilidad extrema del recurso animal, a la vez que frenaba el avance de arbustos y árboles.',
      fuentes: [
        { label: 'National Park Service — Fire Regime, Tallgrass Prairie National Preserve', url: 'https://www.nps.gov/tapr/learn/nature/fire-regime.htm' },
      ],
    },
  ],
  pradera_mixta: [
    {
      practica: 'Mosaico de fuego y pastoreo',
      periodo: 'Régimen histórico anterior a la transformación agrícola moderna',
      tipo: 'fuego',
      vigencia: 'en_uso',
      detalle:
        'La documentación ecológica describe praderas formadas por la interacción de incendios —naturales y humanos— con el pastoreo. Quemar parches en momentos distintos crea un mosaico de alturas y edades de vegetación que distribuye el pastoreo y evita que toda la superficie quede simultáneamente rasa o envejecida; hoy el principio se usa en manejo por parches.',
      fuentes: [
        { label: 'National Park Service — Patch-Burn Grazing', url: 'https://www.nps.gov/articles/000/patch-burn-grazing.htm' },
      ],
    },
  ],
  pradera_pastos_cortos: [
    {
      practica: 'Fuego para conducir caza y estimular rebrote',
      periodo: 'Antes de 1875; la fuente no establece una fecha inicial segura',
      tipo: 'fuego',
      vigencia: 'historica',
      detalle:
        'La historia ambiental de las Grandes Llanuras registra fuegos deliberados para conducir animales o atraerlos después al rebrote. En la pradera corta, donde el agua y el forraje son discontinuos, el momento y la posición de la quema modificaban la distribución de la caza; no equivale a recomendar una quema sin prescripción actual.',
      fuentes: [
        { label: 'National Park Service — Fire History of the Great Plains', url: 'https://www.nps.gov/lamr/learn/nature/fire-history-of-the-great-plains.htm' },
      ],
    },
  ],
  desiertos_calidos_norteamericanos: [
    {
      practica: 'Canales de riego de los valles del Salt y Gila',
      periodo: 'Desde alrededor de 300 a.C.; continuidad arqueológica hasta ca. 1450 d.C.',
      tipo: 'agua',
      vigencia: 'historica',
      detalle:
        'El registro del valle del Salt documenta cientos de kilómetros de canales excavados para llevar crecidas fluviales a campos de maíz, frijol, calabaza y algodón. La red convertía un río alternadamente seco y torrencial en agua distribuible, resolviendo la aridez y permitiendo cultivar superficies estables durante siglos. El Servicio de Parques atribuye la obra a los hohokam y la fecha desde alrededor del 300 a.C.',
      fuentes: [
        { label: 'National Park Service — Arizona: Crosscut Powerplant', url: 'https://www.nps.gov/articles/arizona-crosscut-powerplant.htm' },
      ],
    },
  ],
  estepa_arbustiva_gran_cuenca: [
    {
      practica: 'Recolección y procesamiento de piñones',
      periodo: 'Con evidencia de uso de plantas del pinar-enebral desde hace hasta ~10.000 años',
      tipo: 'recoleccion',
      vigencia: 'en_uso',
      detalle:
        'Los materiales arqueológicos y la síntesis histórica documentan el uso prolongado de los pinares-enebrales y el fuerte valor alimentario de sus piñones. Concentrar la cosecha otoñal y procesar una semilla densa en energía permitía guardar alimento para el invierno en una cuenca árida con productividad muy variable entre años.',
      fuentes: [
        { label: 'National Park Service — Pinyon-Juniper Woodlands: Anthropogenic Use and Post-settlement Stressors', url: 'https://www.nps.gov/articles/pinyon-juniper-woodlands-anthropogenic-use.htm' },
      ],
    },
  ],
  bosque_coniferas_pacifico_noroeste: [
    {
      practica: 'Quemas selectivas de praderas de camas y wapato',
      periodo: 'Documentada por relevamientos de 1853 y 1855; de origen anterior',
      tipo: 'fuego',
      vigencia: 'historica',
      detalle:
        'Los relevamientos históricos del bajo Columbia registran quemas de praderas para sostener raíces comestibles como camas y wapato, además de bayas y bellotas. El fuego mantenía claros soleados dentro de una región de rápida expansión forestal y facilitaba tanto la cosecha como el hábitat de animales de caza.',
      fuentes: [
        { label: 'National Park Service — The Cultural Landscape of Fort Vancouver: Indian Country, pre-1824', url: 'https://www.nps.gov/articles/fovaclrindiancountry.htm' },
      ],
    },
  ],
  chaparral_californiano: [
    {
      practica: 'Quema frecuente para sostener pastizales y cosechas de semillas',
      periodo: 'Anterior al contacto europeo, documentada en testimonios tempranos; sin fecha inicial firme',
      tipo: 'fuego',
      vigencia: 'historica',
      detalle:
        'Los relatos tempranos de la costa de California describen quemas frecuentes en mosaicos de pastizal y matorral para mejorar la cosecha de semillas y controlar el avance del arbustal. En un ambiente de verano seco, el manejo buscaba conservar claros productivos, pero no debe confundirse con quemar chaparral maduro fuera de condiciones culturales y técnicas específicas.',
      fuentes: [
        { label: 'National Park Service — Fire Ecology: Fire History, Point Reyes National Seashore', url: 'https://www.nps.gov/pore/learn/nature/wildlandfire_fireecology_firehistory.htm' },
      ],
    },
  ],
  taiga_borde_agricola: [
    {
      practica: 'Quema de baja intensidad para favorecer arándanos',
      periodo: 'Durante siglos; reintroducida mediante quemas culturales desde 2017',
      tipo: 'fuego',
      vigencia: 'en_uso',
      detalle:
        'La documentación de Apostle Islands registra quemas de baja intensidad para abrir el sotobosque y aumentar la producción de arándanos. En el borde boreal, donde el cierre leñoso reduce las plantas de luz, el fuego dirigido conserva parches abiertos; el parque volvió a aplicarlo con naciones y organismos tribales. La fuente atribuye esas quemas a las comunidades ojibwe de la zona y dice que sostuvieron la cosecha de la isla Stockton durante siglos.',
      fuentes: [
        { label: 'National Park Service — Stockton Island Prescribed Burn Restores Cultural Landscapes', url: 'https://www.nps.gov/articles/000/stockton-island-prescribed-burn-restores-cultural-landscapes.htm' },
      ],
    },
  ],

  // ── Altiplano mexicano ────────────────────────────────────────────────────────
  matorral_xerofilo_altiplano_mexicano: [
    {
      practica: 'Metepantle con terrazas, agaves y captación de agua',
      periodo: 'En uso desde hace más de 3.000 años',
      tipo: 'suelo',
      vigencia: 'en_uso',
      detalle:
        'El sistema documentado en Tlaxcala dispone maíz, agave, frijol, calabaza y plantas silvestres en terrazas. Los muros y setos vivos frenan la escorrentía, retienen suelo y humedad, mientras jagüeyes y canales de infiltración guardan agua: una respuesta integrada a pendientes erosionables y sequía.',
      fuentes: [
        { label: 'FAO SIPAM — Metepantle Ancestral Agricultural System in the Mountainous Zones of Tlaxcala', url: 'https://www.fao.org/giahs/giahs-around-the-world/mexico-meteplante/en' },
      ],
    },
  ],
  altiplano_mexicano_matorral: [
    {
      practica: 'Metepantle: mosaico de terrazas con agave y milpa',
      periodo: 'Desde hace más de 3.000 años; vigente y reconocido como SIPAM en 2025',
      tipo: 'suelo',
      vigencia: 'en_uso',
      detalle:
        'La FAO atribuye al conocimiento nahua de las familias agrícolas de Tlaxcala un mosaico en terrazas que combina maíz, agave, frijol, calabaza y plantas silvestres. La fuente documenta continuidad, conservación de semillas y biodiversidad de tierras áridas, pero no proporciona dimensiones ni una receta técnica universal. Para un predio del altiplano, el antecedente útil es la diversificación espacial de la ladera con especies perennes y anuales, no la copia de una terraza sin diagnóstico local.',
      fuentes: [
        { label: 'FAO (2025) — Metepantle: Sistema agrícola ancestral en las zonas montañosas de Tlaxcala, SIPAM', url: 'https://www.fao.org/giahs/around-the-world/detail/mexico-tlaxcala-system/es' },
      ],
    },
  ],

  // ── Caribe ────────────────────────────────────────────────────────────────────
  bosque_humedo_tropical_caribeno: [
    {
      practica: 'Conucos elevados con policultivo de raíces',
      periodo: 'Época precolombina; documentada por europeos desde fines del siglo XV',
      tipo: 'suelo',
      vigencia: 'historica',
      detalle:
        'Las fuentes históricas y agronómicas describen montículos de cultivo con yuca y otros tubérculos combinados con maíz, calabaza y legumbres. Elevar la cama mejora drenaje y retención de agua, mientras cobertura e intercultivo reducen erosión bajo lluvias tropicales intensas. La fuente describe a los taínos como la sociedad agrícola precolombina que desarrolló este sistema de ladera en el Caribe.',
      fuentes: [
        { label: 'Winter et al. (2017) — Agronomic Challenges and Opportunities for Smallholder Terrace Agriculture, Frontiers in Plant Science', url: 'https://www.frontiersin.org/journals/plant-science/articles/10.3389/fpls.2017.00331/full' },
      ],
    },
  ],
  matorral_seco_caribeno: [
    {
      practica: 'Conuco como cama elevada de cultivo',
      periodo: 'Desde época precolombina hasta, al menos, el siglo XVIII en La Española',
      tipo: 'suelo',
      vigencia: 'historica',
      detalle:
        'La reconstrucción histórica de La Española describe el conuco precolombino y sigue su registro hasta el siglo XVIII. El montículo concentra suelo fértil y residuos, mejora infiltración sin dejar raíces anegadas y permite policultivo; esas funciones son relevantes tanto frente a aguaceros breves como a estaciones secas.',
      fuentes: [
        { label: 'Orioli, L. (2022) — Il Conuco: una pratica colturale pre-colombiana, Rivista di Storia dell’Agricoltura', url: 'https://www.storiaagricoltura.it/articoli/alla-ricerca-del-contributo-americano-alla-costituzione-della-nostra-agricoltura-il-conuco-una-prati/2167' },
      ],
    },
  ],

  // ── Europa y Macaronesia ──────────────────────────────────────────────────────
  mediterraneo_europeo: [
    {
      practica: 'Terrazas de piedra seca con captación de lluvia',
      periodo: 'Durante casi mil años en la costa de Amalfi',
      tipo: 'suelo',
      vigencia: 'en_uso',
      detalle:
        'El sistema de Amalfi transforma laderas abruptas en bancales estrechos para limoneros, olivos y vid. Los muros de piedra seca retienen suelo, absorben y encauzan lluvias torrenciales y estabilizan pendientes; las pérgolas moderan la exposición sobre una costa con poco terreno llano.',
      fuentes: [
        { label: 'FAO — The Amalfi Lemon and its layered resilient landscape', url: 'https://www.fao.org/newsroom/story/the-amalfi-lemon-and-its-layered-resilient-landscape/en' },
      ],
    },
  ],
  alpino_montano_europeo: [
    {
      practica: 'Ganadería alpina en tres pisos y conservación de heno',
      periodo: 'Durante siglos; vigente',
      tipo: 'ganaderia',
      vigencia: 'en_uso',
      detalle:
        'La fuente SIPAM documenta el traslado estacional del ganado entre valle, pasto intermedio y pasto alto, junto con el secado de heno para el invierno. El movimiento sigue el rebrote altitudinal y evita exigir a un solo potrero todo el año; el heno resuelve el período frío sin vegetación.',
      fuentes: [
        { label: 'FAO SIPAM — Traditional Hay Milk Farming in the Austrian Alpine Arc', url: 'https://www.fao.org/giahs/giahs-around-the-world/austria-traditional-hay-milk-farming-system/en' },
      ],
    },
  ],
  macaronesia: [
    {
      practica: 'Levadas por gravedad para riego de laderas',
      periodo: 'Desde el primer cuarto del siglo XV',
      tipo: 'agua',
      vigencia: 'en_uso',
      detalle:
        'El registro histórico de Madeira fecha las levadas desde los primeros asentamientos portugueses. Las acequias captan agua de sectores húmedos y la conducen por gravedad a laderas agrícolas más secas; así desacoplan el cultivo de la distribución muy desigual de lluvia y alimentaron primero caña de azúcar y luego viña y otros cultivos.',
      fuentes: [
        { label: 'UNESCO World Heritage Centre — Levadas of Madeira Island', url: 'https://whc.unesco.org/en/tentativelists/6230/' },
      ],
    },
  ],

  // ── Argentina y Cono Sur ──────────────────────────────────────────────────────
  selva_paranaense: [
    {
      practica: 'Extracción de yerba mate de yerbales naturales',
      periodo: 'Hasta fines del siglo XIX; luego retrocedió frente a la explotación comercial y el cultivo',
      tipo: 'recoleccion',
      vigencia: 'en_retroceso',
      detalle:
        'El estudio histórico de Misiones documenta la cosecha extractiva en yerbales naturales bajo la cobertura de la selva hasta fines del siglo XIX, antes del pasaje a plantaciones. Para el diseño predial, el antecedente útil es mantener el estrato arbóreo y aprovechar la yerba dentro del rodal, porque la fuente contrasta los menores efectos de esa modalidad con la transformación causada por el cultivo intensivo posterior.',
      fuentes: [
        { label: 'Gallero (2019) — Cambios y permanencias en la producción de yerba mate, HALAC / CONICET-UNaM', url: 'https://www.halacsolcha.org/index.php/halac/article/download/341/353/822' },
      ],
    },
  ],
  chaco_seco: [
    {
      practica: 'Ganadería de monte en bosque nativo',
      periodo: 'Durante décadas; documentada por INTA en 2015',
      tipo: 'ganaderia',
      vigencia: 'en_uso',
      detalle:
        'INTA define esta modalidad como el pastoreo y ramoneo de animales dentro del bosque nativo del Parque Chaqueño, simultáneo al uso de abras y cañadas. En el diseño del predio, conservar un mosaico de monte y claros aporta ramoneo, frutos, sombra y refugio; la carga debe ajustarse al forraje disponible y a la categoría legal del bosque para que el aprovechamiento no se convierta en degradación.',
      fuentes: [
        { label: 'INTA (2015) — Problemáticas de la innovación en la ganadería bovina de la provincia de Chaco', url: 'https://repositorio.inta.gob.ar/bitstream/handle/20.500.12123/1874/INTA_CICPES_InstdeEconomia_Ondo_Misi_S_Problematicas_innovacion_ganaderia_bovina_Chaco.pdf?isAllowed=y&sequence=2' },
      ],
    },
  ],
  monte: [
    {
      practica: 'Ramblones y represas para captar lluvias torrenciales',
      periodo: 'Práctica histórica de los pobladores locales; la guía no fija una fecha inicial',
      tipo: 'agua',
      vigencia: 'en_uso',
      detalle:
        'La guía registra que los pobladores locales construyen reservorios de tierra en bajos arcillosos o limosos y conducen hacia ellos el escurrimiento mediante zanjas o bordos. El sistema concentra tormentas breves para disponer de agua de abrevadero durante la estación seca; requiere separar el ganado del borde, controlar la contaminación y retirar sedimentos para prolongar su vida útil.',
      fuentes: [
        { label: 'Secretaría de Ambiente y Desarrollo Sustentable / WOCAT — Guía de buenas prácticas, Región Nuevo Cuyo', url: 'https://wocat.net/documents/939/NUEVO_CUYO_Gu%C3%ADas_buenas_pr%C3%A1cticas.pdf' },
      ],
    },
  ],
  espinal: [
    {
      practica: 'Quema controlada con descanso y ajuste de carga',
      periodo: 'En uso como estrategia contemporánea de recuperación; la fuente no fija una fecha inicial',
      tipo: 'fuego',
      vigencia: 'en_uso',
      detalle:
        'El estudio sobre pastizales semiáridos con caldén propone quemas controladas combinadas con cargas animales conservadoras y control del pastoreo, sólo cuando las precipitaciones permiten la recuperación. La secuencia busca revertir fachinales, pajonales o peladales y recuperar forraje sin volver a sobreexplotar la vegetación ni dejar el suelo expuesto.',
      fuentes: [
        { label: 'CERZOS-CONICET — Estrategias para la recuperación y el manejo de pastizales naturales degradados de la región central argentina', url: 'https://bahiablanca.conicet.gov.ar/boletin/boletin29/indexd279.html?Itemid=154&id=101&option=com_content&view=article' },
      ],
    },
  ],
  pampa: [
    {
      practica: 'Descanso agrícola temporal con pastoreo vacuno',
      periodo: 'Usada hasta aproximadamente 1975; luego retrocedió ante la agricultura continua',
      tipo: 'suelo',
      vigencia: 'en_retroceso',
      detalle:
        'CONICET registra que, después de varios años consecutivos de cultivo, se dejaba temporalmente la tierra para pastoreo vacuno con el fin de recuperar productividad. Para un predio, el antecedente propone interrumpir la agricultura continua con una fase pastoril; la fuente señala que esta rotación perdió terreno desde la década de 1970 por el uso creciente de fertilizantes.',
      fuentes: [
        { label: 'CONICET (2015) — Fertilidad y productividad en el suelo pampeano: pasado, presente y futuro', url: 'https://www.conicet.gov.ar/fertilidad-y-productividad-en-el-suelo-pampeano-pasado-presente-y-futuro/' },
      ],
    },
  ],
  yungas: [
    {
      practica: 'Huertos pircados y molinos de agua',
      periodo: 'Desde finales del siglo XVIII',
      tipo: 'cultivo',
      vigencia: 'historica',
      detalle:
        'Parques Nacionales registra en Los Toldos vestigios de huertos delimitados por pircas, corrales y molinos de agua surgidos con la expansión agrícola-ganadera de fines del siglo XVIII. En un predio de montaña, la pirca permite ordenar y proteger el espacio cultivado, mientras el molino aprovecha el desnivel y el caudal local para transformar la cosecha sin trasladarla fuera del valle.',
      fuentes: [
        { label: 'Administración de Parques Nacionales — Patrimonio cultural de la Reserva Nacional El Nogalar de Los Toldos', url: 'https://www.argentina.gob.ar/parquesnacionales/region-noroeste/reserva-nacional-el-nogalar-de-los-toldos/patrimonio-cultural' },
      ],
    },
  ],
  puna_altoandino: [
    {
      practica: 'Veranada y pastoreo concentrado en vegas',
      periodo: 'Siglos XIX y XX; la práctica todavía se desarrolla en la provincia de San Juan',
      tipo: 'ganaderia',
      vigencia: 'en_uso',
      detalle:
        'Parques Nacionales registra que San Guillermo funcionó como lugar de veranada y corredor de ganado hacia Chile durante los siglos XIX y XX, y señala que la práctica continúa en San Juan. La movilidad estacional concentra el pastoreo en vegas con agua y pastizales durante el viaje, evitando depender de la matriz altoandina mucho más seca; el trazado predial debe proteger esos humedales de altura frente a cargas excesivas.',
      fuentes: [
        { label: 'Administración de Parques Nacionales — Patrimonio cultural del Parque Nacional San Guillermo', url: 'https://www.argentina.gob.ar/node/439347' },
      ],
    },
  ],
  estepa_patagonica: [
    {
      practica: 'Puestos de veranada en mesetas',
      periodo: 'A lo largo del siglo XX',
      tipo: 'ganaderia',
      vigencia: 'historica',
      detalle:
        'Parques Nacionales documenta puestos ganaderos de veranada instalados sobre la Meseta del Lago Buenos Aires a lo largo del siglo XX, mientras los cascos de estancia quedaban al pie o en sus estribaciones. La separación espacial permite llevar la hacienda a los pastos estivales de altura y reservar otros sectores para el resto del año, una lógica útil para distribuir la presión de pastoreo en ambientes de oferta muy estacional.',
      fuentes: [
        { label: 'Administración de Parques Nacionales — Patrimonio cultural del Parque Nacional Patagonia', url: 'https://www.argentina.gob.ar/parquesnacionales/patagonia-austral/parque-nacional-patagonia/patrimonio-cultural' },
      ],
    },
  ],
  bosque_andino_patagonico: [
    {
      practica: 'Piñoneo y recolección de plantas comestibles y medicinales',
      periodo: 'En uso al momento del registro de Parques Nacionales; sin fecha inicial determinada',
      tipo: 'recoleccion',
      vigencia: 'en_uso',
      detalle:
        'Parques Nacionales incluye el piñoneo y la recolección de plantas comestibles y medicinales entre las prácticas que pobladores del Parque Nacional Lanín mantienen y transmiten; también sitúa la cosmovisión del Pueblo Mapuche dentro de ese patrimonio vivo. Para el diseño predial, esto orienta a conservar araucarias y parches de vegetación útil como áreas permanentes de recolección, con acceso estacional y regeneración protegida en lugar de reemplazarlos por una sola producción.',
      fuentes: [
        { label: 'Administración de Parques Nacionales — Patrimonio cultural del Parque Nacional Lanín', url: 'https://www.argentina.gob.ar/parquesnacionales/regionpatagonia/parque-nacional-lanin/patrimonio-cultural' },
      ],
    },
  ],
  campos_uruguayos: [
    {
      practica: 'Ganadería sobre campo natural con carga ajustada',
      periodo: 'Desde hace más de 400 años; vigente',
      tipo: 'ganaderia',
      vigencia: 'en_uso',
      detalle:
        'El MGAP documenta más de cuatro siglos de producción animal sustentada en pasturas naturales y presenta como variable central ajustar la carga a la producción de forraje del campo. A escala predial, calcular la dotación, dejar remanente y mover racionalmente el ganado permite acompañar la variación estacional del pasto, conservar diversidad y evitar que el uso continuo derive en sobrepastoreo.',
      fuentes: [
        { label: 'MGAP, Udelar, INIA e Instituto Plan Agropecuario — Producción animal sostenible en pastoreo sobre campo natural', url: 'https://www.gub.uy/ministerio-ganaderia-agricultura-pesca/sites/ministerio-ganaderia-agricultura-pesca/files/documentos/publicaciones/Producci%C3%B3n%20animal%20sostenible%20en%20pastoreo%20sobre%20campo%20natural.pdf' },
      ],
    },
  ],
  chaco_humedo: [
    {
      practica: 'Quema prescripta de pastizales en agosto y septiembre',
      periodo: 'En uso; recomendada para agosto y septiembre, sin fecha inicial documentada',
      tipo: 'fuego',
      vigencia: 'en_uso',
      detalle:
        'El manual de INTA para Formosa y Chaco recomienda realizar la quema en agosto o septiembre y restringirla a años con lluvias normales o buenas, cuando la humedad del suelo reduce la severidad y favorece el rebrote. La práctica remueve material envejecido y recupera accesibilidad y calidad del forraje, pero debe planificarse con cortafuegos, descanso posterior y exclusión durante sequías.',
      fuentes: [
        { label: 'INTA EEA El Colorado (2024) — Manual de pastizales para la producción ganadera de Formosa y Chaco', url: 'https://repositorio.inta.gob.ar/bitstream/handle/20.500.12123/17406/INTA_CRChaco-Formosa_EEAElColorado_Miranda_FW_Manual_de_pastizales_para_la_producci%C3%B3n_ganadera.pdf?isAllowed=y&sequence=1' },
      ],
    },
  ],
  humedales_parana_mesopotamia: [
    {
      practica: 'Pesca con arpones y redes, ahumado y conservación de pescado',
      periodo: 'Desde hace al menos 1.700 años',
      tipo: 'recoleccion',
      vigencia: 'historica',
      detalle:
        'Parques Nacionales atribuye a comunidades indígenas que habitaron el Paraná inferior desde hace al menos 1.700 años la pesca con arpones y redes, y señala que habrían ahumado y conservado pescado para el invierno. El conjunto vincula captura y almacenamiento: aprovechar la abundancia estacional del humedal y conservarla reduce la dependencia de pesca diaria cuando baja la disponibilidad.',
      fuentes: [
        { label: 'Administración de Parques Nacionales — Patrimonio cultural del Parque Nacional Ciervo de los Pantanos', url: 'https://www.argentina.gob.ar/parquesnacionales/centro/parque-nacional-ciervo-de-los-pantanos/patrimonio-cultural' },
      ],
    },
  ],

  // ── Chile central y desierto de Atacama ───────────────────────────────────────
  mediterraneo: [
    {
      practica: 'Red de acequias de la cultura Aconcagua',
      periodo: 'Prehispánico y documentado por escrito en 1558',
      tipo: 'agua',
      vigencia: 'historica',
      detalle:
        'Las poblaciones indígenas entre los ríos Aconcagua y Cachapoal derivaban agua desde vertientes y ríos por grandes canales, de los que salían acequias menores hacia asentamientos y tierras de cultivo. La estructura jerárquica de captación, conducción y reparto permite leer el relieve y organizar sectores de riego sin atribuir vigencia actual a las obras históricas.',
      fuentes: [
        { label: 'Biblioteca Nacional de Chile, Memoria Chilena — Sistemas de regadío de la cultura Aconcagua', url: 'https://www.memoriachilena.gob.cl/602/w3-article-93145.html' },
      ],
    },
  ],
  desierto_costero: [
    {
      practica: 'Terrazas compartimentadas con riego de vertientes',
      periodo: 'Período Intermedio Tardío, ca. 950–1400 d.C., y período inca, ca. 1400–1536 d.C.',
      tipo: 'agua',
      vigencia: 'historica',
      detalle:
        'En el margen alto oriental del desierto de Atacama se compartimentaron terrazas para distribuir el agua escasa procedente principalmente de vertientes. La construcción incluyó despedrado y probable fertilización, creó horizontes antrópicos y conservó o mejoró la productividad del suelo durante siglos.',
      fuentes: [
        { label: 'Universidad de Chile — Soils in ancient irrigated agricultural terraces in the Atacama desert', url: 'https://repositorio.uchile.cl/handle/2250/183892' },
      ],
    },
  ],

  // ── Amazonia ──────────────────────────────────────────────────────────────────
  amazonia_noroccidental_tierra_firme: [
    {
      practica: 'Chakra amazónica multiestrato',
      periodo: 'Ancestral y vigente; reconocida por FAO en 2023',
      tipo: 'cultivo',
      vigencia: 'en_uso',
      detalle:
        'Comunidades Kichwa y Kijus de Napo mantienen chakras que combinan yuca, plátano, chonta, frutales, maderables, medicinales y cultivos comerciales junto a bosque primario, secundario y barbechos. El arreglo suele conservar al menos tres estratos de cobertura y sombra, por lo que sirve como referencia situada para diseñar policultivos amazónicos sin simplificar el bosque.',
      fuentes: [
        { label: 'FAO Agroforestry — The Amazonian Chakra in Napo, Ecuador', url: 'https://www.fao.org/agroforestry/fao%27s-work/faos-work/article-detail/the-amazonian-chakra--a-traditional-agroforestry-system-managed-by-indigenous-communities-in-napo-province--ecuador/' },
      ],
    },
  ],
  amazonia_oriental_tierra_firme: [
    {
      practica: 'Formación de terra preta mediante cultivo con carbón',
      periodo: 'Entre hace 2500 y 500 años',
      tipo: 'suelo',
      vigencia: 'historica',
      detalle:
        'Poblaciones indígenas amazónicas cultivaron en claros parcialmente quemados y dejaron suelos oscuros con carbón vegetal persistente. La fuente presenta como probable, no demostrada, la creación intencional de terra preta; la lección verificable es su capacidad duradera de retener nutrientes en suelos tropicales pobres.',
      fuentes: [
        { label: 'Smithsonian Institution — Amazonia’s Terra Preta', url: 'https://forces.si.edu/soils/02_08_04.html' },
      ],
    },
  ],
  varzeas_igapos_amazonicos: [
    {
      practica: 'Pesca Cocamilla ajustada al pulso de inundación',
      periodo: 'Documentada en una comunidad tradicional a mediados de la década de 1970',
      tipo: 'recoleccion',
      vigencia: 'historica',
      detalle:
        'La comunidad Cocamilla estudiada en la llanura del Huallaga intensificaba la pesca durante aguas bajas, cuando los peces se concentraban, y reducía el esfuerzo durante la creciente. El calendario también se coordinaba con agricultura y caza; mujeres participaban en cosechas comunales y en el manejo de canoas, mostrando que el sistema productivo seguía el ciclo hidrológico completo.',
      fuentes: [
        { label: 'FAO — Management systems for riverine fisheries', url: 'https://www.fao.org/4/x6848e/X6848E06.HTM' },
      ],
    },
  ],

  amazonia_suroccidental_tierra_firme: [
    {
      practica: 'Movimiento de tierra y jardines forestales Aquiry',
      periodo: 'Desde hace más de 2500 años; geoglifos fechados entre 600 a.C. y 850 d.C.',
      tipo: 'suelo',
      vigencia: 'historica',
      detalle:
        'En Acre y Amazonas, las comunidades constructoras de geoglifos Aquiry levantaron recintos, zanjas, terraplenes y caminos vinculados con el manejo del suelo, el agua y jardines forestales. La persistencia de castaña y palmeras domesticadas o semidomesticadas alrededor de las obras muestra que el diseño productivo y la estructura forestal formaban un mismo paisaje gestionado.',
      fuentes: [
        { label: 'Nature — Over 20,000 precolonial earthworks in Southwest Amazonia', url: 'https://www.nature.com/articles/s41586-026-10835-7' },
      ],
    },
  ],
  // ── Andes tropicales ──────────────────────────────────────────────────────────
  bosques_montanos_andes_norte: [
    {
      practica: 'Chakras andinas por pisos climáticos y custodia de semillas',
      periodo: 'Práctica Kichwa sostenida durante siglos y vigente en 2026',
      tipo: 'cultivo',
      vigencia: 'en_uso',
      detalle:
        'En Cotacachi, mujeres Kichwa conservan y seleccionan semillas nativas y distribuyen una media de 25 cultivos entre pisos de 2500 a 3400 metros y sus microclimas. La combinación de diversidad, selección de semilla y ubicación altitudinal sostiene alimentación, medicina, forraje e ingresos y ofrece una pauta de diseño adaptativo frente a sequías y heladas.',
      fuentes: [
        { label: 'FAO — Secrets of the Andean chakras', url: 'https://www.fao.org/newsroom/story/secrets-of-the-andean-chakras/' },
      ],
    },
  ],
  valles_secos_interandinos: [
    {
      practica: 'Riego por kanis siguiendo curvas de nivel',
      periodo: 'Técnica ancestral andina aún practicada y documentada en 2016',
      tipo: 'agua',
      vigencia: 'en_uso',
      detalle:
        'En la comunidad de Jatichulaya, Charazani, se abren kanis o surcos de conducción adaptados a pendientes fuertes y alineados con las curvas de nivel. El reparto está a cargo de un Agente de Aguas y el trazado evita erosión, aunque la fuente destaca su elevada demanda de mano de obra.',
      fuentes: [
        { label: 'FAO AGRIS — La práctica de riegos ancestrales andinos: el riego por Kanis', url: 'https://agris.fao.org/search/en/providers/125077/records/67653b7bfccf879925c0e927' },
      ],
    },
  ],
  paramos_andinos: [
    {
      practica: 'Control comunitario del agua ligado al desarrollo agrícola',
      periodo: 'Al menos cuatro siglos hasta el registro de 2005',
      tipo: 'agua',
      vigencia: 'en_uso',
      detalle:
        'En Santa Rosa de Pilahuín, Ecuador, el desarrollo agrícola de páramo se organizó durante cuatro siglos junto con el control del agua. La referencia es útil para tratar captación, conducción, reparto y reglas colectivas como un solo sistema; no autoriza por sí sola nuevas obras en humedales de páramo protegidos.',
      fuentes: [
        { label: 'FAO AGRIS — Historical evolution of water control in an Andean community of Ecuador', url: 'https://agris.fao.org/search/en/providers/122439/records/6851663faab9439e79fca265' },
      ],
    },
  ],
  puna_seca_central: [
    {
      practica: 'Ganadería camélida sobre bofedales',
      periodo: 'Más de 3000 años, desde tiempos prehispánicos hasta la actualidad',
      tipo: 'ganaderia',
      vigencia: 'en_uso',
      detalle:
        'Comunidades altoandinas crían llamas y alpacas y mantienen la cultura de la tama o rebaño, vinculando pastoreo, reproducción y cuidado de humedales. El diseño territorial debe proteger bofedales, distribuir la presión de pastoreo y conservar diversidad de razas, combinando saber tradicional con sanidad y monitoreo actuales.',
      fuentes: [
        { label: 'FAO y Ministerio de Agricultura de Chile — Ganadería camélida sostenible en el territorio altoandino', url: 'https://www.fao.org/americas/publications/enfoques/ganaderia-camelida/' },
      ],
    },
  ],

  // ── Caribe continental y Pacífico ecuatorial ──────────────────────────────────
  bosques_humedos_caribe_colombia_venezuela: [
    {
      practica: 'Policultivos de pancoger, frutales, maderables y artesanales',
      periodo: 'Registrados en 1999 e incorporados al plan de manejo de 2009',
      tipo: 'cultivo',
      vigencia: 'en_uso',
      detalle:
        'El plan de manejo de la Sierra Nevada de Santa Marta registra policultivos o cultivos mixtos con alimentos de autoconsumo, frutales, especies maderables y plantas artesanales. La mezcla de funciones reduce la dependencia de una sola cosecha y mantiene simultáneamente alimento, materiales y cobertura en predios de comunidades de la Sierra.',
      fuentes: [
        { label: 'Parques Nacionales Naturales de Colombia — Plan de manejo Sierra Nevada de Santa Marta', url: 'https://intranet.parquesnacionales.gov.co/wp-content/uploads/2016/05/SierraNevadaPM2009.pdf' },
      ],
    },
  ],
  bosques_secos_caribe_colombia_venezuela: [
    {
      practica: 'Canales y camellones de la Depresión Momposina',
      periodo: 'Siglo X a.C. a aproximadamente siglo X d.C.',
      tipo: 'agua',
      vigencia: 'historica',
      detalle:
        'Las sociedades prehispánicas del Bajo San Jorge y La Mojana construyeron una red extensa de canales y camellones para almacenar, drenar y distribuir el agua. El sistema acompañaba los ciclos naturales de inundación y sedimentación en vez de intentar eliminarlos, una referencia valiosa para zonificar cotas productivas y vías de excedencia.',
      fuentes: [
        { label: 'ICANH — Sistema Hidráulico Arqueológico del Bajo Río San Jorge y La Mojana', url: 'https://www.icanh.gov.co/sobre-nosotros/proyectos-estrategicos/sistema-hidraulico-arqueologico-del-bajo-rio-san-jorge-y-la-mojana' },
      ],
    },
  ],
  montanas_caribe_norte: [
    {
      practica: 'Agricultura indígena distribuida en gradiente altitudinal',
      periodo: 'Sistema tradicional registrado oficialmente y vigente al momento de la publicación',
      tipo: 'cultivo',
      vigencia: 'en_uso',
      detalle:
        'En la Sierra Nevada de Santa Marta, poblados Kogui, Wiwa, Arhuaco y Kankuamo se enlazan con los ríos y distribuyen cultivos desde tierras bajas hasta páramos. En cotas bajas aparecen cacao, café, plátano y caña, mientras la papa ocupa alturas mayores; esta zonificación vertical vincula microclimas, agua y productos en un solo territorio.',
      fuentes: [
        { label: 'Parques Nacionales Naturales de Colombia — Comunidades de la Sierra Nevada de Santa Marta', url: 'https://old.parquesnacionales.gov.co/portal/es/ecoturismo/parques/region-caribe/parque-nacional-natural-sierra-nevada-de-santa-marta-2/comunidades/' },
      ],
    },
  ],
  bosques_secos_tumbes_ecuador_peru: [
    {
      practica: 'Cosecha de escorrentía en albarradas',
      periodo: 'Desde la cultura Valdivia, 2000–1500 a.C.; práctica reconocida por pobladores en 2019',
      tipo: 'agua',
      vigencia: 'en_uso',
      detalle:
        'En la península de Santa Elena, las albarradas almacenan agua de lluvia y escorrentía para atravesar la estación seca. Entrevistas a adultos mayores la identificaron como el saber ancestral más reconocido; su adopción actual requiere calcular cuenca aportante, vertedero y seguridad de la presa según la normativa local.',
      fuentes: [
        { label: 'Revista Amazónica Ciencia y Tecnología — Saberes ancestrales agropecuarios en la Península de Santa Elena', url: 'https://revistas.uea.edu.ec/index.php/racyt/article/download/107/272?inline=1' },
      ],
    },
  ],
  humedales_guayaquil: [
    {
      practica: 'Campos elevados y plataformas de cultivo en áreas de desborde',
      periodo: 'Origen aparentemente precolombino; documentados arqueológicamente en 1969',
      tipo: 'suelo',
      vigencia: 'historica',
      detalle:
        'Al norte y este de Guayaquil se registraron extensiones de campos con caballones y plataformas de plantación detrás de los albardones naturales del río Guayas. Elevar el terreno productivo dentro de la llanura de desborde separaba raíces y cultivos de la saturación prolongada y articulaba drenaje y cultivo mediante trabajo colectivo intensivo.',
      fuentes: [
        { label: 'American Antiquity — Ridged Fields in the Rio Guayas Valley, Ecuador', url: 'https://www.cambridge.org/core/journals/american-antiquity/article/abs/ridged-fields-in-the-rio-guayas-valley-ecuador/AF5F97EE20D765AC79DFC934843E4A29' },
      ],
    },
  ],
  manglares_pacifico_suramericano: [
    {
      practica: 'Recolección de concha prieta durante la bajamar',
      periodo: 'Desde tiempos precolombinos y vigente en el registro contemporáneo',
      tipo: 'recoleccion',
      vigencia: 'en_uso',
      detalle:
        'En la costa ecuatoriana, pescadores artesanales recolectan conchas entre raíces de manglar durante la marea baja y reconocen bancos productivos mediante experiencia y uso consuetudinario. En Esmeraldas la actividad se realiza tradicionalmente en grupos familiares con mujeres y niños; las concesiones actuales pueden organizar transporte y áreas comunales de cosecha.',
      fuentes: [
        { label: 'FAO Fisheries — Mangrove cockle fisheries and tenure in Ecuador', url: 'https://www.fao.org/fishery/static/tenure-user-rights/root/volume1/C13.pdf' },
      ],
    },
  ],
  bosque_humedo_occidente_ecuador: [
    {
      practica: 'Agroforestería precolombina de anuales, frutales y especies forestales',
      periodo: 'Cultura Jama-Coaque II, aproximadamente 400–1430 d. C.',
      tipo: 'cultivo',
      vigencia: 'historica',
      detalle:
        'Las comunidades Jama-Coaque II del valle del Jama manejaron un sistema que combinaba anuales domesticadas, árboles perennes y taxones útiles del bosque. Los conjuntos arqueobotánicos y arqueofaunísticos de catorce sitios del valle apuntan a un paisaje manejado como mosaico de bosques fragmentados, no a un campo abierto de cultivo continuo.',
      fuentes: [
        { label: 'Stahl y Pearsall (2011) — Late pre-Columbian agroforestry in the tropical lowlands of western Ecuador, Quaternary International 249: 43-52 (resumen público; el texto completo es de pago)', url: 'https://www.sciencedirect.com/science/article/abs/pii/S1040618211002540' },
      ],
    },
  ],
  galapagos_matorral_xerico: [
    {
      practica: 'Extracción de sal costera para curar pescado',
      periodo: '1886, 1924–1930 y década de 1960',
      tipo: 'recoleccion',
      vigencia: 'historica',
      detalle:
        'Colonos de Galápagos extrajeron sal de James Bay, en Santiago, en tres períodos documentados y la usaron para curar pescado. La actividad también abastecía una demanda ocasional del continente cuando lluvias intensas inundaban sus salinas costeras. Es una adaptación económica histórica de colonos en una isla árida, no un saber ancestral ni una práctica recomendada para un ecosistema protegido.',
      fuentes: [
        { label: 'Oxford y Watkins (2009) — Galápagos: Both Sides of the Coin, texto reproducido por Galápagos Conservancy en History of Galápagos', url: 'https://www.galapagos.org/about_galapagos/history/' },
      ],
    },
  ],

  // ── Guayanas y Orinoquia ──────────────────────────────────────────────────────
  guayanas_bosques_tierras_bajas: [
    {
      practica: 'Pesca y recolección amerindia de pequeña escala',
      periodo: 'Práctica de larga historia, documentada como vigente en el plan 2015–2019',
      tipo: 'recoleccion',
      vigencia: 'en_uso',
      detalle:
        'Comunidades Macushi y Wapishana próximas a las montañas Kanuku sostienen pesca tradicional, recolección de productos forestales maderables y no maderables y caza de subsistencia a pequeña escala. El plan del área protegida considera que esos usos de bajo impacto pueden satisfacer necesidades locales y contribuir a conservar ecosistemas, siempre dentro de acuerdos comunitarios y reglas de manejo.',
      fuentes: [
        { label: 'Protected Areas Commission Guyana — Kanuku Mountains Protected Area Management Plan 2015–2019', url: 'https://www.pac.gov.gy/wp-content/uploads/2022/10/KMPA-Plan.pdf' },
      ],
    },
  ],
  llanos_orinoquia: [
    {
      practica: 'Campos agrícolas elevados de Caño Ventosidad',
      periodo: 'Expansión arauquinoide, entre 1000 y 1400 d.C.',
      tipo: 'suelo',
      vigencia: 'historica',
      detalle:
        'En los Llanos de Barinas se construyeron campos de cultivo prehispánicos asociados por la investigación arqueológica con grupos de selva tropical de la expansión arauquinoide. La elevación y modelado del terreno permitió habilitar superficies agrícolas dentro de una sabana con marcada estacionalidad hídrica.',
      fuentes: [
        { label: 'INDIANA — Campos agrícolas prehispánicos en los Llanos de Barinas, Venezuela', url: 'https://journals.iai.spk-berlin.de/index.php/indiana/article/view/1599' },
      ],
    },
  ],

  sabanas_guayanesas: [
    {
      practica: 'Manejo Pemón del fuego en la Gran Sabana',
      periodo: 'Practicado durante siglos; observado por UNESCO e IUCN en 1999',
      tipo: 'fuego',
      vigencia: 'en_uso',
      detalle:
        'Las comunidades Pemón de Canaima aplican procedimientos tradicionales de encendido y control en la Gran Sabana, donde el fuego participa de la dinámica ecológica. La fuente documenta quemas pequeñas y controladas, pero cualquier traducción a manejo predial debe reconocer la autoridad y el conocimiento Pemón y someterse al plan de fuego y la legislación vigentes.',
      fuentes: [
        { label: 'UNESCO–IUCN — Mission report to Canaima National Park', url: 'https://whc.unesco.org/document/134048' },
      ],
    },
  ],
  guayanas_bosques_inundables_delta: [
    {
      practica: 'Campos elevados y drenajes en sabanas costeras inundables',
      periodo: '650–1650 d. C.; expansión principal entre 1000 y 1450 d. C.',
      tipo: 'suelo',
      vigencia: 'historica',
      detalle:
        'Poblaciones arauquinoides de las Guayanas elevaron miles de superficies de cultivo y excavaron canales, zanjas y caminos en sabanas costeras anegadas o estacionalmente inundables. Elevar el montículo no siempre alcanzaba para proteger los cultivos, y por eso se cavaron canales para controlar la variación del nivel del agua; la forma de los montículos —redondos, cuadrados, rectangulares o alargados— parece responder a la profundidad.',
      fuentes: [
        { label: 'Rostain, S. (2010) — Pre-Columbian Earthworks in Coastal Amazonia, Diversity 2(3): 331-352', url: 'https://www.mdpi.com/1424-2818/2/3/331' },
      ],
    },
  ],
  humedales_orinoco: [
    {
      practica: 'Conucos elevados construidos con palas de madera',
      periodo: 'Documentada en 1745',
      tipo: 'suelo',
      vigencia: 'historica',
      detalle:
        'El misionero Gumilla registró en 1745 que los otomacos construían campos elevados con palas de madera en los Llanos venezolanos, y los describió cultivando sobre campos elevados en la confluencia del Orinoco con el Apure. Elevar el horizonte de cultivo cumplía una función de drenaje donde la sabana se anega cada año.',
      fuentes: [
        { label: 'Rostain, S. (2010) — Pre-Columbian Earthworks in Coastal Amazonia, Diversity 2(3): 331-352', url: 'https://www.mdpi.com/1424-2818/2/3/331' },
      ],
    },
  ],
  manglares_amazon_orinoco_caribe_sur: [
    {
      practica: 'Pesca intensificada y uso estacional de recursos costeros',
      periodo: 'Entre 7500 y 2000 años antes del presente',
      tipo: 'recoleccion',
      vigencia: 'historica',
      detalle:
        'Siete concheros de la costa noroccidental de Guyana registran estrategias de forrajeo costero durante el Holoceno temprano y medio. La integración de zooarqueología e isótopos relaciona fluctuaciones climáticas con intensificación de la pesca, movilidad, uso estacional de recursos y expansión del manglar. El registro no identifica un pueblo histórico concreto ni demuestra una técnica uniforme en toda la costa amazónico-orinoquense.',
      fuentes: [
        { label: 'Daggers y Plew (2026) — Inferring Human Predation and Land Use: An Examination of the Northwestern Guyana Coast Shell Midden Records Amid Environmental Change, Quaternary 9(2): 24 (acceso abierto)', url: 'https://www.mdpi.com/2571-550X/9/2/24' },
      ],
    },
  ],
  // ── Llanuras inundables y bosque seco del interior ────────────────────────────
  sabanas_beni: [
    {
      practica: 'Campos elevados precolombinos de los Llanos de Moxos',
      periodo: 'Precolombino; cartografía integral publicada en 2010 y registrada en 2023',
      tipo: 'suelo',
      vigencia: 'historica',
      detalle:
        'En el norte de Santa Ana de Yacuma se concentraron plataformas elevadas de tierra para intensificar el cultivo en una llanura estacionalmente inundable. La cartografía de alta resolución sobre 416 km² muestra que la extensión de estas obras fue mucho mayor de lo supuesto, pero la fuente advierte que sus modalidades concretas de uso siguen siendo inciertas.',
      fuentes: [
        { label: 'Deutsches Archäologisches Institut — Raised Fields of Northwestern Bolivia: a GIS based analysis', url: 'https://publications.dainst.org/journals/zaak/article/view/4198' },
      ],
    },
  ],
  pantanal: [
    {
      practica: 'Pastoreo extensivo ajustado al pulso de inundación',
      periodo: 'Desde el ciclo minero colonial; documentado en el plan de manejo contemporáneo',
      tipo: 'ganaderia',
      vigencia: 'en_uso',
      detalle:
        'La ganadería extensiva pantaneira se desarrolló para abastecer minas y ciudades y acomodó el rodeo al pulso anual de inundación. Durante las crecientes los animales se concentran en cordilheiras y capões altos y, con aguas bajas, amplían el pastoreo; esta movilidad exige proteger refugios, rutas y capacidad de carga.',
      fuentes: [
        { label: 'ICMBio — Plano de manejo RPPN Estância Ecológica SESC Pantanal', url: 'https://www.gov.br/icmbio/pt-br/assuntos/biodiversidade/unidade-de-conservacao/unidades-de-biomas/cerrado/lista-de-ucs/rppn-estancia-ecologica-sesc-pantanal/arquivos/rppn_sesc_pantanalplanodemanejo.pdf/%40%40download/file/rppn_sesc_pantanalPLANODEMANEJO.pdf' },
      ],
    },
  ],
  bosque_seco_chiquitano: [
    {
      practica: 'Roza, tala y quema controlada de baja intensidad',
      periodo: 'Práctica chiquitana premisional transmitida hasta la actualidad',
      tipo: 'cultivo',
      vigencia: 'en_uso',
      detalle:
        'Los Chiquitanos preparan pequeñas áreas para maíz, yuca, frijol y zapallo mediante tala, roza y quema adaptadas a los ciclos climáticos. La fuente describe conocimiento transmitido entre generaciones para controlar desmontes y chaqueos sin afectar otros sembradíos; no convierte la quema en una recomendación general fuera de su gobernanza y marco legal.',
      fuentes: [
        { label: 'Ciencia y Cultura / SciELO Bolivia — De la espada y la cruz a los tractores y la constitución en la conquista de Chiquitos', url: 'https://www.scielo.org.bo/scielo.php?pid=S2077-33232025000100221&script=sci_arttext' },
      ],
    },
  ],

  // ── Brasil: Cerrado, Caatinga y Mata Atlántica ────────────────────────────────
  sabana_cerrado: [
    {
      practica: 'Quemas pastoriles tempranas en mosaico',
      periodo: 'Práctica tradicional vigente; documentada científicamente en 2019',
      tipo: 'fuego',
      vigencia: 'en_uso',
      detalle:
        'Ganaderos tradicionales del Cerrado realizan quemas pequeñas y estacionales para renovar el forraje y formar un mosaico de edades de combustible. En las áreas comunitarias estudiadas, este patrón también protegió vegetación sensible y redujo el daño de grandes incendios tardíos; su traslado a diseño predial exige prescripción técnica y autorización local.',
      fuentes: [
        { label: 'FAO AGRIS — Seasonal fire management by traditional cattle ranchers prevents the spread of wildfire in the Brazilian Cerrado', url: 'https://agris.fao.org/search/en/providers/122535/records/65df4349b766d82b1800f444' },
      ],
    },
  ],
  caatinga: [
    {
      practica: 'Fundo de Pasto y pastoreo comunitario de la Caatinga',
      periodo: 'Desde el período colonial y vigente en 2022',
      tipo: 'ganaderia',
      vigencia: 'en_uso',
      detalle:
        'Las Comunidades Tradicionales Fundo de Pasto del Sertão do São Francisco gestionan en común áreas de Caatinga para la cría extensiva, junto con espacios familiares de cultivo. El uso colectivo y las reglas sociales permiten distribuir el acceso a forraje nativo en el semiárido y deben considerarse inseparables de cualquier propuesta física de potreros o cierres.',
      fuentes: [
        { label: 'Embrapa — Comunidades tradicionais Fundo de Pasto y agrobiodiversidad de la Caatinga', url: 'https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1140187/1/Fundo-de-pasto.-Bianchini.2022.pdf' },
      ],
    },
  ],
  caatinga_enclaves_humedos: [
    {
      practica: 'Café sombreado bajo dosel nativo en Baturité',
      periodo: 'Desde 1862 y consolidado a fines del siglo XIX; vigente',
      tipo: 'cultivo',
      vigencia: 'en_uso',
      detalle:
        'Pequeños productores de la sierra de Baturité trasladaron el café desde pleno sol hacia el dosel del bosque al observar mayor resistencia a radiación, lluvias e intemperie. El sistema lavoura-floresta conserva sombra y cobertura, aunque la propia historia regional registra envejecimiento de cafetales y desgaste de suelo que un diseño actual debe corregir.',
      fuentes: [
        { label: 'Turismo: Visão e Ação / SciELO — O café sombreado da serra de Baturité', url: 'https://www.scielo.br/j/tva/a/xzXYnDmrkxt4C89fFvv5t3f/?format=html' },
      ],
    },
  ],
  bosques_babacu_maranhao: [
    {
      practica: 'Recolección y quiebra manual del coco babaçu',
      periodo: 'Transmitida por generaciones y vigente en 2019',
      tipo: 'recoleccion',
      vigencia: 'en_uso',
      detalle:
        'Las quebradeiras de coco babaçu, reconocidas como comunidad tradicional, aprenden desde niñas con sus madres a recolectar, transportar y quebrar el fruto para extraer la almendra. Las leyes de Babaçu Livre protegen en varios municipios el acceso de las mujeres a las palmeras incluso en propiedades privadas, por lo que el diseño predial debe mantener pies productivos y corredores de acceso.',
      fuentes: [
        { label: 'Agência de Notícias IBGE — Quebradeiras de coco babaçu preservam tradição no interior do Maranhão', url: 'https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/23624-quebradeiras-de-coco-babacu-preservam-tradicao-no-interior-do-maranhao' },
      ],
    },
  ],
  mata_araucaria_altura: [
    {
      practica: 'Erva-mate sombreada dentro del bosque de araucaria',
      periodo: 'Uso indígena antiguo y manejo comunitario sostenido durante siglos; vigente en 2026',
      tipo: 'cultivo',
      vigencia: 'en_uso',
      detalle:
        'Pueblos indígenas Rio d’Areia y familias de Paraná cultivan erva-mate dentro del bosque nativo, manejando cobertura, regeneración y diversidad sin sustituir el dosel. La cosecha de hojas cada tres años, la propagación local y el mantenimiento de frutales y especies forestales protegen suelo, agua y continuidad productiva.',
      fuentes: [
        { label: 'FAO — Mate: the drink that keeps a forest alive', url: 'https://www.fao.org/newsroom/story/mate-the-drink-that-keeps-a-forest-alive/en' },
      ],
    },
  ],
  mata_atlantica_costera: [
    {
      practica: 'Cacao cabruca bajo árboles de la Mata Atlántica',
      periodo: 'Aproximadamente 250 años de cultivo en Bahía; vigente en 2008',
      tipo: 'cultivo',
      vigencia: 'en_uso',
      detalle:
        'El sistema cabruca implanta cacao bajo sombra después de ralear selectivamente la vegetación, manteniendo buena parte del arbolado y la función forestal. En el sur de Bahía se lo documenta como una forma agroforestal capaz de proteger biodiversidad, suelos y manantiales, aunque requiere enriquecimiento y manejo que eviten simplificar el dosel.',
      fuentes: [
        { label: 'Secretaria da Agricultura da Bahia — Sistema de cacau cabruca preservando os mananciais', url: 'https://www.ba.gov.br/seagri/noticias/2008/12/09/sistema-de-cacau-cabruca-preservando-os-mananciais' },
      ],
    },
  ],
  mata_atlantica_interior: [
    {
      practica: 'Coivara quilombola con barbecho',
      periodo: 'Practicada durante siglos; en transformación y retroceso desde mediados del siglo XX',
      tipo: 'cultivo',
      vigencia: 'en_retroceso',
      detalle:
        'Comunidades quilombolas del Vale do Ribeira abren rozas temporales, cultivan y luego dejan barbecho para que la vegetación y el suelo se recuperen antes de un nuevo ciclo. La práctica depende de suficiente superficie, tiempos largos y reglas comunitarias; la reducción territorial y las restricciones desde la década de 1950 alteraron su funcionamiento.',
      fuentes: [
        { label: 'Universidade de São Paulo — Ecologia histórica de populações quilombolas do Vale do Ribeira', url: 'https://teses.usp.br/teses/disponiveis/41/41134/tde-07032010-134736/pt-br.html' },
      ],
    },
  ],
  mata_atlantica_restingas: [
    {
      practica: 'Roça de coivara caiçara con descanso de la tierra',
      periodo: 'Herencia indígena y colonial; actualmente en retroceso',
      tipo: 'cultivo',
      vigencia: 'en_retroceso',
      detalle:
        'Las comunidades caiçaras de restingas, manglares y laderas atlánticas practican roza itinerante para mandioca, maíz, poroto, caña, ñame y plantas medicinales, seguida por un período de pousio. ICMBio señala que la agricultura pierde espacio frente a otras fuentes de ingreso, de modo que su referencia de diseño es el ciclo completo cultivo–descanso y no la quema aislada.',
      fuentes: [
        { label: 'ICMBio — Povos e Comunidades Tradicionais, cultura caiçara', url: 'https://www.gov.br/icmbio/pt-br/assuntos/unidade-de-conservacao/unidades-de-biomas/marinho/lista-de-ucs/apa-de-cairucu/povos-e-comunidades-tradicionais/' },
      ],
    },
  ],
  manglares_atlantico_sur_brasil: [
    {
      practica: 'Extracción diversificada de caranguejo-uçá y mariscos',
      periodo: 'Práctica tradicional documentada oficialmente en 1994',
      tipo: 'recoleccion',
      vigencia: 'en_uso',
      detalle:
        'Catadores y marisqueiros extraen caranguejo-uçá y otras especies del manglar, diversificando la captura según disponibilidad. Para su traducción a manejo predial o comunitario deben conservarse canales y refugios, respetarse talla, época reproductiva y vedas vigentes, y no inferirse que el registro de 1994 describe el estado actual de cada población.',
      fuentes: [
        { label: 'ICMBio — Relatório de ordenamento do caranguejo-uçá, 1994', url: 'https://www.gov.br/icmbio/pt-br/assuntos/centros-de-pesquisa/biodiversidade-marinha-do-sudeste-e-sul/acervo-digital/relatorio-de-ordenamento/caranguejo/rel_1994_caranguejo_uca_ma.pdf' },
      ],
    },
  ],

  campos_rupestres: [
    {
      practica: 'Recolección estacional de flores siempre-vivas',
      periodo: 'Práctica secular y vigente; reconocida por FAO en 2020',
      tipo: 'recoleccion',
      vigencia: 'en_uso',
      detalle:
        'Familias campesinas y quilombolas del Espinhaço suben entre abril y octubre para recolectar flores siempre-vivas y permanecer semanas en la sierra. El manejo regula momento e intensidad según el ciclo natural para permitir renovación, y se articula con custodia e intercambio de semillas y plantas alimentarias y medicinales.',
      fuentes: [
        { label: 'FAO Brasil — Apanhadoras e apanhadores de flores sempre-vivas (copia archivada del 04/01/2023: la nota ya no está en fao.org)', url: 'https://web.archive.org/web/20230104000110/https://www.fao.org/brasil/noticias/detail-events/fr/c/1265788/' },
      ],
    },
  ],
  // ── Alaska y Hawái ────────────────────────────────────────────────────────────
  alaska_costa_taiga: [
    {
      practica: 'Pesca tradicional Ahtna en Tanada Creek',
      periodo: 'Desde hace más de 1.000 años; continúa en uso',
      tipo: 'recoleccion',
      vigencia: 'en_uso',
      detalle:
        'El pueblo Ahtna mantiene en Batzulnetas un sitio tradicional de pesca de salmón y transmite allí conocimientos de subsistencia y cultura. Para el diseño territorial, el registro obliga a conservar el paso y los pulsos estacionales de los peces, y a coordinar cualquier obra hidráulica con los titulares culturales del lugar; la estación moderna de monitoreo del parque no debe confundirse con una estructura tradicional Ahtna.',
      fuentes: [
        { label: 'National Park Service — Tanada Creek Fish Weir', url: 'https://www.nps.gov/wrst/learn/management/tanada-creek-fish-weir.htm' },
      ],
    },
  ],
  alaska_tundra_hielo_beringia: [
    {
      practica: 'Almacenamiento subterráneo de alimentos en Beringia',
      periodo: 'Tradicional; transformada hacia mediados del siglo XX y revisada comunitariamente entre 2023 y 2025',
      tipo: 'recoleccion',
      vigencia: 'en_retroceso',
      detalle:
        'Pueblos indígenas de Beringia conservaron alimentos cosechados localmente en sótanos de hielo, escondites subterráneos y pozos. La pérdida de permafrost estable y los cambios sociales alteran su desempeño, por lo que cualquier recuperación exige medir el régimen térmico e hídrico local y trabajar con las comunidades de Sivuqaq, Gambell y Point Hope, no copiar una sección constructiva genérica.',
      fuentes: [
        { label: 'National Park Service — Underground food storage practices in Beringian communities', url: 'https://www.nps.gov/subjects/beringia/sharing-knowledge-of-food-life-history-and-underground-food-storage-practices-in-beringian-communities.htm' },
      ],
    },
  ],
  hawaii_bosques_humedos_secos: [
    {
      practica: 'Estanques costeros hawaianos integrados al ahupuaʻa',
      periodo: 'Construidos principalmente entre 1200 y 1600; restauración comunitaria contemporánea documentada desde 2013',
      tipo: 'agua',
      vigencia: 'en_uso',
      detalle:
        'Hawaianos nativos construyeron estanques costeros con muros de roca y aperturas enrejadas que admitían peces juveniles, mantenían el intercambio de agua y retenían ejemplares de cosecha. Los loko iʻa formaban parte del sistema territorial ahupuaʻa desde montaña a mar; las restauraciones actuales son comunitarias y responden a condiciones y metas propias de cada cuenca, por lo que no deben copiarse sólo por su geometría.',
      fuentes: [
        { label: 'NOAA Fisheries — Hawaiian Fishponds', url: 'https://www.fisheries.noaa.gov/feature-story/hawaiian-fishponds-providing-physical-and-cultural-sustenance' },
      ],
    },
  ],
  hawaii_matorrales_altos_bajos: [
    {
      practica: 'Sistema de campos de secano de Kohala',
      periodo: 'Primera expansión desde el siglo XIV; segunda expansión después de mediados del siglo XVII',
      tipo: 'cultivo',
      vigencia: 'historica',
      detalle:
        'El sistema de campos de secano de la vertiente de sotavento de Kohala permite datar con precisión su desarrollo —expansión e intensificación— combinando datación cronométrica y relativa. Se identifican dos vías, y el mismo patrón se reconoce en otros cuatro sistemas de secano de Maui, Molokaʻi y Hawaiʻi. El artículo es de acceso pago: esta entrada se apoya en su resumen público, que fecha el desarrollo pero no describe la forma de los campos ni los cultivos.',
      fuentes: [
        { label: 'Ladefoged y Graves (2008) — Variable Development of Dryland Agriculture in Hawaiʻi: A Fine-Grained Chronology from the Kohala Field System, Hawaiʻi Island, Current Anthropology 49(5)', url: 'https://www.journals.uchicago.edu/doi/10.1086/591424' },
      ],
    },
  ],

  // ── Oeste de Estados Unidos ───────────────────────────────────────────────────
  pacifico_noroeste_bosques_coniferas: [
    {
      practica: 'Fuego cultural de Warm Springs en bosques mixtos húmedos',
      periodo: 'En uso tradicional hasta aproximadamente 1940; actualmente investigada para restauración',
      tipo: 'fuego',
      vigencia: 'en_retroceso',
      detalle:
        'Pueblos Ichishkin, Kitsht Wasco y Numu de Warm Springs manejaron con fuego de baja severidad un mosaico de bosque mixto, praderas y parches de arándano. La interrupción del fuego cultural redujo la productividad de áreas históricas de cosecha; su restauración debe quedar bajo liderazgo tribal y considerar la estructura actual del bosque, no reproducir sin más una frecuencia histórica.',
      fuentes: [
        { label: 'Steen-Adams y otros (2019) — Traditional knowledge of fire use by the Confederated Tribes of Warm Springs in the eastside Cascades of Oregon, Forest Ecology and Management (copia abierta en PDXScholar)', url: 'https://pdxscholar.library.pdx.edu/iss_pub/120/' },
      ],
    },
  ],
  interior_noroeste_palouse_willamette: [
    {
      practica: 'Cosecha Nimiipuu de camas con resiembra por selección',
      periodo: 'Documentada en septiembre de 1805; continúa en uso',
      tipo: 'recoleccion',
      vigencia: 'en_uso',
      detalle:
        'Familias Nez Perce o Nimiipuu cosechan bulbos de camas y dejan los ejemplares pequeños para que sigan creciendo, una selección que renueva el parche alimentario. La práctica vincula calendario, identificación precisa de plantas y apertura de la pradera; conservarla requiere evitar compactación y pérdida del hábitat y acompañar el manejo Nimiipuu, no tratar el bulbo como un recurso silvestre sin titulares.',
      fuentes: [
        { label: 'National Park Service — Camas', url: 'https://home.nps.gov/articles/000/camas.htm' },
      ],
    },
  ],
  california_klamath_sierra_valle: [
    {
      practica: 'Quema cultural Karuk y Yurok para varas de avellano',
      periodo: 'Revitalizada y documentada en sitios con quemas entre 1989 y 2019',
      tipo: 'fuego',
      vigencia: 'en_uso',
      detalle:
        'Pueblos Karuk y Yurok revitalizan la quema cultural para producir tallos rectos de avellano destinados a la cestería y recuperar relaciones sociales y ecológicas. El monitoreo encontró mayor disponibilidad de tallos útiles después de quemas frecuentes, pero la frecuencia y la ejecución pertenecen a programas indígenas situados y no deben convertirse en una prescripción universal de fuego.',
      fuentes: [
        { label: 'Marks-Block, Lake y Curran (2021) — Revitalized Karuk and Yurok cultural burning to enhance California hazelnut for basketweaving, Fire Ecology 17:6', url: 'https://fireecology.springeropen.com/articles/10.1186/s42408-021-00092-6' },
      ],
    },
  ],
  rocosas_norte_praderas_montanas: [
    {
      practica: 'Fuego cultural salish y pend d’Oreille',
      periodo: 'Durante miles de años; con usos contemporáneos documentados por las tribus',
      tipo: 'fuego',
      vigencia: 'en_uso',
      detalle:
        'Pueblos salish, pend d’Oreille y vecinos usaron fuego periódico en las Rocosas del norte para favorecer alimentos, medicinas, forraje y espacios de tránsito. Organizaciones tribales contemporáneas vuelven a aplicar conocimiento cultural frente a combustibles acumulados, pero cada quema requiere liderazgo indígena, objetivos locales y evaluación actual de riesgo.',
      fuentes: [
        { label: 'National Park Service — Indigenous fire practices shape our land', url: 'https://www.nps.gov/subjects/fire/indigenous-fire-practices-shape-our-land.htm' },
      ],
    },
  ],
  rocosas_sur_sky_islands: [
    {
      practica: 'Agricultura de secano pueblo en suelos de pómez',
      periodo: 'Durante unos 400 años en Frijoles Canyon; registro arqueológico e histórico',
      tipo: 'agua',
      vigencia: 'historica',
      detalle:
        'Los Pueblo ancestrales cultivaron maíz, frijol y calabaza en suelos de pómez mediante diques pequeños, acolchado de grava, cuadros de cultivo y hoyos profundos y espaciados. El pómez absorbía agua y la liberaba lentamente a las raíces, una adaptación al secano del Pajarito Plateau; se trata de evidencia histórica en un paisaje que sigue siendo culturalmente significativo para pueblos Pueblo actuales.',
      fuentes: [
        { label: 'National Park Service — Ancestral Pueblo farming', url: 'https://home.nps.gov/band/learn/historyculture/ancestral-pueblo-farming.htm' },
      ],
    },
  ],
  grandes_llanuras_pradera_alta_mixta: [
    {
      practica: 'Quema indígena para sostener la pradera y el bisonte',
      periodo: 'Antes del asentamiento europeo; parte de un régimen de fuego que sostuvo la pradera durante los últimos 5.000 años',
      tipo: 'fuego',
      vigencia: 'historica',
      detalle:
        'Pueblos indígenas de las llanuras usaron fuego para producir brotes verdes y atraer bisontes, reforzando procesos que también iniciaban los rayos. La quema limitaba el avance leñoso y renovaba el pastizal, pero el registro ecológico regional no define una frecuencia transferible ni reemplaza la autoridad tribal, el análisis de combustible o la normativa actual.',
      fuentes: [
        { label: 'National Park Service — Fire regime at Tallgrass Prairie', url: 'https://www.nps.gov/tapr/learn/nature/fire-regime.htm' },
      ],
    },
  ],
  gran_cuenca_meseta_colorado: [
    {
      practica: 'Riego de plantas silvestres alimenticias en Owens Valley',
      periodo: 'Documentada a comienzos del período histórico; origen anterior no fechado',
      tipo: 'agua',
      vigencia: 'historica',
      detalle:
        'Los paiute de Owens Valley construyeron y mantuvieron acequias para regar gramíneas de semilla y otras plantas alimenticias sin depender de cultivos domesticados. La derivación de arroyos expandía y estabilizaba la producción vegetal en el piso árido del valle, y constituye un sistema indígena de vegecultura desarrollado localmente.',
      fuentes: [
        { label: 'Lawton, Wilke, DeDecker y Mason (1976) — Agriculture Among the Paiute of Owens Valley, The Journal of California Anthropology 3(1) (copia abierta en eScholarship)', url: 'https://escholarship.org/uc/item/0595h88m' },
      ],
    },
  ],

  // ── Este y sur de Estados Unidos ──────────────────────────────────────────────
  noreste_grandes_lagos_bosques: [
    {
      practica: 'Quema cultural ojibwe para arándanos en Stockton Island',
      periodo: 'Durante siglos; reintroducida en Stockton Island en 2017 y repetida en 2021',
      tipo: 'fuego',
      vigencia: 'en_uso',
      detalle:
        'Pueblos ojibwe de los Grandes Lagos usaron fuego para favorecer arándanos en los pinares abiertos de Stockton Island y reactivaron quemas culturales con alianzas tribales contemporáneas. La práctica mantiene claros y plantas de alimento, pero su diseño y ejecución corresponden a las comunidades Red Cliff, Bad River y otras organizaciones tribales participantes, junto con las condiciones actuales del sitio.',
      fuentes: [
        { label: 'National Park Service — Indigenous fire practices shape our land', url: 'https://www.nps.gov/subjects/fire/indigenous-fire-practices-shape-our-land.htm' },
      ],
    },
  ],
  apalaches_bosques_y_rivercane: [
    {
      practica: 'Manejo de rivercane mediante fuego indígena',
      periodo: 'Histórica y aún viva en la cestería; el hábitat conserva cerca del 2 % de su extensión anterior',
      tipo: 'fuego',
      vigencia: 'en_retroceso',
      detalle:
        'Pueblos indígenas de los Apalaches favorecieron los cañaverales de rivercane con fuego y otras intervenciones, y comunidades Cherokee mantienen su uso cultural en la cestería. El manejo sostenía claros ribereños soleados, limitaba la invasión leñosa y aportaba estabilización de orillas; su aplicación actual requiere autoridad tribal y planificación específica de fuego, no una receta predial genérica.',
      fuentes: [
        { label: 'National Park Service — Rivercane', url: 'https://home.nps.gov/articles/000/rivercane.htm' },
      ],
    },
  ],
  ozarks_transicion_bosque_pradera: [
    {
      practica: 'Quema indígena otoñal de praderas de los Ozarks',
      periodo: 'Documentada por una observación colonial de 1750; continuidad no establecida por la fuente',
      tipo: 'fuego',
      vigencia: 'historica',
      detalle:
        'Una observación colonial de 1750 atribuyó a pueblos indígenas de la región la quema de praderas al final del otoño, cuando el pasto estaba seco. El parque explica que el fuego conserva claros, sabanas y especies adaptadas frente al avance de árboles, pero la cita histórica no identifica un pueblo concreto ni basta para definir intensidad, frecuencia o autorización actuales.',
      fuentes: [
        { label: 'National Park Service — Prescribed burns at Ozark National Scenic Riverways', url: 'https://www.nps.gov/ozar/learn/management/prescribedburns.htm' },
      ],
    },
  ],
  gulf_mississippi_piney_woods: [
    {
      practica: 'Campos elevados misisipianos con fertilización orgánica',
      periodo: 'Período misisipiano, hace entre 500 y 1.000 años',
      tipo: 'suelo',
      vigencia: 'historica',
      detalle:
        'Pueblos del período misisipiano construyeron montículos de suelo en campos de valles fluviales y los fertilizaron con pescado u otros materiales orgánicos. La asociación de maíz en el centro, frijol en los lados y calabaza como cobertura organizaba volumen de suelo, nutrientes y estratos vegetales, pero se presenta como evidencia histórica y no como continuidad tribal contemporánea.',
      fuentes: [
        { label: 'National Park Service — Mississippian Period: 500 to 1,000 years ago', url: 'https://www.nps.gov/articles/000/mississippian-period-500-to-1-000-years-ago.htm' },
      ],
    },
  ],
  sudeste_sabanas_pino_largo: [
    {
      practica: 'Quema indígena en sabanas de pino largo',
      periodo: 'Anterior al asentamiento no indígena; interrumpida durante los últimos tres siglos',
      tipo: 'fuego',
      vigencia: 'historica',
      detalle:
        'Pueblos indígenas del sudeste usaron fuego junto con los incendios por rayos para mantener el ecosistema abierto de pino largo, mejorar hábitat de caza y limitar combustibles. La sustitución posterior por agricultura y plantaciones de pino loblolly redujo ese paisaje; la evidencia explica una trayectoria ecológica, pero no identifica en esta fuente una comunidad contemporánea ni una pauta operativa de quema.',
      fuentes: [
        { label: 'Zhang, Majumdar y Schelhas (2010) — Changes in Woodland Use from Longleaf Pine to Loblolly Pine, Sustainability 2(9)', url: 'https://www.mdpi.com/2071-1050/2/9/2734' },
      ],
    },
  ],
  sur_templado_humedo_eeuu: [
    {
      practica: 'Quemas periódicas de pinares y sabanas de pino largo',
      periodo: 'Anterior al asentamiento europeo y continuada por pobladores coloniales',
      tipo: 'fuego',
      vigencia: 'historica',
      detalle:
        'La síntesis forestal del sudeste registra que el fuego se usó para manipular el ambiente y que los primeros colonos adoptaron quemas periódicas para mejorar el forraje y frenar el sotobosque. El régimen de superficie coincide con la adaptación del pino largo y mantiene una sabana abierta donde, sin fuego, avanzan leñosas densas.',
      fuentes: [
        { label: 'Oswalt y otros (2012) — History and Current Condition of Longleaf Pine in the Southern United States, USDA Forest Service GTR-SRS-166 (GovInfo)', url: 'https://www.govinfo.gov/content/pkg/GOVPUB-A13-PURL-gpo39900/pdf/GOVPUB-A13-PURL-gpo39900.pdf' },
      ],
    },
  ],
  everglades_manglares_sur_florida: [
    {
      practica: 'Huertos seminolas en islas altas del humedal',
      periodo: 'Entre 1842 y 1855, antes de la destrucción documentada del campamento',
      tipo: 'cultivo',
      vigencia: 'historica',
      detalle:
        'El jefe seminola Holata Micco, conocido también como Billie Bowlegs, y su familia mantuvieron frutales y huertos en tierras relativamente altas y fértiles dentro del paisaje húmedo. El caso muestra una implantación productiva ajustada a microrelieves secos, pero es un registro histórico interrumpido violentamente en 1855 y no evidencia continuidad de esa parcela ni una técnica general para los Everglades.',
      fuentes: [
        { label: 'National Park Service — Deep Lake', url: 'https://www.nps.gov/bicy/learn/historyculture/deep-lake.htm' },
      ],
    },
  ],

  // ── México ────────────────────────────────────────────────────────────────────
  baja_california_desiertos_y_sierras: [
    {
      practica: 'Oasis agroforestales de las misiones bajacalifornianas',
      periodo: 'Introducidos durante la fundación de dieciséis misiones entre 1697 y 1774; algunos oasis productivos perduran',
      tipo: 'agua',
      vigencia: 'en_uso',
      detalle:
        'La agricultura irrigada de estos oasis surgió con las misiones jesuitas, no como una práctica agrícola prehispánica: el estudio registra campos de cereales y legumbres, huertos, frutales y viñedos asociados al control del agua. Su interés de diseño está en concentrar diversidad productiva alrededor de surgencias escasas, pero debe conservarse el contexto colonial y no atribuirse el sistema introducido a los pueblos indígenas que ya usaban esos lugares de agua.',
      fuentes: [
        { label: 'Sociedad y Ambiente — La agricultura fundacional de los oasis de Baja California', url: 'https://revistas.ecosur.mx/sociedadyambiente/index.php/sya/article/download/2933/1978/6560' },
      ],
    },
  ],
  tehuacan_cuicatlan_matorral: [
    {
      practica: 'Manejo histórico del agua en Tehuacán-Cuicatlán',
      periodo: 'Desarrollado durante milenios dentro de una secuencia de adaptación humana de más de 12.000 años',
      tipo: 'agua',
      vigencia: 'historica',
      detalle:
        'El paisaje conserva canales, pozos, acueductos, represas y terrazas que documentan respuestas prolongadas a la escasez de agua y a la domesticación de plantas. La combinación de captación, conducción y nivelación ofrece principios de diseño para ambientes áridos, pero cada elemento pertenece a secuencias y sociedades distintas y no debe presentarse como un único sistema inmutable de 12.000 años.',
      fuentes: [
        { label: 'UNESCO World Heritage Centre — Tehuacán-Cuicatlán Valley', url: 'https://whc.unesco.org/en/list/1534/' },
      ],
    },
  ],
  oaxaca_sierras_bosques_comunales: [
    {
      practica: 'Manejo forestal comunitario zapoteco en Capulálpam',
      periodo: 'Desde 1981; cambio de método silvícola en 1993 y continuidad documentada',
      tipo: 'recoleccion',
      vigencia: 'en_uso',
      detalle:
        'La comunidad forestal zapoteca de Capulálpam de Méndez estableció manejo comunitario al terminar la concesión industrial y luego adoptó selección en grupos y árboles semilleros, acompañados por monitoreo permanente. La experiencia permite pensar mosaicos de corta, regeneración y seguimiento en bosques mixtos, pero sus reglas comunales, inventarios y decisiones no son sustituibles por un turno forestal genérico.',
      fuentes: [
        { label: 'Madera y Bosques — Manejo forestal en la Sierra Juárez de Oaxaca', url: 'https://www.scielo.org.mx/scielo.php?pid=S1405-04712019000300203&script=sci_arttext' },
      ],
    },
  ],
  selva_maya_yucatan: [
    {
      practica: 'Milpa maya peninsular Ich Kool',
      periodo: 'Desde hace más de 3.500 años; continúa en uso',
      tipo: 'cultivo',
      vigencia: 'en_uso',
      detalle:
        'Familias mayas de la península de Yucatán mantienen una policultura de maíz y especies asociadas dentro de un mosaico de cultivo, descanso y sucesión forestal. El sistema conserva semillas y distribuye riesgo frente a suelos kársticos someros y lluvias variables; cualquier adaptación debe preservar el ciclo territorial completo y la autoría maya, no copiar sólo la asociación de cultivos.',
      fuentes: [
        { label: 'FAO GIAHS — Ich Kool, Mayan Milpa System', url: 'https://www.fao.org/giahs/giahs-around-the-world/mexico-ich-kool-mayan-milpa-system/en' },
      ],
    },
  ],

  bosque_mesofilo_montana: [
    {
      practica: 'Cafetal diversificado bajo sombra',
      periodo: 'Desde fines del siglo XVIII en México; expansión regional durante los siglos XIX y XX',
      tipo: 'cultivo',
      vigencia: 'en_uso',
      detalle:
        'La documentación de CONABIO sitúa la introducción del café a fines del siglo XVIII y describe cafetales diversificados bajo sombra entreverados con bosque mesófilo. El dosel amortigua sol y lluvia, conserva humedad y mantiene continuidad arbórea en laderas; el contraste importante es con plantaciones a pleno sol, que eliminan esa función.',
      fuentes: [
        { label: 'CONABIO — Cien casos de éxito: Cafetales y biodiversidad', url: 'https://www.biodiversidad.gob.mx/pais/cien_casos/pdf/Cien%20casos.pdf' },
      ],
    },
  ],
  bosque_tropical_seco_mesoamericano: [
    {
      practica: 'Milpa maya peninsular como mosaico agroforestal',
      periodo: 'Más de 3.500 años hasta la actualidad',
      tipo: 'cultivo',
      vigencia: 'en_uso',
      detalle:
        'Agricultores mayas peninsulares asocian maíz, frijol, calabaza y otras especies, y alternan parcelas cultivadas con vegetación secundaria en recuperación. El barbecho forestal devuelve biomasa y nutrientes a suelos kársticos someros y pobres, mientras la diversidad de parcelas distribuye el riesgo frente a huracanes, incendios y variabilidad de lluvias.',
      fuentes: [
        { label: 'FAO GIAHS — Ich Kool: Mayan milpa of the Yucatan peninsula', url: 'https://www.fao.org/giahs/giahs-around-the-world/mexico-ich-kool-mayan-milpa-system/en' },
      ],
    },
  ],
  balsas_jalisco_bosques_secos: [
    {
      practica: 'Cultivo y transformación integral del agave',
      periodo: 'Al menos dos mil años; destilación de tequila desde el siglo XVI',
      tipo: 'cultivo',
      vigencia: 'en_uso',
      detalle:
        'En los valles y laderas del volcán de Tequila se cultiva agave, una perenne resistente a la sequía cuya piña se fermenta y cuyas fibras se destinaban a textiles. La cultura de Teuchitlán también construyó terrazas agrícolas entre 200 y 900 d. C.; el paisaje productivo continuó luego con bebidas fermentadas y, desde el siglo XVI, tequila destilado.',
      fuentes: [
        { label: 'UNESCO World Heritage Centre — Agave Landscape and Ancient Industrial Facilities of Tequila', url: 'https://whc.unesco.org/en/list/1209' },
      ],
    },
  ],
  manglares_mexico: [
    {
      practica: 'Corrales móviles de ramas de mangle para pesca estuarina',
      periodo: 'Documentada entre 1602 y 1605',
      tipo: 'recoleccion',
      vigencia: 'historica',
      detalle:
        'Pescadores nativos de Marismas Nacionales trenzaban ramas de mangle para formar corrales móviles que atravesaban los canales del estuario. El obispo Alonso de la Mota y Escobar los describió entre 1602 y 1605 junto con lo que sostenían: ostras, camarones, mojarras, lisas y pámpanos. Las capturas abundantes podían malograrse cuando quedaban atrapados tiburones grandes o cocodrilos, que rompían la estructura con la cola y liberaban el pescado.',
      fuentes: [
        { label: 'Rubio-Cisneros, Aburto-Oropeza, Jackson y Ezcurra (2017) — Coastal Exploitation Throughout Marismas Nacionales Wetlands in Northwest Mexico, Tropical Conservation Science 10', url: 'https://journals.sagepub.com/doi/10.1177/1940082917697261' },
      ],
    },
  ],
  sonora_sinaloa_bosque_seco_desierto: [
    {
      practica: 'Canales y riego de escorrentía en el desierto de Sonora',
      periodo: 'Agricultura regional desde hace unos 3.000 años; canales hohokam abandonados hacia el siglo XV',
      tipo: 'agua',
      vigencia: 'historica',
      detalle:
        'Los hohokam construyeron grandes redes de canales en valles fluviales como el Gila, mientras otros agricultores tempranos sembraban junto a los cauces para captar la escorrentía de la estación de lluvias: el riego que los tohono o’odham llaman Ak-Chin. Ambos sistemas concentraban agua breve y espacialmente dispersa para sostener cultivos en un ambiente desértico de lluvias variables.',
      fuentes: [
        { label: 'U.S. National Park Service — Sonoran Desert Network Ecosystems', url: 'https://www.nps.gov/im/sodn/ecosystems.htm' },
      ],
    },
  ],
  chiapas_bosques_montanos: [
    {
      practica: 'Milpa tzeltal articulada con el ch’ulel del maíz',
      periodo: 'Documentada mediante trabajo etnográfico entre marzo y julio de 2013; vigente al momento del estudio',
      tipo: 'cultivo',
      vigencia: 'en_uso',
      detalle:
        'En cuatro comunidades tzeltales de Tenejapa, la milpa y el maíz se documentan como práctica agrícola y como parte de una relación ritual con cerros, manantiales, semillas y cosechas. El estudio presenta al campesino u «hombre de cultivo» como cuidador y generador de abundancia, y registra la persistencia de esa integración entre práctica, reproducción de lo vivo y representación simbólica. La fuente sirve para mantener unida la dimensión productiva y cultural de la milpa, pero no ofrece una prescripción agronómica trasladable sin consulta comunitaria.',
      fuentes: [
        { label: 'D’Alessandro y González (2017) — La práctica de la milpa, el ch’ulel y el maíz como elementos articuladores de la cosmovisión sobre la naturaleza entre los tzeltales de Tenejapa, Estudios de Cultura Maya 50', url: 'https://www.scielo.org.mx/scielo.php?lng=es&nrm=iso&pid=S0185-25742017000200271&script=sci_arttext_plus&tlng=es' },
      ],
    },
  ],
  sierras_madre_pino_encino: [
    {
      practica: 'Recolección rarámuri de plantas del bosque según uso y conocimiento local',
      periodo: 'Trabajo de campo entre 2002 y 2004; vigente al momento del estudio',
      tipo: 'recoleccion',
      vigencia: 'en_uso',
      detalle:
        'En Cuiteco, Sierra Tarahumara, campesinos rarámuri participaron en recorridos, reuniones y entrevistas sobre plantas de bosque de pino, pino-encino, vegetación secundaria, ribera, barbechos, parcelas y huertos. El estudio registró una división de tareas: las mujeres reunían principalmente plantas medicinales y comestibles, y los hombres materiales para bienes domésticos, leña y construcción, sin diferencia general de conocimiento entre ambos. La ficha debe conservar esa autoría comunitaria y la diversidad interna; no reducir el saber rarámuri a una lista botánica indiferenciada.',
      fuentes: [
        { label: 'Camou-Guerrero, Reyes-García, Martínez-Ramos y Casas (2008) — Knowledge and Use Value of Plant Species in a Rarámuri Community: A Gender Perspective for Conservation, Human Ecology 36(2): 259-272 (copia íntegra reproducida en la tesis doctoral del primer autor, UNAM)', url: 'https://tesiunamdocumentos.dgb.unam.mx/ptd2008/octubre/0634436/0634436_A1.pdf' },
      ],
    },
  ],
  veracruz_tabasco_selvas_humedales: [
    {
      practica: 'Campos elevados con gestión hidráulica comunitaria',
      periodo: 'Período Clásico mesoamericano',
      tipo: 'agua',
      vigencia: 'historica',
      detalle:
        'La teledetección en la cuenca de Tlalixcoyan, Veracruz, identificó unas 15.000 hectáreas de campos elevados conectados con grupos de plazas cívico-ceremoniales. Por su escala, los autores proponen cooperación local y descentralizada para construir y mantener recursos hidráulicos y agrícolas comunes, más allá de una sola familia o linaje. Es una hipótesis sustentada en patrones lidar que aún requiere pruebas de campo para sus detalles organizativos.',
      fuentes: [
        { label: 'Stoner, Stark, VanDerwarker y Urquhart (2021) — Between land and water: Hydraulic engineering in the Tlalixcoyan basin, Veracruz, Mexico, Journal of Anthropological Archaeology 61: 101264 (resumen y conclusiones destacadas públicos; el texto completo es de pago)', url: 'https://www.sciencedirect.com/science/article/abs/pii/S0278416520302373' },
      ],
    },
  ],
  // ── Centroamérica ─────────────────────────────────────────────────────────────
  corredor_seco_centroamericano: [
    {
      practica: 'Sistema agroforestal Quesungual sin quema',
      periodo: 'Documentado en Quesungual en 1992; ampliamente adoptado entre 1995 y 1998 y vigente al cierre del informe',
      tipo: 'suelo',
      vigencia: 'en_uso',
      detalle:
        'Agricultores del sur de Lempira conservan y podan árboles dentro de parcelas de maíz, sorgo y frijol, acomodan el rastrojo pendiente abajo y preparan el terreno a mano sin quemarlo. El sistema reduce erosión y evaporación y mejora la infiltración y la humedad del suelo; debe adaptarse a la composición arbórea y a las reglas locales en lugar de reducirse a una lista fija de especies.',
      fuentes: [
        { label: 'FAO — The Quesungual slash and mulch agroforestry system', url: 'https://www.fao.org/4/Y5030E/y5030e19.htm' },
      ],
    },
  ],
  bosque_atlantico_mosquitia: [
    {
      practica: 'Cacao agroforestal con sombra diversa en Siuna',
      periodo: 'En uso; documentado en quince fincas en 2025',
      tipo: 'cultivo',
      vigencia: 'en_uso',
      detalle:
        'Productores de El Hormiguero, Siuna, manejan cacao con árboles frutales, maderables y leguminosos y ajustan progresivamente la sombra mediante conocimiento local. La combinación de varios estratos, injertos o clones y cobertura arbórea ofrece una referencia para amortiguar calor y lluvia, pero el registro corresponde a quince fincas y no autoriza extrapolar una identidad étnica ni una receta única a toda la Mosquitia.',
      fuentes: [
        { label: 'AGRIS — Estructura arbórea y conocimiento local sobre manejo de sombra en sistemas agroforestales con cacao', url: 'https://agris.fao.org/search/en/providers/125479/records/6995a389e6c33ba92ad64a94' },
      ],
    },
  ],
  selva_maya_peten_yucatan: [
    {
      practica: 'Concesiones forestales comunitarias de la Reserva de Biosfera Maya',
      periodo: 'Desde 1990; manejo comunitario vigente al momento de la publicación',
      tipo: 'recoleccion',
      vigencia: 'en_uso',
      detalle:
        'Colectivos comunitarios organizados junto con ACOFOP y CONAP manejan concesiones forestales en la Reserva de Biosfera Maya mediante patrullaje, monitoreo, prevención de incendios y aprovechamiento regulado. El modelo vincula medios de vida y conservación a escala de paisaje, pero es una institucionalidad contemporánea del Petén y no debe etiquetarse automáticamente como práctica maya ancestral.',
      fuentes: [
        { label: 'UNESCO — Reserva de Biosfera Maya, un referente latinoamericano', url: 'https://www.unesco.org/es/articles/reserva-de-biosfera-maya-un-referente-latinoamericano-un-ejemplo-al-mundo' },
      ],
    },
  ],
  talamanca_caribe_sur: [
    {
      practica: 'Cacao agroforestal bribri y cabécar',
      periodo: 'En uso y documentado en 305 fincas en 2003; manual comunitario publicado en 2015',
      tipo: 'cultivo',
      vigencia: 'en_uso',
      detalle:
        'Fincas bribri y cabécar de Talamanca combinan cacao y banano con árboles de sombra frutales, leguminosos y maderables en dos o tres estratos, además de bosque, huertos y protección de quebradas. La estructura ofrece cobertura y diversidad productiva, pero el diseño debe partir del conocimiento y de las decisiones familiares indígenas, no de una densidad de sombra trasladada mecánicamente.',
      fuentes: [
        { label: 'AGRIS — Diagnóstico agroforestal de fincas cacaoteras Bribri y Cabécar', url: 'https://agris.fao.org/search/en/providers/124212/records/69b95c8cce5e0ae4f87879a4' },
        { label: 'FAO Family Farming — Manual de Prácticas Ancestrales Bribri y Cabecar', url: 'https://www.fao.org/family-farming/detail/en/c/1755144/' },
      ],
    },
  ],
  darien_humedo_panama: [
    {
      practica: 'Agricultura Nainu de rotación y sucesión forestal',
      periodo: 'En uso al menos hacia 2000; la sucesión de parcela alcanza bosque secundario en veinte años o más',
      tipo: 'suelo',
      vigencia: 'en_uso',
      detalle:
        'El pueblo que la fuente denomina Kuna maneja en Narganá parcelas con árboles útiles, cereales, tubérculos y hortalizas, alternando cultivo y descanso hasta recuperar bosque secundario. La sucesión, la diversidad y el mantenimiento de cobertura en laderas distribuyen producción y restauración en el tiempo; trasladarla exige gobernanza Guna y suficiente superficie para completar el barbecho.',
      fuentes: [
        { label: 'FAO — Nainu agriculture in Panama', url: 'https://www.fao.org/fileadmin/templates/esw/esw_new/documents/SARD/good_practices_Latin_America/13_Nainu_agriculture_Panama1.pdf' },
      ],
    },
  ],
  costa_rica_bosques_humedos_estacionales: [
    {
      practica: 'Cultivo de granos con riego manual de sequía y almacenamiento',
      periodo: 'Período Sapoá-Ometepe, 800–1550 d. C.',
      tipo: 'agua',
      vigencia: 'historica',
      detalle:
        'La síntesis arqueológica del Museo Nacional para Cañas-Liberia registra maíz, frijol, calabaza, chile y árboles frutales, con preparación por tala y quema, azadas de madera, piedra o concha y riego manual de algunos campos durante las sequías. Tras la cosecha, el grano se guardaba en lugares especiales; los sitios se concentraban cerca de cursos con mejor caudal anual dentro de una zona de bosque tropical seco en transición a húmedo. El libro distingue la evidencia arqueológica de lo informado por cronistas y no permite atribuir cada operación exclusivamente a los chorotegas.',
      fuentes: [
        { label: 'Guerrero Miranda y Solís del Vecchio (1997) — Los pueblos antiguos de la zona Cañas-Liberia del año 300 al 1500 después de Cristo, Museo Nacional de Costa Rica', url: 'https://www.museocostarica.go.cr/wp-content/uploads/Publicaciones/arqueologia/Los-pueblos-antiguos-Canas-Liberia.pdf' },
      ],
    },
  ],
  manglares_centroamericanos: [
    {
      practica: 'Concentración de salmuera y cocción de sal en cocinas de manglar',
      periodo: 'Economía costera maya entre 600 a. C. y 1500 d. C.; salinas excavadas principalmente del Clásico',
      tipo: 'recoleccion',
      vigencia: 'historica',
      detalle:
        'En las salinas de Paynes Creek, sur de Belice, productores mayas vertían agua a través de sedimento salino para enriquecer la salmuera y reducir tiempo de hervor y consumo de leña. Después la hervían en vasijas sobre fuego dentro de cocinas de postes y techo vegetal; la turba de mangle rojo preservó los edificios hoy sumergidos. La evidencia sitúa esta producción doméstica excedentaria dentro de una economía costera de sal, recursos marinos, cultivos arbóreos e intercambio con ciudades del interior.',
      fuentes: [
        { label: 'McKillop (2024) — Flooded mangrove landscapes hide ancient Maya coastal sites in Belize, The Journal of Island and Coastal Archaeology 19(3): 484-504 (acceso abierto)', url: 'https://www.tandfonline.com/doi/full/10.1080/15564894.2022.2163323' },
      ],
    },
  ],

  // ── Caribe insular ────────────────────────────────────────────────────────────
  cuba_bosques_karst_y_pinares: [
    {
      practica: 'Cultivo tradicional de tabaco en el valle de Viñales',
      periodo: 'Desde comienzos del siglo XIX; técnicas tradicionales todavía en uso al momento de la inscripción',
      tipo: 'cultivo',
      vigencia: 'en_uso',
      detalle:
        'Pequeños productores del valle de Viñales mantienen métodos tradicionales para el tabaco y emplean tracción animal porque la mecanización puede reducir su calidad. En un paisaje kárstico de suelos cultivables discontinuos, la lección de diseño es ajustar escala, acceso y labores a los fondos de valle sin presentar una economía colonial del tabaco como saber indígena.',
      fuentes: [
        { label: 'UNESCO World Heritage Centre — Viñales Valley', url: 'https://whc.unesco.org/en/list/840/' },
      ],
    },
  ],
  antillas_menores_bosques_humedos_secos: [
    {
      practica: 'Agroforestería multiestrato tradicional de Dominica',
      periodo: 'Durante siglos; todavía en uso cuando fue documentada en 1991',
      tipo: 'cultivo',
      vigencia: 'en_uso',
      detalle:
        'Pequeños agricultores y fincas de Dominica combinaron cocoteros o cítricos en el estrato alto, banano, café o cacao en niveles intermedios y raíces cerca del suelo. La disposición aprovecha verticalmente parcelas húmedas y escarpadas y mantiene cobertura permanente; la fuente de 1991 registra continuidad en el territorio entonces denominado Carib Territory y en otros sitios, pero no demuestra por sí sola su extensión actual.',
      fuentes: [
        { label: 'FAO — Agroforestry systems in Dominica', url: 'https://www.fao.org/4/x5656e/x5656e05.htm' },
      ],
    },
  ],
  bahamas_pinares_manglares: [
    {
      practica: 'Quema del paisaje para agricultura y aprovechamiento de madera',
      periodo: 'Desde aproximadamente 830 d. C.; transformación forestal marcada hacia 970–1200 d. C.',
      tipo: 'fuego',
      vigencia: 'historica',
      detalle:
        'Los lucayos aumentaron las quemas en Gran Ábaco para abrir espacios agrícolas y obtener madera, con yuca como cultivo principal documentado. La perturbación redujo palmas y latifoliadas y favoreció la expansión de pinares pirógenos, mostrando cómo el manejo del fuego resolvía el desmonte pero alteraba la resiliencia del bosque insular.',
      fuentes: [
        { label: 'Fall, van Hengstum, Lavold-Foote, Donnelly y otros (2021) — Human arrival and landscape dynamics in the northern Bahamas, PNAS 118(10) (copia abierta en PubMed Central)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7958357/' },
      ],
    },
  ],
  hispaniola_bosque_humedo: [
    {
      practica: 'Conucos elevados para raíces y policultivos taínos',
      periodo: 'Tradición ostionoide desde aproximadamente 600 d. C.; intensificación taína después de 1100 d. C.',
      tipo: 'suelo',
      vigencia: 'historica',
      detalle:
        'Poblaciones ostionoides y luego taínas de La Española practicaban cultivo intensivo de raíces en conucos, montículos o parcelas elevadas pequeñas. La yuca era el cultivo principal, y también se sembraban papas, porotos, maní y ajíes; la agricultura se complementaba con la pesca y los mariscos abundantes de la región.',
      fuentes: [
        { label: 'Florida Museum of Natural History — Taíno Culture History', url: 'https://www.floridamuseum.ufl.edu/histarch/research/haiti/en-bas-saline/taino-culture/' },
        { label: 'Florida Museum of Natural History — Taíno Society', url: 'https://www.floridamuseum.ufl.edu/histarch/research/haiti/en-bas-saline/taino-society/' },
      ],
    },
  ],
  jamaica_bosque_humedo_karstico: [
    {
      practica: 'Uso multifuncional del bosque kárstico por comunidades cimarronas',
      periodo: 'Desde el período cimarrón anterior al tratado de 1739, con continuidad actual',
      tipo: 'recoleccion',
      vigencia: 'en_uso',
      detalle:
        'Los cimarrones de Sotavento utilizaron el Cockpit Country como fuente de alimentos, refugio, agua y medicina, además de aprovechar cuevas, sumideros y senderos para sostener comunidades autónomas. La lectura fina del karst permitió localizar recursos y desplazarse por un relieve difícil, y la relación medicinal, espiritual y de subsistencia con el bosque continúa en su cultura.',
      fuentes: [
        { label: 'UNESCO World Heritage Centre — Cockpit Country Protected Area', url: 'https://whc.unesco.org/en/tentativelists/6822' },
      ],
    },
  ],
  jamaica_bosque_seco: [
    {
      practica: 'Agroforestería y quema para cultivar yuca en White Marl',
      periodo: 'Aproximadamente 1050–450 años calibrados antes del presente',
      tipo: 'fuego',
      vigencia: 'historica',
      detalle:
        'La comunidad precolonial de White Marl manejó la vegetación mediante agroforestería y fuego, con fitolitos de yuca presentes durante toda la ocupación. Las quemas abrieron áreas de cultivo y condujeron una transición desde vegetación arbórea hacia palmares y, más tarde, un paisaje más abierto, sin que el cambio se explique por el paleoclima.',
      fuentes: [
        { label: 'Elliott, Maezumi, Robinson, Burn, Gosling, Mickleburgh, Walters y Beier (2022) — The legacy of 1300 years of land use in Jamaica, Journal of Island and Coastal Archaeology (copia abierta en el repositorio de Liverpool John Moores University)', url: 'https://researchonline.ljmu.ac.uk/id/eprint/18124/' },
      ],
    },
  ],
  manglares_antillanos: [
    {
      practica: 'Cultivo, cosecha y procesamiento de plantas alimentarias junto al manglar',
      periodo: 'Edad Cerámica tardía, entre 1290 y 780 años calibrados antes del presente',
      tipo: 'cultivo',
      vigencia: 'historica',
      detalle:
        'En Anse Trabaud, Martinica, los depósitos enterrados bajo sedimentos de manglar conservaron plantas alimentarias cultivadas y cosechadas en el sitio, luego procesadas y consumidas por una comunidad indígena. La secuencia también muestra que el asentamiento se desplazó tierra adentro frente a la erosión costera y los cambios de la barrera litoral. Es un caso localizado de producción alimentaria y reorganización del asentamiento en un borde lagunar vulnerable, no una práctica demostrada para todas las Antillas.',
      fuentes: [
        { label: 'Hofman y otros (2023) — Mangrove Archives: Unravelling Human-environment Interactions from Deeply Buried Deposits at the Site Anse Trabaud, Martinique, Lesser Antilles (1290-780 cal BP), Environmental Archaeology 28(3) (acceso abierto)', url: 'https://www.tandfonline.com/doi/full/10.1080/14614103.2021.1921676' },
      ],
    },
  ],
  trinidad_tobago_bosques: [
    {
      practica: 'Cultivo de cacao criollo y trinitario en fincas y plantaciones',
      periodo: 'Desde 1525; comercio desde comienzos del siglo XVIII; transición hacia pequeños productores después de 1807',
      tipo: 'cultivo',
      vigencia: 'en_retroceso',
      detalle:
        'La historia sectorial de Trinidad registra la primera plantación española de cacao criollo en 1525, introducciones comerciales desde Venezuela alrededor de 1678 y la posterior formación del híbrido trinitario con forastero. También documenta el origen colonial y esclavista de la expansión, seguido por una clase de pequeños productores tras la abolición del tráfico esclavista. Es una práctica histórica insular todavía presente pero en retroceso; la fuente no autoriza a presentarla como saber indígena ni a omitir su régimen laboral.',
      fuentes: [
        { label: 'Bekele (2004) — The History of Cocoa Production in Trinidad and Tobago, Cocoa Research Unit, University of the West Indies', url: 'https://sta.uwi.edu/cru/sites/default/files/cru/HistoryCocoaProductionTT.pdf' },
      ],
    },
  ],

  // ── Mesopotamia y desierto sirio-arabigo ──────────────────────────────────────
  mesopotamia_marismas: [
    {
      practica: 'Cría de búfalos y aprovechamiento de juncos en humedal',
      periodo: 'Durante miles de años; interrumpida por el drenaje de fines del siglo XX y retomada parcialmente desde 2003',
      tipo: 'ganaderia',
      vigencia: 'en_retroceso',
      detalle:
        'La misión de UNESCO documenta que las comunidades árabes de las marismas sostuvieron durante milenios la cría de búfalos, la pesca y la construcción con juncos, antes del drenaje forzado. El sistema depende de conservar agua somera y vegetación palustre: los juncos aportan forraje y material constructivo, mientras los búfalos aprovechan un ambiente que no admite agricultura convencional. La fuente señala que la cría de búfalos y las casas de juncos continúan, aunque con menor población y materiales nuevos.',
      fuentes: [
        { label: 'UNESCO World Heritage Centre (2025) — Reactive Monitoring Mission to the Ahwar of Southern Iraq', url: 'https://whc.unesco.org/document/223567' },
      ],
    },
  ],
  desierto_norarabigo: [
    {
      practica: 'Comederos de caza colectiva mediante cometas del desierto',
      periodo: 'Desde hace al menos 9.000 años en Jordania y el norte de Arabia',
      tipo: 'recoleccion',
      vigencia: 'historica',
      detalle:
        'El registro arqueológico documenta largas alineaciones de piedra que conducían animales silvestres hacia recintos rodeados de fosas. La disposición usa la topografía y el movimiento del rebaño para concentrar un recurso disperso en el desierto; muestra que la ubicación de cercos, embudos y puntos de captura se diseñaba a escala de paisaje. Es evidencia histórica de caza colectiva, no una práctica aplicable hoy sobre fauna silvestre.',
      fuentes: [
        { label: 'Crassard et al. (2023) — The oldest plans to scale of humanmade mega-structures, PLOS ONE', url: 'https://journals.plos.org/plosone/doi?id=10.1371/journal.pone.0277927' },
      ],
    },
  ],
  harrat_basalto: [
    {
      practica: 'Diques de gravedad para captar crecidas de uadi',
      periodo: 'Desde los primeros siglos de nuestra era; algunos diques de Khaybar podrían ser preislámicos',
      tipo: 'agua',
      vigencia: 'historica',
      detalle:
        'Los diques históricos de Khaybar y Medina cerraban pasos estrechos de los uadis para retener lluvias torrenciales y alimentar canales hacia campos próximos. La obra combina captación, laminación de la crecida y distribución posterior: reduce daño aguas abajo y convierte pulsos breves en una reserva agrícola. UNESCO advierte que varias cronologías siguen en debate, por eso el período conserva esa incertidumbre.',
      fuentes: [
        { label: 'UNESCO World Heritage Centre — Water Management in Saudi Arabia: The Ancient Dams', url: 'https://whc.unesco.org/en/tentativelists/6637' },
      ],
    },
  ],
  estepa_siria_badia: [
    {
      practica: 'Trashumancia estacional con reserva de pastura hema',
      periodo: 'Desde tiempos antiguos hasta la Segunda Guerra Mundial; en retroceso acelerado desde 1958',
      tipo: 'ganaderia',
      vigencia: 'en_retroceso',
      detalle:
        'La FAO describe a las comunidades pastoriles beduinas de la Badia siria moviendo los rebaños con las lluvias y manteniendo derechos de pastoreo sobre ciertos recursos como hema, pastura reservada para la sequía o la emergencia. Entraban a la estepa con las lluvias de otoño y salían al agotarse el agua superficial a fines de primavera, de modo que la pastura descansaba buena parte del año y el número de animales quedaba limitado a lo que el período de escasez podía sostener; en verano pastaban los rastrojos y las pajas de los campos agrícolas. Después de la Segunda Guerra Mundial el transporte motorizado, la nacionalización de la tierra de pastoreo —que quedó de acceso abierto y sin supervisión— y la introducción del alimento concentrado en 1958 rompieron esos límites.',
      fuentes: [
        { label: 'FAO (2005) — Grasslands of the World, The Near East: Syrian Arab Republic', url: 'https://www.fao.org/4/y8344e/y8344e0i.htm' },
      ],
    },
  ],
  mesopotamia_jazira: [
    {
      practica: 'Cereal de secano fertilizado por pastoreo y residuos domésticos',
      periodo: 'Más de 8.000 años; intensificación documentada en la Edad del Bronce temprana',
      tipo: 'suelo',
      vigencia: 'historica',
      detalle:
        'El estudio geoarqueológico de la Jazira —la franja semiárida del creciente fértil entre el Tigris y el Éufrates— registra más de ocho milenios de asentamiento y cultivo sobre el suelo típico, el Xerosol cálcico, que produce cereal en la mayoría de los años regado sólo por la lluvia. El análisis de fosfatos del suelo y el muestreo extensivo de tiestos mostraron que el suelo de arada se enriqueció con desechos animales y de los asentamientos, posiblemente por el pastoreo y el abonado en la antigüedad. En la Edad del Bronce temprana el uso del suelo se intensificó y cada asentamiento aparece rodeado de un halo de dispersión cerámica, que corresponde a los momentos de máxima población. El artículo es de acceso pago: esta entrada se apoya en su resumen público.',
      fuentes: [
        { label: 'Wilkinson, T. J. (1990) — Soil development and early land use in the Jazira region, Upper Mesopotamia, World Archaeology 22(1): 87-103 (resumen público; el texto completo es de pago)', url: 'https://www.tandfonline.com/doi/abs/10.1080/00438243.1990.9980131' },
      ],
    },
  ],

  // ── Peninsula arabiga ─────────────────────────────────────────────────────────
  nefud_rub_al_khali: [
    {
      practica: 'Oasis datilero en tres estratos con riego falaj',
      periodo: 'Desarrollado durante milenios; vigente con apoyo creciente de bombeo',
      tipo: 'cultivo',
      vigencia: 'en_uso',
      detalle:
        'La FAO documenta en Liwa un dosel de palmeras, frutales intermedios y cultivos anuales, abastecido por canales falaj que conducen agua por gravedad. Los tres estratos moderan viento, temperatura y humedad relativa, permitiendo producción en el borde del Rub al-Jali. La fuente aclara que el flujo natural ya no alcanza y hoy se complementa con agua bombeada.',
      fuentes: [
        { label: 'FAO GIAHS — Al Ain and Liwa Historical Date Palm Oases, United Arab Emirates', url: 'https://www.fao.org/giahs/giahs-around-the-world/united-arab-emirates-al-ain-liwa-date-palm-oases/en' },
      ],
    },
  ],
  asir_altiplano_seco: [
    {
      practica: 'Hima: descanso rotativo de pasturas y montes',
      periodo: 'Durante más de 1.400 años; aún persiste en decenas de reservas',
      tipo: 'ganaderia',
      vigencia: 'en_uso',
      detalle:
        'El sistema hima separa cíclicamente áreas de pastoreo, bosque o floración para que la vegetación se regenere antes de volver a usarse. En Asir, cada aldea gobernaba una o más reservas mediante normas consuetudinarias, ajustando acceso, estación y tipo de aprovechamiento. Para el diseño predial, el principio transferible es dejar descansos espacialmente explícitos y ligados al ciclo de semillazón, no abrir toda la superficie a la vez.',
      fuentes: [
        { label: 'UNESCO World Heritage Centre — The Rural Cultural Landscapes of Sarawat Mountains', url: 'https://whc.unesco.org/en/tentativelists/6640/' },
      ],
    },
  ],
  arabia_sur_bosque_niebla: [
    {
      practica: 'Sangrado tradicional del árbol de incienso',
      periodo: 'Desde la Antigüedad; documentado en el comercio al menos desde fines del siglo I a.C. y vigente',
      tipo: 'recoleccion',
      vigencia: 'en_uso',
      detalle:
        'En los uadis de Dofar se recolecta resina de Boswellia sacra mediante incisiones repetidas, conservando árboles vivos en un ambiente extremadamente seco. El puerto de Khor Rori fue establecido a fines del siglo I a.C. dentro del comercio regional del incienso, y Wadi Dawkah conserva la producción en su contexto natural. La ubicación del arbolado en uadis y el cuidado del individuo productor son más importantes que maximizar densidad o desmontar el sotobosque.',
      fuentes: [
        { label: 'UNESCO World Heritage Centre — Land of Frankincense', url: 'https://whc.unesco.org/en/list/1010' },
      ],
    },
  ],
  arabia_este_niebla: [
    {
      practica: 'Cosecha de resina de incienso en wadis de Dhofar',
      periodo: 'Producción y comercio desde la Antigüedad; cosecha vigente',
      tipo: 'recoleccion',
      vigencia: 'en_uso',
      detalle:
        'En Wadi Dawkah, Omán, la resina de Boswellia sacra se produjo, recolectó y comerció dentro de una red que vinculaba los wadis del interior costero con oasis y puertos de Dhofar. Los árboles crecen en el lecho aluvial de un wadi que drena estacionalmente hacia Rub al-Jali bajo calor extremo, y la cosecha continúa. UNESCO documenta la continuidad territorial y comercial, pero no identifica por nombre a quienes realizan hoy la extracción ni describe el corte de sangrado.',
      fuentes: [
        { label: 'UNESCO World Heritage Centre — Land of Frankincense', url: 'https://whc.unesco.org/en/list/1010' },
      ],
    },
  ],
  desierto_arabigo: [
    {
      practica: 'Hema: reserva consuetudinaria de pastos y agua',
      periodo: 'Desde tiempos preislámicos; transformación profunda bajo sistemas estatales modernos',
      tipo: 'ganaderia',
      vigencia: 'en_retroceso',
      detalle:
        'El hema es un concepto de propiedad comunal conocido en la cultura árabe y legitimado por el conjunto del derecho islámico. Su origen histórico es desconocido, pero los pastores nómadas de la península Arábiga ya lo practicaban en tiempos preislámicos: la tierra reservada quedaba protegida por la ʻasabiyah —la solidaridad del grupo—, los pastores de otras tribus necesitaban permiso del majlis, el consejo tribal, y el ʻurf, el derecho consuetudinario, regulaba los derechos de usufructo y las sanciones. La fuente es un estudio de la FAO sobre los beduinos de la República Árabe Siria y su tesis central es una advertencia: los documentos de proyecto reinventaron el nombre hema para justificar instituciones nuevas, así que no debe suponerse continuidad automática entre la institución histórica y cualquier cooperativa moderna.',
      fuentes: [
        { label: 'Triulzi (2002) — Empty and populated landscapes: the Bedouin of the Syrian Arab Republic between development and State, FAO Land Reform 2002/2', url: 'https://www.fao.org/4/y2519t/y2519t04.htm' },
      ],
    },
  ],
  golfo_llanura_costera: [
    {
      practica: 'Oasis datilero irrigado con manantiales, pozos y canales abiertos',
      periodo: 'Del Neolítico al presente',
      tipo: 'agua',
      vigencia: 'en_uso',
      detalle:
        'Al-Ahsa organiza jardines y palmerales mediante manantiales, pozos, canales abiertos y un lago de drenaje sobre una capa freática somera. UNESCO describe una tradición agrícola continua cuya distribución de agua estructura el oasis y que aún mantiene cultivos junto a 2,5 millones de palmeras datileras. La continuidad no implica que todas las obras actuales sean neolíticas: el paisaje evolucionó y la distribución de agua cambió en las últimas décadas.',
      fuentes: [
        { label: 'UNESCO World Heritage Centre — Al-Ahsa Oasis, an Evolving Cultural Landscape', url: 'https://whc.unesco.org/en/list/1563' },
      ],
    },
  ],

  // ── Yemen ─────────────────────────────────────────────────────────────────────
  tihama_costa_arida: [
    {
      practica: 'Riego por avenida con diques y acequias masqua',
      periodo: 'Practicado durante miles de años; vigente',
      tipo: 'agua',
      vigencia: 'en_uso',
      detalle:
        'La documentación de FAO describe el desvío de avenidas estacionales desde los uadis mediante pequeños diques de tierra o piedra hacia acequias tradicionales llamadas masqua. En la Tihama, el sistema reparte sobre terrazas una crecida que de otro modo sería destructiva y permite sembrar sorgo, mijo y maíz sin depender de lluvia local regular. También recarga acuíferos someros y llena abrevaderos.',
      fuentes: [
        { label: 'FAO — Being the Change in Yemen: Improving Integrated Water Resources Management for Food Security', url: 'https://www.fao.org/countryprofiles/news-archive/detail-news/en/c/1634924/' },
      ],
    },
  ],
  yemen_montana_aterrazada: [
    {
      practica: 'Terrazas de piedra para cosechar lluvia en laderas',
      periodo: 'Desde al menos el tercer milenio a.C.; todavía en uso',
      tipo: 'suelo',
      vigencia: 'en_uso',
      detalle:
        'Las terrazas convierten pendientes abruptas en superficies cultivables y frenan la escorrentía para que el agua infiltre en el perfil. Los muros retienen suelo fértil, reducen erosión y distribuyen lluvias estacionales en una montaña semiárida con muy poca tierra llana. UNESCO documenta continuidad funcional y reparación comunitaria de muros después de crecidas.',
      fuentes: [
        { label: 'UNESCO World Heritage Centre — Agricultural Terraces in Yemen', url: 'https://whc.unesco.org/en/tentativelists/6875/' },
      ],
    },
  ],
  hadramaut_meseta: [
    {
      practica: 'Riego de campos con crecidas estacionales de uadi',
      periodo: 'Practicado durante miles de años en Yemen; aún vigente en Hadramaut, aunque en retroceso frente al bombeo',
      tipo: 'agua',
      vigencia: 'en_retroceso',
      detalle:
        'El riego por avenida desvía pulsos de crecida hacia parcelas escalonadas y deja que el sedimento y el agua se distribuyan antes de pasar al nivel siguiente. En Hadramaut, esta lógica permite una campaña después de lluvias lejanas aun donde no hay curso permanente; la expansión de pozos motorizados redujo su uso. Su diseño exige aliviaderos y rutas de excedente, porque la misma crecida que riega puede erosionar.',
      fuentes: [
        { label: 'FAO — Being the Change in Yemen: Improving Integrated Water Resources Management for Food Security', url: 'https://www.fao.org/countryprofiles/news-archive/detail-news/en/c/1634924/' },
      ],
    },
  ],
  socotra: [
    {
      practica: 'Yaharuf: traslado estacional a los huertos de dátiles',
      periodo: 'Práctica del período del Sultanato todavía vigente en 2014, aunque menos extendida',
      tipo: 'recoleccion',
      vigencia: 'en_retroceso',
      detalle:
        'En Socotra, pescadores de la costa y pastores del interior se trasladaban a los huertos de dátiles en junio y julio, antes del monzón del sudoeste, para convertirse temporalmente en cosechadores. Ese movimiento, llamado yaharuf, podía hacerse por relevos de pocos días o mantener a las familias en el huerto durante toda la cosecha; históricamente amortiguaba el hambre estacional. La práctica seguía viva durante el estudio, pero con menor alcance que durante el Sultanato, por lo que no se presenta como trashumancia ganadera ni como continuidad intacta.',
      fuentes: [
        { label: 'Elie (2014) — Pastoralism in Soqotra: external entanglements and communal mutations, Pastoralism 4', url: 'https://link.springer.com/article/10.1186/s13570-014-0016-3' },
      ],
    },
  ],

  // ── Iran y Sistan ─────────────────────────────────────────────────────────────
  kuh_rud_montano: [
    {
      practica: 'Qanat y azafrán de bajo consumo hídrico',
      periodo: 'Qanats con más de 2.500 años de suministro; sistema de azafrán vigente',
      tipo: 'agua',
      vigencia: 'en_uso',
      detalle:
        'En Gonabad, túneles subterráneos interceptan el acuífero y conducen agua por gravedad hasta parcelas de azafrán, un cultivo de alto valor y baja demanda hídrica. Llevar el agua bajo tierra reduce evaporación y evita extraer desde el fondo del acuífero; la distribución comunitaria organiza turnos y mantenimiento. La combinación responde a aridez extrema sin suponer que el acuífero es ilimitado.',
      fuentes: [
        { label: 'FAO GIAHS — Qanat-based Saffron Farming System in Gonabad, Iran', url: 'https://www.fao.org/giahs/giahs-around-the-world/iran-qanat-based-saffron-system/en' },
      ],
    },
  ],
  elburz_estepa_forestal: [
    {
      practica: 'Jardines de inundación del Bāghestān',
      periodo: 'Desde hace miles de años; vigente',
      tipo: 'agua',
      vigencia: 'en_uso',
      detalle:
        'Al pie del Elburz, el Bāghestān de Qazvin remodela la cuenca con diques y parcelas para extender crecidas estacionales sobre huertos de pistacho, almendro, vid y albaricoque. El agua queda retenida e infiltra lentamente; dos inundaciones anuales sostienen los árboles durante el verano y a la vez protegen la ciudad aguas abajo. El mantenimiento se concentra en diques, poda, injerto y limpieza, no en riego continuo.',
      fuentes: [
        { label: 'FAO GIAHS — Ancient Traditional Gardens of Qazvin Bāghestān, Iran', url: 'https://www.fao.org/giahs/giahs-around-the-world/iran-qazvin-ancient-gardens/en' },
      ],
    },
  ],
  sistan_registan: [
    {
      practica: 'Molino vertical asbad movido por los vientos de 120 días',
      periodo: 'De origen medieval o anterior en Sistán; difundido fuera de Irán hacia el siglo XII',
      tipo: 'cultivo',
      vigencia: 'historica',
      detalle:
        'Los asbad orientan aberturas al viento estacional fuerte para mover un eje vertical y moler cereal sin agua ni combustible. En Sistán, la tecnología convierte una limitante —viento persistente y escasez hídrica— en energía de procesamiento próxima al cultivo. La ubicación y orientación del edificio forman parte del sistema tanto como la maquinaria.',
      fuentes: [
        { label: 'UNESCO World Heritage Centre — Asbads (windmill) of Iran', url: 'https://whc.unesco.org/en/tentativelists/6192' },
      ],
    },
  ],
  badghyz_pistacho: [
    {
      practica: 'Implantación rala de pistacho en hoyos para restaurar laderas áridas',
      periodo: 'Ensayos desde 1930; siembra corregida desde 1931 y continuidad posterior',
      tipo: 'cultivo',
      vigencia: 'en_uso',
      detalle:
        'El programa forestal de Badghyz ensayó pistachos en hoyos en 1930, corrigió la técnica al año siguiente y llegó a formar casi cinco mil hectáreas de arbolado implantado hacia 1985. La experiencia abandonó las densidades altas: con el espaciamiento semejante al natural los árboles fructificaban a los 15–16 años, frente a 25–30 años en plantaciones densas. Es una práctica técnica contemporánea de restauración y producción —no un saber ancestral atribuido a un pueblo— para una especie resistente a sequía, plagas y enfermedades en laderas áridas.',
      fuentes: [
        { label: 'State News Agency of Turkmenistan (2018) — Badkhyz hills is the area of distribution of natural pistachios', url: 'https://turkmenistan.gov.tm/index.php/en/post/10005/badkhyz-hills-is-the-area-of-distribution-of-natural-pistachios' },
      ],
    },
  ],
  hircania_caspio: [
    {
      practica: 'Pastoreo de altura en las montañas Talesh',
      periodo: 'Desde hace aproximadamente 6.500 años',
      tipo: 'ganaderia',
      vigencia: 'historica',
      detalle:
        'Un testigo de sedimento del lago Neor conservó una secuencia de 6.500 años rica en polen y en restos de escarabajos, con una proporción alta de especies coprófagas y coprófilas a lo largo de todo el testigo. El polen dibuja una estepa abierta típica de las tierras altas irano-turanias, con el bosque hircano templado y húmedo hacia el este: lo que la fuente documenta está al lado del bosque y no adentro. Insectos, polen y la evidencia arqueológica del noroeste iraní coinciden en que hubo pastoreo en las alturas de Talesh desde hace al menos 6.500 años. El título plantea la trashumancia como pregunta y no como hecho probado, y por eso la ficha conserva «pastoreo de altura» y no inventa una ruta estacional.',
      fuentes: [
        { label: 'Ponel y otros (2013) — Fossil beetles as possible evidence for transhumance during the middle and late Holocene in the high mountains of Talysch (Talesh) in NW Iran?, Environmental Archaeology 18(3): 201-210 (resumen público; el texto completo es de pago)', url: 'https://doi.org/10.1179/1749631413Y.0000000007' },
      ],
    },
  ],
  iran_sur_nubo_sindico: [
    {
      practica: 'Palmeras datileras en hoyos profundos para aprovechar lluvia invernal',
      periodo: 'Documentada en el siglo XII',
      tipo: 'agua',
      vigencia: 'historica',
      detalle:
        'Ebn al-Balji registró en los distritos costeros de Korān e Īrāhestān, Fars, palmeras datileras plantadas en hoyos tan profundos que sólo sobresalían las copas adultas. La fuente explica que el objetivo era aprovechar al máximo la lluvia invernal limitada. Es una solución histórica localizada del litoral sur iraní; no prueba que el sistema siga en uso ni que sea apropiado donde la salinidad o el nivel freático difieran.',
      fuentes: [
        { label: 'Alam (1994; actualización 2016) — DATE PALM, Encyclopaedia Iranica VII(2)', url: 'https://www.iranicaonline.org/articles/date-palm/' },
      ],
    },
  ],
  kopet_dag: [
    {
      practica: 'Riego por gravedad y cuencas combinado con cereal resistente y rebaños',
      periodo: 'Desde el V milenio a. C.',
      tipo: 'agua',
      vigencia: 'historica',
      detalle:
        'En el piedemonte del Kopet Dag, pequeños caudales montanos relativamente estables sostuvieron mijo, cebada, trigo y frijol mungo tolerantes a la sequía, combinados con ovejas y cabras. El agua se manejó con flujo gravitacional, cuencas y captación en cuencas, una configuración agropastoril documentada desde el V milenio a. C. La fuente compara oasis de Asia interior y no identifica un único pueblo autor de toda la secuencia.',
      fuentes: [
        { label: 'Brite (2016) — Irrigation in the Khorezm oasis, past and present: a political ecology perspective, Journal of Political Ecology 23: 1-25 (acceso abierto, CC BY)', url: 'https://doi.org/10.2458/v23i1.20177' },
      ],
    },
  ],

  // ── Magreb y Atlas ────────────────────────────────────────────────────────────
  magreb_bosque_mediterraneo: [
    {
      practica: 'Sistema agro-silvo-pastoral del argán en terrazas secas',
      periodo: 'Durante siglos; vigente',
      tipo: 'cultivo',
      vigencia: 'en_uso',
      detalle:
        'En Ait Souab-Ait Mansour, el argán se integra con cultivos anuales y perennes, pastoreo y terrazas de piedra seca. Los muros crean suelo cultivable, retienen agua y reducen erosión; depósitos subterráneos matifyia guardan lluvia para atravesar períodos secos. La diversidad de estratos reparte producción entre aceite, forraje, cereal, carne y leña en suelos pobres.',
      fuentes: [
        { label: 'FAO GIAHS — Argan-based agro-sylvo-pastoral system within Ait Souab-Ait Mansour, Morocco', url: 'https://www.fao.org/giahs/giahs-around-the-world/morocco-argan-based-system/en' },
      ],
    },
  ],
  magreb_estepa_alfa: [
    {
      practica: 'Derechos consuetudinarios para rotar pastoreo en estepa',
      periodo: 'Desarrollado a lo largo de siglos; vigente',
      tipo: 'ganaderia',
      vigencia: 'en_uso',
      detalle:
        'En AbbouLakhal y Figuig, el uso de pastizales se organiza mediante territorios pastorales reconocidos y consenso tribal, complementando el oasis cultivado. Los rebaños aprovechan grandes estepas extensivas sin convertirlas en parcelas permanentes, mientras las reglas de acceso reducen sobreuso y conflicto. El sistema funciona porque la movilidad y el derecho de uso se diseñan juntos, no como decisiones separadas.',
      fuentes: [
        { label: 'FAO GIAHS — The ksour of Figuig: oasis and pastoral culture around social management of water and land', url: 'https://www.fao.org/giahs/giahs-around-the-world/morocco-ksour-figuig-oasis/en' },
      ],
    },
  ],
  atlas_conifera_montana: [
    {
      practica: 'Oasis frío con rotación, agroforestería y ganadería integrada',
      periodo: 'Durante siglos; vigente',
      tipo: 'cultivo',
      vigencia: 'en_uso',
      detalle:
        'En Imilchil-Amellago, pequeñas parcelas fértiles junto al río combinan cereal, hortalizas y frutales con pasturas montanas. La rotación y la agroforestería reparten riesgo climático, mientras el estiércol conecta el rebaño con la fertilidad de los cultivos. El mosaico concentra la agricultura donde hay agua y conserva el resto como pastizal de uso estacional.',
      fuentes: [
        { label: 'FAO GIAHS — Oases System in Atlas Mountains, Morocco', url: 'https://www.fao.org/giahs/giahs-around-the-world/morocco-cold-oases-system/en' },
      ],
    },
  ],
  alto_atlas_enebro: [
    {
      practica: 'Agdal: cierre estacional de pasturas de altura',
      periodo: 'Práctica tradicional de larga duración; vigente',
      tipo: 'ganaderia',
      vigencia: 'en_uso',
      detalle:
        'El agdal de Imilchil-Amellago cierra sectores de pastura durante el crecimiento y la semillazón, y los reabre cuando la vegetación puede soportar el ganado. La presentación técnica de FAO documenta cierres de marzo a junio y apertura posterior para vacunos y caballos. El criterio de diseño es reservar superficie y calendario antes de que falte forraje, manteniendo zonas de descanso reconocibles para toda la comunidad.',
      fuentes: [
        { label: 'FAO GIAHS — Oases System in Atlas Mountains of Morocco (technical presentation)', url: 'https://www.fao.org/fileadmin/templates/giahs/Presentations/beijing/Seddik_Saidi-Oases_System_in_Altas_Mountains_of_Morocco.pdf' },
      ],
    },
  ],

  // ── Sahara y sus oasis ────────────────────────────────────────────────────────
  sahara_norte_estepa: [
    {
      practica: 'Khettara y turnos de agua medidos por tiempo',
      periodo: 'Construido y ajustado durante siglos; vigente',
      tipo: 'agua',
      vigencia: 'en_uso',
      detalle:
        'En Figuig, galerías khettara conducen agua del acuífero por gravedad a estanques y canales del oasis. El derecho se mide en tiempo de flujo —kharrouba— y no en volumen, de modo que cada usuario recibe un turno sin poder extraer más agua que la disponible. El mantenimiento rotativo twiza vincula infraestructura, reparto y trabajo colectivo en una sola regla operativa.',
      fuentes: [
        { label: 'FAO GIAHS — The ksour of Figuig: oasis and pastoral culture around social management of water and land', url: 'https://www.fao.org/giahs/giahs-around-the-world/morocco-ksour-figuig-oasis/en' },
      ],
    },
  ],
  chotts_sebkhas: [
    {
      practica: 'Ghout: palmeras plantadas junto a la capa freática',
      periodo: 'Desde el siglo XV; vigente pero amenazado',
      tipo: 'agua',
      vigencia: 'en_retroceso',
      detalle:
        'En Oued Souf se excava una depresión en la duna hasta acercar las raíces de las palmeras al nivel freático, evitando bombeo. Bajo las palmeras se cultivan frutales y hortalizas; barreras de hojas frenan arena y el hueco se limpia periódicamente según dirección y velocidad del viento. El sistema ahorra energía, pero el bombeo regional y el drenaje deficiente están secando o anegando ghouts.',
      fuentes: [
        { label: 'FAO GIAHS — Ghout Oasis System, El Oued, Algeria', url: 'https://www.fao.org/giahs/giahs-around-the-world/algeria-ghout-oasis-system/en' },
      ],
    },
  ],
  sahara_oriental: [
    {
      practica: 'Oasis de Siwa con policultivo en tres alturas',
      periodo: 'Área agraria reconocida como muy antigua; vigente',
      tipo: 'cultivo',
      vigencia: 'en_uso',
      detalle:
        'En Siwa, palmeras datileras forman el estrato alto, olivos y otros frutales el intermedio, y hortalizas, forrajes o cereal ocupan el piso bajo. La estructura reduce viento y radiación, aumenta humedad relativa y crea un microclima donde pueden crecer cultivos que no soportarían el desierto abierto. Un supervisor tradicional organiza horarios precisos de apertura y cierre de canales.',
      fuentes: [
        { label: 'FAO GIAHS — Dates Production System in Siwa Oasis, Egypt', url: 'https://www.fao.org/giahs/giahs-around-the-world/egypt-siwa-oasis-dates-system/en' },
      ],
    },
  ],
  nilo_delta: [
    {
      practica: 'Riego de cuenca con la inundación anual del Nilo',
      periodo: 'Sistema histórico anterior a la presa de Asuán; reemplazado por riego perenne en el siglo XX',
      tipo: 'agua',
      vigencia: 'historica',
      detalle:
        'La agricultura histórica del valle y delta retenía la crecida anual en cuencas delimitadas para que el agua infiltrara y depositara limo antes de regresar al río. El sistema alineaba calendario de siembra, relieve y fertilidad con un pulso anual, sin exigir bombeo continuo. La presa alta de Asuán permitió riego perenne y terminó con ese régimen como base productiva.',
      fuentes: [
        { label: 'Vidal, Comeau, Plusquellec y Gadelle (2001) — Case Studies on Water Conservation in the Mediterranean Region, FAO/IPTRID, Roma (el caso de Egipto, p. 44)', url: 'https://www.fao.org/4/y1275e/y1275e00.pdf' },
      ],
    },
  ],
  sahara_sur: [
    {
      practica: 'Movilidad pastoral entre pasturas húmedas y secas',
      periodo: 'Desarrollada hace unos 7.000 años en el norte de África; vigente',
      tipo: 'ganaderia',
      vigencia: 'en_uso',
      detalle:
        'La síntesis de FAO sitúa el desarrollo del pastoralismo norteafricano hace unos siete milenios como respuesta a una aridez creciente e imprevisible. Mover el rebaño permite usar áreas secas durante la estación húmeda y reservar sectores más húmedos para la estación seca, siguiendo agua y forraje en lugar de forzar una carga fija. Es una estrategia territorial: requiere corredores y acuerdos de acceso, no sólo rotación dentro de un potrero.',
      fuentes: [
        { label: 'FAO (2018) — Pastoralism in Africa’s Drylands: Reducing Risks, Addressing Vulnerability and Enhancing Resilience, Roma (repositorio abierto de la FAO)', url: 'https://openknowledge.fao.org/handle/20.500.14283/ca1312en' },
      ],
    },
  ],
  sahara_costa_atlantica: [
    {
      practica: 'Pesca imraguen de mújol a pie con red de hombro',
      periodo: 'Registrada por exploradores portugueses desde el siglo XV; vigente',
      tipo: 'recoleccion',
      vigencia: 'en_uso',
      detalle:
        'Los imraguen del Banc d’Arguin viven casi exclusivamente de los cardúmenes migratorios: pescan a pie con red de hombro para el mújol y con red de espera desde lanchas tradicionales a vela para la corvina. La evaluación patrimonial describe sus técnicas como no modificadas desde que las registraron los exploradores portugueses del siglo XV, e incluye entre ellas la colaboración con delfines salvajes para acorralar los cardúmenes de mújol. Unos 500 imraguen viven en siete aldeas dentro del parque y sostienen su economía con esa pesca de subsistencia.',
      fuentes: [
        { label: 'IUCN / UNESCO World Heritage Centre (1989) — Banc d’Arguin National Park 506, advisory body evaluation', url: 'https://whc.unesco.org/archive/advisory_body_evaluation/506.pdf' },
        { label: 'FAO — Les ressources halieutiques de la ZEE mauritanienne: description des pêcheries imraguen', url: 'https://www.fao.org/4/r9048f/R9048F02.htm' },
      ],
    },
  ],
  mar_rojo_costa_desierto: [
    {
      practica: 'Poda y cuidado nómada de acacias forrajeras',
      periodo: 'Representada desde el Reino Nuevo egipcio (1539-1075 a. C.); todavía practicada en el siglo XXI',
      tipo: 'ganaderia',
      vigencia: 'en_retroceso',
      detalle:
        'Pastores nómadas hadandawa, amar ar, bishaari, ababda y maʿaza de las colinas del mar Rojo cosechan forraje de Acacia tortilis sacudiendo las ramas con el cayado y podándolas. La poda se hace sobre la subespecie raddiana y nunca sobre la subespecie tortilis, que no rebrota bien después de cortada; se corta para alimentar a los animales o para renovar árboles secos, débiles o demasiado crecidos, con procedimientos que los beja llaman waak, los ababda janii y los maʿaza tahsiin. Los autores señalan que sacudir y podar para cosechar forraje son prácticas antiguas, representadas ya en el Reino Nuevo egipcio, y que sigan en uso sugiere que estos pueblos desarrollaron hace mucho técnicas eficaces y sostenibles en lugar de sobreexplotar un árbol del que dependen. La sedentarización y la pérdida de vigencia de las leyes tribales están debilitando esa continuidad.',
      fuentes: [
        { label: 'Hobbs et al. (2014) — Acacia trees on the cultural landscapes of the Red Sea Hills, Biodiversity and Conservation 23', url: 'https://link.springer.com/article/10.1007/s10531-014-0755-x' },
      ],
    },
  ],
  mar_rojo_mangle: [
    {
      practica: 'Recolección y pesca de manglar con transporte en dromedario',
      periodo: 'Trabajo de campo entre 1992 y 1997; vigente al momento del estudio',
      tipo: 'recoleccion',
      vigencia: 'en_uso',
      detalle:
        'En torno a la aldea de Agetai, costa sudanesa del mar Rojo, grupos beja recolectaban madera a la deriva, manglar y gasterópodos y también pescaban. El dromedario permitía llegar en grupo a bajos fangosos, arena, arrecifes e islas someras, transportar recursos y cruzar sólo cuando viento, marea y corriente lo permitían. Quince sitios estaban bajo derechos territoriales colectivos y otros grupos necesitaban permiso de los residentes ejllab, de modo que la práctica incluye reglas de acceso además de transporte.',
      fuentes: [
        { label: 'Nawata (2001) — Coastal Resource Use by Camel Pastoralists: A Case Study of Gathering and Fishing Activities among the Beja in Eastern Sudan, Nilo-Ethiopian Studies 7', url: 'https://www.janestudies.org/wp-content/uploads/2018/files/NES_no7%282001%29_Nawata.pdf' },
      ],
    },
  ],

  // ── Macizos centrales del Sahara ──────────────────────────────────────────────
  ahaggar_tassili: [
    {
      practica: 'Ganadería documentada por arte rupestre y recintos',
      periodo: 'Entre 6000 a.C. y los primeros siglos de nuestra era',
      tipo: 'ganaderia',
      vigencia: 'historica',
      detalle:
        'En Tassili n’Ajjer, miles de pinturas, grabados, habitaciones, túmulos y recintos registran el pasaje de fauna silvestre a escenas de vida pastoril y, más tarde, caballos y camellos. El registro muestra que la producción animal se adaptó a cambios prolongados de clima y disponibilidad de agua. No permite reconstruir un calendario exacto de pastoreo, por lo que la entrada conserva sólo lo que la evidencia visual y arqueológica sostiene.',
      fuentes: [
        { label: 'UNESCO World Heritage Centre — Tassili n\'Ajjer', url: 'https://whc.unesco.org/en/list/179' },
      ],
    },
  ],

  // ── Canada oriental y el San Lorenzo ──────────────────────────────────────────
  san_lorenzo_tierras_bajas: [
    {
      practica: 'Milpa iroquesa de maíz, poroto y calabaza',
      periodo: 'Desde al menos el siglo XIII; práctica histórica documentada en la época de Jacques Cartier',
      tipo: 'cultivo',
      vigencia: 'historica',
      detalle:
        'Los iroqueses del San Lorenzo cultivaban maíz, porotos y calabazas en aldeas semipermanentes y sembraban al comienzo del verano. La combinación aprovechaba verticalmente el espacio: el maíz servía de soporte, el poroto trepaba y la calabaza cubría el suelo. Los restos de maíz más antiguos hallados en el valle y citados por Parques Canadá datan del siglo XIII.',
      fuentes: [
        { label: 'Parques Canadá — La agricultura de los iroqueses del San Lorenzo', url: 'https://parks.canada.ca/lhn-nhs/qc/cartierbrebeuf/culture/autochtone-indigenous/natcul6' },
      ],
    },
  ],

  // ── Columbia Britanica y el interior seco ─────────────────────────────────────
  columbia_britanica_interior: [
    {
      practica: 'Quemas culturales de baja severidad en Ne Sextsine',
      periodo: 'Documentadas entre 1550 y 1982; fuertemente reducidas desde la colonización',
      tipo: 'fuego',
      vigencia: 'en_retroceso',
      detalle:
        'El pueblo T\'exelc, hoy Williams Lake First Nation, aplicó fuego frecuente alrededor de la aldea, campamentos y corredores de tránsito de Ne Sextsine. Las quemas de baja severidad mantenían un mosaico abierto y productivo, con intervalos medianos de dieciocho años a escala de parcela. El estudio combina dendrocronología, carbón del suelo y conocimiento ecológico T\'exelc, y registra el quiebre asociado a la colonización.',
      fuentes: [
        { label: 'Copes-Gerbitz, Daniels y Hagerman (2022) — The contribution of Indigenous stewardship to an historical mixed-severity fire regime in British Columbia, Canada, Ecological Applications 33(3) (copia abierta en PubMed Central)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10078449/' },
      ],
    },
  ],
  okanagan_bosque_seco: [
    {
      practica: 'Quema cultural syilx de baja intensidad',
      periodo: 'Anterior a la colonización; actualmente en recuperación mediante quemas culturales y prescritas',
      tipo: 'fuego',
      vigencia: 'en_uso',
      detalle:
        'El pueblo syilx Okanagan realizaba quemas controladas y regulares de baja intensidad en sus territorios secos. El fuego renovaba plantas alimenticias y medicinales, reducía combustibles y conservaba claros dentro del bosque. Tras décadas de supresión colonial, las comunidades están recuperando la práctica en colaboración con equipos técnicos y autoridades provinciales.',
      fuentes: [
        { label: 'Forest Enhancement Society of British Columbia (2025) — Indigenous-led cultural and prescribed fire', url: 'https://fesbc.ca/wp-content/uploads/2025/09/2025-Special-Report.pdf' },
        { label: 'Okanagan Nation Alliance — Munro prescribed burns', url: 'https://syilx.org/projects/munro-prescribed-burns/' },
      ],
    },
  ],
  haida_gwaii_hipermaritimo: [
    {
      practica: 'Jardines haida de trébol de raíz',
      periodo: 'Documentados etnográficamente a fines del siglo XIX; sin confirmación arqueológica de cultivo anterior',
      tipo: 'cultivo',
      vigencia: 'historica',
      detalle:
        'Los haida despejaban piedras de parcelas costeras destinadas al trébol de raíz y cercaban los jardines para protegerlos. La práctica muestra una modificación deliberada y mantenida del suelo para una planta alimenticia perenne. Parques Canadá aclara que la descripción procede de Charles Newcombe a fines del siglo XIX y que las excavaciones citadas no hallaron prueba arqueológica de cultivo, por lo que no se proyecta hacia una antigüedad mayor.',
      fuentes: [
        { label: 'Parques Canadá — Arqueología en Gwaii Haanas y jardines de trébol haida', url: 'https://parks.canada.ca/pn-np/bc/gwaiihaanas/nature/conservation/culturelles-cultural/archeologie-archaeology/subaquatique-underwater' },
      ],
    },
  ],

  // ── Escudo, taiga y Artico canadiense ─────────────────────────────────────────
  escudo_canadiense_boreal: [
    {
      practica: 'Cosecha ojibwa de manomin desde canoa',
      periodo: 'Durante más de mil años; vigente en comunidades de la región',
      tipo: 'recoleccion',
      vigencia: 'en_uso',
      detalle:
        'Las comunidades ojibwa cosechan manomin o arroz silvestre en aguas someras y tranquilas del Escudo Canadiense. Una persona impulsa la canoa y otra inclina las panojas sobre la borda y las golpea suavemente, de modo que parte de la semilla cae al agua y regenera el rodal. La placa patrimonial de Manitoba documenta más de mil años de uso alimentario local.',
      fuentes: [
        { label: 'Gobierno de Manitoba — Wild Rice Harvesting / Manomin', url: 'https://www.manitoba.ca/chc/hrb/plaques/plaq1307.html' },
      ],
    },
  ],
  taiga_canadiense_permafrost: [
    {
      practica: 'Cercos gwich\'in para conducir caribúes',
      periodo: 'Usados hasta aproximadamente 1920; hoy conservados como patrimonio arqueológico y cultural',
      tipo: 'recoleccion',
      vigencia: 'historica',
      detalle:
        'Los gwich\'in construían largas alas de madera que guiaban a los caribúes hacia un corral y luego a un paso estrecho de captura. El sistema concentraba el movimiento de una manada migratoria mediante conocimiento de rutas, relieve y comportamiento animal. Parques Canadá registra cuarenta y seis sitios entre Alaska, Yukón y Territorios del Noroeste, incluidos siete en Vuntut.',
      fuentes: [
        { label: 'Parques Canadá — Caribou fences, Vuntut National Park', url: 'https://parks.canada.ca/pn-np/yt/vuntut/culture/cloture-fence?wbdisable=true' },
      ],
    },
  ],
  tundra_artica_canadiense: [
    {
      practica: 'Caches de piedra para conservar carne de caribú',
      periodo: 'Confirmadas por restos de caribú de aproximadamente 250 y 400 años',
      tipo: 'recoleccion',
      vigencia: 'historica',
      detalle:
        'En Many Caches, estructuras circulares de piedra protegían carne de caribú del sol y de carroñeros hasta que pudiera transportarse o consumirse. La investigación de Parques Canadá incorporó conocimiento Inuvialuit para interpretar y documentar el sitio. Dos fragmentos óseos fechados por radiocarbono sitúan el uso al menos entre hace unos 250 y 400 años.',
      fuentes: [
        { label: 'Parques Canadá — Many Caches: archaeology and Inuvialuit knowledge', url: 'https://www.parks.canada.ca/nature/science/autochtones-indigenous/caches' },
      ],
    },
  ],
  montana_artica_baffin_torngat: [
    {
      practica: 'Inuksuit para orientar desplazamientos y caza',
      periodo: 'Anteriores a la llegada neo-inuit al Ártico oriental hacia fines del siglo XII; con continuidad inuit',
      tipo: 'recoleccion',
      vigencia: 'en_uso',
      detalle:
        'En la isla de Baffin, los inuksuit y otras estructuras de piedra señalan direcciones, fuentes de alimento, peligros y lugares de espera. Algunas alineaciones también canalizan animales hacia cazadores, convirtiendo el relieve abierto en infraestructura de captura. Parques Canadá documenta su presencia antes de la migración neo-inuit al Ártico oriental y su continuidad dentro de la cultura inuit.',
      fuentes: [
        { label: 'Parques Canadá — Inuksuit on southern Baffin Island', url: 'https://parks.canada.ca/culture/cseh-twih/202343' },
      ],
    },
  ],
  alto_artico_desierto_polar: [
    {
      practica: 'Cachés de alimento para períodos sin caza',
      periodo: 'Ocupación Independence I iniciada hace aproximadamente 4.000 años; uso posterior por poblaciones Thule',
      tipo: 'recoleccion',
      vigencia: 'historica',
      detalle:
        'En Kettle Lake, Quttinirpaaq, las poblaciones Independence I cazaban buey almizclero, pescaban salvelino, reunían sauce para fuego y almacenaban comida en cachés de piedra para cuando escaseaba la caza. Siglos después, las poblaciones Thule —antepasadas de los inuit— también dejaron tres cachés en una cota más baja, con una brecha aproximada de dos mil años entre ambas ocupaciones. La fuente separa ambos conjuntos y declara incierta cualquier movilidad estacional entre costa e interior.',
      fuentes: [
        { label: 'Parks Canada — Kettle Lake Walking Tour, Quttinirpaaq National Park', url: 'https://parks.canada.ca/-/media/pn-np/nu/quttinirpaaq/wet4/pdf/lac-kettle-lake-en.pdf' },
      ],
    },
  ],

  // ── Groenlandia ───────────────────────────────────────────────────────────────
  groenlandia_kalaallit_nunaat: [
    {
      practica: 'Riego y abonado de praderas de heno nórdicas',
      periodo: 'Desde fines del siglo X hasta el siglo XV',
      tipo: 'agua',
      vigencia: 'historica',
      detalle:
        'Los colonos nórdicos del sudoeste de Groenlandia regaban y abonaban campos próximos a las granjas para producir heno. Zanjas y pequeños canales distribuían el deshielo durante los déficits estivales, mientras el estiércol devolvía nutrientes al suelo. El forraje conservado hacía posible mantener ganado estabulado durante el invierno y fue abandonado con la desaparición de los asentamientos medievales.',
      fuentes: [
        { label: 'University of Edinburgh Research Explorer — Insect fossils and irrigation in medieval Greenland', url: 'https://www.research.ed.ac.uk/en/publications/insect-fossils-and-irrigation-in-medieval-greenland/' },
      ],
    },
  ],

  // ── Islas britanicas e Irlanda ────────────────────────────────────────────────
  atlantico_llanura_noroeste: [
    {
      practica: 'Setos sobre talud con zanja de drenaje',
      periodo: 'Configuración dominante establecida entre 1750 y 1850; vigente',
      tipo: 'suelo',
      vigencia: 'en_uso',
      detalle:
        'En Irlanda, muchos setos se plantaron sobre bancos de tierra o piedra construidos con material extraído de una zanja paralela. El conjunto contiene ganado, corta el viento, evacua excedentes y forma corredores de vegetación entre parcelas. Su manejo requiere podas o recepes escalonados para no eliminar simultáneamente refugio y floración en toda la finca.',
      fuentes: [
        { label: 'The Heritage Council — Conserving Hedgerows', url: 'https://www.heritagecouncil.ie/content/files/conserving_hedgerows_2mb.pdf' },
      ],
    },
  ],
  campina_calcarea_inglesa: [
    {
      practica: 'Rotación ovino-cereal sobre pastizal calcáreo',
      periodo: 'Durante aproximadamente 3.000 años; persiste bajo nuevas formas de producción y conservación',
      tipo: 'ganaderia',
      vigencia: 'en_uso',
      detalle:
        'En South Downs, las ovejas pastaban el césped calcáreo y luego se encerraban de noche sobre campos arables. El estiércol transfería fertilidad desde la pastura hacia el cereal y el pastoreo mantenía una cubierta corta y diversa. La separación moderna entre ganadería y agricultura debilitó el ciclo, aunque el pastoreo ovino sigue siendo central para conservar el paisaje.',
      fuentes: [
        { label: 'South Downs National Park — Sustainable meat production and sheep-and-corn husbandry', url: 'https://www.southdowns.gov.uk/providing-a-local-solution-to-sustainable-meat-production-in-the-south-downs/' },
      ],
    },
  ],
  atlantico_norte_turberas: [
    {
      practica: 'Rotación de machair con algas, barbecho y pastoreo estacional',
      periodo: 'Durante más de mil años; vigente',
      tipo: 'suelo',
      vigencia: 'en_uso',
      detalle:
        'Los crofters de las Hébridas cultivan franjas del machair arenoso en rotación y dejan otras en barbecho y pastoreo estacional. Las algas aportan nutrientes y materia orgánica sin herbicidas, mientras el descanso mantiene la fertilidad y la flora del pastizal. La alternancia espacial impide que toda la llanura costera pierda cobertura al mismo tiempo.',
      fuentes: [
        { label: 'NatureScot — Scottish machair management', url: 'https://presscentre.nature.scot/news/snh-puts-scottish-machair-on-the-map' },
      ],
    },
  ],
  pinar_caledonio: [
    {
      practica: 'Shieling: trashumancia estival de ganado',
      periodo: 'Durante el período medieval y épocas posteriores; hoy principalmente histórica',
      tipo: 'ganaderia',
      vigencia: 'historica',
      detalle:
        'Comunidades rurales escocesas trasladaban familias y ganado a pasturas estivales de altura, donde usaban pequeñas cabañas o shielings. El movimiento reservaba los campos bajos para producir heno y llevaba el pastoreo hacia forraje que sólo estaba disponible en verano. Los conjuntos arqueológicos conservan cabañas, corrales y relaciones directas con agua y rutas de acceso.',
      fuentes: [
        { label: 'Historic Environment Scotland — Shieling settlement, South Uist', url: 'https://portal.historicenvironment.scot/apex/f?p=1505%3A300%3A%3A%3A%3A%3AVIEWTYPE%2CVIEWREF%3Adesignation%2CSM5332' },
      ],
    },
  ],
  atlantico_templado_oceanico: [
    {
      practica: 'Praderas de agua para producir heno y pasto',
      periodo: 'Desde la Edad Media hasta fines del siglo XIX; supervivencias posteriores puntuales',
      tipo: 'agua',
      vigencia: 'en_retroceso',
      detalle:
        'Agricultores ingleses cortaban canales en la pradera junto a ríos y arroyos para desviar agua y hacerla correr sobre el pasto, que quedaba cubierto de limo fértil. Los canales se diseñaban para poder bloquearse o abrirse y así controlar el flujo. El sistema aumentaba la cosecha de heno y dejaba un pastoreo más rico una vez cortada la hierba, y tomaba formas distintas según la región.',
      fuentes: [
        { label: 'English Heritage — History of Meadows', url: 'https://www.english-heritage.org.uk/learn/histories/history-of-meadows/' },
        { label: 'Historic England (2018) — Water Meadows: Introductions to Heritage Assets', url: 'https://historicengland.org.uk/images-books/publications/iha-water-meadows/' },
      ],
    },
  ],

  // ── Francia atlantica ─────────────────────────────────────────────────────────
  templado_occidental_europeo: [
    {
      practica: 'Bocage de parcelas cerradas por setos vivos',
      periodo: 'Formado desde fines de la Edad Media y transformado por las mutaciones agrícolas contemporáneas',
      tipo: 'suelo',
      vigencia: 'en_retroceso',
      detalle:
        'En el oeste de Francia, generaciones de agricultores cerraron campos y praderas con setos arbolados, taludes y zanjas. La red reduce viento y escorrentía, separa animales de cultivos y produce leña, sombra y conectividad ecológica. La mecanización y la concentración parcelaria simplificaron muchos paisajes, por lo que se registra como sistema en retroceso y no como un patrón intacto.',
      fuentes: [
        { label: 'INRAE — Le bocage: de la fin du Moyen Âge aux mutations agricoles contemporaines', url: 'https://belinrae.inrae.fr/index.php?id=240642&lvl=notice_display' },
      ],
    },
  ],

  // ── Peninsula iberica ─────────────────────────────────────────────────────────
  cantabrico_atlantico_iberico: [
    {
      practica: 'Terrazas agrarias para conservar suelo y agua',
      periodo: 'Desde los primeros siglos de la Alta Edad Media; con sectores aún cultivados y otros abandonados',
      tipo: 'suelo',
      vigencia: 'en_retroceso',
      detalle:
        'En Galicia, muros y rellenos transformaron laderas en superficies de cultivo más profundas y estables. La sucesión de bancales frena escorrentía, retiene sedimento y agua y limita la erosión en pendientes húmedas. La investigación del CSIC sitúa el origen del sistema regional en los primeros siglos altomedievales, sin atribuirlo a un pueblo específico.',
      fuentes: [
        { label: 'Ballesteros-Arias (2020), Universidad del País Vasco / INCIPIT-CSIC — El paisaje rural gallego', url: 'https://www.incipit.csic.es/es/produccion_cientifica/trabajo_academico/tesis-de-doctorado/el-paisaje-rural-gallego-la-arqueologia-y-la-etnografia-como-metodos-de-estudio-sobre-su-genesis-y-t1070' },
        { label: 'Revista Pirineos-CSIC — Terrazas agrícolas y conservación del suelo y el agua', url: 'https://pirineos.revistas.csic.es/index.php/pirineos/article/view/302' },
      ],
    },
  ],
  montano_iberico: [
    {
      practica: 'Acequias de careo para recargar acuíferos de montaña',
      periodo: 'Operativas desde al menos el siglo XI; todavía mantenidas por comunidades de regantes',
      tipo: 'agua',
      vigencia: 'en_uso',
      detalle:
        'En Sierra Nevada, acequias sin revestir desvían agua de deshielo y arroyos hacia laderas permeables durante la estación húmeda. El agua se infiltra y reaparece semanas o meses después en manantiales y cursos más bajos, ampliando la disponibilidad estival. Las comunidades de regantes limpian canales y abren o cierran derivaciones según nieve, suelo y demanda.',
      fuentes: [
        { label: 'Universidad de Granada — El sistema de recarga de las acequias de careo', url: 'https://canal.ugr.es/noticia/sierra-nevada-sistema-recarga-agua-subterranea-mas-antiguo-europa/' },
      ],
    },
  ],
  semiarido_sureste_iberico: [
    {
      practica: 'Regadío histórico escalonado de Cojáyar',
      periodo: 'Configurado y reconfigurado entre los siglos XVI y XXI',
      tipo: 'agua',
      vigencia: 'en_retroceso',
      detalle:
        'En Cojáyar, la captación y conducción por gravedad distribuyó agua escasa entre bancales de una montaña semiárida. La red enlaza fuente, acequias, depósitos y parcelas, y su funcionamiento depende tanto de la topografía como de turnos y mantenimiento colectivo. El estudio histórico muestra cinco siglos de ajustes, además de abandono parcial y pérdida de continuidad en tramos recientes.',
      fuentes: [
        { label: 'Estudios Geográficos-CSIC — Paisaje histórico del regadío de Cojáyar', url: 'https://estudiosgeograficos.revistas.csic.es/index.php/estudiosgeograficos/article/download/1117/1623?inline=1' },
      ],
    },
  ],

  // ── Italia y el Adriatico ─────────────────────────────────────────────────────
  po_llanura_aluvial: [
    {
      practica: 'Bonificación hidráulica renacentista del delta del Po',
      periodo: 'Entre los siglos XIV y XVI; trazado todavía reconocible y mantenido',
      tipo: 'agua',
      vigencia: 'en_uso',
      detalle:
        'La familia Este impulsó el drenaje de grandes extensiones pantanosas del delta del Po y creó canales, caminos y fincas agrícolas. La red convirtió humedales en tierras productivas y organizó conjuntamente evacuación, circulación y control del agua. UNESCO señala que la trama renacentista sigue siendo reconocible, aunque hoy depende de infraestructura y mantenimiento hidráulico contemporáneos.',
      fuentes: [
        { label: 'UNESCO World Heritage Centre — Ferrara, City of the Renaissance, and its Po Delta', url: 'https://whc.unesco.org/en/list/733/' },
      ],
    },
  ],
  apeninos_montano: [
    {
      practica: 'Trashumancia por tratturi entre montaña y llanura',
      periodo: 'Con trazas prerromanas, ampliadas en época romana y reutilizadas durante siglos',
      tipo: 'ganaderia',
      vigencia: 'en_retroceso',
      detalle:
        'Los pastores trasladaban rebaños por una red de amplias vías pecuarias entre pasturas altas estivales y llanuras de invierno. La movilidad seguía la estacionalidad del forraje y evitaba sostener el ganado todo el año en un único piso ecológico. UNESCO documenta origen prerromano y ampliación romana de la red, hoy conservada de manera fragmentaria.',
      fuentes: [
        { label: 'UNESCO World Heritage Centre — The Transhumance Routes', url: 'https://whc.unesco.org/en/tentativelists/5005/' },
      ],
    },
  ],
  mediterraneo_italiano_insular: [
    {
      practica: 'Vid ad alberello en hoyo protector',
      periodo: 'Práctica transmitida entre generaciones y vigente; inscrita por UNESCO en 2014',
      tipo: 'cultivo',
      vigencia: 'en_uso',
      detalle:
        'En Pantelleria, cada vid se planta dentro de una concavidad y se poda en seis ramas radiales próximas al suelo. La forma reduce exposición al viento, recoge humedad y permite que la planta soporte sequía y radiación intensa. Todo el ciclo se realiza manualmente y el conocimiento continúa dentro de la comunidad isleña.',
      fuentes: [
        { label: 'UNESCO Intangible Cultural Heritage — Vite ad alberello of Pantelleria', url: 'https://ich.unesco.org/en/RL/traditional-agricultural-practice-of-cultivating-the-vite-ad-alberello-head-trained-bush-vines-of-the-community-of-pantelleria-00720?RL=00720&lang=en' },
      ],
    },
  ],
  iliria_adriatico: [
    {
      practica: 'Parcelario griego con muros secos y captación de lluvia',
      periodo: 'Desde el siglo IV a.C.; estructura parcelaria aún legible y parcialmente cultivada',
      tipo: 'agua',
      vigencia: 'en_uso',
      detalle:
        'Los colonos griegos organizaron la llanura de Stari Grad en parcelas rectangulares separadas por muros de piedra seca. Canales, cisternas y pequeñas obras recuperaban lluvia, mientras la geometría permitía cultivar vid y olivo en un suelo pedregoso. La trama ha mantenido su escala básica durante unos veinticuatro siglos, aunque con cambios de cultivo y propiedad.',
      fuentes: [
        { label: 'UNESCO World Heritage Committee — Stari Grad Plain decision', url: 'https://whc.unesco.org/en/decisions/1490' },
      ],
    },
  ],
  dinaricos_karst: [
    {
      practica: 'Pastoreo con fuego controlado para mantener el saltus',
      periodo: 'Durante siglos; fuerte retroceso desde la segunda mitad del siglo XX',
      tipo: 'fuego',
      vigencia: 'en_retroceso',
      detalle:
        'La síntesis histórica del karst dinárico croata documenta siglos de pastoralismo y el uso deliberado del fuego para mantener el saltus —el matorral de pastoreo— e impedir que volviera a cerrarse como bosque, promoviendo la regeneración del pastizal: el rebrote posterior al fuego es mucho más rico en minerales y proteína, y junto con las sales de la ceniza mejoraba la calidad del forraje. La fuente distingue esos fuegos deliberados de los incendios no controlados, y atribuye la degradación del karst —deforestación y uso insostenible del pastizal— al sobrepastoreo, no a la quema. El abandono rural reciente acumuló combustible y elevó el riesgo de incendio.',
      fuentes: [
        { label: 'Tekić, Fuerst-Bjeliš y Cvitanović (2024) — Landscape Change and Fire Risk in the Croatian Dinaric Karst: Looking Back and Moving Forward, en Environmental Histories of the Dinaric Karst, Environmental History 17 (acceso abierto)', url: 'https://link.springer.com/chapter/10.1007/978-3-031-56089-7_5' },
      ],
    },
  ],

  // ── Balcanes, Egeo y Creta ────────────────────────────────────────────────────
  montana_balcanica_sur: [
    {
      practica: 'Trashumancia estacional entre Pindos y las llanuras',
      periodo: 'Tradición antigua todavía observada cuando fue documentada por FAO',
      tipo: 'ganaderia',
      vigencia: 'en_retroceso',
      detalle:
        'Pastores, entre ellos comunidades valacas, trasladaban ovejas desde invernadas de llanura hacia pastos montanos del Pindos en primavera y regresaban en otoño. El calendario seguía las festividades de San Jorge y San Demetrio y coordinaba ruta, disponibilidad de pasto y trabajo familiar. FAO registra continuidad, pero también el reemplazo parcial por transporte motorizado y asentamiento permanente.',
      fuentes: [
        { label: 'FAO — Transhumant sheep and goat production in Greece', url: 'https://www.fao.org/4/X6508E/X6508E04.htm' },
      ],
    },
  ],
  egeo_esclerofilo: [
    {
      practica: 'Cultivo familiar de lentisco para mástique',
      periodo: 'Vigente y transmitido entre generaciones; inscrito por UNESCO en 2014',
      tipo: 'cultivo',
      vigencia: 'en_uso',
      detalle:
        'En el sur de Quíos, familias podan y fertilizan lentiscos, limpian y nivelan el suelo y practican incisiones estivales para obtener resina. El piso claro permite recoger gotas sin mezclarlas con tierra y cada etapa reparte tareas y conocimiento dentro del hogar. La producción depende de árboles vivos y de cuidados repetidos, no de extraerlos una sola vez.',
      fuentes: [
        { label: 'UNESCO Intangible Cultural Heritage — Know-how of cultivating mastic on Chios', url: 'https://ich.unesco.org/en/RL/know-how-of-cultivating-mastic-on-the-island-of-chios-00993' },
      ],
    },
  ],
  creta_mediterranea: [
    {
      practica: 'Manejo temprano de olivos integrado con ovicaprinos',
      periodo: 'Desde el Neolítico Final y durante la Edad del Bronce; evidencia arqueobiológica',
      tipo: 'cultivo',
      vigencia: 'historica',
      detalle:
        'La evidencia de Creta oriental indica manejo de olivos a gran escala desde el Neolítico Final. Los restos botánicos y faunísticos muestran una economía donde olivar, cultivos intensivos y pastoreo extensivo de ovejas y cabras se relacionaban. Se registra como sistema histórico porque la fuente reconstruye usos prehistóricos y no demuestra continuidad predial directa hasta hoy.',
      fuentes: [
        { label: 'Livarda y otros (2021) — Mediterranean polyculture revisited: olive, grape and subsistence strategies at Palaikastro, East Crete, between the Late Neolithic and Late Bronze Age, Journal of Anthropological Archaeology 61 (copia abierta en el Dipòsit Digital de la UB)', url: 'https://diposit.ub.edu/items/4696aff1-05d2-431e-bc51-0eca13562ad8' },
      ],
    },
  ],
  chipre_troodos: [
    {
      practica: 'Terrazas vitícolas de piedra seca con canaletas de lluvia',
      periodo: 'Expansión de fines del siglo XIX y comienzos del XX; abandono mayoritario desde la década de 1950',
      tipo: 'suelo',
      vigencia: 'en_retroceso',
      detalle:
        'En los Wine Villages de Troodos, muros calizos sostienen suelos de vid sobre pendientes y reducen erosión y viento. Canaletas de tierra recogen y conducen lluvia entre bancales donde no hay riego permanente. La caída de la viticultura dejó muchas terrazas sin uso, aunque el patrón todavía estructura el paisaje.',
      fuentes: [
        { label: 'UNESCO World Heritage Centre — Wine Village Terraces, Cyprus', url: 'https://whc.unesco.org/document/5301' },
      ],
    },
  ],
  balcanes_mixto: [
    {
      practica: 'Aprovechamiento múltiple de robledales para leña, forraje y frutos',
      periodo: 'Neolítico temprano a tardío, 6500–4900 a. C. calibrados',
      tipo: 'recoleccion',
      vigencia: 'historica',
      detalle:
        'El análisis antracológico de 18 yacimientos neolíticos entre la llanura del bajo Danubio y la costa egea muestra que la vegetación buscada eran los robledales caducifolios mixtos termófilos, con un sotobosque rico en árboles, arbustos y hierbas que dan frutos y necesitan luz: de ahí salían la leña, el pasto forestal, el forraje y los frutos recolectados. Los datos indican estabilidad y sostenibilidad en la obtención de leña durante todo el período considerado, y sugieren que el uso del territorio favorecía ese sotobosque. El artículo es de acceso pago: esta entrada se apoya en su resumen público, que sostiene lo anterior.',
      fuentes: [
        { label: 'Marinova y Ntinou (2018) — Neolithic woodland management and land-use in south-eastern Europe: The anthracological evidence from Northern Greece and Bulgaria, Quaternary International 496 (resumen público; el texto completo es de pago)', url: 'https://doi.org/10.1016/j.quaint.2017.04.004' },
      ],
    },
  ],

  // ── Baltico y Escandinavia ────────────────────────────────────────────────────
  baltico_morrena: [
    {
      practica: 'Praderas arboladas mantenidas por siega y pastoreo',
      periodo: 'Paisajes semejantes desde hace 7.000–8.000 años; mantenimiento agrícola regular documentado posteriormente',
      tipo: 'ganaderia',
      vigencia: 'en_retroceso',
      detalle:
        'En Estonia, la siega regular y el pastoreo ligero mantienen praderas con árboles dispersos y una flora extremadamente diversa. El sistema produce heno, forraje, leña, frutos y otros recursos sin cerrar completamente el dosel. Al cesar el corte, el bosque recoloniza rápidamente, por lo que su continuidad depende de trabajo anual.',
      fuentes: [
        { label: 'UNESCO World Heritage Centre — Estonian wooded meadows', url: 'https://whc.unesco.org/en/tentativelists/1854/' },
      ],
    },
  ],
  sarmatico_boreonemoral: [
    {
      practica: 'Roza y quema con centeno y barbecho forestal',
      periodo: 'Integral al poblamiento de Savo del Norte desde al menos el siglo XV; residual después de la Segunda Guerra Mundial',
      tipo: 'fuego',
      vigencia: 'en_retroceso',
      detalle:
        'En Finlandia oriental se talaban y quemaban parcelas de coníferas para sembrar centeno sobre la ceniza. Tras pocas cosechas, el sitio quedaba en barbecho forestal prolongado y el cultivo se desplazaba, por lo que el sistema dependía de mucha superficie y baja frecuencia. Hoy sobrevive principalmente como práctica demostrativa y patrimonio vivo en pocos establecimientos.',
      fuentes: [
        { label: 'Metsähallitus — Management plan for Telkkämäki slash-and-burn heritage farm', url: 'https://julkaisut.metsa.fi/assets/pdf/lp/Asarja/a170-2.pdf' },
      ],
    },
  ],
  costa_conifera_escandinava: [
    {
      practica: 'Protección de eideres y recolección de plumón',
      periodo: 'Parte de un sistema pesquero-agrícola sostenido durante 1.500 años; en retroceso',
      tipo: 'recoleccion',
      vigencia: 'en_retroceso',
      detalle:
        'En el archipiélago de Vega, familias construyen refugios y nidos, protegen a las eideres durante la cría y recolectan plumón una vez que las aves se retiran. La relación aporta un material valioso sin matar al animal y articula pesca, pequeña agricultura y trabajo estacional. UNESCO destaca especialmente el papel histórico de las mujeres en la continuidad del sistema.',
      fuentes: [
        { label: 'UNESCO World Heritage Centre — Vegaøyan, The Vega Archipelago', url: 'https://whc.unesco.org/en/list/1143/' },
      ],
    },
  ],
  abedular_montano_escandinavo: [
    {
      practica: 'Migración anual sámi con rebaños de renos',
      periodo: 'Ciclo anual plenamente establecido en los siglos XVI y XVII; vigente',
      tipo: 'ganaderia',
      vigencia: 'en_uso',
      detalle:
        'Las comunidades sámi desplazan rebaños entre bosques invernales y pasturas montanas de verano siguiendo nieve, líquenes y alivio de insectos. La ruta reparte la presión sobre ambientes que no ofrecen alimento equivalente todo el año. UNESCO sitúa la consolidación completa del ciclo anual migratorio en los siglos XVI y XVII.',
      fuentes: [
        { label: 'UNESCO World Heritage Centre — Laponian Area', url: 'https://whc.unesco.org/en/list/774' },
      ],
    },
  ],
  islandia_abedular: [
    {
      practica: 'Pradera húmeda de heno para sostener ganado en invierno',
      periodo: 'Desarrollada durante el período medieval; evidencia paleoecológica',
      tipo: 'ganaderia',
      vigencia: 'historica',
      detalle:
        'En Helgadalur, el registro paleoecológico muestra que la gestión medieval se concentró en desarrollar una pradera de heno. El corte y secado del pasto húmedo convertía el breve crecimiento estival en forraje almacenable para el invierno. La fuente advierte que algunos indicadores también podrían reflejar pastoreo estacional o de baja densidad, por lo que la función no se presenta como exclusiva.',
      fuentes: [
        { label: 'Riddell et al. (2022), Vegetation History and Archaeobotany — Land-use histories of two Icelandic farms', url: 'https://steinunn.hi.is/files/2022-09/Rid_2021.pdf' },
      ],
    },
  ],
  boreal_nordico_turberas: [
    {
      practica: 'Siega de heno en turberas para la alimentación invernal',
      periodo: 'Desde comienzos de la Edad Media; abandono general durante el siglo XX',
      tipo: 'ganaderia',
      vigencia: 'historica',
      detalle:
        'En el norte de Suecia se segaban prácticamente todas las turberas aptas para obtener heno destinado al ganado durante el invierno. Como la siega reduce la biomasa, era común cortar cada dos años, y muchos productores inundaban artificialmente la turbera para imitar la productividad de las praderas litorales que se inundan solas. Hoy todo el heno se produce en campos fertilizados y las turberas pasaron a clasificarse como tierra improductiva.',
      fuentes: [
        { label: 'Norstedt, Maher Hasselquist y Laudon (2021) — From Haymaking to Wood Production: Past Use of Mires in Northern Sweden Affect Current Ecosystem Services and Function, Rural Landscapes 8(1): 2', url: 'https://www.diva-portal.org/smash/get/diva2%3A1528964/FULLTEXT01.pdf' },
      ],
    },
  ],

  // ── Carpatos y las estepas del este ───────────────────────────────────────────
  carpatos_montano: [
    {
      practica: 'Praderas de heno seminaturales de Transilvania',
      periodo: 'Mantenidas durante aproximadamente mil años; vigentes pero amenazadas',
      tipo: 'ganaderia',
      vigencia: 'en_retroceso',
      detalle:
        'Comunidades rurales de Transilvania siegan praderas floridas para guardar forraje invernal y luego permiten pastoreo controlado. El corte tardío deja completar ciclos de floración y evita que arbustos y bosque cierren el ambiente. FAO destaca que estos paisajes sobrevivieron alrededor de mil años, pero enfrentan abandono e intensificación.',
      fuentes: [
        { label: 'Knowles, B. (2011) — Mountain Hay Meadows: the Romanian Context and the Effects of Policy on High Nature Value Farming, Pogány-havas Microregion Association (ficha de la Plataforma de Agricultura Familiar de la FAO)', url: 'https://www.fao.org/family-farming/detail/en/c/308472/' },
      ],
    },
  ],
  estepa_pontica_chernozem: [
    {
      practica: 'Cortinas forestales contra viento y pérdida de humedad',
      periodo: 'Impulsadas institucionalmente desde 1891 tras una sequía y hambruna severas',
      tipo: 'suelo',
      vigencia: 'en_uso',
      detalle:
        'Filas de árboles se establecieron entre campos de la estepa para disminuir velocidad del viento, atrapar nieve y reducir erosión y evaporación. El diseño protege el chernozem y distribuye mejor la humedad sobre grandes superficies cerealistas. La comisión rusa de 1891 convirtió experiencias previas en un programa sistemático de protección forestal agrícola.',
      fuentes: [
        { label: 'FAO — Shelterbelts in the Russian steppe', url: 'https://www.fao.org/4/x5349e/x5349e02.htm' },
      ],
    },
  ],
  estepa_forestal_este: [
    {
      practica: 'Forestación de barrancos, arenas y bordes agrícolas',
      periodo: 'Desde comienzos del siglo XX; con continuidad en redes protectoras actuales',
      tipo: 'suelo',
      vigencia: 'en_uso',
      detalle:
        'En la estepa forestal ucraniana se implantaron bosques y franjas protectoras alrededor de campos, barrancos y arenas móviles. La vegetación leñosa corta viento, estabiliza suelo y conecta manchas forestales dentro de una matriz agrícola. FAO sitúa la expansión institucional de este trabajo al comienzo del siglo XX.',
      fuentes: [
        { label: 'FAO — Forestry and protective afforestation in Ukraine', url: 'https://www.fao.org/4/y1842e/y1842e39.htm' },
      ],
    },
  ],
  crimea_submediterraneo: [
    {
      practica: 'Chora griega parcelada para viñedo',
      periodo: 'Siglos IV y III a.C.; paisaje arqueológico',
      tipo: 'cultivo',
      vigencia: 'historica',
      detalle:
        'Los colonos griegos dóricos de Chersonese dividieron la península en lotes regulares con muros, caminos y granjas. Muchas parcelas se organizaron para viñedo y combinaron producción rural con el abastecimiento de la ciudad. La ficha conserva esta práctica como evidencia histórica de planificación agraria, no como manejo vigente.',
      fuentes: [
        { label: 'UNESCO World Heritage Centre — Ancient City of Tauric Chersonese and its Chora', url: 'https://whc.unesco.org/en/list/1411' },
      ],
    },
  ],
  estepa_pontica_panonica: [
    {
      practica: 'Pastoreo extensivo de razas rústicas en la puszta',
      periodo: 'Más de dos milenios hasta la actualidad',
      tipo: 'ganaderia',
      vigencia: 'en_uso',
      detalle:
        'La sociedad pastoril de Hortobágy conduce razas ganaderas rústicas adaptadas al mosaico de pastizales alcalinos, estepas, praderas y humedales de la gran llanura húngara. El uso extensivo y estacional, hoy concentrado entre abril y octubre, conserva el carácter abierto del paisaje y evita sustituirlo por agricultura intensiva.',
      fuentes: [
        { label: 'UNESCO World Heritage Centre — Hortobágy National Park, the Puszta', url: 'https://whc.unesco.org/en/list/474/' },
      ],
    },
  ],

  // ── Caucaso y el Caspio ───────────────────────────────────────────────────────
  caucaso_mixto: [
    {
      practica: 'Trashumancia tushin de ovinos resistentes',
      periodo: 'Raza y sistema formados en los siglos XIII–XIV; todavía utilizados',
      tipo: 'ganaderia',
      vigencia: 'en_uso',
      detalle:
        'Los tushin de Georgia desarrollaron ovinos capaces de recorrer largas distancias entre pasturas de montaña y llanuras invernales. Los rebaños aprovechan estaciones complementarias y reducen la necesidad de encerrar o alimentar animales todo el año. La rusticidad de pezuñas y cuerpo forma parte del sistema tanto como las rutas y los calendarios.',
      fuentes: [
        { label: 'FAO — Sheep and goat breeds of Georgia: Tushin sheep', url: 'https://www.fao.org/4/ah759e/AH759E12.htm' },
      ],
    },
  ],
  kura_semidesierto: [
    {
      practica: 'Trashumancia vertical khinalig por el Köç Yolu',
      periodo: 'Forma antigua de movilidad todavía vigente',
      tipo: 'ganaderia',
      vigencia: 'en_uso',
      detalle:
        'El pueblo khinalig mueve rebaños entre pasturas estivales de alta montaña y llanuras invernales del centro de Azerbaiyán. La ruta de unos doscientos kilómetros enlaza campamentos, pozos, abrevaderos y lugares de descanso mediante conocimiento transmitido. La movilidad vertical ajusta carga animal y agua a estaciones muy contrastantes.',
      fuentes: [
        { label: 'UNESCO World Heritage Centre — Khinalig People and Köç Yolu Transhumance Route', url: 'https://whc.unesco.org/en/list/1696' },
      ],
    },
  ],
  euxino_colquico: [
    {
      practica: 'Cultivo de mijo resistente a inundaciones en montículos habitados',
      periodo: 'Siglo XVIII a. C.; ocupación del montículo desde el siglo XX a. C.',
      tipo: 'cultivo',
      vigencia: 'historica',
      detalle:
        'En Tabakoni, en las tierras bajas de Colchis occidental, el registro arqueológico recuperó mijo cultivado (Panicum miliaceum) y hojas de hoz dentro de un asentamiento levantado sucesivamente con rellenos y nivelaciones sobre suelos aluviales anegados. La acumulación de granos de mijo, del siglo XVIII a. C., es uno de los registros más antiguos de mijo cultivado en la región. Los autores asocian la aparición de un paisaje pantanoso abierto con cultivos que incluirían al mijo, resistente a las inundaciones, y explican que el ambiente anegado exigía una base sólida y elevar el terreno para poder habitarlo. La evidencia prueba esa combinación en Tabakoni y sitios comparables de Colchis; no autoriza a atribuirla a toda la ecorregión ni a una población cuyo nombre la fuente no establece.',
      fuentes: [
        { label: 'Mörtz y otros (2026) — Dating Tabakoni: the chronology of a Bronze Age settlement mound in Colchis, Antiquity 100(409): 56-74 (acceso abierto)', url: 'https://www.cambridge.org/core/journals/antiquity/article/dating-tabakoni-the-chronology-of-a-bronze-age-settlement-mound-in-colchis/3B9DDCD0C7D931EF4D2BA7EF88F423EA' },
      ],
    },
  ],

  // ── Anatolia y el Levante ─────────────────────────────────────────────────────
  mediterraneo_oriental_conifera: [
    {
      practica: 'Terrazas de Battir con riego rotativo por manantiales',
      periodo: 'Continuidad documentada durante al menos un milenio; vigente',
      tipo: 'agua',
      vigencia: 'en_uso',
      detalle:
        'En Battir, muros secos forman terrazas irrigadas para hortalizas y terrazas secas para olivos y vides. Manantiales alimentan canales y estanques, y las familias distribuyen el agua mediante turnos temporales heredados. El mantenimiento colectivo de muros y conducciones conserva suelo fértil y permite cultivar una ladera abrupta.',
      fuentes: [
        { label: 'UNESCO World Heritage Centre — Palestine: Land of Olives and Vines, Battir', url: 'https://whc.unesco.org/en/list/1492' },
      ],
    },
  ],
  tauro_conifera_montana: [
    {
      practica: 'Trashumancia caprina y ovina hacia yaylas',
      periodo: 'Sistema tradicional todavía común al momento de la documentación de FAO',
      tipo: 'ganaderia',
      vigencia: 'en_uso',
      detalle:
        'En las montañas mediterráneas de Turquía, rebaños dejan las tierras bajas cálidas y secas al final de la primavera y suben a pasturas frescas. Permanecen cuatro o cinco meses en los yaylas y regresan en otoño según clima y forraje. La movilidad reduce presión estival sobre ambientes bajos y usa un recurso montano breve.',
      fuentes: [
        { label: 'FAO — Sheep and goats in Turkey', url: 'https://www.fao.org/4/ah224e/AH224E03.htm' },
      ],
    },
  ],
  meseta_anatolia_estepa: [
    {
      practica: 'Rotación cereal-barbecho en secano',
      periodo: 'Práctica tradicional vigente al momento de la documentación de FAO',
      tipo: 'cultivo',
      vigencia: 'en_uso',
      detalle:
        'En el secano de Turquía central, una campaña de cereal alterna con un año sin cultivo. El barbecho permite preparar el suelo para la siguiente siembra y sus rastrojos y malezas son aprovechados por ovejas y cabras. La fuente documenta el sistema a gran escala, pero no demuestra que sea óptimo bajo las condiciones climáticas actuales.',
      fuentes: [
        { label: 'FAO — Sheep and goats in Turkey', url: 'https://www.fao.org/4/ah224e/AH224E03.htm' },
      ],
    },
  ],
  anatolia_oriental_montana: [
    {
      practica: 'Huertas irrigadas de Hevsel junto al Tigris',
      periodo: 'Abastecen a Diyarbakır desde hace siglos; todavía productivas',
      tipo: 'agua',
      vigencia: 'en_uso',
      detalle:
        'Las huertas de Hevsel ocupan la franja fértil entre las murallas de Diyarbakır y el río Tigris. Canales y manantiales sostienen hortalizas, frutales y otros alimentos próximos a la ciudad, además de articular drenaje y biodiversidad ribereña. UNESCO las reconoce como parte continua del paisaje cultural urbano y no como un parque ornamental.',
      fuentes: [
        { label: 'UNESCO World Heritage Centre — Diyarbakır Fortress and Hevsel Gardens Cultural Landscape', url: 'https://whc.unesco.org/fr/list/1488' },
      ],
    },
  ],
  zagros_estepa_forestal: [
    {
      practica: 'Viñedo de Jowzan con conducción rastrera y qanat',
      periodo: 'Durante al menos 800 años; vigente',
      tipo: 'cultivo',
      vigencia: 'en_uso',
      detalle:
        'En Jowzan, las vides se conducen próximas al suelo y reciben riegos espaciados desde una red de qanats. Las familias ajustan el calendario mediante observación de hojas y estación, mientras el ganado consume malezas y restos de poda y devuelve estiércol. La integración limita insumos externos y mantiene un cultivo perenne bajo condiciones secas y frías.',
      fuentes: [
        { label: 'FAO GIAHS — Jowzan Valley Grape Production System, Iran', url: 'https://www.fao.org/giahs/giahs-around-the-world/iran-grape-production-system/en' },
      ],
    },
  ],
  ponto_anatolia_norte: [
    {
      practica: 'Avellanar perenne adaptado a la franja húmeda del mar Negro',
      periodo: 'Producción documentada desde hace 2.300 años; exportación durante los últimos seis siglos; vigente',
      tipo: 'cultivo',
      vigencia: 'en_uso',
      detalle:
        'Los documentos revisados por investigadores turcos sitúan la producción de avellana en la costa del mar Negro, al norte de Anatolia, hace 2.300 años, y su exportación durante los últimos seis siglos; Giresun aparece como el primer lugar donde se puso en cultivo. Una revisión agronómica ubica la región vieja del cultivo en Ordu, Giresun, Trabzon, Rize y Artvin, describe esa franja del mar Negro oriental como especialmente apta por su ecología y señala que las labores tradicionales siguen siendo intensivas en mano de obra. Para diseñar un predio, el antecedente respalda un cultivo perenne adaptado a esa franja húmeda, pero no prueba por sí solo que cualquier manejo histórico del suelo sea sostenible.',
      fuentes: [
        { label: 'Bak, Karadeniz, Şenyurt y Celap (2018) — Ülkemiz Fındık Yetiştiriciliğinin Dünü ve Bugünü, Bahçe 47', url: 'https://dergipark.org.tr/en/pub/bahce/article/1809063' },
        { label: 'İslam (2018) — Hazelnut culture in Turkey, Akademik Ziraat Dergisi 7(2)', url: 'https://dergipark.org.tr/en/pub/azd/article/476665' },
      ],
    },
  ],

  // ── Europa central ──────────────────────────────────────────────────────────────
  templado_continental_europeo: [
    {
      practica: 'Red de estanques de peces para producción y amortiguación de crecidas',
      periodo: 'Siglos XV y XVI hasta la actualidad',
      tipo: 'agua',
      vigencia: 'en_uso',
      detalle:
        'Las comunidades de la cuenca de Třeboň mantienen una red de 460 estanques y lagos artificiales conectada con la llanura de inundación del Lužnice, hoy la mayor producción de pescado de agua dulce de Europa: unas 3.000 toneladas por año, 95% carpas. Los estudios confirmaron que esos estanques y los humedales del río son los que mitigan las crecidas, de modo que la infraestructura productiva funciona además como reducción del riesgo de inundación.',
      fuentes: [
        { label: 'UNESCO (2018, actualizado en 2023) — Addressing climate-related risks and economic development go hand in hand in Třeboň', url: 'https://www.unesco.org/en/articles/addressing-climate-related-risks-and-economic-development-go-hand-hand-trebon' },
      ],
    },
  ],
};

/** Las prácticas de una ficha, o `[]`. Nunca `undefined`: el llamador no debería
 *  tener que distinguir "ficha sin prácticas cargadas" de "ficha inexistente". */
export function practicasDeFicha(fichaId: string): PracticaHistorica[] {
  return PRACTICAS_POR_FICHA[fichaId] ?? [];
}
