/**
 * Censo mexicano 2020: que las sumas cierren y que el punto caiga donde debe.
 *
 * Lo propio de México, y lo que cuida la mitad de este archivo, son dos cosas
 * que ningún país anterior tenía:
 *
 *   1. **El municipio no viene en `localidad` sino en `departamento`.** Nominatim
 *      pone el municipio mexicano en `county`. Un predio rural de Oaxaca puede
 *      venir sin localidad ninguna, así que mirar sólo `localidad` —como en
 *      Brasil— dejaría sin respuesta justo al caso que importa. Los cuatro puntos
 *      de más abajo son reales y están medidos.
 *
 *   2. **Hay cuatro municipios cuyo nombre se repite dentro de su entidad.** Los
 *      dos «San Pedro Mixtepec» de Oaxaca son el 3,9 % y el 94,5 % de hablantes:
 *      contestar el equivocado sería errarle por veinticuatro veces. Tiene que
 *      bajar a la entidad, y tiene que decir por qué.
 */
import { describe, it, expect } from 'vitest';
import { CENSO_MX, CENSO_MX_PAIS, MUNICIPIOS_AMBIGUOS_MX, AUTOADSCRIPCION_MX } from '@/lib/censoIndigena2020Mx';
import {
  censoMexicanoDelPunto, municipiosDestacadosMx, PORCENTAJE_PAIS_MX,
  FUENTE_CENSO_2020_MX, REGISTRO_MX_FALTANTE,
} from '@/lib/pueblosOriginarios';
import { PAISES_NACIONAL } from '@/lib/pueblosOriginariosNacional';
import type { Ubicacion } from '@/lib/entorno';

/**
 * Una ubicación como la que arma `/api/entorno` desde Nominatim.
 *
 * Los cuatro campos van explícitos porque en México los tres últimos se usan y
 * el orden entre ellos es la decisión del módulo.
 */
function ubi(campos: Partial<Ubicacion>): Ubicacion {
  return { localidad: null, departamento: null, provincia: null, pais: 'México', ...campos };
}

describe('las sumas cierran', () => {
  it('las 32 entidades suman el país', () => {
    expect(CENSO_MX.length).toBe(32);
    expect(CENSO_MX.reduce((a, e) => a + e.hablantes, 0)).toBe(CENSO_MX_PAIS.hablantes);
    expect(CENSO_MX.reduce((a, e) => a + e.poblacion, 0)).toBe(CENSO_MX_PAIS.poblacion);
    expect(CENSO_MX.reduce((a, e) => a + e.tresYMas, 0)).toBe(CENSO_MX_PAIS.tresYMas);
    expect(CENSO_MX.reduce((a, e) => a + e.monolingues, 0)).toBe(CENSO_MX_PAIS.monolingues);
    expect(CENSO_MX.reduce((a, e) => a + e.afro, 0)).toBe(CENSO_MX_PAIS.afro);
  });

  it('el total nacional es el que publica el INEGI', () => {
    // 7.364.645 hablantes de lengua indígena de 3 años y más, y 126.014.024
    // habitantes. Si alguno de los dos cambia, cambió el insumo y hay que mirar
    // por qué antes de publicarlo.
    expect(CENSO_MX_PAIS.hablantes).toBe(7_364_645);
    expect(CENSO_MX_PAIS.poblacion).toBe(126_014_024);
  });

  it('los municipios de cada entidad suman su entidad', () => {
    let total = 0;
    for (const e of CENSO_MX) {
      total += e.municipios.length;
      expect(e.municipios.reduce((a, m) => a + m.hablantes, 0), e.entidad).toBe(e.hablantes);
      expect(e.municipios.reduce((a, m) => a + m.tresYMas, 0), e.entidad).toBe(e.tresYMas);
      expect(e.municipios.reduce((a, m) => a + m.poblacion, 0), e.entidad).toBe(e.poblacion);
      expect(e.municipios.reduce((a, m) => a + m.monolingues, 0), e.entidad).toBe(e.monolingues);
      expect(e.municipios.reduce((a, m) => a + m.afro, 0), e.entidad).toBe(e.afro);
    }
    expect(total).toBe(2469);
    expect(total).toBe(CENSO_MX_PAIS.municipios);
  });

  it('ninguna parte es más grande que su todo', () => {
    // Si el insumo cambiara de universo, la pantalla diría «de los N hablantes,
    // M no hablan español» con M mayor que N, y nadie se daría cuenta.
    for (const e of CENSO_MX) for (const m of e.municipios) {
      expect(m.monolingues <= m.hablantes, m.clave).toBe(true);
      expect(m.hablantes <= m.tresYMas, m.clave).toBe(true);
      expect(m.tresYMas <= m.poblacion, m.clave).toBe(true);
    }
  });

  it('las claves son únicas y cuelgan de su entidad', () => {
    const vistas = new Set<string>();
    for (const e of CENSO_MX) {
      expect(e.clave).toMatch(/^\d{2}$/);
      for (const m of e.municipios) {
        expect(m.clave).toMatch(/^\d{5}$/);
        // La clave del municipio arranca con la de su entidad: si no, la tabla
        // quedó mal armada y un municipio está colgado de la entidad equivocada.
        expect(m.clave.slice(0, 2), m.municipio).toBe(e.clave);
        expect(vistas.has(m.clave), m.clave).toBe(false);
        vistas.add(m.clave);
      }
    }
  });

  it('el porcentaje del país se calcula sobre la población de 3 años y más', () => {
    // 7.364.645 / 119.976.584 = 6,1 %. Sobre la población total daría 5,8 %, que
    // es otra pregunta: la de lengua sólo se le hizo a los de 3 años y más.
    expect(PORCENTAJE_PAIS_MX).toBe('6,1');
  });
});

