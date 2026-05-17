import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Divider, Eyebrow } from '@arteytierra/ui';
import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { SignupForm } from './SignupForm';
import { getCurrentUser } from '@/lib/auth/session';

export const metadata = { title: 'Crear cuenta' };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  const { next = '/mi-cuenta' } = await searchParams;
  if (user) redirect(next);

  return (
    <div>
      <Eyebrow>Sumate</Eyebrow>
      <h1 className="display-3 mt-4">Crear cuenta</h1>
      <p className="lead mt-4 text-base">
        Acceso a cursos, descargas, comunidad y reservas.
      </p>

      <div className="mt-8">
        <OAuthButtons next={next} />
      </div>

      <Divider label="o con tu correo" className="my-8" />

      <SignupForm next={next} />

      <p className="mt-8 text-sm text-ink-800/70">
        ¿Ya tenés cuenta?{' '}
        <Link href={`/auth/login?next=${encodeURIComponent(next)}`} className="text-moss-700 underline-offset-4 hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </div>
  );
}
