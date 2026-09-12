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
import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
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

/**
 * La cotización del peso es un precio, y los precios no se escriben dos veces.
 *
 * La vidriera tenía `ARS_POR_USD = 1500` y hasta lo imprimía en la letra chica
 * ("Precios en pesos a 1500 $/USD"), mientras `crearPreapprovalMp` armaba el
 * importe con `ACEQUIA_ARS_PER_USD`. Si esa variable no vale 1500 —y no tiene
 * por qué, es la que se actualiza cuando se mueve el dólar—, el visitante leía
 * un precio y se le cobraba otro.
 */
describe('la cotización que se muestra es la que se cobra', () => {
  const original = process.env.ACEQUIA_ARS_PER_USD;
  afterEach(() => {
    if (original === undefined) delete process.env.ACEQUIA_ARS_PER_USD;
    else process.env.ACEQUIA_ARS_PER_USD = original;
  });

  async function cotizacion() {
    return import('@/lib/terreno/cotizacion');
  }

  it('sin la variable no se muestra ningún precio en pesos', async () => {
    delete process.env.ACEQUIA_ARS_PER_USD;
    const { tasaArsPorUsdParaMostrar, tasaArsPorUsd } = await cotizacion();
    expect(tasaArsPorUsdParaMostrar()).toBeNull();
    // Para cobrar, en cambio, la ausencia tiene que explotar: un preapproval con
    // importe NaN es peor que un error.
    expect(() => tasaArsPorUsd()).toThrow();
  });

  it('un valor imposible se trata como ausente', async () => {
    const { tasaArsPorUsdParaMostrar } = await cotizacion();
    for (const valor of ['0', '-1500', 'mil quinientos', '']) {
      process.env.ACEQUIA_ARS_PER_USD = valor;
      expect(tasaArsPorUsdParaMostrar(), valor).toBeNull();
    }
  });

  it('devuelve la cotización configurada, sin redondearla por su cuenta', async () => {
    process.env.ACEQUIA_ARS_PER_USD = '1423.75';
    const { tasaArsPorUsdParaMostrar } = await cotizacion();
    expect(tasaArsPorUsdParaMostrar()).toBe(1423.75);
  });

  it('ni la vidriera ni su componente escriben una cotización propia', () => {
    const base = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
    const archivos = [
      join(base, 'lib', 'terreno', 'planes.ts'),
      join(base, 'components', 'terreno', 'PlanesTerreno.tsx'),
    ];
    for (const archivo of archivos) {
      const codigo = readFileSync(archivo, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .split('\n')
        .filter((linea) => !linea.trimStart().startsWith('//'))
        .join('\n');
      expect(codigo, archivo).not.toMatch(/ARS_POR_USD\s*=\s*\d/);
    }
  });
});
