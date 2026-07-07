/**
 * Riego por sector (C2) — diseño de riego a partir de la evapotranspiración.
 *
 * Cadena de cálculo: ETc = ETo · Kc → necesidad neta → necesidad bruta
 * (÷ eficiencia del sistema) → volumen y caudal del sector. El caudal continuo
 * resultante es el que alimenta un nodo de consumo en la red de agua (B1).
 * Además dimensiona el goteo (nº de emisores, caudal del sistema, horas de riego)
 * y el calendario de riego (lámina, intervalo/turno) según el agua útil del suelo.
 *
 * Método FAO-56 (Allen et al. 1998), simplificado. Valores orientativos de
 * planificación — ajustar con lecturas de humedad reales.
 */

import type { DatosClima } from './clima';
import type { DatosSuelo } from './suelos';
import { MESES } from './clima';

// ─── Cultivos y coeficientes ───────────────────────────────────────────────────
// Kc representativo de media temporada (mid-season) y profundidad radicular
// efectiva (mm) típica. Fuente: FAO-56, tablas 12 y 22 (rangos medios).

export interface Cultivo {
  id:            string;
  nombre:        string;
  kc:            number;   // coeficiente de cultivo (mid-season)
  prof_raiz_mm:  number;   // profundidad radicular efectiva
  agotamiento:   number;   // fracción de agotamiento permitida (p), RAW/TAW
}

export const CULTIVOS: Cultivo[] = [
  { id: 'huerta',    nombre: 'Huerta / hortalizas',   kc: 1.05, prof_raiz_mm: 400,  agotamiento: 0.4 },
  { id: 'frutales',  nombre: 'Frutales de pepita/carozo', kc: 1.15, prof_raiz_mm: 1000, agotamiento: 0.5 },
  { id: 'vid',       nombre: 'Vid',                    kc: 0.70, prof_raiz_mm: 1000, agotamiento: 0.45 },
  { id: 'olivo',     nombre: 'Olivo',                  kc: 0.65, prof_raiz_mm: 1200, agotamiento: 0.65 },
  { id: 'citricos',  nombre: 'Cítricos',              kc: 0.75, prof_raiz_mm: 900,  agotamiento: 0.5 },
  { id: 'aromaticas',nombre: 'Aromáticas / medicinales', kc: 0.90, prof_raiz_mm: 400, agotamiento: 0.45 },
  { id: 'pastura',   nombre: 'Pastura / forraje',      kc: 0.95, prof_raiz_mm: 600,  agotamiento: 0.55 },
  { id: 'cesped',    nombre: 'Césped / jardín',        kc: 0.85, prof_raiz_mm: 300,  agotamiento: 0.4 },
  { id: 'maiz',      nombre: 'Maíz',                   kc: 1.15, prof_raiz_mm: 900,  agotamiento: 0.55 },
  { id: 'forestal',  nombre: 'Forestal / monte joven', kc: 1.00, prof_raiz_mm: 1200, agotamiento: 0.6 },
];

// ─── Sistemas de riego ─────────────────────────────────────────────────────────

export interface SistemaRiego {
  id:          string;
  nombre:      string;
  eficiencia:  number;   // eficiencia de aplicación (0–1)
  caudal_lh:   number;   // caudal por emisor típico (L/h)
  esp_emisor_m:number;   // espaciamiento entre emisores sobre la línea (m)
  esp_lateral_m:number;  // espaciamiento entre líneas (m)
}

export const SISTEMAS: SistemaRiego[] = [
  { id: 'goteo',    nombre: 'Goteo',              eficiencia: 0.90, caudal_lh: 2,  esp_emisor_m: 0.5, esp_lateral_m: 1.0 },
  { id: 'goteo_esp',nombre: 'Goteo espaciado (frutal)', eficiencia: 0.90, caudal_lh: 4, esp_emisor_m: 1.0, esp_lateral_m: 3.0 },
  { id: 'microasp', nombre: 'Microaspersión',     eficiencia: 0.80, caudal_lh: 40, esp_emisor_m: 3.0, esp_lateral_m: 4.0 },
  { id: 'aspersion',nombre: 'Aspersión',          eficiencia: 0.75, caudal_lh: 1000, esp_emisor_m: 12, esp_lateral_m: 12 },
  { id: 'surco',    nombre: 'Surco / manto',      eficiencia: 0.55, caudal_lh: 0,  esp_emisor_m: 0, esp_lateral_m: 0 },
];

// ─── Parámetros y resultado ────────────────────────────────────────────────────

