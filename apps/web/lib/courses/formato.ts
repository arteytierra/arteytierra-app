/**
 * Cómo se escriben las fechas, el horario y los precios de un curso, en cada idioma.
 *
 * Existe porque la misma fecha estaba tipeada a mano en cinco archivos y se
 * desfasó: la ficha en castellano anunciaba cuatro días del 5 al 8 de diciembre
 * mientras las versiones en inglés y francés seguían vendiendo dos días, el 5 y
 * el 6, con el día de la semana escrito a mano. Acá el dato vive una sola vez en
 * `data.ts` —`fechas`, `teoriaPractica`, `opciones[].precio`— y cada idioma lo
 * formatea. El día de la semana se calcula de la fecha: no se puede escribir mal.
 *
 * Las fechas se formatean **en UTC a propósito**: `'2026-12-05'` se parsea como
 * medianoche UTC, así que formatearla en la zona horaria de Argentina la
 * correría al 4 de diciembre.
 */

import type { Locale } from '@/lib/i18n/config';
import type { CourseFechas, CourseOption } from './data';

const TAGS: Record<Locale, string> = {
  es: 'es-AR',
  en: 'en-US',
  fr: 'fr-FR',
  pt: 'pt-BR',
};

function fecha(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

function parte(iso: string, locale: Locale, opts: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(TAGS[locale], { ...opts, timeZone: 'UTC' }).format(fecha(iso));
}

/** Día de la semana en el idioma pedido, derivado de la fecha. */
export function diaDeLaSemana(iso: string, locale: Locale): string {
  return parte(iso, locale, { weekday: 'long' });
}

/**
 * El rango de fechas en una línea: "5 al 8 de diciembre 2026", "December 5–8,
 * 2026", "5 au 8 décembre 2026". Si empieza y termina el mismo día, va una sola.
 */
export function rangoFechas(f: CourseFechas, locale: Locale): string {
  const mes = parte(f.desde, locale, { month: 'long' });
  const anio = parte(f.desde, locale, { year: 'numeric' });
  const d1 = parte(f.desde, locale, { day: 'numeric' });
  const d2 = parte(f.hasta, locale, { day: 'numeric' });
  const mesHasta = parte(f.hasta, locale, { month: 'long' });

  const unSoloDia = f.desde === f.hasta;
  const cambiaDeMes = mes !== mesHasta;

  if (locale === 'en') {
    if (unSoloDia) return `${mes} ${d1}, ${anio}`;
    if (cambiaDeMes) return `${mes} ${d1} – ${mesHasta} ${d2}, ${anio}`;
    return `${mes} ${d1}–${d2}, ${anio}`;
  }
  if (locale === 'fr') {
    if (unSoloDia) return `${d1} ${mes} ${anio}`;
    if (cambiaDeMes) return `${d1} ${mes} au ${d2} ${mesHasta} ${anio}`;
    return `${d1} au ${d2} ${mes} ${anio}`;
  }
  // es / pt
  if (unSoloDia) return `${d1} de ${mes} ${anio}`;
  if (cambiaDeMes) return `${d1} de ${mes} al ${d2} de ${mesHasta} ${anio}`;
  return `${d1} al ${d2} de ${mes} ${anio}`;
}

/** Cantidad de días que dura el encuentro, contando el primero y el último. */
export function cantidadDeDias(f: CourseFechas): number {
  const ms = fecha(f.hasta).getTime() - fecha(f.desde).getTime();
  return Math.round(ms / 86_400_000) + 1;
}

/** "10:00" → "10 hs" en castellano, "10 am" en inglés, "10 h" en francés. */
function hora(hhmm: string, locale: Locale): string {
  const [h = '0', m = '00'] = hhmm.split(':');
  const n = Number(h);
  if (locale === 'en') {
    const sufijo = n < 12 ? 'am' : 'pm';
    const doce = n % 12 === 0 ? 12 : n % 12;
    return m === '00' ? `${doce} ${sufijo}` : `${doce}:${m} ${sufijo}`;
  }
  const unidad = locale === 'fr' ? 'h' : 'hs';
  return m === '00' ? `${n} ${unidad}` : `${n}:${m} ${unidad}`;
}

/**
 * El horario de apertura y cierre, con el día de la semana sacado de la fecha:
 * "arranca sábado 10 hs, cierra martes 15 hs".
 * Devuelve `null` si el curso no tiene horario cargado.
 */
export function horarioApertura(f: CourseFechas, locale: Locale): string | null {
  if (!f.horaInicio || !f.horaFin) return null;
  const d1 = diaDeLaSemana(f.desde, locale);
  const d2 = diaDeLaSemana(f.hasta, locale);
  const h1 = hora(f.horaInicio, locale);
  const h2 = hora(f.horaFin, locale);
  if (locale === 'en') return `${d1} ${h1} to ${d2} ${h2}`;
  if (locale === 'fr') return `du ${d1} ${h1} au ${d2} ${h2}`;
  return `arranca ${d1} ${h1}, cierra ${d2} ${h2}`;
}

/** El número suelto de un precio: "$130.000 ARS" → 130000. `null` si no hay número. */
export function montoDePrecio(precio: string): number | null {
  const soloDigitos = precio.replace(/[^\d]/g, '');
  return soloDigitos ? Number(soloDigitos) : null;
}

/**
 * El rango de precios de un curso, para el listado: "$110.000 – $150.000".
 * Sale de `opciones`, así que no puede contradecir a la ficha.
 */
export function rangoPrecios(opciones: CourseOption[]): string | null {
  const montos = opciones
    .map(o => montoDePrecio(o.precio))
    .filter((n): n is number => n !== null);
  if (montos.length === 0) return null;
  const min = Math.min(...montos);
  const max = Math.max(...montos);
  const fmt = (n: number) => `$${n.toLocaleString('es-AR')}`;
  return min === max ? fmt(min) : `${fmt(min)} – ${fmt(max)}`;
}

/**
 * El mismo precio con los separadores de miles del idioma: el catálogo lo
 * guarda como «$110.000 ARS» y en inglés eso se lee «$110,000 ARS». Cambia la
 * forma, nunca el número.
 */
export function precioLocalizado(precio: string, locale: Locale): string {
  const monto = montoDePrecio(precio);
  if (monto === null) return precio;
  return precio.replace(/[\d.,]*\d/, monto.toLocaleString(TAGS[locale]));
}

const POR_SEMANA: Record<Locale, string> = {
  es: '/ semana',
  en: '/ week',
  fr: '/ semaine',
  pt: '/ semana',
};

/**
 * El precio listo para mostrar: el importe con los separadores del idioma y,
 * si corresponde, la unidad de tiempo traducida. Es la única forma en que un
 * precio debería llegar a pantalla.
 */
export function precioParaMostrar(op: CourseOption, locale: Locale): string {
  const importe = precioLocalizado(op.precio, locale);
  return op.precioPor === 'semana' ? `${importe} ${POR_SEMANA[locale]}` : importe;
}

/** "30% teoría · 70% práctica", en el idioma pedido. */
export function modalidadTeoriaPractica(
  tp: { teoria: number; practica: number },
  locale: Locale,
): string {
  if (locale === 'en') return `${tp.teoria}% theory · ${tp.practica}% hands-on building`;
  if (locale === 'fr') return `${tp.teoria} % théorie · ${tp.practica} % pratique sur chantier`;
  return `${tp.teoria}% teoría · ${tp.practica}% práctica en obra`;
}
