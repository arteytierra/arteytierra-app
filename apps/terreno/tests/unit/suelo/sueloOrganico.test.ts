import { describe, it, expect } from 'vitest';
import {
  detectarSueloOrganico,
  SOC_ORGANICO_WRB, SOC_ORGANICO_USDA, ESPESOR_HISTOSOL_CM,
} from '@/lib/sueloOrganico';
import type { CapaSuelo } from '@/lib/suelos';

/**
 * Esta función decide si el informe dice «no drenar». Los dos errores que
 * importan son opuestos y los dos son graves: decirlo donde no hay turba
 * desacredita el panel entero, y **no** decirlo donde sí hay habilita un drenaje
 * irreversible. Por eso los tests son sobre los bordes de los umbrales
 * publicados y sobre perfiles reales medidos, no sobre que devuelva un objeto.
 */

/** Las seis profundidades de SoilGrids, con el carbono orgánico que se le pase. */
const DEPTHS: Array<[string, number, number]> = [
  ['0-5cm', 0, 5], ['5-15cm', 5, 15], ['15-30cm', 15, 30],
  ['30-60cm', 30, 60], ['60-100cm', 60, 100], ['100-200cm', 100, 200],
];

const perfil = (socs: number[]): CapaSuelo[] =>
  DEPTHS.map(([label, top, bot], i) => ({
    label, prof_top: top, prof_bot: bot, espesor_mm: (bot - top) * 10,
    ph: 4.5, carbono_org: socs[i] ?? 0, arcilla: 20, arena: 40, limo: 40,
    densidad_ap: 1.1, nitrogeno: 2, clase_textura: 'franco',
    pmp: 0.1, cc: 0.25, sat: 0.45, awc_frac: 0.15, awc_mm: 15, ksat: 10,
  }));

describe('el umbral de WRB, que es el que dice «turba»', () => {
  it('200 g/kg es 20 % de carbono, no 20 % de materia orgánica', () => {
    // La trampa que cambia el resultado por 1,7: materia ≈ carbono × 1,724.
    // Si alguien "corrige" esto a 116 g/kg, media Pampa pasa a ser turbera.
    expect(SOC_ORGANICO_WRB).toBe(200);
    expect(SOC_ORGANICO_USDA).toBe(120);
  });

  it('pide 40 cm acumulados: con 30 cm no alcanza', () => {
    // 0-5 + 5-15 + 15-30 = 30 cm de material orgánico. Es turba real pero no
    // llega al criterio de Histosol, y la función no puede decir que sí.
    const r = detectarSueloOrganico(perfil([300, 300, 300, 50, 20, 10]));
    expect(r?.nivel).not.toBe('turba');
  });

  it('con 60 cm acumulados sí, y lo declara como Histosol de WRB', () => {
    // 0-5 + 5-15 + 15-30 + 30-60 = 60 cm.
    const r = detectarSueloOrganico(perfil([300, 300, 300, 300, 20, 10]));
    expect(r?.nivel).toBe('turba');
    expect(r?.criterio).toBe('histosol_wrb');
    expect(r?.espesor_cm).toBe(60);
  });

  it('justo debajo del umbral de carbono no es turba', () => {
    const r = detectarSueloOrganico(perfil([199, 199, 199, 199, 199, 199]));
    expect(r?.nivel).not.toBe('turba');
  });

  it('justo en el umbral sí lo es: el criterio es «≥», no «>»', () => {
    const r = detectarSueloOrganico(perfil([200, 200, 200, 200, 20, 10]));
    expect(r?.nivel).toBe('turba');
  });

  it('el material orgánico tiene que empezar arriba: a 60 cm no cuenta', () => {
    // 40 cm de material orgánico, pero recién desde los 60 cm. WRB pide que
    // arranque a menos de 40 cm de la superficie. Un suelo mineral con turba
    // enterrada no se cultiva como una turbera.
    const r = detectarSueloOrganico(perfil([20, 20, 20, 20, 500, 500]));
    expect(r?.nivel).not.toBe('turba');
  });
});

