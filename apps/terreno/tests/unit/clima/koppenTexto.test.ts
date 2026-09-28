import { describe, it, expect } from 'vitest';
import { textoKoppen, rotuloKoppen, CODIGOS_KOPPEN } from '@/lib/koppenTexto';
import { clasificarKoppen, type MesDato } from '@/lib/clima';

/**
 * Todas las clases que `clasificarKoppen` puede llegar a devolver. Es la misma
 * enumeración que usa `tests/unit/contexto/analogos.test.ts`: si alguna vez el
 * clasificador aprende una clase nueva, los dos tests fallan juntos.
 */
function clasesPosibles(): string[] {
  const clases = ['Af', 'Am', 'Aw', 'As', 'ET', 'EF'];
  for (const w of ['W', 'S']) for (const t of ['h', 'k']) clases.push(`B${w}${t}`);
  for (const p of ['s', 'w', 'f']) for (const t of ['a', 'b', 'c']) clases.push(`C${p}${t}`);
  for (const p of ['s', 'w', 'f']) for (const t of ['a', 'b', 'c', 'd']) clases.push(`D${p}${t}`);
  return clases;
}

/** 12 meses con la temperatura de cada uno y una lluvia pareja. */
function meses(tmean: number[], precip_mm = 100): MesDato[] {
  return tmean.map((t, i) => ({
    mes: `M${i + 1}`,
    precip_mm,
    tmax_c: t + 6,
    tmin_c: t - 6,
    tmean_c: t,
    etp_mm: 0,
    balance_mm: precip_mm,
    viento_ms: 2,
  }));
}

describe('cobertura: ninguna clase se queda sin texto', () => {
  it('las 31 clases que el clasificador puede devolver tienen descripción', () => {
    const posibles = clasesPosibles();
    expect(posibles).toHaveLength(31);
    expect(new Set(CODIGOS_KOPPEN)).toEqual(new Set(posibles));

    for (const c of posibles) {
      const t = textoKoppen(c);
      expect(t, c).not.toBeNull();
      expect(t!.titulo.length, c).toBeGreaterThan(5);
      expect(t!.grupo, c).not.toBe('—');
      // Cada letra del código aporta una frase: nunca alcanza con el grupo solo.
      expect(t!.criterios.length, c).toBeGreaterThanOrEqual(2);
      expect(t!.prosa.length, c).toBeGreaterThan(120);
      expect(t!.prosa.trim().endsWith('.'), c).toBe(true);
    }
  });

  it('la primera letra decide el grupo, para las 31', () => {
    const esperado: Record<string, string> = {
      A: 'Tropical', B: 'Árido', C: 'Templado', D: 'Continental', E: 'Polar',
    };
    for (const c of CODIGOS_KOPPEN) {
      expect(textoKoppen(c)!.grupo, c).toBe(esperado[c[0]!]);
    }
  });

  it('las cinco clases de invierno riguroso ya no salen como un guión', () => {
    // Estaban en el mapa de Beck y no en la tabla de clima.ts, así que el
    // clasificador las devolvía con grupo «—» y el código como descripción.
    for (const c of ['Dsc', 'Dsd', 'Dwc', 'Dwd', 'Dfd']) {
      expect(rotuloKoppen(c).grupo, c).toBe('Continental');
      expect(rotuloKoppen(c).titulo, c).not.toBe(c);
    }
  });
});

describe('el texto dice lo que la clase define, no otra cosa', () => {
  it('Cwa: templado, invierno seco, verano caluroso', () => {
    // La clase del oriente subtropical: llueve en verano y el verano es caluroso.
    const t = textoKoppen('Cwa')!;
    expect(t.prosa).toMatch(/Clima templado/);
    expect(t.prosa).toMatch(/Invierno seco/);
    expect(t.prosa).toMatch(/22 °C/);
    expect(t.prosa).toMatch(/décima parte/);
  });

  it('BWh: desierto, y el umbral de aridez no es una cifra fija de lluvia', () => {
    const t = textoKoppen('BWh')!;
    expect(t.prosa).toMatch(/Clima árido/);
    expect(t.prosa).toMatch(/Desierto/);
    expect(t.prosa).toMatch(/18 °C/);
    // Lo que más se malentiende de la B: no hay un número de milímetros que
    // separe árido de húmedo, depende de la temperatura y de cuándo llueve.
    expect(t.prosa).toMatch(/umbral/);
  });

  it('las dos polares se describen enteras en una frase', () => {
    expect(textoKoppen('ET')!.prosa).toMatch(/Tundra/);
    expect(textoKoppen('ET')!.prosa).toMatch(/entre 0 y 10 °C/);
    expect(textoKoppen('EF')!.prosa).toMatch(/Hielo permanente/);
  });

  it('se compone por letra: lo que comparten dos códigos lo dicen igual', () => {
    // Misma primera letra → misma frase de régimen térmico.
    const [cwa, cfa] = [textoKoppen('Cwa')!, textoKoppen('Cfa')!];
    expect(cwa.criterios[0]).toBe(cfa.criterios[0]);
    // Misma segunda letra → misma frase de estación seca, aunque el grupo
    // cambie de templado a continental.
    expect(textoKoppen('Cwb')!.criterios[1]).toBe(textoKoppen('Dwb')!.criterios[1]);
    // Misma tercera → mismo verano.
    expect(textoKoppen('Csa')!.criterios[2]).toBe(textoKoppen('Cfa')!.criterios[2]);
  });

  it('un código que no existe no inventa una descripción', () => {
    expect(textoKoppen('Zz')).toBeNull();
    expect(textoKoppen('')).toBeNull();
    expect(textoKoppen(null)).toBeNull();
    expect(textoKoppen(undefined)).toBeNull();
  });
});

describe('el texto y el clasificador dicen el mismo umbral', () => {
  /**
   * La tercera letra `a` es «el mes más cálido supera los 22 °C» (Peel et al.
   * 2007, tabla 1). El clasificador usaba 21 y el texto habría dicho 22: un
   * verano de 21,5 °C salía rotulado «verano cálido» sin serlo.
   */
  const ONDULADO = (pico: number) => [
    pico, pico, 18, 14, 10, 6, 5, 6, 10, 14, 18, pico,
  ];

  it('un verano de 21,5 °C es templado (b), no caluroso (a)', () => {
    const k = clasificarKoppen(-34, meses(ONDULADO(21.5)));
    expect(k.codigo).toBe('Cfb');
    expect(textoKoppen(k.codigo)!.prosa).toMatch(/Verano templado/);
  });

  it('un verano de 22,5 °C sí es caluroso (a)', () => {
    const k = clasificarKoppen(-34, meses(ONDULADO(22.5)));
    expect(k.codigo).toBe('Cfa');
    expect(textoKoppen(k.codigo)!.prosa).toMatch(/Verano caluroso/);
  });

  it('el rótulo que muestra el panel sale de la misma tabla que el texto', () => {
    const k = clasificarKoppen(-34, meses(ONDULADO(22.5)));
    expect(k.descripcion).toBe(textoKoppen(k.codigo)!.titulo);
    expect(k.grupo).toBe(textoKoppen(k.codigo)!.grupo);
  });
});
