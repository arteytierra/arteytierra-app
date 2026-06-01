import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'À propos — Arte y Tierra',
  description: 'Arte y Tierra est un collectif de bioarchitectes, hydrologues et designers écosystémiques. +40 œuvres dans 7 pays et 15 ans de travail avec la terre.',
  alternates: { canonical: '/fr/nosotros' },
};

const VALORES = [
  { titulo: 'Écoute du territoire', desc: 'Chaque décision naît du lieu — son eau, son sol, sa lumière, ses habitants.' },
  { titulo: 'Réciprocité', desc: 'Ce que nous prenons au territoire, nous le restituons en soin et régénération.' },
  { titulo: 'Apprentissage vivantiel', desc: "On apprend en faisant, en minga, avec le corps et avec les autres." },
  { titulo: 'Autonomie', desc: 'Nous semons des savoirs que les communautés peuvent répliquer et multiplier.' },
];

const EQUIPO: { name: string; role: string; bio: string; img: string | null }[] = [
  {
    name: 'Jonatan Palma',
    role: 'Directeur · Designer · Facilitateur',
    bio: 'Bioconstructeur depuis 2010, spécialisé en construction en terre, bioclimatique et radiesthésie. Formé avec Jorge Belanko, Gernot Minke, Marco Arestra et Daniel Smite. Fondateur d\'Arte y Tierra et de l\'Écoécole Tay Pichín.',
    img: '/img/cursos/vueltatierra/10.jpg',
  },
  {
    name: 'Fabricio Manzoni',
    role: 'Permaculture · Design Hydrologique',
    bio: 'Cofondateur de Minga Verde, facilitateur certifié par l\'Éco-école El Manzano (Université Gaia, Chili). Il se consacre au design et à la consultation en santé et régénération des systèmes écologiques dans différents pays.',
    img: '/img/cursos/vueltatierra/8.jpg',
  },
  {
    name: 'Julián Denaday',
    role: 'Conduite de chantier · Facilitateur',
    bio: 'Constructeur de métier, originaire de Los Toldos (Buenos Aires). Il intègre technique et expérience pratique dans les processus constructifs, partageant le faire depuis un regard conscient et en lien avec la vie quotidienne.',
    img: 'https://drive.google.com/thumbnail?id=1ixPqThmDFMhODU8ozTbLeiRylLMGa_rz&sz=w800',
  },
  {
    name: 'Ignacio Gómez Serjal',
    role: 'Directeur du volontariat · Tay Pichín',
    bio: 'Permaculteur et agriculteur né à San Nicolás. Son chemin s\'est forgé en contact direct avec la terre, spécialisé dans le travail du potager et les systèmes productifs à échelle humaine.',
    img: 'https://drive.google.com/thumbnail?id=1BgRX6c2SWhRL25wVk78URypKKVA74sj3&sz=w800',
  },
  {
    name: 'Karen Ybarra',
    role: 'Équipe Écohostel · Tay Pichín',
    bio: 'Née à Tres de Febrero (Buenos Aires), son intérêt pour la permaculture l\'a amenée à explorer les systèmes constructifs conventionnels et traditionnels. Elle apporte un regard sensible dans la gestion de l\'espace.',
    img: 'https://drive.google.com/thumbnail?id=17CGD5Mf4J8zKKAWYWtxNoFldhhTgTufD&sz=w800',
  },
];

const PAISES = [
  { bandera: '🇦🇷', nombre: 'Argentine' },
  { bandera: '🇨🇴', nombre: 'Colombie' },
  { bandera: '🇵🇪', nombre: 'Pérou' },
  { bandera: '🇧🇴', nombre: 'Bolivie' },
  { bandera: '🇮🇹', nombre: 'Italie' },
  { bandera: '🇫🇷', nombre: 'France' },
  { bandera: '🇪🇨', nombre: 'Équateur' },
];

