/**
 * Tests de las paletas de los shaders.
 *
 * Dos cosas que un cambio de color puede romper sin que se note hasta la
 * pantalla: que el degradé del swatch deje de decir lo mismo que los píxeles del
 * mapa —antes eran dos listas separadas, una para pintar y un `linear-gradient`
 * escrito a mano— y que una rampa quede desordenada, con un alto por debajo del
 * anterior, y entonces el color deje de ordenar el terreno.
 */
import { describe, it, expect } from 'vitest';
import {
  colorElevacion, colorPendiente, gradienteCss,
  PALETAS_ELEV, PALETAS_PEND, PALETA_ELEV_POR_DEFECTO, PALETA_PEND_POR_DEFECTO,
  type Paleta, type PaletaElev, type PaletaPend,
} from '@/lib/shaders';

const TODAS: Paleta[] = [...Object.values(PALETAS_ELEV), ...Object.values(PALETAS_PEND)];

const rgb = (s: string) => (s.match(/\d+/g) ?? []).map(Number) as [number, number, number];

describe('rampas', () => {
  it('van de 0 a 1 sin retroceder', () => {
    for (const p of TODAS) {
      expect(p.ramp[0]!.t).toBe(0);
      expect(p.ramp[p.ramp.length - 1]!.t).toBe(1);
      for (let i = 1; i < p.ramp.length; i++) {
        expect(p.ramp[i]!.t).toBeGreaterThan(p.ramp[i - 1]!.t);
      }
    }
  });

  it('todos los altos son hex de seis dígitos', () => {
    for (const p of TODAS) {
      for (const alto of p.ramp) expect(alto.hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe('gradienteCss', () => {
  // El swatch de Capas y la leyenda salen de acá: si dijera otra cosa que el
  // mapa, el usuario estaría leyendo el color con la regla equivocada.
  it('empieza y termina en los extremos de la rampa', () => {
    const p = PALETAS_ELEV.terreno;
    const css = gradienteCss(p.ramp);
    expect(css.startsWith('linear-gradient(90deg,')).toBe(true);
    expect(css).toContain(`${p.ramp[0]!.hex} 0%`);
    expect(css).toContain(`${p.ramp[p.ramp.length - 1]!.hex} 100%`);
  });
});

describe('colorElevacion', () => {
  it('en los extremos devuelve el color exacto del alto', () => {
    const p = PALETAS_ELEV[PALETA_ELEV_POR_DEFECTO];
    expect(rgb(colorElevacion(100, 100, 200))).toEqual([0x3B, 0x0B, 0x54]);
    expect(rgb(colorElevacion(200, 100, 200))).toEqual([0xC6, 0x22, 0x22]);
    expect(p.ramp[p.ramp.length - 1]!.hex).toBe('#C62222');
  });

  // Un predio perfectamente plano no tiene "más alto": sin esto sería 0/0.
  it('un predio sin desnivel no rompe la escala', () => {
    expect(() => colorElevacion(500, 500, 500)).not.toThrow();
    expect(rgb(colorElevacion(500, 500, 500))).toEqual([0x3B, 0x0B, 0x54]);
  });

  it('cada paleta pinta distinto la misma cota', () => {
    const vistos = new Set<string>();
    for (const k of Object.keys(PALETAS_ELEV) as PaletaElev[]) {
      vistos.add(colorElevacion(150, 100, 200, k));
    }
    expect(vistos.size).toBe(Object.keys(PALETAS_ELEV).length);
  });
});

describe('colorPendiente', () => {
  it('recorta por arriba en vez de salirse de la rampa', () => {
    const tope  = colorPendiente(60, 60);
    const pasado = colorPendiente(200, 60);
    expect(pasado).toBe(tope);
  });

  // Lo que pidió el cerro: después del rojo la escala sigue, no satura.
  it('la paleta extrema termina casi en negro y la semáforo en rojo', () => {
    const [r1, g1, b1] = rgb(colorPendiente(60, 60, 'extrema'));
    expect(r1 + g1 + b1).toBeLessThan(90);
    const [r2, g2, b2] = rgb(colorPendiente(60, 60, 'semaforo'));
    expect(r2).toBeGreaterThan(150);
    expect(g2 + b2).toBeLessThan(120);
  });

  // El verde-a-rojo es justo el par que no distingue el daltonismo más común.
  it('la paleta daltónica ordena también por brillo', () => {
    const brillo = (s: string) => { const [r, g, b] = rgb(s); return 0.299 * r + 0.587 * g + 0.114 * b; };
    let previo = Infinity;
    for (const t of [0, 0.25, 0.5, 0.75, 1]) {
      const actual = brillo(colorPendiente(t * 40, 40, 'daltonico'));
      expect(actual).toBeLessThan(previo);
      previo = actual;
    }
  });

  it('sin paleta usa la de por defecto', () => {
    for (const k of Object.keys(PALETAS_PEND) as PaletaPend[]) {
      const igual = colorPendiente(20, 40, k) === colorPendiente(20, 40);
      expect(igual).toBe(k === PALETA_PEND_POR_DEFECTO);
    }
  });
});
