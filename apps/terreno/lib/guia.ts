/**
 * El contenido de la guía de uso (`/guia`).
 *
 * Por qué esto es un módulo de datos y no JSX suelto en la página. Hasta hoy
 * había DOS guías: la ruta `/guia`, de cinco tarjetas, y `public/guia.html`, un
 * archivo estático de 845 líneas mucho más completo pero fuera de todo control.
 * La estática se había quedado en la marca vieja, anunciaba el plan Profesional
 * a US$ 12 con proyectos ilimitados —hoy son US$ 15 y diez— y no conocía la
 * mitad de las herramientas. Es la falla de siempre en este repo, pero en la
 * documentación: un texto plausible y equivocado, que nadie ve romperse.
 *
 * Entonces: una sola guía, y todo lo que también vive en el código se importa
 * en vez de escribirse. Los planes salen de `packages/config/src/acequia.ts` y
 * las fuentes de relieve de `grillaElevacion.ts`, así que no pueden divergir.
 * Lo que queda escrito a mano —qué hace cada herramienta— lo vigila
 * `tests/unit/guia/guia.test.ts`, que compara esta lista contra el riel de
 * `/mapa`: si mañana aparece una herramienta nueva y nadie la documenta, la
 * compuerta lo dice.
 *
 * El orden de las secciones es deliberado: primero para quién es, después el
 * orden de trabajo, después las herramientas, y recién al final los planes. La
 * guía enseña a leer el territorio; la lista de precios es una consecuencia.
 */
import type { Tab } from '@/components/mapa/riel';
import type { FuenteRelieve } from './grillaElevacion';
import type { AcequiaFeature } from '@arteytierra/config/acequia';

/* ─── 01 · Para quién es ──────────────────────────────────────────────────── */

export interface PerfilLector {
  id: string;
  titulo: string;
  /** Con qué pregunta llega esta persona. */
  llega: string;
  /** El recorrido corto que le conviene, nombrando herramientas reales. */
  recorrido: string;
  /**
   * Lo que esta persona en particular va a esperar y acequia NO hace.
   *
   * Es obligatorio y va en todos los perfiles. Un manual que sólo promete
   * produce el peor resultado posible de esta app: alguien que confía en un
   * número para una decisión que ese número no puede sostener.
   */
  ojo: string;
}

export const PERFILES: PerfilLector[] = [
  {
    id: 'duenio',
    titulo: 'Tenés un campo y no sabés bien qué tenés',
    llega:
      'Lo compraste, lo heredaste o lo venís usando hace años, pero nunca lo miraste entero: dónde junta agua, qué suelo hay, por qué el pasto crece distinto de un lado y del otro.',
    recorrido:
      'Mojones → Clima → Contexto → Topografía → Suelo. Con eso, en una tarde, tenés una lectura del lugar. Después Análisis y Aptitud te dicen dónde conviene cada cosa.',
    ojo: 'Los mojones los cargás vos y la app los toma como ciertos. Esto no define tus límites ni reemplaza un plano de mensura.',
  },
  {
    id: 'comprador',
    titulo: 'Estás por comprar y querés saber antes de firmar',
    llega:
      '¿Tiene agua? ¿La pendiente deja construir? ¿Qué hay alrededor que no se ve desde el camino: una línea de alta tensión, un feedlot, un ducto?',
    recorrido:
      'Clima → Cuenca → Topografía → Aptitud → Entorno. Casi todo se puede mirar antes de pisar el campo, y sirve para descartar rápido.',
    ojo: 'Es una preselección, no una tasación ni un informe de dominio. Y en el entorno, un vacío significa «no está mapeado», no «no hay».',
  },
  {
    id: 'campo',
    titulo: 'Trabajás el campo',
    llega:
      'Querés más pasto, mejor distribución del agua y menos pérdidas. La pregunta no es qué hay: es cuánto aguanta y cómo se ordena.',
    recorrido:
      'Clima → Calendario → Producción (ganadería) → Pastoreo → Represas y aguadas → Red de servicios.',
    ojo: 'La receptividad se estima desde la lluvia y la superficie, no desde tu potrero. Es un punto de partida para ajustar con lo que ves, no un número para comprar hacienda.',
  },
  {
    id: 'permacultor',
    titulo: 'Diseñás sistemas regenerativos',
    llega:
      'Ya tenés el método; lo que falta es el sitio en números: dónde está el keypoint, cuánto cae, cuánto escurre, qué zona aguanta qué.',
    recorrido:
      'El riel de /mapa está ordenado según la Escala de Permanencia de Yeomans: bajás peldaño por peldaño y el diseño sale en orden. Master Plan, Zonas, Sectores, Keyline y Swales cierran el trabajo.',
    ojo: 'El Master Plan propone, no decide: ubica según zonas, aptitud y afinidades entre usos. El criterio de sitio —lo que sólo se sabe caminando— lo ponés vos.',
  },
  {
    id: 'arquitecto',
    titulo: 'Sos arquitecta o arquitecto',
    llega:
      'Implantación: dónde va la casa, con qué orientación, por dónde entra, cómo llega el agua y qué se ve desde ahí.',
    recorrido:
      'Topografía → Solar → Sombras → Visibilidad → Aptitud → Caminos → Red de servicios. El informe sale con tu logo y tus datos.',
    ojo: 'Las cotas vienen de un modelo de elevación, no de un relevamiento. Para proyecto ejecutivo necesitás medición propia — y si la tenés, la importás como GeoTIFF y la app la usa con prioridad sobre todo lo demás.',
  },
  {
    id: 'agronomo',
    titulo: 'Sos ingeniera o ingeniero agrónomo',
    llega:
      'Balance hídrico, lámina y turno de riego, receptividad, carbono del suelo. Números para dimensionar, con el método a la vista.',
    recorrido:
      'Clima → Suelo → Riego → Producción → Carbono → Cuenca. Cada panel dice con qué método calculó y en qué rango vale.',
    ojo: 'El suelo es una estimación satelital de ~250 m: sirve para dimensionar, no reemplaza el análisis de laboratorio. Cuando tengas el tuyo, el panel te dice si coincide con lo que el clima predice — y cuando no coincide, a quién culpar.',
  },
  {
    id: 'desarrollador',
    titulo: 'Desarrollás o loteás',
    llega:
      'Cuánto del predio es aprovechable, por dónde van los caminos y los servicios, qué cuesta la infraestructura y en cuánto se recupera.',
    recorrido:
      'Topografía → Aptitud → Cuenca → Caminos → Red de servicios → Economía. La capa de riesgo de erosión marca temprano lo que después cuesta caro.',
    ojo: 'Aptitud no es factibilidad. No conoce el código de ordenamiento de tu municipio, ni retiros, ni servidumbres, ni el estudio de impacto ambiental que te van a pedir.',
  },
  {
    id: 'topografo',
    titulo: 'Sos topógrafo o agrimensora',
    llega:
      'Ya tenés el relevamiento. Lo que buscás es qué hacer con él: análisis, planos y entregables sobre tu propia medición.',
    recorrido:
      'Mojones por coordenadas (decimal, GMS o UTM), rumbos y replanteo, importación de KML/KMZ/CSV, importación de tu DEM en GeoTIFF, y exportación a DXF, GeoJSON, KML y GPX.',
    ojo: 'acequia no hace mensura. No determina límites, no tiene validez catastral y toma como ciertas las coordenadas que le cargás. El valor está del otro lado: el análisis que se apoya sobre tu medición.',
  },
  {
    id: 'tecnico',
    titulo: 'Trabajás con comunidades, cooperativas u organizaciones',
    llega:
      'Necesitás una lectura del territorio que además diga de quién es el conocimiento que aparece y de dónde salió cada dato.',
    recorrido:
      'Contexto reúne la ecorregión, las prácticas fechadas del territorio, los saberes con licencia clara y, donde el censo del país lo publica, la presencia de pueblos originarios con su denominador explícito.',
    ojo: 'Hay ecorregiones donde la sección de saberes aparece vacía, y es una decisión: preferimos decir que no encontramos algo con atribución clara antes que llenar el hueco con algo que no podemos citar.',
  },
  {
    id: 'docente',
    titulo: 'Enseñás o estudiás',
    llega:
      'Querés mostrar cómo se lee un sitio, con el dato y el método a la vista en vez de un resultado que aparece solo.',
    recorrido:
      'Cualquier recorrido sirve, porque en cada panel se ve el número, su fuente, su escala y su límite. El informe imprime el método y las cautelas completas.',
    ojo: 'Las licencias de los datos son abiertas pero no son todas iguales. Si vas a publicar, respetá la atribución que la app declara en el anexo del informe.',
  },
];

