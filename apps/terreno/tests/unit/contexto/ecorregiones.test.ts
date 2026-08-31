import { describe, it, expect } from 'vitest';
import {
  BIOMAS_RESOLVE, ECO_ID_A_FICHA, biomaGlobal, fichaDeEcorregion, enSudamerica,
  type Ecorregion,
} from '@/lib/ecorregiones';
import { resolverBioma, determinarBioma, fichaPorId } from '@/lib/contexto';
import type { Koppen } from '@/lib/clima';

const k = (codigo: string, descripcion = 'clima'): Koppen => ({ codigo, descripcion } as Koppen);

/** Ecorregión de prueba, con los valores que devuelve RESOLVE. */
const E = (eco_id: number, eco_name: string, bioma_num: number, bioma_name = 'x'): Ecorregion =>
  ({ eco_id, eco_name, bioma_num, bioma_name });

describe('tabla de biomas RESOLVE', () => {
  it('cubre los 14 biomas más roca y hielo', () => {
    for (let n = 1; n <= 14; n++) expect(biomaGlobal(n), `bioma ${n}`).not.toBeNull();
    expect(biomaGlobal(98)).not.toBeNull();
    expect(biomaGlobal(0)).toBeNull();
  });

  it('no repite ids de bioma global', () => {
    const ids = Object.values(BIOMAS_RESOLVE).map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('lista blanca de ecorregiones', () => {
  it('todas las ecorregiones curadas apuntan a un id de ficha', () => {
    for (const [eco, ficha] of Object.entries(ECO_ID_A_FICHA)) {
      expect(ficha, eco).toMatch(/^[a-z_]+$/);
    }
  });

  it('ninguna ecorregión de afuera apunta a una ficha sudamericana', () => {
    const sudamericanas = [
      'selva_tropical', 'sabana_cerrado', 'chaco_seco', 'monte', 'espinal', 'pampa',
      'yungas', 'puna_altoandino', 'estepa_patagonica', 'bosque_andino_patagonico',
      'mediterraneo', 'desierto_costero',
    ];
    for (const ficha of Object.values(ECO_ID_A_FICHA)) {
      expect(sudamericanas, ficha).not.toContain(ficha);
    }
  });

  it('devuelve null para una ecorregión sin curar', () => {
    expect(fichaDeEcorregion(334)).toBeNull();  // Eastern forest-boreal transition
    expect(fichaDeEcorregion(495)).toBe('bosque_humedo_tropical_caribeno');
  });
});

describe('caja de Sudamérica', () => {
  it('reconoce puntos de adentro', () => {
    expect(enSudamerica(-37.3, -59.1)).toBe(true);   // Tandil
    expect(enSudamerica(-16.5, -68.1)).toBe(true);   // La Paz
    expect(enSudamerica(4.7, -74.1)).toBe(true);     // Bogotá
  });

  it('deja afuera Norteamérica, Europa y el Caribe', () => {
    expect(enSudamerica(38.3, -96.6)).toBe(false);   // Flint Hills
    expect(enSudamerica(39.5, -6.0)).toBe(false);    // Extremadura
    expect(enSudamerica(18.3, -66.7)).toBe(false);   // Utuado, Puerto Rico
    expect(enSudamerica(17.1, -96.7)).toBe(false);   // Oaxaca
  });
});

describe('resolverBioma — tres niveles', () => {
  it('con ecorregión curada usa la ficha regional', () => {
    // Pampa húmeda: la ficha ya existe, así que sale por el nivel 1.
    const r = resolverBioma(k('Cfa'), -34.5, -59.0, 120, E(576, 'Humid Pampas', 8));
    // Todavía no curamos ECO_ID sudamericanos, así que cae al bioma global.
    expect(r.fuente).toBe('bioma_global');
    expect(r.titulo).toBe('Pastizal templado');
  });

  it('Puerto Rico no devuelve una ficha sudamericana', () => {
    const r = resolverBioma(k('Af'), 18.27, -66.72, 400, E(495, 'Puerto Rican moist forests', 1));
    expect(r.ficha).toBeNull();                       // la ficha caribeña es trabajo de la fase 2
    expect(r.fuente).toBe('bioma_global');
    expect(r.titulo).toBe('Bosque tropical y subtropical húmedo');
    expect(r.aviso).toContain('Puerto Rican moist forests');
  });

  it('Kansas cae al pastizal templado, nunca al Espinal', () => {
    const r = resolverBioma(k('Cfa'), 38.3, -96.6, 400, E(392, 'Flint Hills tallgrass prairie', 8));
    expect(r.ficha).toBeNull();
    expect(r.titulo).toBe('Pastizal templado');
  });

  it('una ecorregión sin curar igual da el bioma global', () => {
    const r = resolverBioma(k('Dfb'), 44.0, -79.0, 200, E(334, 'Eastern forest-boreal transition', 4));
    expect(r.fuente).toBe('bioma_global');
    expect(r.titulo).toBe('Bosque templado caducifolio y mixto');
    expect(r.ecorregion?.eco_id).toBe(334);
  });

  it('sin ecorregión, en Sudamérica sigue funcionando el Köppen de siempre', () => {
    const r = resolverBioma(k('Cfa'), -34.5, -59.0, 120, null);
    expect(r.fuente).toBe('koppen');
    expect(r.ficha?.id).toBe(determinarBioma(k('Cfa'), -34.5, -59.0, 120));
    expect(r.aviso).toBeNull();
  });

  it('sin ecorregión y fuera de Sudamérica no inventa ficha', () => {
    const r = resolverBioma(k('Cfa'), 38.3, -96.6, 400, null);
    expect(r.ficha).toBeNull();
    expect(r.aviso).toContain('Sudamérica');
  });

  it('el bug histórico está cerrado: Ohio ya no es Espinal', () => {
    // determinarBioma sigue devolviendo espinal — es una heurística sudamericana.
    expect(determinarBioma(k('Cfa'), 40.0, -83.0)).toBe('espinal');
    // Pero resolverBioma nunca la deja salir afuera.
    expect(resolverBioma(k('Cfa'), 40.0, -83.0, 250, null).ficha).toBeNull();
  });
});

describe('fichaPorId', () => {
  it('encuentra las fichas existentes y no rompe con las que faltan', () => {
    expect(fichaPorId('pampa')?.nombre).toBeTruthy();
    expect(fichaPorId('pradera_pastos_altos')).toBeNull();
  });
});
