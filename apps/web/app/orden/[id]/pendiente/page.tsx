import Link from 'next/link';
import { Clock } from 'lucide-react';
import { Container, Section, Button } from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata = { title: 'Pago pendiente' };

export default async function OrderPendingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <SiteHeader />
      <Section tone="bone" spacing="md">
        <Container width="prose">
          <div className="text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-sun-300/30 text-clay-900">
              <Clock size={32} />
            </div>
            <h1 className="display-2 mt-8">Pago en proceso</h1>
            <p className="lead mt-4">
              Tu pedido <span className="font-mono text-base">#{id.slice(0, 8)}</span> está pendiente
              de confirmación (boleto, Rapipago, transferencia). Te avisamos por email cuando se acredite.
            </p>
            <div className="mt-10 flex justify-center gap-3">
              <Link href="/mi-cuenta"><Button variant="moss" size="lg">Ver mi cuenta</Button></Link>
            </div>
          </div>
        </Container>
      </Section>
      <SiteFooter />
    </>
  );
}
