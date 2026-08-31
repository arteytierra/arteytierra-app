import { describe, it, expect } from 'vitest';
import { perfilSsurgo, grupoHidroSsurgo, type HorizonteSsurgo } from '@/lib/suelos';
import { fuentesNacionalesSuelo } from '@/lib/sueloFuentes';

/**
 * Perfil real devuelto por Soil Data Access para un punto en Iowa: la serie
 * Clarion, componente dominante (85%) de la unidad "Clarion loam, Bemis
 * moraine, 2 to 6 percent slopes". Los valores están tal como vienen de SSURGO
 * salvo Ksat, que en la respuesta viene en µm/s y acá ya está en mm/h.
 */
const CLARION: HorizonteSsurgo[] = [
  { top: 0,  bot: 23,  arcilla: 21, arena: 45, limo: 34, om: 3.5,  densidad_ap: 1.3,  ph: 6.2, ksat: 9.17 * 3.6, cc: 0.286, pmp: 0.145, awc_frac: 0.21 },
  { top: 23, bot: 35,  arcilla: 21, arena: 45, limo: 34, om: 2.5,  densidad_ap: 1.35, ph: 6.2, ksat: 9.17 * 3.6, cc: 0.281, pmp: 0.138, awc_frac: 0.18 },
  { top: 35, bot: 84,  arcilla: 21, arena: 45, limo: 34, om: 0.75, densidad_ap: 1.4,  ph: 6.6, ksat: 9.17 * 3.6, cc: 0.270, pmp: 0.122, awc_frac: 0.18 },
  { top: 84, bot: 200, arcilla: 15, arena: 49, limo: 36, om: 0.25, densidad_ap: 1.6,  ph: 8.0, ksat: 9.17 * 3.6, cc: 0.246, pmp: 0.095, awc_frac: 0.18 },
];

describe('perfilSsurgo', () => {
  it('lleva los horizontes reales a las seis profundidades estándar', () => {
    const p = perfilSsurgo(CLARION);
    expect(p.map(c => c.label)).toEqual(['0-5cm', '5-15cm', '15-30cm', '30-60cm', '60-100cm', '100-200cm']);
    expect(p.map(c => [c.prof_top, c.prof_bot])).toEqual([[0, 5], [5, 15], [15, 30], [30, 60], [60, 100], [100, 200]]);
  });

  it('una capa contenida en un solo horizonte toma sus valores tal cual', () => {
    // 0–5 cm cae entera dentro del Ap (0–23).
    const c = perfilSsurgo(CLARION)[0]!;
    expect(c.arcilla).toBe(21);
    expect(c.ph).toBe(6.2);
    expect(c.awc_frac).toBe(0.21);
  });

  it('una capa a caballo de dos horizontes promedia por cuánto la cruza cada uno', () => {
    // 15–30 cm: 8 cm del Ap (awc .21) y 7 cm del A (awc .18).
    const c = perfilSsurgo(CLARION)[2]!;
    expect(c.awc_frac).toBeCloseTo((0.21 * 8 + 0.18 * 7) / 15, 2);
    // 30–60 cm: 5 cm del A y 25 cm del Bw — el Bw domina.
    const d = perfilSsurgo(CLARION)[3]!;
    expect(d.ph).toBeCloseTo((6.2 * 5 + 6.6 * 25) / 30, 2);
  });

  it('el agua útil de la capa sale del espesor real y no de una fracción suelta', () => {
    const c = perfilSsurgo(CLARION)[0]!;   // 5 cm = 50 mm de espesor
    expect(c.espesor_mm).toBe(50);
    expect(c.awc_mm).toBeCloseTo(0.21 * 50, 1);
  });

  it('convierte materia orgánica a carbono y estima el nitrógeno con C:N ≈ 10', () => {
    const c = perfilSsurgo(CLARION)[0]!;
    expect(c.carbono_org).toBeCloseTo((3.5 / 1.724) * 10, 1);   // g/kg
    expect(c.nitrogeno).toBeCloseTo(c.carbono_org / 10, 1);
  });

  it('omite las capas que el perfil no alcanza en vez de inventarlas', () => {
    const somero: HorizonteSsurgo[] = [{ ...CLARION[0]!, top: 0, bot: 20 }];
    const p = perfilSsurgo(somero);
    expect(p.map(c => c.label)).toEqual(['0-5cm', '5-15cm', '15-30cm']);
  });

  it('un perfil vacío no produce capas', () => {
    expect(perfilSsurgo([])).toEqual([]);
  });
});

describe('grupoHidroSsurgo', () => {
  const perfil = perfilSsurgo(CLARION);

  it('usa la letra oficial de SSURGO y no la derivada de la conductividad', () => {
    const g = grupoHidroSsurgo('B', perfil);
    expect(g.grupo).toBe('B');
    expect(g.cn_pastura).toBe(61);
  });

  it('de un grupo doble toma la condición sin drenar, que es la conservadora', () => {
    expect(grupoHidroSsurgo('B/D', perfil).grupo).toBe('D');
    expect(grupoHidroSsurgo('A/D', perfil).grupo).toBe('D');
  });

  it('sin letra válida cae al grupo derivado del perfil', () => {
    // Ksat de 33 mm/h en todo el perfil: el derivado da C (>3.6 y <=36).
    expect(grupoHidroSsurgo(null, perfil).grupo).toBe('C');
    expect(grupoHidroSsurgo('', perfil).grupo).toBe('C');
  });

  it('informa la capa más limitante dentro del metro', () => {
    const g = grupoHidroSsurgo('B', perfil);
    expect(g.capa_limitante).toMatch(/cm$/);
    expect(g.ksat_min).toBeGreaterThan(0);
  });
});

describe('fuentesNacionalesSuelo', () => {
  it('un punto en Iowa va a SSURGO', () => {
    expect(fuentesNacionalesSuelo(41.9, -93.6)).toEqual(['ssurgo']);
  });

  it('Hawái, Alaska y Puerto Rico también', () => {
    expect(fuentesNacionalesSuelo(20.8, -156.3)).toEqual(['ssurgo']);
    expect(fuentesNacionalesSuelo(64.8, -147.7)).toEqual(['ssurgo']);
    expect(fuentesNacionalesSuelo(18.2, -66.5)).toEqual(['ssurgo']);
  });

  it('fuera de Estados Unidos no hay fuente nacional y queda SoilGrids', () => {
    expect(fuentesNacionalesSuelo(-32.9, -68.8)).toEqual([]);   // Mendoza
    expect(fuentesNacionalesSuelo(40.4, -3.7)).toEqual([]);     // Madrid
    expect(fuentesNacionalesSuelo(19.4, -99.1)).toEqual([]);    // Ciudad de México
  });
});
