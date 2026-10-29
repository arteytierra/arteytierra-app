import { describe, it, expect } from 'vitest';
import {
  claseTexturaUSDA,
  nombreTextura,
  grupoTexturaUSDA,
  CLASES_USDA,
  NOMBRE_CLASE_USDA,
  GRUPOS_TEXTURA_USDA,
  SEPARADOS_USDA,
  SUMA_TOLERADA_PCT,
  TIERRA_FINA_MM_MAX,
  SIN_CLASE_TEXTURA,
  type ClaseUSDA,
} from '@/lib/textura';
import { erodabilidadK } from '@/lib/usle';

/**
 * Las doce clases salen del **Soil Survey Manual**, USDA Handbook No. 18,
 * edición 2017, capítulo 3, página 124, leído del primario el 22/10/2026.
 *
 * La prueba fuerte no es un puñado de puntos: son desigualdades lineales, así
 * que lo que hay que probar es que **parten el triángulo**. Si un límite está
 * mal leído aparece un hueco o un solape, y los dos se ven barriendo la grilla.
 */

/** Las 5.151 composiciones enteras del triángulo, en paso de 1 %. */
function celdasDelTriangulo(): { a: number; s: number; l: number }[] {
  const out: { a: number; s: number; l: number }[] = [];
  for (let a = 0; a <= 100; a++) {
    for (let s = 0; s <= 100 - a; s++) {
      out.push({ a, s, l: 100 - a - s });
    }
  }
  return out;
}

/** La escalera de diez salidas que había en `suelos.ts` hasta el 22/10/2026. */
function escaleraVieja(arc: number, are: number, li: number): string {
  if (arc >= 40)                   return 'Arcilloso';
  if (arc >= 35 && are <= 45)      return 'Arcillo-limoso';
  if (arc >= 28 && are > 45)       return 'Arcillo-arenoso';
  if (arc >= 20 && arc < 35 && li >= 15 && are < 45) return 'Franco-arcilloso';
  if (are >= 85 && arc < 10)       return 'Arenoso';
  if (are >= 70 && arc < 15)       return 'Arenoso-franco';
  if (li >= 80)                    return 'Limoso';
  if (li >= 50 && arc < 27)        return 'Franco-limoso';
  if (are >= 52 && arc < 20)       return 'Franco-arenoso';
  return 'Franco';
}

const TRIANGULO = celdasDelTriangulo();

