import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/db/server';

export interface SessionUser {
  id: string;
  email: string;
  fullName?: string | null;
}

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .schema('app').from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single<{ full_name: string | null }>();

  return {
    id: user.id,
    email: user.email ?? '',
    fullName: profile?.full_name ?? null,
  };
});

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}
