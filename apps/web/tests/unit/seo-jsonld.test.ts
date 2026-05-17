import { describe, it, expect } from 'vitest';
import {
  productJsonLd,
  courseJsonLd,
  articleJsonLd,
  eventJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
} from '@/lib/seo/jsonld';

describe('seo/jsonld', () => {
  it('productJsonLd genera Offer con precio formateado', () => {
    const j = productJsonLd(
      {
        slug: 'curso-x',
        name: 'Curso X',
        priceCents: 1234500,
        currency: 'ARS',
      },
      'cursos',
    );
    expect(j['@type']).toBe('Product');
    expect(j.offers.priceCurrency).toBe('ARS');
    expect(j.offers.price).toBe('12345.00');
    expect(j.offers.url).toContain('/cursos/curso-x');
  });

  it('courseJsonLd setea workload PT{h}H', () => {
    const j = courseJsonLd({
      slug: 'c1',
      name: 'C',
      priceCents: 100,
      currency: 'USD',
      durationHours: 12,
    });
    expect(j.hasCourseInstance.courseWorkload).toBe('PT12H');
  });

  it('eventJsonLd incluye startDate/endDate y location', () => {
    const j = eventJsonLd({
      slug: 'ev',
      name: 'Inm',
      startDate: '2026-08-01T10:00:00Z',
      endDate: '2026-08-07T18:00:00Z',
      locationName: 'Monte',
      priceCents: 100000,
      currency: 'USD',
    });
    expect(j.startDate).toBe('2026-08-01T10:00:00Z');
    expect(j.location.name).toBe('Monte');
  });

  it('breadcrumbJsonLd numera positions desde 1', () => {
    const j = breadcrumbJsonLd([
      { name: 'A', url: '/' },
      { name: 'B', url: '/b' },
    ]);
    expect(j.itemListElement[0].position).toBe(1);
    expect(j.itemListElement[1].position).toBe(2);
  });

  it('faqJsonLd transforma items en Q/A', () => {
    const j = faqJsonLd([{ q: '¿X?', a: 'Y' }]);
    expect(j.mainEntity[0]['@type']).toBe('Question');
    expect(j.mainEntity[0].acceptedAnswer.text).toBe('Y');
  });

  it('articleJsonLd usa dateModified = updatedAt o publishedAt', () => {
    const j1 = articleJsonLd({ slug: 'x', title: 'X', publishedAt: '2026-01-01' });
    expect(j1.dateModified).toBe('2026-01-01');
    const j2 = articleJsonLd({
      slug: 'x',
      title: 'X',
      publishedAt: '2026-01-01',
      updatedAt: '2026-02-02',
    });
    expect(j2.dateModified).toBe('2026-02-02');
  });
});
