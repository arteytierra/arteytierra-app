import { redirect } from 'next/navigation';
import { Container, Section, Eyebrow, formatMoney } from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { getCartSummary } from '@/lib/commerce/cart';
import { getCurrentUser } from '@/lib/auth/session';
import { CheckoutForm } from '@/components/shop/CheckoutForm';

export const metadata = { title: 'Checkout' };

export default async function CheckoutPage() {
  const cart = await getCartSummary();
  if (!cart.id || cart.items.length === 0) redirect('/carrito');

  const user = await getCurrentUser();
  const recommendedProvider: 'stripe' | 'mercadopago' = cart.currency === 'ARS' ? 'mercadopago' : 'stripe';

  return (
    <>
      <SiteHeader />
      <Section tone="bone" spacing="sm">
        <Container>
          <Eyebrow>Compra</Eyebrow>
          <h1 className="display-3 mt-4">Finalizar</h1>
        </Container>
      </Section>

      <Section tone="bone" spacing="md">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] items-start">
            <CheckoutForm
              defaultEmail={user?.email}
              defaultName={user?.fullName ?? undefined}
              currency={cart.currency}
              recommendedProvider={recommendedProvider}
              totalCents={cart.totalCents}
            />

            <aside className="rounded-2xl border border-ink-950/10 bg-bone-50 p-6 lg:sticky lg:top-24">
              <h2 className="font-display text-xl">Tu pedido</h2>
              <ul className="mt-5 divide-y divide-ink-950/10">
                {cart.items.map((it) => (
                  <li key={it.id} className="py-3 flex justify-between gap-4 text-sm">
                    <div>
                      <p className="font-medium">{it.product.name}</p>
                      <p className="text-xs text-ink-800/55">×{it.qty}</p>
                    </div>
                    <p className="font-medium whitespace-nowrap">
                      {formatMoney(it.unit_price_cents * it.qty, cart.currency as never)}
                    </p>
                  </li>
                ))}
              </ul>

              <dl className="mt-5 border-t border-ink-950/10 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-800/65">Subtotal</dt>
                  <dd>{formatMoney(cart.subtotalCents, cart.currency as never)}</dd>
                </div>
                {cart.discountCents > 0 && (
                  <div className="flex justify-between text-moss-700">
                    <dt>Descuento</dt>
                    <dd>−{formatMoney(cart.discountCents, cart.currency as never)}</dd>
                  </div>
                )}
                <div className="flex justify-between font-display text-2xl pt-3 border-t border-ink-950/10 mt-2">
                  <dt>Total</dt>
                  <dd>{formatMoney(cart.totalCents, cart.currency as never)}</dd>
                </div>
              </dl>
            </aside>
          </div>
        </Container>
      </Section>

      <SiteFooter />
    </>
  );
}
