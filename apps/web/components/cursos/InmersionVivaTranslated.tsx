/**
 * La ficha de la Inmersión Viva en un idioma que no es el castellano.
 *
 * Misma idea que `CourseDetailTranslated` pero con el recorrido propio de una
 * estadía: no hay fecha de inicio ni cronograma, hay un enfoque, las áreas que
 * se recorren y una contribución semanal. Los datos —las áreas, los precios,
 * la nota de cómo se recorren— salen de `lib/courses/data.ts`, los mismos que
 * usa la ficha en castellano; lo único propio de cada idioma es la prosa.
 *
 * Antes esto eran dos archivos de 205 líneas, uno por idioma, cada uno con su
 * copia de las áreas y de los precios. Ya se habían desfasado una vez.
 */

import Image from 'next/image';
import Link from 'next/link';
import type { CourseData } from '@/lib/courses/data';
import type { CourseTraduccion } from '@/lib/courses/traducciones';
import type { Locale } from '@/lib/i18n/config';
import { precioParaMostrar } from '@/lib/courses/formato';

interface Props {
  course: CourseData;
  t: CourseTraduccion;
  locale: Locale;
  /** Prefijo de las rutas internas de este idioma, por ejemplo `/en`. */
  base: string;
  whatsapp: string;
}

export function InmersionVivaTranslated({ course, t, locale, base, whatsapp }: Props) {
  return (
    <main>
      {/* HERO */}
      <section className="relative min-h-[65vh] md:min-h-[500px] md:h-[70vh] bg-ink-950 flex items-end overflow-hidden pt-28 md:pt-0">
        <Image
          src={course.heroImg}
          alt={course.name}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/40 to-transparent" />
        <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-16">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">
            {t.badge}
          </p>
          <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-3xl">
            {t.titulo.antes} <em>{t.titulo.enfasis}</em>
          </h1>
          {t.tagline && (
            <p className="mt-3 font-display text-xl text-clay-300 italic">{t.tagline}</p>
          )}
          <p className="mt-4 font-sans text-base text-bone-200 max-w-2xl leading-relaxed">
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
            {t.ctaSecundario && (
              <Link
                href={`${base}${t.ctaSecundario.href}`}
                className="inline-flex border border-bone-50/50 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:border-bone-50 transition-colors"
              >
                {t.ctaSecundario.label}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ENFOQUE */}
      {t.enfoque && (
        <section className="bg-bone-50 py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">
              {t.enfoque.eyebrow}
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-8 leading-tight">
              {t.enfoque.titulo.map((linea, i) => (
                <span key={linea} className="block">
                  {i === 0 ? <em>{linea}</em> : linea}
                </span>
              ))}
            </h2>
            {t.intro.map(p => (
              <p key={p.slice(0, 40)} className="font-sans text-base text-ink-700 leading-relaxed mb-4">
                {p}
              </p>
            ))}
            <Link
              href={`${base}/nosotros`}
              className="inline-flex items-center gap-1.5 mt-6 font-sans text-sm font-semibold text-moss-700 hover:text-moss-900 transition-colors"
            >
              {t.enfoque.enlace}
            </Link>
          </div>
        </section>
      )}

      {/* ÁREAS */}
      <section className="bg-ink-950 py-20 px-6">
        <div className="max-w-editorial mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">
              {t.areasEyebrow}
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-bone-50">
              {t.areasTitulo.antes}
              <em>{t.areasTitulo.enfasis}</em>
            </h2>
            <p className="mt-6 font-sans text-base text-bone-200 leading-relaxed max-w-2xl mx-auto text-left">
              {t.areasNota}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {course.modulos.map(m => {
              const tm = t.modulos[m.num];
              if (!tm) return null;
              return (
                <div key={m.num} className="bg-ink-800 p-8">
                  <div className="text-3xl mb-4">{m.num}</div>
                  <h3 className="font-display text-2xl text-bone-50 mb-4">{tm.title}</h3>
                  {tm.nota && (
                    <p className="font-sans text-sm text-clay-200 italic leading-relaxed mb-4">
                      {tm.nota}
                    </p>
                  )}
                  <ul className="flex flex-col gap-2">
                    {tm.items.map(item => (
                      <li key={item} className="flex items-start gap-3 font-sans text-sm text-bone-200">
                        <div className="w-1.5 h-1.5 rounded-full bg-clay-700 flex-shrink-0 mt-1.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONTRIBUCIÓN */}
      <section className="bg-bone-50 py-20 px-6">
        <div className="max-w-editorial mx-auto">
          <div className="mb-10">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">
              {t.preciosEyebrow}
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-ink-950">{t.preciosTitulo}</h2>
            {t.preciosLead && (
              <p className="mt-4 font-sans text-sm text-ink-700 max-w-lg leading-relaxed">
                {t.preciosLead}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mb-10">
            {course.opciones.map(op => {
              const to = t.opciones[op.id];
              if (!to) return null;
              return (
                <div key={op.id} className={`p-10 ${op.highlighted ? 'bg-clay-900' : 'bg-ink-950'}`}>
                  <p
                    className={`text-xs font-sans font-bold uppercase tracking-widest mb-4 ${op.highlighted ? 'text-clay-300' : 'text-clay-500'}`}
                  >
                    {to.label}
                  </p>
                  <hr className="border-clay-700/30 mb-6" />
                  <ul className="flex flex-col gap-2 mb-6">
                    {to.includes.map(item => (
                      <li key={item} className="flex items-start gap-2 font-sans text-sm text-bone-200">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-clay-700 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="font-display text-3xl text-clay-700">
                    {precioParaMostrar(op, locale)}
                  </p>
                </div>
              );
            })}
          </div>
          {t.notaIngreso && (
            <div className="bg-clay-700/10 border border-clay-700/30 p-6 max-w-2xl mb-8">
              <p className="font-sans text-sm font-bold text-clay-700 mb-2">{t.notaIngreso.titulo}</p>
              <p className="font-sans text-sm text-ink-700">{t.notaIngreso.texto}</p>
            </div>
          )}
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors"
          >
            {t.cta.porWhatsapp}
          </a>
        </div>
      </section>

      {/* CIERRE */}
      {t.cierre && (
        <section className="bg-ink-950 py-20 px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl text-bone-50 mb-5">
            {t.cierre.titulo.antes}
            <em>{t.cierre.titulo.enfasis}</em>
          </h2>
          <p className="font-sans text-base text-bone-200 max-w-md mx-auto mb-8 leading-relaxed">
            {t.cierre.texto}
          </p>
          <Link
            href={`${base}/contacto`}
            className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors"
          >
            {t.cierre.cta}
          </Link>
        </section>
      )}
    </main>
  );
}
