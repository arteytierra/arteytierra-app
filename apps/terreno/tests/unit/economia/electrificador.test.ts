/**
 * Electrificador del alambrado.
 *
 * Acá no hay un caso resuelto de la literatura como en la alcantarilla, porque
 * las cuatro fuentes publican reglas y no un ejemplo numérico completo. Lo que
 * sí hay son **dos anclas duras** y conviene saber cuáles son:
 *
 *   1. La frase de control de Kurtz y Frey sobre su propia tabla: *«16-gauge
 *      wire is 2.5 times as resistant to current movement as 12.5-gauge wire»*.
 *      Si la transcripción de ohm/milla estuviera corrida una fila —el error
 *      clásico al leer una tabla de PDF— esa división no daría 2,5. El test la
 *      hace.
 *   2. El ejemplo de Ontario: *«a single strand fence that goes five miles…
 *      requires much less power than a five strand fence going five miles,
 *      because the multi-strand is actually 25 miles of wire»*. Son 25 millas de
 *      alambre y, con carga pesada —1 milla por joule—, 25 joules.
 */
import { describe, it, expect } from 'vitest';
import {
  joulesNecesarios, puestaATierra, diagnosticoConductor, dimensionarElectrificador,
  alambre, voltajePunta, bandaVegetacion,
  ALAMBRES, VOLTAJE_PUNTA, BANDAS_VEGETACION, ALAMBRE_REFERENCIA,
  MILLA_M, VARILLAS_MINIMO, VARILLA_LARGO_M, VARILLA_M_POR_JOULE,
  SALIDA_MIN_BAJO_CARGA_V, SALIDA_MIN_PICO_V, AISLADOR_MIN_V, TIERRA_TOLERANCIA_V,
} from '@/lib/electrificador';

describe('la tabla de resistencias, contra la frase de control de la fuente', () => {
  it('el calibre 16 es 2,4-2,5 veces más resistente que el 12,5, como dice el texto', () => {
    const r = alambre('cal16').ohm_km / alambre('cal12_5').ohm_km;
    expect(r).toBeGreaterThan(2.3);
    expect(r).toBeLessThan(2.6);
  });

  it('la resistencia baja monótonamente al engrosar el alambre', () => {
    const permanentes = ['cal16', 'cal14', 'cal12_5', 'cal10', 'cal8'].map(id => alambre(id).ohm_km);
    for (let i = 1; i < permanentes.length; i++) {
      expect(permanentes[i]!).toBeLessThan(permanentes[i - 1]!);
    }
  });

  it('el polihilo de 6 conductores tiene 172 veces la resistencia del calibre 12,5', () => {
    // Es el hallazgo del módulo: el alambre pesa más que el equipo en una
    // tirada larga, y por eso la fuente dice que no hay que depender del
    // polihilo para tramos largos.
    const r = alambre('poly6').ohm_km / alambre('cal12_5').ohm_km;
    expect(Math.round(r)).toBe(172);
  });

  it('y el de 3 conductores, casi 284 veces', () => {
    const r = alambre('poly3').ohm_km / alambre('cal12_5').ohm_km;
    expect(Math.round(r)).toBe(284);
  });

  it('sólo los tres calibres gruesos están marcados como permanentes', () => {
    expect(ALAMBRES.filter(a => a.permanente).map(a => a.id)).toEqual(['cal8', 'cal10', 'cal12_5']);
    expect(alambre(ALAMBRE_REFERENCIA).permanente).toBe(true);
  });
});

