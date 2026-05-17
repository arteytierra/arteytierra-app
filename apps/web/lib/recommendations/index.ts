import 'server-only';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { getProductCover } from '@/lib/commerce/products';

export interface RecommendationItem {
  id: string;
  type: string;
  slug: string;
  name: string;
  subtitle: string | null;
  cover?: string;
  href: string;
  base_price_cents: number;
  currency: string;
  reason: string;
  score: number;
}

function hrefFor(type: string, slug: string): string {
  switch (type) {
    case 'course': return `/cursos/${slug}`;
    case 'ebook': return `/ebooks/${slug}`;
    case 'biocosmetic': return `/biocosmetica/${slug}`;
    case 'lodging': return `/hospedaje/${slug}`;
    case 'immersion': return `/inmersion-viva/${slug}`;
    case 'consult': return `/asesorias/${slug}`;
    default: return `/tienda/${slug}`;
  }
}

export async function recommendForProduct(productId: string, limit = 6): Promise<RecommendationItem[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.schema('app').rpc('recommend_for_product', {
    p_product: productId,
    p_limit: limit,
  });
  if (error) {
    console.error('[recs] product rpc', error);
    return [];
  }
  return ((data ?? []) as Array<Record<string, unknown>>).map((r) => ({
    id: r.id as string,
    type: r.type as string,
    slug: r.slug as string,
    name: r.name as string,
    subtitle: (r.subtitle as string | null) ?? null,
    cover: getProductCover({ gallery: r.gallery }),
    href: hrefFor(r.type as string, r.slug as string),
    base_price_cents: r.base_price_cents as number,
    currency: r.currency as string,
    reason: r.reason as string,
    score: r.score as number,
  }));
}

export async function recommendForUser(userId: string, limit = 8): Promise<RecommendationItem[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.schema('app').rpc('recommend_for_user', {
    p_user: userId,
    p_limit: limit,
  });
  if (error) {
    console.error('[recs] user rpc', error);
    return [];
  }
  return ((data ?? []) as Array<Record<string, unknown>>).map((r) => ({
    id: r.id as string,
    type: r.type as string,
    slug: r.slug as string,
    name: r.name as string,
    subtitle: (r.subtitle as string | null) ?? null,
    cover: getProductCover({ gallery: r.gallery }),
    href: hrefFor(r.type as string, r.slug as string),
    base_price_cents: r.base_price_cents as number,
    currency: r.currency as string,
    reason: r.reason as string,
    score: r.score as number,
  }));
}
