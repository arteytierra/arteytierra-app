import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { formatMoney } from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { listProducts } from '@/lib/commerce/products';

export const metadata: Metadata = {
  title: 'Biocosmétique Agroécologique · Tay Pichín',
  description: 'Baumes, répulsifs et teintures mères élaborés artisanalement à Tay Pichín. Produits à partir d’un agroécosystème biodivers. Une vraie souveraineté sanitaire.',
  alternates: { canonical: '/fr/biocosmetica' },
};

export const revalidate = 300;

export default async function BiocosmeticaFrPage() {
  const productos = await listProducts({ type: 'biocosmetic' });
  const unguentos = productos.filter((p) => p.slug.startsWith('unguento-'));
  const tinturas = productos.filter((p) => p.slug.startsWith('tintura-madre-'));
  const repelente = productos.find((p) => p.slug === 'repelente-natural');

  return (
    <>
      <SiteHeader locale="fr" />
      <main>
      {/* HERO — photo de groupe de tous les produits en extérieur */}
      <section className="relative h-[75vh] min-h-[520px] flex items-end overflow-hidden bg-ink-950">
        <Image
          src="/img/biocosmetica/productos-todos.jpg"
          alt="Baumes, répulsifs et teintures mères agroécologiques de Tay Pichín"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/30 to-transparent" />
        <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-16">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">
            Biocosmétique Agroécologique · Tay Pichín
          </p>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-bone-50 leading-tight mb-6">
            La terre a<br />une <em>pharmacie.</em>
          </h1>
          <p className="font-sans text-base text-bone-200 max-w-xl leading-relaxed mb-8">
            Baumes, répulsifs et teintures mères élaborés artisanalement dans notre éco-école. Chaque produit naît d&apos;un agroécosystème vivant — non d&apos;un laboratoire.
          </p>
          <a
            href="#tinturas"
            className="inline-flex bg-bone-50 text-ink-950 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-bone-100 transition-colors"
          >
            Voir la boutique →
          </a>
        </div>
      </section>

      {/* MANIFESTE */}
      <section className="bg-bone-50 py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-5">
            Services écosystémiques
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-10 leading-tight">
            Quand l&apos;écosystème<br />est sain, <em>vous aussi.</em>
          </h2>
          <div className="flex flex-col gap-5">
            <p className="font-sans text-base text-ink-700 leading-relaxed">
              Un agroécosystème biodivers ne produit pas seulement des aliments — il produit de la santé. Les plantes qui poussent dans des sols vivants, sans produits chimiques, en cycles régénératifs, accumulent une intelligence phytochimique impossible à fabriquer.
            </p>
            <p className="font-sans text-base text-ink-700 leading-relaxed">
              À Tay Pichín, nous cultivons et récoltons ces plantes selon des pratiques ancestrales qui prennent soin de l&apos;eau, du sol et de la biodiversité. Puis nous les transformons artisanalement en préparations qui renforcent la santé réelle — celle qui émerge de l&apos;équilibre entre le corps et le territoire.
            </p>
            <p className="font-display text-xl text-clay-700 italic mt-2">
              Choisir ces produits, c&apos;est choisir la souveraineté sanitaire. C&apos;est se reconnecter aux cycles vitaux de la terre et de l&apos;eau.
            </p>
          </div>
        </div>
      </section>

      {/* BAUMES — achetables */}
      <section id="unguentos" className="bg-bone-100 py-20 px-6 scroll-mt-24">
        <div className="max-w-editorial mx-auto">
          <div className="mb-12">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">
              Baumes agroécologiques
            </p>
            <h2 className="font-display text-4xl text-ink-950 leading-tight">
              Des plantes qui touchent<br /><em>la peau.</em>
            </h2>
            <p className="mt-4 font-sans text-sm text-ink-700 max-w-lg leading-relaxed">
              Élaborés à base de cire d&apos;abeille, d&apos;huiles végétales et de macérations de plantes. Sans parabènes, sans synthétiques, sans pétrochimie. Choisissez, achetez, et nous coordonnons l&apos;envoi ou le retrait par WhatsApp.
            </p>
          </div>
          <ProductGrid products={unguentos} />
        </div>
      </section>

      {/* RÉPULSIF — achetable (produit phare) */}
      {repelente && (
        <section id="repelente" className="bg-clay-900 py-20 px-6 scroll-mt-24">
          <div className="max-w-editorial mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <Link href="/biocosmetica/repelente-natural" className="relative aspect-[4/3] overflow-hidden group">
              <Image
                src="/img/biocosmetica/repelente-foto.jpg"
                alt="Répulsif Naturel Anti-Insectes · Tay Pichín — élaboré avec les plantes du bois serrano"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </Link>
            <div>
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">
                Agroécosystème en action
              </p>
              <h2 className="font-display text-4xl md:text-5xl text-bone-50 leading-tight mb-6">
                Répulsif Naturel<br /><em>Anti-Insectes.</em>
              </h2>
              <p className="font-sans text-sm text-bone-200 leading-relaxed mb-4">
                Élaboré avec de la glycérine végétale et des huiles essentielles d&apos;origan, de rue, d&apos;ail, de calendula et de clou de girofle — des plantes cultivées dans notre agroécosystème. Action répulsive éprouvée, sans neurotoxiques, sans DEET. Spray 100 ml.
              </p>
              <div className="flex items-center gap-4 mb-6">
                <span className="font-display text-3xl text-bone-50">
                  {formatMoney(repelente.base_price_cents, repelente.currency as never)}
                </span>
                {repelente.stock !== null && repelente.stock <= 0 && (
                  <span className="text-xs font-sans uppercase tracking-widest text-clay-300">Épuisé</span>
                )}
              </div>
              <Link
                href="/biocosmetica/repelente-natural"
                className="inline-flex bg-bone-50 text-clay-900 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-bone-100 transition-colors"
              >
                Voir et acheter →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* TEINTURES MÈRES — achetables */}
      <section id="tinturas" className="bg-bone-50 py-20 px-6 scroll-mt-24">
        <div className="max-w-editorial mx-auto">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">
              Médecine végétale
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-ink-950 leading-tight mb-6">
              Teintures Mères<br /><em>agroécologiques.</em>
            </h2>
            <p className="font-sans text-sm text-ink-700 leading-relaxed">
              Rapport plante-solvant 1:1. Alcool de céréales 70 %. Élaborées artisanalement à partir d&apos;un agroécosystème biodivers, géré selon des pratiques ancestrales qui régénèrent les cycles vitaux de la terre et de l&apos;eau. Contenu net 15 cm³.
            </p>
          </div>
          <ProductGrid products={tinturas} />
          <div className="mt-10 bg-bone-100 border border-ink-950/10 p-5 rounded-xl">
            <p className="font-sans text-sm text-ink-700 leading-relaxed">
              <strong className="text-ink-950">Vous cherchez une autre variété ?</strong> Selon la saison, nous avons aussi bardane, romarin, prêle, millepertuis et plus encore. Écrivez-nous sur WhatsApp pour vérifier la disponibilité.
            </p>
          </div>
        </div>
      </section>

      {/* SYSTÈME PRODUCTIF */}
      <section className="bg-moss-900 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-300 mb-6">
            Production de services écosystémiques
          </p>
          <h2 className="font-display text-4xl text-bone-50 mb-6 leading-tight">
            Ce n&apos;est pas de la cosmétique. <em>C&apos;est un écosystème.</em>
          </h2>
          <p className="font-sans text-sm text-bone-200 leading-relaxed max-w-2xl mx-auto">
            Chaque flacon de Tay Pichín soutient un système productif vivant : des sols qui ne se dégradent pas, une eau qui se régénère, des pollinisateurs qui ont un habitat, des savoirs qui ne se perdent pas. La santé réelle émerge de ce réseau de relations — non d&apos;une molécule isolée.
          </p>
        </div>
      </section>

      {/* COMMENT COMMANDER */}
      <section className="bg-clay-700 py-20 px-6">
        <div className="max-w-editorial mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">Envois et retrait</p>
            <h2 className="font-display text-4xl text-bone-50 mb-5 leading-tight">
              Achetez en ligne,<br /><em>nous vous l&apos;envoyons.</em>
            </h2>
            <p className="font-sans text-sm text-bone-200 leading-relaxed mb-6">
              Choisissez vos produits ci-dessus et payez en ligne. <strong className="text-bone-50">Nous expédions dans toute l&apos;Argentine</strong> — les frais d&apos;envoi sont coordonnés par WhatsApp selon votre localisation — ou vous pouvez <strong className="text-bone-50">retirer gratuitement à Tay Pichín</strong>, San Marcos Sierras. Vous voulez de plus grandes quantités, un combo, ou vous avez des questions ? Écrivez-nous.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://wa.me/5493549431594?text=Bonjour%21%20La%20biocosmétique%20de%20Tay%20Pichín%20m%27intéresse."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex bg-bone-50 text-clay-900 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-bone-100 transition-colors"
              >
                Écrivez-nous sur WhatsApp →
              </a>
              <Link
                href="/fr/tay-pichin"
                className="inline-flex border border-bone-50/50 text-bone-200 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:border-bone-50 hover:text-bone-50 transition-colors"
              >
                Voir Tay Pichín →
              </Link>
            </div>
          </div>
          <div className="bg-clay-900/30 border border-clay-900/20 p-6">
            <p className="font-sans font-bold text-sm text-bone-100 mb-4">Vous pouvez aussi visiter</p>
            <p className="font-sans text-sm text-bone-200 leading-relaxed mb-4">
              Tous les produits sont disponibles à Tay Pichín — notre éco-école à San Marcos Sierras. Si vous venez pour un atelier, un séjour ou une immersion, vous les emportez en main propre.
            </p>
            <p className="font-sans text-sm text-bone-200 leading-relaxed">
              Les cours d&apos;<strong className="text-bone-100">Alchimie Naturelle et Nettoyage Conscient</strong> vous apprennent à produire vos propres baumes, savons et préparations à base de plantes.
            </p>
            <Link
              href="/fr/cursos/alquimia-natural"
              className="mt-4 inline-flex text-xs font-sans font-bold uppercase tracking-widest text-clay-300 hover:text-bone-50 transition-colors"
            >
              Voir le cours Alchimie Naturelle →
            </Link>
          </div>
        </div>
      </section>
    </main>
      <SiteFooter />
    </>
  );
}
