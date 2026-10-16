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
  /** Encabezado del bloque de áreas. */
  areasEyebrow: string;
  areasTitulo: { antes: string; enfasis: string };
  areasNota: string;
  /** Por `modulo.num` del castellano. La `nota` sólo donde el castellano tiene una. */
  modulos: Record<string, { title: string; nota?: string; items: string[] }>;
  preciosEyebrow: string;
  preciosTitulo: string;
  /** Por `opcion.id` del castellano. */
  opciones: Record<string, { label: string; includes: string[] }>;
  opcionesNota: string;
  recomendado: string;
  cta: { inscribirme: string; todosLosCursos: string; porWhatsapp: string; escribinos: string };

  /* ── Sólo la ficha de un intensivo con fecha ───────── */
  /** Cierre de la introducción, en negrita. */
  introCierre?: string;
  /** Rótulos de la fila de datos clave. El valor lo pone `formato.ts`. */
  datos?: { cuando: string; donde: string; formato: string; facilita: string };
  donde?: string;
  /** Valor de la tarjeta "Formato". */
  formato?: string;
  facilitaNota?: string;

  /* ── Sólo la ficha de la Inmersión Viva ────────────── */
  /** Frase corta debajo del título, en bastardilla. */
  tagline?: string;
  /** Bloque "cómo se aprende acá", con su enlace a la página de Nosotros. */
  enfoque?: {
    eyebrow: string;
    titulo: string[];
    enlace: string;
  };
  /** Enlace secundario del hero. */
  ctaSecundario?: { href: string; label: string };
  /** Bajada del bloque de precios. */
  preciosLead?: string;
  /** La cajita de "se llega los lunes". */
  notaIngreso?: { titulo: string; texto: string };
  /** Sección final. */
  cierre?: { titulo: { antes: string; enfasis: string }; texto: string; cta: string };
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

