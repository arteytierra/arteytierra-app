/**
 * Criterios de diseño: el contrato con el que acequia recomienda un número.
 *
 * El problema que resuelve. Hasta acá cada panel ofrecía sus parámetros como
 * deslizadores libres con un default arbitrario: la separación entre swales
 * arrancaba en 1,5 m porque sí, y el usuario podía pedir 10 m en una ladera del
 * 40% sin que nada se lo discutiera. La app calculaba con obediencia un disparate.
 * Eso contradice la promesa del producto: si mostramos las fuentes y los límites
 * de cada dato, no podemos aceptar en silencio un parámetro que la práctica
 * descarta.
 *
 * La regla de la casa, entonces, para todo parámetro de diseño:
 *
 *   1. Sale una RECOMENDACIÓN de una tabla o criterio con fuente citada.
 *   2. La recomendación trae un RANGO de trabajo (mínimo y máximo) — porque el
 *      profesional tiene contexto que la tabla no tiene, y hay que dejarlo jugar.
 *   3. Fuera de ese rango la app AVISA FUERTE y no deja seguir como si nada.
 *   4. Todo ajuste que hicimos sobre la tabla base queda escrito y visible.
 *
 * El tipo `Recomendacion` es ese contrato. Cualquier panel que dimensione algo
 * debería devolver uno, y `evaluar()` decide qué mostrar cuando el usuario se
 * corre del valor sugerido.
 *
 * Las tablas de este archivo son material aportado por Jonatan (curso "Diseño de
 * hidrología regenerativa"). Están transcriptas tal cual; los ajustes por suelo y
 * cobertura son extensión nuestra y se declaran como tal en `ajustes`.
 */

// ─── El contrato ──────────────────────────────────────────────────────────────

export interface Recomendacion {
  /** Valor sugerido: el que la app pone por defecto. */
  valor:   number;
  /** Piso y techo admitidos. Fuera de acá la app no calcula sin advertencia. */
  min:     number;
  max:     number;
  unidad:  string;
  /** Por qué salió ese número, en una oración legible. */
  criterio: string;
  /** De dónde sale la tabla o la regla. Se imprime en el informe. */
  fuente:   string;
  /** Qué movió el valor respecto de la tabla base (suelo, cobertura, etc.). */
  ajustes:  string[];
  /** false cuando la tabla no cubre el caso: entonces no hay recomendación. */
  aplica:   boolean;
  /** Si `aplica` es false, por qué. */
  motivo?:  string;
}

export type EstadoValor = 'recomendado' | 'en_rango' | 'fuera_de_rango';

export interface Evaluacion {
  estado:  EstadoValor;
  /** Texto para mostrar al lado del control. Vacío si el valor es el sugerido. */
  mensaje: string;
  /** El valor corregido al rango — para el botón "usar el recomendado". */
  corregido: number;
}

/** Tolerancia para considerar que el usuario "está en el valor sugerido". */
const CERCA = 0.02;   // 2%

/**
 * Compara lo que eligió el usuario contra la recomendación.
 *
 * No corrige por su cuenta: devuelve el diagnóstico y el valor al que habría que
 * volver. Quien llama decide si bloquea el cálculo o sólo lo advierte — pero el
 * mensaje ya viene escrito para que todos los paneles hablen igual.
 */
export function evaluar(valor: number, rec: Recomendacion): Evaluacion {
  if (!rec.aplica) {
    return { estado: 'en_rango', mensaje: rec.motivo ?? '', corregido: valor };
  }
  const cerca = Math.abs(valor - rec.valor) <= Math.abs(rec.valor) * CERCA;
  if (cerca) return { estado: 'recomendado', mensaje: '', corregido: rec.valor };

  if (valor < rec.min) {
    return {
      estado: 'fuera_de_rango',
      corregido: rec.min,
      mensaje: `${fmt(valor)} ${rec.unidad} queda por debajo del mínimo de ${fmt(rec.min)} ${rec.unidad} que admite el criterio. ${rec.criterio}`,
    };
  }
  if (valor > rec.max) {
    return {
      estado: 'fuera_de_rango',
      corregido: rec.max,
      mensaje: `${fmt(valor)} ${rec.unidad} pasa el máximo de ${fmt(rec.max)} ${rec.unidad} que admite el criterio. ${rec.criterio}`,
    };
  }
  return {
    estado: 'en_rango',
    corregido: valor,
    mensaje: `Dentro del rango de trabajo (${fmt(rec.min)}–${fmt(rec.max)} ${rec.unidad}). El valor sugerido es ${fmt(rec.valor)}.`,
  };
}

