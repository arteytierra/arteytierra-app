/**
 * Las planillas de las tres obras que acequia diseña: el muro de la represa, el
 * swale y la directriz del patrón keyline.
 *
 * `planilla.test.ts` prueba el motor —la progresiva, la varilla de rasante, los
 * intervalos publicados—. Acá se prueba lo que cada obra agrega: qué rasante
 * lleva, qué progresiva es un renglón propio, qué se entrega con la tabla y qué
 * se avisa.
 *
 * Los números esperados salen de las fuentes o de una cuenta de una línea que
 * está escrita al lado, para que el test se pueda leer contra el manual.
 */
import { describe, it, expect } from 'vitest';
import {
  planillaDeMuro, planillaDeSwale, planillaDeDirectriz,
  corrimientoDeTraza, planillaCSV,
  PRECISION_TIERRA_M, PRECISION_ESTRUCTURA_M, INTERVALO_ESTACA_MAX_M,
  DERIVA_POR_REDONDEO_TIERRA_PCT, DERIVA_POR_REDONDEO_ESTRUCTURA_PCT,
} from '../../../lib/planilla';
import { DERIVA_MIN_DRENAJE_PCT } from '../../../lib/keylineGeometria';
import { incertidumbreDeCota } from '../../../lib/modeloDeclarado';
import { perfilDeEje } from '../../../lib/cutfill';
import type { GrillaElevacion } from '../../../lib/grillaElevacion';

/** Metros por grado, con el radio que usa `distanciaMetros`. */
const M_POR_GRADO = (6371000 * Math.PI) / 180;

/** Punto a `s` metros al este del origen, sobre el ecuador. */
const alEste = (s: number) => ({ lat: 0, lng: s / M_POR_GRADO });

/** Una traza recta este-oeste de `n` puntos. */
const trazaRecta = (largo_m: number, n: number) =>
  Array.from({ length: n }, (_, i) => alEste((i / (n - 1)) * largo_m));

/** La incertidumbre punto a punto del modelo global, que es 2 m al 90 %. */
const U_GLO30 = incertidumbreDeCota('glo30', 5).u_relativa!;

// ─────────────────────────────────────────────────────────────────────────────
describe('el corrimiento horizontal de una traza de nivel', () => {
  it('UNA LADERA DEL 5 % CONVIERTE 1,22 m DE ERROR VERTICAL EN 24 m DE ERROR HORIZONTAL', () => {
    // 2 m al 90 % / 1,64 = 1,22 m punto a punto; sobre S = 0,05 son 24,4 m.
    expect(U_GLO30).toBeCloseTo(1.22, 2);
    const c = corrimientoDeTraza(U_GLO30, 5)!;
    expect(c.corrimiento_m).toBeCloseTo(24.4, 1);
  });

  it('Y AL 2 % SON 61 m: LA ZANJA PUEDE ESTAR UNA FRANJA ENTERA MÁS ARRIBA', () => {
    expect(corrimientoDeTraza(U_GLO30, 2)!.corrimiento_m).toBeCloseTo(61, 0);
    // Y al 20 % el mismo error vertical son 6 m, que es el ancho de una máquina.
    expect(corrimientoDeTraza(U_GLO30, 20)!.corrimiento_m).toBeCloseTo(6.1, 1);
  });

  it('EN TERRENO PLANO NO DEVUELVE UN NÚMERO GRANDE: DEVUELVE QUE NO EXISTE', () => {
    // Una curva de nivel sobre un plano horizontal no tiene posición definida.
    // Un corrimiento «muy grande» sería una respuesta falsa: el límite no existe.
    const c = corrimientoDeTraza(U_GLO30, 0)!;
    expect(c.corrimiento_m).toBeNull();
    expect(c.lectura).toMatch(/no tiene posición definida/);
    expect(corrimientoDeTraza(U_GLO30, null)!.corrimiento_m).toBeNull();
    expect(corrimientoDeTraza(0, 5)).toBeNull();
  });

  it('la pendiente entra dos veces y no es doble conteo: una elige la exactitud publicada, otra convierte', () => {
    // El modelo global publica 2 m para pendiente suave y 4 m por encima del
    // 20 %. Así que al cruzar el umbral el corrimiento salta, y el salto es del
    // escalón publicado y no de la fórmula: la fórmula es monótona decreciente.
    const suave  = corrimienoEnPendiente(20);
    const fuerte = corrimienoEnPendiente(21);
    expect(fuerte!).toBeGreaterThan(suave!);
    // Con la MISMA exactitud, más pendiente siempre es menos corrimiento.
    expect(corrimientoDeTraza(U_GLO30, 21)!.corrimiento_m!)
      .toBeLessThan(corrimientoDeTraza(U_GLO30, 20)!.corrimiento_m!);
  });
});

