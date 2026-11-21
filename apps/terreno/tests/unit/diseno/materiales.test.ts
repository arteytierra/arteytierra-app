/**
 * La lista de materiales.
 *
 * El caso resuelto que ancla casi todo el archivo está impreso en AH-590: un
 * terraplén de 8.099 yd³ compactados necesita 12.148 yd³ disponibles en el
 * préstamo. Los dos números están en el manual, con lo cual el factor 1,5 es
 * verificable y no una interpretación. La tabla de separación de postes se
 * escribe en pies, como la da la especificación, para que el test se pueda leer
 * contra ella.
 */
import { describe, it, expect } from 'vitest';
import {
  tierraDeclarada, separacionDePostes, renglonesDeCierre, renglonesDeMuro,
  renglonesDeRed, renglonDeTierraSinMuro, armarLista,
  renglonesDeCamellon, implementoDelPaso, BASE_TEXTO,
  FACTOR_DISPONIBLE_AH590, VARILLAS_POR_CLARO, TABLA_CIERRE_382,
  CHECKLIST_EFH5, ENTERRADO_ARRIOSTRE_M,
} from '../../../lib/materiales';
import type { ResultadoMuro, BalanceTierra, PartidasMuro } from '../../../lib/cutfill';
import type { RedAguaResumen } from '../../../lib/hidraulica';
import type { MetricasPoligono } from '../../../lib/geometria';
import type { CamellonResumen, SalidaResumen } from '../../../lib/camellon';
import {
  PASO_BBF_M, PASO_BBM_ILCA_M, PASO_MANUAL_MIN_M, PASO_MANUAL_MAX_M,
} from '../../../lib/camellon';

const PIE = 0.3048;

// ─── Fábricas mínimas ────────────────────────────────────────────────────────

function partidas(p: Partial<PartidasMuro> = {}): PartidasMuro {
  return {
    destape_m3: 0, zanjaExcavacion_m3: 0, zanjaArcilla_m3: 0,
    nucleo_m3: 0, espaldones_m3: 0, revestimiento_m3: 0, ...p,
  };
}

function muro(over: Partial<ResultadoMuro> = {}): ResultadoMuro {
  return {
    alto_m: 5, altoMedio_m: 3, anchoCorona_m: 3, anchoBase_m: 28, anchoBaseMedio_m: 18,
    anguloInterno_deg: 18, anguloExterno_deg: 27, seccion_m2: 78, seccionMedia_m2: 32,
    longitud_m: 60, volumenTierra_m3: 1920, partidas: partidas({ nucleo_m3: 600, espaldones_m3: 1200, destape_m3: 180 }),
    factorContraccion: 1.15, perfilUsado: true, sinMuro: false,
    cargaVertedero_m: 0.4, asentamiento_pct: 5, sobrealto_m: 0.25,
    cotaCoronaConstruida_m: 105.25, volumenTierraDisenado_m3: 1829,
    zanja: { anchoFondo_m: 2.44, anchoBoca_m: 5.44, talud: 1.5, prof_m: 1, capas: 5 },
    advertencias: [], ...over,
  };
}

function balance(over: Partial<BalanceTierra> = {}): BalanceTierra {
  return {
    compactado_m3: 1800, banco_m3: 2250, prestamoInterno_m3: 2070,
    capacidadExtra_m3: 2070, volumenAgua_m3: 12070, profundizacionMedia_m: 0.6,
    eficiencia: 5.4, viable: true, nota: '', ...over,
  };
}

const red: RedAguaResumen = {
  camino: 'Traza de agua', material: 'PEAD', diametro: 'DN 50', caudal: '1,2 L/s',
  longitud_m: 480, presion_final_mca: 22, presion_min_mca: 15, velocidad_ms: 0.8,
  pn_recomendado: 10, bomba_kw: 1.5,
};

const metricas: MetricasPoligono = { area_m2: 400_000, area_ha: 40, perimetro_m: 2600, linderos: [] };

// ─── El movimiento de suelo ──────────────────────────────────────────────────

