/**
 * Las versiones traducidas de un curso: sólo la prosa.
 *
 * Todo lo que es dato —fechas, horario, precios, el reparto entre teoría y
 * práctica, qué módulos hay— sale de `data.ts` y no se repite acá. Lo que vive
 * en este archivo es únicamente lo que hay que escribir en cada idioma.
 *
 * Los módulos y las opciones se referencian por su clave en castellano
 * (`modulo.num`, `opcion.id`), no por posición: si mañana se agrega, se saca o
 * se reordena un módulo, la traducción sigue apuntando al que corresponde. Y si
 * falta una, `tests/unit/cursos-traducciones.test.ts` lo marca en rojo, que es
 * exactamente lo que no pasó cuando las páginas en inglés y francés se quedaron
 * un mes anunciando dos días en vez de cuatro.
 */

import type { Locale } from '@/lib/i18n/config';

export interface CourseTraduccion {
  /** Título de la pestaña y del resultado de búsqueda. */
  metaTitle: string;
  metaDescription: string;
  badge: string;
  /** El nombre del curso en este idioma, partido para que la segunda mitad vaya en bastardilla. */
  titulo: { antes: string; enfasis: string };
  /** Bajada del hero. */
  subtitle: string;
  /** Rótulo chico arriba de la introducción. */
  introEyebrow: string;
  intro: string[];
  /** Cierre de la introducción, en negrita. */
  introCierre: string;
  /** Rótulos de la fila de datos clave. El valor lo pone `formato.ts`. */
  datos: { cuando: string; donde: string; formato: string; facilita: string };
  donde: string;
  /** Valor de la tarjeta "Formato". */
  formato: string;
  facilitaNota: string;
  /** Encabezado del bloque de áreas. */
  areasEyebrow: string;
  areasTitulo: { antes: string; enfasis: string };
  areasNota: string;
  /** Por `modulo.num` del castellano. */
  modulos: Record<string, { title: string; items: string[] }>;
  preciosEyebrow: string;
  preciosTitulo: string;
  /** Por `opcion.id` del castellano. */
  opciones: Record<string, { label: string; includes: string[] }>;
  opcionesNota: string;
  recomendado: string;
  cta: { inscribirme: string; todosLosCursos: string; porWhatsapp: string; escribinos: string };
  whatsappTexto: string;
}

type PorIdioma = Partial<Record<Locale, CourseTraduccion>>;

