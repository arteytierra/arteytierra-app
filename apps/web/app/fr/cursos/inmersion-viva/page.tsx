import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCourse } from '@/lib/courses/data';
import { getCourseTraduccion, nombreTraducido } from '@/lib/courses/traducciones';
import { courseCatalogJsonLd } from '@/lib/courses/jsonld';
import { InmersionVivaTranslated } from '@/components/cursos/InmersionVivaTranslated';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

const PATH = '/fr/cursos/inmersion-viva';
const course = getCourse('inmersion-viva');
const t = getCourseTraduccion('inmersion-viva', 'fr');

export const metadata: Metadata = {
  title: t?.metaTitle,
  description: t?.metaDescription,
  alternates: { canonical: PATH },
};

export default function InmersionVivaFrPage() {
  if (!course || !t) notFound();

  const whatsapp = `https://wa.me/5493549431594?text=${encodeURIComponent(t.whatsappTexto)}`;
  const jsonLd = courseCatalogJsonLd(course, {
    locale: 'fr',
    path: PATH,
    description: t.metaDescription,
    name: nombreTraducido(t),
  });

  return (
    <>
      <SiteHeader locale="fr" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <InmersionVivaTranslated course={course} t={t} locale="fr" base="/fr" whatsapp={whatsapp} />
      <SiteFooter />
    </>
  );
}
