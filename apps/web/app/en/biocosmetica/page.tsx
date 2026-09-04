import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { formatMoney } from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { listProducts } from '@/lib/commerce/products';

export const metadata: Metadata = {
  title: 'Agroecological Biocosmetics · Tay Pichín',
  description: 'Balms, repellents and mother tinctures handcrafted at Tay Pichín. Produced from a biodiverse agroecosystem. Real health sovereignty.',
  alternates: { canonical: '/en/biocosmetica' },
};

export const revalidate = 300;

export default async function BiocosmeticaEnPage() {
  const productos = await listProducts({ type: 'biocosmetic' });
  const unguentos = productos.filter((p) => p.slug.startsWith('unguento-'));
  const tinturas = productos.filter((p) => p.slug.startsWith('tintura-madre-'));
  const repelente = productos.find((p) => p.slug === 'repelente-natural');

  return (
    <>
      <SiteHeader locale="en" />
      <main>
      {/* HERO — group photo of all products outdoors */}
      <section className="relative h-[75vh] min-h-[520px] flex items-end overflow-hidden bg-ink-950">
        <Image
          src="/img/biocosmetica/productos-todos.jpg"
          alt="Agroecological balms, repellents and mother tinctures from Tay Pichín"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/30 to-transparent" />
        <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-16">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">
            Agroecological Biocosmetics · Tay Pichín
          </p>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-bone-50 leading-tight mb-6">
            The earth has<br />a <em>pharmacy.</em>
          </h1>
          <p className="font-sans text-base text-bone-200 max-w-xl leading-relaxed mb-8">
            Balms, repellents and mother tinctures handcrafted at our eco-school. Each product is born from a living agroecosystem — not from a laboratory.
          </p>
          <a
            href="#tinturas"
            className="inline-flex bg-bone-50 text-ink-950 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-bone-100 transition-colors"
          >
            Visit the store →
          </a>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="bg-bone-50 py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-5">
            Ecosystem services
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-10 leading-tight">
            When the ecosystem<br />is healthy, <em>so are you.</em>
          </h2>
          <div className="flex flex-col gap-5">
            <p className="font-sans text-base text-ink-700 leading-relaxed">
              A biodiverse agroecosystem doesn&apos;t just produce food — it produces health. Plants that grow in living soils, without agrochemicals, in regenerative cycles, accumulate a phytochemical intelligence that cannot be manufactured.
            </p>
            <p className="font-sans text-base text-ink-700 leading-relaxed">
              At Tay Pichín we cultivate and harvest these plants with ancestral practices that care for the water, the soil and biodiversity. Then we transform them by hand into preparations that strengthen real health — the kind that emerges from the balance between body and territory.
            </p>
            <p className="font-display text-xl text-clay-700 italic mt-2">
              To choose these products is to choose health sovereignty. It is to reconnect with the vital cycles of earth and water.
            </p>
          </div>
        </div>
      </section>

      {/* BALMS — purchasable */}
      <section id="unguentos" className="bg-bone-100 py-20 px-6 scroll-mt-24">
        <div className="max-w-editorial mx-auto">
          <div className="mb-12">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">
              Agroecological balms
            </p>
            <h2 className="font-display text-4xl text-ink-950 leading-tight">
              Plants that touch<br /><em>the skin.</em>
            </h2>
            <p className="mt-4 font-sans text-sm text-ink-700 max-w-lg leading-relaxed">
              Made from beeswax, plant oils and herbal macerations. No parabens, no synthetics, no petrochemicals. Choose, buy, and we coordinate shipping or pickup by WhatsApp.
            </p>
          </div>
          <ProductGrid products={unguentos} />
        </div>
      </section>

      {/* REPELLENT — purchasable (featured product) */}
      {repelente && (
        <section id="repelente" className="bg-clay-900 py-20 px-6 scroll-mt-24">
          <div className="max-w-editorial mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <Link href="/biocosmetica/repelente-natural" className="relative aspect-[4/3] overflow-hidden group">
              <Image
                src="/img/biocosmetica/repelente-foto.jpg"
                alt="Natural Insect Repellent · Tay Pichín — made with plants of the sierra woodland"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </Link>
            <div>
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">
                Agroecosystem in action
              </p>
              <h2 className="font-display text-4xl md:text-5xl text-bone-50 leading-tight mb-6">
                Natural Insect<br /><em>Repellent.</em>
              </h2>
              <p className="font-sans text-sm text-bone-200 leading-relaxed mb-4">
                Made with vegetable glycerin and essential oils of oregano, rue, garlic, calendula and clove — plants grown in our agroecosystem. Proven repellent action without neurotoxins, without DEET. 100 ml spray.
              </p>
              <div className="flex items-center gap-4 mb-6">
                <span className="font-display text-3xl text-bone-50">
                  {formatMoney(repelente.base_price_cents, repelente.currency as never)}
                </span>
                {repelente.stock !== null && repelente.stock <= 0 && (
                  <span className="text-xs font-sans uppercase tracking-widest text-clay-300">Sold out</span>
                )}
              </div>
              <Link
                href="/biocosmetica/repelente-natural"
                className="inline-flex bg-bone-50 text-clay-900 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-bone-100 transition-colors"
              >
                View & buy →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* MOTHER TINCTURES — purchasable */}
      <section id="tinturas" className="bg-bone-50 py-20 px-6 scroll-mt-24">
        <div className="max-w-editorial mx-auto">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">
              Plant medicine
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-ink-950 leading-tight mb-6">
              Agroecological<br /><em>Mother Tinctures.</em>
            </h2>
            <p className="font-sans text-sm text-ink-700 leading-relaxed">
              Plant-to-solvent ratio 1:1. 70% grain alcohol. Handcrafted from a biodiverse agroecosystem, managed with ancestral practices that regenerate the vital cycles of earth and water. Net content 15 cm³.
            </p>
          </div>
          <ProductGrid products={tinturas} />
          <div className="mt-10 bg-bone-100 border border-ink-950/10 p-5 rounded-xl">
            <p className="font-sans text-sm text-ink-700 leading-relaxed">
              <strong className="text-ink-950">Looking for another variety?</strong> Depending on the season we also have burdock, rosemary, horsetail, St. John&apos;s wort and more. Write to us on WhatsApp to check availability.
            </p>
          </div>
        </div>
      </section>

      {/* PRODUCTIVE SYSTEM */}
      <section className="bg-moss-900 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-300 mb-6">
            Producing ecosystem services
          </p>
          <h2 className="font-display text-4xl text-bone-50 mb-6 leading-tight">
            It&apos;s not cosmetics. <em>It&apos;s ecosystem.</em>
          </h2>
          <p className="font-sans text-sm text-bone-200 leading-relaxed max-w-2xl mx-auto">
            Every jar from Tay Pichín sustains a living productive system: soils that don&apos;t degrade, water that regenerates, pollinators that have habitat, knowledge that isn&apos;t lost. Real health emerges from this web of relationships — not from an isolated molecule.
          </p>
        </div>
      </section>

      {/* HOW TO ORDER */}
      <section className="bg-clay-700 py-20 px-6">
        <div className="max-w-editorial mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">Shipping & pickup</p>
            <h2 className="font-display text-4xl text-bone-50 mb-5 leading-tight">
              Buy online,<br /><em>we get it to you.</em>
            </h2>
            <p className="font-sans text-sm text-bone-200 leading-relaxed mb-6">
              Choose your products above and pay online. <strong className="text-bone-50">We ship across Argentina</strong> — shipping cost is coordinated by WhatsApp depending on your location — or you can <strong className="text-bone-50">pick up free of charge at Tay Pichín</strong>, San Marcos Sierras. Want larger quantities, a combo, or have questions? Write to us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://wa.me/5493549431594?text=Hi%21%20I%27m%20interested%20in%20Tay%20Pichín%20biocosmetics."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex bg-bone-50 text-clay-900 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-bone-100 transition-colors"
              >
                Write to us on WhatsApp →
              </a>
              <Link
                href="/en/tay-pichin"
                className="inline-flex border border-bone-50/50 text-bone-200 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:border-bone-50 hover:text-bone-50 transition-colors"
              >
                See Tay Pichín →
              </Link>
            </div>
          </div>
          <div className="bg-clay-900/30 border border-clay-900/20 p-6">
            <p className="font-sans font-bold text-sm text-bone-100 mb-4">You can also visit</p>
            <p className="font-sans text-sm text-bone-200 leading-relaxed mb-4">
              All products are available at Tay Pichín — our eco-school in San Marcos Sierras. If you come for a workshop, stay or immersion, you can take them home in person.
            </p>
            <p className="font-sans text-sm text-bone-200 leading-relaxed">
              We also run in-person bioconstruction and agroecology courses at the eco-school.
            </p>
            <Link
              href="/en/cursos"
              className="mt-4 inline-flex text-xs font-sans font-bold uppercase tracking-widest text-clay-300 hover:text-bone-50 transition-colors"
            >
              See all courses →
            </Link>
          </div>
        </div>
      </section>
    </main>
      <SiteFooter />
    </>
  );
}