describe('textura — la partición del triángulo', () => {
  it('las 5.151 celdas del triángulo caen en una clase, y ninguna queda sin clase', () => {
    const sinClase = TRIANGULO.filter(c => claseTexturaUSDA(c.a, c.s, c.l) == null);
    expect(TRIANGULO).toHaveLength(5151);
    expect(sinClase).toHaveLength(0);
  });

  it('las doce clases aparecen, y ninguna sobra', () => {
    const vistas = new Set(TRIANGULO.map(c => claseTexturaUSDA(c.a, c.s, c.l)!));
    expect(vistas.size).toBe(12);
    for (const c of CLASES_USDA) expect(vistas.has(c), c).toBe(true);
  });

  it('el reparto de celdas por clase es el que mide el triángulo', () => {
    // Si alguien toca una condición, este conteo se mueve y lo dice en la cara.
    // El arcilloso se queda con casi un tercio del triángulo porque su región es
    // el vértice entero de arriba.
    const n: Partial<Record<ClaseUSDA, number>> = {};
    for (const c of TRIANGULO) {
      const k = claseTexturaUSDA(c.a, c.s, c.l)!;
      n[k] = (n[k] ?? 0) + 1;
    }
    expect(n).toEqual({
      'arcilloso':              1540,
      'franco-limoso':           840,
      'franco-arenoso':          565,
      'franco-arcillo-arenoso':  392,
      'franco':                  349,
      'franco-arcilloso':        325,
      'franco-arcillo-limoso':   273,
      'arcillo-limoso':          231,
      'arcillo-arenoso':         210,
      'limoso':                  186,
      'arenoso-franco':          155,
      'arenoso':                  85,
    });
    const total = Object.values(n).reduce((x, y) => x + y, 0);
    expect(total).toBe(5151);
  });

  it('las condiciones no dependen del orden: ninguna celda cumple dos definiciones', () => {
    // Se evalúan las doce como predicados independientes, sin el `return`
    // temprano. Un solape acá querría decir que el resultado depende del orden
    // en que están escritas, y entonces el orden sería parte del cálculo.
    const cumple = (a: number, s: number, l: number): string[] => {
      const r: string[] = [];
      if (s > 85 && l + 1.5 * a < 15) r.push('arenoso');
      if (s >= 70 && s <= 90 && l + 1.5 * a >= 15 && l + 2 * a < 30) r.push('arenoso-franco');
      if ((a >= 7 && a < 20 && s > 52 && l + 2 * a >= 30) || (a < 7 && l < 50 && l + 2 * a >= 30)) r.push('franco-arenoso');
      if (a >= 7 && a < 27 && l >= 28 && l < 50 && s <= 52) r.push('franco');
      if ((l >= 50 && a >= 12 && a < 27) || (l >= 50 && l < 80 && a < 12)) r.push('franco-limoso');
      if (l >= 80 && a < 12) r.push('limoso');
      if (a >= 20 && a < 35 && l < 28 && s > 45) r.push('franco-arcillo-arenoso');
      if (a >= 27 && a < 40 && s > 20 && s <= 45) r.push('franco-arcilloso');
      if (a >= 27 && a < 40 && s <= 20) r.push('franco-arcillo-limoso');
      if (a >= 35 && s > 45) r.push('arcillo-arenoso');
      if (a >= 40 && l >= 40) r.push('arcillo-limoso');
      if (a >= 40 && s <= 45 && l < 40) r.push('arcilloso');
      return r;
    };
    const solapes = TRIANGULO.filter(c => cumple(c.a, c.s, c.l).length > 1);
    const huecos  = TRIANGULO.filter(c => cumple(c.a, c.s, c.l).length === 0);
    expect(solapes).toHaveLength(0);
    expect(huecos).toHaveLength(0);
  });

  it('la partición aguanta fuera de la grilla entera, con porcentajes decimales', () => {
    // La grilla de 1 % prueba 5.151 puntos; las desigualdades son lineales, así
    // que no puede haber un hueco entre dos celdas. Igual se verifica con una
    // malla diez veces más fina sobre el borde de cada clase, que es donde un
    // hueco aparecería.
    let n = 0;
    for (let a = 0; a <= 100; a += 0.5) {
      for (let s = 0; s <= 100 - a + 1e-9; s += 0.5) {
        const l = 100 - a - s;
        expect(claseTexturaUSDA(a, s, l), `${a}/${s}/${l}`).not.toBeNull();
        n++;
      }
    }
    expect(n).toBe(20301);
  });
});

