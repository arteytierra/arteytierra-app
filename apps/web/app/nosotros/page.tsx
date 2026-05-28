import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Nosotros — Arte y Tierra',
  description: 'Arte y Tierra es un colectivo de bioarquitectos, hidrólogos y diseñadores ecosistémicos. +40 obras en 7 países y 15 años de trabajo con la tierra.',
  alternates: { canonical: '/nosotros' },
};

const VALORES = [
  { titulo: 'Escucha del territorio', desc: 'Cada decisión nace del lugar — su agua, su suelo, su luz, su gente.' },
  { titulo: 'Reciprocidad', desc: 'Lo que tomamos del territorio, lo devolvemos en cuidado y regeneración.' },
  { titulo: 'Aprendizaje vivencial', desc: 'Se aprende haciendo, en minga, con el cuerpo y con otros.' },
  { titulo: 'Autonomía', desc: 'Sembramos saberes que las comunidades puedan replicar y multiplicar.' },
];

const EQUIPO: { name: string; role: string; bio: string; img: string | null }[] = [
  {
    name: 'Jonatan Palma',
    role: 'Director · Diseñador · Facilitador',
    bio: 'Bioconstructor y bioarquitecto desde 2010, especializado en construcción en tierra, bioclimática y radiestesia. Formado junto a Jorge Belanko, Gernot Minke, Marco Arestra y Daniel Smite. Fundador de Arte y Tierra y de la Ecoescuela Tay Pichín.',
    img: '/img/cursos/vueltatierra/10.jpg',
  },
  {
    name: 'Fabricio Manzoni',
    role: 'Permacultura · Diseño Hidrológico',
    bio: 'Cofundador de Minga Verde, facilitador certificado por la Eco-escuela El Manzano (Universidad Gaia, Chile). Se dedica al diseño y consultoría en salud y regeneración de sistemas ecológicos en distintos países.',
    img: '/img/cursos/vueltatierra/8.jpg',
  },
  {
    name: 'Julián Denaday',
    role: 'Conducción de obra · Facilitador',
    bio: 'Constructor de oficio, oriundo de Los Toldos (Buenos Aires). Integra técnica y experiencia práctica en procesos constructivos, compartiendo el hacer desde una mirada consciente y en vínculo con la vida cotidiana.',
    img: 'https://drive.google.com/thumbnail?id=1ixPqThmDFMhODU8ozTbLeiRylLMGa_rz&sz=w800',
  },
  {
    name: 'Ignacio Gómez Serjal',
    role: 'Director de voluntariado · Tay Pichín',
    bio: 'Permacultor y agricultor nacido en San Nicolás. Su camino se forjó en contacto directo con la tierra, especializándose en el trabajo de huerta y sistemas productivos a escala humana, acompañando procesos de aprendizaje desde la práctica.',
    img: 'https://drive.google.com/thumbnail?id=1BgRX6c2SWhRL25wVk78URypKKVA74sj3&sz=w800',
  },
  {
    name: 'Karen Ybarra',
    role: 'Equipo de Ecohostel · Tay Pichín',
    bio: 'Nacida en Tres de Febrero (Buenos Aires), su interés por la permacultura la llevó a investigar sistemas constructivos convencionales y tradicionales. Aporta una mirada sensible en la gestión del espacio y la experiencia de quienes habitan el lugar.',
    img: 'https://drive.google.com/thumbnail?id=17CGD5Mf4J8zKKAWYWtxNoFldhhTgTufD&sz=w800',
  },
];

const PAISES = [
  { bandera: '🇦🇷', nombre: 'Argentina' },
  { bandera: '🇨🇴', nombre: 'Colombia' },
  { bandera: '🇵🇪', nombre: 'Perú' },
  { bandera: '🇧🇴', nombre: 'Bolivia' },
  { bandera: '🇮🇹', nombre: 'Italia' },
  { bandera: '🇫🇷', nombre: 'Francia' },
  { bandera: '🇪🇨', nombre: 'Ecuador' },
];