function fmt(n: number): string {
  const r = Math.round(n * 100) / 100;
  return Number.isInteger(r) ? String(r) : r.toLocaleString('es-AR');
}

/** Encierra un valor en el rango de la recomendación. */
export function acotar(valor: number, rec: Recomendacion): number {
  if (!rec.aplica) return valor;
  return Math.min(rec.max, Math.max(rec.min, valor));
}

// ─── Tabla 1 · Separación de zanjas de infiltración según pendiente ───────────

/**
 * Distancia horizontal entre zanjas a nivel, por pendiente de la ladera.
 *
 * La lógica de la tabla: cuanto más empinada la ladera, más rápido y más volumen
 * escurre, así que las zanjas van más juntas para alcanzar a guardarlo todo.
 *
 * Fuente: curso "Diseño de hidrología regenerativa", lámina "Zanjas de
 * infiltración". Válida para laderas de 2% a 45%.
 */
export const TABLA_ZANJAS: Array<{ pendiente_pct: number; distancia_m: number }> = [
  { pendiente_pct: 2,  distancia_m: 30 },
  { pendiente_pct: 5,  distancia_m: 28 },
  { pendiente_pct: 8,  distancia_m: 24 },
  { pendiente_pct: 10, distancia_m: 20 },
  { pendiente_pct: 14, distancia_m: 18 },
  { pendiente_pct: 16, distancia_m: 16 },
  { pendiente_pct: 20, distancia_m: 14 },
  { pendiente_pct: 25, distancia_m: 12 },
  { pendiente_pct: 30, distancia_m: 10 },
  { pendiente_pct: 35, distancia_m: 8 },
  { pendiente_pct: 40, distancia_m: 6 },
  { pendiente_pct: 45, distancia_m: 4 },
];

export const PENDIENTE_MIN_PCT = 2;
export const PENDIENTE_MAX_PCT = 45;

/** Interpola la distancia de tabla para una pendiente cualquiera del rango. */
export function distanciaDeTabla(pendiente_pct: number): number {
  const t = TABLA_ZANJAS;
  if (pendiente_pct <= t[0]!.pendiente_pct) return t[0]!.distancia_m;
  const ultimo = t[t.length - 1]!;
  if (pendiente_pct >= ultimo.pendiente_pct) return ultimo.distancia_m;

  for (let i = 1; i < t.length; i++) {
    const a = t[i - 1]!, b = t[i]!;
    if (pendiente_pct <= b.pendiente_pct) {
      const f = (pendiente_pct - a.pendiente_pct) / (b.pendiente_pct - a.pendiente_pct);
      return a.distancia_m + f * (b.distancia_m - a.distancia_m);
    }
  }
  return ultimo.distancia_m;
}

/**
 * Infiltración del suelo, en las tres clases que mueven la separación.
 * Se deriva del Ksat de SoilGrids (ver `claseInfiltracionDeKsat`).
 */
export type InfiltracionSuelo = 'rapida' | 'media' | 'lenta';

/** Cobertura del suelo en la ladera, que define cuánto escurre antes de la zanja. */
export type CoberturaLadera = 'desnuda' | 'parcial' | 'buena';

/**
 * Ksat (mm/h) → clase de infiltración.
 * Cortes tomados de los grupos hidrológicos del SCS: >20 mm/h infiltra rápido
 * (grupo A), <5 mm/h infiltra lento (grupos C/D).
 */
export function claseInfiltracionDeKsat(ksat_mm_h: number | null): InfiltracionSuelo | null {
  if (ksat_mm_h === null || !(ksat_mm_h > 0)) return null;
  if (ksat_mm_h >= 20) return 'rapida';
  if (ksat_mm_h >= 5)  return 'media';
  return 'lenta';
}

/**
 * Cobertura de la ladera a partir del mapa de cobertura del suelo.
 * Los cortes son gruesos a propósito: el ajuste que dispara es de ±15%, así que
 * no tiene sentido afinar más de lo que el dato satelital puede sostener.
 */
