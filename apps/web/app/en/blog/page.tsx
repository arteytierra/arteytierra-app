import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, Eyebrow, Section } from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { createSupabaseAdminClient } from '@/lib/db/admin';

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Notes from the hills: agroecology, hydrology, natural building.',
  alternates: { canonical: '/en/blog' },
};
export const revalidate = 300;

export default async function BlogIndexEn() {
  const admin = createSupabaseAdminClient();
  const { data: posts } = await admin
    .schema('cms').from('posts')
    .select('id, slug, title, excerpt, cover_url, published_at')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })
    .limit(50);

  return (
    <>
      <SiteHeader locale="en" />
      <Section tone="ink" spacing="md" className="text-bone-50">
        <Container>
          <Eyebrow className="text-bone-50/70">Journal</Eyebrow>
          <h1 className="display-1 mt-6">Notes from the hills.</h1>
          <p className="mt-6 max-w-prose text-bone-50/80 text-lg">
            Essays, build logs, recipes. Slow, deliberate, in a low voice.
          </p>
          <p className="mt-3 text-sm text-bone-50/50 italic">Articles are published in Spanish.</p>
        </Container>
      </Section>

      <Section tone="bone">
        <Container>
          {(!posts || posts.length === 0) ? (
            <p className="text-ink-700/60">No posts published yet.</p>
          ) : (
            <ul className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <li key={p.id} className="group">
                  <Link href={`/blog/${p.slug}`} className="block">
                    {p.cover_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.cover_url} alt="" className="aspect-[4/3] w-full rounded-2xl object-cover" />
                    )}
                    <p className="mt-4 text-xs uppercase tracking-[0.16em] text-clay-500">
                      {new Date(p.published_at!).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <h2 className="mt-2 font-display text-2xl leading-tight group-hover:text-clay-700 transition">
                      {p.title}
                    </h2>
                    {p.excerpt && <p className="mt-3 text-ink-700/70 line-clamp-3">{p.excerpt}</p>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Section>

      <SiteFooter />
    </>
  );
}
