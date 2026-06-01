import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Arte y Tierra — Design Écosystémique du Territoire',
  description: 'Bioarchitecture, hydrologie régénérative et apprentissage expérientiel. Collectif itinérant basé à Tay Pichín, Sierras de Córdoba, Argentine.',
  alternates: { canonical: '/fr' },
};

const SERVICIOS = [
  {
    num: '01',
    title: "Bioarchitecture et design d'habitat",
    body: "Nous construisons avec la terre, le bois, la pierre et la paille. Des espaces qui n'interrompent pas le paysage — qui en font partie.",
    href: '/fr/diseno',
    img: '/img/home/lo-que-hacemos/1.jpg',
    alt: 'Bioarchitecture — construction naturelle',
  },
  {
    num: '02',
    title: 'Hydrologie régénérative',
    body: "L'eau n'est pas une ressource à administrer — c'est un système vivant que l'on peut soigner. Nous concevons pour qu'elle recommence à couler.",
    href: '/fr/diseno',
    img: '/img/home/lo-que-hacemos/2.jpg',
    alt: "Hydrologie régénérative — design de l'eau",
  },
  {
    num: '03',
    title: 'Ateliers expérientiels',
    body: 'Apprentissage en chantier collectif. À Tay Pichín ou sur votre propre terrain — partout dans le monde.',
    href: '/fr/cursos',
    img: '/img/home/lo-que-hacemos/3.jpg',
    alt: 'Ateliers expérientiels de bioconstruction',
  },
];

const PROYECTOS = [
  { slug: 'armonia',          name: 'Proyecto Armonía',    type: 'Bioarchitecture + Hydrologie', img: '/img/proyectos/armonia/1.jpg',          meta: 'Capilla del Monte · 2025' },
  { slug: 'alihuen',          name: 'Casa Alihuen',         type: 'Bioarchitecture',              img: '/img/proyectos/alihuen/12.jpg',         meta: 'Santa Isabel · 2024' },
  { slug: 'sol',              name: 'Casa del Sol',          type: 'Bioarchitecture',              img: '/img/proyectos/sol/1.jpg',              meta: 'Santa Isabel · 2023' },
  { slug: 'chelo',            name: 'La Casa del Chelo',     type: 'Bioarchitecture',              img: '/img/proyectos/chelo/1.jpg',            meta: 'María Juana, Santa Fé · 2019' },
  { slug: 'aurea',            name: 'Casa Aurea',            type: 'Bioarchitecture',              img: '/img/proyectos/aurea/1.jpg',            meta: 'San Marcos Sierras · 2022–2026' },
  { slug: 'sum-arbol-piedra', name: 'SUM Árbol de Piedra',   type: 'Bioarchitecture',              img: '/img/proyectos/sum-arbol-piedra/1.jpg', meta: 'Córdoba' },
];

const STATS = [
  { n: '+10k', label: 'personnes touchées' },
  { n: '+40',  label: 'projets réalisés' },
  { n: '+150', label: 'ateliers dispensés' },
  { n: '7',    label: 'pays' },
];

const TESTIMONIOS = [
  {
    quote: "« Je suis arrivée à Tay Pichín en pensant apprendre à construire. Je suis repartie en sachant écouter l'eau, la terre et ceux qui l'habitent. »",
    author: 'Sofía',
    role: 'participante atelier bioconstruction',
  },
  {
    quote: "« La formation m'a changé la façon de regarder l'habiter. Ce n'est pas seulement de la technique — c'est une manière d'être au monde. »",
    author: 'Diego',
    role: 'participant formation intégrale',
  },
  {
    quote: "« Travailler avec Jonatan et l'équipe, c'est trouver des gens qui conçoivent depuis le lieu — pas depuis un catalogue. Chaque décision est née du territoire. »",
    author: 'Franco Colavita',
    role: 'client',
  },
];

