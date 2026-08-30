import { describe, it, expect } from 'vitest';
import { diagnosticarSwales, calcularSwales, dimensionarSeccion, verificarInfiltracion, pendienteMediaPct, analizarAreas, calcularSwalesMulti } from '@/lib/swales';
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

describe('pendienteMediaPct', () => {
  it('mide la pendiente real de una ladera uniforme', () => {
    // 40 filas sobre ~11,1 km de norte a sur, 300 m de desnivel → ~2,7%.
    const g = ladera(40, 40, 300);
    const alto_m = (g.latMax - g.latMin) * 111_320;
    expect(pendienteMediaPct(g)).toBeCloseTo((300 / alto_m) * 100, 1);
  });

  it('no da cero en un lomo, donde el desnivel extremo a extremo sí es cero', () => {
    // La trampa que tenía el cálculo viejo: los dos bordes a la misma cota.
    const rows = 41, cols = 41;
    const elev = new Float64Array(rows * cols);
    for (let r = 0; r < rows; r++) {
      const z = 100 - Math.abs(r - (rows - 1) / 2) * 2;   // techo a dos aguas
      for (let c = 0; c < cols; c++) elev[r * cols + c] = z;
    }
    const g: GrillaElevacion = {
      rows, cols, latMin: -30.80, latMax: -30.70, lngMin: -64.70, lngMax: -64.60,
      elev, elev_min: 60, elev_max: 100,
    };
    expect(pendienteMediaPct(g)).toBeGreaterThan(0.5);
  });

  it('devuelve 0 en una grilla degenerada', () => {
    expect(pendienteMediaPct(ladera(2, 2, 10))).toBe(0);
  });
});

describe('analizarAreas', () => {
  it('le da a cada área su pendiente y su recomendación', () => {
    const g = ladera(40, 40, 300);
    const [predio] = analizarAreas(g, [], [{ id: 'predio', nombre: 'Todo el predio', vertices: null }]);
    expect(predio!.pendiente_pct).toBeGreaterThan(0);
    expect(predio!.desnivel_m).toBeCloseTo(300, 0);
    expect(predio!.recomendacion.fuente).toMatch(/hidrología regenerativa/i);
  });

  it('el suelo lento acerca las zanjas respecto del suelo rápido', () => {
    const g = ladera(60, 60, 900);   // ladera empinada, dentro de tabla
    const area = [{ id: 'a', nombre: 'A', vertices: null }];
    const lento  = analizarAreas(g, [], area, { infiltracion: 'lenta' })[0]!;
    const rapido = analizarAreas(g, [], area, { infiltracion: 'rapida' })[0]!;
    if (lento.recomendacion.aplica) {
      expect(lento.recomendacion.valor).toBeLessThanOrEqual(rapido.recomendacion.valor);
    }
  });
});

describe('calcularSwalesMulti', () => {
  const g = ladera(40, 40, 300);
  const areas = [{ id: 'predio', nombre: 'Todo el predio', vertices: null }];
  const opts = { precipMm: 60, coef: 0.4, profMax_m: 0.8, ksat_mm_h: 10 };

  it('acota la separación pedida al rango de la recomendación', () => {
    const r = calcularSwalesMulti(g, [], areas, { predio: 999 }, opts);
    const b = r.bloques[0]!;
    if (b.recomendacion.aplica) {
      expect(b.intervaloV).toBeLessThanOrEqual(b.recomendacion.max);
      expect(b.intervaloV).toBeGreaterThanOrEqual(b.recomendacion.min);
    }
  });

  it('suma los totales de las parcelas que salieron', () => {
    const r = calcularSwalesMulti(g, [], areas, {}, opts);
    const con = r.bloques.filter(b => b.resultado);
    expect(r.total_long_m).toBe(Math.round(con.reduce((s, b) => s + b.resultado!.total_long_m, 0)));
    expect(r.total_swales).toBe(con.reduce((s, b) => s + b.resultado!.swales.length, 0));
  });

  it('deja el diagnóstico en el bloque que no pudo trazarse', () => {
    const plano = ladera(40, 40, 0.2);
    const r = calcularSwalesMulti(plano, [], areas, { predio: 5 }, opts);
    const b = r.bloques[0]!;
    expect(b.resultado).toBeNull();
    expect(b.diagnostico).not.toBeNull();
  });
});
