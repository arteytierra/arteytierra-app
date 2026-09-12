import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { ACEQUIA_PLANS, acequiaPlanPrice } from '@arteytierra/config/acequia';
import { LIMITE_PROYECTOS, LIMITE_CUENTAS, can } from '@/lib/entitlements';

/*
 * El precio y el tope de cada plan se escriben en tres lugares: este catálogo,
 * la migración que pone el tope del lado de la base, y la landing que los
 * muestra en la vidriera. Mostrar un número y cobrar otro es la peor falla
 * posible de esta parte del producto, así que los números quedan clavados acá.
 */
describe('catálogo de planes', () => {
  it('cobra lo que la vidriera promete', () => {
    expect(acequiaPlanPrice('personal', 'mensual')).toBe(7);
    expect(acequiaPlanPrice('personal', 'anual')).toBe(70);
    expect(acequiaPlanPrice('profesional', 'mensual')).toBe(15);
    expect(acequiaPlanPrice('profesional', 'anual')).toBe(150);
    expect(acequiaPlanPrice('estudio', 'mensual')).toBe(35);
    expect(acequiaPlanPrice('estudio', 'anual')).toBe(350);
    expect(ACEQUIA_PLANS.semilla.monthlyUsd).toBeNull();
  });

  it('el plan anual equivale a diez meses en todos los pagos', () => {
    for (const plan of ['personal', 'profesional', 'estudio'] as const) {
      expect(acequiaPlanPrice(plan, 'anual')).toBe(acequiaPlanPrice(plan, 'mensual') * 10);
    }
  });

  it('los topes de proyectos son por cuenta y ninguno es infinito', () => {
    expect(LIMITE_PROYECTOS.semilla).toBe(1);
    expect(LIMITE_PROYECTOS.personal).toBe(2);
    expect(LIMITE_PROYECTOS.profesional).toBe(10);
    // Estudio no es "mas proyectos": es la misma cuenta de 10 repetida 5 veces.
    expect(LIMITE_PROYECTOS.estudio).toBe(10);

    for (const plan of ['semilla', 'personal', 'profesional', 'estudio'] as const) {
      expect(Number.isFinite(LIMITE_PROYECTOS[plan])).toBe(true);
      expect(LIMITE_PROYECTOS[plan]).toBeGreaterThan(0);
    }
  });

  it('las cuentas por plan: solo Estudio trae mas de una', () => {
    expect(LIMITE_CUENTAS.semilla).toBe(1);
    expect(LIMITE_CUENTAS.personal).toBe(1);
    expect(LIMITE_CUENTAS.profesional).toBe(1);
    expect(LIMITE_CUENTAS.estudio).toBe(5);
  });

  it('lo que se paga por Estudio rinde mas que comprar Profesionales sueltos', () => {
    // Si dejara de rendir, el plan no tendria sentido comercial.
    const estudio = acequiaPlanPrice('estudio', 'mensual');
    const sueltos = acequiaPlanPrice('profesional', 'mensual') * LIMITE_CUENTAS.estudio;
    expect(estudio).toBeLessThan(sueltos);
  });

  it('la base repite exactamente los mismos topes', () => {
    // Si alguien cambia LIMITE_PROYECTOS y se olvida de la migración, el
    // cliente y el trigger empiezan a decir cosas distintas.
    // Relativo a este archivo: vitest corre parado en apps/terreno.
    const raiz = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..', '..', '..', '..');
    // Se busca por nombre y no por numero: la migracion ya se renumero una vez
    // y el test no tiene por que romperse cada vez que eso pase.
    const dir = join(raiz, 'supabase/migrations');
    // Se toma la ultima migracion que define la funcion del trigger, no un
    // nombre fijo: la migracion ya se renumero y se renombro una vez cada una,
    // y el test no tiene por que romperse cada vez que eso pase.
    const archivo = readdirSync(dir)
      .filter((n) => n.endsWith('.sql'))
      .sort()
      .reverse()
      .find((n) => readFileSync(join(dir, n), 'utf8').includes('lim := CASE plan_usuario'));
    expect(archivo, 'falta la migracion de topes de planes').toBeTruthy();
    const sql = readFileSync(join(dir, archivo!), 'utf8');
    const normalizado = sql.replace(/[ 	]+/g, ' ');
    for (const [plan, limite] of Object.entries(LIMITE_PROYECTOS)) {
      expect(normalizado).toContain(`WHEN '${plan}' THEN ${limite}`);
    }
  });

  it('el trigger de la base cuenta la prueba como plan pago', () => {
    // La 0051 miraba estado IN ('prueba','activa'); la 0057 reescribió la
    // función para arreglarle el ELSE NULL y se quedó sólo con 'activa'. Con la
    // prueba prendida, eso le daba el tope de Semilla —un proyecto— a alguien
    // que está probando Profesional, mientras planEfectivo() del servidor le
    // daba el plan entero. Lo arregló la 0062 y queda fijado acá.
    const raiz = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..', '..', '..', '..');
    const dir = join(raiz, 'supabase/migrations');
    const archivo = readdirSync(dir)
      .filter((n) => n.endsWith('.sql'))
      .sort()
      .reverse()
      .find((n) => readFileSync(join(dir, n), 'utf8').includes('lim := CASE plan_usuario'));
    // Se miran las sentencias, no los comentarios: el encabezado de la 0062
    // explica cuál era el ELSE NULL que se arregló, y nombrarlo no es tenerlo.
    const sql = readFileSync(join(dir, archivo!), 'utf8')
      .split('\n')
      .filter((linea) => !linea.trimStart().startsWith('--'))
      .join('\n');
    expect(sql).toContain("s.estado = 'prueba'");
    expect(sql).toContain('s.trial_end > now()');
    // Y el default del CASE sigue siendo el tope más chico, no "sin tope".
    expect(sql).toMatch(/ELSE 1\s*$/m);
    expect(sql).not.toContain('ELSE NULL');
  });

  it('el informe con marca propia arranca en Profesional', () => {
    expect(can('personal', 'informe.white_label')).toBe(false);
    expect(can('profesional', 'informe.white_label')).toBe(true);
    expect(can('estudio', 'informe.white_label')).toBe(true);
  });
});
