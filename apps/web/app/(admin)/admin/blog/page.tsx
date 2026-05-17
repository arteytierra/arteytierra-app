import Link from 'next/link';
import { Badge, Button } from '@arteytierra/ui';
import { PageHeader } from '@/components/admin/PageHeader';
import { EmptyState } from '@/components/admin/EmptyState';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { requireStaff } from '@/lib/auth/session';
import { CreatePostButton } from '@/components/admin/cms/CreatePostButton';

export const metadata = { title: 'Blog · Admin' };
export const dynamic = 'force-dynamic';

export default async function BlogAdminPage() {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from('posts')
    .select('id, slug, title, published_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(100);

  return (
    <>
      <PageHeader
        title="Blog & CMS"
        description="Posts, categorías y SEO. Editor por bloques."
        actions={<CreatePostButton />}
      />

      {!data || data.length === 0 ? (
        <EmptyState
          title="Sin posts publicados"
          description="Escribí el primer post desde el editor por bloques."
        />
      ) : (
        <ul className="grid gap-2">
          {data.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-4 rounded-xl border border-ink-950/10 bg-bone-50 px-5 py-4"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{p.title}</p>
                <p className="text-xs text-ink-800/60">/blog/{p.slug}</p>
              </div>
              <Badge tone={p.published_at ? 'moss' : 'neutral'}>
                {p.published_at ? 'publicado' : 'borrador'}
              </Badge>
              <span className="text-xs text-ink-800/60 hidden sm:inline">
                {p.published_at
                  ? new Date(p.published_at).toLocaleDateString('es-AR')
                  : new Date(p.updated_at).toLocaleDateString('es-AR')}
              </span>
              <Link href={`/admin/blog/${p.id}`}>
                <Button variant="outline" size="sm">Editar</Button>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
