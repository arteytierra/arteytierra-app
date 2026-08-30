import { describe, it, expect } from 'vitest';
import {
  TABLA_ZANJAS, distanciaDeTabla, separacionZanjas, separacionVerticalZanjas,
  escurrimientoAnual, claseSueloSugerida, claseInfiltracionDeKsat,
  anchoCorona, taludesSugeridos, evaluar, acotar,
  PENDIENTE_MIN_PCT, PENDIENTE_MAX_PCT,
} from '@/lib/criterios';

describe('tabla de separación de zanjas', () => {
  it('devuelve los valores de tabla en los puntos exactos', () => {
    for (const fila of TABLA_ZANJAS) {
      expect(distanciaDeTabla(fila.pendiente_pct)).toBe(fila.distancia_m);
    }
  });

  it('interpola entre dos filas', () => {
    // 12% cae entre 10% (20 m) y 14% (18 m) → la mitad del camino es 19 m.
    expect(distanciaDeTabla(12)).toBeCloseTo(19, 5);
  });

  it('la distancia decrece siempre al aumentar la pendiente', () => {
    let anterior = Infinity;
    for (let p = PENDIENTE_MIN_PCT; p <= PENDIENTE_MAX_PCT; p += 0.5) {
      const d = distanciaDeTabla(p);
      expect(d).toBeLessThanOrEqual(anterior);
      anterior = d;
    }
  });
});

describe('separacionZanjas', () => {
  it('sin ajustes devuelve el valor de tabla y un rango de ±20%', () => {
    const r = separacionZanjas({ pendiente_pct: 10 });
    expect(r.aplica).toBe(true);
    expect(r.valor).toBe(20);
    expect(r.min).toBe(16);
    expect(r.max).toBe(24);
    expect(r.ajustes).toHaveLength(0);
  });

  it('el suelo lento acerca las zanjas y el rápido las aleja', () => {
    const lento  = separacionZanjas({ pendiente_pct: 10, infiltracion: 'lenta' });
    const rapido = separacionZanjas({ pendiente_pct: 10, infiltracion: 'rapida' });
    expect(lento.valor).toBeLessThan(20);
    expect(rapido.valor).toBeGreaterThan(20);
    expect(lento.ajustes).toHaveLength(1);
  });

  it('la ladera desnuda acerca las zanjas y la cubierta las aleja', () => {
    const desnuda = separacionZanjas({ pendiente_pct: 20, cobertura: 'desnuda' });
    const buena   = separacionZanjas({ pendiente_pct: 20, cobertura: 'buena' });
    expect(desnuda.valor).toBeLessThan(buena.valor);
  });

  it('los dos ajustes se acumulan', () => {
    const r = separacionZanjas({ pendiente_pct: 10, infiltracion: 'rapida', cobertura: 'buena' });
    expect(r.ajustes).toHaveLength(2);
    expect(r.valor).toBeGreaterThan(separacionZanjas({ pendiente_pct: 10, infiltracion: 'rapida' }).valor);
  });

  it('no recomienda nada por debajo del 2% y explica por qué', () => {
    const r = separacionZanjas({ pendiente_pct: 1 });
    expect(r.aplica).toBe(false);
    expect(r.motivo).toMatch(/2%/);
  });

  it('no recomienda nada por encima del 45% y advierte del deslizamiento', () => {
    const r = separacionZanjas({ pendiente_pct: 55 });
    expect(r.aplica).toBe(false);
    expect(r.motivo).toMatch(/desliza/i);
  });

  it('sin pendiente calculada no inventa un número', () => {
    expect(separacionZanjas({ pendiente_pct: 0 }).aplica).toBe(false);
    expect(separacionZanjas({ pendiente_pct: NaN }).aplica).toBe(false);
  });
});

