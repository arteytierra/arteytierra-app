import 'server-only';
import { redirect } from 'next/navigation';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { getCurrentUser } from '@/lib/auth/session';

export interface InstructorContext {
  userId: string;
  fullName: string | null;
  courseIds: string[];
  isStaff: boolean;
}

/**
 * Resuelve el contexto de instructor para el usuario actual.
 * Permite acceso si role = instructor/staff/admin O si tiene asignación
 * en `edu.course_instructors`.
 */
export async function requireInstructor(returnTo?: string): Promise<InstructorContext> {
  const user = await getCurrentUser();
  if (!user) redirect(`/auth/login${returnTo ? `?next=${encodeURIComponent(returnTo)}` : ''}`);

  const isStaff = user.role === 'admin' || user.role === 'staff' || user.role === 'instructor';
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from('course_instructors')
    .select('course_id')
    .eq('user_id', user.id);
  const courseIds = ((data ?? []) as Array<{ course_id: string }>).map((r) => r.course_id);

  if (!isStaff && courseIds.length === 0) redirect('/');

  return { userId: user.id, fullName: user.fullName ?? null, courseIds, isStaff };
}

export async function listInstructorCourses(ctx: InstructorContext) {
  const admin = createSupabaseAdminClient();
  let q = admin
    .from('courses')
    .select('id, product_id, products!inner(id, slug, name, base_price_cents, currency)')
    .order('created_at', { ascending: false });
  if (!ctx.isStaff) q = q.in('id', ctx.courseIds);
  const { data } = await q;
  return (data ?? []) as never as Array<{
    id: string;
    product_id: string;
    products: { id: string; slug: string; name: string; base_price_cents: number; currency: string };
  }>;
}

export async function getInstructorRevenue(ctx: InstructorContext) {
  const admin = createSupabaseAdminClient();
  let q = admin.schema('edu').from('instructor_revenue_summary').select('*');
  if (!ctx.isStaff) q = q.eq('instructor_id', ctx.userId);
  const { data } = await q;
  return (data ?? []) as Array<{
    instructor_id: string;
    course_id: string;
    course_name: string;
    revenue_share_pct: number;
    students: number;
    gross_cents: number;
    share_cents: number;
  }>;
}

export async function listInstructorQAQueue(ctx: InstructorContext, limit = 50) {
  const admin = createSupabaseAdminClient();
  let q = admin
    .from('threads')
    .select('id, course_id, title, body, status, reply_count, last_activity_at, user_id')
    .eq('status', 'open')
    .order('last_activity_at', { ascending: false })
    .limit(limit);
  if (!ctx.isStaff) q = q.in('course_id', ctx.courseIds);
  const { data } = await q;
  return (data ?? []) as never as Array<{
    id: string; course_id: string; title: string; body: string | null;
    status: string; reply_count: number; last_activity_at: string; user_id: string | null;
  }>;
}

export async function listInstructorStudents(ctx: InstructorContext) {
  const admin = createSupabaseAdminClient();
  let q = admin
    .from('enrollments')
    .select('id, user_id, course_id, progress, created_at, completed_at, profiles!inner(full_name)')
    .order('created_at', { ascending: false })
    .limit(500);
  if (!ctx.isStaff) q = q.in('course_id', ctx.courseIds);
  const { data } = await q;
  return (data ?? []) as never as Array<{
    id: string; user_id: string; course_id: string;
    progress: number; created_at: string; completed_at: string | null;
    profiles: { full_name: string | null };
  }>;
}
