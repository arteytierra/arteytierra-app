/**
 * Calendario agroclimático: ventanas de siembra, GDD y balance por cultivo.
 * Calculado 100% desde datos de NASA POWER (DatosClima).
 * Sin APIs adicionales — completamente offline una vez cargado el clima.
 */
import type { DatosClima, MesDato } from './clima';
import { MESES } from './clima';

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

// ─── Grados-día de crecimiento (GDD) ─────────────────────────────────────────

export interface GDDMes {
  index:      number;
  nombre:     string;
  gdd:        number;   // GDD del mes
  acumulado:  number;   // GDD acumulado hasta este mes (suma anual progresiva)
}

export function calcularGDD(meses: MesDato[], base = 10): GDDMes[] {
  let acum = 0;
  return meses.map((m, i) => {
    const dias = DAYS_IN_MONTH[i] ?? 30;
    const gdd  = Math.max(0, m.tmean_c - base) * dias;
    acum += gdd;
    return { index: i, nombre: MESES[i] ?? '', gdd: Math.round(gdd), acumulado: Math.round(acum) };
  });
}

// ─── Balance hídrico por cultivo (Kc FAO-56 simplificado) ────────────────────

export interface CultivoKc {
  id:     string;
  nombre: string;
  kc:     number;   // Kc promedio anual (simplificado)
}

export const CULTIVOS_KC: CultivoKc[] = [
  { id: 'huerta',    nombre: 'Huerta mixta',   kc: 0.90 },
  { id: 'tomate',    nombre: 'Tomate',          kc: 1.15 },
  { id: 'maiz',      nombre: 'Maíz',            kc: 1.20 },
  { id: 'alfalfa',   nombre: 'Alfalfa',         kc: 0.95 },
  { id: 'papa',      nombre: 'Papa',            kc: 1.15 },
  { id: 'zapallo',   nombre: 'Zapallo/Cucurb.', kc: 1.00 },
  { id: 'soja',      nombre: 'Soja',            kc: 1.15 },
  { id: 'pasturas',  nombre: 'Pasturas',        kc: 0.85 },
  { id: 'olivo',     nombre: 'Olivo',           kc: 0.65 },
  { id: 'girasol',   nombre: 'Girasol',         kc: 1.05 },
];

export interface BalanceCultivoMes {
  index:     number;
  nombre:    string;
  etc_mm:    number;   // Evapotranspiración del cultivo = ETP × Kc
  precip_mm: number;
  balance:   number;   // precip - ETc (positivo = superávit, negativo = déficit)
}

export function calcularBalanceCultivo(meses: MesDato[], kc: number): BalanceCultivoMes[] {
  return meses.map((m, i) => {
    const etc_mm = Math.round(m.etp_mm * kc * 10) / 10;
    return {
      index:     i,
      nombre:    MESES[i] ?? '',
      etc_mm,
      precip_mm: m.precip_mm,
      balance:   Math.round((m.precip_mm - etc_mm) * 10) / 10,
    };
  });
}

// ─── Familias vegetales ────────────────────────────────────────────────────────

export type AptitudMes = 'optimo' | 'posible' | 'no_apto';

export interface FamiliaVegetal {
  id:            string;
  nombre:        string;
  ejemplos:      string;
  tmin_opt:      number;   // °C mín crecimiento óptimo
  tmax_opt:      number;   // °C máx crecimiento óptimo
  tmin_limite:   number;   // °C mín absoluto (daño)
  tmax_limite:   number;   // °C máx absoluto (daño)
  tolera_helada: boolean;
  agua:          'bajo' | 'medio' | 'alto';
  color:         string;   // Tailwind bg class para la fila
}

export const FAMILIAS: FamiliaVegetal[] = [
  {
    id: 'hoja', nombre: 'Hortalizas de hoja', ejemplos: 'lechuga, espinaca, acelga, rúcula',
    tmin_opt: 8, tmax_opt: 20, tmin_limite: 2, tmax_limite: 28,
    tolera_helada: false, agua: 'medio', color: 'bg-green-100',
  },
  {
    id: 'cruciferas', nombre: 'Crucíferas', ejemplos: 'brócoli, repollo, coliflor, kale',
    tmin_opt: 7, tmax_opt: 18, tmin_limite: -2, tmax_limite: 25,
    tolera_helada: true, agua: 'medio', color: 'bg-emerald-100',
  },
  {
    id: 'solanaceas', nombre: 'Solanáceas', ejemplos: 'tomate, pimiento, berenjena',
    tmin_opt: 18, tmax_opt: 30, tmin_limite: 10, tmax_limite: 36,
    tolera_helada: false, agua: 'alto', color: 'bg-red-100',
  },
  {
    id: 'cucurbitaceas', nombre: 'Cucurbitáceas', ejemplos: 'zapallo, pepino, sandía, melón',
    tmin_opt: 22, tmax_opt: 32, tmin_limite: 15, tmax_limite: 38,
    tolera_helada: false, agua: 'alto', color: 'bg-yellow-100',
  },
  {
    id: 'leguminosas', nombre: 'Leguminosas', ejemplos: 'poroto, arveja, haba, soja',
    tmin_opt: 12, tmax_opt: 26, tmin_limite: 5, tmax_limite: 32,
    tolera_helada: false, agua: 'medio', color: 'bg-lime-100',
  },
  {
    id: 'raices', nombre: 'Raíces y tubérculos', ejemplos: 'zanahoria, remolacha, ajo, papa',
    tmin_opt: 10, tmax_opt: 20, tmin_limite: 0, tmax_limite: 28,
    tolera_helada: true, agua: 'medio', color: 'bg-orange-100',
  },
  {
    id: 'aromaticas', nombre: 'Aromáticas y medicinales', ejemplos: 'albahaca, perejil, cilantro, orégano',
    tmin_opt: 14, tmax_opt: 28, tmin_limite: 5, tmax_limite: 35,
    tolera_helada: false, agua: 'bajo', color: 'bg-purple-100',
  },
  {
    id: 'cereales', nombre: 'Cereales / gramíneas', ejemplos: 'maíz, trigo, avena, sorgo',
    tmin_opt: 15, tmax_opt: 30, tmin_limite: 5, tmax_limite: 38,
    tolera_helada: false, agua: 'medio', color: 'bg-amber-100',
  },
  {
    id: 'frutales', nombre: 'Frutales menores', ejemplos: 'frutilla, frambuesa, arándano, higo',
    tmin_opt: 12, tmax_opt: 24, tmin_limite: -2, tmax_limite: 32,
    tolera_helada: true, agua: 'medio', color: 'bg-pink-100',
  },
];

