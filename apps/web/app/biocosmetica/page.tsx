import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Biocosmética Agroecológica — Arte y Tierra · Tay Pichín',
  description: 'Ungüentos, repelentes y tinturas madre elaborados artesanalmente en Tay Pichín. Producidos desde un agroecosistema biodiverso. Soberanía sanitaria real.',
  alternates: { canonical: '/biocosmetica' },
};

const UNGUENTOS = [
  {
    nombre: 'Crema Santa',
    img: '/img/biocosmetica/unguento-1.png',
    plantas: 'Ruda · Menta · Salvia',
    uso: 'Para masajes en zonas con contracturas, dolores musculares y cansancio corporal. Aplicar con masaje suave hasta su absorción.',
    isPhoto: false,
  },
  {
    nombre: 'Calmante',
    img: '/img/biocosmetica/unguento-2.png',
    plantas: 'Caléndula · Malva · Lavanda',
    uso: 'Acompaña piel sensible, irritaciones leves y momentos de enrojecimiento. Aplicar una pequeña cantidad sobre la zona a tratar.',
    isPhoto: false,
  },
  {
    nombre: 'Protector',
    img: '/img/biocosmetica/unguento-3.png',
    plantas: 'Caléndula · Malva · Jarilla',
    uso: 'Protege, repara y nutre la piel expuesta al sol, viento o resequedad. Aplicar diariamente con masaje suave.',
    isPhoto: false,
  },
  {
    nombre: 'Relajante',
    img: '/img/biocosmetica/unguento-relajante-menta.jpg',
    plantas: 'Plantas del monte serrano',
    uso: 'Para relajar la musculatura profunda y aliviar el estrés acumulado. Aroma terroso y silvestre.',
    isPhoto: true,
  },
];

const TINTURAS = [
  {
    nombre: 'Cannabis',
    planta: 'Cannabis sativa',
    props: 'Relajante, analgésica. Apoya el equilibrio del sistema nervioso y alivia tensiones musculares y el estrés crónico.',
  },
  {
    nombre: 'Ruda',
    planta: 'Ruta graveolens',
    props: 'Espasmolítica, reguladora del ciclo menstrual. Protección energética y apoyo en procesos digestivos.',
  },
  {
    nombre: 'Oreganón',
    planta: 'Origanum vulgare',
    props: 'Digestiva, antiséptica. Apoya funciones inmunes y favorece digestiones livianas.',
  },
  {
    nombre: 'Caléndula',
    planta: 'Calendula officinalis',
    props: 'Antiinflamatoria, cicatrizante. Regenera mucosas y apoya la piel sensible desde adentro.',
  },
  {
    nombre: 'Menta',
    planta: 'Mentha x piperita',
    props: 'Digestiva, carminativa, antiespasmódica. Alivia espasmos abdominales y equilibra el sistema digestivo-nervioso.',
  },
];

