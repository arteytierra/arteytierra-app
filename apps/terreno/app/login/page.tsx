import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { LoginForm } from '@/components/LoginForm';
import { rutaInterna } from '@/lib/rutaInterna';

export const metadata = { title: 'Ingresar' };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ estado?: string; next?: string }> }) {
  const query = await searchParams;
  const nextPath = rutaInterna(query.next, '/mapa');
  const user = await getCurrentUser();
  if (user) redirect(nextPath);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bone-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo / header */}
        <div className="text-center mb-8">
          {/* Lockup en PNG a propósito: el SVG del wordmark depende de Century
              Gothic, que no está en la máquina del usuario. Ver public/marca/LEEME.md. */}
          <img src="/marca/logo-color.png" alt="acequia" width={1200} height={395} style={{ width: 'auto' }} className="h-10 mx-auto" />
          <p className="eyebrow mt-3">Arte y Tierra</p>
          <p className="text-sm text-ink-700/70 mt-2">
            Ingresá para acceder a la herramienta
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-bone-200 p-6 shadow-paper">
          <LoginForm initialState={query.estado} nextPath={nextPath} />
        </div>

        {/* El botón de arrepentimiento va acá porque ésta es la primera
            pantalla de acequia para quien no tiene sesión, y la Resolución
            424/2020 lo pide visible en la primera pantalla, no escondido
            adentro de los Términos. */}
        <p className="mt-6 text-center text-xs text-ink-700/60">
          <a href="/arrepentimiento" className="underline hover:text-moss-700">
            Botón de arrepentimiento
          </a>{' '}
          ·{' '}
          <a href="/terminos" className="underline hover:text-moss-700">
            Términos
          </a>{' '}
          ·{' '}
          <a href="/privacidad" className="underline hover:text-moss-700">
            Privacidad
          </a>
        </p>
      </div>
    </div>
  );
}