export function coberturaDeSatelite(
  veg_pct: number | null | undefined,
  suelo_desnudo_pct: number | null | undefined,
): CoberturaLadera | null {
  if (typeof veg_pct !== 'number') return null;
  if (typeof suelo_desnudo_pct === 'number' && suelo_desnudo_pct >= 30) return 'desnuda';
  if (veg_pct >= 70) return 'buena';
  if (veg_pct <= 35) return 'desnuda';
  return 'parcial';
}

/**
 * Factores de ajuste sobre la distancia de tabla. Extensión nuestra, no del
 * material original: la tabla da un solo número por pendiente y en la práctica
 * un arenal con pastura y una arcilla desnuda no piden lo mismo.
 *
 * Se mantienen chicos a propósito (±15%). La pendiente sigue mandando; esto
 * afina, no reescribe. Van declarados en `ajustes` para que se vea qué se tocó.
 */
const F_INFILTRACION: Record<InfiltracionSuelo, number> = {
  rapida: 1.15,   // el agua entra sola: la zanja alcanza a vaciarse, puede ir más lejos
  media:  1.00,
  lenta:  0.85,   // escurre casi todo: hay que interceptarlo antes
};

const F_COBERTURA: Record<CoberturaLadera, number> = {
  desnuda: 0.85,  // sin pasto ni mulch escurre más y más rápido
  parcial: 1.00,
  buena:   1.15,  // la cobertura ya frena e infiltra parte del agua
};

/** Cuánto puede correrse el usuario del valor sugerido, hacia arriba y hacia abajo. */
const HOLGURA = 0.20;   // ±20%

export interface EntradaSeparacion {
  pendiente_pct: number;
  infiltracion?: InfiltracionSuelo | null;
  cobertura?:    CoberturaLadera | null;
}

/**
 * Separación horizontal recomendada entre zanjas de infiltración.
 *
 * Devuelve el contrato completo: valor, rango de trabajo, criterio y fuente.
 * Fuera de 2–45% de pendiente no recomienda nada y explica por qué — que es lo
 * correcto: abajo del 2% el agua no escurre en láminas y la zanja a nivel deja
 * de tener sentido como intercepción; arriba del 45% la zanja se vuelve un
 * riesgo de deslizamiento y el material original no la cubre.
 */
export function separacionZanjas(e: EntradaSeparacion): Recomendacion {
  const FUENTE = 'Tabla de separación de zanjas de infiltración por pendiente — curso "Diseño de hidrología regenerativa"';
  const p = e.pendiente_pct;

  if (!(p > 0) || !Number.isFinite(p)) {
    return sinRecomendacion('m', FUENTE, 'No hay pendiente calculada todavía: hace falta la topografía del predio.');
  }
  if (p < PENDIENTE_MIN_PCT) {
    return sinRecomendacion('m', FUENTE,
      `La pendiente es de ${p.toFixed(1)}%, menor al 2% que cubre la tabla. En terreno casi plano el agua no escurre en lámina y la zanja a nivel deja de funcionar como intercepción: conviene pensar en drenaje o en captación de techos, no en swales.`);
  }
  if (p > PENDIENTE_MAX_PCT) {
    return sinRecomendacion('m', FUENTE,
      `La pendiente es de ${p.toFixed(1)}%, mayor al 45% que cubre la tabla. En laderas así una zanja concentra agua sobre un talud inestable y puede provocar el deslizamiento que se quiere evitar: la tabla no lo cubre y nosotros tampoco lo recomendamos.`);
  }

  const base = distanciaDeTabla(p);
  const ajustes: string[] = [];
  let valor = base;

  if (e.infiltracion) {
    const f = F_INFILTRACION[e.infiltracion];
    if (f !== 1) {
      valor *= f;
      ajustes.push(e.infiltracion === 'rapida'
        ? `Suelo de infiltración rápida: +15% sobre los ${base.toFixed(0)} m de tabla, porque la zanja se vacía sola y puede tomar una franja más ancha.`
        : `Suelo de infiltración lenta: −15% sobre los ${base.toFixed(0)} m de tabla, porque escurre casi todo y hay que interceptarlo antes.`);
    }
  }
  if (e.cobertura) {
    const f = F_COBERTURA[e.cobertura];
    if (f !== 1) {
      valor *= f;
      ajustes.push(e.cobertura === 'buena'
        ? 'Ladera con buena cobertura: +15%, porque el pasto y la hojarasca ya frenan e infiltran parte del agua.'
        : 'Ladera desnuda: −15%, porque sin cobertura escurre más agua y más rápido.');
    }
  }

  valor = Math.round(valor * 2) / 2;   // a medio metro: es lo que se replantea con cinta

  return {
    valor,
    min: Math.round(valor * (1 - HOLGURA) * 2) / 2,
    max: Math.round(valor * (1 + HOLGURA) * 2) / 2,
    unidad: 'm',
    criterio: `Con ${p.toFixed(1)}% de pendiente la tabla pide ${base.toFixed(0)} m entre zanjas: a mayor pendiente el agua escurre más rápido y en mayor cantidad, así que las zanjas van más juntas para alcanzar a guardarla.`,
    fuente: FUENTE,
    ajustes,
    aplica: true,
  };
}

