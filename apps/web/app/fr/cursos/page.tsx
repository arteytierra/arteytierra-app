import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Formations et Ateliers 2026',
  description: 'Calendrier 2026 des formations et ateliers à Tay Pichín : bioarchitecture, hydrologie, enduits, champignons. Formations en ligne Mi Tierra Mi Casa et Tadelakt.',
  alternates: { canonical: '/fr/cursos' },
};

const CALENDARIO = [
  { color: 'bg-moss-700',  text: 'text-bone-50',  tag: 'EN LIGNE · Page complète',         title: 'Mi Tierra Mi Casa →',                             href: '/fr/cursos/mi-tierra-mi-casa' },
  { color: 'bg-clay-700',  text: 'text-ink-950',  tag: 'PRÉSENTIEL · 3e samedi du mois',   title: 'Alchimie Naturelle et Nettoyage Conscient →',     href: '/fr/cursos/alquimia-natural' },
  { color: 'bg-moss-700',  text: 'text-bone-50',  tag: 'EN LIGNE',                          title: 'Tadelakt en Ligne',                               href: '/fr/cursos' },
  { color: 'bg-clay-700',  text: 'text-ink-950',  tag: 'DÉC · 5-6',                        title: 'Bioarchitecture, Construction et Territoire →',   href: '/fr/cursos/bioarquitectura' },
  { color: 'bg-sky-700',   text: 'text-bone-50',  tag: 'OCT · 10-12',                      title: 'Design Écosystémique de l\'Eau',                  href: '/fr/cursos' },
  { color: 'bg-clay-700',  text: 'text-ink-950',  tag: 'DÉC · 5-8',                        title: 'Design Hydrologique + Bioconstruction',           href: '/fr/cursos' },
  { color: 'bg-moss-700',  text: 'text-bone-50',  tag: 'Dates à confirmer',                title: 'Culture de Pleurotes — modulaire →',              href: '/fr/cursos/cultivo-girgolas' },
  { color: 'bg-clay-900',  text: 'text-bone-50',  tag: 'Prochainement',                     title: 'Éco-citernes et Biopiscines',                     href: '/fr/cursos' },
  { color: 'bg-clay-900',  text: 'text-bone-50',  tag: 'Prochainement',                     title: 'Atelier d\'Enduits',                              href: '/fr/cursos' },
];

const DESTACADOS = [
  {
    href: '/fr/cursos/bioarquitectura',
    tag: 'Atelier intensif · Décembre 2026',
    badge: 'PLACES DISPONIBLES',
    title: 'Bioarchitecture, Construction et Territoire',
    meta: '5 et 6 décembre 2026 · 2 jours · Jonatan Palma',
    desc: 'Immersion condensée en bioconstruction. Nous travaillons avec des techniques traditionnelles et contemporaines adaptées au territoire local — en combinant théorie, pratique constructive et processus communautaires.',
    prix: '$130.000 ARS — à partir de USD 100',
    img: '/img/cursos/vueltatierra/1.jpg',
  },
  {
    href: '/fr/cursos/cultivo-girgolas',
    tag: 'Atelier modulaire · FUNGO × Tay Pichín',
    badge: 'PROCHAINEMENT',
    title: 'Culture de Pleurotes',
    meta: 'Dates à confirmer · 3 rencontres indépendantes',
    desc: 'Trois rencontres pour parcourir tout le processus de culture des pleurotes : depuis la biologie du champignon jusqu\'à la récolte. Format modulaire — suivez un module seul ou le cycle complet.',
    prix: '$60.000 ARS / module — cycle complet $150.000 ARS',
    img: '/img/cursos/girgolas/1.jpg',
  },
  {
    href: '/fr/cursos/alquimia-natural',
    tag: 'Présentiel · 3e samedi du mois',
    badge: 'RÉGULIER',
    title: 'Alchimie Naturelle et Nettoyage Conscient',
    meta: '3e samedi du mois · journée',
    desc: 'Atelier pratique pour créer ses propres produits ménagers et de soin à partir d\'ingrédients naturels. Savons, détergents, cosmétiques simples et efficaces — en connexion avec les cycles de la nature.',
    prix: 'Consulter',
    img: '/img/cursos/alquimia/1.jpg',
  },
];