export default function BiocosmeticaPage() {
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
          <p className="font-sans text-base text-bone-200 max-w-xl leading-relaxed">
            Ungüentos, repelentes y tinturas madre elaborados artesanalmente en nuestra ecoescuela. Cada producto nace de un agroecosistema vivo — no de un laboratorio.
          </p>
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

      {/* UNGÜENTOS */}
      <section className="bg-bone-100 py-20 px-6">
        <div className="max-w-editorial mx-auto">
          <div className="mb-12">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">
              Ungüentos agroecológicos
            </p>
            <h2 className="font-display text-4xl text-ink-950 leading-tight">
              Plantas que tocan<br /><em>la piel.</em>
            </h2>
            <p className="mt-4 font-sans text-sm text-ink-700 max-w-lg leading-relaxed">
              Elaborados a base de cera de abejas, aceites vegetales y macerados herbales. Sin parabenos, sin sintéticos, sin petroquímicos.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {UNGUENTOS.map((u) => (
              <div key={u.nombre} className="bg-bone-50 overflow-hidden">
                <div className={`relative ${u.isPhoto ? 'aspect-[4/3]' : 'aspect-square bg-[#f5f0eb] flex items-center justify-center p-8'}`}>
                  {u.isPhoto ? (
                    <Image
                      src={u.img}
                      alt={`Ungüento ${u.nombre} · Tay Pichín`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <Image
                      src={u.img}
                      alt={`Ungüento ${u.nombre} · Tay Pichín`}
                      width={200}
                      height={200}
                      className="object-contain drop-shadow-md"
                    />
                  )}
                </div>
                <div className="p-5">
                  <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-1">
                    Ungüento agroecológico
                  </p>
                  <h3 className="font-display text-2xl text-ink-950 mb-2">{u.nombre}</h3>
                  <p className="text-xs font-sans text-moss-700 font-bold mb-3">{u.plantas}</p>
                  <p className="font-sans text-sm text-ink-700 leading-relaxed">{u.uso}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REPELENTE */}
      <section className="bg-clay-900 py-20 px-6">
        <div className="max-w-editorial mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src="/img/biocosmetica/repelente-foto.jpg"
              alt="Repelente Natural de Insectos · Tay Pichín — elaborado con plantas del monte serrano"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div>
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">
              Agroecosistema en acción
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-bone-50 leading-tight mb-6">
              Repelente Natural<br /><em>de Insectos.</em>
            </h2>
            <p className="font-sans text-sm text-bone-200 leading-relaxed mb-4">
              Elaborado con glicerina vegetal, aceites esenciales de orégano, ruda, ajo, caléndula y clavo de olor — plantas cultivadas en nuestro agroecosistema. Acción repelente comprobada sin neurotóxicos, sin DEET.
            </p>
            <p className="font-sans text-sm text-bone-200 leading-relaxed mb-6">
              Spray 100ml. Agitar antes de usar. Aplicar sobre ropa y piel, reaplicar cada 2 a 3 horas. No aplicar directamente en mucosas, piel irritada ni en menores de 2 años.
            </p>
            <div className="flex items-center gap-3 bg-clay-700/30 border border-clay-700/50 px-4 py-3">
              <span className="font-sans font-bold text-sm text-clay-300">✦</span>
              <span className="font-sans text-sm text-bone-200 leading-relaxed">
                Elaborado con plantas y saberes del monte serrano
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* TINTURAS MADRE */}
      <section className="bg-ink-950 py-20 px-6">
        <div className="max-w-editorial mx-auto">
          <div className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            <div>
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">
                Medicina vegetal
              </p>
              <h2 className="font-display text-4xl md:text-5xl text-bone-50 leading-tight mb-6">
                Tinturas Madre<br /><em>agroecológicas.</em>
              </h2>
              <p className="font-sans text-sm text-bone-200 max-w-xl leading-relaxed">
                Relación planta-solvente 1:1. Alcohol de cereal 70%. Elaboradas artesanalmente desde un agroecosistema biodiverso, manejado con prácticas ancestrales que regeneran los ciclos vitales de la tierra y el agua. Contenido neto 15 cm³.
              </p>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src="/img/biocosmetica/tinturas-todas.jpg"
                alt="Tinturas Madre Cannabis, Ruda, Oreganón y Caléndula · Tay Pichín"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {TINTURAS.map((t) => (
              <div key={t.nombre} className="bg-clay-700/10 border border-clay-700/30 p-5">
                <p className="font-sans font-bold text-sm text-clay-300 mb-0.5">Tintura Madre</p>
                <h3 className="font-display text-xl text-bone-50 mb-1">{t.nombre}</h3>
                <p className="text-xs font-sans italic text-clay-500 mb-2">{t.planta}</p>
                <p className="font-sans text-xs text-bone-200 leading-relaxed">{t.props}</p>
              </div>
            ))}
          </div>
          <div className="bg-clay-700/10 border border-clay-700/30 p-5">
            <p className="font-sans text-sm text-bone-200 leading-relaxed">
              <strong className="text-bone-100">Más variedades disponibles:</strong> Consultanos por WhatsApp para ver el catálogo completo — según la temporada tenemos bardana, romero, cola de caballo, hipérico y más.
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
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">¿Cómo conseguirlos?</p>
            <h2 className="font-display text-4xl text-bone-50 mb-5 leading-tight">
              Pedí tu pack<br /><em>directamente.</em>
            </h2>
            <p className="font-sans text-sm text-bone-200 leading-relaxed mb-6">
              Por ahora vendemos de forma directa — sin intermediarios. Escribinos por WhatsApp con lo que necesitás, te decimos disponibilidad y coordinamos el envío o retiro en Tay Pichín.
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
