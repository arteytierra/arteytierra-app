/**
 * Artefactos y demanda de una red de agua.
 *
 * Responde la pregunta de diseño: "si abro todas las llaves, ¿cuánta agua pide
 * la instalación?" — y sobre todo la que importa de verdad, que es otra:
 * ¿cuánta agua hay que hacer circular por el caño?
 *
 * No son lo mismo. La suma de los caudales de todos los artefactos (el máximo
 * teórico) casi nunca ocurre: nadie usa la ducha, la cocina, el lavarropas y la
 * manguera en el mismo segundo. Dimensionar por esa suma da caños carísimos y
 * con velocidad tan baja que sedimentan. Por eso se usa un caudal *simultáneo*
 * (o "de diseño"), que es el que tiene una probabilidad razonable de no ser
 * superado.
 *
 * Método principal: unidades de gasto de Hunter (Roy B. Hunter, "Methods for
 * Estimating Loads in Plumbing Systems", NBS Report BMS65, 1940), que sigue
 * siendo la base de los códigos de instalaciones sanitarias. Cada artefacto
 * vale una cantidad de unidades de gasto (UG) según cuánta agua usa y cada
 * cuánto; la curva de Hunter convierte las UG totales en el caudal probable.
 *
 * Método de contraste: coeficiente de simultaneidad K = 1/√(n−1) (norma
 * francesa NF P 41-201, muy usado en instalaciones chicas), aplicado sobre la
 * suma de caudales instantáneos.
 *
 * Los artefactos de uso *continuo* (riego, bebederos, llenado de tanque) no
 * entran en ninguna simultaneidad: cuando están abiertos, están, y se suman
 * aparte.
 *
 * ── Y un segundo nivel de simultaneidad, que faltaba ────────────────────────
 *
 * Todo lo de arriba responde «¿cuánta agua pide UNA vivienda?». Una red que
 * alimenta diez cabañas no se dimensiona como diez redes de una: las diez no
 * tienen el pico a la misma hora, igual que los artefactos de una casa no se
 * abren todos juntos. Es el mismo razonamiento aplicado un nivel más arriba, y
 * tiene su propio coeficiente publicado. Ver `simultaneidadConjunto`.
 *
 * Valores orientativos de diseño preliminar.
 */

export type CategoriaArtefacto = 'domestico' | 'riego' | 'produccion';

export interface Artefacto {
  id:        string;
  nombre:    string;
  categoria: CategoriaArtefacto;
  /** Caudal del artefacto abierto al máximo (L/s). */
  caudal_ls: number;
  /** Unidades de gasto de Hunter. 0 en los de uso continuo (no aplica). */
  ug:        number;
  /** Presión de servicio mínima para que funcione bien (m.c.a.). */
  presion_min_mca: number;
  /** Uso continuo: se suma sin simultaneidad. */
  continuo?: boolean;
  nota?:     string;
}

// ─── Catálogo doméstico ───────────────────────────────────────────────────────
// Caudales y UG: Hunter (BMS65) y tablas de instalación sanitaria domiciliaria,
// para artefactos con depósito (no válvula de descarga automática).

