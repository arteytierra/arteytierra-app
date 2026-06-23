import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { formatMoney } from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { listProducts } from '@/lib/commerce/products';

export const metadata: Metadata = {
  title: 'Biocosmética Agroecológica — Arte y Tierra · Tay Pichín',
  description: 'Ungüentos, repelentes y tinturas madre elaborados artesanalmente en Tay Pichín. Producidos desde un agroecosistema biodiverso. Soberanía sanitaria real.',
  alternates: { canonical: '/biocosmetica' },
};

export const revalidate = 300;

export default async function BiocosmeticaPage() {
  const productos = await listProducts({ type: 'biocosmetic' });
  const unguentos = productos.filter((p) => p.slug.startsWith('unguento-'));
  const tinturas = productos.filter((p) => p.slug.startsWith('tintura-madre-'));
  const repelente = productos.find((p) => p.slug === 'repelente-natural');

  return (
    <>
      <SiteHeader />
      <main>
      {/* HERO — foto grupal de todos los productos al aire libre */}
      <section className="relative h-[75vh] min-h-[520px] flex items-end overflow-hidden bg-ink-950">
        <Image
          src="/img/biocosmetica/productos-todos.jpg"
          alt="Ungüentos, repelentes y tinturas madre agroecológicos de Tay Pichín"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/30 to-transparent" />
        <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-16">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">
            Biocosmética Agroecológica · Tay Pichín
          </p>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-bone-50 leading-tight mb-6">
            La tierra tiene<br />una <em>farmacia.</em>
          </h1>
          <p className="font-sans text-base text-bone-200 max-w-xl leading-relaxed mb-8">
            Ungüentos, repelentes y tinturas madre elaborados artesanalmente en nuestra ecoescuela. Cada producto nace de un agroecosistema vivo — no de un laboratorio.
          </p>
          <a
            href="#tinturas"
            className="inline-flex bg-bone-50 text-ink-950 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-bone-100 transition-colors"
          >
            Ver la tienda →
          </a>
        </div>
      </section>

      {/* MANIFIESTO */}
      <section className="bg-bone-50 py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-5">
            Servicios ecosistémicos
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-10 leading-tight">
            Cuando el ecosistema<br />está sano, <em>vos también.</em>
          </h2>
          <div className="flex flex-col gap-5">
            <p className="font-sans text-base text-ink-700 leading-relaxed">
              Un agroecosistema biodiverso no solo produce alimentos — produce salud. Las plantas que crecen en suelos vivos, sin agroquímicos, en ciclos regenerativos, acumulan inteligencia fitoquímica que no se puede fabricar.
            </p>
            <p className="font-sans text-base text-ink-700 leading-relaxed">
              En Tay Pichín cultivamos y recolectamos estas plantas con prácticas ancestrales que cuidan el agua, el suelo y la biodiversidad. Luego las transformamos artesanalmente en preparados que potencian la salud real — la que emerge del equilibrio entre el cuerpo y el territorio.
            </p>
            <p className="font-display text-xl text-clay-700 italic mt-2">
              Elegir estos productos es elegir soberanía sanitaria. Es reconectarse con los ciclos vitales de la tierra y el agua.
            </p>
          </div>
        </div>
      </section>

      {/* UNGÜENTOS — comprables */}
      <section id="unguentos" className="bg-bone-100 py-20 px-6 scroll-mt-24">
        <div className="max-w-editorial mx-auto">
          <div className="mb-12">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">
              Ungüentos agroecológicos
            </p>
            <h2 className="font-display text-4xl text-ink-950 leading-tight">
              Plantas que tocan<br /><em>la piel.</em>
            </h2>
            <p className="mt-4 font-sans text-sm text-ink-700 max-w-lg leading-relaxed">
              Elaborados a base de cera de abejas, aceites vegetales y macerados herbales. Sin parabenos, sin sintéticos, sin petroquímicos. Elegí, comprá y coordinamos el envío o retiro por WhatsApp.
            </p>
          </div>
          <ProductGrid products={unguentos} />
        </div>
      </section>

      {/* REPELENTE — comprable (producto destacado) */}
      {repelente && (
        <section id="repelente" className="bg-clay-900 py-20 px-6 scroll-mt-24">
          <div className="max-w-editorial mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <Link href="/biocosmetica/repelente-natural" className="relative aspect-[4/3] overflow-hidden group">
              <Image
                src="/img/biocosmetica/repelente-foto.jpg"
                alt="Repelente Natural de Insectos · Tay Pichín — elaborado con plantas del monte serrano"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </Link>
            <div>
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">
                Agroecosistema en acción
              </p>
              <h2 className="font-display text-4xl md:text-5xl text-bone-50 leading-tight mb-6">
                Repelente Natural<br /><em>de Insectos.</em>
              </h2>
              <p className="font-sans text-sm text-bone-200 leading-relaxed mb-4">
                Elaborado con glicerina vegetal y aceites esenciales de orégano, ruda, ajo, caléndula y clavo de olor — plantas cultivadas en nuestro agroecosistema. Acción repelente comprobada sin neurotóxicos, sin DEET. Spray 100 ml.
              </p>
              <div className="flex items-center gap-4 mb-6">
                <span className="font-display text-3xl text-bone-50">
                  {formatMoney(repelente.base_price_cents, repelente.currency as never)}
                </span>
                {repelente.stock !== null && repelente.stock <= 0 && (
                  <span className="text-xs font-sans uppercase tracking-widest text-clay-300">Agotado</span>
                )}
              </div>
              <Link
                href="/biocosmetica/repelente-natural"
                className="inline-flex bg-bone-50 text-clay-900 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-bone-100 transition-colors"
              >
                Ver y comprar →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* TINTURAS MADRE — comprables */}
      <section id="tinturas" className="bg-bone-50 py-20 px-6 scroll-mt-24">
        <div className="max-w-editorial mx-auto">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">
              Medicina vegetal
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-ink-950 leading-tight mb-6">
              Tinturas Madre<br /><em>agroecológicas.</em>
            </h2>
            <p className="font-sans text-sm text-ink-700 leading-relaxed">
              Relación planta-solvente 1:1. Alcohol de cereal 70%. Elaboradas artesanalmente desde un agroecosistema biodiverso, manejado con prácticas ancestrales que regeneran los ciclos vitales de la tierra y el agua. Contenido neto 15 cm³.
            </p>
          </div>
          <ProductGrid products={tinturas} />
          <div className="mt-10 bg-bone-100 border border-ink-950/10 p-5 rounded-xl">
            <p className="font-sans text-sm text-ink-700 leading-relaxed">
              <strong className="text-ink-950">¿Buscás otra variedad?</strong> Según la temporada también tenemos bardana, romero, cola de caballo, hipérico y más. Escribinos por WhatsApp y consultanos disponibilidad.
            </p>
          </div>
        </div>
      </section>

      {/* SISTEMA PRODUCTIVO */}
      <section className="bg-moss-900 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-300 mb-6">
            Producción de servicios ecosistémicos
          </p>
          <h2 className="font-display text-4xl text-bone-50 mb-6 leading-tight">
            No es cosmética. <em>Es ecosistema.</em>
          </h2>
          <p className="font-sans text-sm text-bone-200 leading-relaxed max-w-2xl mx-auto">
            Cada frasco de Tay Pichín sostiene un sistema productivo vivo: suelos que no se degradan, agua que se regenera, polinizadores que tienen hábitat, saberes que no se pierden. La salud real emerge de esta red de relaciones — no de una molécula aislada.
          </p>
        </div>
      </section>

      {/* CÓMO PEDIR */}
      <section className="bg-clay-700 py-20 px-6">
        <div className="max-w-editorial mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">Envíos y retiro</p>
            <h2 className="font-display text-4xl text-bone-50 mb-5 leading-tight">
              Comprá online,<br /><em>te lo hacemos llegar.</em>
            </h2>
            <p className="font-sans text-sm text-bone-200 leading-relaxed mb-6">
              Elegí tus productos arriba, pagás online y coordinamos el envío o el retiro en Tay Pichín por WhatsApp. ¿Querés cantidades mayores, un combo o tenés dudas? Escribinos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://wa.me/5493549431594?text=Hola%21%20Me%20interesa%20la%20biocosmética%20de%20Tay%20Pichín."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex bg-bone-50 text-clay-900 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-bone-100 transition-colors"
              >
                Escribinos por WhatsApp →
              </a>
              <Link
                href="/tay-pichin"
                className="inline-flex border border-bone-50/50 text-bone-200 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:border-bone-50 hover:text-bone-50 transition-colors"
              >
                Ver Tay Pichín →
              </Link>
            </div>
          </div>
          <div className="bg-clay-900/30 border border-clay-900/20 p-6">
            <p className="font-sans font-bold text-sm text-bone-100 mb-4">También podés visitar</p>
            <p className="font-sans text-sm text-bone-200 leading-relaxed mb-4">
              Todos los productos están disponibles en Tay Pichín — nuestra ecoescuela en San Marcos Sierras. Si venís a un taller, estadía o inmersión, los llevás en mano.
            </p>
            <p className="font-sans text-sm text-bone-200 leading-relaxed">
              Los cursos de <strong className="text-bone-100">Alquimia Natural y Limpieza Consciente</strong> te enseñan a producir tus propios ungüentos, jabones y preparados herbales.
            </p>
            <Link
              href="/cursos/alquimia-natural"
              className="mt-4 inline-flex text-xs font-sans font-bold uppercase tracking-widest text-clay-300 hover:text-bone-50 transition-colors"
            >
              Ver curso Alquimia Natural →
            </Link>
          </div>
        </div>
      </section>
    </main>
      <SiteFooter />
    </>
  );
}
