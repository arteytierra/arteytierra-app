import 'server-only';
import { createSupabaseAdminClient } from '@/lib/db/admin';

export type CategoryKey = 'orders' | 'courses' | 'reservations' | 'marketing' | 'community';

export interface EmailPrefs {
  orders: boolean;
  courses: boolean;
  reservations: boolean;
  marketing: boolean;
  community: boolean;
}

const DEFAULTS: EmailPrefs = {
  orders: true,
  courses: true,
  reservations: true,
  marketing: true,
  community: true,
};

/**
 * Resuelve user_id a partir de `token` (= email_messages.id) o de la sesión.
 * Permite gestionar preferencias desde un link de footer sin login.
 */
export async function resolveContextFromToken(
  token: string | null,
): Promise<{ userId: string | null; recipient: string | null }> {
  if (!token) return { userId: null, recipient: null };
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .schema('app')
    .from('email_messages')
    .select('user_id, recipient')
    .eq('id', token)
    .maybeSingle();
  return {
    userId: (data?.user_id as string | null) ?? null,
    recipient: (data?.recipient as string | null) ?? null,
  };
}

export async function getPreferences(userId: string): Promise<EmailPrefs> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .schema('app')
    .from('email_preferences')
    .select('orders, courses, reservations, marketing, community')
    .eq('user_id', userId)
    .maybeSingle();
  return { ...DEFAULTS, ...((data ?? {}) as Partial<EmailPrefs>) };
}

export async function savePreferences(userId: string, prefs: Partial<EmailPrefs>): Promise<void> {
  const admin = createSupabaseAdminClient();
  await admin
    .schema('app')
    .from('email_preferences')
    .upsert({ user_id: userId, ...prefs, updated_at: new Date().toISOString() });
}

export async function unsubscribeByCategory(args: {
  recipient: string;
  category: CategoryKey | null;
  userId?: string | null;
}): Promise<void> {
  const admin = createSupabaseAdminClient();
  if (args.userId && args.category) {
    await savePreferences(args.userId, { [args.category]: false } as Partial<EmailPrefs>);
  }
  await admin.schema('app').from('email_suppressions').upsert({
    email: args.recipient.toLowerCase(),
    reason: 'unsubscribed',
    category: args.category,
  });
}
