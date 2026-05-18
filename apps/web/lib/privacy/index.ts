import 'server-only';
import { createSupabaseAdminClient } from '@/lib/db/admin';

/**
 * Recolecta todo lo que la app tiene del usuario y devuelve un objeto JSON
 * "data export". Best-effort: tablas que no existen se ignoran.
 */
export async function buildUserDataExport(userId: string): Promise<Record<string, unknown>> {
  const admin = createSupabaseAdminClient();

  // Auth metadata
  const { data: authData } = await admin.auth.admin.getUserById(userId);

  const out: Record<string, unknown> = {
    exported_at: new Date().toISOString(),
    auth: {
      id: userId,
      email: authData?.user?.email ?? null,
      created_at: authData?.user?.created_at ?? null,
      last_sign_in_at: authData?.user?.last_sign_in_at ?? null,
    },
  };

  // Tablas relevantes — todas filtradas por user_id (o id para profiles)
  type Schema = 'app' | 'shop' | 'edu' | 'book';
  const queries: Array<{ key: string; schema: Schema; table: string; col: 'id' | 'user_id' }> = [
    { key: 'profiles', schema: 'app', table: 'profiles', col: 'id' },
    { key: 'orders', schema: 'shop', table: 'orders', col: 'user_id' },
    { key: 'enrollments', schema: 'edu', table: 'enrollments', col: 'user_id' },
    { key: 'lesson_progress', schema: 'edu', table: 'lesson_progress', col: 'user_id' },
    { key: 'certificates', schema: 'edu', table: 'certificates', col: 'user_id' },
    { key: 'reviews', schema: 'shop', table: 'reviews', col: 'user_id' },
    { key: 'reservations', schema: 'book', table: 'reservations', col: 'user_id' },
    { key: 'cart_items', schema: 'shop', table: 'cart_items', col: 'user_id' },
    { key: 'wallet_entries', schema: 'app', table: 'wallet_entries', col: 'user_id' },
    { key: 'gift_cards', schema: 'shop', table: 'gift_cards', col: 'user_id' },
    { key: 'threads', schema: 'edu', table: 'threads', col: 'user_id' },
    { key: 'thread_replies', schema: 'edu', table: 'thread_replies', col: 'user_id' },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminAny: any = admin;
  for (const q of queries) {
    try {
      const { data } = await adminAny.schema(q.schema).from(q.table)
        .select('*').eq(q.col, userId).limit(5000);
      out[q.key] = data ?? [];
    } catch {
      out[q.key] = [];
    }
  }

  // App schema
  const appTables = ['notifications', 'email_messages', 'consents', 'attribution_touches'];
  for (const t of appTables) {
    try {
      const { data } = await adminAny.schema('app').from(t).select('*').eq('user_id', userId).limit(5000);
      out[`app.${t}`] = data ?? [];
    } catch {
      out[`app.${t}`] = [];
    }
  }

  return out;
}

/**
 * Anonymización fallback en caso de no poder eliminar (referential integrity con orders pagadas).
 * Reemplaza email/nombre/teléfono por placeholders y limpia comments/posts.
 */
export async function anonymizeUser(userId: string): Promise<void> {
  const admin = createSupabaseAdminClient();
  const pseudo = `deleted-${userId.slice(0, 8)}@anon.local`;
  await admin.auth.admin.updateUserById(userId, {
    email: pseudo,
    user_metadata: { full_name: 'Usuario eliminado', anonymized: true },
  });
  await admin.schema('app').from('profiles').update({
    full_name: 'Usuario eliminado',
    phone: null,
    avatar_url: null,
  }).eq('id', userId);
  // Thread bodies — preservamos el thread pero anonymizamos
  await admin.schema('edu').from('thread_replies').update({ body: '[contenido eliminado por el autor]' }).eq('user_id', userId);
  await admin.schema('edu').from('threads').update({ body: '[contenido eliminado por el autor]' }).eq('user_id', userId);
}