export const ARTEFACTOS_DOMESTICOS: Artefacto[] = [
  { id: 'canilla_cocina',   nombre: 'Canilla de cocina',              categoria: 'domestico', caudal_ls: 0.20, ug: 2, presion_min_mca: 2 },
  { id: 'lavatorio',        nombre: 'Lavatorio / lavamanos',          categoria: 'domestico', caudal_ls: 0.10, ug: 1, presion_min_mca: 2 },
  { id: 'bidet',            nombre: 'Bidet',                          categoria: 'domestico', caudal_ls: 0.10, ug: 1, presion_min_mca: 2 },
  { id: 'inodoro_deposito', nombre: 'Inodoro con depósito',           categoria: 'domestico', caudal_ls: 0.10, ug: 3, presion_min_mca: 2 },
  { id: 'inodoro_valvula',  nombre: 'Inodoro con válvula de descarga', categoria: 'domestico', caudal_ls: 1.25, ug: 6, presion_min_mca: 10, nota: 'Poco común en vivienda rural: exige mucha presión y caño grueso.' },
  { id: 'ducha',            nombre: 'Ducha',                          categoria: 'domestico', caudal_ls: 0.20, ug: 2, presion_min_mca: 5 },
  { id: 'banera',           nombre: 'Bañera',                         categoria: 'domestico', caudal_ls: 0.30, ug: 2, presion_min_mca: 3 },
  { id: 'pileta_lavar',     nombre: 'Pileta de lavar (lavadero)',     categoria: 'domestico', caudal_ls: 0.20, ug: 2, presion_min_mca: 2 },
  { id: 'lavarropas',       nombre: 'Lavarropas',                     categoria: 'domestico', caudal_ls: 0.20, ug: 2, presion_min_mca: 3 },
  { id: 'lavavajillas',     nombre: 'Lavavajillas',                   categoria: 'domestico', caudal_ls: 0.15, ug: 1, presion_min_mca: 3 },
  { id: 'canilla_servicio', nombre: 'Canilla de servicio (manguera)', categoria: 'domestico', caudal_ls: 0.35, ug: 3, presion_min_mca: 3 },
  { id: 'pileta_nat',       nombre: 'Reposición de pileta',           categoria: 'domestico', caudal_ls: 0.30, ug: 0, presion_min_mca: 2, continuo: true, nota: 'Llenado lento y prolongado: se cuenta como consumo continuo.' },
];

// ─── Catálogo de producción ───────────────────────────────────────────────────

export const ARTEFACTOS_PRODUCCION: Artefacto[] = [
  { id: 'bebedero_flotante',    nombre: 'Bebedero automático a flotante', categoria: 'produccion', caudal_ls: 0.10, ug: 2, presion_min_mca: 3, nota: 'Repone mientras los animales toman; con rodeo grande conviene tratarlo como continuo.' },
  { id: 'bebedero_australiano', nombre: 'Llenado de tanque australiano',  categoria: 'produccion', caudal_ls: 0.50, ug: 0, presion_min_mca: 2, continuo: true },
  { id: 'sala_ordene',          nombre: 'Lavado de sala de ordeñe',       categoria: 'produccion', caudal_ls: 0.60, ug: 4, presion_min_mca: 10 },
  { id: 'manga_lavado',         nombre: 'Manguera de lavado 1 pulgada',   categoria: 'produccion', caudal_ls: 0.60, ug: 4, presion_min_mca: 10 },
  { id: 'incendio',             nombre: 'Toma de incendio',               categoria: 'produccion', caudal_ls: 3.30, ug: 0, presion_min_mca: 25, continuo: true, nota: 'No se suma al uso normal: se verifica aparte, como caso crítico.' },
];

// ─── Catálogo de riego ────────────────────────────────────────────────────────
// Todos de uso continuo: mientras el turno de riego corre, el caudal está.

