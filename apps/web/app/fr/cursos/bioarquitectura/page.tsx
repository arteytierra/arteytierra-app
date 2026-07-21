import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Bioarchitecture, Construction et Territoire — Stage Intensif à Tay Pichín',
  description: 'Stage intensif de 2 jours à Tay Pichín : bioconstruction sur chantier réel avec techniques traditionnelles adaptées aux territoires semi-arides. 5 et 6 décembre 2026.',
  alternates: { canonical: '/fr/cursos/bioarquitectura' },
};

const CONTENIDOS = [
  'Terre crue · matériaux',
  'Pisé et cob',
  'Quincha (torchis)',
  'Enduits en terre',
  'Enduits à la chaux',
  'Conception bioclimatique',
];

const PROGRAMA = [
  {
    dia: 'Samedi 5 décembre',
    actividades: 'Accueil · laboratoire de terre · techniques de murs · enduit gros',
  },
  {
    dia: 'Dimanche 6 décembre',
    actividades: 'Bioclimatique · enduit à la chaux · finitions fines · cercle de clôture',
  },
];

const PRECIOS = [
  { tipo: 'Sans hébergement', precio: '$130.000', usd: 'USD 100' },
  { tipo: 'Camping', precio: '$145.000', usd: 'USD 112' },
  { tipo: 'Chambre partagée', precio: '$160.000', usd: 'USD 123', featured: true },
];

export default function BioarquitecturaFrPage() {
  return (
    <>
      <SiteHeader locale="fr" />
      <main>
        {/* HERO */}
        <section className="relative h-[70vh] min-h-[500px] bg-ink-950 flex items-end overflow-hidden">
          <Image
            src="/img/cursos/vueltatierra/1.jpg"
            alt="Bioarchitecture et construction — Stage intensif à Tay Pichín"
            fill priority className="object-cover opacity-60" sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/40 to-transparent" />
          <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-16">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">
              Stage intensif · 5 et 6 décembre 2026 · Tay Pichín
            </p>
            <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-3xl">
              Bioarchitecture,<br />construction et <em>territoire.</em>
            </h1>
            <p className="mt-5 font-sans text-base text-bone-200 max-w-2xl leading-relaxed">
              Comment concevoir et construire des <em>habitats vivants</em> en lien avec le territoire. Deux jours de chantier réel, techniques ancestrales et design écologique appliqué aux terres semi-arides.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="https://wa.me/5493549431594?text=Bonjour%2C%20je%20souhaite%20m%27inscrire%20%C3%A0%20le%20stage%20de%20Bioarchitecture%20de%20D%C3%A9cembre" target="_blank" rel="noopener noreferrer" className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors">
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
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">Une expérience intensive</p>
            <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-8 leading-tight">
              Apprendre en construisant<br />sur un <em>chantier réel.</em>
            </h2>
            <p className="font-sans text-base text-ink-700 leading-relaxed mb-6">
              Deux jours d'expérience intensive où nous apprendrons en intégrant les techniques ancestrales de bioconstruction avec les principes contemporains de design écologique et d'architecture bioclimatique adaptée aux territoires semi-arides.
            </p>
            <p className="font-sans text-base text-ink-700 leading-relaxed mb-6">
              Pendant la rencontre nous travaillerons collectivement sur différentes étapes constructives en utilisant la terre, la pierre, les fibres végétales et les matériaux naturels, en comprenant l'habitat comme <em>un organisme vivant</em> en relation directe avec le paysage, le climat et les personnes qui l'habitent.
            </p>
            <p className="font-sans text-base font-bold text-ink-950">
              Plus qu'une formation technique, cette proposition cherche à retrouver des manières plus conscientes d'habiter, de construire et de nous relier à la terre.
            </p>
          </div>
        </section>

        {/* DONNÉES CLÉS */}
        <section className="bg-bone-100 py-12 px-6">
          <div className="max-w-editorial mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Quand ?', value: '5 et 6 décembre', sub: 'Samedi et dimanche · 2026' },
              { label: 'Où ?', value: 'EcoÉcole Tay Pichín', sub: 'San Marcos Sierras, Córdoba' },
              { label: 'Format', value: 'Intensif participatif', sub: '40 % théorie · 60 % pratique sur chantier' },
              { label: 'Animé par', value: 'Jonatan Palma', sub: 'Places limitées' },
            ].map(d => (
              <div key={d.label} className="bg-bone-50 p-5 border-l-4 border-clay-700">
                <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-2">{d.label}</p>
                <p className="font-display text-base text-ink-950">{d.value}</p>
                <p className="font-sans text-xs text-ink-700/70 mt-1">{d.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CONTENUS + PROGRAMME */}
        <section className="bg-ink-950 py-20 px-6">
          <div className="max-w-editorial mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-6">Contenus</p>
              <ul className="flex flex-col gap-3">
                {CONTENIDOS.map(c => (
                  <li key={c} className="flex items-center gap-3 font-sans text-sm text-bone-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-clay-700 flex-shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-6">Programme</p>
              <div className="flex flex-col gap-5">
                {PROGRAMA.map(p => (
                  <div key={p.dia} className="border-l-2 border-clay-700 pl-5">
                    <p className="font-sans font-bold text-sm text-bone-100 mb-1">{p.dia}</p>
                    <p className="font-sans text-sm text-bone-200 leading-relaxed">{p.actividades}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* TARIFS */}
        <section className="bg-bone-50 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="mb-10">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">Investissement</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950">Tarifs.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-2xl mb-10">
              {PRECIOS.map(p => (
                <div key={p.tipo} className={`p-8 text-center ${p.featured ? 'bg-clay-700' : 'bg-bone-100'}`}>
                  {p.featured && <span className="text-xs font-sans font-bold text-ink-950 bg-bone-50 px-2 py-1 inline-block mb-4">RECOMMANDÉ</span>}
                  <p className={`font-sans text-sm mb-3 ${p.featured ? 'text-bone-200' : 'text-ink-700'}`}>{p.tipo}</p>
                  <p className={`font-display text-3xl ${p.featured ? 'text-bone-50' : 'text-clay-700'}`}>{p.precio}</p>
                  <p className={`font-sans text-xs mt-2 ${p.featured ? 'text-bone-200/70' : 'text-ink-700/70'}`}>ARS · {p.usd}</p>
                </div>
              ))}
            </div>
            <p className="font-sans text-sm text-ink-700/70 italic mb-8">
              Comprend : toutes les activités pratiques du chantier, matériaux et accès à l'espace Tay Pichín.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://wa.me/5493549431594?text=Bonjour%2C%20je%20souhaite%20m%27inscrire%20%C3%A0%20le%20stage%20de%20Bioarchitecture%20de%20D%C3%A9cembre"
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