/**
 * La misma recomendación expresada como separación VERTICAL, que es el parámetro
 * con el que se trazan las curvas de nivel en la app.
 *
 *   intervalo vertical = distancia horizontal × pendiente
 *
 * Ejemplo: 10% de pendiente → 20 m horizontales → 2,0 m de desnivel entre swales.
 */
export function separacionVerticalZanjas(e: EntradaSeparacion): Recomendacion {
  const h = separacionZanjas(e);
  if (!h.aplica) return { ...h, unidad: 'm' };

  const k = e.pendiente_pct / 100;
  const v = (x: number) => Math.max(0.25, Math.round(x * k * 4) / 4);   // a cuartos de metro

  return {
    ...h,
    valor: v(h.valor),
    min:   v(h.min),
    max:   v(h.max),
    criterio: `${h.criterio} Con esa pendiente, ${h.valor} m horizontales equivalen a ${v(h.valor)} m de desnivel entre una zanja y la siguiente.`,
  };
}

function sinRecomendacion(unidad: string, fuente: string, motivo: string): Recomendacion {
  return { valor: NaN, min: -Infinity, max: Infinity, unidad, criterio: '', fuente, ajustes: [], aplica: false, motivo };
}

// ─── Tabla 2 · Escurrimiento anual de áreas de captación ──────────────────────

/**
 * Cuánto de la lluvia de un año termina escurriendo, como porcentaje del total
 * caído. Sirve para dimensionar lo que puede juntar una represa o un tajamar en
 * una temporada — NO es el coeficiente de una tormenta de diseño, que es otra
 * cosa y en la app se calcula con SCS-CN.
 *
 * La distinción importa y conviene tenerla clara antes de usar cualquiera de las
 * dos: el coeficiente de evento responde "cuánto me llega en esta tormenta" y
 * dimensiona vertederos, alcantarillas y la sección de una zanja; este
 * porcentaje anual responde "cuánto junto en el año" y dimensiona el vaso de una
 * represa. Confundirlos sobredimensiona una obra y subdimensiona la otra.
 *
 * La "confiabilidad" de la tabla es en cuántos años de cada diez se alcanza al
 * menos ese escurrimiento: 8 es el criterio corriente, 9 el conservador (da
 * números más bajos, y es el que corresponde si de esa agua depende el consumo).
 *
 * Fuente: tabla 8.3, curso "Diseño de hidrología regenerativa".
 */
export type SueloEscurrimiento =
  | 'arenoso_superficial'    // arenosos superficiales o limo-arcillosos
  | 'areno_arcilloso'
  | 'arcilloso_elastico'     // arcilla expansiva (se agrieta y se hincha)
  | 'arcilloso_inelastico';  // arcilla no expansiva, polvorosa

export type Confiabilidad = 8 | 9;

export const SUELOS_ESCURRIMIENTO: Array<{ id: SueloEscurrimiento; nombre: string; ayuda: string }> = [
  { id: 'arenoso_superficial',  nombre: 'Arenoso superficial o limo-arcilloso', ayuda: 'Infiltra bien: es el que menos escurre.' },
  { id: 'areno_arcilloso',      nombre: 'Areno-arcilloso',                      ayuda: 'Intermedio.' },
  { id: 'arcilloso_elastico',   nombre: 'Arcilloso elástico (expansivo)',       ayuda: 'Arcilla que se agrieta al secarse y se hincha al mojarse.' },
  { id: 'arcilloso_inelastico', nombre: 'Arcilloso inelástico (polvoroso)',     ayuda: 'Arcilla que no se agrieta: sella la superficie y es la que más escurre.' },
];

