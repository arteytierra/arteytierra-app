import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Tay Pichín — Écoécole et Écolodge | Arte y Tierra',
  description: 'Tay Pichín : écoécole et écolodge à San Marcos Sierras, Córdoba. Siège physique d\'Arte y Tierra. Ateliers, hébergement et bénévolat.',
  alternates: { canonical: '/fr/tay-pichin' },
};

export default function TayPichinFrPage() {
  return (
    <>
      <SiteHeader locale="fr" />
      <main>
        {/* HERO */}
        <section className="relative h-[80vh] min-h-[560px] bg-ink-950 flex items-end overflow-hidden">
          <Image
            src="/img/taypichin/1.jpg"
            alt="Tay Pichín — Écoécole et Écolodge à San Marcos Sierras"
            fill priority className="object-cover" sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/40 to-transparent" />
          <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-16">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">
              San Marcos Sierras · Córdoba · Argentine
            </p>
            <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-3xl">
              Tay Pichín.<br />La <em>racine</em> de tout.
            </h1>
            <p className="mt-5 font-sans text-base text-bone-200 max-w-2xl leading-relaxed">
              <strong className="text-bone-100">Tay Pichín Vit et Bat.</strong> Un espace où l'on ne fait pas que séjourner : on s'y retrouve. Avec soi-même, avec la Terre, avec d'autres façons possibles de vivre.
            </p>
          </div>
        </section>

        {/* INTRO */}
        <section className="bg-ink-950 py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="font-display text-2xl md:text-3xl text-bone-100 leading-relaxed italic">
              Tay Pichín est le <strong className="not-italic text-clay-300">siège physique</strong> d'Arte y Tierra.
              Écoécole, écolodge et lieu de rencontre pour ceux qui veulent{' '}
              <strong className="not-italic text-clay-300">apprendre en faisant.</strong>
            </p>
          </div>
        </section>

        {/* FORME D'HABITER */}
        <section className="bg-clay-900 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: '🌧️',
                  text: "Chaque goutte d'eau est soignée. Nous appliquons le design hydrologique : récupération des eaux de pluie, infiltration par terrasses et fossés, phytoremédiation des eaux grises et toilettes sèches.",
                },
                {
                  icon: '🌱',
                  text: 'Nous cultivons des aliments dans des agroécosystèmes qui coopèrent avec la forêt indigène. Nous produisons des champignons comestibles et élevons des poules pondeuses.',
                },
                {
                  icon: '♻️',
                  text: "Nous trions les déchets, faisons du compost et des écobriques : rien ne se perd. Nous régénérons les cycles de l'eau et de la terre.",
                },
              ].map((item, i) => (
                <div key={i} className="p-8 bg-clay-700/20 text-center">
                  <div className="text-4xl mb-5">{item.icon}</div>
                  <p className="font-sans text-sm text-bone-200 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
            <p className="mt-12 text-center font-display text-lg text-bone-100 italic max-w-2xl mx-auto leading-relaxed">
              Un espace où l'on cultive la conscience de l'habiter quotidien, où l'on apprend en faisant et où l'on partage depuis le cœur.
            </p>
          </div>
        </section>

        {/* ÉCOÉCOLE */}
        <section className="bg-bone-50 py-20 px-6">
          <div className="max-w-wide mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">Écoécole</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-6 leading-tight">
                Apprenez avec <em>technique, théorie et pratique.</em>
              </h2>
              <p className="font-sans text-base text-ink-700 leading-relaxed mb-8">
                Ateliers, formations et stages immersifs en bioconstruction et design du territoire. Apprentissage avec des projets réels, dans un espace construit avec les mêmes techniques que nous enseignons. Des ateliers courts de week-end aux programmes intensifs qui traversent toutes les étapes d'un véritable chantier.
              </p>
              <Link href="/fr/cursos" className="inline-flex border border-ink-950 text-ink-950 font-sans font-bold text-sm uppercase tracking-widest px-6 py-3.5 hover:bg-ink-950 hover:text-bone-50 transition-colors">
                Voir les formations ouvertes →
              </Link>
            </div>
            <div className="relative h-[480px] overflow-hidden">
              <Image src="/img/taypichin/carousel/5.jpg" alt="Écoécole Tay Pichín" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
            </div>
          </div>
        </section>

        {/* ÉCOLODGE */}
        <section className="bg-clay-900 py-20 px-6">
          <div className="max-w-wide mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-[480px] overflow-hidden order-2 lg:order-1">
              <Image src="/img/taypichin/carousel/1.jpg" alt="Écolodge Tay Pichín" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-400 mb-4">Écolodge</p>
              <h2 className="font-display text-4xl md:text-5xl text-bone-50 mb-6 leading-tight">
                Dormir au cœur de la <em>terre.</em>
              </h2>
              <p className="font-sans text-base text-bone-200 leading-relaxed mb-4">
                Hébergement en architecture de terre et habitat régénératif. Pour ceux qui cherchent à se reposer dans un espace vivant, construit avec intention et en harmonie avec son environnement.
              </p>
              <p className="font-sans text-base text-bone-200 leading-relaxed mb-8">
                Ici, vous pouvez observer, apprendre ou prendre part à des pratiques comme la bioconstruction, l'agroécologie, le soin de l'eau et la vie communautaire. Chaque séjour soutient des processus locaux.
              </p>
              <div className="flex items-center gap-3 mb-8 bg-bone-50/5 px-4 py-3 w-fit">
                <div className="bg-clay-700 text-bone-50 font-bold text-lg px-3 py-1">7,5</div>
                <div className="text-sm text-bone-200 leading-tight">
                  <strong className="text-bone-100">Booking.com</strong><br />
                  <span className="opacity-75">59 avis vérifiés</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href="https://www.booking.com/hotel/ar/ecohostel-tay-pichin.fr.html" target="_blank" rel="noopener noreferrer" className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-6 py-3.5 hover:bg-clay-900 transition-colors">
                  Réserver sur Booking →
                </a>
                <a href="https://www.airbnb.com.ar/rooms/1346556039732742474" target="_blank" rel="noopener noreferrer" className="inline-flex border border-bone-200/50 text-bone-200 font-sans font-bold text-sm uppercase tracking-widest px-6 py-3.5 hover:border-bone-50 hover:text-bone-50 transition-colors">
                  Réserver sur Airbnb
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* IMMERSION VIVANTE */}
        <section className="bg-bone-100 py-20 px-6">
          <div className="max-w-editorial mx-auto text-center">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">Immersion Vivante</p>
            <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-6">
              Immersion <em>Vivante.</em>
            </h2>
            <p className="font-sans text-base text-ink-700 leading-relaxed max-w-2xl mx-auto mb-12">
              Périodes de formation aux pratiques permaculturelles. Bioconstruction, agroécologie et organisation collective — apprises dans la pratique quotidienne. Pendant votre séjour, vous prenez part à des processus réels, en intégrant une façon d'habiter plus consciente, simple et reliée à la terre.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-10">
              <div className="bg-ink-950 p-10 text-center">
                <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">Processus Initial</p>
                <hr className="border-clay-700/30 mb-6" />
                <p className="font-sans text-sm text-bone-200 leading-relaxed mb-4">
                  <strong className="text-bone-100">Camping</strong> — repas de base et hébergement en zone de camping.
                </p>
                <p className="font-display text-3xl text-clay-700">$35.000 ARS / sem.</p>
              </div>
              <div className="bg-clay-900 p-10 text-center">
                <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-400 mb-4">Processus Profond</p>
                <hr className="border-clay-700/30 mb-6" />
                <p className="font-sans text-sm text-bone-200 leading-relaxed mb-4">
                  <strong className="text-bone-100">Chambre partagée</strong> — repas de base et chambre partagée.
                </p>
                <p className="font-display text-3xl text-clay-700">$50.000 ARS / sem.</p>
              </div>
            </div>
            <p className="font-sans text-sm text-clay-700 font-bold tracking-wide mb-8">
              📅 L'arrivée se fait uniquement les lundis.
            </p>
            <Link href="/fr/cursos" className="inline-flex border border-ink-950 text-ink-950 font-sans font-bold text-sm uppercase tracking-widest px-6 py-3.5 hover:bg-ink-950 hover:text-bone-50 transition-colors">
              Découvrir Immersion Vivante →
            </Link>
          </div>
        </section>

        {/* VIDEO BARROFEST */}
        <section className="bg-ink-950 py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">Évènements · Barrofest</p>
              <h2 className="font-display text-3xl text-bone-50">Un festival de <em>bioconstruction.</em></h2>
              <p className="mt-2 font-sans text-sm text-bone-300/70">(en espagnol)</p>
            </div>
            <div className="relative aspect-video bg-ink-800 overflow-hidden">
              <iframe
                className="absolute inset-0 w-full h-full border-0"
                src="https://www.youtube.com/embed/Kk8TfOtih2s"
                title="Barrofest — festival de bioconstruction à Tay Pichín"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        {/* LOCALISATION */}
        <section className="bg-ink-950 py-20 px-6 text-center">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">Localisation</p>
          <h2 className="font-display text-4xl md:text-5xl text-bone-50 mb-5">
            Comment arriver à <em>Tay Pichín.</em>
          </h2>
          <p className="font-sans text-base text-bone-200 max-w-md mx-auto mb-8 leading-relaxed">
            San Marcos Sierras, Province de Córdoba, Argentine. À 2 heures de la ville de Córdoba — à 12 heures de Buenos Aires.
          </p>
          <a
            href="https://maps.google.com/?q=San+Marcos+Sierras+Cordoba"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors"
          >
            Voir sur Google Maps →
          </a>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
