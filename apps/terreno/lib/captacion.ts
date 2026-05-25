/**
 * Cálculo de captación pluvial y dimensionamiento de tanque.
 * Fórmula base: V(m³) = P(mm) × A(m²) × C / 1000
 *   P = precipitación, A = área de captación, C = coeficiente de escorrentía.
 */

// ─── Superficies ──────────────────────────────────────────────────────────────

export type TipoSuperficie =
  | 'techo_metal'
  | 'techo_paja'
  | 'pavimento'
  | 'camino'
  | 'suelo_pasto'
  | 'suelo_bosque'
  | 'suelo_cultivo'
  | 'personalizado';

export const TIPOS_SUPERFICIE: Record<TipoSuperficie, { label: string; coef: number; descripcion: string }> = {
  techo_metal:    { label: 'Techo metálico / tejas',      coef: 0.90, descripcion: 'Zinc, chapa, teja cerámica' },
  techo_paja:     { label: 'Techo paja / orgánico',        coef: 0.60, descripcion: 'Paja, quincho, palma' },
  pavimento:      { label: 'Pavimento / concreto',         coef: 0.85, descripcion: 'Asfalto, hormigón, ladrillo' },
  camino:         { label: 'Camino compactado',             coef: 0.60, descripcion: 'Tosca, tierra apisonada' },
  suelo_pasto:    { label: 'Suelo natural / pastizal',     coef: 0.25, descripcion: 'Pastura, campo abierto' },
  suelo_bosque:   { label: 'Suelo con cobertura arbórea',  coef: 0.15, descripcion: 'Monte, bosque, jardín denso' },
  suelo_cultivo:  { label: 'Suelo cultivado',              coef: 0.35, descripcion: 'Huerta, cultivo anual' },
  personalizado:  { label: 'Personalizado',                coef: 0.50, descripcion: 'Ingresá el coeficiente manualmente' },
};

export interface Superficie {
  id:      string;
  tipo:    TipoSuperficie;
  nombre:  string;
  area_m2: number;
  coef:    number;
}

// ─── Categorías de consumo ────────────────────────────────────────────────────

export type TipoConsumo =
  | 'domestico'
  | 'huerta'
  | 'cultivo_extensivo'
  | 'bovinos'
  | 'caprinos_ovinos'
  | 'porcinos'
  | 'aves'
  | 'equinos'
  | 'personalizado';

export const CONSUMO_REFS: Record<TipoConsumo, {
  label:                 string;
  unidad:                string;
  litros_dia_por_unidad: number;
  descripcion:           string;
}> = {
  domestico:         { label: 'Uso doméstico',           unidad: 'personas',  litros_dia_por_unidad: 80,    descripcion: 'Bebida, cocina, higiene (~80 L/p/día)' },
  huerta:            { label: 'Huerta / jardín',          unidad: 'm²',        litros_dia_por_unidad: 2,     descripcion: 'Riego promedio anual (~2 L/m²/día)' },
  cultivo_extensivo: { label: 'Cultivo extensivo',        unidad: 'ha',        litros_dia_por_unidad: 5000,  descripcion: 'Riego suplementario (~5 mm/día, 5.000 L/ha)' },
  bovinos:           { label: 'Ganadería bovina',         unidad: 'animales',  litros_dia_por_unidad: 50,    descripcion: '40–60 L/animal/día' },
  caprinos_ovinos:   { label: 'Ganadería caprina/ovina',  unidad: 'animales',  litros_dia_por_unidad: 6,     descripcion: '4–8 L/animal/día' },
  porcinos:          { label: 'Ganadería porcina',        unidad: 'animales',  litros_dia_por_unidad: 20,    descripcion: '15–25 L/animal/día' },
  aves:              { label: 'Aves de corral',            unidad: 'animales',  litros_dia_por_unidad: 0.3,   descripcion: '0.2–0.4 L/ave/día' },
  equinos:           { label: 'Equinos',                   unidad: 'animales',  litros_dia_por_unidad: 50,    descripcion: '40–60 L/animal/día' },
  personalizado:     { label: 'Personalizado',             unidad: 'unidades',  litros_dia_por_unidad: 50,    descripcion: 'Ingresá el consumo por unidad manualmente' },
};