describe('los tres volúmenes de tierra', () => {
  it('EL EJEMPLO RESUELTO DE AH-590: 8.099 COMPACTADOS PIDEN 12.148 DISPONIBLES', () => {
    const t = tierraDeclarada(8099, 1.15);
    // El manual imprime 12.148 y la cuenta exacta da 12.148,5: trunca el medio.
    expect(Math.abs(t.disponibleMinimo_m3 - 12148)).toBeLessThanOrEqual(1);
    expect(12148 / 8099).toBeCloseTo(FACTOR_DISPONIBLE_AH590, 3);
  });

  it('Y EL 1,5 NO ES UN FACTOR DE CONTRACCIÓN: CON EL 1,15 DEL PROYECTO FALTA UN 23 %', () => {
    // Son dos magnitudes distintas. La contracción (banco → compactado) está
    // bien en 1,15; el mínimo disponible es otra cosa y es 1,5. Un plan que
    // prevé 1,15 cumple con la contracción y se queda sin tierra.
    const t = tierraDeclarada(1000, 1.15);
    expect(t.banco_m3).toBe(1150);
    expect(t.disponibleMinimo_m3).toBe(1500);
    expect(t.corto).toBe(true);
    expect(t.faltante_m3).toBe(350);
    expect(1 - 1.15 / 1.5).toBeCloseTo(0.2333, 4);
  });

  it('y con un factor por arriba de 1,5 deja de estar corto', () => {
    const t = tierraDeclarada(1000, 1.6);
    expect(t.corto).toBe(false);
    expect(t.faltante_m3).toBe(0);
  });
});

describe('los renglones del muro', () => {
  it('TRAE LOS TRES VOLÚMENES, CADA UNO CON SU BASE DE MEDICIÓN', () => {
    const rs = renglonesDeMuro(muro(), balance());
    const bases = rs.map(r => r.base);
    expect(bases).toContain('compactado_en_obra');
    expect(bases).toContain('banco_excavado');
    expect(bases).toContain('disponible_en_prestamo');
  });

  it('Y EL VOLUMEN DISPONIBLE SALE DEL 1,5, NO DEL FACTOR DEL PROYECTO', () => {
    const rs = renglonesDeMuro(muro(), balance({ compactado_m3: 1800 }));
    const disp = rs.find(r => r.base === 'disponible_en_prestamo')!;
    const banco = rs.find(r => r.base === 'banco_excavado')!;
    expect(disp.cantidad).toBe(2700);          // 1800 × 1,5
    expect(banco.cantidad).toBe(2070);         // 1800 × 1,15
    expect(disp.advertencia).toMatch(/faltan 630/);
  });

  it('el destape se acopia y se devuelve: no es descarte y no va al terraplén', () => {
    const rs = renglonesDeMuro(muro(), balance());
    const d = rs.find(r => r.concepto.includes('Destape'))!;
    expect(d.cantidad).toBe(180);
    expect(d.calidad).toMatch(/stockpiled|acopia/i);
  });

  it('LA CAPACIDAD EMBALSADA NO SIRVE PARA ESTIMAR LA TIERRA, Y EL RENGLÓN LO DICE', () => {
    // Es el error que tenía el presupuesto: cobraba el agua como si fuera tierra.
    const r = renglonDeTierraSinMuro(12000);
    expect(r.cantidad).toBe(0);
    expect(r.advertencia).toMatch(/es el agua/);
    expect(r.advertencia).toMatch(/12\.000/);
  });
});

// ─── El alambrado ────────────────────────────────────────────────────────────

