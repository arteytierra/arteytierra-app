import Link from 'next/link';
import { Briefcase, TrendingUp, Users } from 'lucide-react';
import { Container, Section, Eyebrow, Button, Badge } from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { listActivePrograms } from '@/lib/partners';

export const revalidate = 600;
export const metadata = {
  title: 'Partners — Arte y Tierra',
  description: 'Programas para organizaciones, escuelas y aliados que quieran traer educación regenerativa a sus comunidades.',
};

const TIER_LABEL = {
  standard: 'Estándar',
  silver: 'Plata',
  gold: 'Oro',
  enterprise: 'Empresa',
} as const;

export default async function PartnersPage() {
  const programs = await listActivePrograms();

  return (
    <>
      <SiteHeader />

      <Section tone="bone" spacing="lg">
        <Container width="prose">
          <Eyebrow>Programa para aliados</Eyebrow>
          <h1 className="display-2 mt-4">Multiplicá el impacto y compartí el retorno.</h1>
          <p className="lead mt-6">
            Si liderás una escuela, ONG, marca afín o consultora — el programa Partners convierte tu
            red en alumnado, con un código único, dashboard de seguimiento y pagos mensuales.
          </p>
        </Container>
      </Section>

      <Section tone="bone" spacing="md">
        <Container>
          <div className="grid gap-6 md:grid-cols-3">
            <Feature icon={Briefcase} title="Comisión recurrente" body="Hasta 30% por venta atribuida, sin tope mensual. Pagos a los 30 días de confirmación." />
            <Feature icon={TrendingUp} title="Tracking automático" body="Cookie de 90 días, código único, dashboard con conversiones y pagos." />
            <Feature icon={Users} title="Soporte dedicado" body="Materiales co-branded, llamadas mensuales y soporte de prensa para los tiers superiores." />
          </div>
        </Container>
      </Section>

      <Section tone="bone" spacing="lg">
        <Container>
          <h2 className="font-display text-3xl">Programas activos</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {programs.map((p) => (
              <article key={p.id} className="rounded-2xl border border-ink-950/10 bg-bone-50 p-6 flex flex-col">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl">{p.name}</h3>
                  <Badge tone="moss">{TIER_LABEL[p.tier]}</Badge>
                </div>
                <p className="mt-2 text-sm text-ink-800/75">{p.description}</p>
                <p className="mt-4 font-display text-3xl text-moss-700">{p.commission_pct}%</p>
                <p className="text-xs text-ink-800/60">de comisión por venta atribuida</p>
                <Link href={`/partners/aplicar/${p.slug}`} className="mt-6 self-start">
                  <Button variant="outline" size="sm">Postular</Button>
                </Link>
              </article>
            ))}
            {programs.length === 0 && (
              <p className="md:col-span-2 rounded-2xl border border-dashed border-ink-950/15 p-8 text-center text-sm text-ink-800/65">
                No hay programas activos por el momento. Escribinos a{' '}
                <a href="mailto:partners@arteytierra.org" className="underline">partners@arteytierra.org</a>.
              </p>
            )}
          </div>
        </Container>
      </Section>

      <SiteFooter />
    </>
  );
}

function Feature({ icon: Icon, title, body }: { icon: typeof Briefcase; title: string; body: string }) {
  return (
    <article className="rounded-2xl border border-ink-950/10 bg-bone-50 p-6">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-moss-100 text-moss-700">
        <Icon size={18} />
      </div>
      <h3 className="font-display text-lg mt-4">{title}</h3>
      <p className="mt-2 text-sm text-ink-800/75">{body}</p>
    </article>
  );
}