describe('el punto cae donde debe', () => {
  it('Ocosingo: el municipio viene en departamento y en localidad', () => {
    const r = censoMexicanoDelPunto(ubi({ provincia: 'Chiapas', departamento: 'Ocosingo', localidad: 'Ocosingo' }));
    expect(r.estado).toBe('con_censo');
    if (r.estado !== 'con_censo') return;
    expect(r.municipio.municipio).toBe('Ocosingo');
    expect(r.municipio.clave).toBe('07059');
  });

  it('rural de Oaxaca: sin localidad, el municipio sale de departamento', () => {
    // El caso que justifica todo el diseño. Con la lógica de Brasil —sólo
    // `localidad`— este predio no tendría municipio.
    const r = censoMexicanoDelPunto(ubi({ provincia: 'Oaxaca', departamento: 'San Jerónimo Coatlán' }));
    expect(r.estado).toBe('con_censo');
    if (r.estado !== 'con_censo') return;
    expect(r.municipio.municipio).toBe('San Jerónimo Coatlán');
  });

  it('Coyoacán: la alcaldía viene en comuna, que Nominatim pone en suburb', () => {
    const r = censoMexicanoDelPunto(ubi({ provincia: 'Ciudad de México', comuna: 'Coyoacán', localidad: null }));
    expect(r.estado).toBe('con_censo');
    if (r.estado !== 'con_censo') return;
    expect(r.municipio.municipio).toBe('Coyoacán');
  });

  it('Mérida: sin county, el municipio sale de localidad', () => {
    const r = censoMexicanoDelPunto(ubi({ provincia: 'Yucatán', localidad: 'Mérida' }));
    expect(r.estado).toBe('con_censo');
    if (r.estado !== 'con_censo') return;
    expect(r.municipio.municipio).toBe('Mérida');
    expect(r.municipio.hablantes).toBe(71040);
  });

  it('los nombres cortos de entidad encuentran los oficiales', () => {
    // El INEGI escribe los nombres largos y el geocodificador los cortos. Esto
    // lo resuelve casarNombre por subconjunto de palabras, sin tabla de alias,
    // y se rompería en silencio.
    const casos: Array<[string, string]> = [
      ['Estado de México', 'México'],
      ['Veracruz', 'Veracruz de Ignacio de la Llave'],
      ['Coahuila', 'Coahuila de Zaragoza'],
      ['Michoacán', 'Michoacán de Ocampo'],
      ['Ciudad de México', 'Ciudad de México'],
    ];
    for (const [corto, oficial] of casos) {
      const r = censoMexicanoDelPunto(ubi({ provincia: corto }));
      expect(r.estado, corto).toBe('con_entidad');
      if (r.estado !== 'con_entidad') continue;
      expect(r.entidad.entidad, corto).toBe(oficial);
    }
  });

  it('«Municipio de Veracruz» casa con el municipio Veracruz', () => {
    // Nominatim devuelve el county con el prefijo en algunas entidades.
    const r = censoMexicanoDelPunto(ubi({
      provincia: 'Veracruz', departamento: 'Municipio de Veracruz', localidad: 'Veracruz',
    }));
    expect(r.estado).toBe('con_censo');
    if (r.estado !== 'con_censo') return;
    expect(r.municipio.municipio).toBe('Veracruz');
  });

  it('una entidad que no conocemos no se adivina', () => {
    const r = censoMexicanoDelPunto(ubi({ provincia: 'Nueva Galicia' }));
    expect(r.estado).toBe('entidad_desconocida');
  });

  it('un municipio que no casa devuelve la entidad y dice qué buscó', () => {
    const r = censoMexicanoDelPunto(ubi({ provincia: 'Chiapas', departamento: 'Paraje El Mirador' }));
    expect(r.estado).toBe('con_entidad');
    if (r.estado !== 'con_entidad') return;
    expect(r.municipioBuscado).toBe('Paraje El Mirador');
  });

  it('fuera de México contesta que está fuera, y Estados Unidos no es México', () => {
    expect(censoMexicanoDelPunto(ubi({ pais: 'Argentina', provincia: 'Córdoba' })).estado).toBe('fuera_de_mexico');
    // «Estados Unidos Mexicanos» sí es México; «Estados Unidos» no. Si esta
    // distinción se rompe, un predio en Texas mostraría el censo mexicano.
    expect(censoMexicanoDelPunto(ubi({ pais: 'Estados Unidos', provincia: 'Texas' })).estado).toBe('fuera_de_mexico');
    expect(censoMexicanoDelPunto(ubi({ pais: 'Estados Unidos Mexicanos', provincia: 'Jalisco' })).estado).toBe('con_entidad');
  });

  it('sin país o sin entidad no contesta', () => {
    expect(censoMexicanoDelPunto(null).estado).toBe('sin_ubicacion');
    expect(censoMexicanoDelPunto(ubi({ pais: null })).estado).toBe('sin_ubicacion');
    expect(censoMexicanoDelPunto(ubi({ provincia: null })).estado).toBe('sin_ubicacion');
  });
});