describe('joulesNecesarios: las dos lecturas publicadas', () => {
  it('reproduce el ejemplo de Ontario: 5 millas por 5 hilos con carga pesada son 25 joules', () => {
    const r = joulesNecesarios({ largo_cerco_m: 5 * MILLA_M, hilos: 5, vegetacion: 'pesada' });
    expect(r.cota_alambre_j).toBeCloseTo(25, 3);
    expect(r.manda).toBe('alambre');
    expect(r.recomendado_j).toBeCloseTo(25, 3);
  });

  it('un hilo limpio en una milla: manda la regla de Virginia, un joule por milla de cerco', () => {
    const r = joulesNecesarios({ largo_cerco_m: MILLA_M, hilos: 1, vegetacion: 'limpio' });
    expect(r.cota_cerco_j).toBeCloseTo(1, 4);
    expect(r.cota_alambre_j).toBeCloseTo(1 / 6, 4);
    expect(r.manda).toBe('cerco');
    expect(r.recomendado_j).toBeCloseTo(1, 4);
  });

  it('con el alambre limpio los hilos pesan poco; con pasto encima pesan todo', () => {
    const limpio = joulesNecesarios({ largo_cerco_m: 3000, hilos: 4, vegetacion: 'limpio' });
    const pesada = joulesNecesarios({ largo_cerco_m: 3000, hilos: 4, vegetacion: 'pesada' });
    expect(pesada.recomendado_j).toBeGreaterThan(limpio.recomendado_j * 3);
  });

  it('cuántos hilos hacen falta para que los hilos empiecen a gobernar depende sólo de la vegetación', () => {
    // Sale de cruzar las dos reglas publicadas y es el resultado útil de haberlas
    // puesto juntas: la cota de Ontario supera la de Virginia cuando los hilos
    // pasan las millas por joule de la banda. Con el alambre limpio hacen falta
    // SIETE hilos para que los hilos decidan; con el alambre sucio, dos.
    const umbral = (veg: 'limpio' | 'media' | 'pesada'): number => {
      for (let h = 1; h <= 12; h++) {
        if (joulesNecesarios({ largo_cerco_m: 3000, hilos: h, vegetacion: veg }).manda === 'alambre') return h;
      }
      return 0;
    };
    expect(umbral('limpio')).toBe(7);
    expect(umbral('media')).toBe(4);
    expect(umbral('pesada')).toBe(2);
  });

  it('siempre recomienda la mayor de las dos cotas, nunca la menor', () => {
    for (const hilos of [1, 2, 3, 5]) {
      for (const veg of ['limpio', 'media', 'pesada'] as const) {
        const r = joulesNecesarios({ largo_cerco_m: 2500, hilos, vegetacion: veg });
        expect(r.recomendado_j).toBe(Math.max(r.cota_cerco_j, r.cota_alambre_j));
      }
    }
  });

  it('la banda de vegetación va de 6 millas por joule a 1, y la del medio es el piso del rango publicado', () => {
    expect(bandaVegetacion('limpio').millas_por_joule).toBe(6);
    expect(bandaVegetacion('media').millas_por_joule).toBe(3);
    expect(bandaVegetacion('pesada').millas_por_joule).toBe(1);
    expect(BANDAS_VEGETACION).toHaveLength(3);
    for (const b of BANDAS_VEGETACION) expect(b.textual.length).toBeGreaterThan(10);
  });

  it('sin alambrado no pide equipo', () => {
    const r = joulesNecesarios({ largo_cerco_m: 0, hilos: 2 });
    expect(r.recomendado_j).toBe(0);
  });
});

describe('puestaATierra: la parte que nadie calcula', () => {
  it('el piso son tres varillas de 6 pies, aunque el equipo sea chico', () => {
    const t = puestaATierra(0.5);
    expect(t.varillas).toBe(VARILLAS_MINIMO);
    expect(t.largo_varilla_m).toBeCloseTo(1.829, 3);
    expect(t.manda).toBe('minimo');
    expect(t.metros_varilla).toBeCloseTo(VARILLAS_MINIMO * VARILLA_LARGO_M, 6);
  });

  it('a partir de cierto tamaño manda la regla de 3 pies de varilla por joule', () => {
    const t = puestaATierra(14);
    expect(t.manda).toBe('por_joule');
    expect(t.metros_varilla).toBeCloseTo(14 * VARILLA_M_POR_JOULE, 4);
    expect(t.varillas).toBe(7);
  });

  it('el umbral donde cambia de criterio es el que se espera de los dos números', () => {
    // 3 varillas × 6 pies = 18 pies; a 3 pies por joule eso son 6 joules.
    expect(puestaATierra(5.9).manda).toBe('minimo');
    expect(puestaATierra(6.1).manda).toBe('por_joule');
  });

  it('la varilla por joule es 3 pies, no 3 metros', () => {
    expect(VARILLA_M_POR_JOULE).toBeCloseTo(0.914, 3);
  });

  it('trae el ensayo publicado, que es la única verificación que existe', () => {
    const t = puestaATierra(10);
    expect(t.ensayo).toContain('2.000 V');
    expect(t.ensayo).toContain(String(TIERRA_TOLERANCIA_V));
    expect(TIERRA_TOLERANCIA_V).toBe(300);
  });

  it('avisa de la electrólisis, que es lo que come las conexiones', () => {
    expect(puestaATierra(2).advertencias.join(' ')).toContain('electrólisis');
  });
});

