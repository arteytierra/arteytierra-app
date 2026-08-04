import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCourse, type CourseData } from '@/lib/courses/data';
import { CourseDetailPage } from '@/components/cursos/CourseDetailPage';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { getBuyerCurrency } from '@/lib/commerce/geo';

const base = getCourse('formacion-construccion-natural')!;

export const metadata: Metadata = {
  title: base.name,
  description: base.subtitle,
  alternates: { canonical: '/cursos/formacion-construccion-natural' },
};

export default async function Page() {
  if (!base) notFound();

  // Moneda según ubicación: Argentina ve pesos, resto del mundo ve USD.
  const currency = await getBuyerCurrency();
  const course: CourseData =
    currency === 'USD'
      ? { ...base, opciones: base.opciones.map((o) => ({ ...o, precio: o.precioAlt ?? o.precio })) }
      : base;

  return (
    <>
      <SiteHeader />
      <CourseDetailPage course={course} />
      <SiteFooter />
    </>
  );
}
