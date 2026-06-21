import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { AsesoriaForm } from '@/components/asesorias/AsesoriaForm';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Asesoría Online — Arte y Tierra',
  description: 'Sesión 1:1 con el equipo de Arte y Tierra. 1 hora para revisar tu terreno, tu agua, tus ideas y posibilidades. USD 30–60. Primer paso antes del diseño.',
};

const INCLUYE = [
  { title: '1 hora en videollamada', desc: 'Con Jonatan u otro integrante del equipo según tu necesidad.' },
  { title: 'Revisión de tu terreno', desc: 'Compartís fotos, mapas y descripción de tu lugar o proyecto.' },
  { title: 'Orientación técnica', desc: 'Respondemos preguntas concretas y te damos dirección de acción.' },
  { title: 'Informe post-sesión', desc: 'Resumen de lo trabajado y próximos pasos, por escrito.' },
];

const TEMAS = [
  'Bioarquitectura',
  'Diseño hidrológico',
  'Permacultura',
  'Sistemas agroecológicos',
  'Tratamiento de aguas',
  'Diagnóstico de terreno',
  'Materiales naturales',
  'Producción agroecológica',
  'Proyectos integrales',
];

const PASOS = [
  {
    n: '01',
    title: 'Completá el formulario',
    desc: 'Contanos sobre tu proyecto, tu terreno y lo que querés trabajar en la sesión. Te escribimos para confirmar.',
  },
  {
    n: '02',
    title: 'Realizá el pago',
    desc: 'USD 30 para consultas puntuales, USD 60 para diagnóstico integral. Podés pagar por PayPal, Mercado Pago o transferencia bancaria.',
  },
  {
    n: '03',
    title: 'Agendá la sesión',
    desc: 'Una vez confirmado el pago, elegís el día y horario que mejor te queda en nuestro calendario online.',
  },
];