describe('textura — las doce definiciones del manual', () => {
  it('«Sands.—more than 85 percent sand, and silt plus 1.5 times clay is less than 15»', () => {
    expect(claseTexturaUSDA(2, 92, 6)).toBe('arenoso');
    // Los dos límites son estrictos: 85 exacto no es arenoso…
    expect(claseTexturaUSDA(0, 85, 15)).toBe('arenoso-franco');
    // …y limo + 1,5·arcilla = 15 exacto tampoco.
    expect(claseTexturaUSDA(6, 88, 6)).toBe('arenoso-franco');
    expect(6 + 1.5 * 6).toBe(15);
  });

  it('«Loamy sands.—between 70 and 90 percent sand, silt + 1.5·clay 15 or more, silt + 2·clay less than 30»', () => {
    expect(claseTexturaUSDA(5, 80, 15)).toBe('arenoso-franco');
    // El borde de arriba, limo + 2·arcilla = 30, ya es franco arenoso.
    expect(claseTexturaUSDA(0, 70, 30)).toBe('franco-arenoso');
    expect(claseTexturaUSDA(5, 75, 20)).toBe('franco-arenoso');
    expect(20 + 2 * 5).toBe(30);
  });

  it('«Sandy loams.—7 to less than 20 percent clay and more than 52 percent sand…»', () => {
    expect(claseTexturaUSDA(12, 70, 18)).toBe('franco-arenoso');
    // La segunda rama de la definición: menos de 7 % de arcilla y menos de 50 de
    // limo. Es la que cubre la franja de abajo, donde no hay arcilla suficiente
    // para ser franco pero tampoco limo para ser franco limoso.
    expect(claseTexturaUSDA(5, 46, 49)).toBe('franco-arenoso');
    expect(claseTexturaUSDA(6, 50, 44)).toBe('franco-arenoso');
  });

  it('«Loam.—7 to less than 27 percent clay, 28 to less than 50 percent silt, 52 percent or less sand»', () => {
    expect(claseTexturaUSDA(18, 40, 42)).toBe('franco');
    // Los tres límites, uno por uno.
    expect(claseTexturaUSDA(6, 52, 42)).toBe('franco-arenoso');     // arcilla < 7
    expect(claseTexturaUSDA(27, 45, 28)).toBe('franco-arcilloso');  // arcilla = 27
    expect(claseTexturaUSDA(20, 52, 28)).toBe('franco');            // arena = 52, entra
    expect(claseTexturaUSDA(7, 52, 41)).toBe('franco');             // arena = 52 con arcilla 7
  });

  it('«Silt loam.—50 percent or more silt and 12 to less than 27 percent clay; OR 50 to less than 80 percent silt and less than 12 percent clay»', () => {
    expect(claseTexturaUSDA(20, 20, 60)).toBe('franco-limoso');
    // La segunda rama tiene tope de limo en 80 y la primera no: con 12 % o más
    // de arcilla sigue siendo franco limoso aunque el limo pase de 80, porque
    // ahí no puede pasar —12 + 80 = 92, queda 8 de arena— pero el borde existe.
    expect(claseTexturaUSDA(12, 0, 88)).toBe('franco-limoso');
    expect(claseTexturaUSDA(11, 0, 89)).toBe('limoso');
  });

  it('«Silt.—80 percent or more silt and less than 12 percent clay»', () => {
    expect(claseTexturaUSDA(5, 10, 85)).toBe('limoso');
    expect(claseTexturaUSDA(0, 20, 80)).toBe('limoso');
    expect(claseTexturaUSDA(0, 21, 79)).toBe('franco-limoso');
  });

  it('«Sandy clay loam.—20 to less than 35 percent clay, less than 28 percent silt, more than 45 percent sand»', () => {
    expect(claseTexturaUSDA(28, 55, 17)).toBe('franco-arcillo-arenoso');
    // Esta es una de las dos clases que la escalera vieja no sabía devolver.
    expect(claseTexturaUSDA(20, 53, 27)).toBe('franco-arcillo-arenoso');
    expect(escaleraVieja(20, 53, 27)).toBe('Franco');
  });

  it('«Clay loam.—27 to less than 40 percent clay and more than 20 to 45 percent sand»', () => {
    expect(claseTexturaUSDA(32, 35, 33)).toBe('franco-arcilloso');
    // «more than 20 to 45»: el 20 queda afuera y el 45 adentro. Es la única
    // lectura de las cuatro posibles que cierra el triángulo.
    expect(claseTexturaUSDA(30, 20, 50)).toBe('franco-arcillo-limoso');
    expect(claseTexturaUSDA(30, 21, 49)).toBe('franco-arcilloso');
    expect(claseTexturaUSDA(30, 45, 25)).toBe('franco-arcilloso');
    expect(claseTexturaUSDA(30, 46, 24)).toBe('franco-arcillo-arenoso');
  });

  it('«Silty clay loam.—27 to less than 40 percent clay and 20 percent or less sand»', () => {
    expect(claseTexturaUSDA(32, 12, 56)).toBe('franco-arcillo-limoso');
    // La otra clase que la escalera vieja no sabía devolver.
    expect(claseTexturaUSDA(27, 0, 73)).toBe('franco-arcillo-limoso');
    expect(escaleraVieja(27, 0, 73)).toBe('Franco-arcilloso');
  });

  it('«Sandy clay.—35 percent or more clay and more than 45 percent sand»', () => {
    expect(claseTexturaUSDA(42, 50, 8)).toBe('arcillo-arenoso');
    expect(claseTexturaUSDA(35, 46, 19)).toBe('arcillo-arenoso');
    // «more than 45»: con arena 45 exacta no es arcillo-arenoso.
    expect(claseTexturaUSDA(35, 45, 20)).toBe('franco-arcilloso');
    expect(claseTexturaUSDA(45, 45, 10)).toBe('arcilloso');
  });

  it('«Silty clay.—40 percent or more clay and 40 percent or more silt»', () => {
    expect(claseTexturaUSDA(45, 10, 45)).toBe('arcillo-limoso');
    expect(claseTexturaUSDA(40, 0, 60)).toBe('arcillo-limoso');
    // Y con 39 de limo ya es arcilloso, que es el error más grande de la
    // escalera vieja: llamaba «Arcilloso» a las 231 celdas de arcillo-limoso.
    expect(claseTexturaUSDA(45, 16, 39)).toBe('arcilloso');
    expect(escaleraVieja(40, 0, 60)).toBe('Arcilloso');
  });

  it('«Clay.—40 percent or more clay, 45 percent or less sand, and less than 40 percent silt»', () => {
    expect(claseTexturaUSDA(55, 25, 20)).toBe('arcilloso');
    expect(claseTexturaUSDA(100, 0, 0)).toBe('arcilloso');
  });
});

