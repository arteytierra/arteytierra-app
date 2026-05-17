import { notFound } from 'next/navigation';
import { Clock, Users, Video, Award, CheckCircle2 } from 'lucide-react';
import {
  Container,
  Section,
  Eyebrow,
  Badge,
  Breadcrumbs,
  PriceTag,
} from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { AddToCartButton } from '@/components/shop/AddToCartButton';
import { getCourseWithCurriculum, getProductCover } from '@/lib/commerce/products';
import { JsonLd } from '@/components/seo/JsonLd';
import { courseJsonLd, productJsonLd, breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { buildSocial } from '@/lib/seo/og';
import { ReviewsSection } from '@/components/reviews/ReviewsSection';
import { getReviewAggregate } from '@/lib/reviews';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getCourseWithCurriculum(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.subtitle,
    alternates: { canonical: `/cursos/${slug}` },
    ...buildSocial({
      title: product.name,
      description: product.subtitle ?? undefined,
      url: `/cursos/${slug}`,
      ogKind: 'course',
      ogEyebrow: product.category ?? 'Curso',
    }),
  };
}

export default async function CursoDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getCourseWithCurriculum(slug);
  if (!product) notFound();

  const course = (product as never as { courses: Array<{
    level: string | null; duration_hours: number | null; is_live: boolean;
    is_recorded: boolean; capacity: number | null; starts_at: string | null;
    modules: Array<{ id: string; title: string; summary: string | null; position: number;
      lessons: Array<{ id: string; title: string; kind: string; duration_sec: number | null; is_free_preview: boolean; position: number }>
    }>
  }> }).courses?.[0];

  const cover = getProductCover(product as never);
  const agg = await getReviewAggregate(product.id);

  return (
    <>
      <SiteHeader />

      <Section tone="bone" spacing="sm">
        <Container>
          <Breadcrumbs
            items={[{ label: 'Cursos', href: '/cursos' }, { label: product.name }]}
            LinkComponent={(props: { href: string; children: React.ReactNode }) => <a {...props} />}
          />
        </Container>
      </Section>

      <Section tone="bone" spacing="none">
        <Container className="py-8">
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
            {/* Columna principal */}
            <div>
              <Eyebrow>{product.category ?? 'Curso'}</Eyebrow>
              <h1 className="display-2 mt-4">{product.name}</h1>
              {product.subtitle && <p className="lead mt-6">{product.subtitle}</p>}

              <ul className="mt-8 flex flex-wrap gap-4 text-sm text-ink-800/75">
                {course?.duration_hours && (
                  <li className="inline-flex items-center gap-2"><Clock size={16} /> {course.duration_hours}h totales</li>
                )}
                {course?.is_live && (
                  <li className="inline-flex items-center gap-2"><Video size={16} /> Encuentros en vivo + grabación</li>
                )}
                {course?.capacity && (
                  <li className="inline-flex items-center gap-2"><Users size={16} /> Cupo: {course.capacity}</li>
                )}
                <li className="inline-flex items-center gap-2"><Award size={16} /> Certificado al completar</li>
              </ul>

              {/* Curriculum */}
              {course?.modules?.length ? (
                <div className="mt-14">
                  <h2 className="font-display text-3xl">Programa</h2>
                  <div className="mt-8 space-y-4">
                    {course.modules
                      .sort((a, b) => a.position - b.position)
                      .map((m) => (
                        <article key={m.id} className="rounded-2xl border border-ink-950/10 bg-bone-50 p-6">
                          <h3 className="font-display text-xl">{m.title}</h3>
                          {m.summary && <p className="mt-2 text-sm text-ink-800/70">{m.summary}</p>}
                          <ul className="mt-4 divide-y divide-ink-950/5">
                            {m.lessons
                              .sort((a, b) => a.position - b.position)
                              .map((l) => (
                                <li key={l.id} className="flex items-center gap-3 py-2 text-sm">
                                  <CheckCircle2 size={14} className="text-moss-700 shrink-0" />
                                  <span className="flex-1">{l.title}</span>
                                  {l.is_free_preview && <Badge tone="moss">Preview</Badge>}
                                  {l.duration_sec && (
                                    <span className="text-xs text-ink-800/55">
                                      {Math.round(l.duration_sec / 60)} min
                                    </span>
                                  )}
                                </li>
                              ))}
                          </ul>
                        </article>
                      ))}
                  </div>
                </div>
              ) : null}

              {product.description_mdx && (
                <div className="mt-14 max-w-prose">
                  <h2 className="font-display text-3xl mb-6">Sobre el curso</h2>
                  <div className="text-ink-800/80 whitespace-pre-wrap leading-relaxed">
                    {product.description_mdx}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar de compra (sticky) */}
            <aside className="lg:sticky lg:top-24 self-start">
              <div className="rounded-2xl border border-ink-950/10 bg-bone-50 overflow-hidden">
                {cover && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover} alt={product.name} className="w-full aspect-[16/10] object-cover" />
                )}
                <div className="p-6">
                  <PriceTag
                    amountCents={product.base_price_cents}
                    compareAtCents={product.compare_at_cents}
                    currency={product.currency as never}
                    size="lg"
                  />

                  <ul className="mt-6 space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-ink-800/80">
                      <CheckCircle2 size={14} className="text-moss-700" />
                      Acceso de por vida al material
                    </li>
                    <li className="flex items-center gap-2 text-ink-800/80">
                      <CheckCircle2 size={14} className="text-moss-700" />
                      Comunidad activa
                    </li>
                    <li className="flex items-center gap-2 text-ink-800/80">
                      <CheckCircle2 size={14} className="text-moss-700" />
                      Certificado digital al completar
                    </li>
                  </ul>

                  <AddToCartButton
                    productSlug={product.slug}
                    label="Inscribirme"
                    className="mt-6"
                  />

                  <a
                    href={`/cursos/${product.slug}/q-a`}
                    className="mt-3 block text-center text-sm text-moss-700 underline"
                  >
                    Ir al foro de preguntas →
                  </a>

                  <p className="mt-4 text-xs text-ink-800/55">
                    Pagos seguros con Stripe y Mercado Pago. Garantía de 7 días.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      <Section tone="bone" spacing="lg">
        <Container width="prose">
          <ReviewsSection productId={product.id} />
        </Container>
      </Section>

      <Section tone="bone" spacing="lg">
        <Container>
          {/* @ts-expect-error Async Server Component */}
          <CourseRecommendations productId={product.id} />
        </Container>
      </Section>

      <SiteFooter />

      <JsonLd
        data={[
          courseJsonLd({
            slug: product.slug,
            name: product.name,
            description: product.subtitle ?? undefined,
            image: cover,
            durationHours: course?.duration_hours ?? undefined,
            priceCents: product.base_price_cents,
            currency: product.currency,
            startDate: course?.starts_at ?? undefined,
            ratingValue: agg?.rating_avg,
            reviewCount: agg?.review_count,
          }),
          productJsonLd(
            {
              slug: product.slug,
              name: product.name,
              description: product.subtitle ?? undefined,
              image: cover,
              priceCents: product.base_price_cents,
              currency: product.currency,
              category: product.category ?? 'Curso',
              ratingValue: agg?.rating_avg,
              reviewCount: agg?.review_count,
            },
            'cursos',
          ),
          breadcrumbJsonLd([
            { name: 'Inicio', url: '/' },
            { name: 'Cursos', url: '/cursos' },
            { name: product.name, url: `/cursos/${product.slug}` },
          ]),
        ]}
      />
    </>
  );
}

async function CourseRecommendations({ productId }: { productId: string }) {
  const { recommendForProduct } = await import('@/lib/recommendations');
  const { RecommendationsRow } = await import('@/components/recommendations/RecommendationsRow');
  const items = await recommendForProduct(productId, 4);
  return <RecommendationsRow items={items} title="Continúa explorando" />;
}
