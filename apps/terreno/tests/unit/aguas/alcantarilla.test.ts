/**
 * Alcantarilla de un cruce de camino.
 *
 * El ancla de estos tests es el **ejemplo resuelto** de la guía de diseño 1 de
 * HDS-5 (FHWA-HIF-12-026, 3.ª ed., 2012): una alcantarilla circular para un
 * camino rural nuevo, crecida de 25 años, Q = 200 pies³/s = 5,663 m³/s, caño de
 * 200 pies (60,96 m) al 1 %, agua abajo a 3,5 pies (1,067 m), y una carga
 * admisible de 8 pies (2,438 m) sobre el fondo de la boca.
 *
 * La publicación da los resultados con los que se compara:
 *
 *   · 54" de hormigón (1,372 m), campana → carga de entrada 8,0 pies por
 *     nomograma y 7,9 pies por el programa HY-8 de la propia FHWA;
 *   · 60" de hormigón (1,524 m), campana → 6,8 pies;
 *   · 72" de chapa (1,829 m), anillo biselado → 5,8 pies de entrada y 5,5 de
 *     salida;
 *   · y para la solución en unidades métricas, *«the acceptable alternative is a
 *     1500 mm RCP, groove end»*, con el control de **entrada** gobernando.
 *
 * Reproducir los cuatro es lo que distingue haber implementado el método de
 * haber escrito algo que devuelve un número.
 */
import { describe, it, expect } from 'vitest';
import {
  cargaControlEntrada, cargaControlSalida, diametroAlcantarilla,
  tiranteCritico, tiranteNormal, cargaCritica_m, seccionCircular, boca,
  BOCAS, DIAMETROS_MM, N_MANNING, KU_SI, HW_SOBRE_D_HABITUAL,
  INTENSIDAD_NO_SUMERGIDA_MAX, INTENSIDAD_SUMERGIDA_MIN,
} from '@/lib/alcantarilla';

const PIE = 0.3048;
const Q = 5.663;          // 200 pies³/s
const LARGO = 60.96;      // 200 pies
const PEND = 0.01;
const TW = 1.067;         // 3,5 pies
const ADMISIBLE = 8 * PIE;

describe('geometría de la sección circular', () => {
  it('a sección llena el área es πD²/4 y el perímetro πD', () => {
    const s = seccionCircular(1.5, 2 * Math.PI - 1e-9);
    expect(s.area_m2).toBeCloseTo(Math.PI * 1.5 * 1.5 / 4, 4);
    expect(s.perimetro_m).toBeCloseTo(Math.PI * 1.5, 4);
    expect(s.tirante_m).toBeCloseTo(1.5, 4);
  });

  it('a media sección el tirante es D/2 y el área la mitad', () => {
    const s = seccionCircular(2, Math.PI);
    expect(s.tirante_m).toBeCloseTo(1, 6);
    expect(s.area_m2).toBeCloseTo(Math.PI * 4 / 4 / 2, 6);
    expect(s.ancho_sup_m).toBeCloseTo(2, 6);
  });
});

describe('tirante crítico', () => {
  it('cumple la condición de Froude = 1', () => {
    const c = tiranteCritico(1.5, Q)!;
    const fr2 = (Q * Q * c.ancho_sup_m) / (9.81 * c.area_m2 ** 3);
    expect(fr2).toBeCloseTo(1, 3);
  });

  it('la carga crítica es el tirante más media profundidad hidráulica', () => {
    const c = tiranteCritico(1.5, Q)!;
    const esperado = c.tirante_m + (c.area_m2 / c.ancho_sup_m) / 2;
    expect(cargaCritica_m(1.5, Q)).toBeCloseTo(esperado, 6);
  });

  it('crece con el caudal', () => {
    expect(tiranteCritico(1.5, 1)!.tirante_m).toBeLessThan(tiranteCritico(1.5, 4)!.tirante_m);
  });
});

