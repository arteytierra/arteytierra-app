import Link from 'next/link';
import { requireStaff } from '@/lib/auth/session';
import { listAllArticlesForAdmin, listHelpCategories } from '@/lib/help';
import { deleteHelpArticleAction } from '@/lib/help/actions';

export const metadata = { title: 'Centro de ayuda — admin' };

export default async function AdminHelpPage() {
  await requireStaff();
  const [articles, categories] = await Promise.all([
    listAllArticlesForAdmin(),
    listHelpCategories(),
  ]);
  const catBySlug = Object.fromEntries(categories.map((c) => [c.id, c]));

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Centro de ayuda</h1>
          <p className="text-sm text-mute mt-1">
            {articles.length} artículo(s) · {categories.length} categoría(s).
          </p>
        </div>
        <Link
          href="/admin/ayuda/nuevo"
          className="rounded-md bg-leaf text-bone px-4 py-2 text-sm hover:opacity-90"
        >
          Nuevo artículo
        </Link>
      </header>

      <div className="overflow-x-auto rounded-xl border border-ink/10 bg-bone-50">
        <table className="w-full text-sm">
          <thead className="text-left bg-bone-100">
            <tr>
              <th className="px-3 py-2">Título</th>
              <th className="px-3 py-2">Categoría</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2 text-right">Vistas</th>
              <th className="px-3 py-2 text-right">👍 / 👎</th>
              <th className="px-3 py-2">Actualizado</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => {
              const cat = a.category_id ? catBySlug[a.category_id] : null;
              return (
                <tr key={a.id} className="border-t border-ink/5">
                  <td className="px-3 py-2">
                    <Link href={`/admin/ayuda/${a.id}`} className="font-medium hover:text-moss-700">
                      {a.title}
                    </Link>
                    <div className="text-xs text-mute font-mono">/{a.slug}</div>
                  </td>
                  <td className="px-3 py-2 text-xs">{cat?.title ?? '—'}</td>
                  <td className="px-3 py-2">
                    {a.is_published ? (
                      <span className="text-xs rounded bg-leaf/10 text-leaf px-2 py-0.5">publicado</span>
                    ) : (
                      <span className="text-xs rounded bg-amber-100 text-amber-800 px-2 py-0.5">borrador</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{a.view_count}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {a.helpful_yes} / {a.helpful_no}
                  </td>
                  <td className="px-3 py-2 text-mute text-xs whitespace-nowrap">
                    {new Date(a.updated_at).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <form action={async () => { 'use server'; await deleteHelpArticleAction(a.id); }}>
                      <button className="text-xs text-red-700 hover:underline">Borrar</button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {articles.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-12 text-center text-mute">Sin artículos.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
