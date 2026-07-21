import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Immersion Vivante — Tay Pichín',
  description: 'Immersion Vivante à Tay Pichín : périodes de formation aux pratiques permaculturelles, bioconstruction et agroécologie sur le territoire. San Marcos Sierras, Córdoba.',
  alternates: { canonical: '/fr/cursos/inmersion-viva' },
};

const AREAS = [
  {
    icon: '🏗',
    title: 'Bioconstruction',
    items: ['Techniques en terre crue', 'Lecture et usage des matériaux locaux', 'Critères constructifs en chantier réel'],
  },
  {
    icon: '🌱',
    title: 'Agroécologie',
    items: ['Gestion du potager et des systèmes vivants', 'Sol, compost et bio-intrants', 'Intégration des animaux et cycles productifs'],
  },
  {
    icon: '💧',
    title: 'Gestion de l\'eau',
    items: ['Récupération des eaux de pluie', 'Phytoépuration des eaux grises', 'Observation et lecture du cycle de l\'eau'],
  },
  {
    icon: '🤝',
    title: 'Vie communautaire',
    items: ['Prise de décision collective', 'Économie communautaire', 'Convivialité et organisation du quotidien'],
  },
];

export default function InmersionVivaFrPage() {
  return (
    <>
      <SiteHeader locale="fr" />
      <main>
        {/* HERO */}
        <section className="relative h-[70vh] min-h-[500px] bg-ink-950 flex items-end overflow-hidden">
          <Image
            src="/img/taypichin/carousel/5.jpg"
            alt="Immersion Vivante — Tay Pichín"
            fill priority className="object-cover" sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/40 to-transparent" />
          <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-16">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">
              🌿 Immersion Vivante · Tay Pichín
            </p>
            <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-3xl">
              Immersion <em>Vivante.</em>
            </h1>
            <p className="mt-3 font-display text-xl text-clay-300 italic">
              Périodes de formation aux pratiques permaculturelles.
            </p>
            <p className="mt-4 font-sans text-base text-bone-200 max-w-2xl leading-relaxed">
              Bioconstruction, agroécologie et organisation collective — apprises dans la pratique quotidienne, intégrées au travail, à la convivialité et à la vie sur le territoire.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="https://wa.me/5493549431594?text=Bonjour%2C%20je%20voudrais%20des%20informations%20sur%20l%27Immersion%20Vivante" target="_blank" rel="noopener noreferrer" className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors">
                Demander une place →
              </a>
              <Link href="/fr/tay-pichin" className="inline-flex border border-bone-50/50 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:border-bone-50 transition-colors">
                En savoir plus sur Tay Pichín →
              </Link>
            </div>
          </div>
        </section>

        {/* APPROCHE */}
        <section className="bg-bone-50 py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">Approche</p>
            <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-8 leading-tight">
              On apprend en <em>faisant,</em><br />en partageant et en soutenant<br />ensemble.
            </h2>
            <p className="font-sans text-base text-ink-700 leading-relaxed">
              Immersion Vivante est un processus où la bioconstruction, l'agroécologie et l'organisation collective s'apprennent dans la pratique quotidienne — intégrées au travail, à la convivialité et à la vie sur le territoire. L'apprentissage se déroule dans un espace vivant, où la construction, la production et la vie quotidienne font partie d'un même système. Pendant votre séjour, vous prenez part à des processus réels et intégrez une façon d'habiter plus consciente, simple et reliée à la terre.
            </p>
          </div>
        </section>

        {/* CE QUE VOUS APPRENDREZ */}
        <section className="bg-ink-950 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">Formation appliquée</p>
              <h2 className="font-display text-4xl md:text-5xl text-bone-50">
                Qu'allez-vous <em>apprendre ?</em>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {AREAS.map(a => (
                <div key={a.title} className="bg-ink-800 p-8">
                  <div className="text-3xl mb-4">{a.icon}</div>
                  <h3 className="font-display text-2xl text-bone-50 mb-4">{a.title}</h3>
                  <ul className="flex flex-col gap-2">
                    {a.items.map(item => (
                      <li key={item} className="flex items-start gap-3 font-sans text-sm text-bone-200">
                        <div className="w-1.5 h-1.5 rounded-full bg-clay-700 flex-shrink-0 mt-1.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MODALITÉS */}
        <section className="bg-bone-50 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="mb-10">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">Modalités et tarifs</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950">Comment <em>participer.</em></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mb-10">
              <div className="bg-ink-950 p-10">
                <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">Processus Initial</p>
                <hr className="border-clay-700/30 mb-6" />
                <p className="font-sans text-sm text-bone-200 leading-relaxed mb-4">
                  <strong className="text-bone-100">Camping</strong> — repas de base et hébergement en zone de camping.
                </p>
                <p className="font-display text-3xl text-clay-700">$40.000 ARS / sem.</p>
              </div>
              <div className="bg-clay-900 p-10">
                <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-400 mb-4">Processus Profond</p>
                <hr className="border-clay-700/30 mb-6" />
                <p className="font-sans text-sm text-bone-200 leading-relaxed mb-4">
                  <strong className="text-bone-100">Chambre partagée</strong> — repas de base et chambre partagée.
                </p>
                <p className="font-display text-3xl text-clay-700">$80.000 ARS / sem.</p>
              </div>
            </div>
            <div className="bg-clay-700/10 border border-clay-700/30 p-6 max-w-2xl mb-8">
              <p className="font-sans text-sm font-bold text-clay-700 mb-2">📅 L'arrivée se fait uniquement les lundis.</p>
              <p className="font-sans text-sm text-ink-700">Minimum 2 semaines. Possibilité d'étendre au mois ou plus selon disponibilité.</p>
            </div>
            <a
              href="https://wa.me/5493549431594?text=Bonjour%2C%20je%20voudrais%20des%20informations%20sur%20l%27Immersion%20Vivante"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors"
            >
              Demander une place par WhatsApp →
            </a>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-ink-950 py-20 px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl text-bone-50 mb-5">
            Rejoignez <em>Tay Pichín.</em>
          </h2>
          <p className="font-sans text-base text-bone-200 max-w-md mx-auto mb-8 leading-relaxed">
            Écrivez-nous avec vos dates souhaitées, votre expérience et ce qui vous amène ici.
          </p>
          <Link href="/fr/contacto" className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors">
            Nous écrire →
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
