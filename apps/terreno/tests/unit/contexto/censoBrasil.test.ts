/**
 * Censo brasileño 2022: que los totales cierren y que el punto caiga donde debe.
 *
 * Brasil es el primer país que contesta a escala de municipio, y eso trae un
 * problema que los otros cuatro no tenían: hay 240 nombres de municipio que se
 * repiten en más de un estado. Buscar en la lista global dejaría a esos 240 sin
 * respuesta. La mitad de este archivo cuida justamente eso.
 */
import { describe, it, expect } from 'vitest';
import { CENSO_BR, CENSO_BR_PAIS } from '@/lib/censoIndigena2022Br';
import {
  censoBrasilenoDelPunto, municipiosDestacadosBr, PORCENTAJE_PAIS_BR,
} from '@/lib/pueblosOriginarios';
import type { Ubicacion } from '@/lib/entorno';

/** Una ubicación como la que arma `/api/entorno` desde Nominatim. */
function ubi(pais: string | null, provincia: string | null, localidad: string | null): Ubicacion {
  return { localidad, departamento: null, provincia, pais };
}

describe('los totales cierran', () => {
  it('los 27 estados suman el total del país', () => {
    expect(CENSO_BR.length).toBe(27);
    const ind = CENSO_BR.reduce((a, e) => a + e.indigena, 0);
    const pob = CENSO_BR.reduce((a, e) => a + e.poblacion, 0);
    expect(ind).toBe(CENSO_BR_PAIS.indigena);
    expect(pob).toBe(CENSO_BR_PAIS.poblacion);
    // Los dos números que el IBGE publica como oficiales.
    expect(ind).toBe(1_694_836);
    expect(pob).toBe(203_080_756);
  });

  it('los municipios de cada estado suman su estado', () => {
    let total = 0;
    for (const e of CENSO_BR) {
      total += e.municipios.length;
      expect(e.municipios.reduce((a, m) => a + m.indigena, 0), e.estado).toBe(e.indigena);
      expect(e.municipios.reduce((a, m) => a + m.poblacion, 0), e.estado).toBe(e.poblacion);
    }
    expect(total).toBe(5570);
    expect(total).toBe(CENSO_BR_PAIS.municipios);
  });

  it('los dos quesitos suman el total, en el país y en cada estado', () => {
    // 1.227.642 declararon «cor ou raça indígena»; 467.194 no la declararon y
    // dijeron considerarse indígenas. La segunda pregunta sólo se hizo dentro
    // de tierras y localidades indígenas, así que los dos no son comparables
    // entre sí — pero tienen que sumar el total.
    expect(CENSO_BR_PAIS.corRaca + CENSO_BR_PAIS.seConsidera).toBe(CENSO_BR_PAIS.indigena);
    for (const e of CENSO_BR) {
      expect(e.corRaca + e.seConsidera, e.estado).toBe(e.indigena);
    }
  });

  it('el código de cada municipio empieza con el de su estado', () => {
    // No es cosmético: es como el generador cuelga cada municipio de su estado,
    // sin ningún otro cruce.
    for (const e of CENSO_BR) {
      for (const m of e.municipios) {
        expect(Math.floor(m.codigo / 100_000), m.municipio).toBe(e.codigo);
      }
    }
  });

  it('ningún municipio tiene más indígenas que habitantes', () => {
    for (const e of CENSO_BR) {
      for (const m of e.municipios) {
        expect(m.indigena, m.municipio).toBeLessThanOrEqual(m.poblacion);
        expect(m.poblacion, m.municipio).toBeGreaterThan(0);
      }
    }
  });
});

