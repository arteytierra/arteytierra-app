import { notFound, redirect } from 'next/navigation';
import { Container, Section, Eyebrow } from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { getCurrentUser } from '@/lib/auth/session';
import { getProgramBySlug } from '@/lib/scholarships';
import { ScholarshipApplyForm } from '@/components/scholarships/ScholarshipApplyForm';

export const dynamic = 'force-dynamic';

export default async function ApplyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/auth/login?next=/becas/aplicar/${slug}`);
  const program = await getProgramBySlug(slug);
  if (!program) notFound();

  const closed =
    program.status !== 'open' ||
    (program.max_grants !== null && program.granted_count >= program.max_grants) ||
    (program.application_deadline ? new Date(program.application_deadline).getTime() < Date.now() : false);

  return (
    <>
      <SiteHeader />
      <Section tone="bone" spacing="md">
        <Container width="prose">
          <Eyebrow>Postulación</Eyebrow>
          <h1 className="display-3 mt-3">{program.name}</h1>
          {program.summary && <p className="lead mt-4">{program.summary}</p>}

          {program.body_md && (
            <div className="mt-6 rounded-2xl border border-ink-950/10 bg-bone-50 p-6 text-sm whitespace-pre-wrap">
              {program.body_md}
            </div>
          )}

          {closed ? (
            <p className="mt-10 rounded-2xl border border-dashed border-ink-950/20 p-8 text-center text-ink-800/70">
              Esta convocatoria está cerrada.
            </p>
          ) : (
            <div className="mt-10">
              <ScholarshipApplyForm
                programSlug={program.slug}
                requiresEvidence={program.requires_evidence}
              />
            </div>
          )}
        </Container>
      </Section>
      <SiteFooter />
    </>
  );
}