export const ARTEFACTOS_RIEGO: Artefacto[] = [
  { id: 'gotero_2',      nombre: 'Gotero autocompensado 2 L/h',      categoria: 'riego', caudal_ls: 2 / 3600,     ug: 0, presion_min_mca: 10, continuo: true },
  { id: 'gotero_4',      nombre: 'Gotero autocompensado 4 L/h',      categoria: 'riego', caudal_ls: 4 / 3600,     ug: 0, presion_min_mca: 10, continuo: true },
  { id: 'gotero_8',      nombre: 'Gotero autocompensado 8 L/h',      categoria: 'riego', caudal_ls: 8 / 3600,     ug: 0, presion_min_mca: 10, continuo: true },
  { id: 'cinta_100m',    nombre: 'Cinta de goteo, cada 100 m',       categoria: 'riego', caudal_ls: 500 / 3600,   ug: 0, presion_min_mca: 8,  continuo: true, nota: '1 L/h por emisor cada 0,20 m ≈ 500 L/h cada 100 m de cinta.' },
  { id: 'exudante_100m', nombre: 'Manguera exudante, cada 100 m',    categoria: 'riego', caudal_ls: 400 / 3600,   ug: 0, presion_min_mca: 3,  continuo: true },
  { id: 'microasp_40',   nombre: 'Microaspersor 40 L/h',             categoria: 'riego', caudal_ls: 40 / 3600,    ug: 0, presion_min_mca: 15, continuo: true },
  { id: 'microasp_70',   nombre: 'Microaspersor 70 L/h',             categoria: 'riego', caudal_ls: 70 / 3600,    ug: 0, presion_min_mca: 15, continuo: true },
  { id: 'nebulizador',   nombre: 'Nebulizador de invernadero 7 L/h', categoria: 'riego', caudal_ls: 7 / 3600,     ug: 0, presion_min_mca: 25, continuo: true },
  { id: 'aspersor_500',  nombre: 'Aspersor sectorial 500 L/h',       categoria: 'riego', caudal_ls: 500 / 3600,   ug: 0, presion_min_mca: 20, continuo: true },
  { id: 'aspersor_1500', nombre: 'Aspersor de impacto 1500 L/h',     categoria: 'riego', caudal_ls: 1500 / 3600,  ug: 0, presion_min_mca: 25, continuo: true },
  { id: 'canon',         nombre: 'Cañón de riego 10 m³/h',           categoria: 'riego', caudal_ls: 10000 / 3600, ug: 0, presion_min_mca: 40, continuo: true },
  { id: 'hidrante',      nombre: 'Hidrante de riego 2 pulgadas',     categoria: 'riego', caudal_ls: 5.0,          ug: 0, presion_min_mca: 15, continuo: true },
  { id: 'pulverizadora', nombre: 'Carga de pulverizadora',           categoria: 'riego', caudal_ls: 1.5,          ug: 0, presion_min_mca: 10, continuo: true },
];

export const ARTEFACTOS: Artefacto[] = [
  ...ARTEFACTOS_DOMESTICOS, ...ARTEFACTOS_PRODUCCION, ...ARTEFACTOS_RIEGO,
];

export function artefactoPorId(id: string): Artefacto | null {
  return ARTEFACTOS.find(a => a.id === id) ?? null;
}

// ─── Curva de Hunter ──────────────────────────────────────────────────────────
// UG totales → caudal probable, para sistemas con predominio de artefactos con
// depósito. Tabla original en gpm; se interpola linealmente entre puntos.

const HUNTER_GPM: Array<[ug: number, gpm: number]> = [
  [1, 3.0], [2, 5.0], [3, 6.5], [4, 8.0], [5, 9.4], [6, 10.7], [7, 11.8],
  [8, 12.8], [9, 13.7], [10, 14.6], [12, 16.0], [14, 17.0], [16, 18.0],
  [18, 18.8], [20, 19.6], [25, 21.5], [30, 23.3], [35, 24.9], [40, 26.3],
  [45, 27.7], [50, 29.1], [60, 32.0], [70, 35.0], [80, 38.0], [90, 41.0],
  [100, 43.5], [120, 48.0], [140, 52.5], [160, 57.0], [180, 61.0], [200, 65.0],
  [250, 75.0], [300, 85.0], [400, 105.0], [500, 124.0], [750, 170.0], [1000, 208.0],
];

const GPM_A_LS = 0.0630902;

/** Caudal probable (L/s) para un total de unidades de gasto. */
export function caudalHunter_ls(ug: number): number {
  if (ug <= 0) return 0;
  const t = HUNTER_GPM;
  const pri = t[0]!;
  const ult = t[t.length - 1]!;
  if (ug <= pri[0]) return pri[1] * GPM_A_LS * (ug / pri[0]);
  if (ug >= ult[0]) return ult[1] * GPM_A_LS * (ug / ult[0]);
  for (let i = 1; i < t.length; i++) {
    const [ug1, q1] = t[i]!;
    if (ug <= ug1) {
      const [ug0, q0] = t[i - 1]!;
      const f = (ug - ug0) / (ug1 - ug0);
      return (q0 + f * (q1 - q0)) * GPM_A_LS;
    }
  }
  return ult[1] * GPM_A_LS;
}

/**
 * Piso del coeficiente de artefactos. **No es publicado: es de acequia.** Con
 * la mayoración de hora punta recién muerde arriba de 37 artefactos en el mismo
 * tramo, que en una vivienda rural no pasa; está para que un número grande de
 * artefactos no haga tender el caudal de diseño a cero. Si alguna vez muerde,
 * `demandaRed` lo avisa.
 */