/* ─── 02 · El orden de trabajo ────────────────────────────────────────────── */

/**
 * Los peldaños, en el mismo orden y con los mismos `id` que `GRUPOS_RIEL` de
 * `components/mapa/riel.tsx`, más `entrega`, que en la app vive en la barra
 * superior y no en el riel.
 */
export interface Peldano {
  id: string;
  titulo: string;
  /** Qué se decide en este peldaño. */
  que: string;
  /** Por qué va acá y no antes ni después. */
  porque: string;
}

export const PELDANOS: Peldano[] = [
  {
    id: 'ubicacion',
    titulo: 'Tu terreno',
    que: 'Dónde está y hasta dónde llega. Los mojones cierran el polígono y de ahí salen superficie, perímetro y centroide.',
    porque: 'Sin polígono no hay nada que analizar: todas las consultas de datos se hacen sobre este contorno.',
  },
  {
    id: 'clima',
    titulo: '1 · Clima y contexto',
    que: 'Cuánto llueve, cuánto pide la atmósfera, cuándo hiela, qué ecosistema es éste y qué hay alrededor.',
    porque: 'El clima es lo único que no se puede cambiar. Define qué vegetación es posible, y la vegetación termina de definir el suelo.',
  },
  {
    id: 'relieve',
    titulo: '2 · Relieve y suelo',
    que: 'La forma del terreno —pendientes, curvas, por dónde corre el agua— y lo que hay abajo: el perfil del suelo y la roca madre.',
    porque: 'La forma casi no se cambia, y cuando se cambia cuesta movimiento de suelo. Todo lo que viene después se apoya acá.',
  },
  {
    id: 'agua',
    titulo: '3 · Agua',
    que: 'De dónde viene, adónde va y dónde se guarda: cuenca de aporte, represas, aguadas, keyline, swales, red y riego.',
    porque: 'El agua es el tercer peldaño porque depende del relieve y del clima, y porque define los caminos: en un diseño bien hecho, el camino y la línea de agua son casi la misma traza.',
  },
  {
    id: 'zonas',
    titulo: '4 · Zonas, sectores e infraestructuras',
    que: 'Dónde va cada cosa. Zonas de permacultura, sectores de energía que entran al predio, y los elementos construidos ubicados a escala.',
    porque: 'Recién acá tiene sentido ubicar: una casa mal puesta se puede mover en el plano, pero no se puede mover el valle al que mira.',
  },
  {
    id: 'prod',
    titulo: '5 · Sistemas productivos',
    que: 'Lo que el predio produce y cómo se maneja: pastoreo rotativo, cultivos, silvopastura, cortinas, cortafuegos, carbono.',
    porque: 'Es lo más fácil de cambiar y lo que más cambia. Va último a propósito: decidir el cultivo antes que el agua es el orden inverso al que funciona.',
  },
  {
    id: 'entrega',
    titulo: 'Entrega',
    que: 'El informe, el presupuesto con retorno, las exportaciones y el proyecto guardado en la nube.',
    porque: 'El informe refleja exactamente lo que calculaste: lo que no corriste, no aparece.',
  },
];

