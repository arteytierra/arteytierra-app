import { notFound } from 'next/navigation';
import { Container, Eyebrow, Section } from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { BlockRenderer } from '@/components/cms/BlockRenderer';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { parseDocument } from '@/lib/cms/blocks';
import { JsonLd } from '@/components/seo/JsonLd';
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { buildSocial } from '@/lib/seo/og';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .schema('cms').from('posts')
    .select('title, excerpt, cover_url')
    .eq('slug', slug)
    .not('published_at', 'is', null)
    .maybeSingle();
  if (!data) return { title: 'Post no encontrado' };
  return {
    title: data.title,
    description: data.excerpt ?? undefined,
    alternates: { canonical: `/blog/${slug}` },
    ...buildSocial({
      title: data.title,
      description: data.excerpt ?? undefined,
      url: `/blog/${slug}`,
      ogKind: 'article',
      ogEyebrow: 'Diario',
    }),
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const admin = createSupabaseAdminClient();
  const { data: post } = await admin
    .schema('cms').from('posts')
    .select('title, excerpt, cover_url, blocks, published_at')
    .eq('slug', slug)
    .not('published_at', 'is', null)
    .maybeSingle();

  if (!post) notFound();
  const blocks = parseDocument(post.blocks);

  return (
    <>
      <SiteHeader />
      <Section tone="bone" spacing="md">
        <Container>
          <Eyebrow>
            {new Date(post.published_at!).toLocaleDateString('es-AR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Eyebrow>
          <h1 className="display-2 mt-6 max-w-[22ch]">{post.title}</h1>
          {post.excerpt && <p className="mt-6 max-w-prose text-lg text-ink-700/75">{post.excerpt}</p>}
        </Container>
        {post.cover_url && (
          <Container>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.cover_url} alt="" className="mt-10 aspect-[16/9] w-full rounded-2xl object-cover" />
          </Container>
        )}
      </Section>

      <article className="pb-24">
        <BlockRenderer blocks={blocks} />
      </article>

      <SiteFooter />

      <JsonLd
        data={[
          articleJsonLd({
            slug,
            title: post.title,
            description: post.excerpt ?? undefined,
            image: post.cover_url ?? undefined,
            publishedAt: post.published_at!,
          }),
          breadcrumbJsonLd([
            { name: 'Inicio', url: '/' },
            { name: 'Diario', url: '/blog' },
            { name: post.title, url: `/blog/${slug}` },
          ]),
        ]}
      />
    </>
  );
}
