/**
 * Parámetros de diseño que consume el motor, cada uno con su fuente.
 *
 * Los valores del Manual de Bioconstrucción de Arte y Tierra son la base
 * (técnicas de muro, cimientos, proporción áurea, orientación); las fuentes
 * externas completan lo que el manual no cuantifica (geometría solar,
 * profundidad de crujía, criterios Passive House).
 *
 * Todos son valores de anteproyecto: orientativos, a verificar en el
 * proyecto ejecutivo.
 */
import type { Enfoque } from '../motor/bioclimatica';

// ── Proporción áurea (Manual AyT, cap. 23 · Le Corbusier) ───────────────────

/** Φ — un ambiente de 3 m de ancho da un largo armónico de ~4,85 m. */
export const PHI = 1.618;
export const FUENTE_PHI = ['ayt-manual-bioconstruccion', 'modulor'] as const;

/** Largo armónico para un ancho dado, según proporción áurea. */
export function largoAureo(ancho_m: number): number {
  return Math.round(ancho_m * PHI * 100) / 100;
}

// ── Técnicas de muro (Manual AyT, cap. 14) ──────────────────────────────────

export type TecnicaMuro =
  | 'adobe'
  | 'tapial'
  | 'quincha'
  | 'paja-encofrada'
  | 'fardos'
  | 'cordwood'
  | 'cana-trenzada';

export interface DatosTecnicaMuro {
  nombre: string;
  espesor_min_m: number;
  espesor_tipico_m: number;
  /** Qué aporta térmicamente: masa (inercia) o aislación. */
  aporte: 'inercia' | 'aislacion' | 'mixto' | 'ninguno';
  portante: boolean;
  aptaSismo: boolean;
  /** Facilidad para autoconstrucción (alto = más apropiable). */
  apropiabilidad: 'alta' | 'media' | 'baja';
  nota: string;
  fuente: string;
}

export const TECNICAS_MURO: Record<TecnicaMuro, DatosTecnicaMuro> = {
  adobe: {
    nombre: 'Adobe',
    espesor_min_m: 0.3,
    espesor_tipico_m: 0.4,
    aporte: 'inercia',
    portante: true,
    aptaSismo: false, // sin refuerzo; con caña vertical cada 60 cm sí (ver REFUERZO_SISMICO)
    apropiabilidad: 'alta',
    nota:
      'Un muro de 40 cm desplaza el pico de calor exterior entre 8 y 12 h y reduce la amplitud a ~55 %. ' +
      'Bloque típico 40×20×10 cm; sin refuerzo colapsa con sismos > M 5,5.',
    fuente: 'ayt-manual-bioconstruccion',
  },
  tapial: {
    nombre: 'Tapial (tierra apisonada)',
    espesor_min_m: 0.5,
    espesor_tipico_m: 0.5,
    aporte: 'inercia',
    portante: true,
    aptaSismo: false,
    apropiabilidad: 'media',
    nota: 'Tierra con máx. 30 % de arcilla y 5–10 % de humedad. Para regiones con poca madera. Espesor portante mín. 50 cm.',
    fuente: 'ayt-manual-bioconstruccion',
  },
  quincha: {
    nombre: 'Quincha / bahareque',
    espesor_min_m: 0.1,
    espesor_tipico_m: 0.15,
    aporte: 'mixto',
    portante: false,
    aptaSismo: true,
    apropiabilidad: 'alta',
    nota:
      'La técnica antisísmica por excelencia. Bastidor de madera con luz ≤ 1 m entre parantes; ' +
      'mezcla rica en tierra da inercia, rica en fibra da aislación.',
    fuente: 'ayt-manual-bioconstruccion',
  },
  'paja-encofrada': {
    nombre: 'Paja encofrada',
    espesor_min_m: 0.15,
    espesor_tipico_m: 0.2,
    aporte: 'aislacion',
    portante: false,
    aptaSismo: true,
    apropiabilidad: 'media',
    nota: 'Aislante pero no portante (estructura poste-viga aparte). Seca lento: evitar en clima muy húmedo.',
    fuente: 'ayt-manual-bioconstruccion',
  },
  fardos: {
    nombre: 'Fardos de paja',
    espesor_min_m: 0.35,
    espesor_tipico_m: 0.45,
    aporte: 'aislacion',
    portante: true,
    aptaSismo: true,
    apropiabilidad: 'media',
    nota: 'La técnica más aislante (λ ≈ 0,055 W/mK en mezclas tierra-paja). Exige alero generoso y buen zócalo: la humedad la arruina.',
    fuente: 'ayt-manual-bioconstruccion',
  },
  cordwood: {
    nombre: 'Cordwood (muros de troncos)',
    espesor_min_m: 0.3,
    espesor_tipico_m: 0.4,
    aporte: 'mixto',
    portante: false,
    aptaSismo: false,
    apropiabilidad: 'media',
    nota: 'Reutiliza sobrantes de madera. Troncos curados mín. 1 año, Ø ≥ 10 cm.',
    fuente: 'ayt-manual-bioconstruccion',
  },
  'cana-trenzada': {
    nombre: 'Caña trenzada',
    espesor_min_m: 0.08,
    espesor_tipico_m: 0.12,
    aporte: 'ninguno',
    portante: false,
    aptaSismo: true,
    apropiabilidad: 'alta',
    nota: 'Rápida y económica donde abunda la caña. Poca inercia y poca aislación: para zonas cálidas con buen alero.',
    fuente: 'ayt-manual-bioconstruccion',
  },
};