export default function FrHomePage() {
  return (
    <>
      <SiteHeader locale="fr" />

      <main>
        {/* HERO */}
        <section className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden bg-ink-950 flex items-end">
          <Image
            src="/img/proyectos/portada/1.jpg"
            alt="Arte y Tierra — design écosystémique du territoire"
            fill priority className="object-cover" sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/30 to-ink-950/10" />
          <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-16 md:pb-24">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-5">
              Arte y Tierra · Design Écosystémique du Territoire
            </p>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-bone-50 leading-tight max-w-3xl">
              Nous concevons le territoire<br />
              comme <em>système vivant.</em>
            </h1>
            <p className="mt-5 text-bone-200 font-sans text-lg md:text-xl max-w-xl leading-relaxed">
              Bioarchitecture, Agroécologie et Design Hydrologique.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/fr/asesorias" className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-7 py-4 hover:bg-clay-900 transition-colors">
                Réserver une consultation
              </Link>
              <Link href="/fr/proyectos" className="inline-flex border border-bone-50/50 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-7 py-4 hover:border-bone-50 transition-colors">
                Voir les projets →
              </Link>
            </div>
          </div>
        </section>

        {/* MANIFIESTO */}
        <section className="bg-ink-950 py-24 md:py-32 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="font-display text-2xl md:text-3xl text-bone-100 leading-relaxed italic">
              Nous accompagnons la conception d'habitats qui expriment une manière plus{' '}
              <strong className="not-italic text-clay-300">consciente, aimante et régénérative</strong>{' '}
              d'habiter la planète.
            </p>
            <p className="mt-8 font-sans text-bone-200 text-lg leading-relaxed">
              Nous tissons des liens entre les personnes, les territoires et les intentions. Nous écoutons le paysage,
              l'eau, ceux qui l'habitent et ceux qui rêvent d'y construire une nouvelle vie.
            </p>
            <p className="mt-6 font-sans text-bone-200 text-base leading-relaxed">
              Nous travaillons depuis le paradigme du{' '}
              <strong className="text-bone-100">Sumaq Kawsay</strong> — le Bien Vivre.
            </p>
          </div>
        </section>

        {/* STATS */}
        <section className="bg-clay-700 py-14 px-6">
          <div className="max-w-editorial mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map(s => (
              <div key={s.n}>
                <div className="font-display text-5xl md:text-6xl text-bone-50">{s.n}</div>
                <div className="mt-2 font-sans text-sm uppercase tracking-widest text-clay-200">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CE QUE NOUS FAISONS */}
        <section className="bg-bone-50 py-20 md:py-28 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="mb-14">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-3">Ce que nous faisons</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950">
                Comment nous transformons<br />le <em>territoire.</em>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {SERVICIOS.map(s => (
                <div key={s.num} className="flex flex-col">
                  <div className="relative aspect-[4/3] overflow-hidden bg-bone-200">
                    <Image src={s.img} alt={s.alt} fill className="object-cover transition-transform duration-500 hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
                  </div>
                  <div className="mt-5 flex flex-col gap-3">
                    <span className="text-xs font-sans font-bold text-clay-700">{s.num}</span>
                    <h3 className="font-display text-xl text-ink-950">{s.title}</h3>
                    <p className="font-sans text-base text-ink-700 leading-relaxed">{s.body}</p>
                    <Link href={s.href} className="text-sm font-sans font-semibold text-clay-700 underline underline-offset-4 hover:text-clay-900 transition-colors self-start">
                      En savoir plus →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROJETS */}
        <section className="bg-ink-950 py-20 md:py-28 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-14">
              <div>
                <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-3">Travaux réalisés</p>
                <h2 className="font-display text-4xl md:text-5xl text-bone-50">
                  Le territoire<br />comme <em>œuvre.</em>
                </h2>
              </div>
              <Link href="/fr/proyectos" className="text-sm font-sans font-semibold text-clay-300 hover:text-clay-100 underline underline-offset-4 transition-colors">
                Voir tous les projets →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {PROYECTOS.map(p => (
                <Link key={p.slug} href="/fr/proyectos" className="group block overflow-hidden bg-ink-800">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image src={p.img} alt={p.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                    <div className="absolute inset-0 bg-ink-950/0 group-hover:bg-ink-950/20 transition-colors" />
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-sans font-bold uppercase tracking-wider text-clay-500 mb-1">{p.type}</p>
                    <h3 className="font-display text-xl text-bone-50 group-hover:text-clay-200 transition-colors">{p.name}</h3>
                    <p className="mt-1 text-sm font-sans text-bone-200/60">{p.meta}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* TAY PICHÍN */}
        <section className="bg-bone-100">
          <div className="max-w-wide mx-auto grid grid-cols-1 lg:grid-cols-2">
            <div className="relative min-h-[400px] lg:min-h-[560px] overflow-hidden">
              <Image src="/img/taypichin/1.jpg" alt="Tay Pichín — Écoschool et Écohostel à San Marcos Sierras" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
            </div>
            <div className="flex flex-col justify-center gap-6 p-10 md:p-16">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700">
                Tay Pichín · San Marcos Sierras, Córdoba
              </p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950">
                Un lieu où<br />tout cela <em>vit.</em>
              </h2>
              <p className="font-sans text-base text-ink-700 leading-relaxed max-w-md">
                Le siège physique d'Arte y Tierra. Un espace construit en terre, bois et pierre où l'on enseigne,
                construit, accueille et apprend ensemble.
              </p>
              <ul className="flex flex-col gap-4">
                {[
                  { label: 'Écoschool', desc: "Formations intensives en bioarchitecture et design de l'eau.", href: '/fr/cursos' },
                  { label: 'Écohostel', desc: 'Hébergement en architecture de terre.', href: '/fr/hospedaje' },
                  { label: 'Immersion Vivante', desc: '15 ou 30 jours en pratique permaculturelle.', href: '/fr/cursos' },
                ].map(item => (
                  <li key={item.label} className="flex gap-3">
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-clay-700 flex-shrink-0" />
                    <div>
                      <Link href={item.href} className="font-sans font-semibold text-ink-950 hover:text-clay-700 transition-colors">
                        {item.label} →
                      </Link>
                      <p className="text-sm font-sans text-ink-700 mt-0.5">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link href="/fr/tay-pichin" className="mt-2 self-start inline-flex bg-ink-950 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-6 py-3.5 hover:bg-ink-800 transition-colors">
                Découvrir Tay Pichín →
              </Link>
            </div>
          </div>
        </section>

        {/* TÉMOIGNAGES */}
        <section className="bg-clay-900 py-20 md:py-28 px-6">
          <div className="max-w-editorial mx-auto">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 text-center mb-14">
              Ce que disent ceux qui ont vécu l'expérience
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {TESTIMONIOS.map((t, i) => (
                <div key={i} className="flex flex-col gap-4 p-7 bg-clay-700/20">
                  <p className="font-display text-lg text-bone-100 leading-relaxed italic">{t.quote}</p>
                  <div className="mt-auto">
                    <span className="text-sm font-sans font-semibold text-clay-300">— {t.author}</span>
                    {t.role && <span className="text-sm font-sans text-clay-500"> · {t.role}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-bone-50 py-24 px-6 text-center">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-5">
            Nous travaillons partout dans le monde
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-5">
            Vous avez un projet<br />en tête ?
          </h2>
          <p className="font-sans text-lg text-ink-700 max-w-lg mx-auto mb-8 leading-relaxed">
            Parlez-nous de votre terrain, de votre idée, de votre rêve. Commencez par une consultation en ligne —
            1 heure, on révise tout ensemble.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/fr/asesorias" className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors">
              Réserver une consultation
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