interface FilaEscurrimiento {
  /** Rango de precipitación anual (mm), extremos incluidos. */
  p_min: number; p_max: number;
  /** Rango de evaporación anual (mm). null = la fila no discrimina por evaporación. */
  e_min: number | null; e_max: number | null;
  conf: Confiabilidad;
  /** [mín, máx] de escurrimiento en % de la lluvia anual, por clase de suelo. */
  pct: Record<SueloEscurrimiento, [number, number]>;
}

/** Transcripción literal de la tabla 8.3. No tocar sin la tabla a la vista. */
export const TABLA_ESCURRIMIENTO: FilaEscurrimiento[] = [
  { p_min: 1101, p_max: Infinity, e_min: null, e_max: null, conf: 8,
    pct: { arenoso_superficial: [10, 15],   areno_arcilloso: [10, 15],  arcilloso_elastico: [15, 20],   arcilloso_inelastico: [15, 25] } },
  { p_min: 1101, p_max: Infinity, e_min: null, e_max: null, conf: 9,
    pct: { arenoso_superficial: [6.5, 10],  areno_arcilloso: [6.5, 10], arcilloso_elastico: [10, 13],   arcilloso_inelastico: [10, 16.5] } },

  { p_min: 901, p_max: 1100, e_min: null, e_max: null, conf: 8,
    pct: { arenoso_superficial: [10, 12.5], areno_arcilloso: [10, 15],  arcilloso_elastico: [12.5, 20], arcilloso_inelastico: [15, 20] } },
  { p_min: 901, p_max: 1100, e_min: null, e_max: null, conf: 9,
    pct: { arenoso_superficial: [6.5, 8],   areno_arcilloso: [6.5, 10], arcilloso_elastico: [8, 13],    arcilloso_inelastico: [10, 13] } },

  { p_min: 501, p_max: 900, e_min: 0, e_max: 1299, conf: 8,
    pct: { arenoso_superficial: [7.5, 10],  areno_arcilloso: [7.5, 15], arcilloso_elastico: [7.5, 15],  arcilloso_inelastico: [10, 15] } },
  { p_min: 501, p_max: 900, e_min: 0, e_max: 1299, conf: 9,
    pct: { arenoso_superficial: [5, 8.5],   areno_arcilloso: [5, 10],   arcilloso_elastico: [5, 10],    arcilloso_inelastico: [6.5, 10] } },

  { p_min: 501, p_max: 900, e_min: 1300, e_max: 1500, conf: 8,
    pct: { arenoso_superficial: [5, 7.5],   areno_arcilloso: [6, 12.5], arcilloso_elastico: [6, 10],    arcilloso_inelastico: [10, 15] } },
  { p_min: 501, p_max: 900, e_min: 1300, e_max: 1500, conf: 9,
    pct: { arenoso_superficial: [3, 5],     areno_arcilloso: [3, 8],    arcilloso_elastico: [3, 8.5],   arcilloso_inelastico: [6.5, 10] } },

  { p_min: 401, p_max: 500, e_min: 1500, e_max: 1800, conf: 8,
    pct: { arenoso_superficial: [2.5, 5],   areno_arcilloso: [6, 10],   arcilloso_elastico: [2.5, 5.7], arcilloso_inelastico: [7.5, 12.5] } },
  { p_min: 401, p_max: 500, e_min: 1500, e_max: 1800, conf: 9,
    pct: { arenoso_superficial: [1.5, 3],   areno_arcilloso: [3, 8.5],  arcilloso_elastico: [1.5, 3],   arcilloso_inelastico: [5, 8] } },

  { p_min: 250, p_max: 400, e_min: 0, e_max: 1799, conf: 8,
    pct: { arenoso_superficial: [0, 2.5],   areno_arcilloso: [0, 5],    arcilloso_elastico: [0, 2.5],   arcilloso_inelastico: [2.5, 7.5] } },
  { p_min: 250, p_max: 400, e_min: 0, e_max: 1799, conf: 9,
    pct: { arenoso_superficial: [0, 1.5],   areno_arcilloso: [0, 3],    arcilloso_elastico: [0, 1.5],   arcilloso_inelastico: [1.5, 5] } },

  { p_min: 250, p_max: 400, e_min: 1800, e_max: Infinity, conf: 8,
    pct: { arenoso_superficial: [0, 0],     areno_arcilloso: [0, 2.5],  arcilloso_elastico: [0, 0],     arcilloso_inelastico: [2.5, 5] } },
  { p_min: 250, p_max: 400, e_min: 1800, e_max: Infinity, conf: 9,
    pct: { arenoso_superficial: [0, 0],     areno_arcilloso: [1, 1.5],  arcilloso_elastico: [0, 0],     arcilloso_inelastico: [1.5, 3] } },
];