// ─── Aptitud por mes ──────────────────────────────────────────────────────────

export function aptitudMes(m: MesDato, f: FamiliaVegetal): AptitudMes {
  const heladaFuerte  = m.tmin_c < -3;
  const heladaReal    = m.tmin_c <= 0;
  const heladaPosible = m.tmin_c <= 2;

  // Helada fuerte mata a casi todo
  if (heladaFuerte && !f.tolera_helada) return 'no_apto';
  if (heladaFuerte) return 'posible';

  // Temperatura fuera de límites absolutos
  if (m.tmean_c < f.tmin_limite || m.tmean_c > f.tmax_limite) return 'no_apto';

  // Helada real
  if (heladaReal && !f.tolera_helada) return 'no_apto';

  // Posible helada
  if (heladaPosible && !f.tolera_helada) return 'posible';

  // Fuera del rango óptimo pero dentro de límites
  if (m.tmean_c < f.tmin_opt - 2 || m.tmean_c > f.tmax_opt + 3) return 'posible';

  return 'optimo';
}

// ─── Resultado completo ───────────────────────────────────────────────────────

export interface CalendarioMes {
  index:       number;
  nombre:      string;
  tmean:       number;
  tmin:        number;
  tmax:        number;
  precip:      number;
  balance:     number;
  helada:      boolean;
  helada_p:    boolean;  // tmin <= 2 (riesgo de helada)
  seco:        boolean;  // balance < -20
  lluvioso:    boolean;  // balance > 20
  aptitud:     Record<string, AptitudMes>;
}

export interface ResumenCalendario {
  meses:                  CalendarioMes[];
  periodo_libre_heladas:  { inicio: number; fin: number; duracion: number } | null;
  meses_helada_count:     number;
  meses_secos_count:      number;
  mes_mas_calido:         number;
  mes_mas_frio:           number;
  mes_mas_lluvioso:       number;
  mes_mas_seco:           number;
}

export function calcularCalendario(datos: DatosClima): ResumenCalendario {
  const meses: CalendarioMes[] = datos.meses.map((m, i) => ({
    index:    i,
    nombre:   MESES[i] ?? '',
    tmean:    m.tmean_c,
    tmin:     m.tmin_c,
    tmax:     m.tmax_c,
    precip:   m.precip_mm,
    balance:  m.balance_mm,
    helada:   m.tmin_c <= 0,
    helada_p: m.tmin_c <= 2,
    seco:     m.balance_mm < -20,
    lluvioso: m.balance_mm > 20,
    aptitud:  Object.fromEntries(FAMILIAS.map(f => [f.id, aptitudMes(m, f)])),
  }));

  const frostSet = new Set(meses.filter(m => m.helada).map(m => m.index));

  // Período libre de heladas más largo (búsqueda circular para hemisferio sur)
  let bestStart = 0, bestLen = 0, curStart = 0, curLen = 0;
  for (let i = 0; i < 24; i++) {
    if (!frostSet.has(i % 12)) {
      if (curLen === 0) curStart = i % 12;
      curLen++;
      if (curLen > bestLen) { bestLen = curLen; bestStart = curStart; }
    } else {
      curLen = 0;
    }
    if (bestLen >= 12) break;
  }

  const { meses: ms } = datos;
  return {
    meses,
    periodo_libre_heladas: bestLen > 0 ? {
      inicio:   bestStart,
      fin:      (bestStart + bestLen - 1) % 12,
      duracion: Math.min(bestLen, 12),
    } : null,
    meses_helada_count: frostSet.size,
    meses_secos_count:  meses.filter(m => m.seco).length,
    mes_mas_calido:     ms.reduce((b, m, i) => m.tmean_c   > ms[b]!.tmean_c   ? i : b, 0),
    mes_mas_frio:       ms.reduce((b, m, i) => m.tmean_c   < ms[b]!.tmean_c   ? i : b, 0),
    mes_mas_lluvioso:   ms.reduce((b, m, i) => m.precip_mm > ms[b]!.precip_mm ? i : b, 0),
    mes_mas_seco:       ms.reduce((b, m, i) => m.precip_mm < ms[b]!.precip_mm ? i : b, 0),
  };
}
