/**
 * El master plan por etapas.
 *
 * Los dos climas sintéticos del archivo están elegidos para que se vea la
 * asimetría: uno monzónico del sur, con el suelo largando agua en febrero y
 * marzo y seco de julio a diciembre, y uno árido, donde ningún mes se bloquea y
 * los doce piden agua. En el primero aparece el resultado que no se ve venir
 * —un mes bueno para compactar puede ser un mes en el que NO se puede terminar
 * la obra— y en el segundo la intersección sale vacía, que es el caso para el
 * que la norma ya traía la respuesta.
 */
import { describe, it, expect } from 'vitest';
import { balanceCiclico, type BalanceCiclico } from '../../../lib/balanceHidrico';
import {
  ventanaDeMovimientoDeSuelo, ventanaDeSiembra, ventanaCompuesta,
  ordenarEtapas, obrasDelProyecto, precedenciasPublicadas, noTerminaConLaTierra,
  FACTOR_PERMANENCIA, type Obra,
} from '../../../lib/etapas';

/** Monzónico del sur: verano lluvioso, invierno y primavera secos. */
const CLIMA_MONZON = balanceCiclico(
  [200, 180, 140, 60, 30, 15, 10, 10, 25, 70, 120, 180],
  [150, 130, 110, 80, 55, 40, 45, 60, 85, 110, 130, 145],
  150,
) as BalanceCiclico;

/** Árido: nunca sobra agua y nunca alcanza. */
const CLIMA_ARIDO = balanceCiclico(
  [10, 8, 6, 4, 3, 2, 2, 3, 5, 8, 10, 12],
  [180, 160, 140, 100, 70, 50, 55, 75, 105, 135, 160, 175],
  100,
) as BalanceCiclico;

describe('la ventana de movimiento de suelo', () => {
  it('UN MES CON EXCEDENTE QUEDA BLOQUEADO: EL SUELO PASÓ CAPACIDAD DE CAMPO', () => {
    const v = ventanaDeMovimientoDeSuelo(CLIMA_MONZON)!;
    expect(v.bloqueados).toEqual([1, 2]);                    // febrero y marzo
    for (const i of v.bloqueados) expect(CLIMA_MONZON.meses[i]!.excedente_mm).toBeGreaterThan(0);
  });

  it('Y LOS TRES ESTADOS SON EXCLUYENTES Y CUBREN EL AÑO', () => {
    const v = ventanaDeMovimientoDeSuelo(CLIMA_MONZON)!;
    const todos = [...v.buenos, ...v.pidenAgua, ...v.bloqueados].sort((a, b) => a - b);
    expect(todos).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(new Set(todos).size).toBe(12);
  });

  it('LA ASIMETRÍA: AL MES MOJADO SE LE CONTESTA ESPERAR, AL SECO SE LE CONTESTA MOJAR', () => {
    const v = ventanaDeMovimientoDeSuelo(CLIMA_MONZON)!;
    const mojado = v.meses.find(m => m.estado === 'bloqueado')!;
    const seco   = v.meses.find(m => m.estado === 'pide_agua')!;
    expect(mojado.porque).toMatch(/esperar/);
    expect(mojado.porque).not.toMatch(/mojar/);
    expect(seco.porque).toMatch(/mojar por aspersión/);
    // Y la diferencia de costo: uno es un renglón de materiales, el otro un mes.
    expect(seco.porque).toMatch(/lista de materiales/);
  });

  it('el piso del lado seco es el agua fácilmente aprovechable de FAO-56, no el cero', () => {
    const v = ventanaDeMovimientoDeSuelo(CLIMA_MONZON)!;
    const piso = 0.5 * CLIMA_MONZON.awc_mm;                  // (1 − p) · AWC con p = 0,5
    for (const i of v.pidenAgua) expect(CLIMA_MONZON.meses[i]!.almacenaje_mm).toBeLessThan(piso);
    for (const i of v.buenos)    expect(CLIMA_MONZON.meses[i]!.almacenaje_mm).toBeGreaterThanOrEqual(piso);
    // Ninguno de los meses secos llega a cero: con agotamiento exponencial el
    // almacenaje se acerca sin llegar, y por eso el umbral no puede ser el cero.
    expect(Math.min(...v.pidenAgua.map(i => CLIMA_MONZON.meses[i]!.almacenaje_mm))).toBeGreaterThan(0);
  });

  it('en un clima árido no hay mes bloqueado y los doce piden agua', () => {
    const v = ventanaDeMovimientoDeSuelo(CLIMA_ARIDO)!;
    expect(v.bloqueados).toEqual([]);
    expect(v.pidenAgua).toHaveLength(12);
    expect(v.lectura).toMatch(/todos piden mojar/i);
  });

  it('SIN BALANCE NO INVENTA UN CALENDARIO, QUE ES PEOR QUE NO TENERLO PORQUE SE CUMPLE', () => {
    expect(ventanaDeMovimientoDeSuelo(null)).toBeNull();
    expect(ventanaDeSiembra(undefined)).toBeNull();
    expect(ventanaCompuesta(null)).toBeNull();
  });
});