/* ─── 03 · Las herramientas, una por una ──────────────────────────────────── */

export interface Herramienta {
  /** El mismo `id` que usa el riel de `/mapa`, los entitlements y Ctrl+K. */
  id: Tab;
  /** A qué peldaño pertenece. Coincide con `GRUPO_DE_TAB` del riel. */
  peldano: string;
  /** Qué hace, en prosa. */
  que: string;
  /** Qué tiene que estar calculado antes. `null` = no necesita nada. */
  necesita: string | null;
  /** Qué deja disponible para el resto de la app. */
  produce: string;
}

/**
 * El nombre visible de cada herramienta.
 *
 * Duplica los `label` de `TAB_DEFS` a propósito: el riel es un componente de
 * cliente con íconos de `lucide-react`, e importarlo desde la página de la
 * guía —que es servidor y es texto— arrastraría todo ese bundle. La copia es
 * de dos palabras, el `Record` completo obliga a que no falte ninguna, y el
 * test compara los textos contra el riel.
 */
export const ROTULO_HERRAMIENTA: Record<Tab, string> = {
  mojones:      'Mojones',
  topo:         'Topografía',
  suelo:        'Suelo',
  cobertura:    'Cobertura',
  aptitud:      'Aptitud',
  analisis:     'Análisis',
  clima:        'Clima',
  cal:          'Calendario',
  cuenca:       'Cuenca',
  aguadas:      'Represas',
  red:          'Red de servicios',
  riego:        'Riego',
  swales:       'Swales',
  agua:         'Captación',
  solar:        'Solar',
  sombras:      'Sombras',
  visibilidad:  'Visibilidad',
  contexto:     'Contexto',
  entorno:      'Entorno',
  carbono:      'Carbono',
  zonas:        'Zonas',
  masterplan:   'Master plan',
  sectores:     'Sectores',
  caminos:      'Caminos',
  cortinas:     'Cortinas',
  cortafuegos:  'Cortafuegos',
  infra:        'Infraestructuras',
  elementos:    'Elementos',
  pastoreo:     'Pastoreo',
  silvopastura: 'Silvopastura',
  keyline:      'Keyline',
  prod:         'Producción',
  economia:     'Economía',
  proyectos:    'Proyectos',
};

