import { describe, it, expect } from 'vitest';
import {
  hidrologiaPredio, resolucionDem, USLE_C_REF, T_POR_DEFECTO,
  type EntradaHidro,
} from '@/lib/hidrologiaPredio';
import { escurrimientoSCS } from '@/lib/cuenca';

/** Serie de tormentas con forma realista (crece con T), 40 años de registro. */
const TORMENTA = {
  anios: 40,
  recurrencias: [
    { periodo_retorno: 2,   mm: 62 },
    { periodo_retorno: 5,   mm: 84 },
    { periodo_retorno: 10,  mm: 99 },
    { periodo_retorno: 25,  mm: 117 },
    { periodo_retorno: 50,  mm: 131 },
    { periodo_retorno: 100, mm: 145 },
  ],
};

const SUELO_C = { grupo: 'C' as const, ksat_mm_h: 8.4, capa_limitante: '30-60cm' };

/** Predio completo: suelo, cobertura y clima cargados. */
const COMPLETO: EntradaHidro = {
  suelo: SUELO_C,
  cobertura: [{ wc: 30, pct: 60 }, { wc: 10, pct: 30 }, { wc: 40, pct: 10 }],
  tormenta: TORMENTA,
};

describe('hidrologiaPredio · CN compuesto', () => {
  it('pondera el CN por área, entre el de la cobertura más baja y la más alta', () => {
    const h = hidrologiaPredio(COMPLETO);
    // pastizal→pastura_regular C=79 · bosque→monte_regular C=73 · cultivo→cultivo_bueno C=85
    const esperado = 0.6 * 79 + 0.3 * 73 + 0.1 * 85;
    expect(h.cn).toBeCloseTo(esperado, 1);
    expect(h.cn).toBeGreaterThan(73);
    expect(h.cn).toBeLessThan(85);
  });

  it('usa el grupo hidrológico del suelo: el mismo predio en A escurre menos que en D', () => {
    const enA = hidrologiaPredio({ ...COMPLETO, suelo: { ...SUELO_C, grupo: 'A' } });
    const enD = hidrologiaPredio({ ...COMPLETO, suelo: { ...SUELO_C, grupo: 'D' } });
    expect(enA.cn).toBeLessThan(enD.cn);
    expect(enA.coef).toBeLessThan(enD.coef);
  });

  it('cae en pastura regular cuando no hay cobertura, y lo avisa', () => {
    const h = hidrologiaPredio({ ...COMPLETO, cobertura: null });
    expect(h.cn).toBe(79);   // pastura_regular en grupo C
    expect(h.confianza.avisos.map(a => a.id)).toContain('sin_cobertura');
    expect(h.confianza.fuentes.cobertura).toBe(false);
  });

  it('trata el agua y el humedal con CN fijo, sin mirar el grupo del suelo', () => {
    const lago = { cobertura: [{ wc: 80, pct: 100 }], tormenta: TORMENTA };
    expect(hidrologiaPredio({ ...lago, suelo: { ...SUELO_C, grupo: 'A' } }).cn).toBe(100);
    expect(hidrologiaPredio({ ...lago, suelo: { ...SUELO_C, grupo: 'D' } }).cn).toBe(100);
  });

  it('ignora clases desconocidas y avisa si pesan', () => {
    const h = hidrologiaPredio({ ...COMPLETO, cobertura: [{ wc: 30, pct: 70 }, { wc: 999, pct: 30 }] });
    expect(h.cn).toBe(79);   // el CN sale sólo del 70 % mapeable
    expect(h.confianza.avisos.map(a => a.id)).toContain('cobertura_parcial');
  });
});

describe('hidrologiaPredio · tormenta y coeficiente', () => {
  it('toma la lluvia del período de retorno pedido', () => {
    expect(hidrologiaPredio({ ...COMPLETO, periodoRetorno: 2 }).precip_mm).toBe(62);
    expect(hidrologiaPredio({ ...COMPLETO, periodoRetorno: 100 }).precip_mm).toBe(145);
  });

  it('usa T10 por defecto', () => {
    const h = hidrologiaPredio(COMPLETO);
    expect(h.periodoRetorno).toBe(T_POR_DEFECTO);
    expect(h.precip_mm).toBe(99);
  });

  it('deriva el coeficiente del SCS-CN en vez de pedirlo a ojo', () => {
    const h = hidrologiaPredio(COMPLETO);
    const Q = escurrimientoSCS(h.precip_mm, h.cn);
    expect(h.coef).toBeCloseTo(Q / h.precip_mm, 2);
    expect(h.escurrimiento_mm).toBeCloseTo(Q, 0);
  });

  it('el coeficiente crece con el período de retorno (más lluvia, proporcionalmente más escurre)', () => {
    const t2   = hidrologiaPredio({ ...COMPLETO, periodoRetorno: 2 });
    const t100 = hidrologiaPredio({ ...COMPLETO, periodoRetorno: 100 });
    expect(t100.coef).toBeGreaterThan(t2.coef);
  });

  it('sin clima asume 50 mm y lo marca como alerta', () => {
    const h = hidrologiaPredio({ ...COMPLETO, tormenta: null });
    expect(h.precip_mm).toBe(50);
    expect(h.precipAsumida).toBe(true);
    const aviso = h.confianza.avisos.find(a => a.id === 'sin_clima');
    expect(aviso?.nivel).toBe('alerta');
  });

  it('avisa cuando el período de retorno excede la serie disponible', () => {
    const h = hidrologiaPredio({ ...COMPLETO, tormenta: { ...TORMENTA, anios: 15 }, periodoRetorno: 100 });
    expect(h.confianza.avisos.map(a => a.id)).toContain('T_extrapolado');
  });
});

