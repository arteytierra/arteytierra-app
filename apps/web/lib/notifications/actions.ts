'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/db/server';

export async function markNotificationReadAction(id: string) {
  const supabase = await createSupabaseServerClient();
  await supabase.schema('app').rpc('mark_notification_read', { p_id: id });
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function markAllNotificationsReadAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.schema('app').rpc('mark_all_notifications_read');
  revalidatePath('/', 'layout');
  return { ok: true };
}
