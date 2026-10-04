/**
 * Las dos decisiones de lado: el vertedero y el cierre.
 *
 * Cubre `lib/ladoDeObra.ts` y la sección 11 de `lib/represaDiseno.ts`, que no se
 * entienden por separado: una mide el relieve y la otra dice qué significa lo
 * medido según AH-590.
 *
 * El test que importa es `el estribo más plano no es el mejor`: el enunciado de
 * la clase 9 dice «el lado con menor pendiente», y tomado literalmente elige un
 * estribo donde el canal no evacúa. El manual le pone piso. Si alguien vuelve a
 * ordenar los estribos por pendiente creciente, ese test se cae.
 */
import { describe, it, expect } from 'vitest';
import { grillaMetrica, puntoMetrico, grillaDesdeFn } from '../topografia/_grilla';
import {
  clasificarPendienteVertedero,
  ORDEN_APTITUD_VERTEDERO,
  VERTEDERO_NIVEL_MIN_M,
  VERTEDERO_ENTRADA_MIN_PCT,
  VERTEDERO_ENTRADA_ENSANCHE,
  VERTEDERO_NATURAL_PCT_MIN,
  VERTEDERO_NATURAL_PCT_MAX,
  VERTEDERO_SALIDA_BANDA_PCT,
  VERTEDERO_SALIDA_MAX_TABULADO_PCT,
  PIE_M,
} from '@/lib/represaDiseno';
import {
  ladoDelVertedero, compararLadosDelMuro, largoSegmento_m, relacionAlmacenamiento,
  PROF_NATURAL_MIN_M, PROF_NATURAL_MAX_M, RELACION_LADERA,
  CELDAS_MAX_COMPARACION, EMPATE_FRAC,
  type LadoVertedero,
} from '@/lib/ladoDeObra';
import { ladoAguasArribaDeMuro, vasoDesdeMuro } from '@/lib/vaso';

// ─── Terrenos sintéticos ─────────────────────────────────────────────────────

const PASO = 10, N = 81, YC = 400;

/**
 * Valle que corre al este con flancos de pendiente distinta a cada lado del
 * eje. El muro cruza el valle de sur a norte: `a` es el estribo sur y `b` el
 * norte, y el agua queda al oeste.
 */
function valleAsimetrico(aNorte: number, aSur: number, longitudinal = 0.003) {
  return grillaMetrica(N, N, PASO, (x, y) =>
    100 - longitudinal * x + (y > YC ? aNorte * (y - YC) ** 2 : aSur * (YC - y) ** 2));
}

/** El muro a la altura `x`, de sur a norte, con el espejo al oeste. */
function muroEnX(g: ReturnType<typeof grillaMetrica>, x = 400, ySur = 200, yNorte = 600) {
  return {
    muro: { a: puntoMetrico(g, x, ySur), b: puntoMetrico(g, x, yNorte) },
    ref: puntoMetrico(g, x - 200, YC),
  };
}

const cand = (r: LadoVertedero, e: 'a' | 'b') => r.candidatos.find(c => c.extremo === e)!;

// ─── 1 · Las constantes contra lo impreso ────────────────────────────────────

describe('los números publicados del vertedero', () => {
  it('el tramo a nivel son los 25 pies de la figura 21', () => {
    expect(VERTEDERO_NIVEL_MIN_M).toBeCloseTo(25 * PIE_M, 6);
    expect(VERTEDERO_NIVEL_MIN_M).toBeCloseTo(7.62, 2);
  });

  it('el canal de entrada pide 2 % hacia el vaso y se ensancha un 50 %', () => {
    expect(VERTEDERO_ENTRADA_MIN_PCT).toBe(2.0);
    expect(VERTEDERO_ENTRADA_ENSANCHE).toBe(1.5);
  });

  it('el cuadro 10 va de 0,5 a 5 % de terreno natural', () => {
    expect(VERTEDERO_NATURAL_PCT_MIN).toBe(0.5);
    expect(VERTEDERO_NATURAL_PCT_MAX).toBe(5);
  });

  it('el cuadro 8 parte en 5 % y se termina en 10 %', () => {
    expect(VERTEDERO_SALIDA_BANDA_PCT).toBe(5);
    expect(VERTEDERO_SALIDA_MAX_TABULADO_PCT).toBe(10);
  });

  it('la ventana de profundidad natural del curso es 2,5 a 5,5 m', () => {
    expect(PROF_NATURAL_MIN_M).toBe(2.5);
    expect(PROF_NATURAL_MAX_M).toBe(5.5);
    expect(RELACION_LADERA).toBe(1);
  });
});

