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

/** Coeficiente de simultaneidad K = 1/√(n−1) (NF P 41-201). */
export function coefSimultaneidad(n: number): number {
  if (n <= 1) return 1;
  return Math.min(1, Math.max(0.2, 1 / Math.sqrt(n - 1)));
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
  const diseno = Math.max(hunter, mayorIntermitente) + continuo;

  const r3 = (v: number) => Math.round(v * 1000) / 1000;

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
    continuo_ls:     r3(continuo),
    ug_total:        ug,
    n_intermitentes: nInter,
    n_total:         nTotal,
    presion_min_mca: presionMin,
    presion_manda:   presionManda,
    metodo:          'Unidades de gasto de Hunter, con los consumos continuos sumados aparte',
    nota,
  };
}
