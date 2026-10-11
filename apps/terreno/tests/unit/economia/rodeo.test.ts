import { describe, it, expect } from 'vitest';
import {
  RODEO_INICIAL, migrarRodeo, demandaMensual_m3, aguaHacienda_l_dia, procedencia,
  evTotal, cabezasTotal, cabezasQuePastorean, evPorCabeza, perfilRodeo,
  pesoVivoTotal_kg, litrosDe, nuevoLote,
  type Rodeo,
} from '@/lib/rodeo';
import { categoriaPorId, mcalEM_dia, CATEGORIAS } from '@/lib/categorias';
import { EV_MCAL_EM_DIA } from '@/lib/produccion';

/** Un rodeo de un solo lote, para los casos simples. */
function unLote(categoriaId: string, cabezas: number, litros: number | null = null): Rodeo {
  return {
    lotes: [{ id: 'l1', categoriaId, cabezas, litros_animal_dia: litros }],
    riego_m3_mes: 0,
    origen: 'manual',
  };
}

describe('rodeo', () => {
  it('arranca con un lote de vacas y el consumo de tabla de la categoría', () => {
    expect(RODEO_INICIAL.lotes).toHaveLength(1);
    const lote = RODEO_INICIAL.lotes[0]!;
    expect(lote.categoriaId).toBe('bovino_vaca_prom');
    expect(lote.litros_animal_dia).toBeNull();
    expect(litrosDe(lote)).toBe(categoriaPorId('bovino_vaca_prom')!.agua_l_dia);
  });

  it('suma hacienda y riego en la demanda mensual', () => {
    const r: Rodeo = { ...unLote('bovino_vaca_prom', 40, 50), riego_m3_mes: 30 };
    expect(aguaHacienda_l_dia(r)).toBe(2000);
    expect(demandaMensual_m3(r)).toBe(90); // 60 m³ de hacienda al mes + 30 de riego
  });

  it('suma los lotes: cabezas, EV, agua y peso vivo', () => {
    const r: Rodeo = {
      lotes: [
        { id: 'a', categoriaId: 'bovino_vaca_cria',       cabezas: 40, litros_animal_dia: null },
        { id: 'b', categoriaId: 'bovino_vaquillona_1_2',  cabezas: 12, litros_animal_dia: null },
        { id: 'c', categoriaId: 'bovino_toro',            cabezas: 2,  litros_animal_dia: null },
      ],
      riego_m3_mes: 0,
      origen: 'manual',
    };
    expect(cabezasTotal(r)).toBe(54);
    // 40 × 1,40 + 12 × 0,70 + 2 × 1,30 = 56 + 8,4 + 2,6 = 67
    expect(evTotal(r)).toBeCloseTo(67, 2);
    // 40 × 60 + 12 × 35 + 2 × 60 = 2400 + 420 + 120
    expect(aguaHacienda_l_dia(r)).toBe(2940);
    // 40 × 400 + 12 × 250 + 2 × 700 = 16000 + 3000 + 1400
    expect(pesoVivoTotal_kg(r)).toBe(20400);
  });

  it('el cerdo toma agua pero no come pasto', () => {
    const r: Rodeo = {
      lotes: [
        { id: 'a', categoriaId: 'bovino_vaca_prom', cabezas: 10, litros_animal_dia: null },
        { id: 'b', categoriaId: 'porcino',          cabezas: 20, litros_animal_dia: null },
      ],
      riego_m3_mes: 0,
      origen: 'manual',
    };
    expect(cabezasTotal(r)).toBe(30);
    expect(cabezasQuePastorean(r)).toBe(10);          // los 20 cerdos no cuentan
    expect(evTotal(r)).toBeCloseTo(10, 2);            // sólo las vacas
    expect(aguaHacienda_l_dia(r)).toBe(10 * 50 + 20 * 20); // pero el agua sí
    // El EV por cabeza se promedia sobre las que pastorean, no sobre las 30:
    // si dividiera por 30 diría que una cabeza de este rodeo pide 0,33 EV y el
    // campo "aguantaría" el triple de animales de los que puede.
    expect(evPorCabeza(r)).toBeCloseTo(1.0, 3);
  });

  it('un rodeo sin animales no divide por cero', () => {
    const vacio: Rodeo = { lotes: [], riego_m3_mes: 0, origen: 'manual' };
    expect(cabezasTotal(vacio)).toBe(0);
    expect(evTotal(vacio)).toBe(0);
    expect(evPorCabeza(vacio)).toBe(1);       // la unidad: una vaca
    expect(perfilRodeo(vacio).agua_l_dia).toBe(0);
    expect(Number.isFinite(evPorCabeza(vacio))).toBe(true);
  });

  it('el litro por cabeza pisado a mano le gana a la tabla', () => {
    const lote = { id: 'l', categoriaId: 'bovino_vaca_prom', cabezas: 1, litros_animal_dia: 77 };
    expect(litrosDe(lote)).toBe(77);
    expect(litrosDe({ ...lote, litros_animal_dia: null })).toBe(50);
  });

  it('la procedencia distingue lo sugerido de lo declarado', () => {
    const manual = unLote('bovino_vaca_prom', 40);
    expect(procedencia(manual)).toContain('cargadas a mano');
    expect(procedencia({ ...manual, origen: 'receptividad' })).toContain('receptividad');
  });

  it('nuevoLote da ids distintos', () => {
    const a = nuevoLote(), b = nuevoLote();
    expect(a.id).not.toBe(b.id);
  });
});

