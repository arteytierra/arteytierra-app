import { describe, it, expect } from 'vitest';
import {
  confianzaCuenca, confianzaRepresa, confianzaErosion,
  type EntradaCuencaSalud, type EntradaRepresaSalud, type EntradaErosionSalud,
} from '@/lib/saludCalculo';
import { armarConfianza, type AvisoCalculo } from '@/lib/hidrologiaPredio';

const ids = (c: { avisos: AvisoCalculo[] }) => c.avisos.map(a => a.id);
const nivelDe = (c: { avisos: AvisoCalculo[] }, id: string) => c.avisos.find(a => a.id === id)?.nivel;

/**
 * Caso "todo cargado": cuenca de 40 ha sobre un DEM de 10 m (3DEP). Con esa
 * relación el DEM alcanza sobradamente y la cuenca entra en el rango de
 * Kirpich, así que no debería quedar ninguna observación pendiente.
 */
const CUENCA_OK: EntradaCuencaSalud = {
  area_ha: 40, long_flujo_m: 900, cn: 78,
  precip_mm: 99, escurrimiento_mm: 42,
  precipDeClima: true, grupoDeSuelo: true, expandida: true,
  fuenteDem: 'usgs3dep',
};

describe('armarConfianza', () => {
  it('una alerta manda a confianza baja, aunque esté todo cargado', () => {
    const c = armarConfianza([{ id: 'x', nivel: 'alerta', titulo: 't', detalle: 'd' }], { relieve: true });
    expect(c.nivel).toBe('baja');
  });

  it('dos fuentes faltantes bajan igual que una alerta', () => {
    expect(armarConfianza([], { suelo: false, clima: false }).nivel).toBe('baja');
    expect(armarConfianza([], { suelo: false, clima: true }).nivel).toBe('media');
  });

  it('los avisos de nivel ok no bajan el nivel: son alcance del método', () => {
    const c = armarConfianza(
      [{ id: 'metodo', nivel: 'ok', titulo: 't', detalle: 'd' }],
      { relieve: true, suelo: true, clima: true },
    );
    expect(c.nivel).toBe('alta');
  });
});