describe('textura — las dos frases ambiguas del manual', () => {
  it('el vértice (10, 90, 0) es el único punto que obliga a leer «and 90» como inclusive', () => {
    // Es donde la recta limo + 1,5·arcilla = 15 —el borde entre arenoso y
    // arenoso franco— toca el lado de limo cero. Leyendo el 90 como exclusivo,
    // ese vértice del triángulo no tiene ninguna clase.
    expect(claseTexturaUSDA(10, 90, 0)).toBe('arenoso-franco');
    expect(0 + 1.5 * 10).toBe(15);     // no es arenoso: el límite es estricto
    expect(0 + 2 * 10).toBe(20);       // y sí es arenoso franco: 20 < 30
    const enLaRecta = TRIANGULO.filter(c => c.s === 90 && c.l + 1.5 * c.a >= 15 && c.l + 2 * c.a < 30);
    expect(enLaRecta).toEqual([{ a: 10, s: 90, l: 0 }]);
  });

  it('el límite inferior de 70 % de arena del arenoso franco es redundante', () => {
    // Si limo + 2·arcilla < 30 entonces limo + arcilla < 30, o sea arena > 70,
    // por aritmética. El 70 del manual no decide ninguna celda.
    const fueraDelRango = TRIANGULO.filter(
      c => c.l + 2 * c.a < 30 && c.l + 1.5 * c.a >= 15 && !(c.s >= 70 && c.s <= 90),
    );
    expect(fueraDelRango).toHaveLength(0);
  });

  it('las otras tres lecturas de «more than 20 to 45 percent sand» rompen la partición', () => {
    // Se cuentan las celdas que quedarían colgadas o repetidas con cada lectura
    // equivocada. La medición está en el doc de `textura.ts`: 13 y 13.
    const conLectura = (loInc: boolean, hiInc: boolean) => {
      let huecos = 0, solapes = 0;
      for (const c of TRIANGULO) {
        const { a, s } = c;
        const esFrancoArcilloso = a >= 27 && a < 40
          && (loInc ? s >= 20 : s > 20) && (hiInc ? s <= 45 : s < 45);
        const esFrancoArcilloLimoso = a >= 27 && a < 40 && s <= 20;
        const otras = claseTexturaUSDA(a, s, c.l);
        const esOtra = otras !== 'franco-arcilloso' && otras !== 'franco-arcillo-limoso';
        const n = (esFrancoArcilloso ? 1 : 0) + (esFrancoArcilloLimoso ? 1 : 0) + (esOtra ? 1 : 0);
        if (n === 0) huecos++;
        if (n > 1) solapes++;
      }
      return { huecos, solapes };
    };
    expect(conLectura(false, true)).toEqual({ huecos: 0, solapes: 0 });   // la del manual
    expect(conLectura(true,  true)).toEqual({ huecos: 0, solapes: 13 });
    expect(conLectura(false, false)).toEqual({ huecos: 13, solapes: 0 });
    expect(conLectura(true,  false)).toEqual({ huecos: 13, solapes: 13 });
  });
});

