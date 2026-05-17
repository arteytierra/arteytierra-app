import { notFound, redirect } from 'next/navigation';
import { Container, Section, Eyebrow } from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { getCurrentUser } from '@/lib/auth/session';
import { getProgramBySlug } from '@/lib/partners';
import { PartnerApplyForm } from '@/components/partners/PartnerApplyForm';

export const dynamic = 'force-dynamic';

export default async function PartnerApplyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/auth/login?next=/partners/aplicar/${slug}`);
  const program = await getProgramBySlug(slug);
  if (!program) notFound();

  return (
    <>
      <SiteHeader />
      <Section tone="bone" spacing="md">
        <Container width="prose">
          <Eyebrow>Postulación a partner</Eyebrow>
          <h1 className="display-3 mt-3">{program.name}</h1>
          {program.description && <p className="lead mt-4">{program.description}</p>}
          <p className="mt-2 text-sm text-ink-800/65">
            Comisión: <strong>{program.commission_pct}%</strong>
          </p>
          {program.payout_terms_md && (
            <div className="mt-6 rounded-2xl border border-ink-950/10 bg-bone-50 p-6 text-sm whitespace-pre-wrap">
              {program.payout_terms_md}
            </div>
          )}
          <div className="mt-10">
            <PartnerApplyForm programSlug={program.slug} defaultEmail={user.email} />
          </div>
        </Container>
      </Section>
      <SiteFooter />
    </>
  );
}
