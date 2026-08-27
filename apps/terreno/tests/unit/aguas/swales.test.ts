import { describe, it, expect } from 'vitest';
import { diagnosticarSwales, calcularSwales, dimensionarSeccion, verificarInfiltracion } from '@/lib/swales';
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

describe('dimensionarSeccion', () => {
  it('elige la profundidad más chica que deje un fondo abrible', () => {
    // 20 m de franja · 60 mm · coef 0,4 ⇒ 0,48 m² de sección por metro.
    const s = dimensionarSeccion(20, 60, 0.4, 1000, 1.5);
    expect(s.area_req_m2).toBeCloseTo(0.48, 2);
    expect(s.prof_m).toBe(0.3);
    expect(s.base_m).toBeCloseTo(1.15, 2);
    expect(s.area_m2).toBeCloseTo(0.48, 2);
    expect(s.suficiente).toBe(true);
    // Lo que se excava es exactamente lo que almacena.
    expect(s.capacidad_m3).toBe(Math.round(s.area_m2 * 1000));
  });

  it('la boca es más ancha que el fondo por los taludes', () => {
    const s = dimensionarSeccion(20, 60, 0.4, 1000, 1.5);
    expect(s.ancho_sup_m).toBeCloseTo(s.base_m + 2 * s.talud_z * s.prof_m, 2);
    expect(s.ancho_sup_m).toBeGreaterThan(s.base_m);
  });

  it('avisa cuando el volumen no entra en el tope de profundidad', () => {
    // Franja enorme y tormenta fuerte: no hay zanja de 0,8 m que lo aguante.
    const s = dimensionarSeccion(150, 120, 0.7, 2000, 2);
    expect(s.suficiente).toBe(false);
    expect(s.prof_m).toBe(0.8);
    expect(s.cobertura_pct).toBeLessThan(50);
    expect(s.intervalo_sugerido).not.toBeNull();
    expect(s.intervalo_sugerido!).toBeLessThan(2);
  });

  it('el intervalo sugerido efectivamente hace entrar la sección', () => {
    const s = dimensionarSeccion(150, 120, 0.7, 2000, 2);
    const factor = s.intervalo_sugerido! / 2;      // la franja escala con el intervalo
    const rehecho = dimensionarSeccion(150 * factor, 120, 0.7, 2000, s.intervalo_sugerido!);
    expect(rehecho.suficiente).toBe(true);
  });

  it('con muy poca agua no baja del fondo mínimo constructivo', () => {
    const s = dimensionarSeccion(5, 20, 0.1, 500, 1);
    expect(s.base_m).toBeGreaterThanOrEqual(0.3);
    expect(s.suficiente).toBe(true);
  });

  it('respeta un tope de profundidad más exigente', () => {
    const s = dimensionarSeccion(60, 90, 0.5, 1000, 2, { profMax_m: 0.4 });
    expect(s.prof_m).toBeLessThanOrEqual(0.4);
  });
});

describe('verificarInfiltracion', () => {
  const seccion = dimensionarSeccion(20, 60, 0.4, 1000, 1.5);

  it('aplica el factor de seguridad 2 sobre el Ksat del perfil', () => {
    const i = verificarInfiltracion(seccion, 60)!;
    expect(i.ksat_suelo_mm_h).toBe(60);
    expect(i.ksat_diseno_mm_h).toBe(30);
  });

  it('un suelo permeable vacía dentro del rango de diseño', () => {
    expect(verificarInfiltracion(seccion, 60)!.clase).toBe('ok');
  });

  it('un suelo arcilloso deja el agua estancada y lo marca', () => {
    const i = verificarInfiltracion(seccion, 2)!;
    expect(i.clase).toBe('muy_lenta');
    expect(i.horas_vaciado).toBeGreaterThan(48);
  });

  it('sin dato de suelo no inventa una verificación', () => {
    expect(verificarInfiltracion(seccion, null)).toBeNull();
    expect(verificarInfiltracion(seccion, 0)).toBeNull();
    expect(verificarInfiltracion(null, 60)).toBeNull();
  });
});

describe('calcularSwales · dimensionado integrado', () => {
  const g = ladera(60, 60, 30);
  const mojones = [
    { lat: -30.799, lng: -64.699 },
    { lat: -30.799, lng: -64.601 },
    { lat: -30.701, lng: -64.601 },
    { lat: -30.701, lng: -64.699 },
  ];

  it('devuelve la sección dimensionada junto con el trazado', () => {
    const r = calcularSwales(g, mojones, { intervaloV: 1.5, precipMm: 70, coef: 0.45 })!;
    expect(r.seccion).not.toBeNull();
    expect(r.seccion!.prof_m).toBeGreaterThan(0);
    expect(r.seccion!.capacidad_m3).toBeGreaterThan(0);
  });

  it('sin Ksat traza igual pero no verifica infiltración', () => {
    const r = calcularSwales(g, mojones, { intervaloV: 1.5, precipMm: 70, coef: 0.45 })!;
    expect(r.infiltracion).toBeNull();
  });

  it('con Ksat verifica el vaciado', () => {
    const r = calcularSwales(g, mojones, { intervaloV: 1.5, precipMm: 70, coef: 0.45, ksat_mm_h: 25 })!;
    expect(r.infiltracion).not.toBeNull();
    expect(r.infiltracion!.horas_vaciado).toBeGreaterThan(0);
  });
});