export const HERRAMIENTAS: Herramienta[] = [
  {
    id: 'mojones',
    peldano: 'ubicacion',
    que: 'Los vértices del terreno. Los cargás por coordenadas (decimal, grados-minutos-segundos o UTM), haciendo clic en el mapa, o importando un KML, KMZ o CSV. También calcula rumbos y distancias para replanteo.',
    necesita: null,
    produce: 'el predio: superficie, perímetro, centroide',
  },
  {
    id: 'clima',
    peldano: 'clima',
    que: 'El clima del lugar a partir de series satelitales, con la lluvia afinada por fuentes de mayor detalle donde existen. Calcula temperaturas, lluvia mensual, evapotranspiración potencial (cuánta agua «pide» la atmósfera), el balance hídrico mes a mes, la clasificación de Köppen —leída del mapa, y con la deriva entre períodos— y el índice de aridez.',
    necesita: 'mojones',
    produce: 'lluvia · ETP · balance · Köppen · aridez',
  },
  {
    id: 'contexto',
    peldano: 'clima',
    que: 'Qué ecosistema es éste. Clasifica el punto en su ecorregión y su bioma, describe la vegetación de base, y suma lo que se sabe del territorio: prácticas fechadas, saberes con licencia clara, y la presencia de pueblos originarios donde el censo del país la publica. También muestra a dónde va este clima y qué se cultiva en los lugares que ya tienen el clima que acá se viene.',
    necesita: 'clima',
    produce: 'ecorregión · bioma · análogos climáticos',
  },
  {
    id: 'entorno',
    peldano: 'clima',
    que: 'La línea de base viva y el vecindario. Trae las especies registradas en la zona con su estado de conservación, las referencias del entorno —localidades, rutas, cursos de agua— y el contexto actual: qué industria, qué ductos y qué líneas eléctricas hay alrededor, a cuántos kilómetros y en qué rumbo, sin nombrar a nadie.',
    necesita: 'mojones',
    produce: 'biodiversidad registrada · entorno · contexto actual',
  },
  {
    id: 'cal',
    peldano: 'clima',
    que: 'Las ventanas del año: meses fríos y cálidos, época seca y húmeda, riesgo de helada. Ajustado al hemisferio que corresponde.',
    necesita: 'clima',
    produce: 'ventanas estacionales',
  },
  {
    id: 'solar',
    peldano: 'clima',
    que: 'El arco del sol sobre el terreno y las horas de sol a lo largo del año, con los rumbos reales de salida y puesta en cada estación.',
    necesita: 'mojones',
    produce: 'arco solar · horas de sol',
  },
  {
    id: 'topo',
    peldano: 'relieve',
    que: 'El relieve, muestreado de un modelo de elevación. De acá salen la pendiente media, el desnivel, las curvas de nivel y las líneas de escurrimiento. Podés importar tu propio relevamiento en GeoTIFF y tiene prioridad sobre cualquier otra fuente.',
    necesita: 'mojones',
    produce: 'pendiente · curvas · escorrentía · relieve 3D',
  },
  {
    id: 'analisis',
    peldano: 'relieve',
    que: 'Corre el relieve completo y propone los mejores sitios de represa, ordenados por eficiencia —cuánta agua junta por metro cúbico de tierra movida—, y enciende el análisis hídrico de escorrentías. Acá también se ve el riesgo de erosión, cruzando pendiente con flujo acumulado.',
    necesita: 'topografía',
    produce: 'sitios de represa · escorrentías · riesgo de erosión',
  },
  {
    id: 'suelo',
    peldano: 'relieve',
    que: 'El perfil del suelo por profundidad: pH, textura, carbono orgánico, densidad aparente y nitrógeno. Además explica por qué el suelo es así —predice qué suelo haría este clima y lo compara con el medido— y dice qué roca hay abajo y qué le hereda.',
    necesita: 'mojones (y clima, para la lectura del porqué)',
    produce: 'perfil · agua útil · roca madre',
  },
  {
    id: 'cobertura',
    peldano: 'relieve',
    que: 'Qué cubre el suelo hoy según el mapa satelital de cobertura: bosque, pastizal, cultivo, agua, construido. Es la línea de base de la que partís.',
    necesita: 'mojones',
    produce: 'cobertura actual',
  },
  {
    id: 'aptitud',
    peldano: 'relieve',
    que: 'Cruza la pendiente con las líneas de escurrimiento —corregida por la ficha del ecosistema— para decir dónde conviene cada uso: dónde construir, dónde cultivar, dónde forestar, qué dejar como reserva. Las zonas se pueden volcar directo al diseño.',
    necesita: 'topografía',
    produce: 'zonas de aptitud → Zonas',
  },
  {
    id: 'cuenca',
    peldano: 'agua',
    que: 'Elegís un punto de cierre y delimita toda la superficie que drena hacia ahí. Después estima, para la tormenta de diseño que definas, cuánta agua escurre y con qué caudal pico, por el método de la Curva Número, que combina suelo y cobertura.',
    necesita: 'topografía (mejora con suelo y cobertura)',
    produce: 'área · tiempo de concentración · volumen · caudal pico',
  },
  {
    id: 'aguadas',
    peldano: 'agua',
    que: 'Ubica el agua sobre el relieve: sitios de represa por eficiencia, dimensionado del embalse de ladera con su balance de excavación y relleno, el muro, la simulación del año mes a mes, y las aguadas y bebederos con su radio de cobertura.',
    necesita: 'topografía · clima',
    produce: 'represas · aguadas · balance anual',
  },
  {
    id: 'caminos',
    peldano: 'agua',
    que: 'El trazado de caminos internos, con su perfil de elevación. Además de organizar la circulación, son el esqueleto por donde después corre la red de servicios.',
    necesita: 'se dibuja a mano (o lo propone el Master Plan)',
    produce: 'trazas → Red de servicios',
  },
  {
    id: 'keyline',
    peldano: 'agua',
    que: 'El patrón de líneas clave de Yeomans trazado sobre el relieve: guías para arar y mover el agua de los valles hacia las lomas, distribuyéndola pareja en la ladera.',
    necesita: 'topografía',
    produce: 'guías keyline + keypoint',
  },
  {
    id: 'swales',
    peldano: 'agua',
    que: 'Zanjas de infiltración a nivel sobre las curvas, para frenar e infiltrar el agua de lluvia en la ladera. Calcula el largo, la franja de captación, la separación recomendada según la pendiente y el volumen que retiene.',
    necesita: 'topografía',
    produce: 'líneas de swale · volumen infiltrado',
  },
  {
    id: 'red',
    peldano: 'agua',
    que: 'La red de servicios del predio siguiendo la traza de los caminos: agua, riego, gas, electricidad, cloacas o datos. Para agua y riego dimensiona de verdad —caudal a partir de los artefactos conectados, diámetro mínimo, pérdida de carga y bomba—; para gas y electricidad sólo mide el recorrido, porque son otra física y otras normas.',
    necesita: 'caminos',
    produce: 'trazas · diámetros · bombeo',
  },
  {
    id: 'riego',
    peldano: 'agua',
    que: 'Dimensiona el sistema completo. Cruza cuánta agua pide el cultivo con cuánta retiene el suelo y, según el método que elijas y su eficiencia, calcula lámina neta y bruta, cada cuántos días regar, qué caudal hace falta y cuántas horas de riego por día en el mes pico.',
    necesita: 'clima (mejora mucho con suelo)',
    produce: 'lámina · turno · caudal · volumen anual',
  },
  {
    id: 'agua',
    peldano: 'agua',
    que: 'Cuánta agua de lluvia podés cosechar de techos y superficies duras, mes a mes. La base para dimensionar tanques y cisternas.',
    necesita: 'clima',
    produce: 'agua cosechable por mes',
  },
  {
    id: 'masterplan',
    peldano: 'zonas',
    que: 'Marcás la zona 0 —la casa o el edificio principal— y el acceso, declarás el programa del predio con sus superficies, y el motor ubica cada elemento dentro del terreno según las zonas de permacultura, la aptitud y las afinidades entre usos, y traza los caminos que conectan todo desde el acceso.',
    necesita: 'topografía · zona 0 · acceso',
    produce: 'ubicaciones + caminos sugeridos',
  },
  {
    id: 'zonas',
    peldano: 'zonas',
    que: 'La zonificación de permacultura, de la zona 0 a la 5, según la frecuencia con que vas a ir a cada lugar. Puede recibir directamente las zonas calculadas por Aptitud.',
    necesita: 'Aptitud (o se dibuja a mano)',
    produce: 'zonas de manejo',
  },
  {
    id: 'sectores',
    peldano: 'zonas',
    que: 'Las energías que entran al predio de afuera —sol, vientos dominantes, riesgo de fuego, ruido— dibujadas según el clima y el relieve, con los rumbos correctos para el hemisferio.',
    necesita: 'clima · topografía',
    produce: 'sectores de energía',
  },
  {
    id: 'elementos',
    peldano: 'zonas',
    que: 'Elementos a escala real sobre el mapa: árboles con su copa, vehículos, canteros y masas de vegetación. Los redondos se estampan con un clic; los canteros y las masas se dibujan vértice por vértice. Se ven también en la vista 3D.',
    necesita: 'mojones',
    produce: 'elementos dibujados a escala',
  },
  {
    id: 'infra',
    peldano: 'zonas',
    que: 'Símbolos de infraestructura colocados como pines editables: tanques, molinos, tranqueras, galpones, postes. Sirven para registrar lo que ya existe antes de proyectar lo que falta.',
    necesita: 'mojones',
    produce: 'puntos de referencia',
  },
  {
    id: 'sombras',
    peldano: 'zonas',
    que: 'Cómo caen las sombras del relieve —y de lo que tenga altura en el plano— a distintas horas y estaciones. Muestra qué sectores quedan sombreados y cuáles reciben sol pleno.',
    necesita: 'topografía',
    produce: 'mapa de sombras',
  },
  {
    id: 'visibilidad',
    peldano: 'zonas',
    que: 'Desde un punto que elegís, qué partes del terreno se ven y cuáles quedan tapadas por el relieve. Sirve tanto para buscar vista como para buscar privacidad.',
    necesita: 'topografía',
    produce: 'cuenca visual',
  },
  {
    id: 'pastoreo',
    peldano: 'prod',
    que: 'Convierte la receptividad en un plan concreto: en cuántos potreros dividir, cuántos días ocupar cada uno, cuánto alambre y cuántos bebederos hacen falta. Es el pastoreo rotativo puesto en números, con su calendario de rotación.',
    necesita: 'clima · superficie',
    produce: 'balance forrajero · rotación · materiales',
  },
  {
    id: 'prod',
    peldano: 'prod',
    que: 'El potencial productivo según el clima, en dos módulos. En cultivo, compara mes a mes la lluvia contra lo que el cultivo necesita y muestra el déficit a reponer con riego. En ganadería, estima cuánto forraje crece y cuántos animales sostiene el campo.',
    necesita: 'clima · superficie',
    produce: 'déficit de riego · receptividad',
  },
  {
    id: 'silvopastura',
    peldano: 'prod',
    que: 'Hileras de árboles a nivel sobre las curvas, con pasto entre ellas: sombra para el ganado, forraje y retención de agua y suelo sin resignar superficie de pastoreo. Elegís la separación entre hileras y entre árboles.',
    necesita: 'topografía',
    produce: 'hileras · cantidad de árboles',
  },
  {
    id: 'cortinas',
    peldano: 'prod',
    que: 'Una franja multiestrato de árboles y arbustos que frena el viento de forma porosa. La dibujás o la sugiere el sistema aguas arriba de la casa, para protegerla del viento frío; elegís ancho y altura y te dice los metros protegidos a sotavento y las especies por estrato.',
    necesita: 'mojones (clima para el rumbo del viento)',
    produce: 'franja · zona protegida',
  },
  {
    id: 'cortafuegos',
    peldano: 'prod',
    que: 'Detecta las líneas de cresta del predio y propone fajas cortafuego sobre ellas: cortan la ladera arriba, son de fácil acceso y el fuego pierde impulso al llegar al filo. Elegís el ancho de la faja despejada.',
    necesita: 'topografía',
    produce: 'fajas sobre crestas',
  },
  {
    id: 'carbono',
    peldano: 'prod',
    que: 'El carbono que el suelo tiene hoy —a partir del carbono orgánico y la densidad aparente, medidos por capa— y cuánto más podría capturar con prácticas regenerativas. Lo traduce a CO₂ equivalente.',
    necesita: 'suelo · cobertura · superficie',
    produce: 'stock y captura de carbono',
  },
  {
    id: 'economia',
    peldano: 'entrega',
    que: 'El presupuesto y el retorno: junta las cantidades de lo que diseñaste —red, reservorio, riego, alambrado— y les pone números, con márgenes y período de recupero.',
    necesita: 'el diseño (de ahí saca las cantidades)',
    produce: 'presupuesto · retorno',
  },
  {
    id: 'proyectos',
    peldano: 'entrega',
    que: 'Guardar y recuperar el trabajo en la nube. Cada proyecto guarda todo: mojones, análisis calculados, dibujos y calibraciones. Desde acá también se comparte el informe.',
    necesita: 'una cuenta',
    produce: 'guardar · abrir · compartir',
  },
];

