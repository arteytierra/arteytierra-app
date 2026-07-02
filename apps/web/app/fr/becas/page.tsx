import type { Metadata } from 'next';
import Link from 'next/link';
import { Heart, Sprout } from 'lucide-react';
import { Container, Section, Eyebrow, Button, Badge } from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { listOpenPrograms } from '@/lib/scholarships';

export const revalidate = 300;
export const metadata: Metadata = {
  title: 'Bourses',
  description: 'Programmes de bourses et de réductions selon la situation économique, la communauté ou l’étude de terrain.',
  alternates: { canonical: '/fr/becas' },
};

export default async function BecasFrPage() {
  const programs = await listOpenPrograms();

  return (
    <>
      <SiteHeader locale="fr" />
      <Section tone="bone" spacing="md">
        <Container width="prose">
          <Eyebrow>Bourses & soutiens</Eyebrow>
          <h1 className="display-2 mt-4">Apprendre ne devrait pas dépendre du portefeuille.</h1>
          <p className="lead mt-6">
            Nous ouvrons les candidatures à celles et ceux que l&apos;éducation régénérative peut transformer — et à
            celles et ceux que la transformation peut atteindre à travers elleux. Certains programmes exigent des
            justificatifs ; d&apos;autres sont accordés par affinité de propos.
          </p>
        </Container>
      </Section>

      <Section tone="bone" spacing="lg">
        <Container>
          <div className="grid gap-6 md:grid-cols-2">
            {programs.length === 0 && (
              <p className="rounded-2xl border border-dashed border-ink-950/15 p-8 text-center text-sm text-ink-800/65 md:col-span-2">
                Aucun appel ouvert pour le moment.
              </p>
            )}
            {programs.map((p) => {
              const fullCupo = p.max_grants !== null && p.granted_count >= p.max_grants;
              const closed = p.status !== 'open' || fullCupo;
              return (
                <article key={p.id} className="rounded-2xl border border-ink-950/10 bg-bone-50 p-6 flex flex-col">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-moss-100 text-moss-700">
                    <Sprout size={18} />
                  </div>
                  <h2 className="font-display text-2xl mt-4">{p.name}</h2>
                  {p.summary && <p className="mt-2 text-sm text-ink-800/75">{p.summary}</p>}
                  <ul className="mt-4 space-y-1 text-xs text-ink-800/65">
                    <li>
                      Réduction :{' '}
                      <strong>
                        {p.discount_type === 'percent'
                          ? `${p.discount_value}%`
                          : `${p.currency ?? '$'} ${(p.discount_value / 100).toLocaleString('fr-FR')}`}
                      </strong>
                    </li>
                    {p.max_grants !== null && (
                      <li>
                        Places : {p.granted_count}/{p.max_grants}
                      </li>
                    )}
                    {p.application_deadline && (
                      <li>Clôture : {new Date(p.application_deadline).toLocaleDateString('fr-FR')}</li>
                    )}
                  </ul>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    {closed ? (
                      <Badge tone="clay">Clôturé</Badge>
                    ) : (
                      <Badge tone="moss">Appel ouvert</Badge>
                    )}
                    <Link href={closed ? '#' : `/becas/aplicar/${p.slug}`}>
                      <Button variant="outline" size="sm" disabled={closed}>
                        {closed ? 'Indisponible' : 'Postuler'}
                      </Button>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-12 rounded-2xl bg-moss-700 text-bone-50 p-8 flex items-start gap-4">
            <Heart size={20} className="shrink-0 mt-1" />
            <div>
              <h3 className="font-display text-xl">Vous souhaitez parrainer une bourse ?</h3>
              <p className="mt-2 text-sm text-bone-50/90">
                Entreprises, organisations et particuliers peuvent financer des bourses ciblées. Écrivez-nous à{' '}
                <a href="mailto:becas@arteytierra.org" className="underline">becas@arteytierra.org</a>.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <SiteFooter />
    </>
  );
}
