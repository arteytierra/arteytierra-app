'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/db/server';
import {
  resolveContextFromToken,
  savePreferences,
  unsubscribeByCategory,
  type CategoryKey,
  type EmailPrefs,
} from './preferences';

const CATEGORIES: CategoryKey[] = ['orders', 'courses', 'reservations', 'marketing', 'community'];

export async function updateEmailPreferencesAction(formData: FormData) {
  const token = (formData.get('token') as string | null) ?? null;

  let userId: string | null = null;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    userId = user.id;
  } else if (token) {
    const ctx = await resolveContextFromToken(token);
    userId = ctx.userId;
  }

  if (!userId) return { ok: false, error: 'no-context' as const };

  const prefs: Partial<EmailPrefs> = {};
  for (const c of CATEGORIES) {
    prefs[c] = formData.get(`pref_${c}`) === 'on';
  }
  await savePreferences(userId, prefs);
  revalidatePath('/preferencias/email');
  return { ok: true as const };
}

export async function unsubscribeAction(formData: FormData) {
  const token = (formData.get('token') as string) ?? '';
  const catRaw = (formData.get('category') as string) ?? '';
  const category = (CATEGORIES as string[]).includes(catRaw) ? (catRaw as CategoryKey) : null;

  const ctx = await resolveContextFromToken(token);
  if (!ctx.recipient) return { ok: false, error: 'no-context' as const };

  await unsubscribeByCategory({
    recipient: ctx.recipient,
    category,
    userId: ctx.userId,
  });
  revalidatePath('/preferencias/email');
  return { ok: true as const, recipient: ctx.recipient, category };
}
