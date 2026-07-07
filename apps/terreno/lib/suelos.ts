/**
 * Análisis de suelo vía SoilGrids (ISRIC).
 * API pública, sin clave. Resolución ~250 m.
 * Perfil completo 0–200 cm (6 profundidades estándar SoilGrids).
 * Agua útil y grupo hidrológico estimados por pedotransferencia
 * Saxton & Rawls (2006). Orientativos — no reemplazan análisis de laboratorio.
 * https://www.isric.org/explore/soilgrids
 */

/** Una capa del perfil, con propiedades e hidráulica derivada. */
export interface CapaSuelo {
  label:         string;   // '0-5cm'
  prof_top:      number;   // cm
  prof_bot:      number;   // cm
  espesor_mm:    number;
  ph:            number;
  carbono_org:   number;   // g/kg
  arcilla:       number;   // %
  arena:         number;   // %
  limo:          number;   // %
  densidad_ap:   number;   // g/cm³
  nitrogeno:     number;   // g/kg
  clase_textura: string;
  // Hidráulica (Saxton-Rawls) — fracciones volumétricas (m³/m³)
  pmp:           number;   // punto de marchitez permanente (θ1500)
  cc:            number;   // capacidad de campo (θ33)
  sat:           number;   // saturación (θS)
  awc_frac:      number;   // agua útil = cc − pmp
  awc_mm:        number;   // agua útil de la capa (mm)
  ksat:          number;   // conductividad hidráulica saturada (mm/h)
}

/** Resumen de agua útil (capacidad de almacenamiento de agua disponible). */
export interface AguaUtilPerfil {
  total_mm_100:  number;   // AWC acumulada 0–100 cm (zona radicular típica)
  total_mm_200:  number;   // AWC acumulada 0–200 cm
  por_capa:      Array<{ label: string; awc_mm: number }>;
  clase:         string;
  color:         'verde' | 'amarillo' | 'rojo';
  descripcion:   string;
}

/** Grupo hidrológico SCS/NRCS (A/B/C/D) para curva número y escorrentía. */
export interface GrupoHidrologico {
  grupo:         'A' | 'B' | 'C' | 'D';
  ksat_min:      number;   // mm/h de la capa más limitante (0–100 cm)
  capa_limitante:string;
  cn_pastura:    number;   // CN de referencia (pastura en buen estado)
  infiltracion:  string;
  descripcion:   string;
}

export interface DatosSuelo {
  lat:           number;
  lng:           number;
  ph:            number;   // pH en agua (0–5 cm, superficial)
  carbono_org:   number;   // Carbono orgánico g/kg (0–5 cm)
  arcilla:       number;   // % arcilla (0–5 cm)
  arena:         number;   // % arena (0–5 cm)
  limo:          number;   // % limo (0–5 cm)
  densidad_ap:   number;   // Densidad aparente g/cm³ (0–5 cm)
  nitrogeno:     number;   // Nitrógeno total g/kg (0–5 cm)
  clase_textura: string;
  interp:        InterpSuelo;
  perfil:        CapaSuelo[];       // 6 capas 0–200 cm
  agua_util:     AguaUtilPerfil;
  grupo_hidro:   GrupoHidrologico;
  fuente:        string;
}

export interface InterpItem {
  clase:       string;
  descripcion: string;
  color:       'verde' | 'amarillo' | 'rojo';
}

export interface InterpSuelo {
  ph:         InterpItem;
  carbono:    InterpItem;
  textura:    { clase: string; descripcion: string };
  fertilidad: InterpItem;
  recomendaciones: string[];
}

// ─── SoilGrids API ────────────────────────────────────────────────────────────

interface SoilGridsLayer {
  name:         string;
  unit_measure: { d_factor: number };
  depths: Array<{
    label:  string;
    values: { mean: number | null };
  }>;
}

interface SoilGridsResponse {
  properties: { layers: SoilGridsLayer[] };
}

/** Profundidades estándar SoilGrids con su rango top/bottom en cm. */
const DEPTHS: Array<{ label: string; top: number; bot: number }> = [
  { label: '0-5cm',     top: 0,   bot: 5   },
  { label: '5-15cm',    top: 5,   bot: 15  },
  { label: '15-30cm',   top: 15,  bot: 30  },
  { label: '30-60cm',   top: 30,  bot: 60  },
  { label: '60-100cm',  top: 60,  bot: 100 },
  { label: '100-200cm', top: 100, bot: 200 },
];

