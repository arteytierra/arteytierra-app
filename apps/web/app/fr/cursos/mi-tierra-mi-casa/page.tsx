import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Mi Tierra Mi Casa — Formation en Ligne de Construction Naturelle | Arte y Tierra',
  description: 'Formation virtuelle en construction naturelle — 4 modules, 18 cours, accompagnement par visioconférence. Apprenez la bioconstruction à votre rythme, depuis n\'importe où dans le monde.',
  alternates: { canonical: '/fr/cursos/mi-tierra-mi-casa' },
};

const MODULOS = [
  {
    n: 'Module 1',
    title: 'Fondations et territoire',
    cursos: 4,
    desc: 'Lecture du terrain, orientation, radiesthésie et principes du design bioclimatique. Comment le territoire guide chaque décision constructive.',
  },
  {
    n: 'Module 2',
    title: 'Matériaux naturels',
    cursos: 5,
    desc: 'Adobe, cob, quincha, pisé et paille. Propriétés, mélanges et applications adaptées à chaque climat et contexte.',
  },
  {
    n: 'Module 3',
    title: 'Systèmes constructifs',
    cursos: 5,
    desc: 'Murs porteurs et remplissages, toitures, enduits de finition. Détails constructifs et connexions entre systèmes.',
  },
  {
    n: 'Module 4',
    title: 'Discernement et pratique',
    cursos: 4,
    desc: 'Comment décider, planifier et exécuter. Gestion de chantier naturel, communauté et processus participatifs. Clôture et synthèse.',
  },
];

const INCLUYE = [
  { icon: '📹', text: '18 cours vidéo + matériaux en PDF' },
  { icon: '💬', text: 'Accès au groupe de communauté' },
  { icon: '🎥', text: 'Séances de visioconférence en direct (calendrier mensuel)' },
  { icon: '🔓', text: 'Accès illimité — à votre rythme' },
  { icon: '🌎', text: 'Depuis n\'importe où dans le monde' },
  { icon: '📜', text: 'Certificat de participation' },
];

export default function MiTierraMiCasaFrPage() {
  return (
    <>
      <SiteHeader locale="fr" />
      <main>
        {/* HERO */}
        <section className="relative h-[70vh] min-h-[500px] bg-ink-950 flex items-end overflow-hidden">
          <Image
            src="/img/cursos/mitierramicasa/1.jpg"
            alt="Mi Tierra Mi Casa — Formation en ligne de bioconstruction"
            fill priority className="object-cover" sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/40 to-transparent" />
          <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-16">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">
              Formation en Ligne · Construction Naturelle
            </p>
            <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-3xl">
              Mi Tierra,<br /><em>Mi Casa.</em>
            </h1>
            <p className="mt-5 font-sans text-base text-bone-200 max-w-2xl leading-relaxed">
              Une formation qui vous invite à vous remémorer et à vivre l'expérience de la bioconstruction — et à retrouver l'antique habitude de construire un foyer de manière communautaire.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="https://wa.me/5493549431594?text=Bonjour%2C%20je%20souhaite%20m%27inscrire%20%C3%A0%20Mi%20Tierra%20Mi%20Casa"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors"
              >
                M'inscrire — USD 80 →
              </a>
              <Link href="/fr/cursos" className="inline-flex border border-bone-50/50 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:border-bone-50 transition-colors">
                Voir toutes les formations →
              </Link>
            </div>
          </div>
        </section>

        {/* BIENVENUE */}
        <section className="bg-bone-50 py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">Bienvenue</p>
            <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-8 leading-tight">
              Construire votre maison<br />comme un <em>acte vivant.</em>
            </h2>
            <p className="font-sans text-base text-ink-700 leading-relaxed mb-8">
              Tout comme chaque espèce de cette planète construit sa maison ou son refuge, cette formation vous reconnecte à ce savoir ancestral. Elle vous invite à créer votre propre processus d'apprentissage à travers l'étude de fichiers multimédias qui favorisent l'usage de matériaux naturels, d'outils et — surtout — le développement de votre propre jugement.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Quand ?', value: 'Quand vous voulez.' },
                { label: 'Où ?', value: 'Où que vous soyez.' },
                { label: 'Comment ?', value: '100% en ligne · accès illimité.' },
              ].map(d => (
                <div key={d.label} className="bg-bone-100 p-5 border-l-4 border-clay-700 text-left">
                  <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-2">{d.label}</p>
                  <p className="font-display text-lg text-ink-950">{d.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* VIDÉO */}
        <section className="bg-bone-100 py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">La formation en 2 minutes</p>
              <h2 className="font-display text-3xl text-ink-950 mb-2">Une présentation de la <em>formation.</em></h2>
              <p className="font-sans text-sm text-ink-700 italic">(En espagnol.)</p>
            </div>
            <div className="relative aspect-video bg-ink-950 overflow-hidden">
              <iframe
                className="absolute inset-0 w-full h-full border-0"
                src="https://www.youtube.com/embed/Fak9xHjoivQ"
                title="Mi Tierra Mi Casa — vidéo promotionnelle"
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
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">Contenu de la formation</p>
              <h2 className="font-display text-4xl md:text-5xl text-bone-50">
                4 modules · <em>18 cours.</em>
              </h2>
              <p className="mt-4 font-sans text-sm text-bone-200 max-w-xl mx-auto">
                Une progression qui parcourt toutes les étapes d'un chantier naturel — des fondations au discernement.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MODULOS.map((m, i) => (
                <div key={i} className="bg-ink-800 p-8 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500">{m.n}</p>
                    <span className="text-xs font-sans text-clay-500">{m.cursos} cours</span>
                  </div>
                  <h3 className="font-display text-2xl text-bone-50">{m.title}</h3>
                  <p className="font-sans text-sm text-bone-200 leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CE QUI EST INCLUS */}
        <section className="bg-bone-100 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="mb-12">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">Ce qui est inclus</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950">Tout pour <em>apprendre.</em></h2>
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

        {/* INSCRIPTION */}
        <section className="bg-clay-700 py-20 px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl text-bone-50 mb-5">
            Commencez votre<br /><em>parcours.</em>
          </h2>
          <p className="font-sans text-base text-bone-200 max-w-md mx-auto mb-3 leading-relaxed">
            Accès à vie · USD 80 · Paiement en 3 fois disponible.
          </p>
          <p className="font-sans text-sm text-bone-200/70 mb-8">Nous traitons l'accès dans les 24 heures ouvrées.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="https://wa.me/5493549431594?text=Bonjour%2C%20je%20souhaite%20m%27inscrire%20%C3%A0%20Mi%20Tierra%20Mi%20Casa"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex bg-bone-50 text-clay-900 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-bone-100 transition-colors"
            >
              M'inscrire par WhatsApp →
            </a>
            <Link href="/fr/contacto" className="inline-flex border border-bone-50/50 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:border-bone-50 transition-colors">
              Plus d'informations
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
