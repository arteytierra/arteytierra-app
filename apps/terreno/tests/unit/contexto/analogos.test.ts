import { describe, it, expect } from 'vitest';
import { ANALOGOS_KOPPEN, EQUIVALENTES } from '@/lib/analogos';
import { analogosDeKoppen } from '@/lib/contexto';
import type { Koppen } from '@/lib/clima';

const k = (codigo: string, descripcion = 'clima'): Koppen => ({ codigo, descripcion } as Koppen);

/** Todas las clases que `clasificarKoppen` puede llegar a devolver. */
function clasesPosibles(): string[] {
  const clases = ['Af', 'Am', 'Aw', 'As', 'ET', 'EF'];
  for (const w of ['W', 'S']) for (const t of ['h', 'k']) clases.push(`B${w}${t}`);
  for (const p of ['s', 'w', 'f']) for (const t of ['a', 'b', 'c']) clases.push(`C${p}${t}`);
  for (const p of ['s', 'w', 'f']) for (const t of ['a', 'b', 'c', 'd']) clases.push(`D${p}${t}`);
  return clases;
}

describe('catálogo de análogos', () => {
  it('documenta 21 clases', () => {
    expect(Object.keys(ANALOGOS_KOPPEN)).toHaveLength(21);
  });

  it('la clave de cada ficha coincide con su clase', () => {
    for (const [clave, a] of Object.entries(ANALOGOS_KOPPEN)) expect(a.clase, clave).toBe(clave);
  });

  it('toda ficha trae título, regiones, técnicas y fuentes https', () => {
    for (const a of Object.values(ANALOGOS_KOPPEN)) {
      expect(a.titulo.length, a.clase).toBeGreaterThan(5);
      expect(a.regiones.length, a.clase).toBeGreaterThanOrEqual(3);
      expect(a.tecnicas.length, a.clase).toBeGreaterThanOrEqual(3);
      expect(a.fuentes.length, a.clase).toBeGreaterThan(0);
      for (const f of a.fuentes) {
        expect(f.url, a.clase).toMatch(/^https:\/\//);
        expect(f.label.length, a.clase).toBeGreaterThan(5);
      }
    }
  });

  it('cada equivalente apunta a una clase documentada y no a sí misma', () => {
    for (const [de, a] of Object.entries(EQUIVALENTES)) {
      expect(ANALOGOS_KOPPEN[a], `${de} → ${a}`).toBeDefined();
      expect(de).not.toBe(a);
      expect(ANALOGOS_KOPPEN[de], `${de} no debería estar documentada`).toBeUndefined();
    }
  });
});

describe('analogosDeKoppen', () => {
  it('resuelve toda clase posible menos EF', () => {
    for (const c of clasesPosibles()) {
      const r = analogosDeKoppen(k(c));
      if (c === 'EF') expect(r, c).toBeNull();
      else expect(r, c).not.toBeNull();
    }
  });

  it('el hielo permanente no recibe análogos inventados', () => {
    expect(analogosDeKoppen(k('EF'))).toBeNull();
    expect(analogosDeKoppen(k('Zz'))).toBeNull();
  });

  it('una clase documentada no lleva aviso', () => {
    const r = analogosDeKoppen(k('BSk'))!;
    expect(r.clase).toBe('BSk');
    expect(r.aviso).toBeNull();
    expect(r.titulo).toBe('Semiárido frío');
  });

  it('una clase derivada avisa de qué ficha salió', () => {
    const r = analogosDeKoppen(k('Dwa'))!;
    expect(r.clase).toBe('Dwb');
    expect(r.aviso).toContain('Dwa');
    expect(r.aviso).toContain('Dwb');
  });

  it('las variantes muy frías caen en el subártico', () => {
    for (const c of ['Dfd', 'Dwc', 'Dwd', 'Dsc', 'Dsd']) {
      expect(analogosDeKoppen(k(c))!.clase, c).toBe('Dfc');
    }
  });

  it('el bug histórico está cerrado: Finlandia ya no recibe camellones andinos', () => {
    // Antes, cualquier código que empezara con D o E caía en "Frío de altura /
    // continental" con waru-waru y chuño. Ahora cada régimen tiene lo suyo.
    const finlandia = analogosDeKoppen(k('Dfb'))!;
    const altiplano = analogosDeKoppen(k('ET'))!;
    expect(finlandia.titulo).not.toBe(altiplano.titulo);
    expect(finlandia.tecnicas.join(' ')).not.toMatch(/waru|chuño|camellon/i);
    expect(altiplano.tecnicas.join(' ')).toMatch(/waru/i);
  });

  it('el mediterráneo distingue verano caluroso de verano templado', () => {
    expect(analogosDeKoppen(k('Csa'))!.titulo).not.toBe(analogosDeKoppen(k('Csb'))!.titulo);
  });

  it('el desierto distingue cálido de frío', () => {
    expect(analogosDeKoppen(k('BWh'))!.titulo).toBe('Desértico cálido');
    expect(analogosDeKoppen(k('BWk'))!.titulo).toBe('Desértico frío');
  });
});
