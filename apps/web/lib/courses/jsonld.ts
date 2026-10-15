/**
 * Datos estructurados de un curso del catálogo.
 *
 * Hasta ahora ninguna ficha de curso los emitía. La función que los generaba
 * vivía en la ruta genérica `app/cursos/[slug]`, pero los nueve cursos reales
 * tienen cada uno su carpeta propia, y una ruta con nombre fijo le gana a la
 * dinámica: el código estaba escrito y no corría en ninguna página. Para un
 * curso presencial con fecha, lugar y precio, eso es justamente lo que un
 * buscador puede mostrar y no estaba mostrando.
 *
 * Todo sale de `data.ts`. Lo que no está cargado no se inventa: un curso sin
 * `fechas` no declara fechas, y la carga horaria no se emite nunca porque el
 * catálogo no la tiene y un número inventado acá es un número que Google
 * publica.
 */

import type { CourseData } from './data';
import { montoDePrecio } from './formato';
import type { Locale } from '@/lib/i18n/config';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://arteytierra.org';

/** Argentina no cambia de hora: siempre UTC−3. */
const OFFSET = '-03:00';

const TAY_PICHIN = {
  '@type': 'Place',
  name: 'Ecoescuela Tay Pichín',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'San Marcos Sierras',
    addressRegion: 'Córdoba',
    addressCountry: 'AR',
  },
} as const;

const IDIOMA: Record<Locale, string> = {
  es: 'es-AR',
  en: 'en',
  fr: 'fr',
  pt: 'pt',
};

function esPresencial(kind: CourseData['kind']): boolean {
  return kind === 'presencial' || kind === 'inmersion';
}

/** `2026-12-05` + `10:00` → `2026-12-05T10:00:00-03:00`. Sin hora, la fecha sola. */
function instante(dia: string, hora?: string): string {
  return hora ? `${dia}T${hora}:00${OFFSET}` : dia;
}

/**
 * La moneda en la que está escrito el precio. El catálogo los guarda como texto
 * («$130.000 ARS», «USD 80»), así que se deduce del texto y no se asume.
 */
function moneda(precio: string): 'ARS' | 'USD' {
  return /usd|u\$s/i.test(precio) ? 'USD' : 'ARS';
}

/**
 * Las ofertas del curso. Devuelve `undefined` si no hay un precio que se pueda
 * afirmar: opciones a consultar, precios en monedas mezcladas, o una estadía
 * como la Inmersión Viva, donde el número es por semana y publicarlo como el
 * precio del curso diría algo falso.
 */
function ofertas(course: CourseData, url: string) {
  if (course.kind === 'inmersion') return undefined;

  const precios = course.opciones
    .map(o => ({ monto: montoDePrecio(o.precio), moneda: moneda(o.precio) }))
    .filter((p): p is { monto: number; moneda: 'ARS' | 'USD' } => p.monto !== null);

  if (precios.length === 0) return undefined;
  const monedas = new Set(precios.map(p => p.moneda));
  if (monedas.size !== 1) return undefined;

  const montos = precios.map(p => p.monto);
  const min = Math.min(...montos);
  const max = Math.max(...montos);
  const priceCurrency = precios[0]!.moneda;

  if (min === max) {
    return {
      '@type': 'Offer',
      url,
      price: String(min),
      priceCurrency,
      availability: 'https://schema.org/InStock',
      category: 'Paid',
    };
  }
  return {
    '@type': 'AggregateOffer',
    url,
    lowPrice: String(min),
    highPrice: String(max),
    priceCurrency,
    offerCount: montos.length,
    availability: 'https://schema.org/InStock',
    category: 'Paid',
  };
}

interface Opciones {
  locale: Locale;
  /** Ruta de esta versión de la ficha, por ejemplo `/en/cursos/bioarquitectura`. */
  path: string;
  /** Bajada traducida, si la página no está en castellano. */
  description?: string;
  /** Nombre traducido, si lo hubiera. */
  name?: string;
}

export function courseCatalogJsonLd(course: CourseData, { locale, path, description, name }: Opciones) {
  const url = `${SITE}${path}`;
  const presencial = esPresencial(course.kind);

  const instancia: Record<string, unknown> = {
    '@type': 'CourseInstance',
    courseMode: presencial ? 'onsite' : 'online',
    ...(presencial ? { location: TAY_PICHIN } : {}),
  };
  if (course.fechas) {
    instancia.startDate = instante(course.fechas.desde, course.fechas.horaInicio);
    instancia.endDate = instante(course.fechas.hasta, course.fechas.horaFin);
  } else if (course.startDate) {
    instancia.startDate = course.startDate;
  }
  const docente = course.facilitadores[0];
  if (docente) {
    instancia.instructor = { '@type': 'Person', name: docente.name };
  }

  const offers = ofertas(course, url);

  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    '@id': `${url}#course`,
    name: name ?? course.name,
    description: description ?? course.subtitle,
    url,
    image: `${SITE}${course.heroImg}`,
    inLanguage: IDIOMA[locale],
    provider: { '@id': `${SITE}#org` },
    hasCourseInstance: instancia,
    ...(offers ? { offers } : {}),
  };
}
