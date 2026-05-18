import type { MetadataRoute } from 'next';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { enabledLocales, DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://arteytierra.org';

function altsFor(path: string, locales: Locale[]): Record<string, string> | undefined {
  if (locales.length <= 1) return undefined;
  const out: Record<string, string> = { 'x-default': `${SITE}${path}` };
  for (const l of locales) {
    out[l] = l === DEFAULT_LOCALE ? `${SITE}${path}` : `${SITE}/${l}${path}`;
  }
  return out;
}

const STATIC_ROUTES: Array<{ path: string; freq: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }> = [
  { path: '', freq: 'weekly', priority: 1.0 },
  { path: 'nosotros', freq: 'monthly', priority: 0.7 },
  { path: 'proyectos', freq: 'monthly', priority: 0.7 },
  { path: 'cursos', freq: 'weekly', priority: 0.9 },
  { path: 'inmersion-viva', freq: 'weekly', priority: 0.85 },
  { path: 'biocosmetica', freq: 'weekly', priority: 0.8 },
  { path: 'ebooks', freq: 'weekly', priority: 0.8 },
  { path: 'asesorias', freq: 'monthly', priority: 0.75 },
  { path: 'hospedaje', freq: 'weekly', priority: 0.85 },
  { path: 'blog', freq: 'weekly', priority: 0.85 },
  { path: 'contacto', freq: 'yearly', priority: 0.4 },
];

const TYPE_TO_PATH: Record<string, string> = {
  course: 'cursos',
  ebook: 'ebooks',
  biocosmetic: 'biocosmetica',
  lodging: 'hospedaje',
  consult: 'asesorias',
  immersion: 'inmersion-viva',
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = enabledLocales();
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => {
    const path = `/${r.path}`;
    return {
      url: `${SITE}${path === '/' ? '' : path}`,
      lastModified: new Date(),
      changeFrequency: r.freq,
      priority: r.priority,
      alternates: { languages: altsFor(path === '/' ? '/' : path, locales) },
    };
  });

  try {
    const admin = createSupabaseAdminClient();

    const [{ data: products }, { data: posts }] = await Promise.all([
      admin
        .schema('shop').from('products')
        .select('slug, type, updated_at')
        .eq('is_active', true)
        .in('type', Object.keys(TYPE_TO_PATH) as never),
      admin
        .schema('cms').from('posts')
        .select('slug, updated_at, published_at')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .limit(1000),
    ]);

    for (const p of products ?? []) {
      const base = TYPE_TO_PATH[p.type];
      if (!base) continue;
      const path = `/${base}/${p.slug}`;
      entries.push({
        url: `${SITE}${path}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: { languages: altsFor(path, locales) },
      });
    }

    for (const post of posts ?? []) {
      const path = `/blog/${post.slug}`;
      entries.push({
        url: `${SITE}${path}`,
        lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: { languages: altsFor(path, locales) },
      });
    }
  } catch (err) {
    // En build sin DB: devolver solo estáticas.
    console.warn('[sitemap] dynamic generation skipped', err);
  }

  return entries;
}
