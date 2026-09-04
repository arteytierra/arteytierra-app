import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Immersion Vivante — Tay Pichín',
  description: 'Immersion Vivante à Tay Pichín : notre version du volontariat éducatif. Bioconstruction, agroécologie et organisation collective sur le territoire. San Marcos Sierras, Córdoba.',
  alternates: { canonical: '/fr/cursos/inmersion-viva' },
};

const AREAS = [
  {
    icon: '🏗',
    title: 'Bioconstruction',
    items: ['Techniques en terre crue', 'Lecture et usage des matériaux locaux', 'Critères constructifs en chantier réel', 'Enduits et finitions naturelles'],
  },
  {
    icon: '🌱',
    title: 'Agroécologie',
    items: ['Gestion du potager et des systèmes vivants', 'Sol, compost et bio-intrants', 'Intégration végétal-animal', 'Forêt comestible et zone 1'],
  },
  {
    icon: '🌿',
    title: 'Biocosmétique',
    items: ['Récolte et séchage de plantes médicinales', 'Macérations en huile et alcool', 'Teintures mères artisanales', 'Onguents, crèmes et préparations naturelles'],
  },
  {
    icon: '💧',
    title: 'Conception hydrologique',
    items: ['Lecture du paysage', 'Eau, climat et topographie', 'Introduction à la conception hydrologique', 'Observation des bassins versants'],
  },
  {
    icon: '🎓',
    title: 'Participation aux formations',
    items: ['Accès libre aux ateliers organisés à l\'écoécole pendant votre séjour', 'Participation à l\'équipe logistique des formations', 'Apprentissage depuis l\'intérieur de l\'organisation pédagogique'],
  },
  {
    icon: '🤝',
    title: 'Vie communautaire',
    items: ['Cercles de parole', 'Assemblées et prise de décision collective', 'Gestion de l\'habitat collectif', 'Vie quotidienne à l\'écoécole'],
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
              🌿 Volontariat éducatif · Dès 2 semaines
            </p>
            <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-3xl">
              Immersion <em>Vivante.</em>
            </h1>
            <p className="mt-3 font-display text-xl text-clay-300 italic">
              Notre version du volontariat.
            </p>
            <p className="mt-4 font-sans text-base text-bone-200 max-w-2xl leading-relaxed">
              Vous ne venez pas travailler, vous venez apprendre un métier aux côtés de celles et ceux qui le portent chaque jour.
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
            <p className="font-sans text-base text-ink-700 leading-relaxed mb-4">
              À Tay Pichín, il n'y a pas de liste de tâches à cocher : il y a des formateurs de métier, qui transmettent un savoir qui passe de main en main depuis que l'être humain a découvert l'argile. Bioconstruction, agroécologie, organisation collective — tout s'apprend en le faisant, intégré à la vie quotidienne de l'écoécole.
            </p>
            <p className="font-sans text-base text-ink-700 leading-relaxed">
              Un projet qui n'a pas cessé depuis novembre 2020, héritier d'une tradition de volontariat itinérant qu'Arte y Tierra soutient depuis 2014 entre l'Argentine, la Colombie, l'Équateur, la France, l'Italie et le Pérou.
            </p>
            <Link href="/fr/nosotros" className="inline-flex items-center gap-1.5 mt-6 font-sans text-sm font-semibold text-moss-700 hover:text-moss-900 transition-colors">
              Découvrez notre histoire et notre parcours →
            </Link>
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
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">Votre contribution</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950">
                Elle nous <em>pousse à continuer notre travail.</em>
              </h2>
              <p className="mt-4 font-sans text-sm text-ink-700 max-w-lg leading-relaxed">
                Ce n'est pas un paiement pour travailler : c'est ce qui soutient un projet éducatif ouvert 365 jours par an — cela couvre votre alimentation et les frais de fonctionnement pendant votre séjour parmi nous.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mb-10">
              <div className="bg-ink-950 p-10">
                <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">En zone de camping</p>
                <hr className="border-clay-700/30 mb-6" />
                <p className="font-sans text-sm text-bone-200 leading-relaxed mb-4">
                  <strong className="text-bone-100">Alimentation complète</strong> et emplacement de camping à Tay Pichín.
                </p>
                <p className="font-display text-3xl text-clay-700">$40.000 ARS / sem.</p>
              </div>
              <div className="bg-clay-900 p-10">
                <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-400 mb-4">En chambre partagée</p>
                <hr className="border-clay-700/30 mb-6" />
                <p className="font-sans text-sm text-bone-200 leading-relaxed mb-4">
                  <strong className="text-bone-100">Alimentation complète</strong> et chambre partagée à Tay Pichín.
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
