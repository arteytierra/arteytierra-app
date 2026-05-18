import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/db/server';

export type UserRole = 'customer' | 'instructor' | 'staff' | 'admin';

export interface SessionUser {
  id: string;
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  role: UserRole;
}

/**
 * Devuelve el usuario actual o null. Cacheado por request.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .schema('app').from('profiles')
    .select('full_name, avatar_url, role')
    .eq('id', user.id)
    .single<{ full_name: string | null; avatar_url: string | null; role: UserRole }>();

  return {
    id: user.id,
    email: user.email ?? '',
    fullName: profile?.full_name ?? null,
    avatarUrl: profile?.avatar_url ?? null,
    role: profile?.role ?? 'customer',
  };
});

/** Redirige a /auth/login si no hay sesión. */
export async function requireUser(returnTo?: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    const next = returnTo ? `?next=${encodeURIComponent(returnTo)}` : '';
    redirect(`/auth/login${next}`);
  }
  return user;
}

/** Requiere rol staff o admin. */
export async function requireStaff(returnTo?: string): Promise<SessionUser> {
  const user = await requireUser(returnTo);
  if (user.role !== 'staff' && user.role !== 'admin') redirect('/');
  return user;
}

/** Requiere rol admin estricto. */
export async function requireAdmin(returnTo?: string): Promise<SessionUser> {
  const user = await requireUser(returnTo);
  if (user.role !== 'admin') redirect('/');
  return user;
}
