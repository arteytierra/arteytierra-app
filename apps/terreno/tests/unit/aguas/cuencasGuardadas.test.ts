/**
 * Archivo de cuencas. Lo que se cuida acá es que archivar no engorde el
 * proyecto (fuera las celdas del raster) y que "la misma cuenca" signifique
 * lo que tiene que significar: misma salida Y mismos parámetros, porque el
 * mismo punto con otra tormenta es otro escenario y vale guardarlo aparte.
 */
import { describe, it, expect } from 'vitest';
import {
  crearCuencaGuardada, yaArchivada, resumenCuenca, COLORES_CUENCA,
  type ParamsCuenca,
} from '@/lib/cuencasGuardadas';
import { analizarCuenca, type Cuenca } from '@/lib/cuenca';

const CUENCA: Cuenca = {
  celdas: ['0,0', '0,1', '1,0', '1,1'],
  poligono: [{ lat: -34, lng: -58 }, { lat: -34.001, lng: -58 }, { lat: -34.001, lng: -58.001 }],
  area_m2: 100_000, area_ha: 10, area_km2: 0.1,
  long_flujo_m: 1000, pendiente_m_m: 0.05,
  elev_salida: 100, elev_max: 150, outlet: { lat: -34, lng: -58 },
};

const PARAMS: ParamsCuenca = { coberturaId: 'pastura_regular', grupo: 'B', precip_mm: 100, head_m: 0.3 };
const RES = analizarCuenca(CUENCA, 69, 100);

const crear = (existentes = []) => crearCuencaGuardada(CUENCA, PARAMS, RES, true, existentes);

describe('crearCuencaGuardada', () => {
  it('no guarda las celdas del raster: son miles y no las usa nadie después', () => {
    expect(crear().cuenca.celdas).toEqual([]);
    expect(crear().cuenca.poligono).toEqual(CUENCA.poligono);
  });

  it('conserva la ficha entera: con qué se calculó y qué dio', () => {
    const g = crear();
    expect(g.params).toEqual(PARAMS);
    expect(g.resultado.caudal_pico_m3s).toBe(RES.caudal_pico_m3s);
    expect(g.resultado.vertedero_m).toBe(RES.vertedero_m);
    expect(g.expandida).toBe(true);
  });

  it('numera sin repetir y va rotando los colores', () => {
    const a = crear();
    const b = crearCuencaGuardada(CUENCA, PARAMS, RES, true, [a]);
    expect(a.nombre).toBe('Cuenca 1');
    expect(b.nombre).toBe('Cuenca 2');
    expect(a.color).toBe(COLORES_CUENCA[0]);
    expect(b.color).toBe(COLORES_CUENCA[1]);
  });

  it('salta el número tomado si el usuario renombró alguna', () => {
    const a = { ...crear(), nombre: 'Cuenca de la represa' };
    expect(crearCuencaGuardada(CUENCA, PARAMS, RES, true, [a]).nombre).toBe('Cuenca 1');
  });
});

describe('yaArchivada', () => {
  it('reconoce la misma cuenca con los mismos parámetros', () => {
    const g = crear();
    expect(yaArchivada(CUENCA, PARAMS, [g])?.id).toBe(g.id);
  });

  it('la misma salida con otra tormenta es otro escenario', () => {
    const g = crear();
    expect(yaArchivada(CUENCA, { ...PARAMS, precip_mm: 140 }, [g])).toBeNull();
    expect(yaArchivada(CUENCA, { ...PARAMS, grupo: 'D' }, [g])).toBeNull();
    expect(yaArchivada(CUENCA, { ...PARAMS, coberturaId: 'barbecho' }, [g])).toBeNull();
  });

  it('otra salida es otra cuenca aunque los parámetros coincidan', () => {
    const g = crear();
    const otra = { ...CUENCA, outlet: { lat: -34.02, lng: -58.02 } };
    expect(yaArchivada(otra, PARAMS, [g])).toBeNull();
  });

  it('sin nada archivado no hay coincidencia', () => {
    expect(yaArchivada(CUENCA, PARAMS, [])).toBeNull();
  });
});

describe('resumenCuenca', () => {
  it('lista lo que distingue una cuenca de otra', () => {
    const r = resumenCuenca(crear());
    expect(r).toContain('10 ha');
    expect(r).toContain('pico');
    expect(r).toContain('vertedero');
  });
});