export interface EntradaEscurrimiento {
  precip_anual_mm: number;
  /** Evaporación (o ETP) anual en mm. Sólo la usan las filas de menos de 900 mm. */
  evap_anual_mm:   number | null;
  suelo:           SueloEscurrimiento;
  confiabilidad:   Confiabilidad;
}

export interface ResultadoEscurrimiento {
  aplica:      boolean;
  motivo?:     string;
  /** Porcentaje de la lluvia anual que escurre: mínimo, máximo y punto medio. */
  pct_min:     number;
  pct_max:     number;
  pct:         number;
  /** Lámina escurrida en mm/año, en el punto medio. */
  lamina_mm:   number;
  /** Lo mismo en m³ por hectárea de área de captación. */
  m3_por_ha:   number;
  fuente:      string;
  nota:        string;
}

const FUENTE_ESC = 'Tabla 8.3 "Escurrimientos de áreas de captación" — curso "Diseño de hidrología regenerativa"';

/**
 * Escurrimiento anual esperable de un área de captación.
 *
 * Devuelve el rango completo de la tabla, no sólo un número: la diferencia entre
 * el mínimo y el máximo de una celda llega a ser del doble, y esconderla detrás
 * de un promedio le daría al resultado una precisión que no tiene.
 */
export function escurrimientoAnual(e: EntradaEscurrimiento): ResultadoEscurrimiento {
  const vacio = (motivo: string): ResultadoEscurrimiento => ({
    aplica: false, motivo, pct_min: 0, pct_max: 0, pct: 0, lamina_mm: 0, m3_por_ha: 0,
    fuente: FUENTE_ESC, nota: '',
  });

  const P = e.precip_anual_mm;
  if (!(P > 0)) return vacio('Falta la precipitación anual del sitio.');
  if (P < 250) {
    return vacio(`Con ${Math.round(P)} mm al año el sitio queda por debajo de los 250 mm que cubre la tabla. En esa franja el escurrimiento de ladera es prácticamente nulo y la captación se resuelve por otras vías (techos, superficies impermeabilizadas, atrapanieblas).`);
  }

  // Las filas de más de 900 mm no discriminan por evaporación; las de menos, sí.
  const candidatas = TABLA_ESCURRIMIENTO.filter(f =>
    f.conf === e.confiabilidad && P >= f.p_min && P <= f.p_max);

  if (candidatas.length === 0) return vacio('La tabla no cubre esta combinación.');

  let fila = candidatas[0]!;
  const necesitaEvap = candidatas.length > 1 || candidatas[0]!.e_min !== null;
  if (necesitaEvap) {
    const E = e.evap_anual_mm;
    if (E === null || !(E > 0)) {
      return vacio(`Con ${Math.round(P)} mm de lluvia anual la tabla necesita también la evaporación anual para elegir la fila, y todavía no está calculada.`);
    }
    const match = candidatas.find(f => f.e_min === null || (E >= f.e_min && E <= (f.e_max ?? Infinity)));
    if (!match) {
      return vacio(`Con ${Math.round(P)} mm de lluvia y ${Math.round(E)} mm de evaporación anual no hay fila en la tabla. Las combinaciones cubiertas son acotadas: revisá si los dos valores corresponden al mismo sitio.`);
    }
    fila = match;
  }

  const [lo, hi] = fila.pct[e.suelo];
  const medio = (lo + hi) / 2;

  const notas: string[] = [];
  if (lo === 0 && hi === 0) {
    notas.push('La tabla da escurrimiento nulo para esta combinación: en este clima y con este suelo no hay agua de ladera que juntar. Buscá la captación en techos o superficies duras.');
  } else if (hi >= lo * 2 && lo > 0) {
    notas.push(`El rango de la tabla es ancho (${lo}% a ${hi}%): la diferencia depende del estado de la superficie y de cómo se distribuyan las lluvias en el año. Dimensioná con el mínimo si de esta agua depende un consumo.`);
  }
  notas.push(e.confiabilidad === 9
    ? 'Confiabilidad 9 de cada 10 años: criterio conservador, el que corresponde cuando de esa agua depende el consumo.'
    : 'Confiabilidad 8 de cada 10 años: criterio corriente. Dos años de cada diez se juntará menos que esto.');

  const lamina = P * (medio / 100);

  return {
    aplica: true,
    pct_min: lo,
    pct_max: hi,
    pct: +medio.toFixed(2),
    lamina_mm: +lamina.toFixed(1),
    m3_por_ha: Math.round(lamina * 10),   // 1 mm sobre 1 ha = 10 m³
    fuente: FUENTE_ESC,
    nota: notas.join(' '),
  };
}

