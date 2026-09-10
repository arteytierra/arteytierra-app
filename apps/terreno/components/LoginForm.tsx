'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/db/browser';
import { rutaInterna } from '@/lib/rutaInterna';

const stateMessages: Record<string, { text: string; positive?: boolean }> = {
  'sesion-vencida': { text: 'Tu sesión terminó por seguridad. Volvé a ingresar para continuar.' },
  'enlace-vencido': { text: 'El enlace venció o ya fue utilizado. Solicitá uno nuevo si necesitás recuperar el acceso.' },
  'enlace-invalido': { text: 'El enlace no es válido. Ingresá nuevamente desde esta pantalla.' },
  'password-actualizada': { text: 'La contraseña se actualizó. Ya podés ingresar con la nueva clave.', positive: true },
  'cuenta-incompleta': { text: 'Ingresá para completar los datos que faltan en tu cuenta.' },
};

/** Destino post-login: `?next=` si es ruta interna segura, si no el mapa. */
function destinoNext(): string {
  if (typeof window === 'undefined') return '/mapa';
  const n = new URLSearchParams(window.location.search).get('next');
  return rutaInterna(n, '/mapa');
}

export function LoginForm({ initialState, nextPath = '/mapa' }: { initialState?: string; nextPath?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [registroHref, setRegistroHref] = useState('/registro');
  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const initialMessage = initialState ? stateMessages[initialState] : undefined;

  useEffect(() => {
    const n = new URLSearchParams(window.location.search).get('next');
    const safe = rutaInterna(n, nextPath);
    setRegistroHref(`/registro?next=${encodeURIComponent(safe)}`);
  }, [nextPath]);

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

    router.push(rutaInterna(destinoNext(), nextPath));
    router.refresh();
  }

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(rutaInterna(destinoNext(), nextPath))}` },
    });
    if (error) {
      setError('No pudimos abrir el acceso con Google. Probá nuevamente.');
      setGoogleLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await getSupabaseBrowserClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/auth/nueva-password')}`,
    });
    setLoading(false);
    if (error?.message.toLowerCase().includes('rate')) {
      setError('Esperá unos minutos antes de solicitar otro correo.');
      return;
    }
    setError('Si existe una cuenta con ese correo, vas a recibir un enlace seguro para cambiar la contraseña.');
  }

  if (mode === 'reset') {
    return <form onSubmit={handleReset} className="space-y-4"><div><h2 className="font-display text-2xl text-ink-950">Recuperar acceso</h2><p className="mt-2 text-sm leading-relaxed text-ink-700/65">Te enviaremos un enlace seguro al correo de tu cuenta.</p></div><div><label className="mb-1.5 block text-sm font-medium text-ink-700">Email</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" className="w-full rounded-lg border border-bone-200 bg-white px-3 py-2.5 text-sm text-ink-950 focus:border-moss-500 focus:outline-none focus:ring-2 focus:ring-moss-500/40" /></div>{error && <p role="status" className="rounded-lg bg-water-50 px-3 py-2 text-sm text-water-900">{error}</p>}<button type="submit" disabled={loading} className="w-full rounded-lg bg-moss-700 px-4 py-2.5 text-sm font-medium text-bone-50 disabled:opacity-50">{loading ? 'Enviando…' : 'Enviar enlace'}</button><button type="button" onClick={() => { setMode('login'); setError(null); }} className="w-full text-center text-sm text-moss-700 hover:underline">Volver a ingresar</button></form>;
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
        {googleLoading ? 'Redirigiendo…' : 'Continuar con Google'}
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-bone-200" />
        <span className="text-xs text-ink-700/50">o</span>
        <div className="flex-1 h-px bg-bone-200" />
      </div>

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

        {(error || initialMessage) && (
          <p role="status" className={`px-3 py-2 text-sm rounded-lg ${!error && initialMessage?.positive ? 'bg-moss-50 text-moss-900' : 'text-danger-500 bg-danger-500/8'}`}>
            {error || initialMessage?.text}
          </p>
        )}

        <button type="button" onClick={() => { setMode('reset'); setError(null); }} className="text-xs font-medium text-moss-700 hover:underline">Olvidé mi contraseña</button>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full py-2.5 px-4 bg-moss-700 hover:bg-moss-900 text-bone-50 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>

      <p className="text-xs text-center text-ink-700/60">
        ¿No tenés cuenta?{' '}
        <a href={registroHref} className="text-moss-700 hover:underline">Creá una gratis</a>
      </p>
    </div>
  );
}
