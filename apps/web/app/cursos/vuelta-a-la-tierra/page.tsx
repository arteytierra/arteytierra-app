import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCourse } from '@/lib/courses/data';
import { CourseDetailPage } from '@/components/cursos/CourseDetailPage';

const course = getCourse('vuelta-a-la-tierra')!;

export const metadata: Metadata = {
  title: `${course.name} — Arte y Tierra`,
  description: course.subtitle,
  alternates: { canonical: '/cursos/vuelta-a-la-tierra' },
};

export default function Page() {
  if (!course) notFound();
  return <CourseDetailPage course={course} />;
}
