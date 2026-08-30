import { describe, it, expect } from 'vitest';
import {
  ARTEFACTOS, ARTEFACTOS_DOMESTICOS, ARTEFACTOS_RIEGO,
  artefactoPorId, caudalHunter_ls, coefSimultaneidad, demandaRed,
} from '@/lib/artefactos';

describe('catálogo de artefactos', () => {
  it('no tiene ids repetidos', () => {
    const ids = ARTEFACTOS.map(a => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('todo artefacto tiene caudal y presión positivos', () => {
    for (const a of ARTEFACTOS) {
      expect(a.caudal_ls, a.id).toBeGreaterThan(0);
      expect(a.presion_min_mca, a.id).toBeGreaterThan(0);
    }
  });

  it('los domésticos intermitentes tienen unidades de gasto', () => {
    for (const a of ARTEFACTOS_DOMESTICOS.filter(x => !x.continuo)) {
      expect(a.ug, a.id).toBeGreaterThan(0);
    }
  });

  it('todo el riego es de uso continuo y no aporta unidades de gasto', () => {
    for (const a of ARTEFACTOS_RIEGO) {
      expect(a.continuo, a.id).toBe(true);
      expect(a.ug, a.id).toBe(0);
    }
  });

  it('busca por id y devuelve null si no existe', () => {
    expect(artefactoPorId('ducha')?.nombre).toBe('Ducha');
    expect(artefactoPorId('no_existe')).toBeNull();
  });
});

describe('curva de Hunter', () => {
  it('sin unidades de gasto no hay caudal', () => {
    expect(caudalHunter_ls(0)).toBe(0);
    expect(caudalHunter_ls(-5)).toBe(0);
  });

  it('crece con las unidades de gasto pero cada vez menos', () => {
    const q10 = caudalHunter_ls(10);
    const q20 = caudalHunter_ls(20);
    const q40 = caudalHunter_ls(40);
    expect(q20).toBeGreaterThan(q10);
    expect(q40).toBeGreaterThan(q20);
    // Duplicar las UG no duplica el caudal: ésa es toda la gracia del método.
    expect(q20).toBeLessThan(q10 * 2);
    expect(q40).toBeLessThan(q20 * 2);
  });

  it('reproduce los puntos de la tabla original', () => {
    // 10 UG = 14,6 gpm = 0,921 L/s
    expect(caudalHunter_ls(10)).toBeCloseTo(14.6 * 0.0630902, 3);
    // 50 UG = 29,1 gpm
    expect(caudalHunter_ls(50)).toBeCloseTo(29.1 * 0.0630902, 3);
  });

  it('interpola entre dos filas de la tabla', () => {
    const q = caudalHunter_ls(11);
    expect(q).toBeGreaterThan(caudalHunter_ls(10));
    expect(q).toBeLessThan(caudalHunter_ls(12));
  });
});

describe('coeficiente de simultaneidad', () => {
  it('con un solo artefacto no descuenta nada', () => {
    expect(coefSimultaneidad(1)).toBe(1);
    expect(coefSimultaneidad(0)).toBe(1);
  });

  it('baja al crecer la cantidad, con piso', () => {
    expect(coefSimultaneidad(5)).toBeCloseTo(0.5, 3);
    expect(coefSimultaneidad(100)).toBe(0.2);
  });
});

describe('demanda de la red', () => {
  it('sin artefactos devuelve todo en cero', () => {
    const d = demandaRed([]);
    expect(d.maximo_ls).toBe(0);
    expect(d.diseno_ls).toBe(0);
    expect(d.n_total).toBe(0);
  });

  it('el caudal de diseño es menor que la suma de todas las llaves abiertas', () => {
    const d = demandaRed([
      { artefactoId: 'canilla_cocina',   cantidad: 1 },
      { artefactoId: 'lavatorio',        cantidad: 2 },
      { artefactoId: 'inodoro_deposito', cantidad: 2 },
      { artefactoId: 'ducha',            cantidad: 2 },
      { artefactoId: 'lavarropas',       cantidad: 1 },
    ]);
    expect(d.n_total).toBe(8);
    expect(d.ug_total).toBe(2 + 2 + 6 + 4 + 2);
    expect(d.diseno_ls).toBeLessThan(d.maximo_ls);
    expect(d.diseno_ls).toBeGreaterThan(0);
  });

  it('un solo artefacto se dimensiona por su propio caudal', () => {
    // Con 2 UG Hunter da ~0,32 L/s, más que la canilla sola: manda el mayor.
    const d = demandaRed([{ artefactoId: 'canilla_cocina', cantidad: 1 }]);
    expect(d.diseno_ls).toBeGreaterThanOrEqual(0.2);
    expect(d.maximo_ls).toBe(0.2);
  });

  it('el consumo continuo se suma entero, sin simultaneidad', () => {
    const soloGoteo = demandaRed([{ artefactoId: 'gotero_4', cantidad: 900 }]);
    // 900 goteros × 4 L/h = 3600 L/h = 1 L/s exacto.
    expect(soloGoteo.continuo_ls).toBeCloseTo(1, 3);
    expect(soloGoteo.diseno_ls).toBeCloseTo(soloGoteo.maximo_ls, 3);
    expect(soloGoteo.ug_total).toBe(0);
  });

  it('mezcla doméstico y riego: uno con simultaneidad, el otro no', () => {
    const items = [
      { artefactoId: 'ducha',    cantidad: 2 },
      { artefactoId: 'gotero_4', cantidad: 900 },
    ];
    const d = demandaRed(items);
    const soloDucha = demandaRed([{ artefactoId: 'ducha', cantidad: 2 }]);
    expect(d.continuo_ls).toBeCloseTo(1, 3);
    expect(d.diseno_ls).toBeCloseTo(soloDucha.diseno_ls + 1, 3);
    expect(d.n_intermitentes).toBe(2);
  });

  it('toma la presión más exigente de todo lo conectado', () => {
    const d = demandaRed([
      { artefactoId: 'lavatorio',   cantidad: 1 },   // 2 m.c.a.
      { artefactoId: 'ducha',       cantidad: 1 },   // 5 m.c.a.
      { artefactoId: 'microasp_40', cantidad: 1 },   // 15 m.c.a.
    ]);
    expect(d.presion_min_mca).toBe(15);
    expect(d.presion_manda).toBe('Microaspersor 40 L/h');
  });

  it('ignora ids desconocidos y cantidades en cero', () => {
    const d = demandaRed([
      { artefactoId: 'no_existe', cantidad: 5 },
      { artefactoId: 'ducha',     cantidad: 0 },
    ]);
    expect(d.n_total).toBe(0);
    expect(d.diseno_ls).toBe(0);
  });
});
