import 'server-only';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { createSupabaseServerClient } from '@/lib/db/server';
import { sendPushToUser, type PushPayload } from '@/lib/pwa/push';

export type NotificationKind =
  | 'qa_reply'
  | 'qa_accepted'
  | 'qa_mention'
  | 'order_paid'
  | 'enrollment_created'
  | 'lesson_published'
  | 'reservation_confirmed'
  | 'reservation_reminder'
  | 'certificate_issued'
  | 'scholarship_decision'
  | 'partner_decision'
  | 'commission_confirmed'
  | 'broadcast';

export interface NotificationRow {
  id: string;
  user_id: string;
  kind: NotificationKind;
  title: string;
  body: string | null;
  url: string | null;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

interface CreateArgs {
  userId: string;
  kind: NotificationKind;
  title: string;
  body?: string;
  url?: string;
  data?: Record<string, unknown>;
  /** Si true, también dispara web-push a las suscripciones del user. */
  push?: boolean;
  pushOverride?: Partial<PushPayload>;
}

/**
 * Inserta una notificación in-app y opcionalmente dispara push.
 * Idempotencia: el caller debe gestionarla (e.g. unique key en `data`).
 */
export async function createNotification(args: CreateArgs): Promise<string | null> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .schema('app')
    .from('notifications')
    .insert({
      user_id: args.userId,
      kind: args.kind,
      title: args.title,
      body: args.body ?? null,
      url: args.url ?? null,
      data: args.data ?? {},
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error('[notifications] insert failed', error);
    return null;
  }
  const id = data.id as string;

  if (args.push) {
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? '';
    void sendPushToUser(args.userId, {
      title: args.pushOverride?.title ?? args.title,
      body: args.pushOverride?.body ?? args.body ?? '',
      url: args.pushOverride?.url ?? (args.url ? `${site}${args.url}` : site),
      tag: args.pushOverride?.tag ?? args.kind,
      icon: args.pushOverride?.icon ?? '/icons/icon-192.png',
    }).catch((err) => console.error('[notifications] push failed', err));
  }

  return id;
}

/** Lista las notificaciones recientes del usuario actual. */
export async function listMyNotifications(opts: { limit?: number; unreadOnly?: boolean } = {}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [] as NotificationRow[];

  let q = supabase
    .schema('app')
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(opts.limit ?? 30);
  if (opts.unreadOnly) q = q.is('read_at', null);

  const { data } = await q;
  return (data ?? []) as never as NotificationRow[];
}

export async function getMyUnreadCount(): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;
  const { count } = await supabase
    .schema('app')
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('read_at', null);
  return count ?? 0;
}
