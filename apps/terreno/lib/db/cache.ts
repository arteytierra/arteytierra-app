/**
 * Caché persistente de respuestas de APIs externas, respaldada en
 * `terreno.cache_api` (Supabase). Se usa SÓLO server-side, dentro de las
 * rutas /api/*, con el cliente service-role (bypassa RLS).
 *
 * Diseño best-effort: si falta la config o falla la DB, las funciones
 * degradan silenciosamente (get → null, set → no-op) para nunca romper
 * la ruta; en el peor caso se consulta la fuente externa de nuevo.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;
let _init = false;

// Limpia BOM (U+FEFF), zero-width space (U+200B), comillas y espacios de los
// valores de entorno: en Vercel `NEXT_PUBLIC_SUPABASE_URL` puede venir con un
// BOM al inicio, y undici (fetch de Node) no puede convertir una URL con BOM a
// ByteString → aborta con TypeError y el caché nunca escribe/lee.
function limpiarEnv(v: string | undefined): string {
  return (v ?? '').replace(/[﻿​]/g, '').replace(/^["']|["']$/g, '').trim();
}

function svc(): SupabaseClient | null {
  if (_init) return _client;
  _init = true;
  const url = limpiarEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = limpiarEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!url || !key) { _client = null; return null; }
  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

function tabla() {
  const c = svc();
  if (!c) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (c as any).schema('terreno').from('cache_api');
}

/** Devuelve el payload cacheado y vigente, o null si no hay / venció / falla. */
export async function cacheGet<T = unknown>(clave: string): Promise<T | null> {
  const t = tabla();
  if (!t) return null;
  try {
    const { data, error } = await t
      .select('payload, expira_en')
      .eq('clave', clave)
      .maybeSingle();
    if (error || !data) return null;
    if (new Date(data.expira_en as string).getTime() < Date.now()) return null;
    return data.payload as T;
  } catch {
    return null;
  }
}

/**
 * Clave corta y estable a partir de una entrada larga (p.ej. muchas
 * coordenadas), vía SHA-256 truncado a 96 bits — sin riesgo práctico de
 * colisión. Evita exceder el tamaño máximo del índice btree de la PK.
 */
export async function claveHash(prefijo: string, entrada: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(entrada));
  const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${prefijo}:${hex.slice(0, 24)}`;
}

/** Guarda (upsert) un payload con vencimiento `ttlSeg` segundos. Best-effort. */
export async function cacheSet(clave: string, payload: unknown, ttlSeg: number): Promise<void> {
  const t = tabla();
  if (!t) return;
  try {
    const expira_en = new Date(Date.now() + ttlSeg * 1000).toISOString();
    await t.upsert({ clave, payload, expira_en }, { onConflict: 'clave' });
  } catch {
    /* best-effort: no interrumpir la ruta */
  }
}
