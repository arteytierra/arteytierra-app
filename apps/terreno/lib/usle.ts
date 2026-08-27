/**
 * USLE aplicada: de índice relativo a toneladas por hectárea y año (H4).
 *
 * El mapa de erosión responde DÓNDE: un Stream Power Index normalizado al
 * percentil 90 del propio predio, con el factor C corriendo los umbrales. Lo
 * que no responde es CUÁNTO, y sin eso no se puede decidir nada: "12 % del
 * predio en severo" no dice si hay que actuar este año o si el suelo aguanta.
 *
 * Acá se cierra esa pregunta con la USLE completa:
 *
 *     A = R · K · LS · C · P      [t/ha/año]
 *
 * De los cinco factores ya teníamos C (cobertura, H4 original). Los que
 * faltaban salen de datos que la app YA carga:
 *
 *   · R — erosividad de la lluvia, de la precipitación anual de Clima, por la
 *     regresión de Renard & Freimund (1994).
 *   · K — erodabilidad, de la textura y el carbono orgánico de Suelo (tabla
 *     clásica de valores típicos de Wischmeier, corregida por materia orgánica).
 *   · LS — de la pendiente media de cada clase del mapa y una longitud de
 *     ladera derivada del flujo acumulado.
 *   · P — prácticas de conservación. Se deja en 1: la app no sabe si hay
 *     terrazas o siembra en contorno, y asumir que las hay subestimaría la
 *     pérdida, que es el error caro.
 *
 * TODO ESTO ES UNA ESTIMACIÓN DE ORDEN DE MAGNITUD y se muestra como banda, no
 * como número puntual: cada factor arrastra su propia incertidumbre y el
 * producto de cinco aproximaciones no merece decimales. Sirve para lo que
 * importa: saber si una clase está por debajo o muy por arriba de la tolerancia
 * de pérdida del suelo. La salud del cálculo lo declara.
 */

/**
 * Tolerancia de pérdida de suelo (t/ha/año): lo que un suelo puede perder sin
 * degradarse, porque se repone por formación. Depende de la profundidad: entre
 * 2 (suelo somero sobre roca) y 12 (suelo profundo). 10 es el valor de
 * referencia habitual para suelos profundos, y el que se usa acá como umbral
 * de comparación.
 */
export const TOLERANCIA_T_HA = 10;

// ─── R · erosividad de la lluvia ──────────────────────────────────────────────

/**
 * Erosividad anual de la lluvia [MJ·mm/(ha·h·año)] a partir de la precipitación
 * anual, por Renard & Freimund (1994). Las dos ramas empalman en 850 mm.
 *
 * Es una regresión global: donde hay curvas de erosividad locales, mandan ellas.
 * Se queda corta donde la lluvia es muy convectiva (mucha energía en pocos
 * eventos) y larga donde es de baja intensidad y larga duración.
 */
export function erosividadR(precipAnual_mm: number): number {
  const P = precipAnual_mm;
  if (!(P > 0)) return 0;
  return P < 850
    ? 0.0483 * Math.pow(P, 1.610)
    : 587.8 - 1.219 * P + 0.004105 * P * P;
}

// ─── K · erodabilidad del suelo ───────────────────────────────────────────────

/**
 * Valores típicos de K por clase textural [t·ha·h/(ha·MJ·mm)], para materia
 * orgánica ~2 %. Son la tabla clásica de Wischmeier convertida a unidades SI
 * (× 0.1317). El limo y el franco-limoso son los más erodables: partícula
 * chica, sin cohesión de arcilla y sin peso de arena.
 */
const K_POR_TEXTURA: Record<string, number> = {
  'Arenoso':          0.007,
  'Arenoso-franco':   0.005,
  'Franco-arenoso':   0.017,
  'Franco':           0.040,
  'Franco-limoso':    0.050,
  'Limoso':           0.063,
  'Arcillo-arenoso':  0.017,
  'Franco-arcilloso': 0.040,
  'Arcillo-limoso':   0.034,
  'Arcilloso':        0.028,
};

/** K para una clase textural desconocida: el franco, que es el término medio. */
const K_POR_DEFECTO = 0.040;

/**
 * Erodabilidad K corregida por materia orgánica. La tabla es para MO ~2 %; con
 * más materia orgánica el suelo se agrega y resiste, con menos se disgrega.
 * La pendiente de la corrección sale de las columnas de la propia tabla
 * (0.5 % → ×1.26, 4 % → ×0.76), acotada para no extrapolar de más.
 */
export function erodabilidadK(clase_textura: string | null | undefined, materiaOrganica_pct?: number | null): number {
  const base = (clase_textura ? K_POR_TEXTURA[clase_textura] : undefined) ?? K_POR_DEFECTO;
  if (materiaOrganica_pct == null || !(materiaOrganica_pct > 0)) return base;
  const f = Math.min(1.3, Math.max(0.75, 1 - 0.145 * (materiaOrganica_pct - 2)));
  return base * f;
}