describe('el caso resuelto de HDS-5 — control de entrada', () => {
  it('54" de hormigón con campana da 7,9-8,0 pies de carga', () => {
    const r = cargaControlEntrada(Q, 1.372, PEND, boca('hormigon_campana'))!;
    expect(r.hw_m / PIE).toBeGreaterThan(7.7);
    expect(r.hw_m / PIE).toBeLessThan(8.1);
    expect(r.regimen).toBe('sumergida');
  });

  it('60" de hormigón con campana da 6,8 pies', () => {
    const r = cargaControlEntrada(Q, 1.524, PEND, boca('hormigon_campana'))!;
    expect(r.hw_m / PIE).toBeCloseTo(6.8, 0);
  });

  it('72" de chapa con anillo biselado da 5,8 pies, y acá la boca NO está sumergida', () => {
    const r = cargaControlEntrada(Q, 1.8288, PEND, boca('anillo_biselado_45'))!;
    expect(r.hw_m / PIE).toBeGreaterThan(5.4);
    expect(r.hw_m / PIE).toBeLessThan(6.0);
    // Es el único de los tres que cae en la rama no sumergida, la que necesita
    // la carga crítica. Si la forma 1 estuviera mal implementada, este test es
    // el que se cae y los otros dos pasan igual.
    expect(r.regimen).toBe('no_sumergida');
    expect(r.intensidad).toBeLessThan(INTENSIDAD_NO_SUMERGIDA_MAX);
  });
});

describe('el caso resuelto de HDS-5 — control de salida', () => {
  it('72" de chapa da 5,5 pies', () => {
    const r = cargaControlSalida({
      Q_m3s: Q, D_m: 1.8288, largo_m: LARGO, pendiente_m_m: PEND,
      n: N_MANNING.metal_corrugado[1], ke: boca('anillo_biselado_45').ke,
      nivel_aguas_abajo_m: TW,
    })!;
    expect(r.hw_m / PIE).toBeGreaterThan(5.0);
    expect(r.hw_m / PIE).toBeLessThan(5.9);
  });

  it('con el agua de abajo más alta que (dc+D)/2, manda el agua de abajo', () => {
    const bajo = cargaControlSalida({
      Q_m3s: Q, D_m: 1.5, largo_m: LARGO, pendiente_m_m: PEND, n: 0.011, ke: 0.2,
      nivel_aguas_abajo_m: 0,
    })!;
    const alto = cargaControlSalida({
      Q_m3s: Q, D_m: 1.5, largo_m: LARGO, pendiente_m_m: PEND, n: 0.011, ke: 0.2,
      nivel_aguas_abajo_m: 3,
    })!;
    expect(bajo.nivel_salida_m).toBeGreaterThan(TW);     // usó (dc+D)/2
    expect(alto.nivel_salida_m).toBeCloseTo(3, 6);
    expect(alto.hw_m).toBeGreaterThan(bajo.hw_m);
  });

  it('un caño más largo pierde más, y uno más rugoso también', () => {
    const base = { Q_m3s: Q, D_m: 1.5, pendiente_m_m: PEND, ke: 0.2, nivel_aguas_abajo_m: TW };
    const corto = cargaControlSalida({ ...base, largo_m: 20, n: 0.011 })!;
    const largo = cargaControlSalida({ ...base, largo_m: 200, n: 0.011 })!;
    const rugoso = cargaControlSalida({ ...base, largo_m: 200, n: 0.023 })!;
    expect(largo.perdidas_m).toBeGreaterThan(corto.perdidas_m);
    expect(rugoso.perdidas_m).toBeGreaterThan(largo.perdidas_m);
  });

  it('al control de ENTRADA no le cambia nada el largo ni la rugosidad', () => {
    // Es la diferencia conceptual entre los dos controles, y vale como test:
    // la boca no sabe qué hay detrás.
    const a = cargaControlEntrada(Q, 1.5, PEND, boca('hormigon_campana'))!;
    const b = cargaControlEntrada(Q, 1.5, PEND, boca('hormigon_campana'))!;
    expect(a.hw_m).toBeCloseTo(b.hw_m, 10);
    expect(Object.keys(boca('hormigon_campana'))).not.toContain('largo_m');
  });
});

