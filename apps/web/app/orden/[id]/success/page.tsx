import Link from 'next/link';
import { CheckCircle2, Download } from 'lucide-react';
import { Container, Section, Button, formatMoney } from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { getEbookDownloadUrls } from '@/lib/commerce/fulfillment';

export const metadata = { title: '¡Gracias!' };
export const dynamic = 'force-dynamic';

export default async function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createSupabaseAdminClient();
  const { data: order } = await admin
    .schema('shop').from('orders')
    .select('id, status, total_cents, currency, billing, order_items(name_snapshot, product_type, qty)')
    .eq('id', id)
    .single();

  const ebookUrls = order?.status === 'paid' ? await getEbookDownloadUrls(id) : [];
  const hasCourse = (order?.order_items ?? []).some(
    (it: { product_type: string }) => it.product_type === 'course' || it.product_type === 'immersion',
  );

  return (
    <>
      <SiteHeader />
      <Section tone="bone" spacing="md">
        <Container width="prose">
          <div className="text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-moss-100 text-moss-700">
              <CheckCircle2 size={32} />
            </div>
            <h1 className="display-2 mt-8">¡Gracias!</h1>
            <p className="lead mt-4">
              Tu pedido <span className="font-mono text-base">#{id.slice(0, 8)}</span> se está procesando.
            </p>
            {order?.status === 'paid' && order.total_cents > 0 && (
              <p className="mt-2 text-ink-800/70">
                Pagaste {formatMoney(order.total_cents, order.currency as never)}.
              </p>
            )}
          </div>

          {order?.status !== 'paid' && (
            <div className="mt-10 rounded-2xl bg-sun-300/20 border border-sun-500/30 p-6 text-sm">
              <p>
                Estamos esperando la confirmación del pago. Te avisamos por email
                cuando esté listo. Esto puede demorar unos minutos.
              </p>
            </div>
          )}

          {ebookUrls.length > 0 && (
            <div className="mt-12">
              <h2 className="font-display text-2xl">Tus descargas</h2>
              <ul className="mt-4 space-y-2">
                {ebookUrls.map((eb) => (
                  <li key={eb.url}>
                    <a
                      href={eb.url}
                      className="flex items-center gap-3 rounded-xl border border-ink-950/10 bg-bone-50 px-5 py-4 hover:bg-bone-100"
                    >
                      <Download size={16} className="text-moss-700" />
                      <span className="flex-1 font-medium">{eb.name}</span>
                      <span className="text-xs text-ink-800/55">PDF</span>
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-ink-800/55">
                Los links son válidos por 7 días. También quedan disponibles en tu cuenta.
              </p>
            </div>
          )}

          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {hasCourse && (
              <Link href="/mis-cursos">
                <Button variant="moss" size="lg">Ver mis cursos</Button>
              </Link>
            )}
            <Link href="/mi-cuenta">
              <Button variant="outline" size="lg">Ir a mi cuenta</Button>
            </Link>
          </div>
        </Container>
      </Section>
      <SiteFooter />
    </>
  );
}