export const COEF_SIMULTANEIDAD_PISO = 0.2;

/**
 * Mayoración por hora punta del coeficiente de artefactos: **+20 %**.
 *
 * Acá las dos fuentes que publican la misma fórmula no coinciden, y la
 * discrepancia se deja a la vista en vez de resolverla por decreto. El material
 * de la Universidad Politécnica de Cartagena lo pide explícitamente —*«este
 * valor de Kp calculado mediante la fórmula se debe aumentar en un 20 % del
 * resultado para constituir así un factor de seguridad frente a posible uso de
 * la instalación en horas punta»*— y el material del Govern de les Illes
 * Balears publica la misma expresión sin mayoración ninguna.
 *
 * Por eso `demandaRed` informa los dos números. El caudal de diseño no cambia:
 * lo manda Hunter, y éste es el método de contraste.
 */
export const MAYORACION_HORA_PUNTA = 1.20;

/** Coeficiente de simultaneidad de artefactos, K = 1/√(n−1) (NF P 41-201). */
export function coefSimultaneidad(n: number): number {
  if (n <= 1) return 1;
  return Math.min(1, Math.max(COEF_SIMULTANEIDAD_PISO, 1 / Math.sqrt(n - 1)));
}

/** El mismo coeficiente con la mayoración de hora punta. Ver `MAYORACION_HORA_PUNTA`. */
export function coefSimultaneidadMayorado(n: number): number {
  if (n <= 1) return 1;
  return Math.min(1, coefSimultaneidad(n) * MAYORACION_HORA_PUNTA);
}

// ─── Simultaneidad entre viviendas de un conjunto ─────────────────────────────

/**
 * El coeficiente que faltaba: la simultaneidad **entre viviendas** de una red.
 *
 * El de arriba responde cuántos artefactos de una casa se abren juntos. Éste
 * responde cuántas casas del conjunto tienen su pico al mismo tiempo, y es el
 * que hace que la red de un loteo, de las cabañas o de las casas del personal
 * no se dimensione como N redes de una. La hidráulica sanitaria lo llama **Kv**
 * —el de artefactos es Ke— y se calcula así:
 *
 *     Kv = (19 + N) / (10 · (N + 1))
 *
 * **Fuente leída:** Vázquez Arenas, G., «Instalaciones I», tema 1, 3ª parte
 * (Universidad Politécnica de Cartagena, OpenCourseWare), apartado
 * «Coeficiente de simultaneidad en viviendas de igual tipo», contrastada con el
 * material de formación del Govern de les Illes Balears, que publica la misma
 * expresión y la misma distinción entre Kv y Ke. Ninguno de los dos nombra una
 * norma para Kv, y eso queda escrito acá: lo que hay es la expresión publicada
 * con sus condiciones, no un número de norma.
 *
 * ── Las cuatro cosas que el plan de esta corrección no decía ────────────────
 *
 * **1. Hay un piso publicado: `Kv ≥ 0,25`.** La fórmula sola tiende a 0,10
 * cuando N crece, así que **por abajo se escapa del rango en el que la
 * publicaron**. Y se escapa enseguida: el cruce es exacto en N = 11, donde
 * `Kv = 30/120 = 0,25` justo. Desde N = 12 la fórmula cruda queda por debajo
 * del piso, y a 50 viviendas da 0,135 contra 0,25, o sea **un 46 % menos de
 * caudal de diseño**: un caño calculado para la mitad del agua. Es la falla
 * típica de acequia —un número plausible y equivocado, del lado barato— y es
 * lo que el apartado llamaba «una línea de código».
 *
 * **2. La fórmula es para un CONJUNTO de viviendas IGUALES.** *«Este
 * coeficiente se aplicará al número de viviendas iguales, es decir no habrá 15
 * viviendas iguales sino que se considerará que habrá 15·Kv viviendas.»* Ocho
 * cabañas más la casa principal no son un conjunto de nueve: son dos conjuntos,
 * cada uno con su N y su Kv. Ver `demandaConjunto`.
 *
 * **3. Hay un umbral, y el ejemplo del curso cae justo en el borde.** *«Este
 * coeficiente de simultaneidad se aplicará cuando el número de viviendas en un
 * edificio sea superior a 10»*, y *«se omitirá su cálculo […] en las
 * instalaciones interiores cuando el número de viviendas sea menor de 10»*. Las
 * dos oraciones acotan el umbral a **edificios e instalaciones interiores**, y
 * la misma fuente dice que el coeficiente *«resulta principalmente práctico en
 * el cálculo de las redes urbanas»*, que es el caso de un loteo. Así que para
 * una red acequia lo aplica, pero avisa: el ejemplo de las diez cabañas del
 * curso, con su 0,26, está exactamente en el borde de lo que la fuente discute.
 *
 * **4. Y es para redes, no para la cañería de adentro de una casa.** No
 * reemplaza al de artefactos: se aplica **encima**, sobre el caudal ya
 * simultáneo de cada vivienda.
 */