describe('dónde cae el punto', () => {
  it('sin ubicación y fuera de Brasil no inventa', () => {
    expect(censoBrasilenoDelPunto(null).estado).toBe('sin_ubicacion');
    expect(censoBrasilenoDelPunto(ubi(null, 'Amazonas', 'Codajás')).estado).toBe('sin_ubicacion');
    const fuera = censoBrasilenoDelPunto(ubi('Argentina', 'Salta', 'Iruya'));
    expect(fuera).toEqual({ estado: 'fuera_de_brasil', pais: 'Argentina' });
  });

  it('acierta el municipio por nombre del estado', () => {
    const r = censoBrasilenoDelPunto(ubi('Brasil', 'Amazonas', 'Codajás'));
    expect(r.estado).toBe('con_censo');
    if (r.estado !== 'con_censo') return;
    expect(r.uf.sigla).toBe('AM');
    expect(r.municipio.municipio).toBe('Codajás');
    expect(r.municipio.indigena).toBe(76);
    expect(r.municipio.poblacion).toBe(23_549);
  });

  it('acierta también si el geocodificador contesta la sigla', () => {
    const r = censoBrasilenoDelPunto(ubi('Brasil', 'AM', 'Codajás'));
    expect(r.estado).toBe('con_censo');
    if (r.estado !== 'con_censo') return;
    expect(r.uf.estado).toBe('Amazonas');
  });

  it('los acentos no lo frenan', () => {
    // Nominatim y el IBGE no siempre coinciden en la acentuación.
    const r = censoBrasilenoDelPunto(ubi('Brazil', 'Sao Paulo', 'Ribeirao Preto'));
    expect(r.estado).toBe('con_censo');
    if (r.estado !== 'con_censo') return;
    expect(r.municipio.municipio).toBe('Ribeirão Preto');
    expect(r.municipio.indigena).toBe(594);
  });

  it('un municipio homónimo se resuelve por el estado, no por el nombre', () => {
    // «Bom Jesus» existe en cinco estados con cinco valores distintos. Éste es
    // el caso que obliga a buscar dentro del estado: en la lista global el
    // nombre empata cinco veces y `casarNombre` —bien— no contesta.
    const piaui = censoBrasilenoDelPunto(ubi('Brasil', 'Piauí', 'Bom Jesus'));
    const catarina = censoBrasilenoDelPunto(ubi('Brasil', 'Santa Catarina', 'Bom Jesus'));
    expect(piaui.estado).toBe('con_censo');
    expect(catarina.estado).toBe('con_censo');
    if (piaui.estado !== 'con_censo' || catarina.estado !== 'con_censo') return;
    expect(piaui.municipio.indigena).toBe(321);
    expect(catarina.municipio.indigena).toBe(57);
    expect(piaui.municipio.codigo).not.toBe(catarina.municipio.codigo);
  });

  it('si el municipio no casa contesta el estado y lo dice', () => {
    // El caso del poblado rural que no es el municipio. Se responde más grueso
    // en vez de responder mal.
    const r = censoBrasilenoDelPunto(ubi('Brasil', 'Mato Grosso', 'Vila Que No Existe'));
    expect(r.estado).toBe('con_estado');
    if (r.estado !== 'con_estado') return;
    expect(r.uf.sigla).toBe('MT');
    expect(r.municipioBuscado).toBe('Vila Que No Existe');
  });

  it('sin localidad contesta el estado con el buscado en null', () => {
    const r = censoBrasilenoDelPunto(ubi('Brasil', 'Roraima', null));
    expect(r.estado).toBe('con_estado');
    if (r.estado !== 'con_estado') return;
    expect(r.uf.indigena).toBe(97_668);
    expect(r.municipioBuscado).toBeNull();
  });

  it('un estado que no existe se dice, no se adivina', () => {
    const r = censoBrasilenoDelPunto(ubi('Brasil', 'Provincia Inventada', 'Cualquiera'));
    expect(r).toEqual({ estado: 'estado_desconocido', nombre: 'Provincia Inventada' });
  });
});

describe('lo que se muestra', () => {
  it('los municipios destacados vienen ordenados y sin ceros', () => {
    const rj = CENSO_BR.find(e => e.sigla === 'RJ')!;
    const top = municipiosDestacadosBr(rj);
    expect(top.length).toBeGreaterThan(0);
    expect(top.length).toBeLessThanOrEqual(6);
    for (const m of top) expect(m.indigena).toBeGreaterThan(0);
    for (let i = 1; i < top.length; i++) {
      expect(top[i]!.indigena).toBeLessThanOrEqual(top[i - 1]!.indigena);
    }
  });

  it('el municipio más indígena de Brasil sale bien', () => {
    // São Gabriel da Cachoeira: 48.256 de 51.795 habitantes. Está acá porque es
    // el caso que prueba que el municipio dice algo que el estado esconde —
    // Amazonas entero da 12,5% y este municipio da 93%.
    const r = censoBrasilenoDelPunto(ubi('Brasil', 'Amazonas', 'São Gabriel da Cachoeira'));
    expect(r.estado).toBe('con_censo');
    if (r.estado !== 'con_censo') return;
    expect(r.municipio.indigena).toBe(48_256);
    expect(r.municipio.indigena / r.municipio.poblacion).toBeGreaterThan(0.9);
    expect(r.uf.indigena / r.uf.poblacion).toBeLessThan(0.13);
  });

  it('el porcentaje del país es el que se puede citar', () => {
    // 1.694.836 sobre 203.080.756 es 0,83%.
    expect(PORCENTAJE_PAIS_BR).toMatch(/^0[,.]8/);
  });

  it('hay municipios sin ninguna persona indígena, y eso también es dato', () => {
    const ceros = CENSO_BR.flatMap(e => e.municipios).filter(m => m.indigena === 0);
    expect(ceros.length).toBe(CENSO_BR_PAIS.municipiosSinIndigenas);
    expect(ceros.length).toBeGreaterThan(0);
  });
});
