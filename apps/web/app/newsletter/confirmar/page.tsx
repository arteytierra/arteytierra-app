import Link from 'next/link';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Container, Section, Button } from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { confirmSubscription } from '@/lib/newsletter';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Confirmar suscripción',
  robots: { index: false },
};

export default async function ConfirmarPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = '' } = await searchParams;
  const result = await confirmSubscription(token);

  return (
    <>
      <SiteHeader />
      <Section tone="bone" spacing="lg">
        <Container width="prose">
          {result.ok ? (
            <div className="text-center space-y-4">
              <CheckCircle2 size={56} className="mx-auto text-moss-700" />
              <h1 className="font-display text-3xl text-ink-950">¡Listo, {result.email}!</h1>
              <p className="text-ink-800/75">
                Tu suscripción quedó confirmada. Vas a recibir novedades sobre cursos,
                hospedaje, biocosmética y nuestras inmersiones vivenciales.
              </p>
              <div className="pt-2">
                <Link href="/">
                  <Button>Volver al inicio</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <AlertCircle size={56} className="mx-auto text-clay-700" />
              <h1 className="font-display text-3xl text-ink-950">
                {result.reason === 'expired' ? 'Enlace vencido' : 'Enlace inválido'}
              </h1>
              <p className="text-ink-800/75">
                {result.reason === 'expired'
                  ? 'Este link de confirmación venció. Volvé a suscribirte y te enviamos uno nuevo.'
                  : 'No pudimos validar el enlace. Es posible que ya lo hayas usado o que esté incompleto.'}
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Link href="/">
                  <Button variant="outline">Inicio</Button>
                </Link>
                <Link href="/#newsletter">
                  <Button>Suscribirme de nuevo</Button>
                </Link>
              </div>
            </div>
          )}
        </Container>
      </Section>
      <SiteFooter />
    </>
  );
}
