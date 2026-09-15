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
 * 188 de las 210 fichas regionales tienen `saberes: []` a propósito: atribuirle
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
 * Seis entradas sobre cinco ecorregiones. Falta el resto, y es trabajo de
 * relevamiento con fuente, no de programación: el encargo está en
 * `_research/_encargos/`.
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
};

/** Las prácticas de una ficha, o `[]`. Nunca `undefined`: el llamador no debería
 *  tener que distinguir "ficha sin prácticas cargadas" de "ficha inexistente". */
export function practicasDeFicha(fichaId: string): PracticaHistorica[] {
  return PRACTICAS_POR_FICHA[fichaId] ?? [];
}
