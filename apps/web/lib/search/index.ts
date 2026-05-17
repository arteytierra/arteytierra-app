import 'server-only';
import { createSupabaseServerClient } from '@/lib/db/server';
import { createSupabaseAdminClient } from '@/lib/db/admin';

/**
 * Búsqueda global federada usando la RPC `app.global_search`.
 * Combina: productos activos, posts publicados, y threads Q&A
 * (estos últimos solo dentro de cursos donde el user tiene enrollment).
 *
 * Ordena por ts_rank dentro de cada bucket, luego intercala para diversidad.
 */

export type SearchKind = 'product' | 'course' | 'post' | 'thread';

export type SearchHit = {
  kind: SearchKind;
  id: string;
  title: string;
  subtitle?: string | null;
  href: string;
  thumb?: string | null;
  badge?: string | null;
  rank?: number;
};

const MAX = 12;

function normalize(q: string) {
  return q.trim().slice(0, 80);
}

export async function globalSearch(rawQ: string, limit = MAX): Promise<SearchHit[]> {
  const q = normalize(rawQ);
  if (q.length < 2) return [];

  // Resolver user para filtrar Q&A privadas
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // RPC con security definer hace el filtrado por enrollments en SQL.
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.schema('app').rpc('global_search', {
    p_query: q,
    p_limit: limit,
    p_user: user?.id ?? null,
  });

  if (error) {
    console.error('[search] rpc failed', error);
    return [];
  }
  const rows = (data ?? []) as Array<Omit<SearchHit, 'kind'> & { kind: string }>;

  // Agrupar por kind para intercalar
  const byKind: Record<SearchKind, SearchHit[]> = {
    course: [],
    product: [],
    post: [],
    thread: [],
  };
  for (const r of rows) {
    const k = (r.kind as SearchKind) ?? 'product';
    if (k in byKind) byKind[k].push({ ...r, kind: k });
  }

  // Round-robin: courses → products → posts → threads para diversidad visual
  const order: SearchKind[] = ['course', 'product', 'post', 'thread'];
  const out: SearchHit[] = [];
  let idx = 0;
  while (out.length < limit) {
    let added = false;
    for (const k of order) {
      const item = byKind[k][idx];
      if (item) {
        out.push(item);
        added = true;
        if (out.length >= limit) break;
      }
    }
    if (!added) break;
    idx++;
  }
  return out;
}

/** Devuelve resultados agrupados por kind, útil para UI tipo Spotlight. */
export async function groupedSearch(rawQ: string, limit = MAX) {
  const hits = await globalSearch(rawQ, limit);
  const groups: Record<SearchKind, SearchHit[]> = {
    course: [],
    product: [],
    post: [],
    thread: [],
  };
  for (const h of hits) groups[h.kind].push(h);
  return groups;
}
