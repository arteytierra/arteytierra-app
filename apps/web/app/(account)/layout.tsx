import Link from 'next/link';
import { Container } from '@arteytierra/ui';
import { requireUser } from '@/lib/auth/session';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { AccountNav } from '@/components/account/AccountNav';
import { logoutAction } from '@/lib/auth/actions';

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <>
      <SiteHeader />
      <Container className="py-12 md:py-20">
        <header className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div>
            <p className="eyebrow">Tu cuenta</p>
            <h1 className="display-3 mt-3">Hola, {user.fullName?.split(' ')[0] ?? 'comunidad'}.</h1>
            <p className="mt-3 text-ink-800/70">{user.email}</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-full border border-ink-950/15 px-5 py-2.5 text-sm hover:bg-bone-100"
            >
              Cerrar sesión
            </button>
          </form>
        </header>

        <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
          <AccountNav role={user.role} />
          <div>{children}</div>
        </div>
      </Container>
      <SiteFooter />
    </>
  );
}
