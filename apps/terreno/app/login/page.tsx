import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { LoginForm } from '@/components/LoginForm';

export const metadata = { title: 'Ingresar' };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect('/mapa');

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
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
