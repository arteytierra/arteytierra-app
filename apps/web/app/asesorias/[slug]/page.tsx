import { notFound } from 'next/navigation';
import { Clock, Video } from 'lucide-react';
import { Container, Section, Eyebrow, Breadcrumbs, PriceTag } from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { AddToCartButton } from '@/components/shop/AddToCartButton';
import { getProductBySlug } from '@/lib/commerce/products';
import { getResourceByProductSlug } from '@/lib/book/queries';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  return p ? { title: p.name, description: p.subtitle ?? undefined } : {};
}

export default async function AsesoriaDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getResourceByProductSlug(slug);
  if (!data) notFound();
  if (data.product.type !== 'service') notFound();

  return (
    <>
      <SiteHeader />
      <Section tone="bone" spacing="sm">
        <Container>
          <Breadcrumbs items={[{ label: 'Asesorías', href: '/asesorias' }, { label: data.product.name }]} />
        </Container>
      </Section>
      <Section tone="bone" spacing="none">
        <Container className="py-8">
          <div className="grid gap-12 lg:grid-cols-2 items-start">
            <div>
              <Eyebrow>Asesoría 1:1</Eyebrow>
              <h1 className="display-2 mt-4">{data.product.name}</h1>
              {data.product.subtitle && <p className="lead mt-6">{data.product.subtitle}</p>}

              <ul className="mt-8 space-y-2 text-sm text-ink-800/80">
                <li className="inline-flex items-center gap-2"><Clock size={14} className="text-moss-700"/> 90 min de sesión</li>
                <li className="inline-flex items-center gap-2"><Video size={14} className="text-moss-700"/> Por videollamada</li>
              </ul>

              {data.product.description_mdx && (
                <div className="mt-10 max-w-prose text-ink-800/80 whitespace-pre-wrap leading-relaxed">
                  {data.product.description_mdx}
                </div>
              )}
            </div>

            <aside className="lg:sticky lg:top-24 self-start">
              <div className="rounded-2xl border border-ink-950/10 bg-bone-50 p-6 space-y-5">
                <PriceTag
                  amountCents={data.product.base_price_cents}
                  currency={data.product.currency as never}
                  size="lg"
                />
                <p className="text-sm text-ink-800/65">
                  Al confirmar el pago coordinamos por email un horario que te quede cómodo.
                </p>
                <AddToCartButton productSlug={data.product.slug} label="Reservar asesoría" />
              </div>
            </aside>
          </div>
        </Container>
      </Section>
      <SiteFooter />
    </>
  );
}
