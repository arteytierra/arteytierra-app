'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { CourseData } from '@/lib/courses/data';
import { CourseEnrollForm } from './CourseEnrollForm';
import { AddCourseToCartButton } from '@/components/shop/AddCourseToCartButton';

export function CourseDetailPage({ course }: { course: CourseData }) {
  const isPresencial = course.kind === 'presencial' || course.kind === 'inmersion';

  return (
    <main>
      {/* HERO */}
      <section className="relative h-[65vh] min-h-[440px] bg-ink-950 flex items-end overflow-hidden">
        <Image
          src={course.heroImg}
          alt={course.name}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/40 to-transparent" />
        <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-14">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/cursos" className="text-xs font-sans text-clay-300 hover:text-bone-100 transition-colors uppercase tracking-widest">
              Cursos
            </Link>
            <span className="text-clay-500 text-xs">›</span>
            <span className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 bg-clay-700/60 px-2.5 py-1">
              {course.badge}
            </span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-3xl">
            {course.name}
          </h1>
          <p className="mt-4 text-bone-200 font-sans text-lg max-w-xl leading-relaxed">
            {course.subtitle}
          </p>
          <p className="mt-3 text-clay-300 font-sans text-sm font-semibold">{course.tag}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#inscribirme"
              className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-7 py-4 hover:bg-clay-900 transition-colors"
            >
              Inscribirme →
            </a>
            <a
              href={course.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white font-sans font-bold text-sm uppercase tracking-widest px-7 py-4 hover:bg-[#1ebe5d] transition-colors"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.004c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zm-7.01 15.24h-.003a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23a8.2 8.2 0 0 1 5.82 2.41 8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43-.14-.01-.31-.01-.48-.01a.92.92 0 0 0-.67.31c-.23.25-.88.86-.88 2.07 0 1.22.9 2.4 1.02 2.56.12.17 1.75 2.67 4.25 3.75.59.25 1.06.41 1.42.52.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" />
              </svg>
              Consultá por WhatsApp
            </a>
            <a
              href="#programa"
              className="inline-flex border border-bone-50/40 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-7 py-4 hover:border-bone-50 transition-colors"
            >
              Ver programa
            </a>
          </div>
        </div>
      </section>

      {/* DATOS CLAVE */}
      <section className="bg-bone-100 py-10 px-6 border-b border-bone-200">
        <div className="max-w-editorial mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {course.datos.map(d => (
            <div key={d.label} className="bg-bone-50 px-4 py-4 border-l-2 border-clay-500">
              <p className="text-xs font-sans font-bold uppercase tracking-wider text-clay-700 mb-1">{d.label}</p>
              <p className="font-sans font-semibold text-sm text-ink-900 leading-snug">{d.val}</p>
            </div>
          ))}
        </div>
      </section>

      {/* INTRO */}
      <section className="bg-bone-50 py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-5">El curso</p>
          <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-8">
            Aprender <em>construyendo.</em>
          </h2>
          {course.intro.map((p, i) => (
            <p key={i} className="font-sans text-base text-ink-700 leading-relaxed mb-4 last:mb-0">{p}</p>
          ))}
        </div>
      </section>

      {/* VIDEO PROMO */}
      {course.promoVideoId && (
        <section className="bg-bone-100 py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">El curso en 2 minutos</p>
              <h2 className="font-display text-3xl text-ink-950">Una presentación de la <em>formación.</em></h2>
            </div>
            <div className="relative aspect-video bg-ink-950 overflow-hidden">
              <iframe
                className="absolute inset-0 w-full h-full border-0"
                src={`https://www.youtube-nocookie.com/embed/${course.promoVideoId}`}
                title={`${course.name} — video presentación`}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      )}

      {/* PARA QUIÉN + VAS A SALIR */}
      {(course.paraQuien || course.vasASalir) && (
        <section className="bg-bone-100 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-3">¿Es para vos?</p>
              <h2 className="font-display text-4xl text-ink-950">Para quienes quieren <em>cambiar el rumbo.</em></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {course.paraQuien && (
                <div className="bg-bone-50 p-8 border-t-4 border-moss-500">
                  <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-moss-700 mb-5">Esta formación es para vos si…</h3>
                  <ul className="flex flex-col gap-3">
                    {course.paraQuien.map((item, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <span className="text-moss-500 font-bold mt-0.5 flex-shrink-0">→</span>
                        <span className="font-sans text-sm text-ink-700 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {course.vasASalir && (
                <div className="bg-clay-700 p-8 border-t-4 border-clay-500">
                  <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-clay-200 mb-5">Vas a salir capaz de…</h3>
                  <ul className="flex flex-col gap-3">
                    {course.vasASalir.map((item, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <span className="text-clay-300 font-bold mt-0.5 flex-shrink-0">●</span>
                        <span className="font-sans text-sm text-bone-100 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* PROGRAMA */}
      <section id="programa" className="bg-ink-950 py-20 md:py-28 px-6">
        <div className="max-w-editorial mx-auto">
          <div className="mb-12">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-3">Contenidos</p>
            <h2 className="font-display text-4xl md:text-5xl text-bone-50">
              El <em>programa.</em>
            </h2>
          </div>

          {course.modulos[0]?.date ? (
            /* TIMELINE: módulos con fecha (cursos online por semanas) */
            <div className="flex flex-col gap-3">
              {course.modulos.map((m, i) => (
                <div
                  key={i}
                  className={`p-6 border-l-4 ${m.highlighted ? 'bg-clay-700 border-clay-500' : 'bg-clay-700/10 border-clay-700'}`}
                >
                  <div className="flex flex-wrap items-baseline gap-3 mb-2">
                    <span className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500">{m.num}</span>
                    {m.date && <span className="text-xs font-sans text-bone-200">{m.date}</span>}
                  </div>
                  <h3 className={`font-display text-xl mb-3 ${m.highlighted ? 'text-bone-50' : 'text-bone-100'}`}>{m.title}</h3>
                  {m.nota && (
                    <p className={`font-sans text-xs mb-3 italic ${m.highlighted ? 'text-clay-200' : 'text-bone-200'}`}>{m.nota}</p>
                  )}
                  {m.teoria && m.practica ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-sans font-bold uppercase tracking-wider text-clay-500 mb-1.5">Teoría</p>
                        <p className="font-sans text-sm text-bone-200 leading-relaxed">{m.teoria}</p>
                      </div>
                      <div>
                        <p className="text-xs font-sans font-bold uppercase tracking-wider text-clay-500 mb-1.5">Práctica</p>
                        <p className="font-sans text-sm text-bone-200 leading-relaxed">{m.practica}</p>
                      </div>
                    </div>
                  ) : (
                    <ul className="flex flex-col gap-1.5">
                      {m.items.map(item => (
                        <li key={item} className={`flex items-start gap-2 font-sans text-sm ${m.highlighted ? 'text-clay-100' : 'text-bone-200'}`}>
                          <span className="mt-2 w-1 h-1 rounded-full bg-clay-500 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* GRILLA: módulos por tema (intensivos presenciales) */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {course.modulos.map((m, i) => (
                <div key={i} className="p-5 bg-clay-700/10 border-l-[3px] border-clay-700">
                  <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-2">{m.num}</p>
                  <h3 className="font-display text-base text-bone-100 mb-3 leading-snug">{m.title}</h3>
                  <ul className="flex flex-col gap-1.5">
                    {m.items.map(item => (
                      <li key={item} className="font-sans text-sm text-bone-200 leading-relaxed">· {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* TRABAJO FINAL */}
      {course.trabajoFinal && (
        <section className="bg-bone-50 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-3">Lo que te llevás</p>
              <h2 className="font-display text-4xl text-ink-950">Tu <em>trabajo final integrador.</em></h2>
              <p className="mt-4 font-sans text-ink-700 text-base max-w-lg mx-auto">
                Al finalizar el programa cada participante desarrolla dos piezas concretas que podrá usar como base real para construir.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {course.trabajoFinal.map(tf => (
                <div key={tf.title} className="bg-bone-100 p-8 border-t-4 border-clay-500">
                  <div className="text-4xl mb-4">{tf.icon}</div>
                  <h3 className="font-display text-2xl text-ink-950 mb-4">{tf.title}</h3>
                  <ul className="flex flex-col gap-2">
                    {tf.items.map(item => (
                      <li key={item} className="flex items-center gap-2 font-sans text-sm text-ink-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-clay-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* GALERÍA */}
      {course.galeria.length > 0 && (
        <section className={`py-4 px-4 ${course.trabajoFinal ? 'bg-bone-50' : 'bg-ink-950 pt-0'}`}>
          <div className="max-w-editorial mx-auto grid grid-cols-2 md:grid-cols-4 gap-2">
            {course.galeria.map((src, i) => (
              <div key={i} className="relative aspect-[4/3] overflow-hidden">
                <Image src={src} alt={`${course.name} — foto ${i + 2}`} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FACILITADORES */}
      <section className="bg-bone-100 py-20 px-6">
        <div className="max-w-editorial mx-auto">
          <div className="mb-12 text-center">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-3">Quienes te acompañan</p>
            <h2 className="font-display text-4xl text-ink-950">Los <em>facilitadores.</em></h2>
          </div>
          <div className={`grid grid-cols-1 gap-8 ${course.facilitadores.length > 1 ? 'md:grid-cols-2' : 'max-w-2xl mx-auto'}`}>
            {course.facilitadores.map(f => (
              <div key={f.name} className="flex flex-col sm:flex-row gap-6 bg-bone-50 overflow-hidden">
                {f.img && (
                  <div className="relative w-full sm:w-48 aspect-square sm:aspect-auto sm:min-h-full flex-shrink-0 overflow-hidden">
                    <Image src={f.img} alt={f.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, 192px" />
                  </div>
                )}
                <div className="p-6 flex flex-col justify-center gap-2">
                  <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700">{f.role}</p>
                  <h3 className="font-display text-2xl text-ink-950">{f.name}</h3>
                  <p className="font-sans text-sm text-ink-700 leading-relaxed">{f.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRECIOS */}
      <section className="bg-bone-50 py-20 px-6">
        <div className="max-w-editorial mx-auto">
          <div className="mb-12 text-center">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-3">Inversión</p>
            <h2 className="font-display text-4xl text-ink-950">Cómo <em>sumarte.</em></h2>
          </div>
          <div className={`grid grid-cols-1 gap-6 ${
            course.opciones.length === 1 ? 'max-w-sm mx-auto' :
            course.opciones.length === 2 ? 'sm:grid-cols-2 max-w-2xl mx-auto' :
            'sm:grid-cols-2 lg:grid-cols-3'
          }`}>
            {course.opciones.map(op => (
              <div key={op.id} className={`p-8 flex flex-col gap-4 ${op.highlighted ? 'bg-clay-700' : 'bg-bone-100 border border-bone-200'}`}>
                {op.highlighted && (
                  <span className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300">Recomendado</span>
                )}
                <h3 className={`font-display text-xl ${op.highlighted ? 'text-bone-50' : 'text-ink-950'}`}>{op.label}</h3>
                <div>
                  <div className={`font-display text-3xl ${op.highlighted ? 'text-bone-50' : 'text-ink-950'}`}>{op.precio}</div>
                  {/* Mostrar precio alternativo solo en cursos online */}
                  {op.precioAlt && (course.kind === 'online-live' || course.kind === 'online-async') && (
                    <p className={`text-xs font-sans mt-1 ${op.highlighted ? 'text-clay-200' : 'text-clay-700'}`}>{op.precioAlt}</p>
                  )}
                </div>
                <ul className="flex flex-col gap-2 mt-1 flex-1">
                  {op.includes.map(item => (
                    <li key={item} className={`flex items-start gap-2 text-xs font-sans ${op.highlighted ? 'text-clay-100' : 'text-ink-700'}`}>
                      <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${op.highlighted ? 'bg-clay-300' : 'bg-clay-500'}`} />
                      {item}
                    </li>
                  ))}
                </ul>
                {op.precio !== 'Consultanos' && (
                  <AddCourseToCartButton
                    item={{
                      slug: course.slug,
                      name: course.name,
                      optionId: op.id,
                      optionLabel: op.label,
                      precio: op.precio,
                    }}
                    className={`mt-2 w-full py-3 text-xs font-sans font-bold uppercase tracking-widest transition-colors ${
                      op.highlighted
                        ? 'bg-bone-50 text-clay-700 hover:bg-bone-100'
                        : 'bg-clay-700 text-bone-50 hover:bg-clay-900'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          {course.opcionesNota && (
            <p className="mt-6 text-center font-sans text-sm text-ink-700 italic max-w-xl mx-auto">{course.opcionesNota}</p>
          )}
        </div>
      </section>

      {/* INSCRIPCIÓN */}
      <section id="inscribirme" className="bg-ink-950 py-20 md:py-28 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10 text-center">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-3">Inscripción</p>
            <h2 className="font-display text-4xl text-bone-50">Reservá tu <em>cupo.</em></h2>
            <p className="mt-4 font-sans text-bone-200 text-base leading-relaxed">
              Completá el formulario y te respondemos con instrucciones de pago en 24–48 hs. Cupos limitados.
            </p>
          </div>
          <CourseEnrollForm curso={course.formCurso} whatsapp={course.whatsapp} mercadopago={course.mercadopago} />
        </div>
      </section>

      {/* CTA */}
      <section className={`py-16 px-6 text-center ${isPresencial ? 'bg-clay-100 border-t border-clay-200' : 'bg-bone-100'}`}>
        <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-3">
          {isPresencial ? '¿Venís desde lejos?' : '¿Tenés dudas?'}
        </p>
        <h2 className="font-display text-3xl text-ink-950 mb-4">
          {isPresencial ? <>Quedáte en <em>Tay Pichín.</em></> : <>Hablemos <em>antes.</em></>}
        </h2>
        <p className="font-sans text-ink-700 text-sm max-w-md mx-auto mb-6 leading-relaxed">
          {isPresencial
            ? 'El curso se desarrolla en la Ecoescuela. Podés hospedarte ahí mismo y vivir la experiencia completa.'
            : 'Una consulta sin costo para ayudarte a elegir el camino que más se alinea con lo que buscás.'}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a
            href={course.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-xs uppercase tracking-widest px-6 py-3.5 hover:bg-clay-900 transition-colors"
          >
            WhatsApp →
          </a>
          {isPresencial ? (
            <Link
              href="/tay-pichin"
              className="inline-flex border border-clay-700 text-clay-700 font-sans font-bold text-xs uppercase tracking-widest px-6 py-3.5 hover:bg-clay-200 transition-colors"
            >
              Ver Tay Pichín →
            </Link>
          ) : (
            <Link
              href="/cursos"
              className="inline-flex border border-ink-700 text-ink-700 font-sans font-bold text-xs uppercase tracking-widest px-6 py-3.5 hover:bg-bone-50 transition-colors"
            >
              Ver todos los cursos
            </Link>
          )}
        </div>
      </section>
      {/* WhatsApp flotante — consulta rápida desde cualquier punto de la página */}
      <a
        href={course.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Consultá por WhatsApp"
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white font-sans font-bold text-sm px-5 py-3.5 shadow-lg hover:bg-[#1ebe5d] transition-colors"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
          <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.004c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zm-7.01 15.24h-.003a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23a8.2 8.2 0 0 1 5.82 2.41 8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43-.14-.01-.31-.01-.48-.01a.92.92 0 0 0-.67.31c-.23.25-.88.86-.88 2.07 0 1.22.9 2.4 1.02 2.56.12.17 1.75 2.67 4.25 3.75.59.25 1.06.41 1.42.52.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" />
        </svg>
        <span className="hidden sm:inline">Consultá por WhatsApp</span>
      </a>
    </main>
  );
}
