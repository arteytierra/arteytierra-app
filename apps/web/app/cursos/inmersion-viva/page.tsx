import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCourse } from '@/lib/courses/data';
import { CourseDetailPage } from '@/components/cursos/CourseDetailPage';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

const course = getCourse('inmersion-viva')!;

export const metadata: Metadata = {
  title: `${course.name} — Arte y Tierra`,
  description: course.subtitle,
  alternates: { canonical: '/cursos/inmersion-viva' },
};

export default function Page() {
  if (!course) notFound();
  return (
    <>
      <SiteHeader />
      <CourseDetailPage course={course} />
      <SiteFooter />
    </>
  );
}
