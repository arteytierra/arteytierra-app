import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Écolodge Tay Pichín — Hébergement à San Marcos Sierras',
  description: 'Dormez dans une maison en terre vivante. Chambres partagées et privées en pleine nature des sierras. Réservez sur Booking, Airbnb ou directement.',
  alternates: { canonical: '/fr/hospedaje' },
};

const PRECIOS = [
  { tipo: 'Lit en dortoir partagé', precio: '$17.000', detalle: 'par nuit · mixte' },
  { tipo: 'Chambre privée · 1 personne', precio: '$35.000', detalle: 'par nuit' },
  { tipo: 'Chambre privée · 2 personnes', precio: '$45.000', detalle: 'par nuit' },
  { tipo: 'Chambre privée · 3 personnes', precio: '$55.000', detalle: 'par nuit' },
  { tipo: 'Chambre privée · 4 personnes', precio: '$65.000', detalle: 'par nuit' },
  { tipo: 'Location mensuelle · chambre partagée', precio: '$200.000', detalle: 'par mois' },
];

const AMENITIES = [
  { label: 'Cuisine équipée partagée', desc: 'Gaz, réfrigérateur, ustensiles. Cuisinez librement.' },
  { label: 'Petit-déjeuner en plein air', desc: 'Avec des produits du potager et du poulailler.' },
  { label: 'Biopiscine naturelle', desc: 'Bassin de biofiltration intégré au jardin.' },
  { label: 'Eau chaude solaire', desc: 'Chauffe-eau solaire et biofiltrage des eaux grises.' },
  { label: 'Toilettes sèches', desc: 'Système de compostage sans produits chimiques.' },
  { label: 'WiFi', desc: 'Connexion disponible dans les espaces communs.' },
  { label: 'Potager et jardin', desc: 'Entouré de nature, fruits et plantes médicinales.' },
  { label: 'Espaces communs avec mural', desc: 'Salon, salle à manger et galerie extérieure avec vues.' },
];

const RESENAS = [
  {
    plataforma: 'Google',
    autor: 'Marian Encinar',
    pais: 'Espagne',
    puntos: 5,
    texto: 'Un endroit idéal pour séjourner si vous cherchez la tranquillité et une atmosphère agréable. Le projet est très intéressant, on voit clairement qu\'il est fait avec amour. Cuisine entièrement équipée, biopiscine et plusieurs coins où l\'on se sent très à l\'aise. Mon partenaire et moi sommes restés 9 jours et c\'était trop court. Sans aucun doute, nous reviendrons.',
    highlight: 'Vue incroyable · Tranquille · Bon rapport qualité-prix',
  },
  {
    plataforma: 'Booking',
    autor: 'Pía',
    pais: 'Allemagne',
    puntos: 10,
    texto: 'L\'endroit est très charmant. Il offre une belle vue, est très vert et tout est pensé en accord avec le bien-être de la terre. Joni et la volontaire sont très aimables et je me suis senti comme à la maison.',
    highlight: 'Chambre Triple · 1 nuit · avril 2026',
  },
  {
    plataforma: 'Airbnb',
    autor: 'Sergio',
    pais: 'Argentine',
    puntos: 5,
    texto: 'Un endroit magnifique et tranquille. Jonatan et ses collaborateurs sont formidables. J\'espère que tout le monde copiera leurs façons de prendre soin de l\'environnement et de recycler. Je n\'avais jamais utilisé de toilettes sèches et je m\'y suis adapté sans problème.',
    highlight: 'Séjour de quelques nuits · juillet 2025',
  },
];

