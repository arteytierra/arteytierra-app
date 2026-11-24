/**
 * Los precios nuevos, y las dos cosas que podían cobrar de más sin avisar.
 *
 * El 23/11/2026 Profesional pasó de 15 a 20 USD y Estudio de 35 a 40, y la
 * prueba sin cargo quedó sólo en Personal. Las dos cosas tocan plata, y cada
 * una traía un borde que no se ve leyendo el catálogo:
 *
 *  1. **El plan de PayPal nace con su importe adentro.** `ensurePlan` cachea el
 *     identificador en `terreno.paypal_planes` con una clave que NO incluía el
 *     precio, así que subir Profesional en el catálogo no habría cambiado nada
 *     en PayPal: el identificador viejo seguiría cobrando 15 mientras la
 *     vidriera anuncia 20. Un precio mostrado y otro cobrado, del lado caro.
 *  2. **Cambiar de plan deja dos suscripciones vivas.** Con la prueba sólo en
 *     Personal, el camino esperado es probar Personal y contratar Profesional
 *     al terminar. Eso pasa de nuevo por el checkout, y si el checkout no
 *     cierra la suscripción anterior en el proveedor, la de Personal cobra
 *     igual tres días después: dos débitos por una decisión.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import {
  ACEQUIA_PLANS,
  ACEQUIA_TRIAL_PLAN,
  acequiaPlanPrice,
  acequiaTrialDays,
} from '@arteytierra/config/acequia';

const base = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

function fuente(...partes: string[]): string {
  return readFileSync(join(base, ...partes), 'utf8');
}

/** El código sin comentarios: nombrar una variable no es leerla. */
function codigo(...partes: string[]): string {
  return fuente(...partes)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((linea) => !linea.trimStart().startsWith('//'))
    .join('\n');
}

describe('los precios que se cobran', () => {
  it('son los del 23/11/2026', () => {
    expect(acequiaPlanPrice('personal', 'mensual')).toBe(7);
    expect(acequiaPlanPrice('profesional', 'mensual')).toBe(20);
    expect(acequiaPlanPrice('estudio', 'mensual')).toBe(40);
  });

  it('el anual sigue siendo diez meses, o sea dos de regalo', () => {
    // La vidriera dice "2 meses gratis" en el selector de período. Si alguien
    // cambia un precio anual suelto, esa frase deja de ser cierta.
    for (const plan of ['personal', 'profesional', 'estudio'] as const) {
      expect(acequiaPlanPrice(plan, 'anual')).toBe(acequiaPlanPrice(plan, 'mensual') * 10);
    }
  });

  it('Estudio sigue conviniendo contra comprar cinco Profesionales', () => {
    const sueltos = acequiaPlanPrice('profesional', 'mensual') * ACEQUIA_PLANS.estudio.seats;
    expect(acequiaPlanPrice('estudio', 'mensual')).toBeLessThan(sueltos);
  });
});

describe('el plan de PayPal cambia cuando cambia el precio', () => {
  it('la clave del cache lleva el importe y los días de prueba adentro', () => {
    const src = codigo('lib', 'terreno', 'paypal.ts');
    // El orden de los pedazos no importa; que estén, sí.
    expect(src).toMatch(/const clave = `.*\$\{plan\}.*`/);
    expect(src).toContain('u${usd}');
    expect(src).toContain('t${dias}');
  });

  it('los días del ciclo TRIAL salen del plan, no de la constante global', () => {
    const src = codigo('lib', 'terreno', 'paypal.ts');
    expect(src).toContain('diasDePruebaDe');
    expect(src).not.toContain('ACEQUIA_TRIAL_DAYS');
  });

  it('diasDePruebaDe exige las dos condiciones: la bandera y el plan', () => {
    const src = codigo('lib', 'terreno', 'suscripciones.ts');
    expect(src).toContain('pruebaComercialHabilitada() ? acequiaTrialDays(plan) : 0');
  });

  it('el preapproval de Mercado Pago no manda start_date sin prueba', () => {
    // `acequiaFinDePrueba` devuelve null para Profesional, y sin start_date el
    // primer cobro de Mercado Pago es hoy.
    const src = codigo('lib', 'terreno', 'suscripciones.ts');
    expect(src).toContain('acequiaFinDePrueba(o.plan)');
    expect(src).not.toContain('addAcequiaTrialDays');
  });
});

describe('el checkout cierra lo anterior antes de abrir lo nuevo', () => {
  const src = codigo('app', 'api', 'terreno', 'checkout', 'route.ts');

  it('cancela en el proveedor y lo hace antes de crear la suscripción nueva', () => {
    expect(src).toContain('cancelarPreapprovalMp');
    expect(src).toContain('cancelarSubscripcionPaypal');
    const cierre = src.indexOf('cancelarPreapprovalMp(');
    const alta = src.indexOf('crearPreapprovalMp(');
    expect(cierre).toBeGreaterThan(-1);
    expect(alta).toBeGreaterThan(-1);
    expect(cierre).toBeLessThan(alta);
  });

  it('si el cierre falla no abre nada: responde y corta', () => {
    // El orden inverso —abrir y después intentar cerrar— deja dos cobros vivos
    // cuando el segundo paso falla, que es el peor resultado posible.
    expect(src).toMatch(/status: 502/);
  });

  it('no toca las altas manuales, que no tienen nada que cancelar', () => {
    // Un código de piloto deja `provider = 'manual'` y ningún `provider_ref`.
    expect(src).toContain("actual.provider === 'mercadopago' || actual.provider === 'paypal'");
  });
});

describe('el endpoint publica de qué plan es la prueba', () => {
  const src = codigo('app', 'api', 'terreno', 'estado-pagos', 'route.ts');

  it('cada plan lleva sus propios días de prueba', () => {
    // Sin esto, una vidriera que sólo ve `diasPrueba` pone "Probar 3 días" en
    // la tarjeta de Profesional y manda a una pantalla que cobra hoy.
    expect(src).toContain('pruebaDias');
    expect(src).toContain('acequiaTrialDays(plan.id)');
  });

  it('y dice cuál es ese plan, sin que haya que deducirlo de los ceros', () => {
    expect(src).toContain('planPrueba: ACEQUIA_TRIAL_PLAN');
    expect(ACEQUIA_TRIAL_PLAN).toBe('personal');
    expect(acequiaTrialDays('personal')).toBeGreaterThan(0);
  });
});

describe('la vidriera de arteytierra.org no promete una prueba que no existe', () => {
  it('ninguna respuesta de las FAQ ofrece probar Profesional o Estudio', () => {
    const src = fuente('app', 'acequia', 'page.tsx');
    const faqs = src.slice(src.indexOf('const FAQS'), src.indexOf('// ─── Página'));
    expect(faqs).not.toMatch(/prob(ar|á) (el plan )?Profesional/i);
    expect(faqs).not.toMatch(/prob(ar|á) (el plan )?Estudio/i);
  });
});