export const FUENTE_SIMULTANEIDAD_CONJUNTO =
  'Vázquez Arenas, G., «Instalaciones I», tema 1, 3ª parte (UPCT OpenCourseWare), «Coeficiente de simultaneidad en viviendas de igual tipo»; contrastada con el material de formación del Govern de les Illes Balears';

/** Piso publicado del coeficiente de conjunto. */
export const KV_MINIMO = 0.25;

/** N a partir del cual la fuente lo da por aplicable en un edificio. */
export const VIVIENDAS_UMBRAL_EDIFICIO = 10;

/** N en el que la fórmula cruda toca el piso publicado. Desde 12 queda abajo. */
export const VIVIENDAS_PISO_EXACTO = 11;

export interface SimultaneidadConjunto {
  viviendas:    number;
  /** El coeficiente que se usa: la fórmula, acotada al piso publicado. */
  kv:           number;
  /** La fórmula sola, sin acotar. Se informa para que la diferencia se vea. */
  kvCrudo:      number;
  /** true si el piso de 0,25 tuvo que corregir la fórmula hacia arriba. */
  pisoAplicado: boolean;
  /**
   * Viviendas equivalentes, `N · Kv`. Es la forma en que la fuente lo plantea:
   * «no habrá 15 viviendas iguales sino que se considerará que habrá 15·Kv».
   */
  equivalentes: number;
  fuente:       string;
  nota:         string;
  advertencias: string[];
}

/**
 * Kv para un conjunto de `viviendas` iguales colgadas de la misma red.
 *
 * Devuelve `kv = 1` para una vivienda o menos: ahí no hay conjunto, y el
 * coeficiente que corresponde es el de los artefactos.
 */
export function simultaneidadConjunto(viviendas: number): SimultaneidadConjunto {
  const N = Math.max(0, Math.round(viviendas));
  const advertencias: string[] = [];
  const r3 = (v: number) => Math.round(v * 1000) / 1000;

  if (N <= 1) {
    return {
      viviendas: N, kv: 1, kvCrudo: 1, pisoAplicado: false, equivalentes: N,
      fuente: FUENTE_SIMULTANEIDAD_CONJUNTO,
      nota: 'Una sola vivienda: no hay conjunto. La simultaneidad que corresponde acá es la de los artefactos.',
      advertencias,
    };
  }

  const crudo = (19 + N) / (10 * (N + 1));
  const kv = Math.min(1, Math.max(KV_MINIMO, crudo));
  const piso = crudo < KV_MINIMO;

  if (piso) {
    const menos = Math.round((1 - crudo / KV_MINIMO) * 100);
    advertencias.push(
      `Con ${N} viviendas la fórmula sola da ${r3(crudo)}, por debajo del piso publicado de ${KV_MINIMO}: ` +
      `se usa el piso. Sin él el caño saldría dimensionado para un ${menos} % menos de caudal.`);
  }
  if (N <= VIVIENDAS_UMBRAL_EDIFICIO) {
    advertencias.push(
      `La fuente da este coeficiente por aplicable en un edificio cuando las viviendas pasan de ` +
      `${VIVIENDAS_UMBRAL_EDIFICIO}, y acá son ${N}. En una red —un loteo, cabañas— dice que es donde más ` +
      'sirve, así que acequia lo aplica, pero con este tamaño de conjunto estás en el borde de lo que ' +
      'la fuente discute: si la red es corta y las casas se usan a la misma hora, conviene no descontar nada.');
  }

  const nota =
    `${N} viviendas iguales en la misma red valen ${r3(N * kv)} viviendas a la hora de dimensionar el caño: ` +
    `el coeficiente es ${r3(kv)}${piso ? ' (el piso publicado, porque la fórmula se le va por abajo)' : ''}. ` +
    'Se aplica ENCIMA de la simultaneidad de los artefactos de cada vivienda, no en su lugar.';

  return {
    viviendas: N, kv: r3(kv), kvCrudo: r3(crudo), pisoAplicado: piso,
    equivalentes: r3(N * kv),
    fuente: FUENTE_SIMULTANEIDAD_CONJUNTO, nota, advertencias,
  };
}