describe('la ventana de siembra', () => {
  it('ARRANCA DONDE LA LLUVIA ALCANZA LA MITAD DE LA DEMANDA, QUE ES EL CRITERIO DE FAO', () => {
    const v = ventanaDeSiembra(CLIMA_MONZON)!;
    for (const i of v.buenos) {
      const m = CLIMA_MONZON.meses[i]!;
      expect(m.precip_mm).toBeGreaterThanOrEqual(0.5 * m.etp_mm);
    }
    expect(v.buenos).toEqual([0, 1, 2, 3, 4, 9, 10, 11]);
  });

  it('Y UN MES CON EXCEDENTE NO BLOQUEA UNA SIEMBRA: AGUA DE MÁS NO ES EL PROBLEMA DE UNA SEMILLA', () => {
    const v = ventanaDeSiembra(CLIMA_MONZON)!;
    expect(v.bloqueados).toEqual([]);
    expect(v.buenos).toContain(1);                           // febrero, que para la tierra está bloqueado
  });

  it('en el árido no hay mes que alcance el umbral: toda siembra va con riego', () => {
    const v = ventanaDeSiembra(CLIMA_ARIDO)!;
    expect(v.buenos).toEqual([]);
    expect(v.lectura).toMatch(/riego de implantación/);
  });
});

describe('la ventana compuesta', () => {
  it('ES MÁS CORTA QUE LA DE MOVER TIERRA: ES SU SUBCONJUNTO', () => {
    const c = ventanaCompuesta(CLIMA_MONZON)!;
    const noBloqueados = c.tierra.meses.filter(m => m.estado !== 'bloqueado').map(m => m.mesIndex);
    for (const m of c.cierran) expect(noBloqueados).toContain(m);
    expect(c.cierran.length).toBeLessThan(noBloqueados.length);
  });

  it('Y ACÁ ESTÁ EL RESULTADO: UN MES BUENO PARA COMPACTAR PUEDE SER UN MES EN QUE NO SE PUEDE CERRAR', () => {
    const c = ventanaCompuesta(CLIMA_MONZON)!;
    // Junio es uno de los cuatro meses buenos de movimiento de suelo y no entra
    // en la ventana de cierre: ni junio ni julio sirven para que prenda el pasto.
    expect(c.tierra.buenos).toContain(5);
    expect(c.cierran).not.toContain(5);
    expect(c.cierran).toEqual([0, 3, 4, 8, 9, 10, 11]);
  });

  it('acepta el mes siguiente, porque la cobertura va «apenas después» y no en la temporada que viene', () => {
    const c = ventanaCompuesta(CLIMA_MONZON)!;
    const siembra = new Set(ventanaDeSiembra(CLIMA_MONZON)!.buenos);
    // Agosto no sirve para sembrar pero entra, porque septiembre sí.
    expect(siembra.has(8)).toBe(false);
    expect(c.cierran).toContain(8);
    expect(siembra.has(9)).toBe(true);
  });

  it('CUANDO LAS DOS VENTANAS NO SE TOCAN LO DICE, Y NOMBRA LA SALIDA QUE LA NORMA YA TRAÍA', () => {
    const c = ventanaCompuesta(CLIMA_ARIDO)!;
    expect(c.cierran).toEqual([]);
    expect(c.lectura).toMatch(/no se tocan/);
    expect(c.lectura).toMatch(/mulch|cultivo niñera|desviar/i);
  });
});