// ─── 2 · Clasificar una pendiente de canal de salida ─────────────────────────

describe('clasificarPendienteVertedero', () => {
  it('por debajo de la fila más plana del cuadro 10 no drena', () => {
    const r = clasificarPendienteVertedero(0.4);
    expect(r.aptitud).toBe('sin_drenaje');
    expect(r.nota).toContain('no drena');
    expect(r.advertencias.length).toBeGreaterThan(0);
  });

  it('en 0,5 % ya entra como vertedero natural: el límite es inclusivo', () => {
    expect(clasificarPendienteVertedero(0.5).aptitud).toBe('natural');
    expect(clasificarPendienteVertedero(0.49).aptitud).toBe('sin_drenaje');
  });

  it('hasta 5 % es natural y se puede no excavar el canal', () => {
    expect(clasificarPendienteVertedero(3).aptitud).toBe('natural');
    expect(clasificarPendienteVertedero(5).aptitud).toBe('natural');
    expect(clasificarPendienteVertedero(3).nota).toContain('natural');
  });

  it('entre 5 y 10 % hay que excavar y baja la velocidad admisible', () => {
    const r = clasificarPendienteVertedero(7);
    expect(r.aptitud).toBe('excavado');
    expect(r.bandaVelocidad).toBe('5-10');
    expect(r.advertencias.join(' ')).toContain('banda empinada');
    expect(clasificarPendienteVertedero(5.01).aptitud).toBe('excavado');
    expect(clasificarPendienteVertedero(10).aptitud).toBe('excavado');
  });

  it('pasado el 10 % el cuadro 8 no tiene fila y no se extrapola', () => {
    const r = clasificarPendienteVertedero(12);
    expect(r.aptitud).toBe('fuera_de_tabla');
    expect(r.bandaVelocidad).toBeNull();
    expect(r.nota).toContain('no interpola');
  });

  it('las dos bandas de velocidad del cuadro 8 se reparten en 5 %', () => {
    expect(clasificarPendienteVertedero(1).bandaVelocidad).toBe('0-5');
    expect(clasificarPendienteVertedero(5).bandaVelocidad).toBe('0-5');
    expect(clasificarPendienteVertedero(5.5).bandaVelocidad).toBe('5-10');
  });

  it('sin pendiente medida no inventa un cuadro', () => {
    const r = clasificarPendienteVertedero(NaN);
    expect(r.aptitud).toBe('sin_drenaje');
    expect(r.advertencias.join(' ')).toContain('No se pudo medir');
  });

  it('la preferencia es natural, excavado, fuera de tabla, sin drenaje', () => {
    expect(ORDEN_APTITUD_VERTEDERO.natural).toBeLessThan(ORDEN_APTITUD_VERTEDERO.excavado);
    expect(ORDEN_APTITUD_VERTEDERO.excavado).toBeLessThan(ORDEN_APTITUD_VERTEDERO.fuera_de_tabla);
    expect(ORDEN_APTITUD_VERTEDERO.fuera_de_tabla).toBeLessThan(ORDEN_APTITUD_VERTEDERO.sin_drenaje);
  });
});

// ─── 3 · El lado del vertedero sobre el relieve ──────────────────────────────