describe('los municipios homónimos no se adivinan', () => {
  it('son exactamente dos nombres, los dos en Oaxaca', () => {
    expect(MUNICIPIOS_AMBIGUOS_MX).toHaveLength(2);
    for (const a of MUNICIPIOS_AMBIGUOS_MX) {
      expect(a.entidad).toBe('Oaxaca');
      expect(a.claves.length).toBe(2);
    }
    expect(MUNICIPIOS_AMBIGUOS_MX.map(a => a.nombre).sort())
      .toEqual(['San Juan Mixtepec', 'San Pedro Mixtepec']);
  });

  it('los dos San Pedro Mixtepec son números muy distintos', () => {
    // Es el motivo de todo esto: 3,9 % contra 94,5 %. Si alguna vez los números
    // se parecieran, el riesgo seguiría existiendo pero este test dejaría de
    // explicar por qué, así que se fija la diferencia.
    const oax = CENSO_MX.find(e => e.entidad === 'Oaxaca')!;
    const dos = oax.municipios.filter(m => m.municipio === 'San Pedro Mixtepec');
    expect(dos).toHaveLength(2);
    const props = dos.map(m => m.hablantes / m.tresYMas).sort((a, b) => a - b);
    expect(props[0]!).toBeLessThan(0.1);
    expect(props[1]!).toBeGreaterThan(0.9);
  });

  it('un homónimo baja a la entidad y lo dice, en vez de elegir uno', () => {
    const r = censoMexicanoDelPunto(ubi({ provincia: 'Oaxaca', departamento: 'San Pedro Mixtepec' }));
    expect(r.estado).toBe('municipio_ambiguo');
    if (r.estado !== 'municipio_ambiguo') return;
    expect(r.nombre).toBe('San Pedro Mixtepec');
    expect(r.cuantos).toBe(2);
    expect(r.entidad.entidad).toBe('Oaxaca');
  });

  it('ningún homónimo llega nunca a con_censo, por ninguno de los tres campos', () => {
    for (const a of MUNICIPIOS_AMBIGUOS_MX) {
      for (const campo of ['departamento', 'comuna', 'localidad'] as const) {
        const r = censoMexicanoDelPunto(ubi({ provincia: a.entidad, [campo]: a.nombre }));
        expect(r.estado, `${a.nombre} por ${campo}`).not.toBe('con_censo');
      }
    }
  });
});