describe('las precedencias publicadas', () => {
  const obras: Obra[] = [
    { id: 'rep', nombre: 'Replanteo', permanencia: 2, clase: 'seca', rasgos: ['replanteo'] },
    { id: 'cam', nombre: 'Caminos',   permanencia: 4, clase: 'movimiento_de_suelo', rasgos: ['mueve_tierra', 'conduce_agua'] },
    { id: 'cob', nombre: 'Pastura',   permanencia: 8, clase: 'siembra', rasgos: ['establece_cobertura'] },
  ];

  it('EL REPLANTEO VA ANTES DE QUE ENTRE LA MÁQUINA', () => {
    const ps = precedenciasPublicadas(obras);
    const p = ps.find(x => x.antes === 'rep' && x.despues === 'cam')!;
    expect(p).toBeDefined();
    expect(p.porque).toMatch(/before construction is started/);
  });

  it('y la cobertura que no es parte de otra obra va después del movimiento de suelo', () => {
    const ps = precedenciasPublicadas(obras);
    expect(ps.some(x => x.antes === 'cam' && x.despues === 'cob')).toBe(true);
  });

  it('CADA PRECEDENCIA VIAJA CON SU FUENTE, PARA PODER DISCUTIR EL CRONOGRAMA CONTRA EL MANUAL', () => {
    for (const p of precedenciasPublicadas(obras)) {
      expect(p.fuente.length).toBeGreaterThan(20);
      expect(p.porque.length).toBeGreaterThan(20);
    }
  });

  it('UNA OBRA QUE CONDUCE AGUA O EMBALSA NO TERMINA CON LA TIERRA', () => {
    expect(noTerminaConLaTierra(obras[1]!)).toBe(true);
    expect(noTerminaConLaTierra(obras[0]!)).toBe(false);
  });
});