export const REFUERZO_SISMICO = {
  descripcion:
    'Adobe sin refuerzo colapsa con sismos > M 5,5. Con caña vertical Ø 3 cm cada 60 cm más encadenado superior ' +
    'resiste hasta M 7,0 sin colapso.',
  separacion_cana_m: 0.6,
  fuente: ['ayt-manual-bioconstruccion', 'pucp-kassel'] as const,
};

/**
 * Técnica de muro recomendada según el enfoque climático del sitio.
 * Regla del manual: "¿Clima frío? Aislación (fardos, paja encofrada).
 * ¿Gran amplitud térmica? Masa (adobe, tapial). ¿Zona sísmica? Quincha."
 */
export function tecnicaRecomendada(enfoque: Enfoque, zonaSismica = false): TecnicaMuro {
  if (zonaSismica) return 'quincha';
  switch (enfoque) {
    case 'ganancia-solar':
      return 'fardos'; // clima frío → prioridad aislación
    case 'masa-termica-arida':
      return 'adobe'; // gran amplitud térmica → masa
    case 'sombra-ventilacion':
      return 'quincha'; // trópico → liviano, ventilado, con alero generoso
    case 'mixto':
    default:
      return 'adobe';
  }
}

// ── Cimientos y protección (Manual AyT, cap. 19) ────────────────────────────

export const CIMIENTOS = {
  sobrecimiento_min_m: 0.3,
  sobrecimiento_max_m: 0.6,
  /** Para muro de adobe de 40 cm. */
  zanja_ancho_m: 0.55,
  zanja_profundidad_m: 0.7,
  nota:
    'Sobrecimiento de 30–60 cm sobre el piso terminado, imprescindible en muros de tierra, con corte capilar ' +
    'antes de la primera hilada. Regla del oficio: "buen sombrero y buenas botas" — alero generoso arriba, zócalo abajo.',
  fuente: 'ayt-manual-bioconstruccion',
};

// ── Altura libre interior por enfoque climático ─────────────────────────────

/**
 * En clima cálido húmedo conviene más altura (el aire caliente estratifica y
 * sale por aberturas altas); en clima frío conviene menos volumen a calentar.
 */
export const ALTURA_MURO_POR_ENFOQUE: Record<Enfoque, number> = {
  'sombra-ventilacion': 3.0,
  'masa-termica-arida': 2.8,
  mixto: 2.6,
  'ganancia-solar': 2.45,
};
export const FUENTE_ALTURA = ['givoni', 'mahoney', 'phi'] as const;

// ── Superficie vidriada según clima ─────────────────────────────────────────

/** Relación superficie vidriada / superficie de piso del ambiente, por enfoque. */
export const RATIO_VIDRIADO_POR_ENFOQUE: Record<Enfoque, { min: number; max: number; nota: string }> = {
  'ganancia-solar': {
    min: 0.15,
    max: 0.2,
    nota: 'Mayor vidriado en la fachada orientada al ecuador para ganancia solar de invierno; mínimo en las otras.',
  },
  mixto: {
    min: 0.12,
    max: 0.18,
    nota: 'Ganancia de invierno por la fachada al ecuador, protegida por alero contra el sol alto de verano.',
  },
  'sombra-ventilacion': {
    min: 0.12,
    max: 0.2,
    nota: 'Aberturas amplias pero totalmente sombreadas, enfrentadas para ventilación cruzada permanente.',
  },
  'masa-termica-arida': {
    min: 0.08,
    max: 0.12,
    nota: 'Aberturas reducidas en todas las fachadas; la luz entra filtrada y el muro masivo hace el trabajo térmico.',
  },
};
export const FUENTE_VIDRIADO = ['mahoney', 'givoni', 'ayt-manual-bioconstruccion'] as const;

// ── Ventilación cruzada (Manual AyT + Givoni) ───────────────────────────────

export const VENTILACION_CRUZADA = {
  descripcion: 'Aberturas enfrentadas en fachadas opuestas; la salida igual o algo mayor que la entrada.',
  ratio_salida_entrada: 1.2,
  fuente: ['ayt-manual-bioconstruccion', 'givoni'] as const,
};

// ── Profundidad de crujía (A Pattern Language) ──────────────────────────────

/**
 * Máxima profundidad de cuerpo edificado para que los ambientes puedan tener
 * luz natural desde dos lados (patrón "Light on Two Sides of Every Room").
 * Por encima de esto aparecen ambientes interiores sin luz natural directa.
 */
export const PROFUNDIDAD_MAX_CRUJIA_M = 7.6;
export const FUENTE_CRUJIA = 'alexander-pattern';

// ── Criterios Passive House ─────────────────────────────────────────────────

export const PASSIVE_HOUSE = {
  demanda_calefaccion_max_kwh_m2_a: 15,
  hermeticidad_n50_max_h: 0.6,
  nota_clima_calido:
    'En clima cálido el criterio equivalente no es la hermeticidad sino el control de la ganancia solar y la ' +
    'deshumidificación: una casa que respira, no una casa sellada.',
  fuente: 'phi',
};

// ── Orientación (Manual AyT, cap. 23) ───────────────────────────────────────

export const ORIENTACION = {
  descripcion:
    'El lado largo se orienta al ecuador para captar el sol de invierno; galería de ese lado para filtrar el sol ' +
    'alto de verano; aberturas pequeñas en la fachada opuesta; ventilación cruzada con aberturas enfrentadas; ' +
    'masa térmica adentro y aislación afuera.',
  vegetacion: 'Árboles caducos del lado del ecuador (sombra en verano, sol en invierno); perennes del lado frío como barrera de viento.',
  fuente: 'ayt-manual-bioconstruccion',
};