/* ─── 04 · Cómo se lee un número de acequia ───────────────────────────────── */

export interface Regla {
  titulo: string;
  texto: string;
}

export const REGLAS_DE_LECTURA: Regla[] = [
  {
    titulo: 'La fuente viaja con el dato',
    texto:
      'Al lado de cada resultado está de dónde salió y con qué método se calculó. No es letra chica: es lo que te permite decidir cuánto confiar. El informe lo imprime entero en el anexo.',
  },
  {
    titulo: 'Un número puede ser correcto y no ser de tu predio',
    texto:
      'Todo dato remoto tiene un tamaño de celda. Si el mapa que contesta promedia sobre cien kilómetros, el número está bien como encuadre regional y está mal como descripción de tu campo. Por eso, donde se puede, la app dice de qué tamaño es la celda que contestó: «~6 km de lado» y «~126 km de lado» no se leen igual.',
  },
  {
    titulo: 'Si no hay dato, la sección no aparece',
    texto:
      'Un hueco no se rellena con el promedio de la región. Cuando algo no está, o no aparece, o aparece dicho: «acá no hay dato», que es distinto de «acá hay cero».',
  },
  {
    titulo: 'Cuando la ciencia da un rango, se muestra el rango',
    texto:
      'Hay procesos que la literatura mide con un intervalo, no con un valor. En esos casos acequia informa los dos extremos. Un solo número sería más cómodo de leer y menos cierto.',
  },
  {
    titulo: 'Lo que discrepa es lo más informativo',
    texto:
      'Cuando lo medido no coincide con lo que el sitio predice, eso no se pinta de rojo ni se esconde. Suele ser la parte más útil de la lectura: quiere decir que hay algo mandando además del clima, y la app nombra a los sospechosos.',
  },
  {
    titulo: 'Las cautelas se pueden desplegar en pantalla y se imprimen enteras',
    texto:
      'En el mapa, cada advertencia va en una línea con un «por qué» que se abre. En el informe no hay nada plegado: todo lo que la app tiene para advertir se imprime completo, porque el papel se lee sin hacer clic.',
  },
];

