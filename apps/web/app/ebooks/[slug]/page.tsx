import { notFound } from 'next/navigation';
import { Download, FileText } from 'lucide-react';
import {
  Container, Section, Eyebrow, Breadcrumbs, PriceTag,
} from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { AddToCartButton } from '@/components/shop/AddToCartButton';
import { getProductBySlug, getProductCover } from '@/lib/commerce/products';
import { JsonLd } from '@/components/seo/JsonLd';
import { productJsonLd, breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { buildSocial } from '@/lib/seo/og';
import { ReviewsSection } from '@/components/reviews/ReviewsSection';
import { getReviewAggregate } from '@/lib/reviews';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return {};
  return {
    title: p.name,
    description: p.subtitle ?? undefined,
    alternates: { canonical: `/ebooks/${slug}` },
    ...buildSocial({
      title: p.name,
      description: p.subtitle ?? undefined,
      url: `/ebooks/${slug}`,
      ogKind: 'ebook',
      ogEyebrow: 'Ebook',
    }),
  };
}

export default async function EbookDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || product.type !== 'ebook') notFound();

  const cover = getProductCover(product);
  const agg = await getReviewAggregate(product.id);

  return (
    <>
      <SiteHeader />
      <Section tone="bone" spacing="sm">
        <Container>
          <Breadcrumbs items={[{ label: 'Ebooks', href: '/ebooks' }, { label: product.name }]} />
        </Container>
      </Section>
      <Section tone="bone" spacing="none">
        <Container className="py-8">
          <div className="grid gap-12 lg:grid-cols-2 items-start">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-bone-100">
              {cover && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover} alt={product.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div>
              <Eyebrow>Ebook</Eyebrow>
              <h1 className="display-2 mt-4">{product.name}</h1>
              {product.subtitle && <p className="lead mt-4">{product.subtitle}</p>}

              <PriceTag
                amountCents={product.base_price_cents}
                compareAtCents={product.compare_at_cents}
                currency={product.currency as never}
                size="lg"
                className="mt-8"
              />

              <AddToCartButton productSlug={product.slug} label="Comprar ebook" className="mt-6" />

              <ul className="mt-10 space-y-3 text-sm text-ink-800/80">
                <li className="flex items-center gap-2"><FileText size={14} className="text-moss-700"/> PDF de alta calidad</li>
                <li className="flex items-center gap-2"><Download size={14} className="text-moss-700"/> Descarga inmediata tras la compra</li>
              </ul>

              {product.description_mdx && (
                <div className="mt-10 max-w-prose text-ink-800/80 whitespace-pre-wrap leading-relaxed">
                  {product.description_mdx}
                </div>
              )}
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="bone" spacing="lg">
        <Container width="prose">
          <ReviewsSection productId={product.id} />
        </Container>
      </Section>

      <SiteFooter />

      <JsonLd
        data={[
          productJsonLd(
            {
              slug: product.slug,
              name: product.name,
              description: product.subtitle ?? undefined,
              image: cover,
              priceCents: product.base_price_cents,
              currency: product.currency,
              category: 'Ebook',
              ratingValue: agg?.rating_avg,
              reviewCount: agg?.review_count,
            },
            'ebooks',
          ),
          breadcrumbJsonLd([
            { name: 'Inicio', url: '/' },
            { name: 'Ebooks', url: '/ebooks' },
            { name: product.name, url: `/ebooks/${product.slug}` },
          ]),
        ]}
      />
    </>
  );
}
