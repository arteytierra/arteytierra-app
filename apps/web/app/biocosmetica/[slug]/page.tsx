import { notFound } from 'next/navigation';
import { Container, Section, Eyebrow, Breadcrumbs, PriceTag, Badge } from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { AddToCartButton } from '@/components/shop/AddToCartButton';
import { getProductBySlug, getProductCover } from '@/lib/commerce/products';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  return p ? { title: p.name, description: p.subtitle ?? undefined } : {};
}

export default async function BiocosmeticaDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const cover = getProductCover(product);
  const noStock = product.stock !== null && product.stock <= 0;

  return (
    <>
      <SiteHeader />
      <Section tone="bone" spacing="sm">
        <Container>
          <Breadcrumbs items={[{ label: 'Biocosmética', href: '/biocosmetica' }, { label: product.name }]} />
        </Container>
      </Section>
      <Section tone="bone" spacing="none">
        <Container className="py-8">
          <div className="grid gap-12 lg:grid-cols-2 items-start">
            <div className="aspect-square rounded-2xl overflow-hidden bg-bone-100">
              {cover && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover} alt={product.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div>
              <Eyebrow>{product.category ?? 'Producto'}</Eyebrow>
              <h1 className="display-2 mt-4">{product.name}</h1>
              {product.subtitle && <p className="lead mt-4">{product.subtitle}</p>}

              <div className="mt-6 flex items-center gap-3">
                <PriceTag
                  amountCents={product.base_price_cents}
                  compareAtCents={product.compare_at_cents}
                  currency={product.currency as never}
                  size="lg"
                />
                {noStock && <Badge tone="clay">Agotado</Badge>}
              </div>

              {!noStock && (
                <AddToCartButton productSlug={product.slug} label="Agregar al carrito" className="mt-6" />
              )}

              {product.description_mdx && (
                <div className="mt-10 max-w-prose text-ink-800/80 whitespace-pre-wrap leading-relaxed">
                  {product.description_mdx}
                </div>
              )}
            </div>
          </div>
        </Container>
      </Section>
      <SiteFooter />
    </>
  );
}
