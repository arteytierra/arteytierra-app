import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Divider, Eyebrow } from '@arteytierra/ui';
import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { LoginForm } from './LoginForm';
import { getCurrentUser } from '@/lib/auth/session';

export const metadata = { title: 'Ingresar' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; message?: string }>;
}) {
  const user = await getCurrentUser();
  const { next = '/mi-cuenta', message } = await searchParams;
  if (user) redirect(next);

  return (
    <div>
      <Eyebrow>Tu cuenta</Eyebrow>
      <h1 className="display-3 mt-4">Ingresar o crear cuenta</h1>
      <p className="lead mt-4 text-base">
        Accedé a tus cursos, descargas y reservas. Si es la primera vez, se crea tu cuenta automáticamente.
      </p>

      {message && (
        <div className="mt-6 rounded-lg bg-moss-100 text-moss-900 px-4 py-3 text-sm">{message}</div>
      )}

      <div className="mt-8">
        <OAuthButtons next={next} />
      </div>

      <Divider label="o con email y contraseña" className="my-8" />

      <LoginForm next={next} />

      <p className="mt-8 text-sm text-ink-800/70">
        ¿No tenés cuenta?{' '}
        <Link href={`/auth/registro?next=${encodeURIComponent(next)}`} className="text-moss-700 underline-offset-4 hover:underline">
          Registrate con email
        </Link>
      </p>
      <p className="mt-2 text-sm text-ink-800/70">
        <Link href="/auth/reset" className="text-moss-700 underline-offset-4 hover:underline">
          Olvidé mi contraseña
        </Link>
      </p>
    </div>
  );
}