describe('la separación de postes', () => {
  it('LA TABLA PUBLICADA: 20 PIES PARA BOVINOS CON PÚA, 15 PARA CAPRINOS', () => {
    expect(separacionDePostes('bovino', 'pua')!.maximo_m).toBeCloseTo(20 * PIE, 6);
    expect(separacionDePostes('caprino', 'pua')!.maximo_m).toBeCloseTo(15 * PIE, 6);
    expect(separacionDePostes('ovino', 'pua')!.maximo_m).toBeCloseTo(20 * PIE, 6);
    expect(separacionDePostes('ciervo', 'tejido')!.maximo_m).toBeCloseTo(20 * PIE, 6);
  });

  it('Y UN ELÉCTRICO LISO LLEGA A 100 PIES, QUE ES CINCO VECES EL MISMO CIERRE CON PÚA', () => {
    const elec = separacionDePostes('bovino', 'electrico_liso')!;
    const pua  = separacionDePostes('bovino', 'pua')!;
    expect(elec.maximo_m).toBeCloseTo(100 * PIE, 6);
    expect(elec.maximo_m / pua.maximo_m).toBeCloseTo(5, 6);
  });

  it('CON VARILLAS EL MÁXIMO SUBE, Y LA FUENTE PIDE DOS POR CLARO, NO UNA', () => {
    const c = separacionDePostes('bovino', 'pua', true)!;
    expect(c.maximo_m).toBeCloseTo(30 * PIE, 6);
    expect(c.varillasPorClaro).toBe(VARILLAS_POR_CLARO);
    expect(VARILLAS_POR_CLARO).toBe(2);
  });

  it('un N/A de la tabla no es un cero: cae en la otra columna y lo explica', () => {
    const c = separacionDePostes('bovino', 'tejido_alta_resistencia', true)!;
    expect(c.maximo_m).toBeCloseTo(25 * PIE, 6);
    expect(c.porque).toMatch(/N\/A/);
  });

  it('Y UNA COMBINACIÓN QUE LA TABLA NO CUBRE DEVUELVE NULL EN VEZ DE EXTRAPOLAR', () => {
    expect(separacionDePostes('ciervo', 'electrico_liso')).toBeNull();
    expect(renglonesDeCierre({ largo_m: 1000, esquinas: 0, especie: 'ciervo', tipo: 'electrico_liso' })).toEqual([]);
  });

  it('la tabla no inventa filas: todas las que tiene traen al menos una columna', () => {
    for (const f of TABLA_CIERRE_382) {
      expect(f.conVarillas_m != null || f.sinVarillas_m != null).toBe(true);
      expect(f.altoHiloSuperior_m).toBeGreaterThan(0);
    }
  });
});

describe('los ocho metros que había', () => {
  const postesCada = (sep_m: number) => Math.ceil(1000 / sep_m) + 1;

  it('PARA UN CIERRE DE PÚA DE BOVINOS, LOS 8 m DEJABAN AFUERA 40 POSTES POR KILÓMETRO', () => {
    const publicado = renglonesDeCierre({
      largo_m: 1000, esquinas: 0, especie: 'bovino', tipo: 'pua',
    }).find(r => r.concepto.startsWith('Postes'))!;
    expect(publicado.cantidad).toBe(postesCada(20 * PIE));    // 166
    expect(publicado.cantidad - postesCada(8)).toBe(40);
    expect(1 - postesCada(8) / publicado.cantidad).toBeCloseTo(0.241, 2);
  });

  it('PARA CAPRINOS FALTABA MÁS DE LA MITAD: HAY QUE PONER UN 74 % MÁS DE POSTES', () => {
    const cabras = renglonesDeCierre({
      largo_m: 1000, esquinas: 0, especie: 'caprino', tipo: 'pua',
    }).find(r => r.concepto.startsWith('Postes'))!;
    expect(cabras.cantidad).toBe(postesCada(15 * PIE));       // 220
    expect(cabras.cantidad / postesCada(8)).toBeCloseTo(1.746, 2);
  });

  it('Y PARA UN ELÉCTRICO SOBRABAN CASI CUATRO DE CADA CINCO', () => {
    const elec = renglonesDeCierre({
      largo_m: 1000, esquinas: 0, especie: 'bovino', tipo: 'electrico_liso',
    }).find(r => r.concepto.startsWith('Postes'))!;
    expect(elec.cantidad).toBe(postesCada(100 * PIE));        // 34
    expect(postesCada(8) / elec.cantidad).toBeCloseTo(3.7, 1);
  });
});

