/**
 * Pastoreo rotativo: el balance de un manejo y lo que cuesta armarlo.
 *
 * Lo que fija este archivo son las **cuatro correcciones** de la etapa C, porque
 * los cuatro números que se fueron eran plausibles y por eso habían durado:
 * el descanso estacional cableado, el «+ 1» de los grupos, la carga instantánea
 * calculada con el peso del animal en vez de con la energía del forraje, y los
 * postes y el agua inventados.
 *
 * El test que más vale es el de la carga: cruza `pastoreo.ts` con
 * `produccion.ts`, que no se conocen, y muestra que la fórmula vieja **no podía
 * ver el forraje** —el mismo rodeo daba la misma carga comiendo paja o alfalfa—.
 */
import { describe, it, expect } from 'vitest';
import { calcularPastoreo, forrajePorLluvia } from '@/lib/pastoreo';
import { consumoEV_kgMS_dia, EM_FORRAJE } from '@/lib/produccion';
import { parcelasNecesarias, descansoLogrado, TOPE_CONDUCTA_D, topeRebrote } from '@/lib/manejos';

const BASE = {
  area_ha: 120,
  n_animales: 60,
  peso_prom_kg: 400,
  consumo_pct_peso: 2.8,
  prod_forraje_kg_ha: 3000,
  eficiencia: 0.4,
  dias_ocupacion: 2,
  descanso_objetivo_d: 30,
};

describe('las parcelas salen de la fórmula publicada, no de una estacional cableada', () => {
  it('coincide con parcelasNecesarias', () => {
    const r = calcularPastoreo(BASE)!;
    expect(r.n_potreros).toBe(parcelasNecesarias(BASE.descanso_objetivo_d, BASE.dias_ocupacion, 1));
    expect(r.n_potreros).toBe(16);
  });

  it('dos rodeos en la misma secuencia piden dos parcelas más, no una', () => {
    const uno = calcularPastoreo(BASE)!;
    const dos = calcularPastoreo({ ...BASE, grupos: 2 })!;
    expect(dos.n_potreros).toBe(uno.n_potreros + 1);
    // Y las dos configuraciones consiguen el mismo descanso, que es el punto:
    // las parcelas de más están ocupadas, no descansando.
    expect(dos.descanso_logrado_d).toBe(uno.descanso_logrado_d);
  });

  it('el descanso que se logra nunca es menor que el pedido', () => {
    for (const ocup of [1, 2, 3, 4]) {
      const r = calcularPastoreo({ ...BASE, dias_ocupacion: ocup })!;
      expect(r.descanso_logrado_d).toBeGreaterThanOrEqual(BASE.descanso_objetivo_d);
      expect(r.descanso_logrado_d).toBe(descansoLogrado(r.n_potreros, ocup, 1));
    }
  });

  it('el área por parcela es la superficie dividida por las parcelas', () => {
    const r = calcularPastoreo(BASE)!;
    expect(r.area_potrero_ha).toBeCloseTo(BASE.area_ha / r.n_potreros, 2);
  });
});

describe('la carga instantánea, ahora en energía y no en kilos de animal', () => {
  it('es la demanda del rodeo dividida por lo que come 1 EV, sobre la parcela', () => {
    const r = calcularPastoreo(BASE)!;
    const demanda = BASE.n_animales * BASE.peso_prom_kg * (BASE.consumo_pct_peso / 100);
    const ev = demanda / consumoEV_kgMS_dia(EM_FORRAJE.natural);
    expect(r.carga_ins_ev_ha).toBeCloseTo(ev / (BASE.area_ha / r.n_potreros), 1);
  });

  it('los mismos kilos de un forraje mejor son MÁS EV, porque el EV es energía', () => {
    // El EV está definido en Mcal de energía metabolizable, no en kilos: un
    // animal que come 11,2 kg de pastura vegetativa se lleva del potrero mucha
    // más energía que uno que come 11,2 kg de forraje diferido, y eso es lo que
    // la carga tiene que reflejar. La fórmula vieja —`peso / 400`— daba el mismo
    // número en los tres casos: **no podía ver el forraje.**
    const grosero = calcularPastoreo({ ...BASE, em_mcal_kg: EM_FORRAJE.grosero })!;
    const natural = calcularPastoreo({ ...BASE, em_mcal_kg: EM_FORRAJE.natural })!;
    const calidad = calcularPastoreo({ ...BASE, em_mcal_kg: EM_FORRAJE.calidad })!;
    expect(calidad.carga_ins_ev_ha).toBeGreaterThan(natural.carga_ins_ev_ha);
    expect(natural.carga_ins_ev_ha).toBeGreaterThan(grosero.carga_ins_ev_ha);
  });

  it('cuánto se equivocaba la fórmula vieja depende del forraje, que es el problema', () => {
    // Vieja: 400 / 400 = 1 EV por cabeza, siempre. Nueva, para 11,2 kg MS/día:
    // 0,94 EV sobre forraje grosero, 1,13 sobre pastizal natural y 1,45 sobre
    // pastura de calidad. No es que estuviera alta o baja: no tenía con qué
    // saberlo.
    const evViejo = BASE.n_animales * (BASE.peso_prom_kg / 400);
    const ev = (em: number) => {
      const r = calcularPastoreo({ ...BASE, em_mcal_kg: em })!;
      return r.carga_ins_ev_ha * (BASE.area_ha / r.n_potreros);
    };
    expect(ev(EM_FORRAJE.grosero) / evViejo).toBeCloseTo(0.94, 1);
    expect(ev(EM_FORRAJE.natural) / evViejo).toBeCloseTo(1.13, 1);
    expect(ev(EM_FORRAJE.calidad) / evViejo).toBeCloseTo(1.45, 1);
  });
});