describe('el escalón de abajo, que existe por la resolución', () => {
  it('un horizonte hístico en superficie se avisa aunque no llegue a Histosol', () => {
    // 15 cm contiguos por encima de 200 g/kg desde la superficie: horizonte
    // hístico de WRB. Ese carbono se oxida igual al drenarlo.
    const r = detectarSueloOrganico(perfil([300, 300, 50, 20, 10, 5]));
    expect(r?.nivel).toBe('organico');
    expect(r?.criterio).toBe('histico_wrb');
    expect(r?.espesor_cm).toBe(15);
  });

  it('el umbral del USDA atrapa lo que WRB pierde por promediar', () => {
    // Es el caso medido de Riau: turbera conocida que a 1 km no llega al 20 %.
    const r = detectarSueloOrganico(perfil([109.7, 149.6, 93.7, 130.4, 145.1, 140.7]));
    expect(r?.nivel).toBe('organico');
    expect(r?.criterio).toBe('organico_usda');
    // 5-15 (10 cm) + 30-60 (30 cm) + 60-100 (40 cm) = 80 cm.
    expect(r?.espesor_cm).toBe(80);
  });

  it('y el aviso del USDA dice que el valor real puede ser mayor', () => {
    // Sin esa frase, un 12 % en una turbera se lee como "poco orgánico".
    const r = detectarSueloOrganico(perfil([109.7, 149.6, 93.7, 130.4, 145.1, 140.7]));
    expect(r?.cautela).toMatch(/valor real puede ser mayor/);
  });
});

describe('los perfiles reales medidos el 26/09/2026', () => {
  it('la cúpula de turba de Kalimantan Central da turba', () => {
    const r = detectarSueloOrganico(perfil([258.8, 348.8, 342.6, 440.5, 453.9, 455.5]));
    expect(r?.nivel).toBe('turba');
    expect(r?.espesor_cm).toBe(100);
    expect(r?.soc_max_pct).toBeCloseTo(45.6, 1);
  });

  it('los Sundarbans no dan nada, y coincide con PEATMAP', () => {
    // PEATMAP da 7 % de turba en esa ecorregión: que el punto medio no caiga
    // sobre ella es el resultado correcto, no un falso negativo.
    expect(detectarSueloOrganico(perfil([54.3, 35.4, 25, 23.1, 22.5, 22.5]))).toBeNull();
  });

  it('la llanura gangética inferior no da nada', () => {
    expect(detectarSueloOrganico(perfil([20.6, 16.4, 9.3, 13.9, 8.4, 8.9]))).toBeNull();
  });

  it('la Pampa no es una turbera', () => {
    // El control que importa: si este test se cae, el umbral está mal por 1,7.
    expect(detectarSueloOrganico(perfil([23, 19.1, 11.6, 6.2, 2.9, 1.3]))).toBeNull();
  });
});

describe('sin dato no se afirma nada', () => {
  it('un perfil todo en cero es NoData, no suelo mineral', () => {
    // La lectura de SoilGrids convierte NoData en 0. Sobre el lago del Tonlé
    // Sap las seis capas vuelven nulas, y sin este guardia saldría "mineral
    // confirmado".
    expect(detectarSueloOrganico(perfil([0, 0, 0, 0, 0, 0]))).toBeNull();
  });

  it('un perfil vacío tampoco rompe', () => {
    expect(detectarSueloOrganico([])).toBeNull();
  });
});

describe('lo que sale a pantalla', () => {
  it('la turba manda a no drenar y trae el hundimiento con su número', () => {
    const r = detectarSueloOrganico(perfil([300, 300, 300, 300, 300, 300]))!;
    expect(r.cautela).toMatch(/No drenar/);
    expect(r.cautela).toMatch(/5 cm por año/);
    expect(r.cautela).toMatch(/oxidación/);
  });

  it('todos los niveles avisan que 1 km promedia y que subestima', () => {
    const casos = [
      perfil([300, 300, 300, 300, 20, 10]),        // turba
      perfil([300, 300, 50, 20, 10, 5]),           // hístico
      perfil([130, 130, 130, 130, 20, 10]),        // USDA
    ];
    for (const p of casos) {
      const r = detectarSueloOrganico(p)!;
      expect(r.detalle).toMatch(/1 km/);
      expect(r.detalle).toMatch(/subestima/);
    }
  });

  it('el porcentaje que imprime es el carbono, con un decimal', () => {
    const r = detectarSueloOrganico(perfil([258.8, 348.8, 342.6, 440.5, 453.9, 455.5]))!;
    expect(r.detalle).toMatch(/45,?\.?6 % de carbono orgánico/);
  });
});