describe('ladoDelVertedero', () => {
  it('con los dos estribos en tabla gana el de menor pendiente', () => {
    // Norte 3 %, sur 8 %: los dos sirven, el norte sin excavar el canal.
    const g = valleAsimetrico(1.5e-4, 4e-4);
    const { muro, ref } = muroEnX(g);
    const r = ladoDelVertedero(g, muro, { referenciaAguasArriba: ref });
    expect(r).not.toBeNull();
    const norte = cand(r!, 'b'), sur = cand(r!, 'a');

    expect(norte.pendiente.aptitud).toBe('natural');
    expect(sur.pendiente.aptitud).toBe('excavado');
    expect(norte.camino.pendiente_media_pct).toBeLessThan(sur.camino.pendiente_media_pct);
    expect(r!.recomendado).toBe('b');
    expect(r!.lectura).toContain('punta B');
  });

  it('el vertido del estribo recomendado vuelve al cauce', () => {
    const g = valleAsimetrico(1.5e-4, 4e-4);
    const { muro, ref } = muroEnX(g);
    const r = ladoDelVertedero(g, muro, { referenciaAguasArriba: ref })!;
    const norte = cand(r, 'b');
    expect(norte.camino.llegaAlCauce).toBe(true);
    expect(norte.camino.motivoCorte).toBe('cauce');
    expect(norte.camino.largo_m).toBeGreaterThan(0);
    expect(norte.camino.desnivel_m).toBeGreaterThan(0);
    // El recorrido se devuelve dibujable.
    expect(norte.camino.puntos.length).toBeGreaterThan(2);
  });

  it('EL ESTRIBO MÁS PLANO NO ES EL MEJOR: hay piso publicado', () => {
    // Norte casi horizontal (0,3 %), sur 3 %. «Menor pendiente» tomado al pie
    // de la letra elige el norte, donde el canal no evacúa; AH-590 arranca su
    // cuadro de vertederos naturales en 0,5 % y pide 2 % de entrada.
    const g = valleAsimetrico(2.5e-6, 1.5e-4);
    const { muro, ref } = muroEnX(g);
    const r = ladoDelVertedero(g, muro, { referenciaAguasArriba: ref })!;
    const norte = cand(r, 'b'), sur = cand(r, 'a');

    // El norte ES el de menor pendiente. Ése es el punto del test.
    expect(norte.camino.pendiente_media_pct).toBeLessThan(sur.camino.pendiente_media_pct);
    expect(norte.camino.pendiente_media_pct).toBeLessThan(VERTEDERO_NATURAL_PCT_MIN);
    expect(norte.pendiente.aptitud).toBe('sin_drenaje');
    expect(sur.pendiente.aptitud).toBe('natural');

    // Y la recomendación es el OTRO.
    expect(r.recomendado).toBe('a');
    expect(r.lectura).toContain('no drena');
  });

  it('un vertido que correría pegado al muro queda descartado', () => {
    // Caso de laboratorio: el eje puesto sobre la propia vaguada, así que
    // desde el estribo de arriba el agua bajaría a lo largo del terraplén.
    const g = grillaMetrica(N, N, PASO, (x, y) => 100 - 0.03 * y + 1e-4 * (x - 400) ** 2);
    const muro = { a: puntoMetrico(g, 400, 200), b: puntoMetrico(g, 400, 600) };
    const ref = puntoMetrico(g, 400, 100);
    const r = ladoDelVertedero(g, muro, { referenciaAguasArriba: ref })!;

    const sur = cand(r, 'a');
    expect(sur.camino.haciaElMuro).toBe(true);
    expect(sur.descartado).toBe(true);
    expect(sur.motivo).toContain('pegado al muro');
    expect(r.recomendado).toBe('b');
  });

  it('sin terreno aguas abajo no hay vuelta al cauce y lo dice', () => {
    const g = grillaDesdeFn(N, N, (rw, c) => {
      const x = c * PASO, y = rw * PASO;
      if (x > 400) return NaN;
      return 100 - 0.003 * x + 1.5e-4 * (y - YC) ** 2;
    }, { latMin: 0, latMax: (PASO / 111_320) * (N - 1), lngMin: 0, lngMax: (PASO / 111_320) * (N - 1) });
    const muro = { a: puntoMetrico(g, 390, 200), b: puntoMetrico(g, 390, 600) };
    const ref = puntoMetrico(g, 200, YC);
    const r = ladoDelVertedero(g, muro, { referenciaAguasArriba: ref })!;

    expect(r.advertencias.join(' ')).toContain('no dibuja un cauce');
    expect(r.candidatos.every(c => c.descartado)).toBe(true);
    expect(r.recomendado).toBeNull();
    expect(r.lectura).toContain('dique');
  });

  it('cuando el vaso ya derrama por una silla, eso le gana a los dos estribos', () => {
    const g = valleAsimetrico(1.5e-4, 4e-4);
    const { muro, ref } = muroEnX(g);
    const vaso = vasoDesdeMuro(g, muro, { referenciaAguasArriba: ref });
    const r = ladoDelVertedero(g, muro, { referenciaAguasArriba: ref, vaso })!;
    if (vaso && vaso.tipoTope === 'derrame' && !vaso.derramePorEstribo) {
      expect(r.derrameNatural).not.toBeNull();
      expect(r.lectura).toContain('natural spillway');
    } else {
      // Si el tope de este terreno no es una silla, la salida es la otra: no se
      // inventa un derrame natural que no existe.
      expect(r.derrameNatural).toBeNull();
    }
  });

  it('cita las dos fuentes, con la cadena del relevamiento a la vista', () => {
    const g = valleAsimetrico(1.5e-4, 4e-4);
    const { muro, ref } = muroEnX(g);
    const r = ladoDelVertedero(g, muro, { referenciaAguasArriba: ref })!;
    expect(r.fuentes.join(' ')).toContain('Agriculture Handbook 590');
    expect(r.fuentes.join(' ')).toContain('Nelson');
    expect(r.fuentes.join(' ')).toContain('relevamiento');
  });
});

