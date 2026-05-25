'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/db/browser';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('Email o contraseña incorrectos.');
      setLoading(false);
      return;
    }

    router.push('/mapa');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1.5">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="w-full px-3 py-2.5 rounded-lg border border-bone-200 bg-white text-ink-950 placeholder:text-ink-700/40 focus:outline-none focus:ring-2 focus:ring-moss-500/40 focus:border-moss-500 transition-colors text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1.5">
          Contraseña
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-3 py-2.5 rounded-lg border border-bone-200 bg-white text-ink-950 placeholder:text-ink-700/40 focus:outline-none focus:ring-2 focus:ring-moss-500/40 focus:border-moss-500 transition-colors text-sm"
        />
      </div>

      {error && (
        <p className="text-sm text-danger-500 bg-danger-500/8 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 bg-moss-700 hover:bg-moss-900 text-bone-50 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {loading ? 'Ingresando…' : 'Ingresar'}
      </button>

      <p className="text-xs text-center text-ink-700/60">
        Usá las mismas credenciales de{' '}
        <a href="https://arteytierra.org" className="text-moss-700 hover:underline" target="_blank" rel="noreferrer">
          arteytierra.org
        </a>
      </p>
    </form>
  );
}
