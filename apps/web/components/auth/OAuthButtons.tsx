'use client';

import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/db/browser';

export function OAuthButtons({ next = '/mi-cuenta' }: { next?: string }) {
  const [loading, setLoading] = useState<string | null>(null);

  async function signInWith(provider: 'google') {
    const supabase = getSupabaseBrowserClient();
    setLoading(provider);
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        disabled={loading !== null}
        onClick={() => signInWith('google')}
        className="inline-flex items-center justify-center gap-3 w-full rounded-lg border-2 border-ink-950/20 bg-white px-6 py-4 text-base font-semibold text-ink-950 hover:bg-bone-100 hover:border-ink-950/40 transition-colors disabled:opacity-50 shadow-sm"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
          <path fill="#4285F4" d="M23.7 12.3c0-.9-.1-1.5-.2-2.2H12v4h6.6c-.3 1.5-1.1 2.8-2.4 3.7v3h3.9c2.3-2.1 3.6-5.2 3.6-8.5z"/>
          <path fill="#34A853" d="M12 24c3.3 0 6-1.1 8.1-2.9l-3.9-3c-1.1.7-2.5 1.2-4.2 1.2-3.2 0-6-2.2-6.9-5.1H1.1v3.1C3.2 21.3 7.3 24 12 24z"/>
          <path fill="#FBBC04" d="M5.1 14.2c-.3-.7-.4-1.4-.4-2.2s.1-1.5.4-2.2V6.7H1.1C.4 8.1 0 9.9 0 12s.4 3.9 1.1 5.3l4-3.1z"/>
          <path fill="#EA4335" d="M12 4.8c1.8 0 3.4.6 4.7 1.8l3.5-3.5C18 1.1 15.3 0 12 0 7.3 0 3.2 2.7 1.1 6.7l4 3.1C6 7 8.8 4.8 12 4.8z"/>
        </svg>
        {loading === 'google' ? 'Conectando…' : 'Continuar con Google'}
      </button>
      <p className="text-center text-xs text-ink-800/50">
        Sin contraseña · Acceso instantáneo
      </p>
    </div>
  );
}
