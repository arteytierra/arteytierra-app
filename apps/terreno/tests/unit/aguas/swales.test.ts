import { describe, it, expect } from 'vitest';
import { diagnosticarSwales, calcularSwales } from '@/lib/swales';
import { recortarGrillaA, type GrillaElevacion } from '@/lib/grillaElevacion';
import { MAX_NIVELES } from '@/lib/curvasNivel';

/**
 * Ladera plana inclinada de sur a norte, para tener un desnivel exacto y
 * predecible: la cota depende sólo de la fila.
 */
function ladera(rows: number, cols: number, desnivelM: number): GrillaElevacion {
  const elev = new Float64Array(rows * cols);
  for (let r = 0; r < rows; r++) {
    const z = (r / (rows - 1)) * desnivelM;
    for (let c = 0; c < cols; c++) elev[r * cols + c] = z;
  }
  return {
    rows, cols,
    latMin: -30.80, latMax: -30.70,
    lngMin: -64.70, lngMax: -64.60,
    elev, elev_min: 0, elev_max: desnivelM,
  };
}

describe('diagnosticarSwales', () => {
  it('acepta un intervalo que entra en el tope de curvas', () => {
    const d = diagnosticarSwales(ladera(40, 40, 30), 1.5);
    expect(d.puede).toBe(true);
    expect(d.motivo).toBeNull();
    expect(d.niveles).toBeLessThanOrEqual(MAX_NIVELES);
  });

  it('detecta el caso del predio grande: demasiados swales, no "poco desnivel"', () => {
    // 300 m de desnivel con separación de 1,5 m ⇒ 200 curvas, muy por encima del tope.
    const d = diagnosticarSwales(ladera(40, 40, 300), 1.5);
    expect(d.puede).toBe(false);
    expect(d.motivo).toBe('demasiados_swales');
    expect(d.niveles).toBe(200);
    expect(d.desnivel_m).toBe(300);
  });

  it('sugiere una separación que sí entra en el tope', () => {
    const d = diagnosticarSwales(ladera(40, 40, 300), 1.5);
    expect(d.intervalo_sugerido).not.toBeNull();
    const rehecho = diagnosticarSwales(ladera(40, 40, 300), d.intervalo_sugerido!);
    expect(rehecho.puede).toBe(true);
  });

  it('marca sin_relieve cuando la separación supera el desnivel', () => {
    const d = diagnosticarSwales(ladera(20, 20, 2), 5);
    expect(d.puede).toBe(false);
    expect(d.motivo).toBe('sin_relieve');
  });
});

describe('recortarGrillaA', () => {
  const g = ladera(60, 60, 300);

  it('acota el rango de cotas a la parcela, no al predio entero', () => {
    // Cuarto sur de la ladera ⇒ ~la cuarta parte inferior del desnivel.
    const parcela = [
      { lat: -30.799, lng: -64.699 },
      { lat: -30.799, lng: -64.601 },
      { lat: -30.776, lng: -64.601 },
      { lat: -30.776, lng: -64.699 },
    ];
    const sub = recortarGrillaA(g, parcela)!;
    expect(sub).not.toBeNull();
    const desnivelSub = sub.elev_max - sub.elev_min;
    expect(desnivelSub).toBeLessThan(300);
    expect(desnivelSub).toBeGreaterThan(0);
    // Y con eso el trazado fino vuelve a ser posible donde antes no lo era.
    expect(diagnosticarSwales(g, 1.5).puede).toBe(false);
    expect(diagnosticarSwales(sub, 1.5).puede).toBe(true);
  });

  it('devuelve null si la parcela no toca la grilla', () => {
    const lejos = [
      { lat: 10.0, lng: 10.0 }, { lat: 10.1, lng: 10.0 }, { lat: 10.1, lng: 10.1 },
    ];
    expect(recortarGrillaA(g, lejos)).toBeNull();
  });

  it('devuelve null con menos de 3 vértices', () => {
    expect(recortarGrillaA(g, [{ lat: -30.79, lng: -64.69 }])).toBeNull();
  });
});

describe('calcularSwales sobre una parcela recortada', () => {
  it('traza swales dentro de la parcela donde el predio entero fallaba', () => {
    const g = ladera(60, 60, 300);
    const parcela = [
      { lat: -30.799, lng: -64.699 },
      { lat: -30.799, lng: -64.601 },
      { lat: -30.776, lng: -64.601 },
      { lat: -30.776, lng: -64.699 },
    ];
    const mojones = [
      { lat: -30.80, lng: -64.70 },
      { lat: -30.80, lng: -64.60 },
      { lat: -30.70, lng: -64.60 },
      { lat: -30.70, lng: -64.70 },
    ];

    // Antes: nada, porque 300 m / 1,5 m se pasa del tope de curvas.
    expect(calcularSwales(g, mojones, { intervaloV: 1.5, precipMm: 70, coef: 0.45 })).toBeNull();

    // Ahora: acotado a la parcela, sale el trazado.
    const sub = recortarGrillaA(g, parcela)!;
    const r = calcularSwales(sub, parcela, { intervaloV: 1.5, precipMm: 70, coef: 0.45 });
    expect(r).not.toBeNull();
    expect(r!.swales.length).toBeGreaterThan(0);
    expect(r!.total_long_m).toBeGreaterThan(0);
    expect(r!.total_vol_m3).toBeGreaterThan(0);
  });
});
