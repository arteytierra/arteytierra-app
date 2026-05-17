import { Card, CardHeader, CardBody, CardTitle, CardSubtitle, Badge } from '@arteytierra/ui';
import { PageHeader } from '@/components/admin/PageHeader';
import { getCurrentUser } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/db/server';

export const metadata = { title: 'Ajustes · Admin' };

export default async function AjustesPage() {
  const user = (await getCurrentUser())!;
  const supabase = await createSupabaseServerClient();
  const { data: accounts } = await supabase.from('accounts').select('*').order('name');
  const { data: cats } = await supabase.from('categories').select('*').order('type, name');

  return (
    <>
      <PageHeader title="Ajustes" description="Cuentas, categorías, integraciones y miembros." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sesión actual</CardTitle>
            <CardSubtitle>{user.email}</CardSubtitle>
          </CardHeader>
          <CardBody>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-ink-800/55">Nombre</dt><dd>{user.fullName ?? '—'}</dd></div>
              <div><dt className="text-ink-800/55">Rol</dt><dd className="capitalize">{user.role}</dd></div>
            </dl>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cuentas financieras</CardTitle>
            <CardSubtitle>{accounts?.length ?? 0} cuentas registradas</CardSubtitle>
          </CardHeader>
          <CardBody>
            <ul className="space-y-2 text-sm">
              {(accounts ?? []).map((a) => (
                <li key={a.id} className="flex items-center justify-between">
                  <span>{a.name}</span>
                  <Badge tone="outline">{a.currency} · {a.kind}</Badge>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Categorías</CardTitle>
            <CardSubtitle>{cats?.length ?? 0} categorías de ingresos y gastos</CardSubtitle>
          </CardHeader>
          <CardBody>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="eyebrow mb-3">Ingresos</p>
                <ul className="space-y-1 text-sm">
                  {(cats ?? []).filter((c) => c.type === 'income').map((c) => (
                    <li key={c.id} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: c.color ?? '#588157' }} />
                      {c.name}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="eyebrow mb-3">Gastos</p>
                <ul className="space-y-1 text-sm">
                  {(cats ?? []).filter((c) => c.type === 'expense').map((c) => (
                    <li key={c.id} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: c.color ?? '#7A4E2D' }} />
                      {c.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
