import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Button } from '@arteytierra/ui';
import { PageHeader } from '@/components/admin/PageHeader';
import { CurriculumEditor } from '@/components/admin/courses/CurriculumEditor';
import { getCourseEditorData } from '@/lib/admin/courses';

export const metadata = { title: 'Editar currículum · Admin' };
export const dynamic = 'force-dynamic';

export default async function CourseEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getCourseEditorData(id);
  if (!data) notFound();

  return (
    <>
      <PageHeader
        title={data.product.name}
        description={`/${data.product.slug} · Currículum`}
        actions={
          <Link href={`/cursos/${data.product.slug}`} target="_blank" rel="noopener">
            <Button variant="outline" size="sm">
              <ExternalLink size={14} /> Ver público
            </Button>
          </Link>
        }
      />

      <CurriculumEditor
        courseId={data.course.id}
        productSlug={data.product.slug}
        modules={data.modules}
        lessons={data.lessons}
      />
    </>
  );
}
