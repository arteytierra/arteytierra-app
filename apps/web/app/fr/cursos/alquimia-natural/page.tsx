import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Alchimie Naturelle et Nettoyage Conscient — Atelier à Tay Pichín | Arte y Tierra',
  description: 'Cycle d\'ateliers présentiels à l\'EcoÉcole Tay Pichín pour transformer la toxicité du quotidien en solutions durables : savons, déodorants et produits d\'hygiène naturels.',
  alternates: { canonical: '/fr/cursos/alquimia-natural' },
};

const CONTENIDOS = [
  { n: '01', title: 'Savon naturel à partir d\'huile usagée', desc: 'Processus de saponification, formules de base, aromates et pigments naturels.' },
  { n: '02', title: 'Déodorant corporel naturel', desc: 'Formules efficaces qui respectent votre microbiome. Sans aluminium ni produits chimiques.' },
  { n: '03', title: 'Produits ménagers', desc: 'Détergents, nettoyants multi-surfaces et désinfectants à partir d\'ingrédients simples.' },
  { n: '04', title: 'Cosmétiques simples', desc: 'Crèmes hydratantes, baumes et soins à partir d\'huiles végétales et d\'extraits naturels.' },
  { n: '05', title: 'Ferments et probiotiques', desc: 'Introduction aux ferments pour l\'hygiène et l\'alimentation.' },
  { n: '06', title: 'Conservation et packaging', desc: 'Comment conserver, étiqueter et partager vos productions.' },
];

export default function AlquimiaNaturalFrPage() {
  return (
    <>
      <SiteHeader locale="fr" />
      <main>
        {/* HERO */}
        <section className="relative h-[60vh] min-h-[420px] bg-ink-950 flex items-end overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #3D5535, #3D2010)' }}>
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />
          <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-16">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">
              Cycle d'Ateliers Présentiels · EcoÉcole Tay Pichín
            </p>
            <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-3xl">
              Alchimie Naturelle<br />et <em>Nettoyage Conscient.</em>
            </h1>
            <p className="mt-5 font-sans text-base text-bone-200 max-w-2xl leading-relaxed">
              Une formation présentielle à l'EcoÉcole de Permaculture Tay Pichín pour transformer la toxicité de notre quotidien en <em>solutions durables.</em>
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="https://wa.me/5493549431594?text=Bonjour%2C%20je%20souhaite%20m%27inscrire%20%C3%A0%20l%27atelier%20Alchimie%20Naturelle" target="_blank" rel="noopener noreferrer" className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors">
                M'inscrire →
              </a>
              <Link href="/fr/cursos" className="inline-flex border border-bone-50/50 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:border-bone-50 transition-colors">
                Voir toutes les formations →
              </Link>
            </div>
          </div>
        </section>

        {/* INTRO */}
        <section className="bg-bone-50 py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">C'est pour vous ?</p>
            <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-8 leading-tight">
              Récupérez votre <em>souveraineté</em><br />sur ce qui entre chez vous.
            </h2>
            <p className="font-sans text-base text-ink-700 leading-relaxed mb-6">
              Vous voulez vivre en plus grande cohérence avec la nature mais ne savez pas par où commencer ? Vous avez peut-être déjà changé votre alimentation, mais votre salle de bain reste pleine de flacons remplis de produits chimiques non naturels ?
            </p>
            <p className="font-sans text-base font-bold text-ink-950 mb-6">Ce cycle d'ateliers est pour vous.</p>
            <p className="font-sans text-base text-ink-700 leading-relaxed">
              Nous allons apprendre à transformer des ingrédients simples et nobles en solutions d'hygiène : du savon à base d'huile usagée jusqu'aux déodorants corporels qui <em>fonctionnent vraiment</em> et respectent votre santé.
            </p>
          </div>
        </section>

        {/* DONNÉES CLÉS */}
        <section className="bg-bone-100 py-12 px-6">
          <div className="max-w-editorial mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Quand ?', value: '3e samedi du mois', sub: 'Mai à Décembre 2026' },
              { label: 'Où ?', value: 'EcoÉcole Tay Pichín', sub: 'San Marcos Sierras, Córdoba' },
              { label: 'Modalité', value: 'Présentiel', sub: '8 séances ou à la séance' },
              { label: 'Places', value: 'Limitées', sub: 'Inscriptions requises' },
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
                Ce que nous <em>allons créer.</em>
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

        {/* INSCRIPTION */}
        <section className="bg-bone-50 py-20 px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-5">
            Rejoignez le <em>prochain atelier.</em>
          </h2>
          <p className="font-sans text-base text-ink-700 max-w-md mx-auto mb-8 leading-relaxed">
            Chaque 3e samedi du mois à l'EcoÉcole Tay Pichín. Places limitées.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="https://wa.me/5493549431594?text=Bonjour%2C%20je%20souhaite%20m%27inscrire%20%C3%A0%20l%27atelier%20Alchimie%20Naturelle"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors"
            >
              M'inscrire par WhatsApp →
            </a>
            <Link href="/fr/contacto" className="inline-flex border border-ink-950 text-ink-950 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-ink-950 hover:text-bone-50 transition-colors">
              Nous écrire
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