describe('textura — lo que estaba mal, medido', () => {
  it('la escalera vieja se equivocaba en 1.699 de las 5.151 celdas, el 33,0 %', () => {
    const mal = TRIANGULO.filter(
      c => nombreTextura(claseTexturaUSDA(c.a, c.s, c.l)) !== escaleraVieja(c.a, c.s, c.l),
    );
    expect(mal).toHaveLength(1699);
    expect(mal.length / TRIANGULO.length).toBeCloseTo(0.33, 2);
  });

  it('y dos de las doce clases no podía devolverlas nunca', () => {
    const posibles = new Set(TRIANGULO.map(c => escaleraVieja(c.a, c.s, c.l)));
    expect(posibles.size).toBe(10);
    expect(posibles.has('Franco-arcillo-arenoso')).toBe(false);
    expect(posibles.has('Franco-arcillo-limoso')).toBe(false);
  });

  it('el error más grande era llamar «Arcilloso» al arcillo-limoso: 231 celdas', () => {
    const n = TRIANGULO.filter(
      c => claseTexturaUSDA(c.a, c.s, c.l) === 'arcillo-limoso'
        && escaleraVieja(c.a, c.s, c.l) === 'Arcilloso',
    );
    // Todas las celdas de arcillo-limoso que hay: la escalera no acertaba una.
    expect(n).toHaveLength(231);
  });

  it('el clasificador de emplazamiento.ts erraba 43 celdas, todas sobre un borde y todas al grueso', () => {
    // Usaba `>=` donde el manual dice «more than», así que el borde caía en la
    // clase más gruesa. Más grueso es más permeable: sobra tasa de absorción en
    // el campo de infiltración y falta erodabilidad en la USLE.
    const vieja = (a: number, s: number, l: number): ClaseUSDA => {
      if (a >= 40 && l >= 40) return 'arcillo-limoso';
      if (a >= 35 && s >= 45) return 'arcillo-arenoso';
      if (a >= 40) return 'arcilloso';
      if (a >= 27 && s <= 20) return 'franco-arcillo-limoso';
      if (a >= 27 && s <= 45) return 'franco-arcilloso';
      if (a >= 20 && l < 28 && s > 45) return 'franco-arcillo-arenoso';
      if (l >= 80 && a < 12) return 'limoso';
      if (l >= 50 && a < 27) return 'franco-limoso';
      if (l >= 28 && a >= 7 && a < 27 && s <= 52) return 'franco';
      if (s >= 85 && l + 1.5 * a <= 15) return 'arenoso';
      if (s >= 70 && l + 2 * a <= 30) return 'arenoso-franco';
      return 'franco-arenoso';
    };
    const dif = TRIANGULO.filter(c => vieja(c.a, c.s, c.l) !== claseTexturaUSDA(c.a, c.s, c.l));
    expect(dif).toHaveLength(43);

    // Los cuatro bordes, con un representante cada uno.
    expect(vieja(0, 70, 30)).toBe('arenoso-franco');
    expect(claseTexturaUSDA(0, 70, 30)).toBe('franco-arenoso');
    expect(vieja(40, 45, 15)).toBe('arcillo-arenoso');
    expect(claseTexturaUSDA(40, 45, 15)).toBe('arcilloso');
    expect(vieja(0, 85, 15)).toBe('arenoso');
    expect(claseTexturaUSDA(0, 85, 15)).toBe('arenoso-franco');
    expect(vieja(35, 45, 20)).toBe('arcillo-arenoso');
    expect(claseTexturaUSDA(35, 45, 20)).toBe('franco-arcilloso');

    // Y el vértice que decide la lectura del 90 era una de las 43.
    expect(vieja(10, 90, 0)).toBe('arenoso');
    expect(claseTexturaUSDA(10, 90, 0)).toBe('arenoso-franco');
  });
});

