import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@arteytierra/types/database';

/**
 * Cliente con service_role.
 * SÓLO usar en route handlers de webhooks, jobs y server actions admin.
 * Nunca exponer al cliente. Salta RLS.
 */
export function createSupabaseAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY no configurada');

  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
