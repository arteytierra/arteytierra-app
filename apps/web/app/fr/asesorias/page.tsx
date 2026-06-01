import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Consultation en ligne — Design Régénératif | Arte y Tierra',
  description: 'Consultation personnalisée en bioconstruction, hydrologie régénérative, bioarchitecture et permaculture. Visioconférence 1h + rapport écrit. À partir de USD 30.',
  alternates: { canonical: '/fr/asesorias' },
};

const TOPICS = [
  { icon: '💧', label: 'Gestion de l\'eau et hydrologie' },
  { icon: '🏠', label: 'Bioarchitecture et habitat naturel' },
  { icon: '🌱', label: 'Permaculture et agroécologie' },
  { icon: '🍄', label: 'Fungiculture et champignons' },
  { icon: '♻️', label: 'Phytoépuration et eaux usées' },
  { icon: '🌿', label: 'Bioclimatisme et efficacité énergétique' },
  { icon: '🌎', label: 'Stratégie régénérative intégrale' },
  { icon: '📐', label: 'Design territorial' },
];

const INCLUYE = [
  { icon: '📹', title: 'Visioconférence 1 heure', desc: 'Séance en direct via Google Meet. Nous travaillons votre situation spécifique en profondeur.' },
  { icon: '📄', title: 'Rapport écrit', desc: 'Document reprenant tout ce qui a été travaillé en séance : recommandations, étapes à suivre et ressources spécifiques pour votre projet. Livré sous 3 jours ouvrés.' },
  { icon: '🌍', title: '100% à distance', desc: 'Depuis n\'importe quel endroit dans le monde. Nous coordonnons le fuseau horaire, la langue et le format.' },
];

const PRECIOS = [
  { title: 'Consultation 1 sujet', price: 'USD 30', desc: '1 heure · 1 thème central · Rapport écrit', featured: false },
  { title: 'Consultation intégrale', price: 'USD 60', desc: '1 heure · thèmes multiples · Rapport complet', featured: true },
  { title: 'Suivi de projet', price: 'USD 40 / séance', desc: 'Accompagnement régulier de votre projet en cours', featured: false },
];

export default function AsesoriasFrPage() {
  return (
    <>
      <SiteHeader locale="fr" />
      <main>
        {/* HERO */}
        <section className="relative h-[70vh] min-h-[500px] bg-ink-950 flex items-end overflow-hidden">
          <Image
            src="/img/asesorias/1.jpg"
            alt="Consultation en ligne Arte y Tierra"
            fill priority className="object-cover" sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/40 to-transparent" />
          <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-16">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">
              Consultation en ligne · Design Régénératif
            </p>
            <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-3xl">
              Votre projet commence<br />avec les <em>bonnes questions.</em>
            </h1>
            <p className="mt-5 font-sans text-base text-bone-200 max-w-2xl leading-relaxed">
              Consultation personnalisée d'1 heure en visioconférence, plus un rapport écrit reprenant tout ce qui a été travaillé. Peu importe où vous êtes dans le monde.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="https://wa.me/5493549431594?text=Bonjour%2C%20je%20souhaite%20r%C3%A9server%20une%20consultation"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors"
              >
                Réserver par WhatsApp →
              </a>
              <Link href="/fr/contacto" className="inline-flex border border-bone-50/50 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:border-bone-50 transition-colors">
                Nous écrire →
              </Link>
            </div>
          </div>
        </section>

        {/* CE QUI EST INCLUS */}
        <section className="bg-bone-50 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">Ce qui est inclus</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950">
                Conseils d'experts,<br /><em>action concrète.</em>
              </h2>
              <p className="mt-4 font-sans text-sm text-ink-700 max-w-md mx-auto">
                Chaque consultation est centrée sur un seul sujet pour que vous puissiez tirer le maximum de la séance.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {INCLUYE.map(item => (
                <div key={item.title} className="bg-bone-100 p-8 border-t-4 border-clay-700">
                  <div className="text-3xl mb-4">{item.icon}</div>
                  <h3 className="font-sans font-bold text-base text-ink-950 mb-3">{item.title}</h3>
                  <p className="font-sans text-sm text-ink-700 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SUJETS */}
        <section className="bg-ink-950 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="mb-10">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">Sujets disponibles</p>
              <h2 className="font-display text-4xl md:text-5xl text-bone-50">
                Choisissez votre <em>domaine.</em>
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {TOPICS.map(t => (
                <div key={t.label} className="flex items-center gap-3 p-5 bg-ink-800 border border-clay-700/20">
                  <span className="text-2xl flex-shrink-0">{t.icon}</span>
                  <span className="font-sans text-sm text-bone-200">{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TARIFS */}
        <section className="bg-bone-100 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">Tarifs</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950">
                Investissement.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {PRECIOS.map(p => (
                <div key={p.title} className={`p-8 flex flex-col gap-4 text-center ${p.featured ? 'bg-clay-700 text-bone-50' : 'bg-bone-50'}`}>
                  {p.featured && <span className="text-xs font-sans font-bold uppercase tracking-widest text-ink-950 bg-bone-50 px-3 py-1 self-center">Recommandé</span>}
                  <h3 className={`font-display text-xl ${p.featured ? 'text-bone-50' : 'text-ink-950'}`}>{p.title}</h3>
                  <p className={`font-display text-4xl ${p.featured ? 'text-bone-100' : 'text-clay-700'}`}>{p.price}</p>
                  <p className={`font-sans text-sm leading-relaxed ${p.featured ? 'text-bone-200' : 'text-ink-700'}`}>{p.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <a
                href="https://wa.me/5493549431594?text=Bonjour%2C%20je%20souhaite%20r%C3%A9server%20une%20consultation"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors"
              >
                Réserver maintenant →
              </a>
            </div>
          </div>
        </section>

        {/* COMMENT ÇA MARCHE */}
        <section className="bg-ink-950 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="mb-12">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">Comment ça marche</p>
              <h2 className="font-display text-4xl md:text-5xl text-bone-50">
                Simple et <em>direct.</em>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { n: '01', title: 'Réservez', desc: 'Choisissez votre sujet et contactez-nous via WhatsApp ou email.' },
                { n: '02', title: 'Coordonnez', desc: 'Nous accordons date, heure et fuseau horaire — en ES, EN ou FR.' },
                { n: '03', title: 'Consultez', desc: '1 heure de visioconférence sur Google Meet. Travail approfondi sur votre cas.' },
                { n: '04', title: 'Recevez', desc: 'Rapport écrit complet dans les 3 jours ouvrés.' },
              ].map(s => (
                <div key={s.n} className="border-t-2 border-clay-700 pt-6">
                  <p className="font-display text-4xl text-clay-700 mb-3">{s.n}</p>
                  <h3 className="font-sans font-bold text-base text-bone-50 mb-2">{s.title}</h3>
                  <p className="font-sans text-sm text-bone-200 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