// ─── 4 · El lado aguas arriba, extraído del vaso ─────────────────────────────

describe('ladoAguasArribaDeMuro', () => {
  it('el signo se da vuelta al invertir el muro, y el lado del agua no', () => {
    const g = valleAsimetrico(1.5e-4, 4e-4);
    const { muro, ref } = muroEnX(g);
    const d = ladoAguasArribaDeMuro(g, muro, { referenciaAguasArriba: ref })!;
    const i = ladoAguasArribaDeMuro(g, { a: muro.b, b: muro.a }, { referenciaAguasArriba: ref })!;
    expect(d.signo).toBe(-i.signo);
    // El punto de referencia queda aguas arriba en las dos orientaciones.
    expect(d.signo * d.ladoDe(ref.lat, ref.lng)).toBeGreaterThan(0);
    expect(i.signo * i.ladoDe(ref.lat, ref.lng)).toBeGreaterThan(0);
  });

  it('el eje y su cota mínima salen del relieve, no del dibujo', () => {
    const g = valleAsimetrico(1.5e-4, 4e-4);
    const { muro, ref } = muroEnX(g);
    const d = ladoAguasArribaDeMuro(g, muro, { referenciaAguasArriba: ref })!;
    expect(d.ejeConDato.length).toBeGreaterThan(10);
    expect(d.largoEje_m).toBeCloseTo(400, 0);
    // El fondo del cuello: el eje del valle a x = 400.
    expect(d.cotaEjeMin_m).toBeCloseTo(100 - 0.003 * 400, 1);
  });

  it('sin referencia deduce el lado por la elevación', () => {
    const g = valleAsimetrico(1.5e-4, 4e-4);
    const { muro } = muroEnX(g);
    const d = ladoAguasArribaDeMuro(g, muro)!;
    expect(d.modo).toBe('elevacion');
    // Aguas arriba es el oeste: ahí el fondo del valle está más alto.
    const oeste = puntoMetrico(g, 200, YC);
    expect(d.signo * d.ladoDe(oeste.lat, oeste.lng)).toBeGreaterThan(0);
  });
});

// ─── 5 · El lado del muro, por la relación de almacenamiento ─────────────────

/**
 * Hoya cerrada con una única salida angosta al este: el caso del manual, donde
 * cerrar por el lugar correcto embalsa todo y cerrar por cualquier otro lado no
 * embalsa nada.
 */
function hoyaConSalidaAlEste() {
  return grillaMetrica(N, N, PASO, (x, y) => {
    const hoya = 100 + 1e-4 * ((x - 400) ** 2 + (y - 400) ** 2);
    if (x <= 400) return hoya;
    const canal = 100 - 0.01 * (x - 400) + 0.002 * (y - 400) ** 2;
    return Math.min(hoya, canal);
  });
}

const CUADRADO = [[250, 250], [550, 250], [550, 550], [250, 550]] as const;