/**
 * El caso resuelto de la fuente.
 *
 * Cocimano, Lange y Menvielle (1975), recopilado por Bavera (2006), trae el
 * ejemplo de un rodeo de cría de 100 vientres y calcula su carga: partiendo de
 * 100 vacas en servicio con 90% de preñez quedan 77 vacas en el rodeo, 23
 * vaquillonas de 2 a 3 años, 24 de 1 a 2, 24 terneras y 4 toros, más 20 vacas de
 * refugo que se quedan 2 meses. El resultado publicado es **1,28 EV por vientre**.
 *
 * Es el test que vale: si los coeficientes de `categorias.ts` están bien, esta
 * suma tiene que dar lo que dice el paper. Un test que sólo verifique que la
 * función devuelve un número no protege de nada.
 */
describe('el caso resuelto de AACREA: 100 vientres son 128 EV', () => {
  it('reproduce la carga publicada de 1,28 EV por vientre', () => {
    const r: Rodeo = {
      lotes: [
        { id: 'toros',       categoriaId: 'bovino_toro',             cabezas: 4,  litros_animal_dia: null },
        { id: 'vacas',       categoriaId: 'bovino_vaca_prom',        cabezas: 77, litros_animal_dia: null },
        { id: 'vaq_2_3',     categoriaId: 'bovino_vaquillona_2_3',   cabezas: 23, litros_animal_dia: null },
        { id: 'vaq_1_2',     categoriaId: 'bovino_vaquillona_1_2',   cabezas: 24, litros_animal_dia: null },
      ],
      riego_m3_mes: 0,
      origen: 'manual',
    };

    // Las terneras están sólo 6 de los 12 meses en esa categoría y las 20 vacas
    // de refugo un promedio de 2 meses, así que la fuente las pondera por tiempo.
    // Esa ponderación no es parte del rodeo (que es una foto, no un año), así que
    // se agrega acá a mano, igual que en el paper.
    const terneras = 24 * (6 / 12) * categoriaPorId('bovino_ternero')!.ev!;
    const refugo   = 20 * (2 / 12) * categoriaPorId('bovino_vaca_prom')!.ev!;

    const evAnual = evTotal(r) + terneras + refugo;

    // El paper redondea cada término a dos decimales y suma 1,276 ≈ 1,28.
    expect(evAnual / 100).toBeCloseTo(1.28, 2);
    expect(Math.round(evAnual)).toBe(128);
  });

  it('los cuatro coeficientes son los de la tabla simplificada', () => {
    expect(categoriaPorId('bovino_vaca_prom')!.ev).toBe(1.00);
    expect(categoriaPorId('bovino_vaquillona_2_3')!.ev).toBe(0.80);
    expect(categoriaPorId('bovino_vaquillona_1_2')!.ev).toBe(0.70);
    expect(categoriaPorId('bovino_ternero')!.ev).toBe(0.60);
    expect(categoriaPorId('bovino_toro')!.ev).toBe(1.30);
  });

  it('una vaca con cría al pie come 2,3 veces lo de una vaca seca', () => {
    const cria = categoriaPorId('bovino_vaca_cria')!.ev!;
    const seca = categoriaPorId('bovino_vaca_seca')!.ev!;
    expect(cria).toBe(1.40);
    expect(seca).toBe(0.60);
    expect(cria / seca).toBeCloseTo(2.33, 2);
    // Y el promedio de los dos semestres es la definición de 1 EV.
    expect((cria + seca) / 2).toBeCloseTo(1.0, 2);
  });
});

