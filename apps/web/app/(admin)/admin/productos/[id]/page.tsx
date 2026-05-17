import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Button } from '@arteytierra/ui';
import { PageHeader } from '@/components/admin/PageHeader';
import { ProductForm } from '@/components/admin/products/ProductForm';
import { ProductDangerZone } from '@/components/admin/products/ProductDangerZone';
import { getProductAdmin } from '@/lib/admin/products';

export const metadata = { title: 'Editar producto · Admin' };
export const dynamic = 'force-dynamic';

const TYPE_TO_PATH: Record<string, string> = {
  course: 'cursos',
  ebook: 'ebooks',
  biocosmetic: 'biocosmetica',
  lodging: 'hospedaje',
  consult: 'asesorias',
  immersion: 'inmersion-viva',
  physical: 'tienda',
  service: 'tienda',
};

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductAdmin(id);
  if (!product) notFound();

  const publicPath = TYPE_TO_PATH[product.type];

  return (
    <>
      <PageHeader
        title={product.name}
        description={`Tipo: ${product.type} · /${product.slug}`}
        actions={
          publicPath ? (
            <Link href={`/${publicPath}/${product.slug}`} target="_blank" rel="noopener">
              <Button variant="outline" size="sm">
                <ExternalLink size={14} /> Ver público
              </Button>
            </Link>
          ) : null
        }
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <ProductForm
          productId={product.id}
          initial={{
            slug: product.slug,
            name: product.name,
            subtitle: product.subtitle ?? '',
            description_mdx: product.description_mdx ?? '',
            type: product.type,
            base_price_cents: product.base_price_cents,
            compare_at_cents: product.compare_at_cents,
            currency: product.currency,
            stock: product.stock,
            is_active: product.is_active,
            category: product.category ?? '',
            attributes: (product.attributes as Record<string, unknown>) ?? {},
          }}
        />
        <aside className="space-y-4">
          <ProductDangerZone productId={product.id} isActive={product.is_active} />
        </aside>
      </div>
    </>
  );
}
