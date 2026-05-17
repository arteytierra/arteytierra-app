import Link from 'next/link';
import { Badge, Button, formatMoney } from '@arteytierra/ui';
import { PageHeader } from '@/components/admin/PageHeader';
import { EmptyState } from '@/components/admin/EmptyState';
import { listProductsAdmin } from '@/lib/admin/products';
import { CreateProductButton } from '@/components/admin/products/CreateProductButton';

export const metadata = { title: 'Productos · Admin' };
export const dynamic = 'force-dynamic';

const TYPE_LABEL: Record<string, string> = {
  course: 'Curso',
  ebook: 'Ebook',
  physical: 'Físico',
  service: 'Servicio',
  lodging: 'Hospedaje',
  immersion: 'Inmersión',
  consult: 'Asesoría',
  biocosmetic: 'Biocosmética',
};

export default async function ProductosPage() {
  const products = await listProductsAdmin();

  return (
    <>
      <PageHeader
        title="Productos"
        description="Cursos, ebooks, biocosmética, hospedaje, asesorías e inmersiones."
        actions={<CreateProductButton />}
      />

      {products.length === 0 ? (
        <EmptyState
          title="Sin productos cargados"
          description="Creá tu primer producto desde el botón superior."
        />
      ) : (
        <div className="rounded-2xl border border-ink-950/10 bg-bone-50 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bone-100 text-ink-800/65 text-xs uppercase tracking-[0.12em]">
              <tr>
                <th className="text-left px-5 py-3">Nombre</th>
                <th className="text-left px-5 py-3">Tipo</th>
                <th className="text-left px-5 py-3">Stock</th>
                <th className="text-left px-5 py-3">Estado</th>
                <th className="text-right px-5 py-3">Precio</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-ink-950/5">
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/productos/${p.id}`}
                      className="hover:text-moss-700 font-medium"
                    >
                      {p.name}
                    </Link>
                    <p className="text-xs text-ink-800/55 mt-0.5">/{p.slug}</p>
                  </td>
                  <td className="px-5 py-3 text-ink-800/70">
                    {TYPE_LABEL[p.type] ?? p.type}
                  </td>
                  <td className="px-5 py-3">{p.stock ?? '∞'}</td>
                  <td className="px-5 py-3">
                    <Badge tone={p.is_active ? 'moss' : 'neutral'}>
                      {p.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right font-medium">
                    {formatMoney(p.base_price_cents, p.currency as never)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/admin/productos/${p.id}`}>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
