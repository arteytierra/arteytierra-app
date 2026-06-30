import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Natural Alchemy & Conscious Cleaning — Workshop at Tay Pichín',
  description: 'Monthly in-person workshop cycle at EcoSchool Tay Pichín to transform everyday toxicity into sustainable solutions: natural soaps, deodorants and hygiene products.',
  alternates: { canonical: '/en/cursos/alquimia-natural' },
};

const CONTENIDOS = [
  { n: '01', title: 'Natural soap from used oil', desc: 'Saponification process, basic formulas, natural aromatics and pigments.' },
  { n: '02', title: 'Natural body deodorant', desc: 'Effective formulas that respect your microbiome. Aluminium-free and chemical-free.' },
  { n: '03', title: 'Household products', desc: 'Detergents, multi-surface cleaners and disinfectants from simple ingredients.' },
  { n: '04', title: 'Simple cosmetics', desc: 'Moisturising creams, balms and skincare from vegetable oils and natural extracts.' },
  { n: '05', title: 'Ferments & probiotics', desc: 'Introduction to ferments for hygiene and nutrition.' },
  { n: '06', title: 'Preservation & packaging', desc: 'How to store, label and share your productions.' },
];

export default function AlquimiaNaturalEnPage() {
  return (
    <>
      <SiteHeader locale="en" />
      <main>
        {/* HERO */}
        <section className="relative h-[60vh] min-h-[420px] bg-ink-950 flex items-end overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #3D5535, #3D2010)' }}>
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />
          <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-16">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">
              Monthly In-Person Workshop · EcoSchool Tay Pichín
            </p>
            <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-3xl">
              Natural Alchemy<br />& <em>Conscious Cleaning.</em>
            </h1>
            <p className="mt-5 font-sans text-base text-bone-200 max-w-2xl leading-relaxed">
              An in-person training at the Permaculture EcoSchool Tay Pichín to transform everyday toxicity into <em>sustainable solutions.</em>
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="https://wa.me/5493549431594?text=Hello%2C%20I%27d%20like%20to%20join%20the%20Natural%20Alchemy%20workshop" target="_blank" rel="noopener noreferrer" className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors">
                Join →
              </a>
              <Link href="/en/cursos" className="inline-flex border border-bone-50/50 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:border-bone-50 transition-colors">
                All courses →
              </Link>
            </div>
          </div>
        </section>

        {/* INTRO */}
        <section className="bg-bone-50 py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">Is this for you?</p>
            <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-8 leading-tight">
              Reclaim your <em>sovereignty</em><br />over what enters your home.
            </h2>
            <p className="font-sans text-base text-ink-700 leading-relaxed mb-6">
              You want to live in greater harmony with nature but don&apos;t know where to start? Maybe you have already changed your diet, but your bathroom is still full of bottles loaded with non-natural chemicals?
            </p>
            <p className="font-sans text-base font-bold text-ink-950 mb-6">This workshop cycle is for you.</p>
            <p className="font-sans text-base text-ink-700 leading-relaxed">
              We will learn to transform simple, wholesome ingredients into hygiene solutions: from soap made from used cooking oil to body deodorants that <em>actually work</em> and respect your health.
            </p>
          </div>
        </section>

        {/* KEY DATA */}
        <section className="bg-bone-100 py-12 px-6">
          <div className="max-w-editorial mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'When?', value: '3rd Saturday of the month', sub: 'May to December 2026' },
              { label: 'Where?', value: 'EcoSchool Tay Pichín', sub: 'San Marcos Sierras, Córdoba' },
              { label: 'Modality', value: 'In-person', sub: '8 sessions or individual' },
              { label: 'Places', value: 'Limited', sub: 'Registration required' },
            ].map(d => (
              <div key={d.label} className="bg-bone-50 p-5 border-l-4 border-clay-700">
                <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-2">{d.label}</p>
                <p className="font-display text-base text-ink-950">{d.value}</p>
                <p className="font-sans text-xs text-ink-700/70 mt-1">{d.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PROGRAMME */}
        <section className="bg-ink-950 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="mb-12">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">Programme</p>
              <h2 className="font-display text-4xl md:text-5xl text-bone-50">
                What we will <em>create.</em>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {CONTENIDOS.map(c => (
                <div key={c.n} className="bg-ink-800 p-7 border-t-2 border-clay-700">
                  <p className="font-display text-3xl text-clay-700 mb-3">{c.n}</p>
                  <h3 className="font-sans font-bold text-base text-bone-100 mb-2">{c.title}</h3>
                  <p className="font-sans text-sm text-bone-200 leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* REGISTRATION */}
        <section className="bg-bone-50 py-20 px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-5">
            Join the <em>next workshop.</em>
          </h2>
          <p className="font-sans text-base text-ink-700 max-w-md mx-auto mb-8 leading-relaxed">
            Every 3rd Saturday of the month at EcoSchool Tay Pichín. Limited places.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="https://wa.me/5493549431594?text=Hello%2C%20I%27d%20like%20to%20join%20the%20Natural%20Alchemy%20workshop"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors"
            >
              Join on WhatsApp →
            </a>
            <Link href="/en/contacto" className="inline-flex border border-ink-950 text-ink-950 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-ink-950 hover:text-bone-50 transition-colors">
              Write to us
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