describe('confianzaCuenca', () => {
  it('con todo cargado y la cuenca extendida, la confianza es alta', () => {
    const c = confianzaCuenca(CUENCA_OK);
    expect(c.nivel).toBe('alta');
    expect(c.avisos.every(a => a.nivel === 'ok')).toBe(true);
  });

  it('avisa que la cuenca acotada al terreno SUBESTIMA el aporte', () => {
    const c = confianzaCuenca({ ...CUENCA_OK, expandida: false });
    expect(nivelDe(c, 'cuenca_acotada')).toBe('alerta');
    expect(c.avisos.find(a => a.id === 'cuenca_acotada')?.detalle).toContain('SUBESTIMADA');
    expect(c.nivel).toBe('baja');
  });

  it('distingue la tormenta del lugar de la puesta a mano', () => {
    expect(ids(confianzaCuenca(CUENCA_OK))).not.toContain('sin_clima');
    const aMano = confianzaCuenca({ ...CUENCA_OK, precipDeClima: false });
    expect(nivelDe(aMano, 'sin_clima')).toBe('alerta');
    expect(aMano.fuentes.clima).toBe(false);
  });

  it('marca el grupo hidrológico elegido a mano sin llegar a alerta', () => {
    const c = confianzaCuenca({ ...CUENCA_OK, grupoDeSuelo: false });
    expect(nivelDe(c, 'sin_suelo')).toBe('aviso');
    expect(c.nivel).toBe('media');
  });

  it('avisa cuando la cuenca se pasa del rango de calibración de Kirpich', () => {
    expect(ids(confianzaCuenca(CUENCA_OK))).not.toContain('kirpich_rango');
    const grande = confianzaCuenca({ ...CUENCA_OK, area_ha: 400 });
    expect(nivelDe(grande, 'kirpich_rango')).toBe('aviso');
    expect(grande.avisos.find(a => a.id === 'kirpich_rango')?.detalle).toContain('SOBREESTIMA');
  });

  it('contrasta el CN elegido con el que da la cobertura satelital', () => {
    expect(ids(confianzaCuenca({ ...CUENCA_OK, cnPredio: 80 }))).not.toContain('cn_vs_satelital');
    const lejos = confianzaCuenca({ ...CUENCA_OK, cn: 90, cnPredio: 74 });
    expect(nivelDe(lejos, 'cn_vs_satelital')).toBe('aviso');
    expect(lejos.avisos.find(a => a.id === 'cn_vs_satelital')?.detalle).toContain('MÁS');
  });

  it('avisa el escurrimiento cero, que da un vertedero de la nada', () => {
    const c = confianzaCuenca({ ...CUENCA_OK, escurrimiento_mm: 0 });
    expect(nivelDe(c, 'sin_escurrimiento')).toBe('alerta');
  });

  it('juzga el DEM contra el tamaño de la cuenca, no del predio', () => {
    const c = confianzaCuenca({ ...CUENCA_OK, area_ha: 3, fuenteDem: 'glo30' });
    expect(nivelDe(c, 'dem_grueso')).toBe('alerta');
    expect(c.avisos.find(a => a.id === 'dem_grueso')?.titulo).toContain('una cuenca');
  });

  it('no declara la cobertura como fuente: acá se elige a mano', () => {
    const c = confianzaCuenca(CUENCA_OK);
    expect(c.fuentes.cobertura).toBeUndefined();
    expect(c.fuentes).toEqual({ relieve: true, suelo: true, clima: true });
  });

  it('siempre deja dicho que el CN corre en humedad antecedente media', () => {
    expect(nivelDe(confianzaCuenca(CUENCA_OK), 'amc_ii')).toBe('ok');
  });

  it('cuenta de qué ráfaga sale el pico, sin bajar el nivel por eso', () => {
    expect(ids(confianzaCuenca(CUENCA_OK))).not.toContain('rafaga_desagregada');
    const c = confianzaCuenca({ ...CUENCA_OK, duracion_min: 24.5, intensidad_mm_h: 96 });
    const a = c.avisos.find(x => x.id === 'rafaga_desagregada')!;
    expect(a.nivel).toBe('ok');
    expect(a.titulo).toContain('24.5 min');
    expect(a.detalle).toContain('IDF');
    expect(c.nivel).toBe('alta');
  });

  it('avisa cuando la ráfaga se recortó contra el piso de duración', () => {
    const corto = confianzaCuenca({ ...CUENCA_OK, duracion_min: 10, intensidad_mm_h: 150 });
    expect(corto.avisos.find(x => x.id === 'rafaga_desagregada')?.detalle).toContain('se recortó');
  });

  it('arriba de 200 ha avisa que tampoco corresponde el método racional', () => {
    const media = confianzaCuenca({ ...CUENCA_OK, area_ha: 120 });
    expect(media.avisos.find(a => a.id === 'kirpich_rango')?.detalle).not.toContain('racional');
    const grande = confianzaCuenca({ ...CUENCA_OK, area_ha: 900 });
    expect(grande.avisos.find(a => a.id === 'kirpich_rango')?.detalle).toContain('racional');
  });
});

const REPRESA_OK: EntradaRepresaSalud = {
  hayClima: true, area_espejo_m2: 10_000, cuenca_ha: 30,
  cuencaCalculada: true, infiltracion_mm_dia: 3, grupo: 'C',
  fuenteDem: 'ahnnl',
};

