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
  it('reconoce los doce países y sólo esos doce', () => {
    expect(paisNacionalDelPunto(u('Bolivia'))?.iso2).toBe('BO');
    expect(paisNacionalDelPunto(u('Colombia'))?.iso2).toBe('CO');
    expect(paisNacionalDelPunto(u('Ecuador'))?.iso2).toBe('EC');
    expect(paisNacionalDelPunto(u('Uruguay'))?.iso2).toBe('UY');
    expect(paisNacionalDelPunto(u('Canada'))?.iso2).toBe('CA');
    expect(paisNacionalDelPunto(u('Guatemala'))?.iso2).toBe('GT');
    expect(paisNacionalDelPunto(u('Panamá'))?.iso2).toBe('PA');
    expect(paisNacionalDelPunto(u('Nicaragua'))?.iso2).toBe('NI');
    expect(paisNacionalDelPunto(u('Costa Rica'))?.iso2).toBe('CR');
    expect(paisNacionalDelPunto(u('El Salvador'))?.iso2).toBe('SV');
    expect(paisNacionalDelPunto(u('San Vicente y las Granadinas'))?.iso2).toBe('VC');
    expect(paisNacionalDelPunto(u('Estados Unidos'))?.iso2).toBe('US');
    expect(paisNacionalDelPunto(u('United States'))?.iso2).toBe('US');
    expect(PAISES_NACIONAL).toHaveLength(12);
  });

  it('no contesta por los países que ya tienen dato local', () => {
    // Si contestara, el predio brasileño vería dos bloques diciendo cosas
    // distintas sobre lo mismo.
    for (const p of ['Argentina', 'Chile', 'Paraguay', 'Perú', 'Brasil', 'Brazil', 'México']) {
      expect(paisNacionalDelPunto(u(p)), p).toBeNull();
    }
  });

  it('Groenlandia no entra, porque su registro no pregunta por pueblo', () => {
    // No es olvido y no es falta de permiso: el registro de población danés no
    // tiene pregunta étnica, así que no hay ninguna cifra de pueblo que citar.
    // Los 56.740 habitantes y los 49.721 nacidos en Groenlandia son otra cosa.
    for (const p of ['Groenlandia', 'Greenland', 'Kalaallit Nunaat']) {
      expect(paisNacionalDelPunto(u(p)), p).toBeNull();
    }
  });

  it('Estados Unidos entra con AIAN alone y dice que existe la otra cifra', () => {
    // Son 3.727.135 «alone» contra 9.666.058 «alone or in combination». La
    // segunda cuenta respuestas y no personas: la tabla del propio Census Bureau
    // advierte que su suma pasa la población total. Si alguien cambia el total por
    // el más grande, este test lo frena.
    const us = PAISES_NACIONAL.find(p => p.iso2 === 'US')!;
    expect(us.total).toBe(3_727_135);
    expect(us.base).toBe(331_449_281);
    expect(us.loQueNoDice.some(t => t.includes('9.666.058'))).toBe(true);
    // Y la trampa de la casilla: incluye indígenas de América Latina.
    expect(us.loQueNoDice.some(t => /Mayan|Aztec/.test(t))).toBe(true);
    // La licencia no está declarada, así que es cita y no hay atribución exigida.
    expect(us.permiso).toBe('solo_cita');
    expect(us.atribucionExigida).toBeNull();
    expect(us.licencia).toMatch(/deducci/);
  });

  it('los siete de Centroamérica y el Caribe que no entran siguen en null', () => {
    // No es olvido y cada uno tiene su motivo, anotado en el relevamiento:
    // Belice publica sólo porcentajes; República Dominicana no pregunta por
    // pueblo indígena —sus categorías fueron de color de piel—; Honduras,
    // Trinidad y Tobago, Cuba, Haití y Dominica no se pudieron abrir o no
    // traen el dato. Si alguno entra, hay que sacarlo de esta lista a mano.
    for (const p of ['Belice', 'Honduras', 'República Dominicana', 'Cuba', 'Haití', 'Dominica', 'Trinidad y Tobago']) {
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

  it('cada ficha trae algo contable: total, porcentaje publicado o desglose', () => {
    // Si las tres cosas faltan no hay nada que mostrar, y la tarjeta quedaría
    // diciendo el nombre del censo y nada más.
    //
    // El desglose entró como tercera opción por Guatemala: el INE publica
    // Maya, Garífuna y Xinka por separado y ningún total «indígena». Sumarlos
    // sería un cálculo nuestro, así que la ficha muestra los tres y ninguna
    // suma.
    for (const p of PAISES_NACIONAL) {
      const contable = p.total !== null || p.porcentajePublicado !== null || p.desglose.length > 0;
      expect(contable, p.pais).toBe(true);
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

  it('sólo Canadá y Guatemala tienen licencia abierta; el resto es cita', () => {
    // La distinción manda: con licencia abierta se puede montar el tabulado;
    // con cita, sólo decir la cifra con atribución.
    const abiertas = PAISES_NACIONAL.filter(p => p.permiso === 'licencia_abierta').map(p => p.iso2);
    expect(abiertas.sort()).toEqual(['CA', 'GT']);
    for (const iso of ['BO', 'CO', 'EC', 'UY', 'US', 'PA', 'NI', 'CR', 'SV', 'VC']) {
      expect(PAISES_NACIONAL.find(p => p.iso2 === iso)!.permiso, iso).toBe('solo_cita');
    }
  });

  it('el que tiene licencia abierta arrastra su atribución', () => {
    // CC BY no exige una frase textual como StatCan, pero sí exige atribuir:
    // sin este campo el uso no está cubierto.
    for (const p of PAISES_NACIONAL.filter(x => x.permiso === 'licencia_abierta')) {
      expect(p.atribucionExigida, p.pais).toBeTruthy();
    }
  });

  it('Guatemala no suma sus tres pueblos, y lo dice', () => {
    // 6.207.503 + 19.529 + 264.167 = 6.491.199, un número que el INE no
    // publica. Si alguien lo pone como total, este test lo frena.
    const gt = PAISES_NACIONAL.find(p => p.iso2 === 'GT')!;
    expect(gt.total).toBeNull();
    expect(gt.desglose).toHaveLength(3);
    expect(gt.loQueNoDice.some(t => t.includes('6.491.199'))).toBe(true);
  });

  it('Nicaragua no divide, porque su total no es «población indígena»', () => {
    // Incluye Creole y Mestizo de la Costa Caribe. Un porcentaje etiquetado
    // «indígena» sobre ese numerador diría algo falso.
    const ni = PAISES_NACIONAL.find(p => p.iso2 === 'NI')!;
    expect(ni.base).toBeNull();
    expect(porcentajeNacional(ni)).toBeNull();
    expect(ni.loQueNoDice.some(t => t.includes('Creole'))).toBe(true);
  });

  it('Panamá arrastra la contradicción de su propia licencia', () => {
    // La página declara CC BY 4.0 arriba y «todos los derechos reservados»
    // abajo. Hasta que se aclare, es cita: el texto lo dice para que nadie
    // lo monte creyendo que está habilitado.
    const pa = PAISES_NACIONAL.find(p => p.iso2 === 'PA')!;
    expect(pa.permiso).toBe('solo_cita');
    expect(pa.licencia).toMatch(/contradice|Todos los derechos reservados/);
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