/* ─── 05 · Lo que acequia no hace ─────────────────────────────────────────── */

export const LIMITES: string[] = [
  'No hace mensura ni define límites de propiedad. No tiene validez catastral ni registral.',
  'No tasa. No dice cuánto vale un campo ni cuánto valdría después de la intervención.',
  'No reemplaza el cálculo hidráulico de una obra. Una represa se predimensiona acá y se calcula con un profesional antes de mover tierra.',
  'No reemplaza la calicata ni el análisis de laboratorio. La estimación de suelo sirve para dimensionar y para saber qué ir a buscar.',
  'No conoce la normativa local: ordenamiento territorial, retiros, servidumbres, habilitaciones ni estudios de impacto ambiental.',
  'No pronostica. Trabaja con series históricas y con lo que esas series dicen del clima que viene, que no es lo mismo que decir qué va a pasar el año próximo.',
  'No reemplaza caminar el campo. Es la lectura previa que hace que caminarlo rinda.',
];

/* ─── 06 · Si algo no aparece ─────────────────────────────────────────────── */

export interface Sintoma {
  sintoma: string;
  porque: string;
  hacer: string;
}

export const SINTOMAS: Sintoma[] = [
  {
    sintoma: 'Abro un panel de diseño y está vacío, o me manda a calcular otra cosa',
    porque: 'Casi siempre falta una de las dos raíces: el clima o el relieve. La mitad de la app se apoya en ellas.',
    hacer: 'Calculá Clima y Topografía y el resto se enciende solo.',
  },
  {
    sintoma: 'No aparece ninguna curva de nivel',
    porque:
      'El modelo de elevación tiene un paso, y por debajo de esa distancia lo que se dibujaría es interpolación, no relieve. En un predio chico y plano puede no haber una sola curva que dibujar con el intervalo pedido.',
    hacer: 'Probá un intervalo mayor. La app avisa hasta dónde llega el dato en vez de dibujar una curva inventada.',
  },
  {
    sintoma: 'La topografía se corta y me pide plan',
    porque: 'La muestra gratis de relieve está acotada por tamaño de predio, no por función.',
    hacer: 'Un predio de verdad pide un plan pago; el detalle está en la sección de planes.',
  },
  {
    sintoma: 'El clima no coincide con mi estación meteorológica',
    porque:
      'Son cosas distintas. Una estación mide un punto; la grilla satelital promedia una celda de varios kilómetros. Y la temperatura viene referida a la altura media de esa celda: en zona de montaña, la celda puede estar varios cientos de metros más abajo o más arriba que tu predio, y ahí la diferencia se vuelve grande.',
    hacer: 'Si tenés serie propia, calibrá la lluvia con tu estación: queda registrado en el anexo del informe.',
  },
  {
    sintoma: 'El suelo no coincide con mi análisis de laboratorio',
    porque: 'La estimación satelital promedia unos 250 metros y no conoce tu lote en particular.',
    hacer:
      'Creele al laboratorio. Usá el panel para lo que sirve: entender por qué el suelo salió así, y qué esperarías si el clima mandara solo.',
  },
  {
    sintoma: 'El entorno no muestra nada alrededor',
    porque: 'La app lee mapas colaborativos abiertos, y la cobertura varía muchísimo según la región.',
    hacer: 'Leé el vacío como «no está mapeado», nunca como «no hay».',
  },
];

/* ─── 07 · Glosario ───────────────────────────────────────────────────────── */

export interface TerminoGlosario {
  termino: string;
  definicion: string;
}