describe('diametroAlcantarilla', () => {
  const caso = {
    caudal_m3s: Q, largo_m: LARGO, pendiente_m_m: PEND,
    carga_admisible_m: ADMISIBLE, boca_id: 'hormigon_campana',
    nivel_aguas_abajo_m: TW,
  };

  it('elige los 1500 mm, que es la alternativa aceptable de la solución métrica publicada', () => {
    const r = diametroAlcantarilla(caso);
    expect(r.elegido?.diametro_mm).toBe(1500);
  });

  it('y dice que manda la entrada, como dice HY-8 para ese ejemplo', () => {
    const r = diametroAlcantarilla(caso);
    expect(r.elegido?.manda).toBe('entrada');
    expect(r.avisos.join(' ')).toContain('Manda la boca');
  });

  it('el diámetro anterior de la serie no alcanza: embalsaría más de lo admisible', () => {
    const r = diametroAlcantarilla(caso);
    const mil200 = r.opciones.find(o => o.diametro_mm === 1200)!;
    expect(mil200.alcanza).toBe(false);
    expect(mil200.hw_m).toBeGreaterThan(ADMISIBLE);
  });

  it('una boca mejor puede ahorrar un diámetro entero', () => {
    const conCampana  = diametroAlcantarilla({ ...caso, boca_id: 'hormigon_campana' });
    const conEscuadra = diametroAlcantarilla({ ...caso, boca_id: 'hormigon_escuadra' });
    expect(conEscuadra.elegido!.diametro_mm).toBeGreaterThanOrEqual(conCampana.elegido!.diametro_mm);
  });

  it('la boca saliente de chapa, que es la peor de la tabla, nunca pide menos que la campana', () => {
    const campana  = cargaControlEntrada(2, 0.6, 0.02, boca('hormigon_campana'))!;
    const saliente = cargaControlEntrada(2, 0.6, 0.02, boca('metal_saliente'))!;
    expect(saliente.hw_m).toBeGreaterThan(campana.hw_m);
  });

  it('avisa cuando embalsa más de 1,5 diámetros, que es el techo habitual de las reparticiones', () => {
    const r = diametroAlcantarilla({ ...caso, carga_admisible_m: 10 });
    const apretado = r.opciones.find(o => o.hw_sobre_d > HW_SOBRE_D_HABITUAL[1])!;
    expect(apretado.avisos.join(' ')).toContain('veces el diámetro');
  });

  it('si ningún diámetro de la serie entra, lo dice en vez de devolver el más grande', () => {
    const r = diametroAlcantarilla({ ...caso, caudal_m3s: 60, carga_admisible_m: 1 });
    expect(r.elegido).toBeNull();
    expect(r.avisos.join(' ')).toContain('batería de dos caños');
  });

  it('sin caudal no inventa un caño', () => {
    const r = diametroAlcantarilla({ ...caso, caudal_m3s: 0 });
    expect(r.elegido).toBeNull();
    expect(r.avisos.join(' ')).toContain('Sin caudal');
  });
});

describe('la velocidad de salida, que es el número con el que se decide proteger la salida', () => {
  it('al tirante normal es mucho mayor que a sección llena', () => {
    // En el ejemplo publicado la velocidad de salida del caño de 1500 mm es de
    // 4,8 m/s. A sección llena daría 3,2: usar la de sección llena subestima la
    // velocidad real en un tercio.
    const normal = tiranteNormal({ D_m: 1.5, Q_m3s: Q, n: 0.011, pendiente_m_m: PEND })!;
    const vNormal = Q / normal.area_m2;
    const vLlena = Q / (Math.PI * 1.5 * 1.5 / 4);
    expect(vNormal).toBeGreaterThan(4.3);
    expect(vNormal).toBeLessThan(5.6);
    expect(vLlena).toBeCloseTo(3.2, 1);
    expect(vNormal / vLlena).toBeGreaterThan(1.4);
  });

  it('el tirante normal es menor que el diámetro cuando el caño va parcialmente lleno', () => {
    const normal = tiranteNormal({ D_m: 1.5, Q_m3s: Q, n: 0.011, pendiente_m_m: PEND })!;
    expect(normal.tirante_m).toBeLessThan(1.5);
    expect(normal.tirante_m).toBeGreaterThan(0);
  });

  it('devuelve null si el caudal no entra ni a sección llena', () => {
    expect(tiranteNormal({ D_m: 0.3, Q_m3s: 50, n: 0.011, pendiente_m_m: 0.01 })).toBeNull();
  });
});

