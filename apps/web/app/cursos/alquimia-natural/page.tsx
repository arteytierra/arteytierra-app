import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Alquimia Natural y Limpieza Consciente',
  description: 'Ciclo de 8 encuentros presenciales en Tay Pichín. Jabonería, cosmética natural y limpieza ecológica del hogar. Recuperá la soberanía sobre lo que entra a tu cuerpo y tu casa.',
  alternates: { canonical: '/cursos/alquimia-natural' },
};

const MODULOS = [
  {
    num: 'Módulo 1',
    titulo: 'El Hogar Sano',
    desc: 'Limpieza natural del espacio que habitamos — como extensión de nuestro propio cuerpo.',
    encuentros: [
      {
        n: '1', nombre: 'Jabonería de Rescate',
        desc: 'La base técnica de la limpieza natural. Damos segunda vida al aceite de cocina usado.',
        temas: ['Impacto ambiental de detergentes industriales', 'Teoría de la saponificación en frío', 'Jabón de alta eficacia y bajo impacto', 'Envasado, cortado y curado'],
      },
      {
        n: '2', nombre: 'La Fuerza de los Cítricos',
        desc: 'Cómo la química de los frutos cítricos reemplaza desengrasantes químicos agresivos.',
        temas: ['Vinagres cítricos potenciados', 'Polvos limpiadores con cáscaras y minerales', 'Alcoholes macerados para limpieza', 'Detergente sólido y líquido natural'],
      },
      {
        n: '3', nombre: 'El Botiquín de Limpieza Natural',
        desc: 'De la góndola del super a crear nuestra propia despensa de soluciones.',
        temas: ['Disruptores hormonales: ftalatos, sulfatos, parabenos', 'Desmitificación de la limpieza', 'Maceraciones en alcohol, vinagre y agua', 'Limpiador en crema, limpiavidrios, desengrasante'],
      },
      {
        n: '4', nombre: 'Alquimia Sólida',
        desc: 'La transición hacia el residuo cero en la limpieza del hogar.',
        temas: ['Efervescentes para desinfectar y desodorizar', 'Cómo reemplazar la lavandina', 'Aromatizantes sin fragancias sintéticas', 'Reemplazo de plásticos y utensilios de petróleo'],
      },
    ],
  },
  {
    num: 'Módulo 2',
    titulo: 'Mi Cuerpo, Mi Templo, Mi Territorio',
    desc: 'La piel como frontera y puente: nutrición cutánea, microbiota y soberanía personal.',
    encuentros: [
      {
        n: '5', nombre: 'Alquimia Capilar',
        desc: '¿Qué nos venden realmente en el shampoo comercial? Hacemos el propio.',
        temas: ['El mito de la espuma y los tensioactivos', 'Plantas aliadas según tipo de cabello', 'pH y cuero cabelludo', 'Shampoo líquido herbal adaptable'],
      },
      {
        n: '6', nombre: 'Transpirar sin Oler',
        desc: 'Por qué bloquear las glándulas sudoríparas es peligroso. Tres formatos naturales.',
        temas: ['Salud de transpirar', 'Equilibrio bacteriano en axila', 'Desodorante en barra sólida', 'Bálsamo en crema · Spray refrescante botánico'],
      },
      {
        n: '7', nombre: 'Sana Sonrisa',
        desc: 'La boca como puerta crucial en la digestión y la salud general.',
        temas: ['Impacto de la pasta dental industrial', 'Flúor, microplásticos y tóxicos comunes', 'Sales remineralizantes y extractos botánicos', 'Dos recetas base de dentífrico natural'],
      },
      {
        n: '8', nombre: 'Jabón de Cuidado Corporal',
        desc: 'Saponificación en frío con grasas, mantecas y aceites vegetales de calidad.',
        temas: ['Diferencia con el jabón industrial de tocador', 'Técnica de saponificación en frío profunda', 'Jabón de grasa de pastoreo ancestral', 'Nutrición profunda de la piel'],
      },
    ],
  },
];

const FECHAS = [
  { num: '1', fecha: '30 Mayo',   dia: 'Sábado', modulo: 'M1 · E1' },
  { num: '2', fecha: '20 Jun.',   dia: 'Sábado', modulo: 'M1 · E2' },
  { num: '3', fecha: '18 Jul.',   dia: 'Sábado', modulo: 'M1 · E3' },
  { num: '4', fecha: '15 Ago.',   dia: 'Sábado', modulo: 'M1 · E4' },
  { num: '5', fecha: '19 Sep.',   dia: 'Sábado', modulo: 'M2 · E5' },
  { num: '6', fecha: '7 Oct.',    dia: 'Sábado', modulo: 'M2 · E6' },
  { num: '7', fecha: '21 Nov.',   dia: 'Sábado', modulo: 'M2 · E7' },
  { num: '8', fecha: '19 Dic.',   dia: 'Sábado', modulo: 'M2 · E8' },
];

