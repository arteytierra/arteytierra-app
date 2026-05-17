import 'server-only';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { createSupabaseServerClient } from '@/lib/db/server';
import { getLocale } from '@/lib/i18n';
import { localizeRow, localizeRows } from '@/lib/i18n/localize';

const PRODUCT_I18N_FIELDS = ['name', 'subtitle', 'description_mdx'] as const;

export interface ProductRow {
  id: string;
  type: string;
  slug: string;
  name: string;
  subtitle: string | null;
  description_mdx: string | null;
  gallery: unknown;
  base_price_cents: number;
  compare_at_cents: number | null;
  currency: string;
  attributes: Record<string, unknown> | null;
  seo: Record<string, unknown> | null;
  tags: string[] | null;
  category: string | null;
  stock: number | null;
  is_active: boolean;
}

export async function listProducts(filters: {
  type?: string;
  category?: string;
  search?: string;
  limit?: number;
}): Promise<ProductRow[]> {
  const supabase = await createSupabaseServerClient();
  let q = supabase.from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(filters.limit ?? 100);

  if (filters.type) q = q.eq('type', filters.type);
  if (filters.category) q = q.eq('category', filters.category);
  if (filters.search) q = q.ilike('name', `%${filters.search}%`);

  const { data } = await q;
  const rows = (data ?? []) as ProductRow[];
  const locale = await getLocale();
  return localizeRows(rows as never as Array<Record<string, unknown>>, locale, [...PRODUCT_I18N_FIELDS]) as never as ProductRow[];
}

export async function getProductBySlug(slug: string): Promise<ProductRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();
  if (!data) return null;
  const locale = await getLocale();
  return localizeRow(data as never as Record<string, unknown>, locale, [...PRODUCT_I18N_FIELDS]) as never as ProductRow;
}

export async function getCourseWithCurriculum(slug: string) {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from('products')
    .select(`
      *,
      courses(*,
        modules(id, position, title, summary,
          lessons(id, position, title, kind, duration_sec, is_free_preview)))
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();
  if (!data) return null;
  const locale = await getLocale();
  return localizeRow(data as Record<string, unknown>, locale, [...PRODUCT_I18N_FIELDS]);
}

export function getProductCover(product: { gallery: unknown }): string | undefined {
  const arr = (Array.isArray(product.gallery) ? product.gallery : []) as Array<{ url?: string } | string>;
  for (const item of arr) {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object' && 'url' in item) return item.url as string;
  }
  return undefined;
}
