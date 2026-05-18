import Link from 'next/link';
import { Badge, Button, formatMoney } from '@arteytierra/ui';
import { PageHeader } from '@/components/admin/PageHeader';
import { EmptyState } from '@/components/admin/EmptyState';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { requireStaff } from '@/lib/auth/session';

export const metadata = { title: 'Cursos · Admin' };
export const dynamic = 'force-dynamic';

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  base_price_cents: number;
  currency: string;
  is_active: boolean;
  courses: Array<{
    id: string;
    level: string | null;
    duration_hours: number | null;
    is_live: boolean;
    starts_at: string | null;
    capacity: number | null;
  }> | null;
}

export default async function CursosAdminPage() {
  await requireStaff();
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .schema('shop').from('products')
    .select(
      'id, slug, name, base_price_cents, currency, is_active, courses(id, level, duration_hours, is_live, starts_at, capacity)',
    )
    .eq('type', 'course')
    .order('updated_at', { ascending: false });

  const courses = (data ?? []) as unknown as ProductRow[];

  return (
    <>
      <PageHeader
        title="Cursos"
        description="Editar currículum, módulos, lecciones y emisión de certificados."
      />

      {courses.length === 0 ? (
        <EmptyState title="Sin cursos cargados" description="Creá un producto tipo curso primero." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((p) => {
            const c = p.courses?.[0];
            return (
              <article key={p.id} className="rounded-2xl border border-ink-950/10 bg-bone-50 p-5">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge tone={c?.is_live ? 'sun' : 'moss'}>
                    {c?.is_live ? 'En vivo' : 'Grabado'}
                  </Badge>
                  <Badge tone={p.is_active ? 'moss' : 'neutral'}>
                    {p.is_active ? 'Activo' : 'Borrador'}
                  </Badge>
                </div>
                <h2 className="font-display text-xl">{p.name}</h2>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-sm text-ink-800/75">
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-ink-800/55">Duración</dt>
                    <dd>{c?.duration_hours ?? '—'}h</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-ink-800/55">Capacidad</dt>
                    <dd>{c?.capacity ?? '∞'}</dd>
                  </div>
                </dl>
                <p className="mt-4 font-medium">
                  {formatMoney(p.base_price_cents, p.currency as never)}
                </p>
                <div className="mt-5 flex gap-2">
                  <Link href={`/admin/cursos/${p.id}`} className="flex-1">
                    <Button variant="primary" size="sm" className="w-full">
                      Editar currículum
                    </Button>
                  </Link>
                  <Link href={`/admin/productos/${p.id}`}>
                    <Button variant="outline" size="sm">
                      Producto
                    </Button>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
