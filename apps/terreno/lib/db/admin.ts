import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente service-role (bypassa RLS). Sólo en server (rutas /api, server actions).
 * Limpia BOM/comillas/espacios del env (en Vercel la URL puede venir con BOM).
 */
function limpiar(v: string | undefined): string {
  return (v ?? '').replace(/[﻿​]/g, '').replace(/^["']|["']$/g, '').trim();
}

let _client: SupabaseClient | null = null;

export function adminClient(): SupabaseClient {
  if (_client) return _client;
  const url = limpiar(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = limpiar(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!url || !key) throw new Error('Falta configuración de service-role.');
  _client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return _client;
}