export default function NosotrosPage() {
  return (
    <main>
      {/* HERO */}
      <section className="relative h-[70vh] min-h-[500px] bg-ink-950 flex items-end overflow-hidden">
        <Image
          src="/img/taypichin/carousel/5.jpg"
          alt="Arte y Tierra — equipo en obra"
          fill
          priority
          className="object-cover object-top"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/40 to-transparent" />
        <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-16">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">
            Nosotros · +40 obras · 7 países · 15 años
          </p>
          <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-3xl">
            Equipo que diseña<br /><em>territorios vivos.</em>
          </h1>
          <p className="mt-5 font-sans text-base text-bone-200 max-w-2xl leading-relaxed">
            Somos un colectivo de bioarquitectos, hidrólogos y diseñadores ecosistémicos. Trabajamos en Argentina, Colombia y toda Latinoamérica con la rigurosidad de un estudio profesional y la convicción de quien entiende la tierra como un sistema vivo.
          </p>
        </div>
      </section>

      {/* MANIFIESTO */}
      <section className="bg-bone-50 py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-5">Quiénes somos</p>
          <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-10 leading-tight">
            Una pregunta<br />nos puso en <em>movimiento.</em>
          </h2>
          <p className="font-display text-xl text-clay-700 italic mb-8">
            ¿Cómo se habita un territorio sin destruirlo?
          </p>
          <div className="flex flex-col gap-5">
            <p className="font-sans text-base text-ink-700 leading-relaxed">
              Somos un colectivo que impulsa la regeneración del ser, la comunidad y los ecosistemas — facilitando procesos que integran el diseño ecológico, el autoconocimiento y la acción colaborativa.
            </p>
            <p className="font-sans text-base text-ink-700 leading-relaxed">
              Diseñamos viviendas, ecohospedajes, espacios productivos, sistemas hidrológicos, agroecosistemas, centros comunitarios y lugares de retiro — aplicando bioarquitectura, diseño hidrológico, agroecología, geometría áurea y radiestesia, en armonía con la vida.
            </p>
            <p className="font-sans text-base text-ink-700 leading-relaxed">
              Más que construir estructuras, acompañamos procesos de transformación personal y colectiva — dejando semillas de aprendizaje, autonomía y abundancia allí donde sembramos.
            </p>
          </div>
        </div>
      </section>

      {/* VALORES */}
      <section className="bg-ink-950 py-20 px-6">
        <div className="max-w-editorial mx-auto">
          <div className="mb-12">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">Lo que nos guía</p>
            <h2 className="font-display text-4xl md:text-5xl text-bone-50 leading-tight">
              Sumaq Kawsay —<br />el <em>Buen Vivir.</em>
            </h2>
            <p className="mt-5 font-sans text-base text-bone-200 max-w-2xl leading-relaxed">
              Trabajamos desde un paradigma andino que entiende el bienestar como equilibrio entre lo material y lo espiritual, lo individual y lo colectivo, lo humano y la tierra.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {VALORES.map(v => (
              <div key={v.titulo} className="border-t-2 border-clay-700 pt-5">
                <h4 className="font-sans font-bold text-sm text-bone-100 mb-3">{v.titulo}</h4>
                <p className="font-sans text-sm text-bone-200 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EQUIPO */}
      <section className="bg-bone-100 py-20 px-6">
        <div className="max-w-editorial mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">El equipo</p>
            <h2 className="font-display text-4xl md:text-5xl text-ink-950">
              Quienes <em>habitan</em> Arte y Tierra.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {EQUIPO.map(p => (
              <div key={p.name} className="flex flex-col bg-bone-50 overflow-hidden">
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-clay-700/20 flex-shrink-0">
                  {p.img ? (
                    p.img.startsWith('https://drive.google.com') ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <Image src={p.img} alt={p.name} fill className="object-cover object-top" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                    )
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-display text-6xl text-clay-700/30">{p.name[0]}</span>
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col justify-center gap-2">
                  <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700">{p.role}</p>
                  <h3 className="font-display text-xl text-ink-950">{p.name}</h3>
                  <p className="font-sans text-sm text-ink-700 leading-relaxed">{p.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PAÍSES */}
      <section className="bg-clay-700 py-20 px-6">
        <div className="max-w-editorial mx-auto">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">Itinerantes en el mundo</p>
          <h2 className="font-display text-4xl md:text-5xl text-bone-50 mb-10 leading-tight">
            Hemos trabajado en<br />siete <em>países.</em>
          </h2>
          <div className="flex flex-wrap gap-3 mb-10">
            {PAISES.map(p => (
              <div key={p.nombre} className="flex items-center gap-2 bg-bone-50/10 px-4 py-2.5 font-sans font-bold text-sm text-bone-100">
                <span className="text-lg">{p.bandera}</span>
                {p.nombre}
              </div>
            ))}
          </div>
          <p className="font-sans text-sm text-bone-200 leading-relaxed max-w-xl">
            Operamos de manera itinerante desde Tay Pichín, nuestra sede en las Sierras de Córdoba. Llevamos esta práctica a familias, comunidades y territorios donde nos invitan a sembrar.
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-bone-50 py-16 px-6 border-b border-bone-200">
        <div className="max-w-editorial mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { num: '+40', label: 'Obras realizadas' },
            { num: '15', label: 'Años de trayectoria' },
            { num: '7', label: 'Países' },
            { num: '+500', label: 'Personas formadas' },
          ].map(s => (
            <div key={s.label}>
              <p className="font-display text-5xl text-clay-700 mb-2">{s.num}</p>
              <p className="font-sans text-sm text-ink-700 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink-950 py-20 px-6 text-center">
        <h2 className="font-display text-4xl md:text-5xl text-bone-50 mb-5">
          ¿Sembramos<br /><em>juntos?</em>
        </h2>
        <p className="font-sans text-base text-bone-200 max-w-md mx-auto mb-8 leading-relaxed">
          Contanos sobre tu terreno, tu idea, tu sueño. Trabajamos en cualquier parte del mundo.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/contacto" className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors">
            Escribinos →
          </Link>
          <Link href="/diseno" className="inline-flex border border-bone-200/50 text-bone-200 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:border-bone-50 hover:text-bone-50 transition-colors">
            Ver servicios →
          </Link>
        </div>
      </section>
    </main>
  );
}
