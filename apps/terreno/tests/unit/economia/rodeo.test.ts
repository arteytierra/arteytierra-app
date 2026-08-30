import { describe, it, expect } from 'vitest';
import {
  RODEO_INICIAL, animalDe, cambiarAnimal, demandaMensual_m3, aguaHacienda_l_dia, procedencia,
  type Rodeo,
} from '@/lib/rodeo';
import { TIPOS_ANIMAL } from '@/lib/produccion';

const bovino = TIPOS_ANIMAL.find(a => a.id === 'bovino')!;
const ovino  = TIPOS_ANIMAL.find(a => a.id === 'ovino')!;

describe('rodeo', () => {
  it('arranca con el consumo de tabla del animal por defecto', () => {
    expect(animalDe(RODEO_INICIAL).id).toBe('bovino');
    expect(RODEO_INICIAL.litros_animal_dia).toBe(bovino.agua_l_dia);
  });

  it('suma hacienda y riego en la demanda mensual', () => {
    const r: Rodeo = { ...RODEO_INICIAL, cabezas: 40, litros_animal_dia: 50, riego_m3_mes: 30 };
    expect(aguaHacienda_l_dia(r)).toBe(2000);
    expect(demandaMensual_m3(r)).toBe(90); // 60 m³ de hacienda al mes + 30 de riego
  });

  it('cambiar de animal arrastra su consumo de tabla', () => {
    const r = cambiarAnimal({ ...RODEO_INICIAL }, 'ovino');
    expect(r.animalId).toBe('ovino');
    expect(r.litros_animal_dia).toBe(ovino.agua_l_dia);
  });

  it('pero respeta el consumo que el usuario pisó a mano', () => {
    const propio: Rodeo = { ...RODEO_INICIAL, litros_animal_dia: 65 };
    expect(cambiarAnimal(propio, 'ovino').litros_animal_dia).toBe(65);
  });

  it('un animal inexistente cae en el primero de la tabla sin romper', () => {
    expect(animalDe({ ...RODEO_INICIAL, animalId: 'dragon' }).id).toBe(TIPOS_ANIMAL[0]!.id);
  });

  it('la procedencia distingue lo sugerido de lo declarado', () => {
    expect(procedencia({ ...RODEO_INICIAL, origen: 'receptividad' })).toMatch(/receptividad/i);
    expect(procedencia({ ...RODEO_INICIAL, origen: 'manual' })).toMatch(/a mano/i);
  });
});