// ─── Demanda de la red ────────────────────────────────────────────────────────

export interface ItemArtefacto {
  artefactoId: string;
  cantidad:    number;
}

export interface DemandaRed {
  /** Todas las llaves abiertas al mismo tiempo: suma cruda (L/s). */
  maximo_ls:       number;
  /** Caudal de diseño: el que hay que hacer circular por el caño (L/s). */
  diseno_ls:       number;
  /** Los dos métodos, para poder compararlos. */
  hunter_ls:       number;
  raiz_ls:         number;
  /** El de la raíz con la mayoración de hora punta. Ver `MAYORACION_HORA_PUNTA`. */
  raizMayorada_ls: number;
  /** Consumos de uso continuo (riego, llenado), sumados sin simultaneidad. */
  continuo_ls:     number;
  ug_total:        number;
  n_intermitentes: number;
  n_total:         number;
  /** La presión de servicio más exigente de todo lo conectado (m.c.a.). */
  presion_min_mca: number;
  /** Artefacto que impone esa presión. */
  presion_manda:   string | null;
  metodo:          string;
  nota:            string;
  /** Lo que el usuario tiene que saber y la pantalla no muestra sola. */
  advertencias:    string[];
}

/**
 * Calcula la demanda de una lista de artefactos.
 *
 * El caudal de diseño es el mayor entre el de Hunter y el del artefacto más
 * grande de la lista — el caño tiene que poder abastecer al menos una canilla
 * abierta —, más los consumos continuos, que corren por afuera de toda
 * simultaneidad.
 */
export function demandaRed(items: ItemArtefacto[]): DemandaRed {
  let maximo = 0, continuo = 0, ug = 0, nInter = 0, nTotal = 0;
  let mayorIntermitente = 0;
  let sumaInter = 0;
  let presionMin = 0;
  let presionManda: string | null = null;

  for (const it of items) {
    const a = artefactoPorId(it.artefactoId);
    const n = Math.max(0, Math.round(it.cantidad));
    if (!a || n === 0) continue;
    nTotal += n;
    maximo += a.caudal_ls * n;
    if (a.presion_min_mca > presionMin) { presionMin = a.presion_min_mca; presionManda = a.nombre; }
    if (a.continuo) {
      continuo += a.caudal_ls * n;
    } else {
      ug += a.ug * n;
      nInter += n;
      sumaInter += a.caudal_ls * n;
      mayorIntermitente = Math.max(mayorIntermitente, a.caudal_ls);
    }
  }

  const hunter = caudalHunter_ls(ug);
  const raiz = sumaInter * coefSimultaneidad(nInter);
  const raizMayorada = sumaInter * coefSimultaneidadMayorado(nInter);
  const diseno = Math.max(hunter, mayorIntermitente) + continuo;

  const r3 = (v: number) => Math.round(v * 1000) / 1000;

  const advertencias: string[] = [];
  if (nInter > 1 && 1 / Math.sqrt(nInter - 1) < COEF_SIMULTANEIDAD_PISO) {
    advertencias.push(
      `Con ${nInter} artefactos intermitentes en el mismo tramo, el coeficiente de simultaneidad de la ` +
      `norma daría menos de ${COEF_SIMULTANEIDAD_PISO} y acá se usa ese piso, que es de acequia y no está ` +
      'publicado. Es una instalación grande para este método: a esa escala corresponde Hunter, que es el ' +
      'que manda el caudal de diseño igual.');
  }

  let nota: string;
  if (nTotal === 0) {
    nota = 'Agregá artefactos para que la app calcule el caudal.';
  } else if (continuo > 0 && nInter > 0) {
    nota = `De los ${nTotal} artefactos, ${nInter} son de uso intermitente (se les aplica simultaneidad) y el resto es consumo continuo, que se suma entero.`;
  } else if (continuo > 0) {
    nota = 'Todo el consumo es continuo (riego, llenado): no hay simultaneidad que descontar, se suma completo.';
  } else {
    nota = `Con ${nInter} artefactos la chance de que se abran todos juntos es baja: el caño se dimensiona por el caudal probable, no por la suma.`;
  }

  return {
    maximo_ls:       r3(maximo),
    diseno_ls:       r3(diseno),
    hunter_ls:       r3(hunter),
    raiz_ls:         r3(raiz),
    raizMayorada_ls: r3(raizMayorada),
    continuo_ls:     r3(continuo),
    ug_total:        ug,
    n_intermitentes: nInter,
    n_total:         nTotal,
    presion_min_mca: presionMin,
    presion_manda:   presionManda,
    metodo:          'Unidades de gasto de Hunter, con los consumos continuos sumados aparte',
    nota,
    advertencias,
  };
}

