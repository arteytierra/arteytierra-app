import { describe, it, expect } from 'vitest';
import {
  PAISES_NACIONAL, paisNacionalDelPunto, porcentajeNacional,
} from '@/lib/pueblosOriginariosNacional';
import type { Ubicacion } from '@/lib/entorno';

/**
 * Esta capa imprime una cifra de población en un informe que alguien lee sin
 * nosotros al lado. Lo que estos tests cuidan no es que devuelva un número: es
 * que no devuelva uno donde la fuente no publica ninguno, que no invente un
 * porcentaje donde el organismo publica otro, y que no conteste por un país que
 * ya contesta otra capa.
 */

const u = (pais: string | null): Ubicacion => ({
  localidad: null, departamento: null, provincia: null, pais,
});

describe('paisNacionalDelPunto', () => {
  it('reconoce los cinco países y sólo esos cinco', () => {
    expect(paisNacionalDelPunto(u('Bolivia'))?.iso2).toBe('BO');
    expect(paisNacionalDelPunto(u('Colombia'))?.iso2).toBe('CO');
    expect(paisNacionalDelPunto(u('Ecuador'))?.iso2).toBe('EC');
    expect(paisNacionalDelPunto(u('Uruguay'))?.iso2).toBe('UY');
    expect(paisNacionalDelPunto(u('Canada'))?.iso2).toBe('CA');
  });

  it('no contesta por los países que ya tienen dato local', () => {
    // Si contestara, el predio brasileño vería dos bloques diciendo cosas
    // distintas sobre lo mismo.
    for (const p of ['Argentina', 'Chile', 'Paraguay', 'Perú', 'Brasil', 'Brazil', 'México']) {
      expect(paisNacionalDelPunto(u(p)), p).toBeNull();
    }
  });

  it('aguanta los rótulos que devuelve el geocodificador', () => {
    expect(paisNacionalDelPunto(u('Canadá'))?.iso2).toBe('CA');
    expect(paisNacionalDelPunto(u('Canada / Canadá'))?.iso2).toBe('CA');
    expect(paisNacionalDelPunto(u('Estado Plurinacional de Bolivia'))?.iso2).toBe('BO');
    expect(paisNacionalDelPunto(u('República Oriental del Uruguay'))?.iso2).toBe('UY');
  });

  it('devuelve null sin ubicación, en vez de adivinar', () => {
    expect(paisNacionalDelPunto(null)).toBeNull();
    expect(paisNacionalDelPunto(u(null))).toBeNull();
  });
});

describe('porcentajeNacional — no se inventa ninguno', () => {
    it('no da porcentaje para Colombia, porque el DANE publica otro con otra base', () => {
    // Dividir 1.905.617 por 44.164.417 daría 4,3% y el DANE difunde 4,4% sobre
    // las personas que informaron pertenencia étnica. Mostrar el nuestro sería
    // contradecir a la fuente que estamos citando.
    const co = PAISES_NACIONAL.find(p => p.iso2 === 'CO')!;
    expect(co.base).toBeNull();
    expect(porcentajeNacional(co)).toBeNull();
  });

  it('usa el porcentaje que publica el organismo cuando lo publica', () => {
    const uy = PAISES_NACIONAL.find(p => p.iso2 === 'UY')!;
    expect(porcentajeNacional(uy)).toBe('6,3');
    const ca = PAISES_NACIONAL.find(p => p.iso2 === 'CA')!;
    expect(porcentajeNacional(ca)).toBe('5,0');
  });

  it('en Bolivia divide por la base del cuadro, no por la población censada', () => {
    // 11.124.437 y no 11.365.333: el cuadro del INE excluye 240.896 sin
    // respuesta, y usar el total cambia el porcentaje publicado.
    const bo = PAISES_NACIONAL.find(p => p.iso2 === 'BO')!;
    expect(bo.base).toBe(11_124_437);
    expect(porcentajeNacional(bo)).toBe('38,7');   // coma, que es como escribe la app
  });
});

describe('el contrato de cada ficha', () => {
  it('Uruguay no trae total, porque el INE no publica uno', () => {
    const uy = PAISES_NACIONAL.find(p => p.iso2 === 'UY')!;
    expect(uy.total).toBeNull();
    expect(uy.porcentajePublicado).toBe('6,3');
  });

  it('una ficha sin total tiene que traer porcentaje publicado, y al revés', () => {
    // Si las dos cosas faltan no hay nada que mostrar, y la tarjeta quedaría
    // diciendo el nombre del censo y nada más.
    for (const p of PAISES_NACIONAL) {
      expect(p.total !== null || p.porcentajePublicado !== null, p.pais).toBe(true);
    }
  });

  it('cada ficha dice por qué no hay dato local y qué no dice el número', () => {
    for (const p of PAISES_NACIONAL) {
      expect(p.porQueNoHayDatoLocal.length, p.pais).toBeGreaterThan(20);
      expect(p.loQueNoDice.length, p.pais).toBeGreaterThanOrEqual(3);
      expect(p.fuente.url.startsWith('https://'), p.pais).toBe(true);
      expect(p.licencia.length, p.pais).toBeGreaterThan(10);
    }
  });

  it('los cuatro que esperan autorización quedan marcados como solo_cita', () => {
    for (const iso of ['BO', 'CO', 'EC', 'UY']) {
      expect(PAISES_NACIONAL.find(p => p.iso2 === iso)!.permiso, iso).toBe('solo_cita');
    }
    expect(PAISES_NACIONAL.find(p => p.iso2 === 'CA')!.permiso).toBe('licencia_abierta');
  });

  it('Canadá arrastra la atribución textual que exige Statistics Canada', () => {
    // Es una condición de la licencia, no una cortesía: sin esta frase el uso
    // derivado no está cubierto.
    const ca = PAISES_NACIONAL.find(p => p.iso2 === 'CA')!;
    expect(ca.atribucionExigida).toContain('Adapted from Statistics Canada');
    expect(ca.atribucionExigida).toContain('does not constitute an endorsement');
  });

  it('el desglose canadiense no suma el total, y eso está dicho', () => {
    // 1.048.405 + 624.220 + 70.545 = 1.743.170, no 1.807.250. StatCan redondea
    // a múltiplos de 5 y hay identidades múltiples. Si alguien "arregla" los
    // números para que cierren, este test lo frena.
    const ca = PAISES_NACIONAL.find(p => p.iso2 === 'CA')!;
    const suma = ca.desglose.reduce((a, d) => a + d.personas, 0);
    expect(suma).toBeLessThan(ca.total!);
    expect(ca.loQueNoDice.some(t => t.includes('no suman el total'))).toBe(true);
  });

  it('no hay dos países con el mismo alias', () => {
    const vistos = new Set<string>();
    for (const p of PAISES_NACIONAL) {
      for (const a of p.alias) {
        expect(vistos.has(a), a).toBe(false);
        vistos.add(a);
      }
    }
  });
});
