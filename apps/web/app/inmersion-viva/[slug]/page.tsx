import { notFound } from 'next/navigation';
import { Users, Calendar, MapPin } from 'lucide-react';
import { Container, Section, Eyebrow, Breadcrumbs, PriceTag, Badge } from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { AddToCartButton } from '@/components/shop/AddToCartButton';
import { getResourceByProductSlug } from '@/lib/book/queries';
import { getProductCover } from '@/lib/commerce/products';
import { JsonLd } from '@/components/seo/JsonLd';
import { eventJsonLd, breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { buildSocial } from '@/lib/seo/og';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getResourceByProductSlug(slug);
  if (!data) return {};
  return {
    title: data.product.name,
    description: data.product.subtitle,
    alternates: { canonical: `/inmersion-viva/${slug}` },
    ...buildSocial({
      title: data.product.name,
      description: data.product.subtitle ?? undefined,
      url: `/inmersion-viva/${slug}`,
      ogKind: 'inmersion',
      ogEyebrow: 'Inmersión Viva',
    }),
  };
}

export default async function InmersionDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getResourceByProductSlug(slug);
  if (!data || data.product.type !== 'immersion') notFound();

  const cover = getProductCover(data.product as never);
  const attrs = (data.product.attributes as Record<string, unknown> | null) ?? {};
  const startsAt = attrs.startsAt as string | undefined;
  const endsAt = attrs.endsAt as string | undefined;
  const location = attrs.location as string | undefined;
  const remaining = data.resource?.capacity ?? null;

  return (
    <>
      <SiteHeader />
      <Section tone="bone" spacing="sm">
        <Container>
          <Breadcrumbs items={[{ label: 'Inmersión Viva', href: '/inmersion-viva' }, { label: data.product.name }]} />
        </Container>
      </Section>

      <Section tone="bone" spacing="none">
        <Container className="py-8">
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] items-start">
            <div>
              <Eyebrow>Edición</Eyebrow>
              <h1 className="display-2 mt-4">{data.product.name}</h1>
              {data.product.subtitle && <p className="lead mt-6">{data.product.subtitle}</p>}

              {cover && (
                <div className="mt-10 aspect-[16/10] rounded-2xl overflow-hidden bg-bone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cover} alt={data.product.name} className="w-full h-full object-cover" />
                </div>
              )}

              <ul className="mt-8 flex flex-wrap gap-4 text-sm text-ink-800/75">
                {startsAt && endsAt && (
                  <li className="inline-flex items-center gap-2">
                    <Calendar size={14} className="text-moss-700" />
                    {new Date(startsAt).toLocaleDateString('es-AR')} →{' '}
                    {new Date(endsAt).toLocaleDateString('es-AR')}
                  </li>
                )}
                {location && (
                  <li className="inline-flex items-center gap-2">
                    <MapPin size={14} className="text-moss-700" /> {location}
                  </li>
                )}
                {data.resource?.capacity && (
                  <li className="inline-flex items-center gap-2">
                    <Users size={14} className="text-moss-700" /> Cupo: {data.resource.capacity}
                  </li>
                )}
              </ul>

              {data.product.description_mdx && (
                <div className="mt-10 max-w-prose text-ink-800/80 whitespace-pre-wrap leading-relaxed">
                  {data.product.description_mdx}
                </div>
              )}
            </div>

            <aside className="lg:sticky lg:top-24 self-start">
              <div className="rounded-2xl border border-ink-950/10 bg-bone-50 p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <PriceTag
                    amountCents={data.product.base_price_cents}
                    compareAtCents={data.product.compare_at_cents}
                    currency={data.product.currency as never}
                    size="lg"
                  />
                  {data.product.stock !== null && data.product.stock <= 3 && data.product.stock > 0 && (
                    <Badge tone="sun">Quedan {data.product.stock}</Badge>
                  )}
                </div>
                <p className="text-sm text-ink-800/65">
                  Incluye hospedaje, comida regenerativa, materiales y mentoría.
                </p>
                {remaining !== null && data.product.stock === 0 ? (
                  <Badge tone="clay">Cupos agotados</Badge>
                ) : (
                  <AddToCartButton productSlug={data.product.slug} label="Reservar mi lugar" />
                )}
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      <SiteFooter />

      {startsAt && endsAt && (
        <JsonLd
          data={[
            eventJsonLd({
              slug: data.product.slug,
              name: data.product.name,
              description: data.product.subtitle ?? undefined,
              image: cover,
              startDate: startsAt,
              endDate: endsAt,
              locationName: location ?? 'Arte y Tierra, Argentina',
              priceCents: data.product.base_price_cents,
              currency: data.product.currency,
            }),
            breadcrumbJsonLd([
              { name: 'Inicio', url: '/' },
              { name: 'Inmersión Viva', url: '/inmersion-viva' },
              { name: data.product.name, url: `/inmersion-viva/${data.product.slug}` },
            ]),
          ]}
        />
      )}
    </>
  );
}