describe('hidrologiaPredio · confianza', () => {
  it('es alta sólo con las tres fuentes cargadas y sin alertas', () => {
    const h = hidrologiaPredio(COMPLETO);
    expect(h.confianza.nivel).toBe('alta');
    expect(h.confianza.fuentes).toEqual({ suelo: true, cobertura: true, clima: true });
  });

  it('baja a media si falta una fuente no crítica', () => {
    expect(hidrologiaPredio({ ...COMPLETO, suelo: null }).confianza.nivel).toBe('media');
  });

  it('es baja si falta el clima, aunque el resto esté', () => {
    expect(hidrologiaPredio({ ...COMPLETO, tormenta: null }).confianza.nivel).toBe('baja');
  });

  it('nunca tira: sin ningún dato devuelve números y lo declara', () => {
    const h = hidrologiaPredio({});
    expect(h.cn).toBeGreaterThan(0);
    expect(h.precip_mm).toBe(50);
    expect(h.grupo).toBe('B');
    expect(h.grupoAsumido).toBe(true);
    expect(h.confianza.nivel).toBe('baja');
    const ids = h.confianza.avisos.map(a => a.id);
    expect(ids).toContain('sin_suelo');
    expect(ids).toContain('sin_cobertura');
    expect(ids).toContain('sin_clima');
  });
});

describe('hidrologiaPredio · avisos de contexto', () => {
  it('alerta si el DEM es grueso para el tamaño del predio', () => {
    const h = hidrologiaPredio({ ...COMPLETO, contexto: { fuenteDem: 'glo30', area_ha: 4 } });
    const a = h.confianza.avisos.find(x => x.id === 'dem_grueso');
    expect(a?.nivel).toBe('alerta');
    expect(a?.titulo).toContain('30 m');
  });

  it('no molesta cuando el DEM alcanza sobradamente', () => {
    const h = hidrologiaPredio({ ...COMPLETO, contexto: { fuenteDem: 'glo30', area_ha: 800 } });
    const ids = h.confianza.avisos.map(x => x.id);
    expect(ids).not.toContain('dem_grueso');
    expect(ids).not.toContain('dem_justo');
  });

  it('marca la pendiente fuera del rango de swales', () => {
    const alta = hidrologiaPredio({ ...COMPLETO, contexto: { pendiente_pct: 22 } });
    expect(alta.confianza.avisos.find(a => a.id === 'pendiente_alta')?.nivel).toBe('alerta');
    const baja = hidrologiaPredio({ ...COMPLETO, contexto: { pendiente_pct: 0.4 } });
    expect(baja.confianza.avisos.map(a => a.id)).toContain('pendiente_baja');
  });

  it('avisa cuando la cuenca de aporte se sale de la grilla', () => {
    const h = hidrologiaPredio({ ...COMPLETO, contexto: { fueraDeGrilla: true } });
    expect(h.confianza.avisos.find(a => a.id === 'fuera_grilla')?.detalle).toContain('SUBESTIMADO');
  });

  it('conoce la resolución de cada fuente de relieve', () => {
    expect(resolucionDem('glo30')).toBe(30);
    expect(resolucionDem('ignfr')).toBe(5);
    expect(resolucionDem('usuario')).toBeNull();   // DEM propio: no se sabe
    expect(resolucionDem(undefined)).toBeNull();
  });
});

describe('hidrologiaPredio · factor C para erosión', () => {
  it('el monte cerrado da un C mucho menor que el suelo desnudo', () => {
    const monte  = hidrologiaPredio({ ...COMPLETO, cobertura: [{ wc: 10, pct: 100 }] });
    const pelado = hidrologiaPredio({ ...COMPLETO, cobertura: [{ wc: 60, pct: 100 }] });
    expect(monte.usleC).toBeLessThan(pelado.usleC);
    expect(monte.usleC).toBeLessThan(USLE_C_REF);
    expect(pelado.usleC).toBeGreaterThan(USLE_C_REF);
  });

  it('un pastizal puro queda en el C de referencia', () => {
    expect(hidrologiaPredio({ ...COMPLETO, cobertura: [{ wc: 30, pct: 100 }] }).usleC).toBeCloseTo(USLE_C_REF, 3);
  });
});
