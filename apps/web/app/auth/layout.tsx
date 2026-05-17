import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Lado editorial */}
      <aside className="hidden lg:flex flex-col justify-between bg-ink-950 text-bone-50 p-12 relative overflow-hidden">
        <Link href="/" className="font-display text-2xl">
          Arte y Tierra
        </Link>

        <div className="relative z-10 max-w-md">
          <p className="eyebrow text-bone-100/70">Escuela viva</p>
          <p className="font-display text-4xl leading-tight mt-4">
            Sembrar conocimiento, regenerar territorio.
          </p>
          <p className="mt-6 text-bone-100/70">
            Tu cuenta te da acceso a cursos, descargas, reservas y comunidad.
          </p>
        </div>

        <p className="text-xs text-bone-100/40">
          © {new Date().getFullYear()} Tay Pichín
        </p>

        <div className="absolute inset-0 grain opacity-40 pointer-events-none" />
      </aside>

      {/* Formulario */}
      <main className="flex flex-col items-center justify-center px-6 py-12 bg-bone-50">
        <div className="w-full max-w-md">
          <Link href="/" className="font-display text-xl lg:hidden mb-10 inline-block">
            Arte y Tierra
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}
