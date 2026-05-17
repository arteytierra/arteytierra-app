import Link from 'next/link';
import { Badge, Container, Section, Eyebrow } from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { requireUser } from '@/lib/auth/session';
import { listUserApplications } from '@/lib/scholarships';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Mis becas' };

const STATUS_LABEL: Record<string, { label: string; tone: 'moss' | 'clay' | 'sun' | 'ink' | 'neutral' }> = {
  pending: { label: 'Pendiente', tone: 'sun' },
  in_review: { label: 'En revisión', tone: 'sun' },
  approved: { label: 'Aprobada', tone: 'moss' },
  rejected: { label: 'Rechazada', tone: 'clay' },
  expired: { label: 'Vencida', tone: 'neutral' },
};

export default async function MisBecasPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const user = await requireUser('/mis-becas');
  const sp = await searchParams;
  const apps = await listUserApplications(user.id);

  return (
    <>
      <SiteHeader />
      <Section tone="bone" spacing="md">
        <Container width="prose">
          <Eyebrow>Mis becas</Eyebrow>
          <h1 className="display-3 mt-3">Estado de mis postulaciones</h1>

          {sp.ok === '1' && (
            <p className="mt-6 rounded-xl bg-moss-100 px-4 py-3 text-sm text-moss-900">
              Tu postulación fue enviada. Te avisamos por mail cuando haya una decisión.
            </p>
          )}

          <div className="mt-8 space-y-3">
            {apps.length === 0 && (
              <p className="rounded-2xl border border-dashed border-ink-950/15 bg-bone-50 p-8 text-center text-sm text-ink-800/65">
                Aún no postulaste a ninguna beca.{' '}
                <Link href="/becas" className="text-moss-700 underline">
                  Ver programas →
                </Link>
              </p>
            )}
            {apps.map((rawA) => {
              const a = rawA as never as {
                id: string; motivation: string; status: keyof typeof STATUS_LABEL;
                created_at: string; granted_coupon: string | null; decision_at: string | null;
                reviewer_notes: string | null;
                scholarship_programs: { name: string; slug: string };
              };
              const meta = STATUS_LABEL[a.status] ?? STATUS_LABEL.pending;
              return (
                <article key={a.id} className="rounded-2xl border border-ink-950/10 bg-bone-50 p-6">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h2 className="font-display text-xl">{a.scholarship_programs.name}</h2>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-ink-800/70 line-clamp-3">{a.motivation}</p>
                  {a.reviewer_notes && (
                    <p className="mt-3 rounded-xl bg-bone-100 px-3 py-2 text-xs text-ink-800/80">
                      Nota del revisor: {a.reviewer_notes}
                    </p>
                  )}
                  {a.granted_coupon && (
                    <div className="mt-4 rounded-xl border border-moss-700/40 bg-moss-100 px-4 py-3 text-sm text-moss-900">
                      🎉 Tu cupón:{' '}
                      <code className="font-mono font-bold">{a.granted_coupon}</code> · usalo en el checkout.
                    </div>
                  )}
                  <p className="mt-3 text-xs text-ink-800/55">
                    Postulada el {new Date(a.created_at).toLocaleDateString('es-AR')}
                    {a.decision_at && ` · decisión: ${new Date(a.decision_at).toLocaleDateString('es-AR')}`}
                  </p>
                </article>
              );
            })}
          </div>
        </Container>
      </Section>
      <SiteFooter />
    </>
  );
}
