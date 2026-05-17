const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://arteytierra.org';

export function ogUrl(opts: {
  title: string;
  eyebrow?: string;
  kind?: 'course' | 'ebook' | 'lodging' | 'inmersion' | 'article' | 'default';
}): string {
  const sp = new URLSearchParams();
  sp.set('title', opts.title);
  if (opts.eyebrow) sp.set('eyebrow', opts.eyebrow);
  if (opts.kind) sp.set('kind', opts.kind);
  return `${SITE}/og?${sp.toString()}`;
}

/** Genera el objeto `openGraph` y `twitter` listo para `metadata`. */
export function buildSocial(opts: {
  title: string;
  description?: string;
  url?: string;
  ogTitle?: string;
  ogEyebrow?: string;
  ogKind?: Parameters<typeof ogUrl>[0]['kind'];
}) {
  const image = ogUrl({
    title: opts.ogTitle ?? opts.title,
    eyebrow: opts.ogEyebrow,
    kind: opts.ogKind,
  });
  return {
    openGraph: {
      title: opts.title,
      description: opts.description,
      url: opts.url,
      images: [{ url: image, width: 1200, height: 630, alt: opts.title }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: opts.title,
      description: opts.description,
      images: [image],
    },
  };
}