describe('el ordenamiento en etapas', () => {
  const hay = {
    represa: true, swales: true, caminos: true, redAgua: true, riego: true,
    estructuras: true, cierrePerimetral: true, potreros: true, pasturas: true,
  };

  it('EL REPLANTEO ES LA ETAPA 1 Y NADA DE TIERRA SE MUEVE ANTES', () => {
    const plan = ordenarEtapas(obrasDelProyecto(hay), CLIMA_MONZON)!;
    expect(plan.etapas[0]!.obras.map(o => o.id)).toContain('replanteo');
    const etapaDe = (id: string) => plan.etapas.find(e => e.obras.some(o => o.id === id))!.numero;
    expect(etapaDe('replanteo')).toBeLessThan(etapaDe('represa'));
    expect(etapaDe('replanteo')).toBeLessThan(etapaDe('swales'));
    expect(etapaDe('replanteo')).toBeLessThan(etapaDe('caminos'));
  });

  it('TODAS LAS OBRAS ENTRAN Y NINGUNA QUEDA EN CICLO', () => {
    const obras = obrasDelProyecto(hay);
    const plan = ordenarEtapas(obras, CLIMA_MONZON)!;
    expect(plan.enCiclo).toEqual([]);
    const colocadas = plan.etapas.flatMap(e => e.obras.map(o => o.id)).sort();
    expect(colocadas).toEqual(obras.map(o => o.id).sort());
  });

  it('LA REPRESA ES UNA OBRA Y NO DOS: LA PROTECCIÓN ES PARTE DE LA REPRESA', () => {
    const obras = obrasDelProyecto({ represa: true });
    expect(obras.filter(o => o.id.includes('represa'))).toHaveLength(1);
    const rep = obras.find(o => o.id === 'represa')!;
    expect(rep.nombre).toMatch(/protección/i);
    expect(noTerminaConLaTierra(rep)).toBe(true);
  });

  it('Y LA ETAPA QUE LA CONTIENE USA LA VENTANA COMPUESTA, NO LA DE MOVER TIERRA', () => {
    const plan = ordenarEtapas(obrasDelProyecto({ represa: true, swales: true }), CLIMA_MONZON)!;
    const etapa = plan.etapas.find(e => e.obras.some(o => o.id === 'represa'))!;
    expect(etapa.conCobertura.length).toBeGreaterThan(0);
    expect(etapa.compuesta).not.toBeNull();
    expect(etapa.advertencias.join(' ')).toMatch(/no está terminada sin ella|no están terminadas sin ella/i);
  });

  it('una etapa de movimiento de suelo avisa que mientras dura el terreno escurre distinto', () => {
    const plan = ordenarEtapas(obrasDelProyecto({ represa: true }), CLIMA_MONZON)!;
    const etapa = plan.etapas.find(e => e.clase === 'movimiento_de_suelo')!;
    expect(etapa.advertencias.join(' ')).toMatch(/superficie queda desnuda/);
    expect(etapa.advertencias.join(' ')).toMatch(/meses bloqueados/);
  });

  it('DENTRO DE UNA ETAPA EL ORDEN ES EL DE LA ESCALA DE PERMANENCIA', () => {
    const plan = ordenarEtapas(obrasDelProyecto(hay), CLIMA_MONZON)!;
    for (const e of plan.etapas) {
      const ps = e.obras.map(o => o.permanencia);
      expect([...ps].sort((a, b) => a - b)).toEqual(ps);
    }
    expect(FACTOR_PERMANENCIA[3]).toBe('Agua');
    expect(FACTOR_PERMANENCIA[7]).toBe('Subdivisiones');
  });

  it('LA CLASE DE LA ETAPA ES LA MÁS RESTRICTIVA DE SUS OBRAS', () => {
    const plan = ordenarEtapas([
      { id: 'a', nombre: 'Caño', permanencia: 3, clase: 'seca' },
      { id: 'b', nombre: 'Zanja', permanencia: 3, clase: 'movimiento_de_suelo' },
    ], CLIMA_MONZON)!;
    expect(plan.etapas).toHaveLength(1);
    expect(plan.etapas[0]!.clase).toBe('movimiento_de_suelo');
  });

  it('UN CICLO NO SE ROMPE AL AZAR: LAS OBRAS SALEN APARTE Y CON EL AVISO', () => {
    const plan = ordenarEtapas([
      { id: 'a', nombre: 'A', permanencia: 3, clase: 'seca', requiere: ['b'] },
      { id: 'b', nombre: 'B', permanencia: 3, clase: 'seca', requiere: ['a'] },
      { id: 'c', nombre: 'C', permanencia: 1, clase: 'seca' },
    ], CLIMA_MONZON)!;
    expect(plan.etapas).toHaveLength(1);
    expect(plan.etapas[0]!.obras.map(o => o.id)).toEqual(['c']);
    expect(plan.enCiclo.map(o => o.id).sort()).toEqual(['a', 'b']);
    expect(plan.advertencias.join(' ')).toMatch(/imprimible e inejecutable/);
  });

  it('las dependencias fantasma se ignoran en vez de trabar el plan', () => {
    const plan = ordenarEtapas([
      { id: 'a', nombre: 'A', permanencia: 3, clase: 'seca', requiere: ['no_existe', 'a'] },
    ], CLIMA_MONZON)!;
    expect(plan.etapas).toHaveLength(1);
    expect(plan.enCiclo).toEqual([]);
  });

  it('SIN BALANCE DA EL ORDEN Y NO LOS MESES, Y LO DICE', () => {
    const plan = ordenarEtapas(obrasDelProyecto({ represa: true }), null)!;
    expect(plan.etapas.length).toBeGreaterThan(0);
    expect(plan.etapas.every(e => e.ventana === null)).toBe(true);
    expect(plan.advertencias.join(' ')).toMatch(/el orden y no los meses/);
  });

  it('sin obras no hay plan', () => {
    expect(ordenarEtapas([], CLIMA_MONZON)).toBeNull();
    expect(obrasDelProyecto({})).toEqual([]);
  });
});
