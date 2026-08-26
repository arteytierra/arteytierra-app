import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Vercel a veces inyecta BOM (U+FEFF), zero-width space (U+200B), comillas o
// espacios en los valores de entorno. `new URL()` (dentro de createServerClient)
// y undici (el fetch de auth.getUser) pueden abortar con esos caracteres. Se
// limpia igual que en lib/db/cache.ts y lib/auth/plan.ts.
function limpiarEnv(v: string | undefined): string {
  return (v ?? '').replace(/[﻿​]/g, '').replace(/^["']|["']$/g, '').trim();
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    limpiarEnv(process.env.NEXT_PUBLIC_SUPABASE_URL),
    limpiarEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // RSC read-only context — el middleware refresca el token
          }
        },
      },
    },
  );
}
