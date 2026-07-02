import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Notre Boutique',
  description:
    'La boutique Arte y Tierra · Tay Pichín : biocosmétique agroécologique artisanale et manuels de construction naturelle et de conception du territoire.',
  alternates: { canonical: '/fr/tienda' },
};

const CARDS = [
  {
    eyebrow: 'Biocosmétique',
    title: 'Biocosmétique agroécologique',
    body: 'Baumes, teintures mères et répulsifs élaborés artisanalement à Tay Pichín, avec les plantes de notre propre agroécosystème.',
    href: '/fr/biocosmetica',
    cta: 'Voir les produits',
  },
  {
    eyebrow: 'Manuels',
    title: 'Manuels & ebooks',
    body: 'Guides numériques de construction naturelle, conception hydrologique et régénération du territoire. Téléchargez et apprenez à votre rythme.',
    href: '/fr/ebooks',
    cta: 'Voir les manuels',
  },
];

export default function TiendaFrPage() {
  return (
    <>
      <SiteHeader locale="fr" />
      <main>
        {/* HERO */}
        <section className="bg-moss-900 py-24 px-6">
          <div className="max-w-editorial mx-auto">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-bone-50/60 mb-4">
              Arte y Tierra · Tay Pichín
            </p>
            <h1 className="font-display text-5xl md:text-7xl text-bone-50 leading-tight max-w-3xl mb-6">
              Notre <em>Boutique.</em>
            </h1>
            <p className="font-sans text-base md:text-lg text-bone-200 max-w-2xl leading-relaxed">
              Ce que nous produisons et apprenons, devenu produit. Biocosmétique agroécologique artisanale et manuels pour
              porter ces pratiques sur votre propre territoire.
            </p>
          </div>
        </section>

        {/* CARDS */}
        <section className="bg-bone-50 py-20 px-6">
          <div className="max-w-editorial mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {CARDS.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="group flex flex-col bg-white border border-ink-950/10 p-8 hover:border-ink-950/30 transition-colors"
              >
                <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">— {c.eyebrow}</p>
                <h2 className="font-display text-2xl md:text-3xl text-ink-950 mb-4 leading-tight">{c.title}</h2>
                <p className="font-sans text-sm text-ink-700 leading-relaxed mb-8 flex-1">{c.body}</p>
                <span className="font-sans font-bold text-sm uppercase tracking-widest text-clay-700 group-hover:text-clay-900 transition-colors">
                  {c.cta} →
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
