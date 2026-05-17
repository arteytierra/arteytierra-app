'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Wallet,
  ShoppingCart,
  Package,
  GraduationCap,
  CalendarRange,
  Users,
  FileText,
  Tag,
  Star,
  Share2,
  Flag,
  Award,
  HandCoins,
  Handshake,
  Gift,
  Wallet as WalletIcon,
  Video,
  Settings,
  Mail,
  BellRing,
  Target,
  ShieldCheck,
  FlaskConical,
  Shield,
  Activity,
  Webhook,
  HelpCircle,
  Database,
  Menu,
  X,
  Search,
} from 'lucide-react';
import { cn } from '@arteytierra/ui';
import { CommandPalette } from './CommandPalette';
import { logoutAction } from '@/lib/auth/actions';
import type { SessionUser } from '@/lib/auth/session';

const nav = [
  { label: 'Resumen',   href: '/admin',          icon: LayoutDashboard },
  { label: 'Finanzas',  href: '/admin/finanzas', icon: Wallet },
  { label: 'Ventas',    href: '/admin/ventas',   icon: ShoppingCart },
  { label: 'Productos', href: '/admin/productos',icon: Package },
  { label: 'Cursos',    href: '/admin/cursos',   icon: GraduationCap },
  { label: 'Aulas',     href: '/admin/aulas',    icon: Video },
  { label: 'Reservas',  href: '/admin/reservas', icon: CalendarRange },
  { label: 'Alumnos',   href: '/admin/crm',      icon: Users },
  { label: 'Blog',      href: '/admin/blog',     icon: FileText },
  { label: 'Cupones',   href: '/admin/cupones',  icon: Tag },
  { label: 'Reseñas',   href: '/admin/reviews',  icon: Star },
  { label: 'Reportes',  href: '/admin/reportes', icon: Flag },
  { label: 'Certificados', href: '/admin/certificados', icon: Award },
  { label: 'Becas',     href: '/admin/becas',    icon: HandCoins },
  { label: 'Partners',  href: '/admin/partners', icon: Handshake },
  { label: 'Referidos', href: '/admin/referidos',icon: Share2 },
  { label: 'Gift cards',href: '/admin/gift-cards',icon: Gift },
  { label: 'Wallets',   href: '/admin/wallets',  icon: WalletIcon },
  { label: 'Emails',    href: '/admin/emails',   icon: Mail },
  { label: 'Broadcast', href: '/admin/notificaciones', icon: BellRing },
  { label: 'Atribución', href: '/admin/atribucion', icon: Target },
  { label: 'Auditoría',  href: '/admin/auditoria',  icon: ShieldCheck },
  { label: 'Experimentos', href: '/admin/experimentos', icon: FlaskConical },
  { label: 'Privacidad', href: '/admin/privacidad', icon: Shield },
  { label: 'Observabilidad', href: '/admin/observabilidad', icon: Activity },
  { label: 'Webhooks',  href: '/admin/webhooks', icon: Webhook },
  { label: 'Snapshots', href: '/admin/snapshots', icon: Database },
  { label: 'Centro de ayuda', href: '/admin/ayuda', icon: HelpCircle },
  { label: 'Ajustes',   href: '/admin/ajustes',  icon: Settings },
];

export function AdminShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const [openMobile, setOpenMobile] = useState(false);
  const [palette, setPalette] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-bone-100 text-ink-950">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-60 flex-col border-r border-ink-950/10 bg-bone-50">
        <SidebarBrand />
        <SidebarNav pathname={pathname} />
        <SidebarUser user={user} />
      </aside>

      {/* Sidebar mobile */}
      {openMobile && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-ink-950/40" onClick={() => setOpenMobile(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-bone-50 flex flex-col animate-fade-up">
            <SidebarBrand onClose={() => setOpenMobile(false)} />
            <SidebarNav pathname={pathname} onNavigate={() => setOpenMobile(false)} />
            <SidebarUser user={user} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-ink-950/10 bg-bone-50/85 backdrop-blur px-4 lg:px-8 h-14">
          <button
            type="button"
            onClick={() => setOpenMobile(true)}
            aria-label="Menú"
            className="lg:hidden rounded-md p-2 hover:bg-bone-100"
          >
            <Menu size={18} />
          </button>

          <button
            onClick={() => setPalette(true)}
            className="ml-auto flex items-center gap-2 rounded-full border border-ink-950/15 px-3 py-1.5 text-sm text-ink-800/70 hover:bg-bone-100"
          >
            <Search size={14} /> Buscar
            <kbd className="ml-2 rounded bg-bone-100 px-1.5 py-0.5 text-[10px] text-ink-800/60">⌘K</kbd>
          </button>

          <form action={logoutAction}>
            <button type="submit" className="rounded-md px-3 py-1.5 text-sm hover:bg-bone-100">
              Salir
            </button>
          </form>
        </header>

        <main className="px-4 lg:px-8 py-8">{children}</main>
      </div>

      <CommandPalette open={palette} onClose={() => setPalette(false)} items={nav} />
    </div>
  );
}

function SidebarBrand({ onClose }: { onClose?: () => void }) {
  return (
    <div className="h-14 flex items-center justify-between px-5 border-b border-ink-950/10">
      <Link href="/admin" className="font-display text-lg">Arte y Tierra</Link>
      {onClose && (
        <button onClick={onClose} aria-label="Cerrar" className="rounded-md p-1.5 hover:bg-bone-100">
          <X size={16} />
        </button>
      )}
    </div>
  );
}

function SidebarNav({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 overflow-y-auto p-3">
      <ul className="flex flex-col gap-0.5">
        {nav.map((it) => {
          const Icon = it.icon;
          const active = it.href === '/admin' ? pathname === '/admin' : pathname.startsWith(it.href);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-ink-950 text-bone-50'
                    : 'text-ink-800 hover:bg-bone-100',
                )}
              >
                <Icon size={16} />
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function SidebarUser({ user }: { user: SessionUser }) {
  return (
    <div className="border-t border-ink-950/10 p-4">
      <p className="text-xs text-ink-800/60">Sesión iniciada</p>
      <p className="mt-1 text-sm font-medium truncate">{user.fullName ?? user.email}</p>
      <p className="text-xs text-ink-800/55 capitalize">{user.role}</p>
    </div>
  );
}
