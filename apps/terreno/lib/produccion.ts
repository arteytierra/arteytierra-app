/**
 * Módulo de sistemas productivos agropecuarios.
 * 7.1 Balance hídrico productivo (FAO-56 simplificado)
 * 7.3 Receptividad ganadera y agua por potrero
 * 7.5 Cortinas rompevientos
 * Todos los valores son orientativos — no reemplazan asesoramiento agronómico.
 */
import type { MesDato } from './clima';
import { MESES } from './clima';
import { CULTIVOS_KC, type CultivoKc } from './calendario';

export { CULTIVOS_KC, type CultivoKc };

const DIAS_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

// ─── 7.1 Balance hídrico productivo ──────────────────────────────────────────

export interface BalanceProdMes {
  mes:                 string;
  precip_mm:           number;
  etc_mm:              number;   // ETP × Kc
  deficit_mm:          number;   // max(0, ETc − precip)
  superavit_mm:        number;   // max(0, precip − ETc)
  volumen_deficit_m3:  number;   // déficit × área_ha × 10
}

export interface ResultadoBalanceProd {
  cultivo:             CultivoKc;
  area_ha:             number;
  meses:               BalanceProdMes[];
  deficit_anual_mm:    number;
  reservorio_m3:       number;   // volumen total a almacenar para cubrir déficits
  meses_deficit:       number;
  meses_exceso:        number;
}

export function calcularBalanceProductivo(
  meses: MesDato[],
  cultivo: CultivoKc,
  area_ha: number,
): ResultadoBalanceProd {
  const resultMeses: BalanceProdMes[] = meses.map((m, i) => {
    const etc_mm       = Math.round(m.etp_mm * cultivo.kc * 10) / 10;
    const deficit_mm   = Math.round(Math.max(0, etc_mm - m.precip_mm) * 10) / 10;
    const superavit_mm = Math.round(Math.max(0, m.precip_mm - etc_mm) * 10) / 10;
    return {
      mes:               MESES[i] ?? '',
      precip_mm:         m.precip_mm,
      etc_mm,
      deficit_mm,
      superavit_mm,
      volumen_deficit_m3: Math.round(deficit_mm * area_ha * 10 * 10) / 10,
    };
  });

  const deficit_anual_mm = Math.round(resultMeses.reduce((s, m) => s + m.deficit_mm, 0) * 10) / 10;
  const reservorio_m3    = Math.round(resultMeses.reduce((s, m) => s + m.volumen_deficit_m3, 0) * 10) / 10;
  const meses_deficit    = resultMeses.filter(m => m.deficit_mm > 0).length;
  const meses_exceso     = resultMeses.filter(m => m.superavit_mm > 0).length;

  return { cultivo, area_ha, meses: resultMeses, deficit_anual_mm, reservorio_m3, meses_deficit, meses_exceso };
}

// ─── 7.3 Receptividad ganadera ────────────────────────────────────────────────

export interface TipoAnimal {
  id:          string;
  nombre:      string;
  ev:          number;   // equivalentes vaca
  agua_l_dia:  number;
}

export const TIPOS_ANIMAL: TipoAnimal[] = [
  { id: 'bovino',    nombre: 'Bovinos adultos',     ev: 1.00, agua_l_dia: 50  },
  { id: 'bovino_j',  nombre: 'Bovinos jóvenes',     ev: 0.50, agua_l_dia: 30  },
  { id: 'equino',    nombre: 'Equinos',              ev: 1.25, agua_l_dia: 50  },
  { id: 'ovino',     nombre: 'Ovinos',               ev: 0.15, agua_l_dia: 6   },
  { id: 'caprino',   nombre: 'Caprinos',             ev: 0.12, agua_l_dia: 5   },
  { id: 'porcino',   nombre: 'Porcinos',             ev: 0.30, agua_l_dia: 20  },
];

// Producción forrajera natural estimada por precipitación (kg MS/ha/año)
function prodForrajera(precip_mm: number): number {
  if (precip_mm < 300) return 700;
  if (precip_mm < 500) return 1500;
  if (precip_mm < 700) return 3000;
  if (precip_mm < 900) return 5000;
  return 7000;
}

export interface ResultadoReceptividad {
  ef_kg_ha:         number;   // equivalente forrajero por hectárea
  carga_ev:         number;   // carga total en equivalentes vaca
  carga_animales:   number;   // animales del tipo seleccionado
  agua_l_dia:       number;   // demanda hídrica total L/día
  potreros_voisin:  number;   // N potreros sugeridos para rotación Voisin
  dias_ocupacion:   number;   // días de ocupación por potrero
  area_potrero_ha:  number;   // área sugerida por potrero
}