describe('separacionVerticalZanjas', () => {
  it('convierte la distancia horizontal en desnivel con la pendiente', () => {
    // 10% → 20 m horizontales → 2,0 m de desnivel.
    const r = separacionVerticalZanjas({ pendiente_pct: 10 });
    expect(r.valor).toBeCloseTo(2, 5);
  });

  it('nunca baja de 0,25 m, que es el escalón mínimo de trazado', () => {
    const r = separacionVerticalZanjas({ pendiente_pct: 2 });
    expect(r.valor).toBeGreaterThanOrEqual(0.25);
  });

  it('arrastra el motivo cuando la pendiente está fuera de tabla', () => {
    expect(separacionVerticalZanjas({ pendiente_pct: 60 }).aplica).toBe(false);
  });
});

describe('evaluar', () => {
  const rec = separacionZanjas({ pendiente_pct: 10 });   // 20 m, rango 16–24

  it('reconoce el valor sugerido', () => {
    expect(evaluar(20, rec).estado).toBe('recomendado');
    expect(evaluar(20, rec).mensaje).toBe('');
  });

  it('acepta dentro del rango pero lo dice', () => {
    const e = evaluar(23, rec);
    expect(e.estado).toBe('en_rango');
    expect(e.mensaje).not.toBe('');
    expect(e.corregido).toBe(23);
  });

  it('marca fuera de rango y ofrece el borde más cercano', () => {
    expect(evaluar(40, rec).estado).toBe('fuera_de_rango');
    expect(evaluar(40, rec).corregido).toBe(rec.max);
    expect(evaluar(5, rec).corregido).toBe(rec.min);
  });

  it('no bloquea nada cuando no hay recomendación', () => {
    const sin = separacionZanjas({ pendiente_pct: 60 });
    expect(evaluar(99, sin).estado).toBe('en_rango');
    expect(acotar(99, sin)).toBe(99);
  });

  it('acotar encierra el valor en el rango', () => {
    expect(acotar(40, rec)).toBe(rec.max);
    expect(acotar(18, rec)).toBe(18);
  });
});

describe('escurrimiento anual (tabla 8.3)', () => {
  it('lee la fila de mucha lluvia sin necesitar la evaporación', () => {
    const r = escurrimientoAnual({
      precip_anual_mm: 1400, evap_anual_mm: null,
      suelo: 'arcilloso_inelastico', confiabilidad: 8,
    });
    expect(r.aplica).toBe(true);
    expect(r.pct_min).toBe(15);
    expect(r.pct_max).toBe(25);
    expect(r.pct).toBe(20);
    expect(r.lamina_mm).toBeCloseTo(280, 1);
    expect(r.m3_por_ha).toBe(2800);
  });

  it('la confiabilidad 9 siempre da menos o igual que la 8', () => {
    const base = { precip_anual_mm: 1400, evap_anual_mm: 1200 } as const;
    for (const suelo of ['arenoso_superficial', 'areno_arcilloso', 'arcilloso_elastico'] as const) {
      const c8 = escurrimientoAnual({ ...base, suelo, confiabilidad: 8 });
      const c9 = escurrimientoAnual({ ...base, suelo, confiabilidad: 9 });
      expect(c9.pct).toBeLessThanOrEqual(c8.pct);
    }
  });

  it('elige la fila por evaporación cuando llueve poco', () => {
    const humedo = escurrimientoAnual({
      precip_anual_mm: 700, evap_anual_mm: 1100,
      suelo: 'arenoso_superficial', confiabilidad: 8,
    });
    const seco = escurrimientoAnual({
      precip_anual_mm: 700, evap_anual_mm: 1400,
      suelo: 'arenoso_superficial', confiabilidad: 8,
    });
    expect(humedo.pct_max).toBe(10);
    expect(seco.pct_max).toBe(7.5);
    expect(seco.pct).toBeLessThan(humedo.pct);
  });

  it('pide la evaporación cuando la fila la necesita y no está', () => {
    const r = escurrimientoAnual({
      precip_anual_mm: 700, evap_anual_mm: null,
      suelo: 'areno_arcilloso', confiabilidad: 8,
    });
    expect(r.aplica).toBe(false);
    expect(r.motivo).toMatch(/evaporación/i);
  });

  it('no extrapola por debajo de 250 mm', () => {
    const r = escurrimientoAnual({
      precip_anual_mm: 180, evap_anual_mm: 2000,
      suelo: 'arcilloso_inelastico', confiabilidad: 8,
    });
    expect(r.aplica).toBe(false);
    expect(r.motivo).toMatch(/250/);
  });

  it('dice claramente cuando la tabla da escurrimiento nulo', () => {
    const r = escurrimientoAnual({
      precip_anual_mm: 300, evap_anual_mm: 1900,
      suelo: 'arenoso_superficial', confiabilidad: 8,
    });
    expect(r.aplica).toBe(true);
    expect(r.pct).toBe(0);
    expect(r.m3_por_ha).toBe(0);
    expect(r.nota).toMatch(/nulo/i);
  });
});

