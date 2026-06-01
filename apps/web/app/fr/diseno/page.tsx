import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Services — Design Écosystémique Intégral | Arte y Tierra',
  description: 'Design Écosystémique Intégral : eau, production et habitat en un seul système. Bioarchitecture, hydrologie régénérative et design territorial en Argentine, Colombie et Amérique latine.',
  alternates: { canonical: '/fr/diseno' },
};

const SERVICIOS = [
  {
    num: '01',
    title: 'Gestion de l\'eau',
    body: 'L\'eau définit le territoire — tant par son absence que par son excès. Nous concevons pour retenir là où le sol est sec, distribuer là où il y a des sources permanentes, canaliser là où la pluie frappe fort, et traiter là où l\'eau excède.',
    tecnicas: ['Fossés d\'infiltration', 'Réservoirs', 'Biofiltres et zones humides', 'Récupération des eaux de pluie', 'Biopiscines', 'Phytoépuration', 'Swales'],
  },
  {
    num: '02',
    title: 'Habitat et logement',
    body: 'Des espaces qui répondent au territoire, au climat et à ceux qui les habitent. Nous concevons avec des géométries dorées, des matériaux naturels et des systèmes passifs. Chaque maison est une œuvre unique, irremplaçable.',
    tecnicas: ['Adobe et pisé', 'Quincha et cob', 'Pierre', 'Toitures végétalisées', 'Architecture bioclimatique', 'Géométries dorées', 'Radiesthésie'],
  },
  {
    num: '03',
    title: 'Production agroécologique',
    body: 'La nourriture naît du design du sol. Nous intégrons des systèmes de production qui alimentent ceux qui habitent et régénèrent la terre en même temps : forêts comestibles, potager, jardins médicinaux.',
    tecnicas: ['Forêts comestibles', 'Potager', 'Jardins médicinaux', 'Compostage', 'Intégration animale', 'Design de zones', 'Apiculture', 'Fungiculture'],
  },
  {
    num: '04',
    title: 'Paysagisme fonctionnel',
    body: 'Le paysage n\'est pas une décoration — c\'est une fonction. Nous concevons avec des plantes indigènes et introduites, en cherchant beauté, ombre, nourriture, abri et biodiversité.',
    tecnicas: ['Plantes indigènes', 'Haies vives', 'Corridors de biodiversité', 'Revégétalisation', 'Design de bordure'],
  },
  {
    num: '05',
    title: 'Stratégie régénérative intégrale',
    body: 'Quand le projet dépasse la construction. Nous concevons des systèmes complets d\'habiter : énergie, eau, nourriture, déchets, communauté. Une vision du territoire comme écosystème avec son intelligence propre.',
    tecnicas: ['Diagnostic territorial', 'Plan directeur', 'Cycles de matière', 'Énergie renouvelable', 'Déchets comme ressource'],
  },
];

const MODOS = [
  {
    title: 'Design seul',
    desc: 'Vous recevez les plans, mémoires et spécifications pour construire avec votre équipe. Comprend un accompagnement technique pendant les travaux.',
    ideal: 'Idéal si vous avez votre propre équipe ou souhaitez construire en autoconstruction.',
    featured: false,
  },
  {
    title: 'Design + chantier',
    desc: 'Nous nous chargeons de tout : diagnostic, conception, gestion des matériaux et exécution. Notre équipe est sur place pendant tout le processus.',
    ideal: 'L\'option la plus complète. Recommandée pour les projets de grande envergure.',
    featured: true,
  },
  {
    title: 'Chantier seul',
    desc: 'Vous avez déjà le design et souhaitez que notre équipe l\'exécute avec des techniques de bioconstruction. Nous évaluons la compatibilité avant d\'accepter.',
    ideal: 'Idéal si le design a été réalisé par un autre professionnel afin.',
    featured: false,
  },
  {
    title: 'Consultation ponctuelle',
    desc: 'Une ou plusieurs séances techniques pour résoudre des questions spécifiques : matériaux, systèmes d\'eau, orientation, structure. Comprend un rapport écrit.',
    ideal: 'Idéal pour des projets en cours qui ont besoin d\'une orientation technique précise.',
    featured: false,
  },
];

