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
 * 62 entradas sobre 61 ecorregiones de 222. Sudamérica está cubierta casi
 * entera —incluida la Argentina, que es el mercado— y falta el resto del
 * mundo. Es trabajo de relevamiento con fuente, no de programación: el encargo
 * está en `_research/_encargos/`, y cada lote se verifica abriendo las URLs
 * antes de montarlo.
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
};

/** Las prácticas de una ficha, o `[]`. Nunca `undefined`: el llamador no debería
 *  tener que distinguir "ficha sin prácticas cargadas" de "ficha inexistente". */
export function practicasDeFicha(fichaId: string): PracticaHistorica[] {
  return PRACTICAS_POR_FICHA[fichaId] ?? [];
}
