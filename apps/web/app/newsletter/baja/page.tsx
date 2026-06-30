import Link from 'next/link';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Container, Section, Button } from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata = {
  title: 'Te diste de baja',
  robots: { index: false },
};

export default async function BajaPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok = '0' } = await searchParams;
  const success = ok === '1';

  return (
    <>
      <SiteHeader />
      <Section tone="bone" spacing="lg">
        <Container width="prose">
          <div className="text-center space-y-4">
            {success ? (
              <>
                <CheckCircle2 size={56} className="mx-auto text-moss-700" />
                <h1 className="font-display text-3xl text-ink-950">Te diste de baja</h1>
                <p className="text-ink-800/75">
                  Ya no vas a recibir más correos de nuestra newsletter. Si fue un error,
                  podés volver a suscribirte cuando quieras.
                </p>
              </>
            ) : (
              <>
                <AlertCircle size={56} className="mx-auto text-clay-700" />
                <h1 className="font-display text-3xl text-ink-950">No pudimos procesar la baja</h1>
                <p className="text-ink-800/75">
                  El enlace puede haber expirado. Respondé al último email y te damos de baja
                  manualmente.
                </p>
              </>
            )}
            <Link href="/">
              <Button>Volver al inicio</Button>
            </Link>
          </div>
        </Container>
      </Section>
      <SiteFooter />
    </>
  );
}