describe('confianzaRepresa', () => {
  it('con clima, suelo pesado y cuenca calculada, la confianza es alta', () => {
    const c = confianzaRepresa(REPRESA_OK);
    expect(c.nivel).toBe('alta');
    expect(nivelDe(c, 'vaso_estanco')).toBe('ok');
  });

  it('alerta sobre el vaso que pierde en suelo arenoso', () => {
    const a = confianzaRepresa({ ...REPRESA_OK, grupo: 'A' });
    expect(nivelDe(a, 'vaso_permeable')).toBe('alerta');
    expect(a.nivel).toBe('baja');
    const b = confianzaRepresa({ ...REPRESA_OK, grupo: 'B' });
    expect(nivelDe(b, 'vaso_permeable')).toBe('aviso');
  });

  it('sin suelo cargado declara la infiltración como supuesto', () => {
    const c = confianzaRepresa({ ...REPRESA_OK, grupo: null, infiltracion_mm_dia: 3 });
    expect(nivelDe(c, 'sin_suelo')).toBe('aviso');
    expect(c.avisos.find(a => a.id === 'sin_suelo')?.titulo).toContain('3 mm/día');
    expect(c.fuentes.suelo).toBe(false);
  });

  it('avisa el área de aporte tipeada a mano, que es de donde sale todo el llenado', () => {
    const c = confianzaRepresa({ ...REPRESA_OK, cuencaCalculada: false });
    expect(nivelDe(c, 'cuenca_a_mano')).toBe('aviso');
    expect(c.avisos.find(a => a.id === 'cuenca_a_mano')?.titulo).toContain('30 ha');
  });

  it('deja claro que el balance corre sobre el año promedio, no sobre el seco', () => {
    const c = confianzaRepresa(REPRESA_OK);
    expect(nivelDe(c, 'clima_normales')).toBe('ok');
    expect(nivelDe(c, 'coef_anual')).toBe('ok');
  });

  it('mide el DEM contra el espejo de agua, que es lo que se está midiendo', () => {
    const c = confianzaRepresa({ ...REPRESA_OK, fuenteDem: 'glo30' });
    expect(nivelDe(c, 'dem_grueso')).toBe('alerta');
    expect(c.avisos.find(a => a.id === 'dem_grueso')?.titulo).toContain('un espejo de agua');
  });

  it('sin clima no hay balance, y lo dice', () => {
    const c = confianzaRepresa({ ...REPRESA_OK, hayClima: false });
    expect(nivelDe(c, 'sin_clima')).toBe('alerta');
    expect(c.fuentes.clima).toBe(false);
  });
});

const EROSION_OK: EntradaErosionSalud = {
  area_ha: 40, usle_c: 0.04,
  nota_cobertura: 'Factor C 0.040: cobertura equivalente a un pastizal medio.',
  fuenteDem: 'usgs3dep',
};

describe('confianzaErosion', () => {
  it('con relieve y cobertura cargados llega a confianza alta', () => {
    const c = confianzaErosion(EROSION_OK);
    expect(c.nivel).toBe('alta');
    expect(c.fuentes).toEqual({ relieve: true, cobertura: true });
  });

  it('no declara el clima como fuente: la erosión no lo usa', () => {
    expect(confianzaErosion(EROSION_OK).fuentes.clima).toBeUndefined();
  });

  it('sin cobertura pide cargarla y baja a media', () => {
    const c = confianzaErosion({ ...EROSION_OK, usle_c: null });
    expect(nivelDe(c, 'sin_cobertura')).toBe('aviso');
    expect(c.nivel).toBe('media');
  });

  it('arrastra la nota de cobertura y explica que C es magnitud, no dibujo', () => {
    const a = confianzaErosion(EROSION_OK).avisos.find(x => x.id === 'cobertura_magnitud')!;
    expect(a.nivel).toBe('ok');
    expect(a.detalle).toContain('pastizal medio');
    expect(a.detalle).toContain('celda por celda');
  });

  it('avisa siempre que el mapa es relativo al propio predio', () => {
    const a = confianzaErosion(EROSION_OK).avisos.find(x => x.id === 'indice_relativo')!;
    expect(a.nivel).toBe('ok');
    expect(a.detalle).toContain('normaliza');
  });

  it('declara que falta la erodabilidad K, y usa la textura si la tiene', () => {
    const sin = confianzaErosion(EROSION_OK).avisos.find(x => x.id === 'sin_erodabilidad')!;
    expect(sin.detalle).not.toContain('Tu suelo es');
    const con = confianzaErosion({ ...EROSION_OK, textura: 'franco limoso' })
      .avisos.find(x => x.id === 'sin_erodabilidad')!;
    expect(con.detalle).toContain('franco limoso');
    expect(con.nivel).toBe('ok');   // no se arregla cargando datos: no baja el nivel
  });

  it('un DEM grueso para el tamaño del predio sí baja la confianza', () => {
    const c = confianzaErosion({ ...EROSION_OK, area_ha: 4, fuenteDem: 'glo30' });
    expect(nivelDe(c, 'dem_grueso')).toBe('alerta');
    expect(c.nivel).toBe('baja');
  });
});
