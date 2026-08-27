import { describe, it, expect } from 'vitest';
import { calcularErosion, factorCobertura } from '@/lib/erosion';
import { calcularEscorrentias } from '@/lib/escorrentias';
import { USLE_C_REF } from '@/lib/hidrologiaPredio';
import type { DatosShader, CeldaShader } from '@/lib/shaders';

/**
 * Ladera cóncava: cae hacia el norte y se va empinando, así que hay celdas en
 * todas las bandas de pendiente y el flujo se concentra en la parte baja.
 */
function laderaShader(n = 14): DatosShader {
  const celdas: CeldaShader[] = [];
  const paso = 0.0003;   // ~33 m de celda
  let min = Infinity, max = -Infinity, pmax = 0;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      // Cota crece con la fila de forma acelerada (pendiente creciente).
      const elevation = Math.pow(r / (n - 1), 1.8) * 90;
      const pendiente_pct = 1 + (r / (n - 1)) * 24;
      celdas.push({
        row: r, col: c,
        latMin: -30.8 + r * paso, latMax: -30.8 + (r + 1) * paso,
        lngMin: -64.7 + c * paso, lngMax: -64.7 + (c + 1) * paso,
        elevation, pendiente_pct,
      });
      if (elevation < min) min = elevation;
      if (elevation > max) max = elevation;
      if (pendiente_pct > pmax) pmax = pendiente_pct;
    }
  }
  return { celdas, elev_min: min, elev_max: max, pend_max: pmax, fuente: 'glo30' };
}

const shader = laderaShader();
const esc = calcularEscorrentias(shader);
const pctSevero = (usleC: number | null) => {
  const d = calcularErosion(shader, esc!, usleC)!;
  return d.resumen.find(r => r.clase === 3)!.pct + d.resumen.find(r => r.clase === 2)!.pct;
};

describe('factorCobertura', () => {
  it('vale 1 cuando no hay cobertura cargada', () => {
    expect(factorCobertura(null)).toBe(1);
    expect(factorCobertura(undefined)).toBe(1);
    expect(factorCobertura(0)).toBe(1);
  });

  it('vale 1 en el pastizal de referencia', () => {
    expect(factorCobertura(USLE_C_REF)).toBeCloseTo(1, 5);
  });

  it('protege con cobertura densa y agrava con suelo desnudo', () => {
    expect(factorCobertura(0.004)).toBeGreaterThan(1);   // monte
    expect(factorCobertura(1.0)).toBeLessThan(1);        // barbecho
  });

  it('está acotado para que un DEM de 30 m no pinte el predio entero', () => {
    expect(factorCobertura(1e-6)).toBe(2);
    expect(factorCobertura(1000)).toBe(0.5);
  });
});

describe('calcularErosion · factor de cobertura', () => {
  it('sin cobertura se comporta exactamente como antes', () => {
    const d = calcularErosion(shader, esc!)!;
    expect(d.usle_c).toBeNull();
    expect(d.factor_cobertura).toBe(1);
    expect(d.nota_cobertura).toContain('Sin cobertura cargada');
  });

  it('el mismo relieve erosiona más con el suelo desnudo que bajo monte', () => {
    const monte  = pctSevero(0.004);
    const neutro = pctSevero(null);
    const pelado = pctSevero(1.0);
    expect(monte).toBeLessThan(neutro);
    expect(pelado).toBeGreaterThan(neutro);
  });

  it('las clases siguen sumando el predio entero', () => {
    for (const c of [null, 0.004, 1.0]) {
      const d = calcularErosion(shader, esc!, c)!;
      const suma = d.resumen.reduce((s, r) => s + r.pct, 0);
      expect(Math.abs(suma - 100)).toBeLessThanOrEqual(2);   // redondeo por clase
      expect(d.celdas.length).toBe(shader.celdas.length);
    }
  });

  it('explica en castellano qué hizo la cobertura', () => {
    expect(calcularErosion(shader, esc!, 0.004)!.nota_cobertura).toContain('protegido');
    expect(calcularErosion(shader, esc!, 1.0)!.nota_cobertura).toContain('desnudo');
  });

  it('devuelve null si la grilla es demasiado chica', () => {
    const chico: DatosShader = { ...shader, celdas: shader.celdas.slice(0, 3) };
    expect(calcularErosion(chico, esc!, null)).toBeNull();
  });

  /**
   * Lo que consume la USLE (H4): cada clase tiene que traer su pendiente media
   * y su longitud de ladera, porque de ahí sale el LS. Sin esto la magnitud en
   * t/ha/año no se puede calcular por clase.
   */
  it('cada clase con celdas trae pendiente media y longitud de ladera', () => {
    const d = calcularErosion(shader, esc!, 0.04)!;
    const conCeldas = d.resumen.filter(r => r.pct > 0);
    expect(conCeldas.length).toBeGreaterThan(1);
    for (const r of conCeldas) {
      expect(r.pendiente_media_pct).toBeGreaterThan(0);
      expect(r.lambda_m).toBeGreaterThan(0);
    }
  });

  it('las clases más severas caen en las laderas más empinadas', () => {
    const d = calcularErosion(shader, esc!, 0.04)!;
    const conCeldas = d.resumen.filter(r => r.pct > 0);
    for (let i = 1; i < conCeldas.length; i++) {
      expect(conCeldas[i]!.pendiente_media_pct).toBeGreaterThan(conCeldas[i - 1]!.pendiente_media_pct);
    }
  });
});
