/**
 * Ficha del clima futuro.
 *
 * Lo que importa fijar acá es la honestidad del bloque, no los textos: que el
 * desfasaje de horizonte y las tres advertencias estén SIEMPRE —incluso cuando
 * la clase no cambia, que es cuando más tentador sería omitirlas—, que los
 * análogos que muestra sean los de la clase futura y no los de hoy, y que sin
 * clase futura la sección no aparezca en vez de aparecer vacía.
 */
import { describe, it, expect } from 'vitest';
import { fichaClimaFuturo } from '@/lib/climaFuturo';
import type { Koppen, DerivaClima } from '@/lib/clima';

const K = (codigo: string, grupo = 'X', descripcion = 'clase de prueba'): Koppen =>
  ({ codigo, grupo, descripcion });

const deriva = (futuro: Koppen | null, queCambia: string | null = null): DerivaClima => ({
  pasado: K('Cfa'), futuro,
  yaCambio: false, vaACambiar: !!futuro && futuro.codigo !== 'Cfa', queCambia,
  etiquetas: { pasado: '1961-1990', presente: '1991-2020', futuro: '2071-2099 (SSP2-4.5)' },
});

describe('fichaClimaFuturo', () => {
  it('sin clase futura no arma ficha: la sección no aparece', () => {
    expect(fichaClimaFuturo(K('Cfa'), deriva(null))).toBeNull();
    expect(fichaClimaFuturo(K('Cfa'), null)).toBeNull();
    expect(fichaClimaFuturo(null, deriva(K('BSk')))).toBeNull();
  });

  it('la clase que no cambia igual produce ficha, marcada como estable', () => {
    const f = fichaClimaFuturo(K('Cfa'), deriva(K('Cfa')))!;
    expect(f.estable).toBe(true);
    expect(f.consecuencias).toEqual([]);
  });

  it('el desfasaje de horizonte y las tres advertencias van siempre', () => {
    for (const clase of ['Cfa', 'BSk']) {
      const f = fichaClimaFuturo(K('Cfa'), deriva(K(clase)))!;
      expect(f.horizonte).toContain('2071-2099');
      expect(f.horizonte).toContain('dirección');
      expect(f.advertencias).toHaveLength(3);
      expect(f.advertencias.join(' ')).toContain('escenario');
      expect(f.advertencias.join(' ')).toContain('1 km');
    }
  });

  it('cambiar de grupo manda rediseñar el agua, no la lista de plantas', () => {
    const f = fichaClimaFuturo(K('Cfa'), deriva(K('BSk')))!;
    expect(f.estable).toBe(false);
    expect(f.consecuencias[0]).toContain('régimen de fondo');
    expect(f.consecuencias.join(' ')).toContain('árido');
  });

  it('cambiar la estación de lluvias corre el calendario', () => {
    const f = fichaClimaFuturo(K('Cfa'), deriva(K('Csa')))!;
    expect(f.consecuencias[0]).toContain('estación de las lluvias');
    expect(f.consecuencias.join(' ')).toContain('verano');
  });

  it('cambiar sólo el rigor térmico revisa especies, no el sistema', () => {
    const f = fichaClimaFuturo(K('Cfb'), deriva(K('Cfa')))!;
    expect(f.consecuencias[0]).toContain('rigor térmico');
    expect(f.consecuencias[0]).not.toContain('régimen de fondo');
  });

  it('cualquier cambio recuerda que lo perenne se elige con el clima futuro', () => {
    const f = fichaClimaFuturo(K('Cfa'), deriva(K('BSk')))!;
    expect(f.consecuencias[f.consecuencias.length - 1]).toContain('décadas');
  });

  it('los análogos son los de la clase FUTURA, no los de hoy', () => {
    // Csb tiene ficha propia de análogos; Cfb también. Pedimos el salto y
    // verificamos que la ficha devuelta sea la del destino.
    const f = fichaClimaFuturo(K('Cfb'), deriva(K('Csb')))!;
    expect(f.analogos).not.toBeNull();
    expect(f.analogos!.clase).toBe('Csb');
  });

  it('una clase sin ficha propia cae a la equivalente y lo avisa', () => {
    const f = fichaClimaFuturo(K('Cfb'), deriva(K('Csc')))!;
    expect(f.analogos!.clase).toBe('Csb');
    expect(f.analogos!.aviso).toContain('Csc');
  });

  it('un destino sin análogos posibles deja el resto de la ficha en pie', () => {
    // EF, hielo permanente: no hay sistema agrícola análogo y no se inventa.
    const f = fichaClimaFuturo(K('ET'), deriva(K('EF')))!;
    expect(f.analogos).toBeNull();
    expect(f.advertencias).toHaveLength(3);
    expect(f.consecuencias.length).toBeGreaterThan(0);
  });
});