// ─── Demanda de una red que alimenta varias viviendas ─────────────────────────

export interface GrupoViviendas {
  /** Rótulo para la pantalla: «cabañas», «casas del personal»… */
  nombre:    string;
  /** Artefactos de UNA vivienda de este tipo. */
  items:     ItemArtefacto[];
  /** Cuántas viviendas IGUALES de este tipo cuelgan de la misma red. */
  viviendas: number;
}

export interface GrupoEvaluado {
  nombre:       string;
  viviendas:    number;
  /** La demanda de una sola vivienda del tipo. */
  porVivienda:  DemandaRed;
  kv:           SimultaneidadConjunto;
  /** Caudal intermitente de una vivienda, ya con la simultaneidad de artefactos. */
  intermitentePorVivienda_ls: number;
  /** Lo que el grupo le pide a la red (L/s), con Kv y con sus continuos. */
  aporte_ls:    number;
  /** Lo mismo sin Kv: N veces una vivienda. Para ver cuánto descuenta. */
  sinKv_ls:     number;
}

export interface DemandaConjunto {
  grupos:          GrupoEvaluado[];
  /** Caudal de diseño de la red del conjunto (L/s). */
  diseno_ls:       number;
  /** El mismo cálculo sin simultaneidad entre viviendas. */
  sinCoeficiente_ls: number;
  /** Consumos compartidos de la red (riego, llenado, incendio). */
  extras:          DemandaRed | null;
  viviendas_total: number;
  /** La presión de servicio más exigente de todo el conjunto (m.c.a.). */
  presion_min_mca: number;
  presion_manda:   string | null;
  metodo:          string;
  nota:            string;
  advertencias:    string[];
  fuentes:         string[];
}

/**
 * Lo que una red le tiene que llevar a un conjunto de viviendas.
 *
 * Son dos niveles de simultaneidad, uno encima del otro, y ése es el punto:
 * primero cuántos artefactos de una casa se abren juntos (Hunter), después
 * cuántas casas tienen el pico a la misma hora (`simultaneidadConjunto`).
 * Aplicar uno solo de los dos es lo que estaba mal; aplicar el de artefactos
 * dos veces también.
 *
 * **Grupos, no un total.** La fuente aplica Kv a un conjunto de viviendas
 * *iguales*, así que ocho cabañas y la casa principal son dos grupos con su N
 * cada uno. Lo que la fuente **no** dice es cómo combinar grupos distintos, y
 * acá no se inventa una regla: se suman los aportes, que es el lado
 * conservador —dos grupos de 8 y 2 piden más que uno de 10—. Queda escrito en
 * `advertencias` cuando hay más de un grupo.
 *
 * Los consumos continuos no entran en ninguna de las dos simultaneidades: se
 * suman enteros, por vivienda y por el `extras` compartido de la red.
 */
