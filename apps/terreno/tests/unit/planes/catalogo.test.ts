import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { ACEQUIA_PLANS, acequiaPlanPrice } from '@arteytierra/config/acequia';
import { LIMITE_PROYECTOS, can } from '@/lib/entitlements';

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
    expect(acequiaPlanPrice('disenador', 'mensual')).toBe(15);
    expect(acequiaPlanPrice('disenador', 'anual')).toBe(150);
    expect(acequiaPlanPrice('estudio', 'mensual')).toBe(35);
    expect(acequiaPlanPrice('estudio', 'anual')).toBe(350);
    expect(ACEQUIA_PLANS.semilla.monthlyUsd).toBeNull();
  });

  it('el plan anual equivale a diez meses en todos los pagos', () => {
    for (const plan of ['personal', 'disenador', 'estudio'] as const) {
      expect(acequiaPlanPrice(plan, 'anual')).toBe(acequiaPlanPrice(plan, 'mensual') * 10);
    }
  });

  it('los topes de proyectos suben con el plan y ninguno es infinito', () => {
    expect(LIMITE_PROYECTOS.semilla).toBe(1);
    expect(LIMITE_PROYECTOS.personal).toBe(2);
    expect(LIMITE_PROYECTOS.disenador).toBe(10);
    expect(LIMITE_PROYECTOS.estudio).toBe(50);

    const orden = ['semilla', 'personal', 'disenador', 'estudio'] as const;
    for (let i = 1; i < orden.length; i += 1) {
      const actual = orden[i]!, previo = orden[i - 1]!;
      expect(LIMITE_PROYECTOS[actual]).toBeGreaterThan(LIMITE_PROYECTOS[previo]);
      expect(Number.isFinite(LIMITE_PROYECTOS[actual])).toBe(true);
    }
  });

  it('la base repite exactamente los mismos topes', () => {
    // Si alguien cambia LIMITE_PROYECTOS y se olvida de la migración, el
    // cliente y el trigger empiezan a decir cosas distintas.
    // Relativo a este archivo: vitest corre parado en apps/terreno.
    const raiz = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..', '..', '..', '..');
    // Se busca por nombre y no por numero: la migracion ya se renumero una vez
    // y el test no tiene por que romperse cada vez que eso pase.
    const dir = join(raiz, 'supabase/migrations');
    const archivo = readdirSync(dir).find((n) => n.endsWith('_terreno_limites_planes.sql'));
    expect(archivo, 'falta la migracion de topes de planes').toBeTruthy();
    const sql = readFileSync(join(dir, archivo!), 'utf8');
    const normalizado = sql.replace(/[ 	]+/g, ' ');
    for (const [plan, limite] of Object.entries(LIMITE_PROYECTOS)) {
      expect(normalizado).toContain(`WHEN '${plan}' THEN ${limite}`);
    }
  });

  it('el informe con marca propia arranca en Profesional', () => {
    expect(can('personal', 'informe.white_label')).toBe(false);
    expect(can('disenador', 'informe.white_label')).toBe(true);
    expect(can('estudio', 'informe.white_label')).toBe(true);
  });
});
