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
};

/** Las prácticas de una ficha, o `[]`. Nunca `undefined`: el llamador no debería
 *  tener que distinguir "ficha sin prácticas cargadas" de "ficha inexistente". */
export function practicasDeFicha(fichaId: string): PracticaHistorica[] {
  return PRACTICAS_POR_FICHA[fichaId] ?? [];
}