describe('claseSueloSugerida', () => {
  it('un arenal cae en la clase que menos escurre, con certeza alta', () => {
    const s = claseSueloSugerida(10, 70);
    expect(s.clase).toBe('arenoso_superficial');
    expect(s.certeza).toBe('alta');
  });

  it('ante una arcilla se queda del lado conservador y lo explica', () => {
    const s = claseSueloSugerida(45, 20);
    expect(s.clase).toBe('arcilloso_inelastico');
    expect(s.certeza).toBe('baja');
    expect(s.nota).toMatch(/expansiva/i);
  });
});

describe('claseInfiltracionDeKsat', () => {
  it('parte el Ksat en las tres clases', () => {
    expect(claseInfiltracionDeKsat(40)).toBe('rapida');
    expect(claseInfiltracionDeKsat(10)).toBe('media');
    expect(claseInfiltracionDeKsat(2)).toBe('lenta');
  });

  it('sin dato de suelo no inventa una clase', () => {
    expect(claseInfiltracionDeKsat(null)).toBeNull();
    expect(claseInfiltracionDeKsat(0)).toBeNull();
  });
});

describe('anchoCorona', () => {
  it('la corona crece con la altura del muro', () => {
    const bajo = anchoCorona({ alto_m: 1.5 });
    const alto = anchoCorona({ alto_m: 10 });
    expect(bajo.valor).toBeLessThan(alto.valor);
    expect(bajo.min).toBeGreaterThanOrEqual(1);
  });

  it('un muro largo suma corona y lo declara', () => {
    const corto = anchoCorona({ alto_m: 4, largo_m: 40 });
    const largo = anchoCorona({ alto_m: 4, largo_m: 350 });
    expect(largo.valor).toBe(corto.valor + 1);
    expect(largo.ajustes).toHaveLength(1);
  });

  it('transitable por vehículo lleva el mínimo a 3 m', () => {
    const r = anchoCorona({ alto_m: 1.5, transitable: true });
    expect(r.min).toBe(3);
    expect(r.valor).toBeGreaterThanOrEqual(3);
  });

  it('sin altura no recomienda nada', () => {
    expect(anchoCorona({ alto_m: 0 }).aplica).toBe(false);
  });

  it('el rango siempre contiene al valor sugerido', () => {
    for (const h of [0.8, 1.5, 2.5, 4, 6, 10, 20]) {
      for (const transitable of [false, true]) {
        const r = anchoCorona({ alto_m: h, transitable, largo_m: 150 });
        expect(r.valor).toBeGreaterThanOrEqual(r.min);
        expect(r.valor).toBeLessThanOrEqual(r.max);
      }
    }
  });
});

describe('taludesSugeridos', () => {
  it('el talud interno va siempre más tendido que el externo', () => {
    for (const suelo of ['arenoso_superficial', 'areno_arcilloso', 'arcilloso_elastico', 'arcilloso_inelastico', null] as const) {
      for (const alto of [2, 8]) {
        const t = taludesSugeridos(suelo, alto);
        expect(t.interno).toBeGreaterThanOrEqual(t.externo);
      }
    }
  });

  it('un muro alto pide taludes más tendidos que uno bajo', () => {
    expect(taludesSugeridos('areno_arcilloso', 8).interno)
      .toBeGreaterThan(taludesSugeridos('areno_arcilloso', 2).interno);
  });
});