export default function HospedajeFrPage() {
  return (
    <>
      <SiteHeader locale="fr" />
      <main>
        {/* HERO */}
        <section className="relative h-[80vh] min-h-[560px] bg-ink-950 flex items-end overflow-hidden">
          <Image
            src="/img/taypichin/carousel/6.jpg"
            alt="Écolodge Tay Pichín — hébergement en terre"
            fill priority className="object-cover" sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/40 to-transparent" />
          <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-16">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">
              Écolodge · Tay Pichín · San Marcos Sierras
            </p>
            <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-3xl">
              Dormir dans une maison<br />de <em>terre vivante.</em>
            </h1>
            <p className="mt-5 font-sans text-base text-bone-200 max-w-2xl leading-relaxed">
              Hébergement en architecture naturelle et habitat régénératif. Pour ceux qui cherchent à se reposer dans un espace vivant, construit avec intention et en harmonie avec son environnement.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="https://www.booking.com/hotel/ar/ecohostel-tay-pichin.fr.html" target="_blank" rel="noopener noreferrer" className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors">
                Réserver sur Booking →
              </a>
              <a href="https://www.airbnb.com.ar/rooms/1346556039732742474" target="_blank" rel="noopener noreferrer" className="inline-flex border border-bone-50/50 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:border-bone-50 transition-colors">
                Réserver sur Airbnb →
              </a>
            </div>
          </div>
        </section>

        {/* GALERIE */}
        <section className="bg-ink-950 py-4 px-4">
          <div className="max-w-wide mx-auto grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              '/img/taypichin/carousel/8.jpg',
              '/img/taypichin/carousel/10.jpg',
              '/img/taypichin/carousel/9.jpg',
              '/img/taypichin/carousel/7.jpg',
            ].map((src, i) => (
              <div key={i} className="relative aspect-square overflow-hidden">
                <Image src={src} alt="Écolodge Tay Pichín" fill className="object-cover hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 50vw, 25vw" />
              </div>
            ))}
          </div>
        </section>

        {/* TARIFS */}
        <section className="bg-bone-50 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="mb-12">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">Tarifs</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950">
                Options <em>d'hébergement.</em>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              {PRECIOS.map(p => (
                <div key={p.tipo} className="bg-bone-100 p-6 border-l-4 border-clay-700">
                  <p className="font-sans text-sm text-ink-700 mb-3">{p.tipo}</p>
                  <p className="font-display text-3xl text-clay-700">{p.precio}</p>
                  <p className="font-sans text-xs text-ink-700/70 mt-1">{p.detalle}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              <a href="https://www.booking.com/hotel/ar/ecohostel-tay-pichin.fr.html" target="_blank" rel="noopener noreferrer" className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors">
                Booking.com →
              </a>
              <a href="https://www.airbnb.com.ar/rooms/1346556039732742474" target="_blank" rel="noopener noreferrer" className="inline-flex border border-ink-950 text-ink-950 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-ink-950 hover:text-bone-50 transition-colors">
                Airbnb →
              </a>
              <a href="https://wa.me/5493549431594?text=Bonjour%21%20Je%20souhaite%20r%C3%A9server%20%C3%A0%20l%27%C3%A9colodge%20Tay%20Pich%C3%ADn." target="_blank" rel="noopener noreferrer" className="inline-flex border border-ink-950 text-ink-950 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-ink-950 hover:text-bone-50 transition-colors">
                WhatsApp →
              </a>
            </div>
          </div>
        </section>

        {/* COMMODITÉS */}
        <section className="bg-ink-950 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="mb-12">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">Commodités</p>
              <h2 className="font-display text-4xl md:text-5xl text-bone-50">
                Ce que vous<br /><em>trouverez ici.</em>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {AMENITIES.map(a => (
                <div key={a.label} className="border-t border-clay-700 pt-5">
                  <h3 className="font-sans font-bold text-sm text-bone-100 mb-2">{a.label}</h3>
                  <p className="font-sans text-sm text-bone-200 leading-relaxed">{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AVIS */}
        <section className="bg-bone-100 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">Avis</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950">
                Ce que disent nos <em>hôtes.</em>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {RESENAS.map((r, i) => (
                <div key={i} className="bg-bone-50 p-8 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700">{r.plataforma}</span>
                    <span className="text-clay-700">{'★'.repeat(Math.min(r.puntos, 5))}</span>
                  </div>
                  <p className="font-sans text-sm text-ink-700 leading-relaxed flex-1">"{r.texto}"</p>
                  <div className="mt-auto border-t border-bone-200 pt-4">
                    <p className="font-sans font-bold text-sm text-ink-950">— {r.autor}</p>
                    <p className="font-sans text-xs text-ink-700/70">{r.pais} · {r.highlight}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LOCALISATION */}
        <section className="bg-clay-700 py-16 px-6">
          <div className="max-w-editorial mx-auto">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">Localisation</p>
            <h2 className="font-display text-4xl md:text-5xl text-bone-50 mb-5">
              San Marcos Sierras,<br /><em>Córdoba, Argentine.</em>
            </h2>
            <p className="font-sans text-base text-bone-200 max-w-lg leading-relaxed mb-8">
              À 2 heures de la ville de Córdoba. Accès depuis Buenos Aires par Flecha Bus ou vol + transfert.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="https://maps.google.com/?q=Tay+Pichin+San+Marcos+Sierras" target="_blank" rel="noopener noreferrer" className="inline-flex bg-bone-50 text-clay-900 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-bone-100 transition-colors">
                Voir sur Google Maps →
              </a>
              <Link href="/fr/tay-pichin" className="inline-flex border border-bone-50/50 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:border-bone-50 transition-colors">
                En savoir plus sur Tay Pichín →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