export const GLOSARIO: TerminoGlosario[] = [
  { termino: 'ETP — evapotranspiración potencial', definicion: 'Cuánta agua se evaporaría del suelo y de las plantas si nunca faltara. Es la demanda de la atmósfera, en milímetros.' },
  { termino: 'ETc y Kc', definicion: 'La ETP ajustada a un cultivo concreto. El Kc es el coeficiente de ese cultivo en cada etapa: un maíz en pleno crecimiento pide más que un olivo.' },
  { termino: 'Balance hídrico', definicion: 'Lluvia menos ETP, mes a mes. Positivo significa que sobra agua y se lava el suelo; negativo, que falta y las sales suben.' },
  { termino: 'Índice de aridez', definicion: 'Lluvia anual dividida por la ETP anual. Es el número que separa un clima húmedo de uno semiárido o árido.' },
  { termino: 'Köppen', definicion: 'La clasificación climática más usada del mundo. Tres letras que resumen temperatura, estacionalidad de la lluvia y verano.' },
  { termino: 'DEM — modelo digital de elevación', definicion: 'Una grilla de alturas. Todo lo topográfico sale de ahí: curvas, escorrentías, cuencas, sombras.' },
  { termino: 'Paso o resolución', definicion: 'La distancia entre dos puntos vecinos del modelo. Un DEM de 30 m no puede ver un terraplén de 3 m.' },
  { termino: 'Escorrentía', definicion: 'El agua que no infiltra y corre por la superficie. Las líneas de escorrentía marcan por dónde va.' },
  { termino: 'Cuenca de aporte', definicion: 'Toda la superficie que drena hacia un punto. Es lo que define cuánta agua le llega a una represa.' },
  { termino: 'Tiempo de concentración', definicion: 'Cuánto tarda el agua del punto más lejano de la cuenca en llegar al cierre. Define el pico de la crecida.' },
  { termino: 'Curva Número (CN)', definicion: 'Método que combina tipo de suelo y cobertura para estimar cuánto de una lluvia escurre y cuánto infiltra.' },
  { termino: 'Tormenta de diseño', definicion: 'La lluvia contra la que dimensionás la obra, elegida por período de retorno: «la que se repite una vez cada diez años».' },
  { termino: 'Caudal pico', definicion: 'El máximo instantáneo de esa crecida. Es lo que define el vertedero, no el volumen total.' },
  { termino: 'Keyline y keypoint', definicion: 'El keypoint es el punto donde el valle cambia de cóncavo a convexo. Las líneas clave arrancan ahí y llevan agua del valle hacia las lomas.' },
  { termino: 'Swale', definicion: 'Zanja a nivel con camellón, hecha para frenar el agua e infiltrarla en la ladera en vez de dejarla correr.' },
  { termino: 'Zonas 0 a 5', definicion: 'Ordenamiento por frecuencia de visita: la 0 es la casa, la 5 es el monte al que casi no vas. Ahorra caminatas y define qué se pone dónde.' },
  { termino: 'Sector', definicion: 'Una energía que entra al predio desde afuera y no se controla: sol, viento, fuego, ruido, inundación. Se diseña para recibirla o para desviarla.' },
  { termino: 'Escala de Permanencia', definicion: 'El orden de Yeomans, de lo más difícil de cambiar a lo más fácil: clima, forma del terreno, agua, caminos, árboles, estructuras, subdivisión, suelo. Es el orden del riel de /mapa.' },
  { termino: 'Receptividad', definicion: 'Cuántos animales sostiene un campo sin degradarse. Depende de cuánto forraje crece, que depende sobre todo de la lluvia.' },
  { termino: 'Materia seca', definicion: 'El forraje descontando el agua. Es la unidad en que se mide lo que realmente come un animal.' },
  { termino: 'Carbono orgánico vs. materia orgánica', definicion: 'No son lo mismo y confundirlos multiplica por dos. La materia orgánica es aproximadamente el doble del carbono orgánico.' },
  { termino: 'Densidad aparente', definicion: 'Cuánto pesa un volumen de suelo con sus poros incluidos. Sin ella no se puede pasar de concentración a stock.' },
  { termino: 'Agua útil', definicion: 'El agua que el suelo retiene y la planta puede sacar. Depende de la textura, y define cada cuántos días hay que regar.' },
  { termino: 'Lámina neta y bruta', definicion: 'Los milímetros que tiene que llegar a la raíz (neta) y los que hay que aplicar contando las pérdidas del sistema (bruta).' },
  { termino: 'Material parental', definicion: 'El material sobre el que se formó el suelo. No siempre es la roca de abajo: en buena parte de la tierra agrícola es un depósito de viento, de río o de ladera.' },
  { termino: 'Ecorregión', definicion: 'Una unidad de vegetación y fauna con historia propia. Es más fina que el bioma y es la que define qué especies tienen sentido acá.' },
  { termino: 'Cut & fill', definicion: 'El balance entre lo que se excava y lo que se rellena. Una obra equilibrada no necesita traer ni sacar tierra.' },
  { termino: 'Período de recupero', definicion: 'En cuánto tiempo la inversión se paga con lo que genera o con lo que deja de costar.' },
];

/* ─── 08 · Los planes ─────────────────────────────────────────────────────── */

/**
 * El nombre humano de cada permiso. Es un `Record` completo a propósito: si
 * mañana se agrega una feature a `AcequiaFeature`, TypeScript obliga a
 * nombrarla acá antes de compilar, y la guía no puede quedarse corta en
 * silencio.
 */