describe('lo que la capa no dice, lo dice', () => {
  it('la autoadscripción se guarda como texto y no como número', () => {
    // 23,2 millones es una estimación muestral publicada redondeada. Si fuera un
    // número, alguien la restaría de los hablantes y publicaría una precisión
    // que no existe.
    expect(typeof AUTOADSCRIPCION_MX.aproximado).toBe('string');
    expect(AUTOADSCRIPCION_MX.aproximado).toMatch(/23,2 millones/);
    expect(AUTOADSCRIPCION_MX.porQueNoEstaPorMunicipio).toMatch(/muestra|redonde/);
  });

  it('la atribución que exige el INEGI está escrita con su fórmula', () => {
    // Los Términos de Libre Uso piden «Fuente: INEGI, nombre del producto». No
    // es decorativo: es la condición de la licencia que habilita todo esto.
    expect(FUENTE_CENSO_2020_MX.atribucion).toMatch(/^Fuente: INEGI, /);
    expect(FUENTE_CENSO_2020_MX.licenciaUrl).toMatch(/^https:\/\/www\.inegi\.org\.mx\//);
    // Y la otra obligación: avisar de las transformaciones que hacemos.
    expect(FUENTE_CENSO_2020_MX.transformacion).toMatch(/acequia/);
  });

  it('el catálogo del INPI figura como faltante, con motivo', () => {
    expect(REGISTRO_MX_FALTANTE.organismo).toMatch(/INPI/);
    expect(REGISTRO_MX_FALTANTE.motivo.length).toBeGreaterThan(40);
  });

  it('México no está entre los países que entran sólo con la cifra nacional', () => {
    // Ahora entra con el dato local, así que estar en las dos listas mostraría
    // dos veces lo mismo con dos números distintos.
    expect(PAISES_NACIONAL.some(p => p.iso2 === 'MX')).toBe(false);
  });

  it('los 36 municipios sin hablantes están contados y no se listan como destacados', () => {
    const sin = CENSO_MX.reduce((a, e) => a + e.municipios.filter(m => m.hablantes === 0).length, 0);
    expect(sin).toBe(CENSO_MX_PAIS.municipiosSinHablantes);
    expect(sin).toBe(36);
    for (const e of CENSO_MX) {
      for (const m of municipiosDestacadosMx(e)) expect(m.hablantes, m.municipio).toBeGreaterThan(0);
    }
  });

  it('los destacados vienen de mayor a menor y son de la entidad pedida', () => {
    const chis = CENSO_MX.find(e => e.entidad === 'Chiapas')!;
    const top = municipiosDestacadosMx(chis);
    expect(top).toHaveLength(6);
    expect(top[0]!.municipio).toBe('Ocosingo');
    for (let i = 1; i < top.length; i++) expect(top[i]!.hablantes).toBeLessThanOrEqual(top[i - 1]!.hablantes);
    for (const m of top) expect(m.clave.slice(0, 2)).toBe(chis.clave);
  });
});
