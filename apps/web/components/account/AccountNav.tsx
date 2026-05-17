'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@arteytierra/ui';
import type { UserRole } from '@/lib/auth/session';

const items = [
  { label: 'Resumen',     href: '/mi-cuenta' },
  { label: 'Mis cursos',  href: '/mis-cursos' },
  { label: 'Mis pedidos', href: '/mis-pedidos' },
  { label: 'Reservas',    href: '/mis-reservas' },
  { label: 'Descargas',   href: '/mis-descargas' },
  { label: 'Certificados',href: '/certificados' },
  { label: 'Referidos',   href: '/mis-referidos' },
  { label: 'Mi saldo',    href: '/mi-saldo' },
];

export function AccountNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto">
      {items.map((it) => {
        const active = pathname === it.href || pathname.startsWith(it.href + '/');
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              'rounded-lg px-4 py-2.5 text-sm whitespace-nowrap transition-colors',
              active
                ? 'bg-ink-950 text-bone-50'
                : 'text-ink-800/80 hover:bg-bone-100',
            )}
          >
            {it.label}
          </Link>
        );
      })}
      {(role === 'staff' || role === 'admin') && (
        <Link
          href="/admin"
          className="mt-3 rounded-lg border border-moss-700/30 px-4 py-2.5 text-sm text-moss-700 hover:bg-moss-100 whitespace-nowrap"
        >
          ← Ir al panel admin
        </Link>
      )}
    </nav>
  );
}