export interface ConsumoCategoria {
  id:                    string;
  tipo:                  TipoConsumo;
  nombre:                string;
  cantidad:              number;
  litros_dia_por_unidad: number;
}

// ─── Temporadas (Hemisferio Sur) ──────────────────────────────────────────────

const TEMPORADAS = [
  { nombre: 'Verano',    meses_idx: [11, 0, 1],  meses_label: 'Dic · Ene · Feb' },
  { nombre: 'Otoño',     meses_idx: [2,  3, 4],  meses_label: 'Mar · Abr · May' },
  { nombre: 'Invierno',  meses_idx: [5,  6, 7],  meses_label: 'Jun · Jul · Ago' },
  { nombre: 'Primavera', meses_idx: [8,  9, 10], meses_label: 'Sep · Oct · Nov' },
] as const;

// ─── Tipos de resultado ───────────────────────────────────────────────────────

export interface CaptacionPorSuperficie {
  id:           string;
  nombre:       string;
  anual_m3:     number;
  anual_litros: number;
  mensual_m3:   number[];
  porcentaje:   number;
}

export interface ConsumoPorCategoria {
  id:         string;
  nombre:     string;
  tipo:       TipoConsumo;
  litros_dia: number;
  anual_m3:   number;
  mensual_m3: number[];
  porcentaje: number;
}

export interface BalanceTrimestral {
  nombre:       string;
  meses_label:  string;
  captacion_m3: number;
  consumo_m3:   number;
  balance_m3:   number;
}

export interface ResultadoCaptacion {
  // Mensuales (índice 0=enero)
  captacion_mensual_m3:  number[];
  consumo_mensual_m3:    number[];
  balance_mensual_m3:    number[];

  // Anuales
  captacion_anual_m3:     number;
  captacion_anual_litros: number;
  consumo_anual_m3:       number;
  balance_anual_m3:       number;

  // Tanque
  tanque_recomendado_m3: number;
  cobertura_minima_dias: number;
  meses_deficit:         number;

  // Desglose
  consumo_total_litros_dia: number;
  captacion_por_superficie: CaptacionPorSuperficie[];
  consumo_por_categoria:    ConsumoPorCategoria[];
  balance_trimestral:       BalanceTrimestral[];
}

// ─── Días por mes (año no bisiesto) ──────────────────────────────────────────

const DIAS_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

// ─── Cálculo principal ────────────────────────────────────────────────────────

