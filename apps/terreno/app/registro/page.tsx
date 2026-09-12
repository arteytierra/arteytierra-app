import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { RegistroForm } from '@/components/RegistroForm';
import { rutaInterna } from '@/lib/rutaInterna';
import { leerEstadoPagos } from '@/lib/estadoPagos';

export const metadata = { title: 'Crear cuenta' };

export default async function RegistroPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const query = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(rutaInterna(query.next, '/bienvenida'));

  // El pie anunciaba la prueba comercial siempre, estuviera prendida o no. Lo
  // que hay o no hay lo dice la web, que es la que cobra.
  const pagos = await leerEstadoPagos();

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
          {pagos.prueba ? (
            <>
              La prueba comercial ofrece {pagos.diasPrueba} días de acceso completo a Personal o
              Profesional con un medio de pago autorizado. Si cancelás antes del primer cobro,
              continuás en Semilla con acceso limitado.
            </>
          ) : (
            <>
              Crear la cuenta es gratis. Empezás en Semilla, con un proyecto y sin ningún cobro
              asociado; los planes pagos se contratan después, desde tu cuenta.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
