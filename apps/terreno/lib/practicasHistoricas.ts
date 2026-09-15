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
 * 115 entradas sobre 114 ecorregiones de 222. América está cubierta casi
 * entera, y con Medio Oriente y el norte de África entra el arco seco donde más
 * obra hidráulica hay documentada por organismos. Lo que falta es Europa —la
 * Unión y los no comunitarios— y Canadá, Alaska y Groenlandia. Es trabajo de
 * relevamiento con fuente, no de programación: el encargo está en
 * `_research/_encargos/`, y cada lote se verifica abriendo las URLs antes de
 * montarlo.
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
};

/** Las prácticas de una ficha, o `[]`. Nunca `undefined`: el llamador no debería
 *  tener que distinguir "ficha sin prácticas cargadas" de "ficha inexistente". */
export function practicasDeFicha(fichaId: string): PracticaHistorica[] {
  return PRACTICAS_POR_FICHA[fichaId] ?? [];
}