export const ROTULO_FEATURE: Record<AcequiaFeature, string> = {
  'catastro.rumbos':          'Rumbos y replanteo de mojones',
  'analisis.topo':            'Relieve, curvas de nivel y vista 3D',
  'analisis.topo_sin_limite': 'El mismo relieve, en un predio de cualquier tamaño',
  'analisis.clima':           'Clima del sitio y calendario',
  'analisis.contexto':        'Ecorregión, saberes del territorio y análogos climáticos',
  'analisis.entorno':         'Biodiversidad registrada y contexto del entorno',
  'analisis.suelo':           'Perfil de suelo, roca madre y por qué el suelo es así',
  'analisis.cobertura':       'Cobertura actual del terreno',
  'analisis.hidrico':         'Análisis hídrico de escorrentías',
  'analisis.solar':           'Arco solar y horas de sol',
  'analisis.sombras':         'Sombras del relieve por hora y estación',
  'analisis.visibilidad':     'Cuenca visual desde un punto',
  'analisis.produccion':      'Potencial de cultivo y de ganadería',
  'analisis.aptitud':         'Aptitud de uso del terreno',
  'analisis.carbono':         'Carbono del suelo y captura potencial',
  'diseno.agua':              'Captación de agua de lluvia',
  'diseno.zonas':             'Zonas de permacultura',
  'diseno.sectores':          'Sectores de energía (sol, viento, fuego)',
  'diseno.aguadas':           'Represas, aguadas y bebederos',
  'diseno.caminos':           'Trazado de caminos',
  'diseno.red':               'Red de servicios y dimensionado hidráulico',
  'diseno.cuenca':            'Cuenca de aporte y tormenta de diseño',
  'diseno.pastoreo':          'Pastoreo rotativo y calendario',
  'diseno.riego':             'Dimensionado del riego',
  'diseno.keyline':           'Patrón keyline',
  'diseno.economia':          'Presupuesto y retorno',
  'sugerencias':              'Master Plan y sugerencias automáticas',
  'informe.sin_marca':        'Informe sin marca de agua',
  'informe.white_label':      'Informe con tu logo y tus datos',
  'export.gis':               'Exportar a GeoJSON, KML y GPX',
  'export.dxf':               'Exportar a DXF para CAD',
  'colaboracion':             'Varias cuentas sobre el mismo estudio',
};

/* ─── 09 · De dónde sale el relieve ───────────────────────────────────────── */

/**
 * Dónde aplica cada fuente de relieve. Las etiquetas, el paso y la línea de
 * atribución NO se escriben acá: se importan de `grillaElevacion.ts`, que es
 * donde la app las usa de verdad. Esto sólo agrega el territorio, que el módulo
 * de cálculo no necesita saber.
 *
 * Es un `Record` completo: una fuente nueva no compila hasta que alguien dice
 * dónde se usa.
 */
export const TERRITORIO_DEM: Record<FuenteRelieve, string | null> = {
  glo30:     'Todo el planeta, por defecto',
  usgs3dep:  'Estados Unidos, incluidos Alaska y Hawái',
  ignfr:     'Francia metropolitana',
  ignes:     'España peninsular y Baleares',
  hrdemca:   'Canadá, donde hubo vuelo LiDAR',
  ahnnl:     'Todo el territorio de Países Bajos',
  swisstopo: 'Todo el territorio de Suiza',
  usuario:   'Donde vos lo importes — tiene prioridad sobre todos los demás',
  srtm30:    null,   // heredado; ya no se elige
  terrarium: null,   // respaldo interno
};

/** Dónde bajar el modelo oficial en países que todavía no servimos solos. */
export const DEM_PARA_IMPORTAR: Array<{ pais: string; fuente: string; donde: string }> = [
  { pais: 'Argentina', fuente: 'IGN — MDE-Ar, 5 m', donde: 'ign.gob.ar, descarga por hojas' },
  { pais: 'Brasil',    fuente: 'INPE — TOPODATA, 30 m', donde: 'dsr.inpe.br/topodata' },
  { pais: 'México',    fuente: 'INEGI — Continuo de Elevaciones Mexicano, 15 m', donde: 'inegi.org.mx' },
  { pais: 'Chile',     fuente: 'ALOS PALSAR, 12,5 m', donde: 'search.asf.alaska.edu' },
  { pais: 'Italia',    fuente: 'INGV — TINITALY, 10 m', donde: 'tinitaly.pi.ingv.it' },
  { pais: 'Portugal',  fuente: 'DGT — MDT, 0,5 a 2 m por zonas', donde: 'dgterritorio.gov.pt' },
];

/* ─── 10 · Capturas ───────────────────────────────────────────────────────── */

/** Las capturas viven en `public/img/guia/`. Ver el README de esa carpeta. */
export const CAPTURAS: Array<{ archivo: string; alt: string }> = [
  { archivo: 'clima.webp',      alt: 'Panel de clima con lluvia y balance hídrico' },
  { archivo: 'topografia.webp', alt: 'Topografía con curvas de nivel' },
  { archivo: 'vista3d.webp',    alt: 'Vista 3D del relieve con el diseño encima' },
  { archivo: 'sectores.webp',   alt: 'Sectores de energía: sol, viento y fuego' },
  { archivo: 'aguadas.webp',    alt: 'Represa de ladera y aguadas' },
  { archivo: 'caminos.webp',    alt: 'Caminos con su perfil de elevación' },
  { archivo: 'reddeagua.webp',  alt: 'Red de agua con el dimensionado de la tubería' },
  { archivo: 'informe.webp',    alt: 'Una página del informe generado' },
];