describe('diagnosticoConductor', () => {
  it('los hilos unidos en las puntas trabajan en paralelo: cuatro hilos, un cuarto de resistencia', () => {
    const uno    = diagnosticoConductor({ largo_cerco_m: 2000, hilos: 1, alambre_id: 'cal12_5' });
    const cuatro = diagnosticoConductor({ largo_cerco_m: 2000, hilos: 4, alambre_id: 'cal12_5' });
    expect(cuatro.resistencia_ohm).toBeCloseTo(uno.resistencia_ohm / 4, 6);
  });

  it('si no están unidos, los cuatro hilos no ayudan, y lo dice', () => {
    const sueltos = diagnosticoConductor({ largo_cerco_m: 2000, hilos: 4, alambre_id: 'cal12_5', unidos: false });
    const unidos  = diagnosticoConductor({ largo_cerco_m: 2000, hilos: 4, alambre_id: 'cal12_5', unidos: true });
    expect(sueltos.resistencia_ohm).toBeCloseTo(unidos.resistencia_ohm * 4, 6);
    expect(sueltos.advertencias.join(' ')).toContain('no están unidos');
  });

  it('el alambre total es hilos por recorrido, que es lo que ve la fuga', () => {
    const d = diagnosticoConductor({ largo_cerco_m: 1500, hilos: 3 });
    expect(d.alambre_total_m).toBe(4500);
  });

  it('avisa del polihilo en una tirada larga, con la frase de la fuente', () => {
    const d = diagnosticoConductor({ largo_cerco_m: 4000, hilos: 1, alambre_id: 'poly6' });
    expect(d.advertencias.join(' ')).toContain('tiradas largas');
    expect(d.veces_referencia).toBeGreaterThan(100);
  });

  it('con el calibre recomendado no se queja de nada', () => {
    const d = diagnosticoConductor({ largo_cerco_m: 4000, hilos: 2, alambre_id: 'cal12_5' });
    expect(d.advertencias).toHaveLength(0);
    expect(d.veces_referencia).toBeCloseTo(1, 6);
  });
});

describe('el voltaje que hay que ir a medir', () => {
  it('son los tres de la especificación de obra, en volts y por tipo de animal', () => {
    expect(voltajePunta('vacunos').volts).toBe(1600);
    expect(voltajePunta('ovinos').volts).toBe(2000);
    expect(voltajePunta('equinos').volts).toBe(1200);
    expect(VOLTAJE_PUNTA).toHaveLength(3);
  });

  it('el ovino pide más que el vacuno, que es por la lana', () => {
    expect(voltajePunta('ovinos').volts).toBeGreaterThan(voltajePunta('vacunos').volts);
  });

  it('la salida del equipo bajo carga y el pico son los dos de la norma', () => {
    expect(SALIDA_MIN_BAJO_CARGA_V).toBe(4000);
    expect(SALIDA_MIN_PICO_V).toBe(5000);
    expect(AISLADOR_MIN_V).toBe(10000);
  });

  it('el aislador tiene que aguantar más que el pico del equipo', () => {
    expect(AISLADOR_MIN_V).toBeGreaterThan(SALIDA_MIN_PICO_V);
  });
});

describe('dimensionarElectrificador, los tres criterios juntos', () => {
  const caso = { largo_cerco_m: 6000, hilos: 3, vegetacion: 'media' as const, animal_id: 'vacunos' };

  it('devuelve los tres por separado, porque se arreglan con tres compras distintas', () => {
    const r = dimensionarElectrificador(caso);
    expect(r.joules.recomendado_j).toBeGreaterThan(0);
    expect(r.tierra.varillas).toBeGreaterThanOrEqual(3);
    expect(r.conductor.resistencia_ohm).toBeGreaterThan(0);
  });

  it('la tierra escala con el equipo que salió de los joules', () => {
    const chico  = dimensionarElectrificador({ ...caso, largo_cerco_m: 500 });
    const grande = dimensionarElectrificador({ ...caso, largo_cerco_m: 40000 });
    expect(grande.tierra.metros_varilla).toBeGreaterThan(chico.tierra.metros_varilla);
    expect(grande.tierra.manda).toBe('por_joule');
    expect(chico.tierra.manda).toBe('minimo');
  });

  it('dice explícitamente que los joules se estiman y los volts se miden', () => {
    const r = dimensionarElectrificador(caso);
    expect(r.a_medir).toContain('estimación');
    expect(r.a_medir).toContain('se mide');
    expect(r.a_medir).toContain('1.600');
  });

  it('con muchos hilos y vegetación pesada menciona la maniobra de desconectar los de abajo', () => {
    const r = dimensionarElectrificador({ ...caso, hilos: 4, vegetacion: 'pesada' });
    expect(r.avisos.join(' ')).toContain('desconectan los hilos de abajo');
  });

  it('en un alambrado corto avisa que lo que decide es la tierra y no el equipo', () => {
    const r = dimensionarElectrificador({ ...caso, largo_cerco_m: 800, hilos: 1, vegetacion: 'limpio' });
    expect(r.avisos.join(' ')).toContain('la puesta a tierra');
  });
});