describe('las advertencias', () => {
  it('avisa cuando la ocupación pasa el tope de rebrote de la temporada', () => {
    // Con 14 días de descanso —crecimiento rápido— el tope es 4 días.
    const r = calcularPastoreo({ ...BASE, descanso_objetivo_d: 14, dias_ocupacion: 6 })!;
    expect(topeRebrote(14)).toBe(4);
    expect(r.advertencias.some(a => a.includes('rebrote'))).toBe(true);
  });

  it('avisa por querencia cuando pasa los 3 días pero la planta todavía aguanta', () => {
    const r = calcularPastoreo({ ...BASE, descanso_objetivo_d: 42, dias_ocupacion: 5 })!;
    expect(5).toBeGreaterThan(TOPE_CONDUCTA_D);
    expect(5).toBeLessThanOrEqual(topeRebrote(42));
    expect(r.advertencias.some(a => a.includes('querencia'))).toBe(true);
    expect(r.advertencias.some(a => a.includes('rebrote vuelve'))).toBe(false);
  });

  it('en sobrepastoreo dice que ajustar la carga rinde más que rotar', () => {
    const r = calcularPastoreo({ ...BASE, n_animales: 600 })!;
    expect(r.balance_pct).toBeLessThan(100);
    expect(r.advertencias.some(a => a.includes('rinde más que rotar'))).toBe(true);
  });

  it('con carga ajustada trae la asimetría del uso conservador', () => {
    const r = calcularPastoreo({ ...BASE, n_animales: 30 })!;
    expect(r.balance_pct).toBeGreaterThanOrEqual(100);
    expect(r.balance_pct).toBeLessThan(130);
    expect(r.advertencias.some(a => a.includes('sequía severa'))).toBe(true);
  });

  it('cuando todo cierra, recuerda que se mueve por la altura y no por el calendario', () => {
    const r = calcularPastoreo({ ...BASE, n_animales: 25, dias_ocupacion: 2 })!;
    expect(r.advertencias.some(a => a.includes('altura es una medición'))).toBe(true);
  });

  it('avisa cuando el descanso cae fuera de la banda de reposición de reservas', () => {
    const r = calcularPastoreo({ ...BASE, descanso_objetivo_d: 60, dias_ocupacion: 6 })!;
    expect(r.advertencias.some(a => a.includes('reposición de reservas'))).toBe(true);
  });
});

describe('la infraestructura', () => {
  it('el alambrado es el de la grilla elegida y no una fórmula aparte', () => {
    const r = calcularPastoreo(BASE)!;
    expect(r.alambrado_m).toBe(r.grilla.alambre_m);
    expect(r.grilla.filas * r.grilla.columnas).toBeGreaterThanOrEqual(r.n_potreros);
  });

  it('los bebederos se comparten entre parcelas cuando cada una entra en el radio', () => {
    // 16 parcelas de 7,5 ha: cada una entra en el radio de 244 m, así que un
    // punto en cada cruce de alambres sirve a cuatro.
    const r = calcularPastoreo(BASE)!;
    expect(r.bebederos).toBe(4);
  });

  it('un campo grande con pocas parcelas necesita más de un punto por parcela', () => {
    const r = calcularPastoreo({ ...BASE, area_ha: 4000, descanso_objetivo_d: 30, dias_ocupacion: 6 })!;
    expect(r.bebederos).toBeGreaterThan(r.n_potreros);
  });
});

describe('bordes', () => {
  it('sin superficie o sin animales no devuelve un balance inventado', () => {
    expect(calcularPastoreo({ ...BASE, area_ha: 0 })).toBeNull();
    expect(calcularPastoreo({ ...BASE, n_animales: 0 })).toBeNull();
  });

  it('ningún resultado es NaN con parámetros al límite', () => {
    const r = calcularPastoreo({ ...BASE, dias_ocupacion: 0, descanso_objetivo_d: 0 })!;
    for (const v of [r.balance_pct, r.carga_ins_ev_ha, r.n_potreros, r.area_potrero_ha, r.alambrado_m]) {
      expect(Number.isFinite(v)).toBe(true);
    }
  });

  it('la escalera de forraje por lluvia sigue siendo la que está sin fuente', () => {
    // Está acá para que si alguien la cambia se vea en el diff: es la deuda
    // número uno del plan y multiplica todo lo que viene después.
    expect(forrajePorLluvia(250)).toBe(700);
    expect(forrajePorLluvia(400)).toBe(1500);
    expect(forrajePorLluvia(600)).toBe(3000);
    expect(forrajePorLluvia(800)).toBe(5000);
    expect(forrajePorLluvia(1200)).toBe(7000);
  });
});
