import Link from 'next/link';
import { ACEQUIA_PLANS } from '@arteytierra/config/acequia';
import { requireUser } from '@/lib/auth/session';
import { getPlan, leerSuscripcionActual } from '@/lib/auth/plan';
import SuscripcionPanel from '@/components/SuscripcionPanel';

export const metadata = { title: 'Mi cuenta' };

const acequiaSiteUrl = process.env.NEXT_PUBLIC_ACEQUIA_SITE_URL ?? 'https://acequia.app';

export default async function AccountPage() {
  const user = await requireUser('/cuenta');
  const plan = await getPlan(user.id);
  const planName = ACEQUIA_PLANS[plan].name;
  const suscripcion = await leerSuscripcionActual(user.id);
  const tieneSuscripcion = suscripcion !== null && suscripcion.estado !== 'cancelada';

  return (
    <main className="bg-bone-50 min-h-screen px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <header className="mb-9 flex flex-wrap items-center justify-between gap-4">
          <Link href="/mapa">
            <img
              src="/marca/logo-color.png"
              alt="acequia"
              width={1200}
              height={395}
              className="h-9 w-auto"
            />
          </Link>
          <Link href="/mapa" className="text-moss-700 text-sm hover:underline">
            Volver al mapa
          </Link>
        </header>
        <div className="mb-8">
          <p className="eyebrow">Cuenta</p>
          <h1 className="font-display text-ink-950 mt-2 text-4xl">
            Tu plan, tus datos y tus decisiones.
          </h1>
          <p className="text-ink-700/70 mt-3 text-sm">
            La información comercial real aparecerá aquí cuando esté confirmada por Supabase y el
            proveedor de pago.
          </p>
        </div>
        <section className="grid gap-4 md:grid-cols-3">
          <article className="border-bone-200 rounded-2xl border bg-white p-6">
            <span className="text-ink-700/50 text-xs uppercase tracking-wider">Plan actual</span>
            <h2 className="font-display text-ink-950 mt-5 text-3xl">{planName}</h2>
            <p className="text-ink-700/65 mt-2 text-sm">
              Acceso efectivo calculado en el servidor.
            </p>
          </article>
          <article className="border-bone-200 rounded-2xl border bg-white p-6">
            <span className="text-ink-700/50 text-xs uppercase tracking-wider">Cuenta</span>
            <h2 className="text-ink-950 mt-5 break-words text-base font-semibold">{user.email}</h2>
            <p className="text-ink-700/65 mt-2 text-sm">Sesión protegida con Supabase Auth.</p>
          </article>
          <article className="border-bone-200 rounded-2xl border bg-white p-6">
            <span className="text-ink-700/50 text-xs uppercase tracking-wider">Cobro</span>
            <h2 className="font-display text-ink-950 mt-5 text-3xl">
              {tieneSuscripcion
                ? suscripcion!.estado === 'prueba' ? 'En prueba' : 'Al día'
                : 'Sin cargo'}
            </h2>
            <p className="text-ink-700/65 mt-2 text-sm">
              {tieneSuscripcion
                ? 'El detalle y la baja están más abajo.'
                : 'El plan Semilla no tiene ningún cobro asociado.'}
            </p>
          </article>
        </section>
        {!user.fullName && (
          <aside className="border-sun-300 bg-sun-50 text-ink-700/75 mt-5 flex flex-col gap-3 rounded-xl border p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span><strong className="text-ink-950">Falta completar tu nombre.</strong> La cuenta funciona, pero la bienvenida y los mensajes no pueden personalizarse todavía.</span>
            <Link href="/cuenta/completar" className="text-moss-700 shrink-0 font-semibold hover:underline">Completar cuenta</Link>
          </aside>
        )}
        {suscripcion ? (
          <SuscripcionPanel suscripcion={suscripcion} />
        ) : (
          <section className="border-bone-200 mt-5 rounded-2xl border bg-white p-6 md:p-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <p className="eyebrow">Suscripción</p>
                <h2 className="font-display text-ink-950 mt-3 text-2xl">
                  Estás en Semilla, sin ningún cobro
                </h2>
                <p className="text-ink-700/70 mt-3 text-sm leading-relaxed">
                  Semilla incluye un proyecto. Los planes pagos amplían el límite y las
                  herramientas, y se dan de baja desde acá mismo, en un clic.
                </p>
              </div>
              <div className="flex flex-col justify-center gap-3">
                <a
                  href={`${acequiaSiteUrl}/planes`}
                  className="bg-moss-700 hover:bg-moss-900 rounded-lg px-5 py-3 text-center text-sm font-semibold text-white"
                >
                  Ver planes
                </a>
                <Link href="/guia" className="text-moss-700 text-center text-sm hover:underline">
                  Guía de uso y fuentes
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
