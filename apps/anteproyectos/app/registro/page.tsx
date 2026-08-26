import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { RegistroForm } from '@/components/RegistroForm';

export const metadata = { title: 'Crear cuenta' };

export default async function RegistroPage() {
  const user = await getCurrentUser();
  if (user) redirect('/');

  return (
    <div className="min-h-screen flex items-center justify-center bg-bone-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="eyebrow mb-2">Anteproyectos · Arte y Tierra</p>
          <h1 className="font-display text-2xl text-ink-950">Empezá gratis</h1>
          <p className="text-sm text-ink-700/70 mt-2">
            Creá tu cuenta y guardá tu primer proyecto
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-bone-200 p-6 shadow-paper">
          <RegistroForm />
        </div>
      </div>
    </div>
  );
}
