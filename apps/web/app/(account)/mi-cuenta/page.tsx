import Link from 'next/link';
import { Card, CardHeader, CardBody, CardTitle, CardSubtitle, Button } from '@arteytierra/ui';
import { getCurrentUser } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/db/server';

export const metadata = { title: 'Mi cuenta' };

export default async function AccountPage() {
  const user = (await getCurrentUser())!;
  const supabase = await createSupabaseServerClient();

  const [{ count: enrollmentsCount }, { count: ordersCount }] = await Promise.all([
    supabase.from('enrollments').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
  ]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Cursos activos</CardTitle>
          <CardSubtitle>{enrollmentsCount ?? 0} inscripción(es)</CardSubtitle>
        </CardHeader>
        <CardBody>
          <Link href="/mis-cursos">
            <Button variant="outline" size="sm">Ver mis cursos →</Button>
          </Link>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pedidos</CardTitle>
          <CardSubtitle>{ordersCount ?? 0} pedido(s)</CardSubtitle>
        </CardHeader>
        <CardBody>
          <Link href="/mis-pedidos">
            <Button variant="outline" size="sm">Historial de compras →</Button>
          </Link>
        </CardBody>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Tus datos</CardTitle>
          <CardSubtitle>Información de contacto y preferencias</CardSubtitle>
        </CardHeader>
        <CardBody>
          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-ink-800/60">Nombre</dt>
              <dd className="mt-1">{user.fullName ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-ink-800/60">Email</dt>
              <dd className="mt-1">{user.email}</dd>
            </div>
            <div>
              <dt className="text-ink-800/60">Rol</dt>
              <dd className="mt-1 capitalize">{user.role}</dd>
            </div>
          </dl>
        </CardBody>
      </Card>
    </div>
  );
}