export async function obtenerSuelo(lat: number, lng: number): Promise<DatosSuelo> {
  const url = `/api/suelo?lat=${lat.toFixed(4)}&lng=${lng.toFixed(4)}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 35_000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    const json = await res.json() as SoilGridsResponse & { error?: string };
    if (json.error) throw new Error(json.error);
    if (!res.ok) throw new Error(`SoilGrids respondió ${res.status}`);

    const layers = json.properties.layers;

    // Lee la propiedad `name` en la profundidad índice `di`, aplicando d_factor.
    function val(name: string, di: number): number {
      const layer = layers.find(l => l.name === name);
      if (!layer) return 0;
      const raw = layer.depths[di]?.values?.mean ?? null;
      if (raw === null) return 0;
      const df  = layer.unit_measure.d_factor || 1;
      return Math.round((raw / df) * 100) / 100;
    }

    // ── Construye el perfil (una CapaSuelo por profundidad) ──────────────────
    const perfil: CapaSuelo[] = DEPTHS.map((d, di) => {
      const ph          = val('phh2o', di);
      const carbono_org = val('soc', di);
      const arcilla     = val('clay', di);
      const arena       = val('sand', di);
      const limo        = val('silt', di);
      const densidad_ap = val('bdod', di);
      const nitrogeno   = val('nitrogen', di);
      const espesor_mm  = (d.bot - d.top) * 10;

      // Materia orgánica % ≈ SOC% × 1.724 (factor Van Bemmelen). SOC g/kg → %: ÷10.
      const om = (carbono_org / 10) * 1.724;
      const sr = saxtonRawls(arena, arcilla, om);

      return {
        label: d.label, prof_top: d.top, prof_bot: d.bot, espesor_mm,
        ph, carbono_org, arcilla, arena, limo, densidad_ap, nitrogeno,
        clase_textura: clasificarTextura(arcilla, arena, limo),
        pmp: sr.pmp, cc: sr.cc, sat: sr.sat,
        awc_frac: sr.awc_frac,
        awc_mm: Math.round(sr.awc_frac * espesor_mm * 10) / 10,
        ksat: Math.round(sr.ksat * 100) / 100,
      };
    });

    const sup = perfil[0]!;   // capa superficial 0–5 cm para el resumen
    const clase_textura = sup.clase_textura;
    const interp = interpretarSuelo(sup.ph, sup.carbono_org, sup.arcilla, sup.arena, clase_textura, sup.nitrogeno);
    const agua_util   = resumirAguaUtil(perfil);
    const grupo_hidro = grupoHidrologico(perfil);

    return {
      lat, lng,
      ph: sup.ph, carbono_org: sup.carbono_org,
      arcilla: sup.arcilla, arena: sup.arena, limo: sup.limo,
      densidad_ap: sup.densidad_ap, nitrogeno: sup.nitrogeno,
      clase_textura, interp, perfil, agua_util, grupo_hidro,
      fuente: 'ISRIC SoilGrids v2.0 (0–200 cm, ~250 m) · agua útil y grupo hidrológico por pedotransferencia Saxton-Rawls (2006) — orientativo',
    };
  } finally {
    clearTimeout(timer);
  }
}

// ─── Pedotransferencia Saxton & Rawls (2006) ──────────────────────────────────
// Estima humedad a marchitez (1500 kPa), capacidad de campo (33 kPa),
// saturación y Ksat a partir de arena, arcilla y materia orgánica.
// Entrada: arena/arcilla en %, materia orgánica en % en peso.

function saxtonRawls(arenaPct: number, arcillaPct: number, omPct: number): {
  pmp: number; cc: number; sat: number; awc_frac: number; ksat: number;
} {
  const S  = Math.max(0, Math.min(1, arenaPct / 100));
  const C  = Math.max(0, Math.min(1, arcillaPct / 100));
  const OM = Math.max(0, Math.min(8, omPct));   // válido ~0–8 %

  // θ1500 — marchitez permanente
  const t1500  = -0.024 * S + 0.487 * C + 0.006 * OM + 0.005 * (S * OM) - 0.013 * (C * OM) + 0.068 * (S * C) + 0.031;
  const th1500 = t1500 + (0.14 * t1500 - 0.02);

  // θ33 — capacidad de campo
  const t33  = -0.251 * S + 0.195 * C + 0.011 * OM + 0.006 * (S * OM) - 0.027 * (C * OM) + 0.452 * (S * C) + 0.299;
  const th33 = t33 + (1.283 * t33 * t33 - 0.374 * t33 - 0.015);

  // θ(S-33) — porosidad de aireación
  const tS33  = 0.278 * S + 0.034 * C + 0.022 * OM - 0.018 * (S * OM) - 0.027 * (C * OM) - 0.584 * (S * C) + 0.078;
  const thS33 = tS33 + (0.636 * tS33 - 0.107);

  // θS — saturación
  const thS = th33 + thS33 - 0.097 * S + 0.043;

  // Ksat (mm/h) — modelo de Campbell con exponente B
  const B      = (Math.log(1500) - Math.log(33)) / (Math.log(th33) - Math.log(th1500));
  const lambda = 1 / B;
  const ksatRaw = 1930 * Math.pow(Math.max(0, thS - th33), 3 - lambda);
  const ksat    = Number.isFinite(ksatRaw) ? ksatRaw : 0;

  return {
    pmp: Math.max(0, th1500),
    cc:  Math.max(0, th33),
    sat: Math.max(0, thS),
    awc_frac: Math.max(0, th33 - th1500),
    ksat,
  };
}

// ─── Resumen de agua útil del perfil ──────────────────────────────────────────

function resumirAguaUtil(perfil: CapaSuelo[]): AguaUtilPerfil {
  const por_capa = perfil.map(c => ({ label: c.label, awc_mm: c.awc_mm }));
  const total_mm_100 = Math.round(perfil.filter(c => c.prof_top < 100).reduce((s, c) => s + c.awc_mm, 0) * 10) / 10;
  const total_mm_200 = Math.round(perfil.reduce((s, c) => s + c.awc_mm, 0) * 10) / 10;

  const { clase, color, descripcion } =
    total_mm_100 < 75  ? { clase: 'Baja',      color: 'rojo'     as const, descripcion: 'Poca reserva de agua en el suelo. Riego frecuente y en dosis chicas; priorizar materia orgánica y mulching para aumentar retención.' } :
    total_mm_100 < 150 ? { clase: 'Moderada',  color: 'amarillo' as const, descripcion: 'Reserva de agua media. Permite intervalos de riego razonables; cobertura para reducir evaporación.' } :
                         { clase: 'Alta',      color: 'verde'    as const, descripcion: 'Buena reserva de agua útil. Tolera períodos secos más largos entre riegos o lluvias.' };

  return { total_mm_100, total_mm_200, por_capa, clase, color, descripcion };
}

// ─── Grupo hidrológico SCS/NRCS ───────────────────────────────────────────────
// Se asigna por la Ksat de la capa MÁS limitante en los primeros 100 cm.
// Umbrales NRCS (μm/s → mm/h): A>144, B 36–144, C 3.6–36, D<3.6.

function grupoHidrologico(perfil: CapaSuelo[]): GrupoHidrologico {
  const capas = perfil.filter(c => c.prof_top < 100);
  const lim = capas.reduce((min, c) => (c.ksat < min.ksat ? c : min), capas[0]!);
  const k = lim.ksat;

  const def =
    k > 144 ? { grupo: 'A' as const, cn_pastura: 39, infiltracion: 'Muy alta',  descripcion: 'Suelos arenosos, drenaje libre. Escasa escorrentía, mucha infiltración.' } :
    k > 36  ? { grupo: 'B' as const, cn_pastura: 61, infiltracion: 'Moderada',  descripcion: 'Suelos franco-arenosos. Infiltración moderada, escorrentía baja-media.' } :
    k > 3.6 ? { grupo: 'C' as const, cn_pastura: 74, infiltracion: 'Lenta',     descripcion: 'Suelos franco-arcillosos. Infiltración lenta, escorrentía apreciable.' } :
              { grupo: 'D' as const, cn_pastura: 80, infiltracion: 'Muy lenta', descripcion: 'Suelos arcillosos/expansivos. Poca infiltración, alta escorrentía y anegamiento.' };

  return { ...def, ksat_min: k, capa_limitante: lim.label };
}

// ─── Clasificación textural USDA (simplificada) ───────────────────────────────

function clasificarTextura(arc: number, are: number, li: number): string {
  if (arc >= 40)                   return 'Arcilloso';
  if (arc >= 35 && are <= 45)      return 'Arcillo-limoso';
  if (arc >= 28 && are > 45)       return 'Arcillo-arenoso';
  if (arc >= 20 && arc < 35 && li >= 15 && are < 45) return 'Franco-arcilloso';
  if (are >= 85 && arc < 10)       return 'Arenoso';
  if (are >= 70 && arc < 15)       return 'Arenoso-franco';
  if (li >= 80)                    return 'Limoso';
  if (li >= 50 && arc < 27)        return 'Franco-limoso';
  if (are >= 52 && arc < 20)       return 'Franco-arenoso';
  return 'Franco';
}

// ─── Interpretación agronómica ────────────────────────────────────────────────

function interpretarSuelo(
  ph:  number,
  co:  number,
  arc: number,
  are: number,
  tex: string,
  n:   number,
): InterpSuelo {

  // pH
  const phItem: InterpItem =
    ph < 4.5 ? { clase: 'Extremadamente ácido',  descripcion: 'Toxicidad severa por Al y Mn. Requiere encalado urgente.',            color: 'rojo'     } :
    ph < 5.5 ? { clase: 'Muy ácido',             descripcion: 'Posible toxicidad por Al. Encalar para subir a 6.0–6.5.',            color: 'rojo'     } :
    ph < 6.0 ? { clase: 'Ácido',                 descripcion: 'Aceptable para muchos cultivos. Monitorear micronutrientes.',         color: 'amarillo' } :
    ph <= 7.0 ? { clase: 'Neutro',               descripcion: 'Óptimo para la gran mayoría de cultivos.',                           color: 'verde'    } :
    ph <= 7.5 ? { clase: 'Levemente alcalino',   descripcion: 'Buen rango. Atención a disponibilidad de Zn, Fe y Mn.',              color: 'verde'    } :
    ph <= 8.5 ? { clase: 'Alcalino',             descripcion: 'Puede limitar micronutrientes. Enmiendas con azufre o materia org.', color: 'amarillo' } :
                { clase: 'Muy alcalino',         descripcion: 'Riesgo de sodicidad. Consultar especialista.',                       color: 'rojo'     };

  // Carbono orgánico
  const carbonoItem: InterpItem =
    co < 3  ? { clase: 'Muy bajo',  descripcion: 'Suelo muy degradado. Prioridad: abonos verdes, compost, mulching.',           color: 'rojo'     } :
    co < 10 ? { clase: 'Bajo',      descripcion: 'Bajo MO. Incorporar compost, coberturas y evitar labranza excesiva.',          color: 'amarillo' } :
    co < 20 ? { clase: 'Medio',     descripcion: 'Nivel aceptable. Mantener con coberturas y aporte orgánico anual.',            color: 'verde'    } :
    co < 35 ? { clase: 'Alto',      descripcion: 'Buen nivel de MO. Indica suelo con actividad biológica activa.',              color: 'verde'    } :
              { clase: 'Muy alto',  descripcion: 'Excelente. Suelo posiblemente con historial de siembra directa o monte.',      color: 'verde'    };

  // Textura
  const textDesc =
    are > 65 ? 'Alta permeabilidad, baja retención de agua y nutrientes. Riego frecuente necesario.' :
    arc > 45 ? 'Alta retención de agua. Riesgo de compactación y anegamiento. Drenar y esponjar.' :
               'Buena estructura. Equilibrio entre retención de agua, drenaje y aireación.';

  // Fertilidad general (índice compuesto)
  const score =
    (ph >= 5.8 && ph <= 7.5 ? 2 : ph >= 5.0 ? 1 : 0) +
    (co >= 15 ? 2 : co >= 6 ? 1 : 0) +
    (arc >= 10 && arc <= 40 ? 1 : 0) +
    (n  >= 0.8 ? 1 : 0);

  const fertilidadItem: InterpItem =
    score >= 5 ? { clase: 'Alta',   descripcion: 'Condiciones favorables. Mantener prácticas actuales.',                               color: 'verde'    } :
    score >= 3 ? { clase: 'Media',  descripcion: 'Potencial productivo con manejo orgánico y correcciones puntuales.',                 color: 'amarillo' } :
                 { clase: 'Baja',   descripcion: 'Suelo degradado o con limitaciones. Trabajo de restauración ecosistémica necesario.', color: 'rojo'     };

  // Recomendaciones específicas
  const recs: string[] = [];
  if (ph < 5.8)  recs.push('Encalar con calcita o dolomita para subir pH a 6.0–6.5.');
  if (ph > 8.0)  recs.push('Aplicar azufre elemental o materia orgánica ácida para bajar pH.');
  if (co < 10)   recs.push('Incorporar compost maduro, abonos verdes y coberturas permanentes.');
  if (are > 65)  recs.push('Aumentar materia orgánica para mejorar retención de agua.');
  if (arc > 45)  recs.push('Subsolado o biofumigación para romper piso de arado. Evitar labranza en húmedo.');
  if (n < 0.5)   recs.push('Incorporar leguminosas fijadoras de N₂ (abono verde o consociación).');
  if (recs.length === 0) recs.push('Suelo en buen estado. Mantener coberturas y aporte orgánico anual.');

  return {
    ph: phItem,
    carbono: carbonoItem,
    textura: { clase: tex, descripcion: textDesc },
    fertilidad: fertilidadItem,
    recomendaciones: recs,
  };
}