describe('los renglones del cierre', () => {
  it('UN POLÍGONO DE DOCE MOJONES LLEVA DOCE CONJUNTOS DE ESQUINA, Y EL PRESUPUESTO TENÍA CERO', () => {
    const rs = renglonesDeCierre({ largo_m: 2600, esquinas: 12, especie: 'bovino', tipo: 'pua' });
    const esq = rs.find(r => r.concepto.includes('esquina'))!;
    expect(esq.cantidad).toBe(12);
    expect(esq.calidad).toMatch(/3 pies|0,91/);
    expect(ENTERRADO_ARRIOSTRE_M).toBeCloseTo(3 * PIE, 6);
    expect(esq.advertencia).toMatch(/tensión/i);
  });

  it('y los postes de línea no cuentan las esquinas dos veces', () => {
    const rs = renglonesDeCierre({ largo_m: 2600, esquinas: 12, especie: 'bovino', tipo: 'pua' });
    const linea = rs.find(r => r.concepto.startsWith('Postes'))!;
    const claros = Math.ceil(2600 / (20 * PIE));
    expect(linea.cantidad).toBe(claros - 12 + 1);
  });

  /*
   * En un perímetro el último poste es el primero.
   *
   * Una línea abierta de N claros lleva N+1 postes; una cerrada lleva N. El
   * cierre perimetral se calculaba con la fórmula de la abierta, así que la
   * lista de materiales pedía un poste que no va a ninguna parte.
   */
  it('EL CIERRE QUE VUELVE SOBRE SÍ MISMO LLEVA UN POSTE MENOS QUE LA LÍNEA ABIERTA', () => {
    const base = { largo_m: 2600, esquinas: 12, especie: 'bovino', tipo: 'pua' } as const;
    const abierto = renglonesDeCierre({ ...base });
    const cerrado = renglonesDeCierre({ ...base, cerrado: true });
    const postes = (rs: ReturnType<typeof renglonesDeCierre>) =>
      rs.find(r => r.concepto.startsWith('Postes'))!.cantidad;
    const claros = Math.ceil(2600 / (20 * PIE));
    expect(postes(abierto)).toBe(claros - 12 + 1);
    expect(postes(cerrado)).toBe(claros - 12);
  });

  it('CON VARILLAS APARECE EL RENGLÓN DE VARILLAS, DOS POR CLARO', () => {
    const rs = renglonesDeCierre({ largo_m: 1000, esquinas: 0, especie: 'bovino', tipo: 'pua', conVarillas: true });
    const v = rs.find(r => r.concepto.startsWith('Varillas'))!;
    expect(v.cantidad).toBe(Math.ceil(1000 / (30 * PIE)) * 2);
  });

  it('EL ALAMBRE SON METROS DE CIERRE POR CANTIDAD DE HILOS, QUE ES LA CUENTA QUE SE ESCONDÍA', () => {
    const rs = renglonesDeCierre({ largo_m: 1000, esquinas: 0, especie: 'bovino', tipo: 'pua', hilos: 5 });
    const a = rs.find(r => r.concepto.startsWith('Alambre'))!;
    expect(a.cantidad).toBe(5000);
    expect(a.calidad).toMatch(/A 121|Clase III/);
  });

  it('Y SIN LA CANTIDAD DE HILOS NO LA SUPONE: EL RENGLÓN SALE EN CERO Y PIDE EL DATO', () => {
    const rs = renglonesDeCierre({ largo_m: 1000, esquinas: 0, especie: 'bovino', tipo: 'pua' });
    const a = rs.find(r => r.concepto === 'Alambre')!;
    expect(a.cantidad).toBe(0);
    expect(a.advertencia).toMatch(/cantidad mínima de hilos/i);
  });
});

// ─── La red de agua ──────────────────────────────────────────────────────────

