import 'server-only';
import { createSupabaseAdminClient } from '@/lib/db/admin';

export interface HelpCategory {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  position: number;
}

export interface HelpArticle {
  id: string;
  category_id: string | null;
  slug: string;
  title: string;
  excerpt: string | null;
  body_md: string;
  tags: string[];
  is_published: boolean;
  view_count: number;
  helpful_yes: number;
  helpful_no: number;
  updated_at: string;
  created_at: string;
}

export interface HelpSearchHit {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category_slug: string | null;
  rank: number;
}

export async function listHelpCategories(): Promise<HelpCategory[]> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .schema('help')
    .from('categories')
    .select('*')
    .order('position', { ascending: true });
  return (data ?? []) as HelpCategory[];
}

export async function getCategoryWithArticles(slug: string) {
  const admin = createSupabaseAdminClient();
  const { data: cat } = await admin
    .schema('help')
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (!cat) return null;
  const { data: articles } = await admin
    .schema('help')
    .from('articles')
    .select('id, slug, title, excerpt, view_count, updated_at')
    .eq('category_id', cat.id)
    .eq('is_published', true)
    .order('view_count', { ascending: false });
  return { category: cat as HelpCategory, articles: (articles ?? []) };
}

export async function getArticleBySlug(slug: string) {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .schema('help')
    .from('articles')
    .select('*, categories:category_id(slug, title)')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  if (data) {
    // Incrementar view count best-effort.
    void admin.rpc('increment_article_view', { p_slug: slug }).then(() => {}).catch(() => {});
  }
  return data as (HelpArticle & { categories: { slug: string; title: string } | null }) | null;
}

export async function searchHelp(query: string, limit = 12): Promise<HelpSearchHit[]> {
  const admin = createSupabaseAdminClient();
  // Wrapper público para evitar tener que exponer schema help vía RPC.
  const { data } = await admin.rpc('search_help_articles', {
    p_query: query,
    p_limit: limit,
  });
  return (data ?? []) as HelpSearchHit[];
}

export async function listAllArticlesForAdmin(): Promise<HelpArticle[]> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .schema('help')
    .from('articles')
    .select('*')
    .order('updated_at', { ascending: false });
  return (data ?? []) as HelpArticle[];
}
