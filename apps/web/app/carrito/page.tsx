import Link from 'next/link';
import { Container, Section, Eyebrow, Button, formatMoney } from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { getCartSummary } from '@/lib/commerce/cart';
import { CartTable } from '@/components/shop/CartTable';
import { CouponForm } from '@/components/shop/CouponForm';

export const metadata = { title: 'Carrito' };

export default async function CarritoPage() {
  const cart = await getCartSummary();

  return (
    <>
      <SiteHeader />
      <Section tone="bone" spacing="sm">
        <Container>
          <Eyebrow>Compra</Eyebrow>
          <h1 className="display-3 mt-4">Tu carrito</h1>
        </Container>
      </Section>

      <Section tone="bone" spacing="md">
        <Container>
          {cart.items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-950/15 bg-bone-50 p-16 text-center">
              <p className="font-display text-2xl">Tu carrito está vacío</p>
              <p className="mt-3 text-ink-800/65">Descubrí cursos, ebooks, biocosmética y más.</p>
              <div className="mt-8 flex justify-center gap-3">
                <Link href="/cursos"><Button variant="moss">Ver cursos</Button></Link>
                <Link href="/ebooks"><Button variant="outline">Ver ebooks</Button></Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-10 lg:grid-cols-[2fr_1fr] items-start">
              <CartTable cart={cart} />

              <aside className="rounded-2xl border border-ink-950/10 bg-bone-50 p-6 lg:sticky lg:top-24">
                <h2 className="font-display text-xl">Resumen</h2>
                <dl className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-ink-800/70">Subtotal</dt>
                    <dd>{formatMoney(cart.subtotalCents, cart.currency as never)}</dd>
                  </div>
                  {cart.discountCents > 0 && (
                    <div className="flex justify-between text-moss-700">
                      <dt>Descuento {cart.couponCode && `(${cart.couponCode})`}</dt>
                      <dd>−{formatMoney(cart.discountCents, cart.currency as never)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-ink-950/10 pt-3 font-display text-2xl">
                    <dt>Total</dt>
                    <dd>{formatMoney(cart.totalCents, cart.currency as never)}</dd>
                  </div>
                </dl>

                <CouponForm
                  appliedCoupons={cart.appliedCoupons}
                  rejectedCoupons={cart.rejectedCoupons}
                />

                <Link href="/checkout">
                  <Button variant="moss" size="lg" className="w-full mt-6">
                    Continuar al pago
                  </Button>
                </Link>
              </aside>
            </div>
          )}
        </Container>
      </Section>

      <SiteFooter />
    </>
  );
}