describe('compararLadosDelMuro', () => {
  const g = hoyaConSalidaAlEste();
  const poligono = CUADRADO.map(([x, y]) => puntoMetrico(g, x, y));
  const r = compararLadosDelMuro(g, poligono)!;

  it('evalúa los cuatro lados del polígono', () => {
    expect(r.candidatos).toHaveLength(4);
    expect(r.candidatos.map(c => c.i)).toEqual([0, 1, 2, 3]);
  });

  it('recomienda el único lado que cierra la salida', () => {
    // El lado 1 es el del este (x = 550), el que cruza el canal de desagüe.
    expect(r.recomendado).toBe(1);
    expect(r.lectura).toContain('lado 2');
  });

  it('los otros tres no cierran nada y quedan afuera del ranking, con motivo', () => {
    // Los tres están sobre el flanco de la hoya, y por ahí el muro no embalsa:
    // el terreno derrama por el canal del este, a una cota que no llega al
    // punto más bajo de esos ejes. El agua que hay la sostiene la hoya.
    for (const i of [0, 2, 3]) {
      const c = r.candidatos.find(x => x.i === i)!;
      expect(c.descartado).toBe(true);
      expect(c.profEnMuro_m).toBe(0);
      expect(c.cotaDerrame_m!).toBeLessThanOrEqual(c.cotaMin_m!);
      expect(c.motivo).toContain('El muro sobra');
      // Y lo que importa: NO se les calcula relación.
      expect(c.relacion).toBeNull();
    }
  });

  it('ese lado tiene agua embalsada y aun así no se lo premia', () => {
    // Es el número plausible y equivocado que el descarte evita: 145.000 m³ de
    // agua sobre un muro de altura cero daría la mejor relación de las cuatro.
    const c = r.candidatos.find(x => x.i === 0)!;
    expect(c.volumenAgua_m3!).toBeGreaterThan(100_000);
    expect(c.relacion).toBeNull();
    expect(r.recomendado).not.toBe(0);
  });

  it('la relación de almacenamiento es agua sobre tierra, con los dos números', () => {
    const c = r.candidatos.find(x => x.i === 1)!;
    expect(c.volumenAgua_m3).toBeGreaterThan(0);
    expect(c.tierra_m3).toBeGreaterThan(0);
    expect(c.relacion).toBeCloseTo(c.volumenAgua_m3! / c.tierra_m3!, 1);
    expect(r.lectura).toContain('m³ de agua por cada m³ de tierra');
  });

  it('el recomendado es el de mayor relación, y la cota más baja se informa aparte', () => {
    const vivos = r.candidatos.filter(c => !c.descartado);
    expect(vivos.length).toBeGreaterThan(0);
    const mejor = vivos.reduce((p, q) => (q.relacion! > p.relacion! ? q : p));
    expect(r.recomendado).toBe(mejor.i);
    // La cota más baja se sigue informando, pero como dato y no como criterio.
    expect(r.masBajo).not.toBeNull();
  });

  it('nombra la profundidad natural fuera de la ventana publicada', () => {
    const c = r.candidatos.find(x => x.i === 1)!;
    expect(c.profNatural_m!).toBeGreaterThan(PROF_NATURAL_MAX_M);
    expect(c.profundidadEnVentana).toBe(false);
    expect(r.lectura).toContain('profundidad natural');
  });

  it('mide el espejo y la profundidad contra el muro del vaso real', () => {
    const c = r.candidatos.find(x => x.i === 1)!;
    expect(c.areaEspejo_m2).toBeGreaterThan(0);
    expect(c.profEnMuro_m).toBeGreaterThan(0);
    expect(c.profNatural_m).toBeGreaterThanOrEqual(c.profEnMuro_m!);
    expect(c.razonMuroEspejo).toBeGreaterThan(0);
    expect(typeof c.profundidadEnVentana).toBe('boolean');
  });

  it('avisa que la tierra está subestimada por falta de carga del vertedero', () => {
    expect(r.advertencias.join(' ')).toContain('carga sobre el vertedero');
  });

  it('cita la planilla del curso y el manual', () => {
    expect(r.fuentes.join(' ')).toContain('Nelson');
    expect(r.fuentes.join(' ')).toContain('Agriculture Handbook 590');
  });

  it('con una grilla demasiado grande no compara: avisa y devuelve vacío', () => {
    const lado = Math.ceil(Math.sqrt(CELDAS_MAX_COMPARACION)) + 10;
    const grande = grillaMetrica(lado, lado, 10, (x, y) => 100 + 1e-4 * (x + y));
    const poly = CUADRADO.map(([x, y]) => puntoMetrico(grande, x, y));
    const rr = compararLadosDelMuro(grande, poly)!;
    expect(rr.candidatos).toHaveLength(0);
    expect(rr.recomendado).toBeNull();
    expect(rr.advertencias.join(' ')).toContain('Se omite');
  });

  it('un polígono de menos de tres vértices no tiene lados que comparar', () => {
    const poly = CUADRADO.slice(0, 2).map(([x, y]) => puntoMetrico(g, x, y));
    expect(compararLadosDelMuro(g, poly)).toBeNull();
  });
});

