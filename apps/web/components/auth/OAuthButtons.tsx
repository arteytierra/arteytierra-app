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
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={loading !== null}
        onClick={() => signInWith('google')}
        className="inline-flex items-center justify-center gap-3 rounded-full border border-ink-950/15 bg-bone-50 px-6 py-3 text-sm font-medium hover:bg-bone-100 transition-colors disabled:opacity-50"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
          <path fill="#EA4335" d="M12 11v3.2h5.4c-.2 1.4-1.6 4.1-5.4 4.1-3.3 0-5.9-2.7-5.9-6s2.6-6 5.9-6c1.9 0 3.1.8 3.8 1.4l2.6-2.5C16.8 3.6 14.6 2.7 12 2.7 6.9 2.7 2.8 6.8 2.8 12s4.1 9.3 9.2 9.3c5.3 0 8.8-3.7 8.8-9 0-.6-.1-1-.1-1.5H12z" />
        </svg>
        {loading === 'google' ? 'Conectando…' : 'Continuar con Google'}
      </button>
    </div>
  );
}
