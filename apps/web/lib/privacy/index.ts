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

  // Tablas relevantes — todas filtradas por user_id
  const tables: Array<[string, string?]> = [
    ['profiles'],
    ['orders'],
    ['enrollments'],
    ['lesson_progress'],
    ['certificates'],
    ['reviews'],
    ['reservations'],
    ['cart_items'],
    ['referrals'],
    ['wallet_entries'],
    ['gift_cards'],
    ['threads'],
    ['thread_replies'],
  ];

  const out: Record<string, unknown> = {
    exported_at: new Date().toISOString(),
    auth: {
      id: userId,
      email: authData?.user?.email ?? null,
      created_at: authData?.user?.created_at ?? null,
      last_sign_in_at: authData?.user?.last_sign_in_at ?? null,
    },
  };

  for (const [tbl] of tables) {
    try {
      const col = tbl === 'profiles' ? 'id' : 'user_id';
      const { data } = await admin.from(tbl).select('*').eq(col, userId).limit(5000);
      out[tbl] = data ?? [];
    } catch {
      out[tbl] = [];
    }
  }

  // App schema
  const appTables = ['notifications', 'email_messages', 'consents', 'attribution_touches'];
  for (const t of appTables) {
    try {
      const { data } = await admin.schema('app').from(t).select('*').eq('user_id', userId).limit(5000);
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
  await admin.from('profiles').update({
    full_name: 'Usuario eliminado',
    phone: null,
    bio: null,
    avatar_url: null,
  }).eq('id', userId);
  // Thread bodies — preservamos el thread pero anonymizamos
  await admin.from('thread_replies').update({ body: '[contenido eliminado por el autor]' }).eq('user_id', userId);
  await admin.from('threads').update({ body: '[contenido eliminado por el autor]' }).eq('user_id', userId);
}