export default function AlquimiaNaturalPage() {
  return (
    <>
      <SiteHeader />
      <main>

      {/* HERO */}
      <section className="relative h-[65vh] min-h-[500px] bg-ink-950 flex items-end overflow-hidden">
        <Image
          src="/img/biocosmetica/productos-todos.jpg"
          alt="Alquimia Natural y Limpieza Consciente — Tay Pichín"
          fill priority className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/50 to-transparent" />
        <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-16">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-3">
            Ciclo mensual · Presencial · Mayo–Dic 2026
          </p>
          <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-3xl">
            Alquimia Natural<br /><em>y Limpieza Consciente.</em>
          </h1>
          <p className="mt-5 font-sans text-bone-200 text-lg max-w-2xl leading-relaxed">
            Una invitación a recuperar la soberanía sobre lo que ingresa a nuestro hogar y lo que aplicamos sobre nuestra piel.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="https://wa.me/5493413751171?text=Hola%2C%20quiero%20info%20del%20ciclo%20de%20Alquimia%20Natural"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-7 py-4 hover:bg-clay-900 transition-colors">
              Inscribirme →
            </a>
            <a href="/docs/alquimia-natural-programa.pdf" target="_blank" rel="noopener noreferrer"
              className="inline-flex border border-bone-50/50 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-7 py-4 hover:border-bone-50 transition-colors">
              Descargar programa PDF
            </a>
          </div>
        </div>
      </section>

      {/* INFO BAR */}
      <section className="bg-clay-700 py-6 px-6">
        <div className="max-w-editorial mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { label: 'Inicio', val: '30 de mayo 2026' },
            { label: 'Frecuencia', val: '3er sábado de cada mes' },
            { label: 'Duración', val: '2 hs – 2 hs 30 min por sesión' },
            { label: 'Lugar', val: 'Tay Pichín · San Marcos Sierras' },
          ].map(i => (
            <div key={i.label}>
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-200 mb-1">{i.label}</p>
              <p className="font-sans text-sm font-semibold text-bone-50">{i.val}</p>
            </div>
          ))}
        </div>
      </section>

      {/* INTRO */}
      <section className="bg-bone-50 py-20 px-6">
        <div className="max-w-editorial mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">El espacio</p>
            <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-8 leading-tight">
              Transformar ingredientes<br /><em>simples en alquimia.</em>
            </h2>
            <div className="flex flex-col gap-4 mb-8">
              <p className="font-sans text-base text-ink-700 leading-relaxed">
                Entendemos el cuidado del cuerpo y del territorio como un mismo acto de amor y respeto. A través de la alquimia natural, transformaremos ingredientes simples y nobles en soluciones más sustentables, saludables y súper efectivas.
              </p>
              <p className="font-sans text-base text-ink-700 leading-relaxed">
                El taller se desarrolla en la <strong>Ecoescuela Tay Pichín</strong> con una estructura flexible: podés hacer el ciclo completo (8 encuentros) o sumarte a los módulos que más resuenen con tu búsqueda.
              </p>
            </div>
            <p className="font-sans text-sm font-bold text-ink-950 mb-3">Esta formación es para vos si:</p>
            <div className="flex flex-col gap-2">
              {[
                'Practicás la permacultura o transitás el buen vivir',
                'Querés mejorar tu salud reduciendo la carga tóxica',
                'Deseás elaborar tus propios productos del hogar',
                'Querés iniciar un emprendimiento sustentable',
                'Sentís el llamado de conectar con la naturaleza',
              ].map(item => (
                <div key={item} className="flex gap-3 items-start">
                  <div className="mt-1.5 w-2 h-2 bg-clay-700 flex-shrink-0" />
                  <p className="font-sans text-sm text-ink-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="relative aspect-square overflow-hidden bg-bone-100">
              <Image src="/img/cursos/alquimia-natural/flyer.jpg" alt="Formación Alquimia Natural y Limpieza Consciente" fill className="object-contain" sizes="(max-width: 1024px) 100vw, 50vw" />
            </div>
            <div className="relative aspect-[3/2] overflow-hidden bg-bone-100">
              <Image src="/img/cursos/alquimia-natural/modalidad.png" alt="Modalidad de participación" fill className="object-contain" sizes="(max-width: 1024px) 100vw, 50vw" />
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAMA */}
      <section className="bg-ink-950 py-20 px-6">
        <div className="max-w-editorial mx-auto">
          <div className="mb-14 text-center">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">Programa 2026</p>
            <h2 className="font-display text-4xl md:text-5xl text-bone-50">
              8 encuentros,<br /><em>2 mundos.</em>
            </h2>
            <p className="mt-4 font-sans text-bone-100 text-base max-w-xl mx-auto">
              Cuatro encuentros para el hogar, cuatro para el cuerpo. Cada uno, una práctica completa que te podés llevar.
            </p>
          </div>
          <div className="flex flex-col gap-16">
            {MODULOS.map(mod => (
              <div key={mod.num}>
                <div className="mb-8 pb-4 border-b border-ink-700">
                  <span className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300">{mod.num}</span>
                  <h3 className="font-display text-3xl text-bone-50 mt-1">{mod.titulo}</h3>
                  <p className="font-sans text-sm text-bone-100 mt-2">{mod.desc}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {mod.encuentros.map(enc => (
                    <div key={enc.n} className="bg-ink-800 border border-ink-700 p-7">
                      <div className="flex items-start gap-4 mb-4">
                        <span className="font-display text-3xl text-clay-300 leading-none flex-shrink-0">{enc.n}</span>
                        <div>
                          <h4 className="font-display text-xl text-bone-50">{enc.nombre}</h4>
                          <p className="font-sans text-sm text-bone-100 mt-1 leading-snug">{enc.desc}</p>
                        </div>
                      </div>
                      <ul className="flex flex-col gap-1.5">
                        {enc.temas.map(t => (
                          <li key={t} className="flex gap-2 items-start">
                            <span className="text-clay-300 mt-0.5 flex-shrink-0">·</span>
                            <span className="font-sans text-xs text-bone-100 leading-snug">{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FECHAS */}
      <section className="bg-bone-100 py-20 px-6">
        <div className="max-w-editorial mx-auto">
          <div className="mb-12">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-3">Calendario 2026</p>
            <h2 className="font-display text-4xl text-ink-950">
              Las 8 fechas<br /><em>del ciclo.</em>
            </h2>
            <p className="mt-3 font-sans text-ink-700 text-sm">3er sábado de cada mes · 10:00 a 12:30 hs · Tay Pichín</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {FECHAS.map(f => (
              <div key={f.num} className="flex flex-col bg-bone-50 border border-bone-200 p-4 text-center">
                <span className="font-display text-3xl text-clay-700 mb-1">{f.num}</span>
                <p className="font-sans font-bold text-sm text-ink-950 mb-0.5">{f.fecha}</p>
                <p className="font-sans text-[10px] text-ink-700 uppercase tracking-wide">{f.dia}</p>
                <p className="font-sans text-[10px] text-clay-700 mt-auto pt-2 leading-tight">{f.modulo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALERÍA DE PRODUCTOS */}
      <section className="bg-bone-50 py-16 px-6">
        <div className="max-w-editorial mx-auto">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-6 text-center">
            Los productos que vas a hacer
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { src: '/img/biocosmetica/productos-1.jpg', alt: 'Productos de cosmética natural' },
              { src: '/img/biocosmetica/productos-2.jpg', alt: 'Cosmética artesanal' },
              { src: '/img/biocosmetica/repelente-foto.jpg', alt: 'Repelente natural' },
              { src: '/img/biocosmetica/tintura-cannabis.jpg', alt: 'Tintura de cannabis' },
              { src: '/img/biocosmetica/unguento-relajante-menta.jpg', alt: 'Ungüento relajante de menta' },
              { src: '/img/biocosmetica/tintura-calendula.jpg', alt: 'Tintura de caléndula' },
              { src: '/img/biocosmetica/tinturas-todas.jpg', alt: 'Tinturas madre' },
              { src: '/img/biocosmetica/productos-todos.jpg', alt: 'Todos los productos' },
            ].map(img => (
              <div key={img.src} className="relative aspect-square overflow-hidden">
                <Image src={img.src} alt={img.alt} fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 25vw" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRECIO Y MODALIDAD */}
      <section className="bg-clay-700 py-20 px-6">
        <div className="max-w-editorial mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-200 mb-4">Modalidad</p>
            <h2 className="font-display text-4xl text-bone-50 mb-6">A tu <em>ritmo.</em></h2>
            <div className="flex flex-col gap-4">
              <div className="bg-clay-900/50 border border-clay-500 p-6">
                <h3 className="font-sans font-bold text-bone-50 mb-2">Ciclo completo</h3>
                <p className="font-sans text-sm text-bone-200 leading-relaxed">
                  8 encuentros · Mayo a Diciembre 2026. Formación integral y profunda. Comunidad y continuidad.
                </p>
              </div>
              <div className="bg-clay-900/50 border border-clay-500 p-6">
                <h3 className="font-sans font-bold text-bone-50 mb-2">Encuentros independientes</h3>
                <p className="font-sans text-sm text-bone-200 leading-relaxed">
                  Sumarte únicamente a los módulos que más resuenen. Sin obligación de continuidad.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-6">
            <div>
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-200 mb-4">Precio</p>
              <div className="flex flex-col gap-3 mb-2">
                <div className="bg-clay-900/50 border border-clay-500 px-5 py-4">
                  <p className="font-sans text-xs font-bold uppercase tracking-widest text-clay-200 mb-1">Ciclo completo · 8 encuentros</p>
                  <p className="font-display text-3xl text-bone-50">$200.000</p>
                </div>
                <div className="bg-clay-900/50 border border-clay-500 px-5 py-4">
                  <p className="font-sans text-xs font-bold uppercase tracking-widest text-clay-200 mb-1">Módulo · 4 encuentros</p>
                  <p className="font-display text-3xl text-bone-50">$110.000</p>
                </div>
                <div className="bg-clay-900/50 border border-clay-500 px-5 py-4">
                  <p className="font-sans text-xs font-bold uppercase tracking-widest text-clay-200 mb-1">Encuentro suelto</p>
                  <p className="font-display text-3xl text-bone-50">$30.000 <span className="text-sm font-sans font-normal text-clay-200">(sujeto a modificación)</span></p>
                </div>
              </div>
            </div>

            {/* PAGO */}
            <div className="bg-clay-900/50 border border-clay-500 px-5 py-5">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-200 mb-3">Datos bancarios</p>
              <div className="flex flex-col gap-1.5 font-sans text-sm text-bone-50">
                <p><span className="text-clay-200">Titular:</span> Bianca Sartori</p>
                <p><span className="text-clay-200">CUIT/CUIL:</span> 27-36659182-1</p>
                <p><span className="text-clay-200">Alias:</span> magnolia.blanca</p>
                <p><span className="text-clay-200">CBU:</span> 1430001713023617110016</p>
                <p><span className="text-clay-200">Nro. cuenta:</span> 1302361711001</p>
              </div>
              <p className="font-sans text-xs text-clay-200 mt-3">Adjuntá el comprobante por WhatsApp al inscribirte.</p>
            </div>

            <a href="https://wa.me/5493413751171?text=Hola%2C%20quiero%20inscribirme%20al%20ciclo%20de%20Alquimia%20Natural%20y%20Limpieza%20Consciente"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex bg-bone-50 text-clay-900 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-bone-200 transition-colors w-fit">
              Inscribirme por WhatsApp →
            </a>
            <a href="/docs/alquimia-natural-programa.pdf" target="_blank" rel="noopener noreferrer"
              className="font-sans text-sm text-clay-200 underline underline-offset-4 hover:text-bone-50 transition-colors w-fit">
              ↓ Descargar programa completo en PDF
            </a>
          </div>
        </div>
      </section>

      {/* PRIMER ENCUENTRO */}
      <section className="bg-bone-50 py-20 px-6">
        <div className="max-w-editorial mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image src="/img/cursos/alquimia-natural/modulo-1.jpg" alt="Módulo 1 — Jabonería de Rescate" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
          <div>
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-3">Primer encuentro · 30 de Mayo</p>
            <h2 className="font-display text-3xl md:text-4xl text-ink-950 mb-6">
              Jabonería de<br /><em>Rescate.</em>
            </h2>
            <p className="font-sans text-base text-ink-700 leading-relaxed mb-5">
              Aprenderemos la base técnica de la limpieza natural, dando una segunda vida a lo que solemos desechar. Haremos un jabón de alta eficacia y bajo impacto ambiental a partir del aceite de cocina usado.
            </p>
            <div className="flex flex-col gap-2 mb-8">
              {['10:00 a 12:30 hs · Eco Escuela Tay Pichín', 'Teoría de saponificación en frío', 'Práctica completa: nos llevamos nuestro jabón'].map(item => (
                <div key={item} className="flex gap-3 items-start">
                  <div className="mt-1.5 w-2 h-2 bg-clay-700 flex-shrink-0" />
                  <p className="font-sans text-sm text-ink-700">{item}</p>
                </div>
              ))}
            </div>
            <a href="https://wa.me/5493413751171?text=Hola%2C%20quiero%20inscribirme%20al%20primer%20encuentro%20de%20Alquimia%20Natural"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-7 py-4 hover:bg-clay-900 transition-colors">
              Inscribirme al 30 de mayo →
            </a>
          </div>
        </div>
      </section>

      {/* BREADCRUMB NAV */}
      <section className="bg-bone-100 py-10 px-6 border-t border-bone-200">
        <div className="max-w-editorial mx-auto flex flex-wrap gap-4 items-center justify-between">
          <Link href="/cursos" className="font-sans text-sm font-bold text-clay-700 uppercase tracking-widest hover:text-clay-900">
            ← Todos los cursos
          </Link>
          <Link href="/biocosmetica" className="font-sans text-sm font-bold text-clay-700 uppercase tracking-widest hover:text-clay-900">
            Ver productos de biocosmética →
          </Link>
        </div>
      </section>

    </main>
      <SiteFooter />
    </>
  );
}
