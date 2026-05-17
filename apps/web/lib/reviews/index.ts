'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCurrentUser, requireUser, requireStaff } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { createSupabaseServerClient } from '@/lib/db/server';
import { log } from '@/lib/observability/logger';

/**
 * Reviews sobre productos. Las verified_purchase se setean por trigger SQL
 * (se chequea si existe order_item pagado del mismo product_id por el usuario).
 * Toda review entra en `pending` hasta que un staff la apruebe.
 */

const reviewSchema = z.object({
  product_id: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().max(120).optional().nullable(),
  body: z.string().max(2000).optional().nullable(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

export interface ReviewItem {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  verified_purchase: boolean;
  created_at: string;
  author_name: string | null;
}

export interface ReviewAggregate {
  review_count: number;
  rating_avg: number;
  distribution: { 5: number; 4: number; 3: number; 2: number; 1: number };
}

export async function getReviewAggregate(productId: string): Promise<ReviewAggregate | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('review_aggregates')
    .select('review_count, rating_avg, r5, r4, r3, r2, r1')
    .eq('product_id', productId)
    .maybeSingle();
  if (!data) return null;
  return {
    review_count: data.review_count as number,
    rating_avg: data.rating_avg as number,
    distribution: {
      5: data.r5 as number,
      4: data.r4 as number,
      3: data.r3 as number,
      2: data.r2 as number,
      1: data.r1 as number,
    },
  };
}

export async function listReviewsForProduct(productId: string, limit = 20): Promise<ReviewItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('reviews')
    .select('id, rating, title, body, verified_purchase, created_at, user_id')
    .eq('product_id', productId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit);

  const rows = (data ?? []) as Array<Record<string, unknown>>;
  const userIds = Array.from(new Set(rows.map((r) => r.user_id as string).filter(Boolean)));
  let nameById: Record<string, string | null> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds);
    nameById = Object.fromEntries(
      ((profiles ?? []) as Array<{ id: string; full_name: string | null }>).map((p) => [p.id, p.full_name]),
    );
  }

  return rows.map((r) => ({
    id: r.id as string,
    rating: r.rating as number,
    title: (r.title as string | null) ?? null,
    body: (r.body as string | null) ?? null,
    verified_purchase: (r.verified_purchase as boolean) ?? false,
    created_at: r.created_at as string,
    author_name: nameById[r.user_id as string] ?? null,
  }));
}

export async function getMyReviewForProduct(productId: string): Promise<ReviewItem | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('reviews')
    .select('id, rating, title, body, verified_purchase, created_at, status')
    .eq('product_id', productId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id as string,
    rating: data.rating as number,
    title: (data.title as string | null) ?? null,
    body: (data.body as string | null) ?? null,
    verified_purchase: (data.verified_purchase as boolean) ?? false,
    created_at: data.created_at as string,
    author_name: null,
  };
}

export async function submitReview(input: ReviewInput) {
  const user = await requireUser();
  const parsed = reviewSchema.parse(input);
  const admin = createSupabaseAdminClient();

  // Upsert por (product_id, user_id)
  const { error } = await admin
    .from('reviews')
    .upsert(
      {
        product_id: parsed.product_id,
        user_id: user.id,
        rating: parsed.rating,
        title: parsed.title,
        body: parsed.body,
        status: 'pending',
      },
      { onConflict: 'product_id,user_id' },
    );
  if (error) throw new Error(error.message);

  // Buscar slug del producto para revalidar path
  const { data: prod } = await admin.from('products').select('slug, type').eq('id', parsed.product_id).single();
  if (prod) {
    revalidatePath(routeForType(prod.type as string, prod.slug as string));
  }
  log.info('review.submitted', { userId: user.id, productId: parsed.product_id, rating: parsed.rating });
  return { ok: true };
}

function routeForType(type: string, slug: string): string {
  const map: Record<string, string> = {
    course: `/cursos/${slug}`,
    ebook: `/ebooks/${slug}`,
    biocosmetic: `/biocosmetica/${slug}`,
    lodging: `/hospedaje/${slug}`,
    immersion: `/inmersion-viva/${slug}`,
    consult: `/asesorias/${slug}`,
  };
  return map[type] ?? `/tienda/${slug}`;
}

// ---------------- Admin moderation ----------------

export interface PendingReview extends ReviewItem {
  product_id: string;
  product_name: string | null;
  status: 'pending' | 'approved' | 'rejected';
}

export async function listReviewsAdmin(filter: 'pending' | 'approved' | 'rejected' | 'all' = 'pending'): Promise<PendingReview[]> {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  let query = admin
    .from('reviews')
    .select('id, product_id, rating, title, body, verified_purchase, created_at, status, products(name)')
    .order('created_at', { ascending: false })
    .limit(100);
  if (filter !== 'all') query = query.eq('status', filter);
  const { data } = await query;
  return ((data ?? []) as Array<Record<string, unknown>>).map((r) => ({
    id: r.id as string,
    product_id: r.product_id as string,
    rating: r.rating as number,
    title: (r.title as string | null) ?? null,
    body: (r.body as string | null) ?? null,
    verified_purchase: (r.verified_purchase as boolean) ?? false,
    created_at: r.created_at as string,
    author_name: null,
    product_name: ((r.products as { name?: string } | null)?.name) ?? null,
    status: r.status as 'pending' | 'approved' | 'rejected',
  }));
}

export async function moderateReview(id: string, status: 'approved' | 'rejected') {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from('reviews').update({ status }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/reviews');
  log.info('review.moderated', { id, status });
  return { ok: true };
}

export async function deleteReview(id: string) {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  await admin.from('reviews').delete().eq('id', id);
  revalidatePath('/admin/reviews');
  return { ok: true };
}
