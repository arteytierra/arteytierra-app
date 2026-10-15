/**
 * Las versiones traducidas de un curso tienen que cubrir lo que el catálogo
 * dice que el curso tiene.
 *
 * Esto existe por un caso real: durante un mes las fichas en inglés y francés
 * anunciaron un intensivo de dos días, el 5 y el 6 de diciembre, mientras la
 * castellana ya decía cuatro días del 5 al 8. Nada lo comparaba. Ahora los
 * datos salen del catálogo y lo único escrito por idioma es la prosa — y si
 * falta la prosa de un módulo o de una opción, el módulo o la opción
 * desaparecen en silencio de esa página. Esto lo impide.
 */

import { describe, it, expect } from 'vitest';
import { COURSES } from '@/lib/courses/data';
import { COURSE_TRADUCCIONES } from '@/lib/courses/traducciones';
import {
  cantidadDeDias,
  diaDeLaSemana,
  horarioApertura,
  montoDePrecio,
  rangoFechas,
  rangoPrecios,
} from '@/lib/courses/formato';

describe('traducciones de cursos', () => {
  const pares = Object.entries(COURSE_TRADUCCIONES).flatMap(([slug, porIdioma]) =>
    Object.entries(porIdioma).map(([locale, t]) => ({ slug, locale, t })),
  );

  it('hay al menos un curso traducido', () => {
    expect(pares.length).toBeGreaterThan(0);
  });

  it.each(pares)('$slug · $locale traduce todos los módulos del catálogo', ({ slug, t }) => {
    const course = COURSES[slug];
    expect(course, `el slug "${slug}" no está en el catálogo`).toBeDefined();
    const faltan = course!.modulos.map(m => m.num).filter(num => !t!.modulos[num]);
    expect(faltan, `módulos sin traducir en "${slug}"`).toEqual([]);
  });

  it.each(pares)('$slug · $locale no traduce módulos que ya no existen', ({ slug, t }) => {
    const course = COURSES[slug];
    const existentes = new Set(course!.modulos.map(m => m.num));
    const sobran = Object.keys(t!.modulos).filter(num => !existentes.has(num));
    expect(sobran, `traducciones huérfanas en "${slug}"`).toEqual([]);
  });

  it.each(pares)('$slug · $locale traduce todas las opciones de precio', ({ slug, t }) => {
    const course = COURSES[slug];
    const faltan = course!.opciones.map(o => o.id).filter(id => !t!.opciones[id]);
    expect(faltan, `opciones sin traducir en "${slug}"`).toEqual([]);
  });

  it.each(pares)('$slug · $locale no escribe el precio por su cuenta', ({ t }) => {
    // El precio sale del catálogo; si aparece un número con pinta de precio en
    // la prosa traducida, hay una copia que se va a desfasar.
    const prosa = [t!.subtitle, ...t!.intro, t!.opcionesNota, t!.metaDescription].join(' ');
    expect(prosa).not.toMatch(/\d{2}[.,]\d{3}/);
  });

  it.each(pares)('$slug · $locale no escribe la fecha por su cuenta', ({ t }) => {
    const prosa = [t!.subtitle, ...t!.intro, t!.metaDescription, t!.areasNota].join(' ');
    expect(prosa).not.toMatch(/\b20\d{2}\b/);
  });
});

describe('formato de fechas y precios', () => {
  const bioarq = COURSES['bioarquitectura']!;

  it('el día de la semana se deriva de la fecha, no se escribe', () => {
    // 5 de diciembre de 2026 es sábado y el 8 es martes.
    expect(diaDeLaSemana('2026-12-05', 'es')).toBe('sábado');
    expect(diaDeLaSemana('2026-12-08', 'es')).toBe('martes');
    expect(diaDeLaSemana('2026-12-05', 'en')).toBe('Saturday');
    expect(diaDeLaSemana('2026-12-08', 'fr')).toBe('mardi');
  });

  it('no se corre un día por la zona horaria', () => {
    // `2026-12-05` se parsea como medianoche UTC; formatearla en hora de
    // Argentina sin fijar la zona la devolvía como 4 de diciembre.
    expect(rangoFechas({ desde: '2026-12-05', hasta: '2026-12-05' }, 'es')).toContain('5');
    expect(rangoFechas({ desde: '2026-01-01', hasta: '2026-01-01' }, 'es')).toContain('1');
  });

  it('arma el rango en cada idioma', () => {
    const f = bioarq.fechas!;
    expect(rangoFechas(f, 'es')).toBe('5 al 8 de diciembre 2026');
    expect(rangoFechas(f, 'en')).toBe('December 5–8, 2026');
    expect(rangoFechas(f, 'fr')).toBe('5 au 8 décembre 2026');
  });

  it('cuenta los días contando el primero y el último', () => {
    expect(cantidadDeDias(bioarq.fechas!)).toBe(4);
    expect(cantidadDeDias({ desde: '2026-12-05', hasta: '2026-12-05' })).toBe(1);
  });

  it('el horario nombra el día que corresponde', () => {
    expect(horarioApertura(bioarq.fechas!, 'es')).toBe('arranca sábado 10 hs, cierra martes 15 hs');
    expect(horarioApertura(bioarq.fechas!, 'en')).toBe('Saturday 10 am to Tuesday 3 pm');
  });

  it('sin horario cargado no inventa uno', () => {
    expect(horarioApertura({ desde: '2026-12-05', hasta: '2026-12-08' }, 'es')).toBeNull();
  });

  it('saca el monto del precio escrito', () => {
    expect(montoDePrecio('$110.000 ARS')).toBe(110000);
    expect(montoDePrecio('USD 80')).toBe(80);
    expect(montoDePrecio('Consultanos')).toBeNull();
  });

  it('el rango de precios sale de las opciones', () => {
    expect(rangoPrecios(bioarq.opciones)).toBe('$110.000 – $150.000');
  });
});

describe('catálogo de cursos', () => {
  it('el reparto entre teoría y práctica suma 100', () => {
    for (const [slug, c] of Object.entries(COURSES)) {
      if (!c.teoriaPractica) continue;
      expect(c.teoriaPractica.teoria + c.teoriaPractica.practica, slug).toBe(100);
    }
  });

  it('ningún curso termina antes de empezar', () => {
    for (const [slug, c] of Object.entries(COURSES)) {
      if (!c.fechas) continue;
      expect(c.fechas.hasta >= c.fechas.desde, slug).toBe(true);
    }
  });
});