export default function AsesoriasPage() {
  return (
    <>
      <SiteHeader />
      <main>
      {/* HERO */}
      <section className="relative h-[60vh] min-h-[420px] bg-ink-950 flex items-end overflow-hidden">
        <Image
          src="/img/cursos/asesorias/dron.jpg"
          alt="Asesoría online Arte y Tierra"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/40 to-transparent" />
        <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-14">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-3">Asesoría online · 1 hora</p>
          <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-2xl">
            Tu proyecto empieza<br />
            con las preguntas<br />
            <em>correctas.</em>
          </h1>
          <p className="mt-5 text-bone-200 font-sans text-lg max-w-lg">
            USD 30–60 · Sesión 1:1 con el equipo · Cualquier parte del mundo
          </p>
        </div>
      </section>

      {/* QUÉ INCLUYE */}
      <section className="bg-bone-50 py-20 md:py-24 px-6">
        <div className="max-w-editorial mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">La sesión incluye</p>
            <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-10">
              Una hora que<br /><em>cambia el rumbo.</em>
            </h2>
            <div className="flex flex-col gap-6">
              {INCLUYE.map(item => (
                <div key={item.title} className="flex gap-4">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-clay-700 flex-shrink-0" />
                  <div>
                    <h3 className="font-sans font-semibold text-ink-950">{item.title}</h3>
                    <p className="font-sans text-sm text-ink-700 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 p-5 bg-clay-100 border border-clay-200">
              <p className="font-sans text-sm text-clay-700 leading-relaxed">
                <strong>Descuento en el diseño:</strong> Si después de la asesoría decidís contratar el diseño o proyecto con nosotros, los USD 60 de la sesión se descuentan del presupuesto total.
              </p>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src="/img/cursos/asesorias/2.jpg"
              alt="Sesión de asesoría Arte y Tierra"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* TEMAS */}
      <section className="bg-ink-950 py-20 px-6">
        <div className="max-w-editorial mx-auto">
          <div className="mb-10 text-center">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-3">¿Sobre qué podemos hablar?</p>
            <h2 className="font-display text-4xl text-bone-50">
              Cualquier tema<br /><em>de tu territorio.</em>
            </h2>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {TEMAS.map(t => (
              <span key={t} className="font-sans text-sm font-semibold text-bone-200 bg-ink-800 border border-ink-700 px-4 py-2.5">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESO */}
      <section className="bg-bone-100 py-20 md:py-28 px-6">
        <div className="max-w-editorial mx-auto">
          <div className="mb-14 text-center">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-3">¿Cómo funciona?</p>
            <h2 className="font-display text-4xl md:text-5xl text-ink-950">
              Tres pasos<br />para <em>empezar.</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PASOS.map(p => (
              <div key={p.n} className="flex flex-col gap-4 p-8 bg-bone-50 border border-bone-200">
                <span className="font-display text-5xl text-clay-300">{p.n}</span>
                <h3 className="font-display text-xl text-ink-950">{p.title}</h3>
                <p className="font-sans text-sm text-ink-700 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORMULARIO */}
      <section id="reservar" className="bg-bone-50 py-20 md:py-28 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10 text-center">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-3">Paso 1</p>
            <h2 className="font-display text-4xl text-ink-950">
              Contanos sobre<br /><em>tu proyecto.</em>
            </h2>
            <p className="mt-4 font-sans text-ink-700 text-base leading-relaxed">
              Completá el formulario y te escribimos para coordinar. Normalmente respondemos en 24 horas hábiles.
            </p>
          </div>
          <AsesoriaForm />
        </div>
      </section>

      {/* PAGOS */}
      <section className="bg-bone-50 border-y border-clay-200 py-16 px-6">
        <div className="max-w-editorial mx-auto">
          <div className="mb-10 text-center">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-3">Paso 2 — Pagos</p>
            <h2 className="font-display text-3xl text-ink-950">
              Elegí cómo <em>pagar.</em>
            </h2>
            <p className="mt-3 font-sans text-ink-700 text-sm">
              USD 30 consulta puntual · USD 60 diagnóstico integral
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 bg-bone-50 border border-bone-200 flex flex-col gap-3">
              <h3 className="font-sans font-bold text-ink-950">PayPal</h3>
              <p className="font-sans text-sm text-ink-700 leading-relaxed">
                Pagos internacionales. Aceptamos todas las tarjetas vía PayPal.
              </p>
              <a
                href="https://paypal.me/arteytierra"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto text-sm font-sans font-semibold text-clay-700 underline underline-offset-4 hover:text-clay-900"
              >
                Pagar por PayPal →
              </a>
            </div>
            <div className="p-6 bg-bone-50 border border-bone-200 flex flex-col gap-3">
              <h3 className="font-sans font-bold text-ink-950">Mercado Pago</h3>
              <p className="font-sans text-sm text-ink-700 leading-relaxed">
                Para Argentina y Latinoamérica. Tarjetas, transferencia y efectivo.
              </p>
              <a
                href="https://link.mercadopago.com.ar/arteytierra"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto text-sm font-sans font-semibold text-clay-700 underline underline-offset-4 hover:text-clay-900"
              >
                Pagar por Mercado Pago →
              </a>
            </div>
            <div className="p-6 bg-bone-50 border border-bone-200 flex flex-col gap-3">
              <h3 className="font-sans font-bold text-ink-950">Transferencia bancaria</h3>
              <p className="font-sans text-sm text-ink-700 leading-relaxed">
                Colombia: Bancolombia Cuenta de Ahorros <strong>541-935485-66</strong>.
              </p>
              <p className="mt-auto text-sm font-sans text-ink-700">
                Envianos el comprobante por WhatsApp o email.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PASO 3 — AGENDAR */}
      <section className="bg-bone-100 py-20 px-6">
        <div className="max-w-editorial mx-auto">
          <div className="mb-10 text-center">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-3">Paso 3 — Agendar</p>
            <h2 className="font-display text-3xl text-ink-950">
              Elegí tu <em>horario.</em>
            </h2>
            <p className="mt-3 font-sans text-ink-700 text-base max-w-md mx-auto">
              Una vez confirmado el pago, coordinamos día y horario por WhatsApp. Respondemos siempre en menos de 24 horas.
            </p>
          </div>
          <div className="max-w-lg mx-auto flex flex-col gap-4">
            <a
              href="https://wa.me/5493549431594?text=Hola%2C%20hice%20el%20pago%20de%20la%20asesor%C3%ADa%20y%20quiero%20agendar%20mi%20sesi%C3%B3n."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between bg-clay-700 text-bone-50 px-8 py-5 hover:bg-clay-900 transition-colors"
            >
              <span className="font-sans font-bold text-sm uppercase tracking-widest">Agendar por WhatsApp →</span>
              <span className="font-sans text-xs text-clay-200">Respondemos en &lt; 24 hs</span>
            </a>
            <a
              href="mailto:info.arteytierra@gmail.com?subject=Asesoría%20online%20—%20quiero%20agendar"
              className="flex items-center justify-between border border-ink-950 text-ink-950 px-8 py-5 hover:bg-ink-950 hover:text-bone-50 transition-colors"
            >
              <span className="font-sans font-bold text-sm uppercase tracking-widest">Agendar por email</span>
              <span className="font-sans text-xs text-ink-500">info.arteytierra@gmail.com</span>
            </a>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-clay-700 py-20 px-6 text-center">
        <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-200 mb-4">
          ¿Todavía tenés dudas?
        </p>
        <h2 className="font-display text-4xl text-bone-50 mb-5">
          Escribinos<br /><em>directamente.</em>
        </h2>
        <p className="font-sans text-bone-100 text-base max-w-md mx-auto mb-8 leading-relaxed">
          Si preferís hablar antes de agendar, escribinos por WhatsApp o email. Respondemos siempre.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href="https://wa.me/5493549431594"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex bg-ink-950 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-ink-800 transition-colors"
          >
            WhatsApp →
          </a>
          <Link
            href="/contacto"
            className="inline-flex border border-bone-50/50 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:border-bone-50 transition-colors"
          >
            Email
          </Link>
        </div>
      </section>
    </main>
      <SiteFooter />
    </>
  );
}
