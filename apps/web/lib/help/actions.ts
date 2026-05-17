'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { headers } from 'next/headers';
import { requireStaff, getCurrentUser } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';

const articleSchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  title: z.string().min(2).max(160),
  excerpt: z.string().max(300).optional().nullable(),
  body_md: z.string().min(2),
  category_id: z.string().uuid().optional().nullable(),
  tags: z.array(z.string()).default([]),
  is_published: z.boolean().default(false),
});

export type HelpArticleInput = z.infer<typeof articleSchema>;

export async function upsertHelpArticleAction(input: HelpArticleInput, id?: string) {
  const user = await requireStaff();
  const parsed = articleSchema.parse(input);
  const admin = createSupabaseAdminClient();
  const row = { ...parsed, author_id: user.id };

  if (id) {
    const { error } = await admin.schema('help').from('articles').update(row).eq('id', id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await admin.schema('help').from('articles').insert(row);
    if (error) throw new Error(error.message);
  }
  revalidatePath('/admin/ayuda');
  revalidatePath(`/ayuda/${parsed.slug}`);
  return { ok: true };
}

export async function deleteHelpArticleAction(id: string) {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  await admin.schema('help').from('articles').delete().eq('id', id);
  revalidatePath('/admin/ayuda');
}

export async function submitHelpFeedbackAction(opts: {
  articleId: string;
  helpful: boolean;
  comment?: string;
}) {
  const user = await getCurrentUser().catch(() => null);
  const hdrs = await headers();
  const cookieHeader = hdrs.get('cookie') ?? '';
  const vidMatch = cookieHeader.match(/(?:^|;\s*)ay_vid=([^;]+)/);
  const visitorId = vidMatch?.[1] ?? null;

  const admin = createSupabaseAdminClient();
  await admin.schema('help').from('article_feedback').insert({
    article_id: opts.articleId,
    user_id: user?.id ?? null,
    visitor_id: visitorId,
    helpful: opts.helpful,
    comment: opts.comment ?? null,
  });

  // Incrementar counters.
  await admin.rpc(opts.helpful ? 'help_inc_helpful_yes' : 'help_inc_helpful_no', {
    p_article: opts.articleId,
  }).catch(() => {});
  return { ok: true };
}
