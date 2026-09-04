import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Culture de Pleurotes — Atelier Modulaire FUNGO × Tay Pichín',
  description: 'Atelier modulaire de culture de pleurotes à Tay Pichín. 3 rencontres indépendantes : biologie et mycélium, substrat et incubation, fructification et récolte.',
  alternates: { canonical: '/fr/cursos/cultivo-girgolas' },
};

const MODULOS = [
  {
    n: 'Module I',
    title: 'Biologie du champignon et production de mycélium',
    detail: 'Pratique : inoculation de bocaux',
    desc: 'Introduction à la biologie des champignons. Nous apprenons à préparer des cultures de mycélium en laboratoire simple, avec les ressources accessibles dans n\'importe quel espace domestique.',
  },
  {
    n: 'Module II',
    title: 'Substrat, inoculation et incubation',
    detail: 'Pratique : montage d\'un bloc productif',
    desc: 'Préparation des substrats nutritifs, inoculation et conditions d\'incubation. Nous montons des blocs productifs complets prêts à entrer en fructification.',
  },
  {
    n: 'Module III',
    title: 'Fructification, récolte et gestion de l\'environnement productif',
    detail: 'Gestion de la production continue',
    desc: 'Tout sur les conditions de fructification, la récolte et le maintien d\'un système de production durable — pour la maison ou à petite échelle commerciale.',
  },
];

export default function CultivoGirgolasFrPage() {
  return (
    <>
      <SiteHeader locale="fr" />
      <main>
        {/* HERO */}
        <section className="relative h-[70vh] min-h-[500px] bg-ink-950 flex items-end overflow-hidden">
          <Image
            src="/img/cursos/girgolas/1.jpg"
            alt="Culture de Pleurotes — Atelier FUNGO × Tay Pichín"
            fill priority className="object-cover" sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/40 to-transparent" />
          <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-16">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">
              Atelier modulaire FUNGO × EcoÉcole Tay Pichín · 2026
            </p>
            <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-3xl">
              Culture de <em>Pleurotes.</em>
            </h1>
            <p className="mt-5 font-sans text-base text-bone-200 max-w-2xl leading-relaxed">
              Trois rencontres pour parcourir l'ensemble du processus : depuis comprendre comment vit et grandit un champignon jusqu'à la récolte. Rejoignez le cycle complet ou choisissez le module qui vous correspond.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="https://wa.me/5493549431594?text=Bonjour%2C%20je%20souhaite%20m%27inscrire%20%C3%A0%20l%27atelier%20de%20Culture%20de%20Pleurotes" target="_blank" rel="noopener noreferrer" className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors">
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
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">Un atelier les pieds dans la terre</p>
            <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-8 leading-tight">
              Apprendre à cultiver des <em>champignons</em><br />depuis la racine du processus.
            </h2>
            <p className="font-sans text-base text-ink-700 leading-relaxed mb-6">
              Un atelier intensif, pratique et ancré pour celles et ceux qui découvrent le monde des champignons — ou qui veulent aller plus loin dans leur production.
            </p>
            <p className="font-sans text-base text-ink-700 leading-relaxed">
              Le format modulaire permet de suivre le cycle complet ou de choisir la rencontre qui résonne avec votre intérêt : laboratoire, autoproduction à la maison ou entrepreneuriat.
            </p>
          </div>
        </section>

        {/* DONNÉES CLÉS */}
        <section className="bg-bone-100 py-12 px-6">
          <div className="max-w-editorial mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Quand ?', value: 'À confirmer', sub: 'Trois samedis' },
              { label: 'Où ?', value: 'EcoÉcole Tay Pichín', sub: 'San Marcos Sierras, Córdoba' },
              { label: 'Format', value: 'Présentiel', sub: '3 rencontres modulaires' },
              { label: 'Animé par', value: 'Emmanuel Ciancio · FUNGO', sub: 'Co-organisé par Tay Pichín' },
            ].map(d => (
              <div key={d.label} className="bg-bone-50 p-5 border-l-4 border-clay-700">
                <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-2">{d.label}</p>
                <p className="font-display text-base text-ink-950">{d.value}</p>
                <p className="font-sans text-xs text-ink-700/70 mt-1">{d.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* MODULES */}
        <section className="bg-ink-950 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">3 rencontres indépendantes</p>
              <h2 className="font-display text-4xl md:text-5xl text-bone-50">
                Le programme <em>module par module.</em>
              </h2>
            </div>
            <div className="flex flex-col gap-6">
              {MODULOS.map((m, i) => (
                <div key={i} className="bg-ink-800 p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-3">{m.n}</p>
                    <h3 className="font-display text-2xl text-bone-50">{m.title}</h3>
                    <p className="font-sans text-sm text-clay-300 italic mt-2">{m.detail}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="font-sans text-sm text-bone-200 leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TARIFS */}
        <section className="bg-bone-50 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="mb-10">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">Investissement</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950">
                Tarifs.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mb-10">
              <div className="bg-bone-100 p-8">
                <p className="font-sans text-sm text-ink-700 mb-3">Par module seul</p>
                <p className="font-display text-4xl text-clay-700">$60.000</p>
                <p className="font-sans text-sm text-ink-700/70 mt-2">ARS · USD 46 · €42</p>
              </div>
              <div className="bg-clay-700 p-8">
                <p className="font-sans text-sm text-bone-200 mb-3">Cycle complet (3 modules)</p>
                <p className="font-display text-4xl text-bone-50">$150.000</p>
                <p className="font-sans text-sm text-bone-200/70 mt-2">ARS · USD 115 · €105</p>
                <span className="inline-block mt-3 text-xs font-sans font-bold text-ink-950 bg-bone-50 px-2 py-1">MEILLEUR PRIX</span>
              </div>
            </div>
            <p className="font-sans text-sm text-ink-700/70 italic mb-8">
              Comprend : matériaux pour les pratiques, eau et accès à l'espace Tay Pichín. Hébergement non inclus.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://wa.me/5493549431594?text=Bonjour%2C%20je%20souhaite%20m%27inscrire%20%C3%A0%20l%27atelier%20de%20Culture%20de%20Pleurotes"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors"
              >
                M'inscrire par WhatsApp →
              </a>
              <Link href="/fr/contacto" className="inline-flex border border-ink-950 text-ink-950 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-ink-950 hover:text-bone-50 transition-colors">
                Nous écrire
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
