import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { RegistroForm } from '@/components/RegistroForm';
import { safeInternalPath } from '@/lib/navigation';

export const metadata = { title: 'Crear cuenta' };

export default async function RegistroPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const query = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(safeInternalPath(query.next, '/bienvenida'));

  return (
    <div className="min-h-screen flex items-center justify-center bg-bone-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo / header */}
        <div className="text-center mb-8">
          <img src="/marca/logo-color.png" alt="acequia" width={1200} height={395} style={{ width: 'auto' }} className="h-10 mx-auto" />
          <p className="eyebrow mt-3 mb-3">Arte y Tierra</p>
          <h1 className="font-display text-2xl text-ink-950">Creá tu cuenta</h1>
          <p className="text-sm text-ink-700/70 mt-2">
            Ingresá para continuar con Acequia
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-bone-200 p-6 shadow-paper">
          <RegistroForm />
        </div>

        <p className="text-[11px] text-center text-ink-700/50 mt-4 leading-relaxed">
          La prueba comercial ofrece 3 días de acceso completo a Personal o Profesional
          con un medio de pago autorizado. Si cancelás antes del primer cobro, continuás
          en Semilla con acceso limitado.
        </p>
      </div>
    </div>
  );
}