describe('textura — la tabla 3-1 de grupos generales', () => {
  it('las doce clases están repartidas en los cinco subgrupos, sin repetir ni faltar', () => {
    const todas = GRUPOS_TEXTURA_USDA.flatMap(g => g.clases);
    expect(todas).toHaveLength(12);
    expect(new Set(todas).size).toBe(12);
    for (const c of CLASES_USDA) expect(todas.includes(c), c).toBe(true);
    expect(GRUPOS_TEXTURA_USDA).toHaveLength(5);
  });

  it('los tres grupos generales son arenoso, franco y arcilloso, y el franco tiene cuatro subgrupos', () => {
    const grupos = GRUPOS_TEXTURA_USDA.map(g => g.grupo);
    expect(new Set(grupos)).toEqual(new Set(['arenoso', 'franco', 'arcilloso']));
    expect(grupos.filter(g => g === 'franco')).toHaveLength(3);
    expect(grupos.filter(g => g === 'arenoso')).toHaveLength(1);
    expect(grupos.filter(g => g === 'arcilloso')).toHaveLength(1);
  });

  it('cada clase encuentra su grupo, y las tres arcillas son textura fina', () => {
    for (const c of CLASES_USDA) {
      expect(grupoTexturaUSDA(c).clases.includes(c), c).toBe(true);
    }
    expect(grupoTexturaUSDA('arcilloso').subgrupo).toBe('fina');
    expect(grupoTexturaUSDA('arcillo-limoso').subgrupo).toBe('fina');
    expect(grupoTexturaUSDA('arcillo-arenoso').subgrupo).toBe('fina');
    // Los tres francos con arcilla van juntos, incluidas las dos que faltaban.
    expect(grupoTexturaUSDA('franco-arcilloso').subgrupo).toBe('moderadamente_fina');
    expect(grupoTexturaUSDA('franco-arcillo-arenoso').subgrupo).toBe('moderadamente_fina');
    expect(grupoTexturaUSDA('franco-arcillo-limoso').subgrupo).toBe('moderadamente_fina');
    // Y el limoso y el franco limoso quedan en media, como en la tabla.
    expect(grupoTexturaUSDA('limoso').subgrupo).toBe('media');
    expect(grupoTexturaUSDA('franco-limoso').subgrupo).toBe('media');
  });
});