// ─── 6 · Geometría de apoyo ──────────────────────────────────────────────────

describe('largoSegmento_m', () => {
  it('mide en metros sobre la grilla métrica', () => {
    const g = hoyaConSalidaAlEste();
    const a = puntoMetrico(g, 100, 100), b = puntoMetrico(g, 400, 100);
    expect(largoSegmento_m(g, a, b)).toBeCloseTo(300, 0);
    const c = puntoMetrico(g, 100, 500);
    expect(largoSegmento_m(g, a, c)).toBeCloseTo(400, 0);
  });
});

describe('el empate', () => {
  it('la franja de empate es la de la grilla, no un criterio publicado', () => {
    expect(EMPATE_FRAC).toBeGreaterThan(0);
    expect(EMPATE_FRAC).toBeLessThan(0.5);
  });
});

// ─── 7 · El caso resuelto de la fuente ───────────────────────────────────────

describe('relacionAlmacenamiento contra el ejemplo resuelto de la clase 9', () => {
  // «Subir la cota de 92,7 a 93,7 pasa de 10,3 a 23,9 ML con 1.990 → 3.700 m³
  //  de tierra: el $/m³ de agua baja de 1,51 a 1,21 US$.»
  const AGUA_1 = 10_300, TIERRA_1 = 1_990;   // ML → m³ (1 ML = 1.000 m³)
  const AGUA_2 = 23_900, TIERRA_2 = 3_700;
  const COSTO_1 = 1.51, COSTO_2 = 1.21;      // US$ por m³ de agua

  it('devuelve agua sobre tierra, no al revés', () => {
    expect(relacionAlmacenamiento(AGUA_1, TIERRA_1)).toBeCloseTo(5.18, 2);
    expect(relacionAlmacenamiento(AGUA_2, TIERRA_2)).toBeCloseTo(6.46, 2);
  });

  it('subir la cota mejora la relación, y la fuente dice que abarata el agua', () => {
    const r1 = relacionAlmacenamiento(AGUA_1, TIERRA_1)!;
    const r2 = relacionAlmacenamiento(AGUA_2, TIERRA_2)!;
    expect(r2).toBeGreaterThan(r1);
    expect(COSTO_2).toBeLessThan(COSTO_1);
  });

  it('EL ORDEN DEL COCIENTE: los dos costos publicados lo deciden', () => {
    // El costo por m³ de agua es tierra/agua por el precio del m³ de tierra, o
    // sea el recíproco de esta relación por una constante. Entonces el cociente
    // de los dos costos publicados tiene que ser el de las dos relaciones
    // invertidas. Si el cociente estuviera al revés, no cerraría.
    const porCostos = COSTO_1 / COSTO_2;
    const porRelaciones = relacionAlmacenamiento(AGUA_2, TIERRA_2)! / relacionAlmacenamiento(AGUA_1, TIERRA_1)!;
    expect(porRelaciones).toBeCloseTo(porCostos, 2);
    expect(porCostos).toBeCloseTo(1.248, 3);

    // Y el precio del m³ de tierra implícito en el ejemplo es el mismo en los
    // dos candidatos, que es la prueba de que la definición es ésta.
    const precio1 = COSTO_1 / (TIERRA_1 / AGUA_1);
    const precio2 = COSTO_2 / (TIERRA_2 / AGUA_2);
    expect(precio1).toBeCloseTo(precio2, 1);
    expect(precio1).toBeCloseTo(7.82, 1);
  });

  it('una presa de ladera queda en 1 o menos, que es la referencia de la fuente', () => {
    expect(relacionAlmacenamiento(1_000, 1_000)).toBe(RELACION_LADERA);
    expect(relacionAlmacenamiento(AGUA_1, TIERRA_1)!).toBeGreaterThan(RELACION_LADERA);
  });

  it('sin tierra movida no hay relación que devolver', () => {
    expect(relacionAlmacenamiento(1_000, 0)).toBeNull();
    expect(relacionAlmacenamiento(1_000, NaN)).toBeNull();
    expect(relacionAlmacenamiento(NaN, 100)).toBeNull();
  });
});
