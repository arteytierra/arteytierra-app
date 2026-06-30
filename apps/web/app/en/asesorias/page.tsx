import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Online Consultations — Bioarchitecture & Permaculture',
  description: 'Online consultations with Arte y Tierra: bioarchitecture, regenerative hydrology, permaculture and natural building. Book your session by video call — worldwide.',
  alternates: { canonical: '/en/asesorias' },
};

const TEMAS = [
  { icon: '🏗', title: 'Bioarchitecture', desc: 'Natural materials, bioclimatic design, earth building systems.' },
  { icon: '💧', title: 'Regenerative hydrology', desc: 'Rainwater harvesting, greywater treatment, water cycle design.' },
  { icon: '🌱', title: 'Agroecology', desc: 'Productive garden design, agroforestry systems, companion planting.' },
  { icon: '🌍', title: 'Permaculture design', desc: 'Territorial reading, zone design, productive landscape planning.' },
  { icon: '🏠', title: "Owner-builder support", desc: 'Guidance for self-builders: materials, techniques, construction sequence.' },
  { icon: '♻️', title: 'Sustainable systems', desc: 'Dry toilets, composting, solid waste management, eco-bricks.' },
  { icon: '📋', title: 'Project review', desc: 'Analysis and feedback on architectural plans, designs and intentions.' },
  { icon: '🗺', title: 'Master plan', desc: 'Integral property design: zoning, infrastructure and productive systems.' },
];

const INCLUYE = [
  { icon: '📹', text: '45–60 min video call' },
  { icon: '📄', text: 'Summary with key points and resources' },
  { icon: '💬', text: 'Follow-up questions by WhatsApp (48 h after the session)' },
];

const PRECIOS = [
  { tipo: 'Single consultation', precio: 'USD 30', desc: '45 min · one specific topic' },
  { tipo: 'Extended consultation', precio: 'USD 60', desc: '90 min · integral project review', featured: true },
  { tipo: 'Project accompaniment', precio: 'USD 40 / session', desc: 'Monthly package · 4 sessions' },
];

const PASOS = [
  { n: '01', title: 'Book your session', desc: 'Write to us on WhatsApp with your topic and available times.' },
  { n: '02', title: 'Fill in the form', desc: 'We send you a brief questionnaire to get the most out of the session.' },
  { n: '03', title: 'Video call', desc: 'We meet by video call (Google Meet or Zoom) at your confirmed time.' },
  { n: '04', title: 'Summary + follow-up', desc: 'You receive a written summary within 24 hours and can follow up for 48 hours.' },
];

export default function AsesoriasEnPage() {
  return (
    <>
      <SiteHeader locale="en" />
      <main>
        {/* HERO */}
        <section className="bg-ink-950 py-24 px-6">
          <div className="max-w-editorial mx-auto">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">Online consultations · Worldwide</p>
            <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-3xl">
              Expert guidance for <em>your project.</em>
            </h1>
            <p className="mt-5 font-sans text-base text-bone-200 max-w-2xl leading-relaxed">
              Bioarchitecture, regenerative hydrology and permaculture — by video call, wherever you are. One session can open up an entire path.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="https://wa.me/5493549431594?text=Hello%2C%20I%27d%20like%20to%20book%20a%20consultation"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors"
              >
                Book a session →
              </a>
            </div>
          </div>
        </section>

        {/* TOPICS */}
        <section className="bg-bone-50 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="mb-12">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">What we can cover</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950">Topics we <em>work on.</em></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {TEMAS.map(t => (
                <div key={t.title} className="bg-bone-100 p-6">
                  <div className="text-3xl mb-3">{t.icon}</div>
                  <h3 className="font-display text-lg text-ink-950 mb-2">{t.title}</h3>
                  <p className="font-sans text-xs text-ink-700 leading-relaxed">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHAT IS INCLUDED */}
        <section className="bg-ink-950 py-20 px-6">
          <div className="max-w-editorial mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {INCLUYE.map(item => (
              <div key={item.text} className="flex items-start gap-4 bg-ink-800 p-8">
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <p className="font-sans text-sm text-bone-200 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section className="bg-bone-100 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="mb-10">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">Investment</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950">Rates.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl mb-10">
              {PRECIOS.map(p => (
                <div key={p.tipo} className={`p-8 ${p.featured ? 'bg-clay-700' : 'bg-bone-50'}`}>
                  {p.featured && <span className="text-xs font-sans font-bold text-ink-950 bg-bone-50 px-2 py-1 inline-block mb-4">RECOMMENDED</span>}
                  <p className={`font-sans text-xs font-bold uppercase tracking-widest mb-2 ${p.featured ? 'text-clay-300' : 'text-clay-700'}`}>{p.tipo}</p>
                  <p className={`font-display text-3xl mb-2 ${p.featured ? 'text-bone-50' : 'text-ink-950'}`}>{p.precio}</p>
                  <p className={`font-sans text-xs ${p.featured ? 'text-bone-200/70' : 'text-ink-700/70'}`}>{p.desc}</p>
                </div>
              ))}
            </div>
            <a
              href="https://wa.me/5493549431594?text=Hello%2C%20I%27d%20like%20to%20book%20a%20consultation"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors"
            >
              Book on WhatsApp →
            </a>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="bg-bone-50 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="mb-12 text-center">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">Process</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950">How it <em>works.</em></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {PASOS.map(p => (
                <div key={p.n} className="text-center">
                  <p className="font-display text-5xl text-clay-700 mb-4">{p.n}</p>
                  <h3 className="font-display text-xl text-ink-950 mb-2">{p.title}</h3>
                  <p className="font-sans text-sm text-ink-700 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-clay-700 py-20 px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl text-bone-50 mb-5">
            Ready to start <em>building?</em>
          </h2>
          <p className="font-sans text-base text-bone-200 max-w-md mx-auto mb-8 leading-relaxed">
            Write to us and we will find the best time for your consultation.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="https://wa.me/5493549431594?text=Hello%2C%20I%27d%20like%20to%20book%20a%20consultation"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex bg-bone-50 text-clay-900 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-bone-100 transition-colors"
            >
              Book on WhatsApp →
            </a>
            <Link href="/en/contacto" className="inline-flex border border-bone-50/50 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:border-bone-50 transition-colors">
              Contact form
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