/** Carbono orgánico de SoilGrids (g/kg) → materia orgánica (%). */
export function materiaOrganicaPct(carbonoOrg_g_kg: number): number {
  return (carbonoOrg_g_kg / 10) * 1.724;
}

// ─── LS · relieve ─────────────────────────────────────────────────────────────

/**
 * Longitud de ladera máxima (m) que se acepta. Arriba de eso la USLE deja de
 * valer: aparece deposición y el flujo se concentra en cárcavas, que es otro
 * proceso. Recortar acá es del lado conservador de la honestidad, no del número.
 */
export const LAMBDA_MAX_M = 200;

/**
 * Factor topográfico LS de Wischmeier & Smith. `lambda` es la longitud de
 * ladera en metros y `pendiente_pct` la pendiente de la ladera.
 *
 * La parcela unitaria de la USLE son 22.13 m al 9 %: con esos valores LS = 1,
 * que es la comprobación de que la fórmula está bien escrita.
 */
export function factorLS(pendiente_pct: number, lambda_m: number): number {
  const s = Math.max(0, pendiente_pct);
  const lambda = Math.min(Math.max(lambda_m, 1), LAMBDA_MAX_M);
  const m = s >= 5 ? 0.5 : s >= 3.5 ? 0.4 : s >= 1 ? 0.3 : 0.2;
  const theta = Math.atan(s / 100);
  const sin = Math.sin(theta);
  return Math.pow(lambda / 22.13, m) * (65.41 * sin * sin + 4.56 * sin + 0.065);
}

// ─── A · pérdida de suelo ─────────────────────────────────────────────────────

export interface EntradaUSLE {
  /** precipitación anual (mm), de Clima */
  precipAnual_mm: number;
  /** clase textural de la capa superficial, de Suelo */
  clase_textura?: string | null;
  /** carbono orgánico superficial (g/kg), de Suelo */
  carbonoOrg_g_kg?: number | null;
  /** factor C de la cobertura (H4). Sin cobertura cargada no hay estimación. */
  usle_c: number;
}

export interface PerdidaSuelo {
  /** estimación central (t/ha/año) */
  t_ha_anio: number;
  /** banda de incertidumbre: el producto de cinco aproximaciones no da un punto */
  min_t_ha:  number;
  max_t_ha:  number;
  /** cuántas veces la tolerancia de referencia */
  veces_tolerancia: number;
  R: number; K: number; LS: number; C: number;
}

/**
 * Ancho de la banda. ×/÷ 2 no es un intervalo de confianza estadístico: es el
 * reconocimiento de que R sale de una regresión global, K de una tabla por
 * textura, LS de un DEM de decenas de metros y C de un histograma satelital.
 * Un número puntual acá sería mentira precisa.
 */
const FACTOR_BANDA = 2;

/** Pérdida de suelo para una ladera concreta (una clase del mapa de erosión). */
export function perdidaSuelo(
  e: EntradaUSLE,
  pendiente_pct: number,
  lambda_m: number,
): PerdidaSuelo {
  const R  = erosividadR(e.precipAnual_mm);
  const K  = erodabilidadK(e.clase_textura, e.carbonoOrg_g_kg != null ? materiaOrganicaPct(e.carbonoOrg_g_kg) : null);
  const LS = factorLS(pendiente_pct, lambda_m);
  const C  = Math.max(0, e.usle_c);
  const r1 = (n: number) => Math.round(n * 10) / 10;
  // Se redondea PRIMERO y la banda sale del valor redondeado: si no, el lector
  // hace la cuenta a ojo sobre lo que ve en pantalla y no le cierra.
  const A = r1(R * K * LS * C);   // P = 1: ver el docstring del módulo
  return {
    t_ha_anio: A,
    min_t_ha:  r1(A / FACTOR_BANDA),
    max_t_ha:  r1(A * FACTOR_BANDA),
    veces_tolerancia: Math.round(A / TOLERANCIA_T_HA * 10) / 10,
    R: Math.round(R), K: Math.round(K * 1000) / 1000, LS: r1(LS), C,
  };
}

/** Cómo se lee esa pérdida contra la tolerancia del suelo. */
export function lecturaPerdida(p: PerdidaSuelo): string {
  const v = p.veces_tolerancia;
  if (v < 0.5) return 'Muy por debajo de la tolerancia: el suelo se repone más rápido de lo que se pierde.';
  if (v < 1)   return 'Por debajo de la tolerancia, pero sin margen: cualquier cambio de cobertura lo cruza.';
  if (v < 3)   return 'Arriba de la tolerancia. El suelo se está perdiendo más rápido de lo que se forma.';
  if (v < 10)  return 'Muy arriba de la tolerancia: pérdida seria, prioridad de intervención.';
  return 'Pérdida de orden crítico. Con estos números el horizonte superficial se va en pocas décadas.';
}