const INMERSION_VIVA: PorIdioma = {
  en: {
    metaTitle: 'Living Immersion — Tay Pichín',
    metaDescription:
      'Living Immersion at Tay Pichín: our take on volunteering. Biobuilding, agroecology and collective organization on the territory. San Marcos Sierras, Córdoba.',
    badge: '🌿 Educational volunteering · From 2 weeks',
    titulo: { antes: 'Living', enfasis: 'Immersion.' },
    tagline: 'Our take on volunteering.',
    subtitle:
      "You're not here to work — you're here to learn a craft alongside the people who carry it every day.",
    introEyebrow: 'Approach',
    intro: [
      "At Tay Pichín there's no checklist of chores: there are skilled instructors sharing knowledge that has passed from hand to hand since humans first discovered clay. Biobuilding, agroecology, collective organization — all learned by doing, woven into the ecoschool's daily life.",
      "A project that hasn't stopped since November 2020, heir to a tradition of itinerant volunteering that Arte y Tierra has sustained since 2014 across Argentina, Colombia, Ecuador, France, Italy and Peru.",
    ],
    enfoque: {
      eyebrow: 'Approach',
      titulo: ['We learn by doing,', 'sharing and supporting', 'each other.'],
      enlace: 'Learn about our history and journey →',
    },
    ctaSecundario: { href: '/tay-pichin', label: 'Learn more about Tay Pichín →' },
    areasEyebrow: 'Applied training',
    areasTitulo: { antes: 'The ', enfasis: 'areas of study.' },
    areasNota:
      "The areas are not a fixed schedule: each week we work on whatever the place needs at that moment — a building site in progress, the garden in season, a workshop about to start. That's why a short stay of two weeks goes deep into one or two areas rather than all of them. To go through all of them, we recommend staying three months.",
    modulos: {
      '🏗': {
        title: 'Biobuilding',
        items: ['Raw earth techniques', 'Reading and using local materials', 'Construction criteria on a real building site', 'Natural plasters and finishes'],
      },
      '🌱': {
        title: 'Agroecology',
        items: ['Garden and living systems management', 'Soil, compost and bio-inputs', 'Plant-animal integration', 'Food forest and zone 1'],
      },
      '🌿': {
        title: 'Biocosmetics',
        items: ['Harvesting and drying medicinal plants', 'Oil and alcohol macerations', 'Handmade mother tinctures', 'Ointments, creams and natural preparations', 'Sovereignty over body and home'],
      },
      '💧': {
        title: 'Hydrological design',
        items: ['Reading the landscape', 'Water, climate and topography', 'Introduction to hydrological design', 'Watershed observation'],
      },
      '🎓': {
        title: 'Workshop participation',
        nota: 'If a workshop is held at the ecoschool while you are here, you can sit in on the classes. It works as an exchange: you take part as a student and in return you lend a hand with the logistics of the course — materials, cooking, setting up and tidying the spaces.',
        items: ['Free access to workshops held at the ecoschool during your stay', "Participation as part of the workshops' logistics team", 'Learning from inside the pedagogical organization', 'Real experience of co-facilitating and holding the space'],
      },
      '🤝': {
        title: 'Community life',
        items: ['Talking circles', 'Assemblies and collective decision-making', 'Managing collective living', 'Daily life at the ecoschool'],
      },
    },
    preciosEyebrow: 'Your contribution',
    preciosTitulo: 'It drives us to keep doing this work.',
    preciosLead:
      "It's not payment for work: it's what sustains an educational project open 365 days a year — it covers your food and the space's running costs while you're with us.",
    opciones: {
      camping: {
        label: 'Camping area',
        includes: ['Full meals', 'A camping spot at Tay Pichín', 'Taking part in every activity'],
      },
      habitacion: {
        label: 'Shared room',
        includes: ['Full meals', 'A shared room at Tay Pichín', 'Taking part in every activity'],
      },
    },
    opcionesNota:
      'You can extend to a month, to three months or more depending on availability — ask us on WhatsApp.',
    notaIngreso: {
      titulo: '📅 Arrivals on Mondays only.',
      texto:
        'Minimum 2 weeks. We recommend three months to practise in every area; you can extend depending on availability.',
    },
    recomendado: 'RECOMMENDED',
    cierre: {
      titulo: { antes: 'Join ', enfasis: 'Tay Pichín.' },
      texto: 'Write to us with your desired dates, your experience and what brings you here.',
      cta: 'Write to us →',
    },
    cta: {
      inscribirme: 'Request a place →',
      todosLosCursos: 'All courses →',
      porWhatsapp: 'Request a place on WhatsApp →',
      escribinos: 'Write to us',
    },
    whatsappTexto: "Hello, I'd like information about the Living Immersion",
  },

  fr: {
    metaTitle: 'Immersion Vivante — Tay Pichín',
    metaDescription:
      'Immersion Vivante à Tay Pichín : notre version du volontariat éducatif. Bioconstruction, agroécologie et organisation collective sur le territoire. San Marcos Sierras, Córdoba.',
    badge: '🌿 Volontariat éducatif · Dès 2 semaines',
    titulo: { antes: 'Immersion', enfasis: 'Vivante.' },
    tagline: 'Notre version du volontariat.',
    subtitle:
      'Vous ne venez pas travailler, vous venez apprendre un métier aux côtés de celles et ceux qui le portent chaque jour.',
    introEyebrow: 'Approche',
    intro: [
      "À Tay Pichín, il n'y a pas de liste de tâches à cocher : il y a des formateurs de métier, qui transmettent un savoir qui passe de main en main depuis que l'être humain a découvert l'argile. Bioconstruction, agroécologie, organisation collective — tout s'apprend en le faisant, intégré à la vie quotidienne de l'écoécole.",
      "Un projet qui n'a pas cessé depuis novembre 2020, héritier d'une tradition de volontariat itinérant qu'Arte y Tierra soutient depuis 2014 entre l'Argentine, la Colombie, l'Équateur, la France, l'Italie et le Pérou.",
    ],
    enfoque: {
      eyebrow: 'Approche',
      titulo: ['On apprend en faisant,', 'en partageant et en soutenant', 'ensemble.'],
      enlace: 'Découvrez notre histoire et notre parcours →',
    },
    ctaSecundario: { href: '/tay-pichin', label: 'En savoir plus sur Tay Pichín →' },
    areasEyebrow: 'Formation appliquée',
    areasTitulo: { antes: 'Les ', enfasis: "domaines d'étude." },
    areasNota:
      "Les domaines ne sont pas un programme figé : chaque semaine, on travaille sur ce dont le lieu a besoin à ce moment-là — un chantier en cours, le potager selon la saison, une formation qui se prépare. C'est pourquoi un séjour court, de deux semaines, permet d'entrer en profondeur dans un ou deux domaines, pas dans tous. Pour les parcourir tous, nous recommandons de rester trois mois.",
    modulos: {
      '🏗': {
        title: 'Bioconstruction',
        items: ['Techniques en terre crue', 'Lecture et usage des matériaux locaux', 'Critères constructifs en chantier réel', 'Enduits et finitions naturelles'],
      },
      '🌱': {
        title: 'Agroécologie',
        items: ['Gestion du potager et des systèmes vivants', 'Sol, compost et bio-intrants', 'Intégration végétal-animal', 'Forêt comestible et zone 1'],
      },
      '🌿': {
        title: 'Biocosmétique',
        items: ['Récolte et séchage de plantes médicinales', 'Macérations en huile et alcool', 'Teintures mères artisanales', 'Onguents, crèmes et préparations naturelles', 'Souveraineté sur le corps et la maison'],
      },
      '💧': {
        title: 'Conception hydrologique',
        items: ['Lecture du paysage', 'Eau, climat et topographie', 'Introduction à la conception hydrologique', 'Observation des bassins versants'],
      },
      '🎓': {
        title: 'Participation aux formations',
        nota: "Si un atelier a lieu à l'écoécole pendant votre séjour, vous pouvez assister aux cours. Cela fonctionne comme un échange : vous participez comme élève et, en retour, vous donnez un coup de main pour la logistique de la formation — matériaux, cuisine, installation et rangement des espaces.",
        items: ["Accès libre aux ateliers organisés à l'écoécole pendant votre séjour", "Participation à l'équipe logistique des formations", "Apprentissage depuis l'intérieur de l'organisation pédagogique", 'Expérience réelle de co-animation et de soutien'],
      },
      '🤝': {
        title: 'Vie communautaire',
        items: ['Cercles de parole', 'Assemblées et prise de décision collective', "Gestion de l'habitat collectif", "Vie quotidienne à l'écoécole"],
      },
    },
    preciosEyebrow: 'Votre contribution',
    preciosTitulo: 'Elle nous pousse à continuer notre travail.',
    preciosLead:
      "Ce n'est pas un paiement pour travailler : c'est ce qui soutient un projet éducatif ouvert 365 jours par an — cela couvre votre alimentation et les frais de fonctionnement pendant votre séjour parmi nous.",
    opciones: {
      camping: {
        label: 'En zone de camping',
        includes: ['Alimentation complète', 'Emplacement de camping à Tay Pichín', 'Participation à toutes les activités'],
      },
      habitacion: {
        label: 'En chambre partagée',
        includes: ['Alimentation complète', 'Chambre partagée à Tay Pichín', 'Participation à toutes les activités'],
      },
    },
    opcionesNota:
      'Vous pouvez prolonger à un mois, à trois mois ou plus selon disponibilité — écrivez-nous sur WhatsApp.',
    notaIngreso: {
      titulo: "📅 L'arrivée se fait uniquement les lundis.",
      texto:
        'Minimum 2 semaines. Nous recommandons trois mois pour pratiquer dans tous les domaines ; vous pouvez prolonger selon disponibilité.',
    },
    recomendado: 'RECOMMANDÉ',
    cierre: {
      titulo: { antes: 'Rejoignez ', enfasis: 'Tay Pichín.' },
      texto: 'Écrivez-nous avec vos dates souhaitées, votre expérience et ce qui vous amène ici.',
      cta: 'Nous écrire →',
    },
    cta: {
      inscribirme: 'Demander une place →',
      todosLosCursos: 'Voir toutes les formations →',
      porWhatsapp: 'Demander une place par WhatsApp →',
      escribinos: 'Nous écrire',
    },
    whatsappTexto: "Bonjour, je voudrais des informations sur l'Immersion Vivante",
  },
};

export const COURSE_TRADUCCIONES: Record<string, PorIdioma> = {
  bioarquitectura: BIOARQUITECTURA,
  'inmersion-viva': INMERSION_VIVA,
};

/** El nombre del curso en este idioma, para los datos estructurados y el `alt` de la foto. */
export function nombreTraducido(t: CourseTraduccion): string {
  return `${t.titulo.antes} ${t.titulo.enfasis}`.replace(/\.$/, '').trim();
}

export function getCourseTraduccion(slug: string, locale: Locale): CourseTraduccion | null {
  return COURSE_TRADUCCIONES[slug]?.[locale] ?? null;
}
