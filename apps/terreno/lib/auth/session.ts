import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/db/server';
import { rutaInterna } from '@/lib/rutaInterna';

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

/**
 * Exige sesión. Si no hay, manda a /login y vuelve acá después de entrar.
 *
 * `volverA` ya lo pasaban dos páginas, pero la función no lo recibía: TypeScript
 * lo denunciaba y el argumento se descartaba, así que quien entraba desde
 * /cuenta terminaba en el mapa sin explicación. El destino se valida igual que
 * cualquier otro `next=`, aunque acá lo escriba nuestro propio código: si mañana
 * alguien lo arma con datos de la URL, no se convierte en una puerta de salida.
 */
export async function requireUser(volverA?: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    const destino = volverA ? rutaInterna(volverA) : null;
    redirect(destino ? `/login?next=${encodeURIComponent(destino)}` : '/login');
  }
  return user;
}