describe('categorias', () => {
  it('las Mcal se derivan del EV y no se declaran aparte', () => {
    const vaca = categoriaPorId('bovino_vaca_prom')!;
    expect(mcalEM_dia(vaca)).toBeCloseTo(EV_MCAL_EM_DIA, 6);
    const toro = categoriaPorId('bovino_toro')!;
    expect(mcalEM_dia(toro)).toBeCloseTo(1.3 * EV_MCAL_EM_DIA, 6);
  });

  it('el porcino no tiene EV y lo dice', () => {
    const p = categoriaPorId('porcino')!;
    expect(p.ev).toBeNull();
    expect(mcalEM_dia(p)).toBeNull();
    expect(p.nota).toMatch(/no pastorea|casi no pastorea/);
  });

  it('toda categoría declara su fuente y ninguna queda sin peso vivo', () => {
    for (const c of CATEGORIAS) {
      expect(c.fuente.length, c.id).toBeGreaterThan(10);
      expect(c.pesoVivo_kg, c.id).toBeGreaterThan(0);
      expect(c.agua_l_dia, c.id).toBeGreaterThan(0);
    }
  });

  it('las dos categorías sin fuente publicada lo admiten en el texto', () => {
    for (const id of ['caprino', 'porcino']) {
      expect(categoriaPorId(id)!.fuente).toMatch(/[Ss]in fuente publicada/);
    }
  });

  it('los ids son únicos', () => {
    const ids = CATEGORIAS.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

/**
 * La migración.
 *
 * Romper un proyecto guardado es la peor forma de arreglar un cálculo, así que
 * esto se prueba con la forma vieja literal, tal como quedó serializada en la
 * base: `animalId` + `cabezas` + `litros_animal_dia`.
 */
describe('migrar un rodeo guardado con la forma vieja', () => {
  it('un rodeo de bovinos adultos se lee como un lote de vacas', () => {
    const viejo = { animalId: 'bovino', cabezas: 62, litros_animal_dia: 50, riego_m3_mes: 15, origen: 'receptividad' };
    const r = migrarRodeo(viejo);
    expect(r.lotes).toHaveLength(1);
    expect(r.lotes[0]!.categoriaId).toBe('bovino_vaca_prom');
    expect(r.lotes[0]!.cabezas).toBe(62);
    expect(r.riego_m3_mes).toBe(15);
    expect(r.origen).toBe('receptividad');
    // El EV no se mueve: la fila vieja «Bovinos adultos» también era 1,00.
    expect(evTotal(r)).toBeCloseTo(62, 2);
  });

  it('conserva el consumo de agua que el usuario tenía escrito', () => {
    // Lo que esta migración corrige es el coeficiente de pasto, no el agua
    // declarada: si el productor había puesto 80 L por cabeza, siguen siendo 80.
    const r = migrarRodeo({ animalId: 'bovino', cabezas: 10, litros_animal_dia: 80 });
    expect(r.lotes[0]!.litros_animal_dia).toBe(80);
    expect(aguaHacienda_l_dia(r)).toBe(800);
  });

  it('mapea las seis filas viejas sin perder ninguna', () => {
    const esperado: Record<string, string> = {
      bovino:   'bovino_vaca_prom',
      bovino_j: 'bovino_ternero',
      equino:   'equino_adulto',
      ovino:    'ovino_oveja',
      caprino:  'caprino',
      porcino:  'porcino',
    };
    for (const [viejo, nuevo] of Object.entries(esperado)) {
      const r = migrarRodeo({ animalId: viejo, cabezas: 5 });
      expect(r.lotes[0]!.categoriaId, viejo).toBe(nuevo);
      expect(categoriaPorId(r.lotes[0]!.categoriaId), viejo).not.toBeNull();
    }
  });

  it('un animalId desconocido no rompe el proyecto', () => {
    const r = migrarRodeo({ animalId: 'llama', cabezas: 7 });
    expect(r.lotes[0]!.categoriaId).toBe('bovino_vaca_prom');
    expect(r.lotes[0]!.cabezas).toBe(7);
  });

  it('la forma nueva pasa derecho y sanea lo que venga mal', () => {
    const r = migrarRodeo({
      lotes: [
        { id: 'a', categoriaId: 'bovino_toro', cabezas: 3, litros_animal_dia: null },
        { id: '',  categoriaId: 'inexistente', cabezas: -5, litros_animal_dia: 'x' },
      ],
      riego_m3_mes: 20,
      origen: 'manual',
    });
    expect(r.lotes).toHaveLength(2);
    expect(r.lotes[0]!.categoriaId).toBe('bovino_toro');
    expect(r.lotes[1]!.categoriaId).toBe('bovino_vaca_prom');  // el id inválido cae a la vaca
    expect(r.lotes[1]!.cabezas).toBe(0);                        // las cabezas negativas se acotan
    expect(r.lotes[1]!.litros_animal_dia).toBeNull();           // el litro no numérico se descarta
    expect(r.lotes[1]!.id).not.toBe('');                        // y el id vacío se repone
  });

  it('ante basura devuelve el rodeo inicial en vez de tirar', () => {
    for (const basura of [null, undefined, 0, 'rodeo', [], {}, { lotes: [] }]) {
      const r = migrarRodeo(basura);
      expect(r.lotes.length).toBeGreaterThan(0);
      expect(categoriaPorId(r.lotes[0]!.categoriaId)).not.toBeNull();
    }
  });
});
