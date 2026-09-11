import { describe, it, expect } from 'vitest';
import { repartirDescuento } from '@/lib/commerce/mp';

/**
 * Mercado Pago no tiene campo de descuento a nivel preferencia, así que el
 * descuento del carrito tiene que quedar adentro de los precios unitarios. Si
 * no, se cobra el bruto: es exactamente lo que pasaba antes: `createMpPreference`
 * recibía `discountCents` y lo ignoraba, y el cupón se cobraba igual.
 */
describe('commerce/mp · repartirDescuento', () => {
  it('sin descuento devuelve los totales tal cual', () => {
    const out = repartirDescuento([{ unitAmountCents: 1000, qty: 2 }, { unitAmountCents: 500, qty: 1 }], 0);
    expect(out).toEqual([2000, 500]);
  });

  it('el total con descuento es exactamente bruto - descuento', () => {
    const lineas = [{ unitAmountCents: 1000, qty: 2 }, { unitAmountCents: 333, qty: 3 }];
    const bruto = 2000 + 999;
    const out = repartirDescuento(lineas, 777);
    expect(out.reduce((a, b) => a + b, 0)).toBe(bruto - 777);
  });

  it('reparte proporcional y no deja líneas negativas', () => {
    const out = repartirDescuento([{ unitAmountCents: 9000, qty: 1 }, { unitAmountCents: 1000, qty: 1 }], 5000);
    expect(out.reduce((a, b) => a + b, 0)).toBe(5000);
    expect(out.every((t) => t >= 0)).toBe(true);
    // La línea cara absorbe la mayor parte.
    expect(out[0] ?? 0).toBeGreaterThan(out[1] ?? 0);
  });

  it('un descuento mayor al bruto no genera un cobro negativo', () => {
    const out = repartirDescuento([{ unitAmountCents: 500, qty: 1 }], 99999);
    expect(out.reduce((a, b) => a + b, 0)).toBe(0);
  });

  it('ignora descuentos negativos', () => {
    const out = repartirDescuento([{ unitAmountCents: 500, qty: 1 }], -100);
    expect(out).toEqual([500]);
  });
});
