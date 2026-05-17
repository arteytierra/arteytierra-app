import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Container, Section } from '@arteytierra/ui';
import { ChevronLeft, FileText } from 'lucide-react';
import { getCategoryWithArticles } from '@/lib/help';
import { buildMetadata } from '@/lib/seo/meta';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = await getCategoryWithArticles(slug);
  if (!r) return { title: 'Categoría no encontrada' };
  return buildMetadata({
    title: r.category.title,
    eyebrow: 'Centro de ayuda',
    description: r.category.description ?? undefined,
    path: `/ayuda/categoria/${slug}`,
  });
}

export default async function HelpCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = await getCategoryWithArticles(slug);
  if (!r) notFound();
  const { category, articles } = r;

  return (
    <Section>
      <Container className="max-w-3xl">
        <Link href="/ayuda" className="inline-flex items-center gap-1 text-sm text-mute hover:text-ink-950">
          <ChevronLeft size={14} /> Centro de ayuda
        </Link>
        <h1 className="mt-4 font-display text-4xl text-ink-950">{category.title}</h1>
        {category.description && (
          <p className="mt-2 text-ink-800/70">{category.description}</p>
        )}

        <ul className="mt-8 space-y-2">
          {articles.map((a) => (
            <li key={a.id}>
              <Link
                href={`/ayuda/${a.slug}`}
                className="flex items-start gap-3 rounded-xl border border-ink-950/10 bg-bone-50 p-4 hover:border-moss-700/30 hover:-translate-y-0.5 transition-all"
              >
                <FileText size={18} className="text-moss-700 mt-0.5 flex-none" />
                <div className="min-w-0">
                  <div className="font-medium text-ink-950">{a.title}</div>
                  {a.excerpt && <div className="text-sm text-mute mt-1 line-clamp-2">{a.excerpt}</div>}
                </div>
              </Link>
            </li>
          ))}
          {articles.length === 0 && (
            <li className="text-mute text-sm">Aún no hay artículos en esta categoría.</li>
          )}
        </ul>
      </Container>
    </Section>
  );
}
