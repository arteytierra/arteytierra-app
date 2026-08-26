'use client';

import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/db/browser';

export function BarraUsuario({ email }: { email: string }) {
  const router = useRouter();

  async function salir() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-3 border-b border-bone-200 bg-bone-50 px-4 py-1.5 text-xs text-ink-700">
      <span>{email}</span>
      <button onClick={salir} className="text-moss-700 hover:underline">
        Salir
      </button>
    </div>
  );
}
