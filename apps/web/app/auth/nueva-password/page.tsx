import { Eyebrow } from '@arteytierra/ui';
import { NewPasswordForm } from './NewPasswordForm';
import { requireUser } from '@/lib/auth/session';

export const metadata = { title: 'Nueva contraseña' };

export default async function NewPasswordPage() {
  await requireUser('/auth/nueva-password');
  return (
    <div>
      <Eyebrow>Cuenta</Eyebrow>
      <h1 className="display-3 mt-4">Nueva contraseña</h1>
      <p className="lead mt-4 text-base">
        Elegí una nueva contraseña segura para tu cuenta.
      </p>
      <div className="mt-8">
        <NewPasswordForm />
      </div>
    </div>
  );
}
