import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCourse } from '@/lib/courses/data';
import { getCourseTraduccion, nombreTraducido } from '@/lib/courses/traducciones';
import { courseCatalogJsonLd } from '@/lib/courses/jsonld';
import { CourseDetailTranslated } from '@/components/cursos/CourseDetailTranslated';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

const PATH = '/en/cursos/bioarquitectura';
const course = getCourse('bioarquitectura');
const t = getCourseTraduccion('bioarquitectura', 'en');

export const metadata: Metadata = {
  title: t?.metaTitle,
  description: t?.metaDescription,
  alternates: { canonical: PATH },
};

export default function BioarquitecturaEnPage() {
  if (!course || !t) notFound();

  const whatsapp = `https://wa.me/5493549431594?text=${encodeURIComponent(t.whatsappTexto)}`;
  const jsonLd = courseCatalogJsonLd(course, {
    locale: 'en',
    path: PATH,
    description: t.metaDescription,
    name: nombreTraducido(t),
  });

  return (
    <>
      <SiteHeader locale="en" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CourseDetailTranslated course={course} t={t} locale="en" base="/en" whatsapp={whatsapp} />
      <SiteFooter />
    </>
  );
}
