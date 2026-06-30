import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCourse } from '@/lib/courses/data';
import { CourseDetailPage } from '@/components/cursos/CourseDetailPage';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

const course = getCourse('mi-tierra-mi-casa')!;

export const metadata: Metadata = {
  title: `${course.name}`,
  description: course.subtitle,
  alternates: { canonical: '/cursos/mi-tierra-mi-casa' },
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
