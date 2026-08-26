import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { RegistroForm } from '@/components/RegistroForm';

export const metadata = { title: 'Crear cuenta' };

export default async function RegistroPage() {
  const user = await getCurrentUser();
  if (user) redirect('/mapa');

  return (
    <div className="min-h-screen flex items-center justify-center bg-bone-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo / header */}
        <div className="text-center mb-8">
          <p className="eyebrow mb-2">acequia · Arte y Tierra</p>
          <h1 className="font-display text-2xl text-ink-950">Empezá gratis</h1>
          <p className="text-sm text-ink-700/70 mt-2">
            Creá tu cuenta y marcá tu primer terreno
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-bone-200 p-6 shadow-paper">
          <RegistroForm />
        </div>

        <p className="text-[11px] text-center text-ink-700/50 mt-4 leading-relaxed">
          El plan Semilla es gratis: dibujá y medí tu terreno.<br />
          El análisis y el diseño se desbloquean con los planes pagos.
        </p>
      </div>
    </div>
  );
}