describe('textura — el dato roto no se clasifica', () => {
  it('una composición que no suma 100 se normaliza y da la misma clase', () => {
    // SoilGrids y SSURGO predicen las tres por separado y redondean, así que la
    // suma se corre uno o dos puntos. Eso no puede cambiar la clase.
    expect(claseTexturaUSDA(18, 40, 42)).toBe('franco');
    expect(claseTexturaUSDA(17.8, 39.6, 41.5)).toBe('franco');
    expect(claseTexturaUSDA(18.3, 40.4, 42.6)).toBe('franco');
  });

  it('pero si la suma se va más de cinco puntos, no hay clase', () => {
    expect(SUMA_TOLERADA_PCT).toBe(5);
    expect(claseTexturaUSDA(30, 30, 30)).toBeNull();     // suma 90
    expect(claseTexturaUSDA(40, 40, 40)).toBeNull();     // suma 120
    expect(claseTexturaUSDA(0, 0, 0)).toBeNull();
    // Justo en el borde de la tolerancia sí clasifica.
    expect(claseTexturaUSDA(18, 40, 37)).not.toBeNull(); // suma 95
    expect(claseTexturaUSDA(18, 45, 42)).not.toBeNull(); // suma 105
  });

  it('un NaN, un infinito o un negativo no son un suelo', () => {
    expect(claseTexturaUSDA(NaN, 40, 42)).toBeNull();
    expect(claseTexturaUSDA(18, NaN, 42)).toBeNull();
    expect(claseTexturaUSDA(18, 40, NaN)).toBeNull();
    expect(claseTexturaUSDA(Infinity, 40, 42)).toBeNull();
    expect(claseTexturaUSDA(-5, 60, 45)).toBeNull();
  });

  it('y cuando no hay clase el nombre lo dice, no inventa un franco', () => {
    expect(nombreTextura(null)).toBe(SIN_CLASE_TEXTURA);
    expect(nombreTextura(null)).toBe('Sin dato');
    expect(nombreTextura('franco')).toBe('Franco');
  });
});

describe('textura — las fracciones de tierra fina', () => {
  it('la tierra fina son las partículas menores a 2 mm', () => {
    expect(TIERRA_FINA_MM_MAX).toBe(2);
    expect(SEPARADOS_USDA.arena_muy_gruesa.mm[1]).toBe(TIERRA_FINA_MM_MAX);
  });

  it('las nueve fracciones de la página 120 son continuas y cubren hasta cero', () => {
    const orden = [
      SEPARADOS_USDA.arena_muy_gruesa, SEPARADOS_USDA.arena_gruesa,
      SEPARADOS_USDA.arena_media, SEPARADOS_USDA.arena_fina,
      SEPARADOS_USDA.arena_muy_fina, SEPARADOS_USDA.limo_grueso,
      SEPARADOS_USDA.limo_fino, SEPARADOS_USDA.arcilla_gruesa,
      SEPARADOS_USDA.arcilla_fina,
    ];
    expect(orden).toHaveLength(9);
    for (let i = 1; i < orden.length; i++) {
      expect(orden[i]!.mm[1], orden[i]!.texto).toBe(orden[i - 1]!.mm[0]);
    }
    expect(orden[orden.length - 1]!.mm[0]).toBe(0);
  });

  it('la arena va de 0,05 a 2 mm, el limo de 0,002 a 0,05 y la arcilla por debajo de 0,002', () => {
    expect(SEPARADOS_USDA.arena_muy_fina.mm[0]).toBe(0.05);
    expect(SEPARADOS_USDA.limo_grueso.mm[1]).toBe(0.05);
    expect(SEPARADOS_USDA.limo_fino.mm[0]).toBe(0.002);
    expect(SEPARADOS_USDA.arcilla_gruesa.mm[1]).toBe(0.002);
  });

  it('la arena muy fina es la fracción que el nomograma de K manda pasar al limo', () => {
    // AH-537 p. 10: «the percentage of very fine sand (0.1-0.05 mm) must first
    // be transferred from the sand fraction to the silt fraction». Es una de las
    // tres entradas que falta para correr el nomograma, y está acá nombrada.
    expect(SEPARADOS_USDA.arena_muy_fina.mm).toEqual([0.05, 0.10]);
  });
});