export default function NosotrosFrPage() {
  return (
    <>
      <SiteHeader locale="fr" />
      <main>
        {/* HERO */}
        <section className="relative h-[70vh] min-h-[500px] bg-ink-950 flex items-end overflow-hidden">
          <Image
            src="/img/taypichin/carousel/5.jpg"
            alt="Arte y Tierra — équipe en chantier"
            fill priority className="object-cover object-top" sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/40 to-transparent" />
          <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-16">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">
              À propos · +40 œuvres · 7 pays · 15 ans
            </p>
            <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-3xl">
              Une équipe qui conçoit<br /><em>des territoires vivants.</em>
            </h1>
            <p className="mt-5 font-sans text-base text-bone-200 max-w-2xl leading-relaxed">
              Nous sommes un collectif de bioarchitectes, hydrologues et designers écosystémiques. Nous travaillons en Argentine, en Colombie et dans toute l'Amérique latine avec la rigueur d'un bureau professionnel et la conviction de qui comprend la terre comme un système vivant.
            </p>
          </div>
        </section>

        {/* MANIFIESTO */}
        <section className="bg-bone-50 py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-5">Qui nous sommes</p>
            <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-10 leading-tight">
              Une question<br />nous a mis en <em>mouvement.</em>
            </h2>
            <p className="font-display text-xl text-clay-700 italic mb-8">
              Comment habiter un territoire sans le détruire ?
            </p>
            <div className="flex flex-col gap-5">
              <p className="font-sans text-base text-ink-700 leading-relaxed">
                Nous sommes un collectif qui impulse la régénération de l'être, de la communauté et des écosystèmes — facilitant des processus qui intègrent le design écologique, la connaissance de soi et l'action collaborative.
              </p>
              <p className="font-sans text-base text-ink-700 leading-relaxed">
                Nous concevons des habitations, des écohébergements, des espaces productifs, des systèmes hydrologiques, des agroécosystèmes, des centres communautaires et des lieux de retraite — en appliquant la bioarchitecture, le design hydrologique, l'agroécologie, la géométrie dorée et la radiesthésie, en harmonie avec la vie.
              </p>
              <p className="font-sans text-base text-ink-700 leading-relaxed">
                Plus que construire des structures, nous accompagnons des processus de transformation personnelle et collective — laissant des semences d'apprentissage, d'autonomie et d'abondance là où nous semons.
              </p>
            </div>
          </div>
        </section>

        {/* VALORES */}
        <section className="bg-ink-950 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="mb-12">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">Ce qui nous guide</p>
              <h2 className="font-display text-4xl md:text-5xl text-bone-50 leading-tight">
                Sumaq Kawsay —<br />le <em>Bien Vivre.</em>
              </h2>
              <p className="mt-5 font-sans text-base text-bone-200 max-w-2xl leading-relaxed">
                Nous travaillons depuis un paradigme andin qui comprend le bien-être comme un équilibre entre le matériel et le spirituel, l'individuel et le collectif, l'humain et la terre.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {VALORES.map(v => (
                <div key={v.titulo} className="border-t-2 border-clay-700 pt-5">
                  <h4 className="font-sans font-bold text-sm text-bone-100 mb-3">{v.titulo}</h4>
                  <p className="font-sans text-sm text-bone-200 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EQUIPO */}
        <section className="bg-bone-100 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">L'équipe</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950">
                Ceux qui <em>habitent</em> Arte y Tierra.
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {EQUIPO.map(p => (
                <div key={p.name} className="flex flex-col bg-bone-50 overflow-hidden">
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-clay-700/20 flex-shrink-0">
                    {p.img ? (
                      p.img.startsWith('https://drive.google.com') ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <Image src={p.img} alt={p.name} fill className="object-cover object-top" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                      )
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-display text-6xl text-clay-700/30">{p.name[0]}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col justify-center gap-2">
                    <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700">{p.role}</p>
                    <h3 className="font-display text-xl text-ink-950">{p.name}</h3>
                    <p className="font-sans text-sm text-ink-700 leading-relaxed">{p.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PAÍSES */}
        <section className="bg-clay-700 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">Itinérants dans le monde</p>
            <h2 className="font-display text-4xl md:text-5xl text-bone-50 mb-10 leading-tight">
              Nous avons travaillé dans<br />sept <em>pays.</em>
            </h2>
            <div className="flex flex-wrap gap-3 mb-10">
              {PAISES.map(p => (
                <div key={p.nombre} className="flex items-center gap-2 bg-bone-50/10 px-4 py-2.5 font-sans font-bold text-sm text-bone-100">
                  <span className="text-lg">{p.bandera}</span>
                  {p.nombre}
                </div>
              ))}
            </div>
            <p className="font-sans text-sm text-bone-200 leading-relaxed max-w-xl">
              Nous opérons de manière itinérante depuis Tay Pichín, notre siège dans les Sierras de Córdoba. Nous portons cette pratique aux familles, communautés et territoires qui nous invitent à semer.
            </p>
          </div>
        </section>

        {/* STATS */}
        <section className="bg-bone-50 py-16 px-6 border-b border-bone-200">
          <div className="max-w-editorial mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: '+40', label: 'Œuvres réalisées' },
              { num: '15', label: "Années d'expérience" },
              { num: '7', label: 'Pays' },
              { num: '+500', label: 'Personnes formées' },
            ].map(s => (
              <div key={s.label}>
                <p className="font-display text-5xl text-clay-700 mb-2">{s.num}</p>
                <p className="font-sans text-sm text-ink-700 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-ink-950 py-20 px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl text-bone-50 mb-5">
            On sème<br /><em>ensemble ?</em>
          </h2>
          <p className="font-sans text-base text-bone-200 max-w-md mx-auto mb-8 leading-relaxed">
            Parlez-nous de votre terrain, votre idée, votre rêve. Nous travaillons partout dans le monde.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/fr/contacto" className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors">
              Nous écrire →
            </Link>
            <Link href="/fr/diseno" className="inline-flex border border-bone-200/50 text-bone-200 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:border-bone-50 hover:text-bone-50 transition-colors">
              Voir les services →
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