export interface ParamsRiego {
  area_ha:       number;
  cultivo:       Cultivo;
  sistema:       SistemaRiego;
  eto_mes_mm:    number[];    // ETo mensual (mm/mes) — de clima
  precip_mes_mm: number[];    // precipitación mensual (mm/mes) — de clima
  agua_util_mm_m:number;      // agua útil del suelo (mm por metro de profundidad)
  horas_dia:     number;      // horas de operación disponibles por día
}

export interface MesRiego {
  mes:            string;
  etc_mm:         number;   // ETc del mes (mm)
  precip_ef_mm:   number;   // precipitación efectiva (mm)
  neto_mm:        number;   // necesidad neta de riego (mm)
  bruto_mm:       number;   // necesidad bruta (÷ eficiencia)
  volumen_m3:     number;   // volumen para el sector (m³)
}

export interface ResultadoRiego {
  // Diseño en el mes pico
  mes_pico:            string;
  etc_pico_mm_dia:     number;
  neto_pico_mm_dia:    number;
  bruto_pico_mm_dia:   number;
  volumen_pico_m3_dia: number;
  caudal_continuo_ls:  number;   // caudal medio si se regara 24 h — nodo de consumo (B1)
  caudal_operativo_ls: number;   // caudal necesario en las horas de operación
  // Diseño de emisores
  n_emisores:          number | null;
  caudal_sistema_lh:   number | null;
  horas_riego_dia:     number | null;
  // Calendario (turno de riego)
  lamina_neta_mm:      number;   // dosis por riego (RAW)
  lamina_bruta_mm:     number;
  intervalo_dias:      number;   // frecuencia en el mes pico
  tiempo_turno_h:      number | null;
  // Balance anual
  neto_anual_mm:       number;
  volumen_anual_m3:    number;
  meses:               MesRiego[];
  advertencias:        string[];
}

const DIAS_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** Precipitación efectiva mensual — método USDA-SCS simplificado. */
export function precipEfectiva(p_mm: number): number {
  if (p_mm <= 0) return 0;
  if (p_mm <= 250) return Math.round((p_mm * (125 - 0.2 * p_mm) / 125) * 10) / 10;
  return Math.round((125 + 0.1 * p_mm) * 10) / 10;
}

