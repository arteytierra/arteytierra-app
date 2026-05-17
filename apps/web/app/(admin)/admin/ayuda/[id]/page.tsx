import { notFound } from 'next/navigation';
import { requireStaff } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { listHelpCategories, type HelpArticle } from '@/lib/help';
import { HelpArticleEditor } from '@/components/admin/HelpArticleEditor';

export const metadata = { title: 'Editar artículo' };

export default async function AdminHelpEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;
  const categories = await listHelpCategories();

  if (id === 'nuevo') {
    return (
      <div>
        <h1 className="font-display text-2xl text-ink mb-6">Nuevo artículo</h1>
        <HelpArticleEditor categories={categories} />
      </div>
    );
  }

  const admin = createSupabaseAdminClient();
  const { data: article } = await admin
    .schema('help')
    .from('articles')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (!article) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl text-ink mb-6">Editar — {article.title}</h1>
      <HelpArticleEditor article={article as HelpArticle} categories={categories} />
    </div>
  );
}
