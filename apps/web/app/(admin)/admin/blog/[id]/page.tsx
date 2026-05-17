import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Button } from '@arteytierra/ui';
import { PageHeader } from '@/components/admin/PageHeader';
import { BlockEditor } from '@/components/admin/cms/BlockEditor';
import { PostMetaForm } from '@/components/admin/cms/PostMetaForm';
import { PublishToggle } from '@/components/admin/cms/PublishToggle';
import { loadPostForEditor } from '@/lib/cms/actions';

export const metadata = { title: 'Editar post · Admin' };
export const dynamic = 'force-dynamic';

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await loadPostForEditor(id);
  if (!post) notFound();

  return (
    <>
      <PageHeader
        title={post.title}
        description={`/blog/${post.slug}`}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/blog/${post.slug}`} target="_blank" rel="noopener">
              <Button variant="outline" size="sm">
                <ExternalLink size={14} /> Ver
              </Button>
            </Link>
            <PublishToggle postId={post.id} isPublished={Boolean(post.published_at)} />
          </div>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <BlockEditor postId={post.id} initialBlocks={post.blocks} />
        <aside className="space-y-4">
          <PostMetaForm
            postId={post.id}
            initial={{
              title: post.title,
              slug: post.slug,
              excerpt: post.excerpt ?? '',
              cover_url: post.cover_url ?? '',
            }}
          />
        </aside>
      </div>
    </>
  );
}
