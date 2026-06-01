import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Projets — Arte y Tierra',
  description: 'Portfolio de projets de bioarchitecture et d\'hydrologie régénérative en Argentine, Colombie, Pérou, Bolivie, Italie et France.',
  alternates: { canonical: '/fr/proyectos' },
};

const PROYECTOS = [
  {
    id: 'alihuen',
    name: 'Casa Alihuen',
    type: 'Bioarchitecture',
    meta: 'Santa Isabel, Córdoba, Argentine · 2024',
    img: '/img/proyectos/alihuen/12.jpg',
    desc: 'Foyer de Silvia et Alejandro dans une réserve de forêt indigène de la vallée de Punilla. Géométrie hexagonale avec spirale de Fibonacci, panneaux solaires, biofiltres pour eaux grises et noires, toitures végétalisées.',
    tags: ['Conception + Chantier', '9 mois'],
  },
  {
    id: 'armonia',
    name: 'Projet Armonía',
    type: 'Bioarchitecture + Hydrologie',
    meta: 'Capilla del Monte, Córdoba, Argentine · 2025',
    img: '/img/proyectos/armonia/1.jpg',
    desc: 'Foyer de Liliana Gaiarín, conçu avec architecture bioclimatique et géométrie sacrée. Vue sur le Cerro Uritorco. Serre passive, murs en adobe, 3 toitures végétalisées et conception hydrologique intégrée.',
    tags: ['Conception + Chantier', '104 m² + 37 m²'],
  },
  {
    id: 'sol',
    name: 'Casa del Sol',
    type: 'Bioarchitecture',
    meta: 'Santa Isabel, Córdoba, Argentine · 2023',
    img: '/img/proyectos/sol/1.jpg',
    desc: 'Foyer de Susana et ses enfants, conçu à partir de la spirale de Fibonacci. Deux niveaux en adobe et quincha renforcée, toitures vivantes en paraboloïdes hyperboliques. Construit avec bénévoles.',
    tags: ['Conception + Chantier', 'Chantier participatif'],
  },
  {
    id: 'chelo',
    name: 'La Casa del Chelo',
    type: 'Bioarchitecture',
    meta: 'María Juana, Santa Fé, Argentine · 2019',
    img: '/img/proyectos/chelo/1.jpg',
    desc: 'Maison familiale construite en adobe et quincha dans la Pampa humide. Premier projet de grande envergure d\'Arte y Tierra, réalisé en chantier participatif avec la communauté locale.',
    tags: ['Conception + Chantier'],
  },
  {
    id: 'aurea',
    name: 'Casa Aurea',
    type: 'Bioarchitecture',
    meta: 'San Marcos Sierras, Argentine · 2022–2026',
    img: '/img/proyectos/aurea/1.jpg',
    desc: 'Résidence en cours d\'exécution à San Marcos Sierras. Conception basée sur la géométrie dorée et les principes bioclimatiques. Matériaux naturels locaux, systèmes passifs de régulation thermique.',
    tags: ['En cours'],
  },
  {
    id: 'sum-arbol-piedra',
    name: 'SUM Árbol de Piedra',
    type: 'Bioarchitecture',
    meta: 'Córdoba, Argentine · 2023',
    img: '/img/proyectos/sum-arbol-piedra/1.jpg',
    desc: 'Salle polyvalente communautaire construite en adobe et pierre. Espace de rencontre et d\'apprentissage pour la communauté locale.',
    tags: ['Conception + Chantier'],
  },
];

export default function ProyectosFrPage() {
  return (
    <>
      <SiteHeader locale="fr" />
      <main>
        {/* HERO */}
        <section className="relative h-[70vh] min-h-[500px] bg-ink-950 flex items-end overflow-hidden">
          <Image
            src="/img/proyectos/portada/1.jpg"
            alt="Projets Arte y Tierra"
            fill priority className="object-cover object-top" sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/40 to-transparent" />
          <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-16">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">Projets</p>
            <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-3xl">
              Chaque projet,<br /><em>un territoire différent.</em>
            </h1>
            <p className="mt-5 font-sans text-base text-bone-200 max-w-2xl leading-relaxed">
              Plus de 40 projets réalisés en Argentine, Colombie, Pérou, Bolivie, Italie et France.
              Chaque lieu a son propre langage — et chaque œuvre y répond.
            </p>
          </div>
        </section>

        {/* GRILLE DE PROJETS */}
        <section className="bg-ink-950 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PROYECTOS.map(p => (
                <div key={p.id} className="flex flex-col bg-ink-800 overflow-hidden">
                  <div className="relative w-full aspect-[4/3] overflow-hidden">
                    <Image
                      src={p.img}
                      alt={p.name}
                      fill className="object-cover transition-transform duration-500 hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-6 flex flex-col gap-3 flex-1">
                    <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500">{p.type}</p>
                    <h3 className="font-display text-xl text-bone-50">{p.name}</h3>
                    <p className="text-xs font-sans text-bone-200/60">{p.meta}</p>
                    <p className="font-sans text-sm text-bone-200 leading-relaxed flex-1">{p.desc}</p>
                    <div className="flex flex-wrap gap-2 mt-auto pt-3 border-t border-bone-200/10">
                      {p.tags.map(tag => (
                        <span key={tag} className="text-xs font-sans font-semibold text-clay-500 bg-clay-700/10 px-2 py-1">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PAYS */}
        <section className="bg-clay-700 py-16 px-6">
          <div className="max-w-editorial mx-auto">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">Itinérants dans le monde</p>
            <h2 className="font-display text-4xl md:text-5xl text-bone-50 mb-8">
              Nous avons travaillé dans<br />sept <em>pays.</em>
            </h2>
            <div className="flex flex-wrap gap-3">
              {[
                { f: '🇦🇷', n: 'Argentine' },
                { f: '🇨🇴', n: 'Colombie' },
                { f: '🇵🇪', n: 'Pérou' },
                { f: '🇧🇴', n: 'Bolivie' },
                { f: '🇮🇹', n: 'Italie' },
                { f: '🇫🇷', n: 'France' },
                { f: '🇪🇨', n: 'Équateur' },
              ].map(p => (
                <div key={p.n} className="flex items-center gap-2 bg-bone-50/10 px-4 py-2.5 font-sans font-bold text-sm text-bone-100">
                  <span className="text-lg">{p.f}</span>
                  {p.n}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-bone-50 py-20 px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-5">
            Votre projet<br />mérite une <em>conception intégrale.</em>
          </h2>
          <p className="font-sans text-base text-ink-700 max-w-md mx-auto mb-8 leading-relaxed">
            Parlez-nous de votre terrain. Nous travaillons à distance et en présentiel dans toute l'Amérique latine et en Europe.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/fr/asesorias" className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors">
              Réserver une consultation →
            </Link>
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