const BIOARQUITECTURA: PorIdioma = {
  en: {
    metaTitle: 'Bioarchitecture, Building & Territory — Intensive Workshop at Tay Pichín',
    metaDescription:
      'Four-day intensive workshop at Tay Pichín: biobuilding on a real construction site with ancestral techniques and ecological design. San Marcos Sierras, Córdoba.',
    badge: 'Intensive workshop',
    titulo: { antes: 'Bioarchitecture, building', enfasis: '& territory.' },
    introEyebrow: 'An intensive experience',
    subtitle:
      'How to design and build living habitats in connection with the territory. Four days on a real building site, ancestral techniques and ecological design.',
    intro: [
      'Four days of intensive experience where we will learn by integrating ancestral biobuilding techniques with contemporary ecological design principles and bioclimatic architecture.',
      'During the gathering we will work collectively on different construction stages using earth, stone, vegetable fibres and natural materials, understanding the habitat as a living organism in direct relationship with the landscape, the climate and the people who inhabit it.',
    ],
    introCierre:
      'More than technical training, this proposal seeks to recover more conscious ways of inhabiting, building and connecting with the land.',
    datos: { cuando: 'When?', donde: 'Where?', formato: 'Format', facilita: 'Led by' },
    donde: 'EcoSchool Tay Pichín · San Marcos Sierras, Córdoba',
    formato: 'Participatory intensive',
    facilitaNota: 'Limited places',
    areasEyebrow: 'What we work on',
    areasTitulo: { antes: 'The ', enfasis: 'areas of work.' },
    areasNota:
      'The areas are not split day by day: we move through them on the building site as the work advances.',
    modulos: {
      'Fundamentos': {
        title: 'Earth construction',
        items: ['Properties of earth', 'Mixes and how the material behaves', 'Reading local materials'],
      },
      'Diseño': {
        title: 'Ecosystemic design of the territory',
        items: ['Bioclimatic and symbiotic architecture', 'The home as a living system'],
      },
      'Técnicas de muro': {
        title: 'Adobe, quincha and cob',
        items: ['Hands-on work on a real building site', 'Basic structural criteria'],
      },
      'Revoques tierra': {
        title: 'Rough and fine earth plasters',
        items: ['Stabilised earth', 'Mixes and proportions', 'Applying in layers'],
      },
      'Revoques cal': {
        title: 'Lime for humid areas',
        items: ['Types of lime and how they behave', 'Preparation and application', 'Compatibility with earth walls'],
      },
      'Techos': {
        title: 'Dry roofs and living roofs',
        items: ['Design criteria (theory only)'],
      },
      'Colectivo': {
        title: 'Collective building',
        items: ['Building together as a way of learning', 'Organising the work as a minga', 'Community learning'],
      },
    },
    preciosEyebrow: 'Investment',
    preciosTitulo: 'Rates.',
    opciones: {
      'sin-hospedaje': {
        label: 'No accommodation',
        includes: ['Materials', 'Certificate of participation', 'Breakfast, lunch and afternoon tea'],
      },
      'camping': {
        label: 'Camping',
        includes: [
          'Materials',
          'Certificate of participation',
          'Breakfast, lunch and afternoon tea',
          'Camping spot at Tay Pichín · 3 nights (Saturday, Sunday and Monday)',
        ],
      },
      'habitacion': {
        label: 'Shared room',
        includes: [
          'Materials',
          'Certificate of participation',
          'Breakfast, lunch and afternoon tea',
          'Shared room at Tay Pichín · 3 nights (Saturday, Sunday and Monday)',
        ],
      },
    },
    opcionesNota:
      'Every option includes materials, a certificate of participation and breakfast, lunch and afternoon tea throughout the intensive.',
    recomendado: 'RECOMMENDED',
    cta: {
      inscribirme: 'Enroll →',
      todosLosCursos: 'All courses →',
      porWhatsapp: 'Enroll on WhatsApp →',
      escribinos: 'Write to us',
    },
    whatsappTexto: "Hello, I'd like to enroll in the December Bioarchitecture workshop",
  },

  fr: {
    metaTitle: 'Bioarchitecture, Construction et Territoire — Stage Intensif à Tay Pichín',
    metaDescription:
      'Stage intensif de quatre jours à Tay Pichín : bioconstruction sur chantier réel avec techniques ancestrales et design écologique. San Marcos Sierras, Córdoba.',
    badge: 'Stage intensif',
    titulo: { antes: 'Bioarchitecture, construction', enfasis: 'et territoire.' },
    introEyebrow: 'Une expérience intensive',
    subtitle:
      'Comment concevoir et construire des habitats vivants en lien avec le territoire. Quatre jours de chantier réel, techniques ancestrales et design écologique.',
    intro: [
      "Quatre jours d'expérience intensive où nous apprendrons en intégrant les techniques ancestrales de bioconstruction avec les principes contemporains de design écologique et d'architecture bioclimatique.",
      "Pendant la rencontre nous travaillerons collectivement sur différentes étapes constructives en utilisant la terre, la pierre, les fibres végétales et les matériaux naturels, en comprenant l'habitat comme un organisme vivant en relation directe avec le paysage, le climat et les personnes qui l'habitent.",
    ],
    introCierre:
      "Plus qu'une formation technique, cette proposition cherche à retrouver des manières plus conscientes d'habiter, de construire et de nous relier à la terre.",
    datos: { cuando: 'Quand ?', donde: 'Où ?', formato: 'Format', facilita: 'Animé par' },
    donde: 'EcoÉcole Tay Pichín · San Marcos Sierras, Córdoba',
    formato: 'Intensif participatif',
    facilitaNota: 'Places limitées',
    areasEyebrow: 'Ce que nous travaillons',
    areasTitulo: { antes: 'Les ', enfasis: 'domaines de travail.' },
    areasNota:
      "Les domaines ne sont pas répartis jour par jour : on les parcourt sur le chantier au fil de l'avancement du travail.",
    modulos: {
      'Fundamentos': {
        title: 'Construction en terre',
        items: ['Propriétés de la terre', 'Mélanges et comportement du matériau', 'Lecture des matériaux locaux'],
      },
      'Diseño': {
        title: 'Conception écosystémique du territoire',
        items: ['Architecture bioclimatique et symbiotique', 'La maison comme système vivant'],
      },
      'Técnicas de muro': {
        title: 'Adobe, quincha et cob',
        items: ['Pratique sur chantier réel', 'Critères structurels de base'],
      },
      'Revoques tierra': {
        title: 'Enduits en terre, couches grosses et fines',
        items: ['Terre stabilisée', 'Mélanges et proportions', 'Application en couches'],
      },
      'Revoques cal': {
        title: 'Chaux pour zones humides',
        items: ['Types de chaux et comportement', 'Préparation et application', 'Compatibilité avec les murs en terre'],
      },
      'Techos': {
        title: 'Toitures sèches et toitures végétalisées',
        items: ['Critères de conception (théorie seulement)'],
      },
      'Colectivo': {
        title: 'Construction collective',
        items: ["Construire ensemble comme façon d'apprendre", 'Organisation du travail en minga', 'Apprentissage communautaire'],
      },
    },
    preciosEyebrow: 'Investissement',
    preciosTitulo: 'Tarifs.',
    opciones: {
      'sin-hospedaje': {
        label: 'Sans hébergement',
        includes: ['Matériaux', 'Certificat de participation', 'Petit-déjeuner, déjeuner et goûter'],
      },
      'camping': {
        label: 'Camping',
        includes: [
          'Matériaux',
          'Certificat de participation',
          'Petit-déjeuner, déjeuner et goûter',
          'Emplacement de camping à Tay Pichín · 3 nuits (samedi, dimanche et lundi)',
        ],
      },
      'habitacion': {
        label: 'Chambre partagée',
        includes: [
          'Matériaux',
          'Certificat de participation',
          'Petit-déjeuner, déjeuner et goûter',
          'Chambre partagée à Tay Pichín · 3 nuits (samedi, dimanche et lundi)',
        ],
      },
    },
    opcionesNota:
      'Toutes les options comprennent les matériaux, le certificat de participation et le petit-déjeuner, le déjeuner et le goûter pendant le stage.',
    recomendado: 'RECOMMANDÉ',
    cta: {
      inscribirme: "M'inscrire →",
      todosLosCursos: 'Voir toutes les formations →',
      porWhatsapp: "M'inscrire par WhatsApp →",
      escribinos: 'Nous écrire',
    },
    whatsappTexto: "Bonjour, je souhaite m'inscrire au stage de Bioarchitecture de décembre",
  },
};

export const COURSE_TRADUCCIONES: Record<string, PorIdioma> = {
  bioarquitectura: BIOARQUITECTURA,
};

export function getCourseTraduccion(slug: string, locale: Locale): CourseTraduccion | null {
  return COURSE_TRADUCCIONES[slug]?.[locale] ?? null;
}
