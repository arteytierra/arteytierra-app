'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/db/browser';

export function RegistroForm() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAviso(null);

    if (password.length < 8) {
      setError('La contraseña necesita al menos 8 caracteres.');
      return;
    }

    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/mapa`,
        data: { full_name: nombre.trim() || null },
      },
    });

    if (error) {
      setError(error.message === 'User already registered'
        ? 'Ese email ya tiene cuenta. Probá ingresar.'
        : 'No pudimos crear la cuenta. Revisá los datos e intentá de nuevo.');
      setLoading(false);
      return;
    }

    // Email ya registrado: Supabase devuelve un usuario "fantasma" sin identidades
    // (no filtra que el email existe). Lo tratamos como "ya tenés cuenta".
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError('Ese email ya tiene cuenta. Probá ingresar.');
      setLoading(false);
      return;
    }

    // Con confirmación de email activada no hay sesión todavía: avisamos que revise el correo.
    if (!data.session) {
      setAviso('Te enviamos un email para confirmar tu cuenta. Revisá tu bandeja (y el spam).');
      setLoading(false);
      return;
    }

    // Confirmación desactivada: ya está logueado, al mapa.
    router.push('/mapa');
    router.refresh();
  }

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/mapa` },
    });
  }

  if (aviso) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-moss-50 border border-moss-200 flex items-center justify-center">
          <svg className="w-6 h-6 text-moss-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16v16H4z" /><path d="m22 6-10 7L2 6" />
          </svg>
        </div>
        <p className="text-sm text-ink-700/80 leading-relaxed">{aviso}</p>
        <a href="/login" className="inline-block text-sm text-moss-700 hover:underline">Ir a ingresar</a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading || loading}
        className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white hover:bg-bone-50 text-ink-950 font-medium rounded-lg border border-bone-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        {googleLoading ? 'Redirigiendo…' : 'Crear cuenta con Google'}
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-bone-200" />
        <span className="text-xs text-ink-700/50">o</span>
        <div className="flex-1 h-px bg-bone-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">
            Nombre
          </label>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Cómo te llamás"
            className="w-full px-3 py-2.5 rounded-lg border border-bone-200 bg-white text-ink-950 placeholder:text-ink-700/40 focus:outline-none focus:ring-2 focus:ring-moss-500/40 focus:border-moss-500 transition-colors text-sm"
          />
        </div>

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
            placeholder="Mínimo 8 caracteres"
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
          disabled={loading || googleLoading}
          className="w-full py-2.5 px-4 bg-moss-700 hover:bg-moss-900 text-bone-50 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {loading ? 'Creando cuenta…' : 'Crear cuenta gratis'}
        </button>
      </form>

      <p className="text-xs text-center text-ink-700/60">
        ¿Ya tenés cuenta?{' '}
        <a href="/login" className="text-moss-700 hover:underline">Ingresá</a>
      </p>
    </div>
  );
}
