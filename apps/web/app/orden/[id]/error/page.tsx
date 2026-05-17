import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { Container, Section, Button } from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata = { title: 'Pago no completado' };

export default async function OrderErrorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <SiteHeader />
      <Section tone="bone" spacing="md">
        <Container width="prose">
          <div className="text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-clay-100 text-clay-700">
              <XCircle size={32} />
            </div>
            <h1 className="display-2 mt-8">El pago no se completó</h1>
            <p className="lead mt-4">
              Tu pedido <span className="font-mono text-base">#{id.slice(0, 8)}</span> quedó sin confirmar.
              Podés intentar de nuevo desde tu carrito.
            </p>
            <div className="mt-10 flex justify-center gap-3">
              <Link href="/carrito"><Button variant="moss" size="lg">Volver al carrito</Button></Link>
              <Link href="/contacto"><Button variant="outline" size="lg">Contactar soporte</Button></Link>
            </div>
          </div>
        </Container>
      </Section>
      <SiteFooter />
    </>
  );
}
