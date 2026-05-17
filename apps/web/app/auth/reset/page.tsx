import Link from 'next/link';
import { Eyebrow } from '@arteytierra/ui';
import { ResetForm } from './ResetForm';

export const metadata = { title: 'Recuperar contraseña' };

export default function ResetPage() {
  return (
    <div>
      <Eyebrow>Recuperar acceso</Eyebrow>
      <h1 className="display-3 mt-4">Olvidaste tu contraseña</h1>
      <p className="lead mt-4 text-base">
        Ingresá tu correo y te enviamos un link para crear una nueva.
      </p>

      <div className="mt-8">
        <ResetForm />
      </div>

      <p className="mt-8 text-sm text-ink-800/70">
        <Link href="/auth/login" className="text-moss-700 underline-offset-4 hover:underline">
          Volver al ingreso
        </Link>
      </p>
    </div>
  );
}