/**
 * Sugiere la clase de suelo de la tabla 8.3 a partir de la textura de SoilGrids.
 *
 * Con una salvedad que hay que decir: la tabla separa arcillas "elásticas" de
 * "inelásticas", y esa distinción es de plasticidad y mineralogía, no de textura.
 * Con el porcentaje de arcilla y arena no se puede resolver — por eso la función
 * devuelve también qué tan segura está y, cuando no puede, se queda del lado que
 * más escurre, que es el conservador para dimensionar una obra de captación.
 */
export function claseSueloSugerida(
  arcilla_pct: number,
  arena_pct: number,
): { clase: SueloEscurrimiento; certeza: 'alta' | 'media' | 'baja'; nota: string } {
  if (arena_pct >= 50 && arcilla_pct < 20) {
    return { clase: 'arenoso_superficial', certeza: 'alta',
      nota: `Textura arenosa (${Math.round(arena_pct)}% de arena, ${Math.round(arcilla_pct)}% de arcilla).` };
  }
  if (arcilla_pct < 27) {
    return { clase: 'areno_arcilloso', certeza: 'media',
      nota: `Textura intermedia (${Math.round(arena_pct)}% de arena, ${Math.round(arcilla_pct)}% de arcilla).` };
  }
  return {
    clase: 'arcilloso_inelastico',
    certeza: 'baja',
    nota: `Suelo arcilloso (${Math.round(arcilla_pct)}% de arcilla). La tabla distingue arcillas expansivas de las que no lo son, y eso no se deduce de la textura: quedó en la clase que más escurre, que es la conservadora. Si el suelo se agrieta al secarse, cambialo a "arcilloso elástico".`,
  };
}

// ─── Tabla 3 · Ancho de coronamiento de un muro de represa ────────────────────

/**
 * Ancho de la corona según la altura del muro.
 *
 * Por qué existe: hasta acá la app usaba dos presets fijos (1 m para una aguada,
 * 3 m para una represa de ladera) sin mirar la altura. Un muro de 1,5 m y uno de
 * 6 m recibían la misma corona, y como `base = corona + alto × (talud interno +
 * talud externo)`, el error se propagaba al volumen de terraplén.
 *
 * Los cortes siguen la práctica corriente de pequeñas presas de tierra: la
 * corona nunca baja de 1 m porque menos que eso no se compacta ni se transita a
 * pie, y crece con la altura porque el muro necesita masa arriba para resistir
 * el oleaje y el paso. El mínimo salta a 3 m cuando tiene que pasar un vehículo,
 * que es el ancho de una huella con banquina.
 */
export interface RangoCorona {
  /** Altura del muro, en metros (incluida la revancha). */
  alto_max_m: number;
  sugerido_m: number;
  min_m:      number;
  max_m:      number;
}

export const TABLA_CORONA: RangoCorona[] = [
  { alto_max_m: 2,        sugerido_m: 1.5, min_m: 1.0, max_m: 3.0 },
  { alto_max_m: 3,        sugerido_m: 2.0, min_m: 1.5, max_m: 3.5 },
  { alto_max_m: 5,        sugerido_m: 2.5, min_m: 2.0, max_m: 4.0 },
  { alto_max_m: 8,        sugerido_m: 3.0, min_m: 2.5, max_m: 5.0 },
  { alto_max_m: 12,       sugerido_m: 4.0, min_m: 3.0, max_m: 6.0 },
  { alto_max_m: Infinity, sugerido_m: 5.0, min_m: 4.0, max_m: 8.0 },
];

