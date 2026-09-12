/**
 * La vidriera de /acequia y el checkout tienen que ofrecer lo mismo.
 *
 * El 12/09/2026 no lo hacían: la vidriera anunciaba Estudio a 35/350 USD con un
 * botón "Suscribirme" que llevaba a la pantalla de confirmación, y el checkout
 * rechaza cualquier plan que no sea Personal o Profesional porque los cinco
 * asientos de Estudio se dan de alta a mano. Con los pagos apagados el visitante
 * recibía el 503 genérico y no se notaba; prendidos, habría recorrido el alta del
 * plan más caro para recibir un error al final.
 *
 * Estos tests no miran `esPlanPago` porque vive en un módulo server-only que
 * arrastra Stripe y Mercado Pago. Miran la única fuente que las dos partes leen.
 */
import { describe, it, expect } from 'vitest';
import { ACEQUIA_PLANS, acequiaSelfCheckout, type AcequiaPlanId } from '@arteytierra/config/acequia';
import { PLANES } from '@/lib/terreno/planes';

const IDS: AcequiaPlanId[] = ['semilla', 'personal', 'profesional', 'estudio'];

describe('vidriera y checkout ofrecen lo mismo', () => {
  it('la vidriera lista los cuatro planes del catálogo, sin inventar ninguno', () => {
    expect(PLANES.map((p) => p.id)).toEqual(IDS);
  });

  it('cada plan de la vidriera copia el autoservicio del catálogo', () => {
    for (const plan of PLANES) {
      expect(plan.compraEnLinea).toBe(ACEQUIA_PLANS[plan.id].selfCheckout);
    }
  });

  it('sólo Personal y Profesional se contratan solos', () => {
    const solos = IDS.filter((id) => ACEQUIA_PLANS[id].selfCheckout);
    expect(solos).toEqual(['personal', 'profesional']);
  });

  it('Estudio se pide, no se compra, mientras los asientos se den de alta a mano', () => {
    // Si este test falla porque alguien implementó los asientos: además de
    // poner selfCheckout en true hay que ampliar el tipo PlanPago y las tablas
    // PRECIO_USD y NOMBRE de lib/terreno/suscripciones.ts, o el checkout va a
    // seguir rechazándolo con la vidriera ya ofreciéndolo.
    expect(ACEQUIA_PLANS.estudio.seats).toBeGreaterThan(1);
    expect(ACEQUIA_PLANS.estudio.selfCheckout).toBe(false);
    expect(acequiaSelfCheckout('estudio')).toBe(false);
  });

  it('un plan gratis no necesita autoservicio: se resuelve con el registro', () => {
    expect(ACEQUIA_PLANS.semilla.monthlyUsd).toBeNull();
    expect(ACEQUIA_PLANS.semilla.selfCheckout).toBe(false);
  });

  it('acequiaSelfCheckout sigue aceptando el nombre viejo del plan', () => {
    // Un link viejo o la metadata de un pago en vuelo pueden traer 'disenador'.
    expect(acequiaSelfCheckout('disenador')).toBe(true);
    expect(acequiaSelfCheckout('no_existe')).toBe(false);
    expect(acequiaSelfCheckout('semilla')).toBe(false);
  });

  it('todo plan que se contrata solo tiene precio en los dos períodos', () => {
    for (const id of IDS) {
      if (!ACEQUIA_PLANS[id].selfCheckout) continue;
      expect(ACEQUIA_PLANS[id].monthlyUsd).toBeGreaterThan(0);
      expect(ACEQUIA_PLANS[id].annualUsd).toBeGreaterThan(0);
    }
  });
});
