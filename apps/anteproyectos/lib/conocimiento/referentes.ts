/**
 * Catálogo de fuentes que fundamentan los parámetros de diseño del motor.
 *
 * Cada parámetro numérico en `parametros.ts` cita un id de acá, para que el
 * informe del anteproyecto pueda decir *por qué* tomó cada decisión y el
 * cliente (o Jonatan) pueda auditarla. No se reproduce texto de las obras:
 * se codifican los criterios y valores de diseño, con atribución.
 */

export type DominioConocimiento =
  | 'bioclimatica'
  | 'passive-house'
  | 'bioconstruccion'
  | 'bioarquitectura'
  | 'geometria-sagrada';

export interface Referente {
  id: string;
  autor: string;
  obra: string;
  anio?: string;
  dominio: DominioConocimiento[];
  /** Qué aporta esta fuente al motor, en una línea. */
  aporte: string;
  /** true si es material propio de Arte y Tierra. */
  propio?: boolean;
}

export const REFERENTES: Record<string, Referente> = {
  // ── Material propio de Arte y Tierra ──────────────────────────────────────
  'ayt-manual-bioconstruccion': {
    id: 'ayt-manual-bioconstruccion',
    autor: 'Jonatan Gabriel Palma · Arte y Tierra',
    obra: 'Manual de Bioconstrucción',
    dominio: ['bioconstruccion', 'bioarquitectura', 'geometria-sagrada'],
    aporte:
      'Espesores y desempeño de las técnicas de muro en tierra, criterios de elección por clima y sismo, ' +
      'reglas de cimiento y protección ("buen sombrero y buenas botas"), orientación bioclimática y proporción áurea aplicada.',
    propio: true,
  },
  'ayt-cuaderno-participativo': {
    id: 'ayt-cuaderno-participativo',
    autor: 'Arte y Tierra',
    obra: 'Cuaderno de Diseño Participativo',
    dominio: ['bioarquitectura'],
    aporte:
      'Programa de necesidades, prioridades de la familia, capitales disponibles (define viabilidad de autoconstrucción) ' +
      'y lectura del sitio hecha por quienes lo habitan.',
    propio: true,
  },

  // ── Bioclimática ──────────────────────────────────────────────────────────
  olgyay: {
    id: 'olgyay',
    autor: 'Victor Olgyay',
    obra: 'Design with Climate: Bioclimatic Approach to Architectural Regionalism',
    anio: '1963',
    dominio: ['bioclimatica'],
    aporte: 'Carta bioclimática y zona de confort; la forma del edificio como respuesta al clima.',
  },
  givoni: {
    id: 'givoni',
    autor: 'Baruch Givoni',
    obra: 'Man, Climate and Architecture',
    anio: '1969',
    dominio: ['bioclimatica'],
    aporte:
      'Carta psicrométrica de edificios: qué estrategia pasiva (masa térmica, ventilación, enfriamiento evaporativo) ' +
      'corresponde a cada combinación de temperatura y humedad.',
  },
  mahoney: {
    id: 'mahoney',
    autor: 'Carl Mahoney, John Evans, Otto Koenigsberger (ONU)',
    obra: 'Tablas de Mahoney — Manual of Tropical Housing and Building',
    anio: '1971',
    dominio: ['bioclimatica'],
    aporte:
      'Método de recomendaciones de diseño (orientación, tamaño de aberturas, protección solar, masa) ' +
      'derivadas de datos climáticos mensuales — la misma lógica que usa este motor.',
  },
  'moore-ecs': {
    id: 'moore-ecs',
    autor: 'Fuller Moore',
    obra: 'Environmental Control Systems',
    anio: '1993',
    dominio: ['bioclimatica'],
    aporte: 'Dimensionamiento de protecciones solares por geometría solar (altura de vano / tangente de altitud solar).',
  },

  // ── Passive House ─────────────────────────────────────────────────────────
  phi: {
    id: 'phi',
    autor: 'Wolfgang Feist · Passivhaus Institut',
    obra: 'Criterios Passive House (PHPP)',
    dominio: ['passive-house'],
    aporte:
      'Demanda de calefacción ≤15 kWh/(m²·a), hermeticidad n50 ≤0,6 h⁻¹, diseño libre de puentes térmicos, ' +
      'compacidad de la envolvente. En clima cálido el criterio análogo es la demanda de refrigeración y deshumidificación.',
  },

  // ── Bioconstrucción ───────────────────────────────────────────────────────
  minke: {
    id: 'minke',
    autor: 'Gernot Minke',
    obra: 'Building with Earth / Manual de construcción en tierra (FEB-Kassel)',
    dominio: ['bioconstruccion'],
    aporte: 'Comportamiento higrotérmico de la tierra cruda, desfase térmico por espesor y refuerzo sísmico de muros de tierra.',
  },
  'pucp-kassel': {
    id: 'pucp-kassel',
    autor: 'PUCP (Lima) y Universidad de Kassel',
    obra: 'Investigación en refuerzo sísmico de adobe',
    dominio: ['bioconstruccion'],
    aporte: 'Refuerzo con caña vertical y encadenado superior en muros de tierra en zona sísmica.',
  },

  // ── Bioarquitectura / arquitectura orgánica ───────────────────────────────
  'alexander-pattern': {
    id: 'alexander-pattern',
    autor: 'Christopher Alexander et al.',
    obra: 'A Pattern Language',
    anio: '1977',
    dominio: ['bioarquitectura'],
    aporte:
      'Patrones de habitabilidad medibles: luz natural desde dos lados en cada ambiente, ' +
      'y profundidad máxima de crujía para que eso sea posible.',
  },
  wright: {
    id: 'wright',
    autor: 'Frank Lloyd Wright',
    obra: 'Arquitectura orgánica',
    dominio: ['bioarquitectura'],
    aporte: 'Continuidad entre edificio y sitio; el plano horizontal y el alero profundo como gesto de pertenencia al lugar.',
  },
  hundertwasser: {
    id: 'hundertwasser',
    autor: 'Friedensreich Hundertwasser',
    obra: 'Manifiestos sobre la línea recta y el derecho a la ventana',
    dominio: ['bioarquitectura'],
    aporte: 'Rechazo de la ortogonalidad estricta e irregularidad deliberada como criterio del perfil orgánico.',
  },

  // ── Geometría sagrada ─────────────────────────────────────────────────────
  modulor: {
    id: 'modulor',
    autor: 'Le Corbusier',
    obra: 'El Modulor',
    anio: '1948',
    dominio: ['geometria-sagrada'],
    aporte: 'Sistema de proporciones basado en la sección áurea y la escala del cuerpo humano.',
  },
};

export function referentesDeDominio(dominio: DominioConocimiento): Referente[] {
  return Object.values(REFERENTES).filter(r => r.dominio.includes(dominio));
}