export default function CursosFrPage() {
  return (
    <>
      <SiteHeader locale="fr" />
      <main>
        {/* HERO */}
        <section className="relative h-[70vh] min-h-[500px] bg-ink-950 flex items-end overflow-hidden">
          <Image
            src="/img/cursos/vueltatierra/1.jpg"
            alt="Formations Arte y Tierra — Tay Pichín"
            fill priority className="object-cover" sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/40 to-transparent" />
          <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-16">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">
              Formations et Ateliers 2026
            </p>
            <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-3xl">
              Apprendre le métier<br />d'<em>habiter la terre.</em>
            </h1>
            <p className="mt-5 font-sans text-base text-bone-200 max-w-2xl leading-relaxed">
              Formations expérientielles sur de vrais projets — design hydrologique, agroécologie, bioarchitecture et construction en terre — à l'écoschool Tay Pichín.
            </p>
          </div>
        </section>

        {/* CALENDRIER */}
        <section className="bg-bone-50 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">Calendrier</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950">
                Calendrier <em>2026.</em>
              </h2>
              <p className="mt-4 font-sans text-sm text-ink-700">Ateliers confirmés pour les prochains mois.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 xl:gap-4">
              {CALENDARIO.map((c, i) => (
                <Link key={i} href={c.href} className={`block p-5 ${c.color} ${c.text} hover:opacity-90 transition-opacity`}>
                  <p className="text-xs font-sans font-bold uppercase tracking-wide opacity-75 mb-2">{c.tag}</p>
                  <p className="font-sans font-bold text-sm leading-snug">{c.title}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FORMATIONS EN VEDETTE */}
        <section className="bg-ink-950 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="mb-12">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">Formations en vedette</p>
              <h2 className="font-display text-4xl md:text-5xl text-bone-50">
                Les prochaines <em>ouvertures.</em>
              </h2>
            </div>
            <div className="flex flex-col gap-8">
              {DESTACADOS.map((c) => (
                <Link key={c.href} href={c.href} className="group grid grid-cols-1 md:grid-cols-3 gap-0 bg-ink-800 overflow-hidden hover:bg-ink-700 transition-colors">
                  <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[280px] overflow-hidden">
                    <Image src={c.img} alt={c.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
                  </div>
                  <div className="md:col-span-2 p-8 flex flex-col gap-3 justify-center">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500">{c.tag}</span>
                      <span className="text-xs font-sans font-bold text-ink-950 bg-clay-700 px-2 py-0.5">{c.badge}</span>
                    </div>
                    <h3 className="font-display text-2xl text-bone-50">{c.title}</h3>
                    <p className="text-xs font-sans text-bone-200/70">{c.meta}</p>
                    <p className="font-sans text-sm text-bone-200 leading-relaxed">{c.desc}</p>
                    <p className="font-sans text-sm font-bold text-clay-400 mt-2">{c.prix}</p>
                    <span className="self-start text-xs font-sans font-bold uppercase tracking-widest text-clay-400 group-hover:text-clay-300 transition-colors">
                      Voir le détail →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FORMATIONS EN LIGNE */}
        <section className="bg-clay-700 py-16 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="mb-10">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">Formations en ligne</p>
              <h2 className="font-display text-4xl md:text-5xl text-bone-50">
                Apprenez depuis<br />n'importe où.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/fr/cursos/mi-tierra-mi-casa" className="group bg-clay-900 p-8 flex flex-col gap-3 hover:bg-ink-950 transition-colors">
                <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-400">Formation en ligne</p>
                <h3 className="font-display text-2xl text-bone-50">Mi Tierra Mi Casa</h3>
                <p className="font-sans text-sm text-bone-200 leading-relaxed">Formation intégrale en bioconstruction et habitat naturel. Accès à la demande, accompagnement communautaire.</p>
                <span className="text-xs font-sans font-bold uppercase tracking-widest text-clay-400 group-hover:text-clay-300 transition-colors mt-auto">Voir la formation →</span>
              </Link>
              <Link href="/fr/cursos" className="group bg-clay-900 p-8 flex flex-col gap-3 hover:bg-ink-950 transition-colors">
                <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-400">Formation en ligne</p>
                <h3 className="font-display text-2xl text-bone-50">Tadelakt en Ligne</h3>
                <p className="font-sans text-sm text-bone-200 leading-relaxed">Technique de finition en chaux marocaine. Vidéos pratiques, fiches techniques et accès communautaire.</p>
                <span className="text-xs font-sans font-bold uppercase tracking-widest text-clay-400 group-hover:text-clay-300 transition-colors mt-auto">Bientôt disponible</span>
              </Link>
            </div>
          </div>
        </section>

        {/* VIDEO TÉMOIGNAGES */}
        <section className="bg-ink-950 py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">Ce que disent ceux qui sont passés par là</p>
              <h2 className="font-display text-3xl text-bone-50">Voix de la <em>communauté.</em></h2>
              <p className="mt-2 font-sans text-sm text-bone-300/70 italic">(en espagnol)</p>
            </div>
            <div className="relative aspect-video bg-ink-800 overflow-hidden">
              <iframe
                className="absolute inset-0 w-full h-full border-0"
                src="https://www.youtube-nocookie.com/embed/dSqscHL4pF8"
                title="Témoignages de participants — Arte y Tierra"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-bone-50 py-20 px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-5">
            Une question sur les<br /><em>inscriptions ?</em>
          </h2>
          <p className="font-sans text-base text-ink-700 max-w-md mx-auto mb-8 leading-relaxed">
            Écrivez-nous sur WhatsApp — nous vous répondons en moins de 24 heures.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="https://wa.me/5493549431594?text=Bonjour%2C%20je%20souhaite%20des%20informations%20sur%20les%20formations"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors"
            >
              WhatsApp →
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
