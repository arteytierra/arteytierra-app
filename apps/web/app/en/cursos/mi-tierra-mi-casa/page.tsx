import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Mi Tierra Mi Casa — Online Natural Building Course',
  description: 'Online natural building course — 4 modules, 18 lessons, video call support. Learn biobuilding at your own pace, from anywhere in the world.',
  alternates: { canonical: '/en/cursos/mi-tierra-mi-casa' },
};

const MODULOS = [
  {
    n: 'Module 1',
    title: 'Foundations & territory',
    cursos: 4,
    desc: 'Reading the land, orientation, dowsing and bioclimatic design principles. How the territory guides every construction decision.',
  },
  {
    n: 'Module 2',
    title: 'Natural materials',
    cursos: 5,
    desc: 'Adobe, cob, quincha, rammed earth and straw. Properties, mixes and applications adapted to each climate and context.',
  },
  {
    n: 'Module 3',
    title: 'Construction systems',
    cursos: 5,
    desc: 'Load-bearing walls and infill, roofs, finish plasters. Construction details and connections between systems.',
  },
  {
    n: 'Module 4',
    title: 'Discernment & practice',
    cursos: 4,
    desc: 'How to decide, plan and execute. Natural building site management, community and participatory processes. Closing and synthesis.',
  },
];

const INCLUYE = [
  { icon: '📹', text: '18 video lessons + PDF materials' },
  { icon: '💬', text: 'Community group access' },
  { icon: '🎥', text: 'Live video call sessions (monthly calendar)' },
  { icon: '🔓', text: 'Unlimited access — at your own pace' },
  { icon: '🌎', text: 'From anywhere in the world' },
  { icon: '📜', text: 'Certificate of participation' },
];

export default function MiTierraMiCasaEnPage() {
  return (
    <>
      <SiteHeader locale="en" />
      <main>
        {/* HERO */}
        <section className="relative h-[70vh] min-h-[500px] bg-ink-950 flex items-end overflow-hidden">
          <Image
            src="/img/cursos/mitierramicasa/1.jpg"
            alt="Mi Tierra Mi Casa — Online biobuilding course"
            fill priority className="object-cover" sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/40 to-transparent" />
          <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-16">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">
              Online Course · Natural Building
            </p>
            <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-3xl">
              Mi Tierra,<br /><em>Mi Casa.</em>
            </h1>
            <p className="mt-5 font-sans text-base text-bone-200 max-w-2xl leading-relaxed">
              A training that invites you to remember and experience biobuilding — and to recover the ancient habit of building a home together as a community.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="https://wa.me/5493549431594?text=Hello%2C%20I%27d%20like%20to%20enroll%20in%20Mi%20Tierra%20Mi%20Casa"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors"
              >
                Enroll — USD 80 →
              </a>
              <Link href="/en/cursos" className="inline-flex border border-bone-50/50 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:border-bone-50 transition-colors">
                All courses →
              </Link>
            </div>
          </div>
        </section>

        {/* WELCOME */}
        <section className="bg-bone-50 py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">Welcome</p>
            <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-8 leading-tight">
              Building your home<br />as a <em>living act.</em>
            </h2>
            <p className="font-sans text-base text-ink-700 leading-relaxed mb-8">
              Just as every species on this planet builds its home or shelter, this training reconnects you to that ancestral knowledge. It invites you to create your own learning process through the study of multimedia files that promote the use of natural materials, tools and — above all — the development of your own judgment.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'When?', value: 'Whenever you want.' },
                { label: 'Where?', value: 'Wherever you are.' },
                { label: 'How?', value: '100% online · unlimited access.' },
              ].map(d => (
                <div key={d.label} className="bg-bone-100 p-5 border-l-4 border-clay-700 text-left">
                  <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-2">{d.label}</p>
                  <p className="font-display text-lg text-ink-950">{d.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* VIDEO */}
        <section className="bg-bone-100 py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">The course in 2 minutes</p>
              <h2 className="font-display text-3xl text-ink-950 mb-2">A presentation of the <em>course.</em></h2>
              <p className="font-sans text-sm text-ink-700 italic">(In Spanish.)</p>
            </div>
            <div className="relative aspect-video bg-ink-950 overflow-hidden">
              <iframe
                className="absolute inset-0 w-full h-full border-0"
                src="https://www.youtube.com/embed/Fak9xHjoivQ"
                title="Mi Tierra Mi Casa — promotional video"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        {/* 4 MODULES */}
        <section className="bg-ink-950 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">Course content</p>
              <h2 className="font-display text-4xl md:text-5xl text-bone-50">
                4 modules · <em>18 lessons.</em>
              </h2>
              <p className="mt-4 font-sans text-sm text-bone-200 max-w-xl mx-auto">
                A progression covering all stages of a natural building project — from foundations to discernment.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MODULOS.map((m, i) => (
                <div key={i} className="bg-ink-800 p-8 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500">{m.n}</p>
                    <span className="text-xs font-sans text-clay-500">{m.cursos} lessons</span>
                  </div>
                  <h3 className="font-display text-2xl text-bone-50">{m.title}</h3>
                  <p className="font-sans text-sm text-bone-200 leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHAT IS INCLUDED */}
        <section className="bg-bone-100 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="mb-12">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">What is included</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950">Everything to <em>learn.</em></h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {INCLUYE.map(item => (
                <div key={item.text} className="flex items-start gap-4 p-5 bg-bone-50">
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <p className="font-sans text-sm text-ink-700 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ENROLL */}
        <section className="bg-clay-700 py-20 px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl text-bone-50 mb-5">
            Start your<br /><em>journey.</em>
          </h2>
          <p className="font-sans text-base text-bone-200 max-w-md mx-auto mb-3 leading-relaxed">
            Lifetime access · USD 80 · Payment in 3 instalments available.
          </p>
          <p className="font-sans text-sm text-bone-200/70 mb-8">We process access within 24 working hours.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="https://wa.me/5493549431594?text=Hello%2C%20I%27d%20like%20to%20enroll%20in%20Mi%20Tierra%20Mi%20Casa"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex bg-bone-50 text-clay-900 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-bone-100 transition-colors"
            >
              Enroll on WhatsApp →
            </a>
            <Link href="/en/contacto" className="inline-flex border border-bone-50/50 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:border-bone-50 transition-colors">
              More information
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
