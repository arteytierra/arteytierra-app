/**
 * Análisis de suelo vía SoilGrids (ISRIC).
 * API pública, sin clave. Resolución ~250 m.
 * Datos de 0–5 cm de profundidad.
 * Orientativos — no reemplazan análisis de laboratorio.
 * https://www.isric.org/explore/soilgrids
 */

export interface DatosSuelo {
  lat:           number;
  lng:           number;
  ph:            number;   // pH en agua
  carbono_org:   number;   // Carbono orgánico g/kg
  arcilla:       number;   // % arcilla
  arena:         number;   // % arena
  limo:          number;   // % limo
  densidad_ap:   number;   // Densidad aparente g/cm³
  nitrogeno:     number;   // Nitrógeno total g/kg
  clase_textura: string;
  interp:        InterpSuelo;
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

export async function obtenerSuelo(lat: number, lng: number): Promise<DatosSuelo> {
  const props = ['phh2o', 'soc', 'clay', 'sand', 'silt', 'bdod', 'nitrogen'];
  const url =
    'https://rest.isric.org/soilgrids/v2.0/properties/query' +
    `?lon=${lng.toFixed(4)}&lat=${lat.toFixed(4)}` +
    props.map(p => `&property=${p}`).join('') +
    '&depth=0-5cm&value=mean';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`SoilGrids respondió ${res.status}`);
    const json: SoilGridsResponse = await res.json();

    const layers = json.properties.layers;

    function val(name: string): number {
      const layer = layers.find(l => l.name === name);
      if (!layer) return 0;
      const raw = layer.depths[0]?.values?.mean ?? 0;
      const df  = layer.unit_measure.d_factor || 1;
      return Math.round((raw / df) * 100) / 100;
    }

    const ph          = val('phh2o');
    const carbono_org = val('soc');
    const arcilla     = val('clay');
    const arena       = val('sand');
    const limo        = val('silt');
    const densidad_ap = val('bdod');
    const nitrogeno   = val('nitrogen');

    const clase_textura = clasificarTextura(arcilla, arena, limo);
    const interp        = interpretarSuelo(ph, carbono_org, arcilla, arena, clase_textura, nitrogeno);

    return {
      lat, lng, ph, carbono_org, arcilla, arena, limo, densidad_ap, nitrogeno,
      clase_textura, interp,
      fuente: 'ISRIC SoilGrids v2.0 (0–5 cm, ~250 m resolución) — orientativo',
    };
  } finally {
    clearTimeout(timer);
  }
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
