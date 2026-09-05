/**
 * Generadores de JSON-LD (Schema.org) tipados.
 *
 * Cada función devuelve un objeto serializable que se embebe via
 * <JsonLd data={...} /> (script type="application/ld+json").
 */

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://arteytierra.org';

export const ORG_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE}#org`,
  name: 'Arte y Tierra',
  url: SITE,
  logo: `${SITE}/logo.svg`,
  description:
    'Educación regenerativa, diseño hidrológico, bioarquitectura y agroecología en Argentina.',
  sameAs: [
    'https://instagram.com/arteytierra',
    'https://youtube.com/@arteytierra',
  ],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'info.arteytierra@gmail.com',
      areaServed: 'AR',
      availableLanguage: ['Spanish'],
    },
  ],
} as const;

export const WEBSITE_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE}#website`,
  url: SITE,
  name: 'Arte y Tierra',
  inLanguage: 'es-AR',
  publisher: { '@id': `${SITE}#org` },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE}/buscar?q={query}`,
    'query-input': 'required name=query',
  },
} as const;

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url.startsWith('http') ? it.url : `${SITE}${it.url}`,
    })),
  };
}

interface ProductInput {
  slug: string;
  name: string;
  description?: string;
  image?: string;
  priceCents: number;
  currency: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  ratingValue?: number;
  reviewCount?: number;
  category?: string;
}

export function productJsonLd(p: ProductInput, pathPrefix: string) {
  const url = `${SITE}/${pathPrefix}/${p.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    image: p.image,
    sku: p.slug,
    brand: { '@type': 'Brand', name: 'Arte y Tierra' },
    category: p.category,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: p.currency,
      price: (p.priceCents / 100).toFixed(2),
      availability: `https://schema.org/${p.availability ?? 'InStock'}`,
      seller: { '@id': `${SITE}#org` },
    },
    ...(p.ratingValue && p.reviewCount
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: p.ratingValue,
            reviewCount: p.reviewCount,
          },
        }
      : {}),
  };
}

interface CourseInput {
  slug: string;
  name: string;
  description?: string;
  image?: string;
  durationHours?: number;
  priceCents: number;
  currency: string;
  startDate?: string;
  endDate?: string;
  language?: string;
  ratingValue?: number;
  reviewCount?: number;
}

export function courseJsonLd(c: CourseInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: c.name,
    description: c.description,
    image: c.image,
    provider: { '@id': `${SITE}#org` },
    inLanguage: c.language ?? 'es-AR',
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      startDate: c.startDate,
      endDate: c.endDate,
      courseWorkload: c.durationHours ? `PT${c.durationHours}H` : undefined,
    },
    offers: {
      '@type': 'Offer',
      url: `${SITE}/cursos/${c.slug}`,
      priceCurrency: c.currency,
      price: (c.priceCents / 100).toFixed(2),
      availability: 'https://schema.org/InStock',
      category: 'Paid',
    },
    ...(c.ratingValue && c.reviewCount
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: c.ratingValue,
            reviewCount: c.reviewCount,
          },
        }
      : {}),
  };
}

interface EventInput {
  slug: string;
  name: string;
  description?: string;
  image?: string;
  startDate: string;
  endDate: string;
  locationName: string;
  locationAddress?: string;
  priceCents: number;
  currency: string;
}

export function eventJsonLd(e: EventInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: e.name,
    description: e.description,
    image: e.image,
    startDate: e.startDate,
    endDate: e.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: e.locationName,
      address: e.locationAddress,
    },
    organizer: { '@id': `${SITE}#org` },
    offers: {
      '@type': 'Offer',
      url: `${SITE}/inmersion-viva/${e.slug}`,
      priceCurrency: e.currency,
      price: (e.priceCents / 100).toFixed(2),
      availability: 'https://schema.org/InStock',
    },
  };
}

interface ArticleInput {
  slug: string;
  title: string;
  description?: string;
  image?: string;
  publishedAt: string;
  updatedAt?: string;
  authorName?: string;
}

export function articleJsonLd(a: ArticleInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.description,
    image: a.image,
    datePublished: a.publishedAt,
    dateModified: a.updatedAt ?? a.publishedAt,
    author: { '@type': 'Person', name: a.authorName ?? 'Arte y Tierra' },
    publisher: { '@id': `${SITE}#org` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE}/blog/${a.slug}` },
  };
}

interface CoursesItemListInput {
  courses: Array<{ slug: string; name: string; description?: string; img?: string }>;
}

export function coursesItemListJsonLd({ courses }: CoursesItemListInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Cursos y Formaciones — Arte y Tierra',
    url: `${SITE}/cursos`,
    itemListElement: courses.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Course',
        name: c.name,
        description: c.description,
        url: `${SITE}/cursos/${c.slug}`,
        image: c.img ? (c.img.startsWith('http') ? c.img : `${SITE}${c.img}`) : undefined,
        provider: { '@id': `${SITE}#org` },
      },
    })),
  };
}

interface ProfessionalServiceInput {
  path: string;
  name: string;
  description: string;
  areaServed?: string[];
  serviceTypes: string[];
  priceRange?: string;
}

export function professionalServiceJsonLd(s: ProfessionalServiceInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${SITE}${s.path}#service`,
    name: s.name,
    description: s.description,
    url: `${SITE}${s.path}`,
    parentOrganization: { '@id': `${SITE}#org` },
    areaServed: s.areaServed ?? ['AR', 'CO', 'PE', 'BO', 'EC', 'IT', 'FR'],
    priceRange: s.priceRange,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: s.name,
      itemListElement: s.serviceTypes.map((t) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: t },
      })),
    },
  };
}

export function faqJsonLd(items: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  };
}

interface LodgingInput {
  slug: string;
  name: string;
  description?: string;
  image?: string;
  priceCents: number;
  currency: string;
  maxGuests?: number;
  amenityFeatures?: string[];
}

export function lodgingJsonLd(l: LodgingInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: l.name,
    description: l.description,
    image: l.image,
    url: `${SITE}/hospedaje/${l.slug}`,
    priceRange: `${(l.priceCents / 100).toFixed(0)} ${l.currency}`,
    amenityFeature: l.amenityFeatures?.map((a) => ({
      '@type': 'LocationFeatureSpecification',
      name: a,
      value: true,
    })),
  };
}
