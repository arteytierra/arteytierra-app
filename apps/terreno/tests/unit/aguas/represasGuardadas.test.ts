/**
 * Archivo de represas. Lo que se cuida acá es que «la misma represa» signifique
 * lo que tiene que significar —mismo espejo, mismo muro y el mismo nivel a diez
 * centímetros—, que el orden de comparación sea por eficiencia y no por tamaño,
 * y que un proyecto viejo o corrupto no impida abrir el proyecto.
 */
import { describe, it, expect } from 'vitest';
import {
  crearRepresaGuardada, yaArchivada, resumenRepresa, porEficiencia,
  migrarRepresasGuardadas, type FichaRepresa, type RepresaGuardada,
} from '@/lib/represasGuardadas';
import type { RepresaInputs } from '@/lib/represa';

const INPUTS: RepresaInputs = {
  poligonoId: 'p1', nivel: 112.4, muroIdx: 2, tipoMuro: 'ladera',
  anchoCorona: 3, taludInterno: 2.5, taludExterno: 2, revancha: 0.5,
  longMuro: null, cobertura: 'predio', coef: '0.25', ha: '45', seep: '3',
};

const FICHA: FichaRepresa = {
  nivel_m: 112.4, capacidad_m3: 12_400, area_espejo_m2: 4_800,
  prof_max_m: 4.1, alturaMuro_m: 4.6, largoMuro_m: 84,
  compactado_m3: 2_900, banco_m3: 3_600, eficiencia: 3.44,
  viable: true, perfilUsado: true,
  confiabilidad_pct: 91, cuenca_ha: 45,
};

const crear = (existentes: RepresaGuardada[] = []) =>
  crearRepresaGuardada(INPUTS, FICHA, 'Espejo del bajo', existentes);

describe('crearRepresaGuardada', () => {
  it('conserva los inputs enteros: con eso el cálculo se reproduce', () => {
    expect(crear().inputs).toEqual(INPUTS);
  });

  it('conserva la ficha de resultados que se compara entre candidatos', () => {
    const r = crear();
    expect(r.ficha.capacidad_m3).toBe(12_400);
    expect(r.ficha.eficiencia).toBe(3.44);
    expect(r.ficha.viable).toBe(true);
  });

  it('copia el nombre del polígono, que después puede dejar de existir', () => {
    expect(crear().poligonoNombre).toBe('Espejo del bajo');
  });

  it('numera saltando los nombres tomados', () => {
    const uno = crear();
    expect(uno.nombre).toBe('Represa 1');
    const dos = crear([uno]);
    expect(dos.nombre).toBe('Represa 2');
    // Si la 1 se borró, el hueco se vuelve a usar: no hay "Represa 3" con dos filas.
    expect(crear([dos]).nombre).toBe('Represa 1');
  });

  it('cada una tiene id propio y fecha', () => {
    const a = crear(), b = crear([a]);
    expect(a.id).not.toBe(b.id);
    expect(Number.isFinite(Date.parse(a.creada))).toBe(true);
  });
});

describe('yaArchivada', () => {
  it('reconoce la misma represa: apretar Guardar dos veces no duplica', () => {
    const r = crear();
    expect(yaArchivada(INPUTS, [r])?.id).toBe(r.id);
  });

  it('un paso del deslizador más arriba es OTRO candidato', () => {
    const r = crear();
    expect(yaArchivada({ ...INPUTS, nivel: 112.5 }, [r])).toBeNull();
    // Dentro de medio paso es el mismo: redondear el nivel no tiene que
    // convertir un escenario en dos.
    expect(yaArchivada({ ...INPUTS, nivel: 112.44 }, [r])?.id).toBe(r.id);
  });

  it('el mismo espejo con el muro del otro lado es otro candidato', () => {
    expect(yaArchivada({ ...INPUTS, muroIdx: 3 }, [crear()])).toBeNull();
  });

  it('cambiar la geometría del muro es otro candidato', () => {
    const r = crear();
    expect(yaArchivada({ ...INPUTS, anchoCorona: 4 },  [r])).toBeNull();
    expect(yaArchivada({ ...INPUTS, taludInterno: 3 }, [r])).toBeNull();
    expect(yaArchivada({ ...INPUTS, revancha: 0.3 },   [r])).toBeNull();
  });

  it('otro espejo nunca es la misma represa', () => {
    expect(yaArchivada({ ...INPUTS, poligonoId: 'p2' }, [crear()])).toBeNull();
  });

  it('sin nivel no hay comparación posible y no se da por archivada', () => {
    const r = crear();
    expect(yaArchivada({ ...INPUTS, nivel: null }, [r])).toBeNull();
  });

  it('con el archivo vacío no encuentra nada', () => {
    expect(yaArchivada(INPUTS, [])).toBeNull();
  });
});

describe('resumenRepresa', () => {
  it('dice los tres números con los que se elige: agua, muro y eficiencia', () => {
    const t = resumenRepresa(crear());
    expect(t).toContain('12.400 m³');
    expect(t).toContain('4,6 × 84 m');
    expect(t).toContain('3,44 m³ agua/m³ tierra');
  });
});

describe('porEficiencia', () => {
  const con = (nombre: string, eficiencia: number, viable = true, capacidad_m3 = 1_000): RepresaGuardada =>
    ({ ...crear(), nombre, ficha: { ...FICHA, eficiencia, viable, capacidad_m3 } });

  it('ordena de mayor a menor eficiencia, no por capacidad', () => {
    // La grande embalsa diez veces más agua y rinde la mitad por tierra movida:
    // tiene que quedar segunda, que es exactamente lo que el orden viene a decir.
    const grande  = con('grande', 1.5, true, 90_000);
    const buena   = con('buena',  4.0, true,  9_000);
    expect(porEficiencia([grande, buena]).map(r => r.nombre)).toEqual(['buena', 'grande']);
  });

  it('las no viables van al final por más eficientes que parezcan', () => {
    const noViable = con('no viable', 9.9, false);
    const viable   = con('viable',    1.1, true);
    expect(porEficiencia([noViable, viable]).map(r => r.nombre)).toEqual(['viable', 'no viable']);
  });

  it('no muta la lista que recibe', () => {
    const lista = [con('a', 1), con('b', 5)];
    porEficiencia(lista);
    expect(lista.map(r => r.nombre)).toEqual(['a', 'b']);
  });
});

describe('migrarRepresasGuardadas', () => {
  it('un proyecto sin la clave abre con el archivo vacío', () => {
    expect(migrarRepresasGuardadas(undefined)).toEqual([]);
    expect(migrarRepresasGuardadas(null)).toEqual([]);
  });

  it('lo que no es una lista no tira', () => {
    expect(migrarRepresasGuardadas('represa')).toEqual([]);
    expect(migrarRepresasGuardadas({ id: 'x' })).toEqual([]);
    expect(migrarRepresasGuardadas(42)).toEqual([]);
  });

  it('descarta la fila corrupta y conserva las sanas', () => {
    const sana = crear();
    const salida = migrarRepresasGuardadas([sana, null, { id: 'sin ficha' }, { ficha: {} }]);
    expect(salida).toHaveLength(1);
    expect(salida[0]!.id).toBe(sana.id);
  });

  it('una fila sin capacidad no es una ficha de represa', () => {
    const sana = crear();
    const mocha = { ...sana, ficha: { ...FICHA, capacidad_m3: 'mucha' } };
    expect(migrarRepresasGuardadas([mocha])).toEqual([]);
  });
});
