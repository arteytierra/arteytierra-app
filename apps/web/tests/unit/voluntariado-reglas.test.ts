import { describe, expect, it } from 'vitest';
import { CONVOCATORIA_VOLUNTARIADO as C } from '@/lib/courses/data';
import {
  cubrePeriodoCompleto,
  diasEntre,
  edadAlEmpezar,
  nacimientoMaximo,
  primerProblema,
  recibePostulaciones,
  type DatosPostulacion,
} from '@/lib/voluntariado/reglas';

/**
 * La postulación al voluntariado no falla estrellándose: falla dejando entrar
 * una fecha imposible o rechazando a alguien que sí califica, y de eso nadie se
 * entera hasta que esa persona escribe preguntando por qué.
 *
 * Los dos lugares donde eso pasa son la cuenta de años —que se corre un día si
 * se mezcla hora local con UTC— y los bordes de la ventana.
 */

const BASE: DatosPostulacion = {
  nombre: 'Ana Pérez',
  email: 'ana@ejemplo.com',
  whatsapp: '+54 9 351 000 0000',
  ciudad: 'Córdoba, Argentina',
  fechaNacimiento: '1995-03-10',
  fechaLlegada: C.fechas.desde,
  fechaSalida: C.fechas.hasta,
  motivacion: 'Quiero aprender a construir con tierra y poner el cuerpo en una obra de verdad.',
  equipo: true,
};

describe('edad al empezar la convocatoria', () => {
  it('acepta a quien cumple la edad mínima justo el primer día', () => {
    const justo = nacimientoMaximo();
    expect(edadAlEmpezar(justo)).toBe(C.edadMinima);
    expect(primerProblema({ ...BASE, fechaNacimiento: justo })).toBeNull();
  });

  it('rechaza a quien la cumple un día tarde', () => {
    const tarde = new Date(`${nacimientoMaximo()}T00:00:00Z`);
    tarde.setUTCDate(tarde.getUTCDate() + 1);
    const iso = tarde.toISOString().slice(0, 10);
    expect(edadAlEmpezar(iso)).toBe(C.edadMinima - 1);
    expect(primerProblema({ ...BASE, fechaNacimiento: iso })).toMatch(/mayores de/);
  });

  it('cuenta los años contra el primer día y no contra hoy', () => {
    // Nacida el día después del arranque: todavía no los cumplió al empezar,
    // aunque para cuando termine la convocatoria ya los tenga.
    const d = new Date(`${nacimientoMaximo()}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 1);
    expect(edadAlEmpezar(d.toISOString().slice(0, 10))).toBeLessThan(C.edadMinima);
  });
});

describe('la ventana de la convocatoria', () => {
  it('acepta el período completo', () => {
    expect(primerProblema(BASE)).toBeNull();
    expect(cubrePeriodoCompleto(C.fechas.desde, C.fechas.hasta)).toBe(true);
  });

  it('rechaza una llegada anterior al primer día', () => {
    const antes = new Date(`${C.fechas.desde}T00:00:00Z`);
    antes.setUTCDate(antes.getUTCDate() - 1);
    const problema = primerProblema({ ...BASE, fechaLlegada: antes.toISOString().slice(0, 10) });
    expect(problema).toMatch(/dentro de la convocatoria/);
  });

  it('rechaza una salida posterior al último día', () => {
    const despues = new Date(`${C.fechas.hasta}T00:00:00Z`);
    despues.setUTCDate(despues.getUTCDate() + 1);
    const problema = primerProblema({ ...BASE, fechaSalida: despues.toISOString().slice(0, 10) });
    expect(problema).toMatch(/dentro de la convocatoria/);
  });

  it('acepta el primer y el último día exactos, que son los bordes', () => {
    expect(primerProblema({ ...BASE, fechaLlegada: C.fechas.desde })).toBeNull();
    expect(primerProblema({ ...BASE, fechaSalida: C.fechas.hasta })).toBeNull();
  });
});

describe('estadía mínima', () => {
  it('acepta exactamente el mínimo', () => {
    const salida = new Date(`${C.fechas.desde}T00:00:00Z`);
    salida.setUTCDate(salida.getUTCDate() + C.diasMinimos);
    const iso = salida.toISOString().slice(0, 10);
    expect(diasEntre(C.fechas.desde, iso)).toBe(C.diasMinimos);
    expect(primerProblema({ ...BASE, fechaSalida: iso })).toBeNull();
  });

  it('rechaza un día menos que el mínimo', () => {
    const salida = new Date(`${C.fechas.desde}T00:00:00Z`);
    salida.setUTCDate(salida.getUTCDate() + C.diasMinimos - 1);
    const problema = primerProblema({ ...BASE, fechaSalida: salida.toISOString().slice(0, 10) });
    expect(problema).toMatch(/mínima/);
  });

  it('rechaza una salida anterior a la llegada', () => {
    const problema = primerProblema({ ...BASE, fechaLlegada: C.fechas.hasta, fechaSalida: C.fechas.desde });
    expect(problema).toMatch(/posterior a la llegada/);
  });
});

describe('lo que no se puede omitir', () => {
  it('exige confirmar el equipo de acampe', () => {
    expect(primerProblema({ ...BASE, equipo: false })).toMatch(/carpa, aislante térmico y bolsa de dormir/);
  });

  it('pide una motivación que diga algo', () => {
    expect(primerProblema({ ...BASE, motivacion: 'quiero ir' })).toMatch(/por qué querés venir/);
  });

  it('rechaza un email inválido', () => {
    expect(primerProblema({ ...BASE, email: 'ana-arroba-ejemplo' })).toMatch(/Email/);
  });
});

describe('el tope del calendario coincide con la validación', () => {
  // Si estos dos se separan, el navegador deja elegir una fecha que el servidor
  // después rechaza, y la persona no entiende qué hizo mal.
  it('nacimientoMaximo() es la última fecha que la validación acepta', () => {
    expect(primerProblema({ ...BASE, fechaNacimiento: nacimientoMaximo() })).toBeNull();
  });
});

describe('la puerta y las reglas son dos cosas distintas', () => {
  it('con el cupo cubierto no se reciben postulaciones', () => {
    expect(recibePostulaciones()).toBe(!C.cupoLleno);
  });

  it('las reglas siguen validando igual, con la puerta abierta o cerrada', () => {
    // Esto es lo que el test cuida de verdad. El cupo lleno es una bandera que
    // se baja; si alguna vez se metiera adentro de `primerProblema`, una
    // postulación impecable empezaría a dar «cupo lleno» en vez de `null` y el
    // día que la convocatoria se reabra nadie se acordaría de desarmarlo.
    expect(primerProblema(BASE)).toBeNull();
    expect(primerProblema({ ...BASE, equipo: false })).toMatch(/carpa/);
  });
});