describe('la red de agua', () => {
  it('LA CLASE DE PRESIÓN ES LA CALIDAD REQUERIDA, Y LA APP YA LA CALCULABA SIN MOSTRARLA', () => {
    const rs = renglonesDeRed(red);
    const cano = rs[0]!;
    expect(cano.cantidad).toBe(480);
    expect(cano.calidad).toMatch(/PN 10/);
    expect(cano.calidad).toMatch(/72 %/);
  });

  it('y la bomba aparece sólo si hace falta bombear', () => {
    expect(renglonesDeRed(red)).toHaveLength(2);
    expect(renglonesDeRed({ ...red, bomba_kw: null })).toHaveLength(1);
  });
});

// ─── La lista completa y la verificación ─────────────────────────────────────

describe('la lista completa', () => {
  it('junta los rubros y cuenta los renglones sin calidad declarada', () => {
    const l = armarLista({
      metricas, mojones: 8, cierre: { especie: 'bovino', tipo: 'pua', hilos: 5 },
      red, muro: { muro: muro(), balance: balance() },
    });
    expect(l.porRubro.map(r => r.rubro)).toEqual(['Cierres', 'Agua', 'Movimiento de suelo']);
    expect(l.sinCalidad).toBeGreaterThan(0);
    expect(l.advertencias.join(' ')).toMatch(/sin calidad declarada/);
  });

  it('SIN EL MURO NO EMITE VOLUMEN DE TIERRA, Y DICE POR QUÉ', () => {
    const l = armarLista({ capacidadRepresa_m3: 12000 });
    const tierra = l.renglones.find(r => r.rubro === 'Movimiento de suelo')!;
    expect(tierra.cantidad).toBe(0);
    expect(l.advertencias.join(' ')).toMatch(/capacidad embalsada no lo reemplaza/i);
  });

  it('todos los renglones nacen en estado «necesario»: el estado lo pone una persona', () => {
    const l = armarLista({ metricas, mojones: 4, cierre: { especie: 'ovino', tipo: 'pua', hilos: 5 } });
    expect(l.renglones.every(r => r.estado === 'necesario')).toBe(true);
  });

  it('LA LISTA DE VERIFICACIÓN DEL EFH SON OCHO PREGUNTAS Y UNA SOLA NO LA PUEDE CONTESTAR UN PROGRAMA', () => {
    expect(CHECKLIST_EFH5).toHaveLength(8);
    const persona = CHECKLIST_EFH5.filter(i => i.quien === 'persona');
    expect(persona).toHaveLength(1);
    expect(persona[0]!.n).toBe(7);                       // la carátula firmada
    expect(persona[0]!.comoSeContesta).toMatch(/distinto del que hizo el diseño/);
    expect(CHECKLIST_EFH5.map(i => i.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('y la lista vacía sigue trayendo la verificación, que es lo que se usa para saber qué falta', () => {
    const l = armarLista({});
    expect(l.renglones).toHaveLength(0);
    expect(l.checklist).toHaveLength(8);
  });
});

// ─── Los renglones del camellón ──────────────────────────────────────────────

/**
 * Las cantidades del caso de prueba son las de la vaguada al 3 % de
 * `camellon.test.ts`: 12 ha con paso de 1,5 m dan 80.004 m de surco y de 10 a
 * 30 jornadas de yunta. Acá no se recalculan —el resumen ya los trae— y lo que
 * se prueba es que la lista los lea sin tocarlos.
 */
function salida(over: Partial<SalidaResumen> = {}): SalidaResumen {
  return {
    cual: 'cauce', largo_m: 972, pendiente_pct: 3, area_ha: 12,
    caudal_m3s: 1.365, lluvia_mm: 95, cn: 89, tc_min: 30.1,
    forma: 'parabolica', ancho_m: 6.68, anchoTotal_m: 6.68,
    profundidad_m: 0.3, profundidadTotal_m: 0.3, velocidad_ms: 1.03,
    taludOrilla: 5.64, excavacion_m3: 1283, empastado_m2: 6495,
    cobertura: 'Mezcla de gramíneas', claseCapacidad: 'C', claseEstabilidad: 'D',
    sueloAguanta: true, pastoAguanta: true,
    esfuerzoEfectivo_pa: 2.39, esfuerzoAdmisible_pa: 2.39, avisos: [],
    ...over,
  };
}

function camellon(over: Partial<CamellonResumen> = {}): CamellonResumen {
  return {
    pendienteTerreno_pct: 3, superficie_ha: 12, paso_m: PASO_BBF_M,
    grado_pct: 0.6,
    banda: { min_pct: 0.4, max_pct: 0.8, vacia: false, nota: 'nota de la banda' },
    guia: { largo_m: 540, grado_medido_pct: 0.6, corte: 'sin_dato' },
    anchoUnidad_m: 390, camellones: 260, surco_m: 80004,
    jornadasYunta: { min: 10, max: 30 },
    salidaDesague: salida({ cual: 'desague', largo_m: 1064, excavacion_m3: 1331, empastado_m2: 6653 }),
    salidaCauce: salida(),
    trazable: true, avisos: [], fuentes: ['ICRISAT'],
    ...over,
  };
}

describe('renglonesDeCamellon', () => {
  it('son cinco renglones: el surco, la yunta, las dos excavaciones y el empastado', () => {
    const rs = renglonesDeCamellon(camellon());
    expect(rs).toHaveLength(5);
    expect(rs.every(r => r.rubro === 'Camellón')).toBe(true);
    expect(rs.map(r => r.unidad)).toEqual(['m', 'jornadas', 'm³', 'm³', 'm²']);
  });

  it('el surco sale con los metros del motor, sin recalcular', () => {
    const r = renglonesDeCamellon(camellon())[0]!;
    expect(r.cantidad).toBe(80004);
    expect(r.base).toBe('largo_trazado');
    expect(BASE_TEXTO['largo_trazado']).toMatch(/largo trazado/);
    expect(r.calidad).toMatch(/0,6 %/);
    expect(r.calidad).toMatch(/0,4 a 0,8 %/);
    expect(r.calidad).toMatch(/se replantea con nivel/);
    expect(r.advertencia).toBeUndefined();
  });

  /**
   * La yunta toma el TECHO del rango publicado, y el rango entero queda escrito
   * en el renglón. Es la decisión que el motor no puede tomar: la fuente da de
   * 0,4 a 1,2 ha por jornada «depending on the number of passes ... and the
   * condition of the working oxen», así que un solo número es una elección, y
   * la que corresponde en una lista de materiales es la que no deja la obra
   * corta.
   */
  it('la yunta toma el techo del rango y declara el rango', () => {
    const r = renglonesDeCamellon(camellon())[1]!;
    expect(r.cantidad).toBe(30);
    expect(r.deDonde).toMatch(/0,4 a 1,2 ha/);
    expect(r.deDonde).toMatch(/10 a 30 jornadas/);
    expect(r.calidad).toMatch(/ICRISAT/);
    expect(r.advertencia).toBeUndefined();
  });

  it('cada implemento publicado tiene su paso, y cualquier otro paso no tiene implemento', () => {
    expect(implementoDelPaso(PASO_BBF_M)).toMatch(/ICRISAT/);
    expect(implementoDelPaso(PASO_BBM_ILCA_M)).toMatch(/broadbed maker/i);
    expect(implementoDelPaso(PASO_MANUAL_MIN_M)).toMatch(/a mano|Inewari/);
    expect(implementoDelPaso((PASO_MANUAL_MIN_M + PASO_MANUAL_MAX_M) / 2)).not.toBeNull();
    expect(implementoDelPaso(2.5)).toBeNull();
  });

  it('con un paso que ningún implemento traza, la yunta sale sin calidad declarada y con el motivo', () => {
    const r = renglonesDeCamellon(camellon({ paso_m: 2.5 }))[1]!;
    expect(r.calidad).toBeNull();
    expect(r.advertencia).toMatch(/Ningún implemento publicado/);
  });

  it('sin superficie el surco declara la ausencia en vez de inventar una cantidad', () => {
    const rs = renglonesDeCamellon(camellon({ superficie_ha: null, surco_m: null, jornadasYunta: null }));
    const r = rs[0]!;
    expect(r.cantidad).toBe(0);
    expect(r.calidad).toBeNull();
    expect(r.advertencia).toMatch(/Falta la superficie/);
    // Y sin cantidades no hay renglón de yunta: no se supone la mano de obra.
    expect(rs.some(x => x.unidad === 'jornadas')).toBe(false);
  });

  it('y con la banda vacía el motivo es otro: no hay surco que trazar', () => {
    const r = renglonesDeCamellon(camellon({
      grado_pct: null, surco_m: null,
      banda: { min_pct: 0.4, max_pct: 0.1, vacia: true, nota: 'vacía' },
      pendienteTerreno_pct: 0.5,
    }))[0]!;
    expect(r.advertencia).toMatch(/no se puede hacer acá/);
  });

  it('la excavación es la del motor y declara la sección como calidad', () => {
    const rs = renglonesDeCamellon(camellon());
    const desague = rs.find(r => r.concepto.includes('desagüe'))!;
    const cauce = rs.find(r => r.concepto.includes('cauce empastado'))!;
    expect(desague.cantidad).toBe(1331);
    expect(cauce.cantidad).toBe(1283);
    expect(cauce.base).toBe('banco_excavado');
    expect(cauce.calidad).toMatch(/6,68 m de ancho/);
    expect(cauce.calidad).toMatch(/talud de orilla 5,64:1/);
    expect(cauce.deDonde).toMatch(/10 años y 24 h/);
  });

  it('si el suelo no aguanta el esfuerzo, el renglón lo dice: la sección está pero la obra es otra', () => {
    const rs = renglonesDeCamellon(camellon({
      salidaDesague: null,
      salidaCauce: salida({ sueloAguanta: false, esfuerzoEfectivo_pa: 5, esfuerzoAdmisible_pa: 2.39 }),
    }));
    const cauce = rs.find(r => r.unidad === 'm³')!;
    expect(cauce.advertencia).toMatch(/revestimiento o estructuras de caída/);
  });

  it('el empastado suma las dos salidas y pide el tapiz con el que se calculó', () => {
    const rs = renglonesDeCamellon(camellon());
    const emp = rs.find(r => r.unidad === 'm²')!;
    expect(emp.cantidad).toBe(6495 + 6653);
    expect(emp.base).toBe('superficie');
    expect(emp.calidad).toMatch(/Mezcla de gramíneas/);
    expect(emp.calidad).toMatch(/clase D/);           // el pobre, que decidió el ancho
    expect(emp.calidad).toMatch(/clase C/);           // el denso, que decidió la profundidad
    expect(emp.calidad).toMatch(/parte del cálculo/);
    expect(emp.deDonde).toMatch(/ANTES/);
  });

  it('con una sola salida el empastado nombra sólo esa', () => {
    const rs = renglonesDeCamellon(camellon({ salidaDesague: null }));
    const emp = rs.find(r => r.unidad === 'm²')!;
    expect(emp.concepto).toMatch(/cauce de salida/);
    expect(emp.cantidad).toBe(6495);
  });

  it('sin ninguna sección quedan el surco y la yunta, y nada más', () => {
    const rs = renglonesDeCamellon(camellon({ salidaDesague: null, salidaCauce: null }));
    expect(rs).toHaveLength(2);
    expect(rs.map(r => r.unidad)).toEqual(['m', 'jornadas']);
  });
});

describe('armarLista con el camellón', () => {
  it('lo mete en su propio rubro', () => {
    const l = armarLista({ camellon: camellon() });
    expect(l.renglones).toHaveLength(5);
    expect(l.porRubro.map(g => g.rubro)).toEqual(['Camellón']);
  });

  it('y si las dos salidas están trazadas sin sección, la lista lo advierte', () => {
    const l = armarLista({ camellon: camellon({ salidaDesague: null, salidaCauce: null }) });
    expect(l.advertencias.join(' ')).toMatch(/sin las dos salidas/);
  });

  it('con las dos salidas dimensionadas no hay esa advertencia', () => {
    const l = armarLista({ camellon: camellon() });
    expect(l.advertencias.join(' ')).not.toMatch(/sin las dos salidas/);
  });
});