export default function DisenoDEsFrPage() {
  return (
    <>
      <SiteHeader locale="fr" />
      <main>
        {/* HERO */}
        <section className="relative h-[70vh] min-h-[500px] bg-ink-950 flex items-end overflow-hidden">
          <Image
            src="/img/servicios/principal/1.jpg"
            alt="Services Arte y Tierra — Design Écosystémique"
            fill priority className="object-cover" sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/40 to-transparent" />
          <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-16">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">
              Services · Design Écosystémique Intégral
            </p>
            <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-3xl">
              La valeur de votre terre<br />dépend de <em>la façon dont vous la concevez.</em>
            </h1>
            <p className="mt-5 font-sans text-base text-bone-200 max-w-2xl leading-relaxed">
              Nous concevons et développons des systèmes où <strong className="text-bone-100">l'eau, la production et l'habitat</strong> fonctionnent comme un tout. Nous travaillons en Argentine, Colombie et dans toute l'Amérique latine — en présentiel ou à distance.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="https://wa.me/5493549431594?text=Bonjour%2C%20je%20souhaite%20%C3%A9changer%20au%20sujet%20d%27un%20projet"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors"
              >
                Écrire par WhatsApp →
              </a>
              <Link href="/fr/asesorias" className="inline-flex border border-bone-50/50 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:border-bone-50 transition-colors">
                Réserver une consultation →
              </Link>
            </div>
          </div>
        </section>

        {/* LE PROBLÈME */}
        <section className="bg-bone-50 py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-5">Le problème</p>
            <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-8 leading-tight">
              La plupart des projets<br />sont <em>mal</em> définis dès le départ.
            </h2>
            <p className="font-sans text-base text-clay-700 leading-relaxed mb-6">
              On construit sans comprendre l'eau, sans lire le terrain, sans intégrer le système entier.
            </p>
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">Le résultat :</p>
            <ul className="flex flex-col gap-2">
              {['Érosion des sols', 'Mauvaise implantation de l\'habitat', 'Dépassements de coûts en chantier', 'Faible rendement du terrain'].map(item => (
                <li key={item} className="font-sans text-base text-ink-700 flex items-start gap-3">
                  <span className="text-clay-700 mt-0.5">·</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* NOTRE PROPOSITION */}
        <section className="bg-ink-950 py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-5">Notre proposition</p>
            <h2 className="font-display text-4xl md:text-5xl text-bone-50 mb-8 leading-tight">
              Nous travaillons <em>autrement.</em>
            </h2>
            <p className="font-display text-xl text-clay-300 italic mb-6 leading-relaxed">
              D'abord nous <strong className="not-italic text-bone-100">comprenons le territoire.</strong><br />
              Ensuite nous <strong className="not-italic text-bone-100">concevons le système.</strong>
            </p>
            <p className="font-sans text-base text-bone-200 leading-relaxed">
              L'eau, le sol et la topographie cessent d'être un problème — et deviennent une partie de la solution.
            </p>
          </div>
        </section>

        {/* CE QUE NOUS FAISONS */}
        <section className="bg-bone-100 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">Ce que nous faisons</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950">
                Nous développons le design<br />intégral de <em>votre terre.</em>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SERVICIOS.map(s => (
                <div key={s.num} className="bg-bone-50 p-8 flex flex-col gap-4">
                  <span className="text-xs font-sans font-bold text-clay-700">{s.num}</span>
                  <h3 className="font-display text-2xl text-ink-950">{s.title}</h3>
                  <p className="font-sans text-sm text-ink-700 leading-relaxed">{s.body}</p>
                  <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-bone-200">
                    {s.tecnicas.map(t => (
                      <span key={t} className="text-xs font-sans text-clay-700 bg-clay-700/10 px-2 py-1">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MODALITÉS */}
        <section className="bg-ink-950 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="mb-12">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">Comment nous engager</p>
              <h2 className="font-display text-4xl md:text-5xl text-bone-50 leading-tight">
                Quatre façons<br />de <em>travailler ensemble.</em>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {MODOS.map(m => (
                <div key={m.title} className={`p-8 flex flex-col gap-4 ${m.featured ? 'bg-clay-700' : 'bg-ink-800'}`}>
                  {m.featured && (
                    <span className="self-start text-xs font-sans font-bold uppercase tracking-widest text-ink-950 bg-bone-50 px-3 py-1">
                      Recommandé
                    </span>
                  )}
                  <h3 className="font-display text-2xl text-bone-50">{m.title}</h3>
                  <p className="font-sans text-sm text-bone-200 leading-relaxed">{m.desc}</p>
                  <p className="font-sans text-xs text-bone-200/70 italic">{m.ideal}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/fr/asesorias" className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors">
                Commencer avec une consultation →
              </Link>
            </div>
          </div>
        </section>

        {/* PROJETS */}
        <section className="bg-bone-50 py-16 px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-5">
            +40 projets<br />dans <em>7 pays.</em>
          </h2>
          <p className="font-sans text-base text-ink-700 max-w-md mx-auto mb-8 leading-relaxed">
            De l'Argentine à l'Italie, de la Colombie à la France — nous portons cette pratique là où la terre nous invite.
          </p>
          <Link href="/fr/proyectos" className="inline-flex border border-ink-950 text-ink-950 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-ink-950 hover:text-bone-50 transition-colors">
            Voir les projets →
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
