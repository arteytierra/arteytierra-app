import 'server-only';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { getCurrentUser } from '@/lib/auth/session';

/**
 * Q&A por curso. `edu.threads` (pregunta principal) + `edu.thread_replies`
 * (respuestas/comentarios). Soft-moderation con auto-hide al llegar a 3
 * reportes. Aceptar una respuesta otorga +10 reputation al autor.
 */

export interface ThreadRow {
  id: string;
  course_id: string;
  user_id: string | null;
  title: string;
  body: string | null;
  status: 'open' | 'answered' | 'resolved' | 'closed';
  is_pinned: boolean;
  is_resolved: boolean;
  accepted_reply_id: string | null;
  reply_count: number;
  reports_count: number;
  last_activity_at: string;
  hidden: boolean;
  tags: string[];
  created_at: string;
}

export interface ReplyRow {
  id: string;
  thread_id: string;
  user_id: string | null;
  body: string;
  is_accepted: boolean;
  reports_count: number;
  hidden: boolean;
  edited_at: string | null;
  created_at: string;
}

export interface ThreadWithAuthor extends ThreadRow {
  author: { id: string; full_name: string | null; avatar_url: string | null } | null;
}

export interface ReplyWithAuthor extends ReplyRow {
  author: { id: string; full_name: string | null; avatar_url: string | null; role?: string | null } | null;
}

export type ListFilter = 'all' | 'open' | 'mine' | 'unanswered';

/**
 * Verifica si el user actual está enrolled en el curso o es staff/instructor.
 * Devuelve { allowed, isStaff, isInstructor, user }.
 */
export async function checkCourseAccess(courseId: string) {
  const user = await getCurrentUser();
  if (!user) return { allowed: false, user: null, isStaff: false, isInstructor: false } as const;
  const isStaff = user.role === 'staff' || user.role === 'admin';
  const isInstructor = user.role === 'instructor';
  if (isStaff || isInstructor) return { allowed: true, user, isStaff, isInstructor } as const;
  const admin = createSupabaseAdminClient();
  const { data: enroll } = await admin
    .schema('edu').from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .maybeSingle();
  return { allowed: !!enroll, user, isStaff: false, isInstructor: false } as const;
}

type AuthorProfile = { id: string; full_name: string | null; avatar_url: string | null; role: string | null };

async function attachAuthors<T extends { user_id: string | null }>(rows: T[]): Promise<Array<T & { author: AuthorProfile | null }>> {
  const ids = Array.from(new Set(rows.map((r) => r.user_id).filter((x): x is string => !!x)));
  if (ids.length === 0) return rows.map((r) => ({ ...r, author: null }));
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .schema('app').from('profiles')
    .select('id, full_name, avatar_url, role')
    .in('id', ids);
  const map = new Map<string, AuthorProfile>();
  for (const p of (data ?? []) as AuthorProfile[]) map.set(p.id, p);
  return rows.map((r) => ({ ...r, author: r.user_id ? map.get(r.user_id) ?? null : null }));
}

export async function listThreads(opts: {
  courseId: string;
  filter?: ListFilter;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ rows: ThreadWithAuthor[]; total: number }> {
  const { courseId, filter = 'all', search, page = 1, pageSize = 20 } = opts;
  const admin = createSupabaseAdminClient();
  const user = await getCurrentUser();

  let q = admin
    .schema('edu').from('threads')
    .select('*', { count: 'exact' })
    .eq('course_id', courseId)
    .eq('hidden', false)
    .order('is_pinned', { ascending: false })
    .order('last_activity_at', { ascending: false });

  if (filter === 'open') q = q.eq('status', 'open');
  if (filter === 'unanswered') q = q.eq('reply_count', 0);
  if (filter === 'mine' && user) q = q.eq('user_id', user.id);

  if (search && search.trim()) {
    const term = search.trim().replace(/[%_]/g, '');
    q = q.or(`title.ilike.%${term}%,body.ilike.%${term}%`);
  }

  const from = (page - 1) * pageSize;
  q = q.range(from, from + pageSize - 1);

  const { data, count } = await q;
  const rows = await attachAuthors((data ?? []) as ThreadRow[]);
  return { rows, total: count ?? 0 };
}

export async function getThread(id: string): Promise<{ thread: ThreadWithAuthor; replies: ReplyWithAuthor[] } | null> {
  const admin = createSupabaseAdminClient();
  const { data: t } = await admin.schema('edu').from('threads').select('*').eq('id', id).maybeSingle();
  if (!t || (t as ThreadRow).hidden) return null;
  const [thread] = await attachAuthors([t as ThreadRow]);
  if (!thread) return null;
  const { data: replies } = await admin
    .schema('edu').from('thread_replies')
    .select('*')
    .eq('thread_id', id)
    .eq('hidden', false)
    .order('is_accepted', { ascending: false })
    .order('created_at', { ascending: true });
  const repliesWithAuthor = await attachAuthors((replies ?? []) as ReplyRow[]);
  return { thread, replies: repliesWithAuthor };
}

export async function listReportsAdmin(status: 'open' | 'dismissed' | 'actioned' = 'open') {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .schema('edu').from('thread_reports')
    .select('id, target, thread_id, reply_id, reporter_id, reason, status, created_at')
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(200);
  return data ?? [];
}

export async function getUserReputation(userId: string) {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .schema('app').from('user_reputation')
    .select('points, accepted')
    .eq('user_id', userId)
    .maybeSingle();
  return data ?? { points: 0, accepted: 0 };
}
