import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Container, Section } from '@arteytierra/ui';
import { ChevronLeft } from 'lucide-react';
import { getArticleBySlug } from '@/lib/help';
import { HelpFeedback } from '@/components/help/HelpFeedback';
import { buildMetadata } from '@/lib/seo/meta';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = await getArticleBySlug(slug);
  if (!a) return { title: 'Artículo no encontrado' };
  return buildMetadata({
    title: a.title,
    eyebrow: a.categories?.title ?? 'Ayuda',
    description: a.excerpt ?? undefined,
    path: `/ayuda/${slug}`,
  });
}

export default async function HelpArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <Section>
      <Container className="max-w-3xl">
        <Link href="/ayuda" className="inline-flex items-center gap-1 text-sm text-mute hover:text-ink-950">
          <ChevronLeft size={14} /> Centro de ayuda
        </Link>
        {article.categories && (
          <Link
            href={`/ayuda/categoria/${article.categories.slug}`}
            className="block mt-3 text-xs uppercase tracking-wide text-moss-700"
          >
            {article.categories.title}
          </Link>
        )}
        <h1 className="mt-2 font-display text-4xl text-ink-950">{article.title}</h1>
        {article.excerpt && (
          <p className="mt-3 text-lg text-ink-800/70">{article.excerpt}</p>
        )}
        <article
          className="mt-8 prose prose-stone max-w-none prose-headings:font-display prose-a:text-moss-700"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(article.body_md) }}
        />

        <HelpFeedback articleId={article.id} />
      </Container>
    </Section>
  );
}

/** Markdown muy mínimo — sin dependencias externas para mantener bundle chico. */
function renderMarkdown(md: string): string {
  // Headers
  let html = md
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>');
  // Bold + italic + code inline
  html = html
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
  // Links [txt](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noopener">$1</a>');
  // Listas ítem por ítem.
  html = html.replace(/^[-*] (.+$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);
  // Párrafos: dobles newlines.
  html = html
    .split(/\n{2,}/)
    .map((p) => (p.startsWith('<') ? p : `<p>${p.trim()}</p>`))
    .join('\n');
  return html;
}
