import type { Metadata } from 'next';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://arteytierra.org';

export function ogImageUrl(args: { title: string; eyebrow?: string; kind?: string }) {
  const sp = new URLSearchParams();
  sp.set('title', args.title.slice(0, 140));
  if (args.eyebrow) sp.set('eyebrow', args.eyebrow.slice(0, 60));
  if (args.kind) sp.set('kind', args.kind);
  return `${SITE}/api/og?${sp.toString()}`;
}

interface BuildArgs {
  title: string;
  description?: string;
  path: string;
  kind?: 'course' | 'ebook' | 'post' | 'lodging' | 'immersion' | 'consult' | 'page';
  eyebrow?: string;
  image?: string;            // override image
  noIndex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
}

/**
 * Constructor de metadata coherente: title, description, canonical, OG, Twitter.
 * Si no se pasa `image`, se genera vía /api/og?title=...&kind=...
 */
export function buildMetadata(args: BuildArgs): Metadata {
  const url = `${SITE}${args.path}`;
  const image = args.image ?? ogImageUrl({ title: args.title, eyebrow: args.eyebrow, kind: args.kind });
  return {
    title: args.title,
    description: args.description,
    alternates: { canonical: args.path },
    robots: args.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: args.kind === 'post' ? 'article' : 'website',
      url,
      title: args.title,
      description: args.description,
      siteName: 'Arte y Tierra',
      locale: 'es_AR',
      images: [{ url: image, width: 1200, height: 630 }],
      ...(args.publishedTime ? { publishedTime: args.publishedTime } : {}),
      ...(args.modifiedTime ? { modifiedTime: args.modifiedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: args.title,
      description: args.description,
      images: [image],
    },
  };
}