export function calcularRiego(p: ParamsRiego): ResultadoRiego | null {
  if (p.area_ha <= 0) return null;

  const area_m2 = p.area_ha * 10000;
  const ef = Math.max(0.3, Math.min(1, p.sistema.eficiencia));

  // Balance mensual
  const meses: MesRiego[] = MESES.map((nombre, i) => {
    const eto = p.eto_mes_mm[i] ?? 0;
    const etc = eto * p.cultivo.kc;
    const pef = precipEfectiva(p.precip_mes_mm[i] ?? 0);
    const neto = Math.max(0, etc - pef);
    const bruto = neto / ef;
    return {
      mes: nombre,
      etc_mm:       Math.round(etc * 10) / 10,
      precip_ef_mm: Math.round(pef * 10) / 10,
      neto_mm:      Math.round(neto * 10) / 10,
      bruto_mm:     Math.round(bruto * 10) / 10,
      volumen_m3:   Math.round((bruto / 1000) * area_m2),   // mm → m: /1000; ×m² = m³
    };
  });

  // Mes pico = mayor necesidad neta
  let iPico = 0;
  for (let i = 1; i < 12; i++) if (meses[i]!.neto_mm > meses[iPico]!.neto_mm) iPico = i;
  const mp = meses[iPico]!;
  const diasPico = DIAS_MES[iPico] ?? 30;

  const etc_pico_dia   = mp.etc_mm / diasPico;
  const neto_pico_dia  = mp.neto_mm / diasPico;
  const bruto_pico_dia = mp.bruto_mm / diasPico;
  const volumen_pico_dia = (bruto_pico_dia / 1000) * area_m2;   // m³/día

  const caudal_continuo_ls  = (volumen_pico_dia * 1000) / 86400;  // m³/día → L/s (24 h)
  const horas = Math.max(1, Math.min(24, p.horas_dia));
  const caudal_operativo_ls = (volumen_pico_dia * 1000) / (horas * 3600);

  // Diseño de emisores (no aplica a surco/manto)
  let n_emisores: number | null = null;
  let caudal_sistema_lh: number | null = null;
  let horas_riego_dia: number | null = null;
  if (p.sistema.esp_emisor_m > 0 && p.sistema.esp_lateral_m > 0 && p.sistema.caudal_lh > 0) {
    const emisores_ha = 10000 / (p.sistema.esp_emisor_m * p.sistema.esp_lateral_m);
    n_emisores = Math.round(emisores_ha * p.area_ha);
    caudal_sistema_lh = Math.round(n_emisores * p.sistema.caudal_lh);
    // horas de riego para aportar el bruto diario del mes pico
    const litros_dia = volumen_pico_dia * 1000;
    horas_riego_dia = caudal_sistema_lh > 0 ? Math.round((litros_dia / caudal_sistema_lh) * 100) / 100 : null;
  }

  // Calendario — dosis por turno (RAW) según agua útil y profundidad radicular
  const awc_zona_mm = (p.agua_util_mm_m / 1000) * p.cultivo.prof_raiz_mm;  // agua útil en la zona radicular
  const lamina_neta = awc_zona_mm * p.cultivo.agotamiento;                  // RAW = p · TAW
  const lamina_bruta = lamina_neta / ef;
  const intervalo = neto_pico_dia > 0 ? Math.max(1, Math.round(lamina_neta / neto_pico_dia)) : 0;
  let tiempo_turno_h: number | null = null;
  if (caudal_sistema_lh && caudal_sistema_lh > 0) {
    const litros_turno = (lamina_bruta / 1000) * area_m2 * 1000;
    tiempo_turno_h = Math.round((litros_turno / caudal_sistema_lh) * 100) / 100;
  }

  const neto_anual = meses.reduce((s, m) => s + m.neto_mm, 0);
  const volumen_anual = meses.reduce((s, m) => s + m.volumen_m3, 0);

  const advertencias: string[] = [];
  if (neto_anual <= 0) {
    advertencias.push('La lluvia efectiva cubre la demanda todo el año: riego sólo de apoyo en rachas secas.');
  } else {
    advertencias.push(`Pico de riego en ${mp.mes}: ${Math.round(neto_pico_dia * 10) / 10} mm/día netos (${Math.round(bruto_pico_dia * 10) / 10} mm/día brutos con eficiencia ${Math.round(ef * 100)} %).`);
  }
  if (horas_riego_dia !== null && horas_riego_dia > horas) {
    advertencias.push(`El sistema necesita ${horas_riego_dia} h/día en el pico pero hay ${horas} h disponibles: subí el caudal, agregá líneas o dividí el sector en turnos.`);
  }
  if (p.sistema.id === 'surco' || p.sistema.id === 'aspersion') {
    advertencias.push('Sistema de baja eficiencia: el goteo puede ahorrar 30–40 % de agua en clima seco y ventoso.');
  }
  if (intervalo >= 1) {
    advertencias.push(`Turno de riego cada ~${intervalo} día(s) con lámina neta de ${Math.round(lamina_neta)} mm (agua útil de la zona radicular).`);
  }

  return {
    mes_pico: mp.mes,
    etc_pico_mm_dia:   Math.round(etc_pico_dia * 100) / 100,
    neto_pico_mm_dia:  Math.round(neto_pico_dia * 100) / 100,
    bruto_pico_mm_dia: Math.round(bruto_pico_dia * 100) / 100,
    volumen_pico_m3_dia: Math.round(volumen_pico_dia * 100) / 100,
    caudal_continuo_ls:  Math.round(caudal_continuo_ls * 1000) / 1000,
    caudal_operativo_ls: Math.round(caudal_operativo_ls * 100) / 100,
    n_emisores,
    caudal_sistema_lh,
    horas_riego_dia,
    lamina_neta_mm:  Math.round(lamina_neta * 10) / 10,
    lamina_bruta_mm: Math.round(lamina_bruta * 10) / 10,
    intervalo_dias:  intervalo,
    tiempo_turno_h,
    neto_anual_mm:   Math.round(neto_anual),
    volumen_anual_m3: Math.round(volumen_anual),
    meses,
    advertencias,
  };
}

// ─── Resumen para el informe ───────────────────────────────────────────────────

export interface RiegoResumen {
  cultivo:             string;
  sistema:             string;
  area_ha:             number;
  mes_pico:            string;
  neto_pico_mm_dia:    number;
  caudal_continuo_ls:  number;
  volumen_anual_m3:    number;
  intervalo_dias:      number;
  lamina_neta_mm:      number;
}

/** Extrae ETo y precipitación mensual de los datos de clima para el motor de riego. */
export function seriesClima(clima: DatosClima): { eto: number[]; precip: number[] } {
  return {
    eto:    clima.meses.map(m => m.etp_mm),
    precip: clima.meses.map(m => m.precip_mm),
  };
}

/** Agua útil por metro (mm/m) a partir del perfil de suelo (0–100 cm). */
export function aguaUtilPorMetro(suelo: DatosSuelo): number {
  // total_mm_100 es la AWC de 0–100 cm ≈ mm por metro
  return Math.round(suelo.agua_util.total_mm_100);
}
