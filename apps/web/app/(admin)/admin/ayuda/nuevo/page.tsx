import { requireStaff } from '@/lib/auth/session';
import { listHelpCategories } from '@/lib/help';
import { HelpArticleEditor } from '@/components/admin/HelpArticleEditor';

export const metadata = { title: 'Nuevo artículo' };

export default async function NewHelpArticlePage() {
  await requireStaff();
  const categories = await listHelpCategories();
  return (
    <div>
      <h1 className="font-display text-2xl text-ink mb-6">Nuevo artículo</h1>
      <HelpArticleEditor categories={categories} />
    </div>
  );
}