export function demandaConjunto(
  grupos: readonly GrupoViviendas[],
  extras: ItemArtefacto[] = [],
): DemandaConjunto {
  const r3 = (v: number) => Math.round(v * 1000) / 1000;
  const advertencias: string[] = [];

  const evaluados: GrupoEvaluado[] = [];
  let diseno = 0, sinCoef = 0, viviendasTotal = 0;
  let presionMin = 0, presionManda: string | null = null;

  for (const g of grupos) {
    const N = Math.max(0, Math.round(g.viviendas));
    if (N === 0 || g.items.length === 0) continue;
    const d = demandaRed(g.items);
    if (d.n_total === 0) continue;
    viviendasTotal += N;
    if (d.presion_min_mca > presionMin) { presionMin = d.presion_min_mca; presionManda = d.presion_manda; }

    // El caudal intermitente de UNA vivienda, ya simultáneo por Hunter. Sale de
    // restar los continuos del caudal de diseño: no hace falta otra cuenta.
    const inter = Math.max(0, d.diseno_ls - d.continuo_ls);
    const kv = simultaneidadConjunto(N);
    const aporte = inter * N * kv.kv + d.continuo_ls * N;
    const sin = (inter + d.continuo_ls) * N;

    diseno += aporte;
    sinCoef += sin;
    advertencias.push(...kv.advertencias.map(a => `${g.nombre}: ${a}`));
    evaluados.push({
      nombre: g.nombre, viviendas: N, porVivienda: d, kv,
      intermitentePorVivienda_ls: r3(inter),
      aporte_ls: r3(aporte), sinKv_ls: r3(sin),
    });
  }

  const dExtras = extras.length > 0 ? demandaRed(extras) : null;
  if (dExtras && dExtras.n_total > 0) {
    diseno += dExtras.diseno_ls;
    sinCoef += dExtras.diseno_ls;
    if (dExtras.presion_min_mca > presionMin) {
      presionMin = dExtras.presion_min_mca; presionManda = dExtras.presion_manda;
    }
    advertencias.push(...dExtras.advertencias);
  }

  if (evaluados.length > 1) {
    advertencias.push(
      'Hay más de un tipo de vivienda. La fuente aplica el coeficiente a un conjunto de viviendas IGUALES y ' +
      'no dice cómo combinar tipos distintos, así que acequia suma los aportes de cada grupo, que es el lado ' +
      'conservador: dos grupos de 8 y 2 piden más caño que un solo grupo de 10.');
  }

  let nota: string;
  if (evaluados.length === 0) {
    nota = 'Cargá los artefactos de una vivienda y cuántas iguales alimenta la red.';
  } else {
    const ahorro = sinCoef > 0 ? Math.round((1 - diseno / sinCoef) * 100) : 0;
    nota = viviendasTotal <= 1
      ? 'Con una sola vivienda no hay nada que descontar entre casas: el caudal es el de sus artefactos.'
      : `${viviendasTotal} viviendas en la red piden ${r3(diseno)} L/s, un ${ahorro} % menos que dimensionar ` +
        `${viviendasTotal} veces una vivienda (${r3(sinCoef)} L/s). No es un ahorro inventado: es que las casas ` +
        'no tienen el pico a la misma hora, el mismo argumento que ya se usa adentro de cada una.';
  }

  return {
    grupos: evaluados,
    diseno_ls: r3(diseno),
    sinCoeficiente_ls: r3(sinCoef),
    extras: dExtras,
    viviendas_total: viviendasTotal,
    presion_min_mca: presionMin,
    presion_manda: presionManda,
    metodo: 'Hunter adentro de cada vivienda, y el coeficiente de simultaneidad entre viviendas iguales por encima',
    nota, advertencias,
    fuentes: [
      'Hunter, R.B. (1940), «Methods for Estimating Loads in Plumbing Systems», NBS Report BMS65',
      FUENTE_SIMULTANEIDAD_CONJUNTO,
    ],
  };
}
