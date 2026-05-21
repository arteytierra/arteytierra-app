'use client';

import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { Minus, Plus, Trash2, X } from 'lucide-react';
import { Sheet, Button, formatMoney } from '@arteytierra/ui';
import { useCartUI } from './CartProvider';
import { useCourseCart } from './CourseCartProvider';
import { removeFromCart, updateCartItem } from '@/lib/commerce/actions';
import type { CartSummary } from '@/lib/commerce/cart';

const MP_LINK = 'https://link.mercadopago.com.ar/arteytierra';
const PAYPAL_LINK = 'https://paypal.me/arteytierra';
const WA_LINK = 'https://wa.me/5493549431594';

export function CartSheet() {
  const { open, hide } = useCartUI();
  const { items: courseItems, remove: removeCourse, count: courseCount } = useCourseCart();
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [pending, start] = useTransition();
  const [payStep, setPayStep] = useState(false);
  const [showBancolombia, setShowBancolombia] = useState(false);

  useEffect(() => {
    if (!open) { setPayStep(false); setShowBancolombia(false); return; }
    fetch('/api/cart').then((r) => r.json()).then(setCart);
  }, [open]);

  function refresh() {
    fetch('/api/cart').then((r) => r.json()).then(setCart);
  }

  const productCount = cart?.items.length ?? 0;
  const isEmpty = courseCount === 0 && productCount === 0;

  return (
    <Sheet open={open} onClose={hide} title="Tu carrito" side="right">
      {isEmpty ? (
        <div className="text-center py-12">
          <p className="font-display text-2xl">Tu carrito está vacío</p>
          <p className="mt-2 text-ink-800/65">Descubrí cursos, ebooks y más.</p>
          <Link href="/cursos" onClick={hide}>
            <Button variant="moss" size="lg" className="mt-6">Ver cursos</Button>
          </Link>
        </div>
      ) : payStep ? (
        /* PASO DE PAGO */
        <div className="flex flex-col h-full gap-6">
          <div>
            <button
              onClick={() => setPayStep(false)}
              className="text-xs font-sans text-ink-700 hover:text-ink-950 mb-4 flex items-center gap-1"
            >
              ← Volver al carrito
            </button>
            <h3 className="font-display text-2xl text-ink-950 mb-2">Elegí cómo pagar</h3>
            <p className="text-sm text-ink-700 mb-6 leading-relaxed">
              Hacé clic en el método, completá el pago e incluí tu nombre + los cursos en el concepto. Te confirmamos la inscripción en 24 hs.
            </p>

            {courseCount > 0 && (
              <div className="bg-bone-100 p-4 mb-6 text-xs font-sans text-ink-700 leading-relaxed">
                <strong>Cursos a inscribir:</strong>{' '}
                {courseItems.map(i => `${i.name} — ${i.optionLabel} (${i.precio})`).join(' · ')}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <a
                href={MP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                onClick={hide}
                className="flex items-center justify-between px-5 py-4 bg-[#009ee3] text-white font-sans font-bold text-sm hover:opacity-90 transition-opacity"
              >
                <span>Mercado Pago</span>
                <span className="text-xs opacity-80">Argentina · ARS →</span>
              </a>
              <a
                href={PAYPAL_LINK}
                target="_blank"
                rel="noopener noreferrer"
                onClick={hide}
                className="flex items-center justify-between px-5 py-4 bg-[#003087] text-white font-sans font-bold text-sm hover:opacity-90 transition-opacity"
              >
                <span>PayPal</span>
                <span className="text-xs opacity-80">Internacional · USD →</span>
              </a>
              {!showBancolombia ? (
                <button
                  onClick={() => setShowBancolombia(true)}
                  className="flex items-center justify-between w-full px-5 py-4 bg-clay-700 text-bone-50 font-sans font-bold text-sm hover:bg-clay-900 transition-colors"
                >
                  <span>Bancolombia / Transferencia</span>
                  <span className="text-xs opacity-80">Ver datos →</span>
                </button>
              ) : (
                <div className="bg-clay-700/10 border border-clay-700/40 p-4">
                  <p className="font-sans font-bold text-sm text-ink-950 mb-2">Bancolombia — Cuenta de Ahorros</p>
                  <p className="font-mono text-lg font-bold text-clay-700 mb-0.5">541-935485-66</p>
                  <p className="text-xs text-ink-700 mb-3">Cuenta de Ahorros · Colombia</p>
                  <p className="text-xs text-ink-700 leading-relaxed mb-3">Transferí e incluí tu nombre y los cursos en el concepto. Luego mandanos el comprobante por WhatsApp.</p>
                  <a
                    href={`${WA_LINK}?text=Hola%21%20Les%20env%C3%ADo%20el%20comprobante%20de%20transferencia%20Bancolombia.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={hide}
                    className="font-sans font-bold text-sm text-clay-700 hover:underline"
                  >
                    Enviar comprobante por WhatsApp →
                  </a>
                </div>
              )}
            </div>

            <p className="mt-6 text-xs text-ink-700/70 text-center leading-relaxed">
              También podés escribirnos por WhatsApp y coordinamos el pago directo.
            </p>
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              onClick={hide}
              className="mt-2 block text-center text-sm font-bold text-clay-700 hover:underline"
            >
              Escribir por WhatsApp →
            </a>
          </div>
        </div>
      ) : (
        /* CARRITO NORMAL */
        <div className="flex flex-col h-full">
          {/* Cursos */}
          {courseCount > 0 && (
            <div className="mb-4">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-3">Inscripciones</p>
              <ul className="flex flex-col gap-2">
                {courseItems.map(it => (
                  <li key={`${it.slug}-${it.optionId}`} className="flex items-start justify-between gap-3 bg-bone-100 p-3">
                    <div className="min-w-0">
                      <p className="font-sans font-semibold text-sm text-ink-950 leading-snug truncate">{it.name}</p>
                      <p className="text-xs text-ink-700 mt-0.5">{it.optionLabel}</p>
                      <p className="text-xs font-bold text-clay-700 mt-1">{it.precio}</p>
                    </div>
                    <button
                      onClick={() => removeCourse(it.slug, it.optionId)}
                      className="text-ink-700/50 hover:text-ink-950 flex-shrink-0 mt-0.5"
                      aria-label="Quitar"
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Productos */}
          {!cart ? (
            <p className="text-sm text-ink-800/60">Cargando…</p>
          ) : cart.items.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-3">Productos</p>
              <ul className="flex-1 divide-y divide-ink-950/10 -mx-6">
                {cart.items.map((it) => (
                  <li key={it.id} className="flex gap-4 px-6 py-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{it.product.name}</p>
                      <p className="text-xs text-ink-800/55 capitalize mt-0.5">{it.product.type}</p>
                      <p className="mt-2 font-medium">
                        {formatMoney(it.unit_price_cents * it.qty, cart.currency as never)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => start(async () => { await removeFromCart(it.id); refresh(); })}
                        className="text-ink-800/50 hover:text-ink-950"
                        aria-label="Quitar"
                      >
                        <Trash2 size={14} />
                      </button>
                      {(it.product.type === 'physical' || it.product.type === 'service') && (
                        <div className="flex items-center gap-1 rounded-full border border-ink-950/15">
                          <button
                            onClick={() => start(async () => { await updateCartItem(it.id, it.qty - 1); refresh(); })}
                            disabled={pending || it.qty <= 1}
                            className="p-1.5 hover:bg-bone-100 rounded-l-full"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs w-6 text-center">{it.qty}</span>
                          <button
                            onClick={() => start(async () => { await updateCartItem(it.id, it.qty + 1); refresh(); })}
                            disabled={pending}
                            className="p-1.5 hover:bg-bone-100 rounded-r-full"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Totales + CTA */}
          <div className="border-t border-ink-950/10 -mx-6 px-6 pt-6 mt-auto space-y-3">
            {cart && cart.items.length > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-800/70">Productos</span>
                  <span>{formatMoney(cart.totalCents, cart.currency as never)}</span>
                </div>
              </>
            )}

            {courseCount > 0 && (
              <Button
                variant="clay"
                size="lg"
                className="w-full"
                onClick={() => setPayStep(true)}
              >
                Pagar inscripción{courseCount > 1 ? 'es' : ''} →
              </Button>
            )}

            {cart && cart.items.length > 0 && (
              <Link href="/checkout" onClick={hide}>
                <Button variant="moss" size="lg" className="w-full mt-2">
                  Checkout productos
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </Sheet>
  );
}