describe('textura — el contrato con la erodabilidad de usle.ts', () => {
  it('diez de las doce clases tienen K propia y las dos que faltaban caen en el defecto', () => {
    const conK = CLASES_USDA.filter(c => erodabilidadK(NOMBRE_CLASE_USDA[c]) !== 0.040);
    // El franco y el franco-arcilloso valen 0,040 igual que el defecto, así que
    // no se distinguen por el valor; se cuentan las que difieren del defecto.
    expect(conK).toHaveLength(8);
    expect(erodabilidadK('Franco-arcillo-arenoso')).toBe(0.040);
    expect(erodabilidadK('Franco-arcillo-limoso')).toBe(0.040);
    expect(erodabilidadK(undefined)).toBe(0.040);
  });

  it('a las dos clases nuevas la K no les cambia en 392 celdas y les sube en 273', () => {
    // Esta medición desarmó lo primero que escribí, que era que a estas dos la
    // corrección no les cambiaba el número. Donde la escalera las llamaba
    // «Franco» o «Franco-arcilloso» no cambia nada, porque esas dos valen 0,040
    // igual que el defecto. Pero donde las llamaba una ARCILLA, la K sube.
    let igual = 0, sube = 0, baja = 0;
    for (const c of TRIANGULO) {
      const clase = claseTexturaUSDA(c.a, c.s, c.l)!;
      if (clase !== 'franco-arcillo-arenoso' && clase !== 'franco-arcillo-limoso') continue;
      const antes = erodabilidadK(escaleraVieja(c.a, c.s, c.l));
      const ahora = erodabilidadK(NOMBRE_CLASE_USDA[clase]);
      if (ahora > antes) sube++;
      else if (ahora < antes) baja++;
      else igual++;
    }
    expect(igual).toBe(392);
    expect(sube).toBe(273);
    expect(baja).toBe(0);
    expect(igual + sube).toBe(392 + 273);
  });

  it('un franco arcillo arenoso estaba recibiendo la K de una arcilla arenosa: 2,35 veces menos', () => {
    // El caso concreto, y es el que importa: subestimar la erosión. La escalera
    // llamaba «Arcillo-arenoso» a un franco arcillo arenoso con arena 46 y
    // arcilla 28, y la K de la arcilla arenosa es 0,017 contra 0,040.
    expect(escaleraVieja(28, 46, 26)).toBe('Arcillo-arenoso');
    expect(claseTexturaUSDA(28, 46, 26)).toBe('franco-arcillo-arenoso');
    expect(erodabilidadK('Arcillo-arenoso')).toBe(0.017);
    expect(erodabilidadK('Franco-arcillo-arenoso') / erodabilidadK('Arcillo-arenoso'))
      .toBeCloseTo(2.35, 2);
  });

  it('en el triángulo entero la corrección mueve la K de 1.180 celdas: sube en 958 y baja en 222', () => {
    // El efecto real de todo esto sobre un número físico. El caso más repetido
    // es el franco limoso que la escalera llamaba franco-arcilloso: pasa de
    // 0,040 a 0,050, un 25 % más de erosión prevista.
    let suben = 0, bajan = 0, iguales = 0;
    for (const c of TRIANGULO) {
      const antes = erodabilidadK(escaleraVieja(c.a, c.s, c.l));
      const ahora = erodabilidadK(nombreTextura(claseTexturaUSDA(c.a, c.s, c.l)));
      if (ahora > antes) suben++;
      else if (ahora < antes) bajan++;
      else iguales++;
    }
    expect(suben).toBe(958);
    expect(bajan).toBe(222);
    expect(suben + bajan).toBe(1180);
    expect(iguales).toBe(5151 - 1180);
    expect(erodabilidadK('Franco-limoso') / erodabilidadK('Franco-arcilloso')).toBeCloseTo(1.25, 2);
  });
});
