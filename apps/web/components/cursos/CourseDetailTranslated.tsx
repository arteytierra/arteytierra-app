/**
 * La ficha de un curso en un idioma que no es el castellano.
 *
 * Los datos salen de `lib/courses/data.ts` —los mismos que usa la ficha en
 * castellano— y la prosa de `lib/courses/traducciones.ts`. Antes cada idioma
 * era una página entera escrita a mano con su propia copia de las fechas y los
 * precios, y se desfasaron: durante un mes el inglés y el francés vendieron un
 * intensivo de dos días que ya duraba cuatro.
 *
 * Es deliberadamente más corta que `CourseDetailPage`: no lleva galería,
 * formulario de inscripción ni testimonios, que siguen siendo contenido sólo
 * en castellano.
 */

import Image from 'next/image';
import Link from 'next/link';
import type { CourseData } from '@/lib/courses/data';
import type { CourseTraduccion } from '@/lib/courses/traducciones';
import type { Locale } from '@/lib/i18n/config';
import {
  horarioApertura,
  modalidadTeoriaPractica,
  precioParaMostrar,
  rangoFechas,
} from '@/lib/courses/formato';

interface Props {
  course: CourseData;
  t: CourseTraduccion;
  locale: Locale;
  /** Prefijo de las rutas internas de este idioma, por ejemplo `/en`. */
  base: string;
  whatsapp: string;
}

export function CourseDetailTranslated({ course, t, locale, base, whatsapp }: Props) {
  const fechas = course.fechas ? rangoFechas(course.fechas, locale) : null;
  const horario = course.fechas ? horarioApertura(course.fechas, locale) : null;
  const modalidad = course.teoriaPractica
    ? modalidadTeoriaPractica(course.teoriaPractica, locale)
    : null;

  return (
    <main>
      {/* HERO */}
      <section className="relative min-h-[65vh] md:min-h-[440px] md:h-[65vh] bg-ink-950 flex items-end overflow-hidden pt-28 md:pt-0">
        <Image
          src={course.heroImg}
          alt={course.name}
          fill
          priority
          className="object-cover opacity-60"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/40 to-transparent" />
        <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-16">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">
            {[t.badge, fechas, 'Tay Pichín'].filter(Boolean).join(' · ')}
          </p>
          <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-3xl">
            {t.titulo.antes} <em>{t.titulo.enfasis}</em>
          </h1>
          <p className="mt-5 font-sans text-base text-bone-200 max-w-2xl leading-relaxed">
            {t.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors"
            >
              {t.cta.inscribirme}
            </a>
            <Link
              href={`${base}/cursos`}
              className="inline-flex border border-bone-50/50 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:border-bone-50 transition-colors"
            >
              {t.cta.todosLosCursos}
            </Link>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="bg-bone-50 py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">
            {t.introEyebrow}
          </p>
          {t.intro.map(p => (
            <p key={p.slice(0, 40)} className="font-sans text-base text-ink-700 leading-relaxed mb-6">
              {p}
            </p>
          ))}
          <p className="font-sans text-base font-bold text-ink-950">{t.introCierre}</p>
        </div>
      </section>

      {/* DATOS CLAVE */}
      {t.datos && (
      <section className="bg-bone-100 py-12 px-6">
        <div className="max-w-editorial mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: t.datos.cuando, value: fechas, sub: horario },
            { label: t.datos.donde, value: t.donde ?? null, sub: null },
            { label: t.datos.formato, value: t.formato ?? null, sub: modalidad },
            { label: t.datos.facilita, value: course.facilitadores[0]?.name ?? '', sub: t.facilitaNota ?? null },
          ]
            .filter(d => d.value)
            .map(d => (
              <div key={d.label} className="bg-bone-50 p-5 border-l-4 border-clay-700">
                <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-2">
                  {d.label}
                </p>
                <p className="font-display text-base text-ink-950">{d.value}</p>
                {d.sub && <p className="font-sans text-xs text-ink-700/70 mt-1">{d.sub}</p>}
              </div>
            ))}
        </div>
      </section>
      )}

      {/* ÁREAS */}
      <section className="bg-ink-950 py-20 px-6">
        <div className="max-w-editorial mx-auto">
          <div className="mb-10">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">
              {t.areasEyebrow}
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-bone-50">
              {t.areasTitulo.antes}
              <em>{t.areasTitulo.enfasis}</em>
            </h2>
            <p className="mt-5 font-sans text-base text-bone-200 leading-relaxed max-w-2xl">
              {horario ? `${horario}. ` : ''}
              {t.areasNota}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {course.modulos.map(m => {
              const tm = t.modulos[m.num];
              if (!tm) return null;
              return (
                <div key={m.num} className="border-l-2 border-clay-700 pl-5">
                  <p className="font-sans font-bold text-sm text-bone-100 mb-1">{tm.title}</p>
                  <p className="font-sans text-sm text-bone-200 leading-relaxed">
                    {tm.items.join(' · ')}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRECIOS */}
      <section className="bg-bone-50 py-20 px-6">
        <div className="max-w-editorial mx-auto">
          <div className="mb-10">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">
              {t.preciosEyebrow}
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-ink-950">{t.preciosTitulo}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {course.opciones.map(op => {
              const to = t.opciones[op.id];
              if (!to) return null;
              return (
                <div
                  key={op.id}
                  className={`p-8 flex flex-col gap-3 ${op.highlighted ? 'bg-clay-700' : 'bg-bone-100'}`}
                >
                  {op.highlighted && (
                    <span className="text-xs font-sans font-bold text-ink-950 bg-bone-50 px-2 py-1 inline-block self-start">
                      {t.recomendado}
                    </span>
                  )}
                  <p className={`font-sans text-sm ${op.highlighted ? 'text-bone-200' : 'text-ink-700'}`}>
                    {to.label}
                  </p>
                  <p className={`font-display text-3xl ${op.highlighted ? 'text-bone-50' : 'text-clay-700'}`}>
                    {precioParaMostrar(op, locale)}
                  </p>
                  {op.precioAlt && (
                    <p className={`font-sans text-xs ${op.highlighted ? 'text-bone-200/70' : 'text-ink-700/70'}`}>
                      {op.precioAlt}
                    </p>
                  )}
                  <ul className="flex flex-col gap-2 mt-2">
                    {to.includes.map(item => (
                      <li
                        key={item}
                        className={`flex items-start gap-2 text-xs font-sans ${op.highlighted ? 'text-clay-100' : 'text-ink-700'}`}
                      >
                        <span
                          className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${op.highlighted ? 'bg-clay-300' : 'bg-clay-500'}`}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <p className="font-sans text-sm text-ink-700/70 italic mb-8">{t.opcionesNota}</p>
          <div className="flex flex-wrap gap-4">
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors"
            >
              {t.cta.porWhatsapp}
            </a>
            <Link
              href={`${base}/contacto`}
              className="inline-flex border border-ink-950 text-ink-950 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-ink-950 hover:text-bone-50 transition-colors"
            >
              {t.cta.escribinos}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
