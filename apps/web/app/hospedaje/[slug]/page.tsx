import { notFound } from 'next/navigation';
import { Users, Home, TreePine } from 'lucide-react';
import {
  Container, Section, Eyebrow, Breadcrumbs, PriceTag,
} from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { ReservationPicker } from '@/components/booking/ReservationPicker';
import { getResourceByProductSlug, getBlockedDates } from '@/lib/book/queries';
import { getProductCover } from '@/lib/commerce/products';
import { JsonLd } from '@/components/seo/JsonLd';
import { lodgingJsonLd, breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { buildSocial } from '@/lib/seo/og';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getResourceByProductSlug(slug);
  if (!data) return {};
  return {
    title: data.product.name,
    description: data.product.subtitle,
    alternates: { canonical: `/hospedaje/${slug}` },
    ...buildSocial({
      title: data.product.name,
      description: data.product.subtitle ?? undefined,
      url: `/hospedaje/${slug}`,
      ogKind: 'lodging',
      ogEyebrow: 'Hospedaje',
    }),
  };
}

export default async function HospedajeDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getResourceByProductSlug(slug);
  if (!data || data.product.type !== 'lodging' || !data.resource) notFound();

  const now = new Date();
  const sixMonthsLater = new Date();
  sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
  const blockedDates = await getBlockedDates(data.resource.id, now, sixMonthsLater);

  const cover = getProductCover(data.product as never);

  return (
    <>
      <SiteHeader />
      <Section tone="bone" spacing="sm">
        <Container>
          <Breadcrumbs items={[{ label: 'Hospedaje', href: '/hospedaje' }, { label: data.product.name }]} />
        </Container>
      </Section>

      <Section tone="bone" spacing="none">
        <Container className="py-8">
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] items-start">
            <div>
              <Eyebrow>Hospedaje regenerativo</Eyebrow>
              <h1 className="display-2 mt-4">{data.product.name}</h1>
              {data.product.subtitle && <p className="lead mt-6">{data.product.subtitle}</p>}

              {cover && (
                <div className="mt-10 aspect-[4/3] rounded-2xl overflow-hidden bg-bone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cover} alt={data.product.name} className="w-full h-full object-cover" />
                </div>
              )}

              <ul className="mt-8 flex flex-wrap gap-4 text-sm text-ink-800/75">
                <li className="inline-flex items-center gap-2"><Users size={16} /> Hasta {data.resource.capacity ?? 4} huéspedes</li>
                <li className="inline-flex items-center gap-2"><Home size={16} /> Construido en tierra y madera local</li>
                <li className="inline-flex items-center gap-2"><TreePine size={16} /> Entre bosque nativo</li>
              </ul>

              {data.product.description_mdx && (
                <div className="mt-10 max-w-prose text-ink-800/80 whitespace-pre-wrap leading-relaxed">
                  {data.product.description_mdx}
                </div>
              )}
            </div>

            <aside className="lg:sticky lg:top-24 self-start space-y-5">
              <PriceTag
                amountCents={data.product.base_price_cents}
                currency={data.product.currency as never}
                size="lg"
              />
              <p className="text-sm text-ink-800/65 -mt-3">por noche</p>

              <ReservationPicker
                productSlug={data.product.slug}
                pricePerNightCents={data.product.base_price_cents}
                currency={data.product.currency}
                blockedDates={blockedDates}
                kind="lodging"
                capacity={data.resource.capacity}
              />

              <p className="text-xs text-ink-800/55">
                Mínimo 2 noches. Tu reserva se confirma al completar el pago.
              </p>
            </aside>
          </div>
        </Container>
      </Section>

      <SiteFooter />

      <JsonLd
        data={[
          lodgingJsonLd({
            slug: data.product.slug,
            name: data.product.name,
            description: data.product.subtitle ?? undefined,
            image: cover,
            priceCents: data.product.base_price_cents,
            currency: data.product.currency,
            maxGuests: data.resource.capacity ?? undefined,
            amenityFeatures: ['Construcción en tierra', 'Bosque nativo', 'Comida regenerativa'],
          }),
          breadcrumbJsonLd([
            { name: 'Inicio', url: '/' },
            { name: 'Hospedaje', url: '/hospedaje' },
            { name: data.product.name, url: `/hospedaje/${data.product.slug}` },
          ]),
        ]}
      />
    </>
  );
}