export function calcularReceptividad(
  area_ha: number,
  precip_anual_mm: number,
  tipo: TipoAnimal,
): ResultadoReceptividad {
  const ef_kg_ha       = prodForrajera(precip_anual_mm);
  const eficiencia     = 0.50; // 50% de utilización del forraje disponible
  const consumo_ev_año = 8 * 365; // kg MS/año para 1 EV
  const carga_ev       = Math.round((ef_kg_ha * area_ha * eficiencia / consumo_ev_año) * 10) / 10;
  const carga_animales = Math.max(0, Math.floor(carga_ev / tipo.ev));

  // Voisin: 30 días reposo + 3 días ocupación → 11 potreros como mínimo, ajuste por área
  const dias_reposo    = 30;
  const dias_ocupacion = 3;
  const potreros_voisin = Math.max(6, Math.round((dias_reposo / dias_ocupacion) + 1));
  const area_potrero_ha = Math.round((area_ha / potreros_voisin) * 100) / 100;

  return {
    ef_kg_ha,
    carga_ev,
    carga_animales,
    agua_l_dia: Math.round(carga_animales * tipo.agua_l_dia),
    potreros_voisin,
    dias_ocupacion,
    area_potrero_ha,
  };
}

// ─── 7.5 Cortinas rompevientos ────────────────────────────────────────────────

const AZIMUT_DIR: Record<string, number> = {
  N: 0, NE: 45, E: 90, SE: 135, S: 180, SO: 225, O: 270, NO: 315,
};

export const ESPECIES_ROMPEVIENTOS: Record<string, string[]> = {
  default: [
    'Algarrobo blanco (Prosopis alba)',
    'Espinillo (Vachellia caven)',
    'Sombra de toro (Jodina rhombifolia)',
    'Molle de beber (Schinus fasciculatus)',
    'Tala (Celtis ehrenbergiana)',
  ],
  Chaco: [
    'Quebracho blanco (Aspidosperma quebracho-blanco)',
    'Algarrobo negro (Prosopis nigra)',
    'Brea (Cercidium praecox)',
  ],
};

export interface CortinaSugerida {
  a:            { lat: number; lng: number };
  b:            { lat: number; lng: number };
  longitud_m:   number;
  azimut_perp:  number;
  dir_viento:   string;
  zona_prot_m:  number;   // radio de protección = 10× altura estimada (10 m)
  especies:     string[];
}

export function calcularCortinas(
  viento_dir_ppal: string,
  mojones: Array<{ lat: number; lng: number }>,
): CortinaSugerida[] {
  if (mojones.length < 3) return [];

  const lat  = mojones.reduce((s, m) => s + m.lat, 0) / mojones.length;
  const lng  = mojones.reduce((s, m) => s + m.lng, 0) / mojones.length;
  const azViento = AZIMUT_DIR[viento_dir_ppal] ?? 180;
  const azPerp   = (azViento + 90) % 360;
  const radPerp  = azPerp  * Math.PI / 180;

  // Generar 2 cortinas paralelas atravesando el predio
  const resultado: CortinaSugerida[] = [-0.0015, 0.0015].map(offset => {
    const cx = lat + offset * Math.sin(azViento * Math.PI / 180);
    const cy = lng + offset * Math.cos(azViento * Math.PI / 180);
    const d  = 0.0025;
    return {
      a:           { lat: cx + d * Math.cos(radPerp), lng: cy + d * Math.sin(radPerp) },
      b:           { lat: cx - d * Math.cos(radPerp), lng: cy - d * Math.sin(radPerp) },
      longitud_m:  Math.round(d * 2 * 111000),
      azimut_perp: azPerp,
      dir_viento:  viento_dir_ppal,
      zona_prot_m: 100, // 10 m altura × 10
      especies:    ESPECIES_ROMPEVIENTOS.default!,
    };
  });

  return resultado;
}

// ─── 7.4 Erosión hídrica USLE simplificado ────────────────────────────────────

export interface RiesgoErosion { pendiente_pct: number; nivel: 'bajo' | 'moderado' | 'alto' | 'muy_alto'; score: number }

export function nivelErosion(pendiente_pct: number, precip_anual_mm: number): RiesgoErosion {
  // Factor LS simplificado solo por pendiente
  const ls  = Math.min(10, Math.pow(pendiente_pct / 100, 0.4) * Math.pow(pendiente_pct, 1.3) * 0.065);
  // Factor R (erosividad lluvia) proporcional a precipitación
  const r   = precip_anual_mm * 0.03;
  const score = Math.min(100, Math.round(ls * r));
  const nivel = score < 15 ? 'bajo' : score < 40 ? 'moderado' : score < 70 ? 'alto' : 'muy_alto';
  return { pendiente_pct, nivel, score };
}
