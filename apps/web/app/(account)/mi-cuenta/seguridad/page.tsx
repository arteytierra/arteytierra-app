import { Card, CardHeader, CardBody, CardTitle, CardSubtitle } from '@arteytierra/ui';
import { requireUser } from '@/lib/auth/session';
import { ChangePasswordForm } from '@/components/account/ChangePasswordForm';

export const metadata = { title: 'Contraseña' };

export default async function SecurityPage() {
  await requireUser();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contraseña</CardTitle>
        <CardSubtitle>Elegí una nueva contraseña para tu cuenta</CardSubtitle>
      </CardHeader>
      <CardBody>
        <ChangePasswordForm />
      </CardBody>
    </Card>
  );
}