function corrimienoEnPendiente(p: number): number | null {
  const u = incertidumbreDeCota('glo30', p).u_relativa;
  return corrimientoDeTraza(u, p)?.corrimiento_m ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
describe('la planilla del muro de la represa', () => {
  /** Un eje de 120 m con el terreno en V: los estribos altos, el cauce al medio. */
  const PERFIL = [108, 104, 100, 104, 108];
  const base = {
    a: alEste(0), b: alEste(120),
    perfil_m: PERFIL,
    cotaCoronaConstruida_m: 105.5,
    cotaCoronaDiseno_m: 105,
    sobrealto_m: 0.5,
    cotaVertedero_m: 104,
    anchoCorona_m: 3.66,
    taludInterno: 3,
    taludExterno: 2,
    zanja: { prof_m: 0.8, anchoFondo_m: 2.44 },
    fuenteRelieve: 'glo30' as const,
    pendienteTerreno_pct: 8,
  };

  it('LA RASANTE ES LA CORONA CONSTRUIDA Y NO LA DE PROYECTO, QUE ES MEDIO METRO MÁS ABAJO', () => {
    // TR-62, lo primero de lo que se entrega: «Total fill height (design height
    // plus allowance for settlement) at each station». El terraplén asienta, así
    // que se replantea más alto de lo que va a quedar.
    const p = planillaDeMuro(base)!;
    expect(p.renglones.every(r => r.cota_diseno_m === 105.5)).toBe(true);
    const entrega = p.entrega.find(i => /proyecto contra/i.test(i.que))!;
    expect(entrega.valor).toMatch(/105\.00 m de proyecto/);
    expect(entrega.valor).toMatch(/105\.50 m/);
  });

  it('Y LA COLUMNA Δ ES LA CORONA RESPECTO DEL MOJÓN, QUE ES LO QUE SE LLEVA AL CAMPO', () => {
    const p = planillaDeMuro(base)!;
    // El mojón M1 está en la progresiva 0, donde el terreno está a 108 m.
    expect(p.mojones[0]!.cota_m).toBeCloseTo(108, 3);
    // Δ = 105,5 − 108 = −2,5 en todas las estaciones, porque la corona es
    // horizontal: lo que cambia a lo largo del eje es el terreno, no la rasante.
    expect(p.renglones.every(r => Math.abs(r.altura_sobre_mojon_m! + 2.5) < 1e-6)).toBe(true);
    // La altura de relleno de cada estación NO es Δ: es Δ menos la lectura de
    // mira, y la entrega lo dice así en vez de confundir las dos cosas.
    const alt = p.entrega.find(i => /altura de relleno/i.test(i.que))!;
    expect(alt.valor).toMatch(/menos la lectura de mira/);
    expect(alt.valor).toMatch(/0\.50 m/);          // el sobrealto, ya incluido
  });

  it('EL EJE DEL VERTEDERO ES UN RENGLÓN PROPIO, QUE ES LO QUE PIDE LA NORMA DE PRÁCTICA', () => {
    // CPS 378: «show stations of intersections of principal and auxiliary
    // spillway centerlines; establish stationing ground control».
    const p = planillaDeMuro({ ...base, estriboVertedero: 'b' })!;
    const ultimo = p.renglones[p.renglones.length - 1]!;
    expect(ultimo.tipo).toBe('cruce');
    expect(ultimo.nota).toMatch(/vertedero/i);
    // Y en el estribo A cae en la progresiva 0.
    const pa = planillaDeMuro({ ...base, estriboVertedero: 'a' })!;
    expect(pa.renglones[0]!.tipo).toBe('cruce');
    expect(pa.renglones[0]!.progresiva_m).toBe(0);
  });

  it('la cresta del vertedero se entrega RELATIVA al mismo mojón, como la fuente', () => {
    // TR-62 entrega las dimensiones del vertedero «and elevation relative to the
    // same hub». 104 − 108 = −4 m respecto de M1.
    const p = planillaDeMuro(base)!;
    const v = p.entrega.find(i => /vertedero/i.test(i.que))!;
    expect(v.valor).toMatch(/-4\.00 m/);
  });

  it('SI EL MURO SE DIMENSIONÓ CON OTRO LARGO QUE EL EJE DIBUJADO, LO DICE', () => {
    // No elige uno: avisa que el volumen y el replanteo están hablando de dos
    // muros distintos, que es exactamente lo que pasa.
    const p = planillaDeMuro({ ...base, longitudDimensionada_m: 500 })!;
    expect(p.advertencias.some(a => /dos muros distintos/.test(a))).toBe(true);
    // Con el largo del eje no avisa nada.
    const ok = planillaDeMuro({ ...base, longitudDimensionada_m: 120 })!;
    expect(ok.advertencias.some(a => /dos muros distintos/.test(a))).toBe(false);
  });

  it('y sin cota de corona pone primero que falta la altura de relleno', () => {
    const p = planillaDeMuro({ ...base, cotaCoronaConstruida_m: null })!;
    expect(p.advertencias[0]).toMatch(/altura de relleno/);
    expect(p.renglones.every(r => r.cota_diseno_m === null)).toBe(true);
  });

  it('el perfil entra ALINEADO con el eje: el primer y el último valor son los estribos', () => {
    const p = planillaDeMuro(base)!;
    expect(p.renglones[0]!.cota_terreno_m).toBeCloseTo(108, 1);
    expect(p.renglones[p.renglones.length - 1]!.cota_terreno_m).toBeCloseTo(108, 1);
    expect(p.largo_m).toBeCloseTo(120, 0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('el perfil del eje, que tiene que quedar alineado', () => {
  /** Grilla plana de 11×11 con una pendiente este-oeste y un hueco opcional. */
  function grilla(hueco?: { r: number; c: number }): GrillaElevacion {
    const rows = 11, cols = 11;
    const elev = new Float64Array(rows * cols);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) elev[r * cols + c] = 100 + c;   // sube al este
    }
    if (hueco) elev[hueco.r * cols + hueco.c] = NaN;
    return {
      rows, cols, latMin: -0.001, latMax: 0.001, lngMin: 0, lngMax: 0.001,
      elev, elev_min: 100, elev_max: 110, fuente: 'glo30',
    };
  }
  const a = { lat: 0, lng: 0.00005 };
  const b = { lat: 0, lng: 0.00095 };

  it('UN HUECO DEL MODELO YA NO ACORTA EL PERFIL NI CORRE LAS MUESTRAS DE LUGAR', () => {
    // Hasta el 07/10/2026 las muestras sin dato se salteaban, y los dos
    // consumidores leen el arreglo como si cubriera el eje entero a paso
    // regular: el volumen del terraplén salía de un perfil estirado y mal
    // ubicado, sin que nada lo dijera.
    const sinHueco = perfilDeEje(grilla(), a, b, 21)!;
    const conHueco = perfilDeEje(grilla({ r: 5, c: 5 }), a, b, 21)!;
    expect(sinHueco.cotas).toHaveLength(21);
    expect(conHueco.cotas).toHaveLength(21);
    expect(conHueco.huecos).toBeGreaterThan(0);
    expect(sinHueco.huecos).toBe(0);
  });

  it('y el hueco interior se interpola entre los vecinos con dato, no se saltea', () => {
    // Sobre un plano la interpolación lineal devuelve el valor exacto, así que
    // el perfil con hueco tiene que coincidir con el perfil completo.
    const sinHueco = perfilDeEje(grilla(), a, b, 21)!;
    const conHueco = perfilDeEje(grilla({ r: 5, c: 5 }), a, b, 21)!;
    for (let i = 0; i < 21; i++) {
      expect(conHueco.cotas[i]!).toBeCloseTo(sinHueco.cotas[i]!, 6);
    }
    expect(conHueco.bordesExtendidos).toBe(false);
  });

  it('si el hueco toca un extremo lo dice, porque ahí la cota del estribo es supuesta', () => {
    const p = perfilDeEje(grilla({ r: 5, c: 0 }), { lat: 0, lng: 0 }, b, 21)!;
    expect(p.bordesExtendidos).toBe(true);
    expect(p.cotas).toHaveLength(21);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('la planilla del swale', () => {
  const base = {
    puntos: trazaRecta(200, 9),
    cota_m: 320,
    prof_m: 0.8,
    seccion: { base_m: 0.5, talud_z: 1.5, ancho_sup_m: 2.9 },
    pendienteTerreno_pct: 5,
    fuenteRelieve: 'glo30' as const,
  };

  it('LA ZANJA VA A NIVEL: LA ALTURA SOBRE EL MOJÓN ES LA PROFUNDIDAD, IGUAL EN TODAS', () => {
    const p = planillaDeSwale(base)!;
    expect(p.renglones.length).toBeGreaterThan(5);
    expect(p.renglones.every(r => Math.abs(r.altura_sobre_mojon_m! + 0.8) < 1e-6)).toBe(true);
  });

  it('Y EL MOJÓN SE CANCELA: LA MISMA ZANJA A 320 m Y A 1.320 m DA LA MISMA PLANILLA', () => {
    // Es la razón por la que un swale se replantea con un nivel de manguera y
    // sin ningún datum: toda la planilla es una resta contra el mojón.
    const bajo = planillaDeSwale(base)!;
    const alto = planillaDeSwale({ ...base, cota_m: 1320 })!;
    expect(alto.renglones.map(r => r.altura_sobre_mojon_m))
      .toEqual(bajo.renglones.map(r => r.altura_sobre_mojon_m));
  });

  it('EL FONDO SE ANOTA CON LA PRECISIÓN FINA, Y LA CUENTA QUE LO JUSTIFICA ES EXACTA', () => {
    // Las dos precisiones de TR-62 divididas por el intervalo de estaca de
    // AH-590 dan la pendiente que el redondeo de la anotación por sí solo puede
    // meter entre dos estacas. Las tres cifras están en pies, así que el
    // cociente es exacto: 0,1/100 = 0,10 % y 0,01/100 = 0,01 %.
    expect(PRECISION_TIERRA_M / INTERVALO_ESTACA_MAX_M * 100)
      .toBeCloseTo(DERIVA_POR_REDONDEO_TIERRA_PCT, 10);
    expect(PRECISION_ESTRUCTURA_M / INTERVALO_ESTACA_MAX_M * 100)
      .toBeCloseTo(DERIVA_POR_REDONDEO_ESTRUCTURA_PCT, 10);
    // Contra el único grado publicado que acequia tiene para decir cuándo una
    // zanja deja de retener y empieza a drenar —el piso de la banda de deriva
    // del surco, que es de otra práctica y hay que decirlo— la precisión de
    // movimiento de suelo se come la MITAD del margen y la fina la vigésima parte.
    expect(DERIVA_POR_REDONDEO_TIERRA_PCT / DERIVA_MIN_DRENAJE_PCT).toBeCloseTo(0.5, 10);
    expect(DERIVA_POR_REDONDEO_ESTRUCTURA_PCT / DERIVA_MIN_DRENAJE_PCT).toBeCloseTo(0.05, 10);
    // Y por eso la planilla del swale pide la precisión fina.
    expect(planillaDeSwale(base)!.precision.pedida_m).toBe(PRECISION_ESTRUCTURA_M);
  });

  it('IMPRIME CUÁNTO PUEDE ESTAR CORRIDA LA TRAZA, QUE ES EL ERROR QUE IMPORTA EN UN SWALE', () => {
    const p = planillaDeSwale(base)!;
    expect(p.corrimiento!.corrimiento_m).toBeCloseTo(24.4, 1);
    expect(p.advertencias.some(a => /corrida ladera arriba/.test(a))).toBe(true);
  });

  it('y avisa que las cotas son la de la curva y no una medición', () => {
    const p = planillaDeSwale(base)!;
    expect(p.advertencias[0]).toMatch(/no una medición/);
    // No arrastra el aviso de «sin rasante de diseño»: la rasante existe y es el
    // fondo de la zanja.
    expect(p.advertencias.some(a => /^Sin rasante de diseño/.test(a))).toBe(false);
  });

  it('sin profundidad de proyecto no inventa un fondo', () => {
    const p = planillaDeSwale({ ...base, prof_m: null })!;
    expect(p.renglones.every(r => r.altura_sobre_mojon_m === null)).toBe(true);
    expect(p.advertencias.some(a => /dimensioná la sección/i.test(a))).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('la planilla de la directriz keyline', () => {
  const base = {
    master: trazaRecta(300, 13),
    espaciado_m: 12,
    headland_m: 6,
    orientacion_deg: 92,
    deriva_media_pct: 1.4,
    verticesCerrados: 2,
    pendienteTerreno_pct: 7,
    fuenteRelieve: 'glo30' as const,
  };

  it('NO LLEVA RASANTE, Y ESO NO ES UNA CARENCIA: EL SURCO SIGUE EL TERRENO', () => {
    // La deriva no es el error del método: es el método. Así que no hay cota de
    // diseño que replantear, y lo que se replantea es la traza.
    const p = planillaDeDirectriz(base)!;
    expect(p.renglones.every(r => r.cota_diseno_m === null)).toBe(true);
    expect(p.advertencias[0]).toMatch(/no le falta nada/);
    expect(p.advertencias.some(a => /^Sin rasante de diseño/.test(a))).toBe(false);
  });

  it('EL GIRO MÁXIMO DEL TRACTOR VA EN LA ENTREGA, CON CUÁNTOS VÉRTICES LO PASAN', () => {
    const p = planillaDeDirectriz(base)!;
    const giro = p.entrega.find(i => /giro/i.test(i.que))!;
    expect(giro.valor).toMatch(/50°/);
    expect(giro.valor).toMatch(/2 vértice/);
    expect(p.advertencias.some(a => /redondearlos/.test(a))).toBe(true);
    // Sin vértices cerrados no mete un aviso que no corresponde.
    const limpio = planillaDeDirectriz({ ...base, verticesCerrados: 0 })!;
    expect(limpio.advertencias.some(a => /redondearlos/.test(a))).toBe(false);
  });

  it('dice que la directriz es la única línea que se mide, porque el error se copia', () => {
    const p = planillaDeDirectriz(base)!;
    expect(p.notas[0]).toMatch(/se copia en todo el lote/);
  });

  it('con menos de dos puntos no devuelve una planilla de un renglón', () => {
    expect(planillaDeDirectriz({ ...base, master: [alEste(0)] })).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('la planilla en CSV', () => {
  const p = planillaDeSwale({
    puntos: trazaRecta(100, 5), cota_m: 320, prof_m: 0.8,
    pendienteTerreno_pct: 5, fuenteRelieve: 'glo30',
  })!;
  const csv = planillaCSV(p);
  const lineas = csv.split('\n');

  /**
   * Parser de una fila de CSV, con comillas.
   *
   * No se puede partir por comas: las notas de campo TIENEN comas, y por eso van
   * entre comillas. El primer intento de este test partió por comas y lo que
   * encontró fue el error del test; pero el parser vale la pena acá, porque es
   * el que hace cualquier planilla de cálculo al abrir el archivo.
   */
  const campos = (linea: string): string[] => {
    const out: string[] = [];
    let cur = '', dentro = false;
    for (let i = 0; i < linea.length; i++) {
      const ch = linea[i]!;
      if (dentro) {
        if (ch === '"' && linea[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') dentro = false;
        else cur += ch;
      } else if (ch === '"') dentro = true;
      else if (ch === ',') { out.push(cur); cur = ''; }
      else cur += ch;
    }
    out.push(cur);
    return out;
  };

  it('TRAE LA CABECERA QUE LA NORMA EXIGE: PRÁCTICA, PROPÓSITO Y FECHA', () => {
    // TR-62 lo pide explícitamente: «Purpose of survey (design, construction
    // layout, construction check, etc.)».
    expect(campos(lineas[0]!)[0]).toBe('Práctica');
    expect(csv).toMatch(/"Propósito","Replanteo de construcción"/);
    expect(csv).toMatch(/"Fecha",/);
  });

  it('Y LAS DOS COLUMNAS DE CAMPO SALEN VACÍAS, QUE ES COMO TIENEN QUE SALIR', () => {
    const iCab = lineas.findIndex(l => l.startsWith('"Progresiva",'));
    expect(iCab).toBeGreaterThan(0);
    const cab = campos(lineas[iCab]!);
    const iMira = cab.indexOf('Lectura de mira (m)');
    const iCorte = cab.indexOf('Corte (+) / relleno (-) (m)');
    expect(iMira).toBeGreaterThan(0);
    expect(iCorte).toBe(iMira + 1);
    // Cada renglón de datos tiene esas dos celdas en blanco, y la misma cantidad
    // de columnas que la cabecera: si no coincidiera, el archivo abriría con las
    // columnas corridas y la planilla no serviría para nada.
    const datos = lineas.slice(iCab + 1, iCab + 1 + p.renglones.length);
    expect(datos).toHaveLength(p.renglones.length);
    for (const d of datos) {
      const c = campos(d);
      expect(c).toHaveLength(cab.length);
      expect(c[iMira]).toBe('');
      expect(c[iCorte]).toBe('');
    }
  });

  it('y el texto con comas no rompe las columnas', () => {
    // Las notas de campo tienen comas y comillas: si no se escapan, el archivo
    // abre con las columnas corridas y la planilla se vuelve inservible.
    expect(csv).toMatch(/""/);
    for (const l of lineas) {
      expect((l.match(/"/g)?.length ?? 0) % 2).toBe(0);
    }
  });
});