export interface EntradaCorona {
  alto_m: number;
  /** Largo del coronamiento (m). Un muro largo pide algo más de corona. */
  largo_m?: number | null;
  /** ¿Tiene que pasar un vehículo por arriba? Entonces el mínimo es 3 m. */
  transitable?: boolean;
}

/** Ancho de corona recomendado, con el rango en el que se puede jugar. */
export function anchoCorona(e: EntradaCorona): Recomendacion {
  const FUENTE = 'Criterio de pequeñas presas de tierra: la corona crece con la altura del muro; 3 m es el mínimo transitable por vehículo.';
  const h = e.alto_m;
  if (!(h > 0)) {
    return sinRecomendacion('m', FUENTE, 'Falta la altura del muro: se calcula desde la profundidad del vaso más la revancha.');
  }

  const fila = TABLA_CORONA.find(f => h <= f.alto_max_m) ?? TABLA_CORONA[TABLA_CORONA.length - 1]!;
  let { sugerido_m: valor, min_m: min, max_m: max } = fila;
  const ajustes: string[] = [];

  // Un muro largo trabaja peor: más frente expuesto al oleaje y más asentamiento
  // diferencial. Se le da algo más de corona a partir de los 100 m de eje.
  const L = e.largo_m ?? null;
  if (L !== null && L >= 100) {
    const extra = L >= 300 ? 1.0 : 0.5;
    valor += extra;
    max   += extra;
    ajustes.push(`Coronamiento de ${Math.round(L)} m de largo: +${extra} m, porque un muro largo tiene más frente expuesto al oleaje y más asentamiento diferencial.`);
  }

  if (e.transitable) {
    if (min < 3) min = 3;
    if (valor < 3) valor = 3;
    if (max < 4) max = 4;
    ajustes.push('Coronamiento transitable por vehículo: el mínimo pasa a 3 m, que es el ancho de una huella con banquina.');
  }

  return {
    valor: +valor.toFixed(2),
    min:   +min.toFixed(2),
    max:   +max.toFixed(2),
    unidad: 'm',
    criterio: `Para un muro de ${h.toFixed(1)} m de alto la corona va entre ${min} y ${max} m: menos no se compacta ni se transita, y de más sólo agrega movimiento de suelo sin aportar seguridad.`,
    fuente: FUENTE,
    ajustes,
    aplica: true,
  };
}

/**
 * Taludes recomendados según el material del terraplén.
 *
 * Se expresan H:1V — cuántos metros horizontales por cada metro vertical. El
 * talud de aguas arriba va siempre más tendido que el de aguas abajo: está
 * saturado, sufre el oleaje y, sobre todo, el vaciado rápido es la condición
 * crítica que hace deslizar ese lado.
 */
export interface Taludes {
  interno: number;   // aguas arriba
  externo: number;   // aguas abajo
  criterio: string;
}

export function taludesSugeridos(suelo: SueloEscurrimiento | null, alto_m: number): Taludes {
  const alto = alto_m >= 5;
  switch (suelo) {
    case 'arenoso_superficial':
      return { interno: alto ? 3.5 : 3, externo: alto ? 2.5 : 2,
        criterio: 'Suelo arenoso: poca cohesión, taludes más tendidos y hay que prever un núcleo o pantalla impermeable.' };
    case 'arcilloso_elastico':
      return { interno: alto ? 3.5 : 3, externo: alto ? 2.5 : 2,
        criterio: 'Arcilla expansiva: impermeabiliza bien pero se agrieta al secarse, así que conviene tender los taludes y proteger la superficie de la desecación.' };
    case 'arcilloso_inelastico':
      return { interno: alto ? 3 : 2.5, externo: alto ? 2.5 : 2,
        criterio: 'Arcilla no expansiva: buen material de terraplén, admite taludes algo más parados.' };
    case 'areno_arcilloso':
    default:
      return { interno: alto ? 3 : 2.5, externo: alto ? 2 : 2,
        criterio: 'Mezcla areno-arcillosa: es el material corriente de terraplén; el talud interno va más tendido porque el vaciado rápido es la condición crítica.' };
  }
}