export function calcularCaptacion(
  superficies: Superficie[],
  precipMensual: number[],          // mm por mes, 12 valores
  consumoCategorias: ConsumoCategoria[],
): ResultadoCaptacion {

  // --- Captación por superficie ---
  const captacion_por_superficie_raw = superficies.map(s => {
    const mensual_m3 = precipMensual.map(p =>
      Math.round((p * s.area_m2 * s.coef) / 1000 * 100) / 100,
    );
    const anual_m3 = Math.round(mensual_m3.reduce((sum, v) => sum + v, 0) * 10) / 10;
    return { id: s.id, nombre: s.nombre, anual_m3, anual_litros: Math.round(anual_m3 * 1000), mensual_m3 };
  });

  const captacion_mensual_m3 = Array.from({ length: 12 }, (_, i) =>
    Math.round(captacion_por_superficie_raw.reduce((sum, s) => sum + (s.mensual_m3[i] ?? 0), 0) * 10) / 10,
  );
  const captacion_anual_m3 = Math.round(captacion_mensual_m3.reduce((s, v) => s + v, 0) * 10) / 10;

  const captacion_por_superficie: CaptacionPorSuperficie[] = captacion_por_superficie_raw.map(s => ({
    ...s,
    porcentaje: captacion_anual_m3 > 0 ? Math.round((s.anual_m3 / captacion_anual_m3) * 1000) / 10 : 0,
  }));

  // --- Consumo por categoría ---
  const consumo_por_categoria_raw = consumoCategorias.map(c => {
    const litros_dia = c.cantidad * c.litros_dia_por_unidad;
    const mensual_m3 = DIAS_MES.map(dias => Math.round((litros_dia * dias) / 1000 * 100) / 100);
    const anual_m3   = Math.round(mensual_m3.reduce((sum, v) => sum + v, 0) * 10) / 10;
    return { id: c.id, nombre: c.nombre, tipo: c.tipo, litros_dia, anual_m3, mensual_m3 };
  });

  const consumo_mensual_m3 = Array.from({ length: 12 }, (_, i) =>
    Math.round(consumo_por_categoria_raw.reduce((sum, c) => sum + (c.mensual_m3[i] ?? 0), 0) * 10) / 10,
  );
  const consumo_anual_m3        = Math.round(consumo_mensual_m3.reduce((s, v) => s + v, 0) * 10) / 10;
  const consumo_total_litros_dia = consumoCategorias.reduce((sum, c) => sum + c.cantidad * c.litros_dia_por_unidad, 0);

  const consumo_por_categoria: ConsumoPorCategoria[] = consumo_por_categoria_raw.map(c => ({
    ...c,
    porcentaje: consumo_anual_m3 > 0 ? Math.round((c.anual_m3 / consumo_anual_m3) * 1000) / 10 : 0,
  }));

  // --- Balance mensual y anual ---
  const balance_mensual_m3 = captacion_mensual_m3.map((c, i) =>
    Math.round((c - (consumo_mensual_m3[i] ?? 0)) * 10) / 10,
  );
  const captacion_anual_litros = Math.round(captacion_anual_m3 * 1000);
  const balance_anual_m3       = Math.round((captacion_anual_m3 - consumo_anual_m3) * 10) / 10;
  const meses_deficit          = balance_mensual_m3.filter(b => b < 0).length;

  // --- Tanque recomendado ---
  let acumulado = 0;
  let maxDeficit = 0;
  for (const b of balance_mensual_m3) {
    acumulado  = Math.min(acumulado + b, 0);
    maxDeficit = Math.min(maxDeficit, acumulado);
  }
  const consumo_mes_promedio    = consumo_anual_m3 / 12;
  const tanque_recomendado_m3   = Math.round(
    Math.max(Math.abs(maxDeficit) * 1.2, consumo_mes_promedio * 0.5) * 10,
  ) / 10;

  const captMinMes              = Math.max(Math.min(...captacion_mensual_m3), 0);
  const consumoDiario_m3        = consumo_total_litros_dia / 1000;
  const cobertura_minima_dias   = consumoDiario_m3 > 0 ? Math.round(captMinMes / consumoDiario_m3) : 0;

  // --- Balance trimestral ---
  const balance_trimestral: BalanceTrimestral[] = TEMPORADAS.map(t => {
    const captacion_m3 = Math.round(t.meses_idx.reduce((sum: number, mi) => sum + (captacion_mensual_m3[mi] ?? 0), 0) * 10) / 10;
    const consumo_m3   = Math.round(t.meses_idx.reduce((sum: number, mi) => sum + (consumo_mensual_m3[mi] ?? 0), 0) * 10) / 10;
    return {
      nombre:       t.nombre,
      meses_label:  t.meses_label,
      captacion_m3,
      consumo_m3,
      balance_m3:   Math.round((captacion_m3 - consumo_m3) * 10) / 10,
    };
  });

  return {
    captacion_mensual_m3,
    consumo_mensual_m3,
    balance_mensual_m3,
    captacion_anual_m3,
    captacion_anual_litros,
    consumo_anual_m3,
    balance_anual_m3,
    tanque_recomendado_m3,
    cobertura_minima_dias,
    meses_deficit,
    consumo_total_litros_dia,
    captacion_por_superficie,
    consumo_por_categoria,
    balance_trimestral,
  };
}

// ─── Snapshot para informe / guardar ─────────────────────────────────────────

export interface CaptacionSnapshot {
  superficies:       Superficie[];
  consumoCategorias: ConsumoCategoria[];
  resultado:         ResultadoCaptacion;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export function nuevaSuperficieDefault(): Superficie {
  return {
    id:      crypto.randomUUID(),
    tipo:    'techo_metal',
    nombre:  'Techo principal',
    area_m2: 50,
    coef:    TIPOS_SUPERFICIE.techo_metal.coef,
  };
}

export function nuevaConsumoDefault(): ConsumoCategoria {
  const ref = CONSUMO_REFS.domestico;
  return {
    id:                    crypto.randomUUID(),
    tipo:                  'domestico',
    nombre:                'Uso doméstico',
    cantidad:              4,
    litros_dia_por_unidad: ref.litros_dia_por_unidad,
  };
}