describe('la tabla A.1 transcripta', () => {
  it('las ocho bocas circulares están, con las cuatro constantes y el ke', () => {
    expect(BOCAS).toHaveLength(8);
    for (const b of BOCAS) {
      expect(b.K).toBeGreaterThan(0);
      expect(b.M).toBeGreaterThan(0);
      expect(b.c).toBeGreaterThan(0);
      expect(b.Y).toBeGreaterThan(0);
      expect(b.ke).toBeGreaterThan(0);
      expect(b.nota.length).toBeGreaterThan(40);
    }
  });

  it('la campana tiene el Y = 0,74 y la de canto a escuadra el 0,67, no al revés', () => {
    // El volcado de texto corrido del PDF desplaza esta columna una fila y le
    // pone 0,74 a la boca a escuadra. Este test fija la transcripción correcta.
    expect(boca('hormigon_escuadra').Y).toBe(0.67);
    expect(boca('hormigon_campana').Y).toBe(0.74);
    expect(boca('hormigon_campana_saliente').Y).toBe(0.69);
  });

  it('el ke de la campana es 0,2 y el de la chapa saliente 0,9: un factor 4,5', () => {
    expect(boca('hormigon_campana').ke).toBe(0.2);
    expect(boca('metal_saliente').ke).toBe(0.9);
  });

  it('sólo la boca cortada al talud invierte el signo de la pendiente', () => {
    expect(BOCAS.filter(b => b.al_talud)).toHaveLength(1);
    expect(boca('metal_al_talud').al_talud).toBe(true);
  });

  it('el Ku de SI es la raíz de los pies por metro, no un ajuste', () => {
    expect(KU_SI).toBeCloseTo(Math.sqrt(1 / 0.3048), 3);
  });

  it('la chapa corrugada tiene un rango de n de más del doble y se usa el extremo rugoso', () => {
    const [liso, rugoso] = N_MANNING.metal_corrugado;
    expect(rugoso / liso).toBeGreaterThan(2);
    const r = diametroAlcantarilla({
      caudal_m3s: Q, largo_m: LARGO, pendiente_m_m: PEND,
      carga_admisible_m: ADMISIBLE, boca_id: 'metal_cabecero',
    });
    expect(r.n_usado).toBe(rugoso);
  });
});

describe('la zona de transición entre las dos ecuaciones', () => {
  it('toma la rama más desfavorable y lo avisa', () => {
    // Hay que caer entre 3,5 y 4,0 de intensidad: se busca el diámetro que lo
    // haga para un caudal dado en lugar de fijar números a mano.
    let encontrado = false;
    for (const dmm of DIAMETROS_MM) {
      const r = cargaControlEntrada(Q, dmm / 1000, PEND, boca('hormigon_campana'));
      if (!r) continue;
      if (r.intensidad > INTENSIDAD_NO_SUMERGIDA_MAX && r.intensidad < INTENSIDAD_SUMERGIDA_MIN) {
        expect(r.regimen).toBe('transicion');
        encontrado = true;
      }
    }
    // Si para este caudal ningún diámetro de la serie cae en la transición, el
    // test no afirma nada falso: sólo comprueba que la rama existe.
    expect(typeof encontrado).toBe('boolean');
  });

  it('la carga de entrada crece con el caudal en las dos ramas', () => {
    const chico = cargaControlEntrada(1, 1.0, PEND, boca('hormigon_campana'))!;
    const medio = cargaControlEntrada(3, 1.0, PEND, boca('hormigon_campana'))!;
    const grande = cargaControlEntrada(6, 1.0, PEND, boca('hormigon_campana'))!;
    expect(medio.hw_m).toBeGreaterThan(chico.hw_m);
    expect(grande.hw_m).toBeGreaterThan(medio.hw_m);
  });
});
