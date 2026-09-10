'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/db/browser';

export function PasswordUpdateForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 8 || password !== confirmation) {
      setMessage(password.length < 8 ? 'Usá al menos 8 caracteres.' : 'Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    const { error } = await getSupabaseBrowserClient().auth.updateUser({ password });
    if (error) {
      setMessage('El enlace venció o no pudimos actualizar la contraseña. Solicitá uno nuevo.');
      setLoading(false);
      return;
    }
    router.push('/login?estado=password-actualizada');
    router.refresh();
  }

  return <form onSubmit={submit} className="space-y-4"><div><label className="mb-1.5 block text-sm font-medium text-ink-700">Nueva contraseña</label><input required minLength={8} type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-lg border border-bone-200 bg-white px-3 py-2.5 text-sm focus:border-moss-500 focus:outline-none focus:ring-2 focus:ring-moss-500/40" /></div><div><label className="mb-1.5 block text-sm font-medium text-ink-700">Repetir contraseña</label><input required minLength={8} type="password" autoComplete="new-password" value={confirmation} onChange={e => setConfirmation(e.target.value)} className="w-full rounded-lg border border-bone-200 bg-white px-3 py-2.5 text-sm focus:border-moss-500 focus:outline-none focus:ring-2 focus:ring-moss-500/40" /></div>{message && <p role="alert" className="rounded-lg bg-danger-500/8 px-3 py-2 text-sm text-danger-500">{message}</p>}<button type="submit" disabled={loading} className="w-full rounded-lg bg-moss-700 px-4 py-2.5 text-sm font-medium text-bone-50 disabled:opacity-50">{loading ? 'Guardando…' : 'Guardar contraseña'}</button></form>;
}
